// Atributos, perícias, especializações e proficiências de uma ficha do bestiário, derivados dos números que ela já tem
// (ameaça, papel, acerto, Defesa, Iniciativa) para o quadro ficar coerente com as regras:
//  - AGI é a Iniciativa (cap. 3) e a Acrobacia é a Defesa − 10 (cap. 4: Defesa = 10 + Acrobacia);
//  - a perícia do ataque principal, mais a proficiência na arma, dá exatamente o acerto do ataque;
//  - o atributo principal do papel sobe com a ameaça, até +10 (o teto do atributo de clã); o treino de perícia não passa
//    de +5 e a proficiência não passa de Lendário (+5), como no cap. 3.
// Poucas perícias (até 4), uma ou duas especializações (só quem tem treino ninja) e até duas proficiências.
import type { PapelCriatura, TipoCriatura } from '../livro/tipos.ts';

export type Atributo = 'for' | 'agi' | 'vig' | 'int' | 'ctr' | 'esp';
export const ATRIBUTOS: Atributo[] = ['for', 'agi', 'vig', 'int', 'ctr', 'esp'];

export type Pericia =
	| 'acrobacia'
	| 'atletismo'
	| 'bukijutsu'
	| 'furtividade'
	| 'genjutsu'
	| 'investigacao'
	| 'kugutsu'
	| 'medicina'
	| 'ninjutsu'
	| 'percepcao'
	| 'persuasao'
	| 'rastreamento'
	| 'selamento'
	| 'sobrevivencia'
	| 'taijutsu';
export const PERICIAS: Record<Pericia, { nome: string; atributo: Atributo }> = {
	acrobacia: { nome: 'Acrobacia', atributo: 'agi' },
	atletismo: { nome: 'Atletismo', atributo: 'for' },
	bukijutsu: { nome: 'Bukijutsu', atributo: 'for' },
	furtividade: { nome: 'Furtividade', atributo: 'agi' },
	genjutsu: { nome: 'Genjutsu', atributo: 'ctr' },
	investigacao: { nome: 'Investigação', atributo: 'int' },
	kugutsu: { nome: 'Kugutsu', atributo: 'agi' },
	medicina: { nome: 'Medicina', atributo: 'int' },
	ninjutsu: { nome: 'Ninjutsu', atributo: 'ctr' },
	percepcao: { nome: 'Percepção', atributo: 'esp' },
	persuasao: { nome: 'Persuasão', atributo: 'esp' },
	rastreamento: { nome: 'Rastreamento', atributo: 'int' },
	selamento: { nome: 'Selamento', atributo: 'int' },
	sobrevivencia: { nome: 'Sobrevivência', atributo: 'vig' },
	taijutsu: { nome: 'Taijutsu', atributo: 'for' }
};
export const NIVEIS_PROFICIENCIA = ['Nenhuma', 'Familiar', 'Treinado', 'Experiente', 'Mestre', 'Lendário'] as const;

export interface PericiaFicha {
	id: Pericia;
	nome: string;
	total: number;
}
export interface EspecializacaoFicha {
	nome: string;
	nivel: number;
	/** Âncora no cap. 19 (/regras/especializacoes#…). */
	ancora: string;
}
export interface ProficienciaFicha {
	nome: string;
	/** Bônus de rolagem (+1 Familiar … +5 Lendário). */
	bonus: number;
	/** Jutsu específico (com cartão do léxico) ou arma. */
	jutsu: string | null;
}
export interface FichaCompleta {
	atributos: Record<Atributo, number>;
	pericias: PericiaFicha[];
	especializacoes: EspecializacaoFicha[];
	proficiencias: ProficienciaFicha[];
}

export interface EntradaFicha {
	ameaca: number;
	papel: PapelCriatura;
	tipo: TipoCriatura;
	/** Slug do clã (akimichi, uchiha…), para quem é de clã; "sennin" para os Sennin. */
	cla: string | null;
	acerto: number;
	defesa: number;
	iniciativa: number;
	ataque: { nome: string; alcance: string } | null;
	jutsus: { slug: string | null; nome: string; tipo: string | null; elemento: string | null }[];
}

