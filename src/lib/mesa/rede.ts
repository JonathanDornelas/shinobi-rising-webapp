// O que a Mesa sabe da própria rede. Sem isto, otimizar é adivinhar: o painel do Mestre (RedeMesa.svelte) mostra estes números, e são eles que dizem se vale trocar o aviso
// do banco ou mudar o banco de lugar (planos/replicacao-ao-vivo.md). As mensagens do caminho rápido saem numeradas: quem recebe percebe o que se perdeu, em vez de só
// descobrir na próxima releitura.

/** O número que uma mensagem do caminho rápido leva: quem mandou, a conexão dele e a ordem nela. */
export interface Carimbo {
	de: string;
	ep: string;
	n: number;
}

/** Um salto maior que isto não é perda: é número errado. O canal não confere quem manda, então o carimbo não pode fazer ninguém ignorar o Mestre até o fim da sessão. */
const SALTO_MAXIMO = 1000;

const carimboValido = (c: unknown): c is Carimbo => {
	const k = c as Partial<Carimbo> | null;
	return !!k && typeof k.de === 'string' && typeof k.ep === 'string' && Number.isInteger(k.n);
};

/** O que já chegou de cada um. */
export class Sequencias {
	private vistos = new Map<string, { ep: string; n: number }>();

	/** `velha`: passou uma mais nova na frente, e esta não vale mais. `perdidas`: quantas faltam antes desta. Sem carimbo (uma aba de antes do deploy), a mensagem vale. */
	conferir(carimbo: unknown): { velha: boolean; perdidas: number } {
		if (!carimboValido(carimbo)) return { velha: false, perdidas: 0 };
		const { de, ep, n } = carimbo;
		const visto = this.vistos.get(de);
		// a primeira de alguém, ou a primeira depois de ele reconectar: é daqui que se conta
		if (!visto || visto.ep !== ep) {
			this.vistos.set(de, { ep, n });
			return { velha: false, perdidas: 0 };
		}
		const salto = n - visto.n;
		if (salto <= 0) return { velha: salto > -SALTO_MAXIMO, perdidas: 0 };
		if (salto > SALTO_MAXIMO) return { velha: false, perdidas: 0 };
		visto.n = n;
		return { velha: false, perdidas: salto - 1 };
	}

	/** Esta tela caiu e releu tudo: o que veio antes não conta como perda. */
	esquecer() {
		this.vistos.clear();
	}
}

/** As últimas medidas de alguma coisa. */
export class Amostras {
	private lista: number[] = [];

	constructor(private tamanho = 40) {}

	somar(valor: number) {
		this.lista.push(valor);
		if (this.lista.length > this.tamanho) this.lista.shift();
	}
	get quantas() {
		return this.lista.length;
	}
	/** O valor que `q` das medidas não passam: 0,5 é a mediana. Null sem medida nenhuma. */
	quantil(q: number) {
		if (!this.lista.length) return null;
		const ordem = [...this.lista].sort((a, b) => a - b);
		return ordem[Math.min(ordem.length - 1, Math.floor(ordem.length * q))];
	}
}

/** O painel mostra quem respondeu há pouco: quem saiu não fica para sempre na lista. */
const VALIDADE_DA_IDA = 30_000;
/** A janela da conta de mensagens por segundo. */
const JANELA_DE_ENVIO = 10_000;

export interface ResumoDaRede {
	/** Até o servidor do canal, pelo batimento da conexão, que passa a cada 25 s. */
	servidor: number | null;
	/** Quanto o banco leva para confirmar o que o canal já trouxe. */
	confirmacao: { mediana: number | null; p95: number | null; quantas: number };
	/** Ida e volta pelo canal até cada pessoa. */
	pessoas: { usuario: string; ms: number }[];
	porSegundo: number;
	recusadas: number;
	perdidas: number;
	foraDeOrdem: number;
	releituras: number;
	quedas: number;
}

export class MedidorDeRede {
	servidor: number | null = null;
	readonly confirmacao = new Amostras();
	recusadas = 0;
	perdidas = 0;
	foraDeOrdem = 0;
	releituras = 0;
	quedas = 0;
	private idas = new Map<string, { amostras: Amostras; em: number }>();
	private envios: number[] = [];

	enviou(agora: number) {
		this.envios.push(agora);
		if (this.envios.length > 2000) this.envios.splice(0, 1000);
	}
	ida(usuario: string, ms: number, agora: number) {
		const atual = this.idas.get(usuario) ?? { amostras: new Amostras(12), em: agora };
		atual.amostras.somar(ms);
		atual.em = agora;
		this.idas.set(usuario, atual);
	}
	resumo(agora: number): ResumoDaRede {
		const pessoas = [...this.idas].filter(([, i]) => agora - i.em < VALIDADE_DA_IDA).map(([usuario, i]) => ({ usuario, ms: i.amostras.quantil(0.5) as number }));
		const recentes = this.envios.filter((t) => agora - t < JANELA_DE_ENVIO).length;
		return {
			servidor: this.servidor,
			confirmacao: { mediana: this.confirmacao.quantil(0.5), p95: this.confirmacao.quantil(0.95), quantas: this.confirmacao.quantas },
			pessoas: pessoas.sort((a, b) => b.ms - a.ms),
			porSegundo: recentes / (JANELA_DE_ENVIO / 1000),
			recusadas: this.recusadas,
			perdidas: this.perdidas,
			foraDeOrdem: this.foraDeOrdem,
			releituras: this.releituras,
			quedas: this.quedas
		};
	}
}

/** Em milissegundos, para ler. */
export const emMs = (v: number | null) => (v === null ? 'sem medida' : `${Math.round(v)} ms`);

/** Os números numa linha, para colar numa conversa. */
export function textoDaRede(r: ResumoDaRede, nome: (usuario: string) => string = (u) => u) {
	const pessoas = r.pessoas.map((p) => `${nome(p.usuario)} ${emMs(p.ms)}`).join(', ') || 'ninguém respondeu';
	const banco = `banco ${emMs(r.confirmacao.mediana)} (p95 ${emMs(r.confirmacao.p95)}, ${r.confirmacao.quantas} medidas)`;
	const envio = `${r.porSegundo.toFixed(1)} msg/s, ${r.recusadas} seguradas`;
	return `Rede da Mesa: servidor ${emMs(r.servidor)}; canal: ${pessoas}; ${banco}; ${envio}; ${r.perdidas} perdidas, ${r.foraDeOrdem} fora de ordem, ${r.releituras} releituras, ${r.quedas} quedas`;
}
