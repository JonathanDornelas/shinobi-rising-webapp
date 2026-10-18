-- Lote 3 · Contas e campanhas
-- Perfis, campanhas, membros, convites, notificações e atividade, com RLS por campanha.
-- O papel vale por campanha: a mesma pessoa pode ser Mestre numa e Jogador noutra.

-- ---------------------------------------------------------------- perfis
create table public.perfis (
	id uuid primary key references auth.users (id) on delete cascade,
	nome text not null check (char_length(trim(nome)) between 1 and 40),
	avatar text,
	preferencias jsonb not null default '{}'::jsonb,
	criado_em timestamptz not null default now()
);
comment on table public.perfis is 'Dados públicos da conta (nome de exibição, retrato) e preferências.';

alter table public.perfis enable row level security;
create policy "perfis: autenticados leem" on public.perfis for select to authenticated using (true);
create policy "perfis: dono edita" on public.perfis for update to authenticated
	using (id = (select auth.uid())) with check (id = (select auth.uid()));

create function public.criar_perfil() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
	insert into public.perfis (id, nome)
	values (new.id, coalesce(nullif(trim(new.raw_user_meta_data ->> 'nome'), ''), split_part(new.email, '@', 1)));
	return new;
end $$;
create trigger ao_criar_usuario after insert on auth.users for each row execute function public.criar_perfil();

-- contas criadas antes desta migração também ganham perfil
insert into public.perfis (id, nome)
select u.id, left(coalesce(nullif(trim(u.raw_user_meta_data ->> 'nome'), ''), split_part(u.email, '@', 1)), 40)
from auth.users u
on conflict (id) do nothing;

-- ---------------------------------------------------------------- campanhas
create type public.papel as enum ('mestre', 'jogador');

create table public.campanhas (
	id uuid primary key default gen_random_uuid(),
	nome text not null check (char_length(trim(nome)) between 3 and 60),
	premissa text not null default '' check (char_length(premissa) <= 2000),
	capa text not null default 'capa-nevoa'
		check (capa in ('capa-nevoa', 'capa-floresta', 'capa-deserto', 'capa-montanha', 'capa-chuva', 'capa-rochas')),
	era text not null default 'classica'
		check (era in ('primeira-guerra', 'sannin', 'classica', 'pos-guerra', 'boruto', 'alternativa')),
	era_alternativa text check (char_length(era_alternativa) <= 80),
	nivel_inicial int not null default 1 check (nivel_inicial between 1 and 20),
	tamanho_grupo int not null default 5 check (tamanho_grupo between 1 and 20),
	-- [{ "id": "konoha", "status": "aliada" | "em-guerra" | "neutra" | null }]
	vilas jsonb not null default '[{"id":"konoha","status":null},{"id":"kiri","status":null},{"id":"suna","status":null},{"id":"kumo","status":null},{"id":"iwa","status":null},{"id":"sem","status":null}]'::jsonb,
	clas_permitidos text[] not null default array['nara','akimichi','yamanaka','inuzuka','aburame','hyuuga','uchiha','senju','uzumaki','kaguya','hozuki','sabaku','yuki'],
	clas_sem_kkg boolean not null default true,
	clas_com_kkg boolean not null default true,
	pacotes text[] not null default array['A','B'],
	-- o que exige aprovação do Mestre (clãs e jutsus criados sempre exigem: cap. 8.4 e 20.6)
	aprovacao jsonb not null default '{"fichas":true,"armas":true,"itens":true,"marionetes":true,"backgrounds":true,"treino":true,"mestre_edita_aprovadas":false}'::jsonb,
	regras_mesa text not null default '' check (char_length(regras_mesa) <= 5000),
	mestre_id uuid references public.perfis (id) on delete set null,
	arquivada_em timestamptz,
	criada_em timestamptz not null default now(),
	atualizada_em timestamptz not null default now()
);

create table public.membros (
	campanha_id uuid not null references public.campanhas (id) on delete cascade,
	usuario_id uuid not null references public.perfis (id) on delete cascade,
	papel public.papel not null,
	entrou_em timestamptz not null default now(),
	primary key (campanha_id, usuario_id)
);
create index membros_usuario on public.membros (usuario_id);

