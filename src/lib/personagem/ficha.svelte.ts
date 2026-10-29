// Estado da ficha em jogo (P3): recursos atuais, condições, fadiga, saves de morte, inventário e ryo.
// Cada mudança aparece na hora e é salva em seguida (atualizar_estado / atualizar_inventario), com Desfazer.
import { toasts } from '#lib/estado/toasts.svelte.ts';
import { supabase } from '#lib/supabase/cliente.ts';
import type { Json } from '#lib/supabase/banco.ts';
import type { CatalogoFicha } from './catalogo.server.ts';
import { CONDICOES } from './dados.ts';
import {
	capacidadePergaminho,
	cargaInventario,
	custoJutsu,
	ehPergaminhoMestre,
	livrePergaminho,
	pesoItem,
	pilhaSelada,
	quantoCabe,
	curar,
	descansar,
	estadoAtual,
	ficha,
	inventarioInicial,
	type EstadoJogo,
	type ItemInventario,
	type JutsuFicha
} from './progressao.ts';
import type { FichaDados, ItemLoja } from './regras.ts';

type Recurso = 'pv' | 'pc' | 'pe';
const NOME: Record<Recurso, string> = { pv: 'PV', pc: 'PC', pe: 'PE' };

export class FichaJogo {
	estado: EstadoJogo = $state({});
	inventario: ItemInventario[] = $state([]);
	ryo = $state(0);
	/** Mensagem do último ajuste, para o toast com Desfazer. */
	ultimo = $state<{ texto: string; icone: string } | null>(null);
	salvando = $state(false);

	private historico: { estado: EstadoJogo; descricao: string }[] = [];
	private pendente: string[] = [];
	private temporizador: ReturnType<typeof setTimeout> | undefined;

	readonly id: string;
	readonly dados: FichaDados;
	readonly catalogo: CatalogoFicha;
	readonly editavel: boolean;

	constructor(p: { id: string; dados: FichaDados; estado: EstadoJogo; inventario: ItemInventario[] | null; ryo: number }, catalogo: CatalogoFicha, editavel: boolean) {
		this.id = p.id;
		this.dados = p.dados;
		this.catalogo = catalogo;
		this.editavel = editavel;
		this.estado = p.estado ?? {};
		this.inventario = p.inventario ?? inventarioInicial(p.dados, catalogo.loja as ItemLoja[]);
		this.ryo = p.ryo;
	}

	calc = $derived.by(() => ficha(this.dados, this.catalogo.loja as ItemLoja[]));
	max = $derived.by(() => ({ pv: this.calc.recursos.pv, pc: this.calc.recursos.pc, pe: this.calc.recursos.pe, pic: this.calc.pic }));
	atual = $derived.by(() => estadoAtual(this.estado, this.max));
	carga = $derived.by(() => cargaInventario(this.inventario));

	// ------------------------------------------------------------------ estado
	private mudar(novo: EstadoJogo, descricao: string, icone: string) {
		if (!this.editavel) return;
		this.historico.push({ estado: $state.snapshot(this.estado) as EstadoJogo, descricao });
		this.estado = novo;
		this.ultimo = { texto: descricao, icone };
		this.pendente.push(descricao);
		clearTimeout(this.temporizador);
		this.temporizador = setTimeout(() => this.salvarEstado(), 900);
	}

	private async salvarEstado() {
		const descricao = this.pendente.join(' · ');
		this.pendente = [];
		this.salvando = true;
		const { error } = await supabase().rpc('atualizar_estado', { ficha: this.id, estado: $state.snapshot(this.estado) as unknown as Json, descricao: descricao.slice(0, 200) });
		this.salvando = false;
		if (error) toasts.mostrar('Não foi possível salvar o ajuste. Confira a conexão.', 'erro');
	}

	ajustar(k: Recurso, delta: number) {
		const a = this.atual;
		// PV pode ficar negativo (cap. 4); PC e PE param em 0.
		const minimo = k === 'pv' ? -this.max.pv : 0;
		const novo = Math.min(this.max[k], Math.max(minimo, curar(k, a[k], delta)));
		if (novo === a[k]) return;
		const extra: EstadoJogo = {};
		if (k === 'pv' && novo > 0 && a.pv <= 0) extra.saves = { sucessos: 0, falhas: 0 };
		if (k === 'pe' && novo === 0 && a.pe > 0) extra.fadiga = Math.min(5, a.fadiga + 1);
		this.mudar({ ...this.estado, [k]: novo, ...extra }, `${NOME[k]} ${a[k]} → ${novo}${extra.fadiga ? ' (+1 Fadiga)' : ''}`, `recurso/ic-recurso-${k}`);
	}

