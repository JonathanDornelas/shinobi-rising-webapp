<script lang="ts">
	// L11 · CMP-37 · Quadro da Mesa: grade de 1 m (linha mais forte a cada 5 m), efeitos em cena, traços, moldes de
	// jutsu, tokens, réguas e ponteiros, em SVG. A vista (zoom e canto) fica no UiMesa; tudo no quadro é em metros.
	import { onMount, untrack } from 'svelte';
	import type { MesaToken } from '#lib/supabase/banco.ts';
	import { CORES, corCss } from '#lib/mesa/cores.ts';
	import { CONDICOES } from '#lib/personagem/dados.ts';
	import type { CorMesa } from '#lib/supabase/banco.ts';
	import { custoCaminho, custoTrechos, infoMovimento, provocaReacao, quadradosEmVolta, trechos, type Quadrado } from '#lib/mesa/geometria.ts';
	import type { Mesa } from '#lib/mesa/mesa.svelte.ts';
	import { urlImagemMesa } from '#lib/mesa/imagens.ts';
	import { retanguloFoco, type FocoArte } from '#lib/bestiario/foco.ts';
	import { calcularMolde, nomeCurto, type UiMesa } from '#lib/mesa/ui.svelte.ts';
	import type { MesaCena, MesaObjeto } from '#lib/supabase/banco.ts';
	import { caminhoNevoa, celulasEntre, emRuns, grade as gradeNevoa, indice as indiceNevoa, pintar as pintarNevoa, type Run } from '#lib/mesa/nevoa.ts';
import { FONTES, alcas, caixa as caixaObjeto, caixaDePe, contraste, limitar as limitarObj, objetoEm, objetoEmTela, tamanhoInicial } from '#lib/mesa/objetos.ts';
	import { ESTILOS, estiloDoJutsu, estiloValido } from '#lib/mesa/efeitos.ts';
	import { caixaDaCena, cfgIso, desfazerProjecao, emPe as emPeIso, inverter, matrizIso, ordemDePintura, projetar } from '#lib/mesa/projecao.ts';
	import { camadaEmPe, camadaPadrao, camadasDaCena, indiceDaCamada, indiceDosTokens } from '#lib/mesa/camadas.ts';
	import EfeitosFx from './EfeitosFx.svelte';

	let {
		mesa,
		ui,
		pvDe,
		deslocamentoDe,
		fotoDe,
		focoDe = () => null,
		onSoltar
	}: {
		mesa: Mesa;
		ui: UiMesa;
		/** PV e máximo que esta pessoa pode ver (null = só a faixa de ferimento). */
		pvDe: (t: MesaToken) => { pv: number; max: number } | null;
		deslocamentoDe: (t: MesaToken) => number;
		/** URL da foto do token (retrato do personagem, foto ou arte do NPC); null = só a sigla. */
		fotoDe: (t: MesaToken) => string | null;
		/** Enquadramento da arte do bestiário (null = a foto centralizada, já quadrada). */
		focoDe?: (t: MesaToken) => FocoArte | null;
		/** Algo arrastado do Elenco caiu no quadro. */
		onSoltar: (dados: string, x: number, y: number) => void;
	} = $props();

	const ESTADO_NOME: Record<string, string> = Object.fromEntries(CONDICOES.map((c) => [c.id, c.nome]));
	const FAIXA = [1, 0.75, 0.4, 0];
	/** Pixels por metro no zoom de 100% (os quadrados e os tokens crescem junto). */
	const BASE = 64;

	let caixa = $state<HTMLDivElement>();
	let svg = $state<SVGSVGElement>();
	let W = $state(800);
	let H = $state(600);
	const cena = $derived(mesa.cena);
	const L = $derived(cena?.largura ?? 40);
	const A = $derived(cena?.altura ?? 30);
	const fundo = $derived(urlImagemMesa(cena?.fundo));
	// Vista isométrica (planos/mapas-isometricos.md): os dados seguem na grade em metros e só o desenho muda. O chão entra
	// num grupo com a matriz da projeção; token, rótulo e imagem de objeto ficam "de pé" (emPe). A unidade da tela é o
	// "metro de tela" (1 de largura de losango); `ui.vx` e `ui.vy` são medidos nela (na vista de cima, é a própria grade).
	const iso = $derived(cena?.visao === 'isometrica');
	const cfgI = $derived(cfgIso(L, A, { tw: 1, eh: 0.25, razao: cena?.iso_razao ?? 2,rotacao: cena?.fundo ? (cena.iso_rotacao ?? 0) : (ui.isoRotacao ?? cena?.iso_rotacao ?? 0) }));
	const paraTela = (x: number, y: number, z = 0): [number, number] => (iso ? projetar(x, y, z, cfgI) : [x, y]);
	const daTela = (tx: number, ty: number): [number, number] => (iso ? inverter(tx, ty, 0, cfgI) : [tx, ty]);
	const matrizTxt = $derived(iso ? `matrix(${matrizIso(cfgI).join(' ')})` : '');
	const desfazer = $derived(iso ? desfazerProjecao(cfgI) : undefined);
	/** Põe de pé o que foi desenhado em (ax, ay), erguido `sobe` metros de tela; na vista de cima não faz nada. */
	const emPe = (ax: number, ay: number, sobe = 0) => (iso ? emPeIso(ax, ay, sobe, cfgI) : undefined);
	/** O quanto o sprite do token sobe: a base redonda toca o ponto de apoio, e a elevação soma. */
	const sobeToken = (t: MesaToken) => 0.4 * t.tamanho + (t.elevacao ?? 0) * 0.25;
