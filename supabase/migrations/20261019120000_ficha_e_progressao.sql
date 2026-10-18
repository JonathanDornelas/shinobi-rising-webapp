-- Lote 5 · Ficha em jogo, progressão (XP, nível, treino), recompensas do Mestre e registro da ficha.
-- Regras: cap. 9 (recuperação), cap. 17 (níveis e XP), cap. 18 (Pontos de Treino).

-- ---------------------------------------------------------------- personagens: estado em jogo
alter table public.personagens
	add column situacao text not null default 'ativo' check (situacao in ('ativo', 'falecido', 'arquivado')),
	add column estado jsonb not null default '{}'::jsonb,
	add column inventario jsonb,
	add column ryo int not null default 0 check (ryo >= 0),
	add column pt int not null default 0 check (pt >= 0),
	add column epitafio text check (char_length(epitafio) <= 300),
	add column falecido_em timestamptz;

-- uma ficha ativa por jogador: falecidas e arquivadas liberam uma nova
drop index public.personagens_um_por_jogador;
create unique index personagens_um_por_jogador on public.personagens (campanha_id, jogador_id) where status <> 'rejeitada' and situacao = 'ativo';

-- a ficha completa é só do dono e do Mestre; o grupo vê o resumo público por personagens_do_grupo()
drop policy "personagens: dono, Mestre e grupo (aprovadas) leem" on public.personagens;
create policy "personagens: dono e Mestre leem" on public.personagens for select to authenticated using (
	jogador_id = (select auth.uid()) or public.eh_mestre(campanha_id)
);

create function public.personagens_do_grupo(campanha uuid)
returns table (id uuid, jogador_id uuid, nome text, nivel int, situacao text, resumo jsonb)
language sql stable security definer set search_path = '' as $$
	select p.id, p.jogador_id, p.nome, p.nivel, p.situacao,
		jsonb_build_object('cla', p.resumo -> 'cla', 'vila', p.resumo -> 'vila', 'conceito', p.resumo -> 'conceito',
			'time', p.resumo -> 'time', 'sensei', p.resumo -> 'sensei', 'elementos', p.resumo -> 'elementos', 'especializacao', p.resumo -> 'especializacao')
	from public.personagens p
	where p.campanha_id = campanha and p.status = 'aprovada' and public.eh_membro(campanha)
	order by p.criada_em;
$$;

-- XP acumulado para chegar a cada nível (cap. 17)
create function public.xp_do_nivel(n int) returns int
language sql immutable set search_path = '' as $$
	select (array[0, 200, 500, 1000, 1800, 3000, 5000, 8000, 12000, 18000, 26000, 36000, 48000, 62000, 78000, 96000, 116000, 138000, 162000, 188000])[greatest(1, least(n, 20))];
$$;

-- ---------------------------------------------------------------- registro da ficha (aba Registro)
create table public.ficha_registros (
	id bigint generated always as identity primary key,
	personagem_id uuid not null references public.personagens (id) on delete cascade,
	ator_id uuid references public.perfis (id) on delete set null,
	tipo text not null,
	texto text not null,
	icone text not null default 'callout/ic-callout-destaque',
	criado_em timestamptz not null default now()
);
create index ficha_registros_personagem on public.ficha_registros (personagem_id, criado_em desc);
alter table public.ficha_registros enable row level security;
create policy "ficha_registros: dono e Mestre leem" on public.ficha_registros for select to authenticated using (
	exists (select 1 from public.personagens p where p.id = personagem_id and (p.jogador_id = (select auth.uid()) or public.eh_mestre(p.campanha_id)))
);

create function public.registrar_ficha(ficha uuid, tipo text, texto text, icone text) returns void
language sql security definer set search_path = '' as $$
	insert into public.ficha_registros (personagem_id, ator_id, tipo, texto, icone)
	values (ficha, (select id from public.perfis where id = (select auth.uid())), tipo, texto, icone);
$$;

