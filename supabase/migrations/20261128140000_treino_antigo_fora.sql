-- As funções que aceitavam a ficha inteira vinda do navegador saem de cena: treino e nível passam só por aprender_treinos e
-- alcancar_nivel. Esta migração roda depois de o site novo estar no ar, para ninguém ficar sem treinar durante o deploy.
drop function public.treinar(uuid, jsonb, jsonb, int, text);
drop function public.subir_nivel(uuid, jsonb, jsonb, jsonb, int);
