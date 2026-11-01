/* Mi Finca — el contenido propio de la sala: las preguntas de dinero (generadas según el grado), las de ciencias (plantas,
   cuidados de los animales y cadenas de alimento) y las palabras de inglés de la finca, de Transición (0) a 5.º.
   También el mapa de palabras inglesas a lo que hay en la finca («hen» → la gallina), que usa el modo lección.
   window.FincaContenido = { preguntas(materia, grado, n), palabras(grado), entidad(en), pesos(n), venta(canasta, grado) } */
(function () {
'use strict';
const az = n => Math.floor(Math.random() * n);
const pick = a => a[az(a.length)];
const barajar = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = az(i + 1); [a[i], a[j]] = [a[j], a[i]]; } return a; };
/** $2.500 (el punto de los miles, como en Colombia) */
const pesos = n => '$' + String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, '.');

// Lo que da la finca y a cuánto se vende en el mercado del pueblo.
const PRODUCTOS = {
  huevo: { emoji: '🥚', uno: 'huevo', varios: 'huevos', precio: 500, en: 'egg' },
  leche: { emoji: '🥛', uno: 'botella de leche', varios: 'botellas de leche', precio: 2000, en: 'milk', f: true },
  lana: { emoji: '🧶', uno: 'ovillo de lana', varios: 'ovillos de lana', precio: 3000, en: 'wool' },
  maiz: { emoji: '🌽', uno: 'mazorca', varios: 'mazorcas', precio: 1000, en: 'corn', f: true },
  mango: { emoji: '🥭', uno: 'mango', varios: 'mangos', precio: 800, en: 'mango' }
};
const nombreDe = (k, n) => (n === 1 ? PRODUCTOS[k].uno : PRODUCTOS[k].varios);
const cadaUno = k => (PRODUCTOS[k].f ? 'cada una' : 'cada uno');

// Opciones numéricas: la buena y dos (o tres) cercanas, distintas y positivas.
function opcionesNum(bien, cerca, fmt) {
  const set = new Set([bien]);
  const cand = barajar(cerca.filter(x => x > 0 && x !== bien));
  for (const c of cand) { if (set.size >= 3) break; set.add(c); }
  let k = 1; while (set.size < 3) { set.add(bien + k * (bien >= 100 ? 100 : 1)); k = -k + (k < 0 ? 1 : 0); }
  const ops = barajar([...set]);
  return { opciones: ops.map(fmt || String), correcta: ops.indexOf(bien) };
}

