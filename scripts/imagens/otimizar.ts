// Regrava as imagens de pixel art do site (static/) como PNG indexado, com paleta: sem perda nenhuma, mas bem menores
// (a arte do PixelLab vem em RGBA, 4 bytes por pixel, para umas poucas dezenas de cores). Só substitui o arquivo se o
// resultado for menor e se, decodificado de volta, der exatamente os mesmos pixels.
// Uso: npm run imagens:otimizar            (todas as pastas de imagem)
//      npm run imagens:otimizar -- bestiario  (só uma pasta)
import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { crc32, deflateSync, inflateSync } from 'node:zlib';

const RAIZ = join(dirname(fileURLToPath(import.meta.url)), '..', '..', 'static');
const PASTAS = ['bestiario', 'capitulos', 'covers', 'dados', 'icons', 'illustrations', 'molduras'];

interface Imagem {
	largura: number;
	altura: number;
	rgba: Buffer;
}

/** Decodifica PNG de 8 bits por canal (cinza, RGB, paleta, cinza com alfa, RGBA). */
export function decodificar(buf: Buffer): Imagem {
	let pos = 8;
	let largura = 0;
	let altura = 0;
	let bits = 0;
	let tipo = 0;
	let paleta: Buffer | null = null;
	let trns: Buffer | null = null;
	const idat: Buffer[] = [];
	while (pos < buf.length) {
		const len = buf.readUInt32BE(pos);
		const nome = buf.toString('ascii', pos + 4, pos + 8);
		const dados = buf.subarray(pos + 8, pos + 8 + len);
		if (nome === 'IHDR') [largura, altura, bits, tipo] = [dados.readUInt32BE(0), dados.readUInt32BE(4), dados[8], dados[9]];
		else if (nome === 'PLTE') paleta = dados;
		else if (nome === 'tRNS') trns = dados;
		else if (nome === 'IDAT') idat.push(dados);
		pos += 12 + len;
	}
	if (bits !== 8) throw new Error(`só PNG de 8 bits por canal (este tem ${bits})`);
	const canais = ({ 0: 1, 2: 3, 3: 1, 4: 2, 6: 4 } as Record<number, number>)[tipo];
	const raw = inflateSync(Buffer.concat(idat));
	const passo = largura * canais;
	const out = Buffer.alloc(altura * passo);
	for (let y = 0; y < altura; y++) {
		const filtro = raw[y * (passo + 1)];
		for (let x = 0; x < passo; x++) {
			const v = raw[y * (passo + 1) + 1 + x];
			const a = x >= canais ? out[y * passo + x - canais] : 0;
			const b = y > 0 ? out[(y - 1) * passo + x] : 0;
			const c = x >= canais && y > 0 ? out[(y - 1) * passo + x - canais] : 0;
			let r: number;
			if (filtro === 0) r = v;
			else if (filtro === 1) r = v + a;
			else if (filtro === 2) r = v + b;
			else if (filtro === 3) r = v + ((a + b) >> 1);
			else {
				const p = a + b - c;
				const [pa, pb, pc] = [Math.abs(p - a), Math.abs(p - b), Math.abs(p - c)];
				r = v + (pa <= pb && pa <= pc ? a : pb <= pc ? b : c);
			}
			out[y * passo + x] = r & 0xff;
		}
	}
	const rgba = Buffer.alloc(largura * altura * 4);
	for (let i = 0; i < largura * altura; i++) {
		let [R, G, B, A] = [0, 0, 0, 255];
		if (tipo === 6) [R, G, B, A] = [out[i * 4], out[i * 4 + 1], out[i * 4 + 2], out[i * 4 + 3]];
		else if (tipo === 2) [R, G, B] = [out[i * 3], out[i * 3 + 1], out[i * 3 + 2]];
		else if (tipo === 3) {
			const k = out[i];
			[R, G, B] = [paleta![k * 3], paleta![k * 3 + 1], paleta![k * 3 + 2]];
			A = trns && k < trns.length ? trns[k] : 255;
		} else if (tipo === 0) R = G = B = out[i];
		else [R, G, B, A] = [out[i * 2], out[i * 2], out[i * 2], out[i * 2 + 1]];
		rgba.set([R, G, B, A], i * 4);
	}
	return { largura, altura, rgba };
}