const limitar = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));
/** Atributo principal do papel: +2 na ameaça 2, +6 na 10, +10 na 20. */
export const principal = (ameaca: number) => limitar(Math.round(1 + ameaca * 0.45), 1, 10);
/** Treino das perícias secundárias e nível das proficiências pela ameaça (1 a 5). */
const treino = (ameaca: number) => limitar(Math.round(ameaca / 4) + 1, 1, 5);

// os nomes são comparados sem acento ("Tantō" → "tanto")
const semAcento = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '');
const ARMA = /kunai|katana|espada|lamina|faca|clava|machado|bengala|bastao|lanca|shuriken|arco|corrente|senbon|kusarigama|tessen|leque|agulha|foice|naginata|tanto|wakizashi|garfo|jitte|cajado|martelo|cutelo|machete|adaga|tridente/i;
const MARIONETE = /marionete|fios de chakra/i;
const CORPO = /punho|soco|chute|golpe|palma|dedo|ombro|joelho|cotovelo|agarr|cabecada|investida/i;
const NINJA: TipoCriatura[] = ['shinobi', 'fora da lei', 'guerreiro', 'organização'];

/** Perícia e atributo do ataque principal. */
function periciaDoAtaque(e: EntradaFicha): { pericia: Pericia; atributo: Atributo; arma: boolean } {
	const nome = semAcento(e.ataque?.nome ?? '');
	const distancia = !!e.ataque && !/corpo a corpo/i.test(e.ataque.alcance);
	if (!NINJA.includes(e.tipo)) return { pericia: 'atletismo', atributo: 'for', arma: false };
	if (MARIONETE.test(nome)) return { pericia: 'kugutsu', atributo: 'agi', arma: false };
	if (ARMA.test(nome)) return { pericia: 'bukijutsu', atributo: distancia ? 'agi' : 'for', arma: true };
	if (CORPO.test(nome) || !distancia) return { pericia: 'taijutsu', atributo: 'for', arma: false };
	const genjutsu = e.jutsus.some((j) => j.tipo === 'Genjutsu') && e.papel === 'controlador';
	return genjutsu ? { pericia: 'genjutsu', atributo: 'ctr', arma: false } : { pericia: 'ninjutsu', atributo: 'ctr', arma: false };
}

/** Atributos pelo papel: o principal sobe com a ameaça; AGI é a Iniciativa. */
function atributosDe(e: EntradaFicha): Record<Atributo, number> {
	const p = principal(e.ameaca);
	const base = Math.max(-1, Math.round(p / 3) - 1);
	const a: Record<Atributo, number> = { for: base, agi: e.iniciativa, vig: base, int: base, ctr: base, esp: base };
	const fera = !NINJA.includes(e.tipo);
	if (fera) Object.assign(a, { for: p, vig: p - 1, esp: Math.max(0, p - 3), int: -2, ctr: e.jutsus.length ? Math.max(0, p - 3) : -1 });
	else if (e.papel === 'lutador' || e.papel === 'bando') Object.assign(a, { for: p, vig: p - 1 });
	else if (e.papel === 'assassino') Object.assign(a, { for: p - 1, esp: p - 2 });
	else if (e.papel === 'atirador') Object.assign(a, { esp: p - 1, ctr: p - 2 });
	else if (e.papel === 'controlador') Object.assign(a, { ctr: p, esp: p - 1, int: p - 2 });
	else if (e.papel === 'suporte') Object.assign(a, { int: p, ctr: p - 1, esp: p - 2 });
	else if (e.papel === 'chefe') Object.assign(a, { ctr: p, vig: p - 1, for: p - 1, esp: p - 2 });
	for (const k of ATRIBUTOS) a[k] = limitar(a[k], -2, 10);
	a.agi = e.iniciativa;
	return a;
}

