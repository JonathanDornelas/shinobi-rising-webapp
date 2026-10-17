// Estado da paleta de busca (G2) e buscas recentes.
import { gravar, ler } from './armazenamento';

class Paleta {
	aberta = $state(false);
	recentes = $state<string[]>([]);

	iniciar() {
		this.recentes = ler<string[]>('buscas', []);
	}
	abrir() {
		this.aberta = true;
	}
	fechar() {
		this.aberta = false;
	}
	lembrar(consulta: string) {
		const q = consulta.trim();
		if (q.length < 2) return;
		this.recentes = [q, ...this.recentes.filter((r) => r.toLowerCase() !== q.toLowerCase())].slice(0, 5);
		gravar('buscas', this.recentes);
	}
}

export const paleta = new Paleta();
