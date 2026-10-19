// Jutsus favoritos (catálogo e aba Jutsus da ficha). Com sessão, ficam no perfil (preferencias.favoritos.jutsus) e
// valem em qualquer aparelho; sem sessão, neste navegador. Ao entrar, os favoritos de visitante passam para o perfil.
// A sessão liga e desliga o perfil (conectar), para este módulo não depender dela.
import { gravar, ler } from './armazenamento.ts';

const CHAVE = 'favoritos-jutsus';
const MAX = 300;

class Favoritos {
	jutsus = $state<string[]>([]);
	private salvar: ((jutsus: string[]) => unknown) | null = null;

	iniciar() {
		if (!this.salvar) this.jutsus = ler<string[]>(CHAVE, []).filter((s) => typeof s === 'string');
	}

	/** Perfil carregado (com a lista guardada nele e como gravar) ou null ao sair. */
	conectar(doPerfil: string[] | undefined | null, salvar: ((jutsus: string[]) => unknown) | null) {
		if (!salvar) {
			this.salvar = null;
			this.jutsus = ler<string[]>(CHAVE, []);
			return;
		}
		this.salvar = salvar;
		const locais = ler<string[]>(CHAVE, []);
		const juntos = [...new Set([...(doPerfil ?? []), ...locais])].slice(0, MAX);
		this.jutsus = juntos;
		if (locais.length) {
			gravar(CHAVE, []);
			if (juntos.length !== (doPerfil ?? []).length) salvar(juntos);
		}
	}

	tem = (slug: string) => this.jutsus.includes(slug);

	alternar(slug: string) {
		this.jutsus = this.tem(slug) ? this.jutsus.filter((s) => s !== slug) : [slug, ...this.jutsus].slice(0, MAX);
		if (this.salvar) this.salvar(this.jutsus);
		else gravar(CHAVE, this.jutsus);
	}
}

export const favoritos = new Favoritos();
