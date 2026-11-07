// L11 · Mesa: o estado de uma cena no navegador. O que fica salvo (tokens, traços, efeitos, a cena) chega ao vivo pelo
// postgres_changes, já filtrado pelo RLS, e o que alguém faz vai antes pelo broadcast, porque o banco está longe (ver espelho.ts).
// O que é passageiro (o arrasto dos outros, a régua sendo medida, o Apontar, o molde de jutsu) só vai por broadcast, no canal
// da campanha, e a presença diz quem está na mesa.
import type { RealtimeChannel, RealtimePostgresChangesPayload } from '@supabase/supabase-js';
import { sessao } from '#lib/estado/sessao.svelte.ts';
import { toasts } from '#lib/estado/toasts.svelte.ts';
import { ordemIniciativa } from '#lib/rolagens/registro.ts';
import { supabase } from '#lib/supabase/cliente.ts';
import type { CorMesa, EntradaDiario, IniciativaCena, MesaArte, MesaCena, MesaCenaPasta, MesaEfeito, MesaJukebox, MesaObjeto, MesaToken, MesaTraco, Papel, Rolagem } from '#lib/supabase/banco.ts';
import { cenaDoAviso, mascararCena } from './cenas.ts';
import { camposDe, Frescos, parteDaCena, parteDoToken, TABELAS_DO_ESPELHO, tokenPublico, type TabelaDoEspelho } from './espelho.ts';
import { limitarPosicao } from './musica.ts';
import { limpar as limparRuns } from './nevoa.ts';
import { coresDosMembros } from './cores.ts';
import { colocarNaOrdem, juntarManuais, tirarDaOrdem, trocarManual } from './iniciativa.ts';
import { deslocarQuadrados, deslocarRuns, deslocarToken } from './reenquadrar.ts';
import { lerAjustes, lerCenaMiniaturas, rumoDoPasso, type AjusteMiniaturas, type CenaMiniaturas } from './miniaturas.ts';
import { alturaAoAndar, proximoNivel } from './mapa-vivo.ts';
import { bloqueiaPasso, deslocarLuzes, deslocarParedes, ehPorta, limparLuzes, limparParedes, type Luz, type Parede } from './luz.ts';
import { avancarRodada, relogiosDaCena, type Relogio } from './relogios.ts';
import type { Quadrado } from './geometria.ts';
import { molduraDoToken, molduraPorId } from './molduras.ts';
import { NOME_OCULTO, nomeReal, siglaDoNome } from './nomes.ts';

export type Ferramenta = 'mover' | 'medir' | 'lapis' | 'apontar' | 'borracha' | 'terreno' | 'fundo' | 'alfinete' | 'texto' | 'objeto' | 'nevoa' | 'paredes' | 'luz';

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

