// A replicação da Mesa, de ponta a ponta: um Mestre e dois jogadores, cada um com a sua Mesa de verdade, ligados por um banco e um canal de mentira que se comportam como os
// reais onde importa: o banco está a 187 ms, o aviso dele demora, passa pelo RLS e deixa de fora as colunas grandes que não mudaram; o broadcast chega em 16 ms e não passa
// por RLS nenhum. O que está aqui é o que toda tela tem de ver igual, e o que nunca pode sair pelo canal.
// @ts-expect-error o svelte-check não carrega os tipos do Node, e este teste só roda nele
import { AsyncLocalStorage } from 'node:async_hooks';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { MesaCena } from '#lib/supabase/banco.ts';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Linha = Record<string, any>;
type Filtro = (l: Linha) => boolean;
type Resposta = { data: unknown; error: { message: string } | null };

const h = vi.hoisted(() => ({ rede: null as unknown as { cliente(): unknown } }));
vi.mock('#lib/supabase/cliente.ts', () => ({ supabase: () => h.rede.cliente() }));
vi.mock('#lib/estado/sessao.svelte.ts', () => ({ sessao: { salvarPreferencias: async () => ({ error: null }) } }));
vi.mock('#lib/estado/toasts.svelte.ts', () => ({ toasts: { mostrar: () => undefined } }));

import { Mesa } from './mesa.svelte.ts';

const [ESCRITA, AVISO, CANAL] = [187, 320, 16];
const [MESTRE, ANA, BRUNO] = ['mestre', 'ana', 'bruno'];
const CAMPANHA = 'campanha';
const [ATIVA, PREPARO] = ['cena-ativa', 'cena-preparo'];
const espera = (ms: number) => new Promise((ok) => setTimeout(ok, ms));
const copia = <T>(v: T): T => JSON.parse(JSON.stringify(v));

class Consulta implements PromiseLike<Resposta> {
	private filtros: Filtro[] = [];
	private acao: { tipo: 'ler' | 'apagar' } | { tipo: 'atualizar'; patch: Linha } | { tipo: 'inserir'; linha: Linha } = { tipo: 'ler' };
	private um = false;

	constructor(
		private rede: Rede,
		private tabela: string,
		private quem: string
	) {}
	select() {
		return this;
	}
	order() {
		return this;
	}
	eq(c: string, v: unknown) {
		this.filtros.push((l) => l[c] === v);
		return this;
	}
	in(c: string, v: unknown[]) {
		this.filtros.push((l) => v.includes(l[c]));
		return this;
	}
	not(c: string) {
		this.filtros.push((l) => l[c] != null);
		return this;
	}
	update(patch: Linha) {
		this.acao = { tipo: 'atualizar', patch: copia(patch) };
		return this;
	}
	insert(linha: Linha) {
		this.acao = { tipo: 'inserir', linha: copia(linha) };
		return this;
	}
	upsert(linha: Linha) {
		return this.insert(linha);
	}
	delete() {
		this.acao = { tipo: 'apagar' };
		return this;
	}
	single() {
		this.um = true;
		return this;
	}
	maybeSingle() {
		return this.single();
	}
	then<A = Resposta, B = never>(ok?: ((v: Resposta) => A | PromiseLike<A>) | null, nao?: ((e: unknown) => B | PromiseLike<B>) | null) {
		return this.rodar().then(ok, nao);
	}
	private async rodar(): Promise<Resposta> {
		await espera(ESCRITA / 2);
		const r = this.rede.aplicar(this.quem, this.tabela, this.acao, this.filtros, this.um);
		await espera(ESCRITA / 2);
		return r;
	}
}

class CanalFalso {
	bindings: { tipo: string; config: Linha; fazer: (p: Linha) => void }[] = [];
	eu: string;
	aberto = true;
	constructor(
		private rede: Rede,
		readonly topico: string,
		config: Linha
	) {
		this.eu = config?.config?.presence?.key ?? '';
		rede.canais.add(this);
	}
	on(tipo: string, config: Linha, fazer: (p: Linha) => void) {
		this.bindings.push({ tipo, config, fazer });
		return this;
	}
	subscribe(aoMudar: (estado: string) => void) {
		setTimeout(() => this.rede.quem.run(this.eu, () => aoMudar('SUBSCRIBED')), CANAL);
		return this;
	}
	track() {}
	presenceState() {
		return Object.fromEntries([...this.rede.canais].map((c) => [c.eu, []]));
	}
	send(m: { event: string; payload: unknown }) {
		const texto = JSON.stringify(m.payload);
		this.rede.trafego.push({ evento: m.event, texto });
		if (this.rede.semCanal) return Promise.resolve('ok');
		for (const c of this.rede.canais) if (c !== this && c.topico === this.topico) setTimeout(() => c.entregar('broadcast', m.event, JSON.parse(texto)), CANAL);
		return Promise.resolve('ok');
	}
	entregar(tipo: string, evento: string, payload: unknown) {
		if (!this.aberto) return;
		for (const b of this.bindings) if (b.tipo === tipo && b.config.event === evento) this.rede.quem.run(this.eu, () => b.fazer({ payload }));
	}
	aviso(tabela: string, p: Linha) {
		if (!this.aberto) return;
		const b = this.bindings.find((x) => x.tipo === 'postgres_changes' && x.config.table === tabela);
		if (b) this.rede.quem.run(this.eu, () => b.fazer(p));
	}
}

