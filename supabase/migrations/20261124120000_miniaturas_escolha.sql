-- Miniaturas, segunda parte:
-- * a campanha guarda o tamanho delas no quadro: `miniaturas` = { escala: 1, ajustes: { "<id>": 1.1 } } (todas e cada uma);
-- * o personagem e o NPC guardam a miniatura escolhida (de todo o catálogo), e o token novo já nasce com ela;
-- * definir_miniatura(): o Mestre escolhe para qualquer um; o jogador, para o próprio personagem. Os tokens dele que já
--   estão nas cenas trocam junto, por gatilho (como as cópias da ficha, que a proteção do token deixa passar).
alter table public.campanhas
	add column miniaturas jsonb not null default '{}'::jsonb check (jsonb_typeof(miniaturas) = 'object' and pg_column_size(miniaturas) < 20000);
alter table public.personagens add column miniatura text check (miniatura ~ '^[a-z0-9-]{1,60}$');
alter table public.npcs add column miniatura text check (miniatura ~ '^[a-z0-9-]{1,60}$');

create or replace function public.definir_miniatura(tipo text, alvo uuid, miniatura text)
returns void
language plpgsql security definer set search_path = '' as $$
declare
	c uuid;
	dono uuid;
begin
	if miniatura is not null and miniatura !~ '^[a-z0-9-]{1,60}$' then raise exception 'Miniatura inválida.' using errcode = '22023'; end if;
	if tipo = 'personagem' then
		select p.campanha_id, p.jogador_id into c, dono from public.personagens p where p.id = alvo;
		if c is null or not (public.eh_mestre(c) or dono = (select auth.uid())) then raise exception 'Sem permissão.' using errcode = '42501'; end if;
		update public.personagens p set miniatura = definir_miniatura.miniatura where p.id = alvo;
	elsif tipo = 'npc' then
		select n.campanha_id into c from public.npcs n where n.id = alvo;
		if c is null or not public.eh_mestre(c) then raise exception 'Sem permissão.' using errcode = '42501'; end if;
		update public.npcs n set miniatura = definir_miniatura.miniatura where n.id = alvo;
	else
		raise exception 'Tipo inválido.' using errcode = '22023';
	end if;
end $$;
revoke all on function public.definir_miniatura(text, uuid, text) from public, anon;
grant execute on function public.definir_miniatura(text, uuid, text) to authenticated;

-- a miniatura do personagem ou do NPC vai para os tokens dele em todas as cenas
create or replace function public.miniatura_nos_tokens()
returns trigger
language plpgsql security definer set search_path = '' as $$
begin
	if new.miniatura is distinct from old.miniatura then
		if tg_table_name = 'personagens' then
			update public.mesa_tokens t set miniatura = new.miniatura where t.personagem_id = new.id;
		else
			update public.mesa_tokens t set miniatura = new.miniatura where t.npc_id = new.id;
		end if;
	end if;
	return null;
end $$;
revoke all on function public.miniatura_nos_tokens() from public, anon, authenticated;
create trigger personagens_miniatura after update of miniatura on public.personagens for each row execute function public.miniatura_nos_tokens();
create trigger npcs_miniatura after update of miniatura on public.npcs for each row execute function public.miniatura_nos_tokens();

-- o token novo nasce com a miniatura do personagem, do NPC ou do token de quem ele é clone
create or replace function public.mesa_tokens_miniatura()
returns trigger
language plpgsql security definer set search_path = '' as $$
begin
	if new.miniatura is null then
		new.miniatura := coalesce(
			(select p.miniatura from public.personagens p where p.id = new.personagem_id),
			(select n.miniatura from public.npcs n where n.id = new.npc_id),
			(select t.miniatura from public.mesa_tokens t where t.id = new.ligado_a));
	end if;
	return new;
end $$;
revoke all on function public.mesa_tokens_miniatura() from public, anon, authenticated;
create trigger mesa_tokens_miniatura before insert on public.mesa_tokens for each row execute function public.mesa_tokens_miniatura();
