-- Fotos dos NPCs rápidos do Mestre e avatar do perfil, no mesmo bucket "retratos" das fichas:
--   retratos/<id do NPC>/<nome>.webp      → o Mestre da campanha envia e apaga
--   retratos/<id do usuário>/<nome>.webp  → a própria conta envia e apaga (avatar)
-- Leitura pública pela URL, como os retratos das fichas.

-- ---------------------------------------------------------------- colunas
alter table public.npcs add column retrato text
	check (retrato ~ '^[0-9a-f-]{36}/[a-z0-9-]{1,40}\.webp$' and split_part(retrato, '/', 1) = id::text);

alter table public.perfis add constraint perfis_avatar_check
	check (avatar is null or (avatar ~ '^[0-9a-f-]{36}/[a-z0-9-]{1,40}\.webp$' and split_part(avatar, '/', 1) = id::text));

-- ---------------------------------------------------------------- Storage
-- quem envia para a pasta: o dono da ficha, o Mestre do NPC ou a própria conta
create or replace function public.dono_da_pasta_retrato(caminho text) returns boolean
language sql stable security definer set search_path = '' as $$
	select exists (
		select 1 from public.personagens p
		where p.id::text = split_part(caminho, '/', 1) and p.jogador_id = (select auth.uid())
	) or exists (
		select 1 from public.npcs n
		where n.id::text = split_part(caminho, '/', 1) and public.eh_mestre(n.campanha_id)
	) or split_part(caminho, '/', 1) = (select auth.uid())::text;
$$;

-- quem vê (pela API) e apaga: além do dono, o Mestre apaga os retratos das fichas e dos NPCs da campanha
create or replace function public.pode_apagar_retrato(caminho text) returns boolean
language sql stable security definer set search_path = '' as $$
	select exists (
		select 1 from public.personagens p
		where p.id::text = split_part(caminho, '/', 1) and (p.jogador_id = (select auth.uid()) or public.eh_mestre(p.campanha_id))
	) or exists (
		select 1 from public.npcs n
		where n.id::text = split_part(caminho, '/', 1) and public.eh_mestre(n.campanha_id)
	) or split_part(caminho, '/', 1) = (select auth.uid())::text;
$$;

-- ---------------------------------------------------------------- NPCs revelados ao grupo, agora com a foto
drop function public.npcs_revelados(uuid);
create function public.npcs_revelados(campanha uuid)
returns table (id uuid, nome text, funcao text, origem text, aparencia text, rank text, tags text[], retrato text)
language sql stable security definer set search_path = '' as $$
	select n.id, n.nome, n.funcao, n.origem, n.aparencia, n.rank, n.tags, n.retrato
	from public.npcs n
	where n.campanha_id = campanha and n.revelado and public.eh_membro(campanha)
	order by n.nome;
$$;

revoke execute on function public.npcs_revelados(uuid), public.dono_da_pasta_retrato(text), public.pode_apagar_retrato(text) from public, anon, authenticated;
grant execute on function public.npcs_revelados(uuid), public.dono_da_pasta_retrato(text), public.pode_apagar_retrato(text) to authenticated;
