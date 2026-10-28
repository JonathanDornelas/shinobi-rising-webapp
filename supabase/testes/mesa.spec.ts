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

describe('cena narrativa e fundo do quadro', () => {
	it('o Mestre põe a cena em narrativa, com imagem do livro ou da pasta da campanha', async () => {
		await banco.como(kaito, `update mesa_cenas set modo = 'narrativa', imagem = '/capitulos/cap-04.png', fundo = $2, fundo_opacidade = 0.6, grade = false where id = $1`, [ponte, `${campanha}/fundo-1.webp`]);
		expect(await um(banco.como(bruno, `select modo, imagem, fundo, grade from mesa_cenas where id = $1`, [ponte]))).toEqual({ modo: 'narrativa', imagem: '/capitulos/cap-04.png', fundo: `${campanha}/fundo-1.webp`, grade: false });
		await expect(banco.como(kaito, `update mesa_cenas set imagem = 'https://exemplo.com/x.png' where id = $1`, [ponte])).rejects.toThrow(/imagem_valida/);
		await expect(banco.como(kaito, `update mesa_cenas set fundo = $2 where id = $1`, [ponte, '00000000-0000-0000-0000-000000000000/x.webp'])).rejects.toThrow(/fundo_valido/);
		expect(await banco.como(bruno, `update mesa_cenas set modo = 'tatica' where id = $1 returning id`, [ponte])).toEqual([]);
		await banco.como(kaito, `update mesa_cenas set modo = 'tatica', imagem = null, fundo = null, fundo_opacidade = 1, grade = true where id = $1`, [ponte]);
	});

	it('só o Mestre envia e apaga imagens na pasta da campanha', async () => {
		await banco.como(kaito, `insert into storage.objects (bucket_id, name) values ('mesa', $1)`, [`${campanha}/mapa.webp`]);
		await expect(banco.como(bruno, `insert into storage.objects (bucket_id, name) values ('mesa', $1)`, [`${campanha}/outro.webp`])).rejects.toThrow(/row-level security/);
		await expect(banco.como(kaito, `insert into storage.objects (bucket_id, name) values ('mesa', $1)`, ['nada/x.webp'])).rejects.toThrow(/row-level security/);
		expect(await banco.como(bruno, `delete from storage.objects where name = $1 returning id`, [`${campanha}/mapa.webp`])).toEqual([]);
		expect(await banco.como(kaito, `delete from storage.objects where name = $1 returning id`, [`${campanha}/mapa.webp`])).toHaveLength(1);
	});
});

describe('fundo ajustável e enquadramento do NPC', () => {
	it('o Mestre põe escala e posição no fundo, e o enquadramento no NPC', async () => {
		await banco.como(kaito, `update mesa_cenas set fundo_escala = 24, fundo_x = -2, fundo_y = 3.5 where id = $1`, [ponte]);
		expect(await um(banco.como(bruno, `select fundo_escala, fundo_x, fundo_y from mesa_cenas where id = $1`, [ponte]))).toEqual({ fundo_escala: 24, fundo_x: -2, fundo_y: 3.5 });
		await expect(banco.como(kaito, `update mesa_cenas set fundo_escala = 0 where id = $1`, [ponte])).rejects.toThrow(/check/);
		await banco.como(kaito, `update npcs set enquadramento = '{"zoom": 1.8, "x": 0.1, "y": 0.3}'::jsonb where id = $1`, [hideo]);
		await expect(banco.como(kaito, `update npcs set enquadramento = '{"zoom": 50, "x": 0, "y": 0}'::jsonb where id = $1`, [hideo])).rejects.toThrow(/check/);
		await banco.como(kaito, `update mesa_cenas set fundo_escala = null, fundo_x = 0, fundo_y = 0 where id = $1`, [ponte]);
	});
});

