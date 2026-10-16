// Gera ../prancha-sementes.html a partir do template, embutindo os ícones como data URIs.
const fs = require("fs");
const path = require("path");
const root = path.join(__dirname, "..", "..");
const icon = rel => "data:image/png;base64," + fs.readFileSync(path.join(root, "static/icons", rel)).toString("base64");
const I = {
  pc: icon("recurso/ic-recurso-pc-32.png"),
  katon: icon("elemento/ic-elemento-katon-32.png"),
  taijutsu: icon("pericia/ic-pericia-taijutsu-32.png"),
  konoha: icon("vila/ic-vila-konoha-32.png"),
  aprovado: icon("status/ic-status-aprovado-32.png"),
  jutsus: icon("nav/ic-nav-jutsus-32.png"),
};
const ORDER = [["pc", "PC"], ["katon", "Katon"], ["taijutsu", "Taijutsu"], ["konoha", "Konoha"], ["aprovado", "Aprovado"], ["jutsus", "Jutsus"]];
const img = (k, s, alt = "") => `<img class="px" src="${I[k]}" width="${s}" height="${s}" alt="${alt}">`;

function ground(kind, label, hex) {
  const head = ORDER.map(([, n]) => `<th scope="col">${n}</th>`).join("");
  const rows = [[32, "1× · 32px"], [64, "2× · 64px"], [96, "3× · 96px"]]
    .map(([s, l]) => `<tr><td>${l}</td>${ORDER.map(([k, n]) => `<td>${img(k, s, s === 32 ? n : "")}</td>`).join("")}</tr>`).join("");
  return `<section class="ground ${kind}" aria-label="${label}">
  <h3>${label} <span>${hex}</span></h3>
  <div class="scales"><table><thead><tr><th scope="col">Escala</th>${head}</tr></thead><tbody>${rows}</tbody></table></div>
  <div class="ctx">
    <div class="nav" role="presentation">
      <a class="on">${img("jutsus", 32)}Jutsus</a>
      <a>${img("aprovado", 32)}Aprovações</a>
    </div>
    <div class="row">
      <span class="chip katon">${img("katon", 32)}Katon</span>
      <span class="chip konoha">${img("konoha", 32)}Konohagakure</span>
      <span class="badge-ok">${img("aprovado", 32)}Aprovado</span>
    </div>
    <div class="tracker">${img("pc", 32)}<div class="bar"><i style="width:85%"></i></div><b>PC 40 / 47</b></div>
    <div class="skill">${img("taijutsu", 32)}<div><strong>Taijutsu</strong><small>FOR · treino +2 · bônus de clã +1</small></div><span class="val">+5</span></div>
    <div><div class="jutsu-head">${img("katon", 32)}<div><strong>Goukakyu no Jutsu</strong><em>Grande Bola de Fogo · Katon · Rank C · 9 PC</em></div></div></div>
  </div>
</section>`;
}

let html = fs.readFileSync(path.join(__dirname, "..", "prancha-sementes.template.html"), "utf8");
html = html.replace(/\{\{GROUND:(\w+):([^:]+):(#[0-9A-F]+)\}\}/g, (m, k, l, h) => ground(k, l, h));
html = html.replace(/\{\{(\w+)\}\}/g, (m, k) => I[k] || m);
fs.writeFileSync(path.join(__dirname, "..", "prancha-sementes.html"), html);
console.log("prancha-sementes.html", (html.length / 1024).toFixed(1) + " KB");
