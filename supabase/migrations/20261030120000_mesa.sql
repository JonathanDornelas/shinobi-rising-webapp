-- L11 · Mesa tática: cenas da campanha, tokens no quadro (1 quadrado = 1 m), traços do lápis, efeitos de jutsu deixados
-- na cena, pastas de NPCs e a cor de cada membro. O Mestre monta e mexe em tudo; o jogador move os próprios tokens
-- (o personagem e o que ele criou: clones, invocações, o companheiro), desenha e deixa os próprios efeitos.

-- ---------------------------------------------------------------- cor do membro (lápis, anel do token, régua, avatar)
alter table public.membros add column cor text
	check (cor in ('vermelhao', 'anil', 'ameixa', 'sakura', 'siena', 'mostarda', 'musgo', 'petroleo', 'ardosia'));
create unique index membros_cor_unica on public.membros (campanha_id, cor) where cor is not null;

create function public.definir_cor(campanha uuid, cor text) returns void
language plpgsql security definer set search_path = '' as $$
begin
	if not public.eh_membro(campanha) then raise exception 'Campanha não encontrada.' using errcode = '42501'; end if;
	if exists (select 1 from public.membros m where m.campanha_id = campanha and m.cor = definir_cor.cor and m.usuario_id <> (select auth.uid())) then
		raise exception 'Essa cor já é de outra pessoa da campanha.' using errcode = 'P0001';
	end if;
	update public.membros set cor = definir_cor.cor where campanha_id = campanha and usuario_id = (select auth.uid());
end $$;

-- ---------------------------------------------------------------- pastas de NPCs (até 3 níveis)
create table public.npc_pastas (
	id uuid primary key default gen_random_uuid(),
	campanha_id uuid not null references public.campanhas (id) on delete cascade,
	pai_id uuid references public.npc_pastas (id) on delete cascade,
	nome text not null check (char_length(trim(nome)) between 1 and 60),
	ordem int not null default 0,
	criada_em timestamptz not null default now()
);
create index npc_pastas_campanha on public.npc_pastas (campanha_id);
alter table public.npc_pastas enable row level security;
create policy "npc_pastas: só o Mestre" on public.npc_pastas for all to authenticated
	using (public.eh_mestre(campanha_id)) with check (public.eh_mestre(campanha_id) and public.campanha_ativa(campanha_id));

alter table public.npcs add column pasta_id uuid references public.npc_pastas (id) on delete set null;
alter table public.personagens add column pasta_id uuid references public.npc_pastas (id) on delete set null;

-- a pasta de cima é da mesma campanha e a árvore não passa de 3 níveis
create function public.npc_pasta_antes() returns trigger
language plpgsql set search_path = '' as $$
declare
	nivel int := 1;
	atual uuid := new.pai_id;
	pai public.npc_pastas;
begin
	while atual is not null loop
		select * into pai from public.npc_pastas where id = atual;
		if pai.id is null or pai.campanha_id <> new.campanha_id then raise exception 'Pasta de cima inválida.' using errcode = 'P0001'; end if;
		if pai.id = new.id then raise exception 'Uma pasta não pode ficar dentro de si mesma.' using errcode = 'P0001'; end if;
		nivel := nivel + 1;
		atual := pai.pai_id;
	end loop;
	-- ao mover uma pasta, as subpastas dela descem junto
	if tg_op = 'UPDATE' then
		nivel := nivel + coalesce((with recursive d (id, n) as (
			select k.id, 1 from public.npc_pastas k where k.pai_id = new.id
			union all select k.id, d.n + 1 from public.npc_pastas k join d on k.pai_id = d.id where d.n < 5
		) select max(n) from d), 0);
	end if;
	if nivel > 3 then raise exception 'As pastas vão até 3 níveis.' using errcode = 'P0001'; end if;
	return new;
end $$;
create trigger npc_pasta_antes before insert or update on public.npc_pastas for each row execute function public.npc_pasta_antes();

-- excluir uma pasta não apaga NPCs: o conteúdo sobe para a pasta de cima
create function public.npc_pasta_ao_excluir() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
	update public.npc_pastas set pai_id = old.pai_id where pai_id = old.id;
	update public.npcs set pasta_id = old.pai_id where pasta_id = old.id;
	update public.personagens set pasta_id = old.pai_id where pasta_id = old.id;
	return old;
end $$;
create trigger npc_pasta_ao_excluir before delete on public.npc_pastas for each row execute function public.npc_pasta_ao_excluir();

-- NPC de ficha completa numa pasta (o Mestre não edita a ficha direto: a pasta passa por aqui)
create function public.pasta_da_ficha(ficha uuid, pasta uuid) returns void
language plpgsql security definer set search_path = '' as $$
declare
	p public.personagens;
