// Monta o corredor isométrico escuro (12 × 30 quadrados, losango 64 × 32) com as peças do PixelLab.
//   node compor-corredor.cjs <scratchpad> <saida.png> [prévia-com-grade.png]
// A imagem tem (L + A) × 32 de largura: com "fundo_escala = L + A" (42) o app a encaixa na grade isométrica.
// Nada alto passa do topo do losango (o app põe o canto de cima da imagem no canto de cima do mapa).
const fs = require('fs');
const path = require('path');
const { decode, encode } = require('./pngtool.cjs');
const [S, saida, previa] = process.argv.slice(2);
const L = 12, A = 30, TW = 64, TH = 32;
const ler = (n) => decode(fs.readFileSync(path.join(S, 'pecas', n + '.png')));
const geometria = (p) => {
	let minY = p.height, maxY = -1, minX = p.width, maxX = -1;
	for (let y = 0; y < p.height; y++) for (let x = 0; x < p.width; x++) if (p.rgba[(y * p.width + x) * 4 + 3] > 8) { minY = Math.min(minY, y); maxY = Math.max(maxY, y); minX = Math.min(minX, x); maxX = Math.max(maxX, x); }
	return { ...p, minY, maxY, minX, maxX };
};
// a cor das peças do chão: a luminância ganha um tom (a referência é cinza quente escuro, o PixelLab devolveu azulado)
const graduar = (p, [tr, tg, tb], escala, base) => {
	const out = new Uint8Array(p.rgba);
	for (let i = 0; i < out.length; i += 4) {
		const l = (0.3 * out[i] + 0.59 * out[i + 1] + 0.11 * out[i + 2]) / 255;
		out[i] = Math.min(255, (l * escala + base) * tr * 255);
		out[i + 1] = Math.min(255, (l * escala + base) * tg * 255);
		out[i + 2] = Math.min(255, (l * escala + base) * tb * 255);
	}
	return { ...p, rgba: out };
};
const pecas = {
	piso: graduar(geometria(ler('piso')), [1.0, 0.95, 0.88], 0.7, 0.04),
	rocha: graduar(geometria(ler('rocha')), [0.92, 0.92, 0.98], 0.55, 0.02),
	madeira: geometria(ler('madeira'))
};
const objetos = {};
for (const n of ['cerca', 'portao', 'poste']) objetos[n] = geometria(ler(n));
const esp = Math.max(...Object.values(pecas).map((p) => p.maxY - p.minY + 1)) - TH;
const W = (L + A) * (TW / 2);
const H = (L + A) * (TH / 2) + Math.max(esp, 0) + 2;
const img = new Uint8Array(W * H * 4);
const blit = (p, dx, dy, espelhar) => {
	for (let y = 0; y < p.height; y++)
		for (let x = 0; x < p.width; x++) {
			const sx = espelhar ? p.width - 1 - x : x;
			const i = (y * p.width + sx) * 4;
			const a = p.rgba[i + 3];
			if (a < 8) continue;
			const X = dx + x, Y = dy + y;
			if (X < 0 || Y < 0 || X >= W || Y >= H) continue;
			const o = (Y * W + X) * 4;
			const k = a / 255;
			img[o] = Math.round(p.rgba[i] * k + img[o] * (1 - k));
			img[o + 1] = Math.round(p.rgba[i + 1] * k + img[o + 1] * (1 - k));
			img[o + 2] = Math.round(p.rgba[i + 2] * k + img[o + 2] * (1 - k));
			img[o + 3] = Math.max(img[o + 3], a);
		}
};
const tipo = (gx, gy) => {
	if (gy <= 2) return 'rocha';
	if (gx === 0 || gx === L - 1) return 'madeira';
	return 'piso';
};
const semente = (gx, gy) => ((gx * 73856093) ^ (gy * 19349663)) >>> 0;
const ordem = [];
for (let gx = 0; gx < L; gx++) for (let gy = 0; gy < A; gy++) ordem.push([gx, gy]);
ordem.sort((a, b) => a[0] + a[1] - (b[0] + b[1]) || a[0] - b[0]);
for (const [gx, gy] of ordem) {
	const p = pecas[tipo(gx, gy)];
	const vx = (gx - gy) * (TW / 2) + A * (TW / 2);
	const vy = (gx + gy) * (TH / 2);
	blit(p, vx - Math.round((p.minX + p.maxX) / 2), vy - p.minY, semente(gx, gy) % 2 === 0);
}
// de pé: o centro da base do sprite no ponto (gx, gy) do chão
const projeta = (gx, gy) => [(gx - gy) * (TW / 2) + A * (TW / 2), (gx + gy) * (TH / 2)];
const pe = [{ o: 'portao', gx: 6, gy: 3.9, sobe: 6 }];
// as duas laterais: um trecho de cerca a cada 4 quadrados
for (let gy0 = 6; gy0 + 2.4 <= A; gy0 += 2.4) {
	pe.push({ o: "cerca", gx: 0.55, gy: gy0 + 1.2, sobe: 4 });
	pe.push({ o: "cerca", gx: L - 0.55, gy: gy0 + 1.2, sobe: 4 });
}
// os postes com estandarte e lanterna, em pares, de 8 em 8
for (let gy = 9; gy < A - 1; gy += 8) {
	pe.push({ o: 'poste', gx: 1.1, gy: gy + 0.5, sobe: 2 });
	pe.push({ o: 'poste', gx: L - 1.1, gy: gy + 0.5, sobe: 2 });
}
pe.sort((a, b) => a.gx + a.gy - (b.gx + b.gy));
for (const e of pe) {
	const o = objetos[e.o];
	const [px, py] = projeta(e.gx, e.gy); if (process.env.DEPURAR) console.log(e.o, px, py, o.minX, o.maxX, o.maxY);
	blit(o, Math.round(px - (o.minX + o.maxX) / 2), Math.round(py - o.maxY - 1 + e.sobe), false);
}
fs.writeFileSync(saida, encode(W, H, Buffer.from(img)));
console.log('corredor', W + 'x' + H, '→', saida, '· fundo_escala =', L + A, '· cena', L + ' × ' + A);
if (previa) {
	// prévia com a grade do app por cima (para conferir o encaixe)
	const copia = new Uint8Array(img);
	const linha = (x0, y0, x1, y1) => {
		const n = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0));
		for (let i = 0; i <= n; i++) {
			const x = Math.round(x0 + ((x1 - x0) * i) / n), y = Math.round(y0 + ((y1 - y0) * i) / n);
			if (x < 0 || y < 0 || x >= W || y >= H) continue;
			const o = (y * W + x) * 4;
			copia[o] = Math.round(copia[o] * 0.7 + 255 * 0.3); copia[o + 1] = Math.round(copia[o + 1] * 0.7 + 255 * 0.3); copia[o + 2] = Math.round(copia[o + 2] * 0.7 + 255 * 0.3);
		}
	};
	for (let gx = 0; gx <= L; gx++) { const [a, b] = projeta(gx, 0), [c, d] = projeta(gx, A); linha(a, b, c, d); }
	for (let gy = 0; gy <= A; gy++) { const [a, b] = projeta(0, gy), [c, d] = projeta(L, gy); linha(a, b, c, d); }
	fs.writeFileSync(previa, encode(W, H, Buffer.from(copia)));
}
