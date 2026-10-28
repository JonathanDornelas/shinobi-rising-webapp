// Erros no navegador (uma exceção ao desenhar a página cai na página de erro 500): o detalhe vai para a página de
// erro, para quem joga poder mandar, e um resumo vai para os logs do servidor (/api/erro), uma vez por mensagem.
import type { HandleClientError } from '@sveltejs/kit/hooks';

const enviados = new Set<string>();

export const handleError: HandleClientError = ({ kind, error, event }) => {
	// erros do app (error(...)) e do próprio SvelteKit (404) já têm mensagem própria
	if (kind !== 'unknown') return;
	const e = error instanceof Error ? error : new Error(String(error));
	const detalhe = `${e.name}: ${e.message}`.slice(0, 300);
	console.error('[erro]', event.url.pathname, e);
	if (!enviados.has(detalhe)) {
		enviados.add(detalhe);
		const corpo = JSON.stringify({ rota: event.route.id, caminho: event.url.pathname, detalhe, pilha: (e.stack ?? '').slice(0, 1500) });
		try {
			navigator.sendBeacon?.('/api/erro', new Blob([corpo], { type: 'application/json' }));
		} catch {
			// sem rede: fica só no console
		}
	}
	return { detalhe };
};
