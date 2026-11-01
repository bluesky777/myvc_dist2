/* Tejo — el juego: la sala (qué juegas, grado, cancha, quién lanza, ayuda y calma), las rondas contra Don Tulio, el
   modo lección (../leccion.js), la puntería, el vuelo, los puntos, el anotador, la física con números, el sonido y la voz.
   - Cada ronda: (una pregunta: bien a la primera = el tejo dorado, un tiro más) → tú, Don Tulio, tú, Don Tulio (y el
     dorado) → la cuenta: mecha 3, embocinada 6, moñona 9, mano 1 (fisica.js). Con `anotar` la cuenta la hace el alumno;
     con `fisica`, una pregunta con los números de su último tiro. Nunca hay reloj; perder contra Don Tulio no castiga.
   - El tiro: ángulo (10° a 60°; en `facil` fijo en 40°), fuerza (m/s, a los pasos de la cancha) y puntería (°). La
     línea punteada muestra el principio del vuelo (entera, con la marca de llegada, en `facil` y en modo ayuda).
   - Inglés: sólo los MP3 grabados (<voz>/en/<slug>.mp3 si está en <voz>/en/index.json, o la carpeta de `voces`), en la
     cola de leccion.js. Sin MP3: silencio y la palabra escrita. Jamás speechSynthesis.
   - Progreso (sala): localStorage juegos3d.tejo {sel, calma, ayuda, mudo, records}; puente.js lo separa por usuario.
   Depuración: window.__tejo (estado, tiro(ang, v, lat), lanzar(), ganar(que), responder(i), seguir()). */
