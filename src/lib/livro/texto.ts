// Utilitários de texto compartilhados entre o conversor do livro (Node) e a aplicação.

/** Remove acentos e diacríticos ("Dōjutsu" → "Dojutsu", "Clã" → "Cla"). */
export function semAcentos(texto: string): string {
	return texto.normalize('NFD').replace(/[̀-ͯ]/g, '');
}

/** Gera um identificador de URL: minúsculas, sem acentos, palavras separadas por hífen. */
export function slug(texto: string): string {
	return semAcentos(texto)
		.toLowerCase()
		.replace(/['’"“”]/g, '')
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-+|-+$/g, '');
}

/** Normaliza para comparação e busca: minúsculas, sem acentos, espaços simples. */
export function normalizar(texto: string): string {
	return semAcentos(texto).toLowerCase().replace(/\s+/g, ' ').trim();
}

const KANJI_DIGITOS = ['', '一', '二', '三', '四', '五', '六', '七', '八', '九'];

/** Numeral em kanji para os números de capítulo (1–99): 4 → 四, 12 → 十二, 23 → 二十三. */
export function kanji(n: number): string {
	if (n < 1 || n > 99) return String(n);
	const dezena = Math.floor(n / 10);
	const unidade = n % 10;
	const prefixo = dezena === 0 ? '' : dezena === 1 ? '十' : KANJI_DIGITOS[dezena] + '十';
	return prefixo + KANJI_DIGITOS[unidade];
}
