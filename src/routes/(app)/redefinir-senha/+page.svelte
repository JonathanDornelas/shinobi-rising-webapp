<script lang="ts">
	// A3 · passos 3 e 4 e link expirado. Chega aqui pela sessão de recuperação criada em /auth/callback.
	import { page } from '$app/state';
	import CampoSenha from '#lib/componentes/conta/CampoSenha.svelte';
	import MedidorSenha from '#lib/componentes/conta/MedidorSenha.svelte';
	import PainelConta from '#lib/componentes/conta/PainelConta.svelte';
	import Alerta from '#lib/componentes/ui/Alerta.svelte';
	import Campo from '#lib/componentes/ui/Campo.svelte';
	import Girando from '#lib/componentes/ui/Girando.svelte';
	import { SENHA_MINIMA } from '#lib/conta/regras.ts';
	import { sessao } from '#lib/estado/sessao.svelte.ts';
	import { mensagemAuth, supabase } from '#lib/supabase/cliente.ts';

	let senha = $state('');
	let repetida = $state('');
	let erros = $state<{ senha?: string; repetida?: string; geral?: string }>({});
	let salvando = $state(false);
	let pronto = $state(false);

	const expirado = $derived(page.url.searchParams.get('erro') === 'expirado' || (sessao.pronta && !sessao.usuario && !pronto));

	async function salvar(e: SubmitEvent) {
		e.preventDefault();
		const er: typeof erros = {};
		if (senha.length < SENHA_MINIMA) er.senha = `A senha precisa de ${SENHA_MINIMA} caracteres ou mais.`;
		if (repetida !== senha) er.repetida = 'As duas senhas não são iguais.';
		erros = er;
		if (Object.keys(er).length) return;
		salvando = true;
		const { error } = await supabase().auth.updateUser({ password: senha });
		salvando = false;
		if (error) {
			const texto = mensagemAuth(error);
			if (error.code === 'weak_password' || error.code === 'same_password') erros = { senha: texto };
			else erros = { geral: texto };
			return;
		}
		pronto = true;
	}
</script>

<PainelConta capa="capa-taki">
	{#if pronto}
		<div class="flex flex-col gap-3 border-2 border-ok bg-b1 p-5" role="status">
			<img src="/illustrations/il-aprovado-96.png" width="96" height="96" alt="" class="[image-rendering:pixelated]" />
			<h1 class="t-h2 m-0">Senha redefinida</h1>
			<p class="m-0 text-[15px] leading-[23px] text-mut">Pronto. A partir de agora, entre com a nova senha.</p>
			<a href="/campanhas" class="btn-jogo btn-primario mt-2 min-h-12">CONTINUAR</a>
		</div>
	{:else if expirado}
		<div class="flex flex-col gap-3 border-2 border-err bg-b1 p-5" role="alert">
			<img src="/illustrations/il-erro-96.png" width="96" height="96" alt="" class="[image-rendering:pixelated]" />
			<h1 class="t-h2 m-0">Este link expirou</h1>
			<p class="m-0 text-[15px] leading-[23px] text-mut">
				Links de recuperação valem por 1 hora e só funcionam uma vez, no mesmo navegador em que foram pedidos. Peça um novo.
			</p>
			<a href="/recuperar-senha" class="btn-jogo btn-primario mt-2 min-h-12">PEDIR NOVO LINK</a>
		</div>
	{:else if !sessao.pronta}
		<div class="flex items-center gap-3 text-mut" role="status"><Girando />Conferindo o link…</div>
	{:else}
		<div class="flex flex-col gap-1.5">
			<span class="t-rotulo">Conta</span>
			<h1 class="t-h1 m-0">Nova senha</h1>
		</div>
		<p class="m-0 text-[15px] leading-[23px] text-mut">Use 12 caracteres ou mais para ficar forte (mínimo de {SENHA_MINIMA}).</p>
		{#if erros.geral}<Alerta tipo="erro" titulo={erros.geral} />{/if}
		<form class="flex flex-col gap-4" novalidate onsubmit={salvar}>
			<input type="email" autocomplete="username" value={sessao.usuario?.email ?? ''} hidden readonly />
			<div class="flex flex-col gap-1.5">
				<Campo id="ns-senha" rotulo="Nova senha" erro={erros.senha}>
					<CampoSenha
						id="ns-senha"
						bind:valor={senha}
						autocomplete="new-password"
						invalido={!!erros.senha}
						aria-describedby={erros.senha ? 'ns-senha-erro' : 'ns-forca'}
					/>
				</Campo>
				{#if !erros.senha}<MedidorSenha {senha} id="ns-forca" />{/if}
			</div>
			<Campo id="ns-repetida" rotulo="Repita a senha" erro={erros.repetida}>
				<CampoSenha
					id="ns-repetida"
					bind:valor={repetida}
					autocomplete="new-password"
					invalido={!!erros.repetida}
					aria-describedby={erros.repetida ? 'ns-repetida-erro' : undefined}
				/>
			</Campo>
			<button type="submit" class="btn-jogo btn-primario min-h-12" disabled={salvando} aria-busy={salvando}>
				{#if salvando}<Girando />SALVANDO…{:else}SALVAR SENHA{/if}
			</button>
		</form>
	{/if}
</PainelConta>
