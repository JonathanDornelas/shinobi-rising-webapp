-- Cenas de até 1 km de lado. O mapa vivo não depende de uma imagem do tamanho do mapa: o que limitava eram estas regras.
-- O fundo vai além do tamanho da cena porque guarda a imagem inteira, com o que passa das bordas, e a posição dela é medida do
-- canto da caixa isométrica. Paredes e luzes crescem com a área da cena, não com o lado: 20 mil paredes já são a soma das casas
-- de uma cidade inteira, depois de emendadas.

alter table public.mesa_cenas
	drop constraint mesa_cenas_largura_check,
	drop constraint mesa_cenas_altura_check,
	drop constraint mesa_cenas_fundo_escala_check,
	drop constraint mesa_cenas_fundo_x_check,
	drop constraint mesa_cenas_fundo_y_check,
	drop constraint mesa_cenas_luzes_check,
	drop constraint mesa_cenas_paredes_check;

alter table public.mesa_cenas
	add constraint mesa_cenas_largura_check check (largura between 5 and 1000),
	add constraint mesa_cenas_altura_check check (altura between 5 and 1000),
	add constraint mesa_cenas_fundo_escala_check check (fundo_escala between 1 and 2200),
	add constraint mesa_cenas_fundo_x_check check (fundo_x between -2500 and 2500),
	add constraint mesa_cenas_fundo_y_check check (fundo_y between -2500 and 2500),
	add constraint mesa_cenas_luzes_check check (jsonb_typeof(luzes) = 'array' and jsonb_array_length(luzes) <= 2000),
	add constraint mesa_cenas_paredes_check check (jsonb_typeof(paredes) = 'array' and jsonb_array_length(paredes) <= 20000);

alter table public.mesa_tokens
	drop constraint mesa_tokens_x_check,
	drop constraint mesa_tokens_y_check;

alter table public.mesa_tokens
	add constraint mesa_tokens_x_check check (x between 0 and 999),
	add constraint mesa_tokens_y_check check (y between 0 and 999);

alter table public.mesa_objetos
	drop constraint mesa_objetos_x_check,
	drop constraint mesa_objetos_y_check;

alter table public.mesa_objetos
	add constraint mesa_objetos_x_check check (x between -50 and 1050),
	add constraint mesa_objetos_y_check check (y between -50 and 1050);
