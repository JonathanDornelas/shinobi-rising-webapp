// Links do Lote 7. O badge de status é o mesmo dos clãs (STATUS_CLA), com os mesmos valores.
export { STATUS_CLA as STATUS_CRIACAO } from '#lib/clas/status.ts';

export const hrefJutsus = (campanha: string) => `/campanhas/${campanha}/jutsus`;
export const hrefJutsu = (campanha: string, jutsu: string, volta?: string | null) => `${hrefJutsus(campanha)}/${jutsu}${volta ? `?volta=${encodeURIComponent(volta)}` : ''}`;
/** Slug de um jutsu criado no catálogo da ficha e nos treinos. */
export const slugJutsuCriado = (id: string) => `jc-${id}`;
