-- NPC com ficha completa (ficha do Mestre marcada npc), capa da ficha (paisagem), rolagens de NPC e o jogador que rolou.

-- ---------------------------------------------------------------- NPC com ficha completa
-- Uma ficha comum do Mestre, criada no mesmo criador, que fica fora do grupo: não conta como a ficha dele,
-- não aparece para os jogadores, não vai para a fila de aprovações nem recebe recompensas.
alter table public.personagens add column npc boolean not null default false;
alter table public.personagens add constraint personagens_npc_nao_pre_gerado check (not (npc and pre_gerado));
grant insert (npc) on public.personagens to authenticated;

drop index public.personagens_um_por_jogador;
create unique index personagens_um_por_jogador on public.personagens (campanha_id, jogador_id)
	where status <> 'rejeitada' and situacao = 'ativo' and not pre_gerado and not npc;

create or replace function public.personagem_confere_pre_gerado() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
	if (new.pre_gerado or new.npc) and (tg_op = 'INSERT' or (new.pre_gerado and not old.pre_gerado) or (new.npc and not old.npc)) and not exists (
		select 1 from public.campanhas k where k.id = new.campanha_id and k.mestre_id = new.jogador_id
	) then
		raise exception 'Só o Mestre cria personagens pré-gerados e NPCs.' using errcode = '42501';
	end if;
	return new;
end $$;
drop trigger personagem_confere_pre_gerado on public.personagens;
create trigger personagem_confere_pre_gerado before insert or update of pre_gerado, npc on public.personagens
	for each row execute function public.personagem_confere_pre_gerado();

-- ---------------------------------------------------------------- capa da ficha
-- Paisagem no topo da ficha: por padrão a da vila do personagem; o dono pode escolher outra.
alter table public.personagens add column capa text
	check (capa in ('capa-konoha', 'capa-suna', 'capa-kiri', 'capa-kumo', 'capa-iwa', 'capa-ame', 'capa-taki', 'capa-oto', 'capa-floresta'));

create function public.definir_capa_ficha(ficha uuid, capa text) returns void
language plpgsql security definer set search_path = '' as $$
declare
	p public.personagens;
begin
	select * into p from public.personagens where id = ficha;
	if p.id is null or p.jogador_id is distinct from (select auth.uid()) then raise exception 'Ficha não encontrada.' using errcode = '42501'; end if;
	if not public.campanha_ativa(p.campanha_id) then raise exception 'Campanha arquivada é somente leitura.' using errcode = 'P0001'; end if;
	update public.personagens set capa = definir_capa_ficha.capa where id = ficha;
end $$;

drop function public.personagens_do_grupo(uuid);
create function public.personagens_do_grupo(campanha uuid)
returns table (id uuid, jogador_id uuid, nome text, nivel int, situacao text, pre_gerado boolean, retrato text, capa text, resumo jsonb)
language sql stable security definer set search_path = '' as $$
	select p.id, p.jogador_id, p.nome, p.nivel, p.situacao, p.pre_gerado, p.retrato, p.capa,
		jsonb_build_object('cla', p.resumo -> 'cla', 'claNome', p.resumo -> 'claNome', 'claBrasao', p.resumo -> 'claBrasao',
			'vila', p.resumo -> 'vila', 'conceito', p.resumo -> 'conceito', 'time', p.resumo -> 'time', 'sensei', p.resumo -> 'sensei',
			'elementos', p.resumo -> 'elementos', 'especializacao', p.resumo -> 'especializacao')
	from public.personagens p
	where p.campanha_id = campanha and p.status = 'aprovada' and not p.npc and public.eh_membro(campanha)
	order by p.criada_em;
$$;

-- ---------------------------------------------------------------- rolagens: jogador e NPC
-- `jogador`: nome de quem rolou (congelado), mostrado junto do personagem no registro.
alter table public.rolagens add column jogador text;
alter table public.rolagens add column npc_id uuid references public.npcs (id) on delete set null;
update public.rolagens r set jogador = f.nome from public.perfis f where f.id = r.autor_id and r.jogador is null;

