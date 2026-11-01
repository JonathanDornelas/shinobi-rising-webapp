import { describe, expect, it } from 'vitest';
import { filtroVazio, opcoesFiltro, passa, type CamposJutsu } from './filtro.ts';

const katon: CamposJutsu = { nome: 'Katon: Gōkakyū no Jutsu', traducao: 'Bola de Fogo', tipo: 'Ninjutsu', rank: 'C', elemento: 'katon', efeito: 'Causa 3d8 de dano de fogo em área.', acao: 'Primária' };
const kawarimi: CamposJutsu = { nome: 'Kawarimi no Jutsu', tipo: 'Ninjutsu', rank: 'E', elemento: null, efeito: 'Troca de lugar com um objeto.', acao: 'Reação' };
const mokuton: CamposJutsu = { nome: 'Mokuton: Henge', tipo: 'Ninjutsu', rank: 'D', elemento: 'mokuton', efeito: 'RD 2 enquanto sustentado.', acao: 'Secundária', bloqueado: true };

describe('filtro das listas de jutsus', () => {
	it('sem filtro, passa tudo', () => {
		expect([katon, kawarimi, mokuton].filter((c) => passa(filtroVazio(), c))).toHaveLength(3);
	});

	it('busca sem acento no nome, na tradução e no efeito', () => {
		expect(passa({ ...filtroVazio(), busca: 'gokakyu' }, katon)).toBe(true);
		expect(passa({ ...filtroVazio(), busca: 'bola de fogo' }, katon)).toBe(true);
		expect(passa({ ...filtroVazio(), busca: 'objeto' }, kawarimi)).toBe(true);
		expect(passa({ ...filtroVazio(), busca: 'objeto' }, katon)).toBe(false);
	});

	it('elemento, rank, ação e só os disponíveis', () => {
		expect(passa({ ...filtroVazio(), elemento: '-' }, kawarimi)).toBe(true);
		expect(passa({ ...filtroVazio(), elemento: '-' }, katon)).toBe(false);
		expect(passa({ ...filtroVazio(), rank: 'C' }, katon)).toBe(true);
		expect(passa({ ...filtroVazio(), acao: 'Reação' }, kawarimi)).toBe(true);
		expect(passa({ ...filtroVazio(), soDisponiveis: true }, mokuton)).toBe(false);
	});

	it('as escolhas vêm só do que está na lista', () => {
		const o = opcoesFiltro([katon, kawarimi, mokuton]);
		expect(o.ranks).toEqual(['E', 'D', 'C']);
		expect(o.elementos.sort()).toEqual(['-', 'katon', 'mokuton']);
		expect(o.acoes).toEqual(['Primária', 'Secundária', 'Reação']);
		expect(o.temBloqueados).toBe(true);
	});
});
