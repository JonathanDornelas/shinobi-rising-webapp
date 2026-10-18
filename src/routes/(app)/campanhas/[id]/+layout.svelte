<script lang="ts">
	// Moldura da campanha: sub-cabeçalho (nome, era, papel), menu lateral e abas no mobile.
	import MenuCampanha from '#lib/componentes/campanha/MenuCampanha.svelte';
	import Alerta from '#lib/componentes/ui/Alerta.svelte';
	import Icone from '#lib/componentes/ui/Icone.svelte';
	import { PAPEL, rotuloEra } from '#lib/campanhas/dominio.ts';
	import { dataCurta } from '#lib/formatar.ts';
	import type { LayoutProps } from './$types';

	let { data, children }: LayoutProps = $props();
	const c = $derived(data.campanha);
</script>

<div class="flex min-h-14 items-center gap-3 border-b-2 border-ink bg-b2 px-4 md:px-6">
	<a href="/campanhas/{c.id}" class="min-w-0 truncate font-mincho text-lg leading-6 font-bold text-fg md:text-[22px] md:leading-[30px]">{c.nome}</a>
	<span class="border-2 border-b3 px-[7px] py-[5px] font-pixel text-xs leading-none font-semibold tracking-[0.06em] whitespace-nowrap text-mut max-md:hidden">{rotuloEra(c)}</span>
	<span class="flex-1"></span>
	<span
		class="inline-flex h-9 flex-none items-center gap-1 border-2 pr-2.5 text-[13px] leading-none font-semibold {data.papel === 'mestre'
			? 'border-[#8B2E20] bg-grena text-papel'
			: 'border-mut text-fg'}"
	>
		<Icone id={PAPEL[data.papel].icone} />{PAPEL[data.papel].nome}
	</span>
</div>
<MenuCampanha id={c.id} papel={data.papel} parte="abas" pendentes={data.pendentes} />

<div class="flex flex-1">
	<MenuCampanha id={c.id} papel={data.papel} parte="lateral" pendentes={data.pendentes} />
	<div class="flex min-w-0 flex-1 flex-col">
		{#if c.arquivada_em}
			<div class="px-4 pt-4 md:px-6">
				<Alerta tipo="aviso" titulo="Campanha arquivada em {dataCurta(c.arquivada_em)} · somente leitura">
					{#if data.papel === 'mestre'}<span>Para editar de novo, desarquive em <a href="/campanhas/{c.id}/configuracoes" class="link">Configurações</a>.</span>{/if}
				</Alerta>
			</div>
		{/if}
		{@render children()}
	</div>
</div>
