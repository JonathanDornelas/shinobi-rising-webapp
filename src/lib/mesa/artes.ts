// Biblioteca de artes da campanha: o Mestre envia mapas e objetos (png, jpg, webp, gif e svg) e eles ficam no bucket
// público mesa/<campanha>/…, já em webp e minificados: o navegador reencoda (tira EXIF e GPS), reduz o lado maior e,
// se ainda passar do limite, abaixa a qualidade aos poucos. O SVG vira imagem na hora do envio (nenhum SVG fica no
// bucket, que é público: ele poderia carregar script). Cada arte ganha uma miniatura de 256 px para a galeria.
//
// Mapa grande (maior que 2048 px): além da prévia de 2048, o tamanho cheio (até 8192 px no lado maior) vai em ladrilhos
// de 1024 px, em mesa/<campanha>/arte-…-t/<coluna>-<linha>.webp; a Mesa mostra a prévia de longe e, de perto, só os
// ladrilhos que aparecem na tela.
import { codificarWebp } from '#lib/imagens/comprimir.ts';
import { supabase } from '#lib/supabase/cliente.ts';
import type { Ladrilhos, MesaArte } from '#lib/supabase/banco.ts';

/** Lado maior de cada tipo: mapas valem a pena grandes; objetos soltos pesam menos e ficam nítidos mesmo assim. */
export const LADO_MAXIMO = { mapa: 2048, objeto: 1024 } as const;
const LADO_MINIATURA = 256;
export const LIMITE_BYTES = 5 * 1024 * 1024;
/** O arquivo de entrada (antes de reduzir): maior que isso nem tenta ler (mapas grandes podem passar de 30 MB). */
export const LIMITE_ENTRADA = { mapa: 100 * 1024 * 1024, objeto: 30 * 1024 * 1024 } as const;
export const LADO_LADRILHO = 1024;
export const LADO_MAXIMO_LADRILHOS = 8192;
export const TIPOS_ACEITOS = 'image/png,image/jpeg,image/webp,image/gif,image/svg+xml';

/** O nome de exibição de um arquivo: sem a extensão e sem traços de caminho. */
export const nomeDoArquivo = (nome: string) => nome.replace(/\.[^.]+$/, '').replace(/[-_]+/g, ' ').trim().slice(0, 60) || 'Arte';

async function abrir(arquivo: File): Promise<{ origem: CanvasImageSource; w: number; h: number; fechar: () => void }> {
	if (arquivo.type === 'image/svg+xml' || /\.svg$/i.test(arquivo.name)) {
		const url = URL.createObjectURL(new Blob([await arquivo.text()], { type: 'image/svg+xml' }));
		const img = new Image();
		img.src = url;
		try {
			await img.decode();
		} catch {
			URL.revokeObjectURL(url);
			throw new Error('Não consegui abrir esse SVG.');
		}
		// SVG sem tamanho próprio: usa 1024 de largura mantendo a proporção do que o navegador achou
		const w = img.naturalWidth || 1024;
		const h = img.naturalHeight || 1024;
		return { origem: img, w, h, fechar: () => URL.revokeObjectURL(url) };
	}
	try {
		const b = await createImageBitmap(arquivo);
		return { origem: b, w: b.width, h: b.height, fechar: () => b.close() };
	} catch {
		throw new Error('Não consegui abrir essa imagem. Use PNG, JPG, WebP, GIF ou SVG.');
	}
}

function desenhar(origem: CanvasImageSource, w: number, h: number, lado: number) {
	const k = Math.min(lado / Math.max(w, h), 8);
	const tela = Object.assign(document.createElement('canvas'), { width: Math.max(1, Math.round(w * k)), height: Math.max(1, Math.round(h * k)) });
	const c = tela.getContext('2d')!;
	c.imageSmoothingQuality = 'high';
	c.drawImage(origem, 0, 0, tela.width, tela.height);
	return tela;
}

const webp = (tela: HTMLCanvasElement, qualidade: number) => new Promise<Blob | null>((ok) => tela.toBlob(ok, 'image/webp', qualidade));