-- funções auxiliares das políticas (security definer evita recursão de RLS)
create function public.eh_membro(c uuid) returns boolean
language sql stable security definer set search_path = '' as $$
	select exists (select 1 from public.membros m where m.campanha_id = c and m.usuario_id = (select auth.uid()));
$$;
create function public.eh_mestre(c uuid) returns boolean
language sql stable security definer set search_path = '' as $$
	select exists (select 1 from public.campanhas k where k.id = c and k.mestre_id = (select auth.uid()));
$$;

alter table public.campanhas enable row level security;
create policy "campanhas: membros leem" on public.campanhas for select to authenticated
	using (mestre_id = (select auth.uid()) or public.eh_membro(id));
create policy "campanhas: quem cria é o Mestre" on public.campanhas for insert to authenticated
	with check (mestre_id = (select auth.uid()));
create policy "campanhas: Mestre edita" on public.campanhas for update to authenticated
	using (mestre_id = (select auth.uid())) with check (mestre_id = (select auth.uid()));
create policy "campanhas: Mestre exclui" on public.campanhas for delete to authenticated using (mestre_id = (select auth.uid()));

alter table public.membros enable row level security;
create policy "membros: membros leem" on public.membros for select to authenticated using (public.eh_membro(campanha_id));
create policy "membros: Mestre remove jogador, jogador sai" on public.membros for delete to authenticated using (
	papel = 'jogador' and (usuario_id = (select auth.uid()) or public.eh_mestre(campanha_id))
);

-- campanha arquivada é somente leitura (só dá para desarquivar); atualizada_em automático
create function public.campanha_antes_de_atualizar() returns trigger
language plpgsql set search_path = '' as $$
begin
	-- só desarquivar ou trocar o Mestre (inclusive quando ele exclui a conta) são permitidos
	if old.arquivada_em is not null and new.arquivada_em is not null and new.mestre_id is not distinct from old.mestre_id then
		raise exception 'Campanha arquivada é somente leitura. Desarquive para editar.' using errcode = 'P0001';
	end if;
	new.atualizada_em := now();
	return new;
end $$;
create trigger campanha_antes_de_atualizar before update on public.campanhas
	for each row execute function public.campanha_antes_de_atualizar();

-- ---------------------------------------------------------------- atividade e notificações
create table public.atividades (
	id bigint generated always as identity primary key,
	campanha_id uuid not null references public.campanhas (id) on delete cascade,
	ator_id uuid references public.perfis (id) on delete set null,
	tipo text not null,
	texto text not null,
	icone text not null default 'callout/ic-callout-destaque',
	criada_em timestamptz not null default now()
);
create index atividades_campanha on public.atividades (campanha_id, criada_em desc);
alter table public.atividades enable row level security;
create policy "atividades: membros leem" on public.atividades for select to authenticated using (public.eh_membro(campanha_id));

create table public.notificacoes (
	id uuid primary key default gen_random_uuid(),
	usuario_id uuid not null references public.perfis (id) on delete cascade,
	tipo text not null,
	texto text not null,
	href text,
	icone text not null default 'nav/ic-nav-notificacoes',
	lida boolean not null default false,
	criada_em timestamptz not null default now()
);
create index notificacoes_usuario on public.notificacoes (usuario_id, criada_em desc);
alter table public.notificacoes enable row level security;
create policy "notificacoes: dono lê" on public.notificacoes for select to authenticated using (usuario_id = (select auth.uid()));
create policy "notificacoes: dono marca como lida" on public.notificacoes for update to authenticated
	using (usuario_id = (select auth.uid())) with check (usuario_id = (select auth.uid()));
create policy "notificacoes: dono apaga" on public.notificacoes for delete to authenticated using (usuario_id = (select auth.uid()));

create function public.registrar_atividade(c uuid, tipo text, texto text, icone text) returns void
language sql security definer set search_path = '' as $$
	insert into public.atividades (campanha_id, ator_id, tipo, texto, icone) values (c, (select auth.uid()), tipo, texto, icone);
$$;
revoke execute on function public.registrar_atividade(uuid, text, text, text) from public, anon, authenticated;

