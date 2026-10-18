import { describe, expect, it } from 'vitest';
import { lerMarco, picMaximo } from '../personagem/progressao.ts';
import { atributosTotais, elementos, fichaVazia, jutsusConhecidos, linhasPericia, ptDisponiveis, recursos } from '../personagem/regras.ts';
import { analisarCla, balancaPkg, claVazio, limiteCompra, linhasMarcos, orcamentoPb, regrasParaFicha, type ClaDados } from './regras.ts';

/** Exemplo do cap. 8.4: Clã Kasai Joushou, com KKG elemental. */
function kasai(): ClaDados {
	const d = claVazio(true);
	d.conceito = { ...d.conceito, nome: 'Kasai Joushou', significado: 'Chama que Sobe', vila: 'iwa', historia: 'Ferreiros que sopram o próprio fogo. Perderam a forja na guerra.', cor: '#E8692E', kamon: '05' };
	d.bonus.compras = [
		{ tipo: 'atributo', alvo: 'CTR' },
		{ tipo: 'pericia', alvo: 'sobrevivencia' }
	];
	d.bonus.pericia = 'sobrevivencia';
	d.kekkei = {
		...d.kekkei,
		nome: 'Shakuton',
		tipo: 'combinacao',
		elementos: ['katon', 'fuuton'],
		elementoNovo: 'Calor Abrasador',
		beneficios: [
			{ id: 'combinacao', detalhe: '' },
			{ id: 'jutsu-b', detalhe: 'Shakuton: Kajōsatsu' },
			{ id: 'resistencia', detalhe: 'Fogo' }
		],
		limitacoes: [
			{ id: 'custo-10', detalhe: '' },
			{ id: 'cega-temporaria', detalhe: '' },
			{ id: 'vulneravel', detalhe: 'Suiton' }
		]
	};
	d.cartas = [
		{ id: 'a', tipo: 'jutsu', slug: null, nome: 'Hōka no Jutsu', rank: 'C', descricao: 'Sopro de brasas.' },
		{ id: 'b', tipo: 'jutsu', slug: null, nome: 'Kaze Hibana', rank: 'D', descricao: 'Faíscas no vento.' },
		{ id: 'c', tipo: 'jutsu', slug: null, nome: 'Shakuton: Kajōsatsu', rank: 'B', descricao: 'Esferas de calor.' },
		{ id: 'h', tipo: 'habilidade', slug: null, nome: 'Pulmões de Ferreiro', rank: null, descricao: 'Aguenta fumaça.' }
	];
	d.assinatura = 'a';
	d.marcos = { 2: { opcao: 'jutsu', carta: 'b' }, 6: { opcao: 'jutsu', carta: 'c' }, 8: { opcao: 'habilidade', carta: 'h' } };
	d.patrimonio = ['arsenal', 'biblioteca'];
	d.politica = { status: 'pequeno', aliado: 'Hōzuki', rival: 'Yuki', posicao: '' };
	d.obrigacoes = ['Servidão a uma instituição da vila'];
	return d;
}

describe('orçamentos do cap. 8.4', () => {
	it('3 PB com KKG; sem KKG, +1 PB ou +1 jutsu', () => {
		expect(orcamentoPb(kasai())).toEqual({ limite: 3, usados: 3, restantes: 0 });
		const s = claVazio(false);
		expect(orcamentoPb(s).limite).toBe(4);
		s.bonus.extraSemKkg = 'jutsu';
		expect(orcamentoPb(s).limite).toBe(3);
	});

	it('não deixa comprar além do PB nem repetir o atributo', () => {
		const d = kasai();
		expect(limiteCompra(d, 'pv')).toBe('PB insuficiente');
		expect(limiteCompra(d, 'atributo')).toBe('Só uma vez');
	});

	it('balança de PKG do exemplo: 11 de benefícios = 5 + 6 de limitações', () => {
		expect(balancaPkg(kasai())).toEqual({ beneficios: 11, limitacoes: 6, disponiveis: 11, saldo: 0 });
	});

	it('PKG faltando bloqueia o envio', () => {
		const d = kasai();
		d.kekkei.limitacoes.pop();
		const a = analisarCla(d);
		expect(a.verificacoes).toContainEqual({ nivel: 'bloqueio', texto: 'KKG desequilibrado: faltam 2 PKG', passo: 2 });
		expect(a.passos[2]).toBe('erro');
	});
});

