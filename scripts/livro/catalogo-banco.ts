// Escreve a migração que põe o catálogo do livro nas tabelas livro_*. Rode quando jutsus, clãs ou marcos mudarem:
//   npx tsx scripts/livro/catalogo-banco.ts <aaaammddhhmmss>
// O teste supabase/testes/conferencia_ficha.spec.ts falha enquanto o banco estiver diferente do livro.
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { catalogoDoBanco } from '#lib/livro/catalogo-banco.ts';

const carimbo = process.argv[2];
if (!/^\d{14}$/.test(carimbo ?? '')) throw new Error('uso: npx tsx scripts/livro/catalogo-banco.ts <aaaammddhhmmss>');

const { jutsus, clas, marcos } = catalogoDoBanco();
const json = (v: unknown) => `$json$${JSON.stringify(v)}$json$::jsonb`;
const sql = `-- Gerado por scripts/livro/catalogo-banco.ts a partir do livro: não edite à mão.
truncate public.livro_jutsus, public.livro_clas, public.livro_marcos;
insert into public.livro_jutsus (slug, rank, cla, elemento)
	select slug, rank, cla, elemento from jsonb_to_recordset(${json(jutsus)}) as x(slug text, rank text, cla text, elemento text);
insert into public.livro_clas (slug, elementos)
	select slug, coalesce(array(select jsonb_array_elements_text(elementos)), '{}') from jsonb_to_recordset(${json(clas)}) as x(slug text, elementos jsonb);
insert into public.livro_marcos (cla, nivel, ganho, escolha_pericia)
	select cla, nivel, ganho, case when escolha_pericia is null then null else array(select jsonb_array_elements_text(escolha_pericia)) end
	from jsonb_to_recordset(${json(marcos)}) as x(cla text, nivel int, ganho jsonb, escolha_pericia jsonb);
`;
const arquivo = join(import.meta.dirname, '..', '..', 'supabase', 'migrations', `${carimbo}_catalogo_do_livro.sql`);
writeFileSync(arquivo, sql);
console.log(`${arquivo}: ${jutsus.length} jutsus, ${clas.length} clãs, ${marcos.length} marcos`);