create function public.notificar(u uuid, tipo text, texto text, href text, icone text) returns void
language sql security definer set search_path = '' as $$
	insert into public.notificacoes (usuario_id, tipo, texto, href, icone) values (u, tipo, texto, href, icone);
$$;
revoke execute on function public.notificar(uuid, text, text, text, text) from public, anon, authenticated;

-- quem cria a campanha entra como Mestre
create function public.campanha_criada() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
	insert into public.membros (campanha_id, usuario_id, papel) values (new.id, new.mestre_id, 'mestre');
	perform public.registrar_atividade(new.id, 'campanha_criada', 'Campanha criada', 'nav/ic-nav-campanhas');
	return new;
end $$;
create trigger campanha_criada after insert on public.campanhas for each row execute function public.campanha_criada();

-- ---------------------------------------------------------------- convites
create type public.tipo_convite as enum ('email', 'link', 'codigo');
create type public.status_convite as enum ('pendente', 'aceito', 'recusado', 'revogado');

create table public.convites (
	id uuid primary key default gen_random_uuid(),
	campanha_id uuid not null references public.campanhas (id) on delete cascade,
	tipo public.tipo_convite not null,
	email text check ((tipo = 'email') = (email is not null)),
	token text not null unique default replace(gen_random_uuid()::text, '-', ''),
	codigo text unique,
	mensagem text check (char_length(mensagem) <= 500),
	expira_em timestamptz,
	max_usos int check (max_usos is null or max_usos > 0),
	usos int not null default 0,
	status public.status_convite not null default 'pendente',
	criado_por uuid not null default auth.uid() references public.perfis (id) on delete cascade,
	criado_em timestamptz not null default now(),
	respondido_por uuid references public.perfis (id) on delete set null,
	respondido_em timestamptz
);
create index convites_campanha on public.convites (campanha_id, criado_em desc);
create index convites_email on public.convites (lower(email)) where tipo = 'email';

-- código curto para dizer em voz alta: 3 letras + 3 caracteres, sem caracteres ambíguos (KNH-4F2)
create function public.gerar_codigo_convite() returns text
language plpgsql volatile set search_path = '' as $$
declare
	letras constant text := 'ABCDEFGHJKLMNPQRSTUVWXYZ';
	misto constant text := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
	c text;
begin
	loop
		c := '';
		for i in 1..3 loop c := c || substr(letras, 1 + floor(random() * length(letras))::int, 1); end loop;
		c := c || '-';
		for i in 1..3 loop c := c || substr(misto, 1 + floor(random() * length(misto))::int, 1); end loop;
		exit when not exists (select 1 from public.convites where codigo = c);
	end loop;
	return c;
end $$;

create function public.convite_antes_de_inserir() returns trigger
language plpgsql set search_path = '' as $$
begin
	if new.tipo = 'codigo' and new.codigo is null then new.codigo := public.gerar_codigo_convite(); end if;
	if new.tipo = 'email' then new.email := lower(trim(new.email)); new.max_usos := 1; end if;
	return new;
end $$;
create trigger convite_antes_de_inserir before insert on public.convites for each row execute function public.convite_antes_de_inserir();

alter table public.convites enable row level security;
create policy "convites: Mestre e convidado leem" on public.convites for select to authenticated using (
	public.eh_mestre(campanha_id) or (tipo = 'email' and email = lower((select auth.jwt()) ->> 'email'))
);
create policy "convites: Mestre cria" on public.convites for insert to authenticated
	with check (public.eh_mestre(campanha_id) and criado_por = (select auth.uid()));
create policy "convites: Mestre altera" on public.convites for update to authenticated
	using (public.eh_mestre(campanha_id)) with check (public.eh_mestre(campanha_id));
create policy "convites: Mestre apaga" on public.convites for delete to authenticated using (public.eh_mestre(campanha_id));

-- avisa quem já tem conta quando recebe convite por e-mail
create function public.convite_criado() returns trigger
language plpgsql security definer set search_path = '' as $$
declare
	destino uuid;
	nome_campanha text;
	nome_mestre text;
