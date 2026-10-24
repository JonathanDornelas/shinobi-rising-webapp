import { beforeAll, describe, expect, it } from 'vitest';
import { criarBanco, type Usuario } from './banco';

let banco: Awaited<ReturnType<typeof criarBanco>>;
let kaito: Usuario, bruno: Usuario, aiko: Usuario;
let campanha: string, ren: string, hana: string, hideo: string, ponte: string, esconderijo: string;

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
	for (const [u, nome] of [[bruno, 'Ren'], [aiko, 'Hana']] as const) {
		const id = (await um(banco.como<{ id: string }>(u, `insert into personagens (campanha_id, jogador_id, nome) values ($1, $2, $3) returning id`, [campanha, u.id, nome]))).id;
		await banco.como(u, `select enviar_ficha($1)`, [id]);
		await banco.como(kaito, `select decidir_ficha($1, 'aprovada')`, [id]);
		await banco.db.query(`update personagens set resumo = resumo || '{"pv": 40}'::jsonb where id = $1`, [id]);
		if (nome === 'Ren') ren = id;
		else hana = id;
	}
	hideo = (await um(banco.como<{ id: string }>(kaito, `insert into npcs (campanha_id, nome, pv) values ($1, 'Hideo', 45) returning id`, [campanha]))).id;
	ponte = (await um(banco.como<{ id: string }>(kaito, `insert into mesa_cenas (campanha_id, nome) values ($1, 'A ponte') returning id`, [campanha]))).id;
	esconderijo = (await um(banco.como<{ id: string }>(kaito, `insert into mesa_cenas (campanha_id, nome, largura, altura) values ($1, 'Esconderijo', 30, 20) returning id`, [campanha]))).id;
}, 30000);

describe('cenas', () => {
	it('o grupo só vê a cena ativa, e só uma fica ativa', async () => {
		expect(await banco.como(bruno, `select id from mesa_cenas`)).toEqual([]);
		await expect(banco.como(bruno, `insert into mesa_cenas (campanha_id, nome) values ($1, 'Minha')`, [campanha])).rejects.toThrow(/row-level security/);
		await expect(banco.como(bruno, `select ativar_cena($1)`, [ponte])).rejects.toThrow(/Cena não encontrada/);
		await banco.como(kaito, `select ativar_cena($1)`, [esconderijo]);
		await banco.como(kaito, `select ativar_cena($1)`, [ponte]);
		expect(await banco.como(bruno, `select nome from mesa_cenas`)).toEqual([{ nome: 'A ponte' }]);
		expect(await banco.como(kaito, `select nome from mesa_cenas where ativa`)).toEqual([{ nome: 'A ponte' }]);
	});
});

