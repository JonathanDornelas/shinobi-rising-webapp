import { createServerClient } from '@supabase/ssr';
import { redirect } from '@sveltejs/kit';
import { sequence, type Handle } from '@sveltejs/kit/hooks';
import { building } from '$app/env';
import { PUBLIC_SUPABASE_PUBLISHABLE_KEY, PUBLIC_SUPABASE_URL } from '$app/env/public';
import type { Database } from '#lib/supabase/banco.ts';

/** Cliente Supabase por requisição, com a sessão nos cookies; e a validação do usuário pelo JWT. */
const supabase: Handle = async ({ event, resolve }) => {
	event.locals.supabase = createServerClient<Database>(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_PUBLISHABLE_KEY, {
		cookies: {
			getAll: () => event.cookies.getAll(),
			setAll: (cookies) => {
				for (const { name, value, options } of cookies) event.cookies.set(name, value, { ...options, path: '/' });
			}
		}
	});

	let usuario: App.Locals['usuario'] | undefined;
	event.locals.usuarioAtual = async () => {
		if (usuario !== undefined) return usuario;
		// páginas pré-renderizadas não têm sessão: evita a chamada ao Supabase durante o build
		if (!event.cookies.getAll().some((c) => c.name.startsWith('sb-'))) return (usuario = null);
		const { data, error } = await event.locals.supabase.auth.getClaims();
		const c = data?.claims;
		usuario = error || !c ? null : { id: c.sub, email: (c.email as string) ?? '', nome: (c.user_metadata?.nome as string) ?? '' };
		return usuario;
	};

	return resolve(event, {
		filterSerializedResponseHeaders: (nome) => nome === 'content-range' || nome === 'x-supabase-api-version'
	});
};

/** Áreas que exigem conta: sem sessão, vai para o login e volta depois. */
const PROTEGIDAS = ['/campanhas', '/perfil', '/notificacoes', '/rolagens'];
const guarda: Handle = async ({ event, resolve }) => {
	// No prerender não há sessão (e url.search é proibido); as páginas do app não são pré-renderizadas.
	if (building) return resolve(event);
	const caminho = event.url.pathname;
	if (PROTEGIDAS.some((p) => caminho === p || caminho.startsWith(p + '/'))) {
		const usuario = await event.locals.usuarioAtual();
		if (!usuario) redirect(303, `/entrar?volta=${encodeURIComponent(caminho + event.url.search)}`);
	}
	return resolve(event);
};

export const handle = sequence(supabase, guarda);