begin
	if new.tipo = 'email' then
		select u.id into destino from auth.users u where lower(u.email) = new.email;
		if destino is not null then
			select k.nome into nome_campanha from public.campanhas k where k.id = new.campanha_id;
			select p.nome into nome_mestre from public.perfis p where p.id = new.criado_por;
			perform public.notificar(destino, 'convite', nome_mestre || ' convidou você para ' || nome_campanha, '/convite/' || new.token, 'acao/ic-acao-convidar');
		end if;
	end if;
	return new;
end $$;
create trigger convite_criado after insert on public.convites for each row execute function public.convite_criado();

-- situação de um convite, do ponto de vista de quem abre o link
create function public.situacao_convite(cv public.convites) returns text
language plpgsql stable security definer set search_path = '' as $$
declare
	uid uuid := (select auth.uid());
	email_atual text := lower((select auth.jwt()) ->> 'email');
begin
	if cv.status = 'revogado' then return 'revogado'; end if;
	if uid is not null and exists (select 1 from public.membros m where m.campanha_id = cv.campanha_id and m.usuario_id = uid) then
		return 'ja_membro';
	end if;
	if cv.status in ('aceito', 'recusado') then return cv.status::text; end if;
	if cv.expira_em is not null and cv.expira_em < now() then return 'expirado'; end if;
	if cv.max_usos is not null and cv.usos >= cv.max_usos then return 'esgotado'; end if;
	if exists (select 1 from public.campanhas k where k.id = cv.campanha_id and k.arquivada_em is not null) then return 'arquivada'; end if;
	if uid is null then return 'visitante'; end if;
	if cv.tipo = 'email' and cv.email <> email_atual then return 'outro_email'; end if;
	return 'valido';
end $$;

create function public.buscar_convite(chave text) returns public.convites
language sql stable security definer set search_path = '' as $$
	select * from public.convites c where c.token = chave or c.codigo = upper(trim(chave)) limit 1;
$$;
revoke execute on function public.buscar_convite(text) from public, anon, authenticated;

-- dados públicos do convite (C6); também para visitantes
create function public.ver_convite(chave text) returns jsonb
language plpgsql stable security definer set search_path = '' as $$
declare
	cv public.convites := public.buscar_convite(chave);
	k public.campanhas;
begin
	if cv.id is null then return jsonb_build_object('situacao', 'nao_encontrado'); end if;
	select * into k from public.campanhas where id = cv.campanha_id;
	return jsonb_build_object(
		'situacao', public.situacao_convite(cv),
		'token', cv.token,
		'tipo', cv.tipo,
		'mensagem', cv.mensagem,
		'max_usos', cv.max_usos,
		-- e-mail mascarado (j***@gmail.com)
		'email', case when cv.email is null then null else left(cv.email, 1) || '***@' || split_part(cv.email, '@', 2) end,
		'campanha', jsonb_build_object(
			'id', k.id, 'nome', k.nome, 'capa', k.capa, 'era', k.era, 'era_alternativa', k.era_alternativa, 'premissa', k.premissa,
			'jogadores', (select count(*) from public.membros m where m.campanha_id = k.id and m.papel = 'jogador'),
			'mestre', (select p.nome from public.perfis p where p.id = k.mestre_id)
		),
		'convidado_por', (select p.nome from public.perfis p where p.id = cv.criado_por)
	);
end $$;
grant execute on function public.ver_convite(text) to anon, authenticated;

create function public.aceitar_convite(chave text) returns uuid
language plpgsql security definer set search_path = '' as $$
declare
	cv public.convites := public.buscar_convite(chave);
	situacao text;
	uid uuid := (select auth.uid());
	nome_jogador text;
	k public.campanhas;
