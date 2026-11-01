/* Regata del Viento — el juego: la sala (materia, grado, tema, mar, velero y vela), el modo lección (../leccion.js), la
   navegación, las boyas con preguntas, los tres veleros rivales, el sonido sintetizado y la voz en inglés.
   - Navegar: el viento viene de un lado (la flecha grande de la brújula, la bandera del mástil y las rayas sobre el mar).
     Contra el viento no se avanza (la zona rayada): hay que ir en zigzag. De lado al viento se va más rápido. La vela
     tiene dos posiciones: cerrada (casi contra el viento) y abierta (de lado o por detrás); mal puesta, flamea y frena.
     Timón con ◀ ▶ (o A D), la vela con Espacio. «Piloto» (G) lleva el velero solo, con sus bordos, a la boya elegida.
   - Cada pregunta: una boya por opción (número, forma, color y texto). Se llega navegando o se elige con 1 a 4 (o
     tocándola) y el piloto va solo. La buena trae una racha de viento a favor; tres seguidas, el viento mágico. La mala
     no castiga: «Era: …» y sigue (en facil y media vuelve de repaso).
   - Una pregunta del viento («¿De dónde viene el viento?», con un punto cardinal por respuesta) pone el viento a soplar
     desde la buena: se contesta leyendo la flecha (que en ese tramo no lo dice escrito).
   - Modo calma (y «reducir movimiento»): sin rivales ni reloj, piloto puesto; el velero espera fondeado a que elijas.
   - La primera vez, una boya de práctica con los consejos del capitán (se puede saltar).
   - Inglés: sólo los MP3 grabados de la Biblioteca. Sin MP3: silencio y la palabra escrita. Jamás speechSynthesis.
   - Progreso (sala): localStorage juegos3d.regata {sel, calma, mudo, tuto, boyas, records: {clave: {tiempo, aciertos,
     total}}}; `boyas` (las buenas de siempre) desbloquea las velas. En modo lección no se guarda nada.
   Depuración: window.__regata (estado, elegir(i), correcta(), empezar(), saltar()). */