/** Codifica até caber no limite: o melhor (sem perda ou 0,92); depois qualidade menor; por fim reduz o tamanho. */
async function caber(tela: HTMLCanvasElement, limite: number): Promise<{ blob: Blob; tela: HTMLCanvasElement }> {
	let atual = tela;
	let blob = await codificarWebp(atual);
	for (const q of [0.85, 0.75, 0.65]) {
		if (blob.size <= limite) break;
		blob = (await webp(atual, q)) ?? blob;
	}
	while (blob.size > limite && atual.width > 512) {
		const menor = Object.assign(document.createElement('canvas'), { width: Math.round(atual.width * 0.8), height: Math.round(atual.height * 0.8) });
		menor.getContext('2d')!.drawImage(atual, 0, 0, menor.width, menor.height);
		atual = menor;
		blob = (await webp(atual, 0.75)) ?? blob;
	}
	if (blob.size > limite) throw new Error('A imagem ficou grande demais (até 5 MB).');
	return { blob, tela: atual };
}

export interface ArtePreparada {
	grande: Blob;
	miniatura: Blob;
	largura: number;
	altura: number;
}

/** Lê a imagem já aberta e devolve o webp reduzido, a miniatura e o tamanho final. */
async function preparar(o: { origem: CanvasImageSource; w: number; h: number }, tipo: MesaArte['tipo']): Promise<ArtePreparada> {
	const { blob, tela } = await caber(desenhar(o.origem, o.w, o.h, LADO_MAXIMO[tipo]), LIMITE_BYTES);
	const pequena = desenhar(tela, tela.width, tela.height, LADO_MINIATURA);
	const miniatura = (await webp(pequena, 0.8)) ?? (await codificarWebp(pequena));
	return { grande: blob, miniatura, largura: tela.width, altura: tela.height };
}

/** Lê o arquivo e devolve o webp reduzido, a miniatura e o tamanho final. */
export async function prepararArte(arquivo: File, tipo: MesaArte['tipo']): Promise<ArtePreparada> {
	if (arquivo.size > LIMITE_ENTRADA[tipo]) throw new Error(`O arquivo é grande demais (até ${LIMITE_ENTRADA[tipo] / 1024 / 1024} MB).`);
	const o = await abrir(arquivo);
	try {
		return await preparar(o, tipo);
	} finally {
		o.fechar();
	}
}

/** A grade de ladrilhos de uma imagem w × h (reduzida a 8192 px no lado maior, se passar). */
export function gradeDeLadrilhos(w: number, h: number) {
	const k = Math.min(1, LADO_MAXIMO_LADRILHOS / Math.max(w, h));
	const W = Math.round(w * k);
	const H = Math.round(h * k);
	return { k, w: W, h: H, colunas: Math.ceil(W / LADO_LADRILHO), linhas: Math.ceil(H / LADO_LADRILHO) };
}

/** Os caminhos dos ladrilhos no bucket. */
export const caminhosDosLadrilhos = (l: Ladrilhos) => Array.from({ length: l.colunas * l.linhas }, (_, i) => `${l.pasta}/${i % l.colunas}-${Math.floor(i / l.colunas)}.webp`);

/** Corta a imagem em ladrilhos de 1024 px e envia (quatro de cada vez), avisando o andamento. */
async function enviarLadrilhos(origem: CanvasImageSource, w: number, h: number, pasta: string, aoAndar?: (feitos: number, total: number) => void): Promise<Ladrilhos> {
	const g = gradeDeLadrilhos(w, h);
	const total = g.colunas * g.linhas;
	const l: Ladrilhos = { pasta, w: g.w, h: g.h, lado: LADO_LADRILHO, colunas: g.colunas, linhas: g.linhas };
	const fila = caminhosDosLadrilhos(l).map((caminho, i) => ({ caminho, c: i % g.colunas, r: Math.floor(i / g.colunas) }));
	let feitos = 0;
	const sb = supabase();
	const trabalhar = async () => {
		for (let item = fila.shift(); item; item = fila.shift()) {
			const tw = Math.min(LADO_LADRILHO, g.w - item.c * LADO_LADRILHO);
			const th = Math.min(LADO_LADRILHO, g.h - item.r * LADO_LADRILHO);
			const tela = Object.assign(document.createElement('canvas'), { width: tw, height: th });
			const c = tela.getContext('2d')!;
			c.imageSmoothingQuality = 'high';
			c.drawImage(origem, (item.c * LADO_LADRILHO) / g.k, (item.r * LADO_LADRILHO) / g.k, tw / g.k, th / g.k, 0, 0, tw, th);
			const blob = (await webp(tela, 0.9)) ?? (await codificarWebp(tela));
			const { error } = await sb.storage.from('mesa').upload(item.caminho, blob, { contentType: 'image/webp', upsert: false });
			if (error) throw error;
			aoAndar?.(++feitos, total);
		}
	};
	await Promise.all([trabalhar(), trabalhar(), trabalhar(), trabalhar()]);
	return l;
}

