# ✨ Paula y las 19 estrellas

Juego web para el cumpleaños de Paula (17 de diciembre). Se abre con un link en Safari o Chrome. No hay que instalar nada.

## Qué editar

| Quiero cambiar… | Archivo |
|---|---|
| Diálogos, preguntas, pistas, películas, chistes | `js/contenido.js` |
| La carta | `carta.txt` y después doble clic en `cifrar-carta.bat` |
| Las fotos | Carpeta `fotos/`, sus nombres en `js/contenido.js` y después doble clic en `cifrar-fotos.bat` |
| Los dibujos del compañero | Edítalos en Aseprite en la carpeta `Sprites/` (al lado de `cumple-paula`) y después doble clic en `exportar-sprites.bat` |

### Los dibujos (Aseprite)
- `exportar-sprites.bat` convierte cada `.aseprite` de `Sprites/` en `img/<nombre>.png`, recortado al dibujo.
- Qué dibujo sale dónde se elige en `js/sprites.js`, en `IMAGENES`:
  - `blu` → `img/stitch01.png`: diálogos, globitos y mapa.
  - `bluMira` → `img/stitch02.png`: pantalla de inicio.
- La carpeta `img/` **sí** se sube a GitHub.

El resto de archivos no hace falta tocarlo.

### Las fotos
1. Copia tus fotos a la carpeta `fotos/`. Por ejemplo: `fotos/playa.jpg`.
2. En `js/contenido.js`, cambia `"fotos/ejemplo-1.svg"` por `"fotos/playa.jpg"`.
3. Haz doble clic en `cifrar-fotos.bat`. Cifra las fotos con la clave 17/12 y las guarda en `fotos-cifradas/`. **Repítelo cada vez que cambies una foto o un nombre.**
4. Usa fotos de menos de ~500 KB, para que cargue rápido. Si pesan mucho, redúcelas con cualquier app o con squoosh.app.
5. Fotos necesarias:
   - **Memoria (nivel 1):** 6 fotos.
   - **Foto pixelada (nivel 2):** 4 fotos. Para cada una, la respuesta correcta va primero en `opciones`. Por ejemplo: `"El viaje a ..."`.
   - **Rompecabezas (nivel 5):** 1 foto. El juego la recorta en cuadrado por el centro, así que conviene que tenga la cara al centro. La actual es `fotos/puzzle.jpg`, un recorte cuadrado de `flores-sorpresa.jpg`.

### La carta
1. Abre `carta.txt` y escribe la carta. Sepárala en 5 trozos con una línea que tenga solo `---`.
2. Haz doble clic en `cifrar-carta.bat`. Eso actualiza `js/carta-cifrada.js`.
3. `carta.txt` **no se sube** a GitHub (está en `.gitignore`). Solo se sube la versión cifrada, que se abre con **17/12**.

## Probar en el PC
```powershell
python -m http.server 8719
```
Ejecútalo dentro de la carpeta `cumple-paula` y abre http://localhost:8719

- `http://localhost:8719/?reiniciar` borra el progreso y empieza de cero.

> ⚠ En el celular no funciona con la IP del PC (http://192.168…), porque el cifrado exige https. Para probar en el celular, usa el link de GitHub Pages.

## Publicar en GitHub Pages
1. Crea un repositorio nuevo en GitHub, por ejemplo `cumple-paula`.
2. Sube **el contenido** de esta carpeta **sin `carta.txt` y sin la carpeta `fotos/`**. Con git, el `.gitignore` ya las deja fuera. Si arrastras los archivos a la web de GitHub, no las arrastres. Sí hay que subir `fotos-cifradas/`.
3. Ve a Settings → Pages → Branch: `main`, carpeta `/ (root)` → Save.
4. En 1 o 2 minutos el link será `https://TU-USUARIO.github.io/cumple-paula/`.
5. Antes del día, pruébalo con `?reiniciar` al final para empezar limpio. El 17, mándale el link **sin** `?reiniciar`.

### Privacidad
- La carta va cifrada: sin la clave 17/12 no se puede leer, ni siquiera mirando el código.
- Las **fotos también van cifradas** con la misma clave (`fotos-cifradas/`). Sin 17/12 son solo datos ilegibles. Las originales están en `fotos/`, que no se sube.

## Notas
- En iPhone, si el interruptor de silencio está activado puede que no suene. Hay un botón 🔊 para activar o quitar el sonido.
- El progreso se guarda en su teléfono. Si cierra la página, al volver sigue donde iba.
