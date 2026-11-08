/* global module */
/* Torre de los Enigmas — los generadores (sin DOM ni three: se prueban con node).
   window.Enigmas.generar(familia, nivel, {idioma: 'es'|'en', rng}) → enigma, o null si no salió (se pide otro).
   Un enigma: {familia, tipo, pregunta, preguntaEn?, visual, opciones: [pieza], correcta, explica, voz?: [en…],
   figuras (true si lleva pista: tapa dos malas)}. Una pieza: {t:'fig'|'flecha'|'txt'|'emo'|'vista'|'num', …, d}
   donde `d` es lo que dice el lector de pantalla. El nivel va de 1 (1.º) a 10 (lo más difícil de 11.º).
   Cada generador garantiza: 4 opciones (3 en algún caso pequeño) todas distintas y una sola que cumple la regla. */
(function (root) {
'use strict';

/* ---------- azar ---------- */
function Azar(rng) {
  const r = rng || Math.random;
  const ri = (a, b) => a + Math.floor(r() * (b - a + 1));
  const pick = a => a[Math.floor(r() * a.length)];
  const barajar = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); const x = a[i]; a[i] = a[j]; a[j] = x; } return a; };
  return { r, ri, pick, barajar, muestra: (a, k) => barajar(a).slice(0, k), si: p => r() < p };
}
const rango = n => Array.from({ length: n }, (_, i) => i);
const cap = s => s.charAt(0).toUpperCase() + s.slice(1);

/* ---------- figuras ---------- */
const FORMAS = ['circulo', 'cuadrado', 'triangulo', 'rombo', 'estrella', 'hexagono'];
const NF = { circulo: ['círculo', 'círculos', 0], cuadrado: ['cuadrado', 'cuadrados', 0], triangulo: ['triángulo', 'triángulos', 0],
  rombo: ['rombo', 'rombos', 0], estrella: ['estrella', 'estrellas', 1], hexagono: ['hexágono', 'hexágonos', 0] };
const NR = { lleno: ['relleno', 'rellena', 'rellenos', 'rellenas'], vacio: ['vacío', 'vacía', 'vacíos', 'vacías'],
  rayas: ['a rayas', 'a rayas', 'a rayas', 'a rayas'], medio: ['medio relleno', 'medio rellena', 'medio rellenos', 'medio rellenas'] };
const NT = { p: ['pequeño', 'pequeña', 'pequeños', 'pequeñas'], m: ['mediano', 'mediana', 'medianos', 'medianas'], g: ['grande', 'grande', 'grandes', 'grandes'] };
function descFig(f) {
  const [sg, pl, fem] = NF[f.forma], n = f.n || 1, k = (n > 1 ? 2 : 0) + fem;
  return (n > 1 ? n + ' ' + pl : sg) + ' ' + NR[f.relleno][k] + (f.tam && f.tam !== 'm' ? ' ' + NT[f.tam][k] : '');
}
function fig(forma, relleno, tam, n) { const f = { t: 'fig', forma, relleno: relleno || 'lleno', tam: tam || 'm', n: n || 1 }; f.d = descFig(f); return f; }
const DIR = ['arriba', 'arriba a la derecha', 'la derecha', 'abajo a la derecha', 'abajo', 'abajo a la izquierda', 'la izquierda', 'arriba a la izquierda'];
const norm = g => ((g % 360) + 360) % 360;
function flecha(giro, relleno) { giro = norm(giro); return { t: 'flecha', giro, relleno: relleno || 'lleno', d: 'flecha ' + (relleno === 'vacio' ? 'vacía ' : '') + 'hacia ' + DIR[giro / 45] }; }
const txt = (s, en) => ({ t: 'txt', s: String(s), en: !!en, d: String(s) });
const num = n => ({ t: 'num', s: String(n), d: String(n) });
const emo = (e, nombre, en) => ({ t: 'emo', e, s: nombre, en: !!en, d: nombre });
function clave(p) {
  if (p.t === 'fig') return [p.forma, p.relleno, p.tam, p.n].join('|');
  if (p.t === 'flecha') return 'f' + p.giro + p.relleno;
  if (p.t === 'vista') return 'v' + JSON.stringify(p.m);
  return p.t + ':' + (p.s || p.e);
}

/* La correcta y las malas (que no se repitan ni sean la correcta) → {opciones, correcta}. null si no llegan a `min`. */
function armar(A, buena, malas, min) {
  const k = clave(buena), vistas = new Set([k]), ok = [];
  for (const m of malas) { if (!m) continue; const c = clave(m); if (vistas.has(c)) continue; vistas.add(c); ok.push(m); if (ok.length === 3) break; }
  if (ok.length < (min || 3)) return null;
  const ops = A.barajar([buena].concat(ok));
  return { opciones: ops, correcta: ops.indexOf(buena) };
}

/* ---------- 1. series ---------- */
function serieFiguras(nv, A) {
  const fs = A.muestra(FORMAS, 3), rs = A.muestra(['lleno', 'vacio', 'rayas'], 2), ts = ['p', 'm', 'g'];
  // ciclo de cada atributo: lista de valores que se repite
  let cf, cr = [rs[0]], ct = ['m'], cn = [1], largo = 6;
  if (nv <= 1) cf = [fs[0], fs[1]];
  else if (nv <= 2) cf = A.pick([[fs[0], fs[1]], [fs[0], fs[0], fs[1]]]);
  else if (nv <= 3) cf = [fs[0], fs[1], fs[2]];
  else if (nv <= 4) { cf = [fs[0], fs[1], fs[2]]; cr = [rs[0], rs[1]]; largo = 7; }
  else if (nv <= 6) { cf = [fs[0], fs[1]]; ct = A.si(0.5) ? ts : ts.slice().reverse(); largo = 7; }
  else if (nv <= 8) { cf = [fs[0], fs[1], fs[2]]; cr = [rs[0], rs[1]]; cn = [1, 2, 3]; largo = 7; }
  else { cf = A.pick([[fs[0], fs[0], fs[1]], [fs[0], fs[1], fs[2]]]); cr = [rs[0], rs[1]]; ct = ['p', 'g']; cn = [1, 2, 3, 2]; largo = 8; }
  const en = i => fig(cf[i % cf.length], cr[i % cr.length], ct[i % ct.length], cn[i % cn.length]);
  const fila = rango(largo).map(en), b = en(largo);
  const otro = (lista, v) => lista.find(x => x !== v);
  const malas = A.barajar([
    fig(otro(cf, b.forma) || otro(fs, b.forma), b.relleno, b.tam, b.n),
    fig(b.forma, cr.length > 1 ? otro(cr, b.relleno) : otro(['lleno', 'vacio', 'rayas'], b.relleno), b.tam, b.n),
    ct.length > 1 ? fig(b.forma, b.relleno, otro(ct, b.tam), b.n) : null,
    cn.length > 1 ? fig(b.forma, b.relleno, b.tam, otro(cn, b.n)) : null,
    en(largo - 1), en(largo + 1),
    fig(otro(fs, b.forma), otro(['lleno', 'vacio', 'rayas'], b.relleno), b.tam, b.n)
  ]);
  const o = armar(A, b, malas); if (!o) return null;
  const partes = ['las figuras se repiten de ' + cf.length + ' en ' + cf.length];
  if (cr.length > 1) partes.push('el relleno cambia de ' + cr.length + ' en ' + cr.length);
  if (ct.length > 1) partes.push('el tamaño va ' + ct.map(t => NT[t][0]).join(', '));
  if (cn.length > 1) partes.push('la cantidad va ' + cn.join(', '));
  return { tipo: 'figuras', pregunta: '¿Qué figura sigue?', preguntaEn: 'What comes next?', visual: { kind: 'fila', items: fila.concat([{ t: 'hueco', d: 'la que falta' }]) },
    ...o, figuras: true, explica: cap(partes.join('; ')) + '. Sigue: ' + b.d + '.' };
}

