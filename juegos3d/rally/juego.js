/* Rally de los Aros — el juego: la sala (materia, grado, tema, cielo y avioneta), el modo lección (../leccion.js), el
   vuelo, los aros, las avionetas rivales, el fantasma de tu mejor vuelo, el sonido sintetizado y la voz en inglés.
   - Cada tramo: la pregunta arriba y un aro por opción delante (número, forma, color y texto). Se vuela con flechas o
     W A S D, o con 1 a 4 (o tocando el aro o su botón) y el avión va solo. El aro bueno da turbo y estela; tres
     seguidos, el chorro de viento. El malo no castiga: se sacude, sale «Era: …» y sigue. Sin pasar por ningún aro, el
     mismo tramo vuelve a salir.
   - Modo calma (y «reducir movimiento»): sin rivales ni reloj, el avión espera delante de cada aro hasta que elijas.
   - Inglés: sólo los MP3 grabados de la Biblioteca (<voz>/en/<slug>.mp3 si el slug está en <voz>/en/index.json, o la
     carpeta de `voces`). Sin MP3: silencio y la palabra escrita. Jamás speechSynthesis.
   - Progreso (sala): localStorage juegos3d.rally {sel, calma, mudo, records: {clave: {tiempo, aciertos, total, m}}}
     (m: el fantasma, [s, x, y] cada 0,2 s). puente.js lo separa por usuario. En modo lección no se guarda nada: el
     fantasma es el de tu mejor vuelo de la sesión, y al final se avisa a la lección.
   Depuración: window.__rally (estado, elegir(i), correcta(), empezar()). */
