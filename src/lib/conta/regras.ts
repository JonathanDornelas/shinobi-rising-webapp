// Regras das telas de conta que não dependem do Supabase (testadas em regras.spec.ts).

/** Só aceita caminhos internos como destino de volta (evita redirecionar para outro site). */
export function destinoSeguro(volta: string | null | undefined, padrao = '/campanhas'): string {
	if (!volta || !volta.startsWith('/') || volta.startsWith('//') || volta.startsWith('/\\')) return padrao;
	if (volta.startsWith('/entrar') || volta.startsWith('/criar-conta') || volta.startsWith('/auth/')) return padrao;
	return volta;
}

export const SENHA_MINIMA = 8;

export interface ForcaSenha {
	/** 0 (vazia) a 4 (forte): quantos segmentos do medidor acendem. */
	nivel: 0 | 1 | 2 | 3 | 4;
	rotulo: string;
	dica: string;
}

/** Medidor de força da senha (A2): comprimento manda, variedade ajuda. */
export function forcaSenha(senha: string): ForcaSenha {
	if (!senha) return { nivel: 0, rotulo: '', dica: `Use ${SENHA_MINIMA} caracteres ou mais.` };
	if (senha.length < SENHA_MINIMA) return { nivel: 1, rotulo: 'fraca', dica: `use ${SENHA_MINIMA} caracteres ou mais` };
	const tipos = [/[a-z]/, /[A-Z]/, /\d/, /[^a-zA-Z\d]/].filter((r) => r.test(senha)).length;
	if (senha.length >= 12 && tipos >= 3) return { nivel: 4, rotulo: 'forte', dica: 'pronta para a missão' };
	if (senha.length >= 12 || tipos >= 3) return { nivel: 3, rotulo: 'média', dica: senha.length >= 12 ? 'misture números ou símbolos para ficar forte' : 'use 12+ caracteres para ficar forte' };
	return { nivel: 2, rotulo: 'fraca', dica: 'use 12+ caracteres e misture números' };
}

export function emailValido(email: string): boolean {
	return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}
