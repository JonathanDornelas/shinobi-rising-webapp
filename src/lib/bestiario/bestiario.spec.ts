import { describe, expect, it } from 'vitest';
import bestiarioJson from '#lib/livro/gerado/bestiario.json';
import type { Bestiario, Bloco, Celula, Criatura, EstagioCriatura } from '#lib/livro/tipos.ts';
import { ataqueNpc } from '#lib/npcs/gerador.ts';
import { RANKS_NPC, TAGS_NPC } from '#lib/npcs/dados.ts';
import { PERFIS } from './ficha.ts';
import { npcDoVerbete } from './npc.ts';

const { comoUsar, criaturas } = bestiarioJson as Bestiario;

// a tabela "Números por ameaça" do Como usar, lida do próprio livro compilado
const tabela = comoUsar.blocos.find((b): b is Bloco & { tipo: 'tabela' } => b.tipo === 'tabela' && b.titulo === 'Números por ameaça')!;
const cel = (c: Celula) => c.map((p) => p.map((t) => t.t).join('')).join(' ').trim();
const linhas = tabela.linhas.map((l) => l.map(cel));
const ordem = linhas.map((l) => l[0]);
const linha = (rotulo: string, abaixo = 0) => {
	const l = linhas[Math.max(0, ordem.indexOf(rotulo) - abaixo)];
	return { pv: +l[1], pc: +l[2], defesa: +l[3], ataque: +l[4].replace('+', ''), dano: l[5].replace(/\s+/g, ''), dt: +l[6], iniciativa: +l[7].replace('+', '') };
};
const estagios = criaturas.flatMap((c) => c.estagios.map((e) => [c, e] as [Criatura, EstagioCriatura]));
// as invocações usam a ficha do cap. 14, não a tabela
const daTabela = estagios.filter(([c]) => c.tipo !== 'invocação');

