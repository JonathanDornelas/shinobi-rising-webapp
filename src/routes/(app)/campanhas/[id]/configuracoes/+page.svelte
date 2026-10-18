<script lang="ts">
	// C7 · Configurações da campanha: seções recolhíveis com salvamento por seção, regras da mesa e zona de perigo.
	import { goto, refreshAll } from '$app/navigation';
	import FormAmbientacao from '#lib/componentes/campanha/FormAmbientacao.svelte';
	import FormAprovacao from '#lib/componentes/campanha/FormAprovacao.svelte';
	import FormIdentidade from '#lib/componentes/campanha/FormIdentidade.svelte';
	import Alerta from '#lib/componentes/ui/Alerta.svelte';
	import Campo from '#lib/componentes/ui/Campo.svelte';
	import Girando from '#lib/componentes/ui/Girando.svelte';
	import IndicadorSalvo, { type EstadoSalvo } from '#lib/componentes/ui/IndicadorSalvo.svelte';
	import Modal from '#lib/componentes/ui/Modal.svelte';
	import {
		deRegistro,
		paraRegistro,
		resumoAmbientacao,
		resumoAprovacao,
		validarAmbientacao,
		validarIdentidade,
		type DadosCampanha,
		type ErrosCampanha
	} from '#lib/campanhas/dominio.ts';
	import { regrasEmHtml } from '#lib/campanhas/texto.ts';
	import { toasts } from '#lib/estado/toasts.svelte.ts';
	import { supabase } from '#lib/supabase/cliente.ts';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
	const c = $derived(data.campanha);
	const arquivada = $derived(!!c.arquivada_em);

	type Secao = 'identidade' | 'ambientacao' | 'aprovacao';
	const SECOES: { id: Secao; nome: string }[] = [
		{ id: 'identidade', nome: 'Identidade' },
		{ id: 'ambientacao', nome: 'Ambientação e regras' },
		{ id: 'aprovacao', nome: 'Aprovação' }
	];

	// Cópia de edição por seção; volta ao valor salvo ao descartar.
	const original = $derived(deRegistro(c));
	// svelte-ignore state_referenced_locally
	let rascunho = $state<DadosCampanha>(deRegistro(data.campanha));
	let aberta = $state<Secao | null>(null);
	let erros = $state<ErrosCampanha>({});
	let estado = $state<Record<Secao | 'regras', EstadoSalvo>>({
		identidade: { tipo: 'ocioso' },
		ambientacao: { tipo: 'ocioso' },
		aprovacao: { tipo: 'ocioso' },
		regras: { tipo: 'ocioso' }
	});

	const CAMPOS: Record<Secao, (keyof DadosCampanha)[]> = {
		identidade: ['nome', 'premissa', 'capa'],
		ambientacao: ['era', 'era_alternativa', 'nivel_inicial', 'tamanho_grupo', 'vilas', 'clas_permitidos', 'clas_sem_kkg', 'clas_com_kkg', 'pacotes'],
		aprovacao: ['aprovacao']
	};
	const alterada = (s: Secao) => CAMPOS[s].some((k) => JSON.stringify(rascunho[k]) !== JSON.stringify(original[k]));
	const resumo = (s: Secao) => (s === 'identidade' ? original.nome : s === 'ambientacao' ? resumoAmbientacao(original) : resumoAprovacao(original.aprovacao));

	function alternar(s: Secao) {
		if (aberta && aberta !== s && alterada(aberta)) descartar(aberta);
		aberta = aberta === s ? null : s;
		erros = {};
	}
	function descartar(s: Secao) {
		for (const k of CAMPOS[s]) (rascunho as unknown as Record<string, unknown>)[k] = structuredClone($state.snapshot(original[k]));
		erros = {};
	}

	async function salvar(s: Secao) {
		erros = s === 'identidade' ? validarIdentidade(rascunho) : s === 'ambientacao' ? validarAmbientacao(rascunho) : {};
		if (Object.keys(erros).length) return;
		estado[s] = { tipo: 'salvando' };
		const registro = paraRegistro($state.snapshot(rascunho) as DadosCampanha);
		const parcial = Object.fromEntries(Object.entries(registro).filter(([k]) => (CAMPOS[s] as string[]).includes(k)));
		const { error } = await supabase().from('campanhas').update(parcial as Partial<typeof registro>).eq('id', c.id);
		if (error) {
			estado[s] = { tipo: 'erro' };
			return;
		}
		estado[s] = { tipo: 'salvo', em: Date.now() };
		await refreshAll();
	}

	// ---------------------------------------------------------------- regras da mesa
	// svelte-ignore state_referenced_locally
	let regras = $state(data.campanha.regras_mesa);
	let editor: HTMLTextAreaElement | undefined = $state();
	let previa = $state(false);
	const regrasAlteradas = $derived(regras !== c.regras_mesa);

	function marcar(antes: string, depois = antes, linha = false) {
		if (!editor) return;
		const { selectionStart: i, selectionEnd: f, value } = editor;
		if (linha) {
			const ini = value.lastIndexOf('\n', i - 1) + 1;
			regras = value.slice(0, ini) + antes + value.slice(ini);
		} else regras = value.slice(0, i) + antes + value.slice(i, f) + depois + value.slice(f);
		queueMicrotask(() => {
			editor?.focus();
			const p = linha ? i + antes.length : f + antes.length;
			editor?.setSelectionRange(linha ? p : i + antes.length, p);
		});
	}
	async function salvarRegras() {
		estado.regras = { tipo: 'salvando' };
		const { error } = await supabase().from('campanhas').update({ regras_mesa: regras }).eq('id', c.id);
		estado.regras = error ? { tipo: 'erro' } : { tipo: 'salvo', em: Date.now() };
		if (!error) await refreshAll();
	}

	// ---------------------------------------------------------------- zona de perigo
	type Acao = 'arquivar' | 'transferir' | 'excluir';
	let acao = $state<Acao | null>(null);
	let confirmacao = $state('');
	let novoMestre = $state('');
	let ocupado = $state(false);
	let falha = $state('');
	const jogadores = $derived(data.membros.filter((m) => m.papel === 'jogador'));
	const nomeConfere = $derived(confirmacao.trim() === c.nome.trim());

	function abrir(a: Acao) {
		acao = a;
		confirmacao = '';
		novoMestre = jogadores[0]?.id ?? '';
		falha = '';
	}

	async function executar() {
		ocupado = true;
		falha = '';
		const sb = supabase();
		let erro: { message: string } | null = null;
		if (acao === 'arquivar') {
			erro = (await sb.from('campanhas').update({ arquivada_em: arquivada ? null : new Date().toISOString() }).eq('id', c.id)).error;
		} else if (acao === 'transferir') {
			erro = (await sb.rpc('transferir_mestre', { campanha: c.id, novo_mestre: novoMestre })).error;
		} else if (acao === 'excluir') {
			erro = (await sb.from('campanhas').delete().eq('id', c.id)).error;
		}
		ocupado = false;
		if (erro) {
			falha = 'Não foi possível concluir agora. Tente de novo.';
			return;
		}
		const feita = acao;
		acao = null;
		if (feita === 'excluir') {
			toasts.mostrar(`${c.nome} foi excluída.`, 'info');
			await goto('/campanhas', { refreshAll: true });
		} else if (feita === 'transferir') {
			toasts.mostrar(`${jogadores.find((j) => j.id === novoMestre)?.nome} agora é o Mestre.`, 'sucesso');
			await goto(`/campanhas/${c.id}`, { refreshAll: true });
		} else {
			toasts.mostrar(arquivada ? 'Campanha desarquivada.' : 'Campanha arquivada.', 'info');
			await refreshAll();
		}
	}

	const PERIGO = $derived([
		arquivada
			? { id: 'arquivar' as const, titulo: 'Desarquivar campanha', texto: 'Volta a ser editável para o Mestre e os jogadores.', botao: 'DESARQUIVAR' }
			: { id: 'arquivar' as const, titulo: 'Arquivar campanha', texto: 'Vira só leitura para todos. Pode ser desarquivada.', botao: 'ARQUIVAR' },
		{ id: 'transferir' as const, titulo: 'Transferir papel de Mestre', texto: 'Escolha um jogador e digite o nome da campanha para confirmar.', botao: 'TRANSFERIR' },
		{ id: 'excluir' as const, titulo: 'Excluir campanha', texto: 'Apaga membros, convites e atividade. Não dá para desfazer.', botao: 'EXCLUIR' }
	]);
