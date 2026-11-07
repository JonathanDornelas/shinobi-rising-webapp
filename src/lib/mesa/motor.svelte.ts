// O motor do fingersMap dentro do quadro. Carrega só quando a cena tem mapa vivo: o código e a arte não pesam para quem joga em
// cena comum. Se este navegador não roda (sem WebGL 2, ou a arte não chegou), `falhou` fica ligado e o quadro segue com a imagem.
import { untrack } from 'svelte';
import { urlMapas, type MapaVivo } from './mapa-vivo.ts';
import type { Air, Body, Camera, Door, Figure, FigureArt, Look, MapPlayer, Wall } from './motor/player.js';

/** Quem deve estar no mapa: `montar` só roda para uma imagem que o motor ainda não tem. */
export interface FiguraPedida {
	id: string;
	x: number;
	y: number;
	z: number;
	chave: string;
	montar: () => Promise<FigureArt> | FigureArt;
	/** O motor faz a sombra com a luz, sob os pés que ele acha na imagem. */
	sombra: boolean;
}

const FALHOU = -1;

export class MotorDaMesa {
	pronto = $state(false);
	falhou = $state(false);
	/** Os tokens que o motor já desenha: o quadro deixa de desenhar o corpo deles. */
	noMapa = $state.raw<ReadonlySet<string>>(new Set());
	/** O que está de pé agora e esconde o que há dentro: muda com os telhados e com quem entra numa casa. */
	corpos = $state.raw<readonly Body[]>([]);

	private player: MapPlayer | null = null;
	private vez = 0;
	private sprites = new Map<string, number>();
	private pedidos = new Set<string>();
	private lista: readonly FiguraPedida[] = [];
	private olhar: Camera | null = null;
	private aparencia: Partial<Look> = {};
	private atmosfera: Partial<Air> = {};
	private mascara: HTMLCanvasElement | null = null;
	private pessoas: readonly { x: number; y: number; z: number }[] = [];
	private asPortas: readonly Door[] = [];
	private paredesPorAltura = new Map<number, readonly Wall[]>();
	private fim: AbortController | null = null;

	async abrir(tela: HTMLCanvasElement, vivo: MapaVivo) {
		this.fechar();
		const vez = ++this.vez;
		this.falhou = false;
		try {
			const [{ MapPlayer }, resposta] = await Promise.all([import('./motor/player.js'), fetch(urlMapas(vivo.mapa))]);
			if (!resposta.ok) throw new Error('o mapa não chegou');
			const bytes = new Uint8Array(await resposta.arrayBuffer());
			if (vez !== this.vez) return;
			// o toque quase sempre vem de um aparelho sem folga de placa: começa sem as sombras das lâmpadas
			const player = await MapPlayer.open(tela, bytes, urlMapas(vivo.pacote), { floor: vivo.andar, quality: navigator.maxTouchPoints > 0 ? 'low' : 'high' });
			if (vez !== this.vez) return player.dispose();
			this.player = player;
			// a placa pode perder o contexto (o driver reiniciou, a aba ficou sem memória): o quadro volta para a imagem do mapa
			this.fim = new AbortController();
			tela.addEventListener(
				'webglcontextlost',
				() => {
					console.error('Mapa vivo: a placa perdeu o contexto.');
					this.falhou = true;
					this.fechar();
				},
				{ signal: this.fim.signal }
			);
			if (this.olhar) player.setCamera(this.olhar);
			player.setAir(this.atmosfera);
			player.setLook(this.aparencia);
			player.setVision(this.mascara);
			player.setDoors(this.asPortas);
			player.setInside(this.pessoas);
			this.conferirCorpos();
			player.start();
			this.pronto = true;
			this.figuras(this.lista);
		} catch (erro) {
			console.error('Mapa vivo:', erro);
			if (vez === this.vez) this.falhou = true;
		}
	}

	fechar() {
		this.vez++;
		this.fim?.abort();
		this.fim = null;
		this.player?.dispose();
		this.player = null;
		this.pronto = false;
		this.sprites.clear();
		this.pedidos.clear();
		this.noMapa = new Set();
		this.corpos = [];
		this.paredesPorAltura.clear();
	}

	private conferirCorpos() {
		const novos = this.player?.standingBodies() ?? [];
		untrack(() => {
			if (novos.length !== this.corpos.length || novos.some((b, i) => b !== this.corpos[i])) this.corpos = novos;
		});
	}

	/** Onde dá para ficar em pé sobre um ponto, em metros, do mais baixo para o mais alto. */
	niveis(x: number, y: number) {
		return this.player?.levelsAt(x, y) ?? [0];
	}

	/** As paredes que param quem está nesta altura: uma lista por altura, sempre a mesma, para a visão aproveitar o que já calculou. */
	paredesPara(metros: number) {
		const chave = Math.round(metros * 10);
		let lista = this.paredesPorAltura.get(chave);
		if (!lista) {
			lista = this.player?.wallsFor(metros) ?? [];
			this.paredesPorAltura.set(chave, lista);
		}
		return lista;
	}

	/** Quem está onde: a casa com alguém dentro abre. */
	dentro(pessoas: readonly { x: number; y: number; z: number }[]) {
		this.pessoas = pessoas;
		this.player?.setInside(pessoas);
		this.conferirCorpos();
	}

	portas(lista: readonly Door[]) {
		this.asPortas = lista;
		this.player?.setDoors(lista);
	}

	camera(olhar: Camera) {
		this.olhar = olhar;
		this.player?.setCamera(olhar);
	}

	ar(ar: Partial<Air>) {
		this.atmosfera = ar;
		this.player?.setAir(ar);
	}

	aparenciaDoMapa(look: Partial<Look>) {
		this.aparencia = look;
		this.player?.setLook(look);
		this.conferirCorpos();
	}

	/** O que o grupo vê: um canvas sobre o mapa, de cima. Null mostra tudo. */
	visao(mascara: HTMLCanvasElement | null) {
		this.mascara = mascara;
		this.player?.setVision(mascara);
	}

	figuras(lista: readonly FiguraPedida[]) {
		this.lista = lista;
		const player = this.player;
		if (!player) return;
		const feitas: Figure[] = [];
		const ids = new Set<string>();
		for (const f of lista) {
			const sprite = this.sprites.get(f.chave);
			if (sprite === undefined) this.pedir(f.chave, f.montar);
			if (sprite === undefined || sprite === FALHOU) continue;
			feitas.push({ sprite, x: f.x, y: f.y, z: f.z, shadow: f.sombra });
			ids.add(f.id);
		}
		player.setFigures(feitas);
		if (ids.size !== this.noMapa.size || [...ids].some((id) => !this.noMapa.has(id))) this.noMapa = ids;
	}

	private pedir(chave: string, montar: FiguraPedida['montar']) {
		if (this.pedidos.has(chave)) return;
		this.pedidos.add(chave);
		const vez = this.vez;
		void (async () => {
			try {
				const arte = await montar();
				if (vez !== this.vez || !this.player) return;
				let sprite = this.player.addFigure(arte, chave);
				if (sprite === null) {
					// a página cheia: começa de novo, e quem está em cena volta a ser pedido
					this.player.clearFigures();
					this.sprites.clear();
					sprite = this.player.addFigure(arte, chave);
				}
				this.sprites.set(chave, sprite ?? FALHOU);
			} catch (erro) {
				console.warn('Mapa vivo: uma figura segue desenhada no quadro.', erro);
				if (vez === this.vez) this.sprites.set(chave, FALHOU);
			}
			this.pedidos.delete(chave);
			if (vez === this.vez) this.figuras(this.lista);
		})();
	}
}
