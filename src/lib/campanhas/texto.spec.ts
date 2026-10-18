import { describe, expect, it } from 'vitest';
import { regrasEmHtml } from './texto.ts';

describe('regrasEmHtml', () => {
	it('formata parágrafos, listas, títulos e ênfase', () => {
		expect(regrasEmHtml('## Sessões\nQuinzenais, **20h**.\n- PD *não* acumula\n- Mortes combinadas')).toBe(
			'<h3>Sessões</h3><p>Quinzenais, <b>20h</b>.</p><ul><li>PD <i>não</i> acumula</li><li>Mortes combinadas</li></ul>'
		);
	});
	it('escapa HTML', () => {
		expect(regrasEmHtml('<script>alert(1)</script> & "x"')).toBe('<p>&lt;script&gt;alert(1)&lt;/script&gt; &amp; &quot;x&quot;</p>');
	});
	it('quebra de linha simples vira <br> no mesmo parágrafo', () => {
		expect(regrasEmHtml('linha 1\nlinha 2\n\nnovo')).toBe('<p>linha 1<br>linha 2</p><p>novo</p>');
	});
});
