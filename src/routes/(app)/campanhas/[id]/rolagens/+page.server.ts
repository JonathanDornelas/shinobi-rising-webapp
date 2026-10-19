import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

// O registro de rolagens é global (L10 · R1): a campanha vira o filtro inicial.
export const load: PageServerLoad = ({ params }) => redirect(307, `/rolagens?campanha=${params.id}`);
