// Ações de acessibilidade para camadas: prender o foco e fechar com Esc.
import type { Attachment } from 'svelte/attachments';

const FOCAVEIS = 'a[href], button:not([disabled]), input:not([disabled]), select, textarea, [tabindex]:not([tabindex="-1"])';

/** Prende o Tab dentro do elemento, foca o primeiro campo e devolve o foco ao fechar. */
export function prenderFoco(aoEsc: () => void): Attachment<HTMLElement> {
	return (no) => {
		const anterior = document.activeElement as HTMLElement | null;
		const primeiro = (no.querySelector('[data-autofoco]') as HTMLElement | null) ?? (no.querySelector(FOCAVEIS) as HTMLElement | null);
		(primeiro ?? no).focus({ preventScroll: true });
		function tecla(e: KeyboardEvent) {
			if (e.key === 'Escape') {
				e.stopPropagation();
				aoEsc();
				return;
			}
			if (e.key !== 'Tab') return;
			const itens = [...no.querySelectorAll<HTMLElement>(FOCAVEIS)].filter((el) => el.offsetParent !== null);
			if (!itens.length) return;
			const [a, z] = [itens[0], itens[itens.length - 1]];
			if (e.shiftKey && document.activeElement === a) {
				e.preventDefault();
				z.focus();
			} else if (!e.shiftKey && document.activeElement === z) {
				e.preventDefault();
				a.focus();
			}
		}
		no.addEventListener('keydown', tecla);
		const overflow = document.body.style.overflow;
		document.body.style.overflow = 'hidden';
		return () => {
			no.removeEventListener('keydown', tecla);
			document.body.style.overflow = overflow;
			anterior?.focus?.({ preventScroll: true });
		};
	};
}
