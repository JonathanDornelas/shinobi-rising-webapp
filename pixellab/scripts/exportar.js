// Junta os ícones gerados, pós-processa, instala em static/icons e monta o pacote para o Claude Design.
//   node exportar.js
const fs = require("fs");
const path = require("path");
const { execFileSync } = require("child_process");
const { decode, encode } = require("./pngtool.js");

const PX = path.join(__dirname, "..");
const ROOT = path.join(PX, "..");
const STATIC = path.join(ROOT, "static", "icons");
const EXP = path.join(PX, "export-claude-design");
const J = JSON.parse(fs.readFileSync(path.join(PX, "icones-p1.json"), "utf8"));
const EDGE = "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe";

// ---------- catalogue: id -> metadata ----------
const meta = {};
J.sementes.forEach(s => meta[s.id] = { id: s.id, alt: s.alt, metodo: s.metodo, origem: "semente" });
J.lotes.forEach(l => l.itens.forEach(i => { if (!meta[i.id]) meta[i.id] = { id: i.id, alt: i.alt, metodo: "PixelLab lote " + l.id, origem: "lote", prioridade: i.prioridade }; }));
J.canonicos.itens.forEach(i => meta[i.id] = { id: i.id, alt: i.alt, metodo: "canônico: " + i.referencia + " → PixelLab img2img", origem: "canonico" });
(J.canonicos.p2 || []).forEach(i => meta[i.id] = { id: i.id, alt: i.alt, metodo: "canônico: " + i.referencia + " → PixelLab img2img", origem: "canonico", prioridade: "P2" });
J.desenho_em_codigo.itens.forEach(i => meta[i.id] = { id: i.id, alt: i.alt, metodo: "desenho em código", origem: "desenho" });
const catOf = id => id.split("-")[0];

// ---------- sources, later ones override earlier ones ----------
const sources = [];
const addDir = (dir, label) => { if (!fs.existsSync(dir)) return; for (const f of fs.readdirSync(dir)) if (f.endsWith(".png")) {
  const id = f.replace(/^seed-/, "").replace(/\.png$/, ""); if (meta[id]) sources.push({ id, file: path.join(dir, f), label }); } };
const SEM = path.join(PX, "gerados", "sementes");   // originais intocados (static/icons é saída)
J.sementes.forEach(s => sources.push({ id: s.id, file: path.join(SEM, s.id + ".png"), label: "semente" }));
addDir(path.join(PX, "gerados", "lote-a"), "lote-a");
addDir(path.join(PX, "gerados", "lote-b"), "lote-b");          // includes the 4 redos of lote A
addDir(path.join(PX, "gerados", "lote-c"), "lote-c");          // P2 + kugutsu redo
addDir(path.join(PX, "gerados", "canon-ai"), "canon");
addDir(path.join(PX, "gerados", "desenho"), "desenho");
const final = {};
sources.forEach(s => { final[s.id] = s; });
// seeds always win (already approved)
J.sementes.forEach(s => { final[s.id] = { id: s.id, file: path.join(SEM, s.id + ".png"), label: "semente" }; });

