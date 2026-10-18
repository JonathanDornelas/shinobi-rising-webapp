// CMP-06 · Badge de status da ficha: cor + ícone + texto (cor nunca é o único sinal).
import type { StatusFicha } from '#lib/supabase/banco.ts';

export const STATUS_FICHA: Record<StatusFicha, { rotulo: string; icone: string; classe: string }> = {
	rascunho: { rotulo: 'Rascunho', icone: 'status/ic-status-rascunho', classe: 'bg-b3 text-fg' },
	em_revisao: { rotulo: 'Em revisão', icone: 'status/ic-status-em-revisao', classe: 'bg-warn text-warnfg' },
	ajustes: { rotulo: 'Ajustes solicitados', icone: 'status/ic-status-ajustes', classe: 'bg-info text-infofg' },
	aprovada: { rotulo: 'Aprovada', icone: 'status/ic-status-aprovado', classe: 'bg-ok text-okfg' },
	rejeitada: { rotulo: 'Rejeitada', icone: 'status/ic-status-rejeitado', classe: 'bg-err text-errfg' }
};

export const hrefFicha = (campanha: string, ficha: string) => `/campanhas/${campanha}/personagens/${ficha}`;
/** Criador (rascunho, ajustes) e revisão do Mestre. */
export const hrefEditar = (campanha: string, ficha: string) => `${hrefFicha(campanha, ficha)}/editar`;
export const hrefNivel = (campanha: string, ficha: string) => `${hrefFicha(campanha, ficha)}/nivel`;

export const SITUACAO_FICHA = {
	ativo: { rotulo: 'Ativo', icone: 'status/ic-status-aprovado' },
	falecido: { rotulo: 'Falecido', icone: 'status/ic-status-revogado' },
	arquivado: { rotulo: 'Arquivado', icone: 'status/ic-status-rascunho' }
} as const;
