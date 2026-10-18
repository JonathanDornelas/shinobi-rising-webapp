-- Lote 4 · Personagens (fichas) e o envio para a revisão do Mestre.
-- As escolhas da criação ficam em `dados` (jsonb) e o que as listas mostram em `resumo`; os cálculos são do app
-- (src/lib/personagem/regras.ts). O status só muda pelas funções abaixo, nunca por update direto.

create type public.status_ficha as enum ('rascunho', 'em_revisao', 'ajustes', 'aprovada', 'rejeitada');

create table public.personagens (
	id uuid primary key default gen_random_uuid(),
	campanha_id uuid not null references public.campanhas (id) on delete cascade,
	jogador_id uuid not null references public.perfis (id) on delete cascade,
	nome text not null default '' check (char_length(nome) <= 60),
	status public.status_ficha not null default 'rascunho',
	nivel int not null default 1 check (nivel between 1 and 20),
	xp int not null default 0 check (xp >= 0),
	dados jsonb not null default '{}'::jsonb,
	resumo jsonb not null default '{}'::jsonb,
	mensagem text check (char_length(mensagem) <= 2000),
	comentario_mestre text check (char_length(comentario_mestre) <= 2000),
	enviada_em timestamptz,
	decidida_em timestamptz,
	criada_em timestamptz not null default now(),
	atualizada_em timestamptz not null default now()
);
create index personagens_campanha on public.personagens (campanha_id, status);
-- uma ficha ativa por jogador em cada campanha (as rejeitadas não contam)
create unique index personagens_um_por_jogador on public.personagens (campanha_id, jogador_id) where status <> 'rejeitada';

create function public.campanha_ativa(c uuid) returns boolean
language sql stable security definer set search_path = '' as $$
	select exists (select 1 from public.campanhas k where k.id = c and k.arquivada_em is null);
$$;

alter table public.personagens enable row level security;
create policy "personagens: dono, Mestre e grupo (aprovadas) leem" on public.personagens for select to authenticated using (
	jogador_id = (select auth.uid()) or public.eh_mestre(campanha_id) or (status = 'aprovada' and public.eh_membro(campanha_id))
);
create policy "personagens: membro cria a própria" on public.personagens for insert to authenticated with check (
	jogador_id = (select auth.uid()) and status = 'rascunho' and public.eh_membro(campanha_id) and public.campanha_ativa(campanha_id)
);
create policy "personagens: dono edita rascunho ou ajustes" on public.personagens for update to authenticated
	using (jogador_id = (select auth.uid()) and status in ('rascunho', 'ajustes') and public.campanha_ativa(campanha_id))
	with check (jogador_id = (select auth.uid()));
create policy "personagens: dono apaga rascunho" on public.personagens for delete to authenticated
	using (jogador_id = (select auth.uid()) and status = 'rascunho');

create function public.personagem_antes_de_atualizar() returns trigger
language plpgsql set search_path = '' as $$
begin
	new.atualizada_em := now();
	return new;
end $$;
create trigger personagem_antes_de_atualizar before update on public.personagens
	for each row execute function public.personagem_antes_de_atualizar();

-- enviar para revisão (ou aprovar direto, se a campanha não exige aprovação de fichas)
create function public.enviar_ficha(ficha uuid) returns public.status_ficha
language plpgsql security definer set search_path = '' as $$
declare
	p public.personagens;
	k public.campanhas;
	novo public.status_ficha;
	nome_jogador text;
begin
	select * into p from public.personagens where id = ficha;
	if p.id is null or p.jogador_id is distinct from (select auth.uid()) then raise exception 'Ficha não encontrada.' using errcode = '42501'; end if;
	if p.status not in ('rascunho', 'ajustes') then raise exception 'Esta ficha já foi enviada.' using errcode = 'P0001'; end if;
	if char_length(trim(p.nome)) = 0 then raise exception 'Dê um nome ao personagem antes de enviar.' using errcode = 'P0001'; end if;
	select * into k from public.campanhas where id = p.campanha_id;
	if k.arquivada_em is not null then raise exception 'Campanha arquivada é somente leitura.' using errcode = 'P0001'; end if;

	novo := case when coalesce((k.aprovacao ->> 'fichas')::boolean, true) then 'em_revisao' else 'aprovada' end;
	update public.personagens set
		status = novo,
		enviada_em = now(),
		decidida_em = case when novo = 'aprovada' then now() else null end,
		comentario_mestre = case when novo = 'aprovada' then null else comentario_mestre end
	where id = p.id;

	select nome into nome_jogador from public.perfis where id = p.jogador_id;
	if novo = 'aprovada' then
		perform public.registrar_atividade(k.id, 'ficha_aprovada', 'Ficha de ' || p.nome || ' entrou na mesa', 'status/ic-status-aprovado');
	else
		perform public.registrar_atividade(k.id, 'ficha_enviada', nome_jogador || ' enviou a ficha de ' || p.nome || ' para revisão', 'acao/ic-acao-criar-personagem');
		if k.mestre_id is not null and k.mestre_id <> p.jogador_id then
			perform public.notificar(k.mestre_id, 'ficha_enviada', nome_jogador || ' enviou a ficha de ' || p.nome || ' para revisão',
				'/campanhas/' || k.id || '/personagens/' || p.id, 'status/ic-status-em-revisao');
		end if;
	end if;
	return novo;
