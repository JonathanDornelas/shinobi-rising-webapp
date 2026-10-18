-- Lote 6 · Clãs criados pelos jogadores (cap. 8.4) e a revisão do Mestre.
-- Como nas fichas, as escolhas ficam em `dados` (jsonb) e o que as listas mostram em `resumo`; os cálculos são do app
-- (src/lib/clas/regras.ts). O status só muda pelas funções abaixo. Todo clã criado passa pelo Mestre.

create type public.status_cla as enum ('rascunho', 'em_revisao', 'ajustes', 'aprovado', 'rejeitado');

create table public.clas (
	id uuid primary key default gen_random_uuid(),
	campanha_id uuid not null references public.campanhas (id) on delete cascade,
	autor_id uuid not null references public.perfis (id) on delete cascade,
	nome text not null default '' check (char_length(nome) <= 60),
	kkg boolean not null default false,
	status public.status_cla not null default 'rascunho',
	versao int not null default 1 check (versao >= 1),
	anterior_id uuid references public.clas (id) on delete set null,
	dados jsonb not null default '{}'::jsonb,
	resumo jsonb not null default '{}'::jsonb,
	mensagem text check (char_length(mensagem) <= 2000),
	comentario_mestre text check (char_length(comentario_mestre) <= 2000),
	enviado_em timestamptz,
	decidido_em timestamptz,
	criado_em timestamptz not null default now(),
	atualizado_em timestamptz not null default now()
);
create index clas_campanha on public.clas (campanha_id, status);
create index clas_autor on public.clas (autor_id);

-- a campanha permite clãs personalizados desse tipo (C2/C7: clas_sem_kkg, clas_com_kkg)?
create function public.campanha_permite_cla(c uuid, com_kkg boolean) returns boolean
language sql stable security definer set search_path = '' as $$
	select exists (
		select 1 from public.campanhas k
		where k.id = c and k.arquivada_em is null and (case when com_kkg then k.clas_com_kkg else k.clas_sem_kkg end)
	);
$$;

alter table public.clas enable row level security;
create policy "clas: autor, Mestre e grupo (aprovados) leem" on public.clas for select to authenticated using (
	autor_id = (select auth.uid()) or public.eh_mestre(campanha_id) or (status = 'aprovado' and public.eh_membro(campanha_id))
);
create policy "clas: membro cria o próprio" on public.clas for insert to authenticated with check (
	autor_id = (select auth.uid()) and status = 'rascunho' and versao = 1 and anterior_id is null
	and public.eh_membro(campanha_id) and public.campanha_permite_cla(campanha_id, kkg)
);
create policy "clas: autor edita rascunho ou ajustes" on public.clas for update to authenticated
	using (autor_id = (select auth.uid()) and status in ('rascunho', 'ajustes') and public.campanha_ativa(campanha_id))
	with check (autor_id = (select auth.uid()));
create policy "clas: autor apaga rascunho" on public.clas for delete to authenticated
	using (autor_id = (select auth.uid()) and status = 'rascunho');

create function public.cla_antes_de_atualizar() returns trigger
language plpgsql set search_path = '' as $$
begin
	new.atualizado_em := now();
	return new;
end $$;
create trigger cla_antes_de_atualizar before update on public.clas
	for each row execute function public.cla_antes_de_atualizar();

-- enviar para revisão; o clã do próprio Mestre entra aprovado
create function public.enviar_cla(cla uuid) returns public.status_cla
language plpgsql security definer set search_path = '' as $$
declare
	c public.clas;
	k public.campanhas;
	novo public.status_cla;
	nome_autor text;
begin
	select * into c from public.clas where id = cla;
	if c.id is null or c.autor_id is distinct from (select auth.uid()) then raise exception 'Clã não encontrado.' using errcode = '42501'; end if;
	if c.status not in ('rascunho', 'ajustes') then raise exception 'Este clã já foi enviado.' using errcode = 'P0001'; end if;
	if char_length(trim(c.nome)) < 2 then raise exception 'Dê um nome ao clã antes de enviar.' using errcode = 'P0001'; end if;
	select * into k from public.campanhas where id = c.campanha_id;
	if k.arquivada_em is not null then raise exception 'Campanha arquivada é somente leitura.' using errcode = 'P0001'; end if;
	if not public.campanha_permite_cla(k.id, c.kkg) then
		raise exception 'A campanha não permite clãs personalizados %.', case when c.kkg then 'com KKG' else 'sem KKG' end using errcode = 'P0001';
	end if;

	novo := case when k.mestre_id = c.autor_id then 'aprovado' else 'em_revisao' end;
	update public.clas set
		status = novo,
		enviado_em = now(),
		decidido_em = case when novo = 'aprovado' then now() else null end,
		comentario_mestre = case when novo = 'aprovado' then null else comentario_mestre end
	where id = c.id;

	select nome into nome_autor from public.perfis where id = c.autor_id;
	if novo = 'aprovado' then
		perform public.registrar_atividade(k.id, 'cla_aprovado', 'Clã ' || c.nome || ' entrou na biblioteca da campanha', 'acao/ic-acao-criar-cla');
	else
		perform public.registrar_atividade(k.id, 'cla_enviado', nome_autor || ' enviou o clã ' || c.nome || ' para revisão', 'acao/ic-acao-criar-cla');
		if k.mestre_id is not null then
			perform public.notificar(k.mestre_id, 'cla_enviado', nome_autor || ' enviou o clã ' || c.nome || ' para revisão',
				'/campanhas/' || k.id || '/clas/' || c.id, 'status/ic-status-em-revisao');
		end if;
	end if;
	return novo;
