// @ts-nocheck (roda no Node, na configuração do Vite; o projeto não tem os tipos do Node)
// Os ícones ficam 7 dias no cache do navegador (vercel.json). A URL leva um hash do conteúdo de static/icons e
// static/illustrations, para que um ícone trocado (um placeholder que virou arte) apareça sem esperar o cache vencer.
import { createHash } from 'node:crypto';
import { readdirSync, readFileSync } from 'node:fs';

export function hashIcones() {
	const h = createHash('sha1');
	for (const pasta of ['static/icons', 'static/illustrations'])
		for (const f of readdirSync(pasta, { recursive: true, withFileTypes: true })
			.filter((e) => e.isFile())
			.map((e) => `${e.parentPath}/${e.name}`.replace(/\\/g, '/'))
			.sort())
			h.update(f).update(readFileSync(f));
	return h.digest('hex').slice(0, 8);
}
