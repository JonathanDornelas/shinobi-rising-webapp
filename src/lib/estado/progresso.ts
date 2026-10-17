// "Continuar leitura": último capítulo aberto, salvo neste dispositivo.
import { gravar, ler } from './armazenamento';

export interface Progresso {
	capitulo: number;
	titulo: string;
	href: string;
	secao: string | null;
	secaoTitulo: string | null;
	/** 0–100 */
	pct: number;
}

export const lerProgresso = () => ler<Progresso | null>('progresso', null);
export const salvarProgresso = (p: Progresso) => gravar('progresso', p);
