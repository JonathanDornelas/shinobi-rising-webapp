<script lang="ts">
	// J2 · Criador de jutsu (cap. 20): construtor em acordeão à esquerda e prévia fixa à direita, com PJ, rank e custo ao
	// vivo. Também é a habilidade (J3) em edição/leitura e a tela em que o Mestre decide. Salva sozinho.
	import { onDestroy, type Snippet } from 'svelte';
	import { goto } from '$app/navigation';
	import ListaComponentes from '#lib/componentes/jutsu/ListaComponentes.svelte';
	import ReguaRank from '#lib/componentes/jutsu/ReguaRank.svelte';
	import CardJutsu from '#lib/componentes/regras/CardJutsu.svelte';
	import Alerta from '#lib/componentes/ui/Alerta.svelte';
	import Campo from '#lib/componentes/ui/Campo.svelte';
	import Girando from '#lib/componentes/ui/Girando.svelte';
	import Icone from '#lib/componentes/ui/Icone.svelte';
	import IndicadorSalvo, { type EstadoSalvo } from '#lib/componentes/ui/IndicadorSalvo.svelte';
	import Modal from '#lib/componentes/ui/Modal.svelte';
	import { CriadorJutsu } from '#lib/jutsus/criador.svelte.ts';
	import { ACOES, ALCANCES, ALVO_EXTRA, APOIO, AREAS, ATRIBUTO_DO_TIPO, DADOS, EFEITOS, MODIFICADORES, SECOES_JUTSU, SELOS, TIPOS, pjDoDano } from '#lib/jutsus/dados.ts';
	import { analisarHabilidade, CAMPOS_INFO, dtDoJutsu, habilidadeVazia, jutsuVazio, type HabilidadeDados, type JutsuDados } from '#lib/jutsus/regras.ts';
	import { hrefJutsu, hrefJutsus, STATUS_CRIACAO } from '#lib/jutsus/status.ts';
	import { TIPO_JUTSU } from '#lib/livro/dominio.ts';
	import { ELEMENTOS } from '#lib/personagem/dados.ts';
	import { atributosTotais, elementos, normalizarFicha, recursos, sinal, type FichaDados } from '#lib/personagem/regras.ts';
	import { toasts } from '#lib/estado/toasts.svelte.ts';
	import { dataCurta } from '#lib/formatar.ts';
	import { supabase } from '#lib/supabase/cliente.ts';
	import type { Json, StatusCriacao } from '#lib/supabase/banco.ts';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	// svelte-ignore state_referenced_locally
	const j0 = data.jutsu;
	// svelte-ignore state_referenced_locally
	const k = data.campanha;
	const habilidade = j0.tipo === 'habilidade';
	const status = $derived(data.jutsu.status as StatusCriacao);
	const revisando = $derived(data.papel === 'mestre' && !data.dono && status === 'em_revisao');
	const souMestre = $derived(data.papel === 'mestre');

	// ---------------------------------------------------------------- contexto: ficha ou carta do clã
	// svelte-ignore state_referenced_locally
	const fichaCalc = data.ficha ? normalizarFicha(data.ficha.dados as Partial<FichaDados>) : null;
	const contexto = (ficha: typeof data.ficha) => {
		if (ficha && fichaCalc) {
			const r = recursos(fichaCalc);
			return { nome: ficha.nome, nivel: ficha.nivel, pcMax: r.pc, peMax: r.pe, elementos: elementos(fichaCalc) };
		}
		return { rankCarta: (data.cla?.carta?.rank as never) ?? null };
	};
	// svelte-ignore state_referenced_locally
	const origem = data.cla ? `Clã ${data.cla.nome}` : data.ficha ? (data.ficha.nome ?? 'Criação própria') : 'Criação da campanha';
	// svelte-ignore state_referenced_locally
	const c = new CriadorJutsu(data.jutsuDados ?? jutsuVazio(), contexto(data.ficha), origem, data.editavel && !habilidade);
	// svelte-ignore state_referenced_locally
	const h: HabilidadeDados = $state(data.habilidadeDados ?? habilidadeVazia());
	const analiseHab = $derived(analisarHabilidade(h));
	const bloqueios = $derived(habilidade ? analiseHab.bloqueios : c.analise.bloqueios);
	const verificacoes = $derived(habilidade ? analiseHab.verificacoes : c.analise.verificacoes);
	const dt = $derived(fichaCalc && c.dados.tipo ? dtDoJutsu(c.calc, atributosTotais(fichaCalc)[ATRIBUTO_DO_TIPO[c.dados.tipo]]) : null);

	// ---------------------------------------------------------------- salvamento automático
	let salvo = $state<EstadoSalvo>({ tipo: 'ocioso' });
	let temporizador: ReturnType<typeof setTimeout> | undefined;
	let primeira = true;
	let pendente: Promise<void> | null = null;

	async function salvar() {
		clearTimeout(temporizador);
		temporizador = undefined;
		if (!data.editavel) return;
		salvo = { tipo: 'salvando' };
		const dados = habilidade ? ($state.snapshot(h) as HabilidadeDados) : ($state.snapshot(c.dados) as JutsuDados);
		const { error } = await supabase()
			.from('jutsus_criados')
			.update({
				nome: dados.nome.trim(),
				rank: habilidade ? null : c.calc.rank,
				dados: dados as unknown as Json,
				resumo: (habilidade ? { nome: dados.nome.trim(), origem } : c.resumo) as unknown as Json,
				mensagem: dados.mensagem.trim() || null
			})
			.eq('id', j0.id);
		salvo = error ? { tipo: 'erro', texto: 'Não foi possível salvar. Tentando de novo…' } : { tipo: 'salvo', em: Date.now() };
		if (error) temporizador = setTimeout(salvar, 4000);
	}
	$effect(() => {
		JSON.stringify(habilidade ? h : c.dados);
		if (primeira) {
			primeira = false;
			return;
		}
		if (!data.editavel) return;
		clearTimeout(temporizador);
		temporizador = setTimeout(() => (pendente = salvar()), 700);
	});
	onDestroy(() => clearTimeout(temporizador));
	async function garantirSalvo() {
		if (temporizador) await salvar();
		await pendente;
	}
	async function sair(destino: string) {
		await garantirSalvo();
		await goto(destino, { refreshAll: true });
	}
	const destinoSaida = $derived(data.volta ?? hrefJutsus(k.id));

	async function trocarFicha(id: string) {
		await garantirSalvo();
		const { error } = await supabase().from('jutsus_criados').update({ personagem_id: id || null }).eq('id', j0.id);
		if (error) return toasts.mostrar('Não foi possível trocar a ficha.', 'erro');
		location.reload();
	}

	// ---------------------------------------------------------------- envio, versões, decisão
	let modal = $state<'confirmar' | 'decidir' | 'excluir' | null>(null);
	let enviando = $state(false);
	async function enviar() {
		enviando = true;
		await garantirSalvo();
		const { data: novo, error } = await supabase().rpc('enviar_jutsu', { jutsu: j0.id });
		enviando = false;
		modal = null;
		if (error) return toasts.mostrar('Não foi possível enviar. Continua salvo como rascunho.', 'erro', 6000);
		toasts.mostrar(novo === 'aprovado' ? 'Aprovado e na biblioteca da campanha.' : `Enviado. ${data.mestre} foi avisado.`, 'sucesso', 5000);
		await goto(destinoSaida, { refreshAll: true });
	}
	async function retirar() {
		const { error } = await supabase().rpc('retirar_jutsu', { jutsu: j0.id });
		if (error) return toasts.mostrar('Não foi possível retirar. O Mestre pode já ter decidido.', 'erro');
		location.reload();
	}
	async function novaVersao() {
		if (data.versaoNova) return goto(hrefJutsu(k.id, data.versaoNova));
		const { data: id, error } = await supabase().rpc('nova_versao_jutsu', { jutsu: j0.id });
		if (error || !id) return toasts.mostrar('Não foi possível criar a nova versão.', 'erro');
		await goto(hrefJutsu(k.id, id), { refreshAll: true });
	}
	async function excluir() {
		clearTimeout(temporizador);
		temporizador = undefined;
		const { error } = await supabase().from('jutsus_criados').delete().eq('id', j0.id);
		modal = null;
		if (error) return toasts.mostrar('Não foi possível excluir.', 'erro');
		toasts.mostrar('Rascunho excluído.', 'info');
		await goto(destinoSaida, { refreshAll: true });
	}
	let decisao = $state<'aprovado' | 'ajustes' | 'rejeitado'>('aprovado');
	let comentario = $state('');
	let decidindo = $state(false);
	let erroDecisao = $state('');
	function abrirDecisao(d: typeof decisao) {
		decisao = d;
		comentario = '';
		erroDecisao = '';
		modal = 'decidir';
	}
	async function decidir() {
		if (decisao !== 'aprovado' && !comentario.trim()) return (erroDecisao = 'Explique o que precisa mudar.');
		decidindo = true;
		const { error } = await supabase().rpc('decidir_jutsu', { jutsu: j0.id, decisao, comentario: comentario.trim() || null });
		decidindo = false;
		if (error) return (erroDecisao = 'Não foi possível registrar a decisão. Tente de novo.');
		modal = null;
		toasts.mostrar(decisao === 'aprovado' ? 'Aprovado.' : decisao === 'ajustes' ? 'Ajustes pedidos ao autor.' : 'Rejeitado.', 'sucesso');
		await goto(hrefJutsus(k.id), { refreshAll: true });
	}

	// ---------------------------------------------------------------- apresentação
	const ELEMENTOS_KKG = [
		{ id: 'hyoton', nome: 'Hyōton (gelo)' },
		{ id: 'mokuton', nome: 'Mokuton (madeira)' },
		{ id: 'yoton', nome: 'Yōton (lava)' },
		{ id: 'jiton', nome: 'Jiton (magnetismo)' },
		{ id: 'ranton', nome: 'Ranton (tempestade)' }
	];
	const resumoSecao = $derived<string[]>([
		[c.dados.tipo ?? 'sem tipo', c.dados.elemento ? (ELEMENTOS.find((e) => e.id === c.dados.elemento)?.nome ?? ELEMENTOS_KKG.find((e) => e.id === c.dados.elemento)?.nome.split(' ')[0]) : ''].filter(Boolean).join(' · '),
		`${c.calc.pj} PJ`,
		`Rank ${c.calc.rank}`,
		c.calc.custo.texto,
		Object.keys(c.dados.info).some((x) => c.dados.info[x as keyof typeof c.dados.info]?.trim()) ? 'editado' : 'automático',
		c.dados.efeito.trim() ? 'preenchido' : 'vazio'
	]);
	const secaoComErro = (i: number) => c.analise.verificacoes.some((v) => v.secao === i && v.nivel === 'bloqueio');
	const NIVEL = {
		ok: { rotulo: 'Ok', cor: 'var(--ok)', icone: 'status/ic-status-aprovado' },
		aviso: { rotulo: 'Aviso', cor: 'var(--warn)', icone: 'callout/ic-callout-atencao' },
		bloqueio: { rotulo: 'Bloqueio', cor: 'var(--err)', icone: 'status/ic-status-rejeitado' }
	} as const;
	const fisico = $derived(c.dados.tipo === 'Taijutsu' || c.dados.tipo === 'Bukijutsu');
	const ro = $derived(!data.editavel);
	let verCard = $state(false);
	const rotuloEnviar = $derived(souMestre && data.dono ? 'CONCLUIR' : 'ENVIAR PARA REVISÃO');
	const chipPara = $derived(data.cla ? `CLÃ ${data.cla.nome}${data.cla.carta ? ` · CARTA ${data.cla.carta.nome}` : ''}` : data.ficha ? `PARA ${data.ficha.nome || 'personagem'} · NÍVEL ${data.ficha.nivel}` : 'BIBLIOTECA DA CAMPANHA');
