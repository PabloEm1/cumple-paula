// =====================================================================
//  Convierte los dibujos de Aseprite en PNG para el juego
//  Uso (desde la carpeta cumple-paula):   node herramientas/exportar-sprites.js
//  o haz doble clic en  exportar-sprites.bat
//
//  Lee todos los .aseprite de la carpeta Sprites/ (la que está al lado
//  de cumple-paula) y guarda img/<nombre>.png en minúsculas, recortado
//  al dibujo (sin el borde vacío). Usa el primer fotograma y junta las
//  capas visibles. Repítelo cada vez que cambies un dibujo.
// =====================================================================
'use strict';
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

const raiz = path.join(__dirname, '..');
const carpetaSprites = path.join(raiz, '..', 'Sprites');
const carpetaSalida = path.join(raiz, 'img');

// ---------------------------------------------------------------------
//  Leer un .aseprite (formato: github.com/aseprite/aseprite/blob/main/docs/ase-file-specs.md)
// ---------------------------------------------------------------------
function leerAseprite(archivo) {
  const b = fs.readFileSync(archivo);
  if (b.readUInt16LE(4) !== 0xA5E0) throw new Error('no es un archivo de Aseprite');
  const W = b.readUInt16LE(8), H = b.readUInt16LE(10), bits = b.readUInt16LE(12);
  const transparente = b[28];
  const paleta = [], capas = [], celdas = [];
  const fotogramas = b.readUInt16LE(6);
  let off = 128;
  for (let f = 0; f < fotogramas; f++) {
    const tamFrame = b.readUInt32LE(off);
    let trozos = b.readUInt16LE(off + 6);
    if (b.readUInt32LE(off + 12)) trozos = b.readUInt32LE(off + 12);
    let c = off + 16;
    for (let i = 0; i < trozos; i++) {
      const tam = b.readUInt32LE(c), tipo = b.readUInt16LE(c + 4), d = c + 6;
      if (tipo === 0x2019) {                     // paleta
        const primero = b.readUInt32LE(d + 4), ultimo = b.readUInt32LE(d + 8);
        let p = d + 20;
        for (let k = primero; k <= ultimo; k++) {
          const flags = b.readUInt16LE(p);
          paleta[k] = [b[p + 2], b[p + 3], b[p + 4], b[p + 5]];
          p += 6;
          if (flags & 1) p += 2 + b.readUInt16LE(p);
        }
      } else if (tipo === 0x2004 && f === 0) {   // capa
        capas.push({ visible: (b.readUInt16LE(d) & 1) === 1, opacidad: b[d + 12] });
      } else if (tipo === 0x2005 && f === 0) {   // celda (los píxeles de una capa)
        const capa = b.readUInt16LE(d), x = b.readInt16LE(d + 2), y = b.readInt16LE(d + 4);
        const opacidad = b[d + 6], tipoCelda = b.readUInt16LE(d + 7);
        if (tipoCelda === 0 || tipoCelda === 2) {
          const w = b.readUInt16LE(d + 16), h = b.readUInt16LE(d + 18);
          let px = b.subarray(d + 20, c + tam);
          if (tipoCelda === 2) px = zlib.inflateSync(px);
          celdas.push({ capa, x, y, w, h, px, opacidad });
        }
      }
      c += tam;
    }
    off += tamFrame;
  }

  // Juntar las capas visibles en una imagen RGBA
  const rgba = Buffer.alloc(W * H * 4);
  const bpp = bits / 8;
  celdas.sort((a, z) => a.capa - z.capa);
  for (const cel of celdas) {
    const capa = capas[cel.capa] || { visible: true, opacidad: 255 };
    if (!capa.visible) continue;
    const alfaCapa = (cel.opacidad / 255) * (capa.opacidad / 255);
    for (let y = 0; y < cel.h; y++) for (let x = 0; x < cel.w; x++) {
      const X = cel.x + x, Y = cel.y + y;
      if (X < 0 || Y < 0 || X >= W || Y >= H) continue;
      const i = (y * cel.w + x) * bpp;
      let r, g, bl, a;
      if (bpp === 4) [r, g, bl, a] = cel.px.subarray(i, i + 4);
      else if (bpp === 2) { r = g = bl = cel.px[i]; a = cel.px[i + 1]; }
      else { if (cel.px[i] === transparente) continue; [r, g, bl, a] = paleta[cel.px[i]] || [0, 0, 0, 0]; }
      a = Math.round(a * alfaCapa);
      if (!a) continue;
      const o = (Y * W + X) * 4, ab = rgba[o + 3] / 255, af = a / 255, ao = af + ab * (1 - af);
      for (const [k, v] of [[0, r], [1, g], [2, bl]]) rgba[o + k] = Math.round((v * af + rgba[o + k] * ab * (1 - af)) / ao);
      rgba[o + 3] = Math.round(ao * 255);
    }
  }
  return { W, H, rgba };
}

