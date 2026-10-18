// Estado do criador de clã (K2): o clã em edição, o passo atual e o que é recalculado a partir dele.
import type { CompraPb } from './dados.ts';
import { analisarCla, balancaPkg, carta, linhasMarcos, novoId, orcamentoPb, resumoCla, limiteCompra, type CartaCla, type ClaDados } from './regras.ts';

/** Jutsu do catálogo geral que pode virar carta do clã (cap. 10). */
export interface JutsuCatalogo {
	slug: string;
	nome: string;
	rank: string;
	tipo: string;
	elemento: string | null;
}

export class CriadorCla {
	dados: ClaDados = $state()!;
	passo = $state(0);
	readonly editavel: boolean;
	readonly jutsus: JutsuCatalogo[];

	constructor(dados: ClaDados, jutsus: JutsuCatalogo[], editavel: boolean, passo = 0) {
		this.dados = dados;
		this.jutsus = jutsus;
		this.editavel = editavel;
		this.passo = passo;
	}

	// $derived.by com função: só é avaliado na primeira leitura, depois do construtor.
	pb = $derived.by(() => orcamentoPb(this.dados));
	pkg = $derived.by(() => balancaPkg(this.dados));
	marcos = $derived.by(() => linhasMarcos(this.dados));
	analise = $derived.by(() => analisarCla(this.dados));
	resumo = $derived.by(() => resumoCla(this.dados));

	irPara(p: number) {
		this.passo = Math.min(10, Math.max(0, p));
	}

	comprar(tipo: CompraPb) {
		if (!this.editavel || limiteCompra(this.dados, tipo)) return;
		this.dados.bonus.compras.push({ tipo, alvo: null });
	}

	devolver(tipo: CompraPb) {
		if (!this.editavel) return;
		const i = this.dados.bonus.compras.findLastIndex((c) => c.tipo === tipo);
		if (i >= 0) this.dados.bonus.compras.splice(i, 1);
	}

	/** Cria uma carta (jutsu do catálogo ou original) e devolve o id. */
	novaCarta(base: Partial<CartaCla> & Pick<CartaCla, 'tipo'>): string {
		const c: CartaCla = { id: novoId(), slug: null, nome: '', rank: base.tipo === 'jutsu' ? 'C' : null, descricao: '', ...base };
		this.dados.cartas.push(c);
		return c.id;
	}

	cartaDoCatalogo(slug: string): string {
		const ja = this.dados.cartas.find((c) => c.slug === slug);
		if (ja) return ja.id;
		const j = this.jutsus.find((x) => x.slug === slug);
		return this.novaCarta({ tipo: 'jutsu', slug, nome: j?.nome ?? slug, rank: (j?.rank as CartaCla['rank']) ?? null });
	}

	/** Tira a carta e as escolhas que apontavam para ela. */
	removerCarta(id: string) {
		const d = this.dados;
		d.cartas = d.cartas.filter((c) => c.id !== id);
		if (d.assinatura === id) d.assinatura = null;
		if (d.jutsuExtra === id) d.jutsuExtra = null;
		for (const m of Object.values(d.marcos)) if (m.carta === id) m.carta = null;
	}

	/** Onde a carta é usada ("Marco nível 6", "Assinatura"), para a lista do passo 6. */
	usoDaCarta(id: string): string[] {
		const d = this.dados;
		const usos: string[] = [];
		if (d.assinatura === id) usos.push('Assinatura · nível 1');
		if (d.jutsuExtra === id && !d.kkg && d.bonus.extraSemKkg === 'jutsu') usos.push('Jutsu extra · nível 1');
		for (const [n, m] of Object.entries(d.marcos)) if (m.carta === id && (m.opcao === 'jutsu' || m.opcao === 'habilidade' || m.opcao === null)) usos.push(`Marco nível ${n}`);
		return usos;
	}

	carta(id: string | null) {
		return carta(this.dados, id);
	}
}
