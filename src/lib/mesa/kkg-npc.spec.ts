import { describe, expect, it } from 'vitest';
import bestiario from '#lib/livro/gerado/bestiario.json';
import type { Criatura } from '#lib/livro/tipos.ts';
import { custoKkg } from '#lib/personagem/kkg.ts';
import { kkgDoVerbete, kkgLigadaNoToken, semKkg } from './kkg-npc.ts';

const CRIATURAS = (bestiario as unknown as { criaturas: Criatura[] }).criaturas;

describe('KKG do NPC do bestiário', () => {
	it('Uchiha: o Sharingan sobe de tomoe com a ameaça, e o marco do nível 8 tira 1 PC', () => {
		const uchiha = CRIATURAS.find((c) => c.slug === 'cla-uchiha')!;
		const k = (est: string) => kkgDoVerbete('cla-uchiha', uchiha.estagios.find((e) => e.slug === est)!.ameaca)!;
		expect(k('genin')).toMatchObject({ estagio: 1 });
		expect(k('chunin')).toMatchObject({ estagio: 2 });
		expect(custoKkg(k('chunin').def, k('chunin').nivel, 2).custo).toBe(5);
		expect(k('jounin').estagio).toBe(3);
		expect(custoKkg(k('jounin').def, k('jounin').nivel, 3).custo).toBe(5);
	});

	it('toda família de clã com KKG oficial ganha a dela; os especialistas de Hyōton e Jiton também', () => {
		const com = CRIATURAS.filter((c) => kkgDoVerbete(c.slug, c.estagios[0].ameaca)).map((c) => c.slug).sort();
		expect(com).toEqual(['cla-hozuki', 'cla-hyuuga', 'cla-kaguya', 'cla-sabaku', 'cla-uchiha', 'cla-yuki', 'especialista-hyoton', 'especialista-jiton']);
		expect(kkgDoVerbete('cla-hyuuga', 3)!.def.nome).toBe('Byakugan');
		expect(kkgDoVerbete('especialista-hyoton', 6)!.def.sempre).toBe(true);
		expect(kkgDoVerbete('cla-senju', 6)).toBeNull();
	});

	it('ligada, fica nos estados do token, fora da lista de condições', () => {
		expect(kkgLigadaNoToken(['atordoado', 'kkg'])).toBe(true);
		expect(semKkg(['atordoado', 'kkg'])).toEqual(['atordoado']);
	});
});
