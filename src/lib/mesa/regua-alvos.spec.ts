import { describe, expect, it } from 'vitest';
import jutsus from '#lib/livro/gerado/jutsus.json';
import { MAX_ALVOS_PAGOS, reguaDoCard } from './regua.ts';

const card = (slug: string) => {
	const j = (jutsus as { slug: string; info: { k: string; v: string }[]; efeito: { t: string }[] }[]).find((x) => x.slug === slug)!;
	return reguaDoCard(j.info, j.efeito.map((x) => x.t).join(''));
};

describe('jutsus que cobram por alvo a mais', () => {
	it('Kage Mane: +2 PC por alvo, até 3 (na Área)', () => {
		expect(card('kage-mane-no-jutsu')).toMatchObject({ forma: 'alvos', alvos: 3, custoAlvo: 2 });
	});
	it('Suna Shuriken: +2 PC por alvo, sem limite escrito', () => {
		expect(card('suna-shuriken')).toMatchObject({ forma: 'alvos', alvos: MAX_ALVOS_PAGOS, custoAlvo: 2 });
	});
	it('Mizu Teppou: o custo por alvo está no efeito, "no máximo 2" a mais', () => {
		expect(card('mizu-teppou')).toMatchObject({ forma: 'alvos', alvos: 3, custoAlvo: 2 });
	});
	it('alvos a mais sem custo ("Alvo único +2") continuam sem custo extra', () => {
		expect(card('choju-giga')).toMatchObject({ forma: 'alvos', alvos: 3 });
		expect(card('choju-giga').custoAlvo).toBeUndefined();
	});
});
