-- Luz dinâmica: as paredes podem barrar o passo dos jogadores (o padrão) ou só a visão. Barrando, o jogador passa só por
-- porta aberta e por janela; o Mestre arrasta por onde quiser.
alter table public.mesa_cenas add column paredes_bloqueiam boolean not null default true;