/** O banco e o canal. Só faz o que a Mesa pede, com a mesma regra do RLS para o que cada um vê. */
class Rede {
	tabelas: Record<string, Map<string, Linha>> = { mesa_cenas: new Map(), mesa_tokens: new Map(), mesa_tracos: new Map(), mesa_efeitos: new Map(), mesa_objetos: new Map(), mesa_jukebox: new Map(), campanhas: new Map() };
	canais = new Set<CanalFalso>();
	quem: { run<T>(u: string, f: () => T): T; getStore(): string | undefined } = new AsyncLocalStorage();
	trafego: { evento: string; texto: string }[] = [];
	semCanal = false;
	semAvisos = false;
	private ids = 0;

	ve(u: string, tabela: string, l: Linha) {
		if (u === MESTRE) return true;
		if (tabela === 'mesa_cenas') return !!l.ativa;
		if (tabela === 'mesa_tokens') return l.dono_id === u || (l.visivel && this.tabelas.mesa_cenas.get(l.cena_id)?.ativa);
		if (tabela === 'mesa_objetos') return l.visivel || l.autor_id === u;
		return true;
	}

	cliente() {
		const quem = this.quem.getStore() ?? MESTRE;
		return {
			from: (t: string) => new Consulta(this, t, quem),
			rpc: async (nome: string, a: Linha) => {
				await espera(ESCRITA / 2);
				const r = nome === 'mesa_porta' ? this.porta(a) : { data: [], error: null };
				await espera(ESCRITA / 2);
				return r;
			},
			realtime: { setAuth: async () => undefined },
			channel: (topico: string, config: Linha) => new CanalFalso(this, topico, config),
			removeChannel: async (c: CanalFalso) => {
				c.aberto = false;
				this.canais.delete(c);
			}
		};
	}

	private porta(a: Linha) {
		const c = this.tabelas.mesa_cenas.get(a.cena)!;
		const p = c.paredes[a.indice];
		if (p[4] === 3) return { data: null, error: { message: 'Porta trancada.' } };
		const paredes = c.paredes.map((q: number[], i: number) => (i === a.indice ? [q[0], q[1], q[2], q[3], q[4] === 2 ? 1 : 2] : q));
		this.gravar('mesa_cenas', c, { paredes });
		return { data: null, error: null };
	}

	private gravar(tabela: string, velha: Linha, patch: Linha) {
		const nova = { ...velha, ...patch };
		this.tabelas[tabela].set(velha.id, nova);
		this.avisar(tabela, 'UPDATE', nova, patch);
	}

	aplicar(quem: string, tabela: string, acao: Linha, filtros: Filtro[], um: boolean) {
		const t = this.tabelas[tabela];
		const achadas = [...t.values()].filter((l) => filtros.every((f) => f(l)) && this.ve(quem, tabela, l));
		if (acao.tipo === 'ler') return { data: copia(um ? (achadas[0] ?? null) : achadas), error: null };
		if (acao.tipo === 'inserir') {
			const linha = { id: `${tabela}-${++this.ids}`, criado_em: new Date().toISOString(), autor_id: quem, ...acao.linha };
			t.set(linha.id, linha);
			this.avisar(tabela, 'INSERT', linha, linha);
			return { data: copia(linha), error: null };
		}
		if (acao.tipo === 'atualizar') {
			for (const l of achadas) {
				if (tabela === 'mesa_cenas' && quem !== MESTRE) return { data: null, error: { message: 'row-level security' } };
				if (tabela === 'mesa_tokens' && quem !== MESTRE && this.tabelas.mesa_cenas.get(l.cena_id)?.travada) return { data: null, error: { message: 'Mesa travada pelo Mestre' } };
				this.gravar(tabela, l, acao.patch);
			}
			return { data: null, error: null };
		}
		for (const l of achadas) {
			t.delete(l.id);
			this.avisar(tabela, 'DELETE', l, {});
		}
		return { data: null, error: null };
	}

