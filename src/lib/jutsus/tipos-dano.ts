// Tipos de dano (cap. 4, Tipos de Dano): físicos (cortante, perfurante, concussão), elementais (fogo, água, vento, terra,
// raio) e especiais (gelo, madeira, veneno, chakra, mental). Resistência corta o dano pela metade, vulnerabilidade dobra
// e imunidade zera; o elemento forte do ciclo (cap. 10) causa +50% contra o fraco. Os jutsus do livro trazem o tipo no
// card (tipo_dano em conteudo/jutsus.yaml); aqui ficam a lista, a leitura automática (para jutsus criados e armas) e o ciclo.
import { normalizar } from '#lib/livro/texto.ts';

export const TIPOS_DANO = [
	{ id: 'cortante', nome: 'Cortante', grupo: 'físico', desc: 'Lâminas, garras e fios: espadas, ossos afiados, papel e vento cortante.' },
	{ id: 'perfurante', nome: 'Perfurante', grupo: 'físico', desc: 'Pontas e projéteis: kunai, shuriken, senbon, agulhas e estacas.' },
	{ id: 'concussao', nome: 'Concussão', grupo: 'físico', desc: 'Impacto: socos, chutes, bastões, quedas e explosões.' },
	{ id: 'fogo', nome: 'Fogo', grupo: 'elemental', desc: 'Katon e as chamas dos elementos combinados (Lava, Calor, Vapor).' },
	{ id: 'agua', nome: 'Água', grupo: 'elemental', desc: 'Suiton: jatos, ondas e pressão da água.' },
	{ id: 'vento', nome: 'Vento', grupo: 'elemental', desc: 'Fuuton: lâminas e rajadas de ar.' },
	{ id: 'terra', nome: 'Terra', grupo: 'elemental', desc: 'Doton: rocha, lama e o chão que se levanta.' },
	{ id: 'raio', nome: 'Raio', grupo: 'elemental', desc: 'Raiton e a Tempestade: descargas elétricas.' },
	{ id: 'gelo', nome: 'Gelo', grupo: 'especial', desc: 'Hyōton: frio e espelhos de gelo (conta como Água e Vento no ciclo).' },
	{ id: 'madeira', nome: 'Madeira', grupo: 'especial', desc: 'Mokuton: troncos e raízes (conta como Terra e Água; queima com Fogo).' },
	{ id: 'veneno', nome: 'Veneno', grupo: 'especial', desc: 'Toxinas, gases e ácidos.' },
	{ id: 'chakra', nome: 'Chakra', grupo: 'especial', desc: 'Chakra puro, sem elemento: Rasengan, selos, desintegração.' },
	{ id: 'mental', nome: 'Mental', grupo: 'especial', desc: 'Dano de ilusões e ataques à mente (Genjutsu).' }
] as const;
export type TipoDano = (typeof TIPOS_DANO)[number]['id'];
export const nomeTipoDano = (id: string | null | undefined) => TIPOS_DANO.find((t) => t.id === id)?.nome ?? null;
export const ehTipoDano = (id: unknown): id is TipoDano => TIPOS_DANO.some((t) => t.id === id);
/** Físico: o que a RD contra dano físico reduz. */
export const FISICOS: TipoDano[] = ['cortante', 'perfurante', 'concussao'];

/** O dano de cada elemento (os combinados causam o do elemento que dá a forma). */
const DO_ELEMENTO: Record<string, TipoDano> = {
	katon: 'fogo',
	suiton: 'agua',
	fuuton: 'vento',
	doton: 'terra',
	raiton: 'raio',
	hyoton: 'gelo',
	mokuton: 'madeira',
	yoton: 'fogo',
	shakuton: 'fogo',
	futton: 'fogo',
	ranton: 'raio',
	bakuton: 'concussao',
	jiton: 'concussao',
	jinton: 'chakra'
};

/**
 * O tipo de dano de um jutsu pelo elemento, pelo tipo e pelo texto (para os jutsus criados e para preencher o catálogo;
 * o card do livro pode dizer outro). O elemento vale primeiro; sem ele, "dano de fogo" no texto.
 */
