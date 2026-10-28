// Compressão das imagens que o usuário envia (retratos, fotos de NPC, avatar, imagens da Mesa): reencodar no navegador
// também tira os metadados (EXIF, GPS). Gera o webp sem perda e um com perda quase invisível (0,92) e fica com o sem
// perda quando ele não passa de 15% acima do outro, o que acontece com pixel art e capturas de tela.

const blob = (tela: HTMLCanvasElement, qualidade: number) => new Promise<Blob | null>((ok) => tela.toBlob(ok, 'image/webp', qualidade));

export async function codificarWebp(tela: HTMLCanvasElement): Promise<Blob> {
	const [semPerda, leve] = await Promise.all([blob(tela, 1), blob(tela, 0.92)]);
	const melhor = semPerda && leve ? (semPerda.size <= leve.size * 1.15 ? semPerda : leve) : (semPerda ?? leve);
	if (!melhor) throw new Error('Não foi possível gerar a imagem.');
	return melhor;
}
