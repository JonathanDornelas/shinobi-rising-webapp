import { beforeAll, describe, expect, it } from 'vitest';
import { criarBanco, type Usuario } from './banco';

let banco: Awaited<ReturnType<typeof criarBanco>>;
let kaito: Usuario, aiko: Usuario, bruno: Usuario, intruso: Usuario;
let campanha: string;
let ficha: string;

beforeAll(async () => {
	banco = await criarBanco();
	kaito = await banco.criarUsuario('kaito@exemplo.com', 'Kaito');
	aiko = await banco.criarUsuario('aiko@exemplo.com', 'Aiko');
	bruno = await banco.criarUsuario('bruno@exemplo.com', 'Bruno');
	intruso = await banco.criarUsuario('intruso@exemplo.com', 'Intruso');
	const [c] = await banco.como<{ id: string }>(kaito, `insert into campanhas (nome, mestre_id) values ('Sombras sobre a Névoa', $1) returning id`, [kaito.id]);
	campanha = c.id;
	const [l] = await banco.como<{ token: string }>(kaito, `insert into convites (campanha_id, tipo) values ($1, 'link') returning token`, [campanha]);
	await banco.como(aiko, `select aceitar_convite($1)`, [l.token]);
	await banco.como(bruno, `select aceitar_convite($1)`, [l.token]);
}, 30000);

const criar = (u: Usuario, nome: string) =>
	banco.como<{ id: string }>(u, `insert into personagens (campanha_id, jogador_id, nome) values ($1, $2, $3) returning id`, [campanha, u.id, nome]);

describe('criação', () => {
	it('membro cria o próprio rascunho; quem não é membro não cria', async () => {
		const [p] = await criar(aiko, 'Hana Nara');
		ficha = p.id;
		await expect(criar(intruso, 'Infiltrado')).rejects.toThrow();
	});

	it('uma ficha ativa por jogador na campanha', async () => {
		await expect(criar(aiko, 'Outra')).rejects.toThrow(/duplicate|unique/);
	});

	it('não dá para mudar o status nem o nível direto', async () => {
		await expect(banco.como(aiko, `update personagens set status = 'aprovada' where id = $1`, [ficha])).rejects.toThrow(/permission denied/);
		await expect(banco.como(aiko, `update personagens set nivel = 20 where id = $1`, [ficha])).rejects.toThrow(/permission denied/);
	});

	it('o rascunho é visível para o dono e o Mestre, não para o grupo', async () => {
		expect(await banco.como(kaito, `select nome from personagens`)).toEqual([{ nome: 'Hana Nara' }]);
		expect(await banco.como(bruno, `select nome from personagens`)).toEqual([]);
	});
});

describe('revisão', () => {
	it('enviar avisa o Mestre e trava a edição', async () => {
		const [{ enviar_ficha: s }] = await banco.como<{ enviar_ficha: string }>(aiko, `select enviar_ficha($1)`, [ficha]);
		expect(s).toBe('em_revisao');
		const notifs = await banco.como<{ texto: string; href: string }>(kaito, `select texto, href from notificacoes where tipo = 'ficha_enviada'`);
		expect(notifs).toEqual([{ texto: 'Aiko enviou a ficha de Hana Nara para revisão', href: `/campanhas/${campanha}/personagens/${ficha}` }]);
		await banco.como(aiko, `update personagens set nome = 'Mudou' where id = $1`, [ficha]);
		const [p] = await banco.como<{ nome: string }>(aiko, `select nome from personagens where id = $1`, [ficha]);
		expect(p.nome).toBe('Hana Nara');
	});

	it('retirar volta para rascunho', async () => {
		await banco.como(aiko, `select retirar_ficha($1)`, [ficha]);
		const [p] = await banco.como<{ status: string }>(aiko, `select status from personagens where id = $1`, [ficha]);
		expect(p.status).toBe('rascunho');
		await banco.como(aiko, `select enviar_ficha($1)`, [ficha]);
	});

	it('só o Mestre decide; ajustes exigem comentário', async () => {
		await expect(banco.como(aiko, `select decidir_ficha($1, 'aprovada')`, [ficha])).rejects.toThrow(/Só o Mestre/);
		await expect(banco.como(kaito, `select decidir_ficha($1, 'ajustes')`, [ficha])).rejects.toThrow(/Explique/);
		await banco.como(kaito, `select decidir_ficha($1, 'ajustes', 'Falta perícia de combate em +2.')`, [ficha]);
		const [p] = await banco.como<{ status: string; comentario_mestre: string }>(aiko, `select status, comentario_mestre from personagens where id = $1`, [ficha]);
		expect(p).toEqual({ status: 'ajustes', comentario_mestre: 'Falta perícia de combate em +2.' });
		const [n] = await banco.como<{ texto: string }>(aiko, `select texto from notificacoes where tipo = 'ficha_ajustes'`);
		expect(n.texto).toBe('Kaito pediu ajustes na ficha de Hana Nara');
	});

	it('em ajustes o dono edita e reenvia; aprovada fica visível para o grupo', async () => {
		await banco.como(aiko, `update personagens set dados = '{"versao":1}' where id = $1`, [ficha]);
		await banco.como(aiko, `select enviar_ficha($1)`, [ficha]);
		await banco.como(kaito, `select decidir_ficha($1, 'aprovada')`, [ficha]);
		expect(await banco.como(bruno, `select nome, status from personagens`)).toEqual([{ nome: 'Hana Nara', status: 'aprovada' }]);
		await expect(banco.como(aiko, `select enviar_ficha($1)`, [ficha])).rejects.toThrow(/já foi enviada/);
	});

	it('campanha sem aprovação de fichas aprova ao enviar', async () => {
		await banco.como(kaito, `update campanhas set aprovacao = aprovacao || '{"fichas": false}' where id = $1`, [campanha]);
		const [p] = await criar(bruno, 'Ren Uchiha');
		const [{ enviar_ficha: s }] = await banco.como<{ enviar_ficha: string }>(bruno, `select enviar_ficha($1)`, [p.id]);
		expect(s).toBe('aprovada');
	});
});