export function tipoDanoDoJutsu(j: { elemento: string | null; tipo: string; efeito: string; descricao?: string }): TipoDano {
	const t = normalizar(`${j.efeito} ${j.descricao ?? ''}`);
	const explicito = /dano (?:de )?(cortante|perfurante|concussao|fogo|agua|vento|terra|raio|gelo|madeira|veneno|chakra|mental)/.exec(t)?.[1];
	// o jutsu de elemento causa o dano do elemento (é ele que entra no ciclo), mesmo que o texto diga como ele corta ou bate
	if (j.elemento && DO_ELEMENTO[j.elemento]) return DO_ELEMENTO[j.elemento];
	if (explicito && ehTipoDano(explicito)) return explicito;
	if (j.tipo === 'Genjutsu') return 'mental';
	if (/venen|toxin|acido|gas (?:paralisante|venenoso)/.test(t)) return 'veneno';
	const corte = /lamina|corta|corte|garra|espada|katana|fio\b|fios|serra|foice|machad|papel/;
	const ponta = /kunai|shuriken|senbon|agulha|perfura|estaca|lanca|flecha|ponta|espinho|osso|ossos/;
	const impacto = /soco|chute|golpe|punho|bastao|martelo|impacto|esmaga|arremess|investida|explos/;
	if (j.tipo === 'Taijutsu') return corte.test(t) ? 'cortante' : ponta.test(t) && !/punho/.test(t) ? 'perfurante' : 'concussao';
	if (j.tipo === 'Bukijutsu' || j.tipo === 'Kugutsu') return corte.test(t) ? 'cortante' : impacto.test(t) && !ponta.test(t) ? 'concussao' : 'perfurante';
	if (/osso|ossos|espinho|agulha|estaca/.test(t)) return 'perfurante';
	if (/areia|pedra|rocha|impacto|esmaga|explos/.test(t)) return 'concussao';
	if (corte.test(t)) return 'cortante';
	return 'chakra';
}

/** O tipo de dano de uma arma pelo nome (cap. 12): lâmina corta, ponta perfura, o resto é impacto. */
export function tipoDanoDaArma(nome: string): TipoDano {
	const n = normalizar(nome);
	if (/desarmad|punho|soco|bastao|\bbo\b|tonfa|nunchaku|martelo|maca|kanabo|clava|leque de ferro|tessen|cauda|pancada|investida|pisao|chifrada|cabecada|esmag|impacto|pata/.test(n)) return 'concussao';
	if (/kunai|shuriken|senbon|agulha|flecha|arco|lanca|yari|tridente|fuuma|chakram|bumerangue|zarabatana|mordida|presa|chifre|ferrao|bico|espinho/.test(n)) return 'perfurante';
	if (/veneno|toxin/.test(n)) return 'veneno';
	return 'cortante';
}

/** O ciclo dos cinco elementos (cap. 10): cada um vence o seguinte. Madeira e gelo contam como os elementos que os formam. */
const VENCE: Record<string, string[]> = { fogo: ['vento', 'madeira'], vento: ['raio'], raio: ['terra'], terra: ['agua'], agua: ['fogo'] };
const PARTES: Record<string, string[]> = { gelo: ['agua', 'vento'], madeira: ['terra', 'agua'] };
const partes = (t: string) => PARTES[t] ?? [t];

/** O dano de \`ataque\` contra um alvo do elemento \`alvo\` ganha +50%? (o elemento forte contra o fraco) */
export function vantagemElemental(ataque: string, alvo: string): boolean {
	if (alvo === 'madeira' && ataque === 'fogo') return true;
	return partes(ataque).some((a) => partes(alvo).some((b) => VENCE[a]?.includes(b)));
}

/** O dano final contra o alvo: vulnerabilidade dobra, resistência corta pela metade (para baixo), imunidade zera; o elemento forte soma 50%. */
export function danoContra(total: number, tipo: TipoDano, alvo: { resistencias?: string[]; vulnerabilidades?: string[]; imunidades?: string[]; elemento?: string | null }): number {
	if (alvo.imunidades?.includes(tipo)) return 0;
	let d = total;
	if (alvo.elemento && vantagemElemental(tipo, alvo.elemento)) d = Math.floor(d * 1.5);
	if (alvo.vulnerabilidades?.includes(tipo)) d *= 2;
	if (alvo.resistencias?.includes(tipo)) d = Math.floor(d / 2);
	return d;
}

/** O rótulo da rolagem de dano com o tipo: "Dano · Katon: Gōkakyū (fogo)". */
export const rotuloDano = (nome: string, tipo: string | null | undefined) => `Dano · ${nome}${nomeTipoDano(tipo) ? ` (${nomeTipoDano(tipo)!.toLowerCase()})` : ''}`.slice(0, 80);
