// Ícones desenhados pixel a pixel (sem custo): selos de rank E–S.
//   node desenho.js <outDir>
const fs = require("fs");
const path = require("path");
const { encode } = require("./pngtool.js");
const out = process.argv[2] || path.join(__dirname, "..", "gerados", "desenho");
fs.mkdirSync(out, { recursive: true });

// 5x7 letters, drawn at 2x (10x14) in the middle of the seal
const FONT = {
  E: ["11111", "10000", "10000", "11110", "10000", "10000", "11111"],
  D: ["11110", "10001", "10001", "10001", "10001", "10001", "11110"],
  C: ["01111", "10000", "10000", "10000", "10000", "10000", "01111"],
  B: ["11110", "10001", "10001", "11110", "10001", "10001", "11110"],
  A: ["01110", "10001", "10001", "11111", "10001", "10001", "10001"],
  S: ["01111", "10000", "10000", "01110", "00001", "00001", "11110"],
};
const RANKS = {
  e: { bg: "#E6D2BF", shade: "#D9C2A7", fg: "#5C524A" },
  d: { bg: "#A88B6A", shade: "#8D6E3F", fg: "#1A1A1A" },
  c: { bg: "#5E6B73", shade: "#2B1A14", fg: "#FFFFFF" },
  b: { bg: "#5C1E15", shade: "#2B1A14", fg: "#F4E4D6" },
  a: { bg: "#C44536", shade: "#8B2E20", fg: "#FFFFFF" },
  s: { bg: "#1A1A1A", shade: "#2B1A14", fg: "#F2C14E", border: "#BF9000" },
};
const ink = "#1A1A1A";

for (const [r, c] of Object.entries(RANKS)) {
  const px = new Array(32 * 32).fill(null);
  const set = (x, y, col) => { if (x >= 0 && y >= 0 && x < 32 && y < 32) px[y * 32 + x] = col; };
  for (let y = 5; y <= 26; y++) for (let x = 5; x <= 26; x++) set(x, y, c.bg);
  [[5, 5], [26, 5], [5, 26], [26, 26]].forEach(([x, y]) => set(x, y, null));
  for (let i = 6; i <= 25; i++) { set(26, i, c.shade); set(i, 26, c.shade); }
  if (c.border) for (let i = 6; i <= 25; i++) { set(i, 6, c.border); set(i, 25, c.border); set(6, i, c.border); set(25, i, c.border); }
  // letter
  const g = FONT[r.toUpperCase()];
  g.forEach((row, gy) => [...row].forEach((b, gx) => {
    if (b !== "1") return;
    for (let dy = 0; dy < 2; dy++) for (let dx = 0; dx < 2; dx++) set(11 + gx * 2 + dx, 9 + gy * 2 + dy, c.fg);
  }));
  if (r === "s") [[9, 9], [22, 22]].forEach(([x, y]) => set(x, y, "#F2C14E")); // sparkle
  // outline
  const add = [];
  for (let y = 0; y < 32; y++) for (let x = 0; x < 32; x++) {
    if (px[y * 32 + x]) continue;
    if ([[1, 0], [-1, 0], [0, 1], [0, -1]].some(([dx, dy]) => { const xx = x + dx, yy = y + dy; return xx >= 0 && yy >= 0 && xx < 32 && yy < 32 && px[yy * 32 + xx]; })) add.push([x, y]);
  }
  add.forEach(([x, y]) => set(x, y, ink));
  const buf = Buffer.alloc(32 * 32 * 4);
  px.forEach((col, i) => { if (!col) return; buf[i * 4] = parseInt(col.slice(1, 3), 16); buf[i * 4 + 1] = parseInt(col.slice(3, 5), 16); buf[i * 4 + 2] = parseInt(col.slice(5, 7), 16); buf[i * 4 + 3] = 255; });
  fs.writeFileSync(path.join(out, `rank-${r}.png`), encode(32, 32, buf));
}
console.log("ranks ->", out);
