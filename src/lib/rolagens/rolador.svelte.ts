// Rolador e registro de rolagens (L10): manda a expressão para rolar() (o sorteio é no servidor), anima o dado,
// acompanha ao vivo as rolagens de todas as campanhas de quem está logado (Realtime, filtrado pelo RLS) e guarda o
// estado da janela flutuante (R2), que abre em qualquer tela pelo botão do canto ou pela tecla R.
// Cada pessoa escolhe como as rolagens aparecem: o aviso em pixel no canto (padrão) ou os dados 3D na tela inteira,
// com som nas batidas (Dados3D.svelte). A escolha fica neste navegador.
import type { RealtimeChannel } from '@supabase/supabase-js';
import { gravar, ler } from '#lib/estado/armazenamento.ts';
import { toasts } from '#lib/estado/toasts.svelte.ts';
import { supabase } from '#lib/supabase/cliente.ts';
import type { Json, ModoRolagem, Rolagem, TipoRolagem } from '#lib/supabase/banco.ts';
import { paraServidor } from './expressoes.ts';

export interface PedidoRolagem {
	campanha: string;
	expressao: string;
	rotulo: string;
	personagem?: string | null;
	/** NPC da campanha (só o Mestre): a rolagem sai no nome dele. */
	npc?: string | null;
	/** Teste com d20: usa o modo escolhido na barra (vantagem/desvantagem) e volta para Normal depois. */
	d20?: boolean;
	/** Dano de acerto crítico: os dados dobram (cap. 4). */
	critico?: boolean;
	/** Modo escolhido no próprio rolador (rolagem livre): vale no lugar do da barra "Próximo teste". */
	modo?: Exclude<ModoRolagem, 'critico'>;
	tipo?: TipoRolagem;
	/** De onde veio ("Ficha · Perícias"), para o registro. */
	origem?: string;
	/** Parcelas do modificador, para a conta no registro: [["ESP (atributo)", "+1"], …]. */
	partes?: [string, string][];
	/** Esta rolagem fica oculta mesmo com a barra em "todos veem" (ex.: rolador com "quem pode ver" próprio). */
	oculta?: boolean;
}

/** Campanha em que a pessoa joga ou mestra, com a ficha ativa dela (rolagens rápidas saem no nome da ficha). */
export interface CampanhaMesa {
	id: string;
	nome: string;
	mestreId: string | null;
	arquivada: boolean;
	ficha: { id: string; nome: string } | null;
}

export interface Janela {
	aberta: boolean;
	minimizada: boolean;
	/** Posição e tamanho no desktop; null = canto padrão. */
	x: number | null;
	y: number | null;
	w: number;
	h: number;
	/** Altura do painel inferior no celular. */
	alturaMovel: number;
}

/** Duração mínima da animação do dado, para o resultado não "piscar". */
const GIRO = 900;
const AVISO = 7000;
const JANELA_PADRAO: Janela = { aberta: false, minimizada: false, x: null, y: null, w: 420, h: 640, alturaMovel: 420 };

/** Como as rolagens aparecem na tela. */
export type EstiloDados = 'pixel' | '3d';

class Rolador {
	modo = $state<Exclude<ModoRolagem, 'critico'>>('normal');
	oculta = $state(false);
	/** Rótulo da rolagem em andamento (o dado gira). */
	rolando = $state<string | null>(null);
	/** Lados do primeiro dado da rolagem em andamento (a arte que gira). */
	ladosRolando = $state(20);
	/** Rolagem mostrada no aviso da tela (a minha ou a de outra pessoa da mesa). */
	aviso = $state<Rolagem | null>(null);
	/** Última rolagem minha, para o resultado no rolador. */
	ultima = $state<Rolagem | null>(null);
	/** Rolagens desta sessão, mais novas primeiro (as minhas e as que chegaram ao vivo, de todas as campanhas). */
	recentes = $state<Rolagem[]>([]);
	/** Campanha das rolagens rápidas (a última aberta). */
	mesa = $state<{ id: string; nome: string } | null>(null);
	campanhas = $state<CampanhaMesa[]>([]);
	janela = $state<Janela>({ ...JANELA_PADRAO });
	/** Rolagens que chegaram com a janela fechada ou minimizada. */
	naoVistas = $state(0);
	/** Expressão vinda de um dado no texto das regras (n muda a cada pedido): o rolador da janela a recebe. */
	sugestao = $state<{ expr: string; n: number } | null>(null);
	/** Aviso em pixel no canto ou dados 3D na tela inteira. */
	estilo = $state<EstiloDados>('pixel');
	/** Som das batidas dos dados 3D. */
	som = $state(true);
	/** Rolagem que os dados 3D vão jogar agora (n muda a cada lance, mesmo da mesma rolagem). */
	lance = $state<{ r: Rolagem; n: number } | null>(null);
	/** Ficha aberta agora (para o PD gasto no registro aparecer nela sem recarregar). */
	fichaAberta: { id: string; aoGastarPd: (pd: number) => void } | null = null;

