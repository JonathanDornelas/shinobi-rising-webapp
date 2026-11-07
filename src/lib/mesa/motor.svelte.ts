// O motor do fingersMap dentro do quadro. Carrega só quando a cena tem mapa vivo: o código e a arte não pesam para quem joga em
// cena comum. Se este navegador não roda (sem WebGL 2, ou a arte não chegou), `falhou` fica ligado e o quadro segue com a imagem.
import { urlMapas, type MapaVivo } from './mapa-vivo.ts';
import type { Air, Body, Camera, Figure, FigureArt, Look, MapPlayer } from './motor/player.js';

/** Quem deve estar no mapa: `montar` só roda para uma imagem que o motor ainda não tem. */
export interface FiguraPedida {
	id: string;
	x: number;
	y: number;
	z: number;
	chave: string;
	montar: () => Promise<FigureArt> | FigureArt;
	sombra: { chave: string; montar: () => FigureArt } | null;
}

const FALHOU = -1;

export class MotorDaMesa {
	pronto = $state(false);
	falhou = $state(false);
	/** Os tokens que o motor já desenha: o quadro deixa de desenhar o corpo deles. */
	noMapa = $state.raw<ReadonlySet<string>>(new Set());
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
			this.corpos = player.bodies();
			if (this.olhar) player.setCamera(this.olhar);
			player.setAir(this.atmosfera);
			player.setLook(this.aparencia);
			player.setVision(this.mascara);
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
		this.player?.dispose();
		this.player = null;
		this.pronto = false;
		this.sprites.clear();
		this.pedidos.clear();
		this.noMapa = new Set();
		this.corpos = [];
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
			const sombra = f.sombra && this.sprites.get(f.sombra.chave);
			if (f.sombra && sombra === undefined) this.pedir(f.sombra.chave, f.sombra.montar);
			if (sombra !== undefined && sombra !== null && sombra !== FALHOU) feitas.push({ sprite: sombra, x: f.x, y: f.y, flat: true });
			feitas.push({ sprite, x: f.x, y: f.y, z: f.z });
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
