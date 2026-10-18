// Volta dos links de e-mail do Supabase (confirmação de conta e recuperação de senha).
// Troca o código (PKCE) ou o token_hash por uma sessão nos cookies e segue para `next`.
import { redirect } from '@sveltejs/kit';
import type { EmailOtpType } from '@supabase/supabase-js';
import { destinoSeguro } from '#lib/conta/regras.ts';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ url, locals }) => {
	const next = destinoSeguro(url.searchParams.get('next'));
	const code = url.searchParams.get('code');
	const tokenHash = url.searchParams.get('token_hash');
	const tipo = url.searchParams.get('type') as EmailOtpType | null;

	let ok = false;
	if (code) ok = !(await locals.supabase.auth.exchangeCodeForSession(code)).error;
	else if (tokenHash && tipo) ok = !(await locals.supabase.auth.verifyOtp({ token_hash: tokenHash, type: tipo })).error;

	if (ok) redirect(303, next);
	// Link inválido, expirado ou aberto em outro navegador.
	if (next.startsWith('/redefinir-senha')) redirect(303, '/redefinir-senha?erro=expirado');
	redirect(303, `/entrar?erro=expirado&volta=${encodeURIComponent(next)}`);
};
