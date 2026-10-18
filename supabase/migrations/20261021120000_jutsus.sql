-- Lote 7 · Jutsus e habilidades criados (cap. 20) e a revisão do Mestre.
-- Mesmo molde dos clãs: escolhas em `dados`, valores das listas em `resumo`, cálculos no app (src/lib/jutsus/regras.ts)
-- e status só pelas funções. Todo jutsu criado passa pelo Mestre (cap. 20.6).
-- Um jutsu pode ser feito para um personagem (aprende com PT depois de aprovado) ou para a carta de um clã criado.

create type public.status_criacao as enum ('rascunho', 'em_revisao', 'ajustes', 'aprovado', 'rejeitado');

create table public.jutsus_criados (
	id uuid primary key default gen_random_uuid(),
	campanha_id uuid not null references public.campanhas (id) on delete cascade,
	autor_id uuid not null references public.perfis (id) on delete cascade,
	tipo text not null default 'jutsu' check (tipo in ('jutsu', 'habilidade')),
	personagem_id uuid references public.personagens (id) on delete set null,
	cla_id uuid references public.clas (id) on delete set null,
	carta_id text check (char_length(carta_id) <= 20),
	nome text not null default '' check (char_length(nome) <= 60),
	rank text check (rank in ('E', 'D', 'C', 'B', 'A', 'S')),
	status public.status_criacao not null default 'rascunho',
	versao int not null default 1 check (versao >= 1),
	anterior_id uuid references public.jutsus_criados (id) on delete set null,
	dados jsonb not null default '{}'::jsonb,
	resumo jsonb not null default '{}'::jsonb,
	mensagem text check (char_length(mensagem) <= 2000),
	comentario_mestre text check (char_length(comentario_mestre) <= 2000),
	enviado_em timestamptz,
	decidido_em timestamptz,
	criado_em timestamptz not null default now(),
	atualizado_em timestamptz not null default now()
);
create index jutsus_criados_campanha on public.jutsus_criados (campanha_id, status);
create index jutsus_criados_personagem on public.jutsus_criados (personagem_id) where personagem_id is not null;
create index jutsus_criados_cla on public.jutsus_criados (cla_id) where cla_id is not null;

alter table public.jutsus_criados enable row level security;
create policy "jutsus_criados: autor, Mestre e grupo (aprovados) leem" on public.jutsus_criados for select to authenticated using (
	autor_id = (select auth.uid()) or public.eh_mestre(campanha_id) or (status = 'aprovado' and public.eh_membro(campanha_id))
);
create policy "jutsus_criados: membro cria o próprio" on public.jutsus_criados for insert to authenticated with check (
	autor_id = (select auth.uid()) and status = 'rascunho' and versao = 1 and anterior_id is null
	and public.eh_membro(campanha_id) and public.campanha_ativa(campanha_id)
);
create policy "jutsus_criados: autor edita rascunho ou ajustes" on public.jutsus_criados for update to authenticated
	using (autor_id = (select auth.uid()) and status in ('rascunho', 'ajustes') and public.campanha_ativa(campanha_id))
	with check (autor_id = (select auth.uid()));
create policy "jutsus_criados: autor apaga rascunho" on public.jutsus_criados for delete to authenticated
	using (autor_id = (select auth.uid()) and status = 'rascunho');

-- o jutsu só aponta para ficha ou clã da mesma campanha que sejam do autor
create function public.jutsu_confere_vinculos() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
	new.atualizado_em := now();
	if new.personagem_id is not null and not exists (
		select 1 from public.personagens p where p.id = new.personagem_id and p.campanha_id = new.campanha_id and p.jogador_id = new.autor_id
	) then
		raise exception 'Ficha indisponível para este jutsu.' using errcode = 'P0001';
	end if;
	if new.cla_id is not null and not exists (
		select 1 from public.clas c where c.id = new.cla_id and c.campanha_id = new.campanha_id and c.autor_id = new.autor_id
	) then
		raise exception 'Clã indisponível para este jutsu.' using errcode = 'P0001';
	end if;
	return new;
