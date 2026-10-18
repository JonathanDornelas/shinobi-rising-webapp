import { beforeAll, describe, expect, it } from 'vitest';
import { criarBanco, type Usuario } from './banco';

let banco: Awaited<ReturnType<typeof criarBanco>>;
let kaito: Usuario, bruno: Usuario, aiko: Usuario, intruso: Usuario;
let campanha: string, ren: string;

const um = async <T>(p: Promise<T[]>) => (await p)[0];
type Rolagem = { total: number; d20: number | null; quem: string; rotulo: string; modo: string; detalhe: { sinal: number; lados?: number; valores?: number[]; usados?: number[]; valor?: number }[] };

beforeAll(async () => {
	banco = await criarBanco();
	kaito = await banco.criarUsuario('kaito@exemplo.com', 'Kaito');
	bruno = await banco.criarUsuario('bruno@exemplo.com', 'Bruno');
	aiko = await banco.criarUsuario('aiko@exemplo.com', 'Aiko');
	intruso = await banco.criarUsuario('x@exemplo.com', 'Intruso');
	campanha = (await um(banco.como<{ id: string }>(kaito, `insert into campanhas (nome, mestre_id) values ('Névoa', $1) returning id`, [kaito.id]))).id;
	const l = await um(banco.como<{ token: string }>(kaito, `insert into convites (campanha_id, tipo) values ($1, 'link') returning token`, [campanha]));
	await banco.como(bruno, `select aceitar_convite($1)`, [l.token]);
	await banco.como(aiko, `select aceitar_convite($1)`, [l.token]);
	ren = (await um(banco.como<{ id: string }>(bruno, `insert into personagens (campanha_id, jogador_id, nome) values ($1, $2, 'Ren Uchiha') returning id`, [campanha, bruno.id]))).id;
}, 30000);

// envelhece as rolagens a cada chamada para não esbarrar no limite de rajada (testado à parte)
const rolar = (u: Usuario, expr: string, extra = `null, 'normal', false`, envelhecer = true) =>
	um(banco.como<{ r: Rolagem }>(u, `select to_jsonb(rolar($1, $2, 'Teste', ${extra})) as r`, [campanha, expr])).then(async (x) => {
		if (envelhecer) await banco.db.query(`update rolagens set criada_em = criada_em - interval '1 minute'`);
		return x.r;
	});

describe('capas', () => {
	it('campanha nova nasce com Konoha; só capas de vila', async () => {
		expect(await um(banco.como(kaito, `select capa from campanhas where id = $1`, [campanha]))).toEqual({ capa: 'capa-konoha' });
		await banco.como(kaito, `update campanhas set capa = 'capa-taki' where id = $1`, [campanha]);
		await expect(banco.como(kaito, `update campanhas set capa = 'capa-nevoa' where id = $1`, [campanha])).rejects.toThrow(/check/);
	});
});

