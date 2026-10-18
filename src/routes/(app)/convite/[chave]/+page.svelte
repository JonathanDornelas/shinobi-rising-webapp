<script lang="ts">
	// C6 · Aceitar convite: válido, visitante, já é membro, outro e-mail, expirado, revogado, esgotado e afins.
	import { goto, refreshAll } from '$app/navigation';
	import Alerta from '#lib/componentes/ui/Alerta.svelte';
	import Girando from '#lib/componentes/ui/Girando.svelte';
	import { rotuloEra, urlCapa } from '#lib/campanhas/dominio.ts';
	import { sessao } from '#lib/estado/sessao.svelte.ts';
	import { toasts } from '#lib/estado/toasts.svelte.ts';
	import { supabase } from '#lib/supabase/cliente.ts';
	import Retrato from '#lib/componentes/ui/Retrato.svelte';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
	const cv = $derived(data.convite);
	const k = $derived(cv?.campanha);
	const situacao = $derived(cv?.situacao ?? 'nao_encontrado');
	const volta = $derived(encodeURIComponent(`/convite/${data.chave}`));

	let ocupado = $state<'aceitar' | 'recusar' | 'trocar' | null>(null);
	let falha = $state('');

	async function aceitar() {
		ocupado = 'aceitar';
		falha = '';
		const { data: id, error } = await supabase().rpc('aceitar_convite', { chave: data.chave });
		ocupado = null;
		if (error || !id) {
			falha = 'Este convite não está mais disponível.';
			await refreshAll();
			return;
		}
		toasts.mostrar(`Bem-vindo a ${k?.nome}!`, 'sucesso');
		await goto(`/campanhas/${id}`, { refreshAll: true });
	}

	async function recusar() {
		if (cv?.tipo !== 'email') return goto('/campanhas');
		ocupado = 'recusar';
		const { error } = await supabase().rpc('recusar_convite', { chave: data.chave });
		ocupado = null;
		if (error) return (falha = 'Não foi possível recusar agora. Tente de novo.');
		toasts.mostrar('Convite recusado. O Mestre fica sabendo.', 'info');
		await goto('/campanhas', { refreshAll: true });
	}

	async function trocarConta() {
		ocupado = 'trocar';
		await sessao.sair();
		await goto(`/entrar?volta=${volta}`, { refreshAll: true });
	}

	type Estado = { imagem: string; titulo: string; texto: string; borda?: string };
	const ESTADOS: Partial<Record<string, Estado>> = $derived({
		expirado: { imagem: '/illustrations/il-erro-96.png', titulo: 'Este convite expirou', texto: 'Peça um novo link ao Mestre.' },
		revogado: { imagem: '/icons/status/ic-status-revogado-32.png', titulo: 'Convite revogado', texto: 'O Mestre cancelou este convite.' },
		esgotado: {
			imagem: '/icons/callout/ic-callout-atencao-32.png',
			titulo: 'Vagas esgotadas',
			texto: `Este link já foi usado ${cv?.max_usos ?? ''} ${cv?.max_usos === 1 ? 'vez' : 'vezes'}, o limite definido pelo Mestre.`
		},
		aceito: { imagem: '/illustrations/il-aprovado-96.png', titulo: 'Convite já aceito', texto: 'Este convite já foi usado por outra conta.' },
		recusado: { imagem: '/icons/status/ic-status-revogado-32.png', titulo: 'Convite recusado', texto: 'Este convite foi recusado. Se mudou de ideia, peça outro ao Mestre.' },
		arquivada: { imagem: '/icons/status/ic-status-revogado-32.png', titulo: 'Campanha arquivada', texto: 'Esta campanha está arquivada e não recebe novos jogadores.' },
		outro_email: {
			imagem: '/illustrations/il-403-96.png',
			titulo: 'Convite para outra conta',
			texto: `Este convite foi enviado para ${cv?.email ?? 'outro e-mail'}. Entre com essa conta para aceitar.`,
			borda: 'var(--warn)'
		},
		nao_encontrado: { imagem: '/illustrations/il-404-96.png', titulo: 'Convite não encontrado', texto: 'Confira o link ou o código. Códigos têm 6 caracteres, como KNH-4F2.' }
	});
	const estado = $derived(ESTADOS[situacao]);
	const pequena = (src: string) => src.endsWith('-32.png');
</script>

