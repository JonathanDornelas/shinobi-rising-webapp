-- Mesa: na vista isométrica, a grade pode ficar só dentro do retângulo da imagem de fundo (o losango da grade não cabe
-- num retângulo sem sobrar). Ligado, o quadro corta a grade, o chão, o terreno, os traços, a névoa e a base dos efeitos
-- pela borda do mapa; os quadrados das pontas ficam pela metade.
alter table public.mesa_cenas
	add column fundo_recorte boolean not null default false;