// ---------- post-processing ----------
const isDark = (p, i) => p[i * 4 + 3] > 127 && p[i * 4] < 60 && p[i * 4 + 1] < 60 && p[i * 4 + 2] < 60;
function process32(id, buf, label = "") {
  const im = decode(buf); const W = im.width, H = im.height, p = Buffer.from(im.rgba);
  if (W !== 32 || H !== 32) throw new Error(id + " is " + W + "x" + H);
  const op = (x, y) => x >= 0 && y >= 0 && x < W && y < H && p[(y * W + x) * 4 + 3] > 127;
  let empty = true; for (let i = 0; i < W * H; i++) if (p[i * 4 + 3] > 127) { empty = false; break; }
  if (empty) return { empty: true };
  if (catOf(id) === "kamon") {           // white mask for CSS tinting: keep only the light glyph
    for (let i = 0; i < W * H; i++) { const l = 0.3 * p[i * 4] + 0.59 * p[i * 4 + 1] + 0.11 * p[i * 4 + 2]; const a = p[i * 4 + 3] > 127 && l > 222; p[i * 4] = p[i * 4 + 1] = p[i * 4 + 2] = 255; p[i * 4 + 3] = a ? 255 : 0; }
    return { png: encode(W, H, p), outlined: false };
  }
  // opaque background (all four corners filled): flood-remove the colour region touching the corners
  if (op(0, 0) && op(W - 1, 0) && op(0, H - 1) && op(W - 1, H - 1)) {
    const ci = 0, cr = p[0], cg = p[1], cb = p[2], seen = new Uint8Array(W * H), st = [0, W - 1, (H - 1) * W, H * W - 1];
    const near = i => Math.abs(p[i * 4] - cr) + Math.abs(p[i * 4 + 1] - cg) + Math.abs(p[i * 4 + 2] - cb) < 90;
    while (st.length) { const i = st.pop(); if (seen[i] || !near(i)) continue; seen[i] = 1; p[i * 4 + 3] = 0; const x = i % W, y = (i / W) | 0;
      if (x > 0) st.push(i - 1); if (x < W - 1) st.push(i + 1); if (y > 0) st.push(i - W); if (y < H - 1) st.push(i + W); }
  }
  // mostly-black icons vanish on the Sumi theme: turn the interior ink into steel, keep the outline
  { let opq = 0, dk = 0; for (let i = 0; i < W * H; i++) if (p[i * 4 + 3] > 127) { opq++; if (isDark(p, i)) dk++; }
    if (opq && dk / opq > 0.55 && (label.startsWith("lote") || (label === "canon" && id.startsWith("cla-")))) { const inner = [];
      for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) { const i = y * W + x;
        if (isDark(p, i) && op(x + 1, y) && op(x - 1, y) && op(x, y + 1) && op(x, y - 1)) inner.push(i); }
      inner.forEach(i => { p[i * 4] = 0x5e; p[i * 4 + 1] = 0x6b; p[i * 4 + 2] = 0x73; }); } }
  // boundary darkness check -> add 1px outline when most edge pixels are not ink
  let edge = 0, dark = 0;
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    if (!op(x, y)) continue;
    if (!op(x + 1, y) || !op(x - 1, y) || !op(x, y + 1) || !op(x, y - 1)) { edge++; if (isDark(p, y * W + x)) dark++; }
  }
  let outlined = false;
  if (edge && dark / edge < 0.45) {
    const add = [];
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) if (!op(x, y) && (op(x + 1, y) || op(x - 1, y) || op(x, y + 1) || op(x, y - 1))) add.push(y * W + x);
    add.forEach(i => { p[i * 4] = 0x1a; p[i * 4 + 1] = 0x1a; p[i * 4 + 2] = 0x1a; p[i * 4 + 3] = 255; });
    outlined = true;
  }
  // snap semi-transparent pixels to fully opaque / transparent
  for (let i = 0; i < W * H; i++) p[i * 4 + 3] = p[i * 4 + 3] > 127 ? 255 : 0;
  return { png: encode(W, H, p), outlined };
}
function upscale(buf, f) {
  const im = decode(buf), W = im.width * f, H = im.height * f, o = Buffer.alloc(W * H * 4);
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) im.rgba.copy(o, (y * W + x) * 4, ((Math.floor(y / f) * im.width) + Math.floor(x / f)) * 4, ((Math.floor(y / f) * im.width) + Math.floor(x / f)) * 4 + 4);
  return encode(W, H, o);
}

