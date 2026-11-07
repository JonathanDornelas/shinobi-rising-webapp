import { defineConfig } from 'vitest/config';
import tailwindcss from '@tailwindcss/vite';
import adapter from '@sveltejs/adapter-vercel';
import { sveltekit } from '@sveltejs/kit/vite';
import { hashIcones } from './scripts/hash-icones.js';

export default defineConfig({
	// a URL dos ícones muda quando algum ícone muda (scripts/hash-icones.js)
	define: { __ICONES_V__: JSON.stringify(hashIcones()) },
	plugins: [
		tailwindcss(),
		sveltekit({
			compilerOptions: {
				// Force runes mode for the project, except for libraries. Can be removed in svelte 6.
				runes: ({ filename }) =>
					filename.split(/[/\\]/).includes('node_modules') ? undefined : true
			},
			// A documentação continua pré-renderizada; contas e campanhas rodam no servidor (Vercel Functions), em
			// São Paulo (gru1), ao lado do banco do Supabase (sa-east-1): cada página faz várias consultas em sequência.
			adapter: adapter({ regions: ['gru1'] })
		})
	],
	test: {
		expect: { requireAssertions: true },
		projects: [
			{
				extends: './vite.config.ts',
				test: {
					name: 'server',
					environment: 'node',
					include: ['src/**/*.{test,spec}.{js,ts}', 'supabase/**/*.spec.ts', 'scripts/**/*.spec.ts'],
					exclude: ['src/**/*.svelte.{test,spec}.{js,ts}']
				}
			}
		]
	}
});