begin
	select * into p from public.personagens where id = ficha;
	if p.id is null or not p.npc or not public.eh_mestre(p.campanha_id) then raise exception 'Ficha não encontrada.' using errcode = '42501'; end if;
	if pasta is not null and not exists (select 1 from public.npc_pastas k where k.id = pasta and k.campanha_id = p.campanha_id) then
		raise exception 'Pasta não encontrada.' using errcode = 'P0001';
	end if;
	update public.personagens set pasta_id = pasta where id = ficha;
end $$;

-- ---------------------------------------------------------------- cenas
create table public.mesa_cenas (
	id uuid primary key default gen_random_uuid(),
	campanha_id uuid not null references public.campanhas (id) on delete cascade,
	nome text not null check (char_length(trim(nome)) between 1 and 60),
	largura int not null default 40 check (largura between 5 and 200),
	altura int not null default 30 check (altura between 5 and 200),
	ativa boolean not null default false,
	travada boolean not null default false,
	mostrar_pv boolean not null default false,
	coordenadas boolean not null default false,
	-- { ativa, rodada, vez, ordem: [{ nome, valor, personagem_id | npc_id }] }: a mesma para todos
	iniciativa jsonb not null default '{}'::jsonb check (jsonb_typeof(iniciativa) = 'object' and pg_column_size(iniciativa) <= 8000),
	criada_em timestamptz not null default now()
);
create index mesa_cenas_campanha on public.mesa_cenas (campanha_id, criada_em);
create unique index mesa_cenas_uma_ativa on public.mesa_cenas (campanha_id) where ativa;

-- o grupo vê a cena ativa; o Mestre vê todas
create function public.mesa_cena_visivel(cena uuid) returns boolean
language sql stable security definer set search_path = '' as $$
	select exists (select 1 from public.mesa_cenas c where c.id = cena and (public.eh_mestre(c.campanha_id) or (c.ativa and public.eh_membro(c.campanha_id))));
$$;
-- e mexe nela se ela está ativa, destravada e a campanha não está arquivada
create function public.mesa_cena_aberta(cena uuid) returns boolean
language sql stable security definer set search_path = '' as $$
	select exists (select 1 from public.mesa_cenas c where c.id = cena and public.campanha_ativa(c.campanha_id)
		and (public.eh_mestre(c.campanha_id) or (c.ativa and not c.travada and public.eh_membro(c.campanha_id))));
$$;

alter table public.mesa_cenas enable row level security;
create policy "mesa_cenas: Mestre vê todas, grupo vê a ativa" on public.mesa_cenas for select to authenticated
	using (public.eh_mestre(campanha_id) or (ativa and public.eh_membro(campanha_id)));
create policy "mesa_cenas: Mestre cria" on public.mesa_cenas for insert to authenticated
	with check (public.eh_mestre(campanha_id) and public.campanha_ativa(campanha_id));
create policy "mesa_cenas: Mestre edita" on public.mesa_cenas for update to authenticated
	using (public.eh_mestre(campanha_id)) with check (public.eh_mestre(campanha_id) and public.campanha_ativa(campanha_id));
create policy "mesa_cenas: Mestre exclui" on public.mesa_cenas for delete to authenticated using (public.eh_mestre(campanha_id));

-- ativar uma cena desativa as outras da campanha (numa transação, sem violar o índice de uma ativa)
create function public.ativar_cena(cena uuid) returns void
language plpgsql security definer set search_path = '' as $$
declare
	c public.mesa_cenas;
begin
	select * into c from public.mesa_cenas where id = cena;
	if c.id is null or not public.eh_mestre(c.campanha_id) then raise exception 'Cena não encontrada.' using errcode = '42501'; end if;
	if not public.campanha_ativa(c.campanha_id) then raise exception 'Campanha arquivada é somente leitura.' using errcode = 'P0001'; end if;
	update public.mesa_cenas set ativa = false where campanha_id = c.campanha_id and ativa and id <> cena;
	update public.mesa_cenas set ativa = true where id = cena;
end $$;

-- ---------------------------------------------------------------- tokens
-- faixa de ferimento, para quem não vê os números: 0 ileso, 1 ferido, 2 muito ferido (metade ou menos), 3 caído
create function public.faixa_ferimento(pv int, maximo int) returns smallint
language sql immutable set search_path = '' as $$
	select case when maximo is null or maximo <= 0 or pv is null then 0
		when pv <= 0 then 3 when pv * 2 <= maximo then 2 when pv < maximo then 1 else 0 end::smallint;
