// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
declare global {
	namespace App {
		// interface Error {}
		// interface Locals {}
		interface PageData {
			/** Título da aba do navegador (sem o sufixo do site). */
			titulo?: string;
			descricao?: string;
			/** Título curto na navbar do mobile. */
			navTitulo?: string;
		}
		interface PageState {
			/** Jutsu aberto em modal sobre o catálogo (D5 com URL própria). */
			jutsu?: string;
		}
		// interface Platform {}
	}
}

export {};