// o fundo com escala: a proporção vem da própria imagem; MOVER O FUNDO arrasta (só o Mestre) e grava ao soltar
	let proporcaoFundo = $state(1);
	$effect(() => {
		const u = fundo;
		if (!u) return;
		const im = new Image();
		im.onload = () => (proporcaoFundo = im.naturalHeight / im.naturalWidth || 1);
		im.src = u;
	});
	let arrastoFundo = $state<{ mx: number; my: number; dx: number; dy: number } | null>(null);
	/**
	 * Ajustar a grade ao mapa (só o Mestre, nas duas vistas). O quadrado da grade nunca muda de tamanho (tokens e tudo o
	 * mais seguem na mesma proporção); quem se ajusta é o encaixe entre a grade e a imagem:
	 * - as quatro bordas e os quatro cantos põem ou tiram quadrados daquele lado (de quadrado em quadrado), com a imagem parada;
	 * - arrastar o miolo desliza a grade sobre o mapa, para as linhas caírem nas do piso desenhado;
	 * - a bolinha do primeiro quadrado aumenta ou diminui a imagem (presa no canto 0, 0 da grade) até o piso casar com os
	 *   quadrados.
	 * Por baixo, o que muda é a cena (tamanho) e onde o fundo fica nela; a câmera anda junto quando a grade anda.
	 */
	type Ajuste =
		| { tipo: 'borda'; x: -1 | 0 | 1; y: -1 | 0 | 1; ret: { x0: number; y0: number; x1: number; y1: number } }
		| { tipo: 'mover'; sx: number; sy: number; v0: [number, number]; img: { x: number; y: number; w: number } }
		| { tipo: 'quadrado'; o: [number, number]; q: [number, number]; img: { x: number; y: number; w: number } };
	type Alca = { tipo: 'borda'; x: -1 | 0 | 1; y: -1 | 0 | 1 } | { tipo: 'mover' } | { tipo: 'quadrado' };
	let ajuste = $state<Ajuste | null>(null);
	let alcaSob = $state<Alca | null>(null);
	/** A configuração da projeção para outro tamanho de cena (mesma vista e mesmo canto). */
	const cfgPara = (l: number, a: number) => cfgIso(l, a, { tw: 1, eh: 0.25, razao: cena?.iso_razao ?? 2, rotacao: cfgI.rotacao });
	/** O que gravar para a imagem ficar na caixa `t` (em tela) numa cena de `l` × `a`. */
	function fundoEm(t: { x: number; y: number; w: number }, l: number, a: number): Partial<MesaCena> {
		const b = iso ? caixaDaCena(cfgPara(l, a), 0, 0) : { x: 0, y: 0 };
		const r = (v: number) => Math.round(v * 1000) / 1000;
		return { fundo_escala: r(Math.min(1000, Math.max(1, t.w))), fundo_x: r(t.x - b.x), fundo_y: r(t.y - b.y) };
	}
	/** O ponto da grade (em metros da tela) visto na tela, em pixels do quadro. */
	const naTela = (gx: number, gy: number): [number, number] => {
		const [tx, ty] = paraTela(gx, gy);
		return [(tx - ui.vx) * s, (ty - ui.vy) * s];
	};
	// ao ligar o modo com o fundo esticado na cena, ele passa a ter tamanho próprio (no lugar em que está): só assim a grade
	// pode mudar por baixo dele sem a imagem esticar junto
	$effect(() => {
		if (!ui.bordas || !mesa.mestre || !cena?.fundo || cena.fundo_escala) return;
		untrack(() => void mesa.patchCena(fundoEm(caixaFundo, L, A)));
	});
	/** A alça sob o ponto, medida na tela (na isométrica as bordas são os lados do losango). */
	function alcaEm(p: { tx: number; ty: number; mx: number; my: number }, toque: boolean): Alca | null {
		if (!ui.bordas || !mesa.mestre || mesa.somenteLeitura) return null;
		const h = F(toque ? 22 : 10);
		const perto = (gx: number, gy: number, r: number) => {
			const [x, y] = paraTela(gx, gy);
			return Math.hypot(p.tx - x, p.ty - y) <= r;
		};
		for (const x of [-1, 1] as const) for (const y of [-1, 1] as const) if (perto(x < 0 ? 0 : L, y < 0 ? 0 : A, h * 1.6)) return { tipo: 'borda', x, y };
		if (fundo && perto(1, 1, h * 1.4)) return { tipo: 'quadrado' };
		const lado = (a: [number, number], b: [number, number]) => distSegmento(p.tx, p.ty, paraTela(...a), paraTela(...b)) <= h;
		if (lado([0, 0], [0, A])) return { tipo: 'borda', x: -1, y: 0 };
		if (lado([L, 0], [L, A])) return { tipo: 'borda', x: 1, y: 0 };
		if (lado([0, 0], [L, 0])) return { tipo: 'borda', x: 0, y: -1 };
		if (lado([0, A], [L, A])) return { tipo: 'borda', x: 0, y: 1 };
		if (fundo && p.mx >= 0 && p.my >= 0 && p.mx <= L && p.my <= A) return { tipo: 'mover' };
		return null;
	}
	function comecarAjuste(a: Alca, p: { sx: number; sy: number }) {
		const img = { x: caixaFundo.x, y: caixaFundo.y, w: caixaFundo.w };
		if (a.tipo === 'borda') ajuste = { ...a, ret: { x0: 0, y0: 0, x1: L, y1: A } };
		else if (a.tipo === 'mover') ajuste = { tipo: 'mover', sx: p.sx, sy: p.sy, v0: [ui.vx, ui.vy], img };
		else ajuste = { tipo: 'quadrado', o: naTela(0, 0), q: naTela(1, 1), img };
	}
	/** A imagem maior ou menor (fator `r`), presa no canto 0, 0 da grade; a grade e a câmera não mexem. */
	function escalarImagem(r: number, img: { x: number; y: number; w: number }) {
		const [ox, oy] = paraTela(0, 0);
		mesa.previa(fundoEm({ x: ox + (img.x - ox) * r, y: oy + (img.y - oy) * r, w: img.w * r }, L, A));
	}
	function moverAjuste(p: { sx: number; sy: number; mx: number; my: number }) {
		const a = ajuste;
		if (!a) return;
		if (a.tipo === 'borda') {
			// a borda puxada vai para a linha da grade mais perto do mouse; a cena fica entre 5 e 200 quadrados
			const r = { ...a.ret };
			if (a.x < 0) r.x0 = Math.max(L - 200, Math.min(L - 5, Math.round(p.mx)));
			if (a.x > 0) r.x1 = Math.min(200, Math.max(5, Math.round(p.mx)));
			if (a.y < 0) r.y0 = Math.max(A - 200, Math.min(A - 5, Math.round(p.my)));
			if (a.y > 0) r.y1 = Math.min(200, Math.max(5, Math.round(p.my)));
			ajuste = { ...a, ret: r };
		} else if (a.tipo === 'mover') {
			// a grade anda com o mouse e a imagem fica: a câmera vai junto com a grade e o fundo volta o mesmo tanto
			const d = [(p.sx - a.sx) / s, (p.sy - a.sy) / s];
			ui.vx = a.v0[0] - d[0];
			ui.vy = a.v0[1] - d[1];
			mesa.previa(fundoEm({ x: a.img.x - d[0], y: a.img.y - d[1], w: a.img.w }, L, A));
		} else {
			// a bolinha para fora aumenta a imagem e para dentro diminui: o fator é a projeção do mouse na diagonal do
			// primeiro quadrado (1 = onde a bolinha estava)
			const [ux, uy] = [a.q[0] - a.o[0], a.q[1] - a.o[1]];
			const r = ((p.sx - a.o[0]) * ux + (p.sy - a.o[1]) * uy) / (ux * ux + uy * uy || 1);
			escalarImagem(Math.min(20, Math.max(0.05, r)), a.img);
		}
	}
	async function soltarAjuste() {
		const a = ajuste;
		ajuste = null;
		if (!a || !cena) return;
		if (a.tipo !== 'borda') {
			await mesa.patchCena({ fundo_escala: cena.fundo_escala, fundo_x: cena.fundo_x, fundo_y: cena.fundo_y });
			return;
		}
		const { x0, y0, x1, y1 } = a.ret;
		if (x0 === 0 && y0 === 0 && x1 === L && y1 === A) return;
		const [l, alt, dx, dy] = [x1 - x0, y1 - y0, -x0, -y0];
		// o canto 0, 0 de antes vira o (dx, dy) da cena nova: a câmera anda o tanto que ele andaria na tela, e a imagem também
		const [ax, ay] = paraTela(0, 0);
		const [bx, by] = iso ? projetar(dx, dy, 0, cfgPara(l, alt)) : [dx, dy];
		const dv = [bx - ax, by - ay];
		const novoFundo = cena.fundo ? fundoEm({ x: caixaFundo.x + dv[0], y: caixaFundo.y + dv[1], w: caixaFundo.w }, l, alt) : {};
		const gravou = mesa.reenquadrarCena(dx, dy, l, alt, novoFundo);
		ui.vx += dv[0];
		ui.vy += dv[1];
		if (await gravou) ui.avisar(`A cena agora tem ${l} × ${alt} quadrados.`);
		else {
			ui.vx -= dv[0];
			ui.vy -= dv[1];
		}
	}
	/** Ajuste fino do tamanho da imagem (o − e o + do aviso). */
	function imagemUmPouco(r: number) {
		if (!cena?.fundo) return;
		escalarImagem(r, { x: caixaFundo.x, y: caixaFundo.y, w: caixaFundo.w });
		void mesa.patchCena({ fundo_escala: cena.fundo_escala, fundo_x: cena.fundo_x, fundo_y: cena.fundo_y });
	}
	const caixaFundo = $derived.by(() => {
		// isométrica: a arte (já isométrica, subida pelo Mestre) fica na tela, a partir do canto de cima à esquerda do mapa
		if (iso) {
			const b = caixaDaCena(cfgI, 0, 0);
			if (!cena?.fundo_escala) return b;
			const w = cena.fundo_escala;
			return { x: b.x + (cena.fundo_x ?? 0) + (arrastoFundo?.dx ?? 0), y: b.y + (cena.fundo_y ?? 0) + (arrastoFundo?.dy ?? 0), w, h: w * proporcaoFundo };
		}
		if (!cena?.fundo_escala) return { x: 0, y: 0, w: L, h: A };
		const w = cena.fundo_escala;
		return { x: (cena.fundo_x ?? 0) + (arrastoFundo?.dx ?? 0), y: (cena.fundo_y ?? 0) + (arrastoFundo?.dy ?? 0), w, h: w * proporcaoFundo };
	});
	const s = $derived(BASE * ui.zoom);
	/** A grade em dois traçados: as linhas de cada metro e, mais fortes, as de 5 em 5 m. */
	const grade1 = $derived.by(() => {
		let d = '';
		for (let i = 0; i <= L; i++) if (i % 5) d += `M${i} 0V${A}`;
		for (let j = 0; j <= A; j++) if (j % 5) d += `M0 ${j}H${L}`;
		return d;
	});
	const grade5 = $derived.by(() => {
		let d = '';
		for (let i = 0; i <= L; i += 5) d += `M${i} 0V${A}`;
		for (let j = 0; j <= A; j += 5) d += `M0 ${j}H${L}`;
		return d;
	});
	const F = (px: number) => px / s;
	// névoa: o grupo só vê o que está revelado (o Mestre vê tudo, com a névoa esmaecida por cima)
	const nevoaLigada = $derived(!!cena?.nevoa);
	const escondeDeMim = $derived(nevoaLigada && !mesa.mestre);
	let nevoaTemp = $state<Run[] | null>(null);
	const runsNevoa = $derived(nevoaTemp ?? cena?.reveladas ?? []);
	const revelado = $derived(indiceNevoa(runsNevoa));
	const caminhoDaNevoa = $derived(nevoaLigada ? caminhoNevoa(runsNevoa, L, A) : '');
	const visiveis = $derived(escondeDeMim ? mesa.tokens.filter((t) => revelado(t.x + t.tamanho / 2, t.y + t.tamanho / 2)) : mesa.tokens);
	const objetosVisiveis = $derived(escondeDeMim ? mesa.objetos.filter((o) => o.tipo === 'imagem' || revelado(o.x, o.y)) : mesa.objetos);
	/** As imagens ficam sob os tokens; os alfinetes e os textos, por cima. Cada grupo na ordem de empilhamento. */
	const porOrdem = (a: MesaObjeto, b: MesaObjeto) => a.ordem - b.ordem || a.criado_em.localeCompare(b.criado_em);
	// as imagens pela pilha de camadas da cena (de baixo para cima), cada uma na ordem do Mestre. Os tokens têm um lugar
	// na pilha: o que está abaixo fica sob eles, o que está acima fica sobre eles.
	const camadas = $derived(camadasDaCena(cena?.camadas));
	const iTokens = $derived(indiceDosTokens(camadas));
	const indiceDe = (o: MesaObjeto) => indiceDaCamada(o.camada, camadas);
	const imagens = $derived(objetosVisiveis.filter((o) => o.tipo === 'imagem').sort((a, b) => indiceDe(a) - indiceDe(b) || porOrdem(a, b)));
	/** Na vista isométrica, as camadas "em pé" entram na ordem de pintura com os tokens (passam à frente ou atrás de cada um). */
	const doMeio = (o: MesaObjeto) => iso && camadaEmPe(o.camada, camadas);
	const imagensBaixo = $derived(imagens.filter((o) => indiceDe(o) < iTokens && !doMeio(o)));
	const imagensMeio = $derived(imagens.filter(doMeio));
	const imagensAcima = $derived(imagens.filter((o) => indiceDe(o) > iTokens && !doMeio(o)));
	/** Quem fica por cima no clique: alfinete e texto, depois as imagens da camada mais alta. */
	const rankDe = (o: MesaObjeto) => (o.tipo === 'imagem' ? indiceDe(o) : 1000);
	const marcadores = $derived(objetosVisiveis.filter((o) => o.tipo !== 'imagem').sort(porOrdem));
	let objArrasto = $state<{ id: string; modo: 'mover' | 'redim' | 'girar'; dx: number; dy: number; ini: MesaObjeto; patch: Partial<MesaObjeto> } | null>(null);
	const mostrado = (o: MesaObjeto): MesaObjeto => (objArrasto?.id === o.id ? { ...o, ...objArrasto.patch } : o);
	const objetoSel = $derived(ui.objSel ? (mesa.objetos.find((o) => o.id === ui.objSel) ?? null) : null);
	/** Rascunho do texto novo (a caixa de digitação sobre o quadro). */
	let rascunho = $state<{ x: number; y: number; texto: string } | null>(null);
	const molde = $derived(ui.mira ? calcularMolde(ui.mira, mesa, visiveis.filter((t) => t.visivel || mesa.mestre)) : null);

	// relógio para o que some aos poucos (Apontar, régua solta, traços temporários)
	let agora = $state(Date.now());
	const temAlgoSumindo = $derived(mesa.temporarios.length > 0 || (ui.regua?.feita && !ui.regua.fixa) || Object.values(mesa.reguas).some((r) => r.feita && !r.fixa));
	$effect(() => {
		if (!temAlgoSumindo) return;
		const i = setInterval(() => {
			agora = Date.now();
			mesa.temporarios = mesa.temporarios.filter((t) => agora - t.t < 3000);
			if (ui.regua?.feita && !ui.regua.fixa && agora - ui.regua.t > 3000) ui.regua = null;
		}, 80);
		return () => clearInterval(i);
	});

	// ------------------------------------------------------------------ coordenadas
	function ponto(e: { clientX: number; clientY: number }) {
		const r = svg!.getBoundingClientRect();
		const sx = e.clientX - r.left;
		const sy = e.clientY - r.top;
		const tx = sx / s + ui.vx;
		const ty = sy / s + ui.vy;
		const [mx, my] = daTela(tx, ty);
		return { sx, sy, tx, ty, mx, my };
}
	const grade = (mx: number, my: number): Quadrado => [Math.min(L - 1, Math.max(0, Math.floor(mx))), Math.min(A - 1, Math.max(0, Math.floor(my)))];
	/** Na vista isométrica, tokens e imagens de pé juntos, de trás para a frente (um token atrás de uma árvore fica atrás dela). */
	type ItemPe = { id: string; x: number; y: number; tamanho: number; z: number } & ({ k: 'token'; t: MesaToken } | { k: 'imagem'; o: MesaObjeto });
	const tokensPe = $derived(iso ? ordemDePintura(visiveis, cfgI) : visiveis);
	const pePintura = $derived.by((): ItemPe[] => {
		if (!iso) return [];
		const itens: ItemPe[] = [
			...visiveis.map((t): ItemPe => ({ id: 'T' + t.id, k: 'token', t, x: t.x, y: t.y, tamanho: t.tamanho, z: t.elevacao ?? 0 })),
...imagensMeio.map((o): ItemPe => ({ id: 'I' + o.id, k: 'imagem', o, x: o.x - 0.5, y: o.y - 0.5, tamanho: 1, z: 0 }))
		];
		return ordemDePintura(itens, cfgI);
	});
	function tokenEm(mx: number, my: number): MesaToken | null {
		if (!iso) return [...visiveis].reverse().find((t) => (t.visivel || mesa.mestre) && mx >= t.x && mx < t.x + t.tamanho && my >= t.y && my < t.y + t.tamanho) ?? null;
		// isométrica: acerta a base (o losango do token) ou o sprite de pé; o da frente ganha
		const [tx, ty] = paraTela(mx, my);
		for (const t of [...tokensPe].reverse()) {
			if (!(t.visivel || mesa.mestre)) continue;
			const n = t.tamanho;
			if (mx >= t.x && mx < t.x + n && my >= t.y && my < t.y + n) return t;
			const [cx, cy] = paraTela(t.x + n / 2, t.y + n / 2);
			if (Math.hypot(tx - cx, ty - (cy - sobeToken(t))) <= 0.5 * n) return t;
		}
		return null;
	}

	function distSegmento(px: number, py: number, a: number[], b: number[]) {
		const dx = b[0] - a[0];
		const dy = b[1] - a[1];
		const l = dx * dx + dy * dy || 1;
		const k = Math.max(0, Math.min(1, ((px - a[0]) * dx + (py - a[1]) * dy) / l));
		return Math.hypot(px - (a[0] + k * dx), py - (a[1] + k * dy));
	}
	const tracoEm = (mx: number, my: number) => [...mesa.tracos].reverse().find((t) => t.pontos.some((p, i) => i > 0 && distSegmento(mx, my, t.pontos[i - 1], p) < 0.3)) ?? null;

	// ------------------------------------------------------------------ vista
	/** Ajustar à tela; na abertura, sem deixar os tokens minúsculos (zoom mínimo de 67%, centrado no grupo). */
	export function ajustar(inicial = false) {
		if (!W || !H) return;
		const area = iso ? caixaDaCena(cfgI, 0.5, 1) : { x: 0, y: 0, w: L, h: A };
		const caber = Math.min(W / (area.w * BASE), H / (area.h * BASE)) * 0.96;
		ui.zoom = Math.max(0.25, Math.min(4, inicial ? Math.max(caber, 0.9) : caber));
		const ts = mesa.tokens.filter((t) => t.visivel || mesa.mestre);
		const cs = ts.map((t) => paraTela(t.x + t.tamanho / 2, t.y + t.tamanho / 2));
		const [cx, cy] = inicial && ts.length && caber < 0.9 ? [cs.reduce((a, c) => a + c[0], 0) / cs.length, cs.reduce((a, c) => a + c[1], 0) / cs.length] : [area.x + area.w / 2, area.y + area.h / 2];
		ui.vx = cx - W / (BASE * ui.zoom) / 2;
		ui.vy = cy - H / (BASE * ui.zoom) / 2;
	}
	export function centralizar(t: MesaToken) {
		const [px, py] = paraTela(t.x + t.tamanho / 2, t.y + t.tamanho / 2);
		ui.vx = px - W / s / 2;
		ui.vy = py - H / s / 2;
}
	/** Quadrado no centro da vista (onde entra quem é posto sem posição). */
	export function centroDaVista(): [number, number] {
		const [gx, gy] = daTela(ui.vx + W / s / 2, ui.vy + H / s / 2);
		return [Math.min(L - 1, Math.max(0, Math.floor(gx))), Math.min(A - 1, Math.max(0, Math.floor(gy)))];
	}
	export function zoomEm(fator: number, sx = W / 2, sy = H / 2) {
		const z = Math.max(0.25, Math.min(4, ui.zoom * fator));
		const mx = sx / s + ui.vx;
		const my = sy / s + ui.vy;
		ui.zoom = z;
		ui.vx = mx - sx / (BASE * z);
		ui.vy = my - sy / (BASE * z);
	}
	let vistaAnterior = '';
	$effect(() => {
		const k = `${cena?.id}:${iso}:${cfgI.rotacao}:${cfgI.razao}`;
		const mudou = !!vistaAnterior && k !== vistaAnterior;
		vistaAnterior = k;
		if (mudou) untrack(() => ajustar());
	});
	onMount(() => {
		const roda = (e: WheelEvent) => {
			e.preventDefault();
			const p = ponto(e);
			zoomEm(e.deltaY < 0 ? 1.12 : 1 / 1.12, p.sx, p.sy);
		};
		caixa!.addEventListener('wheel', roda, { passive: false });
		requestAnimationFrame(() => ajustar(true));
		return () => caixa?.removeEventListener('wheel', roda);
	});

	// ------------------------------------------------------------------ ponteiro
	let arrasto = $state<{ id: string; x: number; y: number; dx: number; dy: number } | null>(null);
	let pan: { sx: number; sy: number; vx: number; vy: number } | null = null;
	let desenho = $state<[number, number][] | null>(null);
	const toques = new Map<number, { x: number; y: number }>();
	let pinca: { d: number; zoom: number } | null = null;
	let segurar: ReturnType<typeof setTimeout> | undefined;
	let espaco = false;
	let hoverTimer: ReturnType<typeof setTimeout> | undefined;
	/** Terreno difícil sendo pintado (só o Mestre): o primeiro quadrado decide se o arrasto põe ou tira. */
	let pintura = $state<{ por: boolean; feitos: Set<string> } | null>(null);
	const terrenoVisivel = $derived(pintura ? pintura.feitos : mesa.terreno);
	function pintar(g: Quadrado) {
		if (!pintura) return;
		const k = `${g[0]},${g[1]}`;
		if (pintura.feitos.has(k) === pintura.por) return;
		const feitos = new Set(pintura.feitos);
		if (pintura.por) feitos.add(k);
		else feitos.delete(k);
		pintura = { ...pintura, feitos };
	}

	$effect(() => {
		// o espaço segura para arrastar a vista; num botão que ficou com o foco do clique do mouse (o último clicado, como o da
		// grade) ele também "clicaria" o botão ao soltar e desfaria o clique. Ali o espaço não chega ao botão; com o foco vindo
		// do teclado (:focus-visible) o espaço segue apertando o botão, e campos de texto recebem normalmente
		const noBotao = (e: KeyboardEvent) => e.target instanceof Element && !!e.target.closest('button, [role="button"], [role="switch"], [role="tab"], [role="radio"]') && !e.target.matches(':focus-visible');
		const baixo = (e: KeyboardEvent) => {
			if (e.code !== 'Space') return;
			if (noBotao(e)) e.preventDefault();
			espaco = true;
		};
		const cima = (e: KeyboardEvent) => {
			if (e.code !== 'Space') return;
			if (noBotao(e)) e.preventDefault();
			espaco = false;
		};
		addEventListener('keydown', baixo);
		addEventListener('keyup', cima);
		return () => {
			removeEventListener('keydown', baixo);
			removeEventListener('keyup', cima);
		};
	});

	function aoBaixar(e: PointerEvent) {
		if (e.button === 2) return;
		// Alt+clique: ping no mapa, com qualquer ferramenta
		if (e.altKey && e.button === 0) {
			const q = ponto(e);
			mesa.ping(q.mx, q.my);
			return;
		}
		svg!.setPointerCapture(e.pointerId);
		toques.set(e.pointerId, { x: e.clientX, y: e.clientY });
		if (toques.size === 2) {
			const [a, b] = [...toques.values()];
			pinca = { d: Math.hypot(a.x - b.x, a.y - b.y), zoom: ui.zoom };
			arrasto = null;
			pan = null;
			return;
		}
		const p = ponto(e);
		const g = grade(p.mx, p.my);
		const t = tokenEm(p.mx, p.my);
		ui.pop = null;
		clearTimeout(hoverTimer);
		if (e.pointerType === 'mouse') ui.hover = null;
		if (e.button === 1 || espaco) {
			pan = { sx: p.sx, sy: p.sy, vx: ui.vx, vy: ui.vy };
			return;
		}
		const alca = alcaEm(p, e.pointerType === 'touch');
		if (alca && cena) {
			comecarAjuste(alca, p);
			return;
		}
		// mira de jutsu: clique escolhe alvo ou fixa o molde
		const m = ui.mira;
		if (m && !m.fixa) {
			if (m.jutsu.regua.forma === 'alvos') {
				if (t && t.id !== m.lancador) {
					const max = m.jutsu.regua.alvos ?? 1;
					const tem = m.alvos.includes(t.id);
					ui.mira = { ...m, alvos: tem ? m.alvos.filter((a) => a !== t.id) : [...m.alvos, t.id].slice(-max) };
				}
			} else ui.mira = { ...m, fixa: true, tx: g[0], ty: g[1], px: p.mx, py: p.my };
			return;
		}
		if (e.pointerType === 'touch' && t) {
			clearTimeout(segurar);
			segurar = setTimeout(() => (ui.hover = { token: t.id, x: p.sx, y: p.sy }), 550);
		}
		if (objetosNoClique(e, p)) return;
		switch (ui.ferramenta) {
			case 'nevoa': {
				if (!mesa.mestre || mesa.somenteLeitura) break;
				const grade = gradeNevoa(cena?.reveladas ?? [], L, A);
				const revelar = (ui.nevoaModo === 'revelar') !== e.shiftKey;
				nevoaPintura = { grade, revelar, ultimo: g };
				pintarNevoa(grade, L, A, g[0], g[1], ui.nevoaPincel, revelar);
				nevoaTemp = emRuns(grade, L, A);
				break;
			}
			case 'mover':
				if (t) {
					ui.sel = t.id;
					if (mesa.podeMover(t)) arrasto = { id: t.id, x: t.x, y: t.y, dx: p.mx - t.x, dy: p.my - t.y };
					else if (e.pointerType !== 'touch') ui.avisar(mesa.travada ? 'Mesa travada pelo Mestre.' : 'Só o dono e o Mestre movem este token.');
				} else {
					ui.sel = null;
					pan = { sx: p.sx, sy: p.sy, vx: ui.vx, vy: ui.vy };
				}
				break;
			case 'medir':
				if (!ui.regua || ui.regua.feita) ui.regua = { pontos: [g], cur: g, feita: false, fixa: false, t: Date.now() };
				else ui.regua = { ...ui.regua, pontos: [...ui.regua.pontos, g] };
				break;
			case 'lapis':
			case 'apontar':
				desenho = [[+p.mx.toFixed(2), +p.my.toFixed(2)]];
				break;
			case 'borracha': {
				const k = tracoEm(p.mx, p.my);
				if (k && (k.autor_id === mesa.eu || mesa.mestre)) mesa.apagarTraco(k.id);
				else if (k) ui.avisar('Esse traço é de outra pessoa.');
				break;
			}
			case 'fundo': {
				if (mesa.mestre && cena?.fundo_escala) arrastoFundo = iso ? { mx: p.tx, my: p.ty, dx: 0, dy: 0 } : { mx: p.mx, my: p.my, dx: 0, dy: 0 };
				break;
			}
			case 'terreno':
				if (!mesa.mestre || mesa.somenteLeitura) break;
				pintura = { por: !mesa.terreno.has(`${g[0]},${g[1]}`), feitos: new Set(mesa.terreno) };
				pintar(g);
				break;
		}
	}

	// ------------------------------------------------------------------ objetos e névoa: clique, arrasto e soltura
	let nevoaPintura: { grade: Uint8Array; revelar: boolean; ultimo: Quadrado } | null = null;
	const arred = (v: number, casas = 2) => Math.round(v * 10 ** casas) / 10 ** casas;
	/** Um clique que pertence a um objeto (alça, alfinete, texto ou imagem) ou que põe um novo; true se tratou. */