(function () {
'use strict';
const $ = id => document.getElementById(id);
const LJ = window.LeccionJuego, F = window.TejoFisica, TC = window.TejoContenido, TCa = window.TejoCancha || {};
const CLAVE = 'juegos3d.tejo';
const leer = () => { try { return JSON.parse(localStorage.getItem(CLAVE)) || {}; } catch (e) { return {}; } };
const prefs = leer();
if (!prefs.records || typeof prefs.records !== 'object') prefs.records = {};
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const barajar = TC.barajar, coma = TC.coma;
const BIBLIO = /^(localhost|127\.0\.0\.1)$/.test(location.hostname) ? 'http://localhost:8765/' : 'https://biblioteca.micolevirtual.com/';
const reducir = matchMedia('(prefers-reduced-motion: reduce)').matches;
const OPC = [{ c: '#ffc078', g: '●' }, { c: '#a5d8ff', g: '▲' }, { c: '#b2f2bb', g: '■' }, { c: '#eebefa', g: '◆' }];
const EMO = /^((?:\p{Extended_Pictographic}|\p{Regional_Indicator}|[\u{1F3FB}-\u{1F3FF}#*0-9]|‍|️|⃣)+)\s*/u;
const partir = t => { t = String(t).trim(); const m = t.match(EMO); return m && m[1].replace(/[#*0-9]/g, '') ? { emoji: m[1], texto: t.slice(m[0].length) } : { emoji: '', texto: t }; };
const JUG = [{ nombre: 'Tú', glifo: '★' }, { nombre: 'Don Tulio', glifo: '◆' }];

/* ---------- modo lección (FORMATO.md §3.9) ---------- */
const CFG = LJ && LJ.activo && LJ.cfg ? LJ.cfg : null;
const LEC = (() => {
  if (!CFG) return null;
  const preguntas = (Array.isArray(CFG.preguntas) ? CFG.preguntas : []).filter(q => q && typeof q.p === 'string' && q.p.trim() && Array.isArray(q.opciones)
    && q.opciones.length >= 2 && q.opciones.length <= 4 && q.opciones.every(o => (typeof o === 'string' && o.trim()) || typeof o === 'number') && Number.isInteger(q.correcta) && q.correcta >= 0 && q.correcta < q.opciones.length)
    .map(q => {
      const p = q.p.trim(), oir = typeof q.oir === 'string' ? q.oir.trim() : '';
      const escucha = !!oir && p.toLowerCase().indexOf(oir.toLowerCase()) < 0;
      return { p, opciones: q.opciones.map(o => String(o).trim()), correcta: q.correcta, oir, escucha, palabra: escucha ? oir : '', opEn: false, leccion: true };
    });
  const palabras = (Array.isArray(CFG.palabras) ? CFG.palabras : []).filter(p => p && typeof p.en === 'string' && p.en.trim() && typeof p.es === 'string' && p.es.trim())
    .map(p => ({ en: p.en.trim(), es: p.es.trim(), emoji: typeof p.emoji === 'string' ? p.emoji.trim() : '' }));
  const cancha = typeof CFG.cancha === 'string' && F.CANCHAS[CFG.cancha.trim().toLowerCase()] ? CFG.cancha.trim().toLowerCase() : '';
  const rondas = Number.isInteger(CFG.rondas) ? clamp(CFG.rondas, 2, 10) : 0;
  const L = { titulo: (LJ.titulo || '').trim(), preguntas, palabras, cancha, rondas, anotar: CFG.anotar === true, fisica: CFG.fisica === true, cultura: CFG.cultura === true };
  if (!preguntas.length && palabras.length < 3 && !L.anotar && !L.fisica && !L.cultura && !rondas) { console.warn('[tejo] la lección no mandó nada que el tejo lea: va la sala'); return null; }
  return L;
})();
const guardar = () => { if (LEC) return; try { localStorage.setItem(CLAVE, JSON.stringify(prefs)); } catch (e) { /* sin almacenamiento */ } };

// La dificultad (FORMATO.md §3.9.1). Nunca se pierde por errores: cambia la ayuda y el pulso de Don Tulio.
// facil: ángulo fijo (40°), la línea entera con la marca de llegada, Don Tulio flojo y repaso; media: línea de 60 %,
// repaso; normal: línea de 35 % (25 % en la cancha grande), Don Tulio fino y sin repaso.
function params(modo) {
  return { modo, linea: modo === 'facil' ? 1 : modo === 'media' ? 0.6 : 0.35, angFijo: modo === 'facil', repaso: modo !== 'normal', grado: modo === 'facil' ? 2 : modo === 'media' ? 4 : 7 };
}
const modoDeGrado = g => (g <= 2 ? 'facil' : g <= 5 ? 'media' : 'normal');
const canchaDeGrado = g => (g <= 2 ? 'mini' : g <= 8 ? 'escolar' : 'grande');
const VOZ = (() => { const v = CFG && typeof CFG.voz === 'string' && CFG.voz.trim() ? CFG.voz.trim() : BIBLIO + 'voz/'; return /\/$/.test(v) ? v : v + '/'; })();

/* ---------- sonido (sintetizado, 0 KB) ---------- */
const Snd = (() => {
  let ctx = null, mudo = !!prefs.mudo, ultimo = 0;
  const ac = () => { if (!ctx) { const A = window.AudioContext || window.webkitAudioContext; if (A) ctx = new A(); } if (ctx && ctx.state === 'suspended') ctx.resume(); return ctx; };
  function tono(f, t, dur, tipo, vol, f2) {
    const c = mudo ? null : ac(); if (!c) return;
    const o = c.createOscillator(), g = c.createGain(), t0 = c.currentTime + t;
    o.type = tipo || 'sine'; o.frequency.setValueAtTime(f, t0); if (f2) o.frequency.exponentialRampToValueAtTime(f2, t0 + dur);
    g.gain.setValueAtTime(0.0001, t0); g.gain.exponentialRampToValueAtTime(vol || 0.1, t0 + 0.01); g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    o.connect(g); g.connect(c.destination); o.start(t0); o.stop(t0 + dur + 0.05);
  }
  function ruido(dur, vol, tipo, f0, f1, t) {
    const c = mudo ? null : ac(); if (!c) return;
    const n = Math.floor(c.sampleRate * dur), b = c.createBuffer(1, n, c.sampleRate), d = b.getChannelData(0);
    for (let i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / n, 2);
    const s = c.createBufferSource(), f = c.createBiquadFilter(), g = c.createGain(), t0 = c.currentTime + (t || 0);
    s.buffer = b; f.type = tipo; f.Q.value = 0.9; f.frequency.setValueAtTime(f0, t0); if (f1) f.frequency.exponentialRampToValueAtTime(f1, t0 + dur);
    g.gain.value = vol; s.connect(f); f.connect(g); g.connect(c.destination); s.start(t0);
  }
  return {
    get mudo() { return mudo; }, set mudo(v) { mudo = !!v; },
    despertar() { if (!mudo) ac(); },
    clic() { tono(990, 0, 0.05, 'sine', 0.05); },
    mover() { const a = Date.now(); if (a - ultimo < 70) return; ultimo = a; tono(620, 0, 0.03, 'triangle', 0.025); },
    lanzar() { ruido(0.45, 0.16, 'bandpass', 500, 2200); },
    greda() { ruido(0.22, 0.5, 'lowpass', 420, 120); tono(85, 0, 0.18, 'sine', 0.22, 50); },
    tierra() { ruido(0.18, 0.35, 'lowpass', 700, 200); },
    madera() { tono(190, 0, 0.12, 'triangle', 0.18, 140); ruido(0.08, 0.2, 'bandpass', 900); },
    bocin() { [523, 1396, 2217, 3130].forEach((f, i) => tono(f, 0, 0.9 - i * 0.15, 'sine', 0.08 - i * 0.012)); },
    chispazo() { ruido(0.12, 0.55, 'highpass', 1800); tono(240, 0, 0.12, 'square', 0.06, 90); for (let i = 0; i < 7; i++) ruido(0.03, 0.18, 'highpass', 3000 + i * 400, null, 0.08 + i * 0.045); },
    bien() { [523, 659, 784].forEach((f, i) => tono(f, i * 0.09, 0.25, 'triangle', 0.1)); },
    mal() { tono(392, 0, 0.18, 'triangle', 0.08, 330); tono(311, 0.16, 0.26, 'triangle', 0.07, 262); },
    punto() { tono(1046, 0, 0.18, 'triangle', 0.09); tono(1318, 0.08, 0.24, 'triangle', 0.08); },
    fin() { [523, 659, 784, 1047, 1318].forEach((f, i) => tono(f, i * 0.11, 0.35, 'triangle', 0.11)); }
  };
})();

/* ---------- la voz en inglés: sólo MP3 grabados, en la cola de leccion.js ---------- */
const Voz = (() => {
  let lista = null, audio = null;
  const listo = fetch(VOZ + 'en/index.json', { credentials: 'omit' }).then(r => (r.ok ? r.json() : [])).then(a => { lista = new Set(Array.isArray(a) ? a : []); }).catch(() => { lista = new Set(); });
  function slug(t) { // = nombreDelAudio de app2 (voz-grabada.ts)
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
  function callar() { if (cola) cola.callar(); if (audio) { audio.onended = audio.onerror = null; audio.pause(); audio = null; } }
  function decir(texto, opc) {
    if (Snd.mudo || !tiene(texto)) return false;
    opc = opc || {};
    const s = slug(texto), urls = [carpeta(s), lista && lista.has(s) ? 'en' : null].filter((d, i, a) => d && a.indexOf(d) === i).map(d => VOZ + d + '/' + s + '.mp3');
    if (cola) { cola.poner({ urls, clave: 'tejo:' + s, grupo: opc.grupo, caduca: opc.caduca || 5000, vigente: () => !Snd.mudo && !S.pausa }); return true; }
    if (audio) { audio.onended = audio.onerror = null; audio.pause(); }
    const probar = j => { if (j >= urls.length) return; const a = new Audio(urls[j]); audio = a; a.onerror = () => probar(j + 1); a.play().catch(() => {}); };
    probar(0); return true;
  }
  return { listo, tiene, decir, callar };
})();

/* ---------- estado ---------- */
const TEMAS = {
  partida: { nombre: 'Partida', icono: '🎯', nota: 'Tejo puro contra Don Tulio, hasta la meta de la cancha.' },
  anotador: { nombre: 'Anotador', icono: '✏️', nota: 'Tú sumas los puntos de cada ronda en la pizarra.' },
  fisica: { nombre: 'Física del tiro', icono: '📐', nota: 'Los números de cada tiro: rapidez, altura, tiempo y la estela cada 0,1 s.' },
  cultura: { nombre: 'Cultura del tejo', icono: '🇨🇴', nota: 'Preguntas de Turmequé, los muiscas, el bocín y las reglas.' }
};
const sel = Object.assign({ tema: 'partida', grado: 4, cancha: 'escolar', persona: 'ana' }, prefs.sel || {});
if (!TEMAS[sel.tema]) sel.tema = 'partida';
if (!F.CANCHAS[sel.cancha]) sel.cancha = 'escolar';
const S = {
  modo: LEC ? 'leccion' : 'sala', fase: 'menu', pausa: false,
  calma: LEC ? reducir : (typeof prefs.calma === 'boolean' ? prefs.calma : reducir), ayuda: !LEC && !!prefs.ayuda,
  P: params('normal'), C: F.CANCHAS.escolar, anotar: false, fisica: false, cultura: false, numeros: false,
  ronda: 0, rondas: 6, meta: 18, puntos: [0, 0], tejos: [], vivas: [0, 1, 2, 3], cola: [], dorado: false, tiroN: 0,
  tiro: { ang: 40, v: 9, lat: 0 }, ultimo: null, ultimoYo: null, preguntasRonda: [], repaso: [], banco: [], pend: [],
  aciertos: 0, total: 0, fallos: 0, stats: { mechas: 0, embocinadas: 0, mononas: 0, manos: 0 }, rng: F.azar(1), q: null, respondida: false, seguir: null, semilla: 1
};
let esp = null;
try { if (TCa.disponible) esp = TCa.crear($('gl'), { calma: S.calma, cancha: sel.cancha, persona: sel.persona }); } catch (e) { console.warn('Tejo: sin 3D (' + e.message + ')'); esp = null; }
const anunciar = t => { const a = $('anuncio'); a.textContent = ''; setTimeout(() => { a.textContent = t; }, 30); };
const despues = (ms, fn) => setTimeout(() => { if (S.pausa) { const r = () => { if (S.pausa) setTimeout(r, 200); else fn(); }; r(); } else fn(); }, ms);

/* ---------- armar la partida ---------- */
function itemsDePalabras(pal, modo, max) {
  const n = Math.min(max, Math.max(3, pal.length)), orden = [];
  while (orden.length < n) orden.push(...barajar(pal));
  const es = w => (w.emoji ? w.emoji + ' ' : '') + w.es;
  return orden.slice(0, n).map((w, i) => {
    const otras = barajar(pal.filter(x => x.es !== w.es && x.en !== w.en)).slice(0, 2), ops = barajar([w].concat(otras));
    if (modo !== 'facil' && i % 3 === 2) return { p: '¿Cómo se dice ' + es(w) + ' en inglés?', opciones: ops.map(x => x.en), correcta: ops.indexOf(w), oir: '', escucha: false, palabra: '', opEn: true, leccion: true };
    const escucha = i % 2 === 0 && Voz.tiene(w.en);
    return { p: escucha ? 'Escucha y elige lo que oíste' : '«' + w.en + '»: ¿qué quiere decir?', opciones: ops.map(es), correcta: ops.indexOf(w), oir: w.en, escucha, palabra: escucha ? w.en : '', opEn: false, leccion: true };
  });
}
const deBanco = (lista, g) => { let pool = lista.filter(q => q[0] <= g); if (pool.length < 4) pool = lista.slice(0, 6); const cerca = barajar(pool.filter(q => q[0] >= g - 3)); return cerca.concat(barajar(pool.filter(q => q[0] < g - 3))).map(q => TC.deBanco(q)); };
function empezar() {
  Voz.callar(); cerrarCapas();
  const modo = S.modo === 'leccion' ? (LJ.dificultad || 'normal') : modoDeGrado(sel.grado);
  S.P = params(modo);
  const g = S.modo === 'leccion' ? S.P.grado : sel.grado;
  S.grado = g;
  let inicio = [];
  if (S.modo === 'leccion') {
    S.anotar = LEC.anotar; S.fisica = LEC.fisica; S.cultura = LEC.cultura;
    inicio = LEC.preguntas.slice(0, 10).map(q => Object.assign({}, q));
    if (LEC.palabras.length >= 3) inicio = inicio.concat(itemsDePalabras(LEC.palabras, modo, Math.max(3, 8 - inicio.length)));
    S.rondas = LEC.rondas || (inicio.length ? clamp(inicio.length, 3, 8) : 4);
    S.C = F.CANCHAS[LEC.cancha || (S.fisica ? 'grande' : modo === 'facil' ? 'mini' : 'escolar')];
    S.meta = 0;
    S.banco = S.cultura ? deBanco(TC.CULTURA, g + 2) : [];
  } else {
    S.anotar = sel.tema === 'anotador'; S.fisica = sel.tema === 'fisica'; S.cultura = sel.tema === 'cultura';
    S.C = F.CANCHAS[sel.cancha]; S.meta = S.C.meta; S.rondas = sel.tema === 'partida' ? 12 : 6;
    S.banco = S.cultura ? deBanco(TC.CULTURA, g) : S.fisica && g < 9 ? deBanco(TC.FISICA, g) : [];
  }
  S.numeros = S.fisica && (S.modo === 'leccion' || g >= 9); // las preguntas con los números del tiro
  // las preguntas del principio de cada ronda
  S.preguntasRonda = Array.from({ length: S.rondas }, () => []);
  inicio.forEach((q, i) => S.preguntasRonda[i % S.rondas].push(q));
  if (S.banco.length) S.preguntasRonda.forEach(l => { if (!l.length && S.banco.length) l.push(S.banco.shift()); });
  S.ronda = 0; S.puntos = [0, 0]; S.aciertos = 0; S.total = 0; S.fallos = 0; S.repaso = []; S.ultimo = null; S.ultimoYo = null; S.nFis = 0;
  S.stats = { mechas: 0, embocinadas: 0, mononas: 0, manos: 0 };
  S.semilla = (Date.now() & 0xffff) + 7; S.rng = F.azar(S.semilla);
  if (esp) { esp.cancha(S.C.id); esp.estela(S.fisica); esp.fantasma(null); }
  const v0 = F.aPasos(S.C, F.apuntarA(S.C, 0, 0, 40)).v;
  S.tiro = { ang: 40, v: +(F.aPasos(S.C, { ang: 40, v: v0 * 0.93, lat: 0 }).v), lat: 0 };
  ajustarControles();
  ['hud'].forEach(id => $(id).classList.remove('oculto'));
  $('lupa').classList.toggle('oculto', !esp);
  pizarra(); empezarRonda();
}
function ajustarControles() {
  const c = S.C, rA = $('rAng'), rF = $('rFuerza'), rL = $('rLat');
  rA.min = F.ANG.min; rA.max = F.ANG.max; rA.step = F.ANG.paso;
  rF.min = c.vMin; rF.max = c.vMax; rF.step = c.pasoV;
  rL.min = -c.latMax; rL.max = c.latMax; rL.step = c.pasoLat;
  $('ctlAng').classList.toggle('oculto', S.P.angFijo);
}

/* ---------- la ronda ---------- */
function empezarRonda() {
  S.ronda++; S.tejos = []; S.vivas = [0, 1, 2, 3]; S.dorado = false; S.tiroN = 0;
  S.cola = ['yo', 'rival', 'yo', 'rival'];
  if (esp) { esp.limpiar(); esp.mechas(S.vivas); esp.fantasma(S.ultimoYo); }
  hud();
  const qs = (S.preguntasRonda[S.ronda - 1] || []).slice();
  if (S.repaso.length && S.P.repaso && S.ronda > 1) qs.push(Object.assign({}, S.repaso.shift(), { repaso: true }));
  S.pend = qs.map(q => ({ tipo: 'pregunta', q, bono: true }));
  avanzar();
}
/** Lo pendiente de la ronda: preguntas del principio, luego los tiros, luego la cuenta. */
function avanzar() {
  if (S.pend.length) { const p = S.pend.shift(); if (p.tipo === 'pregunta') preguntar(p.q, p, avanzar); else p.fn(); return; }
  siguienteTiro();
}
function siguienteTiro() {
  ocultar(['carta', 'aviso']);
  if (!S.cola.length) { finRonda(); return; }
  const quien = S.cola.shift();
  S.tiroN++;
  if (quien === 'rival') { tiroDeTulio(); return; }
  S.fase = 'apuntar'; S.lanzaDorado = quien === 'dorado';
  if (esp) esp.turno('yo');
  const mios = S.tejos.filter(t => t.jugador === 0).length;
  $('hTejo').textContent = S.lanzaDorado ? '✨ Tu tejo dorado (el tiro de más)' : '★ Tu tejo ' + (mios + 1) + ' de 2';
  $('mando').classList.remove('oculto'); mandoActivo(true);
  apuntar(S.tiro.ang, S.tiro.v, S.tiro.lat, true); hud(); medir();
  anunciar((S.lanzaDorado ? 'Tu tejo dorado. ' : 'Tu tejo ' + (mios + 1) + ' de 2. ') + textoTiro());
  try { $('bLanzar').focus({ preventScroll: true }); } catch (e) { /* nada */ }
}
function mandoActivo(b) {
  ['bAngMenos', 'bAngMas', 'bMenos', 'bMas', 'bIzq', 'bDer', 'bLanzar', 'rAng', 'rFuerza', 'rLat'].forEach(id => { $(id).disabled = !b; });
  $('mando').classList.toggle('quieto', !b);
}

/* ---------- apuntar ---------- */
const lado = l => (Math.abs(l) < 0.05 ? 'al centro' : coma(Math.abs(l)) + '° a la ' + (l > 0 ? 'derecha' : 'izquierda'));
function textoTiro() {
  const t = S.tiro, v = F.componentes(t);
  return 'Ángulo ' + t.ang + '°, fuerza ' + coma(t.v, S.C.pasoV < 0.05 ? 2 : 1) + ' m/s, ' + lado(t.lat) + '.' + (S.fisica ? ' vx = ' + coma(v.vx, 2) + ' m/s, vy = ' + coma(v.vy, 2) + ' m/s.' : '');
}
function apuntar(ang, v, lat, callado) {
  const c = S.C;
  const t = F.aPasos(c, { ang: S.P.angFijo ? 40 : ang, v, lat });
  const cambio = t.ang !== S.tiro.ang || t.v !== S.tiro.v || t.lat !== S.tiro.lat;
  S.tiro = t;
  $('rAng').value = t.ang; $('rFuerza').value = t.v; $('rLat').value = t.lat;
  $('oAng').textContent = t.ang + '°'; $('oFuerza').textContent = coma(t.v, c.pasoV < 0.05 ? 2 : 1); $('oLat').textContent = Math.abs(t.lat) < 0.05 ? '0°' : coma(Math.abs(t.lat)) + '°' + (t.lat > 0 ? ' ▶' : ' ◀');
  $('rAng').setAttribute('aria-valuetext', t.ang + ' grados');
  $('rFuerza').setAttribute('aria-valuetext', coma(t.v, 2) + ' metros por segundo');
  $('rLat').setAttribute('aria-valuetext', lado(t.lat));
  $('hLinea').textContent = textoTiro();
  lineaPrevia();
  if (cambio && !callado) Snd.mover();
}
function lineaPrevia() {
  if (!esp) return;
  if (S.fase !== 'apuntar') { esp.apuntar(null); return; }
  const f = S.ayuda ? 1 : S.P.linea < 1 && S.C.id === 'grande' ? Math.min(S.P.linea, 0.25) : S.P.linea;
  esp.apuntar(S.tiro, f);
}
function paso(da, dv, dl) { if (S.fase !== 'apuntar' || S.pausa) return; apuntar(S.tiro.ang + da, S.tiro.v + dv * S.C.pasoV, S.tiro.lat + dl * S.C.pasoLat); }

/* ---------- lanzar y lo que pasa ---------- */
function lanzar() {
  if (S.fase !== 'apuntar' || S.pausa) return;
  S.fase = 'vuelo'; mandoActivo(false); $('mando').classList.add('oculto'); Snd.despertar();
  const tipo = S.lanzaDorado ? 'dorado' : 'yo', res = F.lanzar(S.C, S.tiro, S.vivas);
  if (esp) esp.apuntar(null);
  volar(res, tipo, 0, () => resultadoMio(res, tipo));
}
/** Anima un tejo (o, sin 3D, lo resuelve al momento) y avisa de las mechas, el bocín y el golpe. */
function volar(res, tipo, jugador, fin) {
  const tocar = () => {
    res.mechas.forEach(i => { S.vivas = S.vivas.filter(j => j !== i); if (esp) esp.estallar(i); });
    if (res.mechas.length) Snd.chispazo();
    if (res.embocinada) Snd.bocin(); else if (res.tipo === 'tablero') Snd.greda(); else if (res.tipo === 'corto') Snd.tierra(); else Snd.madera();
    if (esp && !S.calma && S.C.D > 7) esp.mirarCajon(true);
  };
  const acabar = () => { S.tejos.push({ jugador, res, tipo }); if (esp) esp.dejar(res, tipo, S.tejos.length); fin(); };
  if (!esp) { tocar(); setTimeout(acabar, 200); return; }
  esp.lanzar(res, tipo, { salir: () => Snd.lanzar(), tocar, fin: acabar });
}
const donde = r => {
  const cm = Math.round((r.dReal != null ? r.dReal : r.d) * 100), s = r.reposo.s, u = r.reposo.u;
  const v = Math.abs(s) < 0.02 ? '' : s > 0 ? 'arriba' : 'abajo', h = Math.abs(u) < 0.02 ? '' : u > 0 ? 'a la derecha' : 'a la izquierda';
  return cm + ' cm del bocín' + (v || h ? ', ' + [v, h].filter(Boolean).join(' y ') : '');
};
const NOMBRE_J = { monona: '🌟 ¡Moñona!', embocinada: '🎯 ¡Embocinada!', mecha: '💥 ¡Mecha!' };
function describir(r) { // [título, texto] de lo que hizo un tejo
  const j = F.jugada(r), extra = r.mechas.length > 1 ? ' (' + r.mechas.length + ' mechas)' : '';
  if (j) return [NOMBRE_J[j] + ' +' + r.puntos + extra, j === 'monona' ? 'Dentro del bocín y reventó la mecha: 6 + 3 = 9.' : j === 'embocinada' ? 'El tejo quedó dentro del bocín: 6 puntos.' : 'Reventó la mecha con un chispazo: ' + r.puntos + ' puntos.' + (r.tipo === 'paso' ? ' Luego resbaló y se salió.' : r.tipo === 'tablero' ? ' Quedó a ' + donde(r) + '.' : '')];
  if (r.tipo === 'tablero') return ['En la greda', 'Quedó a ' + donde(r) + '.' + (r.resbalo > 0.01 ? ' Resbaló ' + Math.round(r.resbalo * 100) + ' cm.' : '')];
  if (r.tipo === 'corto') return ['Se quedó corto', 'Cayó en la cancha, a ' + coma(Math.max(0.1, r.falta)) + ' m del cajón.'];
  if (r.tipo === 'paso') return ['Se pasó', r.salioResbalando ? 'Resbaló por la greda y se salió por arriba.' : r.respaldo ? 'Pegó en la tabla de atrás.' : 'Voló por encima del cajón.'];
  if (r.tipo === 'fuera') return ['Por un lado', 'Se fue por la ' + (r.contacto.u > 0 ? 'derecha' : 'izquierda') + ' del cajón.'];
  return ['Rebotó', 'Llegó muy de lado a la greda y rebotó.'];
}
function consejo(r) {
  const t = r.tiro, bajo = !S.P.angFijo && t.ang < 30, alto = !S.P.angFijo && t.ang > 52;
  if (r.tipo === 'corto') return 'Te faltó: dale más fuerza (+).' + (bajo ? ' O sube el ángulo (▲).' : '');
  if (r.tipo === 'paso') return r.salioResbalando ? 'Llegó de lado y resbaló: prueba un ángulo cerca de 40°.' : 'Te pasaste: un poco menos de fuerza (−).';
  if (r.tipo === 'fuera') return r.contacto.u > 0 ? 'Gira un poco a la izquierda (◀).' : 'Gira un poco a la derecha (▶).';
  if (r.tipo === 'rebote') return 'Tira más bombeado: sube el ángulo (▲).';
  if (r.embocinada) return '¡Así se tira!';
  const s = r.reposo.s, u = r.reposo.u, cons = [];
  if (Math.abs(s) > S.C.R * 0.5) cons.push(s > 0 ? 'un poquito menos de fuerza' : 'un poquito más de fuerza');
  if (Math.abs(u) > S.C.R * 0.5) cons.push(u > 0 ? 'un poco a la izquierda' : 'un poco a la derecha');
  if (r.resbalo > 0.03) cons.push((bajo ? 'más' : alto ? 'menos' : 'otro') + ' ángulo, para que llegue derecho y se clave');
  return cons.length ? 'Para la próxima: ' + cons.join(', ') + '.' : '¡Muy cerca!';
}
function datosFisica(r) {
  const vy = r.vy0, lleg = r.angLlegada;
  return ['v = ' + coma(r.tiro.v, 2) + ' m/s', 'θ = ' + r.tiro.ang + '°', 'vx = ' + coma(r.vx, 2) + ' m/s', 'vy = ' + coma(vy, 2) + ' m/s', 'altura máx. ' + coma(r.hMax, 2) + ' m',
    'subida ' + coma(r.tSub, 2) + ' s', 'vuelo ' + coma(r.t, 2) + ' s', 'avanzó ' + coma(r.alcance, 2) + ' m', 'llega a ' + Math.round(lleg) + '° hacia abajo'];
}
function resultadoMio(r, tipo) {
  S.fase = 'resultado'; S.ultimo = r; S.ultimoYo = r; $('mando').classList.add('oculto');
  if (esp) esp.mirarCajon(!S.calma && S.C.D > 7);
  const [tit, txt] = describir(r), j = F.jugada(r);
  contar(r);
  if (j) Snd.punto(); else if (r.tipo !== 'tablero') Snd.mal();
  const det = S.fisica ? [{ chips: datosFisica(r) }] : [];
  mostrarAviso((tipo === 'dorado' ? '✨ ' : '★ ') + tit, txt, det, consejo(r), '▶ Seguir', () => { if (esp) esp.mirarCajon(false); siguienteTiro(); });
  anunciar(tit + '. ' + txt + ' ' + consejo(r));
  hud();
}
function contar(r) { if (r.embocinada && r.mechas.length) S.stats.mononas++; else if (r.embocinada) S.stats.embocinadas++; S.stats.mechas += r.mechas.length; }
function tiroDeTulio() {
  S.fase = 'rival'; $('mando').classList.add('oculto');
  if (esp) { esp.turno('tulio'); esp.apuntar(null); }
  const t = F.tiroRival(S.C, S.P.modo, S.rng, S.vivas), res = F.lanzar(S.C, t, S.vivas);
  hud(); anunciar('Tira Don Tulio.');
  mostrarAviso('◆ Tira Don Tulio', '', [], '', null);
  despues(S.calma ? 350 : 700, () => volar(res, 'rival', 1, () => {
    const [tit, txt] = describir(res);
    if (F.jugada(res)) Snd.punto();
    mostrarAviso('◆ Don Tulio: ' + tit, txt, [], '', null);
    anunciar('Don Tulio: ' + tit + '. ' + txt);
    despues(S.calma ? 1500 : 1900, () => { if (esp) esp.mirarCajon(false); siguienteTiro(); });
  }));
}

/* ---------- el fin de la ronda: la cuenta ---------- */
function finRonda() {
  S.fase = 'cuenta'; $('mando').classList.add('oculto');
  if (esp) { esp.turno('yo'); esp.apuntar(null); }
  const r = F.puntuarRonda(S.tejos);
  if (r.mano) S.stats.manos += r.mano.jugador === 0 ? 1 : 0;
  const antes = S.puntos.slice();
  S.cuenta = { r, antes };
  const pend = [];
  if (S.anotar) {
    const j = r.puntos[0] > 0 ? 0 : r.puntos[1] > 0 ? 1 : -1;
    if (j >= 0) {
      const qs = TC.anotador(r.detalle[j], antes[j], S.meta, S.grado, j === 0 ? 'Tú' : 'Don Tulio');
      pend.push(qs[0]);
      if (S.grado >= 3 && qs.length > 1) pend.push(qs[1 + (S.ronda % (qs.length - 1))]);
    }
  }
  const sigue = () => {
    if (pend.length) { preguntar(pend.shift(), { cuenta: true }, sigue); return; }
    mostrarCuenta();
  };
  sigue();
}
const lineaDe = det => (det.length ? det.map(x => TC.ICONO[x.que] + ' ' + TC.NOMBRE[x.que] + ' (' + x.puntos + ')').join(' + ') + ' = ' + det.reduce((a, x) => a + x.puntos, 0) : 'nada esta ronda');
function mostrarCuenta() {
  S.fase = 'cuenta';
  const { r } = S.cuenta;
  S.puntos = [S.puntos[0] + r.puntos[0], S.puntos[1] + r.puntos[1]];
  pizarra(); hud();
  if (r.puntos[0]) Snd.punto();
  const det = [0, 1].map(j => JUG[j].glifo + ' ' + JUG[j].nombre + ': ' + lineaDe(r.detalle[j]));
  const mano = r.mano ? 'La mano (el tejo más cerca del bocín, ' + (r.mano.d === 0 ? 'dentro' : 'a ' + Math.round(r.mano.d * 100) + ' cm') + ') es para ' + (r.mano.jugador === 0 ? 'ti' : 'Don Tulio') + '.' : (S.tejos.some(t => t.res.tipo === 'tablero') ? 'Dos tejos quedaron igual de cerca del bocín: esta vez no hay mano.' : 'Ningún tejo quedó en la greda: no hay mano.');
  const fin = terminaAqui();
  const tot = 'Van: tú ' + S.puntos[0] + ', Don Tulio ' + S.puntos[1] + (S.meta ? ' (a ' + S.meta + ')' : '') + '.';
  const seguir = () => {
    if (S.fisica && S.numeros && S.ultimoYo && !S.cuentaFisica) {
      S.cuentaFisica = true;
      const q = TC.fisicaDelTiro(S.ultimoYo, F, S.nFis++);
      preguntar(q, { cuenta: true, fisica: true }, seguir); return;
    }
    S.cuentaFisica = false;
    if (fin) terminar(); else empezarRonda();
  };
  mostrarAviso('Ronda ' + S.ronda + (S.modo === 'leccion' ? ' de ' + S.rondas : ''), mano, det.concat([tot]), '', fin ? '▶ Ver el final' : '▶ Siguiente ronda', seguir);
  anunciar('Fin de la ronda ' + S.ronda + '. ' + det.join('. ') + '. ' + mano + ' ' + tot);
}
function terminaAqui() {
  if (S.modo === 'leccion') return S.ronda >= S.rondas;
  return S.ronda >= S.rondas || (S.meta && (S.puntos[0] >= S.meta || S.puntos[1] >= S.meta));
}

/* ---------- las preguntas ---------- */
function preguntar(q, o, luego) {
  S.fase = 'pregunta'; S.q = q; S.qo = o; S.respondida = false; S.luego = luego;
  ocultar(['aviso', 'mando']);
  const c = $('carta');
  $('cTipo').textContent = o.cuenta ? (o.fisica ? '📐 Física del tiro' : '✏️ El anotador') : q.repaso ? '↻ Repaso (no cuenta)' : '🥇 Bien a la primera = el tejo dorado';
  $('cPreg').textContent = q.p;
  $('cPalabra').classList.add('oculto'); $('cPalabra').textContent = '';
  $('bOir').classList.toggle('oculto', !q.oir); $('bVer').classList.toggle('oculto', !q.escucha);
  $('cFeed').textContent = ''; $('cFeed').className = 'feed'; $('bTirar').classList.add('oculto');
  const ops = $('cOps'); ops.textContent = '';
  q.opciones.forEach((t, i) => {
    const b = document.createElement('button'); b.type = 'button'; b.className = 'opcion'; b.style.setProperty('--c', OPC[i].c);
    const n = document.createElement('span'); n.className = 'num'; n.textContent = (i + 1) + ' ' + OPC[i].g; n.setAttribute('aria-hidden', 'true');
    const x = document.createElement('span'); x.className = 'tx'; x.textContent = t; if (q.opEn) x.lang = 'en';
    b.append(n, x); b.setAttribute('aria-label', (i + 1) + ': ' + t);
    b.addEventListener('click', () => responder(i));
    ops.appendChild(b);
  });
  c.classList.remove('oculto'); $('lupa').classList.add('oculto');
  if (q.oir) Voz.decir(q.oir, { grupo: 'pregunta' });
  anunciar(q.p + ' Opciones: ' + q.opciones.map((t, i) => (i + 1) + ', ' + t).join('; ') + '.');
  setTimeout(() => { const b = ops.querySelector('button'); if (b) try { b.focus({ preventScroll: true }); } catch (e) { /* nada */ } }, 30);
}
function responder(i) {
  if (S.fase !== 'pregunta' || S.respondida || !S.q || i < 0 || i >= S.q.opciones.length) return;
  const q = S.q, o = S.qo, bien = i === q.correcta, cuenta = !q.repaso;
  S.respondida = true;
  if (q.opEn) Voz.decir(q.opciones[i], { grupo: 'op' });
  [...$('cOps').children].forEach((b, k) => { b.disabled = true; if (k === q.correcta) b.classList.add('buena'); else if (k === i) b.classList.add('mala'); });
  if (cuenta) { S.total++; if (bien) S.aciertos++; else S.fallos++; }
  const f = $('cFeed');
  if (bien) {
    Snd.bien();
    const bono = o.bono && !S.dorado;
    if (bono) { S.dorado = true; S.cola.push('dorado'); }
    f.className = 'feed bien';
    f.textContent = '¡Bien!' + (bono ? ' Ganaste el tejo dorado de los muiscas: un tiro más en esta ronda.' : '') + (q.x ? ' ' + q.x : '');
  } else {
    Snd.mal();
    f.className = 'feed mal';
    f.textContent = 'Era: ' + q.opciones[q.correcta] + '.' + (q.x ? ' ' + q.x : '') + (q.leccion && S.P.repaso && !q.repaso ? ' Vuelve más tarde de repaso.' : '');
    if (q.leccion && S.P.repaso && !q.repaso) S.repaso.push(q);
  }
  if (q.palabra) { $('cPalabra').textContent = q.palabra; $('cPalabra').classList.remove('oculto'); $('bVer').classList.add('oculto'); }
  avisarLeccion(false);
  const b = $('bTirar'); b.textContent = o.cuenta ? '▶ Seguir' : '▶ ¡A tirar!'; b.classList.remove('oculto');
  anunciar(f.textContent);
  setTimeout(() => { try { b.focus({ preventScroll: true }); } catch (e) { /* nada */ } }, 30);
  hud();
}
function cerrarPregunta() {
  if (S.fase !== 'pregunta' || !S.respondida) return;
  $('carta').classList.add('oculto'); if (esp) $('lupa').classList.remove('oculto');
  const l = S.luego; S.luego = null; S.q = null; S.fase = 'pasa'; if (l) l();
}
function verPalabra() { const q = S.q; if (!q || !q.palabra) return; $('cPalabra').textContent = q.palabra; $('cPalabra').classList.remove('oculto'); $('bVer').classList.add('oculto'); }
function oir() { const q = S.q; if (!q || !q.oir) return; if (!Voz.decir(q.oir, { grupo: 'pregunta' })) { verPalabra(); anunciar('Esta palabra no está grabada: aquí está escrita.'); } }

/* ---------- avisos, HUD y pizarra ---------- */
function mostrarAviso(tit, txt, det, cons, boton, fn) {
  $('aTit').textContent = tit; $('aTxt').textContent = txt || ''; $('aConsejo').textContent = cons || '';
  const ul = $('aDet'); ul.textContent = '';
  (det || []).forEach(d => {
    const li = document.createElement('li');
    if (d && d.chips) { li.className = 'chips'; d.chips.forEach(c => { const s = document.createElement('span'); s.textContent = c; li.appendChild(s); }); } else li.textContent = d;
    ul.appendChild(li);
  });
  const b = $('bSeguir'); b.classList.toggle('oculto', !boton); if (boton) b.textContent = boton;
  S.seguir = fn || null;
  $('aviso').classList.remove('oculto');
  if (boton) setTimeout(() => { try { b.focus({ preventScroll: true }); } catch (e) { /* nada */ } }, 30);
}
function seguir() { if (!S.seguir || S.pausa) return; const f = S.seguir; S.seguir = null; $('aviso').classList.add('oculto'); f(); }
function ocultar(ids) { ids.forEach(id => $(id).classList.add('oculto')); }
function hud() {
  $('hRonda').textContent = S.ronda ? 'Ronda ' + S.ronda + (S.modo === 'leccion' || S.meta === 0 ? ' de ' + S.rondas : '') : 'Tejo';
  $('hPuntos').innerHTML = '★ Tú ' + S.puntos[0] + ' · ◆ <span class="dn">Don </span>Tulio ' + S.puntos[1] + (S.meta ? '<span class="meta"> · a ' + S.meta + '</span>' : '');
  $('bAyuda').setAttribute('aria-pressed', String(S.ayuda)); $('bCalma').setAttribute('aria-pressed', String(S.calma));
  $('bSonido').setAttribute('aria-pressed', String(Snd.mudo)); $('iSonido').textContent = Snd.mudo ? '🔇' : '🔊'; $('tSonido').textContent = Snd.mudo ? 'Activar el sonido' : 'Silenciar';
}
function pizarra() {
  if (!esp) return;
  const yo = (TCa.PERSONAS && TCa.PERSONAS[sel.persona] && S.modo === 'sala') ? TCa.PERSONAS[sel.persona].nombre.toUpperCase() : 'TÚ';
  esp.pizarra({ titulo: 'TEJO · ronda ' + Math.max(1, S.ronda), meta: S.meta, filas: [{ glifo: '★', nombre: yo, puntos: S.puntos[0] }, { glifo: '◆', nombre: 'DON TULIO', puntos: S.puntos[1] }] });
}
function medir() {
  if (!esp) return;
  const l = $('lupa');
  if (l.classList.contains('oculto') || getComputedStyle(l).display === 'none') { esp.lupa(null); return; }
  const r = l.getBoundingClientRect(), t = l.querySelector('.lupa-t'), b = l.querySelector('.lupa-l');
  const arriba = t && t.offsetParent ? t.getBoundingClientRect().bottom : r.top + 4, abajo = b && b.offsetParent ? b.getBoundingClientRect().top : r.bottom - 4;
  esp.lupa({ x: Math.round(r.left + 4), y: Math.round(arriba), w: Math.round(r.width - 8), h: Math.round(abajo - arriba) });
}

/* ---------- avisar a la lección y terminar ---------- */
function avisarLeccion(terminado) {
  if (S.modo !== 'leccion' || !LJ) return;
  const r = { aciertos: S.aciertos, total: S.total, fallos: S.fallos, nivel: 'Ronda ' + Math.max(1, S.ronda) + ' de ' + S.rondas };
  try { if (terminado) LJ.resultado(r); else LJ.progreso(r); } catch (e) { /* sin padre: nada */ }
}
function terminar() {
  S.fase = 'fin'; Voz.callar(); Snd.fin();
  ocultar(['hud', 'carta', 'mando', 'aviso', 'lupa']); if (esp) esp.lupa(null);
  const [a, b] = S.puntos, gano = a > b, empate = a === b;
  const st = S.stats, jugadas = [st.mononas && st.mononas + ' moñona' + (st.mononas > 1 ? 's' : ''), st.embocinadas && st.embocinadas + ' embocinada' + (st.embocinadas > 1 ? 's' : ''), st.mechas && st.mechas + ' mecha' + (st.mechas > 1 ? 's' : ''), st.manos && st.manos + ' mano' + (st.manos > 1 ? 's' : '')].filter(Boolean);
  const quien = empate ? 'Empate: ' + a + ' a ' + b + '.' : gano ? '¡Ganaste ' + a + ' a ' + b + '!' : 'Don Tulio ganó ' + b + ' a ' + a + ': ¡la revancha!';
  const resumen = quien + ' ' + (jugadas.length ? 'Hiciste ' + jugadas.join(', ') + '.' : 'Sigue practicando la puntería.') + (S.total ? ' Preguntas bien a la primera: ' + S.aciertos + ' de ' + S.total + '.' : '');
  if (S.modo === 'leccion') {
    avisarLeccion(true);
    const chips = LEC.palabras.length ? LEC.palabras.slice(0, 10).map(w => w.en + ' = ' + w.es) : S.repaso.slice(0, 4).map(q => q.p.slice(0, 40) + ' → ' + q.opciones[q.correcta]);
    LJ.logrado({ detalle: resumen, chips, chipsRotulo: LEC.palabras.length ? 'Lo que practicaste' : 'Para repasar', alOtraVez: () => { Snd.despertar(); empezar(); } });
    return;
  }
  const k = sel.tema + '|' + sel.cancha, rec = prefs.records[k], nuevo = gano && (!rec || a - b > rec.dif);
  if (nuevo) { prefs.records[k] = { dif: a - b, a, b }; guardar(); }
  $('fMedalla').textContent = gano ? '🏆' : empate ? '🤝' : '🎯';
  $('fTit').textContent = gano ? '¡Ganaste el chico!' : empate ? '¡Empate!' : '¡Buen chico!';
  $('fRes').textContent = resumen + (nuevo && rec ? ' ¡Nuevo récord!' : '');
  $('fRepasa').textContent = rec && !nuevo ? 'Tu mejor victoria aquí: ' + rec.a + ' a ' + rec.b + '.' : '';
  $('final').classList.remove('oculto'); $('bOtraVez').focus();
}

/* ---------- la sala ---------- */
function botonOpcion(caja, txt, activo, alElegir, extra) {
  const b = document.createElement('button'); b.type = 'button'; b.className = 'op'; b.setAttribute('aria-pressed', String(activo));
  b.innerHTML = txt + (extra ? ' <small>' + extra + '</small>' : '');
  b.addEventListener('click', () => { Snd.clic(); alElegir(); armarInicio(); const n = caja.querySelector('[aria-pressed="true"]'); if (n) n.focus(); });
  caja.appendChild(b);
}
function armarInicio() {
  const t = $('oTema'), g = $('oGrado'), c = $('oCancha'), p = $('oPersona');
  [t, g, c, p].forEach(x => { x.textContent = ''; });
  Object.keys(TEMAS).forEach(k => botonOpcion(t, '<span aria-hidden="true">' + TEMAS[k].icono + '</span> ' + TEMAS[k].nombre, sel.tema === k, () => { sel.tema = k; guardarSel(); }));
  for (let i = 1; i <= 11; i++) botonOpcion(g, i + '.º', sel.grado === i, () => { sel.grado = i; sel.cancha = canchaDeGrado(i); guardarSel(); });
  Object.keys(F.CANCHAS).forEach(k => { const C = F.CANCHAS[k]; botonOpcion(c, C.nombre, sel.cancha === k, () => { sel.cancha = k; guardarSel(); }, coma(C.D, C.D % 1 ? 1 : 0) + ' m · a ' + C.meta); });
  Object.keys(TCa.PERSONAS || { ana: { nombre: 'Ana' }, leo: { nombre: 'Leo' } }).filter(k => k !== 'tulio').forEach(k => botonOpcion(p, (TCa.PERSONAS ? TCa.PERSONAS[k].nombre : k), sel.persona === k, () => { sel.persona = k; guardarSel(); if (esp) esp.persona(k); }));
  const m = modoDeGrado(sel.grado);
  $('tRecord').textContent = TEMAS[sel.tema].nota + ' ' + (m === 'facil' ? 'En tu grado el ángulo viene puesto y la línea punteada dice dónde cae.' : m === 'media' ? 'La línea punteada muestra más de la mitad del vuelo.' : 'La línea punteada muestra sólo el principio.') +
    (prefs.records[sel.tema + '|' + sel.cancha] ? ' Tu mejor victoria aquí: ' + prefs.records[sel.tema + '|' + sel.cancha].a + ' a ' + prefs.records[sel.tema + '|' + sel.cancha].b + '.' : '');
  $('oAyuda').checked = S.ayuda; $('oCalma').checked = S.calma;
}
function guardarSel() { prefs.sel = Object.assign({}, sel); guardar(); }
function cerrarCapas() { ['inicio', 'pausa', 'final'].forEach(id => $(id).classList.add('oculto')); S.pausa = false; }
function irInicio() {
  Voz.callar(); cerrarCapas(); S.fase = 'menu'; S.seguir = null;
  ocultar(['hud', 'carta', 'mando', 'aviso', 'lupa']); if (esp) { esp.lupa(null); esp.apuntar(null); }
  if (S.modo === 'leccion') { empezar(); return; }
  armarInicio(); $('inicio').classList.remove('oculto'); $('bJugar').focus();
}
function pausa(b) {
  if (S.fase === 'menu' || S.fase === 'fin') return;
  S.pausa = b; $('pausa').classList.toggle('oculto', !b);
  if (b) { Voz.callar(); $('pRes').textContent = 'Ronda ' + S.ronda + '. Tú ' + S.puntos[0] + ', Don Tulio ' + S.puntos[1] + '.' + (S.total ? ' Preguntas bien a la primera: ' + S.aciertos + ' de ' + S.total + '.' : ''); $('bReanudar').focus(); }
  $('bInicio').textContent = S.modo === 'leccion' ? '↻ Empezar de nuevo' : 'Volver al inicio';
}

/* ---------- controles ---------- */
function repetir(id, fn) { // tocar = un paso; mantener = sigue
  const b = $(id); let t1 = 0, t2 = 0;
  const parar = () => { clearTimeout(t1); clearInterval(t2); };
  b.addEventListener('pointerdown', e => { if (b.disabled) return; e.preventDefault(); fn(e.shiftKey ? 5 : 1); parar(); t1 = setTimeout(() => { t2 = setInterval(() => fn(1), 70); }, 380); });
  ['pointerup', 'pointerleave', 'pointercancel'].forEach(ev => b.addEventListener(ev, parar));
  b.addEventListener('click', e => { if (e.detail === 0) fn(1); }); // teclado (Enter / Espacio)
}
repetir('bAngMas', k => paso(k, 0, 0)); repetir('bAngMenos', k => paso(-k, 0, 0));
repetir('bMas', k => paso(0, k, 0)); repetir('bMenos', k => paso(0, -k, 0));
repetir('bDer', k => paso(0, 0, k)); repetir('bIzq', k => paso(0, 0, -k));
$('rAng').addEventListener('input', e => apuntar(+e.target.value, S.tiro.v, S.tiro.lat));
$('rFuerza').addEventListener('input', e => apuntar(S.tiro.ang, +e.target.value, S.tiro.lat));
$('rLat').addEventListener('input', e => apuntar(S.tiro.ang, S.tiro.v, +e.target.value));
$('bLanzar').addEventListener('click', lanzar);
$('bOir').addEventListener('click', oir); $('bVer').addEventListener('click', verPalabra);
$('bTirar').addEventListener('click', cerrarPregunta);
$('bSeguir').addEventListener('click', seguir);
$('bSonido').addEventListener('click', () => { Snd.mudo = !Snd.mudo; prefs.mudo = Snd.mudo; guardar(); if (Snd.mudo) Voz.callar(); hud(); });
$('bCalma').addEventListener('click', () => { S.calma = !S.calma; if (!LEC) { prefs.calma = S.calma; guardar(); } if (esp) esp.calma(S.calma); hud(); anunciar(S.calma ? 'Modo calma: la cámara quieta y chispazos pequeños.' : 'Modo calma apagado.'); });
$('bAyuda').addEventListener('click', () => { S.ayuda = !S.ayuda; if (!LEC) { prefs.ayuda = S.ayuda; guardar(); } lineaPrevia(); hud(); anunciar(S.ayuda ? 'Modo ayuda: la línea punteada entera y la marca de dónde cae.' : 'Modo ayuda apagado.'); });
$('bMenu').addEventListener('click', () => pausa(true));
$('bReanudar').addEventListener('click', () => pausa(false));
$('bInicio').addEventListener('click', irInicio);
$('bJugar').addEventListener('click', () => { Snd.despertar(); empezar(); });
$('oAyuda').addEventListener('change', e => { S.ayuda = e.target.checked; prefs.ayuda = S.ayuda; guardar(); });
$('oCalma').addEventListener('change', e => { S.calma = e.target.checked; prefs.calma = S.calma; guardar(); if (esp) esp.calma(S.calma); });
$('bOtraVez').addEventListener('click', () => { Snd.despertar(); empezar(); });
$('bCambiar').addEventListener('click', irInicio);

addEventListener('keydown', e => {
  if (document.querySelector('.lj-capa')) return;
  const k = e.key, enControl = e.target && /^(BUTTON|INPUT|A)$/.test(e.target.tagName);
  if (k === 'Escape') { if (S.pausa) pausa(false); else pausa(true); e.preventDefault(); return; }
  if (S.pausa || S.fase === 'menu' || S.fase === 'fin') return;
  const l = k.toLowerCase();
  if (l === 'l') { $('bAyuda').click(); return; } if (l === 'c') { $('bCalma').click(); return; } if (l === 'm') { $('bSonido').click(); return; }
  if (S.fase === 'pregunta') {
    if (/^[1-4]$/.test(k)) { responder(+k - 1); return; }
    if (l === 'o') oir(); else if (l === 'v') verPalabra();
    else if ((k === 'Enter' || k === ' ') && S.respondida && !enControl) { e.preventDefault(); cerrarPregunta(); }
    return;
  }
  if (S.seguir && (k === 'Enter' || k === ' ') && !enControl) { e.preventDefault(); seguir(); return; }
  if (S.fase !== 'apuntar') return;
  const enRango = e.target && e.target.type === 'range', x = e.shiftKey ? 5 : 1;
  if (!enRango && (k === 'ArrowLeft' || k === 'ArrowRight')) { e.preventDefault(); paso(0, 0, k === 'ArrowLeft' ? -x : x); return; }
  if (!enRango && (k === 'ArrowUp' || k === 'ArrowDown')) { e.preventDefault(); paso(k === 'ArrowUp' ? x : -x, 0, 0); return; }
  if (l === 'w' || k === '+') { paso(0, x, 0); return; }
  if (l === 's' || k === '-') { paso(0, -x, 0); return; }
  if ((k === ' ' || k === 'Enter') && !enControl) { e.preventDefault(); lanzar(); }
});
document.addEventListener('visibilitychange', () => { if (document.hidden) { Voz.callar(); if (S.fase === 'apuntar') pausa(true); } });
addEventListener('resize', () => setTimeout(medir, 50));
if (window.ResizeObserver) { const ro = new ResizeObserver(() => medir()); ['lupa', 'hud'].forEach(id => ro.observe($(id))); }
if (window.MutationObserver) new MutationObserver(() => medir()).observe($('lupa'), { attributes: true, attributeFilter: ['class'] });
addEventListener('pagehide', () => { if (S.modo === 'leccion' && S.fase !== 'fin' && S.total) avisarLeccion(false); });

/* ---------- el bucle ---------- */
let antes = performance.now();
function bucle(ahora) {
  const dt = Math.min(0.05, (ahora - antes) / 1000); antes = ahora;
  if (esp) esp.cuadro(S.pausa ? 0 : dt);
  requestAnimationFrame(bucle);
}

/* ---------- arrancar ---------- */
function listo() {
  $('cargando').classList.add('oculto');
  if (esp) { esp.calma(S.calma); pizarra(); }
  if (!esp) anunciar('Este equipo no muestra 3D: apunta con los controles y lee lo que pasó con cada tiro.');
  if (S.modo === 'leccion') {
    const chips = LEC.palabras.length ? LEC.palabras.slice(0, 12).map(w => (w.emoji ? w.emoji + ' ' : '') + w.en) : [];
    LJ.portada({ juego: 'Tejo', titulo: LEC.titulo || 'Una partida de tejo con lo de la lección',
      detalle: 'Elige el ángulo y la fuerza y lanza el tejo a la greda: dentro del bocín son 6 puntos, una mecha 3, las dos a la vez 9 y el más cerca del bocín 1. Si contestas bien a la primera, ganas el tejo dorado: un tiro más.',
      chips, chipsRotulo: 'Las palabras de la lección', alJugar: () => { Snd.despertar(); empezar(); } });
  } else { armarInicio(); $('inicio').classList.remove('oculto'); $('bJugar').focus(); }
  requestAnimationFrame(bucle);
}
const fuentes = document.fonts && document.fonts.load ? Promise.all([document.fonts.load('800 32px "Baloo 2"'), document.fonts.ready]).catch(() => {}) : Promise.resolve();
Promise.race([Promise.all([Voz.listo, fuentes]), new Promise(r => setTimeout(r, 2500))]).then(listo);

window.__tejo = {
  estado: () => ({ fase: S.fase, calma: S.calma, ronda: S.ronda, rondas: S.rondas, puntos: S.puntos.slice(), tiro: Object.assign({}, S.tiro), vivas: S.vivas.slice(), cola: S.cola.slice(), dorado: S.dorado,
    aciertos: S.aciertos, total: S.total, fallos: S.fallos, cancha: S.C.id, modo: S.P.modo, q: S.q ? { p: S.q.p, correcta: S.q.correcta, opciones: S.q.opciones } : null, tejos: S.tejos.map(t => ({ j: t.jugador, tipo: t.res.tipo, d: t.res.d, mechas: t.res.mechas, embo: t.res.embocinada })), stats: Object.assign({}, S.stats) }),
  tiro: (a, v, l) => apuntar(a, v, l, true), lanzar, responder, seguir, cerrarPregunta, empezar,
  /** apunta para que el tejo quede en el bocín ('embocinada'), en una mecha viva ('mecha'), en las dos ('monona') o lejos ('corto') */
  ganar(que) {
    if (S.fase !== 'apuntar') return false;
    const M = F.mechas(S.C), ang = S.P.angFijo ? 40 : 40;
    let s = 0, u = 0;
    if (que === 'mecha' || que === 'monona') { const m = M[S.vivas[0]]; if (!m) return false; const k = que === 'mecha' ? 1 : (S.C.R - 0.3 * S.C.r - 0.004) / (S.C.R + 0.03); s = m.s * k; u = m.u * k; }
    if (que === 'corto') s = -2;
    let t = que === 'corto' ? { ang, v: S.C.vMin, lat: 0 } : F.apuntarQuedar(S.C, s, u, ang, []);
    if (que !== 'corto') { // con los pasos de verdad de los controles: el vecino que da lo pedido
      const q = F.aPasos(S.C, t), bueno = r => (que === 'embocinada' ? r.embocinada : que === 'mecha' ? r.mechas.length && !r.embocinada : r.embocinada && r.mechas.length);
      let mejor = null;
      for (let dv = -6; dv <= 6 && !mejor; dv++) for (let dl = -3; dl <= 3 && !mejor; dl++) {
        const c = F.aPasos(S.C, { ang: q.ang, v: q.v + dv * S.C.pasoV, lat: q.lat + dl * S.C.pasoLat });
        if (bueno(F.lanzar(S.C, c, S.vivas))) mejor = c;
      }
      t = mejor || q;
    }
    apuntar(t.ang, t.v, t.lat, true); lanzar(); return S.tiro;
  }
};
})();
