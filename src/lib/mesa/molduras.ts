// Molduras do token na Mesa (pixellab/molduras.json → static/molduras/<id>.png). Cada jogador escolhe a sua no menu da
// cor; ela fica no perfil (preferencias.moldura) e vale nos tokens dele. `interno` é o raio do furo sobre o raio
// externo, medido no recorte: o retrato cabe no furo.

export interface Moldura {
	id: string;
	nome: string;
	interno: number;
}

export const MOLDURAS: Moldura[] = [
	{ id: 'hitaiate', nome: 'Hitaiate', interno: 0.64 },
	{ id: 'kunai', nome: 'Kunai', interno: 0.73 },
	{ id: 'shuriken', nome: 'Shuriken', interno: 0.58 },
	{ id: 'pergaminho', nome: 'Pergaminho', interno: 0.65 },
	{ id: 'selo', nome: 'Selo', interno: 0.7 },
	{ id: 'folhas', nome: 'Folhas', interno: 0.62 },
	{ id: 'katon', nome: 'Katon', interno: 0.69 },
	{ id: 'raiton', nome: 'Raiton', interno: 0.63 },
	{ id: 'shimenawa', nome: 'Shimenawa', interno: 0.73 },
	{ id: 'anbu', nome: 'Anbu', interno: 0.74 }
];

/** Só ids conhecidos viram imagem (o valor vem do perfil e do broadcast). */
export const molduraPorId = (id: string | null | undefined) => (id ? (MOLDURAS.find((m) => m.id === id) ?? null) : null);

/**
 * A moldura de um token: a da mesa, se o Mestre a fez universal; senão a do jogador dono (personagem e clones), e a da
 * mesa para os NPCs e para quem não escolheu.
 */
export function molduraDoToken(daMesa: { id: string | null; universal: boolean }, dono: { papel: string; moldura: string | null } | null) {
	const mesa = molduraPorId(daMesa.id);
	if (mesa && daMesa.universal) return mesa;
	return (dono?.papel === 'jogador' ? molduraPorId(dono.moldura) : null) ?? mesa;
}
