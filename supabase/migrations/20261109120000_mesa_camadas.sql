-- Mesa: camadas das imagens. O token vive entre as camadas: "chão" fica sob tudo (o piso, o tapete), "meio" é o padrão
-- (sob os tokens na vista de cima; na isométrica entra na ordem de pintura com eles, então o token passa atrás de uma
-- árvore e à frente do chão) e "acima" fica sobre os tokens (a copa da árvore, o telhado) em qualquer vista.
alter table public.mesa_objetos
	add column camada text not null default 'meio' check (camada in ('chao', 'meio', 'acima'));