describe('rolar', () => {
	it('soma dados e modificadores, dentro dos limites de cada dado', async () => {
		for (let i = 0; i < 20; i++) {
			const r = await rolar(bruno, '2d6 + 1d4 - 2');
			const [a, b, c] = r.detalhe;
			expect(a.valores!.every((v) => v >= 1 && v <= 6)).toBe(true);
			expect(c).toEqual({ sinal: -1, valor: 2 });
			expect(r.total).toBe(a.usados!.reduce((s, v) => s + v, 0) + b.usados![0] - 2);
			expect(r.d20).toBeNull();
		}
	});

	it('vantagem rola o d20 duas vezes e fica com o maior; desvantagem, com o menor', async () => {
		for (let i = 0; i < 15; i++) {
			const v = await rolar(bruno, '1d20+3', `null, 'vantagem', false`);
			expect(v.detalhe[0].valores).toHaveLength(2);
			expect(v.d20).toBe(Math.max(...v.detalhe[0].valores!));
			expect(v.total).toBe(v.d20! + 3);
			const d = await rolar(aiko, '1d20', `null, 'desvantagem', false`);
			expect(d.d20).toBe(Math.min(...d.detalhe[0].valores!));
		}
	});

	it('crítico dobra os dados de dano, não o modificador', async () => {
		const r = await rolar(bruno, '2d8+4', `null, 'critico', false`);
		expect(r.detalhe[0].valores).toHaveLength(4);
		expect(r.total).toBe(r.detalhe[0].valores!.reduce((s, v) => s + v, 0) + 4);
	});

	it('recusa expressões inválidas e quem não é da campanha', async () => {
		await expect(rolar(bruno, '5')).rejects.toThrow(/pelo menos um dado/);
		await expect(rolar(bruno, '1d7')).rejects.toThrow(/lados/);
		await expect(rolar(bruno, 'drop table')).rejects.toThrow(/Expressão inválida/);
		await expect(rolar(bruno, '40d6+40d6')).rejects.toThrow(/máximo 60/);
		await expect(rolar(intruso, '1d20')).rejects.toThrow(/está na campanha/);
		await expect(banco.como(bruno, `insert into rolagens (campanha_id, quem, rotulo, expressao, detalhe, total) values ($1, 'x', 'x', '1d20', '[]', 20)`, [campanha])).rejects.toThrow(/permission denied/);
	});

	it('rola pela própria ficha (ou o Mestre por qualquer uma), não pela de outro jogador', async () => {
		const r = await um(banco.como<{ r: Rolagem }>(bruno, `select to_jsonb(rolar($1, '1d20', 'Iniciativa', $2)) as r`, [campanha, ren]));
		expect(r.r.quem).toBe('Ren Uchiha');
		await banco.como(kaito, `select rolar($1, '1d20', 'Teste do Mestre', $2)`, [campanha, ren]);
		await expect(banco.como(aiko, `select rolar($1, '1d20', 'x', $2)`, [campanha, ren])).rejects.toThrow(/Ficha não encontrada/);
	});

	it('rolagem oculta: só o autor e o Mestre veem', async () => {
		await banco.como(aiko, `select rolar($1, '1d20', 'Furtividade secreta', null, 'normal', true)`, [campanha]);
		const ver = async (u: Usuario) => (await banco.como<{ rotulo: string }>(u, `select rotulo from rolagens where rotulo = 'Furtividade secreta'`)).length;
		expect(await ver(aiko)).toBe(1);
		expect(await ver(kaito)).toBe(1);
		expect(await ver(bruno)).toBe(0);
		expect(await banco.como(intruso, `select id from rolagens`)).toEqual([]);
	});

	it('limita rajadas de rolagens', async () => {
		const u = await banco.criarUsuario('rapido@exemplo.com', 'Rápido');
		const l = await um(banco.como<{ token: string }>(kaito, `insert into convites (campanha_id, tipo) values ($1, 'link') returning token`, [campanha]));
		await banco.como(u, `select aceitar_convite($1)`, [l.token]);
		for (let i = 0; i < 10; i++) await rolar(u, '1d6', undefined, false);
		await expect(rolar(u, '1d6', undefined, false)).rejects.toThrow(/Muitas rolagens/);
	});
});

describe('retrato', () => {
	it('só o dono define, com caminho dentro da pasta da ficha', async () => {
		await banco.como(bruno, `select definir_retrato($1, $2)`, [ren, `${ren}/r-1.webp`]);
		expect(await um(banco.como(aiko, `select retrato from personagens where id = $1`, [ren]))).toBeUndefined(); // rascunho: grupo não lê
		expect(await um(banco.como(bruno, `select retrato from personagens where id = $1`, [ren]))).toEqual({ retrato: `${ren}/r-1.webp` });
		await expect(banco.como(aiko, `select definir_retrato($1, $2)`, [ren, `${ren}/r-2.webp`])).rejects.toThrow(/Ficha não encontrada/);
		await expect(banco.como(bruno, `select definir_retrato($1, $2)`, [ren, `outra/r.webp`])).rejects.toThrow(/inválido/);
		await expect(banco.como(bruno, `select definir_retrato($1, $2)`, [ren, `${ren}/r.png`])).rejects.toThrow(/inválido/);
		await banco.como(bruno, `select definir_retrato($1, null)`, [ren]);
	});

	it('Storage: só o dono envia e apaga na pasta da própria ficha', async () => {
		await banco.como(bruno, `insert into storage.objects (bucket_id, name) values ('retratos', $1)`, [`${ren}/a.webp`]);
		await expect(banco.como(aiko, `insert into storage.objects (bucket_id, name) values ('retratos', $1)`, [`${ren}/b.webp`])).rejects.toThrow(/row-level security/);
		expect(await banco.como(aiko, `delete from storage.objects where name = $1 returning id`, [`${ren}/a.webp`])).toEqual([]);
		expect(await banco.como(bruno, `delete from storage.objects where name = $1 returning id`, [`${ren}/a.webp`])).toHaveLength(1);
	});

	it('o grupo vê o retrato das fichas aprovadas', async () => {
		await banco.como(bruno, `select definir_retrato($1, $2)`, [ren, `${ren}/r-3.webp`]);
		await banco.como(bruno, `select enviar_ficha($1)`, [ren]);
		await banco.como(kaito, `select decidir_ficha($1, 'aprovada')`, [ren]);
		const [g] = await banco.como<{ retrato: string }>(aiko, `select retrato from personagens_do_grupo($1)`, [campanha]);
		expect(g.retrato).toBe(`${ren}/r-3.webp`);
	});
});
