/*
  SALA DE ESCAPE — contenido que pone el docente.

  El motor no trae preguntas: todo sale de aquí. Formato:

  window.DATOS_ESCAPE = {
    salas: [ {
      id:         'texto-sin-espacios',        // clave para guardar el récord
      titulo:     'Nombre de la sala',
      asignatura: 'Matemáticas',
      grado:      '6.º',
      intro:      'Una o dos frases de historia al entrar.',
      tiempoObjetivo: 420,                      // segundos; terminar antes da un bono (el reloj no corta nada)
      objetos: [ {
        objeto: 'libro',        // uno de: 'libro' 'cuadro' 'reloj' 'cofre' 'caja' (cada uno, una sola vez)
        nombre: 'El libro rojo',// cómo se llama en pantalla
        reto: {
          tipo: 'opcion',       // 'opcion' | 'vf' | 'numero' | 'ordenar'
          enunciado: 'La pregunta.',
          opciones: ['a', 'b', 'c'],  // 'opcion': las opciones · 'ordenar': los elementos YA EN EL ORDEN CORRECTO (el juego los baraja)
          respuesta: 1,         // 'opcion': posición de la correcta, desde 0 · 'vf': true o false · 'numero': el número
          tolerancia: 0,        // sólo 'numero', opcional: cuánto puede desviarse (para decimales)
          pista: 'Ayuda opcional. Pedirla resta puntos.',
          explicacion: 'Opcional: se muestra al acertar.'
        },
        premio: { tipo: 'digito', valor: '7' }  // 'digito' (valor: un número 0-9) | 'llave' | 'pista' (texto: '...')
      } ],
      puerta: {
        orden: ['libro', 'reloj'],  // opcional: en qué orden van los dígitos. Si falta, el orden de la lista de objetos.
        mostrarOrden: true,         // true: la puerta dice qué objeto va en cada casilla. false: hay que deducirlo (p. ej. con un premio 'pista').
        mensaje: 'Frase al abrir la puerta.'
      }
    } ]
  };

  Si algún objeto da una 'llave', la puerta pide también la llave. Puntaje: cada objeto vale 100;
  un intento fallido resta 15 y una pista resta 30 (nunca baja de 20 por objeto).
*/
window.DATOS_ESCAPE = {
  salas: [
    {
      id: 'mate-6-estudio',
      titulo: 'El estudio del matemático',
      asignatura: 'Matemáticas',
      grado: '6.º',
      intro: 'La profesora Ruiz dejó su estudio cerrado con un código de cuatro dígitos y una llave. Las respuestas están en sus cosas.',
      tiempoObjetivo: 420,
      objetos: [
        {
          objeto: 'libro', nombre: 'El libro de múltiplos',
          reto: {
            tipo: 'opcion',
            enunciado: '¿Cuál es el mínimo común múltiplo de 4 y 6?',
            opciones: ['8', '12', '24', '10'],
            respuesta: 1,
            pista: 'Escribe los múltiplos de 6: 6, 12, 18… ¿Cuál es el primero que también está en la tabla del 4?',
            explicacion: 'Múltiplos de 4: 4, 8, 12… Múltiplos de 6: 6, 12… El primero que comparten es 12.'
          },
          premio: { tipo: 'digito', valor: '7' }
        },
        {
          objeto: 'cuadro', nombre: 'El cuadro del atardecer',
          reto: {
            tipo: 'vf',
            enunciado: 'Si el numerador es mayor que el denominador, la fracción es mayor que 1. Por ejemplo, 7/5.',
            respuesta: true,
            pista: 'Piensa en 5/5: es una unidad entera. ¿Y si tienes más quintos?',
            explicacion: '7/5 es una unidad (5/5) más 2/5. Es mayor que 1.'
          },
          premio: { tipo: 'digito', valor: '3' }
        },
        {
          objeto: 'reloj', nombre: 'El reloj de péndulo',
          reto: {
            tipo: 'numero',
            enunciado: 'El reloj marca las 8:15. Pasan 135 minutos. ¿Qué minutos marca ahora? Escribe sólo los minutos.',
            respuesta: 30,
            pista: '135 minutos son 2 horas y 15 minutos.',
            explicacion: '8:15 + 2 h 15 min = 10:30.'
          },
          premio: { tipo: 'digito', valor: '9' }
        },
        {
          objeto: 'cofre', nombre: 'El cofre con candado',
          reto: {
            tipo: 'numero',
            enunciado: 'El candado se abre con el resultado de 2³ + 5 × 4 − 6.',
            respuesta: 22,
            pista: 'Primero la potencia (2³ = 8), después la multiplicación, y al final suma y resta.',
            explicacion: '8 + 20 − 6 = 22.'
          },
          premio: { tipo: 'llave' }
        },
        {
          objeto: 'caja', nombre: 'La caja fuerte',
          reto: {
            tipo: 'ordenar',
            enunciado: 'Ordena de menor a mayor.',
            opciones: ['0,25', '1/3', '0,5', '3/4', '1,2'],
            pista: 'Pásalos todos a decimal: 1/3 es más o menos 0,33 y 3/4 es 0,75.',
            explicacion: '0,25 < 0,33 < 0,5 < 0,75 < 1,2.'
          },
          premio: { tipo: 'digito', valor: '5' }
        }
      ],
      puerta: {
        mostrarOrden: true,
        mensaje: '¡Saliste del estudio! La profesora Ruiz estaría orgullosa.'
      }
    },
    {
      id: 'sociales-8-archivo',
      titulo: 'El archivo de la Independencia',
      asignatura: 'Ciencias sociales',
      grado: '8.º',
      intro: 'Te quedaste encerrado en el archivo histórico. El cuadro esconde en qué orden va el código.',
      tiempoObjetivo: 480,
      objetos: [
        {
          objeto: 'libro', nombre: 'La crónica de 1810',
          reto: {
            tipo: 'opcion',
            enunciado: '¿En qué año fue el Grito de Independencia del 20 de julio en Santafé?',
            opciones: ['1492', '1810', '1819', '1886'],
            respuesta: 1,
            pista: 'Fue nueve años antes de la Batalla de Boyacá.',
            explicacion: 'El 20 de julio de 1810, con el episodio del florero de Llorente.'
          },
          premio: { tipo: 'digito', valor: '4' }
        },
        {
          objeto: 'cuadro', nombre: 'El retrato del prócer',
          reto: {
            tipo: 'vf',
            enunciado: 'La Revolución Francesa (1789) ayudó a difundir ideas de libertad e igualdad que llegaron a los criollos de América.',
            respuesta: true,
            pista: 'Su lema era «libertad, igualdad, fraternidad».',
            explicacion: 'Antonio Nariño tradujo la Declaración de los Derechos del Hombre en 1793.'
          },
          premio: { tipo: 'pista', texto: 'El código va así: primero la caja fuerte, luego el libro y al final el reloj.' }
        },
        {
          objeto: 'reloj', nombre: 'El reloj del archivo',
          reto: {
            tipo: 'ordenar',
            enunciado: 'Ordena del más antiguo al más reciente.',
            opciones: ['Llegada de Colón a América', 'Revolución Francesa', 'Grito de Independencia', 'Batalla de Boyacá', 'Constitución de 1991'],
            pista: 'Colón llegó en 1492 y la Constitución actual es de 1991.',
            explicacion: '1492 → 1789 → 1810 → 1819 → 1991.'
          },
          premio: { tipo: 'digito', valor: '8' }
        },
        {
          objeto: 'cofre', nombre: 'El baúl de documentos',
          reto: {
            tipo: 'numero',
            enunciado: '¿Cuántos años pasaron entre el Grito de Independencia (1810) y la Batalla de Boyacá (1819)?',
            respuesta: 9,
            pista: 'Resta: 1819 − 1810.',
            explicacion: '1819 − 1810 = 9 años.'
          },
          premio: { tipo: 'llave' }
        },
        {
          objeto: 'caja', nombre: 'La caja fuerte del virrey',
          reto: {
            tipo: 'opcion',
            enunciado: '¿Qué grupo social lideró la Independencia en la Nueva Granada?',
            opciones: ['Los criollos', 'Los virreyes', 'Los piratas ingleses', 'Los reyes de España'],
            respuesta: 0,
            pista: 'Eran hijos de españoles nacidos en América.',
            explicacion: 'Los criollos querían gobernar su propia tierra.'
          },
          premio: { tipo: 'digito', valor: '1' }
        }
      ],
      puerta: {
        orden: ['caja', 'libro', 'reloj'],
        mostrarOrden: false,
        mensaje: '¡Escapaste del archivo! Ya sabes más de la Independencia que muchos adultos.'
      }
    }
  ]
};
