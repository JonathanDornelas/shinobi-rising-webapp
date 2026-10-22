// Compila o livro de regras de conteudo/ (Markdown + YAML) nos dados da documentação web (src/lib/livro/gerado/*.json).
// Uso: npm run livro:gerar
// Fonte: conteudo/livro.yaml (partes), conteudo/regras/*.md (capítulos), conteudo/clas/*.md (clãs do cap. 8.3),
// conteudo/jutsus.yaml e conteudo/habilidades.yaml (cards). Daqui saem também, derivados dos capítulos, as
// especializações (cap. 19), o glossário (cap. 22), os equipamentos (caps. 11–13), a referência rápida, a busca e as
// ligações no texto (referências "cap. N" e siglas do glossário). Sintaxe do Markdown: scripts/livro/md.ts.
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { kanji, normalizar, semAcentos, slug } from '../../src/lib/livro/texto.ts';
import type {
	Bestiario,
	Bloco,
	CardReferencia,
	Criatura,
	EstagioCriatura,
	FormatoArte,
	PapelCriatura,
	RankNpc,
	TipoCriatura,
	Capitulo,
	Celula,
	CategoriaArmas,
	Cla,
	DocBusca,
	Equipamentos,
	Espada,
	Especializacao,
	Especializacoes,
	Habilidade,
	IndiceLivro,
	InfoJutsu,
	ItemLista,
	Jutsu,
	Parte,
	Rank,
	Relacao,
	SecaoGlossario,
	TermoLexico,
	TipoJutsu,
	TipoTermo,
	Trecho
} from '../../src/lib/livro/tipos.ts';
import { fichaCompleta } from '../../src/lib/bestiario/ficha.ts';
import { lerDoc, lerYaml, trechosDeMd } from './md.ts';

export const RAIZ = join(dirname(fileURLToPath(import.meta.url)), '..', '..');

// ---------------------------------------------------------------- tabelas editoriais (as mesmas do conversor do docx)
const ELEMENTOS: Record<string, string> = {
	katon: 'katon',
	suiton: 'suiton',
	doton: 'doton',
	raiton: 'raiton',
	fuuton: 'fuuton',
	futon: 'fuuton',
	mokuton: 'mokuton',
	hyoton: 'hyoton',
	yoton: 'yoton',
	ranton: 'ranton',
	jiton: 'jiton'
};
const VILAS: [RegExp, string, string][] = [
	[/konohagakure/i, 'Konoha', 'vila/ic-vila-konoha'],
	[/kirigakure/i, 'Kiri', 'vila/ic-vila-kiri'],
	[/sunagakure/i, 'Suna', 'vila/ic-vila-suna'],
	[/iwagakure/i, 'Iwa', 'vila/ic-vila-iwa'],
	[/kumogakure/i, 'Kumo', 'vila/ic-vila-kumo'],
	[/uzushiogakure/i, 'Uzushiogakure', ''],
	[/yukigakure/i, 'Yukigakure', '']
];
/** Tipo (ícone kkg-*) da Kekkei Genkai dos clãs que têm uma, conferido no cap. 8.3. O nome vem do título da seção. */
const KKG_CLA: Record<string, string> = {
	hyuuga: 'dojutsu',
	uchiha: 'dojutsu',
	kaguya: 'corporal',
	hozuki: 'corporal',
	sabaku: 'combinacao',
	yuki: 'combinacao'
};
const NOME_TIPO_KKG: Record<string, string> = {
	dojutsu: 'Dōjutsu',
	combinacao: 'Combinação',
	corporal: 'Corporal',
	mental: 'Mental',
	hibrido: 'Híbrido'
};
const ICONE_ESPECIALIZACAO: [RegExp, string][] = [
	[/controle de chakra/i, 'controle-chakra'],
	[/reservat/i, 'reservatorio'],
	[/elemento/i, 'elemento'],
	[/velocidade/i, 'velocidade'],
	[/resist/i, 'resistencia'],
	[/genjutsu/i, 'genjutsu'],
	[/m[ée]dic/i, 'medico'],
	[/ninjutsu/i, 'ninjutsu'],
	[/bukijutsu/i, 'bukijutsu'],
	[/selamento|fuuinjutsu/i, 'selamento'],
	[/furtividade/i, 'furtividade'],
	[/taijutsu/i, 'taijutsu'],
	[/sensor/i, 'sensor'],
	[/invoca/i, 'invocacao'],
	[/marionete|kugutsu/i, 'marionete'],
	[/sennin|senjutsu/i, 'sennin']
];

// ---------------------------------------------------------------- utilitários
const textoDe = (c: Trecho[]) => c.map((t) => t.t).join('');
/** Remove um rótulo inicial ("Obrigação:") de um parágrafo formatado. */
function semRotulo(c: Trecho[], rotulo: RegExp): Trecho[] {
	const copia = c.map((t) => ({ ...t }));
	while (copia.length) {
		const antes = copia[0].t;
		copia[0].t = antes.replace(rotulo, '');
		if (copia[0].t !== antes || !rotulo.test(textoDe(copia))) break;
	}
	if (copia[0]) copia[0].t = copia[0].t.replace(/^\s+/, '');
	return copia.filter((t) => t.t);
}
/** Blocos de uma seção: do título (exclusive) até o próximo título de nível igual ou maior. O teste recebe o texto e a âncora. */
function secao(blocos: Bloco[], teste: (texto: string, id: string) => boolean, nivelMax = 4) {
	const i = blocos.findIndex((b) => b.tipo === 'h' && b.nivel <= nivelMax && teste(b.texto, b.id));
	if (i < 0) return { inicio: -1, fim: -1, titulo: null as null | (Bloco & { tipo: 'h' }), blocos: [] as Bloco[] };
	const titulo = blocos[i] as Bloco & { tipo: 'h' };
	let fim = blocos.findIndex((b, k) => k > i && b.tipo === 'h' && b.nivel <= titulo.nivel);
	if (fim < 0) fim = blocos.length;
	return { inicio: i, fim, titulo, blocos: blocos.slice(i + 1, fim) };
}
const tabelaEm = (bs: Bloco[]) => bs.find((b): b is Bloco & { tipo: 'tabela' } => b.tipo === 'tabela');
const celTexto = (c: Celula) => c.map(textoDe).join(' ').trim();
const escapar = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

export interface Saida {
	indice: IndiceLivro;
	capitulos: Capitulo[];
	jutsus: Jutsu[];
	habilidades: Habilidade[];
	clas: Cla[];
	equipamentos: Equipamentos;
	especializacoes: Especializacoes;
	glossario: SecaoGlossario[];
	referencia: CardReferencia[];
	busca: DocBusca[];
	termos: TermoLexico[];
	bestiario: Bestiario;
}

