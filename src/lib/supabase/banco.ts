// Tipos do banco no formato de `supabase gen types typescript` (escritos a partir das migrações em supabase/migrations).
// Quando o CLI estiver ligado ao projeto, dá para regenerar com: npx supabase gen types typescript --linked

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Papel = 'mestre' | 'jogador';
export type TipoConvite = 'email' | 'link' | 'codigo';
export type StatusConvite = 'pendente' | 'aceito' | 'recusado' | 'revogado';
export type StatusFicha = 'rascunho' | 'em_revisao' | 'ajustes' | 'aprovada' | 'rejeitada';
export type StatusCla = 'rascunho' | 'em_revisao' | 'ajustes' | 'aprovado' | 'rejeitado';
export type StatusCriacao = StatusCla;

export type Preferencias = {
	tema?: 'sumi' | 'washi' | 'sistema';
	/** Tema do usuário: cores, escala e raio (src/lib/estado/visual.ts). */
	visual?: import('#lib/estado/visual.ts').Visual;
	leitura?: 15 | 17 | 18 | 20;
	email?: Partial<Record<'submissoes' | 'decisoes' | 'comentarios' | 'recompensas', boolean>>;
	/** Favoritos (slugs), em src/lib/estado/favoritos.svelte.ts. */
	favoritos?: { jutsus?: string[] };
	/** Moldura dos tokens na Mesa (src/lib/mesa/molduras.ts). */
	moldura?: string | null;
}

export type VilaCampanha = {
	id: string;
	status: 'aliada' | 'em-guerra' | 'neutra' | null;
}

export type Aprovacao = {
	fichas: boolean;
	armas: boolean;
	itens: boolean;
	marionetes: boolean;
	backgrounds: boolean;
	treino: boolean;
	mestre_edita_aprovadas: boolean;
}

export type Perfil = {
	id: string;
	nome: string;
	/** Foto da conta no bucket de retratos (retratos/<id do usuário>/…). */
	avatar: string | null;
	preferencias: Preferencias;
	criado_em: string;
}

export type Campanha = {
	id: string;
	nome: string;
	premissa: string;
	capa: string;
	era: string;
	era_alternativa: string | null;
	nivel_inicial: number;
	tamanho_grupo: number;
	vilas: VilaCampanha[];
	clas_permitidos: string[];
	clas_sem_kkg: boolean;
	clas_com_kkg: boolean;
	pacotes: string[];
	aprovacao: Aprovacao;
	regras_mesa: string;
	/** Moldura dos tokens na Mesa escolhida pelo Mestre: NPCs e quem não escolheu; universal = todos os tokens. */
	moldura: string | null;
	moldura_universal: boolean;
	mestre_id: string | null;
	arquivada_em: string | null;
	criada_em: string;
	atualizada_em: string;
}

export type Membro = {
	campanha_id: string;
	usuario_id: string;
	papel: Papel;
	entrou_em: string;
	/** Cor na Mesa (lápis, anel do token, régua, avatar); única na campanha. */
	cor: CorMesa | null;
}

export type CorMesa = 'vermelhao' | 'anil' | 'ameixa' | 'sakura' | 'siena' | 'mostarda' | 'musgo' | 'petroleo' | 'ardosia';

export type Convite = {
	id: string;
	campanha_id: string;
	tipo: TipoConvite;
	email: string | null;
	token: string;
	codigo: string | null;
	mensagem: string | null;
	expira_em: string | null;
	max_usos: number | null;
	usos: number;
	status: StatusConvite;
	criado_por: string;
	criado_em: string;
	respondido_por: string | null;
	respondido_em: string | null;
}

