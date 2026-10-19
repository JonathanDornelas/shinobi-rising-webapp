import { beforeAll, describe, expect, it } from 'vitest';
import { criarBanco, type Usuario } from './banco';

let banco: Awaited<ReturnType<typeof criarBanco>>;
let kaito: Usuario, bruno: Usuario, aiko: Usuario;
let campanha: string, ren: string;

const um = async <T>(p: Promise<T[]>) => (await p)[0];
type Termo = { sinal: number; lados?: number; valores?: number[]; usados?: number[]; manter?: string; k?: number; valor?: number };
type Rolagem = { id: string; total: number; d20: number | null; tipo: string; origem: string | null; partes: [string, string][]; detalhe: Termo[]; pd: string | null; anterior_total: number | null; substituida: boolean };

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

// envelhece as rolagens para não esbarrar no limite de rajada
const envelhecer = () => banco.db.query(`update rolagens set criada_em = criada_em - interval '20 seconds'`);
async function rolar(u: Usuario, expr: string, extra = `null, 'normal', false`) {
	const [r] = await banco.como<{ r: Rolagem }>(u, `select to_jsonb(rolar($1, $2, 'Teste', ${extra})) as r`, [campanha, expr]);
	await envelhecer();
	return r.r;
}

describe('manter os maiores ou menores', () => {
	it('4d6kh3 soma os três maiores; 2d20kl1 conta como d20 natural', async () => {
		for (let i = 0; i < 20; i++) {
			const r = await rolar(bruno, '4d6kh3');
			const t = r.detalhe[0];
			expect(t.valores).toHaveLength(4);
			expect(t.usados).toHaveLength(3);
			expect(t.manter).toBe('h');
			expect([...t.usados!].sort().join()).toBe([...t.valores!].sort((a, b) => b - a).slice(0, 3).sort().join());
			expect(r.total).toBe(t.usados!.reduce((s, v) => s + v, 0));
			const d = await rolar(bruno, '2d20kl1+2');
			expect(d.d20).toBe(Math.min(...d.detalhe[0].valores!));
			expect(d.total).toBe(d.d20! + 2);
		}
	});

	it('aceita o sinal de menos tipográfico e dados de até 1000 lados', async () => {
		const r = await rolar(bruno, '1d1000 − 1');
		expect(r.detalhe).toHaveLength(2);
		await expect(rolar(bruno, '3d6kh4')).rejects.toThrow(/entre 1 e 3/);
	});
});

describe('tipo, origem e conta', () => {
	it('guarda o que a ficha manda e recusa tipo inválido', async () => {
		const r = await rolar(bruno, '1d20+3', `$3, 'normal', false, null, 'teste', 'Ficha · Perícias', '[["ESP (atributo)", "+1"], ["Treino", "+2"]]'`.replace('$3', `'${ren}'`));
		expect(r).toMatchObject({ tipo: 'teste', origem: 'Ficha · Perícias', partes: [['ESP (atributo)', '+1'], ['Treino', '+2']] });
		await expect(rolar(bruno, '1d20', `null, 'normal', false, null, 'magia'`)).rejects.toThrow(/Tipo de rolagem/);
	});
});

describe('Pontos de Destino', () => {
	let base: Rolagem;
	it('+5 gasta 1 PD, guarda o total anterior e não repete', async () => {
		base = await rolar(bruno, '1d20+1', `'${ren}', 'normal', false, null, 'teste'`);
		const [{ r }] = await banco.como<{ r: Rolagem }>(bruno, `select to_jsonb(usar_pd($1, 'mais5')) as r`, [base.id]);
		expect(r).toMatchObject({ pd: 'mais5', anterior_total: base.total, total: base.total + 5 });
		expect(r.partes.at(-1)).toEqual(['Ponto de Destino', '+5']);
		expect(await um(banco.como(bruno, `select (estado->>'pd')::int as pd from personagens where id = $1`, [ren]))).toEqual({ pd: 0 });
		await expect(banco.como(bruno, `select usar_pd($1, 'mais5')`, [base.id])).rejects.toThrow(/já usou/);
	});

	it('sem PD não dá; re-rolar cria outra rolagem e risca a original', async () => {
		const outra = await rolar(bruno, '1d20', `'${ren}', 'normal', false, null, 'teste'`);
		await expect(banco.como(bruno, `select usar_pd($1, 'rerrolar')`, [outra.id])).rejects.toThrow(/Sem Pontos de Destino/);
		await banco.db.query(`update personagens set estado = estado || '{"pd": 1}' where id = $1`, [ren]);
		await expect(banco.como(aiko, `select usar_pd($1, 'rerrolar')`, [outra.id])).rejects.toThrow(/não encontrada/);
		const [{ r }] = await banco.como<{ r: Rolagem }>(bruno, `select to_jsonb(usar_pd($1, 'rerrolar')) as r`, [outra.id]);
		expect(r).toMatchObject({ pd: 'rerrolar', anterior_total: outra.total, tipo: 'teste' });
		expect(r.id).not.toBe(outra.id);
		expect(await um(banco.como(bruno, `select substituida from rolagens where id = $1`, [outra.id]))).toEqual({ substituida: true });
	});

	it('rolagem livre (sem ficha) não usa PD', async () => {
		const livre = await rolar(bruno, '1d20');
		await expect(banco.como(bruno, `select usar_pd($1, 'mais5')`, [livre.id])).rejects.toThrow(/role pela ficha/);
	});
});

describe('rolagem oculta do Mestre', () => {
	it('o jogador vê que houve uma rolagem, sem o resultado; a oculta de outro jogador nem aparece', async () => {
		const secreta = await rolar(kaito, '1d20', `null, 'normal', true`);
		await rolar(aiko, '1d20', `null, 'normal', true`);
		expect(await banco.como(bruno, `select id from rolagens where id = $1`, [secreta.id])).toEqual([]);
		const avisos = await banco.como<{ id: string; mestre: string }>(bruno, `select id, mestre from rolagens_ocultas_do_mestre()`);
		expect(avisos).toEqual([{ id: secreta.id, mestre: 'Kaito' }]);
		expect(await banco.como(kaito, `select id from rolagens_ocultas_do_mestre()`)).toEqual([]);
	});
});