	private avisar(tabela: string, tipo: string, linha: Linha, patch: Linha) {
		if (this.semAvisos) return;
		for (const c of this.canais) {
			if (tipo !== 'DELETE' && !this.ve(c.eu, tabela, linha)) continue;
			// o TOAST: a coluna grande que não mudou não vem no aviso
			const novo = copia(linha);
			if (tabela === 'mesa_cenas' && tipo === 'UPDATE') for (const grande of ['paredes', 'reveladas']) if (!(grande in patch)) delete novo[grande];
			setTimeout(() => c.aviso(tabela, { table: tabela, eventType: tipo, new: tipo === 'DELETE' ? {} : novo, old: { id: linha.id } }), AVISO);
		}
	}

	segredos() {
		return this.trafego.map((m) => `${m.evento}:${m.texto}`).join('\n');
	}
}

const CENA = {
	campanha_id: CAMPANHA,
	largura: 20,
	altura: 20,
	travada: false,
	mostrar_pv: false,
	iniciativa: {},
	terreno: [],
	luz_dinamica: true,
	luz_ambiente: 'claro',
	luz_memoria: true,
	nevoa: false,
	reveladas: [[0, 0, 3]],
	camadas: [],
	luzes: [],
	mapa_vivo: { mapa: 'a', pacote: 'b', telhados: true, corte: false },
	paredes: [
		[0, 0, 5, 0, 0],
		[5, 0, 6, 0, 1],
		[6, 0, 8, 0, 3]
	],
	nome_publico: 'Estrada'
};

const token = (id: string, dono: string | null, x: number, resto: Linha = {}) => ({ id, cena_id: ATIVA, campanha_id: CAMPANHA, dono_id: dono, nome: id, sigla: id.slice(0, 2), nome_oculto: false, x, y: 1, tamanho: 1, tamanho_base: null, crescido_turnos: null, visivel: true, aliado: false, condicoes: [], ferimento: 0, pv: null, pv_max: null, movido: 0, rumo: 0, elevacao: 0, personagem_id: null, npc_id: null, ligado_a: null, membro: null, retrato: null, criado_em: '2026-11-06', atualizado_em: '2026-11-06', ...resto });

let rede: Rede;
let mesas: { m: Mesa; a: Mesa; b: Mesa };

const passar = (ms: number) => vi.advanceTimersByTimeAsync(ms);
const como = <T>(mesa: Mesa, fazer: () => T) => rede.quem.run(mesa.eu, fazer);
/** Faz e espera: o relógio é de mentira, então alguém precisa andar com ele. */
async function feito<T>(mesa: Mesa, acao: () => Promise<T>) {
	let pronto = false;
	const p = como(mesa, acao).finally(() => (pronto = true));
	while (!pronto) await passar(5);
	return p;
}
/** O que uma tela mostra de um campo, cada vez que ele muda, por `ms`. */
async function acompanhar<T>(ms: number, ler: () => T) {
	const vistos: T[] = [ler()];
	for (let t = 0; t < ms; t += 8) {
		await passar(8);
		const v = ler();
		if (JSON.stringify(v) !== JSON.stringify(vistos.at(-1))) vistos.push(v);
	}
	return vistos;
}
const posicao = (mesa: Mesa, id: string) => mesa.tokens.find((t) => t.id === id)?.x;
const cena = (mesa: Mesa) => mesa.cena as MesaCena;

function abrir(eu: string) {
	const lidas = <T extends Linha>(tabela: string) => [...rede.tabelas[tabela].values()].filter((l) => rede.ve(eu, tabela, l)).map((l) => copia(l)) as T[];
	const cenas = lidas<MesaCena>('mesa_cenas');
	const mesa = new Mesa({
		campanha: CAMPANHA,
		eu,
		mestre: eu === MESTRE,
		arquivada: false,
		cenas,
		cena: cenas.find((c) => c.id === ATIVA) ?? null,
		tokens: lidas('mesa_tokens'),
		tracos: [],
		efeitos: [],
		objetos: lidas('mesa_objetos'),
		membros: [
			{ id: MESTRE, papel: 'mestre', nome: 'Mestre', avatar: null, cor: null, moldura: null },
			{ id: ANA, papel: 'jogador', nome: 'Ana', avatar: null, cor: null, moldura: null },
			{ id: BRUNO, papel: 'jogador', nome: 'Bruno', avatar: null, cor: null, moldura: null }
		],
		molduraMesa: { id: null, universal: false }
	});
	rede.quem.run(eu, () => mesa.conectar());
	return mesa;
}

