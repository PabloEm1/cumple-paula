// =====================================================================
//  Motor del juego: progreso, carta cifrada, diálogos, mapa
// =====================================================================
'use strict';

const C = window.CONTENIDO;
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const esperar = ms => new Promise(r => setTimeout(r, ms));
const esperarSiempre = () => new Promise(() => {});
const app = document.getElementById('app');
const capas = document.getElementById('capas');

function txt(s) {
  return String(s ?? '')
    .replace(/\{nombre\}/g, C.nombre)
    .replace(/\{deParte\}/g, C.deParte)
    .replace(/\{companero\}/g, C.companero);
}
function esc(s) {
  return String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}
function mezclar(a) {
  a = [...a];
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
}
const azar = a => a[Math.floor(Math.random() * a.length)];
const lista = x => (Array.isArray(x) ? x : [x]).filter(Boolean);

// ---------------------------------------------------------------------
//  Progreso guardado en el teléfono
// ---------------------------------------------------------------------
const ESTRELLAS_POR_NIVEL = [4, 4, 4, 4, 3]; // total 19
const LLAVE = 'paula19_progreso';

function cargarEstado() {
  let e = {};
  try { e = JSON.parse(localStorage.getItem(LLAVE) || '{}'); } catch (_) {}
  return Object.assign({ completados: 0, introVista: false, clave: null, finalVisto: false, despedidaVista: false }, e);
}
let estado = cargarEstado();
function guardar() { try { localStorage.setItem(LLAVE, JSON.stringify(estado)); } catch (_) {} }
function estrellasBase() { return ESTRELLAS_POR_NIVEL.slice(0, estado.completados).reduce((a, b) => a + b, 0); }

// ---------------------------------------------------------------------
//  Carta cifrada (AES-GCM con la fecha como contraseña)
// ---------------------------------------------------------------------
let CARTA = null; // array con los 5 fragmentos, ya descifrados

function b64aBytes(b64) {
  const bin = atob(b64), u = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) u[i] = bin.charCodeAt(i);
  return u;
}
async function descifrarCarta(clave) {
  const c = window.CARTA_CIFRADA;
  if (!c) { const e = new Error('Falta js/carta-cifrada.js'); e.name = 'SinCarta'; throw e; }
  if (!window.crypto || !crypto.subtle) { const e = new Error('Sin crypto'); e.name = 'SinCripto'; throw e; }
  const enc = new TextEncoder();
  const base = await crypto.subtle.importKey('raw', enc.encode(clave), 'PBKDF2', false, ['deriveKey']);
  const llave = await crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt: b64aBytes(c.salt), iterations: c.iter, hash: 'SHA-256' },
    base, { name: 'AES-GCM', length: 256 }, false, ['decrypt']);
  const plano = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: b64aBytes(c.iv) }, llave, b64aBytes(c.datos));
  return JSON.parse(new TextDecoder().decode(plano));
}

// ---------------------------------------------------------------------
//  Fotos cifradas (misma clave que la carta, ver herramientas/cifrar-fotos.js)
// ---------------------------------------------------------------------
const FOTOS_URL = {};          // "fotos/x.jpg" → blob: con la foto ya descifrada
let fotosPromesa = null;

