<script lang="ts">
	// A3 · passos 1 e 2: pedir o link de recuperação. A resposta é a mesma exista ou não a conta.
	import { page } from '$app/state';
	import PainelConta from '#lib/componentes/conta/PainelConta.svelte';
	import Alerta from '#lib/componentes/ui/Alerta.svelte';
	import Campo from '#lib/componentes/ui/Campo.svelte';
	import Girando from '#lib/componentes/ui/Girando.svelte';
	import { emailValido } from '#lib/conta/regras.ts';
	import { mensagemAuth, supabase } from '#lib/supabase/cliente.ts';

	let email = $state(page.url.searchParams.get('email') ?? '');
	let erro = $state('');
	let falha = $state('');
	let enviando = $state(false);
	let enviado = $state(false);

	async function enviar(e: SubmitEvent) {
		e.preventDefault();
		erro = emailValido(email) ? '' : 'Informe um e-mail válido, como voce@exemplo.com.';
		if (erro) return;
		enviando = true;
		falha = '';
		const { error } = await supabase().auth.resetPasswordForEmail(email.trim(), {
			redirectTo: `${location.origin}/auth/callback?next=${encodeURIComponent('/redefinir-senha')}`
		});
		enviando = false;
		// Só mostramos erros que não revelam se a conta existe.
		if (error && (error.status === 429 || error.message.toLowerCase().includes('fetch'))) falha = mensagemAuth(error);
		else enviado = true;
	}
</script>

<PainelConta capa="capa-nevoa">
	{#if enviado}
		<div class="flex flex-col gap-3" role="status">
			<img src="/illustrations/il-enviado-96.png" width="96" height="96" alt="" class="[image-rendering:pixelated]" />
			<h1 class="t-h2 m-0">Verifique seu e-mail</h1>
			<p class="m-0 text-[15px] leading-[23px] text-mut">
				Se houver uma conta com <b class="text-fg">{email.trim()}</b>, enviamos um link para criar uma senha nova. Ele vale por 1 hora.
			</p>
			<a href="/entrar" class="btn-jogo btn-primario mt-2 min-h-12">VOLTAR PARA ENTRAR</a>
			<button type="button" class="link self-start text-[13px] font-semibold" onclick={() => (enviado = false)}>Usar outro e-mail</button>
		</div>
	{:else}
		<div class="flex flex-col gap-1.5">
			<span class="t-rotulo">Conta</span>
			<h1 class="t-h1 m-0">Recuperar senha</h1>
		</div>
		<p class="m-0 text-[15px] leading-[23px] text-mut">Informe o e-mail da sua conta. Enviamos um link para você criar uma senha nova.</p>
		{#if falha}<Alerta tipo="aviso" titulo={falha} />{/if}
		<form class="flex flex-col gap-4" novalidate onsubmit={enviar}>
			<Campo id="rs-email" rotulo="E-mail" {erro}>
				<input
					id="rs-email"
					type="email"
					class="campo h-12"
					autocomplete="email"
					placeholder="voce@exemplo.com"
					bind:value={email}
					aria-invalid={!!erro || undefined}
					aria-describedby={erro ? 'rs-email-erro' : undefined}
					style:border-color={erro ? 'var(--err)' : undefined}
				/>
			</Campo>
			<button type="submit" class="btn-jogo btn-primario min-h-12" disabled={enviando} aria-busy={enviando}>
				{#if enviando}<Girando />ENVIANDO…{:else}ENVIAR LINK{/if}
			</button>
		</form>
		<span class="text-center text-sm leading-5">Lembrou? <a href="/entrar" class="link font-semibold">Entrar</a></span>
	{/if}
</PainelConta>
