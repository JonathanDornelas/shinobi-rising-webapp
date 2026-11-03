// Miniaturas da Mesa em lote, na direção escolhida ("Fiel à arte"): para cada estágio do bestiário ainda sem miniatura,
// o PixelLab desenha o personagem de pé, em postura de combate, nas 8 direções, a partir da própria arte do estágio
// (create_character, modo pro, a arte como conceito). A fila segue o bestiário com os clãs primeiro; cada conta roda
// `paralelo` trabalhos de cada vez (1, se o arquivo de contas não disser) e só enquanto tem saldo para eles (10 gerações). As 8 direções vão para pixellab/miniaturas/<id>/ e a
// miniatura entra em pixellab/miniaturas/catalogo.json; depois, `npx tsx scripts/mesa/miniaturas.ts` monta as tiras.
// Cada miniatura tem a sua pose, escrita à mão em pixellab/miniaturas/poses.json (o jeito do personagem e a técnica do clã):
// estágio sem pose fica fora da fila, nunca numa pose genérica.
//
//   PIXELLAB_TOKEN=... PIXELLAB_CONTAS=contas.json node pixellab/scripts/miniaturas.mjs [--max N] [--clas] [--so slug#estagio ...] [--ver]
//   contas.json: [{ "token": "...", "paralelo": 3 }]. --clas: só os clãs. --ver: só lista a fila e o saldo, sem gerar.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const RAIZ = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const SITE = 'https://shinobi-rising-webapp.vercel.app';
const CUSTO = 10;
const RUMOS = ['south', 'south-east', 'east', 'north-east', 'north', 'north-west', 'west', 'south-west'];

const args = process.argv.slice(2);
const opc = (k) => (args.includes(k) ? args[args.indexOf(k) + 1] : null);
const max = Number(opc('--max') ?? Infinity);
const so = args.flatMap((a, i) => (args[i - 1] === '--so' ? [a] : []));
const soVer = args.includes('--ver');
const soClas = args.includes('--clas');

const contas = [
	...(process.env.PIXELLAB_TOKEN ? [{ nome: 'principal', token: process.env.PIXELLAB_TOKEN }] : []),
	...(process.env.PIXELLAB_CONTAS ? JSON.parse(fs.readFileSync(process.env.PIXELLAB_CONTAS, 'utf8')).map((c, i) => ({ nome: `extra ${i + 1}`, token: c.token, paralelo: Math.max(1, Number(c.paralelo) || 1) })) : [])
];
if (!contas.length) throw new Error('Passe PIXELLAB_TOKEN e/ou PIXELLAB_CONTAS.');

async function chamar(token, name, a) {
	const res = await fetch('https://api.pixellab.ai/mcp', {
		method: 'POST',
		headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json', Accept: 'application/json, text/event-stream' },
		body: JSON.stringify({ jsonrpc: '2.0', id: Date.now(), method: 'tools/call', params: { name, arguments: a } })
	});
	const raw = await res.text();
	const l = raw.split('\n').filter((x) => x.startsWith('data: ')).at(-1);
	const msg = JSON.parse(l ? l.slice(6) : raw);
	if (msg.error) throw new Error(JSON.stringify(msg.error));
	return (msg.result.content ?? []).filter((x) => x.type === 'text').map((x) => x.text).join('\n');
}
async function saldo(token) {
	const t = await chamar(token, 'get_balance', {});
	const plano = Number(/generations_remaining: (\d+)/.exec(t)?.[1] ?? 0);
	const hoje = Number(/generations_today: (\d+)/.exec(t)?.[1] ?? 0);
	return plano > 0 ? plano : hoje;
}

// ------------------------------------------------------------------ a fila
const bestiario = JSON.parse(fs.readFileSync(path.join(RAIZ, 'src', 'lib', 'livro', 'gerado', 'bestiario.json'), 'utf8')).criaturas;
const pedidos = JSON.parse(fs.readFileSync(path.join(RAIZ, 'pixellab', 'bestiario.json'), 'utf8')).verbetes;
const arqCatalogo = path.join(RAIZ, 'pixellab', 'miniaturas', 'catalogo.json');
const catalogo = JSON.parse(fs.readFileSync(arqCatalogo, 'utf8'));
const poses = JSON.parse(fs.readFileSync(path.join(RAIZ, 'pixellab', 'miniaturas', 'poses.json'), 'utf8'));
const feitos = new Set(catalogo.filter((m) => m.estilo === 'Fiel à arte').map((m) => m.verbete));

/**
 * A descrição da miniatura: quem é (o pedido da arte até a idade, com o gênero e sem a cena, ou o `quem` escrito à mão) e
 * a pose dela.
 */
function descricao(pedido, id) {
	const { pose, quem } = poses[id];
	const p = pedido.prompt;
	const corte = /(.*?, (?:a |an )?(?:teenager|young adult|adult|elderly|old man|old woman|elder|middle-aged[^,]*|child)),\s*(.*)$/i.exec(p);
	const cabeca = corte ? corte[1] : p.split(',').slice(0, 4).join(',');
	const cena = corte ? corte[2].slice(0, 80).toLowerCase() : '';
	const genero = /\b(woman|girl|kunoichi|she|her|lady|mother)\b/.test(cena) ? 'female' : /\b(man|boy|he|his|father|monk)\b/.test(cena) ? 'male' : '';
	return `${quem ?? `${cabeca}${genero ? `, ${genero}` : ''}`}. Pose: ${pose}. Full body, facing the viewer. Keep the look of the concept art (face, hair, outfit and colors), only the pose changes.`;
}

