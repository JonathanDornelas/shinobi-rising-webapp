export const load = async ({ parent }) => {
	const { campanha } = await parent();
	return { titulo: `Personagens · ${campanha.nome}`, navTitulo: 'PERSONAGENS' };
};
