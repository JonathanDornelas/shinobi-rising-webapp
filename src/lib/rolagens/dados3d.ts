// Dados 3D na tela inteira (estilo Roll20): o sorteio continua no servidor (rolar()); aqui só se anima a rolagem
// já feita. A biblioteca (@3d-dice/dice-box-threejs, Three.js + cannon-es) simula a física, lê a face de cima e
// troca as faces para cada dado cair no valor sorteado, então todos na mesa veem os mesmos números.
// O som de cada batida (dado com dado, dado com a mesa) segue a velocidade do impacto.
// A queda é a mesma em todas as telas: o lançamento (direção, força, giro) sai de um sorteio com semente no id da
// rolagem, e a física roda numa mesa de tamanho fixo (a câmera só amplia ou reduz para caber em cada tela). A física
// do cannon-es não tem nada aleatório e anda em passos fixos, então as mesmas condições dão a mesma queda.
// O módulo só é baixado por quem escolhe os dados 3D (import dinâmico).
import type { TermoRolagem } from '#lib/supabase/banco.ts';

/** Dados que a biblioteca desenha; os outros (d2, d3…) ficam só no aviso. */
const LADOS = new Set([4, 6, 8, 10, 12, 20, 100]);
/** Mais que isso pesa no celular e cobre a tela: o resto fica no total. */
export const MAX_DADOS = 20;
/** A mesa da física, igual para todos (16:10); cada tela mostra a mesa inteira na sua escala. */
const MESA = { x: 1280, y: 800 };

/** Sorteio com semente (mulberry32 sobre o FNV-1a do texto): o mesmo texto dá a mesma sequência em todo navegador. */
export function sorteioComSemente(texto: string) {
	let h = 0x811c9dc5;
	for (let i = 0; i < texto.length; i++) h = Math.imul(h ^ texto.charCodeAt(i), 0x01000193);
	let a = h >>> 0;
	return () => {
		a = (a + 0x6d2b79f5) | 0;
		let t = Math.imul(a ^ (a >>> 15), 1 | a);
		t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
		return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
	};
}

/**
 * Notação com os valores já sorteados ("1d20+2d6@17,3,5"). A biblioteca junta dados iguais num grupo só
 * ("1d20+1d20" vira "2d20"), então os valores vão agrupados por tipo de dado, na ordem em que aparecem.
 */
export function notacao3d(detalhe: TermoRolagem[]): string | null {
	const grupos = new Map<number, number[]>();
	let total = 0;
	for (const t of detalhe) {
		if (!('lados' in t) || !LADOS.has(t.lados)) continue;
		for (const v of t.valores) {
			if (total >= MAX_DADOS) break;
			if (!grupos.has(t.lados)) grupos.set(t.lados, []);
			grupos.get(t.lados)!.push(v);
			total++;
		}
	}
	if (!total) return null;
	const partes = [...grupos].map(([lados, vs]) => `${vs.length}d${lados}`);
	const valores = [...grupos.values()].flat();
	return `${partes.join('+')}@${valores.join(',')}`;
}

type Caixa = {
	initialize(): Promise<void>;
	roll(n: string): Promise<unknown>;
	clearDice(): void;
	updateConfig(c: Record<string, unknown>): Promise<void>;
	loadSounds(): Promise<void>;
	setDimensions(d: { x: number; y: number }): void;
	resizeWorld(): void;
	dimensions: { x: number; y: number };
	display: { currentWidth: number; currentHeight: number };
	world: { time: number; stepnumber: number; accumulator: number; collisionMatrixPrevious: { reset(): void }; collisionMatrix: { reset(): void }; bodyOverlapKeeper: { current: unknown[]; previous: unknown[] }; shapeOverlapKeeper: { current: unknown[]; previous: unknown[] } };
	container: HTMLElement;
	camera: { position: { set(x: number, y: number, z: number): void }; up: { set(x: number, y: number, z: number): void }; lookAt(x: number, y: number, z: number): void; far: number; updateProjectionMatrix(): void };
	renderer: { render(cena: unknown, camera: unknown): void };
	scene: unknown;
	sounds: boolean;
	volume: number;
	DiceFactory: { get(tipo: string): { font: string } };
};

let caixa: Caixa | null = null;
let preparando: Promise<Caixa> | null = null;
let comSom = false;
/** A cor dos dados já aplicada: trocar de cor refaz as texturas, então só troca quando muda. */
let corAtual: string | null = null;

/** Cria a cena uma vez só, no elemento fixo que cobre a tela (o canvas é transparente). */
function preparar(onde: HTMLElement): Promise<Caixa> {
	if (caixa) return Promise.resolve(caixa);
	preparando ??= (async () => {
		if (!onde.id) onde.id = 'dados-3d';
		const [{ default: DiceBox }] = await Promise.all([
			import('@3d-dice/dice-box-threejs'),
			// os números das faces na fonte pixel do jogo: ela precisa estar carregada antes de pintar as texturas
			document.fonts?.load("40pt 'Pixelify Sans'").catch(() => null)
		]);
		const c = new DiceBox(`#${onde.id}`, {
			assetPath: '/dados-3d/',
			sounds: false,
			volume: 70,
			theme_surface: 'green-felt',
			sound_dieMaterial: 'plastic',
			theme_material: 'plastic',
			shadows: true,
			light_intensity: 0.9,
			gravity_multiplier: 400,
			// tamanho e força iguais em todas as telas (fazem parte da física)
			baseScale: 100,
			strength: 1.1
		}) as unknown as Caixa;
		// a mesa da física não acompanha a janela: ao redimensionar, só o canvas e a câmera mudam
		c.dimensions = { ...MESA };
		const ajustar = c.setDimensions.bind(c);
		c.setDimensions = (d) => {
			ajustar(d);
			girarSeEmPe(c);
		};
		c.resizeWorld = () => {
			let quadro = 0;
			addEventListener('resize', () => {
				cancelAnimationFrame(quadro);
				quadro = requestAnimationFrame(() => c.setDimensions({ ...MESA }));
			});
		};
		for (const d of ['d4', 'd6', 'd8', 'd10', 'd12', 'd20', 'd100']) c.DiceFactory.get(d).font = 'Pixelify Sans';
		await c.initialize();
		caixa = c;
		return c;
	})();
	return preparando.catch((e) => {
		preparando = null;
		throw e;
	});
}

