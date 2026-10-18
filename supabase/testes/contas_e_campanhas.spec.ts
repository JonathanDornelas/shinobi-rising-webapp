import { beforeAll, describe, expect, it } from 'vitest';
import { criarBanco, type Usuario } from './banco';

let banco: Awaited<ReturnType<typeof criarBanco>>;
let kaito: Usuario, bruno: Usuario, carla: Usuario, diego: Usuario;
let campanha: string;

beforeAll(async () => {
	banco = await criarBanco();
	kaito = await banco.criarUsuario('kaito@exemplo.com', 'Kaito');
	bruno = await banco.criarUsuario('bruno@exemplo.com', 'Bruno');
	carla = await banco.criarUsuario('carla@exemplo.com', 'Carla');
	diego = await banco.criarUsuario('diego@exemplo.com', '');
}, 30000);

describe('perfis', () => {
	it('são criados com o nome do cadastro ou o início do e-mail', async () => {
		const r = await banco.como<{ nome: string }>(kaito, `select nome from perfis order by nome`);
		expect(r.map((p) => p.nome).sort((a, b) => a.localeCompare(b))).toEqual(['Bruno', 'Carla', 'diego', 'Kaito']);
	});

	it('contas criadas antes da migração ganham perfil e podem criar campanha', async () => {
		const antigo = await criarBanco([{ email: 'aiko@exemplo.com', nome: 'Aiko' }]);
		const [{ id }] = (await antigo.db.query<{ id: string }>(`select id from auth.users`)).rows;
		const aiko = { id, email: 'aiko@exemplo.com' };
		expect(await antigo.como(aiko, `select nome from perfis`)).toEqual([{ nome: 'Aiko' }]);
		await antigo.como(aiko, `insert into campanhas (nome, mestre_id) values ('Primeira', $1)`, [id]);
		expect(await antigo.como(aiko, `select nome from campanhas`)).toEqual([{ nome: 'Primeira' }]);
	});

	it('só o dono edita', async () => {
		await banco.como(bruno, `update perfis set nome = 'Hackeado' where id = $1`, [kaito.id]);
		const [k] = await banco.como<{ nome: string }>(kaito, `select nome from perfis where id = $1`, [kaito.id]);
		expect(k.nome).toBe('Kaito');
	});
});

describe('campanhas', () => {
	it('quem cria vira Mestre e membro', async () => {
		const [c] = await banco.como<{ id: string }>(
			kaito,
			`insert into campanhas (nome, mestre_id) values ('Sombras sobre a Névoa', $1) returning id`,
			[kaito.id]
		);
		campanha = c.id;
		const membros = await banco.como<{ papel: string }>(kaito, `select papel from membros where campanha_id = $1`, [campanha]);
		expect(membros).toEqual([{ papel: 'mestre' }]);
	});

	it('não deixa criar campanha em nome de outra pessoa', async () => {
		await expect(banco.como(bruno, `insert into campanhas (nome, mestre_id) values ('Golpe', $1)`, [kaito.id])).rejects.toThrow();
	});

	it('quem não é membro não vê a campanha', async () => {
		expect(await banco.como(bruno, `select id from campanhas`)).toEqual([]);
		expect(await banco.como(null, `select id from campanhas`).catch(() => [])).toEqual([]);
	});
});

