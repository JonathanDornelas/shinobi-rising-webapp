import { dev } from '$app/env';
import { error } from '@sveltejs/kit';

// Só em desenvolvimento: o quadro de verdade, sem banco nem login, para o teste do mapa vivo no navegador. Em produção, não existe.
export const ssr = false;
export const prerender = false;
export const load = () => {
	if (!dev) error(404, 'Não encontrada');
};