beforeEach(async () => {
	vi.useFakeTimers();
	rede = new Rede();
	h.rede = rede;
	rede.tabelas.mesa_cenas.set(ATIVA, { ...copia(CENA), id: ATIVA, nome: 'Emboscada do Zabuza', ativa: true });
	rede.tabelas.mesa_cenas.set(PREPARO, { ...copia(CENA), id: PREPARO, nome: 'Segredo', ativa: false, paredes: [] });
	for (const t of [token('de-ana', ANA, 1), token('de-bruno', BRUNO, 2), token('npc', null, 3), token('escondido', null, 9, { visivel: false, nome: 'Hunter' })]) rede.tabelas.mesa_tokens.set(t.id, t);
	mesas = { m: abrir(MESTRE), a: abrir(ANA), b: abrir(BRUNO) };
	await passar(2000);
	rede.trafego = [];
});

afterEach(() => {
	for (const mesa of Object.values(mesas)) mesa.desconectar();
	vi.useRealTimers();
});

describe('um token que anda', () => {
	it('chega às outras telas antes de o banco terminar de gravar, e todos acabam iguais ao banco', async () => {
		void como(mesas.a, () => mesas.a.mover('de-ana', 7, 1, 6));
		expect(posicao(mesas.a, 'de-ana')).toBe(7);
		await passar(CANAL + 4);
		expect(posicao(mesas.m, 'de-ana')).toBe(7);
		expect(posicao(mesas.b, 'de-ana')).toBe(7);
		expect(rede.tabelas.mesa_tokens.get('de-ana')!.x).toBe(1);
		await passar(2000);
		expect(rede.tabelas.mesa_tokens.get('de-ana')!.x).toBe(7);
		for (const mesa of Object.values(mesas)) expect(posicao(mesa, 'de-ana')).toBe(7);
	});

	it('dois passos seguidos: quem olha nunca vê o token voltar', async () => {
		void como(mesas.a, () => mesas.a.mover('de-ana', 5, 1, 4));
		await passar(60);
		void como(mesas.a, () => mesas.a.mover('de-ana', 8, 1, 3));
		const visto = await acompanhar(1500, () => posicao(mesas.b, 'de-ana'));
		expect(visto.at(-1)).toBe(8);
		expect(visto).toEqual([...visto].sort((x, y) => x! - y!));
		const proprio = await acompanhar(1500, () => posicao(mesas.a, 'de-ana'));
		expect(proprio).toEqual([8]);
	});

	it('o aviso de outra mudança do mesmo token, atrasado, não o traz de volta', async () => {
		void como(mesas.m, () => mesas.m.atualizarToken('de-ana', { condicoes: ['caido'] }));
		await passar(ESCRITA + 20);
		void como(mesas.a, () => mesas.a.mover('de-ana', 9, 1, 8));
		const visto = await acompanhar(1500, () => posicao(mesas.b, 'de-ana'));
		expect(visto).toEqual([1, 9]);
		expect(mesas.b.tokens.find((t) => t.id === 'de-ana')!.condicoes).toEqual(['caido']);
	});

	it('o banco recusa (a mesa travou): volta em todas as telas', async () => {
		rede.tabelas.mesa_cenas.get(ATIVA)!.travada = true;
		await feito(mesas.a, () => mesas.a.mover('de-ana', 7, 1, 6));
		await passar(CANAL * 2);
		for (const mesa of Object.values(mesas)) expect(posicao(mesa, 'de-ana')).toBe(1);
		expect(rede.tabelas.mesa_tokens.get('de-ana')!.x).toBe(1);
	});

	it('sem o canal, o aviso do banco leva o passo a todos', async () => {
		rede.semCanal = true;
		void como(mesas.a, () => mesas.a.mover('de-ana', 7, 1, 6));
		await passar(CANAL * 2);
		expect(posicao(mesas.b, 'de-ana')).toBe(1);
		await passar(ESCRITA + AVISO);
		expect(posicao(mesas.b, 'de-ana')).toBe(7);
	});

	it('sem os avisos do banco, a conferência acerta quem perdeu o canal', async () => {
		[rede.semCanal, rede.semAvisos] = [true, true];
		await feito(mesas.a, () => mesas.a.mover('de-ana', 7, 1, 6));
		await passar(4100);
		await feito(mesas.b, () => mesas.b.conferir());
		expect(posicao(mesas.b, 'de-ana')).toBe(7);
	});

	it('uma releitura que começou antes da gravação não volta o token', async () => {
		const leitura = como(mesas.a, () => mesas.a.ressincronizar());
		await passar(ESCRITA / 4);
		void como(mesas.a, () => mesas.a.mover('de-ana', 7, 1, 6));
		const visto = await acompanhar(1000, () => posicao(mesas.a, 'de-ana'));
		await leitura;
		expect(visto).toEqual([7]);
	});

	it('a luz que o token carrega e a altura chegam pelo mesmo caminho', async () => {
		void como(mesas.a, () => mesas.a.atualizarToken('de-ana', { luz: { plena: 6, penumbra: 6 }, elevacao: 2.4 }));
		await passar(CANAL + 4);
		expect(mesas.b.tokens.find((t) => t.id === 'de-ana')).toMatchObject({ luz: { plena: 6, penumbra: 6 }, elevacao: 2.4 });
	});
});