end $$;

-- retirar da revisão enquanto o Mestre não decide
create function public.retirar_cla(cla uuid) returns void
language plpgsql security definer set search_path = '' as $$
begin
	update public.clas set status = 'rascunho', enviado_em = null
	where id = cla and autor_id = (select auth.uid()) and status = 'em_revisao';
	if not found then raise exception 'Só dá para retirar clãs em revisão.' using errcode = 'P0001'; end if;
end $$;

-- decisão do Mestre: aprovar, pedir ajustes ou rejeitar (comentário obrigatório nos dois últimos)
create function public.decidir_cla(cla uuid, decisao public.status_cla, comentario text default null) returns void
language plpgsql security definer set search_path = '' as $$
declare
	c public.clas;
	k public.campanhas;
	nome_mestre text;
	frase text;
	icone text;
begin
	select * into c from public.clas where id = cla;
	if c.id is null or not public.eh_mestre(c.campanha_id) then raise exception 'Só o Mestre decide sobre o clã.' using errcode = '42501'; end if;
	if c.status <> 'em_revisao' then raise exception 'Este clã não está em revisão.' using errcode = 'P0001'; end if;
	if decisao not in ('aprovado', 'ajustes', 'rejeitado') then raise exception 'Decisão inválida.' using errcode = 'P0001'; end if;
	if decisao <> 'aprovado' and char_length(trim(coalesce(comentario, ''))) = 0 then
		raise exception 'Explique o que precisa mudar.' using errcode = 'P0001';
	end if;
	select * into k from public.campanhas where id = c.campanha_id;
	if k.arquivada_em is not null then raise exception 'Campanha arquivada é somente leitura.' using errcode = 'P0001'; end if;

	update public.clas set status = decisao, comentario_mestre = nullif(trim(coalesce(comentario, '')), ''), decidido_em = now() where id = c.id;

	select nome into nome_mestre from public.perfis where id = (select auth.uid());
	frase := case decisao when 'aprovado' then ' aprovou o clã ' when 'ajustes' then ' pediu ajustes no clã ' else ' rejeitou o clã ' end;
	icone := case decisao when 'aprovado' then 'status/ic-status-aprovado' when 'ajustes' then 'status/ic-status-ajustes' else 'status/ic-status-rejeitado' end;
	perform public.registrar_atividade(k.id, 'cla_' || decisao::text, coalesce(nome_mestre, 'O Mestre') || frase || c.nome, icone);
	perform public.notificar(c.autor_id, 'cla_' || decisao::text, coalesce(nome_mestre, 'O Mestre') || frase || c.nome,
		'/campanhas/' || k.id || '/clas/' || c.id, icone);
end $$;

-- clã aprovado é somente leitura: editar cria uma nova versão em rascunho (as fichas seguem na versão que usam)
create function public.nova_versao_cla(cla uuid) returns uuid
language plpgsql security definer set search_path = '' as $$
declare
	c public.clas;
	novo uuid;
begin
	select * into c from public.clas where id = cla;
	if c.id is null or c.autor_id is distinct from (select auth.uid()) then raise exception 'Clã não encontrado.' using errcode = '42501'; end if;
	if c.status <> 'aprovado' then raise exception 'Só clãs aprovados ganham nova versão; edite este direto.' using errcode = 'P0001'; end if;
	if not public.campanha_ativa(c.campanha_id) then raise exception 'Campanha arquivada é somente leitura.' using errcode = 'P0001'; end if;
	select id into novo from public.clas where anterior_id = c.id and status in ('rascunho', 'em_revisao', 'ajustes') limit 1;
	if novo is not null then return novo; end if;
	insert into public.clas (campanha_id, autor_id, nome, kkg, versao, anterior_id, dados, resumo)
	values (c.campanha_id, c.autor_id, c.nome, c.kkg, c.versao + 1, c.id, c.dados, c.resumo)
	returning id into novo;
	return novo;
