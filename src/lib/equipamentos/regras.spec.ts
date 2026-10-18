import { describe, expect, it } from 'vitest';
import { analisarArma, analisarItem, analisarMarionete, armaVazia, calcularArma, calcularMarionete, itemVazio, marioneteVazia, type ArmaBase } from './regras.ts';

const katana: ArmaBase = { slug: 'arma-katana', nome: 'Katana', dano: '1d8', alcance: 'Corpo a corpo', peso: 'Pesado', preco: 5000, carga: 2, propriedades: ['Versátil'], icone: 'arma/ic-arma-katana', categoria: 'Longas' };

describe('forja (cap. 21)', () => {
	it('Excelente + Elemental + Afiada = 9 PFo: passa do Comum e do Mestre Ferreiro, cabe no Lendário', () => {
		const d = { ...armaVazia(), nome: 'Presa do Trovão', base: 'arma-katana', qualidade: 'excelente' as const, propriedades: [{ id: 'Elemental', detalhe: 'Raiton' }, { id: 'Afiada', detalhe: '' }] };
		const c = calcularArma(d, katana);
		expect(c).toMatchObject({ pfo: 9, limite: 3, custo: 30000, tempo: '1 mês', dano: '1d8+1', acerto: 1 });
		expect(analisarArma({ ...d, forjador: 'mestre' }, katana).verificacoes).toContainEqual({ nivel: 'bloqueio', texto: '9 PFo excedem o limite do Mestre Ferreiro (6)' });
		expect(analisarArma({ ...d, forjador: 'lendario', aparencia: 'x' }, katana).bloqueios).toBe(0);
	});

	it('propriedade repetida da base, detalhe faltando e história de arma Mestre bloqueiam', () => {
		const d = { ...armaVazia(), nome: 'X', base: 'arma-katana', qualidade: 'mestre' as const, forjador: 'lendario' as const, propriedades: [{ id: 'Versátil', detalhe: '' }, { id: 'Selada', detalhe: '' }] };
		const textos = analisarArma(d, katana).verificacoes.filter((v) => v.nivel === 'bloqueio').map((v) => v.texto);
		expect(textos).toEqual(['11 PFo excedem o limite do Forjador Lendário (10)', 'Versátil já vem na arma base', 'Defina: jutsu armazenado (Selada)', 'Armas de Mestre ou superiores precisam de uma história (Passo 6)']);
	});

	it('ryo insuficiente é aviso no envio', () => {
		const d = { ...armaVazia(), nome: 'X', base: 'arma-katana', qualidade: 'excelente' as const, forjador: 'mestre' as const };
		expect(analisarArma(d, katana, { nome: 'Ren', ryo: 20000 }).verificacoes).toContainEqual({ nivel: 'aviso', texto: 'Ren tem 20.000 ryo; faltam 10.000 ryo. A aprovação exige o ryo todo.' });
	});
});

describe('oficina de marionetes (cap. 13)', () => {
	it('Sanshōuo: Grande com armadura reforçada e lança-chamas', () => {
		const c = calcularMarionete({ ...marioneteVazia(), tamanho: 'grande', mecanismos: ['armadura', 'chamas'] });
		expect(c).toMatchObject({ slots: 4, limite: 10, pv: 130, defesa: 16, custo: 110000, ataque: '2d8+4' });
	});

	it('lâminas somam dano, fios pela boca tiram 1; slots acima do limite e sem especialização bloqueiam', () => {
		expect(calcularMarionete({ ...marioneteVazia(), tamanho: 'pequena', mecanismos: ['laminas'], modo: 'boca' }).ataque).toBe('1d6+3');
		const d = { ...marioneteVazia(), nome: 'Karasu', tamanho: 'pequena' as const, mecanismos: ['voo', 'laminas'] };
		const a = analisarMarionete(d, { nome: 'Hana', especializacaoMarionete: 0 });
		expect(a.verificacoes.filter((v) => v.nivel === 'bloqueio').map((v) => v.texto)).toEqual([
			'4 slots de mecanismo para 3 disponíveis',
			'Hana não tem a especialização Marionete: dá para montar o rascunho, mas só envia depois de aprendê-la'
		]);
	});
});

describe('novo item (cap. 11)', () => {
	it('exige nome e efeito', () => {
		expect(analisarItem(itemVazio()).bloqueios).toBe(2);
		expect(analisarItem({ ...itemVazio(), nome: 'Pó de Brasa', efeito: 'Acende fogo', preco: 300 }).bloqueios).toBe(0);
	});
});
