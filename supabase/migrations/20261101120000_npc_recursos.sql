-- NPC rápido com PC e PE em jogo: o PE máximo (o bestiário dá) e o PC e o PE atuais de cada membro, no formato do
-- pv_atual (vazio = cheio). A ficha rápida da Mesa tira e devolve os três, e os jutsus do NPC gastam o recurso.
alter table public.npcs
	add column pe int not null default 0 check (pe between 0 and 9999),
	add column pc_atual int[] not null default '{}' check (cardinality(pc_atual) <= 20),
	add column pe_atual int[] not null default '{}' check (cardinality(pe_atual) <= 20);
