/* Rally de los Aros — lo que se pregunta en la sala de juegos (sin lección): por materia, tema y grado.
   window.RallyContenido = { MATERIAS, temas(materia, grado), generar(materia, tema, grado, n, op), dePalabras(palabras, n, op) }
   Una pregunta del rally: { p, opciones: [texto], correcta, oir?, escucha?, palabra?, opEn?, explica? }
   - oir: lo que suena al salir el tramo (MP3 grabado; sin él, silencio y el texto se ve).
   - escucha: la palabra NO se ve (sólo la bocina) hasta «Ver la palabra», hasta que falta el MP3 o se apaga el sonido.
   - opEn: las opciones están en inglés (suenan al elegirlas y al pasar por su aro).
   op = { tiene(texto) → hay MP3, modo: 'facil' | 'media' | 'normal' }. Grado: 0 = Transición. */
(function () {
'use strict';
const barajar = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const ent = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
const pick = a => a[Math.floor(Math.random() * a.length)];
const num = n => (Math.round(n * 1000) / 1000).toLocaleString('es-CO', { maximumFractionDigits: 3 });
// una pregunta con la buena en `buena` y las malas en `malas` (se baraja y se calcula `correcta`)
function q(p, buena, malas, extra) {
  const ops = barajar([String(buena)].concat(malas.map(String)).filter((o, i, a) => a.indexOf(o) === i));
  return Object.assign({ p, opciones: ops, correcta: ops.indexOf(String(buena)) }, extra || {});
}
// malas numéricas cerca de la buena, distintas y sin negativos (salvo que se permitan)
function cerca(b, n, pasos, neg) {
  const s = new Set([b]), out = [];
  for (let k = 0; out.length < n && k < 60; k++) {
    const d = pick(pasos) * (Math.random() < 0.5 ? -1 : 1), v = b + d;
    if ((neg || v >= 0) && !s.has(v)) { s.add(v); out.push(v); }
  }
  for (let v = b + 1; out.length < n; v++) if (!s.has(v)) { s.add(v); out.push(v); }
  return out;
}

/* ---------- Inglés: [en, es, emoji, desde el grado] ---------- */
const VOC = {
  animales: { nombre: 'Animales', emoji: '🐄', desde: 0, w: [['cow', 'vaca', '🐄'], ['hen', 'gallina', '🐔'], ['pig', 'cerdo', '🐷'], ['dog', 'perro', '🐶'], ['cat', 'gato', '🐱'],
    ['duck', 'pato', '🦆'], ['horse', 'caballo', '🐴'], ['sheep', 'oveja', '🐑'], ['goat', 'cabra', '🐐'], ['rabbit', 'conejo', '🐰'], ['fish', 'pez', '🐟'], ['bird', 'pájaro', '🐦'],
    ['lion', 'león', '🦁'], ['tiger', 'tigre', '🐯'], ['elephant', 'elefante', '🐘'], ['monkey', 'mono', '🐒'], ['frog', 'rana', '🐸'], ['butterfly', 'mariposa', '🦋']] },
  numeros: { nombre: 'Números', emoji: '🔢', desde: 0, w: [['one', 'uno', '1️⃣'], ['two', 'dos', '2️⃣'], ['three', 'tres', '3️⃣'], ['four', 'cuatro', '4️⃣'], ['five', 'cinco', '5️⃣'],
    ['six', 'seis', '6️⃣'], ['seven', 'siete', '7️⃣'], ['eight', 'ocho', '8️⃣'], ['nine', 'nueve', '9️⃣'], ['ten', 'diez', '🔟'], ['eleven', 'once', '11'], ['twelve', 'doce', '12'], ['twenty', 'veinte', '20']] },
  colores: { nombre: 'Colores', emoji: '🎨', desde: 0, w: [['red', 'rojo', '🔴'], ['blue', 'azul', '🔵'], ['green', 'verde', '🟢'], ['yellow', 'amarillo', '🟡'], ['orange', 'naranja', '🟠'],
    ['purple', 'morado', '🟣'], ['pink', 'rosado', '🌸'], ['black', 'negro', '⚫'], ['white', 'blanco', '⚪'], ['brown', 'café', '🟤']] },
  comida: { nombre: 'Comida', emoji: '🍎', desde: 0, w: [['apple', 'manzana', '🍎'], ['banana', 'banano', '🍌'], ['bread', 'pan', '🍞'], ['milk', 'leche', '🥛'], ['water', 'agua', '💧'],
    ['egg', 'huevo', '🥚'], ['cheese', 'queso', '🧀'], ['rice', 'arroz', '🍚'], ['juice', 'jugo', '🧃'], ['corn', 'maíz', '🌽'], ['chicken', 'pollo', '🍗']] },
  familia: { nombre: 'Familia y cuerpo', emoji: '👪', desde: 1, w: [['mother', 'mamá', '👩'], ['father', 'papá', '👨'], ['sister', 'hermana', '👧'], ['brother', 'hermano', '👦'],
    ['grandmother', 'abuela', '👵'], ['grandfather', 'abuelo', '👴'], ['baby', 'bebé', '👶'], ['eyes', 'ojos', '👀'], ['nose', 'nariz', '👃'], ['mouth', 'boca', '👄'], ['ears', 'orejas', '👂'],
    ['hands', 'manos', '✋'], ['feet', 'pies', '🦶'], ['hair', 'pelo', '💇']] },
  escuela: { nombre: 'El colegio', emoji: '🏫', desde: 1, w: [['book', 'libro', '📕'], ['pencil', 'lápiz', '✏️'], ['eraser', 'borrador', '🧽'], ['chair', 'silla', '🪑'], ['crayon', 'crayola', '🖍️'],
    ['scissors', 'tijeras', '✂️'], ['teacher', 'profesor', '🧑‍🏫'], ['school', 'colegio', '🏫'], ['backpack', 'maleta', '🎒'], ['notebook', 'cuaderno', '📓']] },
  acciones: { nombre: 'Acciones', emoji: '🏃', desde: 2, w: [['run', 'correr', '🏃'], ['jump', 'saltar', '🤸'], ['swim', 'nadar', '🏊'], ['eat', 'comer', '🍽️'], ['drink', 'beber', '🥤'],
    ['sleep', 'dormir', '😴'], ['read', 'leer', '📖'], ['sing', 'cantar', '🎤'], ['dance', 'bailar', '💃'], ['play', 'jugar', '⚽'], ['write', 'escribir', '✍️'], ['cook', 'cocinar', '🍳']] },
  clima: { nombre: 'Clima y sensaciones', emoji: '⛅', desde: 3, w: [['sunny', 'soleado', '☀️'], ['rainy', 'lluvioso', '🌧️'], ['cloudy', 'nublado', '☁️'], ['windy', 'con viento', '💨'],
    ['hot', 'caliente', '🥵'], ['cold', 'frío', '🥶'], ['happy', 'feliz', '😀'], ['sad', 'triste', '😢'], ['hungry', 'con hambre', '😋'], ['tired', 'cansado', '😩']] },
  lugares: { nombre: 'Casa y lugares', emoji: '🏠', desde: 3, w: [['house', 'casa', '🏠'], ['park', 'parque', '🏞️'], ['kitchen', 'cocina', '🍳'], ['bedroom', 'habitación', '🛏️'],
    ['bathroom', 'baño', '🛁'], ['farm', 'granja', '🚜'], ['beach', 'playa', '🏖️'], ['store', 'tienda', '🏪'], ['nurse', 'enfermera', '👩‍⚕️'], ['farmer', 'granjero', '🧑‍🌾'],
    ['firefighter', 'bombero', '🧑‍🚒'], ['driver', 'conductor', '🚌']] },
  opuestos: { nombre: 'Cómo es', emoji: '🐘', desde: 4, w: [['big', 'grande', '🐘'], ['small', 'pequeño', '🐜'], ['tall', 'alto', '🦒'], ['fast', 'rápido', '🐆'], ['slow', 'lento', '🐢'],
    ['old', 'viejo', '👴'], ['new', 'nuevo', '✨'], ['strong', 'fuerte', '💪'], ['clean', 'limpio', '🧼'], ['dirty', 'sucio', '🐖']] }
};
// frases que suelen estar grabadas (si no, se ven escritas): [en, es]
const FRASES = [['good morning', 'buenos días'], ['how are you', '¿cómo estás?'], ['thank you', 'gracias'], ['see you later', 'hasta luego'], ["what's your name", '¿cómo te llamas?'],
  ['he is a doctor', 'él es médico'], ['where is the kitchen', '¿dónde está la cocina?'], ['what day is it', '¿qué día es hoy?'], ['please help me', 'por favor, ayúdame'],
  ["it's half past six", 'son las seis y media'], ['there are four', 'hay cuatro'], ['i like the park', 'me gusta el parque'], ['she is making bread', 'ella está haciendo pan'],
  ['what do you see', '¿qué ves?'], ['i like oranges', 'me gustan las naranjas'], ['this is a pencil', 'esto es un lápiz'], ['in the bedroom', 'en la habitación'], ['goodbye', 'adiós']];
// gramática: [frase con ___, buena, malas]
const GRAM = [['She ___ to school every day.', 'goes', ['go', 'going']], ['They ___ playing soccer.', 'are', ['is', 'am']], ['I ___ a dog and a cat.', 'have', ['has', 'having']],
  ['There ___ three cats on the bed.', 'are', ['is', 'be']], ['He ___ TV yesterday.', 'watched', ['watches', 'watching']], ['We ___ to the beach last Sunday.', 'went', ['go', 'goes']],
  ['My sister ___ like spiders.', "doesn't", ["don't", "isn't"]], ['___ you like pizza?', 'Do', ['Does', 'Are']], ['Look! It ___ raining.', 'is', ['are', 'am']],
  ['This is ___ book.', 'my', ['me', 'I']], ['___ is your name?', 'What', ['Where', 'Who']], ['___ do you live?', 'Where', ['What', 'Who']], ['I can ___ very fast.', 'run', ['runs', 'running']],
  ['An elephant is ___ than a dog.', 'bigger', ['big', 'biggest']], ['She is the ___ girl in her class.', 'tallest', ['taller', 'tall']], ['I ___ my homework every night.', 'do', ['does', 'doing']],
  ['Yesterday I ___ a big fish.', 'saw', ['see', 'seeing']], ['Tomorrow we ___ visit grandma.', 'will', ['did', 'was']], ['How ___ apples do you have?', 'many', ['much', 'more']]];

const conEmoji = (w, emoji) => (emoji && w.emoji ? w.emoji + ' ' : '') + w.es;
/** Una pregunta de inglés sobre una palabra: escucha (sólo la bocina), lee (se ve y suena) o al revés (del español al inglés). */
function dePalabra(w, todas, tipo, emoji) {
  const otras = barajar(todas.filter(x => x.es !== w.es && x.en !== w.en)).slice(0, 2);
  if (tipo === 'reves') return q('¿Cómo se dice ' + (w.emoji ? w.emoji + ' ' : '') + '«' + w.es + '» en inglés?', w.en, otras.map(x => x.en), { opEn: true, tipo });
  const buena = conEmoji(w, emoji), malas = otras.map(x => conEmoji(x, emoji));
  if (tipo === 'escucha') return q('🔊 Escucha: ¿qué quiere decir?', buena, malas, { oir: w.en, escucha: true, palabra: w.en, tipo });
  return q('«' + w.en + '»: ¿qué quiere decir?', buena, malas, { oir: w.en, tipo });
}
/** Las palabras (de la lección o de un tema) hechas tramos, con tipos alternados según el modo. De 6 a 10 tramos. */
function dePalabras(pal, n, op) {
  op = op || {};
  const ws = pal.filter(w => w && w.en && w.es);
  if (ws.length < 2) return [];
  const modo = op.modo || 'normal', tiene = op.tiene || (() => false);
  const tipos = modo === 'facil' ? ['escucha', 'lee'] : modo === 'media' ? ['escucha', 'lee', 'reves'] : ['reves', 'escucha', 'lee'];
  const emoji = modo !== 'normal' || op.emoji;
  const total = Math.max(Math.min(n || ws.length, 12), Math.min(6, ws.length * 2));
  let orden = barajar(ws), out = [], k = Math.floor(Math.random() * tipos.length);
  while (out.length < total) {
    if (!orden.length) orden = barajar(ws);
    const w = orden.shift();
    let t = tipos[k++ % tipos.length];
    if (t === 'escucha' && !tiene(w.en)) t = 'lee'; // sin MP3, la bocina no tiene sentido: se ve escrita
    out.push(dePalabra(w, ws, t, emoji));
  }
  return out;
}
function deFrases(grado, n, op) {
  const fs = barajar(FRASES), out = [];
  for (const f of fs) {
    if (out.length >= n) break;
    const otras = barajar(FRASES.filter(x => x !== f)).slice(0, 2);
    if (grado >= 7 && Math.random() < 0.5) out.push(q('¿Cómo se dice «' + f[1] + '» en inglés?', f[0], otras.map(x => x[0]), { opEn: true }));
    else if (op.tiene(f[0])) out.push(q('🔊 Escucha la frase: ¿qué quiere decir?', f[1], otras.map(x => x[1]), { oir: f[0], escucha: true, palabra: f[0] }));
    else out.push(q('«' + f[0] + '»: ¿qué quiere decir?', f[1], otras.map(x => x[1]), { oir: f[0] }));
  }
  return out;
}
const deGramatica = n => barajar(GRAM).slice(0, n).map(g => q('Completa: ' + g[0], g[1], g[2], { opEn: true }));

/* ---------- Matemáticas (se generan) ---------- */
const MAT = {
  contar: { nombre: 'Contar', emoji: '🍎', desde: 0, hasta: 1, gen: g => { const e = pick(['🍎', '⭐', '🐟', '🎈', '🐤']), n = ent(1, g ? 10 : 6); return q('¿Cuántos hay? ' + e.repeat(n), n, cerca(n, 2, [1, 2])); } },
  sumas: { nombre: 'Sumas y restas', emoji: '➕', desde: 1, gen: g => {
    const max = g <= 1 ? 10 : g === 2 ? 50 : g === 3 ? 100 : 1000, resta = g >= 1 && Math.random() < 0.45;
    let a = ent(1, max), b = ent(1, max); if (!resta && a + b > max * 1.2) b = ent(1, Math.max(1, max - a)); if (resta && b > a) [a, b] = [b, a];
    const r = resta ? a - b : a + b; return q(a + (resta ? ' − ' : ' + ') + b, r, cerca(r, 2, g <= 2 ? [1, 2] : [1, 10, 2]));
  } },
  tablas: { nombre: 'Tablas', emoji: '✖️', desde: 2, gen: g => {
    const top = g <= 2 ? 5 : 10, a = ent(2, top), b = ent(2, 10), r = a * b;
    return q(a + ' × ' + b, r, [a * (b + 1), (a + 1) * b, a * (b - 1), r + 1].filter(v => v !== r && v > 0).slice(0, 4).sort(() => Math.random() - 0.5).slice(0, 2));
  } },
  division: { nombre: 'Divisiones', emoji: '➗', desde: 3, gen: () => { const a = ent(2, 9), b = ent(2, 10); return q((a * b) + ' ÷ ' + a, b, cerca(b, 2, [1, 2])); } },
  mental: { nombre: 'Cálculo mental', emoji: '🧠', desde: 4, gen: g => pick([
    () => { const n = ent(11, g >= 6 ? 499 : 99); return q('El doble de ' + n, 2 * n, cerca(2 * n, 2, [1, 10, 2])); },
    () => { const n = 2 * ent(6, g >= 6 ? 250 : 50); return q('La mitad de ' + n, n / 2, cerca(n / 2, 2, [1, 10, 5])); },
    () => { const n = ent(3, 99), k = pick([10, 100]); return q(n + ' × ' + k, n * k, [n * k / 10, n * k * 10]); },
    () => { const a = ent(12, 89), b = ent(11, 59); return q(a + ' + ' + b, a + b, cerca(a + b, 2, [1, 10])); },
    () => { const k = pick([4, 8, 12]); return q('25 × ' + k, 25 * k, cerca(25 * k, 2, [25, 5])); }
  ])() },
  fracciones: { nombre: 'Fracciones', emoji: '🍕', desde: 4, gen: () => pick([
    () => { const d = pick([2, 3, 4, 5]), m = d * ent(2, 6); return q('1/' + d + ' de ' + m, m / d, cerca(m / d, 2, [1, 2])); },
    () => { const d = pick([2, 3, 4]), k = ent(2, 4); return q('¿Qué fracción es igual a 1/' + d + '?', k + '/' + (d * k), [k + '/' + (d * k + 1), (k + 1) + '/' + (d * k)]); },
    () => { const [a, b, c] = barajar([2, 3, 4, 5, 6, 8]).slice(0, 3); const m = Math.min(a, b, c); return q('¿Cuál es la fracción más grande?', '1/' + m, [a, b, c].filter(x => x !== m).map(x => '1/' + x)); },
    () => { const d = pick([3, 4, 5, 8]), a = ent(1, d - 2), b = ent(1, d - 1 - a); return q(a + '/' + d + ' + ' + b + '/' + d, (a + b) + '/' + d, [(a + b) + '/' + (2 * d), (a + b + 1) + '/' + d]); }
  ])() },
  decimales: { nombre: 'Decimales y porcentajes', emoji: '💯', desde: 6, gen: () => pick([
    () => { const p = pick([10, 20, 25, 50]), n = pick([40, 80, 120, 200, 300, 600]); const r = n * p / 100; return q(p + ' % de ' + n, r, cerca(r, 2, [p / 5, 10, 5])); },
    () => { const a = ent(1, 9) / 10, b = ent(1, 9) / 100; return q(num(a) + ' + ' + num(b), num(a + b), [num(a + b * 10), num(a / 10 + b)]); },
    () => { const a = ent(11, 99) / 10; return q(num(a) + ' × 10', num(a * 10), [num(a * 100), num(a + 10)]); }
  ])() },
  enteros: { nombre: 'Números negativos', emoji: '🌡️', desde: 6, gen: () => pick([
    () => { const a = -ent(1, 9), b = ent(1, 12); return q('(' + a + ') + ' + b, a + b, cerca(a + b, 2, [1, 2, 2 * Math.abs(a)], true)); },
    () => { const a = -ent(1, 9), b = ent(1, 9); return q('(' + a + ') − ' + b, a - b, [a + b, -(a - b)].filter(v => v !== a - b).concat(cerca(a - b, 1, [1, 2], true)).slice(0, 2)); },
    () => { const a = -ent(2, 9), b = ent(2, 6); return q('(' + a + ') × ' + b, a * b, [-a * b, a * b + b]); }
  ])() },
  potencias: { nombre: 'Potencias y raíces', emoji: '🔺', desde: 7, gen: () => pick([
    () => { const b = ent(2, 9), e = b <= 5 ? ent(2, 3) : 2, r = Math.pow(b, e); return q(b + (e === 2 ? '²' : '³'), r, [b * e, r + b].filter(v => v !== r)); },
    () => { const r = ent(3, 12); return q('√' + (r * r), r, cerca(r, 2, [1, 2])); }
  ])() }
};

/* ---------- Ciencias naturales: [desde, hasta, pregunta, buena, malas] ---------- */
const CIE = {
  vida: { nombre: 'Seres vivos y cuerpo', emoji: '🌱', b: [
    [0, 2, '¿Con qué vemos?', '👀 Con los ojos', ['👃 Con la nariz', '👂 Con las orejas']], [0, 2, '¿Con qué oímos?', '👂 Con las orejas', ['👀 Con los ojos', '👄 Con la boca']],
    [0, 3, '¿Cuál nace de un huevo?', '🐔 La gallina', ['🐄 La vaca', '🐶 El perro']], [1, 3, '¿Cuántos sentidos tenemos?', 'Cinco', ['Tres', 'Siete']],
    [1, 4, '¿Qué come una vaca?', '🌿 Pasto', ['🍖 Carne', '🐟 Peces']], [2, 5, '¿Qué parte de la planta toma el agua?', 'La raíz', ['La flor', 'El fruto']],
    [2, 5, '¿Qué necesitan las plantas para hacer su alimento?', '☀️ Luz del sol', ['🌑 Oscuridad', '🧂 Sal']], [2, 6, '¿Qué órgano bombea la sangre?', '❤️ El corazón', ['🫁 Los pulmones', 'El estómago']],
    [2, 6, '¿Con qué respiramos?', '🫁 Los pulmones', ['El hígado', 'Los riñones']], [3, 6, '¿Cuál es un mamífero?', '🐋 La ballena', ['🦈 El tiburón', '🐙 El pulpo']],
    [3, 6, '¿Cuál es un anfibio?', '🐸 La rana', ['🦎 La lagartija', '🕊️ La paloma']], [3, 6, '¿Cuál es un insecto (tiene 6 patas)?', '🦋 La mariposa', ['🕷️ La araña', '🐌 El caracol']],
    [3, 7, '¿Cuál es un animal herbívoro?', '🐄 La vaca', ['🦁 El león', '🦈 El tiburón']], [4, 7, '¿Cómo se llama el proceso con el que la planta hace su alimento?', 'Fotosíntesis', ['Digestión', 'Evaporación']],
    [4, 7, 'Los huesos forman el sistema…', 'Óseo', ['Digestivo', 'Nervioso']], [5, 8, 'En una cadena alimenticia, las plantas son…', 'Productores', ['Carnívoros', 'Descomponedores']],
    [5, 9, '¿Cuál es la unidad básica de los seres vivos?', 'La célula', ['El átomo', 'El órgano']], [6, 9, '¿Qué parte de la célula guarda el ADN?', 'El núcleo', ['La vacuola', 'La membrana']],
    [6, 9, '¿Qué tienen las células de las plantas y no las de los animales?', 'Cloroplastos', ['Núcleo', 'Membrana']], [7, 9, '¿Qué organelo da la energía a la célula?', 'La mitocondria', ['El ribosoma', 'El núcleo']],
    [7, 9, '¿Qué sistema lleva los mensajes del cerebro?', 'El nervioso', ['El digestivo', 'El óseo']], [8, 9, '¿Quién propuso la evolución por selección natural?', 'Charles Darwin', ['Isaac Newton', 'Marie Curie']]
  ] },
  materia: { nombre: 'Materia y energía', emoji: '⚡', b: [
    [0, 3, '¿Qué nos da luz y calor de día?', '☀️ El Sol', ['🌙 La Luna', '⭐ Una estrella lejana']], [1, 4, '¿Qué atrae un imán?', '🔩 El hierro', ['📄 El papel', '🪵 La madera']],
    [2, 5, 'El hielo es agua en estado…', '🧊 Sólido', ['💧 Líquido', '♨️ Gaseoso']], [2, 5, 'El vapor es agua en estado…', '♨️ Gaseoso', ['🧊 Sólido', '💧 Líquido']],
    [3, 6, '¿Qué material deja pasar la luz?', '🪟 El vidrio', ['🧱 El ladrillo', '🪵 La madera']], [4, 7, '¿A cuántos grados hierve el agua (al nivel del mar)?', '100 °C', ['50 °C', '0 °C']],
    [4, 7, '¿A cuántos grados se congela el agua?', '0 °C', ['100 °C', '20 °C']], [4, 7, '¿Qué gas necesitamos para vivir?', 'Oxígeno', ['Dióxido de carbono', 'Helio']],
    [5, 8, '¿Qué material conduce bien la electricidad?', 'El cobre', ['El plástico', 'La madera']], [5, 8, 'La energía del viento se llama…', 'Eólica', ['Solar', 'Hidráulica']],
    [6, 9, '¿Cómo se separa la arena del agua?', 'Filtrando', ['Imantando', 'Congelando']], [7, 9, '¿Cuál es la fórmula del agua?', 'H₂O', ['CO₂', 'O₂']],
    [8, 9, '¿Qué partícula tiene carga negativa?', 'El electrón', ['El protón', 'El neutrón']], [8, 9, '¿En qué se mide la fuerza?', 'Newtons', ['Metros', 'Litros']],
    [8, 9, 'La velocidad es la distancia dividida entre…', 'El tiempo', ['La masa', 'La fuerza']], [9, 9, '¿Cuál es el símbolo del sodio?', 'Na', ['So', 'S']],
    [9, 9, 'Una sustancia con pH menor que 7 es…', 'Ácida', ['Básica', 'Neutra']]
  ] },
  tierra: { nombre: 'La Tierra y el universo', emoji: '🪐', b: [
    [0, 2, '¿En qué planeta vivimos?', '🌍 La Tierra', ['🔴 Marte', '🪐 Saturno']], [1, 4, '¿Qué gira alrededor de la Tierra?', '🌙 La Luna', ['☀️ El Sol', '⭐ Las estrellas']],
    [1, 4, '¿Cuál es la estrella más cercana?', '☀️ El Sol', ['🌙 La Luna', '🪐 Júpiter']], [3, 6, '¿Cuál es el planeta más grande?', 'Júpiter', ['Marte', 'Mercurio']],
    [3, 6, '¿Qué planeta llaman «el planeta rojo»?', 'Marte', ['Venus', 'Neptuno']], [3, 6, 'La Tierra gira sobre sí misma en…', 'Un día', ['Un mes', 'Un año']],
    [4, 7, 'La Tierra da la vuelta al Sol en…', 'Un año', ['Un día', 'Una semana']], [4, 7, '¿Cuántos planetas tiene el sistema solar?', 'Ocho', ['Nueve', 'Siete']],
    [3, 6, '¿Qué sale de un volcán?', '🌋 Lava', ['❄️ Nieve', '🌊 Agua de mar']], [4, 7, 'El agua del mar que sube como vapor es la…', 'Evaporación', ['Precipitación', 'Condensación']],
    [4, 7, 'La lluvia, en el ciclo del agua, es la…', 'Precipitación', ['Evaporación', 'Filtración']], [5, 8, 'La capa de gases que rodea la Tierra es la…', 'Atmósfera', ['Corteza', 'Litosfera']],
    [5, 8, '¿Por qué brilla la Luna?', 'Refleja la luz del Sol', ['Tiene fuego', 'Es una estrella']], [6, 9, '¿Qué fuerza nos mantiene en el suelo?', 'La gravedad', ['El magnetismo', 'La fricción']],
    [7, 9, '¿Cómo se llaman las grandes piezas de la corteza terrestre?', 'Placas tectónicas', ['Meteoritos', 'Glaciares']]
  ] }
};
/* ---------- Ciencias sociales ---------- */
const CAPITALES = [['Amazonas', 'Leticia'], ['Antioquia', 'Medellín'], ['Atlántico', 'Barranquilla'], ['Bolívar', 'Cartagena'], ['Boyacá', 'Tunja'], ['Caldas', 'Manizales'],
  ['Caquetá', 'Florencia'], ['Casanare', 'Yopal'], ['Cauca', 'Popayán'], ['Cesar', 'Valledupar'], ['Chocó', 'Quibdó'], ['Córdoba', 'Montería'], ['Cundinamarca', 'Bogotá'],
  ['Guainía', 'Inírida'], ['Huila', 'Neiva'], ['La Guajira', 'Riohacha'], ['Magdalena', 'Santa Marta'], ['Meta', 'Villavicencio'], ['Nariño', 'Pasto'], ['Norte de Santander', 'Cúcuta'],
  ['Putumayo', 'Mocoa'], ['Quindío', 'Armenia'], ['Risaralda', 'Pereira'], ['Santander', 'Bucaramanga'], ['Sucre', 'Sincelejo'], ['Tolima', 'Ibagué'], ['Valle del Cauca', 'Cali'],
  ['Vaupés', 'Mitú'], ['Vichada', 'Puerto Carreño']];
const SOC = {
  colombia: { nombre: 'Regiones y relieve', emoji: '⛰️', b: [
    [0, 4, '¿Cuál es la capital de Colombia?', 'Bogotá', ['Medellín', 'Cali']], [2, 6, '¿En qué continente está Colombia?', 'América del Sur', ['Europa', 'África']],
    [3, 7, '¿Cuántas regiones naturales tiene Colombia?', 'Seis', ['Cuatro', 'Ocho']], [3, 7, '¿En qué región está la Sierra Nevada de Santa Marta?', 'Caribe', ['Pacífica', 'Orinoquía']],
    [3, 7, '¿Qué región tiene llanos y mucho ganado?', 'Orinoquía', ['Insular', 'Pacífica']], [3, 7, 'San Andrés y Providencia son de la región…', 'Insular', ['Andina', 'Amazonía']],
    [3, 7, '¿Qué región es una gran selva al sur?', 'Amazonía', ['Caribe', 'Andina']], [4, 8, '¿Cuántas cordilleras forman los Andes en Colombia?', 'Tres', ['Dos', 'Cinco']],
    [4, 8, '¿Qué río recorre Colombia de sur a norte hasta el Caribe?', 'El Magdalena', ['El Amazonas', 'El Atrato']], [4, 8, '¿En qué departamento está el cañón del Chicamocha?', 'Santander', ['Nariño', 'La Guajira']],
    [4, 8, '¿En qué departamento está el desierto de la Tatacoa?', 'Huila', ['Meta', 'Chocó']], [4, 8, '¿Qué océano baña la región Pacífica?', 'El Pacífico', ['El Atlántico', 'El Índico']],
    [5, 9, '¿Qué pueblo indígena vive en La Guajira?', 'Los wayuu', ['Los nasa', 'Los muiscas']], [5, 9, '¿Qué ecosistema de alta montaña da agua a las ciudades?', 'El páramo', ['El manglar', 'El desierto']]
  ] },
  capitales: { nombre: 'Capitales', emoji: '🏙️', desde: 4, gen: () => { const [d, c] = pick(CAPITALES); return q('¿Cuál es la capital de ' + d + '?', c, barajar(CAPITALES.filter(x => x[1] !== c)).slice(0, 2).map(x => x[1])); } },
  historia: { nombre: 'Historia y símbolos', emoji: '📜', b: [
    [1, 5, '¿De qué colores es la bandera de Colombia?', '🟡🔵🔴 Amarillo, azul y rojo', ['🟢⚪🔴 Verde, blanco y rojo', '🔵⚪ Azul y blanco']], [1, 5, '¿Cuál es el ave nacional de Colombia?', 'El cóndor andino', ['El colibrí', 'La paloma']],
    [2, 6, '¿Cuál es el árbol nacional?', 'La palma de cera', ['La ceiba', 'El guayacán']], [2, 6, '¿Cuál es la flor nacional?', 'La orquídea', ['La rosa', 'El girasol']],
    [2, 6, '¿Cómo se llama la moneda de Colombia?', 'El peso', ['El dólar', 'El euro']], [3, 7, '¿Qué se celebra el 20 de julio?', 'El Grito de Independencia', ['La Navidad', 'El Día del Trabajo']],
    [4, 8, '¿Quién fue llamado «el Libertador»?', 'Simón Bolívar', ['Cristóbal Colón', 'Antonio Nariño']], [4, 8, '¿En qué año fue la Batalla de Boyacá?', '1819', ['1810', '1492']],
    [4, 8, '¿En qué año llegó Colón a América?', '1492', ['1819', '1991']], [5, 9, 'La leyenda de El Dorado nació con los…', 'Muiscas', ['Incas', 'Aztecas']],
    [5, 9, '¿De qué año es la Constitución de Colombia?', '1991', ['1886', '1810']], [6, 9, '¿Cuántas ramas tiene el poder público?', 'Tres', ['Dos', 'Cinco']],
    [6, 9, '¿Qué rama hace las leyes?', 'La legislativa', ['La ejecutiva', 'La judicial']], [6, 9, 'El presidente está en la rama…', 'Ejecutiva', ['Legislativa', 'Judicial']],
    [7, 9, '¿Qué sirve para proteger rápido un derecho fundamental?', 'La acción de tutela', ['El impuesto', 'El pasaporte']], [3, 7, '¿Qué derecho tiene todo niño?', 'A la educación', ['A manejar carro', 'A votar']]
  ] }
};

const MATERIAS = {
  ingles: { nombre: 'Inglés', emoji: '🗣️', desde: 0 },
  matematicas: { nombre: 'Matemáticas', emoji: '🔢', desde: 0 },
  ciencias: { nombre: 'Ciencias', emoji: '🔬', desde: 0 },
  sociales: { nombre: 'Sociales', emoji: '🗺️', desde: 0 }
};
const deBanco = (b, g) => b.filter(x => g >= x[0] && g <= x[1] + 1);
/** Los temas de una materia para un grado: [{id, nombre, emoji}] (el primero es «Mezcla»). */
function temas(m, g) {
  let t = [];
  if (m === 'ingles') {
    t = Object.keys(VOC).filter(k => g >= VOC[k].desde).map(k => ({ id: k, nombre: VOC[k].nombre, emoji: VOC[k].emoji }));
    if (g >= 5) t.push({ id: 'frases', nombre: 'Frases', emoji: '💬' }, { id: 'gramatica', nombre: 'Gramática', emoji: '✏️' });
  } else if (m === 'matematicas') t = Object.keys(MAT).filter(k => g >= MAT[k].desde && g <= (MAT[k].hasta == null ? 99 : MAT[k].hasta)).map(k => ({ id: k, nombre: MAT[k].nombre, emoji: MAT[k].emoji }));
  else {
    const B = m === 'ciencias' ? CIE : SOC;
    t = Object.keys(B).filter(k => (B[k].b ? deBanco(B[k].b, g).length >= 3 : g >= B[k].desde)).map(k => ({ id: k, nombre: B[k].nombre, emoji: B[k].emoji }));
  }
  return t.length > 1 ? [{ id: 'mezcla', nombre: 'Mezcla', emoji: '🎲' }].concat(t) : t;
}
/** n tramos de una materia, un tema (o «mezcla») y un grado. */
function generar(m, tema, g, n, op) {
  op = Object.assign({ tiene: () => false, modo: 'normal' }, op || {});
  const ts = temas(m, g).filter(t => t.id !== 'mezcla').map(t => t.id);
  const elegidos = tema && tema !== 'mezcla' && ts.includes(tema) ? [tema] : ts;
  if (!elegidos.length) return [];
  if (m === 'ingles') {
    const vocab = elegidos.filter(k => VOC[k]), out = [];
    const ws = [].concat(...vocab.map(k => VOC[k].w)).map(w => ({ en: w[0], es: w[1], emoji: w[2] }));
    const nf = elegidos.includes('frases') ? (vocab.length ? Math.round(n / 4) : n) : 0, ngr = elegidos.includes('gramatica') ? (vocab.length || nf ? Math.round(n / 4) : n - nf) : 0;
    if (nf) out.push(...deFrases(g, nf, op));
    if (ngr) out.push(...deGramatica(ngr));
    if (ws.length) out.push(...dePalabras(barajar(ws).slice(0, Math.max(6, n)), n - out.length, { tiene: op.tiene, modo: op.modo, emoji: g <= 5 }).slice(0, n - out.length));
    return barajar(out).slice(0, n);
  }
  const out = [], vistas = new Set();
  for (let k = 0; out.length < n && k < n * 12; k++) {
    const t = elegidos[k % elegidos.length];
    let x;
    if (m === 'matematicas') x = MAT[t].gen(g);
    else {
      const T = (m === 'ciencias' ? CIE : SOC)[t];
      if (T.gen) x = T.gen(g);
      else { const c = pick(deBanco(T.b, g)); x = c && q(c[2], c[3], c[4]); }
    }
    if (!x || vistas.has(x.p) || x.opciones.length < 2) continue;
    vistas.add(x.p); out.push(x);
  }
  return barajar(out);
}

window.RallyContenido = { MATERIAS, temas, generar, dePalabras };
})();
