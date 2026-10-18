import { redirect } from '@sveltejs/kit';
import { montarFila } from '#lib/aprovacoes/fila.server.ts';
import type { PageServerLoad } from './$types';

// R1/R2 · Fila de aprovações do Mestre. O jogador vai para Minhas submissões (R3).
export const load: PageServerLoad = async ({ locals, params, parent }) => {
	const { campanha, papel, membros } = await parent();
	if (papel !== 'mestre') redirect(303, `/campanhas/${params.id}/submissoes`);
	return { titulo: `Aprovações · ${campanha.nome}`, navTitulo: 'APROVAÇÕES', fila: await montarFila(locals.supabase, campanha, membros) };
};
