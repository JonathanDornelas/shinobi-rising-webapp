// Sequential PixelLab runner (free plan = 1 concurrent job).
//   node run-seq.js <tool> <outDir> <id1> <id2> ...     reads args/seed-<id>.json, writes <outDir>/seed-<id>.png
//   node run-seq.js --job <jobId> <outDir> <id>           only downloads an already queued job
const fs = require("fs");
const TOKEN = process.env.PIXELLAB_TOKEN;

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
  return {
    text: content.filter(c => c.type === "text").map(c => c.text).join("\n"),
    images: content.filter(c => c.type === "image").map(c => c.data),
    isError: !!msg.result.isError,
  };
}

async function fetchJob(jobId, outFile) {
  for (let i = 0; i < 10; i++) {
    await call("wait_for_jobs", { timeout_seconds: 50 });
    const r = await call("get_image", { job_id: jobId });
    if (/status: completed/.test(r.text) && r.images.length) {
      fs.writeFileSync(outFile, Buffer.from(r.images[0], "base64"));
      return true;
    }
    if (/status: failed|error/i.test(r.text) && !/processing|pending/.test(r.text)) { console.log(r.text); return false; }
  }
  return false;
}

(async () => {
  const argv = process.argv.slice(2);
  if (argv[0] === "--job") {
    const [, jobId, outDir, id] = argv;
    console.log(id, (await fetchJob(jobId, `${outDir}/seed-${id}.png`)) ? "ok" : "FAILED");
    return;
  }
  const [tool, outDir, ...ids] = argv;
  fs.mkdirSync(outDir, { recursive: true });
  for (const id of ids) {
    const args = JSON.parse(fs.readFileSync(`${__dirname}/args/seed-${id}.json`, "utf8"));
    let r;
    for (let attempt = 0; attempt < 6; attempt++) {
      r = await call(tool, args);
      if (!/rate limit/i.test(r.text)) break;
      await call("wait_for_jobs", { timeout_seconds: 50 });
    }
    const m = r.text.match(/job_id: (\S+)/);
    if (!m) { console.log(id, "QUEUE FAILED:", r.text.slice(0, 300)); continue; }
    const ok = await fetchJob(m[1], `${outDir}/seed-${id}.png`);
    console.log(id, m[1], ok ? "ok" : "FAILED");
  }
})();
