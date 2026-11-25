// =====================================================================
//  El final: los fragmentos vuelan y se unen, la carta y las 19 estrellas
// =====================================================================
'use strict';

async function secuenciaFinal() {
  nivelToken = null;
  Sonido.musica('final');
  if (estado.finalVisto) return mostrarCarta(false);
  await dialogo(C.final.antes);
  await unirFragmentos();
  estado.finalVisto = true; guardar();
  mostrarCarta(true);
}

async function unirFragmentos() {
  const s = pantalla('union', `<div class="hoja-union"></div><div class="destello"></div>`);
  const hoja = $('.hoja-union', s);
  const { width: W, height: H } = hoja.getBoundingClientRect();
  const n = CARTA.length, J = 9, D = 12;

  // bordes rotos compartidos entre piezas vecinas, para que encajen perfecto
  const bordes = [];
  for (let b = 0; b <= n; b++) {
    bordes.push(Array.from({ length: D + 1 }, (_, k) =>
      (b === 0 || b === n) ? 0 : (k % 2 ? 1 : -1) * J * (0.35 + Math.random() * 0.65)));
  }
  for (let i = 0; i < n; i++) {
    const arriba = i * H / n - J, alto = H / n + 2 * J, pts = [];
    for (let k = 0; k <= D; k++) pts.push(`${(k / D * 100).toFixed(1)}% ${(i * H / n + bordes[i][k] - arriba).toFixed(1)}px`);
    for (let k = D; k >= 0; k--) pts.push(`${(k / D * 100).toFixed(1)}% ${((i + 1) * H / n + bordes[i + 1][k] - arriba).toFixed(1)}px`);
    const p = document.createElement('div');
    p.className = 'pieza-union papel';
    const tx = (Math.random() - 0.5) * W * 1.1, ty = (i - (n - 1) / 2) * H * 0.12 + (Math.random() - 0.5) * H * 0.5;
    p.style.cssText = `top:${arriba}px;height:${alto}px;background-position:0 ${-arriba}px;clip-path:polygon(${pts.join(',')});` +
      `transform:translate(${tx}px,${ty}px) rotate(${((Math.random() - 0.5) * 80).toFixed(0)}deg) scale(.8)`;
    hoja.appendChild(p);
  }
  await esperar(80);
  const piezas = $$('.pieza-union', hoja);

  // 1. aparecen flotando
  piezas.forEach((p, i) => setTimeout(() => {
    p.style.transition = 'opacity .4s';
    p.style.opacity = 1;
    Sonido.nota(72 + i * 2, 0.25);
  }, i * 280));
  await esperar(piezas.length * 280 + 700);

  // 2. vuelan y se unen
  Sonido.sfx('magia');
  piezas.forEach((p, i) => {
    p.style.transition = `transform 1.1s cubic-bezier(.5,-0.35,.3,1.25) ${i * 0.13}s`;
    p.style.transform = 'none';
  });
  await esperar(1100 + piezas.length * 130 + 300);

  // 3. brillan y destello
  hoja.classList.add('brilla');
  Sonido.sfx('fragmento');
  await esperar(900);
  $('.destello', s).classList.add('activo');
  await esperar(700);
}

function mostrarCarta(primeraVez) {
  const parrafos = CARTA.join('\n\n').split(/\n\s*\n/).map(p => p.trim()).filter(Boolean);
  const s = pantalla('carta-pantalla', `
    <div class="carta-scroll">
      <article class="carta papel">
        <h2>${esc(txt(C.final.tituloCarta))}</h2>
        ${parrafos.map((p, i) => `<p style="animation-delay:${primeraVez ? (0.4 + i * 0.6).toFixed(1) : 0}s">${esc(p).replace(/\n/g, '<br>')}</p>`).join('')}
      </article>
      <div class="carta-botones"><button class="btn">${esc(txt(C.final.botonEstrellas))}</button></div>
    </div>`);
  $('.carta-botones .btn', s).onclick = () => { Sonido.sfx('tap'); constelacion(); };
}

// 19 estrellas que forman un "19"
const PUNTOS_19 = [
  [20, 30], [29, 19], [29, 35], [29, 51], [29, 67], [29, 82], [19, 82], [39, 82],            // el 1
  [65, 19], [77, 23], [82, 35], [77, 47], [65, 51], [54, 47], [49, 35], [54, 23],            // el círculo del 9
  [81, 58], [78, 71], [69, 83],                                                              // la colita del 9
];
const LINEAS_19 = [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [6, 5], [5, 7],
  [8, 9], [9, 10], [10, 11], [11, 12], [12, 13], [13, 14], [14, 15], [15, 8], [11, 16], [16, 17], [17, 18]];

async function constelacion() {
  const url = spriteURL('estrella');
  const s = pantalla('constelacion', `
    <svg class="const-svg" viewBox="0 0 100 100">
      ${LINEAS_19.map(([a, b]) => `<path class="linea" pathLength="1" d="M${PUNTOS_19[a].join(' ')}L${PUNTOS_19[b].join(' ')}"/>`).join('')}
      ${PUNTOS_19.map(([x, y]) => `<image class="astro19" href="${url}" x="${x - 4}" y="${y - 4}" width="8" height="8" style="image-rendering:pixelated"/>`).join('')}
    </svg>
    <div class="feliz"><div class="titulo-pixel">${esc(txt(C.final.felicitacion).toUpperCase())}</div><p>${esc(txt(C.final.subtitulo))}</p></div>
    <div class="barra-abajo oculto"><button class="btn azul">✉ Leer la carta</button></div>`);
  const escala = [60, 62, 64, 67, 69, 72, 74, 76, 79, 81, 84, 86, 88, 91, 93, 96, 98, 100, 103];
  const astros = $$('.astro19', s);
  await esperar(500);
  for (let i = 0; i < astros.length; i++) {
    astros[i].classList.add('encendida');
    Sonido.nota(escala[i], 0.35);
    await esperar(210);
  }
  await esperar(300);
  $$('.linea', s).forEach((l, i) => { l.style.transitionDelay = `${i * 0.06}s`; l.classList.add('dibujada'); });
  await esperar(1500);
  $('.feliz', s).classList.add('visible');
  Sonido.sfx('victoria');
  confeti();
  await esperar(1500);
  if (!estado.despedidaVista) {
    await dialogo(C.final.despedida);
    estado.despedidaVista = true; guardar();
  }
  const barra = $('.barra-abajo', s);
  barra.classList.remove('oculto');
  $('.btn', barra).onclick = () => { Sonido.sfx('tap'); mostrarCarta(false); };
}

function confeti() {
  const colores = ['#ffcd75', '#ff77a8', '#73eff7', '#a7f070', '#ef7d57', '#41a6f6', '#f4f4f4'];
  for (let i = 0; i < 70; i++) {
    const c = document.createElement('div');
    c.className = 'confeti';
    const dur = 2.5 + Math.random() * 2.5;
    c.style.cssText = `left:${Math.random() * 100}%;background:${azar(colores)};animation-duration:${dur}s;animation-delay:${Math.random() * 1.5}s;` +
      (Math.random() < 0.5 ? 'width:6px;height:10px;' : '');
    capas.appendChild(c);
    setTimeout(() => c.remove(), (dur + 1.6) * 1000);
  }
}