describe('marcos do Esqueleto Padrão', () => {
	it('preenche as linhas fixas com o atributo e a perícia do clã', () => {
		const l = linhasMarcos(kasai());
		expect(l).toHaveLength(20);
		expect(l[0].texto).toBe('Hōka no Jutsu; +1 PIC');
		expect(l[4].texto).toBe('+1 CTR');
		expect(l[11].texto).toBe('+1 em Sobrevivência');
		expect(l[14].texto).toBe('+1 CTR; limite de CTR +9');
		expect(l[9]).toMatchObject({ texto: '+3 PIC', completo: false });
	});

	it('o texto dos marcos é lido pela subida de nível', () => {
		const l = linhasMarcos(kasai());
		expect(lerMarco(l[14].texto, [])).toMatchObject({ atributos: { CTR: 1 }, limites: { CTR: 9 } });
		expect(lerMarco(l[5].texto, [{ slug: 'x', nome: 'Shakuton: Kajōsatsu' }]).jutsus).toEqual(['x']);
	});

	it('jutsu acima do rank do marco não vale', () => {
		const d = kasai();
		d.marcos[2] = { opcao: 'jutsu', carta: 'c' };
		expect(linhasMarcos(d)[1]).toMatchObject({ completo: false, problema: 'Shakuton: Kajōsatsu passa do Rank C' });
	});

	it('o exemplo do livro não tem bloqueios, só avisos de marcos e cartas', () => {
		const a = analisarCla(kasai());
		expect(a.bloqueios).toBe(0);
		expect(a.marcosCompletos).toBe(13);
	});
});

describe('o clã na ficha do personagem', () => {
	it('aplica bônus, jutsu do nível 1, elementos e PIC', () => {
		const d = kasai();
		d.bonus.compras = [
			{ tipo: 'pericia', alvo: 'sobrevivencia' },
			{ tipo: 'pv', alvo: null },
			{ tipo: 'afinidade', alvo: 'katon' }
		];
		d.bonus.atributo = 'CTR';
		const regras = regrasParaFicha('0f8e1c2a-0000-4000-8000-000000000000', d);
		const f = fichaVazia();
		f.cla = { tipo: 'novo-com-kkg', slug: null, escolha: null, id: regras.id, criado: regras };
		f.vila.id = 'iwa';
		expect(recursos(f).pv).toBe(20 + 5 + 5);
		expect(atributosTotais(f).CTR).toBe(0);
		expect(linhasPericia(f).find((p) => p.id === 'sobrevivencia')!.bonus).toContainEqual({ fonte: 'Kasai Joushou', valor: 1 });
		expect(jutsusConhecidos(f)).toContain('cla-0f8e1c2a-a');
		expect(elementos(f)).toEqual(['katon']);
		expect(picMaximo(f)).toBe(2 + 1);
		expect(ptDisponiveis(f).total).toBe(4);
	});

	it('PB em atributo e PT entram na criação', () => {
		const d = kasai();
		d.bonus.compras = [
			{ tipo: 'atributo', alvo: 'CTR' },
			{ tipo: 'pt', alvo: null }
		];
		const r = regrasParaFicha('id', d);
		const f = fichaVazia();
		f.cla = { tipo: 'novo-com-kkg', slug: null, escolha: null, id: 'id', criado: r };
		expect(atributosTotais(f).CTR).toBe(1);
		expect(ptDisponiveis(f).total).toBe(6);
	});
});
