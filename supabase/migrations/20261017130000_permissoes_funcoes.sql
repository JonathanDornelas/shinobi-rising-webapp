-- Lote 3 · Permissões das funções
-- O Supabase concede EXECUTE em toda função nova do esquema public a anon e authenticated, o que expõe
-- funções internas em /rest/v1/rpc. Aqui tudo é fechado e só o que o app chama volta a ser liberado.
-- Gatilhos não dependem de EXECUTE para disparar, e as funções security definer chamam as internas como dono.

revoke execute on all functions in schema public from public, anon, authenticated;

-- convite aberto por visitante (C6)
grant execute on function public.ver_convite(text) to anon, authenticated;

-- ações da conta logada
grant execute on function
	public.aceitar_convite(text),
	public.recusar_convite(text),
	public.meus_convites(),
	public.reenviar_convite(uuid),
	public.transferir_mestre(uuid, uuid),
	public.excluir_conta()
to authenticated;

-- usadas pelas políticas de RLS (avaliadas com o papel de quem consulta)
grant execute on function public.eh_membro(uuid), public.eh_mestre(uuid) to authenticated;

-- chamada pelo gatilho convite_antes_de_inserir, que roda com o papel de quem cria o convite
grant execute on function public.gerar_codigo_convite() to authenticated;

-- funções criadas daqui em diante também começam fechadas
alter default privileges in schema public revoke execute on functions from public, anon, authenticated;
