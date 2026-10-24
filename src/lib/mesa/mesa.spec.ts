import { describe, expect, it } from 'vitest';
import jutsus from '#lib/livro/gerado/jutsus.json';
import bestiario from '#lib/livro/gerado/bestiario.json';
import type { Criatura } from '#lib/livro/tipos.ts';
import { TAMANHOS } from '#lib/bestiario/npc.ts';
import { alcanceCorpo, distancia, distanciaEntre, infoMovimento, moldeDirecional, moldeParede, naArea, provocaReacao, quadradosEsfera, trechos } from './geometria.ts';
import { modosDaArma, nomeDoModo } from './armas.ts';
import { molduraDoToken } from './molduras.ts';
import { habilidadeDoTraco } from './habilidades.ts';
import type { Mesa } from './mesa.svelte.ts';
import type { JutsuMesa } from './tipos.ts';
import { calcularMolde, type Mira } from './ui.svelte.ts';
import type { MesaToken } from '#lib/supabase/banco.ts';
import { duracaoEmTurnos, lerAlcance, lerArea, reguaDoCard, tamanhoDoEfeito, temRegua } from './regua.ts';

describe('distância no quadro (cap. 4)', () => {
	it('diagonais alternam 1 m e 2 m', () => {
		expect(distancia(0, 0, 4, 4)).toBe(6);
		expect(distancia(0, 0, 1, 1)).toBe(1);
		expect(distancia(0, 0, 10, 0)).toBe(10);
		expect(distancia(8, 15, 22, 14)).toBe(14);
		expect(trechos([[0, 0], [5, 0], [5, 7]])).toEqual([5, 7]);
	});

	it('tokens grandes medem do quadrado mais próximo', () => {
		expect(distanciaEntre({ x: 0, y: 0, tamanho: 3 }, { x: 3, y: 1, tamanho: 1 })).toBe(1);
		expect(distanciaEntre({ x: 0, y: 0, tamanho: 1 }, { x: 0, y: 0, tamanho: 1 })).toBe(0);
	});
});

describe('moldes de área', () => {
	it('esfera de 3 m: 7 quadrados de lado a lado, cortada na borda da cena', () => {
		const q = quadradosEsfera(10, 10, 3, 40, 30);
		expect(Math.max(...q.map((p) => p[0])) - Math.min(...q.map((p) => p[0])) + 1).toBe(7);
		expect(quadradosEsfera(0, 0, 3, 40, 30).every(([x, y]) => x >= 0 && y >= 0)).toBe(true);
	});

	it('a esfera do Goukakyu em V14 pega Hideo e dois bandidos, não os outros (seção 7)', () => {
		const q = quadradosEsfera(21, 13, 3, 40, 30);
		const em = (x: number, y: number) => naArea({ x, y, tamanho: 1 }, q);
		expect([em(21, 13), em(20, 10), em(22, 12)]).toEqual([true, true, true]);
		expect([em(20, 17), em(24, 15)]).toEqual([false, false]);
	});

	it('linha de 1 m de largura e cone com a ponta tão larga quanto o comprimento', () => {
		const linha = moldeDirecional('linha', { x: 5, y: 5, tamanho: 1 }, 10, 0, 40, 30).quadrados;
		expect(linha).toHaveLength(10);
		expect(linha.every(([, y]) => y === 5)).toBe(true);
		const cone = moldeDirecional('cone', { x: 5, y: 5, tamanho: 1 }, 10, 0, 40, 30).quadrados;
		const ponta = cone.filter(([x]) => x === 15).length;
		expect(ponta).toBeGreaterThanOrEqual(9);
		expect(ponta).toBeLessThanOrEqual(11);
	});

	it('parede de 3 m gira em passos de 45°', () => {
		expect(moldeParede(10, 10, 3, 0, 40, 30).quadrados.sort()).toEqual([[10, 10], [11, 10], [9, 10]].sort());
		expect(moldeParede(10, 10, 3, 2, 40, 30).quadrados.every(([x]) => x === 10)).toBe(true);
	});
});

describe('movimento', () => {
	it('dentro do Deslocamento, no sprint e além do limite', () => {
		expect(infoMovimento(7, 0, 10)).toMatchObject({ faixa: 'normal', texto: '7 m · sobram 3 m' });
		expect(infoMovimento(8, 6, 10)).toMatchObject({ faixa: 'sprint', texto: '14 m · Sprint: +20 m' });
		expect(infoMovimento(34, 0, 10)).toMatchObject({ faixa: 'alem', texto: '4 m além do limite' });
	});

	it('sair de perto de um inimigo provoca golpe de oportunidade', () => {
		const hideo = { x: 11, y: 10, tamanho: 1, nome: 'Hideo' };
		expect(provocaReacao({ x: 10, y: 10, tamanho: 1 }, { x: 7, y: 10, tamanho: 1 }, [hideo])).toEqual([hideo]);
		expect(provocaReacao({ x: 10, y: 10, tamanho: 1 }, { x: 10, y: 11, tamanho: 1 }, [hideo])).toEqual([]);
	});
});

