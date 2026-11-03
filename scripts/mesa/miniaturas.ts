// Miniaturas da Mesa: junta as 8 direções de cada miniatura do PixelLab (pixellab/miniaturas/<id>/<rumo>.png) numa tira
// só (static/mesa/miniaturas/<id>.png, na ordem sul, sudeste, leste, nordeste, norte, noroeste, oeste, sudoeste),
// recortada na caixa que cabe todas, e escreve o catálogo do app (src/lib/mesa/miniaturas.json) com o ponto dos pés e a
// altura da figura, medidos no quadro de frente (sul).
// Uso: npx tsx scripts/mesa/miniaturas.ts
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { crc32, deflateSync } from 'node:zlib';
import { decodificar, indexar } from '../imagens/otimizar.ts';

const RAIZ = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const RUMOS = ['south', 'south-east', 'east', 'north-east', 'north', 'north-west', 'west', 'south-west'];

interface Origem {
	id: string;
	/** o estágio do bestiário ("slug#estágio") que usa esta miniatura */
	verbete: string;
	nome: string;
	/** a direção de arte, como aparece para o Mestre */
	estilo: string;
	/** a miniatura já vem com a base esculpida (o quadro não desenha a dele) */
	base?: boolean;
}

function png(largura: number, altura: number, rgba: Buffer): Buffer {
	const bloco = (tipo: string, dados: Buffer) => {
		const b = Buffer.alloc(dados.length + 12);
		b.writeUInt32BE(dados.length, 0);
		b.write(tipo, 4, 'ascii');
		dados.copy(b, 8);
		b.writeUInt32BE(crc32(b.subarray(4, 8 + dados.length)), 8 + dados.length);
		return b;
	};
	const ihdr = Buffer.alloc(13);
	ihdr.writeUInt32BE(largura, 0);
	ihdr.writeUInt32BE(altura, 4);
	ihdr[8] = 8;
	ihdr[9] = 6;
	const cru = Buffer.alloc((largura * 4 + 1) * altura);
	for (let y = 0; y < altura; y++) rgba.copy(cru, y * (largura * 4 + 1) + 1, y * largura * 4, (y + 1) * largura * 4);
	return Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), bloco('IHDR', ihdr), bloco('IDAT', deflateSync(cru)), bloco('IEND', Buffer.alloc(0))]);
}

const catalogo: Origem[] = JSON.parse(readFileSync(join(RAIZ, 'pixellab', 'miniaturas', 'catalogo.json'), 'utf8'));
const saida = [];
mkdirSync(join(RAIZ, 'static', 'mesa', 'miniaturas'), { recursive: true });
for (const m of catalogo) {
	const quadros = RUMOS.map((r) => decodificar(readFileSync(join(RAIZ, 'pixellab', 'miniaturas', m.id, `${r}.png`))));
	const { largura: W, altura: H } = quadros[0];
	if (quadros.some((q) => q.largura !== W || q.altura !== H)) throw new Error(`${m.id}: as direções têm tamanhos diferentes`);
	// a caixa que cabe a figura em todas as direções (1 pixel de folga)
	let [x0, y0, x1, y1] = [W, H, -1, -1];
	for (const q of quadros)
		for (let y = 0; y < H; y++)
			for (let x = 0; x < W; x++)
				if (q.rgba[(y * W + x) * 4 + 3] > 0) [x0, y0, x1, y1] = [Math.min(x0, x), Math.min(y0, y), Math.max(x1, x), Math.max(y1, y)];
	[x0, y0, x1, y1] = [Math.max(0, x0 - 1), Math.max(0, y0 - 1), Math.min(W - 1, x1 + 1), Math.min(H - 1, y1 + 1)];
	const [w, h] = [x1 - x0 + 1, y1 - y0 + 1];
	const tira = Buffer.alloc(w * 8 * h * 4);
	quadros.forEach((q, k) => {
		for (let y = 0; y < h; y++) q.rgba.copy(tira, (y * w * 8 + k * w) * 4, ((y0 + y) * W + x0) * 4, ((y0 + y) * W + x1 + 1) * 4);
	});
	// os pés: a última linha da figura de frente, e o meio do que está nas 3 linhas de baixo
	const sul = quadros[0];
	const opaco = (x: number, y: number) => sul.rgba[((y0 + y) * W + x0 + x) * 4 + 3] > 0;
	let [topo, chao] = [h, -1];
	for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) if (opaco(x, y)) [topo, chao] = [Math.min(topo, y), Math.max(chao, y)];
	const xs: number[] = [];
	for (let y = Math.max(0, chao - 2); y <= chao; y++) for (let x = 0; x < w; x++) if (opaco(x, y)) xs.push(x);
	const pe = [Math.round(((Math.min(...xs) + Math.max(...xs) + 1) / 2) * 10) / 10, chao + 1];
	const arq = join(RAIZ, 'static', 'mesa', 'miniaturas', `${m.id}.png`);
	writeFileSync(arq, indexar({ largura: w * 8, altura: h, rgba: tira }) ?? png(w * 8, h, tira));
	saida.push({ id: m.id, verbete: m.verbete, nome: m.nome, estilo: m.estilo, ...(m.base ? { base: true } : {}), w, h, pe, altura: chao - topo + 1 });
	console.log(`${m.id}: ${w}×${h} por direção, pés em ${pe.join(', ')}, figura de ${chao - topo + 1} px`);
}
writeFileSync(join(RAIZ, 'src', 'lib', 'mesa', 'miniaturas.json'), JSON.stringify(saida, null, '\t') + '\n');
