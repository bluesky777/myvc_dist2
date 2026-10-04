/* Carrera del curso — contenido pedagógico. Un docente puede editar este objeto; en app2 vendrá de la API.
   - rivales: los compañeros simulados (en app2 serán los del grupo en tiempo real).
   - tablas: qué tablas se ofrecen y hasta qué factor llegan.
   - lecturas: textos cortos con preguntas de opción múltiple; "correcta" es la posición (desde 0). */
window.DATOS_CARRERA = {
  titulo: 'Carrera del curso',
  frase: 'Responde bien y tu corredor acelera. Practica las tablas o la lectura mientras compites con tu curso.',
  comoSeJuega: 'Contesta las preguntas de abajo. Cada respuesta buena te da turbo; si fallas, frenas un poquito. ¡Llega primero a la meta!',

  vueltas: { tablas: 2, lectura: 2 },

  rivales: [
    { id: 'r1', nombre: 'Valentina Ríos', iniciales: 'VR', animal: 'gato' },
    { id: 'r2', nombre: 'Santiago Gómez', iniciales: 'SG', animal: 'oso' },
    { id: 'r3', nombre: 'Mariana López', iniciales: 'ML', animal: 'conejo' },
    { id: 'r4', nombre: 'Samuel Torres', iniciales: 'ST', animal: 'perro' },
    { id: 'r5', nombre: 'Isabella Castro', iniciales: 'IC', animal: 'rana' }
  ],

  tablas: {
    disponibles: [2, 3, 4, 5, 6, 7, 8, 9, 10],
    factorMax: 10,
    // De vez en cuando la pregunta es al revés: 6 × ? = 42
    proporcionInversa: 0.25
  },

  lecturas: [
    {
      id: 'tortuga',
      grado: '2.º y 3.º',
      titulo: 'La tortuga Lola',
      texto: 'Lola es una tortuga que vive cerca de un río en el Huila. Todas las mañanas sale a buscar hojas de lechuga en la huerta de doña Carmen. Un día llovió muy fuerte y el río creció. Lola no se asustó: se escondió en su caparazón y esperó debajo de un árbol de mango. Cuando salió el sol, sus amigos los patos la invitaron a nadar. Lola nadó despacio, pero llegó feliz a la otra orilla.',
      preguntas: [
        { p: '¿Qué animal es Lola?', o: ['Un pato', 'Una tortuga', 'Una rana'], correcta: 1 },
        { p: '¿Dónde vive Lola?', o: ['Cerca de un río', 'En el mar', 'En una ciudad'], correcta: 0 },
        { p: '¿Qué busca Lola en la huerta?', o: ['Mangos', 'Flores', 'Hojas de lechuga'], correcta: 2 },
        { p: '¿Qué pasó el día de la lluvia fuerte?', o: ['El río creció', 'Se secó la huerta', 'Llegó la noche'], correcta: 0 },
        { p: '¿Dónde esperó Lola?', o: ['En la casa de doña Carmen', 'Debajo de un árbol de mango', 'Dentro del río'], correcta: 1 },
        { p: '¿Quiénes la invitaron a nadar?', o: ['Los peces', 'Doña Carmen', 'Los patos'], correcta: 2 },
        { p: '¿Cómo se sintió Lola al final?', o: ['Feliz', 'Asustada', 'Brava'], correcta: 0 },
        { p: '¿Cómo nadó Lola?', o: ['Muy rápido', 'Despacio', 'No nadó'], correcta: 1 }
      ]
    },
    {
      id: 'cometa',
      grado: '4.º y 5.º',
      titulo: 'La cometa de Tomás',
      texto: 'En agosto, cuando sopla más el viento, Tomás y su abuela fabricaron una cometa con papel seda, palos de bambú y un rollo de pita. La pintaron de amarillo, azul y rojo, como la bandera. El sábado subieron a la loma del barrio. La primera vez la cometa dio vueltas y cayó, porque la cola era muy corta. La abuela le amarró unas tiras de tela y la cometa subió tan alto que parecía un punto en el cielo. Tomás aprendió que a veces hay que intentar de nuevo con un pequeño cambio.',
      preguntas: [
        { p: '¿En qué mes elevaron la cometa?', o: ['En diciembre', 'En agosto', 'En marzo', 'En junio'], correcta: 1 },
        { p: '¿Con quién hizo Tomás la cometa?', o: ['Con su papá', 'Con su profesora', 'Con su abuela', 'Solo'], correcta: 2 },
        { p: '¿Por qué se cayó la cometa la primera vez?', o: ['No había viento', 'La cola era muy corta', 'Se rompió la pita', 'Empezó a llover'], correcta: 1 },
        { p: '¿Qué le agregó la abuela?', o: ['Tiras de tela', 'Más papel', 'Pegante', 'Otro palo'], correcta: 0 },
        { p: '¿Por qué la pintaron de esos colores?', o: ['Eran los únicos', 'Para que se viera de noche', 'Como la bandera', 'Le gustaban a Tomás'], correcta: 2 },
        { p: '«Parecía un punto en el cielo» quiere decir que…', o: ['Estaba muy alta', 'Se perdió', 'Era muy pequeña', 'Estaba rota'], correcta: 0 },
        { p: '¿Qué aprendió Tomás?', o: ['Que el viento es peligroso', 'A intentar de nuevo con un cambio', 'A pintar banderas', 'Que el bambú es pesado'], correcta: 1 },
        { p: '¿Dónde elevaron la cometa?', o: ['En la playa', 'En el colegio', 'En el parque', 'En la loma del barrio'], correcta: 3 }
      ]
    },
    {
      id: 'colibri',
      grado: '6.º y 7.º',
      titulo: 'El colibrí y su corazón',
      texto: 'Colombia es el país con más especies de colibríes en el mundo. Estas aves pesan menos que una moneda y baten las alas hasta ochenta veces por segundo, lo que les permite quedarse quietas en el aire. Para mantener tanta energía, visitan cientos de flores al día y beben su néctar. Mientras se alimentan, llevan polen de una flor a otra y así ayudan a que nazcan nuevas plantas. En las noches frías de la montaña, el colibrí baja la temperatura de su cuerpo y casi se detiene su corazón: es un sueño profundo que le ahorra energía hasta el amanecer.',
      preguntas: [
        { p: '¿Cuál es la idea principal del texto?', o: ['Cómo viven y ayudan los colibríes', 'Las flores de la montaña', 'Las monedas de Colombia', 'El clima de las noches'], correcta: 0 },
        { p: '¿Por qué el colibrí puede quedarse quieto en el aire?', o: ['Porque pesa mucho', 'Porque bate las alas muy rápido', 'Porque duerme', 'Porque bebe néctar'], correcta: 1 },
        { p: '¿Para qué visita cientos de flores?', o: ['Para jugar', 'Para hacer su nido', 'Para mantener su energía', 'Para esconderse'], correcta: 2 },
        { p: '¿Cómo ayuda el colibrí a las plantas?', o: ['Las riega', 'Se come las plagas', 'Lleva polen de flor en flor', 'Les da sombra'], correcta: 2 },
        { p: '¿Qué hace el colibrí en las noches frías?', o: ['Vuela más rápido', 'Baja su temperatura y ahorra energía', 'Busca flores', 'Viaja a la costa'], correcta: 1 },
        { p: 'En el texto, «néctar» es…', o: ['Un líquido dulce de las flores', 'Una semilla', 'Un tipo de pluma', 'Una hoja'], correcta: 0 },
        { p: '¿Qué compara el texto con el peso del colibrí?', o: ['Una pluma', 'Una hoja', 'Una moneda', 'Una flor'], correcta: 2 },
        { p: '¿Qué podemos concluir?', o: ['El colibrí no es importante', 'Cuidar los colibríes ayuda a las plantas', 'Los colibríes solo viven en la costa', 'El colibrí no duerme'], correcta: 1 }
      ]
    }
  ],

  // Ritmo de los rivales simulados: cada cuántos segundos "responden" y qué tan seguido aciertan.
  simulacion: {
    tablas: { cada: [3.6, 7.5], acierto: [0.55, 0.85] },
    lectura: { cada: [6, 11], acierto: [0.55, 0.85] }
  },

  mensajes: {
    bien: ['¡Turbo!', '¡Muy bien!', '¡Eso es!', '¡Volando!', '¡Correcto!'],
    mal: ['Casi. Era', 'Ups, era', 'La buena era'],
    racha: '¡Racha de 3! Súper turbo'
  }
};
