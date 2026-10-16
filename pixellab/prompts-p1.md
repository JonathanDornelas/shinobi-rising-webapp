# Prompts do PixelLab — ícones P1

> Gerado por `scripts/gerar-md.js` a partir de `icones-p1.json`. Edite o JSON, não este arquivo.

## Estilo e regras

- **Estilo-mestre:** seção 3.1 de `instrucoes-claude-design.md` (contorno 1px `#1A1A1A`, sombreamento médio, luz no alto à esquerda, fundo transparente, 32×32).
- **Regra canônica:** Símbolos que existem no mangá/anime (vilas, clãs, natureza do chakra) são recriações fiéis dos originais: referência oficial (wiki Naruto, SVG) → base 32px na paleta (scripts/canon.js) → PixelLab img2img. Só usar motivo inventado quando não houver símbolo canônico.
- **Paleta forçada (25 cores):** `#1A1A1A` `#2B1A14` `#5C1E15` `#8B2E20` `#C44536` `#E07A5F` `#FBF7F0` `#F4E4D6` `#D9C2A7` `#A88B6A` `#BF9000` `#F2C14E` `#069BBD` `#7FD3E6` `#38761D` `#7FB069` `#674EA7` `#A895D6` `#7F6000` `#8D6E3F` `#5E6B73` `#A7B4BC` `#E8692E` `#2E6FD1` `#FFFFFF`
- Prompts em inglês (o modelo responde melhor); `alt` em pt-BR vai para o manifesto `icons.json`.
- Conta trial: 1 geração por vez. O lote em `create_1_direction_object` custa 10–25 gerações por chamada (até 64 ícones).

## Ordem de geração

1. **Sementes** (prontas) → aprovar o estilo na página de teste.
2. **Lote A** — Núcleo da interface (60 ícones, 1 chamada).
3. **Canônicos** — vilas, clãs e elementos (23 símbolos, 1 geração cada).
4. **Lote B** — Mundo do jogo, ações e brasões genéricos (59 ícones, 1 chamada).
4b. **Lote C** — P2: estados, catálogo de armas e itens, módulos (61 ícones, 1 chamada).
5. **Desenho em código** — selos de rank (6, grátis).
6. **Ilustrações** 96×96 (12, 1 geração cada).
7. Pendentes: animação de carregamento e versões 16px.

## 1. Sementes (prontas)

| ID | Arquivo | Método | Alt |
| --- | --- | --- | --- |
| recurso-pc | `static/icons/recurso/ic-recurso-pc-32.png` | pixflux + contorno automático | Pontos de Chakra |
| elemento-katon | `static/icons/elemento/ic-elemento-katon-32.png` | canônico: ícone de natureza oficial (octógono com 火) → canon.js → pixflux img2img força 180 | Katon (Fogo) |
| pericia-taijutsu | `static/icons/pericia/ic-pericia-taijutsu-32.png` | pixflux | Taijutsu |
| vila-konoha | `static/icons/vila/ic-vila-konoha-32.png` | canônico: SVG oficial → canon.js (preenchimento aço, como a placa do hitaiate) → pixflux img2img força 300 → sombreamento metálico em código | Konohagakure |
| status-aprovado | `static/icons/status/ic-status-aprovado-32.png` | desenho em código (kanji 可) | Aprovado |
| nav-jutsus | `static/icons/nav/ic-nav-jutsus-32.png` | pixflux | Jutsus |

## Lote A — Núcleo da interface

Ferramenta: `create_1_direction_object`.

```json
{
  "size": 32,
  "view": "sidescroller",
  "description": "pixel art RPG UI icon set, ninja fantasy theme inspired by feudal Japan, each icon a single centered object, crisp 1px black outline, medium shading, light from top-left, transparent background",
  "palette": "<paleta de 25 cores>",
  "style_images": "<as 6 sementes em PNG base64>",
  "item_descriptions": "<coluna Prompt abaixo, na ordem>"
}
```

