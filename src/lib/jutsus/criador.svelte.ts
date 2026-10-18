// Estado do criador de jutsu (J2): o jutsu em edição, a seção aberta e o que é recalculado a cada escolha.
import { analisarJutsu, calcularJutsu, efeitoSugerido, infoAutomatica, infoFinal, paraJutsuLivro, resumoJutsu, type ContextoJutsu, type JutsuDados } from './regras.ts';

export class CriadorJutsu {
	dados: JutsuDados = $state()!;
	aberta = $state(0);
	ctx: ContextoJutsu = $state({});
	readonly editavel: boolean;
	readonly origem: string;

	constructor(dados: JutsuDados, ctx: ContextoJutsu, origem: string, editavel: boolean) {
		this.dados = dados;
		this.ctx = ctx;
		this.origem = origem;
		this.editavel = editavel;
		this.aberta = editavel ? 0 : -1;
	}

	// $derived.by com função: só é avaliado na primeira leitura, depois do construtor.
	calc = $derived.by(() => calcularJutsu(this.dados));
	auto = $derived.by(() => infoAutomatica(this.dados, this.calc));
	info = $derived.by(() => infoFinal(this.dados, this.calc));
	analise = $derived.by(() => analisarJutsu(this.dados, this.ctx, this.calc));
	card = $derived.by(() => paraJutsuLivro('previa', this.dados, this.origem, this.calc));
	resumo = $derived.by(() => resumoJutsu(this.dados));
	sugestao = $derived.by(() => efeitoSugerido(this.dados));

	alternar(secao: number) {
		this.aberta = this.aberta === secao ? -1 : secao;
	}

	/** Liga/desliga ou muda a quantidade de um componente (0 tira). */
	definir(id: string, valor: number) {
		if (!this.editavel) return;
		if (valor) this.dados.componentes[id] = valor;
		else delete this.dados.componentes[id];
	}
}
