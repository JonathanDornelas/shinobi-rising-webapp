// Artes do bestiário (pixellab/bestiario.json): cada verbete com o seu formato (faixa, retrato, quadro, página)
// e o seu plano de câmera (close, médio, inteiro, aberto, de baixo, de cima, de costas, por trás).
//   node bestiario.cjs --seed 7701 <slug> [slug ...]   → pixellab/gerados/bestiario/<slug>-7701.png
//   node bestiario.cjs --seed 7701 --todos             → todos os verbetes que ainda não têm arte nessa seed
// Contas: PIXELLAB_TOKEN (uma) e/ou PIXELLAB_CONTAS (arquivo com vários tokens: JSON [{token}] ou um por linha).
// Cada conta roda um job por vez (plano grátis); com várias contas, as artes saem em paralelo, e a conta que
// esgota a cota sai da fila sem parar as outras. Os jobs ficam em gerados/bestiario/jobs.json com o começo do
// token da conta: se o download falhar, rodar de novo só baixa (não gasta outra geração).
const fs = require("fs");
const zlib = require("zlib");
const path = require("path");
const ROOT = path.join(__dirname, "..");
const LISTA = JSON.parse(fs.readFileSync(path.join(ROOT, "bestiario.json"), "utf8"));
const OUT = path.join(ROOT, "gerados", "bestiario");
const JOBS = path.join(OUT, "jobs.json");

// PNG de 1 linha com as cores da paleta (o PixelLab só lê as cores de color_image).
function paleta(cores) {
  const px = Buffer.from([0, ...cores.flatMap(h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16)))]);
  const bloco = (tipo, dados) => {
    const t = Buffer.concat([Buffer.from(tipo), dados]), b = Buffer.alloc(8 + dados.length + 4);
    b.writeUInt32BE(dados.length, 0); t.copy(b, 4); b.writeUInt32BE(zlib.crc32(t), 8 + dados.length);
    return b;
  };
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(cores.length, 0); ihdr.writeUInt32BE(1, 4); ihdr[8] = 8; ihdr[9] = 2;
  return Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), bloco("IHDR", ihdr), bloco("IDAT", zlib.deflateSync(px)), bloco("IEND", Buffer.alloc(0))]).toString("base64");
}

function contas() {
  const tokens = [];
  if (process.env.PIXELLAB_CONTAS) {
    const t = fs.readFileSync(process.env.PIXELLAB_CONTAS, "utf8");
    try { for (const c of JSON.parse(t)) tokens.push(typeof c === "string" ? c : c.token); }
    catch { tokens.push(...t.split(/\s+/).filter(Boolean)); }
  }
  if (process.env.PIXELLAB_TOKEN) tokens.push(process.env.PIXELLAB_TOKEN);
  return [...new Set(tokens)].map(token => ({ token, nome: token.slice(0, 8) }));
}

async function call(conta, name, args) {
  const res = await fetch("https://api.pixellab.ai/mcp", {
    method: "POST",
    headers: { Authorization: `Bearer ${conta.token}`, "Content-Type": "application/json", Accept: "application/json, text/event-stream" },
    body: JSON.stringify({ jsonrpc: "2.0", id: Date.now(), method: "tools/call", params: { name, arguments: args } }),
  });
  const raw = await res.text();
  const msgs = raw.split("\n").filter(l => l.startsWith("data: ")).map(l => JSON.parse(l.slice(6)));
  const msg = msgs[msgs.length - 1];
  if (!msg || msg.error) throw new Error(JSON.stringify(msg ? msg.error : raw.slice(0, 500)));
  const content = msg.result.content || [];
  return { text: content.filter(c => c.type === "text").map(c => c.text).join("\n"), images: content.filter(c => c.type === "image").map(c => c.data) };
}

async function baixar(conta, jobId, arquivo) {
  for (let i = 0; i < 12; i++) {
    await call(conta, "wait_for_jobs", { timeout_seconds: 50 });
    const r = await call(conta, "get_image", { job_id: jobId });
    if (/status: completed/.test(r.text) && r.images.length) {
      fs.writeFileSync(arquivo, Buffer.from(r.images[0], "base64"));
      return true;
    }
    if (/status: failed|error/i.test(r.text) && !/processing|pending/.test(r.text)) { console.log(r.text.slice(0, 300)); return false; }
  }
  return false;
}

