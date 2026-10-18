<script lang="ts">
	// Retrato do usuário. Os avatares PixelLab (avatar-01…24) ainda não existem: mostra as iniciais.
	import { iniciais } from '#lib/formatar.ts';

	interface Props {
		nome: string;
		tamanho?: 32 | 36 | 40 | 64 | 128;
		class?: string;
	}
	let { nome, tamanho = 36, class: classe = '' }: Props = $props();
	const fonte = $derived(tamanho >= 64 ? 'text-2xl' : tamanho >= 40 ? 'text-sm' : 'text-xs');
</script>

<span
	class="t-num inline-flex flex-none items-center justify-center border-2 border-[#8B2E20] bg-grena text-papel {fonte} {classe}"
	style:width="{tamanho}px"
	style:height="{tamanho}px"
	aria-hidden="true">{iniciais(nome)}</span
>
