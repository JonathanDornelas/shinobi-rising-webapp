-- Mesa: ferramentas novas.
--  · objetos da cena: alfinetes, imagens (png/svg já convertidos para webp) e textos soltos no quadro;
--  · biblioteca de artes da campanha (mapas e objetos enviados pelo Mestre, com miniatura);
--  · cenas em pastas, com nome público (o que o grupo vê no lugar do nome do Mestre);
--  · névoa: o Mestre cobre o mapa e revela só o que quer (runs [y, x0, x1] de quadrados revelados);
--  · estilo dos efeitos de área (elemento, taijutsu, genjutsu, bukijutsu, ninjutsu);
--  · jukebox: a música da campanha (YouTube ou Spotify), tocada igual para todos.

-- ---------------------------------------------------------------- pastas de cenas (até 3 níveis, como as de NPCs)
create table public.mesa_cena_pastas (
	id uuid primary key default gen_random_uuid(),
	campanha_id uuid not null references public.campanhas (id) on delete cascade,
	pai_id uuid references public.mesa_cena_pastas (id) on delete cascade,
	nome text not null check (char_length(trim(nome)) between 1 and 60),
	ordem int not null default 0,
	criada_em timestamptz not null default now()
);
create index mesa_cena_pastas_campanha on public.mesa_cena_pastas (campanha_id);
alter table public.mesa_cena_pastas enable row level security;
create policy "mesa_cena_pastas: só o Mestre" on public.mesa_cena_pastas for all to authenticated
	using (public.eh_mestre(campanha_id)) with check (public.eh_mestre(campanha_id) and public.campanha_ativa(campanha_id));

create function public.mesa_cena_pasta_antes() returns trigger
language plpgsql set search_path = '' as $$
declare
	nivel int := 1;
	atual uuid := new.pai_id;
	pai public.mesa_cena_pastas;
begin
	while atual is not null loop
		select * into pai from public.mesa_cena_pastas where id = atual;
		if pai.id is null or pai.campanha_id <> new.campanha_id then raise exception 'Pasta de cima inválida.' using errcode = 'P0001'; end if;
		if pai.id = new.id then raise exception 'Uma pasta não pode ficar dentro de si mesma.' using errcode = 'P0001'; end if;
		nivel := nivel + 1;
		atual := pai.pai_id;
	end loop;
	if tg_op = 'UPDATE' then
		nivel := nivel + coalesce((with recursive d (id, n) as (
			select k.id, 1 from public.mesa_cena_pastas k where k.pai_id = new.id
			union all select k.id, d.n + 1 from public.mesa_cena_pastas k join d on k.pai_id = d.id where d.n < 5
		) select max(n) from d), 0);
	end if;
	if nivel > 3 then raise exception 'As pastas vão até 3 níveis.' using errcode = 'P0001'; end if;
	return new;
end $$;
create trigger mesa_cena_pasta_antes before insert or update on public.mesa_cena_pastas for each row execute function public.mesa_cena_pasta_antes();

-- excluir uma pasta não apaga cenas: o conteúdo sobe para a pasta de cima
create function public.mesa_cena_pasta_ao_excluir() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
	update public.mesa_cena_pastas set pai_id = old.pai_id where pai_id = old.id;
	update public.mesa_cenas set pasta_id = old.pai_id where pasta_id = old.id;
	return old;
end $$;
create trigger mesa_cena_pasta_ao_excluir before delete on public.mesa_cena_pastas for each row execute function public.mesa_cena_pasta_ao_excluir();

-- ---------------------------------------------------------------- colunas novas das cenas e dos efeitos
alter table public.mesa_cenas
	add column pasta_id uuid references public.mesa_cena_pastas (id) on delete set null,
	-- o que o grupo vê no lugar do nome (null = "Cena"); o nome verdadeiro é só do Mestre
	add column nome_publico text check (nome_publico is null or char_length(trim(nome_publico)) between 1 and 60),
	add column nevoa boolean not null default false,
	-- quadrados revelados em runs [[y, x0, x1], ...] (x0 e x1 incluídos)
	add column reveladas jsonb not null default '[]'::jsonb check (jsonb_typeof(reveladas) = 'array' and pg_column_size(reveladas) <= 60000);

