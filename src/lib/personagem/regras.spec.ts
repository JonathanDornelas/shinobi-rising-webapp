import { describe, expect, it } from 'vitest';
import {
	analisar,
	atributosTotais,
	fichaVazia,
	limiteAtributo,
	linhasPericia,
	normalizarFicha,
	orcamentoAtributos,
	pontosPericia,
	ptDisponiveis,
	recursos,
	type ContextoCampanha,
	type FichaDados,
	type ItemLoja,
	type JutsuOpcao
} from './regras.ts';

const ctx: ContextoCampanha = {
	vilas: ['konoha', 'kiri', 'suna', 'kumo', 'iwa', 'sem'],
	clas: ['nara', 'uchiha', 'senju', 'inuzuka'],
	clasSemKkg: true,
	clasComKkg: true,
	pacotes: ['A', 'B'],
	aprovacao: { fichas: true, backgrounds: true },
	nivelInicial: 1
};
const jutsusD: JutsuOpcao[] = [
	{ slug: 'shunshin-no-jutsu', nome: 'Shunshin no Jutsu', rank: 'D', elemento: null },
	{ slug: 'hi-no-tama', nome: 'Hi no Tama', rank: 'D', elemento: 'katon' },
	{ slug: 'doryuuheki', nome: 'Doryuuheki', rank: 'D', elemento: 'doton' }
];
const loja: ItemLoja[] = [
	{ id: 'arma-kunai', nome: 'Kunai', preco: 300, peso: 0.5, conjunto: 10, grupo: 'Distância', icone: '' },
	{ id: 'arma-katana-espada', nome: 'Katana', preco: 5000, peso: 2, grupo: 'Longas', icone: '' }
];

/** Hana Nara, a ficha de exemplo do design, já completa e válida. */
function hana(): FichaDados {
	const f = fichaVazia();
	f.conceito.nome = 'Hana Nara';
	f.atributos = { FOR: 0, AGI: 2, VIG: 1, INT: 2, CTR: 2, ESP: 1 };
	f.vila = { id: 'konoha', escolha: 'acrobacia' };
	f.cla = { tipo: 'catalogo', slug: 'nara', escolha: null };
	f.pericias = { ninjutsu: 3, investigacao: 2, acrobacia: 2, percepcao: 1, furtividade: 2, bukijutsu: 2 };
	f.proficiencias = [
		{ tipo: 'jutsu', alvo: 'kage-mane-no-jutsu', nivel: 2 },
		{ tipo: 'arma', alvo: 'Kunai', nivel: 1 }
	];
	f.especializacao = 'controle-chakra';
	f.elemento = 'doton';
	f.jutsus = { E: ['kai', 'konoha-reppuu'], D: ['doryuuheki'] };
	f.equipamento.pacote = 'A';
	f.background = { id: 'estudioso', escolha: null, proprio: { nome: '', pericia: null, traco: '' } };
	return f;
}

describe('atributos (cap. 6, Passo 2)', () => {
	it('8 pontos, com o +1 do clã por cima', () => {
		const f = hana();
		expect(orcamentoAtributos(f)).toMatchObject({ usados: 8, restantes: 0, reducoes: 0 });
		expect(atributosTotais(f).INT).toBe(3);
	});
	it('reduzir até dois atributos dá pontos extras', () => {
		const f = fichaVazia();
		f.atributos = { FOR: -2, AGI: -1, VIG: 4, INT: 4, CTR: 3, ESP: 0 };
		expect(orcamentoAtributos(f).restantes).toBe(0);
		expect(limiteAtributo(f, 'ESP', -1)).toMatch(/Só 2 atributos/);
		expect(limiteAtributo(f, 'FOR', -1)).toMatch(/mínimo/);
		expect(limiteAtributo(f, 'VIG', 1)).toMatch(/\+4/);
	});
	it('o atributo do clã mostra o limite +5', () => {
		const f = hana();
		f.atributos.INT = 4;
		expect(limiteAtributo(f, 'INT', 1)).toMatch(/\+5/);
	});
});