describe('régua de jutsu: o card vira régua', () => {
	it('alcances e áreas do cap. 20', () => {
		expect(lerAlcance('Médio (30m)')).toEqual({ alcance: 30, rotuloAlcance: 'Médio · 30 m' });
		expect(lerAlcance('Toque')).toMatchObject({ alcance: 1 });
		expect(lerAlcance('Curto (arremesso até 15m)')).toMatchObject({ alcance: 15 });
		expect(lerAlcance('Qualquer marca do usuário').alcance).toBeNull();
		expect(lerArea('Esfera 3m')).toMatchObject({ forma: 'esfera', n: 3 });
		expect(lerArea('Esfera 15m em torno de si')).toMatchObject({ forma: 'esfera', n: 15, emSi: true });
		expect(lerArea('Cone médio / Linha 30m')).toMatchObject({ forma: 'cone-linha', cone: 10, linha: 30 });
		expect(lerArea('Cone pequeno')).toMatchObject({ forma: 'cone', n: 3 });
		expect(lerArea('Parede de 3m × 3m')).toMatchObject({ forma: 'parede', n: 3 });
		expect(lerArea('Alvo único +2')).toMatchObject({ forma: 'alvos', alvos: 3 });
		expect(lerArea('Alvo único (+2 PC por alvo adicional, máx. 3)')).toMatchObject({ forma: 'alvos', alvos: 3 });
		expect(lerArea('Até 3 alvos')).toMatchObject({ forma: 'alvos', alvos: 3 });
		expect(lerArea('Massiva (100m)')).toMatchObject({ forma: 'cena' });
		expect(duracaoEmTurnos('3 turnos')).toBe(3);
		expect(duracaoEmTurnos('1 cena')).toBeNull();
		expect(duracaoEmTurnos('Instantâneo')).toBeUndefined();
	});

	it('mais de 95% dos jutsus do catálogo têm alcance que vira régua', () => {
		const lista = jutsus as { slug: string; info: { k: string; v: string }[] }[];
		const comAlcance = lista.filter((j) => reguaDoCard(j.info).alcance != null);
		expect(comAlcance.length / lista.length).toBeGreaterThan(0.95);
		expect(temRegua(reguaDoCard(lista.find((j) => j.slug === 'goukakyu-no-jutsu')!.info))).toBe(true);
		expect(temRegua(reguaDoCard(lista.find((j) => j.slug === 'hiraishin-no-jutsu')!.info))).toBe(false);
	});
});

describe('tamanho e habilidades do bestiário', () => {
	it('alcance corpo a corpo pelo tamanho e golpe de oportunidade de uma criatura Colossal (cap. 4)', () => {
		expect([alcanceCorpo(1), alcanceCorpo(3), alcanceCorpo(6), alcanceCorpo(10)]).toEqual([1, 1, 2, 3]);
		const kurama = { x: 10, y: 10, tamanho: 10 };
		// a 3 m do espaço dela ainda está no alcance; sair para 4 m provoca a Reação
		expect(provocaReacao({ x: 22, y: 12, tamanho: 1 }, { x: 23, y: 12, tamanho: 1 }, [kurama])).toEqual([kurama]);
		expect(provocaReacao({ x: 21, y: 12, tamanho: 1 }, { x: 22, y: 12, tamanho: 1 }, [kurama])).toEqual([]);
	});

	it('a Bijūdama e o Rugido da Kurama viram habilidades com régua e rolagem', () => {
		const c = (bestiario as unknown as { criaturas: Criatura[] }).criaturas.find((x) => x.slug === 'bestas-com-cauda')!;
		const e = c.estagios.find((s) => /kurama/i.test(s.nome))!;
		expect(TAMANHOS[e.tamanho].espaco).toBe(10);
		const texto = (n: string) => e.combate.tracos.find((t) => t.nome === n)!.efeito.map((t) => t.t).join('');
		const bijuudama = habilidadeDoTraco('Bijūdama', texto('Bijūdama'), e.combate.dt, e.combate.ataques[0].dano);
		expect(bijuudama).toMatchObject({ porCena: true, resistencia: 'Resistência de Acrobacia, DT 23', dano: { expr: '10d10' } });
		expect(bijuudama.regua).toMatchObject({ forma: 'esfera', n: 20, alcance: 30 });
		expect(temRegua(bijuudama.regua)).toBe(true);
		const rugido = habilidadeDoTraco('Rugido', texto('Rugido'), e.combate.dt, null);
		expect(rugido).toMatchObject({ porCena: true, resistencia: 'Resistência de ESP, DT 23', dano: null });
		const sentir = habilidadeDoTraco('Sentir o ódio', texto('Sentir o ódio'), e.combate.dt, null);
		expect(temRegua(sentir.regua)).toBe(false);
		expect(habilidadeDoTraco('Agulhas', 'Uma vez por cena, solta agulhas em volta de si: cada um a até 3 m faz uma Resistência de Acrobacia contra a DT 14 ou sofre 2d6 de dano.', 14, null).regua).toMatchObject({ forma: 'esfera', n: 3, emSi: true, alcance: 0 });
	});
});

