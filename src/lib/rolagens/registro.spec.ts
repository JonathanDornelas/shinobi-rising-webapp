import { describe, expect, it } from 'vitest';
import type { Rolagem } from '#lib/supabase/banco.ts';
import { diasAtras, doTipo, iniciaisQuem, marcas, noPeriodo, ordemIniciativa, separadorDia } from './registro.ts';

const agora = new Date(2026, 9, 19, 21, 15);
const r = (x: Partial<Rolagem>): Rolagem =>
	({ id: Math.random().toString(), campanha_id: 'k', autor_id: 'a', personagem_id: null, npc_id: null, quem: '?', jogador: null, rotulo: '', expressao: '1d20', modo: 'normal', detalhe: [], total: 0, d20: null, oculta: false, criada_em: agora.toISOString(), tipo: 'livre', origem: null, partes: [], pd: null, anterior_total: null, substituida: false, ...x }) as Rolagem;

describe('registro de rolagens', () => {
	it('separa os dias como no design', () => {
		expect(separadorDia(new Date(2026, 9, 19, 8), agora)).toBe('HOJE · 19 OUT.');
		expect(separadorDia(new Date(2026, 9, 18, 23), agora)).toBe('ONTEM · 18 OUT.');
		expect(separadorDia(new Date(2026, 9, 16, 19), agora)).toBe('SEXTA · 16 OUT. 2026');
		expect(diasAtras(new Date(2026, 8, 30), agora)).toBe(19);
	});

	it('filtra por período e tipo', () => {
		const ontem = r({ criada_em: new Date(2026, 9, 18, 22).toISOString(), tipo: 'save' });
		expect(noPeriodo(ontem, 'hoje', '', '', agora)).toBe(false);
		expect(noPeriodo(ontem, 'ontem', '', '', agora)).toBe(true);
		expect(noPeriodo(ontem, 'd7', '', '', agora)).toBe(true);
		expect(noPeriodo(ontem, 'intervalo', '2026-10-19', '', agora)).toBe(false);
		expect(noPeriodo(ontem, 'intervalo', '2026-10-01', '2026-10-18', agora)).toBe(true);
		expect(doTipo(ontem, 'testes')).toBe(true);
		expect(doTipo(ontem, 'ataques')).toBe(false);
		expect(doTipo(ontem, 'todas')).toBe(true);
	});

	it('marca crítico, falha e PD', () => {
		expect(marcas({ d20: 20, pd: null })).toEqual(['critico']);
		expect(marcas({ d20: 1, pd: 'mais5' })).toEqual(['falha', 'pd']);
		expect(iniciaisQuem('Ren Uchiha')).toBe('RU');
		expect(iniciaisQuem('Kaito')).toBe('K');
	});

	it('monta a ordem de iniciativa pela última rolagem de cada um', () => {
		const min = (m: number) => new Date(agora.getTime() - m * 60000).toISOString();
		const rs = [
			r({ tipo: 'iniciativa', personagem_id: 'ren', quem: 'Ren', total: 19, criada_em: min(10) }),
			r({ tipo: 'iniciativa', personagem_id: 'ren', quem: 'Ren', total: 5, criada_em: min(500) }),
			r({ tipo: 'iniciativa', personagem_id: 'hana', quem: 'Hana', total: 14, criada_em: min(9) }),
			r({ tipo: 'iniciativa', npc_id: 'n1', quem: 'Ninja da Névoa', total: 12, criada_em: min(8) }),
			r({ tipo: 'teste', personagem_id: 'sora', quem: 'Sora', total: 20, criada_em: min(7) }),
			r({ tipo: 'iniciativa', campanha_id: 'outra', quem: 'X', total: 30, criada_em: min(5) })
		];
		expect(ordemIniciativa(rs, 'k', 6, agora).map((o) => `${o.quem} ${o.total}`)).toEqual(['Ren 19', 'Hana 14', 'Ninja da Névoa 12']);
		// limpar a ordem: só contam as rolagens feitas depois
		expect(ordemIniciativa(rs, 'k', 6, agora, agora.toISOString())).toEqual([]);
	});
});
