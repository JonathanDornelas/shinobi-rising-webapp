// Monta as capas das vilas em static/covers a partir da seed "escolhida" de cada verbete de pixellab/vilas.json:
//   capa-<vila>-768.png  a arte inteira;
//   capa-<vila>-256.png  a miniatura: a média de cada bloco 3×3, de volta para a paleta da própria arte.
// As cenas salvas na Mesa guardam o caminho da -256, por isso o nome dela não muda.
//   node vilas-montar.cjs [capa-konoha ...]   (sem nomes, todas)
//   npm run imagens:otimizar -- covers        (em seguida: o PNG indexado tem a metade do peso)
const fs = require('fs');
const path = require('path');
const png = { exports: {} };
new Function('require', 'module', 'exports', fs.readFileSync(path.join(__dirname, 'pngtool.js'), 'utf8'))(require, png, png.exports);
const { decode, encode } = png.exports;

const RAIZ = path.join(__dirname, '..', '..');
const LISTA = JSON.parse(fs.readFileSync(path.join(RAIZ, 'pixellab', 'vilas.json'), 'utf8'));
const GRANDE = [768, 288];
const REDUCAO = 3;

function coresDe(rgba) {
	const cores = new Set();
	for (let i = 0; i < rgba.length; i += 4) cores.add((rgba[i] << 16) | (rgba[i + 1] << 8) | rgba[i + 2]);
	return [...cores];
}

// a luminância pesa mais na comparação: é ela que mantém o desenho das linhas na miniatura
function maisProxima(r, g, b, paleta) {
	let melhor = 0;
	let menor = Infinity;
	for (const c of paleta) {
		const dr = (c >> 16) - r;
		const dg = ((c >> 8) & 255) - g;
		const db = (c & 255) - b;
		const d = 0.3 * dr * dr + 0.59 * dg * dg + 0.11 * db * db;
		if (d < menor) {
			menor = d;
			melhor = c;
		}
	}
	return melhor;
}

function miniatura(w, h, rgba) {
	const paleta = coresDe(rgba);
	const W = w / REDUCAO;
	const H = h / REDUCAO;
	const saida = Buffer.alloc(W * H * 4);
	for (let y = 0; y < H; y++)
		for (let x = 0; x < W; x++) {
			let r = 0;
			let g = 0;
			let b = 0;
			for (let dy = 0; dy < REDUCAO; dy++)
				for (let dx = 0; dx < REDUCAO; dx++) {
					const o = ((y * REDUCAO + dy) * w + x * REDUCAO + dx) * 4;
					r += rgba[o];
					g += rgba[o + 1];
					b += rgba[o + 2];
				}
			const n = REDUCAO * REDUCAO;
			const c = maisProxima(r / n, g / n, b / n, paleta);
			saida.set([c >> 16, (c >> 8) & 255, c & 255, 255], (y * W + x) * 4);
		}
	return encode(W, H, saida);
}

const pedidas = process.argv.slice(2);
for (const v of LISTA.verbetes.filter((x) => !pedidas.length || pedidas.includes(x.slug))) {
	const arte = fs.readFileSync(path.join(RAIZ, 'pixellab', 'gerados', 'vilas', `${v.slug}-${v.escolhida}.png`));
	const { width: w, height: h, rgba } = decode(arte);
	if (w !== GRANDE[0] || h !== GRANDE[1]) throw new Error(`${v.slug}: esperava ${GRANDE.join('×')}, veio ${w}×${h}`);
	fs.writeFileSync(path.join(RAIZ, 'static', 'covers', `${v.slug}-768.png`), arte);
	fs.writeFileSync(path.join(RAIZ, 'static', 'covers', `${v.slug}-256.png`), miniatura(w, h, rgba));
	console.log(v.slug);
}