// ---------- write ----------
fs.rmSync(EXP, { recursive: true, force: true });
for (const s of ["32", "64", "96"]) fs.mkdirSync(path.join(EXP, "icons", s), { recursive: true });
fs.mkdirSync(path.join(EXP, "pranchas"), { recursive: true });
const manifest = [], missing = [], empties = [];
const prioP1 = new Set(Object.keys(meta));
for (const id of Object.keys(meta).sort()) {
  const src = final[id];
  if (!src) { missing.push(id); continue; }
  const r = process32(id, fs.readFileSync(src.file), src.label);
  if (r.empty) { empties.push(id); continue; }
  const name = `ic-${id}`;
  const cat = catOf(id);
  fs.mkdirSync(path.join(STATIC, cat), { recursive: true });
  fs.writeFileSync(path.join(STATIC, cat, `${name}-32.png`), r.png);
  fs.writeFileSync(path.join(EXP, "icons", "32", `${name}-32.png`), r.png);
  fs.writeFileSync(path.join(EXP, "icons", "64", `${name}-64.png`), upscale(r.png, 2));
  fs.writeFileSync(path.join(EXP, "icons", "96", `${name}-96.png`), upscale(r.png, 3));
  manifest.push({ id, arquivo: `${name}-32.png`, categoria: cat, alt: meta[id].alt, tamanhos: [32, 64, 96], origem: src.label, metodo: meta[id].metodo, contorno_automatico: r.outlined, prioridade: meta[id].prioridade || "P1" });
}
fs.writeFileSync(path.join(EXP, "icons.json"), JSON.stringify({ gerado_em: new Date().toISOString().slice(0, 10), total: manifest.length, icones: manifest }, null, 2));
fs.writeFileSync(path.join(STATIC, "icons.json"), JSON.stringify(manifest, null, 2));

// ---------- labelled contact sheets (HTML -> PNG via Edge) ----------
const CATS = { marca: "Marca", nav: "Navegação", parte: "Partes do livro", atributo: "Atributos", recurso: "Recursos", pericia: "Perícias e tipos de jutsu",
  elemento: "Elementos (canônicos)", status: "Status de aprovação", papel: "Papéis", vila: "Vilas (canônicas)", cla: "Clãs (canônicos)", kamon: "Brasões genéricos (máscara)",
  kkg: "Tipos de Kekkei Genkai", esp: "Especializações", equip: "Equipamento", callout: "Caixas da documentação", dado: "Dados", acao: "Ações", rank: "Selos de rank", estado: "Estados especiais", arma: "Armas do catálogo", espada: "Sete Espadas da Névoa", item: "Itens do catálogo", modulo: "Módulos da ficha" };
const b64 = f => "data:image/png;base64," + fs.readFileSync(f).toString("base64");
function sheetHtml(title, items, bg, fg, sub) {
  const cells = items.map(m => `<figure><img src="${b64(path.join(EXP, "icons", "64", m.arquivo.replace("-32.png", "-64.png")))}" width="64" height="64"><figcaption><b>ic-${m.id}</b><span>${m.alt}</span></figcaption></figure>`).join("");
  return `<!doctype html><meta charset="utf-8"><style>
  body{margin:0;background:${bg};color:${fg};font:12px/1.3 "Segoe UI",system-ui,sans-serif;width:1200px}
  header{padding:20px 24px 4px}h1{margin:0;font:700 20px Georgia,serif}p{margin:4px 0 0;opacity:.75}
  main{display:grid;grid-template-columns:repeat(8,1fr);gap:14px 8px;padding:16px 24px 24px}
  figure{margin:0;display:grid;justify-items:center;gap:6px;text-align:center}
  img{image-rendering:pixelated;${catOfBg(items)}}figcaption b{display:block;font:600 11px Consolas,monospace;word-break:break-all}figcaption span{opacity:.7;font-size:11px}
  </style><header><h1>${title}</h1><p>${sub}</p></header><main>${cells}</main>`;
}
function catOfBg(items) { return items.length && items[0].categoria === "kamon" ? "background:#5C1E15;border-radius:4px" : ""; }
function shot(html, out, rows) {
  const tmp = path.join(EXP, "pranchas", "_tmp.html");
  fs.writeFileSync(tmp, html);
  const h = 90 + rows * 132;
  execFileSync(EDGE, ["--headless=new", "--disable-gpu", "--hide-scrollbars", `--window-size=1200,${h}`, `--screenshot=${out}`, "file:///" + tmp.replace(/\\/g, "/")], { stdio: "ignore", timeout: 60000 });
  fs.unlinkSync(tmp);
}
const byCat = {};
manifest.forEach(m => (byCat[m.categoria] = byCat[m.categoria] || []).push(m));
let n = 0;
for (const [cat, items] of Object.entries(byCat)) {
  n++;
  const rows = Math.ceil(items.length / 8);
  const nn = String(n).padStart(2, "0");
  shot(sheetHtml(CATS[cat] || cat, items, "#FBF7F0", "#1A1A1A", `${items.length} ícones · exibidos a 64px (2×) · tema Washi`), path.join(EXP, "pranchas", `${nn}-${cat}-washi.png`), rows);
  shot(sheetHtml(CATS[cat] || cat, items, "#16110F", "#EFE3D3", `${items.length} ícones · exibidos a 64px (2×) · tema Sumi`), path.join(EXP, "pranchas", `${nn}-${cat}-sumi.png`), rows);
}