function descifrarFotos(clave) {
  if (fotosPromesa) return fotosPromesa;
  const c = window.FOTOS_CIFRADAS;
  if (!c || !window.crypto || !crypto.subtle) return (fotosPromesa = Promise.resolve());
  fotosPromesa = (async () => {
    const base = await crypto.subtle.importKey('raw', new TextEncoder().encode(clave), 'PBKDF2', false, ['deriveKey']);
    const llave = await crypto.subtle.deriveKey(
      { name: 'PBKDF2', salt: b64aBytes(c.salt), iterations: c.iter, hash: 'SHA-256' },
      base, { name: 'AES-GCM', length: 256 }, false, ['decrypt']);
    await Promise.all(Object.entries(c.mapa).map(async ([ruta, f]) => {
      try {
        const bytes = new Uint8Array(await (await fetch(f.archivo)).arrayBuffer());
        const plano = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: bytes.subarray(0, 12) }, llave, bytes.subarray(12));
        FOTOS_URL[ruta] = URL.createObjectURL(new Blob([plano], { type: f.tipo }));
      } catch (e) { console.warn('No se pudo descifrar', ruta, e); }
    }));
  })().catch(e => console.warn('No se pudieron descifrar las fotos', e));
  return fotosPromesa;
}
// Espera a que las fotos estén listas (los niveles con fotos la llaman al empezar)
function fotosListas() { return fotosPromesa || Promise.resolve(); }
// Devuelve la foto descifrada; si no hay versión cifrada, usa el archivo normal
function foto(ruta) { return FOTOS_URL[ruta] || ruta; }

// ---------------------------------------------------------------------
//  Utilidades de pantalla
// ---------------------------------------------------------------------
// La pantalla nueva se crea al momento (el código que la usa no espera),
// pero se ve después de la transición: la vieja se tapa con rombos y la nueva se destapa.
function pantalla(clase, html) {
  const viejas = [...app.children];
  viejas.forEach(v => { v.classList.add('saliente'); v.querySelectorAll('[id]').forEach(e => e.removeAttribute('id')); });
  const el = document.createElement('div');
  el.className = `pantalla ${clase}`;
  el.innerHTML = html;
  app.appendChild(el);
  const cambiar = () => {
    viejas.forEach(v => v.remove());
    el.classList.remove('entrante');
    if (typeof Escena !== 'undefined') Escena.poner(clase);
  };
  if (viejas.length && Transicion.disponible()) { el.classList.add('entrante'); Transicion.pasar(cambiar); }
  else { cambiar(); if (Transicion.disponible()) Transicion.pasar(null); }
  $$('.btn-sonido', el).forEach(b => {
    const pintar = () => { b.textContent = Sonido.activo() ? '🔊' : '🔇'; };
    pintar();
    b.addEventListener('click', e => { e.stopPropagation(); Sonido.iniciar(); Sonido.alternar(); pintar(); Sonido.sfx('tap'); });
  });
  return el;
}

