// O caminho rápido da Mesa. O banco fica em Ohio: gravar custa 187 ms só de rede, e o aviso dele ainda passa pelo fio único do Postgres Changes, que confere a permissão de
// cada inscrito. O broadcast chega à outra tela em 16 ms (medido do Brasil em 2026-11-06). Por isso o que alguém faz vai primeiro pelo broadcast e depois para o banco, que
// segue sendo a verdade: o aviso dele confirma o que já chegou, e é ele quem vale se o broadcast se perder.
//
// O broadcast não passa pelo RLS: quem está no canal recebe tudo. Só vai o que está nestas listas, e só o que o grupo já pode ler. Nome, PV e o que está escondido ficam fora.
import type { MesaCena, MesaToken } from '#lib/supabase/banco.ts';

const numero = (v: unknown) => typeof v === 'number' && Number.isFinite(v);
const logico = (v: unknown) => typeof v === 'boolean';
const tamanho = (v: unknown) => v === 1 || v === 3 || v === 6 || v === 10;
const ouNulo = (teste: (v: unknown) => boolean) => (v: unknown) => v === null || teste(v);

/** Os campos do token que qualquer um na mesa pode receber antes do banco, cada um com o que conta como valor de verdade. */
const CAMPOS_DO_TOKEN: Record<string, (v: unknown) => boolean> = {
	x: numero,
	y: numero,
	movido: numero,
	elevacao: numero,
	rumo: (v) => Number.isInteger(v) && (v as number) >= 0 && (v as number) < 8,
	ferimento: Number.isInteger,
	tamanho,
	tamanho_base: ouNulo(tamanho),
	crescido_turnos: ouNulo(Number.isInteger),
	luz: ouNulo((v) => !!v && typeof v === 'object' && numero((v as { plena?: unknown }).plena) && numero((v as { penumbra?: unknown }).penumbra)),
	condicoes: (v) => Array.isArray(v) && v.every((c) => typeof c === 'string'),
	reagiu: logico,
	aliado: logico,
	miniatura: ouNulo((v) => typeof v === 'string')
};

/** Os campos da cena que vão pelo caminho rápido. O nome fica de fora (o grupo vê o nome público), e a troca de cena ativa também: ela recarrega a página de quem joga. */
const CAMPOS_DA_CENA = [
	'travada',
	'mostrar_pv',
	'coordenadas',
	'iniciativa',
	'participantes',
	'terreno',
	'modo',
	'imagem',
	'fundo',
	'fundo_opacidade',
	'fundo_escala',
	'fundo_x',
	'fundo_y',
	'fundo_rotacao',
	'fundo_recorte',
	'fundo_ladrilhos',
	'mapa_vivo',
	'relogios',
	'clima',
	'em_cena',
	'luz_dinamica',
	'luz_ambiente',
	'luz_memoria',
	'miniaturas',
	'paredes_bloqueiam',
	'paredes',
	'luzes',
	'grade',
	'visao',
	'iso_razao',
	'iso_rotacao',
	'nevoa',
	'reveladas',
	'camadas'
] as const;

/** Acima disto a mudança espera o banco: o Realtime aceita pouco por segundo, e paredes novas não têm pressa de chegar 300 ms antes. */
export const TETO_DO_ESPELHO = 30_000;

/** As tabelas cujas linhas inteiras passam pelo canal. */
export const TABELAS_DO_ESPELHO = ['mesa_tokens', 'mesa_tracos', 'mesa_efeitos', 'mesa_objetos'] as const;
export type TabelaDoEspelho = (typeof TABELAS_DO_ESPELHO)[number];

/** O que deste patch pode ir pelo canal, conferido: vale para o que sai e para o que chega. Null: nada. */
export function parteDoToken(patch: unknown): Partial<MesaToken> | null {
	if (!patch || typeof patch !== 'object') return null;
	const parte = Object.fromEntries(Object.entries(patch).filter(([campo, valor]) => CAMPOS_DO_TOKEN[campo]?.(valor)));
	return Object.keys(parte).length ? (parte as Partial<MesaToken>) : null;
}

export function parteDaCena(patch: unknown): Partial<MesaCena> | null {
	if (!patch || typeof patch !== 'object') return null;
	const parte = Object.fromEntries(CAMPOS_DA_CENA.flatMap((campo) => (campo in patch ? [[campo, (patch as Record<string, unknown>)[campo]]] : [])));
	if (!Object.keys(parte).length || JSON.stringify(parte).length > TETO_DO_ESPELHO) return null;
	return parte as Partial<MesaCena>;
}

/** Um token inteiro, como o grupo pode ver: sem os números de PV. */
export const tokenPublico = (t: MesaToken): MesaToken => ({ ...t, pv: null, pv_max: null });

/** Só as colunas de `patch`, com os valores de `linha`: o que desfaz o patch sem mexer no resto. */
export const camposDe = <T extends object>(linha: T, patch: Partial<T>): Partial<T> => Object.fromEntries(Object.keys(patch).map((campo) => [campo, linha[campo as keyof T]])) as Partial<T>;

/** O valor como texto, com as chaves em ordem: o jsonb do banco devolve as chaves noutra ordem, e o mesmo valor não pode parecer outro. */
export const chaveDe = (v: unknown): string | undefined =>
	JSON.stringify(v, (_campo, x) => (x && typeof x === 'object' && !Array.isArray(x) ? Object.fromEntries(Object.entries(x).sort(([a], [b]) => (a < b ? -1 : 1))) : x));

/** Quanto tempo o banco tem para confirmar um valor. Passou disso, vale o que ele disser. */
const JANELA = 4000;

/**
 * O que esta tela acabou de mudar ou de receber pelo canal. O aviso do banco chega depois e pode ser de antes: outro campo do mesmo token gravado um instante atrás traz a
 * posição antiga. Enquanto o banco não confirma um valor, um aviso diferente não o desfaz. É campo a campo: o resto do aviso vale.
 */
export class Frescos {
	private vivos = new Map<string, Map<string, { valor: string | undefined; ate: number; quando: number }>>();

	/** `aoConfirmar` recebe quantos ms o banco levou para confirmar. */
	constructor(private aoConfirmar?: (ms: number) => void) {}

	marcar(dono: string, campos: object) {
		const agora = Date.now();
		let lista = this.vivos.get(dono);
		if (!lista) this.vivos.set(dono, (lista = new Map()));
		for (const [campo, valor] of Object.entries(campos)) lista.set(campo, { valor: chaveDe(valor), ate: agora + JANELA, quando: agora });
	}

	/** O aviso do banco, com o que ainda vale daqui no lugar do que ele trouxe, e os campos que ele confirmou. */
	filtrar<T extends object>(dono: string, aviso: T, atual: T | undefined): { linha: T; confirmados: Set<string> } {
		const confirmados = new Set<string>();
		const lista = this.vivos.get(dono);
		if (!lista) return { linha: aviso, confirmados };
		const agora = Date.now();
		const linha = { ...aviso } as Record<string, unknown>;
		for (const [campo, f] of lista) {
			if (agora > f.ate) lista.delete(campo);
			else if (chaveDe(linha[campo]) === f.valor) {
				lista.delete(campo);
				confirmados.add(campo);
				this.aoConfirmar?.(agora - f.quando);
			} else if (atual) linha[campo] = (atual as Record<string, unknown>)[campo];
		}
		if (!lista.size) this.vivos.delete(dono);
		return { linha: linha as T, confirmados };
	}
}
