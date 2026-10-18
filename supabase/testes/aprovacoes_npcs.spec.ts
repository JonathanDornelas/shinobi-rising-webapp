import { beforeAll, describe, expect, it } from 'vitest';
import { criarBanco, type Usuario } from './banco';

let banco: Awaited<ReturnType<typeof criarBanco>>;
let kaito: Usuario, bruno: Usuario, aiko: Usuario;
let campanha: string, ren: string;

const um = async <T>(p: Promise<T[]>) => (await p)[0];

beforeAll(async () => {
	banco = await criarBanco();
	kaito = await banco.criarUsuario('kaito@exemplo.com', 'Kaito');
	bruno = await banco.criarUsuario('bruno@exemplo.com', 'Bruno');
	aiko = await banco.criarUsuario('aiko@exemplo.com', 'Aiko');
	campanha = (await um(banco.como<{ id: string }>(kaito, `insert into campanhas (nome, mestre_id) values ('Névoa', $1) returning id`, [kaito.id]))).id;
	const l = await um(banco.como<{ token: string }>(kaito, `insert into convites (campanha_id, tipo) values ($1, 'link') returning token`, [campanha]));
	await banco.como(bruno, `select aceitar_convite($1)`, [l.token]);
	await banco.como(aiko, `select aceitar_convite($1)`, [l.token]);
	ren = (await um(banco.como<{ id: string }>(bruno, `insert into personagens (campanha_id, jogador_id, nome, resumo) values ($1, $2, 'Ren Uchiha', '{"ryo": 5000, "ptRestantes": 6}') returning id`, [campanha, bruno.id]))).id;
	await banco.como(bruno, `select enviar_ficha($1)`, [ren]);
	await banco.como(kaito, `select decidir_ficha($1, 'aprovada')`, [ren]);
}, 30000);

describe('exceção do Mestre', () => {
	it('só o Mestre registra, só no que está aprovado, com justificativa', async () => {
		await expect(banco.como(bruno, `select registrar_excecao('ficha', $1, 'x')`, [ren])).rejects.toThrow(/Só o Mestre/);
		await expect(banco.como(kaito, `select registrar_excecao('ficha', $1, '  ')`, [ren])).rejects.toThrow(/justificativa/);
		await banco.como(kaito, `select registrar_excecao('ficha', $1, 'Treinou com o sensei do clã durante o arco.')`, [ren]);
		expect(await um(banco.como(bruno, `select excecao from personagens where id = $1`, [ren]))).toEqual({ excecao: 'Treinou com o sensei do clã durante o arco.' });
	});
});

describe('NPCs', () => {
	it('só o Mestre lê e edita; o grupo vê os revelados sem o segredo; máximo de 3 tags', async () => {
		const [h] = await banco.como<{ id: string }>(kaito, `insert into npcs (campanha_id, nome, rank, segredo, tags) values ($1, 'Hideo', 'chunin', 'Conhece o assassino', '{Tático,Cauteloso,Leal}') returning id`, [campanha]);
		await expect(banco.como(kaito, `update npcs set tags = '{a,b,c,d}' where id = $1`, [h.id])).rejects.toThrow(/check/);
		await expect(banco.como(bruno, `insert into npcs (campanha_id, nome) values ($1, 'Intruso')`, [campanha])).rejects.toThrow(/row-level security/);
		expect(await banco.como(bruno, `select nome from npcs`)).toEqual([]);
		expect(await banco.como(bruno, `select nome from npcs_revelados($1)`, [campanha])).toEqual([]);
		await banco.como(kaito, `update npcs set revelado = true where id = $1`, [h.id]);
		const [v] = await banco.como<Record<string, unknown>>(bruno, `select * from npcs_revelados($1)`, [campanha]);
		expect(v).toMatchObject({ nome: 'Hideo', rank: 'chunin' });
		expect(v).not.toHaveProperty('segredo');
	});
});

