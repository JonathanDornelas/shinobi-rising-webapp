-- As cenas de demonstração da luz dinâmica usam mapas do próprio site (static/mesa/demos/*.png): o fundo da cena passa a
-- aceitar esse caminho, além das artes do livro e das imagens enviadas pela campanha.
alter table public.mesa_cenas drop constraint mesa_cenas_fundo_valido;
alter table public.mesa_cenas add constraint mesa_cenas_fundo_valido check (
	fundo is null or fundo ~ '^/(covers|capitulos)/[a-z0-9-]+\.png$' or fundo ~ '^/mesa/demos/[a-z0-9-]+\.png$'
	or (fundo ~ '^[0-9a-f-]{36}/[a-z0-9-]{1,60}\.webp$' and split_part(fundo, '/', 1) = campanha_id::text)
);