/* ---------- matemáticas: el dinero de la finca ---------- */
function preguntaDinero(g) {
  const p = pick(Object.keys(PRODUCTOS)), P = PRODUCTOS[p];
  if (g <= 0) { // Transición: contar
    const c = pick([['huevo', '¿Cuántos huevos hay?'], ['mango', '¿Cuántos mangos hay?'], ['maiz', '¿Cuántas mazorcas hay?']]);
    const n = 1 + az(5), e = PRODUCTOS[c[0]].emoji.repeat(n);
    return Object.assign({ p: c[1] + ' ' + e, por: 'Cuenta uno por uno: ' + e + ' son ' + n + '.' }, opcionesNum(n, [n - 1, n + 1, n + 2]));
  }
  if (g === 1) { // sumar y quitar hasta 10
    const a = 1 + az(5), b = 1 + az(4);
    if (Math.random() < 0.6) return Object.assign({ p: 'Tienes ' + a + ' ' + P.emoji + ' y recoges ' + b + ' más. ¿Cuántos tienes?', por: a + ' + ' + b + ' = ' + (a + b) + '.' }, opcionesNum(a + b, [a + b - 1, a + b + 1, a]));
    const t = a + b;
    return Object.assign({ p: 'Tienes ' + t + ' ' + P.emoji + ' y vendes ' + b + '. ¿Cuántos te quedan?', por: t + ' − ' + b + ' = ' + a + '.' }, opcionesNum(a, [a + 1, a - 1, t]));
  }
  if (g === 2) { // sumar monedas y precios pequeños
    const m = [50, 100, 200, 500], a = pick(m), b = pick(m), c = pick([100, 200]);
    if (Math.random() < 0.5) {
      const s = a + b + c;
      return Object.assign({ p: 'Te pagan con monedas de ' + pesos(a) + ', ' + pesos(b) + ' y ' + pesos(c) + '. ¿Cuánto te pagaron?', por: pesos(a) + ' + ' + pesos(b) + ' + ' + pesos(c) + ' = ' + pesos(s) + '.' }, opcionesNum(s, [s - 100, s + 100, a + b], pesos));
    }
    const x = 100 * (2 + az(5)), y = 100 * (1 + az(4));
    return Object.assign({ p: 'Un huevo cuesta ' + pesos(x) + ' y un mango ' + pesos(y) + '. ¿Cuánto pagas por los dos?', por: pesos(x) + ' + ' + pesos(y) + ' = ' + pesos(x + y) + '.' }, opcionesNum(x + y, [x + y - 100, x + y + 100, Math.abs(x - y)], pesos));
  }
  if (g === 3) { // multiplicar precios y el cambio
    const r = Math.random();
    if (r < 0.5) {
      const n = 2 + az(5), pr = pick([200, 500, 1000, 300]), t = n * pr;
      return Object.assign({ p: 'Vendes ' + n + ' ' + nombreDe(p, n) + ' a ' + pesos(pr) + ' ' + cadaUno(p) + '. ¿Cuánto recibes?', por: n + ' × ' + pesos(pr) + ' = ' + pesos(t) + '.' }, opcionesNum(t, [t - pr, t + pr, t + 2 * pr], pesos));
    }
    const pr = 500 * (2 + az(7)), pago = pr <= 2000 ? 2000 : pr <= 5000 ? 5000 : 10000, d = pago - pr;
    return Object.assign({ p: 'Un queso cuesta ' + pesos(pr) + ' y pagas con un billete de ' + pesos(pago) + '. ¿Cuánto te devuelven?', por: pesos(pago) + ' − ' + pesos(pr) + ' = ' + pesos(d) + '.' }, opcionesNum(d, [d + 500, d - 500, pr], pesos));
  }
  if (g === 4) { // multiplicar con miles y repartir
    const r = Math.random();
    if (r < 0.4) {
      const n = 11 + az(15), pr = pick([450, 500, 600, 800]), t = n * pr;
      return Object.assign({ p: 'Vendes ' + n + ' ' + nombreDe(p, n) + ' a ' + pesos(pr) + '. ¿Cuánto recibes?', por: n + ' × ' + pesos(pr) + ' = ' + pesos(t) + '.' }, opcionesNum(t, [t - pr, t + pr, t + 1000, t - 1000], pesos));
    }
    if (r < 0.7) {
      const k = pick([2, 3, 4, 5]), c = 1000 * (1 + az(6)), t = k * c;
      return Object.assign({ p: 'Repartes ' + pesos(t) + ' de la venta entre ' + k + ' hermanos, en partes iguales. ¿Cuánto le toca a cada uno?', por: pesos(t) + ' ÷ ' + k + ' = ' + pesos(c) + '.' }, opcionesNum(c, [c + 500, c - 500, c * 2], pesos));
    }
    const a = 1000 * (3 + az(8)), b = 500 * (1 + az(9)), pago = 20000, d = pago - a - b;
    return Object.assign({ p: 'Compras un bulto de maíz de ' + pesos(a) + ' y una pala de ' + pesos(b) + '. Pagas con ' + pesos(pago) + '. ¿Cuánto te devuelven?', por: pesos(a) + ' + ' + pesos(b) + ' = ' + pesos(a + b) + '; ' + pesos(pago) + ' − ' + pesos(a + b) + ' = ' + pesos(d) + '.' }, opcionesNum(d, [d + 500, d - 1000, a + b], pesos));
  }
  // 5.º: fracciones de una cantidad, docenas, la mitad del precio y la ganancia
  const r = Math.random();
  if (r < 0.3) {
    const doc = 2 + az(4), pr = pick([5000, 6000, 7000]), t = doc * pr;
    return Object.assign({ p: 'Una docena de huevos vale ' + pesos(pr) + '. ¿Cuánto valen ' + doc * 12 + ' huevos?', por: doc * 12 + ' huevos son ' + doc + ' docenas: ' + doc + ' × ' + pesos(pr) + ' = ' + pesos(t) + '.' }, opcionesNum(t, [t - pr, t + pr, pr * 12], pesos));
  }
  if (r < 0.55) {
    const den = pick([2, 3, 4, 5]), num = 1 + az(den - 1), tot = den * (4 + az(6)), x = tot / den * num;
    return Object.assign({ p: 'De ' + tot + ' mangos vendes ' + num + '/' + den + '. ¿Cuántos mangos vendes?', por: tot + ' ÷ ' + den + ' = ' + tot / den + '; × ' + num + ' = ' + x + '.' }, opcionesNum(x, [x + num, tot / den, x + 2]));
  }
  if (r < 0.8) {
    const pr = 2000 * (2 + az(8)), m = pr / 2;
    return Object.assign({ p: 'El saco de abono cuesta ' + pesos(pr) + ' y hoy está a mitad de precio. ¿Cuánto pagas?', por: 'La mitad de ' + pesos(pr) + ' es ' + pesos(m) + '.' }, opcionesNum(m, [m + 1000, pr - 1000, m - 1000], pesos));
  }
  const n = 10 + az(11), costo = 300, venta = pick([500, 600, 700]), g2 = n * (venta - costo);
  return Object.assign({ p: 'Cada huevo te cuesta ' + pesos(costo) + ' de comida y lo vendes a ' + pesos(venta) + '. Si vendes ' + n + ', ¿cuánto ganas?', por: 'Ganas ' + pesos(venta - costo) + ' por huevo: ' + n + ' × ' + pesos(venta - costo) + ' = ' + pesos(g2) + '.' }, opcionesNum(g2, [n * venta, g2 + 1000, g2 - 1000], pesos));
}