describe('a cena', () => {
	it('ligar e desligar a luz dinâmica não apaga as paredes de ninguém (o caso de ter de recarregar)', async () => {
		for (const ligada of [false, true]) {
			void como(mesas.m, () => mesas.m.patchCena({ luz_dinamica: ligada }));
			await passar(CANAL + 4);
			expect(cena(mesas.a).luz_dinamica).toBe(ligada);
			await passar(2000);
			for (const mesa of Object.values(mesas)) {
				expect(cena(mesa).luz_dinamica).toBe(ligada);
				expect(mesa.temLuzDinamica).toBe(true);
				expect(mesa.paredes).toHaveLength(3);
			}
		}
	});

	it('tirar o telhado não tira a luz dinâmica de ninguém', async () => {
		const mapa = { ...(cena(mesas.m).mapa_vivo as object), telhados: false };
		void como(mesas.m, () => mesas.m.patchCena({ mapa_vivo: mapa }));
		const luz = await acompanhar(2000, () => mesas.a.temLuzDinamica && !!cena(mesas.a).luz_dinamica);
		expect(luz).toEqual([true]);
		expect(cena(mesas.a).mapa_vivo).toMatchObject({ telhados: false });
		expect(mesas.a.paredes).toHaveLength(3);
	});

	it('ligar e desligar rápido: fica o último, em todas as telas, sem voltar', async () => {
		void como(mesas.m, () => mesas.m.patchCena({ luz_ambiente: 'penumbra' }));
		await passar(50);
		void como(mesas.m, () => mesas.m.patchCena({ luz_ambiente: 'escuro' }));
		await passar(50);
		void como(mesas.m, () => mesas.m.patchCena({ luz_ambiente: 'claro' }));
		const visto = await acompanhar(3000, () => cena(mesas.b).luz_ambiente);
		expect(visto.at(-1)).toBe('claro');
		expect(new Set(visto).size).toBe(visto.length);
		expect(rede.tabelas.mesa_cenas.get(ATIVA)!.luz_ambiente).toBe('claro');
	});

	it('o objeto do jsonb volta com as chaves em outra ordem, e o eco velho continua sendo eco', async () => {
		void como(mesas.m, () => mesas.m.patchCena({ iniciativa: { ativa: true, rodada: 1, vez: 0 } }));
		await passar(40);
		void como(mesas.m, () => mesas.m.patchCena({ iniciativa: { ativa: true, rodada: 1, vez: 1 } }));
		const visto = await acompanhar(2000, () => mesas.m.iniciativa.vez);
		expect(visto).toEqual([1]);
	});

	it('o nome do Mestre não sai pelo canal e o grupo segue com o nome público', async () => {
		await feito(mesas.m, () => mesas.m.patchCena({ nome: 'Outro segredo', luz_memoria: false }));
		await passar(2000);
		expect(rede.segredos()).not.toContain('Outro segredo');
		expect(cena(mesas.a).nome).toBe('Estrada');
	});

	it('nada de uma cena em preparo sai pelo canal: nem a cena, nem quem está nela, nem o ping do Mestre', async () => {
		mesas.m.cenaId = PREPARO;
		mesas.m.tokens = [];
		await feito(mesas.m, async () => {
			await mesas.m.patchCena({ luzes: [{ id: 'emboscada', x: 1, y: 1, plena: 1, penumbra: 1, acesa: true }] });
			const t = await mesas.m.colocar({ nome: 'Ninja da emboscada', x: 4, y: 4, visivel: true });
			await mesas.m.mover(t!.id, 6, 4, 2);
			await mesas.m.remover(t!.id);
			await mesas.m.deixarEfeito('Selo da emboscada', [[1, 1]], null, [1, 1]);
			await mesas.m.desenhar([[0, 0], [1, 1]], 2);
		});
		mesas.m.ping(3, 3);
		mesas.m.olharTodos(3, 3);
		mesas.m.enviar('regua', { pontos: [] }, true);
		await passar(2000);
		expect(rede.trafego).toEqual([]);
		expect(mesas.a.pings).toEqual([]);
		mesas.m.cenaId = ATIVA;
	});

	it('o que vale para a campanha inteira segue saindo, mesmo com o Mestre numa cena em preparo', async () => {
		mesas.m.cenaId = PREPARO;
		await feito(mesas.m, () => mesas.m.definirMolduraMesa(null, true));
		expect(rede.trafego.map((t) => t.evento)).toEqual(['moldura-mesa']);
		mesas.m.cenaId = ATIVA;
	});

	it('um jogador não muda a cena de ninguém pelo canal', async () => {
		for (const c of rede.canais) if (c.eu === BRUNO) void c.send({ event: 'cena', payload: { usuario: ANA, id: ATIVA, patch: { luz_dinamica: false } } });
		await passar(CANAL * 2);
		expect(cena(mesas.a).luz_dinamica).toBe(true);
		expect(cena(mesas.m).luz_dinamica).toBe(true);
	});

	it('a gravação falha: a mudança volta nas telas que já tinham recebido', async () => {
		rede.aplicar = ((orig) =>
			function (this: Rede, quem: string, tabela: string, acao: Linha, filtros: Filtro[], um: boolean) {
				return tabela === 'mesa_cenas' && acao.tipo === 'atualizar' ? { data: null, error: { message: 'falhou' } } : orig.call(this, quem, tabela, acao, filtros, um);
			})(rede.aplicar);
		const fim = como(mesas.m, () => mesas.m.patchCena({ luz_ambiente: 'escuro' }));
		await passar(CANAL + 4);
		expect(cena(mesas.a).luz_ambiente).toBe('escuro');
		await passar(ESCRITA + CANAL * 2);
		await fim;
		expect(cena(mesas.a).luz_ambiente).toBe('claro');
		expect(cena(mesas.m).luz_ambiente).toBe('claro');
	});

	it('o que o Mestre grava sobre o explorado não recalcula as paredes de ninguém', async () => {
		const antes = mesas.a.paredes;
		await feito(mesas.m, () => mesas.m.patchCena({ reveladas: [[1, 0, 4]] }));
		await passar(2000);
		expect(cena(mesas.a).reveladas).toEqual([[1, 0, 4]]);
		expect(mesas.a.paredes).toBe(antes);
	});
});

