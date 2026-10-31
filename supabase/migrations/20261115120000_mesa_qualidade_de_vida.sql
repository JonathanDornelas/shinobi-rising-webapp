-- Mesa: ferramentas de qualidade de vida (planos/mesa-ferramentas-qol.md): a Reação da rodada, os relógios e o clima da
-- cena e o diário do grupo.

-- Reação da rodada: o token já gastou a Reação (Esquiva Ativa, Kawarimi, golpe de oportunidade) nesta rodada. O dono e o
-- Mestre marcam; o Mestre zera todas na rodada nova. Não entra na proteção de mesa_token_antes: o dono pode mudar.
alter table public.mesa_tokens add column reagiu boolean not null default false;

-- Relógios da cena: contagens que todos veem ("a ponte cai em 3 rodadas"). Cada um: { id, nome, total, marcados,
-- rodada (desce sozinho a cada rodada nova) }. Só o Mestre muda a cena.
alter table public.mesa_cenas
	add column relogios jsonb not null default '[]'::jsonb
		check (jsonb_typeof(relogios) = 'array' and jsonb_array_length(relogios) <= 8 and pg_column_size(relogios) <= 4000);

-- Clima da cena: uma camada animada sobre o mapa inteiro.
alter table public.mesa_cenas
	add column clima text check (clima in ('chuva', 'neve', 'nevoa', 'folhas', 'petalas', 'cinzas'));

-- Diário do grupo: missões, NPCs e pistas da campanha. As entradas públicas, o grupo todo lê e edita; as privadas, só
-- quem escreveu. O Mestre apaga as públicas.
create table public.mesa_diario (
	id uuid primary key default gen_random_uuid(),
	campanha_id uuid not null references public.campanhas (id) on delete cascade,
	autor_id uuid not null default auth.uid() references public.perfis (id) on delete cascade,
	tipo text not null check (tipo in ('missao', 'npc', 'pista', 'nota')),
	titulo text not null check (char_length(trim(titulo)) between 1 and 80),
	texto text not null default '' check (char_length(texto) <= 4000),
	privado boolean not null default false,
	feito boolean not null default false,
	criado_em timestamptz not null default now(),
	atualizado_em timestamptz not null default now()
);
create index mesa_diario_campanha on public.mesa_diario (campanha_id, tipo);
alter table public.mesa_diario enable row level security;
create policy "mesa_diario: o grupo lê as públicas, cada um as suas" on public.mesa_diario for select to authenticated
	using (public.eh_membro(campanha_id) and (not privado or autor_id = (select auth.uid())));
create policy "mesa_diario: cada um escreve as suas" on public.mesa_diario for insert to authenticated
	with check (public.eh_membro(campanha_id) and public.campanha_ativa(campanha_id) and autor_id = (select auth.uid()));
create policy "mesa_diario: o grupo edita as públicas, cada um as suas" on public.mesa_diario for update to authenticated
	using (public.eh_membro(campanha_id) and (not privado or autor_id = (select auth.uid())))
	with check (public.eh_membro(campanha_id) and public.campanha_ativa(campanha_id) and (not privado or autor_id = (select auth.uid())));
create policy "mesa_diario: quem escreveu apaga, o Mestre apaga as públicas" on public.mesa_diario for delete to authenticated
	using (autor_id = (select auth.uid()) or (public.eh_mestre(campanha_id) and not privado));

-- ninguém troca a campanha ou o autor de uma entrada; só quem escreveu a torna privada
create function public.mesa_diario_antes() returns trigger
language plpgsql set search_path = '' as $$
begin
	new.campanha_id := old.campanha_id;
	new.autor_id := old.autor_id;
	new.criado_em := old.criado_em;
	if new.privado and not old.privado and old.autor_id <> (select auth.uid()) then
		raise exception 'Só quem escreveu pode tornar a entrada privada.' using errcode = 'P0001';
	end if;
	new.atualizado_em := now();
	return new;
end $$;
create trigger mesa_diario_antes before update on public.mesa_diario for each row execute function public.mesa_diario_antes();

grant select, insert, update, delete on public.mesa_diario to authenticated;
revoke execute on function public.mesa_diario_antes() from public, anon;

do $$
begin
	if exists (select 1 from pg_publication where pubname = 'supabase_realtime') then
		alter publication supabase_realtime add table public.mesa_diario;
	end if;
end $$;
