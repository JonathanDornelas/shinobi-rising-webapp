-- Mesa: cena narrativa e fundo do quadro.
-- Narrativa: a cena pode ser tática (o quadro) ou narrativa (uma imagem para todos, com o chat de rolagens ao lado).
-- Fundo: um mapa sob a grade, esticado na cena, com opacidade e a grade opcional. As imagens são as do livro
-- (/covers/..., /capitulos/...) ou enviadas pelo Mestre para mesa/<campanha>/<nome>.webp (leitura pública pela URL).
alter table public.mesa_cenas
	add column modo text not null default 'tatica' check (modo in ('tatica', 'narrativa')),
	add column imagem text,
	add column fundo text,
	add column fundo_opacidade real not null default 1 check (fundo_opacidade between 0.1 and 1),
	add column grade boolean not null default true,
	add constraint mesa_cenas_imagem_valida check (
		imagem is null or imagem ~ '^/(covers|capitulos)/[a-z0-9-]+\.png$'
		or (imagem ~ '^[0-9a-f-]{36}/[a-z0-9-]{1,60}\.webp$' and split_part(imagem, '/', 1) = campanha_id::text)
	),
	add constraint mesa_cenas_fundo_valido check (
		fundo is null or fundo ~ '^/(covers|capitulos)/[a-z0-9-]+\.png$'
		or (fundo ~ '^[0-9a-f-]{36}/[a-z0-9-]{1,60}\.webp$' and split_part(fundo, '/', 1) = campanha_id::text)
	);

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('mesa', 'mesa', true, 5242880, array['image/webp'])
on conflict (id) do nothing;

-- a pasta é o id da campanha; só o Mestre dela envia e apaga
create function public.mestre_da_pasta_mesa(caminho text) returns boolean
language sql stable security definer set search_path = '' as $$
	select split_part(caminho, '/', 1) ~ '^[0-9a-f-]{36}$' and exists (
		select 1 from public.campanhas c where c.id::text = split_part(caminho, '/', 1) and c.mestre_id = (select auth.uid())
	);
$$;

create policy "mesa: Mestre envia" on storage.objects for insert to authenticated
	with check (bucket_id = 'mesa' and public.mestre_da_pasta_mesa(name));
create policy "mesa: Mestre vê os seus" on storage.objects for select to authenticated
	using (bucket_id = 'mesa' and public.mestre_da_pasta_mesa(name));
create policy "mesa: Mestre apaga" on storage.objects for delete to authenticated
	using (bucket_id = 'mesa' and public.mestre_da_pasta_mesa(name));
