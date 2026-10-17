import { describe, expect, it } from 'vitest';
import { kanji, normalizar, slug } from './texto';

describe('slug', () => {
	it('remove acentos, pontuação e macrons', () => {
		expect(slug('Clãs e Kekkei Genkai')).toBe('clas-e-kekkei-genkai');
		expect(slug('Dōjō / Patrimônio')).toBe('dojo-patrimonio');
		expect(slug('Armas — Catálogo Detalhado')).toBe('armas-catalogo-detalhado');
		expect(slug('“Lança de Gelo”')).toBe('lanca-de-gelo');
	});
});

describe('normalizar', () => {
	it('ignora caixa, acentos e espaços extras', () => {
		expect(normalizar('  Hyōton   no  JUTSU ')).toBe('hyoton no jutsu');
	});
});

describe('kanji', () => {
	it('converte números de capítulo', () => {
		expect(kanji(1)).toBe('一');
		expect(kanji(4)).toBe('四');
		expect(kanji(10)).toBe('十');
		expect(kanji(12)).toBe('十二');
		expect(kanji(20)).toBe('二十');
		expect(kanji(23)).toBe('二十三');
	});
});
