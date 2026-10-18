<script lang="ts">
	// A1 · Entrar: e-mail e senha. Vindo de convite mostra a faixa; erros de credencial, conta não verificada e muitas tentativas.
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import CampoSenha from '#lib/componentes/conta/CampoSenha.svelte';
	import FaixaConvite from '#lib/componentes/conta/FaixaConvite.svelte';
	import PainelConta from '#lib/componentes/conta/PainelConta.svelte';
	import Alerta from '#lib/componentes/ui/Alerta.svelte';
	import Campo from '#lib/componentes/ui/Campo.svelte';
	import Girando from '#lib/componentes/ui/Girando.svelte';
	import { destinoSeguro } from '#lib/conta/regras.ts';
	import { toasts } from '#lib/estado/toasts.svelte.ts';
	import { mensagemAuth, supabase } from '#lib/supabase/cliente.ts';

	type Falha = { tipo: 'credenciais' | 'nao-verificada' | 'tentativas' | 'outro'; texto: string };

	const voltaBruta = $derived(page.url.searchParams.get('volta'));
	const volta = $derived(destinoSeguro(voltaBruta));
	const vindoDeConvite = $derived(volta.startsWith('/convite/'));
	const linkExpirado = $derived(page.url.searchParams.get('erro') === 'expirado');

	let email = $state(page.url.searchParams.get('email') ?? '');
	let senha = $state('');
	let enviando = $state(false);
	let falha = $state<Falha | null>(null);
	let erroEmail = $state('');
	let erroSenha = $state('');
	let reenviado = $state(false);

	async function entrar(e: SubmitEvent) {
		e.preventDefault();
		erroEmail = email.trim() ? '' : 'Informe seu e-mail.';
		erroSenha = senha ? '' : 'Informe sua senha.';
		if (erroEmail || erroSenha) return;
		enviando = true;
		falha = null;
		const { error } = await supabase().auth.signInWithPassword({ email: email.trim(), password: senha });
		if (!error) {
			await goto(volta, { replace: true, refreshAll: true });
			return;
		}
		enviando = false;
		const texto = mensagemAuth(error);
		if (error.code === 'email_not_confirmed') falha = { tipo: 'nao-verificada', texto };
		else if (error.status === 429 || error.code?.startsWith('over_')) {
			falha = { tipo: 'tentativas', texto };
			setTimeout(() => falha?.tipo === 'tentativas' && (falha = null), 60_000);
		} else if (error.code === 'invalid_credentials' || error.status === 400) falha = { tipo: 'credenciais', texto };
		else falha = { tipo: 'outro', texto };
	}

	async function reenviar() {
		const { error } = await supabase().auth.resend({
			type: 'signup',
			email: email.trim(),
			options: { emailRedirectTo: `${location.origin}/auth/callback?next=${encodeURIComponent(volta)}` }
		});
		if (error) toasts.mostrar(mensagemAuth(error), 'erro');
		else {
			reenviado = true;
			toasts.mostrar('E-mail de confirmação reenviado.', 'sucesso');
		}
	}

	const sufixo = $derived(voltaBruta ? `?volta=${encodeURIComponent(volta)}` : '');
	const bloqueado = $derived(falha?.tipo === 'tentativas');
</script>

<PainelConta capa="capa-konoha" frase>
	{#if vindoDeConvite}<FaixaConvite {volta} />{/if}
	<div class="flex flex-col gap-1.5">
		<span class="t-rotulo">Conta</span>
		<h1 class="t-h1 m-0">Entrar</h1>
	</div>

	{#if linkExpirado && !falha}
		<Alerta tipo="aviso" titulo="Este link expirou ou já foi usado.">
			<span>Entre com e-mail e senha. Se a conta ainda não foi confirmada, dá para pedir um novo link.</span>
		</Alerta>
	{/if}
	{#if falha}
		{#if falha.tipo === 'credenciais'}
			<Alerta tipo="erro" titulo={falha.texto}><span>Confira os dois campos e tente de novo.</span></Alerta>
		{:else if falha.tipo === 'nao-verificada'}
			<Alerta tipo="info" titulo={falha.texto}>
				<span>O link de confirmação foi enviado para {email.trim()}.</span>
				{#if !reenviado}<button type="button" class="link self-start font-semibold" onclick={reenviar}>Reenviar e-mail</button>{/if}
			</Alerta>
		{:else if falha.tipo === 'tentativas'}
			<Alerta tipo="aviso" titulo="Muitas tentativas seguidas."><span>Aguarde alguns minutos antes de tentar de novo.</span></Alerta>
		{:else}
			<Alerta tipo="erro" titulo={falha.texto} />
		{/if}
	{/if}

	<form class="flex flex-col gap-4" novalidate onsubmit={entrar}>
		<Campo id="entrar-email" rotulo="E-mail" erro={erroEmail}>
			<input
				id="entrar-email"
				type="email"
				class="campo h-12"
				autocomplete="email"
				placeholder="voce@exemplo.com"
				bind:value={email}
				aria-invalid={!!erroEmail || falha?.tipo === 'credenciais' || undefined}
				aria-describedby={erroEmail ? 'entrar-email-erro' : undefined}
				style:border-color={erroEmail ? 'var(--err)' : undefined}
				oninput={() => (erroEmail = '')}
			/>
		</Campo>
		<div class="flex flex-col gap-1.5">
			<Campo id="entrar-senha" rotulo="Senha" erro={erroSenha}>
				<CampoSenha
					id="entrar-senha"
					bind:valor={senha}
					autocomplete="current-password"
					placeholder="Sua senha"
					invalido={!!erroSenha || falha?.tipo === 'credenciais'}
					aria-describedby={erroSenha ? 'entrar-senha-erro' : undefined}
					oninput={() => {
						erroSenha = '';
						if (falha?.tipo === 'credenciais') falha = null;
					}}
				/>
			</Campo>
			<a href="/recuperar-senha{email.trim() ? `?email=${encodeURIComponent(email.trim())}` : ''}" class="link self-end text-[13px] leading-[18px] font-semibold">Esqueci minha senha</a>
		</div>
		<button type="submit" class="btn-jogo min-h-[52px] text-[15px] {bloqueado ? 'bg-b3 text-mut' : 'btn-primario'}" disabled={enviando || bloqueado} aria-busy={enviando}>
			{#if enviando}<Girando />ENTRANDO…{:else}ENTRAR{/if}
		</button>
	</form>
	<span class="text-center text-sm leading-5">Ainda não tem conta? <a href="/criar-conta{sufixo}" class="link font-semibold">Criar conta</a></span>
</PainelConta>
