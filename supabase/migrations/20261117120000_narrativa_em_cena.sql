-- Cena narrativa: os personagens e NPCs que o Mestre traz para cima da imagem, um a um, para ilustrar quem está em cena.
-- Cada um: { chave ('pc:<id>', 'npc:<id>', 'ficha:<id>'), nome (null quando o nome está escondido do grupo), retrato }.
-- Só o Mestre muda a cena.
alter table public.mesa_cenas
	add column em_cena jsonb not null default '[]'::jsonb
		check (jsonb_typeof(em_cena) = 'array' and jsonb_array_length(em_cena) <= 12 and pg_column_size(em_cena) <= 6000);
