// Minimal PNG decode/encode helpers + CLI.
//   node pngtool.js upscale <in.png> <out.png> <factor> [bgHex]
//   node pngtool.js sheet <out.png> <factor> <bgHex> <in1.png> <in2.png> ...   (horizontal strip with 4px gaps)
//   node pngtool.js info <in.png>
const fs = require("fs");
const zlib = require("zlib");

function crc32(buf) {
  let c, crc = 0xffffffff;
  for (let n = 0; n < buf.length; n++) {
    c = (crc ^ buf[n]) & 0xff;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    crc = (crc >>> 8) ^ c;
  }
  return (crc ^ 0xffffffff) >>> 0;
}
function chunk(type, data) {
  const len = Buffer.alloc(4); len.writeUInt32BE(data.length);
  const td = Buffer.concat([Buffer.from(type), data]);
  const crc = Buffer.alloc(4); crc.writeUInt32BE(crc32(td));
  return Buffer.concat([len, td, crc]);
}
function encode(width, height, rgba) {
  const stride = width * 4;
  const raw = Buffer.alloc((stride + 1) * height);
  for (let y = 0; y < height; y++) rgba.copy(raw, y * (stride + 1) + 1, y * stride, (y + 1) * stride);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0); ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; ihdr[9] = 6;
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk("IHDR", ihdr), chunk("IDAT", zlib.deflateSync(raw)), chunk("IEND", Buffer.alloc(0)),
  ]);
}
function decode(buf) {
  let pos = 8, width, height, bitDepth, colorType, palette = null, trns = null;
  const idat = [];
  while (pos < buf.length) {
    const len = buf.readUInt32BE(pos); const type = buf.toString("ascii", pos + 4, pos + 8);
    const data = buf.subarray(pos + 8, pos + 8 + len);
    if (type === "IHDR") { width = data.readUInt32BE(0); height = data.readUInt32BE(4); bitDepth = data[8]; colorType = data[9]; }
    else if (type === "PLTE") palette = data;
    else if (type === "tRNS") trns = data;
    else if (type === "IDAT") idat.push(data);
    pos += 12 + len;
  }
  if (bitDepth !== 8) throw new Error("only 8-bit PNG supported, got " + bitDepth);
  const channels = { 0: 1, 2: 3, 3: 1, 4: 2, 6: 4 }[colorType];
  const raw = zlib.inflateSync(Buffer.concat(idat));
  const stride = width * channels;
  const out = Buffer.alloc(height * stride);
  for (let y = 0; y < height; y++) {
    const f = raw[y * (stride + 1)];
    for (let x = 0; x < stride; x++) {
      const v = raw[y * (stride + 1) + 1 + x];
      const a = x >= channels ? out[y * stride + x - channels] : 0;
      const b = y > 0 ? out[(y - 1) * stride + x] : 0;
      const c = x >= channels && y > 0 ? out[(y - 1) * stride + x - channels] : 0;
      let r;
      if (f === 0) r = v; else if (f === 1) r = v + a; else if (f === 2) r = v + b;
      else if (f === 3) r = v + ((a + b) >> 1);
      else { const p = a + b - c, pa = Math.abs(p - a), pb = Math.abs(p - b), pc = Math.abs(p - c); r = v + (pa <= pb && pa <= pc ? a : pb <= pc ? b : c); }
      out[y * stride + x] = r & 0xff;
    }
  }
  const rgba = Buffer.alloc(width * height * 4);
  for (let i = 0; i < width * height; i++) {
    let R, G, B, A = 255;
    if (colorType === 6) { R = out[i * 4]; G = out[i * 4 + 1]; B = out[i * 4 + 2]; A = out[i * 4 + 3]; }
    else if (colorType === 2) { R = out[i * 3]; G = out[i * 3 + 1]; B = out[i * 3 + 2]; }
    else if (colorType === 3) { const k = out[i]; R = palette[k * 3]; G = palette[k * 3 + 1]; B = palette[k * 3 + 2]; A = trns && k < trns.length ? trns[k] : 255; }
    else if (colorType === 0) { R = G = B = out[i]; }
    else { R = G = B = out[i * 2]; A = out[i * 2 + 1]; }
    rgba[i * 4] = R; rgba[i * 4 + 1] = G; rgba[i * 4 + 2] = B; rgba[i * 4 + 3] = A;
  }
  return { width, height, rgba };
}
function hexRgb(h) { return [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)]; }
function blit(dst, dw, src, sw, sh, ox, oy, f, bg) {
  for (let y = 0; y < sh * f; y++) for (let x = 0; x < sw * f; x++) {
    const si = (Math.floor(y / f) * sw + Math.floor(x / f)) * 4, di = ((oy + y) * dw + ox + x) * 4;
    const a = src[si + 3] / 255;
    dst[di] = Math.round(src[si] * a + bg[0] * (1 - a));
    dst[di + 1] = Math.round(src[si + 1] * a + bg[1] * (1 - a));
    dst[di + 2] = Math.round(src[si + 2] * a + bg[2] * (1 - a));
    dst[di + 3] = 255;
  }
}