function descricao(v) {
  const camera = [].concat(v.plano || []).map(p => LISTA.planos[p].prompt);
  return [...camera, v.prompt, LISTA.formatos[v.formato].prompt].join(", ") + LISTA.estilo;
}

// "ok", "falhou" ou "sem-cota" (a conta esgotou: o item volta para a fila de outra conta).
async function gerar(conta, v, seed, jobs) {
  const nome = `${v.slug}-${seed}`;
  const arquivo = path.join(OUT, `${nome}.png`);
  let job = typeof jobs[nome] === "string" ? { id: jobs[nome], conta: null } : jobs[nome];
  if (job && job.conta && job.conta !== conta.nome) return "outra-conta";
  if (!job) {
    const { width, height } = LISTA.formatos[v.formato];
    const args = { description: descricao(v), width, height, ...LISTA.parametros, color_image_base64: paleta([...LISTA.paleta, ...(v.cores_extras || [])]), seed };
    // "partir_de": refaz uma tentativa anterior (img2img), guardando "forca" dela (500 quase não muda, 150 é uma edição visível)
    if (v.partir_de) Object.assign(args, { init_image_base64: fs.readFileSync(path.join(OUT, v.partir_de.arquivo)).toString("base64"), init_image_strength: v.partir_de.forca });
    let r;
    for (let t = 0; t < 6; t++) {
      r = await call(conta, "create_image_pixflux", args);
      if (!/rate limit/i.test(r.text)) break;
      await call(conta, "wait_for_jobs", { timeout_seconds: 50 });
    }
    const m = r.text.match(/job_id: (\S+)/);
    if (!m) {
      console.log(`[${conta.nome}] ${nome} não enfileirou: ${r.text.replace(/\s+/g, " ").slice(0, 200)}`);
      return /generation|credit|balance|quota|limit|insufficient/i.test(r.text) ? "sem-cota" : "falhou";
    }
    job = { id: m[1], conta: conta.nome };
    jobs[nome] = job;
    fs.writeFileSync(JOBS, JSON.stringify(jobs, null, 1));
  }
  const ok = await baixar(conta, job.id, arquivo);
  console.log(`[${conta.nome}] ${nome} ${ok ? "ok" : "FALHOU"}`);
  return ok ? "ok" : "falhou";
}

(async () => {
  const argv = process.argv.slice(2);
  const i = argv.indexOf("--seed");
  const seed = i >= 0 ? Number(argv.splice(i, 2)[1]) : NaN;
  const todos = argv.includes("--todos");
  const verbetes = todos ? LISTA.verbetes : argv.map(s => LISTA.verbetes.find(v => v.slug === s) || console.log("verbete desconhecido:", s)).filter(Boolean);
  const lista = contas();
  if (Number.isNaN(seed) || !verbetes.length || !lista.length) {
    console.log("uso: PIXELLAB_TOKEN=… node bestiario.cjs --seed <n> (<slug> … | --todos)");
    return;
  }
  fs.mkdirSync(OUT, { recursive: true });
  const jobs = fs.existsSync(JOBS) ? JSON.parse(fs.readFileSync(JOBS, "utf8")) : {};
  const fila = verbetes.filter(v => !fs.existsSync(path.join(OUT, `${v.slug}-${seed}.png`)));
  // Um job que já foi enfileirado só pode ser baixado pela conta que o criou: ele vai direto para ela.
  const dono = v => { const j = jobs[`${v.slug}-${seed}`]; return j && j.conta; };
  // Rodadas: o item que volta de uma conta esgotada é refeito pelas contas que ainda têm cota.
  const esgotadas = new Set();
  for (;;) {
    const ativas = lista.filter(c => !esgotadas.has(c.nome)), antes = fila.length, esgotadasAntes = esgotadas.size;
    await Promise.all(ativas.map(async conta => {
      for (const v of fila.filter(v => dono(v) === conta.nome)) { fila.splice(fila.indexOf(v), 1); await gerar(conta, v, seed, jobs); }
      while (fila.length) {
        const k = fila.findIndex(v => !dono(v));
        if (k < 0) return;
        const [v] = fila.splice(k, 1);
        if ((await gerar(conta, v, seed, jobs)) === "sem-cota") { esgotadas.add(conta.nome); fila.push(v); return; }
      }
    }));
    if (!fila.length || (fila.length >= antes && esgotadas.size === esgotadasAntes) || esgotadas.size === lista.length) break;
  }
  if (fila.length) console.log("Ficaram sem conta com cota:", fila.map(v => v.slug).join(", "));
})();
