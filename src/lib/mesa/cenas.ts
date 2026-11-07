// Cenas da Mesa: o que o grupo vê no lugar do que é só do Mestre.

/**
 * O grupo vê o nome público da cena (ou "Cena"), não o do Mestre. É só o que a tela mostra: o nome continua na linha
 * que o banco entrega (quem abrir o inspetor de rede lê), então spoiler de verdade fica em "visível" e na névoa.
 */
export const mascararCena = <T extends { nome: string; nome_publico: string | null }>(c: T, mestre: boolean): T => (mestre ? c : { ...c, nome: c.nome_publico?.trim() || 'Cena' });

/**
 * A cena que um aviso do banco descreve. O Realtime deixa de fora as colunas grandes que não mudaram (o TOAST do Postgres): as paredes de um mapa importado, por exemplo.
 * Tomar o aviso como a cena inteira apagava essas colunas da memória de todos, e a Mesa passava a achar que a cena não tinha luz dinâmica até recarregar a página. O que
 * o aviso não traz fica como estava, e o que chega com a forma errada também.
 */
export function cenaDoAviso<T extends object>(aviso: T, antiga: T | undefined): T {
	if (!antiga) return aviso;
	const cena = { ...aviso } as Record<string, unknown>;
	for (const [campo, valor] of Object.entries(antiga)) {
		const veio = cena[campo];
		const forma = (v: unknown) => (Array.isArray(v) ? 'lista' : v !== null && typeof v === 'object' ? 'objeto' : null);
		if (veio === undefined || (forma(valor) && veio !== null && forma(veio) !== forma(valor))) cena[campo] = valor;
	}
	return cena as T;
}