// ---------------------------------------------------------------------
//  Transición entre pantallas: rombos pixelados que barren en diagonal
// ---------------------------------------------------------------------
const Transicion = (() => {
  const CUBRIR = 280, DESCUBRIR = 380, CELDA = 6;     // ms, ms, tamaño del rombo (pixeles de escena)
  const COLOR = '#1a1c2c';
  let cv = null, g = null, P = 3, fase = 0, t0 = 0, alMedio = null, corriendo = false;
  const quieto = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;

  function preparar() {
    if (cv) return;
    cv = document.createElement('canvas');
    cv.id = 'transicion'; cv.className = 'pixelado';
    document.body.appendChild(cv);
    g = cv.getContext('2d');
    medir();
    window.addEventListener('resize', medir);
  }
  function medir() {
    P = (typeof Escena !== 'undefined' && Escena.tamPixel()) || 3;
    cv.width = Math.ceil(window.innerWidth / P); cv.height = Math.ceil(window.innerHeight / P);
    cv.style.width = cv.width * P + 'px'; cv.style.height = cv.height * P + 'px';
  }
  // cobertura 0 = nada tapado, 1 = todo tapado. Barre de arriba-izquierda a abajo-derecha.
  function dibujar(cobertura) {
    g.clearRect(0, 0, cv.width, cv.height);
    if (cobertura <= 0) return;
    g.fillStyle = COLOR;
    if (cobertura >= 1) { g.fillRect(0, 0, cv.width, cv.height); return; }
    const cols = Math.ceil(cv.width / CELDA) + 1, filas = Math.ceil(cv.height / CELDA) + 1, diag = cols + filas - 2;
    for (let j = 0; j < filas; j++) for (let i = 0; i < cols; i++) {
      const orden = (i + j) / diag;
      const local = Math.max(0, Math.min(1, cobertura * 1.7 - orden * 0.7));
      const r = Math.round(local * CELDA);
      if (!r) continue;
      const cx = i * CELDA, cy = j * CELDA;
      for (let dy = -r; dy <= r; dy++) { const a = r - Math.abs(dy); g.fillRect(cx - a, cy + dy, a * 2 + 1, 1); }
    }
  }
  // Los tiempos los marcan temporizadores (así el cambio llega a su hora aunque
  // el móvil dibuje lento); requestAnimationFrame solo dibuja los rombos.
  let reloj = null;
  function cuadro() {
    if (!fase) { corriendo = false; dibujar(0); return; }
    const dt = performance.now() - t0;
    dibujar(fase === 1 ? Math.min(1, dt / CUBRIR) : 1 - Math.min(1, dt / DESCUBRIR));
    requestAnimationFrame(cuadro);
  }
  function destapar() {
    fase = 2; t0 = performance.now();
    clearTimeout(reloj); reloj = setTimeout(() => { fase = 0; dibujar(0); }, DESCUBRIR);
  }
  function medio() {
    const f = alMedio; alMedio = null;
    if (f) f();
    destapar();
  }
  // cambiar: función que pone la pantalla nueva (a mitad). null = solo destapar.
  function pasar(cambiar) {
    preparar();
    if (fase === 1) {                                    // ya se estaba tapando: encadenar los cambios
      const antes = alMedio; alMedio = () => { if (antes) antes(); if (cambiar) cambiar(); };
      return;
    }
    if (fase === 2 && cambiar) { cambiar(); destapar(); } // a medio destapar: cambiar y volver a destapar
    else if (cambiar) { fase = 1; alMedio = cambiar; t0 = performance.now(); clearTimeout(reloj); reloj = setTimeout(medio, CUBRIR); }
    else destapar();
    if (!corriendo) { corriendo = true; requestAnimationFrame(cuadro); }
  }
  return { pasar, disponible: () => !quieto };
})();

function hudEstrellas(n) {
  return `<span class="hud-estrellas"><img class="pixelado" src="${spriteURL('estrella')}" alt=""><b id="contador">${n}</b>/19</span>`;
}

function crearCielo() {
  Escena.iniciar(document.getElementById('cielo'));
  Efectos.iniciar();
  document.documentElement.style.setProperty('--img-estrella', `url(${spriteURL('estrella')})`);
}

// Iconos en pixel art de cada lugar del mapa
const ICONOS = { memoria: 'pino', borrosa: 'camara', ketchup: 'heinz', cine: 'palomitas', puzzle: 'castillo' };
function icono(nombre, clase = '') { return `<img class="icono pixelado ${clase}" src="${spriteURL(nombre)}" alt="">`; }

function cargarImagen(src) {
  return new Promise(res => {
    const img = new Image();
    img.onload = () => res(img);
    img.onerror = () => res(null);
    img.src = src;
  });
}

// Recorta la foto en un cuadrado (para el rompecabezas)
async function imagenCuadrada(src, tam = 600) {
  const img = await cargarImagen(src);
  if (!img) return src;
  try {
    const cv = document.createElement('canvas'); cv.width = cv.height = tam;
    const iw = img.naturalWidth || img.width, ih = img.naturalHeight || img.height;
    const lado = Math.min(iw, ih);
    cv.getContext('2d').drawImage(img, (iw - lado) / 2, (ih - lado) / 2, lado, lado, 0, 0, tam, tam);
    return cv.toDataURL('image/jpeg', 0.88);
  } catch (_) { return src; }
}

