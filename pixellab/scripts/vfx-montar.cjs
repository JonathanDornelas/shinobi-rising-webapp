// Monta os efeitos de jutsu da Mesa a partir das exportações da vfx-lote: cada folha (quadros em grade) vira uma tira
// horizontal em static/mesa/fx/<estilo>.png, e o manifesto src/lib/mesa/fx-sprites.ts guarda o tamanho, os quadros, a
// duração e o ponto de apoio (pivot) de cada um.
//   node vfx-montar.cjs <lote> [<lote que substitui> ...]   (o último lote com o estilo vence)
//   node vfx-montar.cjs --clima <lote>   (o clima da cena: static/mesa/clima e src/lib/mesa/clima-sprites.ts)
const fs = require('fs');
const path = require('path');
const png = { exports: {} };
new Function('require', 'module', 'exports', fs.readFileSync(path.join(__dirname, 'pngtool.js'), 'utf8'))(require, png, png.exports);
const { decode, encode } = png.exports;

const RAIZ = path.join(__dirname, '..', '..');
const clima = process.argv[2] === '--clima';
const SAIDA = path.join(RAIZ, 'static', 'mesa', clima ? 'clima' : 'fx');
const MANIFESTO = path.join(RAIZ, 'src', 'lib', 'mesa', clima ? 'clima-sprites.ts' : 'fx-sprites.ts');
const lotes = process.argv.slice(clima ? 3 : 2);
const escolhidos = {};
for (const lote of lotes) for (const d of fs.readdirSync(lote)) if (fs.existsSync(path.join(lote, d, 'folha.json'))) escolhidos[d] = path.join(lote, d);

fs.mkdirSync(SAIDA, { recursive: true });
const manifesto = {};
for (const [estilo, dir] of Object.entries(escolhidos).sort()) {
	const j = JSON.parse(fs.readFileSync(path.join(dir, 'folha.json'), 'utf8'));
	const img = decode(fs.readFileSync(path.join(dir, 'folha.png')));
	const fr = j.frames.map((f) => f.frame);
	const w = fr[0].w;
	const h = fr[0].h;
	const out = Buffer.alloc(w * fr.length * h * 4);
	fr.forEach((f, i) => {
		for (let y = 0; y < h; y++) img.rgba.copy(out, (y * w * fr.length + i * w) * 4, ((f.y + y) * img.width + f.x) * 4, ((f.y + y) * img.width + f.x + w) * 4);
	});
	fs.writeFileSync(path.join(SAIDA, `${estilo}.png`), encode(w * fr.length, h, out));
	const dur = j.frames.reduce((t, f) => t + (f.duration ?? 100), 0);
	const pv = j.frames[0].pivot ?? { x: 0.5, y: 0.5 };
	// o quadro mais cheio (mais pixels visíveis): é o que fica na tela de quem pede menos movimento
	const cheio = fr.map((f) => {
		let n = 0;
		for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) if (img.rgba[((f.y + y) * img.width + f.x + x) * 4 + 3] > 40) n++;
		return n;
	});
	const pico = cheio.indexOf(Math.max(...cheio));
	manifesto[estilo] = { w, h, quadros: fr.length, ms: dur, px: +pv.x.toFixed(3), py: +pv.y.toFixed(3), pico };
	console.log(estilo, `${w}x${h}`, `${fr.length} quadros`, `${dur} ms`, `pico ${pico}`);
}

const linhas = Object.entries(manifesto).map(([k, v]) => `\t${k}: { w: ${v.w}, h: ${v.h}, quadros: ${v.quadros}, ms: ${v.ms}, px: ${v.px}, py: ${v.py}, pico: ${v.pico} }`);
if (clima) {
	fs.writeFileSync(
		MANIFESTO,
		`// Gerado por pixellab/scripts/vfx-montar.cjs --clima a partir da vfx_workbench do PixelLab (pixellab/vfx-clima.json).
// O clima da cena: cada um é uma tira horizontal em /mesa/clima/<clima>.png (\`quadros\` quadros de \`w\` × \`h\` px em
// \`ms\` milissegundos, em loop), repetida em ladrilhos sobre o mapa; \`pico\` fica parado para quem pede menos movimento.
import type { SpriteFx } from './fx-sprites.ts';

export const SPRITES_CLIMA: Record<string, SpriteFx> = {
${linhas.join(',\n')}
};
`
	);
	process.exit(0);
}
fs.writeFileSync(
	MANIFESTO,
	`// Gerado por pixellab/scripts/vfx-montar.cjs a partir dos efeitos da vfx_workbench do PixelLab (pixellab/vfx-jutsus.json).
// Cada estilo de efeito é uma tira horizontal em /mesa/fx/<estilo>.png: \`quadros\` quadros de \`w\` × \`h\` px que passam
// em \`ms\` milissegundos, em loop; (px, py) é o ponto de apoio do desenho (fração do quadro), que vai no meio do quadrado;
// \`pico\` é o quadro mais cheio, o que fica parado para quem pede menos movimento.

export interface SpriteFx {
	w: number;
	h: number;
	quadros: number;
	ms: number;
	px: number;
	py: number;
	pico: number;
}

export const SPRITES_FX: Record<string, SpriteFx> = {
${linhas.join(',\n')}
};
`
);
