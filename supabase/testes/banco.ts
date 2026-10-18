// Banco de testes: PGlite (Postgres em WebAssembly) com um esquema `auth` mínimo, no formato do Supabase,
// e todas as migrações aplicadas. `como(usuario)` executa SQL com o papel e o JWT daquele usuário.
import { PGlite } from '@electric-sql/pglite';
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const MIGRACOES = join(import.meta.dirname, '..', 'migrations');

const AUTH_FALSO = `
create role anon nologin;
create role authenticated nologin;
create schema auth;
grant usage on schema auth, public to anon, authenticated;
create table auth.users (
	id uuid primary key default gen_random_uuid(),
	email text unique,
	raw_user_meta_data jsonb not null default '{}'::jsonb
);
create function auth.uid() returns uuid language sql stable as $$
	select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid
$$;
create function auth.jwt() returns jsonb language sql stable as $$
	select coalesce(nullif(current_setting('request.jwt.claims', true), ''), '{}')::jsonb
$$;
grant execute on function auth.uid(), auth.jwt() to anon, authenticated;
`;

export interface Usuario {
	id: string;
	email: string;
}

export async function criarBanco() {
	const db = new PGlite();
	await db.exec(AUTH_FALSO);
	for (const arquivo of readdirSync(MIGRACOES).filter((f) => f.endsWith('.sql')).sort()) {
		await db.exec(readFileSync(join(MIGRACOES, arquivo), 'utf8'));
	}

	async function criarUsuario(email: string, nome: string): Promise<Usuario> {
		const r = await db.query<{ id: string }>(`insert into auth.users (email, raw_user_meta_data) values ($1, $2) returning id`, [
			email,
			JSON.stringify({ nome })
		]);
		return { id: r.rows[0].id, email };
	}

	/** Executa `sql` como o usuário (ou como visitante, se null), numa transação com RLS ativo. */
	async function como<T = Record<string, unknown>>(usuario: Usuario | null, sql: string, params: unknown[] = []) {
		return db.transaction(async (tx) => {
			await tx.exec(`set local role ${usuario ? 'authenticated' : 'anon'}`);
			await tx.query(`select set_config('request.jwt.claim.sub', $1, true), set_config('request.jwt.claims', $2, true)`, [
				usuario?.id ?? '',
				usuario ? JSON.stringify({ sub: usuario.id, email: usuario.email, role: 'authenticated' }) : ''
			]);
			return (await tx.query<T>(sql, params)).rows;
		});
	}

	return { db, criarUsuario, como };
}
