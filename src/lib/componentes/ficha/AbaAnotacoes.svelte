<script lang="ts">
	// P3 · Anotações: caderno do dono da ficha (pistas, nomes, planos), salvo sozinho enquanto escreve. O Mestre lê;
	// o grupo não vê. Mesma formatação simples das regras da mesa: **negrito**, *itálico*, "- " lista, "## " título.
	// O mesmo editor serve à História do personagem (aba História): outro título, outra função de salvar e importar de
	// um arquivo de texto.
	import { onDestroy } from 'svelte';
	import { regrasEmHtml } from '#lib/campanhas/texto.ts';
	import { supabase } from '#lib/supabase/cliente.ts';
	import IndicadorSalvo, { type EstadoSalvo } from '../ui/IndicadorSalvo.svelte';

	let {
		ficha,
		inicial,
		editavel,
		titulo = 'Anotações',
		salvarCom = 'salvar_anotacoes',
		LIMITE = 20000,
		exemplo = '## Pistas\n- O selo na porta do templo é do clã Uzumaki\n\n## Pessoas\n- **Hideo**, capitão da guarda: deve um favor ao time',
		vazio = 'O jogador ainda não escreveu nada.',
		importar = false
	}: {
		ficha: string;
		inicial: string;
		editavel: boolean;
		titulo?: string;
		salvarCom?: 'salvar_anotacoes' | 'salvar_historia';
		LIMITE?: number;
		exemplo?: string;
		/** o texto da prévia quando o dono ainda não escreveu (para quem só lê) */
		vazio?: string;
		/** botão para trazer o texto de um arquivo .txt ou .md */
		importar?: boolean;
	} = $props();
	const idTitulo = $derived(`${salvarCom}-titulo`);
	// svelte-ignore state_referenced_locally
	let texto = $state(inicial);
	// svelte-ignore state_referenced_locally
	let previa = $state(!editavel);
	let estado = $state<EstadoSalvo>({ tipo: 'ocioso' });
	let editor = $state<HTMLTextAreaElement>();
	// svelte-ignore state_referenced_locally
	let salvo = inicial;
	let temporizador: ReturnType<typeof setTimeout> | undefined;

	async function salvar() {
		clearTimeout(temporizador);
		if (texto === salvo) return;
		const enviado = texto;
		estado = { tipo: 'salvando' };
		const { error } = await supabase().rpc(salvarCom, { ficha, texto: enviado });
		if (error) return (estado = { tipo: 'erro', texto: `Não foi possível salvar: ${titulo.toLowerCase()}` });
		salvo = enviado;
		estado = { tipo: 'salvo', em: Date.now() };
	}
	function mudou() {
		clearTimeout(temporizador);
		temporizador = setTimeout(salvar, 900);
	}
	// sair da aba ou da página com algo pendente: salva na hora
	onDestroy(() => {
		if (texto !== salvo) salvar();
	});

	/** Traz o texto de um arquivo (.txt ou .md); se já havia texto, o do arquivo entra no fim. */
	async function importarArquivo(e: Event & { currentTarget: HTMLInputElement }) {
		const arquivo = e.currentTarget.files?.[0];
		e.currentTarget.value = '';
		if (!arquivo) return;
		if (arquivo.size > LIMITE * 4) return (estado = { tipo: 'erro', texto: 'Arquivo grande demais' });
		const lido = (await arquivo.text()).replace(/\r\n/g, '\n').trim();
		texto = (texto.trim() ? `${texto.trimEnd()}\n\n${lido}` : lido).slice(0, LIMITE);
		previa = false;
		void salvar();
	}

	function marcar(antes: string, depois = antes, linha = false) {
		if (!editor) return;
		const { selectionStart: i, selectionEnd: f, value } = editor;
		if (linha) {
			const ini = value.lastIndexOf('\n', i - 1) + 1;
			texto = value.slice(0, ini) + antes + value.slice(ini);
		} else texto = value.slice(0, i) + antes + value.slice(i, f) + depois + value.slice(f);
		mudou();
		queueMicrotask(() => {
			editor?.focus();
			const p = linha ? i + antes.length : f + antes.length;
			editor?.setSelectionRange(linha ? p : i + antes.length, p);
		});
	}
</script>

<svelte:window onbeforeunload={(e) => texto !== salvo && (salvar(), e.preventDefault())} />

<section class="painel-sombra" aria-labelledby={idTitulo}>
	<div class="flex flex-wrap items-center gap-2 border-b-2 border-b3 px-3.5 py-3">
		<h3 id={idTitulo} class="t-rotulo m-0 flex-1">{titulo}</h3>
		{#if estado.tipo !== 'ocioso'}<IndicadorSalvo {estado} />{/if}
		<span class="text-xs text-mut">{editavel ? 'Só você e o Mestre veem' : 'Caderno do jogador (somente leitura)'}</span>
	</div>
	<div class="flex flex-col gap-2 p-3.5">
		{#if editavel}
			<div class="flex items-center gap-1 border-2 border-b-0 border-field bg-b1 p-1" role="toolbar" aria-label="Formatação">
				<button type="button" class="h-9 w-9 font-bold hover:bg-b3" aria-label="Negrito" disabled={previa} onclick={() => marcar('**')}>B</button>
				<button type="button" class="h-9 w-9 font-semibold italic hover:bg-b3" aria-label="Itálico" disabled={previa} onclick={() => marcar('*')}>I</button>
				<button type="button" class="h-9 w-9 font-pixel font-bold hover:bg-b3" aria-label="Lista" disabled={previa} onclick={() => marcar('- ', '', true)}>•</button>
				<button type="button" class="h-9 w-9 font-pixel text-[13px] font-bold hover:bg-b3" aria-label="Título" disabled={previa} onclick={() => marcar('## ', '', true)}>H</button>
				{#if importar}
					<label class="flex h-9 cursor-pointer items-center px-2 font-pixel text-[11px] font-bold hover:bg-b3" title="Trazer o texto de um arquivo .txt ou .md (entra no fim do que já está escrito)">
						IMPORTAR<input type="file" accept=".txt,.md,text/plain,text/markdown" class="sr-only" onchange={importarArquivo} />
					</label>
				{/if}
				<span class="flex-1"></span>
				<span class="t-num px-1 text-xs text-mut" aria-label="{texto.length} de {LIMITE} caracteres">{texto.length.toLocaleString('pt-BR')}/{LIMITE.toLocaleString('pt-BR')}</span>
				<button type="button" class="btn-jogo btn-fantasma min-h-9 px-2.5 text-xs" aria-pressed={previa} onclick={() => (previa = !previa)}>{previa ? 'EDITAR' : 'PRÉVIA'}</button>
			</div>
		{/if}
		{#if previa}
			<div class="texto-regras min-h-[240px] border-2 border-field bg-b1 p-3 text-base leading-[26px]">
				{#if texto.trim()}{@html regrasEmHtml(texto)}{:else}<p class="text-mut">{editavel ? 'Nada escrito ainda.' : vazio}</p>{/if}
			</div>
		{:else}
			<textarea
				bind:this={editor}
				bind:value={texto}
				oninput={mudou}
				onblur={salvar}
				aria-labelledby={idTitulo}
				class="campo block h-auto min-h-[320px] w-full resize-y p-3 leading-[26px]"
				maxlength={LIMITE}
				placeholder={exemplo}
			></textarea>
			<span class="text-xs text-mut">Salva sozinho enquanto você escreve. **negrito**, *itálico*, "- " para lista e "## " para título.</span>
		{/if}
	</div>
</section>