(function () {
'use strict';
const $ = id => document.getElementById(id);
const LJ = window.LeccionJuego, RC = window.RegataContenido, MW = window.Mar || {};
const CLAVE = 'juegos3d.regata';
const leer = () => { try { return JSON.parse(localStorage.getItem(CLAVE)) || {}; } catch (e) { return {}; } };
const prefs = leer(); if (!prefs.records || typeof prefs.records !== 'object') prefs.records = {};
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const pick = a => a[Math.floor(Math.random() * a.length)];
const azar = (a, b) => a + Math.random() * (b - a);
const barajar = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const BIBLIO = /^(localhost|127\.0\.0\.1)$/.test(location.hostname) ? 'http://localhost:8765/' : 'https://biblioteca.micolevirtual.com/';
const reducir = matchMedia('(prefers-reduced-motion: reduce)').matches;
const tactil = matchMedia('(pointer: coarse)').matches;
const MARES = MW.MARES || { caribe: { nombre: 'Bahía de Cartagena', emoji: '🏝️', islas: ['arena'] } };
const VELEROS = MW.VELEROS || [{ id: 'delfin', nombre: 'Delfín rosado', emoji: '🐬', c: '#e64980' }];
const VELAS = MW.VELAS || [{ id: 'lisa', nombre: 'Lisa', desde: 0 }];
const BOYAS = MW.BOYAS || [{ color: '#e8590c', forma: 'círculo', glifo: '●' }, { color: '#1971c2', forma: 'triángulo', glifo: '▲' }, { color: '#2b8a3e', forma: 'cuadrado', glifo: '■' }, { color: '#7048e8', forma: 'rombo', glifo: '◆' }];
const partir = MW.partir || (t => ({ emoji: '', texto: String(t) }));
const RAD = Math.PI / 180;
const dir = b => [Math.sin(b * RAD), -Math.cos(b * RAD)];
const angDif = (a, b) => ((a - b + 540) % 360) - 180; // a − b en (−180, 180]
const rumboA = (dx, dz) => ((Math.atan2(dx, -dz) / RAD) + 360) % 360;
const VMAX = 9;
const nombreDir = RC.nombreDir || (() => '?');

/* ---------- modo lección: lo que manda la lección (FORMATO.md §3.9) ---------- */
const CFG = LJ && LJ.activo && LJ.cfg ? LJ.cfg : null;
const LEC = (() => {
  if (!CFG) return null;
  const preguntas = (Array.isArray(CFG.preguntas) ? CFG.preguntas : []).filter(q => q && typeof q.p === 'string' && q.p.trim() && Array.isArray(q.opciones)
    && q.opciones.length >= 2 && q.opciones.length <= 4 && q.opciones.every(o => (typeof o === 'string' && o.trim()) || typeof o === 'number') && Number.isInteger(q.correcta) && q.correcta >= 0 && q.correcta < q.opciones.length)
    .map(q => {
      const p = q.p.trim(), oir = typeof q.oir === 'string' ? q.oir.trim() : '';
      const escucha = !!oir && p.toLowerCase().indexOf(oir.toLowerCase()) < 0;
      const r = { p, opciones: q.opciones.map(o => String(o).trim()), correcta: q.correcta, oir, escucha, palabra: escucha ? oir : '', opEn: false };
      const v = RC.vientoDe ? RC.vientoDe(r) : null; if (v != null) r.viento = v;
      return r;
    });
  const palabras = (Array.isArray(CFG.palabras) ? CFG.palabras : []).filter(p => p && typeof p.en === 'string' && p.en.trim() && typeof p.es === 'string' && p.es.trim())
    .map(p => ({ en: p.en.trim(), es: p.es.trim(), emoji: typeof p.emoji === 'string' ? p.emoji.trim() : '' }));
  if (!preguntas.length && palabras.length < 2) { console.warn('[regata] la lección no mandó preguntas ni palabras: va la sala'); return null; }
  return { titulo: (LJ.titulo || '').trim(), preguntas, palabras, mar: MARES[CFG.mar] ? CFG.mar : null };
})();
const guardar = () => { if (LEC) return; try { localStorage.setItem(CLAVE, JSON.stringify(prefs)); } catch (e) { /* sin almacenamiento */ } };

// La dificultad (FORMATO.md §3.9.1). Nunca se pierde: lo que cambia es la ayuda, el viento y los rivales.
// facil: el piloto puesto y la vela sola, boyas que se alcanzan de lejos, tramos cortos, pocas veces contra el viento,
//   pista sin límite y el fallo vuelve de repaso; media: la vela a mano, 3 pistas, el fallo vuelve de repaso;
//   normal: tramos largos, más contra el viento, 1 pista, el piloto va más lento que tú y el fallo trae calma chicha.
function params(modo) {
  return {
    modo,
    captura: modo === 'facil' ? 6.2 : modo === 'media' ? 5.4 : 4.6,
    L: modo === 'facil' ? [34, 44] : modo === 'media' ? [40, 52] : [46, 60],
    nogo: modo === 'facil' ? 38 : modo === 'media' ? 40 : 42,
    rival: modo === 'facil' ? [0.58, 0.66, 0.74] : modo === 'media' ? [0.66, 0.74, 0.82] : [0.76, 0.86, 0.95],
    piloto: modo === 'facil', velaSola: modo === 'facil', efPiloto: modo === 'facil' ? 1 : modo === 'media' ? 0.92 : 0.84,
    contra: modo === 'facil' ? 0.15 : modo === 'media' ? 0.28 : 0.36, cambio: modo === 'facil' ? 0.18 : modo === 'media' ? 0.28 : 0.38,
    lento: modo === 'normal', repaso: modo !== 'normal', pistas: modo === 'facil' ? Infinity : modo === 'media' ? 3 : 1
  };
}
const modoDeGrado = g => (g <= 2 ? 'facil' : g <= 5 ? 'media' : 'normal');
const VOZ = (() => { const v = CFG && typeof CFG.voz === 'string' && CFG.voz.trim() ? CFG.voz.trim() : BIBLIO + 'voz/'; return /\/$/.test(v) ? v : v + '/'; })();

/* ---------- sonido (sintetizado, 0 KB): olas, campana, rachas, la vela que flamea ---------- */
const Snd = (() => {
  let ctx = null, mudo = !!prefs.mudo, olas = null;
  const ac = () => { if (!ctx) { const A = window.AudioContext || window.webkitAudioContext; if (A) ctx = new A(); } if (ctx && ctx.state === 'suspended') ctx.resume(); return ctx; };
  function tono(f, t, dur, tipo, vol, f2) {
    const c = mudo ? null : ac(); if (!c) return;
    const o = c.createOscillator(), g = c.createGain(), t0 = c.currentTime + t;
    o.type = tipo || 'sine'; o.frequency.setValueAtTime(f, t0); if (f2) o.frequency.exponentialRampToValueAtTime(f2, t0 + dur);
    g.gain.setValueAtTime(0.0001, t0); g.gain.exponentialRampToValueAtTime(vol || 0.1, t0 + 0.015); g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    o.connect(g); g.connect(c.destination); o.start(t0); o.stop(t0 + dur + 0.05);
  }
  function ruido(dur, vol, f0, f1, tipo) {
    const c = mudo ? null : ac(); if (!c) return;
    const n = Math.floor(c.sampleRate * dur), b = c.createBuffer(1, n, c.sampleRate), d = b.getChannelData(0);
    for (let i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / n);
    const s = c.createBufferSource(), f = c.createBiquadFilter(), g = c.createGain(), t0 = c.currentTime;
    s.buffer = b; f.type = tipo || 'bandpass'; f.Q.value = 1.1; f.frequency.setValueAtTime(f0, t0); f.frequency.exponentialRampToValueAtTime(f1, t0 + dur);
    g.gain.value = vol; s.connect(f); f.connect(g); g.connect(c.destination); s.start(t0);
  }
  function pararOlas() { if (olas) { try { olas.s.stop(); } catch (e) { /* ya paró */ } olas = null; } }
  return {
    get mudo() { return mudo; }, set mudo(v) { mudo = !!v; if (mudo) pararOlas(); },
    despertar() { if (!mudo) ac(); },
    bien() { tono(660, 0, 0.12, 'triangle', 0.16); tono(880, 0.09, 0.12, 'triangle', 0.16); tono(1320, 0.18, 0.22, 'triangle', 0.14); },
    mal() { tono(260, 0, 0.16, 'square', 0.05); tono(196, 0.14, 0.24, 'square', 0.05); },
    campana() { tono(1568, 0, 0.9, 'sine', 0.08); tono(2350, 0, 0.5, 'sine', 0.03); },
    racha() { ruido(0.9, 0.16, 300, 1800); },
    magia() { ruido(1.2, 0.18, 250, 3000); [523, 659, 784, 1047, 1319].forEach((f, i) => tono(f, i * 0.07, 0.25, 'triangle', 0.1)); },
    flamea() { ruido(0.16, 0.05, 900, 500, 'highpass'); },
    golpe() { tono(120, 0, 0.18, 'square', 0.07, 70); ruido(0.25, 0.08, 600, 200); },
    vela() { ruido(0.22, 0.07, 1200, 400); },
    clic() { tono(990, 0, 0.05, 'sine', 0.06); },
    cuenta(fin) { tono(fin ? 392 : 523, 0, fin ? 0.7 : 0.18, fin ? 'sawtooth' : 'square', fin ? 0.06 : 0.06); },
    meta() { [523, 659, 784, 1047, 1319].forEach((f, i) => tono(f, i * 0.12, 0.28, 'triangle', 0.14)); },
    // las olas de fondo: ruido suave que sube y baja
    olas(on, fuerte) {
      const c = mudo || !on ? null : (ctx && ctx.state === 'running' ? ctx : null);
      if (!c) { if (olas && (!on || mudo)) { olas.g.gain.setTargetAtTime(0, ctx.currentTime, 0.3); } return; }
      if (!olas) {
        const n = c.sampleRate * 3, b = c.createBuffer(1, n, c.sampleRate), d = b.getChannelData(0);
        for (let i = 0, ult = 0; i < n; i++) { ult = (ult + 0.02 * (Math.random() * 2 - 1)) / 1.02; d[i] = ult * 3.5; }
        const s = c.createBufferSource(), f = c.createBiquadFilter(), g = c.createGain(); s.buffer = b; s.loop = true; f.type = 'lowpass'; f.frequency.value = 500; g.gain.value = 0;
        s.connect(f); f.connect(g); g.connect(c.destination); s.start(); olas = { s, g, f };
      }
      const t = c.currentTime;
      olas.g.gain.setTargetAtTime((fuerte ? 0.11 : 0.06) * (0.75 + 0.25 * Math.sin(t * 0.7)), t, 0.4);
    },
    parar: pararOlas
  };
})();

/* ---------- la voz en inglés: sólo MP3 grabados (la cola de leccion.js: uno no corta a otro) ---------- */
const Voz = (() => {
  let lista = null, audio = null, n = 0;
  const listo = fetch(VOZ + 'en/index.json', { credentials: 'omit' }).then(r => (r.ok ? r.json() : [])).then(a => { lista = new Set(Array.isArray(a) ? a : []); })
    .catch(() => { lista = new Set(); });
  function slug(t) {
    t = partir(String(t)).texto || String(t);
    const s = String(t).trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
    if (s.length <= 200) return s;
    let h = 0x811c9dc5; for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 0x01000193) >>> 0;
    return s.slice(0, 80) + '-' + h.toString(16).padStart(8, '0');
  }
  const voces = CFG && CFG.voces && typeof CFG.voces === 'object' ? CFG.voces : {};
  const carpeta = s => (typeof voces[s] === 'string' && /^[a-z-]+$/.test(voces[s]) ? voces[s] : null);
  const tiene = t => { if (t == null || !String(t).trim()) return false; const s = slug(t); return !!s && (!!carpeta(s) || !!(lista && lista.has(s))); };
  const cola = LJ && LJ.cola && typeof LJ.cola.poner === 'function' ? LJ.cola : null;
  function callar() { if (cola) cola.callar(); n++; if (audio) { audio.onended = audio.onerror = null; audio.pause(); audio = null; } }
  function decir(texto, opc) {
    if (Snd.mudo || !tiene(texto)) return false;
    opc = opc || {};
    const s = slug(texto), dirs = [carpeta(s), lista && lista.has(s) ? 'en' : null].filter((d, i, a) => d && a.indexOf(d) === i);
    const urls = dirs.map(d => VOZ + d + '/' + s + '.mp3');
    if (cola) { const vig = opc.vigente; cola.poner({ urls, clave: 'regata:' + s, grupo: opc.grupo, caduca: opc.caduca || 4000, vigente: () => !Snd.mudo && !S.pausa && (!vig || vig()) }); return true; }
    n++; if (audio) { audio.onended = audio.onerror = null; audio.pause(); audio = null; }
    const mio = n, probar = j => { if (mio !== n || j >= urls.length) return; const a = new Audio(urls[j]); audio = a; a.onended = () => { if (audio === a) audio = null; }; a.onerror = () => probar(j + 1); a.play().catch(() => {}); };
    probar(0); return true;
  }
  return { listo, tiene, decir, callar };
})();

/* ---------- estado ---------- */
const sel = Object.assign({ materia: 'ingles', grado: 3, tema: 'mezcla', mar: 'azar', velero: 'delfin', vela: 'rayas' }, prefs.sel || {});
const S = {
  modo: LEC ? 'leccion' : 'sala', fase: 'menu', pausa: false,
  calma: LEC ? reducir : (typeof prefs.calma === 'boolean' ? prefs.calma : reducir),
  P: params('normal'), cola: [], total: 0, hechas: 0, aciertos: 0, fallos: 0, racha: 0, mejorRacha: 0, repasar: [],
  yo: null, tr: null, idx: 0, hecho: 0, metaI: null, centros: [], correctas: {}, islas: [], rivales: [], nombresRiv: [],
  viento: { desde: 0, obj: 0, oculto: false }, t: 0, espera: 0, cuenta: 0, pistas: 0, mar: 'caribe', practicado: false,
  ingles: false, consejos: {}, tSinAvance: 0, tFlamea: 0
};
let mundo = null;
try { if (MW.disponible) mundo = MW.crear($('gl'), { biblio: BIBLIO, calma: S.calma, brujula: $('brujula') }); } catch (e) { console.warn('Regata: sin 3D (' + e.message + ')'); mundo = null; }

const clave = () => sel.materia + '|' + sel.tema + '|' + sel.grado;
const rotuloOp = (q, i) => (i + 1) + ' ' + BOYAS[i].glifo + ' ' + q.opciones[i];
const ordinal = n => n + '.º';

/* ---------- las preguntas de esta partida ---------- */
function armarCola() {
  if (S.modo === 'leccion') {
    const en = new Set(LEC.palabras.map(w => w.en.toLowerCase())), es = new Set(LEC.palabras.map(w => w.es.toLowerCase()));
    const ingles = o => { const t = partir(o).texto.trim().toLowerCase(); return /[a-z]/.test(t) && !es.has(t) && (en.has(t) || Voz.tiene(o) || (RC.esDirEn && RC.esDirEn(t))); };
    LEC.preguntas.forEach(q => { q.opEn = q.opciones.filter(ingles).length >= Math.ceil(q.opciones.length / 2); });
    let qs = LEC.preguntas.slice();
    if (LEC.palabras.length >= 2) qs = qs.concat(RC.dePalabras(LEC.palabras, LEC.palabras.length, { tiene: Voz.tiene, modo: S.P.modo }));
    qs = barajar(qs);
    if (qs.length > 12) qs = qs.slice(0, 12);
    return qs.map(q => ({ q, repaso: false }));
  }
  const n = sel.grado <= 1 ? 7 : 9;
  return RC.generar(sel.materia, sel.tema, sel.grado, n, { tiene: Voz.tiene, modo: S.P.modo }).map(q => ({ q, repaso: false }));
}
function reordenar(q) {
  const idx = barajar(q.opciones.map((_, i) => i));
  return Object.assign({}, q, { opciones: idx.map(i => q.opciones[i]), correcta: idx.indexOf(q.correcta) });
}

/* ---------- el recorrido: los centros de cada tramo, con islas a los lados ---------- */
function distSeg(px, pz, ax, az, bx, bz) { const dx = bx - ax, dz = bz - az, l = dx * dx + dz * dz || 1, t = clamp(((px - ax) * dx + (pz - az) * dz) / l, 0, 1); return Math.hypot(px - ax - dx * t, pz - az - dz * t); }
function nuevoCentro() {
  const k = S.centros.length, prev = S.centros[k - 1], W = S.viento.obj;
  const antes = S.centros.slice(-2).map(c => c.tipo);
  let tipo = Math.random() < S.P.contra && antes[antes.length - 1] !== 'contra' ? 'contra' : pick(['traves', 'traves', 'largo', 'popa']);
  if (k === 1 && S.P.modo === 'facil') tipo = 'traves';
  S.lado = -(S.lado || 1);
  let c = null;
  for (let intento = 0; intento < 8 && !c; intento++) {
    const off = tipo === 'contra' ? azar(-22, 22) : tipo === 'traves' ? S.lado * azar(80, 100) : tipo === 'largo' ? S.lado * azar(125, 145) : 180 + azar(-15, 15);
    const b = (W + off + 360) % 360, L = azar(S.P.L[0], S.P.L[1]) * (tipo === 'contra' ? 0.85 : 1), [dx, dz] = dir(b);
    const x = prev.x + dx * L, z = prev.z + dz * L;
    if (S.islas.every(i => distSeg(i.x, i.z, prev.x, prev.z, x, z) > i.r + 9 && Math.hypot(i.x - x, i.z - z) > i.r + 20)) c = { x, z, b, L, tipo, lat: azar(-14, 14) };
    else if (intento > 3) { S.lado = -S.lado; tipo = pick(['traves', 'largo']); }
  }
  if (!c) { const [dx, dz] = dir(prev.b || W + 90); c = { x: prev.x + dx * 45, z: prev.z + dz * 45, b: prev.b || W + 90, L: 45, tipo: 'traves' }; S.islas = S.islas.filter(i => distSeg(i.x, i.z, prev.x, prev.z, c.x, c.z) > i.r + 9); }
  S.centros.push(c);
  // una isla a un lado del tramo (lejos del camino y de las boyas), y a veces otra más lejos
  const mx = (prev.x + c.x) / 2, mz = (prev.z + c.z) / 2, [px, pz] = dir(c.b + 90), tipos = (MARES[S.mar] || MARES.caribe).islas || ['arena'];
  [[0.9, azar(26, 38)], [0.45, azar(60, 95)]].forEach(([p, d]) => {
    if (Math.random() > p) return;
    const lado = pick([-1, 1]), r = azar(5, 8.5) * (d > 50 ? 1.4 : 1), x = mx + px * lado * d + azar(-8, 8), z = mz + pz * lado * d + azar(-8, 8);
    const ok = S.centros.every((cc, j) => Math.hypot(cc.x - x, cc.z - z) > r + 22 && (j === 0 || distSeg(x, z, S.centros[j - 1].x, S.centros[j - 1].z, cc.x, cc.z) > r + 12))
      && S.islas.every(i => Math.hypot(i.x - x, i.z - z) > i.r + r + 10);
    if (ok) S.islas.push({ x, z, r, tipo: pick(tipos) });
  });
  if (S.islas.length > 16) S.islas = S.islas.slice(-16);
  if (mundo) mundo.islas(S.islas);
  return c;
}
function centro(i) { while (S.centros.length <= i) nuevoCentro(); return S.centros[i]; }
const metaIdx = () => (S.metaI != null ? S.metaI : S.idx + S.cola.length + 1);

/* ---------- navegar: la física de juguete (la misma para ti y para los rivales) ---------- */
// cuánto empuja el viento según el ángulo con él (0 = de frente, 180 = por detrás)
function polar(a, nogo) {
  if (a < nogo) return 0;
  const tb = [[nogo, 0.5], [nogo + 14, 0.82], [75, 0.95], [100, 1], [135, 0.94], [160, 0.8], [180, 0.74]];
  for (let i = 1; i < tb.length; i++) if (a <= tb[i][0]) { const [a0, f0] = tb[i - 1], [a1, f1] = tb[i]; return f0 + (f1 - f0) * (a - a0) / Math.max(1, a1 - a0); }
  return 0.74;
}
const velaQue = a => (a < 76 ? 'cerrada' : 'abierta');
function nuevoBarco(x, z, rumbo) { return { x, z, rumbo, v: 0, vela: 'abierta', escora: 0, botavara: 0, comba: 0, flamea: 1, estado: 'contra', bordo: 0, tBordo: 9, racha: 0, magia: 0, lento: 0 }; }
// el rumbo del piloto: derecho si se puede; si la boya está contra el viento, en bordos (zigzag) a 6° del límite
// si una isla tapa el camino a la boya, el piloto apunta primero a un punto por fuera de ella
function esquivar(b, tx, tz) {
  const dx = tx - b.x, dz = tz - b.z, L = Math.hypot(dx, dz) || 1;
  let mejor = null, dm = 1e9;
  S.islas.forEach(i => {
    const t = ((i.x - b.x) * dx + (i.z - b.z) * dz) / (L * L); if (t <= 0 || t >= 1) return;
    const cx = b.x + dx * t, cz = b.z + dz * t, d = Math.hypot(cx - i.x, cz - i.z);
    if (d > i.r + 4 || t * L > dm) return;
    let nx = cx - i.x, nz = cz - i.z, nl = Math.hypot(nx, nz); if (nl < 0.01) { nx = -dz / L; nz = dx / L; nl = 1; }
    dm = t * L; mejor = { x: i.x + nx / nl * (i.r + 7), z: i.z + nz / nl * (i.r + 7) };
  });
  return mejor || { x: tx, z: tz };
}
const islaDelante = (b, h) => { const [dx, dz] = dir(h); return S.islas.some(i => distSeg(i.x, i.z, b.x, b.z, b.x + dx * 12, b.z + dz * 12) < i.r + 2.5); };
function rumboPiloto(b, tx, tz, nogo) {
  const W = S.viento.desde, lim = nogo + 6;
  // tocó una isla: primero se aleja de ella por el rumbo navegable más cercano a «hacia afuera»
  if (b.choque > 0) { const r = angDif(b.fuera, W); return Math.abs(r) >= lim ? b.fuera : (W + (r >= 0 ? 1 : -1) * lim + 360) % 360; }
  const w = esquivar(b, tx, tz); tx = w.x; tz = w.z;
  const D = rumboA(tx - b.x, tz - b.z), rel = angDif(D, W);
  if (Math.abs(rel) >= lim) { b.bordo = 0; return D; }
  if (!b.bordo) b.bordo = angDif(b.rumbo, W) >= 0 ? 1 : -1;
  if (b.tBordo > 2.2 && rel * b.bordo < -13) { b.bordo = -b.bordo; b.tBordo = 0; }
  if (b.tBordo > 1 && islaDelante(b, W + b.bordo * lim) && !islaDelante(b, W - b.bordo * lim)) { b.bordo = -b.bordo; b.tBordo = -2.5; } // la isla por delante: se vira antes
  return (W + b.bordo * lim + 360) % 360;
}
function navegar(b, dt, giro, auto, ef, quieto) {
  b.tBordo += dt;
  if (auto != null) giro = clamp(angDif(auto, b.rumbo) / 22, -1, 1);
  const tasa = 78 * (0.6 + 0.4 * Math.min(1, b.v / VMAX));
  b.rumbo = (b.rumbo + giro * tasa * dt + 360) % 360;
  const nogo = S.P.nogo, rel = angDif(S.viento.desde, b.rumbo), a = Math.abs(rel), lado = rel >= 0 ? 1 : -1;
  if (b.velaSola || auto != null) { if (a < 70) b.vela = 'cerrada'; else if (a > 82) b.vela = 'abierta'; }
  const buena = a >= nogo && (b.vela === velaQue(a) || (a >= 68 && a <= 86));
  let f = polar(a, nogo) * (buena ? 1 : 0.42) * (b.magia > 0 ? 1.75 : b.racha > 0 ? 1.5 : 1) * (b.lento > 0 ? 0.55 : 1) * (auto != null ? ef : 1);
  if (quieto) f = 0;
  const obj = VMAX * f * (b.k || 1);
  b.v += (obj - b.v) * Math.min(1, dt * (obj < b.v ? 0.8 : 0.9));
  const [dx, dz] = dir(b.rumbo); b.x += dx * b.v * dt; b.z += dz * b.v * dt;
  // islas: no se atraviesan (te empujan afuera y frenan)
  let golpe = false;
  S.islas.forEach(i => { const ex = b.x - i.x, ez = b.z - i.z, d = Math.hypot(ex, ez), m = i.r + 1.8; if (d < m) { b.x = i.x + ex / (d || 1) * m; b.z = i.z + ez / (d || 1) * m; if (b.v > 2) golpe = true; b.v *= 0.85; b.choque = 1.6; b.fuera = rumboA(ex, ez); } });
  b.choque = Math.max(0, (b.choque || 0) - dt);
  // cómo se ve: la botavara a sotavento, la vela inflada o flameando, la escora
  b.botavara = a < nogo ? -lado * 4 : -lado * (b.vela === 'cerrada' ? 13 : clamp(a * 0.48, 34, 80));
  b.comba = a < nogo ? 0.05 : buena ? 0.45 + 0.55 * Math.min(1, b.v / VMAX) : 0.25;
  b.flamea = a < nogo ? 1 : buena ? 0 : 0.65;
  b.escora = lado * Math.min(1, b.v / VMAX) * (a < 110 ? 0.26 : 0.1);
  b.estado = quieto ? (S.fase === 'cuenta' ? 'salida' : 'fondeado') : a < nogo ? 'contra' : !buena ? 'flamea' : a < 70 ? 'cenida' : a < 115 ? 'traves' : a < 155 ? 'largo' : 'popa';
  b.racha = Math.max(0, b.racha - dt); b.magia = Math.max(0, b.magia - dt); b.lento = Math.max(0, b.lento - dt);
  return golpe;
}
// la ruta que haría el piloto: derecha, o un bordo y el otro hasta la boya (la línea de puntos)
function rutaHasta(b, tx, tz) {
  const w = esquivar(b, tx, tz); if (w.x !== tx || w.z !== tz) return [[b.x, b.z], [w.x, w.z], [tx, tz]];
  const W = S.viento.desde, nogo = S.P.nogo + 6, D = rumboA(tx - b.x, tz - b.z), rel = angDif(D, W);
  if (Math.abs(rel) >= nogo) return [[b.x, b.z], [tx, tz]];
  const s = b.bordo || (angDif(b.rumbo, W) >= 0 ? 1 : -1);
  for (const lado of [s, -s]) {
    const [ax, az] = dir(W + lado * nogo), [cx, cz] = dir(W - lado * nogo), ex = tx - b.x, ez = tz - b.z;
    const det = ax * cz - az * cx; if (Math.abs(det) < 1e-4) continue;
    const t1 = (ex * cz - ez * cx) / det, t2 = (ax * ez - az * ex) / det;
    if (t1 >= 0 && t2 >= 0) return [[b.x, b.z], [b.x + ax * t1, b.z + az * t1], [tx, tz]];
  }
  return [[b.x, b.z], [tx, tz]];
}

/* ---------- empezar ---------- */
function empezar(conPractica) {
  const modo = S.modo === 'leccion' ? (LJ.dificultad || 'normal') : modoDeGrado(sel.grado);
  S.P = params(modo);
  S.cola = armarCola();
  if (!S.cola.length) { anunciar('No hay preguntas para este tema.'); return; }
  S.ingles = S.modo === 'leccion' ? (LEC.palabras.length > 0 || LEC.preguntas.some(q => q.oir || q.opEn)) : sel.materia === 'ingles';
  S.total = S.cola.length; S.hechas = 0; S.aciertos = 0; S.fallos = 0; S.racha = 0; S.mejorRacha = 0; S.repasar = [];
  S.pistas = S.P.pistas; S.t = 0; S.espera = 0; S.pausa = false; S.metaI = null; S.idx = 0; S.hecho = 0; S.correctas = {}; S.islas = []; S.centros = [];
  S.mar = S.modo === 'leccion' ? (LEC.mar || pick(Object.keys(MARES))) : (MARES[sel.mar] ? sel.mar : pick(Object.keys(MARES)));
  S.velero = S.modo === 'leccion' ? 'delfin' : sel.velero;
  S.vela = S.modo === 'leccion' ? 'rayas' : (velaLibre(sel.vela) ? sel.vela : 'rayas');
  const W = Math.floor(Math.random() * 8) * 45; S.viento = { desde: W, obj: W, oculto: false };
  S.yo = nuevoBarco(0, 0, W); S.yo.velaSola = S.P.velaSola; S.yo.piloto = false; S.yo.destino = -1;
  if (mundo) { mundo.mar(S.mar); mundo.calma(S.calma); mundo.quitarBoyas(); mundo.puerta('meta', null); mundo.puerta('salida', null); mundo.islas([]); }
  S.rivales = []; S.nombresRiv = [];
  if (mundo) S.nombresRiv = mundo.veleros(S.velero, S.vela, !S.calma); else S.nombresRiv = S.calma ? [] : VELEROS.filter(v => v.id !== S.velero);
  document.body.classList.toggle('calmo', S.calma);
  ['inicio', 'pausa', 'final'].forEach(id => $(id).classList.add('oculto'));
  $('hud').classList.remove('oculto'); $('mando').classList.remove('oculto'); $('estado').classList.remove('oculto');
  S.tSinAvance = 0; S.tFlamea = 0; S.consejos = {};
  if (conPractica) practica(); else salida();
  hud();
}
/* la boya de práctica: el velero empieza de frente al viento (quieto) y el capitán explica */
function practica() {
  S.fase = 'practica'; S.tuto = 0;
  const W = S.viento.desde, lado = pick([-1, 1]), [dx, dz] = dir(W + lado * 72);
  S.tr = { practica: true, q: null, boyas: [{ x: dx * 30, z: dz * 30 }], tapados: new Set(), destino: -1 };
  if (mundo) mundo.boyas([{ x: dx * 30, z: dz * 30, texto: '⭐ Práctica', k: -1, radio: S.P.captura }]);
  $('carta').classList.remove('oculto'); $('ops').classList.add('oculto');
  $('cPreg').textContent = '⭐ Boya de práctica'; $('cPreg').classList.add('grande'); $('cPalabra').classList.add('oculto'); ['bOir', 'bVer', 'bPistaQ'].forEach(id => $(id).classList.add('oculto'));
  $('cFeed').className = 'feed'; $('cFeed').textContent = 'Llega a la boya amarilla.';
  consejo('🌬️ El viento viene de frente: así el velero no avanza. Gira con ' + (tactil ? 'el timón ◀ ▶' : 'las flechas ◀ ▶') + (S.P.modo === 'facil' || S.calma ? ', o toca 🧭 Piloto y va solo' : '') + '.', 'tuto0', 0, true);
  $('bSaltar').classList.remove('oculto');
}
function finPractica(salto) {
  if (S.fase !== 'practica') return;
  S.practicado = true; if (!LEC) { prefs.tuto = true; guardar(); }
  $('bSaltar').classList.add('oculto');
  if (!salto) { Snd.campana(); Snd.bien(); if (mundo) { mundo.marcar(0, 'bien'); mundo.estallar(S.tr.boyas[0].x, S.tr.boyas[0].z, '#fab005'); } consejo('¡Muy bien! En la regata, cada boya es una respuesta: navega hasta la buena.', 'tuto3', 4); }
  else ocultarConsejo();
  S.fase = 'pausaTuto'; S.espera = salto ? 0.2 : 2.2;
}
/* la salida: los cuatro veleros en la línea y la cuenta 3, 2, 1 */
function salida() {
  if (mundo) mundo.hundirBoyas();
  const yo = S.yo, W = S.viento.desde;
  S.centros = [{ x: yo.x, z: yo.z, b: yo.rumbo, L: 40, tipo: 'salida' }];
  const c1 = centro(1);
  // el rumbo de salida: el del primer tramo, o el más cercano que se pueda navegar
  let r0 = c1.b; const rel = angDif(r0, W); if (Math.abs(rel) < S.P.nogo + 10) r0 = (W + (rel >= 0 ? 1 : -1) * (S.P.nogo + 12) + 360) % 360;
  yo.rumbo = r0; yo.v = 0; yo.bordo = 0;
  const [px, pz] = dir(r0 + 90), [fx, fz] = dir(r0);
  S.rivales = S.nombresRiv.map((e, i) => { const o = [-11, -5.5, 5.5][i], b = nuevoBarco(yo.x + px * o - fx * 2, yo.z + pz * o - fz * 2, r0); b.k = S.P.rival[i]; b.idx = 1; b.fin = null; b.carril = [-2.5, 2.5, 0][i]; b.velaSola = true; return b; });
  if (mundo) mundo.puerta('salida', yo.x + fx * 2, yo.z + fz * 2, r0);
  S.fase = 'cuenta'; S.cuenta = 3.2; mostrarCuenta('3'); Snd.cuenta(false);
  S.yo.piloto = S.P.piloto || S.calma;
  nuevoTramo();
}
function mostrarCuenta(t) { const c = $('cuenta'); c.textContent = t; c.classList.toggle('oculto', !t); }

/* ---------- los tramos ---------- */
function nuevoTramo() {
  const it = S.cola.shift();
  S.yo.destino = -1;
  if (!it) { aLaMeta(); return; }
  const q = it.q;
  S.idx++;
  const c = centro(S.idx), n = q.opciones.length, sep = (n === 2 ? 17 : n === 3 ? 14.5 : 13) + (S.P.modo === 'facil' ? 2 : 0), [px, pz] = dir(c.b + 90);
  const boyas = q.opciones.map((_, j) => ({ x: c.x + px * (j - (n - 1) / 2) * sep, z: c.z + pz * (j - (n - 1) / 2) * sep }));
  S.correctas[S.idx] = boyas[q.correcta];
  S.tr = { q, repaso: it.repaso, boyas, tapados: new Set(), visto: !q.escucha, pista: false, destino: -1, t: 0 };
  // el viento: en la pregunta del viento sopla desde la buena (y no se escribe); si no, a veces cambia
  S.viento.oculto = q.viento != null;
  if (q.viento != null) S.viento.obj = q.viento;
  else if (S.idx >= 3 && Math.random() < S.P.cambio * (S.mar === 'tormenta' ? 1.6 : 1) && S.t - (S.tCambio || 0) > 18) {
    S.tCambio = S.t; S.viento.obj = (S.viento.obj + pick([-1, 1]) * (Math.random() < 0.75 ? 45 : 90) + 360) % 360;
    consejo('🌬️ ¡El viento cambió! Ahora viene del ' + nombreDir(S.viento.obj) + (S.ingles && Voz.tiene(nombreDir(S.viento.obj, true)) ? ' (' + nombreDir(S.viento.obj, true) + ')' : '') + '.', 'cambio', 4.5, true);
    if (S.ingles) Voz.decir(nombreDir(S.viento.obj, true), { grupo: 'viento' });
  }
  if (mundo) mundo.boyas(boyas.map((b, j) => ({ x: b.x, z: b.z, texto: q.opciones[j], k: j, radio: S.P.captura })));
  pintarCarta();
  if (q.oir) setTimeout(() => { if (S.tr && S.tr.q === q) oir(); }, 450);
  anunciar((it.repaso ? 'Repaso. ' : 'Boya ' + (S.hechas + 1) + ' de ' + S.total + '. ') + q.p + ' ' + q.opciones.map((o, i) => 'Boya ' + (i + 1) + ', ' + BOYAS[i].forma + ': ' + o).join('. ') + '.');
}
function aLaMeta() {
  S.idx++; S.metaI = S.idx; const c = centro(S.idx);
  S.tr = null; S.yo.destino = -1;
  if (mundo) mundo.puerta('meta', c.x, c.z, c.b);
  $('ops').classList.add('oculto');
  $('cPreg').textContent = '🏁 ¡A la meta!'; $('cPreg').classList.add('grande'); $('cPalabra').classList.add('oculto');
  ['bOir', 'bVer', 'bPistaQ'].forEach(id => $(id).classList.add('oculto')); $('cFeed').textContent = 'Pasa entre las dos banderas.'; $('cFeed').className = 'feed';
  S.viento.oculto = false;
  anunciar('¡Todas las boyas! Navega a la meta, entre las dos banderas.');
}

/* ---------- la carta y los botones de las boyas ---------- */
function pintarCarta() {
  const a = S.tr, q = a.q;
  $('carta').classList.remove('oculto');
  $('cPreg').textContent = q.p; $('cPreg').classList.toggle('grande', q.p.length <= 16);
  $('cFeed').textContent = ''; $('cFeed').className = 'feed';
  if (q.escucha && (!Voz.tiene(q.oir) || Snd.mudo)) a.visto = true;
  const pw = $('cPalabra'); pw.textContent = q.palabra ? '«' + q.palabra + '»' : ''; pw.classList.toggle('oculto', !(q.escucha && a.visto && q.palabra));
  $('bOir').classList.toggle('oculto', !q.oir || !Voz.tiene(q.oir));
  $('bVer').classList.toggle('oculto', !q.escucha || a.visto);
  pintarPista();
  const ops = $('ops'); ops.innerHTML = ''; ops.classList.remove('oculto');
  q.opciones.forEach((o, i) => {
    const b = document.createElement('button'); b.type = 'button'; b.className = 'elegir'; b.style.setProperty('--c', BOYAS[i].color);
    b.setAttribute('aria-pressed', 'false'); b.setAttribute('aria-label', 'Boya ' + (i + 1) + ', ' + BOYAS[i].forma + ': ' + o + '. El piloto te lleva.');
    const n = document.createElement('span'); n.className = 'num f' + i; n.textContent = i + 1; n.setAttribute('aria-hidden', 'true');
    const tx = document.createElement('span'); tx.className = 'tx'; if (q.opEn) tx.lang = 'en';
    const pt = partir(o);
    if (pt.emoji) { const e = document.createElement('span'); e.className = 'em'; e.textContent = pt.emoji; tx.appendChild(e); }
    tx.appendChild(document.createTextNode(pt.texto || (pt.emoji ? '' : o)));
    b.append(n, tx);
    b.addEventListener('click', () => elegir(i));
    ops.appendChild(b);
  });
}
function pintarPista() {
  const a = S.tr, b = $('bPistaQ');
  const puede = a && a.q && !a.pista && S.pistas > 0 && a.q.opciones.length - a.tapados.size > 2 && S.espera <= 0;
  b.classList.toggle('oculto', !puede);
  $('nPista').textContent = S.pistas === Infinity ? '(P)' : '(P) · ' + S.pistas;
}
const botones = () => [...$('ops').querySelectorAll('.elegir')];
/** Elegir la boya i: queda marcada, sale la ruta y el piloto te lleva (el timón lo quita). */
function elegir(i) {
  const a = S.tr;
  if (!a || !a.q || S.espera > 0 || S.fase === 'fin' || S.pausa || i < 0 || i >= a.q.opciones.length || a.tapados.has(i)) return;
  if (a.destino >= 0 && mundo) mundo.marcar(a.destino, '');
  a.destino = i; S.yo.destino = i; S.yo.piloto = true;
  if (mundo) mundo.marcar(i, 'elegido');
  botones().forEach((b, k) => b.setAttribute('aria-pressed', String(k === i)));
  Snd.clic();
  if (a.q.opEn) Voz.decir(a.q.opciones[i], { grupo: 'opcion', vigente: () => S.tr === a });
  anunciar('Vas a la boya ' + (i + 1) + ': ' + a.q.opciones[i] + '. El piloto te lleva.');
  hud();
}
function oir() { const a = S.tr; if (a && a.q && a.q.oir) Voz.decir(a.q.oir, { grupo: 'oir', vigente: () => S.tr === a }); }
function ver() { const a = S.tr; if (!a || !a.q || !a.q.escucha || a.visto) return; a.visto = true; $('cPalabra').classList.remove('oculto'); $('bVer').classList.add('oculto'); anunciar('La palabra: ' + a.q.palabra); }
function pista() {
  const a = S.tr; if (!a || !a.q || a.pista || S.pistas <= 0 || S.espera > 0) return;
  const malas = a.q.opciones.map((_, i) => i).filter(i => i !== a.q.correcta && !a.tapados.has(i));
  if (a.q.opciones.length - a.tapados.size <= 2) return;
  const i = pick(malas); a.tapados.add(i); a.pista = true; S.pistas--;
  if (a.destino === i) { a.destino = -1; S.yo.destino = -1; }
  if (mundo) mundo.marcar(i, 'tapado');
  const b = botones()[i]; if (b) { b.classList.add('tapado'); b.disabled = true; }
  pintarPista(); anunciar('Pista: la boya ' + (i + 1) + ' no es.');
}

/* ---------- llegar a una boya ---------- */
function resolver(i) {
  const a = S.tr, q = a.q, bien = i === q.correcta, yo = S.yo, c = a.boyas[i];
  botones().forEach((b, k) => { b.disabled = true; if (k === q.correcta) b.classList.add('bien'); else if (k === i) b.classList.add('mal'); });
  const f = $('cFeed');
  Snd.campana();
  if (bien) {
    if (!a.repaso) S.aciertos++;
    S.racha++; S.mejorRacha = Math.max(S.mejorRacha, S.racha);
    if (mundo) { mundo.marcar(i, 'bien'); mundo.estallar(c.x, c.z, BOYAS[i].color); }
    if (S.racha % 3 === 0) { yo.magia = 6; Snd.magia(); f.textContent = '¡Viento mágico! ' + S.racha + ' seguidas 🌈'; }
    else { yo.racha = 3.5; Snd.bien(); Snd.racha(); f.textContent = '¡Bien! ' + q.opciones[i] + ' · ¡racha de viento! 🌬️'; }
    f.className = 'feed bien';
    // la racha sopla a favor: el viento gira un poco para que el próximo tramo se navegue mejor
    if (q.opEn) Voz.decir(q.opciones[i], { grupo: 'boya' });
    else if (q.escucha && q.palabra) { a.visto = true; $('cPalabra').classList.remove('oculto'); }
  } else {
    if (!a.repaso) {
      S.fallos++; S.repasar.push(q);
      if (S.P.repaso) S.cola.splice(Math.min(2, S.cola.length), 0, { q: reordenar(q), repaso: true });
    }
    S.racha = 0;
    if (S.P.lento) yo.lento = 1.6;
    S.sacudir = true;
    if (mundo) { mundo.marcar(i, 'mal'); mundo.marcar(q.correcta, 'era'); }
    Snd.mal();
    f.textContent = 'Era: ' + rotuloOp(q, q.correcta) + (q.palabra ? ' («' + q.palabra + '»)' : '') + (S.P.repaso && !a.repaso ? ' · Vuelve más adelante.' : '');
    f.className = 'feed mal';
    if (q.opEn) Voz.decir(q.opciones[q.correcta], { grupo: 'boya' }); else if (q.oir) Voz.decir(q.oir, { grupo: 'boya' });
    if (q.escucha && q.palabra) { a.visto = true; $('cPalabra').classList.remove('oculto'); }
  }
  $('bVer').classList.add('oculto'); $('bPistaQ').classList.add('oculto');
  if (!a.repaso) S.hechas++;
  S.hecho = S.idx;
  anunciar(f.textContent);
  avisarLeccion(false);
  S.espera = S.calma ? 1.8 : 1.4;
  S.trHecho = a; S.tr = null; yo.destino = -1;
  S.viento.oculto = false;
  if (mundo) setTimeout(() => { if (S.trHecho === a && mundo) mundo.hundirBoyas(); }, 700);
}

/* ---------- cada cuadro ---------- */
const teclas = { l: false, r: false };
const toque = { giro: 0 };
function destinoYo() {
  const yo = S.yo;
  if (S.fase === 'practica') return S.tr.boyas[0];
  if (S.metaI != null) return centro(S.metaI);
  if (S.tr && S.tr.q && yo.destino >= 0) return S.tr.boyas[yo.destino];
  return null;
}
function mover(dt) {
  const yo = S.yo, giro = clamp((teclas.r ? 1 : 0) - (teclas.l ? 1 : 0) + toque.giro, -1, 1);
  if (giro && yo.piloto && S.fase !== 'cuenta') { yo.piloto = false; anunciar('Timón a mano. El piloto se quitó.'); hud(); }
  let objetivo = yo.piloto ? destinoYo() : null, quieto = false;
  if (S.fase === 'cuenta' || S.fase === 'pausaTuto') quieto = S.fase === 'cuenta';
  // con el piloto y sin boya elegida: se acerca a las boyas y espera fondeado (en calma, espera desde el principio)
  if (yo.piloto && !objetivo && S.tr && S.tr.q && S.espera <= 0) {
    const c = centro(S.idx), d = Math.hypot(c.x - yo.x, c.z - yo.z);
    if (S.calma || d < 20) quieto = true; else objetivo = c;
  }
  const auto = objetivo ? rumboPiloto(yo, objetivo.x, objetivo.z, S.P.nogo) : null;
  if (navegar(yo, dt, auto != null ? 0 : giro, auto, S.P.efPiloto, quieto)) { Snd.golpe(); S.sacudir = true; consejo('¡Cuidado con la isla! Rodéala.', 'isla', 3); }
  S.ruta = objetivo && (S.fase !== 'cuenta') ? rutaHasta(yo, objetivo.x, objetivo.z) : (S.tr && S.tr.q && yo.destino >= 0 ? rutaHasta(yo, S.tr.boyas[yo.destino].x, S.tr.boyas[yo.destino].z) : null);
}
function moverRivales(dt) {
  if (!S.rivales.length) return;
  const pp = progresoYo();
  S.rivales.forEach(r => {
    if (r.fin != null) { navegar(r, dt, 0, null, 1, true); return; }
    const mi = metaIdx();
    let t;
    if (r.idx >= mi && S.metaI != null) t = centro(S.metaI);
    else if (S.correctas[r.idx]) t = S.correctas[r.idx];
    else { const cc = centro(r.idx), [qx, qz] = dir(cc.b + 90); t = { x: cc.x + qx * (cc.lat || 0), z: cc.z + qz * (cc.lat || 0) }; } // la boya buena aún no se sabe: un lado cualquiera
    const c = centro(r.idx), [px, pz] = dir(c.b + 90), tx = t.x + px * r.carril, tz = t.z + pz * r.carril;
    r.k = S.P.rival[S.rivales.indexOf(r)] * (1 + clamp((pp - progreso(r)) * 0.05, -0.15, 0.08));
    navegar(r, dt, 0, rumboPiloto(r, tx, tz, S.P.nogo), 1, S.fase === 'cuenta');
    if (Math.hypot(tx - r.x, tz - r.z) < 4.5) { r.idx++; if (r.idx > metaIdx() || (S.metaI != null && r.idx > S.metaI)) r.fin = S.t; }
  });
}
function progreso(r) {
  if (r.fin != null) return 1e6 - r.fin;
  const c = centro(r.idx);
  return r.idx - 1 + (1 - clamp(Math.hypot(c.x - r.x, c.z - r.z) / (c.L || 40), 0, 1));
}
function progresoYo() {
  if (S.fase === 'fin') return 1e6 - S.t;
  if (!S.centros.length) return 0;
  const i = S.hecho + 1, c = centro(i);
  return S.hecho + (1 - clamp(Math.hypot(c.x - S.yo.x, c.z - S.yo.z) / (c.L || 40), 0, 1));
}
const puesto = () => { const p = progresoYo(); return 1 + S.rivales.filter(r => r.fin != null || progreso(r) > p).length; };

let tAnt = performance.now(), tHud = 0, tFl = 0;
function bucle(ahora) {
  requestAnimationFrame(bucle);
  const dt = Math.min(0.05, (ahora - tAnt) / 1000); tAnt = ahora;
  if (S.pausa || !S.yo) return;
  // el viento gira despacio hacia donde va
  const dv = angDif(S.viento.obj, S.viento.desde); S.viento.desde = (S.viento.desde + clamp(dv, -40 * dt, 40 * dt) + 360) % 360;
  if (S.fase === 'cuenta') {
    S.cuenta -= dt;
    const n = Math.ceil(S.cuenta - 0.2), t = S.cuenta <= 0.2 ? '¡Ya!' : String(Math.min(3, n));
    if ($('cuenta').textContent !== t) { mostrarCuenta(t); Snd.cuenta(t === '¡Ya!'); }
    if (S.cuenta <= 0) { S.fase = 'navega'; setTimeout(() => { if (S.fase !== 'cuenta') mostrarCuenta(''); }, 500); }
  }
  if (S.fase === 'menu') { navegar(S.yo, dt, 0, null, 1, false); islasMenu(); }
  else {
    if (S.fase === 'navega') S.t += dt;
    if (S.fase !== 'fin') mover(dt); else navegar(S.yo, dt, 0, null, 1, true);
    moverRivales(dt);
    if (S.fase === 'pausaTuto') { S.espera -= dt; if (S.espera <= 0) salida(); }
    if (S.fase === 'practica') { tutorial(); const b = S.tr.boyas[0]; if (Math.hypot(b.x - S.yo.x, b.z - S.yo.z) < S.P.captura) finPractica(false); }
    if (S.fase === 'navega') {
      if (S.espera > 0) { S.espera -= dt; if (S.espera <= 0) nuevoTramo(); }
      else if (S.tr && S.tr.q) {
        const a = S.tr; a.t += dt;
        for (let j = 0; j < a.boyas.length; j++) {
          if (a.tapados.has(j) || (S.yo.piloto && a.destino >= 0 && j !== a.destino)) continue;
          if (Math.hypot(a.boyas[j].x - S.yo.x, a.boyas[j].z - S.yo.z) < S.P.captura) { resolver(j); break; }
        }
      }
      if (S.metaI != null) { const c = centro(S.metaI); if (Math.hypot(c.x - S.yo.x, c.z - S.yo.z) < 10) terminar(); }
      if (S.t > 12 && mundo) mundo.puerta('salida', null);
      consejos(dt);
    }
    // la vela que flamea suena (bajito)
    if (S.yo.flamea > 0.5 && S.yo.v > 0.5 && S.fase !== 'fin') { tFl -= dt; if (tFl <= 0) { Snd.flamea(); tFl = 0.45; } }
  }
  Snd.olas(S.fase !== 'menu', S.mar === 'tormenta');
  tHud += dt; if (tHud > 0.15) { tHud = 0; hud(); }
  if (mundo) mundo.cuadro(dt, estadoMundo());
  S.sacudir = false;
}
function estadoMundo() {
  const yo = S.yo, d = S.fase === 'menu' ? null : destinoYo() || (S.tr && S.tr.q && yo.destino >= 0 ? S.tr.boyas[yo.destino] : null);
  const verZona = S.fase !== 'menu' && S.fase !== 'fin';
  return { yo, rivales: S.rivales, viento: { desde: S.viento.desde, racha: yo.racha > 0 || yo.magia > 0 }, destino: d, ruta: S.fase === 'menu' ? null : S.ruta,
    nogo: S.P.nogo, zona: verZona, contra: yo.estado === 'contra' && verZona, sacudir: S.sacudir };
}

/* ---------- el capitán: consejos cuando algo no sale ---------- */
let tConsejo = 0;
function consejo(texto, k, dur, forzar) {
  const ahora = performance.now() / 1000;
  if (!forzar && S.consejos[k] && ahora - S.consejos[k] < 9) return;
  S.consejos[k] = ahora;
  $('kTxt').textContent = texto; $('consejo').classList.remove('oculto');
  anunciar(texto);
  clearTimeout(tConsejo); if (dur) tConsejo = setTimeout(ocultarConsejo, dur * 1000);
}
function ocultarConsejo() { $('consejo').classList.add('oculto'); }
function tutorial() {
  const yo = S.yo;
  if (S.tuto === 0 && yo.estado !== 'contra') { S.tuto = 1; }
  if (S.tuto === 1) {
    if (yo.estado === 'flamea' && !yo.velaSola) { consejo('〰️ La vela flamea: pulsa ' + (tactil ? '⛵ Vela' : 'Espacio') + ' para ' + (yo.vela === 'cerrada' ? 'abrirla' : 'cerrarla') + '.', 'tuto1', 0, true); S.tuto = 2; }
    else if (yo.estado !== 'contra' && yo.estado !== 'flamea' && yo.v > 2.5) { S.tuto = 3; consejo('¡Así se navega! La vela se infla. Ve a la boya amarilla ⭐.', 'tuto2', 5, true); }
  } else if (S.tuto === 2 && yo.estado !== 'flamea' && yo.estado !== 'contra' && yo.v > 2.5) { S.tuto = 3; consejo('¡Así se navega! La vela se infla. Ve a la boya amarilla ⭐.', 'tuto2', 5, true); }
  else if (S.tuto >= 1 && yo.estado === 'contra') consejo('Contra el viento no se avanza: gira un poco más.', 'tutoC', 4);
}
function consejos(dt) {
  const yo = S.yo;
  if (S.tr && S.tr.q && S.tr.t > 8 && S.tr.destino < 0 && yo.estado === 'fondeado') consejo('⚓ Elige una boya con ' + (tactil ? 'su botón o tocándola' : '1, 2, 3 o tocándola') + ', y el piloto te lleva.', 'elige', 5);
  if (yo.piloto || S.espera > 0) { S.tSinAvance = 0; S.tFlamea = 0; return; }
  S.tSinAvance = yo.estado === 'contra' ? S.tSinAvance + dt : 0;
  S.tFlamea = yo.estado === 'flamea' ? S.tFlamea + dt : 0;
  if (S.tSinAvance > 2.2) consejo('✋ Contra el viento no se avanza. Gira ◀ ▶ hasta que la vela se infle y ve en zigzag.', 'contra', 5);
  else if (S.tFlamea > 2.2) consejo('〰️ La vela flamea: pulsa ' + (tactil ? '⛵ Vela' : 'Espacio') + ' para ' + (yo.vela === 'cerrada' ? 'abrirla' : 'cerrarla') + '.', 'flamea', 5);
}

/* ---------- terminar ---------- */
function avisarLeccion(terminado) {
  if (S.modo !== 'leccion' || !LJ) return;
  const r = { aciertos: S.aciertos, total: S.total, fallos: S.fallos, nivel: (MARES[S.mar] || {}).nombre || S.mar };
  if (terminado && S.rivales.length) r.puesto = S.puestoFin;
  try { if (terminado) LJ.resultado(r); else LJ.progreso(r); } catch (e) { /* sin padre: nada */ }
}
function terminar() {
  S.tFin = S.t; const tiempo = S.t;
  S.puestoFin = S.rivales.length ? 1 + S.rivales.filter(r => r.fin != null && r.fin < tiempo).length : 0;
  S.fase = 'fin'; S.tr = null; S.espera = 0; S.yo.piloto = false;
  $('carta').classList.add('oculto'); $('ops').classList.add('oculto'); $('mando').classList.add('oculto'); $('estado').classList.add('oculto'); ocultarConsejo();
  Snd.meta(); Voz.callar();
  if (mundo) { const c = centro(S.metaI); mundo.estallar(c.x, c.z, '#ffd43b'); }
  const p = S.puestoFin, nombreMar = (MARES[S.mar] || {}).nombre || '';
  const resumen = 'Boyas buenas: ' + S.aciertos + ' de ' + S.total + '.' + (S.calma ? '' : ' Tiempo: ' + tiempo.toFixed(1).replace('.', ',') + ' s.') + (S.mejorRacha >= 3 ? ' Mejor racha: ' + S.mejorRacha + '.' : '');
  if (S.modo === 'leccion') {
    avisarLeccion(true);
    const chips = LEC.palabras.length ? LEC.palabras.slice(0, 10).map(w => w.en + ' = ' + w.es) : S.repasar.slice(0, 4).map(q => q.p.replace(/^🔊\s*/, '').slice(0, 40) + ' → ' + q.opciones[q.correcta] + (q.palabra ? ' («' + q.palabra + '»)' : ''));
    LJ.logrado({ detalle: (p ? 'Llegaste ' + ordinal(p) + ' de ' + (S.rivales.length + 1) + ' en ' + nombreMar + '. ' : 'Llegaste a la meta en ' + nombreMar + '. ') + resumen,
      chips, chipsRotulo: LEC.palabras.length ? 'Lo que practicaste' : 'Para repasar', alOtraVez: () => { Snd.despertar(); empezar(false); } });
    return;
  }
  // la sala: récord y velas nuevas
  const antes = prefs.boyas || 0; prefs.boyas = antes + S.aciertos;
  const nuevas = VELAS.filter(v => v.desde > antes && v.desde <= prefs.boyas);
  let frente = '';
  const rec = prefs.records[clave()];
  if (!S.calma) {
    if (rec && rec.tiempo) frente = tiempo < rec.tiempo ? ' ¡Nuevo récord! ' + (rec.tiempo - tiempo).toFixed(1).replace('.', ',') + ' s menos.' : ' Tu récord: ' + rec.tiempo.toFixed(1).replace('.', ',') + ' s.';
    if (!rec || tiempo < rec.tiempo) { prefs.records[clave()] = { tiempo, aciertos: S.aciertos, total: S.total }; const ks = Object.keys(prefs.records); if (ks.length > 24) delete prefs.records[ks[0]]; }
  }
  guardar();
  $('fMedalla').textContent = S.calma ? '🌟' : ['🥇', '🥈', '🥉', '🏅'][p - 1] || '🏅';
  $('fTit').textContent = S.calma ? '¡Llegaste a la meta!' : p === 1 ? '¡Ganaste la regata!' : '¡Llegaste ' + ordinal(p) + '!';
  $('fRes').textContent = resumen + frente;
  const podio = $('fPodio'); podio.innerHTML = '';
  if (S.rivales.length) {
    const yoNom = (VELEROS.find(a => a.id === S.velero) || VELEROS[0]).nombre + ' (tú)';
    const lista = S.rivales.map((r, i) => ({ n: (S.nombresRiv[i] || {}).nombre || 'Rival', fin: r.fin != null && r.fin < tiempo ? r.fin : null, pr: progreso(r) })).concat([{ n: yoNom, fin: tiempo, yo: true, pr: 1e6 }]);
    lista.sort((a, b) => (a.fin != null && b.fin != null ? a.fin - b.fin : a.fin != null ? -1 : b.fin != null ? 1 : b.pr - a.pr));
    lista.forEach((x, i) => { const li = document.createElement('li'); li.textContent = ordinal(i + 1) + ' ' + x.n; if (x.yo) li.className = 'yo'; podio.appendChild(li); });
  }
  podio.classList.toggle('oculto', !S.rivales.length);
  $('fRepasa').textContent = S.repasar.length ? 'Para repasar: ' + S.repasar.slice(0, 4).map(q => q.p.replace(/^🔊\s*/, '') + ' → ' + q.opciones[q.correcta] + (q.palabra ? ' («' + q.palabra + '»)' : '')).join(' · ') : '¡Ninguna boya equivocada!';
  $('fNuevo').textContent = nuevas.length ? '⛵ ¡Ganaste una vela nueva: ' + nuevas.map(v => v.nombre).join(', ') + '! Elígela en el inicio.' : '';
  setTimeout(() => { if (S.fase === 'fin') { $('final').classList.remove('oculto'); $('bOtraVuelta').focus(); } }, 1100);
}

/* ---------- HUD ---------- */
const ESTADOS = {
  contra: '✋ Contra el viento: no avanzas', flamea: '〰️ La vela flamea', cenida: '↗️ Casi contra el viento', traves: '➡️ Viento de lado: ¡rápido!',
  largo: '↘️ Viento de lado y atrás', popa: '⬇️ Viento por detrás', fondeado: '⚓ Esperando: elige una boya', salida: '⏱️ ¡Prepárate! Elige tu boya'
};
function hud() {
  if (!S.yo) return;
  const yo = S.yo, enRepaso = (S.tr && S.tr.repaso) || (S.espera > 0 && S.trHecho && S.trHecho.repaso);
  const n = Math.min(S.total, S.hechas + (S.espera > 0 || S.metaI != null ? 0 : 1));
  const tA = S.fase === 'practica' || S.fase === 'pausaTuto' ? '⭐ Práctica' : S.metaI != null ? '🏁 A la meta' : enRepaso ? 'Repaso' : 'Boya ' + Math.max(1, n) + ' de ' + S.total;
  if ($('hBoya').textContent !== tA) $('hBoya').textContent = tA;
  const tp = S.rivales.length && S.fase !== 'practica' && S.fase !== 'pausaTuto' ? 'Puesto ' + ordinal(S.fase === 'fin' ? S.puestoFin : puesto()) + ' de ' + (S.rivales.length + 1) + ' · ' + S.aciertos + ' bien' : S.aciertos + ' bien' + (S.calma ? ' · calma' : '');
  if ($('hPuesto').textContent !== tp) $('hPuesto').textContent = tp;
  const r = $('hRacha'), tr = yo.magia > 0 ? '🌈 Mágico' : yo.racha > 0 ? '🌬️ Racha' : S.racha >= 2 ? '🔥 ' + S.racha : '';
  r.textContent = tr; r.classList.toggle('oculto', !tr);
  $('bSonido').setAttribute('aria-pressed', String(Snd.mudo)); $('iSonido').textContent = Snd.mudo ? '🔇' : '🔊'; $('tSonido').textContent = Snd.mudo ? 'Activar el sonido' : 'Silenciar';
  $('bCalma').setAttribute('aria-pressed', String(S.calma));
  // el viento escrito (en la pregunta del viento, no)
  const tv = S.viento.oculto ? 'Viento del ¿…? Mira la flecha' : 'Viento del ' + nombreDir(S.viento.obj) + (S.ingles ? ' · ' + nombreDir(S.viento.obj, true) : '');
  if ($('tViento').textContent !== tv) $('tViento').textContent = tv;
  // el estado del velero: texto, barras de velocidad y lo que hay que hacer
  let te = ESTADOS[yo.estado] || '';
  if (yo.estado === 'flamea' && !yo.velaSola && !yo.piloto) te += ': ' + (yo.vela === 'cerrada' ? 'ábrela' : 'ciérrala') + (tactil ? '' : ' (Espacio)');
  const nb = Math.round(clamp(yo.v / (VMAX * 1.2), 0, 1) * 5);
  if ($('eTxt').textContent !== te) $('eTxt').textContent = te;
  $('eVel').textContent = '▮'.repeat(nb) + '▯'.repeat(5 - nb); $('eVel').setAttribute('aria-label', 'Velocidad ' + nb + ' de 5');
  $('estado').dataset.e = yo.estado;
  $('tVela').textContent = yo.velaSola ? 'Sola' : yo.vela === 'cerrada' ? 'Cerrada' : 'Abierta';
  $('bVela').setAttribute('aria-label', 'Vela ' + (yo.velaSola ? 'automática' : yo.vela) + '. Pulsa para ' + (yo.velaSola ? 'manejarla tú' : yo.vela === 'cerrada' ? 'abrirla' : 'cerrarla'));
  $('bVela').dataset.v = yo.velaSola ? 'sola' : yo.vela;
  $('bPiloto').setAttribute('aria-pressed', String(!!yo.piloto));
  // la carrera en una línea: quién va delante
  const pis = $('hPista'); pis.classList.toggle('oculto', !S.rivales.length || S.fase === 'practica' || S.fase === 'pausaTuto');
  if (S.rivales.length) {
    if (!pis.dataset.ok) { pis.dataset.ok = '1'; for (let i = 0; i < 4; i++) { const d = document.createElement('span'); d.className = 'pto'; pis.appendChild(d); } }
    const pts = pis.querySelectorAll('.pto'), m = metaIdx(), yoV = VELEROS.find(a => a.id === S.velero) || VELEROS[0];
    pts[3].className = 'pto yo'; pts[3].textContent = yoV.emoji; pts[3].style.left = clamp(progresoYo() / m * 100, 0, 100) + '%'; pts[3].title = yoV.nombre + ' (tú)';
    S.rivales.forEach((rv, i) => { const e = S.nombresRiv[i] || {}; pts[i].style.background = e.c || '#555'; pts[i].textContent = e.emoji || '?'; pts[i].style.left = clamp((rv.fin != null ? m : progreso(rv)) / m * 100, 0, 100) + '%'; pts[i].title = e.nombre || ''; });
  }
}
function anunciar(t) { const a = $('anuncio'); a.textContent = ''; setTimeout(() => { a.textContent = t; }, 30); }

/* ---------- la vela, el piloto, pausa, calma y sonido ---------- */
function vela() {
  const yo = S.yo; if (!yo || S.fase === 'menu' || S.fase === 'fin') return;
  if (yo.velaSola) { yo.velaSola = false; anunciar('La vela la manejas tú: Espacio la abre o la cierra.'); }
  else { yo.vela = yo.vela === 'cerrada' ? 'abierta' : 'cerrada'; Snd.vela(); anunciar('Vela ' + yo.vela + '.'); }
  if (yo.piloto) { yo.piloto = false; }
  hud();
}
function piloto() {
  const yo = S.yo; if (!yo || S.fase === 'menu' || S.fase === 'fin') return;
  yo.piloto = !yo.piloto; Snd.clic();
  anunciar(yo.piloto ? (yo.destino >= 0 || S.metaI != null || S.fase === 'practica' ? 'Piloto puesto: el velero va solo.' : 'Piloto puesto. Elige una boya y el velero va solo.') : 'Timón a mano.');
  hud();
}
function pausar() {
  if (S.fase === 'menu' || S.fase === 'fin') return;
  S.pausa = true; Snd.parar(); Voz.callar();
  $('pRes').textContent = 'Llevas ' + S.aciertos + ' de ' + S.total + ' boyas buenas.';
  $('bInicio').classList.toggle('oculto', S.modo === 'leccion');
  $('pausa').classList.remove('oculto'); $('bSeguir').focus();
}
function seguir() { $('pausa').classList.add('oculto'); S.pausa = false; tAnt = performance.now(); }
function ponerCalma(b) {
  S.calma = !!b; if (!LEC) { prefs.calma = S.calma; guardar(); }
  if (mundo) mundo.calma(S.calma);
  document.body.classList.toggle('calmo', S.calma);
  if (S.calma && S.yo && S.fase !== 'menu') S.yo.piloto = true;
  hud();
}
$('bSonido').addEventListener('click', () => { Snd.mudo = !Snd.mudo; if (!LEC) { prefs.mudo = Snd.mudo; guardar(); } if (Snd.mudo) Voz.callar(); else Snd.despertar(); hud(); if (S.tr && S.tr.q && Snd.mudo && S.tr.q.escucha) { S.tr.visto = true; $('cPalabra').classList.remove('oculto'); $('bVer').classList.add('oculto'); } });
$('bCalma').addEventListener('click', () => ponerCalma(!S.calma));
$('bMenu').addEventListener('click', pausar);
$('bSeguir').addEventListener('click', seguir);
$('bOtra').addEventListener('click', () => { $('pausa').classList.add('oculto'); empezar(false); });
$('bInicio').addEventListener('click', irAlInicio);
$('bOir').addEventListener('click', oir);
$('bVer').addEventListener('click', ver);
$('bPistaQ').addEventListener('click', pista);
$('bVela').addEventListener('click', vela);
$('bPiloto').addEventListener('click', piloto);
$('bSaltar').addEventListener('click', () => finPractica(true));
$('bOtraVuelta').addEventListener('click', () => { Snd.despertar(); empezar(false); });
$('bCambiar').addEventListener('click', irAlInicio);
// tocar la brújula: dice de dónde viene el viento (y en inglés, su palabra grabada)
$('bBrujula').addEventListener('click', () => { if (S.viento.oculto) { anunciar('Mira la flecha azul: sale de la nube que sopla.'); return; } anunciar('El viento viene del ' + nombreDir(S.viento.obj) + '.'); if (S.ingles) Voz.decir(nombreDir(S.viento.obj, true), { grupo: 'viento' }); });
document.addEventListener('visibilitychange', () => { if (document.hidden && S.fase !== 'menu' && S.fase !== 'fin' && !S.pausa) pausar(); });

/* ---------- teclado, toque y mando ---------- */
const GIRO = { arrowleft: 'l', a: 'l', arrowright: 'r', d: 'r' };
addEventListener('keydown', ev => {
  if (ev.ctrlKey || ev.metaKey || ev.altKey) return;
  const k = ev.key.toLowerCase();
  if (!$('pausa').classList.contains('oculto')) { if (k === 'escape') { ev.preventDefault(); seguir(); } return; }
  if (!$('inicio').classList.contains('oculto') || !$('final').classList.contains('oculto') || document.querySelector('.lj-capa')) return;
  if (S.fase === 'menu' || S.fase === 'fin') return;
  if (GIRO[k]) { ev.preventDefault(); teclas[GIRO[k]] = true; return; }
  if (k === ' ' || k === 'spacebar') { if (ev.target && ev.target.tagName === 'BUTTON') return; ev.preventDefault(); if (!ev.repeat) vela(); return; }
  if (/^[1-4]$/.test(k)) { ev.preventDefault(); elegir(+k - 1); return; }
  if (k === 'escape') { ev.preventDefault(); pausar(); return; }
  if (k === 'g') { piloto(); return; }
  if (k === 'o') { oir(); return; }
  if (k === 'v') { ver(); return; }
  if (k === 'p') { pista(); return; }
  if (k === 'm') { $('bSonido').click(); return; }
  if (k === 'c') { $('bCalma').click(); }
});
addEventListener('keyup', ev => { const e = GIRO[ev.key.toLowerCase()]; if (e) teclas[e] = false; });
addEventListener('blur', () => { teclas.l = teclas.r = false; toque.giro = 0; });
if (mundo) mundo.lienzo.addEventListener('pointerdown', ev => { if (S.fase !== 'navega' && S.fase !== 'cuenta') return; const i = mundo.tocar(ev.clientX, ev.clientY); if (i >= 0) elegir(i); });
document.querySelectorAll('[data-giro]').forEach(b => {
  const sg = +b.dataset.giro;
  const on = ev => { ev.preventDefault(); toque.giro = sg; b.classList.add('on'); $('timon').style.setProperty('--giro', (sg * 35) + 'deg'); try { b.setPointerCapture(ev.pointerId); } catch (e) { /* nada */ } };
  const off = () => { if (toque.giro === sg) { toque.giro = 0; $('timon').style.setProperty('--giro', '0deg'); } b.classList.remove('on'); };
  b.addEventListener('pointerdown', on); b.addEventListener('pointerup', off); b.addEventListener('pointercancel', off); b.addEventListener('lostpointercapture', off);
  b.addEventListener('contextmenu', ev => ev.preventDefault());
});

/* ---------- la sala: el inicio con todas las opciones ---------- */
const GRADOS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
const velaLibre = id => { const v = VELAS.find(x => x.id === id); return !!v && (LEC || (prefs.boyas || 0) >= v.desde); };
function boton(cont, txt, activo, alPulsar, extra) {
  const b = document.createElement('button'); b.type = 'button'; b.setAttribute('aria-pressed', String(!!activo));
  if (extra) extra(b); b.appendChild(document.createTextNode(txt));
  b.addEventListener('click', alPulsar); cont.appendChild(b); return b;
}
function armarInicio() {
  const oM = $('oMat'), oG = $('oGrado'), oT = $('oTema'), oA = $('oMar'), oV = $('oVelero'), oL = $('oVela');
  [oM, oG, oT, oA, oV, oL].forEach(c => { c.innerHTML = ''; });
  const re = (foco) => { prefs.sel = Object.assign({}, sel); guardar(); armarInicio(); if (foco) { const b = document.querySelector('#' + foco + ' [aria-pressed="true"]'); if (b) b.focus(); } };
  Object.keys(RC.MATERIAS).forEach(m => boton(oM, RC.MATERIAS[m].emoji + ' ' + RC.MATERIAS[m].nombre, sel.materia === m, () => { sel.materia = m; sel.tema = 'mezcla'; re('oMat'); }));
  GRADOS.forEach(g => boton(oG, g === 0 ? 'Transición' : g + '.º', sel.grado === g, () => { sel.grado = g; re('oGrado'); }, b => { b.className = 'grado'; }));
  const ts = RC.temas(sel.materia, sel.grado);
  if (!ts.some(t => t.id === sel.tema)) sel.tema = ts.length ? ts[0].id : 'mezcla';
  ts.forEach(t => boton(oT, t.emoji + ' ' + t.nombre, sel.tema === t.id, () => { sel.tema = t.id; re('oTema'); }));
  boton(oA, '🎲 Al azar', sel.mar === 'azar', () => { sel.mar = 'azar'; re('oMar'); });
  Object.keys(MARES).forEach(c => boton(oA, MARES[c].emoji + ' ' + MARES[c].nombre, sel.mar === c, () => { sel.mar = c; re('oMar'); }));
  VELEROS.forEach(a => boton(oV, a.emoji + ' ' + a.nombre, sel.velero === a.id, () => { sel.velero = a.id; re('oVelero'); if (mundo) mundo.veleros(sel.velero, sel.vela, false); }, b => { b.className = 'velero'; b.style.setProperty('--c', a.c); }));
  if (!velaLibre(sel.vela)) sel.vela = 'rayas';
  VELAS.forEach(v => {
    const libre = velaLibre(v.id);
    const b = boton(oL, (libre ? '' : '🔒 ') + v.nombre + (libre ? '' : ' (' + v.desde + ' boyas)'), sel.vela === v.id, () => { if (!libre) { anunciar('La vela ' + v.nombre + ' se gana con ' + v.desde + ' boyas buenas. Llevas ' + (prefs.boyas || 0) + '.'); return; } sel.vela = v.id; re('oVela'); if (mundo) mundo.veleros(sel.velero, sel.vela, false); }, x => { x.className = 'vela-d v-' + v.id; });
    if (!libre) b.setAttribute('aria-disabled', 'true');
  });
  $('oCalma').checked = S.calma;
  if ($('oPractica').dataset.tocado !== '1') $('oPractica').checked = !prefs.tuto;
  const rec = prefs.records[clave()], dif = modoDeGrado(sel.grado);
  $('tRecord').textContent = (rec ? 'Tu récord aquí: ' + rec.tiempo.toFixed(1).replace('.', ',') + ' s (' + rec.aciertos + ' de ' + rec.total + ' boyas). ' : '') + 'Boyas buenas: ' + (prefs.boyas || 0) + '. '
    + (dif === 'facil' ? 'En este grado el piloto y la vela van solos, y tienes pistas sin límite.' : dif === 'media' ? 'En este grado la vela la manejas tú, tienes 3 pistas y lo que falles vuelve de repaso.' : 'En este grado el viento cambia más, hay más tramos contra el viento y tienes 1 pista.');
}
$('oCalma').addEventListener('change', ev => ponerCalma(ev.target.checked));
$('oPractica').addEventListener('change', () => { $('oPractica').dataset.tocado = '1'; });
$('bZarpar').addEventListener('click', () => { Snd.despertar(); empezar($('oPractica').checked); });
function irAlInicio() {
  S.fase = 'menu'; S.pausa = false; Snd.parar(); Voz.callar(); ocultarConsejo();
  ['pausa', 'final', 'carta', 'ops', 'hud', 'mando', 'estado'].forEach(id => $(id).classList.add('oculto')); mostrarCuenta('');
  if (mundo) { mundo.quitarBoyas(); mundo.puerta('meta', null); mundo.puerta('salida', null); mundo.veleros(sel.velero, sel.vela, false); }
  S.rivales = []; S.ruta = null; S.islas = []; if (mundo) mundo.islas([]);
  S.viento = { desde: 0, obj: 0, oculto: false }; S.yo = nuevoBarco(S.yo.x, S.yo.z, 90); S.yo.velaSola = true; S.yo.k = 0.45;
  armarInicio(); $('inicio').classList.remove('oculto'); $('bZarpar').focus({ preventScroll: true });
}

/* ---------- arrancar ---------- */
function listo() {
  $('cargando').classList.add('oculto');
  // de fondo, mientras se elige: el mar y tu velero navegando solo de lado al viento
  S.mar = LEC && LEC.mar ? LEC.mar : MARES[sel.mar] ? sel.mar : 'caribe';
  S.viento = { desde: 0, obj: 0, oculto: false };
  S.yo = nuevoBarco(0, 0, 90); S.yo.velaSola = true; S.yo.k = 0.45;
  if (mundo) { mundo.mar(S.mar); mundo.veleros(S.modo === 'leccion' ? 'delfin' : sel.velero, S.modo === 'leccion' ? 'rayas' : (velaLibre(sel.vela) ? sel.vela : 'rayas'), false); }
  S.fase = 'menu';
  if (!mundo) anunciar('Este equipo no muestra 3D: elige la boya con sus botones de abajo y el piloto te lleva.');
  if (S.modo === 'leccion') {
    const chips = LEC.palabras.length ? LEC.palabras.slice(0, 12).map(w => (w.emoji ? w.emoji + ' ' : '') + w.en) : [];
    LJ.portada({ juego: 'Regata del Viento', titulo: LEC.titulo || 'Navega con lo de la lección',
      detalle: 'Navega hasta la boya de la respuesta correcta. Contra el viento no se avanza: ve en zigzag. Elige con 1, 2, 3 o tocando la boya, y el piloto te lleva.',
      chips, chipsRotulo: 'Las palabras de la lección', alJugar: () => { Snd.despertar(); empezar(!S.practicado); } });
  } else { armarInicio(); $('inicio').classList.remove('oculto'); $('bZarpar').focus({ preventScroll: true }); }
  requestAnimationFrame(bucle);
}
// en el menú, el velero navega solo hacia el este entre islas que se reciclan por delante
function islasMenu() {
  const yo = S.yo; let cambio = false;
  if (!S.islas.length) { for (let i = 0; i < 6; i++) S.islas.push({ x: yo.x + 30 + i * 55, z: yo.z + (i % 2 ? 1 : -1) * azar(22, 36), r: azar(5, 8), tipo: pick((MARES[S.mar] || MARES.caribe).islas || ['arena']) }); cambio = true; }
  S.islas.forEach(i => { if (yo.x - i.x > 70) { i.x += 330; i.z = yo.z + (Math.random() < 0.5 ? 1 : -1) * azar(22, 36); cambio = true; } });
  if (cambio && mundo) mundo.islas(S.islas);
}
const fuentes = document.fonts && document.fonts.load ? Promise.all([document.fonts.load('800 32px "Baloo 2"'), document.fonts.ready]).catch(() => {}) : Promise.resolve();
Promise.race([Promise.all([Voz.listo, fuentes]), new Promise(r => setTimeout(r, 2500))]).then(listo);

window.__regata = { estado: S, elegir, correcta: () => (S.tr && S.tr.q ? S.tr.q.correcta : -1), empezar, saltar: () => finPractica(true), vitrina: a => mundo && mundo.vitrina(a),
  velero: (id, v) => { if (mundo) mundo.veleros(id, v, false); }, salto: k => mundo && mundo.salto(k), teletransportar: (x, z) => { S.yo.x = x; S.yo.z = z; } };
})();
