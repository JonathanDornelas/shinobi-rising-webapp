<script lang="ts">
	// E3 · Forja de armas (cap. 21), E4 · Oficina de marionetes (cap. 13) e o item utilitário (E2): construtor à esquerda,
	// prévia, custo e verificações à direita. Também é a leitura e a tela em que o Mestre decide. Salva sozinho.
	import { onDestroy } from 'svelte';
	import { goto } from '$app/navigation';
	import FormArma from '#lib/componentes/equipamento/FormArma.svelte';
	import FormItem from '#lib/componentes/equipamento/FormItem.svelte';
	import FormMarionete from '#lib/componentes/equipamento/FormMarionete.svelte';
	import Alerta from '#lib/componentes/ui/Alerta.svelte';
	import Campo from '#lib/componentes/ui/Campo.svelte';
	import Girando from '#lib/componentes/ui/Girando.svelte';
	import Icone from '#lib/componentes/ui/Icone.svelte';
	import IndicadorSalvo, { type EstadoSalvo } from '#lib/componentes/ui/IndicadorSalvo.svelte';
	import Modal from '#lib/componentes/ui/Modal.svelte';
	import { APROVACAO_PADRAO } from '#lib/campanhas/dominio.ts';
	import { APROVACAO_DO_TIPO, PASSOS_FORJA } from '#lib/equipamentos/dados.ts';
	import {
		analisarArma,
		analisarItem,
		armaVazia,
		itemVazio,
		marioneteVazia,
		analisarMarionete,
		cargaDoItem,
		resumoEquipamento,
		type ArmaDados,
		type ContextoEquip,
		type DadosEquipamento,
		type ItemDados,
		type MarioneteDados,
		type TipoEquipamento
	} from '#lib/equipamentos/regras.ts';
	import { STATUS_CRIACAO } from '#lib/jutsus/status.ts';
	import { especializacoes, linhasPericia, normalizarFicha, sinal, type FichaDados } from '#lib/personagem/regras.ts';
	import { toasts } from '#lib/estado/toasts.svelte.ts';
	import { dataCurta } from '#lib/formatar.ts';
	import { supabase } from '#lib/supabase/cliente.ts';
	import type { Json, StatusCriacao } from '#lib/supabase/banco.ts';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
	// svelte-ignore state_referenced_locally
	const e0 = data.equipamento;
	// svelte-ignore state_referenced_locally
	const k = data.campanha;
	const tipo = e0.tipo as TipoEquipamento;
	const status = $derived(data.equipamento.status as StatusCriacao);
	const revisando = $derived(data.papel === 'mestre' && !data.dono && status === 'em_revisao');
	const souMestre = $derived(data.papel === 'mestre');
	const direto = $derived(souMestre && data.dono ? true : !{ ...APROVACAO_PADRAO, ...k.aprovacao }[APROVACAO_DO_TIPO[tipo]]);
	const ro = $derived(!data.editavel);
	const voltar = `/campanhas/${k.id}/equipamentos`;

	// um estado por tipo, para passar com bind: aos formulários
	// svelte-ignore state_referenced_locally
	let arma = $state((tipo === 'arma' ? data.dados : armaVazia()) as ArmaDados);
	// svelte-ignore state_referenced_locally
	let marionete = $state((tipo === 'marionete' ? data.dados : marioneteVazia()) as MarioneteDados);
	// svelte-ignore state_referenced_locally
	let item = $state((tipo === 'item' ? data.dados : itemVazio()) as ItemDados);
	const d = $derived<DadosEquipamento>(tipo === 'arma' ? arma : tipo === 'marionete' ? marionete : item);

	// contexto: ficha da encomenda (ryo, especialização Marionete, Kugutsu para o ataque)
	// svelte-ignore state_referenced_locally
	const fichaCalc = data.ficha ? normalizarFicha(data.ficha.dados as Partial<FichaDados>) : null;
	// svelte-ignore state_referenced_locally
	const ctx: ContextoEquip = data.ficha
		? { nome: data.ficha.nome, ryo: data.ficha.status === 'aprovada' ? data.ficha.ryo : null, especializacaoMarionete: tipo === 'marionete' ? (especializacoes(fichaCalc!).find((x) => x.id === 'marionete')?.nivel ?? 0) : null }
		: {};
	const kugutsu = fichaCalc ? linhasPericia(fichaCalc).find((p) => p.id === 'kugutsu')!.total : null;
	// svelte-ignore state_referenced_locally
	const base = $derived(tipo === 'arma' ? (data.armas.find((a) => a.slug === arma.base) ?? null) : null);
	const analise = $derived(tipo === 'arma' ? analisarArma(arma, base, ctx) : tipo === 'marionete' ? analisarMarionete(marionete, ctx) : analisarItem(item));
	const ca = $derived(tipo === 'arma' ? analisarArma(arma, base, ctx).calculo : null);
	const cm = $derived(tipo === 'marionete' ? analisarMarionete(marionete, ctx).calculo : null);
	const resumo = $derived(resumoEquipamento(tipo, d, base));
	const naoAprovada = $derived(!!data.ficha && data.ficha.status !== 'aprovada' && tipo !== 'item');
	const bloqueios = $derived(analise.bloqueios + (naoAprovada ? 1 : 0));

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
		const dados = $state.snapshot(d) as DadosEquipamento;
		const { error } = await supabase()
			.from('equipamentos_criados')
			.update({ nome: dados.nome.trim(), custo: resumo.custo, dados: dados as unknown as Json, resumo: resumo as unknown as Json, mensagem: dados.mensagem.trim() || null })
			.eq('id', e0.id);
		salvo = error ? { tipo: 'erro', texto: 'Não foi possível salvar. Tentando de novo…' } : { tipo: 'salvo', em: Date.now() };
		if (error) temporizador = setTimeout(salvar, 4000);
	}
	$effect(() => {
		JSON.stringify(d);
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
	async function trocarFicha(id: string) {
		await garantirSalvo();
		const { error } = await supabase().from('equipamentos_criados').update({ personagem_id: id || null }).eq('id', e0.id);
		if (error) return toasts.mostrar('Não foi possível trocar a ficha.', 'erro');
		location.reload();
	}

	// ---------------------------------------------------------------- envio, versão, decisão
	let modal = $state<'confirmar' | 'decidir' | 'excluir' | null>(null);
	let enviando = $state(false);
	async function enviar() {
		enviando = true;
		await garantirSalvo();
		const { data: novo, error } = await supabase().rpc('enviar_equipamento', { equipamento: e0.id });
		enviando = false;
		modal = null;
		if (error) return toasts.mostrar(error.message.includes('ryo') || error.message.includes('ficha') ? error.message : 'Não foi possível enviar. Continua salvo como rascunho.', 'erro', 7000);
		toasts.mostrar(novo === 'aprovado' ? (data.ficha && tipo !== 'item' ? `Pronto: o ryo saiu da ficha de ${data.ficha.nome} e o objeto vai para o inventário.` : 'Aprovado e na biblioteca da campanha.') : `Enviado. ${data.mestre} foi avisado.`, 'sucesso', 6000);
		await goto(voltar, { refreshAll: true });
	}
	async function retirar() {
		const { error } = await supabase().rpc('retirar_equipamento', { equipamento: e0.id });
		if (error) return toasts.mostrar('Não foi possível retirar. O Mestre pode já ter decidido.', 'erro');
		location.reload();
	}
	async function novaVersao() {
		if (data.versaoNova) return goto(`${voltar}/${data.versaoNova}`);
		const { data: id, error } = await supabase().rpc('nova_versao_equipamento', { equipamento: e0.id });
		if (error || !id) return toasts.mostrar('Não foi possível criar a nova versão.', 'erro');
		await goto(`${voltar}/${id}`, { refreshAll: true });
	}
	async function excluir() {
		clearTimeout(temporizador);
		temporizador = undefined;
		const { error } = await supabase().from('equipamentos_criados').delete().eq('id', e0.id);
		modal = null;
		if (error) return toasts.mostrar('Não foi possível excluir.', 'erro');
		toasts.mostrar('Rascunho excluído.', 'info');
		await goto(voltar, { refreshAll: true });
	}
	let decisao = $state<'aprovado' | 'ajustes' | 'rejeitado'>('aprovado');
	let comentario = $state('');
	let decidindo = $state(false);
	let erroDecisao = $state('');
	function abrirDecisao(x: typeof decisao) {
		decisao = x;
		comentario = '';
		erroDecisao = '';
		modal = 'decidir';
	}
	async function decidir() {
		if (decisao !== 'aprovado' && !comentario.trim()) return (erroDecisao = 'Explique o que precisa mudar.');
		decidindo = true;
		const { error } = await supabase().rpc('decidir_equipamento', { equipamento: e0.id, decisao, comentario: comentario.trim() || null });
		decidindo = false;
		if (error) return (erroDecisao = error.message.includes('ryo') || error.message.includes('ficha') ? error.message : 'Não foi possível registrar a decisão.');
		modal = null;
		toasts.mostrar(decisao === 'aprovado' ? 'Aprovado.' : decisao === 'ajustes' ? 'Ajustes pedidos.' : 'Rejeitado.', 'sucesso');
		await goto(voltar, { refreshAll: true });
	}

	// ---------------------------------------------------------------- apresentação
	const ryo = (n: number) => `${n.toLocaleString('pt-BR')} ryo`;
	const TITULO = { arma: 'Forjar arma', marionete: 'Construir marionete', item: 'Item' } as const;
	const ICONE = { arma: 'acao/ic-acao-forjar', marionete: 'acao/ic-acao-construir-marionete', item: 'equip/ic-equip-ferramenta' } as const;
	const medidor = $derived(ca ? { rotulo: 'PFO', usados: ca.pfo, limite: ca.limite, max: 10 } : cm ? { rotulo: 'SLOTS', usados: cm.slots, limite: cm.limite, max: Math.max(cm.limite, cm.slots) } : null);
	const NIVEL = {
		ok: { rotulo: 'Ok', cor: 'var(--ok)', icone: 'status/ic-status-aprovado' },
		aviso: { rotulo: 'Aviso', cor: 'var(--warn)', icone: 'callout/ic-callout-atencao' },
		bloqueio: { rotulo: 'Bloqueio', cor: 'var(--err)', icone: 'status/ic-status-rejeitado' }
	} as const;
	const passoForja = (i: number) => {
		if (!ca) return 'pendente';
		const feito = [!!arma.nome.trim(), !!arma.base, true, true, ca.pfo <= ca.limite, !!arma.historico.trim() || (arma.qualidade !== 'mestre' && arma.qualidade !== 'lendaria')][i];
		if (i === 4 && ca.pfo > ca.limite) return 'erro';
		return feito ? 'feito' : 'pendente';
	};
</script>

<svelte:window onbeforeunload={(e) => temporizador && e.preventDefault()} />

<div class="flex flex-1 flex-col">
	<div class="flex min-h-14 flex-wrap items-center gap-x-4 gap-y-2 border-b-2 border-ink bg-b2 px-4 py-2.5 md:px-6">
		<Icone id={ICONE[tipo]} />
		<h1 class="m-0 font-mincho text-xl leading-[26px] font-bold">{data.editavel ? TITULO[tipo] : d.nome || TITULO[tipo]}</h1>
		{#if data.ficha && tipo !== 'item'}<span class="border-2 border-b3 px-[7px] py-[5px] font-pixel text-xs leading-none font-semibold tracking-[0.06em] text-mut uppercase max-sm:hidden">PARA {data.ficha.nome}</span>{/if}
		{#if status !== 'rascunho'}
			<span class="inline-flex h-9 items-center gap-0.5 border-2 border-ink pr-2 text-xs leading-none font-semibold {STATUS_CRIACAO[status].classe}"><Icone id={STATUS_CRIACAO[status].icone} />{STATUS_CRIACAO[status].rotulo}</span>
		{/if}
		<span class="flex-1"></span>
		{#if medidor}
			<div class="flex items-center gap-2 max-sm:w-full" title="{medidor.usados} de {medidor.limite}">
				<span class="font-pixel text-xs leading-none font-bold tracking-[0.08em] text-title">{medidor.rotulo}</span>
				<div class="flex h-[18px] w-[220px] gap-0.5 max-sm:flex-1">
					{#each Array.from({ length: medidor.max }, (_, i) => i) as i (i)}
						<div class="flex-1 border-2 border-ink {i < medidor.limite ? '' : 'border-dashed'}" style:background={i < medidor.usados ? (i >= medidor.limite ? 'var(--err)' : medidor.usados === medidor.limite ? 'var(--ok)' : '#C44536') : i < medidor.limite ? 'var(--b3)' : 'transparent'}></div>
					{/each}
				</div>
				<span class="t-num text-[15px]" aria-live="polite" style:color={medidor.usados > medidor.limite ? 'var(--err)' : medidor.usados === medidor.limite ? 'var(--ok)' : undefined}>{medidor.usados} / {medidor.limite}</span>
			</div>
		{/if}
		{#if data.editavel}
			<span class="max-md:hidden"><IndicadorSalvo estado={salvo} /></span>
			<button type="button" class="btn-jogo btn-fantasma text-[13px]" onclick={() => sair(voltar)}>SALVAR E SAIR</button>
		{:else}
			<a href={voltar} class="btn-jogo btn-fantasma text-[13px]">VOLTAR</a>
		{/if}
	</div>

	<div class="grid flex-1 {tipo === 'arma' ? 'xl:grid-cols-[220px_minmax(0,1fr)_380px]' : ''} lg:grid-cols-[minmax(0,1fr)_380px]">
		{#if tipo === 'arma'}
			<nav aria-label="Passos da forja" class="border-r-2 border-b3 bg-b2 py-2.5 max-xl:hidden">
				<ol class="sticky top-0 m-0 flex list-none flex-col p-0">
					{#each PASSOS_FORJA as nome, i (nome)}
						{@const st = passoForja(i)}
						<li>
							<a href="#forja-{i + 1}" class="flex min-h-11 items-center gap-2.5 px-3 text-fg no-underline hover:bg-b3">
								<span class="t-num flex h-7 w-7 items-center justify-center border-2 text-[13px] {st === 'feito' ? 'border-ink bg-ok text-okfg' : st === 'erro' ? 'border-err text-err' : 'border-b3 text-mut'}">{st === 'feito' ? '✓' : st === 'erro' ? '!' : i + 1}</span>
								<span class="text-sm font-semibold">{nome}</span>
							</a>
						</li>
					{/each}
				</ol>
			</nav>
		{/if}

		<main class="flex min-w-0 flex-col gap-[18px] px-4 py-5 md:px-7">
			{#if status === 'ajustes' && e0.comentario_mestre}
				<Alerta tipo="info" titulo="{data.mestre} pediu ajustes"><span>“{e0.comentario_mestre}”</span></Alerta>
			{:else if status === 'em_revisao' && data.dono}
				<Alerta tipo="aviso" titulo="Em revisão pelo Mestre desde {dataCurta(e0.enviado_em ?? e0.atualizado_em)}">
					<span>Fica bloqueado até {data.mestre} responder.</span>
					{#snippet acao()}<button type="button" class="btn-jogo btn-contorno min-h-10 text-xs" onclick={retirar}>RETIRAR DA REVISÃO</button>{/snippet}
				</Alerta>
			{:else if status === 'aprovado'}
				<Alerta tipo="sucesso" titulo="Aprovado · somente leitura">
					<span>{tipo === 'item' ? 'Está na loja da campanha.' : data.ficha ? `Entregue a ${data.ficha.nome}: aparece no inventário da ficha.` : 'Está na biblioteca da campanha.'}</span>
					{#snippet acao()}{#if data.dono && tipo === 'item' && !k.arquivada_em}<button type="button" class="btn-jogo btn-contorno min-h-10 text-xs" onclick={novaVersao}>{data.versaoNova ? 'ABRIR NOVA VERSÃO' : 'EDITAR CRIA NOVA VERSÃO'}</button>{/if}{/snippet}
				</Alerta>
			{:else if status === 'rejeitado'}
				<Alerta tipo="erro" titulo="Rejeitado">{#if e0.comentario_mestre}<span>“{e0.comentario_mestre}”</span>{/if}</Alerta>
			{:else if revisando}
				<Alerta tipo="info" titulo="Pedido de {data.autor} aguardando sua revisão"><span>As verificações estão ao lado. Decida no fim da página.</span></Alerta>
			{/if}
			{#if naoAprovada && data.editavel}
				<Alerta tipo="aviso" titulo="A ficha de {data.ficha?.nome} ainda não foi aprovada"><span>Dá para montar o rascunho; o envio espera a ficha entrar na mesa (o ryo sai dela na aprovação).</span></Alerta>
			{/if}

			{#if tipo !== 'item' && data.dono && data.editavel}
				<label class="flex max-w-md flex-col gap-1.5 text-sm font-semibold">
					Para qual personagem? <span class="font-normal text-mut">Paga com o ryo dela e recebe no inventário.</span>
					<select class="campo pr-8 font-normal" value={e0.personagem_id ?? ''} onchange={(ev) => trocarFicha(ev.currentTarget.value)}>
						{#if souMestre}<option value="">Nenhum (biblioteca ou NPC)</option>{/if}
						{#each data.fichas as f (f.id)}<option value={f.id}>{f.nome || 'sem nome'}</option>{/each}
					</select>
				</label>
			{/if}

			{#if tipo === 'arma' && ca}
				<FormArma bind:d={arma} armas={data.armas} {ro} pfo={{ usados: ca.pfo, limite: ca.limite }} />
			{:else if tipo === 'marionete' && cm}
				<FormMarionete bind:d={marionete} {ro} slots={{ usados: cm.slots, limite: cm.limite }} />
			{:else}
				<FormItem bind:d={item} {ro} />
			{/if}

			{#if data.editavel}
				<Campo id="eq-msg" rotulo="Mensagem para o Mestre"><textarea id="eq-msg" class="campo h-auto min-h-[56px] resize-y py-2.5 text-[15px] leading-[22px]" maxlength="2000" bind:value={d.mensagem}></textarea></Campo>
			{:else if d.mensagem.trim()}
				<div class="painel flex flex-col gap-1 p-3.5 text-[15px]"><span class="t-rotulo text-xs">Mensagem para o Mestre</span><span>“{d.mensagem.trim()}”</span></div>
			{/if}

			{#if revisando}
				<section class="flex flex-wrap items-center gap-2 border-2 border-[#8B2E20] bg-b2 p-3.5 sombra-painel" aria-label="Decisão do Mestre">
					<span class="t-rotulo flex-1">Sua decisão · {bloqueios ? `${bloqueios} bloqueio${bloqueios > 1 ? 's' : ''}` : 'sem bloqueios'}</span>
					<button type="button" class="btn-jogo btn-erro min-h-11" onclick={() => abrirDecisao('rejeitado')}>REJEITAR</button>
					<button type="button" class="btn-jogo btn-secundario" onclick={() => abrirDecisao('ajustes')}>PEDIR AJUSTES</button>
					<button type="button" class="btn-jogo btn-primario" onclick={() => abrirDecisao('aprovado')}>APROVAR</button>
				</section>
			{/if}
			{#if data.editavel && status === 'rascunho'}<button type="button" class="link self-start text-[13px] font-semibold text-err" onclick={() => (modal = 'excluir')}>Excluir este rascunho</button>{/if}
		</main>

		<aside class="flex flex-col gap-3 border-l-2 border-b3 bg-b2 p-4 max-lg:border-t-2 max-lg:border-l-0" aria-label="Prévia">
			<span class="font-pixel text-[13px] leading-none font-bold tracking-[0.1em] text-title">PRÉVIA</span>
			<article class="border-2 bg-b1 shadow-[4px_4px_0_var(--ink)]" style:border-color={tipo === 'arma' && arma.qualidade === 'lendaria' ? '#BF9000' : 'var(--frame)'}>
				<div class="flex items-center gap-3 border-b-2 border-b3 p-3">
					<span class="flex h-[72px] w-[72px] flex-none items-center justify-center border-2 border-b3 bg-b2"><Icone id={resumo.icone} tamanho={64} /></span>
					<span class="flex min-w-0 flex-col gap-[3px]">
						<span class="font-pixel text-xs leading-none font-bold tracking-[0.1em] text-mut">{tipo === 'arma' ? `ARMA · ${(base?.nome ?? 'sem base').toUpperCase()}` : tipo === 'marionete' ? `MARIONETE · ${cm?.tamanho.nome.toUpperCase()}` : `ITEM · ${item.categoria.toUpperCase()}`}</span>
						<span class="font-mincho text-xl leading-[26px] font-bold">{d.nome.trim() || 'Sem nome'}</span>
						{#if ca}<span class="font-pixel text-xs leading-none font-bold text-title">QUALIDADE {ca.qualidade.nome.toUpperCase()}</span>{/if}
					</span>
				</div>
				<div class="flex flex-col gap-2 p-3">
					{#if ca}
						<span class="t-num text-2xl leading-none" aria-live="polite">{ca.dano}{ca.acerto ? ` · ${sinal(ca.acerto)} acerto` : ''}</span>
						{#if ca.chips.length}<div class="flex flex-wrap gap-1.5">{#each ca.chips as c (c)}<span class="border-2 border-b3 px-[7px] py-[5px] text-xs leading-none font-semibold">{c}</span>{/each}</div>{/if}
					{:else if cm}
						<div class="grid grid-cols-3 gap-2 font-pixel text-xs font-bold text-mut">
							<span class="flex flex-col gap-1">PV<span class="text-[22px] text-fg" aria-live="polite">{cm.pv}</span></span>
							<span class="flex flex-col gap-1">DEFESA<span class="text-[22px] text-fg">{cm.defesa}</span></span>
							<span class="flex flex-col gap-1">ATAQUE<span class="text-[22px] text-fg">{kugutsu != null ? sinal(kugutsu) : '—'}</span></span>
						</div>
						<span class="text-[13px] leading-[19px]">Dano {cm.ataque}{kugutsu != null ? ` · ataque 1d20 ${sinal(kugutsu)} (Kugutsu de ${data.ficha?.nome})` : ' · ataque 1d20 + Kugutsu'}</span>
						<span class="text-[13px] leading-[19px] text-mut">{cm.mecanismos.map((m) => m.nome).join(' · ') || 'Sem mecanismos'}</span>
					{:else}
						<span class="t-num text-lg">{ryo(Math.max(0, item.preco || 0)).toUpperCase()} · {cargaDoItem(item).toLocaleString('pt-BR')} de carga{item.consumivel ? ' (5 = 0,5)' : ''}</span>
						<p class="m-0 text-sm leading-[21px]"><b>Efeito.</b> {item.efeito.trim() || '…'}</p>
					{/if}
				</div>
			</article>
			{#if tipo !== 'item'}
				<div class="border-2 border-b3 bg-b1">
					<div class="border-b-2 border-b3 px-3 py-2 font-pixel text-xs leading-none font-bold tracking-[0.1em] text-title">CUSTO ESTIMADO</div>
					{#each (ca ?? cm)!.linhas as l (l.rotulo)}<div class="flex px-3 py-1 text-sm leading-5"><span class="flex-1">{l.rotulo}</span><b class="t-num">{l.valor}</b></div>{/each}
					<div class="flex border-t-2 border-b3 px-3 py-2 text-[15px] font-bold"><span class="flex-1">Total · {(ca ?? cm)!.tempo}</span><span class="t-num">{ryo(resumo.custo).toUpperCase()}</span></div>
				</div>
			{/if}
			<div class="flex flex-col gap-1.5">
				{#if naoAprovada}<div class="flex items-center gap-2 border-2 py-1 pr-2.5 pl-1 text-[13px] font-semibold" style:border-color="var(--err)"><Icone id="status/ic-status-rejeitado" />Bloqueio · a ficha da encomenda ainda não foi aprovada</div>{/if}
				{#each analise.verificacoes as v, i (i)}
					{@const n = NIVEL[v.nivel]}
					<div class="flex items-center gap-2 border-2 py-1 pr-2.5 pl-1 text-[13px] leading-[18px] font-semibold" style:border-color={n.cor} style:background="color-mix(in srgb, {n.cor} 10%, transparent)"><Icone id={n.icone} alt={n.rotulo} />{n.rotulo} · {v.texto}</div>
				{/each}
			</div>
			<span class="flex-1"></span>
			{#if data.editavel}
				<div class="flex items-center gap-2 lg:hidden"><IndicadorSalvo estado={salvo} /></div>
				<button type="button" class="btn-jogo min-h-12 {bloqueios ? 'bg-b3 text-mut' : 'btn-primario'}" disabled={!!bloqueios} title={bloqueios ? 'Resolva os bloqueios' : undefined} onclick={() => (modal = 'confirmar')}>{direto ? 'CONCLUIR' : 'ENVIAR PARA REVISÃO'}</button>
			{/if}
		</aside>
	</div>
</div>

{#if modal === 'confirmar'}
	<Modal rotulo="Enviar" largura={520} topo={160} aoFechar={() => !enviando && (modal = null)}>
		<div class="bg-grena px-5 py-3.5"><h2 class="m-0 font-mincho text-[22px] leading-7 font-bold text-papel">{direto ? 'Concluir?' : 'Enviar para revisão?'}</h2></div>
		<p class="m-0 px-5 py-4 text-[15px] leading-[23px]">
			{#if direto}Entra aprovado agora.{:else}Fica bloqueado até {data.mestre} responder.{/if}
			{#if data.ficha && tipo !== 'item'} Na aprovação, {ryo(resumo.custo)} saem do ryo de {data.ficha.nome} e o objeto vai para o inventário.{/if}
		</p>
		{#if analise.verificacoes.some((v) => v.nivel === 'aviso')}<div class="px-5 pb-2"><Alerta tipo="aviso" titulo="Há avisos. Dá para enviar mesmo assim." /></div>{/if}
		<div class="flex justify-end gap-2 px-5 pb-5">
			<button type="button" class="btn-jogo btn-fantasma" disabled={enviando} onclick={() => (modal = null)}>CANCELAR</button>
			<button type="button" class="btn-jogo btn-primario" disabled={enviando} aria-busy={enviando} onclick={enviar}>{#if enviando}<Girando />{/if}{direto ? 'CONCLUIR' : 'ENVIAR'}</button>
		</div>
	</Modal>
{:else if modal === 'excluir'}
	<Modal rotulo="Excluir rascunho" largura={480} topo={160} aoFechar={() => (modal = null)}>
		<div class="flex flex-col gap-4 p-6">
			<h2 class="t-h3 m-0">Excluir este rascunho?</h2>
			<div class="flex justify-end gap-2.5">
				<button type="button" class="btn-jogo btn-fantasma" onclick={() => (modal = null)}>CANCELAR</button>
				<button type="button" class="btn-jogo bg-err text-errfg" onclick={excluir}>EXCLUIR</button>
			</div>
		</div>
	</Modal>
{:else if modal === 'decidir'}
	<Modal rotulo="Decisão" largura={520} topo={140} aoFechar={() => !decidindo && (modal = null)}>
		<form
			class="flex flex-col gap-4 p-6"
			onsubmit={(ev) => {
				ev.preventDefault();
				decidir();
			}}
		>
			<h2 class="t-h3 m-0">{decisao === 'aprovado' ? `Aprovar ${d.nome}?` : decisao === 'ajustes' ? 'Pedir ajustes' : 'Rejeitar'}</h2>
			<p class="m-0 text-[15px] leading-[23px] text-mut">
				{decisao === 'aprovado'
					? data.ficha && tipo !== 'item'
						? `${ryo(resumo.custo)} saem do ryo de ${data.ficha.nome}${ctx.ryo != null ? ` (tem ${ryo(ctx.ryo)})` : ''} e o objeto vai para o inventário dela.`
						: tipo === 'item'
							? 'O item entra na loja da campanha.'
							: 'Entra na biblioteca da campanha.'
					: decisao === 'ajustes'
						? `${data.autor} volta a editar e reenvia.`
						: `${data.autor} precisará começar de novo.`}
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
