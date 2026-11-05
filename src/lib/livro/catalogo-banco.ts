// O que o banco precisa saber do livro para conferir treino e nível: rank dos jutsus, elementos fixos dos clãs e marcos.
// Sai daqui para as tabelas livro_* (scripts/livro/catalogo-banco.ts), e um teste avisa quando o livro e o banco divergem.
import { CLAS } from '#lib/personagem/dados.ts';
import { lerMarco } from '#lib/personagem/progressao.ts';
import clasJson from './gerado/clas.json';
import jutsusJson from './gerado/jutsus.json';

export function catalogoDoBanco() {
	const jutsus = jutsusJson.map((j) => ({ slug: j.slug, rank: j.rank, cla: j.cla ?? null, elemento: j.elemento ?? null }));
	const clas = Object.entries(CLAS).map(([slug, c]) => ({ slug, elementos: c.elemento ? [c.elemento] : [] }));
	const marcos = clasJson.flatMap((c) => {
		const doCla = jutsusJson.filter((j) => j.cla === c.slug).map((j) => ({ slug: j.slug, nome: j.nome }));
		return (c.marcos as { nivel: number; texto: string }[])
			.filter((m) => m.nivel > 1)
			.map((m) => {
				const { texto: _texto, escolhaPericia, ...ganho } = lerMarco(m.texto, doCla);
				return { cla: c.slug, nivel: m.nivel, ganho, escolha_pericia: escolhaPericia ?? null };
			});
	});
	return { jutsus, clas, marcos };
}
