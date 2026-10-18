// Jutsus criados que a ficha usa: os aprovados feitos para o personagem (aprende com PT) e os das cartas do clã criado.
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '#lib/supabase/banco.ts';
import { normalizarJutsu, type JutsuDados } from './regras.ts';

type Cliente = SupabaseClient<Database>;
export interface JutsuCriadoFicha {
	id: string;
	personagem_id: string | null;
	cla_id: string | null;
	carta_id: string | null;
	dados: JutsuDados;
}

export async function jutsusDaFicha(supabase: Cliente, personagemId: string, claId: string | null | undefined, dados?: unknown): Promise<JutsuCriadoFicha[]> {
	// jutsus criados concedidos pelo Mestre ou aprendidos chegam pelos slugs jc-<id> nos treinos da ficha
	const treinos = ((dados as { progresso?: { treinos?: { tipo: string; slug?: string }[] } })?.progresso?.treinos ?? []).flatMap((t) =>
		t.tipo === 'jutsu' && t.slug?.startsWith('jc-') && /^jc-[0-9a-f-]{36}$/.test(t.slug) ? [t.slug.slice(3)] : []
	);
	const filtro = [`personagem_id.eq.${personagemId}`, claId ? `cla_id.eq.${claId}` : '', treinos.length ? `id.in.(${treinos.join(',')})` : ''].filter(Boolean).join(',');
	const { data } = await supabase
		.from('jutsus_criados')
		.select('id, personagem_id, cla_id, carta_id, dados, versao, anterior_id')
		.eq('tipo', 'jutsu')
		.eq('status', 'aprovado')
		.or(filtro)
		.order('versao', { ascending: false });
	// numa cadeia de versões aprovadas, vale a mais nova
	const substituidos = new Set((data ?? []).map((j) => j.anterior_id).filter(Boolean));
	return (data ?? [])
		.filter((j) => !substituidos.has(j.id) || treinos.includes(j.id))
		.map((j) => ({ id: j.id, personagem_id: treinos.includes(j.id) ? personagemId : j.personagem_id, cla_id: j.cla_id, carta_id: j.carta_id, dados: normalizarJutsu(j.dados as Partial<JutsuDados>) }));
}
