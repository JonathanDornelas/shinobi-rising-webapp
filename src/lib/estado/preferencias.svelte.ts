// Tema (sumi/washi/sistema), tamanho do texto de leitura e o tema do usuário (cores, escala, raio), aplicados no <html>
// e lembrados neste dispositivo; o perfil guarda os mesmos valores para os outros aparelhos.
import { gravarTexto } from './armazenamento.ts';
import { normalizarVisual, variaveis, type Visual } from './visual.ts';

export type Tema = 'sumi' | 'washi' | 'sistema';
export const TAMANHOS_LEITURA = [15, 17, 18, 20] as const;
export type TamanhoLeitura = (typeof TAMANHOS_LEITURA)[number];

const resolver = (t: Tema) => (t === 'sistema' ? (matchMedia('(prefers-color-scheme: light)').matches ? 'washi' : 'sumi') : t);

class Preferencias {
	tema = $state<Tema>('sumi');
	/** Tema efetivamente aplicado (sistema resolvido para sumi ou washi). */
	aplicado = $state<'sumi' | 'washi'>('sumi');
	leitura = $state<TamanhoLeitura>(17);
	visual = $state<Visual>({});
	private aplicadas: string[] = [];

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
		try {
			this.definirVisual(normalizarVisual(JSON.parse(localStorage.getItem('snm:visual') ?? '{}')));
		} catch {
			/* sem armazenamento: fica o padrão */
		}
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

	/** Aplica o tema do usuário (as variáveis que não vierem voltam ao padrão do tema). */
	definirVisual(v: Visual) {
		const d = document.documentElement;
		this.visual = v;
		for (const k of this.aplicadas) d.style.removeProperty(k);
		const vars = variaveis(v);
		for (const [k, valor] of Object.entries(vars)) d.style.setProperty(k, valor);
		this.aplicadas = Object.keys(vars);
		if (v.raio) d.dataset.raio = '';
		else delete d.dataset.raio;
		if (vars['--escala']) d.dataset.escala = '';
		else delete d.dataset.escala;
		gravarTexto('visual', JSON.stringify(v));
		// o script do app.html aplica estas variáveis antes da primeira pintura
		gravarTexto('visual-css', JSON.stringify(vars));
	}

	definirLeitura(tamanho: TamanhoLeitura) {
		this.leitura = tamanho;
		document.documentElement.dataset.leitura = String(tamanho);
		gravarTexto('leitura', String(tamanho));
	}
}

export const preferencias = new Preferencias();
