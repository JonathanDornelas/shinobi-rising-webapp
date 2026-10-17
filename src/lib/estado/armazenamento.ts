// localStorage tolerante a falhas (aba privada, armazenamento bloqueado). Prefixo "snm:".
export function ler<T>(chave: string, padrao: T): T {
	try {
		const v = localStorage.getItem(`snm:${chave}`);
		return v === null ? padrao : (JSON.parse(v) as T);
	} catch {
		return padrao;
	}
}

export function gravar(chave: string, valor: unknown) {
	try {
		localStorage.setItem(`snm:${chave}`, JSON.stringify(valor));
	} catch {
		/* sem armazenamento: a preferência vale só nesta visita */
	}
}

/** Grava texto puro (lido pelo script de tema do app.html antes da pintura). */
export function gravarTexto(chave: string, valor: string) {
	try {
		localStorage.setItem(`snm:${chave}`, valor);
	} catch {
		/* idem */
	}
}
