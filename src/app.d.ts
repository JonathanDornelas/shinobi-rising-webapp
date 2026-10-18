// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '#lib/supabase/banco.ts';

declare global {
	namespace App {
		// interface Error {}
		interface Locals {
			supabase: SupabaseClient<Database>;
			/** Usuário validado pelo JWT (getClaims), ou null. Memorizado por requisição. */
			usuarioAtual: () => Promise<App.Locals['usuario']>;
			usuario: { id: string; email: string; nome: string } | null;
		}
		interface PageData {
			/** Título da aba do navegador (sem o sufixo do site). */
			titulo?: string;
			descricao?: string;
			/** Título curto na navbar do mobile. */
			navTitulo?: string;
			/** Usuário da sessão nas páginas renderizadas no servidor (null nas pré-renderizadas). */
			usuario?: App.Locals['usuario'];
		}
		interface PageState {
			/** Jutsu aberto em modal sobre o catálogo (D5 com URL própria). */
			jutsu?: string;
		}
		// interface Platform {}
	}
}

export {};
