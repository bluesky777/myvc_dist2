/* Pizzamática — sonido. Todo sale de WebAudio (síntesis): no hay ficheros de audio.
 *
 * window.Sonido:
 *   fx(nombre, dato)   efecto suelto (ver FX abajo).
 *   musica(estilo)     'taller' (inicio y mesas) o 'estacion' (más quieta, para pensar); null la calla.
 *   pausa(si)          calla la música (los efectos siguen sonando).
 *   boton(el)          convierte un botón en el de silencio; mezclador(el) pinta silencio + música + efectos.
 *   estado()           depuración: contexto, preferencias, cuenta de efectos pedidos y sonados, fuentes vivas.
 * Preferencias en localStorage `juegos3d.geometria.sonido` (siempre en try/catch). El AudioContext nace o se
 * reanuda con el primer toque o tecla; silencio o pestaña oculta = contexto suspendido.
 */
(function () {
'use strict';
var CLAVE = 'juegos3d.geometria.sonido';
var NIVEL = 1, MAX_VOCES = 40;
var NO_CLIC = '.snd-mudo, [data-sonido], #controles .step button';

/* ---------- preferencias ---------- */
var pref = { mudo: false, musica: 0.6, efectos: 0.8 };
try {
  var g0 = JSON.parse(localStorage.getItem(CLAVE) || 'null');
  if (g0 && typeof g0 === 'object') {
    pref.mudo = g0.mudo === true;
    if (typeof g0.musica === 'number' && g0.musica >= 0 && g0.musica <= 1) pref.musica = g0.musica;
    if (typeof g0.efectos === 'number' && g0.efectos >= 0 && g0.efectos <= 1) pref.efectos = g0.efectos;
  }
} catch (e) {}
function guardarPref() { try { localStorage.setItem(CLAVE, JSON.stringify(pref)); } catch (e) {} }
var volM = function () { return pref.musica * pref.musica * 0.65; };
var volF = function () { return pref.efectos * pref.efectos * 1.15; };

/* ---------- motor de audio ---------- */
var ctx = null, salida, busM, busF, ruidoB, pausado = false, oculto = document.hidden, dormir = 0;
var cuenta = {}, sonados = 0, vivos = 0;
var quiere = function () { return !pref.mudo && !oculto; };
var activo = function () { return !!ctx && ctx.state === 'running' && quiere(); };

function crear() {
  if (ctx) return true;
  var AC = window.AudioContext || window.webkitAudioContext;
  if (!AC) return false;
  try { ctx = new AC({ latencyHint: 'interactive' }); } catch (e) { ctx = null; return false; }
  salida = ctx.createGain(); salida.gain.value = quiere() ? NIVEL : 0;
  salida.connect(ctx.destination);
  busM = ctx.createGain(); busM.gain.value = volM();
  busF = ctx.createGain(); busF.gain.value = volF();
  busM.connect(salida); busF.connect(salida);
  var eco = ctx.createConvolver(), n = Math.floor(ctx.sampleRate * 1.6), imp = ctx.createBuffer(2, n, ctx.sampleRate);
  for (var c = 0; c < 2; c++) { var d = imp.getChannelData(c); for (var i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / n, 2.8); }
  eco.buffer = imp;
  var ecoM = ctx.createGain(), ecoF = ctx.createGain(); ecoM.gain.value = 0.32; ecoF.gain.value = 0.16;
  busM.connect(ecoM); busF.connect(ecoF); ecoM.connect(eco); ecoF.connect(eco); eco.connect(salida);
  ruidoB = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
  var r = ruidoB.getChannelData(0); for (var k = 0; k < r.length; k++) r[k] = Math.random() * 2 - 1;
  setInterval(latido, 80);
  if (!quiere()) aplicar();
  return true;
}
function despertar() {
  if (!crear()) return;
  if (quiere() && ctx.state !== 'running') ctx.resume().catch(function () {});
}
['pointerdown', 'keydown', 'touchend'].forEach(function (ev) { addEventListener(ev, despertar, true); });
function aplicar() {
  if (!ctx) return;
  var t = ctx.currentTime;
  clearTimeout(dormir);
  salida.gain.cancelScheduledValues(t); salida.gain.setValueAtTime(salida.gain.value, t);
  if (quiere()) {
    if (ctx.state !== 'running') ctx.resume().catch(function () {});
    salida.gain.linearRampToValueAtTime(NIVEL, t + 0.15);
  } else {
    salida.gain.linearRampToValueAtTime(0, t + 0.08);
    dormir = setTimeout(function () { if (!quiere() && ctx.state === 'running') ctx.suspend().catch(function () {}); }, 160);
  }
}
document.addEventListener('visibilitychange', function () { oculto = document.hidden; aplicar(); });
function volumenes() {
  if (!ctx) return;
  var t = ctx.currentTime;
  busM.gain.setTargetAtTime(pausado ? 0 : volM(), t, 0.08);
  busF.gain.setTargetAtTime(volF(), t, 0.05);
}

/* ---------- voces ---------- */
function fin(s, nodos) {
  vivos++;
  s.onended = function () { vivos--; for (var i = 0; i < nodos.length; i++) { try { nodos[i].disconnect(); } catch (e) {} } };
}
/* Un oscilador con envolvente. o: tipo, v, a (ataque), sost, a2/da2 (glissando), lp/lp2/dlp/q/ft (filtro), det, vib, bus */
function tono(f, t, d, o) {
  o = o || {};
  var g = ctx.createGain(), v = o.v == null ? 0.2 : o.v, a = o.a || 0.004, nodos = [g], cab = g;
  g.gain.value = 0; g.gain.setValueAtTime(0.0001, t);
  g.gain.linearRampToValueAtTime(v, t + a);
  if (o.sost) g.gain.setValueAtTime(v, t + a + o.sost);
  g.gain.exponentialRampToValueAtTime(0.0001, t + d);
  if (o.lp) {
    var fl = ctx.createBiquadFilter(); fl.type = o.ft || 'lowpass'; fl.Q.value = o.q || 0.8;
    fl.frequency.value = o.lp; fl.frequency.setValueAtTime(o.lp, t);
    if (o.lp2) fl.frequency.exponentialRampToValueAtTime(o.lp2, t + (o.dlp || d));
    fl.connect(g); cab = fl; nodos.push(fl);
  }
  var s = ctx.createOscillator(); s.type = o.tipo || 'sine'; s.frequency.value = f; s.frequency.setValueAtTime(f, t);
  if (o.a2) s.frequency.exponentialRampToValueAtTime(o.a2, t + (o.da2 || d));
  if (o.det) s.detune.setValueAtTime(o.det, t);
  if (o.vib) {
    var l = ctx.createOscillator(), lg = ctx.createGain();
    l.frequency.value = o.vib; lg.gain.setValueAtTime(0, t); lg.gain.linearRampToValueAtTime(f * (o.vibP || 0.012), t + Math.min(d * 0.6, 0.4));
    l.connect(lg); lg.connect(s.frequency); l.start(t); l.stop(t + d + 0.05); nodos.push(l, lg);
  }
  s.connect(cab); g.connect(o.bus || busF); nodos.push(s);
  s.start(t); s.stop(t + d + 0.05); fin(s, nodos);
}
/* Ruido filtrado. o: ft, f, f2, q, v, a, sost, bus */
function ruido(t, d, o) {
  o = o || {};
  var s = ctx.createBufferSource(), fl = ctx.createBiquadFilter(), g = ctx.createGain(), v = o.v == null ? 0.1 : o.v, a = o.a || 0.005;
  s.buffer = ruidoB; s.loop = true;
  fl.type = o.ft || 'bandpass'; fl.Q.value = o.q || 1; fl.frequency.value = o.f || 1200; fl.frequency.setValueAtTime(o.f || 1200, t);
  if (o.f2) fl.frequency.exponentialRampToValueAtTime(o.f2, t + d);
  g.gain.value = 0; g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(v, t + a);
  if (o.sost) g.gain.setValueAtTime(v, t + a + o.sost);
  g.gain.exponentialRampToValueAtTime(0.0001, t + d);
  s.connect(fl); fl.connect(g); g.connect(o.bus || busF);
  s.start(t, Math.random() * 1.5); s.stop(t + d + 0.05); fin(s, [s, fl, g]);
}
var hz = function (m) { return 440 * Math.pow(2, (m - 69) / 12); };

/* instrumentos */
function campana(m, t, v, d, bus) {
  var f = hz(m); d = d || 1.2;
  tono(f, t, d, { v: v, bus: bus });
  if (f < 5000) tono(f * 2.76, t, d * 0.3, { v: v * 0.2, bus: bus });
  if (f < 2600) tono(f * 5.4, t, 0.1, { v: v * 0.07, bus: bus });
}
function mazo(m, t, v, bus, d) { var f = hz(m); tono(f, t, d || 0.5, { v: v, a: 0.002, bus: bus }); tono(f * 4, t, 0.06, { v: v * 0.3, a: 0.001, bus: bus }); }
function pulsada(m, t, v, d, bus, brillo) { var f = hz(m); tono(f, t, d || 0.6, { tipo: 'sawtooth', v: v, a: 0.003, lp: Math.min(9000, f * (brillo || 7)), lp2: f * 1.4, dlp: 0.3, bus: bus }); }
function bombo(t, v, bus) { tono(105, t, 0.38, { v: v, a: 0.002, a2: 42, da2: 0.12, bus: bus }); }
function acorde(ms, t, v, d, bus, sube) { ms.forEach(function (m, i) { campana(m, t + i * (sube || 0), v, d, bus); }); }

/* ---------- efectos ---------- */
var FX = {
  clic: function (t) { tono(560, t, 0.07, { v: 0.06, a: 0.002, a2: 940, da2: 0.04 }); tono(1500, t, 0.025, { v: 0.015 }); },
  paso: function (t, d) { var f = d.sube ? 990 : 740; tono(f, t, 0.06, { tipo: 'triangle', v: 0.09, a: 0.002, a2: f * (d.sube ? 1.25 : 0.8), da2: 0.05 }); },
  aviso: function (t) { mazo(76, t, 0.08); mazo(76, t + 0.12, 0.06); },
  cuchillo: function (t) {
    ruido(t, 0.13, { f: 3200, f2: 1100, q: 1.2, v: 0.08, a: 0.03 });
    tono(190, t + 0.12, 0.12, { v: 0.16, a: 0.002, a2: 95, da2: 0.08 });
    ruido(t + 0.12, 0.05, { f: 900, q: 1, v: 0.07 });
  },
  separar: function (t, d) {
    var n = Math.min(8, Math.max(2, d.n | 0));
    for (var k = 0; k < n; k++) { var f = 520 + k * 70; tono(f, t + k * 0.03, 0.08, { v: 0.075, a: 0.003, a2: f * 1.7, da2: 0.06 }); }
    ruido(t, 0.35, { f: 2500, f2: 5000, q: 0.7, v: 0.03, a: 0.05 });
  },
  pieza: function (t, d) {
    ruido(t, 0.28, { f: 700, f2: 2600, q: 0.8, v: 0.04, a: 0.08 });
    if (d.servida) { tono(2640, t + 0.34, 0.3, { v: 0.05 }); tono(3960, t + 0.34, 0.14, { v: 0.02 }); tono(1320, t + 0.34, 0.12, { v: 0.04 }); }
    else tono(330, t + 0.34, 0.12, { tipo: 'triangle', v: 0.12, a: 0.002, a2: 230, da2: 0.08 });
  },
  plegar: function (t, d) {
    var dur = d.dur || 1.3, n = 5;
    for (var k = 0; k < n; k++) ruido(t + (k + 0.5) * dur / (n + 0.5), 0.07, { f: 1100 + k * 90, q: 1.5, v: 0.07, a: 0.004 });
    tono(d.cierra ? 260 : 520, t, dur, { tipo: 'triangle', v: 0.03, a: dur * 0.3, a2: d.cierra ? 520 : 260, lp: 1200 });
    if (d.cierra) mazo(84, t + dur, 0.09);
  },
  marcar: function (t, d) {
    var esc = [72, 74, 76, 79, 81, 84, 86, 88, 91, 93];
    if (d.quitar) tono(440, t, 0.1, { tipo: 'triangle', v: 0.08, a: 0.003, a2: 300 });
    else mazo(esc[Math.max(0, (d.n | 0) - 1) % esc.length], t, 0.13);
  },
  cubito: function (t, d) {
    var f = 300 + (d.y | 0) * 35, tt = t + 0.12;
    tono(f, tt, 0.09, { tipo: 'triangle', v: 0.1, a: 0.002, a2: f * 0.8, da2: 0.06 });
    ruido(tt, 0.025, { f: 2600, q: 1, v: 0.04 });
  },
  fila: function (t) { mazo(79, t, 0.1); mazo(84, t + 0.09, 0.1); },
  capa: function (t) { mazo(79, t, 0.1); mazo(83, t + 0.08, 0.1); mazo(86, t + 0.16, 0.12); },
  vaciar: function (t) {
    for (var k = 0; k < 6; k++) tono(520 - k * 55, t + k * 0.045, 0.07, { tipo: 'triangle', v: 0.08, a: 0.002 });
    ruido(t, 0.4, { f: 1800, f2: 500, v: 0.04, a: 0.05 });
  },
  crecer: function (t, d) { tono(d.sube ? 300 : 460, t, 0.18, { tipo: 'triangle', v: 0.08, a: 0.01, a2: d.sube ? 460 : 300 }); },
  entrar: function (t) { ruido(t, 0.7, { f: 400, f2: 1600, q: 0.7, v: 0.09, a: 0.3 }); },
  bien: function (t) { [72, 76, 79, 84].forEach(function (m, i) { mazo(m, t + i * 0.07, 0.15); }); campana(88, t + 0.3, 0.06, 1); },
  mal: function (t) {
    tono(hz(64), t, 0.25, { tipo: 'triangle', v: 0.12, a: 0.01, lp: 1200 });
    tono(hz(60), t + 0.2, 0.45, { tipo: 'triangle', v: 0.12, a: 0.01, lp: 1000 });
  },
  confeti: function (t) {
    ruido(t, 0.12, { f: 1800, f2: 600, q: 0.8, v: 0.18, a: 0.002 });
    for (var k = 0; k < 6; k++) campana(84 + (k * 5) % 12, t + 0.08 + Math.random() * 0.7, 0.04, 0.5);
  },
  estrellas: function (t, d) {
    var n = Math.max(1, Math.min(3, d.n | 0));
    for (var i = 0; i < n; i++) { campana([79, 83, 86][i], t + 0.1 + i * 0.22, 0.1, 0.9); ruido(t + 0.1 + i * 0.22, 0.15, { ft: 'highpass', f: 7000, v: 0.03 }); }
  },
  estacion: function (t) {
    agachar(3);
    var metal = function (m, tt, d, v) { var f = hz(m); tono(f, tt, d, { tipo: 'sawtooth', v: v, a: 0.025, sost: d * 0.4, lp: f * 5, lp2: f * 1.6, dlp: d, bus: busF }); };
    [[67, 0], [72, 0.15], [76, 0.3]].forEach(function (n) { metal(n[0], t + n[1], 0.14, 0.1); mazo(n[0] + 12, t + n[1], 0.08); });
    [60, 64, 67, 72].forEach(function (m) { metal(m, t + 0.48, 1.3, 0.07); });
    bombo(t + 0.48, 0.2); ruido(t + 0.48, 1.1, { ft: 'highpass', f: 5000, v: 0.05, a: 0.02 });
    acorde([84, 88, 91, 96], t + 0.6, 0.07, 1.2, busF, 0.08);
  },
  final: function (t) { FX.estacion(t); acorde([91, 96, 100, 103], t + 1.4, 0.06, 1.4, busF, 0.1); FX.confeti(t + 1.2); }
};
function agachar(seg) {
  if (!ctx) return;
  var t = ctx.currentTime, p = busM.gain;
  p.cancelScheduledValues(t); p.setValueAtTime(p.value, t);
  p.linearRampToValueAtTime(volM() * 0.25, t + 0.1);
  p.setValueAtTime(volM() * 0.25, t + seg); p.linearRampToValueAtTime(pausado ? 0 : volM(), t + seg + 1.2);
}
function fx(nombre, dato) {
  cuenta[nombre] = (cuenta[nombre] || 0) + 1;
  if (!activo() || pref.efectos <= 0 || !FX[nombre] || vivos > MAX_VOCES) return;
  sonados++;
  try { FX[nombre](ctx.currentTime + 0.01, dato || {}); } catch (e) {}
}

/* ---------- música ---------- */
/* Cada estilo: bpm, sub (pasos por pulso), bar (pasos por compás), acordes (uno por compás), pistas
 * [instrumento, patrón] donde X = acento, x = normal, o = suave, . = nada; y una melodía por frases. */
var INS = {
  bajoSalta: function (t, a, ac, s, i) { pulsada(ac[0] - 12 + ((i >> 1) % 2 ? 12 : 0), t, s * 1.6, 0.09 * a, busM, 4); },
  stab: function (t, a, ac) { ac.forEach(function (m, k) { pulsada(m + 12, t + k * 0.01, 0.025 * a, 0.18, busM, 5); }); },
  clap: function (t, a) { ruido(t, 0.08, { f: 1500, q: 1.2, v: 0.05 * a, a: 0.002, bus: busM }); ruido(t + 0.012, 0.1, { f: 1300, q: 1.2, v: 0.04 * a, a: 0.002, bus: busM }); },
  shaker: function (t, a) { ruido(t, 0.06, { ft: 'highpass', f: 6000, v: 0.035 * a, a: 0.012, bus: busM }); }
};
var VOZ = {
  xilo: function (m, t, d, v) { mazo(m, t, v, busM, 0.4); tono(hz(m) * 2, t, 0.15, { v: v * 0.25, bus: busM }); }
};
var ESTILOS = {
  taller: { bpm: 112, sub: 4, bar: 16, frase: 32, orden: 'ABAB--', voz: 'xilo', vMel: 0.09,
    acordes: [[60, 64, 67], [57, 60, 64], [53, 57, 60], [55, 59, 62]],
    pistas: [['bajoSalta', 'X.x.X.x.X.x.X.x.'], ['stab', '..x...x...x...x.'], ['clap', '....X.......X...'], ['shaker', '..x...x...x...xo']],
    mel: { A: [[0, 72, 2], [2, 76, 2], [4, 79, 3], [7, 76, 1], [8, 79, 2], [10, 81, 2], [12, 79, 4], [16, 76, 2], [18, 72, 2], [20, 69, 3], [23, 72, 1], [24, 76, 4], [28, 74, 4]],
      B: [[0, 77, 2], [2, 81, 2], [4, 84, 3], [7, 81, 1], [8, 77, 4], [12, 81, 4], [16, 79, 2], [18, 83, 2], [20, 86, 3], [23, 83, 1], [24, 79, 4], [28, 74, 2], [30, 71, 2]] } }
};
ESTILOS.estacion = Object.assign({}, ESTILOS.taller, { bpm: 104, orden: '--AB', vMel: 0.07,
  pistas: [['bajoSalta', 'X...x...X...x...'], ['stab', '....x.......x...'], ['shaker', '..o...o...o...o.']] });

var seq = { estilo: null, paso: 0, sig: 0 }, pend, pendT = 0;
function musica(nombre, espera) {
  if (nombre === undefined) nombre = null;
  if (nombre === seq.estilo && pend === undefined) return;
  pend = nombre; pendT = Date.now() + (espera || 0) * 1000;
  if (!espera) latido();
}
function cambiar(nombre) {
  if (nombre === seq.estilo) return;
  seq.estilo = ESTILOS[nombre] ? nombre : null; seq.paso = 0; seq.sig = 0;
  if (ctx) {
    var t = ctx.currentTime, p = busM.gain;
    p.cancelScheduledValues(t); p.setValueAtTime(0.0001, t); p.linearRampToValueAtTime(pausado ? 0 : volM(), t + 1.2);
  }
}
function tocarPaso(E, i, t, s) {
  var ac = E.acordes[Math.floor(i / E.bar) % E.acordes.length];
  for (var k = 0; k < E.pistas.length; k++) {
    var p = E.pistas[k], ch = p[1].charAt(i % p[1].length);
    if (ch !== '.') INS[p[0]](t, ch === 'X' ? 1 : ch === 'x' ? 0.7 : 0.45, ac, s, i, E);
  }
  if (!E.mel) return;
  var M = E.mel[E.orden.charAt(Math.floor(i / E.frase) % E.orden.length)], pos = i % E.frase;
  if (M) for (var j = 0; j < M.length; j++) if (M[j][0] === pos) VOZ[E.voz](M[j][1], t, M[j][2] * s, E.vMel);
}
function latido() {
  if (pend !== undefined && Date.now() >= pendT) { cambiar(pend); pend = undefined; }
  if (!activo()) return;
  if (pausado || !seq.estilo || pref.musica <= 0) return;
  var E = ESTILOS[seq.estilo], s = 60 / E.bpm / E.sub, ahora = ctx.currentTime;
  if (seq.sig < ahora + 0.02) seq.sig = ahora + 0.08;
  while (seq.sig < ahora + 0.3) {
    if (vivos < MAX_VOCES) tocarPaso(E, seq.paso, seq.sig, s);
    seq.paso++; seq.sig += s;
  }
}

function pausa(si) {
  pausado = !!si;
  volumenes();
}

/* ---------- controles ---------- */
var ICONO_SI = '<svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4z" fill="currentColor" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/><path d="M15.5 9a4 4 0 0 1 0 6M18 6.5a7.5 7.5 0 0 1 0 11" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/></svg>';
var ICONO_NO = '<svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4z" fill="currentColor" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/><path d="M16 9.5l5 5M21 9.5l-5 5" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/></svg>';
var botones = [], mezcladores = [];
(function () {
  var st = document.createElement('style');
  st.textContent = '.snd-off{color:var(--coral,#ff6a4d)!important}' +
    '.snd-mezcla{display:flex;align-items:center;gap:10px;width:100%;max-width:380px;margin:12px auto 0;text-align:left;touch-action:manipulation}' +
    '.snd-mezcla .snd-mudo{flex:none;width:44px;height:44px;border-radius:14px;border:0;background:var(--sand,#fff4dc);display:grid;place-items:center;padding:0;color:var(--ink,#15304d);cursor:pointer}' +
    '.snd-mezcla .snd-mudo:focus-visible,.snd-fila input:focus-visible{outline:3px solid var(--sea,#0e9aa0);outline-offset:2px}' +
    '.snd-fila{flex:1;min-width:0;display:grid;font:700 12px/1.2 Lexend,system-ui,sans-serif;color:var(--sea,#0e9aa0);cursor:pointer}' +
    '.snd-fila input{width:100%;height:28px;margin:0;accent-color:var(--colegio,#ff6a4d);cursor:pointer}' +
    '.snd-mezcla.mudo .snd-fila{opacity:.45}';
  document.head.appendChild(st);
})();
function pintar() {
  botones.forEach(function (b) {
    b.innerHTML = pref.mudo ? ICONO_NO : ICONO_SI;
    b.classList.toggle('snd-off', pref.mudo);
    b.setAttribute('aria-pressed', String(pref.mudo));
    b.setAttribute('aria-label', pref.mudo ? 'Activar el sonido' : 'Silenciar');
    b.title = pref.mudo ? 'Activar el sonido' : 'Silenciar';
  });
  mezcladores.forEach(function (m) {
    m.classList.toggle('mudo', pref.mudo);
    m.querySelector('[data-k="musica"]').value = Math.round(pref.musica * 100);
    m.querySelector('[data-k="efectos"]').value = Math.round(pref.efectos * 100);
  });
}
function alternar() {
  pref.mudo = !pref.mudo; guardarPref(); despertar(); aplicar(); pintar();
  if (!pref.mudo) setTimeout(function () { fx('clic'); }, 60);
}
function boton(el) {
  if (!el) return;
  el.classList.add('snd-mudo'); el.type = 'button';
  el.addEventListener('click', alternar);
  botones.push(el); pintar();
}
function mezclador(el) {
  if (!el) return;
  var d = document.createElement('div');
  d.className = 'snd-mezcla'; d.setAttribute('role', 'group'); d.setAttribute('aria-label', 'Sonido');
  d.innerHTML = '<button class="snd-mudo"></button>' +
    '<label class="snd-fila"><span>Música</span><input type="range" min="0" max="100" step="5" data-k="musica" aria-label="Volumen de la música"></label>' +
    '<label class="snd-fila"><span>Efectos</span><input type="range" min="0" max="100" step="5" data-k="efectos" aria-label="Volumen de los efectos"></label>';
  el.appendChild(d); mezcladores.push(d);
  boton(d.querySelector('.snd-mudo'));
  d.querySelectorAll('input').forEach(function (inp) {
    inp.addEventListener('input', function () {
      pref[inp.dataset.k] = Math.max(0, Math.min(1, inp.value / 100));
      if (pref.mudo && inp.value > 0) { pref.mudo = false; despertar(); aplicar(); }
      volumenes(); pintar();
    });
    inp.addEventListener('change', function () { guardarPref(); if (inp.dataset.k === 'efectos') fx('clic'); });
  });
  pintar();
}
/* clic de menú en cualquier botón o enlace que no tenga sonido propio */
document.addEventListener('click', function (e) {
  var b = e.target && e.target.closest && e.target.closest('button, a');
  if (b && !b.disabled && !b.closest(NO_CLIC)) fx('clic');
}, true);

window.Sonido = {
  fx: fx, musica: musica, pausa: pausa, boton: boton, mezclador: mezclador,
  estado: function () {
    return { ctx: ctx ? ctx.state : 'sin crear', mudo: pref.mudo, musica: pref.musica, efectos: pref.efectos, estilo: seq.estilo, pausado: pausado,
      cuenta: Object.assign({}, cuenta), sonados: sonados, vivos: vivos, salida: salida ? +salida.gain.value.toFixed(3) : null };
  }
};
})();