	private eu: string | null = null;
	private canal: RealtimeChannel | null = null;
	private temporizador: ReturnType<typeof setTimeout> | undefined;

	/** Lê o que ficou guardado neste navegador (campanha das rolagens rápidas e a janela). */
	iniciar() {
		const m = ler<{ id: string; nome: string } | null>('mesa', null);
		if (m && /^[0-9a-f-]{36}$/i.test(m.id)) this.mesa = m;
		this.janela = { ...JANELA_PADRAO, ...ler<Partial<Janela>>('janela-rolagens', {}) };
		const d = ler<{ estilo?: EstiloDados; som?: boolean }>('dados', {});
		this.estilo = d.estilo === '3d' ? '3d' : 'pixel';
		this.som = d.som !== false;
	}

	/** Os dados 3D valem agora? (quem pede menos movimento fica no aviso em pixel) */
	get usar3d() {
		return this.estilo === '3d' && !matchMedia('(prefers-reduced-motion: reduce)').matches;
	}
	escolherEstilo(estilo: EstiloDados) {
		this.estilo = estilo;
		if (estilo === '3d') this.dispensar();
		gravar('dados', { estilo, som: this.som });
	}
	alternarSom(som = !this.som) {
		this.som = som;
		gravar('dados', { estilo: this.estilo, som });
	}