// ---------- illustrations (96x96) ----------
const IL = path.join(PX, "gerados", "ilustracoes"), ilOut = [];
if (fs.existsSync(IL)) {
  const SIL = path.join(ROOT, "static", "illustrations");
  fs.mkdirSync(SIL, { recursive: true });
  for (const s of ["96", "192"]) fs.mkdirSync(path.join(EXP, "ilustracoes", s), { recursive: true });
  for (const it of J.ilustracoes.itens) {
    const f = path.join(IL, "seed-" + it.id + ".png");
    if (!fs.existsSync(f)) continue;
    const im = decode(fs.readFileSync(f)); for (let i = 0; i < im.width * im.height; i++) im.rgba[i * 4 + 3] = im.rgba[i * 4 + 3] > 127 ? 255 : 0;
    const png = encode(im.width, im.height, im.rgba);
    fs.writeFileSync(path.join(SIL, it.id + "-96.png"), png);
    fs.writeFileSync(path.join(EXP, "ilustracoes", "96", it.id + "-96.png"), png);
    fs.writeFileSync(path.join(EXP, "ilustracoes", "192", it.id + "-192.png"), upscale(png, 2));
    ilOut.push({ id: it.id, arquivo: it.id + "-96.png", alt: it.alt, tamanhos: [96, 192] });
  }
  if (ilOut.length) {
    const cells = ilOut.map(m => `<figure><img src="${b64(path.join(EXP, "ilustracoes", "192", m.id + "-192.png"))}" width="192" height="192"><figcaption><b>${m.id}</b><span>${m.alt}</span></figcaption></figure>`).join("");
    for (const [bg, fg, t] of [["#FBF7F0", "#1A1A1A", "washi"], ["#16110F", "#EFE3D3", "sumi"]]) {
      const html = `<!doctype html><meta charset="utf-8"><style>body{margin:0;background:${bg};color:${fg};font:12px/1.3 "Segoe UI",sans-serif;width:1200px}header{padding:20px 24px 4px}h1{margin:0;font:700 20px Georgia,serif}main{display:grid;grid-template-columns:repeat(5,1fr);gap:16px;padding:16px 24px}figure{margin:0;display:grid;justify-items:center;gap:6px;text-align:center}img{image-rendering:pixelated}b{display:block;font:600 11px Consolas,monospace}span{opacity:.7}</style><header><h1>Ilustrações de estado</h1><p>${ilOut.length} ilustrações · 96px nativo, exibidas a 192px (2×)</p></header><main>${cells}</main>`;
      shot(html, path.join(EXP, "pranchas", `99-ilustracoes-${t}.png`), Math.ceil(ilOut.length / 5) * 2);
    }
  }
  const mf = JSON.parse(fs.readFileSync(path.join(EXP, "icons.json"), "utf8")); mf.ilustracoes = ilOut;
  fs.writeFileSync(path.join(EXP, "icons.json"), JSON.stringify(mf, null, 2));
}
// ---------- campaign covers (256x96) ----------
const CAP = path.join(PX, "gerados", "capas"), capOut = [];
if (fs.existsSync(CAP)) {
  const SC = path.join(ROOT, "static", "covers");
  fs.mkdirSync(SC, { recursive: true });
  for (const s of ["256", "512"]) fs.mkdirSync(path.join(EXP, "capas", s), { recursive: true });
  for (const f of fs.readdirSync(CAP).filter(f => f.endsWith(".png"))) {
    const id = f.replace(/^seed-/, "").replace(/.png$/, "");
    const png = fs.readFileSync(path.join(CAP, f));
    fs.writeFileSync(path.join(SC, id + "-256.png"), png);
    fs.writeFileSync(path.join(EXP, "capas", "256", id + "-256.png"), png);
    fs.writeFileSync(path.join(EXP, "capas", "512", id + "-512.png"), upscale(png, 2));
    capOut.push({ id, arquivo: id + "-256.png", tamanhos: ["256x96", "512x192"] });
  }
  const mf = JSON.parse(fs.readFileSync(path.join(EXP, "icons.json"), "utf8")); mf.capas = capOut;
  fs.writeFileSync(path.join(EXP, "icons.json"), JSON.stringify(mf, null, 2));
}
const ilMissing = J.ilustracoes.itens.map(i => i.id).filter(id => !ilOut.find(o => o.id === id));

