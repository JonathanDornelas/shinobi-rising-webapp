<script lang="ts">
	// A4 · Perfil e preferências: salvamento por seção; exclusão bloqueada enquanto houver campanhas ativas como Mestre.
	// No mobile vira uma lista de seções (?secao=...) com SAIR no fim.
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import CampoSenha from '#lib/componentes/conta/CampoSenha.svelte';
	import Alerta from '#lib/componentes/ui/Alerta.svelte';
	import Campo from '#lib/componentes/ui/Campo.svelte';
	import Girando from '#lib/componentes/ui/Girando.svelte';
	import Icone from '#lib/componentes/ui/Icone.svelte';
	import IndicadorSalvo, { type EstadoSalvo } from '#lib/componentes/ui/IndicadorSalvo.svelte';
	import Modal from '#lib/componentes/ui/Modal.svelte';
	import Retrato from '#lib/componentes/ui/Retrato.svelte';
	import { emailValido, SENHA_MINIMA } from '#lib/conta/regras.ts';
	import { preferencias, type Tema, type TamanhoLeitura } from '#lib/estado/preferencias.svelte.ts';
	import { contraste, ESCALAS, PALETAS, RAIOS, type Visual } from '#lib/estado/visual.ts';
	import { sessao } from '#lib/estado/sessao.svelte.ts';
	import { toasts } from '#lib/estado/toasts.svelte.ts';
	import { mensagemAuth, supabase } from '#lib/supabase/cliente.ts';
	import type { Preferencias } from '#lib/supabase/banco.ts';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	type Secao = 'perfil' | 'preferencias' | 'aparencia' | 'notificacoes' | 'perigo';
	const SECOES: { id: Secao; nome: string; icone: string; perigo?: boolean }[] = [
		{ id: 'perfil', nome: 'Perfil', icone: 'nav/ic-nav-perfil' },
		{ id: 'preferencias', nome: 'Preferências', icone: 'nav/ic-nav-configuracoes' },
		{ id: 'aparencia', nome: 'Aparência', icone: 'callout/ic-callout-destaque' },
		{ id: 'notificacoes', nome: 'Notificações por e-mail', icone: 'nav/ic-nav-notificacoes' },
		{ id: 'perigo', nome: 'Zona de perigo', icone: 'status/ic-status-rejeitado', perigo: true }
	];
	const secao = $derived(page.url.searchParams.get('secao') as Secao | null);
	/** No mobile mostra só a seção escolhida; no desktop, todas. */
	const visivel = (s: Secao) => (secao === s ? '' : 'max-md:hidden');

	// ---------------------------------------------------------------- perfil
	let estadoPerfil = $state<EstadoSalvo>({ tipo: 'ocioso' });
	let nome = $state('');
	let erroNome = $state('');
	let email = $state('');
	let erroEmail = $state('');
	let emailPendente = $state('');
	let senhaAtual = $state('');
	let novaSenha = $state('');
	let errosSenha = $state<{ atual?: string; nova?: string }>({});
	let trocandoSenha = $state(false);
	let trocandoEmail = $state(false);

	$effect.pre(() => {
		if (sessao.perfil && !nome) nome = sessao.perfil.nome;
		if (sessao.usuario && !email) email = sessao.usuario.email;
	});

	async function salvarNome() {
		const n = nome.trim();
		if (!sessao.perfil || n === sessao.perfil.nome) return;
		erroNome = n.length < 2 ? 'Use pelo menos 2 letras.' : n.length > 40 ? 'Use no máximo 40 caracteres.' : '';
		if (erroNome) return;
		estadoPerfil = { tipo: 'salvando' };
		const { error } = await sessao.salvarNome(n);
		estadoPerfil = error ? { tipo: 'erro' } : { tipo: 'salvo', em: Date.now() };
	}

	async function trocarEmail(e: SubmitEvent) {
		e.preventDefault();
		erroEmail = emailValido(email) ? '' : 'Informe um e-mail válido.';
		if (erroEmail || email.trim() === sessao.usuario?.email) return;
		trocandoEmail = true;
		const { error } = await supabase().auth.updateUser(
			{ email: email.trim() },
			{ emailRedirectTo: `${location.origin}/auth/callback?next=${encodeURIComponent('/perfil')}` }
		);
		trocandoEmail = false;
		if (error) erroEmail = error.code === 'email_exists' ? 'Este e-mail já tem conta.' : mensagemAuth(error);
		else emailPendente = email.trim();
	}

	async function trocarSenha(e: SubmitEvent) {
		e.preventDefault();
		const er: typeof errosSenha = {};
		if (!senhaAtual) er.atual = 'Informe a senha atual.';
		if (novaSenha.length < SENHA_MINIMA) er.nova = `A senha precisa de ${SENHA_MINIMA} caracteres ou mais.`;
		errosSenha = er;
		if (Object.keys(er).length || !sessao.usuario) return;
		trocandoSenha = true;
		const sb = supabase();
		const conferida = await sb.auth.signInWithPassword({ email: sessao.usuario.email, password: senhaAtual });
		if (conferida.error) {
			trocandoSenha = false;
			errosSenha = { atual: conferida.error.code === 'invalid_credentials' ? 'Senha atual incorreta.' : mensagemAuth(conferida.error) };
			return;
		}
		const { error } = await sb.auth.updateUser({ password: novaSenha });
		trocandoSenha = false;
		if (error) {
			errosSenha = { nova: mensagemAuth(error) };
			return;
		}
		senhaAtual = novaSenha = '';
		estadoPerfil = { tipo: 'salvo', em: Date.now() };
		toasts.mostrar('Senha alterada.', 'sucesso');
	}

	// ---------------------------------------------------------------- preferências
	let estadoPref = $state<EstadoSalvo>({ tipo: 'ocioso' });
	let estadoEmail = $state<EstadoSalvo>({ tipo: 'ocioso' });

	async function salvar(parcial: Partial<Preferencias>, alvo: 'pref' | 'email') {
		const definir = (e: EstadoSalvo) => (alvo === 'pref' ? (estadoPref = e) : (estadoEmail = e));
		definir({ tipo: 'salvando' });
		const { error } = await sessao.salvarPreferencias(parcial);
		definir(error ? { tipo: 'erro' } : { tipo: 'salvo', em: Date.now() });
	}

	function escolherTema(t: Tema) {
		preferencias.definirTema(t);
		salvar({ tema: t }, 'pref');
	}
	const FONTES: [string, TamanhoLeitura][] = [
		['P', 15],
		['M', 17],
		['G', 20]
	];
	function escolherFonte(t: TamanhoLeitura) {
		preferencias.definirLeitura(t);
		salvar({ leitura: t }, 'pref');
	}

	// ---------------------------------------------------------------- aparência (tema do usuário)
	let estadoVisual = $state<EstadoSalvo>({ tipo: 'ocioso' });
	let salvarVisualTimer: ReturnType<typeof setTimeout> | undefined;
	const PADRAO = { sumi: { fundo: '#16110f', texto: '#efe3d3' }, washi: { fundo: '#f4e4d6', texto: '#1a1a1a' } } as const;
	const efetivo = $derived({ fundo: preferencias.visual.fundo ?? PADRAO[preferencias.aplicado].fundo, texto: preferencias.visual.texto ?? PADRAO[preferencias.aplicado].texto });
	const razao = $derived(contraste(efetivo.fundo, efetivo.texto));
	const CORES: { k: 'acento' | 'destaque' | 'fundo' | 'texto'; nome: string; ajuda: string }[] = [
		{ k: 'acento', nome: 'Acento', ajuda: 'Botões principais e abas ativas' },
		{ k: 'destaque', nome: 'Destaque', ajuda: 'Títulos, ouro e números em destaque' },
		{ k: 'fundo', nome: 'Fundo', ajuda: 'Fundo das páginas e painéis' },
		{ k: 'texto', nome: 'Texto', ajuda: 'Texto principal' }
	];
	function mudarVisual(parcial: Partial<Visual>) {
		const novo: Visual = { ...preferencias.visual, ...parcial };
		for (const k of Object.keys(novo) as (keyof Visual)[]) if (novo[k] === undefined || (k === 'raio' && !novo.raio) || (k === 'escala' && novo.escala === 100)) delete novo[k];
		preferencias.definirVisual(novo);
		clearTimeout(salvarVisualTimer);
		estadoVisual = { tipo: 'salvando' };
		salvarVisualTimer = setTimeout(async () => {
			const { error } = await sessao.salvarPreferencias({ visual: $state.snapshot(preferencias.visual) as Visual });
			estadoVisual = error ? { tipo: 'erro' } : { tipo: 'salvo', em: Date.now() };
		}, 600);
	}
	const corAtual = (k: 'acento' | 'destaque' | 'fundo' | 'texto') =>
		preferencias.visual[k] ?? (k === 'acento' ? '#c44536' : k === 'destaque' ? (preferencias.aplicado === 'washi' ? '#bf9000' : '#d9a82b') : PADRAO[preferencias.aplicado][k]);

	type ChaveEmail = 'submissoes' | 'decisoes' | 'comentarios' | 'recompensas';
	const AVISOS: [ChaveEmail, string, boolean][] = [
		['submissoes', 'Nova submissão para revisar', true],
		['decisoes', 'Submissão aprovada, com ajustes ou rejeitada', true],
		['comentarios', 'Novo comentário na revisão', false],
		['recompensas', 'XP, PT ou ryo concedidos', true]
	];
	const avisoLigado = (chave: ChaveEmail, padrao: boolean) => sessao.perfil?.preferencias.email?.[chave] ?? padrao;
	function alternarAviso(chave: ChaveEmail, ligado: boolean) {
		salvar({ email: { ...sessao.perfil?.preferencias.email, [chave]: ligado } }, 'email');
	}

	// ---------------------------------------------------------------- zona de perigo
	let confirmando = $state(false);
	let confirmacao = $state('');
	let excluindo = $state(false);
	let erroExclusao = $state('');

	async function excluir() {
		excluindo = true;
		erroExclusao = '';
		const { error } = await supabase().rpc('excluir_conta');
		if (error) {
			excluindo = false;
			erroExclusao = error.message.includes('Mestre')
				? 'Ainda há campanhas ativas em que você é Mestre. Transfira ou arquive antes.'
				: 'Não foi possível excluir a conta agora. Tente de novo.';
			return;
		}
		await supabase().auth.signOut();
		toasts.mostrar('Conta excluída. Até a próxima missão.', 'info', 6000);
		await goto('/', { replace: true, refreshAll: true });
	}

	async function sair() {
		await sessao.sair();
		await goto('/', { refreshAll: true });
	}
