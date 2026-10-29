-- Mesa: camadas livres. Cada cena guarda a sua pilha de camadas, de baixo para cima, e o Mestre cria, renomeia, apaga e
-- reordena à vontade. Uma delas (tipo "tokens") é o lugar dos tokens na pilha: o que está abaixo dela fica sob os
-- tokens, o que está acima fica sobre eles. "em_pe" faz as imagens da camada entrarem na ordem de pintura com os tokens
-- na vista isométrica (passam à frente ou atrás de cada um, conforme a posição).
-- As imagens apontam para a camada pelo id; os ids "chao", "meio" e "acima" da migração anterior continuam valendo.

create function public.camadas_validas(c jsonb) returns boolean
language sql immutable set search_path = '' as $$
	select jsonb_typeof(c) = 'array'
		and jsonb_array_length(c) between 1 and 24
		and not exists (
			select 1 from jsonb_array_elements(c) e
			where jsonb_typeof(e) <> 'object'
				or coalesce(e ->> 'id', '') !~ '^[a-z0-9_-]{1,40}$'
				or char_length(trim(coalesce(e ->> 'nome', ''))) not between 1 and 40
		)
		and (select count(distinct e ->> 'id') from jsonb_array_elements(c) e) = jsonb_array_length(c)
		and (select count(*) from jsonb_array_elements(c) e where e ->> 'tipo' = 'tokens') = 1;
$$;

alter table public.mesa_cenas
	add column camadas jsonb not null
		default '[{"id": "chao", "nome": "Chão"}, {"id": "meio", "nome": "Meio", "em_pe": true}, {"id": "tokens", "nome": "Tokens", "tipo": "tokens"}, {"id": "acima", "nome": "Acima"}]'::jsonb
		check (public.camadas_validas(camadas) and pg_column_size(camadas) <= 6000);

-- a camada de uma imagem deixa de ser uma de três e passa a ser o id de uma camada da cena
alter table public.mesa_objetos drop constraint if exists mesa_objetos_camada_check;
alter table public.mesa_objetos add constraint mesa_objetos_camada_id check (camada ~ '^[a-z0-9_-]{1,40}$');

-- função pura usada na restrição da tabela: quem edita a cena precisa poder chamá-la (a restrição roda com o papel dele)
revoke execute on function public.camadas_validas(jsonb) from public, anon;
grant execute on function public.camadas_validas(jsonb) to authenticated;
