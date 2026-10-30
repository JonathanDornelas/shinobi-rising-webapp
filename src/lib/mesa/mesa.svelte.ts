// L11 · Mesa: o estado de uma cena no navegador. O que fica salvo (tokens, traços, efeitos, a cena) chega ao vivo pelo
// postgres_changes, já filtrado pelo RLS; o que é passageiro (o arrasto dos outros, a régua sendo medida, o Apontar, o
// molde de jutsu) vai por broadcast no canal da campanha, e a presença diz quem está na mesa.
import type { RealtimeChannel, RealtimePostgresChangesPayload } from '@supabase/supabase-js';
import { sessao } from '#lib/estado/sessao.svelte.ts';
import { toasts } from '#lib/estado/toasts.svelte.ts';
import { ordemIniciativa } from '#lib/rolagens/registro.ts';
import { supabase } from '#lib/supabase/cliente.ts';
import type { CorMesa, IniciativaCena, MesaArte, MesaCena, MesaCenaPasta, MesaEfeito, MesaJukebox, MesaObjeto, MesaToken, MesaTraco, Papel, Rolagem } from '#lib/supabase/banco.ts';
import { mascararCena } from './cenas.ts';
import { limitarPosicao } from './musica.ts';
import { limpar as limparRuns } from './nevoa.ts';
import { coresDosMembros } from './cores.ts';
import { deslocarQuadrados, deslocarRuns, deslocarToken } from './reenquadrar.ts';
import type { Quadrado } from './geometria.ts';
import { molduraDoToken, molduraPorId } from './molduras.ts';
import { nomeReal, siglaDoNome } from './nomes.ts';

export type Ferramenta = 'mover' | 'medir' | 'lapis' | 'apontar' | 'borracha' | 'terreno' | 'fundo' | 'alfinete' | 'texto' | 'objeto' | 'nevoa';

export interface MembroMesa {
	id: string;
	papel: Papel;
	nome: string;
	avatar: string | null;
	cor: CorMesa | null;
	moldura: string | null;
}

export interface Fantasma {
	token: string;
	x: number;
	y: number;
}
export interface ReguaViva {
	pontos: Quadrado[];
	feita: boolean;
	fixa: boolean;
	t: number;
}
export interface TracoTemporario {
	id: string;
	usuario: string;
	pontos: [number, number][];
	espessura: number;
	t: number;
}
/** O molde de jutsu de outra pessoa, já calculado (a mira dela no quadro). */
export interface MoldeVivo {
	nome: string;
	quadrados: Quadrado[];
	contorno: [number, number][] | null;
	anel: { cx: number; cy: number; r: number } | null;
	ok: boolean;
	t: number;
}

type Desfazer = { tipo: 'mover'; id: string; x: number; y: number; movido: number } | { tipo: 'traco'; id: string } | { tipo: 'objeto'; id: string };


const sb = () => supabase();

/** Clone criado por um jutsu (ou pelo Clonar): ligado a outro token, com a sigla CL. */
const ehClone = (t: MesaToken) => !!t.ligado_a && t.sigla === 'CL';

export class Mesa {
	readonly campanha: string;
	readonly eu: string;
	readonly mestre: boolean;
	readonly somenteLeitura: boolean;

	cenas = $state<MesaCena[]>([]);
	cenaId = $state<string | null>(null);
	tokens = $state<MesaToken[]>([]);
	tracos = $state<MesaTraco[]>([]);
	efeitos = $state<MesaEfeito[]>([]);
	/** Alfinetes, imagens e textos soltos no quadro. */
	objetos = $state<MesaObjeto[]>([]);
	/** A música da campanha (null = nenhuma). */
	jukebox = $state<MesaJukebox | null>(null);
	/** Só o Mestre: o nome verdadeiro de cada NPC e ficha de NPC (por id) e quais estão com o nome escondido do grupo. */
	nomesReais = $state.raw<Record<string, string>>({});
	ocultos = $state<Record<string, boolean>>({});
	/** Hora do servidor menos a deste navegador, em ms (o jukebox mede a posição pelo relógio do servidor). */
	desvio = 0;
	/** A hora (do servidor) da última troca de música que chegou por broadcast: o banco não desfaz uma troca mais nova com uma mais velha. */
	private musicaT = 0;
	/** Pastas das cenas e biblioteca de artes: só o Mestre carrega. */
	pastasCenas = $state<MesaCenaPasta[]>([]);
	artes = $state<MesaArte[]>([]);
	membros = $state<MembroMesa[]>([]);
	/** a moldura que o Mestre escolheu para a campanha; universal = vale em todos os tokens */
	molduraMesa = $state<{ id: string | null; universal: boolean }>({ id: null, universal: false });
	online = $state<string[]>([]);
	fantasmas = $state<Record<string, Fantasma>>({});
	reguas = $state<Record<string, ReguaViva>>({});
	temporarios = $state<TracoTemporario[]>([]);
	moldes = $state<Record<string, MoldeVivo>>({});
	pulso = $state<{ token: string; t: number } | null>(null);
	/** Pings no mapa (Alt+clique ou clique com Apontar): ondas na cor de quem pingou, por 2,5 s. */
	pings = $state<{ id: string; usuario: string; x: number; y: number }[]>([]);
	/** Números de PV que o RLS esconde do grupo: só com "Mostrar PV ao grupo" (pv_da_cena). */
	pvs = $state<Record<string, { pv: number | null; pv_max: number | null }>>({});
	conectado = $state(true);
	/** A cena ativa mudou enquanto o jogador estava nela: a página recarrega. */
	trocouCena = $state(0);

	private canal: RealtimeChannel | null = null;
	private desfazer: Desfazer[] = [];
	private ultimoEnvio: Record<string, number> = {};

