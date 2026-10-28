-- Mesa: o fundo do quadro com escala e posição, e o enquadramento do retrato do NPC no token.
-- Fundo: fundo_escala é quantos metros a largura da imagem cobre (null = estica na cena inteira, como antes);
-- fundo_x e fundo_y são o canto de cima à esquerda da imagem, em metros.
-- Enquadramento: { zoom, x, y } como o do retrato do jogador (zoom 1 = o lado menor cabe no token; x e y em frações
-- do lado); null = o foco padrão da arte do bestiário.
alter table public.mesa_cenas
	add column fundo_escala real check (fundo_escala is null or fundo_escala between 1 and 1000),
	add column fundo_x real not null default 0 check (fundo_x between -1000 and 1000),
	add column fundo_y real not null default 0 check (fundo_y between -1000 and 1000);

alter table public.npcs
	add column enquadramento jsonb check (
		enquadramento is null or (
			jsonb_typeof(enquadramento) = 'object'
			and (enquadramento ->> 'zoom')::real between 0.5 and 8
			and abs((enquadramento ->> 'x')::real) <= 4
			and abs((enquadramento ->> 'y')::real) <= 4
		)
	);