describe('objetos da cena', () => {
	it('o grupo põe alfinetes e textos seus; imagem é só do Mestre', async () => {
		await banco.como(kaito, `select ativar_cena($1)`, [ponte]);
		const alfinete = await um(banco.como<{ id: string }>(bruno, `insert into mesa_objetos (cena_id, tipo, x, y, texto, cor) values ($1, 'alfinete', 12.5, 8, 'Armadilha?', '#c44536') returning id`, [ponte]));
		await banco.como(bruno, `insert into mesa_objetos (cena_id, tipo, x, y, texto, tamanho, fonte, cor) values ($1, 'texto', 5, 5, 'Ponte quebrada', 1.2, 'mincho', '#ffffff')`, [ponte]);
		await expect(banco.como(bruno, `insert into mesa_objetos (cena_id, tipo, x, y, largura, altura, imagem) values ($1, 'imagem', 5, 5, 4, 4, '/capitulos/cap-04.png')`, [ponte])).rejects.toThrow(/row-level security/);
		await banco.como(kaito, `insert into mesa_objetos (cena_id, tipo, x, y, largura, altura, imagem) values ($1, 'imagem', 20, 10, 6, 4, '/capitulos/cap-04.png')`, [ponte]);
		expect(await banco.como(aiko, `select tipo from mesa_objetos order by tipo`)).toEqual([{ tipo: 'alfinete' }, { tipo: 'imagem' }, { tipo: 'texto' }]);
		// cada um mexe nos seus; o Mestre em todos
		expect(await banco.como(aiko, `update mesa_objetos set x = 1 where id = $1 returning id`, [alfinete.id])).toEqual([]);
		expect(await banco.como(bruno, `update mesa_objetos set x = 13 where id = $1 returning id`, [alfinete.id])).toHaveLength(1);
		expect(await banco.como(aiko, `delete from mesa_objetos where id = $1 returning id`, [alfinete.id])).toEqual([]);
		expect(await banco.como(kaito, `update mesa_objetos set x = 14 where id = $1 returning id`, [alfinete.id])).toHaveLength(1);
		// a campanha vem da cena, e o autor não muda
		expect(await um(banco.como(kaito, `select campanha_id from mesa_objetos where id = $1`, [alfinete.id]))).toEqual({ campanha_id: campanha });
		await banco.como(kaito, `update mesa_objetos set autor_id = $2 where id = $1`, [alfinete.id, aiko.id]);
		expect(await um(banco.como(kaito, `select autor_id from mesa_objetos where id = $1`, [alfinete.id]))).toEqual({ autor_id: bruno.id });
	});

	it('o que o Mestre esconde o grupo não vê, e as regras do tipo valem', async () => {
		await banco.como(kaito, `update mesa_objetos set visivel = false where tipo = 'imagem'`);
		expect(await banco.como(bruno, `select tipo from mesa_objetos where tipo = 'imagem'`)).toEqual([]);
		expect(await banco.como(kaito, `select tipo from mesa_objetos where tipo = 'imagem'`)).toHaveLength(1);
		await expect(banco.como(kaito, `insert into mesa_objetos (cena_id, tipo, x, y) values ($1, 'imagem', 1, 1)`, [ponte])).rejects.toThrow(/por_tipo/);
		await expect(banco.como(kaito, `insert into mesa_objetos (cena_id, tipo, x, y, texto, tamanho) values ($1, 'texto', 1, 1, '   ', 1)`, [ponte])).rejects.toThrow(/por_tipo/);
		await expect(banco.como(kaito, `insert into mesa_objetos (cena_id, tipo, x, y, largura, altura, imagem) values ($1, 'imagem', 1, 1, 2, 2, 'https://x.com/a.png')`, [ponte])).rejects.toThrow(/imagem_valida/);
		await expect(banco.como(kaito, `insert into mesa_objetos (cena_id, tipo, x, y, largura, altura, imagem) values ($1, 'imagem', 1, 1, 2, 2, '00000000-0000-0000-0000-000000000000/a.webp')`, [ponte])).rejects.toThrow(/imagem_valida/);
		await expect(banco.como(kaito, `insert into mesa_objetos (cena_id, tipo, x, texto) values ($1, 'alfinete', 1, repeat('a', 41))`, [ponte])).rejects.toThrow(/por_tipo/);
	});

	it('a mesa travada segura quem joga, e a cena sem grupo some do jogador', async () => {
		await banco.como(kaito, `update mesa_cenas set travada = true where id = $1`, [ponte]);
		await expect(banco.como(bruno, `insert into mesa_objetos (cena_id, tipo, x, y) values ($1, 'alfinete', 2, 2)`, [ponte])).rejects.toThrow(/row-level security/);
		await banco.como(kaito, `update mesa_cenas set travada = false where id = $1`, [ponte]);
		await banco.como(kaito, `select ativar_cena($1)`, [esconderijo]);
		expect(await banco.como(bruno, `select id from mesa_objetos`)).toEqual([]);
		await banco.como(kaito, `select ativar_cena($1)`, [ponte]);
	});
});

