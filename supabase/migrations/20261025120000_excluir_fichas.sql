-- Excluir personagens: o dono exclui a própria ficha em qualquer status; o Mestre, qualquer ficha da campanha.
-- Registros e pedidos de PT vão junto (cascata); jutsus, equipamentos e rolagens ficam, sem o vínculo com a ficha.

create function public.excluir_ficha(ficha uuid) returns void
language plpgsql security definer set search_path = '' as $$
declare
	p public.personagens;
	mestre boolean;
begin
	select * into p from public.personagens where id = ficha;
	if p.id is null then raise exception 'Ficha não encontrada.' using errcode = '42501'; end if;
	mestre := public.eh_mestre(p.campanha_id);
	if p.jogador_id is distinct from (select auth.uid()) and not mestre then raise exception 'Ficha não encontrada.' using errcode = '42501'; end if;
	if not public.campanha_ativa(p.campanha_id) then raise exception 'Campanha arquivada é somente leitura.' using errcode = 'P0001'; end if;
	delete from public.personagens where id = ficha;
	if p.status = 'aprovada' then
		perform public.registrar_atividade(p.campanha_id, 'ficha_excluida',
			case when mestre and p.jogador_id is distinct from (select auth.uid()) then 'O Mestre excluiu a ficha de ' else 'Ficha excluída: ' end || coalesce(nullif(p.nome, ''), 'sem nome'),
			'status/ic-status-revogado');
	end if;
	-- o Mestre excluindo a ficha de um jogador: o jogador é avisado
	if p.jogador_id is distinct from (select auth.uid()) then
		perform public.notificar(p.jogador_id, 'ficha_excluida', 'O Mestre excluiu a ficha de ' || coalesce(nullif(p.nome, ''), 'sem nome'),
			'/campanhas/' || p.campanha_id || '/personagens', 'status/ic-status-revogado');
	end if;
end $$;

-- o Mestre também apaga o retrato das fichas da campanha (o arquivo sai antes da ficha)
create function public.pode_apagar_retrato(caminho text) returns boolean
language sql stable security definer set search_path = '' as $$
	select exists (
		select 1 from public.personagens p
		where p.id::text = split_part(caminho, '/', 1) and (p.jogador_id = (select auth.uid()) or public.eh_mestre(p.campanha_id))
	);
$$;
drop policy "retratos: dono apaga" on storage.objects;
create policy "retratos: dono ou Mestre apaga" on storage.objects for delete to authenticated
	using (bucket_id = 'retratos' and public.pode_apagar_retrato(name));
drop policy "retratos: dono vê os seus" on storage.objects;
create policy "retratos: dono ou Mestre vê" on storage.objects for select to authenticated
	using (bucket_id = 'retratos' and public.pode_apagar_retrato(name));

revoke execute on function public.excluir_ficha(uuid), public.pode_apagar_retrato(text) from public, anon, authenticated;
grant execute on function public.excluir_ficha(uuid), public.pode_apagar_retrato(text) to authenticated;
