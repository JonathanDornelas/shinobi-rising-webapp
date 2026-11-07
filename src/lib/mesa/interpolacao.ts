// O movimento dos outros. O que chega pelo canal vem aos saltos: 8 posições por segundo no arrasto, e um passo inteiro quando alguém solta um token. Os jogos resolvem isso
// desenhando o mundo um instante no passado e deslizando entre duas posições que existiram de verdade, sem prever nada. A visão, a colisão e as contas seguem nas posições
// reais: isto muda só o desenho, e por um quinto de segundo.

export interface Ponto {
	x: number;
	y: number;
}

/**
 * Quanto o fantasma fica atrás do que chega, em ms: um pouco mais que o intervalo entre duas mensagens (125 ms), para quase sempre haver a próxima para onde deslizar.
 * Se uma se perde, ele espera a seguinte em vez de pular.
 */
export const ATRASO_DO_FANTASMA = 160;
/** Duas posições mais afastadas que isto no tempo não são um movimento: alguém parou e voltou a arrastar. */
const INTERVALO_MAXIMO = 600;

/** As últimas posições de alguém. `em` diz onde desenhar agora. */
export class Trilha {
	private pontos: (Ponto & { t: number })[] = [];

	constructor(private atraso = ATRASO_DO_FANTASMA) {}

	somar(x: number, y: number, t: number) {
		const ultimo = this.pontos.at(-1);
		if (ultimo && ultimo.t === t) return;
		// parou e voltou: sai da posição onde estava, em vez de deslizar por todo o tempo parado
		if (ultimo && t - ultimo.t > INTERVALO_MAXIMO) this.pontos.push({ ...ultimo, t: t - this.atraso });
		this.pontos.push({ x, y, t });
	}

	/** Onde desenhar em `agora`. `parado`: passou da última posição, e não há mais o que animar até chegar outra. */
	em(agora: number): Ponto & { parado: boolean } {
		const alvo = agora - this.atraso;
		const p = this.pontos;
		if (!p.length) return { x: 0, y: 0, parado: true };
		// só o trecho em que estamos importa
		while (p.length > 2 && p[1].t <= alvo) p.shift();
		const [a, b] = p;
		if (alvo <= a.t || !b) return { x: a.x, y: a.y, parado: !b && alvo >= a.t };
		if (alvo >= b.t) return { x: b.x, y: b.y, parado: true };
		const k = (alvo - a.t) / (b.t - a.t);
		return { x: a.x + (b.x - a.x) * k, y: a.y + (b.y - a.y) * k, parado: false };
	}
}

/** Longe assim, não é um passo: é o Mestre levando alguém para outro lugar. O token vai direto, sem atravessar o mapa. */
export const LONGE_DEMAIS = 30;

/** Quanto leva um deslize, em ms: um passo é quase instantâneo, e uma corrida de 10 m não passa de um terço de segundo. */
export const tempoDoDeslize = (metros: number) => Math.min(320, 120 + 30 * metros);

/** Um token indo de um lugar a outro. */
export interface Deslize {
	de: Ponto;
	para: Ponto;
	t0: number;
	duracao: number;
}

/** Começa rápido e chega devagar, como quem para ao chegar. */
const chegando = (k: number) => 1 - (1 - k) * (1 - k);

/** Onde o token está em `agora`, ou null quando já chegou. */
export function noDeslize({ de, para, t0, duracao }: Deslize, agora: number): Ponto | null {
	const k = (agora - t0) / duracao;
	if (k >= 1) return null;
	const f = chegando(Math.max(0, k));
	return { x: de.x + (para.x - de.x) * f, y: de.y + (para.y - de.y) * f };
}
