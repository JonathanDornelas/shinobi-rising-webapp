-- L10 · Registro de rolagens: tipo, origem e a conta de cada rolagem (parcelas do modificador), manter os maiores ou
-- menores (2d20kh1, 4d6kh3), Pontos de Destino (cap. 2: re-rolar um teste ou +5, gastando 1 PD) e o aviso de rolagem
-- oculta do Mestre para os jogadores.

alter table public.rolagens add column tipo text not null default 'livre'
	check (tipo in ('teste', 'ataque', 'dano', 'cura', 'iniciativa', 'save', 'livre'));
-- de onde veio a rolagem (ex.: "Ficha · Perícias", "Rolar dados"), só para o registro
alter table public.rolagens add column origem text check (char_length(origem) <= 60);
-- parcelas do modificador: [["ESP (atributo)", "+1"], ["Treino", "+1"]] (descritivo; o total vem da expressão)
alter table public.rolagens add column partes jsonb not null default '[]'::jsonb
	check (jsonb_typeof(partes) = 'array' and jsonb_array_length(partes) <= 12);
-- Ponto de Destino gasto nesta rolagem: 'rerrolar' (esta substitui a anterior) ou 'mais5'
alter table public.rolagens add column pd text check (pd in ('rerrolar', 'mais5'));
-- total antes do PD (a rolagem original, mostrada riscada)
alter table public.rolagens add column anterior_total int;
-- a rolagem foi re-rolada com PD (fica no registro, riscada)
alter table public.rolagens add column substituida boolean not null default false;

-- rolagens que já existiam: o tipo sai do rótulo
update public.rolagens set tipo = case
	when rotulo ilike '%iniciativa%' then 'iniciativa'
	when rotulo ilike '%save%' then 'save'
	when rotulo ilike '%ataque%' then 'ataque'
	when rotulo ilike '%dano%' then 'dano'
	when rotulo ilike '%cura%' then 'cura'
	when rotulo ilike 'teste de%' then 'teste'
	else 'livre' end;

-- ---------------------------------------------------------------- rolar
drop function public.rolar(uuid, text, text, uuid, text, boolean, uuid);
create function public.rolar(
	campanha uuid, expressao text, rotulo text, personagem uuid default null, modo text default 'normal', oculta boolean default false,
	npc uuid default null, tipo text default 'livre', origem text default null, partes jsonb default '[]'::jsonb
) returns public.rolagens
language plpgsql security definer set search_path = '' as $$
declare
	e text := lower(regexp_replace(replace(coalesce(expressao, ''), '−', '-'), '\s', '', 'g'));
	r text := trim(coalesce(rotulo, ''));
	m text := coalesce(modo, 'normal');
	termo text[];
	sinal int;
	n int;
	lados int;
	manter text;
	k int;
	vals int[];
	usados int[];
	det jsonb := '[]'::jsonb;
	soma int := 0;
	nat int;
	qtd int := 0;
	d20_livre boolean := true;
	nome_quem text;
	nome_jogador text;
	nova public.rolagens;
