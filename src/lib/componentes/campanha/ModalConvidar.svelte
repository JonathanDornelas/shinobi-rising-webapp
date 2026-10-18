<script lang="ts">
	// C5 · Modal "Convidar jogadores": abas E-MAIL, LINK e CÓDIGO.
	// O app ainda não envia e-mails: quem já tem conta recebe o aviso no sino; para os outros, o Mestre manda o link.
	import { invalidateAll } from '$app/navigation';
	import { GRUPO_SUGERIDO } from '#lib/campanhas/dominio.ts';
	import { copiar, copiarConvite, linkConvite, situacaoConvite, type ConviteResumo } from '#lib/campanhas/convites.ts';
	import { emailValido } from '#lib/conta/regras.ts';
	import { toasts } from '#lib/estado/toasts.svelte.ts';
	import { expiraEm } from '#lib/formatar.ts';
	import { supabase } from '#lib/supabase/cliente.ts';
	import Alerta from '../ui/Alerta.svelte';
	import Campo from '../ui/Campo.svelte';
	import Girando from '../ui/Girando.svelte';
	import Icone from '../ui/Icone.svelte';
	import Modal from '../ui/Modal.svelte';

	interface Props {
		campanhaId: string;
		pessoas: number;
		convites: ConviteResumo[];
		aoFechar: () => void;
	}
	let { campanhaId, pessoas, convites, aoFechar }: Props = $props();

	type Aba = 'email' | 'link' | 'codigo';
	let aba = $state<Aba>('link');
	let ocupado = $state(false);

	// ---------------------------------------------------------------- e-mail
	let emails = $state<string[]>([]);
	let rascunho = $state('');
	let mensagem = $state('');
	let enviados = $state<{ email: string; token: string }[]>([]);
	const invalidos = $derived(emails.filter((e) => !emailValido(e)));

	function adicionar(texto = rascunho) {
		const novos = texto
			.split(/[\s,;]+/)
			.map((e) => e.trim().toLowerCase())
			.filter((e) => e && !emails.includes(e));
		if (novos.length) emails = [...emails, ...novos];
		rascunho = '';
	}
	function teclar(e: KeyboardEvent) {
		if (['Enter', ',', ';', ' '].includes(e.key)) {
			e.preventDefault();
			adicionar();
		} else if (e.key === 'Backspace' && !rascunho && emails.length) emails = emails.slice(0, -1);
	}

	async function enviar() {
		adicionar();
		if (!emails.length || invalidos.length) return;
		ocupado = true;
		const expira = new Date(Date.now() + 7 * 864e5).toISOString();
		const { data, error } = await supabase()
			.from('convites')
			.insert(emails.map((email) => ({ campanha_id: campanhaId, tipo: 'email' as const, email, mensagem: mensagem.trim() || null, expira_em: expira })))
			.select('email, token');
		ocupado = false;
		if (error || !data) return toasts.mostrar('Não foi possível criar os convites. Tente de novo.', 'erro');
		enviados = data.map((d) => ({ email: d.email ?? '', token: d.token }));
		emails = [];
		mensagem = '';
		await invalidateAll();
	}

	// ---------------------------------------------------------------- link e código
	const VALIDADES = [
		{ id: '24h', nome: '24H', horas: 24 },
		{ id: '7d', nome: '7 DIAS', horas: 168 },
		{ id: '30d', nome: '30 DIAS', horas: 720 },
		{ id: 'sem', nome: 'SEM', horas: 0 }
	] as const;
	let validade = $state<(typeof VALIDADES)[number]['id']>('7d');
	let limite = $state<number | null>(null);
	const ativo = (tipo: 'link' | 'codigo') => convites.find((c) => c.tipo === tipo && situacaoConvite(c) === 'pendente');
	const atual = $derived(aba === 'email' ? undefined : ativo(aba));

	async function gerar(tipo: 'link' | 'codigo') {
		ocupado = true;
		const sb = supabase();
		const anterior = ativo(tipo);
		if (anterior) await sb.from('convites').update({ status: 'revogado' }).eq('id', anterior.id);
		const horas = VALIDADES.find((v) => v.id === validade)!.horas;
		const { error } = await sb.from('convites').insert({
			campanha_id: campanhaId,
			tipo,
			expira_em: horas ? new Date(Date.now() + horas * 36e5).toISOString() : null,
			max_usos: limite && limite > 0 ? Math.floor(limite) : null
		});
		ocupado = false;
		if (error) return toasts.mostrar('Não foi possível gerar o convite. Tente de novo.', 'erro');
		await invalidateAll();
	}
	async function revogar(id: string) {
		ocupado = true;
		await supabase().from('convites').update({ status: 'revogado' }).eq('id', id);
		ocupado = false;
		toasts.mostrar('Convite revogado. O link antigo deixa de funcionar.', 'info');
		await invalidateAll();
	}

	const acima = $derived(pessoas + (aba === 'email' ? emails.length : 0) - GRUPO_SUGERIDO.max);
