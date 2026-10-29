-- Excluir o que foi criado na campanha: clãs, jutsus e habilidades, armas, itens e marionetes, em qualquer status.
-- Antes só o autor apagava, e só o rascunho; o Mestre, cujas criações entram aprovadas, não tinha como apagar nada.
-- Agora o autor apaga o que é seu e o Mestre apaga qualquer criação da campanha.
-- Uma versão ainda não aprovada (rascunho, em revisão, ajustes, rejeitada) sai sozinha; uma aprovada leva a cadeia
-- inteira de versões, que é o que a lista mostra como "o jutsu". O clã leva junto os jutsus das cartas dele.
-- As fichas que usavam a criação ficam sem ela (cla_id vira null; jutsu aprendido some da lista; o item já entregue
-- continua no inventário, que guarda uma cópia). fichas_que_usam() diz quais são, para o aviso antes de excluir.

-- ids da criação a apagar: ela sozinha, ou a cadeia de versões se estiver aprovada
create function public.cadeia_da_criacao(tipo text, alvo uuid) returns uuid[]
language plpgsql stable security definer set search_path = '' as $$
declare
	st text;
	ids uuid[];
begin
	if tipo = 'cla' then
		select c.status::text into st from public.clas c where c.id = alvo;
		if st = 'aprovado' then
			with recursive cadeia(id, anterior_id) as (
				select c.id, c.anterior_id from public.clas c where c.id = alvo
				union
				select t.id, t.anterior_id from public.clas t join cadeia x on t.anterior_id = x.id or t.id = x.anterior_id
			)
			select array_agg(id) into ids from cadeia;
		end if;
	elsif tipo = 'jutsu' then
		select j.status::text into st from public.jutsus_criados j where j.id = alvo;
		if st = 'aprovado' then
			with recursive cadeia(id, anterior_id) as (
				select j.id, j.anterior_id from public.jutsus_criados j where j.id = alvo
				union
				select t.id, t.anterior_id from public.jutsus_criados t join cadeia x on t.anterior_id = x.id or t.id = x.anterior_id
			)
			select array_agg(id) into ids from cadeia;
		end if;
	elsif tipo = 'equipamento' then
		select e.status::text into st from public.equipamentos_criados e where e.id = alvo;
		if st = 'aprovado' then
			with recursive cadeia(id, anterior_id) as (
				select e.id, e.anterior_id from public.equipamentos_criados e where e.id = alvo
				union
				select t.id, t.anterior_id from public.equipamentos_criados t join cadeia x on t.anterior_id = x.id or t.id = x.anterior_id
			)
			select array_agg(id) into ids from cadeia;
		end if;
	else
		raise exception 'Tipo de criação inválido.' using errcode = '22023';
	end if;
	if st is null then return null; end if;
	return coalesce(ids, array[alvo]);
end $$;

-- quem pode apagar: o autor ou o Mestre da campanha
create function public.pode_excluir_criacao(tipo text, alvo uuid) returns boolean
language sql stable security definer set search_path = '' as $$
	select coalesce((
		select x.autor_id = (select auth.uid()) or public.eh_mestre(x.campanha_id)
		from (
			select c.autor_id, c.campanha_id from public.clas c where pode_excluir_criacao.tipo = 'cla' and c.id = pode_excluir_criacao.alvo
			union all
			select j.autor_id, j.campanha_id from public.jutsus_criados j where pode_excluir_criacao.tipo = 'jutsu' and j.id = pode_excluir_criacao.alvo
			union all
			select e.autor_id, e.campanha_id from public.equipamentos_criados e where pode_excluir_criacao.tipo = 'equipamento' and e.id = pode_excluir_criacao.alvo
		) x
	), false);
$$;

-- nomes das fichas que perdem algo com a exclusão (o clã, um jutsu aprendido ou escolhido na criação)
create function public.fichas_que_usam(tipo text, alvo uuid) returns text[]
language plpgsql stable security definer set search_path = '' as $$
declare
	ids uuid[];
	slugs text[];
	nomes text[];