describe('régua de jutsu: o molde inteiro, de qualquer tamanho', () => {
	const tok = (id: string, x: number, y: number, tamanho = 1) => ({ id, x, y, tamanho, visivel: true }) as unknown as MesaToken;
	const kurama = tok('kurama', 2, 2, 10);
	const alvos = [tok('perto', 40, 20), tok('na-borda', 52, 14), tok('longe', 75, 20)];
	const mesaFalsa = { tokens: [kurama, ...alvos], cena: { largura: 100, largura_: 0, altura: 60 } } as unknown as Mesa;
	const mira = (j: Partial<JutsuMesa> & Pick<JutsuMesa, 'regua'>, tx: number, ty: number): Mira => ({
		jutsu: { slug: 'x', nome: 'X', rank: '', custo: 0, unidade: 'PC', alcance: '', area: '', resistencia: null, ataque: null, dano: null, cura: null, ...j } as JutsuMesa,
		lancador: 'kurama',
		tx,
		ty,
		px: tx + 0.5,
		py: ty + 0.5,
		fixa: true,
		alvos: [],
		forma: 'cone',
		giro: 0,
		travar: false
	});

	it('a esfera de 20 m da Bijūdama pega mais de mil quadrados e quem está dentro', () => {
		const m = calcularMolde(mira({ regua: { alcance: 30, rotuloAlcance: 'Médio · 30 m', forma: 'esfera', n: 20 } }, 36, 12), mesaFalsa, [kurama, ...alvos])!;
		expect(m.forma).toBe('esfera');
		expect(m.quadrados.length).toBeGreaterThan(1000);
		expect(m.quem.map((t) => t.id)).toEqual(['perto', 'na-borda']);
		expect(m.ok).toBe(true);
	});

	it('esfera de 15 m, cone, linha, parede, alvos e a cena inteira', () => {
		const esfera15 = calcularMolde(mira({ regua: { alcance: 30, rotuloAlcance: '', forma: 'esfera', n: 15 } }, 30, 20), mesaFalsa, [kurama, ...alvos])!;
		expect(esfera15.quadrados.length).toBeGreaterThan(600);
		const cone = calcularMolde(mira({ regua: { alcance: 0, rotuloAlcance: '', forma: 'cone', n: 10 } }, 20, 7), mesaFalsa, [kurama])!;
		expect(cone.quadrados.length).toBeGreaterThan(40);
		const linha = calcularMolde({ ...mira({ regua: { alcance: 0, rotuloAlcance: '', forma: 'cone-linha', n: 10, cone: 10, linha: 30 } }, 40, 7), forma: 'linha' }, mesaFalsa, [kurama])!;
		expect(linha.forma).toBe('linha');
		expect(linha.quadrados.length).toBeGreaterThanOrEqual(28);
		const parede = calcularMolde(mira({ regua: { alcance: 10, rotuloAlcance: '', forma: 'parede', n: 3 } }, 15, 5), mesaFalsa, [kurama])!;
		expect(parede.quadrados).toHaveLength(3);
		const um = calcularMolde({ ...mira({ regua: { alcance: 60, rotuloAlcance: '', forma: 'alvos', n: 0, alvos: 3 } }, 40, 20), alvos: ['perto'] }, mesaFalsa, [kurama, ...alvos])!;
		expect(um.quem.map((t) => t.id)).toEqual(['perto']);
		const cena = calcularMolde(mira({ regua: { alcance: 0, rotuloAlcance: '', forma: 'cena', n: 0 } }, 0, 0), mesaFalsa, [kurama, ...alvos])!;
		expect(cena.quem).toHaveLength(3);
	});
});