	definir(k: Recurso, valor: number) {
		this.ajustar(k, Math.round(valor) - this.atual[k]);
	}

	descanso(tipo: 'curto' | 'longo') {
		const novo = descansar(this.atual, this.max, tipo);
		this.mudar({ ...this.estado, ...novo }, tipo === 'curto' ? 'Descanso curto: ¼ dos máximos recuperado' : 'Descanso longo: recursos restaurados', 'item/ic-item-kit-medico');
	}

	alternarCondicao(id: string) {
		const lista = this.atual.condicoes;
		const nome = CONDICOES.find((c) => c.id === id)?.nome ?? id;
		const tem = lista.includes(id);
		this.mudar({ ...this.estado, condicoes: tem ? lista.filter((c) => c !== id) : [...lista, id] }, `Condição “${nome}” ${tem ? 'removida' : 'marcada'}`, `estado/ic-estado-${id}`);
	}

	definirFadiga(n: number) {
		const novo = n === this.atual.fadiga ? n - 1 : n;
		this.mudar({ ...this.estado, fadiga: Math.max(0, Math.min(5, novo)) }, `Fadiga ${this.atual.fadiga} → ${Math.max(0, novo)}`, 'recurso/ic-recurso-fadiga');
	}

	save(tipo: 'sucessos' | 'falhas', delta: 1 | -1) {
		const s = this.atual.saves;
		const novo = { ...s, [tipo]: Math.max(0, Math.min(3, s[tipo] + delta)) };
		this.mudar({ ...this.estado, saves: novo }, `Save de Morte: ${novo.sucessos} sucesso(s), ${novo.falhas} falha(s)`, 'estado/ic-estado-caido');
	}

	usarPd() {
		if (this.atual.pd <= 0) return;
		this.mudar({ ...this.estado, pd: this.atual.pd - 1 }, 'Usou o Ponto de Destino da sessão', 'recurso/ic-recurso-pd');
	}

	usarPic() {
		if (this.atual.pic <= 0) return;
		this.mudar({ ...this.estado, pic: this.atual.pic - 1 }, `Usou 1 PIC (restam ${this.atual.pic - 1})`, 'recurso/ic-recurso-pic');
	}

	custo(j: JutsuFicha) {
		return custoJutsu(this.dados, j, this.atual.fadiga);
	}

	gastarJutsu(j: JutsuFicha) {
		const c = this.custo(j);
		const k = c.unidade === 'PE' ? 'pe' : 'pc';
		if (this.atual[k] < c.final) return;
		const novo = this.atual[k] - c.final;
		const extra: EstadoJogo = k === 'pe' && novo === 0 ? { fadiga: Math.min(5, this.atual.fadiga + 1) } : {};
		this.mudar({ ...this.estado, [k]: novo, ...extra }, `−${c.final} ${c.unidade} · ${j.nome}. ${c.unidade} ${novo}/${this.max[k]}`, `recurso/ic-recurso-${k}`);
	}

	desfazer() {
		const h = this.historico.pop();
		if (!h) return;
		this.estado = h.estado;
		this.pendente.push(`Desfez: ${h.descricao}`);
		this.ultimo = { texto: 'Ajuste desfeito', icone: 'status/ic-status-aprovado' };
		clearTimeout(this.temporizador);
		this.temporizador = setTimeout(() => this.salvarEstado(), 600);
	}

	get podeDesfazer() {
		return this.historico.length > 0;
	}

	// ------------------------------------------------------------------ inventário
	private async salvarInventario(descricao: string) {
		const { error } = await supabase().rpc('atualizar_inventario', {
			ficha: this.id,
			inventario: $state.snapshot(this.inventario) as unknown as Json,
			ryo: this.ryo,
			descricao
		});
		if (error) toasts.mostrar('Não foi possível salvar o inventário.', 'erro');
	}

