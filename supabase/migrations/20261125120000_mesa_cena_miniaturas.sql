-- Miniaturas por cena: o tamanho de todas e a sombra ficam em cada cena ({ "escala": 1.2, "sombra": true }); o ajuste de
-- cada miniatura continua na campanha (campanhas.miniaturas.ajustes).
alter table public.mesa_cenas
	add column miniaturas jsonb not null default '{}'::jsonb check (jsonb_typeof(miniaturas) = 'object' and pg_column_size(miniaturas) < 2000);