describe('tokens', () => {
	it('NPC escondido só o Mestre vê; o jogador põe só o próprio personagem', async () => {
		await banco.como(kaito, `insert into mesa_tokens (cena_id, campanha_id, npc_id, nome, sigla, x, y, visivel) values ($1, $2, $3, 'Hideo', 'HI', 21, 13, false)`, [ponte, campanha, hideo]);
		expect(await banco.como(bruno, `select nome from mesa_tokens`)).toEqual([]);
		await banco.como(bruno, `insert into mesa_tokens (cena_id, campanha_id, personagem_id, dono_id, nome, x, y) values ($1, $2, $3, $4, 'Ren', 7, 14)`, [ponte, campanha, ren, bruno.id]);
		await expect(
			banco.como(bruno, `insert into mesa_tokens (cena_id, campanha_id, personagem_id, dono_id, nome) values ($1, $2, $3, $4, 'Hana')`, [ponte, campanha, hana, bruno.id])
		).rejects.toThrow(/row-level security/);
		await expect(
			banco.como(bruno, `insert into mesa_tokens (cena_id, campanha_id, npc_id, dono_id, nome) values ($1, $2, $3, $4, 'Hideo 2')`, [ponte, campanha, hideo, bruno.id])
		).rejects.toThrow(/row-level security/);
		await expect(banco.como(kaito, `insert into mesa_tokens (cena_id, campanha_id, nome, x) values ($1, $2, 'Longe', 45)`, [ponte, campanha])).rejects.toThrow(/Fora da cena/);
		await banco.como(kaito, `update mesa_tokens set visivel = true where npc_id = $1`, [hideo]);
		expect((await banco.como(bruno, `select nome from mesa_tokens order by nome`)).map((t) => t.nome)).toEqual(['Hideo', 'Ren']);
	});

	it('o jogador move o próprio token e mais nada', async () => {
		const [t] = await banco.como<{ id: string }>(bruno, `update mesa_tokens set x = 10, y = 12, movido = 4, visivel = false, tamanho = 3 where personagem_id = $1 returning id`, [ren]);
		expect(await um(banco.como(kaito, `select x, y, movido, visivel, tamanho from mesa_tokens where id = $1`, [t.id]))).toEqual({ x: 10, y: 12, movido: 4, visivel: true, tamanho: 1 });
		expect(await banco.como(bruno, `update mesa_tokens set x = 1 where npc_id = $1 returning id`, [hideo])).toEqual([]);
		expect(await banco.como(aiko, `update mesa_tokens set x = 1 where personagem_id = $1 returning id`, [ren])).toEqual([]);
		await banco.como(kaito, `update mesa_cenas set travada = true where id = $1`, [ponte]);
		await expect(banco.como(bruno, `update mesa_tokens set x = 11 where personagem_id = $1`, [ren])).rejects.toThrow(/Mesa travada/);
		await banco.como(kaito, `update mesa_tokens set x = 11 where personagem_id = $1`, [ren]);
		await banco.como(kaito, `update mesa_cenas set travada = false where id = $1`, [ponte]);
	});

	it('clones ficam com o dono, que pode tirá-los; o próprio personagem, não', async () => {
		const base = await um(banco.como<{ id: string }>(bruno, `select id from mesa_tokens where personagem_id = $1`, [ren]));
		const [clone] = await banco.como<{ id: string }>(bruno, `insert into mesa_tokens (cena_id, campanha_id, ligado_a, dono_id, nome, x, y, pv, pv_max) values ($1, $2, $3, $4, 'Clone', 12, 12, 1, 1) returning id`, [ponte, campanha, base.id, bruno.id]);
		await expect(
			banco.como(aiko, `insert into mesa_tokens (cena_id, campanha_id, ligado_a, dono_id, nome) values ($1, $2, $3, $4, 'Clone falso')`, [ponte, campanha, base.id, aiko.id])
		).rejects.toThrow(/row-level security/);
		expect(await banco.como(bruno, `delete from mesa_tokens where id = $1 returning id`, [clone.id])).toHaveLength(1);
		expect(await banco.como(bruno, `delete from mesa_tokens where id = $1 returning id`, [base.id])).toEqual([]);
	});

	it('PV e estados da ficha e do NPC aparecem no token como faixa', async () => {
		await banco.como(bruno, `select atualizar_estado($1, '{"pv": 15, "condicoes": ["sangrando"]}'::jsonb, '')`, [ren]);
		expect(await um(banco.como(aiko, `select ferimento, condicoes from mesa_tokens where personagem_id = $1`, [ren]))).toEqual({ ferimento: 2, condicoes: ['sangrando'] });
		await banco.como(kaito, `update npcs set pv_atual = '{30}' where id = $1`, [hideo]);
		expect(await um(banco.como(bruno, `select ferimento from mesa_tokens where npc_id = $1`, [hideo]))).toEqual({ ferimento: 1 });
	});

	it('os números de PV dos outros só aparecem com "Mostrar PV ao grupo"', async () => {
		expect(await banco.como(aiko, `select * from pv_da_cena($1)`, [ponte])).toEqual([]);
		expect(await banco.como(kaito, `select pv, pv_max from pv_da_cena($1) order by pv`, [ponte])).toEqual([
			{ pv: 15, pv_max: 40 },
			{ pv: 30, pv_max: 45 }
		]);
		await banco.como(kaito, `update mesa_cenas set mostrar_pv = true where id = $1`, [ponte]);
		expect(await banco.como(aiko, `select pv from pv_da_cena($1) order by pv`, [ponte])).toEqual([{ pv: 15 }, { pv: 30 }]);
	});
});