export type Personagem = {
	id: string;
	campanha_id: string;
	jogador_id: string;
	nome: string;
	status: StatusFicha;
	nivel: number;
	xp: number;
	dados: Json;
	resumo: Json;
	mensagem: string | null;
	comentario_mestre: string | null;
	enviada_em: string | null;
	decidida_em: string | null;
	criada_em: string;
	atualizada_em: string;
	situacao: SituacaoFicha;
	estado: Json;
	inventario: Json | null;
	ryo: number;
	pt: number;
	epitafio: string | null;
	falecido_em: string | null;
	cla_id: string | null;
	excecao: string | null;
	pre_gerado: boolean;
	entregas: Json;
	retrato: string | null;
	/** NPC com ficha completa (do Mestre, fora do grupo). */
	npc: boolean;
	/** Ficha de NPC com o nome escondido do grupo (ver Npc.nome_oculto). */
	nome_oculto: boolean;
	/** Pasta de NPCs (só para NPCs de ficha completa). */
	pasta_id: string | null;
	/** Paisagem do topo da ficha; null = a da vila. */
	capa: string | null;
	/** Caderno do dono (o Mestre lê). */
	anotacoes: string;
}

/** Jutsu ou habilidade criada (cap. 20); `dados` é um JutsuDados ou HabilidadeDados (src/lib/jutsus/regras.ts). */
export type JutsuCriado = {
	id: string;
	campanha_id: string;
	autor_id: string;
	tipo: 'jutsu' | 'habilidade';
	personagem_id: string | null;
	cla_id: string | null;
	carta_id: string | null;
	nome: string;
	rank: string | null;
	status: StatusCriacao;
	versao: number;
	anterior_id: string | null;
	dados: Json;
	resumo: Json;
	mensagem: string | null;
	comentario_mestre: string | null;
	excecao: string | null;
	enviado_em: string | null;
	decidido_em: string | null;
	criado_em: string;
	atualizado_em: string;
};

/** Arma forjada, marionete ou item criado (Lote 8); `dados` vem de src/lib/equipamentos/regras.ts. */
export type EquipamentoCriado = {
	id: string;
	campanha_id: string;
	autor_id: string;
	tipo: 'arma' | 'item' | 'marionete';
	personagem_id: string | null;
	nome: string;
	custo: number;
	status: StatusCriacao;
	versao: number;
	anterior_id: string | null;
	dados: Json;
	resumo: Json;
	mensagem: string | null;
	comentario_mestre: string | null;
	excecao: string | null;
	entregue: boolean;
	enviado_em: string | null;
	decidido_em: string | null;
	criado_em: string;
	atualizado_em: string;
};

/** NPC da campanha (ficha resumida do cap. 23.2). Só o Mestre lê a tabela; o grupo vê os revelados por npcs_revelados(). */
export type Npc = {
	id: string;
	campanha_id: string;
	nome: string;
	funcao: string;
	origem: string;
	aparencia: string;
	rank: 'genin' | 'chunin' | 'jounin' | 'anbu' | 'lendario';
	pv: number;
	pc: number;
	defesa: number;
	iniciativa: number;
	ataque: string;
	especial: string;
	tags: string[];
	quer: string;
	segredo: string;
	notas: string;
	revelado: boolean;
	membros: number;
	/** O Mestre esconde o nome: o grupo vê "???" (o banco troca em tokens, rolagens e iniciativa). */
	nome_oculto: boolean;
	pv_atual: number[];
	/** PE máximo e PC/PE atuais de cada membro (vazio = cheio), como o pv_atual. */
	pe: number;
	pc_atual: number[];
	pe_atual: number[];
	/** Foto no bucket de retratos (retratos/<id do NPC>/…). */
	retrato: string | null;
	pasta_id: string | null;
	/** Do bestiário: jutsus do catálogo (slugs), acerto dos ataques, DT, arte e verbete de origem ("slug#estágio"). */
	jutsus: string[];
	acerto: number | null;
	dt: number | null;
	arte: string | null;
	bestiario: string | null;
	/** Ajuste do Mestre no enquadramento da arte no token (ponto em frações da imagem e zoom); null = o padrão da arte. */
	enquadramento?: { x: number; y: number; zoom: number } | null;
	criado_em: string;
	atualizado_em: string;
};
export type NpcRevelado = Pick<Npc, 'id' | 'nome' | 'funcao' | 'origem' | 'aparencia' | 'rank' | 'tags' | 'retrato'>;

/** Clã criado por um jogador (cap. 8.4); `dados` é um ClaDados (src/lib/clas/regras.ts). */
export type Cla = {
	id: string;
	campanha_id: string;
	autor_id: string;
	nome: string;
	kkg: boolean;
	status: StatusCla;
	versao: number;
	anterior_id: string | null;
	dados: Json;
	resumo: Json;
	mensagem: string | null;
	comentario_mestre: string | null;
	excecao: string | null;
	enviado_em: string | null;
	decidido_em: string | null;
	criado_em: string;
	atualizado_em: string;
};

