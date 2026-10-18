// Tipos do banco no formato de `supabase gen types typescript` (escritos a partir das migrações em supabase/migrations).
// Quando o CLI estiver ligado ao projeto, dá para regenerar com: npx supabase gen types typescript --linked

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Papel = 'mestre' | 'jogador';
export type TipoConvite = 'email' | 'link' | 'codigo';
export type StatusConvite = 'pendente' | 'aceito' | 'recusado' | 'revogado';
export type StatusFicha = 'rascunho' | 'em_revisao' | 'ajustes' | 'aprovada' | 'rejeitada';

export type Preferencias = {
	tema?: 'sumi' | 'washi' | 'sistema';
	leitura?: 15 | 17 | 18 | 20;
	email?: Partial<Record<'submissoes' | 'decisoes' | 'comentarios' | 'recompensas', boolean>>;
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
}

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
		};
		Enums: { papel: Papel; tipo_convite: TipoConvite; status_convite: StatusConvite; status_ficha: StatusFicha };
		CompositeTypes: { [_ in never]: never };
	};
};
