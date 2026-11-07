#!/bin/bash
# Ignored Build Step da Vercel (ignoreCommand no vercel.json). Atenção, é o contrário do normal: sair com 0 cancela o build, sair com 1 constrói.
# Na dúvida, constrói: tudo aqui que falhar ou faltar cai no build de sempre.
#
# Por que existe: o time gratuito tem 10 GB para deploys, e cada deploy pesa 62 MB. O site saía duas vezes a cada push, uma por projeto.

# O projeto -mela é uma cópia que não serve o site (o domínio público é do shinobi-rising-webapp).
case "$VERCEL_URL" in
	*shinobi-rising-webapp-mela*)
		echo 'Projeto duplicado: sem build.'
		exit 0
		;;
esac

# Plano, migração e arte em produção não mudam o site. O conteudo/ fica de fora da lista: o livro sai de lá.
# Só o *.md da raiz conta aqui: sem o glob, a regra pegaria também os capítulos do conteudo/.
anterior="$VERCEL_GIT_PREVIOUS_SHA"
if [ -z "$anterior" ] || ! git cat-file -e "$anterior^{commit}" 2>/dev/null; then
	echo 'Sem o último deploy para comparar: constrói.'
	exit 1
fi
# O mesmo commit de novo é um Redeploy pedido no painel, quase sempre porque mudou uma variável: o código é igual, mas o build não é.
if [ "$anterior" = "$(git rev-parse HEAD)" ]; then
	echo 'Redeploy do mesmo commit: constrói.'
	exit 1
fi
if git diff --quiet "$anterior" HEAD -- . ':(exclude)planos' ':(exclude)supabase' ':(exclude)pixellab' ':(exclude)legado' ':(exclude,glob)*.md'; then
	echo "Nada muda o site desde ${anterior:0:7}: sem build."
	exit 0
fi
echo 'O site mudou: constrói.'
exit 1
