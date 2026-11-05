// Gera static/fonts/letras-shinobi-{400,700}.woff2: C, Ç, G e c da Pixelify Sans com a abertura de verdade.
//
// No peso 700 a abertura do C da Pixelify tem 34 unidades de altura, meio pixel em 14 px, e ele fecha: CRIAR vira ORIAR,
// REGRAS vira REBRAS e PC vira PO. Aqui só os pontos da abertura mudam; o resto do contorno é o original da fonte, que entra
// no site por cima da Pixelify pelo unicode-range, como os dígitos (Digitos Shinobi).
//
// Não é dependência do site. Para gerar de novo, numa pasta à parte:
//   npm i fontkit opentype.js wawoff2
//   node letras-shinobi.mjs <pixelify-sans-latin-normal-400.woff2> <pasta de saída>
//
// A Pixelify Sans é OFL 1.1, sem nome reservado; a derivada segue a mesma licença.
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';

const require = createRequire(path.join(process.cwd(), 'x.js'));
const fontkit = require('fontkit');
const opentype = require('opentype.js');
const wawoff = require('wawoff2');

const [origem, saida] = process.argv.slice(2);
if (!origem || !saida) throw new Error('uso: node letras-shinobi.mjs <pixelify.woff2> <pasta de saída>');

const fonte = fontkit.create(Buffer.from(await wawoff.decompress(fs.readFileSync(origem))));

/** [y antigo, y novo] de cada aresta da abertura, por peso. */
const ABERTURAS = {
	400: {
		C: [[350, 420], [270, 200]],
		Ç: [[350, 420], [270, 200]],
		G: [[350, 440]],
		c: [[260, 300], [179, 140]]
	},
	700: {
		C: [[331, 425], [297, 205]],
		Ç: [[331, 425], [297, 205]],
		G: [[331, 430]],
		c: [[246, 295], [211, 165]]
	}
};
/** Só mexe nos pontos da ponta da letra, à direita: o miolo do G tem arestas na mesma altura. */
const X_MINIMO = { 400: 400, 700: 400 };

function glifo(variacao, peso, letra) {
	const g = variacao.glyphForCodePoint(letra.codePointAt(0));
	const p = new opentype.Path();
	const trocas = new Map(ABERTURAS[peso][letra]);
	const ajustar = (x, y) => [Math.round(x), Math.round(x >= X_MINIMO[peso] && trocas.has(Math.round(y)) ? trocas.get(Math.round(y)) : y)];
	for (const c of g.path.commands) {
		if (c.command === 'moveTo') p.moveTo(...ajustar(...c.args));
		else if (c.command === 'lineTo') p.lineTo(...ajustar(...c.args));
		else if (c.command === 'closePath') p.close();
		else throw new Error(`comando inesperado em ${letra}: ${c.command}`);
	}
	return new opentype.Glyph({ name: letra === 'Ç' ? 'Ccedilla' : letra, unicode: letra.codePointAt(0), advanceWidth: Math.round(g.advanceWidth), path: p });
}

for (const peso of [400, 700]) {
	const variacao = fonte.getVariation({ wght: peso });
	const vazio = new opentype.Glyph({ name: '.notdef', unicode: 0, advanceWidth: 600, path: new opentype.Path() });
	const nova = new opentype.Font({
		familyName: 'Letras Shinobi',
		styleName: peso === 700 ? 'Bold' : 'Regular',
		unitsPerEm: 1000,
		ascender: fonte.ascent,
		descender: fonte.descent,
		copyright: 'Copyright 2021 The Pixelify Sans Project Authors (https://github.com/eifetx/Pixelify-Sans)',
		license: 'SIL Open Font License 1.1',
		licenseURL: 'https://scripts.sil.org/OFL',
		glyphs: [vazio, ...['C', 'G', 'c', 'Ç'].map((l) => glifo(variacao, peso, l))]
	});
	const otf = new Uint8Array(nova.toArrayBuffer());
	const woff2 = Buffer.from(await wawoff.compress(otf));
	const destino = path.join(saida, `letras-shinobi-${peso}.woff2`);
	fs.writeFileSync(destino, woff2);
	console.log(destino, woff2.length, 'bytes');
}
