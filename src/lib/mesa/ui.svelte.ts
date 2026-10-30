// L11 · Mesa: o que é só desta tela (ferramenta, vista, régua, mira do jutsu, fichas abertas, popovers) e o cálculo
// do molde de jutsu, que o quadro desenha e a barra da régua descreve.
import type { MesaToken } from '#lib/supabase/banco.ts';
import type { JutsuMesa } from './tipos.ts';
import { distancia, distanciaEntre, moldeDirecional, moldeParede, moldeQuadrado, naArea, quadradosEsfera, angulo, type Quadrado } from './geometria.ts';
import type { Ferramenta, Mesa } from './mesa.svelte.ts';

/** A mira de um jutsu (régua de jutsu): o lançador, o ponto mirado e as escolhas da forma. */
export interface Mira {
	jutsu: JutsuMesa;
	lancador: string;
	tx: number;
	ty: number;
	px: number;
	py: number;
	fixa: boolean;
	alvos: string[];
	forma: 'cone' | 'linha';
	giro: number;
	travar: boolean;
}

export interface FichaAberta {
	token: string;
	x: number;
	y: number;
	z: number;
	min: boolean;
	aba: string | null;
	dano: string;
}

export type Pop = null | 'medir' | 'jutsu' | 'lapis' | 'cor' | 'cena' | 'gear' | 'alfinete' | 'texto' | 'objeto' | 'nevoa' | 'musica';
export type Modal = null | { tipo: 'nova' } | { tipo: 'excluir'; cena: string } | { tipo: 'renomear'; cena: string } | { tipo: 'participantes' } | { tipo: 'bestiario' } | { tipo: 'jutsu'; j: JutsuMesa } | { tipo: 'imagem'; alvo: 'imagem' | 'fundo' } | { tipo: 'artes' } | { tipo: 'pasta'; id: string | null; pai: string | null }| { tipo: 'mover-cena'; cena: string } | { tipo: 'config' };

/** Uma arte pronta para pôr no quadro: da biblioteca ou do livro. */
export interface ArteArmada {
	caminho: string;
	nome: string;
	w: number;
	h: number;
}

export class UiMesa {
	ferramenta = $state<Ferramenta>('mover');
	sel = $state<string | null>(null);
	zoom = $state(1);
	/** canto de cima à esquerda da vista, em metros */
	vx = $state(0);
	vy = $state(0);
	/** Vista isométrica: o canto de onde esta pessoa olha (null = o da cena). Só vale para quem girou. */
	isoRotacao = $state<0 | 90 | 180 | 270 | null>(null);
	/** Gira a vista isométrica de 90 em 90°, a partir da atual (a da cena, se esta pessoa ainda não girou). */
	girarIso(daCena: 0 | 90 | 180 | 270, passo: 1 | -1) {
		this.isoRotacao = ((((((this.isoRotacao ?? daCena) / 90 + passo) % 4) + 4) % 4) * 90) as 0 | 90 | 180 | 270;
	}
	regua = $state<{ pontos: Quadrado[]; cur: Quadrado | null; feita: boolean; fixa: boolean; t: number } | null>(null);
	modoLapis = $state<'lapis' | 'apontar'>('lapis');
	espessura = $state(0.2);
	/** Objeto selecionado no quadro (alfinete, imagem ou texto) e a arte pronta para pôr (ferramenta Objeto). */
	objSel = $state<string | null>(null);
	armada = $state<ArteArmada | null>(null);
	/** Padrões do texto novo e a cor do alfinete novo. */
	textoNovo = $state<{ fonte: 'sans' | 'pixel' | 'mincho' | 'mono'; cor: string; tamanho: number }>({ fonte: 'pixel', cor: '#f4e4d6', tamanho: 1 });
	alfineteCor = $state('#c44536');
	/** Névoa: revelar ou cobrir, e o lado do pincel em quadrados. */
	nevoaModo = $state<'revelar' | 'cobrir'>('revelar');
	nevoaPincel = $state(3);
	mira = $state<Mira | null>(null);
	aneis = $state<{ token: string; corpo: number; lista: { r: number; rotulo: string }[]; titulo: string } | null>(null);
	hover = $state<{ token: string; x: number; y: number } | null>(null);
	fichas = $state<FichaAberta[]>([]);
	pop = $state<Pop>(null);
	/** O cartão da música escondido pelo ícone da ferramenta: a música continua tocando, só o cartão some. */
	musicaOculta = $state(false);
	modal = $state<Modal>(null);
	aviso = $state<{ texto: string; t: number } | null>(null);
	anuncio = $state('');
	elencoAberto = $state(true);
	painelAberto = $state(true);
	abaPainel = $state<'rolagens' | 'iniciativa'>('rolagens');
	naoVistas = $state(0);
	/** Habilidades "uma vez por cena" já usadas (token:slug); zera quando o combate acaba. */
	usadas = $state<string[]>([]);
	private z = 20;

	avisar(texto: string) {
		this.aviso = { texto, t: Date.now() };
		const t = this.aviso.t;
		setTimeout(() => {
			if (this.aviso?.t === t) this.aviso = null;
		}, 3500);
	}

	/** Alinhar à grade (ferramenta do fundo): a moldura de n × n quadrados que o Mestre ajusta sobre o mapa, em metros. */
	alinhar = $state<{ x: number; y: number; lado: number; n: number } | null>(null);

