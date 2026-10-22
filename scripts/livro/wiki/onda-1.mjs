// Onda 1 dos jutsus da wiki de Naruto: os mais usados no mangá, ou com rank na wiki, que qualquer ninja pode aprender.
// Ficaram de fora os exclusivos (dōjutsu, Bijuu, Ōtsutsuki) e o que o livro já cobre por regra própria (Portões, controle
// de marionetes, invocação). Uso: node scripts/livro/importar-jutsus.ts scripts/livro/wiki/onda-1.mjs [--gravar]
import katonFuuton from './onda-1/katon-fuuton.mjs';
import suitonDoton from './onda-1/suiton-doton.mjs';
import raitonTaijutsu from './onda-1/raiton-taijutsu.mjs';
import genjutsuMedicoSelos from './onda-1/genjutsu-medico-selos.mjs';
import marionetesArmasEspaco from './onda-1/marionetes-armas-espaco.mjs';
import clonesMokutonOutros from './onda-1/clones-mokuton-outros.mjs';

export const onda = 'onda 1';
export const jutsus = [...katonFuuton, ...suitonDoton, ...raitonTaijutsu, ...genjutsuMedicoSelos, ...marionetesArmasEspaco, ...clonesMokutonOutros];
