<script lang="ts">
	// K2 · Criador de clã em 11 passos (cap. 8.4). Também é o clã em leitura (enviado, aprovado) e a tela em que o
	// Mestre decide. Salva sozinho enquanto o autor edita; medidores de PB e PKG ficam fixos no topo.
	import { onDestroy } from 'svelte';
	import { goto } from '$app/navigation';
	import Brasao from '#lib/componentes/cla/Brasao.svelte';
	import PaginaCla from '#lib/componentes/cla/PaginaCla.svelte';
	import PassoAssinaturaCla from '#lib/componentes/cla/PassoAssinaturaCla.svelte';
	import PassoBonusCla from '#lib/componentes/cla/PassoBonusCla.svelte';
	import PassoCartasCla from '#lib/componentes/cla/PassoCartasCla.svelte';
	import PassoCompanheiroCla from '#lib/componentes/cla/PassoCompanheiroCla.svelte';
	import PassoConceitoCla from '#lib/componentes/cla/PassoConceitoCla.svelte';
	import PassoKkgCla from '#lib/componentes/cla/PassoKkgCla.svelte';
	import PassoMarcosCla from '#lib/componentes/cla/PassoMarcosCla.svelte';
	import PassoObrigacaoCla from '#lib/componentes/cla/PassoObrigacaoCla.svelte';
	import PassoPatrimonioCla from '#lib/componentes/cla/PassoPatrimonioCla.svelte';
	import PassoPoliticaCla from '#lib/componentes/cla/PassoPoliticaCla.svelte';
	import PassoRevisaoCla from '#lib/componentes/cla/PassoRevisaoCla.svelte';
	import Alerta from '#lib/componentes/ui/Alerta.svelte';
	import Campo from '#lib/componentes/ui/Campo.svelte';
	import Girando from '#lib/componentes/ui/Girando.svelte';
	import Icone from '#lib/componentes/ui/Icone.svelte';
	import IndicadorSalvo, { type EstadoSalvo } from '#lib/componentes/ui/IndicadorSalvo.svelte';
	import Modal from '#lib/componentes/ui/Modal.svelte';
	import { CriadorCla } from '#lib/clas/criador.svelte.ts';
	import { PASSOS_CLA, REGRA_PASSO_CLA } from '#lib/clas/dados.ts';
	import type { ClaDados } from '#lib/clas/regras.ts';
	import { hrefCla, hrefClas, STATUS_CLA } from '#lib/clas/status.ts';
	import { hrefEditar } from '#lib/personagem/status.ts';
	import { jutsuVazio, resumoJutsu } from '#lib/jutsus/regras.ts';
	import { hrefJutsu } from '#lib/jutsus/status.ts';
	import { toasts } from '#lib/estado/toasts.svelte.ts';
	import { dataCurta } from '#lib/formatar.ts';
	import { supabase } from '#lib/supabase/cliente.ts';
	import type { Json, StatusCla } from '#lib/supabase/banco.ts';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	// svelte-ignore state_referenced_locally
	const cla0 = data.cla;
	// svelte-ignore state_referenced_locally
	const k = data.campanha;
	// svelte-ignore state_referenced_locally
	const c = new CriadorCla(data.dados, data.jutsus, data.editavel, data.editavel ? 0 : 10);
	// svelte-ignore state_referenced_locally
	c.jutsusDasCartas = data.jutsusCartas;
	const status = $derived(data.cla.status as StatusCla);
	const revisando = $derived(data.papel === 'mestre' && !data.dono && status === 'em_revisao');
	const souMestre = $derived(data.papel === 'mestre');
	const voltarFicha = $derived(data.ficha ? `${hrefEditar(k.id, data.ficha.id)}?cla=${cla0.id}` : null);

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
		const dados = $state.snapshot(c.dados) as ClaDados;
		const { error } = await supabase()
			.from('clas')
			.update({ nome: dados.conceito.nome.trim(), dados: dados as unknown as Json, resumo: c.resumo as unknown as Json, mensagem: dados.mensagem.trim() || null })
			.eq('id', cla0.id);
		salvo = error ? { tipo: 'erro', texto: 'Não foi possível salvar. Tentando de novo…' } : { tipo: 'salvo', em: Date.now() };
		if (error) temporizador = setTimeout(salvar, 4000);
	}
	$effect(() => {
		JSON.stringify(c.dados);
		if (primeira) {
			primeira = false;
			return;
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
	async function sair(destino: string) {
		await garantirSalvo();
		await goto(destino, { refreshAll: true });
	}

	// cartas originais: abre o criador de jutsus (J2) ligado ao clã e à carta, e volta para cá
	// svelte-ignore state_referenced_locally
	if (data.dono && !k.arquivada_em)
		c.detalharCarta = async (cartaId: string) => {
			const ja = c.jutsusDasCartas[cartaId];
			const volta = hrefCla(k.id, cla0.id, data.ficha?.id);
			if (ja) return sair(hrefJutsu(k.id, ja.id, volta));
			await garantirSalvo();
			const carta = c.carta(cartaId);
			const d = jutsuVazio();
			d.nome = carta?.nome ?? '';
			d.descricao = carta?.descricao ?? '';
			const { data: novo, error } = await supabase()
				.from('jutsus_criados')
				.insert({ campanha_id: k.id, autor_id: cla0.autor_id, tipo: 'jutsu', cla_id: cla0.id, carta_id: cartaId, nome: d.nome, dados: d as unknown as Json, resumo: resumoJutsu(d) as unknown as Json })
				.select('id')
				.single();
			if (error || !novo) return toasts.mostrar('Não foi possível abrir o criador de jutsus.', 'erro');
			await goto(hrefJutsu(k.id, novo.id, volta));
		};

	// ---------------------------------------------------------------- envio, versões
	let modal = $state<'confirmar' | 'decidir' | 'excluir' | null>(null);
	let enviando = $state(false);

	async function enviar() {
		enviando = true;
		await garantirSalvo();
		const { data: novo, error } = await supabase().rpc('enviar_cla', { cla: cla0.id });
		enviando = false;
		modal = null;
		if (error) return toasts.mostrar(error.message.includes('não permite') ? error.message : 'Não foi possível enviar. O clã continua salvo como rascunho.', 'erro', 6000);
		toasts.mostrar(novo === 'aprovado' ? 'Clã aprovado e na biblioteca da campanha.' : `Clã enviado. ${data.mestre} foi avisado.`, 'sucesso', 5000);
		await goto(voltarFicha ?? hrefClas(k.id), { refreshAll: true });
	}

	async function retirar() {
		const { error } = await supabase().rpc('retirar_cla', { cla: cla0.id });
		if (error) return toasts.mostrar('Não foi possível retirar. O Mestre pode já ter decidido.', 'erro');
		toasts.mostrar('Clã de volta para rascunho.', 'info');
		location.reload();
	}

	async function novaVersao() {
		if (data.versaoNova) return goto(hrefCla(k.id, data.versaoNova));
		const { data: id, error } = await supabase().rpc('nova_versao_cla', { cla: cla0.id });
		if (error || !id) return toasts.mostrar('Não foi possível criar a nova versão.', 'erro');
		await goto(hrefCla(k.id, id), { refreshAll: true });
	}

	async function excluir() {
		const { error } = await supabase().from('clas').delete().eq('id', cla0.id);
		modal = null;
		if (error) return toasts.mostrar('Não foi possível excluir. Fichas que usam o clã impedem a exclusão.', 'erro');
		clearTimeout(temporizador);
		temporizador = undefined;
		toasts.mostrar('Rascunho excluído.', 'info');
		await goto(hrefClas(k.id), { refreshAll: true });
	}

	// ---------------------------------------------------------------- decisão do Mestre
	let decisao = $state<'aprovado' | 'ajustes' | 'rejeitado'>('aprovado');
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
		if (decisao !== 'aprovado' && !comentario.trim()) return (erroDecisao = 'Explique o que precisa mudar.');
		decidindo = true;
		const { error } = await supabase().rpc('decidir_cla', { cla: cla0.id, decisao, comentario: comentario.trim() || null });
		decidindo = false;
		if (error) return (erroDecisao = 'Não foi possível registrar a decisão. Tente de novo.');
		modal = null;
		toasts.mostrar(decisao === 'aprovado' ? 'Clã aprovado.' : decisao === 'ajustes' ? 'Ajustes pedidos ao autor.' : 'Clã rejeitado.', 'sucesso');
		await goto(hrefClas(k.id), { refreshAll: true });
	}

	// ---------------------------------------------------------------- navegação
	let menuPassos = $state(false);
	function ir(p: number) {
		c.irPara(p);
		menuPassos = false;
		window.scrollTo({ top: 0 });
	}
	const ESTADO = {
		feito: { classe: 'border-ink bg-ok text-okfg', marca: '✓' },
		erro: { classe: 'border-err text-err', marca: '!' },
		pendente: { classe: 'border-b3 text-mut', marca: '' }
	} as const;
	const nomeCla = $derived(c.dados.conceito.nome.trim() || 'sem nome');
	const pkgChip = $derived(
		c.pkg.saldo === 0
			? { texto: 'OK', classe: 'bg-ok text-okfg', icone: 'status/ic-status-aprovado' }
			: c.pkg.saldo > 0
				? { texto: `+${c.pkg.saldo}`, classe: 'bg-warn text-warnfg', icone: 'callout/ic-callout-atencao' }
				: { texto: String(c.pkg.saldo), classe: 'bg-err text-errfg', icone: 'status/ic-status-rejeitado' }
	);
	const rotuloEnviar = $derived(souMestre && data.dono ? 'CONCLUIR CLÃ' : 'ENVIAR PARA REVISÃO');
</script>

<svelte:window onbeforeunload={(e) => temporizador && e.preventDefault()} />

<div class="flex flex-1 flex-col">
	{#if data.ficha && voltarFicha}
		<div class="flex flex-wrap items-center gap-2.5 border-b-2 border-[#8B2E20] bg-grena px-4 py-1.5 text-[13px] leading-[18px] font-semibold text-papel md:px-6">
			◂ <button type="button" class="underline underline-offset-[3px] hover:no-underline" style:color="#F2C14E" onclick={() => sair(voltarFicha)}>Voltar à criação de personagem</button>
			<span class="text-[#E6D2BF]">· {data.ficha.nome || 'personagem sem nome'}, passo 4</span>
		</div>
	{/if}

	<!-- topo: nome e medidores -->
	<div class="flex min-h-14 flex-wrap items-center gap-x-5 gap-y-2 border-b-2 border-ink bg-b2 px-4 py-2.5 md:px-6">
		<span class="flex items-center gap-2.5">
			<Brasao kamon={c.dados.conceito.kamon} cor={c.dados.conceito.cor} />
			<h1 class="m-0 font-mincho text-xl leading-[26px] font-bold">Clã {nomeCla}</h1>
		</span>
		{#if status !== 'rascunho'}
			<span class="inline-flex h-9 items-center gap-0.5 border-2 border-ink pr-2 text-xs leading-none font-semibold {STATUS_CLA[status].classe}"><Icone id={STATUS_CLA[status].icone} />{STATUS_CLA[status].rotulo}{cla0.versao > 1 ? ` · v${cla0.versao}` : ''}</span>
		{/if}
		<span class="flex-1"></span>
		<div class="flex w-[220px] items-center gap-2 max-sm:w-full" title="Pontos de Bônus: {c.pb.usados} de {c.pb.limite}">
			<span class="font-pixel text-xs leading-none font-bold tracking-[0.08em] text-title">PB</span>
			<div class="flex h-4 flex-1 gap-0.5">
				{#each Array.from({ length: Math.max(c.pb.limite, c.pb.usados) }, (_, i) => i) as i (i)}
					<div class="flex-1 border-2 border-ink" style:background={i < c.pb.usados ? (i >= c.pb.limite ? 'var(--err)' : c.pb.restantes === 0 ? 'var(--ok)' : '#C44536') : 'var(--b3)'}></div>
				{/each}
			</div>
			<span class="t-num text-sm" aria-live="polite" style:color={c.pb.restantes === 0 ? 'var(--ok)' : c.pb.restantes < 0 ? 'var(--err)' : undefined}>{c.pb.restantes} / {c.pb.limite}</span>
		</div>
		{#if c.dados.kkg}
			<span class="flex items-center gap-2">
				<span class="font-pixel text-xs leading-none font-bold tracking-[0.08em] text-title">PKG</span>
				<span class="inline-flex h-8 items-center gap-1 border-2 border-ink pr-2 font-pixel text-xs font-bold {pkgChip.classe}" aria-live="polite"><Icone id={pkgChip.icone} class="h-7 w-7" />{pkgChip.texto}</span>
			</span>
		{/if}
		{#if data.editavel}
			<span class="max-md:hidden"><IndicadorSalvo estado={salvo} /></span>
			<button type="button" class="btn-jogo btn-fantasma text-[13px]" onclick={() => sair(voltarFicha ?? hrefClas(k.id))}>SALVAR E SAIR</button>
		{:else}
			<a href={voltarFicha ?? hrefClas(k.id)} class="btn-jogo btn-fantasma text-[13px]">VOLTAR</a>
		{/if}
	</div>

	<!-- mobile: passo atual e menu de passos -->
	<div class="relative flex min-h-[52px] items-center border-b-2 border-ink bg-b2 pr-2 pl-4 lg:hidden">
		<span class="flex-1 text-[15px] leading-5 font-semibold">Passo {c.passo + 1} de 11 · {PASSOS_CLA[c.passo]}</span>
		<button type="button" class="flex min-h-11 items-center border-2 border-b3 px-2.5 font-pixel text-xs font-bold" aria-expanded={menuPassos} onclick={() => (menuPassos = !menuPassos)}>PASSOS ▾</button>
		{#if menuPassos}
			<div class="camada absolute top-full right-2 z-30 mt-1 flex w-64 flex-col py-1.5">
				{#each PASSOS_CLA as nome, i (nome)}
					{@const e = ESTADO[c.analise.passos[i]]}
					<button type="button" class="flex min-h-11 items-center gap-2.5 px-3 text-left text-[15px] hover:bg-b3" aria-current={c.passo === i ? 'step' : undefined} onclick={() => ir(i)}>
						<span class="t-num flex h-6 w-6 items-center justify-center border-2 text-xs {e.classe}">{e.marca || i + 1}</span>{nome}
					</button>
				{/each}
			</div>
		{/if}
	</div>

	<div class="grid flex-1 lg:grid-cols-[230px_minmax(0,1fr)] xl:grid-cols-[230px_minmax(0,1fr)_380px]">
		<nav aria-label="Passos" class="border-r-2 border-b3 bg-b2 py-2 max-lg:hidden">
			<ol class="sticky top-0 m-0 flex list-none flex-col p-0">
				{#each PASSOS_CLA as nome, i (nome)}
					{@const atual = c.passo === i}
					{@const e = ESTADO[c.analise.passos[i]]}
					<li>
						<button
							type="button"
							aria-current={atual ? 'step' : undefined}
							class="flex min-h-11 w-full items-center gap-2.5 px-3 text-left {atual ? 'bg-grena text-papel shadow-[inset_4px_0_0_#C44536]' : 'text-fg hover:bg-b3'}"
							onclick={() => ir(i)}
						>
							<span class="t-num flex h-7 w-7 flex-none items-center justify-center border-2 text-[13px] {atual ? 'border-ink bg-vermelhao text-white' : e.classe}">{atual ? i + 1 : e.marca || i + 1}</span>
							<span class="flex-1 text-sm leading-[18px] {atual ? 'font-semibold' : 'font-medium'}">{nome}</span>
						</button>
					</li>
				{/each}
			</ol>
		</nav>

		<div class="flex min-w-0 flex-col">
			<main class="flex flex-1 flex-col gap-4 px-4 py-5 md:px-7 md:py-6">
				<div class="flex flex-wrap items-end gap-3">
					<div class="flex flex-1 flex-col gap-1">
						<span class="t-rotulo text-mut max-lg:hidden">Passo {c.passo + 1} de 11</span>
						<h2 class="m-0 font-mincho text-[28px] leading-9 font-bold max-md:text-2xl">{PASSOS_CLA[c.passo]}</h2>
					</div>
					<a href="/regras/clas-e-kekkei-genkai#{REGRA_PASSO_CLA[c.passo]}" target="_blank" rel="noopener" class="link text-[13px] font-semibold">Regra: cap. 8.4</a>
				</div>

				{#if status === 'ajustes' && cla0.comentario_mestre}
					<Alerta tipo="info" titulo="{data.mestre} pediu ajustes"><span>“{cla0.comentario_mestre}”</span></Alerta>
				{:else if status === 'em_revisao' && data.dono}
					<Alerta tipo="aviso" titulo="Em revisão pelo Mestre desde {dataCurta(cla0.enviado_em ?? cla0.atualizado_em)}">
						<span>O clã fica bloqueado até {data.mestre} responder.</span>
						{#snippet acao()}<button type="button" class="btn-jogo btn-contorno min-h-10 text-xs" onclick={retirar}>RETIRAR DA REVISÃO</button>{/snippet}
					</Alerta>
				{:else if status === 'aprovado'}
					<Alerta tipo="sucesso" titulo="Clã aprovado · somente leitura">
						<span>{data.dono ? 'Editar cria uma nova versão; as fichas seguem na versão que já usam.' : `Criado por ${data.autor}.`}</span>
						{#snippet acao()}{#if data.dono && !k.arquivada_em}<button type="button" class="btn-jogo btn-contorno min-h-10 text-xs" onclick={novaVersao}>{data.versaoNova ? 'ABRIR NOVA VERSÃO' : 'EDITAR CRIA NOVA VERSÃO'}</button>{/if}{/snippet}
					</Alerta>
				{:else if status === 'rejeitado'}
					<Alerta tipo="erro" titulo="Clã rejeitado">{#if cla0.comentario_mestre}<span>“{cla0.comentario_mestre}”</span>{/if}</Alerta>
				{:else if revisando}
					<Alerta tipo="info" titulo="Clã de {data.autor} aguardando sua revisão">
						<span>Navegue pelos passos; na Revisão estão as verificações automáticas. Decida no fim da página.</span>
					</Alerta>
				{/if}

				{#if c.passo === 0}<PassoConceitoCla {c} />
				{:else if c.passo === 1}<PassoBonusCla {c} />
				{:else if c.passo === 2}<PassoKkgCla {c} />
				{:else if c.passo === 3}<PassoAssinaturaCla {c} />
				{:else if c.passo === 4}<PassoMarcosCla {c} irPara={ir} />
				{:else if c.passo === 5}<PassoCompanheiroCla {c} />
				{:else if c.passo === 6}<PassoCartasCla {c} />
				{:else if c.passo === 7}<PassoPatrimonioCla {c} />
				{:else if c.passo === 8}<PassoPoliticaCla {c} outrosClas={data.outrosClas} />
				{:else if c.passo === 9}<PassoObrigacaoCla {c} />
				{:else}<PassoRevisaoCla {c} irPara={ir} leitura={!data.editavel} />{/if}

				{#if revisando}
					<section class="mt-2 flex flex-wrap items-center gap-2 border-2 border-[#8B2E20] bg-b2 p-3.5 sombra-painel" aria-label="Decisão do Mestre">
						<span class="t-rotulo flex-1">Sua decisão · {c.analise.bloqueios ? `${c.analise.bloqueios} bloqueio${c.analise.bloqueios > 1 ? 's' : ''} nas verificações` : 'sem bloqueios'}</span>
						<button type="button" class="btn-jogo btn-erro min-h-11" onclick={() => abrirDecisao('rejeitado')}>REJEITAR</button>
						<button type="button" class="btn-jogo btn-secundario" onclick={() => abrirDecisao('ajustes')}>PEDIR AJUSTES</button>
						<button type="button" class="btn-jogo btn-primario" onclick={() => abrirDecisao('aprovado')}>APROVAR</button>
					</section>
				{/if}
				{#if data.editavel && status === 'rascunho' && c.passo === 10}
					<button type="button" class="link self-start text-[13px] font-semibold text-err" onclick={() => (modal = 'excluir')}>Excluir este rascunho</button>
				{/if}
			</main>

			<div class="sticky bottom-16 z-10 flex items-center gap-3 border-t-2 border-ink bg-b2 px-4 py-2.5 md:bottom-0 md:px-5">
				<button type="button" class="btn-jogo btn-fantasma max-md:flex-1 max-md:border-2 max-md:border-mut" disabled={c.passo === 0} onclick={() => ir(c.passo - 1)}>◂ VOLTAR</button>
				<span class="flex-1 max-md:hidden"></span>
				{#if data.editavel}<span class="md:hidden max-sm:hidden"><IndicadorSalvo estado={salvo} /></span>{/if}
				{#if c.passo < 10}
					<button type="button" class="btn-jogo btn-primario max-md:flex-[2]" onclick={() => ir(c.passo + 1)}>PRÓXIMO ▸</button>
				{:else if data.editavel}
					<button
						type="button"
						class="btn-jogo {c.analise.bloqueios ? 'bg-b3 text-mut' : 'btn-primario'} max-md:flex-[2]"
						disabled={!!c.analise.bloqueios}
						title={c.analise.bloqueios ? 'Resolva os bloqueios' : undefined}
						onclick={() => (modal = 'confirmar')}>{rotuloEnviar}</button
					>
				{/if}
			</div>
		</div>

		<aside class="border-l-2 border-b3 bg-b2 max-xl:hidden" aria-label="Prévia do clã">
			<div class="sticky top-0"><PaginaCla {c} /></div>
		</aside>
	</div>
</div>

{#if modal === 'confirmar'}
	<Modal rotulo="Enviar o clã" largura={520} topo={160} aoFechar={() => !enviando && (modal = null)}>
		<div class="bg-grena px-5 py-3.5"><h2 class="m-0 font-mincho text-[22px] leading-7 font-bold text-papel">{souMestre && data.dono ? 'Concluir o clã?' : 'Enviar para revisão?'}</h2></div>
		<p class="m-0 px-5 py-4 text-[15px] leading-[23px]">
			{#if souMestre && data.dono}O clã entra aprovado na biblioteca da campanha e deixa de ser editável aqui (editar cria uma nova versão).{:else}O clã fica bloqueado até {data.mestre} responder. Você pode retirá-lo da revisão enquanto ele não decidir. Fichas com este clã só são aprovadas depois dele.{/if}
		</p>
		{#if c.analise.verificacoes.some((v) => v.nivel === 'aviso')}
			<div class="px-5 pb-2"><Alerta tipo="aviso" titulo="Há avisos na revisão. Dá para enviar mesmo assim." /></div>
		{/if}
		<div class="flex justify-end gap-2 px-5 pb-5">
			<button type="button" class="btn-jogo btn-fantasma" disabled={enviando} onclick={() => (modal = null)}>CANCELAR</button>
			<button type="button" class="btn-jogo btn-primario" disabled={enviando} aria-busy={enviando} onclick={enviar}>{#if enviando}<Girando />{/if}{rotuloEnviar}</button>
		</div>
	</Modal>
{:else if modal === 'excluir'}
	<Modal rotulo="Excluir rascunho" largura={480} topo={160} aoFechar={() => (modal = null)}>
		<div class="flex flex-col gap-4 p-6">
			<h2 class="t-h3 m-0">Excluir o rascunho do clã {nomeCla}?</h2>
			<p class="m-0 text-[15px] leading-[23px] text-mut">Não dá para desfazer.</p>
			<div class="flex justify-end gap-2.5">
				<button type="button" class="btn-jogo btn-fantasma" onclick={() => (modal = null)}>CANCELAR</button>
				<button type="button" class="btn-jogo bg-err text-errfg" onclick={excluir}>EXCLUIR</button>
			</div>
		</div>
	</Modal>
{:else if modal === 'decidir'}
	<Modal rotulo="Decisão sobre o clã" largura={520} topo={140} aoFechar={() => !decidindo && (modal = null)}>
		<form
			class="flex flex-col gap-4 p-6"
			onsubmit={(e) => {
				e.preventDefault();
				decidir();
			}}
		>
			<h2 class="t-h3 m-0">{decisao === 'aprovado' ? `Aprovar o clã ${nomeCla}?` : decisao === 'ajustes' ? 'Pedir ajustes' : 'Rejeitar o clã'}</h2>
			<p class="m-0 text-[15px] leading-[23px] text-mut">
				{decisao === 'aprovado'
					? `O clã entra na biblioteca da campanha e fichas com ele podem ser aprovadas.${c.dados.kkg ? ` KKG: ${c.pkg.beneficios} PKG de benefícios para ${c.pkg.disponiveis} disponíveis.` : ''}`
					: decisao === 'ajustes'
						? `${data.autor} volta a editar e reenvia quando terminar.`
						: `${data.autor} precisará criar outro clã ou escolher um do catálogo.`}
			</p>
			<Campo id="dec-comentario" rotulo={decisao === 'aprovado' ? 'Comentário (opcional)' : 'O que precisa mudar'} obrigatorio={decisao !== 'aprovado'} erro={erroDecisao}>
				<textarea id="dec-comentario" class="campo h-auto min-h-[96px] resize-y py-2.5 text-[15px] leading-[22px]" maxlength="2000" bind:value={comentario}></textarea>
			</Campo>
			<div class="flex justify-end gap-2.5">
				<button type="button" class="btn-jogo btn-fantasma" disabled={decidindo} onclick={() => (modal = null)}>CANCELAR</button>
				<button type="submit" class="btn-jogo {decisao === 'rejeitado' ? 'bg-err text-errfg' : 'btn-primario'}" disabled={decidindo} aria-busy={decidindo}>
					{#if decidindo}<Girando />{/if}{decisao === 'aprovado' ? 'APROVAR' : decisao === 'ajustes' ? 'PEDIR AJUSTES' : 'REJEITAR'}
				</button>
			</div>
		</form>
	</Modal>
{/if}
