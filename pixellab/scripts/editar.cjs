// Edita uma arte já gerada com o modelo Pro (edit_image, 10–25 gerações): mantém pose, composição e traço e muda só o
// que a instrução pede. Cada seed sai como uma variação: gerados/bestiario/<slug>-<seed>.png.
//   PIXELLAB_TOKEN=… node editar.cjs <origem.png> <slug> "<instrução>" <seed> [seed …]
const fs = require("fs");
const path = require("path");
const OUT = path.join(__dirname, "..", "gerados", "bestiario");
const [origem, slug, instrucao, ...seeds] = process.argv.slice(2);
const token = process.env.PIXELLAB_TOKEN;

async function call(name, args) {
  const res = await fetch("https://api.pixellab.ai/mcp", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json", Accept: "application/json, text/event-stream" },
    body: JSON.stringify({ jsonrpc: "2.0", id: Date.now(), method: "tools/call", params: { name, arguments: args } })
  });
  const msgs = (await res.text()).split("\n").filter((l) => l.startsWith("data: ")).map((l) => JSON.parse(l.slice(6)));
  const msg = msgs[msgs.length - 1];
  if (!msg || msg.error) throw new Error(JSON.stringify(msg ? msg.error : "sem resposta"));
  const content = msg.result.content || [];
  return { text: content.filter((c) => c.type === "text").map((c) => c.text).join("\n"), images: content.filter((c) => c.type === "image").map((c) => c.data) };
}

(async () => {
  if (!token || !origem || !slug || !instrucao || !seeds.length) return console.log("uso: PIXELLAB_TOKEN=… node editar.cjs <origem.png> <slug> \"<instrução>\" <seed> [seed …]");
  const imagem = fs.readFileSync(path.isAbsolute(origem) ? origem : path.join(OUT, origem)).toString("base64");
  await Promise.all(seeds.map(async (seed) => {
    const r = await call("edit_image", { images_base64: [imagem], description: instrucao, seed: +seed });
    const id = r.text.match(/job_id: (\S+)/)?.[1];
    if (!id) return console.log(`${slug}-${seed} não enfileirou: ${r.text.replace(/\s+/g, " ").slice(0, 200)}`);
    for (let i = 0; i < 24; i++) {
      await call("wait_for_jobs", { timeout_seconds: 50 });
      const g = await call("get_image", { job_id: id });
      if (/status: completed/.test(g.text) && g.images.length) {
        fs.writeFileSync(path.join(OUT, `${slug}-${seed}.png`), Buffer.from(g.images[0], "base64"));
        return console.log(`${slug}-${seed} ok`);
      }
      if (/status: failed/i.test(g.text)) return console.log(`${slug}-${seed} FALHOU: ${g.text.slice(0, 200)}`);
    }
    console.log(`${slug}-${seed} demorou demais (job ${id})`);
  }));
})();
