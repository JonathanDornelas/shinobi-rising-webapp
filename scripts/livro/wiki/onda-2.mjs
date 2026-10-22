// Onda 2 dos jutsus da wiki de Naruto: o que sobrou de aprendível depois da onda 1 (elementais, areia da Linhagem
// Sabaku, clãs, Mokuton, taijutsu, espadas, selos, marionetes, sapos e Senjutsu). Os exclusivos continuam de fora.
// Uso: node scripts/livro/importar-jutsus.ts scripts/livro/wiki/onda-2.mjs [--gravar]
import elementais from './onda-2/elementais.mjs';
import areiaClas from './onda-2/areia-clas.mjs';
import taijutsuEspadas from './onda-2/taijutsu-espadas.mjs';
import selosMedicoGenjutsu from './onda-2/selos-medico-genjutsu.mjs';
import marionetesSaposOutros from './onda-2/marionetes-sapos-outros.mjs';

export const onda = 'onda 2';
export const jutsus = [...elementais, ...areiaClas, ...taijutsuEspadas, ...selosMedicoGenjutsu, ...marionetesSaposOutros];