describe('biblioteca de artes', () => {
	it('é do Mestre, com caminho da pasta da campanha e limite', async () => {
		const arte = await um(banco.como<{ id: string }>(kaito, `insert into mesa_artes (campanha_id, nome, tipo, caminho, miniatura, largura, altura, bytes) values ($1, 'Ponte', 'mapa', $2, $3, 2048, 1024, 90000) returning id`, [campanha, `${campanha}/arte-a1.webp`, `${campanha}/arte-a1-m.webp`]));
		expect(await banco.como(bruno, `select id from mesa_artes`)).toEqual([]);
		await expect(banco.como(bruno, `insert into mesa_artes (campanha_id, nome, caminho, largura, altura) values ($1, 'X', $2, 10, 10)`, [campanha, `${campanha}/arte-b.webp`])).rejects.toThrow(/row-level security/);
		await expect(banco.como(kaito, `insert into mesa_artes (campanha_id, nome, caminho, largura, altura) values ($1, 'X', $2, 10, 10)`, [campanha, 'outra/arte.webp'])).rejects.toThrow(/caminho_valido/);
		// apagar a arte tira ela de onde estava em uso
		await banco.como(kaito, `update mesa_cenas set fundo = $2 where id = $1`, [ponte, `${campanha}/arte-a1.webp`]);
		await banco.como(kaito, `insert into mesa_objetos (cena_id, tipo, x, y, largura, altura, imagem) values ($1, 'imagem', 3, 3, 2, 2, $2)`, [ponte, `${campanha}/arte-a1.webp`]);
		await banco.como(kaito, `delete from mesa_artes where id = $1`, [arte.id]);
		expect(await um(banco.como(kaito, `select fundo from mesa_cenas where id = $1`, [ponte]))).toEqual({ fundo: null });
		expect(await banco.como(kaito, `select id from mesa_objetos where imagem like '%arte-a1%'`)).toEqual([]);
	});

	it('guarda até 300 artes por campanha', async () => {
		await banco.db.query(`insert into mesa_artes (campanha_id, autor_id, nome, caminho, largura, altura) select $1::uuid, $2::uuid, 'a' || g, $1::text || '/a' || g || '.webp', 10, 10 from generate_series(1, 300) g`, [campanha, kaito.id]);
		await expect(banco.como(kaito, `insert into mesa_artes (campanha_id, nome, caminho, largura, altura) values ($1, 'a mais', $2, 10, 10)`, [campanha, `${campanha}/maisuma.webp`])).rejects.toThrow(/300 artes/);
		await banco.db.query(`delete from mesa_artes where campanha_id = $1`, [campanha]);
	});
});

