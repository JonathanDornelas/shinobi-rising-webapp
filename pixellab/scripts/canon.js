// Turns a 256px reference raster of an official symbol into a clean 32x32 base in the project palette.
//   node canon.js <ref.png> <out.png> [--fill=#HEX] [--map=#src:#dst,...]
//  --fill  colour for enclosed transparent areas (line-art symbols like Konoha)
//  --map   recolour after quantizing (e.g. pure red -> #C44536)
const fs = require("fs");
const { decode, encode } = require("./pngtool.js");
const PALETTE = JSON.parse(fs.readFileSync(__dirname + "/../icones-p1.json", "utf8")).paleta;

const [inp, outp, ...opts] = process.argv.slice(2);
const opt = Object.fromEntries(opts.map(o => o.replace(/^--/, "").split("=")));
const rgb = h => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
const pal = PALETTE.map(rgb);
const nearest = c => { let b = 0, bd = 1e9; pal.forEach((p, i) => { const d = (p[0] - c[0]) ** 2 * 0.3 + (p[1] - c[1]) ** 2 * 0.59 + (p[2] - c[2]) ** 2 * 0.11; if (d < bd) { bd = d; b = i; } }); return PALETTE[b]; };

const src = decode(fs.readFileSync(inp));
if (opt.fill) {
  const W = src.width, H = src.height, R = +(opt.close || 14);
  const line = new Uint8Array(W * H);
  for (let i = 0; i < W * H; i++) line[i] = src.rgba[i * 4 + 3] > 128 ? 1 : 0;
  // dilate (separable square kernel)
  const dil = (m, r) => { const t = new Uint8Array(W * H), o = new Uint8Array(W * H);
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) { let v = 0; for (let k = -r; k <= r && !v; k++) { const xx = x + k; if (xx >= 0 && xx < W && m[y * W + xx]) v = 1; } t[y * W + x] = v; }
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) { let v = 0; for (let k = -r; k <= r && !v; k++) { const yy = y + k; if (yy >= 0 && yy < H && t[yy * W + x]) v = 1; } o[y * W + x] = v; }
    return o; };
  const d = dil(line, R);
  const ext = new Uint8Array(W * H), st = [];
  for (let i = 0; i < W; i++) st.push(i, (H - 1) * W + i); for (let j = 0; j < H; j++) st.push(j * W, j * W + W - 1);
  while (st.length) { const p = st.pop(); if (ext[p] || d[p]) continue; ext[p] = 1; const x = p % W, y = (p / W) | 0;
    if (x > 0) st.push(p - 1); if (x < W - 1) st.push(p + 1); if (y > 0) st.push(p - W); if (y < H - 1) st.push(p + W); }
  const sil = dil(ext, R); // grow exterior back = erode silhouette
  const [fr, fg, fb] = rgb(opt.fill);
  for (let i = 0; i < W * H; i++) if (!sil[i] && !line[i]) { src.rgba[i*4]=fr; src.rgba[i*4+1]=fg; src.rgba[i*4+2]=fb; src.rgba[i*4+3]=255; }
}
const N = 32, S = src.width / N;
const cell = new Array(N * N).fill(null);
for (let cy = 0; cy < N; cy++) for (let cx = 0; cx < N; cx++) {
  let a = 0, dark = 0, r = 0, g = 0, b = 0, n = 0, tot = 0;
  for (let y = cy * S; y < (cy + 1) * S; y++) for (let x = cx * S; x < (cx + 1) * S; x++) {
    const i = (Math.floor(y) * src.width + Math.floor(x)) * 4, al = src.rgba[i + 3]; tot++;
    if (al < 128) continue;
    a++;
    const l = 0.3 * src.rgba[i] + 0.59 * src.rgba[i + 1] + 0.11 * src.rgba[i + 2];
    if (l < 60) dark++; else { r += src.rgba[i]; g += src.rgba[i + 1]; b += src.rgba[i + 2]; n++; }
  }
  if (dark / tot > +(opt.ink || 0.2)) cell[cy * N + cx] = "#1A1A1A";
  else if (a / tot > 0.45 && n) cell[cy * N + cx] = nearest([r / n, g / n, b / n]);
}
if (opt.map) for (const m of opt.map.split(",")) { const [s, d] = m.split(":"); cell.forEach((c, i) => { if (c && c.toUpperCase() === s.toUpperCase()) cell[i] = d; }); }
if (false) {
  const ext = new Array(N * N).fill(false), stack = [];
  for (let i = 0; i < N; i++) stack.push([i, 0], [i, N - 1], [0, i], [N - 1, i]);
  while (stack.length) {
    const [x, y] = stack.pop();
    if (x < 0 || y < 0 || x >= N || y >= N || ext[y * N + x] || cell[y * N + x]) continue;
    ext[y * N + x] = true; stack.push([x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]);
  }
  cell.forEach((c, i) => { if (!c && !ext[i]) cell[i] = opt.fill; });
}
const nb = (i, f) => { const x = i % N, y = (i / N) | 0; return [[1,0],[-1,0],[0,1],[0,-1]].filter(([dx,dy]) => { const xx=x+dx, yy=y+dy; return f(xx<0||yy<0||xx>=N||yy>=N ? null : cell[yy*N+xx]); }).length; };
if (opt.stroke) { cell.forEach((c, i) => { if (c === "#1A1A1A") cell[i] = opt.stroke; });
  const add = []; cell.forEach((c, i) => { if (!c && nb(i, v => !!v) > 0) add.push(i); }); add.forEach(i => cell[i] = "#1A1A1A"); }
// drop isolated pixels (fewer than 1 opaque neighbour)
cell.forEach((c, i) => { if (c && nb(i, v => !!v) === 0) cell[i] = null; });
for (let e = 0; e < +(opt.erode || 0); e++) { const kill = []; cell.forEach((c, i) => { if (c && nb(i, v => !v) > 0) kill.push(i); }); kill.forEach(i => cell[i] = null); }
if (opt.erode) { const add = []; cell.forEach((c, i) => { if (!c && nb(i, v => !!v) > 0) add.push(i); }); add.forEach(i => cell[i] = "#1A1A1A"); }
const out = Buffer.alloc(N * N * 4);
cell.forEach((c, i) => { if (!c) return; const [r, g, b] = rgb(c); out[i * 4] = r; out[i * 4 + 1] = g; out[i * 4 + 2] = b; out[i * 4 + 3] = 255; });
fs.writeFileSync(outp, encode(N, N, out));
console.log(outp);
