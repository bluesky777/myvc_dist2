/* Two by Two — sonido sintetizado con WebAudio (0 KB de muestras), sin DOM ni three.
   window.SonidoArca: tocar(efecto), lluvia(0..1), mudo(si), silencio(motivo, si), estado().
   Efectos: clic, brillo, bien, mal, sigue, entra, puerta, trueno, arcoiris, fanfarria.
   El contexto nace en el primer gesto (autoplay); mudo, pausa y pestaña oculta lo suspenden. */
(function (raiz, fabrica) {
  if (typeof module === 'object' && module.exports) module.exports = fabrica();
  else raiz.SonidoArca = fabrica();
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';
  let ctx = null, master = null, ruido = null, lluviaG = null, lluviaF = null;
  let esMudo = false;
  const silencios = {};
  const cuenta = {};
  const AC = typeof window !== 'undefined' ? (window.AudioContext || window.webkitAudioContext) : null;

  function arrancar() {
    if (ctx || !AC) return ctx;
    try { ctx = new AC(); } catch (e) { return null; }
    master = ctx.createGain(); master.gain.value = 0.55; master.connect(ctx.destination);
    // ruido blanco de 2 s para la lluvia, el trueno y la puerta
    const n = ctx.sampleRate * 2; ruido = ctx.createBuffer(1, n, ctx.sampleRate);
    const d = ruido.getChannelData(0); for (let i = 0; i < n; i++) d[i] = Math.random() * 2 - 1;
    aplicar();
    return ctx;
  }
  function aplicar() {
    if (!ctx) return;
    const callar = esMudo || Object.keys(silencios).some(k => silencios[k]);
    if (callar && ctx.state === 'running') ctx.suspend().catch(() => {});
    else if (!callar && ctx.state !== 'running') ctx.resume().catch(() => {});
  }
  function nota(f, t0, dur, tipo, vol, f2) {
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.type = tipo || 'sine'; o.frequency.setValueAtTime(f, t0);
    if (f2) o.frequency.exponentialRampToValueAtTime(f2, t0 + dur);
    g.gain.setValueAtTime(0.0001, t0); g.gain.exponentialRampToValueAtTime(vol || 0.2, t0 + 0.015);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    o.connect(g); g.connect(master); o.start(t0); o.stop(t0 + dur + 0.05);
  }
  function soplo(t0, dur, fc, vol, q) {
    const s = ctx.createBufferSource(), f = ctx.createBiquadFilter(), g = ctx.createGain();
    s.buffer = ruido; f.type = 'lowpass'; f.frequency.value = fc; f.Q.value = q || 0.7;
    g.gain.setValueAtTime(0.0001, t0); g.gain.exponentialRampToValueAtTime(vol, t0 + 0.04); g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    s.connect(f); f.connect(g); g.connect(master); s.start(t0); s.stop(t0 + dur + 0.05);
  }
  const EF = {
    clic: t => nota(660, t, 0.08, 'triangle', 0.12),
    brillo: t => { nota(1320, t, 0.18, 'sine', 0.06); nota(1760, t + 0.06, 0.2, 'sine', 0.05); },
    bien: t => [523, 659, 784, 1047].forEach((f, i) => nota(f, t + i * 0.08, 0.25, 'triangle', 0.16)),
    mal: t => { nota(330, t, 0.18, 'sine', 0.14); nota(262, t + 0.16, 0.28, 'sine', 0.14); },
    sigue: t => { nota(440, t, 0.12, 'square', 0.05); nota(587, t + 0.1, 0.16, 'square', 0.05); },
    entra: t => [392, 494, 587, 784].forEach((f, i) => nota(f, t + i * 0.1, 0.3, 'sine', 0.13)),
    puerta: t => { soplo(t, 0.9, 260, 0.5, 1.5); nota(70, t, 0.6, 'sine', 0.5, 40); },
    trueno: t => { soplo(t, 2.6, 180, 0.7, 0.5); soplo(t + 0.25, 2.2, 90, 0.8, 0.5); },
    arcoiris: t => [523, 659, 784, 988, 1175, 1319, 1568].forEach((f, i) => nota(f, t + i * 0.12, 0.6, 'sine', 0.08)),
    fanfarria: t => { [523, 523, 523, 659, 784, 659, 784, 1047].forEach((f, i) => nota(f, t + [0, .12, .24, .36, .6, .78, .9, 1.1][i], i === 7 ? 0.8 : 0.22, 'triangle', 0.16)); }
  };
  function tocar(nombre) {
    cuenta[nombre] = (cuenta[nombre] || 0) + 1;
    if (!arrancar() || esMudo || !EF[nombre]) return;
    if (ctx.state !== 'running') ctx.resume().catch(() => {});
    EF[nombre](ctx.currentTime + 0.01);
  }
  /* La lluvia: un ruido filtrado continuo cuyo volumen sigue a `nivel` (0 = callada). */
  function lluvia(nivel) {
    if (!ctx && !(nivel > 0)) return; // sin lluvia no se crea el contexto (antes del primer gesto, Chrome lo bloquea)
    if (!arrancar()) return;
    if (!lluviaG && nivel > 0) {
      const s = ctx.createBufferSource(); s.buffer = ruido; s.loop = true;
      lluviaF = ctx.createBiquadFilter(); lluviaF.type = 'bandpass'; lluviaF.frequency.value = 1800; lluviaF.Q.value = 0.4;
      lluviaG = ctx.createGain(); lluviaG.gain.value = 0;
      s.connect(lluviaF); lluviaF.connect(lluviaG); lluviaG.connect(master); s.start();
    }
    if (lluviaG) lluviaG.gain.setTargetAtTime(Math.max(0, Math.min(1, nivel)) * 0.35, ctx.currentTime, 0.4);
  }
  return {
    tocar, lluvia,
    despertar: () => { arrancar(); aplicar(); },
    mudo: si => { esMudo = !!si; aplicar(); },
    esMudo: () => esMudo,
    silencio: (motivo, si) => { silencios[motivo] = !!si; aplicar(); },
    estado: () => ({ contexto: ctx ? ctx.state : 'sin', mudo: esMudo, cuenta: Object.assign({}, cuenta) })
  };
});
