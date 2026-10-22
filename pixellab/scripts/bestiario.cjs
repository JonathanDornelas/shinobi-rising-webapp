// Artes do bestiário (pixellab/bestiario.json): cada verbete com o seu formato (faixa, retrato, quadro, página)
// e o seu plano de câmera (close, médio, inteiro, aberto, de baixo, de cima, de costas, por trás).
//   node bestiario.cjs --seed 7701 <slug> [slug ...]   → pixellab/gerados/bestiario/<slug>-7701.png
//   node bestiario.cjs --seed 7701 --todos             → todos os verbetes que ainda não têm arte nessa seed
//   node bestiario.cjs --lista inicio --seed 1 capa-inicio → outra lista (pixellab/inicio.json)
//   node bestiario.cjs --saldo                         → quantas gerações cada conta ainda tem hoje
//   node bestiario.cjs --seed 9001 --paralelo 3 …      → 3 jobs ao mesmo tempo em cada conta
// Num pedido, "tamanho": [l, a] troca a tela do formato (até 170 px saem 4 candidatas: <slug>-<seed>.png, -b, -c, -d) e
// "edicao": { origem, instrucao } edita uma arte de gerados/ em vez de gerar (Pixen, 1 geração).
// Pedido com "referencia": a imagem do anime em pixellab/referencias/ (fora do git; baixada da wiki) entra como
// imagem inicial, e "forca" diz quanto do desenho dela fica (120–140: corpo, roupa e cores; pose e cena mudam).
// Contas: PIXELLAB_TOKEN (uma) e/ou PIXELLAB_CONTAS (arquivo com vários tokens: JSON [{token}] ou um por linha).
// Cada conta roda um job por vez (plano grátis); com várias contas, as artes saem em paralelo, e a conta que
// esgota a cota sai da fila sem parar as outras. Os jobs ficam em gerados/bestiario/jobs.json com o começo do
// token da conta: se o download falhar, rodar de novo só baixa (não gasta outra geração).
const fs = require("fs");
const zlib = require("zlib");
const path = require("path");
const ROOT = path.join(__dirname, "..");
// --lista <nome>: outra lista de pedidos no mesmo formato (pixellab/<nome>.json → gerados/<nome>/), como a da página inicial
const iLista = process.argv.indexOf("--lista");
const NOME_LISTA = iLista >= 0 ? process.argv.splice(iLista, 2)[1] : "bestiario";
const LISTA = JSON.parse(fs.readFileSync(path.join(ROOT, `${NOME_LISTA}.json`), "utf8"));
const OUT = path.join(ROOT, "gerados", NOME_LISTA);
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
  for (let i = 0; i < 24; i++) { // o Pro leva até 10 min
    await call(conta, "wait_for_jobs", { timeout_seconds: 50 });
    const r = await call(conta, "get_image", { job_id: jobId });
    if (/status: completed/.test(r.text) && r.images.length) {
      // o Pro devolve várias candidatas em telas de até 170 px: a primeira fica com o nome do pedido, as outras com -b, -c…
      r.images.forEach((img, k) => fs.writeFileSync(k ? arquivo.replace(/\.png$/, `-${String.fromCharCode(97 + k)}.png`) : arquivo, Buffer.from(img, "base64")));
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
    // "tamanho": tela menor que a do formato, na mesma proporção (até 170 px o Pro devolve 4 candidatas pelo mesmo custo)
    const [width, height] = v.tamanho || [LISTA.formatos[v.formato].width, LISTA.formatos[v.formato].height];
    const args = { description: descricao(v), width, height, ...LISTA.parametros, color_image_base64: paleta([...LISTA.paleta, ...(v.cores_extras || [])]), seed };
    // "partir_de": refaz uma tentativa anterior (img2img), guardando "forca" dela (500 quase não muda, 150 é uma edição visível)
    if (v.partir_de) Object.assign(args, { init_image_base64: fs.readFileSync(path.join(OUT, v.partir_de.arquivo)).toString("base64"), init_image_strength: v.partir_de.forca });
    // "referencia": imagem do anime (pixellab/referencias/…, fora do git) como imagem inicial, para o desenho ficar fiel
    else if (v.referencia && fs.existsSync(path.join(ROOT, v.referencia.arquivo)))
      Object.assign(args, { init_image_base64: fs.readFileSync(path.join(ROOT, v.referencia.arquivo)).toString("base64"), init_image_strength: v.referencia.forca });
    // Pro: referências do anime (url + o que tirar de cada uma), a imagem de estilo do padrão e a paleta do site com os
    // tons do anime; sai sem a imagem inicial do img2img, então a pose e a cena ficam livres
    const pro = !v.edicao && v.modelo !== "flash" && (v.modelo === "pro" || (LISTA.modelo === "pro" && v.modelo !== "pixflux"));
    let ferramenta = "create_image_pixflux";
    // "edicao": ajuste pontual numa arte já gerada (Pixen, 1 geração), que mantém a composição e muda só o que se pede
    if (v.edicao) {
      ferramenta = "edit_image_pixen";
      const origem = fs.readFileSync(path.join(OUT, v.edicao.origem));
      for (const k of Object.keys(args)) delete args[k];
      Object.assign(args, { description: v.edicao.instrucao, image_base64: origem.toString("base64"), width: origem.readUInt32BE(16), height: origem.readUInt32BE(20), no_background: false, seed });
    }
    // "flash": Pro Flash (6–9 gerações, sem referências do anime), com a mesma imagem de estilo e a mesma paleta do Pro
    if (v.modelo === "flash") {
      ferramenta = "create_image_pro_flash";
      Object.assign(args, {
        style_image: { base64: fs.readFileSync(path.join(ROOT, LISTA.imagem_estilo)).toString("base64"), usage_description: "the finish of the art: outlines, detail, shading and colors" },
        style_options: { color_palette: true, outline: true, detail: true, shading: true },
        palette: [...new Set([...LISTA.paleta, ...(LISTA.paleta_anime || []), ...(v.cores_extras || [])])]
      });
      for (const k of ["color_image_base64", "init_image_base64", "init_image_strength", "view", "outline", "shading", "detail", "text_guidance_scale"]) delete args[k];
    }
    if (pro) {
      ferramenta = "create_image_pro";
      const estilo = LISTA.imagem_estilo ? fs.readFileSync(path.join(ROOT, LISTA.imagem_estilo)).toString("base64") : null;
      for (const k of ["init_image_base64", "init_image_strength", "color_image_base64", "view", "outline", "shading", "detail", "text_guidance_scale"]) delete args[k];
      // a CDN da wiki recusa o servidor do PixelLab: a referência vai como arquivo (a foto tirada pelo Edge)
      const refs = (v.referencias || [])
        .filter((r) => r.url || fs.existsSync(path.join(ROOT, r.arquivo)))
        .map((r) => (r.url ? { url: r.url, usage: r.uso } : { base64: fs.readFileSync(path.join(ROOT, r.arquivo)).toString("base64"), usage: r.uso }));
      Object.assign(args, {
        reference_images: refs.length ? refs : null,
        style_image_base64: estilo,
        style_copy: ["outline", "detail", "shading"],
        palette: [...new Set([...LISTA.paleta, ...(LISTA.paleta_anime || []), ...(v.cores_extras || [])])]
      });
    }
    let r;
    for (let t = 0; t < 6; t++) {
      r = await call(conta, ferramenta, args);
      if (!/rate limit/i.test(r.text)) break;
      await call(conta, "wait_for_jobs", { timeout_seconds: 50 });
    }
    const m = r.text.match(/job_id: (\S+)/);
    if (!m) {
      console.log(`[${conta.nome}] ${nome} não enfileirou: ${r.text.replace(/\s+/g, " ").slice(0, 200)}`);
      // "rate limit" é só a fila cheia (jobs demais ao mesmo tempo), não cota esgotada
      return !/rate limit/i.test(r.text) && /generation|credit|balance|quota|limit|insufficient/i.test(r.text) ? "sem-cota" : "falhou";
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
  // --saldo: quanto cada conta ainda gera hoje (mostra só o começo do token)
  if (argv.includes("--saldo")) {
    let total = 0;
    for (const conta of contas()) {
      const t = (await call(conta, "get_balance", {})).text;
      const n = (k) => +(t.match(new RegExp(`${k}:\\s*\\$?([\\d.]+)`))?.[1] ?? 0);
      const livres = n("generations_remaining") + n("generations_today");
      total += livres;
      console.log(`[${conta.nome}] ${livres} gerações (plano ${n("generations_remaining")} + bônus do dia ${n("generations_today")}), créditos $${n("credits")}`);
    }
    console.log(`total: ${total} gerações disponíveis agora`);
    return;
  }
  const i = argv.indexOf("--seed");
  const seed = i >= 0 ? Number(argv.splice(i, 2)[1]) : NaN;
  // --paralelo N: N jobs ao mesmo tempo em cada conta (o plano pago aceita mais de um)
  const ip = argv.indexOf("--paralelo");
  const paralelo = ip >= 0 ? Number(argv.splice(ip, 2)[1]) : 1;
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
    await Promise.all(ativas.flatMap(c => Array(paralelo).fill(c)).map(async conta => {
      for (const v of fila.filter(v => dono(v) === conta.nome)) {
        if (!fila.includes(v)) continue; // outro job da mesma conta já pegou
        fila.splice(fila.indexOf(v), 1);
        await gerar(conta, v, seed, jobs);
      }
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