	escolher(f: Ferramenta) {
		if (f !== 'fundo') this.alinhar = null;
		this.ferramenta = f;
		this.pop = f === 'medir' ? 'medir' : f === 'lapis' || f === 'apontar' ? 'lapis' : f === 'alfinete' || f === 'texto' || f === 'nevoa' || f === 'objeto' ? f : null;
		if (f !== 'mover' && f !== 'alfinete' && f !== 'texto' && f !== 'objeto') this.objSel = null;
		if (f !== 'objeto') this.armada = null;
		if (f === 'apontar') this.modoLapis = 'apontar';
		if (f === 'lapis') this.modoLapis = 'lapis';
		if (f === 'terreno') this.avisar('Arraste para marcar terreno difícil; comece num quadrado marcado para apagar.');
		if (f === 'nevoa') this.avisar('Arraste para revelar o mapa; Shift inverte (cobre). Só o Mestre vê tudo; o grupo vê só o revelado.');
	}

	abrirFicha(token: string, aba: string | null = null) {
		const ja = this.fichas.find((f) => f.token === token);
		this.z++;
		if (ja) {
			this.fichas = this.fichas.map((f) => (f.token === token ? { ...f, min: false, z: this.z, aba: aba ?? f.aba } : f));
			return;
		}
		const n = this.fichas.length;
		// sem limite: as minimizadas que não cabem na faixa de baixo vão para o "…"
		this.fichas = [...this.fichas, { token, x: 24 + (n % 3) * 28, y: 72 + (n % 3) * 28, z: this.z, min: false, aba, dano: '' }];
	}
	focarFicha(token: string) {
		this.z++;
		this.fichas = this.fichas.map((f) => (f.token === token ? { ...f, z: this.z } : f));
	}
	mudarFicha(token: string, patch: Partial<FichaAberta>) {
		this.fichas = this.fichas.map((f) => (f.token === token ? { ...f, ...patch } : f));
	}
	fecharFicha(token: string) {
		this.fichas = this.fichas.filter((f) => f.token !== token);
	}
}

export interface Molde {
	quadrados: Quadrado[];
	contorno: Quadrado[] | null;
	anel: { cx: number; cy: number; r: number } | null;
	dist: number;
	ok: boolean;
	quem: MesaToken[];
	forma: string;
	lancador: MesaToken;
}

/** O molde da mira: quadrados atingidos, contorno, anel de alcance, distância e quem está na área. */
export function calcularMolde(mira: Mira, mesa: Mesa, visiveis: MesaToken[]): Molde | null {
	const c = mesa.tokens.find((t) => t.id === mira.lancador);
	const cena = mesa.cena;
	if (!c || !cena) return null;
	const r = mira.jutsu.regua;
	const L = cena.largura;
	const A = cena.altura;
	const cx = c.x + c.tamanho / 2;
	const cy = c.y + c.tamanho / 2;
	const alcance = r.alcance ?? 0;
	const anel = alcance > 0 ? { cx, cy, r: alcance + c.tamanho / 2 } : null;
	const forma = r.forma === 'cone-linha' ? mira.forma : r.forma;
	let quadrados: Quadrado[] = [];
	let contorno: Quadrado[] | null = null;
	let dist = 0;
	let ok = true;
	const alvo = { x: mira.tx, y: mira.ty, tamanho: 1 };
	if (forma === 'esfera') {
		const centro = r.emSi ? { x: c.x + Math.floor(c.tamanho / 2), y: c.y + Math.floor(c.tamanho / 2) } : alvo;
		quadrados = quadradosEsfera(centro.x, centro.y, r.n, L, A);
		if (r.emSi) quadrados = quadrados.filter(([x, y]) => !(x >= c.x && x < c.x + c.tamanho && y >= c.y && y < c.y + c.tamanho));
		dist = r.emSi ? 0 : distanciaEntre(c, alvo);
		ok = r.emSi || dist <= alcance;
	} else if (forma === 'cone' || forma === 'linha') {
		const n = r.forma === 'cone-linha' ? (forma === 'cone' ? r.cone! : r.linha!) : r.n;
		const m = moldeDirecional(forma, c, n, angulo(cx, cy, mira.px, mira.py, mira.travar), L, A);
		quadrados = m.quadrados;
		contorno = m.contorno;
		dist = distanciaEntre(c, { x: Math.floor(mira.px), y: Math.floor(mira.py), tamanho: 1 });
	} else if (forma === 'quadrado') {
		const m = moldeQuadrado(mira.tx, mira.ty, r.n, L, A);
		quadrados = m.quadrados;
		contorno = m.contorno;
		dist = distanciaEntre(c, alvo);
		ok = dist <= alcance;
	} else if (forma === 'parede') {
		const m = moldeParede(mira.tx, mira.ty, r.n, mira.giro, L, A);
		quadrados = m.quadrados;
		contorno = m.contorno;
		dist = distanciaEntre(c, alvo);
		ok = dist <= alcance;
	} else if (forma === 'cena') {
		// a cena toda: o quadro pinta um retângulo só, sem listar quadrado por quadrado (até 200 × 200)
	} else if (forma === 'alvos') {
		const sob = visiveis.find((t) => mira.tx >= t.x && mira.tx < t.x + t.tamanho && mira.ty >= t.y && mira.ty < t.y + t.tamanho);
		dist = sob ? distanciaEntre(c, sob) : distanciaEntre(c, alvo);
		const piores = mira.alvos.map((id) => visiveis.find((t) => t.id === id)).filter((t): t is MesaToken => !!t);
		ok = (piores.length ? Math.max(...piores.map((t) => distanciaEntre(c, t))) : dist) <= alcance;
	}
	const quem =
		forma === 'alvos'
			? mira.alvos.map((id) => visiveis.find((t) => t.id === id)).filter((t): t is MesaToken => !!t)
			: forma === 'cena'
				? visiveis.filter((t) => t.id !== c.id)
				: visiveis.filter((t) => t.id !== c.id && naArea(t, quadrados));
	return { quadrados, contorno, anel, dist, ok, quem, forma, lancador: c };
}

export const nomeCurto = (n: string) => n.split(',')[0];
export { distancia };
