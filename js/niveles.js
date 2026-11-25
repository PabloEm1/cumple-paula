// =====================================================================
//  Los 5 niveles (minijuegos)
// =====================================================================
'use strict';

const NIVELES = [
  { id: 'memoria', jugar: nivelMemoria },
  { id: 'borrosa', jugar: nivelBorrosa },
  { id: 'ketchup', jugar: nivelKetchup },
  { id: 'cine', jugar: nivelCine },
  { id: 'puzzle', jugar: nivelPuzzle },
];

function pantallaNivel(id, cont, cuerpo, etiquetaPista = '💡 Pista') {
  const s = pantalla(`nivel nivel-${id}`, `
    <div class="hud"><button class="btn-mini btn-volver">◀ MAPA</button>
      <span class="hud-titulo">${esc(txt(cont.lugar).toUpperCase())}</span>${hudEstrellas(estrellasBase())}</div>
    <div class="nivel-cuerpo">${cuerpo}</div>
    ${etiquetaPista ? `<div class="barra-abajo"><button class="btn btn-pista">${etiquetaPista}</button></div>` : ''}`);
  $('.btn-volver', s).onclick = () => { Sonido.sfx('tap'); pantallaMapa(); };
  return s;
}

// Preguntas con opciones (la primera es la correcta). Se usa en niveles 2 y 4.
function jugarOpciones(s, ctl, opciones, pista, alFallar) {
  return new Promise(resolve => {
    const ops = $('.opciones', s), pistaBtn = $('.btn-pista', s);
    const correcta = opciones[0];
    ops.innerHTML = mezclar(opciones).map(o =>
      `<button class="opcion"${o === correcta ? ' data-ok="1"' : ''}>${esc(txt(o))}</button>`).join('');
    let hecho = false;
    ops.onclick = e => {
      const b = e.target.closest('.opcion');
      if (!b || b.disabled || hecho || !ctl.vivo()) return;
      if (b.dataset.ok) {
        hecho = true;
        b.classList.add('bien');
        Efectos.en(b, 20);
        $$('.opcion', ops).forEach(x => { x.disabled = true; });
        Sonido.sfx('bien');
        burbuja(azar(C.bromasAcierto), 1400);
        resolve();
      } else {
        b.classList.add('mal'); b.disabled = true;
        Sonido.sfx('error');
        burbuja(azar(C.bromasFallo), 2600);
        if (alFallar) alFallar();
      }
    };
    pistaBtn.onclick = () => {
      if (hecho) return;
      Sonido.sfx('tap');
      const malas = $$('.opcion:not([data-ok]):not(:disabled)', ops);
      if (malas.length > 1) { const m = azar(malas); m.disabled = true; m.classList.add('descartada'); }
      burbuja(pista || '¡Fíjate bien!', 3200);
    };
  });
}