// Recortar al dibujo (ignora píxeles casi invisibles)
function recortar({ W, H, rgba }) {
  let x0 = W, y0 = H, x1 = -1, y1 = -1;
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    if (rgba[(y * W + x) * 4 + 3] > 16) { x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y); }
  }
  if (x1 < 0) throw new Error('el dibujo está vacío');
  const w = x1 - x0 + 1, h = y1 - y0 + 1, out = Buffer.alloc(w * h * 4);
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const o = ((y0 + y) * W + x0 + x) * 4;
    if (rgba[o + 3] > 16) rgba.copy(out, (y * w + x) * 4, o, o + 4);
  }
  return { W: w, H: h, rgba: out };
}

// ---------------------------------------------------------------------
//  Escribir PNG
// ---------------------------------------------------------------------
const TABLA_CRC = Array.from({ length: 256 }, (_, n) => {
  let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; return c >>> 0;
});
function crc32(buf) { let c = 0xffffffff; for (const v of buf) c = TABLA_CRC[(c ^ v) & 0xff] ^ (c >>> 8); return (c ^ 0xffffffff) >>> 0; }
function trozoPNG(tipo, datos) {
  const largo = Buffer.alloc(4); largo.writeUInt32BE(datos.length);
  const td = Buffer.concat([Buffer.from(tipo), datos]);
  const crc = Buffer.alloc(4); crc.writeUInt32BE(crc32(td));
  return Buffer.concat([largo, td, crc]);
}
function png({ W, H, rgba }) {
  const filas = Buffer.alloc((W * 4 + 1) * H);
  for (let y = 0; y < H; y++) rgba.copy(filas, y * (W * 4 + 1) + 1, y * W * 4, (y + 1) * W * 4);
  const cab = Buffer.alloc(13); cab.writeUInt32BE(W); cab.writeUInt32BE(H, 4); cab[8] = 8; cab[9] = 6;
  return Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    trozoPNG('IHDR', cab), trozoPNG('IDAT', zlib.deflateSync(filas)), trozoPNG('IEND', Buffer.alloc(0))]);
}

// ---------------------------------------------------------------------
if (!fs.existsSync(carpetaSprites)) { console.log('No encuentro la carpeta ' + carpetaSprites); process.exit(1); }
fs.mkdirSync(carpetaSalida, { recursive: true });
const archivos = fs.readdirSync(carpetaSprites).filter(f => /\.(aseprite|ase)$/i.test(f));
if (!archivos.length) console.log('No hay archivos .aseprite en ' + carpetaSprites);
for (const f of archivos) {
  const nombre = path.parse(f).name.toLowerCase() + '.png';
  try {
    const img = recortar(leerAseprite(path.join(carpetaSprites, f)));
    fs.writeFileSync(path.join(carpetaSalida, nombre), png(img));
    console.log(`✓ ${f}  →  img/${nombre}  (${img.W}x${img.H})`);
  } catch (e) {
    console.log(`✗ ${f}: ${e.message}`);
  }
}
