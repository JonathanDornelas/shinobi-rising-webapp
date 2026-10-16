// Writes palette.png: one 4x4 swatch per color of the Shinobi no Michi pixel palette (section 3.2).
const fs = require("fs");
const zlib = require("zlib");

const PALETTE = [
  "#1A1A1A", "#2B1A14", "#5C1E15", "#8B2E20", "#C44536", "#E07A5F", "#FBF7F0", "#F4E4D6",
  "#D9C2A7", "#A88B6A", "#BF9000", "#F2C14E", "#069BBD", "#7FD3E6", "#38761D", "#7FB069",
  "#674EA7", "#A895D6", "#7F6000", "#8D6E3F", "#5E6B73", "#A7B4BC", "#E8692E", "#2E6FD1", "#FFFFFF",
];

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
function png(width, height, rgba) {
  const raw = Buffer.alloc((width * 4 + 1) * height);
  for (let y = 0; y < height; y++) {
    raw[y * (width * 4 + 1)] = 0;
    rgba.copy(raw, y * (width * 4 + 1) + 1, y * width * 4, (y + 1) * width * 4);
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0); ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; ihdr[9] = 6; ihdr[10] = 0; ihdr[11] = 0; ihdr[12] = 0;
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk("IHDR", ihdr), chunk("IDAT", zlib.deflateSync(raw)), chunk("IEND", Buffer.alloc(0)),
  ]);
}

const S = 4, W = PALETTE.length * S, H = S;
const rgba = Buffer.alloc(W * H * 4);
PALETTE.forEach((hex, i) => {
  const r = parseInt(hex.slice(1, 3), 16), g = parseInt(hex.slice(3, 5), 16), b = parseInt(hex.slice(5, 7), 16);
  for (let y = 0; y < H; y++) for (let x = i * S; x < (i + 1) * S; x++) {
    const o = (y * W + x) * 4; rgba[o] = r; rgba[o + 1] = g; rgba[o + 2] = b; rgba[o + 3] = 255;
  }
});
fs.writeFileSync(__dirname + "/palette.png", png(W, H, rgba));
fs.writeFileSync(__dirname + "/palette.b64", fs.readFileSync(__dirname + "/palette.png").toString("base64"));
console.log("palette.png", W + "x" + H, PALETTE.length, "colors");
