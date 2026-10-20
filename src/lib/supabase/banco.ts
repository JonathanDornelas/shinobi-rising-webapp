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
}

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
	pv_atual: number[];
	/** Foto no bucket de retratos (retratos/<id do NPC>/…). */
	retrato: string | null;
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
		};
		Views: { [_ in never]: never };
		Functions: {
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
			definir_situacao: { Args: { ficha: string; situacao: SituacaoFicha; epitafio?: string | null }; Returns: undefined };
		};
		Enums: { papel: Papel; tipo_convite: TipoConvite; status_convite: StatusConvite; status_ficha: StatusFicha; status_cla: StatusCla; status_criacao: StatusCriacao };
		CompositeTypes: { [_ in never]: never };
	};
};
