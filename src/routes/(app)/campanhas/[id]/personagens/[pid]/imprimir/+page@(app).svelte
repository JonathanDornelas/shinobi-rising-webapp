<script lang="ts">
	// P6 · Ficha para impressão em A4: preto e branco, 2 páginas, valores atuais em branco para o lápis.
	// A moldura de pixel continua, só que em traço preto.
	import { BACKGROUNDS, ELEMENTOS, PERICIAS, VILAS, NIVEIS_PROFICIENCIA, TIPOS_PROFICIENCIA } from '#lib/personagem/dados.ts';
	import { custoJutsu, ficha, inventarioInicial, rotuloAlvo, type ItemInventario } from '#lib/personagem/progressao.ts';
	import { linhasPericia, normalizarFicha, sinal, type FichaDados, type ItemLoja } from '#lib/personagem/regras.ts';
	import { rankSugerido } from '#lib/campanhas/dominio.ts';
	import { hrefFicha } from '#lib/personagem/status.ts';
	import { numero } from '#lib/formatar.ts';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
	// svelte-ignore state_referenced_locally
	const p = data.personagem;
	// svelte-ignore state_referenced_locally
	const cat = data.catalogo;
	const d = normalizarFicha(p.dados as Partial<FichaDados>);
	const loja = cat.loja as ItemLoja[];
	const fc = ficha(d, loja);
	const pericias = linhasPericia(d);
	const jutsus = fc.jutsus.map((s) => cat.jutsus.find((j) => j.slug === s)).filter((j) => !!j);
	const inventario = (p.inventario as ItemInventario[] | null) ?? inventarioInicial(d, loja);
	const vila = VILAS.find((v) => v.id === d.vila.id);
	const bg = BACKGROUNDS.find((b) => b.id === d.background.id);
	const nomeEsp = (id: string) => cat.especializacoes.find((e) => e.id === id)?.nome ?? id;
	const r = fc.recursos;
</script>

