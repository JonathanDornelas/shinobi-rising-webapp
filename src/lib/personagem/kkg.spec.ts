import { describe, expect, it } from 'vitest';
import { claVazio } from '#lib/clas/regras.ts';
import { custoKkg, defesaKkg, defKkg, efeitoKkg, kkgLigada, periciasComKkg } from './kkg.ts';
import type { LinhaPericia } from './regras.ts';

describe('Kekkei Genkai na ficha', () => {
	it('custo por cena com a redução dos marcos', () => {
		const byakugan = defKkg('hyuuga')!;
		expect(custoKkg(byakugan, 5)).toEqual({ custo: 3, reducao: null });
		expect(custoKkg(byakugan, 13)).toEqual({ custo: 0, reducao: 'Byakugan Kanzen' });
		const sharingan = defKkg('uchiha')!;
		expect(custoKkg(sharingan, 7).custo).toBe(3);
		expect(custoKkg(sharingan, 8)).toEqual({ custo: 2, reducao: 'Sharingan Desenvolvido' });
		expect(custoKkg(sharingan, 15)).toEqual({ custo: 1, reducao: 'Olhos que Leem o Combate' });
		expect(custoKkg(defKkg('hozuki')!, 13).custo).toBe(5);
		expect(defKkg('nara')).toBeNull();
	});

	it('Sharingan: os bônus seguem o estágio; sem despertar, não liga', () => {
		const s = defKkg('uchiha')!;
		expect(efeitoKkg(s, 5, 1)).toMatchObject({ pericias: { percepcao: 1 }, defesa: 1 });
		expect(efeitoKkg(s, 5, 3)).toMatchObject({ pericias: { percepcao: 3 }, defesa: 2 });
		expect(kkgLigada(s, { ativa: true, estagio: 0 })).toBe(false);
		expect(kkgLigada(s, { ativa: true, estagio: 2 })).toBe(true);
		expect(defesaKkg(s, { ativa: true, estagio: 3 }, 5)).toBe(2);
		expect(defesaKkg(s, { ativa: false, estagio: 3 }, 5)).toBe(0);
	});

	it('o Byakugan ativo soma +5 na Percepção como mais um bônus da linha', () => {
		const linha = { id: 'percepcao', nome: 'Percepção', atributo: 'ESP', valorAtributo: 2, treino: 1, bonus: [], valor: 1, total: 3, combate: false } as unknown as LinhaPericia;
		const outra = { ...linha, id: 'acrobacia', nome: 'Acrobacia' } as LinhaPericia;
		const [p, a] = periciasComKkg([linha, outra], defKkg('hyuuga'), { ativa: true }, 3);
		expect(p.total).toBe(8);
		expect(p.bonus).toEqual([{ fonte: 'Byakugan', valor: 5 }]);
		expect(a.total).toBe(3);
		expect(periciasComKkg([linha], defKkg('hyuuga'), { ativa: false }, 3)[0].total).toBe(3);
	});

	it('marco que chega com o nível entra nos efeitos (Hone no Yoroi no 8)', () => {
		const k = defKkg('kaguya')!;
		expect(efeitoKkg(k, 7).textos.some((t) => /Hone no Yoroi/.test(t))).toBe(false);
		expect(efeitoKkg(k, 8).textos.some((t) => /Hone no Yoroi/.test(t))).toBe(true);
	});

	it('clã criado: o custo vem da limitação comprada; sem ela, fica sempre ativa', () => {
		const c = claVazio(true);
		c.kekkei.nome = 'Kasai';
		c.kekkei.tipo = 'combinacao';
		c.kekkei.limitacoes = [{ id: 'custo-10', detalhe: '' }];
		expect(defKkg(null, c)).toMatchObject({ nome: 'Kasai', custo: 10, sempre: false });
		c.kekkei.limitacoes = [];
		expect(defKkg(null, c)).toMatchObject({ custo: 0, sempre: true });
		expect(kkgLigada(defKkg(null, c), undefined)).toBe(true);
		expect(defKkg(null, claVazio(false))).toBeNull();
	});
});
