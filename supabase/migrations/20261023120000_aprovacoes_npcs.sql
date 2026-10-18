-- Lote 9 · Central de aprovações (exceção do Mestre), NPCs (cap. 23.2), personagens pré-gerados e o Mestre concedendo
-- jutsus e itens a uma ficha, de graça ou cobrando.

-- ---------------------------------------------------------------- exceção do Mestre
-- Aprovar algo com bloqueio nas verificações deixa uma justificativa visível a todos ("Exceção do Mestre").
alter table public.personagens add column excecao text check (char_length(excecao) <= 500);
alter table public.clas add column excecao text check (char_length(excecao) <= 500);
alter table public.jutsus_criados add column excecao text check (char_length(excecao) <= 500);
alter table public.equipamentos_criados add column excecao text check (char_length(excecao) <= 500);

create function public.registrar_excecao(tipo text, alvo uuid, justificativa text) returns void
language plpgsql security definer set search_path = '' as $$
declare
	k uuid;
	autor uuid;
	nome text;
	j text := trim(coalesce(justificativa, ''));
begin
	if char_length(j) = 0 then raise exception 'Escreva a justificativa da exceção.' using errcode = 'P0001'; end if;
	if tipo = 'ficha' then
		select campanha_id, jogador_id, personagens.nome into k, autor, nome from public.personagens where id = alvo and status = 'aprovada';
	elsif tipo = 'cla' then
		select campanha_id, autor_id, clas.nome into k, autor, nome from public.clas where id = alvo and status = 'aprovado';
	elsif tipo = 'jutsu' then
		select campanha_id, autor_id, jutsus_criados.nome into k, autor, nome from public.jutsus_criados where id = alvo and status = 'aprovado';
	elsif tipo = 'equipamento' then
		select campanha_id, autor_id, equipamentos_criados.nome into k, autor, nome from public.equipamentos_criados where id = alvo and status = 'aprovado';
	else
		raise exception 'Tipo inválido.' using errcode = 'P0001';
	end if;
	if k is null or not public.eh_mestre(k) then raise exception 'Só o Mestre registra exceções do que já aprovou.' using errcode = '42501'; end if;
	if tipo = 'ficha' then update public.personagens set excecao = j where id = alvo;
	elsif tipo = 'cla' then update public.clas set excecao = j where id = alvo;
	elsif tipo = 'jutsu' then update public.jutsus_criados set excecao = j where id = alvo;
	else update public.equipamentos_criados set excecao = j where id = alvo;
	end if;
	perform public.registrar_atividade(k, 'excecao', 'Exceção do Mestre em ' || nome || ': ' || left(j, 120), 'status/ic-status-excecao-mestre');
end $$;

-- ---------------------------------------------------------------- NPCs (ficha resumida, cap. 23.2)
create table public.npcs (
	id uuid primary key default gen_random_uuid(),
	campanha_id uuid not null references public.campanhas (id) on delete cascade,
	nome text not null default '' check (char_length(nome) <= 60),
	funcao text not null default '' check (char_length(funcao) <= 120),
	origem text not null default '' check (char_length(origem) <= 60),
	aparencia text not null default '' check (char_length(aparencia) <= 300),
	rank text not null default 'chunin' check (rank in ('genin', 'chunin', 'jounin', 'anbu', 'lendario')),
	pv int not null default 45 check (pv between 1 and 9999),
	pc int not null default 40 check (pc between 0 and 9999),
	defesa int not null default 14 check (defesa between 0 and 99),
	iniciativa int not null default 0 check (iniciativa between -10 and 50),
	ataque text not null default '' check (char_length(ataque) <= 120),
	especial text not null default '' check (char_length(especial) <= 300),
	tags text[] not null default '{}' check (cardinality(tags) <= 3),
	quer text not null default '' check (char_length(quer) <= 300),
	segredo text not null default '' check (char_length(segredo) <= 300),
	notas text not null default '' check (char_length(notas) <= 2000),
	revelado boolean not null default false,
	-- tropa genérica: quantos membros com as mesmas estatísticas; pv_atual guarda o PV de cada um em combate
	membros int not null default 1 check (membros between 1 and 20),
	pv_atual int[] not null default '{}',
	criado_em timestamptz not null default now(),
	atualizado_em timestamptz not null default now()
);
create index npcs_campanha on public.npcs (campanha_id);
alter table public.npcs enable row level security;
create policy "npcs: só o Mestre" on public.npcs for all to authenticated
	using (public.eh_mestre(campanha_id)) with check (public.eh_mestre(campanha_id) and public.campanha_ativa(campanha_id));