describe('pré-gerados', () => {
	let pre: string;
	it('o Mestre cria vários; jogador não cria pré-gerado', async () => {
		pre = (await um(banco.como<{ id: string }>(kaito, `insert into personagens (campanha_id, jogador_id, nome, pre_gerado) values ($1, $2, 'Kenji', true) returning id`, [campanha, kaito.id]))).id;
		await banco.como(kaito, `insert into personagens (campanha_id, jogador_id, nome, pre_gerado) values ($1, $2, 'Mei', true)`, [campanha, kaito.id]);
		await expect(banco.como(aiko, `insert into personagens (campanha_id, jogador_id, nome, pre_gerado) values ($1, $2, 'X', true)`, [campanha, aiko.id])).rejects.toThrow(/Só o Mestre/);
		const [{ enviar_ficha: s }] = await banco.como<{ enviar_ficha: string }>(kaito, `select enviar_ficha($1)`, [pre]);
		expect(s).toBe('aprovada');
		const g = await banco.como<{ nome: string; pre_gerado: boolean }>(aiko, `select nome, pre_gerado from personagens_do_grupo($1) order by nome`, [campanha]);
		expect(g).toEqual([
			{ nome: 'Kenji', pre_gerado: true },
			{ nome: 'Ren Uchiha', pre_gerado: false }
		]);
	});

	it('quem já tem ficha não assume; quem não tem assume e vira dono', async () => {
		await expect(banco.como(bruno, `select assumir_pre_gerado($1)`, [pre])).rejects.toThrow(/já tem uma ficha/);
		await banco.como(aiko, `select assumir_pre_gerado($1)`, [pre]);
		expect(await um(banco.como(aiko, `select jogador_id, pre_gerado from personagens where id = $1`, [pre]))).toEqual({ jogador_id: aiko.id, pre_gerado: false });
		const [n] = await banco.como<{ texto: string }>(kaito, `select texto from notificacoes where tipo = 'pre_gerado'`);
		expect(n.texto).toBe('Aiko assumiu o pré-gerado Kenji');
	});
});

describe('o Mestre concede', () => {
	it('jutsu entra nos treinos, cobrando PT; repetido não', async () => {
		await expect(banco.como(bruno, `select conceder_jutsu($1, 'kaze', 'Kaze', 0)`, [ren])).rejects.toThrow(/Só o Mestre/);
		await expect(banco.como(kaito, `select conceder_jutsu($1, 'kaze', 'Kaze', 99)`, [ren])).rejects.toThrow(/tem 6 PT/);
		await banco.como(kaito, `select conceder_jutsu($1, 'kaze-no-yaiba', 'Kaze no Yaiba', 4)`, [ren]);
		const p = await um(banco.como<{ pt: number; dados: { progresso: { treinos: unknown[] } } }>(bruno, `select pt, dados from personagens where id = $1`, [ren]));
		expect(p.pt).toBe(2);
		expect(p.dados.progresso.treinos).toEqual([{ tipo: 'jutsu', slug: 'kaze-no-yaiba', pt: 4 }]);
		await expect(banco.como(kaito, `select conceder_jutsu($1, 'kaze-no-yaiba', 'Kaze no Yaiba', 0)`, [ren])).rejects.toThrow(/já conhece/);
	});

	it('item vai para as entregas, cobrando ryo; a ficha recebe e limpa', async () => {
		await banco.como(kaito, `select conceder_item($1, '{"id":"x","nome":"Pó de Brasa","qtd":1}', 300)`, [ren]);
		expect(await um(banco.como(bruno, `select ryo, jsonb_array_length(entregas) as n from personagens where id = $1`, [ren]))).toEqual({ ryo: 4700, n: 1 });
		await banco.como(bruno, `select receber_entregas($1, '[{"id":"x","nome":"Pó de Brasa","qtd":1}]')`, [ren]);
		expect(await um(banco.como(bruno, `select jsonb_array_length(entregas) as n, jsonb_array_length(inventario) as i from personagens where id = $1`, [ren]))).toEqual({ n: 0, i: 1 });
	});
});