begin
	if uid is null then raise exception 'Entre na sua conta para aceitar o convite.' using errcode = '42501'; end if;
	if cv.id is null then raise exception 'Convite não encontrado.' using errcode = 'P0002'; end if;
	situacao := public.situacao_convite(cv);
	if situacao = 'ja_membro' then return cv.campanha_id; end if;
	if situacao <> 'valido' then raise exception 'Convite indisponível: %', situacao using errcode = 'P0001'; end if;

	insert into public.membros (campanha_id, usuario_id, papel) values (cv.campanha_id, uid, 'jogador');
	update public.convites set
		usos = usos + 1,
		status = case when tipo = 'email' then 'aceito'::public.status_convite else status end,
		respondido_por = case when tipo = 'email' then uid else respondido_por end,
		respondido_em = case when tipo = 'email' then now() else respondido_em end
	where id = cv.id;

	select * into k from public.campanhas where id = cv.campanha_id;
	select nome into nome_jogador from public.perfis where id = uid;
	perform public.registrar_atividade(k.id, 'membro_entrou', nome_jogador || ' entrou na campanha', 'acao/ic-acao-convidar');
	if k.mestre_id is not null then
		perform public.notificar(k.mestre_id, 'membro_entrou', nome_jogador || ' entrou em ' || k.nome, '/campanhas/' || k.id || '/membros', 'acao/ic-acao-convidar');
	end if;
	-- convites por e-mail pendentes para a mesma pessoa nesta campanha ficam resolvidos
	update public.convites set status = 'aceito', respondido_por = uid, respondido_em = now()
	where campanha_id = k.id and tipo = 'email' and status = 'pendente' and email = lower((select auth.jwt()) ->> 'email');
	return k.id;
end $$;
grant execute on function public.aceitar_convite(text) to authenticated;

create function public.recusar_convite(chave text) returns void
language plpgsql security definer set search_path = '' as $$
declare
	cv public.convites := public.buscar_convite(chave);
begin
	if cv.id is null or cv.tipo <> 'email' then return; end if;
	if cv.email <> lower((select auth.jwt()) ->> 'email') then raise exception 'Este convite é para outra conta.' using errcode = '42501'; end if;
	update public.convites set status = 'recusado', respondido_por = (select auth.uid()), respondido_em = now()
	where id = cv.id and status = 'pendente';
end $$;
grant execute on function public.recusar_convite(text) to authenticated;

-- ---------------------------------------------------------------- gestão da campanha
create function public.transferir_mestre(campanha uuid, novo_mestre uuid) returns void
language plpgsql security definer set search_path = '' as $$
declare
	uid uuid := (select auth.uid());
	k public.campanhas;
begin
	select * into k from public.campanhas where id = campanha;
	if k.id is null or k.mestre_id is distinct from uid then raise exception 'Só o Mestre pode transferir o papel.' using errcode = '42501'; end if;
	if not exists (select 1 from public.membros where campanha_id = campanha and usuario_id = novo_mestre and papel = 'jogador') then
		raise exception 'Escolha um jogador da campanha.' using errcode = 'P0001';
	end if;
	update public.membros set papel = 'jogador' where campanha_id = campanha and usuario_id = uid;
	update public.membros set papel = 'mestre' where campanha_id = campanha and usuario_id = novo_mestre;
	update public.campanhas set mestre_id = novo_mestre where id = campanha;
	perform public.registrar_atividade(campanha, 'mestre_transferido',
		(select nome from public.perfis where id = novo_mestre) || ' agora é o Mestre', 'papel/ic-papel-mestre');
	perform public.notificar(novo_mestre, 'mestre_transferido', 'Você agora é o Mestre de ' || k.nome, '/campanhas/' || campanha, 'papel/ic-papel-mestre');
end $$;
grant execute on function public.transferir_mestre(uuid, uuid) to authenticated;

-- excluir a própria conta: bloqueado enquanto for Mestre de campanha ativa
create function public.excluir_conta() returns void
language plpgsql security definer set search_path = '' as $$
declare
	uid uuid := (select auth.uid());
begin
	if uid is null then raise exception 'Sessão expirada.' using errcode = '42501'; end if;
	if exists (select 1 from public.campanhas where mestre_id = uid and arquivada_em is null) then
		raise exception 'Transfira ou arquive as campanhas em que você é Mestre.' using errcode = 'P0001';
	end if;
	delete from auth.users where id = uid;
end $$;
grant execute on function public.excluir_conta() to authenticated;