</script>

<svelte:window onbeforeunload={(e) => temporizador && e.preventDefault()} />

{#snippet verificacao(v: { nivel: 'ok' | 'aviso' | 'bloqueio'; texto: string })}
	{@const n = NIVEL[v.nivel]}
	<div class="flex items-center gap-2 border-2 py-1 pr-2.5 pl-1 text-[13px] leading-[18px] font-semibold" style:border-color={n.cor} style:background="color-mix(in srgb, {n.cor} 10%, transparent)">
		<Icone id={n.icone} alt={n.rotulo} />{n.rotulo} · {v.texto}
	</div>
{/snippet}

{#snippet secao(i: number, conteudo: Snippet)}
	{@const aberta = c.aberta === i || ro}
	<section class="border-2 bg-b2 shadow-[4px_4px_0_var(--ink)] {aberta ? 'border-mut' : secaoComErro(i) ? 'border-err' : 'border-frame'}">
		<h2 class="m-0">
			<button type="button" class="flex min-h-12 w-full items-center gap-2.5 px-3.5 text-left" aria-expanded={aberta} onclick={() => c.alternar(i)} disabled={ro}>
				<span class="t-num flex h-7 w-7 flex-none items-center justify-center border-2 border-ink text-[13px] text-white {secaoComErro(i) ? 'bg-err' : 'bg-vermelhao'}">{i + 1}</span>
				<span class="flex-1 font-pixel text-[13px] leading-none font-bold tracking-[0.1em] text-title uppercase">{SECOES_JUTSU[i]}</span>
				<span class="text-[13px] leading-[18px] font-semibold text-mut">{resumoSecao[i]}</span>
				{#if !ro}<span class="font-pixel text-sm">{aberta ? '▾' : '▸'}</span>{/if}
			</button>
		</h2>
		{#if aberta}<div class="flex flex-col gap-3.5 border-t-2 border-b3 p-3.5">{@render conteudo()}</div>{/if}
	</section>
{/snippet}

<div class="flex flex-1 flex-col">
	<div class="flex min-h-14 flex-wrap items-center gap-x-3 gap-y-1.5 border-b-2 border-ink bg-b2 px-4 py-2.5 md:px-6">
		<Icone id="acao/ic-acao-criar-jutsu" />
		<h1 class="m-0 font-mincho text-xl leading-[26px] font-bold">{habilidade ? (data.editavel ? 'Habilidade' : `Habilidade ${h.nome}`) : data.editavel ? 'Criar jutsu' : c.dados.nome || 'Jutsu'}</h1>
		{#if !habilidade}<span class="border-2 border-b3 px-[7px] py-[5px] font-pixel text-xs leading-none font-semibold tracking-[0.06em] text-mut uppercase max-sm:hidden">{chipPara}</span>{/if}
		{#if status !== 'rascunho'}
			<span class="inline-flex h-9 items-center gap-0.5 border-2 border-ink pr-2 text-xs leading-none font-semibold {STATUS_CRIACAO[status].classe}"><Icone id={STATUS_CRIACAO[status].icone} />{STATUS_CRIACAO[status].rotulo}{j0.versao > 1 ? ` · v${j0.versao}` : ''}</span>
		{/if}
		<span class="flex-1"></span>
		{#if data.editavel}
			<span class="max-md:hidden"><IndicadorSalvo estado={salvo} /></span>
			<button type="button" class="btn-jogo btn-fantasma text-[13px]" onclick={() => sair(destinoSaida)}>SALVAR E SAIR</button>
		{:else}
			<a href={destinoSaida} class="btn-jogo btn-fantasma text-[13px]">VOLTAR</a>
		{/if}
	</div>

	<div class="grid flex-1 lg:grid-cols-[minmax(0,1fr)_440px]">
		<div class="flex min-w-0 flex-col">
			<main class="flex flex-1 flex-col gap-2.5 px-4 py-5 md:px-7">
				{#if status === 'ajustes' && j0.comentario_mestre}
					<Alerta tipo="info" titulo="{data.mestre} pediu ajustes"><span>“{j0.comentario_mestre}”</span></Alerta>
				{:else if status === 'em_revisao' && data.dono}
					<Alerta tipo="aviso" titulo="Em revisão pelo Mestre desde {dataCurta(j0.enviado_em ?? j0.atualizado_em)}">
						<span>Fica bloqueado até {data.mestre} responder.</span>
						{#snippet acao()}<button type="button" class="btn-jogo btn-contorno min-h-10 text-xs" onclick={retirar}>RETIRAR DA REVISÃO</button>{/snippet}
					</Alerta>
				{:else if status === 'aprovado'}
					<Alerta tipo="sucesso" titulo="Aprovado · somente leitura">
						<span>{data.dono ? (data.ficha ? `${data.ficha.nome} já pode aprender no treino (${c.calc.ptAprender} PT). ` : '') + 'Editar cria uma nova versão.' : `Criado por ${data.autor}.`}</span>
						{#snippet acao()}{#if data.dono && !k.arquivada_em}<button type="button" class="btn-jogo btn-contorno min-h-10 text-xs" onclick={novaVersao}>{data.versaoNova ? 'ABRIR NOVA VERSÃO' : 'EDITAR CRIA NOVA VERSÃO'}</button>{/if}{/snippet}
					</Alerta>
				{:else if status === 'rejeitado'}
					<Alerta tipo="erro" titulo="Rejeitado">{#if j0.comentario_mestre}<span>“{j0.comentario_mestre}”</span>{/if}</Alerta>
				{:else if revisando}
					<Alerta tipo="info" titulo="{habilidade ? 'Habilidade' : 'Jutsu'} de {data.autor} aguardando sua revisão"><span>As verificações automáticas estão ao lado. Decida no fim da página.</span></Alerta>
				{/if}

				{#if habilidade}
					<div class="flex flex-col gap-3">
						<Campo id="hab-nome" rotulo="Nome" obrigatorio><input id="hab-nome" class="campo" maxlength="60" readonly={ro} bind:value={h.nome} /></Campo>
						<Campo id="hab-efeito" rotulo="Efeito" obrigatorio><textarea id="hab-efeito" class="campo h-auto min-h-[88px] resize-y py-2.5 text-[15px] leading-[22px]" maxlength="800" readonly={ro} bind:value={h.efeito}></textarea></Campo>
						<Campo id="hab-descricao" rotulo="Descrição narrativa"><textarea id="hab-descricao" class="campo h-auto min-h-[64px] resize-y py-2.5 text-[15px] leading-[22px]" maxlength="800" readonly={ro} bind:value={h.descricao}></textarea></Campo>
						{#if !ro}<Campo id="hab-msg" rotulo="Mensagem para o Mestre"><textarea id="hab-msg" class="campo h-auto min-h-[64px] resize-y py-2.5 text-[15px] leading-[22px]" maxlength="2000" bind:value={h.mensagem}></textarea></Campo>{/if}
					</div>
				{:else}
					{#snippet s0()}
						<div class="grid gap-3 sm:grid-cols-2">
							<Campo id="j-nome" rotulo="Nome (rōmaji)" obrigatorio><input id="j-nome" class="campo" maxlength="60" placeholder="Hyōsō no Jutsu" readonly={ro} bind:value={c.dados.nome} /></Campo>
							<Campo id="j-traducao" rotulo="Tradução"><input id="j-traducao" class="campo" maxlength="80" placeholder="Lança de Gelo" readonly={ro} bind:value={c.dados.traducao} /></Campo>
						</div>
						<span class="text-sm leading-5 font-semibold" id="j-tipo">Tipo</span>
						<div class="grid grid-cols-3 gap-1.5 sm:grid-cols-6" role="radiogroup" aria-labelledby="j-tipo">
							{#each TIPOS as t (t)}
								{@const on = c.dados.tipo === t}
								<button type="button" role="radio" aria-checked={on} disabled={ro} class="flex flex-col items-center gap-1 border-2 px-1 py-2" style:background={on ? `color-mix(in srgb, ${TIPO_JUTSU[t].cor} 18%, var(--b1))` : 'var(--b1)'} style:border-color={on ? TIPO_JUTSU[t].cor : 'var(--b3)'} onclick={() => (c.dados.tipo = t)}>
									<Icone id={TIPO_JUTSU[t].icone} /><span class="text-xs leading-[14px] font-semibold">{t}</span><span class="font-pixel text-xs text-mut">{TIPO_JUTSU[t].recurso}</span>
								</button>
							{/each}
						</div>
						<div class="grid gap-3 sm:grid-cols-2">
							<Campo id="j-elemento" rotulo="Elemento">
								<select id="j-elemento" class="campo pr-8" disabled={ro} bind:value={c.dados.elemento}>
									<option value={null}>Nenhum</option>
									{#each ELEMENTOS as e (e.id)}<option value={e.id}>{e.nome}</option>{/each}
									<optgroup label="Kekkei Genkai">{#each ELEMENTOS_KKG as e (e.id)}<option value={e.id}>{e.nome}</option>{/each}</optgroup>
								</select>
							</Campo>
							{#if data.dono && !data.cla && data.editavel}
								<Campo id="j-ficha" rotulo="Para qual ficha">
									<select id="j-ficha" class="campo pr-8" value={j0.personagem_id ?? ''} onchange={(e) => trocarFicha(e.currentTarget.value)}>
										<option value="">Nenhuma (biblioteca)</option>
										{#each data.minhasFichas as f (f.id)}<option value={f.id}>{f.nome || 'sem nome'}</option>{/each}
									</select>
								</Campo>
							{/if}
						</div>
						<span class="text-sm leading-5 font-semibold" id="j-selos">Selos de mão{c.dados.componentes['sem-selos'] ? ' · sem selos (comprado)' : ''}</span>
						<div class="flex flex-wrap gap-1.5" role="group" aria-labelledby="j-selos">
							{#each SELOS as s (s)}
								{@const on = c.dados.selos.includes(s)}
								<button type="button" aria-pressed={on} disabled={ro || !!c.dados.componentes['sem-selos']} class="min-h-9 border-2 px-2.5 text-[13px] font-semibold disabled:opacity-50 {on ? 'border-vermelhao bg-grena text-papel' : 'border-b3 bg-b1'}" onclick={() => (c.dados.selos = on ? c.dados.selos.filter((x) => x !== s) : [...c.dados.selos, s])}>{s}</button>
							{/each}
						</div>
					{/snippet}
					{#snippet s1()}
						<div class="flex flex-col gap-2">
							<span class="font-pixel text-xs leading-none font-bold tracking-[0.08em] text-mut">DANO OU CURA</span>
							<div class="flex flex-wrap items-center gap-2">
								<div class="flex border-2 border-frame" role="radiogroup" aria-label="Dano ou cura">
									{#each [['nenhum', 'Nenhum'], ['dano', 'Dano'], ['cura', 'Cura']] as [m, n] (m)}
										<button type="button" role="radio" aria-checked={c.dados.dano.modo === m} disabled={ro} class="min-h-10 border-r-2 border-frame px-3 text-[13px] font-semibold last:border-r-0 {c.dados.dano.modo === m ? 'bg-vermelhao text-white' : ''}" onclick={() => (c.dados.dano.modo = m as 'nenhum')}>{n}</button>
									{/each}
								</div>
								{#if c.dados.dano.modo !== 'nenhum'}
									<button type="button" class="h-10 w-10 border-2 border-b3 bg-b1 font-pixel text-lg font-bold" aria-label="Menos dados" disabled={ro || c.dados.dano.qtd <= 1} onclick={() => c.dados.dano.qtd--}>−</button>
									<span class="t-num w-7 text-center text-2xl" aria-live="polite">{c.dados.dano.qtd}</span>
									<button type="button" class="h-10 w-10 border-2 border-b3 bg-b1 font-pixel text-lg font-bold" aria-label="Mais dados" disabled={ro || c.dados.dano.qtd >= 20} onclick={() => c.dados.dano.qtd++}>+</button>
									<div class="flex border-2 border-frame" role="radiogroup" aria-label="Dado">
										{#each DADOS as dd (dd)}
											<button type="button" role="radio" aria-checked={c.dados.dano.dado === dd} disabled={ro} class="t-num min-h-10 min-w-12 border-r-2 border-frame text-sm last:border-r-0 {c.dados.dano.dado === dd ? 'bg-vermelhao text-white' : ''}" onclick={() => (c.dados.dano.dado = dd)}>D{dd}</button>
										{/each}
									</div>
									<label class="flex items-center gap-1.5 text-[13px] font-semibold">Bônus fixo <input type="number" class="campo h-10 w-16 text-sm" min="-10" max="40" readonly={ro} bind:value={c.dados.dano.bonus} /></label>
									<span class="text-sm font-semibold">média {c.calc.media.toLocaleString('pt-BR')} → <b class="t-num">{pjDoDano(c.calc.media)} PJ</b></span>
								{/if}
							</div>
							{#if fisico && c.dados.dano.modo === 'dano'}<span class="text-[13px] text-mut">{c.dados.tipo} soma {ATRIBUTO_DO_TIPO[c.dados.tipo!]} ao dano sem custo de PJ.</span>{/if}
						</div>
						<div class="flex flex-col gap-2">
							<span class="font-pixel text-xs leading-none font-bold tracking-[0.08em] text-mut">ALCANCE</span>
							<div class="flex flex-wrap border-2 border-frame self-start" role="radiogroup" aria-label="Alcance">
								{#each ALCANCES as a (a.id)}
									{@const on = c.dados.alcance === a.id}
									<button type="button" role="radio" aria-checked={on} disabled={ro} title={a.nota} class="flex min-h-11 flex-col justify-center gap-0.5 border-r-2 border-frame px-3 last:border-r-0 {on ? 'bg-vermelhao text-white' : ''}" onclick={() => (c.dados.alcance = a.id)}>
										<span class="text-[13px] font-semibold">{a.nome}</span><span class="t-num text-xs">{a.pj} PJ</span>
									</button>
								{/each}
							</div>
						</div>
						<div class="flex flex-col gap-2">
							<span class="font-pixel text-xs leading-none font-bold tracking-[0.08em] text-mut">ÁREA</span>
							<div class="flex flex-wrap gap-1.5" role="radiogroup" aria-label="Área">
								{#each AREAS as a (a.id)}
									{@const on = c.dados.area === a.id}
									<button type="button" role="radio" aria-checked={on} disabled={ro} title={a.nota} class="min-h-10 border-2 px-3 text-[13px] font-semibold {on ? 'border-vermelhao bg-grena text-papel' : 'border-b3'}" onclick={() => (c.dados.area = a.id)}>{a.nome} <b class="t-num text-xs">+{a.pj}</b></button>
								{/each}
							</div>
							{#if c.dados.area === 'unico'}
								<div class="flex items-center gap-2 text-[13px] font-semibold">
									Alvos adicionais (+2 PJ cada, máx. 3)
									<button type="button" class="h-8 w-8 border-2 border-b3 bg-b1 font-pixel font-bold" aria-label="Menos alvos" disabled={ro || !c.dados.alvosExtras} onclick={() => c.dados.alvosExtras--}>−</button>
									<span class="t-num w-5 text-center">{c.dados.alvosExtras}</span>
									<button type="button" class="h-8 w-8 border-2 border-b3 bg-b1 font-pixel font-bold" aria-label="Mais alvos" disabled={ro || c.dados.alvosExtras >= ALVO_EXTRA.max} onclick={() => c.dados.alvosExtras++}>+</button>
								</div>
							{/if}
						</div>
						<ListaComponentes {c} titulo="EFEITOS ESPECIAIS" itens={EFEITOS} />
						<ListaComponentes {c} titulo="EM SI MESMO OU EM ALIADO" itens={APOIO} />
						<ListaComponentes {c} titulo="MODIFICADORES" itens={MODIFICADORES} />
						<div class="flex flex-wrap items-end gap-6">
							<div class="flex flex-col gap-2">
								<span class="font-pixel text-xs leading-none font-bold tracking-[0.08em] text-mut">AÇÃO</span>
								<div class="flex border-2 border-frame" role="radiogroup" aria-label="Ação">
									{#each ACOES as a (a.id)}
										{@const on = c.dados.acao === a.id}
										<button type="button" role="radio" aria-checked={on} disabled={ro} class="flex min-h-11 flex-col justify-center gap-0.5 border-r-2 border-frame px-3 last:border-r-0 {on ? 'bg-vermelhao text-white' : ''}" onclick={() => (c.dados.acao = a.id)}>
											<span class="text-[13px] font-semibold">{a.nome}</span><span class="t-num text-xs">{sinal(a.pj)}</span>
										</button>
									{/each}
								</div>
							</div>
							<label class="flex min-h-11 cursor-pointer items-center gap-2.5 text-sm font-medium">
								<input type="checkbox" role="switch" class="interruptor" disabled={ro} bind:checked={c.dados.sensei} />Criado com a orientação de um Sensei <b class="t-num text-[13px]">−2 PJ</b>
							</label>
						</div>
					{/snippet}
					{#snippet s2()}
						<ReguaRank pj={c.calc.pj} />
						<p class="m-0 text-[15px] leading-[23px]">
							<b>{c.calc.pj} PJ → Rank {c.calc.rank}.</b> Aprender custa {c.calc.ptAprender} PT{c.calc.nivelMin > 1 ? ` e exige nível ${c.calc.nivelMin}` : ''} (cap. 18).
							{#if data.ficha}{data.ficha.nome} está no nível {data.ficha.nivel}.{/if}
							{#if data.cla?.carta?.rank}A carta do clã prevê Rank {data.cla.carta.rank}.{/if}
						</p>
					{/snippet}
					{#snippet s3()}
						<p class="m-0 text-[15px] leading-[23px]">
							Custo final = PJ: <b class="t-num">{c.calc.custo.texto}</b>{c.calc.sustentado ? ` · sustentado: ${c.calc.sustentado} por turno` : ''}.
							{c.dados.tipo === 'Taijutsu' || c.dados.tipo === 'Bukijutsu' ? 'Técnicas corporais e de arma gastam PE.' : c.dados.tipo === 'Kugutsu' ? 'Kugutsu divide entre PC (controle) e PE (movimento).' : 'Jutsus de chakra gastam PC.'}
						</p>
						{#if c.ctx.pcMax != null}<span class="text-[13px] text-mut">Máximo de {data.ficha?.nome}: {c.ctx.pcMax} PC · {c.ctx.peMax} PE. Se o custo passar disso, o jutsu existe, mas ainda não dá para usar (cap. 20.6).</span>{/if}
					{/snippet}
					{#snippet s4()}
						<div class="grid gap-2 sm:grid-cols-3">
							{#each CAMPOS_INFO as f (f.id)}
								<label class="flex flex-col gap-1">
									<span class="font-pixel text-xs leading-none font-bold tracking-[0.06em] text-mut">{f.rotulo.toUpperCase()}</span>
									<input class="campo h-10 text-[15px]" maxlength="60" placeholder={c.auto[f.id]} readonly={ro} bind:value={c.dados.info[f.id]} />
								</label>
							{/each}
						</div>
						<div class="flex flex-wrap items-center gap-2.5">
							{#if dt != null}<span class="text-sm font-semibold">DT do jutsu para {data.ficha?.nome}: <b class="t-num text-base">{dt}</b> <span class="font-normal text-mut">(10 + {c.calc.bonusDt} do rank + {c.dados.tipo ? ATRIBUTO_DO_TIPO[c.dados.tipo] : ''})</span></span>{/if}
							<span class="flex-1"></span>
							{#if !ro}<button type="button" class="link text-[13px] font-semibold" onclick={() => (c.dados.info = {})}>Restaurar automático</button>{/if}
						</div>
					{/snippet}
					{#snippet s5()}
						<Campo id="j-efeito" rotulo="Efeito" obrigatorio ajuda="O que o jutsu faz mecanicamente. Efeitos só narrativos não custam PJ.">
							<textarea id="j-efeito" class="campo h-auto min-h-[88px] resize-y py-2.5 text-[15px] leading-[22px]" maxlength="1200" readonly={ro} bind:value={c.dados.efeito}></textarea>
						</Campo>
						{#if !ro && c.sugestao && c.sugestao !== c.dados.efeito.trim()}
							<div class="flex flex-wrap items-center gap-2 text-[13px] text-mut">Sugestão pelas compras: “{c.sugestao}” <button type="button" class="link font-semibold" onclick={() => (c.dados.efeito = c.sugestao)}>Usar</button></div>
						{/if}
						<Campo id="j-descricao" rotulo="Descrição narrativa"><textarea id="j-descricao" class="campo h-auto min-h-[64px] resize-y py-2.5 text-[15px] leading-[22px]" maxlength="800" readonly={ro} bind:value={c.dados.descricao}></textarea></Campo>
						{#if !ro}<Campo id="j-msg" rotulo="Mensagem para o Mestre"><textarea id="j-msg" class="campo h-auto min-h-[64px] resize-y py-2.5 text-[15px] leading-[22px]" maxlength="2000" bind:value={c.dados.mensagem}></textarea></Campo>{/if}
					{/snippet}
					{@render secao(0, s0)}
					{@render secao(1, s1)}
					{@render secao(2, s2)}
					{@render secao(3, s3)}
					{@render secao(4, s4)}
					{@render secao(5, s5)}
				{/if}

				{#if revisando}
					<section class="mt-2 flex flex-wrap items-center gap-2 border-2 border-[#8B2E20] bg-b2 p-3.5 sombra-painel" aria-label="Decisão do Mestre">
						<span class="t-rotulo flex-1">Sua decisão · {bloqueios ? `${bloqueios} bloqueio${bloqueios > 1 ? 's' : ''}` : 'sem bloqueios'}</span>
						<button type="button" class="btn-jogo btn-erro min-h-11" onclick={() => abrirDecisao('rejeitado')}>REJEITAR</button>
						<button type="button" class="btn-jogo btn-secundario" onclick={() => abrirDecisao('ajustes')}>PEDIR AJUSTES</button>
						<button type="button" class="btn-jogo btn-primario" onclick={() => abrirDecisao('aprovado')}>APROVAR</button>
					</section>
				{/if}
				{#if data.editavel && status === 'rascunho'}
					<button type="button" class="link mt-2 self-start text-[13px] font-semibold text-err" onclick={() => (modal = 'excluir')}>Excluir este rascunho</button>
				{/if}
			</main>

			{#if !habilidade}
				<div class="sticky bottom-[128px] z-10 flex min-h-[52px] items-center gap-2 border-t-2 border-[#8B2E20] bg-grena pr-2 pl-3.5 text-papel md:bottom-[68px] lg:hidden">
					<span class="flex-1 font-pixel text-sm leading-none font-bold" aria-live="polite">PJ {c.calc.pj} · RANK {c.calc.rank} · {c.calc.custo.texto}</span>
					<button type="button" class="flex min-h-11 items-center border-2 border-vermelhao px-2.5 font-pixel text-xs font-bold" aria-expanded={verCard} onclick={() => (verCard = !verCard)}>{verCard ? 'FECHAR' : 'VER CARD'}</button>
				</div>
			{/if}
			<div class="sticky bottom-16 z-10 flex flex-wrap items-center gap-3 border-t-2 border-ink bg-b2 px-4 py-2.5 md:bottom-0 md:px-6">
				{#if data.editavel}<span class="md:hidden max-sm:hidden"><IndicadorSalvo estado={salvo} /></span>{/if}
				<span class="flex-1 text-[13px] leading-[18px] text-mut">{data.editavel && bloqueios ? verificacoes.find((v) => v.nivel === 'bloqueio')?.texto : ''}</span>
				{#if data.editavel}
					<button type="button" class="btn-jogo {bloqueios ? 'bg-b3 text-mut' : 'btn-primario'}" disabled={!!bloqueios} title={bloqueios ? 'Resolva os bloqueios' : undefined} onclick={() => (modal = 'confirmar')}>{rotuloEnviar}</button>
				{/if}
			</div>
		</div>

		<aside class="flex flex-col gap-3.5 border-l-2 border-b3 bg-b2 p-4 {verCard ? 'max-lg:fixed max-lg:inset-x-0 max-lg:top-14 max-lg:bottom-[180px] max-lg:z-20 max-lg:overflow-y-auto' : 'max-lg:hidden'}" aria-label="Prévia">
			<span class="font-pixel text-[13px] leading-none font-bold tracking-[0.1em] text-title">PRÉVIA</span>
			{#if habilidade}
				<article class="border-2 border-[#8B2E20] bg-b1">
					<header class="flex items-center gap-2 bg-grena px-3.5 py-3">
						<span class="flex flex-1 flex-col"><span class="font-mincho text-lg leading-6 font-bold text-papel">{h.nome.trim() || 'Nome da habilidade'}</span><span class="text-[13px] leading-[18px] text-papel-2 italic">Habilidade{h.traducao ? ` · ${h.traducao}` : ''}</span></span>
						<span class="border-2 border-[#8B2E20] px-2 py-1.5 font-pixel text-xs leading-none font-bold text-papel">HABILIDADE</span>
					</header>
					<div class="flex flex-col gap-2 px-3.5 py-3 text-sm leading-[21px]">
						{#if h.descricao.trim()}<p class="m-0">{h.descricao.trim()}</p>{/if}
						<p class="m-0"><b>Efeito.</b> {h.efeito.trim() || '…'}</p>
					</div>
				</article>
			{:else}
				<CardJutsu jutsu={c.card} rodape={false} />
				<div class="flex flex-col gap-1.5">
					<span class="font-pixel text-xs leading-none font-bold tracking-[0.1em] text-title">RÉGUA DE RANK</span>
					<ReguaRank pj={c.calc.pj} />
				</div>
				<div class="border-2 border-b3 bg-b1">
					<div class="border-b-2 border-b3 px-3 py-2 font-pixel text-xs leading-none font-bold tracking-[0.1em] text-title">CONTA DE PJ</div>
					{#each c.calc.linhas as l (l.rotulo)}
						<div class="flex gap-2 px-3 py-1 text-sm leading-5"><span class="flex-1">{l.rotulo}</span><b class="t-num" style:color={l.pj < 0 ? 'var(--ok)' : undefined}>{sinal(l.pj)}</b></div>
					{/each}
					<div class="flex gap-2 border-t-2 border-b3 px-3 py-2 text-[15px] font-bold"><span class="flex-1">Total</span><span class="t-num">{c.calc.pj} PJ → Rank {c.calc.rank} · aprender {c.calc.ptAprender} PT</span></div>
				</div>
			{/if}
			<div class="flex flex-col gap-1.5">
				{#each verificacoes as v, i (i)}{@render verificacao(v)}{/each}
			</div>
		</aside>
	</div>
</div>

{#if modal === 'confirmar'}
	<Modal rotulo="Enviar" largura={520} topo={160} aoFechar={() => !enviando && (modal = null)}>
		<div class="bg-grena px-5 py-3.5"><h2 class="m-0 font-mincho text-[22px] leading-7 font-bold text-papel">{souMestre && data.dono ? 'Concluir?' : 'Enviar para revisão?'}</h2></div>
		<p class="m-0 px-5 py-4 text-[15px] leading-[23px]">
			{#if souMestre && data.dono}Entra aprovado na biblioteca da campanha e deixa de ser editável aqui.{:else}Fica bloqueado até {data.mestre} responder. Dá para retirar da revisão enquanto ele não decidir.{/if}
		</p>
		{#if verificacoes.some((v) => v.nivel === 'aviso')}<div class="px-5 pb-2"><Alerta tipo="aviso" titulo="Há avisos. Dá para enviar mesmo assim." /></div>{/if}
		<div class="flex justify-end gap-2 px-5 pb-5">
			<button type="button" class="btn-jogo btn-fantasma" disabled={enviando} onclick={() => (modal = null)}>CANCELAR</button>
			<button type="button" class="btn-jogo btn-primario" disabled={enviando} aria-busy={enviando} onclick={enviar}>{#if enviando}<Girando />{/if}{rotuloEnviar}</button>
		</div>
	</Modal>
{:else if modal === 'excluir'}
	<Modal rotulo="Excluir rascunho" largura={480} topo={160} aoFechar={() => (modal = null)}>
		<div class="flex flex-col gap-4 p-6">
			<h2 class="t-h3 m-0">Excluir este rascunho?</h2>
			<p class="m-0 text-[15px] leading-[23px] text-mut">Não dá para desfazer.</p>
			<div class="flex justify-end gap-2.5">
				<button type="button" class="btn-jogo btn-fantasma" onclick={() => (modal = null)}>CANCELAR</button>
				<button type="button" class="btn-jogo bg-err text-errfg" onclick={excluir}>EXCLUIR</button>
			</div>
		</div>
	</Modal>
{:else if modal === 'decidir'}
	<Modal rotulo="Decisão" largura={520} topo={140} aoFechar={() => !decidindo && (modal = null)}>
		<form
			class="flex flex-col gap-4 p-6"
			onsubmit={(e) => {
				e.preventDefault();
				decidir();
			}}
		>
			<h2 class="t-h3 m-0">{decisao === 'aprovado' ? `Aprovar ${habilidade ? h.nome : c.dados.nome}?` : decisao === 'ajustes' ? 'Pedir ajustes' : 'Rejeitar'}</h2>
			<p class="m-0 text-[15px] leading-[23px] text-mut">
				{decisao === 'aprovado'
					? habilidade
						? 'A habilidade entra na biblioteca da campanha.'
						: `Rank ${c.calc.rank} · ${c.calc.custo.texto} · ${c.calc.pj} PJ.${data.ficha ? ` ${data.ficha.nome} poderá aprender no treino por ${c.calc.ptAprender} PT.` : ''}`
					: decisao === 'ajustes'
						? `${data.autor} volta a editar e reenvia quando terminar.`
						: `${data.autor} precisará criar outro.`}
			</p>
			<Campo id="dec-comentario" rotulo={decisao === 'aprovado' ? 'Comentário (opcional)' : 'O que precisa mudar'} obrigatorio={decisao !== 'aprovado'} erro={erroDecisao}>
				<textarea id="dec-comentario" class="campo h-auto min-h-[96px] resize-y py-2.5 text-[15px] leading-[22px]" maxlength="2000" bind:value={comentario}></textarea>
			</Campo>
			<div class="flex justify-end gap-2.5">
				<button type="button" class="btn-jogo btn-fantasma" disabled={decidindo} onclick={() => (modal = null)}>CANCELAR</button>
				<button type="submit" class="btn-jogo {decisao === 'rejeitado' ? 'bg-err text-errfg' : 'btn-primario'}" disabled={decidindo} aria-busy={decidindo}>
					{#if decidindo}<Girando />{/if}{decisao === 'aprovado' ? 'APROVAR' : decisao === 'ajustes' ? 'PEDIR AJUSTES' : 'REJEITAR'}
				</button>
			</div>
		</form>
	</Modal>
{/if}
