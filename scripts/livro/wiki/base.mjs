// Atalhos das especificações de jutsus da wiki (scripts/livro/importar-jutsus.ts): onde cada carta aponta no livro.
export const CAP10 = {
	geral: { capitulo: 10, ancora: 'ninjutsu-geral-sem-elemento' },
	katon: { capitulo: 10, ancora: 'katon-liberacao-de-fogo' },
	suiton: { capitulo: 10, ancora: 'suiton-liberacao-de-agua' },
	doton: { capitulo: 10, ancora: 'doton-liberacao-de-terra' },
	raiton: { capitulo: 10, ancora: 'raiton-liberacao-de-raio' },
	fuuton: { capitulo: 10, ancora: 'fuuton-liberacao-de-vento' },
	medico: { capitulo: 10, ancora: 'ninjutsu-medico' },
	genjutsu: { capitulo: 10, ancora: 'genjutsu-comuns' },
	taijutsu: { capitulo: 10, ancora: 'tecnicas-de-taijutsu-combate-corporal' }
};
/** Fuuinjutsu e Bukijutsu: a tabela dos seis tipos de jutsu (cap. 20). */
export const TIPOS = { capitulo: 20, ancora: 'os-seis-tipos-de-jutsu' };
/** Kugutsu: o combate com marionetes (cap. 13). */
export const MARIONETES = { capitulo: 13, ancora: 'como-funciona-o-combate-com-marionetes-visao-geral' };
/** Jutsus de clã (cap. 8): cada clã tem a sua seção, na ordem do capítulo. */
const ORDEM_CLAS = ['nara', 'akimichi', 'yamanaka', 'inuzuka', 'aburame', 'hyuuga', 'uchiha', 'senju', 'uzumaki', 'kaguya', 'hozuki', 'sabaku', 'yuki'];
export const cla = (slug) => {
	const i = ORDEM_CLAS.indexOf(slug);
	if (i < 0) throw new Error(`clã desconhecido: ${slug}`);
	return { cla: slug, capitulo: 8, ancora: i ? `jutsus-e-habilidades-do-cla-${i + 1}` : 'jutsus-e-habilidades-do-cla' };
};
