// Utilidades de servidor das telas de conta.
import { redirect } from '@sveltejs/kit';
import { destinoSeguro } from './regras.ts';

/** Quem já está logado não precisa de Entrar/Criar conta: segue para o destino. */
export async function redirecionarSeLogado(locals: App.Locals, url: URL) {
	if (await locals.usuarioAtual()) redirect(303, destinoSeguro(url.searchParams.get('volta')));
}