export type SituacaoFicha = 'ativo' | 'falecido' | 'arquivado';

export type RegistroFicha = {
	id: number;
	personagem_id: string;
	ator_id: string | null;
	tipo: string;
	texto: string;
	icone: string;
	criado_em: string;
}

export type PedidoPt = {
	id: string;
	personagem_id: string;
	campanha_id: string;
	autor_id: string | null;
	sessao: string;
	semanas: number;
	pt: number;
	descricao: string;
	status: 'pendente' | 'aprovado' | 'recusado';
	comentario: string | null;
	criado_em: string;
	decidido_em: string | null;
}

/** Linha de personagens_do_grupo(): o que o grupo vê de uma ficha aprovada. */
export type PersonagemPublico = {
	id: string;
	jogador_id: string;
	nome: string;
	nivel: number;
	situacao: SituacaoFicha;
	pre_gerado: boolean;
	retrato: string | null;
	capa: string | null;
	resumo: Json;
}

export type ModoRolagem = 'normal' | 'vantagem' | 'desvantagem' | 'critico';

/** Termo de uma rolagem: dado (valores sorteados; usados = os que contam, na vantagem/desvantagem fica um) ou modificador. */
export type TermoRolagem = { sinal: 1 | -1; lados: number; valores: number[]; usados: number[]; manter?: 'h' | 'l'; k?: number } | { sinal: 1 | -1; valor: number };

export type TipoRolagem = 'teste' | 'ataque' | 'dano' | 'cura' | 'iniciativa' | 'save' | 'livre';

/** Rolagem registrada na campanha; o sorteio é feito no servidor por rolar(). */
export type Rolagem = {
	id: string;
	campanha_id: string;
	autor_id: string | null;
	personagem_id: string | null;
	quem: string;
	/** Nome de quem rolou (jogador ou Mestre), congelado. */
	jogador: string | null;
	npc_id: string | null;
	rotulo: string;
	expressao: string;
	modo: ModoRolagem;
	detalhe: TermoRolagem[];
	total: number;
	d20: number | null;
	oculta: boolean;
	criada_em: string;
	tipo: TipoRolagem;
	/** De onde veio ("Ficha · Perícias", "Rolar dados"). */
	origem: string | null;
	/** Parcelas do modificador: [["ESP (atributo)", "+1"], …]. */
	partes: [string, string][];
	/** Ponto de Destino gasto nesta rolagem. */
	pd: 'rerrolar' | 'mais5' | null;
	anterior_total: number | null;
	/** Re-rolada com PD (a nova rolagem a substitui). */
	substituida: boolean;
};

export type Notificacao = {
	id: string;
	usuario_id: string;
	tipo: string;
	texto: string;
	href: string | null;
	icone: string;
	lida: boolean;
	criada_em: string;
}

export type Atividade = {
	id: number;
	campanha_id: string;
	ator_id: string | null;
	tipo: string;
	texto: string;
	icone: string;
	criada_em: string;
}

export type SituacaoConvite =
	| 'valido'
	| 'visitante'
	| 'ja_membro'
	| 'aceito'
	| 'recusado'
	| 'revogado'
	| 'expirado'
	| 'esgotado'
	| 'arquivada'
	| 'outro_email'
	| 'nao_encontrado';

export type ConvitePublico = {
	situacao: SituacaoConvite;
	token?: string;
	tipo?: TipoConvite;
	mensagem?: string | null;
	max_usos?: number | null;
	email?: string | null;
	convidado_por?: string;
	campanha?: {
		id: string;
		nome: string;
		capa: string;
		era: string;
		era_alternativa: string | null;
		premissa: string;
		jogadores: number;
		mestre: string | null;
	};
}

/** Item de `meus_convites()`: convite por e-mail aberto para a conta atual. */
export type ConvitePendente = {
	token: string;
	campanha: string;
	capa: string;
	era: string;
	era_alternativa: string | null;
	convidado_por: string | null;
	criado_em: string;
};

