// L11 · Mesa: a cor de cada membro marca o anel do token, o traço do lápis, a régua e o avatar online, sempre com o
// nome junto. Os valores dos dois temas ficam em layout.css (--mesa-<id>). O azul do PC e o ouro do PE/PD ficaram de
// fora, para um traço não parecer barra de recurso.
import type { CorMesa, Papel } from '#lib/supabase/banco.ts';

export const CORES: { id: CorMesa; nome: string }[] = [
	{ id: 'vermelhao', nome: 'Vermelhão' },
	{ id: 'anil', nome: 'Anil' },
	{ id: 'ameixa', nome: 'Ameixa' },
	{ id: 'sakura', nome: 'Sakura' },
	{ id: 'siena', nome: 'Siena' },
	{ id: 'mostarda', nome: 'Mostarda' },
	{ id: 'musgo', nome: 'Musgo' },
	{ id: 'petroleo', nome: 'Petróleo' },
	{ id: 'ardosia', nome: 'Ardósia' }
];

export const corCss = (c: CorMesa | null | undefined) => (c ? `var(--mesa-${c})` : 'var(--mut)');
export const nomeCor = (c: CorMesa | null | undefined) => CORES.find((x) => x.id === c)?.nome ?? '';

/** Cor de cada membro: a escolhida; sem escolha, o Mestre fica com o vermelhão e os outros com a primeira livre. */
export function coresDosMembros(membros: { id: string; papel: Papel; cor: CorMesa | null }[]) {
	const mapa = new Map<string, CorMesa>();
	const usadas = new Set(membros.map((m) => m.cor).filter((c): c is CorMesa => !!c));
	for (const m of membros) if (m.cor) mapa.set(m.id, m.cor);
	const mestre = membros.find((m) => m.papel === 'mestre' && !m.cor);
	if (mestre && !usadas.has('vermelhao')) {
		mapa.set(mestre.id, 'vermelhao');
		usadas.add('vermelhao');
	}
	for (const m of membros) {
		if (mapa.has(m.id)) continue;
		const livre = CORES.find((c) => c.id !== 'vermelhao' && !usadas.has(c.id)) ?? CORES[1];
		mapa.set(m.id, livre.id);
		usadas.add(livre.id);
	}
	return mapa;
}
