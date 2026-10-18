// Badge de status do clã (mesmo padrão das fichas: cor + ícone + texto) e links.
import type { StatusCla } from '#lib/supabase/banco.ts';

export const STATUS_CLA: Record<StatusCla, { rotulo: string; icone: string; classe: string }> = {
	rascunho: { rotulo: 'Rascunho', icone: 'status/ic-status-rascunho', classe: 'bg-[#5E6B73] text-white' },
	em_revisao: { rotulo: 'Em revisão', icone: 'status/ic-status-em-revisao', classe: 'bg-warn text-warnfg' },
	ajustes: { rotulo: 'Ajustes solicitados', icone: 'status/ic-status-ajustes', classe: 'bg-info text-infofg' },
	aprovado: { rotulo: 'Aprovado', icone: 'status/ic-status-aprovado', classe: 'bg-ok text-okfg' },
	rejeitado: { rotulo: 'Rejeitado', icone: 'status/ic-status-rejeitado', classe: 'bg-err text-errfg' }
};

export const hrefClas = (campanha: string) => `/campanhas/${campanha}/clas`;
export const hrefCla = (campanha: string, cla: string, ficha?: string | null) => `${hrefClas(campanha)}/${cla}${ficha ? `?ficha=${ficha}` : ''}`;
