// Ações de convite usadas no painel (C3) e em Membros (C5), no navegador.
import { invalidateAll } from '$app/navigation';
import { toasts } from '#lib/estado/toasts.svelte.ts';
import { expiraEm } from '#lib/formatar.ts';
import { supabase } from '#lib/supabase/cliente.ts';
import type { Convite } from '#lib/supabase/banco.ts';

export type ConviteResumo = Pick<Convite, 'id' | 'tipo' | 'email' | 'token' | 'codigo' | 'expira_em' | 'max_usos' | 'usos' | 'status' | 'criado_em'>;

export const linkConvite = (token: string) => `${location.origin}/convite/${token}`;

/** "eiji@exemplo.com", "Link · 3 de 4 usos", "Código KNH-4F2". */
export function destinoConvite(c: ConviteResumo): string {
	if (c.tipo === 'email') return c.email ?? 'E-mail';
	const usos = c.max_usos ? ` · ${c.usos} de ${c.max_usos} ${c.max_usos === 1 ? 'uso' : 'usos'}` : c.usos ? ` · ${c.usos} ${c.usos === 1 ? 'uso' : 'usos'}` : '';
	return c.tipo === 'link' ? `Link${usos}` : `Código ${c.codigo}${usos}`;
}

/** Situação para a tabela de convites (C5). */
export function situacaoConvite(c: ConviteResumo, agora = new Date()): 'pendente' | 'aceito' | 'recusado' | 'revogado' | 'expirado' | 'esgotado' {
	if (c.status !== 'pendente') return c.status;
	if (c.expira_em && new Date(c.expira_em) <= agora) return 'expirado';
	if (c.max_usos !== null && c.usos >= c.max_usos) return 'esgotado';
	return 'pendente';
}

export const validadeConvite = (c: ConviteResumo) => expiraEm(c.expira_em);

export async function copiar(texto: string, aviso: string) {
	try {
		await navigator.clipboard.writeText(texto);
		toasts.mostrar(aviso, 'sucesso');
	} catch {
		toasts.mostrar('Não foi possível copiar. Selecione e copie à mão.', 'erro');
	}
}

export async function copiarConvite(c: ConviteResumo) {
	if (c.tipo === 'codigo' && c.codigo) return copiar(c.codigo, 'Código copiado.');
	return copiar(linkConvite(c.token), 'Link copiado.');
}

export async function revogarConvite(id: string) {
	const { error } = await supabase().from('convites').update({ status: 'revogado' }).eq('id', id);
	if (error) toasts.mostrar('Não foi possível revogar. Tente de novo.', 'erro');
	else toasts.mostrar('Convite revogado.', 'info');
	await invalidateAll();
}

export async function reenviarConvite(id: string) {
	const { error } = await supabase().rpc('reenviar_convite', { convite: id });
	if (error) toasts.mostrar('Não foi possível reenviar. Tente de novo.', 'erro');
	else toasts.mostrar('Convite renovado por mais 7 dias.', 'sucesso');
	await invalidateAll();
}
