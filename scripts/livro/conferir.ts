// Confere uma reescrita do texto das regras: as regras continuam as mesmas, só muda o texto que as apresenta.
// Compara a versão do git (padrão: HEAD) com a do disco, capítulo a capítulo:
//   - números que sumiram ou apareceram (o sinal mais forte de regra mudada);
//   - número + palavra seguinte ("3 PC", "DT 15", "1 vez") que sumiram ou apareceram (frase reorganizada ou regra mudada);
//   - siglas de recursos e atributos que sumiram ou apareceram.
// Cada diferença tem de ter explicação (número por extenso, frase reescrita, exemplo novo). Não muda nada nos arquivos.
// Uso: node scripts/livro/conferir.ts 01 02 [--ref main]
import { execFileSync } from 'node:child_process';
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const RAIZ = join(import.meta.dirname, '..', '..');
const args = process.argv.slice(2);
const iRef = args.indexOf('--ref');
const ref = iRef >= 0 ? args[iRef + 1] : 'HEAD';
const caps = args.filter((a, i) => !a.startsWith('--') && (iRef < 0 || i !== iRef + 1));
const pasta = join(RAIZ, 'conteudo', 'regras');
const arquivos = readdirSync(pasta).filter((a) => a.endsWith('.md') && (!caps.length || caps.some((c) => a.startsWith(c.padStart(2, '0') + '-'))));

const SIGLAS = /\b(PV|PC|PE|PD|PT|XP|PIC|PJ|DT|RD|FOR|AGI|VIG|INT|CTR|ESP)s?\b/g;
const semAcento = (s: string) => s.normalize('NFD').replace(/\p{M}/gu, '');

/** Texto corrido do Markdown: sem frontmatter, âncoras, sintaxe de diretivas e marcação. */
function texto(md: string): string {
	return md
		.replace(/\r\n/g, '\n')
		.replace(/^---\n[\s\S]*?\n---\n/, '')
		.replace(/\{#[^}]+\}/g, '')
		.replace(/^:{2,3}[a-z-]*(\{[^}]*\})?/gm, (m) => (m.match(/titulo="([^"]*)"/)?.[1] ?? '') + ' ')
		.replace(/:(t|sem)\[([^\]]*)\](\{[^}]*\})?/g, '$2')
		.replace(/\*\*|\*|`|^#+\s|^\s*[-|]\s*|\|/gm, ' ')
		.replace(/[−–]/g, '-')
		.replace(/\s+/g, ' ');
}

function fatos(md: string) {
	const t = texto(md);
	const numeros = new Map<string, number>();
	const pares = new Map<string, number>();
	const conta = (m: Map<string, number>, k: string) => m.set(k, (m.get(k) ?? 0) + 1);
	for (const m of t.matchAll(/(?<![\p{L}\d])([+-]?\d+(?:[.,]\d+)?(?:d\d+)?[ºª°]?)(?:\s+(?:de\s+|do\s+|da\s+)?([\p{L}]+))?/gu)) {
		const n = m[1].replace(/^\+/, '+');
		conta(numeros, n);
		const palavra = m[2] ? semAcento(m[2].toLowerCase()).replace(/s$/, '') : '';
		conta(pares, palavra ? `${n} ${palavra}` : n);
	}
	const siglas = new Map<string, number>();
	for (const m of t.matchAll(SIGLAS)) conta(siglas, m[1]);
	return { numeros, pares, siglas };
}

const diferenca = (a: Map<string, number>, b: Map<string, number>) => [...a.keys()].filter((k) => !b.has(k)).sort();
const linha = (rotulo: string, xs: string[]) => console.log(`  ${rotulo}: ${xs.length ? xs.join(' · ') : '—'}`);

let problemas = 0;
for (const arq of arquivos) {
	let antes = '';
	try {
		antes = execFileSync('git', ['show', `${ref}:conteudo/regras/${arq}`], { cwd: RAIZ, encoding: 'utf8' });
	} catch {
		console.log(`${arq}: não existe em ${ref}`);
		continue;
	}
	const depois = readFileSync(join(pasta, arq), 'utf8');
	if (antes.replace(/\r\n/g, '\n') === depois.replace(/\r\n/g, '\n')) continue;
	const a = fatos(antes);
	const d = fatos(depois);
	const sumiram = diferenca(a.numeros, d.numeros);
	problemas += sumiram.length;
	console.log(`\n${arq} (comparado com ${ref})`);
	linha('números que sumiram', sumiram);
	linha('números novos', diferenca(d.numeros, a.numeros));
	linha('número + palavra que sumiram', diferenca(a.pares, d.pares));
	linha('número + palavra novos', diferenca(d.pares, a.pares));
	linha('siglas que sumiram', diferenca(a.siglas, d.siglas));
	linha('siglas novas', diferenca(d.siglas, a.siglas));
}
if (problemas) console.log(`\n${problemas} número(s) sumiram: confira se a regra foi mantida.`);