describe('convites', () => {
	let link: string, codigo: string, porEmail: string;

	it('o Mestre cria link, código e convite por e-mail', async () => {
		const [l] = await banco.como<{ token: string }>(
			kaito,
			`insert into convites (campanha_id, tipo, max_usos, expira_em) values ($1, 'link', 2, now() + interval '7 days') returning token`,
			[campanha]
		);
		const [c] = await banco.como<{ codigo: string }>(kaito, `insert into convites (campanha_id, tipo) values ($1, 'codigo') returning codigo`, [campanha]);
		const [e] = await banco.como<{ token: string }>(
			kaito,
			`insert into convites (campanha_id, tipo, email) values ($1, 'email', ' Carla@Exemplo.com ') returning token`,
			[campanha]
		);
		link = l.token;
		codigo = c.codigo;
		porEmail = e.token;
		expect(codigo).toMatch(/^[A-Z]{3}-[A-Z2-9]{3}$/);
	});

	it('jogador não cria convite', async () => {
		await expect(banco.como(bruno, `insert into convites (campanha_id, tipo) values ($1, 'link')`, [campanha])).rejects.toThrow();
	});

	it('o convidado por e-mail vê o convite e recebe notificação', async () => {
		const convites = await banco.como(carla, `select id from convites`);
		expect(convites).toHaveLength(1);
		const [n] = await banco.como<{ texto: string; href: string }>(carla, `select texto, href from notificacoes`);
		expect(n.texto).toBe('Kaito convidou você para Sombras sobre a Névoa');
		expect(n.href).toBe(`/convite/${porEmail}`);
		expect(await banco.como(bruno, `select id from convites`)).toEqual([]);
	});

	it('o convidado vê o convite em meus_convites; o Mestre reenvia', async () => {
		const [{ meus_convites: lista }] = await banco.como<{ meus_convites: Record<string, any>[] }>(carla, `select meus_convites()`);
		expect(lista).toHaveLength(1);
		expect(lista[0]).toMatchObject({ token: porEmail, campanha: 'Sombras sobre a Névoa', convidado_por: 'Kaito' });
		const [{ meus_convites: nada }] = await banco.como<{ meus_convites: unknown[] }>(bruno, `select meus_convites()`);
		expect(nada).toEqual([]);

		const [cv] = await banco.como<{ id: string }>(kaito, `select id from convites where token = $1`, [porEmail]);
		await expect(banco.como(bruno, `select reenviar_convite($1)`, [cv.id])).rejects.toThrow(/Só o Mestre/);
		await banco.como(kaito, `select reenviar_convite($1)`, [cv.id]);
		const notifs = await banco.como<{ texto: string }>(carla, `select texto from notificacoes order by criada_em`);
		expect(notifs.map((n) => n.texto)).toContain('Kaito lembrou você do convite para Sombras sobre a Névoa');
	});

	it('visitante vê os dados públicos do convite', async () => {
		const [{ ver_convite: v }] = await banco.como<{ ver_convite: Record<string, any> }>(null, `select ver_convite($1)`, [link]);
		expect(v.situacao).toBe('visitante');
		expect(v.campanha.nome).toBe('Sombras sobre a Névoa');
		expect(v.campanha.mestre).toBe('Kaito');
		const [{ ver_convite: x }] = await banco.como<{ ver_convite: Record<string, any> }>(null, `select ver_convite('nada')`);
		expect(x.situacao).toBe('nao_encontrado');
	});

	it('convite por e-mail de outra pessoa não pode ser aceito', async () => {
		const [{ ver_convite: v }] = await banco.como<{ ver_convite: Record<string, any> }>(bruno, `select ver_convite($1)`, [porEmail]);
		expect(v.situacao).toBe('outro_email');
		expect(v.email).toBe('c***@exemplo.com');
		await expect(banco.como(bruno, `select aceitar_convite($1)`, [porEmail])).rejects.toThrow(/outro_email/);
	});

	it('aceitar pelo link torna membro, registra atividade e avisa o Mestre', async () => {
		await banco.como(bruno, `select aceitar_convite($1)`, [link]);
		expect(await banco.como(bruno, `select nome from campanhas`)).toEqual([{ nome: 'Sombras sobre a Névoa' }]);
		const notifs = await banco.como<{ texto: string }>(kaito, `select texto from notificacoes`);
		expect(notifs.map((n) => n.texto)).toContain('Bruno entrou em Sombras sobre a Névoa');
		const atividades = await banco.como<{ texto: string }>(bruno, `select texto from atividades order by id`);
		expect(atividades.map((a) => a.texto)).toEqual(['Campanha criada', 'Bruno entrou na campanha']);
	});

	it('aceitar de novo não duplica (já é membro)', async () => {
		await banco.como(bruno, `select aceitar_convite($1)`, [link]);
		const [{ ver_convite: v }] = await banco.como<{ ver_convite: Record<string, any> }>(bruno, `select ver_convite($1)`, [link]);
		expect(v.situacao).toBe('ja_membro');
	});

	it('o código também funciona, sem diferenciar maiúsculas', async () => {
		await banco.como(diego, `select aceitar_convite($1)`, [codigo.toLowerCase()]);
		expect(await banco.como(diego, `select nome from campanhas`)).toHaveLength(1);
	});

	it('o limite de usos esgota o link', async () => {
		await banco.como(carla, `select aceitar_convite($1)`, [porEmail]);
		const [l] = await banco.como<{ usos: number }>(kaito, `select usos from convites where token = $1`, [link]);
		expect(l.usos).toBe(1);
		await banco.como(kaito, `update convites set usos = 2 where token = $1`, [link]);
		const outro = await banco.criarUsuario('eiji@exemplo.com', 'Eiji');
		const [{ ver_convite: v }] = await banco.como<{ ver_convite: Record<string, any> }>(outro, `select ver_convite($1)`, [link]);
		expect(v.situacao).toBe('esgotado');
	});

	it('convite expirado e revogado', async () => {
		const outro = await banco.criarUsuario('fumi@exemplo.com', 'Fumi');
		const [e] = await banco.como<{ token: string }>(
			kaito,
			`insert into convites (campanha_id, tipo, expira_em) values ($1, 'link', now() - interval '1 day') returning token`,
			[campanha]
		);
		const [{ ver_convite: v1 }] = await banco.como<{ ver_convite: Record<string, any> }>(outro, `select ver_convite($1)`, [e.token]);
		expect(v1.situacao).toBe('expirado');
		await banco.como(kaito, `update convites set status = 'revogado' where token = $1`, [e.token]);
		const [{ ver_convite: v2 }] = await banco.como<{ ver_convite: Record<string, any> }>(outro, `select ver_convite($1)`, [e.token]);
		expect(v2.situacao).toBe('revogado');
	});
});

