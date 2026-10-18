<script lang="ts">
	// E1 · Biblioteca de equipamentos: armas, itens e marionetes, cada um com oficiais do livro, da campanha, em revisão
	// (Mestre) e minhas criações. Daqui saem a forja (E3), a oficina (E4) e o novo item (E2, modal).
	import ModalConceder, { type Concessao } from '#lib/componentes/campanha/ModalConceder.svelte';
	import ModalItem from '#lib/componentes/equipamento/ModalItem.svelte';
	import { PESOS } from '#lib/personagem/dados.ts';
	import Alerta from '#lib/componentes/ui/Alerta.svelte';
	import Icone from '#lib/componentes/ui/Icone.svelte';
	import Modal from '#lib/componentes/ui/Modal.svelte';
	import { APROVACAO_PADRAO } from '#lib/campanhas/dominio.ts';
	import type { ResumoEquipamento } from '#lib/equipamentos/regras.ts';
	import { STATUS_CRIACAO } from '#lib/jutsus/status.ts';
	import { tempoRelativo } from '#lib/formatar.ts';
	import type { StatusCriacao } from '#lib/supabase/banco.ts';
	import type { PageProps } from './$types';

	let { data, form }: PageProps = $props();
	const k = $derived(data.campanha);
	const eu = $derived(data.usuario?.id ?? '');
	const mestre = $derived(data.papel === 'mestre');
	const aprovacao = $derived({ ...APROVACAO_PADRAO, ...k.aprovacao });
	const nomeMembro = (id: string) => data.membros.find((m) => m.id === id)?.nome ?? 'Ex-membro';
	const nomeFicha = (id: string | null) => (id ? (data.personagens.find((p) => p.id === id)?.nome ?? data.grupo.find((g) => g.id === id)?.nome ?? null) : null);
	const fichas = $derived(data.personagens.filter((p) => (mestre || p.jogador_id === eu) && p.situacao === 'ativo').map((p) => ({ id: p.id, nome: p.nome, aprovada: p.status === 'aprovada' })));

	type Tipo = 'arma' | 'item' | 'marionete';
	type Origem = 'oficiais' | 'campanha' | 'revisao' | 'minhas';
	interface Card {
		chave: string;
		icone: string;
		categoria: string;
		nome: string;
		preco: string;
		peso: string;
		efeito: string;
		rodape: string;
		status: StatusCriacao | null;
		href: string | null;
		externo: boolean;
		conceder?: Concessao;
	}
	const ryo = (n: number) => `${n.toLocaleString('pt-BR')} ryo`;
	const criados = $derived(data.criados.map((c) => ({ ...c, resumo: c.resumo as Partial<ResumoEquipamento> })));
	const substituidos = $derived(new Set(criados.filter((c) => c.status === 'aprovado' && c.anterior_id).map((c) => c.anterior_id)));
	const cardCriado = (c: (typeof criados)[number]): Card => ({
		chave: c.id,
		icone: c.resumo.icone ?? 'equip/ic-equip-ferramenta',
		categoria: [c.tipo === 'arma' ? 'ARMA' : c.tipo === 'item' ? 'ITEM' : 'MARIONETE', c.resumo.categoria?.toUpperCase(), c.resumo.qualidade && c.resumo.qualidade !== 'Comum' ? c.resumo.qualidade.toUpperCase() : ''].filter(Boolean).join(' · '),
		nome: c.nome || 'Sem nome',
		preco: ryo(c.custo),
		peso: c.resumo.dano || (c.resumo.carga != null ? `${c.resumo.carga.toLocaleString('pt-BR')} de carga` : ''),
		efeito: c.resumo.efeito || '',
		rodape: [nomeMembro(c.autor_id), nomeFicha(c.personagem_id), `v${c.versao}`, c.status === 'em_revisao' && c.enviado_em ? `enviado ${tempoRelativo(c.enviado_em)}` : c.status === 'rascunho' ? `rascunho ${tempoRelativo(c.atualizado_em)}` : '']
			.filter(Boolean)
			.join(' · '),
		status: c.status,
		href: `/campanhas/${k.id}/equipamentos/${c.id}`,
		externo: false,
		// o que foi aprovado sem dono (itens, armas e marionetes da biblioteca) o Mestre pode conceder
		conceder:
			c.status === 'aprovado' && (c.tipo === 'item' || !c.personagem_id)
				? {
						tipo: 'item',
						custo: c.custo,
						item: { id: c.tipo === 'item' ? `eqi-${c.id}` : `eq-${c.id}`, nome: c.nome, qtd: 1, peso: c.tipo === 'marionete' ? 0 : (c.resumo.carga ?? 0.5), conjunto: c.resumo.consumivel ? 5 : undefined, grupo: c.tipo === 'arma' ? 'Armas' : c.tipo === 'item' ? 'Itens' : 'Outros', icone: c.resumo.icone ?? 'equip/ic-equip-ferramenta', nota: c.tipo === 'item' ? undefined : [c.resumo.categoria, c.resumo.dano].filter(Boolean).join(' · ') }
					}
				: undefined
	});
	const oficiais = $derived<Record<Tipo, Card[]>>({
		arma: data.armas.map((a) => ({
			chave: a.slug,
			icone: a.icone,
			categoria: `ARMA · ${a.categoria.toUpperCase()}`,
			nome: a.nome,
			preco: ryo(a.preco),
			peso: `${a.dano} · ${a.peso}`,
			efeito: [a.alcance, ...a.propriedades].join(' · '),
			rodape: 'Oficial · cap. 12',
			status: null,
			href: '/regras/equipamentos',
			externo: true,
			conceder: { tipo: 'item', custo: a.preco, item: { id: a.slug, nome: a.nome, qtd: CONJUNTOS.includes(a.slug) ? 10 : 1, peso: a.carga, conjunto: CONJUNTOS.includes(a.slug) ? 10 : undefined, grupo: 'Armas', icone: a.icone } } as Concessao
		})),
		item: data.itens.map((i) => ({
			chave: i.nome,
			icone: 'equip/ic-equip-ferramenta',
			categoria: 'ITEM',
			nome: i.nome,
			preco: i.preco,
			peso: i.peso,
			efeito: i.efeito,
			rodape: 'Oficial · cap. 11',
			status: null,
			href: '/regras/equipamento-e-itens',
			externo: true,
			conceder: /^d/.test(i.preco) && !/a/.test(i.preco)
				? ({ tipo: 'item', custo: Number(i.preco.replace(/D/g, '')), item: { id: `item-${slug(i.nome)}`, nome: i.nome, qtd: 1, peso: PESOS[i.peso.replace(/.$/, '').trim().toLowerCase()] ?? 0.5, grupo: 'Itens', icone: 'equip/ic-equip-ferramenta' } } as Concessao)
				: undefined
		})),
		marionete: []
	});
	let tipo = $state<Tipo>('arma');
	const lista = $derived((t: Tipo, o: Origem): Card[] => {
		if (o === 'oficiais') return oficiais[t];
		const doTipo = criados.filter((c) => c.tipo === t);
		if (o === 'campanha') return doTipo.filter((c) => c.status === 'aprovado' && !substituidos.has(c.id)).map(cardCriado);
		if (o === 'revisao') return doTipo.filter((c) => c.status === 'em_revisao' && c.autor_id !== eu).map(cardCriado);
		return doTipo.filter((c) => c.autor_id === eu).map(cardCriado);
	});
	const ORIGENS = $derived<{ id: Origem; nome: string }[]>([
		{ id: 'oficiais', nome: 'OFICIAIS' },
		{ id: 'campanha', nome: 'DA CAMPANHA' },
		...(mestre ? [{ id: 'revisao' as const, nome: 'EM REVISÃO' }] : []),
		{ id: 'minhas', nome: 'MINHAS' }
	]);
	// svelte-ignore state_referenced_locally
	let origem = $state<Origem>(mestre && criados.some((c) => c.status === 'em_revisao' && c.autor_id !== eu) ? 'revisao' : 'oficiais');
	$effect(() => {
		// sem marionetes oficiais no livro: abre direto nas da campanha
		if (tipo === 'marionete' && origem === 'oficiais') origem = 'campanha';
	});
	const visiveis = $derived(lista(tipo, origem));
	const VAZIO: Record<Origem, string> = {
		oficiais: 'O livro não traz marionetes prontas; as estruturas e os mecanismos estão no cap. 13.',
		campanha: 'Nada criado e aprovado nesta campanha ainda.',
		revisao: 'Nada esperando sua revisão.',
		minhas: 'Você ainda não criou nada aqui.'
	};
	const ativa = $derived(!k.arquivada_em);
	let modal = $state<'item' | 'arma' | 'marionete' | null>(null);
	let concedendo = $state<Concessao | null>(null);
	const CONJUNTOS = ['arma-kunai', 'arma-shuriken', 'arma-senbon'];
	const slug = (s: string) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
	const fichasAtivas = $derived(data.personagens.filter((p) => p.status === 'aprovada' && p.situacao === 'ativo' && !p.pre_gerado).map((p) => ({ id: p.id, nome: p.nome, pt: p.pt, ryo: p.ryo })));
