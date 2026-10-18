-- Rolagens da campanha (cap. 2: vantagem e desvantagem, críticos), retrato do ninja (Storage) e capas das vilas.

-- ---------------------------------------------------------------- capas: paisagens das vilas
-- As capas genéricas viram as vilas do anime (a Floresta fica como o interior genérico dos Renegados).
alter table public.campanhas drop constraint campanhas_capa_check;
alter table public.campanhas disable trigger campanha_antes_de_atualizar;
update public.campanhas set capa = case capa
	when 'capa-nevoa' then 'capa-kiri'
	when 'capa-deserto' then 'capa-suna'
	when 'capa-montanha' then 'capa-kumo'
	when 'capa-chuva' then 'capa-ame'
	when 'capa-rochas' then 'capa-iwa'
	else capa end;
alter table public.campanhas enable trigger campanha_antes_de_atualizar;
alter table public.campanhas alter column capa set default 'capa-konoha';
alter table public.campanhas add constraint campanhas_capa_check
	check (capa in ('capa-konoha', 'capa-suna', 'capa-kiri', 'capa-kumo', 'capa-iwa', 'capa-ame', 'capa-taki', 'capa-oto', 'capa-floresta'));

-- ---------------------------------------------------------------- retrato do ninja
-- Arquivo em retratos/<id da ficha>/<nome>.webp (quadrado, recortado no navegador). Leitura pública pela URL.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('retratos', 'retratos', true, 262144, array['image/webp'])
on conflict (id) do nothing;

create function public.dono_da_pasta_retrato(caminho text) returns boolean
language sql stable security definer set search_path = '' as $$
	select exists (
		select 1 from public.personagens p
		where p.id::text = split_part(caminho, '/', 1) and p.jogador_id = (select auth.uid())
	);
$$;

create policy "retratos: dono envia" on storage.objects for insert to authenticated
	with check (bucket_id = 'retratos' and public.dono_da_pasta_retrato(name));
create policy "retratos: dono vê os seus" on storage.objects for select to authenticated
	using (bucket_id = 'retratos' and public.dono_da_pasta_retrato(name));
create policy "retratos: dono apaga" on storage.objects for delete to authenticated
	using (bucket_id = 'retratos' and public.dono_da_pasta_retrato(name));

alter table public.personagens add column retrato text
	check (retrato ~ '^[0-9a-f-]{36}/[a-z0-9-]{1,40}\.webp$' and split_part(retrato, '/', 1) = id::text);

-- vale em qualquer status: trocar o retrato não altera regras, então não volta para revisão
create function public.definir_retrato(ficha uuid, caminho text) returns void
language plpgsql security definer set search_path = '' as $$
declare
	p public.personagens;
begin
	select * into p from public.personagens where id = ficha;
	if p.id is null or p.jogador_id is distinct from (select auth.uid()) then raise exception 'Ficha não encontrada.' using errcode = '42501'; end if;
	if not public.campanha_ativa(p.campanha_id) then raise exception 'Campanha arquivada é somente leitura.' using errcode = 'P0001'; end if;
	if caminho is not null and caminho !~ ('^' || ficha::text || '/[a-z0-9-]{1,40}\.webp$') then
		raise exception 'Caminho de retrato inválido.' using errcode = 'P0001';
	end if;
	update public.personagens set retrato = caminho where id = ficha;
end $$;

drop function public.personagens_do_grupo(uuid);
create function public.personagens_do_grupo(campanha uuid)
returns table (id uuid, jogador_id uuid, nome text, nivel int, situacao text, pre_gerado boolean, retrato text, resumo jsonb)
language sql stable security definer set search_path = '' as $$
	select p.id, p.jogador_id, p.nome, p.nivel, p.situacao, p.pre_gerado, p.retrato,
		jsonb_build_object('cla', p.resumo -> 'cla', 'claNome', p.resumo -> 'claNome', 'claBrasao', p.resumo -> 'claBrasao',
			'vila', p.resumo -> 'vila', 'conceito', p.resumo -> 'conceito', 'time', p.resumo -> 'time', 'sensei', p.resumo -> 'sensei',
			'elementos', p.resumo -> 'elementos', 'especializacao', p.resumo -> 'especializacao')
	from public.personagens p
	where p.campanha_id = campanha and p.status = 'aprovada' and public.eh_membro(campanha)
	order by p.criada_em;
