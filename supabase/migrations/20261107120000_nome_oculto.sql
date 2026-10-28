-- Nome de NPC escondido do grupo. O Mestre liga "Esconder o nome" num NPC (do bestiário, rápido, tropa ou ficha completa
-- marcada como NPC) e para os jogadores ele vira "???" em todo lugar que o banco entrega: token, sigla, registro de
-- rolagens, ordem de iniciativa e a lista de NPCs revelados. O nome verdadeiro fica só nas tabelas que o Mestre lê.

alter table public.npcs add column nome_oculto boolean not null default false;
alter table public.personagens add column nome_oculto boolean not null default false;
alter table public.personagens add constraint personagens_nome_oculto_so_npc check (not nome_oculto or npc);
alter table public.mesa_tokens add column nome_oculto boolean not null default false;

-- A sigla do token (as iniciais), como a Mesa calcula ao pôr o NPC em cena; tropa leva a 1ª inicial e o número do membro.
create function public.sigla_do_nome(nome text, membro int default null) returns text
language sql immutable set search_path = '' as $$
	select case when membro is not null then left(s, 1) || membro else s end
	from (
		select coalesce(
			nullif(upper(left((select string_agg(left(w.p, 1), '' order by w.n) from regexp_split_to_table(trim(coalesce(nome, '')), '\s+') with ordinality as w (p, n) where char_length(w.p) > 2), 2)), ''),
			upper(left(trim(coalesce(nome, '')), 2))
		) as s
	) x;
$$;

-- ---------------------------------------------------------------- tokens: o nome já nasce escondido
-- (a função é a de 20261102 mais o nome escondido: nasce da ficha e o jogador não mexe)
create or replace function public.mesa_token_antes() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
	if tg_op = 'INSERT' then
		select c.campanha_id into new.campanha_id from public.mesa_cenas c where c.id = new.cena_id;
		if new.npc_id is not null and not exists (select 1 from public.npcs n where n.id = new.npc_id and n.campanha_id = new.campanha_id) then
			raise exception 'NPC não encontrado.' using errcode = 'P0001';
		end if;
		if new.personagem_id is not null and not exists (select 1 from public.personagens p where p.id = new.personagem_id and p.campanha_id = new.campanha_id) then
			raise exception 'Personagem não encontrado.' using errcode = 'P0001';
		end if;
		if new.x >= (select c.largura from public.mesa_cenas c where c.id = new.cena_id) or new.y >= (select c.altura from public.mesa_cenas c where c.id = new.cena_id) then
			raise exception 'Fora da cena.' using errcode = 'P0001';
		end if;
		-- o nome escondido vem do NPC, da ficha de NPC ou do token a que o clone pertence (nunca do que o cliente mandou)
		new.nome_oculto := coalesce(
			(select n.nome_oculto from public.npcs n where n.id = new.npc_id),
			(select p.nome_oculto from public.personagens p where p.id = new.personagem_id),
			(select t.nome_oculto from public.mesa_tokens t where t.id = new.ligado_a),
			false);
		if new.nome_oculto then new.nome := '???'; new.sigla := '?'; end if;
		return new;
	end if;
	new.atualizado_em := now();
	-- a proteção vale para quem edita o token direto; as cópias da ficha e do NPC chegam por outro gatilho
	if not public.eh_mestre(old.campanha_id) and pg_trigger_depth() < 2 then
		if not public.mesa_cena_aberta(old.cena_id) then raise exception 'Mesa travada pelo Mestre.' using errcode = 'P0001'; end if;
		new.id := old.id; new.cena_id := old.cena_id; new.campanha_id := old.campanha_id; new.personagem_id := old.personagem_id;
		new.npc_id := old.npc_id; new.membro := old.membro; new.ligado_a := old.ligado_a; new.dono_id := old.dono_id;
		new.visivel := old.visivel; new.aliado := old.aliado; new.criado_em := old.criado_em;
		new.nome_oculto := old.nome_oculto;
		if old.nome_oculto then new.nome := old.nome; new.sigla := old.sigla; end if;
		-- crescer guarda o tamanho normal (e pode crescer de novo); voltar devolve o normal e limpa a marca
		if not (
			(new.tamanho_base is not distinct from coalesce(old.tamanho_base, old.tamanho))
			or (new.tamanho_base is null and old.tamanho_base is not null and new.tamanho = old.tamanho_base)
		) then
			new.tamanho := old.tamanho; new.tamanho_base := old.tamanho_base; new.crescido_turnos := old.crescido_turnos;
		end if;
		if old.personagem_id is not null then new.pv := old.pv; new.pv_max := old.pv_max; new.ferimento := old.ferimento; new.condicoes := old.condicoes; end if;
	end if;
	-- escondido é escondido: nem o Mestre grava o nome verdadeiro no token (ele o lê do NPC)
	if new.nome_oculto then new.nome := '???'; new.sigla := '?'; end if;
	if new.x >= (select c.largura from public.mesa_cenas c where c.id = new.cena_id) or new.y >= (select c.altura from public.mesa_cenas c where c.id = new.cena_id) then
		raise exception 'Fora da cena.' using errcode = 'P0001';
	end if;
	if new.personagem_id is null and new.npc_id is null and new.pv is not null then
		new.ferimento := public.faixa_ferimento(new.pv, new.pv_max);
	end if;
	return new;
