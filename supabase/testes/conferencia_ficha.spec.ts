import { beforeAll, describe, expect, it } from 'vitest';
import clasJson from '#lib/livro/gerado/clas.json';
import { catalogoDoBanco } from '#lib/livro/catalogo-banco.ts';
import { catalogoFicha } from '#lib/personagem/catalogo.server.ts';
import { opcoesTreino, planoNivel, type JutsuFicha } from '#lib/personagem/progressao.ts';
import { fichaVazia, type FichaDados, type Treino } from '#lib/personagem/regras.ts';
import { criarBanco, type Usuario } from './banco';

let banco: Awaited<ReturnType<typeof criarBanco>>;
let kaito: Usuario, aiko: Usuario;
let campanha: string, hana: string;
const um = async <T>(p: Promise<T[]>) => (await p)[0];
const CLAS = clasJson.map((c) => c.slug);

function ficha(cla: string | null, nivel: number, ajuste?: (f: FichaDados) => void): FichaDados {
	const f = fichaVazia();
	f.cla = cla ? { tipo: 'catalogo', slug: cla, escolha: null, id: null, criado: null } : { tipo: 'sem', slug: null, escolha: null, id: null, criado: null };
	f.progresso.niveis = Array.from({ length: nivel - 1 }, (_, i) => ({ nivel: i + 2 }));
	ajuste?.(f);
	return f;
}
const conferir = async (f: FichaDados, nivel: number, treinos: Treino[]) => {
	const r = await banco.db.query<{ custo: number }>(`select public.conferir_treinos($1::jsonb, $2, $3, $4::jsonb) as custo`, [JSON.stringify(f), nivel, campanha, JSON.stringify(treinos)]);
	return r.rows[0].custo;
};
const conferirNivel = async (f: FichaDados, novo: number, escolha: unknown) => {
	const r = await banco.db.query<{ pt: number }>(`select public.conferir_nivel($1::jsonb, $2, $3::jsonb) as pt`, [JSON.stringify(f), novo, JSON.stringify(escolha)]);
	return r.rows[0].pt;
};
const opcoes = (f: FichaDados, cla: string | null) => opcoesTreino(f, catalogoFicha(cla).jutsus as unknown as JutsuFicha[], (id) => id);

beforeAll(async () => {
	banco = await criarBanco();
	kaito = await banco.criarUsuario('kaito@exemplo.com', 'Kaito');
	aiko = await banco.criarUsuario('aiko@exemplo.com', 'Aiko');
	campanha = (await um(banco.como<{ id: string }>(kaito, `insert into campanhas (nome, mestre_id) values ('Névoa', $1) returning id`, [kaito.id]))).id;
	const l = await um(banco.como<{ token: string }>(kaito, `insert into convites (campanha_id, tipo) values ($1, 'link') returning token`, [campanha]));
	await banco.como(aiko, `select aceitar_convite($1)`, [l.token]);
	hana = (await um(banco.como<{ id: string }>(aiko, `insert into personagens (campanha_id, jogador_id, nome) values ($1, $2, 'Hana') returning id`, [campanha, aiko.id]))).id;
	await banco.como(aiko, `select enviar_ficha($1)`, [hana]);
	await banco.como(kaito, `select decidir_ficha($1, 'aprovada')`, [hana]);
	await banco.db.query(`update personagens set pt = 40, xp = 500, dados = $2::jsonb where id = $1`, [hana, JSON.stringify(ficha('nara', 1, (f) => void (f.atributos.FOR = 2)))]);
}, 30000);