describe('modos das armas (cap. 12)', () => {
	const modos = (a: string, p: string[] = []) => modosDaArma(a, p).map((m) => m.rotulo);
	it('a Kunai (Curto / corpo a corpo, Versátil) golpeia e é arremessada', () => {
		const k = modosDaArma('Curto / corpo a corpo', ['Versátil', 'Rajada']);
		expect(k.map((m) => [m.m, m.distancia])).toEqual([
			[1, false],
			[10, true]
		]);
		expect(k.map((m) => nomeDoModo('Kunai', m, k, true))).toEqual(['Kunai', 'Kunai (arremesso)']);
	});
	it('a Versátil só corpo a corpo também arremessa a Curto (Sai)', () => {
		expect(modos('Corpo a corpo', ['Versátil', 'Discreta', 'Leve'])).toEqual(['Corpo a corpo', 'Curto 10 m']);
	});
	it('alcance duplo sem Versátil fica à distância (Kusarigama)', () => {
		const k = modosDaArma('Corpo a corpo / curto', ['Desarmante']);
		expect(k.map((m) => nomeDoModo('Kusarigama', m, k, false))).toEqual(['Kusarigama', 'Kusarigama (à distância)']);
	});
	it('armas de um modo só não mudam', () => {
		expect(modos('Curto', ['Rajada', 'Descartável'])).toEqual(['Curto 10 m']);
		expect(modos('Médio', ['Descartável', 'Pesada'])).toEqual(['Médio 30 m']);
		expect(modos('Haste (2 m)', ['Varredura'])).toEqual(['Haste 2 m']);
		expect(modos('Corpo a corpo', ['Afiada'])).toEqual(['Corpo a corpo']);
		expect(modos('')).toEqual(['Corpo a corpo']);
	});
});

describe('moldura do token', () => {
	const jogador = (moldura: string | null) => ({ papel: 'jogador', moldura });
	it('sem universal: o jogador que escolheu fica com a dele; NPCs e quem não escolheu, com a da mesa', () => {
		const mesa = { id: 'katon', universal: false };
		expect(molduraDoToken(mesa, jogador('kunai'))?.id).toBe('kunai');
		expect(molduraDoToken(mesa, jogador(null))?.id).toBe('katon');
		expect(molduraDoToken(mesa, null)?.id).toBe('katon');
		expect(molduraDoToken(mesa, { papel: 'mestre', moldura: 'selo' })?.id).toBe('katon');
	});
	it('universal: todos os tokens usam a da mesa', () => {
		expect(molduraDoToken({ id: 'katon', universal: true }, jogador('kunai'))?.id).toBe('katon');
	});
	it('sem moldura da mesa: só quem escolheu tem; id desconhecido não vira imagem', () => {
		expect(molduraDoToken({ id: null, universal: true }, jogador('kunai'))?.id).toBe('kunai');
		expect(molduraDoToken({ id: null, universal: false }, null)).toBeNull();
		expect(molduraDoToken({ id: '../x', universal: true }, jogador('nada'))).toBeNull();
	});
});

describe('técnicas de crescer (cap. 4, Tamanho e Espaço)', () => {
	const efeito = (slug: string) => ((jutsus as { slug: string; efeito: { t: string }[] }[]).find((j) => j.slug === slug)?.efeito ?? []).map((t) => t.t).join('');
	it('Baika e o Lobo de Duas Cabeças ficam Grandes; Chou Baika e o de Três Cabeças, Enormes', () => {
		expect(tamanhoDoEfeito(efeito('baika-no-jutsu'))).toBe(3);
		expect(tamanhoDoEfeito(efeito('chou-baika-no-jutsu'))).toBe(6);
		expect(tamanhoDoEfeito(efeito('jinjuu-konbi-henge-soutourou'))).toBe(3);
		expect(tamanhoDoEfeito(efeito('jinjuu-kongou-henge-santourou'))).toBe(6);
		expect(tamanhoDoEfeito(efeito('bubun-baika-no-jutsu'))).toBeUndefined();
	});
	it('nenhum outro jutsu muda o tamanho', () => {
		const comTamanho = (jutsus as { slug: string; efeito: { t: string }[] }[]).filter((j) => tamanhoDoEfeito((j.efeito ?? []).map((t) => t.t).join('')));
		expect(comTamanho.map((j) => j.slug).sort()).toEqual(['baika-no-jutsu', 'chou-baika-no-jutsu', 'jinjuu-konbi-henge-soutourou', 'jinjuu-kongou-henge-santourou']);
	});
});
