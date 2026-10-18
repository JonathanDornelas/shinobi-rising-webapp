import { beforeAll, describe, expect, it } from 'vitest';
import { criarBanco, type Usuario } from './banco';

let banco: Awaited<ReturnType<typeof criarBanco>>;
let kaito: Usuario, bruno: Usuario, aiko: Usuario;
let campanha: string, kai: string;

const um = async <T>(p: Promise<T[]>) => (await p)[0];
const novaFicha = async (u: Usuario, nome: string) =>
	(await um(banco.como<{ id: string }>(u, `insert into personagens (campanha_id, jogador_id, nome) values ($1, $2, $3) returning id`, [campanha, u.id, nome]))).id;

beforeAll(async () => {
	banco = await criarBanco();
	kaito = await banco.criarUsuario('kaito@exemplo.com', 'Kaito');
	bruno = await banco.criarUsuario('bruno@exemplo.com', 'Bruno');
	aiko = await banco.criarUsuario('aiko@exemplo.com', 'Aiko');
	campanha = (await um(banco.como<{ id: string }>(kaito, `insert into campanhas (nome, mestre_id) values ('Névoa', $1) returning id`, [kaito.id]))).id;
	const l = await um(banco.como<{ token: string }>(kaito, `insert into convites (campanha_id, tipo) values ($1, 'link') returning token`, [campanha]));
	await banco.como(bruno, `select aceitar_convite($1)`, [l.token]);
	await banco.como(aiko, `select aceitar_convite($1)`, [l.token]);
}, 30000);

describe('excluir ficha', () => {
	it('o dono exclui a própria ficha aprovada; registros vão junto, rolagens ficam', async () => {
		const ren = await novaFicha(bruno, 'Ren');
		await banco.como(bruno, `select enviar_ficha($1)`, [ren]);
		await banco.como(kaito, `select decidir_ficha($1, 'aprovada')`, [ren]);
		await banco.como(bruno, `select rolar($1, '1d20', 'Iniciativa', $2)`, [campanha, ren]);
		await expect(banco.como(aiko, `select excluir_ficha($1)`, [ren])).rejects.toThrow(/Ficha não encontrada/);
		await banco.como(bruno, `select excluir_ficha($1)`, [ren]);
		expect(await banco.como(kaito, `select id from personagens where id = $1`, [ren])).toEqual([]);
		expect(await banco.db.query(`select count(*)::int as n from ficha_registros where personagem_id = $1`, [ren]).then((r) => r.rows[0])).toEqual({ n: 0 });
		expect(await um(banco.como(kaito, `select quem, personagem_id from rolagens where rotulo = 'Iniciativa'`))).toEqual({ quem: 'Ren', personagem_id: null });
		const [a] = await banco.como<{ texto: string }>(kaito, `select texto from atividades where tipo = 'ficha_excluida'`);
		expect(a.texto).toBe('Ficha excluída: Ren');
	});

	it('o Mestre exclui a ficha de um jogador, que é avisado', async () => {
		const mei = await novaFicha(aiko, 'Mei');
		await banco.como(kaito, `select excluir_ficha($1)`, [mei]);
		const [n] = await banco.como<{ texto: string }>(aiko, `select texto from notificacoes where tipo = 'ficha_excluida'`);
		expect(n.texto).toBe('O Mestre excluiu a ficha de Mei');
	});

	it('o Mestre apaga o retrato de uma ficha da campanha; outro jogador não', async () => {
		kai = await novaFicha(bruno, 'Kai');
		await banco.como(bruno, `insert into storage.objects (bucket_id, name) values ('retratos', $1)`, [`${kai}/a.webp`]);
		expect(await banco.como(aiko, `delete from storage.objects where name = $1 returning id`, [`${kai}/a.webp`])).toEqual([]);
		expect(await banco.como(kaito, `delete from storage.objects where name = $1 returning id`, [`${kai}/a.webp`])).toHaveLength(1);
	});

	it('campanha arquivada não exclui fichas', async () => {
		await banco.como(kaito, `update campanhas set arquivada_em = now() where id = $1`, [campanha]);
		await expect(banco.como(bruno, `select excluir_ficha($1)`, [kai])).rejects.toThrow(/arquivada/);
		await banco.como(kaito, `update campanhas set arquivada_em = null where id = $1`, [campanha]);
	});
});

describe('excluir campanha', () => {
	it('o Mestre exclui a campanha com fichas, clãs, jutsus, rolagens e NPCs; jogador não', async () => {
		const ren = kai;
		await banco.como(bruno, `insert into clas (campanha_id, autor_id, nome) values ($1, $2, 'Kaze')`, [campanha, bruno.id]);
		await banco.como(bruno, `insert into jutsus_criados (campanha_id, autor_id, tipo, personagem_id, nome) values ($1, $2, 'jutsu', $3, 'Lâmina')`, [campanha, bruno.id, ren]);
		await banco.como(bruno, `select rolar($1, '2d6', 'Dano')`, [campanha]);
		await banco.como(kaito, `insert into npcs (campanha_id, nome) values ($1, 'Hideo')`, [campanha]);
		expect(await banco.como(bruno, `delete from campanhas where id = $1 returning id`, [campanha])).toEqual([]);
		expect(await banco.como(kaito, `delete from campanhas where id = $1 returning id`, [campanha])).toHaveLength(1);
		const resto = await banco.db.query<{ n: number }>(
			`select (select count(*) from personagens where campanha_id = $1) + (select count(*) from clas where campanha_id = $1) + (select count(*) from jutsus_criados where campanha_id = $1) + (select count(*) from rolagens where campanha_id = $1) + (select count(*) from membros where campanha_id = $1) + (select count(*) from npcs where campanha_id = $1) as n`,
			[campanha]
		);
		expect(Number(resto.rows[0].n)).toBe(0);
	});
});
