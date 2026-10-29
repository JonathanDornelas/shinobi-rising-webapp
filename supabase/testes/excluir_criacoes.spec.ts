import { beforeAll, describe, expect, it } from 'vitest';
import { criarBanco, type Usuario } from './banco';

// Excluir criações da campanha (autor ou Mestre, qualquer status) e o Mestre tirando jutsus de um NPC de ficha completa.
let banco: Awaited<ReturnType<typeof criarBanco>>;
let kaito: Usuario, bruno: Usuario, aiko: Usuario;
let campanha: string, ren: string, npc: string;

const um = async <T>(p: Promise<T[]>) => (await p)[0];
const id = async (p: Promise<{ id: string }[]>) => (await um(p)).id;

beforeAll(async () => {
	banco = await criarBanco();
	kaito = await banco.criarUsuario('kaito@exemplo.com', 'Kaito');
	bruno = await banco.criarUsuario('bruno@exemplo.com', 'Bruno');
	aiko = await banco.criarUsuario('aiko@exemplo.com', 'Aiko');
	campanha = await id(banco.como(kaito, `insert into campanhas (nome, mestre_id) values ('Névoa', $1) returning id`, [kaito.id]));
	const l = await um(banco.como<{ token: string }>(kaito, `insert into convites (campanha_id, tipo) values ($1, 'link') returning token`, [campanha]));
	await banco.como(bruno, `select aceitar_convite($1)`, [l.token]);
	await banco.como(aiko, `select aceitar_convite($1)`, [l.token]);
	ren = await id(banco.como(bruno, `insert into personagens (campanha_id, jogador_id, nome) values ($1, $2, 'Ren Uchiha') returning id`, [campanha, bruno.id]));
	await banco.db.query(`update personagens set status = 'aprovada' where id = $1`, [ren]);
	npc = await id(banco.como(kaito, `insert into personagens (campanha_id, jogador_id, nome, npc) values ($1, $2, 'Zabuza', true) returning id`, [campanha, kaito.id]));
	await banco.db.query(`update personagens set status = 'aprovada' where id = $1`, [npc]);
}, 30000);

const jutsu = (u: Usuario, nome: string, extra: { personagem?: string; cla?: string } = {}) =>
	id(banco.como(u, `insert into jutsus_criados (campanha_id, autor_id, nome, rank, personagem_id, cla_id) values ($1, $2, $3, 'C', $4, $5) returning id`, [campanha, u.id, nome, extra.personagem ?? null, extra.cla ?? null]));
const nomes = async (tabela: string) => (await banco.db.query<{ nome: string }>(`select nome from ${tabela} where campanha_id = $1 order by nome`, [campanha])).rows.map((r) => r.nome);

describe('excluir jutsu', () => {
	it('aprovado com nova versão: a cadeia sai inteira, e o aviso lista as fichas que aprenderam', async () => {
		const v1 = await jutsu(bruno, 'Hyōsō', { personagem: ren });
		await banco.como(bruno, `select enviar_jutsu($1)`, [v1]);
		await banco.como(kaito, `select decidir_jutsu($1, 'aprovado')`, [v1]);
		const [{ nova_versao_jutsu: v2 }] = await banco.como<{ nova_versao_jutsu: string }>(bruno, `select nova_versao_jutsu($1)`, [v1]);
		await banco.como(kaito, `select conceder_jutsu($1, $2, 'Hyōsō')`, [ren, `jc-${v1}`]);

		expect(await banco.como(kaito, `select fichas_que_usam('jutsu', $1) as f`, [v1])).toEqual([{ f: ['Ren Uchiha'] }]);
		// quem não é autor nem Mestre não exclui, nem descobre as fichas
		await expect(banco.como(aiko, `select excluir_criacao('jutsu', $1)`, [v1])).rejects.toThrow(/Só o autor ou o Mestre/);
		expect(await banco.como(aiko, `select fichas_que_usam('jutsu', $1) as f`, [v1])).toEqual([{ f: [] }]);

		// a versão nova em rascunho sai sozinha; a aprovada fica
		await banco.como(bruno, `select excluir_criacao('jutsu', $1)`, [v2]);
		expect(await nomes('jutsus_criados')).toEqual(['Hyōsō']);
		// o Mestre exclui o aprovado de um jogador
		const v3 = await um(banco.como<{ nova_versao_jutsu: string }>(bruno, `select nova_versao_jutsu($1)`, [v1]));
		await banco.como(kaito, `select excluir_criacao('jutsu', $1)`, [v1]);
		expect(await nomes('jutsus_criados')).toEqual([]);
		expect(v3.nova_versao_jutsu).toBeTruthy();
	});

	it('o Mestre exclui o que ele mesmo criou (entra aprovado)', async () => {
		const j = await jutsu(kaito, 'Kirigakure');
		expect(await banco.como(kaito, `select enviar_jutsu($1) as s`, [j])).toEqual([{ s: 'aprovado' }]);
		await banco.como(kaito, `select excluir_criacao('jutsu', $1)`, [j]);
		expect(await nomes('jutsus_criados')).toEqual([]);
	});
});

