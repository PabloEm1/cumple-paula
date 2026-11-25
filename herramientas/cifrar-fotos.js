// =====================================================================
//  Cifra las fotos que usa el juego y las guarda en fotos-cifradas/
//  Uso (desde la carpeta cumple-paula):   node herramientas/cifrar-fotos.js
//  o haz doble clic en  cifrar-fotos.bat
//
//  Lee qué fotos se usan en js/contenido.js, las cifra con la misma
//  clave que la carta (17/12) y genera:
//    • fotos-cifradas/1.bin, 2.bin, ...   (las fotos, ilegibles sin la clave)
//    • js/fotos-cifradas.js               (la lista para que el juego las encuentre)
//  La carpeta fotos/ con las fotos originales NO se sube (ver LEEME.md).
// =====================================================================
'use strict';
const fs = require('fs');
const path = require('path');
const { webcrypto } = require('crypto');

const CLAVE = '1712';          // la misma que la carta: 17/12
const ITERACIONES = 200000;

const raiz = path.join(__dirname, '..');
const carpetaSalida = path.join(raiz, 'fotos-cifradas');
const destino = path.join(raiz, 'js', 'fotos-cifradas.js');

const TIPOS = { '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png', '.webp': 'image/webp', '.gif': 'image/gif', '.svg': 'image/svg+xml' };

// Leer js/contenido.js para saber qué fotos se usan
global.window = {};
require(path.join(raiz, 'js', 'contenido.js'));
const N = window.CONTENIDO.niveles;
const usadas = [...new Set([
  ...N.memoria.fotos,
  ...N.borrosa.rondas.map(r => r.foto),
  N.puzzle.foto,
])];

const faltan = usadas.filter(f => !fs.existsSync(path.join(raiz, f)));
if (faltan.length) {
  console.error('✗ No encuentro estas fotos (revisa los nombres en js/contenido.js):');
  faltan.forEach(f => console.error('   ' + f));
  process.exit(1);
}

(async () => {
  const salt = webcrypto.getRandomValues(new Uint8Array(16));
  const base = await webcrypto.subtle.importKey('raw', new TextEncoder().encode(CLAVE), 'PBKDF2', false, ['deriveKey']);
  const llave = await webcrypto.subtle.deriveKey(
    { name: 'PBKDF2', salt, iterations: ITERACIONES, hash: 'SHA-256' },
    base, { name: 'AES-GCM', length: 256 }, false, ['encrypt']);

  // Empezar limpio: borrar los .bin viejos
  fs.mkdirSync(carpetaSalida, { recursive: true });
  for (const f of fs.readdirSync(carpetaSalida)) if (f.endsWith('.bin')) fs.unlinkSync(path.join(carpetaSalida, f));

  const mapa = {};
  let total = 0;
  for (let i = 0; i < usadas.length; i++) {
    const ruta = usadas[i];
    const bytes = fs.readFileSync(path.join(raiz, ruta));
    const iv = webcrypto.getRandomValues(new Uint8Array(12));
    const cifrado = new Uint8Array(await webcrypto.subtle.encrypt({ name: 'AES-GCM', iv }, llave, bytes));
    const nombre = `${i + 1}.bin`;
    // Formato del .bin: 12 bytes de iv + datos cifrados
    fs.writeFileSync(path.join(carpetaSalida, nombre), Buffer.concat([Buffer.from(iv), Buffer.from(cifrado)]));
    mapa[ruta] = { archivo: 'fotos-cifradas/' + nombre, tipo: TIPOS[path.extname(ruta).toLowerCase()] || 'image/jpeg' };
    total += bytes.length;
    console.log(`   ${ruta.padEnd(28)} → fotos-cifradas/${nombre}  (${Math.round(bytes.length / 1024)} KB)`);
  }

  const salida =
`// Archivo generado automáticamente: NO lo edites a mano.
// Para cambiar las fotos edita js/contenido.js y ejecuta: node herramientas/cifrar-fotos.js
window.FOTOS_CIFRADAS = {
  iter: ${ITERACIONES},
  salt: "${Buffer.from(salt).toString('base64')}",
  mapa: ${JSON.stringify(mapa, null, 2).replace(/\n/g, '\n  ')}
};
`;
  fs.writeFileSync(destino, salida, 'utf8');
  console.log(`✓ ${usadas.length} fotos cifradas (${Math.round(total / 1024)} KB) → fotos-cifradas/ y js/fotos-cifradas.js`);
})().catch(e => { console.error('✗ Error:', e); process.exit(1); });