end $$;
create trigger jutsu_confere_vinculos before insert or update on public.jutsus_criados
	for each row execute function public.jutsu_confere_vinculos();

-- enviar para revisão; o do próprio Mestre entra aprovado
create function public.enviar_jutsu(jutsu uuid) returns public.status_criacao
language plpgsql security definer set search_path = '' as $$
declare
	j public.jutsus_criados;
	k public.campanhas;
	novo public.status_criacao;
	nome_autor text;
	oque text;
begin
	select * into j from public.jutsus_criados where id = jutsu;
	if j.id is null or j.autor_id is distinct from (select auth.uid()) then raise exception 'Jutsu não encontrado.' using errcode = '42501'; end if;
	if j.status not in ('rascunho', 'ajustes') then raise exception 'Este jutsu já foi enviado.' using errcode = 'P0001'; end if;
	if char_length(trim(j.nome)) < 2 then raise exception 'Dê um nome antes de enviar.' using errcode = 'P0001'; end if;
	select * into k from public.campanhas where id = j.campanha_id;
	if k.arquivada_em is not null then raise exception 'Campanha arquivada é somente leitura.' using errcode = 'P0001'; end if;

	novo := case when k.mestre_id = j.autor_id then 'aprovado' else 'em_revisao' end;
	update public.jutsus_criados set
		status = novo,
		enviado_em = now(),
		decidido_em = case when novo = 'aprovado' then now() else null end,
		comentario_mestre = case when novo = 'aprovado' then null else comentario_mestre end
	where id = j.id;

	oque := case when j.tipo = 'habilidade' then 'a habilidade ' else 'o jutsu ' end;
	select nome into nome_autor from public.perfis where id = j.autor_id;
	if novo = 'aprovado' then
		perform public.registrar_atividade(k.id, 'jutsu_aprovado', case when j.tipo = 'habilidade' then 'A habilidade ' else 'O jutsu ' end || j.nome || ' entrou na biblioteca da campanha', 'acao/ic-acao-criar-jutsu');
	else
		perform public.registrar_atividade(k.id, 'jutsu_enviado', nome_autor || ' enviou ' || oque || j.nome || ' para revisão', 'acao/ic-acao-criar-jutsu');
		if k.mestre_id is not null then
			perform public.notificar(k.mestre_id, 'jutsu_enviado', nome_autor || ' enviou ' || oque || j.nome || ' para revisão',
				'/campanhas/' || k.id || '/jutsus/' || j.id, 'status/ic-status-em-revisao');
		end if;
	end if;
	return novo;
end $$;

create function public.retirar_jutsu(jutsu uuid) returns void
language plpgsql security definer set search_path = '' as $$
begin
	update public.jutsus_criados set status = 'rascunho', enviado_em = null
	where id = jutsu and autor_id = (select auth.uid()) and status = 'em_revisao';
	if not found then raise exception 'Só dá para retirar o que está em revisão.' using errcode = 'P0001'; end if;
end $$;

create function public.decidir_jutsu(jutsu uuid, decisao public.status_criacao, comentario text default null) returns void
language plpgsql security definer set search_path = '' as $$
declare
	j public.jutsus_criados;
	k public.campanhas;
	nome_mestre text;
	frase text;
	icone text;
	oque text;
