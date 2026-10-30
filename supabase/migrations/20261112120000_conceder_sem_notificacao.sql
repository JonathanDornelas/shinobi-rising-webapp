-- Conceder jutsu ou item não notifica mais o jogador: a concessão fica no registro da ficha (registrar_ficha), e o
-- aviso "O Mestre concedeu…" sumia no meio das outras notificações sem acrescentar nada. As antigas também saem.

create or replace function public.conceder_jutsu(ficha uuid, slug text, nome text, custo_pt int default 0) returns void
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
end $$;

create or replace function public.conceder_item(ficha uuid, item jsonb, custo_ryo int default 0) returns void
language plpgsql security definer set search_path = '' as $$
declare
	p public.personagens := public.ficha_do_mestre(ficha);
	nome text := left(coalesce(item ->> 'nome', 'item'), 60);
begin
	if custo_ryo < 0 then raise exception 'Custo inválido.' using errcode = 'P0001'; end if;
	if p.ryo < custo_ryo then raise exception '% tem % ryo; o item custa %.', p.nome, p.ryo, custo_ryo using errcode = 'P0001'; end if;
	update public.personagens set ryo = p.ryo - custo_ryo, entregas = p.entregas || jsonb_build_array(item) where id = p.id;
	perform public.registrar_ficha(p.id, 'concedido', left('O Mestre concedeu ' || nome || case when custo_ryo > 0 then ' (−' || custo_ryo || ' ryo)' else '' end, 200), 'acao/ic-acao-conceder');
end $$;

delete from public.notificacoes where tipo = 'concedido';
