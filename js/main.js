// =====================================================================
//  Arranque
//   • Añade ?reiniciar al final del enlace para borrar el progreso
//     (útil para probar). Ej: https://.../cumple-paula/?reiniciar
// =====================================================================
'use strict';

(function iniciar() {
  document.title = '✨ ' + txt(C.tituloJuego) + ' ✨';
  const params = new URLSearchParams(location.search);
  window.MODO_PRUEBA = params.has('prueba');
  if (params.has('reiniciar')) {
    localStorage.removeItem(LLAVE);
    estado = cargarEstado();
    history.replaceState(null, '', location.pathname);
  }
  crearCielo();
  pantallaInicio();
})();