| # | ID | Prompt (item_description) | Alt | Obs. |
| --- | --- | --- | --- | --- |
| 1 | marca | metal ninja forehead protector plate with an engraved shuriken, red cloth band | Shinobi no Michi |  |
| 2 | nav-regras | open paper scroll with a red ribbon bookmark | Regras |  |
| 3 | nav-campanhas | rolled mission map scroll tied with a red wax seal | Campanhas |  |
| 4 | nav-personagens | bust portrait of a ninja wearing a forehead protector | Personagens |  |
| 5 | nav-clas | tall vertical clan banner flag on a pole with a round crest | Clãs |  |
| 6 | nav-equipamentos | kunai knife and shuriken crossed | Equipamentos |  |
| 7 | nav-npcs | plain white ninja mask with simple red markings | NPCs |  |
| 8 | nav-aprovacoes | red seal stamp with a wooden handle standing on an ink pad | Aprovações |  |
| 9 | nav-submissoes | paper scroll with an arrow flying up and to the right | Minhas submissões |  |
| 10 | nav-membros | three small ninja forehead protectors side by side | Membros |  |
| 11 | nav-configuracoes | bronze gear with a small red ribbon | Configurações |  |
| 12 | nav-notificacoes | black messenger crow perched | Notificações |  |
| 13 | nav-perfil | wooden name tag plaque hanging from a cord | Perfil |  |
| 14 | nav-referencia | small folding japanese screen with three panels | Referência rápida |  |
| 15 | parte-1 | two crossed kunai over a paper scroll | Parte I — Fundamentos, Combate e Sombra |  |
| 16 | parte-2 | white ninja mask with a calligraphy brush | Parte II — Criando seu Personagem |  |
| 17 | parte-3 | ninja hip pouch with a scroll and a kunai sticking out | Parte III — Recursos do Ninja |  |
| 18 | parte-4 | closed wooden temple gate with iron bands | Parte IV — Avanços de Poder |  |
| 19 | parte-5 | green sprout growing from the top of a wooden training post | Parte V — Crescimento e Customização |  |
| 20 | parte-6 | calligraphy brush and smithing hammer crossed over a scroll | Parte VI — Criação Avançada |  |
| 21 | parte-referencia | closed book with colored bookmark ribbons | Referência e Apêndice |  |
| 22 | atributo-for | muscular flexed arm with a red arm band | Força (FOR) |  |
| 23 | atributo-agi | straw sandal with gust of wind lines | Agilidade (AGI) |  |
| 24 | atributo-vig | sturdy tree stump with deep spreading roots | Vigor (VIG) |  |
| 25 | atributo-int | eye drawn on an open paper scroll | Inteligência (INT) |  |
| 26 | atributo-ctr | single fingertip balancing a small glowing blue chakra orb | Controle (CTR) |  |
| 27 | atributo-esp | blue spirit flame wisp | Espírito (ESP) |  |
| 28 | recurso-pv | red heart | Pontos de Vida |  |
| 29 | recurso-pe | golden amber energy drop with a small spark | Pontos de Estamina |  |
| 30 | recurso-pt | wooden training post wrapped with rope | Pontos de Treino |  |
| 31 | recurso-pd | golden four-pointed star with a red ribbon | Pontos de Destino |  |
| 32 | recurso-xp | mission scroll with a gold star seal | Experiência (XP) |  |
| 33 | recurso-ryo | oval gold coin with a square hole in the middle | Ryo |  |
| 34 | recurso-pic | small red omamori charm pouch with a knot | Pontos de Influência do Clã |  |
| 35 | recurso-fadiga | tired face with closed eyes and a cold sweat drop | Fadiga |  |
| 36 | recurso-rd | riveted metal armor plate | Redução de Dano |  |
| 37 | recurso-defesa | round wooden shield | Defesa |  |
| 38 | recurso-defesa-mental | eye inside a small shield | Defesa Mental |  |
| 39 | recurso-iniciativa | kunai being quick-drawn from a leg holster with motion lines | Iniciativa |  |
| 40 | recurso-carga | travel backpack bundle tied with cloth | Carga |  |
| 41 | pericia-acrobacia | ninja figure doing a backflip | Acrobacia |  |
| 42 | pericia-atletismo | coiled climbing rope with a grappling hook | Atletismo |  |
| 43 | pericia-bukijutsu | katana mid-slash with a white arc trail | Bukijutsu |  |
| 44 | pericia-furtividade | footprints fading into a dark shadow | Furtividade |  |
| 45 | pericia-genjutsu | eye with a purple hypnotic spiral iris | Genjutsu |  |
| 46 | pericia-investigacao | magnifying glass over a paper scroll | Investigação |  |
| 47 | pericia-kugutsu | wooden puppet hanging from blue chakra strings | Kugutsu |  |
| 48 | pericia-medicina | open hand glowing with green healing light | Medicina |  |
| 49 | pericia-ninjutsu | open palm holding a swirling white and blue energy sphere | Ninjutsu |  |
| 50 | pericia-percepcao | wide open eye with sound wave arcs | Percepção |  |
| 51 | pericia-persuasao | open folding paper fan | Persuasão |  |
| 52 | pericia-rastreamento | trail of dog paw prints | Rastreamento |  |
| 53 | pericia-selamento | paper scroll with a black spiral seal mark | Selamento (Fuuinjutsu) |  |
| 54 | pericia-sobrevivencia | campfire with a hanging cooking pot | Sobrevivência |  |
| 55 | status-rascunho | calligraphy brush with a wet ink tip | Rascunho |  |
| 56 | status-em-revisao | burning incense stick with a curl of smoke | Em revisão |  |
| 57 | status-ajustes | paper scroll with a red brush stroke correction mark | Ajustes solicitados |  |
| 58 | status-rejeitado | torn paper scroll | Rejeitado |  |
| 59 | papel-mestre | japanese war fan gunbai | Mestre |  |
| 60 | papel-jogador | ninja headband cloth tied in a knot | Jogador |  |

