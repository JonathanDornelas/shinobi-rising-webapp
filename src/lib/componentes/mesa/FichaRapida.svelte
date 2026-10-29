<script lang="ts" module>
	import type { ArmaMesa, ExtrasNpc, FichaMesa, JutsuMesa, RolagemPronta } from '#lib/mesa/tipos.ts';
	import type { MesaToken, Npc, NpcRevelado } from '#lib/supabase/banco.ts';

	/** O que a ficha rápida mostra, conforme quem olha (planos/mesa-tatica.md, 3.8). */
	export type DadosFicha =
		| { tipo: 'pc'; ficha: FichaMesa; editavel: boolean }
		| { tipo: 'publico'; sub: string }
		| { tipo: 'npc'; npc: Npc; jutsus: JutsuMesa[]; extras: ExtrasNpc | null }
		| { tipo: 'revelado'; npc: NpcRevelado | null }
		| { tipo: 'livre'; editavel: boolean };

	export interface AcoesFicha {
		estadoPc: (f: FichaMesa, patch: Partial<FichaMesa['estado']>, descricao: string) => void;
		pvNpc: (n: Npc, membro: number, pv: number) => void;
		recursoNpc: (n: Npc, membro: number, k: 'pv' | 'pc' | 'pe', valor: number) => void;
		token: (t: MesaToken, patch: Partial<MesaToken>) => void;
		medirJutsu: (t: MesaToken, j: JutsuMesa) => void;
		usarJutsu: (t: MesaToken, j: JutsuMesa, parte?: 'ataque' | 'dano' | 'tudo') => void;
		/** arma: o ataque e o dano em botões separados */
		atacar: (t: MesaToken, a: ArmaMesa, parte: 'ataque' | 'dano') => void;
		/** abre o card inteiro do jutsu (ou o texto da habilidade) num modal */
		verJutsu: (j: JutsuMesa) => void;
		voltarAoNormal: (t: MesaToken) => void;
		/** a ficha inteira numa janela grande (só a própria, ou todas para o Mestre) */
		abrirFichaCompleta: (pid: string) => void;
		aneis: (t: MesaToken, corpo: number, lista: { r: number; rotulo: string }[], titulo: string) => void;
		rolar: (t: MesaToken, r: RolagemPronta, tipo: 'teste' | 'ataque' | 'dano' | 'cura' | 'iniciativa', d20: boolean) => void;
		centralizar: (t: MesaToken) => void;
		remover: (t: MesaToken) => void;
		clone: (t: MesaToken) => void;
		notasNpc: (n: Npc, notas: string) => void;
	}
</script>

