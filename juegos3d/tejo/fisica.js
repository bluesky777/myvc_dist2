/* global module */
/* Tejo — la física y el puntaje, sin three ni azar (sirve igual en el navegador y en Node para comprobarla).
   - El tiro: sale de la mano a H0 = 1 m de altura (por debajo del hombro), con un ángulo de elevación, una rapidez
     (m/s) y un giro a los lados. Gravedad constante g = 9,8 m/s² y sin aire: la parábola exacta, en fórmula cerrada.
   - El cajón: una cara de greda de 1 m × 1 m inclinada 45° (sube alejándose del lanzador); su borde de abajo toca el
     suelo y el centro del bocín queda a D metros de la línea de lanzamiento. En la cara: s = hacia arriba de la
     pendiente desde el bocín, u = a los lados (+ = a la derecha del lanzador). Mundo: x = adelante, y = arriba, z = u.
   - Al llegar: corto (toca el suelo antes del cajón), se pasó (por encima del borde de atrás), fuera (por un lado),
     rebote (muy rasante: no se queda) o en la greda. La greda frena del todo un tejo que llega derecho; uno que llega
     de lado resbala un poco en la dirección en que iba (modelo del juego: más rasante, más resbala).
   - Puntos: mecha 3 (cada papeleta que toca, aunque luego se salga), embocinada 6 (el tejo queda dentro del bocín),
     moñona = embocinada + mecha en el mismo tiro (6 + 3 = 9) y mano 1 por ronda al tejo que quede más cerca del centro
     del bocín (MANO_SIEMPRE: aunque haya habido otros puntos). */