// ---------- README ----------
const readme = `# Ícones Shinobi no Michi — pacote para o Claude Design

Pixel art gerada no PixelLab (e alguns ícones desenhados em código) para as telas do projeto.
Total: **${manifest.length} ícones**, **${ilOut.length} ilustrações** e **${capOut.length} capas de campanha**. Especificação completa: seção 3 de \`instrucoes-claude-design.md\`.

## Como usar no Claude Design

1. Envie primeiro as **pranchas** (\`pranchas/*.png\`): cada ícone aparece com o ID embaixo. Peça para usar exatamente esses IDs.
2. Envie os PNGs do tamanho que a tela usa (\`icons/32\`, \`icons/64\` ou \`icons/96\`; ilustrações em \`ilustracoes/96\` ou \`ilustracoes/192\`; capas em \`capas/256\` ou \`capas/512\`). Os ampliados já estão sem suavização.
3. Cole esta regra no contexto: *"Ícones são pixel art: exibir só em 32, 64 ou 96px, com image-rendering: pixelated, sem redimensionar para outros tamanhos, sem sombra nem filtro. Use o ícone pelo ID; não substitua por emoji nem por ícone de biblioteca."*
4. \`icons.json\` lista ID, categoria, texto alternativo (pt-BR) e arquivo de cada ícone.

## Regras rápidas

- Nome: \`ic-{categoria}-{nome}-{tamanho}.png\` (ex.: \`ic-recurso-pc-64.png\`).
- Vilas, clãs e elementos são recriações dos símbolos oficiais do mangá/anime.
- Brasões genéricos (\`ic-kamon-base-*\`) são máscaras brancas: tingir com a cor do clã via CSS \`mask-image\`.
- Utilitários de interface (fechar, setas, editar) não estão aqui: usar uma biblioteca de traço (seção 3.7).
${missing.length ? `\n## Ainda faltam (${missing.length})\n\n${missing.map(m => "- `ic-" + m + "`").join("\n")}\n` : ""}${ilMissing.length ? `\n## Ilustrações ainda não geradas (${ilMissing.length})\n\n${ilMissing.map(m => "- `" + m + "`").join("\n")}\n` : ""}${empties.length ? `\n## Vieram vazios e precisam ser refeitos (${empties.length})\n\n${empties.map(m => "- `ic-" + m + "`").join("\n")}\n` : ""}`;
fs.writeFileSync(path.join(EXP, "LEIA-ME.md"), readme);

// ---------- zip ----------
const zip = path.join(PX, "icones-shinobi-claude-design.zip");
fs.rmSync(zip, { force: true });
execFileSync("powershell.exe", ["-NoProfile", "-Command", `Compress-Archive -Path '${EXP}\\*' -DestinationPath '${zip}' -Force`], { stdio: "ignore" });
console.log(`ok: ${manifest.length} ícones, ${Object.keys(byCat).length} categorias, faltando ${missing.length}, vazios ${empties.length}`);
console.log("contorno automático:", manifest.filter(m => m.contorno_automatico).map(m => m.id).join(", ") || "nenhum");
if (missing.length) console.log("faltando:", missing.join(", "));
if (empties.length) console.log("vazios:", empties.join(", "));