end $$;

-- ---------------------------------------------------------------- personagens: o clã criado da ficha
alter table public.personagens add column cla_id uuid references public.clas (id) on delete set null;
create index personagens_cla on public.personagens (cla_id) where cla_id is not null;

-- a ficha só aponta para um clã da mesma campanha que seja do jogador ou aprovado
create function public.personagem_confere_cla() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
	if new.cla_id is not null and not exists (
		select 1 from public.clas c
		where c.id = new.cla_id and c.campanha_id = new.campanha_id and (c.autor_id = new.jogador_id or c.status = 'aprovado') and c.status <> 'rejeitado'
	) then
		raise exception 'Clã indisponível para esta ficha.' using errcode = 'P0001';
	end if;
	return new;
end $$;
create trigger personagem_confere_cla before insert or update of cla_id on public.personagens
	for each row execute function public.personagem_confere_cla();

-- o resumo público passa a levar nome e brasão do clã criado
create or replace function public.personagens_do_grupo(campanha uuid)
returns table (id uuid, jogador_id uuid, nome text, nivel int, situacao text, resumo jsonb)
language sql stable security definer set search_path = '' as $$
	select p.id, p.jogador_id, p.nome, p.nivel, p.situacao,
		jsonb_build_object('cla', p.resumo -> 'cla', 'claNome', p.resumo -> 'claNome', 'claBrasao', p.resumo -> 'claBrasao',
			'vila', p.resumo -> 'vila', 'conceito', p.resumo -> 'conceito', 'time', p.resumo -> 'time', 'sensei', p.resumo -> 'sensei',
			'elementos', p.resumo -> 'elementos', 'especializacao', p.resumo -> 'especializacao')
	from public.personagens p
	where p.campanha_id = campanha and p.status = 'aprovada' and public.eh_membro(campanha)
	order by p.criada_em;
$$;

-- status do clã que a ficha usa: o envio exige o clã enviado; a aprovação, o clã aprovado
create function public.status_do_cla_da_ficha(p public.personagens) returns public.status_cla
language sql stable security definer set search_path = '' as $$
	select c.status from public.clas c where c.id = p.cla_id;
$$;

create or replace function public.enviar_ficha(ficha uuid) returns public.status_ficha
language plpgsql security definer set search_path = '' as $$
declare
	p public.personagens;
	k public.campanhas;
	novo public.status_ficha;
	nome_jogador text;
	sc public.status_cla;
begin
	select * into p from public.personagens where id = ficha;
	if p.id is null or p.jogador_id is distinct from (select auth.uid()) then raise exception 'Ficha não encontrada.' using errcode = '42501'; end if;
	if p.status not in ('rascunho', 'ajustes') then raise exception 'Esta ficha já foi enviada.' using errcode = 'P0001'; end if;
	if char_length(trim(p.nome)) = 0 then raise exception 'Dê um nome ao personagem antes de enviar.' using errcode = 'P0001'; end if;
	select * into k from public.campanhas where id = p.campanha_id;
	if k.arquivada_em is not null then raise exception 'Campanha arquivada é somente leitura.' using errcode = 'P0001'; end if;
	sc := public.status_do_cla_da_ficha(p);
	if p.cla_id is not null and sc not in ('em_revisao', 'aprovado') then
		raise exception 'Envie o clã para a revisão do Mestre antes da ficha.' using errcode = 'P0001';
	end if;

	-- sem aprovação de fichas, entra direto; mas um clã ainda em revisão segura a ficha com ele
	novo := case when coalesce((k.aprovacao ->> 'fichas')::boolean, true) or (p.cla_id is not null and sc <> 'aprovado') then 'em_revisao' else 'aprovada' end;
	update public.personagens set
		status = novo,
		enviada_em = now(),
		decidida_em = case when novo = 'aprovada' then now() else null end,
		comentario_mestre = case when novo = 'aprovada' then null else comentario_mestre end
	where id = p.id;

	select nome into nome_jogador from public.perfis where id = p.jogador_id;
	if novo = 'aprovada' then
		perform public.inicializar_ficha_aprovada(p.id);
		perform public.registrar_ficha(p.id, 'aprovada', 'Ficha concluída e na mesa', 'status/ic-status-aprovado');
		perform public.registrar_atividade(k.id, 'ficha_aprovada', 'Ficha de ' || p.nome || ' entrou na mesa', 'status/ic-status-aprovado');
	else
		perform public.registrar_ficha(p.id, 'enviada', 'Enviou para revisão', 'papel/ic-papel-jogador');
		perform public.registrar_atividade(k.id, 'ficha_enviada', nome_jogador || ' enviou a ficha de ' || p.nome || ' para revisão', 'acao/ic-acao-criar-personagem');
		if k.mestre_id is not null and k.mestre_id <> p.jogador_id then
			perform public.notificar(k.mestre_id, 'ficha_enviada', nome_jogador || ' enviou a ficha de ' || p.nome || ' para revisão',
				'/campanhas/' || k.id || '/personagens/' || p.id, 'status/ic-status-em-revisao');
		end if;
	end if;
	return novo;