-- confere quem pode mexer na ficha em jogo: dono ou Mestre, ficha aprovada e ativa, campanha não arquivada
create function public.ficha_em_jogo(ficha uuid, so_dono boolean default false) returns public.personagens
language plpgsql stable security definer set search_path = '' as $$
declare
	p public.personagens;
	uid uuid := (select auth.uid());
begin
	select * into p from public.personagens where id = ficha;
	if p.id is null or not (p.jogador_id = uid or (not so_dono and public.eh_mestre(p.campanha_id))) then
		raise exception 'Ficha não encontrada.' using errcode = '42501';
	end if;
	if p.status <> 'aprovada' then raise exception 'A ficha ainda não foi aprovada.' using errcode = 'P0001'; end if;
	if p.situacao <> 'ativo' then raise exception 'Esta ficha não está ativa.' using errcode = 'P0001'; end if;
	if not public.campanha_ativa(p.campanha_id) then raise exception 'Campanha arquivada é somente leitura.' using errcode = 'P0001'; end if;
	return p;
end $$;

-- ---------------------------------------------------------------- aprovação: começa com o XP da campanha, PT e ryo da criação
create or replace function public.inicializar_ficha_aprovada(ficha uuid) returns void
language sql security definer set search_path = '' as $$
	update public.personagens p set
		xp = greatest(p.xp, public.xp_do_nivel(k.nivel_inicial)),
		pt = greatest(0, coalesce((p.resumo ->> 'ptRestantes')::int, 0)),
		ryo = greatest(0, coalesce((p.resumo ->> 'ryo')::int, 0)),
		estado = '{}'::jsonb
	from public.campanhas k
	where p.id = ficha and k.id = p.campanha_id;
$$;

create or replace function public.enviar_ficha(ficha uuid) returns public.status_ficha
language plpgsql security definer set search_path = '' as $$
declare
	p public.personagens;
	k public.campanhas;
	novo public.status_ficha;
	nome_jogador text;
begin
	select * into p from public.personagens where id = ficha;
	if p.id is null or p.jogador_id is distinct from (select auth.uid()) then raise exception 'Ficha não encontrada.' using errcode = '42501'; end if;
	if p.status not in ('rascunho', 'ajustes') then raise exception 'Esta ficha já foi enviada.' using errcode = 'P0001'; end if;
	if char_length(trim(p.nome)) = 0 then raise exception 'Dê um nome ao personagem antes de enviar.' using errcode = 'P0001'; end if;
	select * into k from public.campanhas where id = p.campanha_id;
	if k.arquivada_em is not null then raise exception 'Campanha arquivada é somente leitura.' using errcode = 'P0001'; end if;

	novo := case when coalesce((k.aprovacao ->> 'fichas')::boolean, true) then 'em_revisao' else 'aprovada' end;
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

-- ---------------------------------------------------------------- em jogo: estado, inventário
-- estado: { pv, pc, pe, fadiga, condicoes[], saves {sucessos, falhas}, pd, pic } (ausente = cheio)
create function public.atualizar_estado(ficha uuid, estado jsonb, descricao text) returns void
language plpgsql security definer set search_path = '' as $$
declare
	p public.personagens := public.ficha_em_jogo(ficha);
begin
	if jsonb_typeof(estado) <> 'object' or pg_column_size(estado) > 4000 then raise exception 'Estado inválido.' using errcode = 'P0001'; end if;
	update public.personagens set estado = atualizar_estado.estado where id = p.id;
	if char_length(trim(coalesce(descricao, ''))) > 0 then
		perform public.registrar_ficha(p.id, 'estado', left(descricao, 200), 'recurso/ic-recurso-pv');
	end if;
end $$;

create function public.atualizar_inventario(ficha uuid, inventario jsonb, ryo int, descricao text) returns void
language plpgsql security definer set search_path = '' as $$
declare
	p public.personagens := public.ficha_em_jogo(ficha);
