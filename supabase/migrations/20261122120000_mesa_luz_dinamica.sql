-- Luz dinâmica e mapas grandes na Mesa (planos/luz-dinamica.md).
-- A cena ganha paredes, portas e janelas (que cortam a visão e o passo), fontes de luz e o nível de luz do ambiente;
-- o token ganha a luz que carrega (tocha, lampião). O que o grupo já viu fica nos quadrados revelados da névoa.
-- O mapa grande vai em ladrilhos (pedaços de 1024 px) além da prévia de sempre, e a Mesa carrega só os que aparecem.

alter table public.mesa_cenas
	add column luz_dinamica boolean not null default false,
	add column luz_ambiente text not null default 'claro' check (luz_ambiente in ('claro', 'penumbra', 'escuro')),
	-- [[x1, y1, x2, y2, tipo], ...] em metros; tipo 0 parede, 1 porta fechada, 2 porta aberta, 3 porta trancada, 4 janela
	add column paredes jsonb not null default '[]'::jsonb check (jsonb_typeof(paredes) = 'array' and jsonb_array_length(paredes) <= 5000),
	-- [{id, x, y, plena, penumbra, acesa}, ...] em metros
	add column luzes jsonb not null default '[]'::jsonb check (jsonb_typeof(luzes) = 'array' and jsonb_array_length(luzes) <= 300),
	-- {pasta, w, h, lado, colunas, linhas}: os ladrilhos do fundo (null = só a imagem)
	add column fundo_ladrilhos jsonb check (fundo_ladrilhos is null or jsonb_typeof(fundo_ladrilhos) = 'object');

-- a exploração revela aos poucos, em trechos picados: mais espaço para os quadrados revelados
alter table public.mesa_cenas drop constraint if exists mesa_cenas_reveladas_check;
alter table public.mesa_cenas add constraint mesa_cenas_reveladas_check check (jsonb_typeof(reveladas) = 'array' and pg_column_size(reveladas) <= 250000);

alter table public.mesa_tokens
	add column luz jsonb check (luz is null or (jsonb_typeof(luz) = 'object' and (luz ->> 'plena')::numeric between 0 and 60 and (luz ->> 'penumbra')::numeric between 0 and 60));

alter table public.mesa_artes
	add column ladrilhos jsonb check (ladrilhos is null or jsonb_typeof(ladrilhos) = 'object');

-- Portas: quem tem um token a até 2,5 m da porta abre e fecha (a trancada, só o Mestre). A posição confere que a porta
-- ainda é a mesma (o Mestre pode ter mexido nas paredes entre o clique e a chamada).
create function public.mesa_porta(cena uuid, indice int, x1 real, y1 real) returns void
language plpgsql security definer set search_path = '' as $$
declare
	c public.mesa_cenas;
	p jsonb;
	tipo int;
	mx real;
	my real;
begin
	select * into c from public.mesa_cenas where id = cena;
	if c.id is null or not public.mesa_cena_aberta(cena) then raise exception 'Mesa travada pelo Mestre.' using errcode = 'P0001'; end if;
	p := c.paredes -> indice;
	if p is null or abs((p ->> 0)::real - x1) > 0.01 or abs((p ->> 1)::real - y1) > 0.01 then
		raise exception 'Essa porta mudou; tente de novo.' using errcode = 'P0001';
	end if;
	tipo := (p ->> 4)::int;
	if tipo not in (1, 2, 3) then raise exception 'Isso não é uma porta.' using errcode = 'P0001'; end if;
	if not public.eh_mestre(c.campanha_id) then
		if tipo = 3 then raise exception 'A porta está trancada.' using errcode = 'P0001'; end if;
		mx := ((p ->> 0)::real + (p ->> 2)::real) / 2;
		my := ((p ->> 1)::real + (p ->> 3)::real) / 2;
		if not exists (
			select 1 from public.mesa_tokens t
			where t.cena_id = cena and t.dono_id = auth.uid()
				and sqrt(power(t.x + t.tamanho / 2.0 - mx, 2) + power(t.y + t.tamanho / 2.0 - my, 2)) <= 2.5 + t.tamanho / 2.0
		) then
			raise exception 'Chegue perto da porta para abrir.' using errcode = 'P0001';
		end if;
	end if;
	update public.mesa_cenas set paredes = jsonb_set(paredes, array[indice::text, '4'], to_jsonb(case when tipo = 2 then 1 else 2 end)) where id = cena;
end $$;

revoke execute on function public.mesa_porta(uuid, int, real, real) from public, anon, authenticated;
grant execute on function public.mesa_porta(uuid, int, real, real) to authenticated;
