/* Átomo a Átomo — la química (sin pantalla: se prueba en Node con scratchpad/atomo/prueba.mjs).
   - ELEM: los elementos con su valencia (los enlaces que hace), sus electrones de valencia, el color CPK de las escenas
     `molecula` y `reaccion` de la Biblioteca (app2 biblioteca/escenas/molecula.ts y reaccion.ts: los mismos hex), el
     radio covalente (Å) y la masa atómica (IUPAC, redondeada).
   - Una molécula es un grafo {sim: ['C','H',…], enl: [[i, j, orden], …]}: siempre un árbol (el juego no cierra
     anillos). `desdeEst('CC(=O)O')` lo arma de una cadena tipo SMILES (los átomos que se escriben, «=» doble, «#»
     triple, ramas entre paréntesis) y completa con H lo que falta de la valencia.
   - `codigo(g)`: el código canónico del árbol (AHU, exacto en árboles): dos grafos son la misma molécula si y sólo si
     dan el mismo código. Distingue isómeros (etanol y éter dimetílico, butano e isobutano).
   - `geometria(g, i)`: la forma alrededor de un átomo por RPECV (VSEPR): enlazados + pares libres = dominios.
   - `balancear(ecuacion)`: los coeficientes enteros mínimos por eliminación de Gauss con fracciones (el núcleo de la
     matriz de elementos tiene que ser de dimensión 1). `cuenta`, `masa` y `masaLado` para la conservación de la masa.
   - MOLECULAS y REACCIONES: el catálogo del juego (pedidos, álbum y balanceo), cada una con su contexto de la vida.
   window.AtomoQuimica (o module.exports en Node). */
