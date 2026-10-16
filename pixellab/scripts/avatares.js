// 16 retratos de avatar 64x64 em uma chamada (create_1_direction_object, size 64 -> 16 candidatos).
//   PIXELLAB_TOKEN=... node avatares.js <outDir>
const fs = require("fs");
const path = require("path");
const { decode, encode } = require("./pngtool.js");
const ROOT = path.join(__dirname, "..", "..");
const J = JSON.parse(fs.readFileSync(path.join(__dirname, "..", "icones-p1.json"), "utf8"));
const out = process.argv[2];
fs.mkdirSync(out, { recursive: true });

const PEOPLE = [
  "young ninja boy with spiky black hair and a steel forehead protector",
  "young kunoichi with long red hair tied in a ponytail and forehead protector",
  "calm ninja with silver hair and a cloth mask covering the lower face",
  "stern older ninja with grey beard and scar across the eye",
  "cheerful girl ninja with short pink hair and headband",
  "tall ninja with dark skin, shaved head and forehead protector",
  "quiet boy with round sunglasses and a high collar",
  "kunoichi with dark braided hair and bandages on her cheek",
  "chubby friendly ninja with brown hair and swirl marks on cheeks",
  "pale ninja with long straight black hair and white eyes",
  "ninja wearing a white porcelain mask with red stripes",
  "young ninja with messy blond hair and orange scarf",
  "elderly woman sage with white bun hair and calm smile",
  "girl ninja with short blue hair and round glasses",
  "rogue ninja with a scratched forehead protector and stubble",
  "teen ninja with green bowl haircut and thick eyebrows",
];

function upscale2(file) {
  const im = decode(fs.readFileSync(file)), W = im.width * 2, o = Buffer.alloc(W * W * 4);
  for (let y = 0; y < W; y++) for (let x = 0; x < W; x++) im.rgba.copy(o, (y * W + x) * 4, ((y >> 1) * im.width + (x >> 1)) * 4, ((y >> 1) * im.width + (x >> 1)) * 4 + 4);
  return encode(W, W, o).toString("base64");
}

async function call(name, args) {
  const res = await fetch("https://api.pixellab.ai/mcp", {
    method: "POST",
    headers: { Authorization: `Bearer ${process.env.PIXELLAB_TOKEN}`, "Content-Type": "application/json", Accept: "application/json, text/event-stream" },
    body: JSON.stringify({ jsonrpc: "2.0", id: Date.now(), method: "tools/call", params: { name, arguments: args } }),
  });
  const raw = await res.text();
  const msg = raw.split("\n").filter(l => l.startsWith("data: ")).map(l => JSON.parse(l.slice(6))).pop();
  return (msg.result.content || []).filter(c => c.type === "text").map(c => c.text).join("\n");
}

(async () => {
  const args = {
    description: "pixel art RPG character portrait bust, head and shoulders, front view, ninja world inspired by feudal Japan, crisp 1px black outline, medium shading, light from top-left, transparent background",
    name: "shinobi-avatares", view: "sidescroller", palette: J.paleta,
    style_images: J.sementes.slice(0, 6).map(s => ({ base64: upscale2(path.join(ROOT, s.arquivo)), format: "png" })),
    item_descriptions: PEOPLE,
  };
  let t;
  for (let a = 0; a < 8; a++) { t = await call("create_1_direction_object", args); if (!/rate limit/i.test(t)) break; await call("wait_for_jobs", { timeout_seconds: 50 }); }
  const id = (t.match(/id: ([0-9a-f-]{36})/) || [])[1];
  console.log(t.slice(0, 300));
  if (!id) return;
  for (let i = 0; i < 30; i++) {
    await call("wait_for_jobs", { timeout_seconds: 50 });
    const r = await call("get_object", { object_id: id, include_preview: false });
    if (/status: (review|completed)/.test(r)) {
      const urls = [...r.matchAll(/https:\/\/\S+?\.png/g)].map(m => m[0]);
      for (let k = 0; k < urls.length && k < 16; k++) {
        const res = await fetch(urls[k]);
        fs.writeFileSync(path.join(out, `avatar-${String(k + 1).padStart(2, "0")}.png`), Buffer.from(await res.arrayBuffer()));
      }
      console.log("saved", Math.min(urls.length, 16), "avatars");
      return;
    }
    if (/status: failed/.test(r)) { console.log(r); return; }
  }
})();