/** La pregunta del comprador al vender lo de la canasta (en la sala, con Matemáticas). canasta: {huevo: 3, …} */
function venta(canasta, g) {
  const ks = Object.keys(canasta).filter(k => canasta[k] > 0 && PRODUCTOS[k]);
  if (!ks.length) return null;
  const k = pick(ks), n = canasta[k], P = PRODUCTOS[k];
  if (g <= 1) {
    const e = P.emoji.repeat(Math.min(n, 10));
    return Object.assign({ p: '¿Cuántos ' + P.emoji + ' llevas al mercado? ' + e, por: 'Cuenta: son ' + n + '.' }, opcionesNum(n, [n - 1, n + 1, n + 2]));
  }
  const total = n * P.precio;
  if (g === 2 && n >= 2 && n <= 3) return Object.assign({ p: 'Vendes ' + n + ' ' + nombreDe(k, n) + ' a ' + pesos(P.precio) + ' ' + cadaUno(k) + '. ¿Cuánto es?', por: Array(n).fill(pesos(P.precio)).join(' + ') + ' = ' + pesos(total) + '.' }, opcionesNum(total, [total - P.precio, total + P.precio, P.precio], pesos));
  if (g >= 4 && total < 10000) {
    const pago = total <= 5000 ? 10000 : 20000;
    return Object.assign({ p: 'El comprador lleva ' + n + ' ' + nombreDe(k, n) + ' a ' + pesos(P.precio) + ' y paga con ' + pesos(pago) + '. ¿Cuánto le devuelves?', por: n + ' × ' + pesos(P.precio) + ' = ' + pesos(total) + '; ' + pesos(pago) + ' − ' + pesos(total) + ' = ' + pesos(pago - total) + '.' }, opcionesNum(pago - total, [pago - total + P.precio, pago - total - P.precio, total], pesos));
  }
  return Object.assign({ p: 'Vendes ' + n + ' ' + nombreDe(k, n) + ' a ' + pesos(P.precio) + ' ' + cadaUno(k) + '. ¿Cuánto recibes?', por: n + ' × ' + pesos(P.precio) + ' = ' + pesos(total) + '.' }, opcionesNum(total, [total - P.precio, total + P.precio, total + 1000], pesos));
}

