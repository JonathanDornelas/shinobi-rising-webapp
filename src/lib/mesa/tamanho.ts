// Janelas redimensionáveis da Mesa (ficha rápida e ficha completa, com o resize do CSS): guardam o tamanho que a
// pessoa deixou e voltam com ele ao minimizar, fechar e abrir de novo. Cada janela tem o seu (por token ou ficha) e a
// última medida vale para a próxima janela do mesmo tipo que ainda não tem tamanho próprio.
import { gravar, ler } from '#lib/estado/armazenamento.ts';

type Tamanho = { w: number; h: number };
export interface ChavesTamanho {
	propria: string;
	geral: string;
}

export function lembrarTamanho(el: HTMLElement, chaves: ChavesTamanho | null) {
	if (!chaves) return;
	const t = ler<Tamanho | null>(`janela:${chaves.propria}`, null) ?? ler<Tamanho | null>(`janela:${chaves.geral}`, null);
	if (t && t.w > 0 && t.h > 0) {
		el.style.width = `${t.w}px`;
		el.style.height = `${t.h}px`;
	}
	let ultimo = t ? `${t.w}x${t.h}` : '';
	let timer: ReturnType<typeof setTimeout> | undefined;
	const ro = new ResizeObserver(() => {
		const w = el.offsetWidth;
		const h = el.offsetHeight;
		// minimizada (display: none) mede zero: não grava
		if (!w || !h || `${w}x${h}` === ultimo) return;
		clearTimeout(timer);
		timer = setTimeout(() => {
			ultimo = `${w}x${h}`;
			gravar(`janela:${chaves.propria}`, { w, h });
			gravar(`janela:${chaves.geral}`, { w, h });
		}, 300);
	});
	// a primeira medida é a de abertura (padrão ou a guardada), não um redimensionamento
	requestAnimationFrame(() => {
		ultimo = `${el.offsetWidth}x${el.offsetHeight}`;
		ro.observe(el);
	});
	return {
		destroy() {
			ro.disconnect();
			clearTimeout(timer);
		}
	};
}
