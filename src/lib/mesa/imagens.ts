// Imagens da Mesa: a da cena narrativa e o fundo do quadro. Ou uma arte do livro (capas das vilas e aberturas de
// capítulo, feitas no PixelLab), ou uma enviada pelo Mestre para o bucket público mesa/<campanha>/<nome>.webp.
import { PUBLIC_SUPABASE_URL } from '$app/env/public';
import { supabase } from '#lib/supabase/cliente.ts';

const VILAS = ['konoha', 'suna', 'kiri', 'kumo', 'iwa', 'ame', 'taki', 'oto', 'floresta'];
/** A galeria: capas das vilas e as 23 aberturas de capítulo. */
export const IMAGENS_DO_LIVRO: { caminho: string; nome: string }[] = [
	{ caminho: '/covers/capa-inicio.png', nome: 'Início' },
	...VILAS.map((v) => ({ caminho: `/covers/capa-${v}-256.png`, nome: v[0].toUpperCase() + v.slice(1) })),
	...Array.from({ length: 23 }, (_, i) => ({ caminho: `/capitulos/cap-${String(i + 1).padStart(2, '0')}.png`, nome: `Cap. ${i + 1}` }))
];

/** URL de uma imagem da cena (null sem imagem). */
export const urlImagemMesa = (caminho: string | null | undefined) =>
	!caminho ? null : caminho.startsWith('/') ? caminho : `${PUBLIC_SUPABASE_URL}/storage/v1/object/public/mesa/${caminho}`;

const LADO_MAX = 2048;

/** Lê o arquivo, reduz para no máximo 2048 px no lado maior e envia em webp; devolve o caminho no bucket. */
export async function enviarImagemMesa(campanha: string, arquivo: File, prefixo: 'fundo' | 'narrativa'): Promise<string> {
	const bitmap = await createImageBitmap(arquivo);
	const k = Math.min(1, LADO_MAX / Math.max(bitmap.width, bitmap.height));
	const tela = Object.assign(document.createElement('canvas'), { width: Math.round(bitmap.width * k), height: Math.round(bitmap.height * k) });
	tela.getContext('2d')!.drawImage(bitmap, 0, 0, tela.width, tela.height);
	bitmap.close();
	const blob = await new Promise<Blob | null>((ok) => tela.toBlob(ok, 'image/webp', 0.86));
	if (!blob) throw new Error('Não foi possível converter a imagem.');
	if (blob.size > 5 * 1024 * 1024) throw new Error('A imagem ficou grande demais (até 5 MB).');
	const caminho = `${campanha}/${prefixo}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}.webp`;
	const { error } = await supabase().storage.from('mesa').upload(caminho, blob, { contentType: 'image/webp', upsert: false });
	if (error) throw error;
	return caminho;
}

/** Apaga do bucket uma imagem enviada (as do livro ficam). */
export async function apagarImagemMesa(caminho: string | null | undefined) {
	if (caminho && !caminho.startsWith('/')) await supabase().storage.from('mesa').remove([caminho]);
}
