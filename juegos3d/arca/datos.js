/* Two by Two — lo pedagógico (lo que un docente podría editar y que después vendrá de la API).
   El motor (juego.js) no tiene preguntas escritas dentro: las arma preguntas.js con estas tablas.
   TODO el inglés que dice el juego sale de aquí; FRASES.txt es la lista para grabar sus MP3
   (se regenera con PreguntasArca.frases(DATOS_ARCA), ver la cabecera de preguntas.js). */
window.DATOS_ARCA = {
  titulo: 'Two by Two',
  frase: 'Ayuda a Noé: encuentra los animales de dos en dos, responde en inglés y llévalos al arca antes de la lluvia.',
  como: 'Camina con WASD o las flechas y mira arrastrando el ratón. Acércate a un animal y pulsa E o tócalo. V cambia la cámara.',
  comoTactil: 'Camina con la palanca y mira arrastrando el dedo. Acércate a un animal y tócalo.',

  /* Cuántas parejas hay en una partida: 6 parejas = «Animals: n / 12». */
  parejas: 6,

  /* Grados: Transición–1.º nombrar; 2.º–3.º can/can't y contar patas; 4.º–5.º pasado sencillo.
     También se puede abrir con ?grado=0..5 (0 = Transición). */
  grados: [
    { id: 0, nombre: 'Transición', corto: 'T', banda: 'nombrar' },
    { id: 1, nombre: '1.º', corto: '1.º', banda: 'nombrar' },
    { id: 2, nombre: '2.º', corto: '2.º', banda: 'can' },
    { id: 3, nombre: '3.º', corto: '3.º', banda: 'can' },
    { id: 4, nombre: '4.º', corto: '4.º', banda: 'pasado' },
    { id: 5, nombre: '5.º', corto: '5.º', banda: 'pasado' }
  ],
  bandas: {
    nombrar: { etiqueta: 'Nombra el animal', tipos: ['nombre'] },
    can: { etiqueta: 'Can / can’t · patas', tipos: ['patas', 'vuela'] },
    pasado: { etiqueta: 'Pasado sencillo', tipos: ['comio', 'dijo'] }
  },

  vozNoe: ['bienvenida', 'encargo', 'encargoPar', 'ahora', 'otro', 'llevar', 'entra', 'deDos', 'gracias', 'puerta', 'lluvia', 'arcoiris', 'todos', 'final'],

  /* Las preguntas. {x} es la palabra que cambia; las pistas van en español corto. */
  preguntas: {
    nombre: { q: 'What is it?', op: '{x}', pista: 'Pista: empieza por «{inicial}».' },
    patas: { q: 'How many legs?', ops: { 2: 'Two.', 4: 'Four.', 6: 'Six.' }, pista: 'Pista: cuenta sus patas. Two = 2, four = 4, six = 6.' },
    vuela: { q: 'Can it fly?', si: 'Yes, it can.', no: 'No, it can’t.', otra: 'Yes, it is.', pista: 'Pista: «can» es «puede» y «can’t» es «no puede». ¿{art} {es} vuela?' },
    comio: { q: 'What did it eat?', op: 'It ate {x}.', pista: 'Pista: «ate» es «comió». ¿Qué come {art_min} {es}?' },
    dijo: { q: 'What did it say?', op: 'It said {x}.', pista: 'Pista: «said» es «dijo». ¿Cómo hace {art_min} {es}?' }
  },

  /* El inglés del juego. {plural} = «cows», {en} = «cow». Las de `vozNoe` las dice Noé (voz de hombre mayor: se buscan
     primero en voz/en-noe/ y van en FRASES-NOE.txt); `bien` y `otraVez` son de las preguntas (FRASES.txt). */
  frases: {
    encargo: 'Find two {plural}!',
    encargoPar: 'Find {parejaEn}!',
    bien: 'Great job!',
    otraVez: 'Try again!',
    llevar: 'Take them to the ark!',
    entra: 'Into the ark!',
    otro: 'One more {en}!',
    ahora: 'Now find the {en}!',
    deDos: 'Two by two!',
    gracias: 'Thank you!',
    bienvenida: 'Hello! I am Noah. Help me, please!',
    puerta: 'The door is closed.',
    lluvia: 'It’s raining!',
    arcoiris: 'Look! A rainbow!',
    todos: 'All the animals are in the ark!',
    final: 'Well done!'
  },

  /* El objetivo de arriba, en español corto (el inglés va al lado, de `frases`). Cambia con cada paso:
     buscar → otro (ya lo sigue uno) → llevar (al aro de la rampa) → suben → entraron → buscar la pareja siguiente.
     {parejaEs} = «2 vacas» o «el toro y la vaca»; {falta} = «la otra vaca» o «la vaca»; {losDos} = «las dos vacas» o
     «el toro y la vaca». */
  objetivos: {
    buscar: 'Busca {parejaEs}',
    otro: '¡Bien! Ahora busca {falta}',
    llevar: 'Lleva {losDos} al aro de la rampa',
    suben: '¡Mira cómo suben al arca!',
    entraron: '¡Entraron! Animals {n}/{total}',
    falta: 'Falta {falta}: los animales entran de dos en dos.',
    primero: 'Primero busca {parejaEs}.',
    todos: '¡Todos están en el arca!'
  },

  /* LOS ANIMALES: todos los de cuatro patas y las aves del manifiesto entran al mundo en parejas (los que aún no tengan
     modelo se ignoran; los seis primeros tienen respaldo de cajitas). Los encargos salen de `parejas` de ellos.
     modelos: los del manifiesto que forman la pareja. Con dos (macho y hembra: el toro y la vaca) la pareja es mixta y
     cada uno tiene su nombre (`en`, `es` con artículo); si sólo existe uno, sale dos veces. Sin `modelos`, la clave.
     Cada `ids` admite varios nombres posibles en el manifiesto (o su `nombre` sin tildes, «oso-de-anteojos»).
     patas: null = no se pregunta (el mono, el perezoso: ¿patas o brazos?); vuela: null = no se pregunta (la gallina y
     el pavo real vuelan un poquito); come: null = no se pregunta (el cerdo come de todo); dice: null = sin sonido que un
     niño sepa en inglés. noCome: comidas que seguro NO son la respuesta. zona: dónde vive en la pradera (charca, lejos…).
     respaldo: el animal de cajitas si el GLB no carga (forma: cuadrupedo | ave | rana). agua: sólo nada en el lago. */
  especies: {
    vaca:     { en: 'cow', plural: 'cows', es: 'vaca', esPl: 'vacas', art: 'La', patas: 4, vuela: false, come: 'grass', noCome: ['fish', 'bones', 'flies', 'meat'], dice: 'moo', zona: 'pradera', respaldo: { forma: 'cuadrupedo', color: '#f4efe4', mancha: '#3a2c25', alto: 1.5 },
      modelos: [{ ids: ['toro'], en: 'bull', es: 'el toro' }, { ids: ['vaca'], en: 'cow', es: 'la vaca' }], parejaEn: 'a bull and a cow', parejaEs: 'el toro y la vaca' },
    perro:    { en: 'dog', plural: 'dogs', es: 'perro', esPl: 'perros', art: 'El', patas: 4, vuela: false, come: 'bones', noCome: ['flies', 'hay', 'leaves'], dice: 'woof', zona: 'camino', respaldo: { forma: 'cuadrupedo', color: '#b9824c', alto: 0.75 } },
    gato:     { en: 'cat', plural: 'cats', es: 'gato', esPl: 'gatos', art: 'El', patas: 4, vuela: false, come: 'fish', noCome: ['hay', 'leaves', 'corn'], dice: 'meow', zona: 'camino', respaldo: { forma: 'cuadrupedo', color: '#e9a24b', alto: 0.55 } },
    gallina:  { en: 'hen', plural: 'hens', es: 'gallina', esPl: 'gallinas', art: 'La', patas: 2, vuela: null, come: 'corn', noCome: ['bones', 'hay'], dice: 'cluck', zona: 'pradera', respaldo: { forma: 'ave', color: '#f5f1e8', mancha: '#d8322b', alto: 0.6 },
      modelos: [{ ids: ['gallo'], en: 'rooster', es: 'el gallo' }, { ids: ['gallina'], en: 'hen', es: 'la gallina' }], parejaEn: 'a rooster and a hen', parejaEs: 'el gallo y la gallina' },
    pollito:  { en: 'chick', plural: 'chicks', es: 'pollito', esPl: 'pollitos', art: 'El', patas: 2, vuela: false, come: 'seeds', noCome: ['bones', 'hay', 'meat'], dice: 'peep', zona: 'pradera', respaldo: { forma: 'ave', color: '#ffd84a', mancha: '#f08a1c', alto: 0.32 } },
    rana:     { en: 'frog', plural: 'frogs', es: 'rana', esPl: 'ranas', art: 'La', patas: 4, vuela: false, come: 'flies', noCome: ['grass', 'hay', 'bones', 'corn'], dice: 'ribbit', zona: 'charca', respaldo: { forma: 'rana', color: '#4cae4c', alto: 0.4 } },
    leon:     { en: 'lion', plural: 'lions', es: 'león', esPl: 'leones', art: 'El', patas: 4, vuela: false, come: 'meat', noCome: ['grass', 'hay', 'leaves'], dice: 'roar', zona: 'lejos',
      modelos: [{ ids: ['leon'], en: 'lion', es: 'el león' }, { ids: ['leona'], en: 'lioness', es: 'la leona' }], parejaEn: 'a lion and a lioness', parejaEs: 'el león y la leona' },
    tigre:    { en: 'tiger', plural: 'tigers', es: 'tigre', esPl: 'tigres', art: 'El', patas: 4, vuela: false, come: 'meat', noCome: ['grass', 'hay', 'leaves'], dice: 'roar', zona: 'lejos' },
    jaguar:   { en: 'jaguar', plural: 'jaguars', es: 'jaguar', esPl: 'jaguares', art: 'El', patas: 4, vuela: false, come: 'meat', noCome: ['grass', 'hay', 'leaves'], dice: null, zona: 'arboles' },
    elefante: { en: 'elephant', plural: 'elephants', es: 'elefante', esPl: 'elefantes', art: 'El', patas: 4, vuela: false, come: 'leaves', noCome: ['meat', 'fish', 'bones'], dice: null, zona: 'lejos' },
    jirafa:   { en: 'giraffe', plural: 'giraffes', es: 'jirafa', esPl: 'jirafas', art: 'La', patas: 4, vuela: false, come: 'leaves', noCome: ['meat', 'fish', 'bones'], dice: null, zona: 'lejos' },
    cebra:    { en: 'zebra', plural: 'zebras', es: 'cebra', esPl: 'cebras', art: 'La', patas: 4, vuela: false, come: 'grass', noCome: ['meat', 'fish', 'bones'], dice: null, zona: 'lejos' },
    hipopotamo: { en: 'hippo', plural: 'hippos', es: 'hipopótamo', esPl: 'hipopótamos', art: 'El', patas: 4, vuela: false, come: 'grass', noCome: ['meat', 'fish', 'bones'], dice: null, zona: 'charca', modelos: [{ ids: ['hipopotamo', 'hipo'] }] },
    cocodrilo: { en: 'crocodile', plural: 'crocodiles', es: 'cocodrilo', esPl: 'cocodrilos', art: 'El', patas: 4, vuela: false, come: 'fish', noCome: ['grass', 'hay', 'leaves'], dice: null, zona: 'charca' },
    oveja:    { en: 'sheep', plural: 'sheep', es: 'oveja', esPl: 'ovejas', art: 'La', patas: 4, vuela: false, come: 'grass', noCome: ['meat', 'fish', 'bones'], dice: 'baa', zona: 'pradera',
      modelos: [{ ids: ['carnero'], en: 'ram', es: 'el carnero' }, { ids: ['oveja'], en: 'sheep', es: 'la oveja' }], parejaEn: 'a ram and a sheep', parejaEs: 'el carnero y la oveja' },
    cabra:    { en: 'goat', plural: 'goats', es: 'cabra', esPl: 'cabras', art: 'La', patas: 4, vuela: false, come: 'grass', noCome: ['meat', 'fish', 'bones'], dice: null, zona: 'pradera',
      modelos: [{ ids: ['chivo'], es: 'el chivo' }, { ids: ['cabra'], es: 'la cabra' }], parejaEs: 'el chivo y la cabra' },
    caballo:  { en: 'horse', plural: 'horses', es: 'caballo', esPl: 'caballos', art: 'El', patas: 4, vuela: false, come: 'hay', noCome: ['meat', 'fish', 'bones'], dice: 'neigh', zona: 'pradera', modelos: [{ ids: ['caballo'] }, { ids: ['yegua'], es: 'la yegua' }], parejaEs: 'el caballo y la yegua' },
    burro:    { en: 'donkey', plural: 'donkeys', es: 'burro', esPl: 'burros', art: 'El', patas: 4, vuela: false, come: 'hay', noCome: ['meat', 'fish', 'bones'], dice: 'hee-haw', zona: 'camino' },
    cerdo:    { en: 'pig', plural: 'pigs', es: 'cerdo', esPl: 'cerdos', art: 'El', patas: 4, vuela: false, come: null, noCome: [], dice: 'oink', zona: 'camino', modelos: [{ ids: ['cerdo', 'marrano', 'cerdito'] }] },
    conejo:   { en: 'rabbit', plural: 'rabbits', es: 'conejo', esPl: 'conejos', art: 'El', patas: 4, vuela: false, come: 'carrots', noCome: ['meat', 'fish', 'bones'], dice: null, zona: 'camino' },
    venado:   { en: 'deer', plural: 'deer', es: 'venado', esPl: 'venados', art: 'El', patas: 4, vuela: false, come: 'leaves', noCome: ['meat', 'fish', 'bones'], dice: null, zona: 'arboles', modelos: [{ ids: ['venado', 'ciervo'] }, { ids: ['venada', 'cierva'], es: 'la venada' }], parejaEs: 'el venado y la venada' },
    oso:      { en: 'bear', plural: 'bears', es: 'oso de anteojos', esPl: 'osos de anteojos', art: 'El', patas: 4, vuela: false, come: null, noCome: [], dice: null, zona: 'arboles', modelos: [{ ids: ['oso-de-anteojos', 'oso-anteojos', 'oso'] }] },
    mono:     { en: 'monkey', plural: 'monkeys', es: 'mono', esPl: 'monos', art: 'El', patas: null, vuela: false, come: 'bananas', noCome: ['hay', 'bones', 'grass'], dice: null, zona: 'arboles' },
    perezoso: { en: 'sloth', plural: 'sloths', es: 'perezoso', esPl: 'perezosos', art: 'El', patas: null, vuela: false, come: 'leaves', noCome: ['meat', 'fish', 'bones'], dice: null, zona: 'arboles' },
    pato:     { en: 'duck', plural: 'ducks', es: 'pato', esPl: 'patos', art: 'El', patas: 2, vuela: true, come: null, noCome: [], dice: 'quack', zona: 'charca', modelos: [{ ids: ['pato'] }, { ids: ['pata'], es: 'la pata' }], parejaEs: 'el pato y la pata' },
    pavo:     { en: 'peacock', plural: 'peacocks', es: 'pavo real', esPl: 'pavos reales', art: 'El', patas: 2, vuela: null, come: 'seeds', noCome: ['meat', 'fish', 'bones'], dice: null, zona: 'pradera',
      modelos: [{ ids: ['pavo-real', 'pavorreal', 'pavo'], en: 'peacock', es: 'el pavo real' }, { ids: ['pava', 'pava-real', 'pavo-real-hembra'], en: 'peahen', es: 'la pava real' }], parejaEn: 'a peacock and a peahen', parejaEs: 'el pavo real y la pava' },
    avestruz: { en: 'ostrich', plural: 'ostriches', es: 'avestruz', esPl: 'avestruces', art: 'El', patas: 2, vuela: false, come: 'grass', noCome: ['meat', 'fish', 'bones'], dice: null, zona: 'lejos',
      modelos: [{ ids: ['avestruz-macho', 'avestruz'], es: 'el avestruz macho' }, { ids: ['avestruz-hembra'], es: 'la avestruz hembra' }], parejaEs: 'el avestruz macho y la hembra' },
    paloma:   { en: 'dove', plural: 'doves', es: 'paloma', esPl: 'palomas', art: 'La', patas: 2, vuela: true, come: 'seeds', noCome: ['meat', 'fish', 'bones', 'hay'], dice: 'coo', zona: 'camino' },
    cuervo:   { en: 'raven', plural: 'ravens', es: 'cuervo', esPl: 'cuervos', art: 'El', patas: 2, vuela: true, come: 'worms', noCome: ['hay', 'grass'], dice: 'caw', zona: 'arboles' },
    buho:     { en: 'owl', plural: 'owls', es: 'búho', esPl: 'búhos', art: 'El', patas: 2, vuela: true, come: null, noCome: [], dice: 'hoot', zona: 'arboles' },
    condor:   { en: 'condor', plural: 'condors', es: 'cóndor', esPl: 'cóndores', art: 'El', patas: 2, vuela: true, come: 'meat', noCome: ['grass', 'hay', 'seeds'], dice: null, zona: 'lejos' },
    guacamaya: { en: 'macaw', plural: 'macaws', es: 'guacamaya', esPl: 'guacamayas', art: 'La', patas: 2, vuela: true, come: 'seeds', noCome: ['meat', 'fish', 'bones'], dice: null, zona: 'arboles' },
    tucan:    { en: 'toucan', plural: 'toucans', es: 'tucán', esPl: 'tucanes', art: 'El', patas: 2, vuela: true, come: null, noCome: [], dice: null, zona: 'arboles' },
    /* sólo en el agua: nada en el lago (no entra a los encargos) */
    delfin:   { en: 'dolphin', plural: 'dolphins', es: 'delfín rosado', esPl: 'delfines rosados', art: 'El', agua: true, modelos: [{ ids: ['delfin-rosado', 'delfin', 'bufeo'] }] }
  },

  /* Noé: si `noe` está en el manifiesto se usa su GLB (con idle/talk/wave); si no, un cartel junto a la rampa. */
  noe: { modelo: 'noe', cartel: 'NOAH' }
};
