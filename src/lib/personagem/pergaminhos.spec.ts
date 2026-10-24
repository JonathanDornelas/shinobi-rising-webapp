import { describe, expect, it } from 'vitest';
import { capacidadePergaminho, cargaInventario, livrePergaminho, type ItemInventario } from './progressao.ts';

const item = (o: Partial<ItemInventario> & Pick<ItemInventario, 'id' | 'nome'>): ItemInventario => ({ qtd: 1, peso: 1, grupo: 'Itens', icone: '', ...o });

describe('pergaminhos de armazenamento (cap. 11)', () => {
	it('a capacidade vem da Tabela de Pergaminhos; jutsu pré-armado e explosivo não guardam itens', () => {
		expect(capacidadePergaminho(item({ id: 'a', nome: 'Pergaminho básico (5 de carga)', grupo: 'Pergaminhos' }))).toBe(5);
		expect(capacidadePergaminho(item({ id: 'b', nome: 'Pergaminho avançado (15 de carga)', grupo: 'Pergaminhos' }))).toBe(15);
		expect(capacidadePergaminho(item({ id: 'c', nome: 'Pergaminho mestre (30 de carga)', grupo: 'Pergaminhos' }))).toBe(30);
		expect(capacidadePergaminho(item({ id: 'd', nome: 'Pergaminho de Jutsu Pré-Armado', grupo: 'Pergaminhos' }))).toBeNull();
		expect(capacidadePergaminho(item({ id: 'e', nome: 'Katana', grupo: 'Armas' }))).toBeNull();
	});

	it('o que está selado não pesa na mochila e ocupa o espaço do pergaminho', () => {
		const p = item({ id: 'perg', nome: 'Pergaminho básico (5 de carga)', grupo: 'Pergaminhos', peso: 0.5 });
		const katana = item({ id: 'arma-katana~s1', nome: 'Katana', grupo: 'Armas', peso: 2, selado: 'perg' });
		const kunai = item({ id: 'arma-kunai', nome: 'Kunai', grupo: 'Armas', qtd: 10, peso: 0.5, conjunto: 10 });
		expect(cargaInventario([p, katana, kunai])).toBe(1);
		expect(livrePergaminho([p, katana, kunai], p)).toBe(3);
	});
});
