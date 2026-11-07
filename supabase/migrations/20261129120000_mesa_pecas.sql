-- Peças de mapa, as cenas do fingersMap: uma imagem de pé com o ponto de apoio no meio dela, e não na base, para passar à
-- frente ou atrás de cada token na hora certa. `desce` é quanto a imagem vai abaixo do apoio, em metros de tela. Fica nulo
-- nas imagens soltas, que seguem com a base no apoio.
alter table public.mesa_objetos add column desce real check (desce is null or desce between 0 and 40);