create function public.mesa_cena_pasta_valida() returns trigger
language plpgsql set search_path = '' as $$
begin
	if new.pasta_id is not null and not exists (select 1 from public.mesa_cena_pastas p where p.id = new.pasta_id and p.campanha_id = new.campanha_id) then
		raise exception 'Pasta não encontrada.' using errcode = 'P0001';
	end if;
	return new;
end $$;
create trigger mesa_cena_pasta_valida before insert or update of pasta_id on public.mesa_cenas for each row execute function public.mesa_cena_pasta_valida();

alter table public.mesa_efeitos
	add column estilo text check (estilo is null or estilo in (
		'katon', 'suiton', 'doton', 'raiton', 'fuuton', 'mokuton', 'hyoton', 'yoton', 'ranton', 'jiton', 'futton', 'shakuton', 'bakuton', 'jinton',
		'taijutsu', 'genjutsu', 'bukijutsu', 'ninjutsu'
	));

-- ---------------------------------------------------------------- biblioteca de artes da campanha
create table public.mesa_artes (
	id uuid primary key default gen_random_uuid(),
	campanha_id uuid not null references public.campanhas (id) on delete cascade,
	autor_id uuid not null default auth.uid() references public.perfis (id) on delete cascade,
	nome text not null check (char_length(trim(nome)) between 1 and 60),
	-- mapa (fundo e cena narrativa) ou objeto (imagem solta no quadro, com transparência)
	tipo text not null default 'mapa' check (tipo in ('mapa', 'objeto')),
	-- <campanha>/<nome>.webp no bucket mesa, e a miniatura de 256 px ao lado
	caminho text not null,
	miniatura text,
	largura int not null check (largura between 1 and 4096),
	altura int not null check (altura between 1 and 4096),
	bytes int not null default 0 check (bytes between 0 and 5242880),
	criada_em timestamptz not null default now(),
	constraint mesa_artes_caminho_valido check (caminho ~ '^[0-9a-f-]{36}/[a-z0-9-]{1,60}\.webp$' and split_part(caminho, '/', 1) = campanha_id::text),
	constraint mesa_artes_miniatura_valida check (miniatura is null or (miniatura ~ '^[0-9a-f-]{36}/[a-z0-9-]{1,60}\.webp$' and split_part(miniatura, '/', 1) = campanha_id::text))
);
create index mesa_artes_campanha on public.mesa_artes (campanha_id, criada_em desc);
alter table public.mesa_artes enable row level security;
create policy "mesa_artes: só o Mestre" on public.mesa_artes for all to authenticated
	using (public.eh_mestre(campanha_id)) with check (public.eh_mestre(campanha_id) and public.campanha_ativa(campanha_id));

-- no máximo 300 artes por campanha (o bucket é público e cada arte pesa até 5 MB)
create function public.mesa_arte_antes() returns trigger
language plpgsql set search_path = '' as $$
begin
	if (select count(*) from public.mesa_artes a where a.campanha_id = new.campanha_id) >= 300 then
		raise exception 'A biblioteca guarda até 300 artes. Apague algumas para enviar outras.' using errcode = 'P0001';
	end if;
	return new;
end $$;
create trigger mesa_arte_antes before insert on public.mesa_artes for each row execute function public.mesa_arte_antes();

-- apagar uma arte tira ela de onde estava em uso (fundo, narrativa e objetos); os arquivos o cliente remove do bucket
create function public.mesa_arte_ao_excluir() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
	update public.mesa_cenas set fundo = null where campanha_id = old.campanha_id and fundo = old.caminho;
	update public.mesa_cenas set imagem = null where campanha_id = old.campanha_id and imagem = old.caminho;
	delete from public.mesa_objetos where campanha_id = old.campanha_id and imagem = old.caminho;
	return old;