create function public.npc_antes_de_salvar() returns trigger
language plpgsql set search_path = '' as $$
begin
	new.atualizado_em := now();
	return new;
end $$;
create trigger npc_antes_de_salvar before update on public.npcs for each row execute function public.npc_antes_de_salvar();

-- o que o grupo vê de um NPC revelado (sem segredo, notas nem números)
create function public.npcs_revelados(campanha uuid)
returns table (id uuid, nome text, funcao text, origem text, aparencia text, rank text, tags text[])
language sql stable security definer set search_path = '' as $$
	select n.id, n.nome, n.funcao, n.origem, n.aparencia, n.rank, n.tags
	from public.npcs n
	where n.campanha_id = campanha and n.revelado and public.eh_membro(campanha)
	order by n.nome;
$$;

-- ---------------------------------------------------------------- personagens pré-gerados
alter table public.personagens add column pre_gerado boolean not null default false;
drop index public.personagens_um_por_jogador;
create unique index personagens_um_por_jogador on public.personagens (campanha_id, jogador_id)
	where status <> 'rejeitada' and situacao = 'ativo' and not pre_gerado;

-- só o Mestre cria pré-gerados (no próprio nome, até alguém assumir)
create function public.personagem_confere_pre_gerado() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
	if new.pre_gerado and (tg_op = 'INSERT' or not old.pre_gerado) and not exists (
		select 1 from public.campanhas k where k.id = new.campanha_id and k.mestre_id = new.jogador_id
	) then
		raise exception 'Só o Mestre cria personagens pré-gerados.' using errcode = '42501';
	end if;
	return new;
end $$;
create trigger personagem_confere_pre_gerado before insert or update of pre_gerado on public.personagens
	for each row execute function public.personagem_confere_pre_gerado();

-- o grupo vê os pré-gerados aprovados (para assumir) junto das fichas do grupo
drop function public.personagens_do_grupo(uuid);
create function public.personagens_do_grupo(campanha uuid)
returns table (id uuid, jogador_id uuid, nome text, nivel int, situacao text, pre_gerado boolean, resumo jsonb)
language sql stable security definer set search_path = '' as $$
	select p.id, p.jogador_id, p.nome, p.nivel, p.situacao, p.pre_gerado,
		jsonb_build_object('cla', p.resumo -> 'cla', 'claNome', p.resumo -> 'claNome', 'claBrasao', p.resumo -> 'claBrasao',
			'vila', p.resumo -> 'vila', 'conceito', p.resumo -> 'conceito', 'time', p.resumo -> 'time', 'sensei', p.resumo -> 'sensei',
			'elementos', p.resumo -> 'elementos', 'especializacao', p.resumo -> 'especializacao')
	from public.personagens p
	where p.campanha_id = campanha and p.status = 'aprovada' and public.eh_membro(campanha)
	order by p.criada_em;
$$;

-- pré-gerado entra aprovado no envio (é do próprio Mestre)
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

	novo := case
		when p.cla_id is not null and sc <> 'aprovado' then 'em_revisao'
		when p.pre_gerado or k.mestre_id = p.jogador_id then 'aprovada'
		when coalesce((k.aprovacao ->> 'fichas')::boolean, true) then 'em_revisao'
		else 'aprovada'
	end;
	update public.personagens set
		status = novo,
		enviada_em = now(),
		decidida_em = case when novo = 'aprovada' then now() else null end,
		comentario_mestre = case when novo = 'aprovada' then null else comentario_mestre end
	where id = p.id;

	select nome into nome_jogador from public.perfis where id = p.jogador_id;
	if novo = 'aprovada' then
		perform public.inicializar_ficha_aprovada(p.id);
		perform public.registrar_ficha(p.id, 'aprovada', case when p.pre_gerado then 'Pré-gerado pronto para a mesa' else 'Ficha concluída e na mesa' end, 'status/ic-status-aprovado');
		perform public.registrar_atividade(k.id, 'ficha_aprovada', case when p.pre_gerado then 'Pré-gerado ' || p.nome || ' disponível para o grupo' else 'Ficha de ' || p.nome || ' entrou na mesa' end, 'status/ic-status-aprovado');
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