(function (raiz) {
'use strict';
const G = 9.8, H0 = 1.0, ALFA = Math.PI / 4, LADO = 0.5;            // media cara: 0,5 m
const CA = Math.cos(ALFA), SA = Math.sin(ALFA), TA = Math.tan(ALFA);
const YB = LADO * SA;                                                 // altura del centro del bocín
const MECHA = 0.032;                                                  // «radio» de la papeleta para tocarla
const RESPALDO = { x: 0.16, alto: 1.3 };                              // la tabla de atrás: a 16 cm del borde alto
const MANO_SIEMPRE = true;
const grados = r => r * 180 / Math.PI, rad = g => g * Math.PI / 180;

const CANCHAS = {
  mini: { id: 'mini', nombre: 'Minitejo', D: 6, R: 0.11, r: 0.04, meta: 12, vMin: 3, vMax: 13, pasoV: 0.05, pasoLat: 0.2, latMax: 8 },
  escolar: { id: 'escolar', nombre: 'Cancha escolar', D: 11, R: 0.085, r: 0.045, meta: 18, vMin: 5, vMax: 16, pasoV: 0.02, pasoLat: 0.1, latMax: 6 },
  grande: { id: 'grande', nombre: 'Cancha grande', D: 18.5, R: 0.08, r: 0.045, meta: 27, vMin: 8, vMax: 18, pasoV: 0.01, pasoLat: 0.1, latMax: 5 }
};
const ANG = { min: 10, max: 60, paso: 1 };
const PUNTOS = { mecha: 3, embocinada: 6, monona: 9, mano: 1 };

/** Las cuatro mechas en el borde del bocín: arriba, derecha, abajo, izquierda (en la cara: [s, u]). */
function mechas(c) {
  const m = c.R + 0.03;
  return [{ id: 'arriba', s: m, u: 0 }, { id: 'derecha', s: 0, u: m }, { id: 'abajo', s: -m, u: 0 }, { id: 'izquierda', s: 0, u: -m }];
}
const enCara = (c, s, u) => ({ x: c.D + s * CA, y: YB + s * SA, z: u });

/** Las componentes de un tiro {ang (°), v (m/s), lat (°)}. */
function componentes(t) {
  const a = rad(t.ang), l = rad(t.lat || 0);
  return { vx: t.v * Math.cos(a) * Math.cos(l), vy: t.v * Math.sin(a), vz: t.v * Math.cos(a) * Math.sin(l) };
}
/** Dónde está el tejo a los t segundos. */
function posicion(t, k) {
  const v = componentes(t);
  return { x: v.vx * k, y: H0 + v.vy * k - G * k * k / 2, z: v.vz * k };
}

/** Lanza un tejo. `vivas`: las mechas que siguen en el bocín (índices de mechas(c)). Devuelve todo lo que pasó. */
function lanzar(c, tiro, vivas) {
  vivas = vivas || [0, 1, 2, 3];
  const v = componentes(tiro), M = mechas(c);
  // el cruce con el plano de la cara: H0 + vy·t − g·t²/2 = YB + (vx·t − D)·tanα
  const b = v.vy - v.vx * TA, k0 = H0 - YB + c.D * TA;
  const tp = (b + Math.sqrt(b * b + 2 * G * k0)) / G;
  const p = posicion(tiro, tp), s = (p.x - c.D) / CA, u = p.z;
  const tSub = Math.max(0, v.vy / G), hMax = H0 + Math.max(0, v.vy) * Math.max(0, v.vy) / (2 * G);
  const base = { tiro: { ang: tiro.ang, v: tiro.v, lat: tiro.lat || 0 }, vx: v.vx, vy0: v.vy, vz: v.vz, tSub, hMax, mechas: [], embocinada: false, puntos: 0 };
  const llegada = k => { const vy = v.vy - G * k; return { vImp: Math.hypot(v.vx, vy, v.vz), angLlegada: grados(Math.atan2(-vy, Math.hypot(v.vx, v.vz))) }; };
  if (s < -LADO) { // toca el suelo antes del cajón
    const tg = (v.vy + Math.sqrt(v.vy * v.vy + 2 * G * H0)) / G, q = posicion(tiro, tg);
    return Object.assign(base, llegada(tg), { tipo: 'corto', t: tg, fin: q, falta: c.D - LADO * CA - q.x, alcance: q.x });
  }
  if (s > LADO) { // por encima del borde de atrás: al respaldo o, si va muy alto, por encima de él
    const xr = c.D + LADO * CA + RESPALDO.x, tr = xr / v.vx, q = posicion(tiro, tr);
    if (q.y <= RESPALDO.alto && q.y > 0) return Object.assign(base, llegada(tr), { tipo: 'paso', t: tr, fin: q, respaldo: true, alcance: q.x });
    const tg = (v.vy + Math.sqrt(v.vy * v.vy + 2 * G * H0)) / G;
    return Object.assign(base, llegada(tg), { tipo: 'paso', t: tg, fin: posicion(tiro, tg), respaldo: false, alcance: posicion(tiro, tg).x });
  }
  const con = { s, u, x: p.x, y: p.y, z: p.z };
  if (Math.abs(u) > LADO - c.r * 0.5) return Object.assign(base, llegada(tp), { tipo: 'fuera', t: tp, fin: p, contacto: con, alcance: p.x });
  // la velocidad al llegar, en la cara: a lo largo (s), a los lados (u) y hacia dentro (n)
  const vy = v.vy - G * tp;
  const vs = v.vx * CA + vy * SA, vn = v.vx * SA - vy * CA, vu = v.vz;
  const inc = grados(Math.atan2(vn, Math.hypot(vs, vu)));
  const ll = llegada(tp);
  if (inc < 30) return Object.assign(base, ll, { tipo: 'rebote', t: tp, fin: p, contacto: con, incidencia: inc, alcance: p.x });
  const L = inc < 72 ? 0.35 * (72 - inc) / 42 : 0, nt = Math.hypot(vs, vu) || 1, ds = vs / nt, du = vu / nt;
  const dentro = c.R - 0.3 * c.r, N = 24, tocadas = [];
  let rs = s, ru = u, embo = false, salio = false;
  for (let i = 0; i <= N; i++) {
    const qs = s + ds * L * i / N, qu = u + du * L * i / N;
    if (qs > LADO || Math.abs(qu) > LADO - c.r * 0.5) { salio = true; break; }
    rs = qs; ru = qu;
    vivas.forEach(j => { const m = M[j]; if (tocadas.indexOf(j) < 0 && Math.hypot(qs - m.s, qu - m.u) <= c.r + MECHA) tocadas.push(j); });
    if (Math.hypot(qs, qu) <= dentro) { embo = true; break; }
  }
  tocadas.sort((a, b2) => a - b2);
  const d = Math.hypot(rs, ru), reposo = Object.assign({ s: rs, u: ru }, enCara(c, rs, ru));
  const out = Object.assign(base, ll, { t: tp, contacto: con, incidencia: inc, resbalo: Math.hypot(rs - s, ru - u), reposo, fin: reposo, alcance: p.x, mechas: tocadas });
  if (salio) return Object.assign(out, { tipo: 'paso', resbalo: L, puntos: PUNTOS.mecha * tocadas.length, salioResbalando: true, d: null });
  return Object.assign(out, { tipo: 'tablero', d: embo ? 0 : d, dReal: d, embocinada: embo,
    puntos: (embo ? PUNTOS.embocinada : 0) + PUNTOS.mecha * tocadas.length });
}

/** El nombre de lo que hizo un tejo: moñona, embocinada, mecha (o mechas), o nada. */
function jugada(r) {
  if (r.embocinada && r.mechas.length) return 'monona';
  if (r.embocinada) return 'embocinada';
  if (r.mechas.length) return 'mecha';
  return '';
}

/** Los puntos de una ronda: tejos = [{jugador: 0|1, res}]. La mano (1) es del tejo en la greda más cerca del bocín. */
function puntuarRonda(tejos) {
  const pts = [0, 0], det = [[], []];
  tejos.forEach(t => {
    const r = t.res;
    let m = r.mechas.length;
    if (r.embocinada && m) { det[t.jugador].push({ que: 'monona', puntos: PUNTOS.monona }); m--; } // moñona = embocinada + una mecha
    else if (r.embocinada) det[t.jugador].push({ que: 'embocinada', puntos: PUNTOS.embocinada });
    for (; m > 0; m--) det[t.jugador].push({ que: 'mecha', puntos: PUNTOS.mecha });
  });
  const hayPuntos = det[0].length + det[1].length > 0;
  let mano = null;
  if (MANO_SIEMPRE || !hayPuntos) {
    const en = tejos.filter(t => t.res.tipo === 'tablero').sort((a, b) => a.res.d - b.res.d);
    if (en.length && (en.length === 1 || en[1].res.d - en[0].res.d > 1e-9)) mano = { jugador: en[0].jugador, d: en[0].res.d, tejo: tejos.indexOf(en[0]) };
    if (mano) det[mano.jugador].push({ que: 'mano', puntos: PUNTOS.mano });
  }
  det.forEach((l, j) => { pts[j] = l.reduce((a, x) => a + x.puntos, 0); });
  return { puntos: pts, detalle: det, mano };
}

/** El tiro exacto que pasa por el punto (s, u) de la cara con el ángulo `ang`: {ang, v, lat}, o null si no hay. */
function apuntarA(c, s, u, ang) {
  const P = enCara(c, s, u), d = Math.hypot(P.x, P.z), a = rad(ang);
  const den = 2 * Math.cos(a) * Math.cos(a) * (H0 + d * Math.tan(a) - P.y);
  if (den <= 0) return null;
  return { ang, v: Math.sqrt(G * d * d / den), lat: grados(Math.atan2(P.z, P.x)) };
}
/** Como apuntarA, pero corrige lo que resbala para que el tejo QUEDE en (s, u). */
function apuntarQuedar(c, s, u, ang, vivas) {
  let ts = s, tu = u, t = null;
  for (let i = 0; i < 4; i++) {
    t = apuntarA(c, ts, tu, ang); if (!t) return null;
    const r = lanzar(c, t, vivas || []);
    if (r.tipo !== 'tablero') return t;
    ts += s - r.reposo.s; tu += u - r.reposo.u;
  }
  return t;
}

/** Redondea un tiro a los pasos de los controles de la cancha (lo que un jugador puede poner de verdad). */
function aPasos(c, t) {
  const q = (x, p) => Math.round(x / p) * p;
  return { ang: Math.min(ANG.max, Math.max(ANG.min, q(t.ang, ANG.paso))), v: +Math.min(c.vMax, Math.max(c.vMin, q(t.v, c.pasoV))).toFixed(2),
    lat: +Math.min(c.latMax, Math.max(-c.latMax, q(t.lat, c.pasoLat))).toFixed(1) };
}

/** Azar con semilla (mulberry32): Don Tulio tira igual en la misma partida. */
function azar(semilla) {
  let a = semilla >>> 0;
  const f = () => { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  f.normal = () => { const x = Math.max(1e-9, f()), y = f(); return Math.sqrt(-2 * Math.log(x)) * Math.cos(2 * Math.PI * y); };
  return f;
}
/** Lo fino que tira Don Tulio: σ de la rapidez (m/s), del giro (°) y del ángulo (°). */
const PULSO = { facil: { sv: 0.36, sl: 0.6, sa: 2 }, media: { sv: 0.22, sl: 0.4, sa: 1.5 }, normal: { sv: 0.15, sl: 0.27, sa: 1.2 } };
/** El tiro de Don Tulio: casi siempre al bocín, a veces a una mecha viva; luego su pulso. */
function tiroRival(c, modo, rng, vivas) {
  const P = PULSO[modo] || PULSO.normal, M = mechas(c);
  let s = 0, u = 0;
  if (vivas.length && rng() < 0.35) { const m = M[vivas[Math.floor(rng() * vivas.length)]]; s = m.s; u = m.u; }
  const ang = 34 + Math.floor(rng() * 12);
  const t = apuntarQuedar(c, s, u, ang, []) || apuntarA(c, 0, 0, 40);
  return aPasos(c, { ang: t.ang + P.sa * rng.normal(), v: t.v + P.sv * rng.normal(), lat: t.lat + P.sl * rng.normal() });
}

const F = { G, H0, ALFA, LADO, YB, CA, SA, MECHA, RESPALDO, MANO_SIEMPRE, CANCHAS, ANG, PUNTOS, PULSO,
  mechas, enCara, componentes, posicion, lanzar, jugada, puntuarRonda, apuntarA, apuntarQuedar, aPasos, azar, tiroRival };
if (typeof module !== 'undefined' && module.exports) module.exports = F; else raiz.TejoFisica = F;
})(typeof window !== 'undefined' ? window : globalThis);
