// Toasts (DS 5 · 5.5): canto inferior direito no desktop, acima do dock no mobile.
export type TipoToast = 'info' | 'sucesso' | 'aviso' | 'erro';

export interface Toast {
	id: number;
	texto: string;
	tipo: TipoToast;
	icone: string;
}

const ICONE: Record<TipoToast, string> = {
	info: 'callout/ic-callout-destaque',
	sucesso: 'status/ic-status-aprovado',
	aviso: 'callout/ic-callout-atencao',
	erro: 'status/ic-status-rejeitado'
};

class Toasts {
	lista = $state<Toast[]>([]);
	private proximo = 1;

	mostrar(texto: string, tipo: TipoToast = 'info', duracao = 4000) {
		const id = this.proximo++;
		this.lista = [...this.lista, { id, texto, tipo, icone: ICONE[tipo] }];
		setTimeout(() => this.fechar(id), duracao);
	}

	fechar(id: number) {
		this.lista = this.lista.filter((t) => t.id !== id);
	}
}

export const toasts = new Toasts();
