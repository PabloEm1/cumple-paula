// =====================================================================
//  Escenarios en pixel art detrás de cada pantalla (con animaciones
//  suaves: estrellas, luciérnagas, antorchas...) y efectos de chispas.
//  No hace falta tocar este archivo para cambiar textos ni fotos.
// =====================================================================
'use strict';

const BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5];

const Escena = (() => {
  let cv = null, g = null, w = 0, h = 0, P = 3, nombre = '', fondo = null;
  let actores = [], t = 0, ultimo = 0, rnd = Math.random;
  let colX0 = 0, colW = 0; // la columna del juego, en pixeles de la escena

  function azarFijo(semilla) { let x = (semilla % 2147483646) + 1; return () => (x = (x * 16807) % 2147483647) / 2147483647; }

  function iniciar(cont) {
    cv = document.createElement('canvas');
    cv.id = 'escena'; cv.className = 'pixelado';
    cont.innerHTML = ''; cont.appendChild(cv);
    g = cv.getContext('2d');
    cv.addEventListener('contextrestored', () => pintar()); // si el navegador borró el lienzo en segundo plano
    document.addEventListener('visibilitychange', () => { if (!document.hidden) pintar(); });
    medir();
    let espera = null;
    window.addEventListener('resize', () => { clearTimeout(espera); espera = setTimeout(() => { medir(); pintar(); }, 120); });
    requestAnimationFrame(cuadro);
  }
  function medir() {
    const W = window.innerWidth, H = window.innerHeight;
    P = Math.max(3, Math.round(Math.min(W, 480) / 125));
    w = Math.ceil(W / P); h = Math.ceil(H / P);
    cv.width = w; cv.height = h;
    cv.style.width = w * P + 'px'; cv.style.height = h * P + 'px';
    colW = Math.min(w, Math.ceil(480 / P)); colX0 = Math.floor((w - colW) / 2);
  }
  function escenaDe(clase) {
    const c = ` ${clase} `;
    if (c.includes(' inicio ')) return 'noche';
    if (c.includes(' clave ')) return 'tesoro';
    if (c.includes(' mapa ')) return 'reino';
    if (c.includes('nivel-memoria')) return 'bosque';
    if (c.includes('nivel-borrosa')) return 'torre';
    if (c.includes('nivel-ketchup')) return 'atardecer';
    if (c.includes('nivel-cine')) return 'cine';
    if (c.includes('nivel-puzzle')) return 'castillo';
    if (c.includes(' fragmento ')) return 'magia';
    return 'nocheSimple';
  }
  function poner(clase) {
    if (!g) return;
    const n = escenaDe(clase);
    if (n === nombre && n !== 'reino') return;
    nombre = n; pintar();
  }
  function pintar() {
    if (!g) return;
    const f = document.createElement('canvas'); f.width = w; f.height = h;
    const c = f.getContext('2d');
    rnd = azarFijo(1712 + nombre.length * 97);
    actores = [];
    try { (ESCENAS[nombre] || ESCENAS.nocheSimple)(c); } catch (e) { console.warn('Escena', nombre, e); }
    fondo = f;
    g.drawImage(fondo, 0, 0);
    for (const a of actores) a(g, t, 0);
  }
  function cuadro(ahora) {
    requestAnimationFrame(cuadro);
    if (ultimo && ahora - ultimo < 50) return; // ~20 fps: suficiente para pixel art y ahorra batería
    const dt = ultimo ? Math.min(0.1, (ahora - ultimo) / 1000) : 0;
    ultimo = ahora; t += dt;
    if (!fondo) return;
    g.drawImage(fondo, 0, 0);
    for (const a of actores) a(g, t, dt);
    g.globalAlpha = 1;
  }

  // ---------------------------------------------------------------
  //  Pinceles
  // ---------------------------------------------------------------
  function px(c, x, y, col) { c.fillStyle = col; c.fillRect(Math.round(x), Math.round(y), 1, 1); }
  function rect(c, x, y, ww, hh, col) { c.fillStyle = col; c.fillRect(Math.round(x), Math.round(y), Math.round(ww), Math.round(hh)); }

  // cielo en franjas con tramado entre colores
  function franjas(c, cols, y0, y1) {
    const alto = (y1 - y0) / cols.length;
    cols.forEach((col, i) => {
      const y = Math.floor(y0 + i * alto);
      rect(c, 0, y, w, Math.ceil(alto) + 1, col);
      if (i > 0) {
        c.fillStyle = cols[i - 1];
        for (let x = i % 2; x < w; x += 2) c.fillRect(x, y, 1, 1);
        for (let x = (i + 1) % 4; x < w; x += 4) c.fillRect(x, y + 1, 1, 1);
      }
    });
    rect(c, 0, Math.floor(y1), w, h - y1, cols[cols.length - 1]);
  }
  function estrellas(c, n, y1, titilan = 14) {
    const lista = [];
    for (let i = 0; i < n; i++) {
      const x = Math.floor(rnd() * w), y = Math.floor(rnd() * y1);
      c.globalAlpha = 0.3 + rnd() * 0.7;
      px(c, x, y, rnd() < 0.25 ? '#ffcd75' : '#f4f4f4');
      if (i < titilan) lista.push({ x, y, f: rnd() * 6, v: 0.8 + rnd() * 1.8 });
    }
    c.globalAlpha = 1;
    actores.push((g, t) => {
      for (const s of lista) {
        const a = Math.sin(t * s.v + s.f);
        if (a < 0.55) continue;
        g.fillStyle = '#ffffff'; g.fillRect(s.x, s.y, 1, 1);
        g.globalAlpha = (a - 0.55) * 1.6;
        g.fillRect(s.x - 1, s.y, 3, 1); g.fillRect(s.x, s.y - 1, 1, 3);
        g.globalAlpha = 1;
      }
    });
  }
  function luna(c, x, y, r) {
    x = Math.round(x); y = Math.round(y);
    for (let j = -r - 3; j <= r + 3; j++) for (let i = -r - 3; i <= r + 3; i++) {
      const d = Math.hypot(i, j);
      if (d <= r) px(c, x + i, y + j, d > r - 1.2 ? '#ffe9a8' : '#fff3b0');
      else if (d <= r + 3 && BAYER[((y + j) & 3) * 4 + ((x + i) & 3)] < (r + 3 - d) * 3) { c.globalAlpha = 0.18; px(c, x + i, y + j, '#fff3b0'); c.globalAlpha = 1; }
    }
    const k = Math.max(1, Math.round(r / 5));
    rect(c, x - r * 0.45, y - r * 0.15, k * 2, k * 2, '#ffe9a8');
    rect(c, x + r * 0.25, y + r * 0.3, k * 2, k, '#ffe9a8');
    rect(c, x + r * 0.05, y - r * 0.6, k, k, '#ffe9a8');
  }
  function relieve(c, base, amp, frec, fase, col, borde) {
    for (let x = 0; x < w; x++) {
      const y = Math.round(base - amp * (Math.sin(x * frec + fase) * 0.6 + Math.sin(x * frec * 2.3 + fase * 2) * 0.4));
      rect(c, x, y, 1, h - y, col);
      if (borde) px(c, x, y, borde);
    }
  }
  function pino(c, x, base, alto, col, luz) {
    x = Math.round(x); base = Math.round(base); alto = Math.round(alto);
    const pisos = Math.max(2, Math.round(alto / 7));
    for (let y = 0; y < alto; y++) {
      const enPiso = (y % Math.ceil(alto / pisos)) / Math.ceil(alto / pisos);
      const a = Math.round((y / alto) * alto * 0.28 + enPiso * alto * 0.08);
      rect(c, x - a, base - alto + y, a * 2 + 1, 1, col);
      if (luz && a > 0) px(c, x - a, base - alto + y, luz);
    }
    rect(c, x, base, 1, Math.max(1, Math.round(alto * 0.1)), col);
  }
  function ladrillos(c, x0, y0, x1, y1, col, linea, luz) {
    x0 = Math.round(x0); y0 = Math.round(y0);
    rect(c, x0, y0, x1 - x0, y1 - y0, col);
    const lh = 4, lw = 9;
    for (let y = y0, fila = 0; y < y1; y += lh, fila++) {
      rect(c, x0, y, x1 - x0, 1, linea);
      for (let x = x0 - (fila % 2) * 4; x < x1; x += lw) {
        rect(c, x, y, 1, lh, linea);
        if (luz) rect(c, x + 1, y + 1, lw - 2, 1, luz);
      }
    }
  }
  // resplandor redondo con tramado (para antorchas, ventanas, etc.)
  function resplandor(c, x, y, r, col, fuerza = 0.5) {
    c.fillStyle = col;
    for (let j = -r; j <= r; j++) for (let i = -r; i <= r; i++) {
      const d = Math.hypot(i, j) / r;
      if (d > 1) continue;
      if (BAYER[((y + j) & 3) * 4 + ((x + i) & 3)] < (1 - d) * 16 * fuerza) c.fillRect(Math.round(x + i), Math.round(y + j), 1, 1);
    }
  }
  // oscurece los bordes de la pantalla con tramado
  function vineta(c, col, desde = 0.6) {
    c.fillStyle = col;
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      const dx = (x - w / 2) / (w / 2), dy = (y - h / 2) / (h / 2);
      const d = Math.sqrt(dx * dx * 0.8 + dy * dy * 0.6);
      if ((d - desde) / (1 - desde) * 16 > BAYER[(y & 3) * 4 + (x & 3)]) c.fillRect(x, y, 1, 1);
    }
  }

  // ---------------------------------------------------------------
  //  Cosas animadas
  // ---------------------------------------------------------------
  const LLAMA = [
    ['..Y..', '.YyY.', 'oyYyo', 'oyYyo', 'roooR'],
    ['.Y...', '.yY..', 'oyYyo', 'oYYyo', 'roooR'],
    ['...Y.', '..Yy.', 'oyYyo', 'oyYYo', 'roooR'],
  ];
  const COL_LLAMA = { Y: '#fff3b0', y: '#ffcd75', o: '#ef7d57', r: '#e43b44', R: '#a22633' };
  function antorcha(c, x, y) {
    x = Math.round(x); y = Math.round(y);
    resplandor(c, x, y - 3, 14, '#ef7d57', 0.14);
    resplandor(c, x, y - 3, 8, '#ffcd75', 0.12);
    rect(c, x - 1, y, 3, 8, '#5c3a1e'); rect(c, x, y, 1, 8, '#7a4419');
    rect(c, x - 2, y - 1, 5, 2, '#566c86'); rect(c, x - 2, y - 1, 5, 1, '#94b0c2');
    rect(c, x - 1, y + 8, 3, 1, '#1a1c2c');
    const fase = rnd() * 10;
    actores.push((g, t) => {
      const f = LLAMA[Math.floor(t * 9 + fase) % 3];
      f.forEach((fila, j) => [...fila].forEach((ch, i) => { if (ch !== '.') { g.fillStyle = COL_LLAMA[ch]; g.fillRect(x - 2 + i, y - 6 + j, 1, 1); } }));
    });
    // chispas que suben
    const brasas = Array.from({ length: 4 }, () => ({ v: 0, y: 0, x: 0, vida: 0 }));
    actores.push((g, t, dt) => {
      for (const b of brasas) {
        if (b.vida <= 0) { if (Math.random() < dt * 0.8) { b.vida = 1; b.x = x + (Math.random() - 0.5) * 3; b.y = y - 6; b.v = 6 + Math.random() * 8; } continue; }
        b.vida -= dt * 0.9; b.y -= b.v * dt; b.x += Math.sin(t * 5 + b.v) * dt * 4;
        g.globalAlpha = b.vida; g.fillStyle = '#ffcd75'; g.fillRect(Math.round(b.x), Math.round(b.y), 1, 1); g.globalAlpha = 1;
      }
    });
  }
  function fugaces(y1) {
    let s = null, espera = 1.5;
    actores.push((g, t, dt) => {
      if (!s) {
        espera -= dt;
        if (espera <= 0) { s = { x: w * (0.3 + Math.random() * 0.7), y: Math.random() * y1, v: 70 + Math.random() * 50, vida: 0 }; espera = 3 + Math.random() * 5; }
        return;
      }
      s.vida += dt; s.x -= s.v * dt; s.y += s.v * 0.45 * dt;
      for (let k = 0; k < 7; k++) {
        g.globalAlpha = (1 - k / 7) * Math.min(1, (0.9 - s.vida) * 3);
        g.fillStyle = k < 2 ? '#ffffff' : '#ffe9a8';
        g.fillRect(Math.round(s.x + k * 2), Math.round(s.y - k), 1, 1);
      }
      g.globalAlpha = 1;
      if (s.vida > 0.9) s = null;
    });
  }
  function luciernagas(n, y0, y1) {
    const L = Array.from({ length: n }, () => ({ x: rnd() * w, y: y0 + rnd() * (y1 - y0), f: rnd() * 6, v: 0.6 + rnd() }));
    actores.push((g, t, dt) => {
      for (const l of L) {
        l.x += Math.sin(t * 0.7 * l.v + l.f) * dt * 5;
        l.y += Math.cos(t * 0.9 * l.v + l.f) * dt * 4;
        const a = (Math.sin(t * 2 * l.v + l.f) + 1) / 2;
        if (a < 0.25) continue;
        const x = Math.round(l.x), y = Math.round(l.y);
        g.globalAlpha = a * 0.3; g.fillStyle = '#a7f070'; g.fillRect(x - 1, y - 1, 3, 3);
        g.globalAlpha = a; g.fillStyle = '#f2ffb0'; g.fillRect(x, y, 1, 1);
      }
      g.globalAlpha = 1;
    });
  }
  function chispasSuben(n, colores, velocidad = 5) {
    const C = Array.from({ length: n }, () => ({ x: rnd() * w, y: rnd() * h, v: velocidad * (0.5 + rnd()), f: rnd() * 6, c: colores[Math.floor(rnd() * colores.length)] }));
    actores.push((g, t, dt) => {
      for (const p of C) {
        p.y -= p.v * dt;
        if (p.y < -2) { p.y = h + 2; p.x = Math.random() * w; }
        const a = (Math.sin(t * 2.5 + p.f) + 1) / 2;
        const x = Math.round(p.x + Math.sin(t * 0.8 + p.f) * 2), y = Math.round(p.y);
        g.globalAlpha = 0.25 + a * 0.75; g.fillStyle = p.c; g.fillRect(x, y, 1, 1);
        if (a > 0.85) { g.globalAlpha = 0.5; g.fillRect(x - 1, y, 3, 1); g.fillRect(x, y - 1, 1, 3); }
      }
      g.globalAlpha = 1;
    });
  }
  function nubes(n, y0, y1, alfa = 0.8, sombra = false) {
    const sp = sprite('nube');
    const N = Array.from({ length: n }, () => ({ x: rnd() * w, y: y0 + rnd() * (y1 - y0), v: 1.5 + rnd() * 2.5, e: rnd() < 0.5 ? 1 : 2 }));
    actores.push((g, t, dt) => {
      for (const k of N) {
        k.x += k.v * dt;
        const nw = sp.width * k.e, nh = sp.height * k.e;
        if (k.x > w + 2) k.x = -nw;
        if (sombra) { g.globalAlpha = 0.18; g.fillStyle = '#1a1c2c'; g.fillRect(Math.round(k.x) + 6, Math.round(k.y) + 10, nw - 2, nh - 1); }
        g.globalAlpha = alfa; g.drawImage(sp, Math.round(k.x), Math.round(k.y), nw, nh);
      }
      g.globalAlpha = 1;
    });
  }
  function murcielagos(n) {
    const B = Array.from({ length: n }, () => ({ x: rnd() * w, y: h * (0.08 + rnd() * 0.3), v: 7 + rnd() * 8, f: rnd() * 6 }));
    actores.push((g, t, dt) => {
      g.fillStyle = '#0b0d1c';
      for (const b of B) {
        b.x += b.v * dt;
        if (b.x > w + 4) { b.x = -4; b.y = h * (0.08 + Math.random() * 0.3); }
        const x = Math.round(b.x), y = Math.round(b.y + Math.sin(t * 3 + b.f) * 2);
        g.fillRect(x, y, 1, 2);
        if (Math.floor(t * 8 + b.f) % 2) { g.fillRect(x - 2, y - 1, 2, 1); g.fillRect(x + 1, y - 1, 2, 1); }
        else { g.fillRect(x - 2, y + 1, 2, 1); g.fillRect(x + 1, y + 1, 2, 1); g.fillRect(x - 3, y + 2, 1, 1); g.fillRect(x + 3, y + 2, 1, 1); }
      }
    });
  }

  // ---------------------------------------------------------------
  //  Escenarios
  // ---------------------------------------------------------------
  const NOCHE = ['#0b0d1c', '#10142b', '#161d3d', '#1d2650', '#243063', '#2c3a74', '#36437c'];

  function castilloLejano(c, x, base, col, ventana) {
    x = Math.round(x); base = Math.round(base);
    rect(c, x - 10, base - 8, 21, 8, col);                           // muralla
    for (let i = -10; i <= 10; i += 2) rect(c, x + i, base - 9, 1, 1, col);
    for (const tx of [-12, 9]) {                                     // torres
      rect(c, x + tx, base - 14, 4, 14, col);
      rect(c, x + tx, base - 15, 1, 1, col); rect(c, x + tx + 3, base - 15, 1, 1, col);
      px(c, x + tx + 1, base - 11, ventana); px(c, x + tx + 2, base - 7, ventana);
    }
    rect(c, x - 3, base - 20, 7, 20, col);                           // torre central
    for (let k = 0; k < 6; k++) rect(c, x - 3 + Math.ceil(k / 2), base - 21 - k, 7 - Math.ceil(k / 2) * 2, 1, col);
    rect(c, x, base - 30, 1, 4, col); rect(c, x + 1, base - 30, 3, 2, '#e43b44');
    px(c, x, base - 16, ventana); px(c, x - 1, base - 11, ventana); px(c, x + 1, base - 11, ventana);
    rect(c, x - 1, base - 4, 3, 4, '#0b0d1c');
    resplandor(c, x, base - 14, 6, ventana, 0.12);
  }

  const ESCENAS = {
    noche(c) {
      franjas(c, NOCHE, 0, h * 0.8);
      estrellas(c, Math.round(w * h / 130), h * 0.65);
      luna(c, colX0 + colW * 0.8, h * 0.12, Math.max(6, Math.round(colW * 0.075)));
      relieve(c, h * 0.76, 6, 0.05, 1, '#1d2650', '#2c3a74');
      castilloLejano(c, colX0 + colW * 0.24, h * 0.75, '#10142b', '#ffcd75');
      relieve(c, h * 0.84, 4, 0.08, 3, '#141a33', '#1d2650');
      for (let i = 0; i < w / 6; i++) pino(c, rnd() * w, h * 0.88 + rnd() * 3, 6 + rnd() * 6, '#0b0d1c');
      relieve(c, h * 0.93, 2, 0.06, 5, '#0b0d1c', '#141a33');
      fugaces(h * 0.4);
    },
    nocheSimple(c) {
      franjas(c, NOCHE, 0, h);
      estrellas(c, Math.round(w * h / 150), h * 0.9, 16);
      relieve(c, h * 0.94, 3, 0.05, 2, '#141a33', '#1d2650');
      fugaces(h * 0.5);
    },
    tesoro(c) {
      ladrillos(c, 0, 0, w, h, '#2f3552', '#1a1c2c', '#3a4466');
      // suelo de madera
      const sy = Math.round(h * 0.88);
      rect(c, 0, sy, w, h - sy, '#5c3a1e');
      for (let y = sy; y < h; y += 3) { rect(c, 0, y, w, 1, '#3d2714'); }
      for (let x = 0; x < w; x += 11) rect(c, x + (x % 3), sy, 1, h - sy, '#3d2714');
      rect(c, 0, sy, w, 1, '#7a4419');
      // alfombra roja
      const aw = Math.round(colW * 0.5);
      rect(c, colX0 + (colW - aw) / 2, sy + 2, aw, h - sy - 2, '#a22633');
      rect(c, colX0 + (colW - aw) / 2 + 1, sy + 3, aw - 2, 1, '#ffcd75');
      antorcha(c, colX0 + colW * 0.1, h * 0.3);
      antorcha(c, colX0 + colW * 0.9, h * 0.3);
      vineta(c, '#0b0d1c', 0.68);
      chispasSuben(8, ['#ffcd75', '#ef7d57'], 3);
    },
    reino(c) {
      // pasto con textura
      rect(c, 0, 0, w, h, '#38b764');
      for (let i = 0; i < w * h / 10; i++) px(c, rnd() * w, rnd() * h, rnd() < 0.5 ? '#2fa35a' : '#45c46f');
      for (let i = 0; i < w * h / 60; i++) { const x = rnd() * w, y = rnd() * h; px(c, x, y, '#a7f070'); px(c, x + 1, y - 1, '#a7f070'); }

      // posiciones reales de los nodos del mapa (en pixeles de la escena)
      const zona = document.querySelector('.mapa-zona');
      const pts = [];
      if (zona && typeof POS_MAPA !== 'undefined') {
        const r = zona.getBoundingClientRect();
        for (const [xp, yp] of POS_MAPA) pts.push([(r.left + r.width * xp / 100) / P, (r.top + r.height * yp / 100) / P]);
      }
      const cerca = (x, y, d) => pts.some((p, i) => {
        if (Math.hypot(p[0] - x, p[1] - y) < d + 6) return true;
        const q = pts[i + 1]; if (!q) return false;
        const vx = q[0] - p[0], vy = q[1] - p[1], L = vx * vx + vy * vy;
        const k = Math.max(0, Math.min(1, ((x - p[0]) * vx + (y - p[1]) * vy) / L));
        return Math.hypot(p[0] + vx * k - x, p[1] + vy * k - y) < d;
      });

      // río que cruza entre el 2º y el 3er lugar, con puente
      let puente = null;
      if (pts.length >= 3) puente = [(pts[1][0] + pts[2][0]) / 2, (pts[1][1] + pts[2][1]) / 2];
      const ry = x => puente ? puente[1] + Math.sin((x - puente[0]) * 0.06) * 6 : h * 0.6 + Math.sin(x * 0.06) * 6;
      const brillos = [];
      for (let x = 0; x < w; x++) {
        const y = Math.round(ry(x));
        rect(c, x, y - 4, 1, 9, '#41a6f6');
        px(c, x, y - 4, '#a7f070'); px(c, x, y - 3, '#3b5dc9'); px(c, x, y + 4, '#3b5dc9'); px(c, x, y + 5, '#257179');
        if (x % 7 === 0) brillos.push([x, y + Math.round(rnd() * 4 - 2), rnd() * 6]);
      }
      actores.push((g, t) => {
        for (const [x, y, f] of brillos) if (Math.sin(t * 2 + f) > 0.4) { g.fillStyle = '#73eff7'; g.fillRect(x, y, 2, 1); }
      });

      // camino de tierra entre los lugares
      if (pts.length) {
        const pisar = (x, y, r, col) => { for (let j = -r; j <= r; j++) for (let i = -r; i <= r; i++) if (i * i + j * j <= r * r) px(c, x + i, y + j, col); };
        for (const [col, r] of [['#7a4419', 4], ['#e0a463', 3]]) {
          for (let i = 0; i < pts.length - 1; i++) {
            const [x0, y0] = pts[i], [x1, y1] = pts[i + 1], n = Math.ceil(Math.hypot(x1 - x0, y1 - y0));
            for (let k = 0; k <= n; k++) pisar(Math.round(x0 + (x1 - x0) * k / n), Math.round(y0 + (y1 - y0) * k / n), r, col);
          }
        }
        for (let i = 0; i < pts.length - 1; i++) {                    // piedritas
          const [x0, y0] = pts[i], [x1, y1] = pts[i + 1], n = Math.ceil(Math.hypot(x1 - x0, y1 - y0));
          for (let k = 2; k < n; k += 4) px(c, x0 + (x1 - x0) * k / n + (rnd() * 4 - 2), y0 + (y1 - y0) * k / n + (rnd() * 4 - 2), '#b86f32');
        }
      }
      if (puente) {
        const [bx, by] = puente.map(Math.round);
        rect(c, bx - 6, by - 7, 13, 15, '#1a1c2c');
        rect(c, bx - 5, by - 6, 11, 13, '#b86f32');
        for (let y = by - 6; y < by + 7; y += 2) rect(c, bx - 5, y, 11, 1, '#7a4419');
        rect(c, bx - 6, by - 7, 1, 15, '#5c3a1e'); rect(c, bx + 6, by - 7, 1, 15, '#5c3a1e');
      }
      // árboles y flores, lejos del camino
      const arboles = [];
      for (let i = 0; i < w * h / 260; i++) {
        const x = rnd() * w, y = rnd() * h;
        if (cerca(x, y, 9) || Math.abs(y - ry(x)) < 9) continue;
        arboles.push([x, y]);
      }
      arboles.sort((a, b) => a[1] - b[1]);
      for (const [x, y] of arboles) {
        rect(c, x - 3, y + 1, 7, 2, '#257179');                         // sombra
        pino(c, x, y, 9 + rnd() * 5, '#1e7a3c', '#a7f070');
      }
      for (let i = 0; i < w * h / 120; i++) {
        const x = rnd() * w, y = rnd() * h;
        if (cerca(x, y, 6) || Math.abs(y - ry(x)) < 7) continue;
        px(c, x, y, ['#ff77a8', '#ffcd75', '#f4f4f4', '#73eff7'][Math.floor(rnd() * 4)]);
      }
      vineta(c, '#257179', 0.78);
      nubes(4, 0, h, 0.55, true);
    },
    bosque(c) {
      franjas(c, ['#081418', '#0b1d20', '#0e2a2c', '#12383a', '#174645', '#1d5450'], 0, h * 0.72);
      estrellas(c, Math.round(w * h / 150), h * 0.45, 10);
      luna(c, colX0 + colW * 0.22, h * 0.11, Math.max(5, Math.round(colW * 0.06)));
      const capas = [
        [h * 0.62, 16, 10, '#2a6b55', '#3d8a6b'],
        [h * 0.76, 26, 14, '#174a3c', '#1e5a4a'],
        [h * 0.93, 40, 22, '#0a2019', null],
      ];
      for (const [base, alto, var_, col, luz] of capas) {
        for (let x = -6; x < w + 6; x += 5 + rnd() * 6) pino(c, x, base + rnd() * 4, alto + rnd() * var_, col, luz);
        rect(c, 0, Math.round(base) + 2, w, h, col);
      }
      // niebla
      for (let y = Math.round(h * 0.66); y < h * 0.72; y++) for (let x = (y % 2); x < w; x += 3) { c.globalAlpha = 0.25; px(c, x, y, '#73eff7'); }
      c.globalAlpha = 1;
      luciernagas(16, h * 0.3, h * 0.97);
    },
    torre(c) {
      franjas(c, ['#140b26', '#1d1035', '#2a1846', '#3d1f5c', '#55265f', '#6e2c62'], 0, h * 0.8);
      estrellas(c, Math.round(w * h / 100), h * 0.6);
      luna(c, colX0 + colW * 0.2, h * 0.15, Math.max(7, Math.round(colW * 0.1)));
      relieve(c, h * 0.8, 4, 0.05, 2, '#2a1846', '#3d1f5c');
      // la torre de la fotógrafa
      const tx = Math.round(colX0 + colW * 0.86), base = Math.round(h * 0.86), alto = Math.round(h * 0.52), tw = 14;
      rect(c, tx - tw / 2, base - alto, tw, alto, '#1a1030');
      for (let y = base - alto; y < base; y += 4) for (let x = tx - tw / 2 + ((y / 4) % 2) * 3; x < tx + tw / 2; x += 6) rect(c, x, y, 3, 1, '#241540');
      rect(c, tx - tw / 2 - 2, base - alto - 2, tw + 4, 3, '#1a1030');
      for (let k = 0; k < 14; k++) rect(c, tx - tw / 2 - 1 + Math.round(k / 2), base - alto - 3 - k, tw + 2 - Math.round(k / 2) * 2, 1, '#2a1846');
      rect(c, tx, base - alto - 20, 1, 4, '#2a1846'); rect(c, tx + 1, base - alto - 20, 4, 2, '#ff77a8');
      for (const [vx, vy] of [[0, 0.15], [-3, 0.4], [3, 0.4], [0, 0.65]]) {
        const x = tx + vx - 1, y = base - alto + Math.round(alto * vy);
        rect(c, x, y, 3, 4, '#ffcd75'); rect(c, x + 1, y, 1, 4, '#1a1030'); rect(c, x, y + 2, 3, 1, '#1a1030');
        resplandor(c, x + 1, y + 2, 7, '#ffcd75', 0.12);
      }
      relieve(c, h * 0.88, 3, 0.07, 4, '#1a1030', '#2a1846');
      murcielagos(3);
      chispasSuben(10, ['#ff77a8', '#ffcd75', '#73eff7'], 3);
    },
    atardecer(c) {
      franjas(c, ['#1a1c2c', '#33224d', '#5d275d', '#86305a', '#b13e53', '#d65a4f', '#ef7d57'], 0, h);
      estrellas(c, Math.round(w * h / 200), h * 0.3, 6);
    },
    cine(c) {
      rect(c, 0, 0, w, h, '#1a0d16');
      for (let x = 0; x < w; x += 4) rect(c, x, 0, 1, h, '#20101b');
      // haz del proyector
      const cx = colX0 + colW / 2;
      for (let y = 0; y < h * 0.6; y++) {
        const a = colW * 0.08 + (y / (h * 0.6)) * colW * 0.42;
        for (let x = Math.round(cx - a); x < cx + a; x++) if (BAYER[(y & 3) * 4 + (x & 3)] < 3) px(c, x, y, '#4a2a30');
      }
      // cortinas a los lados
      const cw = Math.max(9, Math.round(colW * 0.13));
      const pliegue = ['#6e1423', '#a22633', '#e43b44', '#ff7b7b', '#e43b44', '#a22633'];
      for (const [x0, x1] of [[0, colX0 + cw], [colX0 + colW - cw, w]]) {
        for (let x = x0; x < x1; x++) {
          rect(c, x, 0, 1, h, pliegue[((x - x0) % 6 + 6) % 6]);
        }
      }
      rect(c, colX0 + cw, 0, 1, h, '#1a0d16'); rect(c, colX0 + colW - cw - 1, 0, 1, h, '#1a0d16');
      // cenefa arriba con flecos dorados y bombillitas
      rect(c, 0, 0, w, 7, '#a22633'); rect(c, 0, 1, w, 1, '#e43b44');
      for (let x = 0; x < w; x += 8) for (let j = 0; j < 3; j++) rect(c, x + j, 7 + j, 8 - j * 2, 1, '#a22633');
      for (let x = 0; x < w; x += 2) px(c, x, 6, '#ffcd75');
      const focos = [];
      for (let x = 3; x < w; x += 6) focos.push(x);
      actores.push((g, t) => {
        const fase = Math.floor(t * 3) % 2;
        focos.forEach((x, i) => { g.fillStyle = (i % 2 === fase) ? '#fff3b0' : '#a85a12'; g.fillRect(x, 3, 2, 2); });
      });
      // butacas con público
      for (let fila = 0; fila < 2; fila++) {
        const y = Math.round(h - 8 - fila * 7);
        for (let x = (fila * 4) - 2; x < w; x += 8) {
          rect(c, x, y, 7, 8, fila ? '#4a1426' : '#3a0f1f'); rect(c, x, y, 7, 1, '#6e1423');
          if (rnd() < 0.45) { rect(c, x + 2, y - 4, 3, 4, '#0b0d1c'); rect(c, x + 1, y - 3, 5, 2, '#0b0d1c'); }
        }
      }
      // polvo en el haz de luz
      const polvo = Array.from({ length: 22 }, () => ({ x: cx + (rnd() - 0.5) * colW * 0.5, y: rnd() * h * 0.6, f: rnd() * 6 }));
      actores.push((g, t, dt) => {
        for (const p of polvo) {
          p.y += dt * 2; p.x += Math.sin(t + p.f) * dt * 2;
          if (p.y > h * 0.6) p.y = 0;
          g.globalAlpha = 0.3 + 0.3 * Math.sin(t * 2 + p.f); g.fillStyle = '#fff3b0'; g.fillRect(Math.round(p.x), Math.round(p.y), 1, 1);
        }
        g.globalAlpha = 1;
      });
    },
    castillo(c) {
      franjas(c, ['#0b0d1c', '#111633', '#18204a', '#202c63', '#29366f'], 0, h * 0.72);
      estrellas(c, Math.round(w * h / 90), h * 0.6);
      luna(c, colX0 + colW * 0.82, h * 0.1, Math.max(5, Math.round(colW * 0.06)));
      // muralla con almenas
      const my = Math.round(h * 0.74);
      ladrillos(c, 0, my, w, h, '#3a4466', '#1a1c2c', '#4a5577');
      for (let x = 0; x < w; x += 10) { rect(c, x, my - 5, 6, 5, '#3a4466'); rect(c, x, my - 5, 6, 1, '#566c86'); rect(c, x + 6, my - 5, 1, 5, '#1a1c2c'); }
      rect(c, 0, my, w, 1, '#566c86');
      // estandartes
      for (const bx of [colX0 + colW * 0.14, colX0 + colW * 0.86].map(Math.round)) {
        rect(c, bx - 5, my + 2, 11, 1, '#7a4419');
        rect(c, bx - 4, my + 3, 9, 16, '#a22633');
        rect(c, bx - 4, my + 3, 1, 16, '#ffcd75'); rect(c, bx + 4, my + 3, 1, 16, '#ffcd75');
        for (let k = 0; k < 4; k++) rect(c, bx - 4 + k, my + 19 + k, 9 - k * 2, 1, '#a22633');
        px(c, bx, my + 8, '#ffcd75'); rect(c, bx - 1, my + 9, 3, 1, '#ffcd75'); px(c, bx, my + 10, '#ffcd75');
      }
      antorcha(c, colX0 + colW * 0.33, my + 8);
      antorcha(c, colX0 + colW * 0.67, my + 8);
      fugaces(h * 0.4);
    },
    magia(c) {
      rect(c, 0, 0, w, h, '#1d2650');
      const img = c.createImageData(w, h), d = img.data;
      const cx = w / 2, cy = h * 0.4;
      const ang = new Float32Array(w * h), dist = new Float32Array(w * h);
      for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) { const i = y * w + x; ang[i] = Math.atan2(y - cy, x - cx); dist[i] = Math.hypot(x - cx, y - cy); }
      const A = [0x29, 0x36, 0x6f], B = [0x1d, 0x26, 0x50], Cc = [0x3b, 0x5d, 0xc9];
      actores.push((g, t) => {
        for (let i = 0; i < w * h; i++) {
          const rayo = Math.floor((ang[i] + t * 0.15) / (Math.PI / 10) + 100) % 2;
          let col = rayo ? A : B;
          if (dist[i] < 14 + Math.sin(t * 3) * 2 && BAYER[((i / w | 0) & 3) * 4 + ((i % w) & 3)] < 8) col = Cc;
          d[i * 4] = col[0]; d[i * 4 + 1] = col[1]; d[i * 4 + 2] = col[2]; d[i * 4 + 3] = 255;
        }
        g.putImageData(img, 0, 0);
      });
      chispasSuben(24, ['#ffcd75', '#fff3b0', '#f4f4f4', '#73eff7'], 6);
    },
  };

  return { iniciar, poner, tamPixel: () => P };
})();