-- o jogador sem ficha ativa assume um pré-gerado aprovado
create function public.assumir_pre_gerado(ficha uuid) returns void
language plpgsql security definer set search_path = '' as $$
declare
	p public.personagens;
	k public.campanhas;
	uid uuid := (select auth.uid());
	nome_jogador text;
begin
	select * into p from public.personagens where id = ficha for update;
	if p.id is null or not p.pre_gerado or p.status <> 'aprovada' or p.situacao <> 'ativo' then raise exception 'Este pré-gerado não está disponível.' using errcode = 'P0001'; end if;
	if not public.eh_membro(p.campanha_id) then raise exception 'Você não faz parte desta campanha.' using errcode = '42501'; end if;
	select * into k from public.campanhas where id = p.campanha_id;
	if k.arquivada_em is not null then raise exception 'Campanha arquivada é somente leitura.' using errcode = 'P0001'; end if;
	if k.mestre_id = uid then raise exception 'O Mestre não assume pré-gerados.' using errcode = 'P0001'; end if;
	if exists (select 1 from public.personagens x where x.campanha_id = p.campanha_id and x.jogador_id = uid and x.status <> 'rejeitada' and x.situacao = 'ativo' and not x.pre_gerado) then
		raise exception 'Você já tem uma ficha ativa nesta campanha.' using errcode = 'P0001';
	end if;
	update public.personagens set jogador_id = uid, pre_gerado = false where id = p.id;
	select nome into nome_jogador from public.perfis where id = uid;
	perform public.registrar_ficha(p.id, 'assumido', coalesce(nome_jogador, 'Um jogador') || ' assumiu o pré-gerado', 'papel/ic-papel-jogador');
	perform public.registrar_atividade(k.id, 'pre_gerado', coalesce(nome_jogador, 'Um jogador') || ' assumiu ' || p.nome, 'acao/ic-acao-criar-personagem');
	if k.mestre_id is not null then
		perform public.notificar(k.mestre_id, 'pre_gerado', coalesce(nome_jogador, 'Um jogador') || ' assumiu o pré-gerado ' || p.nome, '/campanhas/' || k.id || '/personagens/' || p.id, 'papel/ic-papel-jogador');
	end if;
end $$;

-- ---------------------------------------------------------------- o Mestre concede a uma ficha
-- itens esperando ir para o inventário (a ficha os põe lá ao abrir, como as encomendas)
alter table public.personagens add column entregas jsonb not null default '[]'::jsonb;

create function public.ficha_do_mestre(ficha uuid) returns public.personagens
language plpgsql stable security definer set search_path = '' as $$
declare
	p public.personagens;
begin
	select * into p from public.personagens where id = ficha;
	if p.id is null or not public.eh_mestre(p.campanha_id) then raise exception 'Só o Mestre concede.' using errcode = '42501'; end if;
	if p.status <> 'aprovada' or p.situacao <> 'ativo' or p.pre_gerado then raise exception 'A ficha precisa estar aprovada, ativa e com um jogador.' using errcode = 'P0001'; end if;
	if not public.campanha_ativa(p.campanha_id) then raise exception 'Campanha arquivada é somente leitura.' using errcode = 'P0001'; end if;
	return p;
end $$;

-- jutsu concedido: entra nos treinos da ficha (como se aprendido), cobrando PT ou não
create function public.conceder_jutsu(ficha uuid, slug text, nome text, custo_pt int default 0) returns void
language plpgsql security definer set search_path = '' as $$
declare
	p public.personagens := public.ficha_do_mestre(ficha);
	treinos jsonb;
