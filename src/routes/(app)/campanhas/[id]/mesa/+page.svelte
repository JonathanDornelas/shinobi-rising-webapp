<script lang="ts">
	// L11 · M1–M8 · Mesa tática: o quadro da cena com o Elenco à esquerda, o trilho de ferramentas, as fichas rápidas
	// flutuando e o painel de rolagens e iniciativa à direita. No celular, quadro em tela cheia, dock e painéis inferiores.
	import { goto, refreshAll } from '$app/navigation';
	import { onMount, untrack } from 'svelte';
	import { toasts } from '#lib/estado/toasts.svelte.ts';
	import { CORES, corCss, nomeCor } from '#lib/mesa/cores.ts';
	import { MOLDURAS, molduraPorId } from '#lib/mesa/molduras.ts';
	import { Mesa, type Ferramenta } from '#lib/mesa/mesa.svelte.ts';
	import { temRegua } from '#lib/mesa/regua.ts';
	import type { FichaMesa, JutsuMesa } from '#lib/mesa/tipos.ts';
	import { UiMesa, calcularMolde, nomeCurto } from '#lib/mesa/ui.svelte.ts';
	import { pvDosMembros, recursoDosMembros } from '#lib/npcs/dados.ts';
	import { rolador } from '#lib/rolagens/rolador.svelte.ts';
	import { supabase } from '#lib/supabase/cliente.ts';
	import type { Json, MesaToken, Npc, Rolagem } from '#lib/supabase/banco.ts';
	import ElencoMesa, { type ItemNpc } from '#lib/componentes/mesa/ElencoMesa.svelte';
	import FichaRapida, { type AcoesFicha, type DadosFicha } from '#lib/componentes/mesa/FichaRapida.svelte';
	import PainelMesa from '#lib/componentes/mesa/PainelMesa.svelte';
	import BuscaBestiario from '#lib/componentes/npc/BuscaBestiario.svelte';
	import { npcDoVerbete } from '#lib/bestiario/npc.ts';
	import type { Criatura, Jutsu } from '#lib/livro/tipos.ts';
	import CardJutsu from '#lib/componentes/regras/CardJutsu.svelte';
	import { urlRetrato } from '#lib/personagem/retrato.ts';
	import { TAMANHOS } from '#lib/bestiario/npc.ts';
	import { alcanceCorpo } from '#lib/mesa/geometria.ts';
	import QuadroMesa from '#lib/componentes/mesa/QuadroMesa.svelte';
	import Icone from '#lib/componentes/ui/Icone.svelte';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
	const campanha = $derived(data.campanha.id);

	// ------------------------------------------------------------------ estado
	const criar = () =>
		new Mesa({ campanha: data.campanha.id, eu: data.eu, mestre: data.mestre, arquivada: data.arquivada, cenas: data.cenas, cena: data.cena, tokens: data.tokens, tracos: data.tracos, efeitos: data.efeitos, membros: data.membros, molduraMesa: { id: molduraPorId(data.campanha.moldura)?.id ?? null, universal: !!data.campanha.moldura_universal } });
	// svelte-ignore state_referenced_locally
	let mesa = $state(criar());
	const ui = new UiMesa();
	// svelte-ignore state_referenced_locally
	let fichas = $state<FichaMesa[]>(data.fichas);
	// svelte-ignore state_referenced_locally
	let npcs = $state<Npc[]>(data.npcs);
	// svelte-ignore state_referenced_locally
	let pastas = $state(data.pastas);
	// svelte-ignore state_referenced_locally
	let chave = data.cena?.id ?? null;
	$effect(() => {
		const d = data;
		untrack(() => {
			fichas = d.fichas;
			npcs = d.npcs;
			pastas = d.pastas;
			if ((d.cena?.id ?? null) !== chave) {
				mesa.desconectar();
				chave = d.cena?.id ?? null;
				mesa = criar();
				ui.mira = null;
				ui.regua = null;
				ui.fichas = [];
				ui.aneis = null;
			}
		});
	});
	$effect(() => {
		const m = mesa;
		m.conectar();
		return () => m.desconectar();
	});
	// o Mestre ativou outra cena: quem joga recarrega para ir junto
	$effect(() => {
		if (mesa.trocouCena) untrack(() => refreshAll());
	});

	let celular = $state(false);
	onMount(() => {
		const mq = matchMedia('(max-width: 767px)');
		const tablet = matchMedia('(max-width: 1023px)');
		celular = mq.matches;
		if (tablet.matches) {
			ui.elencoAberto = false;
			ui.painelAberto = false;
		}
		const ao = () => (celular = mq.matches);
		mq.addEventListener('change', ao);
		return () => mq.removeEventListener('change', ao);
	});

	let quadro = $state<ReturnType<typeof QuadroMesa>>();
	const cena = $derived(mesa.cena);
	const ativa = $derived(data.cenas.find((c) => c.ativa) ?? mesa.cenas.find((c) => c.ativa) ?? null);

	// ------------------------------------------------------------------ rolagens (servidor + ao vivo)
	const rolagens = $derived.by(() => {
		const vivo = rolador.recentes.filter((r) => r.campanha_id === campanha);
		const mapa = new Map<string, Rolagem>();
		for (const r of [...data.rolagens, ...vivo]) mapa.set(r.id, { ...mapa.get(r.id), ...r });
		return [...mapa.values()].sort((a, b) => b.criada_em.localeCompare(a.criada_em)).slice(0, 80);
	});
	// svelte-ignore state_referenced_locally
	let vistas = rolagens.length;
	$effect(() => {
		const n = rolagens.length;
		untrack(() => {
			if (n > vistas && (!ui.painelAberto || celular)) ui.naoVistas += n - vistas;
			vistas = n;
		});
	});
	const ultima = $derived(rolagens[0] ?? null);

	// ------------------------------------------------------------------ dados de cada token
	const fichaDe = (t: MesaToken) => (t.personagem_id ? (fichas.find((f) => f.id === t.personagem_id) ?? null) : null);
	const npcDe = (t: MesaToken) => (t.npc_id ? (npcs.find((n) => n.id === t.npc_id) ?? null) : null);
	const ehMeu = (t: MesaToken) => t.dono_id === data.eu;

	function pvDe(t: MesaToken) {
		const f = fichaDe(t);
		if (f) return { pv: f.estado.pv ?? f.max.pv, max: f.max.pv };
		const n = npcDe(t);
		if (n) return { pv: pvDosMembros(n)[(t.membro ?? 1) - 1] ?? n.pv, max: n.pv };
		if (!t.personagem_id && !t.npc_id && t.pv != null && (data.mestre || ehMeu(t))) return { pv: t.pv, max: t.pv_max ?? t.pv };
		const p = mesa.pvs[t.id];
		if (cena?.mostrar_pv && p?.pv != null && p.pv_max) return { pv: p.pv, max: p.pv_max };
		return null;
	}
	const deslocamentoDe = (t: MesaToken) => fichaDe(t)?.deslocamento ?? 10;
	/** Caminho no Storage (retratos) ou arte do bestiário (/bestiario/…) → URL. */
	const url = (s: string | null | undefined) => (!s ? null : s.startsWith('/') ? s : urlRetrato(s));
	function fotoDe(t: MesaToken): string | null {
		if (t.retrato) return url(t.retrato);
		if (t.personagem_id) return url(data.personagens.find((p) => p.id === t.personagem_id)?.retrato ?? data.npcFichas.find((p) => p.id === t.personagem_id)?.retrato);
		if (t.npc_id) {
			const n = npcDe(t);
			if (n) return url(n.retrato ?? n.arte);
			return url(data.revelados.find((r) => r.id === t.npc_id)?.retrato);
		}
		if (t.ligado_a) {
			const dono = mesa.tokens.find((k) => k.id === t.ligado_a);
			return dono && dono.id !== t.id ? fotoDe(dono) : null;
		}
		return null;
	}
	function subDe(t: MesaToken) {
		const f = fichaDe(t);
		if (f) return f.sub;
		const g = t.personagem_id ? data.grupo.find((x) => x.id === t.personagem_id) : null;
		if (g) return [g.cla ? `Clã ${g.cla}` : null, `nível ${g.nivel}`].filter(Boolean).join(' · ');
		const n = npcDe(t);
		if (n) return [n.funcao || 'NPC', n.membros > 1 ? `membro ${t.membro} de ${n.membros}` : n.rank].filter(Boolean).join(' · ');
		if (t.ligado_a) return `Ligado a ${nomeCurto(mesa.tokens.find((k) => k.id === t.ligado_a)?.nome ?? '')}`;
		return mesa.membro(mesa.donoDe(t))?.nome ?? 'NPC';
	}
	function dadosDe(t: MesaToken): DadosFicha {
		const f = fichaDe(t);
		if (f) return { tipo: 'pc', ficha: f, editavel: data.mestre || f.jogadorId === data.eu };
		if (t.personagem_id) return { tipo: 'publico', sub: subDe(t) };
		const n = npcDe(t);
		if (n) return { tipo: 'npc', npc: n, jutsus: data.jutsusNpc[n.id] ?? [], extras: data.extrasNpc[n.id] ?? null };
		if (t.npc_id) return { tipo: 'revelado', npc: data.revelados.find((r) => r.id === t.npc_id) ?? null };
		return { tipo: 'livre', editavel: data.mestre || ehMeu(t) };
	}

	// ------------------------------------------------------------------ ações da ficha rápida
	/** Faixa de ferimento (a mesma conta do banco): 0 ileso, 1 ferido, 2 muito ferido, 3 caído. */
	const faixa = (pv: number, max: number) => (max <= 0 ? 0 : pv <= 0 ? 3 : pv * 2 <= max ? 2 : pv < max ? 1 : 0);
	// Uma fila por ficha: cliques seguidos (dois estados, PV e PE) saem em ordem e sempre com o estado mais recente.
	// Sem a fila, duas gravações simultâneas podiam chegar trocadas e a mais velha apagava a nova.
	const filas = new Map<string, Promise<void>>();
	function estadoPc(f: FichaMesa, patch: Partial<FichaMesa['estado']>, descricao: string) {
		f.estado = { ...f.estado, ...patch };
		// o token muda na hora para quem clicou; o banco copia para o grupo (gatilho mesa_token_da_ficha)
		const condicoes = f.estado.condicoes ?? [];
		const ferimento = faixa(f.estado.pv ?? f.max.pv, f.max.pv);
		mesa.tokens = mesa.tokens.map((t) => (t.personagem_id === f.id ? { ...t, condicoes, ferimento } : t));
		const fila = (filas.get(f.id) ?? Promise.resolve()).then(async () => {
			const { error } = await supabase().rpc('atualizar_estado', { ficha: f.id, estado: $state.snapshot(f.estado) as unknown as Json, descricao });
			if (error) toasts.mostrar('Não foi possível salvar a ficha.', 'erro');
		});
		filas.set(f.id, fila);
		return fila;
	}
	/** PV, PC ou PE de um membro do NPC (a tropa guarda um valor por membro). */
	async function recursoNpc(n: Npc, membro: number, k: 'pv' | 'pc' | 'pe', valor: number) {
		const campo = `${k}_atual` as const;
		const lista = recursoDosMembros(n, k);
		lista[membro - 1] = valor;
		const antes = n[campo];
		n[campo] = lista;
		if (k === 'pv') mesa.tokens = mesa.tokens.map((t) => (t.npc_id === n.id && (t.membro ?? 1) === membro ? { ...t, ferimento: faixa(valor, n.pv) } : t));
		const { error } = await supabase().from('npcs').update({ [campo]: lista } as Partial<Npc>).eq('id', n.id);
		if (error) {
			n[campo] = antes;
			toasts.mostrar(`Não foi possível salvar o ${k.toUpperCase()} do NPC.`, 'erro');
		}
	}
	const pvNpc = (n: Npc, membro: number, pv: number) => recursoNpc(n, membro, 'pv', pv);
	function rolar(t: MesaToken, r: { expr: string; rotulo: string; partes: [string, string][] }, tipo: 'teste' | 'ataque' | 'dano' | 'cura' | 'iniciativa', d20: boolean, origem = 'Mesa') {
		return rolador.rolar({ campanha, expressao: r.expr, rotulo: r.rotulo, personagem: t.personagem_id, npc: data.mestre ? t.npc_id : null, d20, tipo, origem, partes: r.partes });
	}
	// card inteiro do jutsu (clique no nome, na ficha rápida): buscado uma vez por slug; a habilidade do bestiário já
	// traz o texto e não tem card
	const cards = new Map<string, Jutsu | null>();
	let card = $state<{ slug: string; jutsu: Jutsu | null; carregando: boolean } | null>(null);
	async function verJutsu(j: JutsuMesa) {
		ui.modal = { tipo: 'jutsu', j };
		if (j.texto != null || cards.has(j.slug)) return void (card = { slug: j.slug, jutsu: cards.get(j.slug) ?? null, carregando: false });
		card = { slug: j.slug, jutsu: null, carregando: true };
		const r = await fetch(`/campanhas/${campanha}/mesa/jutsu/${encodeURIComponent(j.slug)}`).catch(() => null);
		const jutsu = r?.ok ? ((await r.json()) as Jutsu) : null;
		if (r && (r.ok || r.status === 404)) cards.set(j.slug, jutsu);
		if (card?.slug === j.slug) card = { slug: j.slug, jutsu, carregando: false };
	}
	function medirJutsu(t: MesaToken, j: JutsuMesa) {
		if (!temRegua(j.regua)) return void ui.avisar('Alcance especial: este jutsu não tem régua.');
		ui.mira = { jutsu: j, lancador: t.id, tx: t.x, ty: t.y, px: t.x + 0.5, py: t.y + 0.5, fixa: false, alvos: [], forma: 'cone', giro: 0, travar: false };
		ui.pop = null;
		ui.aneis = null;
		if (celular) ui.fichas = [];
	}
	async function usarJutsu(t: MesaToken, j: JutsuMesa) {
		const f = fichaDe(t);
		if (f) {
			const k = j.unidade === 'PE' ? 'pe' : 'pc';
			const atual = f.estado[k] ?? f.max[k];
			if (atual < j.custo) return void toasts.mostrar(`Faltam ${j.custo - atual} ${j.unidade} para ${j.nome}.`, 'aviso');
			const novo = atual - j.custo;
			await estadoPc(f, { [k]: novo, ...(k === 'pe' && novo === 0 ? { fadiga: Math.min(5, (f.estado.fadiga ?? 0) + 1) } : {}) }, `−${j.custo} ${j.unidade} · ${j.nome} (Mesa)`);
		}
		// o NPC também paga o jutsu (quando a ficha dele tem o recurso)
		const n = npcDe(t);
		if (n && j.custo > 0) {
			const k = j.unidade === 'PE' ? 'pe' : 'pc';
			if (n[k] > 0) {
				const atual = recursoDosMembros(n, k)[(t.membro ?? 1) - 1];
				if (atual < j.custo) return void toasts.mostrar(`Faltam ${j.custo - atual} ${j.unidade} para ${j.nome}.`, 'aviso');
				await recursoNpc(n, t.membro ?? 1, k, atual - j.custo);
			}
		}
		const m = ui.mira?.jutsu.slug === j.slug && ui.mira.lancador === t.id ? calcularMolde(ui.mira, mesa, mesa.tokens.filter((x) => x.visivel || data.mestre)) : null;
		const alvos = m?.quem.length ? `Mesa · alvos: ${m.quem.map((x) => nomeCurto(x.nome)).join(', ')}`.slice(0, 60) : 'Mesa';
		if (j.ataque) await rolar(t, j.ataque, 'ataque', true, alvos);
		if (j.dano) await rolar(t, { ...j.dano, rotulo: j.resistencia && !j.ataque ? `${j.dano.rotulo} (${j.resistencia.split('(')[0].trim()})`.slice(0, 80) : j.dano.rotulo }, 'dano', false, alvos);
		else if (j.cura) await rolar(t, { expr: j.cura, rotulo: `Cura · ${j.nome}`, partes: [] }, 'cura', false, alvos);
		if (j.porCena) ui.usadas = [...ui.usadas, `${t.id}:${j.slug}`];
		// técnicas de crescer (Baika no Jutsu, Lobo de Duas Cabeças): o token cresce pela duração e volta sozinho
		const agora = mesa.tokens.find((x) => x.id === t.id) ?? t;
		if (j.tamanho && j.tamanho > agora.tamanho && (await mesa.crescer(agora, j.tamanho, j.turnos ?? null)))
			ui.avisar(`${nomeCurto(t.nome)} ficou ${{ 3: 'Grande', 6: 'Enorme', 10: 'Colossal' }[j.tamanho]} (${j.tamanho}×${j.tamanho})${j.turnos ? ` por ${j.turnos} turnos` : ''}. Volta sozinho ao fim, ou em VOLTAR AO NORMAL na ficha.`);
		if (m && (!m.ok || j.turnos === undefined)) ui.mira = null;
		if (m && m.ok && j.turnos !== undefined) ui.avisar('Use “Deixar na cena” para o efeito ficar no quadro.');
	}
	/** Canto livre mais perto de (x, y) para um token de n × n quadrados, dentro da cena. */
	function lugarLivre(x: number, y: number, n = 1) {
		const L = cena?.largura ?? 40;
		const A = cena?.altura ?? 30;
		const livre = (a: number, b: number) =>
			a >= 0 && b >= 0 && a + n <= L && b + n <= A && !mesa.tokens.some((t) => a < t.x + t.tamanho && t.x < a + n && b < t.y + t.tamanho && t.y < b + n);
		for (let r = 0; r < 16; r++)
			for (let dx = -r; dx <= r; dx++)
				for (let dy = -r; dy <= r; dy++) if (livre(x + dx, y + dy)) return [x + dx, y + dy] as const;
		return [Math.min(L - n, Math.max(0, x)), Math.min(A - n, Math.max(0, y))] as const;
	}
	const sigla = (n: string) => n.split(/\s+/).filter((w) => w.length > 2).map((w) => w[0]).join('').slice(0, 2).toUpperCase() || n.slice(0, 2).toUpperCase();

	const acoes: AcoesFicha = {
		estadoPc,
		pvNpc,
		recursoNpc,
		token: (t, patch) => mesa.atualizarToken(t.id, patch),
		medirJutsu,
		usarJutsu,
		verJutsu,
		voltarAoNormal: (t) => mesa.voltarAoNormal(t),
		aneis: (t, corpo, lista, titulo) => {
			ui.aneis = { token: t.id, corpo, lista, titulo };
			ui.mira = null;
		},
		rolar: (t, r, tipo, d20) => rolar(t, r, tipo, d20),
		centralizar: (t) => {
			quadro?.centralizar(t);
			mesa.pulso = { token: t.id, t: Date.now() };
		},
		remover: (t) => {
			ui.fecharFicha(t.id);
			mesa.remover(t.id);
		},
		clone: async (t) => {
			const [x, y] = lugarLivre(t.x + 1, t.y);
			const c = await mesa.colocar({ nome: `Clone de ${nomeCurto(t.nome).split(' ')[0]}`.slice(0, 60), sigla: 'CL', ligado_a: t.id, dono_id: t.dono_id, x, y, pv: 1, pv_max: 1, visivel: true });
			if (c) ui.avisar('Clone criado com 1 PV. Ele some ao sofrer qualquer dano.');
		},
		notasNpc: async (n, notas) => {
			n.notas = notas;
			await supabase().from('npcs').update({ notas }).eq('id', n.id);
		}
	};

	// ------------------------------------------------------------------ pôr na cena (Elenco e arrastar)
	const itensNpc = $derived<ItemNpc[]>([
		...npcs.map((n) => ({ id: n.id, tipo: 'npc' as const, nome: n.nome, rank: n.rank, membros: n.membros, pastaId: n.pasta_id })),
		...data.npcFichas.map((f) => ({ id: f.id, tipo: 'ficha' as const, nome: f.nome, rank: 'ficha', membros: 1, pastaId: f.pastaId }))
	]);
	async function colocar(dados: string, x?: number, y?: number) {
		if (!cena) return;
		const c = quadro?.centroDaVista() ?? [Math.floor(cena.largura / 2), Math.floor(cena.altura / 2)];
		const bx = x ?? c[0];
		const by = y ?? c[1];
		const d = JSON.parse(dados) as { tipo: 'pc' | 'npc' | 'ficha' | 'pasta'; id: string; tamanho?: number };
		if (d.tipo === 'pc') {
			const p = data.personagens.find((k) => k.id === d.id);
			if (!p || mesa.tokens.some((t) => t.personagem_id === p.id)) return;
			const [px, py] = lugarLivre(bx, by);
			await mesa.colocar({ personagem_id: p.id, dono_id: p.jogadorId, nome: p.nome, sigla: sigla(p.nome), retrato: p.retrato, x: px, y: py, visivel: true });
		} else if (d.tipo === 'npc') {
			const n = npcs.find((k) => k.id === d.id);
			if (!n) return;
			const ja = new Set(mesa.tokens.filter((t) => t.npc_id === n.id).map((t) => t.membro ?? 1));
			const faltam = Array.from({ length: n.membros }, (_, i) => i + 1).filter((i) => !ja.has(i));
			if (!faltam.length) return void ui.avisar(`${n.nome} já está na cena.`);
			// o tamanho vem da ficha do bestiário (cap. 4); NPC feito à mão entra Médio e o Mestre ajusta na ficha rápida
			const tamanho = (d.tamanho ?? data.extrasNpc[n.id]?.tamanho ?? 1) as 1 | 3 | 6 | 10;
			for (const membro of faltam) {
				const [px, py] = lugarLivre(bx - Math.floor(tamanho / 2), by - Math.floor(tamanho / 2), tamanho);
				await mesa.colocar({ npc_id: n.id, membro: n.membros > 1 ? membro : null, nome: n.nome, sigla: n.membros > 1 ? `${sigla(n.nome)[0]}${membro}` : sigla(n.nome), retrato: n.retrato ?? n.arte, tamanho, x: px, y: py, visivel: false });
			}
			ui.avisar(`${n.nome} entrou escondido. Use o olho para revelar.`);
		} else if (d.tipo === 'ficha') {
			const f = data.npcFichas.find((k) => k.id === d.id);
			if (!f || mesa.tokens.some((t) => t.personagem_id === f.id)) return;
			const [px, py] = lugarLivre(bx, by);
			await mesa.colocar({ personagem_id: f.id, nome: f.nome, sigla: sigla(f.nome), retrato: f.retrato, x: px, y: py, visivel: false });
		} else if (d.tipo === 'pasta') {
			const desc = (id: string): string[] => pastas.filter((p) => p.pai_id === id).flatMap((p) => [p.id, ...desc(p.id)]);
			const ids = [d.id, ...desc(d.id)];
			for (const i of itensNpc.filter((k) => k.pastaId && ids.includes(k.pastaId))) await colocar(JSON.stringify({ tipo: i.tipo, id: i.id }), bx, by);
		}
	}
	async function moverNpc(n: ItemNpc, pasta: string | null) {
		if (n.tipo === 'npc') {
			const npc = npcs.find((k) => k.id === n.id);
			if (npc) npc.pasta_id = pasta;
			const { error } = await supabase().from('npcs').update({ pasta_id: pasta }).eq('id', n.id);
			if (error) toasts.mostrar('Não foi possível mover o NPC.', 'erro');
		} else {
			const f = data.npcFichas.find((k) => k.id === n.id);
			if (f) f.pastaId = pasta;
			const { error } = await supabase().rpc('pasta_da_ficha', { ficha: n.id, pasta });
			if (error) toasts.mostrar('Não foi possível mover o NPC.', 'erro');
		}
	}
	function abrirDoElenco(t: MesaToken) {
		quadro?.centralizar(t);
		ui.sel = t.id;
		ui.abrirFicha(t.id);
		if (celular) mobil = null;
	}
	/** Quem joga nesta cena (o Mestre escolhe; sem escolha, todo o grupo). */
	const participa = (ficha: string) => !cena?.participantes || cena.participantes.includes(ficha);
	const participantes = $derived(data.personagens.filter((p) => participa(p.id)));
	let escolhidos = $state<string[]>([]);
	function abrirParticipantes() {
		escolhidos = cena?.participantes ?? data.personagens.map((p) => p.id);
		ui.pop = null;
		ui.modal = { tipo: 'participantes' };
	}
	async function salvarParticipantes() {
		const todos = data.personagens.every((p) => escolhidos.includes(p.id));
		await mesa.patchCena({ participantes: todos ? null : escolhidos });
		ui.modal = null;
		ui.avisar(todos ? 'Todo o grupo joga nesta cena.' : `${escolhidos.length} ${escolhidos.length === 1 ? 'personagem joga' : 'personagens jogam'} nesta cena.`);
	}
	async function colocarOGrupo() {
		const base = quadro?.centroDaVista() ?? [5, 5];
		for (const p of participantes) await colocar(JSON.stringify({ tipo: 'pc', id: p.id }), base[0], base[1]);
	}

	// ---- importar do bestiário: o NPC entra na lista da campanha e já cai na cena, escondido
	let importando = $state(false);
	async function importarBestiario(c: Criatura, estagio: number) {
		importando = true;
		const { data: criado, error } = await supabase()
			.from('npcs')
			.insert({ campanha_id: campanha, ...npcDoVerbete(c, estagio) })
			.select('*')
			.single();
		importando = false;
		if (error || !criado) return void toasts.mostrar('Não foi possível importar o NPC.', 'erro');
		npcs = [...npcs, criado as Npc];
		ui.modal = null;
		if (cena) await colocar(JSON.stringify({ tipo: 'npc', id: criado.id, tamanho: TAMANHOS[c.estagios[estagio]?.tamanho ?? 'medio'].espaco }));
		// os jutsus do NPC (com régua e rolagem) são calculados no servidor
		await refreshAll();
	}

	// ------------------------------------------------------------------ cenas (Mestre)
	let novaCena = $state({ nome: 'Nova cena', largura: 40, altura: 30, grupo: false });
	let textoModal = $state('');
	let limparTodosConfirma = $state(false);
	async function criarCena() {
		const { data: c, error } = await supabase()
			.from('mesa_cenas')
			.insert({ campanha_id: campanha, nome: novaCena.nome.trim().slice(0, 60) || 'Nova cena', largura: Math.max(5, Math.min(200, novaCena.largura)), altura: Math.max(5, Math.min(200, novaCena.altura)), ativa: !data.cenas.length })
			.select('*')
			.single();
		if (error || !c) return void toasts.mostrar('Não foi possível criar a cena.', 'erro');
		ui.modal = null;
		const grupo = novaCena.grupo;
		await goto(`?cena=${c.id}`, { refreshAll: true });
		if (grupo) await colocarOGrupo();
	}
	async function duplicar() {
		if (!cena) return;
		const { data: c, error } = await supabase()
			.from('mesa_cenas')
			.insert({ campanha_id: campanha, nome: `${cena.nome} (cópia)`.slice(0, 60), largura: cena.largura, altura: cena.altura, coordenadas: cena.coordenadas })
			.select('*')
			.single();
		if (error || !c) return void toasts.mostrar('Não foi possível duplicar a cena.', 'erro');
		const copia = mesa.tokens.map(({ id: _i, criado_em: _c, atualizado_em: _a, ligado_a: _l, movido: _m, ...t }) => ({ ...t, cena_id: c.id }));
		if (copia.length) await supabase().from('mesa_tokens').insert(copia);
		ui.pop = null;
		await goto(`?cena=${c.id}`, { refreshAll: true });
	}
	async function renomear() {
		if (ui.modal?.tipo !== 'renomear' || !textoModal.trim()) return;
		await mesa.patchCena({ nome: textoModal.trim().slice(0, 60) });
		ui.modal = null;
	}
	async function excluirCena() {
		if (ui.modal?.tipo !== 'excluir' || !cena) return;
		if (mesa.tokens.length && textoModal.trim() !== cena.nome) return;
		const { error } = await supabase().from('mesa_cenas').delete().eq('id', cena.id);
		if (error) return void toasts.mostrar('Não foi possível excluir a cena.', 'erro');
		ui.modal = null;
		await goto(`/campanhas/${campanha}/mesa`, { refreshAll: true });
	}
	async function ativarCena() {
		if (!cena) return;
		const { error } = await supabase().rpc('ativar_cena', { cena: cena.id });
		if (error) return void toasts.mostrar('Não foi possível ativar a cena.', 'erro');
		mesa.cenas = mesa.cenas.map((c) => ({ ...c, ativa: c.id === cena.id }));
		data.cenas = data.cenas.map((c) => ({ ...c, ativa: c.id === cena.id }));
		ui.avisar(`“${cena.nome}” agora é a cena do grupo.`);
	}

	// ------------------------------------------------------------------ régua de jutsu: barra
	const molde = $derived(ui.mira ? calcularMolde(ui.mira, mesa, mesa.tokens.filter((t) => t.visivel || data.mestre)) : null);
	const minhaMira = $derived(!!ui.mira && (data.mestre || ehMeu(mesa.tokens.find((t) => t.id === ui.mira!.lancador) ?? ({} as MesaToken))));
	function deixarNaCena() {
		if (!ui.mira || !molde) return;
		const q = molde.quadrados;
		const cx = q.reduce((a, b) => a + b[0], 0) / (q.length || 1) + 0.5;
		const cy = Math.min(...q.map((p) => p[1]), molde.lancador.y) - 0.5;
		mesa.deixarEfeito(ui.mira.jutsu.nome.split(':').pop()!.trim(), q, ui.mira.jutsu.turnos ?? null, [cx, Math.max(0.5, cy)]);
		ui.mira = null;
	}

	// ------------------------------------------------------------------ atalhos
	function atalho(e: KeyboardEvent) {
		const alvo = e.target as HTMLElement | null;
		if (alvo && (alvo.tagName === 'INPUT' || alvo.tagName === 'TEXTAREA' || alvo.isContentEditable)) return;
		if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
			e.preventDefault();
			mesa.desfazerUltimo();
			return;
		}
		if (e.ctrlKey || e.metaKey || e.altKey) return;
		const ferramentas: Record<string, Ferramenta> = { v: 'mover', m: 'medir', l: 'lapis', p: 'apontar', e: 'borracha' };
		const k = e.key.toLowerCase();
		if (ferramentas[k] && !ui.mira) return void ui.escolher(ferramentas[k]);
		if (e.key === 'Escape') {
			if (ui.modal) ui.modal = null;
			else if (ui.pop) ui.pop = null;
			else if (ui.mira) ui.mira = null;
			else if (ui.regua) {
				ui.regua = null;
				mesa.enviar('regua', null, true);
			}
			else if (ui.aneis) ui.aneis = null;
			else ui.sel = null;
			return;
		}
		if ((e.key === '[' || e.key === ']') && ui.mira) {
			ui.mira = { ...ui.mira, giro: (ui.mira.giro + (e.key === ']' ? 1 : 7)) % 8 };
			return;
		}
		if (k === 'n' && data.mestre && mesa.iniciativa.ativa) return void mesa.proximoTurno();
		const sel = mesa.tokens.find((t) => t.id === ui.sel);
		if (k === 'h' && data.mestre && sel) return void mesa.atualizarToken(sel.id, { visivel: !sel.visivel });
		const dir = ({ ArrowUp: [0, -1], ArrowDown: [0, 1], ArrowLeft: [-1, 0], ArrowRight: [1, 0] } as Record<string, [number, number]>)[e.key];
		if (dir && sel && mesa.podeMover(sel) && cena) {
			e.preventDefault();
			const x = Math.max(0, Math.min(cena.largura - sel.tamanho, sel.x + dir[0]));
			const y = Math.max(0, Math.min(cena.altura - sel.tamanho, sel.y + dir[1]));
			mesa.mover(sel.id, x, y, 1);
			ui.anuncio = `${sel.nome} movido 1 m`;
		}
	}

	// "uma vez por cena": as habilidades voltam quando o combate acaba
	$effect(() => {
		if (!mesa.iniciativa.ativa) untrack(() => ui.usadas.length && (ui.usadas = []));
	});

	// "Sua vez"
	let suaVez = $state<string | null>(null);
	let vezAnterior = '';
	$effect(() => {
		const meus = mesa.tokens.filter((t) => mesa.daVez.has(t.id) && t.personagem_id && t.dono_id === data.eu);
		const id = meus.map((t) => t.id).join();
		untrack(() => {
			if (id && id !== vezAnterior) {
				suaVez = `Sua vez, ${nomeCurto(meus[0].nome).split(' ')[0]}!`;
				setTimeout(() => (suaVez = null), 2600);
			}
			vezAnterior = id;
		});
	});

	const hoverToken = $derived(ui.hover ? mesa.tokens.find((t) => t.id === ui.hover!.token) : null);
	const minhaFicha = $derived(data.personagens.find((p) => p.jogadorId === data.eu) ?? null);
	const comoQuem = $derived.by(() => {
		const sel = mesa.tokens.find((t) => t.id === ui.sel);
		if (data.mestre && sel?.npc_id) return { nome: sel.nome, personagem: null, npc: sel.npc_id };
		const f = fichas.find((x) => x.jogadorId === data.eu);
		return f ? { nome: f.nome, personagem: f.id, npc: null } : { nome: data.mestre ? 'Mestre' : 'você', personagem: null, npc: null };
	});
	function rolarLivre(expr: string, oculta: boolean) {
		rolador.rolar({ campanha, expressao: expr, rotulo: 'Rolagem livre', personagem: comoQuem.personagem, npc: comoQuem.npc, tipo: 'livre', origem: 'Mesa · rolador', oculta, d20: /^1d20([+-]\d+)?$/i.test(expr.replace(/\s+/g, '')) });
	}
	const selTok = $derived(mesa.tokens.find((t) => t.id === ui.sel) ?? null);
	const selFicha = $derived(selTok ? fichaDe(selTok) : null);
	const FERRAMENTAS: { id: Ferramenta; nome: string; tecla: string; d: string }[] = [
		{ id: 'mover', nome: 'Mover', tecla: 'V', d: 'M5 3v16l4-4 3 7 3-1-3-7h6z' },
		{ id: 'medir', nome: 'Medir', tecla: 'M', d: 'M2 16L16 2l6 6L8 22z M7 11l2 2 M10 8l2 2 M13 5l2 2' },
		{ id: 'lapis', nome: 'Lápis', tecla: 'L', d: 'M3 21l1-5L16 4l4 4L8 20z M14 6l4 4' },
		{ id: 'apontar', nome: 'Apontar', tecla: 'P', d: 'M12 3v4 M12 17v4 M3 12h4 M17 12h4 M12 8a4 4 0 1 0 0.01 0' },
		{ id: 'borracha', nome: 'Borracha', tecla: 'E', d: 'M9 20h12 M3 15l9-9 6 6-8 8H8z M8 10l6 6' }
	];
	let mobil = $state<null | 'elenco' | 'chat'>(null);
	const FAIXAS = ['Ileso', 'Ferido', 'Muito ferido', 'Caído'];
	const pop = 'absolute z-30 flex flex-col border-2 border-b3 bg-b0 shadow-[4px_4px_0_#000]';
	const itemMenu = 'flex flex-col items-start gap-0.5 border-t-2 border-b2 px-3 py-2 text-left disabled:cursor-not-allowed disabled:opacity-50';
	const chip = 'min-h-9 flex-1 font-pixel text-xs leading-none font-bold';
