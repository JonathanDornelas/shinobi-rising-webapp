// Relógios da cena (planos/mesa-ferramentas-qol.md): contagens que todos veem, como "a ponte cai em 3 rodadas" ou
// "reforços chegam em 4". O Mestre cria e marca; os que contam rodadas andam sozinhos a cada rodada nova do combate.

export interface Relogio {
	id: string;
	nome: string;
	/** quantos segmentos (de 2 a 12) */
	total: number;
	/** quantos já estão marcados */
	marcados: number;
	/** marca um segmento sozinho a cada rodada nova */
	rodada: boolean;
}

export const MAX_RELOGIOS = 8;

/** Os relógios guardados na cena, em ordem; o que vier torto (linha antiga, aviso cortado) fica de fora. */
export function relogiosDaCena(valor: unknown): Relogio[] {
	if (!Array.isArray(valor)) return [];
	return valor
		.filter((r): r is Record<string, unknown> => !!r && typeof r === 'object')
		.map((r) => {
			const total = Math.min(12, Math.max(2, Math.round(Number(r.total) || 4)));
			return {
				id: typeof r.id === 'string' && r.id ? r.id : '',
				nome: typeof r.nome === 'string' ? r.nome.trim().slice(0, 40) : '',
				total,
				marcados: Math.min(total, Math.max(0, Math.round(Number(r.marcados) || 0))),
				rodada: !!r.rodada
			};
		})
		.filter((r) => r.id && r.nome)
		.slice(0, MAX_RELOGIOS);
}

export const novoRelogio = (nome: string, total: number, rodada: boolean): Relogio => ({
	id: crypto.randomUUID().slice(0, 8),
	nome: nome.trim().slice(0, 40),
	total: Math.min(12, Math.max(2, Math.round(total))),
	marcados: 0,
	rodada
});

/** Rodada nova: os que contam rodadas marcam um segmento (o cheio fica cheio). Devolve null quando nada muda. */
export function avancarRodada(lista: Relogio[]): Relogio[] | null {
	if (!lista.some((r) => r.rodada && r.marcados < r.total)) return null;
	return lista.map((r) => (r.rodada && r.marcados < r.total ? { ...r, marcados: r.marcados + 1 } : r));
}

/** Clicar no segmento `i` (0 = o primeiro): marca até ele; clicar no último marcado desmarca ele. */
export const marcarAte = (r: Relogio, i: number): Relogio => ({ ...r, marcados: r.marcados === i + 1 ? i : Math.min(r.total, i + 1) });
