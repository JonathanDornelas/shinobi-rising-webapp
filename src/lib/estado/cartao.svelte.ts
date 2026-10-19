// Cartão de termo (estilo D&D Beyond): um só na tela, aberto pelo hover/foco de um termo ou dado no texto das regras
// (desktop) ou pelo toque (celular, onde fica aberto até tocar fora). Desenhado por CartaoTermo.svelte no layout raiz.
import { posicionar } from '#lib/componentes/ui/posicao.ts';

export type AlvoCartao = { tipo: 'termo'; id: string; href: string | null } | { tipo: 'dado'; expr: string };

const LARGURA = 320;
const ALTURA = 210;

class Cartao {
	alvo = $state<AlvoCartao | null>(null);
	pos = $state<{ left: number; top: number } | null>(null);
	/** Aberto por toque ou clique: não fecha quando o mouse sai. */
	fixo = $state(false);
	ancora: HTMLElement | null = null;
	private abrirT: ReturnType<typeof setTimeout> | undefined;
	private fecharT: ReturnType<typeof setTimeout> | undefined;

	/** Mesmo alvo e âncora já abertos (o 2º toque no celular segue o link). */
	aberto = (el: HTMLElement) => this.alvo !== null && this.ancora === el;

	abrir(el: HTMLElement, alvo: AlvoCartao, { atraso = 0, fixo = false } = {}) {
		clearTimeout(this.fecharT);
		clearTimeout(this.abrirT);
		const ir = () => {
			this.ancora = el;
			this.alvo = alvo;
			this.fixo = fixo;
			this.pos = posicionar(el, LARGURA, ALTURA);
		};
		if (atraso) this.abrirT = setTimeout(ir, atraso);
		else ir();
	}

	/** Mouse saiu do termo ou do cartão: fecha logo depois, a menos que volte para um deles. */
	fecharDepois() {
		clearTimeout(this.abrirT);
		if (this.fixo) return;
		clearTimeout(this.fecharT);
		this.fecharT = setTimeout(() => this.fechar(), 160);
	}

	manter() {
		clearTimeout(this.fecharT);
	}

	fechar() {
		clearTimeout(this.abrirT);
		clearTimeout(this.fecharT);
		this.alvo = null;
		this.pos = null;
		this.fixo = false;
		this.ancora = null;
	}
}

export const cartao = new Cartao();
export const LARGURA_CARTAO = LARGURA;