end $$;

create or replace function public.decidir_ficha(ficha uuid, decisao public.status_ficha, comentario text default null) returns void
language plpgsql security definer set search_path = '' as $$
declare
	p public.personagens;
	k public.campanhas;
	nome_mestre text;
	frase text;
	icone text;
begin
	select * into p from public.personagens where id = ficha;
	if p.id is null or not public.eh_mestre(p.campanha_id) then raise exception 'Só o Mestre decide sobre a ficha.' using errcode = '42501'; end if;
	if p.status <> 'em_revisao' then raise exception 'Esta ficha não está em revisão.' using errcode = 'P0001'; end if;
	if decisao not in ('aprovada', 'ajustes', 'rejeitada') then raise exception 'Decisão inválida.' using errcode = 'P0001'; end if;
	if decisao <> 'aprovada' and char_length(trim(coalesce(comentario, ''))) = 0 then
		raise exception 'Explique o que precisa mudar.' using errcode = 'P0001';
	end if;
	if decisao = 'aprovada' and p.cla_id is not null and public.status_do_cla_da_ficha(p) is distinct from 'aprovado' then
		raise exception 'Aprove o clã da ficha antes.' using errcode = 'P0001';
	end if;
	select * into k from public.campanhas where id = p.campanha_id;
	if k.arquivada_em is not null then raise exception 'Campanha arquivada é somente leitura.' using errcode = 'P0001'; end if;

	update public.personagens set status = decisao, comentario_mestre = nullif(trim(coalesce(comentario, '')), ''), decidida_em = now() where id = p.id;
	if decisao = 'aprovada' then perform public.inicializar_ficha_aprovada(p.id); end if;

	select nome into nome_mestre from public.perfis where id = (select auth.uid());
	frase := case decisao when 'aprovada' then ' aprovou a ficha de ' when 'ajustes' then ' pediu ajustes na ficha de ' else ' rejeitou a ficha de ' end;
	icone := case decisao when 'aprovada' then 'status/ic-status-aprovado' when 'ajustes' then 'status/ic-status-ajustes' else 'status/ic-status-rejeitado' end;
	perform public.registrar_ficha(p.id, 'ficha_' || decisao::text,
		case decisao when 'aprovada' then 'Aprovou a ficha' when 'ajustes' then 'Pediu ajustes' else 'Rejeitou a ficha' end, icone);
	perform public.registrar_atividade(k.id, 'ficha_' || decisao::text, coalesce(nome_mestre, 'O Mestre') || frase || p.nome, icone);
	perform public.notificar(p.jogador_id, 'ficha_' || decisao::text, coalesce(nome_mestre, 'O Mestre') || frase || p.nome,
		'/campanhas/' || k.id || '/personagens/' || p.id, icone);
end $$;

-- ---------------------------------------------------------------- acesso
revoke all on public.clas from anon;
grant select, delete on public.clas to authenticated;
grant insert (campanha_id, autor_id, nome, kkg, dados, resumo) on public.clas to authenticated;
grant update (nome, dados, resumo, mensagem) on public.clas to authenticated;
grant insert (cla_id), update (cla_id) on public.personagens to authenticated;
-- o Supabase concede EXECUTE a anon em funções novas; fecha tudo e libera só o necessário
revoke execute on function
	public.campanha_permite_cla(uuid, boolean),
	public.cla_antes_de_atualizar(),
	public.enviar_cla(uuid),
	public.retirar_cla(uuid),
	public.decidir_cla(uuid, public.status_cla, text),
	public.nova_versao_cla(uuid),
	public.personagem_confere_cla(),
	public.status_do_cla_da_ficha(public.personagens),
	public.enviar_ficha(uuid),
	public.decidir_ficha(uuid, public.status_ficha, text)
from public, anon, authenticated;
grant execute on function
	public.campanha_permite_cla(uuid, boolean),
	public.enviar_cla(uuid),
	public.retirar_cla(uuid),
	public.decidir_cla(uuid, public.status_cla, text),
	public.nova_versao_cla(uuid),
	public.enviar_ficha(uuid),
	public.decidir_ficha(uuid, public.status_ficha, text)
to authenticated;