drop function public.rolar(uuid, text, text, uuid, text, boolean);
create function public.rolar(
	campanha uuid, expressao text, rotulo text, personagem uuid default null, modo text default 'normal', oculta boolean default false, npc uuid default null
) returns public.rolagens
language plpgsql security definer set search_path = '' as $$
declare
	e text := lower(regexp_replace(coalesce(expressao, ''), '\s', '', 'g'));
	r text := trim(coalesce(rotulo, ''));
	m text := coalesce(modo, 'normal');
	termo text[];
	sinal int;
	n int;
	lados int;
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
	if char_length(r) = 0 then r := e; end if;
	if char_length(r) > 80 then r := left(r, 80); end if;
	if char_length(e) > 60 or e !~ '^[+-]?(\d{1,2}d\d{1,3}|\d{1,3})([+-](\d{1,2}d\d{1,3}|\d{1,3}))*$' then
		raise exception 'Expressão inválida. Use algo como 1d20+5 ou 2d6+3.' using errcode = 'P0001';
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

	for termo in select regexp_matches(e, '([+-]?)(\d+d\d+|\d+)', 'g') loop
		sinal := case when termo[1] = '-' then -1 else 1 end;
		if position('d' in termo[2]) > 0 then
			n := split_part(termo[2], 'd', 1)::int;
			lados := split_part(termo[2], 'd', 2)::int;
			if n < 1 or lados not in (2, 3, 4, 6, 8, 10, 12, 20, 100) then
				raise exception 'Use dados de 2, 3, 4, 6, 8, 10, 12, 20 ou 100 lados.' using errcode = 'P0001';
			end if;
			-- crítico (cap. 4): os dados de dano dobram
			if m = 'critico' then n := n * 2; end if;
			qtd := qtd + n;
			if qtd > 60 then raise exception 'Dados demais numa rolagem só (máximo 60).' using errcode = 'P0001'; end if;
			vals := array(select 1 + floor(random() * lados)::int from generate_series(1, n));
			usados := vals;
			if lados = 20 and n = 1 and d20_livre then
				-- vantagem e desvantagem (cap. 2): o d20 é lançado duas vezes; fica o maior ou o menor
				if m in ('vantagem', 'desvantagem') then
					vals := vals || (1 + floor(random() * 20)::int);
					usados := array[case when m = 'vantagem' then greatest(vals[1], vals[2]) else least(vals[1], vals[2]) end];
				end if;
				nat := usados[1];
				d20_livre := false;
			end if;
			soma := soma + sinal * (select sum(v) from unnest(usados) v);
			det := det || jsonb_build_array(jsonb_build_object('sinal', sinal, 'lados', lados, 'valores', to_jsonb(vals), 'usados', to_jsonb(usados)));
		else
			soma := soma + sinal * termo[2]::int;
			det := det || jsonb_build_array(jsonb_build_object('sinal', sinal, 'valor', termo[2]::int));
		end if;
	end loop;
	if qtd = 0 then raise exception 'Inclua pelo menos um dado (ex.: 1d20).' using errcode = 'P0001'; end if;

	insert into public.rolagens (campanha_id, autor_id, personagem_id, npc_id, quem, jogador, rotulo, expressao, modo, detalhe, total, d20, oculta)
	values (campanha, (select auth.uid()), case when rolar.npc is null then personagem end, rolar.npc, coalesce(nome_quem, '?'), nome_jogador, r, e, m, det, soma, nat, coalesce(rolar.oculta, false))
	returning * into nova;
	return nova;
end $$;

-- ---------------------------------------------------------------- acesso
revoke execute on function
	public.personagem_confere_pre_gerado(),
	public.definir_capa_ficha(uuid, text),
	public.personagens_do_grupo(uuid),
	public.rolar(uuid, text, text, uuid, text, boolean, uuid)
from public, anon, authenticated;
grant execute on function
	public.definir_capa_ficha(uuid, text),
	public.personagens_do_grupo(uuid),
	public.rolar(uuid, text, text, uuid, text, boolean, uuid)
to authenticated;
