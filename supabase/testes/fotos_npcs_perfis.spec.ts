import { beforeAll, describe, expect, it } from 'vitest';
import { criarBanco, type Usuario } from './banco';

let banco: Awaited<ReturnType<typeof criarBanco>>;
let kaito: Usuario, bruno: Usuario, intruso: Usuario;
let campanha: string, npc: string;

const um = async <T>(p: Promise<T[]>) => (await p)[0];
const pode = async (u: Usuario, f: 'dono_da_pasta_retrato' | 'pode_apagar_retrato', caminho: string) =>
	(await um(banco.como<{ ok: boolean }>(u, `select public.${f}($1) as ok`, [caminho]))).ok;

beforeAll(async () => {
	banco = await criarBanco();
	kaito = await banco.criarUsuario('kaito@exemplo.com', 'Kaito');
	bruno = await banco.criarUsuario('bruno@exemplo.com', 'Bruno');
	intruso = await banco.criarUsuario('x@exemplo.com', 'Intruso');
	campanha = (await um(banco.como<{ id: string }>(kaito, `insert into campanhas (nome, mestre_id) values ('Névoa', $1) returning id`, [kaito.id]))).id;
	const l = await um(banco.como<{ token: string }>(kaito, `insert into convites (campanha_id, tipo) values ($1, 'link') returning token`, [campanha]));
	await banco.como(bruno, `select aceitar_convite($1)`, [l.token]);
	npc = (await um(banco.como<{ id: string }>(kaito, `insert into npcs (campanha_id, nome) values ($1, 'Zabuza') returning id`, [campanha]))).id;
}, 30000);

describe('foto do NPC', () => {
	it('o Mestre envia para a pasta do NPC; jogadores e estranhos, não', async () => {
		const caminho = `${npc}/r-abc.webp`;
		expect(await pode(kaito, 'dono_da_pasta_retrato', caminho)).toBe(true);
		expect(await pode(bruno, 'dono_da_pasta_retrato', caminho)).toBe(false);
		expect(await pode(intruso, 'pode_apagar_retrato', caminho)).toBe(false);
		expect(await pode(kaito, 'pode_apagar_retrato', caminho)).toBe(true);
	});

	it('o caminho tem de ser da pasta do próprio NPC', async () => {
		await banco.como(kaito, `update npcs set retrato = $2 where id = $1`, [npc, `${npc}/r-abc.webp`]);
		await expect(banco.como(kaito, `update npcs set retrato = $2 where id = $1`, [npc, `${campanha}/r-abc.webp`])).rejects.toThrow(/check/);
	});

	it('o grupo vê a foto dos NPCs revelados', async () => {
		expect(await banco.como(bruno, `select * from npcs_revelados($1)`, [campanha])).toEqual([]);
		await banco.como(kaito, `update npcs set revelado = true where id = $1`, [npc]);
		const [r] = await banco.como<{ nome: string; retrato: string }>(bruno, `select nome, retrato from npcs_revelados($1)`, [campanha]);
		expect(r).toEqual({ nome: 'Zabuza', retrato: `${npc}/r-abc.webp` });
	});
});

describe('avatar do perfil', () => {
	it('cada conta envia e apaga só na própria pasta', async () => {
		expect(await pode(bruno, 'dono_da_pasta_retrato', `${bruno.id}/r-x.webp`)).toBe(true);
		expect(await pode(bruno, 'dono_da_pasta_retrato', `${kaito.id}/r-x.webp`)).toBe(false);
		expect(await pode(bruno, 'pode_apagar_retrato', `${bruno.id}/r-x.webp`)).toBe(true);
		expect(await pode(intruso, 'pode_apagar_retrato', `${bruno.id}/r-x.webp`)).toBe(false);
	});

	it('o avatar aponta para a pasta da própria conta', async () => {
		await banco.como(bruno, `update perfis set avatar = $2 where id = $1`, [bruno.id, `${bruno.id}/r-x.webp`]);
		await expect(banco.como(bruno, `update perfis set avatar = $2 where id = $1`, [bruno.id, `${kaito.id}/r-x.webp`])).rejects.toThrow(/check/);
		await expect(banco.como(bruno, `update perfis set avatar = 'https://exemplo.com/a.png' where id = $1`, [bruno.id])).rejects.toThrow(/check/);
		// a conta de outra pessoa não muda (RLS: nenhuma linha afetada)
		await banco.como(bruno, `update perfis set avatar = null where id = $1`, [kaito.id]);
		expect(await um(banco.como(kaito, `select avatar from perfis where id = $1`, [kaito.id]))).toEqual({ avatar: null });
	});
});
