import { describe, expect, it } from 'vitest';
import { analisar, fichaVazia, orcamentoAtributos, periciasTreinadas, pontosPericia, type ContextoCampanha } from './regras.ts';
import { sorteioComSemente } from '#lib/rolagens/dados3d.ts';
import { sortearAtributos, sortearPericias, sortearTudo, type CatalogoSorteio } from './sorteio.ts';

const ctx: ContextoCampanha = { vilas: ['konoha', 'suna', 'kiri', 'kumo', 'iwa', 'sem'], clas: ['nara', 'uchiha', 'hyuuga', 'akimichi'], clasSemKkg: true, clasComKkg: true, pacotes: ['A', 'B'], aprovacao: { fichas: true, backgrounds: false }, nivelInicial: 1 };
const cat: CatalogoSorteio = {
	jutsusE: [{ slug: 'kai', elemento: null }, { slug: 'konoha-reppuu', elemento: null }, { slug: 'henge-no-jutsu', elemento: null }],
	jutsusD: [{ slug: 'doryuuheki', elemento: 'doton' }, { slug: 'hi-no-tama', elemento: 'katon' }, { slug: 'shunshin-no-jutsu', elemento: null }],
	armas: ['Kunai', 'Shuriken', 'Katana'],
	especializacoes: [{ id: 'ninjutsu', bloqueio: null }, { id: 'taijutsu', bloqueio: null }, { id: 'sennin', bloqueio: 'Não' }]
};

describe('sortear na criação', () => {
	it('os atributos gastam os 9 pontos dentro dos limites, em qualquer semente', () => {
		for (let i = 0; i < 40; i++) {
			const f = sortearAtributos(fichaVazia(), sorteioComSemente(`at${i}`));
			const o = orcamentoAtributos(f);
			expect(o.restantes).toBe(0);
			expect(o.reducoes).toBeLessThanOrEqual(2);
			expect(Object.values(f.atributos).every((v) => v >= -2 && v <= 4)).toBe(true);
		}
	});

	it('as perícias da criação: o limite certo, sem repetir as que a vila e o clã treinam, com uma de combate', () => {
		const f = fichaVazia();
		f.vila = { id: 'kiri', escolha: null };
		const g = sortearPericias(f, sorteioComSemente('p'));
		const t = periciasTreinadas(g);
		expect(pontosPericia(g).usados).toBe(pontosPericia(g).limite);
		expect(t.repetidas).toEqual([]);
		expect(['taijutsu', 'bukijutsu', 'ninjutsu'].some((p) => t.fontes.has(p as never))).toBe(true);
	});

	it('a ficha inteira sorteada não tem bloqueios nas regras (fora o que depende do jogador)', () => {
		for (let i = 0; i < 15; i++) {
			const f = sortearTudo(fichaVazia(), ctx, cat, sorteioComSemente(`ficha${i}`));
			const a = analisar(f, ctx, { jutsusD: cat.jutsusD.map((j) => ({ ...j, nome: j.slug, rank: 'D' as const })), loja: [] });
			const bloqueios = a.verificacoes.filter((v) => v.nivel === 'bloqueio').map((v) => `${v.passo}: ${v.texto}`);
			// o equipamento sem a loja e os jutsus E fora do catálogo de teste não contam aqui
			expect(bloqueios.filter((b) => !/^(9|10):/.test(b))).toEqual([]);
		}
	});
});
