import { carregarRegistro } from '#lib/rolagens/registro.server.ts';
import type { PageServerLoad } from './$types';

// L10 · R1 · Registro de rolagens dentro da campanha: o menu lateral fica, e a campanha é o filtro inicial
// (dá para trocar para "Todas" ou outra campanha nos filtros).
export const load: PageServerLoad = async ({ locals, params }) => ({
	titulo: 'Rolagens',
	navTitulo: 'ROLAGENS',
	...(await carregarRegistro(locals, params.id))
});