<script lang="ts">
	// L11 · M3 · CMP-42 · Ficha rápida: janela arrastável sobre o quadro (quantas quiser), minimizável em chip; no celular, painel
	// inferior em duas alturas. Recursos com o campo "−7 / +5", estados, fadiga, abas de ações, jutsus, perícias e notas.
	import { lembrarTamanho } from '#lib/mesa/tamanho.ts';
	import SeloDt from '../regras/SeloDt.svelte';
	import { CONDICOES } from '#lib/personagem/dados.ts';
	import { curar } from '#lib/personagem/progressao.ts';
	import { teste } from '#lib/rolagens/expressoes.ts';
	import { partesAtributo } from '#lib/rolagens/partes.ts';
	import { corCss } from '#lib/mesa/cores.ts';
	import type { Mesa } from '#lib/mesa/mesa.svelte.ts';
	import { temRegua } from '#lib/mesa/regua.ts';
	import { alcanceCorpo } from '#lib/mesa/geometria.ts';
	import type { FichaAberta, UiMesa } from '#lib/mesa/ui.svelte.ts';
	import Icone from '../ui/Icone.svelte';
	import VerImagem from '../ui/VerImagem.svelte';
	import DadoHud from './DadoHud.svelte';
	import TooltipAcao from './TooltipAcao.svelte';
	import { corElemento } from '#lib/mesa/hud.ts';
	import { estiloFoco, type FocoArte } from '#lib/bestiario/foco.ts';

	let {
		mesa,
		ui,
		token,
		janela,
		dados,
		acoes,
		foto = null,
		foco = null,
		celular = false
	}: { mesa: Mesa; ui: UiMesa; token: MesaToken; janela: FichaAberta; dados: DadosFicha; acoes: AcoesFicha; foto?: string | null; foco?: FocoArte | null; celular?: boolean } = $props();

	let ampliada = $state(false);
	/** O uso de um jutsu em botões: ATAQUE (ou USAR, sem rolagem de ataque) paga o custo; DANO ou CURA rola o efeito. */
	function botoesUso(j: JutsuMesa, falta = false) {
		const custo = j.custo ? `Gasta ${j.custo} ${j.unidade}` : '';
		const b: { n: string; acao: () => void; dica?: string; desab?: boolean }[] = [
			{ n: j.ataque ? 'ATAQUE' : 'USAR', acao: () => acoes.usarJutsu(token, j, 'ataque'), desab: falta, dica: [custo, j.ataque ? 'rola o ataque' : ''].filter(Boolean).join(' e ') || undefined }
		];
		if (j.dano) b.push({ n: 'DANO', acao: () => acoes.usarJutsu(token, j, 'dano'), dica: `Rola o dano${j.resistencia ? ` (${j.resistencia})` : ''}; crítico se o último ataque foi 20 natural` });
		else if (j.cura) b.push({ n: 'CURA', acao: () => acoes.usarJutsu(token, j, 'dano') });
		return b;
	}
	// tooltip de ação (HUD): ao lado da janela, na altura da linha, depois de um instante com o mouse parado
	let dica = $state<{ acao: JutsuMesa | ArmaMesa; ancora: DOMRect } | null>(null);
	let dicaTimer: ReturnType<typeof setTimeout> | undefined;
	function mostrarDica(acao: JutsuMesa | ArmaMesa, linha: HTMLElement) {
		if (celular) return;
		clearTimeout(dicaTimer);
		dicaTimer = setTimeout(() => {
			const j = linha.closest('[role=dialog]')?.getBoundingClientRect() ?? linha.getBoundingClientRect();
			const l = linha.getBoundingClientRect();
			dica = { acao, ancora: new DOMRect(j.left, l.top, j.width, l.height) };
		}, 350);
	}
	function esconderDica() {
		clearTimeout(dicaTimer);
		dica = null;
	}
	const FAIXAS = ['Ileso', 'Ferido', 'Muito ferido', 'Caído'];
	const cor = $derived(corCss(mesa.corDe(mesa.donoDe(token))));
	const dono = $derived(mesa.membro(mesa.donoDe(token)));
	// o Mestre esconde o nome de um NPC (ou ficha de NPC) dos jogadores: eles veem ???
	const nomeAlvo = $derived(mesa.mestre ? (token.npc_id ? { tipo: 'npc' as const, id: token.npc_id } : token.personagem_id && mesa.nomesReais[token.personagem_id] ? { tipo: 'ficha' as const, id: token.personagem_id } : null) : null);
	const nomeEscondido = $derived(!!nomeAlvo && !!mesa.ocultos[nomeAlvo.id]);
	/** Deslocamento do NPC: o da ficha do bestiário (8 m + AGI) ou 10 m */
	const deslNpc = $derived(dados.tipo === 'npc' ? (dados.extras?.deslocamento ?? 10) : 10);
	const ehNpcTropa = $derived(dados.tipo === 'npc' && dados.npc.membros > 1);
	const editavel = $derived(!mesa.somenteLeitura && ((dados.tipo === 'pc' && dados.editavel) || dados.tipo === 'npc' || (dados.tipo === 'livre' && dados.editavel)));
	let alta = $state(false);

	// ------------------------------------------------------------------ números
	const atual = $derived.by(() => {
		if (dados.tipo === 'pc') {
			const e = dados.ficha.estado;
			const m = dados.ficha.max;
			return { pv: e.pv ?? m.pv, pc: e.pc ?? m.pc, pe: e.pe ?? m.pe, max: m, fadiga: e.fadiga ?? 0, condicoes: e.condicoes ?? [] };
		}
		if (dados.tipo === 'npc') {
			const n = dados.npc;
			const i = (token.membro ?? 1) - 1;
			return { pv: n.pv_atual[i] ?? n.pv, pc: n.pc_atual?.[i] ?? n.pc, pe: n.pe_atual?.[i] ?? n.pe ?? 0, max: { pv: n.pv, pc: n.pc, pe: n.pe ?? 0 }, fadiga: 0, condicoes: token.condicoes };
		}
		return { pv: token.pv ?? 1, pc: 0, pe: 0, max: { pv: token.pv_max ?? 1, pc: 0, pe: 0 }, fadiga: 0, condicoes: token.condicoes };
	});
	const barras = $derived(
		(
			[
				['PV', 'pv', 'var(--vermelhao)'],
				['PC', 'pc', '#2d7fb8'],
				['PE', 'pe', '#d29a1e']
			] as const
		)
			.filter(([, k]) => atual.max[k] > 0)
			.map(([rot, k, c]) => ({ rot, k, c, v: atual[k], max: atual.max[k], cheios: Math.max(0, Math.min(10, Math.round((atual[k] / atual.max[k]) * 10))) }))
	);

	/** Recurso do campo rápido: PV, PC ou PE (personagem e NPC; o clone só tem PV). */
	let recurso = $state<'pv' | 'pc' | 'pe'>('pv');
	const recursos = $derived<('pv' | 'pc' | 'pe')[]>(dados.tipo === 'pc' || dados.tipo === 'npc' ? barras.map((b) => b.k) : ['pv']);
	function aplicar() {
		const m = /^\s*([+\-−])\s*(\d+)\s*$/.exec(janela.dano);
		if (!m) {
			ui.avisar('Escreva −7 para tirar ou +5 para devolver.');
			return;
		}
		const k = recursos.includes(recurso) ? recurso : 'pv';
		const delta = (m[1] === '+' ? 1 : -1) * +m[2];
		const max = atual.max[k];
		// o PV pode ir abaixo de zero (até menos o máximo, cap. 4); PC e PE param no zero; a cura de quem está no
		// negativo conta a partir de 0 (Estabilizar Aliado Caído)
		const novo = Math.max(k === 'pv' ? -max : 0, Math.min(max, curar(k, atual[k], delta)));
		const sigla = k.toUpperCase();
		if (dados.tipo === 'pc') {
			const fadiga = k === 'pe' && novo === 0 && atual.pe > 0 ? { fadiga: Math.min(5, atual.fadiga + 1) } : {};
			acoes.estadoPc(dados.ficha, { [k]: novo, ...fadiga }, `${delta > 0 ? '+' : '−'}${Math.abs(delta)} ${sigla} na Mesa. ${sigla} ${novo}/${max}`);
		} else if (dados.tipo === 'npc') acoes.recursoNpc(dados.npc, token.membro ?? 1, k, novo);
		else acoes.token(token, { pv: novo });
		ui.mudarFicha(token.id, { dano: '' });
	}

	function alternarEstado(id: string) {
		const tem = atual.condicoes.includes(id);
		const lista = tem ? atual.condicoes.filter((c) => c !== id) : [...atual.condicoes, id];
		const nome = CONDICOES.find((c) => c.id === id)?.nome ?? id;
		if (dados.tipo === 'pc') acoes.estadoPc(dados.ficha, { condicoes: lista }, `Condição “${nome}” ${tem ? 'removida' : 'marcada'}`);
		else acoes.token(token, { condicoes: lista });
	}

	function fadiga(n: number) {
		if (dados.tipo !== 'pc') return;
		const novo = atual.fadiga === n ? n - 1 : n;
		acoes.estadoPc(dados.ficha, { fadiga: novo }, `Fadiga ${novo}`);
	}

	// ------------------------------------------------------------------ abas
	type Aba = 'acoes' | 'jutsus' | 'habilidades' | 'pericias' | 'equip' | 'notas';
	const abas = $derived<[Aba, string][]>(
		dados.tipo === 'pc' && dados.editavel
			? [['acoes', 'AÇÕES'], ['jutsus', 'JUTSUS'], ['pericias', 'PERÍCIAS'], ['equip', 'EQUIP.'], ['notas', 'NOTAS']]
			: dados.tipo === 'npc'
				? ([
						['acoes', 'AÇÕES'],
						...(dados.jutsus.length ? [['jutsus', 'JUTSUS']] : []),
						...(dados.extras?.habilidades.length ? [['habilidades', 'HABILIDADES']] : []),
						...(dados.extras?.pericias.length ? [['pericias', 'PERÍCIAS']] : []),
						['notas', 'NOTAS']
					] as [Aba, string][])
				: []
	);
	const aba = $derived<Aba | null>((abas.find((a) => a[0] === janela.aba)?.[0] ?? abas[0]?.[0]) || null);

	/** Atributos e perícias de quem tem ficha: o jogador, o NPC de ficha completa e o NPC do bestiário (com as 15 perícias). */
	const atributos = $derived(dados.tipo === 'pc' ? dados.ficha.atributos : dados.tipo === 'npc' ? (dados.extras?.atributos ?? []) : []);
	const pericias = $derived(dados.tipo === 'pc' ? dados.ficha.pericias : dados.tipo === 'npc' ? (dados.extras?.pericias ?? []) : []);
	/** As treinadas primeiro; as outras valem só o atributo. */

	/** Ataque do NPC rápido: "1d20 + 7 → 1d8 + 4" vira dois botões. */
	const ataqueNpc = $derived.by(() => {
		if (dados.tipo !== 'npc') return null;
		const t = dados.npc.ataque.replace(/−/g, '-');
		const a = /1d20\s*([+-]\s*\d+)?/i.exec(t);
		const resto = a ? t.slice(a.index + a[0].length) : t;
		const d = /(\d+d\d+(?:\s*[+-]\s*\d+)?)/i.exec(resto);
		return { ataque: a ? a[0].replace(/\s+/g, '') : null, dano: d ? d[1].replace(/\s+/g, '') : null, texto: dados.npc.ataque };
	});

	// todos os estados do livro, como na ficha completa
	const estadosVisiveis = CONDICOES;
	const sub = $derived(
		dados.tipo === 'pc' ? dados.ficha.sub : dados.tipo === 'publico' ? dados.sub : dados.tipo === 'npc' ? [dados.npc.funcao, `NPC · ${dados.npc.rank}`].filter(Boolean).join(' · ') : dados.tipo === 'revelado' ? (dados.npc?.funcao ?? 'NPC') : 'Ligado ao personagem'
	);

	// ------------------------------------------------------------------ janela arrastável
	let arrasto: { x: number; y: number; jx: number; jy: number } | null = null;
	function pegar(e: PointerEvent) {
		if (celular) return;
		(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
		arrasto = { x: e.clientX, y: e.clientY, jx: janela.x, jy: janela.y };
	}
	function arrastar(e: PointerEvent) {
		if (!arrasto) return;
		ui.mudarFicha(token.id, { x: Math.max(0, arrasto.jx + e.clientX - arrasto.x), y: Math.max(0, arrasto.jy + e.clientY - arrasto.y) });
	}
	/** "9 PC · Médio (30m) · Cone médio (10m)": a área só entra quando diz algo além do alcance. */
	const metaJutsu = (j: JutsuMesa, resistencia = false) =>
		[`${j.custo} ${j.unidade}`, j.alcance, j.area && j.area !== j.alcance ? j.area : null, resistencia ? j.resistencia : null].filter(Boolean).join(' · ');
	/** MEDIR só aparece quando há régua (alcance especial não tem o que medir). */
	const medir = (j: JutsuMesa) => (temRegua(j.regua) ? [{ n: 'MEDIR', acao: () => acoes.medirJutsu(token, j), dica: 'Liga a régua de jutsu' }] : []);
	const falta = (j: JutsuMesa) => j.custo > (j.unidade === 'PE' ? atual.pe : atual.pc);
	const avisoFalta = (j: JutsuMesa) => (falta(j) ? `Faltam ${j.custo - (j.unidade === 'PE' ? atual.pe : atual.pc)} ${j.unidade}` : null);
	const btn = 'min-h-8 border-2 border-field bg-transparent px-2 font-pixel text-[11px] leading-none font-bold text-fg disabled:cursor-not-allowed disabled:opacity-50';
</script>

{#snippet linhaAcao(icone: string | null, nome: string, meta: string, aviso: string | null, botoes: { n: string; acao: () => void; dica?: string; desab?: boolean }[], ver?: () => void, hud?: JutsuMesa | ArmaMesa, exprs?: { ataque: string | null; dano: string | null })}
	<div class="flex items-center gap-2 border-b-2 border-b1 px-3 py-1.5" role="group" onmouseenter={(e) => hud && mostrarDica(hud, e.currentTarget)} onmouseleave={esconderDica}>
		{#if icone}<Icone id={icone} />{/if}
		<div class="flex min-w-0 flex-1 flex-col gap-0.5">
			{#if ver}
				<button type="button" class="self-start text-left text-sm leading-[18px] font-semibold underline decoration-field decoration-dotted underline-offset-[3px] hover:text-title hover:decoration-current" title="Ver o jutsu inteiro" onclick={ver}>{nome}</button>
			{:else}
				<span class="text-sm leading-[18px] font-semibold">{nome}</span>
			{/if}
			{#if hud && (hud.ataque || hud.dano || ('cura' in hud && hud.cura) || ('dt' in hud && hud.dt))}
				{@const el = 'regua' in hud ? corElemento(hud.elemento, hud.nome) : null}
				<span class="flex flex-wrap items-center gap-x-2.5 gap-y-0.5">
					{#if hud.ataque}<DadoHud expr={hud.ataque.expr} tamanho={18} />{/if}
					{#if hud.dano}<DadoHud expr={hud.dano.expr} cor={el?.cor} tamanho={18} />{:else if 'cura' in hud && hud.cura}<DadoHud expr={hud.cura} cor="#7FB069" tamanho={18} />{/if}
					{#if 'dt' in hud && hud.dt}<SeloDt dt={hud.dt} />{/if}
				</span>
			{/if}
			{#if exprs && (exprs.ataque || exprs.dano)}
				<span class="flex flex-wrap items-center gap-x-2.5 gap-y-0.5">
					{#if exprs.ataque}<DadoHud expr={exprs.ataque} tamanho={18} />{/if}
					{#if exprs.dano}<DadoHud expr={exprs.dano} tamanho={18} />{/if}
				</span>
			{/if}
			{#if meta}<span class="text-xs leading-4 text-mut">{meta}</span>{/if}
			{#if aviso}<span class="text-xs leading-4 font-semibold text-warn">{aviso}</span>{/if}
		</div>
		{#each botoes as b (b.n)}
			<button type="button" class="{btn} {celular ? 'min-h-11 px-2.5' : ''}" title={b.dica} disabled={b.desab} onclick={b.acao}>{b.n}</button>
		{/each}
	</div>
{/snippet}

<div
	role="dialog"
	tabindex="-1"
	aria-label="Ficha rápida de {token.nome}"
	class={celular
		? 'absolute inset-x-0 bottom-16 z-20 flex flex-col border-t-2 bg-b2 shadow-[0_-4px_0_var(--b0)]'
		: 'absolute flex h-[560px] max-h-[calc(100%-16px)] min-h-[240px] w-[380px] max-w-[calc(100%-16px)] min-w-[300px] resize flex-col overflow-hidden border-2 bg-b2 shadow-[8px_8px_0_var(--sombra)]'}
	style:border-color={cor}
	style:height={celular ? (alta ? 'calc(100% - 64px)' : '50%') : undefined}
	style:left={celular ? undefined : `${janela.x}px`}
	style:top={celular ? undefined : `${janela.y}px`}
	style:z-index={celular ? undefined : janela.z}
	title={celular ? undefined : 'Arraste o canto de baixo à direita para redimensionar'}
	use:lembrarTamanho={celular ? null : { propria: `rapida:${token.id}`, geral: 'rapida' }}
	onpointerdown={() => ui.focarFicha(token.id)}
>
	{#if celular}
		<button type="button" class="flex h-7 flex-none items-center justify-center" aria-label={alta ? 'Meia altura' : 'Tela cheia'} onclick={() => (alta = !alta)}><span class="h-1.5 w-12 bg-field"></span></button>
	{:else}
		<div class="flex flex-none cursor-move touch-none items-center gap-2 border-b-2 border-b3 bg-b0 py-1 pr-1 pl-2 select-none" role="presentation" onpointerdown={pegar} onpointermove={arrastar} onpointerup={() => (arrasto = null)}>
			<svg width="12" height="20" viewBox="0 0 12 20" aria-hidden="true" class="flex-none fill-mut"><rect x="0" y="2" width="4" height="4" /><rect x="8" y="2" width="4" height="4" /><rect x="0" y="8" width="4" height="4" /><rect x="8" y="8" width="4" height="4" /><rect x="0" y="14" width="4" height="4" /><rect x="8" y="14" width="4" height="4" /></svg>
			<span class="flex-1 font-pixel text-xs leading-none font-bold tracking-[0.1em] text-title">FICHA RÁPIDA</span>
			<button type="button" class="h-8 w-8 font-pixel text-sm" aria-label="Minimizar" title="Minimizar" onpointerdown={(e) => e.stopPropagation()} onclick={() => ui.mudarFicha(token.id, { min: true })}>▁</button>
			<button type="button" class="h-8 w-8 font-pixel text-sm" aria-label="Fechar" title="Fechar" onpointerdown={(e) => e.stopPropagation()} onclick={() => ui.fecharFicha(token.id)}>✕</button>
		</div>
	{/if}

	<div class="flex min-h-0 flex-1 flex-col overflow-auto">
		<div class="flex items-center gap-3 p-3">
			<div class="relative flex h-14 w-14 flex-none items-center justify-center border-[3px] bg-b1 font-pixel text-lg font-bold" style="border-color: {cor}">
				{#if foto}<button type="button" class="relative h-full w-full cursor-zoom-in overflow-hidden p-0" title="Ver a imagem inteira" aria-label="Ver a imagem de {token.nome} inteira" onclick={() => (ampliada = true)}>{#if foco}<img src={foto} alt="" class="[image-rendering:pixelated]" style={estiloFoco(foco)} />{:else}<img src={foto} alt="" class="h-full w-full object-cover" />{/if}</button>{:else}{token.sigla || token.nome.slice(0, 2).toUpperCase()}{/if}
				{#if dados.tipo === 'pc' && dados.ficha.cla}<Icone id="cla/ic-cla-{dados.ficha.cla}" class="absolute -right-3.5 -bottom-3.5" />{/if}
			</div>
			<div class="flex min-w-0 flex-1 flex-col gap-1">
				<span class="font-mincho text-xl leading-[26px] font-bold">{token.nome}</span>
				<span class="text-[13px] leading-[18px] text-mut">{sub}</span>
				<span class="flex flex-wrap items-center gap-1.5">
					<span class="inline-flex items-center gap-1.5 border-2 px-1.5 py-[3px] text-xs leading-none font-semibold" style="border-color: {cor}"><span class="h-2 w-2" style="background: {cor}"></span>{dono?.nome ?? 'Mestre'}</span>
{#if mesa.mestre && mesa.cena?.visao === 'isometrica'}
						<span class="inline-flex items-center border-2 border-b3 font-pixel text-[11px] leading-none font-bold" title="Elevação do token na vista isométrica (visual: o token sobe na tela)">
							<button type="button" class="h-7 w-7" aria-label="Descer o token" disabled={(token.elevacao ?? 0) <= -20} onclick={() => mesa.atualizarToken(token.id, { elevacao: Math.max(-20, (token.elevacao ?? 0) - 1) })}>−</button>
							<span class="min-w-[44px] px-1 text-center">ELEV {token.elevacao ?? 0} m</span>
							<button type="button" class="h-7 w-7" aria-label="Subir o token" disabled={(token.elevacao ?? 0) >= 60} onclick={() => mesa.atualizarToken(token.id, { elevacao: Math.min(60, (token.elevacao ?? 0) + 1) })}>+</button>
						</span>
					{/if}
					{#if nomeAlvo}<button type="button" aria-pressed={nomeEscondido} class="inline-flex min-h-7 items-center gap-1 border-2 px-1.5 font-pixel text-[11px] leading-none font-bold {nomeEscondido ? 'border-warn text-warn' : 'border-b3 hover:border-mut'}" title={nomeEscondido ? 'Os jogadores veem ??? no lugar do nome. Clique para mostrar o nome.' : 'Esconder o nome dos jogadores (eles passam a ver ???)'} onclick={() => nomeAlvo && mesa.definirNomeOculto(nomeAlvo.tipo, nomeAlvo.id, !nomeEscondido)}>{nomeEscondido ? 'NOME: ???' : 'NOME VISÍVEL'}</button>{/if}
					{#if dados.tipo === 'pc'}<button type="button" class="inline-flex min-h-7 items-center gap-1 border-2 border-b3 px-1.5 font-pixel text-[11px] leading-none font-bold hover:border-mut" title="A ficha inteira numa janela grande" onclick={() => dados.tipo === 'pc' && acoes.abrirFichaCompleta(dados.ficha.id)}>FICHA COMPLETA ⤢</button>{/if}
				</span>
			</div>
			{#if celular}<button type="button" class="h-11 w-11 border-2 border-b3 font-pixel text-sm" aria-label="Fechar ficha" onclick={() => ui.fecharFicha(token.id)}>✕</button>{/if}
		</div>

		{#if dados.tipo === 'publico' || dados.tipo === 'revelado'}
			<div class="mx-3 mb-2.5 flex items-center gap-2.5 border-2 border-b3 bg-b1 px-2.5 py-2">
				<span class="font-pixel text-xs leading-none font-bold tracking-[0.08em] text-mut">ESTADO</span>
				<span class="font-pixel text-base leading-none font-bold">{mesa.pvs[token.id]?.pv != null ? `${mesa.pvs[token.id].pv}/${mesa.pvs[token.id].pv_max} PV` : FAIXAS[token.ferimento]}</span>
			</div>
			{#if dados.tipo === 'revelado' && dados.npc}
				<div class="mx-3 mb-2.5 flex flex-col gap-1.5 text-sm leading-5">
					{#if dados.npc.funcao}<span><b>Função:</b> {dados.npc.funcao}</span>{/if}
					{#if dados.npc.aparencia}<span><b>Aparência:</b> {dados.npc.aparencia}</span>{/if}
				</div>
			{/if}
			<span class="mx-3 mb-3 text-xs leading-[17px] text-mut italic">{dados.tipo === 'publico' ? 'Resumo público. Os números ficam com o dono e o Mestre.' : 'Card público do NPC.'}</span>
		{:else}
			{#if ehNpcTropa && dados.tipo === 'npc'}
				<div role="radiogroup" aria-label="Membro da tropa" class="mx-3 mb-2.5 grid grid-cols-4 gap-1">
					{#each mesa.tokens.filter((t) => t.npc_id === dados.npc.id).sort((a, b) => (a.membro ?? 0) - (b.membro ?? 0)) as m (m.id)}
						{@const pv = dados.npc.pv_atual[(m.membro ?? 1) - 1] ?? dados.npc.pv}
						{@const cheios = Math.max(0, Math.round((pv / dados.npc.pv) * 5))}
						<button type="button" role="radio" aria-checked={m.id === token.id} class="flex flex-col items-center gap-1 border-2 px-0.5 py-1.5 {m.id === token.id ? 'border-[var(--vermelhao)] bg-grena' : 'border-b3'}" onclick={() => ui.fichas = ui.fichas.map((f) => (f.token === token.id ? { ...f, token: m.id } : f))}>
							<span class="font-pixel text-sm leading-none font-bold">#{m.membro}</span>
							<span class="flex gap-px">{#each { length: 5 } as _, i (i)}<span class="h-1.5 w-1.5 {i < cheios ? 'bg-[var(--vermelhao)]' : 'bg-b0'}"></span>{/each}</span>
							<span class="font-pixel text-[11px] leading-none font-bold text-mut">{pv}/{dados.npc.pv}</span>
						</button>
					{/each}
				</div>
			{/if}
			<div class="flex flex-col gap-1.5 px-3 pb-2.5">
				{#each barras as b (b.k)}
					<div class="grid grid-cols-[32px_28px_minmax(0,1fr)_56px] items-center gap-1.5">
						<Icone id="recurso/ic-recurso-{b.k}" />
						<span class="font-pixel text-xs leading-none font-bold text-mut">{b.rot}</span>
						<div class="flex h-3.5 gap-0.5 border-2 border-b3 bg-b0 p-0.5">
							{#each { length: 10 } as _, i (i)}<span class="flex-1" style="background: {i < b.cheios ? b.c : 'var(--b0)'}; box-shadow: {i < b.cheios ? 'inset 0 3px 0 rgba(255,255,255,.3)' : 'none'}"></span>{/each}
						</div>
						<span class="t-num text-right font-pixel text-sm leading-none font-bold">{b.v}/{b.max}</span>
					</div>
				{/each}
				{#if editavel}
					<div class="mt-0.5 flex items-center gap-1.5">
						{#if recursos.length > 1}
							<div role="radiogroup" aria-label="Recurso" class="flex flex-none border-2 border-b3">
								{#each recursos as k (k)}
									<button type="button" role="radio" aria-checked={recurso === k} class="h-8 px-1.5 font-pixel text-[11px] font-bold {recurso === k ? 'bg-grena text-papel' : 'text-mut'}" onclick={() => (recurso = k)}>{k.toUpperCase()}</button>
								{/each}
							</div>
						{/if}
						<input
							value={janela.dano}
							oninput={(e) => ui.mudarFicha(token.id, { dano: e.currentTarget.value })}
							onkeydown={(e) => e.key === 'Enter' && aplicar()}
							placeholder="−7 ou +5"
							aria-label="Tirar ou devolver {recurso.toUpperCase()}"
							class="h-9 min-w-0 flex-1 border-2 border-b3 bg-b1 px-2 font-pixel text-[15px] leading-none font-bold text-fg"
						/>
						<button type="button" class={btn} onclick={aplicar}>APLICAR</button>
						{#if dados.tipo === 'pc' && dados.ficha.pd > 0}
							<span class="flex gap-px font-pixel text-[15px] font-bold text-acc" title="{dados.ficha.pd} PD" aria-label="{dados.ficha.pd} Pontos de Destino">{'★'.repeat(dados.ficha.pd)}</span>
						{/if}
					</div>
				{/if}
			</div>

			{#if dados.tipo === 'pc' || dados.tipo === 'npc'}
				{@const est = dados.tipo === 'pc'
					? [['Defesa', String(dados.ficha.defesa), 'recurso/ic-recurso-defesa'], ['Def. mental', String(dados.ficha.defesaMental), 'recurso/ic-recurso-defesa-mental'], ['Iniciativa', `+${dados.ficha.iniciativa}`, 'recurso/ic-recurso-iniciativa'], ['Deslocamento', `${dados.ficha.deslocamento} m`, 'esp/ic-esp-velocidade']]
					: [['Defesa', String(dados.npc.defesa), 'recurso/ic-recurso-defesa'], ['Iniciativa', `${dados.npc.iniciativa >= 0 ? '+' : ''}${dados.npc.iniciativa}`, 'recurso/ic-recurso-iniciativa'], ['Deslocamento', `${dados.extras?.deslocamento ?? 10} m`, 'esp/ic-esp-velocidade']]}
				<div class="mx-3 mb-2.5 grid grid-cols-2 gap-1">
					{#each est as [k, v, ic] (k)}
						<div class="flex items-center gap-1.5 border-2 border-b3 bg-b1 py-0.5 pr-1.5 pl-0.5 odd:last:col-span-2">
							<Icone id={ic} />
							<span class="flex-1 text-xs leading-none font-medium text-mut">{k}</span>
							<b class="font-pixel text-base leading-none whitespace-nowrap">{v}</b>
							{#if k === 'Iniciativa' && editavel}
								<button type="button" class="h-8 w-8 border-2 border-b3 p-0" aria-label="Rolar iniciativa" title="Rolar iniciativa" onclick={() => acoes.rolar(token, { expr: teste(dados.tipo === 'pc' ? dados.ficha.iniciativa : dados.npc.iniciativa), rotulo: 'Iniciativa', partes: [] }, 'iniciativa', true)}><Icone id="dado/ic-dado-d20" class="-m-0.5" /></button>
							{/if}
						</div>
					{/each}
				</div>
			{/if}

			{#if atributos.length}
				<div role="group" aria-label="Atributos" class="mx-3 mb-2.5 grid grid-cols-6 gap-1">
					{#each atributos as a (a.sigla)}
						<button type="button" class="flex flex-col items-center gap-0.5 border-2 border-b3 bg-b1 py-1 enabled:hover:border-mut disabled:cursor-default {celular ? 'min-h-11' : ''}" title="{a.nome} {a.valor}: rolar um teste ({teste(a.valor)})" aria-label="{a.nome} {a.valor}, rolar um teste" disabled={!editavel} onclick={() => acoes.rolar(token, { expr: teste(a.valor), rotulo: `Teste de ${a.nome}`, partes: partesAtributo(a.sigla, a.valor) }, 'teste', true)}>
							<span class="font-pixel text-[10px] leading-none font-bold text-mut">{a.sigla}</span>
							<b class="font-pixel text-base leading-none">{a.valor}</b>
						</button>
					{/each}
				</div>
			{/if}

			{#if mesa.mestre && !mesa.somenteLeitura}
				<!-- tamanho no quadro (cap. 4): o do bestiário entra sozinho; o Mestre ajusta ou encolhe para caber -->
				<div class="mx-3 mb-2.5 flex items-center gap-1.5">
					<span class="font-pixel text-[11px] leading-none font-bold tracking-[0.06em] text-mut">TAMANHO</span>
					<div role="radiogroup" aria-label="Tamanho no quadro" class="flex border-2 border-b3">
						{#each [[1, '1×1'], [3, '3×3'], [6, '6×6'], [10, '10×10']] as const as [n, rot] (n)}
							<button type="button" role="radio" aria-checked={token.tamanho === n} class="h-8 px-2 font-pixel text-[11px] font-bold {token.tamanho === n ? 'bg-grena text-papel' : 'text-mut'}" onclick={() => {
								const L = mesa.cena?.largura ?? 40;
								const A = mesa.cena?.altura ?? 30;
								// o tamanho escolhido aqui vira o normal (desfaz o crescido por jutsu)
								acoes.token(token, { tamanho: n, tamanho_base: null, crescido_turnos: null, x: Math.max(0, Math.min(token.x, L - n)), y: Math.max(0, Math.min(token.y, A - n)) });
							}}>{rot}</button>
						{/each}
					</div>
				</div>
			{/if}
			{#if token.tamanho_base != null}
				<!-- crescido por um jutsu (Baika no Jutsu): volta sozinho quando os turnos acabam -->
				<div class="mx-3 mb-2.5 flex items-center gap-2 border-2 border-[var(--acc)] bg-b1 py-1 pr-1 pl-2">
					<span class="flex-1 text-xs leading-4 font-semibold">Crescido: {token.tamanho}×{token.tamanho}{token.crescido_turnos != null ? `, faltam ${token.crescido_turnos} ${token.crescido_turnos === 1 ? 'turno' : 'turnos'}` : ''}</span>
					{#if editavel}<button type="button" class={btn} onclick={() => acoes.voltarAoNormal(token)}>VOLTAR AO NORMAL</button>{/if}
				</div>
			{/if}
			{#if editavel}
				<div class="mx-3 mb-2.5 flex flex-wrap gap-1">
					{#each estadosVisiveis as s (s.id)}
						{@const on = atual.condicoes.includes(s.id)}
						<button type="button" aria-pressed={on} title={s.efeito} class="flex min-h-9 items-center gap-0.5 border-2 pr-2 text-xs leading-none font-semibold {on ? 'border-[var(--vermelhao)] bg-grena' : 'border-b3'}" onclick={() => alternarEstado(s.id)}>
							<Icone id="estado/ic-estado-{s.id}" />{on ? '✓ ' : ''}{s.nome}
						</button>
					{/each}
				</div>
			{/if}
			{#if dados.tipo === 'pc' && editavel}
				<div class="mx-3 mb-2.5 flex items-center gap-1.5">
					<Icone id="recurso/ic-recurso-fadiga" />
					<span class="font-pixel text-xs leading-none font-bold text-mut">FADIGA</span>
					{#each { length: 5 } as _, i (i)}<button type="button" aria-label="Fadiga {i + 1}" class="h-5 w-5 border-2 border-field p-0 {i < atual.fadiga ? 'bg-warn' : 'bg-b0'}" onclick={() => fadiga(i + 1)}></button>{/each}
				</div>
			{/if}

			{#if abas.length && aba}
				<div role="tablist" class="sticky top-0 z-10 flex border-y-2 border-b3 bg-b0">
					{#each abas as [id, n] (id)}
						<button type="button" role="tab" aria-selected={aba === id} class="flex-1 font-pixel text-[11px] leading-none font-bold tracking-[0.05em] {celular ? 'min-h-11' : 'min-h-9'} {aba === id ? 'bg-b2 text-title' : 'text-mut'}" onclick={() => ui.mudarFicha(token.id, { aba: id })}>{n}</button>
					{/each}
				</div>
				{#if aba === 'acoes' && dados.tipo === 'pc'}
					{#each dados.ficha.armas as a, i (`${i}:${a.nome}`)}
						{@render linhaAcao(null, a.nome, a.rotuloAlcance, null, [
							{ n: 'MEDIR', acao: () => acoes.aneis(token, a.alcance <= 2 ? a.alcance : 0, a.alcance > 2 ? [{ r: a.alcance, rotulo: `${a.nome} · ${a.alcance} m` }] : [], a.nome) },
							{ n: 'ATAQUE', acao: () => acoes.atacar(token, a, 'ataque') }, ...(a.dano ? [{ n: 'DANO', acao: () => acoes.atacar(token, a, 'dano'), dica: 'Crítico se o último ataque foi 20 natural' }] : [])
						], undefined, a)}
					{/each}
					{#each dados.ficha.jutsus.filter((j) => j.ataque || j.dano || j.resistencia).slice(0, 4) as j (j.slug)}
						{@render linhaAcao(`rank/ic-rank-${j.rank.toLowerCase()}`, j.nome, metaJutsu(j), avisoFalta(j), [...medir(j), ...botoesUso(j, falta(j))], () => acoes.verJutsu(j), j)}
					{/each}
					{@render linhaAcao('recurso/ic-recurso-pe', 'Esquiva Ativa', 'Reação · 10 PE · Acrobacia vira a Defesa', null, [{ n: 'USAR', acao: () => acoes.estadoPc(dados.ficha, { pe: Math.max(0, atual.pe - 10) }, 'Esquiva Ativa: −10 PE'), desab: atual.pe < 10 }])}
					{@render linhaAcao('recurso/ic-recurso-defesa', 'Defesa Total', 'Ação primária · +5 na Defesa e na Defesa Mental até o seu próximo turno', null, [])}
					{@render linhaAcao('pericia/ic-pericia-taijutsu', 'Combo Taijutsu', 'Ação secundária · 5 PE · segundo ataque com −5, só Taijutsu ou desarmado', null, [{ n: 'USAR', acao: () => acoes.estadoPc(dados.ficha, { pe: Math.max(0, atual.pe - 5) }, 'Combo Taijutsu: −5 PE'), desab: atual.pe < 5 }])}
					<div class="flex flex-wrap gap-1 px-3 py-2">
						<button type="button" class={btn} onclick={() => acoes.aneis(token, 0, [{ r: dados.ficha.deslocamento, rotulo: `Mover · ${dados.ficha.deslocamento} m` }, { r: dados.ficha.deslocamento * 2, rotulo: `Com sprint · ${dados.ficha.deslocamento * 2} m` }], 'Deslocamento')}>DESLOCAMENTO</button>
						{#each dados.ficha.distancias as [n, r] (n)}<button type="button" class={btn} onclick={() => acoes.aneis(token, 0, [{ r, rotulo: `${n} · ${r} m` }], n)}>{n.toUpperCase()}</button>{/each}
					</div>
				{:else if aba === 'acoes' && dados.tipo === 'npc' && dados.extras?.ataques.length}
					{#each dados.extras.ataques as a, i (`${i}:${a.nome}`)}
						{@render linhaAcao(null, a.nome, a.rotuloAlcance, null, [
							{ n: 'MEDIR', acao: () => acoes.aneis(token, a.alcance <= 2 ? Math.max(a.alcance, alcanceCorpo(token.tamanho)) : 0, a.alcance > 2 ? [{ r: a.alcance, rotulo: `${a.nome} · ${a.alcance} m` }] : [], a.nome) },
							{ n: 'ATAQUE', acao: () => acoes.atacar(token, a, 'ataque') }, ...(a.dano ? [{ n: 'DANO', acao: () => acoes.atacar(token, a, 'dano'), dica: 'Crítico se o último ataque foi 20 natural' }] : [])
						], undefined, a)}
					{/each}
					<div class="flex flex-wrap gap-1 px-3 py-2">
						<button type="button" class={btn} onclick={() => acoes.aneis(token, alcanceCorpo(token.tamanho), [{ r: deslNpc, rotulo: `Mover · ${deslNpc} m` }, { r: 2 * deslNpc, rotulo: `Com sprint · ${2 * deslNpc} m` }], 'Deslocamento')}>DESLOCAMENTO</button>
					</div>
				{:else if aba === 'habilidades' && dados.tipo === 'npc' && dados.extras}
					{#each dados.extras.habilidades as h (h.slug)}
						{@const usada = ui.usadas.includes(`${token.id}:${h.slug}`)}
						{@const usavel = !!(h.dano || h.cura || h.resistencia)}
						{@render linhaAcao('callout/ic-callout-destaque', h.nome, h.texto ?? '', h.porCena ? (usada ? 'Já usada nesta cena' : 'Uma vez por cena') : null, [
							...(temRegua(h.regua) ? [{ n: 'MEDIR', acao: () => acoes.medirJutsu(token, h), dica: `${h.area} · ${h.alcance}` }] : []),
							...(usavel ? botoesUso(h) : [])
						], () => acoes.verJutsu(h), h)}
					{/each}
				{:else if aba === 'acoes' && dados.tipo === 'npc' && ataqueNpc}
					{@render linhaAcao(null, 'Ataque', ataqueNpc.texto || 'Sem ataque anotado', null, [
						...(ataqueNpc.ataque ? [{ n: 'ATAQUE', acao: () => acoes.rolar(token, { expr: ataqueNpc!.ataque!, rotulo: `Ataque · ${token.nome}`, partes: [] }, 'ataque', true) }] : []),
						...(ataqueNpc.dano ? [{ n: 'DANO', acao: () => acoes.rolar(token, { expr: ataqueNpc!.dano!, rotulo: `Dano · ${token.nome}`, partes: [] }, 'dano', false) }] : [])
					], undefined, undefined, ataqueNpc.ataque || ataqueNpc.dano ? { ataque: ataqueNpc.ataque, dano: ataqueNpc.dano } : undefined)}
					{#if dados.npc.especial}{@render linhaAcao(null, 'Especial', dados.npc.especial, null, [])}{/if}
					<div class="flex flex-wrap gap-1 px-3 py-2">
						<button type="button" class={btn} onclick={() => acoes.aneis(token, alcanceCorpo(token.tamanho), [{ r: deslNpc, rotulo: `Mover · ${deslNpc} m` }, { r: 2 * deslNpc, rotulo: `Com sprint · ${2 * deslNpc} m` }], 'Deslocamento')}>DESLOCAMENTO</button>
					</div>
				{:else if aba === 'jutsus' && dados.tipo === 'npc'}
					{#each dados.jutsus as j (j.slug)}
						{@render linhaAcao(`rank/ic-rank-${j.rank.toLowerCase()}`, j.nome, metaJutsu(j, true), avisoFalta(j), [...medir(j), ...botoesUso(j, falta(j))], () => acoes.verJutsu(j), j)}
					{/each}
				{:else if aba === 'jutsus' && dados.tipo === 'pc'}
					{#each dados.ficha.jutsus as j (j.slug)}
						{@render linhaAcao(`rank/ic-rank-${j.rank.toLowerCase()}`, j.nome, metaJutsu(j), avisoFalta(j), [...medir(j), ...botoesUso(j, falta(j))], () => acoes.verJutsu(j), j)}
					{/each}
				{:else if aba === 'pericias'}
					<!-- como a aba Perícias da ficha completa: atributo, treino, bônus e total, na ordem do livro -->
					<div role="table" aria-label="Perícias">
						<div role="row" class="grid grid-cols-[minmax(0,1fr)_64px_44px_76px] gap-2 bg-vermelhao px-3 py-2 font-pixel text-[11px] leading-4 font-bold tracking-[0.08em] text-white">
							<span role="columnheader">PERÍCIA</span><span role="columnheader">ATRIB.</span><span role="columnheader">TREINO</span><span role="columnheader" class="text-right">TOTAL</span>
						</div>
						{#each pericias as p, i (p.nome)}
							<div role="row" class="grid grid-cols-[minmax(0,1fr)_64px_44px_76px] items-center gap-2 px-3 py-1" style:background={i % 2 ? 'var(--b1)' : 'var(--b2)'}>
								<span role="cell" class="flex min-w-0 flex-col gap-1">
									<span class="flex min-w-0 items-center gap-1.5 text-sm leading-[18px] font-medium">
										<Icone id="pericia/ic-pericia-{p.id}" class="h-6 w-6 flex-none" /><span class="truncate">{p.nome}</span>{#if p.combate}<span title="Perícia de combate" class="border-2 border-b3 px-1 py-0.5 font-pixel text-[10px] leading-none text-mut">⚔</span>{/if}
									</span>
									{#if p.bonus.length}<span class="flex flex-wrap gap-1">{#each p.bonus as b, j (j)}<span class="border-2 border-[rgba(217,168,43,.5)] bg-[rgba(217,168,43,.14)] px-1 py-0.5 text-[11px] leading-none font-semibold">{b.fonte} +{b.valor}</span>{/each}</span>{/if}
								</span>
								<span role="cell" class="justify-self-start border-2 border-b3 px-1 py-0.5 font-pixel text-[11px] leading-none font-semibold">{p.atributo} {p.valorAtributo >= 0 ? '+' : ''}{p.valorAtributo}{#if p.distancia}<br /><span class="text-mut">{p.distancia.atributo}</span>{/if}</span>
								<span role="cell" class="t-num text-sm text-mut">+{p.treino}</span>
								<span role="cell" class="flex flex-col items-end gap-0.5">
									<span class="flex items-center gap-1.5">
										<span class="t-num text-xl leading-none">{p.total >= 0 ? '+' : ''}{p.total}</span>
										<button type="button" class="flex h-8 w-8 flex-none items-center justify-center border-2 border-field disabled:opacity-50 {celular ? 'h-11 w-11' : ''}" title="Rolar {p.nome}" aria-label="Rolar {p.nome}" disabled={!editavel} onclick={() => acoes.rolar(token, { expr: p.expr, rotulo: p.nome, partes: p.partes }, 'teste', true)}><Icone id="dado/ic-dado-d20" class="h-6 w-6" /></button>
									</span>
									{#if p.distancia}
										{@const d = p.distancia}
										<span class="flex items-center gap-1.5" title="À distância ({d.atributo})">
											<span class="t-num text-sm text-mut">{d.total >= 0 ? '+' : ''}{d.total}</span>
											<button type="button" class="flex h-8 w-8 flex-none items-center justify-center border-2 border-field disabled:opacity-50 {celular ? 'h-11 w-11' : ''}" title="Rolar {p.nome} à distância" aria-label="Rolar {p.nome} à distância" disabled={!editavel} onclick={() => acoes.rolar(token, { expr: d.expr, rotulo: `${p.nome} à distância`, partes: d.partes }, 'teste', true)}><Icone id="dado/ic-dado-d20" class="h-6 w-6" /></button>
										</span>
									{/if}
								</span>
							</div>
						{/each}
					</div>
				{:else if aba === 'equip' && dados.tipo === 'pc'}
					{@const f = dados.ficha}
					<div class="flex items-center gap-3 border-b-2 border-b1 px-3 py-2 text-xs font-semibold">
						<span class="flex items-center gap-1"><Icone id="recurso/ic-recurso-carga" />Carga <b class="font-pixel text-sm" style:color={f.carga.atual > f.carga.max ? 'var(--warn)' : undefined}>{String(f.carga.atual).replace('.', ',')} / {f.carga.max}</b></span>
						<span class="flex items-center gap-1"><Icone id="recurso/ic-recurso-ryo" />Ryo <b class="font-pixel text-sm">{f.ryo.toLocaleString('pt-BR')}</b></span>
					</div>
					{#each ['Armas', 'Itens', 'Pergaminhos', 'Outros'] as g (g)}
						{@const itens = f.inventario.filter((i) => i.grupo === g)}
						{#if itens.length}
							<span class="px-3 pt-2 pb-1 font-pixel text-[11px] leading-none font-bold tracking-[0.08em] text-title">{g.toUpperCase()}</span>
							{#each itens as i, n (n)}
								<div class="flex items-center gap-2 border-b-2 border-b1 px-3 py-1">
									<Icone id={i.icone} />
									<span class="flex min-w-0 flex-1 flex-col"><span class="text-sm leading-[18px] font-semibold">{i.nome}</span>{#if i.nota || i.selado}<span class="text-xs leading-4 text-mut">{[i.selado ? 'Selado num pergaminho' : '', i.nota ?? ''].filter(Boolean).join(' · ')}</span>{/if}</span>
									<b class="font-pixel text-sm">×{i.qtd}</b>
								</div>
							{/each}
						{/if}
					{:else}
						<span class="px-3 py-2.5 text-sm text-mut">Mochila vazia.</span>
					{/each}
					<span class="px-3 py-2 text-xs leading-4 text-mut">Para comprar, selar ou mexer nos itens, abra a ficha completa.</span>
				{:else if aba === 'notas'}
					<div class="flex flex-col gap-2 px-3 py-2.5">
						{#if dados.tipo === 'npc'}
							{#each [['Especial', dados.npc.especial], ['Tags', dados.npc.tags.join(', ')], ['Quer', dados.npc.quer], ['Segredo', dados.npc.segredo]].filter((x) => x[1]) as [k, v] (k)}
								<div class="flex flex-col gap-0.5"><span class="font-pixel text-[11px] leading-none font-bold tracking-[0.08em] text-title">{k.toUpperCase()}</span><span class="text-[13px] leading-[18px]">{v}</span></div>
							{/each}
							<label class="flex flex-col gap-1">
								<span class="font-pixel text-[11px] leading-none font-bold tracking-[0.08em] text-mut">NOTAS DO MESTRE</span>
								<textarea rows="3" class="resize-y border-2 border-b3 bg-b1 p-2 text-[13px] leading-[18px] text-fg" value={dados.npc.notas} onchange={(e) => acoes.notasNpc(dados.npc, e.currentTarget.value)}></textarea>
							</label>
						{:else if dados.tipo === 'pc'}
							<span class="font-pixel text-[11px] leading-none font-bold tracking-[0.08em] text-mut">ANOTAÇÕES DA FICHA</span>
							<p class="text-[13px] leading-[18px] whitespace-pre-line">{dados.ficha.notas || 'Nada anotado ainda. As anotações ficam na ficha completa.'}</p>
						{/if}
					</div>
				{/if}
			{/if}
		{/if}
	</div>

	<div class="flex flex-none flex-wrap gap-x-3 gap-y-1 border-t-2 border-b3 bg-b1 px-3 py-1.5">
		{#if dados.tipo === 'pc'}<a class="min-h-8 text-xs leading-8 font-semibold text-link underline underline-offset-[3px]" href="/campanhas/{mesa.campanha}/personagens/{dados.ficha.id}" target="_blank" rel="noopener" title="A página da ficha, numa aba nova">Ficha em nova aba ↗</a>{/if}
		{#if dados.tipo === 'npc'}<a class="min-h-8 text-xs leading-8 font-semibold text-link underline underline-offset-[3px]" href="/campanhas/{mesa.campanha}/npcs" target="_blank" rel="noopener" title="A lista de NPCs, numa aba nova">NPCs ↗</a>{/if}
		<button type="button" class="min-h-8 text-xs font-semibold text-link underline underline-offset-[3px]" title="Centralizar o quadro neste token" onclick={() => acoes.centralizar(token)}>Centralizar</button>
		{#if (dados.tipo === 'pc' && dados.editavel && token.dono_id === mesa.eu) || (mesa.mestre && dados.tipo === 'pc')}
			<button type="button" class="min-h-8 text-xs font-semibold text-link underline underline-offset-[3px]" title="Criar um clone ligado a este token" onclick={() => acoes.clone(token)}>Clonar</button>
		{/if}
		{#if mesa.mestre || (token.ligado_a && token.dono_id === mesa.eu)}
			<button type="button" class="ml-auto min-h-8 text-xs font-semibold text-link underline underline-offset-[3px]" title="Tirar este token da cena" onclick={() => acoes.remover(token)}>Remover</button>
		{/if}
	</div>
</div>

{#if ampliada && foto}<VerImagem src={foto} alt={token.nome} aoFechar={() => (ampliada = false)} />{/if}
{#if dica}<TooltipAcao acao={dica.acao} ancora={dica.ancora} />{/if}
