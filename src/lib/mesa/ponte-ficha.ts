// Ponte entre a Mesa e a ficha completa aberta em outra janela (o segundo monitor): as duas conversam pelo
// BroadcastChannel do navegador, sem servidor. A ficha pede (medir, atacar, dano) e a Mesa faz, com a régua, os alvos
// e o crítico dela; o estado (PV, PC, PE, estados) vai e volta para as duas mostrarem o mesmo.
// Cada aba da Mesa tem um id (guardado na sessão da aba, sobrevive ao recarregar): a janela da ficha só fala com a Mesa
// que a abriu, para duas Mesas abertas não rolarem o mesmo ataque duas vezes.
import type { EstadoJogo } from '#lib/personagem/progressao.ts';
import type { ModoRolagem } from '#lib/supabase/banco.ts';

export type AcaoPonte = 'medir' | 'usar' | 'medirArma' | 'atacar';

export type MsgPonte =
	/** a ficha chegou (ou procura a Mesa de novo) */
	| { tipo: 'ola'; pid: string; aba: string | null }
	/** a Mesa respondeu: a ficha fica ligada */
	| { tipo: 'aqui'; pid: string; aba: string; estado: EstadoJogo | null }
	| {
			tipo: 'acao';
			id: string;
			pid: string;
			aba: string | null;
			acao: AcaoPonte;
			/** slug do jutsu ou nome da arma */
			alvo: string;
			parte?: 'ataque' | 'dano';
			/** a vantagem e o crítico escolhidos na setinha da ficha */
			modo: Exclude<ModoRolagem, 'critico'>;
			critico: boolean | null;
	  }
	/** a Mesa fez (ok false: o personagem não está na cena) */
	| { tipo: 'feito'; id: string; ok: boolean }
	| { tipo: 'estado'; pid: string; estado: EstadoJogo; de: 'mesa' | 'ficha' }
	/** a aba da Mesa fechou */
	| { tipo: 'tchau'; aba: string };

export const temPonte = () => typeof BroadcastChannel !== 'undefined';
export const abrirPonte = (campanha: string) => new BroadcastChannel(`shinobi-mesa:${campanha}`);

/** O id desta aba da Mesa (o mesmo depois de recarregar a página). */
export function idDaAba(): string {
	try {
		let id = sessionStorage.getItem('mesa-aba');
		if (!id) sessionStorage.setItem('mesa-aba', (id = crypto.randomUUID()));
		return id;
	} catch {
		return crypto.randomUUID();
	}
}

/** O endereço da ficha numa janela à parte, ligada a esta aba da Mesa. */
export const urlJanela = (campanha: string, pid: string, aba: string) => `/campanhas/${campanha}/mesa/janela/${pid}?aba=${encodeURIComponent(aba)}`;
