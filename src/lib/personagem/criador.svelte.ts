// Estado do criador de personagem (P2): a ficha em edição, o passo atual e tudo o que é recalculado a partir dela.
import type { CatalogoCriacao } from './catalogo.server.ts';
import { normalizarCla, regrasParaFicha, type ClaDados } from '../clas/regras.ts';
import type { StatusCla } from '../supabase/banco.ts';
import { ATRIBUTOS, type Atributo } from './dados.ts';
import {
	analisar,
	limiteAtributo,
	linhasPericia,
	orcamentoAtributos,
	pontosPericia,
	ptDisponiveis,
	recursos,
	resumoFicha,
	type ContextoCampanha,
	type FichaDados
} from './regras.ts';

export type Catalogo = CatalogoCriacao;

/** Clã criado que a ficha pode usar no passo 4 (do jogador ou aprovado na campanha). */
export interface ClaCriadoOpcao {
	id: string;
	nome: string;
	kkg: boolean;
	status: StatusCla;
	versao: number;
	autor_id: string;
	resumo: unknown;
	dados: unknown;
}

export class Criador {
	ficha: FichaDados = $state()!;
	passo = $state(1);
	/** Aviso do recálculo ("Você mudou VIG: PV 25 → 30"), mostrado no topo do passo. */
	aviso = $state('');
	readonly catalogo: Catalogo;
	readonly ctx: ContextoCampanha;
	readonly editavel: boolean;
	readonly clasCriados: ClaCriadoOpcao[];

	constructor(ficha: FichaDados, catalogo: Catalogo, ctx: ContextoCampanha, editavel: boolean, passo = 1, clasCriados: ClaCriadoOpcao[] = []) {
		this.ficha = ficha;
		this.catalogo = catalogo;
		this.ctx = ctx;
		this.editavel = editavel;
		this.passo = passo;
		this.clasCriados = clasCriados;
	}

	/** Status do clã criado escolhido (a revisão bloqueia enquanto ele não foi enviado). */
	statusCla = $derived.by(() => this.clasCriados.find((x) => x.id === this.ficha.cla.id)?.status ?? null);

	/** Escolhe um clã criado e copia as regras dele para a ficha (o elemento do clã vira o principal). */
	usarClaCriado(id: string) {
		const o = this.clasCriados.find((x) => x.id === id);
		if (!o) return;
		const regras = regrasParaFicha(o.id, normalizarCla(o.dados as Partial<ClaDados>, o.kkg));
		this.ficha.cla = { tipo: o.kkg ? 'novo-com-kkg' : 'novo-sem-kkg', slug: null, escolha: null, id: o.id, criado: regras };
		if (regras.elemento) this.ficha.elemento = regras.elemento;
		this.ficha.segundoElemento = null;
	}

	// $derived.by com função: só é avaliado na primeira leitura, depois do construtor.
	recursos = $derived.by(() => recursos(this.ficha, this.catalogo.loja));
	pericias = $derived.by(() => linhasPericia(this.ficha));
	atributos = $derived.by(() => orcamentoAtributos(this.ficha));
	pontosPericia = $derived.by(() => pontosPericia(this.ficha));
	pt = $derived.by(() => ptDisponiveis(this.ficha));
	analise = $derived.by(() => analisar(this.ficha, this.ctx, { jutsusD: this.catalogo.jutsusD, loja: this.catalogo.loja, statusCla: this.statusCla }));
	resumo = $derived.by(() => resumoFicha(this.ficha, this.catalogo.loja));

	irPara(p: number) {
		this.passo = Math.min(12, Math.max(1, p));
		this.aviso = '';
	}

	/** Muda um atributo e avisa quando PV, PE ou PC mudam por causa disso. */
	alterarAtributo(a: Atributo, delta: 1 | -1) {
		if (!this.editavel || limiteAtributo(this.ficha, a, delta)) return;
		const antes = this.recursos;
		this.ficha.atributos[a] += delta;
		const depois = recursos(this.ficha, this.catalogo.loja);
		const nome = ATRIBUTOS.find((x) => x.id === a)!.id;
		const mudancas = (
			[
				['PV', antes.pv, depois.pv],
				['PE', antes.pe, depois.pe],
				['PC', antes.pc, depois.pc]
			] as const
		).filter(([, x, y]) => x !== y);
		if (mudancas.length) this.aviso = `Você mudou ${nome}: ${mudancas.map(([k, x, y]) => `${k} ${x} → ${y}`).join(', ')}. O passo 8 foi atualizado.`;
	}

	limite(a: Atributo, delta: 1 | -1) {
		return limiteAtributo(this.ficha, a, delta);
	}
}