describe('a porta', () => {
	it('aberta por um jogador, abre para todos na hora, e a visão muda junto', async () => {
		void como(mesas.a, () => mesas.a.alternarPorta(1));
		await passar(CANAL + 4);
		expect(mesas.b.paredes[1][4]).toBe(2);
		expect(mesas.m.paredes[1][4]).toBe(2);
		await passar(2000);
		for (const mesa of Object.values(mesas)) expect(mesa.paredes.map((p) => p[4])).toEqual([0, 2, 3]);
		expect(rede.tabelas.mesa_cenas.get(ATIVA)!.paredes[1][4]).toBe(2);
	});

	it('trancada: o banco recusa e ela fecha de novo para quem viu abrir', async () => {
		await feito(mesas.a, () => mesas.a.alternarPorta(2));
		await passar(CANAL * 2);
		for (const mesa of Object.values(mesas)) expect(mesa.paredes[2][4]).toBe(3);
	});

	it('duas portas ao mesmo tempo, por duas pessoas: as duas ficam abertas', async () => {
		rede.tabelas.mesa_cenas.get(ATIVA)!.paredes[2][4] = 1;
		await passar(10);
		for (const mesa of Object.values(mesas)) mesa.previa({ paredes: copia(rede.tabelas.mesa_cenas.get(ATIVA)!.paredes) });
		void como(mesas.a, () => mesas.a.alternarPorta(1));
		await passar(40);
		void como(mesas.b, () => mesas.b.alternarPorta(2));
		await passar(3000);
		for (const mesa of Object.values(mesas)) expect(mesa.paredes.map((p) => p[4])).toEqual([0, 2, 2]);
	});
});

