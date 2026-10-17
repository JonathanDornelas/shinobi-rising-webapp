// Índice de busca, servido como arquivo estático e baixado sob demanda pela paleta (G2) e pela página D9.
import { json } from '@sveltejs/kit';
import { busca } from '#lib/livro/dados.server.ts';

export const prerender = true;

export function GET() {
	return json(busca);
}
