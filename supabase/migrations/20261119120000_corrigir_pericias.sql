-- Perícias treinadas (cap. 3, regra nova): cada perícia treinada vale +2. Na ficha que já existia, um bônus de vila,
-- clã, background ou marco pode cair numa perícia que já era treinada: ele não soma e deixa uma perícia por escolher.
-- O dono escolhe as que faltam uma vez; a escolha só se acrescenta, nunca se desfaz (dados.correcaoPericias).

create function public.corrigir_pericias(ficha uuid, escolhas text[]) returns void
language plpgsql security definer set search_path = '' as $$
declare
	p public.personagens := public.ficha_em_jogo(ficha, true);
	validas text[] := array['acrobacia', 'atletismo', 'bukijutsu', 'furtividade', 'genjutsu', 'investigacao', 'kugutsu', 'medicina', 'ninjutsu', 'percepcao', 'persuasao', 'rastreamento', 'selamento', 'sobrevivencia', 'taijutsu'];
	atuais text[];
	novas text[];
begin
	if coalesce(array_length(escolhas, 1), 0) = 0 or array_length(escolhas, 1) > 6 then raise exception 'Escolha de 1 a 6 perícias.' using errcode = 'P0001'; end if;
	if exists (select 1 from unnest(escolhas) e where not e = any(validas)) then raise exception 'Perícia inválida.' using errcode = 'P0001'; end if;
	atuais := coalesce(array(select jsonb_array_elements_text(p.dados -> 'correcaoPericias')), array[]::text[]);
	novas := array(select distinct e from unnest(escolhas) e where not e = any(atuais));
	if coalesce(array_length(novas, 1), 0) = 0 then return; end if;
	update public.personagens set dados = coalesce(p.dados, '{}'::jsonb) || jsonb_build_object('correcaoPericias', to_jsonb(atuais || novas)) where id = p.id;
	perform public.registrar_ficha(p.id, 'treino', left('Perícias corrigidas para a regra nova: ' || array_to_string(novas, ', '), 200), 'recurso/ic-recurso-pt');
end $$;

revoke execute on function public.corrigir_pericias(uuid, text[]) from public, anon, authenticated;
grant execute on function public.corrigir_pericias(uuid, text[]) to authenticated;