describe('o que entra e sai do quadro', () => {
	it('token novo, traço e efeito chegam a todos uma vez só', async () => {
		await feito(mesas.m, async () => {
			await mesas.m.colocar({ nome: 'Ninja', x: 4, y: 4, visivel: true });
			await mesas.m.deixarEfeito('Goukakyu', [[1, 1]], 2, [1, 1]);
		});
		await feito(mesas.a, () => mesas.a.desenhar([[0, 0], [1, 1]], 2));
		await passar(CANAL * 2);
		expect(mesas.b.tokens.filter((t) => t.nome === 'Ninja')).toHaveLength(1);
		expect(mesas.b.efeitos).toHaveLength(1);
		expect(mesas.b.tracos).toHaveLength(1);
		await passar(2000);
		for (const mesa of Object.values(mesas)) {
			expect(mesa.tokens.filter((t) => t.nome === 'Ninja')).toHaveLength(1);
			expect(mesa.efeitos).toHaveLength(1);
			expect(mesa.tracos).toHaveLength(1);
		}
	});

	it('tirar do quadro chega na hora, e o aviso do banco depois não atrapalha', async () => {
		void como(mesas.m, () => mesas.m.remover('npc'));
		await passar(CANAL + 4);
		expect(mesas.a.tokens.some((t) => t.id === 'npc')).toBe(false);
		await passar(2000);
		for (const mesa of Object.values(mesas)) expect(mesa.tokens.some((t) => t.id === 'npc')).toBe(false);
	});

	it('o objeto escondido do grupo não sai pelo canal, e o visível chega', async () => {
		await feito(mesas.m, async () => {
			await mesas.m.colocarObjeto({ tipo: 'texto', texto: 'Armadilha sob a ponte', visivel: false, x: 1, y: 1 } as never);
			await mesas.m.colocarObjeto({ tipo: 'texto', texto: 'Placa', visivel: true, x: 1, y: 1 } as never);
		});
		await passar(2000);
		expect(rede.segredos()).not.toContain('Armadilha');
		expect(mesas.a.objetos.map((o) => (o as unknown as { texto: string }).texto)).toEqual(['Placa']);
	});

	it('mudar um objeto chega na hora a quem vê', async () => {
		const o = (await feito(mesas.m, () => mesas.m.colocarObjeto({ tipo: 'texto', visivel: true, x: 1, y: 1 } as never)))!;
		await passar(1000);
		void como(mesas.m, () => mesas.m.atualizarObjeto(o.id, { x: 6 }));
		await passar(CANAL + 4);
		expect(mesas.a.objetos[0].x).toBe(6);
	});
});

describe('o que o grupo não pode ver', () => {
	it('quem está escondido não aparece no canal nem na tela de quem joga, mesmo andando', async () => {
		await feito(mesas.m, () => mesas.m.mover('escondido', 11, 1, 2));
		await passar(2000);
		expect(rede.segredos()).not.toContain('escondido');
		expect(mesas.a.tokens.some((t) => t.id === 'escondido')).toBe(false);
		expect(posicao(mesas.m, 'escondido')).toBe(11);
	});

	it('o PV não passa pelo canal', async () => {
		await feito(mesas.m, () => mesas.m.atualizarToken('npc', { pv: 123, pv_max: 456, x: 5 } as never));
		await passar(2000);
		expect(rede.segredos()).not.toMatch(/123|456/);
		expect(rede.segredos()).toContain('"x":5');
	});

	it('esconder some da tela do grupo, e o dono segue vendo o seu', async () => {
		await feito(mesas.m, async () => {
			await mesas.m.atualizarToken('npc', { visivel: false });
			await mesas.m.atualizarToken('de-ana', { visivel: false });
		});
		await passar(2000);
		expect(mesas.a.tokens.some((t) => t.id === 'npc')).toBe(false);
		expect(mesas.a.tokens.some((t) => t.id === 'de-ana')).toBe(true);
		expect(mesas.b.tokens.some((t) => t.id === 'de-ana')).toBe(false);
	});

	it('revelar aparece para o grupo sem esperar o banco', async () => {
		void como(mesas.m, () => mesas.m.atualizarToken('escondido', { visivel: true }));
		await passar(ESCRITA + CANAL + 8);
		expect(mesas.a.tokens.some((t) => t.id === 'escondido')).toBe(true);
		await passar(2000);
		expect(mesas.a.tokens.filter((t) => t.id === 'escondido')).toHaveLength(1);
	});

	it('o nome verdadeiro de quem tem nome escondido nunca sai pelo canal', async () => {
		rede.tabelas.mesa_tokens.get('escondido')!.nome_oculto = true;
		rede.tabelas.mesa_tokens.get('escondido')!.nome = '???';
		mesas.m.tokens = mesas.m.tokens.map((t) => (t.id === 'escondido' ? { ...t, nome: 'Hunter', nome_oculto: true } : t));
		await feito(mesas.m, () => mesas.m.atualizarToken('escondido', { visivel: true }));
		await passar(2000);
		expect(rede.segredos()).not.toContain('Hunter');
		expect(mesas.a.tokens.find((t) => t.id === 'escondido')?.nome).toBe('???');
	});
});

