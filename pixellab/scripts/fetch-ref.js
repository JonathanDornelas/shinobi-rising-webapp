// Fetches official symbol SVGs from the Naruto wiki through headless Edge (the CDN blocks curl)
// and rasterizes each one to a transparent 256x256 PNG in ref/<id>.png.
//   node fetch-ref.js <id>=<File name.svg> ...
const fs = require("fs");
const path = require("path");
const { execFileSync } = require("child_process");
const EDGE = "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe";
const REF = path.join(__dirname, "..", "referencias");
fs.mkdirSync(REF, { recursive: true });

async function fileUrl(name) {
  const u = `https://naruto.fandom.com/api.php?action=query&titles=${encodeURIComponent("File:" + name)}&prop=imageinfo&iiprop=url&format=json`;
  const j = await (await fetch(u, { headers: { "User-Agent": "Mozilla/5.0" } })).json();
  const page = Object.values(j.query.pages)[0];
  return page.imageinfo && page.imageinfo[0].url;
}
function edge(args) {
  return execFileSync(EDGE, ["--headless=new", "--disable-gpu", "--hide-scrollbars", ...args], { encoding: "utf8", timeout: 90000, maxBuffer: 20e6 });
}

(async () => {
  for (const pair of process.argv.slice(2)) {
    const [id, name] = pair.split("=");
    try {
      const url = await fileUrl(name);
      if (!url) { console.log(id, "NO FILE"); continue; }
      const dom = edge(["--virtual-time-budget=20000",
        "--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0 Safari/537.36 Edg/141.0",
        "--dump-dom", url]);
      const m = dom.match(/<svg[\s\S]*<\/svg>/i);
      if (!m) { console.log(id, "NO SVG (blocked?)"); continue; }
      let svg = m[0];
      fs.writeFileSync(path.join(REF, id + ".svg"), svg);
      // force the svg to fill a 256px box, keeping aspect ratio
      svg = svg.replace(/<svg([^>]*)>/i, (all, attrs) => {
        let a = attrs.replace(/\s(width|height)="[^"]*"/gi, "");
        if (!/viewBox/i.test(a)) {
          const w = (attrs.match(/width="([\d.]+)/) || [])[1], h = (attrs.match(/height="([\d.]+)/) || [])[1];
          if (w && h) a += ` viewBox="0 0 ${w} ${h}"`;
        }
        return `<svg${a} width="232" height="232" preserveAspectRatio="xMidYMid meet">`;
      });
      const html = `<!doctype html><html><body style="margin:0;background:transparent"><div style="width:256px;height:256px;display:flex;align-items:center;justify-content:center">${svg}</div></body></html>`;
      const htmlFile = path.join(REF, id + ".html");
      fs.writeFileSync(htmlFile, html);
      edge(["--window-size=256,256", "--default-background-color=00000000", `--screenshot=${path.join(REF, id + ".png")}`, "file:///" + htmlFile.replace(/\\/g, "/")]);
      console.log(id, "ok");
    } catch (e) { console.log(id, "ERROR", e.message.slice(0, 200)); }
  }
})();
