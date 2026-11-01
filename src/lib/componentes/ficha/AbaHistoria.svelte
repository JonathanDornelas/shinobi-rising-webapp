<script lang="ts">
	// P3 · História: background (do livro ou próprio), aparência, origem, time e sensei, e a história do personagem em
	// texto livre (a vida dele, não a mecânica), no mesmo editor das anotações.
	import { BACKGROUNDS } from '#lib/personagem/dados.ts';
	import type { FichaJogo } from '#lib/personagem/ficha.svelte.ts';
	import AbaAnotacoes from './AbaAnotacoes.svelte';

	let { f, historia }: { f: FichaJogo; historia?: { ficha: string; inicial: string | undefined; editavel: boolean } } = $props();
	const bg = $derived(BACKGROUNDS.find((b) => b.id === f.dados.background.id));
</script>

<div class="grid items-start gap-6 lg:grid-cols-[minmax(0,760px)_minmax(0,1fr)]">
	<div class="flex flex-col gap-3.5">
		<span class="t-rotulo text-xs">Background · {f.dados.background.id === 'proprio' ? f.dados.background.proprio.nome : (bg?.nome ?? '—')}</span>
		<p class="m-0 text-[17px] leading-[29px]">{f.dados.background.id === 'proprio' ? f.dados.background.proprio.traco : `${bg?.bonus ?? ''}. ${bg?.traco ?? ''}`}</p>
		{#if f.dados.conceito.aparencia}<span class="t-rotulo mt-1.5 text-xs">Aparência</span><p class="m-0 text-[17px] leading-[29px]">{f.dados.conceito.aparencia}</p>{/if}
		{#if f.dados.conceito.origem || f.dados.conceito.idade}
			<span class="t-rotulo mt-1.5 text-xs">Origem</span>
			<p class="m-0 text-[17px] leading-[29px]">{[f.dados.conceito.origem, f.dados.conceito.idade ? `${f.dados.conceito.idade} anos` : ''].filter(Boolean).join(' · ')}</p>
		{/if}
	</div>
	<div class="flex flex-col gap-2.5">
		<div class="painel flex flex-col gap-1 px-3.5 py-3"><span class="t-rotulo text-xs">Time</span><span class="text-[15px] font-semibold">{f.dados.time || '—'}</span></div>
		<div class="painel flex flex-col gap-1 px-3.5 py-3"><span class="t-rotulo text-xs">Sensei</span><span class="text-[15px] font-semibold">{f.dados.sensei || '—'}</span></div>
	</div>
</div>

{#if historia && historia.inicial !== undefined}
	<!-- a coluna só existe depois da migração (20261118120000_historia_personagem.sql) -->
	<div class="mt-6">
		<AbaAnotacoes
			ficha={historia.ficha}
			inicial={historia.inicial}
			editavel={historia.editavel}
			titulo="História do personagem"
			salvarCom="salvar_historia"
			LIMITE={30000}
			exemplo={'## Infância\nNasceu no distrito pobre de Konoha, filho de um ferreiro que forjava kunais para a ANBU...\n\n## O que mudou tudo\n- O dia em que o clã foi expulso da vila\n- A promessa feita ao irmão'}
			vazio="O jogador ainda não escreveu a história."
			importar
		/>
	</div>
{/if}
