// Biblioteca de artes da campanha: o Mestre envia mapas e objetos (png, jpg, webp, gif e svg) e eles ficam no bucket
// público mesa/<campanha>/…, já em webp e minificados: o navegador reencoda (tira EXIF e GPS), reduz o lado maior e,
// se ainda passar do limite, abaixa a qualidade aos poucos. O SVG vira imagem na hora do envio (nenhum SVG fica no
// bucket, que é público: ele poderia carregar script). Cada arte ganha uma miniatura de 256 px para a galeria.
import { codificarWebp } from '#lib/imagens/comprimir.ts';
import { supabase } from '#lib/supabase/cliente.ts';
import type { MesaArte } from '#lib/supabase/banco.ts';

/** Lado maior de cada tipo: mapas valem a pena grandes; objetos soltos pesam menos e ficam nítidos mesmo assim. */
export const LADO_MAXIMO = { mapa: 2048, objeto: 1024 } as const;
const LADO_MINIATURA = 256;
export const LIMITE_BYTES = 5 * 1024 * 1024;
/** O arquivo de entrada (antes de reduzir): maior que isso nem tenta ler. */
export const LIMITE_ENTRADA = 30 * 1024 * 1024;
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

/** Lê o arquivo e devolve o webp reduzido, a miniatura e o tamanho final. */
export async function prepararArte(arquivo: File, tipo: MesaArte['tipo']): Promise<ArtePreparada> {
	if (arquivo.size > LIMITE_ENTRADA) throw new Error('O arquivo é grande demais (até 30 MB).');
	const o = await abrir(arquivo);
	try {
		const { blob, tela } = await caber(desenhar(o.origem, o.w, o.h, LADO_MAXIMO[tipo]), LIMITE_BYTES);
		const pequena = desenhar(tela, tela.width, tela.height, LADO_MINIATURA);
		const miniatura = (await webp(pequena, 0.8)) ?? (await codificarWebp(pequena));
		return { grande: blob, miniatura, largura: tela.width, altura: tela.height };
	} finally {
		o.fechar();
	}
}

const sufixo = () => `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

/** Envia uma arte (e a miniatura) para o bucket e registra na biblioteca. */
export async function enviarArte(campanha: string, arquivo: File, tipo: MesaArte['tipo'], nome = nomeDoArquivo(arquivo.name)): Promise<MesaArte> {
	const p = await prepararArte(arquivo, tipo);
	const base = `${campanha}/arte-${sufixo()}`;
	const sb = supabase();
	const [a, b] = await Promise.all([
		sb.storage.from('mesa').upload(`${base}.webp`, p.grande, { contentType: 'image/webp', upsert: false }),
		sb.storage.from('mesa').upload(`${base}-m.webp`, p.miniatura, { contentType: 'image/webp', upsert: false })
	]);
	if (a.error || b.error) {
		await sb.storage.from('mesa').remove([`${base}.webp`, `${base}-m.webp`]);
		throw a.error ?? b.error;
	}
	const { data, error } = await sb
		.from('mesa_artes')
		.insert({ campanha_id: campanha, nome, tipo, caminho: `${base}.webp`, miniatura: `${base}-m.webp`, largura: p.largura, altura: p.altura, bytes: p.grande.size })
		.select('*')
		.single();
	if (error || !data) {
		await sb.storage.from('mesa').remove([`${base}.webp`, `${base}-m.webp`]);
		throw new Error(/300 artes/.test(error?.message ?? '') ? error!.message : 'Não foi possível guardar a arte.');
	}
	return data as MesaArte;
}

/** Apaga a arte da biblioteca (o banco tira ela de onde estava em uso) e os arquivos do bucket. */
export async function apagarArte(arte: Pick<MesaArte, 'id' | 'caminho' | 'miniatura'>): Promise<boolean> {
	const sb = supabase();
	const { error } = await sb.from('mesa_artes').delete().eq('id', arte.id);
	if (error) return false;
	await sb.storage.from('mesa').remove([arte.caminho, ...(arte.miniatura ? [arte.miniatura] : [])]);
	return true;
}

/** "1,2 MB" / "340 KB". */
export const tamanhoLegivel = (bytes: number) => (bytes >= 1024 * 1024 ? `${(bytes / 1024 / 1024).toFixed(1).replace('.', ',')} MB` : `${Math.max(1, Math.round(bytes / 1024))} KB`);