/** Perícias secundárias de cada papel, clã e tipo, em ordem de prioridade (o ataque e a Acrobacia já entram antes). */
function secundarias(e: EntradaFicha): Pericia[] {
	const lista: Pericia[] = [];
	if (!NINJA.includes(e.tipo)) return ['percepcao', 'sobrevivencia'];
	const CLA: Record<string, Pericia> = { hyuuga: 'percepcao', inuzuka: 'rastreamento', aburame: 'percepcao', uzumaki: 'selamento', yamanaka: 'percepcao', nara: 'investigacao', akimichi: 'atletismo', sennin: 'percepcao' };
	if (e.cla && CLA[e.cla]) lista.push(CLA[e.cla]);
	if (e.jutsus.some((j) => /shosen|kaifuku|iryo/.test(j.slug ?? ''))) lista.push('medicina');
	const PAPEL: Record<PapelCriatura, Pericia[]> = {
		lutador: ['atletismo', 'percepcao'],
		bando: ['atletismo', 'sobrevivencia'],
		assassino: ['furtividade', 'percepcao'],
		atirador: ['percepcao', 'furtividade'],
		controlador: [e.jutsus.some((j) => j.tipo === 'Genjutsu') ? 'genjutsu' : 'ninjutsu', 'percepcao'],
		suporte: ['medicina', 'percepcao'],
		chefe: ['persuasao', 'percepcao']
	};
	lista.push(...PAPEL[e.papel]);
	return lista;
}

const ELEMENTO_NOME: Record<string, string> = { katon: 'Katon', suiton: 'Suiton', fuuton: 'Fūton', raiton: 'Raiton', doton: 'Doton', mokuton: 'Mokuton', hyoton: 'Hyōton' };
const ESPECIALIZACAO: Record<string, string> = {
	'Controle de Chakra': 'especializacao-controle-de-chakra',
	'Reservatório de Chakra': 'especializacao-reservatorio-de-chakra',
	Velocidade: 'especializacao-velocidade',
	'Resistência Física': 'especializacao-resistencia-fisica',
	Genjutsu: 'especializacao-genjutsu',
	Ninjutsu: 'especializacao-ninjutsu',
	Bukijutsu: 'especializacao-bukijutsu',
	Selamento: 'especializacao-selamento-fuuinjutsu',
	'Furtividade e Assassinato': 'especializacao-furtividade-e-assassinato',
	Taijutsu: 'especializacao-taijutsu',
	Marionete: 'especializacao-marionete-kugutsu',
	Invocação: 'especializacao-invocacao-kuchiyose',
	'Sensor de Chakra': 'especializacao-sensor-de-chakra',
	'Ninjutsu Médico': 'especializacao-ninjutsu-medico',
	Sennin: 'especializacao-sennin-pre-requisitos-no-cap-15'
};
const ANCORA_ELEMENTO = 'especializacao-elemento-especifico-katon-suiton-etc';