/** L11 · Mesa: pasta de NPCs (até 3 níveis). */
export type NpcPasta = { id: string; campanha_id: string; pai_id: string | null; nome: string; ordem: number; criada_em: string };

/** Ordem de iniciativa da cena, a mesma para todos. */
export type IniciativaCena = {
	ativa?: boolean;
	rodada?: number;
	vez?: number;
	ordem?: { nome: string; valor: number; personagem_id?: string | null; npc_id?: string | null }[];
	/** O Mestre limpou a ordem: a prévia só conta as iniciativas roladas depois disso. */
	limpa_em?: string;
};

export type MesaCena = {
	id: string;
	campanha_id: string;
	nome: string;
	largura: number;
	altura: number;
	ativa: boolean;
	travada: boolean;
	mostrar_pv: boolean;
	coordenadas: boolean;
	iniciativa: IniciativaCena;
	/** Fichas que jogam nesta cena; null = todo o grupo. */
	participantes: string[] | null;
	/** Terreno difícil marcado pelo Mestre: [[x, y], ...] (cap. 4, Terreno). */
	terreno: [number, number][];
	/** Tática (o quadro) ou narrativa (a imagem para todos, com o chat ao lado). */
	modo: 'tatica' | 'narrativa';
	/** Imagem da narrativa e fundo do quadro: /covers/..., /capitulos/... ou <campanha>/<nome>.webp no bucket mesa. */
	imagem: string | null;
	fundo: string | null;
	fundo_opacidade: number;
	/** Quantos metros a largura do fundo cobre (null = estica na cena) e o canto de cima à esquerda, em metros. */
	fundo_escala: number | null;
	fundo_x: number;
	fundo_y: number;
	grade: boolean;
	/** Vista de cima (o quadro de sempre) ou isométrica: só muda o desenho, os dados seguem na grade. */
	visao: 'topo' | 'isometrica';
	/** Largura dividida pela altura do losango de um quadrado (2 é o 2:1 da pixel art) e o canto de onde se olha ao abrir. */
	iso_razao: number;
	iso_rotacao: 0 | 90 | 180 | 270;
	/** Pasta das cenas (só o Mestre organiza) e o nome que o grupo vê (null = "Cena"). */
	pasta_id: string | null;
	nome_publico: string | null;
	/** Névoa: o mapa fica coberto para o grupo, menos os quadrados revelados em runs [[y, x0, x1], ...]. */
	nevoa: boolean;
	reveladas: [number, number, number][];
	/** As camadas da cena, de baixo para cima; a de tipo "tokens" é o lugar dos tokens na pilha (ver lib/mesa/camadas.ts). */
	camadas: { id: string; nome: string; tipo?: 'tokens'; em_pe?: boolean }[];
	criada_em: string;
};

export type MesaCenaPasta = { id: string; campanha_id: string; pai_id: string | null; nome: string; ordem: number; criada_em: string };

/** Objeto solto no quadro: alfinete, imagem (arte da biblioteca ou do livro) ou texto. x e y são o centro, em metros. */
export type MesaObjeto = {
	id: string;
	cena_id: string;
	campanha_id: string;
	autor_id: string;
	tipo: 'alfinete' | 'imagem' | 'texto';
	x: number;
	y: number;
	largura: number | null;
	altura: number | null;
	rotacao: number;
	cor: string | null;
	texto: string | null;
	fonte: 'sans' | 'pixel' | 'mincho' | 'mono' | null;
	tamanho: number | null;
	imagem: string | null;
	ordem: number;
	/** Só imagens: o id da camada da cena (ver MesaCena.camadas) em que a imagem está. */
	camada: string;
	visivel: boolean;
	travado: boolean;
	criado_em: string;
};

/** Arte da biblioteca da campanha: mapa (fundo e narrativa) ou objeto (imagem solta, com transparência). */
export type MesaArte = {
	id: string;
	campanha_id: string;
	autor_id: string;
	nome: string;
	tipo: 'mapa' | 'objeto';
	caminho: string;
	miniatura: string | null;
	largura: number;
	altura: number;
	bytes: number;
	criada_em: string;
};

