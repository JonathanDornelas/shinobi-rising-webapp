// Acompanha a seção visível durante a leitura ("Nesta página") e o progresso no capítulo.
export class EspiaoSecoes {
	ativa = $state<string | null>(null);
	pct = $state(0);

	/** Observa os títulos com os ids dados dentro de `raiz`. Devolve a função de limpeza. */
	observar(raiz: HTMLElement, ids: string[]) {
		let quadro = 0;
		const medir = () => {
			quadro = 0;
			const limite = 120;
			let atual: string | null = ids[0] ?? null;
			for (const id of ids) {
				const el = document.getElementById(id);
				if (!el) continue;
				if (el.getBoundingClientRect().top <= limite) atual = id;
				else break;
			}
			this.ativa = atual;
			const r = raiz.getBoundingClientRect();
			const total = r.height - innerHeight;
			this.pct = total > 0 ? Math.round(Math.min(100, Math.max(0, (-r.top / total) * 100))) : 100;
		};
		const agendar = () => {
			if (!quadro) quadro = requestAnimationFrame(medir);
		};
		medir();
		addEventListener('scroll', agendar, { passive: true });
		addEventListener('resize', agendar);
		return () => {
			cancelAnimationFrame(quadro);
			removeEventListener('scroll', agendar);
			removeEventListener('resize', agendar);
		};
	}
}

/**
 * Leva ao destino de uma âncora e o realça. No celular, as tabelas curtas viram cartões e a linha da tabela (escondida)
 * tem um par visível com o sufixo "-m" (ex.: #cond-atordoado-m).
 */
export function irPara(id: string, rolar = true): HTMLElement | null {
	let el = document.getElementById(id);
	if (el && !el.offsetParent) el = document.getElementById(`${id}-m`) ?? el;
	if (!el) return null;
	if (rolar || !el.offsetParent || el.id.endsWith("-m")) el.scrollIntoView({ block: "start" });
	realcar(el);
	return el;
}

/** Destaca rapidamente a seção de destino ao chegar por âncora (1s). */
export function realcar(el: HTMLElement) {
	el.animate([{ backgroundColor: 'rgba(217,168,43,.28)' }, { backgroundColor: 'transparent' }], { duration: 1000, easing: 'ease-out' });
}