	cena = $derived(this.cenas.find((c) => c.id === this.cenaId) ?? null);
	cores = $derived(coresDosMembros(this.membros));
	// a iniciativa e o terreno vêm do banco e do Realtime: qualquer formato inesperado vira vazio, nunca uma exceção
	iniciativa = $derived<IniciativaCena>(this.cena?.iniciativa && typeof this.cena.iniciativa === 'object' && !Array.isArray(this.cena.iniciativa) ? this.cena.iniciativa : {});
	/** Quadrados de terreno difícil da cena, como "x,y" */
	terreno = $derived(new Set((Array.isArray(this.cena?.terreno) ? this.cena.terreno : []).map(([x, y]) => `${x},${y}`)));
	get travada() {
		return !!this.cena?.travada && !this.mestre;
	}

	constructor(d: {
		campanha: string;
		eu: string;
		mestre: boolean;
		arquivada: boolean;
		cenas: MesaCena[];
		cena: MesaCena | null;
		tokens: MesaToken[];
		tracos: MesaTraco[];
		efeitos: MesaEfeito[];
		objetos?: MesaObjeto[];
		jukebox?: MesaJukebox | null;
		pastasCenas?: MesaCenaPasta[];
		artes?: MesaArte[];
		membros: MembroMesa[];
		molduraMesa: { id: string | null; universal: boolean };
	}) {
		this.campanha = d.campanha;
		this.eu = d.eu;
		this.mestre = d.mestre;
		this.somenteLeitura = d.arquivada;
		this.cenas = d.cenas.map((c) => mascararCena(c, d.mestre));
		this.cenaId = d.cena?.id ?? null;
		this.tokens = d.tokens;
		this.tracos = d.tracos;
		this.efeitos = d.efeitos;
		this.objetos = d.objetos ?? [];
		this.jukebox = d.jukebox ?? null;
		this.pastasCenas = d.pastasCenas ?? [];
		this.artes = d.artes ?? [];
		this.membros = d.membros;
		this.molduraMesa = d.molduraMesa;
	}

	corDe = (usuario: string | null | undefined): CorMesa | null => (usuario ? (this.cores.get(usuario) ?? null) : null);
	membro = (usuario: string | null | undefined) => this.membros.find((m) => m.id === usuario) ?? null;
	/** Dono do token para a cor: o jogador; tokens do Mestre (NPCs) usam a cor do Mestre. */
	donoDe = (t: MesaToken) => t.dono_id ?? this.membros.find((m) => m.papel === 'mestre')?.id ?? null;
	molduraDe = (t: MesaToken) => molduraDoToken(this.molduraMesa, t.dono_id ? this.membro(t.dono_id) : null);
	podeMover = (t: MesaToken) => !this.somenteLeitura && (this.mestre || (t.dono_id === this.eu && !this.travada));

