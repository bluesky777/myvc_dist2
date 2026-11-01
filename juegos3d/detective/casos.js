/* global module */
/* Detective de Pistas — los casos: quiénes, las categorías, las pistas en español y en inglés, el generador y el
   verificador. Sin DOM: se prueba con node (module.exports) y en la página queda window.Casos.

   Un caso: de 3 a 5 sospechosos y 1 o 2 categorías (dónde estaba, qué tenía, a quién cuida, qué trajo, cuántas
   canicas, qué tarjeta tiene), cada una con tantos valores como sospechosos y uno distinto para cada uno (una
   permutación). Las pistas son frases verdaderas en la solución; el rastro («lo hizo quien estaba en la cocina»)
   dice qué fila es la del culpable.

   EL VERIFICADOR (la ficha: «pistas correctas, suficientes y con una sola solución»): cada caso se resuelve antes de
   mostrarlo con un razonador «a lo humano»: una pista cada vez sobre la cuadrícula (lo que esa pista deja posible con lo
   ya marcado) y la cuadrícula sola (cada uno un valor, cada valor de uno). Si así no se llega a una sola posibilidad en
   todas las casillas, el caso no sale. Luego se quitan las pistas que sobran y se cuenta por fuerza bruta que haya
   exactamente una solución. El mismo razonador da la pista del ayudante, con el número de la pista que la explica. */
