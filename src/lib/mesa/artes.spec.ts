import { describe, expect, it } from 'vitest';
import { nomeDoArquivo, tamanhoLegivel } from './artes.ts';

describe('biblioteca de artes', () => {
	it('o nome vem do arquivo, sem extensão nem traços', () => {
		expect(nomeDoArquivo('mapa-da_vila-01.PNG')).toBe('mapa da vila 01');
		expect(nomeDoArquivo('.png')).toBe('Arte');
		expect(nomeDoArquivo('a'.repeat(100) + '.webp')).toHaveLength(60);
	});
	it('tamanho legível', () => {
		expect(tamanhoLegivel(340 * 1024)).toBe('340 KB');
		expect(tamanhoLegivel(1.25 * 1024 * 1024)).toBe('1,3 MB');
		expect(tamanhoLegivel(10)).toBe('1 KB');
	});
});
