// Sortear na criação (cap. 6): cada passo pode deixar o dado escolher, sempre dentro das regras (os pontos de atributo
// distribuídos, as perícias que ninguém treinou, os jutsus da afinidade, os clãs e pacotes que a campanha permite). É
// puro: recebe a ficha e o sorteio (o Math.random, ou um com semente nos testes) e devolve a ficha nova.
import { BACKGROUNDS, CLAS, CRIACAO, ELEMENTOS, ESPECIALIZACOES, ESCALA_ATRIBUTOS, PERICIAS, PERICIAS_COMBATE, VILAS, custoAtributo, custoProficiencia, type Atributo, type Pericia } from './dados.ts';
import { elementos, jutsusConhecidos, periciasTreinadas, pontosPericia, regrasCla, type ContextoCampanha, type FichaDados } from './regras.ts';

export type Sorteio = () => number;
type Jutsu = { slug: string; elemento: string | null };
export interface CatalogoSorteio {
	jutsusE: Jutsu[];
	jutsusD: Jutsu[];
	armas: string[];
	especializacoes: { id: string; bloqueio: string | null }[];
}

const um = <T>(r: Sorteio, lista: readonly T[]): T => lista[Math.floor(r() * lista.length)];
function embaralhar<T>(r: Sorteio, lista: readonly T[]): T[] {
	const a = [...lista];
	for (let i = a.length - 1; i > 0; i--) {
		const j = Math.floor(r() * (i + 1));
		[a[i], a[j]] = [a[j], a[i]];
	}
	return a;
}
const copia = (f: FichaDados): FichaDados => JSON.parse(JSON.stringify(f));

// nomes originais no estilo do mundo ninja (nenhum personagem do anime)
const NOMES = ['Kaito', 'Hana', 'Ren', 'Sora', 'Yuki', 'Daichi', 'Aiko', 'Kenji', 'Mika', 'Takeshi', 'Rin', 'Haru', 'Kaede', 'Shin', 'Natsu', 'Emi', 'Ryo', 'Akane', 'Jun', 'Mei', 'Kazuki', 'Asuka', 'Tora', 'Nami', 'Isamu', 'Chiyo', 'Raiden', 'Suzu', 'Hiro', 'Kiku'];
const SOBRENOMES = ['Hoshino', 'Kurosawa', 'Tsukino', 'Moriyama', 'Kazehaya', 'Ishikawa', 'Takeda', 'Mizushima', 'Hayabusa', 'Kirigaya', 'Amano', 'Fujiwara', 'Kagami', 'Shiranui', 'Yamabuki'];
const CONCEITOS = [
	'Órfão que quer provar o seu valor para a vila',
	'Prodígio cansado das expectativas da família',
	'Ninja calado que observa tudo antes de agir',
	'Brincalhão que esconde uma tristeza antiga',
	'Estrategista frio que conta cada passo',
	'Herdeiro de uma técnica proibida que ninguém pode descobrir',
	'Aprendiz teimoso de um sensei excêntrico',
	'Sobrevivente de uma missão que deu errado',
	'Ninja de coração mole num mundo duro',
	'Rival declarado de alguém do próprio time'
];
const CABELOS = ['cabelo preto e rebelde', 'cabelo ruivo preso num rabo', 'cabelo branco curto', 'cabelo castanho comprido', 'cabelo azul-escuro raspado dos lados', 'cabelo loiro espetado'];
const TRACOS = ['uma cicatriz fina no queixo', 'olhos cansados e atentos', 'faixas nos antebraços', 'um sorriso que nunca chega aos olhos', 'sardas e voz rouca', 'a bandana sempre no braço'];

export function sortearConceito(f: FichaDados, r: Sorteio): FichaDados {
	const n = copia(f);
	const sobrenome = n.cla.tipo === 'catalogo' && n.cla.slug ? n.cla.slug.charAt(0).toUpperCase() + n.cla.slug.slice(1) : um(r, SOBRENOMES);
	n.conceito = { ...n.conceito, nome: `${um(r, NOMES)} ${sobrenome}`, idade: 12 + Math.floor(r() * 5), conceito: um(r, CONCEITOS), aparencia: `${um(r, CABELOS)}, ${um(r, TRACOS)}` };
	return n;
}

/**
 * Os pontos da criação comprados com custo crescente (+1 custa 1, +2 custa 3, +3 custa 6), sem passar do teto +3 (com o
 * bônus do clã); às vezes o ninja aceita uma fraqueza, e os pontos que ela devolve vão para os outros.
 */
