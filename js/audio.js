// =====================================================================
//  Sonido 8-bit generado por código (sin archivos, sin derechos de autor)
// =====================================================================
'use strict';

const Sonido = (() => {
  let ctx = null, master = null, bus = null;
  let activo = localStorage.getItem('paula19_sonido') !== 'no';
  let pistaPedida = null, pistaActual = null, timer = null, t0 = 0, paso = 0;

  const f = n => 440 * Math.pow(2, (n - 69) / 12);

  // Música original: 4 compases que se repiten. Notas MIDI (0 = silencio)
  const PISTAS = {
    aventura: {
      bpm: 116,
      lead: [72,0,76,79, 77,76,74,0, 72,0,76,79, 81,79,77,0, 74,0,77,81, 79,77,76,74, 76,74,72,71, 72,0,0,0],
      bajo: [48,55,48,55, 45,52,45,52, 41,48,41,48, 43,50,43,50],
      tipoLead: 'square', volLead: 0.09, tipoBajo: 'triangle', volBajo: 0.22,
    },
    final: {
      bpm: 84,
      lead: [65,69,72,77,72,69,65,69, 60,64,67,72,67,64,60,64, 57,60,64,69,64,60,57,60, 55,59,62,67,62,59,55,59],
      bajo: [41,0,41,0, 36,0,36,0, 45,0,45,0, 43,0,43,0],
      tipoLead: 'triangle', volLead: 0.16, tipoBajo: 'triangle', volBajo: 0.2,
    },
  };

  function iniciar() {
    if (ctx) { if (ctx.state !== 'running') ctx.resume(); return; }
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    try { if (navigator.audioSession) navigator.audioSession.type = 'playback'; } catch (_) {}
    ctx = new AC();
    master = ctx.createGain(); master.gain.value = activo ? 0.6 : 0; master.connect(ctx.destination);
    bus = ctx.createGain(); bus.gain.value = 0.5; bus.connect(master);
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden && ctx.state !== 'running') ctx.resume();
    });
    if (pistaPedida) musica(pistaPedida);
  }

  function tono(freq, ini, dur, tipo = 'square', vol = 0.15, destino = master, hasta = null) {
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.type = tipo;
    o.frequency.setValueAtTime(freq, ini);
    if (hasta) o.frequency.exponentialRampToValueAtTime(hasta, ini + dur);
    g.gain.setValueAtTime(vol, ini);
    g.gain.exponentialRampToValueAtTime(0.0001, ini + dur);
    o.connect(g); g.connect(destino);
    o.start(ini); o.stop(ini + dur + 0.03);
  }

  function arpegio(notas, sep, dur, tipo = 'square', vol = 0.12) {
    const t = ctx.currentTime;
    notas.forEach((n, i) => tono(f(n), t + i * sep, dur, tipo, vol));
  }

  function sfx(tipo) {
    if (!ctx || !activo) return;
    const t = ctx.currentTime;
    switch (tipo) {
      case 'tap': tono(880, t, 0.05, 'square', 0.06); break;
      case 'texto': tono(620 + Math.random() * 90, t, 0.025, 'square', 0.025); break;
      case 'voltear': tono(500, t, 0.07, 'triangle', 0.18, master, 760); break;
      case 'deslizar': tono(320, t, 0.06, 'triangle', 0.16, master, 200); break;
      case 'bien': arpegio([72, 79], 0.08, 0.14); break;
      case 'error': tono(220, t, 0.25, 'sawtooth', 0.1, master, 110); break;
      case 'estrella': arpegio([76, 79, 84, 88], 0.06, 0.14, 'square', 0.1); break;
      case 'ketchup': arpegio([84, 91], 0.05, 0.08, 'square', 0.08); break;
      case 'ensalada': tono(170, t, 0.32, 'square', 0.1, master, 60); break;
      case 'dorado': arpegio([84, 88, 91, 96], 0.04, 0.1, 'square', 0.08); break;
      case 'fragmento': arpegio([72, 76, 79, 84, 79, 84, 88], 0.09, 0.2, 'square', 0.09); break;
      case 'victoria': arpegio([72, 76, 79, 84, 84, 88, 91, 96], 0.1, 0.25, 'square', 0.09); break;
      case 'magia': arpegio([72, 74, 76, 79, 81, 84, 86, 88, 91, 93, 96, 98], 0.06, 0.3, 'triangle', 0.14); break;
    }
  }

  function nota(midi, dur = 0.4) {
    if (!ctx || !activo) return;
    tono(f(midi), ctx.currentTime, dur, 'triangle', 0.18);
    tono(f(midi + 12), ctx.currentTime, dur * 0.6, 'square', 0.03);
  }

  function musica(nombre) {
    pistaPedida = nombre;
    if (!ctx || pistaActual === nombre) return;
    pistaActual = nombre;
    clearInterval(timer); timer = null;
    if (!nombre) return;
    const P = PISTAS[nombre];
    const dur = 60 / P.bpm / 2;
    paso = 0; t0 = ctx.currentTime + 0.1;
    timer = setInterval(() => {
      if (t0 < ctx.currentTime - 0.1) t0 = ctx.currentTime + 0.05; // si la pestaña estuvo dormida
      while (t0 < ctx.currentTime + 0.25) {
        const L = P.lead[paso % P.lead.length];
        if (L) tono(f(L), t0, dur * 0.9, P.tipoLead, P.volLead, bus);
        if (paso % 2 === 0) {
          const B = P.bajo[(paso / 2) % P.bajo.length];
          if (B) tono(f(B), t0, dur * 1.8, P.tipoBajo, P.volBajo, bus);
        }
        paso++; t0 += dur;
      }
    }, 60);
  }

  function alternar() {
    activo = !activo;
    localStorage.setItem('paula19_sonido', activo ? 'si' : 'no');
    if (master) master.gain.value = activo ? 0.6 : 0;
    return activo;
  }

  return { iniciar, sfx, nota, musica, alternar, activo: () => activo };
})();
