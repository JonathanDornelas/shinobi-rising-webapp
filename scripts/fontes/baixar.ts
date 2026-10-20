// Baixa as fontes do Google Fonts para static/fonts/google e gera src/routes/fontes.css, para o site não depender do
// CSS do Google (o da Shippori Mincho tem ~150 KB, por causa das centenas de fatias de caracteres japoneses, e
// bloqueava a página). Guarda o alfabeto latino (português) e, em vez do latin-ext inteiro (168 KB no Noto Sans, só
// pelos macrons de Dōjō e Kankurō), um recorte com as letras com mácron; da Shippori Mincho, também um recorte com
// os caracteres japoneses que o site usa (lidos de src/ e conteudo/).
// As fontes são OFL (static/fonts/LEIA-ME.txt). Uso: node scripts/fontes/baixar.ts
import { mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const RAIZ = join(import.meta.dirname, '..', '..');
const PASTA = join(RAIZ, 'static', 'fonts', 'google');
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36';
const FAMILIAS = ['Noto+Sans:ital,wght@0,400;0,500;0,600;0,700;1,400', 'Pixelify+Sans:wght@400;500;600;700', 'Shippori+Mincho+B1:wght@600;700;800'];
const SUBSETS = ['latin'];
/** Letras com mácron do rōmaji (as únicas fora do latin que o texto usa). */
const MACRONS = 'āĀōŌūŪ';
const faixa = (cs: string[]) => cs.map((c) => `U+${c.codePointAt(0)!.toString(16).toUpperCase()}`).join(', ');

/** Caracteres japoneses usados no site (kanji dos capítulos, 「忍道」…). */
function caracteresJaponeses(): string[] {
	const vistos = new Set<string>();
	const andar = (dir: string) => {
		for (const f of readdirSync(dir, { withFileTypes: true })) {
			const p = join(dir, f.name);
			if (f.isDirectory()) andar(p);
			else if (/\.(svelte|ts|json|md|yaml|html|css)$/.test(f.name)) for (const ch of readFileSync(p, 'utf8')) if (/[　-ヿ㐀-鿿＀-￯]/.test(ch)) vistos.add(ch);
		}
	};
	andar(join(RAIZ, 'src'));
	andar(join(RAIZ, 'conteudo'));
	return [...vistos].sort();
}

interface Bloco {
	subset: string;
	familia: string;
	estilo: string;
	peso: string;
	url: string;
	faixa: string | null;
}
function blocos(css: string): Bloco[] {
	const out: Bloco[] = [];
	for (const m of css.matchAll(/(?:\/\*\s*([^*]+?)\s*\*\/\s*)?@font-face\s*\{([^}]+)\}/g)) {
		const corpo = m[2];
		const campo = (k: string) => corpo.match(new RegExp(`${k}:\\s*([^;]+);`))?.[1].trim() ?? '';
		out.push({
			subset: m[1] ?? '',
			familia: campo('font-family').replace(/['"]/g, ''),
			estilo: campo('font-style'),
			peso: campo('font-weight'),
			url: corpo.match(/url\(([^)]+)\)/)![1],
			faixa: campo('unicode-range') || null
		});
	}
	return out;
}
const baixarCss = async (consulta: string) => {
	const r = await fetch(`https://fonts.googleapis.com/css2?${consulta}&display=swap`, { headers: { 'User-Agent': UA } });
	if (!r.ok) throw new Error(`Google Fonts respondeu ${r.status} para ${consulta}`);
	return r.text();
};
const nomeArquivo = (b: Bloco, sufixo: string) => `${b.familia.toLowerCase().replace(/\s+/g, '-')}-${sufixo}-${b.estilo}-${b.peso.replace(/\s+/g, '_')}.woff2`;

rmSync(PASTA, { recursive: true, force: true });
mkdirSync(PASTA, { recursive: true });
const regras: string[] = [];
const salvos = new Map<string, string>();
async function salvar(b: Bloco, sufixo: string, faixa: string | null) {
	let nome = salvos.get(b.url);
	if (!nome) {
		nome = nomeArquivo(b, sufixo);
		writeFileSync(join(PASTA, nome), Buffer.from(await (await fetch(b.url)).arrayBuffer()));
		salvos.set(b.url, nome);
	}
	regras.push(`/* ${b.familia} ${b.peso} ${b.estilo}, ${sufixo} */\n@font-face {\n\tfont-family: '${b.familia}';\n\tfont-style: ${b.estilo};\n\tfont-weight: ${b.peso};\n\tfont-display: swap;\n\tsrc: url('/fonts/google/${nome}') format('woff2');${faixa ? `\n\tunicode-range: ${faixa};` : ''}\n}`);
}

for (const f of FAMILIAS) {
	for (const b of blocos(await baixarCss(`family=${f}`))) if (SUBSETS.includes(b.subset)) await salvar(b, b.subset, b.faixa);
	// o recorte por texto vem um arquivo por peso; a faixa diz ao navegador que só serve para essas letras
	for (const b of blocos(await baixarCss(`family=${f}&text=${encodeURIComponent(MACRONS)}`))) await salvar(b, 'macron', faixa([...MACRONS]));
}

// recorte japonês da Shippori Mincho: só os caracteres usados, em cada peso
const jp = caracteresJaponeses();
for (const peso of ['600', '700', '800'])
	for (const b of blocos(await baixarCss(`family=Shippori+Mincho+B1:wght@${peso}&text=${encodeURIComponent(jp.join(''))}`))) await salvar(b, 'jp', faixa(jp));

writeFileSync(
	join(RAIZ, 'src', 'routes', 'fontes.css'),
	`/* Gerado por scripts/fontes/baixar.ts (Google Fonts, OFL). Japonês: ${jp.join('')} */\n\n${regras.join('\n\n')}\n`
);
const kb = [...salvos.values()].reduce((n, a) => n + readFileSync(join(PASTA, a)).length, 0) / 1024;
console.log(`${salvos.size} arquivos, ${Math.round(kb)} KB; ${regras.length} regras @font-face; japonês: ${jp.join('')}`);
