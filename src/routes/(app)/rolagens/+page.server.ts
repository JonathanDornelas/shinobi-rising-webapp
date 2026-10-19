import { carregarRegistro } from '#lib/rolagens/registro.server.ts';
import type { PageServerLoad } from './$types';

// L10 · R1 · Registro de rolagens de todas as campanhas (aberto pela janela flutuante fora de uma campanha).
export const load: PageServerLoad = async ({ locals, url }) => ({
	titulo: 'Registro de rolagens',
	navTitulo: 'ROLAGENS',
	...(await carregarRegistro(locals, url.searchParams.get('campanha')))
});
