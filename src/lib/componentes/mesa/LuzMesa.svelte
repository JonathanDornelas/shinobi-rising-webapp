<svelte:options namespace="svg" />

<script lang="ts">
	// Luz dinâmica no quadro (dentro do grupo da grade, então serve às duas vistas): a escuridão de quem joga, com o que
	// cada um enxerga vazado (e, no escuro, só o que as luzes iluminam), as paredes e as luzes que o Mestre edita e os
	// marcadores das portas. A conta fica em luz.ts; aqui é só o desenho.
	import { ehPorta, type Ambiente, type Luz, type Parede, type Visao } from '#lib/mesa/luz.ts';
	import { caminhoPoligono, type Ponto } from '#lib/mesa/visao.ts';

	let {
		L,
		A,
		F,
		clipCena,
		visao,
		ambiente,
		paredes,
		verParedes,
		paredeNova,
		portas,
		luzes,
		verLuzes,
		luzSel,
		tela,
		desfazer
	}: {
		L: number;
		A: number;
		/** pixels da tela em metros da grade */
		F: (px: number) => number;
		clipCena: string | undefined;
		/** o que se vê (null: sem escuridão, como o Mestre vê) */
		visao: Visao | null;
		ambiente: Ambiente;
		paredes: readonly Parede[];
		/** 'forte' com a ferramenta Paredes; 'fraco' para o Mestre lembrar onde estão; null não mostra */
		verParedes: 'forte' | 'fraco' | null;
		paredeNova: { a: Ponto; b: Ponto; tipo: number } | null;
		/** os marcadores de porta que aparecem (o grupo vê só os que estão à vista) */
		portas: { i: number; x: number; y: number; tipo: number }[];
		luzes: readonly Luz[];
		/** 'forte' com a ferramenta Luz (os alcances e as alças); 'fraco' só as chamas, para o Mestre lembrar onde estão */
		verLuzes: 'forte' | 'fraco' | null;
		luzSel: string | null;
		/** da grade para a tela (na isométrica, projeta) e o grupo que desfaz a projeção (o que fica "de pé") */
		tela: (x: number, y: number) => [number, number];
		desfazer: string | undefined;
	} = $props();

	const uid = Math.random().toString(36).slice(2, 8);
	const COR: Record<number, string> = { 0: 'var(--mesa-vermelhao)', 1: 'var(--acc)', 2: 'var(--ok)', 3: 'var(--mesa-ouro, #d9a82b)', 4: 'var(--mesa-azul, #5aa0d8)' };
	// no escuro, a parte vista sem luz fica no breu; na penumbra, esmaecida; no claro, inteira
	const vistaSemLuz = $derived(ambiente === 'claro' ? '#000' : ambiente === 'penumbra' ? '#8a8a8a' : '#fff');
</script>