// ---------------------------------------------------------------------
//  Diálogos de Stitch (el compañero)
// ---------------------------------------------------------------------
function cajaDialogoHTML(contenido) {
  return `<div class="dialogo"><img class="retrato pixelado" src="${spriteURL('blu')}" alt="">
    <div class="caja"><div class="quien">${esc(C.companero.toUpperCase())}</div>${contenido}<span class="sig">▼</span></div></div>`;
}

function dialogo(lineas) {
  lineas = lista(lineas).map(txt);
  if (!lineas.length) return Promise.resolve();
  return new Promise(resolve => {
    const capa = document.createElement('div');
    capa.className = 'capa-dialogo';
    capa.innerHTML = cajaDialogoHTML('<p class="texto"></p>');
    capas.appendChild(capa);
    const p = $('.texto', capa);
    let i = 0, escribiendo = false, timer = null, letras = [];

    function terminarLinea() {
      clearInterval(timer); escribiendo = false;
      p.textContent = letras.join(''); capa.classList.add('listo');
    }
    function mostrar() {
      letras = Array.from(lineas[i]); p.textContent = ''; escribiendo = true;
      capa.classList.remove('listo');
      let k = 0;
      clearInterval(timer);
      timer = setInterval(() => {
        k++; p.textContent = letras.slice(0, k).join('');
        if (k % 2 === 0) Sonido.sfx('texto');
        if (k >= letras.length) terminarLinea();
      }, 24);
    }
    capa.addEventListener('click', () => {
      if (escribiendo) return terminarLinea();
      i++;
      if (i >= lineas.length) { capa.remove(); resolve(); }
      else { Sonido.sfx('tap'); mostrar(); }
    });
    mostrar();
  });
}

function elegir(pregunta, opciones) {
  return new Promise(resolve => {
    const capa = document.createElement('div');
    capa.className = 'capa-dialogo';
    capa.innerHTML = cajaDialogoHTML(`<p class="texto">${esc(txt(pregunta))}</p>
      <div class="opciones-dialogo">${opciones.map((o, i) => `<button class="opcion" data-i="${i}">${esc(txt(o))}</button>`).join('')}</div>`);
    capas.appendChild(capa);
    Sonido.sfx('tap');
    capa.addEventListener('click', e => {
      const b = e.target.closest('[data-i]');
      if (!b) return;
      Sonido.sfx('tap'); capa.remove(); resolve(+b.dataset.i);
    });
  });
}

// Globito rápido que no detiene el juego
let burbujaActual = null;
function burbuja(texto, ms = 2200) {
  if (burbujaActual) burbujaActual.remove();
  const b = document.createElement('div');
  b.className = 'burbuja';
  b.innerHTML = `<img class="pixelado" src="${spriteURL('blu')}" alt=""><span>${esc(txt(texto))}</span>`;
  capas.appendChild(b);
  burbujaActual = b;
  setTimeout(() => { b.remove(); if (burbujaActual === b) burbujaActual = null; }, ms);
}

// Estrella que vuela hasta el contador
let colaEstrellas = Promise.resolve();
function efectoEstrella(total) {
  colaEstrellas = colaEstrellas.then(async () => {
    const cont = document.getElementById('contador');
    const img = document.createElement('img');
    img.src = spriteURL('estrella'); img.className = 'estrella-vuela pixelado';
    capas.appendChild(img);
    const rc = capas.getBoundingClientRect();
    const x0 = rc.width / 2 - 13, y0 = rc.height * 0.42;
    let x1 = rc.width - 60, y1 = 10;
    if (cont) { const d = cont.getBoundingClientRect(); x1 = d.left - rc.left - 26; y1 = d.top - rc.top - 4; }
    Sonido.sfx('estrella');
    try {
      await img.animate([
        { transform: `translate(${x0}px,${y0}px) scale(.5)`, opacity: 0 },
        { transform: `translate(${x0}px,${y0 - 30}px) scale(3)`, opacity: 1, offset: 0.35 },
        { transform: `translate(${x1}px,${y1}px) scale(1)`, opacity: 1 },
      ], { duration: 750, easing: 'ease-in' }).finished;
    } catch (_) { await esperar(750); }
    img.remove();
    if (cont && cont.isConnected) {
      Efectos.en(cont, 8, Efectos.DORADO, 0.6);
      cont.textContent = total;
      const h = cont.parentElement; h.classList.remove('pop'); void h.offsetWidth; h.classList.add('pop');
    }
  });
  return colaEstrellas;
}

