// =====================================================================
//  Sprites en pixel art (dibujados con letras: cada letra es un color)
// =====================================================================
'use strict';

const PALETA = {
  k: '#1a1c2c', // contorno
  b: '#41a6f6', // azul
  l: '#73eff7', // celeste
  w: '#f4f4f4', // blanco
  p: '#ff77a8', // rosa
  y: '#ffcd75', // amarillo
  o: '#ef7d57', // naranja
  r: '#e43b44', // rojo
  d: '#a22633', // rojo oscuro
  g: '#38b764', // verde
  s: '#94b0c2', // gris
};

const SPRITES = {
  // Blu, el alien (original: redondito, con antena)
  blu: [
    '.......kk.......',
    '......kyyk......',
    '.......kk.......',
    '........k.......',
    '....kkkkkkkk....',
    '...kbbbbbbbbk...',
    '..kbblbbbbbbbk..',
    '.kbblbbbbbbbbbk.',
    '.kbbkkkbbkkkbbk.',
    '.kbbwkkbbwkkbbk.',
    '.kbbkkkbbkkkbbk.',
    '.kbppbbbbbbppbk.',
    '..kbbbkbbkbbbk..',
    '...kbbbkkbbbk...',
    '....kbbbbbbk....',
    '....kbk..kbk....',
  ],
  estrella: [
    '.....k.....',
    '....kyk....',
    '....kyk....',
    'kkkkyyykkkk',
    '.kyywyyyyk.',
    '..kyyyyyk..',
    '..kyyyyyk..',
    '.kyyykyyyk.',
    '.kyyk.kyyk.',
    'kyk.....kyk',
    'kk.......kk',
  ],
  ketchup: [
    '..kkkk..',
    '..kwwk..',
    '..kwwk..',
    '.kkkkkk.',
    '.krrrrk.',
    'krrrrrrk',
    'krwwwwrk',
    'krwrrwrk',
    'krwrrwrk',
    'krwwwwrk',
    'krrrrrrk',
    'krrrrrdk',
    'kdrrrrdk',
    '.kkkkkk.',
  ],
  tomate: [
    '....g....',
    '..ggkgg..',
    '..kkkkk..',
    '.krrrrrk.',
    'krrwrrrrk',
    'krrrrrrrk',
    'krrrrrrrk',
    '.krrrrrk.',
    '..kkkkk..',
  ],
  papas: [
    '..y..y.y..y.',
    '.yy.yy.yy.yy',
    '.yyyyyyyyyy.',
    'kkkkkkkkkkkk',
    'krrrrrrrrrrk',
    'krrwwrrwwrrk',
    '.krrwwwwrrk.',
    '.krrrwwrrrk.',
    '.krrrrrrrrk.',
    '..krrrrrrk..',
    '..kkkkkkkk..',
  ],
  corazon: [
    '.kk...kk.',
    'kppk.kppk',
    'kpwpkpppk',
    'kpppppppk',
    '.kpppppk.',
    '..kpppk..',
    '...kpk...',
    '....k....',
  ],
};

// Variantes: mismo dibujo con colores cambiados
const VARIANTES = {
  mostaza: ['ketchup', { r: '#feae34', d: '#c26a12' }],
  tomateDorado: ['tomate', { r: '#ffcd75', g: '#ffe9a8' }],
};

const _spriteCanvas = {};
const _spriteURL = {};

function crearSprite(nombre, escala) {
  let filas = SPRITES[nombre], cambios = {};
  if (VARIANTES[nombre]) { filas = SPRITES[VARIANTES[nombre][0]]; cambios = VARIANTES[nombre][1]; }
  const ancho = Math.max(...filas.map(f => f.length));
  const cv = document.createElement('canvas');
  cv.width = ancho * escala; cv.height = filas.length * escala;
  const ctx = cv.getContext('2d');
  filas.forEach((fila, y) => {
    [...fila].forEach((ch, x) => {
      if (ch === '.' || ch === ' ') return;
      ctx.fillStyle = cambios[ch] || PALETA[ch] || '#ff00ff';
      ctx.fillRect(x * escala, y * escala, escala, escala);
    });
  });
  return cv;
}

// canvas a tamaño real (para dibujar en otros canvas)
function sprite(nombre) {
  if (!_spriteCanvas[nombre]) _spriteCanvas[nombre] = crearSprite(nombre, 1);
  return _spriteCanvas[nombre];
}

// imagen grande y nítida (para <img>)
function spriteURL(nombre) {
  if (!_spriteURL[nombre]) _spriteURL[nombre] = crearSprite(nombre, 8).toDataURL();
  return _spriteURL[nombre];
}
