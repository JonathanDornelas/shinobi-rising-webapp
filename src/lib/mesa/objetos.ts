// Objetos soltos no quadro (alfinetes, imagens e textos): fontes, medidas e a conta de clique e de arrasto.
// x e y são o centro do objeto, em metros; a rotação é em graus, no sentido horário.
import type { MesaObjeto } from '#lib/supabase/banco.ts';

export const FONTES: Record<NonNullable<MesaObjeto['fonte']>, { nome: string; familia: string; peso: number }> = {
	sans: { nome: 'Normal', familia: "'Noto Sans', sans-serif", peso: 600 },
	pixel: { nome: 'Pixel', familia: "'Pixelify Sans', monospace", peso: 700 },
	mincho: { nome: 'Mincho', familia: "'Shippori Mincho B1', serif", peso: 700 },
	mono: { nome: 'Máquina', familia: "ui-monospace, 'Courier New', monospace", peso: 700 }
};
export const TAMANHOS_TEXTO: [number, string][] = [
	[0.6, 'P'],
	[1, 'M'],
	[1.6, 'G'],
	[2.6, 'GG'],
	[4, 'XG']
];
/** As cores de alfinete e de texto: as da paleta do quadro mais branco e preto. */
export const CORES_OBJETO = ['#c44536', '#d29a1e', '#4e7a2e', '#1f7a7a', '#2d7fb8', '#7b3f8c', '#c2577a', '#f4e4d6', '#1b1210'];

export const MAX_OBJETOS = 300;

/** Largura aproximada do texto (para a caixa de seleção): as fontes variam, a conta é boa o bastante para clicar. */
export function medidaTexto(o: Pick<MesaObjeto, 'texto' | 'tamanho'>) {
	const linhas = (o.texto ?? '').split('\n');
	const t = o.tamanho ?? 1;
	return { w: Math.max(...linhas.map((l) => l.length), 1) * t * 0.58 + t * 0.4, h: linhas.length * t * 1.25 + t * 0.2, linhas };
}

/** A caixa do objeto, sem rotação: centro e meia largura/altura. */
export function caixa(o: Pick<MesaObjeto, 'tipo' | 'x' | 'y' | 'largura' | 'altura' | 'texto' | 'tamanho'>) {
	if (o.tipo === 'imagem') return { cx: o.x, cy: o.y, hw: (o.largura ?? 1) / 2, hh: (o.altura ?? 1) / 2 };
	if (o.tipo === 'texto') {
		const m = medidaTexto(o);
		return { cx: o.x, cy: o.y, hw: m.w / 2, hh: m.h / 2 };
	}
	// alfinete: a cabeça fica acima da ponta (x, y)
	return { cx: o.x, cy: o.y - 0.55, hw: 0.45, hh: 0.7 };
}

/** O ponto (px, py) está dentro do objeto? Imagens e textos giram com a rotação. */
export function dentro(o: Parameters<typeof caixa>[0] & { rotacao?: number }, px: number, py: number) {
	const c = caixa(o);
	let dx = px - c.cx;
	let dy = py - c.cy;
	if (o.rotacao && o.tipo !== 'alfinete') {
		const r = (-o.rotacao * Math.PI) / 180;
		[dx, dy] = [dx * Math.cos(r) - dy * Math.sin(r), dx * Math.sin(r) + dy * Math.cos(r)];
	}
	return Math.abs(dx) <= c.hw && Math.abs(dy) <= c.hh;
}

/** O quanto o objeto fica por cima: alfinete e texto sobre tudo, depois as imagens "acima", "meio" e "chão". */
export const camadaRank = (o: { tipo: string; camada?: 'chao' | 'meio' | 'acima' | null }) => (o.tipo !== 'imagem' ? 3 : { acima: 2, meio: 1, chao: 0 }[o.camada ?? 'meio']);

/** O objeto mais acima (a camada, depois a maior ordem, depois o mais novo) sob o ponto. */
export function objetoEm<T extends Parameters<typeof dentro>[0] & { ordem: number; criado_em: string; camada?: 'chao' | 'meio' | 'acima' | null }>(lista: T[], px: number, py: number): T | null {
	return [...lista].sort((a, b) => camadaRank(b) - camadaRank(a) || b.ordem - a.ordem || b.criado_em.localeCompare(a.criado_em)).find((o) => dentro(o, px, py)) ?? null;
}

/**
 * A caixa do objeto de pé na vista isométrica, em metros de tela e relativa ao ponto de apoio (x, y do objeto): a
 * imagem fica de pé sobre o apoio, o alfinete e o texto como na vista de cima. Sem rotação.
 */
export function caixaDePe(o: Parameters<typeof caixa>[0]) {
	const c = caixa(o);
	return { dx: 0, dy: o.tipo === 'imagem' ? -c.hh : c.cy - o.y, hw: c.hw, hh: c.hh };
}

/** O objeto mais acima (a ordem do banco, depois o mais novo) sob um ponto da tela, na vista isométrica. */
export function objetoEmTela<T extends Parameters<typeof caixa>[0] & { ordem: number; criado_em: string; camada?: 'chao' | 'meio' | 'acima' | null }>(
	lista: T[],
	tx: number,
	ty: number,
	ancora: (x: number, y: number) => [number, number]
): T | null {
	return (
		[...lista]
			.sort((a, b) => camadaRank(b) - camadaRank(a) || b.ordem - a.ordem || b.criado_em.localeCompare(a.criado_em))
			.find((o) => {
				const [bx, by] = ancora(o.x, o.y);
				const c = caixaDePe(o);
				return Math.abs(tx - (bx + c.dx)) <= c.hw && Math.abs(ty - (by + c.dy)) <= c.hh;
			}) ?? null
	);
}

/** Mantém o centro dentro da cena (com uma folga: dá para puxar um objeto para a borda e deixar metade de fora). */
export const limitar = (v: number, max: number) => Math.min(max + 2, Math.max(-2, v));

/** O tamanho de uma imagem nova: lado maior em `ref` metros, mantendo a proporção. */
export function tamanhoInicial(larguraPx: number, alturaPx: number, ref: number) {
	const k = ref / Math.max(larguraPx, alturaPx, 1);
	return { largura: Math.max(0.25, Math.round(larguraPx * k * 4) / 4), altura: Math.max(0.25, Math.round(alturaPx * k * 4) / 4) };
}

/** O canto de redimensionar (inferior direito) e a alça de girar (acima do centro), em metros no mundo. */
export function alcas(o: Parameters<typeof dentro>[0] & { rotacao?: number }) {
	const c = caixa(o);
	const r = ((o.rotacao ?? 0) * Math.PI) / 180;
	const gira = (x: number, y: number) => ({ x: c.cx + x * Math.cos(r) - y * Math.sin(r), y: c.cy + x * Math.sin(r) + y * Math.cos(r) });
	return { canto: gira(c.hw, c.hh), girar: gira(0, -c.hh - 0.9), centro: { x: c.cx, y: c.cy }, hw: c.hw, hh: c.hh };
}

/** Claro ou escuro por cima de uma cor: o contorno do texto, para ler sobre qualquer mapa. */
export function contraste(hex: string | null | undefined): string {
	const n = parseInt((hex ?? '#f4e4d6').slice(1), 16);
	const lum = (0.299 * (n >> 16) + 0.587 * ((n >> 8) & 255) + 0.114 * (n & 255)) / 255;
	return lum > 0.55 ? '#1b1210' : '#f4e4d6';
}
