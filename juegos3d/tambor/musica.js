/* Tambor Bailarín — la música, toda sintetizada con Web Audio (0 KB de audio, nada grabado ni con derechos).
   Los ritmos son patrones de golpes compuestos para el juego sobre los aires de Colombia (cumbia, mapalé, bambuco,
   sanjuanero, joropo, currulao); la melodía se inventa cada partida (escala, acordes y una frase AABA con semilla).
   Instrumentos: tambor alegre, llamador, tambora, cununo, maracas, guacharaca, gaita, marimba de chonta, arpa llanera,
   cuatro, tiple, bandola, palmas y cucharas, todos de osciladores y ruido.
   EL RELOJ: el del AudioContext. `pulso()` da el pulso de la canción (0 = el primer pulso después de la cuenta) con la
   latencia de salida descontada, así lo que se ve cae con lo que se oye. Sin Web Audio (o mudo de fábrica) el reloj es
   performance.now() y el juego se juega igual, mirando.
   window.TamborMusica = { RITMOS, motor() } */
(function () {
'use strict';

// grados → semitonos
const ESC = { mayor: [0, 2, 4, 5, 7, 9, 11], menor: [0, 2, 3, 5, 7, 8, 11], penta: [0, 2, 4, 7, 9] };
const AC = { I: [0, 4, 7], IV: [5, 9, 12], V: [7, 11, 14], V7: [7, 11, 14, 17], i: [0, 3, 7], iv: [5, 8, 12], VI: [8, 12, 15], ii: [2, 5, 9] };

/* Cada ritmo: compás (pulsos por compás), sub (golpecitos por pulso), bpm (pulsos por minuto), la tonalidad, los
   acordes (uno por compás, se repiten), la melodía (instrumento y escala) y los patrones de cada instrumento por
   compás: X fuerte, x medio, o suave, . nada; en los tambores a = abierto, t = tapado, g = golpe seco.
   carriles: los tres instrumentos que toca el jugador entre pregunta y pregunta. */
const RITMOS = {
  cumbia: { nombre: 'Cumbia', region: 'Caribe', emoji: '🌴', compas: 2, sub: 4, bpm: 94, raiz: 57, escala: 'mayor', mel: 'gaita',
    acordes: ['I', 'I', 'V7', 'V7', 'V7', 'V7', 'I', 'I'], cielo: 'caribe',
    pat: { tambora: ['X...x...'], llamador: ['..x...x.'], alegre: ['a..t.ta.', 'a.tt.a.g', 'a..t.ta.', 'g.ag.a.t'], maracas: ['xoox xoox'.replace(/ /g, '')], bajo: ['x.....o.'] },
    carriles: ['alegre', 'maracas', 'llamador'], instrumentos: 'tambor alegre, llamador, tambora, maracas y gaita' },
  mapale: { nombre: 'Mapalé', region: 'Caribe', emoji: '🔥', compas: 2, sub: 4, bpm: 118, raiz: 57, escala: 'menor', mel: 'gaita',
    acordes: ['i', 'i', 'V', 'V'], cielo: 'fuego',
    pat: { tambora: ['X..x..x.'], llamador: ['..x...x.'], alegre: ['atatgtat', 'atagatag'], palmas: ['x...x...'], maracas: ['xxxxxxxx'], bajo: ['x..o..x.'] },
    carriles: ['alegre', 'palmas', 'llamador'], instrumentos: 'tambores, palmas y maracas' },
  bambuco: { nombre: 'Bambuco', region: 'Andes', emoji: '⛰️', compas: 3, sub: 2, bpm: 104, raiz: 52, escala: 'menor', mel: 'bandola',
    acordes: ['i', 'i', 'V7', 'V7', 'iv', 'i', 'V7', 'i'], cielo: 'andes',
    pat: { tiple: ['..x.xx'], bajo: ['x....o'], cucharas: ['x.xx.x'], tambora: ['x..x..'] },
    carriles: ['tiple', 'cucharas', 'tambora'], instrumentos: 'tiple, bandola, guitarra y cucharas' },
  sanjuanero: { nombre: 'Sanjuanero', region: 'Andes (Huila)', emoji: '👒', compas: 3, sub: 2, bpm: 112, raiz: 50, escala: 'mayor', mel: 'bandola',
    acordes: ['I', 'I', 'V7', 'V7', 'V7', 'V7', 'I', 'I'], cielo: 'pueblo',
    pat: { tiple: ['.xx.xx'], bajo: ['x...o.'], tambora: ['x..x.x'], maracas: ['xoxoxo'] },
    carriles: ['tambora', 'maracas', 'tiple'], instrumentos: 'tiple, bandola, tambora y chucho' },
  joropo: { nombre: 'Joropo', region: 'Llanos', emoji: '🐎', compas: 3, sub: 2, bpm: 146, raiz: 50, escala: 'mayor', mel: 'arpa',
    acordes: ['I', 'IV', 'V7', 'I', 'I', 'IV', 'V7', 'V7'], cielo: 'llano',
    pat: { arpaBajo: ['x...x.'], cuatro: ['..x.x.', '..x.xx'], maracas: ['xoxXox'] },
    carriles: ['maracas', 'cuatro', 'arpa'], instrumentos: 'arpa llanera, cuatro y maracas' },
  currulao: { nombre: 'Currulao', region: 'Pacífico', emoji: '🌊', compas: 2, sub: 3, bpm: 88, raiz: 55, escala: 'penta', mel: 'marimba',
    acordes: ['I', 'I', 'V', 'I'], cielo: 'pacifico',
    pat: { marimbaOst: ['xoxxox'], cununo: ['a..t.a', 'a.tt.a'], bombo: ['X..x..'], maracas: ['xoxxox'] },
    carriles: ['bombo', 'cununo', 'marimba'], instrumentos: 'marimba de chonta, cununos, bombo y guasá' }
};
const NOMBRE_INS = { alegre: 'Tambor alegre', llamador: 'Llamador', tambora: 'Tambora', maracas: 'Maracas', palmas: 'Palmas', tiple: 'Tiple', cucharas: 'Cucharas',
  cuatro: 'Cuatro', arpa: 'Arpa', bombo: 'Bombo', cununo: 'Cununo', marimba: 'Marimba', guacharaca: 'Guacharaca' };
const EMOJI_INS = { alegre: '🥁', llamador: '🥁', tambora: '🥁', maracas: '✨', palmas: '👏', tiple: '🎸', cucharas: '🥄', cuatro: '🎸', arpa: '🎼', bombo: '🥁', cununo: '🥁', marimba: '🎹', guacharaca: '〰️' };

const mtof = m => 440 * Math.pow(2, (m - 69) / 12);
function azarCon(semilla) { let s = (semilla >>> 0) || 1; return () => { s ^= s << 13; s >>>= 0; s ^= s >>> 17; s ^= s << 5; s >>>= 0; return s / 4294967296; }; }

function motor() {
  let ctx = null, sal = null, musG = null, efG = null, ruidoB = null, mudo = false, vol = 0.8;
  let R = null, bpm = 100, t0 = 0, sigPaso = 0, intervalo = 0, corriendo = false, usarCtx = false, perf0 = 0, pausadoEn = null;
  let intensidad = 2, mel = null, agachado = 0, semilla = 1, vigia = 0;
  const eventos = []; // {t, ins, v}: para que el escenario mueva el instrumento que suena
  const lat = () => (ctx ? (ctx.outputLatency || ctx.baseLatency || 0) : 0);

  function ac() {
    if (!ctx) {
      const A = window.AudioContext || window.webkitAudioContext; if (!A) return null;
      try { ctx = new A({ latencyHint: 'interactive' }); } catch (e) { return null; }
      const comp = ctx.createDynamicsCompressor(); comp.threshold.value = -14; comp.ratio.value = 4;
      sal = ctx.createGain(); sal.gain.value = mudo ? 0 : vol; sal.connect(comp); comp.connect(ctx.destination);
      musG = ctx.createGain(); musG.gain.value = 0.8; musG.connect(sal);
      efG = ctx.createGain(); efG.gain.value = 1; efG.connect(sal);
      const n = ctx.sampleRate; ruidoB = ctx.createBuffer(1, n, ctx.sampleRate); const d = ruidoB.getChannelData(0);
      for (let i = 0; i < n; i++) d[i] = Math.random() * 2 - 1;
    }
    if (ctx.state === 'suspended') ctx.resume().catch(() => {});
    return ctx;
  }
  const ahora = () => (usarCtx && ctx ? ctx.currentTime : (performance.now() - perf0) / 1000);

  /* ---------- las voces ---------- */
  function env(g, t, a, v, dec) { g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(Math.max(0.0002, v), t + a); g.gain.exponentialRampToValueAtTime(0.0001, t + a + dec); }
  function osc(dest, t, f, tipo, v, a, dec, f2, tf) {
    const o = ctx.createOscillator(), g = ctx.createGain(); o.type = tipo; o.frequency.setValueAtTime(f, t);
    if (f2) o.frequency.exponentialRampToValueAtTime(f2, t + (tf || dec)); env(g, t, a, v, dec); o.connect(g); g.connect(dest); o.start(t); o.stop(t + a + dec + 0.05); return o;
  }
  function ruido(dest, t, v, dur, tipo, f, q, f2) {
    const s = ctx.createBufferSource(), fl = ctx.createBiquadFilter(), g = ctx.createGain();
    s.buffer = ruidoB; s.loop = true; fl.type = tipo; fl.frequency.setValueAtTime(f, t); if (f2) fl.frequency.exponentialRampToValueAtTime(f2, t + dur); fl.Q.value = q || 1;
    env(g, t, 0.002, v, dur); s.connect(fl); fl.connect(g); g.connect(dest); s.start(t, Math.random() * 0.5); s.stop(t + dur + 0.05);
  }
  // un tambor de cuero: el tono que cae y el chasquido del cuero
  function cuero(d, t, v, f, modo) {
    const dec = modo === 't' ? 0.07 : modo === 'g' ? 0.05 : 0.26;
    osc(d, t, f * 1.5, 'sine', 0.9 * v, 0.002, dec, f, 0.04);
    if (modo !== 't') osc(d, t, f * 2.4, 'sine', 0.18 * v, 0.002, dec * 0.5);
    ruido(d, t, (modo === 'g' ? 0.55 : 0.22) * v, modo === 'g' ? 0.05 : 0.03, 'bandpass', modo === 'g' ? 2400 : 1400, 1.2);
  }
  const V = {
    alegre(d, t, v, m) { cuero(d, t, v, 190, m === 'a' || m === 't' || m === 'g' ? m : 'a'); },
    llamador(d, t, v) { cuero(d, t, v * 0.8, 330, 't'); },
    tambora(d, t, v) { osc(d, t, 120, 'sine', 0.9 * v, 0.003, 0.3, 55, 0.12); ruido(d, t, 0.12 * v, 0.04, 'lowpass', 900); },
    bombo(d, t, v) { osc(d, t, 95, 'sine', 1.0 * v, 0.003, 0.45, 42, 0.15); ruido(d, t, 0.1 * v, 0.05, 'lowpass', 600); },
    cununo(d, t, v, m) { cuero(d, t, v * 0.9, 240, m === 't' ? 't' : 'a'); },
    maracas(d, t, v) { ruido(d, t, 0.32 * v, v > 0.7 ? 0.08 : 0.045, 'highpass', 5200, 0.8); },
    cucharas(d, t, v) { osc(d, t, 2100, 'square', 0.06 * v, 0.001, 0.03); osc(d, t, 3150, 'sine', 0.12 * v, 0.001, 0.04); },
    palmas(d, t, v) { [0, 0.011, 0.023].forEach((k, i) => ruido(d, t + k, (i === 2 ? 0.55 : 0.35) * v, i === 2 ? 0.09 : 0.012, 'bandpass', 1300, 1.4)); },
    guacharaca(d, t, v, dur) {
      const s = ctx.createBufferSource(), fl = ctx.createBiquadFilter(), g = ctx.createGain(), m = ctx.createGain(), l = ctx.createOscillator(), lg = ctx.createGain();
      dur = dur || 0.14; s.buffer = ruidoB; s.loop = true; fl.type = 'bandpass'; fl.frequency.value = 3200; fl.Q.value = 2.5;
      l.type = 'square'; l.frequency.value = 58; lg.gain.value = 0.5; m.gain.value = 0.5; l.connect(lg); lg.connect(m.gain);
      env(g, t, 0.01, 0.4 * v, dur); s.connect(fl); fl.connect(m); m.connect(g); g.connect(d); s.start(t); l.start(t); s.stop(t + dur + 0.05); l.stop(t + dur + 0.05);
    },
    bajo(d, t, v, nota, dur) { osc(d, t, mtof(nota), 'triangle', 0.5 * v, 0.006, dur || 0.3); osc(d, t, mtof(nota), 'sine', 0.35 * v, 0.006, dur || 0.3); },
    marimba(d, t, v, nota) { const f = mtof(nota); osc(d, t, f, 'sine', 0.42 * v, 0.002, 0.42); osc(d, t, f * 3.93, 'sine', 0.08 * v, 0.001, 0.09); ruido(d, t, 0.05 * v, 0.015, 'bandpass', f * 4, 2); },
    arpa(d, t, v, nota) {
      const f = mtof(nota), o = ctx.createOscillator(), o2 = ctx.createOscillator(), fl = ctx.createBiquadFilter(), g = ctx.createGain();
      o.type = 'triangle'; o2.type = 'sawtooth'; o.frequency.value = f; o2.frequency.value = f * 1.002; fl.type = 'lowpass'; fl.frequency.setValueAtTime(f * 8, t); fl.frequency.exponentialRampToValueAtTime(f * 1.5, t + 0.5);
      const g2 = ctx.createGain(); g2.gain.value = 0.25; env(g, t, 0.002, 0.33 * v, 0.7);
      o.connect(fl); o2.connect(g2); g2.connect(fl); fl.connect(g); g.connect(d); o.start(t); o2.start(t); o.stop(t + 0.8); o2.stop(t + 0.8);
    },
    bandola(d, t, v, nota) { const f = mtof(nota); [1, 1.004].forEach(k => { osc(d, t, f * k, 'sawtooth', 0.09 * v, 0.002, 0.28); }); osc(d, t, f * 2, 'sine', 0.06 * v, 0.002, 0.2); },
    rasgueo(d, t, v, notas, corto) {
      notas.forEach((n, i) => {
        const f = mtof(n), o = ctx.createOscillator(), fl = ctx.createBiquadFilter(), g = ctx.createGain(), ti = t + i * 0.012;
        o.type = 'sawtooth'; o.frequency.value = f; fl.type = 'lowpass'; fl.frequency.setValueAtTime(3200, ti); fl.frequency.exponentialRampToValueAtTime(700, ti + 0.2);
        env(g, ti, 0.003, 0.07 * v, corto ? 0.12 : 0.3); o.connect(fl); fl.connect(g); g.connect(d); o.start(ti); o.stop(ti + 0.4);
      });
    },
    gaita(d, t, v, nota, dur) {
      const f = mtof(nota), o = ctx.createOscillator(), o2 = ctx.createOscillator(), vib = ctx.createOscillator(), vg = ctx.createGain(), g = ctx.createGain(), fl = ctx.createBiquadFilter();
      o.type = 'triangle'; o2.type = 'sine'; o.frequency.value = f; o2.frequency.value = f * 2; vib.frequency.value = 5.4; vg.gain.value = f * 0.006; vib.connect(vg); vg.connect(o.frequency); vg.connect(o2.frequency);
      fl.type = 'lowpass'; fl.frequency.value = f * 5; dur = Math.max(0.12, dur || 0.3);
      g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.2 * v, t + 0.04); g.gain.setValueAtTime(0.2 * v, t + dur * 0.8); g.gain.exponentialRampToValueAtTime(0.0001, t + dur + 0.08);
      const g2 = ctx.createGain(); g2.gain.value = 0.35; o.connect(fl); o2.connect(g2); g2.connect(fl); fl.connect(g); g.connect(d);
      [o, o2, vib].forEach(x => { x.start(t); x.stop(t + dur + 0.12); });
      ruido(d, t, 0.025 * v, dur, 'bandpass', f * 3, 3);
    },
    clave(d, t, v, alto) { osc(d, t, alto ? 2500 : 1700, 'sine', 0.5 * v, 0.001, 0.05); osc(d, t, alto ? 3800 : 2600, 'sine', 0.12 * v, 0.001, 0.03); }
  };

  /* ---------- la melodía de la partida: una frase AABA sobre los acordes ---------- */
  function inventar() {
    const rnd = azarCon(semilla), esc = ESC[R.escala], pasos = R.compas * R.sub, nc = R.acordes.length;
    const nota = (grado) => { const o = Math.floor(grado / esc.length), k = ((grado % esc.length) + esc.length) % esc.length; return R.raiz + 12 + o * 12 + esc[k]; };
    const frase = () => {
      const out = []; let g = Math.floor(rnd() * 3) + 2;
      for (let c = 0; c < nc; c++) {
        const ritmos = R.compas === 3 ? [[0, 2, 4], [0, 3, 4], [0, 1, 2, 4], [0, 4]] : R.sub === 3 ? [[0, 3], [0, 2, 3, 5], [0, 3, 5]] : [[0, 3, 4, 6], [0, 2, 4], [0, 4, 6], [0, 6]];
        const rr = ritmos[Math.floor(rnd() * ritmos.length)], acorde = AC[R.acordes[c]] || AC.I;
        rr.forEach((s, i) => {
          g += Math.floor(rnd() * 5) - 2; g = Math.max(0, Math.min(esc.length + 4, g));
          let m = nota(g);
          if (i === 0) { const tonos = acorde.map(x => R.raiz + 12 + (x % 12)); let mejor = tonos[0]; tonos.forEach(x => { [x, x + 12].forEach(y => { if (Math.abs(y - m) < Math.abs(mejor - m)) mejor = y; }); }); m = mejor; }
          out.push({ c, s, n: m, dur: ((rr[i + 1] != null ? rr[i + 1] : pasos) - s) });
        });
      }
      return out;
    };
    const A = frase(), B = frase();
    mel = [A, A, B, A];
    void pasos;
  }

  /* ---------- el secuenciador: programa lo que viene en los próximos 120 ms ---------- */
  function programar() {
    if (!corriendo || !usarCtx || !ctx) return;
    const dPaso = 60 / bpm / R.sub, pasos = R.compas * R.sub, hasta = ctx.currentTime + 0.14;
    while (t0 + sigPaso * dPaso < hasta) {
      const n = sigPaso++, t = t0 + n * dPaso;
      if (t < ctx.currentTime - 0.02) continue;
      tocarPaso(n, t, pasos, dPaso);
    }
  }
  function tocarPaso(n, t, pasos, dPaso) {
    const s = ((n % pasos) + pasos) % pasos, compas = Math.floor(n / pasos), d = musG;
    if (n < 0) { if (s % R.sub === 0) { V.clave(d, t, s === 0 ? 1 : 0.7, s === 0); eventos.push({ t, ins: 'clave', v: 1 }); } return; } // la cuenta
    const acorde = AC[R.acordes[((compas % R.acordes.length) + R.acordes.length) % R.acordes.length]] || AC.I;
    const raiz = R.raiz + acorde[0];
    Object.keys(R.pat).forEach(ins => {
      const vs = R.pat[ins], p = vs[compas % vs.length], ch = p[s];
      if (!ch || ch === '.') return;
      const v = ch === 'X' ? 1 : ch === 'x' ? 0.8 : ch === 'o' ? 0.45 : 0.85;
      if (intensidad < 1 && /bajo|tiple|cuatro|marimbaOst|arpaBajo/.test(ins)) return;
      switch (ins) {
        case 'bajo': V.bajo(d, t, v, raiz - 12 + (ch === 'o' ? 7 : 0), dPaso * 2.5); break;
        case 'arpaBajo': V.arpa(d, t, v, raiz - 12 + (s === 0 ? 0 : 7)); break;
        case 'tiple': V.rasgueo(d, t, v * 0.9, acorde.map(x => R.raiz + 12 + x), true); break;
        case 'cuatro': V.rasgueo(d, t, v, acorde.map(x => R.raiz + x + 12), true); break;
        case 'marimbaOst': { const nt = [0, 7, 12, 7, 4, 7]; V.marimba(d, t, v * 0.7, R.raiz + (acorde[0] % 12) + nt[s % nt.length]); break; }
        case 'alegre': case 'cununo': V[ins](d, t, v, ch); break;
        default: if (V[ins]) V[ins](d, t, v);
      }
      eventos.push({ t, ins: ins.replace(/Bajo|Ost/, ''), v });
    });
    // la melodía, desde la segunda vuelta de acordes y con la intensidad alta
    if (intensidad >= 2 && mel) {
      const vuelta = Math.floor(compas / R.acordes.length), frase = mel[vuelta % mel.length], c = compas % R.acordes.length;
      frase.forEach(x => {
        if (x.c !== c || x.s !== s) return;
        const dur = x.dur * dPaso;
        if (R.mel === 'gaita') V.gaita(d, t, 0.9, x.n, dur * 0.9);
        else if (R.mel === 'marimba') V.marimba(d, t, 0.9, x.n + 12);
        else if (R.mel === 'arpa') { V.arpa(d, t, 0.8, x.n + 12); if (dur > dPaso * 1.5) V.arpa(d, t + dPaso, 0.5, x.n + 7); }
        else V.bandola(d, t, 0.9, x.n + 12);
        eventos.push({ t, ins: 'melodia', v: 1 });
      });
    }
    // el joropo: el arpa corre en corcheas
    if (R.mel === 'arpa' && intensidad >= 1 && s % 1 === 0 && s !== 0) V.arpa(d, t, 0.32, R.raiz + 12 + acorde[s % acorde.length]);
  }

  return {
    RITMOS,
    get listo() { return !!ctx; },
    despertar() { ac(); },
    get mudo() { return mudo; },
    set mudo(b) { mudo = !!b; if (sal) sal.gain.setTargetAtTime(mudo ? 0 : vol, ctx.currentTime, 0.03); },
    get volumen() { return vol; },
    set volumen(v) { vol = Math.max(0, Math.min(1, +v || 0)); if (sal && !mudo) sal.gain.setTargetAtTime(vol, ctx.currentTime, 0.03); },
    /** Empieza la canción: `cuenta` pulsos de claves antes del pulso 0. */
    empezar(id, o) {
      o = o || {}; this.parar();
      R = RITMOS[id] || RITMOS.cumbia; bpm = o.bpm || R.bpm; semilla = o.semilla || ((Math.random() * 1e9) | 0); intensidad = o.intensidad != null ? o.intensidad : 2;
      inventar();
      const c = ac(); usarCtx = !!c && c.state !== 'closed';
      perf0 = performance.now();
      const cuenta = o.cuenta != null ? o.cuenta : R.compas * (R.compas === 2 ? 2 : 1);
      t0 = ahora() + 0.25 + cuenta * 60 / bpm;
      sigPaso = -cuenta * R.sub; corriendo = true; pausadoEn = null;
      clearInterval(intervalo); intervalo = setInterval(programar, 25); programar();
      // si el contexto no arranca (suspendido sin gesto), el reloj pasa a performance.now() y se juega mirando
      clearTimeout(vigia);
      if (usarCtx) vigia = setTimeout(() => { if (!corriendo || !ctx || ctx.state === 'running') return; usarCtx = false; perf0 = performance.now(); t0 = 0.25 + cuenta * 60 / bpm; }, 800);
    },
    parar() { corriendo = false; clearInterval(intervalo); intervalo = 0; eventos.length = 0; },
    pausar() { if (!corriendo) return; pausadoEn = this.pulso(); corriendo = false; clearInterval(intervalo); },
    seguir() {
      if (pausadoEn == null || !R) return;
      const p = pausadoEn; pausadoEn = null; if (ctx && ctx.state === 'suspended') ctx.resume().catch(() => {});
      t0 = ahora() + 0.3 - (usarCtx ? lat() : 0) - p * 60 / bpm; sigPaso = Math.ceil(p * R.sub); corriendo = true; clearInterval(intervalo); intervalo = setInterval(programar, 25); programar();
    },
    get corriendo() { return corriendo; },
    get bpm() { return bpm; },
    get ritmo() { return R; },
    /** El pulso de la canción ahora (fraccionario, el que se oye). Negativo durante la cuenta. */
    pulso() { if (!R) return 0; if (pausadoEn != null) return pausadoEn; return (ahora() - (usarCtx ? lat() : 0) - t0) * bpm / 60; },
    segPorPulso() { return 60 / bpm; },
    intensidad(n) { intensidad = n; },
    /** Baja la música mientras suena una palabra grabada. */
    agachar(b) { agachado = b ? agachado + 1 : Math.max(0, agachado - 1); if (musG) musG.gain.setTargetAtTime(agachado ? 0.28 : 0.8, ctx.currentTime, 0.08); },
    /** Lo que ya sonó (para mover los instrumentos del escenario): saca los eventos cuyo tiempo ya llegó. */
    sonados() { if (!ctx || !eventos.length) return []; const t = ctx.currentTime - lat(), out = []; while (eventos.length && eventos[0].t <= t) out.push(eventos.shift()); if (eventos.length > 400) eventos.splice(0, eventos.length - 200); return out; },
    /** Un golpe ya mismo (lo que toca el jugador y los efectos). */
    golpe(tipo, v) {
      const c = mudo ? null : ac(); if (!c || c.state !== 'running') return;
      const t = c.currentTime + 0.005, d = efG; v = v == null ? 1 : v;
      const raiz = R ? R.raiz : 57;
      switch (tipo) {
        case 'fuerte': V.alegre(d, t, 1.25 * v, 'a'); V.tambora(d, t, 0.9 * v); break;
        case 'suave': V.alegre(d, t, 0.55 * v, 't'); break;
        case 'paso': V.tambora(d, t, 0.7 * v); V.maracas(d, t, 0.6 * v); break;
        case 'bien': V.marimba(d, t, 0.6, raiz + 24); V.marimba(d, t + 0.08, 0.6, raiz + 28); V.marimba(d, t + 0.16, 0.7, raiz + 31); break;
        case 'mal': osc(d, t, 220, 'square', 0.06, 0.005, 0.14); osc(d, t + 0.12, 175, 'square', 0.06, 0.005, 0.22); break;
        case 'fin': [0, 4, 7, 12, 16].forEach((k, i) => V.marimba(d, t + i * 0.1, 0.8, raiz + 12 + k)); V.palmas(d, t + 0.5, 1); V.palmas(d, t + 0.7, 1); break;
        case 'clic': osc(d, t, 990, 'sine', 0.06, 0.002, 0.04); break;
        case 'cuerda': V.rasgueo(d, t, 1, [raiz + 12, raiz + 16, raiz + 19, raiz + 24], true); break;
        case 'tiple': case 'cuatro': V.rasgueo(d, t, v, [raiz + 12, raiz + 16, raiz + 19, raiz + 24], true); break;
        case 'arpa': V.arpa(d, t, v, raiz + 24); V.arpa(d, t + 0.06, v * 0.7, raiz + 28); break;
        case 'marimba': V.marimba(d, t, v, raiz + 24); break;
        case 'zapateo': V.tambora(d, t, 0.6 * v); V.cucharas(d, t + 0.06, 0.8 * v); V.tambora(d, t + 0.12, 0.5 * v); break;
        default: if (V[tipo]) V[tipo](d, t, v, 'a');
      }
    },
    /** El sonido de un golpe de la demostración, en el momento justo (la sílaba fuerte suena más). */
    demo(fuerte) { this.golpe(fuerte ? 'fuerte' : 'suave', fuerte ? 1 : 0.8); }
  };
}

window.TamborMusica = { RITMOS, NOMBRE_INS, EMOJI_INS, motor };
})();
