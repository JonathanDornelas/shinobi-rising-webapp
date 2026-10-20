# Livro de Jutsus: plano

Objetivo: uma seção nova do site, o **Livro de Jutsus**, com quase todos os jutsus de Naruto que não são de clã. Cada um ganha texto próprio e é balanceado pelas regras de criação (cap. 20). A Naruto Wiki serve de referência.

## O que existe hoje

- O livro tem 133 jutsus em `conteudo/jutsus.yaml`, quase metade deles de clã.
- O catálogo `/regras/jutsus` já tem filtros (tipo, rank, o que faz, ação, resistência, duração), quatro visualizações e favoritos.
- O criador de jutsus (`src/lib/jutsus/regras.ts`) calcula PJ, rank e custo a partir de componentes. Ele vira o balanceador automático do livro novo.

## O que a wiki oferece (levantado em 20/10/2026)

Li pela API pública só as fichas (`Infobox/Jutsu`) da categoria Jutsu.

| Recorte | Jutsus |
| - | - |
| Total na wiki | 3.029 |
| Aparecem no mangá ou no anime | 1.397 |
| São de clã (Hiden) | 312 |
| São Kekkei Genkai, Kekkei Tōta ou Dōjutsu | 565 |
| Não têm nome | 313 |
| **Candidatos** (mangá ou anime, sem clã, sem KKG, com nome) | **880** |
| Candidatos que aparecem no mangá | 551 |
| Candidatos que são Kinjutsu | 47 |

- **Rank dos candidatos:** só 258 têm rank na wiki (B 90, A 64, C 54, S 24, D 19, E 7). Os outros 622 não têm. Então o rank do livro vai sair do nosso cálculo de PJ, e o rank da wiki serve só de conferência.
- **Classificação:** Ninjutsu 686, Taijutsu 114, clones 54, Fūinjutsu 53, cooperação 52, Kenjutsu 49, Senjutsu 40, Espaço-Tempo 38, Bukijutsu 35, Genjutsu 25.
- **Natureza:** Água 96, Terra 74, Raio 74, Vento 72, Fogo 55, Yin 27.
- **Campos úteis da ficha:** `jutsu rank`, `jutsu classification`, `jutsu type` (natureza), `jutsu class type` (ofensivo, defensivo, suplementar), `jutsu range`, `hand signs`, `users`, `jutsu media`.
- **Licença:** o texto da wiki é CC BY-SA. Não copiamos prosa. Nome, rank, natureza e alcance são fatos e servem como referência. O texto de cada carta é nosso, na voz do livro, com uma página de créditos citando a wiki como fonte de referência.
- **Acesso:** a API responde sem login. O `robots.txt` fica atrás da Cloudflare, então a coleta é lenta e educada: 50 páginas por consulta, com pausa, e uma vez só.

## Como fazer

1. **Coleta.** Um script em `scripts/wiki/` baixa as fichas dos candidatos e guarda um JSON versionado (`conteudo/referencia/wiki-jutsus.json`), sem o texto dos artigos. A coleta de teste desta sessão já fez isso em cerca de 70 consultas.
2. **Triagem.** Uma planilha de decisão (`conteudo/referencia/triagem.yaml`) marca cada candidato como entra, sai ou junta-com-outro.
   - Saem as técnicas exclusivas de um personagem que não fazem sentido para um jogador (Amenomihashira, técnicas Ōtsutsuki) e as variações quase iguais.
   - Juntam-se as variações de um mesmo jutsu numa carta só, com "variações" nas notas.
   - Pela minha estimativa, ficam de 300 a 400 cartas.
3. **Tradução para o sistema.** Para cada carta, os componentes de PJ (dano, alcance, área, efeitos, modificadores) são escolhidos a partir da ficha e do que a técnica faz. O `calcularJutsu` dá o rank e o custo.
   - Se o rank calculado diferir do rank da wiki em mais de um degrau, a carta vai para revisão.
   - Jutsus de rank S e Kinjutsu exigem a aprovação do Mestre, como já acontece hoje.
4. **Texto.** Descrição curta em forma de cena, efeito em prosa clara e as palavras que o app lê para montar rolagens e filtros ("4d8 de dano", "fica Imobilizado", "−2 em"). O `conferir-catalogo.ts` garante que a ficha e os filtros entendem cada carta.
5. **Lotes.** Em ordem de uso na mesa: os cinco elementos, depois Taijutsu e Bukijutsu, Genjutsu, Fūinjutsu e barreiras, Espaço-Tempo, clones e cooperação, e Senjutsu por último. São lotes de 35 a 50 cartas, cada um com revisão sua.

## O livro no site

- **Seção nova:** "Livro de Jutsus" em `/regras/jutsus`, com capítulos por escola (Ninjutsu dos cinco elementos, Taijutsu, Genjutsu e assim por diante). Cada capítulo tem uma abertura em cena e as cartas. A página de cada jutsu continua a mesma.
- **Origem visível:** um selo diz se a carta é canônica do mangá, do anime ou criada para o livro, e um filtro novo, "Origem", aparece no catálogo.
- **Na campanha:** o Mestre escolhe quais livros valem (só clássico, até Shippuden, com Boruto). Quem não quer técnicas de uma era simplesmente as desliga.

## Esforço estimado

| Etapa | Tamanho |
| - | - |
| Coleta, triagem automática e planilha | 1 sessão |
| Revisão da triagem (sua) | algumas horas |
| Componentes, texto e conferência | de 7 a 9 lotes, cerca de 3 sessões |
| Seção nova no site e filtro de origem | 1 sessão |

## Decisões que são suas

1. **Eras:** só o clássico e Shippuden, ou também Boruto? Boruto acrescenta poder demais para o resto do livro.
2. **Anime e fillers:** entram as técnicas que só aparecem no anime (329 dos candidatos) ou só as do mangá (551)?
3. **Kinjutsu:** entram os 47, sempre com a aprovação do Mestre, ou ficam para outro livro?
4. **Tamanho:** a meta de 300 a 400 cartas serve, ou você prefere menos cartas e mais bem escolhidas?
5. **Nomes:** em rōmaji com a tradução, como hoje, ou com o nome em português como título?
