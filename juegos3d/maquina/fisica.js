/* Máquina Loca — la física: un motor 2D propio, pequeño y determinista (el mismo en el juego, en la «Pista» y en la
   comprobación de los niveles, en el navegador y en node).
   - El tablero es una rejilla de 16 × 10 casillas de 1 unidad (x a la derecha, y hacia arriba; el banco está en y = 0).
   - Cuerpos: las bolas (la pelota, que rueda de verdad: gira y roza; y las pesas de hierro) contra segmentos con grosor
     (muros, rampas, el resorte, la cinta) y contra dos máquinas de un grado de libertad: la palanca (una tabla que gira
     en su punto de apoyo, con su inercia) y la polea (dos cubetas atadas por la cuerda: si una baja, la otra sube; la que
     llega arriba abre su puerta de fuera). El ventilador empuja (más a lo liviano: a = F/m) y el imán atrae el hierro.
   - Impulsos secuenciales con rozamiento de Coulomb y rodadura, paso fijo de 1/240 s. Para que la física se porte
     IGUAL en todos los equipos sólo se usan + − × ÷ y Math.sqrt (exactos en IEEE 754): el seno y el coseno son propios
     (Taylor tras reducir el ángulo), nada de Math.sin, Math.pow ni Math.atan2. Así un nivel que se gana en un equipo
     se gana en todos, y la comprobación de node dice la verdad.
   - simular(nivel, piezas) corre la partida entera de una vez (hasta 16 s) y devuelve la grabación (60 cuadros por
     segundo), los sucesos para narrar y el final: 'canasta' | 'quieta' | 'fuera' | 'tiempo'.
   - comprobar(nivel): que la solución de referencia gane con las piezas del inventario, que SIN piezas no se gane y
     que quitando cualquiera de las piezas de la solución tampoco (todas hacen falta). También el nivel en espejo.
   Corre en el navegador (window.MaquinaFisica) y en node (module.exports). */
