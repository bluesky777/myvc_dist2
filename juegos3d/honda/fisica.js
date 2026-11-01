/* global module */
/* Honda Estelar — la física (la misma en el juego, en la línea punteada y en la comprobación de los niveles).
   El plano es el de la órbita: x hacia adelante (de la honda a las lunas), y hacia arriba; el mundo va de -W a W y de
   -H a H. La nave sale de `sal` con la dirección (grados, 0 = adelante, positivo = hacia arriba) y la fuerza (1 a 10) y
   la doblan los planetas: a = Σ m·d/|d|³ (Newton con G·M = m). Paso fijo de 1/120 s y Verlet: el mismo lanzamiento
   da siempre el mismo camino, así que la línea punteada dice la verdad y el «Apuntar por mí» encuentra uno que sirve.
   Termina al llegar a una luna, al chocar con un planeta o una roca, al salirse del mapa o a los 12 s.
   Un nivel: { sal: [x, y], pl: [[x, y, r, m, estilo, anillo?]], lu: [[x, y, r]], cr: [[x, y]], ro: [[x, y, r]], hn?: [[x, y, m]] }
   (hn = agujero negro: mucha masa en muy poco espacio). Corre en el navegador (window.HondaFisica) y en node. */
(function (raiz) {
'use strict';
const W = 48, H = 28, DT = 1 / 120, TMAX = 12, K = 5, NAVE = 0.6, CRISTAL = 1.7;

function cuerpos(n) {
  const g = []; // [x, y, m, rChoque]
  (n.pl || []).forEach(p => g.push([p[0], p[1], p[3], p[2] + NAVE]));
  (n.hn || []).forEach(p => g.push([p[0], p[1], p[2], 1.4 + NAVE]));
  return g;
}

/** Vuela un lanzamiento. o: { captura (lo que se agranda cada luna), cada (guardar un punto cada tantos pasos),
 *  hasta (segundos: para la línea punteada), paso (para buscar rápido) }.
 *  → { fin: 'luna'|'choque'|'roca'|'fuera'|'tiempo'|'corte', i, cr: [índices de cristales], pts: [x, y, …], t } */
function simular(n, ang, fuerza, o) {
  o = o || {};
  const dt = o.paso || DT, cada = o.cada || 2, tope = Math.min(o.hasta || TMAX, TMAX), cap = o.captura || 0;
  const g = cuerpos(n), lu = n.lu || [], cr = n.cr || [], ro = n.ro || [];
  const a0 = ang * Math.PI / 180, v0 = fuerza * K;
  let x = n.sal[0], y = n.sal[1], vx = Math.cos(a0) * v0, vy = Math.sin(a0) * v0;
  const acel = (px, py) => {
    let ax = 0, ay = 0;
    for (let k = 0; k < g.length; k++) {
      const dx = g[k][0] - px, dy = g[k][1] - py, d2 = dx * dx + dy * dy, d = Math.sqrt(d2), f = g[k][2] / (d2 * d);
      ax += dx * f; ay += dy * f;
    }
    return [ax, ay];
  };
  let [ax, ay] = acel(x, y);
  const pts = o.sinPuntos ? null : [x, y], tomados = [];
  let t = 0, paso = 0;
  const fin = (tipo, i) => { if (pts && (pts[pts.length - 2] !== x || pts[pts.length - 1] !== y)) pts.push(x, y); return { fin: tipo, i, cr: tomados, pts, t }; };
  while (t < tope) {
    x += vx * dt + 0.5 * ax * dt * dt; y += vy * dt + 0.5 * ay * dt * dt;
    const b = acel(x, y);
    vx += 0.5 * (ax + b[0]) * dt; vy += 0.5 * (ay + b[1]) * dt; ax = b[0]; ay = b[1];
    t += dt; paso++;
    if (pts && paso % cada === 0) pts.push(x, y);
    for (let k = 0; k < g.length; k++) { const dx = g[k][0] - x, dy = g[k][1] - y; if (dx * dx + dy * dy < g[k][3] * g[k][3]) return fin('choque', k); }
    for (let k = 0; k < ro.length; k++) { const dx = ro[k][0] - x, dy = ro[k][1] - y, r = ro[k][2] + NAVE * 0.8; if (dx * dx + dy * dy < r * r) return fin('roca', k); }
    for (let k = 0; k < cr.length; k++) { if (tomados.indexOf(k) >= 0) continue; const dx = cr[k][0] - x, dy = cr[k][1] - y; if (dx * dx + dy * dy < CRISTAL * CRISTAL) tomados.push(k); }
    for (let k = 0; k < lu.length; k++) { const dx = lu[k][0] - x, dy = lu[k][1] - y, r = lu[k][2] + cap + NAVE; if (dx * dx + dy * dy < r * r) return fin('luna', k); }
    if (x < -W - 6 || x > W + 6 || y < -H - 6 || y > H + 6) return fin('fuera', -1);
  }
  return fin(o.hasta ? 'corte' : 'tiempo', -1);
}

/** Todos los lanzamientos de una rejilla (dirección de -90 a 90 de `da` en `da` grados, fuerza de 1 a 10 de `df` en
 *  `df`) que llegan a la luna `meta`. Con `paso` grueso para ir rápido; luego se confirma con el paso de verdad. */
function rejilla(n, meta, o) {
  o = o || {};
  const da = o.da || 1, df = o.df || 0.1, sal = [];
  for (let a = -90; a <= 90; a += da) for (let f = 1; f <= 10.0001; f += df) {
    const r = simular(n, a, Math.round(f * 10) / 10, { captura: o.captura || 0, sinPuntos: true, paso: o.paso });
    if (r.fin === 'luna' && r.i === meta) sal.push([a, Math.round(f * 10) / 10, r.cr.length]);
  }
  return sal;
}

/** «Apuntar por mí»: un lanzamiento que llega a la luna `meta`, el del centro de la ventana más ancha (el que aguanta
 *  un pequeño error). Se busca por trozos para no trabar el cuadro: `alFin(sol | null)`; devuelve () => cancelar. */
function apuntar(n, meta, captura, alFin, preferir) {
  let a = -90, cand = [], vivo = true;
  const trozo = () => {
    if (!vivo) return;
    const t0 = Date.now();
    while (a <= 90 && Date.now() - t0 < 12) {
      for (let f = 1; f <= 10.0001; f += 0.25) {
        const ff = Math.round(f * 100) / 100, r = simular(n, a, ff, { captura, sinPuntos: true, paso: 1 / 60 });
        if (r.fin === 'luna' && r.i === meta) cand.push([a, ff]);
      }
      a += 2;
    }
    if (a <= 90) { setTimeout(trozo, 0); return; }
    // confirmar con el paso de verdad, y quedarse con el que tiene más vecinos buenos
    const buenos = [];
    cand.forEach(c => {
      for (let da = -1; da <= 1; da++) for (let df = -0.1; df <= 0.1001; df += 0.1) {
        const ang = c[0] + da, f = Math.round((c[1] + df) * 10) / 10;
        if (f < 1 || f > 10) continue;
        const r = simular(n, ang, f, { captura, sinPuntos: true });
        if (r.fin === 'luna' && r.i === meta) buenos.push([ang, f, r.cr.length]);
      }
    });
    if (!buenos.length) { alFin(null); return; }
    const clave = s => s[0] + '|' + s[1], hay = new Set(buenos.map(clave));
    let mejor = null, mv = -1;
    buenos.forEach(s => {
      let v = 0;
      for (let da = -2; da <= 2; da++) for (let df = -0.2; df <= 0.2001; df += 0.1) if (hay.has((s[0] + da) + '|' + Math.round((s[1] + df) * 10) / 10)) v++;
      v += (preferir === 'cristales' ? s[2] * 3 : 0) - Math.abs(s[1] - 5.5) * 0.05;
      if (v > mv) { mv = v; mejor = s; }
    });
    alFin({ ang: mejor[0], fuerza: mejor[1] });
  };
  setTimeout(trozo, 0);
  return () => { vivo = false; };
}

/** Un nivel dado vuelta de arriba abajo (sirve igual: la gravedad es simétrica). */
function espejo(n) {
  const m = v => v.map(p => { const q = p.slice(); q[1] = -q[1]; return q; });
  const o = Object.assign({}, n, { sal: [n.sal[0], -n.sal[1]] });
  ['pl', 'lu', 'cr', 'ro', 'hn'].forEach(k => { if (n[k]) o[k] = m(n[k]); });
  if (n.sol) o.sol = n.sol.map(s => [-s[0], s[1]]);
  return o;
}

const F = { W, H, DT, TMAX, K, NAVE, CRISTAL, simular, rejilla, apuntar, espejo, cuerpos };
if (typeof module !== 'undefined' && module.exports) module.exports = F; else raiz.HondaFisica = F;
})(typeof window !== 'undefined' ? window : globalThis);
