-- Luz dinâmica: a memória do que o grupo já explorou pode ser desligada por cena. Ligada, o explorado fica esmaecido (sem
-- os inimigos); desligada, tudo o que ninguém vê agora fica no breu. Desligar não apaga o explorado: religando, ele volta.
alter table public.mesa_cenas add column luz_memoria boolean not null default true;
