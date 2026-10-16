// Generates a batch of icons with create_1_direction_object, using the seed icons as style references.
//   PIXELLAB_TOKEN=... node lote.js <outDir> <id1> <id2> ...   (ids from icones-p1.json, max 64)
//   PIXELLAB_TOKEN=... node lote.js --fetch <objectId> <outDir> <id1> ...   (resume an already queued batch)
// Writes <outDir>/<id>.png in the order given, plus <outDir>/lote.json with the object id.
const fs = require("fs");
const path = require("path");
const TOKEN = process.env.PIXELLAB_TOKEN;
const ROOT = path.join(__dirname, "..", "..");
const J = JSON.parse(fs.readFileSync(path.join(__dirname, "..", "icones-p1.json"), "utf8"));

async function call(name, args) {
  const res = await fetch("https://api.pixellab.ai/mcp", {
    method: "POST",
    headers: { Authorization: `Bearer ${TOKEN}`, "Content-Type": "application/json", Accept: "application/json, text/event-stream" },
    body: JSON.stringify({ jsonrpc: "2.0", id: Date.now(), method: "tools/call", params: { name, arguments: args } }),
  });
  const raw = await res.text();
  const msgs = raw.split("\n").filter(l => l.startsWith("data: ")).map(l => JSON.parse(l.slice(6)));
  const msg = msgs[msgs.length - 1];
  if (!msg || msg.error) throw new Error(JSON.stringify(msg ? msg.error : raw.slice(0, 500)));
  const content = msg.result.content || [];
  return { text: content.filter(c => c.type === "text").map(c => c.text).join("\n"), images: content.filter(c => c.type === "image").map(c => c.data) };
}
const allItems = () => J.lotes.flatMap(l => l.itens);

async function fetchBatch(objectId, outDir, ids) {
  for (let i = 0; i < 30; i++) {
    await call("wait_for_jobs", { timeout_seconds: 50 });
    const r = await call("get_object", { object_id: objectId, include_preview: false });
    if (/status: (review|completed)/.test(r.text)) {
      fs.writeFileSync(path.join(outDir, "get_object.txt"), r.text);
      const urls = [...r.text.matchAll(/https:\/\/\S+?\.png\S*|https:\/\/api\.pixellab\.ai\S+/g)].map(m => m[0].replace(/[),.]+$/, ""));
      console.log("status ok,", urls.length, "urls");
      let n = 0;
      for (let k = 0; k < urls.length && k < ids.length; k++) {
        const res = await fetch(urls[k]);
        if (!res.ok) { console.log("download fail", k, res.status); continue; }
        fs.writeFileSync(path.join(outDir, ids[k] + ".png"), Buffer.from(await res.arrayBuffer())); n++;
      }
      console.log("saved", n, "icons");
      return;
    }
    if (/status: failed/.test(r.text)) { console.log(r.text); return; }
    console.log((r.text.match(/status: \S+.*|progress.*/g) || []).slice(0, 2).join(" | "));
  }
}

(async () => {
  const argv = process.argv.slice(2);
  if (argv[0] === "--fetch") { const [, oid, outDir, ...ids] = argv; return fetchBatch(oid, outDir, ids); }
  const [outDir, ...ids] = argv;
  fs.mkdirSync(outDir, { recursive: true });
  const items = ids.map(id => { const it = allItems().find(i => i.id === id); if (!it) throw new Error("unknown id " + id); return it; });
  const seeds = J.sementes.map(s => ({ base64: fs.readFileSync(path.join(ROOT, "pixellab", "gerados", "sementes", s.id + ".png")).toString("base64"), format: "png" }));
  const args = {
    description: J.lotes[0].parametros.description,
    name: "shinobi-icons-" + path.basename(outDir),
    view: "sidescroller",
    style_images: seeds,
    palette: J.paleta,
    item_descriptions: items.map(i => i.prompt),
  };
  let r;
  for (let a = 0; a < 6; a++) { r = await call("create_1_direction_object", args); if (!/rate limit/i.test(r.text)) break; await call("wait_for_jobs", { timeout_seconds: 50 }); }
  console.log(r.text.slice(0, 600));
  const m = r.text.match(/object_id: (\S+)/) || r.text.match(/id: ([0-9a-f-]{36})/);
  if (!m) return;
  fs.writeFileSync(path.join(outDir, "lote.json"), JSON.stringify({ object_id: m[1], ids }, null, 2));
  await fetchBatch(m[1], outDir, ids);
})();
