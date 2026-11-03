-- Miniaturas: o token pode aparecer no quadro como uma miniatura de pé (pixel art em 8 direções, do catálogo do app) em
-- vez do retrato no círculo. `miniatura` é o id do catálogo (null = o token redondo); `rumo` é para onde a peça olha
-- (0 sul, 1 sudeste, 2 leste ... 7 sudoeste, na grade), gravado junto com o passo.
alter table public.mesa_tokens
	add column miniatura text check (miniatura ~ '^[a-z0-9-]{1,60}$'),
	add column rumo smallint not null default 0 check (rumo between 0 and 7);
