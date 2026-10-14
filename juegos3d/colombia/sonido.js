/* Vuelo Cóndor — sonido. Todo sale de WebAudio (síntesis): no hay ficheros de audio.
 *
 * window.Sonido:
 *   fx(nombre, dato)   efecto suelto (ver FX abajo).
 *   musica(estilo, s)  música: 'menu' o la región ('andina', 'caribe', …); s = segundos de espera antes de
 *                      cambiar (al volar sobre una frontera la música no salta de un lado a otro).
 *   vuelo({modo, vel, alto, giro})  viento y motor; se llama en cada cuadro, se aplica 10 veces por segundo.
 *   pausa(si)          calla música y ambiente (los clics siguen sonando).
 *   boton(el)          convierte un botón en el de silencio; mezclador(el) pinta silencio + música + efectos.
 *   estado()           depuración: contexto, preferencias, cuenta de efectos pedidos y sonados, fuentes vivas.
 * Preferencias en localStorage `juegos3d.colombia.sonido` (siempre en try/catch). El AudioContext nace o se
 * reanuda con el primer toque o tecla; silencio o pestaña oculta = contexto suspendido.
 */
(function () {
'use strict';
var CLAVE = 'juegos3d.colombia.sonido';
var NIVEL = 1, MAX_VOCES = 40;
var NO_CLIC = '.op, .snd-mudo, [data-sonido]';

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
function flauta(m, t, d, v, bus, brillo) {
  var f = hz(m);
  tono(f, t, d, { tipo: 'triangle', v: v, a: 0.05, sost: Math.max(0.001, d * 0.5 - 0.05), vib: 5.3, lp: f * (brillo || 2.6), bus: bus });
  ruido(t, Math.min(0.22, d), { f: f * 2, q: 2.5, v: v * 0.3, a: 0.03, bus: bus });
}
function bajo(m, t, d, v, bus) { tono(hz(m), t, d, { tipo: 'triangle', v: v, a: 0.008, lp: 700, bus: bus }); }
function bombo(t, v, bus) { tono(105, t, 0.38, { v: v, a: 0.002, a2: 42, da2: 0.12, bus: bus }); }
function tambor(f, t, v, bus) { tono(f, t, 0.22, { v: v, a: 0.002, a2: f * 0.72, da2: 0.1, bus: bus }); ruido(t, 0.03, { f: 2200, v: v * 0.25, bus: bus }); }
function pajaro(t, v, bus) { var f = 2400 + Math.random() * 900; for (var i = 0; i < 2 + (Math.random() * 2 | 0); i++) tono(f, t + i * 0.11, 0.08, { v: v, a: 0.01, a2: f * 1.45, da2: 0.06, bus: bus }); }
function acorde(ms, t, v, d, bus, sube) { ms.forEach(function (m, i) { campana(m, t + i * (sube || 0), v, d, bus); }); }

/* ---------- efectos ---------- */
var FX = {
  clic: function (t) { tono(720, t, 0.07, { v: 0.06, a: 0.002, a2: 1180, da2: 0.035 }); tono(1900, t, 0.025, { v: 0.015 }); },
  despegue: function (t) {
    ruido(t, 1.2, { f: 380, f2: 2000, q: 0.9, v: 0.12, a: 0.45 });
    tono(130, t, 1, { tipo: 'sawtooth', v: 0.05, a: 0.25, a2: 230, da2: 0.8, lp: 650 });
    campana(84, t + 0.45, 0.07, 0.8); campana(91, t + 0.6, 0.05, 0.8);
  },
  aro: function (t, d) {
    var esc = [72, 74, 76, 79, 81, 84, 86, 88, 91, 93, 96], m = esc[Math.min(esc.length - 1, (d.i | 0) % esc.length)];
    campana(m, t, 0.12, 0.9); campana(m + 7, t + 0.07, 0.06, 0.7);
    ruido(t, 0.3, { ft: 'highpass', f: 5500, v: 0.05, a: 0.01 });
  },
  llegada: function (t) {
    ruido(t, 0.7, { f: 2500, f2: 700, q: 0.8, v: 0.08, a: 0.05 });
    acorde([72, 76, 79, 84, 88], t + 0.05, 0.11, 1.4, busF, 0.08);
  },
  aterrizar: function (t) {
    ruido(t, 1.1, { f: 1600, f2: 300, q: 0.8, v: 0.1, a: 0.1 });
    tono(420, t, 1, { tipo: 'triangle', v: 0.06, a: 0.05, a2: 180, lp: 900 });
    tambor(90, t + 1.15, 0.12);
  },
  equivocada: function (t) {
    tono(hz(67), t, 0.22, { tipo: 'triangle', v: 0.13, a: 0.01, lp: 1500 });
    tono(hz(64), t + 0.2, 0.4, { tipo: 'triangle', v: 0.13, a: 0.01, a2: hz(62), da2: 0.35, lp: 1500 });
  },
  bien: function (t) { acorde([72, 76, 79, 84], t, 0.14, 1, busF, 0.075); ruido(t + 0.25, 0.4, { ft: 'highpass', f: 6500, v: 0.04 }); },
  mal: function (t) {
    tono(hz(64), t, 0.25, { tipo: 'triangle', v: 0.12, a: 0.01, lp: 1200 });
    tono(hz(60), t + 0.2, 0.45, { tipo: 'triangle', v: 0.12, a: 0.01, lp: 1000 });
  },
  estrellas: function (t, d) {
    var n = Math.max(1, Math.min(3, d.n | 0));
    for (var i = 0; i < n; i++) { campana([79, 83, 86][i], t + 0.35 + i * 0.22, 0.1, 0.9); ruido(t + 0.35 + i * 0.22, 0.15, { ft: 'highpass', f: 7000, v: 0.03 }); }
  },
  fanfarria: function (t) {
    agachar(3.2);
    var metal = function (m, tt, d, v) { var f = hz(m); tono(f, tt, d, { tipo: 'sawtooth', v: v, a: 0.025, sost: d * 0.4, lp: f * 5, lp2: f * 1.6, dlp: d, bus: busF }); };
    [[67, 0], [67, 0.16], [67, 0.32]].forEach(function (n) { metal(n[0], t + n[1], 0.14, 0.11); });
    [60, 64, 67, 72].forEach(function (m) { metal(m, t + 0.5, 1.4, 0.075); });
    bombo(t + 0.5, 0.2); ruido(t + 0.5, 1.2, { ft: 'highpass', f: 5000, v: 0.05, a: 0.02 });
    acorde([84, 88, 91, 96], t + 0.6, 0.08, 1.3, busF, 0.09);
  },
  borde: function (t) { tono(520, t, 0.35, { tipo: 'triangle', v: 0.09, a: 0.02, a2: 300, lp: 1400 }); ruido(t, 0.4, { f: 900, f2: 400, v: 0.05, a: 0.1 }); },
  pista: function (t) { campana(79, t, 0.08, 0.8); campana(84, t + 0.14, 0.08, 1); },
  cerca: function (t) { campana(88, t, 0.07, 0.7); campana(84, t + 0.1, 0.05, 0.7); },
  region: function (t) { campana(76, t, 0.045, 1.1); campana(83, t + 0.12, 0.035, 1.1); }
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
  pad: function (t, a, ac, s, i, E) { ac.forEach(function (m, k) { tono(hz(m), t, E.bar * s * 1.1, { tipo: 'triangle', v: 0.035 * a, a: E.bar * s * 0.35, sost: E.bar * s * 0.3, lp: 1300, det: k % 2 ? 6 : -6, bus: busM }); }); },
  bajo: function (t, a, ac, s, i, E) { bajo(ac[0] - 12 + (i % E.bar >= E.bar / 2 ? 7 : 0), t, s * 2.6, 0.13 * a, busM); },
  rasgueo: function (t, a, ac) { ac.forEach(function (m, k) { pulsada(m + 12, t + k * 0.014, 0.03 * a, 0.28, busM, 9); }); },
  cuatro: function (t, a, ac) { ac.forEach(function (m, k) { pulsada(m, t + k * 0.012, 0.035 * a, 0.3, busM, 6); }); },
  arpa: function (t, a, ac, s, i) { var k = i % 6, m = ac[k % 3] + (k >= 3 ? 12 : 0) + 12; pulsada(m, t, 0.05 * a, 0.5, busM, 10); },
  bordon: function (t, a, ac, s, i) { mazo(ac[0] - 12 + (i % 12 >= 6 ? 7 : 0), t, 0.09 * a, busM, 0.45); },
  bombo: function (t, a) { bombo(t, 0.14 * a, busM); },
  tambor: function (t, a) { tambor(190, t, 0.08 * a, busM); },
  tamborBajo: function (t, a) { tambor(120, t, 0.1 * a, busM); },
  shaker: function (t, a) { ruido(t, 0.06, { ft: 'highpass', f: 6000, v: 0.035 * a, a: 0.012, bus: busM }); },
  guacharaca: function (t, a) { ruido(t, 0.1 + a * 0.04, { f: 3400, f2: 4400, q: 1.4, v: 0.04 * a, a: 0.06, bus: busM }); },
  lluvia: function (t, a, ac, s, i, E) { ruido(t, E.bar * s * 2, { ft: 'highpass', f: 4000, f2: 7000, v: 0.022 * a, a: E.bar * s * 0.8, bus: busM }); },
  pajaro: function (t, a) { if (Math.random() < 0.45) pajaro(t, 0.022 * a, busM); }
};
var VOZ = {
  quena: function (m, t, d, v) { flauta(m, t, d, v, busM, 2.4); },
  gaita: function (m, t, d, v) { flauta(m, t, d, v, busM, 4); },
  flautaBaja: function (m, t, d, v) { flauta(m - 12, t, d, v * 1.2, busM, 2); },
  campana: function (m, t, d, v) { campana(m, t, v, Math.max(0.8, d), busM); },
  pan: function (m, t, d, v) { var f = hz(m); tono(f, t, 0.7, { v: v, a: 0.004, bus: busM }); tono(f * 2, t, 0.35, { v: v * 0.35, bus: busM }); tono(f * 3.01, t, 0.15, { v: v * 0.15, bus: busM }); },
  marimba: function (m, t, d, v) { mazo(m, t, v, busM, 0.5); }
};
var ESTILOS = {
  menu: { bpm: 76, sub: 2, bar: 8, frase: 32, orden: 'AB', voz: 'campana', vMel: 0.07,
    acordes: [[60, 64, 67, 71], [57, 60, 64, 67], [53, 57, 60, 64], [55, 59, 62, 67]],
    pistas: [['pad', 'X.......'], ['bajo', 'x...o...']],
    mel: { A: [[0, 76, 2], [2, 79, 2], [4, 81, 4], [8, 79, 2], [10, 76, 2], [12, 74, 4], [16, 72, 2], [18, 74, 2], [20, 76, 4], [24, 79, 6]],
      B: [[0, 84, 2], [2, 81, 2], [4, 79, 4], [8, 81, 2], [10, 79, 2], [12, 76, 4], [16, 74, 2], [18, 76, 2], [20, 72, 8]] } },
  andina: { bpm: 96, sub: 4, bar: 8, frase: 32, orden: 'AB-', voz: 'quena', vMel: 0.085,
    acordes: [[57, 60, 64], [60, 64, 67], [55, 59, 62], [57, 60, 64]],
    pistas: [['bombo', 'X...x...'], ['rasgueo', 'X.xxx.xx'], ['bajo', 'x...o...']],
    mel: { A: [[0, 76, 3], [3, 79, 1], [4, 81, 4], [8, 79, 2], [10, 76, 2], [12, 72, 4], [16, 74, 3], [19, 76, 1], [20, 74, 2], [22, 72, 2], [24, 69, 8]],
      B: [[0, 81, 2], [2, 84, 2], [4, 81, 2], [6, 79, 2], [8, 76, 4], [12, 79, 4], [16, 79, 2], [18, 74, 2], [20, 74, 4], [24, 76, 2], [26, 72, 2], [28, 69, 4]] } },
  caribe: { bpm: 92, sub: 4, bar: 16, frase: 32, orden: 'AB-A', voz: 'gaita', vMel: 0.075,
    acordes: [[55, 59, 62], [54, 57, 62]],
    pistas: [['guacharaca', 'x.X.x.X.x.X.x.X.'], ['bajo', 'X.....x.X.....x.'], ['tambor', '....x.......x..o'], ['bombo', 'x.......x.......']],
    mel: { A: [[0, 74, 2], [2, 76, 2], [4, 74, 2], [6, 71, 2], [8, 74, 4], [12, 71, 2], [14, 69, 2], [16, 69, 4], [20, 66, 2], [22, 69, 2], [24, 74, 6], [30, 71, 2]],
      B: [[0, 79, 2], [2, 76, 2], [4, 74, 2], [6, 76, 2], [8, 79, 4], [12, 83, 4], [16, 81, 2], [18, 78, 2], [20, 74, 4], [24, 76, 2], [26, 78, 2], [28, 74, 4]] } },
  pacifica: { bpm: 84, sub: 3, bar: 6, frase: 24, orden: 'AAB-', voz: 'marimba', vMel: 0.1,
    acordes: [[64, 67, 71], [62, 66, 69], [64, 67, 71], [59, 62, 66]],
    pistas: [['bordon', 'X..x..'], ['bombo', 'X.....'], ['tamborBajo', '..x..x'], ['shaker', 'xoxXox']],
    mel: { A: [[0, 76, 1], [1, 79, 1], [2, 76, 1], [3, 74, 2], [5, 71, 1], [6, 74, 1], [7, 74, 1], [8, 76, 1], [9, 74, 2], [11, 69, 1], [12, 71, 1], [13, 74, 1], [14, 76, 1], [15, 79, 2], [17, 76, 1], [18, 74, 1], [19, 71, 1], [20, 74, 1], [21, 71, 3]],
      B: [[0, 83, 1], [1, 81, 1], [2, 79, 1], [3, 76, 3], [6, 74, 1], [7, 76, 1], [8, 79, 1], [9, 76, 3], [12, 79, 1], [13, 81, 1], [14, 83, 1], [15, 79, 3], [18, 78, 1], [19, 74, 1], [20, 71, 4]] } },
  orinoquia: { bpm: 150, sub: 2, bar: 6, frase: 24, orden: '-',
    acordes: [[62, 66, 69], [62, 67, 71], [61, 64, 69], [62, 66, 69]],
    pistas: [['arpa', 'XxxXxx'], ['bajo', 'x..x..'], ['shaker', 'XxxXxx'], ['cuatro', '..x.x.']] },
  amazonia: { bpm: 72, sub: 4, bar: 16, frase: 64, orden: 'A-B-', voz: 'flautaBaja', vMel: 0.08,
    acordes: [[62, 65, 69, 76], [60, 64, 67, 74], [55, 62, 67, 71], [57, 62, 65, 69]],
    pistas: [['pad', 'X...............'], ['tamborBajo', 'X.....x...x.....'], ['bajo', 'x...............'], ['pajaro', '.......x.......x'],
      ['lluvia', 'X...............................................................']],
    mel: { A: [[0, 81, 6], [6, 84, 2], [8, 86, 8], [16, 84, 4], [20, 81, 4], [24, 79, 8], [32, 77, 6], [38, 79, 2], [40, 81, 8], [48, 74, 12]],
      B: [[0, 86, 4], [4, 88, 4], [8, 89, 8], [16, 88, 4], [20, 86, 4], [24, 84, 8], [32, 81, 6], [38, 84, 2], [40, 86, 8], [48, 81, 12]] } }
};
ESTILOS.insular = Object.assign({}, ESTILOS.caribe, { bpm: 100, voz: 'pan', vMel: 0.08, orden: 'AB' });
ESTILOS.mar = Object.assign({}, ESTILOS.menu, { orden: 'A-' });

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

/* ---------- viento y motor ---------- */
var amb = null, vueloCero = 0;
function crearAmbiente() {
  var n = ctx.createBufferSource(), bp = ctx.createBiquadFilter(), gv = ctx.createGain();
  n.buffer = ruidoB; n.loop = true; bp.type = 'bandpass'; bp.frequency.value = 600; bp.Q.value = 0.7; gv.gain.value = 0;
  n.connect(bp); bp.connect(gv); gv.connect(busF);
  var m1 = ctx.createOscillator(), m2 = ctx.createOscillator(), g2 = ctx.createGain(), lp = ctx.createBiquadFilter(), am = ctx.createGain(), lfo = ctx.createOscillator(), lg = ctx.createGain(), gm = ctx.createGain();
  m1.type = 'sawtooth'; m1.frequency.value = 90; m2.type = 'square'; m2.frequency.value = 45.4; g2.gain.value = 0.3;
  lp.type = 'lowpass'; lp.frequency.value = 500; lp.Q.value = 1.5;
  am.gain.value = 0.6; lfo.frequency.value = 22; lg.gain.value = 0.38; gm.gain.value = 0;
  lfo.connect(lg); lg.connect(am.gain);
  m1.connect(lp); m2.connect(g2); g2.connect(lp); lp.connect(am); am.connect(gm); gm.connect(busF);
  var fuentes = [n, m1, m2, lfo];
  fuentes.forEach(function (s) { s.start(); vivos++; });
  amb = { bp: bp, gv: gv, m1: m1, m2: m2, lp: lp, lfo: lfo, gm: gm, fuentes: fuentes, nodos: [n, bp, gv, m1, m2, g2, lp, am, lfo, lg, gm] };
}
function quitarAmbiente() {
  if (!amb) return;
  amb.fuentes.forEach(function (s) { try { s.stop(); } catch (e) {} vivos--; });
  amb.nodos.forEach(function (x) { try { x.disconnect(); } catch (e) {} });
  amb = null;
}
var objetivo = { motor: 0, f: 80, corte: 500, viento: 0, vf: 600 };
function vuelo(e) {
  var o = objetivo;
  var vn = Math.max(0, Math.min(1, ((e.vel || 3.6) - 2) / 4.2)), al = Math.max(0, Math.min(1, ((e.alto || 4.2) - 4.2) / 5)), gi = Math.min(1, Math.abs(e.giro || 0));
  if (e.modo === 'vuelo') { o.motor = 0.045 + vn * 0.03; o.f = 74 + vn * 42; o.corte = 380 + vn * 520 - al * 140; o.viento = 0.035 + vn * 0.05 + al * 0.07 + gi * 0.025; o.vf = 450 + vn * 650 + al * 900; }
  else if (e.modo === 'aterrizando') { o.motor = 0.04; o.f = 64; o.corte = 420; o.viento = 0.05; o.vf = 700; }
  else if (e.modo === 'tarjeta') { o.motor = 0.018; o.f = 58; o.corte = 300; o.viento = 0.018; o.vf = 500; }
  else if (e.modo === 'inicio' || e.modo === 'cargando') { o.motor = 0; o.f = 60; o.corte = 300; o.viento = 0.022; o.vf = 520; }
  else { o.motor = 0; o.viento = 0; }
}
function ambienteTic() {
  var o = objetivo, t = ctx.currentTime, suena = !pausado && (o.motor > 0 || o.viento > 0);
  if (!suena) {
    if (amb) {
      amb.gm.gain.setTargetAtTime(0, t, 0.08); amb.gv.gain.setTargetAtTime(0, t, 0.08);
      if (!vueloCero) vueloCero = Date.now(); else if (Date.now() - vueloCero > 600) quitarAmbiente();
    }
    return;
  }
  vueloCero = 0;
  if (!amb) crearAmbiente();
  amb.gm.gain.setTargetAtTime(o.motor, t, 0.25); amb.gv.gain.setTargetAtTime(o.viento, t, 0.3);
  amb.m1.frequency.setTargetAtTime(o.f, t, 0.3); amb.m2.frequency.setTargetAtTime(o.f / 2 + 0.4, t, 0.3);
  amb.lfo.frequency.setTargetAtTime(o.f / 3.6, t, 0.3); amb.lp.frequency.setTargetAtTime(Math.max(150, o.corte), t, 0.3);
  amb.bp.frequency.setTargetAtTime(o.vf * (0.9 + Math.random() * 0.2), t, 0.4);
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
  fx: fx, musica: musica, vuelo: vuelo, pausa: pausa, boton: boton, mezclador: mezclador,
  estado: function () {
    return { ctx: ctx ? ctx.state : 'sin crear', mudo: pref.mudo, musica: pref.musica, efectos: pref.efectos, estilo: seq.estilo, pausado: pausado,
      cuenta: Object.assign({}, cuenta), sonados: sonados, vivos: vivos, ambiente: !!amb, salida: salida ? +salida.gain.value.toFixed(3) : null };
  }
};
})();
