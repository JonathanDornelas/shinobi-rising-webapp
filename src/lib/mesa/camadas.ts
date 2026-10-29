// As camadas de uma cena: uma pilha, de baixo para cima (o índice 0 é o fundo da pilha), que o Mestre monta. Uma delas, de
// tipo "tokens", é onde os tokens ficam: o que está abaixo fica sob os tokens, o que está acima fica sobre eles. As
// imagens apontam para a camada pelo id. Na vista isométrica, as camadas "em pé" entram na ordem de pintura com os tokens.

export interface Camada {
	id: string;
	nome: string;
	tipo?: 'tokens';
	/** isométrica: as imagens desta camada passam à frente ou atrás de cada token, conforme a posição */
	em_pe?: boolean;
}

export const MAX_CAMADAS = 24;

/** A pilha de quem não mexeu: chão, meio (em pé), tokens e acima. */
export const CAMADAS_PADRAO: readonly Camada[] = [
	{ id: 'chao', nome: 'Chão' },
	{ id: 'meio', nome: 'Meio', em_pe: true },
	{ id: 'tokens', nome: 'Tokens', tipo: 'tokens' },
	{ id: 'acima', nome: 'Acima' }
];

const ID = /^[a-z0-9_-]{1,40}$/;

/** A pilha da cena, se estiver em ordem; senão a padrão (o banco já barra o resto, isto protege uma linha antiga ou torta). */
export function camadasDaCena(valor: unknown): Camada[] {
	if (!Array.isArray(valor) || valor.length < 1 || valor.length > MAX_CAMADAS) return CAMADAS_PADRAO.map((c) => ({ ...c }));
	const vistos = new Set<string>();
	let tokens = 0;
	const lista: Camada[] = [];
	for (const c of valor as Record<string, unknown>[]) {
		const id = typeof c?.id === 'string' ? c.id : '';
		const nome = typeof c?.nome === 'string' ? c.nome.trim() : '';
		if (!ID.test(id) || !nome || nome.length > 40 || vistos.has(id)) return CAMADAS_PADRAO.map((x) => ({ ...x }));
		vistos.add(id);
		if (c.tipo === 'tokens') tokens++;
		lista.push({ id, nome, ...(c.tipo === 'tokens' ? { tipo: 'tokens' as const } : {}), ...(c.em_pe ? { em_pe: true } : {}) });
	}
	return tokens === 1 ? lista : CAMADAS_PADRAO.map((c) => ({ ...c }));
}

export const indiceDosTokens = (l: readonly Camada[]) => l.findIndex((c) => c.tipo === 'tokens');

/** A posição da camada de uma imagem na pilha. Um id que a cena não tem (camada apagada) vale "logo abaixo dos tokens". */
export function indiceDaCamada(id: string | null | undefined, l: readonly Camada[]): number {
	const i = l.findIndex((c) => c.id === id);
	return i >= 0 ? i : indiceDosTokens(l) - 0.5;
}

/** A camada é "em pé" (isométrica)? Uma que a cena não tem vale como o "meio": em pé. */
export function camadaEmPe(id: string | null | undefined, l: readonly Camada[]): boolean {
	const c = l.find((x) => x.id === id);
	return c ? !!c.em_pe : true;
}

/** Onde cai uma imagem nova: a camada de imagens logo abaixo dos tokens (ou, sem nenhuma, a de logo acima). */
export function camadaPadrao(l: readonly Camada[]): string {
	const t = indiceDosTokens(l);
	for (let i = t - 1; i >= 0; i--) if (l[i].tipo !== 'tokens') return l[i].id;
	for (let i = t + 1; i < l.length; i++) return l[i].id;
	return 'meio';
}

const semAcento = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '');
/** Um id para o nome, sem repetir os que a cena já tem. */
export function novaId(nome: string, existentes: readonly string[]): string {
	const base = semAcento(nome).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 30) || 'camada';
	let id = base;
	for (let n = 2; existentes.includes(id); n++) id = `${base}-${n}`;
	return id;
}

/** Cria uma camada de imagens no topo da pilha (o Mestre arrasta para onde quiser). Null quando a pilha está cheia. */
export function adicionar(l: readonly Camada[], nome: string): Camada[] | null {
	const n = nome.trim().slice(0, 40);
	if (!n || l.length >= MAX_CAMADAS) return null;
	return [...l, { id: novaId(n, l.map((c) => c.id)), nome: n }];
}

export function renomear(l: readonly Camada[], id: string, nome: string): Camada[] {
	const n = nome.trim().slice(0, 40);
	return n ? l.map((c) => (c.id === id ? { ...c, nome: n } : c)) : [...l];
}

export const alternarEmPe = (l: readonly Camada[], id: string): Camada[] => l.map((c) => (c.id === id ? (c.em_pe ? { id: c.id, nome: c.nome, ...(c.tipo ? { tipo: c.tipo } : {}) } : { ...c, em_pe: true }) : c));

/** Leva a camada para o índice `para` da pilha (0 é o fundo), empurrando as outras. */
export function mover(l: readonly Camada[], id: string, para: number): Camada[] {
	const de = l.findIndex((c) => c.id === id);
	if (de < 0) return [...l];
	const nova = [...l];
	const [c] = nova.splice(de, 1);
	nova.splice(Math.max(0, Math.min(nova.length, para)), 0, c);
	return nova;
}

/**
 * Apaga uma camada de imagens. As imagens dela vão para a camada vizinha de imagens (a de baixo; sem ela, a de cima) e o
 * resultado diz qual. A camada dos tokens não se apaga, nem a última de imagens.
 */
export function remover(l: readonly Camada[], id: string): { lista: Camada[]; destino: string } | null {
	const i = l.findIndex((c) => c.id === id);
	if (i < 0 || l[i].tipo === 'tokens') return null;
	const outras = l.filter((c) => c.id !== id && c.tipo !== 'tokens');
	if (!outras.length) return null;
	let destino: Camada | undefined;
	for (let j = i - 1; j >= 0 && !destino; j--) if (l[j].tipo !== 'tokens') destino = l[j];
	for (let j = i + 1; j < l.length && !destino; j++) if (l[j].tipo !== 'tokens') destino = l[j];
	return destino ? { lista: l.filter((c) => c.id !== id), destino: destino.id } : null;
}
