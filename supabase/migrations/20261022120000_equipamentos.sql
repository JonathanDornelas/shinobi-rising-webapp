-- Lote 8 · Armas forjadas (cap. 21), marionetes (cap. 13) e itens utilitários criados (cap. 11), com a revisão do Mestre.
-- Mesmo molde dos clãs e jutsus. A campanha decide se armas, itens e marionetes exigem aprovação (C2/C7); o que o
-- próprio Mestre cria entra aprovado. Arma ou marionete encomendada para uma ficha: na aprovação, o ryo sai da ficha e
-- o objeto fica pendente de entrega; a ficha o coloca no inventário (receber_equipamentos) na próxima vez que abrir.

create table public.equipamentos_criados (
	id uuid primary key default gen_random_uuid(),
	campanha_id uuid not null references public.campanhas (id) on delete cascade,
	autor_id uuid not null references public.perfis (id) on delete cascade,
	tipo text not null check (tipo in ('arma', 'item', 'marionete')),
	personagem_id uuid references public.personagens (id) on delete set null,
	nome text not null default '' check (char_length(nome) <= 60),
	custo int not null default 0 check (custo >= 0),
	status public.status_criacao not null default 'rascunho',
	versao int not null default 1 check (versao >= 1),
	anterior_id uuid references public.equipamentos_criados (id) on delete set null,
	dados jsonb not null default '{}'::jsonb,
	resumo jsonb not null default '{}'::jsonb,
	mensagem text check (char_length(mensagem) <= 2000),
	comentario_mestre text check (char_length(comentario_mestre) <= 2000),
	entregue boolean not null default false,
	enviado_em timestamptz,
	decidido_em timestamptz,
	criado_em timestamptz not null default now(),
	atualizado_em timestamptz not null default now()
);
create index equipamentos_criados_campanha on public.equipamentos_criados (campanha_id, status);
create index equipamentos_criados_personagem on public.equipamentos_criados (personagem_id) where personagem_id is not null;

alter table public.equipamentos_criados enable row level security;
create policy "equipamentos_criados: autor, Mestre e grupo (aprovados) leem" on public.equipamentos_criados for select to authenticated using (
	autor_id = (select auth.uid()) or public.eh_mestre(campanha_id) or (status = 'aprovado' and public.eh_membro(campanha_id))
);
create policy "equipamentos_criados: membro cria o próprio" on public.equipamentos_criados for insert to authenticated with check (
	autor_id = (select auth.uid()) and status = 'rascunho' and versao = 1 and anterior_id is null
	and public.eh_membro(campanha_id) and public.campanha_ativa(campanha_id)
);
create policy "equipamentos_criados: autor edita rascunho ou ajustes" on public.equipamentos_criados for update to authenticated
	using (autor_id = (select auth.uid()) and status in ('rascunho', 'ajustes') and public.campanha_ativa(campanha_id))
	with check (autor_id = (select auth.uid()));
create policy "equipamentos_criados: autor apaga rascunho" on public.equipamentos_criados for delete to authenticated
	using (autor_id = (select auth.uid()) and status = 'rascunho');

-- a encomenda só vai para uma ficha da mesma campanha que seja do autor (ou qualquer ficha, se o autor é o Mestre)
create function public.equipamento_confere_vinculos() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
	new.atualizado_em := now();
	if new.personagem_id is not null and not exists (
		select 1 from public.personagens p join public.campanhas k on k.id = p.campanha_id
		where p.id = new.personagem_id and p.campanha_id = new.campanha_id and (p.jogador_id = new.autor_id or k.mestre_id = new.autor_id)
	) then
		raise exception 'Ficha indisponível para esta encomenda.' using errcode = 'P0001';
	end if;
	if new.tipo = 'item' then new.personagem_id := null; end if;
	return new;
end $$;
create trigger equipamento_confere_vinculos before insert or update on public.equipamentos_criados
	for each row execute function public.equipamento_confere_vinculos();

-- aprova: cobra o ryo da ficha da encomenda (se houver) e registra na ficha
create function public.aprovar_equipamento(e public.equipamentos_criados) returns void
language plpgsql security definer set search_path = '' as $$
declare
	p public.personagens;
