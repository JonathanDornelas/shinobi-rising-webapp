-- Mapa vivo: a cena roda o motor do fingersMap em vez de mostrar uma imagem. Os arquivos ficam em mapas/<campanha>/<lote>/
-- (o mapa e a arte que ele usa) e `mapa_vivo` guarda onde estão e o que o Mestre controla: andar, hora, clima, vento,
-- telhados e corte das paredes. Mudar um desses é um patch comum na cena, que chega a todos pelo tempo real.
alter table public.mesa_cenas
	add column mapa_vivo jsonb check (mapa_vivo is null or jsonb_typeof(mapa_vivo) = 'object');

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('mapas', 'mapas', true, 52428800, array['application/octet-stream', 'application/json'])
on conflict (id) do nothing;

create policy "mapas: Mestre envia" on storage.objects for insert to authenticated
	with check (bucket_id = 'mapas' and public.mestre_da_pasta_mesa(name));
create policy "mapas: Mestre vê os seus" on storage.objects for select to authenticated
	using (bucket_id = 'mapas' and public.mestre_da_pasta_mesa(name));
create policy "mapas: Mestre apaga" on storage.objects for delete to authenticated
	using (bucket_id = 'mapas' and public.mestre_da_pasta_mesa(name));
