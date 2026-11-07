# Replicação ao vivo: o que os jogos online fazem e o que vale para a Mesa

Pesquisa de 2026-11-07. A pergunta era quais práticas e stacks os MMOs e jogos online usam para replicar as ações de vários jogadores ao vivo, para decidir a fase 2 de otimização da Mesa.

## Conclusão

Os itens 1, 2 e 3 abaixo saíram em 2026-11-07. A Mesa já usava boa parte do que importa: previsão local com correção, conflito por campo, salas isoladas e ressincronização ao reconectar. Trocar a stack traria pouco, e em um caso pioraria a latência. As melhorias que valem são pequenas e ficam no cliente. A exceção é levar o banco para São Paulo, o maior ganho. A obra cresce com os dados, e hoje ainda é pequena.

Os MMOs resolvem um problema que a Mesa não tem: milhares de entidades num mundo só, com tiros resolvidos em milissegundos. A Mesa tem uma mesa com até uma dúzia de pessoas, turnos e dezenas de tokens. Dessas técnicas, servem as que tratam da sensação de movimento e da recuperação de falhas, não as de escala.

## O que a Mesa já faz

| Técnica | Quem usa | Na Mesa |
| --- | --- | --- |
| Previsão no cliente e correção | [Gambetta, parte II](https://gabrielgambetta.com/client-side-prediction-server-reconciliation.html), [Overwatch](https://edgegap.com/blog/game-backend-deep-dive-overwatch-2016-netcode-architecture-rollback) | Aplica na hora, manda, e desfaz se o banco recusar (`patchCena`) |
| Conflito por propriedade, último valor ganha | [Figma](https://madebyevan.com/figma/how-figmas-multiplayer-technology-works/) | `Frescos`, campo a campo, com o banco como árbitro |
| Sala isolada | [Owlbear Rodeo 2.0](https://blog.owlbear.rodeo/owlbear-rodeo-2-0-dev-log-2/) | Um canal por campanha, nada de cena em preparo no canal |
| Servidor não entrega o que está escondido | [League e VALORANT](https://technology.riotgames.com/node/108) | RLS em `visivel`. Só até aí: veja o item 6 |
| Dado sorteado no servidor | Prática de todo jogo com economia | RPC `rolar`, fora do caminho rápido de propósito |
| Estado inteiro ao reconectar | Todos | `ressincronizar` ao voltar a conexão ou a aba |

## O que falta, em ordem de ganho por esforço

**1. Enxergar a rede em produção. Feito.** A Source tem o [net_graph](https://developer.valvesoftware.com/wiki/Net_graph) porque não se ajusta o que não se vê. O painel do Mestre (`RedeMesa.svelte`, botão de barras na barra de cima) mostra a ida e volta até cada pessoa, a confirmação do banco, as mensagens por segundo e as perdas, com um botão para copiar os números. A ida e volta sai de uma sonda que só roda com o painel aberto, a cada 5 s. Uma conexão real com a Supabase deu 16 a 17 ms até o servidor. Falta uma sessão de jogo de verdade para decidir os itens 4 e 5.

**2. Interpolar o que os outros movem. Feito.** Medido na cidade de 1 km: o fantasma pulava 1 m por mensagem, e agora o maior salto é de 0,13 m por quadro, a 60 fps. Ele fica 160 ms atrás, porque o atraso precisa passar do intervalo entre mensagens, e o token que pousa desliza em até 320 ms. Quem pediu menos movimento no sistema vê como antes. Antes, o fantasma chegava 12 vezes por segundo e pulava de posição em posição. A Source desenha o mundo [100 ms no passado](https://developer.valvesoftware.com/wiki/Source_Multiplayer_Networking) e desliza entre duas mensagens reais, sem prever nada, e isso ainda cobre a perda de uma delas. [Gambetta descreve o mesmo](https://gabrielgambetta.com/entity-interpolation.html). Com isso o envio caiu de 12 para 8 por segundo, com movimento mais suave. Isso também alivia o limite do canal: pela conta do próprio código, uma pessoa arrastando numa mesa de 6 gastava cerca de 72 dos 100 eventos por segundo do projeto, e agora gasta cerca de 48. A conta de visão continua nas posições reais, só o desenho desliza.

**3. Número de sequência por remetente. Feito.** A correção por baseline do [Gaffer](https://www.gafferongames.com/post/snapshot_compression/) depende de saber o que chegou. Cada mensagem do caminho rápido leva quem mandou, a conexão e a ordem (`rede.ts`). Faltou uma: a tela espera 1,5 s pelo aviso do banco e relê. Chegou fora de ordem: é ignorada. Com isso a conferência de tempos em tempos foi de 12 para 30 s, e a releitura completa de 45 s para 2 min, o que pesa numa cena grande, porque cada leitura traz as paredes todas. A falta só aparece a partir da segunda mensagem vista de alguém, e o canal não confere quem manda, então um número absurdo é ignorado.

**4. Broadcast do banco no lugar do Postgres Changes.** Médio, e espera o número do painel: só vale se a confirmação vier lenta numa sessão real. O Postgres Changes [confere a permissão de cada inscrito e processa num fio só](https://supabase.com/docs/guides/realtime/postgres-changes). Um [teste de terceiros](https://dev.to/kubeden/neon-realtime-vs-supabase-realtime-410g) deu 58 a 60 ms contra 328 a 434 ms, com método desconhecido. O cuidado: o RLS deixa de filtrar por pessoa, então cada público (Mestre, grupo) precisa do seu tópico, senão o token escondido vaza.

**5. Banco em São Paulo.** Pequeno hoje, e é decisão sua. O passo a passo está em `planos/mudanca-para-sao-paulo.md`. Cada leitura e gravação custa 187 ms de ida e volta até Ohio. Medido daqui em 2026-11-07, abrir conexão com a AWS leva cerca de 20 ms em São Paulo e 180 ms em Ohio (endpoints da AWS, não a Supabase). Levar o banco e as funções para o Brasil corta isso em todas as telas, não só na Mesa. A [Albion dividiu servidores por região](https://unity.com/blog/albion-online-cross-platform-pvp-mmo-architecture) pelo mesmo motivo. A Supabase [não muda a região de um projeto](https://github.com/orgs/supabase/discussions/16341): é preciso criar outro em `sa-east-1` e [migrar para ele](https://supabase.com/docs/guides/platform/migrating-within-supabase/backup-restore). Em 2026-11-07 são 18,5 MB de banco, 4 contas e 252 arquivos (13 MB), sem Edge Functions e sem nenhuma URL do projeto gravada nas tabelas. Quanto antes, menor a mudança: com mais campanhas ela só cresce.

**6. Névoa decidida no servidor.** Médio a grande, prioridade baixa. O [VALORANT e o League](https://technology.riotgames.com/node/108) não mandam a posição de quem o jogador não pode ver, e assim o wallhack não tem o que mostrar. Na Mesa, um token `visivel` fora da linha de visão chega ao navegador e só a tela o esconde: quem abrir o inspetor de rede vê. Entre amigos à mesa, isso pesa pouco. Vale se surgir jogo competitivo. Fazer direito pede um servidor por sala, porque o broadcast chega igual a todos, e por isso ficou de fora desta rodada.

## O que não vale fazer agora

| Ideia | Por que não |
| --- | --- |
| Servidor de sala dedicado ([Colyseus](https://gitnation.com/contents/making-multiplayer-games-with-colyseus-nodejs-and-typescript), [Nakama](https://www.pistack.xyz/posts/2026-09-24-nakama-vs-colyseus-vs-spacetimedb-self-hosted-game-backend/)) | É o padrão quando o servidor precisa validar regras a cada passo. Aqui o RLS e as RPCs já validam, e seria um serviço pago a mais para manter |
| [Cloudflare Durable Objects](https://developers.cloudflare.com/durable-objects/reference/data-location/) | Modelo elegante, mas a documentação não garante objeto na América do Sul, e uma versão antiga diz que a dica `sam` cai no leste da América do Norte. Seria trocar 16 ms de broadcast por algo perto dos 187 ms até os EUA |
| [SpacetimeDB](https://github.com/clockworklabs/SpacetimeDB) | Banco e servidor numa peça só, como no BitCraft. Interessante para um jogo novo, mas seria reescrever o backend inteiro, e os números de desempenho vêm do próprio fabricante |
| [WebTransport](https://webkit.org/blog/17862/webkit-features-for-safari-26-4/) | Chegou ao Safari 26.4, mas a Supabase fala WebSocket, e numa mesa perder uma mensagem antiga não é o gargalo |
| WebRTC entre jogadores | O [Owlbear tentou e saiu](https://blog.owlbear.rodeo/owlbear-rodeo-2-0-dev-log-2/): sincronizar por P2P era muito instável, e o [README antigo](https://github.com/owlbear-rodeo/owlbear-rodeo-legacy) avisa que VPNs, antivírus e provedores bloqueiam |
| Binário, delta e quantização | [Economizam bytes](https://www.gafferongames.com/post/snapshot_compression/) em dezenas de entidades a cada tick. As mensagens da Mesa têm poucos campos, e o limite que aperta é de eventos por segundo, não de bytes |
| Grade de interesse (AOI) | [Filtra quem recebe o quê](https://www.dcs.gla.ac.uk/~trinder/papers/Survey_camera_ready.pdf) quando há milhares em cena. Com 20 tokens, mandar tudo a todos custa menos que a conta |
| [Time dilation da EVE](https://eveonline.com/article/introducing-time-dilation-tidi), [server meshing do Star Citizen](https://api.star-citizen.wiki/comm-links/18397) | Resolvem um servidor saturado por milhares de jogadores no mesmo lugar. Não é a nossa situação |

## As stacks, para consulta

| Stack | Modelo | Serve para |
| --- | --- | --- |
| Supabase Realtime (o nosso) | Canal, presença, aviso do banco. [Nós nas regiões, e o broadcast leva o tempo de um ping](https://supabase.com/docs/guides/realtime/architecture.md). [Mediana de 19 ms, p95 de 49 ms](https://supabase.com/docs/guides/realtime/benchmarks) | Salas pequenas sem servidor próprio |
| Photon | Mensagens UDP, usado no [Albion](https://es.slideshare.net/davidsalz54/albion-online-software-architecture-of-an-mmo-talk-at-quo-vadis-2016-berlin), com zonas de 1 km² e troca de servidor pelo banco | MMO e ação em cliente nativo |
| Colyseus | Sala em Node, estado no servidor, patches binários | Jogo web com regra no servidor |
| Nakama | Backend completo em Go, sincronização por RPC | Contas, ranking e partidas num produto só |
| SpacetimeDB | Lógica dentro do banco, assinaturas incrementais | Jogo novo, e aceitando [escrita em um nó só](https://tech-insider.org/spacetimedb-vs-playfab-vs-nakama-2026/) |
| Durable Objects | Um objeto por sala, [hibernação barata para mensagens esparsas](https://developers.cloudflare.com/durable-objects/platform/pricing) | Salas fora da América do Sul |

## O que não confirmei

- Os detalhes do Overwatch vêm de um resumo de terceiros: a palestra da GDC é só para membros.
- A divisão do mundo da Albion é de 2016, e as fontes atuais discordam sobre um shard só ou um por região.
- Não achei a arquitetura interna do Roll20, e do Foundry só [o uso de Socket.io](https://foundryvtt.wiki/en/development/api/sockets).
- Não achei medida independente e atual do Postgres Changes contra o broadcast do banco. O item 1 mede no nosso caso.
