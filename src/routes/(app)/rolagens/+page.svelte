<script lang="ts">
	// L10 · R1 · Registro de rolagens fora de uma campanha (a da campanha fica em /campanhas/[id]/rolagens, com o menu).
	import RegistroRolagens from '#lib/componentes/rolagens/RegistroRolagens.svelte';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
</script>

<RegistroRolagens {data} />
