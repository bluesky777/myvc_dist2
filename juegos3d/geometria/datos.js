/* Taller de fracciones y sólidos — contenido pedagógico.
   Un docente puede editar este objeto: el motor (juego.js) no tiene retos escritos dentro.
   En los textos, {pide}, {a}, {b} se cambian por la fracción dibujada y {solido} por el nombre del sólido. */
window.DATOS_GEOMETRIA = {
  titulo: 'Taller de fracciones y sólidos',
  grados: 'Matemáticas · 3.º a 8.º',
  frase: 'Corta pizzas, arma sólidos y llena cajas: aprende fracciones, figuras y volumen con tus manos.',
  como: 'Toca una mesa para entrar. Cada estación tiene retos que se ponen más difíciles. Gana hasta 3 estrellas en cada uno.',
  bien: ['¡Muy bien!', '¡Excelente!', '¡Así es!', '¡Lo lograste!'],

  nombres: {
    cubo: 'el cubo', prisma: 'el prisma rectangular', prisma3: 'el prisma triangular',
    piramide4: 'la pirámide cuadrada', piramide3: 'la pirámide triangular', cilindro: 'el cilindro'
  },
  partes: { caras: 'caras', aristas: 'aristas', vertices: 'vértices' },
  comidas: { pizza: 'pizza', torta: 'torta', chocolate: 'chocolatina' },

  estaciones: {
    fracciones: {
      nombre: 'Fracciones',
      como: 'Elige en cuántas partes iguales cortar y desliza el dedo hacia abajo sobre la comida (o toca Cortar). Después toca los pedazos para pasarlos al plato y toca Servir.',
      niveles: [
        { tipo: 'servir', forma: 'pizza', pide: [1, 2], texto: 'Corta la pizza en partes iguales y sirve {pide}.' },
        { tipo: 'servir', forma: 'pizza', pide: [1, 4], texto: 'Ahora sirve {pide} de pizza.' },
        { tipo: 'servir', forma: 'torta', pide: [3, 4], texto: 'Sirve {pide} de la torta.' },
        { tipo: 'servir', forma: 'chocolate', pide: [2, 5], texto: 'Sirve {pide} de la chocolatina.' },
        { tipo: 'servir', forma: 'pizza', pide: [1, 2], partes: 6, texto: 'Esta pizza ya viene en 6 pedazos. Sirve {pide}.' },
        { tipo: 'servir', forma: 'torta', pide: [2, 3], partes: 6, texto: 'La torta viene en 6 pedazos. Sirve {pide}.' },
        { tipo: 'comparar', forma: 'pizza', a: [2, 3], b: [3, 4], texto: '¿Qué plato tiene más pizza?' },
        { tipo: 'servir', forma: 'pizza', pide: [3, 4], partes: 8, texto: 'Sirve {pide} con pedazos de octavos.' },
        { tipo: 'comparar', forma: 'torta', a: [2, 4], b: [3, 6], texto: '¿Qué plato tiene más torta?' },
        { tipo: 'servir', forma: 'chocolate', pide: [2, 3], texto: 'Corta como quieras, pero sirve {pide}. Hay más de una forma.' },
        { tipo: 'comparar', forma: 'chocolate', a: [3, 5], b: [5, 8], texto: '¿Qué plato tiene más chocolatina?' }
      ]
    },

    solidos: {
      nombre: 'Sólidos',
      como: 'Arrastra para girar el sólido. Toca Desarmar para ver su red plana. Para contar, toca cada parte una vez: se pinta de amarillo.',
      niveles: [
        { tipo: 'contar', solido: 'cubo', que: 'caras', texto: 'Toca cada cara del cubo para contarla. Gíralo para ver las de atrás y la de abajo.' },
        { tipo: 'contar', solido: 'cubo', que: 'vertices', texto: 'Los vértices son las esquinas. Toca cada vértice del cubo.' },
        { tipo: 'red', solido: 'cubo', opciones: [{ solido: 'piramide4' }, { solido: 'cubo' }, { solido: 'prisma3' }], texto: '¿Qué red plana arma este cubo?' },
        { tipo: 'contar', solido: 'prisma3', que: 'caras', texto: 'Cuenta las caras del prisma triangular.' },
        { tipo: 'red', solido: 'piramide4', opciones: [{ solido: 'prisma' }, { solido: 'piramide3' }, { solido: 'piramide4' }], texto: '¿Qué red arma esta pirámide?' },
        { tipo: 'contar', solido: 'piramide4', que: 'aristas', texto: 'Las aristas son los bordes. Toca cada arista de la pirámide.' },
        { tipo: 'red', solido: 'cubo', opciones: [{ solido: 'cubo', red: ['####', '##..'] }, { solido: 'cubo', red: ['.#..', '####', '..#.'] }, { solido: 'cubo', red: ['###', '###'] }], texto: 'Las tres redes tienen 6 cuadrados. ¿Cuál sí arma el cubo?' },
        { tipo: 'red', solido: 'cilindro', opciones: [{ solido: 'prisma3' }, { solido: 'cilindro' }, { solido: 'piramide3' }], texto: '¿Qué red arma este cilindro?' },
        { tipo: 'contar', solido: 'prisma', que: 'aristas', texto: 'Cuenta las aristas del prisma rectangular.' },
        { tipo: 'red', solido: 'cubo', opciones: [{ solido: 'cubo', red: ['##..', '.##.', '..##'] }, { solido: 'cubo', red: ['####', '#..#'] }, { solido: 'cubo', red: ['#####', '..#..'] }], texto: 'Difícil: ¿cuál de estas redes arma el cubo?' },
        { tipo: 'contar', solido: 'piramide3', que: 'vertices', texto: 'Toca los vértices de la pirámide triangular.' },
        { tipo: 'contar', solido: 'prisma3', que: 'aristas', texto: 'Último reto: cuenta las aristas del prisma triangular.' }
      ]
    },

    volumen: {
      nombre: 'Volumen',
      como: 'Toca el piso de la caja para poner cubitos, o usa los botones para poner una fila o una capa entera. El volumen es cuántos cubitos caben.',
      niveles: [
        { tipo: 'llenar', caja: [3, 2, 1] },
        { tipo: 'llenar', caja: [3, 2, 2] },
        { tipo: 'llenar', caja: [4, 3, 2] },
        { tipo: 'predecir', caja: [2, 2, 3] },
        { tipo: 'predecir', caja: [4, 2, 3] },
        { tipo: 'altura', base: [4, 3], volumen: 24 },
        { tipo: 'llenar', caja: [5, 3, 3] },
        { tipo: 'predecir', caja: [5, 4, 3] },
        { tipo: 'altura', base: [3, 3], volumen: 36 },
        { tipo: 'predecir', caja: [6, 3, 4] }
      ],
      textos: {
        llenar: 'Llena la caja con cubitos. Mira cuántos van en una fila y en una capa.',
        preguntaLlenar: '¿Cuántos cubitos caben en la caja?',
        predecir: 'Sin llenarla: ¿cuántos cubitos caben en esta caja? Mira el largo, el ancho y el alto.',
        altura: 'Esta caja debe guardar {v} cubitos. Su piso es de {l} × {w}. ¿Qué tan alta tiene que ser?'
      }
    }
  }
};
