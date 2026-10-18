import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ parent }) => {
	const { campanha, papel } = await parent();
	if (papel !== 'mestre') error(403, 'Só o Mestre mexe nas configurações da campanha.');
	return { titulo: `Configurações · ${campanha.nome}`, navTitulo: 'CONFIGURAÇÕES' };
};