(function (raiz) {
'use strict';
const COLS = 16, FILAS = 10, G = 20, DT = 1 / 240, TMAX = 16, CADA = 4;
const PI = 3.141592653589793, GRAD = PI / 180;

/* ---------- trigonometría propia (determinista) ---------- */
function sen(x) {
  const k = Math.round(x / (2 * PI));
  x = x - k * 2 * PI;
  if (x > PI / 2) x = PI - x; else if (x < -PI / 2) x = -PI - x;
  const x2 = x * x;
  return x * (1 - x2 / 6 * (1 - x2 / 20 * (1 - x2 / 42 * (1 - x2 / 72 * (1 - x2 / 110 * (1 - x2 / 156 * (1 - x2 / 210)))))));
}
const cos = x => sen(x + PI / 2);

/* ---------- las piezas ---------- */
// rots: los estados que recorren Q y E (el ángulo en grados, o el lado, o la dirección).
const TIPOS = {
  rampa: { rots: [-60, -45, -30, -15, 0, 15, 30, 45, 60, 90], ini: 0, largo: 3 },
  tabla: { rots: [-60, -45, -30, -15, 0, 15, 30, 45, 60, 90], ini: 0, largo: 2 },
  resorte: { rots: [-45, -30, -15, 0, 15, 30, 45], ini: 0 },
  palanca: { rots: [1, -1], ini: 1 },          // 1: empieza con el lado izquierdo abajo; -1: el derecho
  polea: { rots: [0], ini: 0 },
  cinta: { rots: [1, -1], ini: 1 },            // 1: lleva a la derecha; -1: a la izquierda
  ventilador: { rots: [0, 90, 180, 270], ini: 0 }, // hacia dónde sopla: 0 derecha, 90 arriba, 180 izquierda, 270 abajo
  iman: { rots: [0], ini: 0 }
};
const BOLAS = {
  balon: { r: 0.3, m: 1, e: 0.55, metal: false },
  canica: { r: 0.26, m: 1.6, e: 0.35, metal: true },
  pesa: { r: 0.4, m: 5, e: 0.1, metal: true }
};
const PALANCA = { medio: 2, tope: 25 * GRAD, I: 1.6 };
const POLEA = { sep: 1, baja: 3.2, viaje: 1.5, ancho: 0.55, alto: 0.75, M: 1.2 };
const VENT = { largo: 5.5, medio: 0.8, F: 26 };
const IMAN = { R: 4.5, K: 40 };
const CINTA = { v: 3.5 };

function seg(ax, ay, bx, by, r, o) {
  return Object.assign({ ax, ay, bx, by, r, e: 0.25, mu: 0.6, vs: 0, res: false, pz: -1, tipo: 'muro', mec: -1, k: 0, activo: null }, o || {});
}

/** El mundo de una partida: el nivel con las piezas puestas (las fijas del nivel van primero). */
function armar(nivel, piezas) {
  const W = { bolas: [], segs: [], mecs: [], zonas: [], canasta: null, piezas: [] };
  const todas = (nivel.fijas || []).map(p => Object.assign({ fija: true }, p)).concat(piezas || []);
  W.piezas = todas;
  // el banco (el suelo del taller)
  W.segs.push(seg(-0.5, -0.15, COLS + 0.5, -0.15, 0.15, { tipo: 'banco', mu: 0.7 }));
  W.segs.push(seg(-0.5, FILAS + 0.15, COLS + 0.5, FILAS + 0.15, 0.15, { tipo: 'techo', e: 0.3 }));
  (nivel.muros || []).forEach(m => W.segs.push(seg(m[0], m[1], m[2], m[3], m[4] || 0.15, { tipo: 'muro' })));
  const cn = nivel.canasta;
  if (cn) {
    const [x, y] = cn;
    W.canasta = { x, y, x0: x - 0.6, x1: x + 0.6, y0: y, y1: y + 0.85 };
    W.segs.push(seg(x - 0.72, y + 0.95, x - 0.66, y, 0.07, { tipo: 'canasta', e: 0.2 }));
    W.segs.push(seg(x + 0.72, y + 0.95, x + 0.66, y, 0.07, { tipo: 'canasta', e: 0.2 }));
    W.segs.push(seg(x - 0.66, y, x + 0.66, y, 0.07, { tipo: 'canasta', e: 0.1, mu: 0.9 }));
  }
  todas.forEach((p, i) => ponerPieza(W, p, i));
  const b = nivel.bola;
  W.bolas.push(bola(b.x, b.y, b.vx || 0, b.vy || 0, b.tipo || 'balon'));
  (nivel.pesas || []).forEach(p => W.bolas.push(bola(p[0], p[1], p[2] || 0, p[3] || 0, 'pesa')));
  W.tuerca = nivel.tuerca || null;
  return W;
  function bola(x, y, vx, vy, tipo) { const t = BOLAS[tipo]; return { x, y, vx, vy, w: 0, ang: 0, r: t.r, m: t.m, I: 0.4 * t.m * t.r * t.r, e: t.e, metal: t.metal, tipo, quieta: 0 }; }
}

function ponerPieza(W, p, i) {
  const x = p.c + 0.5, y = p.f + 0.5, t = p.t;
  if (t === 'rampa' || t === 'tabla') {
    const h = TIPOS[t].largo / 2, a = p.a * GRAD, c = cos(a), s = sen(a);
    W.segs.push(seg(x - h * c, y - h * s, x + h * c, y + h * s, 0.1, { tipo: t, pz: i, e: 0.2, mu: 0.6 }));
  } else if (t === 'resorte') {
    const a = p.a * GRAD, c = cos(a), s = sen(a), nx = -s, ny = c, h = 0.45;
    // la almohadilla (arriba) y la base (abajo); el resorte devuelve casi toda la energía
    W.segs.push(seg(x - h * c + 0.1 * nx, y - h * s + 0.1 * ny, x + h * c + 0.1 * nx, y + h * s + 0.1 * ny, 0.09, { tipo: 'resorte', pz: i, res: true, e: 0.97, mu: 0.5 }));
    W.segs.push(seg(x - h * c - 0.38 * nx, y - h * s - 0.38 * ny, x + h * c - 0.38 * nx, y + h * s - 0.38 * ny, 0.08, { tipo: 'resorte-base', pz: i, e: 0.2 }));
  } else if (t === 'palanca') {
    // el apoyo (un triángulo fijo) y la tabla, que gira
    W.segs.push(seg(x, y, x - 0.38, y - 0.5, 0.05, { tipo: 'apoyo', pz: i }));
    W.segs.push(seg(x, y, x + 0.38, y - 0.5, 0.05, { tipo: 'apoyo', pz: i }));
    const k = W.mecs.length, th = p.a === -1 ? -PALANCA.tope : PALANCA.tope;
    const m = { tipo: 'palanca', pz: i, q: th, dq: 0, I: PALANCA.I, min: -PALANCA.tope, max: PALANCA.tope, px: x, py: y + 0.12, segs: [] };
    // la tabla y un borde en cada punta (para que la pelota espere en la punta de abajo y la pesa no resbale)
    const h = PALANCA.medio;
    [[-h, 0, h, 0, 0.11], [-h, 0, -h, 0.34, 0.06], [h, 0, h, 0.34, 0.06]].forEach(l => m.segs.push(seg(0, 0, 0, 0, l[4], { tipo: 'palanca', pz: i, mec: k, e: 0.1, mu: 0.7, loc: l })));
    W.mecs.push(m); m.segs.forEach(s => W.segs.push(s));
  } else if (t === 'polea') {
    const k = W.mecs.length, P = POLEA;
    const m = { tipo: 'polea', pz: i, q: 0, dq: 0, I: P.M, min: -P.viaje, max: P.viaje, px: x, py: y, segs: [] };
    // cubeta A (izquierda: baja cuando q crece) y cubeta B (derecha: sube cuando q crece). El suelo se inclina hacia fuera.
    [[-1, -1], [1, 1]].forEach(([lado, kk]) => {
      const cx = x + lado * P.sep;
      const o = { tipo: 'polea', pz: i, mec: k, e: 0.15, mu: 0.6 };
      // en local: (dx, dy) respecto a (cx, y − baja); la y se mueve con q·kk
      const A = P.ancho * lado; // el lado de fuera (+) y el de dentro (−): el suelo baja hacia fuera
      const loc = [[-A, 0.12, A, 0, 0.07, 'suelo'], [-A, 0.12, -A, P.alto, 0.07, 'dentro'], [A, 0, A, P.alto, 0.07, 'fuera']];
      loc.forEach(l => {
        const s = seg(0, 0, 0, 0, l[4], Object.assign({}, o, { k: kk, lado, parte: l[5], loc: [cx + l[0], l[1], cx + l[2], l[3]] }));
        if (l[5] === 'fuera') s.activo = () => !(kk === 1 ? m.q >= m.max - 0.02 : m.q <= m.min + 0.02);
        m.segs.push(s);
      });
    });
    W.mecs.push(m); m.segs.forEach(s => W.segs.push(s));
  } else if (t === 'cinta') {
    W.segs.push(seg(x - 1.5, y, x + 1.5, y, 0.18, { tipo: 'cinta', pz: i, vs: CINTA.v * (p.a === -1 ? -1 : 1), mu: 0.9, e: 0.1 }));
  } else if (t === 'ventilador') {
    const a = p.a * GRAD, dx = cos(a), dy = sen(a);
    // el cuerpo del ventilador (de canto a la dirección en que sopla) y su chorro de aire
    W.segs.push(seg(x - 0.35 * dy - 0.1 * dx, y + 0.35 * dx - 0.1 * dy, x + 0.35 * dy - 0.1 * dx, y - 0.35 * dx - 0.1 * dy, 0.16, { tipo: 'ventilador', pz: i }));
    W.zonas.push({ tipo: 'ventilador', pz: i, ox: x + 0.3 * dx, oy: y + 0.3 * dy, dx, dy, largo: VENT.largo, medio: VENT.medio, F: VENT.F });
  } else if (t === 'iman') {
    W.segs.push(seg(x - 0.3, y - 0.1, x + 0.3, y - 0.1, 0.22, { tipo: 'iman', pz: i, e: 0.05, mu: 0.9 }));
    W.zonas.push({ tipo: 'iman', pz: i, ox: x, oy: y, R: IMAN.R, K: IMAN.K });
  }
}

/** Pone los segmentos de las máquinas donde van según su estado. */
function moverMecs(W) {
  for (let k = 0; k < W.mecs.length; k++) {
    const m = W.mecs[k];
    if (m.tipo === 'palanca') {
      const c = cos(m.q), s = sen(m.q);
      m.segs.forEach(g => { const l = g.loc; g.ax = m.px + l[0] * c - l[1] * s; g.ay = m.py + l[0] * s + l[1] * c; g.bx = m.px + l[2] * c - l[3] * s; g.by = m.py + l[2] * s + l[3] * c; });
    } else {
      const base = m.py - POLEA.baja;
      m.segs.forEach(g => { const dy = m.q * g.k; g.ax = g.loc[0]; g.bx = g.loc[2]; g.ay = base + g.loc[1] + dy; g.by = base + g.loc[3] + dy; });
    }
  }
}
// La velocidad de un punto de una máquina por unidad de su coordenada (la «palanca» del impulso).
function jac(W, g, px, py) {
  const m = W.mecs[g.mec];
  if (m.tipo === 'palanca') return [-(py - m.py), px - m.px];
  return [0, g.k];
}

function cerca(g, x, y) {
  const dx = g.bx - g.ax, dy = g.by - g.ay, L2 = dx * dx + dy * dy;
  let u = L2 > 0 ? ((x - g.ax) * dx + (y - g.ay) * dy) / L2 : 0;
  u = u < 0 ? 0 : u > 1 ? 1 : u;
  return [g.ax + u * dx, g.ay + u * dy];
}

/** Los contactos de ahora: bola–segmento y bola–bola. */
function contactos(W, conRebote) {
  const C = [];
  for (let i = 0; i < W.bolas.length; i++) {
    const b = W.bolas[i];
    for (let j = 0; j < W.segs.length; j++) {
      const g = W.segs[j];
      if (g.activo && !g.activo()) continue;
      const lim = b.r + g.r;
      if (b.x + lim < Math.min(g.ax, g.bx) || b.x - lim > Math.max(g.ax, g.bx) || b.y + lim < Math.min(g.ay, g.by) || b.y - lim > Math.max(g.ay, g.by)) continue;
      const p = cerca(g, b.x, b.y), dx = b.x - p[0], dy = b.y - p[1], d2 = dx * dx + dy * dy;
      if (d2 >= lim * lim || d2 < 1e-12) continue;
      const d = Math.sqrt(d2), nx = dx / d, ny = dy / d;
      C.push({ i, j, g, b, nx, ny, px: p[0], py: p[1], pen: lim - d });
    }
    for (let j = i + 1; j < W.bolas.length; j++) {
      const o = W.bolas[j], dx = b.x - o.x, dy = b.y - o.y, d2 = dx * dx + dy * dy, lim = b.r + o.r;
      if (d2 >= lim * lim || d2 < 1e-12) continue;
      const d = Math.sqrt(d2);
      C.push({ i, j, b, o, nx: dx / d, ny: dy / d, pen: lim - d });
    }
  }
  if (!conRebote) return C;
  // lo que no cambia en las iteraciones: masas efectivas y el rebote
  for (let k = 0; k < C.length; k++) {
    const c = C[k], b = c.b, tx = -c.ny, ty = c.nx;
    c.jn = 0; c.jt = 0;
    if (c.o) {
      c.Kn = 1 / b.m + 1 / c.o.m;
      const vn = (b.vx - c.o.vx) * c.nx + (b.vy - c.o.vy) * c.ny;
      c.bias = vn < -0.6 ? -0.3 * vn : 0; c.vn0 = vn;
      continue;
    }
    const g = c.g;
    let jx = 0, jy = 0, m = null;
    if (g.mec >= 0) {
      m = W.mecs[g.mec];
      const J = jac(W, g, c.px, c.py); jx = J[0]; jy = J[1];
      // en el tope, la máquina no cede hacia el tope: para este contacto es fija
      const hacia = -(c.nx * jx + c.ny * jy);
      if ((m.q >= m.max - 1e-6 && hacia > 0) || (m.q <= m.min + 1e-6 && hacia < 0)) { jx = 0; jy = 0; m = null; }
    }
    c.m = m; c.jx = jx; c.jy = jy;
    const nJ = c.nx * jx + c.ny * jy, tJ = tx * jx + ty * jy;
    c.Kn = 1 / b.m + (m ? nJ * nJ / m.I : 0);
    c.Kt = 1 / b.m + b.r * b.r / b.I + (m ? tJ * tJ / m.I : 0);
    c.mu = g.mu;
    const vn = relN(W, c);
    c.vn0 = vn;
    const e = g.res ? g.e : Math.min(g.e, 1) * 0.5 + b.e * 0.5;
    c.bias = g.res ? (vn < -0.3 ? -g.e * vn : 0) : (vn < -0.8 ? -e * vn : 0);
  }
  return C;
}
function vSup(W, c) {
  const g = c.g;
  let sx = 0, sy = 0;
  if (c.m) { sx = c.jx * c.m.dq; sy = c.jy * c.m.dq; }
  if (g.vs) {
    const dx = g.bx - g.ax, dy = g.by - g.ay, L = Math.sqrt(dx * dx + dy * dy), ux = dx / L, uy = dy / L;
    const arriba = c.nx * -uy + c.ny * ux > 0 ? 1 : -1;
    sx += ux * g.vs * arriba; sy += uy * g.vs * arriba;
  }
  return [sx, sy];
}
function relN(W, c) {
  const b = c.b, s = vSup(W, c);
  const vbx = b.vx + b.w * c.ny * b.r, vby = b.vy - b.w * c.nx * b.r;
  return (vbx - s[0]) * c.nx + (vby - s[1]) * c.ny;
}
function relT(W, c) {
  const b = c.b, s = vSup(W, c);
  const vbx = b.vx + b.w * c.ny * b.r, vby = b.vy - b.w * c.nx * b.r;
  return (vbx - s[0]) * -c.ny + (vby - s[1]) * c.nx;
}

function resolver(W, C) {
  for (let it = 0; it < 10; it++) {
    for (let k = 0; k < C.length; k++) {
      const c = C[k], b = c.b;
      if (c.o) {
        const o = c.o, vn = (b.vx - o.vx) * c.nx + (b.vy - o.vy) * c.ny;
        let d = (c.bias - vn) / c.Kn; const nj = Math.max(0, c.jn + d); d = nj - c.jn; c.jn = nj;
        b.vx += d * c.nx / b.m; b.vy += d * c.ny / b.m; o.vx -= d * c.nx / o.m; o.vy -= d * c.ny / o.m;
        continue;
      }
      const tx = -c.ny, ty = c.nx;
      // normal
      let vn = relN(W, c);
      let d = (c.bias - vn) / c.Kn; const nj = Math.max(0, c.jn + d); d = nj - c.jn; c.jn = nj;
      b.vx += d * c.nx / b.m; b.vy += d * c.ny / b.m;
      if (c.m) c.m.dq -= d * (c.nx * c.jx + c.ny * c.jy) / c.m.I;
      // rozamiento (y rodadura: el giro de la bola entra en la velocidad del punto de contacto)
      const vt = relT(W, c), lim = c.mu * c.jn;
      let dt = -vt / c.Kt; let nt = c.jt + dt; nt = nt < -lim ? -lim : nt > lim ? lim : nt; dt = nt - c.jt; c.jt = nt;
      b.vx += dt * tx / b.m; b.vy += dt * ty / b.m; b.w -= b.r * dt / b.I;
      if (c.m) c.m.dq -= dt * (tx * c.jx + ty * c.jy) / c.m.I;
    }
  }
}

/** Un paso de 1/240 s. Devuelve los contactos (para los sucesos). */
function paso(W) {
  // fuerzas: la gravedad, el aire del ventilador y el imán
  for (let i = 0; i < W.bolas.length; i++) {
    const b = W.bolas[i];
    b.vy -= G * DT;
    b.zona = -1;
    for (let z = 0; z < W.zonas.length; z++) {
      const Z = W.zonas[z];
      if (Z.tipo === 'ventilador') {
        const rx = b.x - Z.ox, ry = b.y - Z.oy, a = rx * Z.dx + ry * Z.dy, t = rx * -Z.dy + ry * Z.dx;
        if (a > 0 && a < Z.largo && t > -Z.medio && t < Z.medio) {
          const f = Z.F * (1 - 0.5 * a / Z.largo) / b.m;
          b.vx += Z.dx * f * DT; b.vy += Z.dy * f * DT; b.zona = z;
        }
      } else if (Z.tipo === 'iman' && b.metal) {
        const rx = Z.ox - b.x, ry = Z.oy - b.y, d2 = rx * rx + ry * ry;
        if (d2 < Z.R * Z.R && d2 > 1e-6) {
          const d = Math.sqrt(d2), f = Z.K / (d2 + 0.5) / b.m;
          b.vx += rx / d * f * DT; b.vy += ry / d * f * DT; b.zona = z;
        }
      }
    }
  }
  moverMecs(W);
  const C = contactos(W, true);
  resolver(W, C);
  // mover
  for (let i = 0; i < W.bolas.length; i++) {
    const b = W.bolas[i];
    const v2 = b.vx * b.vx + b.vy * b.vy;
    if (v2 > 1600) { const k = 40 / Math.sqrt(v2); b.vx *= k; b.vy *= k; }
    b.x += b.vx * DT; b.y += b.vy * DT; b.ang += b.w * DT;
    b.toca = false;
  }
  for (let k = 0; k < C.length; k++) { const c = C[k]; c.b.toca = true; if (c.o) c.o.toca = true; }
  // rodadura: lo que toca algo pierde un poco de giro (si no, rodaría para siempre)
  for (let i = 0; i < W.bolas.length; i++) { const b = W.bolas[i]; if (b.toca) { b.w *= 0.9975; b.vx *= 0.9998; b.vy *= 0.9998; } }
  for (let k = 0; k < W.mecs.length; k++) {
    const m = W.mecs[k];
    m.dq *= m.tipo === 'palanca' ? 0.998 : 0.997;
    m.q += m.dq * DT;
    if (m.q > m.max) { m.q = m.max; if (m.dq > 0) m.dq = 0; m.tope = 1; }
    else if (m.q < m.min) { m.q = m.min; if (m.dq < 0) m.dq = 0; m.tope = -1; }
    else m.tope = 0;
  }
  // corregir lo que se hundió (sólo se mueven las bolas)
  moverMecs(W);
  const P = contactos(W, false);
  for (let k = 0; k < P.length; k++) {
    const c = P[k], s = Math.max(0, c.pen - 0.004) * 0.8;
    if (!s) continue;
    if (c.o) { const t = c.b.m + c.o.m; c.b.x += c.nx * s * c.o.m / t; c.b.y += c.ny * s * c.o.m / t; c.o.x -= c.nx * s * c.b.m / t; c.o.y -= c.ny * s * c.b.m / t; }
    else { c.b.x += c.nx * s; c.b.y += c.ny * s; }
  }
  return C;
}

/** La partida entera. piezas: [{t, c, f, a}] (las que puso el jugador). o: { sinGrabar } (para comprobar rápido).
 *  → { fin, t, tuerca, cuadros: [[x, y, ang, …bolas, q, …máquinas]], sucesos: [{t, que, pz, bola}], toques: [pz…], golpes: [{t, f}] } */
function simular(nivel, piezas, o) {
  o = o || {};
  const W = armar(nivel, piezas);
  const cuadros = [], sucesos = [], toques = new Set(), golpes = [], ult = {};
  let t = 0, n = 0, dentro = 0, fin = 'tiempo', tuerca = false, quieta = 0, sola = 0;
  const pelota = W.bolas[0];
  const grabar = () => {
    const f = [];
    W.bolas.forEach(b => f.push(b.x, b.y, b.ang));
    f.push(pelota.vx, pelota.vy, pelota.w);
    W.mecs.forEach(m => f.push(m.q));
    cuadros.push(f);
  };
  const suceso = (que, pz, bola) => {
    const k = que + '|' + pz + '|' + bola;
    if (ult[k] != null && t - ult[k] < 0.6) { ult[k] = t; return; }
    ult[k] = t; sucesos.push({ t, que, pz, bola });
  };
  if (!o.sinGrabar) grabar();
  while (t < TMAX) {
    const C = paso(W);
    t += DT; n++;
    for (let k = 0; k < C.length; k++) {
      const c = C[k];
      if (c.o) { if (c.vn0 < -1.5) { golpes.push({ t, f: -c.vn0, que: 'bolas' }); suceso('choque', -1, c.i); } continue; }
      const g = c.g, pz = g.pz, bi = c.i;
      if (bi === 0 && pz >= 0) toques.add(pz);
      if (c.vn0 < -1.2) golpes.push({ t, f: -c.vn0, que: g.tipo, bola: bi });
      if (pz >= 0) suceso(g.tipo === 'polea' ? 'polea' : g.tipo === 'resorte-base' || g.tipo === 'apoyo' ? 'tope' : g.tipo, pz, bi);
      else if (g.tipo === 'canasta' && bi === 0) suceso('aro', -1, bi);
    }
    for (let i = 0; i < W.bolas.length; i++) { const b = W.bolas[i]; if (b.zona >= 0) { const Z = W.zonas[b.zona]; if (i === 0) toques.add(Z.pz); suceso(Z.tipo, Z.pz, i); } }
    if (W.tuerca && !tuerca) { const dx = pelota.x - W.tuerca[0], dy = pelota.y - W.tuerca[1]; if (dx * dx + dy * dy < 0.36) { tuerca = true; sucesos.push({ t, que: 'tuerca', pz: -1, bola: 0 }); } }
    if (!o.sinGrabar && n % CADA === 0) grabar();
    const cn = W.canasta;
    if (cn && pelota.x > cn.x0 && pelota.x < cn.x1 && pelota.y > cn.y0 && pelota.y < cn.y1) { dentro += DT; if (dentro >= 0.25) { fin = 'canasta'; break; } } else dentro = 0;
    if (pelota.x < -1.2 || pelota.x > COLS + 1.2 || pelota.y < -2) { fin = 'fuera'; break; }
    let quietas = true;
    for (let i = 0; i < W.bolas.length && quietas; i++) { const b = W.bolas[i]; if (b.y > -1.5 && b.x > -0.6 && b.x < COLS + 0.6 && (b.vx * b.vx + b.vy * b.vy > 0.01 || Math.abs(b.w) > 0.4)) quietas = false; }
    for (let k = 0; k < W.mecs.length && quietas; k++) if (Math.abs(W.mecs[k].dq) > 0.02) quietas = false;
    quieta = quietas ? quieta + DT : 0;
    sola = pelota.vx * pelota.vx + pelota.vy * pelota.vy < 0.01 && Math.abs(pelota.w) < 0.4 ? sola + DT : 0;
    if (quieta > 0.8 || sola > 6) { fin = 'quieta'; break; }
  }
  if (!o.sinGrabar && n % CADA !== 0) grabar();
  if (fin === 'canasta') sucesos.push({ t, que: 'canasta', pz: -1, bola: 0 });
  else sucesos.push({ t, que: fin, pz: -1, bola: 0 });
  return { fin, t, tuerca, cuadros, sucesos, toques: Array.from(toques).sort((a, b) => a - b), golpes, nfijas: (nivel.fijas || []).length, nbolas: W.bolas.length, nmecs: W.mecs.length, mecs: W.mecs.map(m => m.tipo) };
}

/* ---------- la rejilla: dónde se puede poner una pieza ---------- */
/** Las casillas ocupadas por lo fijo del nivel (muros, canasta, la pelota y las pesas al salir, las piezas fijas). */
function ocupadas(nivel) {
  const occ = new Set();
  const marcar = (c, f) => { if (c >= 0 && c < COLS && f >= 0 && f < FILAS) occ.add(c + ',' + f); };
  const segCasillas = (ax, ay, bx, by, r) => {
    for (let c = 0; c < COLS; c++) for (let f = 0; f < FILAS; f++) {
      const p = cerca({ ax, ay, bx, by }, c + 0.5, f + 0.5), dx = c + 0.5 - p[0], dy = f + 0.5 - p[1];
      if (dx * dx + dy * dy < (0.42 + r) * (0.42 + r)) marcar(c, f);
    }
  };
  (nivel.muros || []).forEach(m => segCasillas(m[0], m[1], m[2], m[3], m[4] || 0.15));
  if (nivel.canasta) { const [x, y] = nivel.canasta; segCasillas(x - 0.7, y + 0.5, x + 0.7, y + 0.5, 0.2); }
  const b = nivel.bola; marcar(Math.floor(b.x), Math.floor(b.y));
  (nivel.pesas || []).forEach(p => marcar(Math.floor(p[0]), Math.floor(p[1])));
  (nivel.fijas || []).forEach(p => marcar(p.c, p.f));
  return occ;
}
/** ¿Se puede poner la pieza p con las demás ya puestas? → '' si sí, o la razón. */
function sePuede(nivel, puestas, p, occ) {
  occ = occ || ocupadas(nivel);
  if (p.c < 0 || p.c >= COLS || p.f < 0 || p.f >= FILAS) return 'fuera del tablero';
  if (occ.has(p.c + ',' + p.f)) return 'ahí hay algo fijo';
  if (puestas.some(q => q !== p && q.c === p.c && q.f === p.f)) return 'ahí ya hay otra pieza';
  if (p.t === 'polea' && (p.f < 5 || p.c < 2 || p.c > COLS - 3)) return 'la polea necesita espacio abajo y a los lados';
  if (p.t === 'palanca' && (p.c < 2 || p.c > COLS - 3)) return 'la palanca no cabe tan al borde';
  return '';
}

/* ---------- el espejo: el mismo nivel de derecha a izquierda (la física es simétrica) ---------- */
function espejo(nivel) {
  const X = x => COLS - x, C = c => COLS - 1 - c;
  const pz = p => {
    const q = Object.assign({}, p, { c: C(p.c) });
    if (p.t === 'rampa' || p.t === 'tabla' || p.t === 'resorte') q.a = p.a === 90 ? 90 : -p.a;
    else if (p.t === 'palanca' || p.t === 'cinta') q.a = -p.a;
    else if (p.t === 'ventilador') q.a = { 0: 180, 180: 0, 90: 90, 270: 270 }[p.a];
    return q;
  };
  const o = Object.assign({}, nivel, {
    id: nivel.id + '-e', espejo: true,
    bola: Object.assign({}, nivel.bola, { x: X(nivel.bola.x), vx: -(nivel.bola.vx || 0) }),
    canasta: nivel.canasta ? [X(nivel.canasta[0]), nivel.canasta[1]] : null,
    muros: (nivel.muros || []).map(m => [X(m[0]), m[1], X(m[2]), m[3]].concat(m.length > 4 ? [m[4]] : [])),
    pesas: (nivel.pesas || []).map(p => [X(p[0]), p[1], -(p[2] || 0), p[3] || 0]),
    fijas: (nivel.fijas || []).map(pz),
    tuerca: nivel.tuerca ? [X(nivel.tuerca[0]), nivel.tuerca[1]] : null,
    sol: (nivel.sol || []).map(pz)
  });
  return o;
}

/** La comprobación de un nivel (también en espejo): → { ok, errores: [..] } */
function comprobar(nivel) {
  const errores = [];
  const uno = (n, rot) => {
    const sol = (n.sol || []).map(p => Object.assign({}, p));
    const inv = Object.assign({}, n.piezas || {});
    sol.forEach(p => { inv[p.t] = (inv[p.t] || 0) - 1; if (inv[p.t] < 0) errores.push(rot + 'la solución usa más ' + p.t + ' de las que hay'); if (TIPOS[p.t].rots.indexOf(p.a) < 0) errores.push(rot + p.t + ' con un giro que no existe (' + p.a + ')'); });
    const occ = ocupadas(n);
    sol.forEach(p => { const r = sePuede(n, sol, p, occ); if (r) errores.push(rot + p.t + ' en ' + p.c + ',' + p.f + ': ' + r); });
    const r = simular(n, sol, { sinGrabar: true });
    if (r.fin !== 'canasta') errores.push(rot + 'la solución no llega a la canasta (' + r.fin + ')');
    if (n.tuerca && !r.tuerca) errores.push(rot + 'la solución no pasa por la tuerca dorada');
    const s0 = simular(n, [], { sinGrabar: true });
    if (s0.fin === 'canasta') errores.push(rot + 'sin piezas también gana');
    sol.forEach((p, i) => { const s = simular(n, sol.filter((_, j) => j !== i), { sinGrabar: true }); if (s.fin === 'canasta') errores.push(rot + 'sin ' + p.t + ' (' + p.c + ',' + p.f + ') también gana'); });
    return r;
  };
  const r = uno(nivel, '');
  uno(espejo(nivel), 'en espejo: ');
  return { ok: errores.length === 0, errores, t: r.t };
}

const F = { COLS, FILAS, G, DT, TMAX, CADA, TIPOS, BOLAS, PALANCA, POLEA, VENT, IMAN, CINTA, sen, cos, simular, armar, ocupadas, sePuede, espejo, comprobar, moverMecs };
if (typeof module !== 'undefined' && module.exports) module.exports = F; else raiz.MaquinaFisica = F;
})(typeof window !== 'undefined' ? window : globalThis);