begin
	if jsonb_typeof(inventario) <> 'array' or pg_column_size(inventario) > 20000 then raise exception 'Inventário inválido.' using errcode = 'P0001'; end if;
	if ryo < 0 then raise exception 'Ryo insuficiente.' using errcode = 'P0001'; end if;
	update public.personagens set inventario = atualizar_inventario.inventario, ryo = atualizar_inventario.ryo where id = p.id;
	if char_length(trim(coalesce(descricao, ''))) > 0 then
		perform public.registrar_ficha(p.id, 'inventario', left(descricao, 200), 'equip/ic-equip-kit');
	end if;
end $$;

-- ---------------------------------------------------------------- progressão: subir de nível e treinar (só o dono)
create function public.subir_nivel(ficha uuid, dados jsonb, resumo jsonb, estado jsonb, pt_marcos int default 0) returns int
language plpgsql security definer set search_path = '' as $$
declare
	p public.personagens := public.ficha_em_jogo(ficha, true);
	k public.campanhas;
	novo int := p.nivel + 1;
	nome_jogador text;
begin
	if p.nivel >= 20 then raise exception 'Nível máximo alcançado.' using errcode = 'P0001'; end if;
	if p.xp < public.xp_do_nivel(novo) then raise exception 'XP insuficiente para o nível %.', novo using errcode = 'P0001'; end if;
	if pt_marcos < 0 or pt_marcos > 10 then raise exception 'PT de marcos inválido.' using errcode = 'P0001'; end if;
	update public.personagens set
		nivel = novo,
		pt = pt + 3 + pt_marcos,
		dados = subir_nivel.dados,
		resumo = subir_nivel.resumo,
		estado = subir_nivel.estado
	where id = p.id;
	perform public.registrar_ficha(p.id, 'nivel', 'Subiu para o nível ' || novo, 'acao/ic-acao-subir-nivel');
	select * into k from public.campanhas where id = p.campanha_id;
	perform public.registrar_atividade(k.id, 'nivel', p.nome || ' chegou ao nível ' || novo, 'acao/ic-acao-subir-nivel');
	select nome into nome_jogador from public.perfis where id = p.jogador_id;
	if k.mestre_id is not null and k.mestre_id <> p.jogador_id then
		perform public.notificar(k.mestre_id, 'nivel', p.nome || ' (' || nome_jogador || ') chegou ao nível ' || novo,
			'/campanhas/' || k.id || '/personagens/' || p.id, 'acao/ic-acao-subir-nivel');
	end if;
	return novo;
end $$;

create function public.treinar(ficha uuid, dados jsonb, resumo jsonb, custo int, descricao text) returns int
language plpgsql security definer set search_path = '' as $$
declare
	p public.personagens := public.ficha_em_jogo(ficha, true);
begin
	if custo <= 0 then raise exception 'Nada para treinar.' using errcode = 'P0001'; end if;
	if p.pt < custo then raise exception 'PT insuficientes.' using errcode = 'P0001'; end if;
	update public.personagens set pt = pt - custo, dados = treinar.dados, resumo = treinar.resumo where id = p.id;
	perform public.registrar_ficha(p.id, 'treino', left('Treinou: ' || descricao || ' (−' || custo || ' PT)', 200), 'recurso/ic-recurso-pt');
	return p.pt - custo;
end $$;

-- ---------------------------------------------------------------- pedidos de PT de treino (cap. 18 · sessões de treino)
create table public.pedidos_pt (
	id uuid primary key default gen_random_uuid(),
	personagem_id uuid not null references public.personagens (id) on delete cascade,
	campanha_id uuid not null references public.campanhas (id) on delete cascade,
	autor_id uuid references public.perfis (id) on delete set null default auth.uid(),
	sessao text not null check (sessao in ('solo', 'mentor', 'equipe', 'extremo', 'especializado')),
	semanas int not null check (semanas between 1 and 12),
	pt int not null check (pt between 1 and 30),
	descricao text not null check (char_length(descricao) between 1 and 300),
	status text not null default 'pendente' check (status in ('pendente', 'aprovado', 'recusado')),
	comentario text check (char_length(comentario) <= 500),
	criado_em timestamptz not null default now(),
	decidido_em timestamptz
);
create index pedidos_pt_campanha on public.pedidos_pt (campanha_id, status);
alter table public.pedidos_pt enable row level security;
create policy "pedidos_pt: dono e Mestre leem" on public.pedidos_pt for select to authenticated using (
	autor_id = (select auth.uid()) or public.eh_mestre(campanha_id)
);

