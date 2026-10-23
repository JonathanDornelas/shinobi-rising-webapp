// Onda 3 dos jutsus da wiki de Naruto: os elementos combinados (Kekkei Genkai e Kekkei Tōta) que ainda faltavam no
// catálogo, para a categoria de especialistas por elemento do bestiário. A tabela das combinações está no cap. 10.
// Uso: node scripts/livro/importar-jutsus.ts scripts/livro/wiki/onda-3.mjs [--gravar]
import combinados from './onda-3/combinados.mjs';

export const onda = 'onda 3';
export const jutsus = [...combinados];