<div class="ficha-print flex flex-col items-center gap-6 bg-b0 py-6">
	<div class="flex gap-2 print:hidden">
		<a href={hrefFicha(data.campanha.id, p.id)} class="btn-jogo btn-contorno text-b0fg">◂ VOLTAR</a>
		<button type="button" class="btn-jogo btn-primario" onclick={() => print()}>IMPRIMIR</button>
	</div>

	<section class="folha" aria-label="Página 1">
		<header class="flex items-end gap-3.5 border-b-[3px] border-black pb-2.5">
			<div class="flex flex-1 flex-col gap-1">
				<span class="font-pixel text-[10pt] leading-none font-bold tracking-[0.12em]">SHINOBI NO MICHI · FICHA DE PERSONAGEM</span>
				<span class="font-mincho text-[26pt] leading-[1.1] font-bold">{p.nome}</span>
			</div>
			<div class="grid grid-cols-3 gap-x-4 gap-y-1 text-[10pt] leading-[1.4]">
				<span><b>Clã</b> {cat.cla?.nome ?? (d.cla.tipo === 'sem' ? 'sem clã' : '—')}</span>
				<span><b>Vila</b> {vila?.nome.replace(/gakure$/, '') ?? '—'}</span>
				<span><b>Nível</b> {p.nivel}</span>
				<span><b>Rank</b> {rankSugerido(p.nivel).split(' ')[0]}</span>
				<span><b>Jogador</b> {data.jogador}</span>
				<span><b>XP</b> {numero(p.xp)}</span>
			</div>
		</header>
		<div class="grid grid-cols-6 gap-1.5">
			{#each Object.entries(fc.atributos) as [k, v] (k)}
				<div class="flex flex-col gap-0.5 border-2 border-black p-1.5 text-center shadow-[3px_3px_0_#000]">
					<span class="font-pixel text-[9pt] leading-none font-bold tracking-[0.08em]">{k}</span><span class="font-pixel text-[22pt] leading-none font-bold">{sinal(v)}</span>
				</div>
			{/each}
		</div>
		<div class="grid grid-cols-3 gap-2">
			{#each [['PV', r.pv], ['PC', r.pc], ['PE', r.pe]] as [k, v] (k)}
				<div class="flex flex-col gap-1 border-2 border-black px-2 py-1.5">
					<span class="font-pixel text-[9pt] leading-none font-bold tracking-[0.08em]">{k}</span>
					<div class="flex items-end gap-1.5"><span class="h-7 flex-1 border-b border-black text-[8pt] leading-none text-[#555]">atual</span><span class="font-pixel text-[16pt] leading-none font-bold">/ {v}</span></div>
				</div>
			{/each}
		</div>
		<div class="grid grid-cols-4 gap-2 text-[10pt] leading-[1.4]">
			<span class="border-2 border-black p-1.5"><b>Defesa</b> {r.defesa}</span>
			<span class="border-2 border-black p-1.5"><b>Def. Mental</b> {r.defesaMental}</span>
			<span class="border-2 border-black p-1.5"><b>Iniciativa</b> 1d20{sinal(r.iniciativa)}</span>
			<span class="border-2 border-black p-1.5"><b>Fadiga</b> ☐☐☐☐☐</span>
		</div>
		<div class="grid flex-1 grid-cols-2 gap-3.5">
			<div class="flex flex-col border-2 border-black">
				<span class="bg-black px-2 py-[5px] font-pixel text-[9pt] leading-none font-bold tracking-[0.1em] text-white">PERÍCIAS</span>
				{#each pericias as pr (pr.id)}
					<div class="flex gap-1.5 border-b border-[#999] px-2 py-[3px] text-[9.5pt] leading-[1.3]">
						<span class="flex-1">{pr.nome}</span><span class="text-[#555]">{pr.atributo}{pr.distancia ? `/${pr.distancia.atributo}` : ''}</span><b class="w-10 text-right">{sinal(pr.total)}{pr.distancia ? `/${sinal(pr.distancia.total)}` : ''}</b>
					</div>
				{/each}
			</div>
			<div class="flex flex-col gap-3.5">
				<div class="border-2 border-black">
					<span class="block bg-black px-2 py-[5px] font-pixel text-[9pt] leading-none font-bold tracking-[0.1em] text-white">PROFICIÊNCIAS</span>
					<div class="px-2 py-1.5 text-[9.5pt] leading-normal">
						{#each fc.proficiencias as pf (pf.tipo + pf.alvo)}
							<div>{rotuloAlvo(pf.tipo, pf.alvo, cat.jutsus)} · {NIVEIS_PROFICIENCIA[pf.nivel - 1].nome} (+{pf.nivel}) · {TIPOS_PROFICIENCIA.find((t) => t.id === pf.tipo)?.beneficio}</div>
						{:else}<div>—</div>{/each}
					</div>
				</div>
				<div class="border-2 border-black">
					<span class="block bg-black px-2 py-[5px] font-pixel text-[9pt] leading-none font-bold tracking-[0.1em] text-white">ESPECIALIZAÇÃO E ELEMENTO</span>
					<div class="px-2 py-1.5 text-[9.5pt] leading-normal">
						{#each fc.especializacoes as e (e.id)}<div>{nomeEsp(e.id)} · NV {e.nivel}</div>{/each}
						<div>Elemento: {fc.elementos.map((e) => ELEMENTOS.find((x) => x.id === e)?.nome ?? e).join(', ') || '—'}</div>
						<div>RD {r.rd} · Carga máx. {r.cargaMax}</div>
					</div>
				</div>
				<div class="flex-1 border-2 border-black">
					<span class="block bg-black px-2 py-[5px] font-pixel text-[9pt] leading-none font-bold tracking-[0.1em] text-white uppercase">{cat.cla ? `Clã ${cat.cla.nome}` : 'Clã'}</span>
					<div class="px-2 py-1.5 text-[9.5pt] leading-normal">
						{#if cat.cla}
							<div>{cat.cla.bonus.join(' · ')} · {cat.cla.kkg ? `KKG ${cat.cla.kkg}` : 'sem KKG'}</div>
							<div>PIC {fc.pic} por arco · ☐☐☐☐☐</div>
							{#if cat.cla.relacoes.length}<div>{cat.cla.relacoes.map((x) => `${x.nome} (${x.relacao})`).join(', ')}</div>{/if}
						{:else}<div>{d.cla.tipo === 'sem' ? 'Sem clã' : '—'}</div>{/if}
					</div>
				</div>
			</div>
		</div>
		<span class="text-right text-[8pt] leading-none text-[#555]">1 / 2</span>
	</section>

	<section class="folha" aria-label="Página 2">
		<div class="border-2 border-black">
			<span class="block bg-black px-2 py-[5px] font-pixel text-[9pt] leading-none font-bold tracking-[0.1em] text-white">JUTSUS</span>
			<div class="grid grid-cols-[minmax(0,1.4fr)_44px_70px_64px_minmax(0,2fr)] gap-2 border-b-2 border-black px-2 py-1 font-pixel text-[8.5pt] leading-[1.3] font-bold">
				<span>NOME</span><span>RANK</span><span>TIPO</span><span>CUSTO</span><span>EFEITO</span>
			</div>
			{#each jutsus as j (j!.slug)}
				{@const c = custoJutsu(d, j!)}
				<div class="grid grid-cols-[minmax(0,1.4fr)_44px_70px_64px_minmax(0,2fr)] gap-2 border-b border-[#999] px-2 py-1 text-[9pt] leading-[1.35]">
					<b>{j!.nome}</b><span>{j!.rank}</span><span>{j!.tipo}</span><span>{c.final} {c.unidade}</span><span class="line-clamp-2">{j!.efeito}</span>
				</div>
			{/each}
		</div>
		<div class="border-2 border-black">
			<span class="block bg-black px-2 py-[5px] font-pixel text-[9pt] leading-none font-bold tracking-[0.1em] text-white">EQUIPAMENTO · RYO ______ · CARGA ___ / {r.cargaMax}</span>
			<div class="grid grid-cols-2 gap-x-4 gap-y-0.5 px-2 py-1.5 text-[9.5pt] leading-[1.6]">
				{#each inventario as i (i.id)}<span>{i.nome} ×{i.qtd}{i.nota ? ` · ${i.nota}` : ''}</span>{/each}
			</div>
		</div>
		<div class="flex flex-1 flex-col border-2 border-black">
			<span class="block bg-black px-2 py-[5px] font-pixel text-[9pt] leading-none font-bold tracking-[0.1em] text-white">HISTÓRICO</span>
			<div class="p-2 text-[9.5pt] leading-[1.55]">
				<b>Background:</b> {d.background.id === 'proprio' ? `${d.background.proprio.nome}. ${d.background.proprio.traco}` : bg ? `${bg.nome}. ${bg.traco}` : '—'}<br />
				{#if d.conceito.conceito}<b>Conceito:</b> {d.conceito.conceito}<br />{/if}
				{#if d.time || d.sensei}<b>Time:</b> {d.time || '—'} · <b>Sensei:</b> {d.sensei || '—'}<br />{/if}
				<br /><b>Anotações:</b>
			</div>
			<div class="mx-2 flex flex-col gap-[22px]">
				{#each [1, 2, 3, 4, 5, 6, 7] as n (n)}<div class="border-b border-[#999]"></div>{/each}
			</div>
		</div>
		<span class="text-right text-[8pt] leading-none text-[#555]">2 / 2</span>
	</section>
</div>

<style>
	.folha {
		width: 210mm;
		min-height: 297mm;
		box-sizing: border-box;
		display: flex;
		flex-direction: column;
		gap: 14px;
		padding: 12mm;
		background: #fff;
		color: #000;
		font-family: var(--font-sans);
		line-height: normal;
		print-color-adjust: exact;
		-webkit-print-color-adjust: exact;
	}
	.folha > :global(*) {
		flex-shrink: 0;
	}
	.folha > :global(.flex-1) {
		flex: 1 1 auto;
	}
	@media screen and (max-width: 860px) {
		.folha {
			width: 100%;
			min-height: 0;
			padding: 16px;
		}
	}
	@media print {
		@page {
			size: A4;
			margin: 0;
		}
		:global(body),
		.ficha-print {
			background: #fff !important;
			padding: 0 !important;
			gap: 0 !important;
		}
		.folha {
			break-after: page;
		}
	}
</style>
