/* Laboratorio de ciencias — contenido pedagógico.
   Un docente puede cambiar textos, retos y preguntas sin tocar juego.js.
   En app2 este objeto vendrá de la API. */
window.DATOS_LABORATORIO = {
  titulo: 'Laboratorio de ciencias',
  frase: 'Arma un circuito, explora el sistema solar y mezcla sustancias como en un laboratorio de verdad.',
  comoSeJuega: 'Arrastra la mesa para girarla y pellizca (o usa la rueda) para acercarte. Toca un experimento para entrar.',

  experimentos: [
    {
      id: 'circuito',
      nombre: 'Circuito eléctrico',
      icono: '💡',
      aprende: 'La corriente sólo pasa si el camino está cerrado.',
      como: 'Arrastra cada pieza a su ranura. También puedes tocar la pieza y después la ranura.',
      piezas: {
        pila: { nombre: 'Pila', pista: 'La pila da la energía. Busca la ranura que dice «Pila».' },
        cable: { nombre: 'Cable', pista: 'Los cables unen las piezas. Van en las ranuras que dicen «Cable».' },
        bombillo: { nombre: 'Bombillo', pista: 'El bombillo va en la ranura de la derecha.' },
        interruptor: { nombre: 'Interruptor', pista: 'El interruptor abre y cierra el camino. Va abajo.' }
      },
      pasos: [
        { tipo: 'armar', texto: 'Arma el circuito: pon la pila, los dos cables, el bombillo y el interruptor.' },
        { tipo: 'encender', texto: 'Toca el interruptor para cerrar el camino. ¿Prende el bombillo?' },
        { tipo: 'apagar', texto: 'Ahora apaga el bombillo sin quitar ninguna pieza.' },
        { tipo: 'quitar', texto: 'Préndelo otra vez y después saca un cable de su ranura. Mira qué pasa.' }
      ],
      preguntas: [
        {
          texto: 'Con el interruptor levantado, el circuito está…',
          opciones: ['Abierto', 'Cerrado'],
          correcta: 0,
          explica: 'Si el interruptor está levantado, el camino tiene un hueco: el circuito está abierto y la corriente no pasa.'
        },
        {
          texto: 'La pila, los cables, el bombillo y el interruptor van uno detrás de otro, en un solo camino. Ese circuito es…',
          opciones: ['En serie', 'En paralelo', 'Sin camino'],
          correcta: 0,
          explica: 'Cuando todo va en un solo camino, uno tras otro, el circuito está en serie.'
        },
        {
          texto: '¿Por qué se apagó el bombillo cuando sacaste el cable?',
          opciones: ['Se rompió el camino de la corriente', 'La pila se gastó', 'El bombillo se dañó'],
          correcta: 0,
          explica: 'Sin el cable el circuito queda abierto: la corriente ya no puede dar la vuelta completa.'
        }
      ]
    },

    {
      id: 'solar',
      nombre: 'Sistema solar',
      icono: '🪐',
      aprende: 'Los ocho planetas, su orden y en qué se diferencian.',
      como: 'Gira la mesa para ver los planetas desde otro lado. Toca el planeta que te piden.',
      planetas: [
        { id: 'mercurio', nombre: 'Mercurio', color: '#a9a39b', tam: 0.07, dato: 'Es el más pequeño y el más cercano al Sol.' },
        { id: 'venus', nombre: 'Venus', color: '#e8c27a', tam: 0.11, dato: 'Es el planeta más caliente: sus nubes atrapan el calor.' },
        { id: 'tierra', nombre: 'Tierra', color: '#2f7fd8', tam: 0.12, dato: 'Es el único planeta que conocemos con vida.' },
        { id: 'marte', nombre: 'Marte', color: '#d4573a', tam: 0.09, dato: 'Lo llaman el planeta rojo por el óxido de su suelo.' },
        { id: 'jupiter', nombre: 'Júpiter', color: '#d9a46c', tam: 0.27, dato: 'Es el más grande: cabrían más de mil Tierras adentro.' },
        { id: 'saturno', nombre: 'Saturno', color: '#e9cf8f', tam: 0.22, anillo: true, dato: 'Sus anillos son de hielo y roca.' },
        { id: 'urano', nombre: 'Urano', color: '#8fd6dc', tam: 0.16, dato: 'Gira acostado, como una pelota que rueda.' },
        { id: 'neptuno', nombre: 'Neptuno', color: '#3f63d8', tam: 0.155, dato: 'Es el más lejano y tiene los vientos más fuertes.' }
      ],
      retos: [
        { pide: 'Toca el planeta donde vivimos.', id: 'tierra' },
        { pide: 'Toca el planeta más cercano al Sol.', id: 'mercurio' },
        { pide: 'Toca el planeta más grande de todos.', id: 'jupiter' },
        { pide: 'Toca el planeta rojo.', id: 'marte' },
        { pide: 'Toca el planeta con los anillos más famosos.', id: 'saturno' },
        { tipo: 'orden', pide: 'Último reto: toca los ocho planetas en orden, desde el más cercano al Sol.' }
      ]
    },

    {
      id: 'mezclas',
      nombre: 'Mezclas',
      icono: '🧪',
      aprende: 'Hay sustancias que se mezclan, otras que no, y otras que reaccionan.',
      como: 'Arrastra un frasco hasta el vaso (o tócalo) para verterlo. Antes de mezclar, di qué crees que pasará.',
      sustancias: {
        agua: { nombre: 'Agua', color: '#7fd3ee', tipo: 'liquido' },
        aceite: { nombre: 'Aceite', color: '#f2be2e', tipo: 'liquido' },
        sal: { nombre: 'Sal', color: '#ffffff', tipo: 'solido' },
        vinagre: { nombre: 'Vinagre', color: '#efe6c4', tipo: 'liquido' },
        bicarbonato: { nombre: 'Bicarbonato', color: '#f4f1ea', tipo: 'solido' }
      },
      retos: [
        {
          primero: 'agua', segundo: 'aceite', resultado: 'capas',
          pregunta: 'Vas a echar aceite en el agua. ¿Qué crees que pasará?',
          opciones: ['Se forman dos capas: el aceite queda arriba', 'Se mezclan y todo queda amarillo', 'Salen muchas burbujas'],
          correcta: 0,
          explica: 'El aceite no se mezcla con el agua y es más liviano, por eso flota encima. Es una mezcla heterogénea: ves las dos partes.'
        },
        {
          primero: 'agua', segundo: 'sal', resultado: 'disolucion',
          pregunta: 'Vas a echar sal en el agua. ¿Qué crees que pasará?',
          opciones: ['La sal se queda flotando arriba', 'La sal se disuelve y ya no se ve', 'El agua se pone blanca para siempre'],
          correcta: 1,
          explica: 'La sal se disuelve: sigue ahí, pero en pedacitos tan pequeños que no se ven. Es una mezcla homogénea: se ve de un solo color.'
        },
        {
          primero: 'vinagre', segundo: 'bicarbonato', resultado: 'burbujas',
          pregunta: 'Vas a echar bicarbonato en el vinagre. ¿Qué crees que pasará?',
          opciones: ['No pasa nada', 'Se forman dos capas', 'Sale mucha espuma con burbujas'],
          correcta: 2,
          explica: 'Hay una reacción química: se forma un gas nuevo, el dióxido de carbono, que sale en burbujas.'
        }
      ]
    }
  ],

  final: {
    titulo: '¡Laboratorio completo!',
    texto: 'Armaste un circuito, recorriste el sistema solar y descubriste cómo se portan las mezclas.'
  }
};
