// Mapa do site para os buscadores: as páginas públicas, geradas junto com o livro.
import { bestiario, capitulos, clas, jutsus } from '#lib/livro/dados.server.ts';
import { SITE } from '#lib/site.ts';

export const prerender = true;

const FIXAS = ['/', '/regras', '/regras/jutsus', '/regras/clas', '/regras/bestiario', '/regras/bestiario/como-usar', '/regras/bestiario/por-ameaca', '/regras/glossario', '/regras/especializacoes', '/regras/equipamentos', '/regras/referencia-rapida', '/termos'];

export function GET() {
	const caminhos = [...FIXAS, ...capitulos.map((c) => c.href), ...jutsus.map((j) => `/regras/jutsus/${j.slug}`), ...clas.map((c) => `/regras/clas/${c.slug}`), ...bestiario.criaturas.map((c) => `/regras/bestiario/${c.slug}`)];
	const urls = [...new Set(caminhos)].map((c) => `<url><loc>${SITE}${c === '/' ? '' : c}</loc></url>`).join('');
	return new Response(`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}</urlset>`, { headers: { 'content-type': 'application/xml' } });
}