begin
	if not public.pode_excluir_criacao(tipo, alvo) then return array[]::text[]; end if;
	ids := public.cadeia_da_criacao(tipo, alvo);
	if ids is null then return array[]::text[]; end if;
	if tipo = 'cla' then
		select coalesce(array_agg(coalesce(nullif(p.nome, ''), 'Sem nome') order by p.nome), array[]::text[]) into nomes
		from public.personagens p where p.cla_id = any(ids);
	elsif tipo = 'jutsu' then
		slugs := array(select 'jc-' || i::text from unnest(ids) i);
		select coalesce(array_agg(coalesce(nullif(p.nome, ''), 'Sem nome') order by p.nome), array[]::text[]) into nomes
		from public.personagens p
		where p.campanha_id = (select j.campanha_id from public.jutsus_criados j where j.id = alvo)
			and (
				exists (select 1 from jsonb_array_elements(coalesce(p.dados -> 'progresso' -> 'treinos', '[]'::jsonb)) t where t ->> 'slug' = any(slugs))
				or exists (select 1 from jsonb_array_elements_text(coalesce(p.dados -> 'jutsus' -> 'E', '[]'::jsonb) || coalesce(p.dados -> 'jutsus' -> 'D', '[]'::jsonb)) s where s = any(slugs))
			);
	else
		-- o item entregue fica no inventário; só a encomenda ainda não entregue se perde
		select coalesce(array_agg(coalesce(nullif(p.nome, ''), 'Sem nome') order by p.nome), array[]::text[]) into nomes
		from public.equipamentos_criados e join public.personagens p on p.id = e.personagem_id
		where e.id = any(ids) and e.status = 'aprovado' and not e.entregue;
	end if;
	return nomes;
end $$;

create function public.excluir_criacao(tipo text, alvo uuid) returns void
language plpgsql security definer set search_path = '' as $$
declare
	ids uuid[];
begin
	if not public.pode_excluir_criacao(tipo, alvo) then
		raise exception 'Só o autor ou o Mestre da campanha podem excluir.' using errcode = '42501';
	end if;
	ids := public.cadeia_da_criacao(tipo, alvo);
	if tipo = 'cla' then
		delete from public.jutsus_criados where cla_id = any(ids);
		delete from public.clas where id = any(ids);
	elsif tipo = 'jutsu' then
		delete from public.jutsus_criados where id = any(ids);
	else
		delete from public.equipamentos_criados where id = any(ids);
	end if;
end $$;

revoke all on function public.cadeia_da_criacao(text, uuid) from public, anon, authenticated;
revoke all on function public.pode_excluir_criacao(text, uuid) from public, anon;
revoke all on function public.fichas_que_usam(text, uuid) from public, anon;
revoke all on function public.excluir_criacao(text, uuid) from public, anon;
grant execute on function public.pode_excluir_criacao(text, uuid) to authenticated;
grant execute on function public.fichas_que_usam(text, uuid) to authenticated;
grant execute on function public.excluir_criacao(text, uuid) to authenticated;

-- ---------------------------------------------------------------- NPC de ficha completa: o Mestre tira um jutsu
-- O Mestre concede jutsus ao NPC com conceder_jutsu (de graça); para ajustar, também tira um jutsu que o NPC aprendeu
-- (treino, concessão) ou escolheu na criação. Os da academia, do clã e dos marcos de nível ficam.
create function public.esquecer_jutsu(ficha uuid, slug text, nome text) returns void
language plpgsql security definer set search_path = '' as $$
declare
	p public.personagens := public.ficha_do_mestre(ficha);
	d jsonb := coalesce(p.dados, '{}'::jsonb);
	alvo text := slug;
begin
	if not p.npc then raise exception 'Só dá para tirar jutsus da ficha de um NPC.' using errcode = 'P0001'; end if;
	d := d || jsonb_build_object('progresso', coalesce(d -> 'progresso', '{}'::jsonb) || jsonb_build_object('treinos', coalesce((
		select jsonb_agg(t) from jsonb_array_elements(coalesce(d -> 'progresso' -> 'treinos', '[]'::jsonb)) t
		where not (t ->> 'tipo' = 'jutsu' and t ->> 'slug' = alvo)
	), '[]'::jsonb)));
	if d ? 'jutsus' then
		d := d || jsonb_build_object('jutsus', (d -> 'jutsus') || jsonb_build_object(
			'E', coalesce((select jsonb_agg(s) from jsonb_array_elements(coalesce(d -> 'jutsus' -> 'E', '[]'::jsonb)) s where s #>> '{}' <> alvo), '[]'::jsonb),
			'D', coalesce((select jsonb_agg(s) from jsonb_array_elements(coalesce(d -> 'jutsus' -> 'D', '[]'::jsonb)) s where s #>> '{}' <> alvo), '[]'::jsonb)
		));
	end if;
	update public.personagens set dados = d where id = p.id;
	perform public.registrar_ficha(p.id, 'concedido', left('O Mestre tirou o jutsu ' || coalesce(nome, alvo), 200), 'acao/ic-acao-conceder');
end $$;
revoke all on function public.esquecer_jutsu(uuid, text, text) from public, anon;
grant execute on function public.esquecer_jutsu(uuid, text, text) to authenticated;
