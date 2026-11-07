import { dev } from '$app/env';
import { error } from '@sveltejs/kit';

// Em produção, esta página não existe.
export const load = () => {
	if (!dev) error(404, 'Não encontrada');
};