function objetosNoClique(e: PointerEvent, p: { mx: number; my: number; sx: number; sy: number; tx: number; ty: number }): boolean {
		const f = ui.ferramenta;
		if (f !== 'mover' && f !== 'alfinete' && f !== 'texto' && f !== 'objeto') return false;
		// alças do objeto selecionado: girar e redimensionar
		// isométrica: só o canto de baixo da imagem (de pé, a imagem não gira)
		if (iso && objetoSel && mesa.podeMexerObjeto(objetoSel) && objetoSel.tipo === 'imagem') {
			const [bx, by] = paraTela(objetoSel.x, objetoSel.y);
			if (Math.hypot(p.tx - (bx + (objetoSel.largura ?? 1) / 2), p.ty - by) < Math.max(0.5, F(14))) return void (objArrasto = { id: objetoSel.id, modo: 'redim', dx: 0, dy: 0, ini: objetoSel, patch: {} }), true;
		}
		if (!iso && objetoSel && mesa.podeMexerObjeto(objetoSel) && objetoSel.tipo !== 'alfinete') {
			const al = alcas(objetoSel);
			const perto = (q: { x: number; y: number }) => Math.hypot(p.mx - q.x, p.my - q.y) < Math.max(0.5, F(14));
			if (perto(al.girar)) return void (objArrasto = { id: objetoSel.id, modo: 'girar', dx: 0, dy: 0, ini: objetoSel, patch: {} }), true;
			if (perto(al.canto)) return void (objArrasto = { id: objetoSel.id, modo: 'redim', dx: 0, dy: 0, ini: objetoSel, patch: {} }), true;
		}
		// com a ferramenta Objeto, as imagens também se pegam (nas outras, o mapa continua arrastável por baixo)
const lista = f === 'objeto' && !ui.armada ? objetosVisiveis : marcadores;
		const alvo = iso ? objetoEmTela(lista, p.tx, p.ty, paraTela, rankDe) : objetoEm(lista, p.mx, p.my, rankDe);
		if (alvo) {
			ui.objSel = alvo.id;
			if (mesa.podeMexerObjeto(alvo)) objArrasto = { id: alvo.id, modo: 'mover', dx: p.mx - alvo.x, dy: p.my - alvo.y, ini: alvo, patch: {} };
			else if (e.pointerType !== 'touch') ui.avisar(alvo.tipo === 'imagem' ? 'Só o Mestre mexe nas imagens.' : 'Esse objeto é de outra pessoa.');
			return true;
		}
		if (f === 'mover') {
			ui.objSel = null;
			return false;
		}
		if (mesa.somenteLeitura || (mesa.travada && !mesa.mestre)) return void ui.avisar('Mesa travada pelo Mestre.'), true;
		const x = arred(p.mx, 1);
		const y = arred(p.my, 1);
		if (f === 'alfinete') {
			void mesa.colocarObjeto({ tipo: 'alfinete', x, y, cor: ui.alfineteCor }).then((o) => o && (ui.objSel = o.id));
			return true;
		}
		if (f === 'texto') {
			ui.objSel = null;
			rascunho = { x, y, texto: '' };
			return true;
		}
		// objeto: põe a arte armada (maior lado = um terço da cena) e solta a ferramenta para mexer nela
		if (ui.armada) {
			const a = ui.armada;
			const { largura, altura } = tamanhoInicial(a.w, a.h, Math.max(2, Math.min(L, A) / 3));
			void mesa.colocarObjeto({ tipo: 'imagem', x, y, largura, altura, imagem: a.caminho, camada: camadaPadrao(camadas) }).then((o) => o && (ui.objSel = o.id));
			ui.armada = null;
			return true;
		}
		ui.objSel = null;
		return false;
	}
	async function confirmarTexto() {
		const r = rascunho;
		rascunho = null;
		if (!r || !r.texto.trim()) return;
		const n = ui.textoNovo;
		const o = await mesa.colocarObjeto({ tipo: 'texto', x: r.x, y: r.y, texto: r.texto.trim().slice(0, 300), fonte: n.fonte, cor: n.cor, tamanho: n.tamanho });
		if (o) ui.objSel = o.id;
	}
	/** O arrasto de um objeto: mover, girar ou redimensionar (arredonda para o banco). */