-- PT por sessão: solo/equipe 1 por semana, mentor/extremo 2 por semana, especializado 4 ao fim de 1+ mês
create function public.pt_da_sessao(sessao text, semanas int) returns int
language sql immutable set search_path = '' as $$
	select case sessao
		when 'mentor' then 2 * semanas
		when 'extremo' then 2 * semanas
		when 'especializado' then case when semanas >= 4 then 4 else 0 end
		else semanas
	end;
$$;

create function public.solicitar_pt(ficha uuid, sessao text, semanas int, descricao text) returns text
language plpgsql security definer set search_path = '' as $$
declare
	p public.personagens := public.ficha_em_jogo(ficha, true);
	k public.campanhas;
	ganho int := public.pt_da_sessao(sessao, semanas);
	automatico boolean;
	nome_jogador text;
begin
	if ganho <= 0 then raise exception 'Treino especializado exige pelo menos 4 semanas.' using errcode = 'P0001'; end if;
	select * into k from public.campanhas where id = p.campanha_id;
	automatico := not coalesce((k.aprovacao ->> 'treino')::boolean, true);
	insert into public.pedidos_pt (personagem_id, campanha_id, sessao, semanas, pt, descricao, status, decidido_em)
	values (p.id, k.id, sessao, semanas, ganho, trim(descricao), case when automatico then 'aprovado' else 'pendente' end, case when automatico then now() else null end);
	if automatico then
		update public.personagens set pt = pt + ganho where id = p.id;
		perform public.registrar_ficha(p.id, 'pt', left('+' || ganho || ' PT de treino: ' || trim(descricao), 200), 'recurso/ic-recurso-pt');
		return 'aprovado';
	end if;
	perform public.registrar_ficha(p.id, 'pedido_pt', left('Pediu ' || ganho || ' PT de treino: ' || trim(descricao), 200), 'recurso/ic-recurso-pt');
	select nome into nome_jogador from public.perfis where id = p.jogador_id;
	if k.mestre_id is not null and k.mestre_id <> p.jogador_id then
		perform public.notificar(k.mestre_id, 'pedido_pt', nome_jogador || ' pediu ' || ganho || ' PT de treino para ' || p.nome,
			'/campanhas/' || k.id, 'recurso/ic-recurso-pt');
	end if;
	return 'pendente';
end $$;

create function public.decidir_pedido_pt(pedido uuid, aprovar boolean, comentario text default null) returns void
language plpgsql security definer set search_path = '' as $$
declare
	d public.pedidos_pt;
	p public.personagens;
begin
	select * into d from public.pedidos_pt where id = pedido;
	if d.id is null or not public.eh_mestre(d.campanha_id) then raise exception 'Só o Mestre decide.' using errcode = '42501'; end if;
	if d.status <> 'pendente' then raise exception 'Pedido já decidido.' using errcode = 'P0001'; end if;
	update public.pedidos_pt set status = case when aprovar then 'aprovado' else 'recusado' end, comentario = nullif(trim(coalesce(decidir_pedido_pt.comentario, '')), ''), decidido_em = now()
	where id = d.id;
	select * into p from public.personagens where id = d.personagem_id;
	if aprovar then
		update public.personagens set pt = pt + d.pt where id = p.id;
		perform public.registrar_ficha(p.id, 'pt', left('+' || d.pt || ' PT de treino aprovados: ' || d.descricao, 200), 'recurso/ic-recurso-pt');
	end if;
	perform public.notificar(p.jogador_id, 'pedido_pt',
		case when aprovar then 'O Mestre aprovou ' || d.pt || ' PT de treino para ' || p.nome else 'O Mestre recusou o pedido de PT de ' || p.nome end,
		'/campanhas/' || d.campanha_id || '/personagens/' || p.id, case when aprovar then 'status/ic-status-aprovado' else 'status/ic-status-rejeitado' end);