(function (raiz) {
'use strict';

/* ---------- los elementos ---------- */
// sím, nombre, nombre en inglés, valencia (enlaces), electrones de valencia, color CPK, tinta de la letra, radio covalente (Å), masa (u), ¿se arma?
const FILAS = [
  ['H', 'Hidrógeno', 'hydrogen', 1, 1, '#f2f4f7', '#15304d', 0.31, 1.008, true],
  ['C', 'Carbono', 'carbon', 4, 4, '#8c96a3', '#ffffff', 0.76, 12.011, true],
  ['N', 'Nitrógeno', 'nitrogen', 3, 5, '#4a72ff', '#ffffff', 0.71, 14.007, true],
  ['O', 'Oxígeno', 'oxygen', 2, 6, '#f0473a', '#ffffff', 0.66, 15.999, true],
  ['F', 'Flúor', 'fluorine', 1, 7, '#9be06a', '#15304d', 0.57, 18.998, true],
  ['Cl', 'Cloro', 'chlorine', 1, 7, '#3fcf4a', '#15304d', 1.02, 35.45, true],
  ['Br', 'Bromo', 'bromine', 1, 7, '#a62929', '#ffffff', 1.2, 79.904, true],
  ['I', 'Yodo', 'iodine', 1, 7, '#7a2bbf', '#ffffff', 1.39, 126.904, true],
  ['S', 'Azufre', 'sulfur', 2, 6, '#f5d33a', '#15304d', 1.05, 32.06, true],
  ['P', 'Fósforo', 'phosphorus', 3, 5, '#ff9a1f', '#15304d', 1.07, 30.974, true],
  // sólo en las reacciones (metales y lo iónico: no se arman con brazos)
  ['Na', 'Sodio', 'sodium', 1, 1, '#ab5cf2', '#ffffff', 1.66, 22.99, false],
  ['K', 'Potasio', 'potassium', 1, 1, '#8f40d4', '#ffffff', 2.03, 39.098, false],
  ['Mg', 'Magnesio', 'magnesium', 2, 2, '#a7d84a', '#15304d', 1.41, 24.305, false],
  ['Ca', 'Calcio', 'calcium', 2, 2, '#5ec26a', '#15304d', 1.76, 40.078, false],
  ['Al', 'Aluminio', 'aluminium', 3, 3, '#bfa6a6', '#15304d', 1.21, 26.982, false],
  ['Fe', 'Hierro', 'iron', 3, 2, '#e06633', '#ffffff', 1.32, 55.845, false],
  ['Cu', 'Cobre', 'copper', 2, 1, '#c88033', '#ffffff', 1.32, 63.546, false],
  ['Zn', 'Zinc', 'zinc', 2, 2, '#7d80b0', '#ffffff', 1.22, 65.38, false],
  ['Ag', 'Plata', 'silver', 1, 1, '#c0c0c0', '#15304d', 1.45, 107.868, false]
];
const ELEM = {};
FILAS.forEach(f => { ELEM[f[0]] = { s: f[0], nombre: f[1], en: f[2], val: f[3], ve: f[4], color: f[5], tinta: f[6], cov: f[7], masa: f[8], arma: f[9], libres: f[9] ? (f[4] - f[3]) / 2 : 0 }; });
const SIMBOLOS = Object.keys(ELEM).sort((a, b) => b.length - a.length); // los de dos letras primero
const ARMABLES = FILAS.filter(f => f[9]).map(f => f[0]);

const BAJO = '₀₁₂₃₄₅₆₇₈₉';
const sub = f => String(f).replace(/\d/g, d => BAJO[+d]);
const sinTilde = t => String(t || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();

/* ---------- fórmulas ---------- */
/** «Ca(OH)2» → {Ca: 1, O: 2, H: 2}; null si no se entiende. */
function leerFormula(f) {
  const t = String(f || '').replace(/\s+/g, '').replace(/[₀-₉]/g, d => String(BAJO.indexOf(d)));
  if (!t || !/^[A-Za-z0-9()]+$/.test(t)) return null;
  let i = 0;
  function grupo() {
    const c = {};
    while (i < t.length && t[i] !== ')') {
      let parte;
      if (t[i] === '(') { i++; parte = grupo(); if (t[i] !== ')') return null; i++; }
      else {
        const s = SIMBOLOS.find(x => t.startsWith(x, i));
        if (!s) return null;
        i += s.length; parte = { [s]: 1 };
      }
      if (!parte) return null;
      let n = ''; while (i < t.length && /\d/.test(t[i])) n += t[i++];
      const k = n ? +n : 1; if (!k) return null;
      for (const s in parte) c[s] = (c[s] || 0) + parte[s] * k;
    }
    return c;
  }
  const c = grupo();
  return c && i === t.length && Object.keys(c).length ? c : null;
}
/** La fórmula en el orden de Hill (C, H y luego por orden alfabético); sin C, el orden de siempre en clase (H₂O, NH₃, HCl). */
function hill(c) {
  const ks = Object.keys(c).filter(k => c[k] > 0);
  const n = k => k + (c[k] > 1 ? c[k] : '');
  if (c.C) return ['C', 'H'].filter(k => c[k]).concat(ks.filter(k => k !== 'C' && k !== 'H').sort()).map(n).join('');
  const ORDEN = ['Na', 'K', 'Mg', 'Ca', 'Al', 'Fe', 'Cu', 'Zn', 'Ag', 'N', 'P', 'H', 'S', 'I', 'Br', 'Cl', 'O', 'F'];
  return ks.sort((a, b) => ORDEN.indexOf(a) - ORDEN.indexOf(b)).map(n).join('');
}
const contar = sim => { const c = {}; sim.forEach(s => { c[s] = (c[s] || 0) + 1; }); return c; };
const masa = c => Object.keys(c).reduce((m, s) => m + ELEM[s].masa * c[s], 0);
const igualCuenta = (a, b) => { const ks = new Set(Object.keys(a).concat(Object.keys(b))); for (const k of ks) if ((a[k] || 0) !== (b[k] || 0)) return false; return true; };

/* ---------- el grafo ---------- */
const vecinos = (g, i) => g.enl.filter(e => e[0] === i || e[1] === i).map(e => ({ j: e[0] === i ? e[1] : e[0], o: e[2] }));
const usados = (g, i) => g.enl.reduce((s, e) => s + (e[0] === i || e[1] === i ? e[2] : 0), 0);
const libres = (g, i) => ELEM[g.sim[i]].val - usados(g, i);
const completa = g => g.sim.length > 1 && g.sim.every((s, i) => libres(g, i) === 0);

/** «CC(=O)O» → el grafo con sus H. Lanza un error si un átomo pasa de su valencia. */
function desdeEst(est) {
  const sim = [], enl = [], pila = [];
  let prev = -1, orden = 1, i = 0;
  const t = String(est);
  while (i < t.length) {
    const ch = t[i];
    if (ch === '(') { pila.push(prev); i++; continue; }
    if (ch === ')') { prev = pila.pop(); i++; continue; }
    if (ch === '=') { orden = 2; i++; continue; }
    if (ch === '#') { orden = 3; i++; continue; }
    const s = SIMBOLOS.find(x => t.startsWith(x, i));
    if (!s) throw new Error('no entiendo «' + t.slice(i) + '» en ' + est);
    i += s.length;
    sim.push(s);
    const k = sim.length - 1;
    if (prev >= 0) enl.push([prev, k, orden]);
    prev = k; orden = 1;
  }
  const g = { sim, enl };
  const pesados = sim.length;
  for (let k = 0; k < pesados; k++) {
    const f = libres(g, k);
    if (f < 0) throw new Error(sim[k] + ' pasa de su valencia en ' + est);
    for (let h = 0; h < f; h++) { sim.push('H'); enl.push([k, sim.length - 1, 1]); }
  }
  return g;
}

/** ¿Es un árbol conexo? (n − 1 enlaces y todos alcanzables) */
function esArbol(g) {
  const n = g.sim.length;
  if (g.enl.length !== n - 1) return false;
  const visto = new Set([0]), cola = [0];
  while (cola.length) { const a = cola.shift(); vecinos(g, a).forEach(v => { if (!visto.has(v.j)) { visto.add(v.j); cola.push(v.j); } }); }
  return visto.size === n;
}
/** El centro (o los dos centros) del árbol: se quitan hojas por capas. */
function centros(g) {
  const n = g.sim.length;
  if (n <= 2) return [...Array(n).keys()];
  const grado = g.sim.map((s, i) => vecinos(g, i).length);
  let hojas = grado.map((d, i) => (d <= 1 ? i : -1)).filter(i => i >= 0), quedan = n;
  const fuera = new Set();
  while (quedan > 2) {
    quedan -= hojas.length;
    const nuevas = [];
    hojas.forEach(h => { fuera.add(h); vecinos(g, h).forEach(v => { if (fuera.has(v.j)) return; grado[v.j]--; if (grado[v.j] === 1) nuevas.push(v.j); }); });
    hojas = nuevas;
  }
  return hojas;
}
/** El código canónico (AHU): el mismo para dos dibujos de la misma molécula, distinto para isómeros. */
function codigo(g) {
  if (!g || !g.sim.length) return '';
  const cod = (v, p) => g.sim[v] + '(' + vecinos(g, v).filter(x => x.j !== p).map(x => x.o + cod(x.j, v)).sort().join(',') + ')';
  return centros(g).map(c => cod(c, -1)).sort()[0];
}

/* ---------- la forma (RPECV / VSEPR) ---------- */
const FORMAS = {
  lineal: { nombre: 'lineal', angulo: '180°' },
  angular: { nombre: 'angular', angulo: 'menos de 120°' },
  trigonal: { nombre: 'trigonal plana', angulo: '120°' },
  piramidal: { nombre: 'piramidal', angulo: 'unos 107°' },
  tetraedrica: { nombre: 'tetraédrica', angulo: '109,5°' }
};
/** La forma alrededor del átomo i (con la molécula completa): {forma, enlazados, pares, dominios}. */
function geometria(g, i) {
  const e = ELEM[g.sim[i]], nb = vecinos(g, i).length;
  const pares = e.arma ? Math.max(0, (e.ve - usados(g, i)) / 2) : 0, dom = nb + pares;
  let forma = 'lineal';
  if (nb <= 1) forma = 'lineal';
  else if (dom === 2) forma = 'lineal';
  else if (dom === 3) forma = nb === 3 ? 'trigonal' : 'angular';
  else if (dom >= 4) forma = nb === 4 ? 'tetraedrica' : nb === 3 ? 'piramidal' : 'angular';
  return { forma, enlazados: nb, pares, dominios: dom };
}
/** La forma de la molécula si tiene un solo centro (o es diatómica): {forma, centro} o null. */
function formaMolecula(g) {
  const cs = g.sim.map((s, i) => i).filter(i => vecinos(g, i).length >= 2);
  if (!cs.length) return g.sim.length === 2 ? { forma: 'lineal', centro: -1 } : null;
  if (cs.length === 1) return { forma: geometria(g, cs[0]).forma, centro: cs[0] };
  const fs = cs.map(i => geometria(g, i).forma);
  // el etino (todo en una recta) y el eteno (todo en un plano): la misma forma en cada centro
  if ((fs[0] === 'lineal' || fs[0] === 'trigonal') && fs.every(f => f === fs[0])) return { forma: fs[0], centro: cs[0] };
  return null;
}

/* ---------- las reacciones ---------- */
/** «CH4 + O2 -> CO2 + H2O» → {izq: ['CH4','O2'], der: ['CO2','H2O']}; null si no se entiende. */
function leerEcuacion(t) {
  const lados = String(t || '').split(/\s*(?:->|→|=>|⟶)\s*/);
  if (lados.length !== 2) return null;
  const lado = s => s.split(/\s+\+\s+/).map(x => x.trim()).filter(Boolean);
  const izq = lado(lados[0]), der = lado(lados[1]);
  if (!izq.length || !der.length) return null;
  // sin coeficientes delante: los pone el jugador
  if (izq.concat(der).some(f => /^\d/.test(f) || !leerFormula(f))) return null;
  return { izq, der };
}
const mcd = (a, b) => { a = Math.abs(a); b = Math.abs(b); while (b) [a, b] = [b, a % b]; return a; };
// fracciones pequeñas [num, den]
const fr = (n, d) => { if (d < 0) { n = -n; d = -d; } const k = mcd(n, d) || 1; return [n / k, d / k]; };
const fmul = (a, b) => fr(a[0] * b[0], a[1] * b[1]);
const fsub = (a, b) => fr(a[0] * b[1] - b[0] * a[1], a[1] * b[1]);
const fdiv = (a, b) => fr(a[0] * b[1], a[1] * b[0]);
/** Los coeficientes enteros mínimos (todos positivos) de la ecuación, o null si no hay uno solo. */
function balancear(ec) {
  const e = typeof ec === 'string' ? leerEcuacion(ec) : ec;
  if (!e) return null;
  const esp = e.izq.concat(e.der).map(leerFormula), n = esp.length;
  const els = [...new Set(esp.flatMap(c => Object.keys(c)))];
  // la matriz: una fila por elemento, una columna por sustancia (los productos en negativo)
  const M = els.map(s => esp.map((c, j) => fr((c[s] || 0) * (j < e.izq.length ? 1 : -1), 1)));
  // eliminación de Gauss (forma escalonada reducida)
  const piv = []; let fila = 0;
  for (let col = 0; col < n && fila < M.length; col++) {
    let p = fila; while (p < M.length && M[p][col][0] === 0) p++;
    if (p === M.length) continue;
    [M[fila], M[p]] = [M[p], M[fila]];
    const d = M[fila][col];
    M[fila] = M[fila].map(x => fdiv(x, d));
    for (let r = 0; r < M.length; r++) if (r !== fila && M[r][col][0] !== 0) { const k = M[r][col]; M[r] = M[r].map((x, j) => fsub(x, fmul(k, M[fila][j]))); }
    piv.push(col); fila++;
  }
  const librees = [...Array(n).keys()].filter(c => piv.indexOf(c) < 0);
  if (librees.length !== 1) return null; // ninguna o muchas maneras: no es una reacción para balancear
  const L = librees[0], x = Array(n).fill(null);
  x[L] = [1, 1];
  piv.forEach((c, r) => { x[c] = fsub([0, 1], M[r][L]); });
  const den = x.reduce((m, v) => m * v[1] / mcd(m, v[1]), 1);
  let ent = x.map(v => v[0] * den / v[1]);
  if (ent.every(v => v <= 0)) ent = ent.map(v => -v);
  if (ent.some(v => v <= 0)) return null;
  const k = ent.reduce((a, b) => mcd(a, b));
  return ent.map(v => v / k);
}
/** Los átomos de cada elemento a un lado con esos coeficientes. */
function cuentaLado(formulas, coef) {
  const c = {};
  formulas.forEach((f, j) => { const a = leerFormula(f); for (const s in a) c[s] = (c[s] || 0) + a[s] * (coef[j] || 0); });
  return c;
}
const masaLado = (formulas, coef) => formulas.reduce((m, f, j) => m + masa(leerFormula(f)) * (coef[j] || 0), 0);

/* ---------- el catálogo de moléculas ----------
   id, nombre, en (inglés), emoji, est (la cadena tipo SMILES), formula (la de Hill, que comprueba la prueba),
   alias (otras maneras de pedirla), grado (desde), temas, forma (la que da RPECV, la comprueba la prueba), angulo,
   pedido (para qué la quiere el cliente), dato (lo que se cuenta al armarla), estado a 25 °C, armar (false: sólo en
   reacciones o en el álbum por ser muy grande). */
const MOLECULAS = [
  { id: 'agua', nombre: 'agua', en: 'water', emoji: '💧', est: 'O', formula: 'H2O', grado: 6, temas: ['vida', 'formas'], forma: 'angular', angulo: '104,5°', estado: 'líquido',
    pedido: 'Agua para la planta', dato: 'El oxígeno tiene dos pares de electrones libres que empujan a los H hacia abajo: por eso el agua es angular y no recta.' },
  { id: 'oxigeno', nombre: 'oxígeno', en: 'oxygen', emoji: '🤿', est: 'O=O', formula: 'O2', grado: 6, temas: ['vida', 'aire'], forma: 'lineal', estado: 'gas',
    pedido: 'Aire para la buceadora', dato: 'Dos oxígenos unidos con un enlace doble: es el gas que respiramos (el 21 % del aire).' },
  { id: 'hidrogeno', nombre: 'hidrógeno', en: 'hydrogen', emoji: '🎈', est: 'HH', formula: 'H2', grado: 6, temas: ['vida', 'aire'], forma: 'lineal', estado: 'gas',
    pedido: 'Gas muy liviano para el globo', dato: 'La molécula más pequeña de todas: dos H con un enlace sencillo. Es el gas más liviano.' },
  { id: 'nitrogeno', nombre: 'nitrógeno', en: 'nitrogen', emoji: '🌬️', est: 'N#N', formula: 'N2', grado: 6, temas: ['vida', 'aire'], forma: 'lineal', estado: 'gas',
    pedido: 'Gas para la bolsa de papas fritas', dato: 'Un enlace triple, muy fuerte: casi no reacciona. Es el 78 % del aire y protege las papas de la bolsa.' },
  { id: 'dioxido', nombre: 'dióxido de carbono', en: 'carbon dioxide', emoji: '🥤', est: 'O=C=O', formula: 'CO2', alias: ['co2'], grado: 6, temas: ['vida', 'aire', 'formas', 'casa'], forma: 'lineal', angulo: '180°', estado: 'gas',
    pedido: '¡Algo que burbujee en el refresco!', dato: 'El C hace dos enlaces dobles, uno a cada lado, y no le quedan pares libres: por eso es recto (lineal).' },
  { id: 'metano', nombre: 'metano', en: 'methane', emoji: '🔥', est: 'C', formula: 'CH4', grado: 6, temas: ['vida', 'formas', 'organica'], forma: 'tetraedrica', angulo: '109,5°', estado: 'gas',
    pedido: 'Gas natural para la estufa', dato: 'Los cuatro H se separan lo más que pueden: quedan en las puntas de un tetraedro.' },
  { id: 'amoniaco', nombre: 'amoníaco', en: 'ammonia', emoji: '🧴', est: 'N', formula: 'NH3', grado: 7, temas: ['vida', 'formas', 'casa'], forma: 'piramidal', angulo: '107°', estado: 'gas',
    pedido: 'Abono para el cultivo de maíz', dato: 'El N hace tres enlaces y le queda un par libre arriba: la molécula es una pirámide.' },
  { id: 'cloruro-hidrogeno', nombre: 'cloruro de hidrógeno', en: 'hydrogen chloride', emoji: '🧪', est: 'Cl', formula: 'HCl', alias: ['acido clorhidrico'], grado: 7, temas: ['casa', 'formas'], forma: 'lineal', estado: 'gas',
    pedido: 'El ácido que tiene el estómago', dato: 'Disuelto en agua es el ácido clorhídrico, el que ayuda a digerir en el estómago.' },
  { id: 'cloro', nombre: 'cloro', en: 'chlorine', emoji: '🏊', est: 'ClCl', formula: 'Cl2', grado: 7, temas: ['casa', 'aire'], forma: 'lineal', estado: 'gas',
    pedido: 'Para desinfectar el agua del acueducto', dato: 'Dos cloros con un enlace sencillo: cada uno tiene 7 electrones de valencia y comparte uno.' },
  { id: 'peroxido', nombre: 'peróxido de hidrógeno', en: 'hydrogen peroxide', emoji: '🩹', est: 'OO', formula: 'H2O2', alias: ['agua oxigenada'], grado: 8, temas: ['casa'], estado: 'líquido',
    pedido: 'Agua oxigenada para limpiar la herida', dato: 'Como el agua, pero con un oxígeno de más (O–O): se rompe fácil y suelta burbujas de oxígeno.' },
  { id: 'sulfuro-hidrogeno', nombre: 'sulfuro de hidrógeno', en: 'hydrogen sulfide', emoji: '🥚', est: 'S', formula: 'H2S', grado: 8, temas: ['formas', 'casa'], forma: 'angular', angulo: '92°', estado: 'gas',
    pedido: 'El gas con olor a huevo podrido', dato: 'El azufre está en la misma columna que el oxígeno: hace dos enlaces y es angular, como el agua.' },
  { id: 'metanal', nombre: 'metanal (formaldehído)', en: 'formaldehyde', emoji: '🧫', est: 'C=O', formula: 'CH2O', grado: 10, temas: ['formas', 'organica'], forma: 'trigonal', angulo: '120°', estado: 'gas',
    pedido: 'Para conservar las muestras del museo', dato: 'El C con un enlace doble tiene tres vecinos y ningún par libre: es plano, a 120°.' },
  { id: 'etano', nombre: 'etano', en: 'ethane', emoji: '⛽', est: 'CC', formula: 'C2H6', grado: 9, temas: ['organica'], estado: 'gas',
    pedido: 'Un gas del petróleo con dos carbonos', dato: 'Dos C con un enlace sencillo: cada uno es un tetraedro. Es un alcano (sólo enlaces sencillos).' },
  { id: 'propano', nombre: 'propano', en: 'propane', emoji: '🏕️', est: 'CCC', formula: 'C3H8', grado: 9, temas: ['organica', 'casa'], estado: 'gas',
    pedido: 'Gas para la pipeta de la cocina', dato: 'Tres C en cadena (en zigzag, por los tetraedros). Es el gas de las pipetas.' },
  { id: 'butano', nombre: 'butano', en: 'butane', emoji: '🔥', est: 'CCCC', formula: 'C4H10', grado: 9, temas: ['organica', 'casa'], estado: 'gas',
    pedido: 'Gas para el encendedor', dato: 'Cuatro C en cadena recta. Tiene un isómero: el isobutano, con la misma fórmula y otra forma.' },
  { id: 'isobutano', nombre: 'isobutano (metilpropano)', en: 'isobutane', emoji: '🌿', est: 'CC(C)C', formula: 'C4H10', alias: ['metilpropano'], grado: 10, temas: ['organica'], estado: 'gas',
    pedido: 'C₄H₁₀ ramificado: tres C pegados a uno del centro', dato: 'La misma fórmula que el butano, C₄H₁₀, pero ramificada: son isómeros.' },
  { id: 'eteno', nombre: 'eteno (etileno)', en: 'ethylene', emoji: '🍌', est: 'C=C', formula: 'C2H4', alias: ['etileno'], grado: 9, temas: ['organica', 'formas'], forma: 'trigonal', angulo: '120°', estado: 'gas',
    pedido: 'El gas que hace madurar los bananos', dato: 'Un enlace doble entre los C: cada C tiene tres vecinos y la molécula es plana. Es un alqueno.' },
  { id: 'etino', nombre: 'etino (acetileno)', en: 'acetylene', emoji: '👨‍🏭', est: 'C#C', formula: 'C2H2', alias: ['acetileno'], grado: 9, temas: ['organica', 'formas'], forma: 'lineal', angulo: '180°', estado: 'gas',
    pedido: 'Gas para el soplete del soldador', dato: 'Un enlace triple: los cuatro átomos quedan en una recta. Es un alquino.' },
  { id: 'metanol', nombre: 'metanol', en: 'methanol', emoji: '⚠️', est: 'CO', formula: 'CH4O', alias: ['ch3oh'], grado: 9, temas: ['organica'], estado: 'líquido',
    pedido: 'Alcohol de un carbono para el combustible (¡no se toma!)', dato: 'El alcohol más sencillo: un C con un grupo –OH. Es tóxico.' },
  { id: 'etanol', nombre: 'etanol', en: 'ethanol', emoji: '🧴', est: 'CCO', formula: 'C2H6O', alias: ['c2h5oh', 'ch3ch2oh', 'alcohol etilico'], grado: 9, temas: ['organica', 'casa'], estado: 'líquido',
    pedido: 'Alcohol para desinfectar las manos', dato: 'Dos C y el grupo –OH al final. Tiene un isómero: el éter dimetílico, con el O en el medio.' },
  { id: 'eter', nombre: 'éter dimetílico', en: 'dimethyl ether', emoji: '💨', est: 'COC', formula: 'C2H6O', alias: ['ch3och3', 'metoximetano'], grado: 10, temas: ['organica'], estado: 'gas',
    pedido: 'C₂H₆O con el oxígeno en el medio', dato: 'La misma fórmula que el etanol, pero con el O entre los dos C: otro compuesto, un gas.' },
  { id: 'acetico', nombre: 'ácido acético', en: 'acetic acid', emoji: '🥗', est: 'CC(=O)O', formula: 'C2H4O2', alias: ['ch3cooh', 'acido etanoico'], grado: 10, temas: ['organica', 'casa'], estado: 'líquido',
    pedido: 'Vinagre para la ensalada', dato: 'El grupo carboxilo –COOH (un C con =O y –OH) lo hace ácido. El vinagre lo tiene.' },
  { id: 'acetona', nombre: 'acetona (propanona)', en: 'acetone', emoji: '💅', est: 'CC(=O)C', formula: 'C3H6O', alias: ['propanona', 'ch3coch3'], grado: 10, temas: ['organica', 'casa'], estado: 'líquido',
    pedido: 'Quitaesmalte para las uñas', dato: 'El C del medio tiene un =O: es una cetona.' },
  { id: 'metilamina', nombre: 'metilamina', en: 'methylamine', emoji: '🐟', est: 'CN', formula: 'CH5N', alias: ['ch3nh2'], grado: 11, temas: ['organica'], estado: 'gas',
    pedido: 'Lo que huele a pescado', dato: 'Un C unido al grupo amino –NH₂: es una amina.' },
  { id: 'urea', nombre: 'urea', en: 'urea', emoji: '🌾', est: 'NC(=O)N', formula: 'CH4N2O', grado: 11, temas: ['organica'], estado: 'sólido',
    pedido: 'Abono con mucho nitrógeno', dato: 'Un C con =O y dos grupos –NH₂. Fue la primera molécula de la vida hecha en un laboratorio (Wöhler, 1828).' },
  { id: 'clorometano', nombre: 'clorometano', en: 'chloromethane', emoji: '❄️', est: 'CCl', formula: 'CH3Cl', grado: 10, temas: ['organica', 'formas'], forma: 'tetraedrica', angulo: 'unos 109,5°', estado: 'gas',
    pedido: 'Un metano con un cloro', dato: 'Como el metano, pero un H cambiado por un Cl: sigue siendo un tetraedro.' },
  { id: 'fluoruro-hidrogeno', nombre: 'fluoruro de hidrógeno', en: 'hydrogen fluoride', emoji: '🔬', est: 'F', formula: 'HF', grado: 10, temas: ['formas'], forma: 'lineal', estado: 'gas',
    pedido: 'Para grabar el vidrio', dato: 'El flúor es el elemento que más atrae a los electrones: el enlace H–F es muy polar.' },
  { id: 'fosfina', nombre: 'fosfina', en: 'phosphine', emoji: '🔥', est: 'P', formula: 'PH3', grado: 11, temas: ['formas'], forma: 'piramidal', angulo: '93,5°', estado: 'gas',
    pedido: 'La prima del amoníaco con fósforo', dato: 'El P está debajo del N en la tabla: tres enlaces y un par libre, piramidal como el amoníaco.' },
  { id: 'glucosa', nombre: 'glucosa', en: 'glucose', emoji: '🍬', est: 'OCC(O)C(O)C(O)C(O)C=O', formula: 'C6H12O6', grado: 11, temas: [], armar: false, estado: 'sólido',
    pedido: 'El azúcar que da energía', dato: 'La glucosa en cadena abierta (en el agua casi siempre se cierra en anillo).' }
];
const POR_ID = {};
MOLECULAS.forEach(m => {
  m.g = desdeEst(m.est);
  m.codigo = codigo(m.g);
  m.cuenta = contar(m.g.sim);
  m.hill = hill(m.cuenta);
  m.masa = masa(m.cuenta);
  if (m.armar === undefined) m.armar = true;
  POR_ID[m.id] = m;
});
/** Las moléculas del catálogo con esa estructura (por el código) */
const porCodigo = c => MOLECULAS.find(m => m.codigo === c) || null;
/** Las maneras de nombrar una molécula (sin tildes): el id, el nombre, lo de entre paréntesis, el inglés y los alias. */
function nombres(m) {
  const p = String(m.nombre).match(/^(.*?)\s*\((.*)\)\s*$/);
  return [m.id, m.nombre, m.en].concat(p ? [p[1], p[2]] : [], m.alias || []).map(sinTilde).filter(Boolean);
}
/** Lo que pide un `construir` de la lección: el nombre, un alias o una fórmula. → {mol?, cuenta, formula, nombre, exacta} */
function resolver(x) {
  const t = typeof x === 'string' ? x : x && typeof x === 'object' ? x.formula || x.molecula || '' : '';
  if (!String(t).trim()) return null;
  const k = sinTilde(t);
  const m = MOLECULAS.find(m => nombres(m).indexOf(k) >= 0);
  if (m) return { mol: m, cuenta: m.cuenta, formula: m.hill, nombre: m.nombre, exacta: true };
  const c = leerFormula(t);
  if (!c) return null;
  if (Object.keys(c).some(s => !ELEM[s] || !ELEM[s].arma)) return null;
  const n = Object.values(c).reduce((a, b) => a + b, 0);
  if (n < 2 || n > 24 || !armable(c)) return null;
  // una sola del catálogo con esa fórmula: se cuenta su historia, pero vale cualquier estructura
  const del = MOLECULAS.filter(m => m.armar && igualCuenta(m.cuenta, c));
  return { mol: del.length === 1 ? del[0] : null, cuenta: c, formula: hill(c), nombre: del.length === 1 ? del[0].nombre : '', exacta: false };
}
/** ¿Se puede armar un árbol con esos átomos, cada uno con todos sus enlaces (sencillos, dobles o triples)? */
function armable(c) {
  const at = []; for (const s in c) for (let i = 0; i < c[s]; i++) at.push(ELEM[s].val);
  const n = at.length, V = at.reduce((a, b) => a + b, 0);
  if (n < 2 || V % 2) return false;
  const B = V / 2; // la suma de los órdenes de enlace
  if (B < n - 1 || B > 3 * (n - 1)) return false;
  const pesados = at.filter(v => v >= 2), hojas = n - pesados.length;
  if (!pesados.length) return n === 2;
  const Vh = pesados.reduce((a, b) => a + b, 0), resto = Vh - hojas, k = pesados.length;
  if (resto < 0 || resto % 2) return false;
  if (k === 1) return resto === 0;
  const esq = resto / 2; // los órdenes del esqueleto de los pesados
  if (esq < k - 1 || esq > 3 * (k - 1)) return false;
  return pesados.every(v => v >= 1);
}

/* ---------- las reacciones ---------- */
// ecuación sin coeficientes, tipo, grado (desde), temas, solucion (la que comprueba la prueba), contexto
const REACCIONES = [
  { ec: 'H2 + O2 -> H2O', tipo: 'síntesis', grado: 8, temas: ['sintesis'], sol: [2, 1, 2], vida: 'Así se forma el agua en los cohetes que usan hidrógeno.' },
  { ec: 'C + O2 -> CO2', tipo: 'síntesis', grado: 8, temas: ['sintesis', 'combustion'], sol: [1, 1, 1], vida: 'El carbón que se quema en el fogón.' },
  { ec: 'N2 + H2 -> NH3', tipo: 'síntesis', grado: 9, temas: ['sintesis'], sol: [1, 3, 2], vida: 'El proceso de Haber: así se hace el amoníaco de los abonos.' },
  { ec: 'H2 + Cl2 -> HCl', tipo: 'síntesis', grado: 9, temas: ['sintesis'], sol: [1, 1, 2], vida: 'El cloruro de hidrógeno que, en agua, es el ácido clorhídrico.' },
  { ec: 'Na + Cl2 -> NaCl', tipo: 'síntesis', grado: 9, temas: ['sintesis', 'metales'], sol: [2, 1, 2], vida: 'El sodio y el cloro forman la sal de cocina.' },
  { ec: 'Mg + O2 -> MgO', tipo: 'síntesis', grado: 9, temas: ['sintesis', 'metales'], sol: [2, 1, 2], vida: 'La cinta de magnesio arde con una luz blanca muy fuerte.' },
  { ec: 'Fe + O2 -> Fe2O3', tipo: 'síntesis', grado: 10, temas: ['metales'], sol: [4, 3, 2], vida: 'Así se oxida el hierro: el óxido rojo de la reja.' },
  { ec: 'Al + O2 -> Al2O3', tipo: 'síntesis', grado: 10, temas: ['metales'], sol: [4, 3, 2], vida: 'La capa que protege a las ollas de aluminio.' },
  { ec: 'H2O2 -> H2O + O2', tipo: 'descomposición', grado: 9, temas: ['sintesis'], sol: [2, 2, 1], vida: 'Las burbujas del agua oxigenada sobre una herida.' },
  { ec: 'H2O -> H2 + O2', tipo: 'descomposición', grado: 9, temas: ['sintesis'], sol: [2, 2, 1], vida: 'La electrólisis: la corriente separa el agua en sus dos gases.' },
  { ec: 'CaCO3 -> CaO + CO2', tipo: 'descomposición', grado: 10, temas: ['sintesis', 'metales'], sol: [1, 1, 1], vida: 'En el horno, la piedra caliza se vuelve cal.' },
  { ec: 'KClO3 -> KCl + O2', tipo: 'descomposición', grado: 10, temas: ['metales'], sol: [2, 2, 3], vida: 'Así se saca oxígeno en el laboratorio.' },
  { ec: 'CH4 + O2 -> CO2 + H2O', tipo: 'combustión', grado: 8, temas: ['combustion'], sol: [1, 2, 1, 2], vida: 'La llama azul de la estufa de gas natural.' },
  { ec: 'C3H8 + O2 -> CO2 + H2O', tipo: 'combustión', grado: 9, temas: ['combustion'], sol: [1, 5, 3, 4], vida: 'El gas propano de la pipeta, cuando se prende.' },
  { ec: 'C2H6O + O2 -> CO2 + H2O', tipo: 'combustión', grado: 10, temas: ['combustion'], sol: [1, 3, 2, 3], vida: 'El alcohol (etanol) que se quema en el mechero.' },
  { ec: 'C2H2 + O2 -> CO2 + H2O', tipo: 'combustión', grado: 10, temas: ['combustion'], sol: [2, 5, 4, 2], vida: 'La llama del soplete de acetileno.' },
  { ec: 'C2H6 + O2 -> CO2 + H2O', tipo: 'combustión', grado: 10, temas: ['combustion'], sol: [2, 7, 4, 6], vida: 'El etano, un gas del petróleo, cuando arde.' },
  { ec: 'C4H10 + O2 -> CO2 + H2O', tipo: 'combustión', grado: 11, temas: ['combustion'], sol: [2, 13, 8, 10], vida: 'El butano del encendedor.' },
  { ec: 'C6H12O6 + O2 -> CO2 + H2O', tipo: 'respiración', grado: 9, temas: ['combustion', 'vida'], sol: [1, 6, 6, 6], vida: 'La respiración celular: así sacan energía de la glucosa tus células.' },
  { ec: 'CO2 + H2O -> C6H12O6 + O2', tipo: 'fotosíntesis', grado: 9, temas: ['vida'], sol: [6, 6, 1, 6], vida: 'La fotosíntesis: con la luz del sol, la planta hace glucosa y suelta oxígeno.' },
  { ec: 'Zn + HCl -> ZnCl2 + H2', tipo: 'sustitución', grado: 10, temas: ['metales'], sol: [1, 2, 1, 1], vida: 'El zinc en ácido suelta burbujas de hidrógeno.' },
  { ec: 'Mg + HCl -> MgCl2 + H2', tipo: 'sustitución', grado: 10, temas: ['metales'], sol: [1, 2, 1, 1], vida: 'El magnesio burbujea en el ácido clorhídrico.' },
  { ec: 'Fe + CuSO4 -> FeSO4 + Cu', tipo: 'sustitución', grado: 10, temas: ['metales'], sol: [1, 1, 1, 1], vida: 'Un clavo de hierro en sulfato de cobre se cubre de cobre.' },
  { ec: 'HCl + NaOH -> NaCl + H2O', tipo: 'neutralización', grado: 10, temas: ['metales'], sol: [1, 1, 1, 1], vida: 'Un ácido y una base se neutralizan: queda sal y agua.' },
  { ec: 'H2SO4 + NaOH -> Na2SO4 + H2O', tipo: 'neutralización', grado: 11, temas: ['metales'], sol: [1, 2, 1, 2], vida: 'La soda cáustica neutraliza el ácido sulfúrico.' },
  { ec: 'AgNO3 + NaCl -> AgCl + NaNO3', tipo: 'doble sustitución', grado: 11, temas: ['metales'], sol: [1, 1, 1, 1], vida: 'Aparece un sólido blanco: el cloruro de plata.' },
  { ec: 'NH3 + O2 -> NO + H2O', tipo: 'oxidación', grado: 11, temas: ['combustion'], sol: [4, 5, 4, 6], vida: 'El primer paso para hacer ácido nítrico (proceso de Ostwald).' }
];
REACCIONES.forEach(r => { r.e = leerEcuacion(r.ec); r.coef = balancear(r.e); });


/* ---------- dónde va cada átomo en 3D (RPECV) ----------
   Desde la raíz: cada átomo reparte sus dominios (vecinos + brazos libres + pares libres) en lineal (2), trigonal (3)
   o tetraedro (4). El primer hijo va en anti respecto al abuelo (las cadenas en zigzag) y los dobles enlaces dejan
   todo en un plano (el eteno). Los pares libres cierran un poco los ángulos de los enlaces (el agua a 104,5°, el
   amoníaco a 107°). Devuelve {pos, brazos, pares}: posiciones en Å y, por átomo, las direcciones de sus brazos libres
   y de sus pares libres. */
const v3 = { suma: (a, b) => [a[0] + b[0], a[1] + b[1], a[2] + b[2]], resta: (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]], esc: (a, k) => [a[0] * k, a[1] * k, a[2] * k],
  punto: (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2], cruz: (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]],
  unit: a => { const l = Math.hypot(a[0], a[1], a[2]) || 1; return [a[0] / l, a[1] / l, a[2] / l]; } };
const TETRA = Math.acos(-1 / 3);
function perpA(p) { const t = Math.abs(p[1]) < 0.9 ? [0, 1, 0] : [1, 0, 0]; return v3.unit(v3.resta(t, v3.esc(p, v3.punto(t, p)))); }
function ranuras(n, p, u) {
  // n direcciones: la primera es p (hacia el padre) si hay padre
  const v = v3.cruz(p, u), d = [p];
  const anillo = (th, fis) => fis.forEach(f => d.push(v3.unit(v3.suma(v3.esc(p, Math.cos(th)), v3.suma(v3.esc(u, Math.sin(th) * Math.cos(f)), v3.esc(v, Math.sin(th) * Math.sin(f)))))));
  if (n === 2) d.push(v3.esc(p, -1));
  else if (n === 3) anillo(2 * Math.PI / 3, [0, Math.PI]);
  else if (n >= 4) anillo(TETRA, [0, 2 * Math.PI / 3, 4 * Math.PI / 3]);
  return d;
}
function ranurasRaiz(n) {
  const s = Math.sin(TETRA / 2), c = Math.cos(TETRA / 2), c3 = Math.cos(Math.PI / 6);
  if (n <= 1) return [[1, 0, 0]];
  if (n === 2) return [[-1, 0, 0], [1, 0, 0]];
  if (n === 3) return [[-c3, -0.5, 0], [c3, -0.5, 0], [0, 1, 0]];
  return [[s, -c, 0], [-s, -c, 0], [0, c, s], [0, c, -s]];
}
const LARGO = [0, 1, 0.87, 0.78];
const largo = (a, b, o) => (ELEM[a].cov + ELEM[b].cov) * LARGO[o];
function disponer(g, raiz, estable) {
  // estable: los hijos en el orden en que se pegaron (mientras se arma, para que nada salte de sitio)
  const n = g.sim.length, pos = Array(n).fill(null), brazos = Array(n).fill(null), pares = Array(n).fill(null);
  if (!n) return { pos, brazos, pares };
  raiz = raiz >= 0 && raiz < n ? raiz : 0;
  pos[raiz] = [0, 0, 0];
  const memo = {};
  const tam = (v, p) => memo[v + ',' + p] || (memo[v + ',' + p] = 1 + vecinos(g, v).filter(x => x.j !== p).reduce((s, x) => s + tam(x.j, v), 0));
  const cola = [[raiz, -1, null]];
  while (cola.length) {
    const [a, padre, ref] = cola.shift();
    // la rama más grande va en anti (la cadena sigue en zigzag); las pequeñas y los H, a los lados
    const e = ELEM[g.sim[a]], vs = vecinos(g, a).filter(x => x.j !== padre).sort((x, y) => (estable ? 0 : tam(y.j, a) - tam(x.j, a)) || x.j - y.j), lib = Math.max(0, libres(g, a)), lp = e.arma ? e.libres : 0;
    const dom = (padre >= 0 ? 1 : 0) + vs.length + lib + lp;
    let dirs;
    if (padre < 0) dirs = ranurasRaiz(Math.min(4, dom));
    else {
      const p = v3.unit(v3.resta(pos[padre], pos[a]));
      let u = ref ? v3.resta(ref, v3.esc(p, v3.punto(ref, p))) : null;
      u = u && Math.hypot(u[0], u[1], u[2]) > 1e-6 ? v3.esc(v3.unit(u), -1) : perpA(p);
      dirs = ranuras(Math.min(4, dom), p, u).slice(1);
    }
    // los hijos primero, luego los brazos libres y al final los pares libres
    const hijos = dirs.slice(0, vs.length), br = dirs.slice(vs.length, vs.length + lib), pl = dirs.slice(vs.length + lib, vs.length + lib + lp);
    // los pares libres empujan a los enlaces: el agua a 104,5°, el amoníaco a 107°
    if (pl.length && hijos.length + (padre >= 0 ? 1 : 0) >= 2) {
      const L = v3.unit(pl.reduce((s, d) => v3.suma(s, d), [0, 0, 0])), k = 0.033 + 0.011 * pl.length;
      for (let i = 0; i < hijos.length; i++) hijos[i] = v3.unit(v3.resta(hijos[i], v3.esc(L, k)));
    }
    brazos[a] = br; pares[a] = pl;
    vs.forEach((x, i) => {
      const d = hijos[i] || perpA([1, 0, 0]);
      pos[x.j] = v3.suma(pos[a], v3.esc(d, largo(g.sim[a], g.sim[x.j], x.o)));
      // la referencia del hijo: otra dirección de este átomo (el padre, u otra ranura), para el zigzag y el plano
      const otra = padre >= 0 ? v3.unit(v3.resta(pos[padre], pos[a])) : (dirs.find((dd, k) => k !== i) || null);
      cola.push([x.j, a, otra]);
    });
  }
  return { pos, brazos, pares };
}
/** El ángulo (grados) entre los enlaces a–b y a–c. */
function angulo(pos, a, b, c) { const u = v3.unit(v3.resta(pos[b], pos[a])), w = v3.unit(v3.resta(pos[c], pos[a])); return Math.acos(Math.max(-1, Math.min(1, v3.punto(u, w)))) * 180 / Math.PI; }

const api = { ELEM, ARMABLES, FORMAS, MOLECULAS, POR_ID, REACCIONES, sub, sinTilde, leerFormula, hill, contar, masa, igualCuenta, vecinos, usados, libres, completa,
  desdeEst, esArbol, nombres, centros, codigo, geometria, formaMolecula, leerEcuacion, balancear, cuentaLado, masaLado, porCodigo, resolver, armable, disponer, angulo, v3 };
if (typeof module !== 'undefined' && module.exports) module.exports = api; else raiz.AtomoQuimica = api;
})(typeof window !== 'undefined' ? window : globalThis);
