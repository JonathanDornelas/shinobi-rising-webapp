-- Mesa: o fundo do quadro girado. Ao ajustar a grade ao mapa, o Mestre gira a imagem sob a grade (que fica reta) até o
-- piso desenhado casar com os quadrados. Graus no sentido horário da tela, em volta do centro da imagem.
alter table public.mesa_cenas
	add column fundo_rotacao real not null default 0 check (fundo_rotacao > -360 and fundo_rotacao < 360);
