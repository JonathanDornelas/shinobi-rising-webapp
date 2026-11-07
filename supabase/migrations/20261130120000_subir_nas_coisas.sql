-- Subir nas coisas: num mapa vivo o token fica em cima de telhados, pontes e caixas, numa altura que vem do mapa (um telhado a 3,2 m), e quem
-- move o token sobe e desce com ele. A elevação passa a aceitar metros quebrados e deixa de ser só do Mestre.
alter table public.mesa_tokens alter column elevacao type real;

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