{#if visao}
	<!-- a escuridão: a máscara é branca (escuro) e o que se vê pinta de preto por cima (multiplicando, as luzes somam) -->
	<defs>
		<clipPath id="vistas-{uid}">
			{#each visao.vistas as v, i (i)}<path d={caminhoPoligono(v)} />{/each}
		</clipPath>
		{#each visao.fontes as f, i (i)}
			{@const r = f.plena + f.penumbra}
			<radialGradient id="luz-{uid}-{i}" gradientUnits="userSpaceOnUse" cx={f.x} cy={f.y} r={r}>
				<stop offset="0" stop-color="#000" />
				<stop offset={r ? f.plena / r : 0} stop-color="#000" />
				<stop offset={r ? (f.plena + f.penumbra * 0.6) / r : 0} stop-color="#777" />
				<stop offset="1" stop-color="#fff" />
			</radialGradient>
		{/each}
		<mask id="escuro-{uid}" maskUnits="userSpaceOnUse" x="0" y="0" width={L} height={A}>
			<rect x="0" y="0" width={L} height={A} fill="#fff" />
			{#if ambiente !== 'escuro'}
				{#each visao.vistas as v, i (i)}<path d={caminhoPoligono(v)} fill={vistaSemLuz} style="mix-blend-mode: multiply" />{/each}
			{/if}
			<g clip-path="url(#vistas-{uid})">
				{#each visao.fontes as f, i (i)}<path d={caminhoPoligono(f.poligono)} fill="url(#luz-{uid}-{i})" style="mix-blend-mode: multiply" />{/each}
			</g>
		</mask>
	</defs>
	<rect x="0" y="0" width={L} height={A} fill="#0a0807" fill-opacity="0.86" mask="url(#escuro-{uid})" pointer-events="none" clip-path={clipCena} />
	<!-- uma moldura de breu em volta da cena: na isométrica, o alto das paredes da borda passa do losango -->
	<path d="M-4 -4H{L + 4}V{A + 4}H-4Z M0 0V{A}H{L}V0Z" fill-rule="evenodd" fill="#0a0807" pointer-events="none" />
{/if}

{#if verParedes}
	<!-- as paredes do Mestre: vermelhão, porta em âmbar (aberta em verde, trancada em ouro), janela tracejada em azul -->
	<g pointer-events="none" opacity={verParedes === 'forte' ? 1 : 0.45}>
		{#each paredes as p, i (i)}
			<line x1={p[0]} y1={p[1]} x2={p[2]} y2={p[3]} style="stroke: {COR[p[4]]}" stroke-width={ehPorta(p[4]) ? 4 : 3} stroke-linecap="round" stroke-dasharray={p[4] === 4 ? '6 4' : p[4] === 2 ? '2 5' : undefined} vector-effect="non-scaling-stroke" />
		{/each}
		{#if verParedes === 'forte'}
			{#each paredes as p, i (i)}
				<circle cx={p[0]} cy={p[1]} r={F(3.5)} style="fill: var(--b0); stroke: {COR[p[4]]}" stroke-width="1.5" vector-effect="non-scaling-stroke" />
				<circle cx={p[2]} cy={p[3]} r={F(3.5)} style="fill: var(--b0); stroke: {COR[p[4]]}" stroke-width="1.5" vector-effect="non-scaling-stroke" />
			{/each}
		{/if}
	</g>
{/if}
{#if paredeNova}
	{@const m = Math.hypot(paredeNova.b[0] - paredeNova.a[0], paredeNova.b[1] - paredeNova.a[1])}
	<line x1={paredeNova.a[0]} y1={paredeNova.a[1]} x2={paredeNova.b[0]} y2={paredeNova.b[1]} style="stroke: {COR[paredeNova.tipo]}" stroke-width="4" stroke-linecap="round" stroke-dasharray={paredeNova.tipo === 4 ? '6 4' : undefined} vector-effect="non-scaling-stroke" pointer-events="none" />
	{#if m > 0}
		{@const [tx, ty] = tela((paredeNova.a[0] + paredeNova.b[0]) / 2, (paredeNova.a[1] + paredeNova.b[1]) / 2)}
		<g transform={desfazer} pointer-events="none">
			<text x={tx} y={ty - F(10)} font-size={F(12)} text-anchor="middle" font-family="'Pixelify Sans'" font-weight="700" style="fill: var(--fg); stroke: var(--b0)" stroke-width={F(3)} paint-order="stroke">{m.toFixed(1).replace('.', ',')} m</text>
		</g>
	{/if}
{/if}

{#if verLuzes}
	<!-- as luzes do Mestre: o alcance (plena e penumbra) no chão e a chama de pé; a selecionada ganha as alças dos raios -->
	<g pointer-events="none" display={verLuzes === 'forte' ? undefined : 'none'}>
		{#each luzes as l (l.id)}
			{@const sel = l.id === luzSel}
			<circle cx={l.x} cy={l.y} r={l.plena + l.penumbra} fill="none" style="stroke: var(--acc)" stroke-opacity={sel ? 0.9 : 0.35} stroke-width="1.5" stroke-dasharray="4 4" vector-effect="non-scaling-stroke" />
			<circle cx={l.x} cy={l.y} r={l.plena} style="fill: var(--acc); stroke: var(--acc)" fill-opacity={l.acesa ? 0.08 : 0} stroke-opacity={sel ? 0.9 : 0.5} stroke-width="1.5" vector-effect="non-scaling-stroke" />
		{/each}
	</g>
	<g transform={desfazer} pointer-events="none" opacity={verLuzes === 'forte' ? 1 : 0.6}>
		{#each luzes as l (l.id)}
			{@const [x, y] = tela(l.x, l.y)}
			{@const sel = l.id === luzSel}
			<circle cx={x} cy={y} r={F(sel ? 11 : 9)} style="fill: var(--b0); stroke: {sel ? 'var(--fg)' : 'var(--acc)'}" stroke-width={F(2)} />
			<path d="M{x} {y - F(6)}c{F(3)} {F(3)} {F(4)} {F(5)} {F(4)} {F(7)}a{F(4)} {F(4)} 0 0 1 {-F(8)} 0c0 {-F(2)} {F(1)} {-F(4)} {F(4)} {-F(7)}z" style="fill: {l.acesa ? 'var(--acc)' : 'var(--mut)'}" />
			{#if sel}
				{@const [px, py] = tela(l.x + l.plena, l.y)}
				{@const [qx, qy] = tela(l.x + l.plena + l.penumbra, l.y)}
				<rect x={px - F(6)} y={py - F(6)} width={F(12)} height={F(12)} style="fill: var(--acc); stroke: var(--b0)" stroke-width={F(2)} />
				<rect x={qx - F(6)} y={qy - F(6)} width={F(12)} height={F(12)} style="fill: var(--b0); stroke: var(--acc)" stroke-width={F(2)} />
			{/if}
		{/each}
	</g>
{/if}

{#if portas.length}
	<!-- portas: um clique abre e fecha (o jogador, de perto); a trancada mostra o cadeado -->
	<g transform={desfazer} pointer-events="none">
		{#each portas as d (d.i)}
			{@const [x, y] = tela(d.x, d.y)}
			<rect x={x - F(8)} y={y - F(8)} width={F(16)} height={F(16)} style="fill: var(--b0); stroke: {COR[d.tipo]}" stroke-width={F(2)} />
			{#if d.tipo === 3}
				<path d="M{x - F(4)} {y - F(1)}h{F(8)}v{F(6)}h{-F(8)}z M{x - F(2.5)} {y - F(1)}v{-F(2)}a{F(2.5)} {F(2.5)} 0 0 1 {F(5)} 0v{F(2)}" style="fill: none; stroke: {COR[3]}" stroke-width={F(1.6)} />
			{:else}
				<path d={d.tipo === 2 ? `M${x - F(4)} ${y - F(5)}v${F(10)} M${x - F(4)} ${y - F(5)}l${F(7)} ${F(2)}v${F(10)}l${-F(7)} ${-F(2)}` : `M${x - F(4)} ${y - F(5)}h${F(8)}v${F(10)}h${-F(8)}z M${x + F(1.5)} ${y}h${F(1)}`} style="fill: none; stroke: {COR[d.tipo]}" stroke-width={F(1.6)} />
			{/if}
		{/each}
	</g>
{/if}