// Borde de papel roto (clip-path)
function poligonoRoto(arriba = true, abajo = true, dientes = 14, amp = 7) {
  const pts = [];
  for (let k = 0; k <= dientes; k++) {
    const y = arriba ? (k % 2 ? amp : Math.random() * amp * 0.4) : 0;
    pts.push(`${(k * 100 / dientes).toFixed(1)}% ${y.toFixed(1)}px`);
  }
  for (let k = dientes; k >= 0; k--) {
    const y = abajo ? (k % 2 ? amp : Math.random() * amp * 0.4) : 0;
    pts.push(`${(k * 100 / dientes).toFixed(1)}% calc(100% - ${y.toFixed(1)}px)`);
  }
  return `polygon(${pts.join(',')})`;
}

// ---------------------------------------------------------------------
//  Control de nivel (estrellas que se van ganando)
// ---------------------------------------------------------------------
let nivelToken = null;
function crearControl(i) {
  const token = {};
  nivelToken = token;
  const total = i < estado.completados ? 0 : ESTRELLAS_POR_NIVEL[i]; // al repetir un nivel no se ganan más
  let ganadas = 0;
  return {
    vivo: () => nivelToken === token,
    progreso(p) {
      const deberia = Math.min(total, Math.floor(p * total + 1e-9));
      while (ganadas < deberia) { ganadas++; efectoEstrella(estrellasBase() + ganadas); }
    },
  };
}

// ---------------------------------------------------------------------
//  Pantalla de inicio
// ---------------------------------------------------------------------
function pantallaInicio() {
  const titulo = esc(txt(C.tituloJuego).toUpperCase()).replace(/\b19\b/, '<span class="num">19</span>');
  const s = pantalla('inicio', `
    <button class="btn-mini btn-sonido esquina"></button>
    <div class="titulo-juego">${titulo}</div>
    <img class="blu-grande pixelado" src="${spriteURL('bluMira')}" alt="">
    <div class="press parpadea">TOCA PARA EMPEZAR</div>
    <div class="pie">★ ★ ★</div>`);
  s.addEventListener('click', () => {
    Sonido.iniciar(); Sonido.sfx('estrella'); Sonido.musica('aventura');
    continuarTrasInicio();
  }, { once: true });
}

async function continuarTrasInicio() {
  if (estado.clave) {
    try { CARTA = (await descifrarCarta(estado.clave)).partes; descifrarFotos(estado.clave); return irTrasClave(); }
    catch (e) { estado.clave = null; guardar(); }
  }
  pantallaClave();
}

async function irTrasClave() {
  pantallaMapa();
  if (!estado.introVista) {
    await dialogo(C.intro);
    estado.introVista = true; guardar();
  } else if (estado.completados > 0 && estado.completados < 5) {
    await dialogo(C.bienvenida);
  }
}

