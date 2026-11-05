// A vitrine da home: só as miniaturas que ela mostra chegam ao navegador, sem o catálogo inteiro.
import { miniaturaPorId } from '#lib/mesa/miniaturas.ts';
import type { PageServerLoad } from './$types';

const VITRINE = ['genin-de-konoha', 'ninja-medica', 'espadachim-da-nevoa', 'anbu-raposa', 'invocadora', 'senhor-oni', 'ceifadora'];

export const load: PageServerLoad = () => ({
	vitrine: VITRINE.flatMap((id) => miniaturaPorId(`arquetipos--${id}`) ?? [])
});
