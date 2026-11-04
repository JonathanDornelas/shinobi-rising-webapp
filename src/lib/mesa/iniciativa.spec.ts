import { describe, expect, it } from 'vitest';
import { chaveDaEntrada, colocarNaOrdem, juntarManuais, lerIniciativa, tirarDaOrdem, trocarManual } from './iniciativa.ts';

describe('iniciativa digitada à mão', () => {
	it('lê um inteiro dentro do limite; campo vazio ou sem número não vale', () => {
		expect(lerIniciativa('14')).toBe(14);
		expect(lerIniciativa(' 7 ')).toBe(7);
		expect(lerIniciativa('0')).toBe(0);
		expect(lerIniciativa('-2')).toBe(-2);
		expect(lerIniciativa('12.9')).toBe(12);
		expect(lerIniciativa('5000')).toBe(999);
		expect(lerIniciativa('-5000')).toBe(-99);
		expect(lerIniciativa('')).toBeNull();
		expect(lerIniciativa('   ')).toBeNull();
		expect(lerIniciativa('abc')).toBeNull();
	});

	it('guarda um número por pessoa: digitar de novo troca, null tira', () => {
		const a = trocarManual([], 'p1', 'Ren', 14);
		expect(a).toEqual([{ chave: 'p1', nome: 'Ren', valor: 14 }]);
		expect(trocarManual(a, 'p1', 'Ren', 9)).toEqual([{ chave: 'p1', nome: 'Ren', valor: 9 }]);
		expect(trocarManual(a, 'p2', 'Hana', 3)).toHaveLength(2);
		expect(trocarManual(a, 'p1', 'Ren', null)).toEqual([]);
	});

	it('na prévia, o número digitado vence o dado e entra quem não rolou; maior primeiro', () => {
		const roladas = [
			{ chave: 'p1', quem: 'Ren', total: 19 },
			{ chave: 'p2', quem: 'Hana', total: 14 }
		];
		const lista = juntarManuais(roladas, [
			{ chave: 'p1', nome: 'Ren', valor: 5 },
			{ chave: 'n1', nome: 'Ninja da Névoa', valor: 20 }
		]);
		expect(lista.map((o) => `${o.quem} ${o.total} ${o.manual}`)).toEqual(['Ninja da Névoa 20 true', 'Hana 14 false', 'Ren 5 true']);
		// sem nada digitado, fica o que foi rolado; no empate, a ordem do nome
		expect(juntarManuais(roladas, []).map((o) => o.quem)).toEqual(['Ren', 'Hana']);
		expect(juntarManuais([{ chave: 'a', quem: 'Zeca', total: 10 }], [{ chave: 'b', nome: 'Ana', valor: 10 }]).map((o) => o.quem)).toEqual(['Ana', 'Zeca']);
	});

	it('no combate, a entrada muda de lugar, a vez fica com quem estava nela e os outros não se mexem', () => {
		const ordem = [
			{ nome: 'Ren', valor: 19, personagem_id: 'p1' },
			{ nome: 'Hana', valor: 14, personagem_id: 'p2' },
			{ nome: 'Ninja', valor: 8, npc_id: 'n1' }
		];
		// quem está na vez cai para o fim: a vez vai junto
		let r = colocarNaOrdem(ordem, 0, { ...ordem[0], valor: 2 });
		expect(r.ordem.map((e) => e.nome)).toEqual(['Hana', 'Ninja', 'Ren']);
		expect(r.vez).toBe(2);
		// alguém sobe por cima de quem está na vez: a vez continua com Hana
		r = colocarNaOrdem(ordem, 1, { ...ordem[2], valor: 30 });
		expect(r.ordem.map((e) => e.nome)).toEqual(['Ninja', 'Ren', 'Hana']);
		expect(r.ordem[r.vez].nome).toBe('Hana');
		// quem estava fora entra no lugar do número, depois de quem empatou
		r = colocarNaOrdem(ordem, 1, { nome: 'Kaito', valor: 14, personagem_id: 'p3' });
		expect(r.ordem.map((e) => e.nome)).toEqual(['Ren', 'Hana', 'Kaito', 'Ninja']);
		expect(r.ordem[r.vez].nome).toBe('Hana');
		// a troca manual do Mestre (▲ ▼) continua de pé: Hana (14) antes de Ren (19) não é desfeita
		const trocada = [ordem[1], ordem[0], ordem[2]];
		r = colocarNaOrdem(trocada, 0, { ...ordem[2], valor: 1 });
		expect(r.ordem.map((e) => e.nome)).toEqual(['Hana', 'Ren', 'Ninja']);
	});

	it('no combate, quem sai da ordem não leva a vez de ninguém; se era a vez dele, passa a quem vinha depois', () => {
		const ordem = [
			{ nome: 'Ren', valor: 19, personagem_id: 'p1' },
			{ nome: 'Hana', valor: 14, personagem_id: 'p2' },
			{ nome: 'Ninja', valor: 8, npc_id: 'n1' }
		];
		// sai alguém antes de quem está na vez: a vez continua com Ninja
		let r = tirarDaOrdem(ordem, 2, 'p1');
		expect(r.ordem.map((e) => e.nome)).toEqual(['Hana', 'Ninja']);
		expect(r.ordem[r.vez].nome).toBe('Ninja');
		// sai quem está na vez: passa a quem vinha depois
		r = tirarDaOrdem(ordem, 1, 'p2');
		expect(r.ordem[r.vez].nome).toBe('Ninja');
		// sai o último, na vez dele: volta ao começo
		r = tirarDaOrdem(ordem, 2, 'n1');
		expect(r.ordem[r.vez].nome).toBe('Ren');
	});

	it('a entrada se identifica pelo personagem, pelo NPC ou, sem token, pelo nome', () => {
		expect(chaveDaEntrada({ nome: 'Ren', valor: 1, personagem_id: 'p1', npc_id: null })).toBe('p1');
		expect(chaveDaEntrada({ nome: 'Ninja', valor: 1, personagem_id: null, npc_id: 'n1' })).toBe('n1');
		expect(chaveDaEntrada({ nome: 'Visita', valor: 1 })).toBe('Visita');
	});
});