</script>

<main class="flex min-w-0 flex-col gap-3.5 p-4 md:p-6">
	<div class="flex flex-wrap items-center gap-2">
		<h1 class="m-0 flex-1 font-mincho text-[30px] leading-[38px] font-bold max-md:text-2xl">Equipamentos</h1>
		{#if ativa}
			<button type="button" class="btn-jogo btn-contorno text-[13px]" onclick={() => (modal = 'item')}>NOVO ITEM</button>
			<button type="button" class="btn-jogo btn-contorno com-icone text-[13px]" onclick={() => (modal = 'marionete')}><Icone id="acao/ic-acao-construir-marionete" />CONSTRUIR MARIONETE</button>
			<button type="button" class="btn-jogo btn-primario com-icone text-[13px]" onclick={() => (modal = 'arma')}><Icone id="acao/ic-acao-forjar" />FORJAR ARMA</button>
		{/if}
	</div>
	{#if form?.erro}<Alerta tipo="erro" titulo={form.erro} />{/if}

	<div class="flex flex-wrap items-center gap-4">
		<div role="tablist" aria-label="Tipo" class="flex overflow-x-auto border-y-2 border-ink bg-b2">
			{#each [['arma', 'ARMAS'], ['item', 'ITENS'], ['marionete', 'MARIONETES']] as [t, n] (t)}
				<button type="button" role="tab" aria-selected={tipo === t} class="px-4 py-[15px] font-pixel text-sm leading-none font-semibold tracking-[0.05em] whitespace-nowrap {tipo === t ? 'bg-vermelhao text-white' : 'text-mut hover:text-fg'}" onclick={() => (tipo = t as Tipo)}>{tipo === t ? '▸ ' : ''}{n}</button>
			{/each}
		</div>
		<div class="flex flex-wrap border-2 border-mut" role="group" aria-label="Origem">
			{#each ORIGENS as o (o.id)}
				<button type="button" aria-pressed={origem === o.id} class="flex min-h-9 items-center gap-1.5 border-r-2 border-mut px-2.5 font-pixel text-xs font-bold last:border-r-0 {origem === o.id ? 'bg-fg text-b1' : ''}" onclick={() => (origem = o.id)}>{o.nome}<span class="opacity-70">{lista(tipo, o.id).length}</span></button>
			{/each}
		</div>
	</div>

	<div role="tabpanel">
		{#if visiveis.length}
			<ul class="m-0 grid list-none gap-3 p-0 md:grid-cols-2 xl:grid-cols-3">
				{#each visiveis as c (c.chave)}
					{@const st = c.status ? STATUS_CRIACAO[c.status] : null}
					<li class="relative">
						<svelte:element
							this={c.href ? 'a' : 'div'}
							href={c.href}
							target={c.externo ? '_blank' : undefined}
							rel={c.externo ? 'noopener' : undefined}
							class="flex h-full flex-col border-2 bg-b2 text-fg shadow-[4px_4px_0_var(--ink)] {c.href ? 'cartao-link' : ''} {c.status === 'rascunho' ? 'border-dashed border-frame' : c.status === 'em_revisao' ? 'border-warn' : 'border-frame'}"
						>
							<span class="flex items-center gap-3 border-b-2 border-b3 p-3">
								<span class="flex h-[72px] w-[72px] flex-none items-center justify-center border-2 border-b3 bg-b1"><Icone id={c.icone} tamanho={64} /></span>
								<span class="flex min-w-0 flex-col gap-[3px]">
									<span class="font-pixel text-xs leading-none font-bold tracking-[0.1em] text-mut">{c.categoria}</span>
									<span class="font-mincho text-lg leading-6 font-bold">{c.nome}</span>
								</span>
							</span>
							<span class="flex flex-1 flex-col gap-2 px-3 py-2.5">
								<span class="flex flex-wrap gap-3.5 font-pixel text-sm leading-none font-bold"><span>{c.preco.toUpperCase()}</span>{#if c.peso}<span class="text-mut">{c.peso}</span>{/if}</span>
								{#if c.efeito}<span class="text-[13px] leading-[19px]">{c.efeito}</span>{/if}
								<span class="mt-auto flex flex-wrap items-center gap-2">
									{#if st}<span class="inline-flex h-8 items-center gap-0.5 border-2 border-ink pr-1.5 text-xs leading-none font-semibold {st.classe}"><Icone id={st.icone} class="h-7 w-7" />{st.rotulo}</span>{/if}
									<span class="text-xs leading-4 text-mut">{c.rodape}</span>
								</span>
							</span>
						</svelte:element>
						{#if mestre && ativa && c.conceder}
							<button type="button" class="absolute -top-2 -right-2 flex h-9 w-9 items-center justify-center border-2 border-ink bg-b2 hover:bg-b3" title="Conceder a uma ficha" aria-label="Conceder {c.nome} a uma ficha" onclick={() => (concedendo = c.conceder!)}><Icone id="acao/ic-acao-conceder" /></button>
						{/if}
					</li>
				{/each}
			</ul>
		{:else}
			<div class="flex flex-col items-center gap-2.5 border-2 border-dashed border-b3 p-10 text-center">
				<Icone id="nav/ic-nav-equipamentos" tamanho={64} />
				<span class="text-base leading-[22px] font-semibold">{origem === 'oficiais' && tipo !== 'marionete' ? 'Nada aqui.' : VAZIO[origem]}</span>
				{#if tipo === 'marionete' && origem === 'oficiais'}<a href="/regras/marionetes" class="link text-sm font-semibold">Cap. 13 · Marionetes</a>{/if}
			</div>
		{/if}
	</div>
</main>

{#if concedendo}
	<ModalConceder alvo={concedendo} fichas={fichasAtivas} aoFechar={() => (concedendo = null)} />
{:else if modal === 'item'}
	<ModalItem campanha={k.id} {eu} direto={mestre || !aprovacao.itens} aoFechar={() => (modal = null)} />
{:else if modal}
	<Modal rotulo={modal === 'arma' ? 'Forjar arma' : 'Construir marionete'} largura={520} topo={120} aoFechar={() => (modal = null)}>
		<div class="bg-grena px-5 py-3.5"><h2 class="m-0 font-mincho text-[22px] leading-7 font-bold text-papel">{modal === 'arma' ? 'Forjar arma' : 'Construir marionete'}</h2></div>
		<form method="POST" action="?/criar" class="flex flex-col gap-4 p-5">
			<input type="hidden" name="tipo" value={modal} />
			<p class="m-0 text-[15px] leading-[23px]">
				{modal === 'arma' ? 'Toda arma forjada é única: escolha a base do cap. 12, a qualidade, as propriedades e o forjador (cap. 21).' : 'Escolha a estrutura, encaixe os mecanismos nos slots e defina o modo de manipulação (cap. 13).'}
				Na aprovação, o custo sai do ryo da ficha e o {modal === 'arma' ? 'objeto' : 'boneco'} vai para o inventário dela.
			</p>
			<label class="flex flex-col gap-1.5 text-sm font-semibold">
				Para qual personagem?
				<select name="personagem" class="campo pr-8 font-normal">
					{#if mestre}<option value="">Nenhum (biblioteca ou NPC)</option>{/if}
					{#each fichas as f (f.id)}<option value={f.id}>{f.nome || 'sem nome'}{f.aprovada ? '' : ' (ficha ainda não aprovada)'}</option>{/each}
				</select>
			</label>
			<div class="flex justify-end gap-2">
				<button type="button" class="btn-jogo btn-fantasma" onclick={() => (modal = null)}>CANCELAR</button>
				<button type="submit" class="btn-jogo btn-primario" disabled={!mestre && !fichas.length}>{modal === 'arma' ? 'ABRIR A FORJA' : 'ABRIR A OFICINA'}</button>
			</div>
		</form>
	</Modal>
{/if}
