/* Máquina Loca — las preguntas de la sala (las de la lección las manda la lección).
   Cada tema: preguntas { p, opciones (la buena primero: el juego las baraja), g (desde qué grado), por (por qué) }.
   Las de inglés: palabras con MP3 grabado en la Biblioteca (voz/en/<slug>.mp3); sin MP3, la palabra escrita. */
(function (raiz) {
'use strict';
const TEMAS = [
  { id: 'maquinas', nombre: 'Máquinas simples', emoji: '⚙️', grados: '3.º a 7.º', frase: 'Palancas, poleas, planos inclinados y fuerzas.' },
  { id: 'energia', nombre: 'Energía y movimiento', emoji: '⚡', grados: '6.º a 11.º', frase: 'Caída, rebote, rozamiento y conservación de la energía (con las barras de energía).' },
  { id: 'ingles', nombre: 'English: push, pull, up, down', emoji: '🔊', grados: '1.º a 7.º', frase: 'Escucha la palabra en inglés y elige qué quiere decir.' },
  { id: 'solo', nombre: 'Sólo máquinas', emoji: '🛠️', grados: 'todos', frase: 'Los niveles sin preguntas.' }
];
const Q = (p, opciones, g, por) => ({ p, opciones, g, por });
const PREGUNTAS = {
  maquinas: [
    Q('¿Qué máquina simple es un balancín del parque?', ['Una palanca', 'Una polea', 'Una rueda'], 3, 'El balancín gira sobre un punto de apoyo: es una palanca.'),
    Q('¿Qué máquina simple es una rampa?', ['Un plano inclinado', 'Una palanca', 'Una polea'], 3, 'La rampa es un plano inclinado: subir por ella cuesta menos fuerza, pero el camino es más largo.'),
    Q('Para subir una carga pesada a un camión, ¿qué ayuda más?', ['Una rampa larga y suave', 'Una rampa corta y empinada', 'Saltar con la carga'], 4, 'Con una rampa más larga se hace menos fuerza (aunque se recorre más).'),
    Q('¿Qué hace una polea fija, como la del pozo?', ['Cambia la dirección de la fuerza', 'Hace desaparecer el peso', 'Calienta la cuerda'], 4, 'Halas hacia abajo y el balde sube: cambia la dirección de la fuerza.'),
    Q('En una palanca, ¿cómo se llama el punto sobre el que gira?', ['Punto de apoyo', 'Punto final', 'Polea'], 4, 'El punto de apoyo (o fulcro) es donde gira la palanca.'),
    Q('Para levantar a alguien pesado en un balancín, ¿dónde te sientas?', ['Más lejos del punto de apoyo', 'Encima del punto de apoyo', 'Más cerca del punto de apoyo'], 5, 'Más lejos del apoyo tu peso hace más efecto (más brazo de palanca).'),
    Q('¿Cuál de estas cosas es una palanca?', ['Las tijeras', 'Un tobogán', 'Un balón'], 4, 'Las tijeras son dos palancas unidas por el punto de apoyo.'),
    Q('¿Qué es una fuerza?', ['Un empujón o un halón', 'Un color', 'Un sonido'], 3, 'Una fuerza empuja o hala: puede mover, frenar o cambiar la forma de las cosas.'),
    Q('¿Qué fuerza hace caer la pelota?', ['La gravedad', 'El imán', 'El viento'], 3, 'La Tierra atrae todo hacia abajo: es la gravedad.'),
    Q('¿Qué atrae un imán?', ['El hierro y el acero', 'La madera', 'El cuero del balón'], 3, 'El imán atrae algunos metales, como el hierro y el acero.'),
    Q('¿Qué frena a una pelota que rueda por el piso?', ['El rozamiento', 'La luz', 'La polea'], 4, 'El rozamiento entre la pelota y el piso la va frenando.'),
    Q('Un tornillo es un plano inclinado…', ['enrollado', 'mojado', 'invisible'], 6, 'La rosca del tornillo es un plano inclinado enrollado en un cilindro.'),
    Q('¿Qué máquina simple usa una grúa para subir cargas?', ['Poleas', 'Planos inclinados', 'Tijeras'], 5, 'Las grúas suben la carga con poleas y cables.'),
    Q('Con varias poleas juntas (un polipasto), la fuerza que haces es…', ['menor', 'mayor', 'igual a cero'], 6, 'Con más poleas se reparte el peso entre más cuerdas: haces menos fuerza.'),
    Q('¿Qué guarda un resorte cuando lo aplastas?', ['Energía', 'Agua', 'Aire caliente'], 5, 'El resorte aplastado guarda energía elástica y la devuelve al soltarse.'),
    Q('La cinta transportadora mueve la pelota gracias a…', ['su motor y el rozamiento', 'un imán escondido', 'la luz del sol'], 5, 'El motor mueve la cinta y el rozamiento arrastra lo que lleva encima.'),
    Q('¿Qué pasa si empujas más fuerte una pelota?', ['Sale más rápido', 'Sale más lento', 'No pasa nada'], 3, 'Más fuerza, más cambio de velocidad.'),
    Q('El ventilador empuja más fácil…', ['al balón liviano', 'a la pesa de 5 kg', 'a los dos igual'], 5, 'Con la misma fuerza, lo de menos masa se acelera más.')
  ],
  energia: [
    Q('Una pelota en lo alto de una rampa tiene energía…', ['potencial (por su altura)', 'eléctrica', 'química'], 6, 'Por estar alta tiene energía potencial gravitatoria: Ep = m·g·h.'),
    Q('Al bajar por la rampa, la energía potencial se convierte en…', ['energía cinética (de movimiento)', 'luz', 'masa'], 6, 'Pierde altura y gana velocidad: la potencial pasa a cinética.'),
    Q('Si no hubiera rozamiento, la energía mecánica total…', ['se conservaría', 'se duplicaría', 'desaparecería'], 8, 'Sin rozamiento ni golpes, Ep + Ec se mantiene constante.'),
    Q('¿Por qué una pelota que rebota llega cada vez menos alto?', ['Pierde energía en cada golpe (calor y sonido)', 'La gravedad se cansa', 'Gana masa'], 7, 'En cada choque parte de la energía se va en calor, sonido y deformación.'),
    Q('Ec = ½·m·v². Si la velocidad se duplica, la energía cinética…', ['se multiplica por 4', 'se duplica', 'no cambia'], 9, 'Va con v²: el doble de velocidad es 2² = 4 veces la energía.'),
    Q('Ep = m·g·h. Con g = 10 m/s², ¿cuánta energía tiene 1 kg a 2 m de altura?', ['20 J', '2 J', '12 J'], 9, '1 kg · 10 m/s² · 2 m = 20 J.'),
    Q('Sin aire, una pluma y una pesa que se sueltan juntas…', ['caen al mismo tiempo', 'la pesa llega mucho antes', 'la pluma sube'], 9, 'Sin aire todo cae con la misma aceleración g.'),
    Q('Una pelota soltada desde 5 m (g = 10 m/s²) llega al suelo a…', ['10 m/s', '5 m/s', '50 m/s'], 10, 'v = √(2·g·h) = √(2·10·5) = 10 m/s.'),
    Q('Un resorte comprimido tiene energía…', ['potencial elástica', 'nuclear', 'térmica nada más'], 8, 'La deformación del resorte guarda energía potencial elástica: ½·k·x².'),
    Q('Un rebote perfectamente elástico es aquel en que…', ['no se pierde energía cinética', 'la pelota se rompe', 'la pelota se queda pegada'], 10, 'En el choque elástico la energía cinética se conserva.'),
    Q('El rozamiento transforma la energía de movimiento en…', ['calor', 'altura', 'masa'], 7, 'Por eso se calientan las manos al frotarlas.'),
    Q('En la palanca, la pesa que cae le pasa su energía a…', ['la pelota que sale lanzada', 'el aire nada más', 'nadie: se pierde toda'], 7, 'La palanca transmite la energía de la pesa a la pelota (y algo se pierde en el golpe).'),
    Q('El trabajo de una fuerza es W = F·d. Si empujas con 10 N durante 3 m, haces…', ['30 J', '13 J', '3,3 J'], 9, '10 N · 3 m = 30 J.'),
    Q('En una rampa sin rozamiento, la velocidad abajo depende de…', ['la altura, no de la inclinación', 'sólo del largo', 'del color de la rampa'], 10, 'Por la conservación de la energía: v = √(2·g·h), sea la rampa empinada o suave.'),
    Q('La potencia mide…', ['qué tan rápido se hace un trabajo', 'cuánto pesa algo', 'la altura'], 9, 'P = W / t: más potencia es el mismo trabajo en menos tiempo.'),
    Q('Un lanzamiento con la misma rapidez llega más lejos (sin aire) con un ángulo de…', ['45°', '10°', '90°'], 10, 'El alcance es máximo a 45°: v²·sen(2θ)/g.')
  ]
};
// inglés: sólo palabras que tienen su MP3 en la Biblioteca (voz/en): las opciones son su significado
const INGLES = [
  { en: 'push', es: 'empujar', emoji: '🫸' }, { en: 'pull', es: 'halar', emoji: '🪢' }, { en: 'up', es: 'arriba', emoji: '⬆️' },
  { en: 'down', es: 'abajo', emoji: '⬇️' }, { en: 'left', es: 'izquierda', emoji: '⬅️' }, { en: 'right', es: 'derecha', emoji: '➡️' },
  { en: 'fast', es: 'rápido', emoji: '🐇' }, { en: 'slow', es: 'lento', emoji: '🐢' }, { en: 'ball', es: 'pelota', emoji: '⚽' },
  { en: 'basket', es: 'canasta', emoji: '🧺' }, { en: 'box', es: 'caja', emoji: '📦' }, { en: 'in', es: 'dentro', emoji: '📥' },
  { en: 'on', es: 'encima', emoji: '🔝' }, { en: 'go', es: '¡vamos!', emoji: '🟢' }, { en: 'light', es: 'liviano', emoji: '🪶' }
];
const barajar = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
/** n preguntas del tema para el grado (las del grado y las de antes; si faltan, todas). */
function preguntas(tema, grado, n) {
  if (tema === 'ingles') {
    return barajar(INGLES).slice(0, n).map((w, k) => {
      const otras = barajar(INGLES.filter(x => x.en !== w.en)).slice(0, 2);
      if (grado >= 4 && k % 3 === 2) {
        // al revés: se lee el español y se elige el inglés (que suena al tocarlo)
        const ops = barajar([w].concat(otras));
        return { p: '¿Cómo se dice «' + w.es + '» ' + w.emoji + ' en inglés?', opciones: ops.map(x => x.en), correcta: ops.indexOf(w), opcionesEn: true, por: '«' + w.es + '» es «' + w.en + '».' };
      }
      const ops = barajar([w].concat(otras));
      return { p: '¿Qué quiere decir?', oir: w.en, escucha: k % 2 === 0, opciones: ops.map(x => x.emoji + ' ' + x.es), correcta: ops.indexOf(w), por: '«' + w.en + '» quiere decir «' + w.es + '».' };
    });
  }
  const todas = PREGUNTAS[tema] || [];
  let ps = todas.filter(q => q.g <= grado + 1);
  if (ps.length < n) ps = todas;
  return barajar(ps).slice(0, n).map(q => { const ops = barajar(q.opciones); return { p: q.p, opciones: ops, correcta: ops.indexOf(q.opciones[0]), por: q.por }; });
}
const C = { TEMAS, PREGUNTAS, INGLES, preguntas, barajar };
if (typeof module !== 'undefined' && module.exports) module.exports = C; else raiz.MaquinaContenido = C;
})(typeof window !== 'undefined' ? window : globalThis);