(function (raiz) {
'use strict';

/* ---------- los sospechosos (los niños de la Biblioteca: dist/retratos/<retrato>-solo.webp) ---------- */
const SOSPECHOSOS = [
  { id: 'ana', es: 'Ana', en: 'Ana', retrato: 'nina-gafas', g: 'f', marca: '👓', rasgo: { es: 'la niña de gafas', en: 'the girl with glasses' } },
  { id: 'leo', es: 'Leo', en: 'Leo', retrato: 'nino-ruana', g: 'm', marca: '🧣', rasgo: { es: 'el niño de ruana', en: 'the boy in the ruana' } },
  { id: 'sara', es: 'Sara', en: 'Sara', retrato: 'nina-lluvia', g: 'f', marca: '🧥', rasgo: { es: 'la niña del impermeable', en: 'the girl in the raincoat' } },
  { id: 'tomas', es: 'Tomás', en: 'Tom', retrato: 'nino-sol', g: 'm', marca: '🧢', rasgo: { es: 'el niño de gorra', en: 'the boy with the cap' } },
  { id: 'mia', es: 'Mía', en: 'Mia', retrato: 'nina', g: 'f', marca: '🎀', rasgo: null },
  { id: 'luis', es: 'Luis', en: 'Luis', retrato: 'nino', g: 'm', marca: '👕', rasgo: null }
];

/* ---------- las categorías: los valores (con su MP3 en inglés: voz/en/<en>.mp3) y cómo se dicen ---------- */
const POOL = {
  lugar: [
    { id: 'cocina', es: 'cocina', art: 'la', en: 'kitchen', pre: 'in the', emoji: '🍳' },
    { id: 'cuarto', es: 'cuarto', art: 'el', en: 'bedroom', pre: 'in the', emoji: '🛏️' },
    { id: 'bano', es: 'baño', art: 'el', en: 'bathroom', pre: 'in the', emoji: '🛁' },
    { id: 'sala', es: 'sala', art: 'la', en: 'living room', pre: 'in the', emoji: '🛋️' },
    { id: 'parque', es: 'parque', art: 'el', en: 'park', pre: 'at the', emoji: '🌳' },
    { id: 'colegio', es: 'colegio', art: 'el', en: 'school', pre: 'at the', emoji: '🏫' },
    { id: 'plaza', es: 'plaza', art: 'la', en: 'square', pre: 'in the', emoji: '⛲' },
    { id: 'finca', es: 'finca', art: 'la', en: 'farm', pre: 'on the', emoji: '🐄' },
    { id: 'rio', es: 'río', art: 'el', en: 'river', pre: 'at the', emoji: '🏞️' },
    { id: 'mercado', es: 'mercado', art: 'el', en: 'market', pre: 'at the', emoji: '🧺' }
  ],
  cosa: [
    { id: 'libro', es: 'libro', art: 'el', en: 'book', emoji: '📕' },
    { id: 'balon', es: 'balón', art: 'el', en: 'ball', emoji: '⚽' },
    { id: 'cometa', es: 'cometa', art: 'la', en: 'kite', emoji: '🪁' },
    { id: 'guitarra', es: 'guitarra', art: 'la', en: 'guitar', emoji: '🎸' },
    { id: 'tambor', es: 'tambor', art: 'el', en: 'drum', emoji: '🥁' },
    { id: 'lapiz', es: 'lápiz', art: 'el', en: 'pencil', emoji: '✏️' }
  ],
  mascota: [
    { id: 'perro', es: 'perro', art: 'el', en: 'dog', emoji: '🐶' },
    { id: 'gato', es: 'gato', art: 'el', en: 'cat', emoji: '🐱' },
    { id: 'loro', es: 'loro', art: 'el', en: 'parrot', emoji: '🦜' },
    { id: 'pez', es: 'pez', art: 'el', en: 'fish', emoji: '🐟' },
    { id: 'conejo', es: 'conejo', art: 'el', en: 'rabbit', emoji: '🐰' },
    { id: 'gallina', es: 'gallina', art: 'la', en: 'hen', emoji: '🐔' },
    { id: 'pato', es: 'pato', art: 'el', en: 'duck', emoji: '🦆' },
    { id: 'tortuga', es: 'tortuga', art: 'la', en: 'turtle', emoji: '🐢' },
    { id: 'caballo', es: 'caballo', art: 'el', en: 'horse', emoji: '🐴' }
  ],
  merienda: [
    { id: 'manzana', es: 'manzana', art: 'la', en: 'apple', emoji: '🍎' },
    { id: 'banano', es: 'banano', art: 'el', en: 'banana', emoji: '🍌' },
    { id: 'mango', es: 'mango', art: 'el', en: 'mango', emoji: '🥭' },
    { id: 'pan', es: 'pan', art: 'el', en: 'bread', emoji: '🍞' },
    { id: 'leche', es: 'leche', art: 'la', en: 'milk', emoji: '🥛' },
    { id: 'jugo', es: 'jugo', art: 'el', en: 'juice', emoji: '🧃' }
  ]
};
const TITULOS = {
  lugar: { es: '¿Dónde estaba?', en: 'Where?', icono: '📍', corto: 'Lugares' },
  cosa: { es: '¿Qué tenía?', en: 'What did they have?', icono: '🎒', corto: 'Cosas' },
  mascota: { es: '¿A quién cuida?', en: 'Which pet?', icono: '🐾', corto: 'Mascotas' },
  merienda: { es: '¿Qué trajo?', en: 'What did they bring?', icono: '🧺', corto: 'Merienda' },
  numero: { es: '¿Cuántas canicas?', en: 'How many marbles?', icono: '🔵', corto: 'Canicas' },
  tarjeta: { es: '¿Qué tarjeta tiene?', en: 'Which card?', icono: '🃏', corto: 'Tarjetas' }
};

// Una frase es una lista de trozos: texto, {per: i, txt} (un sospechoso) o {c, val} (un valor de la categoría c, que la
// página pinta como ficha con su dibujo y, en inglés, con su MP3).
const tok = (c, v) => ({ c, val: v });
const el = v => (v.art ? v.art + ' ' : '');
const al = v => (v.art === 'el' ? 'al ' : v.art === 'la' ? 'a la ' : 'a ');
const FRASES = {
  lugar: {
    es: { si: (c, v) => ['estaba en ' + el(v), tok(c, v)], no: (c, v) => ['no estaba en ' + el(v), tok(c, v)],
      o: (c, a, b) => ['estaba en ' + el(a), tok(c, a), ' o en ' + el(b), tok(c, b)], pl: (c, v) => ['estaban en ' + el(v), tok(c, v)],
      quien: (c, v) => ['quien estaba en ' + el(v), tok(c, v)] },
    en: { si: (c, v) => ['was ' + v.pre + ' ', tok(c, v)], no: (c, v) => ['was not ' + v.pre + ' ', tok(c, v)],
      o: (c, a, b) => ['was ' + a.pre + ' ', tok(c, a), ' or ' + b.pre + ' ', tok(c, b)], quien: (c, v) => ['the person ' + v.pre + ' ', tok(c, v)] }
  },
  cosa: {
    es: { si: (c, v) => ['tenía ' + el(v), tok(c, v)], no: (c, v) => ['no tenía ' + el(v), tok(c, v)],
      o: (c, a, b) => ['tenía ' + el(a), tok(c, a), ' o ' + el(b), tok(c, b)], pl: (c, v) => ['tenían ' + el(v), tok(c, v)],
      quien: (c, v) => ['quien tenía ' + el(v), tok(c, v)] },
    en: { si: (c, v) => ['had the ', tok(c, v)], no: (c, v) => ['did not have the ', tok(c, v)],
      o: (c, a, b) => ['had the ', tok(c, a), ' or the ', tok(c, b)], quien: (c, v) => ['the person with the ', tok(c, v)] }
  },
  mascota: {
    es: { si: (c, v) => ['cuida ' + al(v), tok(c, v)], no: (c, v) => ['no cuida ' + al(v), tok(c, v)],
      o: (c, a, b) => ['cuida ' + al(a), tok(c, a), ' o ' + al(b), tok(c, b)], pl: (c, v) => ['cuidan ' + al(v), tok(c, v)],
      quien: (c, v) => ['quien cuida ' + al(v), tok(c, v)] },
    en: { si: (c, v) => ['takes care of the ', tok(c, v)], no: (c, v) => ['does not take care of the ', tok(c, v)],
      o: (c, a, b) => ['takes care of the ', tok(c, a), ' or the ', tok(c, b)], quien: (c, v) => ['the person who takes care of the ', tok(c, v)] }
  },
  merienda: {
    es: { si: (c, v) => ['trajo ' + el(v), tok(c, v)], no: (c, v) => ['no trajo ' + el(v), tok(c, v)],
      o: (c, a, b) => ['trajo ' + el(a), tok(c, a), ' o ' + el(b), tok(c, b)], pl: (c, v) => ['trajeron ' + el(v), tok(c, v)],
      quien: (c, v) => ['quien trajo ' + el(v), tok(c, v)] },
    en: { si: (c, v) => ['brought the ', tok(c, v)], no: (c, v) => ['did not bring the ', tok(c, v)],
      o: (c, a, b) => ['brought the ', tok(c, a), ' or the ', tok(c, b)], quien: (c, v) => ['the person who brought the ', tok(c, v)] }
  },
  numero: {
    es: { si: (c, v) => ['tiene ', tok(c, v), ' canicas'], no: (c, v) => ['no tiene ', tok(c, v), ' canicas'],
      o: (c, a, b) => ['tiene ', tok(c, a), ' o ', tok(c, b), ' canicas'], pl: (c, v) => ['tienen ', tok(c, v), ' canicas'],
      quien: (c, v) => ['quien tiene ', tok(c, v), ' canicas'] },
    en: { si: (c, v) => ['has ', tok(c, v), ' marbles'], no: (c, v) => ['does not have ', tok(c, v), ' marbles'],
      o: (c, a, b) => ['has ', tok(c, a), ' or ', tok(c, b), ' marbles'], quien: (c, v) => ['the person with ', tok(c, v), ' marbles'] }
  },
  tarjeta: {
    es: { si: (c, v) => ['tiene la tarjeta ', tok(c, v)], no: (c, v) => ['no tiene la tarjeta ', tok(c, v)],
      o: (c, a, b) => ['tiene la tarjeta ', tok(c, a), ' o la ', tok(c, b)], pl: (c, v) => ['tienen la tarjeta ', tok(c, v)],
      quien: (c, v) => ['quien tiene la tarjeta ', tok(c, v)] },
    en: { si: (c, v) => ['has the ', tok(c, v), ' card'], no: (c, v) => ['does not have the ', tok(c, v), ' card'],
      o: (c, a, b) => ['has the ', tok(c, a), ' card or the ', tok(c, b), ' card'], quien: (c, v) => ['the person with the ', tok(c, v), ' card'] }
  }
};

/* ---------- las historias: qué pasó y cómo pasó (nadie es malo: un buen detective escucha antes de juzgar) ---------- */
const HISTORIAS = [
  { id: 'torta', emoji: '🎂', sitio: 'casa',
    titulo: { es: 'La torta perdida', en: 'The missing cake' },
    evento: { es: 'La torta del cumpleaños de la profe desapareció de la mesa.', en: "The teacher's birthday cake disappeared from the table." },
    fin: { es: '{N} se la llevó para ponerle velas a escondidas: ¡era una sorpresa para la profe!', en: '{N} took it to add candles in secret: it was a surprise for the teacher!' } },
  { id: 'loro', emoji: '🦜', sitio: 'tienda',
    titulo: { es: 'La jaula abierta', en: 'The open cage' },
    evento: { es: 'Alguien dejó abierta la jaula de Paco, el loro de la tienda.', en: 'Someone left the cage of Paco, the shop parrot, open.' },
    fin: { es: '{N} le cambió el agua a Paco y olvidó cerrar la puerta. Paco estaba en el palo de mango.', en: '{N} gave Paco fresh water and forgot to close the door. Paco was in the mango tree.' } },
  { id: 'balon', emoji: '⚽', sitio: 'colegio',
    titulo: { es: 'El balón del recreo', en: 'The playground ball' },
    evento: { es: 'El balón del recreo no está en su canasta.', en: 'The playground ball is not in its basket.' },
    fin: { es: '{N} lo guardó en otro salón para que no se mojara con el aguacero.', en: '{N} put it in another room so it would not get wet in the rain.' } },
  { id: 'llaves', emoji: '🔑', sitio: 'colegio',
    titulo: { es: 'Las llaves de la biblioteca', en: 'The library keys' },
    evento: { es: 'Las llaves de la biblioteca no aparecen por ningún lado.', en: 'The library keys are missing.' },
    fin: { es: '{N} las encontró en el piso y las guardó en la maleta para entregarlas.', en: '{N} found them on the floor and kept them safe to give them back.' } },
  { id: 'mangos', emoji: '🥭', sitio: 'casa',
    titulo: { es: 'Los mangos de doña Rosa', en: "Mrs. Rosa's mangoes" },
    evento: { es: 'Del palo de doña Rosa faltan cinco mangos.', en: "Five mangoes are missing from Mrs. Rosa's tree." },
    fin: { es: '{N} los recogió del suelo para hacer jugo para todo el barrio.', en: '{N} picked them up from the ground to make juice for everyone.' } },
  { id: 'gallinas', emoji: '🐔', sitio: 'plaza',
    titulo: { es: 'Las gallinas sueltas', en: 'The loose hens' },
    evento: { es: 'Las gallinas de la finca andan paseando por la plaza.', en: 'The farm hens are walking around the town square.' },
    fin: { es: '{N} abrió el corral para darles maíz y no lo cerró bien.', en: '{N} opened the pen to give them corn and did not close it well.' } },
  { id: 'mural', emoji: '🎨', sitio: 'colegio',
    titulo: { es: 'El sol de la pared', en: 'The sun on the wall' },
    evento: { es: 'Alguien pintó un sol enorme en la pared del colegio.', en: 'Someone painted a huge sun on the school wall.' },
    fin: { es: '{N} lo pintó para alegrar el colegio. Ahora, con permiso, lo terminan entre todos.', en: '{N} painted it to make the school happy. Now everyone finishes it together, with permission.' } },
  { id: 'reloj', emoji: '🕰️', sitio: 'iglesia',
    titulo: { es: 'El reloj de la torre', en: 'The tower clock' },
    evento: { es: 'El reloj de la torre se paró a las tres en punto.', en: 'The tower clock stopped at three o’clock.' },
    fin: { es: '{N} quería oír las campanas y movió las pesas sin querer.', en: '{N} wanted to hear the bells and moved the weights by accident.' } },
  { id: 'toby', emoji: '🐕', sitio: 'tienda',
    titulo: { es: '¿Dónde está Toby?', en: 'Where is Toby?' },
    evento: { es: 'Toby, el perro de la tienda, no vino a desayunar.', en: 'Toby, the shop dog, did not come for breakfast.' },
    fin: { es: '{N} lo bañó y lo dejó secándose al sol en el patio.', en: '{N} gave him a bath and left him drying in the sun.' } },
  { id: 'libro', emoji: '📚', sitio: 'plaza',
    titulo: { es: 'El libro mojado', en: 'The wet book' },
    evento: { es: 'Un libro de la biblioteca apareció mojado en una banca.', en: 'A library book turned up wet on a bench.' },
    fin: { es: '{N} lo estaba leyendo cuando llegó la lluvia, y ya se ofreció a secarlo y forrarlo.', en: '{N} was reading it when the rain came, and already offered to dry it and cover it.' } }
];

/* ---------- utilidades y azar (con semilla para las pruebas) ---------- */
function azarCon(semilla) {
  if (semilla == null) return Math.random;
  let s = (semilla >>> 0) || 1;
  return () => { s = (s + 0x6D2B79F5) >>> 0; let t = s; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}
function barajar(a, az) { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(az() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }
const PERMS = {};
function perms(n) {
  if (PERMS[n]) return PERMS[n];
  const out = [], a = [...Array(n).keys()];
  const rec = k => { if (k === n) { out.push(a.slice()); return; } for (let i = k; i < n; i++) { [a[k], a[i]] = [a[i], a[k]]; rec(k + 1); [a[k], a[i]] = [a[i], a[k]]; } };
  rec(0); return (PERMS[n] = out);
}
const bits = m => { let c = 0; while (m) { m &= m - 1; c++; } return c; };
const unico = m => (m && !(m & (m - 1)) ? 31 - Math.clz32(m) : -1);

/* ---------- las pistas: qué dicen (evaluar) y qué categorías tocan ---------- */
// sol[c][p] = el índice del valor de la categoría c que tiene el sospechoso p. num(c, i) = el número del valor i.
function cumple(k, sol, caso) {
  const s = sol[k.c], dueno = v => s.indexOf(v), N = i => caso.cats[k.c].vals[i].n;
  switch (k.t) {
    case 'si': return s[k.p] === k.v;
    case 'no': return s[k.p] !== k.v;
    case 'o': return s[k.p] === k.v || s[k.p] === k.v2;
    case 'ni': return s[k.p] !== k.v && s[k.q] !== k.v;
    case 'liga': return sol[k.c2][dueno(k.v)] === k.v2;
    case 'noliga': return sol[k.c2][dueno(k.v)] !== k.v2;
    case 'ninguno': return caso.personas[dueno(k.v)].g !== k.g;
    case 'es': return caso.personas[dueno(k.v)].g === k.g;
    case 'solo': { const d = dueno(k.v); return d === k.p || d === k.q; }
    case 'mas': return N(s[k.p]) > N(s[k.q]);
    case 'menos': return N(s[k.p]) < N(s[k.q]);
    case 'doble': return N(s[k.p]) === 2 * N(s[k.q]);
    case 'dif': return N(s[k.p]) === N(s[k.q]) + k.d;
    case 'tope': return k.dir > 0 ? N(s[k.p]) <= k.k : N(s[k.p]) >= k.k;
  }
  return true;
}
const catsDe = k => (k.t === 'liga' || k.t === 'noliga' ? [k.c, k.c2] : [k.c]);

/* ---------- el razonador «a lo humano» ---------- */
// Una pasada: la cuadrícula sola y luego cada pista con la cuadrícula. eventos: [{p, c, v, marca: 'no'|'si', por}],
// por = el índice de la pista, o -1 si lo dice la cuadrícula (cada uno un valor, cada valor de uno).
function razonar(caso, pistas, conEventos) {
  const n = caso.personas.length, C = caso.cats.length, todo = (1 << n) - 1;
  const dom = caso.cats.map(() => Array(n).fill(todo)), ev = [];
  const sol = caso.cats.map(() => null);
  const cache = caso.cats.map(() => null);
  const validas = c => cache[c] || (cache[c] = perms(n).filter(pm => pm.every((v, p) => dom[c][p] & (1 << v))));
  const aplicar = (c, sop, por) => {
    let cambio = false;
    for (let p = 0; p < n; p++) {
      const nuevo = dom[c][p] & sop[p];
      if (nuevo === dom[c][p]) continue;
      if (conEventos) {
        for (let v = 0; v < n; v++) if ((dom[c][p] & (1 << v)) && !(nuevo & (1 << v))) ev.push({ p, c, v, marca: 'no', por });
        const u = unico(nuevo); if (u >= 0) ev.push({ p, c, v: u, marca: 'si', por });
      }
      dom[c][p] = nuevo; cambio = true; cache[c] = null;
    }
    return cambio;
  };
  let cambio = true, vueltas = 0;
  while (cambio && vueltas < 40) {
    cambio = false; vueltas++;
    for (let c = 0; c < C; c++) {
      const sop = Array(n).fill(0);
      validas(c).forEach(pm => pm.forEach((v, p) => { sop[p] |= 1 << v; }));
      if (aplicar(c, sop, -1)) cambio = true;
    }
    for (let i = 0; i < pistas.length; i++) {
      const k = pistas[i], cs = catsDe(k);
      if (cs.length > 1) {
        // «quien estaba en la cocina tenía la cometa»: se razona persona por persona (si no puede estar en la cocina,
        // no tiene la cometa, y al revés); lo demás lo hace la cuadrícula
        const a = 1 << k.v, b = 1 << k.v2, s0 = Array(n).fill(todo), s1 = Array(n).fill(todo);
        for (let p = 0; p < n; p++) {
          const d0 = dom[k.c][p], d1 = dom[k.c2][p];
          if (k.t === 'liga') {
            if (!(d0 & a)) s1[p] &= ~b; if (!(d1 & b)) s0[p] &= ~a;
            if (d0 === a) s1[p] &= b; if (d1 === b) s0[p] &= a;
          } else { if (d0 === a) s1[p] &= ~b; if (d1 === b) s0[p] &= ~a; }
        }
        if (aplicar(k.c, s0, i)) cambio = true;
        if (aplicar(k.c2, s1, i)) cambio = true;
        if (cambio && conEventos) break;
        continue;
      }
      const sop = cs.map(() => Array(n).fill(0));
      const l0 = validas(cs[0]), l1 = cs.length > 1 ? validas(cs[1]) : [null];
      for (const a of l0) {
        sol[cs[0]] = a;
        for (const b of l1) {
          if (b) sol[cs[1]] = b;
          if (!cumple(k, sol, caso)) continue;
          a.forEach((v, p) => { sop[0][p] |= 1 << v; });
          if (b) b.forEach((v, p) => { sop[1][p] |= 1 << v; });
        }
      }
      cs.forEach((c, j) => { if (aplicar(c, sop[j], i)) cambio = true; });
      // si una pista ya cambió algo, se vuelve a mirar la cuadrícula antes de la siguiente (como lo haría un niño)
      if (cambio && conEventos) break;
    }
  }
  const resuelto = dom.every(f => f.every(m => bits(m) === 1));
  return { dom, resuelto, vueltas, eventos: ev };
}
// Cuántas soluciones hay de verdad (fuerza bruta, hasta `tope`): el control final de cada caso.
function contar(caso, pistas, tope) {
  const n = caso.personas.length, C = caso.cats.length, P = perms(n), sol = [];
  let total = 0;
  const rec = c => {
    if (total >= tope) return;
    if (c === C) { if (pistas.every(k => cumple(k, sol, caso))) total++; return; }
    for (const pm of P) { sol[c] = pm; rec(c + 1); if (total >= tope) return; }
  };
  rec(0); return total;
}

/* ---------- el generador ---------- */
// nivel 1: 3 sospechosos, 1 categoría · 2: 4 y 1 · 3: 3 y 2 · 4: 4 y 2 · 5: 5 y 2 (con «sólo», «ninguno», rasgos).
const NIVELES = {
  1: { n: 3, cats: 1, max: 4, tipos: { no: 5, o: 2, si: 1, ni: 2 } },
  2: { n: 4, cats: 1, max: 6, tipos: { no: 4, o: 3, ni: 3, ninguno: 2, solo: 2, si: 0.6 } },
  3: { n: 3, cats: 2, max: 6, tipos: { no: 3, o: 2, ni: 2, liga: 3, noliga: 2, es: 1, si: 0.5 }, rasgos: 0.25 },
  4: { n: 4, cats: 2, max: 8, tipos: { no: 3, o: 2, ni: 2, liga: 3, noliga: 3, ninguno: 1.5, es: 1, solo: 2, si: 0.3 }, rasgos: 0.35 },
  5: { n: 5, cats: 2, max: 10, tipos: { no: 2, o: 3, ni: 1.5, liga: 4, noliga: 2, ninguno: 1.5, es: 1, solo: 3, si: 0.2 }, rasgos: 0.45 }
};
const TIPOS_NUM = { mas: 3, menos: 2, doble: 2.5, dif: 2, tope: 2 };
const NUMEROS = { bajo: [2, 3, 4, 5, 6, 8, 10, 12, 15, 16, 20], alto: [6, 8, 9, 12, 15, 16, 18, 20, 24, 25, 30, 32, 36, 40] };

function valoresNumero(n, alto, az) {
  const base = alto ? NUMEROS.alto : NUMEROS.bajo;
  for (let i = 0; i < 200; i++) {
    const xs = barajar(base, az).slice(0, n).sort((a, b) => a - b);
    if (xs.some(a => xs.includes(2 * a))) return xs;
  }
  return base.slice(0, n);
}

// Todas las pistas verdaderas de la solución, con su peso según el nivel.
function candidatas(caso, cfgN, az) {
  const { personas, cats, sol } = caso, n = personas.length, out = [];
  const pesos = Object.assign({}, cfgN.tipos), conNum = cats.some(c => c.tipo === 'numero');
  if (conNum) Object.assign(pesos, TIPOS_NUM);
  const add = (k) => { const w = pesos[k.t]; if (w > 0) out.push({ k, w }); };
  const dueno = (c, v) => sol[c].indexOf(v);
  const generos = new Set(personas.map(p => p.g));
  cats.forEach((cat, c) => {
    const num = cat.tipo === 'numero';
    for (let p = 0; p < n; p++) for (let v = 0; v < n; v++) {
      if (sol[c][p] === v) { if (!num || cfgN.n <= 3) add({ t: 'si', c, p, v }); }
      else add({ t: 'no', c, p, v });
    }
    for (let p = 0; p < n; p++) {
      const otras = [...Array(n).keys()].filter(v => v !== sol[c][p]);
      const v2 = otras[Math.floor(az() * otras.length)];
      add(az() < 0.5 ? { t: 'o', c, p, v: sol[c][p], v2 } : { t: 'o', c, p, v: v2, v2: sol[c][p] });
    }
    for (let p = 0; p < n; p++) for (let q = p + 1; q < n; q++) for (let v = 0; v < n; v++)
      if (sol[c][p] !== v && sol[c][q] !== v) add({ t: 'ni', c, p, q, v, w: 0.5 });
    for (let v = 0; v < n; v++) {
      const d = dueno(c, v);
      if (generos.size > 1) {
        ['f', 'm'].forEach(g => { if (personas[d].g !== g && personas.some(x => x.g === g)) add({ t: 'ninguno', c, v, g }); });
        add({ t: 'es', c, v, g: personas[d].g });
      }
      const otros = [...Array(n).keys()].filter(x => x !== d), q = otros[Math.floor(az() * otros.length)];
      if (n >= 4) add(az() < 0.5 ? { t: 'solo', c, v, p: d, q } : { t: 'solo', c, v, p: q, q: d });
    }
    cats.forEach((cat2, c2) => {
      if (c2 === c) return;
      for (let v = 0; v < n; v++) for (let v2 = 0; v2 < n; v2++) {
        if (sol[c2][dueno(c, v)] === v2) { if (c < c2 || az() < 0.5) add({ t: 'liga', c, v, c2, v2 }); }
        else if (c < c2) add({ t: 'noliga', c, v, c2, v2 });
      }
    });
    if (num) {
      const N = i => cat.vals[i].n, x = p => N(sol[c][p]);
      for (let p = 0; p < n; p++) for (let q = 0; q < n; q++) {
        if (p === q) continue;
        if (x(p) > x(q)) add({ t: 'mas', c, p, q }); else add({ t: 'menos', c, p, q });
        if (x(p) === 2 * x(q)) add({ t: 'doble', c, p, q });
        if (x(p) > x(q) && x(p) - x(q) <= 10 && x(p) !== 2 * x(q)) add({ t: 'dif', c, p, q, d: x(p) - x(q) });
      }
      const orden = cat.vals.map(v => v.n).sort((a, b) => a - b);
      const k2 = orden[n - 2], k1 = orden[1];
      for (let p = 0; p < n; p++) {
        if (x(p) <= k2) add({ t: 'tope', c, p, k: k2, dir: 1 });
        if (x(p) >= k1) add({ t: 'tope', c, p, k: k1, dir: -1 });
      }
    }
  });
  return out.map(o => (o.k.w ? (o.w *= o.k.w, delete o.k.w, o) : o));
}
function ordenPonderado(cands, az) {
  // Efraimidis–Spirakis: cada una con clave u^(1/w), de mayor a menor
  return cands.map(o => ({ k: o.k, r: Math.pow(az(), 1 / o.w) })).sort((a, b) => b.r - a.r).map(o => o.k);
}

/**
 * Un caso nuevo. op: {nivel 1..5, idioma 'es'|'en', tema 'lectura'|'numeros', palabras?: [{en, es, emoji}], palabrasFijas?
 *   (las n primeras, sin barajar), n? y cats? (para forzar el tamaño), historia?: índice, semilla?}. Con `palabras`, la primera categoría son sus tarjetas.
 * Devuelve {personas, cats, sol, pistas, rastro: {c, v}, culpable, historia, idioma, nivel, eventos}.
 */
function generar(op) {
  op = op || {};
  const az = azarCon(op.semilla), nivel = Math.max(1, Math.min(5, op.nivel | 0 || 1));
  const N0 = NIVELES[nivel], idioma = op.idioma === 'en' ? 'en' : 'es';
  const pal = Array.isArray(op.palabras) ? op.palabras : [];
  for (let intento = 0; intento < 80; intento++) {
    const cfgN = Object.assign({}, N0);
    if (op.cats) cfgN.cats = op.cats;
    let n = op.n || cfgN.n;
    const tipos = [];
    if (pal.length >= 3) { n = Math.min(n, pal.length); tipos.push('tarjeta'); if (cfgN.cats > 1) tipos.push('lugar'); }
    else if (op.tema === 'numeros') { if (cfgN.cats > 1) { tipos.push('lugar', 'numero'); n = Math.min(n, 4); } else tipos.push('numero'); }
    else { tipos.push('lugar'); if (cfgN.cats > 1) tipos.push(['cosa', 'mascota', 'merienda'][Math.floor(az() * 3)]); }
    cfgN.n = n;
    let sosp = barajar(SOSPECHOSOS, az).slice(0, n);
    if (!sosp.some(s => s.g === 'f') || !sosp.some(s => s.g === 'm')) sosp = barajar(SOSPECHOSOS, az).slice(0, n);
    sosp = SOSPECHOSOS.filter(s => sosp.includes(s)); // siempre en el mismo orden en la libreta
    const cats = tipos.map(t => {
      let vals;
      if (t === 'tarjeta') vals = barajar(op.palabrasFijas ? pal.slice(0, n) : pal, az).slice(0, n).map((w, i) => ({ id: 't' + i, es: w.es, en: w.en, emoji: w.emoji || '', art: '' }));
      else if (t === 'numero') vals = valoresNumero(n, nivel >= 3, az).map(x => ({ id: 'n' + x, es: String(x), en: String(x), n: x, emoji: '' }));
      else vals = barajar(POOL[t], az).slice(0, n);
      if (t !== 'numero' && t !== 'tarjeta') vals = POOL[t].filter(v => vals.includes(v));
      return { tipo: t, vals, titulo: TITULOS[t] };
    });
    const caso = { personas: sosp, cats, sol: cats.map(() => barajar([...Array(n).keys()], az)), idioma, nivel };
    const cands = ordenPonderado(candidatas(caso, cfgN, az), az);
    // rastro: el valor que señala al culpable (de la primera categoría, que es la de la lección o la del lugar)
    const rastro = { c: 0, v: Math.floor(az() * n) };
    const culpable = caso.sol[0].indexOf(rastro.v);
    // no vale una pista que diga de una vez la fila del culpable
    const regala = k => k.t === 'si' && k.c === rastro.c && (k.v === rastro.v || k.p === culpable);
    const elegidas = [];
    let si = 0;
    for (const k of cands) {
      if (regala(k)) continue;
      if (k.t === 'si') { if (si >= 1) continue; si++; }
      elegidas.push(k);
      if (elegidas.length >= cfgN.max * 2) break;
      if (elegidas.length >= Math.max(2, n - 1) && razonar(caso, elegidas).resuelto) break;
    }
    if (!razonar(caso, elegidas).resuelto) continue;
    // quitar lo que sobra, en un orden al azar
    let pistas = elegidas.slice();
    for (const k of barajar(elegidas, az)) {
      const sin = pistas.filter(x => x !== k);
      if (razonar(caso, sin).resuelto) pistas = sin;
    }
    const minimo = nivel === 1 ? 3 : 4;
    if (pistas.length > cfgN.max || pistas.length < Math.min(minimo, cfgN.max)) continue;
    if (contar(caso, pistas, 2) !== 1) continue; // el verificador: una sola solución
    pistas = barajar(pistas, az);
    // los sospechosos que se nombran por su rasgo en esta pista (se decide una vez, para que no cambie al repintar)
    pistas.forEach(k => {
      k.rasgo = {};
      ['p', 'q'].forEach(x => { if (k[x] != null && caso.personas[k[x]].rasgo && az() < (cfgN.rasgos || 0)) k.rasgo[x] = true; });
    });
    const hist = HISTORIAS[((op.historia != null ? op.historia : Math.floor(az() * HISTORIAS.length)) % HISTORIAS.length + HISTORIAS.length) % HISTORIAS.length];
    caso.pistas = pistas; caso.rastro = rastro; caso.culpable = culpable; caso.historia = hist;
    caso.eventos = razonar(caso, pistas, true).eventos;
    caso.intentos = intento + 1;
    return caso;
  }
  return null;
}

/* ---------- decir las pistas ---------- */
function nombre(caso, p, rasgo) {
  const s = caso.personas[p];
  return rasgo && s.rasgo ? s.rasgo[caso.idioma] : s[caso.idioma];
}
function frase(caso, k) {
  const L = caso.idioma, F = c => FRASES[caso.cats[c].tipo][L], V = (c, v) => caso.cats[c].vals[v];
  const P = x => ({ per: k[x], txt: nombre(caso, k[x], k.rasgo && k.rasgo[x]) });
  const pl = (c, v) => (L === 'es' ? F(c).pl(c, V(c, v)) : F(c).si(c, V(c, v)));
  let t;
  switch (k.t) {
    case 'si': t = [P('p'), ' ', ...F(k.c).si(k.c, V(k.c, k.v)), '.']; break;
    case 'no': t = [P('p'), ' ', ...F(k.c).no(k.c, V(k.c, k.v)), '.']; break;
    case 'o': t = [P('p'), ' ', ...F(k.c).o(k.c, V(k.c, k.v), V(k.c, k.v2)), '.']; break;
    case 'ni': t = L === 'es' ? ['Ni ', P('p'), ' ni ', P('q'), ' ', ...pl(k.c, k.v), '.'] : ['Neither ', P('p'), ' nor ', P('q'), ' ', ...pl(k.c, k.v), '.']; break;
    case 'liga': t = [...F(k.c).quien(k.c, V(k.c, k.v)), ' ', ...F(k.c2).si(k.c2, V(k.c2, k.v2)), '.']; break;
    case 'noliga': t = [...F(k.c).quien(k.c, V(k.c, k.v)), ' ', ...F(k.c2).no(k.c2, V(k.c2, k.v2)), '.']; break;
    case 'ninguno': t = [L === 'es' ? (k.g === 'f' ? 'Ninguna niña ' : 'Ningún niño ') : (k.g === 'f' ? 'No girl ' : 'No boy '), ...F(k.c).si(k.c, V(k.c, k.v)), '.']; break;
    case 'es': t = [...F(k.c).quien(k.c, V(k.c, k.v)), L === 'es' ? (k.g === 'f' ? ' es una niña.' : ' es un niño.') : (k.g === 'f' ? ' is a girl.' : ' is a boy.')]; break;
    case 'solo': t = [...F(k.c).quien(k.c, V(k.c, k.v)), L === 'es' ? ' sólo puede ser ' : ' can only be ', P('p'), L === 'es' ? ' o ' : ' or ', P('q'), '.']; break;
    case 'mas': t = [P('p'), L === 'es' ? ' tiene más canicas que ' : ' has more marbles than ', P('q'), '.']; break;
    case 'menos': t = [P('p'), L === 'es' ? ' tiene menos canicas que ' : ' has fewer marbles than ', P('q'), '.']; break;
    case 'doble': t = [P('p'), L === 'es' ? ' tiene el doble de canicas que ' : ' has twice as many marbles as ', P('q'), '.']; break;
    case 'dif': t = [P('p'), L === 'es' ? ' tiene ' + k.d + ' canicas más que ' : ' has ' + k.d + ' more marbles than ', P('q'), '.']; break;
    case 'tope': t = L === 'es' ? ['Quien tiene ' + (k.dir > 0 ? 'más' : 'menos') + ' de ' + k.k + ' canicas no es ', P('p'), '.']
      : ['The person with ' + (k.dir > 0 ? 'more' : 'fewer') + ' than ' + k.k + ' marbles is not ', P('p'), '.']; break;
    default: t = ['?'];
  }
  return mayuscula(t);
}
function mayuscula(t) {
  const i = t.findIndex(x => (typeof x === 'string' ? x.trim() : x.txt));
  if (i < 0) return t;
  const x = t[i];
  if (typeof x === 'string') t[i] = x.charAt(0).toUpperCase() + x.slice(1);
  else if (x.txt) t[i] = Object.assign({}, x, { txt: x.txt.charAt(0).toUpperCase() + x.txt.slice(1) });
  return t;
}
/** El texto plano de una frase (para el lector de pantalla y para buscar su MP3). */
function plano(caso, trozos) {
  return trozos.map(x => (typeof x === 'string' ? x : x.per != null ? x.txt : caso.idioma === 'en' ? x.val.en : x.val.es)).join('');
}
function valorTexto(caso, c, v) { const x = caso.cats[c].vals[v]; return caso.idioma === 'en' ? x.en : x.es; }
/** «Lo hizo quien estaba en la cocina.» */
function rastro(caso) {
  const { c, v } = caso.rastro, F = FRASES[caso.cats[c].tipo][caso.idioma];
  return mayuscula([caso.idioma === 'es' ? 'Se sabe que lo hizo ' : 'We know it was ', ...F.quien(c, caso.cats[c].vals[v]), '.']);
}

const API = { SOSPECHOSOS, POOL, TITULOS, HISTORIAS, NIVELES, generar, razonar, contar, cumple, frase, plano, rastro, valorTexto, azarCon, barajar };
if (typeof module !== 'undefined' && module.exports) module.exports = API; else raiz.Casos = API;
})(typeof window !== 'undefined' ? window : globalThis);
