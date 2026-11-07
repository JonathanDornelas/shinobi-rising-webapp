# Mudança do banco para São Paulo

Feita em 2026-11-07, para o projeto `rising-naruto-sa` (`qjvdbwuvqyfbyhsthtgh`, `sa-east-1`). O passo a passo fica como registro. O caminho real foi outro, porque não havia a senha do banco antigo: tudo passou pela Management API da Supabase, com um token para cada projeto. Veja "Como foi feito".

## Como foi feito

- **Estrutura:** as 54 migrações do repositório, em ordem, no projeto novo. As funções foram refeitas depois a partir da produção, porque os arquivos daqui têm quebra de linha do Windows. Comparados 14 tipos de item dos dois lados (colunas, restrições, índices, políticas, gatilhos, funções, permissões, publicação, buckets), deu zero diferença.
- **Dados:** 27 tabelas, 1.937 linhas, 4 contas com as senhas, com a mesma impressão digital dos dois lados.
- **Arquivos:** 252 arquivos, com o dono de cada um.
- **Auth:** só a URL do site e os redirecionamentos eram diferentes. Os modelos de e-mail já eram iguais.
- **Prova:** uma conta descartável entrou com senha, leu o próprio perfil, foi barrada no que era dos outros, e foi apagada.
- **Medida:** a mesma leitura levou 65 ms no banco novo e 465 ms no antigo. O broadcast seguiu em 17 ms.

## Por quê

Cada leitura e gravação vai até Ohio e volta. Medido daqui em 2026-11-07, abrir conexão com a AWS leva cerca de 20 ms em São Paulo e 180 ms em Ohio. A medida foi feita em servidores da AWS, não na Supabase, então o ganho real ainda é uma estimativa. Gravações, leituras e carregamento de páginas devem melhorar. O broadcast continua nos 16 ms. Quem jogar de fora do Brasil fica mais lento.