## Lote B — Mundo do jogo, ações e brasões genéricos

Ferramenta: `create_1_direction_object`.

Parâmetros: iguais ao lote A; incluir até 2 ícones aprovados do lote A como style_images extras. Os kamon-base saem como silhueta chapada e viram máscara branca por pós-processamento (todo pixel opaco → #FFFFFF, sem contorno)

| # | ID | Prompt (item_description) | Alt | Obs. |
| --- | --- | --- | --- | --- |
| 1 | vila-sem | metal forehead protector plate with a deep scratch across it | Sem vila (errante) | canônico como conceito: o hitaiate riscado dos ninjas renegados |
| 2 | cla-sabaku | Gaara's large sand gourd with a cork, tan clay | Clã Sabaku / Realeza de Suna | o clã não tem brasão oficial; a cabaça do Gaara é o símbolo canônico mais reconhecível |
| 3 | kkg-dojutsu | eye with a glowing red patterned iris | Dōjutsu |  |
| 4 | kkg-corporal | forearm with a bone spike growing out of it | Kekkei Genkai corporal |  |
| 5 | kkg-mental | head silhouette with purple mind waves | Kekkei Genkai mental |  |
| 6 | kkg-combinacao | fire and water energies merging into one swirl | Combinação elemental |  |
| 7 | kkg-hibrido | glowing spiral with a small insect | Kekkei Genkai híbrido |  |
| 8 | esp-controle-chakra | blue chakra thread passing through the eye of a needle | Especialização: Controle de Chakra |  |
| 9 | esp-reservatorio | large gourd filled with glowing blue chakra | Especialização: Reservatório de Chakra |  |
| 10 | esp-elemento | five small colored element orbs arranged in a circle | Especialização: Elemento Específico |  |
| 11 | esp-velocidade | blurred running ninja silhouette with speed lines | Especialização: Velocidade |  |
| 12 | esp-resistencia | iron armored forearm guard | Especialização: Resistência Física |  |
| 13 | esp-genjutsu | bronze medallion with a purple hypnotic eye | Especialização: Genjutsu |  |
| 14 | esp-ninjutsu | bronze medallion with a blue energy sphere | Especialização: Ninjutsu |  |
| 15 | esp-bukijutsu | bronze medallion with a katana | Especialização: Bukijutsu |  |
| 16 | esp-taijutsu | bronze medallion with a bandaged fist | Especialização: Taijutsu |  |
| 17 | esp-selamento | paper scroll bound by an iron chain | Especialização: Selamento |  |
| 18 | esp-furtividade | dagger blade emerging from a dark shadow | Especialização: Furtividade e Assassinato |  |
| 19 | esp-marionete | wooden puppet head with visible joints | Especialização: Marionete |  |
| 20 | esp-invocacao | white smoke cloud puff with a seal mark | Especialização: Invocação |  |
| 21 | esp-sensor | concentric blue chakra rings radiating outward | Especialização: Sensor de Chakra |  |
| 22 | esp-medico | round pill with a green healing glow | Especialização: Ninjutsu Médico |  |
| 23 | esp-sennin | mossy stone surrounded by green nature energy | Especialização: Sennin |  |
| 24 | equip-arma-distancia | steel four-pointed shuriken | Armas de distância |  |
| 25 | equip-arma-curta | short tanto knife | Armas brancas curtas |  |
| 26 | equip-arma-longa | katana in a black sheath | Armas brancas longas |  |
| 27 | equip-arma-exotica | kusarigama sickle with a chain | Armas brancas exóticas |  |
| 28 | equip-sete-espadas | giant cleaver sword wrapped in bandages | Sete Espadas da Névoa |  |
| 29 | equip-pilula | round brown soldier pill | Pílulas |  |
| 30 | equip-veneno | purple poison vial with a cork | Venenos |  |
| 31 | equip-pergaminho | storage scroll with a seal symbol | Pergaminhos |  |
| 32 | equip-kit | cloth medical pouch with a green leaf mark | Kits |  |
| 33 | equip-ferramenta | coil of thin ninja wire | Ferramentas |  |
| 34 | callout-destaque | glowing paper lantern | Destaque |  |
| 35 | callout-atencao | wooden sign with an exclamation mark | Atenção |  |
| 36 | callout-pre-requisito | bronze key | Pré-requisito |  |
| 37 | callout-citacao | stone tablet with carved lines | Citação |  |
| 38 | dado-d20 | twenty-sided die d20 | Dado d20 |  |
| 39 | acao-criar-personagem | ninja bust portrait with a plus sign | Criar personagem |  |
| 40 | acao-criar-cla | clan banner flag with a plus sign | Criar clã |  |
| 41 | acao-criar-jutsu | blank paper scroll with a calligraphy brush | Criar jutsu |  |
| 42 | acao-forjar | anvil with a hammer and sparks | Forjar arma |  |
| 43 | acao-construir-marionete | wooden puppet head next to small carving tools | Construir marionete |  |
| 44 | acao-convidar | folded letter with a red wax seal | Convidar |  |
| 45 | acao-subir-nivel | paper scroll with a glowing upward arrow | Subir de nível |  |
| 46 | acao-conceder | coin pouch with a gold star | Conceder recompensas |  |
| 47 | acao-novo-npc | white mask with a plus sign | Novo NPC |  |
| 48 | kamon-base-01 | flat single color emblem silhouette of a leaf | Brasão: folha |  |
| 49 | kamon-base-02 | flat single color emblem silhouette of an open fan | Brasão: leque |  |
| 50 | kamon-base-03 | flat single color emblem silhouette of a wave | Brasão: onda |  |
| 51 | kamon-base-04 | flat single color emblem silhouette of a flame | Brasão: chama |  |
| 52 | kamon-base-05 | flat single color emblem silhouette of a mountain | Brasão: montanha |  |
| 53 | kamon-base-06 | flat single color emblem silhouette of a cloud | Brasão: nuvem |  |
| 54 | kamon-base-07 | flat single color emblem silhouette of a crescent moon | Brasão: lua |  |
| 55 | kamon-base-08 | flat single color emblem silhouette of a bone | Brasão: osso |  |
| 56 | kamon-base-09 | flat single color emblem silhouette of an insect | Brasão: inseto |  |
| 57 | kamon-base-10 | flat single color emblem silhouette of an eye | Brasão: olho |  |
| 58 | kamon-base-11 | flat single color emblem silhouette of a spiral | Brasão: espiral |  |
| 59 | kamon-base-12 | flat single color emblem silhouette of a blade | Brasão: lâmina |  |

## Lote C — P2: estados, catálogo de armas e itens, módulos

Ferramenta: `create_1_direction_object`.

Parâmetros: iguais ao lote A

| # | ID | Prompt (item_description) | Alt | Obs. |
| --- | --- | --- | --- | --- |
| 1 | pericia-kugutsu | wooden marionette puppet dangling from glowing blue chakra strings tied to a wooden control bar | Kugutsu |  |
| 2 | estado-atordoado | small yellow stars spinning in a circle | Atordoado |  |
| 3 | estado-paralisado | stiff figure crackling with yellow electricity | Paralisado |  |
| 4 | estado-imobilizado | heavy iron chain wrapped in a loop | Imobilizado |  |
| 5 | estado-controlado | puppet strings attached to a dark shadow figure | Controlado |  |
| 6 | estado-caido | figure lying flat on the ground | Caído |  |
| 7 | estado-cego | white cloth blindfold | Cego |  |
| 8 | estado-amedrontado | pale frightened face with a sweat drop | Amedrontado |  |
| 9 | estado-em-chamas | small figure engulfed in orange flames | Em chamas |  |
| 10 | estado-envenenado | purple poison drop with bubbles | Envenenado |  |
| 11 | estado-sangrando | red blood drop | Sangrando |  |
| 12 | estado-em-genjutsu | purple spiral swirl over a closed eye | Em genjutsu |  |
| 13 | estado-desprevenido | big red exclamation mark | Desprevenido |  |
| 14 | arma-shuriken | steel four-pointed shuriken | Shuriken |  |
| 15 | arma-kunai | steel kunai knife with ring handle | Kunai |  |
| 16 | arma-senbon | three thin steel senbon needles | Senbon |  |
| 17 | arma-fuuma-shuriken | large folding windmill shuriken | Fuuma shuriken |  |
| 18 | arma-arco-longo | japanese longbow with an arrow | Arco longo |  |
| 19 | arma-tanto | short tanto dagger | Tanto |  |
| 20 | arma-wakizashi | wakizashi short sword | Wakizashi |  |
| 21 | arma-kodachi | kodachi short curved sword | Kodachi |  |
| 22 | arma-nunchaku | wooden nunchaku with chain | Nunchaku |  |
| 23 | arma-katana | katana with a wrapped handle | Katana |  |
| 24 | arma-nodachi | very long nodachi sword | Nodachi |  |
| 25 | arma-naginata | naginata polearm with curved blade | Naginata |  |
| 26 | arma-bo | long wooden bo staff | Bo |  |
| 27 | arma-yari | yari spear | Yari |  |
| 28 | arma-kusarigama | kusarigama sickle with a weighted chain | Kusarigama |  |
| 29 | arma-manriki | manriki chain with weights at both ends | Manriki |  |
| 30 | arma-tonfa | pair of wooden tonfa | Tonfa |  |
| 31 | arma-sai | steel sai with three prongs | Sai |  |
| 32 | arma-hanbo | short wooden hanbo staff | Hanbo |  |
| 33 | arma-kanabo | studded iron kanabo club | Kanabo |  |
| 34 | espada-kubikiribocho | giant cleaver sword with a round hole near the tip | Kubikiribocho |  |
| 35 | espada-samehada | sword covered in blue shark scales wrapped in bandages | Samehada |  |
| 36 | espada-hiramekarei | wide twin-handled blade wrapped in cloth | Hiramekarei |  |
| 37 | espada-kabutowari | axe and hammer connected by a chain | Kabutowari |  |
| 38 | espada-nuibari | long needle sword with a thin wire | Nuibari |  |
| 39 | espada-shibuki | sword with a scroll of explosive tags on the blade | Shibuki |  |
| 40 | espada-kiba | twin short swords crackling with lightning | Kiba |  |
| 41 | item-hyourougan | small round brown soldier pill | Hyourougan |  |
| 42 | item-pilula-cura | green healing pill | Pílula de cura |  |
| 43 | item-pilula-militar | red military pill | Pílula militar |  |
| 44 | item-antidoto | small green antidote vial | Antídoto |  |
| 45 | item-antidoto-raro | golden rare antidote vial | Antídoto raro |  |
| 46 | item-bomba-fumaca | round smoke bomb with a short fuse | Bomba de fumaça |  |
| 47 | item-fio-ninja | kunai tied to a long ninja wire | Fio ninja |  |
| 48 | item-kan-no-kami | small chakra sensing paper slip | Kan no Kami |  |
| 49 | item-papel-explosivo | explosive tag paper with a red seal | Papel explosivo |  |
| 50 | item-lente-noturna | night vision goggles | Lente de visão noturna |  |
| 51 | item-pergaminho-basico | small storage scroll | Pergaminho básico |  |
| 52 | item-pergaminho-avancado | medium storage scroll with blue seal | Pergaminho avançado |  |
| 53 | item-pergaminho-mestre | large ornate storage scroll with gold trim | Pergaminho mestre |  |
| 54 | item-pergaminho-jutsu | scroll with a glowing jutsu seal | Pergaminho de jutsu pré-armado |  |
| 55 | item-kit-marionetista | wooden toolbox with puppet strings and carving tools | Kit de marionetista |  |
| 56 | item-kit-medico | open medical kit with bandages | Kit médico |  |
| 57 | modulo-companheiro | ninja dog wearing a forehead protector, sitting | Companheiros |  |
| 58 | modulo-portoes | stone gate with eight locks | Portões Internos |  |
| 59 | modulo-mangekyou | red eye with a black pinwheel pattern | Mangekyou |  |
| 60 | status-revogado | red seal stamp crossed out with a black line | Revogado |  |
| 61 | status-excecao-mestre | red seal stamp with a gold star | Exceção do Mestre |  |

## 3. Símbolos canônicos

Custo: 1 geração por símbolo (+1 se precisar refazer).

1. `node scripts/fetch-ref.js <id>=<arquivo.svg>  (Edge headless contorna o bloqueio da CDN)`
2. `node scripts/canon.js referencias/<id>.png base.png [--fill=#HEX para símbolos de traço] [--ink=0.42 --erode=2 para bordas grossas]`
3. `create_image_pixflux com init_image = base, init_image_strength 180–300, paleta forçada, prompt descrevendo o símbolo`
4. `Revisar: se a forma deformar, subir a força (300) e sombrear em código`

| ID | Referência oficial (naruto.fandom.com) | Alt |
| --- | --- | --- |
| vila-suna | `Sunagakure Symbol.svg` | Sunagakure |
| vila-kiri | `Kirigakure Symbol.svg` | Kirigakure |
| vila-kumo | `Kumogakure Symbol.svg` | Kumogakure |
| vila-iwa | `Iwagakure Symbol.svg` | Iwagakure |
| vila-ame | `Amegakure Symbol.svg` | Amegakure |
| vila-taki | `Takigakure Symbol.svg` | Takigakure |
| vila-oto | `Otogakure Symbol.svg` | Otogakure |
| cla-nara | `Nara Symbol.svg` | Clã Nara |
| cla-akimichi | `Akimichi Symbol.svg` | Clã Akimichi |
| cla-yamanaka | `Yamanaka Symbol.svg` | Clã Yamanaka |
| cla-inuzuka | `Inuzuka Symbol.svg` | Clã Inuzuka |
| cla-aburame | `Aburame Symbol.svg` | Clã Aburame |
| cla-hyuuga | `Hyūga Symbol.svg` | Clã Hyuuga |
| cla-uchiha | `Uchiha Symbol.svg` | Clã Uchiha |
| cla-senju | `Senju Symbol.svg` | Clã Senju |
| cla-uzumaki | `Uzumaki Symbol.svg` | Clã Uzumaki |
| cla-kaguya | `Kaguya Symbol.svg` | Clã Kaguya |
| cla-hozuki | `Hōzuki Symbol.svg` | Clã Hozuki |
| cla-yuki | `Yuki Symbol.svg` | Clã Yuki |
| elemento-suiton | `Nature Icon Water.svg` | Suiton (Água) |
| elemento-doton | `Nature Icon Earth.svg` | Doton (Terra) |
| elemento-raiton | `Nature Icon Lightning.svg` | Raiton (Raio) |
| elemento-fuuton | `Nature Icon Wind.svg` | Fuuton (Vento) |

**P2 (depois):** elemento-mokuton (`Nature Icon Wood.svg`), elemento-hyoton (`Nature Icon Ice.svg`), elemento-yoton (`Nature Icon Lava.svg`), elemento-ranton (`Nature Icon Storm.svg`), elemento-jiton (`Nature Icon Magnet.svg`)

## 5. Desenho em código

Letras e emblemas geométricos saem errados no texto-para-imagem (o selo veio com '$'). Desenhados pixel a pixel, sem custo.

| ID | Descrição | Alt |
| --- | --- | --- |
| rank-e | carimbo quadrado #E6D2BF, letra E #5C524A | Rank E |
| rank-d | carimbo quadrado #A88B6A, letra D #1A1A1A | Rank D |
| rank-c | carimbo quadrado #5E6B73, letra C #FFFFFF | Rank C |
| rank-b | carimbo quadrado #5C1E15, letra B #F4E4D6 | Rank B |
| rank-a | carimbo quadrado #C44536, letra A #FFFFFF | Rank A |
| rank-s | carimbo quadrado #1A1A1A com borda #BF9000, letra S #F2C14E | Rank S |

## 6. Ilustrações (96×96)

Ferramenta: `create_image_pixflux`. Sufixo de estilo em todo prompt: *pixel art illustration, ninja fantasy theme inspired by feudal Japan, crisp 1px black outline, medium shading, light from top-left*.

| ID | Prompt | Alt | Obs. |
| --- | --- | --- | --- |
| il-vazio | blank paper scroll unrolled open, empty | Pergaminho em branco |  |
| il-sem-resultados | magnifying glass over drifting mist | Nenhum resultado |  |
| il-erro | broken steel shuriken split in two pieces | Algo deu errado |  |
| il-404 | small lost ninja standing in fog next to a wooden signpost with a question mark | Página não encontrada |  |
| il-403 | closed wooden gate sealed with a glowing paper seal talisman | Acesso selado |  |
| il-offline | black crow sitting alone on a bare branch | Sem conexão |  |
| il-enviado | black crow flying while carrying a rolled scroll | Enviado |  |
| il-aprovado | large square red seal stamp pressing down onto paper | Aprovado | gerar sem texto; o kanji 承認 entra depois, desenhado em código |
| il-convite | folded letter with a red wax seal resting on a ninja forehead protector | Convite |  |
| il-boas-vindas | silhouettes of a team of three young ninjas standing together | Boas-vindas |  |
| il-cha | japanese clay teapot and a small tea cup with steam | Hora do chá |  |
| il-memorial | lit paper lantern in front of a small stone grave marker | Memorial |  |

## 7. Pendentes

- **an-carregando:** shuriken girando, 32×32, 8 quadros, 12 fps. Base: equip-arma-distancia do lote B; animar com animate_object ou pixelart_workbench (definir na hora).
- **versoes-16px:** Redesenhos simplificados em 16×16 (create_image_pixen aceita 16×16, 1 geração cada; ou desenho em código). Ficam para antes da implementação.
