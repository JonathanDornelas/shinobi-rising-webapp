// Miniaturas da Mesa: junta as 8 direções de cada miniatura do PixelLab (pixellab/miniaturas/<id>/<rumo>.png) numa tira
// só (static/mesa/miniaturas/<id>.png, na ordem sul, sudeste, leste, nordeste, norte, noroeste, oeste, sudoeste),
// recortada na caixa que cabe todas, e escreve o catálogo do app (src/lib/mesa/miniaturas.json) com o ponto dos pés e a
// altura da figura, medidos no quadro de frente (sul). Numa criatura, a "altura" é a medida que cabe no quadrado: a maior
// entre a altura e a largura do bicho em todas as direções (deitado, comprido ou de asas abertas), e a Pequena fica menor.
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
	/** um bicho ou monstro (o corpo não é de gente): cabe no quadrado também na largura */
	criatura?: boolean;
}
/** O quanto uma criatura Pequena ocupa do quadrado, perto de uma Média (um filhote não fica do tamanho do adulto). */
const PEQUENA = 0.7;

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
// na ordem do bestiário (as prateleiras da caixa saem por criatura, e os estágios em ordem); variações do mesmo estágio
// ficam na ordem do catálogo
const criaturas: { slug: string; estagios: { slug: string; tamanho?: string }[] }[] = JSON.parse(readFileSync(join(RAIZ, 'src', 'lib', 'livro', 'gerado', 'bestiario.json'), 'utf8')).criaturas;
const posicao = new Map(criaturas.flatMap((c) => c.estagios.map((e) => `${c.slug}#${e.slug}`)).map((v, i) => [v, i]));
const porte = new Map(criaturas.flatMap((c) => c.estagios.map((e) => [`${c.slug}#${e.slug}`, e.tamanho])));
// os arquétipos para jogadores (sem verbete no bestiário) abrem a caixa, na ordem em que estão em poses.json
const poses: Record<string, unknown> = JSON.parse(readFileSync(join(RAIZ, 'pixellab', 'miniaturas', 'poses.json'), 'utf8'));
Object.keys(poses)
	.filter((id) => id.startsWith('arquetipos--'))
	.forEach((id, i) => posicao.set(`arquetipos#${id.slice('arquetipos--'.length)}`, i - 1e6));
catalogo.sort((a, b) => (posicao.get(a.verbete) ?? 1e9) - (posicao.get(b.verbete) ?? 1e9));
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
	// os pés: no meio do quadro do PixelLab (o eixo do corpo nas 8 direções; espada, cajado, areia ou água no chão não
	// puxam para o lado) e, na altura, o mais baixo da faixa do meio do corpo (a mediana das 8 direções)
	const meio = W / 2;
	const faixa = (q: (typeof quadros)[number], de: number) => {
		let [topo, chao] = [H, -1];
		for (let y = 0; y < H; y++)
			for (let x = Math.floor(meio - W * de); x < Math.ceil(meio + W * de); x++) if (q.rgba[(y * W + x) * 4 + 3] > 0) [topo, chao] = [Math.min(topo, y), Math.max(chao, y)];
		return { topo, chao };
	};
	// numa criatura, o mais baixo da figura inteira (patas e cauda ficam fora da faixa do meio)
	const chaos = quadros.map((q) => faixa(q, m.criatura ? 0.5 : 0.2).chao).sort((a, b) => a - b);
	const chao = chaos[Math.floor(chaos.length / 2)];
	// a altura: do chão ao alto da cabeça na faixa estreita do meio (um punho erguido de lado não encolhe a figura)
	const topo = faixa(quadros[0], 0.12).topo;
	let altura = chao - topo + 1;
	if (m.criatura) {
		// a criatura cabe no quadrado nas 8 direções: a maior altura, ou a maior largura a partir do eixo (0,95 do quadrado
		// de largo para 0,9 de alto)
		let [alto, meia] = [0, 0];
		for (const q of quadros) {
			let cima = H;
			for (let y = 0; y < H; y++)
				for (let x = 0; x < W; x++) if (q.rgba[(y * W + x) * 4 + 3] > 0) [cima, meia] = [Math.min(cima, y), Math.max(meia, Math.abs(x + 0.5 - meio))];
			alto = Math.max(alto, chao - cima + 1);
		}
		altura = Math.round((Math.max(alto, (2 * meia * 0.9) / 0.95) / (porte.get(m.verbete) === 'pequeno' ? PEQUENA : 1)) * 10) / 10;
	}
	const pe = [Math.round((meio - x0) * 10) / 10, chao + 1 - y0];
	const arq = join(RAIZ, 'static', 'mesa', 'miniaturas', `${m.id}.png`);
	writeFileSync(arq, indexar({ largura: w * 8, altura: h, rgba: tira }) ?? png(w * 8, h, tira));
	saida.push({ id: m.id, verbete: m.verbete, nome: m.nome, estilo: m.estilo, ...(m.base ? { base: true } : {}), ...(m.criatura ? { criatura: true } : {}), w, h, pe, altura });
	console.log(`${m.id}: ${w}×${h} por direção, pés em ${pe.join(', ')}, figura de ${altura} px`);
}
writeFileSync(join(RAIZ, 'src', 'lib', 'mesa', 'miniaturas.json'), JSON.stringify(saida, null, '\t') + '\n');
