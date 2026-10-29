<script lang="ts">
	// P3 · Perícias (somente leitura: mudam ao subir de nível) e proficiências com os pips de nível (CMP-15).
	import { NIVEIS_PROFICIENCIA, TIPOS_PROFICIENCIA, custoProficiencia } from '#lib/personagem/dados.ts';
	import type { FichaJogo } from '#lib/personagem/ficha.svelte.ts';
	import { rotuloAlvo } from '#lib/personagem/progressao.ts';
	import { periciasComKkg } from '#lib/personagem/kkg.ts';
	import { linhasPericia, sinal } from '#lib/personagem/regras.ts';
	import { teste } from '#lib/rolagens/expressoes.ts';
	import { partesPericia } from '#lib/rolagens/partes.ts';
	import Icone from '../ui/Icone.svelte';
	import BotaoRolar from '../rolagens/BotaoRolar.svelte';

	let { f }: { f: FichaJogo } = $props();
	// com a KKG ligada, o bônus dela entra como mais um bônus da linha (Percepção do Byakugan e do Sharingan)
	const linhas = $derived(periciasComKkg(linhasPericia(f.dados), f.kkg?.def ?? null, f.estado.kkg, f.calc.nivel));
	const profs = $derived(f.calc.proficiencias);
</script>

<div class="grid items-start gap-5 xl:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
	<div class="painel-sombra" role="table" aria-label="Perícias">
		<div role="row" class="grid {f.editavel ? 'grid-cols-[minmax(0,1fr)_44px_104px]' : 'grid-cols-[minmax(0,1fr)_44px_64px]'} gap-2 bg-vermelhao px-3.5 py-2.5 md:gap-3 font-pixel text-xs leading-4 font-bold tracking-[0.08em] text-white {f.editavel ? 'md:grid-cols-[minmax(0,1fr)_88px_64px_minmax(0,1.1fr)_112px]' : 'md:grid-cols-[minmax(0,1fr)_88px_64px_minmax(0,1.1fr)_64px]'}">
			<span role="columnheader">PERÍCIA</span><span role="columnheader" class="max-md:hidden">ATRIB.</span><span role="columnheader">TREINO</span><span role="columnheader" class="max-md:hidden">BÔNUS</span><span role="columnheader" class="text-right">TOTAL</span>
		</div>
		{#each linhas as p, i (p.id)}
			<div role="row" class="grid {f.editavel ? 'grid-cols-[minmax(0,1fr)_44px_104px]' : 'grid-cols-[minmax(0,1fr)_44px_64px]'} items-center gap-2 px-3.5 py-0.5 md:gap-3 {f.editavel ? 'md:grid-cols-[minmax(0,1fr)_88px_64px_minmax(0,1.1fr)_112px]' : 'md:grid-cols-[minmax(0,1fr)_88px_64px_minmax(0,1.1fr)_64px]'}" style:background={i % 2 ? 'var(--b1)' : 'var(--b2)'}>
				<span role="cell" class="flex min-w-0 items-center gap-2 text-[15px] leading-5 font-medium">
					<Icone id="pericia/ic-pericia-{p.id}" /><span class="truncate">{p.nome}</span>{#if p.combate}<span title="Perícia de combate" class="border-2 border-b3 px-1 py-0.5 font-pixel text-xs text-mut">⚔</span>{/if}
				</span>
				<span role="cell" class="justify-self-start border-2 border-b3 px-1.5 py-1 font-pixel text-xs leading-none font-semibold max-md:hidden">{p.atributo} {sinal(p.valorAtributo)}{#if p.distancia}<br /><span class="text-mut">{p.distancia.atributo} {sinal(p.distancia.valor)}</span>{/if}</span>
				<span role="cell" class="t-num text-base text-mut">+{p.treino}</span>
				<div role="cell" class="flex flex-wrap gap-1 max-md:hidden">
					{#each p.bonus as b, j (j)}<span class="border-2 border-[rgba(217,168,43,.5)] bg-[rgba(217,168,43,.14)] px-1.5 py-1 text-xs leading-none font-semibold">{b.fonte} +{b.valor}</span>{/each}
				</div>
				<span role="cell" class="flex flex-col items-end gap-1 py-1">
					<span class="flex items-center gap-2"><span class="t-num text-2xl leading-none">{sinal(p.total)}</span>{#if f.editavel}<BotaoRolar class="w-9" expressao={teste(p.total)} rotulo="Perícia · {p.nome}" personagem={f.id} d20 tipo="teste" origem="Ficha · Perícias" partes={partesPericia(p)} />{/if}</span>
					{#if p.distancia}<span class="flex items-center gap-2" title="À distância ({p.distancia.atributo})"><span class="t-num text-sm text-mut">{sinal(p.distancia.total)}</span>{#if f.editavel}<BotaoRolar class="w-9" expressao={teste(p.distancia.total)} rotulo="Perícia · {p.nome} à distância" personagem={f.id} d20 tipo="teste" origem="Ficha · Perícias" partes={partesPericia(p, true)} />{/if}</span>{/if}
				</span>
			</div>
		{/each}
	</div>
	<div class="flex flex-col gap-3">
		<div class="flex items-center gap-2">
			<h3 class="t-rotulo m-0 flex-1">Proficiências · {profs.length} / 5</h3>
			<span class="text-xs text-mut">Mestre {profs.filter((p) => p.nivel >= 4).length}/3 · Lendário {profs.filter((p) => p.nivel >= 5).length}/1</span>
		</div>
		{#each profs as p (p.tipo + p.alvo)}
			{@const tipo = TIPOS_PROFICIENCIA.find((t) => t.id === p.tipo)}
			<div class="painel-sombra flex flex-col gap-2.5 p-3">
				<div class="flex items-center gap-2">
					<Icone id={p.tipo === 'jutsu' ? 'rank/ic-rank-c' : p.tipo === 'arma' ? 'arma/ic-arma-kunai' : 'equip/ic-equip-kit'} />
					<span class="flex-1 font-mincho text-[17px] leading-[22px] font-bold">{rotuloAlvo(p.tipo, p.alvo, f.catalogo.jutsus)}</span>
					<span class="font-pixel text-xs font-semibold text-mut">{custoProficiencia(p.tipo, p.nivel)} PT</span>
				</div>
				<div class="grid grid-cols-5 gap-[3px]" aria-label="Nível {NIVEIS_PROFICIENCIA[p.nivel - 1].nome}">
					{#each NIVEIS_PROFICIENCIA as n (n.id)}
						<div class="flex flex-col items-center gap-1">
							<div class="h-4 w-full border-2" style:background={n.id <= p.nivel ? 'var(--vermelhao)' : 'transparent'} style:border-color={n.id <= p.nivel ? 'var(--ink)' : 'var(--b3)'}></div>
							<span class="text-xs leading-none font-medium" class:text-mut={n.id > p.nivel}>{n.nome}</span>
						</div>
					{/each}
				</div>
				<span class="text-[13px] leading-[18px]">+{NIVEIS_PROFICIENCIA[p.nivel - 1].bonus} na rolagem · {tipo?.beneficio}</span>
			</div>
		{:else}
			<p class="m-0 text-sm text-mut">Nenhuma proficiência ainda. Treine com PT para começar uma.</p>
		{/each}
	</div>
</div>
