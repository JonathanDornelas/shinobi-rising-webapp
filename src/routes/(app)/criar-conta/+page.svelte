<script lang="ts">
	// A2 · Criar conta: validação por campo, medidor de força e sucesso "Confirme seu e-mail" com reenvio temporizado.
	import { onDestroy } from 'svelte';
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import CampoSenha from '#lib/componentes/conta/CampoSenha.svelte';
	import FaixaConvite from '#lib/componentes/conta/FaixaConvite.svelte';
	import MedidorSenha from '#lib/componentes/conta/MedidorSenha.svelte';
	import PainelConta from '#lib/componentes/conta/PainelConta.svelte';
	import Alerta from '#lib/componentes/ui/Alerta.svelte';
	import Campo from '#lib/componentes/ui/Campo.svelte';
	import Girando from '#lib/componentes/ui/Girando.svelte';
	import { destinoSeguro, emailValido, SENHA_MINIMA } from '#lib/conta/regras.ts';
	import { toasts } from '#lib/estado/toasts.svelte.ts';
	import { mensagemAuth, supabase } from '#lib/supabase/cliente.ts';

	const voltaBruta = $derived(page.url.searchParams.get('volta'));
	const volta = $derived(destinoSeguro(voltaBruta));
	const vindoDeConvite = $derived(volta.startsWith('/convite/'));
	const sufixo = $derived(voltaBruta ? `?volta=${encodeURIComponent(volta)}` : '');

	let nome = $state('');
	let email = $state('');
	let senha = $state('');
	let termos = $state(false);
	let erros = $state<{ nome?: string; email?: string; senha?: string; termos?: string; geral?: string }>({});
	let emailJaExiste = $state(false);
	let enviando = $state(false);
	let enviadoPara = $state('');
	let espera = $state(0);
	let relogio: ReturnType<typeof setInterval> | undefined;

	onDestroy(() => clearInterval(relogio));

	function validar() {
		const e: typeof erros = {};
		if (nome.trim().length < 2) e.nome = 'Use pelo menos 2 letras.';
		else if (nome.trim().length > 40) e.nome = 'Use no máximo 40 caracteres.';
		if (!emailValido(email)) e.email = 'Informe um e-mail válido, como voce@exemplo.com.';
		if (senha.length < SENHA_MINIMA) e.senha = `A senha precisa de ${SENHA_MINIMA} caracteres ou mais.`;
		if (!termos) e.termos = 'Aceite os termos de uso para continuar.';
		erros = e;
		emailJaExiste = false;
		return Object.keys(e).length === 0;
	}

	const redirecionar = () => `${location.origin}/auth/callback?next=${encodeURIComponent(volta)}`;

	function iniciarEspera() {
		espera = 45;
		clearInterval(relogio);
		relogio = setInterval(() => {
			espera -= 1;
			if (espera <= 0) clearInterval(relogio);
		}, 1000);
	}

	async function criar(ev: SubmitEvent) {
		ev.preventDefault();
		if (!validar()) return;
		enviando = true;
		const { data, error } = await supabase().auth.signUp({
			email: email.trim(),
			password: senha,
			options: { data: { nome: nome.trim() }, emailRedirectTo: redirecionar() }
		});
		enviando = false;
		if (error) {
			const texto = mensagemAuth(error);
			if (error.code === 'user_already_exists') {
				erros = { email: texto };
				emailJaExiste = true;
			} else if (error.code === 'weak_password') erros = { senha: texto };
			else erros = { geral: texto };
			return;
		}
		// Com confirmação de e-mail ligada, um e-mail já cadastrado volta sem identidades.
		if (data.user && data.user.identities?.length === 0) {
			erros = { email: 'Este e-mail já tem conta.' };
			emailJaExiste = true;
			return;
		}
		if (data.session) {
			await goto(volta, { replaceState: true, invalidateAll: true });
			return;
		}
		enviadoPara = email.trim();
		iniciarEspera();
	}

	async function reenviar() {
		const { error } = await supabase().auth.resend({ type: 'signup', email: enviadoPara, options: { emailRedirectTo: redirecionar() } });
		if (error) toasts.mostrar(mensagemAuth(error), 'erro');
		else toasts.mostrar('E-mail de confirmação reenviado.', 'sucesso');
		iniciarEspera();
	}

	const minutos = $derived(`${Math.floor(espera / 60)}:${String(espera % 60).padStart(2, '0')}`);
</script>

