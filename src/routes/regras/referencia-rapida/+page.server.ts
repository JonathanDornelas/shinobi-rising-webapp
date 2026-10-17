import { referencia } from '#lib/livro/dados.server.ts';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = () => ({
	referencia,
	titulo: 'Referência rápida',
	navTitulo: 'REFERÊNCIA RÁPIDA',
	descricao: 'O escudo do Mestre: DT, ações, ataque e defesa, estados, fadiga, recuperação, DT do jutsu, PJ, custos de PT e vantagem elemental.'
});