/**
 * Tela em pé (celular): a mesa 16:10 deitada ficaria espremida na largura. A câmera gira 90° e se afasta só o bastante
 * para a mesa em pé caber; a física não muda (a queda continua igual à das outras telas).
 */
function girarSeEmPe(c: Caixa) {
	const w = c.container.clientWidth;
	const h = c.container.clientHeight;
	if (h <= w) return;
	const z = Math.max(MESA.x, (MESA.y * h) / w) / Math.tan((10 * Math.PI) / 180);
	c.camera.position.set(0, 0, z);
	c.camera.up.set(1, 0, 0);
	c.camera.lookAt(0, 0, 0);
	c.camera.far = z * 1.3;
	c.camera.updateProjectionMatrix();
	c.renderer.render(c.scene, c.camera);
}

/** O WebGL existe neste navegador? Sem ele, a rolagem volta para o aviso em pixel. */
export function temWebgl() {
	try {
		const c = document.createElement('canvas');
		return !!(c.getContext('webgl2') ?? c.getContext('webgl'));
	} catch {
		return false;
	}
}

/**
 * Joga os dados da rolagem e resolve quando todos param. `cor` pinta os dados (dano na cor do elemento, cura em
 * verde); sem cor, grená com números em papel.
 */
export async function lancar(onde: HTMLElement, detalhe: TermoRolagem[], opcoes: { cor?: string | null; som: boolean; semente: string }) {
	const n = notacao3d(detalhe);
	if (!n) return false;
	// o preparo do aquecimento termina antes (a biblioteca e os sons); o lance invisível dele, não: este o substitui
	if (aquecendo) await aquecendo;
	lanceDeAquecimento = false;
	const c = await preparar(onde);
	if (opcoes.som && !comSom) {
		await c.loadSounds().catch(() => null);
		comSom = true;
	}
	c.sounds = opcoes.som;
	await pintar(c, opcoes.cor ?? COR_PADRAO);
	// (a leitura que a biblioteca devolve não serve para conferir o d4: ela não relê o d4 depois de trocar as faces;
	// a face de cima está certa, conferida nos prints)
	// o lançamento é calculado de forma síncrona no começo de roll(): só ali o Math.random vira o sorteio com
	// semente, e a "tela" vira a mesa fixa (a força do arremesso depende do tamanho dela)
	// o mundo da física guarda o tempo e as colisões da rolagem anterior: zerado, quem chegou agora na mesa (sem
	// rolagens antes) e quem já rolou dez vezes simulam a mesma queda
	const w = c.world;
	w.time = 0;
	w.stepnumber = 0;
	w.accumulator = 0;
	w.collisionMatrix.reset();
	w.collisionMatrixPrevious.reset();
	for (const k of [w.bodyOverlapKeeper, w.shapeOverlapKeeper]) (k.current = []), (k.previous = []);
	const original = Math.random;
	const { currentWidth, currentHeight } = c.display;
	let rolando: Promise<unknown>;
	try {
		Math.random = sorteioComSemente(opcoes.semente);
		c.display.currentWidth = MESA.x / 2;
		c.display.currentHeight = MESA.y / 2;
		rolando = c.roll(n);
	} finally {
		Math.random = original;
		c.display.currentWidth = currentWidth;
		c.display.currentHeight = currentHeight;
	}
	await rolando;
	return true;
}

const COR_PADRAO = '#5c1e15';
async function pintar(c: Caixa, fundo: string) {
	if (fundo === corAtual) return;
	await c.updateConfig({
		theme_customColorset: { name: `shinobi-${fundo}`, foreground: '#f4e4d6', background: fundo, outline: '#1b1210', texture: 'none', material: 'plastic' }
	});
	corAtual = fundo;
}

/**
 * Deixa tudo pronto antes da primeira rolagem (com a tela parada): a biblioteca, a fonte, as texturas na cor padrão,
 * os sons e os shaders. Os shaders só compilam quando o dado aparece pela primeira vez, então um lance de cada dado
 * cai na camada ainda invisível, sem som, e some. Uma rolagem de verdade que chegue no meio toma o lugar dele.
 */
export function preaquecer(onde: HTMLElement, som: boolean) {
	aquecendo ??= (async () => {
		const c = await preparar(onde);
		await pintar(c, COR_PADRAO);
		if (som && !comSom) {
			await c.loadSounds().catch(() => null);
			comSom = true;
		}
		c.sounds = false;
		lanceDeAquecimento = true;
		void c
			.roll('1d4+1d6+1d8+1d10+1d12+1d20')
			.then(() => lanceDeAquecimento && c.clearDice())
			.catch(() => null)
			.finally(() => (lanceDeAquecimento = false));
	})().catch(() => null);
	return aquecendo;
}
let aquecendo: Promise<unknown> | null = null;
/** O lance invisível do aquecimento ainda está na mesa (uma rolagem de verdade o substitui). */
let lanceDeAquecimento = false;

/** Tira os dados da mesa (depois de mostrar o resultado). */
export function limpar() {
	caixa?.clearDice();
}