function serieNumeros(nv, A) {
  const R = [];
  const add = (a, z, f) => { if (nv >= a && nv <= z) R.push(f); };
  add(1, 4, () => { const k = A.ri(1, nv <= 1 ? 2 : nv <= 2 ? 5 : 9), a = A.ri(0, nv <= 1 ? 5 : 20); return [rango(7).map(i => a + k * i), 'Cada número suma ' + k + '.']; });
  add(2, 5, () => { const k = A.ri(1, nv <= 2 ? 2 : 6), a = k * 6 + A.ri(1, 12); return [rango(7).map(i => a - k * i), 'Cada número resta ' + k + '.']; });
  add(3, 6, () => { const k = A.pick([5, 10, 25, 50]), a = k * A.ri(0, 6); return [rango(7).map(i => a + k * i), 'Se cuenta de ' + k + ' en ' + k + '.']; });
  add(4, 7, () => { const r = A.pick([2, 3]), a = A.ri(1, 3); return [rango(6).map(i => a * Math.pow(r, i)), 'Cada número se multiplica por ' + r + '.']; });
  add(4, 8, () => { let a = A.ri(1, 4), b = A.ri(5, 9); if (A.si(0.5)) [a, b] = [b, a]; const s = [A.ri(1, 10)]; for (let i = 1; i < 7; i++) s.push(s[i - 1] + (i % 2 ? a : b)); return [s, 'Se suma ' + a + ', luego ' + b + ', y así.']; });
  add(5, 10, () => { const d0 = A.ri(1, 3), s = [A.ri(1, 10)]; for (let i = 1; i < 7; i++) s.push(s[i - 1] + d0 + i - 1); return [s, 'Lo que se suma crece de uno en uno: +' + d0 + ', +' + (d0 + 1) + ', +' + (d0 + 2) + '…']; });
  add(5, 10, () => { const s0 = A.ri(1, 4); return [rango(6).map(i => (s0 + i) * (s0 + i)), 'Son los cuadrados: ' + s0 + '×' + s0 + ', ' + (s0 + 1) + '×' + (s0 + 1) + '…']; });
  add(6, 10, () => { const s = [A.ri(1, 3), A.ri(1, 4)]; for (let i = 2; i < 8; i++) s.push(s[i - 1] + s[i - 2]); return [s, 'Cada número es la suma de los dos anteriores.']; });
  add(7, 10, () => { const m = A.pick([1, -1]), s = [A.ri(2, 4)]; for (let i = 1; i < 6; i++) s.push(2 * s[i - 1] + m); return [s, 'Cada número es el doble del anterior ' + (m > 0 ? 'más' : 'menos') + ' 1.']; });
  add(7, 10, () => { const a = A.ri(1, 5), k = A.ri(2, 4), b = A.ri(30, 40), m = A.ri(2, 5); return [rango(8).map(i => i % 2 ? b - m * (i - 1) / 2 : a + k * i / 2), 'Son dos series mezcladas: una sube de ' + k + ' en ' + k + ' y la otra baja de ' + m + ' en ' + m + '.']; });
  add(8, 10, () => { const s0 = A.ri(1, 2); return [rango(5).map(i => Math.pow(s0 + i, 3)), 'Son los cubos: ' + s0 + '×' + s0 + '×' + s0 + ', ' + (s0 + 1) + '×' + (s0 + 1) + '×' + (s0 + 1) + '…']; });
  add(8, 10, () => { const P = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41], i0 = A.ri(0, 5); return [P.slice(i0, i0 + 6), 'Son los números primos: sólo se dividen por 1 y por sí mismos.']; });
  add(9, 10, () => { const c = A.pick([1, -1, 2]); return [rango(6).map(i => (i + 1) * (i + 1) + c), 'Es cada cuadrado (1, 4, 9, 16…) ' + (c > 0 ? 'más ' + c : 'menos ' + -c) + '.']; });
  add(9, 10, () => { const s0 = A.ri(1, 3); return [rango(6).map(i => (s0 + i) * (s0 + i + 1) / 2), 'Son los números triangulares: se suma 1 más cada vez (' + (s0 + 1) + ', ' + (s0 + 2) + ', ' + (s0 + 3) + '…).']; });
  const [s, ex] = A.pick(R)();
  const L = s.length - 1;
  // de 6.º en adelante, a veces falta uno del medio
  const hueco = nv >= 6 && A.si(0.3) ? A.ri(2, L - 1) : L;
  const ans = s[hueco], paso = Math.abs(s[Math.max(1, hueco)] - s[Math.max(1, hueco) - 1]) || 1;
  const items = (hueco === L ? s.slice(0, L) : s).map((v, i) => (i === hueco ? { t: 'hueco', d: 'el que falta' } : num(v)));
  if (hueco === L) items.push({ t: 'hueco', d: 'el que falta' });
  const cand = [ans + 1, ans - 1, ans + paso, ans - paso, ans + 2, ans - 2, ans + 10, s[hueco - 1] * 2, ans + paso + 1].filter(v => v >= 0 && v !== ans && Number.isInteger(v));
  const o = armar(A, num(ans), A.barajar(cand.slice(0, 4)).concat(cand.slice(4)).map(num)); if (!o) return null;
  return { tipo: 'numeros', pregunta: hueco === L ? '¿Qué número sigue?' : '¿Qué número falta?', preguntaEn: hueco === L ? 'What number comes next?' : 'What number is missing?',
    visual: { kind: 'fila', items }, ...o, explica: ex + ' El número es ' + ans + '.' };
}