// ---------------------------------------------------------------------
//  Pantalla de la contraseña (teclado retro)
// ---------------------------------------------------------------------
function pantallaClave() {
  let digitos = '', intentos = 0, ocupado = false;
  const s = pantalla('clave', `
    <div class="titulo-pixel">${esc(txt(C.clave.titulo).toUpperCase())}</div>
    <div class="cofre">${icono('cofre')}</div>
    <p class="clave-texto">${esc(txt(C.clave.texto))}</p>
    <div class="visor"><span></span><span></span><b>/</b><span></span><span></span></div>
    <p class="clave-pista"></p>
    <div class="teclado">${[1, 2, 3, 4, 5, 6, 7, 8, 9, '⌫', 0, '✓'].map(k => `<button class="tecla" data-k="${k}">${k}</button>`).join('')}</div>`);
  const casillas = $$('.visor span', s), pistaEl = $('.clave-pista', s), visor = $('.visor', s);

  function pintar() {
    casillas.forEach((c, i) => { c.textContent = digitos[i] || ''; c.classList.toggle('activa', i === digitos.length); });
  }
  async function probar() {
    ocupado = true;
    try {
      const datos = await descifrarCarta(digitos);
      CARTA = datos.partes;
      estado.clave = digitos; guardar();
      descifrarFotos(digitos);
      $('.cofre', s).innerHTML = icono('cofreAbierto'); visor.classList.add('ok');
      Efectos.en($('.cofre', s), 36, Efectos.DORADO, 1.3);
      pistaEl.textContent = '';
      Sonido.sfx('fragmento');
      await esperar(1300);
      irTrasClave();
    } catch (err) {
      if (err && (err.name === 'SinCripto' || err.name === 'SinCarta')) {
        pistaEl.textContent = err.name === 'SinCripto'
          ? '⚠ Abre el juego desde su enlace https para que funcione.'
          : '⚠ Falta crear la carta (ver LEEME.md).';
        ocupado = false; return;
      }
      intentos++;
      Sonido.sfx('error');
      visor.classList.remove('temblar'); void visor.offsetWidth; visor.classList.add('temblar');
      pistaEl.textContent = txt(C.clave.pistas[Math.min(intentos - 1, C.clave.pistas.length - 1)]);
      await esperar(600);
      digitos = ''; pintar(); ocupado = false;
    }
  }
  $('.teclado', s).addEventListener('click', e => {
    const b = e.target.closest('.tecla');
    if (!b || ocupado) return;
    const k = b.dataset.k;
    Sonido.sfx('tap');
    if (k === '⌫') digitos = digitos.slice(0, -1);
    else if (k === '✓') { if (digitos.length === 4) return probar(); }
    else if (digitos.length < 4) digitos += k;
    pintar();
    if (digitos.length === 4 && k !== '✓' && k !== '⌫') probar();
  });
  pintar();
}

// ---------------------------------------------------------------------
//  Mapa del reino
// ---------------------------------------------------------------------
const POS_MAPA = [[27, 87], [72, 68], [28, 49], [72, 30], [40, 10]];

