/* Los sonidos de las historias, sintetizados con Web Audio (sin ficheros): window.SonidoHistoria.
   tocar(nombre, opc): 'fuego' {nivel 0..1} (continuo: se llama cada cuadro y sigue el nivel), 'llamarada' {fuerza},
   'explosion', 'musica' (cuerno, flauta y arpa: Daniel 3:5), 'angel' (un acorde que se abre), 'bien', 'mal'.
   Arranca con el primer toque del usuario (los navegadores no dejan sonar antes). silenciar(bool) y silencio(). */
(function () {
'use strict';
let ac = null, maestro = null, ruido = null, mudo = false, agachado = false;
try { mudo = localStorage.getItem('juegos3d.historia.mudo') === '1'; } catch (e) { /* sin almacenamiento */ }
function abrir() {
  if (ac) { if (ac.state === 'suspended') ac.resume(); return ac; }
  const AC = window.AudioContext || window.webkitAudioContext; if (!AC) return null;
  ac = new AC(); maestro = ac.createGain(); maestro.gain.value = mudo ? 0 : 0.8; maestro.connect(ac.destination);
  // un segundo de ruido marrón para el fuego y los soplos
  const n = ac.sampleRate * 2, b = ac.createBuffer(1, n, ac.sampleRate), d = b.getChannelData(0); let ult = 0;
  for (let i = 0; i < n; i++) { const w = Math.random() * 2 - 1; ult = (ult + 0.02 * w) / 1.02; d[i] = ult * 3.5; }
  ruido = b;
  return ac;
}
['pointerdown', 'keydown'].forEach(t => addEventListener(t, abrir, { capture: true }));
function fuenteRuido() { const s = ac.createBufferSource(); s.buffer = ruido; s.loop = true; return s; }

/* el fuego: ruido grave filtrado (rugido) y chasquidos sueltos (crepitar); el volumen sigue al nivel */
let fuego = null;
function nivelFuego(nivel) {
  if (!ac || ac.state !== 'running') return;
  if (!fuego) {
    const s = fuenteRuido(), f = ac.createBiquadFilter(), g = ac.createGain();
    f.type = 'lowpass'; f.frequency.value = 400; g.gain.value = 0;
    s.connect(f); f.connect(g); g.connect(maestro); s.start();
    fuego = { f, g, nivel: 0, crepita: 0 };
  }
  fuego.nivel = nivel;
  const t = ac.currentTime;
  fuego.g.gain.setTargetAtTime((0.05 + 0.4 * nivel) * (agachado ? 0.35 : 1), t, 0.3);
  fuego.f.frequency.setTargetAtTime(300 + 900 * nivel, t, 0.3);
  // chasquidos: más seguidos cuanto más fuego
  if (t > fuego.crepita) { chasquido(0.04 + 0.1 * nivel); fuego.crepita = t + 0.05 + Math.random() * (0.5 - 0.35 * nivel); }
}
function chasquido(v) {
  const s = ac.createBufferSource(), f = ac.createBiquadFilter(), g = ac.createGain(), t = ac.currentTime;
  s.buffer = ruido; f.type = 'highpass'; f.frequency.value = 1800 + Math.random() * 2500;
  g.gain.setValueAtTime(v, t); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.04 + Math.random() * 0.05);
  s.connect(f); f.connect(g); g.connect(maestro); s.start(t, Math.random()); s.stop(t + 0.12);
}
function soplo(fuerza, dur) {
  const s = fuenteRuido(), f = ac.createBiquadFilter(), g = ac.createGain(), t = ac.currentTime;
  f.type = 'lowpass'; f.frequency.setValueAtTime(200, t); f.frequency.exponentialRampToValueAtTime(1200 + 2500 * fuerza, t + dur * 0.3); f.frequency.exponentialRampToValueAtTime(250, t + dur);
  g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.35 + 0.5 * fuerza, t + dur * 0.25); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  s.connect(f); f.connect(g); g.connect(maestro); s.start(t, Math.random()); s.stop(t + dur + 0.05);
}
function tono(frec, ini, dur, tipo, vol, ataque, filtro) {
  const o = ac.createOscillator(), g = ac.createGain(), t = ac.currentTime + ini;
  o.type = tipo; o.frequency.setValueAtTime(frec, t);
  let ult = o;
  if (filtro) { const f = ac.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = filtro; o.connect(f); ult = f; }
  g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + (ataque || 0.01)); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  ult.connect(g); g.connect(maestro); o.start(t); o.stop(t + dur + 0.05);
}
/* Dn 3:5: cuerno, flauta, cítara, arpa… Una frase en modo frigio dominante (sonido de Oriente antiguo) */
function musica() {
  const re = 293.66, esc = [0, 1, 4, 5, 7, 8, 10, 12].map(s => re * Math.pow(2, s / 12));
  const arpa = [0, 2, 4, 2, 3, 4, 5, 4, 2, 1, 0, 2, 4, 7];
  arpa.forEach((n, i) => tono(esc[n], i * 0.28, 1.1, 'triangle', 0.16, 0.005));
  [[0, 0, 1.6], [4, 1.7, 1.6], [3, 3.4, 1.2], [0, 4.6, 1.6]].forEach(([n, ini, dur]) => tono(esc[n] / 2, ini, dur, 'sawtooth', 0.09, 0.15, 900));
  [[7, 0.6, 0.5], [6, 1.1, 0.5], [5, 1.6, 0.9], [4, 2.8, 0.5], [5, 3.3, 0.5], [7, 3.8, 1.2]].forEach(([n, ini, dur]) => tono(esc[n] * 2, ini, dur, 'sine', 0.07, 0.06));
  for (let i = 0; i < 12; i++) tono(70, i * 0.56, 0.25, 'sine', 0.25, 0.005);  // tambor
}
function angel() {
  [261.63, 329.63, 392, 523.25, 659.25].forEach((f, i) => { tono(f, i * 0.12, 3.2, 'sine', 0.07, 0.6); tono(f * 2, i * 0.12 + 0.05, 2.6, 'triangle', 0.02, 0.8); });
}
function explosion() {
  const t = ac.currentTime, o = ac.createOscillator(), g = ac.createGain();
  o.type = 'sine'; o.frequency.setValueAtTime(90, t); o.frequency.exponentialRampToValueAtTime(30, t + 0.8);
  g.gain.setValueAtTime(0.9, t); g.gain.exponentialRampToValueAtTime(0.0001, t + 1);
  o.connect(g); g.connect(maestro); o.start(t); o.stop(t + 1.05);
  soplo(1, 1.6);
}
window.SonidoHistoria = {
  tocar(nombre, o) {
    o = o || {};
    if (!ac || ac.state !== 'running') return;
    if (nombre === 'fuego') return nivelFuego(o.nivel || 0);
    if (nombre === 'llamarada') return soplo(o.fuerza == null ? 0.6 : o.fuerza, 0.9 + 0.6 * (o.fuerza || 0.6));
    if (nombre === 'explosion') return explosion();
    if (nombre === 'musica') return musica();
    if (nombre === 'angel') return angel();
    if (nombre === 'bien') { tono(660, 0, 0.18, 'triangle', 0.18); tono(990, 0.1, 0.3, 'triangle', 0.16); return; }
    if (nombre === 'mal') { tono(220, 0, 0.25, 'square', 0.06, 0.01, 800); }
  },
  silenciar(si) {
    mudo = !!si;
    try { localStorage.setItem('juegos3d.historia.mudo', mudo ? '1' : '0'); } catch (e) { /* nada */ }
    if (maestro) maestro.gain.setTargetAtTime(mudo ? 0 : 0.8, ac.currentTime, 0.05);
  },
  silencio: () => mudo,
  /** El volumen del fuego baja mientras alguien habla (para que se entienda la voz). */
  agachar(si) { agachado = !!si; }
};
})();