<PainelConta capa="capa-montanha">
	{#if enviadoPara}
		<div class="camada flex flex-col items-center gap-3 px-6 py-8 text-center" role="status">
			<img src="/illustrations/il-enviado-96.png" width="96" height="96" alt="" class="[image-rendering:pixelated]" />
			<h1 class="m-0 font-mincho text-[26px] leading-[34px] font-bold">Confirme seu e-mail</h1>
			<p class="m-0 text-[15px] leading-[23px] text-mut">
				Enviamos um link para <b class="text-fg">{enviadoPara}</b>.
				{#if vindoDeConvite}Depois de confirmar, você volta para o convite.{:else}Depois de confirmar, você já entra na sua conta.{/if}
			</p>
			<button type="button" class="btn-jogo btn-contorno mt-1.5" disabled={espera > 0} onclick={reenviar}>REENVIAR E-MAIL</button>
			{#if espera > 0}<span class="text-xs leading-4 text-mut">Disponível de novo em {minutos}</span>{/if}
			<span class="text-[13px] leading-[18px] text-mut">Não chegou? Olhe a caixa de spam ou <button type="button" class="link" onclick={() => (enviadoPara = '')}>corrija o e-mail</button>.</span>
		</div>
	{:else}
		{#if vindoDeConvite}<FaixaConvite {volta} acao="Crie sua conta para aceitar." />{/if}
		<div class="flex flex-col gap-1.5">
			<span class="t-rotulo">Conta</span>
			<h1 class="t-h1 m-0">Criar conta</h1>
		</div>
		{#if erros.geral}<Alerta tipo="erro" titulo={erros.geral} />{/if}
		<form class="flex flex-col gap-4" novalidate onsubmit={criar}>
			<Campo id="cc-nome" rotulo="Nome de exibição" ajuda="É o nome que o grupo vê." erro={erros.nome}>
				<input
					id="cc-nome"
					class="campo h-12"
					autocomplete="nickname"
					maxlength="40"
					bind:value={nome}
					aria-invalid={!!erros.nome || undefined}
					aria-describedby={erros.nome ? 'cc-nome-erro' : 'cc-nome-ajuda'}
					style:border-color={erros.nome ? 'var(--err)' : undefined}
				/>
			</Campo>
			<Campo id="cc-email" rotulo="E-mail" erro={erros.email}>
				<input
					id="cc-email"
					type="email"
					class="campo h-12"
					autocomplete="email"
					placeholder="voce@exemplo.com"
					bind:value={email}
					aria-invalid={!!erros.email || undefined}
					aria-describedby={erros.email ? 'cc-email-erro' : undefined}
					style:border-color={erros.email ? 'var(--err)' : undefined}
					oninput={() => erros.email && (erros = { ...erros, email: undefined })}
				/>
				{#snippet acaoErro()}
					{#if emailJaExiste}<a href="/entrar?email={encodeURIComponent(email.trim())}{voltaBruta ? `&volta=${encodeURIComponent(volta)}` : ''}" class="link">Entrar em vez disso?</a>{/if}
				{/snippet}
			</Campo>
			<div class="flex flex-col gap-1.5">
				<Campo id="cc-senha" rotulo="Senha" erro={erros.senha}>
					<CampoSenha
						id="cc-senha"
						bind:valor={senha}
						autocomplete="new-password"
						invalido={!!erros.senha}
						aria-describedby={erros.senha ? 'cc-senha-erro' : 'cc-senha-forca'}
					/>
				</Campo>
				{#if !erros.senha}<MedidorSenha {senha} id="cc-senha-forca" />{/if}
			</div>
			<div class="flex flex-col gap-1">
				<label class="flex min-h-11 cursor-pointer items-center gap-2.5 text-sm leading-5">
					<input type="checkbox" bind:checked={termos} class="caixa" aria-invalid={!!erros.termos || undefined} />
					<span>Li e aceito os <a href="/termos" class="link" target="_blank" rel="noopener">termos de uso</a></span>
				</label>
				{#if erros.termos}<span class="text-[13px] leading-[18px] font-semibold text-err" role="alert">{erros.termos}</span>{/if}
			</div>
			<button type="submit" class="btn-jogo btn-primario min-h-[52px] text-[15px]" disabled={enviando} aria-busy={enviando}>
				{#if enviando}<Girando />CRIANDO…{:else}CRIAR CONTA{/if}
			</button>
		</form>
		<span class="text-center text-sm leading-5">Já tem conta? <a href="/entrar{sufixo}" class="link font-semibold">Entrar</a></span>
	{/if}
</PainelConta>
