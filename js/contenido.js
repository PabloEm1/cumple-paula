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

    // 4) CINE: Blu cuenta la peli (a su manera) y ella adivina -------
    cine: {
      lugar: "Cine Encantado",
      icono: "🎬",
      intro: [
        "Llegamos al Cine Encantado 🍿",
        "Aquí solo ponen tus pelis y series favoritas... justo lo tuyo.",
        "Pero el proyector se rompió, así que te las voy a contar yo. A mi manera 👽",
        "Tú adivina cuál es. ¡Y no se vale reírse de mis resúmenes!",
      ],
      cuantas: 5,   // cuántas pregunta (elige al azar de la lista de abajo)
      // Su top 10, en el orden en que sale al final en la marquesina.
      // "resumen" es lo que cuenta Blu; las otras opciones salen solas de la misma lista.
      pelis: [
        {
          titulo: "Amor a medianoche",
          resumen: "Una chica que no puede tomar el sol ni un poquito, así que sale de noche a cantar con su guitarra en una estación de tren. Un chico la escucha y... Yo al principio pensé que era una vampira 🧛‍♀️",
          pista: "La protagonista no puede ver el amanecer ☀️🚫",
        },
        {
          titulo: "Antes de ti",
          resumen: "Una chica con la ropa más colorida del planeta empieza a trabajar cuidando a un chico muy gruñón que vive al lado de un castillo. Al principio no se soportan. Prepara los pañuelos 😭",
          pista: "Ella tiene unas medias de abejita muy famosas 🐝",
        },
        {
          titulo: "Lilo y Stitch",
          resumen: "Una niña de Hawái adopta un \"perrito\" en un refugio. Spoiler: no es un perrito. Es un primo lejano mío que lo rompe todo 👽",
          pista: "Pasa en Hawái y suena mucho Elvis 🌺",
        },
        {
          titulo: "Cómo perder a un chico en 10 días",
          resumen: "Una periodista tiene que conseguir que un chico la deje en 10 días para escribir un artículo. Él apostó que la enamoraría en 10 días. Los dos hacen trampa. Los humanos son rarísimos 🤔",
          pista: "Hay un helecho del amor 🌿",
        },
        {
          titulo: "Corazones malheridos",
          resumen: "Una cantante y un soldado que no se soportan se casan... de mentira, para tener un seguro médico. Lo de \"de mentira\" no les dura mucho 💍",
          pista: "Ella canta y él es marine 🎤🪖",
        },
        {
          titulo: "El verano en que me enamoré",
          resumen: "Una chica pasa todos los veranos en una casa en la playa con dos hermanos. El problema: ¿cuál de los dos? En mi planeta no hay veranos, así que yo no entiendo nada 🏖️",
          pista: "La playa se llama Cousins 🏖️",
        },
        {
          titulo: "Love is in the Air",
          resumen: "Un arquitecto muy serio le quita la beca a una chica que trabaja en una floristería. Después le propone fingir que son novios durante dos meses. Así se enamora la gente en Turquía, por lo visto 🇹🇷",
          pista: "Él es arquitecto y ella vende flores 💐",
        },
        {
          titulo: "The Good Doctor",
          resumen: "Un cirujano joven y brillantísimo que ve el cuerpo humano por dentro como si fuera un mapa. Con las personas le cuesta un poquito más. Igual que a mí 🩺",
          pista: "Es una serie de médicos en un hospital de San José 🏥",
        },
        {
          titulo: "El diario de Noa",
          resumen: "Un señor mayor le lee cada día a una señora una historia de amor escrita en un cuaderno. Hay lluvia, una barca, un beso... y yo llorando en la butaca 😭",
          pista: "Un cuaderno, una casa blanca y una barca bajo la lluvia 🚣",
        },
        {
          titulo: "Orgullo y prejuicio",
          resumen: "Una chica muy lista y un señor muy estirado se conocen en un baile y se caen fatal. Él es un engreído, ella no lo soporta... Siglo XIX, vestidos largos y muchas cartas 💌",
          pista: "Cinco hermanas y una madre desesperada por casarlas 👗",
        },
      ],
      // El remate: la marquesina enseña su top 10
      top10: {
        titulo: "TOP 10 DE {nombre}",
        antes: [
          "Espera, espera... ¡el proyector se arregló solo! ✨",
          "Mira lo que sale en la pantalla 👀",
        ],
        despues: [
          "Sí, sí... ya sé que {deParte} te lo tuvo que preguntar a ti 😂",
          "Ahora ya sabes para qué era 😏",
        ],
      },
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