function pantallaMapa() {
  nivelToken = null;
  Sonido.musica('aventura');
  const comp = estado.completados;
  // ¿Ha avanzado desde la última vez que vio el mapa? Entonces la niebla se retira con animación
  const antes = Math.min(estado.mapaVisto ?? comp, comp);
  estado.mapaVisto = comp; guardar();
  window.MAPA_PROGRESO = { antes, ahora: comp };
  const nodos = NIVELES.map((n, i) => {
    const cont = C.niveles[n.id];
    const cls = i < comp ? 'hecho' : (i === comp ? 'actual' : 'bloqueado');
    const [x, y] = POS_MAPA[i];
    return `<button class="nodo ${cls}" data-i="${i}" style="left:${x}%;top:${y}%">
      <span class="circulo"><span>${i > comp ? icono('candado', 'chico') : icono(ICONOS[n.id] || 'estrella')}</span>${i < comp ? '<b class="check">✓</b>' : ''}</span>
      <span class="etiqueta">${esc(txt(cont.lugar).toUpperCase())}</span></button>`;
  }).join('');
  const blu = comp < 5
    ? `<img class="blu-mapa pixelado" src="${spriteURL('blu')}" alt="" style="left:${POS_MAPA[comp][0]}%;top:${POS_MAPA[comp][1]}%">` : '';
  const boton = comp >= 5
    ? `<div class="barra-abajo"><button class="btn btn-final">${estado.finalVisto ? '✉ Leer la carta' : '✉ Unir los fragmentos'}</button></div>` : '';

  const s = pantalla('mapa', `
    <div class="hud"><button class="btn-mini btn-sonido"></button>
      <span class="hud-titulo">${esc(txt(C.tituloJuego).toUpperCase())}</span>${hudEstrellas(estrellasBase())}</div>
    <div class="barra-fragmentos">CARTA: ${[0, 1, 2, 3, 4].map(i => `<span class="slot ${i < comp ? 'lleno' : ''}"></span>`).join('')}</div>
    <div class="mapa-zona">
      <svg viewBox="0 0 100 100" preserveAspectRatio="none"><polyline class="camino" points="${POS_MAPA.map(p => p.join(',')).join(' ')}"/></svg>
      ${nodos}${blu}
    </div>${boton}`);

  $('.mapa-zona', s).addEventListener('click', e => {
    const n = e.target.closest('.nodo');
    if (!n) return;
    const i = +n.dataset.i;
    if (i > estado.completados) {
      Sonido.sfx('error');
      burbuja(`¡Primero el ${txt(C.niveles[NIVELES[estado.completados].id].lugar)}!`);
      return;
    }
    Sonido.sfx('tap');
    entrarNivel(i);
  });
  const bf = $('.btn-final', s);
  if (bf) bf.onclick = () => { Sonido.sfx('tap'); secuenciaFinal(); };

  if (antes < comp) {
    // la niebla empieza a irse ~0,85 s después de cambiar de pantalla y tarda ~1,7 s
    setTimeout(() => { if (s.isConnected) Sonido.sfx('magia'); }, 850);
    setTimeout(() => {
      if (!s.isConnected) return;
      Efectos.en($('.nodo.actual .circulo', s) || bf, 30, Efectos.DORADO, 1.1);
      Sonido.sfx(comp >= 5 ? 'victoria' : 'estrella');
      const m = C.mapa || {};
      burbuja(comp >= 5 ? (m.todoDespejado || '¡Todo el reino brilla! ✨') : (m.nieblaFuera || '¡La niebla se fue! ✨'), 2800);
    }, 2500);
  }
}

// ---------------------------------------------------------------------
//  Entrar a un nivel y ganar su fragmento
// ---------------------------------------------------------------------
async function entrarNivel(i) {
  const def = NIVELES[i];
  const cont = C.niveles[def.id];
  const ctl = crearControl(i);
  await def.jugar(ctl, cont);
  if (!ctl.vivo()) return;
  ctl.progreso(1);
  await colaEstrellas;
  if (!ctl.vivo()) return;
  nivelToken = null;
  estado.completados = Math.max(estado.completados, i + 1);
  guardar();
  await pantallaFragmento(i, cont);
}

async function pantallaFragmento(i, cont) {
  const texto = esc(CARTA[i] || '').replace(/\n/g, '<br>');
  const s = pantalla('fragmento', `
    <div class="titulo-pixel">¡FRAGMENTO<br>${i + 1} DE 5!</div>
    <div class="pieza-grande papel" style="clip-path:${poligonoRoto()}"><div class="borroso">${texto}</div></div>
    <p class="nota">Se podrá leer cuando juntes los 5…</p>
    <button class="btn oculto">Continuar ▶</button>`);
  Sonido.sfx('fragmento');
  await esperar(950);
  Efectos.en($('.pieza-grande', s), 40, Efectos.DORADO, 1.3);
  await esperar(150);
  await dialogo(cont.final);
  const b = $('.btn', s);
  b.classList.remove('oculto');
  b.onclick = () => {
    Sonido.sfx('tap');
    if (i === 4 && !estado.finalVisto) secuenciaFinal();
    else pantallaMapa();
  };
}