end $$;

-- ---------------------------------------------------------------- C8 · Conceder recompensas
create function public.conceder_recompensa(
	campanha uuid, fichas uuid[], xp int, pt int, ryo int, motivo text, restaurar_pd boolean default false, renovar_pic boolean default false
) returns int
language plpgsql security definer set search_path = '' as $$
declare
	p public.personagens;
	n int := 0;
	partes text[];
	frase text;
	nome_mestre text;
begin
	if not public.eh_mestre(campanha) then raise exception 'Só o Mestre concede recompensas.' using errcode = '42501'; end if;
	if not public.campanha_ativa(campanha) then raise exception 'Campanha arquivada é somente leitura.' using errcode = 'P0001'; end if;
	if xp < 0 or pt < 0 or ryo < 0 or xp > 100000 or pt > 100 or ryo > 10000000 then raise exception 'Valores inválidos.' using errcode = 'P0001'; end if;
	if char_length(trim(coalesce(motivo, ''))) = 0 then raise exception 'Diga o motivo da recompensa.' using errcode = 'P0001'; end if;
	partes := array_remove(array[
		case when xp > 0 then xp || ' XP' end,
		case when pt > 0 then pt || ' PT' end,
		case when ryo > 0 then ryo || ' ryo' end,
		case when restaurar_pd then '1 PD' end,
		case when renovar_pic then 'PIC renovados' end
	], null);
	if array_length(partes, 1) is null then raise exception 'Nada para conceder.' using errcode = 'P0001'; end if;
	frase := array_to_string(partes, ', ');
	select nome into nome_mestre from public.perfis where id = (select auth.uid());

	for p in select * from public.personagens where campanha_id = campanha and id = any(fichas) and status = 'aprovada' and situacao = 'ativo' loop
		update public.personagens set
			xp = public.personagens.xp + conceder_recompensa.xp,
			pt = public.personagens.pt + conceder_recompensa.pt,
			ryo = public.personagens.ryo + conceder_recompensa.ryo,
			estado = public.personagens.estado
				|| case when restaurar_pd then jsonb_build_object('pd', 1) else '{}'::jsonb end
				|| case when renovar_pic then jsonb_build_object('pic', null) else '{}'::jsonb end
		where id = p.id;
		perform public.registrar_ficha(p.id, 'recompensa', left(frase || ' · ' || trim(motivo), 200), 'acao/ic-acao-conceder');
		perform public.notificar(p.jogador_id, 'recompensa', coalesce(nome_mestre, 'O Mestre') || ' concedeu ' || frase || ' a ' || p.nome,
			'/campanhas/' || campanha || '/personagens/' || p.id, 'acao/ic-acao-conceder');
		if p.nivel < 20 and p.xp < public.xp_do_nivel(p.nivel + 1) and p.xp + xp >= public.xp_do_nivel(p.nivel + 1) then
			perform public.notificar(p.jogador_id, 'nivel_disponivel', p.nome || ' pode subir para o nível ' || (p.nivel + 1),
				'/campanhas/' || campanha || '/personagens/' || p.id || '/nivel', 'acao/ic-acao-subir-nivel');
		end if;
		n := n + 1;
	end loop;
	if n = 0 then raise exception 'Nenhum personagem ativo selecionado.' using errcode = 'P0001'; end if;
	perform public.registrar_atividade(campanha, 'recompensa', 'Recompensas: ' || frase || ' para ' || n || case when n = 1 then ' personagem' else ' personagens' end || ' · ' || left(trim(motivo), 80), 'acao/ic-acao-conceder');
	return n;
end $$;

-- ---------------------------------------------------------------- situação: falecido (Mestre), arquivado/ativo (dono ou Mestre)
create function public.definir_situacao(ficha uuid, situacao text, epitafio text default null) returns void
language plpgsql security definer set search_path = '' as $$
declare
	p public.personagens;
	mestre boolean;