begin
	if custo_pt < 0 then raise exception 'Custo inválido.' using errcode = 'P0001'; end if;
	if p.pt < custo_pt then raise exception '% tem % PT; o jutsu custa %.', p.nome, p.pt, custo_pt using errcode = 'P0001'; end if;
	treinos := coalesce(p.dados -> 'progresso' -> 'treinos', '[]'::jsonb);
	if exists (select 1 from jsonb_array_elements(treinos) t where t ->> 'tipo' = 'jutsu' and t ->> 'slug' = slug) then
		raise exception '% já conhece este jutsu.', p.nome using errcode = 'P0001';
	end if;
	update public.personagens set
		pt = p.pt - custo_pt,
		dados = coalesce(p.dados, '{}'::jsonb) || jsonb_build_object('progresso',
			coalesce(p.dados -> 'progresso', '{}'::jsonb) || jsonb_build_object('treinos', treinos || jsonb_build_array(jsonb_build_object('tipo', 'jutsu', 'slug', slug, 'pt', custo_pt))))
	where id = p.id;
	perform public.registrar_ficha(p.id, 'concedido', left('O Mestre concedeu o jutsu ' || nome || case when custo_pt > 0 then ' (−' || custo_pt || ' PT)' else '' end, 200), 'acao/ic-acao-conceder');
	perform public.notificar(p.jogador_id, 'concedido', left('O Mestre concedeu o jutsu ' || nome || ' a ' || p.nome, 200), '/campanhas/' || p.campanha_id || '/personagens/' || p.id, 'acao/ic-acao-conceder');
end $$;

-- item concedido: fica nas entregas da ficha até ela abrir, cobrando ryo ou não
create function public.conceder_item(ficha uuid, item jsonb, custo_ryo int default 0) returns void
language plpgsql security definer set search_path = '' as $$
declare
	p public.personagens := public.ficha_do_mestre(ficha);
	nome text := left(coalesce(item ->> 'nome', 'item'), 60);
begin
	if custo_ryo < 0 then raise exception 'Custo inválido.' using errcode = 'P0001'; end if;
	if p.ryo < custo_ryo then raise exception '% tem % ryo; o item custa %.', p.nome, p.ryo, custo_ryo using errcode = 'P0001'; end if;
	update public.personagens set ryo = p.ryo - custo_ryo, entregas = p.entregas || jsonb_build_array(item) where id = p.id;
	perform public.registrar_ficha(p.id, 'concedido', left('O Mestre concedeu ' || nome || case when custo_ryo > 0 then ' (−' || custo_ryo || ' ryo)' else '' end, 200), 'acao/ic-acao-conceder');
	perform public.notificar(p.jogador_id, 'concedido', left('O Mestre concedeu ' || nome || ' a ' || p.nome, 200), '/campanhas/' || p.campanha_id || '/personagens/' || p.id, 'acao/ic-acao-conceder');
end $$;

-- a ficha recebe as entregas no inventário (dono ou Mestre)
create function public.receber_entregas(ficha uuid, inventario jsonb) returns void
language plpgsql security definer set search_path = '' as $$
declare
	p public.personagens := public.ficha_em_jogo(ficha);
begin
	update public.personagens set inventario = receber_entregas.inventario, entregas = '[]'::jsonb where id = p.id;
end $$;

-- ---------------------------------------------------------------- acesso
revoke all on public.npcs from anon;
grant select, insert, update, delete on public.npcs to authenticated;
grant insert (pre_gerado) on public.personagens to authenticated;
revoke execute on function
	public.registrar_excecao(text, uuid, text),
	public.npc_antes_de_salvar(),
	public.npcs_revelados(uuid),
	public.personagem_confere_pre_gerado(),
	public.personagens_do_grupo(uuid),
	public.enviar_ficha(uuid),
	public.assumir_pre_gerado(uuid),
	public.ficha_do_mestre(uuid),
	public.conceder_jutsu(uuid, text, text, int),
	public.conceder_item(uuid, jsonb, int),
	public.receber_entregas(uuid, jsonb)
from public, anon, authenticated;
grant execute on function
	public.registrar_excecao(text, uuid, text),
	public.npcs_revelados(uuid),
	public.personagens_do_grupo(uuid),
	public.enviar_ficha(uuid),
	public.assumir_pre_gerado(uuid),
	public.conceder_jutsu(uuid, text, text, int),
	public.conceder_item(uuid, jsonb, int),
	public.receber_entregas(uuid, jsonb)
to authenticated;
