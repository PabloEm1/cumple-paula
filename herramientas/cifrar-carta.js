// =====================================================================
//  Cifra carta.txt con la contraseña y genera js/carta-cifrada.js
//  Uso (desde la carpeta cumple-paula):   node herramientas/cifrar-carta.js
//  o haz doble clic en  cifrar-carta.bat
// =====================================================================
'use strict';
const fs = require('fs');
const path = require('path');
const { webcrypto } = require('crypto');

const CLAVE = '1712';          // 17/12 → solo los 4 números (día y mes)
const ITERACIONES = 200000;
const NUM_FRAGMENTOS = 5;

const raiz = path.join(__dirname, '..');
const origen = path.join(raiz, 'carta.txt');
const destino = path.join(raiz, 'js', 'carta-cifrada.js');

if (!fs.existsSync(origen)) {
  console.error('✗ No encuentro carta.txt en la carpeta cumple-paula');
  process.exit(1);
}

const texto = fs.readFileSync(origen, 'utf8')
  .replace(/^﻿/, '')
  .replace(/\r\n?/g, '\n')
  .split('\n').filter(l => !l.trimStart().startsWith('#')).join('\n'); // las líneas con # son notas

let partes = texto.split(/\n[ \t]*-{3,}[ \t]*\n/).map(p => p.trim()).filter(Boolean);

if (partes.length !== NUM_FRAGMENTOS) {
  console.warn(`⚠ Encontré ${partes.length} fragmento(s) separados con ---; repartiré los párrafos en ${NUM_FRAGMENTOS}.`);
  const parrafos = partes.join('\n\n').split(/\n\s*\n/).map(p => p.trim()).filter(Boolean);
  if (parrafos.length < NUM_FRAGMENTOS) {
    console.error(`✗ La carta necesita al menos ${NUM_FRAGMENTOS} párrafos (o 5 partes separadas con ---).`);
    process.exit(1);
  }
  partes = [];
  for (let i = 0; i < NUM_FRAGMENTOS; i++) {
    const a = Math.round(i * parrafos.length / NUM_FRAGMENTOS), b = Math.round((i + 1) * parrafos.length / NUM_FRAGMENTOS);
    partes.push(parrafos.slice(a, b).join('\n\n'));
  }
}

(async () => {
  const enc = new TextEncoder();
  const salt = webcrypto.getRandomValues(new Uint8Array(16));
  const iv = webcrypto.getRandomValues(new Uint8Array(12));
  const base = await webcrypto.subtle.importKey('raw', enc.encode(CLAVE), 'PBKDF2', false, ['deriveKey']);
  const llave = await webcrypto.subtle.deriveKey(
    { name: 'PBKDF2', salt, iterations: ITERACIONES, hash: 'SHA-256' },
    base, { name: 'AES-GCM', length: 256 }, false, ['encrypt']);
  const datos = await webcrypto.subtle.encrypt({ name: 'AES-GCM', iv }, llave, enc.encode(JSON.stringify({ partes })));
  const b64 = u => Buffer.from(u).toString('base64');

  const salida =
`// Archivo generado automáticamente: NO lo edites a mano.
// Para cambiar la carta edita carta.txt y ejecuta: node herramientas/cifrar-carta.js
window.CARTA_CIFRADA = {
  iter: ${ITERACIONES},
  salt: "${b64(salt)}",
  iv: "${b64(iv)}",
  datos: "${b64(new Uint8Array(datos))}"
};
`;
  fs.writeFileSync(destino, salida, 'utf8');
  console.log(`✓ Carta cifrada en ${NUM_FRAGMENTOS} fragmentos → js/carta-cifrada.js`);
  partes.forEach((p, i) => console.log(`   Fragmento ${i + 1}: ${p.length} letras — "${p.slice(0, 40).replace(/\n/g, ' ')}..."`));
})().catch(e => { console.error('✗ Error:', e); process.exit(1); });