describe('o catálogo do banco', () => {
	it('é o mesmo do livro (se falhar: npx tsx scripts/livro/catalogo-banco.ts <data>)', async () => {
		const c = catalogoDoBanco();
		const ordem = <T extends { slug?: string; cla?: string | null; nivel?: number }>(l: T[]) => [...l].sort((a, b) => `${a.slug ?? a.cla}${a.nivel}`.localeCompare(`${b.slug ?? b.cla}${b.nivel}`));
		expect(ordem((await banco.db.query<(typeof c.jutsus)[number]>(`select * from livro_jutsus`)).rows)).toEqual(ordem(c.jutsus));
		expect(ordem((await banco.db.query<(typeof c.clas)[number]>(`select * from livro_clas`)).rows)).toEqual(ordem(c.clas));
		const marcos = (await banco.db.query<(typeof c.marcos)[number]>(`select * from livro_marcos`)).rows;
		expect(ordem(marcos)).toEqual(ordem(c.marcos));
	});

	it('não é lido por jogador nem por visitante', async () => {
		await expect(banco.como(aiko, `select * from livro_jutsus`)).rejects.toThrow(/permission denied/);
		await expect(banco.como(null, `select * from livro_marcos`)).rejects.toThrow(/permission denied/);
	});
});

// o contrato: a tela e o banco precisam dar a mesma resposta, senão um jogador honesto fica sem treinar
describe('tudo o que a tela oferece, o banco aceita', () => {
	for (const cla of [null, ...CLAS]) {
		it(`${cla ?? 'sem clã'}: todos os jutsus, do nível 1 ao 20`, async () => {
			for (const nivel of [1, 6, 11, 15, 20]) {
				const f = ficha(cla, nivel, (x) => void (x.elemento = 'katon'));
				const livres = opcoes(f, cla).filter((o) => !o.bloqueio && o.grupo === 'jutsu');
				const treinos = livres.map((o) => o.treino);
				expect(await conferir(f, nivel, treinos)).toBe(livres.reduce((t, o) => t + o.pt, 0));
			}
		});
	}

	it('especialização, proficiência e elemento', async () => {
		const f = ficha('nara', 20, (x) => {
			x.especializacao = 'ninjutsu';
			x.elemento = 'doton';
			x.proficiencias = [
				{ tipo: 'arma', alvo: 'kunai', nivel: 1 },
				{ tipo: 'categoria', alvo: 'Armas de distância', nivel: 3 },
				{ tipo: 'jutsu', alvo: 'kage-mane-no-jutsu', nivel: 4 }
			];
		});
		for (const o of opcoes(f, 'nara').filter((x) => x.grupo !== 'jutsu')) {
			if (o.bloqueio) await expect(conferir(f, 20, [o.treino]), o.chave).rejects.toThrow();
			else expect(await conferir(f, 20, [o.treino]), o.chave).toBe(o.pt);
		}
	});

	it('clã de elemento fixo com um elemento antigo na ficha: o treino oferecido passa', async () => {
		const f = ficha('uchiha', 20, (x) => void (x.elemento = 'doton'));
		const o = opcoes(f, 'uchiha').find((x) => x.chave === 'elem:doton')!;
		expect(o.bloqueio).toBe('');
		expect(await conferir(f, 20, [o.treino])).toBe(o.pt);
	});

	it('o carrinho inteiro de uma vez: nova proficiência e o 2º nível da especialização', async () => {
		const f = ficha(null, 5, (x) => void (x.especializacao = 'ninjutsu'));
		expect(await conferir(f, 5, [{ tipo: 'especializacao', id: 'ninjutsu', pt: 5 }, { tipo: 'proficiencia', prof: { tipo: 'arma', alvo: 'kunai' }, nivel: 1, pt: 1 }])).toBe(6);
	});

	for (const cla of CLAS) {
		it(`${cla}: todos os marcos dos níveis 2 a 20`, async () => {
			const cat = catalogoFicha(cla);
			const f = ficha(cla, 1);
			for (let novo = 2; novo <= 20; novo++) {
				const plano = planoNivel(f, novo, cat.cla?.marcos ?? [], cat.jutsusDoCla);
				const opcao = plano.marco?.escolhaPericia?.[0];
				const marco = plano.marco ? { ...plano.marco, pericias: [...(plano.marco.pericias ?? []), ...(opcao ? [opcao] : [])] } : undefined;
				expect(await conferirNivel(f, novo, { nivel: novo, ...(marco ? { marco } : {}) }), `nível ${novo}`).toBe(plano.marco?.pt ?? 0);
			}
		});
	}
});