const ordem = [...bestiario].sort((a, b) => Number(!a.slug.startsWith('cla-')) - Number(!b.slug.startsWith('cla-')));
const fila = ordem.flatMap((c) =>
	c.estagios
		.map((e) => ({ c, e, verbete: `${c.slug}#${e.slug}`, id: `${c.slug}--${e.slug}`.slice(0, 60), pedido: pedidos.find((p) => p.slug === `${c.slug}--${e.slug}`) ?? pedidos.find((p) => p.slug === c.slug) }))
		.filter((x) => !feitos.has(x.verbete) && x.pedido && (!so.length || so.includes(x.verbete)) && (!soClas || x.c.slug.startsWith('cla-')))
		.filter((x) => !fs.existsSync(path.join(RAIZ, 'pixellab', 'miniaturas', x.id, 'south-west.png')))
);
const semPose = fila.filter((x) => !poses[x.id]);
if (semPose.length) console.log(`sem pose escrita (ficam fora): ${semPose.length}${semPose.length < 12 ? ` (${semPose.map((x) => x.id).join(', ')})` : ''}`);
fila.splice(0, fila.length, ...fila.filter((x) => poses[x.id]));
console.log(`fila: ${fila.length} estágios sem miniatura (${fila.filter((x) => x.c.slug.startsWith('cla-')).length} de clãs)`);

// ------------------------------------------------------------------ um trabalho
async function fazer(conta, x) {
	const arte = x.e.arte?.arquivo?.split('?')[0];
	if (!arte) throw new Error('estágio sem arte');
	const nome = `${x.c.nome.split(',')[0]}, ${x.e.nome}`;
	const t = await chamar(conta.token, 'create_character', { mode: 'pro', size: 80, concept_image_url: `${SITE}${arte}`, description: descricao(x.pedido, x.id), name: `Miniatura · ${nome}` });
	const id = /character_id[":\s]+([0-9a-f-]{36})/.exec(t)?.[1] ?? /^id: ([0-9a-f-]{36})/m.exec(t)?.[1];
	if (!id) throw new Error(t.slice(0, 300));
	const inicio = Date.now();
	for (;;) {
		await new Promise((r) => setTimeout(r, 20000));
		const g = await chamar(conta.token, 'get_character', { character_id: id });
		const cabeca = g.split('\n').slice(0, 3).join(' ');
		if (/failed|error/i.test(cabeca)) throw new Error(cabeca);
		if (/status: (creating|processing|queued|pending|generating|running|rotating)/i.test(cabeca)) {
			if (Date.now() - inicio > 20 * 60e3) throw new Error(`demorou demais (${id})`);
			continue;
		}
		const urls = [...g.matchAll(/(south-east|south-west|north-east|north-west|south|north|east|west)\b[^\n]*?(https:\/\/\S+?\.png)/g)];
		if (urls.length < 8) throw new Error(`concluído com ${urls.length} direções (${id})`);
		const dir = path.join(RAIZ, 'pixellab', 'miniaturas', x.id);
		fs.mkdirSync(dir, { recursive: true });
		for (const [, rumo, url] of urls) fs.writeFileSync(path.join(dir, `${rumo}.png`), Buffer.from(await (await fetch(url)).arrayBuffer()));
		if (!RUMOS.every((r) => fs.existsSync(path.join(dir, `${r}.png`)))) throw new Error('faltou direção');
		// o catálogo é relido e regravado a cada miniatura (as contas trabalham juntas)
		const cat = JSON.parse(fs.readFileSync(arqCatalogo, 'utf8'));
		cat.push({ id: x.id, verbete: x.verbete, nome, estilo: 'Fiel à arte', personagem: id });
		fs.writeFileSync(arqCatalogo, JSON.stringify(cat, null, '\t') + '\n');
		return nome;
	}
}

// ------------------------------------------------------------------ as contas trabalham juntas, uma miniatura por vez cada
let proxima = 0;
let feitas = 0;
await Promise.all(
	contas.map(async (conta) => {
		const tem = await saldo(conta.token).catch(() => 0);
		console.log(`${conta.nome}: ${tem} gerações, ${conta.paralelo ?? 1} de cada vez`);
		if (soVer) return;
		// o saldo é dividido entre os trabalhos da conta: cada um só começa se ainda sobra para ele
		let reservado = 0;
		await Promise.all(
			Array.from({ length: conta.paralelo ?? 1 }, async () => {
				while (tem - reservado >= CUSTO && proxima < fila.length && feitas < max) {
					const x = fila[proxima++];
					feitas++;
					reservado += CUSTO;
					try {
						const nome = await fazer(conta, x);
						console.log(`${conta.nome}: ${x.id} pronta (${nome})`);
					} catch (e) {
						console.log(`${conta.nome}: ${x.id} ERRO ${String(e.message).slice(0, 300)}`);
					}
				}
			})
		);
	})
);
console.log(soVer ? fila.slice(0, 8).map((x) => `${x.verbete}: ${descricao(x.pedido, x.id)}`).join('\n\n') : `feitas nesta rodada: ${feitas}; faltam ${Math.max(0, fila.length - proxima)}`);
