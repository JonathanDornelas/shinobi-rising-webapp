-- Atributo novo, o Carisma (cap. 3). A ficha de antes dele fica com CAR 0; o dono pode mover 1 ponto de outro atributo
-- para CAR, uma vez, ou manter como está (de = null). A decisão fica em dados.carismaDecidido e não se desfaz.

create function public.corrigir_carisma(ficha uuid, de text default null) returns void
language plpgsql security definer set search_path = '' as $$
declare
	p public.personagens := public.ficha_em_jogo(ficha, true);
	atributos jsonb := coalesce(p.dados -> 'atributos', '{}'::jsonb);
	valor int;
begin
	if coalesce((p.dados ->> 'carismaDecidido')::boolean, false) then raise exception 'O Carisma desta ficha já foi decidido.' using errcode = 'P0001'; end if;
	if coalesce((atributos ->> 'CAR')::int, 0) <> 0 then raise exception 'Esta ficha já tem Carisma.' using errcode = 'P0001'; end if;
	if de is not null then
		if de not in ('FOR', 'AGI', 'VIG', 'INT', 'CTR', 'ESP') then raise exception 'Atributo inválido.' using errcode = 'P0001'; end if;
		valor := coalesce((atributos ->> de)::int, 0);
		if valor <= -2 then raise exception 'Esse atributo já está no mínimo.' using errcode = 'P0001'; end if;
		atributos := atributos || jsonb_build_object(de, valor - 1, 'CAR', 1);
	else
		atributos := atributos || jsonb_build_object('CAR', 0);
	end if;
	update public.personagens set dados = coalesce(p.dados, '{}'::jsonb) || jsonb_build_object('atributos', atributos, 'carismaDecidido', true) where id = p.id;
	perform public.registrar_ficha(p.id, 'treino', case when de is null then 'Carisma: ficou em 0' else 'Carisma: 1 ponto de ' || de || ' foi para CAR' end, 'recurso/ic-recurso-pt');
end $$;

revoke execute on function public.corrigir_carisma(uuid, text) from public, anon, authenticated;
grant execute on function public.corrigir_carisma(uuid, text) to authenticated;