/** A música da campanha: o Mestre cola o link e todos ouvem igual (youtube: id do vídeo ou da lista; spotify: legado, o banco ainda aceita mas o jukebox não toca mais). */
export type MesaJukebox = {
	campanha_id: string;
	fonte: 'youtube' | 'spotify';
	ref: string;
	lista: boolean;
	titulo: string | null;
	tocando: boolean;
	posicao: number;
	indice: number;
	desde: string;
	atualizada_em: string;
};

export type MesaToken = {
	id: string;
	cena_id: string;
	campanha_id: string;
	personagem_id: string | null;
	npc_id: string | null;
	membro: number | null;
	ligado_a: string | null;
	dono_id: string | null;
	nome: string;
	sigla: string;
	/** O nome está escondido do grupo: o token guarda "???" e o Mestre lê o nome verdadeiro do NPC. */
	nome_oculto: boolean;
	/** Elevação em metros (visual: o token sobe na tela da vista isométrica); só o Mestre muda. */
	elevacao: number;
	retrato: string | null;
	tamanho: 1 | 3 | 6 | 10;
	/** Crescido por um jutsu (Baika no Jutsu): o tamanho normal e os turnos que faltam para voltar. */
	tamanho_base: 1 | 3 | 6 | 10 | null;
	crescido_turnos: number | null;
	x: number;
	y: number;
	visivel: boolean;
	aliado: boolean;
	condicoes: string[];
	/** 0 ileso, 1 ferido, 2 muito ferido, 3 caído. */
	ferimento: number;
	pv: number | null;
	pv_max: number | null;
	movido: number;
	criado_em: string;
	atualizado_em: string;
};

export type MesaTraco = { id: string; cena_id: string; autor_id: string; espessura: number; pontos: [number, number][]; criado_em: string };

export type MesaEfeito = {
	id: string;
	cena_id: string;
	autor_id: string;
	nome: string;
	quadrados: [number, number][];
	rotulo_x: number;
	rotulo_y: number;
	turnos: number | null;
	/** Elemento do jutsu (katon, suiton…) ou o tipo (taijutsu, genjutsu, bukijutsu, ninjutsu): muda o visual do efeito. */
	estilo: string | null;
	criado_em: string;
};

type Tabela<Row, Obrigatorios extends keyof Row, Relacoes extends unknown[] = []> = {
	Row: Row;
	Insert: Partial<Row> & Pick<Row, Obrigatorios>;
	Update: Partial<Row>;
	Relationships: Relacoes;
};

type Rel<Nome extends string, Coluna extends string, Destino extends string> = {
	foreignKeyName: Nome;
	columns: [Coluna];
	isOneToOne: false;
	referencedRelation: Destino;
	referencedColumns: ['id'];
};