end $$;

-- retirar da revisão enquanto o Mestre não decide
create function public.retirar_ficha(ficha uuid) returns void
language plpgsql security definer set search_path = '' as $$
begin
	update public.personagens set status = 'rascunho', enviada_em = null
	where id = ficha and jogador_id = (select auth.uid()) and status = 'em_revisao';
	if not found then raise exception 'Só dá para retirar fichas em revisão.' using errcode = 'P0001'; end if;
end $$;

-- decisão do Mestre: aprovar, pedir ajustes ou rejeitar (comentário obrigatório nos dois últimos)
create function public.decidir_ficha(ficha uuid, decisao public.status_ficha, comentario text default null) returns void
language plpgsql security definer set search_path = '' as $$
declare
	p public.personagens;
	k public.campanhas;
	nome_mestre text;
	frase text;
	icone text;
begin
	select * into p from public.personagens where id = ficha;
	if p.id is null or not public.eh_mestre(p.campanha_id) then raise exception 'Só o Mestre decide sobre a ficha.' using errcode = '42501'; end if;
	if p.status <> 'em_revisao' then raise exception 'Esta ficha não está em revisão.' using errcode = 'P0001'; end if;
	if decisao not in ('aprovada', 'ajustes', 'rejeitada') then raise exception 'Decisão inválida.' using errcode = 'P0001'; end if;
	if decisao <> 'aprovada' and char_length(trim(coalesce(comentario, ''))) = 0 then
		raise exception 'Explique o que precisa mudar.' using errcode = 'P0001';
	end if;
	select * into k from public.campanhas where id = p.campanha_id;
	if k.arquivada_em is not null then raise exception 'Campanha arquivada é somente leitura.' using errcode = 'P0001'; end if;

	update public.personagens set status = decisao, comentario_mestre = nullif(trim(coalesce(comentario, '')), ''), decidida_em = now() where id = p.id;

	select nome into nome_mestre from public.perfis where id = (select auth.uid());
	frase := case decisao when 'aprovada' then ' aprovou a ficha de ' when 'ajustes' then ' pediu ajustes na ficha de ' else ' rejeitou a ficha de ' end;
	icone := case decisao when 'aprovada' then 'status/ic-status-aprovado' when 'ajustes' then 'status/ic-status-ajustes' else 'status/ic-status-rejeitado' end;
	perform public.registrar_atividade(k.id, 'ficha_' || decisao::text, coalesce(nome_mestre, 'O Mestre') || frase || p.nome, icone);
	perform public.notificar(p.jogador_id, 'ficha_' || decisao::text, coalesce(nome_mestre, 'O Mestre') || frase || p.nome,
		'/campanhas/' || k.id || '/personagens/' || p.id, icone);
end $$;

-- ---------------------------------------------------------------- acesso
revoke all on public.personagens from anon;
grant select, delete on public.personagens to authenticated;
grant insert (campanha_id, jogador_id, nome, dados, resumo) on public.personagens to authenticated;
grant update (nome, dados, resumo, mensagem) on public.personagens to authenticated;
-- o Supabase concede EXECUTE a anon em funções novas; fecha tudo e libera só o necessário
revoke execute on function
	public.campanha_ativa(uuid),
	public.personagem_antes_de_atualizar(),
	public.enviar_ficha(uuid),
	public.retirar_ficha(uuid),
	public.decidir_ficha(uuid, public.status_ficha, text)
from public, anon, authenticated;
grant execute on function public.campanha_ativa(uuid) to authenticated;
grant execute on function public.enviar_ficha(uuid), public.retirar_ficha(uuid), public.decidir_ficha(uuid, public.status_ficha, text) to authenticated;
