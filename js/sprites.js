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
  // colores extra para el Valle del Ketchup
  h: '#ff7b7b', // brillo rojo
  D: '#6e1423', // rojo muy oscuro
  c: '#fff1d6', // crema (etiqueta)
  L: '#a7f070', // verde lechuga claro
  v: '#1e7a3c', // verde oscuro
  u: '#e0a463', // madera clara
  n: '#b86f32', // madera
  N: '#7a4419', // madera oscura
  f: '#ffd85e', // papa frita
  F: '#e0a030', // papa frita sombra
  Y: '#fff3b0', // punta de la papa
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
  heinz: [
    '....kkkk....',
    '...kwwwsk...',
    '...kwwwsk...',
    '...kssssk...',
    '....khrk....',
    '....khrk....',
    '....kcck....',
    '....kcck....',
    '....khrk....',
    '....khrk....',
    '...khrrrk...',
    '..khrrrrdk..',
    '.khwrrrrrdk.',
    '.khwrrrrrdk.',
    '.khccccccdk.',
    '.khcccgccdk.',
    '.khccorccdk.',
    '.khccrrccdk.',
    '.khccccccdk.',
    '.khrcDDcrdk.',
    '.khrrccrrdk.',
    '.khrrrrrrdk.',
    '.khrrrrrrdk.',
    '.khdrrrrDdk.',
    '..kddddddk..',
    '...kDDDDk...',
    '....kkkk....',
  ],
  ensalada: [
    '....................',
    '.......kkkkk........',
    '....kkkLLLLLkkkkk...',
    '...kwrkLLgLLkggLLk..',
    '...krrgLLLgLggvLLk..',
    '..kggvgLgLvvvvgggk..',
    '..kgggLLLLwrvvgLLLk.',
    '.kvvvgLLLrrrrvgLLLk.',
    '.kvvvgLLLkrrvvkLLLk.',
    'kuuuuuuuuuuuuuuuuuuk',
    'knnunnnnnnnnnnnnnNnk',
    '.knnunnnnnnnnnnnNNk.',
    '..knnnnnnnnnnnnNNk..',
    '...kkNNNNNNNNNNkk...',
    '.....kkkkkkkkkk.....',
  ],
  papasCaja: [
    '........kk........',
    '....kk.kYFkk..kk..',
    '...kYFkkfFYFkkYFk.',
    '..kkfFYFfFfFkkfFk.',
    '.kYFfFfFfFfFYFfFk.',
    '.kfFfFfFfFfFfFfFk.',
    '.kfFfFfFfFfFfFfFk.',
    'kddddddddddddddddk',
    'khrrrrrrrrrrrrrrdk',
    'khrrrrrrrrrrrrrrdk',
    'khrrrrwwrrwwrrrrdk',
    '.khrrrwwwwwwrrrdk.',
    '.khrrrrwwwwrrrrdk.',
    '.khrrrrrwwrrrrrdk.',
    '..khrrrrrrrrrrdk..',
    '..khrrrrrrrrrrdk..',
    '..khdddddddddddk..',
    '...kkkkkkkkkkkk...',
  ],

  nube: [
    '....wwww.......',
    '..wwwwwwww.ww..',
    '.wwwwwwwwwwwwww',
    'wwwwwwwwwwwwwww',
    '.sssssssssssss.',
  ],
  pino: [
    '.......kkk.......',
    '......kLyvk......',
    '.....kLggvvk.....',
    '.....kLggvvk.....',
    '....kLggggvvk....',
    '....kLggggvvk....',
    '...kLgLggvvvvk...',
    '....kLggggvvk....',
    '...kLgrggggvvk...',
    '..kLggLggvvgvvk..',
    '.kLggLggggvvgvvk.',
    '..kLggggggygvvk..',
    '.kLggbgggggggvvk.',
    'kLggggggggggggvvk',
    '.kkkkkknnNkkkkkk.',
    '......knnNk......',
    '......knnNk......',
    '.......kkk.......',
  ],
  camara: [
    '.................',
    '.....kkkkk.kk....',
    '....kwwwwwkrrk...',
    '..kkkssssskrrkk..',
    '.kwwwwwwwwwwwwwk.',
    '.kwwssskkkssyysk.',
    '.kwwsskwbbksyysk.',
    '.kwwskbblbbksssk.',
    '.kwwskblllbksssk.',
    '.kwwsskbbbkssssk.',
    '.kwwsskkbkkssssk.',
    '.kDDDDDDDDDDDDDk.',
    '..kkkkkkkkkkkkk..',
    '.................',
  ],
  palomitas: [
    '......kkk......',
    '....kkccckk....',
    '...kccwcccck...',
    '..kccccccwcck..',
    '.kccccccccccck.',
    '..kcyccyccyck..',
    '.kccccccccccck.',
    '.kccccccccccck.',
    '.kdddddddddddk.',
    '.krrwwrrwwrrwk.',
    '.krrwwrrwwrrwk.',
    '.krrwwrrwwrrwk.',
    '..krwwrrwwrrk..',
    '..krwwrrwwrrk..',
    '..krwwrrwwrrk..',
    '..krwwrrwwrrk..',
    '...kwwrrwwrk...',
    '....kkkkkkk....',
  ],
  castillo: [
    '......kskkksk......',
    '.k.k.kkwwwwwkk.k.k.',
    'ksksksksssssksksksk',
    'kwwwwwkssssskwwwwwk',
    'kssssbkssysbkssssbk',
    'kssssbkssysbkssssbk',
    'kssysbkssssbkssysbk',
    'kssysbsssssbsssysbk',
    'kssssbsssssbsssssbk',
    'kssssbsssssbsssssbk',
    'kssssbsssssbsssssbk',
    'kssssbsssnsbsssssbk',
    'kssssbssnnNbsssssbk',
    'kssssbssnnNbsssssbk',
    'kssssbssnnNbsssssbk',
    'kssssbssnnNbsssssbk',
    'kssssbssnnNbsssssbk',
    '.kkkkkkkkkkkkkkkkk.',
  ],
  candado: [
    '...kkkkkk...',
    '..kssssssk..',
    '.kwskkkkssk.',
    '.kssk..kssk.',
    '.kssk..kssk.',
    '.ksskkkkssk.',
    'kYYYYYYYYYYk',
    'kyyyyyyyyook',
    'kyyyykkyyook',
    'kyyyykkyyook',
    'kyyyykkyyook',
    'kyyyyyyyyook',
    'kooooooooook',
    '.kkkkkkkkkk.',
  ],
  cofre: [
    '......................',
    '...kkkkkkkkkkkkkkkk...',
    '..kuuuuuuuuuuuuuuuuk..',
    '.kyyuuuuuuuuuuuuuuyyk.',
    '.kyynnnnnnnnnnnnnnyyk.',
    '.kyynnnnnnnnnnnnnnyyk.',
    '.kyynnnnnYyyynnnnnyyk.',
    '.kyynnnnnyyyynnnnnyyk.',
    '.kyyyyyyyykkyyyyyyyyk.',
    '.kyyuuuuuykkyuuuuuyyk.',
    '.kyynnNnnyyyynNnnnyyk.',
    '.kyynnNnnyyyynNnnnyyk.',
    '.kyynnNnnnNnnnNnnnyyk.',
    '.kyynnNnnnNnnnNnnnyyk.',
    '.kyynnNnnnNnnnNnnnyyk.',
    '.kyynnNnnnNnnnNnnnyok.',
    '.kyyNNNNNNNNNNNNNNyok.',
    '..kkkkkkkkkkkkkkkkkk..',
  ],
  cofreAbierto: [
    '...kkkkkkkkkkkkkkkk...',
    '..knnnnnnnnnnnnnnnnk..',
    '.kyyNNNNNNNNNNNNNNyyk.',
    '.kyyNNNNNNNNNNNNNNyyk.',
    '.kyyNNNNNNNNNNNNNNyyk.',
    '..kkkkkkkkkkkykkkkkk..',
    '...kYYYwyyYwyyyYYYk...',
    '...kYYYyyyYYyyyYYYk...',
    '..kkYYYyyyYYyyyYYYkk..',
    '.kyyuuuuuyyyyuuuuuyyk.',
    '.kyynnNnnykkynNnnnyyk.',
    '.kyynnNnnyyyynNnnnyyk.',
    '.kyynnNnnnNnnnNnnnyyk.',
    '.kyynnNnnnNnnnNnnnyyk.',
    '.kyynnNnnnNnnnNnnnyyk.',
    '.kyynnNnnnNnnnNnnnyok.',
    '.kyyNNNNNNNNNNNNNNyok.',
    '..kkkkkkkkkkkkkkkkkk..',
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
  heinzDorado: ['heinz', { r: '#ffcd75', h: '#fff3b0', d: '#e08a1e', D: '#a85a12', o: '#fff3b0' }],
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

// Dibujos hechos en Aseprite (carpeta Sprites/), exportados a img/ con exportar-sprites.bat.
// Si un nombre está aquí, se usa la imagen en vez del dibujo con letras de arriba.
const IMAGENES = {
  blu: 'img/stitch01.png',      // el compañero: diálogos, globitos y mapa
  bluMira: 'img/stitch02.png',  // el compañero mirando hacia arriba: pantalla de inicio
};

// imagen grande y nítida (para <img>)
function spriteURL(nombre) {
  if (IMAGENES[nombre]) return IMAGENES[nombre];
  if (!_spriteURL[nombre]) _spriteURL[nombre] = crearSprite(nombre, 8).toDataURL();
  return _spriteURL[nombre];
}
