import { describe, expect, it } from 'vitest';
import { destinoSeguro, emailValido, forcaSenha } from './regras.ts';

describe('destinoSeguro', () => {
	it('aceita caminhos internos', () => {
		expect(destinoSeguro('/convite/abc')).toBe('/convite/abc');
		expect(destinoSeguro('/campanhas/1?aba=membros')).toBe('/campanhas/1?aba=membros');
	});
	it('recusa destinos externos ou de conta', () => {
		expect(destinoSeguro('https://mal.example')).toBe('/campanhas');
		expect(destinoSeguro('//mal.example')).toBe('/campanhas');
		expect(destinoSeguro('/\\mal.example')).toBe('/campanhas');
		expect(destinoSeguro('/entrar')).toBe('/campanhas');
		expect(destinoSeguro(null, '/')).toBe('/');
	});
});

describe('forcaSenha', () => {
	it('sobe com comprimento e variedade', () => {
		expect(forcaSenha('').nivel).toBe(0);
		expect(forcaSenha('abc').nivel).toBe(1);
		expect(forcaSenha('abcdefgh').nivel).toBe(2);
		expect(forcaSenha('abcdefghijkl').nivel).toBe(3);
		expect(forcaSenha('Abcd1234').nivel).toBe(3);
		expect(forcaSenha('Kunai-de-Ferro9').nivel).toBe(4);
	});
});

describe('emailValido', () => {
	it('confere o formato básico', () => {
		expect(emailValido('aiko@exemplo.com')).toBe(true);
		expect(emailValido('aiko@exemplo')).toBe(false);
		expect(emailValido('')).toBe(false);
	});
});
