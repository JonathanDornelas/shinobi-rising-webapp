import { describe, expect, it } from 'vitest';
import { desvioDoRelogio, lerLink, linkDe, posicaoAgora, limitarPosicao, precisaAcertar, vizinho, ehSpotify } from './musica.ts';

describe('jukebox: leitura do link', () => {
	it('YouTube: vídeo em todos os formatos de link', () => {
		const v = { fonte: 'youtube', ref: 'dQw4w9WgXcQ', lista: false, indice: 0 };
		for (const l of [
			'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
			'https://youtu.be/dQw4w9WgXcQ?si=abc',
			'https://m.youtube.com/watch?v=dQw4w9WgXcQ&t=30s',
			'https://music.youtube.com/watch?v=dQw4w9WgXcQ',
			'https://www.youtube.com/embed/dQw4w9WgXcQ',
			'https://www.youtube.com/shorts/dQw4w9WgXcQ',
			'youtube.com/watch?v=dQw4w9WgXcQ'
		])
			expect(lerLink(l), l).toEqual(v);
	});

	it('YouTube: lista, com o item e sem as listas automáticas', () => {
		expect(lerLink('https://www.youtube.com/playlist?list=PLFgquLnL59alCl_2TQvOiD5Vgm1hCaGSI')).toEqual({ fonte: 'youtube', ref: 'PLFgquLnL59alCl_2TQvOiD5Vgm1hCaGSI', lista: true, indice: 0 });
		expect(lerLink('https://www.youtube.com/watch?v=dQw4w9WgXcQ&list=PLFgquLnL59alCl_2TQvOiD5Vgm1hCaGSI&index=4')).toMatchObject({ lista: true, indice: 3 });
		// "mix" (RD…) depende do vídeo: toca só o vídeo
		expect(lerLink('https://www.youtube.com/watch?v=dQw4w9WgXcQ&list=RDdQw4w9WgXcQ')).toMatchObject({ lista: false, ref: 'dQw4w9WgXcQ' });
	});

	it('Spotify não toca mais: o link volta nulo e dá para explicar o porquê', () => {
		for (const l of ['https://open.spotify.com/track/4uLU6hMCjMI75M1A2tKUQC?si=x', 'https://open.spotify.com/intl-pt/playlist/37i9dQZF1DXcBWIGoYBM5M', 'spotify:album:1DFixLWuPkv3KT3TnV35m3']) {
			expect(lerLink(l), l).toBeNull();
			expect(ehSpotify(l), l).toBe(true);
		}
		expect(ehSpotify('https://www.youtube.com/watch?v=dQw4w9WgXcQ')).toBe(false);
	});

	it('o que não é música conhecida volta nulo', () => {
		for (const l of ['', 'oi', 'https://exemplo.com/watch?v=dQw4w9WgXcQ', 'https://www.youtube.com/watch?v=curto', 'https://open.spotify.com/user/abc', 'javascript:alert(1)', 'https://youtube.com.mal.com/watch?v=dQw4w9WgXcQ', 'a'.repeat(400)])
			expect(lerLink(l), l).toBeNull();
	});

	it('o link de volta abre a mesma música', () => {
		expect(linkDe({ ref: 'dQw4w9WgXcQ', lista: false })).toBe('https://www.youtube.com/watch?v=dQw4w9WgXcQ');
		expect(linkDe({ ref: 'PLFgquLnL59alCl_2TQvOiD5Vgm1hCaGSI', lista: true })).toBe('https://www.youtube.com/playlist?list=PLFgquLnL59alCl_2TQvOiD5Vgm1hCaGSI');
	});
});

describe('jukebox: posição', () => {
	const desde = '2026-11-06T20:00:00.000Z';
	const t0 = Date.parse(desde);

	it('parada guarda a posição; tocando soma o tempo corrido', () => {
		expect(posicaoAgora({ tocando: false, posicao: 40, desde }, t0 + 60_000)).toBe(40);
		expect(posicaoAgora({ tocando: true, posicao: 40, desde }, t0 + 12_500)).toBeCloseTo(52.5);
		expect(posicaoAgora({ tocando: true, posicao: 5, desde }, t0 - 2000)).toBe(3);
		expect(posicaoAgora({ tocando: true, posicao: 5, desde: 'lixo' }, t0)).toBe(5);
	});

	it('o desvio do relógio usa o meio da viagem e só corrige acima de 3 s', () => {
		expect(desvioDoRelogio('2026-11-06T20:00:10.000Z', t0 - 100, t0 + 100)).toBe(10_000);
		expect(precisaAcertar(10, 12)).toBe(false);
		expect(precisaAcertar(10, 14.5)).toBe(true);
		expect(precisaAcertar(20, 15)).toBe(true);
	});
});

describe('jukebox: navegação na lista', () => {
	it('próxima e anterior respeitam o começo e o fim', () => {
		expect(vizinho(2, 10, 1)).toBe(3);
		expect(vizinho(9, 10, 1)).toBeNull();
		expect(vizinho(0, 10, -1)).toBe(0);
		expect(vizinho(5, 10, -1)).toBe(4);
	});
	it('sem saber o total, só limita o começo e o teto do banco', () => {
		expect(vizinho(7, 0, 1)).toBe(8);
		expect(vizinho(999, 0, 1)).toBe(999);
		expect(vizinho(0, 0, -1)).toBe(0);
	});
});

describe('jukebox: posição que o banco aceita', () => {
	it('ao vivo vale 0 e o resto fica entre 0 e 86 399 s', () => {
		expect(limitarPosicao(19462930, true)).toBe(0);
		expect(limitarPosicao(19462930)).toBe(86399);
		expect(limitarPosicao(-5)).toBe(0);
		expect(limitarPosicao(125.4)).toBe(125.4);
		expect(limitarPosicao(Number.NaN)).toBe(0);
	});
});
