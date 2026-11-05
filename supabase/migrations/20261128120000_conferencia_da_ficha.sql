-- Treino e subida de nível conferidos pelo banco. O navegador deixa de mandar a ficha inteira: manda só o que foi aprendido
-- ou escolhido, e o banco confere cada entrada e a acrescenta à ficha guardada. Assim atributos, perícias e tudo o mais
-- ficam fora do alcance por construção, e fichas antigas (sem algum campo novo) não dão falso alarme.
--
-- As regras espelham src/lib/personagem/progressao.ts. O teste supabase/testes/conferencia_ficha.spec.ts passa por aqui todas
-- as opções que a tela oferece e exige a mesma resposta dos dois lados. O que é do livro fica nas tabelas livro_*, geradas
-- por scripts/livro/catalogo-banco.ts.

create table public.livro_jutsus (slug text primary key, rank text not null, cla text, elemento text);
create table public.livro_clas (slug text primary key, elementos text[] not null default '{}');
create table public.livro_marcos (cla text not null, nivel int not null, ganho jsonb not null, escolha_pericia text[], primary key (cla, nivel));
alter table public.livro_jutsus enable row level security;
alter table public.livro_clas enable row level security;
alter table public.livro_marcos enable row level security;
revoke all on public.livro_jutsus, public.livro_clas, public.livro_marcos from public, anon, authenticated;

create function public.lista_json(j jsonb) returns jsonb
language sql immutable set search_path = '' as $$
	select case when jsonb_typeof(j) = 'array' then j else '[]'::jsonb end;
$$;

create function public.textos_json(j jsonb) returns text[]
language sql immutable set search_path = '' as $$
	select coalesce(array_agg(x order by x), '{}') from jsonb_array_elements_text(public.lista_json(j)) x;
$$;