function serieGiros(nv, A) {
  const paso = nv <= 3 ? 90 : A.pick([45, 90, 135]), sentido = A.pick([1, -1]), a0 = nv <= 3 ? 90 * A.ri(0, 3) : 45 * A.ri(0, 7);
  const rel = nv >= 5 ? A.barajar(['lleno', 'vacio']) : ['lleno'];
  const largo = nv <= 2 ? 4 : 5;
  const en = i => flecha(a0 + sentido * paso * i, rel[i % rel.length]);
  const b = en(largo);
  const malas = A.barajar([flecha(b.giro + sentido * paso, b.relleno), en(largo - 1), flecha(b.giro + 180, b.relleno),
    rel.length > 1 ? flecha(b.giro, rel.find(x => x !== b.relleno)) : flecha(b.giro + 90, b.relleno), flecha(b.giro - 90, b.relleno), flecha(b.giro + 45, b.relleno)]);
  const o = armar(A, b, malas); if (!o) return null;
  return { tipo: 'giros', pregunta: '¿Cómo queda la flecha después?', preguntaEn: 'Where does the arrow point next?', visual: { kind: 'fila', items: rango(largo).map(en).concat([{ t: 'hueco', d: 'la que falta' }]) },
    ...o, figuras: true, explica: 'La flecha gira ' + paso + '° ' + (sentido > 0 ? 'a la derecha, como el reloj' : 'a la izquierda, contra el reloj') + ', en cada paso' + (rel.length > 1 ? ', y se alterna rellena y vacía' : '') + '. Queda ' + b.d + '.' };
}

