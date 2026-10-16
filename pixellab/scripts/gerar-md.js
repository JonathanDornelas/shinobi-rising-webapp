// Gera ../prompts-p1.md a partir de ../icones-p1.json (o JSON é a fonte única).
const fs = require("fs");
const path = require("path");
const j = JSON.parse(fs.readFileSync(path.join(__dirname, "..", "icones-p1.json"), "utf8"));
const L = [];
const row = cells => L.push("| " + cells.map(c => String(c ?? "").replace(/\|/g, "/")).join(" | ") + " |");

L.push("# Prompts do PixelLab — ícones P1", "");
L.push("> Gerado por `scripts/gerar-md.js` a partir de `icones-p1.json`. Edite o JSON, não este arquivo.", "");
L.push("## Estilo e regras", "");
L.push("- **Estilo-mestre:** seção 3.1 de `instrucoes-claude-design.md` (contorno 1px `#1A1A1A`, sombreamento médio, luz no alto à esquerda, fundo transparente, 32×32).");
L.push("- **Regra canônica:** " + j.regra_canonica);
L.push("- **Paleta forçada (25 cores):** " + j.paleta.map(c => "`" + c + "`").join(" "));
L.push("- Prompts em inglês (o modelo responde melhor); `alt` em pt-BR vai para o manifesto `icons.json`.");
L.push("- Conta trial: 1 geração por vez. O lote em `create_1_direction_object` custa 10–25 gerações por chamada (até 64 ícones).", "");

L.push("## Ordem de geração", "");
L.push("1. **Sementes** (prontas) → aprovar o estilo na página de teste.");
L.push(`2. **Lote A** — ${j.lotes[0].nome} (${j.lotes[0].itens.length} ícones, 1 chamada).`);
L.push(`3. **Canônicos** — vilas, clãs e elementos (${j.canonicos.itens.length} símbolos, 1 geração cada).`);
L.push(`4. **Lote B** — ${j.lotes[1].nome} (${j.lotes[1].itens.length} ícones, 1 chamada).`);
if (j.lotes[2]) L.push(`4b. **Lote C** — ${j.lotes[2].nome} (${j.lotes[2].itens.length} ícones, 1 chamada).`);
L.push(`5. **Desenho em código** — selos de rank (${j.desenho_em_codigo.itens.length}, grátis).`);
L.push(`6. **Ilustrações** 96×96 (${j.ilustracoes.itens.length}, 1 geração cada).`);
L.push("7. Pendentes: animação de carregamento e versões 16px.", "");

L.push("## 1. Sementes (prontas)", "");
row(["ID", "Arquivo", "Método", "Alt"]); row(["---", "---", "---", "---"]);
j.sementes.forEach(s => row([s.id, "`" + s.arquivo + "`", s.metodo, s.alt]));
L.push("");

j.lotes.forEach((lote, n) => {
  L.push(`## Lote ${lote.id} — ${lote.nome}`, "");
  L.push("Ferramenta: `" + lote.ferramenta + "`.", "");
  if (typeof lote.parametros === "object") {
    L.push("```json");
    L.push(JSON.stringify({ ...lote.parametros, palette: "<paleta de 25 cores>", style_images: "<as 6 sementes em PNG base64>", item_descriptions: "<coluna Prompt abaixo, na ordem>" }, null, 2));
    L.push("```", "");
  } else L.push("Parâmetros: " + lote.parametros, "");
  row(["#", "ID", "Prompt (item_description)", "Alt", "Obs."]); row(["---", "---", "---", "---", "---"]);
  lote.itens.forEach((i, k) => row([k + 1, i.id, i.prompt, i.alt, i.observacao || ""]));
  L.push("");
});

L.push("## 3. Símbolos canônicos", "");
L.push("Custo: " + j.canonicos.custo + ".", "");
j.canonicos.pipeline.forEach((p, k) => L.push(`${k + 1}. \`${p}\``));
L.push("");
row(["ID", "Referência oficial (naruto.fandom.com)", "Alt"]); row(["---", "---", "---"]);
j.canonicos.itens.forEach(i => row([i.id, "`" + i.referencia + "`", i.alt]));
L.push("", "**P2 (depois):** " + j.canonicos.p2.map(i => `${i.id} (\`${i.referencia}\`)`).join(", "), "");

L.push("## 5. Desenho em código", "", j.desenho_em_codigo.motivo, "");
row(["ID", "Descrição", "Alt"]); row(["---", "---", "---"]);
j.desenho_em_codigo.itens.forEach(i => row([i.id, i.descricao, i.alt]));
L.push("");

L.push("## 6. Ilustrações (96×96)", "", "Ferramenta: `" + j.ilustracoes.ferramenta + "`. Sufixo de estilo em todo prompt: *" + j.ilustracoes.parametros.estilo_no_prompt + "*.", "");
row(["ID", "Prompt", "Alt", "Obs."]); row(["---", "---", "---", "---"]);
j.ilustracoes.itens.forEach(i => row([i.id, i.prompt, i.alt, i.observacao || ""]));
L.push("");

L.push("## 7. Pendentes", "");
j.pendentes.forEach(p => L.push(`- **${p.id}:** ${p.descricao}`));
L.push("");

fs.writeFileSync(path.join(__dirname, "..", "prompts-p1.md"), L.join("\n"));
console.log("prompts-p1.md", L.length, "linhas");
