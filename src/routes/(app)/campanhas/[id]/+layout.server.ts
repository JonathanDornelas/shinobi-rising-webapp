import { carregarCampanha } from '#lib/campanhas/servidor.ts';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals, params }) => {
	const usuario = (await locals.usuarioAtual())!;
	return carregarCampanha(locals, params.id, usuario.id);
};
