<script lang="ts">
	// Moldura das telas de conta (A1–A3): capa à esquerda no desktop, faixa de capa no mobile, painel de 560 à direita.
	import type { Snippet } from 'svelte';

	interface Props {
		capa?: string;
		frase?: boolean;
		children: Snippet;
	}
	let { capa = 'capa-nevoa', frase = false, children }: Props = $props();
</script>

<div class="grid flex-1 grid-cols-[minmax(0,1fr)] bg-b0 lg:grid-cols-[minmax(0,1fr)_560px]">
	<div class="relative hidden items-center justify-center overflow-hidden border-r-2 border-carvao lg:flex">
		<img src="/covers/{capa}-256.png" width="1024" height="384" alt="" class="max-w-none flex-none opacity-85" />
		{#if frase}
			<div class="absolute bottom-12 left-12 flex max-w-[420px] flex-col gap-2">
				<span class="font-jp text-[40px] leading-none font-extrabold text-vermelhao" title="Shinobi no Michi: o caminho do ninja">忍道</span>
				<span class="border-2 border-[#2E2420] bg-carvao px-3 py-2 font-mincho text-xl leading-[30px] font-semibold text-papel italic">Que o seu Caminho do Ninja seja repleto de aventuras!</span>
			</div>
		{/if}
	</div>
	<div class="flex flex-col bg-b1">
		<div class="flex h-[120px] justify-center overflow-hidden border-b-2 border-ink lg:hidden">
			<img src="/covers/{capa}-256.png" width="512" height="192" alt="" class="-mt-9 max-w-none flex-none" />
		</div>
		<div class="flex flex-1 flex-col gap-4 px-4 py-6 sm:px-10 lg:justify-center lg:px-14 lg:py-12">
			{@render children()}
		</div>
	</div>
</div>
