import { describe, expect, it } from 'vitest';
import { dataCurta, expiraEm, iniciais, tempoRelativo } from './formatar';

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
