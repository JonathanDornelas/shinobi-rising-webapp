import { describe, expect, it } from 'vitest';
import {
	aplicarNivel,
	aplicarTreinos,
	atributosLivres,
	cargaInventario,
	custoJutsu,
	descansar,
	estadoAtual,
	inventarioInicial,
	lerMarco,
	opcoesTreino,
	picMaximo,
	planoNivel,
	progressoXp,
	type JutsuFicha
} from './progressao.ts';
import { atributosTotais, fichaVazia, linhasPericia, nivelDe, recursos, type FichaDados, type ItemLoja } from './regras.ts';

function hana(): FichaDados {
	const f = fichaVazia();
	f.conceito.nome = 'Hana Nara';
	f.atributos = { FOR: 0, AGI: 2, VIG: 1, INT: 2, CTR: 2, ESP: 1 };
	f.vila = { id: 'konoha', escolha: 'acrobacia' };
	f.cla = { tipo: 'catalogo', slug: 'nara', escolha: null };
	f.pericias = { ninjutsu: 3, investigacao: 2, acrobacia: 2, percepcao: 1, furtividade: 2, bukijutsu: 2 };
	f.proficiencias = [{ tipo: 'jutsu', alvo: 'kage-mane-no-jutsu', nivel: 2 }];
	f.especializacao = 'controle-chakra';
	f.elemento = 'doton';
	f.jutsus = { E: ['kai', 'konoha-reppuu'], D: ['doryuuheki'] };
	f.equipamento.pacote = 'A';
	f.background = { id: 'estudioso', escolha: null, proprio: { nome: '', pericia: null, traco: '' } };
	return f;
}
const NARA = [
	{ slug: 'kage-mane-no-jutsu', nome: 'Kage Mane no Jutsu' },
	{ slug: 'kage-yose-no-jutsu', nome: 'Kage Yose no Jutsu' }
];
const MARCOS = [
	{ nivel: 2, texto: 'Kage Yose no Jutsu (Técnica do Puxão pela Sombra)' },
	{ nivel: 3, texto: '+3 PT' },
	{ nivel: 5, texto: '+1 INT' },
	{ nivel: 10, texto: '+3 PIC; Criar Jutsu do Clã (até Rank B)' },
	{ nivel: 15, texto: '+1 INT; limite de INT +9' }
];
const jutsu = (slug: string, custo: string, custoNum: number, tipo: string, rank = 'C', elemento: string | null = null): JutsuFicha => ({
	slug,
	nome: slug,
	rank,
	tipo,
	custo,
	custoNum,
	elemento,
	cla: null,
	origem: 'Geral',
	efeito: '',
	info: []
});

describe('XP e nível (cap. 17)', () => {
	it('barra do nível atual até o próximo', () => {
		expect(progressoXp(1, 200)).toMatchObject({ alvo: 200, podeSubir: true });
		expect(progressoXp(4, 1400)).toMatchObject({ inicio: 1000, alvo: 1800, fracao: 0.5, podeSubir: false });
	});
});

describe('marcos de clã', () => {
	it('lê atributos, limites, PT, PIC, perícias e jutsus', () => {
		expect(lerMarco('+1 INT; limite de INT +9', [])).toMatchObject({ atributos: { INT: 1 }, limites: { INT: 9 } });
		expect(lerMarco('+3 PT', [])).toMatchObject({ pt: 3 });
		expect(lerMarco('+1 em Rastreamento ou Percepção', [])).toMatchObject({ escolhaPericia: ['rastreamento', 'percepcao'] });
		expect(lerMarco('+1 em Investigação', [])).toMatchObject({ pericias: ['investigacao'] });
		expect(lerMarco('Kage Yose no Jutsu (Técnica do Puxão pela Sombra)', NARA)).toMatchObject({ jutsus: ['kage-yose-no-jutsu'] });
	});
});

describe('subir de nível', () => {
	it('passos dinâmicos: nível 5 tem 2º elemento e marco; nível 6 tem atributo e Rank B', () => {
		const f = hana();
		for (let n = 2; n <= 4; n++) f.progresso.niveis.push({ nivel: n, ...(n === 3 ? { atributo: 'AGI' as const } : {}), ...(n === 4 ? { pericia: 'taijutsu' as const, especializacao: { id: 'velocidade' } } : {}) });
		expect(planoNivel(f, 5, MARCOS, NARA).passos).toEqual(['recursos', 'elemento', 'marco', 'resumo']);
		expect(planoNivel(f, 6, MARCOS, NARA).passos).toEqual(['recursos', 'atributo', 'rank', 'resumo']);
	});
	it('aplica as escolhas e os ganhos de recursos', () => {
		const f = hana();
		const antes = recursos(f);
		const g = aplicarNivel(f, { nivel: 2, marco: lerMarco(MARCOS[0].texto, NARA) });
		expect(nivelDe(g)).toBe(2);
		const depois = recursos(g);
		expect([depois.pv - antes.pv, depois.pc - antes.pc, depois.pe - antes.pe]).toEqual([5, 3, 3]);
		const h = aplicarNivel(aplicarNivel(g, { nivel: 3, atributo: 'VIG' }), { nivel: 4, pericia: 'taijutsu' });
		expect(atributosTotais(h).VIG).toBe(2);
		expect(linhasPericia(h).find((p) => p.id === 'taijutsu')!.treino).toBe(1);
	});
	it('o atributo do clã só passa de +8 com o marco de limite', () => {
		const f = hana();
		f.atributos.INT = 4;
		for (let n = 2; n <= 5; n++) f.progresso.niveis.push({ nivel: n, marco: { texto: '+1 INT', atributos: { INT: 1 } } });
		expect(atributosTotais(f).INT).toBe(9);
		expect(atributosLivres(f)).not.toContain('INT');
	});
});

