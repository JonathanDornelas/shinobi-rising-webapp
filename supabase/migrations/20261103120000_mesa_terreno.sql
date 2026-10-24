-- Mesa: terreno difícil marcado pelo Mestre (cap. 4, Terreno). A cena guarda os quadrados [[x, y], ...] onde cada metro
-- custa 2 m; a régua e o arrasto mostram o custo maior. Só o Mestre edita a cena (política "Mestre edita" de mesa_cenas).
alter table public.mesa_cenas
	add column terreno jsonb not null default '[]'::jsonb check (jsonb_typeof(terreno) = 'array' and jsonb_array_length(terreno) <= 10000);
