import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { IMAGENS_DO_LIVRO } from '#lib/mesa/imagens.ts';
import { CAPAS, capaDaVila, focoCapa, urlCapa, urlCapaMini } from '#lib/campanhas/dominio.ts';

const tamanhoDoPng = (url: string) => {
	const png = readFileSync(`static${url.split('?')[0]}`);
	return [png.readUInt32BE(16), png.readUInt32BE(20)];
};

describe('paisagens das vilas', () => {
	it.each(CAPAS.map((c) => c.id))('%s tem a arte inteira e a miniatura', (id) => {
		expect(tamanhoDoPng(urlCapa(id))).toEqual([768, 288]);
		expect(tamanhoDoPng(urlCapaMini(id))).toEqual([256, 96]);
	});

	it('a miniatura guarda o caminho antigo, que as cenas salvas na Mesa usam', () => {
		expect(urlCapaMini('capa-kumo').split('?')[0]).toBe('/covers/capa-kumo-256.png');
	});

	it('quem não tem vila fica com o Vale do Fim', () => {
		for (const vila of ['sem', 'renegado', null, undefined]) expect(capaDaVila(vila)).toBe('capa-floresta');
		expect(capaDaVila('konoha')).toBe('capa-konoha');
	});

	it('capa antiga e campanha sem capa caem numa paisagem que existe', () => {
		expect(urlCapa('capa-nevoa')).toBe('/covers/capa-kiri-768.png');
		expect(urlCapa(null)).toBe('/covers/capa-konoha-768.png');
	});

	it('toda paisagem diz onde está o marco da vila', () => {
		for (const { id } of CAPAS) expect(focoCapa(id), id).not.toBe('50% 50%');
		expect(focoCapa('capa-nevoa')).toBe(focoCapa('capa-kiri'));
	});

	it('a galeria da Mesa usa caminhos aceitos pelo banco', () => {
		const vilas = IMAGENS_DO_LIVRO.filter((i) => i.caminho.startsWith('/covers/capa-') && i.caminho !== '/covers/capa-inicio.png');
		expect(vilas).toHaveLength(CAPAS.length);
		for (const i of vilas) {
			expect(i.caminho).toMatch(/^\/(covers|capitulos)\/[a-z0-9-]+\.png$/);
			expect(tamanhoDoPng(i.caminho)).toEqual([768, 288]);
		}
	});
});