describe('traços e efeitos', () => {
	it('cada um apaga os próprios traços; o Mestre apaga todos', async () => {
		const [t] = await banco.como<{ id: string }>(aiko, `insert into mesa_tracos (cena_id, pontos) values ($1, '[[5.5, 13.5], [9.2, 13.5]]') returning id`, [ponte]);
		expect(await banco.como(bruno, `select id from mesa_tracos`)).toHaveLength(1);
		expect(await banco.como(bruno, `delete from mesa_tracos where id = $1 returning id`, [t.id])).toEqual([]);
		expect(await banco.como(kaito, `delete from mesa_tracos where id = $1 returning id`, [t.id])).toHaveLength(1);
		await expect(banco.como(aiko, `insert into mesa_tracos (cena_id, pontos) values ($1, '[[1, 1], [2, 2]]')`, [esconderijo])).rejects.toThrow(/row-level security/);
	});

	it('o jogador deixa o efeito do jutsu; o Mestre conta os turnos', async () => {
		const [e] = await banco.como<{ id: string }>(bruno, `insert into mesa_efeitos (cena_id, nome, quadrados, turnos) values ($1, 'Kirigakure', '[[20, 13], [21, 13]]', 3) returning id`, [ponte]);
		expect(await banco.como(bruno, `update mesa_efeitos set turnos = 9 where id = $1 returning id`, [e.id])).toEqual([]);
		expect(await um(banco.como(kaito, `update mesa_efeitos set turnos = turnos - 1 where id = $1 returning turnos`, [e.id]))).toEqual({ turnos: 2 });
	});
});

describe('ajustes: participantes e NPC do bestiário', () => {
	it('quem não participa da cena não entra com o personagem', async () => {
		const [c] = await banco.como<{ id: string }>(kaito, `insert into mesa_cenas (campanha_id, nome) values ($1, 'Floresta') returning id`, [campanha]);
		await banco.como(kaito, `update mesa_cenas set participantes = array[$2::uuid] where id = $1`, [c.id, ren]);
		await banco.como(kaito, `select ativar_cena($1)`, [c.id]);
		await expect(
			banco.como(aiko, `insert into mesa_tokens (cena_id, campanha_id, personagem_id, dono_id, nome) values ($1, $2, $3, $4, 'Hana')`, [c.id, campanha, hana, aiko.id])
		).rejects.toThrow(/row-level security/);
		await banco.como(bruno, `insert into mesa_tokens (cena_id, campanha_id, personagem_id, dono_id, nome) values ($1, $2, $3, $4, 'Ren')`, [c.id, campanha, ren, bruno.id]);
		await banco.como(kaito, `select ativar_cena($1)`, [ponte]);
	});

	it('o NPC do bestiário guarda jutsus, acerto, DT e arte', async () => {
		const [n] = await banco.como<{ jutsus: string[]; dt: number }>(
			kaito,
			`insert into npcs (campanha_id, nome, jutsus, acerto, dt, arte, bestiario) values ($1, 'Aburame', '{mushi-bunshin-no-jutsu}', 6, 16, '/bestiario/cla-aburame--chunin.png', 'cla-aburame#chunin') returning jutsus, dt`,
			[campanha]
		);
		expect(n).toEqual({ jutsus: ['mushi-bunshin-no-jutsu'], dt: 16 });
		await expect(banco.como(kaito, `insert into npcs (campanha_id, nome, arte) values ($1, 'X', 'https://fora.com/x.png')`, [campanha])).rejects.toThrow(/check/);
	});
});