	/** Comprar debita ryo; Adicionar não (espólio entregue pelo Mestre). */
	async receber(item: ItemLoja, qtd: number, comprar: boolean) {
		if (!this.editavel || qtd <= 0) return;
		const preco = item.preco * qtd;
		if (comprar && preco > this.ryo) return toasts.mostrar('Ryo insuficiente.', 'erro');
		const existente = this.inventario.find((i) => i.id === item.id);
		if (existente) existente.qtd += qtd;
		else
			this.inventario.push({
				id: item.id,
				nome: item.nome,
				qtd,
				peso: item.peso,
				conjunto: item.conjunto,
				grupo: item.grupo.startsWith('Armas') ? 'Armas' : /pergaminho/i.test(item.nome) ? 'Pergaminhos' : 'Itens',
				icone: item.icone
			});
		if (comprar) this.ryo -= preco;
		await this.salvarInventario(`${comprar ? 'Comprou' : 'Recebeu'} ${qtd}× ${item.nome}${comprar ? ` (−${preco.toLocaleString('pt-BR')} ryo)` : ''}`);
	}

	/** Encomendas aprovadas (armas forjadas, marionetes): vão para o inventário; o ryo já saiu na aprovação. */
	async receberEntregas(entregas: { id: string; tipo: string; nome: string; resumo: unknown }[]) {
		if (!this.editavel || !entregas.length) return;
		for (const e of entregas) {
			const r = e.resumo as { carga?: number; icone?: string; categoria?: string; qualidade?: string; dano?: string };
			const id = `eq-${e.id}`;
			if (this.inventario.some((i) => i.id === id)) continue;
			this.inventario.push({
				id,
				nome: e.nome,
				qtd: 1,
				peso: e.tipo === 'arma' ? (r.carga ?? 1) : 0,
				grupo: e.tipo === 'arma' ? 'Armas' : 'Outros',
				icone: r.icone ?? 'equip/ic-equip-ferramenta',
				nota: [r.categoria, r.qualidade && r.qualidade !== 'Comum' ? r.qualidade : '', r.dano].filter(Boolean).join(' · '),
				qualidade: r.qualidade || undefined,
				dano: r.dano || undefined
			});
		}
		const { error } = await supabase().rpc('receber_equipamentos', {
			ficha: this.id,
			inventario: $state.snapshot(this.inventario) as unknown as Json,
			equipamentos: entregas.map((e) => e.id)
		});
		if (error) return toasts.mostrar('Não foi possível receber as encomendas no inventário.', 'erro');
		toasts.mostrar(`Chegou ao inventário: ${entregas.map((e) => e.nome).join(', ')}.`, 'sucesso', 6000);
	}

	/** Itens concedidos pelo Mestre (personagens.entregas): somam ao inventário e as entregas são limpas. */
	async receberItens(itens: ItemInventario[]) {
		if (!this.editavel || !itens.length) return;
		for (const it of itens) {
			const ja = this.inventario.find((i) => i.id === it.id);
			if (ja) ja.qtd += it.qtd || 1;
			else this.inventario.push({ ...it, qtd: it.qtd || 1 });
		}
		const { error } = await supabase().rpc('receber_entregas', { ficha: this.id, inventario: $state.snapshot(this.inventario) as unknown as Json });
		if (error) return toasts.mostrar('Não foi possível receber os itens concedidos.', 'erro');
		toasts.mostrar(`O Mestre concedeu: ${itens.map((i) => i.nome).join(', ')}.`, 'sucesso', 6000);
	}

	async alterarQtd(id: string, delta: number) {
		const i = this.inventario.find((x) => x.id === id);
		if (!i || !this.editavel) return;
		i.qtd = Math.max(0, i.qtd + delta);
		const nome = i.nome;
		let solto = '';
		if (i.qtd === 0) {
			// um pergaminho que se perde solta tudo o que guardava (cap. 11)
			const dentro = this.inventario.filter((x) => x.selado === id);
			for (const x of dentro) this.soltar(x);
			if (dentro.length) solto = `; soltou ${dentro.map((x) => x.nome).join(', ')}`;
			this.inventario = this.inventario.filter((x) => x.id !== id);
		}
		await this.salvarInventario(`${delta < 0 ? 'Usou/descartou' : 'Ajustou'} ${Math.abs(delta)}× ${nome}${solto}`);
	}

	// ------------------------------------------------------------------ pergaminhos de armazenamento (cap. 11)
	/** Volta um item selado para a mochila, juntando com a pilha igual se houver. */
	private soltar(item: ItemInventario) {
		const base = item.id.split('~')[0];
		const pilha = this.inventario.find((x) => x !== item && !x.selado && x.id === base);
		if (pilha) {
			pilha.qtd += item.qtd;
			this.inventario = this.inventario.filter((x) => x !== item);
		} else {
			delete item.selado;
			if (!this.inventario.some((x) => x !== item && x.id === base)) item.id = base;
		}
	}

