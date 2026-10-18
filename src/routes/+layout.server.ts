import type { LayoutServerLoad } from './$types';

// Nas páginas pré-renderizadas (documentação) isto roda no build e devolve null;
// a sessão real é lida no navegador (estado/sessao.svelte.ts).
export const load: LayoutServerLoad = async ({ locals }) => ({ usuario: await locals.usuarioAtual() });
