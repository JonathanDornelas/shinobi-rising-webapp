// Cliente Supabase do navegador (sessão nos cookies, compartilhada com o servidor).
import { createBrowserClient } from '@supabase/ssr';
import type { SupabaseClient } from '@supabase/supabase-js';
import { PUBLIC_SUPABASE_PUBLISHABLE_KEY, PUBLIC_SUPABASE_URL } from '$app/env/public';
import type { Database } from './banco.ts';

let cliente: SupabaseClient<Database> | null = null;

export function supabase(): SupabaseClient<Database> {
	cliente ??= createBrowserClient<Database>(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_PUBLISHABLE_KEY);
	return cliente;
}

/** Mensagens do Supabase Auth em português, no tom do app (erros literais). */
export function mensagemAuth(erro: { message?: string; code?: string; status?: number } | null): string {
	if (!erro) return '';
	const c = erro.code ?? '';
	const m = (erro.message ?? '').toLowerCase();
	if (c === 'invalid_credentials' || m.includes('invalid login')) return 'E-mail ou senha incorretos.';
	if (c === 'email_not_confirmed' || m.includes('not confirmed')) return 'Confirme seu e-mail para entrar.';
	if (c === 'user_already_exists' || m.includes('already registered')) return 'Este e-mail já tem conta.';
	if (c === 'weak_password' || m.includes('password should')) return 'Senha fraca. Use 8 caracteres ou mais, misturando letras e números.';
	if (c === 'over_request_rate_limit' || c === 'over_email_send_rate_limit' || erro.status === 429)
		return 'Muitas tentativas seguidas. Aguarde alguns minutos antes de tentar de novo.';
	if (c === 'same_password') return 'A nova senha precisa ser diferente da atual.';
	if (m.includes('fetch') || m.includes('network')) return 'Sem conexão com o servidor. Tente de novo.';
	return 'Algo deu errado. Tente de novo em instantes.';
}