$$;

create table public.mesa_tokens (
	id uuid primary key default gen_random_uuid(),
	cena_id uuid not null references public.mesa_cenas (id) on delete cascade,
	campanha_id uuid not null references public.campanhas (id) on delete cascade,
	personagem_id uuid references public.personagens (id) on delete cascade,
	npc_id uuid references public.npcs (id) on delete cascade,
	-- membro de uma tropa genérica (1 a 20)
	membro int check (membro between 1 and 20),
	-- clone, invocação ou companheiro: pertence ao token de quem o criou
	ligado_a uuid references public.mesa_tokens (id) on delete cascade,
	-- quem pode mover (o jogador); null = só o Mestre
	dono_id uuid references public.perfis (id) on delete set null,
	nome text not null check (char_length(trim(nome)) between 1 and 60),
	sigla text not null default '' check (char_length(sigla) <= 3),
	retrato text check (char_length(retrato) <= 300),
	tamanho int not null default 1 check (tamanho in (1, 3, 6, 10)),
	x int not null default 0 check (x between 0 and 199),
	y int not null default 0 check (y between 0 and 199),
	visivel boolean not null default true,
	-- NPC do lado do grupo (não provoca golpe de oportunidade nos personagens)
	aliado boolean not null default false,
	condicoes text[] not null default '{}' check (cardinality(condicoes) <= 12),
	ferimento smallint not null default 0 check (ferimento between 0 and 3),
	-- números de tokens sem ficha (clones, invocações); PC e NPC guardam os seus na ficha
	pv int check (pv between -9999 and 9999),
	pv_max int check (pv_max between 1 and 9999),
	-- metros andados no turno (zera quando a vez dele começa)
	movido int not null default 0 check (movido between 0 and 9999),
	criado_em timestamptz not null default now(),
	atualizado_em timestamptz not null default now()
);
create index mesa_tokens_cena on public.mesa_tokens (cena_id);
create index mesa_tokens_personagem on public.mesa_tokens (personagem_id) where personagem_id is not null;
create index mesa_tokens_npc on public.mesa_tokens (npc_id) where npc_id is not null;

-- o token é de quem está chamando (fora da política, para ela não consultar a própria tabela)
create function public.mesa_token_do_usuario(token uuid) returns boolean
language sql stable security definer set search_path = '' as $$
	select exists (select 1 from public.mesa_tokens t where t.id = token and t.dono_id = (select auth.uid()));
$$;

alter table public.mesa_tokens enable row level security;
create policy "mesa_tokens: Mestre vê todos, grupo vê os visíveis da cena ativa" on public.mesa_tokens for select to authenticated
	using (public.eh_mestre(campanha_id) or ((visivel or dono_id = (select auth.uid())) and public.mesa_cena_visivel(cena_id)));
create policy "mesa_tokens: Mestre põe qualquer um, jogador põe os seus" on public.mesa_tokens for insert to authenticated
	with check (public.mesa_cena_aberta(cena_id) and (public.eh_mestre(campanha_id) or (
		dono_id = (select auth.uid()) and npc_id is null and visivel and (
			(personagem_id is not null and ligado_a is null and exists (select 1 from public.personagens p
				where p.id = personagem_id and p.jogador_id = (select auth.uid()) and p.status = 'aprovada' and not p.npc))
			or (personagem_id is null and ligado_a is not null and public.mesa_token_do_usuario(ligado_a))
		))));
create policy "mesa_tokens: Mestre e dono editam" on public.mesa_tokens for update to authenticated
	using (public.eh_mestre(campanha_id) or dono_id = (select auth.uid()))
	with check (public.eh_mestre(campanha_id) or dono_id = (select auth.uid()));
create policy "mesa_tokens: Mestre tira qualquer um, dono tira clones e invocações" on public.mesa_tokens for delete to authenticated
	using (public.eh_mestre(campanha_id) or (dono_id = (select auth.uid()) and ligado_a is not null and public.mesa_cena_aberta(cena_id)));