function arrastarObjeto(p: { mx: number; my: number; tx: number; ty: number }, shift: boolean) {
		const a = objArrasto!;
		const o = a.ini;
		if (a.modo === 'mover') {
			a.patch = { x: arred(limitarObj(p.mx - a.dx, L), shift ? 0 : 2), y: arred(limitarObj(p.my - a.dy, A), shift ? 0 : 2) };
			if (shift) a.patch = { x: Math.round(p.mx - a.dx), y: Math.round(p.my - a.dy) };
			return;
		}
		// isométrica: a largura é a distância, na tela, do apoio ao canto de baixo; a proporção se mantém
		if (iso && a.modo === 'redim' && o.tipo === 'imagem') {
			const lx = Math.abs(p.tx - paraTela(o.x, o.y)[0]);
			const k = Math.min(400, Math.max(0.25, 2 * Math.max(lx, 0.125))) / (o.largura ?? 1);
			a.patch = { largura: arred((o.largura ?? 1) * k, 2), altura: arred(Math.min(400, Math.max(0.25, (o.altura ?? 1) * k)), 2) };
			return;
		}
		const c = caixaObjeto(o);
		if (a.modo === 'girar') {
			let graus = (Math.atan2(p.my - c.cy, p.mx - c.cx) * 180) / Math.PI + 90;
			if (shift) graus = Math.round(graus / 15) * 15;
			a.patch = { rotacao: arred(((((graus + 180) % 360) + 360) % 360) - 180, 1) };
			return;
		}
		// redimensionar: a distância ao centro, no sentido da imagem (sem a rotação), decide o novo tamanho
		const r = (-(o.rotacao ?? 0) * Math.PI) / 180;
		const dx = p.mx - c.cx;
		const dy = p.my - c.cy;
		const lx = Math.abs(dx * Math.cos(r) - dy * Math.sin(r));
		if (o.tipo === 'imagem') {
			const k = Math.min(400, Math.max(0.25, 2 * Math.max(lx, 0.125))) / (o.largura ?? 1);
			a.patch = { largura: arred((o.largura ?? 1) * k, 2), altura: arred(Math.min(400, Math.max(0.25, (o.altura ?? 1) * k)), 2) };
		} else {
			const k = Math.hypot(dx, dy) / Math.max(0.2, Math.hypot(c.hw, c.hh));
			a.patch = { tamanho: arred(Math.min(20, Math.max(0.2, (o.tamanho ?? 1) * k)), 2) };
		}
	}

	function aoMover(e: PointerEvent) {
		if (toques.has(e.pointerId)) toques.set(e.pointerId, { x: e.clientX, y: e.clientY });
		if (pinca && toques.size === 2) {
			const [a, b] = [...toques.values()];
			const r = svg!.getBoundingClientRect();
			zoomEm((pinca.zoom * (Math.hypot(a.x - b.x, a.y - b.y) / pinca.d)) / ui.zoom, (a.x + b.x) / 2 - r.left, (a.y + b.y) / 2 - r.top);
			return;
		}
		const p = ponto(e);
		const g = grade(p.mx, p.my);
		if (ajuste) return moverAjuste(p);
		alcaSob = ui.bordas ? alcaEm(p, e.pointerType === 'touch') : null;
		if (pan) {
			ui.vx = pan.vx - (p.sx - pan.sx) / s;
			ui.vy = pan.vy - (p.sy - pan.sy) / s;
			clearTimeout(segurar);
			return;
		}
		if (arrasto) {
			clearTimeout(segurar);
			const t = mesa.tokens.find((k) => k.id === arrasto!.id);
			if (!t) return;
			const x = Math.min(L - t.tamanho, Math.max(0, Math.round(p.mx - arrasto.dx)));
			const y = Math.min(A - t.tamanho, Math.max(0, Math.round(p.my - arrasto.dy)));
			if (x !== arrasto.x || y !== arrasto.y) {
				arrasto = { ...arrasto, x, y };
				mesa.enviar('fantasma', { token: t.id, x, y });
			}
			return;
		}
		if (pintura) return pintar(g);
		if (objArrasto) return arrastarObjeto(p, e.shiftKey);
		if (nevoaPintura) {
			const n = nevoaPintura;
			let mudou = false;
			for (const [x, y] of celulasEntre(n.ultimo[0], n.ultimo[1], g[0], g[1])) mudou = pintarNevoa(n.grade, L, A, x, y, ui.nevoaPincel, n.revelar) || mudou;
			n.ultimo = g;
			if (mudou) nevoaTemp = emRuns(n.grade, L, A);
			return;
		}
		if (arrastoFundo)return void (arrastoFundo = { ...arrastoFundo, dx: (iso ? p.tx : p.mx) - arrastoFundo.mx, dy: (iso ? p.ty : p.my) - arrastoFundo.my });
		const m = ui.mira;
		if (m && !m.fixa) {
			ui.mira = { ...m, tx: g[0], ty: g[1], px: p.mx, py: p.my, travar: e.shiftKey };
			return;
		}
		if (ui.ferramenta === 'medir' && ui.regua && !ui.regua.feita) {
			ui.regua = { ...ui.regua, cur: g };
			mesa.enviar('regua', { pontos: [...ui.regua.pontos, g], feita: false, fixa: false });
			return;
		}
		if (desenho) {
			const ultimo = desenho[desenho.length - 1];
			if (Math.hypot(p.mx - ultimo[0], p.my - ultimo[1]) > 0.12) {
				const novo: [number, number] = [+p.mx.toFixed(2), +p.my.toFixed(2)];
				desenho = e.shiftKey ? [desenho[0], novo] : [...desenho, novo];
			}
			return;
		}
		// cartão do token (hover com atraso) e autor do traço (borracha)
		const t = e.pointerType === 'mouse' && !e.buttons ? tokenEm(p.mx, p.my) : null;
		clearTimeout(hoverTimer);
		if (t) {
			if (ui.hover?.token !== t.id) hoverTimer = setTimeout(() => (ui.hover = { token: t.id, x: p.sx, y: p.sy }), 250);
		} else if (ui.hover && e.pointerType === 'mouse') hoverTimer = setTimeout(() => (ui.hover = null), 300);
		tracoSob = ui.ferramenta === 'borracha' ? tracoEm(p.mx, p.my) : null;
		if (tracoSob) posTraco = [p.mx, p.my];
	}
	let tracoSob = $state<{ id: string; autor_id: string } | null>(null);
	let posTraco = $state<[number, number]>([0, 0]);

	function aoSoltar(e: PointerEvent) {
		toques.delete(e.pointerId);
		clearTimeout(segurar);
		if (pinca) {
			if (toques.size < 2) pinca = null;
			return;
		}
		pan = null;
		if (objArrasto) {
			const a = objArrasto;
			objArrasto = null;
			if (Object.keys(a.patch).length) void mesa.atualizarObjeto(a.id, a.patch);
			return;
		}
		if (nevoaPintura) {
			const grade = nevoaPintura.grade;
			nevoaPintura = null;
			// pintar com a névoa desligada liga ela: o resto do mapa fica coberto
			const runs = emRuns(grade, L, A);
			nevoaTemp = null;
			void mesa.patchCena({ nevoa: true, reveladas: runs });
			return;
		}
		if (ajuste) return void soltarAjuste();
		if (arrastoFundo) {
			const c = caixaFundo;
			arrastoFundo = null;
			mesa.patchCena({ fundo_x: Math.round(c.x * 10) / 10, fundo_y: Math.round(c.y * 10) / 10 });
			return;
		}
		if (pintura) {
			const feitos = pintura.feitos;
			pintura = null;
			mesa.definirTerreno([...feitos].map((k) => k.split(',').map(Number) as [number, number]));
			return;
		}
		if (arrasto) {
			const t = mesa.tokens.find((k) => k.id === arrasto!.id);
			const a = arrasto;
			arrasto = null;
			mesa.enviar('fantasma', null, true);
			if (t && (a.x !== t.x || a.y !== t.y)) {
				// o turno conta o deslocamento gasto: no terreno difícil, cada metro custa 2
				const { custo } = custoCaminho(t, a, mesa.terreno);
				const D = deslocamentoDe(t);
				const info = infoMovimento(custo, mesa.daVez.has(t.id) ? t.movido : 0, D);
				ui.anuncio = info.faixa === 'normal' ? `${t.nome}: ${info.total} m andados, sobram ${D - info.total} m` : info.faixa === 'sprint' ? `${t.nome}: ${info.total} m andados, com sprint` : `${t.nome}: ${info.texto}`;
				mesa.mover(t.id, a.x, a.y, custo);
			}
			return;
		}
		if (desenho) {
			const pts = desenho;
			desenho = null;
			// um clique simples com o Apontar é um ping
			if (pts.length < 2) return void ((ui.modoLapis === 'apontar' || ui.ferramenta === 'apontar') && mesa.ping(pts[0][0], pts[0][1]));
			if (ui.modoLapis === 'apontar' || ui.ferramenta === 'apontar') {
				const temp = { id: crypto.randomUUID(), usuario: mesa.eu, pontos: pts, espessura: ui.espessura, t: Date.now() };
				mesa.temporarios = [...mesa.temporarios, temp];
				mesa.enviar('apontar', temp, true);
			} else mesa.desenhar(simplificar(pts), ui.espessura);
		}
	}

	function aoClicarDuplo(e: MouseEvent) {
		const p = ponto(e);
		if (ui.ferramenta === 'medir' && ui.regua && !ui.regua.feita) {
			const pontos = ui.regua.pontos.filter((q, i, arr) => i === 0 || q[0] !== arr[i - 1][0] || q[1] !== arr[i - 1][1]);
			ui.regua = { ...ui.regua, pontos, cur: null, feita: true, t: Date.now() };
			mesa.enviar('regua', { pontos, feita: true, fixa: false }, true);
			return;
		}
		const t = tokenEm(p.mx, p.my);
		if (t) ui.abrirFicha(t.id);
	}

	/** Tira pontos quase em linha reta (o traço salvo fica leve). */
	function simplificar(pts: [number, number][]) {
		if (pts.length <= 3) return pts;
		const out: [number, number][] = [pts[0]];
		for (let i = 1; i < pts.length - 1; i++) {
			const a = out[out.length - 1];
			if (distSegmento(pts[i][0], pts[i][1], a, pts[i + 1]) > 0.04) out.push(pts[i]);
		}
		out.push(pts[pts.length - 1]);
		return out.slice(0, 2000);
	}

	function aoArrastarSobre(e: DragEvent) {
		if (e.dataTransfer?.types.includes('text/x-mesa')) e.preventDefault();
	}
	function aoLargar(e: DragEvent) {
		const d = e.dataTransfer?.getData('text/x-mesa');
		if (!d) return;
		e.preventDefault();
		const p = ponto(e);
		const g = grade(p.mx, p.my);
		onSoltar(d, g[0], g[1]);
	}

	// ------------------------------------------------------------------ desenho
	const caminho = (pts: number[][]) => pts.map((p, i) => `${i ? 'L' : 'M'}${p[0].toFixed(2)} ${p[1].toFixed(2)}`).join(' ');
	const larguraRotulo = (txt: string) => F(txt.length * 7 + 14);
	const arrastado = $derived(arrasto ? mesa.tokens.find((t) => t.id === arrasto!.id) : null);
	const infoArrasto = $derived.by(() => {
		if (!arrasto || !arrastado || (arrasto.x === arrastado.x && arrasto.y === arrastado.y)) return null;
		const destino = { x: arrasto.x, y: arrasto.y, tamanho: arrastado.tamanho };
		const { metros, custo } = custoCaminho(arrastado, destino, mesa.terreno);
		const info = infoMovimento(custo, mesa.daVez.has(arrastado.id) ? arrastado.movido : 0, deslocamentoDe(arrastado));
		const pc = !!arrastado.personagem_id || (!arrastado.npc_id && !!arrastado.dono_id);
		const inimigos = visiveis.filter((e) => e.id !== arrastado.id && e.visivel && (pc ? !!e.npc_id && !e.aliado : !!e.personagem_id || (!e.npc_id && !!e.dono_id)));
		const reacao = provocaReacao(arrastado, destino, inimigos).map((e) => nomeCurto(e.nome));
		const cor = info.faixa === 'normal' ? corCss(mesa.corDe(mesa.donoDe(arrastado))) : info.faixa === 'sprint' ? 'var(--acc)' : 'var(--mesa-vermelhao)';
		return { ...info, cor, reacao: reacao.length ? `provoca reação de ${reacao.join(', ')}` : '', terreno: custo > metros ? `terreno difícil: ${metros} m custam ${custo} m` : '' };
	});
	const aneis = $derived.by(() => {
		const a = ui.aneis;
		const t = a && mesa.tokens.find((k) => k.id === a.token);
		if (!a || !t || !cena) return null;
		return { t, corId: mesa.corDe(mesa.donoDe(t)), cor: corCss(mesa.corDe(mesa.donoDe(t))), corpo: a.corpo ? quadradosEmVolta(t, a.corpo, L, A) : [], lista: a.lista };
	});
	const reguaMinha = $derived(ui.regua ? { pontos: ui.regua.cur ? [...ui.regua.pontos, ui.regua.cur] : ui.regua.pontos, feita: ui.regua.feita, fixa: ui.regua.fixa, t: ui.regua.t } : null);
	/** O cursor da alça aponta para onde ela anda na tela (na isométrica os lados do losango ficam na diagonal). */
	function cursorAlca(a: Alca) {
		if (a.tipo === 'mover') return 'move';
		const [ox, oy] = a.tipo === 'quadrado' ? paraTela(0, 0) : paraTela(L / 2, A / 2);
		const [px, py] = a.tipo === 'quadrado' ? paraTela(1, 1) : paraTela((L / 2) * (1 + a.x), (A / 2) * (1 + a.y));
		const ang = ((((Math.atan2(py - oy, px - ox) * 180) / Math.PI) % 180) + 180) % 180;
		return ang < 22.5 || ang >= 157.5 ? 'ew-resize' : ang < 67.5 ? 'nwse-resize' : ang < 112.5 ? 'ns-resize' : 'nesw-resize';
	}
	const cursor = $derived(
		ajuste || alcaSob ? cursorAlca(ajuste ?? alcaSob!) : arrasto || pan ? 'grabbing' : ui.mira && !ui.mira.fixa ? 'crosshair' : ui.ferramenta === 'mover' ? 'default' : ui.ferramenta === 'borracha' || ui.ferramenta === 'terreno' ? 'cell' : ui.ferramenta === 'fundo' ? 'move' : ui.ferramenta === 'objeto' && ui.armada ? 'copy' : ui.ferramenta === 'nevoa' ? 'cell' : 'crosshair'
	);
	const corMolde = $derived(molde ? (molde.ok ? corCss(mesa.corDe(mesa.donoDe(molde.lancador))) : 'var(--mesa-vermelhao)') : '');
	const letras = (i: number) => (i < 26 ? String.fromCharCode(65 + i) : String.fromCharCode(65 + Math.floor(i / 26) - 1) + String.fromCharCode(65 + (i % 26)));

	/** Foca a caixa de texto logo depois do clique que a abriu (o foco do próprio clique viria depois e a fecharia). */
	const foco = (no: HTMLElement) => void setTimeout(() => no.focus(), 80);

	// o molde que eu miro também aparece para o grupo
	$effect(() => {
		if (!molde || !ui.mira) {
			mesa.enviar('molde', null, true);
			return;
		}
		mesa.enviar('molde', { nome: ui.mira.jutsu.nome, quadrados: molde.quadrados, contorno: molde.contorno, anel: molde.anel, ok: molde.ok });
	});