<main class="flex flex-1 items-start justify-center bg-b0 px-4 py-8 md:items-center md:py-10">
	{#if k && (situacao === 'valido' || situacao === 'visitante' || situacao === 'ja_membro')}
		<article class="camada flex w-full max-w-[640px] flex-col">
			<div class="relative">
				<img src={urlCapa(k.capa)} alt="" class="h-[180px] w-full border-b-2 border-carvao object-cover [image-rendering:pixelated] md:h-[238px]" />
				<img src="/illustrations/il-convite-96.png" width="96" height="96" alt="" class="absolute -bottom-10 left-6 border-2 border-[var(--vermelhao-lo)] bg-b1 [image-rendering:pixelated]" />
			</div>
			<div class="flex flex-col gap-3 px-6 pt-[52px] pb-6">
				<span class="font-pixel text-xs leading-none font-bold tracking-[0.1em] text-title">CONVITE PARA A CAMPANHA</span>
				<h1 class="m-0 font-mincho text-[30px] leading-[38px] font-bold max-md:text-[26px] max-md:leading-[34px]">{k.nome}</h1>
				<div class="flex flex-wrap items-center gap-2.5">
					{#if k.mestre}<Retrato nome={k.mestre} tamanho={32} /><span class="text-sm leading-5 font-semibold">Mestre: {k.mestre}</span>{/if}
					<span class="border-2 border-b3 px-[7px] py-[5px] font-pixel text-xs leading-none font-semibold text-mut">{rotuloEra(k)}</span>
					<span class="text-sm leading-5 font-semibold text-mut">{k.jogadores === 1 ? '1 jogador' : `${k.jogadores} jogadores`}</span>
				</div>
				{#if k.premissa}<p class="m-0 text-[15px] leading-[23px] whitespace-pre-line">{k.premissa}</p>{/if}
				{#if cv?.mensagem}
					<blockquote class="m-0 border-l-4 border-vermelhao bg-b1 px-3 py-2 text-[15px] leading-[23px]">
						<b>{cv.convidado_por ?? 'O Mestre'}:</b> “{cv.mensagem}”
					</blockquote>
				{/if}
				{#if falha}<Alerta tipo="erro" titulo={falha} />{/if}

				{#if situacao === 'valido'}
					<div class="mt-2 flex flex-wrap gap-2">
						<button type="button" class="btn-jogo btn-fantasma min-h-12" disabled={!!ocupado} onclick={recusar}>
							{#if ocupado === 'recusar'}<Girando />{/if}{cv?.tipo === 'email' ? 'RECUSAR' : 'AGORA NÃO'}
						</button>
						<span class="flex-1"></span>
						<button type="button" class="btn-jogo btn-primario min-h-12 px-5 text-[15px] max-sm:w-full" disabled={!!ocupado} aria-busy={ocupado === 'aceitar'} onclick={aceitar}>
							{#if ocupado === 'aceitar'}<Girando />{/if}ACEITAR CONVITE
						</button>
					</div>
				{:else if situacao === 'visitante'}
					<Alerta tipo="info" titulo="Entre para aceitar"><span>Você precisa de uma conta para participar. Leva menos de um minuto.</span></Alerta>
					<div class="flex flex-wrap justify-end gap-2">
						<a href="/criar-conta?volta={volta}" class="btn-jogo btn-contorno min-h-12 max-sm:flex-1">CRIAR CONTA</a>
						<a href="/entrar?volta={volta}" class="btn-jogo btn-primario min-h-12 max-sm:flex-1">ENTRAR</a>
					</div>
				{:else}
					<Alerta tipo="sucesso" titulo="Você já está nesta campanha." />
					<a href="/campanhas/{k.id}" class="btn-jogo btn-primario min-h-12 self-end max-sm:self-stretch">IR PARA A CAMPANHA</a>
				{/if}
			</div>
		</article>
	{:else if estado}
		<div class="flex w-full max-w-[440px] flex-col gap-4 border-2 bg-b2 p-5 sombra-painel" style:border-color={estado.borda ?? 'var(--frame)'} role="alert">
			<div class="flex items-start gap-3">
				<img src={estado.imagem} width={pequena(estado.imagem) ? 32 : 64} height={pequena(estado.imagem) ? 32 : 64} alt="" class="flex-none [image-rendering:pixelated] {pequena(estado.imagem) ? 'm-4' : ''}" />
				<div class="flex flex-col gap-1">
					<h1 class="m-0 font-mincho text-lg leading-6 font-bold">{estado.titulo}</h1>
					{#if k}<span class="text-[13px] leading-[18px] font-semibold">{k.nome}</span>{/if}
					<p class="m-0 text-sm leading-[21px] text-mut">{estado.texto}</p>
				</div>
			</div>
			<div class="flex flex-wrap justify-end gap-2">
				{#if situacao === 'outro_email'}
					<button type="button" class="btn-jogo btn-contorno" disabled={!!ocupado} onclick={trocarConta}>{#if ocupado}<Girando />{/if}TROCAR DE CONTA</button>
				{:else}
					<a href={sessao.usuario ? '/campanhas' : '/'} class="btn-jogo btn-contorno">{sessao.usuario ? 'MINHAS CAMPANHAS' : 'VOLTAR AO INÍCIO'}</a>
				{/if}
			</div>
		</div>
	{/if}
</main>
