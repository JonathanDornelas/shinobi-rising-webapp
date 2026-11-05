import { beforeAll, describe, expect, it } from 'vitest';
import { criarBanco, type Usuario } from './banco';

let banco: Awaited<ReturnType<typeof criarBanco>>;
let aiko: Usuario;

const abertas = async (papel: string) =>
	(
		await banco.db.query<{ nome: string }>(
			`select p.proname as nome from pg_proc p join pg_namespace n on n.oid = p.pronamespace
			where n.nspname = 'public' and p.prokind = 'f' and has_function_privilege($1, p.oid, 'execute') order by 1`,
			[papel]
		)
	).rows.map((f) => f.nome);

beforeAll(async () => {
	banco = await criarBanco();
	aiko = await banco.criarUsuario('aiko@exemplo.com', 'Aiko');
});

describe('funções abertas', () => {
	// se este teste falhar por uma função nova: o Postgres dá EXECUTE ao PUBLIC por padrão, e o
	// "alter default privileges in schema" não retira isso. Ponha o revoke na migração dela.
	it('visitante só executa o convite', async () => {
		expect(await abertas('anon')).toEqual(['ver_convite']);
	});

	it('quem está logado não chama as auxiliares da conferência, só as funções da ficha', async () => {
		const logado = await abertas('authenticated');
		for (const f of ['aprender_treinos', 'alcancar_nivel', 'mestre_da_pasta_mesa', 'membro_do_canal_mesa', 'eh_membro']) expect(logado, f).toContain(f);
		for (const f of ['conferir_treinos', 'conferir_nivel', 'custo_rank', 'somar_ao_progresso']) expect(logado, f).not.toContain(f);
		await expect(banco.como(aiko, `select conferir_nivel('{}', 2, '{"nivel":2}')`)).rejects.toThrow(/permission denied/);
	});
});