describe('recursos (cap. 6, Passo 8)', () => {
	it('segue os exemplos do livro: VIG +3 → 35 PV e 35 PE; ESP +2 e CTR +3 → 50 PC', () => {
		const f = fichaVazia();
		f.atributos = { FOR: 0, AGI: 0, VIG: 3, INT: 0, CTR: 3, ESP: 2 };
		const r = recursos(f);
		expect([r.pv, r.pe, r.pc]).toEqual([35, 35, 50]);
	});
	it('atributos negativos não reduzem; somam clã, vila e especialização', () => {
		const f = hana();
		f.atributos.VIG = -1;
		f.vila.id = 'kumo';
		f.especializacao = 'reservatorio';
		const r = recursos(f);
		expect(r.pv).toBe(20 + 0 + 5);
		expect(r.pc).toBe(30 + 4 * 1 + 4 * 2 + 5 + 10);
		expect(r.cargaMax).toBe(10);
	});
	it('defesa usa a Acrobacia total; carga e ryo do Pacote B', () => {
		const f = hana();
		const acro = linhasPericia(f).find((p) => p.id === 'acrobacia')!;
		expect(acro.total).toBe(2 + 1 + 2); // treino + Konoha (escolha) + AGI
		expect(recursos(f).defesa).toBe(10 + 5);
		f.equipamento = { pacote: 'B', compras: [{ id: 'arma-kunai', qtd: 12 }, { id: 'arma-katana-espada', qtd: 1 }] };
		const r = recursos(f, loja);
		expect(r.ryo).toBe(14000 - 3600 - 5000);
		expect(r.carga).toBe(1 + 2);
	});
});

describe('perícias e proficiências (cap. 3 e 6)', () => {
	it('sem clã ganha +2 pontos de perícia e +5 PT', () => {
		const f = hana();
		f.cla = { tipo: 'sem', slug: null, escolha: null };
		expect(pontosPericia(f).limite).toBe(14);
		expect(ptDisponiveis(f).total).toBe(9);
	});
	it('bônus de vila, clã e background somam e o valor para em +5', () => {
		const f = hana();
		f.pericias.investigacao = 3;
		const inv = linhasPericia(f).find((p) => p.id === 'investigacao')!;
		expect(inv.bonus.map((b) => b.fonte).sort()).toEqual(['Estudioso', 'Nara']);
		expect(inv.valor).toBe(5);
	});
	it('categoria de arma custa 1 PT a mais por nível', () => {
		const f = hana();
		f.proficiencias = [{ tipo: 'categoria', alvo: 'Armas de distância', nivel: 1 }];
		expect(ptDisponiveis(f).gastos).toBe(2);
	});
});

describe('revisão (cap. 6, Passo 12)', () => {
	it('Hana Nara não tem bloqueios', () => {
		const a = analisar(hana(), ctx, { jutsusD, loja });
		expect(a.verificacoes.filter((v) => v.nivel === 'bloqueio')).toEqual([]);
		expect(a.passos.slice(0, 11).every((p) => p === 'feito')).toBe(true);
	});
	it('ficha vazia bloqueia nos passos certos', () => {
		const a = analisar(fichaVazia(), ctx, { jutsusD, loja });
		const passos = new Set(a.verificacoes.filter((v) => v.nivel === 'bloqueio').map((v) => v.passo));
		expect([...passos].sort((x, y) => x - y)).toEqual([1, 3, 4, 7, 9, 10, 11]);
	});
	it('jutsu D de outro elemento, clã fora da campanha e pacote não liberado bloqueiam', () => {
		const f = hana();
		f.jutsus.D = ['hi-no-tama'];
		f.equipamento.pacote = 'marionetista';
		f.cla.slug = 'yuki';
		const textos = analisar(f, ctx, { jutsusD, loja }).verificacoes.filter((v) => v.nivel === 'bloqueio').map((v) => v.texto);
		expect(textos).toEqual(expect.arrayContaining([expect.stringMatching(/afinidade/), expect.stringMatching(/não é permitido/), expect.stringMatching(/não está liberado/)]));
	});
	it('Uchiha fixa Katon; Senju precisa de um segundo elemento', () => {
		const f = hana();
		f.cla.slug = 'uchiha';
		f.jutsus.D = ['hi-no-tama'];
		// a proficiência em Kage Mane (jutsu Nara) deixa de valer
		expect(analisar(f, ctx, { jutsusD, loja }).verificacoes.filter((v) => v.nivel === 'bloqueio').map((v) => v.passo)).toEqual([6]);
		f.proficiencias = f.proficiencias.filter((p) => p.tipo !== 'jutsu');
		expect(analisar(f, ctx, { jutsusD, loja }).bloqueios).toBe(0);
		f.cla.slug = 'senju';
		f.jutsus.D = ['doryuuheki'];
		expect(analisar(f, ctx, { jutsusD, loja }).verificacoes.some((v) => /segundo elemento/.test(v.texto))).toBe(true);
	});
	it('background próprio vai para aprovação quando a campanha exige', () => {
		const f = hana();
		f.background = { id: 'proprio', escolha: null, proprio: { nome: 'Pescador', pericia: 'sobrevivencia', traco: 'Cresceu no mar' } };
		expect(analisar(f, ctx, { jutsusD, loja }).dependencias).toEqual(['Background próprio "Pescador"']);
	});
	it('normaliza fichas parciais', () => {
		const f = normalizarFicha({ conceito: { nome: 'Ren' } } as Partial<FichaDados>);
		expect(f.atributos.FOR).toBe(0);
		expect(f.conceito.nome).toBe('Ren');
	});
});