describe('membros e Mestre', () => {
	it('jogador não edita a campanha', async () => {
		await banco.como(bruno, `update campanhas set nome = 'Tomada' where id = $1`, [campanha]);
		const [c] = await banco.como<{ nome: string }>(kaito, `select nome from campanhas where id = $1`, [campanha]);
		expect(c.nome).toBe('Sombras sobre a Névoa');
	});

	it('jogador sai; Mestre remove jogador; ninguém remove o Mestre', async () => {
		await banco.como(diego, `delete from membros where campanha_id = $1 and usuario_id = $2`, [campanha, diego.id]);
		await banco.como(kaito, `delete from membros where campanha_id = $1 and usuario_id = $2`, [campanha, carla.id]);
		await banco.como(bruno, `delete from membros where campanha_id = $1 and usuario_id = $2`, [campanha, kaito.id]);
		const m = await banco.como<{ usuario_id: string }>(kaito, `select usuario_id from membros where campanha_id = $1`, [campanha]);
		expect(m.map((x) => x.usuario_id).sort()).toEqual([kaito.id, bruno.id].sort());
		const atividades = await banco.como<{ texto: string }>(kaito, `select texto from atividades where tipo = 'membro_saiu' order by id`);
		expect(atividades.map((a) => a.texto)).toEqual(['diego saiu da campanha', 'O Mestre tirou Carla da campanha']);
	});

	it('arquivar e desarquivar registram atividade', async () => {
		await banco.como(kaito, `update campanhas set arquivada_em = now() where id = $1`, [campanha]);
		await banco.como(kaito, `update campanhas set arquivada_em = null where id = $1`, [campanha]);
		const atividades = await banco.como<{ texto: string }>(kaito, `select texto from atividades where tipo like 'campanha_%arquivada' order by id`);
		expect(atividades.map((a) => a.texto)).toEqual(['Campanha arquivada', 'Campanha desarquivada']);
	});

	it('transferir o papel de Mestre', async () => {
		await expect(banco.como(bruno, `select transferir_mestre($1, $2)`, [campanha, bruno.id])).rejects.toThrow(/Só o Mestre/);
		await banco.como(kaito, `select transferir_mestre($1, $2)`, [campanha, bruno.id]);
		const m = await banco.como<{ usuario_id: string; papel: string }>(bruno, `select usuario_id, papel from membros where campanha_id = $1`, [campanha]);
		expect(m.find((x) => x.usuario_id === bruno.id)?.papel).toBe('mestre');
		expect(m.find((x) => x.usuario_id === kaito.id)?.papel).toBe('jogador');
	});

	it('Mestre de campanha ativa não exclui a conta; arquivada libera', async () => {
		await expect(banco.como(bruno, `select excluir_conta()`)).rejects.toThrow(/Transfira ou arquive/);
		await banco.como(bruno, `update campanhas set arquivada_em = now() where id = $1`, [campanha]);
		await expect(banco.como(bruno, `update campanhas set nome = 'Outro' where id = $1`, [campanha])).rejects.toThrow(/somente leitura/);
		await banco.como(bruno, `select excluir_conta()`);
		const [c] = await banco.como<{ mestre_id: string | null }>(kaito, `select mestre_id from campanhas where id = $1`, [campanha]);
		expect(c.mestre_id).toBeNull();
	});
});