begin
	select * into p from public.personagens where id = ficha;
	if p.id is null then raise exception 'Ficha não encontrada.' using errcode = '42501'; end if;
	mestre := public.eh_mestre(p.campanha_id);
	if not mestre and p.jogador_id is distinct from (select auth.uid()) then raise exception 'Ficha não encontrada.' using errcode = '42501'; end if;
	if situacao not in ('ativo', 'falecido', 'arquivado') then raise exception 'Situação inválida.' using errcode = 'P0001'; end if;
	if (situacao = 'falecido' or p.situacao = 'falecido') and not mestre then raise exception 'Só o Mestre decide sobre a morte de um personagem.' using errcode = '42501'; end if;
	if p.status <> 'aprovada' then raise exception 'Só fichas aprovadas mudam de situação.' using errcode = 'P0001'; end if;
	if not public.campanha_ativa(p.campanha_id) then raise exception 'Campanha arquivada é somente leitura.' using errcode = 'P0001'; end if;
	update public.personagens set
		situacao = definir_situacao.situacao,
		epitafio = case when definir_situacao.situacao = 'falecido' then nullif(trim(coalesce(definir_situacao.epitafio, '')), '') else null end,
		falecido_em = case when definir_situacao.situacao = 'falecido' then now() else null end
	where id = p.id;
	perform public.registrar_ficha(p.id, 'situacao',
		case situacao when 'falecido' then 'Faleceu' when 'arquivado' then 'Ficha arquivada' else 'Ficha reativada' end,
		case situacao when 'falecido' then 'status/ic-status-revogado' else 'status/ic-status-rascunho' end);
	if situacao = 'falecido' then
		perform public.registrar_atividade(p.campanha_id, 'falecido', p.nome || ' faleceu', 'status/ic-status-revogado');
		perform public.notificar(p.jogador_id, 'falecido', p.nome || ' entrou para o memorial da campanha', '/campanhas/' || p.campanha_id || '/personagens/' || p.id, 'status/ic-status-revogado');
	end if;
end $$;

-- ---------------------------------------------------------------- acesso
revoke all on public.ficha_registros, public.pedidos_pt from anon;
grant select on public.ficha_registros, public.pedidos_pt to authenticated;
revoke execute on function
	public.personagens_do_grupo(uuid),
	public.xp_do_nivel(int),
	public.registrar_ficha(uuid, text, text, text),
	public.ficha_em_jogo(uuid, boolean),
	public.inicializar_ficha_aprovada(uuid),
	public.enviar_ficha(uuid),
	public.decidir_ficha(uuid, public.status_ficha, text),
	public.atualizar_estado(uuid, jsonb, text),
	public.atualizar_inventario(uuid, jsonb, int, text),
	public.subir_nivel(uuid, jsonb, jsonb, jsonb, int),
	public.treinar(uuid, jsonb, jsonb, int, text),
	public.pt_da_sessao(text, int),
	public.solicitar_pt(uuid, text, int, text),
	public.decidir_pedido_pt(uuid, boolean, text),
	public.conceder_recompensa(uuid, uuid[], int, int, int, text, boolean, boolean),
	public.definir_situacao(uuid, text, text)
from public, anon, authenticated;
grant execute on function
	public.personagens_do_grupo(uuid),
	public.xp_do_nivel(int),
	public.enviar_ficha(uuid),
	public.decidir_ficha(uuid, public.status_ficha, text),
	public.atualizar_estado(uuid, jsonb, text),
	public.atualizar_inventario(uuid, jsonb, int, text),
	public.subir_nivel(uuid, jsonb, jsonb, jsonb, int),
	public.treinar(uuid, jsonb, jsonb, int, text),
	public.pt_da_sessao(text, int),
	public.solicitar_pt(uuid, text, int, text),
	public.decidir_pedido_pt(uuid, boolean, text),
	public.conceder_recompensa(uuid, uuid[], int, int, int, text, boolean, boolean),
	public.definir_situacao(uuid, text, text)
to authenticated;
