<script lang="ts">
	// L10 · R1 · Registro de rolagens na moldura da campanha (menu lateral).
	import RegistroRolagens from '#lib/componentes/rolagens/RegistroRolagens.svelte';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
</script>

<RegistroRolagens {data} />
