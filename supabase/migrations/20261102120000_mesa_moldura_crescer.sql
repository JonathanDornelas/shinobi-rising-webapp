-- Mesa: a moldura que o Mestre escolhe para a campanha e o token que cresce por um jutsu.
-- Moldura: vale nos NPCs e em quem não escolheu a sua; com "universal", em todos os tokens, por cima da escolha dos
-- jogadores. Crescer (Baika no Jutsu, Lobo de Duas Cabeças): o token guarda o tamanho normal e os turnos que faltam; o
-- jogador pode crescer o próprio token e voltar, mas não mudar o tamanho de outro jeito.
alter table public.campanhas
	add column moldura text check (moldura is null or moldura ~ '^[a-z-]{1,30}$'),
	add column moldura_universal boolean not null default false;

alter table public.mesa_tokens
	add column tamanho_base int check (tamanho_base is null or tamanho_base in (1, 3, 6, 10)),
	add column crescido_turnos int check (crescido_turnos is null or crescido_turnos between 0 and 99);

-- a campanha vem da cena; o jogador só muda posição, metros do turno, estados e PV dos próprios tokens, e o tamanho
-- pelo jutsu de crescer
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
		return new;
	end if;
	new.atualizado_em := now();
	-- a proteção vale para quem edita o token direto; as cópias da ficha e do NPC chegam por outro gatilho
	if not public.eh_mestre(old.campanha_id) and pg_trigger_depth() < 2 then
		if not public.mesa_cena_aberta(old.cena_id) then raise exception 'Mesa travada pelo Mestre.' using errcode = 'P0001'; end if;
		new.id := old.id; new.cena_id := old.cena_id; new.campanha_id := old.campanha_id; new.personagem_id := old.personagem_id;
		new.npc_id := old.npc_id; new.membro := old.membro; new.ligado_a := old.ligado_a; new.dono_id := old.dono_id;
		new.visivel := old.visivel; new.aliado := old.aliado; new.criado_em := old.criado_em;
		-- crescer guarda o tamanho normal (e pode crescer de novo); voltar devolve o normal e limpa a marca
		if not (
			(new.tamanho_base is not distinct from coalesce(old.tamanho_base, old.tamanho))
			or (new.tamanho_base is null and old.tamanho_base is not null and new.tamanho = old.tamanho_base)
		) then
			new.tamanho := old.tamanho; new.tamanho_base := old.tamanho_base; new.crescido_turnos := old.crescido_turnos;
		end if;
		if old.personagem_id is not null then new.pv := old.pv; new.pv_max := old.pv_max; new.ferimento := old.ferimento; new.condicoes := old.condicoes; end if;
	end if;
	if new.x >= (select c.largura from public.mesa_cenas c where c.id = new.cena_id) or new.y >= (select c.altura from public.mesa_cenas c where c.id = new.cena_id) then
		raise exception 'Fora da cena.' using errcode = 'P0001';
	end if;
	if new.personagem_id is null and new.npc_id is null and new.pv is not null then
		new.ferimento := public.faixa_ferimento(new.pv, new.pv_max);
	end if;
	return new;
end $$;
