// Dados 3D na tela inteira (estilo Roll20): o sorteio continua no servidor (rolar()); aqui só se anima a rolagem
// já feita. A biblioteca (@3d-dice/dice-box-threejs, Three.js + cannon-es) simula a física, lê a face de cima e
// troca as faces para cada dado cair no valor sorteado, então todos na mesa veem os mesmos números.
// O som de cada batida (dado com dado, dado com a mesa) segue a velocidade do impacto.
// O módulo só é baixado por quem escolhe os dados 3D (import dinâmico).
import type { TermoRolagem } from '#lib/supabase/banco.ts';

/** Dados que a biblioteca desenha; os outros (d2, d3…) ficam só no aviso. */
const LADOS = new Set([4, 6, 8, 10, 12, 20, 100]);
/** Mais que isso pesa no celular e cobre a tela: o resto fica no total. */
export const MAX_DADOS = 20;

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
	sounds: boolean;
	volume: number;
	DiceFactory: { get(tipo: string): { font: string } };
};

let caixa: Caixa | null = null;
let preparando: Promise<Caixa> | null = null;
let comSom = false;

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
			baseScale: innerWidth < 640 ? 70 : 100,
			strength: innerWidth < 640 ? 0.8 : 1.1
		}) as unknown as Caixa;
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
export async function lancar(onde: HTMLElement, detalhe: TermoRolagem[], opcoes: { cor?: string | null; som: boolean }) {
	const n = notacao3d(detalhe);
	if (!n) return false;
	const c = await preparar(onde);
	if (opcoes.som && !comSom) {
		await c.loadSounds().catch(() => null);
		comSom = true;
	}
	c.sounds = opcoes.som;
	const fundo = opcoes.cor ?? '#5c1e15';
	await c.updateConfig({
		theme_customColorset: { name: `shinobi-${fundo}`, foreground: '#f4e4d6', background: fundo, outline: '#1b1210', texture: 'none', material: 'plastic' }
	});
	// (a leitura que a biblioteca devolve não serve para conferir o d4: ela não relê o d4 depois de trocar as faces;
	// a face de cima está certa, conferida nos prints)
	await c.roll(n);
	return true;
}

/** Tira os dados da mesa (depois de mostrar o resultado). */
export function limpar() {
	caixa?.clearDice();
}
