<script lang="ts">
	// O quadro real da Mesa com dados que o teste entrega em window.__dados, sem banco nem login. Ver +page.ts.
	import QuadroMesa from '#lib/componentes/mesa/QuadroMesa.svelte';
	import RedeMesa from '#lib/componentes/mesa/RedeMesa.svelte';
	import { Mesa } from '#lib/mesa/mesa.svelte.ts';
	import { UiMesa } from '#lib/mesa/ui.svelte.ts';
	import type { MesaCena, MesaObjeto, MesaToken } from '#lib/supabase/banco.ts';

	const dados = (window as unknown as { __dados: { cena: MesaCena; tokens: MesaToken[]; mestre: boolean; rede?: boolean; objetos?: MesaObjeto[] } }).__dados;
	const mesa = new Mesa({
		campanha: dados.cena.campanha_id,
		eu: 'u1',
		mestre: dados.mestre,
		arquivada: false,
		cenas: [dados.cena],
		cena: dados.cena,
		tokens: dados.tokens,
		tracos: [],
		efeitos: [],
		objetos: dados.objetos ?? [],
		membros: [],
		molduraMesa: { id: null, universal: false }
	});
	const ui = new UiMesa();
	Object.assign(window, { __mesa: mesa, __ui: ui });
</script>

<div class="fixed inset-0">
	<QuadroMesa {mesa} {ui} pvDe={() => null} deslocamentoDe={() => 9} fotoDe={() => null} onSoltar={() => {}} />
	{#if dados.rede}<RedeMesa {mesa} class="absolute top-20 right-4 z-30 flex w-72 flex-col border-2 border-b3 bg-sup shadow-[4px_4px_0_var(--sombra)]" />{/if}
</div>