begin
	select * into j from public.jutsus_criados where id = jutsu;
	if j.id is null or not public.eh_mestre(j.campanha_id) then raise exception 'Só o Mestre decide sobre o jutsu.' using errcode = '42501'; end if;
	if j.status <> 'em_revisao' then raise exception 'Este jutsu não está em revisão.' using errcode = 'P0001'; end if;
	if decisao not in ('aprovado', 'ajustes', 'rejeitado') then raise exception 'Decisão inválida.' using errcode = 'P0001'; end if;
	if decisao <> 'aprovado' and char_length(trim(coalesce(comentario, ''))) = 0 then
		raise exception 'Explique o que precisa mudar.' using errcode = 'P0001';
	end if;
	select * into k from public.campanhas where id = j.campanha_id;
	if k.arquivada_em is not null then raise exception 'Campanha arquivada é somente leitura.' using errcode = 'P0001'; end if;

	update public.jutsus_criados set status = decisao, comentario_mestre = nullif(trim(coalesce(comentario, '')), ''), decidido_em = now() where id = j.id;

	oque := case when j.tipo = 'habilidade' then 'a habilidade ' else 'o jutsu ' end;
	select nome into nome_mestre from public.perfis where id = (select auth.uid());
	frase := case decisao when 'aprovado' then ' aprovou ' when 'ajustes' then ' pediu ajustes n' else ' rejeitou ' end;
	icone := case decisao when 'aprovado' then 'status/ic-status-aprovado' when 'ajustes' then 'status/ic-status-ajustes' else 'status/ic-status-rejeitado' end;
	perform public.registrar_atividade(k.id, 'jutsu_' || decisao::text, coalesce(nome_mestre, 'O Mestre') || frase || oque || j.nome, icone);
	perform public.notificar(j.autor_id, 'jutsu_' || decisao::text, coalesce(nome_mestre, 'O Mestre') || frase || oque || j.nome,
		'/campanhas/' || k.id || '/jutsus/' || j.id, icone);
end $$;

-- aprovado é somente leitura: editar cria uma nova versão em rascunho
create function public.nova_versao_jutsu(jutsu uuid) returns uuid
language plpgsql security definer set search_path = '' as $$
declare
	j public.jutsus_criados;
	novo uuid;
begin
	select * into j from public.jutsus_criados where id = jutsu;
	if j.id is null or j.autor_id is distinct from (select auth.uid()) then raise exception 'Jutsu não encontrado.' using errcode = '42501'; end if;
	if j.status <> 'aprovado' then raise exception 'Só o que foi aprovado ganha nova versão; edite este direto.' using errcode = 'P0001'; end if;
	if not public.campanha_ativa(j.campanha_id) then raise exception 'Campanha arquivada é somente leitura.' using errcode = 'P0001'; end if;
	select id into novo from public.jutsus_criados where anterior_id = j.id and status in ('rascunho', 'em_revisao', 'ajustes') limit 1;
	if novo is not null then return novo; end if;
	insert into public.jutsus_criados (campanha_id, autor_id, tipo, personagem_id, cla_id, carta_id, nome, rank, versao, anterior_id, dados, resumo)
	values (j.campanha_id, j.autor_id, j.tipo, j.personagem_id, j.cla_id, j.carta_id, j.nome, j.rank, j.versao + 1, j.id, j.dados, j.resumo)
	returning id into novo;
	return novo;
end $$;

-- ---------------------------------------------------------------- acesso
revoke all on public.jutsus_criados from anon;
grant select, delete on public.jutsus_criados to authenticated;
grant insert (campanha_id, autor_id, tipo, personagem_id, cla_id, carta_id, nome, rank, dados, resumo) on public.jutsus_criados to authenticated;
grant update (personagem_id, nome, rank, dados, resumo, mensagem) on public.jutsus_criados to authenticated;
revoke execute on function
	public.jutsu_confere_vinculos(),
	public.enviar_jutsu(uuid),
	public.retirar_jutsu(uuid),
	public.decidir_jutsu(uuid, public.status_criacao, text),
	public.nova_versao_jutsu(uuid)
from public, anon, authenticated;
grant execute on function
	public.enviar_jutsu(uuid),
	public.retirar_jutsu(uuid),
	public.decidir_jutsu(uuid, public.status_criacao, text),
	public.nova_versao_jutsu(uuid)
to authenticated;
