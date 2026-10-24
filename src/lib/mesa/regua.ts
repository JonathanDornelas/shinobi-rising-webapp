// L11 · Mesa: a régua de jutsu lê o alcance e a área do próprio card (planos/mesa-tatica.md, seção 3.6). Os textos do
// catálogo seguem as tabelas do cap. 20; os poucos fora do padrão ("Qualquer marca", "Visão") ficam sem régua.

export type FormaArea = 'alvos' | 'esfera' | 'cone' | 'linha' | 'cone-linha' | 'parede' | 'cena' | 'nenhuma';

export interface Regua {
	/** Alcance em metros; 0 = pessoal (a área sai do usuário); null = alcance especial, sem régua. */
	alcance: number | null;
	/** Rótulo curto do alcance, para a barra ("Médio · 30 m"). */
	rotuloAlcance: string;
	/** O alcance é o da arma empunhada. */
	daArma?: boolean;
	forma: FormaArea;
	/** Esfera: raio; cone e linha: comprimento; parede: comprimento. */
	n: number;
	/** cone-linha: comprimento do cone e da linha. */
	cone?: number;
	linha?: number;
	/** alvos: quantos dá para escolher. */
	alvos?: number;
	/** esfera centrada no usuário. */
	emSi?: boolean;
}

const NOME_ALCANCE: [RegExp, string, number][] = [
	[/^toque/i, 'Toque', 1],
	[/^curto/i, 'Curto', 10],
	[/^m[ée]dio/i, 'Médio', 30],
	[/^longo/i, 'Longo', 60],
	[/^muito dist/i, 'Muito Distante', 100]
];

export function lerAlcance(texto: string): Pick<Regua, 'alcance' | 'rotuloAlcance' | 'daArma'> {
	const t = texto.trim();
	if (/^pessoal/i.test(t)) return { alcance: 0, rotuloAlcance: 'Pessoal' };
	if (/alcance da arma/i.test(t)) return { alcance: 1, rotuloAlcance: 'Alcance da arma', daArma: true };
	if (/qualquer|vis[ãa]o/i.test(t)) return { alcance: null, rotuloAlcance: t };
	const nome = NOME_ALCANCE.find(([re]) => re.test(t));
	const numero = /(\d+)\s?m\b/.exec(t);
	const m = numero ? +numero[1] : nome ? nome[2] : null;
	if (m == null) return { alcance: null, rotuloAlcance: t };
	if (nome && nome[1] === 'Toque') return { alcance: 1, rotuloAlcance: 'Toque' };
	return { alcance: m, rotuloAlcance: nome ? `${nome[1]} · ${m} m` : `${m} m` };
}

export function lerArea(texto: string): Pick<Regua, 'forma' | 'n' | 'cone' | 'linha' | 'alvos' | 'emSi'> {
	const t = texto.trim();
	if (/^pessoal$/i.test(t)) return { forma: 'nenhuma', n: 0 };
	if (/massiva|quil[ôo]metro|centenas de metros|toda a área/i.test(t)) return { forma: 'cena', n: 0 };
	if (/cone m[ée]dio\s*\/\s*linha/i.test(t)) return { forma: 'cone-linha', n: 10, cone: 10, linha: +(/linha\s*(\d+)/i.exec(t)?.[1] ?? 30) };
	if (/cone pequeno/i.test(t)) return { forma: 'cone', n: 3 };
	const cone = /cone[^\d]*(\d+)\s?m/i.exec(t);
	if (/cone m[ée]dio/i.test(t) || cone) return { forma: 'cone', n: cone ? +cone[1] : 10 };
	const esfera = /esfera(?: de)?\s*(\d+)\s?m/i.exec(t);
	if (esfera) return { forma: 'esfera', n: +esfera[1], emSi: /em torno de si|em volta d[oe] usu[áa]rio|em torno do usu[áa]rio/i.test(t) };
	const linha = /linha(?: reta)?\s*\(?(?:de\s*)?(\d+)\s?m/i.exec(t);
	if (linha) return { forma: 'linha', n: +linha[1] };
	const parede = /(?:parede|muralha)(?: de)?(?: até)?\s*(\d+)\s?m/i.exec(t);
	if (parede) return { forma: 'parede', n: +parede[1] };
	const extra = /alvo [úu]nico\s*\+\s*(\d)/i.exec(t);
	const max = /m[áa]x\.?\s*(\d+)/i.exec(t);
	const ate = /at[ée]\s*(\d+)\s*(?:alvos|aliados|criaturas)/i.exec(t);
	const doisOuTres = /(\d+)\s*ou\s*(\d+)\s*alvos/i.exec(t);
	if (/alvo|aliado|criatura|receptáculo/i.test(t) && !/clone/i.test(t)) {
		const alvos = max ? +max[1] : extra ? 1 + +extra[1] : ate ? +ate[1] : doisOuTres ? +doisOuTres[2] : 1;
		return { forma: 'alvos', n: 0, alvos };
	}
	return { forma: 'nenhuma', n: 0 };
}

/** A régua de um jutsu do catálogo (linha de informação do card). */
export function reguaDoCard(info: { k: string; v: string }[]): Regua {
	const alcance = lerAlcance(info.find((i) => i.k === 'Alcance')?.v ?? '');
	const area = lerArea(info.find((i) => i.k === 'Área')?.v ?? 'Alvo único');
	return { ...alcance, ...area };
}

/** O jutsu tem régua? (alcance especial ou sem área nem alvo, como um buff pessoal, não têm) */
export function temRegua(r: Regua) {
	return r.alcance != null && !(r.alcance === 0 && r.forma === 'nenhuma');
}

/** "Você fica Grande (3 × 3)", "fica Enorme": o lado que o jutsu dá ao usuário no quadro (cap. 4, Tamanho e Espaço). */
export function tamanhoDoEfeito(efeito: string): 3 | 6 | 10 | undefined {
	const m = /\bfica (Grande|Enorme|Colossal)\b/.exec(efeito);
	return m ? ({ Grande: 3, Enorme: 6, Colossal: 10 } as const)[m[1] as 'Grande' | 'Enorme' | 'Colossal'] : undefined;
}

/** O jutsu deixa algo na cena (duração maior que instantânea): "Deixar na cena" na barra da régua. */
export function duracaoEmTurnos(duracao: string | undefined): number | null | undefined {
	if (!duracao || /instant/i.test(duracao)) return undefined;
	const turnos = /(\d+)\s*turnos?/i.exec(duracao);
	if (turnos) return +turnos[1];
	if (/cena|sustentad/i.test(duracao)) return null;
	return undefined;
}
