import { describe, expect, it } from 'vitest';
import { idsCriados, infoItem, infoItens } from './info.server.ts';

describe('cartão do item (cap. 11, 12 e 13)', () => {
	it('item utilitário: o efeito, o preço e o peso da tabela', () => {
		const i = infoItem({ id: 'item-pilula-de-cura', nome: 'Pílula de cura' });
		expect(i).toMatchObject({ tipo: 'Item utilitário', efeito: 'Cura 1d6 PV', preco: '1.500 ryo', peso: 'Insignificante' });
		expect(i?.regra).toContain('#itens-utilitarios');
		// o nome do inventário com outro espaçamento ainda acha a linha
		expect(infoItem({ id: 'x', nome: 'Fio ninja (50m)' })?.efeito).toBe('Armadilhas e escalada');
	});
	it('arma: dano, alcance e cada propriedade com o efeito', () => {
		const k = infoItem({ id: 'arma-kunai', nome: 'Kunai' })!;
		expect(k).toMatchObject({ tipo: 'Arma · Distância', dano: '1d6', alcance: 'Curto / corpo a corpo' });
		expect(k.propriedades.map((p) => p.nome)).toEqual(['Versátil', 'Rajada']);
		expect(k.propriedades[0].efeito).toBe('Pode ser usada corpo a corpo ou arremessada');
	});
	it('pergaminho de armazenamento: a capacidade e o tempo de selar', () => {
		expect(infoItem({ id: 'item-pergaminho-basico', nome: 'Pergaminho básico (5 de carga)' })?.efeito).toContain('5 unidades de carga');
	});
	it('arma forjada da campanha: base, qualidade e as propriedades da forja', () => {
		const criados = [{ id: 'abc', tipo: 'arma', nome: 'Presa', resumo: { categoria: 'Kunai', qualidade: 'Boa', dano: '1d6+1', custo: 900, carga: 0.5, efeito: 'Boa · Afiada' } }];
		const a = infoItem({ id: 'eq-abc', nome: 'Presa', qualidade: 'Boa', dano: '1d6+1' }, criados)!;
		expect(a).toMatchObject({ tipo: 'Arma forjada · Kunai', dano: '1d6+1', efeito: 'Qualidade Boa: +1 de dano.', preco: '900 ryo' });
		expect(a.propriedades.map((p) => p.nome)).toEqual(['Versátil', 'Rajada', 'Afiada']);
	});
	it('item da campanha: o efeito do resumo; item desconhecido fica sem cartão', () => {
		const criados = [{ id: 'z', tipo: 'item', nome: 'Chá', resumo: { categoria: 'Consumível', efeito: 'Recupera 5 PE', custo: 100, carga: 0 } }];
		expect(infoItem({ id: 'eqi-z', nome: 'Chá' }, criados)).toMatchObject({ tipo: 'Item da campanha · Consumível', efeito: 'Recupera 5 PE' });
		expect(infoItem({ id: 'qualquer', nome: 'Lembrança da mãe' })).toBeNull();
		expect(Object.keys(infoItens([{ id: 'qualquer', nome: 'Lembrança' }, { id: 'arma-kunai', nome: 'Kunai' }]))).toEqual(['arma-kunai']);
		expect(idsCriados([{ id: 'eq-1' }, { id: 'eqi-2' }, { id: 'arma-kunai' }, { id: 'eq-1' }])).toEqual(['1', '2']);
	});
});
