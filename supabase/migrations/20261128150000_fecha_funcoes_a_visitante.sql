-- Visitante só executa ver_convite. O "alter default privileges in schema public" de 20261017130000 não fecha as funções
-- novas: o EXECUTE do PUBLIC vem do padrão global, que um comando por esquema não consegue retirar. Toda função nova precisa
-- do próprio revoke, e o teste supabase/testes/funcoes_abertas.spec.ts reprova a que esquecer.
do $$
declare
	f record;
begin
	for f in
		select p.oid::regprocedure as assinatura, has_function_privilege('authenticated', p.oid, 'execute') as logado
		from pg_proc p join pg_namespace n on n.oid = p.pronamespace
		where n.nspname = 'public' and p.prokind = 'f' and p.proname <> 'ver_convite' and has_function_privilege('anon', p.oid, 'execute')
	loop
		execute format('revoke execute on function %s from public, anon', f.assinatura);
		-- quem está logado podia ter o acesso só pelo PUBLIC: continua tendo
		if f.logado then execute format('grant execute on function %s to authenticated', f.assinatura); end if;
	end loop;
end $$;

-- as auxiliares da conferência da ficha só rodam dentro de aprender_treinos e alcancar_nivel, que as chamam como dono
revoke execute on function
	public.lista_json(jsonb),
	public.textos_json(jsonb),
	public.somar_ao_progresso(jsonb, text, jsonb),
	public.custo_rank(text),
	public.nivel_do_rank(text),
	public.custo_proficiencia(text, int),
	public.profs_da_ficha(jsonb, jsonb),
	public.elementos_da_ficha(jsonb, jsonb),
	public.jutsus_sabidos(jsonb, jsonb),
	public.conferir_treinos(jsonb, int, uuid, jsonb),
	public.conferir_nivel(jsonb, int, jsonb)
from public, anon, authenticated;
