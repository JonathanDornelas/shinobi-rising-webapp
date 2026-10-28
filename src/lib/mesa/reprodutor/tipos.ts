// O contrato do reprodutor de música da Mesa: hoje só o YouTube, e outra fonte entra com o mesmo contrato. A tela e a sincronização só
// falam com isto (tocar, pausar, buscar, ir para a faixa, volume); cada fonte esconde o seu player oficial e traduz.
import type { FonteMusica } from '../musica.ts';

export interface FaixaInfo {
	titulo: string;
	artista: string;
	/** em segundos; 0 = não se sabe */
	duracao: number;
}

export interface EstadoReprodutor {
	pronto: boolean;
	tocando: boolean;
	/** segundos desde o começo da faixa atual */
	posicao: number;
	/** segundos; 0 = ao vivo ou desconhecida */
	duracao: number;
	/** faixa atual numa lista (0 quando é uma música só) */
	indice: number;
	/** quantas faixas a lista tem (0 = a fonte não diz) */
	total: number;
	titulo: string | null;
	artista: string | null;
	aoVivo: boolean;
	/** o que impede de tocar, em português; null quando está tudo bem */
	erro: string | null;
}

/**
 * O que o reprodutor avisa:
 *  - estado: tocou ou pausou (por quem mexeu no player, não só por nós)
 *  - faixa: a lista passou para outra faixa sozinha
 *  - fim: a música terminou
 *  - erro: não dá para tocar (vídeo bloqueado, link inválido…)
 *  - bloqueado: o navegador não deixou tocar sem um clique
 */
export type EventoReprodutor = 'estado' | 'faixa' | 'fim' | 'erro' | 'bloqueado';

export interface Reprodutor {
	readonly fonte: 'youtube';
	estado(): EstadoReprodutor;
	/** as faixas da lista que a fonte consegue listar (vazio no YouTube, que só diz quantas são) */
	faixas(): FaixaInfo[];
	/** o volume pode ser mudado pelo site? */
	readonly temVolume: boolean;
	tocar(): void;
	pausar(): void;
	buscar(segundos: number): void;
	/** vai para a faixa `indice` da lista (e para `segundos` dela) */
	irPara(indice: number, segundos?: number): void;
	/** de 0 a 100 */
	volume(v: number): void;
	destruir(): void;
}

export interface OpcoesReprodutor {
	/** o elemento (fora da tela) onde o player oficial mora */
	alvo: HTMLElement;
	fonte: FonteMusica;
	inicio: { indice: number; posicao: number; tocando: boolean };
	volume: number;
	aoEvento: (evento: EventoReprodutor) => void;
}

export type FabricaReprodutor = (o: OpcoesReprodutor) => Promise<Reprodutor>;

/** "3:07", "1:02:45". */
export function relogio(segundos: number): string {
	const s = Math.max(0, Math.floor(Number.isFinite(segundos) ? segundos : 0));
	const h = Math.floor(s / 3600);
	const m = Math.floor((s % 3600) / 60);
	const r = String(s % 60).padStart(2, '0');
	return h ? `${h}:${String(m).padStart(2, '0')}:${r}` : `${m}:${r}`;
}