module.exports = { decode, encode };

if (require.main === module) {
  const [cmd, ...a] = process.argv.slice(2);
  if (cmd === "info") {
    const { width, height, rgba } = decode(fs.readFileSync(a[0]));
    const colors = new Set(); let opaque = 0;
    for (let i = 0; i < width * height; i++) if (rgba[i * 4 + 3] > 0) { opaque++; colors.add(rgba.readUInt32BE(i * 4).toString(16).padStart(8, "0")); }
    console.log(`${width}x${height} opaque=${opaque} colors=${colors.size}`);
  } else if (cmd === "upscale") {
    const [inp, outp, fs_, bgh = "#FBF7F0"] = a; const f = +fs_;
    const { width, height, rgba } = decode(fs.readFileSync(inp));
    const W = width * f, H = height * f, dst = Buffer.alloc(W * H * 4);
    blit(dst, W, rgba, width, height, 0, 0, f, hexRgb(bgh));
    fs.writeFileSync(outp, encode(W, H, dst));
  } else if (cmd === "sheet") {
    const [outp, fs_, bgh, ...ins] = a; const f = +fs_, gap = 4 * f, bg = hexRgb(bgh);
    const imgs = ins.map(p => decode(fs.readFileSync(p)));
    const H = Math.max(...imgs.map(i => i.height)) * f + gap * 2;
    const W = imgs.reduce((s, i) => s + i.width * f + gap, gap);
    const dst = Buffer.alloc(W * H * 4);
    for (let i = 0; i < W * H; i++) { dst[i * 4] = bg[0]; dst[i * 4 + 1] = bg[1]; dst[i * 4 + 2] = bg[2]; dst[i * 4 + 3] = 255; }
    let x = gap;
    for (const im of imgs) { blit(dst, W, im.rgba, im.width, im.height, x, gap, f, bg); x += im.width * f + gap; }
    fs.writeFileSync(outp, encode(W, H, dst));
  }
}

// node pngtool.js outline <in.png> <out.png> [hex]  — adds a 1px outline around opaque pixels (4-neighbourhood)
if (require.main === module && process.argv[2] === "outline") {
  const [, , , inp, outp, hex = "#1A1A1A"] = process.argv;
  const { width: w, height: h, rgba } = decode(fs.readFileSync(inp));
  const [r, g, b] = hexRgb(hex), out = Buffer.from(rgba);
  const op = (x, y) => x >= 0 && y >= 0 && x < w && y < h && rgba[(y * w + x) * 4 + 3] > 127;
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    if (op(x, y)) continue;
    if (op(x + 1, y) || op(x - 1, y) || op(x, y + 1) || op(x, y - 1)) {
      const i = (y * w + x) * 4; out[i] = r; out[i + 1] = g; out[i + 2] = b; out[i + 3] = 255;
    }
  }
  fs.writeFileSync(outp, encode(w, h, out));
}