const LISTAS = {
  // La semana va de domingo a sábado (Joseth, 8 nov 2026: colegios adventistas). Es cíclica, así que las series no cambian.
  es: { dias: ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'],
    meses: ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'],
    numeros: ['uno', 'dos', 'tres', 'cuatro', 'cinco', 'seis', 'siete', 'ocho', 'nueve', 'diez', 'once', 'doce'],
    ordinales: ['primero', 'segundo', 'tercero', 'cuarto', 'quinto', 'sexto', 'séptimo', 'octavo', 'noveno', 'décimo'],
    decenas: ['diez', 'veinte', 'treinta', 'cuarenta', 'cincuenta', 'sesenta', 'setenta', 'ochenta', 'noventa'] },
  en: { meses: ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december'],
    numeros: ['one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve'],
    ordinales: ['first', 'second', 'third', 'fourth', 'fifth', 'sixth', 'seventh'],
    decenas: ['ten', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'] }
};
const CICLICAS = { dias: 1, meses: 1 };
function serieDePalabras(nv, A, idioma) {
  const L = LISTAS[idioma], nombre = A.pick(Object.keys(L)), lista = L[nombre], n = lista.length, cic = CICLICAS[nombre];
  const paso = nv <= 3 ? 1 : nv <= 6 ? A.pick([1, 2]) : A.pick([2, 3, -1, -2]);
  const largo = 4, total = Math.abs(paso) * largo;
  if (!cic && total >= n) return null;
  const i0 = cic ? A.ri(0, n - 1) : paso > 0 ? A.ri(0, n - 1 - total) : A.ri(total, n - 1);
  const en = i => lista[norm2(i0 + paso * i, n)];
  const en2 = idioma === 'en';
  const b = txt(en(largo), en2);
  const malas = A.barajar([txt(en(largo + 1), en2), txt(en(largo - 1), en2), txt(lista[norm2(i0 + paso * largo + 1, n)], en2), txt(lista[norm2(i0 + paso * largo - 1, n)], en2), txt(A.pick(lista), en2), txt(A.pick(lista), en2)]);
  const o = armar(A, b, malas); if (!o) return null;
  const items = rango(largo).map(i => txt(en(i), en2)).concat([{ t: 'hueco', d: 'la que falta' }]);
  const como = paso === 1 ? 'una tras otra' : paso > 0 ? 'saltando de ' + paso + ' en ' + paso : 'hacia atrás' + (paso < -1 ? ', de ' + -paso + ' en ' + -paso : '');
  return { tipo: 'palabras', pregunta: '¿Qué palabra sigue?', preguntaEn: 'What word comes next?', visual: { kind: 'fila', items, palabras: true },
    ...o, voz: en2 ? rango(largo).map(en) : null, vozRespuesta: en2 ? b.s : null, explica: 'Van ' + como + '. Sigue «' + b.s + '».' };
}
const norm2 = (i, n) => ((i % n) + n) % n;

function series(nv, A, idioma) {
  const opciones = [serieFiguras, serieNumeros, serieGiros];
  if (nv >= 2) opciones.push(serieDePalabras);
  if (idioma === 'en' && nv >= 2) opciones.push(serieDePalabras, serieDePalabras);
  return A.pick(opciones)(nv, A, idioma);
}

/* ---------- 2. matrices 3 × 3 ---------- */
function matrices(nv, A) {
  const fs = A.muestra(FORMAS, 3), rs = A.muestra(['lleno', 'vacio', 'rayas'], 3), ns = A.barajar([1, 2, 3]);
  const lat = A.pick([(r, c) => (r + c) % 3, (r, c) => (c - r + 3) % 3]);
  const lat2 = A.pick([(r, c) => (r + 2 * c + 1) % 3, (r, c) => (2 * r + c) % 3]);
  let F, Rr, N, T = () => 'm', reglas;
  if (nv <= 2) { if (A.si(0.5)) { F = r => fs[r]; Rr = (r, c) => rs[c]; N = () => 1; reglas = 'Cada fila tiene la misma figura y cada columna el mismo relleno.'; }
    else { F = r => fs[r]; Rr = () => rs[0]; N = (r, c) => c + 1; reglas = 'Cada fila tiene la misma figura y la cantidad crece: 1, 2, 3.'; } }
  else if (nv <= 4) { F = (r, c) => fs[lat(r, c)]; Rr = r => rs[r]; N = () => 1; reglas = 'En cada fila están las tres figuras sin repetirse, y cada fila tiene su relleno.'; }
  else if (nv <= 6) { F = (r, c) => fs[lat(r, c)]; Rr = r => rs[r]; N = (r, c) => ns[c]; reglas = 'En cada fila están las tres figuras sin repetirse, cada fila tiene su relleno y cada columna su cantidad.'; }
  else if (nv <= 8) { F = (r, c) => fs[lat(r, c)]; Rr = (r, c) => rs[lat2(r, c)]; N = (r, c) => ns[c]; reglas = 'Las tres figuras y los tres rellenos aparecen una vez en cada fila y en cada columna; cada columna tiene su cantidad.'; }
  else { F = (r, c) => fs[lat(r, c)]; Rr = (r, c) => rs[lat2(r, c)]; N = (r, c) => ns[(r + c + 1) % 3]; reglas = 'Figura, relleno y cantidad: cada uno de los tres valores aparece una vez en cada fila y en cada columna.'; }
  const celda = (r, c) => fig(F(r, c), Rr(r, c), T(r, c), N(r, c));
  const celdas = []; for (let r = 0; r < 3; r++) for (let c = 0; c < 3; c++) celdas.push(r === 2 && c === 2 ? { t: 'hueco', d: 'la casilla que falta' } : celda(r, c));
  const b = celda(2, 2), otra = (l, v) => A.pick(l.filter(x => x !== v));
  const malas = A.barajar([fig(otra(fs, b.forma), b.relleno, b.tam, b.n), fig(b.forma, otra(rs, b.relleno), b.tam, b.n), fig(b.forma, b.relleno, b.tam, otra([1, 2, 3], b.n)),
    celda(2, 1), celda(1, 2), fig(otra(fs, b.forma), otra(rs, b.relleno), b.tam, b.n)]);
  const o = armar(A, b, malas); if (!o) return null;
  return { tipo: 'matriz', pregunta: '¿Qué casilla falta?', preguntaEn: 'Which one is missing?', visual: { kind: 'matriz', celdas }, ...o, figuras: true,
    explica: reglas + ' Falta: ' + b.d + '.' };
}

/* ---------- 3. analogías ---------- */
// Relaciones uno a uno: cada `a` tiene un solo `b`. [nivel mínimo, nivel máximo, nombre, pares].
const EMO = [ // [emoji a, nombre es, nombre en, emoji b, nombre es, nombre en]
  ['da', 'lo que nos da', [['🐄', 'vaca', 'cow', '🥛', 'leche', 'milk'], ['🐔', 'gallina', 'hen', '🥚', 'huevo', 'egg'], ['🐝', 'abeja', 'bee', '🍯', 'miel', 'honey'], ['🐑', 'oveja', 'sheep', '🧶', 'lana', 'wool']]],
  ['come', 'lo que come', [['🐰', 'conejo', 'rabbit', '🥕', 'zanahoria', 'carrot'], ['🐵', 'mono', 'monkey', '🍌', 'banano', 'banana'], ['🐶', 'perro', 'dog', '🦴', 'hueso', 'bone'], ['🐭', 'ratón', 'mouse', '🧀', 'queso', 'cheese'], ['🐼', 'panda', 'panda', '🎋', 'bambú', 'bamboo']]],
  ['clima', 'lo que se usa con ese tiempo', [['🌧️', 'lluvia', 'rain', '☂️', 'paraguas', 'umbrella'], ['☀️', 'sol', 'sun', '🕶️', 'gafas de sol', 'sunglasses'], ['❄️', 'nieve', 'snow', '🧤', 'guantes', 'gloves'], ['🌙', 'noche', 'night', '🛏️', 'cama', 'bed']]],
  ['va', 'lo que va con eso', [['🔑', 'llave', 'key', '🔒', 'candado', 'lock'], ['🦶', 'pie', 'foot', '👟', 'zapato', 'shoe'], ['🪥', 'cepillo', 'toothbrush', '🦷', 'diente', 'tooth'], ['⚽', 'balón', 'ball', '🥅', 'arco', 'goal']]]
];
const PAL = {
  es: [
    [3, 10, 'opuestos', 'son contrarios', [['caliente', 'frío'], ['grande', 'pequeño'], ['rápido', 'lento'], ['alegre', 'triste'], ['arriba', 'abajo'], ['día', 'noche'], ['abierto', 'cerrado'], ['lleno', 'vacío'], ['mojado', 'seco'], ['duro', 'blando'], ['rico', 'pobre'], ['temprano', 'tarde'], ['fuerte', 'débil'], ['primero', 'último']], true],
    [3, 6, 'crías', 'el segundo es la cría del primero', [['vaca', 'ternero'], ['gallina', 'pollito'], ['perro', 'cachorro'], ['oveja', 'cordero'], ['caballo', 'potro'], ['rana', 'renacuajo'], ['cabra', 'cabrito']]],
    [3, 6, 'sonidos', 'el segundo es lo que hace el primero con la voz', [['vaca', 'muge'], ['perro', 'ladra'], ['gato', 'maúlla'], ['león', 'ruge'], ['oveja', 'bala'], ['caballo', 'relincha'], ['cerdo', 'gruñe']]],
    [4, 8, 'parte', 'el primero es una parte del segundo', [['hoja', 'árbol'], ['página', 'libro'], ['dedo', 'mano'], ['pétalo', 'flor'], ['rueda', 'bicicleta'], ['tecla', 'teclado'], ['letra', 'palabra'], ['ladrillo', 'muro']]],
    [4, 8, 'oficio', 'el segundo es donde trabaja el primero', [['médico', 'hospital'], ['maestro', 'escuela'], ['cocinero', 'cocina'], ['piloto', 'avión'], ['granjero', 'finca'], ['panadero', 'panadería'], ['bibliotecario', 'biblioteca']]],
    [5, 9, 'herramienta', 'el primero sirve para lo segundo', [['tijeras', 'cortar'], ['lápiz', 'escribir'], ['escoba', 'barrer'], ['pala', 'cavar'], ['aguja', 'coser'], ['martillo', 'clavar'], ['regla', 'medir']]],
    [5, 9, 'pareja', 'el segundo es la hembra del primero', [['león', 'leona'], ['gallo', 'gallina'], ['toro', 'vaca'], ['caballo', 'yegua'], ['rey', 'reina'], ['padre', 'madre'], ['hombre', 'mujer']]],
    [6, 10, 'lados', 'el segundo es el número de lados del primero', [['triángulo', '3'], ['cuadrado', '4'], ['pentágono', '5'], ['hexágono', '6'], ['octágono', '8'], ['decágono', '10']]],
    [7, 10, 'pasado', 'el segundo es el pasado del primero', [['como', 'comí'], ['voy', 'fui'], ['tengo', 'tuve'], ['hago', 'hice'], ['digo', 'dije'], ['puedo', 'pude'], ['quiero', 'quise']]],
    [7, 10, 'órgano', 'el primero sirve para lo segundo', [['corazón', 'bombear sangre'], ['pulmón', 'respirar'], ['estómago', 'digerir'], ['ojo', 'ver'], ['oído', 'oír'], ['riñón', 'filtrar la sangre']]],
    [8, 10, 'fórmula', 'el segundo es la fórmula química del primero', [['agua', 'H₂O'], ['sal de cocina', 'NaCl'], ['oxígeno', 'O₂'], ['dióxido de carbono', 'CO₂'], ['metano', 'CH₄'], ['amoníaco', 'NH₃']]],
    [8, 10, 'unidad', 'el segundo es la unidad del primero', [['longitud', 'metro'], ['masa', 'kilogramo'], ['tiempo', 'segundo'], ['corriente eléctrica', 'amperio'], ['fuerza', 'newton'], ['energía', 'julio']]],
    [9, 10, 'autor', 'el primero escribió el segundo', [['García Márquez', 'Cien años de soledad'], ['Cervantes', 'Don Quijote'], ['Jorge Isaacs', 'María'], ['Rafael Pombo', 'Rin Rin Renacuajo'], ['José Eustasio Rivera', 'La vorágine']]]
  ],
  en: [
    [2, 10, 'opposites', 'son contrarios', [['hot', 'cold'], ['big', 'small'], ['fast', 'slow'], ['happy', 'sad'], ['up', 'down'], ['tall', 'short'], ['hard', 'soft'], ['rich', 'poor'], ['early', 'late'], ['push', 'pull'], ['loud', 'quiet'], ['good', 'bad'], ['first', 'last'], ['left', 'right'], ['sick', 'healthy']], true],
    [2, 6, 'sounds', 'el segundo es el sonido del primero', [['cow', 'moo'], ['dog', 'woof'], ['cat', 'meow'], ['sheep', 'baa'], ['lion', 'roar'], ['dove', 'coo'], ['raven', 'caw']]],
    [3, 7, 'colors', 'el segundo es el color del primero', [['banana', 'yellow'], ['sky', 'blue'], ['leaf', 'green'], ['raven', 'black'], ['pig', 'pink'], ['bear', 'brown']]],
    [4, 8, 'female', 'el segundo es la hembra o la mujer', [['lion', 'lioness'], ['peacock', 'peahen'], ['rooster', 'hen'], ['bull', 'cow'], ['man', 'woman'], ['boy', 'girl'], ['father', 'mother'], ['brother', 'sister'], ['grandpa', 'grandma']]],
    [4, 8, 'double', 'el segundo es el doble del primero', [['one', 'two'], ['two', 'four'], ['three', 'six'], ['four', 'eight'], ['five', 'ten'], ['six', 'twelve'], ['ten', 'twenty']]],
    [4, 8, 'places', 'el segundo es donde está el primero', [['farmer', 'farm'], ['student', 'school'], ['cook', 'kitchen'], ['fish', 'water'], ['bird', 'sky'], ['king', 'castle']]],
    [5, 9, 'senses', 'el primero sirve para lo segundo', [['eye', 'see'], ['ear', 'hear'], ['mouth', 'eat'], ['foot', 'walk'], ['hand', 'touch']]],
    [6, 10, 'comparatives', 'el segundo es el comparativo', [['tall', 'taller'], ['old', 'older'], ['strong', 'stronger'], ['big', 'bigger'], ['fast', 'faster'], ['small', 'smaller']]],
    [6, 10, 'past', 'el segundo es el pasado del primero', [['run', 'ran'], ['eat', 'ate'], ['see', 'saw'], ['go', 'went'], ['take', 'took'], ['give', 'gave'], ['drink', 'drank'], ['sleep', 'slept'], ['come', 'came']]]
  ]
};
const CATEGORIAS = {
  es: [['animales', 'un animal', ['perro', 'gato', 'vaca', 'caballo', 'oveja', 'cerdo', 'pato', 'conejo']], ['colores', 'un color', ['rojo', 'azul', 'verde', 'amarillo', 'morado', 'café', 'negro', 'blanco']],
    ['frutas', 'una fruta', ['manzana', 'pera', 'mango', 'uva', 'guayaba', 'piña', 'fresa']], ['cuerpo', 'una parte del cuerpo', ['ojo', 'oreja', 'nariz', 'boca', 'mano', 'pie', 'rodilla']],
    ['familia', 'alguien de la familia', ['mamá', 'papá', 'hermano', 'abuela', 'tío', 'prima']], ['instrumentos', 'un instrumento', ['guitarra', 'tambor', 'flauta', 'piano', 'maracas', 'violín']],
    ['planetas', 'un planeta', ['Mercurio', 'Venus', 'Marte', 'Júpiter', 'Saturno', 'Neptuno']], ['transporte', 'un medio de transporte', ['bus', 'carro', 'bicicleta', 'barco', 'avión', 'tren']]],
  en: [['animals', 'un animal', ['dog', 'cat', 'cow', 'horse', 'sheep', 'pig', 'duck', 'rabbit']], ['colors', 'un color', ['red', 'blue', 'green', 'yellow', 'purple', 'brown', 'black', 'pink']],
    ['fruit', 'una fruta', ['apple', 'pear', 'mango', 'grapes', 'guava', 'plum']], ['body', 'una parte del cuerpo', ['eye', 'ear', 'nose', 'mouth', 'hand', 'foot', 'head']],
    ['family', 'alguien de la familia', ['mother', 'father', 'brother', 'sister', 'grandma', 'grandpa']], ['music', 'un instrumento', ['guitar', 'drum', 'flute', 'maracas', 'accordion']],
    ['numbers', 'un número', ['one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight']], ['transport', 'un medio de transporte', ['bus', 'car', 'bike', 'boat', 'ship']]]
};
const CAT_EMO = [['animales', 'un animal', [['🐶', 'perro', 'dog'], ['🐱', 'gato', 'cat'], ['🐮', 'vaca', 'cow'], ['🐷', 'cerdo', 'pig'], ['🐴', 'caballo', 'horse'], ['🐸', 'rana', 'frog']]],
  ['frutas', 'una fruta', [['🍎', 'manzana', 'apple'], ['🍌', 'banano', 'banana'], ['🍐', 'pera', 'pear'], ['🍇', 'uvas', 'grapes'], ['🥭', 'mango', 'mango']]],
  ['transporte', 'algo para viajar', [['🚌', 'bus', 'bus'], ['🚗', 'carro', 'car'], ['🚲', 'bicicleta', 'bike'], ['⛵', 'barco', 'boat']]],
  ['ropa', 'ropa', [['👕', 'camiseta', 'shirt'], ['👖', 'pantalón', 'pants'], ['🧦', 'medias', 'socks'], ['🧢', 'gorra', 'cap']]],
  ['música', 'un instrumento', [['🥁', 'tambor', 'drum'], ['🎸', 'guitarra', 'guitar'], ['🎺', 'trompeta', 'trumpet'], ['🎹', 'piano', 'piano']]]];

function analogiaEmoji(nv, A, idioma) {
  const [, rel, pares] = A.pick(EMO), [p1, p2] = A.muestra(pares, 2), en = idioma === 'en';
  const nom = (p, k) => (en ? p[k + 1] : p[k]);
  const pz = (p, i) => emo(p[i], nom(p, i + 1), en);
  const b = pz(p2, 3);
  const o = armar(A, b, A.barajar(pares.filter(p => p !== p2).map(p => pz(p, 3)))); if (!o) return null;
  return { tipo: 'emoji', pregunta: '¿Qué va con el último?', preguntaEn: 'What goes with it?',
    visual: { kind: 'analogia', a: pz(p1, 0), b: pz(p1, 3), c: pz(p2, 0) }, ...o,
    voz: en ? [p1[2], p1[5], p2[2]] : null, vozRespuesta: en ? p2[5] : null,
    explica: cap(nom(p1, 1)) + ' y ' + nom(p1, 4) + ': ' + rel + '. Con ' + nom(p2, 1) + ' va ' + nom(p2, 4) + '.' };
}
function analogiaPalabras(nv, A, idioma) {
  const rels = PAL[idioma].filter(r => nv >= r[0] && nv <= r[1]); if (!rels.length) return null;
  const [, , , rel, pares0, sim] = A.pick(rels), en = idioma === 'en';
  const pares = sim && A.si(0.5) ? pares0.map(p => [p[1], p[0]]) : pares0;
  const [p1, p2] = A.muestra(pares, 2), b = txt(p2[1], en);
  const malas = A.barajar(pares.filter(p => p !== p2 && p !== p1).map(p => txt(p[1], en))).concat([txt(p1[1], en)]).filter(m => m.s !== p2[0]);
  const o = armar(A, b, malas); if (!o) return null;
  return { tipo: 'palabras', pregunta: '«' + p1[0] + '» es a «' + p1[1] + '» como «' + p2[0] + '» es a…', preguntaEn: en ? p1[0] + ' is to ' + p1[1] + ' as ' + p2[0] + ' is to…' : null,
    visual: { kind: 'analogia', a: txt(p1[0], en), b: txt(p1[1], en), c: txt(p2[0], en) }, ...o,
    voz: en ? [p1[0], p1[1], p2[0]] : null, vozRespuesta: en ? p2[1] : null,
    explica: '«' + p1[0] + '» y «' + p1[1] + '»: ' + rel + '. Con «' + p2[0] + '» va «' + p2[1] + '».' };
}
function intruso(nv, A, idioma) {
  const en = idioma === 'en';
  if (nv <= 2) {
    const [ca, cb] = A.muestra(CAT_EMO, 2), tres = A.muestra(ca[2], 3), x = A.pick(cb[2]);
    const pz = e => emo(e[0], en ? e[2] : e[1], en), b = pz(x);
    const ops = A.barajar(tres.map(pz).concat([b]));
    return { tipo: 'intruso', pregunta: '¿Cuál no va con los demás?', preguntaEn: 'Which one does not belong?', visual: null, opciones: ops, correcta: ops.indexOf(b),
      voz: en ? ops.map(o => o.s) : null, explica: 'Los otros son ' + ca[0] + '; ' + (en ? x[2] : x[1]) + ' no es ' + ca[1] + '.' };
  }
  const [ca, cb] = A.muestra(CATEGORIAS[idioma], 2), tres = A.muestra(ca[2], 3), x = A.pick(cb[2]);
  const b = txt(x, en), ops = A.barajar(tres.map(s => txt(s, en)).concat([b]));
  return { tipo: 'intruso', pregunta: '¿Cuál no va con las demás?', preguntaEn: 'Which word does not belong?', visual: null, opciones: ops, correcta: ops.indexOf(b),
    voz: en ? ops.map(o => o.s) : null, explica: 'Las otras son ' + (en ? 'de «' + ca[0] + '»' : ca[0]) + '; «' + x + '» no es ' + ca[1] + '.' };
}
function analogias(nv, A, idioma) {
  if (A.si(0.3)) return intruso(nv, A, idioma);
  if (nv <= 2 || (nv <= 3 && A.si(0.4))) return analogiaEmoji(nv, A, idioma);
  return analogiaPalabras(nv, A, idioma);
}

/* ---------- 4. balanzas ---------- */
const FRUTAS = [['🍓', 'fresa', 'fresas'], ['🍎', 'manzana', 'manzanas'], ['🍊', 'mandarina', 'mandarinas'], ['🍍', 'piña', 'piñas'], ['🍉', 'sandía', 'sandías']];
const cuantas = (f, n) => n + ' ' + (n === 1 ? f[1] : f[2]);
function balanzas(nv, A) {
  const idx = A.muestra([0, 1, 2, 3, 4], 3).sort((a, b) => a - b);
  let [L, M, H] = idx.map(i => FRUTAS[i]);
  const lado = (f, n) => ({ e: f[0], n, d: cuantas(f, n) });
  let platos, pre, ans, ex, unidad = '';
  const kind = nv <= 2 ? 1 : nv <= 5 ? 2 : nv <= 7 ? 3 : 4;
  if (kind === 1) {
    const a = A.ri(2, 3), c = nv <= 1 ? 2 : A.ri(2, 3); ans = a * c;
    platos = [{ izq: [lado(H, 1)], der: [lado(L, a)] }, { izq: [lado(H, c)], der: [{ e: L[0], n: 0, q: true, d: '¿cuántas ' + L[2] + '?' }], q: true }];
    pre = '1 ' + H[1] + ' pesa lo mismo que ' + cuantas(L, a) + '. ¿Cuántas ' + L[2] + ' pesan lo mismo que ' + cuantas(H, c) + '?';
    ex = 'Cada ' + H[1] + ' vale ' + cuantas(L, a) + ', y son ' + c + ': ' + c + ' × ' + a + ' = ' + ans + '.';
  } else if (kind === 2) {
    const [a, b] = nv <= 3 ? [A.ri(2, 5), 1] : A.pick([[3, 2], [5, 2], [4, 3], [5, 3], [6, 4], [7, 2]]);
    const m = A.ri(2, 3), c = b * m; ans = a * m;
    if (b > 1) { const i = A.ri(0, 3); L = FRUTAS[i]; H = FRUTAS[i + 1]; } // con b > 1, frutas de peso parecido
    platos = [{ izq: [lado(H, b)], der: [lado(L, a)] }, { izq: [lado(H, c)], der: [{ e: L[0], n: 0, q: true, d: '¿cuántas ' + L[2] + '?' }], q: true }];
    pre = cap(cuantas(H, b)) + (b === 1 ? ' pesa' : ' pesan') + ' lo mismo que ' + cuantas(L, a) + '. ¿Cuántas ' + L[2] + ' pesan lo mismo que ' + cuantas(H, c) + '?';
    ex = cuantas(H, c) + ' son ' + m + ' veces ' + cuantas(H, b) + ', así que son ' + m + ' × ' + a + ' = ' + ans + ' ' + L[2] + '.';
  } else if (kind === 3) {
    const x = A.ri(2, 4), y = A.ri(2, 4), c = nv >= 7 ? A.ri(1, 2) : 1; ans = x * y * c;
    platos = [{ izq: [lado(H, 1)], der: [lado(M, x)] }, { izq: [lado(M, 1)], der: [lado(L, y)] }, { izq: [lado(H, c)], der: [{ e: L[0], n: 0, q: true, d: '¿cuántas ' + L[2] + '?' }], q: true }];
    pre = '1 ' + H[1] + ' = ' + cuantas(M, x) + ', y 1 ' + M[1] + ' = ' + cuantas(L, y) + '. ¿Cuántas ' + L[2] + ' pesan lo mismo que ' + cuantas(H, c) + '?';
    ex = '1 ' + H[1] + ' = ' + x + ' ' + M[2] + ' = ' + x + ' × ' + y + ' = ' + x * y + ' ' + L[2] + (c > 1 ? '; y por ' + c + ', ' + ans : '') + '.';
  } else {
    const pa = A.ri(2, 9), pb = A.ri(1, 9), k = A.ri(2, 3), S = k * pa + pb, T = pa + pb; ans = pa; unidad = ' kg';
    platos = [{ izq: [lado(M, k), lado(L, 1)], der: [{ kg: S, d: S + ' kilos' }] }, { izq: [lado(M, 1), lado(L, 1)], der: [{ kg: T, d: T + ' kilos' }] }];
    pre = cap(cuantas(M, k)) + ' y 1 ' + L[1] + ' pesan ' + S + ' kg. 1 ' + M[1] + ' y 1 ' + L[1] + ' pesan ' + T + ' kg. ¿Cuánto pesa 1 ' + M[1] + '?';
    ex = 'La diferencia entre las dos balanzas son ' + (k - 1) + ' ' + (k - 1 === 1 ? M[1] : M[2]) + ': ' + S + ' − ' + T + ' = ' + (S - T) + (k > 2 ? ', y entre ' + (k - 1) + ' da ' + ans : '') + '. Una ' + M[1] + ' pesa ' + ans + ' kg.';
  }
  const cand = [ans + 1, ans - 1, ans + 2, ans - 2, ans * 2, ans + 3, Math.round(ans / 2)].filter(v => v > 0 && v !== ans);
  const o = armar(A, num(ans + unidad), A.barajar(cand).map(v => num(v + unidad))); if (!o) return null;
  return { tipo: 'balanza', pregunta: pre, visual: { kind: 'balanzas', platos }, ...o, explica: ex };
}

/* ---------- 5. códigos secretos ---------- */
const PALABRAS_COD = {
  es: [['SOL', 'MAR', 'OSO', 'PAN', 'LUZ', 'SAL', 'REY', 'PEZ'], ['ROMA', 'LUNA', 'CASA', 'GATO', 'MESA', 'PATO', 'LOBO', 'SAPO', 'NUBE', 'TREN', 'FLOR', 'LAGO', 'VELA', 'PERA'],
    ['PERRO', 'LIBRO', 'PLAYA', 'MONTE', 'NIEVE', 'TIGRE', 'FUEGO', 'CIELO', 'BARCO', 'PLUMA', 'CAMPO', 'TORRE', 'MUNDO', 'VERDE', 'NOCHE']],
  en: [['CAT', 'DOG', 'SUN', 'PIG', 'COW', 'BOX', 'BUS', 'HEN'], ['MOON', 'STAR', 'FISH', 'BIRD', 'TREE', 'BOOK', 'CAKE', 'KITE', 'FROG', 'BEAR', 'LION', 'GOAT'],
    ['HORSE', 'TIGER', 'WATER', 'APPLE', 'MOUSE', 'SHEEP', 'HOUSE', 'TABLE', 'CHAIR', 'MANGO', 'SNAKE', 'CLOUD', 'RIVER']]
};
const ABC = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const corre = (w, k) => w.split('').map(ch => ABC[norm2(ABC.indexOf(ch) + k, 26)]).join('');
const correCreciente = (w, k) => w.split('').map((ch, i) => ABC[norm2(ABC.indexOf(ch) + k + i, 26)]).join('');
const aNumeros = w => w.split('').map(ch => ABC.indexOf(ch) + 1).join('-');
const alReves = w => w.split('').reverse().join('');
function codigos(nv, A, idioma) {
  const L = PALABRAS_COD[idioma], grupo = nv <= 2 ? L[0] : nv <= 5 ? L[1] : L[A.ri(1, 2)];
  const [w1, w2, w3] = A.muestra(grupo, 3);
  let f, regla, malas, k = 0, tipo;
  if (nv <= 2) { k = 1; tipo = 'corre'; }
  else if (nv <= 4) { k = A.pick([1, -1]); tipo = 'corre'; }
  else if (nv <= 6) { tipo = A.pick(['corre', 'corre', 'reves']); k = A.pick([2, 3, -2]); }
  else if (nv <= 8) { tipo = A.pick(['corre', 'numeros', 'reves-corre']); k = A.pick([2, 3, -1, -3]); }
  else { tipo = A.pick(['creciente', 'reves-corre', 'numeros-reves']); k = A.pick([1, 2, -1]); }
  const dir = k > 0 ? 'adelante' : 'atrás', K = Math.abs(k), letras = K === 1 ? 'una letra' : K + ' letras';
  if (tipo === 'corre') { f = w => corre(w, k); regla = 'Cada letra se corre ' + letras + ' hacia ' + dir + ' en el abecedario'; malas = [corre(w2, k + 1), corre(w2, k - 1 || -k), corre(w2, -k), alReves(corre(w2, k))]; }
  else if (tipo === 'reves') { f = alReves; regla = 'La palabra se escribe al revés'; malas = [corre(w2, 1), alReves(w2).slice(1) + w2[0], w2.slice(1) + w2[0], alReves(corre(w2, 1))]; }
  else if (tipo === 'reves-corre') { f = w => alReves(corre(w, k)); regla = 'Cada letra se corre ' + letras + ' hacia ' + dir + ' y la palabra se escribe al revés'; malas = [corre(w2, k), alReves(corre(w2, -k)), alReves(corre(w2, k + 1)), alReves(w2)]; }
  else if (tipo === 'numeros') { f = aNumeros; regla = 'Cada letra es su lugar en el abecedario: A = 1, B = 2, C = 3…'; malas = [w2.split('').map(ch => ABC.indexOf(ch)).join('-'), w2.split('').map(ch => ABC.indexOf(ch) + 2).join('-'), aNumeros(alReves(w2))]; }
  else if (tipo === 'numeros-reves') { f = w => aNumeros(alReves(w)); regla = 'La palabra va al revés y cada letra es su lugar en el abecedario (A = 1)'; malas = [aNumeros(w2), alReves(w2).split('').map(ch => ABC.indexOf(ch)).join('-'), alReves(w2).split('').map(ch => ABC.indexOf(ch) + 2).join('-')]; }
  else { f = w => correCreciente(w, k); regla = 'La primera letra se corre ' + letras + ' hacia ' + dir + ', la segunda una más, la tercera una más…'; malas = [corre(w2, k), corre(w2, k + 1), correCreciente(w2, k + 1), alReves(correCreciente(w2, k))]; }
  const ej = nv >= 9 ? [[w1, f(w1)], [w3, f(w3)]] : [[w1, f(w1)]];
  const sol = f(w2), en = idioma === 'en';
  // que el ejemplo no deje dos reglas posibles: si corre k y al revés dan lo mismo en el ejemplo, se pide otro
  if (ej.some(([a, b]) => a === b)) return null;
  const o = armar(A, txt(sol), A.barajar(malas.map(m => txt(m)))); if (!o) return null;
  return { tipo, pregunta: '¿Cómo se escribe «' + w2 + '» en el código?', preguntaEn: en ? 'How do you write ' + w2 + ' in code?' : null,
    visual: { kind: 'codigo', ejemplos: ej, palabra: w2, abc: nv <= 6 && tipo !== 'reves' }, ...o, codigo: true,
    vozRespuesta: en ? w2.toLowerCase() : null, explica: regla + (/…$/.test(regla) ? ' ' : '. ') + '«' + w2 + '» queda ' + sol + '.' };
}

/* ---------- 6. vistas ---------- */
// alturas[y][x]: y = fila (0 al fondo, 2 al frente), x = columna (0 a la izquierda). El dibujo mira desde el frente a la
// derecha y arriba; se rechazan los montones en que una columna tapa por completo el techo de otra.
function vistas(nv, A) {
  const hmax = nv <= 3 ? 1 : nv <= 6 ? 2 : 3, cubosMin = nv <= 2 ? 3 : 4, cubosMax = nv <= 3 ? 6 : 12;
  let h = null;
  for (let t = 0; t < 60 && !h; t++) {
    const m = rango(3).map(() => rango(3).map(() => (A.si(0.62) ? A.ri(1, hmax) : 0)));
    const tot = m.flat().reduce((a, b) => a + b, 0);
    if (tot < cubosMin || tot > cubosMax) continue;
    const H = (y, x) => (y > 2 || x > 2 ? -1 : m[y][x]);
    let tapa = false;
    for (let y = 0; y < 3; y++) for (let x = 0; x < 3; x++) {
      const v = m[y][x];
      if (H(y + 1, x + 1) > v || H(y + 2, x + 2) > v + 1 || (H(y + 1, x) > v && H(y, x + 1) > v)) tapa = true;
    }
    if (!tapa) h = m;
  }
  if (!h) return null;
  const arriba = h.map(f => f.map(v => (v > 0 ? 1 : 0)));
  const frente = [0, 1, 2].map(x => Math.max(h[0][x], h[1][x], h[2][x]));
  const derecha = [2, 1, 0].map(y => Math.max(...h[y]));
  const total = h.flat().reduce((a, b) => a + b, 0);
  const tipo = nv <= 3 ? 'arriba' : nv <= 6 ? A.pick(['arriba', 'frente']) : A.pick(['frente', 'derecha', 'cuenta', 'arriba']);
  const vista = (m, kind) => ({ t: 'vista', kind, m, d: descVista(m, kind) });
  let b, malas, pre;
  if (tipo === 'arriba') {
    pre = '¿Qué ves si miras el montón desde arriba?';
    b = vista(arriba, 'arriba');
    const espejo = arriba.map(f => f.slice().reverse()), giro = [0, 1, 2].map(y => [0, 1, 2].map(x => arriba[2 - x][y]));
    const cambia = () => { const c = arriba.map(f => f.slice()), y = A.ri(0, 2), x = A.ri(0, 2); c[y][x] = 1 - c[y][x]; return c; };
    malas = A.barajar([vista(espejo, 'arriba'), vista(giro, 'arriba'), vista(cambia(), 'arriba'), vista(cambia(), 'arriba'), vista(arriba.slice().reverse(), 'arriba')]);
  } else if (tipo === 'cuenta') {
    pre = '¿Cuántos cubos hay en el montón? (Los de abajo sostienen a los de arriba.)';
    b = num(total);
    const visibles = h.flat().filter(v => v > 0).length;
    malas = A.barajar([num(total + 1), num(total - 1), num(visibles), num(total + 2), num(total - 2)].filter(p => +p.s > 0));
  } else {
    const v = tipo === 'frente' ? frente : derecha, otra = tipo === 'frente' ? derecha : frente;
    pre = tipo === 'frente' ? '¿Qué ves si miras el montón de frente?' : '¿Qué ves si miras el montón desde la derecha?';
    b = vista(v, 'lado');
    const sube = () => { const c = v.slice(), i = A.ri(0, 2); c[i] = c[i] >= hmax ? c[i] - 1 : c[i] + 1; return c; };
    malas = A.barajar([vista(v.slice().reverse(), 'lado'), vista(otra, 'lado'), vista(sube(), 'lado'), vista(sube(), 'lado')].filter(p => p.m.some(x => x > 0)));
  }
  const o = armar(A, b, malas); if (!o) return null;
  const ex = tipo === 'arriba' ? 'Desde arriba se ve un cuadrado por cada columna que tiene cubos, sin importar su altura.'
    : tipo === 'cuenta' ? 'Se suman las alturas de cada columna: ' + h.flat().filter(x => x).join(' + ') + ' = ' + total + '.'
      : 'De ' + (tipo === 'frente' ? 'frente' : 'lado') + ' cada columna se ve tan alta como su torre más alta: ' + (tipo === 'frente' ? frente : derecha).join(', ') + ' cubos.';
  return { tipo, pregunta: pre, preguntaEn: null, visual: { kind: 'cubos', h }, ...o, figuras: tipo !== 'cuenta', explica: ex };
}
function descVista(m, kind) {
  if (kind === 'lado') return 'de izquierda a derecha, columnas de ' + m.join(', ') + ' cubos';
  const filas = ['atrás', 'en medio', 'al frente'];
  return 'cuadrados ' + m.map((f, y) => filas[y] + ': ' + (f.some(v => v) ? f.map((v, x) => (v ? ['izquierda', 'centro', 'derecha'][x] : null)).filter(Boolean).join(' y ') : 'ninguno')).join('; ');
}

/* ---------- la puerta ---------- */
const FAMILIAS = {
  series: { nombre: 'Series', icono: '🔢', fn: series },
  matrices: { nombre: 'Matrices', icono: '🔳', fn: matrices },
  analogias: { nombre: 'Analogías', icono: '🔗', fn: analogias },
  balanzas: { nombre: 'Balanzas', icono: '⚖️', fn: balanzas },
  codigos: { nombre: 'Códigos', icono: '🔐', fn: codigos },
  vistas: { nombre: 'Vistas', icono: '🧊', fn: vistas }
};
function generar(familia, nivel, op) {
  op = op || {};
  const A = Azar(op.rng), nv = Math.max(1, Math.min(10, Math.round(nivel))), idioma = op.idioma === 'en' ? 'en' : 'es';
  const F = FAMILIAS[familia]; if (!F) return null;
  for (let t = 0; t < 40; t++) {
    let e = null;
    try { e = F.fn(nv, A, idioma); } catch (err) { if (op.estricto) throw err; e = null; }
    if (e && e.opciones && e.opciones.length >= 3 && e.correcta >= 0) { e.familia = familia; e.nivel = nv; return e; }
  }
  return null;
}

const API = { generar, FAMILIAS, descFig, fig, clave, _: { corre, correCreciente, aNumeros, alReves, LISTAS, PAL, EMO } };
if (typeof module !== 'undefined' && module.exports) module.exports = API; else root.Enigmas = API;
})(typeof window !== 'undefined' ? window : this);