// ---------------------------------------------------------------------
//  1) MEMORIA
// ---------------------------------------------------------------------
async function nivelMemoria(ctl, cont) {
  await fotosListas();
  const fotos = cont.fotos.slice(0, 8);
  const pares = fotos.length;
  const mazo = mezclar([...fotos.keys(), ...fotos.keys()]);
  const cols = pares <= 6 ? 3 : 4;
  const s = pantallaNivel('memoria', cont, `
    <div class="memoria-grid" style="--cols:${cols};--filas:${Math.ceil(mazo.length / cols)}">
      ${mazo.map((f, k) => `<button class="carta-mem" data-k="${k}"><span class="interior">
        <span class="cara dorso"></span><span class="cara frente" style="background-image:url('${esc(foto(fotos[f]))}')"></span>
      </span></button>`).join('')}
    </div>
    <p class="info">PAREJAS: <b id="pares">0</b>/${pares}</p>`);
  const pistaBtn = $('.btn-pista', s);
  await dialogo(cont.intro);
  if (!ctl.vivo()) return esperarSiempre();

  return new Promise(resolve => {
    const cartas = $$('.carta-mem', s);
    let abierta = null, bloqueo = false, encontrados = 0, fallos = 0, pistas = 3, ayudado = false;
    const pintarPista = () => { pistaBtn.textContent = pistas > 0 ? `💡 Pista (${pistas})` : 'Sin pistas'; pistaBtn.disabled = pistas <= 0; };
    pintarPista();

    function verTodas() {
      bloqueo = true;
      cartas.forEach(c => c.classList.add('ver'));
      Sonido.sfx('voltear');
      setTimeout(() => { cartas.forEach(c => c.classList.remove('ver')); bloqueo = false; }, 1600);
    }
    pistaBtn.onclick = () => {
      if (bloqueo || pistas <= 0 || abierta) return;
      pistas--; pintarPista();
      burbuja(cont.pista, 1700);
      verTodas();
    };

    $('.memoria-grid', s).addEventListener('click', async e => {
      const c = e.target.closest('.carta-mem');
      if (!c || bloqueo || c === abierta || c.classList.contains('hecha')) return;
      Sonido.sfx('voltear');
      c.classList.add('abierta');
      if (!abierta) { abierta = c; return; }
      const a = abierta; abierta = null;
      if (mazo[+a.dataset.k] === mazo[+c.dataset.k]) {
        [a, c].forEach(x => { x.classList.add('hecha'); x.classList.remove('abierta'); Efectos.en(x, 12); });
        encontrados++;
        $('#pares', s).textContent = encontrados;
        Sonido.sfx('bien');
        ctl.progreso(encontrados / pares);
        if (encontrados === pares) { bloqueo = true; pistaBtn.disabled = true; await esperar(900); resolve(); }
      } else {
        bloqueo = true; fallos++;
        setTimeout(async () => {
          a.classList.remove('abierta'); c.classList.remove('abierta'); bloqueo = false;
          if (fallos >= 10 && !ayudado && ctl.vivo()) { ayudado = true; await dialogo(cont.ayuda); verTodas(); }
        }, 900);
      }
    });
  });
}

// ---------------------------------------------------------------------
//  2) FOTO PIXELADA
// ---------------------------------------------------------------------
async function nivelBorrosa(ctl, cont) {
  await fotosListas();
  const rondas = cont.rondas;
  const s = pantallaNivel('borrosa', cont, `
    <div class="marco-foto"><canvas class="lienzo-foto"></canvas><div class="flash"></div></div>
    <p class="info">FOTO <b id="ronda">1</b>/${rondas.length}</p>
    <div class="opciones"></div>`);
  const cv = $('.lienzo-foto', s), ctx = cv.getContext('2d');
  const tam = Math.round(Math.min(cv.clientWidth || 300, 420) * (window.devicePixelRatio || 1));
  cv.width = cv.height = tam;
  const peq = document.createElement('canvas'), pctx = peq.getContext('2d');
  const NIV = [5, 8, 12, 18, 28, 44];

  function dibujar(img, bloques) {
    if (!img) { ctx.fillStyle = '#333c57'; ctx.fillRect(0, 0, tam, tam); return; }
    const iw = img.naturalWidth || img.width, ih = img.naturalHeight || img.height;
    const lado = Math.min(iw, ih), sx = (iw - lado) / 2, sy = (ih - lado) / 2;
    if (!bloques) {
      ctx.imageSmoothingEnabled = true;
      ctx.drawImage(img, sx, sy, lado, lado, 0, 0, tam, tam);
      return;
    }
    peq.width = peq.height = bloques;
    pctx.imageSmoothingEnabled = true;
    pctx.drawImage(img, sx, sy, lado, lado, 0, 0, bloques, bloques);
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(peq, 0, 0, bloques, bloques, 0, 0, tam, tam);
  }

  const imgs = await Promise.all(rondas.map(r => cargarImagen(foto(r.foto))));
  dibujar(imgs[0], NIV[0]);
  await dialogo(cont.intro);

  for (let r = 0; r < rondas.length; r++) {
    if (!ctl.vivo()) return esperarSiempre();
    $('#ronda', s).textContent = r + 1;
    const img = imgs[r];
    let nivel = 0;
    dibujar(img, NIV[0]);
    const aclarar = () => { if (nivel < NIV.length - 1) { nivel++; dibujar(img, NIV[nivel]); } };
    const timer = setInterval(() => { if (!ctl.vivo()) return clearInterval(timer); aclarar(); }, 3500);
    await jugarOpciones(s, ctl, rondas[r].opciones, rondas[r].pista, aclarar);
    clearInterval(timer);
    dibujar(img, 0);
    const fl = $('.flash', s); fl.classList.remove('activo'); void fl.offsetWidth; fl.classList.add('activo');
    ctl.progreso((r + 1) / rondas.length);
    await esperar(1500);
  }
}