describe('custo dos jutsus (cap. 9)', () => {
	it('maior redução de especialização + proficiência, nunca abaixo da metade', () => {
		const f = hana();
		expect(custoJutsu(f, jutsu('kage-mane-no-jutsu', '8 PC', 8, 'Ninjutsu'))).toMatchObject({ final: 5, unidade: 'PC' });
		expect(custoJutsu(f, jutsu('hi-no-tama', '4 PC', 4, 'Ninjutsu')).final).toBe(2);
		expect(custoJutsu(f, jutsu('kai', '2 PC', 2, 'Genjutsu')).final).toBe(1);
	});
	it('Taijutsu em PE não reduz; Exausto soma 1', () => {
		const f = hana();
		expect(custoJutsu(f, jutsu('konoha-senpuu', '3 PE', 3, 'Taijutsu'), 2)).toMatchObject({ final: 4, unidade: 'PE' });
	});
});

describe('treino (cap. 18)', () => {
	it('libera por nível e aplica', () => {
		const f = hana();
		const ops = opcoesTreino(f, [jutsu('shunshin-no-jutsu', '4 PC', 4, 'Ninjutsu', 'D'), jutsu('chidori', '15 PC', 15, 'Ninjutsu', 'B', 'raiton')], (id) => id);
		const por = (k: string) => ops.find((o) => o.chave === k)!;
		expect(por('jutsu:shunshin-no-jutsu')).toMatchObject({ pt: 2, bloqueio: '' });
		expect(por('jutsu:chidori').bloqueio).toBe('Rank B exige nível 6');
		expect(por('esp:controle-chakra')).toMatchObject({ pt: 5, bloqueio: 'Exige nível 4' });
		expect(por('prof:jutsu:kage-mane-no-jutsu')).toMatchObject({ pt: 3 });
		expect(por('elem:katon')).toMatchObject({ pt: 10, bloqueio: 'Exige nível 5' });
		const g = aplicarTreinos(f, [por('jutsu:shunshin-no-jutsu').treino, por('prof:jutsu:kage-mane-no-jutsu').treino]);
		expect(custoJutsu(g, jutsu('shunshin-no-jutsu', '4 PC', 4, 'Ninjutsu')).final).toBe(2);
		expect(opcoesTreino(g, [], (id) => id).find((o) => o.chave === 'prof:jutsu:kage-mane-no-jutsu')!.nome).toMatch(/Experiente → Mestre/);
	});
});

describe('em jogo', () => {
	it('PV 0 derruba; −metade do máximo mata (cap. 4)', () => {
		const max = { pv: 25, pc: 47, pe: 25, pic: 4 };
		expect(estadoAtual({ pv: 0 }, max).situacao).toBe('caido');
		expect(estadoAtual({ pv: -12 }, max).situacao).toBe('morte');
		expect(estadoAtual(null, max)).toMatchObject({ pv: 25, pc: 47, pd: 1, pic: 4 });
	});
	it('descanso curto recupera ¼; longo recupera tudo e tira 1 Fadiga', () => {
		const max = { pv: 25, pc: 47, pe: 25 };
		const e = estadoAtual({ pv: 10, pc: 20, pe: 5, fadiga: 2 }, { ...max, pic: 0 });
		expect(descansar(e, max, 'curto')).toMatchObject({ pv: 16, pc: 31, pe: 11, fadiga: 2 });
		expect(descansar(e, max, 'longo')).toMatchObject({ pv: 25, pc: 47, pe: 25, fadiga: 1 });
	});
	it('PIC do clã e do background', () => {
		const f = hana();
		expect(picMaximo(f)).toBe(4);
		f.background.id = 'herdeiro';
		expect(picMaximo(f)).toBe(5);
	});
	it('inventário de partida do Pacote A', () => {
		const loja: ItemLoja[] = [
			{ id: 'arma-kunai', nome: 'Kunai', preco: 300, peso: 0.5, conjunto: 10, grupo: 'Armas · Distância', icone: '' },
			{ id: 'arma-shuriken', nome: 'Shuriken', preco: 200, peso: 0.5, conjunto: 10, grupo: 'Armas · Distância', icone: '' },
			{ id: 'item-papel-explosivo', nome: 'Papel Explosivo', preco: 1000, peso: 0, conjunto: 5, grupo: 'Itens utilitários', icone: '' },
			{ id: 'item-kit-medico-5-usos', nome: 'Kit médico (5 usos)', preco: 6000, peso: 0.5, grupo: 'Itens utilitários', icone: '' }
		];
		const inv = inventarioInicial(hana(), loja);
		expect(inv.map((i) => `${i.nome} ×${i.qtd}`)).toEqual(['Hitaiate ×1', 'Shuriken ×10', 'Kunai ×10', 'Papel Explosivo ×3', 'Kit médico (5 usos) ×1']);
		expect(cargaInventario(inv)).toBe(2);
	});
});
