<script lang="ts">
	// P2 · Criação de personagem em 12 passos (cap. 6). Também é a ficha em leitura (enviada, aprovada) e a tela em que o
	// Mestre decide sobre a ficha em revisão. Salva sozinho enquanto o jogador edita.
	import { onDestroy } from 'svelte';
	import { goto, refreshAll } from '$app/navigation';
	import { page } from '$app/state';
	import PassoAtributos from '#lib/componentes/personagem/PassoAtributos.svelte';
	import PassoBackground from '#lib/componentes/personagem/PassoBackground.svelte';
	import PassoCla from '#lib/componentes/personagem/PassoCla.svelte';
	import PassoConceito from '#lib/componentes/personagem/PassoConceito.svelte';
	import ExcluirFicha from '#lib/componentes/personagem/ExcluirFicha.svelte';
	import PassoEquipamento from '#lib/componentes/personagem/PassoEquipamento.svelte';
	import PassoEspecializacao from '#lib/componentes/personagem/PassoEspecializacao.svelte';
	import PassoJutsus from '#lib/componentes/personagem/PassoJutsus.svelte';
	import PassoPericias from '#lib/componentes/personagem/PassoPericias.svelte';
	import PassoProficiencias from '#lib/componentes/personagem/PassoProficiencias.svelte';
	import PassoRecursos from '#lib/componentes/personagem/PassoRecursos.svelte';
	import PassoRevisao from '#lib/componentes/personagem/PassoRevisao.svelte';
	import PassoVila from '#lib/componentes/personagem/PassoVila.svelte';
	import ResumoFicha from '#lib/componentes/personagem/ResumoFicha.svelte';
	import Alerta from '#lib/componentes/ui/Alerta.svelte';
	import Campo from '#lib/componentes/ui/Campo.svelte';
	import Girando from '#lib/componentes/ui/Girando.svelte';
	import Icone from '#lib/componentes/ui/Icone.svelte';
	import IndicadorSalvo, { type EstadoSalvo } from '#lib/componentes/ui/IndicadorSalvo.svelte';
	import Modal from '#lib/componentes/ui/Modal.svelte';
	import { Criador } from '#lib/personagem/criador.svelte.ts';
	import { normalizarFicha, PASSOS, sinal, type FichaDados } from '#lib/personagem/regras.ts';
	import { APROVACAO_PADRAO } from '#lib/campanhas/dominio.ts';
	import { hrefFicha, STATUS_FICHA } from '#lib/personagem/status.ts';
	import { toasts } from '#lib/estado/toasts.svelte.ts';
	import { dataCurta } from '#lib/formatar.ts';
	import { supabase } from '#lib/supabase/cliente.ts';
	import type { Json, StatusFicha } from '#lib/supabase/banco.ts';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	// svelte-ignore state_referenced_locally
	const p0 = data.personagem;
	// svelte-ignore state_referenced_locally
	const k = data.campanha;
	const aprovacao = { ...APROVACAO_PADRAO, ...k.aprovacao };
	// svelte-ignore state_referenced_locally
	const c = new Criador(
		normalizarFicha(p0.dados as Partial<FichaDados>),
		data.catalogo,
		{
			vilas: k.vilas.map((v) => v.id),
			clas: k.clas_permitidos,
			clasSemKkg: k.clas_sem_kkg,
			clasComKkg: k.clas_com_kkg,
			pacotes: k.pacotes,
			aprovacao: { fichas: aprovacao.fichas, backgrounds: aprovacao.backgrounds },
			nivelInicial: k.nivel_inicial
		},
		data.editavel,
		data.editavel ? 1 : 12,
		data.clasCriados
	);
	// volta do criador de clã (K2) com ?cla=: escolhe o clã criado e abre o passo 4
	const claDaVolta = page.url.searchParams.get('cla');
	const claAntes = JSON.stringify(c.ficha.cla);
	if (c.editavel && claDaVolta && c.clasCriados.some((x) => x.id === claDaVolta)) {
		c.usarClaCriado(claDaVolta);
		c.passo = 4;
	} else if (c.editavel && c.ficha.cla.id && c.clasCriados.some((x) => x.id === c.ficha.cla.id)) {
		// o clã pode ter mudado desde o último salvamento: atualiza a cópia das regras
		const escolha = c.ficha.cla.escolha;
		c.usarClaCriado(c.ficha.cla.id);
		c.ficha.cla.escolha = escolha;
	}
	// volta do criador de jutsus (passo 9) com ?passo=
	const passoDaVolta = Number(page.url.searchParams.get('passo'));
	if (c.editavel && !claDaVolta && Number.isInteger(passoDaVolta) && passoDaVolta >= 1 && passoDaVolta <= 12) c.passo = passoDaVolta;
	/** O clã mudou ao abrir (volta do K2 ou regras atualizadas): salva já, sem esperar outra edição. */
	const mudouAoAbrir = JSON.stringify(c.ficha.cla) !== claAntes;
	// svelte-ignore state_referenced_locally
	let mensagem = $state(p0.mensagem ?? '');
	let excluindo = $state(false);
	const status = $derived(data.personagem.status as StatusFicha);
	const revisando = $derived(data.papel === 'mestre' && !data.dono && status === 'em_revisao');

	// ---------------------------------------------------------------- salvamento automático
	let salvo = $state<EstadoSalvo>({ tipo: 'ocioso' });
	let temporizador: ReturnType<typeof setTimeout> | undefined;
	let primeira = true;
	let pendente: Promise<void> | null = null;

	async function salvar() {
		clearTimeout(temporizador);
		temporizador = undefined;
		if (!data.editavel) return;
		salvo = { tipo: 'salvando' };
		const dados = $state.snapshot(c.ficha) as FichaDados;
		const { error } = await supabase()
			.from('personagens')
			.update({
				nome: dados.conceito.nome.trim(),
				dados: dados as unknown as Json,
				resumo: c.resumo as unknown as Json,
				mensagem: mensagem.trim() || null,
				cla_id: dados.cla.tipo === 'novo-sem-kkg' || dados.cla.tipo === 'novo-com-kkg' ? (dados.cla.id ?? null) : null
			})
			.eq('id', p0.id);
		salvo = error ? { tipo: 'erro', texto: 'Não foi possível salvar. Tentando de novo…' } : { tipo: 'salvo', em: Date.now() };
		if (error) temporizador = setTimeout(salvar, 4000);
	}
	$effect(() => {
		JSON.stringify(c.ficha);
		void mensagem;
		if (primeira) {
			primeira = false;
			if (!mudouAoAbrir) return;
		}
		if (!data.editavel) return;
		clearTimeout(temporizador);
		temporizador = setTimeout(() => (pendente = salvar()), 700);
	});
	onDestroy(() => clearTimeout(temporizador));
	async function garantirSalvo() {
		if (temporizador) await salvar();
		await pendente;
	}

	async function salvarESair() {
		await garantirSalvo();
		await goto(`/campanhas/${k.id}`, { refreshAll: true });
	}
	/** Sai para outra tela (o criador de clã) sem perder a última edição. */
	async function salvarEIr(destino: string) {
		await garantirSalvo();
		await goto(destino);
	}

	// ---------------------------------------------------------------- envio
	let modal = $state<'confirmar' | 'enviada' | 'decidir' | null>(null);
	let enviando = $state(false);
	let resultado = $state<StatusFicha | null>(null);

	async function enviar() {
		enviando = true;
		await garantirSalvo();
		const { data: novo, error } = await supabase().rpc('enviar_ficha', { ficha: p0.id });
		enviando = false;
		if (error) {
			modal = null;
			toasts.mostrar('Não foi possível enviar. A ficha continua salva como rascunho.', 'erro', 6000);
			return;
		}
		resultado = novo;
		modal = 'enviada';
	}

	async function retirar() {
		const { error } = await supabase().rpc('retirar_ficha', { ficha: p0.id });
		if (error) return toasts.mostrar('Não foi possível retirar. O Mestre pode já ter decidido.', 'erro');
		toasts.mostrar('Ficha de volta para rascunho.', 'info');
		await refreshAll();
		location.reload();
	}

	// ---------------------------------------------------------------- decisão do Mestre
	let decisao = $state<'aprovada' | 'ajustes' | 'rejeitada'>('aprovada');
	let comentario = $state('');
	let decidindo = $state(false);
	let erroDecisao = $state('');
	function abrirDecisao(d: typeof decisao) {
		decisao = d;
		comentario = '';
		erroDecisao = '';
		modal = 'decidir';
	}
	async function decidir() {
		if (decisao !== 'aprovada' && !comentario.trim()) return (erroDecisao = 'Explique o que precisa mudar.');
		decidindo = true;
		const { error } = await supabase().rpc('decidir_ficha', { ficha: p0.id, decisao, comentario: comentario.trim() || null });
		decidindo = false;
		if (error) return (erroDecisao = 'Não foi possível registrar a decisão. Tente de novo.');
		modal = null;
		toasts.mostrar(decisao === 'aprovada' ? 'Ficha aprovada.' : decisao === 'ajustes' ? 'Ajustes pedidos ao jogador.' : 'Ficha rejeitada.', 'sucesso');
		await goto(`/campanhas/${k.id}`, { refreshAll: true });
	}

	// ---------------------------------------------------------------- navegação
	let menuPassos = $state(false);
	let conteudo: HTMLElement | undefined = $state();
	function ir(p: number) {
		c.irPara(p);
		menuPassos = false;
		conteudo?.scrollTo({ top: 0 });
		window.scrollTo({ top: 0 });
	}
	const ESTADO = {
		feito: { classe: 'border-ink bg-ok text-okfg', marca: '✓' },
		erro: { classe: 'border-err text-err', marca: '!' },
		pendente: { classe: 'border-b3 text-mut', marca: '' }
	} as const;
	const STATUS = STATUS_FICHA;
	const titulo = $derived(
		data.editavel ? (status === 'ajustes' ? 'Ajustar personagem' : 'Criar personagem') : `Ficha de ${c.ficha.conceito.nome || 'personagem sem nome'}`
	);
	const orcamentoMobile = $derived(
		c.passo === 2
			? `ATRIBUTOS: ${c.atributos.restantes} RESTANTES`
			: c.passo === 5
				? `PERÍCIAS: ${c.pontosPericia.restantes} RESTANTES`
				: c.passo === 6
					? `PT: ${c.pt.restantes} RESTANTES`
					: `PV ${c.recursos.pv} · PC ${c.recursos.pc} · PE ${c.recursos.pe}`
	);
	let resumoAberto = $state(false);
