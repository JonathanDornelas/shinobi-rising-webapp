<script lang="ts">
	// Brasas subindo atrás do título da home. Um canvas de baixa resolução esticado sem suavizar: cada brasa é um pixel grande,
	// como o resto da arte. Só roda com a abertura na tela e a aba à vista, e fica de fora para quem pede menos movimento ou
	// economia de dados.
	import { onMount } from 'svelte';

	/** Lado de um pixel da brasa, em pixels de tela. */
	const PIXEL = 3;
	/** 20 quadros por segundo: o salto entre quadros combina com a pixel art e poupa a bateria. */
	const PASSO = 50;
	/** Da brasa acesa à que se apaga. */
	const TONS = ['#f2c14e', '#f2a93b', '#e8622c', '#c44536', '#8b2e20', '#5c1e15'];

	interface Brasa {
		x: number;
		y: number;
		sobe: number;
		fase: number;
		vida: number;
		dura: number;
		lado: number;
	}

	let tela: HTMLCanvasElement;

	onMount(() => {
		const ligacao = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
		if (matchMedia('(prefers-reduced-motion: reduce)').matches || ligacao?.saveData) return;
		const ctx = tela.getContext('2d');
		const palco = tela.parentElement;
		if (!ctx || !palco) return;

		let largura = 0;
		let altura = 0;
		let brasas: Brasa[] = [];

		// nascem em volta do sol, no meio da abertura; as primeiras já começam espalhadas pelo caminho
		const nova = (espalhar: boolean): Brasa => {
			const dura = 70 + Math.random() * 110;
			const sobe = 0.35 + Math.random() * 0.6;
			const vida = espalhar ? Math.random() * dura : 0;
			return {
				x: largura * (0.5 + (Math.random() - 0.5) * 0.62),
				y: altura * (0.5 + Math.random() * 0.2) - vida * sobe,
				sobe,
				fase: Math.random() * Math.PI * 2,
				vida,
				dura,
				lado: Math.random() < 0.2 ? 2 : 1
			};
		};

		const medir = () => {
			largura = Math.ceil(palco.clientWidth / PIXEL);
			altura = Math.ceil(palco.clientHeight / PIXEL);
			tela.width = largura;
			tela.height = altura;
			tela.style.width = `${largura * PIXEL}px`;
			tela.style.height = `${altura * PIXEL}px`;
			brasas = Array.from({ length: Math.min(46, Math.round(largura / 8)) }, () => nova(true));
		};

		let quadro = 0;
		let ultimo = 0;
		let visivel = false;
		const passo = (agora: number) => {
			quadro = requestAnimationFrame(passo);
			if (agora - ultimo < PASSO) return;
			ultimo = agora;
			ctx.clearRect(0, 0, largura, altura);
			for (let i = 0; i < brasas.length; i++) {
				const b = brasas[i];
				b.vida++;
				b.y -= b.sobe;
				b.x += Math.sin(b.fase + b.vida * 0.09) * 0.3;
				if (b.vida >= b.dura || b.y < 0) {
					brasas[i] = nova(false);
					continue;
				}
				ctx.fillStyle = TONS[Math.min(TONS.length - 1, Math.floor((b.vida / b.dura) * TONS.length))];
				ctx.fillRect(Math.round(b.x), Math.round(b.y), b.lado, b.lado);
			}
		};
		const ligar = () => {
			if (!quadro && visivel && !document.hidden) quadro = requestAnimationFrame(passo);
		};
		const desligar = () => {
			cancelAnimationFrame(quadro);
			quadro = 0;
		};
		const aoMudarAba = () => (document.hidden ? desligar() : ligar());

		medir();
		const tamanho = new ResizeObserver(medir);
		tamanho.observe(palco);
		const vigia = new IntersectionObserver(([e]) => {
			visivel = e.isIntersecting;
			if (visivel) ligar();
			else desligar();
		});
		vigia.observe(palco);
		document.addEventListener('visibilitychange', aoMudarAba);

		return () => {
			desligar();
			tamanho.disconnect();
			vigia.disconnect();
			document.removeEventListener('visibilitychange', aoMudarAba);
		};
	});
</script>

<canvas bind:this={tela} class="pointer-events-none absolute top-0 left-0 z-[5] [image-rendering:pixelated]" aria-hidden="true"></canvas>