-- convites por e-mail ainda abertos para a conta atual (faixa "Convite pendente" de C1)
create function public.meus_convites() returns jsonb
language sql stable security definer set search_path = '' as $$
	select coalesce(jsonb_agg(jsonb_build_object(
		'token', c.token,
		'campanha', k.nome,
		'capa', k.capa,
		'era', k.era,
		'era_alternativa', k.era_alternativa,
		'convidado_por', p.nome,
		'criado_em', c.criado_em
	) order by c.criado_em desc), '[]'::jsonb)
	from public.convites c
	join public.campanhas k on k.id = c.campanha_id
	left join public.perfis p on p.id = c.criado_por
	where c.tipo = 'email' and c.email = lower((select auth.jwt()) ->> 'email') and public.situacao_convite(c) = 'valido';
$$;
grant execute on function public.meus_convites() to authenticated;

-- reenviar convite por e-mail: renova a validade por 7 dias e avisa de novo quem já tem conta
create function public.reenviar_convite(convite uuid) returns void
language plpgsql security definer set search_path = '' as $$
declare
	cv public.convites;
	destino uuid;
begin
	select * into cv from public.convites where id = convite;
	if cv.id is null or not public.eh_mestre(cv.campanha_id) then raise exception 'Só o Mestre pode reenviar.' using errcode = '42501'; end if;
	if cv.tipo <> 'email' or cv.status <> 'pendente' then raise exception 'Só convites por e-mail pendentes podem ser reenviados.' using errcode = 'P0001'; end if;
	update public.convites set expira_em = now() + interval '7 days', criado_em = now() where id = cv.id;
	select u.id into destino from auth.users u where lower(u.email) = cv.email;
	if destino is not null then
		perform public.notificar(destino, 'convite',
			(select nome from public.perfis where id = (select auth.uid())) || ' lembrou você do convite para ' || (select nome from public.campanhas where id = cv.campanha_id),
			'/convite/' || cv.token, 'acao/ic-acao-convidar');
	end if;
end $$;
grant execute on function public.reenviar_convite(uuid) to authenticated;

-- atividade quando alguém sai ou é removido (não registra quando a campanha inteira é apagada)
create function public.membro_saiu() returns trigger
language plpgsql security definer set search_path = '' as $$
declare
	uid uuid := (select auth.uid());
	nome_membro text;
begin
	if not exists (select 1 from public.campanhas where id = old.campanha_id) then return old; end if;
	select nome into nome_membro from public.perfis where id = old.usuario_id;
	insert into public.atividades (campanha_id, ator_id, tipo, texto, icone) values (
		old.campanha_id,
		(select id from public.perfis where id = uid),
		'membro_saiu',
		case when old.usuario_id = uid or uid is null then coalesce(nome_membro, 'Um jogador') || ' saiu da campanha'
			else 'O Mestre tirou ' || coalesce(nome_membro, 'um jogador') || ' da campanha' end,
		'nav/ic-nav-membros'
	);
	return old;
end $$;
create trigger membro_saiu after delete on public.membros for each row execute function public.membro_saiu();

-- atividade de arquivamento e de mudança nas regras da mesa
create function public.campanha_atualizada() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
	if (old.arquivada_em is null) <> (new.arquivada_em is null) then
		perform public.registrar_atividade(new.id, case when new.arquivada_em is null then 'campanha_desarquivada' else 'campanha_arquivada' end,
			case when new.arquivada_em is null then 'Campanha desarquivada' else 'Campanha arquivada' end, 'nav/ic-nav-configuracoes');
	elsif old.regras_mesa is distinct from new.regras_mesa then
		perform public.registrar_atividade(new.id, 'regras_mesa', 'Regras da mesa atualizadas', 'nav/ic-nav-regras');
	end if;
	return new;
end $$;
create trigger campanha_atualizada after update on public.campanhas for each row execute function public.campanha_atualizada();

-- ---------------------------------------------------------------- acesso
revoke all on all tables in schema public from anon;
grant select, insert, update, delete on public.perfis, public.campanhas, public.membros, public.convites, public.notificacoes to authenticated;
grant select on public.atividades to authenticated;

-- notificações em tempo real (sino da navbar)
do $$ begin
	if exists (select 1 from pg_publication where pubname = 'supabase_realtime') then
		alter publication supabase_realtime add table public.notificacoes;
	end if;
end $$;