</script>

<svelte:window onbeforeunload={(e) => temporizador && e.preventDefault()} />

<div class="flex flex-1 flex-col">
	<!-- cabeçalho do criador -->
	<div class="flex min-h-14 flex-wrap items-center gap-x-3 gap-y-1 border-b-2 border-ink bg-b2 px-4 py-2 md:px-6">
		<Icone id="acao/ic-acao-criar-personagem" />
		<h1 class="m-0 font-mincho text-xl leading-[26px] font-bold">{titulo}</h1>
		<span class="border-2 border-b3 px-[7px] py-[5px] font-pixel text-xs leading-none font-semibold tracking-[0.06em] text-mut uppercase max-sm:hidden">{k.nome} · NÍVEL 1</span>
		{#if status !== 'rascunho'}
			<span class="inline-flex h-9 items-center gap-0.5 border-2 border-ink pr-2 text-xs leading-none font-semibold {STATUS[status].classe}"><Icone id={STATUS[status].icone} />{STATUS[status].rotulo}</span>
		{/if}
		<span class="flex-1"></span>
		{#if (data.dono || data.papel === 'mestre') && !k.arquivada_em}
			<button type="button" class="btn-jogo btn-fantasma text-[13px] text-err" onclick={() => (excluindo = true)}>EXCLUIR</button>
		{/if}
		{#if data.editavel}
			<button type="button" class="btn-jogo btn-fantasma text-[13px]" onclick={salvarESair}>SALVAR E SAIR</button>
		{:else}
			<a href="/campanhas/{k.id}" class="btn-jogo btn-fantasma text-[13px]">VOLTAR À CAMPANHA</a>
		{/if}
	</div>

	<!-- tablet: passos em pontos e resumo recolhível -->
	<div class="hidden items-center gap-1 overflow-x-auto border-b-2 border-b3 bg-b2 px-5 py-3 md:flex lg:hidden" aria-label="Passos">
		{#each PASSOS as nome, i (nome)}
			{@const e = c.passo === i + 1 ? null : ESTADO[c.analise.passos[i]]}
			<button
				type="button"
				title={nome}
				aria-label="Passo {i + 1}: {nome}"
				aria-current={c.passo === i + 1 ? 'step' : undefined}
				class="t-num flex h-7 w-7 flex-none items-center justify-center border-2 text-xs {e ? e.classe : 'border-ink bg-vermelhao text-white'}"
				onclick={() => ir(i + 1)}>{e?.marca || i + 1}</button
			>{#if i < 11}<span class="h-1 w-2.5 flex-none bg-b3"></span>{/if}
		{/each}
	</div>
	<div class="border-b-2 border-ink bg-b2 xl:hidden max-md:hidden">
		<button type="button" class="flex min-h-12 w-full items-center gap-3.5 px-5 text-sm font-semibold" aria-expanded={resumoAberto} onclick={() => (resumoAberto = !resumoAberto)}>
			<span class="t-rotulo">Resumo</span><span>PV {c.recursos.pv} · PC {c.recursos.pc} · PE {c.recursos.pe}</span>
			<span class="text-mut">Atributos: {c.atributos.restantes} restantes</span><span class="flex-1"></span><span class="font-pixel">{resumoAberto ? '▴' : '▾'}</span>
		</button>
		{#if resumoAberto}<div class="border-t-2 border-b3 px-5 py-4"><ResumoFicha {c} /></div>{/if}
	</div>

	<!-- mobile: passo atual e menu de passos -->
	<div class="relative flex min-h-[52px] items-center border-b-2 border-ink bg-b2 pr-2 pl-4 md:hidden">
		<span class="flex-1 text-[15px] leading-5 font-semibold">Passo {c.passo} de 12 · {PASSOS[c.passo - 1]}</span>
		<button type="button" class="flex min-h-11 items-center border-2 border-b3 px-2.5 font-pixel text-xs font-bold" aria-expanded={menuPassos} onclick={() => (menuPassos = !menuPassos)}>PASSOS ▾</button>
		{#if menuPassos}
			<div class="camada absolute top-full right-2 z-30 mt-1 flex w-64 flex-col py-1.5">
				{#each PASSOS as nome, i (nome)}
					{@const e = ESTADO[c.analise.passos[i]]}
					<button type="button" class="flex min-h-11 items-center gap-2.5 px-3 text-left text-[15px] hover:bg-b3" aria-current={c.passo === i + 1 ? 'step' : undefined} onclick={() => ir(i + 1)}>
						<span class="t-num flex h-6 w-6 items-center justify-center border-2 text-xs {e.classe}">{e.marca || i + 1}</span>{nome}
					</button>
				{/each}
			</div>
		{/if}
	</div>

	<div class="grid flex-1 lg:grid-cols-[240px_minmax(0,1fr)] xl:grid-cols-[240px_minmax(0,1fr)_320px]">
		<nav aria-label="Passos" class="border-r-2 border-b3 bg-b2 py-2.5 max-lg:hidden">
			<ol class="sticky top-0 m-0 flex list-none flex-col p-0">
				{#each PASSOS as nome, i (nome)}
					{@const atual = c.passo === i + 1}
					{@const e = ESTADO[c.analise.passos[i]]}
					<li>
						<button
							type="button"
							aria-current={atual ? 'step' : undefined}
							class="flex min-h-11 w-full items-center gap-2.5 px-3.5 text-left {atual ? 'bg-grena text-papel shadow-[inset_4px_0_0_var(--vermelhao)]' : 'text-fg hover:bg-b3'}"
							onclick={() => ir(i + 1)}
						>
							<span class="t-num flex h-7 w-7 flex-none items-center justify-center border-2 text-[13px] {atual ? 'border-ink bg-vermelhao text-white' : e.classe}">{atual ? i + 1 : e.marca || i + 1}</span>
							<span class="flex-1 text-sm leading-[18px] {atual ? 'font-semibold' : 'font-medium'}">{nome}</span>
						</button>
					</li>
				{/each}
			</ol>
		</nav>

		<div class="flex min-w-0 flex-col">
			<main bind:this={conteudo} class="flex flex-1 flex-col gap-[18px] px-4 py-5 md:px-8 md:py-6">
				<div class="flex flex-wrap items-end gap-3">
					<div class="flex flex-1 flex-col gap-1">
						<span class="t-rotulo text-mut max-md:hidden">Passo {c.passo} de 12</span>
						<h2 class="m-0 font-mincho text-[30px] leading-[38px] font-bold max-md:text-2xl">{PASSOS[c.passo - 1]}</h2>
					</div>
					<a href="/regras/criacao-de-personagem" target="_blank" rel="noopener" class="link text-[13px] font-semibold">Regra: cap. 6{c.passo < 12 ? `, Passo ${c.passo}` : ''}</a>
				</div>

				{#if status === 'ajustes' && data.personagem.comentario_mestre}
					<Alerta tipo="info" titulo="{data.mestre} pediu ajustes">
						<span>“{data.personagem.comentario_mestre}”</span>
					</Alerta>
				{:else if status === 'em_revisao' && data.dono}
					<Alerta tipo="aviso" titulo="Em revisão pelo Mestre desde {dataCurta(data.personagem.enviada_em ?? data.personagem.atualizada_em)}">
						<span>A ficha fica bloqueada até {data.mestre} responder.</span>
						{#snippet acao()}<button type="button" class="btn-jogo btn-contorno min-h-10 text-xs" onclick={retirar}>RETIRAR DA REVISÃO</button>{/snippet}
					</Alerta>
				{:else if status === 'rejeitada'}
					<Alerta tipo="erro" titulo="Ficha rejeitada">{#if data.personagem.comentario_mestre}<span>“{data.personagem.comentario_mestre}”</span>{/if}</Alerta>
				{:else if revisando}
					<Alerta tipo="info" titulo="Ficha de {data.jogador} aguardando sua revisão">
						<span>Navegue pelos passos; na Revisão estão as verificações automáticas. Decida no fim da página.</span>
					</Alerta>
				{/if}
				{#if c.aviso}<Alerta tipo="info"><span aria-live="polite">{c.aviso}</span></Alerta>{/if}

				{#if c.passo === 1}<PassoConceito {c} ficha={data.personagem.id} retrato={data.personagem.retrato} podeFoto={data.dono && !data.campanha.arquivada_em} />
				{:else if c.passo === 2}<PassoAtributos {c} />
				{:else if c.passo === 3}<PassoVila {c} />
				{:else if c.passo === 4}<PassoCla {c} campanhaId={k.id} fichaId={p0.id} eu={data.usuario?.id ?? ''} irPara={salvarEIr} />
				{:else if c.passo === 5}<PassoPericias {c} />
				{:else if c.passo === 6}<PassoProficiencias {c} />
				{:else if c.passo === 7}<PassoEspecializacao {c} />
				{:else if c.passo === 8}<PassoRecursos {c} />
				{:else if c.passo === 9}<PassoJutsus {c} />
				{:else if c.passo === 10}<PassoEquipamento {c} />
				{:else if c.passo === 11}<PassoBackground {c} />
				{:else}<PassoRevisao {c} bind:mensagem leitura={!data.editavel} />{/if}

				{#if revisando}
					<section class="mt-2 flex flex-wrap items-center gap-2 border-2 border-[var(--vermelhao-lo)] bg-b2 p-3.5 sombra-painel" aria-label="Decisão do Mestre">
						<span class="t-rotulo flex-1">Sua decisão · {c.analise.bloqueios ? `${c.analise.bloqueios} bloqueio${c.analise.bloqueios > 1 ? 's' : ''} nas verificações` : 'sem bloqueios'}</span>
						<button type="button" class="btn-jogo btn-erro min-h-11" onclick={() => abrirDecisao('rejeitada')}>REJEITAR</button>
						<button type="button" class="btn-jogo btn-secundario" onclick={() => abrirDecisao('ajustes')}>PEDIR AJUSTES</button>
						<button type="button" class="btn-jogo btn-primario" onclick={() => abrirDecisao('aprovada')}>APROVAR</button>
					</section>
				{/if}
			</main>

			<!-- mobile: orçamento do passo -->
			<div class="sticky bottom-[128px] z-10 flex min-h-12 items-center gap-2 border-t-2 border-[var(--vermelhao-lo)] bg-grena pr-2 pl-3.5 text-papel md:hidden">
				<span class="flex-1 font-pixel text-sm leading-none font-bold" aria-live="polite">{orcamentoMobile}</span>
				<button type="button" class="flex min-h-10 items-center border-2 border-vermelhao px-2.5 font-pixel text-xs font-bold" onclick={() => ir(12)}>VER REVISÃO</button>
			</div>
			<div class="sticky bottom-16 z-10 flex items-center gap-3.5 border-t-2 border-ink bg-b2 px-4 py-2.5 md:bottom-0 md:px-5">
				<button type="button" class="btn-jogo btn-fantasma max-md:flex-1 max-md:border-2 max-md:border-mut" disabled={c.passo === 1} onclick={() => ir(c.passo - 1)}>◂ VOLTAR</button>
				<span class="flex-1 max-md:hidden"></span>
				{#if data.editavel}<span class="max-sm:hidden"><IndicadorSalvo estado={salvo} /></span>{/if}
				{#if c.passo < 12}
					<button type="button" class="btn-jogo btn-primario max-md:flex-[2]" onclick={() => ir(c.passo + 1)}>PRÓXIMO ▸</button>
				{:else if data.editavel}
					<button type="button" class="btn-jogo btn-contorno text-[13px] max-md:hidden" onclick={() => salvar()}>SALVAR RASCUNHO</button>
					<button
						type="button"
						class="btn-jogo {c.analise.bloqueios ? 'bg-b3 text-mut' : 'btn-primario'} max-md:flex-[2]"
						disabled={!!c.analise.bloqueios}
						title={c.analise.bloqueios ? 'Resolva os bloqueios para enviar' : undefined}
						onclick={() => (modal = 'confirmar')}>{aprovacao.fichas ? 'ENVIAR PARA REVISÃO' : 'CONCLUIR FICHA'}</button
					>
				{/if}
			</div>
		</div>

		<aside class="border-l-2 border-b3 bg-b2 p-4 max-xl:hidden" aria-label="Resumo da ficha">
			<div class="sticky top-4"><ResumoFicha {c} /></div>
		</aside>
	</div>
</div>

{#if modal === 'confirmar'}
	<Modal rotulo="Enviar para revisão" largura={520} topo={160} aoFechar={() => !enviando && (modal = null)}>
		<div class="bg-grena px-5 py-3.5"><h2 class="m-0 font-mincho text-[22px] leading-7 font-bold text-papel">{aprovacao.fichas ? 'Enviar para revisão?' : 'Concluir a ficha?'}</h2></div>
		<p class="m-0 px-5 py-4 text-[15px] leading-[23px]">
			{#if aprovacao.fichas}A ficha fica bloqueada para edição até {data.mestre} responder. Você pode retirá-la da revisão enquanto ele não decidir.{:else}Esta campanha não exige aprovação: a ficha entra direto na mesa e deixa de ser editável aqui.{/if}
		</p>
		{#if c.analise.verificacoes.some((v) => v.nivel === 'aviso')}
			<div class="px-5 pb-2"><Alerta tipo="aviso" titulo="Há avisos na revisão. Dá para enviar mesmo assim." /></div>
		{/if}
		<div class="flex justify-end gap-2 px-5 pb-5">
			<button type="button" class="btn-jogo btn-fantasma" disabled={enviando} onclick={() => (modal = null)}>CANCELAR</button>
			<button type="button" class="btn-jogo btn-primario" disabled={enviando} aria-busy={enviando} onclick={enviar}>
				{#if enviando}<Girando />{/if}{aprovacao.fichas ? 'ENVIAR PARA REVISÃO' : 'CONCLUIR'}
			</button>
		</div>
	</Modal>
{:else if modal === 'enviada'}
	<div class="fixed inset-0 z-50 flex items-center justify-center bg-b0 px-4" role="dialog" aria-modal="true" aria-label="Ficha enviada">
		<div class="camada flex w-full max-w-[560px] flex-col items-center gap-3 p-8 text-center">
			<div class="relative h-24 w-24">
				<img src="/illustrations/il-enviado-96.png" width="96" height="96" alt="" class="[image-rendering:pixelated]" />
				<img src="/illustrations/il-aprovado-96.png" width="96" height="96" alt="Selo" class="carimbo absolute -top-5 -right-14 [image-rendering:pixelated]" />
			</div>
			<h2 class="m-0 font-mincho text-[28px] leading-9 font-bold">{resultado === 'aprovada' ? 'Ficha pronta! Já está na mesa.' : 'Ficha enviada! O Mestre foi avisado.'}</h2>
			<p class="m-0 text-[15px] leading-[23px] text-mut">
				{resultado === 'aprovada' ? 'O grupo já vê o personagem no painel da campanha.' : `${data.mestre} recebe uma notificação. Você é avisado quando ele aprovar ou pedir ajustes.`}
			</p>
			<div class="mt-2 flex flex-wrap justify-center gap-2">
				<button type="button" class="btn-jogo btn-primario min-h-12" onclick={() => goto(hrefFicha(k.id, p0.id), { refreshAll: true })}>VER FICHA</button>
				<a href="/campanhas/{k.id}" class="btn-jogo btn-contorno min-h-12" data-sveltekit-reload>VOLTAR À CAMPANHA</a>
			</div>
		</div>
	</div>
{:else if modal === 'decidir'}
	<Modal rotulo="Decisão sobre a ficha" largura={520} topo={140} aoFechar={() => !decidindo && (modal = null)}>
		<form
			class="flex flex-col gap-4 p-6"
			onsubmit={(e) => {
				e.preventDefault();
				decidir();
			}}
		>
			<h2 class="t-h3 m-0">{decisao === 'aprovada' ? `Aprovar ${c.ficha.conceito.nome}?` : decisao === 'ajustes' ? 'Pedir ajustes' : 'Rejeitar a ficha'}</h2>
			<p class="m-0 text-[15px] leading-[23px] text-mut">
				{decisao === 'aprovada'
					? `A ficha entra na mesa e o grupo passa a ver ${c.ficha.conceito.nome}. PV ${c.recursos.pv} · PC ${c.recursos.pc} · PE ${c.recursos.pe} · Iniciativa 1d20 ${sinal(c.recursos.iniciativa)}.`
					: decisao === 'ajustes'
						? `${data.jogador} volta a editar e reenvia quando terminar.`
						: `${data.jogador} precisará começar uma ficha nova.`}
			</p>
			<Campo id="dec-comentario" rotulo={decisao === 'aprovada' ? 'Comentário (opcional)' : 'O que precisa mudar'} obrigatorio={decisao !== 'aprovada'} erro={erroDecisao}>
				<textarea id="dec-comentario" class="campo h-auto min-h-[96px] resize-y py-2.5 text-[15px] leading-[22px]" maxlength="2000" bind:value={comentario}></textarea>
			</Campo>
			<div class="flex justify-end gap-2.5">
				<button type="button" class="btn-jogo btn-fantasma" disabled={decidindo} onclick={() => (modal = null)}>CANCELAR</button>
				<button type="submit" class="btn-jogo {decisao === 'rejeitada' ? 'bg-err text-errfg' : 'btn-primario'}" disabled={decidindo} aria-busy={decidindo}>
					{#if decidindo}<Girando />{/if}{decisao === 'aprovada' ? 'APROVAR' : decisao === 'ajustes' ? 'PEDIR AJUSTES' : 'REJEITAR'}
				</button>
			</div>
		</form>
	</Modal>
{/if}

{#if excluindo}<ExcluirFicha ficha={{ id: data.personagem.id, nome: c.ficha.conceito.nome || data.personagem.nome, retrato: data.personagem.retrato, campanha_id: k.id }} deOutro={!data.dono} aoFechar={() => (excluindo = false)} />{/if}