-- a campanha vem da cena; o jogador só muda posição, metros do turno, estados e PV dos próprios tokens
create function public.mesa_token_antes() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
	if tg_op = 'INSERT' then
		select c.campanha_id into new.campanha_id from public.mesa_cenas c where c.id = new.cena_id;
		if new.npc_id is not null and not exists (select 1 from public.npcs n where n.id = new.npc_id and n.campanha_id = new.campanha_id) then
			raise exception 'NPC não encontrado.' using errcode = 'P0001';
		end if;
		if new.personagem_id is not null and not exists (select 1 from public.personagens p where p.id = new.personagem_id and p.campanha_id = new.campanha_id) then
			raise exception 'Personagem não encontrado.' using errcode = 'P0001';
		end if;
		if new.x >= (select c.largura from public.mesa_cenas c where c.id = new.cena_id) or new.y >= (select c.altura from public.mesa_cenas c where c.id = new.cena_id) then
			raise exception 'Fora da cena.' using errcode = 'P0001';
		end if;
		return new;
	end if;
	new.atualizado_em := now();
	-- a proteção vale para quem edita o token direto; as cópias da ficha e do NPC chegam por outro gatilho
	if not public.eh_mestre(old.campanha_id) and pg_trigger_depth() < 2 then
		if not public.mesa_cena_aberta(old.cena_id) then raise exception 'Mesa travada pelo Mestre.' using errcode = 'P0001'; end if;
		new.id := old.id; new.cena_id := old.cena_id; new.campanha_id := old.campanha_id; new.personagem_id := old.personagem_id;
		new.npc_id := old.npc_id; new.membro := old.membro; new.ligado_a := old.ligado_a; new.dono_id := old.dono_id;
		new.tamanho := old.tamanho; new.visivel := old.visivel; new.aliado := old.aliado; new.criado_em := old.criado_em;
		if old.personagem_id is not null then new.pv := old.pv; new.pv_max := old.pv_max; new.ferimento := old.ferimento; new.condicoes := old.condicoes; end if;
	end if;
	if new.x >= (select c.largura from public.mesa_cenas c where c.id = new.cena_id) or new.y >= (select c.altura from public.mesa_cenas c where c.id = new.cena_id) then
		raise exception 'Fora da cena.' using errcode = 'P0001';
	end if;
	if new.personagem_id is null and new.npc_id is null and new.pv is not null then
		new.ferimento := public.faixa_ferimento(new.pv, new.pv_max);
	end if;
	return new;
end $$;
create trigger mesa_token_antes before insert or update on public.mesa_tokens for each row execute function public.mesa_token_antes();

-- o estado da ficha (PV e estados) aparece no token do personagem, para todos
create function public.mesa_token_da_ficha() returns trigger
language plpgsql security definer set search_path = '' as $$
declare
	maximo int := nullif(new.resumo ->> 'pv', '')::int;
begin
	update public.mesa_tokens set
		ferimento = public.faixa_ferimento(coalesce(nullif(new.estado ->> 'pv', '')::int, maximo), maximo),
		condicoes = coalesce((select array_agg(c) from jsonb_array_elements_text(case when jsonb_typeof(new.estado -> 'condicoes') = 'array' then new.estado -> 'condicoes' else '[]'::jsonb end) c), '{}')
	where personagem_id = new.id;
	return new;
end $$;
create trigger mesa_token_da_ficha after update of estado, resumo on public.personagens for each row execute function public.mesa_token_da_ficha();

-- o PV atual do NPC (e de cada membro da tropa) aparece no token como faixa
create function public.mesa_token_do_npc() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
	update public.mesa_tokens t set ferimento = public.faixa_ferimento(coalesce(new.pv_atual[coalesce(t.membro, 1)], new.pv), new.pv)
	where t.npc_id = new.id;
	return new;
end $$;
create trigger mesa_token_do_npc after update of pv, pv_atual on public.npcs for each row execute function public.mesa_token_do_npc();

-- números de PV da cena para quem não é o Mestre, só quando ele liga "Mostrar PV ao grupo"
create function public.pv_da_cena(cena uuid)
returns table (token_id uuid, pv int, pv_max int)
language sql stable security definer set search_path = '' as $$
	select t.id,
		case when t.personagem_id is not null then coalesce(nullif(p.estado ->> 'pv', '')::int, nullif(p.resumo ->> 'pv', '')::int)
			when t.npc_id is not null then coalesce(n.pv_atual[coalesce(t.membro, 1)], n.pv) else t.pv end,
		case when t.personagem_id is not null then nullif(p.resumo ->> 'pv', '')::int when t.npc_id is not null then n.pv else t.pv_max end
	from public.mesa_tokens t
	join public.mesa_cenas c on c.id = t.cena_id
	left join public.personagens p on p.id = t.personagem_id
	left join public.npcs n on n.id = t.npc_id
	where t.cena_id = cena and (public.eh_mestre(c.campanha_id) or (c.mostrar_pv and c.ativa and t.visivel and public.eh_membro(c.campanha_id)));
$$;

