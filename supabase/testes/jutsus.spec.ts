import { beforeAll, describe, expect, it } from 'vitest';
import { criarBanco, type Usuario } from './banco';

let banco: Awaited<ReturnType<typeof criarBanco>>;
let kaito: Usuario, bruno: Usuario, aiko: Usuario;
let campanha: string, ren: string, hana: string;
let hyoso: string;

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
	ren = (await um(banco.como<{ id: string }>(bruno, `insert into personagens (campanha_id, jogador_id, nome) values ($1, $2, 'Ren Uchiha') returning id`, [campanha, bruno.id]))).id;
	hana = (await um(banco.como<{ id: string }>(aiko, `insert into personagens (campanha_id, jogador_id, nome) values ($1, $2, 'Hana Nara') returning id`, [campanha, aiko.id]))).id;
}, 30000);

const criar = (u: Usuario, nome: string, extra: Record<string, unknown> = {}) =>
	banco.como<{ id: string }>(
		u,
		`insert into jutsus_criados (campanha_id, autor_id, nome, rank, personagem_id, tipo) values ($1, $2, $3, 'C', $4, $5) returning id`,
		[campanha, u.id, nome, extra.personagem ?? null, extra.tipo ?? 'jutsu']
	);

describe('criação', () => {
	it('membro cria para a própria ficha; não para a ficha de outro', async () => {
		hyoso = (await criar(bruno, 'Hyōsō no Jutsu', { personagem: ren }))[0].id;
		await expect(criar(bruno, 'Roubado', { personagem: hana })).rejects.toThrow(/Ficha indisponível/);
	});

	it('não muda status direto; rascunho é do autor e do Mestre', async () => {
		await expect(banco.como(bruno, `update jutsus_criados set status = 'aprovado' where id = $1`, [hyoso])).rejects.toThrow(/permission denied/);
		expect(await banco.como(kaito, `select nome from jutsus_criados`)).toEqual([{ nome: 'Hyōsō no Jutsu' }]);
		expect(await banco.como(aiko, `select nome from jutsus_criados`)).toEqual([]);
	});
});

describe('revisão', () => {
	it('enviar avisa o Mestre; ajustes exigem comentário; aprovado aparece para o grupo', async () => {
		const [{ enviar_jutsu: s }] = await banco.como<{ enviar_jutsu: string }>(bruno, `select enviar_jutsu($1)`, [hyoso]);
		expect(s).toBe('em_revisao');
		const [n] = await banco.como<{ texto: string; href: string }>(kaito, `select texto, href from notificacoes where tipo = 'jutsu_enviado'`);
		expect(n).toEqual({ texto: 'Bruno enviou o jutsu Hyōsō no Jutsu para revisão', href: `/campanhas/${campanha}/jutsus/${hyoso}` });
		await expect(banco.como(bruno, `select decidir_jutsu($1, 'aprovado')`, [hyoso])).rejects.toThrow(/Só o Mestre/);
		await expect(banco.como(kaito, `select decidir_jutsu($1, 'ajustes')`, [hyoso])).rejects.toThrow(/Explique/);
		await banco.como(kaito, `select decidir_jutsu($1, 'ajustes', 'Rank A exige nível 11.')`, [hyoso]);
		const [m] = await banco.como<{ texto: string }>(bruno, `select texto from notificacoes where tipo = 'jutsu_ajustes'`);
		expect(m.texto).toBe('Kaito pediu ajustes no jutsu Hyōsō no Jutsu');
		await banco.como(bruno, `select enviar_jutsu($1)`, [hyoso]);
		await banco.como(kaito, `select decidir_jutsu($1, 'aprovado')`, [hyoso]);
		expect(await banco.como(aiko, `select nome, status from jutsus_criados`)).toEqual([{ nome: 'Hyōsō no Jutsu', status: 'aprovado' }]);
	});

	it('aprovado ganha nova versão em vez de mudar', async () => {
		await banco.como(bruno, `update jutsus_criados set nome = 'Mudou' where id = $1`, [hyoso]);
		expect((await um(banco.como<{ nome: string }>(bruno, `select nome from jutsus_criados where id = $1`, [hyoso]))).nome).toBe('Hyōsō no Jutsu');
		const [{ nova_versao_jutsu: v2 }] = await banco.como<{ nova_versao_jutsu: string }>(bruno, `select nova_versao_jutsu($1)`, [hyoso]);
		expect(await um(banco.como(bruno, `select versao, status, personagem_id from jutsus_criados where id = $1`, [v2]))).toEqual({ versao: 2, status: 'rascunho', personagem_id: ren });
	});

	it('a habilidade do próprio Mestre entra aprovada', async () => {
		const [h] = await criar(kaito, 'Olhar do Mestre', { tipo: 'habilidade' });
		const [{ enviar_jutsu: s }] = await banco.como<{ enviar_jutsu: string }>(kaito, `select enviar_jutsu($1)`, [h.id]);
		expect(s).toBe('aprovado');
	});
});