/** Especializações (cap. 19): só quem tem treino ninja; uma até a ameaça 6, duas a partir da 7. */
function especializacoesDe(e: EntradaFicha, ataque: Pericia): EspecializacaoFicha[] {
	const ninja = e.tipo === 'shinobi' || (NINJA.includes(e.tipo) && (e.jutsus.length > 0 || e.ameaca >= 4));
	if (!ninja) return [];
	const nomes: string[] = [];
	const CLA: Record<string, string> = {
		akimichi: 'Resistência Física',
		hyuuga: 'Taijutsu',
		inuzuka: 'Taijutsu',
		aburame: 'Sensor de Chakra',
		uchiha: 'Elemento: Katon',
		senju: 'Reservatório de Chakra',
		uzumaki: 'Selamento',
		yamanaka: 'Sensor de Chakra',
		nara: 'Controle de Chakra',
		kaguya: 'Taijutsu',
		hozuki: 'Elemento: Suiton',
		sabaku: 'Controle de Chakra',
		yuki: 'Controle de Chakra'
	};
	if (e.cla && CLA[e.cla]) nomes.push(CLA[e.cla]);
	// os Sennin aprenderam com uma espécie de invocação (cap. 15)
	if (e.cla === 'sennin') nomes.push('Sennin', 'Invocação');
	// o elemento mais usado nos jutsus
	const conta: Record<string, number> = {};
	for (const j of e.jutsus) if (j.elemento && ELEMENTO_NOME[j.elemento]) conta[j.elemento] = (conta[j.elemento] ?? 0) + 1;
	const elemento = Object.entries(conta).sort((a, b) => b[1] - a[1])[0]?.[0];
	if (elemento) nomes.push(`Elemento: ${ELEMENTO_NOME[elemento]}`);
	if (e.jutsus.some((j) => /shosen|kaifuku|iryo/.test(j.slug ?? ''))) nomes.push('Ninjutsu Médico');
	if (e.jutsus.some((j) => j.tipo === 'Genjutsu')) nomes.push('Genjutsu');
	const PAPEL: Record<PapelCriatura, string> = {
		lutador: ataque === 'bukijutsu' ? 'Bukijutsu' : 'Taijutsu',
		bando: 'Bukijutsu',
		assassino: 'Furtividade e Assassinato',
		atirador: 'Bukijutsu',
		controlador: 'Ninjutsu',
		suporte: 'Ninjutsu Médico',
		chefe: 'Reservatório de Chakra'
	};
	nomes.push(PAPEL[e.papel]);
	if (ataque === 'kugutsu') nomes.unshift('Marionete');
	const nivel = e.ameaca < 4 ? 1 : e.ameaca < 9 ? 2 : 3;
	return [...new Set(nomes)]
		.slice(0, e.ameaca >= 7 ? 2 : 1)
		.map((nome) => ({ nome, nivel, ancora: nome.startsWith('Elemento') ? ANCORA_ELEMENTO : ESPECIALIZACAO[nome] }));
}

export function fichaCompleta(e: EntradaFicha): FichaCompleta {
	const atributos = atributosDe(e);
	const atq = periciaDoAtaque(e);
	const t = treino(e.ameaca);

	// perícia do ataque + proficiência na arma = acerto. A proficiência cobre parte do que falta além do atributo; o resto
	// é o treino da perícia, que pode ser negativo (cap. 3) e não passa de +5 (se passar, o atributo sobe)
	let falta = e.acerto - atributos[atq.atributo];
	const prof = atq.arma ? limitar(Math.max(t - 1, falta - 5), 0, limitar(falta, 0, 5)) : 0;
	falta -= prof;
	if (falta > 5) atributos[atq.atributo] = limitar(e.acerto - prof - 5, -2, 10);
	const pericias: PericiaFicha[] = [{ id: atq.pericia, nome: PERICIAS[atq.pericia].nome, total: e.acerto - prof }];
	// Acrobacia = Defesa − 10; nas feras de couraça, em que a Defesa passa disso, o treino para no teto (+5, +2 de bônus)
	pericias.push({ id: 'acrobacia', nome: 'Acrobacia', total: Math.min(e.defesa - 10, atributos.agi + 7) });
	for (const p of secundarias(e)) {
		if (pericias.length >= 4) break;
		if (pericias.some((x) => x.id === p)) continue;
		pericias.push({ id: p, nome: PERICIAS[p].nome, total: atributos[PERICIAS[p].atributo] + t });
	}

	const proficiencias: ProficienciaFicha[] = [];
	if (atq.arma && prof > 0 && e.ataque) proficiencias.push({ nome: e.ataque.nome, bonus: prof, jutsu: null });
	const assinatura = NINJA.includes(e.tipo) ? e.jutsus.find((j) => j.slug) : undefined;
	if (assinatura) proficiencias.push({ nome: assinatura.nome, bonus: limitar(t - 1, 1, 4), jutsu: assinatura.slug });

	return { atributos, pericias, especializacoes: especializacoesDe(e, atq.pericia), proficiencias };
}
