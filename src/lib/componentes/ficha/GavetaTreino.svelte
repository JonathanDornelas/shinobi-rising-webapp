<script lang="ts">
	// P5 · Treino: gastar PT em jutsus, especializações, proficiências e elementos (cap. 18), e pedir PT de sessões de treino.
	import { refreshAll } from '$app/navigation';
	import { toasts } from '#lib/estado/toasts.svelte.ts';
	import {
		AMBIENTES,
		CATEGORIAS_ARMA,
		custoProficiencia,
		EQUIPAMENTOS_PROFICIENCIA,
		ptDaSessao,
		SESSOES_TREINO,
		TIPOS_PROFICIENCIA,
		type TipoProficiencia
	} from '#lib/personagem/dados.ts';
	import type { FichaJogo } from '#lib/personagem/ficha.svelte.ts';
	import { aplicarTreinos, opcoesTreino, rotuloAlvo, type OpcaoTreino } from '#lib/personagem/progressao.ts';
	import { jutsusConhecidos, resumoFicha, type ItemLoja, type Treino } from '#lib/personagem/regras.ts';
	import { supabase } from '#lib/supabase/cliente.ts';
	import type { Json } from '#lib/supabase/banco.ts';
	import Glosa from '../regras/Glosa.svelte';
	import Campo from '../ui/Campo.svelte';
	import Girando from '../ui/Girando.svelte';
	import Icone from '../ui/Icone.svelte';
	import Modal from '../ui/Modal.svelte';
	import { prenderFoco } from '../ui/foco';

	interface Props {
		f: FichaJogo;
		pt: number;
		aprovacaoTreino: boolean;
		aoFechar: () => void;
	}
	let { f, pt, aprovacaoTreino, aoFechar }: Props = $props();

	type Aba = 'jutsu' | 'especializacao' | 'proficiencia' | 'elemento';
	const ABAS: { id: Aba; nome: string }[] = [
		{ id: 'jutsu', nome: 'APRENDER JUTSU' },
		{ id: 'especializacao', nome: 'ESPECIALIZAÇÃO' },
		{ id: 'proficiencia', nome: 'PROFICIÊNCIA' },
		{ id: 'elemento', nome: 'ELEMENTO' }
	];
	let aba = $state<Aba>('jutsu');
	let carrinho = $state<OpcaoTreino[]>([]);
	let filtro = $state('');
	let gastando = $state(false);

	const nomeEsp = (id: string) => f.catalogo.especializacoes.find((e) => e.id === id)?.nome ?? id;
	// as opções consideram o que já está no carrinho (ex.: subir a mesma proficiência duas vezes)
	const comCarrinho = $derived(aplicarTreinos(f.dados, carrinho.map((c) => c.treino)));
	const opcoes = $derived(opcoesTreino(f.dados, f.catalogo.jutsus, nomeEsp));
	const custo = $derived(carrinho.reduce((t, c) => t + c.pt, 0));
	const resta = $derived(pt - custo);
	const lista = $derived(
		opcoes
			.filter((o) => o.grupo === aba && (aba !== 'jutsu' || `${o.nome} ${o.traducao ?? ''}`.toLowerCase().includes(filtro.trim().toLowerCase())))
			.sort((a, b) => Number(!!a.bloqueio) - Number(!!b.bloqueio) || a.pt - b.pt)
	);
	const noCarrinho = (o: OpcaoTreino) => carrinho.some((c) => c.chave === o.chave);
	function alternar(o: OpcaoTreino) {
		if (noCarrinho(o)) carrinho = carrinho.filter((c) => c.chave !== o.chave);
		else if (!o.bloqueio && o.pt <= resta) {
			// um elemento por vez; uma subida por alvo
			carrinho = [...carrinho.filter((c) => !(o.grupo === 'elemento' && c.grupo === 'elemento')), o];
		}
	}

	// nova proficiência (Familiar)
	let novaTipo = $state<TipoProficiencia>('arma');
	let novaAlvo = $state('');
	const alvos = $derived(
		novaTipo === 'arma'
			? f.catalogo.armas
			: novaTipo === 'categoria'
				? CATEGORIAS_ARMA
				: novaTipo === 'ambiente'
					? AMBIENTES
					: novaTipo === 'equipamento'
						? EQUIPAMENTOS_PROFICIENCIA
						: jutsusConhecidos(comCarrinho)
	);
	const profsAtuais = $derived(f.calc.proficiencias.length + carrinho.filter((c) => c.chave.startsWith('nova:')).length);
	function adicionarNova() {
		if (!novaAlvo || profsAtuais >= 5) return;
		const p = custoProficiencia(novaTipo, 1);
		if (p > resta) return;
		const t: Treino = { tipo: 'proficiencia', prof: { tipo: novaTipo, alvo: novaAlvo }, nivel: 1, pt: p };
		carrinho = [
			...carrinho,
			{
				chave: `nova:${novaTipo}:${novaAlvo}`,
				grupo: 'proficiencia',
				nome: `${rotuloAlvo(novaTipo, novaAlvo, f.catalogo.jutsus)} · Familiar`,
				descricao: 'Nova proficiência',
				pt: p,
				icone: 'arma/ic-arma-kunai',
				bloqueio: '',
				treino: t
			}
		];
		novaAlvo = '';
	}

	/** Tempo mínimo de treino do cap. 18 para jutsus (com mestre fica mais curto em B, A e S). */
	const DIAS: Record<string, number> = { E: 1, D: 3, C: 7, B: 14, A: 30, S: 90 };
	const dias = $derived(
		carrinho.reduce((t, c) => {
			if (c.treino.tipo !== 'jutsu') return t;
			const slug = c.treino.slug;
			return t + (DIAS[f.catalogo.jutsus.find((j) => j.slug === slug)?.rank ?? 'E'] ?? 0);
		}, 0)
	);
	const prazo = (d: number) => (d >= 30 ? `${Math.round(d / 30)} ${d >= 60 ? 'meses' : 'mês'}` : d >= 7 ? `${Math.floor(d / 7)} ${d >= 14 ? 'semanas' : 'semana'}${d % 7 ? ` e ${d % 7} dias` : ''}` : `${d} ${d === 1 ? 'dia' : 'dias'}`);

	async function gastar() {
		if (!carrinho.length || resta < 0) return;
		gastando = true;
		const dados = aplicarTreinos(f.dados, carrinho.map((c) => c.treino));
		const { error } = await supabase().rpc('treinar', {
			ficha: f.id,
			dados: dados as unknown as Json,
			resumo: resumoFicha(dados, f.catalogo.loja as ItemLoja[]) as unknown as Json,
			custo,
			descricao: carrinho.map((c) => c.nome).join(', ').slice(0, 160)
		});
		gastando = false;
		if (error) return toasts.mostrar(error.message.includes('insuficientes') ? 'PT insuficientes.' : 'Não foi possível registrar o treino.', 'erro');
		toasts.mostrar(`Treino registrado: −${custo} PT.`, 'sucesso');
		carrinho = [];
		await refreshAll();
		aoFechar();
	}

	// pedido de PT de treino
	let pedindo = $state(false);
	let sessao = $state('mentor');
	let semanas = $state(1);
	let descricao = $state('');
	let enviando = $state(false);
	const ganho = $derived(ptDaSessao(sessao, semanas));
	async function pedir(e: SubmitEvent) {
		e.preventDefault();
		if (!descricao.trim() || ganho <= 0) return;
		enviando = true;
		const { data, error } = await supabase().rpc('solicitar_pt', { ficha: f.id, sessao, semanas, descricao: descricao.trim() });
		enviando = false;
		if (error) return toasts.mostrar('Não foi possível registrar a sessão.', 'erro');
		toasts.mostrar(data === 'aprovado' ? `+${ganho} PT de treino.` : 'Pedido enviado ao Mestre.', 'sucesso');
		pedindo = false;
		descricao = '';
		await refreshAll();
	}
