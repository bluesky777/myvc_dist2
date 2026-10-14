/* Microviaje — sonido. Todo sale de WebAudio (síntesis): no hay ficheros de audio.
 *
 * window.Sonido:
 *   fx(nombre)      efecto suelto: toque, bien, mal, parada, fibra, glucosa, impulso, fin, clic.
 *   ambiente(si)    el zumbido líquido de la célula mientras se juega.
 *   nado(vel)       burbujeo del nanorobot; se llama en cada cuadro con la velocidad 0–1.
 *   boton(el)       convierte un botón en el de silencio.
 * Preferencia en localStorage `juegos3d.celula.sonido` (siempre en try/catch). El AudioContext nace con
 * el primer toque o tecla; silencio o pestaña oculta = contexto suspendido.
 */
(function () {
'use strict';
var CLAVE = 'juegos3d.celula.sonido';
var mudo = false;
try { mudo = JSON.parse(localStorage.getItem(CLAVE) || 'false') === true; } catch (e) {}

var ctx = null, salida, ruidoB, amb = null, quiereAmb = false, burbuja = 0;
function crear() {
  if (ctx) return;
  var AC = window.AudioContext || window.webkitAudioContext;
  if (!AC) return;
  try { ctx = new AC(); } catch (e) { ctx = null; return; }
  salida = ctx.createGain(); salida.gain.value = 0.7; salida.connect(ctx.destination);
  var n = ctx.sampleRate, b = ctx.createBuffer(1, n, n), d = b.getChannelData(0);
  for (var i = 0; i < n; i++) d[i] = Math.random() * 2 - 1;
  ruidoB = b;
}
function vivo() { return ctx && ctx.state === 'running' && !mudo && !document.hidden; }
function despertar() {
  crear();
  if (ctx && ctx.state === 'suspended' && !mudo && !document.hidden) ctx.resume();
  if (quiereAmb) arrancarAmb();
}
document.addEventListener('pointerdown', despertar, true);
document.addEventListener('keydown', despertar, true);
document.addEventListener('visibilitychange', function () {
  if (!ctx) return;
  if (document.hidden || mudo) ctx.suspend(); else ctx.resume();
});

function tono(f, t, dur, tipo, vol, f2) {
  var o = ctx.createOscillator(), g = ctx.createGain();
  o.type = tipo || 'sine';
  o.frequency.setValueAtTime(f, t);
  if (f2) o.frequency.exponentialRampToValueAtTime(f2, t + dur);
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(vol, t + 0.012);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g); g.connect(salida);
  o.start(t); o.stop(t + dur + 0.05);
}
function ruido(t, dur, vol, tipo, f, f2) {
  var s = ctx.createBufferSource(), fl = ctx.createBiquadFilter(), g = ctx.createGain();
  s.buffer = ruidoB; fl.type = tipo; fl.frequency.setValueAtTime(f, t);
  if (f2) fl.frequency.exponentialRampToValueAtTime(f2, t + dur);
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(vol, t + 0.02);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  s.connect(fl); fl.connect(g); g.connect(salida);
  s.start(t, Math.random() * 0.5); s.stop(t + dur + 0.05);
}
function notas(lista, paso, tipo, vol, dur) {
  var t = ctx.currentTime;
  lista.forEach(function (f, i) { tono(f, t + i * paso, dur || 0.25, tipo, vol); });
}

var FX = {
  clic: function () { tono(900, ctx.currentTime, 0.05, 'triangle', 0.06); },
  toque: function () { tono(320, ctx.currentTime, 0.16, 'sine', 0.22, 760); },
  bien: function () { notas([523, 659, 784, 1047], 0.08, 'triangle', 0.16, 0.3); },
  parada: function () { notas([587, 880], 0.09, 'triangle', 0.15, 0.25); },
  mal: function () { var t = ctx.currentTime; tono(240, t, 0.18, 'sine', 0.18, 200); tono(180, t + 0.14, 0.26, 'sine', 0.16, 150); },
  fibra: function () { var t = ctx.currentTime; ruido(t, 0.22, 0.3, 'lowpass', 600, 120); tono(110, t, 0.2, 'sine', 0.25, 70); },
  glucosa: function () { var t = ctx.currentTime; tono(1320, t, 0.12, 'sine', 0.1); tono(1760, t + 0.07, 0.18, 'sine', 0.1); },
  impulso: function () { ruido(ctx.currentTime, 0.45, 0.22, 'bandpass', 300, 1800); },
  fin: function () { notas([523, 659, 784, 1047, 784, 1047], 0.11, 'triangle', 0.15, 0.35); }
};

function arrancarAmb() {
  if (amb || !ctx) return;
  var g = ctx.createGain(), fl = ctx.createBiquadFilter(), lfo = ctx.createOscillator(), lg = ctx.createGain();
  fl.type = 'lowpass'; fl.frequency.value = 380;
  g.gain.value = 0.0001; g.gain.setTargetAtTime(0.07, ctx.currentTime, 1.2);
  lfo.frequency.value = 0.17; lg.gain.value = 120; lfo.connect(lg); lg.connect(fl.frequency);
  var os = [55, 82.4, 110.3].map(function (f, i) {
    var o = ctx.createOscillator(); o.type = i ? 'sine' : 'triangle'; o.frequency.value = f; o.detune.value = i * 7; o.connect(fl); o.start(); return o;
  });
  fl.connect(g); g.connect(salida); lfo.start();
  amb = { g: g, os: os, lfo: lfo };
}
function pararAmb() {
  if (!amb) return;
  var a = amb; amb = null;
  a.g.gain.setTargetAtTime(0.0001, ctx.currentTime, 0.3);
  setTimeout(function () { a.os.forEach(function (o) { o.stop(); }); a.lfo.stop(); }, 1200);
}

var ICONO_SI = '<svg viewBox="0 0 24 24" width="22" height="22"><path d="M4 9h4l5-4v14l-5-4H4z" fill="currentColor"/><path d="M16 8.5a5 5 0 0 1 0 7M18.5 6a8.5 8.5 0 0 1 0 12" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round"/></svg>';
var ICONO_NO = '<svg viewBox="0 0 24 24" width="22" height="22"><path d="M4 9h4l5-4v14l-5-4H4z" fill="currentColor"/><path d="M16.5 9.5l5 5M21.5 9.5l-5 5" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/></svg>';

window.Sonido = {
  fx: function (n) { if (vivo() && FX[n]) try { FX[n](); } catch (e) {} },
  ambiente: function (si) { quiereAmb = !!si; if (!ctx) return; if (si) arrancarAmb(); else pararAmb(); },
  nado: function (v) {
    if (!vivo() || v < 0.15) return;
    burbuja -= v * 0.06;
    if (burbuja > 0) return;
    burbuja = 0.5 + Math.random() * 0.7;
    tono(500 + Math.random() * 500, ctx.currentTime, 0.07, 'sine', 0.025 + v * 0.03, 1200 + Math.random() * 600);
  },
  boton: function (el) {
    var pintar = function () { el.innerHTML = mudo ? ICONO_NO : ICONO_SI; el.setAttribute('aria-label', mudo ? 'Activar sonido' : 'Silenciar'); };
    pintar();
    el.addEventListener('click', function () {
      mudo = !mudo; pintar();
      try { localStorage.setItem(CLAVE, JSON.stringify(mudo)); } catch (e) {}
      despertar();
      if (ctx) { if (mudo) ctx.suspend(); else ctx.resume(); }
    });
  },
  estado: function () { return { ctx: ctx ? ctx.state : null, mudo: mudo, ambiente: !!amb }; }
};
})();