end $$;
create trigger mesa_arte_ao_excluir before delete on public.mesa_artes for each row execute function public.mesa_arte_ao_excluir();

-- ---------------------------------------------------------------- objetos da cena
create table public.mesa_objetos (
	id uuid primary key default gen_random_uuid(),
	cena_id uuid not null references public.mesa_cenas (id) on delete cascade,
	campanha_id uuid not null references public.campanhas (id) on delete cascade,
	autor_id uuid not null default auth.uid() references public.perfis (id) on delete cascade,
	tipo text not null check (tipo in ('alfinete', 'imagem', 'texto')),
	-- centro do objeto, em metros
	x real not null default 0 check (x between -50 and 250),
	y real not null default 0 check (y between -50 and 250),
	-- imagem: tamanho em metros; texto: altura da letra em `tamanho`
	largura real check (largura is null or largura between 0.25 and 400),
	altura real check (altura is null or altura between 0.25 and 400),
	rotacao real not null default 0 check (rotacao between -360 and 360),
	cor text check (cor is null or cor ~ '^#[0-9a-fA-F]{6}$'),
	-- rótulo do alfinete (até 40) ou o texto solto (até 300)
	texto text check (texto is null or char_length(texto) <= 300),
	fonte text check (fonte is null or fonte in ('sans', 'pixel', 'mincho', 'mono')),
	tamanho real check (tamanho is null or tamanho between 0.2 and 20),
	imagem text,
	-- ordem de empilhamento (maior fica por cima) e o que o Mestre esconde ou trava
	ordem int not null default 0 check (ordem between -1000 and 1000),
	visivel boolean not null default true,
	travado boolean not null default false,
	criado_em timestamptz not null default now(),
	constraint mesa_objetos_por_tipo check (
		(tipo = 'alfinete' and (texto is null or char_length(texto) <= 40))
		or (tipo = 'imagem' and imagem is not null and largura is not null and altura is not null)
		or (tipo = 'texto' and char_length(trim(coalesce(texto, ''))) > 0 and tamanho is not null)
	),
	constraint mesa_objetos_imagem_valida check (
		imagem is null or imagem ~ '^/(covers|capitulos)/[a-z0-9-]+\.png$'
		or (imagem ~ '^[0-9a-f-]{36}/[a-z0-9-]{1,60}\.webp$' and split_part(imagem, '/', 1) = campanha_id::text)
	)
);
create index mesa_objetos_cena on public.mesa_objetos (cena_id);
create index mesa_objetos_imagem on public.mesa_objetos (campanha_id, imagem) where imagem is not null;
alter table public.mesa_objetos enable row level security;
create policy "mesa_objetos: o grupo vê os visíveis, o Mestre todos" on public.mesa_objetos for select to authenticated
	using (public.mesa_cena_visivel(cena_id) and (visivel or autor_id = (select auth.uid()) or public.eh_mestre(campanha_id)));
-- o Mestre põe qualquer objeto; o grupo põe alfinetes e textos seus
create policy "mesa_objetos: Mestre põe qualquer um, o grupo alfinete e texto" on public.mesa_objetos for insert to authenticated
	with check (public.mesa_cena_aberta(cena_id) and (public.eh_mestre(campanha_id) or (
		autor_id = (select auth.uid()) and tipo in ('alfinete', 'texto') and visivel and not travado)));
create policy "mesa_objetos: Mestre edita todos, cada um os seus" on public.mesa_objetos for update to authenticated
	using (public.eh_mestre(campanha_id) or (autor_id = (select auth.uid()) and not travado and public.mesa_cena_aberta(cena_id)))
	with check (public.eh_mestre(campanha_id) or (autor_id = (select auth.uid()) and tipo in ('alfinete', 'texto') and visivel and not travado));
