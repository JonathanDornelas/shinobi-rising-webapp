// Monta as capas das vilas em static/covers a partir da seed "escolhida" de cada verbete de pixellab/vilas.json:
//   capa-<vila>-768.png  a arte inteira, em PNG indexado (metade do peso do PNG que o PixelLab entrega);
//   capa-<vila>-256.png  a miniatura: a média de cada bloco 3×3, de volta para a paleta da própria arte.
// As cenas salvas na Mesa guardam o caminho da -256, por isso o nome dela não muda.
//   node vilas-montar.cjs [capa-konoha ...]   (sem nomes, todas)
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');
const png = { exports: {} };
new Function('require', 'module', 'exports', fs.readFileSync(path.join(__dirname, 'pngtool.js'), 'utf8'))(require, png, png.exports);
const { decode } = png.exports;

const RAIZ = path.join(__dirname, '..', '..');
const LISTA = JSON.parse(fs.readFileSync(path.join(RAIZ, 'pixellab', 'vilas.json'), 'utf8'));
const GRANDE = [768, 288];
const REDUCAO = 3;

function bloco(tipo, dados) {
	const t = Buffer.concat([Buffer.from(tipo), dados]);
	const b = Buffer.alloc(8 + dados.length + 4);
	b.writeUInt32BE(dados.length, 0);
	t.copy(b, 4);
	b.writeUInt32BE(zlib.crc32(t), 8 + dados.length);
	return b;
}

/** PNG indexado e opaco, com a menor profundidade em que a paleta couber. */
function indexado(w, h, indices, paleta) {
	const bits = paleta.length <= 2 ? 1 : paleta.length <= 4 ? 2 : paleta.length <= 16 ? 4 : 8;
	const linha = Math.ceil((w * bits) / 8);
	const cru = Buffer.alloc((linha + 1) * h);
	for (let y = 0; y < h; y++) {
		const base = y * (linha + 1) + 1;
		for (let x = 0; x < w; x++) {
			const pos = x * bits;
			cru[base + (pos >> 3)] |= indices[y * w + x] << (8 - bits - (pos & 7));
		}
	}
	const ihdr = Buffer.alloc(13);
	ihdr.writeUInt32BE(w, 0);
	ihdr.writeUInt32BE(h, 4);
	ihdr[8] = bits;
	ihdr[9] = 3;
	const plte = Buffer.alloc(paleta.length * 3);
	paleta.forEach((c, i) => plte.writeUIntBE(c, i * 3, 3));
	return Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), bloco('IHDR', ihdr), bloco('PLTE', plte), bloco('IDAT', zlib.deflateSync(cru, { level: 9, memLevel: 9 })), bloco('IEND', Buffer.alloc(0))]);
}

function paraIndices(w, h, rgba) {
	const mapa = new Map();
	const paleta = [];
	const indices = new Uint16Array(w * h);
	for (let i = 0; i < w * h; i++) {
		const c = (rgba[i * 4] << 16) | (rgba[i * 4 + 1] << 8) | rgba[i * 4 + 2];
		if (!mapa.has(c)) {
			mapa.set(c, paleta.length);
			paleta.push(c);
		}
		indices[i] = mapa.get(c);
	}
	return { indices, paleta };
}

// a luminância pesa mais na comparação: é ela que mantém o desenho das linhas na miniatura
function maisProxima(r, g, b, paleta) {
	let melhor = 0;
	let menor = Infinity;
	paleta.forEach((c, i) => {
		const dr = (c >> 16) - r;
		const dg = ((c >> 8) & 255) - g;
		const db = (c & 255) - b;
		const d = 0.3 * dr * dr + 0.59 * dg * dg + 0.11 * db * db;
		if (d < menor) {
			menor = d;
			melhor = i;
		}
	});
	return melhor;
}

function miniatura(w, h, rgba, paleta) {
	const W = w / REDUCAO;
	const H = h / REDUCAO;
	const indices = new Uint16Array(W * H);
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
			indices[y * W + x] = maisProxima(r / n, g / n, b / n, paleta);
		}
	return indexado(W, H, indices, paleta);
}

const pedidas = process.argv.slice(2);
for (const v of LISTA.verbetes.filter((x) => !pedidas.length || pedidas.includes(x.slug))) {
	const { width: w, height: h, rgba } = decode(fs.readFileSync(path.join(RAIZ, 'pixellab', 'gerados', 'vilas', `${v.slug}-${v.escolhida}.png`)));
	if (w !== GRANDE[0] || h !== GRANDE[1]) throw new Error(`${v.slug}: esperava ${GRANDE.join('×')}, veio ${w}×${h}`);
	const { indices, paleta } = paraIndices(w, h, rgba);
	const grande = indexado(w, h, indices, paleta);
	const pequena = miniatura(w, h, rgba, paleta);
	fs.writeFileSync(path.join(RAIZ, 'static', 'covers', `${v.slug}-768.png`), grande);
	fs.writeFileSync(path.join(RAIZ, 'static', 'covers', `${v.slug}-256.png`), pequena);
	console.log(`${v.slug}: ${grande.length >> 10} KB e miniatura de ${pequena.length >> 10} KB, ${paleta.length} cores`);
}
