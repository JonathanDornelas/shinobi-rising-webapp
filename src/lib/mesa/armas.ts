// Modos de uso de uma arma (cap. 12): o alcance do catálogo ("Curto / corpo a corpo") e a propriedade Versátil ("pode ser
// usada corpo a corpo ou arremessada") dão uma linha de golpe e outra à distância, cada uma com o seu alcance.

export interface ModoArma {
	m: number;
	rotulo: string;
	/** à distância: o ataque usa Bukijutsu à distância e o dano soma AGI (cap. 4) */
	distancia: boolean;
}

const CORPO: ModoArma = { m: 1, rotulo: 'Corpo a corpo', distancia: false };
const CURTO: ModoArma = { m: 10, rotulo: 'Curto 10 m', distancia: true };
const MODOS: [RegExp, ModoArma][] = [
	[/haste/i, { m: 2, rotulo: 'Haste 2 m', distancia: false }],
	[/corpo/i, CORPO],
	[/longo/i, { m: 60, rotulo: 'Longo 60 m', distancia: true }],
	[/m[ée]dio/i, { m: 30, rotulo: 'Médio 30 m', distancia: true }],
	[/curto/i, CURTO]
];

export const ehVersatil = (propriedades: string[] = []) => propriedades.some((p) => /vers[áa]til/i.test(p));

/** Os modos da arma, do mais perto ao mais longe. A Versátil sem alcance de arremesso arremessa a Curto. */
export function modosDaArma(alcance: string, propriedades: string[] = []): ModoArma[] {
	const modos = alcance.split('/').flatMap((p) => MODOS.find(([re]) => re.test(p))?.[1] ?? []);
	if (ehVersatil(propriedades)) {
		if (!modos.some((x) => x.distancia)) modos.push(CURTO);
		if (!modos.some((x) => !x.distancia)) modos.push(CORPO);
	}
	if (!modos.length) modos.push(CORPO);
	return [...new Map(modos.map((x) => [x.m, x])).values()].sort((a, b) => a.m - b.m);
}

/** Nome da linha: o golpe fica com o nome da arma; o modo à distância ganha "(arremesso)" ou "(à distância)". */
export const nomeDoModo = (nome: string, modo: ModoArma, modos: ModoArma[], versatil: boolean) =>
	modos.length > 1 && modo.distancia ? `${nome} (${versatil ? 'arremesso' : 'à distância'})` : nome;