export function compilar(raiz = RAIZ): { saida: Saida; avisos: string[] } {
	const CONTEUDO = join(raiz, 'conteudo');
	const avisos: string[] = [];
	const avisar = (m: string) => avisos.push(m);
	const existeIcone = (id: string) => existsSync(join(raiz, 'static', 'icons', `${id}-32.png`));
	const iconeSe = (id: string) => (existeIcone(id) ? id : null);
	const arquivos = (pasta: string) =>
		readdirSync(join(CONTEUDO, pasta))
			.filter((a) => a.endsWith('.md'))
			.sort()
			.map((a) => readFileSync(join(CONTEUDO, pasta, a), 'utf8'));

	// ---------------------------------------------------------------- leitura de conteudo/
	const partes = (lerYaml(readFileSync(join(CONTEUDO, 'livro.yaml'), 'utf8')) as { partes: Parte[] }).partes;

	const capitulos: Capitulo[] = arquivos('regras').map((md) => {
		const { frente, blocos } = lerDoc<{ numero: number; slug: string; href: string; titulo: string; parte: number }>(md);
		let epigrafe: Capitulo['epigrafe'] = null;
		let corpo = blocos;
		if (corpo[0]?.tipo === 'epigrafe') {
			epigrafe = { texto: corpo[0].texto, autor: corpo[0].autor };
			corpo = corpo.slice(1);
		}
		return { numero: frente.numero, slug: frente.slug, href: frente.href, titulo: frente.titulo, parte: frente.parte, kanji: kanji(frente.numero), epigrafe, blocos: corpo, secoes: [], resumo: '' };
	});
	const cap = (n: number) => {
		const c = capitulos.find((x) => x.numero === n);
		if (!c) throw new Error(`Capítulo ${n} não encontrado`);
		return c;
	};
	const hrefCapitulo = (n: number) => cap(n).href;

	type CardYaml = { slug: string; nome: string; traducao: string; origem: string; descricao: string[]; efeito: string | null; notas: string[]; capitulo: number; ancora: string; cla: string | null };
	const base = (c: CardYaml) => ({
		nome: c.nome,
		traducao: c.traducao,
		origem: c.origem,
		descricao: c.descricao.map(trechosDeMd),
		efeito: c.efeito ? trechosDeMd(c.efeito) : null,
		notas: c.notas.map(trechosDeMd),
		capitulo: c.capitulo,
		ancora: c.ancora,
		cla: c.cla
	});
	// as cartas embutidas no texto dos capítulos (::jutsu): o "Onde aparece" da página do jutsu aponta para elas
	const cartasNoTexto = new Set<string>();
	const coletarCartas = (v: unknown): void => {
		if (Array.isArray(v)) v.forEach(coletarCartas);
		else if (v && typeof v === 'object') {
			const b = v as { tipo?: string; slug?: string };
			if (b.tipo === 'jutsu' && b.slug) cartasNoTexto.add(b.slug);
			Object.values(v).forEach(coletarCartas);
		}
	};
	capitulos.forEach((c) => coletarCartas(c.blocos));
	const jutsus: Jutsu[] = (lerYaml(readFileSync(join(CONTEUDO, 'jutsus.yaml'), 'utf8')) as (CardYaml & { tipo: TipoJutsu; rank: Rank; custo: string; info: InfoJutsu[]; pj: string | null; elemento: string | null })[]).map((j) => ({
		slug: j.slug,
		...base(j),
		tipo: j.tipo,
		rank: j.rank,
		custo: j.custo,
		custoNum: +(j.custo.match(/\d+/)?.[0] ?? 0),
		info: j.info ?? [],
		pj: j.pj,
		cartaNoCapitulo: cartasNoTexto.has(j.slug),
		elemento: j.elemento
	}));
	const habilidades: Habilidade[] = (lerYaml(readFileSync(join(CONTEUDO, 'habilidades.yaml'), 'utf8')) as CardYaml[]).map((h) => ({ slug: h.slug, ...base(h) }));

	// ---------------------------------------------------------------- clãs (cap. 8.3): cada um em conteudo/clas/*.md
	const clas: Cla[] = [];
	for (const md of arquivos('clas')) {
		const { frente, blocos: corpo } = lerDoc<{ numero: string | number; nome: string; epiteto: string; origem: string }>(md);
		const nomeCompleto = String(frente.nome).trim();
		const nome = nomeCompleto.split('/')[0].trim();
		const s = slug(nome);
		const iSec = corpo.findIndex((b) => b.tipo === 'h');
		const intro = iSec < 0 ? corpo : corpo.slice(0, iSec);
		const epi = intro.find((b) => b.tipo === 'epigrafe');
		const secoes: Cla['secoes'] = [];
		for (const b of iSec < 0 ? [] : corpo.slice(iSec)) {
			if (b.tipo === 'h' && b.nivel === 4) secoes.push({ id: b.id, titulo: b.texto, blocos: [] });
			else secoes[secoes.length - 1]?.blocos.push(b);
		}
		const sec = (re: RegExp) => secoes.find((x) => re.test(normalizar(x.titulo)))?.blocos ?? [];

		// referências de jutsus/habilidades do clã
		const slugsJ = secoes.flatMap((x) => x.blocos).filter((b) => b.tipo === 'jutsu').map((b) => (b as { slug: string }).slug);
		const slugsH = secoes.flatMap((x) => x.blocos).filter((b) => b.tipo === 'habilidade').map((b) => (b as { slug: string }).slug);
		for (const j of jutsus) if (slugsJ.includes(j.slug)) j.cla = s;
		for (const hb of habilidades) if (slugsH.includes(hb.slug)) hb.cla = s;

		const bonus = sec(/^bonus/)
			.flatMap((b) => (b.tipo === 'lista' ? b.itens.map((it) => textoDe(it.c)) : []))
			.map((t) => {
				const p = t.match(/^(.*?)\s*\((.+)\)\.?$/);
				return p ? { texto: p[1].replace(/\.$/, ''), nota: p[2] } : { texto: t.replace(/\.$/, ''), nota: null };
			});
		const textoKkg = sec(/^kekkei genkai/).find((b) => b.tipo === 'p');
		const semKkg = !textoKkg || /^nenhum/i.test(textoDe((textoKkg as { c: Trecho[] }).c));
		if (semKkg === !!KKG_CLA[s]) avisar(`Kekkei Genkai do clã ${nome} não confere com o mapa`);
		const tabMarcos = tabelaEm(sec(/^marcos/));
		const politica = sec(/^politica/);
		const textoPolitica = politica.filter((b) => b.tipo === 'p').map((b) => textoDe((b as { c: Trecho[] }).c));
		const st = textoPolitica.join(' ').match(/Status:\s*cl[ãa]\s+([^(.—]+?)\s*\((\d+)\s*PIC\)/i);
		const stLivre = textoPolitica.join(' ').match(/Status:\s*([^.]+)\./);
		const tituloKkg = secoes.find((x) => /^kekkei genkai —/.test(normalizar(x.titulo)))?.titulo ?? '';
		const nomeKkg = tituloKkg.replace(/^Kekkei Genkai\s*—\s*/, '').replace(/\s*\(.*\)\s*$/, '');
		const obrig = politica.find((b) => b.tipo === 'p' && /^Obriga/.test(textoDe(b.c))) as { c: Trecho[] } | undefined;
		const vila = VILAS.find(([re]) => re.test(frente.origem));
		const notaVila = frente.origem
			.replace(vila ? vila[0] : /$^/, '')
			.replace(/^\s*(originário de|originalmente)\s*/i, '')
			.replace(/^[,\s/]+|[,\s/]+$/g, '')
			.trim();
		clas.push({
			slug: s,
			numero: String(frente.numero),
			nome,
			epiteto: frente.epiteto,
			vila: vila ? { nome: vila[1], icone: vila[2] || null, nota: notaVila || null } : { nome: frente.origem, icone: null, nota: null },
			epigrafe: epi && epi.tipo === 'epigrafe' ? { texto: epi.texto, autor: epi.autor } : null,
			descricao: intro.filter((b) => b.tipo !== 'epigrafe'),
			secoes,
			bonus,
			kkg: KKG_CLA[s] ? { nome: nomeKkg || 'Kekkei Genkai', tipo: NOME_TIPO_KKG[KKG_CLA[s]], icone: `kkg/ic-kkg-${KKG_CLA[s]}` } : null,
			marcos: (tabMarcos?.linhas ?? []).map((l) => ({ nivel: +celTexto(l[0]), texto: celTexto(l[1] ?? []) })).filter((x) => x.nivel),
			status: st ? { rotulo: `Clã ${st[1].trim()}`, pic: +st[2] } : stLivre ? { rotulo: stLivre[1].trim().replace(/^./, (l) => l.toUpperCase()), pic: null } : null,
			relacoes: [],
			obrigacao: obrig ? semRotulo(obrig.c, /^\s*Obrigaç(ão|ões)\s*:\s*/) : null,
			jutsus: slugsJ,
			habilidades: slugsH
		});
	}
	// ---------------------------------------------------------------- bestiário: conteudo/bestiario/como-usar.md + conteudo/bestiario.yaml
	// Os números de cada estágio saem da regra: a tabela "Números por ameaça" do Como usar, ajustada pelo papel, ou a
	// ficha de invocação do cap. 14. O YAML traz o que é do verbete e, raramente, um número de exceção (pc, rd...).
	const bestiario: Bestiario = (() => {
		const { frente, blocos } = lerDoc<{ titulo: string; resumo: string }>(readFileSync(join(CONTEUDO, 'bestiario', 'como-usar.md'), 'utf8'));
		const secoes = blocos.filter((b): b is Bloco & { tipo: 'h' } => b.tipo === 'h').map(({ id, texto, nivel }) => ({ id, titulo: texto, nivel }));

		const tab = blocos.find((b): b is Bloco & { tipo: 'tabela' } => b.tipo === 'tabela' && b.titulo === 'Números por ameaça');
		if (!tab) throw new Error('Bestiário: tabela "Números por ameaça" não encontrada no Como usar');
		type Linha = { pv: number; pc: number; defesa: number; ataque: number; dano: string; dt: number; iniciativa: number };
		const num = (s: string) => +s.replace('+', '');
		const ordem: string[] = [];
		const linhas = new Map<string, Linha>();
		for (const l of tab.linhas.map((l) => l.map(celTexto))) {
			ordem.push(l[0]);
			linhas.set(l[0], { pv: num(l[1]), pc: num(l[2]), defesa: num(l[3]), ataque: num(l[4]), dano: l[5].replace(/\s+/g, ''), dt: num(l[6]), iniciativa: num(l[7]) });
		}
		/** Linha da tabela de uma ameaça; `abaixo` desce linhas (controlador e suporte usam o dano de duas ameaças abaixo). */
		const linha = (rotulo: string, abaixo = 0) => {
			const i = ordem.indexOf(rotulo);
			if (i < 0) throw new Error(`Bestiário: ameaça fora da tabela: ${rotulo}`);
			return linhas.get(ordem[Math.max(0, i - abaixo)])!;
		};

		// fichas de invocação do cap. 14; a ameaça de cada tamanho é a que o Como usar dá (Pequena 2, Média 5, Grande 10, Chefe 16)
		type Ficha = { titulo: string; ameaca: number; pv: number; defesa: number; iniciativa: number; acerto: number; dano: string; dt: number; jutsus: string; restricao: string | null };
		const ficha = (id: string, ameaca: number): Ficha => {
			const s = secao(cap(14).blocos, (_, i) => i === id);
			const t = tabelaEm(s.blocos);
			if (!s.titulo || !t) throw new Error(`Bestiário: ficha de invocação não encontrada no cap. 14: ${id}`);
			const v = Object.fromEntries(t.linhas.map((l) => [celTexto(l[0]), celTexto(l[1])]));
			const atq = (v['Ataque básico'] ?? '').match(/\+(\d+)\s*para acertar\s*·\s*(.+)$/);
			if (!atq) throw new Error(`Bestiário: ataque básico ilegível na ficha ${id}`);
			return {
				titulo: s.titulo.texto.replace(/\s*\(.*\)\s*$/, ''),
				ameaca,
				pv: +v.PV,
				defesa: +v.Defesa,
				iniciativa: +v.Iniciativa.replace(/^1d20\s*\+\s*/, ''),
				acerto: +atq[1],
				dano: atq[2].replace(/\s+/g, ''),
				dt: +(v.Jutsus.match(/DT (\d+)/)?.[1] ?? 0),
				jutsus: v.Jutsus,
				restricao: v['Restrição'] ?? null
			};
		};
		const FICHAS = {
			pequena: ficha('invocacao-pequena-especializacao-nivel-1', 2),
			media: ficha('invocacao-media-especializacao-nivel-2', 5),
			grande: ficha('invocacao-grande-especializacao-nivel-3', 10),
			chefe: ficha('chefe-da-especie-especializacao-nivel-3-aprovacao-do-chefe', 16)
		};

		type JutsuYaml = { slug?: string; nome?: string; nota?: string };
		type AtaqueYaml = { nome: string; alcance: string; acerto?: number; dano?: string; efeito?: string };
		type EstagioYaml = {
			nome: string;
			ameaca?: number | string;
			papel: PapelCriatura;
			ficha?: keyof typeof FICHAS;
			membros?: number;
			resumo?: string;
			pv?: number;
			pc?: number | null;
			defesa?: number;
			iniciativa?: number;
			dt?: number;
			rd?: number;
			nota?: string;
			ataques: AtaqueYaml[];
			jutsus?: JutsuYaml[];
			tracos?: { nome: string; efeito: string }[];
			/** Formato da arte própria do estágio (padrão: retrato para gente, quadro para o resto). */
			arte?: { formato: FormatoArte; plano: string };
			/** A arte deste estágio serve de capa da categoria quando ela não tem arte própria. */
			capa?: boolean;
		};
		/** Verbete com estágios (invocações, feras que crescem, transformações) ou com a ficha direto nele (os demais). */
		type CriaturaYaml = Partial<Omit<EstagioYaml, 'nome'>> & {
			slug: string;
			nome: string;
			tipo: TipoCriatura;
			origem: string;
			vila: string | null;
			arte: { formato: FormatoArte; plano: string };
			cena: string[];
			descricao: string[];
			estagios?: EstagioYaml[];
			taticas: string[];
			ganchos: string[];
			tags: string[];
		};
		const TAMANHO: Record<FormatoArte, [number, number]> = { faixa: [256, 96], retrato: [128, 192], quadro: [176, 176], pagina: [192, 256] };
		const NOME_VILA: Record<string, string> = { konoha: 'Konohagakure', suna: 'Sunagakure', kiri: 'Kirigakure', kumo: 'Kumogakure', iwa: 'Iwagakure', ame: 'Amegakure', taki: 'Takigakure', oto: 'Otogakure' };
		const FATOR_PV: Partial<Record<PapelCriatura, number>> = { lutador: 1.25, atirador: 0.75, assassino: 0.75, chefe: 2 };
		const BONUS_ATAQUE: Partial<Record<PapelCriatura, number>> = { atirador: 1, assassino: 2 };
		const rankDe = (a: number): RankNpc => (a >= 13 ? 'lendario' : a >= 9 ? 'anbu' : a >= 7 ? 'jounin' : a >= 4 ? 'chunin' : 'genin');
		const valor = (rotulo: string) => {
			const m = rotulo.match(/^(\d+)\/(\d+)$/);
			return m ? +m[1] / +m[2] : +rotulo;
		};

		/** Arte em static/; arquivo null se ainda não foi feita. */
		const arteDe = (arquivo: string, formato: FormatoArte, plano: string) => {
			const [largura, altura] = TAMANHO[formato];
			return { arquivo: existsSync(join(raiz, 'static', arquivo)) ? `/${arquivo}` : null, formato, plano, largura, altura };
		};
		const GENTE: TipoCriatura[] = ['shinobi', 'fora da lei', 'guerreiro', 'organização'];
		/** `varios`: o verbete tem mais de um estágio, e cada um vira uma ficha separada, com arte própria. */
		const estagioDe = (y: CriaturaYaml, e: EstagioYaml, varios: boolean): EstagioCriatura => {
			const f = e.ficha ? FICHAS[e.ficha] : null;
			if (e.ficha && !f) avisar(`Bestiário: ficha de invocação desconhecida em ${y.slug}: ${e.ficha}`);
			const rotulo = f ? String(f.ameaca) : String(e.ameaca);
			let base: { pv: number; pc: number | null; defesa: number; iniciativa: number; dt: number; acerto: number; dano: string; nota: string | null };
			if (f) base = { pv: f.pv, pc: null, defesa: f.defesa, iniciativa: f.iniciativa, dt: f.dt, acerto: f.acerto, dano: f.dano, nota: [`Usa a ficha ${/^Chefe/.test(f.titulo) ? 'do' : 'da'} ${f.titulo} (cap. 14).`, f.restricao && `${f.restricao.replace(/\.$/, '')}.`].filter(Boolean).join(' ') };
			else {
				const l = linha(rotulo);
				const fraco = e.papel === 'controlador' || e.papel === 'suporte';
				base = {
					pv: Math.round(l.pv * (FATOR_PV[e.papel] ?? 1)),
					pc: y.tipo === 'fauna' ? null : l.pc,
					defesa: l.defesa,
					iniciativa: l.iniciativa,
					dt: l.dt + (e.papel === 'controlador' ? 1 : 0),
					acerto: l.ataque + (BONUS_ATAQUE[e.papel] ?? 0),
					dano: fraco ? linha(rotulo, 2).dano : l.dano,
					nota: null
				};
			}
			const js = (e.jutsus ?? []).map((j) => {
				const card = j.slug ? jutsus.find((x) => x.slug === j.slug) : undefined;
				if (j.slug && !card) avisar(`Bestiário: jutsu desconhecido em ${y.slug}: ${j.slug}`);
				return { slug: card?.slug ?? null, nome: card?.nome ?? j.nome ?? j.slug ?? '', traducao: card?.traducao || null, rank: card?.rank ?? null, custo: card?.custo ?? null, nota: j.nota ?? null };
			});
			if (f) js.push({ slug: null, nome: 'Usos de jutsu', traducao: null, rank: null, custo: null, nota: f.jutsus });
			const ameaca = valor(rotulo);
			const ataques = e.ataques.map((a) => ({ nome: a.nome, alcance: a.alcance, acerto: a.acerto ?? base.acerto, dano: (a.dano ?? base.dano).replace(/\s+/g, ''), efeito: a.efeito ? trechosDeMd(a.efeito) : null }));
			const defesa = e.defesa ?? base.defesa;
			const iniciativa = e.iniciativa ?? base.iniciativa;
			// atributos, perícias, especializações e proficiências, coerentes com o acerto, a Defesa e a Iniciativa
			const ficha = fichaCompleta({
				ameaca,
				papel: e.papel,
				tipo: y.tipo,
				cla: y.slug.startsWith('cla-') ? y.slug.slice(4) : y.slug === 'sennin' ? 'sennin' : null,
				acerto: ataques[0]?.acerto ?? base.acerto,
				defesa,
				iniciativa,
				ataque: ataques[0] ? { nome: ataques[0].nome, alcance: ataques[0].alcance } : null,
				jutsus: (e.jutsus ?? []).map((j) => {
					const card = j.slug ? jutsus.find((x) => x.slug === j.slug) : undefined;
					return { slug: card?.slug ?? null, nome: card?.nome ?? j.nome ?? '', tipo: card?.tipo ?? null, elemento: card?.elemento ?? null };
				})
			});
			const slugE = slug(e.nome);
			const formatoE = e.arte?.formato ?? (GENTE.includes(y.tipo) ? 'retrato' : 'quadro');
			return {
				slug: slugE,
				nome: e.nome,
				arte: varios ? arteDe(`bestiario/${y.slug}--${slugE}.png`, formatoE, e.arte?.plano ?? '') : null,
				ameaca,
				ameacaRotulo: rotulo,
				papel: e.papel,
				rank: rankDe(ameaca),
				membros: e.membros ?? 1,
				resumo: e.resumo ? trechosDeMd(e.resumo) : null,
				combate: {
					pv: e.pv ?? base.pv,
					pc: e.pc !== undefined ? e.pc : base.pc,
					defesa,
					iniciativa,
					dt: e.dt ?? base.dt,
					rd: e.rd ?? null,
					nota: [base.nota, e.nota].filter(Boolean).join(' ') || null,
					ataques,
					jutsus: js,
					tracos: (e.tracos ?? []).map((t) => ({ nome: t.nome, efeito: trechosDeMd(t.efeito) })),
					ficha
				}
			};
		};

		// um arquivo por categoria (invocacoes.yaml, shinobi.yaml...); a ordem do livro é a alfabética, não a dos arquivos
		const criaturas = readdirSync(join(CONTEUDO, 'bestiario'))
			.filter((a) => a.endsWith('.yaml'))
			.sort()
			.flatMap((a) => lerYaml(readFileSync(join(CONTEUDO, 'bestiario', a), 'utf8')) as CriaturaYaml[])
			.map((y): Criatura => {
				if (y.vila && !NOME_VILA[y.vila]) avisar(`Bestiário: vila desconhecida em ${y.slug}: ${y.vila}`);
				const { slug: _s, tipo: _t, origem: _o, vila: _v, arte: _a, cena: _c, descricao: _d, estagios: lista, taticas: _ta, ganchos: _g, tags: _tg, ...ficha } = y;
				const doYaml = lista ?? [{ ...ficha, papel: ficha.papel!, ataques: ficha.ataques ?? [] } as EstagioYaml];
				const estagios = doYaml.map((e) => estagioDe(y, e, doYaml.length > 1));
				const min = Math.min(...estagios.map((e) => e.ameaca));
				const max = Math.max(...estagios.map((e) => e.ameaca));
				const rotulo = (n: number) => estagios.find((e) => e.ameaca === n)!.ameacaRotulo;
				// a categoria sem arte própria usa a de um estágio: o marcado como capa ou o primeiro que já tem arte
				let arte = arteDe(`bestiario/${y.slug}.png`, y.arte.formato, y.arte.plano);
				if (!arte.arquivo) {
					const i = doYaml.findIndex((e) => e.capa);
					const capa = [estagios[i], ...estagios].find((e) => e?.arte?.arquivo)?.arte;
					if (capa) arte = { ...capa };
				}
				const vistos = new Set<string>();
				for (const e of estagios) {
					if (vistos.has(e.slug)) avisar(`Bestiário: estágio repetido em ${y.slug}: ${e.nome}`);
					vistos.add(e.slug);
				}
				return {
					slug: y.slug,
					nome: y.nome,
					letra: semAcentos(y.nome[0]).toUpperCase(),
					tipo: y.tipo,
					origem: y.origem,
					vila: y.vila && NOME_VILA[y.vila] ? { nome: NOME_VILA[y.vila], icone: `vila/ic-vila-${y.vila}` } : null,
					arte,
					cena: y.cena.map(trechosDeMd),
					descricao: y.descricao.map(trechosDeMd),
					estagios,
					ameacaFaixa: min === max ? rotulo(min) : `${rotulo(min)} a ${rotulo(max)}`,
					ameacaMin: min,
					ameacaMax: max,
					taticas: y.taticas.map(trechosDeMd),
					ganchos: y.ganchos.map(trechosDeMd),
					tags: y.tags
				};
			})
			// o livro de monstros é em ordem alfabética
			.sort((a, b) => a.nome.localeCompare(b.nome, 'pt'));
		const slugs = new Set<string>();
		for (const c of criaturas) {
			if (slugs.has(c.slug) || c.slug === 'como-usar' || c.slug === 'por-ameaca') avisar(`Bestiário: slug repetido ou reservado: ${c.slug}`);
			slugs.add(c.slug);
		}
		return { comoUsar: { titulo: frente.titulo, resumo: frente.resumo, blocos, secoes }, criaturas };
	})();

	// relações entre clãs, extraídas das frases de "Política e Obrigação"
	for (const cl of clas) {
		const textos = (cl.secoes.find((x) => /^politica/.test(normalizar(x.titulo)))?.blocos ?? [])
			.filter((b) => b.tipo === 'p')
			.map((b) => textoDe((b as { c: Trecho[] }).c))
			.filter((t) => !/^Obriga/.test(t));
		const frases = textos.join(' ').split(/(?<=[.;])\s+/);
		const vistas = new Set<string>();
		for (const f of frases) {
			const n = normalizar(f);
			const relacao: Relacao | null = /inimig/.test(n) ? 'Inimigo Declarado' : /rival/.test(n) ? 'Rival' : /aliad|alianca/.test(n) ? 'Aliado' : /neutr/.test(n) ? 'Neutro' : null;
			if (!relacao) continue;
			for (const outro of clas) {
				if (outro.slug === cl.slug || vistas.has(outro.slug)) continue;
				if (new RegExp(`\\b${outro.slug}\\b`).test(n)) {
					cl.relacoes.push({ cla: outro.slug, nome: outro.nome, relacao });
					vistas.add(outro.slug);
				}
			}
		}
	}

	// ---------------------------------------------------------------- especializações (cap. 19)
	const especializacoes: Especializacoes = { intro: [], quando: null, lista: [], extras: [] };
	{
		const c19 = cap(19);
		const iCatalogo = c19.blocos.findIndex((b) => b.tipo === 'h' && b.nivel === 2);
		for (const b of c19.blocos.slice(0, iCatalogo < 0 ? undefined : iCatalogo)) {
			if (b.tipo === 'destaque' && /quando se ganha/i.test(b.titulo)) {
				const texto = b.blocos.map((x) => (x.tipo === 'p' ? textoDe(x.c) : '')).join(' ');
				const niveis = [...new Set([...texto.matchAll(/\b(4|7|10|13|16|19)\b/g)].map((x) => +x[1]))];
				especializacoes.quando = { titulo: b.titulo, blocos: b.blocos, niveis };
			} else especializacoes.intro.push(b);
		}
		let atual: Especializacao | null = null;
		for (const b of c19.blocos.slice(iCatalogo + 1)) {
			if (b.tipo === 'h' && b.nivel === 3 && /^Especialização:/.test(b.texto)) {
				let nome = b.texto.replace(/^Especialização:\s*/, '').trim();
				// "Sennin (pré-requisitos no cap. 15)": o requisito sai do nome
				const req = nome.match(/\s*\((pr[ée]-?requisitos?[^)]*)\)\s*$/i);
				if (req) nome = nome.slice(0, req.index).trim();
				const icone = ICONE_ESPECIALIZACAO.find(([re]) => re.test(nome))?.[1];
				if (!icone) avisar(`Especialização sem ícone: ${nome}`);
				atual = { slug: b.id, nome, icone: `esp/ic-esp-${icone ?? 'elemento'}`, niveis: [], extras: [], requisito: req ? req[1].replace(/^./, (l) => l.toUpperCase()) : null };
				especializacoes.lista.push(atual);
			} else if (b.tipo === 'h' && b.nivel <= 3) {
				atual = null;
				especializacoes.extras.push(b);
			} else if (atual && !atual.niveis.length && b.tipo === 'tabela' && b.cab?.[0] === 'Nível') {
				atual.niveis = b.linhas.map((l) => ({ nivel: +celTexto(l[0]), beneficio: l[1] ?? [] }));
			} else if (atual) {
				atual.extras.push(b);
				const tx = b.tipo === 'p' ? textoDe(b.c) : b.tipo === 'destaque' ? b.titulo + ' ' + b.blocos.map((x) => (x.tipo === 'p' ? textoDe(x.c) : '')).join(' ') : '';
				const req = tx.match(/Pr[ée]-?requisitos?\s*:?\s*([^.]+)/i);
				if (req && !atual.requisito) atual.requisito = req[1].trim();
			} else especializacoes.extras.push(b);
		}
	}

	// ---------------------------------------------------------------- glossário (cap. 22)
	const glossario: SecaoGlossario[] = [];
	{
		const c22 = cap(22);
		let atual: SecaoGlossario | null = null;
		for (const b of c22.blocos) {
			if (b.tipo === 'h' && b.nivel === 2) {
				atual = { id: b.id, titulo: b.texto, intro: [], colunas: [], termos: [] };
				glossario.push(atual);
			} else if (atual && b.tipo === 'tabela' && b.cab) {
				atual.colunas = b.cab;
				for (const l of b.linhas) {
					const termo = celTexto(l[0]);
					const n = normalizar(termo);
					let icone: string | null = null;
					if (/^atributos/.test(normalizar(atual.titulo))) icone = iconeSe(`atributo/ic-atributo-${n}`);
					else if (/^recursos/.test(normalizar(atual.titulo))) icone = iconeSe(`recurso/ic-recurso-${n}`);
					else if (/^elementos/.test(normalizar(atual.titulo))) icone = ELEMENTOS[n] ? `elemento/ic-elemento-${ELEMENTOS[n]}` : null;
					else if (/^ranks de jutsu/.test(normalizar(atual.titulo))) icone = iconeSe(`rank/ic-rank-${n}`);
					atual.termos.push({ id: `termo-${slug(termo)}`, termo, campos: l.slice(1).map(celTexto), icone });
				}
			} else if (atual) atual.intro.push(b);
		}
	}
	// ---------------------------------------------------------------- equipamentos (caps. 11, 12, 13)
	const equipamentos: Equipamentos = { categorias: [], espadas: [], propriedades: [], abas: [] };
	{
		const c11 = cap(11);
		const c12 = cap(12);
		const c13 = cap(13);
		const ICONE_CATEGORIA: [RegExp, string, string][] = [
			[/dist[âa]ncia/i, 'distancia', 'equip/ic-equip-arma-distancia'],
			[/curtas/i, 'curtas', 'equip/ic-equip-arma-curta'],
			[/longas/i, 'longas', 'equip/ic-equip-arma-longa'],
			[/ex[óo]ticas/i, 'exoticas', 'equip/ic-equip-arma-exotica']
		];
		for (const b of c12.blocos) {
			if (b.tipo !== 'h' || b.nivel !== 3) continue;
			const cat = ICONE_CATEGORIA.find(([re]) => re.test(b.texto));
			const tab = tabelaEm(secao(c12.blocos, (_, id) => id === b.id).blocos);
			if (cat && tab) {
				const col = (nome: string) => tab.cab?.findIndex((c) => normalizar(c).startsWith(nome)) ?? -1;
				const [iA, iD, iR, iP, iV, iPr] = ['arma', 'dano', 'alcance', 'peso', 'preco', 'propriedade'].map(col);
				const categoria: CategoriaArmas = {
					id: cat[1],
					titulo: b.texto.replace(/^Armas Brancas\s*(?:[—:·-]\s*)?/, '').replace(/^Armas de /, ''),
					icone: cat[2],
					ancora: `${c12.href}#${b.id}`,
					armas: tab.linhas.map((l) => {
						const nome = celTexto(l[iA]);
						const iconeArma = iconeSe(`arma/ic-arma-${slug(nome)}`) ?? iconeSe(`arma/ic-arma-${slug(nome.split(/[\s(/]/)[0])}`);
						return {
							slug: `arma-${slug(nome)}`,
							nome,
							dano: iD >= 0 ? celTexto(l[iD]) : '',
							alcance: iR >= 0 ? celTexto(l[iR]) : '',
							peso: iP >= 0 ? celTexto(l[iP]) : '',
							preco: iV >= 0 ? celTexto(l[iV]) : '',
							propriedades: iPr >= 0 ? celTexto(l[iPr]).split(/\s*[,;]\s*/).filter((x) => x && x !== '—' && x !== '-') : [],
							icone: iconeArma ?? cat[2]
						};
					})
				};
				equipamentos.categorias.push(categoria);
			} else if (/sete espadas/i.test(b.texto) && tab) {
				equipamentos.espadas = tab.linhas.map((l) => {
					const nome = celTexto(l[0]);
					return {
						slug: `espada-${slug(nome)}`,
						nome,
						traducao: celTexto(l[1] ?? []),
						dano: celTexto(l[2] ?? []),
						peso: celTexto(l[3] ?? []),
						habilidade: celTexto(l[4] ?? []),
						icone: iconeSe(`espada/ic-espada-${slug(nome)}`) ?? 'equip/ic-equip-sete-espadas'
					} satisfies Espada;
				});
			}
		}
		const props = tabelaEm(secao(c12.blocos, (_, id) => id === 'propriedades-especiais').blocos);
		equipamentos.propriedades = (props?.linhas ?? []).map((l) => ({ nome: celTexto(l[0]), efeito: celTexto(l[1] ?? []) }));

		const trecho = (c: Capitulo, ancora: string, titulo?: string) => {
			const s = secao(c.blocos, (_, id) => id === ancora, 2);
			if (!s.titulo) avisar(`Seção não encontrada no cap. ${c.numero}: #${ancora}`);
			return { titulo: titulo ?? s.titulo?.texto ?? '', href: `${c.href}#${ancora}`, blocos: s.blocos };
		};
		equipamentos.abas = [
			{ id: 'itens', titulo: 'Itens utilitários', secoes: [trecho(c11, 'itens-utilitarios', 'Itens utilitários'), trecho(c11, 'sistema-de-carga-inventario')] },
			{ id: 'venenos', titulo: 'Venenos', secoes: [trecho(c11, 'tabela-de-venenos')] },
			{ id: 'pergaminhos', titulo: 'Pergaminhos', secoes: [trecho(c11, 'sistema-de-pergaminhos-fuuinjutsu-basico')] },
			{ id: 'marionetes', titulo: 'Marionetes', secoes: [trecho(c13, 'construindo-uma-marionete-passo-a-passo')] },
			{ id: 'qualidade', titulo: 'Qualidade e propriedades', secoes: [trecho(c12, 'qualidade-das-armas'), trecho(c12, 'propriedades-especiais')] }
		];
	}

	// ---------------------------------------------------------------- léxico: conteudo/termos.yaml + o que vem do livro
	type Entrada = TermoLexico & { padroes: string[]; sigla: boolean; linha?: { capitulo: number; ancora: string } };
	const lexico: Entrada[] = [];
	{
		const ids = new Set<string>();
		const add = (e: Omit<Entrada, 'sigla'>) => {
			if (ids.has(e.id)) return avisar(`Termo repetido no léxico: ${e.id}`);
			ids.add(e.id);
			lexico.push({ ...e, sigla: e.tipo === 'recurso' || e.tipo === 'atributo' });
		};
		const resumir = (t: string, n = 220) => (t.length > n ? t.slice(0, t.lastIndexOf(' ', n - 3)) + '…' : t);
		/** Nomes que são também palavras comuns do português (ou curtos demais) não viram termo automático. */
		const NAO_TERMO = new Set(['tanto', 'sai', 'bo', 'kiba', 'kai', 'henge']);
		const podeSer = (nome: string) => nome.length >= 4 && !NAO_TERMO.has(normalizar(nome));

		for (const e of lerYaml(readFileSync(join(CONTEUDO, 'termos.yaml'), 'utf8')) as { id: string; rotulo: string; nome: string; padroes: string[]; resumo: string; href: string; icone?: string }[])
			add({ id: e.id, tipo: e.id.split(':')[0] as TipoTermo, rotulo: e.rotulo, nome: e.nome, padroes: e.padroes.map(String), resumo: e.resumo, href: e.href, icone: e.icone ?? null });

		// condições: a tabela "Estados Especiais" do cap. 4; cada linha ganha a âncora #cond-<slug>
		const c4 = cap(4);
		const estados = tabelaEm(secao(c4.blocos, (_, id) => id === 'estados-especiais').blocos);
		if (!estados) avisar('Tabela de Estados Especiais não encontrada no cap. 4');
		for (const l of estados?.linhas ?? []) {
			const nome = celTexto(l[0]).replace(/\s*\(.*\)\s*$/, '');
			const s = slug(nome);
			const padrao = /^Em /.test(nome) ? `[Ee]m [${nome[3].toUpperCase()}${nome[3].toLowerCase()}]${escapar(nome.slice(4))}` : /o$/.test(nome) ? `${escapar(nome.slice(0, -1))}[oa]s?` : escapar(nome);
			add({ id: `condicao:${s}`, tipo: 'condicao', rotulo: nome, nome, padroes: [padrao], resumo: resumir(celTexto(l[1] ?? [])), href: `${c4.href}#cond-${s}`, icone: iconeSe(`estado/ic-estado-${s}`), linha: { capitulo: 4, ancora: `cond-${s}` } });
		}

		// perícias: a tabela do cap. 3; cada linha ganha a âncora #pericia-<slug>
		const c3 = cap(3);
		const pericias = c3.blocos.find((b): b is Bloco & { tipo: 'tabela' } => b.tipo === 'tabela' && b.cab?.[0] === 'Perícia');
		if (!pericias) avisar('Tabela de Perícias não encontrada no cap. 3');
		for (const l of pericias?.linhas ?? []) {
			const nome = celTexto(l[0]).replace(/\s*\(.*\)\s*$/, '');
			const s = slug(nome);
			add({ id: `pericia:${s}`, tipo: 'pericia', rotulo: nome, nome, padroes: [escapar(nome)], resumo: resumir(`${celTexto(l[1] ?? [])} · ${celTexto(l[2] ?? [])}`), href: `${c3.href}#pericia-${s}`, icone: iconeSe(`pericia/ic-pericia-${s}`), linha: { capitulo: 3, ancora: `pericia-${s}` }, extra: { atributo: celTexto(l[1] ?? []) } });
		}

		// elementos (glossário) com a seção do elemento no cap. 10
		const c10 = cap(10);
		for (const t of glossario.find((g) => /^elementos/.test(normalizar(g.titulo)))?.termos ?? []) {
			const n = normalizar(t.termo);
			const s = ELEMENTOS[n];
			if (!s) continue;
			const h = c10.blocos.find((b) => b.tipo === 'h' && normalizar(b.texto).startsWith(n)) as { id: string } | undefined;
			const variantes = [...new Set([t.termo, semAcentos(t.termo), ...(s === 'fuuton' ? ['Futon'] : [])])];
			add({ id: `elemento:${s}`, tipo: 'elemento', rotulo: t.termo, nome: t.termo, padroes: variantes.map(escapar), resumo: t.campos.join(' · '), href: h ? `${c10.href}#${h.id}` : `${c10.href}#os-cinco-elementos-basicos`, icone: `elemento/ic-elemento-${s}` });
		}

		// ranks de jutsu (glossário)
		const ranks = glossario.find((g) => /^ranks de jutsu/.test(normalizar(g.titulo)));
		for (const t of ranks?.termos ?? [])
			add({ id: `rank:${t.termo.toLowerCase()}`, tipo: 'rank', rotulo: `Rank ${t.termo}`, nome: `Rank ${t.termo}`, padroes: [`Rank ${escapar(t.termo)}`], resumo: `Quem usa: ${t.campos[0] ?? '—'} · custo aproximado: ${t.campos[1] ?? '—'}`, href: `/regras/glossario#${ranks!.id}`, icone: iconeSe(`rank/ic-rank-${t.termo.toLowerCase()}`) });

		// clãs
		for (const cl of clas) {
			const p = cl.descricao.find((b) => b.tipo === 'p') as { c: Trecho[] } | undefined;
			add({ id: `cla:${cl.slug}`, tipo: 'cla', rotulo: `Clã ${cl.nome}`, nome: `Clã ${cl.nome}`, padroes: [`Clã ${escapar(cl.nome)}`, escapar(cl.nome)], resumo: resumir(`${cl.epiteto} · ${cl.vila.nome}. ${p ? textoDe(p.c) : ''}`), href: `/regras/clas/${cl.slug}`, icone: `cla/ic-cla-${cl.slug}` });
		}

		// jutsus e habilidades: o nome completo e, sem o "no Jutsu", a forma curta ("Kage Mane", "Kawarimi")
		const usados = new Set<string>();
		const nomes = (nome: string) =>
			[nome, nome.replace(/\s+no Jutsu$/, '')].filter((n, i, a) => a.indexOf(n) === i && podeSer(n) && !usados.has(n) && !!usados.add(n)).map(escapar);
		for (const j of jutsus)
			add({
				id: `jutsu:${j.slug}`,
				tipo: 'jutsu',
				rotulo: j.nome,
				nome: j.traducao || j.nome,
				padroes: nomes(j.nome),
				resumo: resumir(j.efeito ? textoDe(j.efeito) : textoDe(j.descricao[0] ?? [])),
				href: `/regras/jutsus/${j.slug}`,
				icone: `rank/ic-rank-${j.rank.toLowerCase()}`,
				extra: { rank: j.rank, tipo: j.tipo, custo: j.custo, acao: j.info.find((i) => i.k === 'Ação')?.v ?? '' }
			});
		for (const h of habilidades) {
			const cl = clas.find((c) => c.slug === h.cla);
			add({ id: `habilidade:${h.slug}`, tipo: 'habilidade', rotulo: h.nome, nome: h.traducao || h.nome, padroes: nomes(h.nome), resumo: resumir(h.efeito ? textoDe(h.efeito) : textoDe(h.descricao[0] ?? [])), href: cl ? `/regras/clas/${cl.slug}#${slug('Jutsus e Habilidades do Clã')}` : `${hrefCapitulo(h.capitulo)}#${h.ancora}`, icone: h.cla ? `cla/ic-cla-${h.cla}` : null });
		}

		// armas e as Sete Espadas
		for (const c of equipamentos.categorias)
			for (const a of c.armas) {
				const nome = a.nome.split(/\s*[(/]/)[0].trim();
				add({ id: `arma:${a.slug.replace(/^arma-/, '')}`, tipo: 'arma', rotulo: a.nome, nome: c.titulo, padroes: podeSer(nome) ? [escapar(nome)] : [], resumo: resumir([`Dano ${a.dano}`, a.alcance && `alcance ${a.alcance}`, a.propriedades.join(', ')].filter(Boolean).join(' · ')), href: `/regras/equipamentos?aba=armas&categoria=${c.id}#${a.slug}`, icone: a.icone, extra: { dano: a.dano, alcance: a.alcance, peso: a.peso, preco: a.preco } });
			}
		for (const e of equipamentos.espadas)
			add({ id: `arma:${e.slug}`, tipo: 'arma', rotulo: e.nome, nome: e.traducao, padroes: podeSer(e.nome) ? [escapar(e.nome)] : [], resumo: resumir(`Dano ${e.dano}. ${e.habilidade}`), href: `/regras/equipamentos?aba=armas&categoria=espadas#${e.slug}`, icone: e.icone, extra: { dano: e.dano, peso: e.peso } });
	}
	const padroes = lexico.flatMap((e) => e.padroes.map((p) => ({ e, re: new RegExp(`(?<![\\p{L}\\p{N}_])(?:${p})(?![\\p{L}\\p{N}_])`, 'gu') })));
	const comLinha = lexico.filter((e) => e.linha);

	// ---------------------------------------------------------------- ligações no texto: "cap. N", termos e dados
	/**
	 * vistos: termos já marcados na seção (os que não são siglas só ganham destaque na 1ª vez); proprio: não marca o próprio
	 * verbete; dadoSolto: "d20" sem quantidade também vira chip (tabelas e quadros Na mesa; na prosa é só o nome do dado).
	 */
	type Contexto = { vistos: Set<string>; proprio?: string | null; dadoSolto?: boolean };
	const reRef = /\b(?:cap(?:ítulo|\.)\s*|Capítulo\s+)(\d{1,2})((?:\.\d+)*)/g;
	const reDado = /(?<![\p{L}\p{N}_])(\d{0,3})d(4|6|8|10|12|20|100)(?:\s*([+\-−])\s*(\d{1,3})(?![\p{L}\p{N}_]))?(?![\p{L}\p{N}_])/gu;
	function ligar(c: Trecho[], ctx: Contexto | null): Trecho[] {
		const out: Trecho[] = [];
		for (const t of c) {
			if (t.href || t.termo || t.dado) {
				out.push(t);
				continue;
			}
			const marcas: { ini: number; fim: number; extra: Partial<Trecho> }[] = [];
			const livre = (a: number, b: number) => !marcas.some((x) => a < x.fim && b > x.ini);
			for (const m of t.t.matchAll(reRef)) {
				const n = +m[1];
				const c = capitulos.find((x) => x.numero === n);
				if (!c) continue;
				let ancora = '';
				if (m[2]) {
					const h = c.blocos.find((b) => b.tipo === 'h' && b.texto.startsWith(`${n}${m[2]} `)) as { id: string } | undefined;
					const cl = clas.find((x) => x.numero === `${n}${m[2]}`);
					if (cl) {
						marcas.push({ ini: m.index!, fim: m.index! + m[0].length, extra: { href: `/regras/clas/${cl.slug}` } });
						continue;
					}
					if (h) ancora = `#${h.id}`;
				}
				marcas.push({ ini: m.index!, fim: m.index! + m[0].length, extra: { href: c.href + ancora } });
			}
			if (ctx) {
				for (const m of t.t.matchAll(reDado)) {
					const [, n, lados, sinal, mod] = m;
					if (!n && !mod && !ctx.dadoSolto) continue;
					if (livre(m.index, m.index + m[0].length)) marcas.push({ ini: m.index, fim: m.index + m[0].length, extra: { dado: `${n || 1}d${lados}${mod ? (sinal === '+' ? '+' : '-') + mod : ''}` } });
				}
				// termos: entre os que se sobrepõem fica o mais longo; depois, na ordem do texto, a regra da 1ª ocorrência
				const achados: { ini: number; fim: number; e: Entrada }[] = [];
				for (const { e, re } of padroes) if (e.id !== ctx.proprio) for (const m of t.t.matchAll(re)) achados.push({ ini: m.index, fim: m.index + m[0].length, e });
				achados.sort((a, b) => b.fim - b.ini - (a.fim - a.ini) || a.ini - b.ini);
				const escolhidos: typeof achados = [];
				for (const a of achados) if (livre(a.ini, a.fim) && !escolhidos.some((x) => a.ini < x.fim && a.fim > x.ini)) escolhidos.push(a);
				for (const a of escolhidos.sort((x, y) => x.ini - y.ini)) {
					if (!a.e.sigla) {
						if (ctx.vistos.has(a.e.id)) continue;
						ctx.vistos.add(a.e.id);
					}
					marcas.push({ ini: a.ini, fim: a.fim, extra: { termo: a.e.id, href: a.e.href } });
				}
			}
			marcas.sort((a, b) => a.ini - b.ini);
			let pos = 0;
			for (const mk of marcas) {
				if (mk.ini < pos) continue;
				if (mk.ini > pos) out.push({ ...t, t: t.t.slice(pos, mk.ini) });
				out.push({ ...t, t: t.t.slice(mk.ini, mk.fim), ...mk.extra });
				pos = mk.fim;
			}
			if (pos < t.t.length) out.push({ ...t, t: t.t.slice(pos) });
		}
		return out;
	}
	/** 1ª coluna da tabela que define um termo (condições, perícias): o termo vira definição e a linha ganha a âncora. */
	function definir(p: Trecho[], numero: number, usadas: Set<string>): { trechos: Trecho[]; ancora: string | null } {
		const t = p[0];
		if (!t || t.termo || t.href) return { trechos: p, ancora: null };
		for (const e of comLinha) {
			if (e.linha!.capitulo !== numero || usadas.has(e.linha!.ancora)) continue;
			for (const pd of e.padroes) {
				const m = new RegExp(`^(?:${pd})(?![\\p{L}\\p{N}_])`, 'u').exec(t.t);
				if (!m) continue;
				usadas.add(e.linha!.ancora);
				const resto = t.t.slice(m[0].length);
				return { trechos: [{ ...t, t: m[0], termo: e.id, def: 1 }, ...(resto ? [{ ...t, t: resto }] : []), ...p.slice(1)], ancora: e.linha!.ancora };
			}
		}
		return { trechos: p, ancora: null };
	}
	function ligarTabela(b: Bloco & { tipo: 'tabela' }, numero: number | null, proprio: string | null, usadas: Set<string>) {
		const ctx: Contexto = { vistos: new Set(), proprio, dadoSolto: true };
		const ids: (string | null)[] = [];
		b.linhas = b.linhas.map((l, r) =>
			l.map((cel, ci) =>
				cel.map((p, pi) => {
					let trechos = p;
					if (ci === 0 && pi === 0 && numero !== null) {
						const d = definir(p, numero, usadas);
						trechos = d.trechos;
						if (d.ancora) ids[r] = d.ancora;
					}
					return ligar(trechos, ctx);
				})
			)
		);
		if (ids.some(Boolean)) b.ids = b.linhas.map((_, r) => ids[r] ?? null);
	}
	function ligarBlocos(bs: Bloco[], estado: { vistos: Set<string> }, numero: number | null = null, proprio: string | null = null, usadas = new Set<string>()) {
		for (const b of bs) {
			if (b.tipo === 'h' && b.nivel <= 3) estado.vistos = new Set();
			if (b.tipo === 'p') b.c = ligar(b.c, { vistos: estado.vistos, proprio });
			else if (b.tipo === 'lista') {
				const andar = (its: ItemLista[]) => its.forEach((it) => ((it.c = ligar(it.c, { vistos: estado.vistos, proprio })), it.sub && andar(it.sub)));
				andar(b.itens);
			} else if (b.tipo === 'destaque') ligarBlocos(b.blocos, estado, numero, proprio, usadas);
			else if (b.tipo === 'tabela') ligarTabela(b, numero, proprio, usadas);
			else if (b.tipo === 'mesa') {
				const ctx: Contexto = { vistos: estado.vistos, proprio, dadoSolto: true };
				b.linhas = b.linhas.map((l) => ({ rotulo: ligar(l.rotulo, ctx), valor: ligar(l.valor, ctx) }));
				b.notas = b.notas.map((p) => ligar(p, ctx));
			}
			// a cena fica sem marcação: é narrativa
		}
	}
	for (const c of capitulos) if (c.numero !== 22) ligarBlocos(c.blocos, { vistos: new Set() }, c.numero);
	for (const cl of clas) {
		ligarBlocos(cl.descricao, { vistos: new Set() }, null, `cla:${cl.slug}`);
		for (const s of cl.secoes) ligarBlocos(s.blocos, { vistos: new Set() }, null, `cla:${cl.slug}`);
	}
	for (const j of jutsus) {
		const ctx: Contexto = { vistos: new Set(), proprio: `jutsu:${j.slug}` };
		j.efeito = j.efeito && ligar(j.efeito, ctx);
		j.notas = j.notas.map((n) => ligar(n, ctx));
	}
	for (const h of habilidades) {
		const ctx: Contexto = { vistos: new Set(), proprio: `habilidade:${h.slug}` };
		h.efeito = h.efeito && ligar(h.efeito, ctx);
		h.notas = h.notas.map((n) => ligar(n, ctx));
	}
	// :sem[…] só servia para impedir a marcação; :t[…]{#id} ganha o link do verbete
	const porId = new Map(lexico.map((e) => [e.id, e]));
	const acabar = (v: unknown): void => {
		if (Array.isArray(v)) v.forEach(acabar);
		else if (v && typeof v === 'object') {
			const o = v as Trecho;
			if (typeof o.t !== 'string') Object.values(v).forEach(acabar);
			else if (o.termo === '-') delete o.termo;
			else if (o.termo && !o.def && !o.href) {
				const e = porId.get(o.termo);
				if (e) o.href = e.href;
				else avisar(`Termo manual desconhecido: :t[${o.t}]{#${o.termo}}`);
			}
		}
	};
	// bestiário: o "Como usar" é texto de regra como um capítulo; nos verbetes, só os efeitos e as táticas
	ligarBlocos(bestiario.comoUsar.blocos, { vistos: new Set() });
	for (const cr of bestiario.criaturas) {
		for (const e of cr.estagios) {
			const ctx: Contexto = { vistos: new Set(), proprio: null, dadoSolto: true };
			e.resumo = e.resumo && ligar(e.resumo, { vistos: new Set(), proprio: null });
			for (const a of e.combate.ataques) a.efeito = a.efeito && ligar(a.efeito, ctx);
			for (const t of e.combate.tracos) t.efeito = ligar(t.efeito, ctx);
		}
		cr.taticas = cr.taticas.map((p) => ligar(p, { vistos: new Set(), proprio: null }));
	}
	acabar([capitulos, clas, jutsus, habilidades, bestiario]);

	// título das tabelas: o título da seção em que ela é a primeira tabela ("TABELA · Estados Especiais")
	for (const c of capitulos) {
		let titulo: string | null = null;
		for (const b of c.blocos) {
			if (b.tipo === 'h') titulo = b.texto;
			else if (b.tipo === 'tabela') {
				if (!b.titulo && titulo) b.titulo = titulo;
				titulo = null;
			}
		}
	}

	// ---------------------------------------------------------------- índices de seção e resumos
	const palavras = (bs: Bloco[]): number =>
		bs.reduce((n, b) => {
			const ts: Trecho[][] =
				b.tipo === 'p'
					? [b.c]
					: b.tipo === 'lista'
						? b.itens.map((i) => i.c)
						: b.tipo === 'tabela'
							? b.linhas.flat(2)
							: b.tipo === 'cena'
								? b.c
								: b.tipo === 'mesa'
									? [...b.linhas.flatMap((l) => [l.rotulo, l.valor]), ...b.notas]
									: [];
			return n + ts.reduce((m, t) => m + textoDe(t).split(/\s+/).filter(Boolean).length, 0) + (b.tipo === 'destaque' ? palavras(b.blocos) : 0);
		}, 0);
	for (const c of capitulos) {
		c.minutos = Math.max(1, Math.round(palavras(c.blocos) / 200));
		const arte = `capitulos/cap-${String(c.numero).padStart(2, '0')}.png`;
		c.arte = existsSync(join(raiz, 'static', arte)) ? `/${arte}` : null;
		c.secoes = c.blocos.filter((b): b is Bloco & { tipo: 'h' } => b.tipo === 'h').map(({ id, texto, nivel }) => ({ id, titulo: texto, nivel }));
		const p = c.blocos.find((b) => b.tipo === 'p') as { c: Trecho[] } | undefined;
		const r = p ? textoDe(p.c) : '';
		c.resumo = r.length > 200 ? r.slice(0, r.lastIndexOf(' ', 197)) + '…' : r;
	}

	// ---------------------------------------------------------------- referência rápida (D10)
	const referencia: CardReferencia[] = [];
	{
		const linhasDe = (t: (Bloco & { tipo: 'tabela' }) | undefined, f: (l: string[]) => [string, string]) => (t ? t.linhas.map((l) => f(l.map(celTexto))) : []);
		const tabelaComCab = (c: Capitulo, inicioCab: string) => c.blocos.find((b): b is Bloco & { tipo: 'tabela' } => b.tipo === 'tabela' && normalizar(b.cab?.[0] ?? '').startsWith(normalizar(inicioCab)));
		const add = (id: string, titulo: string, icone: string, c: Capitulo, ancora: string, linhas: [string, string][]) => {
			if (!linhas.length) avisar(`Referência rápida vazia: ${titulo}`);
			referencia.push({ id, titulo, icone, capitulo: { numero: c.numero, href: `${c.href}${ancora ? '#' + ancora : ''}` }, linhas });
		};
		/** A âncora de uma seção (os títulos podem mudar de texto; a âncora, não). */
		const ancora = (c: Capitulo, id: string) => {
			if (c.blocos.some((b) => b.tipo === 'h' && b.id === id)) return id;
			avisar(`Seção #${id} não encontrada no cap. ${c.numero}`);
			return '';
		};
		const tabelaDaSecao = (c: Capitulo, id: string, nivelMax = 4) => tabelaEm(secao(c.blocos, (_, i) => i === id, nivelMax).blocos);
		/** Linhas do quadro "Na mesa" com essa ref e a âncora da seção onde ele está. */
		const mesa = (c: Capitulo, ref: string) => {
			let ancora = '';
			for (const b of c.blocos) {
				if (b.tipo === 'h') ancora = b.id;
				else if (b.tipo === 'mesa' && b.ref === ref) return { ancora, linhas: b.linhas.map((l) => [textoDe(l.rotulo), textoDe(l.valor)] as [string, string]) };
			}
			avisar(`Quadro Na mesa "${ref}" não encontrado no cap. ${c.numero}`);
			return { ancora: '', linhas: [] };
		};
		const c2 = cap(2),
			c4 = cap(4),
			c9 = cap(9),
			c10 = cap(10),
			c20 = cap(20);
		add('dt', 'DIFICULDADES (DT)', 'dado/ic-dado-d20', c2, '', linhasDe(tabelaComCab(c2, 'Dificuldade'), (l) => [l[0], l[1]]));
		add('testes', 'TIPOS DE TESTE', 'callout/ic-callout-destaque', c2, ancora(c2, 'tipos-de-teste-como-o-mestre-escolhe-o-que-rolar'), linhasDe(tabelaComCab(c2, 'Tipo de teste'), (l) => [l[0], l[1]]));
		// ações por turno e saves de morte: quadros "Na mesa" do cap. 4
		const acoes = mesa(c4, 'acoes');
		add('acoes', 'AÇÕES POR TURNO', 'recurso/ic-recurso-iniciativa', c4, acoes.ancora, acoes.linhas);
		add('ataque', 'ATAQUE E DEFESA', 'recurso/ic-recurso-defesa', c4, ancora(c4, 'ataque-e-defesa'), linhasDe(tabelaComCab(c4, 'Tipo'), (l) => [l[0], `${l[1]} contra ${l[2]}`]));
		add('vida', 'ESTADOS DE VIDA', 'estado/ic-estado-caido', c4, ancora(c4, 'estados-de-vida'), linhasDe(tabelaComCab(c4, 'PV atual'), (l) => [l[0], l[1]]));
		const saves = mesa(c4, 'saves');
		add('saves', 'SAVES DE MORTE', 'illustrations/il-memorial', c4, saves.ancora, saves.linhas);
		add('fadiga', 'FADIGA', 'recurso/ic-recurso-fadiga', c4, ancora(c4, 'fadiga'), linhasDe(tabelaDaSecao(c4, 'fadiga'), (l) => [l[0], l[1]]));
		add('estados', 'ESTADOS ESPECIAIS', 'estado/ic-estado-atordoado', c4, ancora(c4, 'estados-especiais'), linhasDe(tabelaComCab(c4, 'Estado'), (l) => [l[0], l[1]]));
		add('visibilidade', 'VISIBILIDADE', 'estado/ic-estado-cego', c4, ancora(c4, 'categorias-de-visibilidade'), linhasDe(tabelaComCab(c4, 'Categoria'), (l) => [l[0], l[1]]));
		add('recuperacao', 'RECUPERAÇÃO', 'item/ic-item-kit-medico', c9, ancora(c9, 'recuperacao-pv-pc-e-pe'), linhasDe(tabelaDaSecao(c9, 'recuperacao-pv-pc-e-pe', 2), (l) => [l[0], l.slice(1).join(' · ')]));
		// a DT do jutsu está no quadro "Na mesa" do cap. 2 (ref="dt-jutsu")
		const dtJutsu = mesa(c2, 'dt-jutsu');
		add('dt-jutsu', 'DT DO JUTSU', 'rank/ic-rank-c', c2, dtJutsu.ancora, dtJutsu.linhas);
		add('pj-rank', 'PJ → RANK', 'rank/ic-rank-b', c20, ancora(c20, 'passo-3-verificar-o-rank'), linhasDe(tabelaComCab(c20, 'Soma de PJ'), (l) => [`${l[0]} PJ`, `Rank ${l[1]} · ${l[2]}`]));
		const c18 = cap(18);
		add('custos-pt', 'CUSTOS DE PT', 'recurso/ic-recurso-pt', c18, ancora(c18, 'gastando-pontos-de-treino'), linhasDe(tabelaComCab(c18, 'Aplicação'), (l) => [l[0], l[1]]));
		add('elementos', 'VANTAGEM ELEMENTAL', 'elemento/ic-elemento-katon', c10, ancora(c10, 'os-cinco-elementos-basicos'), linhasDe(tabelaComCab(c10, 'Elemento'), (l) => [l[0], `forte contra ${l[1]} · fraco contra ${l[2]}`]));
	}

	// ---------------------------------------------------------------- busca
	const busca: DocBusca[] = [];
	{
		const parte = (c: Capitulo) => partes[c.parte - 1];
		const textoBlocos = (bs: Bloco[]): string =>
			bs
				.map((b) => {
					if (b.tipo === 'p') return textoDe(b.c);
					if (b.tipo === 'lista') return b.itens.map((it) => textoDe(it.c)).join(' ');
					if (b.tipo === 'formula') return b.texto;
					if (b.tipo === 'destaque') return b.titulo + ' ' + textoBlocos(b.blocos);
					if (b.tipo === 'tabela') return [...(b.cab ?? []), ...b.linhas.flat().map(celTexto)].join(' ');
					if (b.tipo === 'cena') return b.c.map(textoDe).join(' ');
					if (b.tipo === 'mesa') return [b.titulo ?? '', ...b.linhas.map((l) => `${textoDe(l.rotulo)} ${textoDe(l.valor)}`), ...b.notas.map(textoDe)].join(' ');
					return '';
				})
				.join(' ')
				.replace(/\s+/g, ' ');
		for (const c of capitulos) {
			if (c.numero === 22) continue;
			const pilha: string[] = [];
			const iconeParte = parte(c).icone;
			c.blocos.forEach((b, i) => {
				if (b.tipo !== 'h') return;
				pilha.length = b.nivel - 2;
				pilha.push(b.texto);
				let fim = c.blocos.findIndex((x, k) => k > i && x.tipo === 'h');
				if (fim < 0) fim = c.blocos.length;
				busca.push({
					id: `s:${c.numero}:${b.id}`,
					tipo: 'secao',
					titulo: b.texto,
					caminho: `Cap. ${c.numero} · ${c.titulo} › ${pilha.join(' › ')}`,
					texto: textoBlocos(c.blocos.slice(i + 1, fim)).slice(0, 4000),
					href: `${c.href}#${b.id}`,
					icone: iconeParte
				});
			});
			busca.push({ id: `c:${c.numero}`, tipo: 'secao', titulo: c.titulo, caminho: `Cap. ${c.numero} · ${parte(c).rotulo}`, texto: c.resumo, href: c.href, icone: iconeParte });
		}
		for (const j of jutsus) {
			const icone = j.cla ? `cla/ic-cla-${j.cla}` : j.elemento ? `elemento/ic-elemento-${j.elemento}` : `pericia/ic-pericia-${j.tipo === 'Fuuinjutsu' ? 'selamento' : slug(j.tipo)}`;
			busca.push({ id: `j:${j.slug}`, tipo: 'jutsu', titulo: j.nome, ...(j.traducao ? { traducao: j.traducao } : {}), caminho: `${j.tipo} · ${j.origem} · Rank ${j.rank}`, texto: [j.traducao, ...j.descricao.map(textoDe), j.efeito ? textoDe(j.efeito) : ''].filter(Boolean).join(' — '), href: `/regras/jutsus/${j.slug}`, icone, rank: j.rank });
		}
		for (const h of habilidades) {
			const cl = clas.find((c) => c.slug === h.cla);
			busca.push({
				id: `h:${h.slug}`,
				tipo: 'jutsu',
				titulo: h.nome,
				caminho: `Habilidade · ${h.origem}`,
				texto: [h.traducao, ...h.descricao.map(textoDe), h.efeito ? textoDe(h.efeito) : ''].filter(Boolean).join(' — '),
				href: cl ? `/regras/clas/${cl.slug}#${slug('Jutsus e Habilidades do Clã')}` : `${hrefCapitulo(h.capitulo)}#${h.ancora}`,
				icone: h.cla ? `cla/ic-cla-${h.cla}` : 'acao/ic-acao-criar-personagem'
			});
		}
		busca.push({ id: 'b:como-usar', tipo: 'secao', titulo: bestiario.comoUsar.titulo, caminho: 'Bestiário', texto: bestiario.comoUsar.resumo, href: '/regras/bestiario/como-usar', icone: 'nav/ic-nav-npcs' });
		for (const s of bestiario.comoUsar.secoes)
			busca.push({ id: `b:${s.id}`, tipo: 'secao', titulo: s.titulo, caminho: `Bestiário · ${bestiario.comoUsar.titulo}`, texto: '', href: `/regras/bestiario/como-usar#${s.id}`, icone: 'nav/ic-nav-npcs' });
		for (const cr of bestiario.criaturas)
			busca.push({ id: `b:${cr.slug}`, tipo: 'criatura', titulo: cr.nome, caminho: `Bestiário · ${cr.tipo} · ameaça ${cr.ameacaFaixa}`, texto: [cr.origem, ...cr.estagios.map((e) => e.nome), ...cr.descricao.map(textoDe)].join(' '), href: `/regras/bestiario/${cr.slug}`, icone: cr.vila?.icone ?? (cr.tipo === 'invocação' ? 'esp/ic-esp-invocacao' : 'nav/ic-nav-npcs') });
		for (const cl of clas) busca.push({ id: `k:${cl.slug}`, tipo: 'cla', titulo: `Clã ${cl.nome}`, caminho: `Clã · ${cl.epiteto} · ${cl.vila.nome}`, texto: [cl.epigrafe?.texto ?? '', textoBlocos(cl.descricao)].join(' '), href: `/regras/clas/${cl.slug}`, icone: `cla/ic-cla-${cl.slug}` });
		for (const cat of equipamentos.categorias)
			for (const a of cat.armas) busca.push({ id: `a:${a.slug}`, tipo: 'item', titulo: a.nome, caminho: `Arma · ${cat.titulo} · ${a.dano} · ${a.preco}`, texto: a.propriedades.join(' '), href: `/regras/equipamentos?aba=armas&categoria=${cat.id}#${a.slug}`, icone: a.icone });
		for (const e of equipamentos.espadas) busca.push({ id: `e:${e.slug}`, tipo: 'item', titulo: e.nome, caminho: `Sete Espadas da Névoa · ${e.traducao}`, texto: e.habilidade, href: `/regras/equipamentos?aba=armas&categoria=espadas#${e.slug}`, icone: e.icone });
		for (const aba of equipamentos.abas)
			for (const s of aba.secoes)
				for (const b of s.blocos)
					if (b.tipo === 'tabela')
						for (const l of b.linhas) {
							const nome = celTexto(l[0]);
							if (nome) busca.push({ id: `i:${aba.id}:${slug(nome)}`, tipo: 'item', titulo: nome, caminho: `${aba.titulo} · ${l.slice(1, 3).map(celTexto).join(' · ')}`, texto: l.slice(1).map(celTexto).join(' '), href: `/regras/equipamentos?aba=${aba.id}`, icone: 'equip/ic-equip-kit' });
						}
		for (const s of glossario) for (const t of s.termos) busca.push({ id: `g:${t.id}`, tipo: 'termo', titulo: t.termo, caminho: `Glossário · ${s.titulo}`, texto: t.campos.join(' · '), href: `/regras/glossario#${t.id}`, icone: t.icone ?? 'nav/ic-nav-referencia' });
		const ids = new Set<string>();
		for (const d of busca) {
			while (ids.has(d.id)) d.id += "'";
			ids.add(d.id);
		}
	}

	const indice: IndiceLivro = {
		partes,
		capitulos: capitulos.map(({ numero, slug: s, href, titulo, parte, resumo, secoes, arte }) => ({ numero, slug: s, href, titulo, parte, resumo, secoes, arte }))
	};
	const termos: TermoLexico[] = lexico.map(({ padroes: _p, sigla: _s, linha: _l, ...e }) => e);
	return { saida: { indice, capitulos, jutsus, habilidades, clas, equipamentos, especializacoes, glossario, referencia, busca, termos, bestiario }, avisos };
}

// ---------------------------------------------------------------- linha de comando
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
	const { saida, avisos } = compilar();
	const SAIDA = join(RAIZ, 'src', 'lib', 'livro', 'gerado');
	mkdirSync(SAIDA, { recursive: true });
	for (const [nome, dados] of Object.entries(saida)) writeFileSync(join(SAIDA, `${nome}.json`), JSON.stringify(dados));
	const { capitulos, jutsus, habilidades, clas, equipamentos, especializacoes, glossario, referencia, busca } = saida;
	console.log(`Capítulos: ${capitulos.length} · Jutsus: ${jutsus.length} · Habilidades: ${habilidades.length} · Clãs: ${clas.length}`);
	console.log(`Armas: ${equipamentos.categorias.reduce((n, c) => n + c.armas.length, 0)} em ${equipamentos.categorias.length} categorias · Espadas: ${equipamentos.espadas.length} · Propriedades: ${equipamentos.propriedades.length}`);
	console.log(`Especializações: ${especializacoes.lista.length} · Glossário: ${glossario.reduce((n, s) => n + s.termos.length, 0)} termos · Referência: ${referencia.length} cards · Busca: ${busca.length} documentos`);
	if (avisos.length) {
		console.log(`\n${avisos.length} aviso(s):`);
		for (const a of avisos) console.log(' - ' + a);
	}
}