// ---------------------------------------------------------------------
//  Efectos: estallidos de chispas encima de todo
// ---------------------------------------------------------------------
const Efectos = (() => {
  let cv = null, g = null, P = 3, parts = [], activo = false, ultimo = 0;
  const DORADO = ['#ffcd75', '#fff3b0', '#f4f4f4', '#ef7d57'];
  const FIESTA = ['#ffcd75', '#ff77a8', '#73eff7', '#a7f070', '#f4f4f4'];

  function iniciar() {
    cv = document.createElement('canvas');
    cv.id = 'efectos'; cv.className = 'pixelado';
    document.body.appendChild(cv);
    g = cv.getContext('2d');
    medir();
    window.addEventListener('resize', medir);
  }
  function medir() {
    P = Escena.tamPixel();
    cv.width = Math.ceil(window.innerWidth / P); cv.height = Math.ceil(window.innerHeight / P);
    cv.style.width = cv.width * P + 'px'; cv.style.height = cv.height * P + 'px';
  }
  function estallido(x, y, n = 18, colores = FIESTA, fuerza = 1) {
    if (!g) return;
    for (let i = 0; i < n; i++) {
      const a = Math.random() * Math.PI * 2, v = (25 + Math.random() * 45) * fuerza;
      parts.push({ x: x / P, y: y / P, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 20 * fuerza, vida: 0.7 + Math.random() * 0.6,
        color: colores[Math.floor(Math.random() * colores.length)], estrella: Math.random() < 0.3 });
    }
    if (!activo) { activo = true; ultimo = 0; requestAnimationFrame(cuadro); }
  }
  function en(el, n, colores, fuerza) {
    if (!el) return;
    const r = el.getBoundingClientRect();
    estallido(r.left + r.width / 2, r.top + r.height / 2, n, colores, fuerza);
  }
  function cuadro(ahora) {
    const dt = ultimo ? Math.min(0.05, (ahora - ultimo) / 1000) : 0;
    ultimo = ahora;
    g.clearRect(0, 0, cv.width, cv.height);
    for (const p of parts) {
      p.vy += 70 * dt; p.vx *= 1 - dt * 1.5; p.x += p.vx * dt; p.y += p.vy * dt; p.vida -= dt;
      const x = Math.round(p.x), y = Math.round(p.y);
      g.globalAlpha = Math.min(1, p.vida * 2.5); g.fillStyle = p.color;
      if (p.estrella) { g.fillRect(x - 1, y, 3, 1); g.fillRect(x, y - 1, 1, 3); g.fillStyle = '#fff'; g.fillRect(x, y, 1, 1); }
      else g.fillRect(x, y, 1, 1);
    }
    g.globalAlpha = 1;
    parts = parts.filter(p => p.vida > 0);
    if (parts.length) requestAnimationFrame(cuadro);
    else { activo = false; g.clearRect(0, 0, cv.width, cv.height); }
  }
  return { iniciar, estallido, en, DORADO, FIESTA };
})();