export type Database = {
	public: {
		Tables: {
			perfis: Tabela<Perfil, 'id' | 'nome'>;
			campanhas: Tabela<Campanha, 'nome' | 'mestre_id', [Rel<'campanhas_mestre_id_fkey', 'mestre_id', 'perfis'>]>;
			membros: Tabela<
				Membro,
				'campanha_id' | 'usuario_id' | 'papel',
				[Rel<'membros_campanha_id_fkey', 'campanha_id', 'campanhas'>, Rel<'membros_usuario_id_fkey', 'usuario_id', 'perfis'>]
			>;
			convites: Tabela<Convite, 'campanha_id' | 'tipo', [Rel<'convites_campanha_id_fkey', 'campanha_id', 'campanhas'>]>;
			notificacoes: Tabela<Notificacao, 'usuario_id' | 'tipo' | 'texto'>;
			personagens: Tabela<
				Personagem,
				'campanha_id' | 'jogador_id',
				[Rel<'personagens_campanha_id_fkey', 'campanha_id', 'campanhas'>, Rel<'personagens_jogador_id_fkey', 'jogador_id', 'perfis'>]
			>;
			ficha_registros: Tabela<RegistroFicha, 'personagem_id' | 'tipo' | 'texto', [Rel<'ficha_registros_personagem_id_fkey', 'personagem_id', 'personagens'>, Rel<'ficha_registros_ator_id_fkey', 'ator_id', 'perfis'>]>;
			pedidos_pt: Tabela<
				PedidoPt,
				'personagem_id' | 'campanha_id' | 'sessao' | 'semanas' | 'pt' | 'descricao',
				[Rel<'pedidos_pt_personagem_id_fkey', 'personagem_id', 'personagens'>, Rel<'pedidos_pt_campanha_id_fkey', 'campanha_id', 'campanhas'>]
			>;
			clas: Tabela<Cla, 'campanha_id' | 'autor_id', [Rel<'clas_campanha_id_fkey', 'campanha_id', 'campanhas'>, Rel<'clas_autor_id_fkey', 'autor_id', 'perfis'>]>;
			jutsus_criados: Tabela<JutsuCriado, 'campanha_id' | 'autor_id', [Rel<'jutsus_criados_campanha_id_fkey', 'campanha_id', 'campanhas'>, Rel<'jutsus_criados_autor_id_fkey', 'autor_id', 'perfis'>]>;
			equipamentos_criados: Tabela<EquipamentoCriado, 'campanha_id' | 'autor_id' | 'tipo', [Rel<'equipamentos_criados_campanha_id_fkey', 'campanha_id', 'campanhas'>, Rel<'equipamentos_criados_autor_id_fkey', 'autor_id', 'perfis'>]>;
			npcs: Tabela<Npc, 'campanha_id', [Rel<'npcs_campanha_id_fkey', 'campanha_id', 'campanhas'>]>;
			rolagens: Tabela<Rolagem, 'campanha_id' | 'quem' | 'rotulo' | 'expressao' | 'detalhe' | 'total', [Rel<'rolagens_campanha_id_fkey', 'campanha_id', 'campanhas'>]>;
			atividades: Tabela<Atividade, 'campanha_id' | 'tipo' | 'texto', [Rel<'atividades_campanha_id_fkey', 'campanha_id', 'campanhas'>]>;
			npc_pastas: Tabela<NpcPasta, 'campanha_id' | 'nome'>;
			mesa_cenas: Tabela<MesaCena, 'campanha_id' | 'nome'>;
			mesa_tokens: Tabela<MesaToken, 'cena_id' | 'campanha_id' | 'nome'>;
			mesa_tracos: Tabela<MesaTraco, 'cena_id' | 'pontos'>;
			mesa_efeitos: Tabela<MesaEfeito, 'cena_id' | 'nome' | 'quadrados'>;
			mesa_cena_pastas: Tabela<MesaCenaPasta, 'campanha_id' | 'nome'>;
			mesa_objetos: Tabela<MesaObjeto, 'cena_id' | 'tipo'>;
			mesa_artes: Tabela<MesaArte, 'campanha_id' | 'nome' | 'caminho' | 'largura' | 'altura'>;
			mesa_jukebox: Tabela<MesaJukebox, 'campanha_id' | 'fonte' | 'ref'>;
		};
		Views: { [_ in never]: never };
		Functions: {
			agora_servidor: { Args: Record<string, never>; Returns: string };
			ver_convite: { Args: { chave: string }; Returns: Json };
			aceitar_convite: { Args: { chave: string }; Returns: string };
			recusar_convite: { Args: { chave: string }; Returns: undefined };
			transferir_mestre: { Args: { campanha: string; novo_mestre: string }; Returns: undefined };
			excluir_conta: { Args: Record<string, never>; Returns: undefined };
			meus_convites: { Args: Record<string, never>; Returns: Json };
			reenviar_convite: { Args: { convite: string }; Returns: undefined };
			enviar_ficha: { Args: { ficha: string }; Returns: StatusFicha };
			retirar_ficha: { Args: { ficha: string }; Returns: undefined };
			decidir_ficha: { Args: { ficha: string; decisao: StatusFicha; comentario?: string | null }; Returns: undefined };
			personagens_do_grupo: { Args: { campanha: string }; Returns: PersonagemPublico[] };
			atualizar_estado: { Args: { ficha: string; estado: Json; descricao: string }; Returns: undefined };
			atualizar_inventario: { Args: { ficha: string; inventario: Json; ryo: number; descricao: string }; Returns: undefined };
			subir_nivel: { Args: { ficha: string; dados: Json; resumo: Json; estado: Json; pt_marcos?: number }; Returns: number };
			treinar: { Args: { ficha: string; dados: Json; resumo: Json; custo: number; descricao: string }; Returns: number };
			solicitar_pt: { Args: { ficha: string; sessao: string; semanas: number; descricao: string }; Returns: string };
			decidir_pedido_pt: { Args: { pedido: string; aprovar: boolean; comentario?: string | null }; Returns: undefined };
			conceder_recompensa: {
				Args: { campanha: string; fichas: string[]; xp: number; pt: number; ryo: number; motivo: string; restaurar_pd?: boolean; renovar_pic?: boolean };
				Returns: number;
			};
			enviar_cla: { Args: { cla: string }; Returns: StatusCla };
			retirar_cla: { Args: { cla: string }; Returns: undefined };
			decidir_cla: { Args: { cla: string; decisao: StatusCla; comentario?: string | null }; Returns: undefined };
			nova_versao_cla: { Args: { cla: string }; Returns: string };
			enviar_jutsu: { Args: { jutsu: string }; Returns: StatusCriacao };
			retirar_jutsu: { Args: { jutsu: string }; Returns: undefined };
			decidir_jutsu: { Args: { jutsu: string; decisao: StatusCriacao; comentario?: string | null }; Returns: undefined };
			nova_versao_jutsu: { Args: { jutsu: string }; Returns: string };
			enviar_equipamento: { Args: { equipamento: string }; Returns: StatusCriacao };
			retirar_equipamento: { Args: { equipamento: string }; Returns: undefined };
			decidir_equipamento: { Args: { equipamento: string; decisao: StatusCriacao; comentario?: string | null }; Returns: undefined };
			nova_versao_equipamento: { Args: { equipamento: string }; Returns: string };
			receber_equipamentos: { Args: { ficha: string; inventario: Json; equipamentos: string[] }; Returns: undefined };
			registrar_excecao: { Args: { tipo: string; alvo: string; justificativa: string }; Returns: undefined };
			definir_nome_oculto: { Args: { alvo: 'npc' | 'ficha'; id: string; oculto: boolean }; Returns: undefined };
			npcs_revelados: { Args: { campanha: string }; Returns: NpcRevelado[] };
			assumir_pre_gerado: { Args: { ficha: string }; Returns: undefined };
			conceder_jutsu: { Args: { ficha: string; slug: string; nome: string; custo_pt?: number }; Returns: undefined };
			conceder_item: { Args: { ficha: string; item: Json; custo_ryo?: number }; Returns: undefined };
			receber_entregas: { Args: { ficha: string; inventario: Json }; Returns: undefined };
			salvar_anotacoes: { Args: { ficha: string; texto: string }; Returns: undefined };
			usar_pd: { Args: { rolagem: string; acao: 'rerrolar' | 'mais5' }; Returns: Rolagem };
			rolagens_ocultas_do_mestre: { Args: { desde?: string | null }; Returns: { id: string; campanha_id: string; criada_em: string; mestre: string }[] };
			definir_capa_ficha: { Args: { ficha: string; capa: string | null }; Returns: undefined };
			excluir_ficha: { Args: { ficha: string }; Returns: undefined };
			definir_retrato: { Args: { ficha: string; caminho: string | null }; Returns: undefined };
			rolar: {
				Args: { campanha: string; expressao: string; rotulo: string; personagem?: string | null; modo?: ModoRolagem; oculta?: boolean; npc?: string | null; tipo?: TipoRolagem; origem?: string | null; partes?: Json };
				Returns: Rolagem;
			};
			definir_cor: { Args: { campanha: string; cor: CorMesa }; Returns: undefined };
			pasta_da_ficha: { Args: { ficha: string; pasta: string | null }; Returns: undefined };
			ativar_cena: { Args: { cena: string }; Returns: undefined };
			pv_da_cena: { Args: { cena: string }; Returns: { token_id: string; pv: number | null; pv_max: number | null }[] };
			definir_situacao: { Args: { ficha: string; situacao: SituacaoFicha; epitafio?: string | null }; Returns: undefined };
		};
		Enums: { papel: Papel; tipo_convite: TipoConvite; status_convite: StatusConvite; status_ficha: StatusFicha; status_cla: StatusCla; status_criacao: StatusCriacao };
		CompositeTypes: { [_ in never]: never };
	};
};