// ---------------------------------------------------------------------
//  3) LLUVIA DE KETCHUP
// ---------------------------------------------------------------------
async function nivelKetchup(ctl, cont) {
  const meta = cont.meta || 20;
  const s = pantallaNivel('ketchup', cont, `
    <div class="marcador">
      <span class="medidor-ketchup"><i id="barra"></i></span>
      <span>🍅 <b id="pts">0</b>/${meta}</span>
      <span id="modoLento"></span>
    </div>
    <div class="zona-juego"><canvas></canvas><div class="cuenta"></div></div>`, '🐢 Más lento');
  const zona = $('.zona-juego', s), cv = $('canvas', zona), ctx = cv.getContext('2d');
  const pistaBtn = $('.btn-pista', s), cuenta = $('.cuenta', s);
  const frasesMalas = cont.frasesEnsalada || cont.frasesMostaza || ['¡Puaj!'];

  // ---------- Fondo: atardecer pixelado del Valle del Ketchup ----------
  let W = 0, H = 0, u = 3, P = 3, fondo = null, sueloY = 0;
  function azarFijo(semilla) { let x = semilla; return () => (x = (x * 16807) % 2147483647) / 2147483647; }

  function pintarFondo() {
    const w = Math.ceil(W / P), h = Math.ceil(H / P);
    const c = document.createElement('canvas'); c.width = w; c.height = h;
    const g = c.getContext('2d');
    const rnd = azarFijo(1712);
    const horizonte = Math.round(h * 0.7);

    // cielo en franjas, con un poco de tramado entre ellas
    const cielo = ['#1a1c2c', '#33224d', '#5d275d', '#86305a', '#b13e53', '#d65a4f', '#ef7d57', '#f7a35c', '#ffcd75'];
    const alto = horizonte / cielo.length;
    cielo.forEach((col, i) => {
      g.fillStyle = col; g.fillRect(0, Math.floor(i * alto), w, Math.ceil(alto) + 1);
      if (i > 0) { g.fillStyle = cielo[i - 1]; for (let x = i % 2; x < w; x += 2) g.fillRect(x, Math.floor(i * alto), 1, 1); }
    });
    // estrellitas arriba
    for (let i = 0; i < w * 0.25; i++) {
      g.fillStyle = rnd() < 0.3 ? '#ffcd75' : '#f4f4f4';
      g.globalAlpha = 0.4 + rnd() * 0.6;
      g.fillRect(Math.floor(rnd() * w), Math.floor(rnd() * horizonte * 0.3), 1, 1);
    }
    g.globalAlpha = 1;
    // sol retro con rayas
    const sx = Math.round(w * 0.7), sy = Math.round(horizonte - h * 0.02), sr = Math.round(w * 0.17);
    for (let y = -sr; y <= sr; y++) for (let x = -sr; x <= sr; x++) {
      const d = x * x + y * y;
      if (d > sr * sr) continue;
      if (y > 0 && ((y + 1) % 4 < Math.min(3, 1 + Math.floor(y / 5)))) continue; // rayas en la mitad de abajo
      g.fillStyle = d > (sr - 1.5) ** 2 ? '#ffcd75' : (y < -sr * 0.4 ? '#fff3b0' : '#ffe9a8');
      g.fillRect(sx + x, sy + y, 1, 1);
    }
    // colinas: lejanas, medias y cercanas
    function colina(base, amp, frec, fase, col, borde) {
      for (let x = 0; x < w; x++) {
        const y = Math.round(base - amp * (Math.sin(x * frec + fase) * 0.6 + Math.sin(x * frec * 2.3 + fase * 2) * 0.4));
        g.fillStyle = col; g.fillRect(x, y, 1, h - y);
        if (borde) { g.fillStyle = borde; g.fillRect(x, y, 1, 1); }
      }
    }
    colina(horizonte - 4, 5, 0.06, 1, '#5d275d', '#86305a');
    colina(horizonte + 3, 4, 0.09, 4, '#257179', '#38b764');
    const cerca = horizonte + 9;
    colina(cerca, 3, 0.05, 2, '#38b764', '#a7f070');
    // matas de tomates en la colina cercana
    for (let i = 0; i < Math.max(4, w / 18); i++) {
      const x = Math.floor(4 + rnd() * (w - 8)), y = cerca + 4 + Math.floor(rnd() * 5);
      g.fillStyle = '#1e7a3c'; g.fillRect(x - 2, y - 1, 5, 3); g.fillRect(x - 1, y - 2, 3, 1);
      g.fillStyle = '#e43b44'; g.fillRect(x - 1, y - 1, 1, 1); g.fillRect(x + 1, y, 1, 1);
      if (rnd() < 0.5) g.fillRect(x + 2, y - 1, 1, 1);
    }
    // suelo
    const suelo = h - Math.max(4, Math.round(h * 0.07));
    g.fillStyle = '#5c3a1e'; g.fillRect(0, suelo, w, h - suelo);
    g.fillStyle = '#7a4419'; for (let x = 0; x < w; x += 3) g.fillRect(x + (x % 2), suelo + 2 + (x % 3), 1, 1);
    g.fillStyle = '#38b764'; g.fillRect(0, suelo, w, 1);
    g.fillStyle = '#a7f070'; for (let x = 0; x < w; x += 4) g.fillRect(x + Math.floor(rnd() * 3), suelo - 1, 1, 1);

    // escalar a tamaño real sin suavizar
    const f = document.createElement('canvas');
    const dpr = window.devicePixelRatio || 1;
    f.width = Math.round(W * dpr); f.height = Math.round(H * dpr);
    const fg = f.getContext('2d');
    fg.imageSmoothingEnabled = false;
    fg.drawImage(c, 0, 0, w * P * dpr, h * P * dpr);
    // cartel de madera: "SOLO HEINZ"
    fg.setTransform(dpr, 0, 0, dpr, 0, 0);
    const cx = Math.round(W * 0.2), base = Math.round((cerca - 1) * P);
    const tam = Math.max(7, Math.round(P * 2.6));
    fg.font = `${tam}px "Press Start 2P", monospace`;
    const bw = Math.round(fg.measureText('HEINZ').width + P * 4), bh = Math.round(tam * 2 + P * 5);
    fg.fillStyle = '#1a1c2c'; fg.fillRect(cx - P * 1.5, base - bh * 0.2, P * 3, bh * 0.9);
    fg.fillStyle = '#5c3a1e'; fg.fillRect(cx - P, base - bh * 0.2, P * 2, bh * 0.9);
    fg.fillStyle = '#1a1c2c'; fg.fillRect(cx - bw / 2 - P, base - bh - P, bw + P * 2, bh + P * 2);
    fg.fillStyle = '#b86f32'; fg.fillRect(cx - bw / 2, base - bh, bw, bh);
    fg.fillStyle = '#e0a463'; fg.fillRect(cx - bw / 2, base - bh, bw, P);
    fg.fillStyle = '#7a4419'; fg.fillRect(cx - bw / 2, base - P, bw, P);
    fg.textAlign = 'center'; fg.textBaseline = 'top';
    fg.fillStyle = '#fff1d6'; fg.fillText('SOLO', cx, base - bh + P * 2);
    fg.fillStyle = '#ffcd75'; fg.fillText('HEINZ', cx, base - bh + P * 3 + tam);
    fondo = f;
    sueloY = suelo * P;
  }

  function medir() {
    const r = zona.getBoundingClientRect(), dpr = window.devicePixelRatio || 1;
    W = r.width; H = r.height;
    cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.imageSmoothingEnabled = false;
    u = Math.max(2.6, Math.min(4.6, W / 105));
    P = Math.max(2, Math.round(u * 0.8));
    pintarFondo();
  }
  if (document.fonts && document.fonts.ready) await Promise.race([document.fonts.ready, esperar(1500)]);
  medir();
  ctx.drawImage(fondo, 0, 0, W, H);
  await dialogo(cont.intro);
  if (!ctl.vivo()) return esperarSiempre();
  for (const t of ['3', '2', '1', '¡YA!']) { cuenta.textContent = t; Sonido.sfx('tap'); await esperar(650); }
  cuenta.textContent = '';
  if (!ctl.vivo()) return esperarSiempre();
  medir();
  window.addEventListener('resize', () => { if (ctl.vivo()) medir(); });

  return new Promise(resolve => {
    const sp = { k: sprite('heinz'), m: sprite('ensalada'), t: sprite('heinzDorado'), p: sprite('papasCaja'), nube: sprite('nube') };
    const escala = { k: 0.72, m: 0.74, t: 0.8 };
    const caja = { w: 0, h: 0, x: W / 2, objetivo: W / 2, aplastar: 0, inclinar: 0 };
    let items = [], textos = [], parts = [], pts = 0, ultimo = 0, proxSpawn = 500;
    let lento = false, pausa = false, malas = 0, ofrecido = false, fin = false, temblor = 0, tinte = 0;
    const nubes = [0, 1, 2].map(i => ({ x: Math.random() * W, y: H * (0.08 + i * 0.12), v: 6 + i * 5, e: 0.8 + i * 0.25 }));

    function pintarLento() {
      $('#modoLento', s).textContent = lento ? '🐢' : '';
      pistaBtn.textContent = lento ? '🐇 Normal' : '🐢 Más lento';
    }
    pistaBtn.onclick = () => { lento = !lento; Sonido.sfx('tap'); pintarLento(); };

    function mover(e) {
      const r = cv.getBoundingClientRect();
      caja.objetivo = Math.max(caja.w / 2, Math.min(W - caja.w / 2, e.clientX - r.left));
    }
    cv.addEventListener('pointerdown', mover);
    cv.addEventListener('pointermove', mover);
    if (window.MODO_PRUEBA) window.__ketchup = { items: () => items, mover: x => { caja.objetivo = x; } };

    function crear() {
      const avance = pts / meta, r = Math.random();
      const tipo = r < 0.06 ? 't' : (r < 0.26 + avance * 0.12 ? 'm' : 'k');
      const e = u * escala[tipo];
      const w = sp[tipo].width * e, h = sp[tipo].height * e;
      items.push({
        tipo, w, h, x: w / 2 + Math.random() * (W - w), y: -h,
        vy: H * (0.3 + avance * 0.28) * (0.85 + Math.random() * 0.3),
        giro: (Math.random() - 0.5) * 0.7, fase: Math.random() * 6, chispa: 0,
      });
    }
    function flotante(x, y, t, color) { textos.push({ x, y, t, color, vida: 1 }); }
    function estallido(x, y, n, colores, fuerza = 1, gravedad = 900) {
      for (let i = 0; i < n; i++) {
        const a = -Math.PI / 2 + (Math.random() - 0.5) * 2.2;
        const v = (140 + Math.random() * 220) * fuerza;
        parts.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, g: gravedad, vida: 0.6 + Math.random() * 0.5,
          color: colores[Math.floor(Math.random() * colores.length)], t: P * (Math.random() < 0.3 ? 2 : 1) });
      }
    }

    function atrapar(it, cy) {
      caja.aplastar = 1;
      const bx = it.x, by = cy + caja.h * 0.25;
      if (it.tipo === 'm') {
        pts = Math.max(0, pts - 2); malas++; temblor = 0.3; tinte = 1;
        Sonido.sfx('ensalada'); flotante(bx, cy, '-2', '#a7f070');
        estallido(bx, by, 10, ['#38b764', '#a7f070', '#1e7a3c', '#e43b44'], 0.8);
        if (navigator.vibrate) navigator.vibrate(80);
        if (Math.random() < 0.6) burbuja(azar(frasesMalas), 1500);
        if (malas >= 3 && !lento && !ofrecido) {
          ofrecido = true; pausa = true;
          elegir(cont.ofrecerLento, ['Sí, porfa 🐢', 'No, yo puedo 💪']).then(r => {
            if (r === 0) { lento = true; pintarLento(); }
            pausa = false;
          });
        }
      } else {
        const dorado = it.tipo === 't', v = dorado ? 3 : 1;
        pts = Math.min(meta, pts + v);
        Sonido.sfx(dorado ? 'dorado' : 'ketchup');
        flotante(bx, cy, '+' + v, dorado ? '#ffcd75' : '#f4f4f4');
        estallido(bx, by, dorado ? 16 : 9, dorado ? ['#ffcd75', '#fff3b0', '#f4f4f4'] : ['#e43b44', '#a22633', '#ff7b7b']);
        if (Math.random() < 0.12) burbuja(azar(cont.frasesKetchup), 1200);
      }
      $('#pts', s).textContent = pts;
      $('#barra', s).style.width = (pts / meta * 100) + '%';
      ctl.progreso(pts / meta);
      if (pts >= meta && !fin) {
        fin = true; items = [];
        Sonido.sfx('victoria');
        for (let i = 0; i < 5; i++) setTimeout(() => estallido(W * (0.15 + Math.random() * 0.7), H * (0.25 + Math.random() * 0.3), 22, ['#e43b44', '#ffcd75', '#f4f4f4', '#a7f070'], 1.2, 500), i * 250);
        burbuja(cont.ganar, 1900);
        setTimeout(resolve, 2200);
      }
    }

    function cuadro(ahora) {
      if (!ctl.vivo()) return;
      const dt = ultimo ? Math.min(0.05, (ahora - ultimo) / 1000) : 0;
      ultimo = ahora;
      requestAnimationFrame(cuadro);
      if (pausa) return;
      const factor = lento ? 0.55 : 1;
      caja.w = sp.p.width * u * 1.15; caja.h = sp.p.height * u * 1.15;
      const cy = sueloY - caja.h + P;

      if (!fin) {
        proxSpawn -= dt * 1000 * factor;
        if (proxSpawn <= 0) { crear(); proxSpawn = (950 - (pts / meta) * 400) * (0.8 + Math.random() * 0.4); }
      }
      const antes = caja.x;
      caja.x += (caja.objetivo - caja.x) * Math.min(1, dt * 22);
      const vel = dt ? (caja.x - antes) / dt : 0;
      caja.inclinar += (vel * 0.0004 - caja.inclinar) * Math.min(1, dt * 12);
      caja.inclinar = Math.max(-0.25, Math.min(0.25, caja.inclinar));
      caja.aplastar = Math.max(0, caja.aplastar - dt * 5);

      for (const it of items) {
        it.y += it.vy * dt * factor;
        const fondoIt = it.y + it.h;
        if (it.tipo === 't' && (it.chispa -= dt) <= 0) {
          it.chispa = 0.07;
          parts.push({ x: it.x + (Math.random() - 0.5) * it.w, y: it.y + Math.random() * it.h, vx: 0, vy: 30, g: 0, vida: 0.5, color: Math.random() < 0.5 ? '#fff3b0' : '#ffcd75', t: P });
        }
        if (!it.hecho && fondoIt >= cy + caja.h * 0.3 && fondoIt <= cy + caja.h * 0.95 &&
            Math.abs(it.x - caja.x) < caja.w / 2 + it.w * 0.2) {
          it.hecho = true; atrapar(it, cy);
        }
      }
      items = items.filter(it => !it.hecho && it.y < H + 10);
      for (const p of parts) { p.vy += p.g * dt; p.x += p.vx * dt; p.y += p.vy * dt; p.vida -= dt; }
      parts = parts.filter(p => p.vida > 0);

      // ---- dibujo ----
      ctx.save();
      if (temblor > 0) { temblor -= dt; ctx.translate(Math.round((Math.random() - 0.5) * 8), Math.round((Math.random() - 0.5) * 8)); }
      ctx.drawImage(fondo, 0, 0, W, H);
      for (const n of nubes) {
        n.x += n.v * dt;
        const nw = sp.nube.width * P * n.e, nh = sp.nube.height * P * n.e;
        if (n.x > W + 10) n.x = -nw;
        ctx.globalAlpha = 0.85; ctx.drawImage(sp.nube, Math.round(n.x), Math.round(n.y), nw, nh); ctx.globalAlpha = 1;
      }
      for (const it of items) {
        ctx.save();
        ctx.translate(it.x, it.y + it.h / 2);
        ctx.rotate(it.giro * Math.sin(ahora / 300 + it.fase));
        ctx.drawImage(sp[it.tipo], -it.w / 2, -it.h / 2, it.w, it.h);
        ctx.restore();
      }
      // sombra y caja de papas (se aplasta al atrapar y se inclina al moverse)
      ctx.fillStyle = 'rgba(26,28,44,.35)';
      ctx.beginPath(); ctx.ellipse(caja.x, sueloY + P, caja.w * 0.42, P * 1.5, 0, 0, Math.PI * 2); ctx.fill();
      ctx.save();
      ctx.translate(caja.x, cy + caja.h);
      ctx.rotate(caja.inclinar);
      ctx.scale(1 + caja.aplastar * 0.12, 1 - caja.aplastar * 0.14);
      ctx.drawImage(sp.p, -caja.w / 2, -caja.h, caja.w, caja.h);
      ctx.restore();
      for (const p of parts) {
        ctx.globalAlpha = Math.min(1, p.vida * 2);
        ctx.fillStyle = p.color; ctx.fillRect(Math.round(p.x), Math.round(p.y), p.t, p.t);
      }
      ctx.globalAlpha = 1;
      ctx.restore();
      if (tinte > 0) {
        tinte = Math.max(0, tinte - dt * 3);
        ctx.fillStyle = `rgba(56,183,100,${tinte * 0.25})`; ctx.fillRect(0, 0, W, H);
      }

      ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic';
      for (const t of textos) {
        t.vida -= dt * 1.2; t.y -= dt * 45;
        const pop = 1 + Math.max(0, t.vida - 0.8) * 3;
        ctx.font = `${Math.round(u * 4 * pop)}px "Press Start 2P", monospace`;
        ctx.globalAlpha = Math.max(0, Math.min(1, t.vida * 1.5));
        ctx.fillStyle = '#1a1c2c'; ctx.fillText(t.t, t.x + 2, t.y + 2);
        ctx.fillStyle = t.color; ctx.fillText(t.t, t.x, t.y);
      }
      ctx.globalAlpha = 1;
      textos = textos.filter(t => t.vida > 0);
    }
    requestAnimationFrame(cuadro);
  });
}