</script>

<div class="fixed inset-0 z-40 flex justify-end bg-[rgba(14,11,10,.78)]" role="presentation" onclick={(e) => e.target === e.currentTarget && aoFechar()}>
	<div role="dialog" aria-modal="true" aria-label="Treino" tabindex="-1" class="flex h-full w-full max-w-[720px] flex-col border-l-2 border-[var(--vermelhao-lo)] bg-b2 shadow-[-8px_0_0_#000] outline-none" {@attach prenderFoco(aoFechar)}>
		<div class="flex items-center gap-2.5 bg-grena py-3 pr-3 pl-5 text-papel">
			<Icone id="recurso/ic-recurso-pt" />
			<h2 class="m-0 flex-1 font-mincho text-[22px] leading-7 font-bold">Treino · {f.dados.conceito.nome}</h2>
			<button type="button" class="flex h-11 w-11 items-center justify-center" aria-label="Fechar" onclick={aoFechar}>✕</button>
		</div>
		<div class="flex items-center gap-3.5 border-b-2 border-b3 px-5 py-3">
			<span class="t-rotulo">PT</span>
			<div class="flex h-[18px] flex-1 gap-0.5" aria-hidden="true">
				{#each { length: Math.min(Math.max(pt, 1), 40) } as _, i (i)}
					<div class="flex-1 border-2 border-ink" style:background={i < custo ? 'var(--vermelhao)' : i < pt ? 'var(--b1)' : 'var(--b3)'}></div>
				{/each}
			</div>
			<span class="t-num text-base" style:color={resta === 0 && custo ? 'var(--ok)' : undefined} aria-live="polite">{resta} / {pt}</span>
		</div>
		<div role="tablist" class="flex border-b-2 border-ink bg-b1">
			{#each ABAS as a (a.id)}
				<button
					type="button"
					role="tab"
					aria-selected={aba === a.id}
					class="flex-1 px-2 py-3.5 font-pixel text-[13px] leading-none font-bold tracking-[0.04em] max-sm:text-[11px] {aba === a.id ? 'bg-vermelhao text-white' : 'text-mut hover:text-fg'}"
					onclick={() => (aba = a.id)}>{a.nome}</button
				>
			{/each}
		</div>
		<div class="flex flex-1 flex-col gap-2 overflow-y-auto px-5 py-3.5">
			{#if aba === 'jutsu'}<input class="campo h-10 text-[15px]" placeholder="Filtrar jutsus…" aria-label="Filtrar jutsus" bind:value={filtro} />{/if}
			{#if aba === 'proficiencia'}
				<div class="flex flex-wrap items-end gap-2 border-2 border-dashed border-b3 p-2.5">
					<label class="flex flex-col gap-1 text-xs font-semibold">
						Nova proficiência
						<select class="campo h-10 text-sm" bind:value={novaTipo} onchange={() => (novaAlvo = '')}>
							{#each TIPOS_PROFICIENCIA as t (t.id)}<option value={t.id}>{t.nome}</option>{/each}
						</select>
					</label>
					<select class="campo h-10 min-w-[160px] flex-1 text-sm" aria-label="Alvo" bind:value={novaAlvo}>
						<option value="">Escolha…</option>
						{#each alvos as a (a)}<option value={a}>{rotuloAlvo(novaTipo, a, f.catalogo.jutsus)}</option>{/each}
					</select>
					<button type="button" class="btn-jogo btn-contorno min-h-10 px-3 text-xs" disabled={!novaAlvo || profsAtuais >= 5 || custoProficiencia(novaTipo, 1) > resta} onclick={adicionarNova}>
						FAMILIAR · {custoProficiencia(novaTipo, 1)} PT
					</button>
					{#if profsAtuais >= 5}<span class="w-full text-xs font-semibold">Limite de 5 proficiências: para uma nova, é preciso renunciar a outra.</span>{/if}
				</div>
			{/if}
			{#each lista as o (o.chave)}
				{@const dentro = noCarrinho(o)}
				{@const curto = !dentro && o.pt > resta}
				<div class="flex items-center gap-2.5 border-2 bg-b1 py-2 pr-2.5 pl-1.5 {dentro ? 'border-vermelhao' : 'border-b3'} {o.bloqueio ? 'opacity-55' : ''}">
					<Icone id={o.icone} />
					<div class="flex min-w-0 flex-1 flex-col gap-0.5">
						<span class="text-[15px] leading-5 font-semibold">{o.nome}<Glosa texto={o.traducao} class="text-[13px] leading-[18px]" /></span>
						<span class="text-xs leading-4 text-mut">{o.descricao}</span>
						{#if o.bloqueio || curto}<span class="text-xs leading-4 font-semibold">{o.bloqueio || `Faltam ${o.pt - resta} PT`}</span>{/if}
					</div>
					<span class="t-num w-14 text-right text-lg">{o.pt} PT</span>
					<button
						type="button"
						class="min-h-10 min-w-[110px] border-2 font-pixel text-xs font-bold tracking-[0.06em] {dentro ? 'border-mut text-fg' : o.bloqueio || curto ? 'border-transparent bg-b3 text-mut' : 'border-transparent bg-vermelhao text-white'}"
						disabled={!dentro && (!!o.bloqueio || curto)}
						onclick={() => alternar(o)}>{dentro ? 'REMOVER' : 'ADICIONAR'}</button
					>
				</div>
			{:else}
				<p class="m-0 text-sm text-mut">{aba === 'especializacao' ? 'Todas as especializações estão no nível máximo.' : aba === 'elemento' ? 'Nenhum elemento novo disponível.' : 'Nada por aqui.'}</p>
			{/each}
		</div>
		<div class="flex flex-col gap-2.5 border-t-2 border-ink bg-b1 px-5 py-3">
			<div class="flex flex-wrap items-center gap-2.5">
				<span class="t-rotulo text-xs">Carrinho</span>
				<span class="flex-1 text-sm leading-5 font-semibold">{custo ? `${carrinho.length} ${carrinho.length === 1 ? 'item' : 'itens'} · gastar ${custo} PT → restam ${resta}` : 'Vazio'}</span>
				{#if dias}<span class="text-[13px] text-mut">Downtime mínimo: {prazo(dias)}</span>{/if}
			</div>
			<div class="flex flex-wrap gap-2">
				<button type="button" class="btn-jogo btn-contorno min-h-11 text-xs" onclick={() => (pedindo = true)}>SOLICITAR PT DE TREINO</button>
				<span class="flex-1"></span>
				<button type="button" class="btn-jogo {custo ? 'btn-primario' : 'bg-b3 text-mut'}" disabled={!custo || gastando} aria-busy={gastando} onclick={gastar}>
					{#if gastando}<Girando />{/if}GASTAR {custo} PT
				</button>
			</div>
		</div>
	</div>
</div>

{#if pedindo}
	<Modal rotulo="Registrar sessão de treino" largura={520} topo={120} aoFechar={() => !enviando && (pedindo = false)}>
		<div class="bg-grena px-5 py-3.5"><h2 class="m-0 font-mincho text-xl leading-[26px] font-bold text-papel">Registrar sessão de treino</h2></div>
		<form class="flex flex-col gap-3 p-5" onsubmit={pedir}>
			<fieldset class="m-0 flex flex-col gap-2 border-0 p-0">
				<legend class="sr-only">Tipo de sessão</legend>
				{#each SESSOES_TREINO as s (s.id)}
					<label class="flex min-h-11 cursor-pointer items-center gap-2.5 border-2 bg-b1 px-2.5 {sessao === s.id ? 'border-vermelhao' : 'border-b3'}">
						<input type="radio" name="sessao" value={s.id} bind:group={sessao} class="sr-only" />
						<span class="h-[18px] w-[18px] flex-none rotate-45 border-2 border-ink" style:background={sessao === s.id ? 'var(--vermelhao)' : 'var(--b1)'} aria-hidden="true"></span>
						<span class="flex flex-1 flex-col"><span class="text-[15px] font-medium">{s.nome}</span><span class="text-xs text-mut">{s.nota}</span></span>
					</label>
				{/each}
			</fieldset>
			<div class="grid grid-cols-[120px_minmax(0,1fr)] gap-3">
				<Campo id="tr-semanas" rotulo="Semanas">
					<input id="tr-semanas" type="number" min="1" max="12" class="campo t-num" bind:value={semanas} />
				</Campo>
				<Campo id="tr-desc" rotulo="O que treinou" obrigatorio>
					<input id="tr-desc" class="campo" maxlength="300" placeholder="Arremesso de kunai com o sensei" bind:value={descricao} />
				</Campo>
			</div>
			{#if ganho <= 0}<span class="text-[13px] font-semibold text-err">Treino especializado exige pelo menos 4 semanas.</span>{/if}
			<div class="flex justify-end gap-2">
				<button type="button" class="btn-jogo btn-fantasma" disabled={enviando} onclick={() => (pedindo = false)}>CANCELAR</button>
				<button type="submit" class="btn-jogo btn-primario" disabled={enviando || !descricao.trim() || ganho <= 0} aria-busy={enviando}>
					{#if enviando}<Girando />{/if}{aprovacaoTreino ? 'ENVIAR AO MESTRE' : 'REGISTRAR'} · +{ganho} PT
				</button>
			</div>
		</form>
	</Modal>
{/if}
