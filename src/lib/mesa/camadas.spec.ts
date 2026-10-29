import { describe, expect, it } from 'vitest';
import { CAMADAS_PADRAO, adicionar, alternarEmPe, camadaEmPe, camadaPadrao, camadasDaCena, indiceDaCamada, indiceDosTokens, mover, novaId, remover, renomear, type Camada } from './camadas.ts';

const pilha = (): Camada[] => CAMADAS_PADRAO.map((c) => ({ ...c }));
const ids = (l: readonly Camada[]) => l.map((c) => c.id);

describe('camadas da cena', () => {
	it('a pilha padrão é chão, meio, tokens e acima, e os tokens têm um lugar só', () => {
		expect(ids(CAMADAS_PADRAO)).toEqual(['chao', 'meio', 'tokens', 'acima']);
		expect(indiceDosTokens(CAMADAS_PADRAO)).toBe(2);
	});

	it('uma lista torta volta à padrão (sem camada de tokens, com repetida, vazia ou que não é lista)', () => {
		const padrao = ids(CAMADAS_PADRAO);
		expect(ids(camadasDaCena(null))).toEqual(padrao);
		expect(ids(camadasDaCena([]))).toEqual(padrao);
		expect(ids(camadasDaCena([{ id: 'a', nome: 'A' }]))).toEqual(padrao);
		expect(ids(camadasDaCena([{ id: 'a', nome: 'A', tipo: 'tokens' }, { id: 'a', nome: 'B' }]))).toEqual(padrao);
		expect(ids(camadasDaCena([{ id: 'a', nome: 'A', tipo: 'tokens' }, { id: 'b', nome: 'B', tipo: 'tokens' }]))).toEqual(padrao);
		expect(ids(camadasDaCena([{ id: 'Maiúscula!', nome: 'A', tipo: 'tokens' }]))).toEqual(padrao);
		expect(ids(camadasDaCena([{ id: 'a', nome: '  ', tipo: 'tokens' }]))).toEqual(padrao);
	});

	it('uma lista boa fica como está', () => {
		const l = [{ id: 'piso', nome: 'Piso' }, { id: 'tokens', nome: 'Tokens', tipo: 'tokens' }, { id: 'copas', nome: 'Copas', em_pe: true }];
		expect(camadasDaCena(l)).toEqual(l);
	});

	it('o índice e o "em pé" de uma camada que a cena não tem valem como o meio (logo abaixo dos tokens, em pé)', () => {
		const l = pilha();
		expect(indiceDaCamada('chao', l)).toBe(0);
		expect(indiceDaCamada('acima', l)).toBe(3);
		expect(indiceDaCamada('apagada', l)).toBe(1.5);
		expect(camadaEmPe('meio', l)).toBe(true);
		expect(camadaEmPe('chao', l)).toBe(false);
		expect(camadaEmPe('apagada', l)).toBe(true);
	});

	it('uma imagem nova cai na camada de imagens logo abaixo dos tokens, ou logo acima quando não há abaixo', () => {
		expect(camadaPadrao(pilha())).toBe('meio');
		expect(camadaPadrao([{ id: 'tokens', nome: 'T', tipo: 'tokens' }, { id: 'topo', nome: 'Topo' }])).toBe('topo');
		expect(camadaPadrao(mover(pilha(), 'meio', 3))).toBe('chao');
	});

	it('o id vem do nome, sem acento nem repetição', () => {
		expect(novaId('Árvores e Copas', [])).toBe('arvores-e-copas');
		expect(novaId('Chão', ['chao'])).toBe('chao-2');
		expect(novaId('Chão', ['chao', 'chao-2'])).toBe('chao-3');
		expect(novaId('???', [])).toBe('camada');
	});

	it('adicionar põe a camada nova no topo, com o nome aparado, e recusa nome vazio ou pilha cheia', () => {
		const l = adicionar(pilha(), '  Neblina ')!;
		expect(ids(l)).toEqual(['chao', 'meio', 'tokens', 'acima', 'neblina']);
		expect(l.at(-1)!.nome).toBe('Neblina');
		expect(adicionar(pilha(), '   ')).toBeNull();
		let cheia = pilha();
		for (let i = cheia.length; i < 24; i++) cheia = adicionar(cheia, `C${i}`)!;
		expect(cheia).toHaveLength(24);
		expect(adicionar(cheia, 'Mais uma')).toBeNull();
	});

	it('mover leva a camada para a posição pedida, empurrando as outras, e a dos tokens também anda', () => {
		expect(ids(mover(pilha(), 'acima', 0))).toEqual(['acima', 'chao', 'meio', 'tokens']);
		expect(ids(mover(pilha(), 'chao', 3))).toEqual(['meio', 'tokens', 'acima', 'chao']);
		expect(ids(mover(pilha(), 'tokens', 0))).toEqual(['tokens', 'chao', 'meio', 'acima']);
		expect(ids(mover(pilha(), 'chao', 99))).toEqual(['meio', 'tokens', 'acima', 'chao']);
		expect(ids(mover(pilha(), 'nao-existe', 0))).toEqual(ids(pilha()));
	});

	it('renomear e alternar "em pé" mexem só na camada pedida', () => {
		expect(renomear(pilha(), 'chao', ' Piso ').find((c) => c.id === 'chao')!.nome).toBe('Piso');
		expect(renomear(pilha(), 'chao', '  ').find((c) => c.id === 'chao')!.nome).toBe('Chão');
		const l = alternarEmPe(pilha(), 'chao');
		expect(l.find((c) => c.id === 'chao')!.em_pe).toBe(true);
		expect(alternarEmPe(l, 'chao').find((c) => c.id === 'chao')!.em_pe).toBeUndefined();
		expect(alternarEmPe(pilha(), 'meio').find((c) => c.id === 'meio')!.em_pe).toBeUndefined();
	});

	it('apagar manda as imagens para a camada de imagens de baixo (ou a de cima) e protege os tokens e a última camada', () => {
		const r = remover(pilha(), 'meio')!;
		expect(ids(r.lista)).toEqual(['chao', 'tokens', 'acima']);
		expect(r.destino).toBe('chao');
		expect(remover(pilha(), 'chao')!.destino).toBe('meio');
		expect(remover(pilha(), 'acima')!.destino).toBe('meio');
		expect(remover(pilha(), 'tokens')).toBeNull();
		expect(remover([{ id: 'tokens', nome: 'T', tipo: 'tokens' }, { id: 'so', nome: 'Só' }], 'so')).toBeNull();
		expect(remover(pilha(), 'nao-existe')).toBeNull();
	});
});