// ---------------------------------------------------------------------
//  4) CINE ENCANTADO (emojis)
// ---------------------------------------------------------------------
async function nivelCine(ctl, cont) {
  const qs = cont.preguntas;
  const s = pantallaNivel('cine', cont, `
    <div class="pantalla-cine"><div class="lienzo-cine"><span id="emojis">🎬</span></div></div>
    <p class="info">PELI <b id="num">1</b>/${qs.length}</p>
    <div class="opciones"></div>`);
  await dialogo(cont.intro);
  for (let i = 0; i < qs.length; i++) {
    if (!ctl.vivo()) return esperarSiempre();
    $('#num', s).textContent = i + 1;
    const em = $('#emojis', s);
    em.textContent = qs[i].emojis;
    em.classList.remove('entra'); void em.offsetWidth; em.classList.add('entra');
    await jugarOpciones(s, ctl, qs[i].opciones, qs[i].pista);
    ctl.progreso((i + 1) / qs.length);
    await esperar(1300);
  }
}

// ---------------------------------------------------------------------
//  5) ROMPECABEZAS DESLIZANTE
// ---------------------------------------------------------------------
async function nivelPuzzle(ctl, cont) {
  await fotosListas();
  const N = 3, TOTAL = N * N, HUECO = TOTAL - 1;
  const src = await imagenCuadrada(foto(cont.foto));
  if (!ctl.vivo()) return esperarSiempre();

  const pos = [...Array(TOTAL).keys()]; // pos[ficha] = casilla donde está
  let pila = [HUECO];                   // camino del hueco (para que Blu pueda resolverlo)
  const ady = (a, b) => Math.abs(Math.floor(a / N) - Math.floor(b / N)) + Math.abs(a % N - b % N) === 1;
  function moverCelda(c) {
    const h = pos[HUECO];
    if (!ady(c, h)) return false;
    pos[pos.indexOf(c)] = h; pos[HUECO] = c;
    if (pila.length >= 2 && pila[pila.length - 2] === c) pila.pop(); else pila.push(c);
    return true;
  }
  const resuelto = () => pos.every((c, t) => c === t);
  do {
    let previa = -1;
    for (let k = 0; k < 70; k++) {
      const h = pos[HUECO];
      const vecinas = [...Array(TOTAL).keys()].filter(c => ady(c, h) && c !== previa);
      previa = h; moverCelda(azar(vecinas));
    }
  } while (resuelto());

  const s = pantallaNivel('puzzle', cont, `
    <div class="puzzle" style="--n:${N}">
      ${Array.from({ length: TOTAL - 1 }, (_, t) => `<div class="ficha" data-t="${t}" style="--c:${pos[t] % N};--r:${Math.floor(pos[t] / N)};background-image:url('${src}');background-position:${(t % N) * 100 / (N - 1)}% ${Math.floor(t / N) * 100 / (N - 1)}%"><span class="num">${t + 1}</span></div>`).join('')}
      <div class="ver-foto" style="background-image:url('${src}')"></div>
    </div>
    <p class="info">MOVIMIENTOS: <b id="movs">0</b></p>`, '👁 Ver foto');
  const tablero = $('.puzzle', s), pistaBtn = $('.btn-pista', s);
  const fichas = $$('.ficha', s);
  const pintar = () => fichas.forEach(f => {
    const t = +f.dataset.t;
    f.style.setProperty('--c', pos[t] % N); f.style.setProperty('--r', Math.floor(pos[t] / N));
  });

  await dialogo(cont.intro);
  await dialogo(C.parchis.antes);
  const r = await elegir(C.parchis.pregunta, C.parchis.opciones.map(o => o.texto));
  await dialogo(C.parchis.opciones[r].respuesta);
  await dialogo(cont.instrucciones);
  if (!ctl.vivo()) return esperarSiempre();

  return new Promise(resolve => {
    let movs = 0, ofrecido = false, ocupado = false;
    async function ganar() {
      ocupado = true;
      tablero.classList.add('resuelto', 'viendo');
      Sonido.sfx('victoria');
      Efectos.en(tablero, 50, Efectos.FIESTA, 1.6);
      await esperar(1800);
      resolve();
    }
    async function resolverSolo() {
      ocupado = true;
      const ms = Math.max(70, Math.min(200, 5000 / Math.max(1, pila.length)));
      while (pila.length > 1) {
        if (!ctl.vivo()) return;
        moverCelda(pila[pila.length - 2]); pintar(); Sonido.sfx('deslizar');
        await esperar(ms);
      }
      ganar();
    }
    tablero.addEventListener('click', async e => {
      const f = e.target.closest('.ficha');
      if (!f || ocupado) return;
      if (!moverCelda(pos[+f.dataset.t])) return;
      Sonido.sfx('deslizar');
      movs++; $('#movs', s).textContent = movs;
      pintar();
      if (resuelto()) return ganar();
      if (movs >= 120 && !ofrecido) {
        ofrecido = true; ocupado = true;
        const r = await elegir(cont.ofrecerAyuda, ['Sí, ayúdame 🙏', 'No, yo puedo 💪']);
        ocupado = false;
        if (r === 0) resolverSolo();
      }
    });
    pistaBtn.onclick = () => {
      if (ocupado) return;
      Sonido.sfx('tap');
      tablero.classList.add('viendo', 'numeros');
      setTimeout(() => { if (!tablero.classList.contains('resuelto')) tablero.classList.remove('viendo'); }, 1800);
    };
  });
}