describe('cenas em pastas, névoa e estilo dos efeitos', () => {
	it('pastas de cenas: só o Mestre, até 3 níveis, e o conteúdo sobe ao apagar', async () => {
		const a = await um(banco.como<{ id: string }>(kaito, `insert into mesa_cena_pastas (campanha_id, nome) values ($1, 'Ato 1') returning id`, [campanha]));
		const b = await um(banco.como<{ id: string }>(kaito, `insert into mesa_cena_pastas (campanha_id, nome, pai_id) values ($1, 'Vila', $2) returning id`, [campanha, a.id]));
		const c = await um(banco.como<{ id: string }>(kaito, `insert into mesa_cena_pastas (campanha_id, nome, pai_id) values ($1, 'Taverna', $2) returning id`, [campanha, b.id]));
		await expect(banco.como(kaito, `insert into mesa_cena_pastas (campanha_id, nome, pai_id) values ($1, 'Funda demais', $2)`, [campanha, c.id])).rejects.toThrow(/3 níveis/);
		await expect(banco.como(bruno, `insert into mesa_cena_pastas (campanha_id, nome) values ($1, 'Minha')`, [campanha])).rejects.toThrow(/row-level security/);
		await banco.como(kaito, `update mesa_cenas set pasta_id = $2 where id = $1`, [esconderijo, c.id]);
		await expect(banco.como(kaito, `update mesa_cenas set pasta_id = '00000000-0000-0000-0000-000000000000' where id = $1`, [ponte])).rejects.toThrow(/violates foreign key|Pasta não encontrada/);
		await banco.como(kaito, `delete from mesa_cena_pastas where id = $1`, [c.id]);
		expect(await um(banco.como(kaito, `select pasta_id from mesa_cenas where id = $1`, [esconderijo]))).toEqual({ pasta_id: b.id });
		await banco.como(kaito, `update mesa_cenas set pasta_id = null where id = $1`, [esconderijo]);
		await banco.como(kaito, `delete from mesa_cena_pastas where id = $1`, [a.id]);
	});

	it('nome público e névoa são do Mestre; as runs têm limite', async () => {
		await banco.como(kaito, `update mesa_cenas set nome_publico = 'Uma ponte antiga', nevoa = true, reveladas = '[[3, 2, 9], [4, 2, 9]]'::jsonb where id = $1`, [ponte]);
		expect(await um(banco.como(bruno, `select nome_publico, nevoa, reveladas from mesa_cenas where id = $1`, [ponte]))).toEqual({ nome_publico: 'Uma ponte antiga', nevoa: true, reveladas: [[3, 2, 9], [4, 2, 9]] });
		expect(await banco.como(bruno, `update mesa_cenas set nevoa = false where id = $1 returning id`, [ponte])).toEqual([]);
		await expect(banco.como(kaito, `update mesa_cenas set reveladas = '{"a": 1}'::jsonb where id = $1`, [ponte])).rejects.toThrow(/check/);
		await expect(banco.como(kaito, `update mesa_cenas set nome_publico = repeat('a', 61) where id = $1`, [ponte])).rejects.toThrow(/check/);
		await banco.como(kaito, `update mesa_cenas set nome_publico = null, nevoa = false, reveladas = '[]'::jsonb where id = $1`, [ponte]);
	});

	it('o efeito guarda o estilo (elemento ou tipo de jutsu)', async () => {
		await banco.como(kaito, `insert into mesa_efeitos (cena_id, nome, quadrados, estilo) values ($1, 'Fogo', '[[1,1]]'::jsonb, 'katon')`, [ponte]);
		await expect(banco.como(kaito, `insert into mesa_efeitos (cena_id, nome, quadrados, estilo) values ($1, 'Estranho', '[[1,1]]'::jsonb, 'laser')`, [ponte])).rejects.toThrow(/check/);
		expect(await um(banco.como(bruno, `select estilo from mesa_efeitos where nome = 'Fogo'`))).toEqual({ estilo: 'katon' });
	});
});

describe('jukebox', () => {
	it('o grupo ouve e só o Mestre muda; o servidor carimba a hora', async () => {
		await banco.como(kaito, `insert into mesa_jukebox (campanha_id, fonte, ref, titulo, tocando, posicao) values ($1, 'youtube', 'dQw4w9WgXcQ', 'Tema da vila', true, 12.5)`, [campanha]);
		const j = await um(banco.como<{ tocando: boolean; posicao: number; dentro: boolean }>(bruno, `select tocando, posicao, (desde > now() - interval '1 minute') as dentro from mesa_jukebox where campanha_id = $1`, [campanha]));
		expect(j).toEqual({ tocando: true, posicao: 12.5, dentro: true });
		expect(await banco.como(bruno, `update mesa_jukebox set tocando = false where campanha_id = $1 returning campanha_id`, [campanha])).toEqual([]);
		expect(await banco.como(bruno, `delete from mesa_jukebox where campanha_id = $1 returning campanha_id`, [campanha])).toEqual([]);
		await expect(banco.como(kaito, `update mesa_jukebox set ref = 'https://youtu.be/x' where campanha_id = $1`, [campanha])).rejects.toThrow(/check/);
		await banco.como(kaito, `update mesa_jukebox set fonte = 'spotify', ref = 'playlist/37i9dQZF1DXcBWIGoYBM5M', lista = true where campanha_id = $1`, [campanha]);
		expect(await um(banco.como(kaito, `select agora_servidor() is not null as ok`))).toEqual({ ok: true });
	});
});
