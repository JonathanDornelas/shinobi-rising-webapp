import { redirecionarSeLogado } from '#lib/conta/servidor.ts';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, url }) => {
	await redirecionarSeLogado(locals, url);
	return { titulo: 'Entrar', navTitulo: 'ENTRAR' };
};