describe('o que a tela bloqueia, o banco recusa', () => {
	it('rank acima do nível, em todos os jutsus', async () => {
		const f = ficha(null, 1, (x) => void (x.elemento = 'katon'));
		const presos = opcoes(f, null).filter((o) => o.bloqueio.startsWith('Rank'));
		expect(presos.length).toBeGreaterThan(50);
		for (const o of presos.slice(0, 80)) await expect(conferir(f, 1, [o.treino]), o.chave).rejects.toThrow(/exige nível/);
	});

	it('elemento sem afinidade', async () => {
		const f = ficha(null, 20, (x) => void (x.elemento = 'katon'));
		const presos = opcoes(f, null).filter((o) => o.bloqueio.startsWith('Exige afinidade'));
		expect(presos.length).toBeGreaterThan(20);
		for (const o of presos.slice(0, 40)) await expect(conferir(f, 20, [o.treino]), o.chave).rejects.toThrow(/afinidade/);
	});
});

describe('trapaça', () => {
	const f = ficha('nara', 11, (x) => void (x.elemento = 'katon'));

	it('pagar menos que o livro', async () => {
		const o = opcoes(f, 'nara').find((x) => x.grupo === 'jutsu' && x.pt > 2 && !x.bloqueio)!;
		await expect(conferir(f, 11, [{ ...o.treino, pt: 1 } as Treino])).rejects.toThrow(/não confere/);
	});
	it('jutsu de outro clã', async () => {
		await expect(conferir(f, 11, [{ tipo: 'jutsu', slug: catalogoDoBanco().jutsus.find((j) => j.cla === 'uchiha')!.slug, pt: 5 }])).rejects.toThrow(/outro clã/);
	});
	it('aprender duas vezes', async () => {
		const o = opcoes(f, 'nara').find((x) => x.grupo === 'jutsu' && !x.bloqueio)!;
		await expect(conferir(f, 11, [o.treino, o.treino])).rejects.toThrow(/já foi aprendido/);
	});
	it('entrada sem custo, negativa ou de tipo desconhecido', async () => {
		await expect(conferir(f, 11, [{ tipo: 'jutsu', slug: 'x', pt: 0 }])).rejects.toThrow(/inválido/);
		await expect(conferir(f, 11, [{ tipo: 'jutsu', slug: 'x', pt: -5 }])).rejects.toThrow(/inválido/);
		await expect(conferir(f, 11, [{ tipo: 'atributo', pt: 1 } as unknown as Treino])).rejects.toThrow(/inválido/);
	});
	it('marco inventado', async () => {
		const g = ficha('nara', 1);
		const cat = catalogoFicha('nara');
		const novo = cat.cla!.marcos.find((m) => m.nivel > 1 && /\+\d+ (FOR|AGI|VIG|INT|CTR|ESP)/.test(m.texto))!.nivel;
		const marco = planoNivel(g, novo, cat.cla?.marcos ?? [], cat.jutsusDoCla).marco!;
		await expect(conferirNivel(g, novo, { nivel: novo, marco: { ...marco, atributos: { FOR: 5 } } })).rejects.toThrow(/não confere/);
		await expect(conferirNivel(g, novo, { nivel: novo, marco: { ...marco, pt: 10 } })).rejects.toThrow(/não confere/);
		await expect(conferirNivel(g, novo, { nivel: novo, marco: { ...marco, jutsus: ['rasengan'] } })).rejects.toThrow(/não confere/);
		await expect(conferirNivel(ficha(null, 1), 3, { nivel: 3, marco: { texto: 'x', pt: 10 } })).rejects.toThrow(/não tem marco/);
	});
	it('atributo, perícia ou especialização fora dos níveis certos', async () => {
		const g = ficha(null, 1);
		await expect(conferirNivel(g, 3, { nivel: 3, atributo: 'FOR' })).rejects.toThrow(/não dá atributo/);
		await expect(conferirNivel(g, 3, { nivel: 3, pericia: 'ninjutsu' })).rejects.toThrow(/não dá perícia/);
		await expect(conferirNivel(g, 3, { nivel: 3, especializacao: { id: 'ninjutsu' } })).rejects.toThrow(/não dá especialização/);
		await expect(conferirNivel(g, 3, { nivel: 4 })).rejects.toThrow(/inválidas/);
		await expect(conferirNivel(g, 3, { nivel: 3, pt: 99 })).rejects.toThrow(/inválidas/);
		expect(await conferirNivel(g, 4, { nivel: 4, atributo: 'FOR' })).toBe(0);
	});
});