	// ------------------------------------------------------------------ tempo real
	conectar() {
		if (this.canal || !this.cenaId) return;
		const cena = this.cenaId;
		const lista = <T extends { id: string }>(arr: T[], novo: T) => (arr.some((x) => x.id === novo.id) ? arr.map((x) => (x.id === novo.id ? novo : x)) : [...arr, novo]);
		// Um só roteador para todos os avisos do banco, pela tabela do próprio aviso (`p.table`). O Realtime entrega cada aviso
		// ao ouvinte pela ordem dos ids; quando muita coisa muda de uma vez (redimensionar a cena, por exemplo) já chegou a
		// entregar a linha de uma tabela ao ouvinte de outra (um token aparecia como "efeito" e a atualização se perdia).
		// Assim, onde quer que o aviso caia, ele é tratado como o que é.
		const idAntigo = (p: RealtimePostgresChangesPayload<Record<string, unknown>>) => (p.old as { id?: string }).id;
		const rotear = (p: RealtimePostgresChangesPayload<Record<string, unknown>>) => {
			const apagou = p.eventType === 'DELETE';
			switch (p.table) {
				case 'mesa_tokens': {
					if (apagou) return void (this.tokens = this.tokens.filter((t) => t.id !== idAntigo(p)));
					const novo = p.new as unknown as MesaToken;
					if (novo.cena_id !== cena) return;
					const velho = this.tokens.find((t) => t.id === novo.id);
					this.tokens = lista(this.tokens, this.comNome(novo));
					// o PV visível só muda com ferimento, PV, entrada ou saída de token: andar não pede nova leitura
					if (this.cena?.mostrar_pv && !this.mestre && (!velho || velho.ferimento !== novo.ferimento || velho.pv !== novo.pv || velho.pv_max !== novo.pv_max)) this.lerPvs();
					return;
				}
				case 'mesa_tracos':
					// o Realtime não filtra DELETE (o registro antigo só traz o id): por isso o apagar vale para qualquer aviso
					if (apagou) return void (this.tracos = this.tracos.filter((t) => t.id !== idAntigo(p)));
					if ((p.new as { cena_id?: string }).cena_id === cena) this.tracos = lista(this.tracos, p.new as unknown as MesaTraco);
					return;
				case 'mesa_efeitos':
					if (apagou) return void (this.efeitos = this.efeitos.filter((t) => t.id !== idAntigo(p)));
					if ((p.new as { cena_id?: string }).cena_id === cena) this.efeitos = lista(this.efeitos, p.new as unknown as MesaEfeito);
					return;
				case 'mesa_objetos':
					if (apagou) return void (this.objetos = this.objetos.filter((t) => t.id !== idAntigo(p)));
					if ((p.new as { cena_id?: string }).cena_id === cena) this.objetos = lista(this.objetos, p.new as unknown as MesaObjeto);
					return;
				case 'mesa_jukebox': {
					if (apagou) return void (this.jukebox = null);
					const novo = p.new as unknown as MesaJukebox;
					// a troca chegou antes por broadcast: uma gravação mais velha que ela (a faixa anterior) não volta
					if (Date.parse(novo.desde) < this.musicaT - 1500) return;
					this.jukebox = novo;
					return;
				}
				case 'mesa_cenas': {
					if (apagou) {
						this.cenas = this.cenas.filter((c) => c.id !== idAntigo(p));
						if (idAntigo(p) === cena && !this.mestre) this.trocouCena++;
						return;
					}
					const c = mascararCena(p.new as unknown as MesaCena, this.mestre);
					// colunas grandes que não mudaram podem chegar de fora do aviso (TOAST do Postgres): fica o que já estava
					const antiga = this.cenas.find((x) => x.id === c.id);
					if (!Array.isArray(c.terreno)) c.terreno = antiga?.terreno ?? [];
					if (!Array.isArray(c.reveladas)) c.reveladas = antiga?.reveladas ?? [];
					if (c.participantes != null && !Array.isArray(c.participantes)) c.participantes = antiga?.participantes ?? null;
					if (!c.iniciativa || typeof c.iniciativa !== 'object' || Array.isArray(c.iniciativa)) c.iniciativa = antiga?.iniciativa ?? {};
					this.cenas = lista(this.cenas, c);
					// o Mestre ativou outra cena: quem joga vai junto
					if (!this.mestre && c.ativa && c.id !== cena) this.trocouCena++;
					if (c.id === cena && c.mostrar_pv && !this.mestre) this.lerPvs();
					return;
				}
				case 'membros': {
					if (apagou) return;
					const m = p.new as unknown as { usuario_id: string; cor: CorMesa | null };
					this.membros = this.membros.map((x) => (x.id === m.usuario_id ? { ...x, cor: m.cor } : x));
					return;
				}
			}
		};
		this.canal = sb()
			.channel(`mesa:${this.campanha}`, { config: { broadcast: { self: false }, presence: { key: this.eu } } })
			.on('postgres_changes', { event: '*', schema: 'public', table: 'mesa_tokens', filter: `cena_id=eq.${cena}` }, rotear)
			.on('postgres_changes', { event: '*', schema: 'public', table: 'mesa_tracos', filter: `cena_id=eq.${cena}` }, rotear)
			.on('postgres_changes', { event: '*', schema: 'public', table: 'mesa_efeitos', filter: `cena_id=eq.${cena}` }, rotear)
			// o Realtime não filtra DELETE (o registro antigo só traz o id): sem estes, um token, traço ou efeito apagado
			// por outra pessoa (ou pela contagem de turnos) continuava na tela até recarregar
			.on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'mesa_tokens' }, rotear)
			.on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'mesa_tracos' }, rotear)
			.on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'mesa_efeitos' }, rotear)
			.on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'mesa_objetos' }, rotear)
			.on('postgres_changes', { event: '*', schema: 'public', table: 'mesa_objetos', filter: `cena_id=eq.${cena}` }, rotear)
			.on('postgres_changes', { event: '*', schema: 'public', table: 'mesa_jukebox', filter: `campanha_id=eq.${this.campanha}` }, rotear)
			.on('postgres_changes', { event: '*', schema: 'public', table: 'mesa_cenas', filter: `campanha_id=eq.${this.campanha}` }, rotear)
			.on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'membros', filter: `campanha_id=eq.${this.campanha}` }, rotear)
			// a troca de música do Mestre chega na hora, sem esperar o banco: todos passam para a faixa juntos
			.on('broadcast', { event: 'musica' }, ({ payload }) => {
				const { usuario, jukebox } = payload as { usuario: string; jukebox: MesaJukebox | null };
				if (this.membro(usuario)?.papel !== 'mestre' || usuario === this.eu) return;
				if (jukebox && !(jukebox.fonte && jukebox.ref && Number.isFinite(Date.parse(jukebox.desde)))) return;
				this.musicaT = jukebox ? Date.parse(jukebox.desde) : Date.now() + this.desvio;
				this.jukebox = jukebox;
			})
			// o Mestre escondeu um token ou objeto: o banco deixa de mostrá-lo ao grupo, mas o tempo real não avisa quando a linha
			// some da vista (a atualização já não passa pela permissão), então o aviso vai por aqui. Quem é dono do token ou autor
			// do objeto continua vendo o que é seu.
			.on('broadcast', { event: 'esconder' }, ({ payload }) => {
				const { usuario, tokens, objetos } = payload as { usuario: string; tokens?: string[]; objetos?: string[] };
				if (this.mestre || this.membro(usuario)?.papel !== 'mestre') return;
				if (Array.isArray(tokens)) this.tokens = this.tokens.filter((t) => !tokens.includes(t.id) || t.dono_id === this.eu);
				if (Array.isArray(objetos)) this.objetos = this.objetos.filter((o) => !objetos.includes(o.id) || o.autor_id === this.eu);
			})
			.on('broadcast', { event: 'fantasma' }, ({ payload }) => this.receber('fantasmas', payload))
			.on('broadcast', { event: 'regua' }, ({ payload }) => this.receber('reguas', payload))
			.on('broadcast', { event: 'molde' }, ({ payload }) => this.receber('moldes', payload))
			.on('broadcast', { event: 'apontar' }, ({ payload }) => {
				const t = payload as TracoTemporario;
				this.temporarios = [...this.temporarios.filter((x) => x.id !== t.id), { ...t, t: Date.now() }];
			})
			.on('broadcast', { event: 'pulso' }, ({ payload }) => (this.pulso = { token: (payload as { token: string }).token, t: Date.now() }))
			.on('broadcast', { event: 'ping' }, ({ payload }) => this.receberPing(payload as { id: string; usuario: string; x: number; y: number }))
			.on('broadcast', { event: 'moldura-mesa' }, ({ payload }) => {
				const { dados } = payload as { dados: { id: string | null; universal: boolean } };
				this.molduraMesa = { id: molduraPorId(dados.id)?.id ?? null, universal: !!dados.universal };
			})
			.on('broadcast', { event: 'moldura' }, ({ payload }) => {
				const { usuario, dados } = payload as { usuario: string; dados: string | null };
				this.membros = this.membros.map((m) => (m.id === usuario ? { ...m, moldura: molduraPorId(dados)?.id ?? null } : m));
			})
			.on('presence', { event: 'sync' }, () => {
				this.online = Object.keys(this.canal?.presenceState() ?? {});
			})
			.subscribe((status) => {
				this.conectado = status === 'SUBSCRIBED';
				if (status === 'SUBSCRIBED') this.canal?.track({ em: Date.now() });
			});
		if (this.cena?.mostrar_pv && !this.mestre) this.lerPvs();
	}

	desconectar() {
		if (this.canal) sb().removeChannel(this.canal);
		this.canal = null;
	}

	private receber(campo: 'fantasmas' | 'reguas' | 'moldes', payload: unknown) {
		const { usuario, dados } = payload as { usuario: string; dados: unknown };
		const atual = { ...this[campo] } as Record<string, unknown>;
		if (dados == null) delete atual[usuario];
		else atual[usuario] = { ...(dados as object), t: Date.now() };
		(this as unknown as Record<string, unknown>)[campo] = atual;
	}

	/** Ping no mapa: aparece aqui e chega a todos na mesa. */
	ping(x: number, y: number) {
		const p = { id: crypto.randomUUID(), usuario: this.eu, x: Math.round(x * 100) / 100, y: Math.round(y * 100) / 100 };
		this.receberPing(p);
		this.enviar('ping', p, true);
	}
	private receberPing(p: { id: string; usuario: string; x: number; y: number }) {
		if (!Number.isFinite(p.x) || !Number.isFinite(p.y)) return;
		this.pings = [...this.pings.slice(-9), p];
		setTimeout(() => (this.pings = this.pings.filter((k) => k.id !== p.id)), 2500);
	}

	/** Manda o que é passageiro, no máximo 20 vezes por segundo (o último estado sempre sai: null limpa). */
	enviar(evento: 'fantasma' | 'regua' | 'molde' | 'apontar' | 'pulso' | 'ping' | 'moldura' | 'moldura-mesa', dados: unknown, forcar = false) {
		if (!this.canal || !this.conectado) return;
		const agora = Date.now();
		// o molde pode ter mais de mil quadrados: vai no máximo 6 vezes por segundo; o resto, 20
		if (!forcar && dados != null && agora - (this.ultimoEnvio[evento] ?? 0) < (evento === 'molde' ? 160 : 50)) return;
		this.ultimoEnvio[evento] = agora;
		const payload = evento === 'apontar' || evento === 'pulso' || evento === 'ping' ? dados : { usuario: this.eu, dados };
		this.canal.send({ type: 'broadcast', event: evento, payload });
	}

	private esperaPvs: ReturnType<typeof setTimeout> | undefined;
	/** Lê os PVs visíveis da cena; vários avisos seguidos (o turno zera o movimento de todos) viram uma leitura só. */
	lerPvs() {
		clearTimeout(this.esperaPvs);
		this.esperaPvs = setTimeout(() => this.lerPvsAgora(), 250);
	}
	private async lerPvsAgora() {
		if (!this.cenaId) return;
		const { data } = await sb().rpc('pv_da_cena', { cena: this.cenaId });
		this.pvs = Object.fromEntries((data ?? []).map((r) => [r.token_id, { pv: r.pv, pv_max: r.pv_max }]));
	}

	// ------------------------------------------------------------------ iniciativa
	/** Tokens da vez: os do personagem ou do NPC (todos os membros da tropa) da entrada atual. */
	daVez = $derived.by(() => {
		const i = this.iniciativa;
		if (!i.ativa || !i.ordem?.length) return new Set<string>();
		const e = i.ordem[Math.abs(Math.trunc(i.vez ?? 0)) % i.ordem.length];
		if (!e) return new Set<string>();
		return new Set(this.tokens.filter((t) => (e.personagem_id && t.personagem_id === e.personagem_id) || (e.npc_id && t.npc_id === e.npc_id)).map((t) => t.id));
	});

	async comecarCombate(rolagens: Rolagem[]) {
		const ordem = ordemIniciativa(rolagens, this.campanha, 6, new Date(), this.iniciativa.limpa_em ?? null).map((o) => {
			const pc = this.tokens.find((t) => t.personagem_id === o.chave);
			const npc = this.tokens.find((t) => t.npc_id === o.chave);
			return { nome: o.quem, valor: o.total, personagem_id: pc ? o.chave : null, npc_id: npc ? o.chave : null };
		});
		if (!ordem.length) {
			toasts.mostrar('Ninguém rolou iniciativa ainda. Peça para cada um rolar pela ficha rápida.', 'aviso');
			return;
		}
		await this.patchCena({ iniciativa: { ativa: true, rodada: 1, vez: 0, ordem } });
		await this.zerarMovido();
	}

	async proximoTurno() {
		const i = this.iniciativa;
		if (!i.ativa || !i.ordem?.length) return;
		let vez = (i.vez ?? 0) + 1;
		let rodada = i.rodada ?? 1;
		if (vez >= i.ordem.length) {
			vez = 0;
			rodada++;
			// rodada nova: os efeitos em cena perdem um turno e somem no zero (um efeito de 3 turnos lançado na
			// rodada 1 vale nas rodadas 1, 2 e 3). A tela muda na hora; o banco vai em seguida.
			const comTurnos = this.efeitos.filter((x) => x.turnos != null);
			const acabam = comTurnos.filter((e) => e.turnos! <= 1).map((e) => e.id);
			this.efeitos = this.efeitos.filter((e) => !acabam.includes(e.id)).map((e) => (e.turnos != null ? { ...e, turnos: e.turnos - 1 } : e));
			await Promise.all([
				...(acabam.length ? [sb().from('mesa_efeitos').delete().in('id', acabam)] : []),
				...comTurnos.filter((x) => x.turnos! > 1).map((e) => sb().from('mesa_efeitos').update({ turnos: e.turnos! - 1 }).eq('id', e.id))
			]);
			// e quem cresceu por um jutsu também: no zero, volta ao tamanho normal
			for (const t of this.tokens.filter((x) => x.tamanho_base != null && x.crescido_turnos != null)) {
				if (t.crescido_turnos! <= 1) await this.voltarAoNormal(t);
				else await this.atualizarToken(t.id, { crescido_turnos: t.crescido_turnos! - 1 });
			}
			// clones de jutsu com duração em turnos (crescido_turnos guarda o que falta): somem no zero
			for (const t of this.tokens.filter((x) => ehClone(x) && x.crescido_turnos != null)) {
				if (t.crescido_turnos! <= 1) await this.remover(t.id);
				else await this.atualizarToken(t.id, { crescido_turnos: t.crescido_turnos! - 1 });
			}
		}
		await this.patchCena({ iniciativa: { ...i, vez, rodada } });
		await this.zerarMovido();
	}

	async encerrarCombate() {
		await this.patchCena({ iniciativa: { ativa: false, limpa_em: this.iniciativa.limpa_em } });
		// fim do combate: quem estava crescido volta ao normal, e os clones de jutsu se desfazem
		for (const t of this.tokens.filter((x) => x.tamanho_base != null)) await this.voltarAoNormal(t);
		for (const t of this.tokens.filter(ehClone)) await this.remover(t.id);
		await this.zerarMovido();
	}

	/** Limpar: a ordem some e a prévia passa a contar só as iniciativas roladas daqui em diante. */
	async limparIniciativa() {
		await this.patchCena({ iniciativa: { ativa: false, limpa_em: new Date().toISOString() } });
		await this.zerarMovido();
	}

	/** O Mestre muda a ordem (sobe ou desce uma entrada); a vez continua com quem estava nela. */
	async moverNaOrdem(i: number, delta: -1 | 1) {
		const ini = this.iniciativa;
		const ordem = [...(ini.ordem ?? [])];
		const j = i + delta;
		if (!ini.ativa || j < 0 || j >= ordem.length) return;
		const daVez = ordem[ini.vez ?? 0];
		[ordem[i], ordem[j]] = [ordem[j], ordem[i]];
		await this.patchCena({ iniciativa: { ...ini, ordem, vez: ordem.indexOf(daVez) } });
	}

	private async zerarMovido() {
		const ids = this.tokens.filter((t) => t.movido > 0).map((t) => t.id);
		if (ids.length) await sb().from('mesa_tokens').update({ movido: 0 }).in('id', ids);
	}

	// ------------------------------------------------------------------ nome escondido
	/** Para o Mestre, o token de nome escondido mostra o nome verdadeiro (o banco guarda "???" para o grupo). */
	private comNome(t: MesaToken): MesaToken {
		if (!this.mestre || !t.nome_oculto) return t;
		const nome = nomeReal(t, this.nomesReais, this.tokens);
		return nome ? { ...t, nome, sigla: t.ligado_a && !t.npc_id && !t.personagem_id ? 'CL' : siglaDoNome(nome, t.membro) } : t;
	}
	/** O Mestre informa os nomes que conhece e o que está escondido; os tokens da cena passam a mostrar o nome verdadeiro. */
	definirNomes(reais: Record<string, string>, ocultos: Record<string, boolean>) {
		this.nomesReais = reais;
		this.ocultos = ocultos;
		this.tokens = this.tokens.map((t) => this.comNome(t));
	}
	/** O nome de quem rolou: o Mestre lê o verdadeiro no lugar do "???" (vale também para a ordem de iniciativa). */
	quemDe(r: { quem?: string; nome?: string; npc_id?: string | null; personagem_id?: string | null }): string {
		return (this.mestre && this.nomesReais[r.npc_id ?? r.personagem_id ?? '']) || (r.quem ?? r.nome ?? '');
	}
	/** Liga ou desliga o "???" de um NPC ou ficha de NPC para o grupo (só o Mestre). */
	async definirNomeOculto(tipo: 'npc' | 'ficha', id: string, oculto: boolean) {
		if (!this.mestre || this.somenteLeitura) return false;
		const antes = !!this.ocultos[id];
		this.ocultos = { ...this.ocultos, [id]: oculto };
		const { error } = await sb().rpc('definir_nome_oculto', { alvo: tipo, id, oculto });
		if (error) {
			this.ocultos = { ...this.ocultos, [id]: antes };
			toasts.mostrar('Não foi possível mudar o nome do NPC.', 'erro');
			return false;
		}
		return true;
	}

	// ------------------------------------------------------------------ tokens
	private trocar(id: string, patch: Partial<MesaToken>) {
		this.tokens = this.tokens.map((t) => (t.id === id ? { ...t, ...patch } : t));
	}

	async atualizarToken(id: string, patch: Partial<MesaToken>, erro = 'Não foi possível salvar o token.') {
		const antes = this.tokens.find((t) => t.id === id);
		if (!antes) return false;
		this.trocar(id, patch);
		const { error } = await sb().from('mesa_tokens').update(patch).eq('id', id);
		if (error) {
			this.trocar(id, antes);
			toasts.mostrar(/travada/i.test(error.message) ? 'Mesa travada pelo Mestre.' : erro, 'erro');
			return false;
		}
		if (this.mestre && patch.visivel === false && antes.visivel) this.canal?.send({ type: 'broadcast', event: 'esconder', payload: { usuario: this.eu, tokens: [id] } });
		return true;
	}

	async mover(id: string, x: number, y: number, metros: number) {
		const t = this.tokens.find((k) => k.id === id);
		if (!t || (t.x === x && t.y === y)) return;
		this.desfazer.push({ tipo: 'mover', id, x: t.x, y: t.y, movido: t.movido });
		const movido = this.daVez.has(id) ? t.movido + metros : 0;
		await this.atualizarToken(id, { x, y, movido });
	}

	async colocar(novo: Partial<MesaToken> & { nome: string }) {
		if (!this.cenaId) return null;
		const { data, error } = await sb()
			.from('mesa_tokens')
			.insert({ ...novo, cena_id: this.cenaId, campanha_id: this.campanha })
			.select('*')
			.single();
		if (error || !data) {
			toasts.mostrar(/Fora da cena/.test(error?.message ?? '') ? 'Esse lugar fica fora da cena.' : 'Não foi possível pôr o token na cena.', 'erro');
			return null;
		}
		const criado = this.comNome(data as MesaToken);
		this.tokens = this.tokens.some((t) => t.id === criado.id) ? this.tokens : [...this.tokens, criado];
		return criado;
	}

	async remover(id: string) {
		const antes = this.tokens;
		this.tokens = this.tokens.filter((t) => t.id !== id && t.ligado_a !== id);
		const { error } = await sb().from('mesa_tokens').delete().eq('id', id);
		if (error) {
			this.tokens = antes;
			toasts.mostrar('Não foi possível tirar o token da cena.', 'erro');
		}
	}

	// ------------------------------------------------------------------ traços e efeitos
	async desenhar(pontos: [number, number][], espessura: number) {
		if (!this.cenaId || pontos.length < 2) return;
		const { data, error } = await sb().from('mesa_tracos').insert({ cena_id: this.cenaId, pontos, espessura }).select('*').single();
		if (error || !data) {
			toasts.mostrar('Não foi possível salvar o traço.', 'erro');
			return;
		}
		this.desfazer.push({ tipo: 'traco', id: data.id });
		this.tracos = this.tracos.some((t) => t.id === data.id) ? this.tracos : [...this.tracos, data as MesaTraco];
	}

	async apagarTraco(id: string) {
		const antes = this.tracos;
		this.tracos = this.tracos.filter((t) => t.id !== id);
		const { error } = await sb().from('mesa_tracos').delete().eq('id', id);
		if (error) this.tracos = antes;
	}

	async limparTracos(todos: boolean) {
		if (!this.cenaId) return;
		const q = sb().from('mesa_tracos').delete().eq('cena_id', this.cenaId);
		const { error } = await (todos ? q : q.eq('autor_id', this.eu));
		if (error) toasts.mostrar('Não foi possível limpar os traços.', 'erro');
		else this.tracos = todos ? [] : this.tracos.filter((t) => t.autor_id !== this.eu);
	}

	async deixarEfeito(nome: string, quadrados: Quadrado[], turnos: number | null, rotulo: [number, number], estilo: string | null = null) {
		if (!this.cenaId) return;
		const { data, error } = await sb()
			.from('mesa_efeitos')
			.insert({ cena_id: this.cenaId, nome: nome.slice(0, 60), quadrados, turnos, rotulo_x: rotulo[0], rotulo_y: rotulo[1], estilo })
			.select('*')
			.single();
		if (error || !data) toasts.mostrar('Não foi possível deixar o efeito na cena.', 'erro');
		else this.efeitos = this.efeitos.some((e) => e.id === data.id) ? this.efeitos : [...this.efeitos, data as MesaEfeito];
	}

	/** Quem pode tirar o efeito do quadro: o Mestre ou quem o deixou. */
	podeTirarEfeito = (e: MesaEfeito) => !this.somenteLeitura && (this.mestre || e.autor_id === this.eu);
	async removerEfeito(id: string) {
		const antes = this.efeitos;
		this.efeitos = this.efeitos.filter((e) => e.id !== id);
		const { error } = await sb().from('mesa_efeitos').delete().eq('id', id);
		if (error) {
			this.efeitos = antes;
			toasts.mostrar('Não foi possível tirar o efeito do quadro.', 'erro');
		}
	}

	// ------------------------------------------------------------------ objetos da cena
	/** Pode mexer neste objeto? O Mestre em todos; cada um nos seus (e nunca nos travados). */
	podeMexerObjeto = (o: MesaObjeto) => !this.somenteLeitura && (this.mestre || (o.autor_id === this.eu && !o.travado && !this.travada && o.tipo !== 'imagem'));

	async colocarObjeto(novo: Partial<MesaObjeto> & { tipo: MesaObjeto['tipo'] }) {
		if (!this.cenaId) return null;
		const { data, error } = await sb()
			.from('mesa_objetos')
			.insert({ ...novo, cena_id: this.cenaId, autor_id: this.eu })
			.select('*')
			.single();
		if (error || !data) {
			toasts.mostrar(/300 objetos/.test(error?.message ?? '') ? 'A cena guarda até 300 objetos.' : /row-level/.test(error?.message ?? '') ? 'Mesa travada pelo Mestre.' : 'Não foi possível pôr o objeto na cena.', 'erro');
			return null;
		}
		const o = data as MesaObjeto;
		this.objetos = this.objetos.some((x) => x.id === o.id) ? this.objetos : [...this.objetos, o];
		this.desfazer.push({ tipo: 'objeto', id: o.id });
		return o;
	}

	async atualizarObjeto(id: string, patch: Partial<MesaObjeto>) {
		const antes = this.objetos.find((o) => o.id === id);
		if (!antes) return false;
		this.objetos = this.objetos.map((o) => (o.id === id ? { ...o, ...patch } : o));
		const { error } = await sb().from('mesa_objetos').update(patch).eq('id', id);
		if (error) {
			this.objetos = this.objetos.map((o) => (o.id === id ? antes : o));
			toasts.mostrar('Não foi possível salvar o objeto.', 'erro');
			return false;
		}
		if (this.mestre && patch.visivel === false && antes.visivel) this.canal?.send({ type: 'broadcast', event: 'esconder', payload: { usuario: this.eu, objetos: [id] } });
		return true;
	}

	async removerObjeto(id: string) {
		const antes = this.objetos;
		this.objetos = this.objetos.filter((o) => o.id !== id);
		const { error } = await sb().from('mesa_objetos').delete().eq('id', id);
		if (error) {
			this.objetos = antes;
			toasts.mostrar('Não foi possível tirar o objeto.', 'erro');
		}
	}

	// ------------------------------------------------------------------ névoa (Mestre)
	/** Liga ou desliga a névoa da cena; ao ligar a primeira vez o mapa começa todo coberto. */
	alternarNevoa(ligada = !this.cena?.nevoa) {
		return this.patchCena({ nevoa: ligada });
	}
	definirReveladas(runs: [number, number, number][]) {
		const c = this.cena;
		return this.patchCena({ reveladas: limparRuns(runs, c?.largura ?? 40, c?.altura ?? 30) });
	}

	// ------------------------------------------------------------------ jukebox (Mestre muda, todos ouvem)
	/** Grava o estado da música (o servidor carimba a hora). Sem música ainda, cria a linha da campanha. */
	async mudarJukebox(patch: Partial<MesaJukebox> & Pick<MesaJukebox, 'fonte' | 'ref'>): Promise<boolean>;
	async mudarJukebox(patch: Partial<MesaJukebox>): Promise<boolean>;
	async mudarJukebox(patch: Partial<MesaJukebox>): Promise<boolean> {
		if (!this.mestre || this.somenteLeitura) return false;
		const antes = this.jukebox;
		const base = antes ?? ({ campanha_id: this.campanha, lista: false, titulo: null, tocando: false, posicao: 0, indice: 0 } as Partial<MesaJukebox>);
		const novo = { ...base, ...patch, campanha_id: this.campanha };
		// o banco guarda de 0 a 86 399 s (ao vivo e vídeos de dias inteiros passavam disso e a gravação falhava)
		novo.posicao = limitarPosicao(novo.posicao ?? 0);
		if (!novo.fonte || !novo.ref) return false;
		const hora = new Date(Date.now() + this.desvio).toISOString();
		this.jukebox = { ...(novo as MesaJukebox), desde: hora, atualizada_em: hora };
		this.musicaT = Date.parse(hora);
		this.canal?.send({ type: 'broadcast', event: 'musica', payload: { usuario: this.eu, jukebox: this.jukebox } });
		const { error } = await sb().from('mesa_jukebox').upsert(novo as MesaJukebox);
		if (error) {
			this.jukebox = antes;
			toasts.mostrar('Não foi possível mudar a música.', 'erro');
			return false;
		}
		return true;
	}
	async tirarJukebox() {
		if (!this.mestre) return;
		const antes = this.jukebox;
		this.jukebox = null;
		this.canal?.send({ type: 'broadcast', event: 'musica', payload: { usuario: this.eu, jukebox: null } });
		const { error } = await sb().from('mesa_jukebox').delete().eq('campanha_id', this.campanha);
		if (error) {
			this.jukebox = antes;
			toasts.mostrar('Não foi possível tirar a música.', 'erro');
		}
	}

	/** Ctrl+Z: desfaz o último movimento, traço ou objeto meu. */
	async desfazerUltimo() {
		const d = this.desfazer.pop();
		if (!d) return false;
		if (d.tipo === 'mover') await this.atualizarToken(d.id, { x: d.x, y: d.y, movido: d.movido });
		else if (d.tipo === 'objeto') await this.removerObjeto(d.id);
		else await this.apagarTraco(d.id);
		return true;
	}

	// ------------------------------------------------------------------ cena (Mestre) e cor
	async patchCena(patch: Partial<MesaCena>): Promise<boolean> {
		if (!this.cenaId) return false;
		const antes = this.cenas;
		this.cenas = this.cenas.map((c) => (c.id === this.cenaId ? { ...c, ...patch } : c));
		const { error } = await sb().from('mesa_cenas').update(patch).eq('id', this.cenaId);
		if (error) {
			this.cenas = antes;
			toasts.mostrar('Não foi possível salvar a cena.', 'erro');
			return false;
		}
		return true;
	}

	/**
	 * O Mestre muda o tamanho da cena (5 a 200 metros de lado). Quem ficaria fora da cena é puxado para dentro, com o
	 * token inteiro à vista; o resto (terreno, névoa, objetos) fica como está.
	 */
	async redimensionarCena(largura: number, altura: number) {
		if (!this.mestre || this.somenteLeitura || !this.cena) return false;
		const L = Math.min(200, Math.max(5, Math.round(largura)));
		const A = Math.min(200, Math.max(5, Math.round(altura)));
		const fora = this.tokens.filter((t) => t.x + t.tamanho > L || t.y + t.tamanho > A);
		if (!(await this.patchCena({ largura: L, altura: A }))) return false;
		for (const t of fora) await this.atualizarToken(t.id, { x: Math.max(0, Math.min(t.x, L - t.tamanho)), y: Math.max(0, Math.min(t.y, A - t.tamanho)) });
		return true;
	}

	/**
	 * Reenquadrar a cena (só o Mestre): `dx` colunas entram à esquerda e `dy` linhas em cima (negativo: saem) e a cena
	 * passa a ter `largura` × `altura`. Tokens, objetos, terreno, névoa e efeitos andam junto e ficam no mesmo lugar do mapa
	 * (os traços do lápis ficam onde estão). `fundo` é onde a imagem fica na cena nova, pela conta do quadro.
	 */
	async reenquadrarCena(dx: number, dy: number, largura: number, altura: number, fundo: Partial<MesaCena>) {
		const c = this.cena;
		if (!this.mestre || this.somenteLeitura || !c) return false;
		const L = Math.min(200, Math.max(5, Math.round(largura)));
		const A = Math.min(200, Math.max(5, Math.round(altura)));
		const terreno = deslocarQuadrados(Array.isArray(c.terreno) ? c.terreno : [], dx, dy, L, A);
		const reveladas = deslocarRuns(Array.isArray(c.reveladas) ? c.reveladas : [], dx, dy, L, A);
		if (!(await this.patchCena({ largura: L, altura: A, terreno, reveladas, ...fundo }))) return false;
		const tokens = this.tokens.map((t) => [t, deslocarToken(t, dx, dy, L, A)] as const).filter(([t, [x, y]]) => x !== t.x || y !== t.y);
		await Promise.all(tokens.map(([t, [x, y]]) => this.atualizarToken(t.id, { x, y })));
		if (dx || dy) {
			await Promise.all(this.objetos.map((o) => this.atualizarObjeto(o.id, { x: o.x + dx, y: o.y + dy })));
			for (const e of this.efeitos) {
				const patch = { quadrados: deslocarQuadrados(e.quadrados, dx, dy, L, A), rotulo_x: e.rotulo_x + dx, rotulo_y: e.rotulo_y + dy };
				this.efeitos = this.efeitos.map((k) => (k.id === e.id ? { ...k, ...patch } : k));
				await sb().from('mesa_efeitos').update(patch).eq('id', e.id);
			}
		}
		return true;
	}

	/** Mostra uma mudança da cena só nesta tela, sem gravar (o controle que se arrasta usa; ao soltar, `patchCena` grava). */
	previa(patch: Partial<MesaCena>) {
		if (this.cenaId) this.cenas = this.cenas.map((c) => (c.id === this.cenaId ? { ...c, ...patch } : c));
	}

	/** Terreno difícil (só o Mestre): a lista inteira de quadrados da cena. */
	definirTerreno(quadrados: [number, number][]) {
		return this.patchCena({ terreno: quadrados.slice(0, 10000) });
	}

	async definirCor(cor: CorMesa) {
		const antes = this.membros;
		this.membros = this.membros.map((m) => (m.id === this.eu ? { ...m, cor } : m));
		const { error } = await sb().rpc('definir_cor', { campanha: this.campanha, cor });
		if (error) {
			this.membros = antes;
			toasts.mostrar(/outra pessoa/.test(error.message) ? 'Essa cor já é de outra pessoa da campanha.' : 'Não foi possível trocar a cor.', 'erro');
		}
	}

	/** A moldura vai no perfil (vale em todas as campanhas) e chega na hora a quem está na mesa. */
	async definirMoldura(id: string | null) {
		const antes = this.membros;
		this.membros = this.membros.map((m) => (m.id === this.eu ? { ...m, moldura: id } : m));
		const { error } = await sessao.salvarPreferencias({ moldura: id });
		if (error) {
			this.membros = antes;
			return void toasts.mostrar('Não foi possível trocar a moldura.', 'erro');
		}
		this.enviar('moldura', id, true);
	}

	/** A moldura da campanha (só o Mestre): fica na campanha e chega na hora a quem está na mesa. */
	async definirMolduraMesa(id: string | null, universal: boolean) {
		const antes = this.molduraMesa;
		this.molduraMesa = { id, universal };
		const { error } = await sb().from('campanhas').update({ moldura: id, moldura_universal: universal }).eq('id', this.campanha);
		if (error) {
			this.molduraMesa = antes;
			return void toasts.mostrar('Não foi possível trocar a moldura da mesa.', 'erro');
		}
		this.enviar('moldura-mesa', { id, universal }, true);
	}

	// ------------------------------------------------------------------ crescer (Baika no Jutsu, Lobo de Duas Cabeças)
	/**
	 * O token cresce a partir de onde está e guarda o tamanho normal; os turnos contam a cada rodada nova. O espaço novo
	 * cobre o antigo: entre esses encaixes, o livre mais perto do centro; sem nenhum livre, o do centro (o Mestre ajeita).
	 */
	crescer(t: MesaToken, n: 3 | 6 | 10, turnos: number | null) {
		const d = Math.floor((n - t.tamanho) / 2);
		const L = this.cena?.largura ?? 40;
		const A = this.cena?.altura ?? 30;
		const livre = (x: number, y: number) =>
			x >= 0 && y >= 0 && x + n <= L && y + n <= A && !this.tokens.some((o) => o.id !== t.id && x < o.x + o.tamanho && o.x < x + n && y < o.y + o.tamanho && o.y < y + n);
		const encaixes: { x: number; y: number }[] = [];
		for (let x = t.x + t.tamanho - n; x <= t.x; x++) for (let y = t.y + t.tamanho - n; y <= t.y; y++) if (livre(x, y)) encaixes.push({ x, y });
		const perto = (p: { x: number; y: number }) => Math.abs(p.x - (t.x - d)) + Math.abs(p.y - (t.y - d));
		const lugar = encaixes.sort((a, b) => perto(a) - perto(b))[0] ?? this.dentro(t.x - d, t.y - d, n);
		return this.atualizarToken(t.id, { tamanho: n, tamanho_base: t.tamanho_base ?? t.tamanho, crescido_turnos: turnos, ...lugar }, 'Não foi possível crescer o token.');
	}

	voltarAoNormal(t: MesaToken) {
		if (t.tamanho_base == null) return Promise.resolve(false);
		const d = Math.floor((t.tamanho - t.tamanho_base) / 2);
		return this.atualizarToken(t.id, { tamanho: t.tamanho_base, tamanho_base: null, crescido_turnos: null, ...this.dentro(t.x + d, t.y + d, t.tamanho_base) });
	}

	private dentro(x: number, y: number, n: number) {
		const L = this.cena?.largura ?? 40;
		const A = this.cena?.altura ?? 30;
		return { x: Math.max(0, Math.min(x, L - n)), y: Math.max(0, Math.min(y, A - n)) };
	}
}