export function sortearAtributos(f: FichaDados, r: Sorteio): FichaDados {
	const n = copia(f);
	n.escala = ESCALA_ATRIBUTOS;
	const ids = ['FOR', 'AGI', 'VIG', 'INT', 'CTR', 'ESP', 'CAR'] as Atributo[];
	const v = Object.fromEntries(ids.map((a) => [a, 0])) as Record<Atributo, number>;
	const doCla = regrasCla(n)?.ganho.atributo ?? null;
	let pontos = CRIACAO.pontosAtributo;
	const fracos = embaralhar(r, ids.filter((a) => a !== doCla)).slice(0, r() < 0.35 ? (r() < 0.3 ? 2 : 1) : 0);
	for (const a of fracos) {
		const d = r() < 0.75 ? 1 : 2;
		v[a] = -d;
		pontos += d;
	}
	for (;;) {
		const podem = ids.filter((a) => !fracos.includes(a) && v[a] + (a === doCla ? 1 : 0) < CRIACAO.atributoMax && custoAtributo(v[a] + 1) - custoAtributo(v[a]) <= pontos);
		if (!podem.length) break;
		const a = um(r, podem);
		pontos -= custoAtributo(v[a] + 1) - custoAtributo(v[a]);
		v[a]++;
	}
	n.atributos = v;
	return n;
}

/** Uma perícia que ninguém treina ainda (para as escolhas de vila, clã e background). */
const livre = (f: FichaDados, r: Sorteio, opcoes: readonly Pericia[] | 'qualquer') => {
	const ja = periciasTreinadas(f).fontes;
	const lista = (opcoes === 'qualquer' ? PERICIAS.map((p) => p.id) : opcoes).filter((p) => !ja.has(p));
	return lista.length ? um(r, lista) : null;
};

export function sortearVila(f: FichaDados, ctx: ContextoCampanha, r: Sorteio): FichaDados {
	const n = copia(f);
	const vila = um(r, VILAS.filter((v) => !ctx.vilas.length || ctx.vilas.includes(v.id)));
	n.vila = { id: vila.id, escolha: null };
	if (vila.ganho.escolhaPericia) n.vila.escolha = livre(n, r, vila.ganho.escolhaPericia);
	return n;
}

/** Um clã do livro que a campanha permite (ou ficar sem clã), com a escolha de perícia dele. */
export function sortearCla(f: FichaDados, ctx: ContextoCampanha, r: Sorteio): FichaDados {
	const n = copia(f);
	const slug = um(r, [...ctx.clas.filter((c) => CLAS[c]), null]);
	n.cla = slug ? { tipo: 'catalogo', slug, escolha: null, id: null, criado: null } : { tipo: 'sem', slug: null, escolha: null, id: null, criado: null };
	const g = slug ? CLAS[slug].ganho : null;
	if (g?.escolhaPericia) n.cla.escolha = livre(n, r, g.escolhaPericia);
	return n;
}

/** As perícias treinadas da criação: as que ninguém treinou, com pelo menos uma de combate quando ainda não há. */
export function sortearPericias(f: FichaDados, r: Sorteio): FichaDados {
	const n = copia(f);
	n.pericias = {};
	const { limite } = pontosPericia(n);
	const ja = periciasTreinadas(n).fontes;
	const livres = PERICIAS.map((p) => p.id).filter((p) => !ja.has(p));
	const escolha: Pericia[] = [];
	if (!PERICIAS_COMBATE.some((p) => ja.has(p))) {
		const c = PERICIAS_COMBATE.filter((p) => livres.includes(p));
		if (c.length) escolha.push(um(r, c));
	}
	for (const p of embaralhar(r, livres)) if (escolha.length < limite && !escolha.includes(p)) escolha.push(p);
	n.pericias = Object.fromEntries(escolha.map((p) => [p, 1]));
	return n;
}

/** Os PT iniciais: a arma principal em Familiar e, com o que sobra, um jutsu conhecido em Treinado. */
export function sortearProficiencias(f: FichaDados, cat: CatalogoSorteio, r: Sorteio): FichaDados {
	const n = copia(f);
	n.proficiencias = [];
	let pt = CRIACAO.ptIniciais + (n.cla.tipo === 'sem' ? CRIACAO.semCla.pt : 0) + (regrasCla(n)?.ganho.pt ?? 0) + (n.background.id === 'perdedor' ? 2 : 0);
	const armas = cat.armas.filter((a) => /kunai|shuriken|katana|tant|senbon|bastão|bo\b/i.test(a));
	if (armas.length && pt >= custoProficiencia('arma', 1)) {
		n.proficiencias.push({ tipo: 'arma', alvo: um(r, armas), nivel: 1 });
		pt -= custoProficiencia('arma', 1);
	}
	const jutsus = jutsusConhecidos(n);
	if (jutsus.length && pt >= custoProficiencia('jutsu', 2)) n.proficiencias.push({ tipo: 'jutsu', alvo: um(r, jutsus), nivel: 2 });
	else if (jutsus.length && pt >= custoProficiencia('jutsu', 1)) n.proficiencias.push({ tipo: 'jutsu', alvo: um(r, jutsus), nivel: 1 });
	return n;
}

