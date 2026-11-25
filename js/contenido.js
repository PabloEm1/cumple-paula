// =====================================================================
//  CONTENIDO DEL JUEGO  ✏️  — aquí puedes cambiar todos los textos
// =====================================================================
//  Reglas rápidas:
//   • Escribe siempre entre comillas "así", y separa con comas.
//   • {nombre}, {deParte} y {companero} se cambian solos por los nombres.
//   • Cada línea de una lista entre [ ] es un "globo" de diálogo.
//   • En las preguntas, la PRIMERA opción es la correcta
//     (el juego las mezcla solo, no te preocupes).
//   • La carta NO va aquí: va en el archivo carta.txt (ver LEEME.md).
// =====================================================================

window.CONTENIDO = {
  nombre: "Paula",
  deParte: "Pablo",
  companero: "Blu",                 // el alien que la acompaña
  tituloJuego: "Paula y las 19 estrellas",

  // ---------------------------------------------------------------
  //  PANTALLA DE LA CONTRASEÑA (la clave es 17/12, ver LEEME.md)
  // ---------------------------------------------------------------
  clave: {
    titulo: "El cofre mágico",
    texto: "Este cofre solo se abre con una fecha muy especial... (día / mes)",
    pistas: [
      "Mmm... no. Piensa en un día MUY especial 🎂",
      "Pista: es el día en que alguien cumple años... y ese alguien eres tú 👀",
      "Última pista: es en diciembre ❄️",
    ],
  },

  // ---------------------------------------------------------------
  //  INTRODUCCIÓN (sale la primera vez, después de la contraseña)
  // ---------------------------------------------------------------
  intro: [
    "¡Hola, {nombre}! Por fin te encuentro.",
    "Soy {companero}, un pequeño alien azul que vino del espacio. Sí, ya sé lo que estás pensando... no, no soy ESE alien azul famoso. Soy su primo lejano 👽",
    "{deParte} escribió una carta para tu cumpleaños, pero un viento mágico la rompió en 5 pedazos y los esparció por todo el reino.",
    "Para recuperarlos tendrás que superar 5 pruebas. En cada una ganarás un fragmento de la carta... y algunas estrellas.",
    "Hay 19 estrellas escondidas, una por cada año que cumples. ¡Feliz cumpleaños, por cierto! 🎉",
    "Si te atoras, toca el botón de PISTA y te ayudo. ¡Vamos, niña! Empieza por el bosque 🌲",
  ],

  // Cuando vuelve a abrir el juego a mitad de la aventura
  bienvenida: [
    "¡Volviste, {nombre}! Te estaba esperando 💙",
    "Sigamos donde lo dejamos 👉",
  ],

  // Frases al azar cuando falla una pregunta (niveles 2 y 4)
  bromasFallo: [
    "Mmm no. Ya sé, ya sé: tú siempre tienes la razón... pero esta vez no 😅",
    "Casi casi... ¡prueba otra!",
    "Nop. Pero no se lo diré a {deParte} 🤐",
    "Esa no, niña 🙈",
    "Error 404: respuesta correcta no encontrada 🤖",
  ],
  // Frases al azar cuando acierta
  bromasAcierto: [
    "¡Exacto! ✨",
    "¡Bien, niña!",
    "¡Ojo de experta! 👀",
    "¡Eso es! 🎉",
  ],

  // ---------------------------------------------------------------
  //  LOS 5 NIVELES
  // ---------------------------------------------------------------
  niveles: {

    // 1) JUEGO DE MEMORIA: encontrar las parejas de fotos -----------
    memoria: {
      lugar: "Bosque de los Recuerdos",
      icono: "🌲",
      intro: [
        "Este es el Bosque de los Recuerdos 🌲",
        "Los árboles guardan fotos de tus momentos favoritos: fiestas, selfies con tus amigas... pero las pusieron todas boca abajo.",
        "Voltea las cartas y encuentra las parejas. ¡Tú puedes, niña!",
      ],
      // De 2 a 8 fotos (6 queda perfecto). Pon aquí las tuyas.
      fotos: [
        "fotos/selfie-trio.webp",
        "fotos/amigas-mesa.webp",
        "fotos/selfie-cocina.webp",
        "fotos/flores-1.jpg",
        "fotos/bebe.jpg",
        "fotos/fiesta-18.webp",
      ],
      pista: "¡Te dejo verlas todas un segundito! Memoriza rápido 👀",
      ayuda: [
        "Uy, este bosque es tramposo... 🌲🌲🌲",
        "Déjame ayudarte: te enseño todas las cartas un momentito.",
      ],
      final: [
        "¡Lo lograste! Entre las ramas había algo escondido...",
        "¡El primer fragmento de la carta! 📜",
        "Siguiente parada: la Torre de la Fotógrafa 📷",
      ],
    },

    // 2) FOTO PIXELADA: adivinar qué es cada foto -------------------
    borrosa: {
      lugar: "Torre de la Fotógrafa",
      icono: "📷",
      intro: [
        "Bienvenida a la Torre de la Fotógrafa. Dicen que aquí vive la mejor fotógrafa del reino 📸",
        "...o sea, tú 😌",
        "Un hechizo dejó estas fotos todas pixeladas. Se irán aclarando poco a poco.",
        "Adivina qué es cada una antes de que se vea del todo. ¡Ojo de fotógrafa!",
      ],
      // La primera opción es la correcta. "pista" sale al tocar PISTA.
      rondas: [
        {
          foto: "fotos/rio.jpg",
          opciones: ["Un paseo junto al río", "Un día en la playa", "Una excursión a la montaña", "Una tarde en la piscina"],
          pista: "Hay agua, casitas de colores... ¡y un flamenco inflable! 🦩",
        },
        {
          foto: "fotos/ascensor.jpg",
          opciones: ["Una selfie en el ascensor", "Una foto en el probador", "Una selfie en el baño", "Una foto en el metro"],
          pista: "Sube y baja, sube y baja... 🛗",
        },
        {
          foto: "fotos/fiesta-18.webp",
          opciones: ["Los 18 de Noelia", "Una boda", "Una graduación", "Una cena de Navidad"],
          pista: "Hay pastel, un 18 en las velas... y era de tu mejor amiga 🎂",
        },
        {
          foto: "fotos/bebe.jpg",
          opciones: ["Con Thiago en brazos", "Con un perrito", "Con un peluche gigante", "Con un ramo de flores"],
          pista: "Alguien muy chiquito está durmiendo... es el bebé de Cindy 👶",
        },
      ],
      final: [
        "¡Qué ojo tienes! Se nota que eres fotógrafa 📸",
        "¡Segundo fragmento conseguido! 📜",
        "Ahora... huele a algo rico. Vamos al Valle del Ketchup 🍅",
      ],
    },

    // 3) LLUVIA DE KETCHUP: atrapar botellas ------------------------
    ketchup: {
      lugar: "Valle del Ketchup",
      icono: "🍅",
      intro: [
        "Bienvenida al Valle del Ketchup 🍅",
        "Me contaron que el ketchup es MUY importante para ti. Muy, muy importante.",
        "Pero no cualquier ketchup, ¿eh? Aquí solo llueve Heinz. El mejor del universo, como tú siempre dices 😌",
        "Mueve la cajita de papas con el dedo y atrapa todas las botellas que puedas.",
        "¡Pero cuidado con la ensalada! 🥗🤢 Te quita puntos.",
        "Las botellas doradas valen 3. ¡A comer!",
      ],
      meta: 20,   // puntos para ganar
      frasesKetchup: ["¡Ñam!", "¡Heinz, como debe ser!", "¡Más ketchup!", "¡Así se hace!", "¡Eso, niña!"],
      frasesEnsalada: ["¡Ensalada no! 🥗🤢", "¿Lechuga? ¿En serio? 😤", "¡Puaj! Eso no era ketchup", "La ensalada es la villana de esta historia 😤"],
      ofrecerLento: "Esa ensalada está muy agresiva hoy... ¿Quieres que la lluvia vaya más lenta?",
      ganar: "¡Heinz para toda la vida! 🍅",
      final: [
        "¡Increíble! Nunca había visto a nadie atrapar tanto Heinz 🍅",
        "Por cierto, alguien pasó por aquí preguntando por una tal \"Patapalo\"... no sé quién será 👀🤔",
        "¡Tercer fragmento! 📜 Ahora vamos al Cine Encantado 🎬",
      ],
    },

    // 4) CINE: adivinar la peli o serie por los emojis --------------
    cine: {
      lugar: "Cine Encantado",
      icono: "🎬",
      intro: [
        "Llegamos al Cine Encantado 🍿",
        "Aquí solo ponen pelis románticas y series... justo lo tuyo.",
        "Pero el proyector se volvió loco y solo muestra emojis. ¿Adivinas qué peli o serie es?",
      ],
      // La primera opción es la correcta
      preguntas: [
        {
          emojis: "🚢🧊💑💔",
          opciones: ["Titanic", "Pearl Harbor", "Moana", "La Sirenita"],
          pista: "Un barco que no debió chocar con un hielo... 🧊",
        },
        {
          emojis: "📓👵👴🌧️💋",
          opciones: ["Diario de una pasión", "Bajo la misma estrella", "Querido John", "Yo antes de ti"],
          pista: "Él le lee su historia de amor en un cuaderno... 📓",
        },
        {
          emojis: "🌺👧👽🐶🌊",
          opciones: ["Lilo & Stitch", "E.T.", "Moana", "Lluvia de hamburguesas"],
          pista: "Ohana significa familia 💙",
        },
        {
          emojis: "☕🛋️👫👫👫🦞",
          opciones: ["Friends", "How I Met Your Mother", "The Big Bang Theory", "Modern Family"],
          pista: "Seis amigos, un sofá y una cafetería ☕",
        },
      ],
      final: [
        "¡Eres una experta en pelis y series! 🍿",
        "¡Cuarto fragmento! 📜 Solo queda uno...",
        "Está en lo alto del Castillo de las Estrellas 🏰",
      ],
    },

    // 5) ROMPECABEZAS DESLIZANTE con una foto -----------------------
    puzzle: {
      lugar: "Castillo de las Estrellas",
      icono: "🏰",
      intro: [
        "Este es el Castillo de las Estrellas 🏰 El último fragmento está aquí dentro.",
      ],
      instrucciones: [
        "La puerta tiene un rompecabezas mágico con una foto.",
        "Toca las piezas que están junto al hueco para moverlas. ¡Ordénalas y la puerta se abrirá!",
        "Si te mareas, toca VER FOTO para recordar cómo era.",
      ],
      foto: "fotos/puzzle.jpg",   // se recorta en cuadrado; mejor con la cara al centro
      ofrecerAyuda: "Este rompecabezas es durito, ¿eh? ¿Quieres que lo termine yo por ti?",
      final: [
        "¡La puerta se abrió! ✨",
        "¡¡Tienes el quinto fragmento!! 📜",
      ],
    },
  },

  // ---------------------------------------------------------------
  //  EL CHISTE DEL PARCHÍS (sale antes del rompecabezas)
  // ---------------------------------------------------------------
  parchis: {
    antes: [
      "Antes de entrar... {deParte} me pidió que te dijera una cosa.",
      "Dice que él es MUCHO mejor que tú en el parchís 🎲",
    ],
    pregunta: "¿Es verdad?",
    opciones: [
      { texto: "Sí, es verdad 😔", respuesta: ["¡¿En serio lo admites?! Voy a guardar esta respuesta para siempre 😂"] },
      { texto: "¡¡MENTIRA!!", respuesta: ["Ya me imaginaba... Le diré que tú siempre tienes la razón. Como siempre 😌"] },
    ],
  },

  // ---------------------------------------------------------------
  //  EL FINAL
  // ---------------------------------------------------------------
  final: {
    antes: [
      "¡¡Lo lograste, {nombre}!! Tienes los 5 fragmentos 📜",
      "Y las 19 estrellas ✨",
      "Ahora vamos a unir las piezas para que leas la carta de {deParte}. ¿Lista?",
    ],
    tituloCarta: "Para {nombre}",
    botonEstrellas: "★ Una cosa más...",
    felicitacion: "¡Feliz cumpleaños, {nombre}!",
    subtitulo: "19 años, 19 estrellas ✨",
    despedida: [
      "Bueno, niña, mi misión aquí terminó 👽",
      "Gracias por jugar. ¡Que tengas el mejor cumpleaños del universo! 💙",
    ],
  },
};