create policy "mesa_objetos: Mestre tira todos, cada um os seus" on public.mesa_objetos for delete to authenticated
	using (public.eh_mestre(campanha_id) or (autor_id = (select auth.uid()) and not travado and public.mesa_cena_aberta(cena_id)));

-- a campanha vem da cena; no máximo 300 objetos por cena
create function public.mesa_objeto_antes() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
	if tg_op = 'INSERT' then
		select c.campanha_id into new.campanha_id from public.mesa_cenas c where c.id = new.cena_id;
		if (select count(*) from public.mesa_objetos o where o.cena_id = new.cena_id) >= 300 then
			raise exception 'A cena guarda até 300 objetos.' using errcode = 'P0001';
		end if;
		return new;
	end if;
	-- cena, campanha e autor não mudam
	new.cena_id := old.cena_id; new.campanha_id := old.campanha_id; new.autor_id := old.autor_id; new.criado_em := old.criado_em;
	return new;
end $$;
create trigger mesa_objeto_antes before insert or update on public.mesa_objetos for each row execute function public.mesa_objeto_antes();

-- ---------------------------------------------------------------- jukebox da campanha
create table public.mesa_jukebox (
	campanha_id uuid primary key references public.campanhas (id) on delete cascade,
	fonte text not null check (fonte in ('youtube', 'spotify')),
	-- youtube: id do vídeo (11) ou da lista (PL…); spotify: "track/…", "album/…", "playlist/…", "episode/…", "show/…"
	ref text not null check (ref ~ '^[A-Za-z0-9_-]{6,64}$' or ref ~ '^(track|album|playlist|episode|show|artist)/[A-Za-z0-9]{10,40}$'),
	lista boolean not null default false,
	titulo text check (titulo is null or char_length(titulo) <= 120),
	tocando boolean not null default false,
	-- posição em segundos no momento `desde` (quem entra depois soma o tempo corrido) e o item da lista
	posicao real not null default 0 check (posicao between 0 and 86400),
	indice int not null default 0 check (indice between 0 and 999),
	desde timestamptz not null default now(),
	atualizada_em timestamptz not null default now()
);
alter table public.mesa_jukebox enable row level security;
create policy "mesa_jukebox: o grupo ouve" on public.mesa_jukebox for select to authenticated
	using (public.eh_mestre(campanha_id) or public.eh_membro(campanha_id));
create policy "mesa_jukebox: só o Mestre muda" on public.mesa_jukebox for all to authenticated
	using (public.eh_mestre(campanha_id)) with check (public.eh_mestre(campanha_id) and public.campanha_ativa(campanha_id));

-- o relógio é o do servidor: cada mudança carimba `desde`
create function public.mesa_jukebox_antes() returns trigger
language plpgsql set search_path = '' as $$
begin
	new.desde := now();
	new.atualizada_em := now();
	return new;
end $$;
create trigger mesa_jukebox_antes before insert or update on public.mesa_jukebox for each row execute function public.mesa_jukebox_antes();

-- a hora do servidor, para quem entra na mesa acertar a posição da música
create function public.agora_servidor() returns timestamptz
language sql stable set search_path = '' as $$ select now(); $$;

-- ---------------------------------------------------------------- permissões e tempo real
grant select, insert, update, delete on public.mesa_cena_pastas, public.mesa_artes, public.mesa_objetos, public.mesa_jukebox to authenticated;
revoke execute on function public.mesa_cena_pasta_antes(), public.mesa_cena_pasta_ao_excluir(), public.mesa_cena_pasta_valida(),
	public.mesa_arte_antes(), public.mesa_arte_ao_excluir(), public.mesa_objeto_antes(), public.mesa_jukebox_antes() from public, anon, authenticated;
revoke execute on function public.agora_servidor() from public, anon;
grant execute on function public.agora_servidor() to authenticated;

do $$
begin
	if exists (select 1 from pg_publication where pubname = 'supabase_realtime') then
		alter publication supabase_realtime add table public.mesa_objetos, public.mesa_jukebox;
	end if;
end $$;