	/**
	 * Selar: 1 ação e 1 PC (no Pergaminho Mestre, uma ação completa). O item some da mochila e não pesa mais. `qtd` sela só
	 * parte da pilha (o resto fica na mochila); sem ela, a pilha inteira.
	 */
	async selar(itemId: string, pergaminhoId: string, qtd?: number) {
		if (!this.editavel) return;
		const item = this.inventario.find((x) => x.id === itemId);
		let perg = this.inventario.find((x) => x.id === pergaminhoId);
		if (!item || !perg || item.selado || item === perg) return;
		if (capacidadePergaminho(perg) == null) return void toasts.mostrar('Esse pergaminho não guarda itens.', 'erro');
		if (capacidadePergaminho(item) != null && this.inventario.some((x) => x.selado === item.id)) return void toasts.mostrar('Esvazie o pergaminho antes de selá-lo em outro.', 'aviso');
		if (this.atual.pc < 1) return void toasts.mostrar('Selar custa 1 PC, e você está sem chakra.', 'erro');
		// pergaminhos empilhados: um deles sai da pilha para guardar o item
		if (perg.qtd > 1) {
			perg.qtd -= 1;
			this.inventario.push({ ...$state.snapshot(perg), id: `${perg.id.split('~')[0]}~${Math.random().toString(36).slice(2, 8)}`, qtd: 1 });
			perg = this.inventario[this.inventario.length - 1];
		}
		const n = Math.max(1, Math.min(item.qtd, Math.floor(qtd ?? item.qtd)));
		const cabe = quantoCabe(this.inventario, item, perg);
		if (n > cabe) {
			const livre = String(livrePergaminho(this.inventario, perg)).replace('.', ',');
			return void toasts.mostrar(cabe ? `Cabem só ${cabe}× ${item.nome} nesse pergaminho (${livre} livre).` : `Não cabe: o pergaminho tem ${livre} de carga livre.`, 'aviso');
		}
		const nome = item.nome;
		// o mesmo item já selado ali: junta na pilha; senão o selado ganha um id próprio, para uma compra nova da mesma
		// coisa não cair dentro do pergaminho
		const junto = pilhaSelada(this.inventario, item, perg.id);
		const idSelado = `${item.id.split('~')[0]}~s${Math.random().toString(36).slice(2, 8)}`;
		if (junto) {
			junto.qtd += n;
			item.qtd -= n;
			if (item.qtd === 0) this.inventario = this.inventario.filter((x) => x !== item);
		} else if (n < item.qtd) {
			item.qtd -= n;
			this.inventario.push({ ...$state.snapshot(item), id: idSelado, qtd: n, selado: perg.id });
		} else {
			item.id = idSelado;
			item.selado = perg.id;
		}
		const acao = ehPergaminhoMestre(perg) ? 'ação completa' : '1 ação';
		this.mudar({ ...this.estado, pc: this.atual.pc - 1 }, `Selou ${n}× ${nome} no ${perg.nome} (${acao}, −1 PC)`, 'item/ic-item-pergaminho-basico');
		await this.salvarInventario(`Selou ${n}× ${nome} no ${perg.nome}`);
	}

	/** Invocar: ação secundária e 1 PC (no Pergaminho Mestre, a ação primária). O item volta para a mão. */
	async invocar(itemId: string) {
		if (!this.editavel) return;
		const item = this.inventario.find((x) => x.id === itemId);
		if (!item?.selado) return;
		if (this.atual.pc < 1) return void toasts.mostrar('Invocar custa 1 PC, e você está sem chakra.', 'erro');
		const perg = this.inventario.find((x) => x.id === item.selado);
		const nome = item.nome;
		const qtd = item.qtd;
		this.soltar(item);
		const acao = perg && ehPergaminhoMestre(perg) ? 'ação primária' : 'ação secundária';
		this.mudar({ ...this.estado, pc: this.atual.pc - 1 }, `Invocou ${qtd}× ${nome} (${acao}, −1 PC)`, 'item/ic-item-pergaminho-basico');
		await this.salvarInventario(`Invocou ${qtd}× ${nome}${perg ? ` do ${perg.nome}` : ''}`);
	}

	async ajustarRyo(delta: number) {
		if (!this.editavel) return;
		this.ryo = Math.max(0, this.ryo + delta);
		await this.salvarInventario(`Ryo ${delta > 0 ? '+' : '−'}${Math.abs(delta).toLocaleString('pt-BR')}`);
	}
}
