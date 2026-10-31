-- Vários personagens por jogador: o jogador pode ter mais de uma ficha ativa na mesma campanha, todas em jogo ao mesmo
-- tempo (na Mesa ele põe os tokens que quiser e escolhe qual ficha abrir). Sai o índice de uma ficha ativa por jogador e
-- a trava do pré-gerado (assumir um não depende mais de não ter outra ficha).
drop index if exists public.personagens_um_por_jogador;

create or replace function public.assumir_pre_gerado(ficha uuid) returns void
language plpgsql security definer set search_path = '' as $$
declare
	p public.personagens;
	k public.campanhas;
	uid uuid := (select auth.uid());
	nome_jogador text;
begin
	select * into p from public.personagens where id = ficha for update;
	if p.id is null or not p.pre_gerado or p.status <> 'aprovada' or p.situacao <> 'ativo' then raise exception 'Este pré-gerado não está disponível.' using errcode = 'P0001'; end if;
	if not public.eh_membro(p.campanha_id) then raise exception 'Você não faz parte desta campanha.' using errcode = '42501'; end if;
	select * into k from public.campanhas where id = p.campanha_id;
	if k.arquivada_em is not null then raise exception 'Campanha arquivada é somente leitura.' using errcode = 'P0001'; end if;
	if k.mestre_id = uid then raise exception 'O Mestre não assume pré-gerados.' using errcode = 'P0001'; end if;
	update public.personagens set jogador_id = uid, pre_gerado = false where id = p.id;
	select nome into nome_jogador from public.perfis where id = uid;
	perform public.registrar_ficha(p.id, 'assumido', coalesce(nome_jogador, 'Um jogador') || ' assumiu o pré-gerado', 'papel/ic-papel-jogador');
	perform public.registrar_atividade(k.id, 'pre_gerado', coalesce(nome_jogador, 'Um jogador') || ' assumiu ' || p.nome, 'acao/ic-acao-criar-personagem');
	if k.mestre_id is not null then
		perform public.notificar(k.mestre_id, 'pre_gerado', coalesce(nome_jogador, 'Um jogador') || ' assumiu o pré-gerado ' || p.nome, '/campanhas/' || k.id || '/personagens/' || p.id, 'papel/ic-papel-jogador');
	end if;
end $$;
