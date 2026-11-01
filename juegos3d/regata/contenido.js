/* Regata del Viento — lo que se pregunta en la sala (sin lección). Usa el banco del Rally (../rally/contenido.js:
   inglés, matemáticas, ciencias y sociales por grado) y le suma un tema de navegar en cada materia:
   - Inglés: «El mar» (sea, island, boat, fish…) y «Direcciones» (east, west, left, right… y «Where does the wind come from?»).
   - Matemáticas: «Ángulos y rumbos» (cuartos de vuelta, grados entre puntos cardinales, giros, ángulos agudos y obtusos).
   - Ciencias: «El viento» (qué lo mueve, la vela, la energía eólica, la veleta).
   - Sociales: «Mares y puertos» (Caribe y Pacífico, los puertos de Colombia, los puntos cardinales del mapa).
   Una pregunta con `viento: rumbo` hace que el viento sople desde ahí en ese tramo (y la flecha no lo dice escrito):
   se contesta leyendo el viento. window.RegataContenido = { MATERIAS, temas, generar, dePalabras, nombreDir, vientoDe, esDirEn } */
(function () {
'use strict';
const RC = window.RallyContenido || { MATERIAS: { ingles: { nombre: 'Inglés', emoji: '🗣️' } }, temas: () => [], generar: () => [], dePalabras: () => [] };
const barajar = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const pick = a => a[Math.floor(Math.random() * a.length)];
const ent = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
function q(p, buena, malas, extra) {
  const ops = barajar([String(buena)].concat(malas.map(String)).filter((o, i, a) => a.indexOf(o) === i));
  return Object.assign({ p, opciones: ops, correcta: ops.indexOf(String(buena)) }, extra || {});
}

const DIR_ES = ['norte', 'noreste', 'este', 'sureste', 'sur', 'suroeste', 'oeste', 'noroeste'];
const DIR_EN = ['north', 'northeast', 'east', 'southeast', 'south', 'southwest', 'west', 'northwest'];
/** El nombre del rumbo (0 = norte, 90 = este), redondeado al octavo: «norte», «noreste»… (en: «north»…). */
const nombreDir = (b, en) => (en ? DIR_EN : DIR_ES)[Math.round((((b % 360) + 360) % 360) / 45) % 8];
const RUMBO = {}; DIR_ES.forEach((d, i) => { RUMBO[d] = i * 45; RUMBO[DIR_EN[i]] = i * 45; });
Object.assign(RUMBO, { oriente: 90, occidente: 270, 'nor-este': 45, nordeste: 45, 'sur-este': 135, sudeste: 135, sudoeste: 225, 'nor-oeste': 315 });
/** Si la pregunta es «¿de dónde viene el viento?» y la buena es un punto cardinal, su rumbo (si no, null). */
function vientoDe(qq) {
  if (!qq || !/\b(wind|viento)\b/i.test(qq.p || '')) return null;
  const t = String(qq.opciones[qq.correcta] || '').toLowerCase().replace(/[^a-záéíóúñ-]+/g, ' ').trim().split(/\s+/);
  for (const w of t) if (RUMBO[w] != null) return RUMBO[w];
  return null;
}

/* ---------- Inglés ---------- */
const MAR_EN = [['sea', 'mar', '🌊'], ['island', 'isla', '🏝️'], ['boat', 'bote', '⛵'], ['ship', 'barco', '🚢'], ['sail', 'vela', '⛵'], ['fish', 'pez', '🐟'], ['turtle', 'tortuga', '🐢'],
  ['crab', 'cangrejo', '🦀'], ['bird', 'pájaro', '🐦'], ['sun', 'sol', '☀️'], ['cloud', 'nube', '☁️'], ['rain', 'lluvia', '🌧️'], ['wind', 'viento', '🌬️'], ['storm', 'tormenta', '⛈️'],
  ['water', 'agua', '💧'], ['star', 'estrella', '⭐']];
const DIRS_EN = [['east', 'este', '➡️'], ['west', 'oeste', '⬅️'], ['north', 'norte', '⬆️'], ['south', 'sur', '⬇️'], ['left', 'izquierda', '👈'], ['right', 'derecha', '👉'], ['up', 'arriba', '🔼'],
  ['down', 'abajo', '🔽'], ['stop', 'para', '✋'], ['go', 'sigue', '🟢'], ['turn left', 'gira a la izquierda', '↩️'], ['turn right', 'gira a la derecha', '↪️'], ['fast', 'rápido', '🐇'], ['slow', 'lento', '🐢']];
const aW = l => l.map(w => ({ en: w[0], es: w[1], emoji: w[2] }));
// «Where does the wind come from?»: la flecha del juego lo muestra; se contesta en inglés
function vientoEn(grado) {
  const ocho = grado >= 6, b = ocho ? ent(0, 7) * 45 : ent(0, 3) * 90, buena = nombreDir(b, true);
  const malas = barajar(DIR_EN.filter((d, i) => d !== buena && (ocho || i % 2 === 0))).slice(0, 2);
  return q('🌬️ Where does the wind come from? Look at the arrow.', buena, malas, { viento: b, opEn: true });
}
function vientoEs(grado) {
  const ocho = grado >= 5, b = ocho ? ent(0, 7) * 45 : ent(0, 3) * 90, buena = nombreDir(b);
  const malas = barajar(DIR_ES.filter((d, i) => d !== buena && (ocho || i % 2 === 0))).slice(0, 2);
  return q('🌬️ ¿De dónde viene el viento ahora? Mira la flecha.', 'Del ' + buena, malas.map(m => 'Del ' + m), { viento: b });
}

/* ---------- Matemáticas: ángulos y rumbos ---------- */
function angulo(g) {
  const tipos = [
    () => q('¿Cuántos grados tiene un cuarto de vuelta?', '90°', ['45°', '180°']),
    () => q('¿Cuántos grados tiene media vuelta?', '180°', ['90°', '360°']),
    () => q('¿Cuántos grados tiene una vuelta entera?', '360°', ['180°', '100°']),
    () => { const i = ent(0, 3) * 2, d = pick([1, -1]), j = (i + 2 * d + 8) % 8; return q('Vas hacia el ' + DIR_ES[i] + ' y giras un cuarto de vuelta a la ' + (d > 0 ? 'derecha' : 'izquierda') + '. ¿Hacia dónde vas?', DIR_ES[j], [DIR_ES[(i + 4) % 8], DIR_ES[(i - 2 * d + 8) % 8]]); },
    () => { const i = ent(0, 3) * 2; return q('Vas hacia el ' + DIR_ES[i] + ' y das media vuelta. ¿Hacia dónde vas?', DIR_ES[(i + 4) % 8], [DIR_ES[(i + 2) % 8], DIR_ES[(i + 6) % 8]]); }
  ];
  if (g >= 4) tipos.push(
    () => { const a = pick([30, 45, 60, 80]); return q('Un ángulo de ' + a + '° es…', 'Agudo', ['Recto', 'Obtuso']); },
    () => { const a = pick([100, 120, 135, 150]); return q('Un ángulo de ' + a + '° es…', 'Obtuso', ['Agudo', 'Recto']); },
    () => q('¿Cuántos grados hay del norte al noreste?', '45°', ['90°', '30°']),
    () => { const n = pick([2, 3]); return q('El velero gira ' + n + ' cuartos de vuelta. ¿Cuántos grados giró?', (90 * n) + '°', [(90 * n + 90) + '°', (45 * n) + '°']); }
  );
  if (g >= 6) tipos.push(
    () => { const a = pick([20, 35, 40, 55, 65]); return q('¿Cuál es el complemento de ' + a + '°?', (90 - a) + '°', [(180 - a) + '°', (100 - a) + '°']); },
    () => { const a = pick([40, 75, 110, 125]); return q('¿Cuál es el suplemento de ' + a + '°?', (180 - a) + '°', [(90 + a > 180 ? 360 - a : 90 + a) + '°', (360 - a) + '°']); },
    () => { const r = pick([45, 90, 135, 225, 270, 315]); return q('El rumbo ' + r + '° (medido desde el norte, a la derecha) apunta al…', DIR_ES[r / 45], [DIR_ES[(r / 45 + 2) % 8], DIR_ES[(r / 45 + 5) % 8]]); },
    () => { const v = pick([8, 10, 12, 15]), h = pick([2, 3, 4]); return q('Un velero va a ' + v + ' kilómetros por hora. ¿Cuánto recorre en ' + h + ' horas?', (v * h) + ' km', [(v + h) + ' km', (v * h + v) + ' km']); }
  );
  return pick(tipos)();
}

/* ---------- Ciencias y sociales: [desde, hasta, pregunta, buena, malas] ---------- */
const VIENTO = [
  [0, 4, '¿Qué empuja al velero?', '🌬️ El viento', ['🔥 El fuego', '🧲 Un imán']], [0, 4, '¿Qué parte del velero atrapa el viento?', '⛵ La vela', ['⚓ El ancla', '🪑 La silla']],
  [1, 5, '¿Contra el viento, el velero avanza?', 'No: va en zigzag', ['Sí, más rápido', 'Sí, igual']], [2, 6, '¿Qué aparato muestra de dónde viene el viento?', 'La veleta', ['El termómetro', 'La balanza']],
  [3, 7, 'El viento es aire en…', 'Movimiento', ['Reposo', 'Hielo']], [3, 7, 'El viento se forma porque el Sol calienta…', 'El aire de forma desigual', ['Sólo el mar', 'La Luna']],
  [4, 8, 'La energía del viento se llama…', 'Eólica', ['Solar', 'Geotérmica']], [4, 8, '¿Qué aparato convierte el viento en electricidad?', 'El aerogenerador', ['El panel solar', 'La represa']],
  [4, 8, 'Junto al mar, de día la brisa sopla…', 'Del mar a la tierra', ['De la tierra al mar', 'Hacia arriba']], [5, 9, 'El aire caliente…', 'Sube', ['Baja', 'Se queda quieto']],
  [5, 9, '¿Con qué aparato se mide la velocidad del viento?', 'El anemómetro', ['El barómetro', 'El microscopio']], [6, 9, '¿Qué fuerza frena al velero en el agua?', 'La fricción', ['La gravedad de la Luna', 'El magnetismo']],
  [6, 9, '¿Por qué flota el velero?', 'El agua lo empuja hacia arriba', ['Es muy liviano siempre', 'El viento lo sostiene']], [7, 9, 'El empuje que hace flotar a los barcos lo explicó…', 'Arquímedes', ['Newton', 'Darwin']],
  [3, 8, 'En La Guajira hay parques de…', 'Energía eólica', ['Nieve', 'Volcanes']]
];
const MARES_SOC = [
  [1, 5, '¿Qué mar baña el norte de Colombia?', 'El mar Caribe', ['El Pacífico', 'El Mediterráneo']], [2, 6, '¿Qué océano está al occidente de Colombia?', 'El Pacífico', ['El Atlántico', 'El Índico']],
  [2, 6, '¿En qué mar está Cartagena?', 'Caribe', ['Pacífico']], [3, 7, '¿En qué océano está Buenaventura?', 'Pacífico', ['Caribe']], [3, 7, '¿En qué mar está Santa Marta?', 'Caribe', ['Pacífico']],
  [3, 7, '¿En qué océano está Tumaco?', 'Pacífico', ['Caribe']], [3, 7, 'San Andrés es una isla del…', 'Mar Caribe', ['Océano Pacífico', 'Río Magdalena']],
  [3, 7, 'Bahía Solano, donde llegan las ballenas, está en…', 'El Pacífico', ['El Caribe', 'Los Llanos']], [3, 7, '¿Cuál es el puerto más grande del Pacífico colombiano?', 'Buenaventura', ['Cartagena', 'Riohacha']],
  [4, 8, '¿Qué río llega al mar en Barranquilla?', 'El Magdalena', ['El Amazonas', 'El Cauca']], [4, 8, '¿Qué isla colombiana del Pacífico es famosa por sus tiburones?', 'Malpelo', ['San Andrés', 'Barú']],
  [4, 8, 'El golfo de Urabá queda en el mar…', 'Caribe', ['Pacífico']], [2, 6, 'El sol sale por el…', 'Este (oriente)', ['Oeste (occidente)', 'Sur']],
  [2, 6, 'El sol se oculta por el…', 'Oeste (occidente)', ['Este (oriente)', 'Norte']], [3, 7, '¿Qué país está al oriente de Colombia?', 'Venezuela', ['Ecuador', 'Panamá']],
  [3, 7, '¿Qué país está al sur de Colombia?', 'Ecuador', ['Panamá', 'Venezuela']], [3, 7, '¿Qué país está al noroeste de Colombia?', 'Panamá', ['Brasil', 'Perú']],
  [5, 9, '¿Cuántos mares tiene Colombia en sus costas?', 'Dos: Caribe y Pacífico', ['Uno', 'Tres']], [5, 9, 'El manglar crece donde se junta el agua del río con…', 'La del mar', ['La nieve', 'La lluvia ácida']]
];
const deBanco = (b, g) => b.filter(x => g >= x[0] && g <= x[1] + 1);

const PROPIOS = {
  ingles: [{ id: 'mar', nombre: 'El mar', emoji: '🌊', desde: 0 }, { id: 'direcciones', nombre: 'Direcciones', emoji: '🧭', desde: 1 }],
  matematicas: [{ id: 'angulos', nombre: 'Ángulos y rumbos', emoji: '📐', desde: 2 }],
  ciencias: [{ id: 'viento', nombre: 'El viento', emoji: '🌬️', desde: 0 }],
  sociales: [{ id: 'mares', nombre: 'Mares y puertos', emoji: '⚓', desde: 1 }]
};
/** Los temas de una materia para un grado: «Mezcla», los de navegar y los del Rally. */
function temas(m, g) {
  const base = RC.temas(m, g).filter(t => t.id !== 'mezcla'), mios = (PROPIOS[m] || []).filter(t => g >= t.desde).map(t => ({ id: t.id, nombre: t.nombre, emoji: t.emoji }));
  const t = mios.concat(base);
  return t.length > 1 ? [{ id: 'mezcla', nombre: 'Mezcla', emoji: '🎲' }].concat(t) : t;
}
function propio(m, tema, g, n, op) {
  const out = [], vistas = new Set();
  if (tema === 'mar' || tema === 'direcciones') {
    const ws = aW(tema === 'mar' ? MAR_EN : DIRS_EN.filter((w, i) => g >= 3 || i < 10));
    const nv = tema === 'direcciones' ? Math.max(1, Math.round(n / 3)) : 0;
    for (let i = 0; i < nv; i++) out.push(vientoEn(g));
    return barajar(out.concat(RC.dePalabras(barajar(ws).slice(0, Math.max(6, n)), n - nv, { tiene: op.tiene, modo: op.modo, emoji: g <= 5 }).slice(0, n - nv)));
  }
  for (let k = 0; out.length < n && k < n * 12; k++) {
    let x;
    if (tema === 'angulos') x = angulo(g);
    else {
      const banco = deBanco(tema === 'viento' ? VIENTO : MARES_SOC, g);
      // de vez en cuando, leer el viento del juego
      if (g >= 2 && k % 3 === 1 && out.filter(o => o.viento != null).length < Math.max(1, Math.floor(n / 4))) x = vientoEs(g);
      else { const c = pick(banco); x = c && q(c[2], c[3], c[4]); }
    }
    if (!x || (vistas.has(x.p) && x.viento == null) || x.opciones.length < 2) continue;
    vistas.add(x.p); out.push(x);
  }
  return barajar(out);
}
/** n tramos de una materia, un tema (o «mezcla») y un grado. En «mezcla», la mitad son de navegar. */
function generar(m, tema, g, n, op) {
  op = Object.assign({ tiene: () => false, modo: 'normal' }, op || {});
  const mios = (PROPIOS[m] || []).filter(t => g >= t.desde).map(t => t.id);
  if (mios.includes(tema)) return propio(m, tema, g, n, op);
  if (tema && tema !== 'mezcla') return RC.generar(m, tema, g, n, op);
  const nm = mios.length ? Math.ceil(n / 2) : 0;
  let out = [];
  mios.forEach((t, i) => { out = out.concat(propio(m, t, g, Math.ceil(nm / mios.length) + (i ? 0 : 0), op)); });
  out = out.slice(0, nm).concat(RC.generar(m, 'mezcla', g, n - Math.min(nm, out.length), op));
  return barajar(out).slice(0, n);
}

const esDirEn = t => DIR_EN.includes(String(t).trim().toLowerCase());
window.RegataContenido = { MATERIAS: RC.MATERIAS, temas, generar, dePalabras: RC.dePalabras, nombreDir, vientoDe, esDirEn };
})();
