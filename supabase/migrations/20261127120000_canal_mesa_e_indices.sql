-- O canal da Mesa (mesa:<campanha>) passa a ser privado: só quem é da campanha entra, envia e recebe o que é passageiro
-- (arrasto, régua, ping, música, presença). O Realtime confere estas políticas ao entrar no canal, não a cada mensagem.
create function public.membro_do_canal_mesa() returns boolean
language plpgsql stable security definer set search_path = '' as $$
declare
	topico text := realtime.topic();
	campanha uuid;
begin
	if topico is null or topico !~ '^mesa:[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' then return false; end if;
	campanha := substr(topico, 6)::uuid;
	return public.eh_mestre(campanha) or public.eh_membro(campanha);
end $$;
revoke execute on function public.membro_do_canal_mesa() from public, anon;
grant execute on function public.membro_do_canal_mesa() to authenticated;

create policy "canal da Mesa: quem é da campanha recebe" on realtime.messages for select to authenticated
	using (realtime.messages.extension in ('broadcast', 'presence') and public.membro_do_canal_mesa());
create policy "canal da Mesa: quem é da campanha envia" on realtime.messages for insert to authenticated
	with check (realtime.messages.extension in ('broadcast', 'presence') and public.membro_do_canal_mesa());

-- Índices das chaves estrangeiras das tabelas que crescem ou são lidas por dono: sem eles, apagar uma ficha, um NPC ou uma
-- conta percorre a tabela inteira, e o histórico de rolagens é a maior delas.
create index if not exists rolagens_personagem on public.rolagens (personagem_id) where personagem_id is not null;
create index if not exists rolagens_npc on public.rolagens (npc_id) where npc_id is not null;
create index if not exists mesa_tokens_campanha on public.mesa_tokens (campanha_id);
create index if not exists mesa_tokens_dono on public.mesa_tokens (dono_id) where dono_id is not null;
create index if not exists mesa_tokens_ligado on public.mesa_tokens (ligado_a) where ligado_a is not null;
create index if not exists mesa_tracos_autor on public.mesa_tracos (autor_id);
create index if not exists mesa_efeitos_autor on public.mesa_efeitos (autor_id);
create index if not exists mesa_objetos_autor on public.mesa_objetos (autor_id);
create index if not exists personagens_jogador on public.personagens (jogador_id);
create index if not exists campanhas_mestre on public.campanhas (mestre_id);
create index if not exists pedidos_pt_personagem on public.pedidos_pt (personagem_id);
create index if not exists atividades_ator on public.atividades (ator_id);
create index if not exists ficha_registros_ator on public.ficha_registros (ator_id);
create index if not exists jutsus_criados_autor on public.jutsus_criados (autor_id);
create index if not exists equipamentos_criados_autor on public.equipamentos_criados (autor_id);
