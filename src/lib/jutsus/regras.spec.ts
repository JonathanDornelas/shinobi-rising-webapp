import { describe, expect, it } from 'vitest';
import { pjDoDano } from './dados.ts';
import { analisarJutsu, calcularJutsu, infoAutomatica, jutsuVazio, paraJutsuLivro, type JutsuDados } from './regras.ts';

const jutsu = (p: Partial<JutsuDados>): JutsuDados => ({ ...jutsuVazio(), nome: 'Teste', efeito: 'x', ...p, dano: { ...jutsuVazio().dano, ...p.dano } });

describe('tabela de dano (cap. 20)', () => {
	it('PJ pelo dano médio', () => {
		expect(pjDoDano(3.5)).toBe(1);
		expect(pjDoDano(4.5)).toBe(2);
		expect(pjDoDano(7)).toBe(3);
		expect(pjDoDano(10.5)).toBe(5);
		expect(pjDoDano(27)).toBe(15);
		expect(pjDoDano(55)).toBe(30);
		expect(pjDoDano(65)).toBe(35);
	});
});

describe('exemplos do cap. 20.5', () => {
	it('Hyousenkou no Mai: 2d6, Médio, Esfera 3m, sangramento = 9 PJ, Rank C, 9 PC', () => {
		const c = calcularJutsu(jutsu({ tipo: 'Ninjutsu', dano: { modo: 'dano', qtd: 2, dado: 6, bonus: 0 }, alcance: 'medio', area: 'esfera3', componentes: { continuo: 1 } }));
		expect(c).toMatchObject({ pj: 9, rank: 'C', ptAprender: 4 });
		expect(c.custo.texto).toBe('9 PC');
	});

	it('Konoha Daikaiten: 1d6 + FOR, Pessoal, Esfera 3m, empurra = 4 PJ, Rank D, 4 PE', () => {
		const d = jutsu({ tipo: 'Taijutsu', dano: { modo: 'dano', qtd: 1, dado: 6, bonus: 0 }, alcance: 'pessoal', area: 'esfera3', componentes: { empurra: 1 } });
		const c = calcularJutsu(d);
		expect(c).toMatchObject({ pj: 4, rank: 'D' });
		expect(c.custo.texto).toBe('4 PE');
		expect(c.linhas[0].rotulo).toContain('+ FOR');
	});

	it('Rasengan Sombrio: 6d8, Toque, drena, não copiável, 1d6 no usuário = 19 PJ, Rank A', () => {
		const c = calcularJutsu(jutsu({ tipo: 'Ninjutsu', dano: { modo: 'dano', qtd: 6, dado: 8, bonus: 0 }, alcance: 'toque', componentes: { drena: 1, 'nao-copia': 1, 'dano-proprio': 1 } }));
		expect(c).toMatchObject({ pj: 19, rank: 'A', nivelMin: 11 });
	});

	it('Suiton: Mizurappa: 1d6, Curto, empurra = 3 PJ; sem selos iria a 5, ainda Rank D', () => {
		const base = { tipo: 'Ninjutsu' as const, dano: { modo: 'dano' as const, qtd: 1, dado: 6 as const, bonus: 0 }, alcance: 'curto' as const };
		expect(calcularJutsu(jutsu({ ...base, componentes: { empurra: 1 } })).pj).toBe(3);
		expect(calcularJutsu(jutsu({ ...base, componentes: { empurra: 1, 'sem-selos': 1 } }))).toMatchObject({ pj: 5, rank: 'D' });
	});

	it('Shōsen Jutsu: cura 3d6, Toque, remove condição, componente durável = 7 PJ, Rank C', () => {
		const c = calcularJutsu(jutsu({ tipo: 'Ninjutsu', dano: { modo: 'cura', qtd: 3, dado: 6, bonus: 0 }, alcance: 'toque', componentes: { remove: 1, duravel: 1 } }));
		expect(c).toMatchObject({ pj: 7, rank: 'C' });
	});
});

describe('regras de ouro e verificações', () => {
	it('Sensei tira 2 PJ e o mínimo é 1', () => {
		expect(calcularJutsu(jutsu({ tipo: 'Ninjutsu', sensei: true })).pj).toBe(1);
	});

	it('rank acima do nível do personagem bloqueia o envio', () => {
		const d = jutsu({ tipo: 'Ninjutsu', dano: { modo: 'dano', qtd: 4, dado: 8, bonus: 0 }, alcance: 'medio', componentes: { ignora: 1 } });
		const a = analisarJutsu(d, { nome: 'Ren', nivel: 4 });
		expect(calcularJutsu(d).rank).toBe('B');
		expect(a.verificacoes).toContainEqual({ nivel: 'bloqueio', texto: 'Rank B exige nível 6 (Ren está no 4)', secao: 2 });
		expect(analisarJutsu({ ...d, sensei: true, dano: { ...d.dano, qtd: 3 } }, { nome: 'Ren', nivel: 4 }).bloqueios).toBe(0);
	});

	it('área massiva só em Rank S; Kugutsu divide PC e PE', () => {
		expect(analisarJutsu(jutsu({ tipo: 'Ninjutsu', area: 'massiva' })).verificacoes.some((v) => v.texto.includes('massiva'))).toBe(true);
		expect(calcularJutsu(jutsu({ tipo: 'Kugutsu', dano: { modo: 'dano', qtd: 2, dado: 6, bonus: 0 }, alcance: 'curto' })).custo.texto).toBe('2 PC + 2 PE');
	});

	it('linha de info automática', () => {
		const d = jutsu({ tipo: 'Ninjutsu', dano: { modo: 'dano', qtd: 2, dado: 6, bonus: 0 }, alcance: 'medio', area: 'esfera3', componentes: { continuo: 1, sustentado: 1 } });
		expect(infoAutomatica(d)).toEqual({ alcance: 'Médio (30m)', duracao: 'Sustentado (3 PC/turno)', area: 'Esfera 3m', ataque: '— (área)', resistencia: 'Acrobacia (DT do Jutsu)', acao: 'Primária' });
		expect(paraJutsuLivro('x', d, 'Clã').pj).toContain('= 11 PJ');
	});
});
