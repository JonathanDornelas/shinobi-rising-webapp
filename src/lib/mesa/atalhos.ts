// Os atalhos da Mesa: a lista que o quadro "?" mostra e, para as ferramentas, a mesma que o tratador de teclas da página
// usa (uma tecla nova entra aqui e aparece nos dois lugares).
import type { Ferramenta } from './mesa.svelte.ts';

/** Tecla de cada ferramenta; `mestre`: só para o Mestre. */
export const TECLAS_FERRAMENTA: { tecla: string; ferramenta: Ferramenta; nome: string; mestre?: boolean }[] = [
	{ tecla: 'v', ferramenta: 'mover', nome: 'Mover' },
	{ tecla: 'm', ferramenta: 'medir', nome: 'Medir' },
	{ tecla: 'l', ferramenta: 'lapis', nome: 'Lápis' },
	{ tecla: 'p', ferramenta: 'apontar', nome: 'Apontar' },
	{ tecla: 'e', ferramenta: 'borracha', nome: 'Borracha' },
	{ tecla: 'a', ferramenta: 'alfinete', nome: 'Alfinete' },
	{ tecla: 'x', ferramenta: 'texto', nome: 'Texto' },
	{ tecla: 't', ferramenta: 'terreno', nome: 'Terreno difícil', mestre: true },
	{ tecla: 'o', ferramenta: 'objeto', nome: 'Objeto', mestre: true },
	{ tecla: 'f', ferramenta: 'nevoa', nome: 'Névoa', mestre: true }
];

export interface Atalho {
	teclas: string[];
	acao: string;
	mestre?: boolean;
}

/** Os outros atalhos, agrupados como aparecem no quadro "?". */
export const ATALHOS: { grupo: string; itens: Atalho[] }[] = [
	{
		grupo: 'Quadro',
		itens: [
			{ teclas: ['Alt', 'clique'], acao: 'Ping no mapa' },
			{ teclas: ['Shift', 'Alt', 'clique'], acao: 'Olhem aqui: leva a vista de todos até o ponto', mestre: true },
			{ teclas: ['Roda do mouse'], acao: 'Zoom' },
			{ teclas: ['Espaço', 'arrastar'], acao: 'Mover a vista (ou arrastar com o botão do meio do mouse)' },
			{ teclas: ['[ ou ]'], acao:'Girar a vista isométrica (ou a forma do jutsu na mira)' },
			{ teclas: ['I'], acao: 'Modo imersivo: só o quadro na tela' },
			{ teclas: ['?'], acao: 'Este quadro de atalhos' }
		]
	},
	{
		grupo: 'Tokens e objetos',
		itens: [
			{ teclas: ['Setas'], acao: 'Andar 1 m com o token selecionado' },
			{ teclas: ['Setas'], acao: 'Empurrar o objeto selecionado (Shift: 1 m)' },
			{ teclas: ['Delete'], acao: 'Tirar o objeto selecionado' },
			{ teclas: ['H'], acao: 'Esconder ou mostrar o token selecionado', mestre: true },
			{ teclas: ['Ctrl', 'Z'], acao: 'Desfazer o último movimento, traço ou objeto' }
		]
	},
	{
		grupo: 'Combate',
		itens: [{ teclas: ['N'], acao: 'Próximo turno', mestre: true }]
	},
	{
		grupo: 'Geral',
		itens: [{ teclas: ['Esc'], acao: 'Fechar o que está aberto, cancelar a régua ou a mira' }]
	}
];