begin
	if not public.eh_membro(campanha) then raise exception 'Só quem está na campanha rola dados nela.' using errcode = '42501'; end if;
	if not public.campanha_ativa(campanha) then raise exception 'Campanha arquivada é somente leitura.' using errcode = 'P0001'; end if;
	if m not in ('normal', 'vantagem', 'desvantagem', 'critico') then raise exception 'Modo de rolagem inválido.' using errcode = 'P0001'; end if;
	if coalesce(rolar.tipo, 'livre') not in ('teste', 'ataque', 'dano', 'cura', 'iniciativa', 'save', 'livre') then raise exception 'Tipo de rolagem inválido.' using errcode = 'P0001'; end if;
	if char_length(r) = 0 then r := e; end if;
	if char_length(r) > 80 then r := left(r, 80); end if;
	if char_length(e) > 60 or e !~ '^[+-]?(\d{1,2}d\d{1,4}(k[hl]\d{1,2})?|\d{1,4})([+-](\d{1,2}d\d{1,4}(k[hl]\d{1,2})?|\d{1,4}))*$' then
		raise exception 'Expressão inválida. Use dados e números somados, como 2d6 + 3, 1d20 - 1 ou 4d6kh3.' using errcode = 'P0001';
	end if;
	if (select count(*) from public.rolagens x where x.autor_id = (select auth.uid()) and x.criada_em > now() - interval '10 seconds') >= 10 then
		raise exception 'Muitas rolagens seguidas. Respire e tente de novo em alguns segundos.' using errcode = 'P0001';
	end if;

	select f.nome into nome_jogador from public.perfis f where f.id = (select auth.uid());
	if npc is not null then
		select x.nome into nome_quem from public.npcs x where x.id = rolar.npc and x.campanha_id = campanha and public.eh_mestre(campanha);
		if nome_quem is null then raise exception 'NPC não encontrado.' using errcode = '42501'; end if;
		nome_quem := coalesce(nullif(trim(nome_quem), ''), 'NPC');
	elsif personagem is not null then
		select p.nome into nome_quem from public.personagens p
		where p.id = personagem and p.campanha_id = campanha and (p.jogador_id = (select auth.uid()) or public.eh_mestre(campanha));
		if nome_quem is null then raise exception 'Ficha não encontrada.' using errcode = '42501'; end if;
	else
		nome_quem := nome_jogador;
	end if;

	for termo in select regexp_matches(e, '([+-]?)(\d+d\d+(?:k[hl]\d+)?|\d+)', 'g') loop
		sinal := case when termo[1] = '-' then -1 else 1 end;
		if position('d' in termo[2]) > 0 then
			n := split_part(termo[2], 'd', 1)::int;
			lados := split_part(split_part(termo[2], 'd', 2), 'k', 1)::int;
			manter := case when termo[2] ~ 'kh' then 'h' when termo[2] ~ 'kl' then 'l' end;
			k := case when manter is null then null else substring(termo[2] from 'k[hl](\d+)')::int end;
			if n < 1 or n > 50 then raise exception 'Use de 1 a 50 dados por termo.' using errcode = 'P0001'; end if;
			if lados < 2 or lados > 1000 then raise exception 'O dado precisa ter de 2 a 1000 lados.' using errcode = 'P0001'; end if;
			if manter is not null and (k < 1 or k > n) then raise exception 'kh/kl precisa manter entre 1 e % dados.', n using errcode = 'P0001'; end if;
			-- crítico (cap. 4): os dados de dano dobram
			if m = 'critico' then n := n * 2; if k is not null then k := k * 2; end if; end if;
			qtd := qtd + n;
			if qtd > 100 then raise exception 'Dados demais numa rolagem só (máximo 100).' using errcode = 'P0001'; end if;
			vals := array(select 1 + floor(random() * lados)::int from generate_series(1, n));
			usados := vals;
			if manter is not null then
				-- mantém os k maiores (kh) ou menores (kl), na ordem em que caíram
				usados := array(
					select v from (
						select v, i, row_number() over (order by case when manter = 'h' then -v else v end, i) as pos
						from unnest(vals) with ordinality as t(v, i)
					) x where pos <= k order by i
				);
			end if;
			if lados = 20 and d20_livre and coalesce(k, n) = 1 then
				-- vantagem e desvantagem (cap. 2): o d20 é lançado duas vezes; fica o maior ou o menor
				if manter is null and m in ('vantagem', 'desvantagem') then
					vals := vals || (1 + floor(random() * 20)::int);
					usados := array[case when m = 'vantagem' then greatest(vals[1], vals[2]) else least(vals[1], vals[2]) end];
				end if;
				nat := usados[1];
				d20_livre := false;
			end if;
			soma := soma + sinal * (select coalesce(sum(v), 0) from unnest(usados) v);
			det := det || jsonb_build_array(jsonb_strip_nulls(jsonb_build_object('sinal', sinal, 'lados', lados, 'valores', to_jsonb(vals), 'usados', to_jsonb(usados), 'manter', manter, 'k', k)));
		else
			soma := soma + sinal * termo[2]::int;
			det := det || jsonb_build_array(jsonb_build_object('sinal', sinal, 'valor', termo[2]::int));
		end if;
	end loop;
	if qtd = 0 then raise exception 'Inclua pelo menos um dado (ex.: 1d20).' using errcode = 'P0001'; end if;

	insert into public.rolagens (campanha_id, autor_id, personagem_id, npc_id, quem, jogador, rotulo, expressao, modo, detalhe, total, d20, oculta, tipo, origem, partes)
	values (campanha, (select auth.uid()), case when rolar.npc is null then personagem end, rolar.npc, coalesce(nome_quem, '?'), nome_jogador, r, e, m, det, soma, nat,
		coalesce(rolar.oculta, false), coalesce(rolar.tipo, 'livre'), left(nullif(trim(coalesce(rolar.origem, '')), ''), 60),
		case when jsonb_typeof(rolar.partes) = 'array' and jsonb_array_length(rolar.partes) <= 12 then rolar.partes else '[]'::jsonb end)
	returning * into nova;
	return nova;