describe('as funções que a ficha chama', () => {
	const custo = async () => (await um(banco.como<{ pt: number }>(aiko, `select pt from personagens where id = $1`, [hana]))).pt;
	const dados = async () => (await um(banco.como<{ dados: FichaDados }>(aiko, `select dados from personagens where id = $1`, [hana]))).dados;

	it('treino: só acrescenta o que foi aprendido e cobra do livro', async () => {
		const o = opcoes(ficha('nara', 1), 'nara').find((x) => x.grupo === 'jutsu' && !x.bloqueio && x.pt === 2)!;
		const [{ aprender_treinos: resta }] = await banco.como<{ aprender_treinos: number }>(aiko, `select aprender_treinos($1, $2::jsonb, '{}', 'x')`, [hana, JSON.stringify([o.treino])]);
		expect(resta).toBe(38);
		const d = await dados();
		expect(d.progresso.treinos).toEqual([o.treino]);
		expect(d.atributos.FOR).toBe(2);
	});

	it('PT insuficientes não gravam nada', async () => {
		await banco.db.query(`update personagens set pt = 1 where id = $1`, [hana]);
		const o = opcoes(ficha('nara', 1), 'nara').find((x) => x.grupo === 'jutsu' && !x.bloqueio && x.pt === 4)!;
		await expect(banco.como(aiko, `select aprender_treinos($1, $2::jsonb, '{}', 'x')`, [hana, JSON.stringify([o.treino])])).rejects.toThrow(/insuficientes/);
		expect(await custo()).toBe(1);
		await banco.db.query(`update personagens set pt = 40 where id = $1`, [hana]);
	});

	it('nível: acrescenta a escolha e soma os PT do marco, sem aceitar outra ficha', async () => {
		const cat = catalogoFicha('nara');
		const marco = planoNivel(ficha('nara', 1), 2, cat.cla?.marcos ?? [], cat.jutsusDoCla).marco ?? undefined;
		const [{ alcancar_nivel: n }] = await banco.como<{ alcancar_nivel: number }>(aiko, `select alcancar_nivel($1, $2::jsonb, '{}', '{}')`, [hana, JSON.stringify({ nivel: 2, ...(marco ? { marco } : {}) })]);
		expect(n).toBe(2);
		expect((await dados()).atributos.FOR).toBe(2);
		expect(await custo()).toBe(43 + (marco?.pt ?? 0));
	});

	it('o Mestre não usa a ficha de um jogador, e visitante não chama nada', async () => {
		await expect(banco.como(kaito, `select aprender_treinos($1, '[]', '{}', 'x')`, [hana])).rejects.toThrow(/não encontrada/);
		await expect(banco.como(null, `select aprender_treinos($1, '[]', '{}', 'x')`, [hana])).rejects.toThrow(/permission denied/);
		await expect(banco.como(null, `select alcancar_nivel($1, '{}', '{}', '{}')`, [hana])).rejects.toThrow(/permission denied/);
	});

	it('as funções antigas, que aceitavam a ficha inteira, não existem mais', async () => {
		await expect(banco.como(aiko, `select treinar($1, '{}', '{}', 1, 'x')`, [hana])).rejects.toThrow(/does not exist/);
		await expect(banco.como(aiko, `select subir_nivel($1, '{}', '{}', '{}', 0)`, [hana])).rejects.toThrow(/does not exist/);
	});
});
