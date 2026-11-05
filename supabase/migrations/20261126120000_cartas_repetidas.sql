-- Goukakyu no Jutsu e Shōsen Jutsu tinham duas cartas iguais no catálogo: a segunda era a do exemplo do cap. 20, que agora
-- mostra a original. Quem guardou o identificador da cópia passa a apontar para a original, com as mesmas regras.
create function pg_temp.sem_copia(t text) returns text language sql immutable as $$
	select replace(replace(t, '"goukakyu-no-jutsu-2"', '"goukakyu-no-jutsu"'), '"shosen-jutsu-2"', '"shosen-jutsu"')
$$;

update public.personagens set dados = pg_temp.sem_copia(dados::text)::jsonb
where dados::text ~ '"(goukakyu-no-jutsu|shosen-jutsu)-2"';

update public.clas set dados = pg_temp.sem_copia(dados::text)::jsonb
where dados::text ~ '"(goukakyu-no-jutsu|shosen-jutsu)-2"';

update public.perfis set preferencias = pg_temp.sem_copia(preferencias::text)::jsonb
where preferencias::text ~ '"(goukakyu-no-jutsu|shosen-jutsu)-2"';

update public.npcs set jutsus = array_replace(array_replace(jutsus, 'goukakyu-no-jutsu-2', 'goukakyu-no-jutsu'), 'shosen-jutsu-2', 'shosen-jutsu')
where jutsus && array['goukakyu-no-jutsu-2', 'shosen-jutsu-2'];