create function public.somar_ao_progresso(d jsonb, chave text, novos jsonb) returns jsonb
language sql immutable set search_path = '' as $$
	select coalesce(d, '{}'::jsonb) || jsonb_build_object('progresso',
		coalesce(d -> 'progresso', '{}'::jsonb) || jsonb_build_object(chave, public.lista_json(d #> array['progresso', chave]) || novos));
$$;

-- cap. 18: custo por rank do jutsu e por nível da proficiência
create function public.custo_rank(r text) returns int
language sql immutable set search_path = '' as $$
	select case r when 'E' then 1 when 'D' then 2 when 'C' then 4 when 'B' then 8 when 'A' then 15 when 'S' then 30 end;
$$;
create function public.nivel_do_rank(r text) returns int
language sql immutable set search_path = '' as $$
	select case r when 'B' then 6 when 'A' then 11 when 'S' then 15 else 1 end;
$$;
create function public.custo_proficiencia(tipo text, nivel int) returns int
language sql immutable set search_path = '' as $$
	select coalesce((array[1, 3, 6, 10, 15])[nivel], 0) + case when tipo = 'categoria' then nivel else 0 end;
$$;

create function public.profs_da_ficha(d jsonb, treinos jsonb) returns table (tipo text, alvo text, nivel int)
language sql immutable set search_path = '' as $$
	select x.tipo, x.alvo, max(x.nivel)::int from (
		select p ->> 'tipo' as tipo, p ->> 'alvo' as alvo, coalesce((p ->> 'nivel')::int, 1) as nivel from jsonb_array_elements(public.lista_json(d -> 'proficiencias')) p
		union all
		select t #>> '{prof,tipo}', t #>> '{prof,alvo}', (t ->> 'nivel')::int from jsonb_array_elements(treinos) t where t ->> 'tipo' = 'proficiencia'
	) x group by x.tipo, x.alvo;
$$;

-- Todos os elementos que a ficha pode ter: na dúvida conta a favor do jogador, porque uma recusa indevida trava o treino.
create function public.elementos_da_ficha(d jsonb, treinos jsonb) returns text[]
language sql stable set search_path = '' as $$
	select array_remove(array[d ->> 'elemento', d ->> 'segundoElemento', d #>> '{cla,criado,elemento}', d #>> '{cla,criado,elementoExtra}'], null)
		|| coalesce((select c.elementos from public.livro_clas c where c.slug = d #>> '{cla,slug}'), '{}')
		|| coalesce((select array_agg(t ->> 'id') from jsonb_array_elements(treinos) t where t ->> 'tipo' = 'elemento'), '{}');
$$;

create function public.jutsus_sabidos(d jsonb, treinos jsonb) returns text[]
language sql immutable set search_path = '' as $$
	select public.textos_json(d #> '{jutsus,E}') || public.textos_json(d #> '{jutsus,D}')
		|| coalesce((select array_agg(x) from jsonb_array_elements(public.lista_json(d #> '{progresso,niveis}')) n, jsonb_array_elements_text(public.lista_json(n #> '{marco,jutsus}')) x), '{}')
		|| coalesce((select array_agg(t ->> 'slug') from jsonb_array_elements(treinos) t where t ->> 'tipo' = 'jutsu'), '{}');
$$;

-- Confere os treinos na ordem e devolve o custo total. Cada entrada precisa ser possível e custar o que o livro manda.
create function public.conferir_treinos(d jsonb, nivel_ficha int, campanha uuid, treinos jsonb) returns int
language plpgsql stable set search_path = '' as $$
declare
	antes jsonb := public.lista_json(d #> '{progresso,treinos}');
	feitos jsonb := antes;
	niveis jsonb := public.lista_json(d #> '{progresso,niveis}');
	nivel int := greatest(nivel_ficha, 1 + jsonb_array_length(niveis));
	t jsonb;
	j public.livro_jutsus;
	r text;
	pt int;
	esperado int;
	atual int;
	novo int;
	minimo int;
	tipo_prof text;
	alvo_prof text;
	total int := 0;
begin
	if jsonb_typeof(treinos) is distinct from 'array' then raise exception 'Nada para treinar.' using errcode = 'P0001'; end if;
	for t in select value from jsonb_array_elements(treinos) loop
		if t ->> 'pt' is null or (t ->> 'pt') !~ '^[0-9]{1,4}$' or (t ->> 'pt')::int < 1 then raise exception 'Treino inválido.' using errcode = 'P0001'; end if;
		pt := (t ->> 'pt')::int;
		minimo := 1;
		case t ->> 'tipo'
		when 'jutsu' then
			if t ->> 'slug' is null then raise exception 'Treino inválido.' using errcode = 'P0001'; end if;
			if (t ->> 'slug') = any(public.jutsus_sabidos(d, feitos)) then raise exception 'Este jutsu já foi aprendido.' using errcode = 'P0001'; end if;
			select * into j from public.livro_jutsus l where l.slug = t ->> 'slug';
			if found then
				r := j.rank;
				if j.cla is not null and j.cla is distinct from d #>> '{cla,slug}' then raise exception 'Este jutsu é de outro clã.' using errcode = 'P0001'; end if;
				minimo := public.nivel_do_rank(r);
				if nivel < minimo then raise exception 'Rank % exige nível %.', r, minimo using errcode = 'P0001'; end if;
				if j.cla is null and j.elemento is not null and not j.elemento = any(public.elementos_da_ficha(d, feitos)) then
					raise exception 'Este jutsu exige afinidade com o elemento.' using errcode = 'P0001';
				end if;
				if public.custo_rank(r) is null then raise exception 'Este jutsu não se aprende com PT.' using errcode = 'P0001'; end if;
				esperado := public.custo_rank(r) + case when j.cla is not null then 1 else 0 end;
			elsif (t ->> 'slug') ~ '^jc-[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' then
				-- jutsu criado: o rank salvo com ele vale como piso (o criador recalcula o rank exato)
				r := (select c.rank from public.jutsus_criados c where c.id = substr(t ->> 'slug', 4)::uuid and c.campanha_id = campanha);
				esperado := greatest(pt, coalesce(public.custo_rank(r), 1));
			else
				-- fora do catálogo (carta original de clã criado): sem card no livro, só precisa custar algo
				r := null;
				esperado := pt;
			end if;
			minimo := public.nivel_do_rank(r);
			if nivel < minimo then raise exception 'Rank % exige nível %.', r, minimo using errcode = 'P0001'; end if;
		when 'especializacao' then
			if not (d ->> 'especializacao' is not distinct from t ->> 'id' or exists (select 1 from jsonb_array_elements(niveis) n where n #>> '{especializacao,id}' = t ->> 'id')) then
				raise exception 'A ficha não tem esta especialização.' using errcode = 'P0001';
			end if;
			atual := 1 + (select count(*)::int from jsonb_array_elements(feitos) x where x ->> 'tipo' = 'especializacao' and x ->> 'id' = t ->> 'id');
			if atual >= 3 then raise exception 'Esta especialização já está no nível máximo.' using errcode = 'P0001'; end if;
			esperado := case atual when 1 then 5 else 10 end;
			minimo := case atual when 1 then 4 else 7 end;
			if nivel < minimo then raise exception 'Exige nível %.', minimo using errcode = 'P0001'; end if;
		when 'proficiencia' then
			tipo_prof := t #>> '{prof,tipo}';
			alvo_prof := t #>> '{prof,alvo}';
			if tipo_prof is null or tipo_prof not in ('arma', 'categoria', 'jutsu', 'ambiente', 'equipamento') or coalesce(alvo_prof, '') = '' or coalesce(t ->> 'nivel', '') !~ '^[1-5]$' then
				raise exception 'Treino inválido.' using errcode = 'P0001';
			end if;
			novo := (t ->> 'nivel')::int;
			select coalesce(max(x.nivel), 0) into atual from public.profs_da_ficha(d, feitos) x where x.tipo = tipo_prof and x.alvo = alvo_prof;
			if atual = 0 then
				if novo <> 1 then raise exception 'Treino inválido.' using errcode = 'P0001'; end if;
				if (select count(*) from public.profs_da_ficha(d, feitos)) >= 5 then raise exception 'A ficha já tem 5 proficiências.' using errcode = 'P0001'; end if;
			else
				if novo <> atual + 1 then raise exception 'Treino inválido.' using errcode = 'P0001'; end if;
				minimo := case novo when 4 then 8 when 5 then 10 else 1 end;
				if nivel < minimo then raise exception 'Exige nível %.', minimo using errcode = 'P0001'; end if;
				-- os limites valem sobre a ficha de antes do carrinho, como na tela
				if novo = 4 and (select count(*) from public.profs_da_ficha(d, antes) x where x.nivel >= 4) >= 3 then raise exception 'Já há 3 proficiências em Mestre.' using errcode = 'P0001'; end if;
				if novo = 5 and (select count(*) from public.profs_da_ficha(d, antes) x where x.nivel >= 5) >= 1 then raise exception 'Já há uma proficiência Lendária.' using errcode = 'P0001'; end if;
			end if;
			esperado := public.custo_proficiencia(tipo_prof, novo) - public.custo_proficiencia(tipo_prof, atual);
		when 'elemento' then
			-- só o que já foi treinado conta como repetido: a lista generosa de elementos recusaria um treino que a tela oferece
			if coalesce(t ->> 'id', '') !~ '^[a-z]+$' or exists (select 1 from jsonb_array_elements(feitos) x where x ->> 'tipo' = 'elemento' and x ->> 'id' = t ->> 'id') then
				raise exception 'Treino inválido.' using errcode = 'P0001';
			end if;
			atual := (select count(*)::int from jsonb_array_elements(feitos) x where x ->> 'tipo' = 'elemento');
			-- o 2º elemento custa 10 PT no nível 5; o 3º, 20 PT no nível 8. Quantos a ficha tem depende do clã; aqui vale o que foi treinado
			if atual >= 2 or not ((pt = 10 and atual = 0 and nivel >= 5) or (pt = 20 and nivel >= 8)) then
				raise exception 'Este elemento ainda não pode ser treinado.' using errcode = 'P0001';
			end if;
			esperado := pt;
		else
			raise exception 'Treino inválido.' using errcode = 'P0001';
		end case;
		if pt <> esperado then raise exception 'O custo deste treino não confere com o livro.' using errcode = 'P0001'; end if;
		feitos := feitos || jsonb_build_array(t);
		total := total + pt;
	end loop;
	return total;
end $$;

-- Confere as escolhas de um nível (cap. 17) e devolve os PT do marco do clã.
create function public.conferir_nivel(d jsonb, novo int, escolha jsonb) returns int
language plpgsql stable set search_path = '' as $$
declare
	marco jsonb := escolha -> 'marco';
	m public.livro_marcos;
	tipo_cla text := d #>> '{cla,tipo}';
	pericias text[];
	esperadas text[];
	extras text[];
	soma int;
begin
	if jsonb_typeof(escolha) is distinct from 'object' or escolha ->> 'nivel' is distinct from novo::text
		or exists (select 1 from jsonb_object_keys(escolha) k where k not in ('nivel', 'atributo', 'pericia', 'especializacao', 'marco')) then
		raise exception 'Escolhas de nível inválidas.' using errcode = 'P0001';
	end if;
	if escolha ? 'atributo' and not (novo = any(array[4, 8, 12, 16, 20]) and escolha ->> 'atributo' in ('FOR', 'AGI', 'VIG', 'INT', 'CTR', 'ESP', 'CAR')) then
		raise exception 'Este nível não dá atributo.' using errcode = 'P0001';
	end if;
	if escolha ? 'pericia' and not (novo = any(array[5, 9, 13, 17]) and escolha ->> 'pericia' ~ '^[a-z]+$') then
		raise exception 'Este nível não dá perícia.' using errcode = 'P0001';
	end if;
	if escolha ? 'especializacao' and not (novo = any(array[4, 7, 10, 13, 16, 19]) and coalesce(escolha #>> '{especializacao,id}', '') <> '') then
		raise exception 'Este nível não dá especialização.' using errcode = 'P0001';
	end if;
	if marco is null or jsonb_typeof(marco) = 'null' then return 0; end if;
	if jsonb_typeof(marco) <> 'object' or exists (select 1 from jsonb_object_keys(marco) k where k not in ('texto', 'atributos', 'limites', 'pericias', 'pt', 'pic', 'jutsus', 'escolhaPericia')) then
		raise exception 'Marco inválido.' using errcode = 'P0001';
	end if;

	select * into m from public.livro_marcos l where l.cla = d #>> '{cla,slug}' and l.nivel = novo and tipo_cla = 'catalogo';
	if found then
		esperadas := public.textos_json(m.ganho -> 'pericias');
		pericias := public.textos_json(marco -> 'pericias');
		extras := array(select unnest(pericias) except all select unnest(esperadas));
		if coalesce(marco -> 'atributos', '{}') <> coalesce(m.ganho -> 'atributos', '{}')
			or coalesce(marco -> 'limites', '{}') <> coalesce(m.ganho -> 'limites', '{}')
			or (marco ->> 'pt') is distinct from (m.ganho ->> 'pt')
			or (marco ->> 'pic') is distinct from (m.ganho ->> 'pic')
			or public.textos_json(marco -> 'jutsus') <> public.textos_json(m.ganho -> 'jutsus')
			or not esperadas <@ pericias
			or cardinality(extras) > 1
			or (cardinality(extras) = 1 and not extras[1] = any(coalesce(m.escolha_pericia, '{}'))) then
			raise exception 'O marco não confere com o livro do clã.' using errcode = 'P0001';
		end if;
		return coalesce((m.ganho ->> 'pt')::int, 0);
	end if;

	if tipo_cla is null or tipo_cla not in ('novo-sem-kkg', 'novo-com-kkg') then raise exception 'Este nível não tem marco de clã.' using errcode = 'P0001'; end if;
	-- clã criado: o texto do marco é montado na tela, a partir do clã aprovado pelo Mestre; aqui vale o teto do Esqueleto Padrão (cap. 8.4)
	soma := coalesce((select sum(value::int) from jsonb_each_text(coalesce(marco -> 'atributos', '{}'))), 0);
	if soma > 2 or coalesce((marco ->> 'pt')::int, 0) not between 0 and 10 or coalesce((marco ->> 'pic')::int, 0) not between 0 and 3
		or jsonb_array_length(public.lista_json(marco -> 'pericias')) > 2 or jsonb_array_length(public.lista_json(marco -> 'jutsus')) > 3 then
		raise exception 'Marco inválido.' using errcode = 'P0001';
	end if;
	return coalesce((marco ->> 'pt')::int, 0);
end $$;

create function public.aprender_treinos(ficha uuid, treinos jsonb, resumo jsonb, descricao text) returns int
language plpgsql security definer set search_path = '' as $$
declare
	p public.personagens;
	custo int;
begin
	-- dois cliques seguidos não gastam nem aprendem duas vezes
	perform 1 from public.personagens where id = ficha for update;
	p := public.ficha_em_jogo(ficha, true);
	if jsonb_typeof(treinos) is distinct from 'array' or jsonb_array_length(treinos) not between 1 and 40 then raise exception 'Nada para treinar.' using errcode = 'P0001'; end if;
	custo := public.conferir_treinos(coalesce(p.dados, '{}'::jsonb), p.nivel, p.campanha_id, treinos);
	if p.pt < custo then raise exception 'PT insuficientes.' using errcode = 'P0001'; end if;
	update public.personagens set
		pt = pt - custo,
		dados = public.somar_ao_progresso(dados, 'treinos', treinos),
		resumo = aprender_treinos.resumo
	where id = p.id;
	perform public.registrar_ficha(p.id, 'treino', left('Treinou: ' || descricao || ' (−' || custo || ' PT)', 200), 'recurso/ic-recurso-pt');
	return p.pt - custo;
end $$;

create function public.alcancar_nivel(ficha uuid, escolha jsonb, resumo jsonb, estado jsonb) returns int
language plpgsql security definer set search_path = '' as $$
declare
	p public.personagens;
	k public.campanhas;
	novo int;
	pt_marco int;
	nome_jogador text;
begin
	perform 1 from public.personagens where id = ficha for update;
	p := public.ficha_em_jogo(ficha, true);
	novo := p.nivel + 1;
	if p.nivel >= 20 then raise exception 'Nível máximo alcançado.' using errcode = 'P0001'; end if;
	if p.xp < public.xp_do_nivel(novo) then raise exception 'XP insuficiente para o nível %.', novo using errcode = 'P0001'; end if;
	pt_marco := public.conferir_nivel(coalesce(p.dados, '{}'::jsonb), novo, escolha);
	update public.personagens set
		nivel = novo,
		pt = pt + 3 + pt_marco,
		dados = public.somar_ao_progresso(dados, 'niveis', jsonb_build_array(escolha)),
		resumo = alcancar_nivel.resumo,
		estado = alcancar_nivel.estado
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

revoke execute on function public.aprender_treinos(uuid, jsonb, jsonb, text), public.alcancar_nivel(uuid, jsonb, jsonb, jsonb) from public, anon;
grant execute on function public.aprender_treinos(uuid, jsonb, jsonb, text), public.alcancar_nivel(uuid, jsonb, jsonb, jsonb) to authenticated;
