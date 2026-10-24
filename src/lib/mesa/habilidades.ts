// L11 · Mesa: os traços das fichas do bestiário (Bijūdama, Rugido, Agulhas…) viram habilidades usáveis na ficha rápida.
// O texto do traço diz a área ("área de 20 m de raio", "linha de 30 m", "a até 3 m dele"), a DT, os dados e se é uma
// vez por cena; daí saem a régua (o mesmo molde dos jutsus) e a rolagem.
import type { Regua } from './regua.ts';
import type { JutsuMesa } from './tipos.ts';

const slugDe = (s: string) =>
	s
		.toLowerCase()
		.normalize('NFD')
		.replace(/[̀-ͯ]/g, '')
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-|-$/g, '');

/** O que o traço faz na mesa: régua (ou nenhuma), dados de dano ou cura, Resistência e DT, uma vez por cena. */
export function habilidadeDoTraco(nome: string, texto: string, dtFicha: number | null, danoFicha: string | null): JutsuMesa {
	const t = texto.replace(/−/g, '-');
	const emVolta = /em volta d|ao redor d|de si\b|\bdele\b|\bdela\b/i.test(t);
	const raio = /área de (\d+) ?m(?: de raio)?/i.exec(t);
	const linha = /linha de (\d+) ?m/i.exec(t);
	const cone = /cone de (\d+) ?m/i.exec(t);
	const parede = /parede(?: de [a-zà-ú]+)?(?: de)?(?: até)? (\d+) ?m/i.exec(t);
	const ateAqui = /(?:cada um|todos|quem estiver)[^.:;]*a até (\d+) ?m/i.exec(t);
	const alcanceTexto = /a até (\d+) ?m/i.exec(t);

	let regua: Regua;
	let area = '';
	if (raio || (ateAqui && !linha && !cone)) {
		const n = +(raio ?? ateAqui)![1];
		const emSi = !raio || emVolta;
		const alc = emSi ? 0 : alcanceTexto && !ateAqui ? +alcanceTexto[1] : 30;
		regua = { alcance: alc, rotuloAlcance: alc ? `${alc === 30 ? 'Médio · ' : ''}${alc} m` : 'Pessoal', forma: 'esfera', n, emSi };
		area = emSi ? `Esfera ${n}m em torno de si` : `Esfera ${n}m`;
	} else if (linha) {
		regua = { alcance: 0, rotuloAlcance: 'Pessoal', forma: 'linha', n: +linha[1] };
		area = `Linha ${linha[1]}m`;
	} else if (cone) {
		regua = { alcance: 0, rotuloAlcance: 'Pessoal', forma: 'cone', n: +cone[1] };
		area = `Cone ${cone[1]}m`;
	} else if (parede) {
		const alc = alcanceTexto ? +alcanceTexto[1] : 10;
		regua = { alcance: alc, rotuloAlcance: `${alc} m`, forma: 'parede', n: +parede[1] };
		area = `Parede de ${parede[1]}m`;
	} else {
		regua = { alcance: null, rotuloAlcance: 'Sem régua', forma: 'nenhuma', n: 0 };
	}

	const dt = /DT (\d+)/i.exec(t)?.[1] ?? (dtFicha != null ? String(dtFicha) : null);
	const atributo = /Resistência de ([A-Za-zÀ-ú]+)/i.exec(t)?.[1] ?? /resiste com ([A-Za-zÀ-ú]+)/i.exec(t)?.[1] ?? null;
	const dados = /(\d+d\d+(?:\s*[+-]\s*\d+)?)/i.exec(t)?.[1]?.replace(/\s+/g, '') ?? (/dano da ficha/i.test(t) ? danoFicha : null);
	const cura = /(?:recupera|cura)\s+(\d+d\d+(?:\s*[+-]\s*\d+)?)/i.exec(t)?.[1]?.replace(/\s+/g, '') ?? null;
	return {
		slug: `traco-${slugDe(nome)}`,
		nome,
		rank: '',
		custo: 0,
		unidade: 'PC',
		alcance: regua.rotuloAlcance,
		area,
		regua,
		// "até o fim da cena" deixa o efeito no quadro; os outros são instantâneos
		turnos: /até o fim da cena|pela cena/i.test(t) ? null : /(\d+) turnos?/i.test(t) ? +/(\d+) turnos?/i.exec(t)![1] : undefined,
		resistencia: atributo && dt ? `Resistência de ${atributo}, DT ${dt}` : null,
		ataque: null,
		dano: dados && !cura ? { expr: dados, rotulo: `Dano · ${nome}`, partes: [] } : null,
		cura,
		texto: t,
		porCena: /uma vez por cena/i.test(t)
	};
}
