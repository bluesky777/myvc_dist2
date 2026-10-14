/* Microviaje — contenido pedagógico.
   Un docente puede cambiar textos, misiones y preguntas sin tocar juego.js.
   En app2 este objeto vendrá de la API.

   Cada misión trae `busca` (el id de un organelo, o una lista si sirven varios) o `paradas`
   (una cadena de organelos en orden; cada parada puede cambiar lo que lleva el nanorobot:
   'arnm', 'cadena', 'proteina', 'vesicula' o null). Los ids están en `organelos`.
   En las preguntas, `correcta` es la posición de la opción buena; el juego las baraja. */
window.DATOS_CELULA = {
  titulo: 'Microviaje',
  frase: 'Encógete hasta caber dentro de una célula y aprende qué hace cada una de sus partes.',
  comoSeJuega: 'Nada con las flechas o WASD (en el celular, arrastra el dedo). Espacio da un impulso. Toca el organelo que te piden.',

  organelos: {
    nucleo: {
      nombre: 'Núcleo', art: 'el núcleo', color: '#7b4fd0',
      corta: 'guardo el ADN, las instrucciones de la célula.',
      dato: 'El núcleo guarda el ADN: las instrucciones para todo lo que hace la célula. Adentro está el nucléolo, la mancha oscura, que arma las piezas de los ribosomas.'
    },
    mitocondria: {
      nombre: 'Mitocondria', art: 'una mitocondria', color: '#ff6a4d',
      corta: 'saco energía del azúcar.',
      dato: 'La mitocondria usa el azúcar (glucosa) y el oxígeno para producir la energía que la célula gasta. Por eso le dicen la central de energía.'
    },
    ribosoma: {
      nombre: 'Ribosomas', art: 'los ribosomas', color: '#5b2d82',
      corta: 'leemos el mensaje del núcleo y armamos proteínas.',
      dato: 'Los ribosomas leen el mensaje que manda el núcleo y con él arman proteínas, pieza por pieza. Son tan pequeños que se ven como puntitos.'
    },
    re: {
      nombre: 'Retículo endoplasmático', art: 'el retículo endoplasmático', color: '#3b9be0',
      corta: 'soy una red de túneles que dobla y transporta proteínas.',
      dato: 'El retículo endoplasmático es una red de sacos y túneles pegada al núcleo. La parte con ribosomas, la rugosa, fabrica y dobla proteínas; la parte lisa fabrica grasas.'
    },
    golgi: {
      nombre: 'Aparato de Golgi', art: 'el aparato de Golgi', color: '#f2a623',
      corta: 'empaco las proteínas y las envío.',
      dato: 'El aparato de Golgi recibe las proteínas del retículo, las termina, las empaca en burbujas llamadas vesículas y las manda a donde hacen falta. Es como la oficina de correos de la célula.'
    },
    lisosoma: {
      nombre: 'Lisosoma', art: 'un lisosoma', color: '#2f9e5d',
      corta: 'digiero lo que ya no sirve.',
      dato: 'El lisosoma tiene enzimas que desarman lo que la célula ya no necesita y lo que entra de afuera. Es el centro de reciclaje.'
    },
    centriolos: {
      nombre: 'Centriolos', art: 'los centriolos', color: '#ee7d12',
      corta: 'ayudamos a la célula a dividirse.',
      dato: 'Los centriolos son dos cilindros hechos de tubitos. Cuando la célula se divide, ayudan a repartir el ADN entre las dos células nuevas. Las células vegetales no los tienen.'
    },
    vacuola: {
      nombre: 'Vacuola', art: 'una vacuola', color: '#5bb8e8',
      corta: 'guardo agua y otras sustancias.',
      dato: 'Las vacuolas son bolsitas que guardan agua, alimento o desechos. En la célula animal son pequeñas; en la vegetal hay una gigante.'
    },
    membrana: {
      nombre: 'Membrana celular', art: 'la membrana celular', color: '#ff8f73',
      corta: 'soy el borde: decido qué entra y qué sale.',
      dato: 'La membrana rodea toda la célula. Es flexible y deja pasar unas sustancias y otras no: así decide qué entra y qué sale.'
    },
    cloroplasto: {
      nombre: 'Cloroplasto', art: 'un cloroplasto', color: '#3fa34d',
      corta: 'hago la fotosíntesis con la luz del sol.',
      dato: 'El cloroplasto atrapa la luz del sol con un pigmento verde, la clorofila. Con esa luz, agua y dióxido de carbono fabrica azúcar: eso es la fotosíntesis. Sólo las plantas y las algas los tienen.'
    },
    vacuolaCentral: {
      nombre: 'Vacuola central', art: 'la vacuola central', color: '#5bb8e8',
      corta: 'guardo agua y mantengo firme la célula.',
      dato: 'La vacuola central ocupa casi toda la célula vegetal. Guarda agua y, cuando está llena, empuja contra la pared y mantiene firme la planta. Si le falta agua, la planta se marchita.'
    },
    pared: {
      nombre: 'Pared celular', art: 'la pared celular', color: '#6fae3f',
      corta: 'soy una capa dura por fuera de la membrana.',
      dato: 'La pared celular es una capa rígida de celulosa, por fuera de la membrana. Le da forma a la célula vegetal y la protege. Las células animales no la tienen.'
    }
  },

  niveles: [
    {
      nombre: 'Conoce la célula',
      resumen: 'Te digo el nombre, tú lo encuentras',
      celula: 'animal',
      etiquetas: true,
      intro: 'Esta es una célula animal vista por dentro. Cada parte se llama organelo. Te digo el nombre y tú nadas hasta él. Acércate y verás los nombres.',
      misiones: [
        { busca: 'nucleo', texto: 'Ve al núcleo.', pista: 'Es la bola morada grande, cerca del centro.' },
        { busca: 'mitocondria', texto: 'Busca una mitocondria.', pista: 'Son óvalos naranjas con rayas por encima. Hay varias.' },
        { busca: 're', texto: 'Ve al retículo endoplasmático.', pista: 'Son los pliegues azules pegados al núcleo.' },
        { busca: 'golgi', texto: 'Ve al aparato de Golgi.', pista: 'Son sacos amarillos apilados, como panqueques curvos.' },
        { busca: 'ribosoma', texto: 'Encuentra un grupo de ribosomas.', pista: 'Busca puntitos morados oscuros sueltos, en racimo.' },
        { busca: 'lisosoma', texto: 'Busca un lisosoma.', pista: 'Son bolitas verdes con puntos claros.' },
        { busca: 'centriolos', texto: 'Ve a los centriolos.', pista: 'Son dos cilindros naranjas: uno acostado y otro de pie.' },
        { busca: 'membrana', texto: 'Toca la membrana celular.', pista: 'Nada hasta el borde de la célula.' }
      ],
      preguntas: [
        { texto: '¿Dónde está guardado el ADN?', opciones: ['En el núcleo', 'En la membrana', 'En un lisosoma'], correcta: 0, explica: 'El ADN, las instrucciones de la célula, está en el núcleo.' },
        { texto: '¿Qué parte rodea toda la célula?', opciones: ['La membrana celular', 'El aparato de Golgi', 'El retículo endoplasmático'], correcta: 0, explica: 'La membrana es el borde y decide qué entra y qué sale.' },
        { texto: '¿Qué organelos son tan pequeños que se ven como puntitos?', opciones: ['Los ribosomas', 'Los núcleos', 'Las mitocondrias'], correcta: 0, explica: 'Los ribosomas son diminutos y hay miles en cada célula.' }
      ]
    },
    {
      nombre: '¿Quién hace qué?',
      resumen: 'Te digo qué hace, tú adivinas cuál es',
      celula: 'animal',
      etiquetas: false,
      intro: 'Ahora los nombres están escondidos. Te digo qué hace el organelo; tú adivinas cuál es y nadas hasta él. Cuando toques uno, verás su nombre.',
      misiones: [
        { busca: 'mitocondria', texto: 'Ve al organelo que produce la energía de la célula.', pista: 'Es la central de energía: óvalos naranjas con rayas.' },
        { busca: 'nucleo', texto: 'Ve a donde se guardan las instrucciones de la célula, el ADN.', pista: 'Es el organelo más grande.' },
        { busca: 'golgi', texto: 'Ve al organelo que empaca las proteínas para enviarlas.', pista: 'Es la oficina de correos: sacos amarillos apilados.' },
        { busca: 'lisosoma', texto: 'Ve al que digiere y recicla lo que ya no sirve.', pista: 'Es una bolita verde llena de enzimas.' },
        { busca: ['ribosoma', 're'], texto: 'Ve a donde se arman las proteínas, pieza por pieza.', pista: 'Son los puntitos morados. Algunos están sueltos y otros pegados al retículo.' },
        { busca: 'membrana', texto: 'Ve a la parte que decide qué entra y qué sale.', pista: 'Está en el borde de todo.' },
        { busca: 'centriolos', texto: 'Ve a los que ayudan cuando la célula se divide.', pista: 'Son dos cilindros naranjas.' },
        { busca: 'vacuola', texto: 'Ve a una bolsita que guarda agua.', pista: 'Son burbujas azules transparentes.' }
      ],
      preguntas: [
        { texto: 'Un músculo trabaja mucho y necesita mucha energía. ¿Qué organelo tendrá en gran cantidad?', opciones: ['Mitocondrias', 'Lisosomas', 'Centriolos'], correcta: 0, explica: 'Las células del músculo tienen muchísimas mitocondrias.' },
        { texto: '¿Qué hace el aparato de Golgi?', opciones: ['Empaca y envía proteínas', 'Guarda el ADN', 'Hace la fotosíntesis'], correcta: 0, explica: 'El Golgi empaca las proteínas en vesículas y las envía.' },
        { texto: 'Si los lisosomas dejaran de funcionar, ¿qué pasaría?', opciones: ['La célula se llenaría de desechos', 'La célula perdería su ADN', 'La célula se volvería verde'], correcta: 0, explica: 'Sin lisosomas, la célula no puede reciclar lo que ya no sirve.' }
      ]
    },
    {
      nombre: 'Repartidor',
      resumen: 'Fabrica una proteína parada por parada',
      celula: 'animal',
      etiquetas: true,
      intro: 'La célula necesita fabricar proteínas y tú las llevas. Ve de una parada a otra, en orden: en cada una cambia lo que cargas.',
      misiones: [
        {
          titulo: 'Una proteína para enviar afuera',
          paradas: [
            { busca: 'nucleo', texto: 'Recoge en el núcleo el mensaje con la receta.', lleva: 'arnm', logro: '¡Tienes el <b>ARN mensajero</b>! Es una copia de la receta que está en el ADN.', pista: 'El núcleo es la bola morada grande.' },
            { busca: ['ribosoma', 're'], texto: 'Lleva el mensaje a los ribosomas para que lo lean.', lleva: 'cadena', logro: 'Los ribosomas leyeron el mensaje y armaron una <b>cadena</b> de piezas.', pista: 'Los ribosomas son los puntitos morados; también hay en el retículo.' },
            { busca: 're', texto: 'Lleva la cadena al retículo endoplasmático para que se doble.', lleva: 'proteina', logro: 'En el retículo la cadena se dobló: ya es una <b>proteína</b>.', pista: 'Son los pliegues azules junto al núcleo.' },
            { busca: 'golgi', texto: 'Llévala al aparato de Golgi para empacarla.', lleva: 'vesicula', logro: 'El Golgi la empacó en una <b>vesícula</b>, una burbuja de membrana.', pista: 'Son los sacos amarillos apilados.' },
            { busca: 'membrana', texto: 'Lleva la vesícula a la membrana para que salga.', lleva: null, pista: 'Nada hasta el borde de la célula.' }
          ],
          final: 'La vesícula se unió a la membrana y soltó la proteína afuera. Así salen de la célula sustancias como la insulina o la saliva.'
        },
        {
          titulo: 'Enzimas para un lisosoma',
          paradas: [
            { busca: 'nucleo', texto: 'Otra receta: recógela en el núcleo.', lleva: 'arnm', logro: 'Llevas otro <b>ARN mensajero</b>: esta vez, la receta de unas enzimas.', pista: 'El núcleo es la bola morada grande.' },
            { busca: ['ribosoma', 're'], texto: 'Ve a los ribosomas para que lean el mensaje.', lleva: 'cadena', logro: 'Lista la <b>cadena</b>.', pista: 'Puntitos morados, sueltos o pegados al retículo.' },
            { busca: 're', texto: 'Al retículo endoplasmático, para doblarla.', lleva: 'proteina', logro: 'La cadena se dobló: ya es una <b>enzima</b>.', pista: 'Pliegues azules junto al núcleo.' },
            { busca: 'golgi', texto: 'Al aparato de Golgi, para empacarla.', lleva: 'vesicula', logro: 'Enzima empacada en una <b>vesícula</b>.', pista: 'Sacos amarillos apilados.' },
            { busca: 'lisosoma', texto: 'Entrégala en un lisosoma.', lleva: null, pista: 'Los lisosomas son bolitas verdes.' }
          ],
          final: 'Las enzimas llegaron al lisosoma. Con ellas va a digerir lo que la célula ya no necesita.'
        }
      ],
      preguntas: [
        { texto: '¿Qué sale del núcleo hacia los ribosomas?', opciones: ['Un mensaje con la receta: el ARN mensajero', 'Una vesícula llena de agua', 'Glucosa'], correcta: 0, explica: 'El ARN mensajero es una copia de la receta que está en el ADN.' },
        { texto: '¿En qué orden viaja una proteína que sale de la célula?', opciones: ['Ribosoma → retículo → Golgi → membrana', 'Golgi → núcleo → ribosoma → membrana', 'Membrana → lisosoma → núcleo → Golgi'], correcta: 0, explica: 'Se arma en el ribosoma, se dobla en el retículo, se empaca en el Golgi y sale por la membrana.' },
        { texto: '¿Qué es una vesícula?', opciones: ['Una burbuja de membrana que transporta sustancias', 'Un pedazo de ADN', 'Una parte de la pared celular'], correcta: 0, explica: 'Las vesículas son burbujas que llevan sustancias de un sitio a otro.' }
      ]
    },
    {
      nombre: 'Célula vegetal',
      resumen: 'Lo que tienen las plantas y no los animales',
      celula: 'vegetal',
      etiquetas: true,
      intro: 'Ahora estás dentro de la hoja de una planta. La célula vegetal tiene casi todo lo de la animal y además tres partes propias. Descúbrelas.',
      misiones: [
        { busca: 'cloroplasto', texto: 'Ve al organelo que hace la fotosíntesis.', pista: 'Son óvalos verdes cerca del borde.' },
        { busca: 'vacuolaCentral', texto: 'Ve a la vacuola central, la bolsa de agua gigante.', pista: 'Es la burbuja azul enorme del medio.' },
        { busca: 'pared', texto: 'Toca la pared celular, la capa dura del borde.', pista: 'Nada hasta el borde verde.' },
        { busca: 'nucleo', texto: 'Busca el núcleo: aquí no está en el centro.', pista: 'La vacuola lo empujó hacia un lado.' },
        { busca: 'mitocondria', texto: 'Las plantas también gastan energía: ve a una mitocondria.', pista: 'Óvalos naranjas con rayas.' },
        { busca: 'golgi', texto: 'Ve al organelo que empaca las proteínas.', pista: 'Sacos amarillos apilados.' }
      ],
      preguntas: [
        { texto: '¿Qué tiene la célula vegetal que no tiene la animal?', opciones: ['Pared celular, cloroplastos y una vacuola grande', 'Núcleo y mitocondrias', 'Membrana y ribosomas'], correcta: 0, explica: 'Pared, cloroplastos y vacuola central: las tres partes propias de las plantas.' },
        { texto: '¿Por qué se marchita una planta que no riegas?', opciones: ['Su vacuola central pierde agua', 'Pierde los cloroplastos', 'Se le sale el núcleo'], correcta: 0, explica: 'Sin agua, la vacuola se encoge y deja de empujar contra la pared.' },
        { texto: '¿Las células vegetales tienen mitocondrias?', opciones: ['Sí, también necesitan energía', 'No, sólo tienen cloroplastos', 'Sólo de noche'], correcta: 0, explica: 'Los cloroplastos fabrican azúcar y las mitocondrias sacan la energía de ese azúcar.' }
      ]
    }
  ]
};
