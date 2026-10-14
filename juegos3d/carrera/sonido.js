/* global module */
/* Turbo Saber — SONIDO. Todo sintetizado con WebAudio (sin ficheros), sin DOM ni three: juego.js le dice qué pasa y
   este módulo decide cómo suena. UMD como poderes.js: <script> en el juego (window.SonidoCarrera), require en Node.

   - El contexto se crea o se reanuda sólo en un gesto (despertar), por la política de autoplay. Sin WebAudio todo
     sigue funcionando en silencio: los contadores cuentan igual (sirven para comprobarlo sin oírlo).
   - Tres buses: efectos y música van a un compresor suave y de ahí a la salida. Volumen de fábrica moderado: en un
     aula suenan 30 o 40 a la vez.
   - Silencio (mudo, pausa, pestaña oculta): el contexto se suspende; no gasta CPU ni deja colas sonando.
   - Pocos nodos: el motor son 6 vivos mientras se corre; cada efecto o nota crea los suyos y los suelta al acabar,
     con tope de voces. La música la programa paso() desde el bucle del juego (sin temporizadores propios).
   - Música: un loop de 4 compases por ambiente (tonalidad, tempo, timbre y melodía cambian con la pista); «alegre»
     en carrera y «tranquila» (más lenta, sin batería, notas suaves) en el menú y en «Ver pista». */