describe('pastas de NPCs e cores', () => {
	it('pastas vão até 3 níveis, e excluir uma não apaga NPCs', async () => {
		await expect(banco.como(bruno, `insert into npc_pastas (campanha_id, nome) values ($1, 'Minha')`, [campanha])).rejects.toThrow(/row-level security/);
		const nova = async (nome: string, pai: string | null) => (await um(banco.como<{ id: string }>(kaito, `insert into npc_pastas (campanha_id, nome, pai_id) values ($1, $2, $3) returning id`, [campanha, nome, pai]))).id;
		const arco = await nova('Arco 1', null);
		const capangas = await nova('Capangas', arco);
		const elite = await nova('Elite', capangas);
		await expect(nova('Fundo demais', elite)).rejects.toThrow(/3 níveis/);
		const solta = await nova('Solta', null);
		await nova('Filha', solta);
		await expect(banco.como(kaito, `update npc_pastas set pai_id = $1 where id = $2`, [capangas, solta])).rejects.toThrow(/3 níveis/);
		await banco.como(kaito, `update npcs set pasta_id = $1 where id = $2`, [elite, hideo]);
		await banco.como(kaito, `delete from npc_pastas where id = $1`, [elite]);
		expect(await um(banco.como(kaito, `select pasta_id from npcs where id = $1`, [hideo]))).toEqual({ pasta_id: capangas });
		await banco.como(kaito, `delete from npc_pastas where id = $1`, [arco]);
		expect(await um(banco.como(kaito, `select pai_id from npc_pastas where id = $1`, [capangas]))).toEqual({ pai_id: null });
	});

	it('cada cor é de uma pessoa só na campanha', async () => {
		await banco.como(aiko, `select definir_cor($1, 'anil')`, [campanha]);
		await expect(banco.como(bruno, `select definir_cor($1, 'anil')`, [campanha])).rejects.toThrow(/outra pessoa/);
		await banco.como(bruno, `select definir_cor($1, 'ameixa')`, [campanha]);
		expect(await banco.como(kaito, `select cor from membros where campanha_id = $1 and cor is not null order by cor`, [campanha])).toEqual([{ cor: 'ameixa' }, { cor: 'anil' }]);
	});
});

describe('moldura da mesa e token crescido', () => {
	it('o jogador cresce o próprio token pelo jutsu e volta, mas não muda o tamanho de outro jeito', async () => {
		const sel = () => um(banco.como(kaito, `select tamanho, tamanho_base, crescido_turnos from mesa_tokens where personagem_id = $1`, [ren]));
		await banco.como(bruno, `update mesa_tokens set tamanho = 3, tamanho_base = 1, crescido_turnos = 3 where personagem_id = $1`, [ren]);
		expect(await sel()).toEqual({ tamanho: 3, tamanho_base: 1, crescido_turnos: 3 });
		await banco.como(bruno, `update mesa_tokens set tamanho = 6, tamanho_base = 3 where personagem_id = $1`, [ren]);
		expect(await sel()).toEqual({ tamanho: 3, tamanho_base: 1, crescido_turnos: 3 });
		await banco.como(bruno, `update mesa_tokens set tamanho = 1, tamanho_base = null, crescido_turnos = null where personagem_id = $1`, [ren]);
		expect(await sel()).toEqual({ tamanho: 1, tamanho_base: null, crescido_turnos: null });
		await banco.como(bruno, `update mesa_tokens set tamanho = 6 where personagem_id = $1`, [ren]);
		expect(await sel()).toEqual({ tamanho: 1, tamanho_base: null, crescido_turnos: null });
	});

	it('a moldura da mesa é do Mestre', async () => {
		await banco.como(kaito, `update campanhas set moldura = 'hitaiate', moldura_universal = true where id = $1`, [campanha]);
		expect(await banco.como(bruno, `update campanhas set moldura = 'kunai' where id = $1 returning id`, [campanha])).toEqual([]);
		await expect(banco.como(kaito, `update campanhas set moldura = 'Hitaiate!' where id = $1`, [campanha])).rejects.toThrow(/check/);
		expect(await um(banco.como(bruno, `select moldura, moldura_universal from campanhas where id = $1`, [campanha]))).toEqual({ moldura: 'hitaiate', moldura_universal: true });
	});
});

describe('terreno difícil', () => {
	it('só o Mestre marca o terreno da cena, e o grupo vê', async () => {
		await banco.como(kaito, `update mesa_cenas set terreno = '[[3,4],[3,5]]'::jsonb where id = $1`, [ponte]);
		expect(await banco.como(bruno, `update mesa_cenas set terreno = '[]'::jsonb where id = $1 returning id`, [ponte])).toEqual([]);
		expect(await um(banco.como(bruno, `select terreno from mesa_cenas where id = $1`, [ponte]))).toEqual({ terreno: [[3, 4], [3, 5]] });
		await expect(banco.como(kaito, `update mesa_cenas set terreno = '{"x": 1}'::jsonb where id = $1`, [ponte])).rejects.toThrow(/check/);
	});
});