</script>

{#snippet rotulo(x: number, y0: number, txt: string, cor: string, ancora: 'ini' | 'meio' = 'ini', fechar?: { nome: string; acao: () => void })}
	{@const w = larguraRotulo(txt) + (fechar ? F(22) : 0)}
	<!-- preso à área visível: perto da borda do quadro o rótulo não some pela metade -->
	{@const P = paraTela(x, y0)}
	{@const x0 = Math.max(ui.vx + F(4), Math.min(ui.vx + W / s - w - F(4), ancora === 'meio' ? P[0] - w / 2 : P[0]))}
	{@const y = Math.max(ui.vy + F(14), Math.min(ui.vy + H / s - F(14), P[1]))}
	<g pointer-events="none" transform={desfazer}>
		<rect x={x0} y={y - F(10)} width={w} height={F(20)} style="fill: var(--b0); stroke: {cor}" stroke-width={F(2)} />
		<text x={x0 + F(7)} y={y + F(4.5)} style="fill: {cor}" font-size={F(12)} font-family="'Pixelify Sans'" font-weight="700">{txt}</text>
	</g>
	{#if fechar}
		<!-- ✕ do efeito: o clique não chega ao quadro (não move, não desenha) -->
		<g
			class="cursor-pointer"
			role="button"
			tabindex="0"
			transform={desfazer}
			aria-label="Tirar {fechar.nome} do quadro"
			onpointerdown={(e) => e.stopPropagation()}
			onclick={(e) => (e.stopPropagation(), fechar.acao())}
			onkeydown={(e) => (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), fechar.acao())}
		>
			<title>Tirar do quadro</title>
			<rect x={x0 + w - F(20)} y={y - F(10)} width={F(20)} height={F(20)} style="fill: var(--b0); stroke: {cor}" stroke-width={F(2)} />
			<path d="M{x0 + w - F(14)} {y - F(4)}l{F(8)} {F(8)}m0 {-F(8)}l{-F(8)} {F(8)}" style="stroke: {cor}" stroke-width={F(2)} />
		</g>
	{/if}
{/snippet}

<!-- um token e uma imagem de objeto: desenhados no laço de cima, na ordem de pintura da vista isométrica -->
{#snippet tokenSvg(t: MesaToken)}
					{#if t.visivel || mesa.mestre}
					{@const ar = arrasto?.id === t.id ? arrasto : null}
					{@const x = ar ? ar.x : t.x}
					{@const y = ar ? ar.y : t.y}
					{@const n = t.tamanho}
					{@const cx = x + n / 2}
					{@const cy = y + n / 2}
					{@const c = corCss(mesa.corDe(mesa.donoDe(t)))}
					{@const caido = t.ferimento === 3 || t.condicoes.includes('caido')}
					{@const pv = pvDe(t)}
					{@const fr = pv ? Math.max(0, Math.min(1, pv.pv / pv.max)) : FAIXA[t.ferimento]}
					{@const foto = fotoDe(t)}
					{@const r = 0.45 * n}
					<!-- com moldura, o anel vai a 0,56 do lado e o retrato encolhe para caber no furo -->
					{@const mol = mesa.molduraDe(t)}
					{@const rm = 0.56 * n}
					{@const rf = mol ? rm * mol.interno : r}
						{#if iso}<circle {cx} {cy} r={0.42 * n} fill="#000" fill-opacity="0.3" pointer-events="none" />{/if}
						<g opacity={t.visivel ? 1 : 0.5} transform={emPe(cx, cy, sobeToken(t))}>
							{#if mesa.daVez.has(t.id)}<circle {cx} {cy} r={(mol ? rm : r) + 0.12} fill="none" style="stroke: var(--acc)" stroke-width={0.1} />{/if}
						{#if ui.sel === t.id}<circle {cx} {cy} r={(mol ? rm : r) + 0.22} fill="none" style="stroke: var(--fg)" stroke-width={F(2)} stroke-dasharray="{F(4)} {F(3)}" />{/if}
						<circle {cx} {cy} r={rf} style="fill: {caido ? 'var(--b3)' : 'var(--b2)'}" />
						{#if foto}
							<clipPath id="foto-{t.id}"><circle {cx} {cy} r={rf - 0.02} /></clipPath>
							{@const fo = focoDe(t)}
							{@const q = fo ? retanguloFoco(fo, cx, cy, 2 * rf) : { x: cx - rf, y: cy - rf, w: 2 * rf, h: 2 * rf }}
							<image href={foto} x={q.x} y={q.y} width={q.w} height={q.h} preserveAspectRatio={fo ? 'none' : 'xMidYMid slice'} clip-path="url(#foto-{t.id})" style="filter: {caido ? 'grayscale(1) brightness(.6)' : 'none'}" style:image-rendering={fo ? 'pixelated' : null} />
						{:else}
							<text x={cx} y={cy + (0.11 * n * rf) / r} text-anchor="middle" font-size={(0.32 * n * rf) / r} font-family="'Pixelify Sans'" font-weight="700" style="fill: {caido ? 'var(--field)' : 'var(--fg)'}">{t.sigla || t.nome.slice(0, 2).toUpperCase()}</text>
						{/if}
						<circle {cx} {cy} r={rf} fill="none" style="stroke: {caido ? 'var(--field)' : c}" stroke-width={(mol ? 0.05 : 0.08) * Math.min(n, 3)} />
						{#if mol}
							<image href="/molduras/{mol.id}.png" x={cx - rm} y={cy - rm} width={2 * rm} height={2 * rm} pointer-events="none" style="image-rendering: pixelated; filter: {caido ? 'grayscale(1) brightness(.6)' : 'none'}" />
						{/if}
						<rect x={cx - 0.38 * n} y={y + n - 0.12} width={0.76 * n} height={F(5)} style="fill: var(--b0)" />
						<rect x={cx - 0.38 * n} y={y + n - 0.12} width={0.76 * n * fr} height={F(5)} style="fill: {fr > 0.5 ? 'var(--ok)' : fr > 0.25 ? 'var(--warn)' : 'var(--err)'}" />
						<text x={cx} y={y + n + F(12)} text-anchor="middle" font-size={F(11)} font-family="'Noto Sans'" font-weight="600" style="fill: var(--fg); stroke: var(--b1)" stroke-width={F(3)} paint-order="stroke">{nomeCurto(t.nome).split(' ')[0]}{t.membro ? ` ${t.membro}` : ''}</text>
						{#if t.condicoes.length}
							<!-- estados: ícones em volta do token, do alto para a direita -->
							{@const lado = Math.min(0.6, 0.44 + 0.03 * n)}
							{@const raio = r + 0.2}
							{#each [...new Set(t.condicoes)].slice(0, 8) as cond, i (cond)}
								{@const a = -Math.PI / 2 + i * ((50 * Math.PI) / 180)}
								<g>
									<title>{ESTADO_NOME[cond] ?? cond}</title>
									<circle cx={cx + raio * Math.cos(a)} cy={cy + raio * Math.sin(a)} r={lado / 2} style="fill: var(--b0); stroke: var(--warn)" stroke-width={F(1.5)} />
									<image href="/icons/estado/ic-estado-{cond}-32.png" x={cx + raio * Math.cos(a) - lado / 2} y={cy + raio * Math.sin(a) - lado / 2} width={lado} height={lado} style="image-rendering: pixelated" />
								</g>
							{/each}
							{#if t.condicoes.length > 8}
								<text x={cx + raio} y={cy + raio} font-size={F(10)} font-family="'Pixelify Sans'" font-weight="700" style="fill: var(--warn); stroke: var(--b1)" stroke-width={F(3)} paint-order="stroke">+{t.condicoes.length - 8}</text>
							{/if}
						{/if}
						{#if !t.visivel}
							<g style="stroke: var(--fg)" stroke-width={F(2)} fill="none"><path d="M{x + 0.04} {y + 0.2}q.18 -.16 .36 0q-.18 .16 -.36 0" /><line x1={x + 0.06} y1={y + 0.38} x2={x + 0.38} y2={y + 0.02} /></g>
						{/if}
					</g>
				{/if}
{/snippet}

{#snippet imagemSvg(o0: MesaObjeto)}
				{@const o = mostrado(o0)}
				<image
					href={urlImagemMesa(o.imagem)}
					x={o.x - (o.largura ?? 1) / 2}
					y={o.y - (o.altura ?? 1) / 2}
					width={o.largura ?? 1}
					height={o.altura ?? 1}
					preserveAspectRatio="none"
						transform={emPe(o.x, o.y, (o.altura ?? 1) / 2) ?? `rotate(${o.rotacao} ${o.x} ${o.y})`}
						opacity={o.visivel ? 1 : 0.45}
					pointer-events="none"
					style:image-rendering={o.imagem?.startsWith('/') ? 'pixelated' : 'auto'}
				/>
{/snippet}

<!-- o efeito de um jutsu: base translúcida na cor do estilo e o desenho animado do elemento ou do tipo -->
{#snippet efeitoFx(lista: Quadrado[], estilo: string, opacidade = 1)}
	{#if lista?.length}
		{@const d = lista.map(([x, y]) => `M${x} ${y}h1v1h-1z`).join('')}
		<g class="fx fx-{estilo}" pointer-events="none" opacity={opacidade}>
			<path {d} style="fill: {ESTILOS[estilo].cor}" fill-opacity="0.22" />
			<path {d} fill="url(#fx-{estilo})" class="fx-camada" />
		</g>
	{/if}
{/snippet}

<!-- quadrados atingidos: um traçado só (uma esfera de 20 m tem mais de mil quadrados) -->
{#snippet quadrados(lista: Quadrado[], cor: CorMesa | null)}
	{#if lista?.length}
		{@const d = lista.map(([x, y]) => `M${x} ${y}h1v1h-1z`).join('')}
		<path {d} style="fill: {corCss(cor ?? 'ardosia')}" fill-opacity="0.18" pointer-events="none" />
		<path {d} fill="url(#hachura-{cor ?? 'ardosia'})" pointer-events="none" />
	{/if}
{/snippet}

<div bind:this={caixa} bind:clientWidth={W} bind:clientHeight={H} class="absolute inset-0 overflow-hidden bg-[var(--fundo)]" role="presentation" ondragover={aoArrastarSobre} ondrop={aoLargar}>
	<svg
		bind:this={svg}
		width={W}
		height={H}
		viewBox="0 0 {W} {H}"
		role="application"
		aria-label="Quadro da cena {cena?.nome ?? ''}, {L} por {A} metros, 1 quadrado = 1 m"
		class="block touch-none select-none"
		style="cursor: {cursor}"
		onpointerdown={aoBaixar}
		onpointermove={aoMover}
		onpointerup={aoSoltar}
		onpointercancel={aoSoltar}
		onpointerleave={() => (tracoSob = null)}
		ondblclick={aoClicarDuplo}
		oncontextmenu={(e) => e.preventDefault()}
	>
		<EfeitosFx />
		<defs>
			<!-- névoa vista pelo Mestre: hachura fina por cima do esmaecido -->
			<pattern id="nevoa-hachura" width="0.5" height="0.5" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
				<line x1="0" y1="0" x2="0" y2="0.5" style="stroke: var(--fg)" stroke-width="0.05" stroke-opacity="0.18" />
			</pattern>
			{#each CORES as c (c.id)}
				<pattern id="hachura-{c.id}" width="0.35" height="0.35" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
					<line x1="0" y1="0" x2="0" y2="0.35" style="stroke: var(--mesa-{c.id})" stroke-width="0.06" stroke-opacity="0.7" />
				</pattern>
			{/each}
			<!-- terreno difícil: cruzinhas de cascalho -->
			<pattern id="terreno" width="0.5" height="0.5" patternUnits="userSpaceOnUse">
				<path d="M0.12 0.12l0.14 0.14M0.26 0.12l-0.14 0.14" style="stroke: var(--mesa-siena)" stroke-width="0.045" stroke-opacity="0.9" />
			</pattern>
		</defs>
		<g transform="translate({-ui.vx * s} {-ui.vy * s}) scale({s}) {matrizTxt}">
			<rect x="0" y="0" width={L} height={A} style="fill: var(--b1)" />
			<!-- fundo do quadro: o mapa estica na cena inteira, sob a grade -->
				{#if fundo && iso}
					<g transform={desfazer}>
						<image href={fundo} x={caixaFundo.x} y={caixaFundo.y} width={caixaFundo.w} height={caixaFundo.h} preserveAspectRatio="none" opacity={cena?.fundo_opacidade ?? 1} pointer-events="none" style:image-rendering={cena?.fundo?.startsWith('/') ? 'pixelated' : 'auto'} />
						{#if ui.ferramenta === 'fundo' && cena?.fundo_escala}<rect x={caixaFundo.x} y={caixaFundo.y} width={caixaFundo.w} height={caixaFundo.h} fill="none" style="stroke: var(--acc)" stroke-width={F(2)} stroke-dasharray="{F(8)} {F(5)}" pointer-events="none" />{/if}
					</g>
				{:else if fundo}
					<clipPath id="recorte-cena"><rect x="0" y="0" width={L} height={A} /></clipPath>
				<image href={fundo} x={caixaFundo.x} y={caixaFundo.y} width={caixaFundo.w} height={caixaFundo.h} preserveAspectRatio="none" clip-path={ui.bordas ? undefined : 'url(#recorte-cena)'} opacity={cena?.fundo_opacidade ?? 1} pointer-events="none" style:image-rendering={cena?.fundo?.startsWith('/') ? 'pixelated' : 'auto'} />
				{#if ui.ferramenta === 'fundo' && cena?.fundo_escala}<rect x={caixaFundo.x} y={caixaFundo.y} width={caixaFundo.w} height={caixaFundo.h} fill="none" style="stroke: var(--acc)" stroke-width={F(2)} stroke-dasharray="{F(8)} {F(5)}" pointer-events="none" />{/if}
			{/if}
			{#if cena?.grade !== false}
				<!-- dois traçados (linhas de 1 m e de 5 m) com 1 px fixo: o zoom e a câmera não mexem na grade -->
				<path d={grade1} fill="none" style="stroke: var(--fg)" stroke-opacity={0.09 * (fundo ? 1.6 : 1)} stroke-width="1" vector-effect="non-scaling-stroke" pointer-events="none" />
					<path d={grade5} fill="none" style="stroke: var(--fg)" stroke-opacity={0.18 * (fundo ? 1.6 : 1)} stroke-width="1" vector-effect="non-scaling-stroke" pointer-events="none" />
				{/if}
				{#if ui.bordas && mesa.mestre}
					{@const quente = ajuste ?? alcaSob}
					{@const r = ajuste?.tipo === 'borda' ? ajuste.ret : null}
					<!-- ajustar a grade: o contorno da cena, o primeiro quadrado e as alças. O que é da grade vai em metros (vira
					     losango na isométrica) com traço fixo na tela; as alças e a medida vão na tela, sem deformar. -->
					<g pointer-events="none">
						<rect x="0" y="0" width={L} height={A} fill="none" style="stroke: var(--acc)" stroke-width={quente?.tipo === 'mover' ? 3 : 2} stroke-dasharray="8 5" vector-effect="non-scaling-stroke" />
						{#if fundo}<rect x="0" y="0" width="1" height="1" style="fill: color-mix(in srgb, var(--acc) 30%, transparent); stroke: var(--acc)" stroke-width={quente?.tipo === 'quadrado' ? 3 : 2} vector-effect="non-scaling-stroke" />{/if}
						{#if quente?.tipo === 'borda'}
							{@const [xa, xb] = quente.x < 0 ? [0, 0] : quente.x > 0 ? [L, L] : [0, L]}
							{@const [ya, yb] = quente.y < 0 ? [0, 0] : quente.y > 0 ? [A, A] : [0, A]}
							{#if quente.x}<line x1={xa} y1="0" x2={xb} y2={A} style="stroke: var(--acc)" stroke-width="5" vector-effect="non-scaling-stroke" />{/if}
							{#if quente.y}<line x1="0" y1={ya} x2={L} y2={yb} style="stroke: var(--acc)" stroke-width="5" vector-effect="non-scaling-stroke" />{/if}
						{/if}
						{#if r}
							<!-- a cena nova, quadrado por quadrado, enquanto a borda é puxada -->
							{@const linhas = Array.from({ length: r.x1 - r.x0 + 1 }, (_, i) => `M${r.x0 + i} ${r.y0}V${r.y1}`).join('') + Array.from({ length: r.y1 - r.y0 + 1 }, (_, i) => `M${r.x0} ${r.y0 + i}H${r.x1}`).join('')}
							<path d={linhas} fill="none" style="stroke: var(--acc)" stroke-opacity="0.55" stroke-width="1" vector-effect="non-scaling-stroke" />
							<rect x={r.x0} y={r.y0} width={r.x1 - r.x0} height={r.y1 - r.y0} fill="none" style="stroke: var(--acc)" stroke-width="3" vector-effect="non-scaling-stroke" />
						{/if}
						<g transform={desfazer}>
							{#each [[0, 0], [L / 2, 0], [L, 0], [L, A / 2], [L, A], [L / 2, A], [0, A], [0, A / 2]] as [gx, gy], i (i)}
								{@const [hx, hy] = paraTela(gx, gy)}
								{@const lado = i % 2 ? F(12) : F(16)}
								<rect x={hx - lado / 2} y={hy - lado / 2} width={lado} height={lado} style="fill: var(--acc); stroke: var(--ink)" stroke-width={F(2)} />
							{/each}
							{#if fundo}
								{@const [qx, qy] = paraTela(1, 1)}
								<circle cx={qx} cy={qy} r={F(8)} style="fill: var(--ink); stroke: var(--acc)" stroke-width={F(3)} />
							{/if}
							{#if r}
								{@const [cx, cy] = paraTela(r.x1, r.y1)}
								<text x={cx + F(14)} y={cy + F(28)} font-size={F(15)} class="font-pixel" font-weight="700" style="fill: var(--acc); stroke: var(--ink); paint-order: stroke" stroke-width={F(4)}>{r.x1 - r.x0} × {r.y1 - r.y0}</text>
							{/if}
						</g>
					</g>
				{/if}

			{#if terrenoVisivel.size}
				{@const d = [...terrenoVisivel].map((k) => `M${k.replace(',', ' ')}h1v1h-1z`).join('')}
				<path {d} style="fill: var(--mesa-siena)" fill-opacity="0.14" pointer-events="none" />
				<path {d} fill="url(#terreno)" pointer-events="none" />
			{/if}

{#each imagensBaixo as o0 (o0.id)}
				{@const o = mostrado(o0)}
				<image
					href={urlImagemMesa(o.imagem)}
					x={o.x - (o.largura ?? 1) / 2}
					y={o.y - (o.altura ?? 1) / 2}
					width={o.largura ?? 1}
					height={o.altura ?? 1}
					preserveAspectRatio="none"
						transform={emPe(o.x, o.y, (o.altura ?? 1) / 2) ?? `rotate(${o.rotacao} ${o.x} ${o.y})`}
						opacity={o.visivel ? 1 : 0.45}
					pointer-events="none"
					style:image-rendering={o.imagem?.startsWith('/') ? 'pixelated' : 'auto'}
				/>
			{/each}

			{#each mesa.efeitos as ef (ef.id)}
				{@const c = corCss(mesa.corDe(ef.autor_id))}
				{#if estiloValido(ef.estilo)}
					{@render efeitoFx(ef.quadrados, ef.estilo!)}
				{:else}
					{@render quadrados(ef.quadrados, mesa.corDe(ef.autor_id))}
				{/if}
				{@render rotulo(ef.rotulo_x, ef.rotulo_y, `${ef.nome} · ${ef.turnos == null ? '1 cena' : `${ef.turnos} ${ef.turnos === 1 ? 'turno' : 'turnos'}`}`, c, 'meio', mesa.podeTirarEfeito(ef) ? { nome: ef.nome, acao: () => mesa.removerEfeito(ef.id) } : undefined)}
			{/each}

			{#each mesa.tracos as k (k.id)}
				<path d={caminho(k.pontos)} fill="none" style="stroke: {corCss(mesa.corDe(k.autor_id))}" stroke-width={k.espessura} stroke-linecap="square" stroke-linejoin="miter" pointer-events="none" />
			{/each}
			{#each mesa.temporarios as k (k.id)}
				<path d={caminho(k.pontos)} fill="none" style="stroke: {corCss(mesa.corDe(k.usuario))}" stroke-width={k.espessura} stroke-linecap="square" opacity={Math.max(0, 1 - (agora - k.t) / 3000)} pointer-events="none" />
			{/each}
			{#if desenho && desenho.length > 1}
				<path d={caminho(desenho)} fill="none" style="stroke: {corCss(mesa.corDe(mesa.eu))}" stroke-width={ui.espessura} stroke-linecap="square" pointer-events="none" />
			{/if}

			{#if aneis}
				{@const cx = aneis.t.x + aneis.t.tamanho / 2}
				{@const cy = aneis.t.y + aneis.t.tamanho / 2}
				{@render quadrados(aneis.corpo, aneis.corId)}
				{#each aneis.lista as r, i (i)}
					<circle {cx} {cy} r={r.r + aneis.t.tamanho / 2} style="fill: {aneis.cor}; stroke: {aneis.cor}" fill-opacity="0.05" stroke-width={F(2)} stroke-dasharray="{F(8)} {F(5)}" pointer-events="none" />
					{@render rotulo(cx, cy - r.r - aneis.t.tamanho / 2, r.rotulo, aneis.cor, 'meio')}
				{/each}
			{/if}

			{#each Object.entries(mesa.moldes) as [u, m] (u)}
				{@const id = m.ok ? mesa.corDe(u) : 'vermelhao'}
				{@const c = corCss(id)}
				{@render quadrados(m.quadrados, id)}
				{#if m.contorno}<polygon points={m.contorno.map((p) => p.join(',')).join(' ')} fill="none" style="stroke: {c}" stroke-width={F(2)} pointer-events="none" />{/if}
				{#if m.anel}<circle cx={m.anel.cx} cy={m.anel.cy} r={m.anel.r} fill="none" style="stroke: {c}" stroke-width={F(2)} stroke-dasharray="{F(8)} {F(5)}" pointer-events="none" />{/if}
			{/each}

			{#if molde && ui.mira}
				{#if molde.anel}
					{@const R = molde.anel.r}
					<path d="M-500 -500H900V900H-500Z M{molde.anel.cx - R} {molde.anel.cy}a{R} {R} 0 1 0 {2 * R} 0a{R} {R} 0 1 0 {-2 * R} 0Z" fill="#000" fill-opacity="0.3" fill-rule="evenodd" pointer-events="none" />
					<circle cx={molde.anel.cx} cy={molde.anel.cy} r={R} fill="none" style="stroke: {corMolde}" stroke-width={F(2)} stroke-dasharray="{F(8)} {F(5)}" pointer-events="none" />
					{@render rotulo(molde.anel.cx, molde.anel.cy - R, ui.mira.jutsu.regua.rotuloAlcance, corMolde, 'meio')}
				{/if}
				<!-- fora do alcance: quadrados em cinza (o vermelhão é a cor do Mestre); o anel e o rótulo avisam em vermelho -->
				{@render quadrados(molde.quadrados, molde.ok ? mesa.corDe(mesa.donoDe(molde.lancador)) : 'ardosia')}
				{#if molde.ok && estiloDoJutsu(ui.mira.jutsu)}{@render efeitoFx(molde.quadrados, estiloDoJutsu(ui.mira.jutsu)!, 0.8)}{/if}
				{#if molde.forma === 'cena'}
					<!-- área maior que a cena: a cena inteira acende -->
					<rect x="0" y="0" width={L} height={A} style="fill: {corMolde}" fill-opacity="0.12" pointer-events="none" />
					<rect x="0" y="0" width={L} height={A} fill="url(#hachura-{molde.ok ? (mesa.corDe(mesa.donoDe(molde.lancador)) ?? 'ardosia') : 'vermelhao'})" pointer-events="none" />
				{/if}
				{#if molde.contorno}<polygon points={molde.contorno.map((p) => p.join(',')).join(' ')} fill="none" style="stroke: {corMolde}" stroke-width={F(2)} pointer-events="none" />{/if}
				{#if molde.forma === 'esfera' && !ui.mira.jutsu.regua.emSi || molde.forma === 'parede' || molde.forma === 'quadrado'}
					<rect x={ui.mira.tx + 0.1} y={ui.mira.ty + 0.1} width="0.8" height="0.8" fill="none" style="stroke: {corMolde}" stroke-width={F(3)} pointer-events="none" />
					{@render rotulo(ui.mira.tx + 1.2, ui.mira.ty + 0.5, `${molde.dist} m`, corMolde)}
				{/if}
				{#if molde.forma === 'alvos'}
					{#each molde.quem as t, i (t.id)}
						<circle cx={t.x + t.tamanho / 2} cy={t.y + t.tamanho / 2} r={0.62 * t.tamanho} fill="none" style="stroke: {corCss(mesa.corDe(mesa.donoDe(molde.lancador)))}" stroke-width={F(3)} pointer-events="none" />
						{@render rotulo(t.x + t.tamanho + 0.1, t.y + 0.1, `ALVO ${i + 1}`, corCss(mesa.corDe(mesa.donoDe(molde.lancador))))}
					{/each}
					{#if !ui.mira.fixa}
						{@const tx = ui.mira.tx + 0.5}
						{@const ty = ui.mira.ty + 0.5}
						<g pointer-events="none" style="stroke: {corMolde}" stroke-width={F(2)} fill="none">
							<circle cx={tx} cy={ty} r="0.5" /><line x1={tx - 0.75} y1={ty} x2={tx - 0.3} y2={ty} /><line x1={tx + 0.3} y1={ty} x2={tx + 0.75} y2={ty} /><line x1={tx} y1={ty - 0.75} x2={tx} y2={ty - 0.3} /><line x1={tx} y1={ty + 0.3} x2={tx} y2={ty + 0.75} />
						</g>
						{@render rotulo(tx + 0.9, ty + 0.55, `${molde.dist} m`, corMolde)}
					{/if}
				{/if}
			{/if}

			{#if arrastado && arrasto && infoArrasto}
				<circle cx={arrastado.x + arrastado.tamanho / 2} cy={arrastado.y + arrastado.tamanho / 2} r={0.45 * arrastado.tamanho} style="fill: var(--b2); stroke: {corCss(mesa.corDe(mesa.donoDe(arrastado)))}" fill-opacity="0.5" stroke-width="0.06" stroke-dasharray=".12 .1" opacity="0.7" pointer-events="none" />
				<line x1={arrastado.x + arrastado.tamanho / 2} y1={arrastado.y + arrastado.tamanho / 2} x2={arrasto.x + arrastado.tamanho / 2} y2={arrasto.y + arrastado.tamanho / 2} style="stroke: {infoArrasto.cor}" stroke-width={F(3)} pointer-events="none" />
			{/if}

			{#each Object.entries(mesa.fantasmas) as [u, g] (u)}
				{@const t = mesa.tokens.find((k) => k.id === g.token)}
				{#if t}
					<circle cx={g.x + t.tamanho / 2} cy={g.y + t.tamanho / 2} r={0.45 * t.tamanho} fill="none" style="stroke: {corCss(mesa.corDe(u))}" stroke-width="0.06" stroke-dasharray=".12 .1" pointer-events="none" />
					<line x1={t.x + t.tamanho / 2} y1={t.y + t.tamanho / 2} x2={g.x + t.tamanho / 2} y2={g.y + t.tamanho / 2} style="stroke: {corCss(mesa.corDe(u))}" stroke-width={F(2)} stroke-dasharray="{F(6)} {F(4)}" pointer-events="none" />
				{/if}
			{/each}

				{#if iso}
				{#each pePintura as it (it.id)}
					{#if it.k === 'token'}{@render tokenSvg(it.t)}{:else}{@render imagemSvg(it.o)}{/if}
				{/each}
			{:else}
{#each visiveis as t (t.id)}{@render tokenSvg(t)}{/each}
{/if}

			<!-- as imagens das camadas acima da dos tokens ficam sobre eles -->
			{#each imagensAcima as o0 (o0.id)}{@render imagemSvg(o0)}{/each}

			{#each marcadores as o0 (o0.id)}
				{@const o = mostrado(o0)}
				{#if o.tipo === 'texto'}
					{@const f = FONTES[o.fonte ?? 'pixel']}
					{@const tam = o.tamanho ?? 1}
					{@const linhas = (o.texto ?? '').split('\n')}
						<g transform={emPe(o.x, o.y)}>
						<g transform="rotate({o.rotacao} {o.x} {o.y})" opacity={o.visivel ? 1 : 0.5} pointer-events="none">
						<text x={o.x} y={o.y - ((linhas.length - 1) * tam * 1.25) / 2} text-anchor="middle" dominant-baseline="central" font-size={tam} font-family={f.familia} font-weight={f.peso} style="fill: {o.cor ?? '#f4e4d6'}; stroke: {contraste(o.cor)}" stroke-width={tam * 0.16} paint-order="stroke" stroke-linejoin="round">
							{#each linhas as l, i (i)}<tspan x={o.x} dy={i === 0 ? 0 : tam * 1.25}>{l || ' '}</tspan>{/each}
							</text>
						</g>
						</g>
					{:else}
						{@const r = Math.max(0.3, F(7))}
					{@const cor = o.cor ?? corCss(mesa.corDe(o.autor_id))}
						<g opacity={o.visivel ? 1 : 0.5} pointer-events="none" transform={emPe(o.x, o.y)}>
							<ellipse cx={o.x} cy={o.y} rx={r * 0.7} ry={r * 0.26} fill="#000" fill-opacity="0.3" />
						<path d="M{o.x} {o.y}L{o.x - r * 0.26} {o.y - r * 2.1}L{o.x + r * 0.26} {o.y - r * 2.1}Z" fill="#cfd3d6" style="stroke: #1b1210" stroke-width={F(1)} />
						<circle cx={o.x} cy={o.y - r * 2.4} r={r} style="fill: {cor}; stroke: #1b1210" stroke-width={F(2)} />
						<circle cx={o.x - r * 0.3} cy={o.y - r * 2.7} r={r * 0.25} fill="#fff" fill-opacity="0.55" />
					</g>
					{#if o.texto}{@render rotulo(o.x, o.y - r * 3.5 - F(8), o.texto, cor, 'meio')}{/if}
				{/if}
			{/each}

			{#if arrasto && infoArrasto}
				<!-- com terreno difícil, o custo maior fica logo abaixo da metragem -->
				{@const sobe = infoArrasto.terreno ? F(26) : 0}
				{@render rotulo(arrasto.x + (arrastado?.tamanho ?? 1) / 2, arrasto.y - 0.3 - sobe, infoArrasto.texto, infoArrasto.cor, 'meio')}
				{#if infoArrasto.terreno}{@render rotulo(arrasto.x + (arrastado?.tamanho ?? 1) / 2, arrasto.y - 0.3, infoArrasto.terreno, 'var(--mesa-siena)', 'meio')}{/if}
				{#if infoArrasto.reacao}{@render rotulo(arrasto.x + (arrastado?.tamanho ?? 1) / 2, arrasto.y - 0.3 - sobe - F(26), infoArrasto.reacao, 'var(--mesa-vermelhao)', 'meio')}{/if}
			{/if}

			{#if nevoaLigada}
				<!-- a névoa: o grupo não vê o que está coberto; o Mestre vê esmaecido, com hachura -->
				<path d={caminhoDaNevoa} fill-rule="evenodd" style="fill: var(--b0)" fill-opacity={mesa.mestre ? 0.55 : 1} pointer-events="none" />
				{#if mesa.mestre}<path d={caminhoDaNevoa} fill-rule="evenodd" fill="url(#nevoa-hachura)" pointer-events="none" />{/if}
			{/if}

			{#if iso}
					{#if objetoSel && mesa.podeMexerObjeto(objetoSel) && (!escondeDeMim || objetoSel.tipo === 'imagem')}
						<!-- seleção na vista isométrica: a caixa em volta do sprite de pé e o canto de baixo para redimensionar a imagem -->
						{@const m = mostrado(objetoSel)}
						{@const ci = caixaDePe(m)}
						{@const rr = Math.max(0.2, F(7))}
						<g transform={emPe(m.x, m.y)} pointer-events="none" style="stroke: var(--acc)" fill="none" stroke-width={F(2)}>
							<rect x={m.x - ci.hw} y={m.y + ci.dy - ci.hh} width={2 * ci.hw} height={2 * ci.hh} stroke-dasharray="{F(6)} {F(4)}" />
							{#if m.tipo === 'imagem'}<rect x={m.x + ci.hw - rr} y={m.y - rr} width={2 * rr} height={2 * rr} style="fill: var(--b0)" />{/if}
						</g>
					{/if}
				{:else}
				{#if objetoSel && mesa.podeMexerObjeto(objetoSel) && (!escondeDeMim || objetoSel.tipo === 'imagem')}
				<!-- seleção: caixa tracejada (girada com o objeto), alça de girar e canto de redimensionar -->
				{@const m = mostrado(objetoSel)}
				{@const al = alcas(m)}
				<g pointer-events="none" style="stroke: var(--acc)" fill="none" stroke-width={F(2)}>
					<g transform="rotate({m.tipo === 'alfinete' ? 0 : m.rotacao} {al.centro.x} {al.centro.y})">
						<rect x={al.centro.x - al.hw} y={al.centro.y - al.hh} width={2 * al.hw} height={2 * al.hh} stroke-dasharray="{F(6)} {F(4)}" />
					</g>
					{#if m.tipo !== 'alfinete'}
						<line x1={al.centro.x} y1={al.centro.y} x2={al.girar.x} y2={al.girar.y} stroke-dasharray="{F(3)} {F(3)}" stroke-opacity="0.6" />
						<circle cx={al.girar.x} cy={al.girar.y} r={Math.max(0.2, F(8))} style="fill: var(--b0)" />
						<rect x={al.canto.x - Math.max(0.2, F(7))} y={al.canto.y - Math.max(0.2, F(7))} width={2 * Math.max(0.2, F(7))} height={2 * Math.max(0.2, F(7))} style="fill: var(--b0)" />
					{/if}
				</g>
			{/if}
				{/if}

				{#each [...(reguaMinha ? [[mesa.eu, reguaMinha] as const] : []), ...Object.entries(mesa.reguas)] as [u, r] (u)}
				{@const c = corCss(mesa.corDe(u))}
				{@const pts = r.pontos}
				{@const seg = trechos(pts)}
				{@const total = seg.reduce((a, b) => a + b, 0)}
				{@const custo = mesa.terreno.size ? custoTrechos(pts, mesa.terreno) : total}
				{@const ult = pts[pts.length - 1]}
				{#if pts.length}
					<g opacity={r.feita && !r.fixa ? Math.max(0, 1 - (agora - r.t) / 3000) : 1} pointer-events="none">
						<polyline points={pts.map((q) => `${q[0] + 0.5},${q[1] + 0.5}`).join(' ')} fill="none" style="stroke: {c}" stroke-width={F(3)} stroke-dasharray="{F(10)} {F(4)}" />
						{#each pts as q, i (i)}<rect x={q[0] + 0.5 - F(5)} y={q[1] + 0.5 - F(5)} width={F(10)} height={F(10)} style="fill: {c}" />{/each}
						{@render rotulo(ult[0] + 0.5, ult[1] - 0.35, seg.length > 1 ? `${seg.join(' + ')} = ${total} m` : `${total} m`, c, 'meio')}
						{#if custo > total}{@render rotulo(ult[0] + 0.5, ult[1] - 0.35 + F(26), `terreno difícil: custa ${custo} m`, 'var(--mesa-siena)', 'meio')}{/if}
						{@render rotulo(ult[0] + 0.5, ult[1] + 1.45 + (custo > total ? F(26) : 0), `${mesa.membro(u)?.nome ?? '?'} medindo`, c, 'meio')}
					</g>
				{/if}
			{/each}

			{#each mesa.pings as p (p.id)}
				{@const c = corCss(mesa.corDe(p.usuario))}
				<g pointer-events="none">
					{#each [0, 0.35, 0.7] as atraso (atraso)}<circle class="ping" cx={p.x} cy={p.y} r="1.6" fill="none" style="stroke: {c}; animation-delay: {atraso}s" stroke-width={F(3)} />{/each}
					<circle cx={p.x} cy={p.y} r={F(5)} style="fill: {c}" />
				</g>
			{/each}
			{#if mesa.pulso}
				{@const t = visiveis.find((k) => k.id === mesa.pulso!.token)}
				{#if t}
					{#key mesa.pulso.t}<circle class="pulso" cx={t.x + t.tamanho / 2} cy={t.y + t.tamanho / 2} r={0.6 * t.tamanho} fill="none" style="stroke: var(--acc)" stroke-width="0.12" pointer-events="none" />{/key}
				{/if}
			{/if}
			{#if tracoSob}
				{@render rotulo(posTraco[0] + 0.3, posTraco[1] - 0.4, `Traço de ${mesa.membro(tracoSob.autor_id)?.nome ?? '?'}`, corCss(mesa.corDe(tracoSob.autor_id)))}
			{/if}
		</g>

		{#if cena?.coordenadas && !iso}
			<!-- as letras e os números ficam fixos numa fileira que só desliza com a câmera (criar e apagar rótulos a cada
				 quadro custava mais que o quadro inteiro); o canto escuro cobre o que passa por baixo -->
			<g pointer-events="none" font-size="11" font-family="'Pixelify Sans'" text-anchor="middle" style="fill: var(--b0mut)">
				<rect x="0" y="0" width={W} height="20" style="fill: var(--b0)" opacity="0.85" />
				<g transform="translate({-ui.vx * s} 0)">
					{#each { length: L } as _, i (i)}<text x={(i + 0.5) * s} y="14">{letras(i)}</text>{/each}
				</g>
				<rect x="0" y="0" width="24" height={H} style="fill: var(--b0)" opacity="0.85" />
				<g transform="translate(0 {-ui.vy * s})">
					{#each { length: A } as _, j (j)}<text x="12" y={(j + 0.5) * s + 4}>{j + 1}</text>{/each}
				</g>
				<rect x="0" y="0" width="24" height="20" style="fill: var(--b0)" />
			</g>
		{/if}
	</svg>
	{#if ui.bordas && mesa.mestre}
		<div class="absolute top-3 left-1/2 z-20 flex w-max max-w-[calc(100%-24px)] -translate-x-1/2 flex-wrap items-center gap-x-3 gap-y-1.5 border-2 border-[var(--acc)] bg-sup py-1.5 pr-1.5 pl-3 shadow-[4px_4px_0_var(--sombra)]" role="group" aria-label="Ajustar a grade ao mapa">
			<span class="max-w-[46ch] text-xs leading-4">{fundo ? 'Os quadrados não mudam de tamanho. Bordas e cantos põem ou tiram quadrados; o miolo desliza a grade sobre o mapa; a bolinha aumenta ou diminui o mapa até o piso casar com os quadrados.' : 'Bordas e cantos põem ou tiram quadrados de qualquer lado.'}</span>
			<span class="font-pixel text-sm font-bold" aria-live="polite">{L} × {A}</span>
			{#if fundo}
				<span class="flex items-center border-2 border-b3" role="group" aria-label="Tamanho do mapa, ajuste fino">
					<button type="button" class="h-8 w-8 font-pixel text-base font-bold" aria-label="Mapa um pouco menor" title="Mapa 1% menor" onclick={() => imagemUmPouco(0.99)}>−</button>
					<span class="px-1 text-[11px] font-semibold">mapa</span>
					<button type="button" class="h-8 w-8 font-pixel text-base font-bold" aria-label="Mapa um pouco maior" title="Mapa 1% maior" onclick={() => imagemUmPouco(1.01)}>+</button>
				</span>
			{/if}
			<button type="button" class="btn-jogo btn-primario min-h-9 text-xs" onclick={() => (ui.bordas = false)}>PRONTO</button>
		</div>
	{/if}
	{#if rascunho}
		<!-- texto novo: digite e Enter põe no quadro (Shift+Enter quebra a linha; Esc cancela) -->
		<textarea
			class="absolute z-20 min-h-10 w-[240px] -translate-x-1/2 -translate-y-1/2 resize-none border-2 border-[var(--vermelhao)] bg-sup px-2 py-1.5 text-sm text-fg shadow-[4px_4px_0_var(--sombra)]"
style="left: {(paraTela(rascunho.x, rascunho.y)[0] - ui.vx) * s}px; top: {(paraTela(rascunho.x, rascunho.y)[1] - ui.vy) * s}px; font-family: {FONTES[ui.textoNovo.fonte].familia}"
			rows="2"
			maxlength="300"
			placeholder="Digite o texto e aperte Enter"
			aria-label="Texto novo"
			bind:value={rascunho.texto}
			use:foco
			onkeydown={(e) => {
				e.stopPropagation();
				if (e.key === 'Enter' && !e.shiftKey) (e.preventDefault(), void confirmarTexto());
				if (e.key === 'Escape') rascunho = null;
			}}
			onblur={() => void confirmarTexto()}
		></textarea>
	{/if}
</div>

<style>
	/* efeitos de área: cada estilo anima à sua maneira (raio pisca, impacto pulsa, cristal brilha); parados com movimento reduzido */
	.fx-raiton .fx-camada,
	.fx-ranton .fx-camada {
		animation: fx-relampago 2.6s steps(1) infinite;
	}
	.fx-hyoton .fx-camada,
	.fx-bukijutsu .fx-camada {
		animation: fx-brilho 2.4s ease-in-out infinite alternate;
	}
	.fx-bakuton .fx-camada,
	.fx-taijutsu .fx-camada,
	.fx-ninjutsu .fx-camada,
	.fx-yoton .fx-camada {
		animation: fx-batida 1.5s ease-in-out infinite;
	}
	@keyframes fx-relampago {
		0%,
		60%,
		100% {
			opacity: 0.35;
		}
		62%,
		68% {
			opacity: 1;
		}
		64% {
			opacity: 0.4;
		}
	}
	@keyframes fx-brilho {
		from {
			opacity: 0.55;
		}
		to {
			opacity: 1;
		}
	}
	@keyframes fx-batida {
		0%,
		100% {
			opacity: 0.6;
		}
		50% {
			opacity: 1;
		}
	}
	@media (prefers-reduced-motion: reduce) {
		.fx .fx-camada {
			animation: none;
			opacity: 0.85;
		}
	}
	.ping {
		animation: mesa-ping 1.4s ease-out 1 both;
		transform-box: fill-box;
		transform-origin: center;
	}
	@keyframes mesa-ping {
		0% {
			opacity: 1;
			transform: scale(0.15);
		}
		100% {
			opacity: 0;
			transform: scale(1);
		}
	}
	@media (prefers-reduced-motion: reduce) {
		.ping {
			animation-duration: 0.01s;
			opacity: 0.6;
		}
	}
	.pulso {
		animation: mesa-pulso 1s ease-out 1 forwards;
		transform-box: fill-box;
		transform-origin: center;
	}
	@keyframes mesa-pulso {
		0% {
			opacity: 0.95;
			transform: scale(1);
		}
		100% {
			opacity: 0;
			transform: scale(2.6);
		}
	}
	@media (prefers-reduced-motion: reduce) {
		.pulso {
			animation: none;
			opacity: 0;
		}
	}
</style>