</script>

<Modal rotulo="Convidar jogadores" largura={600} topo={120} {aoFechar}>
	<div class="flex items-center bg-grena py-3 pr-3 pl-5">
		<h2 class="m-0 flex-1 font-mincho text-[22px] leading-7 font-bold text-papel">Convidar jogadores</h2>
		<button type="button" class="flex h-11 w-11 items-center justify-center text-papel hover:bg-[#2E2420]" aria-label="Fechar" onclick={aoFechar}>
			<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="square" aria-hidden="true"><path d="M18 6 6 18M6 6l12 12" /></svg>
		</button>
	</div>
	<div role="tablist" aria-label="Forma do convite" class="flex border-b-2 border-ink bg-b1">
		{#each [['email', 'E-MAIL'], ['link', 'LINK'], ['codigo', 'CÓDIGO']] as const as [id, nome] (id)}
			<button
				type="button"
				role="tab"
				aria-selected={aba === id}
				class="flex-1 p-3.5 font-pixel text-sm leading-none font-bold tracking-[0.06em] {aba === id ? 'bg-vermelhao text-white' : 'text-mut hover:text-fg'}"
				onclick={() => (aba = id)}>{nome}</button
			>
		{/each}
	</div>

	<div class="flex min-h-[220px] flex-col gap-3.5 p-5" role="tabpanel">
		{#if aba === 'email'}
			{#if enviados.length}
				<Alerta tipo="sucesso" titulo={enviados.length === 1 ? 'Convite criado.' : `${enviados.length} convites criados.`}>
					<span>Quem já tem conta recebe o aviso no sino. Para os outros, mande o link pessoal:</span>
					<ul class="m-0 flex list-none flex-col gap-1 p-0">
						{#each enviados as e (e.token)}
							<li class="flex flex-wrap items-center gap-2">
								<b class="font-semibold">{e.email}</b>
								<button type="button" class="link text-[13px] font-semibold" onclick={() => copiar(linkConvite(e.token), `Link de ${e.email} copiado.`)}>Copiar link</button>
							</li>
						{/each}
					</ul>
				</Alerta>
			{/if}
			<div class="flex flex-col gap-1.5">
				<label for="conv-emails" class="text-sm leading-5 font-semibold">E-mails</label>
				<div
					class="campo flex h-auto min-h-[52px] flex-wrap items-center gap-1.5 p-1.5"
					style:border-color={invalidos.length ? 'var(--err)' : undefined}
					role="presentation"
					onclick={(e) => (e.currentTarget.querySelector('input') as HTMLInputElement).focus()}
				>
					{#each emails as e (e)}
						{@const ok = emailValido(e)}
						<span class="inline-flex h-8 items-center gap-1 border-2 pr-1 pl-2.5 text-[13px] leading-none font-semibold {ok ? 'border-mut' : 'border-err text-err'}">
							{e}
							<button type="button" class="flex h-6 w-6 items-center justify-center hover:bg-b3" aria-label="Remover {e}" onclick={() => (emails = emails.filter((x) => x !== e))}>✕</button>
						</span>
					{/each}
					<input
						id="conv-emails"
						type="email"
						class="h-8 min-w-[180px] flex-1 bg-transparent px-1.5 text-[15px] text-fg outline-none placeholder:text-mut"
						placeholder={emails.length ? '' : 'carla@exemplo.com, diego@exemplo.com'}
						autocomplete="off"
						bind:value={rascunho}
						onkeydown={teclar}
						onblur={() => adicionar()}
						onpaste={(e) => {
							e.preventDefault();
							adicionar(e.clipboardData?.getData('text') ?? '');
						}}
						aria-describedby="conv-emails-ajuda"
					/>
				</div>
				{#if invalidos.length}
					<span id="conv-emails-ajuda" class="flex items-center gap-1 text-[13px] leading-[18px] font-semibold text-err" role="alert">
						<Icone id="status/ic-status-rejeitado" />“{invalidos[0]}” não é um e-mail válido.
					</span>
				{:else}
					<span id="conv-emails-ajuda" class="text-[13px] leading-[18px] text-mut">Separe com vírgula ou Enter. Cada convite vale para uma pessoa por 7 dias.</span>
				{/if}
			</div>
			<Campo id="conv-msg" rotulo="Mensagem (opcional)">
				<textarea id="conv-msg" class="campo h-auto min-h-16 resize-y py-2.5 text-[15px] leading-[22px]" maxlength="500" placeholder="Sessão zero na sexta, 20h." bind:value={mensagem}></textarea>
			</Campo>
		{:else}
			{#if atual}
				{#if aba === 'link'}
					<div class="flex flex-col gap-1.5">
						<label for="conv-link" class="text-sm leading-5 font-semibold">Link do convite</label>
						<div class="flex gap-2">
							<input id="conv-link" class="campo min-w-0 flex-1 text-[15px]" readonly value={linkConvite(atual.token)} onfocus={(e) => e.currentTarget.select()} />
							<button type="button" class="btn-jogo btn-primario min-h-11 px-3.5 text-[13px]" onclick={() => copiarConvite(atual)}>COPIAR</button>
						</div>
					</div>
				{:else}
					<div class="flex flex-col items-center gap-2.5 py-4">
						<span class="text-sm leading-5 font-semibold text-mut">Código curto para dizer em voz alta</span>
						<span class="border-2 border-[#8B2E20] bg-b1 px-5 py-3.5 font-pixel text-5xl leading-none font-bold tracking-[0.12em] sombra-painel">{atual.codigo}</span>
						<button type="button" class="btn-jogo btn-contorno min-h-11 px-3.5 text-[13px]" onclick={() => copiarConvite(atual)}>COPIAR CÓDIGO</button>
					</div>
				{/if}
				<p class="m-0 text-[13px] leading-[18px] text-mut">
					{expiraEm(atual.expira_em) === 'sem validade' ? 'Sem validade' : expiraEm(atual.expira_em).replace(/^e/, 'E')} ·
					{atual.max_usos ? `${atual.usos} de ${atual.max_usos} usos` : `${atual.usos} ${atual.usos === 1 ? 'uso' : 'usos'}, sem limite`}
				</p>
			{:else}
				<p class="m-0 text-[15px] leading-[23px] text-mut">
					{aba === 'link' ? 'Gere um link para mandar no grupo da mesa.' : 'Gere um código para dizer em voz alta na sessão zero.'} Quem abrir entra como Jogador.
				</p>
			{/if}

			<div class="grid gap-3 sm:grid-cols-2">
				<div class="flex flex-col gap-1.5">
					<span class="text-sm leading-5 font-semibold" id="rot-validade">Validade {atual ? 'do próximo' : ''}</span>
					<div class="flex border-2 border-frame" role="group" aria-labelledby="rot-validade">
						{#each VALIDADES as v, i (v.id)}
							<button
								type="button"
								class="t-num min-h-10 flex-1 text-xs {i ? 'border-l-2 border-frame' : ''} {validade === v.id ? 'bg-vermelhao text-white' : ''}"
								aria-pressed={validade === v.id}
								onclick={() => (validade = v.id)}>{v.nome}</button
							>
						{/each}
					</div>
				</div>
				<Campo id="conv-limite" rotulo="Limite de usos">
					<input id="conv-limite" type="number" min="1" max="50" inputmode="numeric" class="campo t-num h-10 text-[15px]" placeholder="Sem limite" bind:value={limite} />
				</Campo>
			</div>
			<div class="flex flex-wrap items-center gap-4 text-[13px] leading-[18px] font-semibold">
				{#if atual}
					<button type="button" class="link" disabled={ocupado} onclick={() => gerar(aba as 'link' | 'codigo')}>Gerar novo</button>
					<button type="button" class="link text-err" disabled={ocupado} onclick={() => revogar(atual.id)}>Revogar {aba === 'link' ? 'link' : 'código'}</button>
				{:else}
					<button type="button" class="btn-jogo btn-primario" disabled={ocupado} aria-busy={ocupado} onclick={() => gerar(aba as 'link' | 'codigo')}>
						{#if ocupado}<Girando />{/if}GERAR {aba === 'link' ? 'LINK' : 'CÓDIGO'}
					</button>
				{/if}
			</div>
		{/if}
	</div>

	<div class="flex flex-wrap items-center gap-2 border-t-2 border-b3 px-5 py-3">
		<span class="flex min-w-[200px] flex-1 items-center gap-1 text-[13px] leading-[18px] font-medium text-mut">
			{#if acima > 0}
				<Icone id="callout/ic-callout-atencao" />{aba === 'email' && emails.length ? `Com mais ${emails.length} ${emails.length === 1 ? 'jogador' : 'jogadores'} o grupo passa de ${GRUPO_SUGERIDO.max} pessoas.` : `O grupo já passa de ${GRUPO_SUGERIDO.max} pessoas.`}
			{:else if aba === 'email'}
				O app ainda não envia e-mails: quem já tem conta vê o convite no sino.
			{/if}
		</span>
		{#if aba === 'email'}
			<button type="button" class="btn-jogo btn-primario" disabled={ocupado || (!emails.length && !rascunho.trim()) || invalidos.length > 0} aria-busy={ocupado} onclick={enviar}>
				{#if ocupado}<Girando />{/if}ENVIAR
			</button>
		{:else}
			<button type="button" class="btn-jogo btn-contorno" onclick={aoFechar}>CONCLUIR</button>
		{/if}
	</div>
</Modal>
