-- História do personagem: o texto livre da vida dele (não o background mecânico), com a mesma formatação simples das
-- anotações. O dono escreve (o Mestre, nos NPCs de ficha completa e nos pré-gerados dele); o Mestre lê; o grupo não.

alter table public.personagens add column historia text not null default '' check (char_length(historia) <= 30000);

create function public.salvar_historia(ficha uuid, texto text) returns void
language plpgsql security definer set search_path = '' as $$
declare
	p public.personagens;
begin
	select * into p from public.personagens where id = ficha;
	if p.id is null or p.jogador_id is distinct from (select auth.uid()) then raise exception 'Ficha não encontrada.' using errcode = '42501'; end if;
	if not public.campanha_ativa(p.campanha_id) then raise exception 'Campanha arquivada é somente leitura.' using errcode = 'P0001'; end if;
	if char_length(coalesce(texto, '')) > 30000 then raise exception 'História longa demais (máximo 30.000 caracteres).' using errcode = 'P0001'; end if;
	update public.personagens set historia = coalesce(texto, '') where id = ficha;
end $$;

revoke execute on function public.salvar_historia(uuid, text) from public, anon, authenticated;
grant execute on function public.salvar_historia(uuid, text) to authenticated;
