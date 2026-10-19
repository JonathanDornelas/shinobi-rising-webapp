// Formatos de data e número do app (DS 1 · Voz: "14.000 ryo", "16 out. 2026", "há 3 min").
const MESES = ['jan.', 'fev.', 'mar.', 'abr.', 'maio', 'jun.', 'jul.', 'ago.', 'set.', 'out.', 'nov.', 'dez.'];

export function numero(n: number): string {
	return n.toLocaleString('pt-BR');
}

/** "14 out." no ano corrente; "14 out. 2025" em outros anos. */
export function dataCurta(iso: string | Date, agora = new Date()): string {
	const d = new Date(iso);
	const base = `${d.getDate()} ${MESES[d.getMonth()]}`;
	return d.getFullYear() === agora.getFullYear() ? base : `${base} ${d.getFullYear()}`;
}

/** "agora", "há 5 min", "há 2 h", "ontem", "há 3 dias", depois a data curta. */
export function tempoRelativo(iso: string | Date, agora = new Date()): string {
	const seg = Math.round((agora.getTime() - new Date(iso).getTime()) / 1000);
	if (seg < 45) return 'agora';
	const min = Math.round(seg / 60);
	if (min < 60) return `há ${min} min`;
	const h = Math.round(min / 60);
	if (h < 24) return `há ${h} h`;
	const dias = Math.floor(h / 24);
	if (dias === 1) return 'ontem';
	if (dias < 7) return `há ${dias} dias`;
	return dataCurta(iso, agora);
}

const MESES_LONGOS = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];
const chaveDia = (d: Date) => `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;

/** Separador de dia do registro (como no Discord): "Hoje", "Ontem", "16 de outubro de 2026". */
export function rotuloDia(iso: string | Date, agora = new Date()): string {
	const d = new Date(iso);
	if (chaveDia(d) === chaveDia(agora)) return 'Hoje';
	const ontem = new Date(agora);
	ontem.setDate(agora.getDate() - 1);
	if (chaveDia(d) === chaveDia(ontem)) return 'Ontem';
	return `${d.getDate()} de ${MESES_LONGOS[d.getMonth()]} de ${d.getFullYear()}`;
}

/** "14:05" no fuso de quem vê. */
export const hora = (iso: string | Date) => new Date(iso).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

/** Agrupa itens (já em ordem) por dia, para os separadores de data. */
export function porDia<T>(itens: T[], data: (x: T) => string, agora = new Date()): { dia: string; itens: T[] }[] {
	const grupos: { dia: string; itens: T[] }[] = [];
	for (const x of itens) {
		const dia = rotuloDia(data(x), agora);
		if (grupos.at(-1)?.dia === dia) grupos.at(-1)!.itens.push(x);
		else grupos.push({ dia, itens: [x] });
	}
	return grupos;
}

/** "expira em 4 dias", "expira amanhã", "expirou". */
export function expiraEm(iso: string | null, agora = new Date()): string {
	if (!iso) return 'sem validade';
	const ms = new Date(iso).getTime() - agora.getTime();
	if (ms <= 0) return 'expirou';
	const h = Math.ceil(ms / 3.6e6);
	if (h < 24) return `expira em ${h} h`;
	const d = Math.ceil(h / 24);
	return d === 1 ? 'expira amanhã' : `expira em ${d} dias`;
}

/** Iniciais para o retrato provisório (até existirem os avatares PixelLab). */
export function iniciais(nome: string): string {
	const partes = nome.trim().split(/\s+/).filter(Boolean);
	return ((partes[0]?.[0] ?? '?') + (partes.length > 1 ? partes[partes.length - 1][0] : '')).toUpperCase();
}