describe('bestiário', () => {
	it('tem a tabela de ameaça completa, de 1/4 a 20', () => {
		expect(ordem).toEqual(['1/4', '1/2', ...Array.from({ length: 20 }, (_, i) => String(i + 1))]);
	});

	it('os ranks da ficha resumida (cap. 23.2) caem nas ameaças que o Como usar promete', () => {
		const pv = Object.fromEntries(RANKS_NPC.map((r) => [r.id, r.pv]));
		expect([linha('1').pv, linha('4').pv, linha('7').pv, linha('9').pv, linha('13').pv]).toEqual([pv.genin, pv.chunin, pv.jounin, pv.anbu, pv.lendario]);
	});

	it('está em ordem alfabética, sem slugs repetidos', () => {
		const nomes = criaturas.map((c) => c.nome);
		expect(nomes).toEqual([...nomes].sort((a, b) => a.localeCompare(b, 'pt')));
		expect(new Set(criaturas.map((c) => c.slug)).size).toBe(criaturas.length);
	});

	it.each(daTabela.map(([c, e]) => [`${c.slug} · ${e.nome}`, e] as const))('%s segue a linha da ameaça, o papel e o perfil', (_, e) => {
		const l = linha(e.ameacaRotulo);
		const fatorPv = e.papel === 'lutador' ? 1.25 : e.papel === 'atirador' || e.papel === 'assassino' ? 0.75 : e.papel === 'chefe' ? 2 : 1;
		const bonus = e.papel === 'atirador' ? 1 : e.papel === 'assassino' ? 2 : 0;
		const dano = e.papel === 'controlador' || e.papel === 'suporte' ? linha(e.ameacaRotulo, 2).dano : l.dano;
		const perfil = PERFIS[e.perfil!];
		expect(perfil, 'perfil').toBeDefined();
		expect(e.combate.pv).toBe(Math.round(l.pv * fatorPv * perfil.pv));
		// sem chakra (pc 0 ou null) só quem não tem treino ninja: bandidos e feras
		if (e.combate.pc) expect(e.combate.pc).toBe(Math.round(l.pc * perfil.pc));
		// PE pela conta do cap. 6: 20 + 5 por ponto de VIG + 3 por nível depois do 1º (a ameaça faz o papel do nível)
		const vig = e.combate.ficha.atributos.vig;
		expect(e.combate.pe).toBe(20 + 5 * Math.max(0, vig) + 3 * Math.max(0, Math.floor(e.ameaca) - 1));
		expect(e.combate.defesa).toBe(l.defesa);
		expect(e.combate.iniciativa).toBe(l.iniciativa);
		expect(e.combate.dt).toBe(l.dt + (e.papel === 'controlador' ? 1 : 0));
		expect(e.combate.ataques[0].acerto).toBe(l.ataque + bonus);
		expect(e.combate.ataques[0].dano).toBe(dano);
	});

	it('as invocações seguem as fichas do cap. 14, na ameaça que o Como usar dá a cada tamanho', () => {
		const ficha: Record<number, { pv: number; defesa: number }> = { 2: { pv: 20, defesa: 13 }, 5: { pv: 50, defesa: 16 }, 10: { pv: 100, defesa: 18 }, 16: { pv: 200, defesa: 22 } };
		for (const [c, e] of estagios.filter(([c]) => c.tipo === 'invocação')) {
			expect(ficha[e.ameaca], `${c.slug} · ${e.nome}`).toBeDefined();
			expect([e.combate.pv, e.combate.defesa]).toEqual([ficha[e.ameaca].pv, ficha[e.ameaca].defesa]);
			expect(e.combate.pe, 'a ficha do cap. 14 não tem PE').toBeNull();
		}
	});

	it('cada variação é uma ficha separada, com âncora e arte próprias', () => {
		for (const c of criaturas.filter((c) => c.estagios.length > 1)) {
			expect(new Set(c.estagios.map((e) => e.slug)).size, c.slug).toBe(c.estagios.length);
			for (const e of c.estagios) expect(e.arte?.arquivo === null || e.arte?.arquivo === `/bestiario/${c.slug}--${e.slug}.png`, `${c.slug}#${e.slug}`).toBe(true);
		}
	});

	it('nenhuma ficha repete jutsu, ataque ou traço com o mesmo nome (a página quebra no navegador)', () => {
		const repetidos = (nomes: string[]) => nomes.filter((n, i) => nomes.indexOf(n) !== i);
		for (const c of criaturas)
			for (const e of c.estagios) {
				const k = e.combate;
				expect(repetidos(k.jutsus.map((j) => j.nome)), `${c.slug}#${e.slug} jutsus`).toEqual([]);
				expect(repetidos(k.ataques.map((a) => a.nome)), `${c.slug}#${e.slug} ataques`).toEqual([]);
				expect(repetidos(k.tracos.map((t) => t.nome)), `${c.slug}#${e.slug} traços`).toEqual([]);
			}
	});

	it('os animais do bestiário são todos invocações (cap. 14)', () => {
		expect(criaturas.filter((c) => c.tipo === 'fauna').map((c) => c.slug)).toEqual([]);
	});

	it('jutsus respeitam o rank liberado pela ameaça (B a partir de 6, A de 11, S de 15)', () => {
		const minimo = { E: 0, D: 0, C: 0, B: 6, A: 11, S: 15 } as const;
		for (const [c, e] of daTabela) for (const j of e.combate.jutsus) if (j.rank) expect(e.ameaca, `${c.slug}: ${j.nome}`).toBeGreaterThanOrEqual(minimo[j.rank]);
	});

	it('cada estágio vira um NPC que cabe na tabela npcs e que a ficha resumida sabe rolar', () => {
		const tags = TAGS_NPC.map((t) => t.id as string);
		for (const c of criaturas)
			c.estagios.forEach((e, i) => {
				const n = npcDoVerbete(c, i);
				expect(n.nome.length).toBeLessThanOrEqual(60);
				expect(n.funcao.length).toBeLessThanOrEqual(120);
				expect(n.aparencia.length).toBeLessThanOrEqual(300);
				expect(n.especial.length).toBeLessThanOrEqual(300);
				expect(n.notas.length).toBeLessThanOrEqual(2000);
				expect(n.tags.every((t) => tags.includes(t)), c.slug).toBe(true);
				expect([n.pv, n.rank]).toEqual([e.combate.pv, e.rank]);
				const a = ataqueNpc(n.ataque);
				expect(a.acerto).toBe(`1d20+${e.combate.ataques[0].acerto}`);
				expect(a.dano).toBe(e.combate.ataques[0].dano);
			});
	});

	it('atributos, perícias e proficiências fecham com o acerto, a Defesa e a Iniciativa (cap. 3 e 4)', () => {
		for (const [c, e] of estagios) {
			const k = e.combate;
			const f = k.ficha;
			const nome = `${c.slug} · ${e.nome}`;
			// atributos de -2 a +10 (o teto do atributo de clã); AGI é a Iniciativa
			for (const v of Object.values(f.atributos)) expect(v, nome).toBeGreaterThanOrEqual(-2), expect(v, nome).toBeLessThanOrEqual(10);
			expect(f.atributos.agi, nome).toBe(k.iniciativa);
			// a perícia do ataque principal + a proficiência na arma = o acerto
			const arma = f.proficiencias.find((p) => !p.jutsu)?.bonus ?? 0;
			expect(f.pericias[0].total + arma, nome).toBe(k.ataques[0].acerto);
			// Acrobacia = Defesa − 10 (nas feras de couraça, menos que isso)
			expect(f.pericias.find((p) => p.id === 'acrobacia')!.total, nome).toBeLessThanOrEqual(k.defesa - 10);
			// poucas: até 4 perícias, 2 especializações e 2 proficiências (de Familiar a Lendário)
			expect(f.pericias.length, nome).toBeLessThanOrEqual(4);
			expect(f.especializacoes.length, nome).toBeLessThanOrEqual(2);
			expect(f.proficiencias.length, nome).toBeLessThanOrEqual(2);
			for (const p of f.proficiencias) expect(p.bonus, nome).toBeGreaterThanOrEqual(1), expect(p.bonus, nome).toBeLessThanOrEqual(5);
			for (const s of f.especializacoes) expect(s.ancora, nome).toMatch(/^especializacao-/);
		}
	});
});
