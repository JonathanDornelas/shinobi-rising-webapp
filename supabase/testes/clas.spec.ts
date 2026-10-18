import { beforeAll, describe, expect, it } from 'vitest';
import { criarBanco, type Usuario } from './banco';

let banco: Awaited<ReturnType<typeof criarBanco>>;
let kaito: Usuario, diego: Usuario, aiko: Usuario, intruso: Usuario;
let campanha: string;
let kasai: string;

const um = async <T>(p: Promise<T[]>) => (await p)[0];

beforeAll(async () => {
	banco = await criarBanco();
	kaito = await banco.criarUsuario('kaito@exemplo.com', 'Kaito');
	diego = await banco.criarUsuario('diego@exemplo.com', 'Diego');
	aiko = await banco.criarUsuario('aiko@exemplo.com', 'Aiko');
	intruso = await banco.criarUsuario('intruso@exemplo.com', 'Intruso');
	const c = await um(banco.como<{ id: string }>(kaito, `insert into campanhas (nome, mestre_id) values ('Névoa', $1) returning id`, [kaito.id]));
	campanha = c.id;
	const l = await um(banco.como<{ token: string }>(kaito, `insert into convites (campanha_id, tipo) values ($1, 'link') returning token`, [campanha]));
	await banco.como(diego, `select aceitar_convite($1)`, [l.token]);
	await banco.como(aiko, `select aceitar_convite($1)`, [l.token]);
}, 30000);

const criar = (u: Usuario, nome: string, kkg = true) =>
	banco.como<{ id: string }>(u, `insert into clas (campanha_id, autor_id, nome, kkg) values ($1, $2, $3, $4) returning id`, [campanha, u.id, nome, kkg]);

describe('criação', () => {
	it('membro cria o próprio clã; quem não é membro não cria', async () => {
		kasai = (await criar(diego, 'Kasai Joushou'))[0].id;
		await expect(criar(intruso, 'Infiltrados')).rejects.toThrow();
	});

	it('respeita o que a campanha permite', async () => {
		await banco.como(kaito, `update campanhas set clas_sem_kkg = false where id = $1`, [campanha]);
		await expect(criar(aiko, 'Tsuki no Mai', false)).rejects.toThrow(/row-level security/);
		await banco.como(kaito, `update campanhas set clas_sem_kkg = true where id = $1`, [campanha]);
	});

	it('não muda status, versão nem KKG direto', async () => {
		await expect(banco.como(diego, `update clas set status = 'aprovado' where id = $1`, [kasai])).rejects.toThrow(/permission denied/);
		await expect(banco.como(diego, `update clas set kkg = false where id = $1`, [kasai])).rejects.toThrow(/permission denied/);
	});

	it('rascunho é do autor e do Mestre, não do grupo', async () => {
		expect(await banco.como(kaito, `select nome from clas`)).toEqual([{ nome: 'Kasai Joushou' }]);
		expect(await banco.como(aiko, `select nome from clas`)).toEqual([]);
	});
});

describe('revisão', () => {
	it('enviar avisa o Mestre; retirar volta para rascunho', async () => {
		const [{ enviar_cla: s }] = await banco.como<{ enviar_cla: string }>(diego, `select enviar_cla($1)`, [kasai]);
		expect(s).toBe('em_revisao');
		const [n] = await banco.como<{ texto: string; href: string }>(kaito, `select texto, href from notificacoes where tipo = 'cla_enviado'`);
		expect(n).toEqual({ texto: 'Diego enviou o clã Kasai Joushou para revisão', href: `/campanhas/${campanha}/clas/${kasai}` });
		await banco.como(diego, `select retirar_cla($1)`, [kasai]);
		await banco.como(diego, `select enviar_cla($1)`, [kasai]);
	});

	it('só o Mestre decide; ajustes exigem comentário', async () => {
		await expect(banco.como(diego, `select decidir_cla($1, 'aprovado')`, [kasai])).rejects.toThrow(/Só o Mestre/);
		await expect(banco.como(kaito, `select decidir_cla($1, 'ajustes')`, [kasai])).rejects.toThrow(/Explique/);
		await banco.como(kaito, `select decidir_cla($1, 'ajustes', 'Imunidade a fogo é forte demais para 4 PKG.')`, [kasai]);
		const [n] = await banco.como<{ texto: string }>(diego, `select texto from notificacoes where tipo = 'cla_ajustes'`);
		expect(n.texto).toBe('Kaito pediu ajustes no clã Kasai Joushou');
	});

	it('a ficha só envia com o clã enviado e só é aprovada com o clã aprovado', async () => {
		const [p] = await banco.como<{ id: string }>(diego, `insert into personagens (campanha_id, jogador_id, nome, cla_id) values ($1, $2, 'Daichi Kasai', $3) returning id`, [
			campanha,
			diego.id,
			kasai
		]);
		await expect(banco.como(diego, `select enviar_ficha($1)`, [p.id])).rejects.toThrow(/Envie o clã/);
		await banco.como(diego, `select enviar_cla($1)`, [kasai]);
		await banco.como(diego, `select enviar_ficha($1)`, [p.id]);
		await expect(banco.como(kaito, `select decidir_ficha($1, 'aprovada')`, [p.id])).rejects.toThrow(/Aprove o clã/);
		await banco.como(kaito, `select decidir_cla($1, 'aprovado')`, [kasai]);
		await banco.como(kaito, `select decidir_ficha($1, 'aprovada')`, [p.id]);
		expect(await banco.como(aiko, `select nome, status from clas`)).toEqual([{ nome: 'Kasai Joushou', status: 'aprovado' }]);
	});

	it('ficha não aponta para rascunho de outro jogador', async () => {
		const [t] = await criar(aiko, 'Tsuchigumo', false);
		await expect(
			banco.como(diego, `insert into personagens (campanha_id, jogador_id, nome, cla_id) values ($1, $2, 'Outro', $3)`, [campanha, diego.id, t.id])
		).rejects.toThrow();
	});
});

describe('versões', () => {
	it('aprovado é somente leitura; editar cria nova versão em rascunho', async () => {
		await banco.como(diego, `update clas set nome = 'Mudou' where id = $1`, [kasai]);
		expect((await um(banco.como<{ nome: string }>(diego, `select nome from clas where id = $1`, [kasai]))).nome).toBe('Kasai Joushou');
		const [{ nova_versao_cla: v2 }] = await banco.como<{ nova_versao_cla: string }>(diego, `select nova_versao_cla($1)`, [kasai]);
		const [{ nova_versao_cla: deNovo }] = await banco.como<{ nova_versao_cla: string }>(diego, `select nova_versao_cla($1)`, [kasai]);
		expect(deNovo).toBe(v2);
		const r = await um(banco.como<{ versao: number; status: string; anterior_id: string }>(diego, `select versao, status, anterior_id from clas where id = $1`, [v2]));
		expect(r).toEqual({ versao: 2, status: 'rascunho', anterior_id: kasai });
	});

	it('o clã do próprio Mestre entra aprovado', async () => {
		const [m] = await criar(kaito, 'Hōzuki da Névoa', false);
		const [{ enviar_cla: s }] = await banco.como<{ enviar_cla: string }>(kaito, `select enviar_cla($1)`, [m.id]);
		expect(s).toBe('aprovado');
	});
});