end $$;

-- ---------------------------------------------------------------- Pontos de Destino (cap. 2)
-- 'rerrolar': rola de novo a mesma expressão (a original fica riscada); 'mais5': soma +5 ao resultado.
-- Só quem rolou, numa rolagem de ficha (a sua ou, para o Mestre, qualquer uma da campanha), uma vez por rolagem.
create function public.usar_pd(rolagem uuid, acao text) returns public.rolagens
language plpgsql security definer set search_path = '' as $$
declare
	r public.rolagens;
	p public.personagens;
	restantes int;
	nova public.rolagens;
begin
	select * into r from public.rolagens where id = rolagem for update;
	if r.id is null or r.autor_id is distinct from (select auth.uid()) then raise exception 'Rolagem não encontrada.' using errcode = '42501'; end if;
	if acao not in ('rerrolar', 'mais5') then raise exception 'Uso de PD inválido.' using errcode = 'P0001'; end if;
	if r.personagem_id is null then raise exception 'Pontos de Destino são da ficha: role pela ficha para poder usar.' using errcode = 'P0001'; end if;
	if r.pd is not null or r.substituida then raise exception 'Esta rolagem já usou um Ponto de Destino.' using errcode = 'P0001'; end if;
	if r.criada_em < now() - interval '30 minutes' then raise exception 'Só dá para usar PD logo depois da rolagem.' using errcode = 'P0001'; end if;
	select * into p from public.personagens where id = r.personagem_id for update;
	if not public.campanha_ativa(p.campanha_id) then raise exception 'Campanha arquivada é somente leitura.' using errcode = 'P0001'; end if;
	restantes := coalesce((p.estado ->> 'pd')::int, 1);
	if restantes < 1 then raise exception 'Sem Pontos de Destino nesta sessão.' using errcode = 'P0001'; end if;
	update public.personagens set estado = coalesce(estado, '{}'::jsonb) || jsonb_build_object('pd', restantes - 1) where id = p.id;
	perform public.registrar_ficha(p.id, 'pd', case when acao = 'rerrolar' then 'Gastou 1 PD para re-rolar: ' else 'Gastou 1 PD para +5: ' end || r.rotulo, 'recurso/ic-recurso-pd');

	if acao = 'mais5' then
		update public.rolagens set
			pd = 'mais5', anterior_total = r.total, total = r.total + 5,
			partes = case when jsonb_array_length(r.partes) < 12 then r.partes || '[["Ponto de Destino", "+5"]]'::jsonb else r.partes end
		where id = r.id returning * into nova;
		return nova;
	end if;

	update public.rolagens set substituida = true where id = r.id;
	nova := public.rolar(r.campanha_id, r.expressao, r.rotulo, r.personagem_id, case when r.modo = 'critico' then 'critico' when r.modo in ('vantagem', 'desvantagem') then r.modo else 'normal' end,
		r.oculta, null, r.tipo, r.origem, r.partes);
	update public.rolagens set pd = 'rerrolar', anterior_total = r.total where id = nova.id returning * into nova;
	return nova;
end $$;

-- ---------------------------------------------------------------- rolagens ocultas do Mestre
-- O jogador não vê a rolagem secreta do Mestre, mas vê que ela aconteceu (sem quem, o quê nem o resultado).
create function public.rolagens_ocultas_do_mestre(desde timestamptz default null)
returns table (id uuid, campanha_id uuid, criada_em timestamptz, mestre text)
language sql stable security definer set search_path = '' as $$
	select r.id, r.campanha_id, r.criada_em, coalesce(r.jogador, 'O Mestre')
	from public.rolagens r join public.campanhas k on k.id = r.campanha_id
	where r.oculta and r.autor_id = k.mestre_id and k.mestre_id is distinct from (select auth.uid())
		and public.eh_membro(r.campanha_id) and (desde is null or r.criada_em >= desde)
	order by r.criada_em desc
	limit 500;
$$;

-- ---------------------------------------------------------------- acesso
revoke execute on function
	public.rolar(uuid, text, text, uuid, text, boolean, uuid, text, text, jsonb),
	public.usar_pd(uuid, text),
	public.rolagens_ocultas_do_mestre(timestamptz)
from public, anon, authenticated;
grant execute on function
	public.rolar(uuid, text, text, uuid, text, boolean, uuid, text, text, jsonb),
	public.usar_pd(uuid, text),
	public.rolagens_ocultas_do_mestre(timestamptz)
to authenticated;
