<script lang="ts">
	// G3 · Notificações em página (mobile, e "Ver todas" no desktop).
	import ListaNotificacoes from '#lib/componentes/shell/ListaNotificacoes.svelte';
</script>

<main class="mx-auto flex w-full max-w-[720px] flex-col gap-4 pt-0 pb-10 md:px-6 md:pt-8">
	<div class="flex flex-col gap-1.5 max-md:hidden">
		<span class="t-rotulo">Conta</span>
		<h1 class="t-h1 m-0">Notificações</h1>
	</div>
	<section class="bg-b2 md:border-2 md:border-frame md:sombra-painel" aria-label="Notificações">
		<ListaNotificacoes pagina />
	</section>
</main>