	/** Com sessão: campanhas, fichas e a assinatura ao vivo de todas as rolagens visíveis. */
	async conectar(eu: string | null) {
		if (eu === this.eu) return;
		this.eu = eu;
		if (this.canal) supabase().removeChannel(this.canal);
		this.canal = null;
		this.recentes = [];
		this.campanhas = [];
		if (!eu) return;
		const sb = supabase();
		const [{ data: ks }, { data: fichas }] = await Promise.all([
			sb.from('campanhas').select('id, nome, mestre_id, arquivada_em').order('atualizada_em', { ascending: false }),
			sb.from('personagens').select('id, nome, campanha_id').eq('jogador_id', eu).eq('status', 'aprovada').eq('situacao', 'ativo').eq('npc', false).eq('pre_gerado', false)
		]);
		this.campanhas = (ks ?? []).map((k) => {
			const f = (fichas ?? []).find((x) => x.campanha_id === k.id);
			return { id: k.id, nome: k.nome, mestreId: k.mestre_id, arquivada: !!k.arquivada_em, ficha: f ? { id: f.id, nome: f.nome } : null };
		});
		if (this.mesa && !this.campanhas.some((k) => k.id === this.mesa!.id)) this.mesa = null;
		if (!this.mesa && this.campanhas[0]) this.mesa = { id: this.campanhas[0].id, nome: this.campanhas[0].nome };
		this.canal = sb
			.channel(`rolagens:${eu}`)
			.on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'rolagens' }, (p) => {
				const r = p.new as Rolagem;
				this.receber(r, r.autor_id !== eu);
			})
			.on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'rolagens' }, (p) => this.atualizar(p.new as Rolagem))
			.subscribe();
	}

	campanha = (id: string) => this.campanhas.find((k) => k.id === id) ?? null;
	souMestre = (campanha: string) => this.campanha(campanha)?.mestreId === this.eu;
	/** Quem vê a rolagem: todos, quem rolou e o Mestre, ou só o Mestre (oculta do próprio Mestre). */
	visibilidade(r: Pick<Rolagem, 'oculta' | 'autor_id' | 'campanha_id'>): 'todos' | 'eu' | 'mestre' {
		if (!r.oculta) return 'todos';
		return this.campanha(r.campanha_id)?.mestreId === r.autor_id ? 'mestre' : 'eu';
	}
	get usuario() {
		return this.eu;
	}

	async rolar(p: PedidoRolagem): Promise<Rolagem | null> {
		if (this.rolando) return null;
		const expressao = paraServidor(p.expressao);
		this.rolando = p.rotulo;
		this.ladosRolando = Number(/\d+d(\d+)/i.exec(expressao)?.[1] ?? 20);
		this.aviso = null;
		const modo: ModoRolagem = p.critico ? 'critico' : (p.modo ?? (p.d20 ? this.modo : 'normal'));
		const [{ data, error }] = await Promise.all([
			supabase().rpc('rolar', {
				campanha: p.campanha,
				expressao,
				rotulo: p.rotulo,
				personagem: p.personagem ?? null,
				modo,
				oculta: p.oculta ?? this.oculta,
				npc: p.npc ?? null,
				tipo: p.tipo ?? 'livre',
				origem: p.origem ?? null,
				partes: (p.partes ?? []) as unknown as Json
			}),
			// com os dados 3D, eles giram no lugar do dado do aviso: sem espera
			new Promise((ok) => setTimeout(ok, this.usar3d || matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : GIRO))
		]);
		this.rolando = null;
		if (error || !data) {
			toasts.mostrar(error?.message && !/^[A-Z_]+$/.test(error.message) ? error.message : 'Não foi possível rolar. Confira a conexão.', 'erro');
			return null;
		}
		if (p.d20 && !p.modo) this.modo = 'normal';
		this.ultima = data;
		this.receber(data, true);
		return data;
	}

	/** Ponto de Destino (cap. 2): re-rolar ou +5, gastando 1 PD da ficha. */
	async usarPd(r: Rolagem, acao: 'rerrolar' | 'mais5'): Promise<boolean> {
		const { data, error } = await supabase().rpc('usar_pd', { rolagem: r.id, acao });
		if (error || !data) {
			toasts.mostrar(error?.message && !/^[A-Z_]+$/.test(error.message) ? error.message : 'Não foi possível usar o Ponto de Destino.', 'erro');
			return false;
		}
		if (acao === 'rerrolar') {
			this.atualizar({ ...r, substituida: true });
			this.receber(data, true);
		} else this.atualizar(data);
		this.ultima = data;
		if (this.fichaAberta?.id === r.personagem_id) {
			const { data: p } = await supabase().from('personagens').select('estado').eq('id', r.personagem_id!).maybeSingle();
			const pd = (p?.estado as { pd?: number } | null)?.pd;
			if (typeof pd === 'number') this.fichaAberta.aoGastarPd(pd);
		}
		toasts.mostrar(acao === 'rerrolar' ? 'Ponto de Destino gasto: rolagem refeita.' : 'Ponto de Destino gasto: +5 no resultado.', 'sucesso');
		return true;
	}

	/** Uma rolagem nova (minha, ou de outra pessoa pelo Realtime). */
	receber(r: Rolagem, mostrar: boolean) {
		if (!this.recentes.some((x) => x.id === r.id)) {
			this.recentes = [r, ...this.recentes].slice(0, 200);
			if (mostrar && r.autor_id !== this.eu && (!this.janela.aberta || this.janela.minimizada)) this.naoVistas++;
		}
		if (!mostrar || this.rolando) return;
		// dados 3D: todas as rolagens visíveis rolam na tela, como numa mesa de verdade
		if (this.usar3d) {
			this.lance = { r, n: (this.lance?.n ?? 0) + 1 };
			return;
		}
		// rolagens dos outros não pulam na tela quando a janela de rolagens já está aberta
		if (r.autor_id !== this.eu && this.janela.aberta && !this.janela.minimizada) return;
		this.aviso = r;
		clearTimeout(this.temporizador);
		this.temporizador = setTimeout(() => (this.aviso = null), AVISO);
	}

	/** Uma rolagem mudou (PD +5, re-rolada). */
	atualizar(r: Rolagem) {
		this.recentes = this.recentes.some((x) => x.id === r.id) ? this.recentes.map((x) => (x.id === r.id ? { ...x, ...r } : x)) : this.recentes;
		if (this.aviso?.id === r.id) this.aviso = { ...this.aviso, ...r };
		if (this.ultima?.id === r.id) this.ultima = { ...this.ultima, ...r };
	}

	esquecer(id: string) {
		this.recentes = this.recentes.filter((r) => r.id !== id);
		if (this.aviso?.id === id) this.aviso = null;
	}

	dispensar() {
		clearTimeout(this.temporizador);
		this.aviso = null;
	}

	/** Os dados 3D falharam (sem WebGL): esta rolagem e as próximas vão para o aviso em pixel. */
	voltarAoPixel(r: Rolagem | null) {
		this.estilo = 'pixel';
		this.lance = null;
		if (r) this.receber(r, true);
	}

	definirMesa(m: { id: string; nome: string }) {
		this.mesa = m;
		gravar('mesa', m);
	}

	/** Dado clicado no texto das regras: abre a janela de rolagens com a expressão pronta. */
	sugerir(expr: string) {
		this.sugestao = { expr, n: (this.sugestao?.n ?? 0) + 1 };
		this.alternarJanela(true);
	}

	// ---------------------------------------------------------------- janela (R2)
	private guardarJanela() {
		gravar('janela-rolagens', this.janela);
	}
	alternarJanela(aberta = !this.janela.aberta) {
		this.janela = { ...this.janela, aberta, minimizada: false };
		if (aberta) this.naoVistas = 0;
		this.guardarJanela();
	}
	alternarMinimizada() {
		this.janela = { ...this.janela, minimizada: !this.janela.minimizada };
		if (!this.janela.minimizada) this.naoVistas = 0;
		this.guardarJanela();
	}
	moverJanela(x: number | null, y: number | null, salvar = false) {
		this.janela = { ...this.janela, x, y };
		if (salvar) this.guardarJanela();
	}
	redimensionarJanela(w: number, h: number, salvar = false) {
		this.janela = { ...this.janela, w, h };
		if (salvar) this.guardarJanela();
	}
	alturaMovel(h: number, salvar = false) {
		this.janela = { ...this.janela, alturaMovel: h };
		if (salvar) this.guardarJanela();
	}
}

export const rolador = new Rolador();
