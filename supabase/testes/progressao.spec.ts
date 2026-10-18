import { beforeAll, describe, expect, it } from 'vitest';
import { criarBanco, type Usuario } from './banco';

let banco: Awaited<ReturnType<typeof criarBanco>>;
let kaito: Usuario, aiko: Usuario, bruno: Usuario;
let campanha: string;
let hana: string;

const um = async <T>(p: Promise<T[]>) => (await p)[0];

beforeAll(async () => {
	banco = await criarBanco();
	kaito = await banco.criarUsuario('kaito@exemplo.com', 'Kaito');
	aiko = await banco.criarUsuario('aiko@exemplo.com', 'Aiko');
	bruno = await banco.criarUsuario('bruno@exemplo.com', 'Bruno');
	const c = await um(banco.como<{ id: string }>(kaito, `insert into campanhas (nome, mestre_id, nivel_inicial) values ('Névoa', $1, 2) returning id`, [kaito.id]));
	campanha = c.id;
	const l = await um(banco.como<{ token: string }>(kaito, `insert into convites (campanha_id, tipo) values ($1, 'link') returning token`, [campanha]));
	await banco.como(aiko, `select aceitar_convite($1)`, [l.token]);
	await banco.como(bruno, `select aceitar_convite($1)`, [l.token]);
	const p = await um(
		banco.como<{ id: string }>(aiko, `insert into personagens (campanha_id, jogador_id, nome, resumo) values ($1, $2, 'Hana Nara', '{"ptRestantes": 1, "ryo": 1000, "cla": "nara"}') returning id`, [
			campanha,
			aiko.id
		])
	);
	hana = p.id;
	await banco.como(aiko, `select enviar_ficha($1)`, [hana]);
	await banco.como(kaito, `select decidir_ficha($1, 'aprovada')`, [hana]);
}, 30000);

describe('aprovação', () => {
	it('começa com o XP do nível inicial da campanha, os PT e o ryo da criação', async () => {
		const p = await um(banco.como<{ xp: number; pt: number; ryo: number; nivel: number }>(aiko, `select xp, pt, ryo, nivel from personagens where id = $1`, [hana]));
		expect(p).toEqual({ xp: 200, pt: 1, ryo: 1000, nivel: 1 });
	});

	it('o grupo vê só o resumo público; a ficha completa é do dono e do Mestre', async () => {
		expect(await banco.como(bruno, `select id from personagens`)).toEqual([]);
		const g = await banco.como<{ nome: string; resumo: Record<string, unknown> }>(bruno, `select nome, resumo from personagens_do_grupo($1)`, [campanha]);
		expect(g).toEqual([{ nome: 'Hana Nara', resumo: expect.objectContaining({ cla: 'nara' }) }]);
		expect(g[0].resumo).not.toHaveProperty('ptRestantes');
	});
});

describe('em jogo', () => {
	it('dono e Mestre ajustam o estado; outro jogador não', async () => {
		await banco.como(aiko, `select atualizar_estado($1, '{"pv": 12}', 'PV 25 → 12')`, [hana]);
		await banco.como(kaito, `select atualizar_estado($1, '{"pv": 10}', 'PV 12 → 10')`, [hana]);
		await expect(banco.como(bruno, `select atualizar_estado($1, '{"pv": 99}', 'x')`, [hana])).rejects.toThrow(/não encontrada/);
		const r = await banco.como<{ texto: string }>(aiko, `select texto from ficha_registros where personagem_id = $1 and tipo = 'estado' order by id`, [hana]);
		expect(r.map((x) => x.texto)).toEqual(['PV 25 → 12', 'PV 12 → 10']);
	});

	it('inventário não deixa o ryo negativo', async () => {
		await expect(banco.como(aiko, `select atualizar_inventario($1, '[]', -1, 'x')`, [hana])).rejects.toThrow(/insuficiente/);
		await banco.como(aiko, `select atualizar_inventario($1, '[{"id":"arma-kunai","qtd":12}]', 400, 'Comprou 2 kunai')`, [hana]);
		const p = await um(banco.como<{ ryo: number }>(aiko, `select ryo from personagens where id = $1`, [hana]));
		expect(p.ryo).toBe(400);
	});
});

