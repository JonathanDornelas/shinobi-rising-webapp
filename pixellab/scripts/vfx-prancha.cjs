// Prancha de conferência dos efeitos da vfx-lote: uma linha por estilo com até 8 quadros, ampliados, num fundo escuro
// parecido com o do quadro da Mesa.
//   node vfx-prancha.cjs <dir-do-lote> <saida.png> [escala]
const fs = require('fs');
const path = require('path');
// o pngtool.js é CommonJS, mas o package.json marca .js como módulo ES: roda o código dele como CommonJS
const png = { exports: {} };
new Function('require', 'module', 'exports', fs.readFileSync(path.join(__dirname, 'pngtool.js'), 'utf8'))(require, png, png.exports);
const { decode, encode } = png.exports;
const [dir, saida, esc = '3'] = process.argv.slice(2);
const E = +esc;
const linhas = fs
	.readdirSync(dir)
	.filter((d) => fs.existsSync(path.join(dir, d, 'folha.json')))
	.map((d) => {
		const j = JSON.parse(fs.readFileSync(path.join(dir, d, 'folha.json'), 'utf8'));
		const img = decode(fs.readFileSync(path.join(dir, d, 'folha.png')));
		const frames = j.frames.map((f) => f.frame);
		const passo = Math.max(1, Math.floor(frames.length / 8));
		return { nome: d, img, frames: frames.filter((_, i) => i % passo === 0).slice(0, 8) };
	});
const cw = Math.max(...linhas.flatMap((l) => l.frames.map((f) => f.w))) * E + 6;
const ch = Math.max(...linhas.flatMap((l) => l.frames.map((f) => f.h))) * E + 6;
const W = cw * 8;
const H = ch * linhas.length;
const out = Buffer.alloc(W * H * 4);
for (let i = 0; i < W * H; i++) out.set([28, 22, 20, 255], i * 4);
linhas.forEach((l, li) =>
	l.frames.forEach((f, fi) => {
		// faixa mais clara atrás de cada quadro, para enxergar o tamanho do quadro
		for (let y = 0; y < f.h * E; y++)
			for (let x = 0; x < f.w * E; x++) {
				const dx = fi * cw + 3 + x;
				const dy = li * ch + 3 + y;
				const sx = f.x + Math.floor(x / E);
				const sy = f.y + Math.floor(y / E);
				const s = (sy * l.img.width + sx) * 4;
				const a = l.img.rgba[s + 3] / 255;
				const o = (dy * W + dx) * 4;
				const bg = [44, 36, 32];
				for (let k = 0; k < 3; k++) out[o + k] = Math.round(l.img.rgba[s + k] * a + bg[k] * (1 - a));
			}
	})
);
fs.writeFileSync(saida, encode(W, H, out));
console.log(linhas.map((l) => l.nome).join(', '), `→ ${W}x${H}`);
