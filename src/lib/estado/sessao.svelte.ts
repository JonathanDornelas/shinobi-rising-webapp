// Sessão no navegador: usuário, perfil e notificações (com tempo real).
// As páginas da documentação são pré-renderizadas sem sessão; aqui ela é lida dos cookies.
import type { RealtimeChannel } from '@supabase/supabase-js';
import { refreshAll } from '$app/navigation';
import { supabase } from '#lib/supabase/cliente.ts';
import type { Notificacao, Perfil, Preferencias } from '#lib/supabase/banco.ts';
import { favoritos } from './favoritos.svelte.ts';
import { preferencias } from './preferencias.svelte.ts';
import { normalizarVisual } from './visual.ts';

export interface UsuarioSessao {
	id: string;
	email: string;
	nome: string;
}

class Sessao {
	usuario = $state<UsuarioSessao | null>(null);
	perfil = $state<Perfil | null>(null);
	/** false até a primeira leitura da sessão no navegador (evita piscar o estado de visitante). */
	pronta = $state(false);
	notificacoes = $state<Notificacao[]>([]);
	notificacoesErro = $state(false);
	carregandoNotificacoes = $state(false);
	naoLidas = $derived(this.notificacoes.filter((n) => !n.lida).length);
	nome = $derived(this.perfil?.nome || this.usuario?.nome || this.usuario?.email.split('@')[0] || '');

	private canal: RealtimeChannel | null = null;
	private iniciada = false;

	/** Chamado uma vez no layout raiz. `inicial` vem do servidor nas páginas dinâmicas. */
	iniciar(inicial: UsuarioSessao | null | undefined) {
		if (inicial) this.definirUsuario(inicial);
		if (this.iniciada) return;
		this.iniciada = true;
		const sb = supabase();
		sb.auth.getSession().then(({ data }) => {
			const u = data.session?.user;
			this.definirUsuario(u ? { id: u.id, email: u.email ?? '', nome: (u.user_metadata?.nome as string) ?? '' } : null);
			this.pronta = true;
		});
		sb.auth.onAuthStateChange((evento, sessao) => {
			const u = sessao?.user;
			const anterior = this.usuario?.id;
			this.definirUsuario(u ? { id: u.id, email: u.email ?? '', nome: (u.user_metadata?.nome as string) ?? '' } : null);
			this.pronta = true;
			if (evento === 'SIGNED_OUT' || (evento === 'SIGNED_IN' && anterior !== u?.id)) refreshAll();
		});
	}

	private definirUsuario(u: UsuarioSessao | null) {
		const mudou = u?.id !== this.usuario?.id;
		this.usuario = u;
		if (!mudou) return;
		this.perfil = null;
		this.notificacoes = [];
		this.canal?.unsubscribe();
		this.canal = null;
		if (!u) favoritos.conectar(null, null);
		if (u) {
			this.carregarPerfil();
			this.carregarNotificacoes();
			this.assinar(u.id);
		}
	}

	async carregarPerfil() {
		if (!this.usuario) return;
		const { data } = await supabase().from('perfis').select('*').eq('id', this.usuario.id).maybeSingle();
		if (!data) return;
		this.perfil = data;
		const p = data.preferencias;
		if (p.tema && p.tema !== preferencias.tema) preferencias.definirTema(p.tema);
		if (p.leitura && p.leitura !== preferencias.leitura) preferencias.definirLeitura(p.leitura);
		if (p.visual && JSON.stringify(normalizarVisual(p.visual)) !== JSON.stringify(preferencias.visual)) preferencias.definirVisual(normalizarVisual(p.visual));
		favoritos.conectar(p.favoritos?.jutsus, (jutsus) => this.salvarPreferencias({ favoritos: { ...this.perfil?.preferencias.favoritos, jutsus } }));
	}

	async carregarNotificacoes() {
		if (!this.usuario) return;
		this.carregandoNotificacoes = true;
		const { data, error } = await supabase().from('notificacoes').select('*').order('criada_em', { ascending: false }).limit(50);
		this.carregandoNotificacoes = false;
		this.notificacoesErro = !!error;
		if (data) this.notificacoes = data;
	}

	private assinar(id: string) {
		this.canal = supabase()
			.channel(`notificacoes:${id}`)
			.on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'notificacoes', filter: `usuario_id=eq.${id}` }, (p) => {
				this.notificacoes = [p.new as Notificacao, ...this.notificacoes];
			})
			.subscribe();
	}

	async marcarLida(id: string) {
		this.notificacoes = this.notificacoes.map((n) => (n.id === id ? { ...n, lida: true } : n));
		await supabase().from('notificacoes').update({ lida: true }).eq('id', id);
	}

	async marcarTodasLidas() {
		if (!this.usuario) return;
		this.notificacoes = this.notificacoes.map((n) => ({ ...n, lida: true }));
		await supabase().from('notificacoes').update({ lida: true }).eq('usuario_id', this.usuario.id).eq('lida', false);
	}

	/** Grava parte das preferências no perfil (o tema e a leitura também valem neste dispositivo). */
	async salvarPreferencias(parcial: Partial<Preferencias>) {
		if (!this.perfil) return { error: new Error('Perfil não carregado') };
		const nova = { ...this.perfil.preferencias, ...parcial };
		this.perfil = { ...this.perfil, preferencias: nova };
		return supabase().from('perfis').update({ preferencias: nova }).eq('id', this.perfil.id);
	}

	/** Avatar da conta (caminho no bucket de retratos, ou null). */
	async salvarAvatar(avatar: string | null) {
		if (!this.perfil) return { error: new Error('Perfil não carregado') };
		const r = await supabase().from('perfis').update({ avatar }).eq('id', this.perfil.id);
		if (!r.error) this.perfil = { ...this.perfil, avatar };
		return r;
	}

	async salvarNome(nome: string) {
		if (!this.perfil) return { error: new Error('Perfil não carregado') };
		const r = await supabase().from('perfis').update({ nome }).eq('id', this.perfil.id);
		if (!r.error) this.perfil = { ...this.perfil, nome };
		return r;
	}

	async sair() {
		await supabase().auth.signOut();
	}
}

export const sessao = new Sessao();
