// Tema (sumi/washi) e tamanho do texto de leitura, aplicados no <html> e lembrados neste dispositivo.
import { gravarTexto } from './armazenamento';

export type Tema = 'sumi' | 'washi';
export const TAMANHOS_LEITURA = [15, 17, 18, 20] as const;
export type TamanhoLeitura = (typeof TAMANHOS_LEITURA)[number];

class Preferencias {
	tema = $state<Tema>('sumi');
	leitura = $state<TamanhoLeitura>(17);

	/** Lê o que o script do app.html já aplicou no documento. */
	iniciar() {
		const d = document.documentElement;
		this.tema = d.dataset.theme === 'washi' ? 'washi' : 'sumi';
		const l = Number(d.dataset.leitura);
		this.leitura = (TAMANHOS_LEITURA as readonly number[]).includes(l) ? (l as TamanhoLeitura) : 17;
	}

	definirTema(tema: Tema) {
		this.tema = tema;
		document.documentElement.dataset.theme = tema;
		gravarTexto('tema', tema);
	}

	alternarTema() {
		this.definirTema(this.tema === 'sumi' ? 'washi' : 'sumi');
	}

	definirLeitura(tamanho: TamanhoLeitura) {
		this.leitura = tamanho;
		document.documentElement.dataset.leitura = String(tamanho);
		gravarTexto('leitura', String(tamanho));
	}
}

export const preferencias = new Preferencias();