</script>

<svelte:window onkeydown={atalho} />

{#snippet trilho()}
	<nav aria-label="Ferramentas" class="flex w-12 flex-none flex-col items-center gap-1 border-r-2 border-b3 bg-b0 py-2">
		{#each FERRAMENTAS as f (f.id)}
			{@const on = ui.ferramenta === f.id}
			<button type="button" aria-pressed={on} aria-label={f.nome} title="{f.nome} · {f.tecla}" class="relative flex h-10 w-10 items-center justify-center border-2 {on ? 'border-[var(--vermelhao)] bg-grena text-papel' : 'border-b3 text-fg'}" onclick={() => (ui.ferramenta === f.id && ui.pop ? (ui.pop = null) : ui.escolher(f.id))}>
				<svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true" class="fill-none stroke-current stroke-2 [stroke-linecap:square]"><path d={f.d} /></svg>
				<span aria-hidden="true" class="absolute right-0.5 bottom-px font-pixel text-[10px] leading-none font-bold opacity-85">{f.tecla}</span>
			</button>
		{/each}
		<span class="my-1 h-0.5 w-7 bg-b3"></span>
		<button type="button" class="h-10 w-10 border-2 border-b3 font-pixel text-base font-bold" aria-label="Desfazer (Ctrl+Z)" title="Desfazer · Ctrl+Z" onclick={() => mesa.desfazerUltimo()}>↶</button>
	</nav>
{/snippet}

{#snippet barras()}
	<div class="pointer-events-none absolute inset-x-3 top-3 z-[45] flex flex-col items-center gap-2">
		{#if !mesa.conectado}<div role="status" class="pointer-events-auto border-2 border-warn bg-b0 px-3 py-2 text-sm font-semibold shadow-[4px_4px_0_#000]">Sem conexão. Seus movimentos aparecem para o grupo quando a conexão voltar.</div>{/if}
		{#if mesa.travada}<div role="status" class="pointer-events-auto border-2 border-warn bg-b0 px-3 py-2 text-sm font-semibold shadow-[4px_4px_0_#000]">Mesa travada pelo Mestre.</div>{/if}
		{#if !data.mestre && minhaFicha && !participa(minhaFicha.id)}<div role="status" class="pointer-events-auto border-2 border-info bg-b0 px-3 py-2 text-sm font-semibold shadow-[4px_4px_0_#000]">Você assiste a esta cena: o Mestre escolheu quem joga nela.</div>{/if}
		{#if data.mestre && cena && !cena.ativa}
			<div role="status" class="pointer-events-auto flex items-center gap-3 border-2 border-info bg-b0 px-3 py-2 text-sm font-semibold shadow-[4px_4px_0_#000]">
				<span>Você está vendo “{cena.nome}”.{ativa ? ` O grupo vê “${ativa.nome}”.` : ' O grupo ainda não tem cena aberta.'}</span>
				<button type="button" class="min-h-8 border-2 border-info px-2.5 font-pixel text-xs font-bold" onclick={ativarCena}>ATIVAR ESTA CENA</button>
			</div>
		{/if}
		{#if ui.mira && molde}
			{@const j = ui.mira.jutsu}
			{@const st = molde.forma === 'alvos' && !molde.quem.length ? 'Escolha o alvo no quadro' : !molde.ok ? `Fora do alcance · ${molde.dist} m de ${j.regua.alcance} m` : ui.mira.fixa || molde.forma === 'alvos' ? 'Dentro do alcance' : 'Clique no quadro para fixar'}
			<section aria-label="Régua de jutsu" class="pointer-events-auto flex w-[600px] max-w-full flex-col border-2 bg-b2 shadow-[4px_4px_0_var(--b0)] {celular ? 'hidden' : ''}" style="border-color: {molde.ok ? corCss(mesa.corDe(mesa.donoDe(molde.lancador))) : 'var(--mesa-vermelhao)'}">
				<div class="flex items-center gap-2.5 border-b-2 border-b3 bg-b0 py-1.5 pr-2.5 pl-1.5">
					<Icone id={j.rank ? `rank/ic-rank-${j.rank.toLowerCase()}` : 'callout/ic-callout-destaque'} alt={j.rank ? `Rank ${j.rank}` : 'Habilidade'} />
					<span class="min-w-0 flex-1 font-mincho text-[17px] leading-[22px] font-bold">{j.nome}</span>
					{#if j.custo}<span class="font-pixel text-[13px] leading-none font-bold text-info">{j.custo} {j.unidade}</span>{:else if j.porCena}<span class="font-pixel text-[13px] leading-none font-bold text-warn">1×/CENA</span>{/if}
					<span class="font-pixel text-[13px] leading-none font-bold text-mut">{j.regua.rotuloAlcance}</span>
					<button type="button" class="h-8 w-8 font-pixel text-sm" aria-label="Cancelar régua (Esc)" title="Cancelar · Esc" onclick={() => (ui.mira = null)}>✕</button>
				</div>
				<div class="flex flex-wrap items-center gap-3 px-2.5 py-2">
					<span class="font-pixel text-[13px] leading-none font-bold">{j.area || 'Alvo único'}</span>
					{#if molde.forma !== 'cena'}<span class="font-pixel text-[13px] leading-none font-bold text-acc">{molde.dist} m</span>{/if}
					<span class="min-w-[200px] flex-1 text-[13px] leading-[18px] font-semibold">{molde.quem.length ? `${molde.quem.length} na área: ${molde.quem.map((t) => nomeCurto(t.nome)).join(', ')}` : molde.forma === 'alvos' ? `Até ${j.regua.alvos ?? 1} ${(j.regua.alvos ?? 1) > 1 ? 'alvos' : 'alvo'}: clique nos tokens` : 'Ninguém na área'}</span>
				</div>
				<div class="flex flex-wrap items-center gap-2 px-2.5 pb-2.5">
					<span role="status" class="min-w-[160px] flex-1 text-xs leading-4 font-semibold" style="color: {molde.ok ? 'var(--ok)' : 'var(--mesa-vermelhao)'}">{st} · {molde.forma === 'cena' ? 'área maior que a cena' : `mirando de ${nomeCurto(molde.lancador.nome)}`}</span>
					{#if j.regua.forma === 'cone-linha'}
						<div role="radiogroup" class="flex border-2 border-b3">
							{#each [['cone', `CONE ${j.regua.cone} M`], ['linha', `LINHA ${j.regua.linha} M`]] as const as [f, n] (f)}
								<button type="button" role="radio" aria-checked={ui.mira.forma === f} class="min-h-8 px-2 font-pixel text-[11px] font-bold {ui.mira.forma === f ? 'bg-grena text-papel' : ''}" onclick={() => ui.mira && (ui.mira = { ...ui.mira, forma: f })}>{n}</button>
							{/each}
						</div>
					{/if}
					{#if j.regua.forma === 'parede'}
						<div class="flex gap-1">
							<button type="button" class="h-8 w-8 border-2 border-b3 font-pixel text-[13px] font-bold" aria-label="Girar para a esquerda ([)" onclick={() => ui.mira && (ui.mira = { ...ui.mira, giro: (ui.mira.giro + 7) % 8 })}>[</button>
							<button type="button" class="h-8 w-8 border-2 border-b3 font-pixel text-[13px] font-bold" aria-label="Girar para a direita (])" onclick={() => ui.mira && (ui.mira = { ...ui.mira, giro: (ui.mira.giro + 1) % 8 })}>]</button>
						</div>
					{/if}
					{#if minhaMira && j.turnos !== undefined && molde.quadrados.length}
						<button type="button" class="min-h-9 border-2 border-field px-2.5 font-pixel text-xs font-bold" onclick={deixarNaCena}>DEIXAR NA CENA</button>
					{/if}
					{#if minhaMira}
						<button type="button" class="btn-jogo btn-primario min-h-9 {molde.ok ? '' : 'opacity-80'}" title={j.custo ? `Gasta ${j.unidade} e rola. Fora do alcance é aviso, não bloqueio.` : 'Rola o efeito. Fora do alcance é aviso, não bloqueio.'} onclick={() => usarJutsu(molde.lancador, j)}>{j.rank ? 'USAR JUTSU' : 'USAR'}</button>
					{/if}
				</div>
			</section>
		{/if}
		{#if ui.regua}
			{@const pts = ui.regua.cur ? [...ui.regua.pontos, ui.regua.cur] : ui.regua.pontos}
			{@const seg = pts.slice(1).map((q, i) => Math.max(Math.abs(q[0] - pts[i][0]), Math.abs(q[1] - pts[i][1])) + Math.floor(Math.min(Math.abs(q[0] - pts[i][0]), Math.abs(q[1] - pts[i][1])) / 2))}
			<div class="pointer-events-auto flex items-center gap-2.5 border-2 border-b3 bg-b0 py-1.5 pr-1.5 pl-3 shadow-[4px_4px_0_#000]">
				<span class="font-pixel text-xs leading-none font-bold tracking-[0.08em] text-title">RÉGUA</span>
				<span class="font-pixel text-base leading-none font-bold">{seg.length > 1 ? `${seg.join(' + ')} = ${seg.reduce((a, b) => a + b, 0)} m` : `${seg[0] ?? 0} m`}</span>
				<span class="text-xs leading-4 text-mut max-md:hidden">{ui.regua.feita ? 'Some em 3 segundos.' : 'Clique cria pontos · clique duplo termina'}</span>
				<button type="button" class="min-h-8 border-2 border-field px-2 font-pixel text-[11px] font-bold" onclick={() => {
					if (!ui.regua) return;
					ui.regua = { ...ui.regua, fixa: !ui.regua.fixa, feita: true, cur: null, t: Date.now() };
					mesa.enviar('regua', { pontos: ui.regua.pontos, feita: true, fixa: ui.regua.fixa }, true);
				}}>{ui.regua.fixa ? 'SOLTAR' : 'FIXAR'}</button>
				<button type="button" class="h-8 w-8 font-pixel text-[13px]" aria-label="Apagar régua" onclick={() => {
					ui.regua = null;
					mesa.enviar('regua', null, true);
				}}>✕</button>
			</div>
		{/if}
		{#if ui.aneis}
			<div class="pointer-events-auto flex items-center gap-2.5 border-2 border-b3 bg-b0 py-1.5 pr-1.5 pl-3 shadow-[4px_4px_0_#000]">
				<span class="font-pixel text-xs leading-none font-bold tracking-[0.08em] text-title">MEDIR</span>
				<span class="text-[13px] leading-[18px] font-semibold">{ui.aneis.titulo}: {ui.aneis.lista.map((l) => l.rotulo).join(' · ') || (ui.aneis.corpo > 1 ? `haste ${ui.aneis.corpo} m` : 'corpo a corpo')}</span>
				<button type="button" class="h-8 w-8 font-pixel text-[13px]" aria-label="Fechar medida" onclick={() => (ui.aneis = null)}>✕</button>
			</div>
		{/if}
	</div>
{/snippet}

{#snippet sobreQuadro()}
	{#if hoverToken && ui.hover}
		{@const pv = pvDe(hoverToken)}
		{@const cor = corCss(mesa.corDe(mesa.donoDe(hoverToken)))}
		<div
			role="tooltip"
			class="absolute z-[8] flex w-[220px] flex-col gap-1.5 border-2 bg-b0 p-2.5 shadow-[4px_4px_0_#000]"
			style="border-color: {cor}; left: {Math.max(8, ui.hover.x + 16)}px; top: {Math.max(8, ui.hover.y - 10)}px"
			onpointerenter={() => ui.hover && (ui.hover = { ...ui.hover })}
			onpointerleave={() => (ui.hover = null)}
		>
			<span class="font-mincho text-[15px] leading-5 font-bold">{hoverToken.nome}{hoverToken.membro ? ` ${hoverToken.membro}` : ''}</span>
			<span class="text-xs leading-4 text-mut">{subDe(hoverToken)}</span>
			<div class="flex gap-2.5 font-pixel text-[13px] leading-none font-bold">
				<span>{pv ? `${pv.pv}/${pv.max} PV` : FAIXAS[hoverToken.ferimento]}</span>
				{#if fichaDe(hoverToken)}<span class="text-mut">Defesa {fichaDe(hoverToken)!.defesa}</span>{:else if npcDe(hoverToken)}<span class="text-mut">Defesa {npcDe(hoverToken)!.defesa}</span>{/if}
			</div>
			{#if hoverToken.condicoes.length}
				<div class="flex flex-col gap-0.5">
					{#each hoverToken.condicoes as c (c)}<span class="flex items-center gap-1.5 text-xs leading-none font-semibold"><Icone id="estado/ic-estado-{c}" />{c.replace('-', ' ')}</span>{/each}
				</div>
			{/if}
			{#if !hoverToken.visivel}<span class="text-xs leading-4 font-semibold text-warn">Escondido: só o Mestre vê.</span>{/if}
			{#if !mesa.podeMover(hoverToken)}<span class="text-xs leading-4 font-semibold text-mut">🔒 {mesa.travada ? 'Mesa travada pelo Mestre.' : 'Só o dono e o Mestre movem.'}</span>{/if}
			<button type="button" class="min-h-8 border-2 border-field font-pixel text-xs font-bold" onclick={() => {
				ui.abrirFicha(hoverToken.id);
				ui.hover = null;
			}}>FICHA</button>
		</div>
	{/if}
	{#if !cena}
		<div class="absolute top-1/2 left-1/2 z-[4] flex w-[380px] max-w-[calc(100%-32px)] -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-2.5 border-2 border-b3 bg-b2 p-6 text-center shadow-[4px_4px_0_var(--b0)]">
			<img src="/illustrations/il-sem-resultados-96.png" width="96" height="96" alt="" class="[image-rendering:pixelated]" />
			<span class="font-mincho text-xl leading-[26px] font-bold">{data.mestre ? 'Nenhuma cena ainda' : 'Nenhuma cena aberta agora'}</span>
			<span class="text-sm leading-5 text-mut">{data.mestre ? 'Crie a primeira cena da campanha: a ponte, o esconderijo, a floresta.' : 'Quando o Mestre abrir uma cena, ela aparece aqui.'}</span>
			{#if data.mestre && !data.arquivada}<button type="button" class="btn-jogo btn-primario min-h-11" onclick={() => (ui.modal = { tipo: 'nova' })}>CRIAR CENA</button>{/if}
		</div>
	{:else if !mesa.tokens.length}
		<div class="absolute top-1/2 left-1/2 z-[4] flex w-[380px] max-w-[calc(100%-32px)] -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-2.5 border-2 border-b3 bg-b2 p-6 text-center shadow-[4px_4px_0_var(--b0)]">
			<img src="/illustrations/il-sem-resultados-96.png" width="96" height="96" alt="" class="[image-rendering:pixelated]" />
			<span class="font-mincho text-xl leading-[26px] font-bold">{data.mestre ? 'Cena vazia' : 'O Mestre ainda está montando a cena'}</span>
			<span class="text-sm leading-5 text-mut">{data.mestre ? 'Arraste personagens e NPCs do Elenco para o quadro.' : 'Você pode entrar com o seu personagem quando quiser.'}</span>
			{#if data.mestre && data.personagens.length}<button type="button" class="btn-jogo btn-primario min-h-11" onclick={colocarOGrupo}>COLOCAR O GRUPO</button>{/if}
			{#if !data.mestre && minhaFicha && !mesa.travada && participa(minhaFicha.id)}<button type="button" class="btn-jogo btn-primario min-h-11" onclick={() => colocar(JSON.stringify({ tipo: 'pc', id: minhaFicha.id }))}>ENTRAR NA CENA</button>{/if}
		</div>
	{/if}
	{#if suaVez}<div role="alert" class="absolute top-[40%] left-1/2 z-[9] -translate-x-1/2 border-2 border-acc bg-b0 px-5 py-3.5 font-mincho text-[22px] leading-none font-bold text-acc shadow-[4px_4px_0_#000]">{suaVez}</div>{/if}
	{#if ui.aviso}<div role="status" class="absolute bottom-16 left-1/2 z-[9] max-w-[calc(100%-24px)] -translate-x-1/2 border-2 border-warn bg-b0 px-3 py-2 text-[13px] leading-[18px] font-semibold">{ui.aviso.texto}</div>{/if}
	<div aria-live="polite" class="sr-only">{ui.anuncio}</div>
{/snippet}

{#snippet fichasAbertas()}
	{#each ui.fichas.filter((f) => !f.min) as janela (janela.token)}
		{@const t = mesa.tokens.find((k) => k.id === janela.token)}
		{#if t}<FichaRapida {mesa} {ui} token={t} {janela} dados={dadosDe(t)} {acoes} foto={fotoDe(t)} {celular} />{/if}
	{/each}
{/snippet}

{#if celular}
	<!-- M8 · celular: tela cheia sobre a navegação do app -->
	<div class="fixed inset-0 z-50 flex flex-col bg-b1 text-fg">
		<div class="flex h-12 flex-none items-center gap-2.5 border-b-2 border-b3 bg-b0 pr-2 pl-1">
			<a href="/campanhas/{campanha}" class="flex h-10 w-10 items-center justify-center font-pixel text-lg" aria-label="Voltar para a campanha">‹</a>
			<span class="flex-1 truncate font-mincho text-base leading-none font-bold">{cena?.nome ?? 'Mesa'}</span>
			<span class="flex items-center gap-1 font-pixel text-xs leading-none font-bold text-mut"><span class="h-2 w-2 bg-ok"></span>{mesa.online.length}</span>
			{#if mesa.iniciativa.ativa}<span class="font-pixel text-xs leading-none font-bold text-acc">R{mesa.iniciativa.rodada}</span>{/if}
		</div>
		<div class="relative min-h-0 flex-1">
			<QuadroMesa bind:this={quadro} {mesa} {ui} {pvDe} {deslocamentoDe} {fotoDe} onSoltar={colocar} />
			{@render barras()}
			{@render sobreQuadro()}
			<div class="pointer-events-none absolute inset-x-2 bottom-2 flex flex-col gap-1.5">
				{#if ui.mira && molde}
					<div class="pointer-events-auto flex flex-col gap-1.5 border-2 bg-b2 px-2.5 py-2 shadow-[4px_4px_0_var(--b0)]" style="border-color: {molde.ok ? corCss(mesa.corDe(mesa.donoDe(molde.lancador))) : 'var(--mesa-vermelhao)'}">
						<span class="font-mincho text-[15px] leading-5 font-bold">{ui.mira.jutsu.nome}</span>
						<span class="font-pixel text-xs leading-none font-bold text-mut">{ui.mira.jutsu.regua.rotuloAlcance} · {molde.dist} m · {molde.ok ? (molde.quem.length ? `${molde.quem.length} na área` : 'toque no quadro') : 'fora do alcance'}</span>
						<div class="flex gap-1.5">
							{#if minhaMira}<button type="button" class="btn-jogo btn-primario min-h-11 flex-1" onclick={() => usarJutsu(molde.lancador, ui.mira!.jutsu)}>USAR</button>{/if}
							<button type="button" class="min-h-11 w-12 border-2 border-field font-pixel text-sm" aria-label="Cancelar régua" onclick={() => (ui.mira = null)}>✕</button>
						</div>
					</div>
				{/if}
				{#if ultima && !mobil && !ui.fichas.length}
					<button type="button" class="pointer-events-auto flex min-h-11 items-center gap-2 border-2 border-[var(--vermelhao-lo)] bg-b0 pr-2.5 pl-1 text-left" onclick={() => ((mobil = 'chat'), (ui.naoVistas = 0))}>
						<Icone id="dado/ic-dado-d20" />
						<span class="min-w-0 flex-1 truncate text-[13px] leading-[17px] font-medium">{ultima.quem} · {ultima.rotulo}</span>
						<b class="font-pixel text-xl leading-none">{ultima.total}</b>
					</button>
				{/if}
			</div>
		</div>
		<nav aria-label="Ferramentas" class="grid h-16 flex-none grid-cols-5 border-t-2 border-b3 bg-b0">
			{#each [FERRAMENTAS[0], FERRAMENTAS[1], FERRAMENTAS[2]] as f (f.id)}
				<button type="button" aria-pressed={ui.ferramenta === f.id} class="flex flex-col items-center justify-center gap-1 border-r-2 border-b2 font-pixel text-[10px] leading-none font-bold tracking-[0.04em] {ui.ferramenta === f.id ? 'bg-grena text-papel' : 'text-mut'}" onclick={() => ((ui.ferramenta = f.id), (mobil = null))}>
					<svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true" class="fill-none stroke-current stroke-2 [stroke-linecap:square]"><path d={f.d} /></svg>{f.nome.toUpperCase()}
				</button>
			{/each}
			<button type="button" aria-pressed={mobil === 'chat'} class="relative flex flex-col items-center justify-center gap-1 border-r-2 border-b2 font-pixel text-[10px] leading-none font-bold {mobil === 'chat' ? 'bg-grena text-papel' : 'text-mut'}" onclick={() => ((mobil = mobil === 'chat' ? null : 'chat'), (ui.naoVistas = 0))}>
				<svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true" class="fill-none stroke-current stroke-2"><path d="M4 4h16v12H9l-5 4z" /></svg>ROLAGENS
				{#if ui.naoVistas}<span class="absolute top-1 right-3 bg-[var(--vermelhao)] px-1 py-0.5 font-pixel text-[11px] text-white">{ui.naoVistas}</span>{/if}
			</button>
			<button type="button" aria-pressed={mobil === 'elenco'} class="flex flex-col items-center justify-center gap-1 font-pixel text-[10px] leading-none font-bold {mobil === 'elenco' ? 'bg-grena text-papel' : 'text-mut'}" onclick={() => (mobil = mobil === 'elenco' ? null : 'elenco')}>
				<svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true" class="fill-none stroke-current stroke-2"><path d="M4 12h2 M11 12h2 M18 12h2" /></svg>MAIS
			</button>
		</nav>
		{@render fichasAbertas()}
		{#if mobil === 'chat'}
			<div class="absolute inset-x-0 bottom-16 z-20 h-[520px] max-h-[calc(100%-112px)] border-t-2 border-[var(--vermelhao-lo)]">
				<PainelMesa {mesa} {ui} {rolagens} {comoQuem} celular onRolar={rolarLivre} onFechar={() => (mobil = null)} />
			</div>
		{/if}
		{#if mobil === 'elenco'}
			<div class="absolute top-12 bottom-16 left-0 z-20 w-[300px] max-w-[85%] shadow-[4px_0_0_var(--b0)]">
				<ElencoMesa {mesa} {ui} personagens={participantes} npcs={itensNpc} bind:pastas {subDe} celular onAbrir={abrirDoElenco} onColocar={colocar} onMoverNpc={moverNpc} onBestiario={() => (ui.modal = { tipo: 'bestiario' })} onFechar={() => (mobil = null)} />
			</div>
		{/if}
	</div>
{:else}
	<div class="flex h-[calc(100dvh-64px)] min-h-[560px] flex-col bg-b1 text-fg">
		<!-- barra da Mesa: caminho, cena, quem está online, rodada e configurações -->
		<div class="relative flex h-14 flex-none items-center gap-4 border-b-2 border-b3 bg-b0 px-4">
			<nav aria-label="Caminho" class="flex min-w-0 items-center gap-2 text-sm leading-none font-medium text-mut">
				<a href="/campanhas/{campanha}" class="truncate hover:text-fg">{data.campanha.nome}</a><span aria-hidden="true">›</span><span>Mesa</span><span aria-hidden="true">›</span>
				{#if data.mestre}
					<button type="button" aria-haspopup="menu" class="flex min-h-10 items-center gap-1.5 border-2 border-b3 bg-b2 px-2.5 font-mincho text-[17px] leading-none font-bold text-papel" onclick={() => (ui.pop = ui.pop === 'cena' ? null : 'cena')}>{cena?.nome ?? 'Sem cena'}<span class="font-pixel text-xs text-mut">▾</span></button>
				{:else}
					<span class="font-mincho text-[17px] leading-none font-bold text-papel">{cena?.nome ?? 'Sem cena'}</span>
				{/if}
			</nav>
			<span class="flex-1"></span>
			<div aria-label="Quem está na mesa" class="flex items-center gap-1.5">
				{#each data.membros as m (m.id)}
					{@const on = mesa.online.includes(m.id) || m.id === data.eu}
					<button type="button" class="relative flex h-9 w-9 items-center justify-center border-[3px] bg-b2 p-0 font-pixel text-sm font-bold {m.id === data.eu ? 'cursor-pointer' : 'cursor-default'}" style="border-color: {corCss(mesa.corDe(m.id))}; opacity: {on ? 1 : 0.4}" title="{m.nome}{m.papel === 'mestre' ? ' · Mestre' : ''}{on ? '' : ' · fora da mesa'}{m.id === data.eu ? ' · trocar minha cor' : ''}" aria-label="{m.nome}{on ? ', na mesa' : ', fora da mesa'}" onclick={() => m.id === data.eu && (ui.pop = ui.pop === 'cor' ? null : 'cor')}>
						{#if m.avatar}<img src={url(m.avatar)} alt="" class="h-full w-full object-cover" />{:else}{m.nome.slice(0, 1).toUpperCase()}{/if}
						{#if m.papel === 'mestre'}<span class="absolute -right-0.5 -bottom-1 font-pixel text-[10px] font-bold">★</span>{/if}
					</button>
				{/each}
			</div>
			{#if mesa.iniciativa.ativa}<span class="border-2 border-grena px-2 py-1.5 font-pixel text-sm leading-none font-bold tracking-[0.08em] text-acc">RODADA {mesa.iniciativa.rodada ?? 1}</span>{/if}
			{#if data.mestre && cena}
				<button type="button" class="flex h-10 w-10 items-center justify-center border-2 border-b3 p-0" aria-label="Configurações da cena" title="Configurações da cena" onclick={() => (ui.pop = ui.pop === 'gear' ? null : 'gear')}><Icone id="nav/ic-nav-configuracoes" /></button>
			{/if}

			{#if ui.pop === 'cena' && data.mestre}
				<div role="menu" aria-label="Cenas" class="{pop} top-14 left-44 w-80">
					<span class="px-3 pt-2.5 pb-1.5 font-pixel text-xs leading-none font-bold tracking-[0.1em] text-title">CENAS DA CAMPANHA</span>
					{#each mesa.cenas as c (c.id)}
						<a role="menuitem" href="?cena={c.id}" class="flex min-h-11 items-center gap-2 border-t-2 border-b2 px-3 {c.id === cena?.id ? 'bg-b2' : ''}" onclick={() => (ui.pop = null)}>
							<span class="w-2.5 font-pixel text-xs font-bold text-[var(--vermelhao)]">{c.id === cena?.id ? '●' : ''}</span>
							<span class="flex-1 font-mincho text-[15px] leading-5 font-bold">{c.nome}</span>
							<span class="font-pixel text-xs font-semibold text-mut">{c.largura} × {c.altura} m</span>
							{#if c.ativa}<span class="bg-ok px-1 py-0.5 font-pixel text-[11px] leading-none font-bold text-[var(--okfg)]">GRUPO</span>{/if}
						</a>
					{/each}
					<div class="grid grid-cols-2 gap-1 border-t-2 border-b3 p-2">
						<button type="button" class="min-h-9 border-2 border-b3 font-pixel text-[11px] font-bold" onclick={() => ((novaCena = { nome: 'Nova cena', largura: 40, altura: 30, grupo: false }), (ui.modal = { tipo: 'nova' }), (ui.pop = null))}>NOVA CENA</button>
						<button type="button" class="min-h-9 border-2 border-b3 font-pixel text-[11px] font-bold" disabled={!cena} onclick={duplicar}>DUPLICAR</button>
						<button type="button" class="min-h-9 border-2 border-b3 font-pixel text-[11px] font-bold" disabled={!cena} onclick={() => cena && ((textoModal = cena.nome), (ui.modal = { tipo: 'renomear', cena: cena.id }), (ui.pop = null))}>RENOMEAR</button>
						<button type="button" class="min-h-9 border-2 border-b3 font-pixel text-[11px] font-bold" disabled={!cena} onclick={() => cena && ((textoModal = ''), (ui.modal = { tipo: 'excluir', cena: cena.id }), (ui.pop = null))}>EXCLUIR</button>
					</div>
				</div>
			{/if}
			{#if ui.pop === 'gear' && cena}
				<div role="menu" aria-label="Configurações da cena" class="{pop} top-14 right-2 w-[280px]">
					<span class="px-3 pt-2.5 pb-1.5 font-pixel text-xs leading-none font-bold tracking-[0.1em] text-title">CENA</span>
					{#each [['travada', 'Travar a mesa (só o Mestre move)'], ['coordenadas', 'Coordenadas nas bordas'], ['mostrar_pv', 'Mostrar PV ao grupo']] as const as [k, n] (k)}
						<button type="button" role="menuitemcheckbox" aria-checked={cena[k]} class="flex min-h-11 items-center gap-2.5 border-t-2 border-b2 px-3 text-left text-sm font-semibold" onclick={() => mesa.patchCena({ [k]: !cena[k] })}>
							<span class="font-pixel text-sm font-bold {cena[k] ? 'text-ok' : 'text-mut'}">{cena[k] ? '☒' : '☐'}</span>{n}
						</button>
					{/each}
					<button type="button" class="flex min-h-11 items-center gap-2.5 border-t-2 border-b2 px-3 text-left text-sm font-semibold" onclick={abrirParticipantes}>
						<span class="font-pixel text-sm font-bold text-mut">☰</span>Quem joga nesta cena · {cena.participantes ? `${participantes.length} de ${data.personagens.length}` : 'todos'}
					</button>
					<button type="button" class="min-h-11 border-t-2 border-b2 px-3 text-left text-sm font-semibold text-link" onclick={() => {
						if (!limparTodosConfirma) return void (limparTodosConfirma = true);
						mesa.limparTracos(true);
						limparTodosConfirma = false;
					}}>{limparTodosConfirma ? 'Confirmar: limpar todos os traços' : 'Limpar todos os traços'}</button>
				</div>
			{/if}
			{#if ui.pop === 'cor'}
				{@const atual = data.mestre ? mesa.molduraMesa.id : (mesa.membro(data.eu)?.moldura ?? null)}
				{@const daMesa = molduraPorId(mesa.molduraMesa.id)}
				<div role="dialog" aria-label="Sua cor na campanha" class="{pop} top-14 right-28 max-h-[calc(100%-64px)] w-[300px] gap-2.5 overflow-y-auto p-3">
					<span class="font-pixel text-xs leading-none font-bold tracking-[0.1em] text-title">SUA COR NA CAMPANHA</span>
					<div class="grid grid-cols-3 gap-1.5">
						{#each CORES as c (c.id)}
							{@const dono = data.membros.find((m) => m.id !== data.eu && mesa.corDe(m.id) === c.id)}
							{@const minha = mesa.corDe(data.eu) === c.id}
							<button type="button" aria-label="{c.nome}{dono ? `, de ${dono.nome}` : ''}" aria-disabled={!!dono} title={dono ? `${c.nome} · ${dono.nome}` : c.nome} class="flex flex-col items-stretch gap-1 border-2 p-1 {minha ? 'border-fg' : 'border-b3'} {dono ? 'cursor-not-allowed opacity-50' : ''}" onclick={() => !dono && mesa.definirCor(c.id)}>
								<span class="flex h-7 items-center justify-center font-pixel text-xs font-bold text-[var(--b0)]" style="background: {corCss(c.id)}">{minha ? '✓' : dono ? dono.nome.slice(0, 1) : ''}</span>
								<span class="text-[11px] leading-none font-semibold">{c.nome}</span>
							</button>
						{/each}
					</div>
					<span class="text-xs leading-4 text-mut">A cor marca o anel do token, o traço, a régua e o avatar. As tomadas mostram quem usa.</span>
					<!-- o Mestre escolhe a moldura da mesa e onde ela vale; o jogador, a dele ("Padrão" segue a da mesa) -->
					<span class="mt-1 font-pixel text-xs leading-none font-bold tracking-[0.1em] text-title">{data.mestre ? 'MOLDURA DA MESA' : 'SUA MOLDURA'}</span>
					<div class="grid grid-cols-4 gap-1.5">
						{#each [null, ...MOLDURAS] as m (m?.id ?? 'sem')}
							{@const on = atual === (m?.id ?? null)}
							{@const img = m ?? (data.mestre ? null : daMesa)}
							<button type="button" aria-pressed={on} title={m?.nome ?? (data.mestre ? 'Sem moldura' : 'Padrão: a moldura da mesa')} class="flex flex-col items-center gap-1 border-2 p-1 {on ? 'border-fg bg-b3' : 'border-b3'}" onclick={() => (data.mestre ? mesa.definirMolduraMesa(m?.id ?? null, mesa.molduraMesa.universal) : mesa.definirMoldura(m?.id ?? null))}>
								<span class="relative flex h-11 w-11 items-center justify-center" style:opacity={m || !img ? 1 : 0.55}>
									<span class="absolute rounded-full border-2 bg-b1" style="inset: {img ? 22 - 22 * img.interno : 4}px; border-color: {corCss(mesa.corDe(data.eu))}"></span>
									{#if img}<img src="/molduras/{img.id}.png" alt="" class="relative h-11 w-11" style="image-rendering: pixelated" />{/if}
								</span>
								<span class="text-[10px] leading-none font-semibold">{m?.nome ?? (data.mestre ? 'Nenhuma' : 'Padrão')}</span>
							</button>
						{/each}
					</div>
					{#if data.mestre}
						<div role="radiogroup" aria-label="Onde vale a moldura da mesa" class="flex border-2 border-b3">
							{#each [[false, 'NPCS E QUEM NÃO ESCOLHEU'], [true, 'TODOS OS TOKENS']] as const as [u, n] (n)}
								<button type="button" role="radio" aria-checked={mesa.molduraMesa.universal === u} class="min-h-10 flex-1 px-1 font-pixel text-[10px] leading-tight font-bold {mesa.molduraMesa.universal === u ? 'bg-grena text-papel' : 'text-mut'}" onclick={() => mesa.definirMolduraMesa(mesa.molduraMesa.id, u)}>{n}</button>
							{/each}
						</div>
						<span class="text-xs leading-4 text-mut">{mesa.molduraMesa.universal ? 'Todos os tokens usam esta moldura, por cima da escolha dos jogadores.' : 'Vale nos NPCs e em quem não escolheu. Quem escolheu uma moldura continua com a dele.'}</span>
					{:else}
						<span class="text-xs leading-4 text-mut">{daMesa && mesa.molduraMesa.universal ? 'O Mestre fixou a moldura da mesa para todos os tokens desta campanha. A sua fica guardada para as outras.' : 'Vale nos tokens do seu personagem, em todas as campanhas. "Padrão" usa a moldura da mesa.'}</span>
					{/if}
				</div>
			{/if}
		</div>

		<div class="relative flex min-h-0 flex-1">
			{#if ui.elencoAberto}
				<ElencoMesa {mesa} {ui} personagens={participantes} npcs={itensNpc} bind:pastas {subDe} onAbrir={abrirDoElenco} onColocar={colocar} onMoverNpc={moverNpc} onBestiario={() => (ui.modal = { tipo: 'bestiario' })} />
			{:else}
				<div class="flex w-10 flex-none flex-col items-center border-r-2 border-b3 bg-b2 pt-1.5"><button type="button" class="h-8 w-8 border-2 border-b3 font-pixel text-sm" aria-label="Abrir Elenco" title="Abrir Elenco" onclick={() => (ui.elencoAberto = true)}>»</button></div>
			{/if}
			{@render trilho()}

			<div class="relative min-w-0 flex-1 overflow-hidden bg-b0">
				<QuadroMesa bind:this={quadro} {mesa} {ui} {pvDe} {deslocamentoDe} {fotoDe} onSoltar={colocar} />
				{@render barras()}
				{@render sobreQuadro()}
				<div class="absolute right-3 bottom-3 z-[6] flex items-center border-2 border-b3 bg-b0 shadow-[4px_4px_0_#000]">
					<button type="button" class="h-9 w-9 border-r-2 border-b3 font-pixel text-base font-bold" aria-label="Diminuir zoom" onclick={() => quadro?.zoomEm(1 / 1.25)}>−</button>
					<span class="min-w-[52px] text-center font-pixel text-[13px] font-bold">{Math.round(ui.zoom * 100)}%</span>
					<button type="button" class="h-9 w-9 border-l-2 border-b3 font-pixel text-base font-bold" aria-label="Aumentar zoom" onclick={() => quadro?.zoomEm(1.25)}>+</button>
					<button type="button" class="h-9 w-9 border-l-2 border-b3 font-pixel text-sm font-bold" aria-label="Ajustar à tela" title="Ajustar à tela" onclick={() => quadro?.ajustar()}>⤢</button>
				</div>
				<div class="absolute right-[220px] bottom-3 left-3 z-[6] flex flex-wrap items-end gap-1.5">
					{#each ui.fichas.filter((f) => f.min) as f (f.token)}
						{@const t = mesa.tokens.find((k) => k.id === f.token)}
						{#if t}
							<div class="flex items-center border-2 bg-b2 shadow-[4px_4px_0_var(--b0)]" style="border-color: {corCss(mesa.corDe(mesa.donoDe(t)))}">
								<button type="button" class="min-h-9 px-2.5 text-[13px] font-semibold" onclick={() => ui.abrirFicha(t.id)}>▴ {t.nome}</button>
								<button type="button" class="h-9 w-8 border-l-2 border-b3 font-pixel text-xs" aria-label="Fechar ficha" onclick={() => ui.fecharFicha(t.id)}>✕</button>
							</div>
						{/if}
					{/each}
					{#if !ui.painelAberto && ultima}
						<button type="button" class="flex min-h-9 items-center gap-2.5 border-2 border-[var(--vermelhao-lo)] bg-b0 pr-2.5 pl-1" onclick={() => ((ui.painelAberto = true), (ui.naoVistas = 0))}>
							<Icone id="dado/ic-dado-d20" /><span class="text-[13px] leading-none font-medium">{ultima.quem} · {ultima.rotulo}</span><b class="font-pixel text-lg leading-none">{ultima.total}</b>
						</button>
					{/if}
				</div>
				{@render fichasAbertas()}
			</div>

			{#if ui.painelAberto}
				<PainelMesa {mesa} {ui} {rolagens} {comoQuem} onRolar={rolarLivre} />
			{:else}
				<div class="flex w-12 flex-none flex-col items-center gap-1.5 border-l-2 border-b3 bg-b2 pt-1.5">
					<button type="button" class="relative flex h-10 w-10 items-center justify-center border-2 border-[var(--vermelhao-lo)] p-0" aria-label="Abrir rolagens" title="Abrir rolagens" onclick={() => ((ui.painelAberto = true), (ui.naoVistas = 0))}>
						<Icone id="dado/ic-dado-d20" />
						{#if ui.naoVistas}<span class="absolute -top-1.5 -right-1.5 bg-[var(--vermelhao)] px-1 py-0.5 font-pixel text-[11px] leading-none font-bold text-white">{ui.naoVistas}</span>{/if}
					</button>
				</div>
			{/if}

			{#if ui.pop === 'medir'}
				<div role="menu" aria-label="Medir" class="{pop} top-[52px] w-[260px]" style="left: {(ui.elencoAberto ? 280 : 40) + 52}px">
					<span class="px-3 pt-2.5 pb-1.5 font-pixel text-xs leading-none font-bold tracking-[0.1em] text-title">MEDIR</span>
					<button type="button" role="menuitem" class={itemMenu} onclick={() => ((ui.pop = null), (ui.aneis = null))}><span class="text-sm leading-[18px] font-semibold">Régua livre</span><span class="text-xs leading-4 text-mut">Clique cria pontos, clique duplo termina</span></button>
					<button type="button" role="menuitem" class={itemMenu} disabled={!selTok} onclick={() => selTok && ((ui.aneis = { token: selTok.id, corpo: 0, lista: [{ r: deslocamentoDe(selTok), rotulo: `Mover · ${deslocamentoDe(selTok)} m` }, { r: deslocamentoDe(selTok) * 3, rotulo: `Com sprint · ${deslocamentoDe(selTok) * 3} m` }], titulo: 'Deslocamento' }), (ui.pop = null))}><span class="text-sm leading-[18px] font-semibold">Deslocamento</span><span class="text-xs leading-4 text-mut">{selTok ? `Anéis de ${nomeCurto(selTok.nome)}` : 'Selecione um token'}</span></button>
					<button type="button" role="menuitem" class={itemMenu} disabled={!selTok} onclick={() => selTok && ((ui.aneis = { token: selTok.id, corpo: alcanceCorpo(selTok.tamanho), lista: [], titulo: 'Corpo a corpo' }), (ui.pop = null))}><span class="text-sm leading-[18px] font-semibold">Corpo a corpo</span><span class="text-xs leading-4 text-mut">Os quadrados adjacentes</span></button>
					<button type="button" role="menuitem" class={itemMenu} disabled={!selFicha} onclick={() => (ui.pop = 'jutsu')}><span class="text-sm leading-[18px] font-semibold">Jutsu…</span><span class="text-xs leading-4 text-mut">{selFicha ? `Jutsus de ${nomeCurto(selFicha.nome)}` : 'Selecione um token com ficha'}</span></button>
					<button type="button" role="menuitem" class={itemMenu} disabled={!selFicha} onclick={() => selTok && selFicha && ((ui.aneis = { token: selTok.id, corpo: Math.max(...selFicha.armas.map((a) => (a.alcance <= 2 ? a.alcance : 0)), 0), lista: selFicha.armas.filter((a) => a.alcance > 2).map((a) => ({ r: a.alcance, rotulo: `${a.nome} · ${a.alcance} m` })), titulo: 'Armas' }), (ui.pop = null))}><span class="text-sm leading-[18px] font-semibold">Arma…</span><span class="text-xs leading-4 text-mut">O alcance de cada arma do inventário</span></button>
					<button type="button" role="menuitem" class={itemMenu} disabled={!selFicha?.distancias.length} onclick={() => selTok && selFicha && ((ui.aneis = { token: selTok.id, corpo: 0, lista: selFicha.distancias.map(([n, r]) => ({ r, rotulo: `${n} · ${r} m` })), titulo: 'Distâncias da ficha' }), (ui.pop = null))}><span class="text-sm leading-[18px] font-semibold">Distâncias da ficha</span><span class="text-xs leading-4 text-mut">Kawarimi, fios da marionete, sensor</span></button>
				</div>
			{/if}
			{#if ui.pop === 'jutsu' && selTok && selFicha}
				<div role="dialog" aria-label="Escolher jutsu" class="{pop} top-[52px] max-h-[70%] w-[340px] overflow-auto" style="left: {(ui.elencoAberto ? 280 : 40) + 52}px">
					<span class="px-3 pt-2.5 pb-1.5 font-pixel text-xs leading-none font-bold tracking-[0.1em] text-title">JUTSUS DE {nomeCurto(selFicha.nome).toUpperCase()}</span>
					{#each selFicha.jutsus as j (j.slug)}
						<div class="flex items-center gap-2 border-t-2 border-b2 px-3 py-2">
							<div class="flex min-w-0 flex-1 flex-col gap-0.5"><span class="text-sm leading-[18px] font-semibold">{j.nome}</span><span class="text-xs leading-4 text-mut">{j.custo} {j.unidade} · {j.alcance} · {j.area}</span>{#if !temRegua(j.regua)}<span class="text-xs leading-4 font-semibold text-warn">Alcance especial: sem régua</span>{/if}</div>
							<button type="button" class="min-h-8 border-2 border-field px-2 font-pixel text-[11px] font-bold disabled:opacity-50" disabled={!temRegua(j.regua)} onclick={() => medirJutsu(selTok, j)}>MEDIR</button>
						</div>
					{/each}
				</div>
			{/if}
			{#if ui.pop === 'lapis'}
				<div role="dialog" aria-label="Lápis" class="{pop} top-24 w-[270px] gap-2.5 p-3" style="left: {(ui.elencoAberto ? 280 : 40) + 52}px">
					<span class="font-pixel text-xs leading-none font-bold tracking-[0.1em] text-title">LÁPIS</span>
					<div role="radiogroup" aria-label="Modo" class="flex border-2 border-b3">
						{#each [['lapis', 'LÁPIS'], ['apontar', 'APONTAR']] as const as [m, n] (m)}
							<button type="button" role="radio" aria-checked={ui.modoLapis === m} class="{chip} {ui.modoLapis === m ? 'bg-grena text-papel' : ''}" onclick={() => ((ui.modoLapis = m), (ui.ferramenta = m))}>{n}</button>
						{/each}
					</div>
					<span class="text-xs leading-4 text-mut">Lápis fica até alguém apagar; Shift faz linha reta. Apontar some em 3 segundos.</span>
					<div role="radiogroup" aria-label="Espessura" class="flex border-2 border-b3">
						{#each [[0.1, 'FINA'], [0.2, 'MÉDIA'], [0.4, 'GROSSA']] as const as [w, n] (w)}
							<button type="button" role="radio" aria-checked={ui.espessura === w} class="{chip} text-[11px] {ui.espessura === w ? 'bg-grena text-papel' : ''}" onclick={() => (ui.espessura = w)}>{n}</button>
						{/each}
					</div>
					<button type="button" class="flex min-h-9 items-center gap-2 border-2 border-b3 px-2 text-[13px] font-semibold" onclick={() => (ui.pop = 'cor')}><span class="h-4 w-4" style="background: {corCss(mesa.corDe(data.eu))}"></span>Sua cor: {nomeCor(mesa.corDe(data.eu))}<span class="ml-auto font-pixel text-[11px] font-bold text-mut">TROCAR</span></button>
					<button type="button" class="min-h-9 border-2 border-b3 text-[13px] font-semibold" onclick={() => mesa.limparTracos(false)}>Limpar meus traços</button>
					{#if data.mestre}
						<button type="button" class="min-h-9 border-2 text-[13px] font-semibold {limparTodosConfirma ? 'border-[var(--vermelhao)]' : 'border-b3'}" onclick={() => {
							if (!limparTodosConfirma) return void (limparTodosConfirma = true);
							mesa.limparTracos(true);
							limparTodosConfirma = false;
						}}>{limparTodosConfirma ? 'Confirmar: limpar todos' : 'Limpar todos os traços'}</button>
					{/if}
				</div>
			{/if}
		</div>
	</div>
{/if}

{#if ui.modal}
	<div class="fixed inset-0 z-[60] flex items-center justify-center bg-[rgba(10,8,7,.72)] p-4" role="presentation" onclick={(e) => e.target === e.currentTarget && (ui.modal = null)}>
		<div role="dialog" aria-modal="true" class="flex {ui.modal.tipo === 'jutsu' ? 'w-[560px]' : 'w-[440px]'} max-w-full flex-col border-2 border-[var(--vermelhao-lo)] bg-b2 shadow-[8px_8px_0_#000]">
			{#if ui.modal.tipo === 'jutsu'}
				{@const j = ui.modal.j}
				<div class="flex items-center gap-2 border-b-2 border-[var(--vermelhao-lo)] bg-b0 py-1 pr-1 pl-3.5">
					<span class="flex-1 font-pixel text-[13px] leading-none font-bold tracking-[0.1em] text-title">{j.texto != null ? 'HABILIDADE' : 'JUTSU'}</span>
					<button type="button" class="h-9 w-9 font-pixel text-sm" aria-label="Fechar" title="Fechar" onclick={() => (ui.modal = null)}>✕</button>
				</div>
				<div class="max-h-[calc(100dvh-140px)] overflow-y-auto p-3">
					{#if card?.carregando}
						<span class="text-sm text-mut">Carregando o jutsu…</span>
					{:else if card?.jutsu}
						<CardJutsu jutsu={card.jutsu} semSombra rodape={false} />
					{:else}
						<!-- habilidade do bestiário, ou jutsu sem card: o que a ficha rápida sabe -->
						<div class="flex flex-col gap-2">
							<span class="font-mincho text-xl leading-[26px] font-bold">{j.nome}</span>
							<span class="text-xs leading-4 text-mut">{[j.custo ? `${j.custo} ${j.unidade}` : '', j.alcance, j.area, j.resistencia ?? '', j.porCena ? 'Uma vez por cena' : ''].filter(Boolean).join(' · ')}</span>
							{#if j.texto}<p class="text-sm leading-5 whitespace-pre-line">{j.texto}</p>{:else}<span class="text-sm leading-5 text-mut">O card completo deste jutsu não foi encontrado.</span>{/if}
						</div>
					{/if}
				</div>
			{:else if ui.modal.tipo === 'nova'}
				<div class="border-b-2 border-[var(--vermelhao-lo)] bg-b0 px-3.5 py-2.5 font-pixel text-[13px] leading-none font-bold tracking-[0.1em] text-title">NOVA CENA</div>
				<div class="flex flex-col gap-3 p-4">
					<label class="flex flex-col gap-1.5"><span class="font-pixel text-xs font-bold tracking-[0.08em] text-mut">NOME</span><input bind:value={novaCena.nome} class="h-11 border-2 border-b3 bg-b1 px-2.5 text-[15px] font-semibold text-fg" /></label>
					<div class="flex gap-2.5">
						<label class="flex flex-1 flex-col gap-1.5"><span class="font-pixel text-xs font-bold tracking-[0.08em] text-mut">LARGURA (M)</span><input type="number" min="5" max="200" bind:value={novaCena.largura} class="h-11 border-2 border-b3 bg-b1 px-2.5 font-pixel text-base font-bold text-fg" /></label>
						<label class="flex flex-1 flex-col gap-1.5"><span class="font-pixel text-xs font-bold tracking-[0.08em] text-mut">ALTURA (M)</span><input type="number" min="5" max="200" bind:value={novaCena.altura} class="h-11 border-2 border-b3 bg-b1 px-2.5 font-pixel text-base font-bold text-fg" /></label>
					</div>
					<span class="text-xs leading-4 text-mut">Até 200 × 200 m. {data.cenas.length ? 'A cena nova fica preparada, sem que o grupo veja, até você ativar.' : 'É a primeira cena: ela já abre para o grupo.'}</span>
					<div class="flex flex-col gap-1.5">
						<span class="font-pixel text-xs font-bold tracking-[0.08em] text-mut">COMEÇAR</span>
						<div role="radiogroup" class="flex border-2 border-b3">
							{#each [[false, 'VAZIA'], [true, 'COM O GRUPO']] as const as [g, n] (n)}
								<button type="button" role="radio" aria-checked={novaCena.grupo === g} class="min-h-10 flex-1 font-pixel text-xs font-bold {novaCena.grupo === g ? 'bg-grena text-papel' : ''}" onclick={() => (novaCena.grupo = g)}>{n}</button>
							{/each}
						</div>
					</div>
				</div>
				<div class="flex justify-end gap-2 border-t-2 border-b3 px-4 py-3">
					<button type="button" class="btn-jogo min-h-11" onclick={() => (ui.modal = null)}>CANCELAR</button>
					<button type="button" class="btn-jogo btn-primario min-h-11" onclick={criarCena}>CRIAR CENA</button>
				</div>
			{:else if ui.modal.tipo === 'excluir' && cena}
				<div class="border-b-2 border-[var(--vermelhao-lo)] bg-b0 px-3.5 py-2.5 font-pixel text-[13px] leading-none font-bold tracking-[0.1em] text-err">EXCLUIR CENA</div>
				<div class="flex flex-col gap-3 p-4">
					<span class="font-mincho text-xl leading-[26px] font-bold">Excluir “{cena.nome}”?</span>
					<span class="text-sm leading-5 text-mut">A cena tem {mesa.tokens.length} {mesa.tokens.length === 1 ? 'token' : 'tokens'}, traços e efeitos. Personagens e NPCs continuam na campanha; só o quadro é apagado. Não dá para desfazer.</span>
					{#if mesa.tokens.length}
						<label class="flex flex-col gap-1.5"><span class="text-[13px] leading-[18px] font-semibold">Digite <b>{cena.nome}</b> para confirmar</span><input bind:value={textoModal} class="h-11 border-2 border-b3 bg-b1 px-2.5 text-[15px] font-semibold text-fg" /></label>
					{/if}
				</div>
				<div class="flex justify-end gap-2 border-t-2 border-b3 px-4 py-3">
					<button type="button" class="btn-jogo min-h-11" onclick={() => (ui.modal = null)}>CANCELAR</button>
					<button type="button" class="btn-jogo btn-erro min-h-11" disabled={!!mesa.tokens.length && textoModal.trim() !== cena.nome} onclick={excluirCena}>EXCLUIR CENA</button>
				</div>
			{:else if ui.modal.tipo === 'participantes'}
				<div class="border-b-2 border-[var(--vermelhao-lo)] bg-b0 px-3.5 py-2.5 font-pixel text-[13px] leading-none font-bold tracking-[0.1em] text-title">QUEM JOGA NESTA CENA</div>
				<div class="flex flex-col gap-2 p-4">
					<span class="text-sm leading-5 text-mut">Quem fica de fora assiste à cena, mas não entra com o personagem. "Colocar o grupo" põe só quem joga.</span>
					{#each data.personagens as p (p.id)}
						{@const on = escolhidos.includes(p.id)}
						{@const jogador = data.membros.find((m) => m.id === p.jogadorId)}
						<button type="button" role="checkbox" aria-checked={on} class="flex min-h-12 items-center gap-2.5 border-2 px-2.5 text-left {on ? 'border-[var(--vermelhao)] bg-grena text-papel' : 'border-b3'}" onclick={() => (escolhidos = on ? escolhidos.filter((x) => x !== p.id) : [...escolhidos, p.id])}>
							<span class="font-pixel text-sm font-bold">{on ? '☒' : '☐'}</span>
							<span class="h-3 w-3 flex-none" style="background: {corCss(mesa.corDe(p.jogadorId))}"></span>
							<span class="flex min-w-0 flex-col"><span class="text-sm font-semibold">{p.nome}</span><span class="text-xs {on ? 'text-papel' : 'text-mut'}">{jogador?.nome ?? ''} · {p.sub}</span></span>
						</button>
					{:else}
						<span class="text-sm text-mut">Nenhum personagem aprovado na campanha ainda.</span>
					{/each}
					<div class="flex gap-1.5">
						<button type="button" class="min-h-9 flex-1 border-2 border-b3 font-pixel text-[11px] font-bold" onclick={() => (escolhidos = data.personagens.map((p) => p.id))}>TODOS</button>
						<button type="button" class="min-h-9 flex-1 border-2 border-b3 font-pixel text-[11px] font-bold" onclick={() => (escolhidos = [])}>NINGUÉM</button>
					</div>
				</div>
				<div class="flex justify-end gap-2 border-t-2 border-b3 px-4 py-3">
					<button type="button" class="btn-jogo min-h-11" onclick={() => (ui.modal = null)}>CANCELAR</button>
					<button type="button" class="btn-jogo btn-primario min-h-11" onclick={salvarParticipantes}>SALVAR</button>
				</div>
			{:else if ui.modal.tipo === 'bestiario'}
				<div class="border-b-2 border-[var(--vermelhao-lo)] bg-b0 px-3.5 py-2.5 font-pixel text-[13px] leading-none font-bold tracking-[0.1em] text-title">IMPORTAR DO BESTIÁRIO</div>
				<div class="flex flex-col gap-2 p-4">
					<span class="text-sm leading-5 text-mut">O NPC entra na lista da campanha, com jutsus, acerto, DT e arte, e já cai na cena, escondido.</span>
					<BuscaBestiario onEscolher={importarBestiario} onFechar={() => (ui.modal = null)} ocupado={importando} />
				</div>
			{:else if ui.modal.tipo === 'renomear'}
				<div class="border-b-2 border-[var(--vermelhao-lo)] bg-b0 px-3.5 py-2.5 font-pixel text-[13px] leading-none font-bold tracking-[0.1em] text-title">RENOMEAR CENA</div>
				<div class="p-4"><input bind:value={textoModal} aria-label="Nome da cena" class="h-11 w-full border-2 border-b3 bg-b1 px-2.5 text-[15px] font-semibold text-fg" onkeydown={(e) => e.key === 'Enter' && renomear()} /></div>
				<div class="flex justify-end gap-2 border-t-2 border-b3 px-4 py-3">
					<button type="button" class="btn-jogo min-h-11" onclick={() => (ui.modal = null)}>CANCELAR</button>
					<button type="button" class="btn-jogo btn-primario min-h-11" onclick={renomear}>SALVAR</button>
				</div>
			{/if}
		</div>
	</div>
{/if}
