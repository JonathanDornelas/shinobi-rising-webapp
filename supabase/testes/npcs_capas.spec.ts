import { beforeAll, describe, expect, it } from 'vitest';
import { criarBanco, type Usuario } from './banco';

let banco: Awaited<ReturnType<typeof criarBanco>>;
let kaito: Usuario, bruno: Usuario;
let campanha: string, ren: string;

const um = async <T>(p: Promise<T[]>) => (await p)[0];

beforeAll(async () => {
	banco = await criarBanco();
	kaito = await banco.criarUsuario('kaito@exemplo.com', 'Kaito');
	bruno = await banco.criarUsuario('bruno@exemplo.com', 'Bruno');
	campanha = (await um(banco.como<{ id: string }>(kaito, `insert into campanhas (nome, mestre_id) values ('Névoa', $1) returning id`, [kaito.id]))).id;
	const l = await um(banco.como<{ token: string }>(kaito, `insert into convites (campanha_id, tipo) values ($1, 'link') returning token`, [campanha]));
	await banco.como(bruno, `select aceitar_convite($1)`, [l.token]);
	ren = (await um(banco.como<{ id: string }>(bruno, `insert into personagens (campanha_id, jogador_id, nome) values ($1, $2, 'Ren') returning id`, [campanha, bruno.id]))).id;
	await banco.como(bruno, `select enviar_ficha($1)`, [ren]);
	await banco.como(kaito, `select decidir_ficha($1, 'aprovada')`, [ren]);
}, 30000);

describe('NPC com ficha completa', () => {
	it('só o Mestre cria; aprova no envio; não conta como a ficha dele nem aparece para o grupo', async () => {
		await expect(banco.como(bruno, `insert into personagens (campanha_id, jogador_id, nome, npc) values ($1, $2, 'X', true)`, [campanha, bruno.id])).rejects.toThrow(/Só o Mestre/);
		const a = (await um(banco.como<{ id: string }>(kaito, `insert into personagens (campanha_id, jogador_id, nome, npc) values ($1, $2, 'Zabuza', true) returning id`, [campanha, kaito.id]))).id;
		await banco.como(kaito, `insert into personagens (campanha_id, jogador_id, nome, npc) values ($1, $2, 'Haku', true)`, [campanha, kaito.id]);
		const [{ enviar_ficha: s }] = await banco.como<{ enviar_ficha: string }>(kaito, `select enviar_ficha($1)`, [a]);
		expect(s).toBe('aprovada');
		expect((await banco.como<{ nome: string }>(bruno, `select nome from personagens_do_grupo($1)`, [campanha])).map((x) => x.nome)).toEqual(['Ren']);
		expect(await banco.como(bruno, `select nome from personagens where id = $1`, [a])).toEqual([]);
		await expect(banco.como(kaito, `insert into personagens (campanha_id, jogador_id, nome, npc, pre_gerado) values ($1, $2, 'Y', true, true)`, [campanha, kaito.id])).rejects.toThrow(/check/);
	});
});

describe('capa da ficha', () => {
	it('o dono escolhe uma paisagem válida; o grupo vê', async () => {
		await banco.como(bruno, `select definir_capa_ficha($1, 'capa-kiri')`, [ren]);
		await expect(banco.como(bruno, `select definir_capa_ficha($1, 'capa-nevoa')`, [ren])).rejects.toThrow(/check/);
		await expect(banco.como(kaito, `select definir_capa_ficha($1, 'capa-suna')`, [ren])).rejects.toThrow(/Ficha não encontrada/);
		expect(await um(banco.como(kaito, `select capa from personagens_do_grupo($1) where nome = 'Ren'`, [campanha]))).toEqual({ capa: 'capa-kiri' });
		await banco.como(bruno, `select definir_capa_ficha($1, null)`, [ren]);
	});
});

describe('rolagens com jogador e NPC', () => {
	it('guarda quem rolou junto do personagem', async () => {
		const [r] = await banco.como<{ quem: string; jogador: string }>(bruno, `select quem, jogador from rolar($1, '1d20', 'Iniciativa', $2)`, [campanha, ren]);
		expect(r).toEqual({ quem: 'Ren', jogador: 'Bruno' });
	});

	it('só o Mestre rola por um NPC da campanha', async () => {
		const [n] = await banco.como<{ id: string }>(kaito, `insert into npcs (campanha_id, nome) values ($1, 'Hideo') returning id`, [campanha]);
		const [r] = await banco.como<{ quem: string; jogador: string; npc_id: string }>(kaito, `select quem, jogador, npc_id from rolar($1, '1d20+4', 'Ataque', null, 'normal', true, $2)`, [campanha, n.id]);
		expect(r).toEqual({ quem: 'Hideo', jogador: 'Kaito', npc_id: n.id });
		await expect(banco.como(bruno, `select rolar($1, '1d20', 'x', null, 'normal', false, $2)`, [campanha, n.id])).rejects.toThrow(/NPC não encontrado/);
	});
});
