// Efeitos de jutsu da Mesa com a vfx_workbench do PixelLab (gratuita para assinantes: monta o efeito com peças e
// renderiza, sem gastar gerações). Para cada estilo da lista: cria o efeito, põe as peças, exporta, baixa a folha e o
// JSON e guarda a prancha de conferência.
//   PIXELLAB_TOKEN=... node vfx-lote.cjs <saida> <specs.json> [estilo ...]
// specs.json: { "<estilo>": { "fps": 10, "partes": [{ add_part }], "patch": [ops de render, opcional] } }
// Saída: <saida>/<estilo>/{folha.png, folha.json, prancha*.png, efeito.txt}
const fs = require('fs');
const path = require('path');
const TOKEN = process.env.PIXELLAB_TOKEN;
const [saida, arqSpecs, ...so] = process.argv.slice(2);
const specs = JSON.parse(fs.readFileSync(arqSpecs, 'utf8'));

async function vfx(argv) {
	const res = await fetch('https://api.pixellab.ai/mcp', {
		method: 'POST',
		headers: { Authorization: `Bearer ${TOKEN}`, 'Content-Type': 'application/json', Accept: 'application/json, text/event-stream' },
		body: JSON.stringify({ jsonrpc: '2.0', id: Date.now(), method: 'tools/call', params: { name: 'vfx_workbench', arguments: { argv, mode: 'low' } } })
	});
	const raw = await res.text();
	const msg = raw.split('\n').filter((l) => l.startsWith('data: ')).map((l) => JSON.parse(l.slice(6))).at(-1);
	if (!msg || msg.error) throw new Error(JSON.stringify(msg ? msg.error : raw.slice(0, 400)));
	const c = msg.result.content ?? [];
	return { texto: c.filter((x) => x.type === 'text').map((x) => x.text).join('\n'), imagens: c.filter((x) => x.type === 'image').map((x) => x.data) };
}
const passo = (t) => /effect step: ([0-9a-f-]{36})/.exec(t)?.[1];

(async () => {
	for (const [estilo, spec] of Object.entries(specs)) {
		if (so.length && !so.includes(estilo)) continue;
		const dir = path.join(saida, estilo);
		fs.mkdirSync(dir, { recursive: true });
		try {
			let r = await vfx(['start', '--fps', String(spec.fps ?? 10)]);
			let id = passo(r.texto);
			r = await vfx([id, 'add_part', JSON.stringify({ parts: spec.partes })]);
			if (!passo(r.texto)) throw new Error(r.texto.slice(0, 600));
			id = passo(r.texto);
			if (spec.patch) {
				r = await vfx([id, 'render', JSON.stringify({ patch: spec.patch })]);
				id = passo(r.texto) ?? id;
			}
			r.imagens.forEach((b, i) => fs.writeFileSync(path.join(dir, `prancha${i}.png`), Buffer.from(b, 'base64')));
			const resumo = r.texto.split('\n').filter((l) => /render ok|warning|fit_canvas/.test(l)).join(' | ');
			const ex = await vfx([id, 'export', '--name', `Shinobi ${estilo}`]);
			const base = /download (https:\/\/\S+\/)/.exec(ex.texto)?.[1];
			const nome = /download \S+: ([\w-]+)\.gif/.exec(ex.texto)?.[1];
			if (!base || !nome) throw new Error(ex.texto.slice(0, 600));
			for (const ext of ['png', 'json', 'gif']) {
				const d = await fetch(`${base}${nome}.${ext}`);
				fs.writeFileSync(path.join(dir, ext === 'gif' ? 'efeito.gif' : `folha.${ext}`), Buffer.from(await d.arrayBuffer()));
			}
			fs.writeFileSync(path.join(dir, 'efeito.txt'), `${ex.texto}\n\n${resumo}\n`);
			console.log(`${estilo}: ok · ${resumo}`);
		} catch (e) {
			console.log(`${estilo}: ERRO ${String(e.message).slice(0, 500)}`);
		}
	}
})();