begin
	if e.personagem_id is not null and e.tipo <> 'item' then
		select * into p from public.personagens where id = e.personagem_id for update;
		if p.status <> 'aprovada' or p.situacao <> 'ativo' then raise exception 'A ficha da encomenda precisa estar aprovada e ativa.' using errcode = 'P0001'; end if;
		if p.ryo < e.custo then
			raise exception '% tem % ryo; a encomenda custa %.', p.nome, p.ryo, e.custo using errcode = 'P0001';
		end if;
		update public.personagens set ryo = ryo - e.custo where id = p.id;
		perform public.registrar_ficha(p.id, 'equipamento', 'Recebeu ' || e.nome || ' (−' || e.custo || ' ryo)', case when e.tipo = 'arma' then 'acao/ic-acao-forjar' else 'acao/ic-acao-construir-marionete' end);
	end if;
	update public.equipamentos_criados set status = 'aprovado', decidido_em = now(), comentario_mestre = null, entregue = false where id = e.id;
end $$;

create function public.enviar_equipamento(equipamento uuid) returns public.status_criacao
language plpgsql security definer set search_path = '' as $$
declare
	e public.equipamentos_criados;
	k public.campanhas;
	direto boolean;
	nome_autor text;
	oque text;
begin
	select * into e from public.equipamentos_criados where id = equipamento;
	if e.id is null or e.autor_id is distinct from (select auth.uid()) then raise exception 'Equipamento não encontrado.' using errcode = '42501'; end if;
	if e.status not in ('rascunho', 'ajustes') then raise exception 'Já foi enviado.' using errcode = 'P0001'; end if;
	if char_length(trim(e.nome)) < 2 then raise exception 'Dê um nome antes de enviar.' using errcode = 'P0001'; end if;
	select * into k from public.campanhas where id = e.campanha_id;
	if k.arquivada_em is not null then raise exception 'Campanha arquivada é somente leitura.' using errcode = 'P0001'; end if;

	direto := k.mestre_id = e.autor_id
		or not coalesce((k.aprovacao ->> (case e.tipo when 'arma' then 'armas' when 'item' then 'itens' else 'marionetes' end))::boolean, true);
	update public.equipamentos_criados set enviado_em = now() where id = e.id;
	oque := case e.tipo when 'arma' then 'a arma ' when 'item' then 'o item ' else 'a marionete ' end;
	if direto then
		perform public.aprovar_equipamento(e);
		perform public.registrar_atividade(k.id, 'equipamento_aprovado', initcap(left(oque, 1)) || substr(oque, 2) || e.nome || ' entrou na biblioteca da campanha', 'nav/ic-nav-equipamentos');
		return 'aprovado';
	end if;
	update public.equipamentos_criados set status = 'em_revisao', decidido_em = null where id = e.id;
	select nome into nome_autor from public.perfis where id = e.autor_id;
	perform public.registrar_atividade(k.id, 'equipamento_enviado', nome_autor || ' enviou ' || oque || e.nome || ' para revisão', 'nav/ic-nav-equipamentos');
	if k.mestre_id is not null then
		perform public.notificar(k.mestre_id, 'equipamento_enviado', nome_autor || ' enviou ' || oque || e.nome || ' para revisão',
			'/campanhas/' || k.id || '/equipamentos/' || e.id, 'status/ic-status-em-revisao');
	end if;
	return 'em_revisao';
end $$;

create function public.retirar_equipamento(equipamento uuid) returns void
language plpgsql security definer set search_path = '' as $$
begin
	update public.equipamentos_criados set status = 'rascunho', enviado_em = null
	where id = equipamento and autor_id = (select auth.uid()) and status = 'em_revisao';
	if not found then raise exception 'Só dá para retirar o que está em revisão.' using errcode = 'P0001'; end if;
end $$;

create function public.decidir_equipamento(equipamento uuid, decisao public.status_criacao, comentario text default null) returns void
language plpgsql security definer set search_path = '' as $$
declare
	e public.equipamentos_criados;
	k public.campanhas;
	nome_mestre text;
	frase text;
	icone text;
	oque text;