/* ---------- ciencias: plantas, cuidados de los animales y cadenas de alimento ---------- */
// [grado mínimo, grado máximo, pregunta, buena, malas, porqué]
const CIENCIAS = [
  [0, 1, '¿Qué nos da la vaca?', '🥛 Leche', ['🥚 Huevos', '🧶 Lana'], 'La vaca da leche: con ella alimenta a su ternero.'],
  [0, 1, '¿Qué nos da la gallina?', '🥚 Huevos', ['🥛 Leche', '🍯 Miel'], 'La gallina pone huevos.'],
  [0, 1, '¿Qué nos da la oveja?', '🧶 Lana', ['🥚 Huevos', '🌽 Maíz'], 'La lana de la oveja se corta y con ella se teje.'],
  [0, 2, '¿Qué necesita la planta para crecer?', '💧 Agua', ['🍬 Dulces', '📺 Televisión'], 'Las plantas necesitan agua, luz y tierra.'],
  [0, 1, '¿Cuál es el bebé de la gallina?', '🐥 Pollito', ['🐷 Lechón', '🐑 Cordero'], 'De la gallina nace el pollito.'],
  [0, 2, '¿Qué come la vaca?', '🌾 Pasto', ['🍖 Carne', '🍕 Pizza'], 'La vaca come pasto: es herbívora.'],
  [0, 1, '¿Dónde duermen las gallinas?', '🛖 Gallinero', ['🌊 Río', '🌳 Copa del árbol'], 'Las gallinas duermen en el gallinero, protegidas.'],
  [0, 2, '¿Qué fruta da el árbol de mango?', '🥭 Mangos', ['🍎 Manzanas', '🍌 Bananos'], 'El árbol de mango da mangos.'],
  [1, 3, '¿De dónde sale una planta de maíz?', '🌰 Una semilla', ['🥚 Un huevo', '🪨 Una piedra'], 'La planta nace de una semilla sembrada en la tierra.'],
  [1, 3, 'Una gallina está triste y no come. ¿Qué haces?', '🩺 Llamo a la veterinaria', ['🙈 Nada', '🍬 Le doy dulces'], 'Un animal enfermo necesita a la veterinaria.'],
  [1, 3, '¿Qué parte de la planta toma el agua de la tierra?', '🌱 La raíz', ['🌸 La flor', '🍃 La hoja'], 'Las raíces toman el agua y la llevan a toda la planta.'],
  [1, 3, '¿Cómo nace un pollito?', '🥚 De un huevo', ['🤰 De la barriga', '🌰 De una semilla'], 'El pollito crece dentro del huevo hasta que lo rompe.'],
  [2, 4, '¿Qué orden sigue la vida del maíz?', '🌰 → 🌱 → 🌽', ['🌽 → 🌱 → 🌰', '🌱 → 🌰 → 🌽'], 'Semilla, planta y mazorca: el ciclo de vida de la planta.'],
  [2, 4, '¿Qué animal es herbívoro (come sólo plantas)?', '🐄 La vaca', ['🦁 El león', '🦅 El águila'], 'La vaca come plantas; el león y el águila comen carne.'],
  [2, 4, 'La vaca alimenta a su ternero con leche. Por eso es un…', 'Mamífero', ['Ave', 'Reptil'], 'Los mamíferos toman leche de su mamá.'],
  [2, 4, 'La gallina tiene plumas, pico y pone huevos. Es un…', 'Ave', ['Mamífero', 'Pez'], 'Plumas, pico y huevos: es un ave.'],
  [2, 5, '¿Por qué hay que darles agua limpia a los animales?', 'Para que no se enfermen', ['Para que se ensucien', 'No hace falta'], 'El agua sucia trae enfermedades.'],
  [2, 5, '¿Qué necesita la semilla para germinar?', 'Agua, aire y calor', ['Sólo oscuridad', 'Sal'], 'Con agua, aire y temperatura buena la semilla germina.'],
  [3, 5, 'Las plantas fabrican su alimento con…', '☀️ La luz del sol', ['🌙 La luz de la luna', '🔥 El fuego'], 'Es la fotosíntesis: usan la luz del sol, el agua y el aire.'],
  [3, 5, 'En la cadena maíz → gallina → zorro, el maíz es…', 'El productor', ['El consumidor', 'El descomponedor'], 'Las plantas producen su alimento: son los productores.'],
  [3, 5, 'En la cadena pasto → vaca → persona, la vaca es…', 'Consumidor primario', ['Productor', 'Descomponedor'], 'Come al productor (el pasto): es consumidora primaria.'],
  [3, 5, '¿Por qué el abono ayuda a las plantas?', 'Le da nutrientes a la tierra', ['Las pinta de verde', 'Espanta la lluvia'], 'El abono devuelve a la tierra lo que la planta necesita.'],
  [3, 5, '¿Quién convierte el estiércol y las hojas en abono?', '🍄 Hongos y bacterias', ['🐄 Las vacas', '☀️ El sol'], 'Los descomponedores (hongos y bacterias) hacen el abono.'],
  [3, 5, '¿Qué hacen las abejas en las flores del mango?', 'Llevan el polen', ['Riegan las flores', 'Cortan las hojas'], 'Polinizan: llevan polen de flor en flor y así hay fruto.'],
  [4, 5, '¿Para qué se vacuna a las vacas?', 'Para protegerlas de enfermedades', ['Para que den más lana', 'Para que vuelen'], 'La vacuna prepara su cuerpo contra la enfermedad.'],
  [4, 5, 'Si en la finca desaparecen las culebras, ¿qué pasa con los ratones?', 'Aumentan', ['Desaparecen también', 'No cambia nada'], 'Sin quien se los coma, los ratones se multiplican: la cadena se desequilibra.'],
  [4, 5, '¿Qué gas sueltan las plantas al hacer la fotosíntesis?', 'Oxígeno', ['Humo', 'Gas de la estufa'], 'Las plantas sueltan el oxígeno que respiramos.'],
  [4, 5, 'Llovió muy poco este mes. ¿Qué haces con el maíz?', '💧 Riego con cuidado', ['🔥 Lo quemo', '❄️ Lo congelo'], 'Sin lluvia, el riego le da el agua que necesita.']
];
function preguntaCiencias(g, usadas) {
  const cand = CIENCIAS.filter(c => g >= c[0] && g <= c[1] && !usadas.has(c[2]));
  const c = cand.length ? pick(cand) : pick(CIENCIAS.filter(c2 => g >= c2[0] && g <= c2[1]));
  usadas.add(c[2]);
  const ops = barajar([c[3]].concat(c[4]));
  return { p: c[2], opciones: ops, correcta: ops.indexOf(c[3]), por: c[5] };
}