export function sortearEspecializacao(f: FichaDados, cat: CatalogoSorteio, r: Sorteio): FichaDados {
	const n = copia(f);
	const id = um(r, cat.especializacoes.filter((e) => !e.bloqueio && ESPECIALIZACOES[e.id] && !ESPECIALIZACOES[e.id].bloqueio).map((e) => e.id));
	n.especializacao = id;
	n.especializacaoElemento = ESPECIALIZACOES[id].escolheElemento ? (n.elemento ?? um(r, ELEMENTOS).id) : null;
	return n;
}

/** O elemento (o do clã, quando ele fixa) e os jutsus iniciais da afinidade: 2 de Rank E e 1 de Rank D. */
export function sortearJutsus(f: FichaDados, cat: CatalogoSorteio, r: Sorteio): FichaDados {
	const n = copia(f);
	const cla = regrasCla(n);
	n.elemento = cla?.elemento ?? um(r, ELEMENTOS).id;
	if (cla?.segundoElemento) n.segundoElemento = um(r, ELEMENTOS.filter((e) => e.id !== n.elemento)).id;
	const meus = elementos(n);
	const ok = (j: Jutsu) => !j.elemento || meus.includes(j.elemento);
	n.jutsus = { E: embaralhar(r, cat.jutsusE.filter(ok)).slice(0, 2).map((j) => j.slug), D: embaralhar(r, cat.jutsusD.filter(ok)).slice(0, 1).map((j) => j.slug) };
	if (n.especializacao && ESPECIALIZACOES[n.especializacao]?.escolheElemento) n.especializacaoElemento = n.elemento;
	return n;
}

export function sortearEquipamento(f: FichaDados, ctx: ContextoCampanha, r: Sorteio): FichaDados {
	const n = copia(f);
	// o pacote do marionetista só para quem se especializou em marionetes
	const pacotes = (['A', 'B', 'marionetista'] as const).filter((p) => (!ctx.pacotes.length || ctx.pacotes.includes(p)) && (p !== 'marionetista' || n.especializacao === 'marionete'));
	n.equipamento = { pacote: pacotes.length ? um(r, pacotes) : 'A', compras: [] };
	return n;
}

export function sortearBackground(f: FichaDados, r: Sorteio): FichaDados {
	const n = copia(f);
	const bg = um(r, BACKGROUNDS);
	n.background = { ...n.background, id: bg.id, escolha: null };
	if (bg.ganho.escolhaPericia) n.background.escolha = livre(n, r, bg.ganho.escolhaPericia);
	return n;
}

/** O passo inteiro: o número do passo da criação (1 a 11). */
export function sortearPasso(passo: number, f: FichaDados, ctx: ContextoCampanha, cat: CatalogoSorteio, r: Sorteio = Math.random): FichaDados {
	switch (passo) {
		case 1: return sortearConceito(f, r);
		case 2: return sortearAtributos(f, r);
		case 3: return sortearVila(f, ctx, r);
		case 4: return sortearCla(f, ctx, r);
		case 5: return sortearPericias(f, r);
		case 6: return sortearProficiencias(f, cat, r);
		case 7: return sortearEspecializacao(f, cat, r);
		case 9: return sortearJutsus(f, cat, r);
		case 10: return sortearEquipamento(f, ctx, r);
		case 11: return sortearBackground(f, r);
		default: return f;
	}
}
/** Os passos que têm sorteio (o 8 é só conta; o 12 é a revisão). */
export const PASSOS_SORTEAVEIS = [1, 2, 3, 4, 5, 6, 7, 9, 10, 11];

/**
 * A ficha toda: na ordem que evita repetir perícias (vila, clã e background antes das perícias da criação) e com os
 * jutsus antes das proficiências (a proficiência pode cair num jutsu conhecido).
 */
export function sortearTudo(f: FichaDados, ctx: ContextoCampanha, cat: CatalogoSorteio, r: Sorteio = Math.random): FichaDados {
	let n = f;
	for (const p of [4, 3, 11, 1, 2, 5, 7, 9, 6, 10]) n = sortearPasso(p, n, ctx, cat, r);
	return n;
}
