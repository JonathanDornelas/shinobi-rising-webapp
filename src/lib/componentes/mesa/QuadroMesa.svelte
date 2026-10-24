<script lang="ts">
	// L11 · CMP-37 · Quadro da Mesa: grade de 1 m (linha mais forte a cada 5 m), efeitos em cena, traços, moldes de
	// jutsu, tokens, réguas e ponteiros, em SVG. A vista (zoom e canto) fica no UiMesa; tudo no quadro é em metros.
	import { onMount } from 'svelte';
	import type { MesaToken } from '#lib/supabase/banco.ts';
	import { CORES, corCss } from '#lib/mesa/cores.ts';
	import { CONDICOES } from '#lib/personagem/dados.ts';
	import type { CorMesa } from '#lib/supabase/banco.ts';
	import { distanciaEntre, infoMovimento, provocaReacao, quadradosEmVolta, trechos, type Quadrado } from '#lib/mesa/geometria.ts';
	import type { Mesa } from '#lib/mesa/mesa.svelte.ts';
	import { calcularMolde, nomeCurto, type UiMesa } from '#lib/mesa/ui.svelte.ts';

	let {
		mesa,
		ui,
		pvDe,
		deslocamentoDe,
		fotoDe,
		onSoltar
	}: {
		mesa: Mesa;
		ui: UiMesa;
		/** PV e máximo que esta pessoa pode ver (null = só a faixa de ferimento). */
		pvDe: (t: MesaToken) => { pv: number; max: number } | null;
		deslocamentoDe: (t: MesaToken) => number;
		/** URL da foto do token (retrato do personagem, foto ou arte do NPC); null = só a sigla. */
		fotoDe: (t: MesaToken) => string | null;
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
	const s = $derived(BASE * ui.zoom);
	const F = (px: number) => px / s;
	const visiveis = $derived(mesa.tokens);
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
		return { sx, sy, mx: sx / s + ui.vx, my: sy / s + ui.vy };
	}
	const grade = (mx: number, my: number): Quadrado => [Math.min(L - 1, Math.max(0, Math.floor(mx))), Math.min(A - 1, Math.max(0, Math.floor(my)))];
	const tokenEm = (mx: number, my: number) =>
		[...visiveis].reverse().find((t) => (t.visivel || mesa.mestre) && mx >= t.x && mx < t.x + t.tamanho && my >= t.y && my < t.y + t.tamanho) ?? null;

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
		const caber = Math.min(W / (L * BASE), H / (A * BASE)) * 0.96;
		ui.zoom = Math.max(0.25, Math.min(4, inicial ? Math.max(caber, 0.9) : caber));
		const ts = mesa.tokens.filter((t) => t.visivel || mesa.mestre);
		const [cx, cy] = inicial && ts.length && caber < 0.9 ? [ts.reduce((a, t) => a + t.x + t.tamanho / 2, 0) / ts.length, ts.reduce((a, t) => a + t.y + t.tamanho / 2, 0) / ts.length] : [L / 2, A / 2];
		ui.vx = cx - W / (BASE * ui.zoom) / 2;
		ui.vy = cy - H / (BASE * ui.zoom) / 2;
	}
	export function centralizar(t: MesaToken) {
		ui.vx = t.x + t.tamanho / 2 - W / s / 2;
		ui.vy = t.y + t.tamanho / 2 - H / s / 2;
	}
	/** Quadrado no centro da vista (onde entra quem é posto sem posição). */
	export function centroDaVista(): [number, number] {
		return [Math.min(L - 1, Math.max(0, Math.floor(ui.vx + W / s / 2))), Math.min(A - 1, Math.max(0, Math.floor(ui.vy + H / s / 2)))];
	}
	export function zoomEm(fator: number, sx = W / 2, sy = H / 2) {
		const z = Math.max(0.25, Math.min(4, ui.zoom * fator));
		const mx = sx / s + ui.vx;
		const my = sy / s + ui.vy;
		ui.zoom = z;
		ui.vx = mx - sx / (BASE * z);
		ui.vy = my - sy / (BASE * z);
	}
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

	$effect(() => {
		const baixo = (e: KeyboardEvent) => e.code === 'Space' && (espaco = true);
		const cima = (e: KeyboardEvent) => e.code === 'Space' && (espaco = false);
		addEventListener('keydown', baixo);
		addEventListener('keyup', cima);
		return () => {
			removeEventListener('keydown', baixo);
			removeEventListener('keyup', cima);
		};
	});

	function aoBaixar(e: PointerEvent) {
		if (e.button === 2) return;
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
		switch (ui.ferramenta) {
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
		if (arrasto) {
			const t = mesa.tokens.find((k) => k.id === arrasto!.id);
			const a = arrasto;
			arrasto = null;
			mesa.enviar('fantasma', null, true);
			if (t && (a.x !== t.x || a.y !== t.y)) {
				const metros = distanciaEntre(t, { x: a.x, y: a.y, tamanho: t.tamanho });
				const D = deslocamentoDe(t);
				const info = infoMovimento(metros, mesa.daVez.has(t.id) ? t.movido : 0, D);
				ui.anuncio = info.faixa === 'normal' ? `${t.nome}: ${info.total} m andados, sobram ${D - info.total} m` : info.faixa === 'sprint' ? `${t.nome}: ${info.total} m andados, com sprint` : `${t.nome}: ${info.texto}`;
				mesa.mover(t.id, a.x, a.y, metros);
			}
			return;
		}
		if (desenho) {
			const pts = desenho;
			desenho = null;
			if (pts.length < 2) return;
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
		const metros = distanciaEntre(arrastado, destino);
		const info = infoMovimento(metros, mesa.daVez.has(arrastado.id) ? arrastado.movido : 0, deslocamentoDe(arrastado));
		const pc = !!arrastado.personagem_id || (!arrastado.npc_id && !!arrastado.dono_id);
		const inimigos = visiveis.filter((e) => e.id !== arrastado.id && e.visivel && (pc ? !!e.npc_id && !e.aliado : !!e.personagem_id || (!e.npc_id && !!e.dono_id)));
		const reacao = provocaReacao(arrastado, destino, inimigos).map((e) => nomeCurto(e.nome));
		const cor = info.faixa === 'normal' ? corCss(mesa.corDe(mesa.donoDe(arrastado))) : info.faixa === 'sprint' ? 'var(--acc)' : 'var(--mesa-vermelhao)';
		return { ...info, cor, reacao: reacao.length ? `provoca reação de ${reacao.join(', ')}` : '' };
	});
	const aneis = $derived.by(() => {
		const a = ui.aneis;
		const t = a && mesa.tokens.find((k) => k.id === a.token);
		if (!a || !t || !cena) return null;
		return { t, corId: mesa.corDe(mesa.donoDe(t)), cor: corCss(mesa.corDe(mesa.donoDe(t))), corpo: a.corpo ? quadradosEmVolta(t, a.corpo, L, A) : [], lista: a.lista };
	});
	const reguaMinha = $derived(ui.regua ? { pontos: ui.regua.cur ? [...ui.regua.pontos, ui.regua.cur] : ui.regua.pontos, feita: ui.regua.feita, fixa: ui.regua.fixa, t: ui.regua.t } : null);
	const cursor = $derived(
		arrasto || pan ? 'grabbing' : ui.mira && !ui.mira.fixa ? 'crosshair' : ui.ferramenta === 'mover' ? 'default' : ui.ferramenta === 'borracha' ? 'cell' : 'crosshair'
	);
	const corMolde = $derived(molde ? (molde.ok ? corCss(mesa.corDe(mesa.donoDe(molde.lancador))) : 'var(--mesa-vermelhao)') : '');
	const letras = (i: number) => (i < 26 ? String.fromCharCode(65 + i) : String.fromCharCode(65 + Math.floor(i / 26) - 1) + String.fromCharCode(65 + (i % 26)));

	// o molde que eu miro também aparece para o grupo
	$effect(() => {
		if (!molde || !ui.mira) {
			mesa.enviar('molde', null, true);
			return;
		}
		mesa.enviar('molde', { nome: ui.mira.jutsu.nome, quadrados: molde.quadrados, contorno: molde.contorno, anel: molde.anel, ok: molde.ok });
	});
</script>

{#snippet rotulo(x: number, y: number, txt: string, cor: string, ancora: 'ini' | 'meio' = 'ini')}
	{@const w = larguraRotulo(txt)}
	{@const x0 = ancora === 'meio' ? x - w / 2 : x}
	<g pointer-events="none">
		<rect x={x0} y={y - F(10)} width={w} height={F(20)} style="fill: var(--b0); stroke: {cor}" stroke-width={F(2)} />
		<text x={x0 + F(7)} y={y + F(4.5)} style="fill: {cor}" font-size={F(12)} font-family="'Pixelify Sans'" font-weight="700">{txt}</text>
	</g>
{/snippet}

<!-- quadrados atingidos: um traçado só (uma esfera de 20 m tem mais de mil quadrados) -->
{#snippet quadrados(lista: Quadrado[], cor: CorMesa | null)}
	{#if lista?.length}
		{@const d = lista.map(([x, y]) => `M${x} ${y}h1v1h-1z`).join('')}
		<path {d} style="fill: {corCss(cor ?? 'ardosia')}" fill-opacity="0.18" pointer-events="none" />
		<path {d} fill="url(#hachura-{cor ?? 'ardosia'})" pointer-events="none" />
	{/if}
{/snippet}

<div bind:this={caixa} bind:clientWidth={W} bind:clientHeight={H} class="absolute inset-0 overflow-hidden bg-b0" role="presentation" ondragover={aoArrastarSobre} ondrop={aoLargar}>
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
		<defs>
			{#each CORES as c (c.id)}
				<pattern id="hachura-{c.id}" width="0.35" height="0.35" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
					<line x1="0" y1="0" x2="0" y2="0.35" style="stroke: var(--mesa-{c.id})" stroke-width="0.06" stroke-opacity="0.7" />
				</pattern>
			{/each}
		</defs>
		<g transform="translate({-ui.vx * s} {-ui.vy * s}) scale({s})">
			<rect x="0" y="0" width={L} height={A} style="fill: var(--b1)" />
			{#each { length: L + 1 } as _, i (i)}
				<line x1={i} y1="0" x2={i} y2={A} style="stroke: var(--fg)" stroke-opacity={i % 5 ? 0.09 : 0.18} stroke-width={F(1)} />
			{/each}
			{#each { length: A + 1 } as _, j (j)}
				<line x1="0" y1={j} x2={L} y2={j} style="stroke: var(--fg)" stroke-opacity={j % 5 ? 0.09 : 0.18} stroke-width={F(1)} />
			{/each}

			{#each mesa.efeitos as ef (ef.id)}
				{@const c = corCss(mesa.corDe(ef.autor_id))}
				{@render quadrados(ef.quadrados, mesa.corDe(ef.autor_id))}
				{@render rotulo(ef.rotulo_x, ef.rotulo_y, `${ef.nome} · ${ef.turnos == null ? '1 cena' : `${ef.turnos} ${ef.turnos === 1 ? 'turno' : 'turnos'}`}`, c, 'meio')}
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
				{#if molde.forma === 'cena'}
					<!-- área maior que a cena: a cena inteira acende -->
					<rect x="0" y="0" width={L} height={A} style="fill: {corMolde}" fill-opacity="0.12" pointer-events="none" />
					<rect x="0" y="0" width={L} height={A} fill="url(#hachura-{molde.ok ? (mesa.corDe(mesa.donoDe(molde.lancador)) ?? 'ardosia') : 'vermelhao'})" pointer-events="none" />
				{/if}
				{#if molde.contorno}<polygon points={molde.contorno.map((p) => p.join(',')).join(' ')} fill="none" style="stroke: {corMolde}" stroke-width={F(2)} pointer-events="none" />{/if}
				{#if molde.forma === 'esfera' && !ui.mira.jutsu.regua.emSi || molde.forma === 'parede'}
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

			{#each visiveis as t (t.id)}
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
					<g opacity={t.visivel ? 1 : 0.5}>
						{#if mesa.daVez.has(t.id)}<circle {cx} {cy} r={(mol ? rm : r) + 0.12} fill="none" style="stroke: var(--acc)" stroke-width={0.1} />{/if}
						{#if ui.sel === t.id}<circle {cx} {cy} r={(mol ? rm : r) + 0.22} fill="none" style="stroke: var(--fg)" stroke-width={F(2)} stroke-dasharray="{F(4)} {F(3)}" />{/if}
						<circle {cx} {cy} r={rf} style="fill: {caido ? 'var(--b3)' : 'var(--b2)'}" />
						{#if foto}
							<clipPath id="foto-{t.id}"><circle {cx} {cy} r={rf - 0.02} /></clipPath>
							<image href={foto} x={cx - rf} y={cy - rf} width={2 * rf} height={2 * rf} preserveAspectRatio="xMidYMid slice" clip-path="url(#foto-{t.id})" style="filter: {caido ? 'grayscale(1) brightness(.6)' : 'none'}" />
						{:else}
							<text x={cx} y={cy + (0.11 * n * rf) / r} text-anchor="middle" font-size={(0.32 * n * rf) / r} font-family="'Pixelify Sans'" font-weight="700" style="fill: {caido ? 'var(--field)' : 'var(--fg)'}">{t.sigla || t.nome.slice(0, 2).toUpperCase()}</text>
						{/if}
						<circle {cx} {cy} r={rf} fill="none" style="stroke: {caido ? 'var(--field)' : c}" stroke-width={(mol ? 0.05 : 0.08) * Math.min(n, 3)} />
						{#if mol}
							<image href="/molduras/{mol.id}.png" x={cx - rm} y={cy - rm} width={2 * rm} height={2 * rm} pointer-events="none" style="image-rendering: pixelated; filter: {caido ? 'grayscale(1) brightness(.6)' : 'none'}" />
						{/if}
						<rect x={cx - 0.38 * n} y={y + n - 0.12} width={0.76 * n} height={F(5)} style="fill: var(--b0)" />
						<rect x={cx - 0.38 * n} y={y + n - 0.12} width={0.76 * n * fr} height={F(5)} style="fill: {fr > 0.5 ? 'var(--ok)' : fr > 0.25 ? 'var(--warn)' : 'var(--err)'}" />
						<text x={cx} y={y + n + F(12)} text-anchor="middle" font-size={F(11)} font-family="'Noto Sans'" font-weight="600" style="fill: var(--fg); stroke: var(--b0)" stroke-width={F(3)} paint-order="stroke">{nomeCurto(t.nome).split(' ')[0]}{t.membro ? ` ${t.membro}` : ''}</text>
						{#if t.condicoes.length}
							<!-- estados: ícones em volta do token, do alto para a direita -->
							{@const lado = Math.min(0.6, 0.44 + 0.03 * n)}
							{@const raio = r + 0.2}
							{#each t.condicoes.slice(0, 8) as cond, i (cond)}
								{@const a = -Math.PI / 2 + i * ((50 * Math.PI) / 180)}
								<g>
									<title>{ESTADO_NOME[cond] ?? cond}</title>
									<circle cx={cx + raio * Math.cos(a)} cy={cy + raio * Math.sin(a)} r={lado / 2} style="fill: var(--b0); stroke: var(--warn)" stroke-width={F(1.5)} />
									<image href="/icons/estado/ic-estado-{cond}-32.png" x={cx + raio * Math.cos(a) - lado / 2} y={cy + raio * Math.sin(a) - lado / 2} width={lado} height={lado} style="image-rendering: pixelated" />
								</g>
							{/each}
							{#if t.condicoes.length > 8}
								<text x={cx + raio} y={cy + raio} font-size={F(10)} font-family="'Pixelify Sans'" font-weight="700" style="fill: var(--warn); stroke: var(--b0)" stroke-width={F(3)} paint-order="stroke">+{t.condicoes.length - 8}</text>
							{/if}
						{/if}
						{#if !t.visivel}
							<g style="stroke: var(--fg)" stroke-width={F(2)} fill="none"><path d="M{x + 0.04} {y + 0.2}q.18 -.16 .36 0q-.18 .16 -.36 0" /><line x1={x + 0.06} y1={y + 0.38} x2={x + 0.38} y2={y + 0.02} /></g>
						{/if}
					</g>
				{/if}
			{/each}

			{#if arrasto && infoArrasto}
				{@render rotulo(arrasto.x + (arrastado?.tamanho ?? 1) / 2, arrasto.y - 0.3, infoArrasto.texto, infoArrasto.cor, 'meio')}
				{#if infoArrasto.reacao}{@render rotulo(arrasto.x + (arrastado?.tamanho ?? 1) / 2, arrasto.y - 0.3 - F(26), infoArrasto.reacao, 'var(--mesa-vermelhao)', 'meio')}{/if}
			{/if}

			{#each [...(reguaMinha ? [[mesa.eu, reguaMinha] as const] : []), ...Object.entries(mesa.reguas)] as [u, r] (u)}
				{@const c = corCss(mesa.corDe(u))}
				{@const pts = r.pontos}
				{@const seg = trechos(pts)}
				{@const total = seg.reduce((a, b) => a + b, 0)}
				{@const ult = pts[pts.length - 1]}
				{#if pts.length}
					<g opacity={r.feita && !r.fixa ? Math.max(0, 1 - (agora - r.t) / 3000) : 1} pointer-events="none">
						<polyline points={pts.map((q) => `${q[0] + 0.5},${q[1] + 0.5}`).join(' ')} fill="none" style="stroke: {c}" stroke-width={F(3)} stroke-dasharray="{F(10)} {F(4)}" />
						{#each pts as q, i (i)}<rect x={q[0] + 0.5 - F(5)} y={q[1] + 0.5 - F(5)} width={F(10)} height={F(10)} style="fill: {c}" />{/each}
						{@render rotulo(ult[0] + 0.5, ult[1] - 0.35, seg.length > 1 ? `${seg.join(' + ')} = ${total} m` : `${total} m`, c, 'meio')}
						{@render rotulo(ult[0] + 0.5, ult[1] + 1.45, `${mesa.membro(u)?.nome ?? '?'} medindo`, c, 'meio')}
					</g>
				{/if}
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

		{#if cena?.coordenadas}
			<rect x="0" y="0" width={W} height="20" style="fill: var(--b0)" opacity="0.85" />
			<rect x="0" y="0" width="24" height={H} style="fill: var(--b0)" opacity="0.85" />
			{#each { length: L } as _, i (i)}
				{@const x = (i + 0.5 - ui.vx) * s}
				{#if x > 24 && x < W}<text {x} y="14" text-anchor="middle" font-size="11" font-family="'Pixelify Sans'" style="fill: var(--mut)">{letras(i)}</text>{/if}
			{/each}
			{#each { length: A } as _, j (j)}
				{@const y = (j + 0.5 - ui.vy) * s}
				{#if y > 20 && y < H}<text x="12" y={y + 4} text-anchor="middle" font-size="11" font-family="'Pixelify Sans'" style="fill: var(--mut)">{j + 1}</text>{/if}
			{/each}
		{/if}
	</svg>
</div>

<style>
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
