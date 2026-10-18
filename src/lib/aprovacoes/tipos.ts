// Tipos da fila de aprovações (R1/R2), usados no servidor e na página.
export type TipoFila = 'ficha' | 'cla' | 'jutsu' | 'habilidade' | 'arma' | 'item' | 'marionete' | 'pt';
export type EstadoFila = 'pendente' | 'aguardando' | 'decidido';
export interface ItemFila {
	chave: string;
	tipo: TipoFila;
	id: string;
	titulo: string;
	subtitulo: string;
	rotuloTipo: string;
	autor: string;
	autorId: string | null;
	enviado: string | null;
	versao: number;
	estado: EstadoFila;
	status: string;
	decidido: string | null;
	excecao: string | null;
	icone: string;
	cor: string;
	custo: string;
	rank: string | null;
	corpo: string[];
	verificacoes: { nivel: 'ok' | 'aviso' | 'bloqueio'; texto: string; ref: string }[];
	efeitos: string[];
	comentarios: { autor: string; texto: string }[];
	dependeDe: string | null;
	href: string | null;
}
