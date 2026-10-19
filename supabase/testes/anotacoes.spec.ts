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
	ren = (await um(banco.como<{ id: string }>(bruno, `insert into personagens (campanha_id, jogador_id, nome) values ($1, $2, 'Ren') returning id`, [campanha, bruno.id]))).id;
	await banco.como(bruno, `select enviar_ficha($1)`, [ren]);
	await banco.como(kaito, `select decidir_ficha($1, 'aprovada')`, [ren]);
}, 30000);

describe('anotações da ficha', () => {
	it('o dono escreve em qualquer status; o Mestre lê; ninguém mais escreve', async () => {
		await banco.como(bruno, `select salvar_anotacoes($1, '## Pistas\n- selo Uzumaki')`, [ren]);
		expect(await um(banco.como(kaito, `select anotacoes from personagens where id = $1`, [ren]))).toEqual({ anotacoes: '## Pistas\n- selo Uzumaki' });
		await expect(banco.como(kaito, `select salvar_anotacoes($1, 'x')`, [ren])).rejects.toThrow(/Ficha não encontrada/);
		await expect(banco.como(aiko, `select salvar_anotacoes($1, 'x')`, [ren])).rejects.toThrow(/Ficha não encontrada/);
		expect(await banco.como(aiko, `select anotacoes from personagens where id = $1`, [ren])).toEqual([]);
		await expect(banco.como(bruno, `select salvar_anotacoes($1, $2)`, [ren, 'a'.repeat(20001)])).rejects.toThrow(/longas demais/);
	});
});