A Supabase [não muda a região de um projeto existente](https://github.com/orgs/supabase/discussions/16341). O "restaurar em outro projeto" [mantém a região original](https://github.com/supabase/supabase/pull/53032). O caminho é criar um projeto novo em [`sa-east-1`](https://supabase.com/docs/guides/platform/regions) e [migrar para ele](https://supabase.com/docs/guides/platform/migrating-within-supabase/backup-restore).

## O tamanho da mudança

Levantado em produção em 2026-11-07. Vale conferir de novo no dia, porque estes números crescem.

| Item | Hoje |
| --- | --- |
| Banco | 18,5 MB, Postgres 17 |
| Contas | 4, só com e-mail |
| Arquivos | 252 (13 MB): `mesa` 241, `mapas` 3, `retratos` 8 |
| Edge Functions e tarefas agendadas | nenhuma |
| URL do projeto gravada nas tabelas públicas | nenhuma |
| Tabelas na publicação do Realtime | 10: `membros`, `notificacoes`, `rolagens`, `mesa_cenas`, `mesa_tokens`, `mesa_tracos`, `mesa_efeitos`, `mesa_objetos`, `mesa_jukebox`, `mesa_diario` |
| Auth | URL do site, 4 endereços de redirecionamento, e-mail da própria Supabase, confirmação de e-mail ligada |

Estimativa: cerca de uma hora de trabalho e uns 30 minutos com o site fora do ar.

## O que preparar antes

- **Quando:** com ninguém jogando. O que for gravado no banco antigo depois da cópia se perde.
- **Ferramentas:** Docker Desktop já está instalado. Falta o `psql` (Postgres 17, com a pasta `bin` no PATH) e o Supabase CLI.
- **Senhas:** a do banco antigo e a do novo. Ficam num arquivo local fora do git, nunca no chat.
- **Conexão:** a documentação usa a conexão direta. Se a rede não tiver IPv6, use a do Session pooler, que aparece no painel de cada projeto.

## Passo a passo

### 1. Criar o projeto

Em [database.new](https://database.new), escolha South America (São Paulo) e guarde a senha do banco.

### 2. Copiar o banco

Isto leva junto as contas, com as senhas, porque o esquema `auth` vem na cópia.

```
supabase db dump --remote=[ANTIGO] -f roles.sql --role-only
supabase db dump --remote=[ANTIGO] -f schema.sql
supabase db dump --remote=[ANTIGO] -f data.sql --use-copy --data-only -x "storage.buckets_vectors" -x "storage.vector_indexes"
```

```
psql \
  --single-transaction \
  --variable ON_ERROR_STOP=1 \
  --file roles.sql \
  --file schema.sql \
  --command 'SET session_replication_role = replica' \
  --file data.sql \
  --dbname [NOVO]
```

Se der erro de permissão com `supabase_admin`, comente as linhas `ALTER ... OWNER TO "supabase_admin"` no `schema.sql`. Se o erro for com `cli_login_postgres`, comente a linha `GRANT "postgres" TO "cli_login_postgres"` no `roles.sql`.

Os arquivos `roles.sql`, `schema.sql` e `data.sql` têm dados de quem joga. Ficam fora do git e são apagados no fim.

### 3. Copiar os arquivos

Eles não vêm no banco. Use o script em Node da [mesma página](https://supabase.com/docs/guides/platform/migrating-within-supabase/backup-restore), com as URLs e as chaves secretas dos dois projetos. Ele recria os buckets com os limites deles e copia os arquivos de 10 em 10.

### 4. Refazer o que não vem junto

A documentação não traz uma lista completa, então esta vem do que o projeto usa. Confira o painel dos dois lados.

- As publicações do Realtime, em Database > Publications, com as 10 tabelas acima.
- A URL do site e os 4 endereços de redirecionamento.
- As configurações do Realtime no painel. A Mesa usa canal privado: confira se o acesso público segue desligado, porque o código tem um desvio temporário para canal aberto.
- A confirmação de e-mail ligada.

### 5. Trocar o site de lugar

- Na Vercel, atualize `PUBLIC_SUPABASE_URL` e `PUBLIC_SUPABASE_PUBLISHABLE_KEY`, no projeto `shinobi-rising-webapp`.
- Em `vite.config.ts`, mude `adapter({ regions: ['cle1'] })` para `['gru1']` e atualize o comentário ao lado.
- Publique. Só depois disso o site passa a usar o banco novo.

Sem reaproveitar o JWT secret antigo, [as sessões abertas caem](https://supabase.com/docs/guides/troubleshooting/migrating-auth-users-between-projects) e as 4 contas entram de novo com a mesma senha. É o caminho mais simples. Trocar o secret no projeto novo regenera as chaves dele.

### 6. Conferir

- Contagem igual nos dois lados: contas, campanhas, personagens, cenas, tokens, arquivos.
- Entrar com uma conta, abrir uma ficha e abrir uma cena com mapa vivo.
- Mover um token com duas telas abertas e olhar o painel de rede da Mesa: confirmação do banco e ida e volta do canal.
- Uma rolagem, uma notificação, um retrato novo e o envio de um arquivo.

### 7. Depois

- Deixe o projeto antigo parado por alguns dias. Para voltar atrás, basta restaurar as duas variáveis e a região.
- Apague `roles.sql`, `schema.sql`, `data.sql` e o arquivo das senhas.
- Atualize o que cita Ohio e `cle1`: `vite.config.ts`, `src/lib/mesa/espelho.ts` e os planos.

## Se Claude conduzir

O usuário cria o projeto, muda as variáveis na Vercel e grava as senhas num arquivo local. O resto Claude faz, e confere no fim se os números bateram. O token de acesso à Supabase vence em 2026-11-09; depois disso é preciso um novo.

## Fontes

- [Regiões da Supabase](https://supabase.com/docs/guides/platform/regions)
- [Backup e restauração entre projetos](https://supabase.com/docs/guides/platform/migrating-within-supabase/backup-restore)
- [Migrar contas entre projetos](https://supabase.com/docs/guides/troubleshooting/migrating-auth-users-between-projects)
- [Resposta da equipe sobre mudar de região](https://github.com/orgs/supabase/discussions/16341)
- [Nota sobre restaurar em outro projeto](https://github.com/supabase/supabase/pull/53032)
