/* global module */
/* Tejo — lo que se pregunta: la cultura del tejo, la física del tiro (con palabras o con los números de TU último tiro)
   y las cuentas del anotador. Cada pregunta de banco: [grado desde, enunciado, [buena, malas…], porqué]. */
(function (raiz) {
'use strict';
const coma = (x, d) => (+x).toFixed(d == null ? 1 : d).replace('.', ',');

const CULTURA = [
  [1, '¿Cuántos puntos vale una mecha?', ['3', '6', '9'], 'La mecha que revienta vale 3 puntos.'],
  [1, '¿Cuántos puntos vale la embocinada?', ['6', '3', '1'], 'El tejo que se queda dentro del bocín vale 6.'],
  [1, '¿Cuánto vale la mano?', ['1', '3', '6'], 'La mano es para el tejo que quedó más cerca del bocín: 1 punto.'],
  [2, 'La moñona es embocinada y mecha a la vez. ¿Cuánto vale?', ['9', '6', '12'], '6 de la embocinada más 3 de la mecha: 9.'],
  [2, '¿Qué es el bocín?', ['el aro de metal del centro', 'la papeleta que revienta', 'el disco que se lanza'], 'El bocín es un aro de metal clavado en la greda.'],
  [2, '¿Qué es el tejo?', ['un disco de metal que se lanza', 'un aro de metal', 'un cajón de madera'], 'El tejo es un disco pesado de hierro.'],
  [2, '¿Cómo se lanza el tejo?', ['por debajo del hombro', 'con los pies', 'con un palo'], 'Se lanza con la mano, por debajo del hombro.'],
  [3, '¿Dónde cae el tejo?', ['en un cajón de greda', 'en una piscina', 'en una canasta'], 'La greda es arcilla húmeda y blanda.'],
  [3, '¿Para qué sirve la greda húmeda?', ['para que el tejo se quede clavado', 'para que el tejo rebote', 'para que brille'], 'Blanda, frena el tejo y lo deja donde cayó.'],
  [3, '¿En qué departamento queda Turmequé, la cuna del tejo?', ['Boyacá', 'Nariño', 'La Guajira'], 'Turmequé es un pueblo de Boyacá.'],
  [3, 'La mecha de verdad lleva pólvora. ¿Quién la pone?', ['un adulto, con cuidado', 'cualquier niño', 'el perro de la cancha'], 'La pólvora la manejan sólo los adultos. Aquí es sólo un chispazo.'],
  [4, '¿Qué pueblo indígena jugaba al tejo hace mucho tiempo?', ['los muiscas', 'los wayuu', 'los emberá'], 'Los muiscas del altiplano lo jugaban con discos, de oro según la tradición.'],
  [4, 'El tejo nació en el altiplano…', ['cundiboyacense', 'del Caribe', 'de la Amazonia'], 'El altiplano de Cundinamarca y Boyacá.'],
  [5, '¿Qué otro nombre tiene el tejo, por un pueblo de Boyacá?', ['turmequé', 'bambuco', 'cumbia'], 'También se le dice turmequé.'],
  [5, 'Si un tejo revienta dos mechas, ¿cuántos puntos hace?', ['6', '3', '9'], 'Cada mecha vale 3: 3 + 3 = 6.'],
  [6, 'El tejo es el deporte nacional de Colombia por una ley del año…', ['2000', '1810', '1991'], 'La Ley 613 de 2000 lo declaró deporte nacional.'],
  [6, '¿Por qué el tejo es patrimonio de todos?', ['es una tradición que viene de los muiscas', 'lo inventó una empresa', 'llegó hace un año'], 'Es un juego indígena que siguió vivo hasta hoy.']
];

const FISICA = [
  [3, '¿Qué hace bajar al tejo mientras vuela?', ['la gravedad', 'el viento', 'la greda'], 'La gravedad de la Tierra lo jala hacia abajo todo el tiempo.'],
  [4, 'Te quedaste corto. Con el mismo ángulo, ¿qué cambias?', ['más fuerza', 'menos fuerza', 'nada'], 'Con más rapidez llega más lejos.'],
  [5, 'Te pasaste del cajón. Con el mismo ángulo, ¿qué cambias?', ['menos fuerza', 'más fuerza', 'nada'], 'Con menos rapidez llega más cerca.'],
  [6, 'Con la misma fuerza, desde el suelo, ¿qué ángulo llega más lejos?', ['45°', '15°', '75°'], 'En terreno plano, 45° da el alcance más largo.'],
  [6, 'El tejo que llega derecho a la greda…', ['se clava', 'resbala más', 'rebota más'], 'El que llega de lado resbala; el que llega derecho se queda.'],
  [7, 'Desde el suelo y con la misma fuerza, 30° y 60° llegan…', ['igual de lejos', '30° más lejos', '60° más lejos'], 'Los ángulos que suman 90° dan el mismo alcance (sin aire).'],
  [7, 'En lo más alto del vuelo, la velocidad hacia arriba es…', ['cero', 'la más grande', 'la misma de la salida'], 'Ahí deja de subir y empieza a bajar.'],
  [8, 'Mientras vuela, la velocidad hacia adelante del tejo…', ['no cambia', 'aumenta', 'disminuye'], 'Sin aire, nada lo empuja ni lo frena hacia adelante.'],
  [8, 'Un tejo pesado y uno liviano, con el mismo tiro y sin aire…', ['caen en el mismo sitio', 'el pesado cae antes', 'el liviano cae antes'], 'La gravedad acelera igual a todo: 9,8 m/s².'],
  [9, 'La trayectoria del tejo (sin aire) es una…', ['parábola', 'recta', 'circunferencia'], 'Adelante a velocidad constante y abajo acelerando: una parábola.']
];

const barajar = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
/** Una pregunta lista {p, opciones, correcta, x} con la buena en un lugar al azar. */
function armar(p, buena, malas, x, tipo) {
  const vistas = new Set([buena]), ms = malas.filter(m => (vistas.has(m) ? false : (vistas.add(m), true)));
  const ops = barajar([buena].concat(ms.slice(0, 3)));
  return { p, opciones: ops, correcta: ops.indexOf(buena), x: x || '', tipo: tipo || '' };
}
const deBanco = (q, tipo) => armar(q[1], q[2][0], q[2].slice(1), q[3], tipo);

/** Las preguntas de física con los números del último tiro (9.º a 11.º). `r` = lo que devolvió TejoFisica.lanzar. */
function fisicaDelTiro(r, F, i) {
  const t = r.tiro, v = coma(t.v), a = t.ang, g = coma(F.G);
  const vx = t.v * Math.cos(a * Math.PI / 180), vy = t.v * Math.sin(a * Math.PI / 180);
  const tipos = [
    () => armar('Lanzaste a ' + v + ' m/s y ' + a + '°. ¿Cuánto vale la velocidad hacia adelante, vx = v·cos θ?',
      coma(vx) + ' m/s', [coma(vy) + ' m/s', coma(t.v) + ' m/s', coma(t.v / 2) + ' m/s'], 'vx = ' + v + ' · cos ' + a + '° = ' + coma(vx) + ' m/s, y no cambia en todo el vuelo.', 'fisica'),
    () => armar('Lanzaste a ' + v + ' m/s y ' + a + '° (vy = ' + coma(vy) + ' m/s). ¿Cuánto tarda en llegar a lo más alto? (g = ' + g + ' m/s²)',
      coma(vy / F.G, 2) + ' s', [coma(2 * vy / F.G, 2) + ' s', coma(vx / F.G, 2) + ' s', coma(vy * F.G / 10, 2) + ' s'], 't = vy / g = ' + coma(vy) + ' / ' + g + ' = ' + coma(vy / F.G, 2) + ' s.', 'fisica'),
    () => armar('Saliste de la mano a 1 m del suelo con vy = ' + coma(vy) + ' m/s. ¿Qué altura máxima alcanzó? (h = 1 + vy² / 2g)',
      coma(F.H0 + vy * vy / (2 * F.G), 2) + ' m', [coma(F.H0 + vy * vy / F.G, 2) + ' m', coma(vy * vy / (2 * F.G), 2) + ' m', coma(F.H0 + vy / F.G, 2) + ' m'],
      'h = 1 + ' + coma(vy) + '² / (2 · ' + g + ') = ' + coma(F.H0 + vy * vy / (2 * F.G), 2) + ' m.', 'fisica'),
    () => armar('Desde el suelo y sin aire, ¿qué otro ángulo daría el mismo alcance que ' + a + '°?',
      (90 - a) + '°', [(180 - a) + '°', (a + 15 > 89 ? a - 15 : a + 15) + '°', Math.round(a / 2) + '°'], 'Los ángulos que suman 90° llegan igual de lejos: ' + a + '° + ' + (90 - a) + '° = 90°.', 'fisica'),
    () => armar('El tejo avanzó ' + coma(r.alcance) + ' m a ' + coma(vx) + ' m/s hacia adelante. ¿Cuánto duró el vuelo?',
      coma(r.alcance / vx, 2) + ' s', [coma(vx / r.alcance, 2) + ' s', coma(r.alcance / t.v * 2, 2) + ' s', coma(r.alcance * vx / 10, 2) + ' s'],
      't = x / vx = ' + coma(r.alcance) + ' / ' + coma(vx) + ' = ' + coma(r.alcance / vx, 2) + ' s.', 'fisica')
  ];
  if (a === 45) tipos.splice(3, 1); // con 45° el complementario es el mismo
  return tipos[i % tipos.length]();
}

/** Las cuentas del anotador al final de una ronda. `det` = lo del jugador en la ronda ({que, puntos}), `antes` = lo que
    llevaba, `meta` = los puntos para ganar. Grado 1–2: la suma de la ronda; 3+: también el total; 5+: también lo que falta
    (el juego pregunta la de la ronda y, de 3.º en adelante, una de las otras). */
const NOMBRE = { mecha: 'mecha', embocinada: 'embocinada', monona: 'moñona', mano: 'mano' };
const ICONO = { mecha: '💥', embocinada: '🎯', monona: '🌟', mano: '✋' };
function anotador(det, antes, meta, grado, quien) {
  const ronda = det.reduce((a, x) => a + x.puntos, 0), lista = det.map(x => ICONO[x.que] + ' ' + NOMBRE[x.que]).join(' + ');
  const nums = (n, extra) => { const s = new Set([n]); extra.forEach(e => { if (e >= 0 && s.size < 4) s.add(e); }); return [...s].slice(1).map(String); };
  const out = [];
  if (ronda > 0) out.push(armar((quien || 'Tú') + ': ' + lista + '. ¿Cuántos puntos son en esta ronda?', String(ronda), nums(ronda, [ronda + 1, ronda - 1, ronda + 3, ronda - 3, ronda + 2]),
    det.map(x => NOMBRE[x.que] + ' ' + x.puntos).join(' + ') + ' = ' + ronda + '.', 'anotar'));
  if (grado >= 3 && ronda > 0 && antes > 0) out.push(armar('Tenías ' + antes + ' y sumas ' + ronda + '. ¿Cuántos llevas ahora?', String(antes + ronda),
    nums(antes + ronda, [antes + ronda + 1, antes + ronda - 1, antes + ronda + 10, antes + ronda - 2]), antes + ' + ' + ronda + ' = ' + (antes + ronda) + '.', 'anotar'));
  if (grado >= 5 && meta && antes + ronda < meta && antes + ronda > 0) out.push(armar('Llevas ' + (antes + ronda) + '. ¿Cuántos te faltan para llegar a ' + meta + '?', String(meta - antes - ronda),
    nums(meta - antes - ronda, [meta - antes - ronda + 1, meta - antes - ronda - 1, meta + antes + ronda, meta - antes - ronda + 2]), meta + ' − ' + (antes + ronda) + ' = ' + (meta - antes - ronda) + '.', 'anotar'));
  return out;
}

const C = { CULTURA, FISICA, armar, deBanco, fisicaDelTiro, anotador, coma, NOMBRE, ICONO, barajar };
if (typeof module !== 'undefined' && module.exports) module.exports = C; else raiz.TejoContenido = C;
})(typeof window !== 'undefined' ? window : globalThis);