/** PNG indexado de 8 bits (1 byte por pixel), ou null se a imagem tiver mais de 256 cores. */
export function indexar({ largura, altura, rgba }: Imagem): Buffer | null {
	const cores = new Map<number, number>();
	const idx = new Uint8Array(largura * altura);
	for (let p = 0; p < largura * altura; p++) {
		const [r, g, b, a] = rgba.subarray(p * 4, p * 4 + 4);
		// todo pixel transparente vira a mesma cor; sem sinal, para o branco opaco não colidir com o -1
		const k = a === 0 ? -1 : ((r << 24) | (g << 16) | (b << 8) | a) >>> 0;
		if (!cores.has(k)) {
			if (cores.size >= 256) return null;
			cores.set(k, cores.size);
		}
		idx[p] = cores.get(k)!;
	}
	const raw = Buffer.alloc((largura + 1) * altura);
	for (let y = 0; y < altura; y++) raw.set(idx.subarray(y * largura, (y + 1) * largura), y * (largura + 1) + 1);
	const lista = [...cores.keys()];
	const plte = Buffer.alloc(lista.length * 3);
	const trns = Buffer.alloc(lista.length);
	let temAlfa = false;
	lista.forEach((k, i) => {
		if (k === -1) return void (temAlfa = true);
		plte.set([(k >>> 24) & 255, (k >>> 16) & 255, (k >>> 8) & 255], i * 3);
		trns[i] = k & 255;
		if (trns[i] !== 255) temAlfa = true;
	});
	const bloco = (nome: string, dados: Buffer) => {
		const corpo = Buffer.concat([Buffer.from(nome), dados]);
		const b = Buffer.alloc(dados.length + 12);
		b.writeUInt32BE(dados.length, 0);
		corpo.copy(b, 4);
		b.writeUInt32BE(crc32(corpo), dados.length + 8);
		return b;
	};
	const ihdr = Buffer.alloc(13);
	ihdr.writeUInt32BE(largura, 0);
	ihdr.writeUInt32BE(altura, 4);
	ihdr[8] = 8;
	ihdr[9] = 3;
	return Buffer.concat([
		Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
		bloco('IHDR', ihdr),
		bloco('PLTE', plte),
		...(temAlfa ? [bloco('tRNS', trns)] : []),
		bloco('IDAT', deflateSync(raw, { level: 9, memLevel: 9 })),
		bloco('IEND', Buffer.alloc(0))
	]);
}

/** Mesmos pixels? (pixels transparentes contam como iguais, qualquer que seja a cor guardada neles) */
function iguais(a: Imagem, b: Imagem) {
	for (let p = 0; p < a.largura * a.altura; p++) {
		const [aa, ab] = [a.rgba[p * 4 + 3], b.rgba[p * 4 + 3]];
		if (aa !== ab || (aa && [0, 1, 2].some((k) => a.rgba[p * 4 + k] !== b.rgba[p * 4 + k]))) return false;
	}
	return a.largura === b.largura && a.altura === b.altura;
}

if (process.argv[1] && import.meta.url === new URL(`file:///${process.argv[1].replace(/\\/g, '/')}`).href) {
	const pastas = process.argv.slice(2).length ? process.argv.slice(2) : PASTAS;
	let [antes, depois, trocados] = [0, 0, 0];
	for (const pasta of pastas)
		for (const arq of readdirSync(join(RAIZ, pasta), { recursive: true }).map(String).filter((a) => a.endsWith('.png'))) {
			const caminho = join(RAIZ, pasta, arq);
			const orig = readFileSync(caminho);
			const im = decodificar(orig);
			const novo = indexar(im);
			antes += orig.length;
			if (novo && novo.length < orig.length && iguais(im, decodificar(novo))) {
				writeFileSync(caminho, novo);
				depois += novo.length;
				trocados++;
			} else depois += orig.length;
		}
	console.log(`${trocados} imagens regravadas: ${(antes / 1024).toFixed(0)} KB → ${(depois / 1024).toFixed(0)} KB (${Math.round((1 - depois / antes) * 100)}% menos), sem perda.`);
}
