<script lang="ts">
	// J3 · Nova habilidade: nome, origem (ficha ou clã) e efeito, com a prévia do card. Salva o rascunho ou envia ao Mestre.
	import { goto } from '$app/navigation';
	import { habilidadeVazia, analisarHabilidade } from '#lib/jutsus/regras.ts';
	import { hrefJutsu } from '#lib/jutsus/status.ts';
	import { toasts } from '#lib/estado/toasts.svelte.ts';
	import { supabase } from '#lib/supabase/cliente.ts';
	import type { Json } from '#lib/supabase/banco.ts';
	import Campo from '../ui/Campo.svelte';
	import Girando from '../ui/Girando.svelte';
	import Modal from '../ui/Modal.svelte';

	interface Props {
		campanha: string;
		eu: string;
		fichas: { id: string; nome: string }[];
		clas: { id: string; nome: string }[];
		mestre: boolean;
		aoFechar: () => void;
	}
	let { campanha, eu, fichas, clas, mestre, aoFechar }: Props = $props();
	const d = $state(habilidadeVazia());
	let origem = $state('');
	let ocupado = $state(false);
	const analise = $derived(analisarHabilidade(d));
	const nomeOrigem = $derived(
		origem.startsWith('p:') ? fichas.find((f) => `p:${f.id}` === origem)?.nome : origem.startsWith('c:') ? `Clã ${clas.find((c) => `c:${c.id}` === origem)?.nome ?? ''}` : ''
	);

	async function salvar(enviar: boolean) {
		ocupado = true;
		const { data, error } = await supabase()
			.from('jutsus_criados')
			.insert({
				campanha_id: campanha,
				autor_id: eu,
				tipo: 'habilidade',
				personagem_id: origem.startsWith('p:') ? origem.slice(2) : null,
				cla_id: origem.startsWith('c:') ? origem.slice(2) : null,
				nome: d.nome.trim(),
				dados: { ...d, traducao: nomeOrigem ?? '' } as unknown as Json,
				resumo: { nome: d.nome.trim(), origem: nomeOrigem ?? '' } as unknown as Json
			})
			.select('id')
			.single();
		if (error || !data) {
			ocupado = false;
			return toasts.mostrar('Não foi possível salvar a habilidade.', 'erro');
		}
		if (enviar) {
			const { data: st, error: e2 } = await supabase().rpc('enviar_jutsu', { jutsu: data.id });
			if (e2) toasts.mostrar('Salva como rascunho; o envio falhou. Tente de novo pela habilidade.', 'erro', 6000);
			else toasts.mostrar(st === 'aprovado' ? 'Habilidade aprovada e na biblioteca.' : 'Habilidade enviada ao Mestre.', 'sucesso');
		} else toasts.mostrar('Rascunho salvo.', 'info');
		ocupado = false;
		await goto(hrefJutsu(campanha, data.id), { refreshAll: true });
	}
</script>

<Modal rotulo="Nova habilidade" largura={820} topo={96} aoFechar={() => !ocupado && aoFechar()}>
	<div class="bg-grena px-5 py-3.5"><h2 class="m-0 font-mincho text-[22px] leading-7 font-bold text-papel">Nova habilidade</h2></div>
	<div class="grid gap-5 p-5 md:grid-cols-[minmax(0,1fr)_320px]">
		<div class="flex flex-col gap-3">
			<Campo id="hab-nome" rotulo="Nome" obrigatorio>
				<input id="hab-nome" class="campo" maxlength="60" placeholder="Pulmões de Ferreiro" bind:value={d.nome} />
			</Campo>
			<Campo id="hab-origem" rotulo="Origem">
				<select id="hab-origem" class="campo pr-8" bind:value={origem}>
					<option value="">Sem vínculo</option>
					{#each fichas as f (f.id)}<option value="p:{f.id}">Ficha · {f.nome || 'sem nome'}</option>{/each}
					{#each clas as c (c.id)}<option value="c:{c.id}">Clã · {c.nome || 'sem nome'}</option>{/each}
				</select>
			</Campo>
			<Campo id="hab-efeito" rotulo="Efeito" obrigatorio ajuda="Mecânica em uma ou duas frases. Ex.: +1 numa perícia, sentido aprimorado, redução de dano.">
				<textarea id="hab-efeito" class="campo h-auto min-h-[88px] resize-y py-2.5 text-[15px] leading-[22px]" maxlength="800" bind:value={d.efeito}></textarea>
			</Campo>
			<Campo id="hab-descricao" rotulo="Descrição narrativa">
				<textarea id="hab-descricao" class="campo h-auto min-h-[64px] resize-y py-2.5 text-[15px] leading-[22px]" maxlength="800" bind:value={d.descricao}></textarea>
			</Campo>
		</div>
		<article class="self-start border-2 border-[#8B2E20] bg-b1">
			<header class="flex items-center gap-2 bg-grena px-3.5 py-3">
				<span class="flex flex-1 flex-col">
					<span class="font-mincho text-lg leading-6 font-bold text-papel">{d.nome.trim() || 'Nome da habilidade'}</span>
					<span class="text-[13px] leading-[18px] text-papel-2 italic">{nomeOrigem ? `Habilidade · ${nomeOrigem}` : 'Habilidade'}</span>
				</span>
				<span class="border-2 border-[#8B2E20] px-2 py-1.5 font-pixel text-xs leading-none font-bold text-papel">HABILIDADE</span>
			</header>
			<div class="flex flex-col gap-2 px-3.5 py-3 text-sm leading-[21px]">
				{#if d.descricao.trim()}<p class="m-0">{d.descricao.trim()}</p>{/if}
				<p class="m-0"><b>Efeito.</b> {d.efeito.trim() || '…'}</p>
			</div>
		</article>
	</div>
	<div class="flex flex-wrap justify-end gap-2 border-t-2 border-b3 px-5 py-3">
		<button type="button" class="btn-jogo btn-fantasma" disabled={ocupado} onclick={aoFechar}>CANCELAR</button>
		<button type="button" class="btn-jogo btn-contorno" disabled={ocupado || !d.nome.trim()} onclick={() => salvar(false)}>SALVAR RASCUNHO</button>
		<button type="button" class="btn-jogo {analise.bloqueios ? 'bg-b3 text-mut' : 'btn-primario'}" disabled={ocupado || !!analise.bloqueios} title={analise.bloqueios ? 'Dê nome e efeito' : undefined} onclick={() => salvar(true)}>
			{#if ocupado}<Girando />{/if}{mestre ? 'CONCLUIR' : 'ENVIAR PARA REVISÃO'}
		</button>
	</div>
</Modal>
