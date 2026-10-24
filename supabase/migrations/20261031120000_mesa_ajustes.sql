-- L11 · ajustes da Mesa: o NPC que vem do bestiário guarda os jutsus, o acerto, a DT, a arte e o verbete de origem (a
-- ficha rápida mostra a aba de jutsus e o token, a arte); e cada cena escolhe quais personagens jogam nela.

alter table public.npcs
	add column jutsus text[] not null default '{}' check (cardinality(jutsus) <= 24),
	add column acerto int check (acerto between -10 and 50),
	add column dt int check (dt between 0 and 60),
	-- arte do bestiário (/bestiario/<arquivo>.png); a foto enviada pelo Mestre continua em `retrato`
	add column arte text check (char_length(arte) <= 200 and arte like '/bestiario/%'),
	-- verbete e estágio de origem ("cla-aburame#chunin")
	add column bestiario text check (char_length(bestiario) <= 120);

-- personagens (fichas) que jogam nesta cena; null = todo o grupo
alter table public.mesa_cenas add column participantes uuid[] check (cardinality(participantes) <= 30);

create function public.mesa_participa(cena uuid, ficha uuid) returns boolean
language sql stable security definer set search_path = '' as $$
	select exists (select 1 from public.mesa_cenas c where c.id = cena and (c.participantes is null or ficha = any (c.participantes)));
$$;

-- o jogador só entra na cena com um personagem que participa dela
drop policy "mesa_tokens: Mestre põe qualquer um, jogador põe os seus" on public.mesa_tokens;
create policy "mesa_tokens: Mestre põe qualquer um, jogador põe os seus" on public.mesa_tokens for insert to authenticated
	with check (public.mesa_cena_aberta(cena_id) and (public.eh_mestre(campanha_id) or (
		dono_id = (select auth.uid()) and npc_id is null and visivel and (
			(personagem_id is not null and ligado_a is null and public.mesa_participa(cena_id, personagem_id) and exists (select 1 from public.personagens p
				where p.id = personagem_id and p.jogador_id = (select auth.uid()) and p.status = 'aprovada' and not p.npc))
			or (personagem_id is null and ligado_a is not null and public.mesa_token_do_usuario(ligado_a))
		))));

revoke execute on function public.mesa_participa(uuid, uuid) from public, anon, authenticated;
grant execute on function public.mesa_participa(uuid, uuid) to authenticated;