(function (raiz, fabrica) {
  'use strict';
  if (typeof module === 'object' && module.exports) module.exports = fabrica();
  else raiz.SonidoCarrera = fabrica();
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';
  const NIVEL = { salida: 0.6, efectos: 0.85, musica: 0.3 }; // ganancias de fábrica antes de los deslizadores del usuario
  const MAX_VOCES = 48;
  const hz = m => 440 * Math.pow(2, (m - 69) / 12);

  // Melodías de 4 compases (64 semicorcheas): [paso, semitono sobre la tónica, duración en pasos]. Acordes: I IV V vi.
  const AC = { I: [0, 4, 7], IV: [5, 9, 12], V: [7, 11, 14], vi: [9, 12, 16] };
  const BAJO = { I: 0, IV: 5, V: -5, vi: -3 };
  const CANCIONES = [
    { acordes: ['I', 'V', 'vi', 'IV'], mel: [[0, 4, 2], [2, 7, 2], [4, 12, 4], [8, 11, 2], [10, 12, 2], [12, 7, 4], [16, 7, 2], [18, 11, 2], [20, 14, 4], [24, 12, 2], [26, 11, 2], [28, 7, 4],
      [32, 9, 2], [34, 12, 2], [36, 16, 4], [40, 14, 2], [42, 12, 2], [44, 9, 4], [48, 5, 2], [50, 9, 2], [52, 12, 3], [55, 14, 1], [56, 12, 2], [58, 9, 2], [60, 7, 4]] },
    { acordes: ['I', 'IV', 'V', 'I'], mel: [[0, 12, 3], [3, 12, 3], [6, 11, 2], [8, 12, 2], [10, 14, 2], [12, 16, 4], [16, 17, 3], [19, 16, 3], [22, 14, 2], [24, 12, 4], [28, 9, 4],
      [32, 11, 3], [35, 14, 3], [38, 19, 2], [40, 17, 2], [42, 16, 2], [44, 14, 4], [48, 12, 3], [51, 16, 3], [54, 19, 2], [56, 16, 2], [58, 14, 2], [60, 12, 4]] },
    { acordes: ['vi', 'IV', 'I', 'V'], mel: [[0, 9, 2], [2, 12, 2], [4, 16, 2], [6, 12, 2], [8, 17, 4], [12, 16, 4], [16, 12, 2], [18, 17, 2], [20, 21, 4], [24, 19, 2], [26, 17, 2], [28, 16, 4],
      [32, 16, 2], [34, 19, 2], [36, 24, 4], [40, 23, 2], [42, 21, 2], [44, 19, 4], [48, 19, 2], [50, 17, 2], [52, 16, 2], [54, 14, 2], [56, 11, 4], [60, 14, 4]] }
  ];
  // Cada ambiente: tónica (MIDI), tempo, timbre de la melodía y canción.
  const AMBIENTES = {
    valle: { raiz: 60, bpm: 126, lead: 'square', c: 0 },
    cano: { raiz: 62, bpm: 120, lead: 'triangle', c: 1 },
    tatacoa: { raiz: 57, bpm: 118, lead: 'sawtooth', c: 2 },
    nevado: { raiz: 64, bpm: 112, lead: 'sine', c: 0 },
    caribe: { raiz: 65, bpm: 124, lead: 'triangle', c: 1 },
    ciudad: { raiz: 55, bpm: 132, lead: 'square', c: 2 },
    penol: { raiz: 62, bpm: 116, lead: 'triangle', c: 0 }
  };

  function crear(op) {
    op = op || {};
    const Ctx = op.Contexto || null;
    const cuenta = {}; // pedidos por nombre (suene o no)
    let ctx = null, salida = null, busFx = null, busLejos = null, busMus = null, filtroMus = null, hpHat = null, bpCaja = null, ruido = null;
    let voces = 0, sonados = 0, ultimo = {}, lejosT = -1;
    const aj = { mudo: false, musica: 0.6, efectos: 0.8 };
    const callar = { mudo: false, pausa: false, oculto: false };
    let motor = null, mus = { modo: null, amb: 'valle', pista: null };

    const tiempo = () => (ctx ? ctx.currentTime : 0);
    const callado = () => callar.mudo || callar.pausa || callar.oculto;
    const vivo = () => !!ctx && ctx.state === 'running' && !callado();

    function armar() {
      if (ctx || !Ctx) return !!ctx;
      try { ctx = new Ctx(); } catch (e) { ctx = null; return false; }
      const comp = ctx.createDynamicsCompressor();
      comp.threshold.value = -14; comp.knee.value = 10; comp.ratio.value = 4; comp.attack.value = 0.004; comp.release.value = 0.2;
      salida = ctx.createGain(); salida.gain.value = NIVEL.salida;
      busFx = ctx.createGain(); busMus = ctx.createGain(); busLejos = ctx.createGain(); busLejos.gain.value = 0.3; busLejos.connect(busFx);
      filtroMus = ctx.createBiquadFilter(); filtroMus.type = 'lowpass'; filtroMus.frequency.value = 3200; filtroMus.Q.value = 0.4;
      hpHat = ctx.createBiquadFilter(); hpHat.type = 'highpass'; hpHat.frequency.value = 7000;
      bpCaja = ctx.createBiquadFilter(); bpCaja.type = 'bandpass'; bpCaja.frequency.value = 1800; bpCaja.Q.value = 0.8;
      filtroMus.connect(busMus); hpHat.connect(busMus); bpCaja.connect(busMus);
      busFx.connect(comp); busMus.connect(comp); comp.connect(salida); salida.connect(ctx.destination);
      // un segundo de ruido blanco, compartido por todo lo que sopla, salpica o llueve
      ruido = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
      const d = ruido.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
      aplicar();
      return true;
    }
    function aplicar() {
      if (!ctx) return;
      const t = ctx.currentTime;
      busFx.gain.setTargetAtTime(NIVEL.efectos * aj.efectos, t, 0.05);
      busMus.gain.setTargetAtTime(NIVEL.musica * aj.musica * (mus.modo === 'tranquila' ? 0.75 : 1), t, 0.15);
      if (callado()) { if (ctx.state === 'running') ctx.suspend().catch(() => {}); }
      else if (ctx.state !== 'running' && ctx.state !== 'closed') ctx.resume().catch(() => {});
    }

    /* ---------- piezas ---------- */
    // Un tono con envolvente: tipo, f → f2 (deslizado), d, v, ataque, vibrato {f, p}, filtro {tipo, f, f2, q}, dest.
    function tono(o) {
      if (voces > MAX_VOCES) return;
      const t = o.t != null ? o.t : ctx.currentTime + 0.005, d = o.d || 0.2, v = o.v || 0.1, at = o.at || 0.008;
      const osc = ctx.createOscillator(), g = ctx.createGain(), nodos = [osc, g];
      osc.type = o.tipo || 'sine';
      osc.frequency.setValueAtTime(o.f, t);
      if (o.f2) osc.frequency[o.lin ? 'linearRampToValueAtTime' : 'exponentialRampToValueAtTime'](o.f2, t + (o.dg || d));
      if (o.f3) osc.frequency.exponentialRampToValueAtTime(o.f3, t + d);
      g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(v, t + at);
      if (o.sost) g.gain.setValueAtTime(v, t + o.sost);
      g.gain.exponentialRampToValueAtTime(0.0001, t + d);
      let ult = osc;
      if (o.filtro) {
        const f = ctx.createBiquadFilter(); f.type = o.filtro.tipo || 'lowpass'; f.Q.value = o.filtro.q || 0.7;
        f.frequency.setValueAtTime(o.filtro.f, t); if (o.filtro.f2) f.frequency.exponentialRampToValueAtTime(o.filtro.f2, t + d);
        ult.connect(f); ult = f; nodos.push(f);
      }
      ult.connect(g);
      if (o.vib) { // vibrato (frecuencia, p en Hz) o trémolo (amp: p de 0 a 1, en un nodo aparte para que la cola se apague)
        const l = ctx.createOscillator(), lg = ctx.createGain(); l.frequency.value = o.vib.f; nodos.push(l, lg);
        if (o.vib.amp) { const tg = ctx.createGain(); tg.gain.value = 1 - o.vib.p / 2; lg.gain.value = o.vib.p / 2; lg.connect(tg.gain); g.connect(tg); tg.connect(o.dest || busFx); nodos.push(tg); }
        else { lg.gain.value = o.vib.p; lg.connect(osc.frequency); g.connect(o.dest || busFx); }
        l.connect(lg); l.start(t); l.stop(t + d + 0.05);
      } else g.connect(o.dest || busFx);
      osc.start(t); osc.stop(t + d + 0.05);
      soltar(osc, nodos);
    }
    // Ruido filtrado: f → f2, d, v, tipo de filtro, q, ataque.
    function soplo(o) {
      if (voces > MAX_VOCES || !ruido) return;
      const t = o.t != null ? o.t : ctx.currentTime + 0.005, d = o.d || 0.3, v = o.v || 0.1, at = o.at || 0.01;
      const s = ctx.createBufferSource(), g = ctx.createGain(), nodos = [s, g];
      s.buffer = ruido; s.loop = d > 0.9;
      let ult = s;
      if (o.f) {
        const f = ctx.createBiquadFilter(); f.type = o.filtro || 'bandpass'; f.Q.value = o.q || 0.9;
        f.frequency.setValueAtTime(o.f, t); if (o.f2) f.frequency.exponentialRampToValueAtTime(o.f2, t + d);
        ult.connect(f); ult = f; nodos.push(f);
      }
      g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(v, t + at); g.gain.exponentialRampToValueAtTime(0.0001, t + d);
      ult.connect(g); g.connect(o.dest || busFx);
      s.start(t, Math.random() * 0.5); s.stop(t + d + 0.05);
      soltar(s, nodos);
    }
    // Los nodos de los ruidos cortos de la música van a filtros compartidos (sin filtro propio).
    function golpecito(dest, t, d, v) {
      if (voces > MAX_VOCES) return;
      const s = ctx.createBufferSource(), g = ctx.createGain();
      s.buffer = ruido; g.gain.setValueAtTime(v, t); g.gain.exponentialRampToValueAtTime(0.0001, t + d);
      s.connect(g); g.connect(dest); s.start(t, Math.random() * 0.8); s.stop(t + d + 0.02);
      soltar(s, [s, g]);
    }
    function soltar(fuente, nodos) {
      voces++;
      fuente.onended = () => { voces--; nodos.forEach(n => { try { n.disconnect(); } catch (e) {} }); };
    }
    const notas = (lista, o) => lista.forEach((m, i) => tono(Object.assign({ f: hz(m), t: o.t0 + i * o.paso }, o, { t0: undefined, paso: undefined })));
    // Metales de fanfarria: diente de sierra con un filtro que se abre y se cierra.
    function metal(m, t, d, v) {
      tono({ tipo: 'sawtooth', f: hz(m), t, d, v, at: 0.02, sost: d * 0.55, filtro: { tipo: 'lowpass', f: 2600, f2: 700, q: 1 } });
      tono({ tipo: 'triangle', f: hz(m), t, d, v: v * 0.8, at: 0.01 });
    }

    /* ---------- efectos ---------- */
    const FX = {
      clic: () => tono({ tipo: 'triangle', f: 760, f2: 1040, d: 0.07, v: 0.16 }),
      // acierto: moneda de dos notas y un soplido de turbo; el rápido lleva una nota más
      turbo: o => {
        const t = tiempo() + 0.005;
        notas(o.rapida ? [83, 88, 92] : [83, 88], { tipo: 'triangle', t0: t, paso: 0.075, d: 0.28, v: 0.2 });
        tono({ tipo: 'sine', f: hz(100), t: t + 0.075, d: 0.35, v: 0.05 });
        soplo({ f: 500, f2: 2600, d: 0.5, v: 0.1, at: 0.08, t });
      },
      // fallo amable: dos notas bajitas que bajan, nada de chicharra
      fallo: () => { const t = tiempo() + 0.005; tono({ tipo: 'triangle', f: hz(67), t, d: 0.16, v: 0.11 }); tono({ tipo: 'triangle', f: hz(64), f2: hz(63), t: t + 0.15, d: 0.32, v: 0.1 }); },
      racha: () => {
        const t = tiempo() + 0.06;
        notas([84, 88, 91, 96], { tipo: 'square', t0: t, paso: 0.06, d: 0.18, v: 0.045, filtro: { f: 3000 } });
        notas([84, 88, 91, 96], { tipo: 'triangle', t0: t, paso: 0.06, d: 0.25, v: 0.12 });
        tono({ tipo: 'sine', f: hz(103), t: t + 0.26, d: 0.5, v: 0.05, vib: { f: 9, p: 0.5, amp: true } });
      },
      cuenta: () => { tono({ tipo: 'triangle', f: hz(74), d: 0.26, v: 0.22 }); tono({ tipo: 'sine', f: hz(86), d: 0.18, v: 0.05 }); },
      ya: () => {
        const t = tiempo() + 0.005;
        [86, 81, 78].forEach(m => tono({ tipo: 'triangle', f: hz(m), t, d: 0.7, v: 0.12, sost: 0.25 }));
        tono({ tipo: 'square', f: hz(86), t, d: 0.4, v: 0.03, filtro: { f: 2500 } });
        soplo({ f: 400, f2: 3000, d: 0.7, v: 0.12, at: 0.15, t });
      },
      // se gana un poder: ruleta brillante que sube
      poder: () => notas([79, 81, 84, 86, 88, 91, 93], { tipo: 'triangle', t0: tiempo() + 0.005, paso: 0.045, d: 0.16, v: 0.1 }),
      banana: o => o.impacto
        ? (tono({ tipo: 'sine', f: 1100, f2: 240, d: 0.6, v: 0.16, vib: { f: 9, p: 40 } }), soplo({ f: 2200, d: 0.35, v: 0.05, q: 3 }), tono({ tipo: 'triangle', f: 1600, f2: 2200, t: tiempo() + 0.62, d: 0.08, v: 0.05 }))
        : (tono({ tipo: 'sine', f: 520, f2: 170, d: 0.14, v: 0.22 }), soplo({ f: 900, d: 0.06, v: 0.06 })),
      caparazon: o => o.impacto
        ? (tono({ tipo: 'sine', f: 230, f2: 55, d: 0.32, v: 0.42 }), tono({ tipo: 'triangle', f: 700, f2: 340, d: 0.14, v: 0.1 }), soplo({ f: 900, filtro: 'lowpass', d: 0.1, v: 0.25 }))
        : (tono({ tipo: 'square', f: 170, f2: 560, d: 0.2, v: 0.09, filtro: { f: 1400 } }), soplo({ f: 1200, f2: 300, d: 0.26, v: 0.2 })),
      escudo: o => o.impacto // impacto = la burbuja paró un golpe: «¡pop!» y un tilín
        ? (soplo({ f: 3000, filtro: 'highpass', d: 0.06, v: 0.2 }), tono({ tipo: 'sine', f: 1100, f2: 1800, d: 0.12, v: 0.14 }), tono({ tipo: 'sine', f: hz(96), t: tiempo() + 0.08, d: 0.6, v: 0.05 }))
        : (tono({ tipo: 'sine', f: 280, f2: 980, d: 0.26, v: 0.16, vib: { f: 22, p: 30 } }), tono({ tipo: 'sine', f: 420, f2: 1250, t: tiempo() + 0.16, d: 0.22, v: 0.12 })),
      cohete: () => {
        const t = tiempo() + 0.005;
        soplo({ f: 300, f2: 4200, filtro: 'lowpass', d: 1.1, v: 0.2, at: 0.12, t, q: 1.2 });
        tono({ tipo: 'sawtooth', f: 110, f2: 440, d: 0.9, v: 0.05, filtro: { f: 900 }, t });
        tono({ tipo: 'triangle', f: hz(79), f2: hz(91), d: 0.5, v: 0.07, t: t + 0.1 });
      },
      alas: () => {
        const t = tiempo() + 0.005;
        tono({ tipo: 'triangle', f: 520, f2: 1040, d: 0.65, v: 0.14, vib: { f: 14, p: 0.7, amp: true }, t });
        notas([91, 96], { tipo: 'sine', t0: t + 0.3, paso: 0.09, d: 0.4, v: 0.07 });
      },
      estrella: () => {
        const t = tiempo() + 0.005;
        notas([72, 76, 79, 84, 88, 91, 96, 100, 103], { tipo: 'triangle', t0: t, paso: 0.045, d: 0.2, v: 0.08 });
        tono({ tipo: 'sine', f: hz(108), t: t + 0.42, d: 0.7, v: 0.05, vib: { f: 11, p: 0.6, amp: true } });
      },
      iman: () => tono({ tipo: 'sine', f: 220, f2: 330, d: 0.85, v: 0.15, vib: { f: 7, p: 70 }, filtro: { f: 1200 } }),
      nube: o => {
        if (!o.impacto) { soplo({ f: 2000, f2: 400, filtro: 'lowpass', d: 0.5, v: 0.1, at: 0.1 }); return; }
        const t = tiempo() + 0.005; // lluvia: un rumor, gotitas y un trueno de juguete
        soplo({ f: 3200, q: 0.6, d: 1.4, v: 0.06, at: 0.2, t });
        for (let i = 0; i < 7; i++) tono({ tipo: 'sine', f: 1500 + Math.random() * 900, f2: 700, d: 0.05, v: 0.05, t: t + 0.1 + Math.random() * 1.1 });
        soplo({ f: 160, filtro: 'lowpass', d: 1.0, v: 0.22, at: 0.08, t: t + 0.05, q: 0.5 });
      },
      fantasma: () => {
        const t = tiempo() + 0.005;
        tono({ tipo: 'sine', f: 330, f2: 494, f3: 294, dg: 0.45, d: 1.1, v: 0.13, at: 0.15, vib: { f: 5, p: 12 }, t, lin: true });
        tono({ tipo: 'sine', f: 494, f2: 740, f3: 440, dg: 0.45, d: 1.1, v: 0.04, at: 0.2, t, lin: true });
      },
      bloqueo: () => { tono({ tipo: 'triangle', f: hz(91), d: 0.22, v: 0.1 }); tono({ tipo: 'sine', f: hz(98), d: 0.32, v: 0.05 }); },
      // a quien le dan: pajaritos de mareo (va detrás del golpe)
      golpe: () => { const t = tiempo() + 0.3; for (let i = 0; i < 3; i++) tono({ tipo: 'sine', f: 1800, f2: 2500, d: 0.07, v: 0.05, t: t + i * 0.14 }); },
      agua: o => {
        if (o.chico) { soplo({ f: 2000 + Math.random() * 800, q: 1.2, d: 0.13, v: 0.06 }); return; }
        soplo({ f: 1400, f2: 700, q: 0.8, d: 0.4, v: 0.22 });
        tono({ tipo: 'sine', f: 480, f2: 950, d: 0.09, v: 0.07 });
        tono({ tipo: 'sine', f: 620, f2: 1200, t: tiempo() + 0.08, d: 0.08, v: 0.05 });
      },
      vuelta: o => notas(o.ultima ? [84, 88, 91, 96] : [84, 88], { tipo: 'triangle', t0: tiempo() + 0.005, paso: 0.12, d: 0.4, v: 0.16 }),
      meta: () => {
        const t = tiempo() + 0.005;
        [72, 76, 79, 84].forEach(m => metal(m, t, 0.9, 0.05));
        soplo({ f: 1100, q: 0.5, d: 1.8, v: 0.1, at: 0.3, t }); // el público
      },
      // fanfarria del podio: el primero, completa; el podio, corta; los demás, una tonadita alegre (nunca triste)
      podio: o => {
        const t = tiempo() + 0.35, p = o.puesto || 9;
        if (p === 1 || o.campeon) {
          [[67, 0, 0.14], [72, 0.15, 0.14], [76, 0.3, 0.14], [79, 0.45, 0.3], [76, 0.78, 0.14], [79, 0.93, 0.9]].forEach(([m, dt, d]) => metal(m, t + dt, d, 0.07));
          [60, 64, 67].forEach(m => metal(m, t + 0.93, 0.9, 0.035));
          if (o.campeon) notas([84, 88, 91, 96, 100], { tipo: 'triangle', t0: t + 1.9, paso: 0.07, d: 0.3, v: 0.08 });
        } else if (p <= 3) {
          [[72, 0, 0.14], [76, 0.15, 0.14], [79, 0.3, 0.14], [84, 0.45, 0.7]].forEach(([m, dt, d]) => metal(m, t + dt, d, 0.065));
        } else {
          notas([72, 74, 76, 79, 84], { tipo: 'triangle', t0: t, paso: 0.13, d: 0.32, v: 0.13 });
        }
      }
    };

    function efecto(nombre, o) {
      o = o || {};
      cuenta[nombre] = (cuenta[nombre] || 0) + 1;
      if (!vivo() || !FX[nombre]) return false;
      const ahora = ctx.currentTime;
      if (ultimo[nombre] && ahora - ultimo[nombre] < 0.06) return false; // el mismo dos veces en el mismo instante
      if (o.lejos) { if (ahora - lejosT < 0.45) return false; lejosT = ahora; } // lo de los demás: bajito y de a uno
      ultimo[nombre] = ahora;
      const antes = busFx;
      if (o.lejos) busFx = busLejos;
      try { FX[nombre](o); } finally { busFx = antes; }
      sonados++;
      return true;
    }

    /* ---------- motor del kart: sube de tono con la velocidad, suave ---------- */
    function motorSet(o) {
      if (!o || !vivo()) {
        if (motor && ctx) { const m = motor; motor = null; m.g.gain.setTargetAtTime(0.0001, ctx.currentTime, 0.08); setTimeout(() => { m.ns.forEach(n => { try { n.stop && n.stop(); n.disconnect(); } catch (e) {} }); }, 400); }
        return;
      }
      if (!motor) {
        const a = ctx.createOscillator(), b = ctx.createOscillator(), f = ctx.createBiquadFilter(), g = ctx.createGain(), l = ctx.createOscillator(), lg = ctx.createGain();
        a.type = 'sawtooth'; b.type = 'triangle'; b.detune.value = -1200; f.type = 'lowpass'; f.Q.value = 2;
        l.frequency.value = 24; lg.gain.value = 0; g.gain.value = 0.0001;
        a.connect(f); b.connect(f); f.connect(g); g.connect(busFx); l.connect(lg); lg.connect(g.gain);
        const t = ctx.currentTime; a.start(t); b.start(t); l.start(t);
        motor = { a, b, f, g, l, lg, ult: -1, ns: [a, b, l, f, g, lg] };
      }
      if (ctx.currentTime - motor.ult < 0.06) return; // basta con ~15 ajustes por segundo
      motor.ult = ctx.currentTime;
      const t = ctx.currentTime, v = Math.max(0, Math.min(32, o.v || 0)), tu = Math.max(0, Math.min(25, o.turbo || 0));
      const fr = 52 + v * 3 + tu * 1.4;
      motor.a.frequency.setTargetAtTime(fr, t, 0.12); motor.b.frequency.setTargetAtTime(fr, t, 0.12);
      motor.l.frequency.setTargetAtTime(18 + v * 0.8, t, 0.2);
      motor.f.frequency.setTargetAtTime((240 + v * 16 + tu * 28) * (o.agua ? 0.6 : 1), t, 0.1);
      const vol = 0.011 + v * 0.0004 + tu * 0.0003; // debajo de la música: se oye, no cansa
      motor.g.gain.setTargetAtTime(vol, t, 0.15); motor.lg.gain.setTargetAtTime(vol * 0.3, t, 0.15);
    }

    /* ---------- música ---------- */
    function musica(modo, amb) {
      modo = modo || null; amb = AMBIENTES[amb] ? amb : 'valle';
      if (modo === mus.modo && amb === mus.amb) return;
      const cambiaGanancia = (modo === 'tranquila') !== (mus.modo === 'tranquila');
      mus.modo = modo; mus.amb = amb; mus.pista = null;
      if (ctx && modo) { mus.pista = { paso: 0, t: ctx.currentTime + 0.12 }; }
      if (cambiaGanancia) aplicar();
    }
    function paso() {
      if (!vivo() || !mus.modo) return;
      if (!mus.pista) mus.pista = { paso: 0, t: ctx.currentTime + 0.12 };
      const p = mus.pista, a = AMBIENTES[mus.amb], c = CANCIONES[a.c], tranq = mus.modo === 'tranquila';
      const dur = 60 / (a.bpm * (tranq ? 0.62 : 1)) / 4, ahora = ctx.currentTime;
      if (p.t < ahora - 0.1) p.t = ahora + 0.05; // el bucle se atrasó (pestaña ocupada): se retoma, sin ráfaga
      while (p.t < ahora + 0.3) { nota(p.paso, p.t, dur, a, c, tranq); p.paso = (p.paso + 1) % 64; p.t += dur; }
    }
    function nota(i, t, dur, a, c, tranq) {
      const s = i % 16, ac = c.acordes[i >> 4], tri = AC[ac], r = a.raiz, dest = filtroMus;
      const mel = c.mel.find(n => n[0] === i);
      if (tranq) {
        if (s === 0) tono({ tipo: 'sine', f: hz(r - 12 + BAJO[ac]), t, d: dur * 15, v: 0.16, at: 0.05, dest });
        if (s % 4 === 0) tono({ tipo: 'sine', f: hz(r + tri[(s / 4) % 3] + (s === 12 ? 12 : 0)), t, d: dur * 6, v: 0.06, at: 0.02, dest });
        if (mel && mel[0] % 4 === 0) tono({ tipo: a.lead === 'sawtooth' ? 'triangle' : 'sine', f: hz(r + 12 + mel[1]), t, d: dur * Math.max(4, mel[2] * 2), v: 0.07, at: 0.03, dest });
        return;
      }
      // batería: bombo en 1 y 3, caja en 2 y 4, platillo en los contratiempos
      if (s === 0 || s === 8) tono({ tipo: 'sine', f: 150, f2: 45, t, d: 0.16, v: 0.2, at: 0.002, dest: busMus });
      if (s === 4 || s === 12) { golpecito(bpCaja, t, 0.11, 0.22); tono({ tipo: 'triangle', f: 210, f2: 150, t, d: 0.06, v: 0.08, dest: busMus }); }
      if (s === 2 || s === 6 || s === 10 || s === 14) golpecito(hpHat, t, 0.035, 0.12);
      // bajo saltarín
      const b = { 0: 0, 6: 0, 8: 7, 12: 12, 14: 7 }[s];
      if (b != null) tono({ tipo: 'triangle', f: hz(r - 12 + BAJO[ac] + b), t, d: dur * 1.8, v: 0.2, at: 0.005, dest });
      // acordes cortos a contratiempo
      if (s === 6 || s === 14) tri.slice(1).forEach(m => tono({ tipo: 'square', f: hz(r + m), t, d: dur * 0.9, v: 0.025, at: 0.004, dest }));
      if (mel) {
        const d = dur * mel[2] * 0.95;
        tono({ tipo: a.lead, f: hz(r + 12 + mel[1]), t, d, v: a.lead === 'sine' ? 0.12 : a.lead === 'triangle' ? 0.11 : 0.04, at: 0.006, sost: d * 0.4, dest });
      }
    }

    /* ---------- API ---------- */
    return {
      // En un gesto (toque, clic, tecla): crea el contexto la primera vez y lo reanuda si está suspendido.
      despertar() { if (!Ctx) return false; armar(); if (ctx && !callado() && ctx.state !== 'running') ctx.resume().catch(() => {}); return !!ctx; },
      ajustes(o) {
        if (o) {
          if (o.mudo != null) aj.mudo = callar.mudo = !!o.mudo;
          if (o.musica != null) aj.musica = Math.max(0, Math.min(1, +o.musica || 0));
          if (o.efectos != null) aj.efectos = Math.max(0, Math.min(1, +o.efectos || 0));
          aplicar();
          if (callar.mudo) motorSet(null);
        }
        return Object.assign({}, aj);
      },
      // motivo: 'pausa' | 'oculto'
      silencio(motivo, si) { si = !!si; if (callar[motivo] === si) return; callar[motivo] = si; if (si) motorSet(null); aplicar(); },
      efecto,
      motor: motorSet,
      musica,
      paso,
      estado: () => ({ contexto: ctx ? ctx.state : 'sin', callado: callado(), ajustes: Object.assign({}, aj), musica: mus.modo, ambiente: mus.amb, motor: !!motor, voces, sonados, cuenta: Object.assign({}, cuenta) })
    };
  }

  return { crear, ambientes: Object.keys(AMBIENTES) };
});