type Desfazer = { tipo: 'mover'; id: string; x: number; y: number; movido: number; elevacao: number } | { tipo: 'traco'; id: string } | { tipo: 'objeto'; id: string };


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
	/** O tamanho das miniaturas na campanha (todas e cada uma); null enquanto a migração não roda. */
	miniaturasAjuste = $state<AjusteMiniaturas | null>(null);
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
	/** "Olhem aqui": o Mestre puxou a vista de todos para este ponto (t muda a cada pedido). */
	olhar = $state<{ x: number; y: number; t: number } | null>(null);
	/** Diário do grupo: as entradas que esta pessoa pode ler; null = ainda não carregado; false = a tabela não existe. */
	diario = $state<EntradaDiario[] | null | false>(null);

	private canal: RealtimeChannel | null = null;
	private desfazer: Desfazer[] = [];
	private ultimoEnvio: Record<string, number> = {};
	/** O que esta tela mudou ou recebeu pelo canal há pouco, por token e por cena: um aviso atrasado do banco não desfaz. */
	private frescos = new Frescos((ms) => this.anotarAtraso(ms));
	private atrasos: number[] = [];
	/** Quanto o banco leva para confirmar o que o canal já trouxe. A cada 20 confirmações, uma linha no console, para medir numa sessão de verdade. */
	private anotarAtraso(ms: number) {
		this.atrasos.push(ms);
		if (this.atrasos.length < 20) return;
		console.info(`[mesa] o aviso do banco chega ${[...this.atrasos].sort((a, b) => a - b)[10]} ms depois (mediana de 20)`);
		this.atrasos = [];
	}

	/** O que o mapa vivo sabe do relevo: onde dá para ficar em pé e que paredes valem em cada altura. Null numa cena comum. */
	relevo = $state.raw<{ niveis: (x: number, y: number) => number[]; paredes: (metros: number) => readonly Parede[] } | null>(null);

	cena = $derived(this.cenas.find((c) => c.id === this.cenaId) ?? null);
	private paredesFixas: { chave: string; lista: Parede[] } = { chave: '[]', lista: [] };
	/**
	 * As paredes e as fontes de luz da cena, já limpas (vazias enquanto a migração não roda; ver luz.ts). A lista só muda quando as paredes mudam: o Mestre grava o que o
	 * grupo explorou a cada parada, e a visão de todos guarda o que já calculou enquanto a lista é a mesma.
	 */
	paredes = $derived.by<Parede[]>(() => {
		const lista = this.cena ? limparParedes(this.cena.paredes, this.cena.largura, this.cena.altura) : [];
		const chave = JSON.stringify(lista);
		if (chave !== this.paredesFixas.chave) this.paredesFixas = { chave, lista };
		return this.paredesFixas.lista;
	});
	luzes = $derived<Luz[]>(limparLuzes(this.cena?.luzes));
	cores = $derived(coresDosMembros(this.membros));
	// a iniciativa e o terreno vêm do banco e do Realtime: qualquer formato inesperado vira vazio, nunca uma exceção
	iniciativa = $derived<IniciativaCena>(this.cena?.iniciativa && typeof this.cena.iniciativa === 'object' && !Array.isArray(this.cena.iniciativa) ? this.cena.iniciativa : {});
	/** Quadrados de terreno difícil da cena, como "x,y" */
	terreno = $derived(new Set((Array.isArray(this.cena?.terreno) ? this.cena.terreno : []).map(([x, y]) => `${x},${y}`)));
	get travada() {
		return !!this.cena?.travada && !this.mestre;
	}
	/** Os relógios da cena, e se o banco já tem a coluna (sem ela, a ferramenta não aparece). */
	relogios = $derived<Relogio[]>(relogiosDaCena(this.cena?.relogios));
	temRelogios = $derived(this.cena?.relogios !== undefined);
	/** A Reação da rodada só aparece quando o banco já tem a coluna nos tokens. */
	temReacao = $derived(this.tokens.some((t) => t.reagiu !== undefined));

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
		/** campanhas.miniaturas (undefined sem a migração) */
		miniaturas?: unknown;
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
		this.miniaturasAjuste = d.miniaturas === undefined ? null : lerAjustes(d.miniaturas);
	}

	corDe = (usuario: string | null | undefined): CorMesa | null => (usuario ? (this.cores.get(usuario) ?? null) : null);
	membro = (usuario: string | null | undefined) => this.membros.find((m) => m.id === usuario) ?? null;
	/** Dono do token para a cor: o jogador; tokens do Mestre (NPCs) usam a cor do Mestre. */
	donoDe = (t: MesaToken) => t.dono_id ?? this.membros.find((m) => m.papel === 'mestre')?.id ?? null;
	molduraDe = (t: MesaToken) => molduraDoToken(this.molduraMesa, t.dono_id ? this.membro(t.dono_id) : null);
	podeMover = (t: MesaToken) => !this.somenteLeitura && (this.mestre || (t.dono_id === this.eu && !this.travada));

	// ------------------------------------------------------------------ tempo real
	/** A entrada em andamento: quem sai da mesa antes do login chegar ao Realtime cancela a entrada. */
	private entrada = 0;
	/** O canal privado recusou esta sessão: a Mesa segue pelo canal aberto (ver usarCanalAberto). */
	private canalAberto = false;
	/** Recusas seguidas: uma só pode ser o login renovando depois de a aba dormir. */
	private recusas = 0;

	conectar() {
		if (this.canal || !this.cenaId) return;
		const vez = ++this.entrada;
		// o canal privado confere a permissão ao entrar, com o login de quem entra: ele precisa chegar ao Realtime antes
		const login = sb().realtime.setAuth().catch(() => undefined);
		void Promise.race([login, new Promise((f) => setTimeout(f, 3000))]).then(() => {
			if (vez === this.entrada) this.entrar();
		});
	}

	/**
	 * Se o canal privado recusar alguém da campanha, a mesa não pode parar no meio da sessão: ela volta para o canal aberto,
	 * que continua existindo mas não se mistura com o privado. O aviso vai ao Mestre e aos logs, porque isso não devia acontecer.
	 */
	private usarCanalAberto(motivo: string) {
		this.canalAberto = true;
		this.tentativas = 0;
		console.error('[mesa] canal privado recusado', motivo);
		if (this.mestre) toasts.mostrar('A Mesa não entrou no canal privado e segue pelo canal aberto.', 'erro');
		try {
			navigator.sendBeacon?.('/api/erro', new Blob([JSON.stringify({ rota: 'mesa', detalhe: `canal privado recusado: ${motivo}`.slice(0, 300) })], { type: 'application/json' }));
		} catch {
			// sem rede: fica só no console
		}
	}

	private entrar() {
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
					const aviso = p.new as unknown as MesaToken;
					if (aviso.cena_id !== cena) return;
					const velho = this.tokens.find((t) => t.id === aviso.id);
					const { linha: novo, confirmados } = this.frescos.filtrar(aviso.id, aviso, velho);
					this.tokens = lista(this.tokens, this.comNome(novo));
					// a cada mudança no estado da ficha, o banco regrava o token do personagem (a faixa de ferimento e os estados):
					// um aviso do token sem ele ter andado nem mudado de forma é a ficha mudando em outra tela. O eco de um passo que
					// o canal já trouxe também chega com o token no mesmo lugar, e esse não é a ficha
					const eco = confirmados.has('x') || confirmados.has('y');
					const parado = velho && !eco && velho.x === novo.x && velho.y === novo.y && velho.tamanho === novo.tamanho && velho.visivel === novo.visivel && velho.elevacao === novo.elevacao;
					if (novo.personagem_id && parado) this.aoMudarFicha?.(novo.personagem_id);
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
					const antiga = this.cenas.find((x) => x.id === (p.new as { id?: string }).id);
					const aviso = cenaDoAviso(p.new as unknown as MesaCena, antiga);
					const c = mascararCena(this.frescos.filtrar(`cena:${aviso.id}`, aviso, antiga).linha, this.mestre);
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
		const canal: RealtimeChannel = (this.canal = sb()
			.channel(`mesa:${this.campanha}`, { config: { private: !this.canalAberto, broadcast: { self: false }, presence: { key: this.eu } } })
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
			// o caminho rápido: o mesmo que o banco vai avisar, antes dele (ver espelho.ts)
			.on('broadcast', { event: 'token' }, ({ payload }) => this.receberToken(payload))
			.on('broadcast', { event: 'tokens' }, ({ payload }) => this.receberTokens(payload))
			.on('broadcast', { event: 'cena' }, ({ payload }) => this.receberCena(payload))
			.on('broadcast', { event: 'porta' }, ({ payload }) => this.receberPorta(payload))
			.on('broadcast', { event: 'linha' }, ({ payload }) => {
				const { tabela, linha } = payload as { tabela: TabelaDoEspelho; linha: Record<string, unknown> };
				if (TABELAS_DO_ESPELHO.includes(tabela) && linha?.id) rotear({ table: tabela, eventType: 'INSERT', new: linha, old: {} } as unknown as RealtimePostgresChangesPayload<Record<string, unknown>>);
			})
			.on('broadcast', { event: 'fora' }, ({ payload }) => {
				const { tabela, ids } = payload as { tabela: TabelaDoEspelho; ids: string[] };
				if (!TABELAS_DO_ESPELHO.includes(tabela) || !Array.isArray(ids)) return;
				for (const id of ids) rotear({ table: tabela, eventType: 'DELETE', new: {}, old: { id } } as unknown as RealtimePostgresChangesPayload<Record<string, unknown>>);
			})
			.on('broadcast', { event: 'pulso' }, ({ payload }) => (this.pulso = { token: (payload as { token: string }).token, t: Date.now() }))
			.on('broadcast', { event: 'ping' }, ({ payload }) => this.receberPing(payload as { id: string; usuario: string; x: number; y: number }))
			// "Olhem aqui": só o Mestre puxa a vista dos outros
			.on('broadcast', { event: 'olhar' }, ({ payload }) => {
				const { usuario, dados } = payload as { usuario: string; dados: { x: number; y: number } };
				if (this.membro(usuario)?.papel !== 'mestre' || !Number.isFinite(dados?.x) || !Number.isFinite(dados?.y)) return;
				this.olhar = { x: dados.x, y: dados.y, t: Date.now() };
				this.receberPing({ id: crypto.randomUUID(), usuario, x: dados.x, y: dados.y });
			})
			// o tamanho das miniaturas: só o Mestre muda, e chega na hora a quem está na mesa
			.on('broadcast', { event: 'miniaturas' }, ({ payload }) => {
				const { usuario, dados } = payload as { usuario: string; dados: unknown };
				if (this.membro(usuario)?.papel === 'mestre' && this.miniaturasAjuste) this.miniaturasAjuste = lerAjustes(dados);
			})
			.on('broadcast', { event: 'moldura-mesa' }, ({ payload }) => {
				const { usuario, dados } = payload as { usuario: string; dados: { id: string | null; universal: boolean } };
				if (this.membro(usuario)?.papel === 'mestre') this.molduraMesa = { id: molduraPorId(dados.id)?.id ?? null, universal: !!dados.universal };
			})
			.on('broadcast', { event: 'moldura' }, ({ payload }) => {
				const { usuario, dados } = payload as { usuario: string; dados: string | null };
				this.membros = this.membros.map((m) => (m.id === usuario ? { ...m, moldura: molduraPorId(dados)?.id ?? null } : m));
			})
			.on('presence', { event: 'sync' }, () => {
				this.online = Object.keys(this.canal?.presenceState() ?? {});
				this.limparQuemSaiu();
			})
			.subscribe((status, erro) => {
				if (this.canal !== canal) return;
				const caiu = !this.conectado;
				this.conectado = status === 'SUBSCRIBED';
				if (status === 'CHANNEL_ERROR' && !this.canalAberto && /unauthorized|permission/i.test(erro?.message ?? '') && ++this.recusas >= 2) this.usarCanalAberto(erro?.message ?? '');
				// o servidor fechou o canal (limite de mensagens, queda longa): o Supabase não volta sozinho
				if (status === 'CLOSED' || status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') return void this.reconectarDepois(canal);
				if (status !== 'SUBSCRIBED') return;
				this.tentativas = 0;
				this.recusas = 0;
				this.canal?.track({ em: Date.now() });
				// voltou depois de cair (wifi, aba dormindo): o que mudou enquanto isso não chega pelo tempo real
				if (caiu && this.jaConectou) void this.ressincronizar(true);
				// na primeira entrada, o que mudou entre o servidor montar a página e o canal abrir
				else if (!this.jaConectou) void this.conferir();
				this.jaConectou = true;
			}));
		if (this.cena?.mostrar_pv && !this.mestre) this.lerPvs();
		this.vigiar();
	}

	/** Quantas vezes seguidas o canal caiu (a espera para religar dobra a cada uma, até 30 s). */
	private tentativas = 0;
	private religar: ReturnType<typeof setTimeout> | undefined;
	private reconectarDepois(canal: RealtimeChannel) {
		clearTimeout(this.religar);
		const ms = Math.min(30000, 1000 * 2 ** this.tentativas++) * (0.75 + Math.random() * 0.5);
		this.religar = setTimeout(() => {
			if (this.canal !== canal) return;
			this.canal = null;
			void sb().removeChannel(canal);
			// o canal novo, ao entrar, relê a cena (jaConectou continua valendo)
			this.conectar();
		}, ms);
	}

	/** Quantos avisos cabem agora: enche 8 por segundo, até 12. */
	private folga = 12;
	private folgaEm = 0;
	/**
	 * Manda pelo canal o que o banco ainda vai avisar. Sem canal, fica o aviso do banco, e também numa leva grande (reenquadrar a cena, o fim do combate): cada mensagem conta
	 * uma vez para cada um na mesa, e passar do limite faz o servidor fechar o canal, o que custa bem mais que meio segundo.
	 */
	private avisar(evento: 'token' | 'tokens' | 'cena' | 'porta' | 'linha' | 'fora', payload: unknown) {
		if (!this.canal || !this.conectado) return;
		const agora = Date.now();
		this.folga = Math.min(12, this.folga + ((agora - this.folgaEm) / 1000) * 8);
		this.folgaEm = agora;
		if (this.folga < 1) return;
		this.folga--;
		void this.canal.send({ type: 'broadcast', event: evento, payload });
	}
	private espelharToken(t: MesaToken, patch: Partial<MesaToken>) {
		const parte = t.visivel ? parteDoToken(patch) : null;
		if (parte) this.avisar('token', { id: t.id, ...parte });
	}
	private espelharCena(c: MesaCena | null, patch: Partial<MesaCena>) {
		// uma cena em preparo não está nas telas de quem joga, e o grupo não pode ler o que há nela
		const parte = c?.ativa && this.mestre ? parteDaCena(patch) : null;
		if (parte) this.avisar('cena', { usuario: this.eu, id: c!.id, patch: parte });
	}
	private receberToken(p: unknown) {
		const t = this.tokens.find((k) => k.id === (p as { id?: string } | null)?.id);
		const parte = t ? parteDoToken(p) : null;
		if (!t || !parte) return;
		this.trocar(t.id, parte);
		if (parte.ferimento !== undefined && this.cena?.mostrar_pv && !this.mestre) this.lerPvs();
	}
	private receberTokens(p: unknown) {
		const { ids, patch } = (p ?? {}) as { ids?: string[]; patch?: unknown };
		const parte = parteDoToken(patch);
		if (Array.isArray(ids) && parte) this.trocarVarios(ids, parte);
	}
	private receberCena(p: unknown) {
		const { usuario, id, patch } = (p ?? {}) as { usuario?: string; id?: string; patch?: unknown };
		const atual = this.cenas.find((c) => c.id === id);
		const parte = atual ? parteDaCena(patch) : null;
		if (!atual || !parte || this.membro(usuario)?.papel !== 'mestre') return;
		this.frescos.marcar(`cena:${atual.id}`, parte);
		this.cenas = this.cenas.map((c) => (c.id === atual.id ? cenaDoAviso({ ...c, ...parte }, c) : c));
	}
	private receberPorta(p: unknown) {
		const { cena, i, x1, y1, tipo } = (p ?? {}) as { cena?: string; i?: number; x1?: number; y1?: number; tipo?: number };
		const q = this.cenas.find((c) => c.id === cena)?.paredes?.[i ?? -1];
		// a mesma porta: a lista pode ter mudado no caminho, e o banco acerta o resto
		if (q && q[0] === x1 && q[1] === y1 && ehPorta(q[4]) && ehPorta(tipo ?? -1)) this.trocarPorta(cena!, i!, tipo!);
	}
	private trocarPorta(cena: string, i: number, tipo: number) {
		const c = this.cenas.find((x) => x.id === cena);
		if (!c?.paredes) return;
		const paredes = c.paredes.map((q, k) => (k === i ? ([q[0], q[1], q[2], q[3], tipo] as Parede) : q));
		this.frescos.marcar(`cena:${cena}`, { paredes });
		this.cenas = this.cenas.map((x) => (x.id === cena ? { ...x, paredes } : x));
	}

	/**
	 * Redes de segurança do tempo real. A aba em segundo plano tem os relógios atrasados pelo navegador e a conexão pode cair
	 * sem aviso; o que mudou nesse meio-tempo se perde. Ao voltar para a aba (depois de 5 s escondida), a cena é relida; e,
	 * com a aba à vista, uma releitura silenciosa a cada 45 s pega algum aviso perdido.
	 */
	private escondidaDesde = 0;
	private vigia: ReturnType<typeof setInterval> | undefined;
	private aoMudarVisibilidade = () => {
		if (document.visibilityState === 'hidden') return void (this.escondidaDesde = Date.now());
		if (this.escondidaDesde && Date.now() - this.escondidaDesde > 5000) void this.ressincronizar();
		this.escondidaDesde = 0;
	};
	private vigiar() {
		if (typeof document === 'undefined') return;
		document.addEventListener('visibilitychange', this.aoMudarVisibilidade);
		clearInterval(this.vigia);
		// a cada 12 s, a conferência leve (tokens e a cena); a cada 45 s, tudo. Vale também com a conexão caída
		let voltas = 0;
		this.vigia = setInterval(() => {
			if (document.visibilityState !== 'visible') return;
			if (++voltas % 4 === 0) void this.ressincronizar();
			else void this.conferir();
		}, 12000);
	}

	desconectar() {
		this.entrada++;
		if (typeof document !== 'undefined') document.removeEventListener('visibilitychange', this.aoMudarVisibilidade);
		clearInterval(this.vigia);
		clearTimeout(this.religar);
		this.tentativas = 0;
		// o canal sai daqui antes de ser removido: o CLOSED que vem depois não pede para religar
		const [canal, diario] = [this.canal, this.canalDiario];
		this.canal = null;
		this.canalDiario = null;
		if (canal) void sb().removeChannel(canal);
		if (diario) void sb().removeChannel(diario);
		this.jaConectou = false;
	}

	/** O canal já entrou uma vez: um novo SUBSCRIBED depois de cair pede para reler a cena. */
	private jaConectou = false;
	/**
	 * Relê o que fica salvo da cena (tokens, traços, efeitos, objetos, as cenas e a música): depois de a conexão cair e
	 * voltar (avisar = true: a página mostra um aviso), ao voltar para a aba e de tempos em tempos (em silêncio).
	 */
	async ressincronizar(avisar = false) {
		const cena = this.cenaId;
		if (!cena) return;
		const [tk, tr, ef, ob, cs, jk] = await Promise.all([
			sb().from('mesa_tokens').select('*').eq('cena_id', cena).order('criado_em'),
			sb().from('mesa_tracos').select('*').eq('cena_id', cena).order('criado_em'),
			sb().from('mesa_efeitos').select('*').eq('cena_id', cena).order('criado_em'),
			sb().from('mesa_objetos').select('*').eq('cena_id', cena).order('criado_em'),
			sb().from('mesa_cenas').select('*').eq('campanha_id', this.campanha).order('criada_em'),
			sb().from('mesa_jukebox').select('*').eq('campanha_id', this.campanha).maybeSingle()
		]);
		// trocou de cena no meio (ou a resposta é de outra): fica o que está
		if (cena !== this.cenaId) return;
		// só troca o que mudou: uma releitura igual não refaz a visão nem o quadro, e o que acabou de mudar aqui vale mais que uma leitura que pode ser de antes
		const igual = (a: unknown, b: unknown) => JSON.stringify(a) === JSON.stringify(b);
		if (tk.data) this.aplicarTokens(tk.data as MesaToken[]);
		if (tr.data && !igual(tr.data, this.tracos)) this.tracos = tr.data as MesaTraco[];
		if (ef.data && !igual(ef.data, this.efeitos)) this.efeitos = ef.data as MesaEfeito[];
		if (ob.data && !igual(ob.data, this.objetos)) this.objetos = ob.data as MesaObjeto[];
		if (cs.data) {
			const lidas = (cs.data as MesaCena[]).map((c) => this.cenaLida(c));
			if (!igual(lidas, this.cenas)) this.cenas = lidas;
			const atual = this.cenas.find((c) => c.id === cena);
			// a cena foi apagada, ou o Mestre ativou outra enquanto a conexão estava fora: quem joga vai junto
			if (!this.mestre && (!atual || this.cenas.some((c) => c.ativa && c.id !== cena))) this.trocouCena++;
		}
		if (!jk.error) this.jukebox = (jk.data as MesaJukebox | null) ?? null;
		if (this.cena?.mostrar_pv && !this.mestre) this.lerPvs();
		this.aoRessincronizar?.(avisar);
	}
	/** Uma leitura dos tokens, sem voltar o que acabou de mudar aqui: a resposta pode ser de antes da gravação. */
	private aplicarTokens(linhas: MesaToken[]) {
		const novos = linhas.map((t) => this.comNome(this.frescos.filtrar(t.id, t, this.tokens.find((k) => k.id === t.id)).linha));
		if (JSON.stringify(novos) !== JSON.stringify(this.tokens)) this.tokens = novos;
	}
	/** Uma cena lida do banco, sem voltar o que acabou de mudar aqui. */
	private cenaLida(c: MesaCena) {
		return mascararCena(this.frescos.filtrar(`cena:${c.id}`, c, this.cenas.find((x) => x.id === c.id)).linha, this.mestre);
	}
	/**
	 * Conferência leve: os tokens e a cena atual. Sob carga, o tempo real às vezes descarta avisos sem fechar o canal (visto
	 * no teste de estresse); assim nada fica diferente do banco por mais que uns segundos.
	 */
	async conferir() {
		const cena = this.cenaId;
		if (!cena) return;
		const [tk, c] = await Promise.all([sb().from('mesa_tokens').select('*').eq('cena_id', cena).order('criado_em'), sb().from('mesa_cenas').select('*').eq('id', cena).maybeSingle()]);
		if (cena !== this.cenaId) return;
		if (tk.data) this.aplicarTokens(tk.data as MesaToken[]);
		if (c.data) {
			const nova = this.cenaLida(c.data as MesaCena);
			if (JSON.stringify(nova) !== JSON.stringify(this.cena)) this.cenas = this.cenas.map((x) => (x.id === cena ? nova : x));
		}
	}
	/** A página relê o que é dela (as fichas) junto com a cena; `avisar`: a conexão tinha caído. */
	aoRessincronizar: ((avisar: boolean) => void) | null = null;
	/** A ficha de um personagem da cena mudou (pelo token, que o banco atualiza junto): a página relê o estado dela. */
	aoMudarFicha: ((personagem: string) => void) | null = null;

	/** Quem saiu da mesa (fechou a aba, caiu) não deixa para trás o fantasma do arrasto, a régua ou a mira de jutsu. */
	private limparQuemSaiu() {
		const on = new Set(this.online);
		const sem = <T>(r: Record<string, T>) => {
			const fora = Object.keys(r).filter((u) => !on.has(u));
			if (!fora.length) return r;
			const novo = { ...r };
			for (const u of fora) delete novo[u];
			return novo;
		};
		this.fantasmas = sem(this.fantasmas);
		this.reguas = sem(this.reguas);
		this.moldes = sem(this.moldes);
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

	/** "Olhem aqui" (só o Mestre): a vista de todos vai até o ponto, com um ping nele. */
	olharTodos(x: number, y: number) {
		if (!this.mestre) return;
		const p = { x: Math.round(x * 100) / 100, y: Math.round(y * 100) / 100 };
		this.receberPing({ id: crypto.randomUUID(), usuario: this.eu, ...p });
		this.enviar('olhar', p, true);
	}

	/**
	 * Manda o que é passageiro, no máximo 12 vezes por segundo (o último estado sempre sai: null limpa). É a maior parte do
	 * tráfego do tempo real: com vários arrastando juntos, 20 por segundo estourava o limite e o servidor fechava o canal.
	 */
	enviar(evento: 'fantasma' | 'regua' | 'molde' | 'apontar' | 'pulso' | 'ping' | 'moldura' | 'moldura-mesa' | 'olhar' | 'miniaturas', dados: unknown, forcar = false) {
		if (!this.canal || !this.conectado) return;
		const agora = Date.now();
		// o molde pode ter mais de mil quadrados: vai no máximo 6 vezes por segundo; o resto, 12
		if (!forcar && dados != null && agora - (this.ultimoEnvio[evento] ?? 0) < (evento === 'molde' ? 160 : 80)) return;
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

	/** Quem pode entrar na ordem: cada personagem e cada NPC em cena uma vez (a tropa joga junta), sem os clones. */
	participantes = $derived.by(() => {
		const vistos = new Map<string, { chave: string; nome: string }>();
		for (const t of this.tokens) {
			const chave = t.personagem_id ?? t.npc_id;
			if (chave && !ehClone(t) && !vistos.has(chave)) vistos.set(chave, { chave, nome: t.nome_oculto ? NOME_OCULTO : t.nome });
		}
		return [...vistos.values()];
	});

	/** Uma entrada da ordem, ligada ao personagem ou ao NPC em cena (é por ela que o token da vez se acende). */
	private entradaDa(chave: string, nome: string, valor: number) {
		const pc = this.tokens.some((t) => t.personagem_id === chave);
		const npc = this.tokens.some((t) => t.npc_id === chave);
		return { nome, valor, personagem_id: pc ? chave : null, npc_id: npc ? chave : null };
	}

	async comecarCombate(rolagens: Rolagem[]) {
		const ini = this.iniciativa;
		const roladas = ordemIniciativa(rolagens, this.campanha, 6, new Date(), ini.limpa_em ?? null);
		const ordem = juntarManuais(roladas, ini.manuais ?? []).map((o) => this.entradaDa(o.chave, o.quem, o.total));
		if (!ordem.length) {
			toasts.mostrar('Ninguém tem iniciativa ainda. Peça para cada um rolar pela ficha rápida ou digite os números aqui.', 'aviso');
			return;
		}
		await this.patchCena({ iniciativa: { ativa: true, rodada: 1, vez: 0, ordem, manuais: ini.manuais } });
		await Promise.all([this.zerarMovido(), this.zerarReacoes()]);
	}

	/**
	 * O Mestre muda a iniciativa de alguém ou põe alguém da cena na ordem sem rolar: o número vale no lugar do dado. Durante
	 * o combate, a pessoa vai para o lugar do número novo. `null` apaga o número: fora do combate, volta ao que foi rolado;
	 * no combate, a pessoa sai da ordem.
	 */
	async definirIniciativa(quem: { chave: string; nome: string }, valor: number | null) {
		const ini = this.iniciativa;
		const manuais = trocarManual(ini.manuais ?? [], quem.chave, quem.nome, valor);
		if (!ini.ativa) return this.patchCena({ iniciativa: { ...ini, manuais } });
		const [ordem, vez] = [ini.ordem ?? [], ini.vez ?? 0];
		const nova = valor === null ? tirarDaOrdem(ordem, vez, quem.chave) : colocarNaOrdem(ordem, vez, this.entradaDa(quem.chave, quem.nome, valor));
		return this.patchCena({ iniciativa: { ...ini, manuais, ...nova } });
	}

	async proximoTurno() {
		const i = this.iniciativa;
		if (!i.ativa || !i.ordem?.length) return;
		const virou = (i.vez ?? 0) + 1 >= i.ordem.length;
		const vez = virou ? 0 : (i.vez ?? 0) + 1;
		const rodada = (i.rodada ?? 1) + (virou ? 1 : 0);
		// a vez muda primeiro, para todos: é o que a mesa espera ver, e o resto da rodada vem em seguida. Os relógios que
		// contam rodadas andam junto (na mesma gravação da cena)
		const relogios = virou ? avancarRodada(this.relogios) : null;
		const turno = this.patchCena({ iniciativa: { ...i, vez, rodada }, ...(relogios ? { relogios } : {}) });
		const movido = this.zerarMovido();
		if (virou) await this.rodadaNova();
		await Promise.all([turno, movido]);
	}

	private async rodadaNova() {
		// os efeitos em cena perdem um turno e somem no zero (um efeito de 3 turnos lançado na rodada 1 vale nas
		// rodadas 1, 2 e 3). A tela muda na hora; o banco vai em seguida.
		const comTurnos = this.efeitos.filter((x) => x.turnos != null);
		const acabam = comTurnos.filter((e) => e.turnos! <= 1).map((e) => e.id);
		this.efeitos = this.efeitos.filter((e) => !acabam.includes(e.id)).map((e) => (e.turnos != null ? { ...e, turnos: e.turnos - 1 } : e));
		if (acabam.length) this.avisar('fora', { tabela: 'mesa_efeitos', ids: acabam });
		await Promise.all([
			...(acabam.length ? [sb().from('mesa_efeitos').delete().in('id', acabam)] : []),
			...comTurnos.filter((x) => x.turnos! > 1).map((e) => sb().from('mesa_efeitos').update({ turnos: e.turnos! - 1 }).eq('id', e.id))
		]);
		// e quem cresceu por um jutsu também: no zero, volta ao tamanho normal; os clones de jutsu com duração em turnos
		// (crescido_turnos guarda o que falta) somem no zero. Tudo de uma vez, sem um token esperar o outro.
		const crescidos = this.tokens.filter((x) => x.tamanho_base != null && x.crescido_turnos != null);
		const clones = this.tokens.filter((x) => ehClone(x) && x.crescido_turnos != null);
		await this.zerarReacoes();
		await Promise.all([
			...crescidos.map((t) => (t.crescido_turnos! <= 1 ? this.voltarAoNormal(t) : this.atualizarToken(t.id, { crescido_turnos: t.crescido_turnos! - 1 }))),
			...clones.map((t) => (t.crescido_turnos! <= 1 ? this.remover(t.id) : this.atualizarToken(t.id, { crescido_turnos: t.crescido_turnos! - 1 })))
		]);
	}

	async encerrarCombate() {
		await this.patchCena({ iniciativa: { ativa: false, limpa_em: this.iniciativa.limpa_em, manuais: this.iniciativa.manuais } });
		// fim do combate: quem estava crescido volta ao normal, e os clones de jutsu se desfazem
		await Promise.all([...this.tokens.filter((x) => x.tamanho_base != null).map((t) => this.voltarAoNormal(t)), ...this.tokens.filter(ehClone).map((t) => this.remover(t.id))]);
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

	/** Rodada nova (ou combate novo): todos os tokens voltam a ter a Reação. */
	private async zerarReacoes() {
		const ids = this.tokens.filter((t) => t.reagiu).map((t) => t.id);
		if (!ids.length) return;
		this.trocarVarios(ids, { reagiu: false });
		this.avisar('tokens', { ids: this.visiveisEntre(ids), patch: { reagiu: false } });
		const { error } = await sb().from('mesa_tokens').update({ reagiu: false }).in('id', ids);
		if (error) toasts.mostrar('Não foi possível zerar as Reações da rodada.', 'erro');
	}
	/** Marca (ou desmarca) a Reação do token nesta rodada: o dono ou o Mestre. */
	marcarReacao(t: MesaToken, reagiu = !t.reagiu) {
		if (t.reagiu === undefined || !!t.reagiu === reagiu || !this.podeMover(t)) return Promise.resolve(false);
		return this.atualizarToken(t.id, { reagiu }, 'Não foi possível marcar a Reação.');
	}

	private async zerarMovido() {
		const ids = this.tokens.filter((t) => t.movido > 0).map((t) => t.id);
		if (!ids.length) return;
		this.trocarVarios(ids, { movido: 0 });
		this.avisar('tokens', { ids: this.visiveisEntre(ids), patch: { movido: 0 } });
		await sb().from('mesa_tokens').update({ movido: 0 }).in('id', ids);
	}
	/** O que está escondido do grupo não passa pelo canal, nem o id. */
	private visiveisEntre = (ids: string[]) => ids.filter((id) => this.tokens.find((t) => t.id === id)?.visivel);

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
	/** O "???" deste NPC (ou ficha de NPC) está ligado? */
	nomeOculto = (id: string) => !!this.ocultos[id];
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
		this.frescos.marcar(id, patch);
		this.tokens = this.tokens.map((t) => (t.id === id ? { ...t, ...patch } : t));
	}
	private trocarVarios(ids: readonly string[], patch: Partial<MesaToken>) {
		for (const id of ids) this.frescos.marcar(id, patch);
		this.tokens = this.tokens.map((t) => (ids.includes(t.id) ? { ...t, ...patch } : t));
	}

	async atualizarToken(id: string, patch: Partial<MesaToken>, erro = 'Não foi possível salvar o token.') {
		const antes = this.tokens.find((t) => t.id === id);
		if (!antes) return false;
		const volta = camposDe(antes, patch);
		this.trocar(id, patch);
		this.espelharToken(antes, patch);
		const { error } = await sb().from('mesa_tokens').update(patch).eq('id', id);
		if (error) {
			this.trocar(id, volta);
			this.espelharToken(antes, volta);
			toasts.mostrar(/travada/i.test(error.message) ? 'Mesa travada pelo Mestre.' : erro, 'erro');
			return false;
		}
		if (this.mestre && patch.visivel === false && antes.visivel) this.canal?.send({ type: 'broadcast', event: 'esconder', payload: { usuario: this.eu, tokens: [id] } });
		// apareceu para o grupo: o nome que está aqui pode ser o verdadeiro, então o de nome escondido espera o banco
		if (this.mestre && patch.visivel === true && !antes.visivel && !antes.nome_oculto) this.avisar('linha', { tabela: 'mesa_tokens', linha: tokenPublico({ ...antes, ...patch }) });
		return true;
	}

	async mover(id: string, x: number, y: number, metros: number) {
		const t = this.tokens.find((k) => k.id === id);
		if (!t || (t.x === x && t.y === y)) return;
		const volta = { tipo: 'mover' as const, id, x: t.x, y: t.y, movido: t.movido, elevacao: t.elevacao ?? 0 };
		const movido = this.daVez.has(id) ? t.movido + metros : 0;
		// a peça vira para onde andou (só com a coluna do rumo: a migração das miniaturas)
		const rumo = t.rumo !== undefined ? (rumoDoPasso(x - t.x, y - t.y) ?? t.rumo) : undefined;
		// num mapa vivo, quem anda acompanha o chão: segue no telhado em que está, ou cai se ele acaba
		const elevacao = this.alturaAo(t, x, y);
		const patch = { x, y, movido, ...(rumo !== undefined ? { rumo } : {}), ...(elevacao !== (t.elevacao ?? 0) ? { elevacao } : {}) };
		if (await this.atualizarToken(id, patch)) this.desfazer.push(volta);
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
		if (criado.visivel) this.avisar('linha', { tabela: 'mesa_tokens', linha: tokenPublico(data as MesaToken) });
		return criado;
	}

	async remover(id: string) {
		const antes = this.tokens;
		const ids = this.visiveisEntre(antes.filter((t) => t.id === id || t.ligado_a === id).map((t) => t.id));
		this.tokens = this.tokens.filter((t) => t.id !== id && t.ligado_a !== id);
		if (ids.length) this.avisar('fora', { tabela: 'mesa_tokens', ids });
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
		this.avisar('linha', { tabela: 'mesa_tracos', linha: data });
	}

	async apagarTraco(id: string) {
		const antes = this.tracos;
		this.tracos = this.tracos.filter((t) => t.id !== id);
		this.avisar('fora', { tabela: 'mesa_tracos', ids: [id] });
		const { error } = await sb().from('mesa_tracos').delete().eq('id', id);
		if (error) this.tracos = antes;
	}

	async limparTracos(todos: boolean) {
		if (!this.cenaId) return;
		const q = sb().from('mesa_tracos').delete().eq('cena_id', this.cenaId);
		const { error } = await (todos ? q : q.eq('autor_id', this.eu));
		if (error) return toasts.mostrar('Não foi possível limpar os traços.', 'erro');
		const ids = this.tracos.filter((t) => todos || t.autor_id === this.eu).map((t) => t.id);
		this.tracos = this.tracos.filter((t) => !ids.includes(t.id));
		this.avisar('fora', { tabela: 'mesa_tracos', ids });
	}

	async deixarEfeito(nome: string, quadrados: Quadrado[], turnos: number | null, rotulo: [number, number], estilo: string | null = null) {
		if (!this.cenaId) return;
		const { data, error } = await sb()
			.from('mesa_efeitos')
			.insert({ cena_id: this.cenaId, nome: nome.slice(0, 60), quadrados, turnos, rotulo_x: rotulo[0], rotulo_y: rotulo[1], estilo })
			.select('*')
			.single();
		if (error || !data) return toasts.mostrar('Não foi possível deixar o efeito na cena.', 'erro');
		this.efeitos = this.efeitos.some((e) => e.id === data.id) ? this.efeitos : [...this.efeitos, data as MesaEfeito];
		this.avisar('linha', { tabela: 'mesa_efeitos', linha: data });
	}

	/** Quem pode tirar o efeito do quadro: o Mestre ou quem o deixou. */
	podeTirarEfeito = (e: MesaEfeito) => !this.somenteLeitura && (this.mestre || e.autor_id === this.eu);
	async removerEfeito(id: string) {
		const antes = this.efeitos;
		this.efeitos = this.efeitos.filter((e) => e.id !== id);
		this.avisar('fora', { tabela: 'mesa_efeitos', ids: [id] });
		const { error } = await sb().from('mesa_efeitos').delete().eq('id', id);
		if (error) {
			this.efeitos = antes;
			toasts.mostrar('Não foi possível tirar o efeito do quadro.', 'erro');
		}
	}

	// ------------------------------------------------------------------ objetos da cena
	/** Pode mexer neste objeto? O Mestre em todos; cada um nos seus (e nunca nos travados). */
	podeMexerObjeto = (o: MesaObjeto) => !this.somenteLeitura && (this.mestre || (o.autor_id === this.eu && !o.travado && !this.travada && o.tipo !== 'imagem'));

	/** Tira da cena as peças de um mapa importado antes do mapa vivo, com os arquivos. Alfinetes, textos e imagens soltas ficam. */
	async tirarPecas() {
		const antigas = this.objetos.filter((o) => o.desce != null);
		if (!this.cenaId || !antigas.length) return;
		const { error } = await sb().from('mesa_objetos').delete().eq('cena_id', this.cenaId).not('desce', 'is', null);
		if (error) throw error;
		this.objetos = this.objetos.filter((o) => o.desce == null);
		await sb().storage.from('mesa').remove(antigas.flatMap((o) => (o.imagem ? [o.imagem] : [])));
	}

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
		if (o.visivel) this.avisar('linha', { tabela: 'mesa_objetos', linha: o });
		this.desfazer.push({ tipo: 'objeto', id: o.id });
		return o;
	}

	async atualizarObjeto(id: string, patch: Partial<MesaObjeto>) {
		const antes = this.objetos.find((o) => o.id === id);
		if (!antes) return false;
		this.objetos = this.objetos.map((o) => (o.id === id ? { ...o, ...patch } : o));
		if (antes.visivel && patch.visivel !== false) this.avisar('linha', { tabela: 'mesa_objetos', linha: { ...antes, ...patch } });
		const { error } = await sb().from('mesa_objetos').update(patch).eq('id', id);
		if (error) {
			this.objetos = this.objetos.map((o) => (o.id === id ? antes : o));
			if (antes.visivel) this.avisar('linha', { tabela: 'mesa_objetos', linha: antes });
			toasts.mostrar('Não foi possível salvar o objeto.', 'erro');
			return false;
		}
		if (this.mestre && patch.visivel === false && antes.visivel) this.canal?.send({ type: 'broadcast', event: 'esconder', payload: { usuario: this.eu, objetos: [id] } });
		return true;
	}

	async removerObjeto(id: string) {
		const antes = this.objetos;
		const visivel = antes.find((o) => o.id === id)?.visivel;
		this.objetos = this.objetos.filter((o) => o.id !== id);
		if (visivel) this.avisar('fora', { tabela: 'mesa_objetos', ids: [id] });
		const { error } = await sb().from('mesa_objetos').delete().eq('id', id);
		if (error) {
			this.objetos = antes;
			toasts.mostrar('Não foi possível tirar o objeto.', 'erro');
		}
	}

	// ------------------------------------------------------------------ relógios da cena (Mestre)
	definirRelogios(lista: Relogio[]) {
		return this.patchCena({ relogios: lista });
	}

	// ------------------------------------------------------------------ diário do grupo
	/** Lê o diário uma vez (depois, o tempo real mantém); sem a tabela no banco, fica false e o diário não aparece. */
	async carregarDiario() {
		if (this.diario !== null) return;
		const { data, error } = await sb().from('mesa_diario').select('*').eq('campanha_id', this.campanha).order('criado_em');
		this.diario = error ? false : ((data ?? []) as EntradaDiario[]);
		if (error || this.canalDiario) return;
		const aviso = (p: RealtimePostgresChangesPayload<Record<string, unknown>>) => {
			if (!Array.isArray(this.diario)) return;
			if (p.eventType === 'DELETE') return void (this.diario = this.diario.filter((d) => d.id !== (p.old as { id?: string }).id));
			const e = p.new as unknown as EntradaDiario;
			if (e.campanha_id !== this.campanha) return;
			// virou privada de outra pessoa: some daqui
			if (e.privado && e.autor_id !== this.eu) return void (this.diario = this.diario.filter((d) => d.id !== e.id));
			this.diario = this.diario.some((d) => d.id === e.id) ? this.diario.map((d) => (d.id === e.id ? e : d)) : [...this.diario, e];
		};
		this.assinarDiario(aviso);
	}
	/** O canal do diário; fechado pelo servidor, um novo entra depois de uns segundos e relê as entradas. */
	private assinarDiario(aviso: (p: RealtimePostgresChangesPayload<Record<string, unknown>>) => void, tentativa = 0) {
		const canal: RealtimeChannel = (this.canalDiario = sb()
			.channel(`diario:${this.campanha}`)
			.on('postgres_changes', { event: '*', schema: 'public', table: 'mesa_diario', filter: `campanha_id=eq.${this.campanha}` }, aviso)
			// o Realtime não filtra DELETE (o registro antigo só traz o id)
			.on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'mesa_diario' }, aviso)
			.subscribe((status) => {
				if (this.canalDiario !== canal || !(status === 'CLOSED' || status === 'CHANNEL_ERROR' || status === 'TIMED_OUT')) return;
				setTimeout(async () => {
					if (this.canalDiario !== canal) return;
					this.canalDiario = null;
					void sb().removeChannel(canal);
					const { data } = await sb().from('mesa_diario').select('*').eq('campanha_id', this.campanha).order('criado_em');
					if (data && Array.isArray(this.diario)) this.diario = data as EntradaDiario[];
					this.assinarDiario(aviso, tentativa + 1);
				}, Math.min(30000, 2000 * 2 ** tentativa));
			}));
	}
	private canalDiario: RealtimeChannel | null = null;
	async salvarEntrada(e: Partial<EntradaDiario> & Pick<EntradaDiario, 'tipo' | 'titulo'>) {
		if (this.somenteLeitura || !Array.isArray(this.diario)) return null;
		const { id, ...campos } = e;
		const q = id
			? sb().from('mesa_diario').update({ titulo: campos.titulo, texto: campos.texto, privado: campos.privado, feito: campos.feito, tipo: campos.tipo }).eq('id', id)
			: sb().from('mesa_diario').insert({ ...campos, campanha_id: this.campanha });
		const { data, error } = await q.select('*').single();
		if (error || !data) {
			toasts.mostrar('Não foi possível salvar no diário.', 'erro');
			return null;
		}
		const nova = data as EntradaDiario;
		if (Array.isArray(this.diario)) this.diario = this.diario.some((d) => d.id === nova.id) ? this.diario.map((d) => (d.id === nova.id ? nova : d)) : [...this.diario, nova];
		return nova;
	}
	async apagarEntrada(id: string) {
		if (!Array.isArray(this.diario)) return;
		const antes = this.diario;
		this.diario = this.diario.filter((d) => d.id !== id);
		const { error } = await sb().from('mesa_diario').delete().eq('id', id);
		if (error) {
			this.diario = antes;
			toasts.mostrar('Não foi possível apagar do diário.', 'erro');
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
		if (d.tipo === 'mover') await this.atualizarToken(d.id, { x: d.x, y: d.y, movido: d.movido, elevacao: d.elevacao });
		else if (d.tipo === 'objeto') await this.removerObjeto(d.id);
		else await this.apagarTraco(d.id);
		return true;
	}

	// ------------------------------------------------------------------ cena (Mestre) e cor
	/** As gravações da cena, uma de cada vez: duas seguidas (tirar e pôr na narrativa) chegavam ao banco fora de ordem. */
	private filaCena: Promise<unknown> = Promise.resolve();
	async patchCena(patch: Partial<MesaCena>): Promise<boolean> {
		const cenaId = this.cenaId;
		if (!cenaId) return false;
		const antes = this.cenas;
		const velha = this.cena;
		this.cenas = this.cenas.map((c) => (c.id === cenaId ? { ...c, ...patch } : c));
		this.frescos.marcar(`cena:${cenaId}`, patch);
		this.espelharCena(velha, patch);
		const gravar = this.filaCena.then(() => sb().from('mesa_cenas').update(patch).eq('id', cenaId));
		this.filaCena = gravar.catch(() => null);
		const { error } = await gravar;
		if (error) {
			this.cenas = antes;
			if (velha) this.espelharCena(velha, camposDe(velha, patch));
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
	 * passa a ter `largura` × `altura`. Tokens, objetos, terreno, névoa, paredes, luzes e efeitos andam junto e ficam no mesmo lugar do mapa
	 * (os traços do lápis ficam onde estão). `fundo` é onde a imagem fica na cena nova, pela conta do quadro.
	 */
	async reenquadrarCena(dx: number, dy: number, largura: number, altura: number, fundo: Partial<MesaCena>) {
		const c = this.cena;
		if (!this.mestre || this.somenteLeitura || !c) return false;
		const L = Math.min(200, Math.max(5, Math.round(largura)));
		const A = Math.min(200, Math.max(5, Math.round(altura)));
		const terreno = deslocarQuadrados(Array.isArray(c.terreno) ? c.terreno : [], dx, dy, L, A);
		const reveladas = deslocarRuns(Array.isArray(c.reveladas) ? c.reveladas : [], dx, dy, L, A);
		const luz = c.paredes !== undefined ? { paredes: limparParedes(deslocarParedes(this.paredes, dx, dy), L, A), luzes: deslocarLuzes(this.luzes, dx, dy) } : {};
		if (!(await this.patchCena({ largura: L, altura: A, terreno, reveladas, ...luz, ...fundo }))) return false;
		const tokens = this.tokens.map((t) => [t, deslocarToken(t, dx, dy, L, A)] as const).filter(([t, [x, y]]) => x !== t.x || y !== t.y);
		await Promise.all(tokens.map(([t, [x, y]]) => this.atualizarToken(t.id, { x, y })));
		if (dx || dy) {
			await Promise.all(this.objetos.map((o) => this.atualizarObjeto(o.id, { x: o.x + dx, y: o.y + dy })));
			let falhou = false;
			for (const e of this.efeitos) {
				const patch = { quadrados: deslocarQuadrados(e.quadrados, dx, dy, L, A), rotulo_x: e.rotulo_x + dx, rotulo_y: e.rotulo_y + dy };
				this.efeitos = this.efeitos.map((k) => (k.id === e.id ? { ...k, ...patch } : k));
				if ((await sb().from('mesa_efeitos').update(patch).eq('id', e.id)).error) falhou = true;
			}
			if (falhou) toasts.mostrar('Alguns efeitos não acompanharam o mapa. Recarregue a cena e confira.', 'erro');
		}
		return true;
	}

	// ------------------------------------------------------------------ luz dinâmica (ver luz.ts)
	/**
	 * As paredes seguram o token de jogador que iria de onde está até (x, y)? Só com a opção ligada na cena (o padrão); o
	 * Mestre passa por onde quiser. A porta aberta e a janela deixam passar.
	 */
	passoBarrado(t: MesaToken, x: number, y: number) {
		const paredes = this.paredesDe(t);
		if (this.mestre || this.cena?.paredes_bloqueiam === false || !paredes.length) return false;
		const n = t.tamanho / 2;
		return bloqueiaPasso(paredes, t.x + n, t.y + n, x + n, y + n);
	}
	/** As paredes que valem para o token: em cima de um telhado, o que é mais baixo que ele fica para trás. */
	paredesDe(t: Pick<MesaToken, 'elevacao'>): readonly Parede[] {
		return this.relevo && (t.elevacao ?? 0) > 0 ? this.relevo.paredes(t.elevacao) : this.paredes;
	}
	/** A altura do token ao chegar a (x, y). */
	alturaAo(t: Pick<MesaToken, 'tamanho' | 'elevacao'>, x: number, y: number) {
		const n = t.tamanho / 2;
		return this.relevo ? alturaAoAndar(this.relevo.niveis(x + n, y + n), t.elevacao ?? 0) : (t.elevacao ?? 0);
	}
	/** Para onde o token sobe ou desce agora: a próxima superfície num mapa vivo, ou um metro numa cena comum. Null: não há para onde. */
	proximaAltura(t: MesaToken, rumo: 1 | -1) {
		const e = t.elevacao ?? 0;
		if (!this.relevo) return Math.abs(e + rumo) > 60 ? null : e + rumo;
		const n = t.tamanho / 2;
		return proximoNivel(this.relevo.niveis(t.x + n, t.y + n), e, rumo);
	}
	/** Os tokens têm as colunas das miniaturas (a migração já rodou)? */
	get temMiniaturas() {
		return this.tokens.length ? this.tokens[0].miniatura !== undefined : true;
	}
	/** Quanto a miniatura `id` cresce no quadro (o tamanho de todas vezes o dela). */
	escalaMiniatura(id: string) {
		return Math.round(this.miniaturasCena.escala * (this.miniaturasAjuste?.ajustes[id] ?? 1) * 1000) / 1000;
	}
	/** As miniaturas nesta cena: o tamanho de todas e a sombra. */
	get miniaturasCena(): CenaMiniaturas {
		return lerCenaMiniaturas(this.cena?.miniaturas);
	}
	/** O Mestre muda o tamanho de todas as miniaturas desta cena ou liga e desliga a sombra. */
	definirMiniaturasCena(patch: Partial<CenaMiniaturas>) {
		if (this.cena?.miniaturas === undefined) return Promise.resolve(false);
		return this.patchCena({ miniaturas: { ...this.miniaturasCena, ...patch } });
	}
	/** A peça vira para `rumo` sem sair do lugar (Ctrl + seta). */
	virar(id: string, rumo: number) {
		const t = this.tokens.find((k) => k.id === id);
		if (!t || t.rumo === undefined || t.rumo === rumo) return Promise.resolve(true);
		return this.atualizarToken(id, { rumo });
	}
	/** O Mestre muda o tamanho de cada miniatura (o ajuste dela): grava na campanha e manda a quem está na mesa. */
	async definirAjusteMiniaturas(a: AjusteMiniaturas) {
		const antes = this.miniaturasAjuste;
		if (!antes) return false;
		const novo = lerAjustes(a);
		this.miniaturasAjuste = novo;
		const { error } = await sb().from('campanhas').update({ miniaturas: novo }).eq('id', this.campanha);
		if (error) {
			this.miniaturasAjuste = antes;
			toasts.mostrar('Não foi possível guardar o tamanho das miniaturas.', 'erro');
			return false;
		}
		this.enviar('miniaturas', novo, true);
		return true;
	}
	/**
	 * Escolhe a miniatura de um personagem ou NPC (null = o token redondo): fica salva nele, os tokens dele nas cenas
	 * trocam junto e os próximos já nascem com ela.
	 */
	async escolherMiniatura(tipo: 'personagem' | 'npc', alvo: string, id: string | null) {
		const deles = this.tokens.filter((t) => (tipo === 'personagem' ? t.personagem_id : t.npc_id) === alvo);
		for (const t of deles) {
			this.trocar(t.id, { miniatura: id });
			this.espelharToken(t, { miniatura: id });
		}
		const { error } = await sb().rpc('definir_miniatura', { tipo, alvo, miniatura: id });
		if (error) {
			for (const t of deles) this.trocar(t.id, { miniatura: t.miniatura });
			toasts.mostrar('Não foi possível trocar a miniatura.', 'erro');
			return false;
		}
		return true;
	}
	/** Troca a peça de vários tokens de uma vez: a miniatura `id` ou, com null, o token redondo. */
	async trocarMiniatura(tokens: readonly MesaToken[], id: string | null) {
		const alvos = tokens.filter((t) => t.miniatura !== undefined && t.miniatura !== id);
		if (!alvos.length) return true;
		for (const t of alvos) {
			this.trocar(t.id, { miniatura: id });
			this.espelharToken(t, { miniatura: id });
		}
		const { error } = await sb().from('mesa_tokens').update({ miniatura: id }).in('id', alvos.map((t) => t.id));
		if (error) {
			for (const t of alvos) this.trocar(t.id, { miniatura: t.miniatura });
			toasts.mostrar(/travada/i.test(error.message) ? 'Mesa travada pelo Mestre.' : 'Não foi possível trocar a peça.', 'erro');
			return false;
		}
		return true;
	}
	/** A cena tem as colunas da luz dinâmica (a migração já rodou)? */
	get temLuzDinamica() {
		return this.cena?.paredes !== undefined;
	}
	definirParedes(paredes: Parede[]) {
		const c = this.cena;
		return c ? this.patchCena({ paredes: limparParedes(paredes, c.largura, c.altura) }) : Promise.resolve(false);
	}
	definirLuzes(luzes: Luz[]) {
		return this.patchCena({ luzes: limparLuzes(luzes) });
	}
	/** Abre ou fecha a porta `i` (o jogador, só com um token dele ao lado; a trancada, só o Mestre). */
	async alternarPorta(i: number) {
		const c = this.cena;
		const p = c?.paredes?.[i];
		if (!c || !p || !ehPorta(p[4]) || this.somenteLeitura) return false;
		const [x1, y1, tipo] = [p[0], p[1], p[4]];
		const nova = tipo === 2 ? 1 : 2;
		this.trocarPorta(c.id, i, nova);
		this.avisar('porta', { cena: c.id, i, x1, y1, tipo: nova });
		const { error } = await sb().rpc('mesa_porta', { cena: c.id, indice: i, x1, y1 });
		if (error) {
			this.trocarPorta(c.id, i, tipo);
			this.avisar('porta', { cena: c.id, i, x1, y1, tipo });
			toasts.mostrar(/trancada|perto|mudou|travada/i.test(error.message) ? error.message : 'Não foi possível abrir a porta.', 'aviso');
			return false;
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
