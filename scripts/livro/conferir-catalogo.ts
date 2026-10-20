// Confere uma reescrita do texto dos catálogos (conteudo/jutsus.yaml e conteudo/habilidades.yaml): o app lê o efeito
// para montar as rolagens da ficha e os filtros do catálogo, então, para cada carta, compara entre a versão do git
// (padrão: HEAD) e a do disco:
//   - o dano e a cura que a ficha tira do efeito (danoDoEfeito, curaDoEfeito);
//   - a classificação "O que faz" do catálogo (efeitosJutsu);
//   - os números do efeito e das notas (sumiram ou apareceram);
//   - a linha de info, o custo e o rank (não deveriam mudar).
// Uso: node scripts/livro/conferir-catalogo.ts [--ref main]
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { curaDoEfeito, danoDoEfeito } from '#lib/rolagens/expressoes.ts';
import { acaoDe, alcanceAlvo, ataqueDe, duracaoDe, efeitosJutsu, resistenciaDe } from '#lib/livro/filtros-jutsu.ts';
import { periciaDoAtaque } from '#lib/rolagens/expressoes.ts';
import { lerYaml, trechosDeMd } from './md.ts';

const RAIZ = join(import.meta.dirname, '..', '..');
const args = process.argv.slice(2);
const ref = args.includes('--ref') ? args[args.indexOf('--ref') + 1] : 'HEAD';

type Carta = { slug: string; nome: string; descricao: string[]; efeito: string | null; notas: string[]; info?: { k: string; v: string }[]; custo?: string; rank?: string };
const texto = (md: string) => trechosDeMd(md).map((t) => t.t).join('');
const numeros = (s: string) => [...s.replace(/[−–]/g, '-').matchAll(/(?<![\p{L}\d])[+-]?\d+(?:[.,]\d+)?(?:d\d+)?/gu)].map((m) => m[0]).sort();
const diferenca = (a: string[], b: string[]) => {
	const resto = [...b];
	return a.filter((x) => {
		const i = resto.indexOf(x);
		if (i < 0) return true;
		resto.splice(i, 1);
		return false;
	});
};
function fatos(c: Carta) {
	const efeito = c.efeito ? texto(c.efeito) : '';
	const j = { efeito: c.efeito ? trechosDeMd(c.efeito) : null, descricao: c.descricao.map(trechosDeMd) };
	return {
		dano: JSON.stringify(danoDoEfeito(efeito)),
		cura: JSON.stringify(curaDoEfeito(efeito)),
		filtros: efeitosJutsu(j).join(','),
		numeros: numeros([efeito, ...c.notas.map(texto)].join(' ')),
		// a linha de info pode ter o texto polido, mas o que o app tira dela tem de ser igual
		fixo: JSON.stringify(c.info ? [periciaDoAtaque(c.info), ataqueDe(c as { info: { k: string; v: string }[] }), resistenciaDe(c as { info: { k: string; v: string }[] }), duracaoDe(c as { info: { k: string; v: string }[] }), acaoDe(c as { info: { k: string; v: string }[] }), alcanceAlvo(c as { info: { k: string; v: string }[] }), c.info.map((i) => i.k), c.custo, c.rank] : null)
	};
}

let problemas = 0;
for (const arq of ['jutsus.yaml', 'habilidades.yaml']) {
	const antes = lerYaml(execFileSync('git', ['show', `${ref}:conteudo/${arq}`], { cwd: RAIZ, encoding: 'utf8' })) as Carta[];
	const depois = new Map((lerYaml(readFileSync(join(RAIZ, 'conteudo', arq), 'utf8')) as Carta[]).map((c) => [c.slug, c]));
	let mudadas = 0;
	for (const a of antes) {
		const d = depois.get(a.slug);
		if (!d) {
			console.log(`${arq} ${a.slug}: sumiu`);
			problemas++;
			continue;
		}
		if (JSON.stringify(a) === JSON.stringify(d)) continue;
		mudadas++;
		const fa = fatos(a);
		const fd = fatos(d);
		const linhas: string[] = [];
		if (fa.dano !== fd.dano) linhas.push(`dano ${fa.dano} → ${fd.dano}`);
		if (fa.cura !== fd.cura) linhas.push(`cura ${fa.cura} → ${fd.cura}`);
		if (fa.filtros !== fd.filtros) linhas.push(`filtros ${fa.filtros} → ${fd.filtros}`);
		if (fa.fixo !== fd.fixo) linhas.push('info, custo ou rank mudaram');
		const sumiram = diferenca(fa.numeros, fd.numeros);
		const novos = diferenca(fd.numeros, fa.numeros);
		if (sumiram.length) linhas.push(`números que sumiram: ${sumiram.join(' ')}`);
		if (novos.length) linhas.push(`números novos: ${novos.join(' ')}`);
		if (linhas.length) {
			problemas += linhas.filter((l) => !l.startsWith('números novos')).length;
			console.log(`${arq} ${a.slug}\n  ${linhas.join('\n  ')}`);
		}
	}
	console.log(`${arq}: ${mudadas} cartas mudaram de ${antes.length}`);
}
console.log(problemas ? `${problemas} diferença(s) para conferir.` : 'Rolagens, filtros e números iguais.');