$$;

-- ---------------------------------------------------------------- rolagens
-- O servidor sorteia: o cliente só manda a expressão (ex.: 1d20+5, 2d6+1d4+3). Rolagem oculta: só o autor e o Mestre veem.
create table public.rolagens (
	id uuid primary key default gen_random_uuid(),
	campanha_id uuid not null references public.campanhas (id) on delete cascade,
	autor_id uuid references public.perfis (id) on delete set null,
	personagem_id uuid references public.personagens (id) on delete set null,
	-- nome mostrado no registro (o personagem, ou o jogador numa rolagem livre), congelado no momento
	quem text not null,
	rotulo text not null check (char_length(rotulo) between 1 and 80),
	expressao text not null check (char_length(expressao) <= 60),
	modo text not null default 'normal' check (modo in ('normal', 'vantagem', 'desvantagem', 'critico')),
	-- [{ "sinal": 1, "lados": 20, "valores": [13, 7], "usados": [13] } | { "sinal": 1, "valor": 5 }]
	detalhe jsonb not null,
	total int not null,
	-- o d20 que valeu (20 = crítico, 1 = falha crítica); null se não houve d20 sozinho
	d20 int,
	oculta boolean not null default false,
	criada_em timestamptz not null default now()
);
create index rolagens_campanha on public.rolagens (campanha_id, criada_em desc);
create index rolagens_autor on public.rolagens (autor_id, criada_em desc);

alter table public.rolagens enable row level security;
create policy "rolagens: membros leem (ocultas: autor e Mestre)" on public.rolagens for select to authenticated using (
	public.eh_membro(campanha_id) and (not oculta or autor_id = (select auth.uid()) or public.eh_mestre(campanha_id))
);
create policy "rolagens: Mestre apaga" on public.rolagens for delete to authenticated using (public.eh_mestre(campanha_id));

create function public.rolar(
	campanha uuid, expressao text, rotulo text, personagem uuid default null, modo text default 'normal', oculta boolean default false
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

	if personagem is not null then
		select p.nome into nome_quem from public.personagens p
		where p.id = personagem and p.campanha_id = campanha and (p.jogador_id = (select auth.uid()) or public.eh_mestre(campanha));
		if nome_quem is null then raise exception 'Ficha não encontrada.' using errcode = '42501'; end if;
	else
		select f.nome into nome_quem from public.perfis f where f.id = (select auth.uid());
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

	insert into public.rolagens (campanha_id, autor_id, personagem_id, quem, rotulo, expressao, modo, detalhe, total, d20, oculta)
	values (campanha, (select auth.uid()), personagem, coalesce(nome_quem, '?'), r, e, m, det, soma, nat, coalesce(rolar.oculta, false))
	returning * into nova;
	return nova;
end $$;

-- registro ao vivo (Supabase Realtime respeita o RLS de leitura)
do $$
begin
	if exists (select 1 from pg_publication where pubname = 'supabase_realtime') then
		alter publication supabase_realtime add table public.rolagens;
	end if;
end $$;

-- ---------------------------------------------------------------- acesso
revoke all on public.rolagens from anon;
grant select, delete on public.rolagens to authenticated;
revoke execute on function
	public.dono_da_pasta_retrato(text),
	public.definir_retrato(uuid, text),
	public.personagens_do_grupo(uuid),
	public.rolar(uuid, text, text, uuid, text, boolean)
from public, anon, authenticated;
grant execute on function
	public.dono_da_pasta_retrato(text),
	public.definir_retrato(uuid, text),
	public.personagens_do_grupo(uuid),
	public.rolar(uuid, text, text, uuid, text, boolean)
to authenticated;