-- ---------------------------------------------------------------- traços do lápis (a cor vem do autor)
create table public.mesa_tracos (
	id uuid primary key default gen_random_uuid(),
	cena_id uuid not null references public.mesa_cenas (id) on delete cascade,
	autor_id uuid not null default auth.uid() references public.perfis (id) on delete cascade,
	espessura real not null default 0.2 check (espessura in (0.1, 0.2, 0.4)),
	-- [[x, y], ...] em metros, simplificado no cliente
	pontos jsonb not null check (jsonb_typeof(pontos) = 'array' and jsonb_array_length(pontos) between 2 and 2000),
	criado_em timestamptz not null default now()
);
create index mesa_tracos_cena on public.mesa_tracos (cena_id);
alter table public.mesa_tracos enable row level security;
create policy "mesa_tracos: quem vê a cena vê os traços" on public.mesa_tracos for select to authenticated using (public.mesa_cena_visivel(cena_id));
create policy "mesa_tracos: cada um desenha os seus" on public.mesa_tracos for insert to authenticated
	with check (autor_id = (select auth.uid()) and public.mesa_cena_aberta(cena_id));
create policy "mesa_tracos: cada um apaga os seus, o Mestre apaga todos" on public.mesa_tracos for delete to authenticated using (
	(autor_id = (select auth.uid()) and public.mesa_cena_visivel(cena_id))
	or exists (select 1 from public.mesa_cenas c where c.id = cena_id and public.eh_mestre(c.campanha_id))
);

-- ---------------------------------------------------------------- efeitos em cena (jutsus com duração)
create table public.mesa_efeitos (
	id uuid primary key default gen_random_uuid(),
	cena_id uuid not null references public.mesa_cenas (id) on delete cascade,
	autor_id uuid not null default auth.uid() references public.perfis (id) on delete cascade,
	nome text not null check (char_length(trim(nome)) between 1 and 60),
	-- [[x, y], ...]: os quadrados atingidos, calculados pela régua de jutsu
	quadrados jsonb not null check (jsonb_typeof(quadrados) = 'array' and jsonb_array_length(quadrados) <= 2000),
	rotulo_x real not null default 0,
	rotulo_y real not null default 0,
	-- turnos restantes; null = até o fim da cena
	turnos int check (turnos between 0 and 99),
	criado_em timestamptz not null default now()
);
create index mesa_efeitos_cena on public.mesa_efeitos (cena_id);
alter table public.mesa_efeitos enable row level security;
create policy "mesa_efeitos: quem vê a cena vê os efeitos" on public.mesa_efeitos for select to authenticated using (public.mesa_cena_visivel(cena_id));
create policy "mesa_efeitos: quem mexe na cena deixa os seus" on public.mesa_efeitos for insert to authenticated
	with check (autor_id = (select auth.uid()) and public.mesa_cena_aberta(cena_id));
create policy "mesa_efeitos: o Mestre conta os turnos" on public.mesa_efeitos for update to authenticated
	using (exists (select 1 from public.mesa_cenas c where c.id = cena_id and public.eh_mestre(c.campanha_id)));
create policy "mesa_efeitos: autor e Mestre tiram" on public.mesa_efeitos for delete to authenticated using (
	autor_id = (select auth.uid()) or exists (select 1 from public.mesa_cenas c where c.id = cena_id and public.eh_mestre(c.campanha_id))
);

-- ---------------------------------------------------------------- permissões das funções e tempo real
grant select, insert, update, delete on public.npc_pastas, public.mesa_cenas, public.mesa_tokens, public.mesa_tracos, public.mesa_efeitos to authenticated;
revoke execute on function public.definir_cor(uuid, text), public.pasta_da_ficha(uuid, uuid), public.ativar_cena(uuid),
	public.pv_da_cena(uuid), public.mesa_cena_visivel(uuid), public.mesa_cena_aberta(uuid), public.faixa_ferimento(int, int),
	public.mesa_token_do_usuario(uuid) from public, anon, authenticated;
grant execute on function public.definir_cor(uuid, text), public.pasta_da_ficha(uuid, uuid), public.ativar_cena(uuid),
	public.pv_da_cena(uuid), public.mesa_cena_visivel(uuid), public.mesa_cena_aberta(uuid), public.faixa_ferimento(int, int),
	public.mesa_token_do_usuario(uuid) to authenticated;
revoke execute on function public.npc_pasta_antes(), public.npc_pasta_ao_excluir(), public.mesa_token_antes(),
	public.mesa_token_da_ficha(), public.mesa_token_do_npc() from public, anon, authenticated;

do $$
begin
	if exists (select 1 from pg_publication where pubname = 'supabase_realtime') then
		alter publication supabase_realtime add table public.mesa_cenas, public.mesa_tokens, public.mesa_tracos, public.mesa_efeitos, public.membros;
	end if;
end $$;
