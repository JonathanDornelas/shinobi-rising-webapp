// Acesso aos dados gerados do livro. Só roda no servidor (pré-renderização):
// cada página recebe apenas o que usa, em vez do livro inteiro no navegador.
import capitulosJson from './gerado/capitulos.json';
import jutsusJson from './gerado/jutsus.json';
import habilidadesJson from './gerado/habilidades.json';
import clasJson from './gerado/clas.json';
import equipamentosJson from './gerado/equipamentos.json';
import especializacoesJson from './gerado/especializacoes.json';
import glossarioJson from './gerado/glossario.json';
import referenciaJson from './gerado/referencia.json';
import buscaJson from './gerado/busca.json';
import termosJson from './gerado/termos.json';
import bestiarioJson from './gerado/bestiario.json';
import type {
	Bestiario,
	Bloco,
	CardReferencia,
	Capitulo,
	Cla,
	ClaResumo,
	DocBusca,
	Equipamentos,
	Especializacoes,
	Habilidade,
	Jutsu,
	SecaoGlossario,
	TermoLexico
} from './tipos';

export const capitulos = capitulosJson as Capitulo[];
export const jutsus = jutsusJson as Jutsu[];
export const habilidades = habilidadesJson as Habilidade[];
export const clas = clasJson as Cla[];
export const equipamentos = equipamentosJson as Equipamentos;
export const especializacoes = especializacoesJson as Especializacoes;
export const glossario = glossarioJson as SecaoGlossario[];
export const referencia = referenciaJson as CardReferencia[];
export const busca = buscaJson as DocBusca[];
/** Léxico: os termos destacados no texto das regras (compêndio no glossário). */
export const termos = termosJson as TermoLexico[];
/** Bestiário: o "Como usar" (ameaça e encontros) e os verbetes. */
export const bestiario = bestiarioJson as Bestiario;

export const resumoCla = ({ slug, nome, epiteto, vila, kkg, bonus, status }: Cla): ClaResumo => ({ slug, nome, epiteto, vila, kkg, bonus, status });

/** Jutsus e habilidades citados numa lista de blocos (inclusive dentro de destaques). */
export function cardsDosBlocos(blocos: Bloco[]) {
	const js: Record<string, Jutsu> = {};
	const hs: Record<string, Habilidade> = {};
	const andar = (bs: Bloco[]) => {
		for (const b of bs) {
			if (b.tipo === 'jutsu') {
				const j = jutsus.find((x) => x.slug === b.slug);
				if (j) js[j.slug] = j;
			} else if (b.tipo === 'habilidade') {
				const h = habilidades.find((x) => x.slug === b.slug);
				if (h) hs[h.slug] = h;
			} else if (b.tipo === 'destaque') andar(b.blocos);
		}
	};
	andar(blocos);
	return { jutsus: js, habilidades: hs };
}
