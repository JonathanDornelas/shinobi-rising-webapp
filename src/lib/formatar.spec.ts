import { describe, expect, it } from 'vitest';
import { dataCurta, expiraEm, iniciais, porDia, rotuloDia, tempoRelativo } from './formatar';

const agora = new Date('2026-10-17T12:00:00');

describe('formatar', () => {
	it('tempo relativo', () => {
		expect(tempoRelativo('2026-10-17T11:59:40', agora)).toBe('agora');
		expect(tempoRelativo('2026-10-17T11:55:00', agora)).toBe('há 5 min');
		expect(tempoRelativo('2026-10-17T10:00:00', agora)).toBe('há 2 h');
		expect(tempoRelativo('2026-10-16T09:00:00', agora)).toBe('ontem');
		expect(tempoRelativo('2026-10-14T12:00:00', agora)).toBe('há 3 dias');
		expect(tempoRelativo('2026-09-02T12:00:00', agora)).toBe('2 set.');
	});

	it('data curta mostra o ano só quando é outro', () => {
		expect(dataCurta('2025-10-14T12:00:00', agora)).toBe('14 out. 2025');
	});

	it('validade de convite', () => {
		expect(expiraEm(null, agora)).toBe('sem validade');
		expect(expiraEm('2026-10-21T12:00:00', agora)).toBe('expira em 4 dias');
		expect(expiraEm('2026-10-16T12:00:00', agora)).toBe('expirou');
	});

	it('iniciais', () => {
		expect(iniciais('Kaito')).toBe('K');
		expect(iniciais('Hana Nara')).toBe('HN');
	});
});

describe('separadores de dia', () => {
	const hoje = new Date(2026, 9, 18, 15, 0);
	it('rotula hoje, ontem e datas longas', () => {
		expect(rotuloDia(new Date(2026, 9, 18, 1, 0), hoje)).toBe('Hoje');
		expect(rotuloDia(new Date(2026, 9, 17, 23, 59), hoje)).toBe('Ontem');
		expect(rotuloDia(new Date(2026, 9, 1), hoje)).toBe('1 de outubro de 2026');
	});
	it('agrupa em ordem', () => {
		const itens = [new Date(2026, 9, 18, 10), new Date(2026, 9, 18, 9), new Date(2026, 9, 17, 9), new Date(2026, 8, 3)];
		expect(porDia(itens, (d) => d.toISOString(), hoje).map((g) => [g.dia, g.itens.length])).toEqual([
			['Hoje', 2],
			['Ontem', 1],
			['3 de setembro de 2026', 1]
		]);
	});
});