end $$;

-- ---------------------------------------------------------------- rolagens: o "quem" já nasce escondido
create function public.rolagem_nome_oculto() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
	if coalesce(
		(select n.nome_oculto from public.npcs n where n.id = new.npc_id),
		(select p.nome_oculto from public.personagens p where p.id = new.personagem_id),
		false) then
		new.quem := '???';
	end if;
	return new;
end $$;
create trigger rolagem_nome_oculto before insert on public.rolagens for each row execute function public.rolagem_nome_oculto();

-- ---------------------------------------------------------------- ligar e desligar: o que já foi escrito acompanha
create function public.nome_oculto_sincroniza() returns trigger
language plpgsql security definer set search_path = '' as $$
declare
	ficha boolean := tg_table_name = 'personagens';
	mostrado text := case when new.nome_oculto then '???' else new.nome end;
begin
	if new.nome_oculto is not distinct from old.nome_oculto then return new; end if;
	-- tokens do NPC (cada membro da tropa leva a sua sigla)
	update public.mesa_tokens t set nome_oculto = new.nome_oculto, nome = left(mostrado, 60),
		sigla = case when new.nome_oculto then '?' else public.sigla_do_nome(new.nome, t.membro) end
	where case when ficha then t.personagem_id else t.npc_id end = new.id;
	-- clones, invocações e companheiros desses tokens, em qualquer nível
	with recursive filhos as (
		select t.id from public.mesa_tokens t where t.ligado_a in (select x.id from public.mesa_tokens x where case when ficha then x.personagem_id else x.npc_id end = new.id)
		union
		select t.id from public.mesa_tokens t join filhos f on t.ligado_a = f.id
	)
	update public.mesa_tokens c set nome_oculto = new.nome_oculto,
		nome = case when new.nome_oculto then '???' else left('Clone de ' || split_part(new.nome, ' ', 1), 60) end,
		sigla = case when new.nome_oculto then '?' else 'CL' end
	where c.id in (select id from filhos);
	-- o registro de rolagens
	update public.rolagens r set quem = mostrado
	where case when ficha then r.personagem_id else r.npc_id end = new.id;
	-- a ordem de iniciativa das cenas
	update public.mesa_cenas c set iniciativa = jsonb_set(c.iniciativa, '{ordem}', (
		select jsonb_agg(case when e ->> 'npc_id' = new.id::text or e ->> 'personagem_id' = new.id::text then jsonb_set(e, '{nome}', to_jsonb(mostrado)) else e end order by o)
		from jsonb_array_elements(c.iniciativa -> 'ordem') with ordinality as x (e, o)))
	where c.campanha_id = new.campanha_id and jsonb_typeof(c.iniciativa -> 'ordem') = 'array' and position(new.id::text in c.iniciativa::text) > 0;
	return new;
end $$;
create trigger npc_nome_oculto after update of nome_oculto on public.npcs for each row execute function public.nome_oculto_sincroniza();
create trigger ficha_nome_oculto after update of nome_oculto on public.personagens for each row execute function public.nome_oculto_sincroniza();

-- Só o Mestre muda (a ficha de NPC não tem permissão de coluna para o cliente; o NPC também passa por aqui).
create function public.definir_nome_oculto(alvo text, id uuid, oculto boolean) returns void
language plpgsql security definer set search_path = '' as $$
declare
	k uuid;
begin
	if alvo = 'npc' then
		select x.campanha_id into k from public.npcs x where x.id = definir_nome_oculto.id;
	elsif alvo = 'ficha' then
		select x.campanha_id into k from public.personagens x where x.id = definir_nome_oculto.id and x.npc;
	else
		raise exception 'Alvo inválido.' using errcode = 'P0001';
	end if;
	if k is null or not public.eh_mestre(k) then raise exception 'Só o Mestre esconde o nome.' using errcode = '42501'; end if;
	if alvo = 'npc' then
		update public.npcs set nome_oculto = coalesce(oculto, false) where npcs.id = definir_nome_oculto.id;
	else
		update public.personagens set nome_oculto = coalesce(oculto, false) where personagens.id = definir_nome_oculto.id;
	end if;
end $$;

-- ---------------------------------------------------------------- NPCs revelados: o nome sai como ???
drop function public.npcs_revelados(uuid);
create function public.npcs_revelados(campanha uuid)
returns table (id uuid, nome text, funcao text, origem text, aparencia text, rank text, tags text[], retrato text)
language sql stable security definer set search_path = '' as $$
	select n.id, case when n.nome_oculto then '???' else n.nome end, n.funcao, n.origem, n.aparencia, n.rank, n.tags, n.retrato
	from public.npcs n
	where n.campanha_id = campanha and n.revelado and public.eh_membro(campanha)
	order by case when n.nome_oculto then '???' else n.nome end;
$$;

revoke execute on function public.sigla_do_nome(text, int), public.mesa_token_antes(), public.rolagem_nome_oculto(), public.nome_oculto_sincroniza(),
	public.definir_nome_oculto(text, uuid, boolean), public.npcs_revelados(uuid) from public, anon, authenticated;
grant execute on function public.definir_nome_oculto(text, uuid, boolean), public.npcs_revelados(uuid) to authenticated;