begin
	select * into e from public.equipamentos_criados where id = equipamento;
	if e.id is null or not public.eh_mestre(e.campanha_id) then raise exception 'Só o Mestre decide.' using errcode = '42501'; end if;
	if e.status <> 'em_revisao' then raise exception 'Não está em revisão.' using errcode = 'P0001'; end if;
	if decisao not in ('aprovado', 'ajustes', 'rejeitado') then raise exception 'Decisão inválida.' using errcode = 'P0001'; end if;
	if decisao <> 'aprovado' and char_length(trim(coalesce(comentario, ''))) = 0 then
		raise exception 'Explique o que precisa mudar.' using errcode = 'P0001';
	end if;
	select * into k from public.campanhas where id = e.campanha_id;
	if k.arquivada_em is not null then raise exception 'Campanha arquivada é somente leitura.' using errcode = 'P0001'; end if;

	if decisao = 'aprovado' then
		perform public.aprovar_equipamento(e);
		update public.equipamentos_criados set comentario_mestre = nullif(trim(coalesce(comentario, '')), '') where id = e.id;
	else
		update public.equipamentos_criados set status = decisao, comentario_mestre = trim(comentario), decidido_em = now() where id = e.id;
	end if;

	oque := case e.tipo when 'arma' then 'a arma ' when 'item' then 'o item ' else 'a marionete ' end;
	select nome into nome_mestre from public.perfis where id = (select auth.uid());
	frase := case decisao when 'aprovado' then ' aprovou ' when 'ajustes' then ' pediu ajustes ' else ' rejeitou ' end;
	if decisao = 'ajustes' then oque := case e.tipo when 'arma' then 'na arma ' when 'item' then 'no item ' else 'na marionete ' end; end if;
	icone := case decisao when 'aprovado' then 'status/ic-status-aprovado' when 'ajustes' then 'status/ic-status-ajustes' else 'status/ic-status-rejeitado' end;
	perform public.registrar_atividade(k.id, 'equipamento_' || decisao::text, coalesce(nome_mestre, 'O Mestre') || frase || oque || e.nome, icone);
	perform public.notificar(e.autor_id, 'equipamento_' || decisao::text, coalesce(nome_mestre, 'O Mestre') || frase || oque || e.nome,
		'/campanhas/' || k.id || '/equipamentos/' || e.id, icone);
end $$;

create function public.nova_versao_equipamento(equipamento uuid) returns uuid
language plpgsql security definer set search_path = '' as $$
declare
	e public.equipamentos_criados;
	novo uuid;
begin
	select * into e from public.equipamentos_criados where id = equipamento;
	if e.id is null or e.autor_id is distinct from (select auth.uid()) then raise exception 'Equipamento não encontrado.' using errcode = '42501'; end if;
	if e.status <> 'aprovado' then raise exception 'Só o que foi aprovado ganha nova versão.' using errcode = 'P0001'; end if;
	if e.tipo <> 'item' then raise exception 'Armas e marionetes entregues não mudam; forje ou construa outra.' using errcode = 'P0001'; end if;
	select id into novo from public.equipamentos_criados where anterior_id = e.id and status in ('rascunho', 'em_revisao', 'ajustes') limit 1;
	if novo is not null then return novo; end if;
	insert into public.equipamentos_criados (campanha_id, autor_id, tipo, nome, custo, versao, anterior_id, dados, resumo)
	values (e.campanha_id, e.autor_id, e.tipo, e.nome, e.custo, e.versao + 1, e.id, e.dados, e.resumo)
	returning id into novo;
	return novo;
end $$;

-- a ficha recebe no inventário o que foi aprovado para ela (dono ou Mestre, ficha em jogo)
create function public.receber_equipamentos(ficha uuid, inventario jsonb, equipamentos uuid[]) returns void
language plpgsql security definer set search_path = '' as $$
declare
	p public.personagens := public.ficha_em_jogo(ficha);
begin
	update public.equipamentos_criados set entregue = true
	where id = any(equipamentos) and personagem_id = p.id and status = 'aprovado' and not entregue;
	update public.personagens set inventario = receber_equipamentos.inventario where id = p.id;
end $$;

-- ---------------------------------------------------------------- acesso
revoke all on public.equipamentos_criados from anon;
grant select, delete on public.equipamentos_criados to authenticated;
grant insert (campanha_id, autor_id, tipo, personagem_id, nome, custo, dados, resumo) on public.equipamentos_criados to authenticated;
grant update (personagem_id, nome, custo, dados, resumo, mensagem) on public.equipamentos_criados to authenticated;
revoke execute on function
	public.equipamento_confere_vinculos(),
	public.aprovar_equipamento(public.equipamentos_criados),
	public.enviar_equipamento(uuid),
	public.retirar_equipamento(uuid),
	public.decidir_equipamento(uuid, public.status_criacao, text),
	public.nova_versao_equipamento(uuid),
	public.receber_equipamentos(uuid, jsonb, uuid[])
from public, anon, authenticated;
grant execute on function
	public.enviar_equipamento(uuid),
	public.retirar_equipamento(uuid),
	public.decidir_equipamento(uuid, public.status_criacao, text),
	public.nova_versao_equipamento(uuid),
	public.receber_equipamentos(uuid, jsonb, uuid[])
to authenticated;