</script>

{#snippet cabecalho(rotulo: string, estado?: EstadoSalvo, perigo = false)}
	<div class="flex min-h-12 items-center gap-2 border-b-2 border-b3 px-4 py-2">
		{#if secao}<a href="/perfil" class="btn-fantasma -ml-3 inline-flex min-h-10 items-center px-3 font-pixel md:hidden" aria-label="Voltar para as seções">‹</a>{/if}
		<h2 class="t-rotulo m-0 flex-1" style:color={perigo ? 'var(--err)' : undefined}>{rotulo}</h2>
		{#if estado}<IndicadorSalvo {estado} />{/if}
	</div>
{/snippet}

<main class="mx-auto flex w-full max-w-[960px] flex-col gap-5 px-4 pt-4 pb-14 md:px-6 md:pt-8">
	<div class="flex flex-col gap-1.5 max-md:hidden">
		<span class="t-rotulo">Conta</span>
		<h1 class="t-h1 m-0">Perfil e preferências</h1>
	</div>

	<!-- mobile: cabeçalho + lista de seções -->
	{#if !secao}
		<div class="flex flex-col gap-3.5 md:hidden">
			<div class="flex items-center gap-3.5">
				<Retrato nome={sessao.nome} tamanho={64} />
				<div class="flex min-w-0 flex-col gap-0.5">
					<span class="truncate font-mincho text-xl leading-[26px] font-bold">{sessao.nome}</span>
					<span class="truncate text-[13px] leading-[18px] text-mut">{sessao.usuario?.email}</span>
				</div>
			</div>
			<nav aria-label="Seções do perfil" class="flex flex-col gap-3.5">
				{#each SECOES as s (s.id)}
					<a
						href="?secao={s.id}"
						class="flex min-h-14 items-center gap-2.5 border-2 bg-b2 py-0 pr-3 pl-1.5 {s.perigo ? 'border-err text-err' : 'border-frame text-fg'}"
					>
						<Icone id={s.icone} />
						<span class="flex-1 text-[15px] leading-5 font-semibold">{s.nome}</span>
						<span class="font-pixel text-sm font-bold text-mut" aria-hidden="true">▸</span>
					</a>
				{/each}
			</nav>
			<button type="button" class="btn-jogo btn-contorno mt-2 min-h-12" onclick={sair}>SAIR</button>
		</div>
	{/if}

	<!-- PERFIL -->
	<section class="painel-sombra {visivel('perfil')}" aria-labelledby="sec-perfil">
		<div id="sec-perfil">{@render cabecalho('Perfil', estadoPerfil)}</div>
		<div class="grid gap-6 p-4 md:grid-cols-[auto_minmax(0,1fr)]">
			<div class="flex flex-col items-center gap-2.5">
				<Retrato nome={nome || sessao.nome} tamanho={128} />
				<button type="button" class="btn-jogo btn-contorno min-h-10 px-3 text-xs" disabled aria-describedby="retrato-breve">TROCAR RETRATO</button>
				<span id="retrato-breve" class="text-xs text-mut">Retratos chegam em breve.</span>
			</div>
			<div class="grid content-start gap-x-4 gap-y-3.5 md:grid-cols-2">
				<Campo id="pf-nome" rotulo="Nome de exibição" ajuda="É o nome que o grupo vê." erro={erroNome}>
					<input
						id="pf-nome"
						class="campo"
						maxlength="40"
						autocomplete="nickname"
						bind:value={nome}
						onblur={salvarNome}
						onkeydown={(e) => e.key === 'Enter' && (e.currentTarget as HTMLInputElement).blur()}
						aria-invalid={!!erroNome || undefined}
						style:border-color={erroNome ? 'var(--err)' : undefined}
					/>
				</Campo>
				<form class="flex flex-col gap-2" novalidate onsubmit={trocarEmail}>
					<Campo id="pf-email" rotulo="E-mail" erro={erroEmail}>
						<input
							id="pf-email"
							type="email"
							class="campo"
							autocomplete="email"
							bind:value={email}
							aria-invalid={!!erroEmail || undefined}
							style:border-color={erroEmail ? 'var(--err)' : undefined}
						/>
					</Campo>
					{#if email.trim() !== sessao.usuario?.email && !emailPendente}
						<button type="submit" class="btn-jogo btn-contorno min-h-10 self-start px-3 text-xs" disabled={trocandoEmail}>
							{#if trocandoEmail}<Girando />{/if}ALTERAR E-MAIL
						</button>
					{/if}
				</form>
				{#if emailPendente}
					<div class="md:col-span-2">
						<Alerta tipo="info" titulo="Confirme a troca de e-mail.">
							<span>Enviamos um link para {emailPendente}. A troca vale depois que você abrir o link.</span>
						</Alerta>
					</div>
				{/if}
				<form class="contents" novalidate onsubmit={trocarSenha}>
					<input type="email" autocomplete="username" value={sessao.usuario?.email ?? ''} hidden readonly />
					<Campo id="pf-senha-atual" rotulo="Senha atual" erro={errosSenha.atual}>
						<CampoSenha id="pf-senha-atual" altura={44} bind:valor={senhaAtual} autocomplete="current-password" invalido={!!errosSenha.atual} />
					</Campo>
					<Campo id="pf-senha-nova" rotulo="Nova senha" erro={errosSenha.nova} ajuda="{SENHA_MINIMA} caracteres ou mais; 12+ fica forte.">
						<CampoSenha id="pf-senha-nova" altura={44} bind:valor={novaSenha} autocomplete="new-password" invalido={!!errosSenha.nova} />
					</Campo>
					{#if senhaAtual || novaSenha}
						<button type="submit" class="btn-jogo btn-contorno min-h-10 justify-self-start px-3 text-xs md:col-start-2" disabled={trocandoSenha}>
							{#if trocandoSenha}<Girando />{/if}ALTERAR SENHA
						</button>
					{/if}
				</form>
			</div>
		</div>
	</section>

	<!-- PREFERÊNCIAS -->
	<section class="painel-sombra {visivel('preferencias')}" aria-labelledby="sec-pref">
		<div id="sec-pref">{@render cabecalho('Preferências', estadoPref)}</div>
		<div class="grid gap-5 p-4 md:grid-cols-2">
			<div class="flex flex-col gap-2">
				<span class="text-sm leading-5 font-semibold" id="rot-tema">Tema</span>
				<div class="flex self-start border-2 border-frame" role="group" aria-labelledby="rot-tema">
					{#each [['washi', 'WASHI'], ['sumi', 'SUMI'], ['sistema', 'SISTEMA']] as const as [t, rotulo], i (t)}
						<button
							type="button"
							class="t-num min-h-11 px-3.5 text-[13px] {i ? 'border-l-2 border-frame' : ''} {preferencias.tema === t ? 'bg-vermelhao text-white' : ''}"
							aria-pressed={preferencias.tema === t}
							onclick={() => escolherTema(t)}>{rotulo}</button
						>
					{/each}
				</div>
			</div>
			<div class="flex flex-col gap-2">
				<span class="text-sm leading-5 font-semibold" id="rot-fonte">Fonte de leitura</span>
				<div class="flex flex-wrap items-center gap-3">
					<div class="flex border-2 border-frame" role="group" aria-labelledby="rot-fonte">
						{#each FONTES as [rotulo, t], i (t)}
							<button
								type="button"
								class="t-num min-h-11 w-11 text-[13px] {i ? 'border-l-2 border-frame' : ''} {preferencias.leitura === t ? 'bg-vermelhao text-white' : ''}"
								aria-pressed={preferencias.leitura === t}
								aria-label="Texto {rotulo === 'P' ? 'pequeno' : rotulo === 'M' ? 'médio' : 'grande'} ({t}px)"
								onclick={() => escolherFonte(t)}>{rotulo}</button
							>
						{/each}
					</div>
					<span class="text-mut" style:font-size="{preferencias.leitura}px" style:line-height="1.7">Role 1d20 e some a perícia.</span>
				</div>
			</div>
		</div>
	</section>

	<!-- APARÊNCIA (tema do usuário) -->
	<section class="painel-sombra {visivel('aparencia')}" aria-labelledby="sec-aparencia">
		<div id="sec-aparencia">{@render cabecalho('Aparência', estadoVisual)}</div>
		<div class="flex flex-col gap-5 p-4">
			<p class="m-0 text-sm text-mut">As mudanças aparecem na hora, no app inteiro, e ficam salvas no seu perfil. O que você não mudar segue o tema {preferencias.aplicado === 'washi' ? 'Washi' : 'Sumi'}.</p>
			<div class="flex flex-col gap-2">
				<span class="text-sm leading-5 font-semibold" id="rot-paleta">Paletas</span>
				<div class="flex flex-wrap gap-2" role="group" aria-labelledby="rot-paleta">
					{#each PALETAS as pl (pl.id)}
						{@const on = corAtual('acento') === pl.acento && corAtual('destaque') === (pl.id === 'padrao' && preferencias.aplicado === 'washi' ? '#bf9000' : pl.destaque)}
						<button
							type="button"
							class="flex min-h-11 items-center gap-2 border-2 px-2.5 text-[13px] font-semibold {on ? 'border-vermelhao' : 'border-b3 hover:border-mut'}"
							aria-pressed={on}
							onclick={() => mudarVisual(pl.id === 'padrao' ? { acento: undefined, destaque: undefined } : { acento: pl.acento, destaque: pl.destaque })}
						>
							<span class="flex"><span class="h-5 w-5 border-2 border-ink" style:background={pl.acento}></span><span class="-ml-0.5 h-5 w-5 border-2 border-ink" style:background={pl.destaque}></span></span>{pl.nome}
						</button>
					{/each}
				</div>
			</div>
			<div class="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
				{#each CORES as cor (cor.k)}
					<div class="flex items-center gap-3 border-2 border-b3 p-2.5">
						<input id="cor-{cor.k}" type="color" class="h-11 w-11 flex-none cursor-pointer border-2 border-ink bg-transparent p-0" {@attach (el: HTMLInputElement) => {
								el.value = corAtual(cor.k);
							}} oninput={(e) => mudarVisual({ [cor.k]: e.currentTarget.value })} />
						<label for="cor-{cor.k}" class="flex min-w-0 flex-1 flex-col gap-0.5">
							<span class="text-sm leading-5 font-semibold">{cor.nome}</span>
							<span class="text-xs leading-4 text-mut">{cor.ajuda}</span>
						</label>
						{#if preferencias.visual[cor.k]}<button type="button" class="link text-xs font-semibold" onclick={() => mudarVisual({ [cor.k]: undefined })}>Padrão</button>{/if}
					</div>
				{/each}
			</div>
			{#if razao < 4.5}
				<Alerta tipo="aviso" titulo="Pouco contraste entre texto e fundo ({razao.toFixed(1).replace('.', ',')}:1)">
					<span>Para leitura confortável, o texto pede pelo menos 4,5:1. Escolha um fundo mais claro ou mais escuro, ou volte ao padrão.</span>
				</Alerta>
			{/if}
			<div class="grid gap-5 md:grid-cols-2">
				<div class="flex flex-col gap-2">
					<span class="text-sm leading-5 font-semibold" id="rot-escala">Tamanho da interface</span>
					<div class="flex self-start border-2 border-frame" role="group" aria-labelledby="rot-escala">
						{#each ESCALAS as e, i (e)}
							{@const on = (preferencias.visual.escala ?? 100) === e}
							<button type="button" class="t-num min-h-11 px-3 text-[13px] {i ? 'border-l-2 border-frame' : ''} {on ? 'bg-vermelhao text-white' : ''}" aria-pressed={on} onclick={() => mudarVisual({ escala: e })}>{e}%</button>
						{/each}
					</div>
				</div>
				<div class="flex flex-col gap-2">
					<span class="text-sm leading-5 font-semibold" id="rot-raio">Cantos</span>
					<div class="flex self-start border-2 border-frame" role="group" aria-labelledby="rot-raio">
						{#each RAIOS as r, i (r)}
							{@const on = (preferencias.visual.raio ?? 0) === r}
							<button type="button" class="flex min-h-11 items-center gap-2 px-3 text-[13px] {i ? 'border-l-2 border-frame' : ''} {on ? 'bg-vermelhao text-white' : ''}" aria-pressed={on} aria-label={r ? `Raio de ${r} px` : 'Cantos retos'} onclick={() => mudarVisual({ raio: r })}>
								<span class="h-4 w-4 border-2 border-current" style:border-radius="{r}px"></span>{r ? `${r}px` : 'Retos'}
							</button>
						{/each}
					</div>
				</div>
			</div>
			<div class="flex flex-col gap-2">
				<span class="text-sm leading-5 font-semibold">Prévia</span>
				<div class="flex flex-wrap items-center gap-3 border-2 border-b3 bg-b1 p-3.5">
					<span class="font-mincho text-xl font-bold text-title">Konohagakure</span>
					<span class="text-sm">Role 1d20 e some a perícia.</span>
					<span class="text-sm text-mut">Texto de apoio.</span>
					<span class="flex-1"></span>
					<span class="border-2 border-b3 bg-vermelhao px-2.5 py-2 font-pixel text-xs font-bold text-white">ABA ATIVA</span>
					<span class="btn-jogo btn-primario min-h-9 text-xs">CONFIRMAR</span>
				</div>
			</div>
			{#if Object.keys(preferencias.visual).length}
				<button type="button" class="btn-jogo btn-fantasma self-start text-xs" onclick={() => mudarVisual({ acento: undefined, destaque: undefined, fundo: undefined, texto: undefined, escala: undefined, raio: undefined })}>RESTAURAR O PADRÃO</button>
			{/if}
		</div>
	</section>

	<!-- NOTIFICAÇÕES POR E-MAIL -->
	<section class="painel-sombra {visivel('notificacoes')}" aria-labelledby="sec-email">
		<div id="sec-email">{@render cabecalho('Notificações por e-mail', estadoEmail)}</div>
		<div class="flex flex-col px-4 pt-1 pb-4">
			{#each AVISOS as [chave, rotulo, padrao] (chave)}
				<label class="flex min-h-11 cursor-pointer items-center gap-3 border-b-2 border-b3 py-1.5">
					<span class="flex-1 text-[15px] leading-5 font-medium">{rotulo}</span>
					<input
						type="checkbox"
						role="switch"
						class="interruptor"
						checked={avisoLigado(chave, padrao)}
						onchange={(e) => alternarAviso(chave, e.currentTarget.checked)}
					/>
				</label>
			{/each}
			<span class="mt-2.5 text-[13px] leading-[18px] text-mut">Os avisos sempre aparecem no sino. Os e-mails seguem estas escolhas.</span>
		</div>
	</section>

	<!-- ZONA DE PERIGO -->
	<section class="border-2 border-err bg-b2 sombra-painel {visivel('perigo')}" aria-labelledby="sec-perigo">
		<div id="sec-perigo">{@render cabecalho('Zona de perigo', undefined, true)}</div>
		<div class="flex flex-col gap-3 p-4">
			{#if data.comoMestre.length}
				<Alerta tipo="aviso" titulo="Antes de excluir, transfira ou arquive as campanhas em que você é Mestre:">
					<div class="flex flex-wrap gap-2">
						{#each data.comoMestre as c, i (c.id)}
							{#if i}<span class="text-mut" aria-hidden="true">·</span>{/if}
							<a href="/campanhas/{c.id}/configuracoes" class="link">{c.nome}</a>
						{/each}
					</div>
				</Alerta>
				<button type="button" class="btn-jogo self-start border-2 border-dashed border-b3 px-4 text-mut" disabled>EXCLUIR CONTA</button>
			{:else}
				<p class="m-0 text-sm leading-5 text-mut">Excluir a conta apaga seu perfil, suas notificações e tira você das campanhas. Não dá para desfazer.</p>
				<button type="button" class="btn-jogo self-start border-2 border-err px-4 text-err hover:bg-[color-mix(in_srgb,var(--err)_12%,transparent)]" onclick={() => (confirmando = true)}>EXCLUIR CONTA</button>
			{/if}
		</div>
	</section>
</main>

{#if confirmando}
	<Modal rotulo="Excluir conta" largura={480} aoFechar={() => !excluindo && (confirmando = false)}>
		<form
			class="flex flex-col gap-4 p-6"
			onsubmit={(e) => {
				e.preventDefault();
				if (confirmacao.trim().toUpperCase() === 'EXCLUIR') excluir();
			}}
		>
			<h2 class="t-h3 m-0">Excluir sua conta?</h2>
			<p class="m-0 text-[15px] leading-[23px] text-mut">Seu perfil e suas notificações somem para sempre e você sai de todas as campanhas. Esta ação não pode ser desfeita.</p>
			{#if erroExclusao}<Alerta tipo="erro" titulo={erroExclusao} />{/if}
			<Campo id="confirma-exclusao" rotulo="Digite EXCLUIR para confirmar">
				<input id="confirma-exclusao" class="campo" autocomplete="off" bind:value={confirmacao} />
			</Campo>
			<div class="flex flex-wrap justify-end gap-2.5">
				<button type="button" class="btn-jogo btn-fantasma" onclick={() => (confirmando = false)} disabled={excluindo}>CANCELAR</button>
				<button type="submit" class="btn-jogo bg-err text-errfg" disabled={confirmacao.trim().toUpperCase() !== 'EXCLUIR' || excluindo}>
					{#if excluindo}<Girando />EXCLUINDO…{:else}EXCLUIR CONTA{/if}
				</button>
			</div>
		</form>
	</Modal>
{/if}
