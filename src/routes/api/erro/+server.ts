// Erros que o navegador viu (hooks.client.ts): só registra nos logs do servidor, com o tamanho limitado.
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request, locals }) => {
	const texto = (await request.text()).slice(0, 4000);
	let d: Record<string, unknown> = {};
	try {
		d = JSON.parse(texto);
	} catch {
		return new Response(null, { status: 400 });
	}
	const usuario = await locals.usuarioAtual().catch(() => null);
	console.error('[erro-navegador]', JSON.stringify({ ...d, usuario: usuario?.id ?? null }));
	return new Response(null, { status: 204 });
};