describe('a vez', () => {
	const ordem = [
		{ nome: 'Ana', valor: 15, personagem_id: 'p-a', npc_id: null },
		{ nome: 'Bruno', valor: 10, personagem_id: 'p-b', npc_id: null }
	];

	it('passar a vez chega a todos antes do resto da rodada', async () => {
		await feito(mesas.m, () => mesas.m.patchCena({ iniciativa: { ativa: true, rodada: 1, vez: 1, ordem } }));
		await passar(2000);
		void como(mesas.m, () => mesas.m.proximoTurno());
		await passar(CANAL + 4);
		expect(mesas.a.iniciativa).toMatchObject({ rodada: 2, vez: 0 });
		await passar(3000);
		for (const mesa of Object.values(mesas)) expect(mesa.iniciativa).toMatchObject({ rodada: 2, vez: 0 });
	});

	it('o efeito que acaba some para todos, e os metros andados zeram', async () => {
		await feito(mesas.m, async () => {
			await mesas.m.patchCena({ iniciativa: { ativa: true, rodada: 1, vez: 1, ordem } });
			await mesas.m.deixarEfeito('Névoa', [[1, 1]], 1, [1, 1]);
			await mesas.m.atualizarToken('npc', { movido: 5 });
		});
		await passar(2000);
		void como(mesas.m, () => mesas.m.proximoTurno());
		await passar(CANAL * 3);
		expect(mesas.a.efeitos).toEqual([]);
		expect(mesas.a.tokens.find((t) => t.id === 'npc')!.movido).toBe(0);
		await passar(3000);
		expect(rede.tabelas.mesa_efeitos.size).toBe(0);
		expect(rede.tabelas.mesa_tokens.get('npc')!.movido).toBe(0);
	});
});

describe('uma leva grande', () => {
	it('não enche o canal: o que passar do limite chega pelo aviso do banco', async () => {
		const ids = ['de-ana', 'de-bruno', 'npc'];
		for (let i = 0; i < 40; i++) void como(mesas.m, () => mesas.m.atualizarToken(ids[i % 3], { x: 10 + i }));
		expect(rede.trafego.filter((t) => t.evento === 'token').length).toBeLessThanOrEqual(12);
		await passar(3000);
		for (const id of ids) {
			const certo = rede.tabelas.mesa_tokens.get(id)!.x;
			for (const mesa of Object.values(mesas)) expect(posicao(mesa, id)).toBe(certo);
		}
	});

	it('depois da leva, o canal volta a valer', async () => {
		for (let i = 0; i < 20; i++) void como(mesas.m, () => mesas.m.atualizarToken('npc', { x: 10 + i }));
		await passar(3000);
		void como(mesas.a, () => mesas.a.mover('de-ana', 7, 1, 6));
		await passar(CANAL + 4);
		expect(posicao(mesas.b, 'de-ana')).toBe(7);
		void como(mesas.m, () => mesas.m.mover('npc', 4, 1, 6));
		await passar(CANAL + 4);
		expect(posicao(mesas.b, 'npc')).toBe(4);
	});
});

describe('quem chega ou volta', () => {
	it('o que mudou entre a página montar e o canal abrir aparece logo', async () => {
		const tarde = abrir(ANA);
		rede.tabelas.mesa_tokens.set('npc', { ...rede.tabelas.mesa_tokens.get('npc')!, x: 14 });
		await passar(ESCRITA + CANAL + 10);
		expect(posicao(tarde, 'npc')).toBe(14);
		tarde.desconectar();
	});

	it('depois de cair, a releitura traz o que mudou, sem apagar as paredes', async () => {
		[rede.semCanal, rede.semAvisos] = [true, true];
		await feito(mesas.m, () => mesas.m.patchCena({ luz_dinamica: false }));
		await passar(4100);
		await feito(mesas.a, () => mesas.a.ressincronizar(true));
		expect(cena(mesas.a).luz_dinamica).toBe(false);
		expect(mesas.a.paredes).toHaveLength(3);
	});
});
