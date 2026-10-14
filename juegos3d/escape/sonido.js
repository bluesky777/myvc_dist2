/* Escape Room — sonido. Todo sale de WebAudio (síntesis): no hay ficheros de audio.
 *
 * window.Sonido:
 *   fx(nombre, dato)   efecto suelto (ver FX abajo).
 *   musica(estilo)     'misterio' (la sala, suave: es para niños) o 'victoria' (al salir); null la calla.
 *   ambiente(n)        reloj de péndulo y chimenea de la sala, de 0 a 1.
 *   pausa(si)          calla música y ambiente (los efectos siguen sonando).
 *   boton(el)          convierte un botón en el de silencio; mezclador(el) pinta silencio + música + efectos.
 *   estado()           depuración: contexto, preferencias, cuenta de efectos pedidos y sonados, fuentes vivas.
 * Preferencias en localStorage `juegos3d.escape.sonido` (siempre en try/catch). El AudioContext nace o se
 * reanuda con el primer toque o tecla; silencio o pestaña oculta = contexto suspendido.
 */
(function () {
'use strict';
var CLAVE = 'juegos3d.escape.sonido';
var NIVEL = 1, MAX_VOCES = 40;
var NO_CLIC = '.opcion, .tecla, .ficha, #btnPista, .snd-mudo, [data-sonido]';

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
function pulsada(m, t, v, d, bus, brillo) { var f = hz(m); tono(f, t, d || 0.6, { tipo: 'sawtooth', v: v, a: 0.003, lp: Math.min(9000, f * (brillo || 7)), lp2: f * 1.4, dlp: 0.3, bus: bus }); }
function bombo(t, v, bus) { tono(105, t, 0.38, { v: v, a: 0.002, a2: 42, da2: 0.12, bus: bus }); }
function acorde(ms, t, v, d, bus, sube) { ms.forEach(function (m, i) { campana(m, t + i * (sube || 0), v, d, bus); }); }

/* ---------- efectos ---------- */
/* fricción de bisagra: un tren de pulsos lento por un pasabanda resonante */
function crujido(t, d, f0, f1, v) { tono(f0, t, d, { tipo: 'sawtooth', v: v * 6, a: 0.06, sost: d * 0.45, a2: f1, vib: 6.5, vibP: 0.22, ft: 'bandpass', lp: 850, lp2: 1500, q: 6 }); }
function clac(t, v) { tono(950, t, 0.05, { tipo: 'square', v: 0.035 * v, a: 0.001, lp: 2600 }); ruido(t, 0.035, { f: 3200, q: 1.5, v: 0.08 * v, a: 0.001 }); }
function brillo(t, n, v) { for (var k = 0; k < n; k++) campana(86 + (k * 7) % 14, t + Math.random() * 0.6, v, 0.6); }
var FX = {
  clic: function (t) { tono(640, t, 0.07, { v: 0.06, a: 0.002, a2: 1000, da2: 0.04 }); tono(1600, t, 0.025, { v: 0.015 }); },
  girar: function (t) { ruido(t, 0.35, { f: 500, f2: 1300, q: 0.8, v: 0.12, a: 0.12 }); },
  hoja: function (t) { ruido(t, 0.2, { f: 3000, f2: 1700, q: 0.6, v: 0.1, a: 0.02 }); ruido(t + 0.09, 0.12, { f: 4200, q: 0.8, v: 0.06 }); },
  reto: function (t, d) {
    if (d.obj === 'cofre') for (var k = 0; k < 3; k++) { tono(1700 + k * 230, t + 0.05 + k * 0.07, 0.07, { tipo: 'square', v: 0.035, lp: 4200 }); ruido(t + 0.05 + k * 0.07, 0.03, { f: 4800, q: 2, v: 0.08 }); }
    else if (d.obj === 'caja') for (var j = 0; j < 5; j++) clac(t + 0.05 + j * 0.06, 0.9);
  },
  tecla: function (t, d) {
    if (d.k === '⌫') { tono(520, t, 0.06, { tipo: 'triangle', v: 0.07, a: 0.002, a2: 380 }); return; }
    var n = /^[0-9]$/.test(d.k) ? +d.k : 5;
    ruido(t, 0.025, { f: 3600, q: 3, v: 0.12, a: 0.001 }); tono(1100 + n * 45, t, 0.035, { tipo: 'square', v: 0.035, a: 0.001, lp: 3200 });
    ruido(t + 0.03, 0.02, { f: 2800, q: 3, v: 0.07, a: 0.001 });
  },
  ficha: function (t) { tono(420, t, 0.08, { tipo: 'triangle', v: 0.1, a: 0.002, a2: 330 }); ruido(t, 0.02, { f: 2400, v: 0.04 }); },
  pista: function (t) { [84, 88, 91, 96].forEach(function (m, i) { campana(m, t + i * 0.06, 0.05, 0.8); }); ruido(t, 0.6, { ft: 'highpass', f: 5000, f2: 9000, v: 0.035, a: 0.3 }); },
  bien: function (t) { clac(t, 1); [72, 76, 79, 84].forEach(function (m, i) { campana(m, t + 0.08 + i * 0.075, 0.12, 1); }); },
  mal: function (t) {
    tono(hz(64), t, 0.25, { tipo: 'triangle', v: 0.12, a: 0.01, lp: 1200 });
    tono(hz(60), t + 0.2, 0.45, { tipo: 'triangle', v: 0.12, a: 0.01, lp: 1000 });
  },
  abrir: function (t, d) {
    if (d.obj === 'libro') { ruido(t, 0.45, { f: 1100, f2: 2600, q: 0.7, v: 0.12, a: 0.12 }); for (var k = 0; k < 5; k++) ruido(t + 0.3 + k * 0.06, 0.04, { f: 3600, q: 1, v: 0.08 }); }
    else if (d.obj === 'cuadro') crujido(t, 0.75, 38, 52, 0.05);
    else if (d.obj === 'reloj') { crujido(t, 0.45, 50, 62, 0.04); campana(57, t + 0.45, 0.09, 2.6); campana(64, t + 1.1, 0.06, 2.2); }
    else if (d.obj === 'cofre') { clac(t, 1); clac(t + 0.1, 0.7); crujido(t + 0.25, 0.9, 30, 44, 0.055); brillo(t + 0.9, 4, 0.03); }
    else if (d.obj === 'caja') { for (var j = 0; j < 8; j++) clac(t + j * (0.07 - j * 0.005), 0.45); tono(85, t + 0.5, 0.35, { v: 0.2, a: 0.003, a2: 60 }); ruido(t + 0.5, 0.15, { ft: 'lowpass', f: 700, v: 0.08 }); crujido(t + 0.62, 0.5, 42, 36, 0.035); }
  },
  premio: function (t, d) {
    if (d.tipo === 'llave') { for (var k = 0; k < 5; k++) { var f = 2900 + Math.random() * 1400; tono(f, t + 0.6 + k * 0.08 + Math.random() * 0.04, 0.18, { v: 0.05 }); tono(f * 1.5, t + 0.6 + k * 0.08, 0.1, { v: 0.025 }); } }
    else if (d.tipo === 'pista') FX.hoja(t + 0.6);
    else { campana(91, t + 0.6, 0.07, 1); campana(96, t + 0.72, 0.06, 1.2); }
  },
  chispas: function (t) { ruido(t, 0.5, { ft: 'highpass', f: 6000, f2: 3000, v: 0.04, a: 0.01 }); brillo(t, 6, 0.03); },
  listo: function (t) { [74, 78, 81, 86, 90].forEach(function (m, i) { campana(m, t + 0.5 + i * 0.09, 0.08, 1.4); }); ruido(t + 0.5, 1, { ft: 'highpass', f: 5000, v: 0.03, a: 0.4 }); },
  cerrada: function (t) { for (var k = 0; k < 3; k++) tono(110, t + k * 0.12, 0.13, { v: 0.15, a: 0.002, a2: 70, da2: 0.08 }); ruido(t + 0.02, 0.06, { f: 1500, q: 2, v: 0.05 }); clac(t + 0.3, 0.6); },
  codigoMal: function (t) { FX.cerrada(t); FX.mal(t + 0.25); },
  puerta: function (t) {
    clac(t, 1); clac(t + 0.18, 1); tono(160, t + 0.35, 0.25, { v: 0.12, a: 0.002, a2: 90 });
    crujido(t + 0.4, 1.7, 26, 40, 0.06);
    ruido(t + 0.6, 2.2, { f: 400, f2: 1800, q: 0.6, v: 0.1, a: 1 });
    [62, 69, 74, 78, 81].forEach(function (m, i) { tono(hz(m), t + 0.9 + i * 0.12, 2.2, { tipo: 'triangle', v: 0.05, a: 0.5, lp: 2200, bus: busF }); });
  },
  fanfarria: function (t, d) {
    agachar(3.5);
    var metal = function (m, tt, dd, v) { var f = hz(m); tono(f, tt, dd, { tipo: 'sawtooth', v: v, a: 0.025, sost: dd * 0.4, lp: f * 5, lp2: f * 1.6, dlp: dd, bus: busF }); };
    [[67, 0], [67, 0.16], [67, 0.32]].forEach(function (n) { metal(n[0], t + n[1], 0.14, 0.11); });
    [60, 64, 67, 72].forEach(function (m) { metal(m, t + 0.5, 1.4, 0.075); });
    bombo(t + 0.5, 0.2); ruido(t + 0.5, 1.2, { ft: 'highpass', f: 5000, v: 0.05, a: 0.02 });
    acorde([84, 88, 91, 96], t + 0.6, 0.08, 1.3, busF, 0.09);
    var n = Math.max(1, Math.min(3, d.n | 0));
    for (var i = 0; i < n; i++) campana([79, 83, 86][i], t + 1.6 + i * 0.25, 0.1, 0.9);
  }
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
  pad: function (t, a, ac, s, i, E) { ac.forEach(function (m, k) { tono(hz(m), t, E.bar * s * 1.1, { tipo: 'triangle', v: 0.03 * a, a: E.bar * s * 0.35, sost: E.bar * s * 0.3, lp: 1100, det: k % 2 ? 6 : -6, bus: busM }); }); },
  pizz: function (t, a, ac, s, i, E) { pulsada(ac[i % E.bar >= E.bar / 2 ? 2 : 0] - 12, t, 0.45, 0.1 * a, busM, 3); },
  brillo: function (t, a, ac) { if (Math.random() < 0.35) campana(ac[(Math.random() * ac.length) | 0] + 24, t, 0.018 * a, 0.9, busM); },
  shaker: function (t, a) { ruido(t, 0.06, { ft: 'highpass', f: 6000, v: 0.03 * a, a: 0.012, bus: busM }); }
};
var VOZ = {
  cajita: function (m, t, d, v) { campana(m, t, v, Math.max(1, d * 1.5), busM); }
};
var ESTILOS = {
  misterio: { bpm: 70, sub: 4, bar: 16, frase: 64, orden: 'A-B-', voz: 'cajita', vMel: 0.075,
    acordes: [[62, 65, 69], [58, 62, 65, 69], [55, 58, 62, 65], [57, 61, 64]],
    pistas: [['pad', 'X...............'], ['pizz', 'X.......x.......'], ['brillo', '......x.......x.']],
    mel: { A: [[0, 74, 2], [2, 77, 2], [4, 81, 4], [8, 79, 2], [10, 77, 2], [12, 76, 4], [16, 74, 2], [18, 77, 2], [20, 82, 4], [24, 81, 4], [28, 77, 4],
      [32, 79, 2], [34, 77, 2], [36, 74, 4], [40, 70, 4], [44, 74, 4], [48, 73, 4], [52, 76, 4], [56, 81, 8]],
      B: [[0, 81, 4], [4, 79, 4], [8, 77, 8], [16, 77, 4], [20, 74, 4], [24, 70, 8], [32, 74, 4], [36, 72, 4], [40, 70, 8], [48, 69, 8], [56, 73, 8]] } },
  victoria: { bpm: 96, sub: 4, bar: 16, frase: 64, orden: 'A-', voz: 'cajita', vMel: 0.08,
    acordes: [[60, 64, 67], [55, 59, 62], [57, 60, 64], [53, 57, 60]],
    pistas: [['pad', 'X...............'], ['pizz', 'X...x...X...x...'], ['shaker', '..x...x...x...x.']],
    mel: { A: [[0, 72, 2], [2, 76, 2], [4, 79, 4], [8, 84, 4], [12, 79, 4], [16, 79, 2], [18, 74, 2], [20, 71, 4], [24, 74, 4], [28, 79, 4],
      [32, 81, 2], [34, 76, 2], [36, 72, 4], [40, 76, 4], [44, 81, 4], [48, 77, 4], [52, 72, 4], [56, 77, 4], [60, 81, 4]] } }
};

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
  ambienteTic();
  if (pausado || !seq.estilo || pref.musica <= 0) return;
  var E = ESTILOS[seq.estilo], s = 60 / E.bpm / E.sub, ahora = ctx.currentTime;
  if (seq.sig < ahora + 0.02) seq.sig = ahora + 0.08;
  while (seq.sig < ahora + 0.3) {
    if (vivos < MAX_VOCES) tocarPaso(E, seq.paso, seq.sig, s);
    seq.paso++; seq.sig += s;
  }
}

/* ---------- la sala: reloj de péndulo y chimenea ---------- */
var nivelAmb = 0, fuego = null, fuegoCero = 0, relojSig = 0, tictac = 0;
function ambiente(n) { nivelAmb = Math.max(0, Math.min(1, +n || 0)); }
function quitarFuego() {
  if (!fuego) return;
  try { fuego.s.stop(); } catch (e) {}
  vivos--; [fuego.s, fuego.lp, fuego.g].forEach(function (x) { try { x.disconnect(); } catch (e) {} });
  fuego = null;
}
function ambienteTic() {
  var t = ctx.currentTime, n = pausado ? 0 : nivelAmb * pref.efectos;
  if (n <= 0) {
    if (fuego) { fuego.g.gain.setTargetAtTime(0, t, 0.1); if (!fuegoCero) fuegoCero = Date.now(); else if (Date.now() - fuegoCero > 600) quitarFuego(); }
    return;
  }
  fuegoCero = 0;
  if (!fuego) {
    var s = ctx.createBufferSource(), lp = ctx.createBiquadFilter(), g = ctx.createGain();
    s.buffer = ruidoB; s.loop = true; lp.type = 'lowpass'; lp.frequency.value = 380; g.gain.value = 0;
    s.connect(lp); lp.connect(g); g.connect(busF); s.start(); vivos++;
    fuego = { s: s, lp: lp, g: g };
  }
  fuego.g.gain.setTargetAtTime(0.028 * nivelAmb, t, 0.3);
  if (Math.random() < 0.3) ruido(t + 0.05 + Math.random() * 0.08, 0.012 + Math.random() * 0.03, { f: 1400 + Math.random() * 3000, q: 1.2, v: (0.012 + Math.random() * 0.03) * nivelAmb, a: 0.001 });
  if (relojSig < t) relojSig = t + 0.1;
  while (relojSig < t + 0.25) {
    var f = tictac++ % 2 ? 1900 : 2300;
    tono(f, relojSig, 0.035, { tipo: 'square', v: 0.01 * nivelAmb, a: 0.001, lp: 3500 }); ruido(relojSig, 0.02, { f: f * 1.5, q: 4, v: 0.02 * nivelAmb });
    relojSig += 1.21;
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
  fx: fx, musica: musica, ambiente: ambiente, pausa: pausa, boton: boton, mezclador: mezclador,
  estado: function () {
    return { ctx: ctx ? ctx.state : 'sin crear', mudo: pref.mudo, musica: pref.musica, efectos: pref.efectos, estilo: seq.estilo, pausado: pausado,
      cuenta: Object.assign({}, cuenta), sonados: sonados, vivos: vivos, ambiente: !!fuego, salida: salida ? +salida.gain.value.toFixed(3) : null };
  }
};
})();
