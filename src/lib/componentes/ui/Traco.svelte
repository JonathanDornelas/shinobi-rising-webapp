<script lang="ts" module>
	// Ícones utilitários (DS 1 · 05): traço de 2px, pontas retas, 20px, currentColor.
	const CAMINHOS = {
		fechar: '<path d="M18 6 6 18M6 6l12 12"/>',
		chevron: '<path d="m9 18 6-6-6-6"/>',
		baixo: '<path d="m6 9 6 6 6-6"/>',
		voltar: '<path d="M19 12H5M11 18l-6-6 6-6"/>',
		buscar: '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>',
		menu: '<path d="M4 6h16M4 12h16M4 18h16"/>',
		link: '<path d="M10 14a5 5 0 0 0 7 0l3-3a5 5 0 0 0-7-7l-1 1M14 10a5 5 0 0 0-7 0l-3 3a5 5 0 0 0 7 7l1-1"/>',
		cadeado: '<rect x="5" y="11" width="14" height="10"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>',
		ok: '<path d="M20 6 9 17l-5-5"/>',
		sumi: '<path d="M21 13A9 9 0 1 1 11 3a7 7 0 0 0 10 10z"/>',
		washi: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2M5 5l1.5 1.5M17.5 17.5 19 19M5 19l1.5-1.5M17.5 6.5 19 5"/>',
		recente: '<path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5M12 7v5l3 2"/>',
		imprimir: '<path d="M6 9V3h12v6M6 18H4v-7h16v7h-2M7 14h10v7H7z"/>',
		estrela: '<path d="m12 3 2.7 5.8 6.3.7-4.7 4.3 1.3 6.3L12 17l-5.6 3.1 1.3-6.3L3 9.5l6.3-.7z"/>',
		lista: '<path d="M9 6h11M9 12h11M9 18h11M4 6h1M4 12h1M4 18h1"/>',
		cards: '<path d="M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z"/>',
		tabela: '<path d="M3 5h18v14H3zM3 10h18M3 15h18M9 5v14"/>',
		livro: '<path d="M3 5h6a3 3 0 0 1 3 3v12a2 2 0 0 0-2-2H3zM21 5h-6a3 3 0 0 0-3 3v12a2 2 0 0 1 2-2h7z"/>',
		lixeira: '<path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13M10 11v6M14 11v6"/>'
	} as const;
	export type NomeTraco = keyof typeof CAMINHOS;
</script>

<script lang="ts">
	interface Props {
		nome: NomeTraco;
		tamanho?: number;
		espessura?: number;
		class?: string;
	}
	let { nome, tamanho = 20, espessura = 2, class: classe = '' }: Props = $props();
</script>

<svg
	width={tamanho}
	height={tamanho}
	viewBox="0 0 24 24"
	aria-hidden="true"
	class="flex-none fill-none stroke-current [stroke-linecap:square] {classe}"
	stroke-width={espessura}
>
	{@html CAMINHOS[nome]}
</svg>