/* ---------- inglés: la finca ---------- */
// [grado desde el que sale, en, es, emoji]
const INGLES = [
  [0, 'cow', 'vaca', '🐄'], [0, 'hen', 'gallina', '🐔'], [0, 'pig', 'cerdo', '🐖'], [0, 'sheep', 'oveja', '🐑'], [0, 'duck', 'pato', '🦆'], [0, 'horse', 'caballo', '🐴'],
  [1, 'chick', 'pollito', '🐥'], [1, 'dog', 'perro', '🐕'], [1, 'goat', 'cabra', '🐐'], [1, 'donkey', 'burro', '🫏'],
  [2, 'corn', 'maíz', '🌽'], [2, 'mango', 'mango', '🥭'], [2, 'egg', 'huevo', '🥚'], [2, 'milk', 'leche', '🥛'], [2, 'rooster', 'gallo', '🐓'],
  [3, 'feed', 'dar de comer', '🌾'], [3, 'water', 'regar', '💧'], [3, 'harvest', 'cosechar', '🧺'], [3, 'farmer', 'granjero', '🧑‍🌾'], [3, 'rabbit', 'conejo', '🐇'],
  [4, 'bull', 'toro', '🐂'], [4, 'market', 'mercado', '🏪'], [4, 'plant', 'sembrar', '🌱'], [4, 'banana', 'banano', '🍌'], [4, 'cat', 'gato', '🐈']
];
function palabras(g) {
  const desde = g >= 3 ? 2 : 0; // en 3.º a 5.º, lo nuevo pesa más
  const todas = INGLES.filter(w => w[0] <= g), nuevas = todas.filter(w => w[0] >= desde);
  return barajar(nuevas.length >= 6 ? nuevas : todas).concat(barajar(todas)).filter((w, i, a) => a.indexOf(w) === i).map(w => ({ en: w[1], es: w[2], emoji: w[3] }));
}

/* Lo que es cada palabra inglesa en la finca: un animal o una cosa que se toca (id del mundo), un tipo (cualquier
   parcela, cualquier animal) o nada (null: va de pedido al mercado). */
const ENTIDAD = {
  cow: 'vaca', cows: 'vaca', calf: 'vaca', hen: 'gallina', hens: 'gallina', chicken: 'gallina', chickens: 'gallina', rooster: 'gallo', chick: 'pollito', chicks: 'pollito',
  pig: 'cerdo', pigs: 'cerdo', sheep: 'oveja', lamb: 'cordero', horse: 'caballo', donkey: 'burro', duck: 'pato', ducks: 'pato', goat: 'cabra', dog: 'perro',
  cat: 'gato', rabbit: 'conejo', bull: 'toro', ox: 'buey', corn: 'maiz', mango: 'mango', mangoes: 'mango', egg: 'gallina', eggs: 'gallina', milk: 'vaca', wool: 'oveja',
  farmer: 'granjero', market: 'mercado', stable: 'establo', barn: 'establo', banana: 'banano', bananas: 'banano',
  feed: '@animal', water: '@parcela', plant: '@parcela', harvest: '@parcela', sell: 'mercado', buy: 'mercado'
};
const entidad = en => { const k = String(en || '').trim().toLowerCase().replace(/^(the|a|an)\s+/, ''); return ENTIDAD[k] || null; };

/** n preguntas de la materia para un día. materia: dinero | ciencias */
function preguntas(materia, g, n, usadas) {
  usadas = usadas || new Set();
  const out = [];
  for (let i = 0; i < n * 3 && out.length < n; i++) {
    const q = materia === 'ciencias' ? preguntaCiencias(g, usadas) : preguntaDinero(g);
    if (!out.some(o => o.p === q.p)) out.push(q);
  }
  return out;
}

window.FincaContenido = { preguntas, palabras, entidad, pesos, venta, PRODUCTOS };
})();
