// Posiciona um popover (position: fixed) junto à âncora, dentro da janela.
export function posicionar(ancora: HTMLElement, largura: number, altura = 160) {
	const r = ancora.getBoundingClientRect();
	const margem = 12;
	const left = Math.min(Math.max(margem, r.left), innerWidth - largura - margem);
	const abaixo = r.bottom + 8;
	const top = abaixo + altura > innerHeight && r.top - altura - 8 > 0 ? r.top - altura - 8 : abaixo;
	return { left, top };
}