const sufixo = () => `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

/**
 * Envia uma arte (e a miniatura) para o bucket e registra na biblioteca. O mapa maior que 2048 px também vai em ladrilhos;
 * `aoAndar` conta os ladrilhos enviados.
 */
export async function enviarArte(campanha: string, arquivo: File, tipo: MesaArte['tipo'], nome = nomeDoArquivo(arquivo.name), aoAndar?: (feitos: number, total: number) => void): Promise<MesaArte> {
	if (arquivo.size > LIMITE_ENTRADA[tipo]) throw new Error(`O arquivo é grande demais (até ${LIMITE_ENTRADA[tipo] / 1024 / 1024} MB).`);
	const o = await abrir(arquivo);
	const base = `${campanha}/arte-${sufixo()}`;
	const sb = supabase();
	let ladrilhos: Ladrilhos | null = null;
	const tirar = (extra: string[] = []) => sb.storage.from('mesa').remove([`${base}.webp`, `${base}-m.webp`, ...extra, ...(ladrilhos ? caminhosDosLadrilhos(ladrilhos) : [])]);
	try {
		const p = await preparar(o, tipo);
		const grande = tipo === 'mapa' && Math.max(o.w, o.h) > LADO_MAXIMO.mapa * 1.1;
		const [a, b] = await Promise.all([
			sb.storage.from('mesa').upload(`${base}.webp`, p.grande, { contentType: 'image/webp', upsert: false }),
			sb.storage.from('mesa').upload(`${base}-m.webp`, p.miniatura, { contentType: 'image/webp', upsert: false })
		]);
		if (a.error || b.error) throw a.error ?? b.error;
		if (grande) ladrilhos = await enviarLadrilhos(o.origem, o.w, o.h, `${base}-t`, aoAndar);
		const { data, error } = await sb
			.from('mesa_artes')
			.insert({ campanha_id: campanha, nome, tipo, caminho: `${base}.webp`, miniatura: `${base}-m.webp`, largura: p.largura, altura: p.altura, bytes: p.grande.size, ...(ladrilhos ? { ladrilhos } : {}) })
			.select('*')
			.single();
		if (error || !data) throw new Error(/300 artes/.test(error?.message ?? '') ? error!.message : 'Não foi possível guardar a arte.');
		return data as MesaArte;
	} catch (e) {
		await tirar();
		throw e;
	} finally {
		o.fechar();
	}
}

/** Apaga a arte da biblioteca (o banco tira ela de onde estava em uso) e os arquivos do bucket, com os ladrilhos. */
export async function apagarArte(arte: Pick<MesaArte, 'id' | 'caminho' | 'miniatura' | 'ladrilhos'>): Promise<boolean> {
	const sb = supabase();
	const { error } = await sb.from('mesa_artes').delete().eq('id', arte.id);
	if (error) return false;
	await sb.storage.from('mesa').remove([arte.caminho, ...(arte.miniatura ? [arte.miniatura] : []), ...(arte.ladrilhos ? caminhosDosLadrilhos(arte.ladrilhos) : [])]);
	return true;
}

/** "1,2 MB" / "340 KB". */
export const tamanhoLegivel = (bytes: number) => (bytes >= 1024 * 1024 ? `${(bytes / 1024 / 1024).toFixed(1).replace('.', ',')} MB` : `${Math.max(1, Math.round(bytes / 1024))} KB`);
