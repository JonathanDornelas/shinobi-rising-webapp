<svelte:options namespace="svg" />

<script lang="ts">
	// Os desenhos dos efeitos de área (um <pattern> por estilo): elementos (fogo sobe, água corre, vento passa, raio pisca,
	// terra racha…) e os tipos de jutsu (taijutsu, genjutsu, bukijutsu, ninjutsu). Cada um é um ladrilho em metros que o
	// quadro repete sobre os quadrados atingidos; quem pede menos movimento recebe os desenhos parados.
	import { onMount } from 'svelte';

	let animar = $state(true);
	onMount(() => {
		const mq = matchMedia('(prefers-reduced-motion: reduce)');
		animar = !mq.matches;
		const ao = () => (animar = !mq.matches);
		mq.addEventListener('change', ao);
		return () => mq.removeEventListener('change', ao);
	});
</script>

<defs>
	<!-- katon: línguas de fogo subindo -->
	<pattern id="fx-katon" width="1" height="1" patternUnits="userSpaceOnUse">
		<path d="M.15 1Q.05.6.28.3Q.35.55.45.45Q.5.2.6.02Q.85.4.85.7Q.85.92.68 1Z" fill="#ff9a3c" fill-opacity=".9" />
		<path d="M.35 1Q.4.75.5.58Q.64.8.64 1Z" fill="#ffe08a" />
		{#if animar}<animateTransform attributeName="patternTransform" type="translate" from="0 0" to="0 -1" dur="1.4s" repeatCount="indefinite" />{/if}
	</pattern>
	<!-- suiton: ondas correndo -->
	<pattern id="fx-suiton" width="1" height="0.5" patternUnits="userSpaceOnUse">
		<path d="M0 .25Q.25 0 .5 .25T1 .25" fill="none" stroke="#bfe0ff" stroke-width=".07" stroke-linecap="round" />
		<circle cx=".75" cy=".08" r=".04" fill="#e6f3ff" />
		{#if animar}<animateTransform attributeName="patternTransform" type="translate" from="0 0" to="1 0" dur="2.2s" repeatCount="indefinite" />{/if}
	</pattern>
	<!-- doton: pedras e rachaduras -->
	<pattern id="fx-doton" width="1" height="1" patternUnits="userSpaceOnUse">
		<path d="M.1.2L.4.1L.55.35L.3.5Z" fill="#5f4a2a" />
		<path d="M.6.55L.9.5L.95.85L.65.9Z" fill="#7a6038" />
		<path d="M.5.5L.45.7L.55.95M.2.75L.35.62" fill="none" stroke="#2e2314" stroke-width=".04" stroke-linecap="round" />
	</pattern>
	<!-- raiton: raios -->
	<pattern id="fx-raiton" width="2" height="2" patternUnits="userSpaceOnUse">
		<path d="M1 0L.6.8L1 .85L.5 2" fill="none" stroke="#fff3a6" stroke-width=".08" stroke-linejoin="bevel" />
		<path d="M1.6 0L1.35.55L1.7.65L1.3 1.3" fill="none" stroke="#ffe066" stroke-width=".05" stroke-linejoin="bevel" />
	</pattern>
	<!-- fuuton: fios de vento passando -->
	<pattern id="fx-fuuton" width="1" height="0.6" patternUnits="userSpaceOnUse">
		<path d="M0 .3C.3.05.5.55.8.3S1 .2 1 .3" fill="none" stroke="#e6f5d8" stroke-width=".05" stroke-linecap="round" />
		<path d="M.55.12a.1.1 0 1 1 .12.09" fill="none" stroke="#e6f5d8" stroke-width=".04" stroke-linecap="round" />
		{#if animar}<animateTransform attributeName="patternTransform" type="translate" from="0 0" to="1 0" dur="1.1s" repeatCount="indefinite" />{/if}
	</pattern>
	<!-- mokuton: trepadeiras e folhas -->
	<pattern id="fx-mokuton" width="1" height="1" patternUnits="userSpaceOnUse">
		<path d="M.1 1C.3.7.1.4.4.2" fill="none" stroke="#3e6b22" stroke-width=".08" stroke-linecap="round" />
		<ellipse cx=".42" cy=".2" rx=".14" ry=".07" transform="rotate(-30 .42 .2)" fill="#6fa34a" />
		<ellipse cx=".18" cy=".62" rx=".12" ry=".06" transform="rotate(25 .18 .62)" fill="#6fa34a" />
		<path d="M.75 1C.7.8.85.6.8.4" fill="none" stroke="#3e6b22" stroke-width=".06" stroke-linecap="round" />
	</pattern>
	<!-- hyoton: cristais -->
	<pattern id="fx-hyoton" width="1" height="1" patternUnits="userSpaceOnUse">
		<path d="M.5.08L.8.5L.5.92L.2.5Z" fill="#cff3ff" fill-opacity=".55" stroke="#ffffff" stroke-width=".03" />
		<path d="M.85.1L.95.25L.85.4L.75.25Z" fill="#ffffff" fill-opacity=".8" />
		<path d="M.12.78L.2.9L.12 1L.04.9Z" fill="#ffffff" fill-opacity=".8" />
	</pattern>
	<!-- yoton: lava correndo -->
	<pattern id="fx-yoton" width="1" height="1" patternUnits="userSpaceOnUse">
		<circle cx=".3" cy=".3" r=".2" fill="#ff5a1f" />
		<circle cx=".75" cy=".7" r=".25" fill="#b23a12" />
		<circle cx=".8" cy=".2" r=".1" fill="#ffc24a" />
		{#if animar}<animateTransform attributeName="patternTransform" type="translate" from="0 0" to="1 0" dur="4s" repeatCount="indefinite" />{/if}
	</pattern>
	<!-- ranton: nuvens de tempestade com raios -->
	<pattern id="fx-ranton" width="1.5" height="1.5" patternUnits="userSpaceOnUse">
		<circle cx=".4" cy=".4" r=".3" fill="#283c6e" fill-opacity=".75" />
		<circle cx=".8" cy=".35" r=".25" fill="#1c2a52" fill-opacity=".75" />
		<circle cx="1.1" cy="1" r=".3" fill="#283c6e" fill-opacity=".75" />
		<path d="M.9.7L.75 1.05L.95 1.1L.8 1.45" fill="none" stroke="#9ec4ff" stroke-width=".06" stroke-linejoin="bevel" />
	</pattern>
	<!-- jiton: limalha de ferro girando -->
	<pattern id="fx-jiton" width="1" height="1" patternUnits="userSpaceOnUse">
		<path d="M.2.3l.2-.1M.6.6l.15.15M.3.8l.2-.05M.75.2l.1-.12" fill="none" stroke="#9aa7b0" stroke-width=".05" stroke-linecap="round" />
		{#if animar}<animateTransform attributeName="patternTransform" type="rotate" from="0" to="360" dur="14s" repeatCount="indefinite" />{/if}
	</pattern>
	<!-- futton: vapor subindo -->
	<pattern id="fx-futton" width="1" height="1" patternUnits="userSpaceOnUse">
		<circle cx=".3" cy=".7" r=".18" fill="#ffffff" fill-opacity=".2" stroke="#e4edf3" stroke-width=".04" />
		<circle cx=".7" cy=".4" r=".14" fill="#ffffff" fill-opacity=".2" stroke="#e4edf3" stroke-width=".04" />
		<circle cx=".5" cy=".15" r=".1" fill="#ffffff" fill-opacity=".2" stroke="#e4edf3" stroke-width=".04" />
		{#if animar}<animateTransform attributeName="patternTransform" type="translate" from="0 0" to="0 -1" dur="3s" repeatCount="indefinite" />{/if}
	</pattern>
	<!-- shakuton: ondas de calor -->
	<pattern id="fx-shakuton" width="1" height="0.5" patternUnits="userSpaceOnUse">
		<path d="M0 .25Q.25.05.5.25T1 .25" fill="none" stroke="#ffb45a" stroke-width=".06" stroke-linecap="round" />
		<circle cx=".2" cy=".4" r=".03" fill="#ffe0a0" />
		{#if animar}<animateTransform attributeName="patternTransform" type="translate" from="0 0" to="0 -0.5" dur="1.2s" repeatCount="indefinite" />{/if}
	</pattern>
	<!-- bakuton: explosões -->
	<pattern id="fx-bakuton" width="1.2" height="1.2" patternUnits="userSpaceOnUse">
		<path d="M.6.1L.7.45L1.05.35L.8.6L1 .95L.6.78L.25 1.05L.4.65L.1.45L.5.45Z" fill="#e8692e" />
		<path d="M.6.35L.66.55L.86.52L.7.68L.6.62L.5.72L.5.55Z" fill="#ffd23f" />
	</pattern>
	<!-- jinton: poeira à deriva -->
	<pattern id="fx-jinton" width="0.8" height="0.8" patternUnits="userSpaceOnUse">
		<rect x=".1" y=".1" width=".08" height=".08" fill="#cfc4ae" />
		<rect x=".5" y=".35" width=".06" height=".06" fill="#e6dcc8" />
		<rect x=".3" y=".6" width=".1" height=".1" fill="#b3a88f" />
		<rect x=".65" y=".65" width=".05" height=".05" fill="#cfc4ae" />
		{#if animar}<animateTransform attributeName="patternTransform" type="translate" from="0 0" to="0.8 0.8" dur="5s" repeatCount="indefinite" />{/if}
	</pattern>
	<!-- taijutsu: marcas de impacto -->
	<pattern id="fx-taijutsu" width="1" height="1" patternUnits="userSpaceOnUse">
		<path d="M.15.85L.5.15M.4.9L.8.25M.6.6L.9.35" fill="none" stroke="#ffd84d" stroke-width=".09" stroke-linecap="round" />
		<path d="M.15.85L.5.15M.4.9L.8.25M.6.6L.9.35" fill="none" stroke="#ffffff" stroke-width=".03" stroke-linecap="round" />
	</pattern>
	<!-- genjutsu: espirais girando -->
	<pattern id="fx-genjutsu" width="1" height="1" patternUnits="userSpaceOnUse">
		<path d="M.15.5a.35.35 0 1 1 .7 0a.2.2 0 1 1-.4 0a.1.1 0 1 1 .2 0" fill="none" stroke="#b79cff" stroke-width=".05" stroke-linecap="round" />
		{#if animar}<animateTransform attributeName="patternTransform" type="rotate" from="0 .5 .5" to="360 .5 .5" dur="9s" repeatCount="indefinite" />{/if}
	</pattern>
	<!-- bukijutsu: cortes de aço -->
	<pattern id="fx-bukijutsu" width="1" height="1" patternUnits="userSpaceOnUse">
		<path d="M0 .8L1 .2M0 1.2L1 .6M0 .4L.5.1" fill="none" stroke="#e8eef4" stroke-width=".05" stroke-linecap="round" />
		<circle cx=".8" cy=".3" r=".04" fill="#ffffff" />
	</pattern>
	<!-- ninjutsu genérico: anéis de chakra -->
	<pattern id="fx-ninjutsu" width="1" height="1" patternUnits="userSpaceOnUse">
		<circle cx=".5" cy=".5" r=".3" fill="none" stroke="#6ad6f2" stroke-width=".05" />
		<circle cx=".5" cy=".5" r=".12" fill="#6ad6f2" fill-opacity=".6" />
	</pattern>
</defs>
