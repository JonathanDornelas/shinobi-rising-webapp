// Leitura de clãs criados no servidor (load das páginas). O RLS decide o que cada um vê.
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '#lib/supabase/banco.ts';
import { normalizarCla, type ClaDados } from './regras.ts';

type Cliente = SupabaseClient<Database>;

/** O clã criado que uma ficha usa (para o catálogo da ficha, a subida de nível e o criador de personagem). */
export async function claDaFicha(supabase: Cliente, claId: string | null | undefined) {
	if (!claId) return null;
	const { data } = await supabase.from('clas').select('id, nome, kkg, status, dados, autor_id').eq('id', claId).maybeSingle();
	if (!data) return null;
	return { id: data.id, nome: data.nome, kkg: data.kkg, status: data.status, autor_id: data.autor_id, dados: normalizarCla(data.dados as Partial<ClaDados>, data.kkg) };
}
