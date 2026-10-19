-- Anotações da ficha: caderno do dono (pistas, nomes, planos), em qualquer status da ficha. O Mestre lê; o grupo não.

alter table public.personagens add column anotacoes text not null default '' check (char_length(anotacoes) <= 20000);

create function public.salvar_anotacoes(ficha uuid, texto text) returns void
language plpgsql security definer set search_path = '' as $$
declare
	p public.personagens;
begin
	select * into p from public.personagens where id = ficha;
	if p.id is null or p.jogador_id is distinct from (select auth.uid()) then raise exception 'Ficha não encontrada.' using errcode = '42501'; end if;
	if not public.campanha_ativa(p.campanha_id) then raise exception 'Campanha arquivada é somente leitura.' using errcode = 'P0001'; end if;
	if char_length(coalesce(texto, '')) > 20000 then raise exception 'Anotações longas demais (máximo 20.000 caracteres).' using errcode = 'P0001'; end if;
	update public.personagens set anotacoes = coalesce(texto, '') where id = ficha;
end $$;

revoke execute on function public.salvar_anotacoes(uuid, text) from public, anon, authenticated;
grant execute on function public.salvar_anotacoes(uuid, text) to authenticated;
