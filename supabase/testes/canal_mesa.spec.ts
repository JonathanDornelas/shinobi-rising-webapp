import { beforeAll, describe, expect, it } from 'vitest';
import { criarBanco, type Usuario } from './banco';

let banco: Awaited<ReturnType<typeof criarBanco>>;
let kaito: Usuario, bruno: Usuario, estranho: Usuario;
let campanha: string, outra: string;

const um = async <T>(p: Promise<T[]>) => (await p)[0];
/** O que o Realtime faz ao entrar no canal: põe o tópico na sessão e pergunta às políticas. */
const entra = async (u: Usuario | null, topico: string) =>
	(await um(banco.como<{ pode: boolean }>(u, `select set_config('realtime.topic', $1, true) is not null and coalesce((select true from realtime.messages limit 0), public.membro_do_canal_mesa()) as pode`, [topico]))).pode;
const envia = (u: Usuario | null, topico: string, extensao: string) =>
	banco.como(u, `with t as (select set_config('realtime.topic', $1, true)) insert into realtime.messages (topic, extension) select $1, $2 from t returning id`, [topico, extensao]);

beforeAll(async () => {
	banco = await criarBanco();
	kaito = await banco.criarUsuario('kaito@exemplo.com', 'Kaito');
	bruno = await banco.criarUsuario('bruno@exemplo.com', 'Bruno');
	estranho = await banco.criarUsuario('estranho@exemplo.com', 'Estranho');
	campanha = (await um(banco.como<{ id: string }>(kaito, `insert into campanhas (nome, mestre_id) values ('Névoa', $1) returning id`, [kaito.id]))).id;
	outra = (await um(banco.como<{ id: string }>(estranho, `insert into campanhas (nome, mestre_id) values ('Areia', $1) returning id`, [estranho.id]))).id;
	const l = await um(banco.como<{ token: string }>(kaito, `insert into convites (campanha_id, tipo) values ($1, 'link') returning token`, [campanha]));
	await banco.como(bruno, `select aceitar_convite($1)`, [l.token]);
});

describe('canal privado da Mesa', () => {
	it('o Mestre e quem é da campanha entram; quem é de fora não', async () => {
		expect(await entra(kaito, `mesa:${campanha}`)).toBe(true);
		expect(await entra(bruno, `mesa:${campanha}`)).toBe(true);
		expect(await entra(estranho, `mesa:${campanha}`)).toBe(false);
		expect(await entra(bruno, `mesa:${outra}`)).toBe(false);
	});

	it('só vale para o tópico da Mesa, escrito certo', async () => {
		expect(await entra(kaito, `diario:${campanha}`)).toBe(false);
		expect(await entra(kaito, 'mesa:nao-e-uuid')).toBe(false);
		expect(await entra(kaito, `mesa:${campanha}x`)).toBe(false);
	});

	it('enviar segue a mesma regra, em broadcast e presença', async () => {
		await expect(envia(bruno, `mesa:${campanha}`, 'broadcast')).resolves.toHaveLength(1);
		await expect(envia(bruno, `mesa:${campanha}`, 'presence')).resolves.toHaveLength(1);
		await expect(envia(estranho, `mesa:${campanha}`, 'broadcast')).rejects.toThrow(/row-level security/);
		await expect(envia(estranho, `mesa:${campanha}`, 'presence')).rejects.toThrow(/row-level security/);
		await expect(envia(bruno, `mesa:${campanha}`, 'postgres_changes')).rejects.toThrow(/row-level security/);
	});

	it('visitante sem conta não chega nem a perguntar', async () => {
		await expect(entra(null, `mesa:${campanha}`)).rejects.toThrow(/permission denied/);
		await expect(envia(null, `mesa:${campanha}`, 'broadcast')).rejects.toThrow(/permission denied/);
	});
});
