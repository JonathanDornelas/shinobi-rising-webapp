// Tema (sumi/washi/sistema) e tamanho do texto de leitura, aplicados no <html> e lembrados neste dispositivo.
import { gravarTexto } from './armazenamento.ts';

export type Tema = 'sumi' | 'washi' | 'sistema';
export const TAMANHOS_LEITURA = [15, 17, 18, 20] as const;
export type TamanhoLeitura = (typeof TAMANHOS_LEITURA)[number];

const resolver = (t: Tema) => (t === 'sistema' ? (matchMedia('(prefers-color-scheme: light)').matches ? 'washi' : 'sumi') : t);

class Preferencias {
	tema = $state<Tema>('sumi');
	/** Tema efetivamente aplicado (sistema resolvido para sumi ou washi). */
	aplicado = $state<'sumi' | 'washi'>('sumi');
	leitura = $state<TamanhoLeitura>(17);

	/** Lê o que o script do app.html já aplicou no documento. */
	iniciar() {
		const d = document.documentElement;
		try {
			const t = localStorage.getItem('snm:tema');
			this.tema = t === 'washi' || t === 'sistema' ? t : 'sumi';
		} catch {
			this.tema = d.dataset.theme === 'washi' ? 'washi' : 'sumi';
		}
		this.aplicado = d.dataset.theme === 'washi' ? 'washi' : 'sumi';
		const l = Number(d.dataset.leitura);
		this.leitura = (TAMANHOS_LEITURA as readonly number[]).includes(l) ? (l as TamanhoLeitura) : 17;
		matchMedia('(prefers-color-scheme: light)').addEventListener('change', () => this.tema === 'sistema' && this.definirTema('sistema'));
	}

	definirTema(tema: Tema) {
		this.tema = tema;
		this.aplicado = resolver(tema);
		document.documentElement.dataset.theme = this.aplicado;
		gravarTexto('tema', tema);
	}

	alternarTema() {
		this.definirTema(this.aplicado === 'sumi' ? 'washi' : 'sumi');
	}

	definirLeitura(tamanho: TamanhoLeitura) {
		this.leitura = tamanho;
		document.documentElement.dataset.leitura = String(tamanho);
		gravarTexto('leitura', String(tamanho));
	}
}

export const preferencias = new Preferencias();
