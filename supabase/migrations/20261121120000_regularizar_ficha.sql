-- Regularizar (temporário): a ficha da escala antiga refaz os atributos pela compra nova (5 pontos, custo crescente, teto
-- +3), escolhe os aprimoramentos dos níveis já alcançados (4, 8, 12, 16 e 20) e as perícias treinadas da criação.
-- Grava tudo de uma vez e marca a ficha na escala nova (dados.escala = 2); depois disso, não se regulariza de novo.

create function public.regularizar_ficha(ficha uuid, atributos jsonb, aprimoramentos text[], pericias text[]) returns void
language plpgsql security definer set search_path = '' as $$
declare
	p public.personagens := public.ficha_em_jogo(ficha, true);
	ids text[] := array['FOR', 'AGI', 'VIG', 'INT', 'CTR', 'ESP', 'CAR'];
	validas text[] := array['acrobacia', 'atletismo', 'atuacao', 'bukijutsu', 'enganacao', 'furtividade', 'genjutsu', 'intimidacao', 'intuicao', 'investigacao', 'kugutsu', 'medicina', 'ninjutsu', 'percepcao', 'persuasao', 'rastreamento', 'selamento', 'sobrevivencia', 'taijutsu'];
	a text;
	v int;
	custo int := 0;
	negativos int := 0;
	vagas int;
begin
	if coalesce((p.dados ->> 'escala')::int, 1) = 2 then raise exception 'Esta ficha já está regularizada.' using errcode = 'P0001'; end if;
	foreach a in array ids loop
		v := coalesce((atributos ->> a)::int, 0);
		if v < -2 or v > 3 then raise exception 'Atributos vão de −2 a +3.' using errcode = 'P0001'; end if;
		custo := custo + case when v <= 0 then v else v * (v + 1) / 2 end;
		if v < 0 then negativos := negativos + 1; end if;
	end loop;
	if custo > 5 then raise exception 'Os atributos passam dos 5 pontos da criação.' using errcode = 'P0001'; end if;
	if negativos > 2 then raise exception 'No máximo dois atributos negativos.' using errcode = 'P0001'; end if;
	vagas := (select count(*) from unnest(array[4, 8, 12, 16, 20]) n where n <= p.nivel);
	if coalesce(array_length(aprimoramentos, 1), 0) <> vagas then raise exception 'Escolha % aprimoramento(s) de atributo.', vagas using errcode = 'P0001'; end if;
	if exists (select 1 from unnest(aprimoramentos) x where not x = any(ids)) then raise exception 'Aprimoramento inválido.' using errcode = 'P0001'; end if;
	if coalesce(array_length(pericias, 1), 0) not between 4 and 5 or exists (select 1 from unnest(pericias) x where not x = any(validas)) or (select count(distinct x) from unnest(pericias) x) <> array_length(pericias, 1) then
		raise exception 'Escolha as perícias treinadas da criação (4, ou 5 sem clã).' using errcode = 'P0001';
	end if;
	update public.personagens set dados = coalesce(p.dados, '{}'::jsonb) || jsonb_build_object(
		'atributos', (select jsonb_object_agg(x, coalesce((atributos ->> x)::int, 0)) from unnest(ids) x),
		'aprimoramentos', to_jsonb(aprimoramentos),
		'pericias', (select jsonb_object_agg(x, 1) from unnest(pericias) x),
		'escala', 2,
		'regularizadaNoNivel', p.nivel,
		'carismaDecidido', true
	) where id = p.id;
	perform public.registrar_ficha(p.id, 'treino', 'Ficha regularizada para a regra nova (atributos até +3 e perícias treinadas)', 'recurso/ic-recurso-pt');
end $$;

revoke execute on function public.regularizar_ficha(uuid, jsonb, text[], text[]) from public, anon, authenticated;
grant execute on function public.regularizar_ficha(uuid, jsonb, text[], text[]) to authenticated;
