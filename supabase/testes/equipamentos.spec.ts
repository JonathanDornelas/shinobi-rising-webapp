import { beforeAll, describe, expect, it } from 'vitest';
import { criarBanco, type Usuario } from './banco';

let banco: Awaited<ReturnType<typeof criarBanco>>;
let kaito: Usuario, bruno: Usuario, aiko: Usuario;
let campanha: string, ren: string, hana: string;

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
	ren = (await um(banco.como<{ id: string }>(bruno, `insert into personagens (campanha_id, jogador_id, nome, resumo) values ($1, $2, 'Ren Uchiha', '{"ryo": 32000}') returning id`, [campanha, bruno.id]))).id;
	hana = (await um(banco.como<{ id: string }>(aiko, `insert into personagens (campanha_id, jogador_id, nome) values ($1, $2, 'Hana Nara') returning id`, [campanha, aiko.id]))).id;
	await banco.como(bruno, `select enviar_ficha($1)`, [ren]);
	await banco.como(kaito, `select decidir_ficha($1, 'aprovada')`, [ren]);
}, 30000);

const criar = (u: Usuario, tipo: string, nome: string, custo: number, personagem: string | null = null) =>
	banco.como<{ id: string }>(u, `insert into equipamentos_criados (campanha_id, autor_id, tipo, nome, custo, personagem_id) values ($1, $2, $3, $4, $5, $6) returning id`, [
		campanha,
		u.id,
		tipo,
		nome,
		custo,
		personagem
	]);

describe('forja e encomenda', () => {
	it('encomenda só para a própria ficha', async () => {
		await expect(criar(bruno, 'arma', 'Roubada', 1000, hana)).rejects.toThrow(/Ficha indisponível/);
	});

	it('aprovação cobra o ryo e deixa a entrega pendente; sem ryo, bloqueia', async () => {
		const [cara] = await criar(bruno, 'arma', 'Presa do Trovão', 40000, ren);
		await banco.como(bruno, `select enviar_equipamento($1)`, [cara.id]);
		const [n] = await banco.como<{ texto: string }>(kaito, `select texto from notificacoes where tipo = 'equipamento_enviado'`);
		expect(n.texto).toBe('Bruno enviou a arma Presa do Trovão para revisão');
		await expect(banco.como(kaito, `select decidir_equipamento($1, 'aprovado')`, [cara.id])).rejects.toThrow(/Ren Uchiha tem 32000 ryo; a encomenda custa 40000/);
		await banco.como(kaito, `select decidir_equipamento($1, 'ajustes', 'Fica cara demais.')`, [cara.id]);
		await banco.como(bruno, `update equipamentos_criados set custo = 30000 where id = $1`, [cara.id]);
		await banco.como(bruno, `select enviar_equipamento($1)`, [cara.id]);
		await banco.como(kaito, `select decidir_equipamento($1, 'aprovado')`, [cara.id]);
		expect(await um(banco.como(bruno, `select ryo from personagens where id = $1`, [ren]))).toEqual({ ryo: 2000 });
		expect(await um(banco.como(bruno, `select status, entregue from equipamentos_criados where id = $1`, [cara.id]))).toEqual({ status: 'aprovado', entregue: false });
	});

	it('a ficha recebe no inventário e marca entregue', async () => {
		const [e] = await banco.como<{ id: string }>(bruno, `select id from equipamentos_criados where nome = 'Presa do Trovão'`);
		await banco.como(bruno, `select receber_equipamentos($1, '[{"id":"eq-1","nome":"Presa do Trovão","qtd":1}]', array[$2]::uuid[])`, [ren, e.id]);
		expect(await um(banco.como(bruno, `select entregue from equipamentos_criados where id = $1`, [e.id]))).toEqual({ entregue: true });
		await expect(banco.como(aiko, `select receber_equipamentos($1, '[]', array[]::uuid[])`, [ren])).rejects.toThrow(/não encontrada/);
	});
});

describe('itens e aprovação da campanha', () => {
	it('campanha sem aprovação de itens aprova no envio; o grupo vê', async () => {
		await banco.como(kaito, `update campanhas set aprovacao = aprovacao || '{"itens": false}' where id = $1`, [campanha]);
		const [i] = await criar(aiko, 'item', 'Pó de Brasa', 300);
		const [{ enviar_equipamento: s }] = await banco.como<{ enviar_equipamento: string }>(aiko, `select enviar_equipamento($1)`, [i.id]);
		expect(s).toBe('aprovado');
		expect(await banco.como(bruno, `select nome from equipamentos_criados where tipo = 'item'`)).toEqual([{ nome: 'Pó de Brasa' }]);
	});

	it('não muda status direto; arma entregue não ganha versão nova', async () => {
		const [e] = await banco.como<{ id: string }>(bruno, `select id from equipamentos_criados where nome = 'Presa do Trovão'`);
		await expect(banco.como(bruno, `update equipamentos_criados set status = 'rascunho' where id = $1`, [e.id])).rejects.toThrow(/permission denied/);
		await expect(banco.como(bruno, `select nova_versao_equipamento($1)`, [e.id])).rejects.toThrow(/não mudam/);
	});
});