(function () {
'use strict';
const $ = id => document.getElementById(id);
const LJ = window.LeccionJuego, RC = window.RallyContenido, MW = window.Mundo || {};
const CLAVE = 'juegos3d.rally';
const leer = () => { try { return JSON.parse(localStorage.getItem(CLAVE)) || {}; } catch (e) { return {}; } };
const prefs = leer(); if (!prefs.records || typeof prefs.records !== 'object') prefs.records = {};
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const pick = a => a[Math.floor(Math.random() * a.length)];
const barajar = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const BIBLIO = /^(localhost|127\.0\.0\.1)$/.test(location.hostname) ? 'http://localhost:8765/' : 'https://biblioteca.micolevirtual.com/';
const reducir = matchMedia('(prefers-reduced-motion: reduce)').matches;
const tactil = matchMedia('(pointer: coarse)').matches;
const CIELOS = MW.CIELOS || { sierra: { nombre: 'Sierra Nevada', emoji: '🏔️' } };
const AVIONETAS = MW.AVIONETAS || [{ id: 'condor', nombre: 'Cóndor', c: '#d9480f' }];
const AROS = MW.AROS || [{ color: '#d9480f', forma: 'círculo', glifo: '●' }, { color: '#1971c2', forma: 'triángulo', glifo: '▲' }, { color: '#2b8a3e', forma: 'cuadrado', glifo: '■' }, { color: '#7048e8', forma: 'rombo', glifo: '◆' }];
const partir = MW.partir || (t => ({ emoji: '', texto: String(t) }));
const V0 = 15;

/* ---------- modo lección: lo que manda la lección (FORMATO.md §3.9) ---------- */
const CFG = LJ && LJ.activo && LJ.cfg ? LJ.cfg : null;
const LEC = (() => {
  if (!CFG) return null;
  const preguntas = (Array.isArray(CFG.preguntas) ? CFG.preguntas : []).filter(q => q && typeof q.p === 'string' && q.p.trim() && Array.isArray(q.opciones)
    && q.opciones.length >= 2 && q.opciones.length <= 4 && q.opciones.every(o => (typeof o === 'string' && o.trim()) || typeof o === 'number') && Number.isInteger(q.correcta) && q.correcta >= 0 && q.correcta < q.opciones.length)
    .map(q => {
      const p = q.p.trim(), oir = typeof q.oir === 'string' ? q.oir.trim() : '';
      // con `oir` y sin la palabra escrita en el enunciado: se oye (la bocina) y se puede pedir verla
      const escucha = !!oir && p.toLowerCase().indexOf(oir.toLowerCase()) < 0;
      return { p, opciones: q.opciones.map(o => String(o).trim()), correcta: q.correcta, oir, escucha, palabra: escucha ? oir : '', opEn: false };
    });
  const palabras = (Array.isArray(CFG.palabras) ? CFG.palabras : []).filter(p => p && typeof p.en === 'string' && p.en.trim() && typeof p.es === 'string' && p.es.trim())
    .map(p => ({ en: p.en.trim(), es: p.es.trim(), emoji: typeof p.emoji === 'string' ? p.emoji.trim() : '' }));
  if (!preguntas.length && palabras.length < 2) { console.warn('[rally] la lección no mandó preguntas ni palabras: va la sala'); return null; }
  return { titulo: (LJ.titulo || '').trim(), preguntas, palabras, cielo: CIELOS[CFG.cielo] ? CFG.cielo : null };
})();
const guardar = () => { if (LEC) return; try { localStorage.setItem(CLAVE, JSON.stringify(prefs)); } catch (e) { /* sin almacenamiento */ } };

// La dificultad (FORMATO.md §3.9.1). Aquí nunca se pierde: lo que cambia es la ayuda y los rivales.
// facil: aros que «atraen», más grandes de pasar, tramos largos, pista sin límite, el fallo no frena y vuelve de repaso;
// media: algo de imán, 3 pistas, el fallo no frena y vuelve de repaso; normal: sin imán, 1 pista y el fallo frena un poco.
function params(modo) {
  return {
    modo,
    captura: modo === 'facil' ? 4.6 : modo === 'media' ? 3.9 : 3.3,
    iman: modo === 'facil' ? 1.1 : modo === 'media' ? 0.55 : 0,
    D: modo === 'facil' ? 100 : modo === 'media' ? 88 : 78,
    rival: modo === 'facil' ? [0.7, 0.78, 0.86] : modo === 'media' ? [0.8, 0.88, 0.97] : [0.88, 0.97, 1.06],
    lento: modo === 'normal', repaso: modo !== 'normal',
    pistas: modo === 'facil' ? Infinity : modo === 'media' ? 3 : 1,
    lateral: modo === 'facil' ? 13 : 11.5
  };
}
const modoDeGrado = g => (g <= 2 ? 'facil' : g <= 5 ? 'media' : 'normal');
const VOZ = (() => { const v = CFG && typeof CFG.voz === 'string' && CFG.voz.trim() ? CFG.voz.trim() : BIBLIO + 'voz/'; return /\/$/.test(v) ? v : v + '/'; })();

/* ---------- sonido (sintetizado, 0 KB) ---------- */
const Snd = (() => {
  let ctx = null, mudo = !!prefs.mudo, motor = null;
  const ac = () => { if (!ctx) { const A = window.AudioContext || window.webkitAudioContext; if (A) ctx = new A(); } if (ctx && ctx.state === 'suspended') ctx.resume(); return ctx; };
  function tono(f, t, dur, tipo, vol, f2) {
    const c = mudo ? null : ac(); if (!c) return;
    const o = c.createOscillator(), g = c.createGain(), t0 = c.currentTime + t;
    o.type = tipo || 'sine'; o.frequency.setValueAtTime(f, t0); if (f2) o.frequency.exponentialRampToValueAtTime(f2, t0 + dur);
    g.gain.setValueAtTime(0.0001, t0); g.gain.exponentialRampToValueAtTime(vol || 0.1, t0 + 0.015); g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    o.connect(g); g.connect(c.destination); o.start(t0); o.stop(t0 + dur + 0.05);
  }
  function soplo(dur, vol, f0, f1) {
    const c = mudo ? null : ac(); if (!c) return;
    const n = Math.floor(c.sampleRate * dur), b = c.createBuffer(1, n, c.sampleRate), d = b.getChannelData(0);
    for (let i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / n);
    const s = c.createBufferSource(), f = c.createBiquadFilter(), g = c.createGain(), t0 = c.currentTime;
    s.buffer = b; f.type = 'bandpass'; f.Q.value = 1.2; f.frequency.setValueAtTime(f0, t0); f.frequency.exponentialRampToValueAtTime(f1, t0 + dur);
    g.gain.value = vol; s.connect(f); f.connect(g); g.connect(c.destination); s.start(t0);
  }
  function pararMotor() { if (motor) { try { motor.o.stop(); } catch (e) { /* ya paró */ } motor = null; } }
  return {
    get mudo() { return mudo; }, set mudo(v) { mudo = !!v; if (mudo) pararMotor(); },
    despertar() { if (!mudo) ac(); },
    bien() { tono(660, 0, 0.12, 'triangle', 0.16); tono(880, 0.09, 0.12, 'triangle', 0.16); tono(1320, 0.18, 0.22, 'triangle', 0.14); },
    mal() { tono(260, 0, 0.16, 'square', 0.05); tono(196, 0.14, 0.24, 'square', 0.05); },
    nada() { tono(440, 0, 0.14, 'sine', 0.08, 330); },
    turbo() { soplo(0.45, 0.12, 300, 2200); },
    chorro() { soplo(0.9, 0.16, 250, 3200); tono(523, 0, 0.12, 'triangle', 0.12); tono(784, 0.1, 0.12, 'triangle', 0.12); tono(1047, 0.2, 0.3, 'triangle', 0.12); },
    cuenta(fin) { tono(fin ? 880 : 440, 0, fin ? 0.4 : 0.16, 'square', 0.07); },
    meta() { [523, 659, 784, 1047, 1319].forEach((f, i) => tono(f, i * 0.12, 0.28, 'triangle', 0.14)); },
    clic() { tono(990, 0, 0.05, 'sine', 0.06); },
    motor(v, calma) {
      const c = mudo ? null : (ctx && ctx.state === 'running' ? ctx : null); if (!c) return;
      if (!motor) {
        const o = c.createOscillator(), f = c.createBiquadFilter(), g = c.createGain();
        o.type = 'sawtooth'; f.type = 'lowpass'; f.frequency.value = 380; g.gain.value = 0;
        o.connect(f); f.connect(g); g.connect(c.destination); o.start(); motor = { o, g };
      }
      motor.o.frequency.setTargetAtTime(55 + v * 2.4, c.currentTime, 0.2);
      motor.g.gain.setTargetAtTime(v > 0.5 ? (calma ? 0.008 : 0.016) : 0, c.currentTime, 0.3);
    },
    parar: pararMotor
  };
})();

/* ---------- la voz en inglés: sólo MP3 grabados ---------- */
const Voz = (() => {
  let lista = null, audio = null, n = 0;
  const listo = fetch(VOZ + 'en/index.json', { credentials: 'omit' }).then(r => (r.ok ? r.json() : [])).then(a => { lista = new Set(Array.isArray(a) ? a : []); })
    .catch(() => { lista = new Set(); });
  // nombreDelAudio de app2 (voz-grabada.ts): minúsculas, lo que no es letra o número → «-»; más de 200, 80 letras + FNV-1a
  function slug(t) {
    t = partir(String(t)).texto || String(t); // «🐶 dog» → dog (el emoji de delante no se graba)
    const s = String(t).trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
    if (s.length <= 200) return s;
    let h = 0x811c9dc5; for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 0x01000193) >>> 0;
    return s.slice(0, 80) + '-' + h.toString(16).padStart(8, '0');
  }
  const voces = CFG && CFG.voces && typeof CFG.voces === 'object' ? CFG.voces : {};
  const carpeta = s => (typeof voces[s] === 'string' && /^[a-z-]+$/.test(voces[s]) ? voces[s] : null);
  const tiene = t => { if (t == null || !String(t).trim()) return false; const s = slug(t); return !!s && (!!carpeta(s) || !!(lista && lista.has(s))); };
  // la cola de voz de leccion.js (también en la sala): un MP3 nunca corta a otro, lo nuevo espera su turno
  const cola = LJ && LJ.cola && typeof LJ.cola.poner === 'function' ? LJ.cola : null;
  function callar() { if (cola) cola.callar(); n++; if (audio) { audio.onended = audio.onerror = null; audio.pause(); audio = null; } }
  /** Pone en la cola el MP3 de `texto` (si está grabado y el sonido está encendido). Devuelve true si va a sonar.
   *  opc: grupo (lo nuevo del grupo reemplaza a lo que de él aún espera), vigente () → bool, caduca (ms). */
  function decir(texto, opc) {
    if (Snd.mudo || !tiene(texto)) return false;
    opc = opc || {};
    const s = slug(texto), dirs = [carpeta(s), lista && lista.has(s) ? 'en' : null].filter((d, i, a) => d && a.indexOf(d) === i);
    const urls = dirs.map(d => VOZ + d + '/' + s + '.mp3');
    if (cola) {
      const vig = opc.vigente;
      cola.poner({ urls, clave: 'rally:' + s, grupo: opc.grupo, caduca: opc.caduca || 4000, vigente: () => !Snd.mudo && !S.pausa && (!vig || vig()) });
      return true;
    }
    // sin leccion.js: el de antes (uno a la vez)
    n++; if (audio) { audio.onended = audio.onerror = null; audio.pause(); audio = null; }
    const mio = n;
    const probar = j => {
      if (mio !== n || j >= urls.length) return;
      const a = new Audio(urls[j]); audio = a;
      a.onended = () => { if (audio === a) audio = null; };
      a.onerror = () => probar(j + 1);
      a.play().catch(() => {});
    };
    probar(0);
    return true;
  }
  return { listo, tiene, decir, callar };
})();

/* ---------- estado ---------- */
const sel = Object.assign({ materia: 'ingles', grado: 3, tema: 'mezcla', cielo: 'azar', avion: 'condor' }, prefs.sel || {});
const S = {
  modo: LEC ? 'leccion' : 'sala', fase: 'menu', pausa: false,
  calma: LEC ? reducir : (typeof prefs.calma === 'boolean' ? prefs.calma : reducir),
  P: params('normal'), cola: [], total: 0, hechas: 0, aciertos: 0, fallos: 0, racha: 0, mejorRacha: 0, repasar: [],
  yo: null, aro: null, auto: -1, espera: 0, rivales: [], t: 0, metaS: null, cielo: 'sierra', avion: 'condor',
  pistas: 0, fantasma: null, grab: [], mejorSesion: null, cuenta: 0, nombresRiv: []
};
let mundo = null;
try { if (MW.disponible) mundo = MW.crear($('gl'), { biblio: BIBLIO, calma: S.calma }); } catch (e) { console.warn('Rally: sin 3D (' + e.message + ')'); mundo = null; }

const clave = () => sel.materia + '|' + sel.tema + '|' + sel.grado;
const texto = (q, i) => q.opciones[i];
const rotuloOp = (q, i) => (i + 1) + ' ' + AROS[i].glifo + ' ' + texto(q, i);

/* ---------- las preguntas de esta partida ---------- */
function armarCola() {
  if (S.modo === 'leccion') {
    // las preguntas del cfg no dicen si sus opciones son inglés: lo son si la mayoría tiene su MP3 grabado en inglés
    // o es una palabra `en` de la lección (y no su `es`); las de sólo números, no
    const en = new Set(LEC.palabras.map(w => w.en.toLowerCase())), es = new Set(LEC.palabras.map(w => w.es.toLowerCase()));
    const ingles = o => { const t = partir(o).texto.trim().toLowerCase(); return /[a-z]/.test(t) && !es.has(t) && (en.has(t) || Voz.tiene(o)); };
    LEC.preguntas.forEach(q => { q.opEn = q.opciones.filter(ingles).length >= Math.ceil(q.opciones.length / 2); });
    let qs = LEC.preguntas.slice();
    if (LEC.palabras.length >= 2) qs = qs.concat(RC.dePalabras(LEC.palabras, LEC.palabras.length, { tiene: Voz.tiene, modo: S.P.modo }));
    qs = barajar(qs);
    if (qs.length > 12) qs = qs.slice(0, 12);
    return qs.map(q => ({ q, repaso: false }));
  }
  const n = sel.grado <= 1 ? 8 : 10;
  return RC.generar(sel.materia, sel.tema, sel.grado, n, { tiene: Voz.tiene, modo: S.P.modo }).map(q => ({ q, repaso: false }));
}
// la misma pregunta con las opciones en otro orden (para el repaso: que no se aprenda el sitio)
function reordenar(q) {
  const idx = barajar(q.opciones.map((_, i) => i));
  return Object.assign({}, q, { opciones: idx.map(i => q.opciones[i]), correcta: idx.indexOf(q.correcta) });
}

/* ---------- empezar ---------- */
function empezar() {
  const modo = S.modo === 'leccion' ? (LJ.dificultad || 'normal') : modoDeGrado(sel.grado);
  S.P = params(modo);
  S.cola = armarCola();
  if (!S.cola.length) { anunciar('No hay preguntas para este tema.'); return; }
  S.total = S.cola.length; S.hechas = 0; S.aciertos = 0; S.fallos = 0; S.racha = 0; S.mejorRacha = 0; S.repasar = [];
  S.pistas = S.P.pistas; S.t = 0; S.metaS = null; S.auto = -1; S.espera = 0; S.pausa = false; S.grab = [];
  S.yo = { s: 0, x: 0, y: 7, vx: 0, vy: 0, v: 0, turbo: 0, chorro: 0, lento: 0, banco: 0, cabeceo: 0 };
  S.cielo = S.modo === 'leccion' ? (LEC.cielo || pick(Object.keys(CIELOS))) : (CIELOS[sel.cielo] ? sel.cielo : pick(Object.keys(CIELOS)));
  S.avion = S.modo === 'leccion' ? 'condor' : sel.avion;
  const conRivales = !S.calma;
  if (mundo) { mundo.cielo(S.cielo, 0); S.nombresRiv = mundo.avionetas(S.avion, conRivales); mundo.meta(null); mundo.calma(S.calma); }
  else S.nombresRiv = conRivales ? AVIONETAS.filter(a => a.id !== S.avion) : [];
  const lanes = [[-9, 6], [9, 3], [-5, -16]]; // uno sale detrás (no se ve): vas 3.º al empezar
  S.rivales = conRivales ? S.P.rival.map((k, i) => ({ k, s: lanes[i][1], bx: lanes[i][0], x: lanes[i][0], y: 7, fase: i * 2.1, fin: null, banco: 0 })) : [];
  // el fantasma: tu mejor vuelo (sala: guardado por tema y grado; lección: el de esta sesión)
  const rec = S.modo === 'sala' ? prefs.records[clave()] : S.mejorSesion;
  S.fantasma = !S.calma && rec && Array.isArray(rec.m) && rec.m.length > 5 ? rec.m : null;
  document.body.classList.toggle('calmo', S.calma);
  ['inicio', 'pausa', 'final'].forEach(id => $(id).classList.add('oculto'));
  $('hud').classList.remove('oculto'); $('hPista').classList.toggle('oculto', !S.rivales.length);
  $('mando').classList.toggle('oculto', !tactil);
  nuevoTramo(40);
  // la cuenta: 3, 2, 1, ¡ya! (la primera pregunta ya se ve)
  S.fase = 'cuenta'; S.cuenta = 3.2; mostrarCuenta('3'); Snd.cuenta(false);
  hud();
}
function mostrarCuenta(t) { const c = $('cuenta'); c.textContent = t; c.classList.toggle('oculto', !t); }

/* ---------- los tramos ---------- */
function largoTramo(q) { return S.P.D + Math.min(40, (q.p.length + q.opciones.join('').length) * 0.35); }
function colocar(n) {
  const est = mundo && mundo.estrecho();
  const sep = est ? 6.4 : n === 4 ? 7.6 : n === 2 ? 9 : 8.6;
  const amp = S.calma || S.P.modo === 'facil' ? 1 : 2.4, patron = pick(['plano', 'arco', 'valle', 'sube', 'baja']);
  return Array.from({ length: n }, (_, i) => {
    const u = n > 1 ? i / (n - 1) : 0.5, m = 1 - Math.abs(u - 0.5) * 2;
    const dy = patron === 'arco' ? amp * m : patron === 'valle' ? -amp * m : patron === 'sube' ? amp * (u - 0.5) * 2 : patron === 'baja' ? -amp * (u - 0.5) * 2 : 0;
    return { x: (i - (n - 1) / 2) * sep, y: 8 + dy };
  });
}
function nuevoTramo(extra) {
  const it = S.cola.shift();
  S.auto = -1;
  if (!it) { aLaMeta(); return; }
  const q = it.q, s = S.yo.s + largoTramo(q) + (extra || 0);
  S.aro = { s, q, repaso: it.repaso, centros: colocar(q.opciones.length), tapados: new Set(), visto: !q.escucha, pista: false, pasos: 0 };
  ponerAros();
  pintarCarta();
  if (q.oir) setTimeout(() => { if (S.aro && S.aro.q === q) oir(); }, 450);
  anunciar((it.repaso ? 'Repaso. ' : 'Aro ' + (S.hechas + 1) + ' de ' + S.total + '. ') + q.p + ' ' + q.opciones.map((o, i) => 'Aro ' + (i + 1) + ', ' + AROS[i].forma + ': ' + o).join('. ') + '.');
}
function ponerAros() {
  const a = S.aro;
  if (mundo) { mundo.aros(a.s, a.centros.map((c, i) => ({ x: c.x, y: c.y, texto: texto(a.q, i) })), mundo.estrecho() ? 0.8 : 1); a.tapados.forEach(i => mundo.marcar(i, 'tapado')); }
}
function aLaMeta() {
  S.aro = null; S.metaS = S.yo.s + 90;
  if (mundo) { mundo.quitarAros(); mundo.meta(S.metaS); }
  $('ops').classList.add('oculto');
  $('cPreg').textContent = '🏁 ¡A la meta!'; $('cPreg').classList.add('grande'); $('cPalabra').classList.add('oculto');
  ['bOir', 'bVer', 'bPistaQ'].forEach(id => $(id).classList.add('oculto'));
  anunciar('¡Todos los aros! Vuela a la meta.');
}

/* ---------- la carta y los botones de los aros ---------- */
function pintarCarta() {
  const a = S.aro, q = a.q;
  $('carta').classList.remove('oculto');
  $('cPreg').textContent = q.p; $('cPreg').classList.toggle('grande', q.p.length <= 16);
  $('cFeed').textContent = ''; $('cFeed').className = 'feed';
  // la bocina: sin MP3 o con el sonido apagado, la palabra se ve
  if (q.escucha && (!Voz.tiene(q.oir) || Snd.mudo)) a.visto = true;
  const pw = $('cPalabra'); pw.textContent = q.palabra ? '«' + q.palabra + '»' : ''; pw.classList.toggle('oculto', !(q.escucha && a.visto && q.palabra));
  $('bOir').classList.toggle('oculto', !q.oir || !Voz.tiene(q.oir));
  $('bVer').classList.toggle('oculto', !q.escucha || a.visto);
  pintarPista();
  const ops = $('ops'); ops.innerHTML = ''; ops.classList.remove('oculto');
  q.opciones.forEach((o, i) => {
    const b = document.createElement('button'); b.type = 'button'; b.className = 'elegir'; b.style.setProperty('--c', AROS[i].color);
    b.setAttribute('aria-pressed', 'false'); b.setAttribute('aria-label', 'Aro ' + (i + 1) + ', ' + AROS[i].forma + ': ' + o);
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
  const a = S.aro, b = $('bPistaQ');
  const puede = a && !a.pista && S.pistas > 0 && a.q.opciones.length - a.tapados.size > 2 && S.espera <= 0;
  b.classList.toggle('oculto', !puede);
  $('nPista').textContent = S.pistas === Infinity ? '(P)' : '(P) · ' + S.pistas;
}
function botones() { return [...$('ops').querySelectorAll('.elegir')]; }
function elegir(i) {
  const a = S.aro;
  if (!a || S.espera > 0 || S.fase === 'fin' || S.pausa || i < 0 || i >= a.q.opciones.length || a.tapados.has(i)) return;
  if (S.auto >= 0 && mundo) mundo.marcar(S.auto, '');
  S.auto = i;
  if (mundo) mundo.marcar(i, 'elegido');
  botones().forEach((b, k) => b.setAttribute('aria-pressed', String(k === i)));
  Snd.clic();
  if (a.q.opEn) Voz.decir(a.q.opciones[i], { grupo: 'opcion', vigente: () => S.aro === a });
  anunciar('Vas al aro ' + (i + 1) + ': ' + a.q.opciones[i]);
}
function oir() { const a = S.aro; if (a && a.q.oir) Voz.decir(a.q.oir, { grupo: 'oir', vigente: () => S.aro === a }); }
function ver() { const a = S.aro; if (!a || !a.q.escucha || a.visto) return; a.visto = true; $('cPalabra').classList.remove('oculto'); $('bVer').classList.add('oculto'); anunciar('La palabra: ' + a.q.palabra); }
function pista() {
  const a = S.aro; if (!a || a.pista || S.pistas <= 0 || S.espera > 0) return;
  const malas = a.q.opciones.map((_, i) => i).filter(i => i !== a.q.correcta && !a.tapados.has(i));
  if (malas.length < 2 && a.q.opciones.length - a.tapados.size <= 2) return;
  const i = pick(malas); a.tapados.add(i); a.pista = true; S.pistas--;
  if (S.auto === i) S.auto = -1;
  if (mundo) mundo.marcar(i, 'tapado');
  const b = botones()[i]; if (b) { b.classList.add('tapado'); b.disabled = true; }
  pintarPista(); anunciar('Pista: el aro ' + (i + 1) + ' no es.');
}

/* ---------- pasar por un aro ---------- */
function cruzar() {
  const a = S.aro, yo = S.yo;
  let k = -1, d = 1e9;
  a.centros.forEach((c, i) => { if (a.tapados.has(i)) return; const e = Math.hypot(c.x - yo.x, c.y - yo.y); if (e < d) { d = e; k = i; } });
  if (k >= 0 && d <= S.P.captura) resolver(k); else sinAro();
}
function resolver(i) {
  const a = S.aro, q = a.q, bien = i === q.correcta, yo = S.yo, c = a.centros[i];
  botones().forEach((b, k) => { b.disabled = true; if (k === q.correcta) b.classList.add('bien'); else if (k === i) b.classList.add('mal'); });
  const f = $('cFeed');
  if (bien) {
    if (!a.repaso) S.aciertos++;
    S.racha++; S.mejorRacha = Math.max(S.mejorRacha, S.racha);
    yo.turbo = 2.2;
    if (mundo) { mundo.marcar(i, 'bien'); mundo.estallar(c.x, c.y, a.s, AROS[i].color); }
    if (S.racha % 3 === 0) { yo.chorro = 4; Snd.chorro(); f.textContent = '¡Chorro de viento! ' + S.racha + ' seguidos 🌬️'; }
    else { Snd.bien(); Snd.turbo(); f.textContent = '¡Bien! ' + texto(q, i) + ' · ¡turbo!'; }
    f.className = 'feed bien';
    if (q.opEn) Voz.decir(q.opciones[i], { grupo: 'aro' });
    else if (q.escucha && q.palabra) { a.visto = true; $('cPalabra').classList.remove('oculto'); }
  } else {
    if (!a.repaso) {
      S.fallos++; S.repasar.push(q);
      if (S.P.repaso) S.cola.splice(Math.min(2, S.cola.length), 0, { q: reordenar(q), repaso: true });
    }
    S.racha = 0;
    if (S.P.lento) yo.lento = 1.4;
    S.sacudir = true;
    if (mundo) { mundo.marcar(i, 'mal'); mundo.marcar(q.correcta, 'era'); }
    Snd.mal();
    f.textContent = 'Era: ' + rotuloOp(q, q.correcta) + (q.palabra ? ' («' + q.palabra + '»)' : '') + (S.P.repaso && !a.repaso ? ' · Vuelve más adelante.' : '');
    f.className = 'feed mal';
    if (q.opEn) Voz.decir(q.opciones[q.correcta], { grupo: 'aro' }); else if (q.oir) Voz.decir(q.oir, { grupo: 'aro' });
    if (q.escucha && q.palabra) { a.visto = true; $('cPalabra').classList.remove('oculto'); }
  }
  $('bVer').classList.add('oculto'); $('bPistaQ').classList.add('oculto');
  if (!a.repaso) S.hechas++;
  anunciar(f.textContent);
  avisarLeccion(false);
  S.espera = S.calma ? 1.8 : 1.3;
  if (mundo) mundo.pasados();
  S.aroHecho = a; S.aro = null; S.auto = -1;
}
function sinAro() {
  const a = S.aro;
  a.pasos++;
  Snd.nada();
  a.s = S.yo.s + S.P.D * 0.75; a.centros = colocar(a.q.opciones.length);
  S.auto = -1;
  botones().forEach(b => b.setAttribute('aria-pressed', 'false'));
  ponerAros();
  const f = $('cFeed'); f.className = 'feed nada';
  f.textContent = tactil ? '¡Pasa por dentro de un aro! Toca un aro o su botón y el avión va solo.' : '¡Pasa por dentro de un aro! Pulsa 1, 2' + (a.q.opciones.length > 2 ? ', 3' : '') + (a.q.opciones.length > 3 ? ' o 4' : '') + ' y el avión va solo.';
  anunciar(f.textContent);
}

/* ---------- el vuelo ---------- */
const teclas = { x: 0, y: 0, l: false, r: false, u: false, d: false };
const toque = { x: 0, y: 0 };
function mover(dt) {
  const P = S.P, yo = S.yo, a = S.aro;
  const ix = clamp((teclas.r ? 1 : 0) - (teclas.l ? 1 : 0) + toque.x, -1, 1), iy = clamp((teclas.u ? 1 : 0) - (teclas.d ? 1 : 0) + toque.y, -1, 1);
  if ((ix || iy) && S.auto >= 0) { if (mundo) mundo.marcar(S.auto, ''); S.auto = -1; botones().forEach(b => b.setAttribute('aria-pressed', 'false')); }
  let tvx = ix * P.lateral, tvy = iy * P.lateral * 0.75;
  if (a && S.auto >= 0) {
    const c = a.centros[S.auto], falta = Math.max(0.35, Math.min(0.9, (a.s - yo.s) / Math.max(yo.v, 6)));
    tvx = clamp((c.x - yo.x) / falta, -P.lateral * 1.4, P.lateral * 1.4); tvy = clamp((c.y - yo.y) / falta, -P.lateral, P.lateral);
  } else if (a && P.iman && !ix && !iy && a.s - yo.s < 35) {
    // el imán: si vas cerca de un aro, te lleva hacia su centro
    let k = -1, d = 1e9; a.centros.forEach((c, i) => { if (a.tapados.has(i)) return; const e = Math.hypot(c.x - yo.x, c.y - yo.y); if (e < d) { d = e; k = i; } });
    if (k >= 0 && d < P.captura * 1.8) { const c = a.centros[k]; tvx = (c.x - yo.x) * P.iman * 2; tvy = (c.y - yo.y) * P.iman * 2; }
  }
  yo.vx += (tvx - yo.vx) * Math.min(1, dt * 6); yo.vy += (tvy - yo.vy) * Math.min(1, dt * 6);
  yo.x = clamp(yo.x + yo.vx * dt, -15, 15); yo.y = clamp(yo.y + yo.vy * dt, 3, 14.5);
  yo.banco = clamp(yo.vx / 12, -1, 1); yo.cabeceo = clamp(yo.vy / 10, -1, 1);
  let obj = V0 * (yo.turbo > 0 ? 1.45 : 1) * (yo.chorro > 0 ? 1.75 : 1) * (yo.lento > 0 ? 0.65 : 1);
  if (S.calma && a && a.s - yo.s < 26 && S.auto < 0) obj = ix || iy ? 3 : 0; // calma: espera delante del aro
  if (S.fase === 'cuenta') obj = 0;
  yo.v += (obj - yo.v) * Math.min(1, dt * (obj < yo.v ? 3 : 1.8));
  yo.s += yo.v * dt;
  yo.turbo = Math.max(0, yo.turbo - dt); yo.chorro = Math.max(0, yo.chorro - dt); yo.lento = Math.max(0, yo.lento - dt);
}
function metaPrevista() {
  if (S.metaS != null) return S.metaS;
  const base = S.aro ? S.aro.s : S.yo.s;
  return base + S.cola.reduce((t, it) => t + largoTramo(it.q), 0) + 90;
}
function moverRivales(dt) {
  if (S.fase === 'cuenta') return;
  const m = metaPrevista();
  S.rivales.forEach(r => {
    const v = r.k * V0 * (1 + clamp((S.yo.s - r.s) / 250, -0.15, 0.12));
    r.s += v * dt;
    let x = r.bx + Math.sin(S.t * 0.45 + r.fase) * 5, y = 8 + Math.sin(S.t * 0.6 + r.fase) * 3;
    // cerca de ti se abre a un lado y sube: que no tape la cámara ni los aros
    const cerca = clamp(1 - Math.abs(r.s - S.yo.s) / 16, 0, 1);
    if (cerca > 0) { const lado = x >= S.yo.x ? 1 : -1; x += lado * cerca * Math.max(0, 9 - Math.abs(x - S.yo.x)); y += cerca * 3; }
    r.banco = clamp((x - r.x) / dt / 12, -1, 1); r.x = x; r.y = y;
    if (r.fin == null && r.s >= m) r.fin = S.t;
  });
}
function puesto() { return 1 + S.rivales.filter(r => r.fin != null || r.s > S.yo.s).length; }
function fantasmaEn(t) {
  const m = S.fantasma; if (!m) return null;
  const f = t / 0.2, i = Math.floor(f); if (i >= m.length - 1) return null;
  const a = m[i], b = m[i + 1], u = f - i;
  return { s: a[0] + (b[0] - a[0]) * u, x: a[1] + (b[1] - a[1]) * u, y: a[2] + (b[2] - a[2]) * u };
}

let tAnt = performance.now(), tGrab = 0, tHud = 0;
function bucle(ahora) {
  requestAnimationFrame(bucle);
  const dt = Math.min(0.05, (ahora - tAnt) / 1000); tAnt = ahora;
  if (S.pausa || !S.yo) return;
  if (S.fase === 'cuenta') {
    S.cuenta -= dt;
    const n = Math.ceil(S.cuenta - 0.2);
    const t = S.cuenta <= 0.2 ? '¡Ya!' : String(Math.min(3, n));
    if ($('cuenta').textContent !== t) { mostrarCuenta(t); Snd.cuenta(t === '¡Ya!'); }
    if (S.cuenta <= 0) { S.fase = 'vuelo'; setTimeout(() => { if (S.fase !== 'cuenta') mostrarCuenta(''); }, 500); }
  }
  if (S.fase === 'vuelo' || S.fase === 'fin') {
    if (S.fase === 'vuelo') S.t += dt;
    mover(dt); moverRivales(dt);
    if (S.fase === 'vuelo') {
      if (S.espera > 0) { S.espera -= dt; if (S.espera <= 0) nuevoTramo(); }
      else if (S.aro && S.yo.s >= S.aro.s) cruzar();
      if (S.metaS != null && S.yo.s >= S.metaS) terminar();
      tGrab += dt; if (tGrab >= 0.2) { tGrab -= 0.2; if (S.grab.length < 1500) S.grab.push([+S.yo.s.toFixed(1), +S.yo.x.toFixed(1), +S.yo.y.toFixed(1)]); }
    }
  } else if (S.fase === 'cuenta') mover(dt);
  Snd.motor(S.fase === 'vuelo' || S.fase === 'cuenta' ? S.yo.v : 0, S.calma);
  tHud += dt; if (tHud > 0.15) { tHud = 0; hud(); }
  if (mundo) mundo.cuadro(dt, estadoMundo());
  S.sacudir = false;
}
function estadoMundo() {
  const yo = S.yo;
  return { s: yo.s, x: yo.x, y: yo.y, banco: yo.banco, cabeceo: yo.cabeceo, turbo: yo.turbo > 0, chorro: yo.chorro > 0, sacudir: S.sacudir && !S.calma,
    rivales: S.rivales, fantasma: S.fase === 'vuelo' ? fantasmaEn(S.t) : null };
}

/* ---------- terminar ---------- */
function avisarLeccion(terminado) {
  if (S.modo !== 'leccion' || !LJ) return;
  const r = { aciertos: S.aciertos, total: S.total, fallos: S.fallos, nivel: (CIELOS[S.cielo] || {}).nombre || S.cielo };
  if (terminado && S.rivales.length) r.puesto = puesto();
  try { if (terminado) LJ.resultado(r); else LJ.progreso(r); } catch (e) { /* sin padre: nada */ }
}
const ordinal = n => n + '.º';
function terminar() {
  const p = S.rivales.length ? puesto() : 0, tiempo = S.t;
  S.fase = 'fin'; S.aro = null; S.espera = 0;
  $('carta').classList.add('oculto'); $('ops').classList.add('oculto'); $('mando').classList.add('oculto');
  Snd.meta(); Voz.callar();
  const resumen = 'Aros buenos: ' + S.aciertos + ' de ' + S.total + '.' + (S.calma ? '' : ' Tiempo: ' + tiempo.toFixed(1).replace('.', ',') + ' s.') + (S.mejorRacha >= 3 ? ' Mejor racha: ' + S.mejorRacha + '.' : '');
  // el fantasma: ¿le ganaste a tu mejor vuelo?
  let frente = '';
  const rec = S.modo === 'sala' ? prefs.records[clave()] : S.mejorSesion;
  if (!S.calma) {
    if (rec && rec.tiempo) frente = tiempo < rec.tiempo ? ' ¡Le ganaste a tu fantasma por ' + (rec.tiempo - tiempo).toFixed(1).replace('.', ',') + ' s!' : ' Tu fantasma llegó ' + (tiempo - rec.tiempo).toFixed(1).replace('.', ',') + ' s antes.';
    if (!rec || tiempo < rec.tiempo) {
      const nuevo = { tiempo, aciertos: S.aciertos, total: S.total, m: S.grab.slice() };
      if (S.modo === 'sala') {
        prefs.records[clave()] = nuevo;
        const ks = Object.keys(prefs.records); if (ks.length > 24) delete prefs.records[ks[0]];
        guardar();
      } else S.mejorSesion = nuevo;
    }
  }
  if (S.modo === 'leccion') {
    avisarLeccion(true);
    const chips = LEC.palabras.length ? LEC.palabras.slice(0, 10).map(w => w.en + ' = ' + w.es) : S.repasar.slice(0, 4).map(q => q.p.replace(/^🔊\s*/, '').slice(0, 40) + ' → ' + q.opciones[q.correcta] + (q.palabra ? ' («' + q.palabra + '»)' : ''));
    LJ.logrado({ detalle: (p ? 'Llegaste ' + ordinal(p) + ' de ' + (S.rivales.length + 1) + ' en ' + CIELOS[S.cielo].nombre + '. ' : 'Llegaste a la meta en ' + CIELOS[S.cielo].nombre + '. ') + resumen + frente,
      chips, chipsRotulo: LEC.palabras.length ? 'Lo que practicaste' : 'Para repasar', alOtraVez: () => { Snd.despertar(); empezar(); } });
    return;
  }
  $('fMedalla').textContent = S.calma ? '🌟' : ['🥇', '🥈', '🥉', '🏅'][p - 1] || '🏅';
  $('fTit').textContent = S.calma ? '¡Llegaste a la meta!' : p === 1 ? '¡Primer puesto!' : '¡Llegaste ' + ordinal(p) + '!';
  $('fRes').textContent = resumen + frente;
  const podio = $('fPodio'); podio.innerHTML = '';
  if (S.rivales.length) {
    const yoNom = (AVIONETAS.find(a => a.id === S.avion) || AVIONETAS[0]).nombre + ' (tú)';
    const lista = S.rivales.map((r, i) => ({ n: S.nombresRiv[i] ? S.nombresRiv[i].nombre : 'Rival', fin: r.fin, s: r.s })).concat([{ n: yoNom, fin: tiempo, s: S.yo.s, yo: true }]);
    lista.sort((a, b) => (a.fin != null && b.fin != null ? a.fin - b.fin : a.fin != null ? -1 : b.fin != null ? 1 : b.s - a.s));
    lista.forEach((x, i) => { const li = document.createElement('li'); li.textContent = ordinal(i + 1) + ' ' + x.n; if (x.yo) li.className = 'yo'; podio.appendChild(li); });
  }
  podio.classList.toggle('oculto', !S.rivales.length);
  $('fRepasa').textContent = S.repasar.length ? 'Para repasar: ' + S.repasar.slice(0, 4).map(q => q.p.replace(/^🔊\s*/, '') + ' → ' + q.opciones[q.correcta] + (q.palabra ? ' («' + q.palabra + '»)' : '')).join(' · ') : '¡Ningún aro equivocado!';
  setTimeout(() => { if (S.fase === 'fin') { $('final').classList.remove('oculto'); $('bOtraVuelta').focus(); } }, 900);
}

/* ---------- HUD ---------- */
function hud() {
  if (!S.yo) return;
  const enRepaso = (S.aro && S.aro.repaso) || (S.espera > 0 && S.aroHecho && S.aroHecho.repaso);
  const n = Math.min(S.total, S.hechas + (S.espera > 0 || S.metaS != null ? 0 : 1));
  const tA = S.metaS != null ? '🏁 A la meta' : enRepaso ? 'Repaso' : 'Aro ' + Math.max(1, n) + ' de ' + S.total;
  if ($('hAro').textContent !== tA) $('hAro').textContent = tA;
  const tp = S.rivales.length ? 'Puesto ' + ordinal(puesto()) + ' de ' + (S.rivales.length + 1) + ' · ' + S.aciertos + ' bien' : S.aciertos + ' bien' + (S.calma ? ' · calma' : '');
  if ($('hPuesto').textContent !== tp) $('hPuesto').textContent = tp;
  const r = $('hRacha'), tr = S.yo.chorro > 0 ? '🌬️ Chorro' : S.racha >= 2 ? '🔥 ' + S.racha : '';
  r.textContent = tr; r.classList.toggle('oculto', !tr);
  $('bSonido').setAttribute('aria-pressed', String(Snd.mudo)); $('iSonido').textContent = Snd.mudo ? '🔇' : '🔊'; $('tSonido').textContent = Snd.mudo ? 'Activar el sonido' : 'Silenciar';
  $('bCalma').setAttribute('aria-pressed', String(S.calma));
  // la línea de la carrera
  if (S.rivales.length) {
    const pis = $('hPista'), m = metaPrevista();
    if (!pis.dataset.ok) {
      pis.dataset.ok = '1';
      for (let i = 0; i < 4; i++) { const d = document.createElement('span'); d.className = 'pto'; pis.appendChild(d); }
    }
    const pts = pis.querySelectorAll('.pto');
    const yoA = AVIONETAS.find(a => a.id === S.avion) || AVIONETAS[0];
    pts[3].className = 'pto yo'; pts[3].textContent = '🛩️'; pts[3].style.left = clamp(S.yo.s / m * 100, 0, 100) + '%'; pts[3].title = yoA.nombre + ' (tú)';
    S.rivales.forEach((rv, i) => { const e = S.nombresRiv[i] || {}; pts[i].style.background = e.c || '#555'; pts[i].textContent = (e.nombre || '?')[0]; pts[i].style.left = clamp(rv.s / m * 100, 0, 100) + '%'; });
  }
}
function anunciar(t) { const a = $('anuncio'); a.textContent = ''; setTimeout(() => { a.textContent = t; }, 30); }

/* ---------- pausa, calma y sonido ---------- */
function pausar() {
  if (S.fase !== 'vuelo' && S.fase !== 'cuenta') return;
  S.pausa = true; Snd.parar(); Voz.callar();
  $('pRes').textContent = 'Llevas ' + S.aciertos + ' de ' + S.total + ' aros buenos.';
  $('bInicio').classList.toggle('oculto', S.modo === 'leccion');
  $('pausa').classList.remove('oculto'); $('bSeguir').focus();
}
function seguir() { $('pausa').classList.add('oculto'); S.pausa = false; tAnt = performance.now(); }
function ponerCalma(b) {
  S.calma = !!b; if (!LEC) { prefs.calma = S.calma; guardar(); }
  if (mundo) mundo.calma(S.calma);
  document.body.classList.toggle('calmo', S.calma);
  hud();
}
$('bSonido').addEventListener('click', () => { Snd.mudo = !Snd.mudo; if (!LEC) { prefs.mudo = Snd.mudo; guardar(); } if (Snd.mudo) Voz.callar(); else Snd.despertar(); hud(); if (S.aro) { if (Snd.mudo && S.aro.q.escucha) { S.aro.visto = true; $('cPalabra').classList.remove('oculto'); $('bVer').classList.add('oculto'); } } });
$('bCalma').addEventListener('click', () => ponerCalma(!S.calma));
$('bMenu').addEventListener('click', pausar);
$('bSeguir').addEventListener('click', seguir);
$('bOtra').addEventListener('click', () => { $('pausa').classList.add('oculto'); empezar(); });
$('bInicio').addEventListener('click', irAlInicio);
$('bOir').addEventListener('click', oir);
$('bVer').addEventListener('click', ver);
$('bPistaQ').addEventListener('click', pista);
$('bOtraVuelta').addEventListener('click', () => { Snd.despertar(); empezar(); });
$('bCambiar').addEventListener('click', irAlInicio);
document.addEventListener('visibilitychange', () => { if (document.hidden && (S.fase === 'vuelo' || S.fase === 'cuenta') && !S.pausa) pausar(); });

/* ---------- teclado, toque y mando ---------- */
const EJES = { arrowleft: 'l', a: 'l', arrowright: 'r', d: 'r', arrowup: 'u', w: 'u', arrowdown: 'd', s: 'd' };
addEventListener('keydown', ev => {
  if (ev.ctrlKey || ev.metaKey || ev.altKey) return;
  const k = ev.key.toLowerCase();
  if (!$('pausa').classList.contains('oculto')) { if (k === 'escape') { ev.preventDefault(); seguir(); } return; }
  if (!$('inicio').classList.contains('oculto') || !$('final').classList.contains('oculto')) return;
  if (S.fase !== 'vuelo' && S.fase !== 'cuenta') return;
  if (EJES[k]) { ev.preventDefault(); teclas[EJES[k]] = true; return; }
  if (/^[1-4]$/.test(k)) { ev.preventDefault(); elegir(+k - 1); return; }
  if (k === 'escape') { ev.preventDefault(); pausar(); return; }
  if (k === 'o') { oir(); return; }
  if (k === 'v') { ver(); return; }
  if (k === 'p') { pista(); return; }
  if (k === 'm') { $('bSonido').click(); return; }
  if (k === 'c') { $('bCalma').click(); }
});
addEventListener('keyup', ev => { const e = EJES[ev.key.toLowerCase()]; if (e) teclas[e] = false; });
addEventListener('blur', () => { teclas.l = teclas.r = teclas.u = teclas.d = false; toque.x = toque.y = 0; });
if (mundo) mundo.lienzo.addEventListener('pointerdown', ev => { if (S.fase !== 'vuelo' && S.fase !== 'cuenta') return; const i = mundo.tocar(ev.clientX, ev.clientY); if (i >= 0) elegir(i); });
$('mando').querySelectorAll('button').forEach(b => {
  const eje = b.dataset.eje, ax = eje[0], sg = eje[1] === '+' ? 1 : -1;
  const on = ev => { ev.preventDefault(); toque[ax] = sg; b.classList.add('on'); try { b.setPointerCapture(ev.pointerId); } catch (e) { /* nada */ } };
  const off = () => { if (toque[ax] === sg) toque[ax] = 0; b.classList.remove('on'); };
  b.addEventListener('pointerdown', on); b.addEventListener('pointerup', off); b.addEventListener('pointercancel', off); b.addEventListener('lostpointercapture', off);
  b.addEventListener('contextmenu', ev => ev.preventDefault());
});

/* ---------- la sala: el inicio con todas las opciones ---------- */
const GRADOS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
function boton(cont, txt, activo, alPulsar, extra) {
  const b = document.createElement('button'); b.type = 'button'; b.setAttribute('aria-pressed', String(!!activo));
  if (extra) extra(b); b.appendChild(document.createTextNode(txt));
  b.addEventListener('click', alPulsar); cont.appendChild(b); return b;
}
function armarInicio() {
  const oM = $('oMat'), oG = $('oGrado'), oT = $('oTema'), oC = $('oCielo'), oA = $('oAvion');
  [oM, oG, oT, oC, oA].forEach(c => { c.innerHTML = ''; });
  const re = (foco) => { prefs.sel = Object.assign({}, sel); guardar(); armarInicio(); if (foco) { const b = document.querySelector('#' + foco + ' [aria-pressed="true"]'); if (b) b.focus(); } };
  Object.keys(RC.MATERIAS).forEach(m => boton(oM, RC.MATERIAS[m].emoji + ' ' + RC.MATERIAS[m].nombre, sel.materia === m, () => { sel.materia = m; sel.tema = 'mezcla'; re('oMat'); }));
  GRADOS.forEach(g => boton(oG, g === 0 ? 'Transición' : g + '.º', sel.grado === g, () => { sel.grado = g; re('oGrado'); }, b => { b.className = 'grado'; }));
  const ts = RC.temas(sel.materia, sel.grado);
  if (!ts.some(t => t.id === sel.tema)) sel.tema = ts.length ? ts[0].id : 'mezcla';
  ts.forEach(t => boton(oT, t.emoji + ' ' + t.nombre, sel.tema === t.id, () => { sel.tema = t.id; re('oTema'); }));
  boton(oC, '🎲 Al azar', sel.cielo === 'azar', () => { sel.cielo = 'azar'; re('oCielo'); });
  Object.keys(CIELOS).forEach(c => boton(oC, CIELOS[c].emoji + ' ' + CIELOS[c].nombre, sel.cielo === c, () => { sel.cielo = c; re('oCielo'); }));
  AVIONETAS.forEach(a => boton(oA, a.nombre, sel.avion === a.id, () => { sel.avion = a.id; re('oAvion'); }, b => { b.className = 'avion'; const i = document.createElement('i'); i.style.background = a.c; i.setAttribute('aria-hidden', 'true'); b.appendChild(i); }));
  $('oCalma').checked = S.calma;
  const rec = prefs.records[clave()], dif = modoDeGrado(sel.grado);
  $('tRecord').textContent = (rec ? 'Tu mejor vuelo aquí: ' + rec.tiempo.toFixed(1).replace('.', ',') + ' s (' + rec.aciertos + ' de ' + rec.total + ' aros). Su fantasma vuela contigo. ' : '')
    + (dif === 'facil' ? 'En este grado los aros atraen al avión y tienes pistas sin límite.' : dif === 'media' ? 'En este grado tienes 3 pistas y lo que falles vuelve de repaso.' : 'En este grado tienes 1 pista por vuelo.');
}
$('oCalma').addEventListener('change', ev => ponerCalma(ev.target.checked));
$('bDespegar').addEventListener('click', () => { Snd.despertar(); empezar(); });
function irAlInicio() {
  S.fase = 'menu'; S.pausa = false; Snd.parar(); Voz.callar();
  ['pausa', 'final', 'carta', 'ops', 'hud', 'mando'].forEach(id => $(id).classList.add('oculto')); mostrarCuenta('');
  if (mundo) { mundo.quitarAros(); mundo.meta(null); }
  armarInicio(); $('inicio').classList.remove('oculto'); $('bDespegar').focus();
}

/* ---------- arrancar ---------- */
function listo() {
  $('cargando').classList.add('oculto');
  // de fondo, mientras se elige: el cielo y la avioneta volando sola
  S.yo = { s: 0, x: 0, y: 7, vx: 0, vy: 0, v: 9, turbo: 0, chorro: 0, lento: 0, banco: 0, cabeceo: 0 };
  S.cielo = LEC && LEC.cielo ? LEC.cielo : CIELOS[sel.cielo] ? sel.cielo : 'chicamocha';
  if (mundo) { mundo.cielo(S.cielo, 0); mundo.avionetas(S.modo === 'leccion' ? 'condor' : sel.avion, false); }
  S.fase = 'fin';
  if (!mundo) anunciar('Este equipo no muestra 3D: elige el aro con sus botones de abajo.');
  if (S.modo === 'leccion') {
    const chips = LEC.palabras.length ? LEC.palabras.slice(0, 12).map(w => (w.emoji ? w.emoji + ' ' : '') + w.en) : [];
    LJ.portada({ juego: 'Rally de los Aros', titulo: LEC.titulo || 'Vuela con lo de la lección',
      detalle: 'Vuela por el aro de la respuesta correcta. Elige con 1, 2, 3 o tocando el aro, y el avión va solo. Si fallas, ves cuál era y sigues.',
      chips, chipsRotulo: 'Las palabras de la lección', alJugar: () => { Snd.despertar(); empezar(); } });
  } else { armarInicio(); $('inicio').classList.remove('oculto'); $('bDespegar').focus(); }
  requestAnimationFrame(bucle);
}
// la lista de MP3 llega antes de empezar (si tarda más de 2,5 s, se empieza sin ella)
const fuentes = document.fonts && document.fonts.load ? Promise.all([document.fonts.load('800 32px "Baloo 2"'), document.fonts.ready]).catch(() => {}) : Promise.resolve();
Promise.race([Promise.all([Voz.listo, fuentes]), new Promise(r => setTimeout(r, 2500))]).then(listo);

window.__rally = { estado: S, elegir, correcta: () => (S.aro ? S.aro.q.correcta : -1), empezar, pista, vitrina: a => mundo && mundo.vitrina(a), avion: id => { if (mundo) mundo.avionetas(id, false); } };
})();