describe('excluir clã e equipamento', () => {
	it('o clã leva os jutsus das cartas; a ficha que o usava fica sem clã', async () => {
		await banco.como(kaito, `update campanhas set clas_sem_kkg = true where id = $1`, [campanha]);
		const cla = await id(banco.como(kaito, `insert into clas (campanha_id, autor_id, nome) values ($1, $2, 'Hoshigaki') returning id`, [campanha, kaito.id]));
		await banco.como(kaito, `select enviar_cla($1)`, [cla]);
		expect(await banco.como(kaito, `select status from clas where id = $1`, [cla])).toEqual([{ status: 'aprovado' }]);
		await banco.db.query(`update personagens set cla_id = $2 where id = $1`, [ren, cla]);
		await jutsu(kaito, 'Carta do clã', { cla });

		expect(await banco.como(kaito, `select fichas_que_usam('cla', $1) as f`, [cla])).toEqual([{ f: ['Ren Uchiha'] }]);
		await banco.como(kaito, `select excluir_criacao('cla', $1)`, [cla]);
		expect(await nomes('clas')).toEqual([]);
		expect(await nomes('jutsus_criados')).toEqual([]);
		expect((await banco.db.query(`select cla_id from personagens where id = $1`, [ren])).rows).toEqual([{ cla_id: null }]);
	});

	it('arma aprovada do Mestre e rascunho do jogador', async () => {
		const arma = await id(banco.como(kaito, `insert into equipamentos_criados (campanha_id, autor_id, tipo, nome) values ($1, $2, 'arma', 'Kubikiribōchō') returning id`, [campanha, kaito.id]));
		await banco.como(kaito, `select enviar_equipamento($1)`, [arma]);
		const item = await id(banco.como(bruno, `insert into equipamentos_criados (campanha_id, autor_id, tipo, nome) values ($1, $2, 'item', 'Bomba de fumaça') returning id`, [campanha, bruno.id]));
		await expect(banco.como(bruno, `select excluir_criacao('equipamento', $1)`, [arma])).rejects.toThrow(/Só o autor ou o Mestre/);
		await banco.como(bruno, `select excluir_criacao('equipamento', $1)`, [item]);
		await banco.como(kaito, `select excluir_criacao('equipamento', $1)`, [arma]);
		expect(await nomes('equipamentos_criados')).toEqual([]);
	});
});

describe('NPC de ficha completa', () => {
	it('o Mestre dá e tira um jutsu do NPC; de um jogador, não tira', async () => {
		await banco.como(kaito, `select conceder_jutsu($1, 'kirigakure-no-jutsu', 'Kirigakure no Jutsu')`, [npc]);
		const treinos = async (f: string) => (await banco.db.query<{ t: unknown }>(`select dados -> 'progresso' -> 'treinos' as t from personagens where id = $1`, [f])).rows[0].t;
		expect(await treinos(npc)).toEqual([{ tipo: 'jutsu', slug: 'kirigakure-no-jutsu', pt: 0 }]);
		await banco.db.query(`update personagens set dados = dados || '{"jutsus": {"E": ["bunshin", "kawarimi"], "D": ["kirigakure-no-jutsu"]}}'::jsonb where id = $1`, [npc]);

		await expect(banco.como(bruno, `select esquecer_jutsu($1, 'kirigakure-no-jutsu', 'Kirigakure')`, [npc])).rejects.toThrow(/Só o Mestre|não encontrada/i);
		await banco.como(kaito, `select esquecer_jutsu($1, 'kirigakure-no-jutsu', 'Kirigakure')`, [npc]);
		expect(await treinos(npc)).toEqual([]);
		expect((await banco.db.query(`select dados -> 'jutsus' as j from personagens where id = $1`, [npc])).rows[0]).toEqual({ j: { E: ['bunshin', 'kawarimi'], D: [] } });

		await expect(banco.como(kaito, `select esquecer_jutsu($1, 'x', 'X')`, [ren])).rejects.toThrow(/NPC/);
	});
});
