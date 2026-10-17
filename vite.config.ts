/// <reference types="node" />
import { readFileSync, writeFileSync } from 'node:fs';
import { defineConfig } from 'vitest/config';
import tailwindcss from '@tailwindcss/vite';
import adapterStatic from '@sveltejs/adapter-static';
import type { Adapter } from '@sveltejs/kit';
import { sveltekit } from '@sveltejs/kit/vite';

/**
 * Site estático. No Vercel o adapter-static entra no modo automático (Build Output API),
 * que não gera página de erro: aqui geramos o 404.html (G4) e o registramos para rotas inexistentes.
 */
function adapter(): Adapter {
	if (!process.env.VERCEL) return adapterStatic({ fallback: '404.html' });
	const base = adapterStatic();
	return {
		...base,
		async adapt(builder) {
			await base.adapt(builder);
			await builder.generateFallback('.vercel/output/static/404.html');
			const arquivo = '.vercel/output/config.json';
			const config = JSON.parse(readFileSync(arquivo, 'utf8'));
			config.routes.push({ handle: 'error' }, { status: 404, src: '^/.*$', dest: '/404.html' });
			writeFileSync(arquivo, JSON.stringify(config, null, '  '));
		}
	};
}

export default defineConfig({
	plugins: [
		tailwindcss(),
		sveltekit({
			compilerOptions: {
				// Force runes mode for the project, except for libraries. Can be removed in svelte 6.
				runes: ({ filename }) =>
					filename.split(/[/\\]/).includes('node_modules') ? undefined : true
			},
			// A documentação é toda pré-renderizada; o 404.html cobre rotas desconhecidas.
			adapter: adapter()
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
					include: ['src/**/*.{test,spec}.{js,ts}'],
					exclude: ['src/**/*.svelte.{test,spec}.{js,ts}']
				}
			}
		]
	}
});
