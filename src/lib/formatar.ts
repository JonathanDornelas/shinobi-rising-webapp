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
