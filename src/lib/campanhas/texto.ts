// Formatação simples das regras da mesa (C7): **negrito**, *itálico*, "- " para listas e "## " para títulos.
// Escapa o HTML antes de aplicar as marcas, então o resultado é seguro para {@html}.

const escapar = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');

const embutido = (s: string) =>
	escapar(s)
		.replace(/\*\*(.+?)\*\*/g, '<b>$1</b>')
		.replace(/(^|[^*])\*(?!\s)(.+?)\*/g, '$1<i>$2</i>');

export function regrasEmHtml(texto: string): string {
	const saida: string[] = [];
	let lista: string[] = [];
	let paragrafo: string[] = [];
	const fecharLista = () => {
		if (lista.length) saida.push(`<ul>${lista.map((l) => `<li>${l}</li>`).join('')}</ul>`);
		lista = [];
	};
	const fecharParagrafo = () => {
		if (paragrafo.length) saida.push(`<p>${paragrafo.join('<br>')}</p>`);
		paragrafo = [];
	};
	for (const linha of texto.replace(/\r\n?/g, '\n').split('\n')) {
		const t = linha.trim();
		if (/^[-•*]\s+/.test(t)) {
			fecharParagrafo();
			lista.push(embutido(t.replace(/^[-•*]\s+/, '')));
		} else if (/^#{1,3}\s+/.test(t)) {
			fecharParagrafo();
			fecharLista();
			saida.push(`<h3>${embutido(t.replace(/^#{1,3}\s+/, ''))}</h3>`);
		} else if (!t) {
			fecharParagrafo();
			fecharLista();
		} else {
			fecharLista();
			paragrafo.push(embutido(t));
		}
	}
	fecharParagrafo();
	fecharLista();
	return saida.join('');
}