describe('progressão', () => {
	it('sobe de nível com XP suficiente e ganha 3 PT (+ marcos)', async () => {
		const [{ subir_nivel: n }] = await banco.como<{ subir_nivel: number }>(aiko, `select subir_nivel($1, '{"versao":1}', '{}', '{}', 0)`, [hana]);
		expect(n).toBe(2);
		await expect(banco.como(aiko, `select subir_nivel($1, '{}', '{}', '{}', 0)`, [hana])).rejects.toThrow(/XP insuficiente/);
		const p = await um(banco.como<{ pt: number }>(aiko, `select pt from personagens where id = $1`, [hana]));
		expect(p.pt).toBe(4);
		const n2 = await banco.como<{ texto: string }>(kaito, `select texto from notificacoes where tipo = 'nivel'`);
		expect(n2[0].texto).toBe('Hana Nara (Aiko) chegou ao nível 2');
	});

	it('Mestre não sobe o nível de ficha alheia', async () => {
		await expect(banco.como(kaito, `select subir_nivel($1, '{}', '{}', '{}', 0)`, [hana])).rejects.toThrow(/não encontrada/);
	});

	it('treinar gasta PT e não deixa ficar negativo', async () => {
		await expect(banco.como(aiko, `select treinar($1, '{}', '{}', 9, 'Rank B')`, [hana])).rejects.toThrow(/insuficientes/);
		const [{ treinar: resta }] = await banco.como<{ treinar: number }>(aiko, `select treinar($1, '{"versao":1}', '{}', 2, 'Shunshin no Jutsu')`, [hana]);
		expect(resta).toBe(2);
	});

	it('pedido de PT vai para o Mestre; aprovado soma PT', async () => {
		const [{ solicitar_pt: s }] = await banco.como<{ solicitar_pt: string }>(aiko, `select solicitar_pt($1, 'mentor', 2, 'Kunai com o sensei')`, [hana]);
		expect(s).toBe('pendente');
		const d = await um(banco.como<{ id: string; pt: number }>(kaito, `select id, pt from pedidos_pt`));
		expect(d.pt).toBe(4);
		await expect(banco.como(aiko, `select decidir_pedido_pt($1, true)`, [d.id])).rejects.toThrow(/Só o Mestre/);
		await banco.como(kaito, `select decidir_pedido_pt($1, true)`, [d.id]);
		const p = await um(banco.como<{ pt: number }>(aiko, `select pt from personagens where id = $1`, [hana]));
		expect(p.pt).toBe(6);
	});

	it('Mestre concede recompensas; avisa quando há nível disponível', async () => {
		await expect(banco.como(aiko, `select conceder_recompensa($1, array[$2]::uuid[], 100, 0, 0, 'x')`, [campanha, hana])).rejects.toThrow(/Só o Mestre/);
		const [{ conceder_recompensa: n }] = await banco.como<{ conceder_recompensa: number }>(
			kaito,
			`select conceder_recompensa($1, array[$2]::uuid[], 300, 1, 2000, 'Missão Rank C: escolta', true, false)`,
			[campanha, hana]
		);
		expect(n).toBe(1);
		const p = await um(banco.como<{ xp: number; pt: number; ryo: number; estado: { pd: number } }>(aiko, `select xp, pt, ryo, estado from personagens where id = $1`, [hana]));
		expect(p).toMatchObject({ xp: 500, pt: 7, ryo: 2400, estado: { pd: 1 } });
		const textos = (await banco.como<{ texto: string }>(aiko, `select texto from notificacoes where tipo in ('recompensa', 'nivel_disponivel') order by criada_em`)).map((x) => x.texto);
		expect(textos).toEqual(['Kaito concedeu 300 XP, 1 PT, 2000 ryo, 1 PD a Hana Nara', 'Hana Nara pode subir para o nível 3']);
	});

	it('falecimento é decisão do Mestre e libera uma ficha nova', async () => {
		await expect(banco.como(aiko, `select definir_situacao($1, 'falecido')`, [hana])).rejects.toThrow(/Só o Mestre/);
		await banco.como(kaito, `select definir_situacao($1, 'falecido', 'Caiu protegendo o time')`, [hana]);
		await expect(banco.como(aiko, `select atualizar_estado($1, '{}', 'x')`, [hana])).rejects.toThrow(/não está ativa/);
		await banco.como(aiko, `insert into personagens (campanha_id, jogador_id, nome) values ($1, $2, 'Hana II')`, [campanha, aiko.id]);
		const fichas = await banco.como<{ nome: string; situacao: string }>(aiko, `select nome, situacao from personagens order by criada_em`);
		expect(fichas).toEqual([
			{ nome: 'Hana Nara', situacao: 'falecido' },
			{ nome: 'Hana II', situacao: 'ativo' }
		]);
	});
});