</script>

<main class="flex w-full max-w-[900px] min-w-0 flex-col gap-[18px] p-4 md:p-6">
	<h1 class="m-0 font-mincho text-[30px] leading-[38px] font-bold max-md:text-2xl">Configurações da campanha</h1>

	{#each SECOES as s (s.id)}
		{@const on = aberta === s.id}
		<section class="painel-sombra" aria-labelledby="sec-{s.id}">
			<h2 class="m-0">
				<button
					type="button"
					id="sec-{s.id}"
					class="flex min-h-12 w-full items-center gap-3 px-3.5 py-3 text-left {on ? 'border-b-2 border-b3' : ''}"
					aria-expanded={on}
					aria-controls="corpo-{s.id}"
					disabled={arquivada}
					onclick={() => alternar(s.id)}
				>
					<span class="t-rotulo flex-1">{s.nome}</span>
					{#if estado[s.id].tipo !== 'ocioso'}<IndicadorSalvo estado={estado[s.id]} />{:else if on && alterada(s.id)}<span class="text-[13px] text-mut">Alterações não salvas</span>{:else}<span class="truncate text-[13px] leading-[18px] font-normal text-mut max-sm:hidden">{resumo(s.id)}</span>{/if}
					<span class="font-pixel text-sm font-bold" aria-hidden="true">{on ? '▴' : '▾'}</span>
				</button>
			</h2>
			{#if on}
				<div id="corpo-{s.id}" class="flex flex-col gap-4 p-3.5">
					{#if s.id !== 'identidade' && alterada(s.id)}
						<Alerta tipo="aviso" titulo="Alterações não afetam fichas já aprovadas; novas submissões seguirão as novas regras." />
					{/if}
					{#if s.id === 'identidade'}
						<FormIdentidade bind:dados={rascunho} {erros} />
					{:else if s.id === 'ambientacao'}
						<FormAmbientacao bind:dados={rascunho} {erros} />
					{:else}
						<FormAprovacao bind:dados={rascunho} />
					{/if}
					<div class="flex justify-end gap-2">
						<button type="button" class="btn-jogo btn-fantasma text-[13px]" disabled={!alterada(s.id)} onclick={() => descartar(s.id)}>DESCARTAR</button>
						<button type="button" class="btn-jogo btn-primario text-[13px]" disabled={!alterada(s.id) || estado[s.id].tipo === 'salvando'} onclick={() => salvar(s.id)}>SALVAR SEÇÃO</button>
					</div>
				</div>
			{/if}
		</section>
	{/each}

	<section class="painel-sombra" aria-labelledby="sec-regras">
		<div class="flex items-center border-b-2 border-b3 px-3.5 py-3">
			<h2 id="sec-regras" class="t-rotulo m-0 flex-1">Regras da mesa</h2>
			{#if estado.regras.tipo !== 'ocioso' && !regrasAlteradas}<IndicadorSalvo estado={estado.regras} />{:else if regrasAlteradas}<span class="text-[13px] text-mut">Alterações não salvas</span>{/if}
		</div>
		<div class="flex flex-col gap-2.5 p-3.5">
			{#if regrasAlteradas}<Alerta tipo="aviso" titulo="Alterações não afetam fichas já aprovadas; novas submissões seguirão as novas regras." />{/if}
			<div>
				<div class="flex items-center gap-1 border-2 border-b-0 border-field bg-b1 p-1" role="toolbar" aria-label="Formatação">
					<button type="button" class="h-9 w-9 font-bold hover:bg-b3" aria-label="Negrito" disabled={arquivada || previa} onclick={() => marcar('**')}>B</button>
					<button type="button" class="h-9 w-9 font-semibold italic hover:bg-b3" aria-label="Itálico" disabled={arquivada || previa} onclick={() => marcar('*')}>I</button>
					<button type="button" class="h-9 w-9 font-pixel font-bold hover:bg-b3" aria-label="Lista" disabled={arquivada || previa} onclick={() => marcar('- ', '', true)}>•</button>
					<button type="button" class="h-9 w-9 font-pixel text-[13px] font-bold hover:bg-b3" aria-label="Título" disabled={arquivada || previa} onclick={() => marcar('## ', '', true)}>H</button>
					<span class="flex-1"></span>
					<button type="button" class="btn-jogo btn-fantasma min-h-9 px-2.5 text-xs" aria-pressed={previa} onclick={() => (previa = !previa)}>{previa ? 'EDITAR' : 'PRÉVIA'}</button>
				</div>
				{#if previa}
					<div class="texto-regras min-h-[120px] border-2 border-field bg-b1 p-3 text-base leading-[26px]">
						{#if regras.trim()}{@html regrasEmHtml(regras)}{:else}<p class="text-mut">Nada escrito ainda.</p>{/if}
					</div>
				{:else}
					<textarea
						bind:this={editor}
						bind:value={regras}
						aria-labelledby="sec-regras"
						class="campo block h-auto min-h-[120px] w-full resize-y p-3 leading-[26px]"
						maxlength="5000"
						readonly={arquivada}
						placeholder="Sessões quinzenais. PD não acumula entre sessões. Mortes sempre combinadas antes."
					></textarea>
				{/if}
			</div>
			<div class="flex justify-end gap-2">
				<button type="button" class="btn-jogo btn-fantasma text-[13px]" disabled={!regrasAlteradas} onclick={() => (regras = c.regras_mesa)}>DESCARTAR</button>
				<button type="button" class="btn-jogo btn-primario text-[13px]" disabled={!regrasAlteradas || arquivada || estado.regras.tipo === 'salvando'} onclick={salvarRegras}>SALVAR SEÇÃO</button>
			</div>
		</div>
	</section>

	<section id="perigo" class="border-2 border-err bg-b2 sombra-painel" aria-labelledby="sec-perigo">
		<h2 id="sec-perigo" class="t-rotulo m-0 border-b-2 border-b3 px-3.5 py-3" style:color="var(--err)">Zona de perigo</h2>
		{#each PERIGO as p (p.id)}
			{@const bloqueada = p.id === 'transferir' && (arquivada || !jogadores.length)}
			<div class="flex flex-wrap items-center gap-3 border-b-2 border-b3 px-3.5 py-3 last:border-b-0">
				<div class="flex min-w-[220px] flex-1 flex-col gap-0.5">
					<span class="text-[15px] leading-[22px] font-semibold">{p.titulo}</span>
					<span class="text-[13px] leading-[18px] text-mut">
						{p.id === 'transferir' && !jogadores.length ? 'Precisa de pelo menos um jogador na campanha.' : p.id === 'transferir' && arquivada ? 'Desarquive antes de transferir.' : p.texto}
					</span>
				</div>
				<button type="button" class="btn-jogo border-2 border-err px-3.5 text-[13px] text-err hover:bg-[color-mix(in_srgb,var(--err)_12%,transparent)]" disabled={bloqueada} onclick={() => abrir(p.id)}>{p.botao}</button>
			</div>
		{/each}
	</section>
</main>

{#if acao}
	<Modal rotulo={PERIGO.find((p) => p.id === acao)?.titulo ?? ''} largura={520} aoFechar={() => !ocupado && (acao = null)}>
		<form
			class="flex flex-col gap-4 p-6"
			onsubmit={(e) => {
				e.preventDefault();
				if (acao === 'arquivar' || nomeConfere) executar();
			}}
		>
			{#if acao === 'arquivar'}
				<h2 class="t-h3 m-0">{arquivada ? 'Desarquivar' : 'Arquivar'} {c.nome}?</h2>
				<p class="m-0 text-[15px] leading-[23px] text-mut">
					{arquivada
						? 'A campanha volta para Como Mestre e todos podem editar de novo.'
						: 'Ninguém consegue editar enquanto estiver arquivada: nem fichas, nem convites, nem configurações. Dá para desarquivar quando quiser.'}
				</p>
			{:else if acao === 'transferir'}
				<h2 class="t-h3 m-0">Transferir o papel de Mestre</h2>
				<p class="m-0 text-[15px] leading-[23px] text-mut">Você vira Jogador nesta campanha e perde acesso às configurações.</p>
				<Campo id="novo-mestre" rotulo="Novo Mestre">
					<select id="novo-mestre" class="campo" bind:value={novoMestre}>
						{#each jogadores as j (j.id)}<option value={j.id}>{j.nome}</option>{/each}
					</select>
				</Campo>
			{:else}
				<h2 class="t-h3 m-0">Excluir {c.nome}?</h2>
				<p class="m-0 text-[15px] leading-[23px] text-mut">Membros, convites e atividade somem para sempre. Para guardar o histórico, prefira arquivar.</p>
			{/if}
			{#if acao !== 'arquivar'}
				<Campo id="confirma-nome" rotulo="Digite o nome da campanha para confirmar" ajuda={c.nome}>
					<input id="confirma-nome" class="campo" autocomplete="off" bind:value={confirmacao} />
				</Campo>
			{/if}
			{#if falha}<Alerta tipo="erro" titulo={falha} />{/if}
			<div class="flex flex-wrap justify-end gap-2.5">
				<button type="button" class="btn-jogo btn-fantasma" disabled={ocupado} onclick={() => (acao = null)}>CANCELAR</button>
				<button
					type="submit"
					class="btn-jogo {acao === 'arquivar' ? 'btn-primario' : 'bg-err text-errfg'}"
					disabled={ocupado || (acao !== 'arquivar' && !nomeConfere) || (acao === 'transferir' && !novoMestre)}
					aria-busy={ocupado}
				>
					{#if ocupado}<Girando />{/if}{PERIGO.find((p) => p.id === acao)?.botao}
				</button>
			</div>
		</form>
	</Modal>
{/if}
