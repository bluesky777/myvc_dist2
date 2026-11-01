/* Máquina Loca — el juego: la sala (preguntas de qué tema, grado y la máquina por la que se empieza), el modo lección
   (../leccion.js), el armado en la rejilla, «¡Andando!» (la física de fisica.js, grabada y reproducida), las
   preguntas que ganan piezas especiales, la voz en inglés, las barras de energía y los resultados.
   - Armar sin arrastrar: se elige la pieza de la bandeja (botón o 1 a 9), se lleva el cursor a la casilla (ratón,
     dedo —tocar y volver a tocar—, flechas o los botones ◀ ▲ ▼ ▶) y se pone (clic, Enter o «Poner»); Q y E giran; tocar
     una pieza puesta la vuelve a tomar; Supr la devuelve. Nunca hay reloj ni se pierde la partida.
   - Cada intento se graba entero antes de verse (la física es determinista): «Verla otra vez» y la cámara lenta
     repiten exactamente lo mismo, y lo que pasa se narra en texto («la pesa cae en la palanca…»).
   - Inglés: sólo los MP3 grabados de la Biblioteca. Sin MP3: silencio y lo escrito. Jamás speechSynthesis.
   - Progreso (sala): localStorage juegos3d.maquina {sel, calma, mudo, energia, estrellas: {nivel: 0..3}}.
     En modo lección no se guarda nada.
   Depuración: window.__maquina (estado, resolver() pone la solución, andar(), elegir(k), saltar()). */
(function () {
'use strict';
const $ = id => document.getElementById(id);
const LJ = window.LeccionJuego, F = window.MaquinaFisica, NV = window.MaquinaNiveles, MC = window.MaquinaContenido, TL = window.MaquinaTaller || {};
const CLAVE = 'juegos3d.maquina';
const leer = () => { try { return JSON.parse(localStorage.getItem(CLAVE)) || {}; } catch (e) { return {}; } };
const prefs = leer(); if (!prefs.estrellas || typeof prefs.estrellas !== 'object') prefs.estrellas = {};
const BIBLIO = /^(localhost|127\.0\.0\.1)$/.test(location.hostname) ? 'http://localhost:8765/' : 'https://biblioteca.micolevirtual.com/';
const reducir = matchMedia('(prefers-reduced-motion: reduce)').matches;
const GLIFOS = [{ f: '●', c: '#c2410c', n: 'círculo' }, { f: '▲', c: '#1864ab', n: 'triángulo' }, { f: '■', c: '#2b8a3e', n: 'cuadrado' }, { f: '◆', c: '#7048e8', n: 'rombo' }];
const PZ = {
  rampa: { emoji: '📐', nombre: 'rampa', art: 'la', idea: 'plano inclinado de 3 casillas' },
  tabla: { emoji: '📏', nombre: 'tabla', art: 'la', idea: 'plano inclinado corto, de 2 casillas' },
  resorte: { emoji: '➰', nombre: 'resorte', art: 'el', idea: 'rebota y devuelve la energía' },
  palanca: { emoji: '⚖️', nombre: 'palanca', art: 'la', idea: 'gira en su punto de apoyo' },
  polea: { emoji: '🏗️', nombre: 'polea', art: 'la', idea: 'una cubeta baja y la otra sube' },
  cinta: { emoji: '⏩', nombre: 'cinta', art: 'la', idea: 'con motor: arrastra lo que lleva' },
  ventilador: { emoji: '💨', nombre: 'ventilador', art: 'el', idea: 'su aire empuja sin tocar' },
  iman: { emoji: '🧲', nombre: 'imán', art: 'el', idea: 'atrae el hierro y el acero' }
};
const TIPOS = Object.keys(F.TIPOS);
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const barajar = MC.barajar;
const sinEmoji = t => String(t).replace(/^[^A-Za-zÀ-ÿ0-9¿¡«$(]+/u, '').trim() || String(t);
const num = (v, d) => (Math.round(v * Math.pow(10, d || 0)) / Math.pow(10, d || 0)).toLocaleString('es-CO');
const giroTxt = p => {
  const a = p.a;
  if (p.t === 'palanca') return a === -1 ? 'con la punta derecha abajo' : 'con la punta izquierda abajo';
  if (p.t === 'cinta') return a === -1 ? 'llevando hacia la izquierda' : 'llevando hacia la derecha';
  if (p.t === 'ventilador') return { 0: 'soplando a la derecha', 90: 'soplando hacia arriba', 180: 'soplando a la izquierda', 270: 'soplando hacia abajo' }[a];
  if (p.t === 'polea' || p.t === 'iman') return '';
  if (a === 0) return 'plana';
  if (a === 90) return 'de pie';
  return 'inclinada ' + Math.abs(a) + '° ' + (a > 0 ? 'bajando a la izquierda' : 'bajando a la derecha');
};
const casilla = (c, f) => 'columna ' + (c + 1) + ', fila ' + (f + 1);

/* ---------- modo lección: lo que manda la lección (FORMATO.md §3.9) ---------- */
const CFG = LJ && LJ.activo && LJ.cfg ? LJ.cfg : null;
const LEC = (() => {
  if (!CFG) return null;
  const preguntas = (Array.isArray(CFG.preguntas) ? CFG.preguntas : []).filter(q => q && typeof q.p === 'string' && q.p.trim() && Array.isArray(q.opciones)
    && q.opciones.length >= 2 && q.opciones.length <= 4 && q.opciones.every(o => (typeof o === 'string' && o.trim()) || typeof o === 'number') && Number.isInteger(q.correcta) && q.correcta >= 0 && q.correcta < q.opciones.length)
    .map(q => { const p = q.p.trim(), oir = typeof q.oir === 'string' ? q.oir.trim() : ''; return { p, opciones: q.opciones.map(o => String(o).trim()), correcta: q.correcta, oir, escucha: !!oir && p.toLowerCase().indexOf(oir.toLowerCase()) < 0 }; });
  const palabras = (Array.isArray(CFG.palabras) ? CFG.palabras : []).filter(p => p && typeof p.en === 'string' && p.en.trim() && typeof p.es === 'string' && p.es.trim())
    .map(p => ({ en: p.en.trim(), es: p.es.trim(), emoji: typeof p.emoji === 'string' ? p.emoji.trim() : '' }));
  const lista = x => (Array.isArray(x) ? x : x == null || x === '' ? [] : [x]);
  const quitarTilde = s => String(s).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').trim();
  const ALIAS = { 'plano inclinado': 'rampa', 'plano': 'rampa', 'tabla': 'rampa', 'trampolin': 'resorte', 'muelle': 'resorte', 'balancin': 'palanca', 'catapulta': 'palanca', 'cinta transportadora': 'cinta', 'motor': 'cinta', 'aire': 'ventilador' };
  const maquinas = lista(CFG.maquinas).map(m => { const k = quitarTilde(m); return ALIAS[k] || (F.TIPOS[k] ? k : null); }).filter((m, i, a) => m && a.indexOf(m) === i);
  const niveles = Number.isInteger(CFG.niveles) ? clamp(CFG.niveles, 1, 12) : 0;
  if (!preguntas.length && palabras.length < 2 && !maquinas.length && !niveles) { console.warn('[maquina] la lección no mandó nada que hacer: va la sala'); return null; }
  return { titulo: (LJ.titulo || '').trim(), preguntas, palabras, maquinas, niveles, energia: CFG.energia === true };
})();
const guardar = () => { if (LEC) return; try { localStorage.setItem(CLAVE, JSON.stringify(prefs)); } catch (e) { /* sin almacenamiento */ } };

// La dificultad (FORMATO.md §3.9.1). Nunca se pierde la partida: cambia la ayuda.
// facil: pistas sin límite (y «Ponerla» la pone), una opción mala tachada y lo fallado vuelve de repaso; máquinas de dif 1 y 2.
// media: 3 pistas por máquina y repaso; normal: 1 pista por máquina y sin repaso.
function params(modo) {
  return { modo, pistas: modo === 'facil' ? Infinity : modo === 'media' ? 3 : 1, ponerPista: modo !== 'normal', tachar: modo === 'facil', repaso: modo !== 'normal', difMax: modo === 'facil' ? 2 : 3 };
}
const modoDeGrado = g => (g <= 2 ? 'facil' : g <= 5 ? 'media' : 'normal');
const VOZ = (() => { const v = CFG && typeof CFG.voz === 'string' && /^(https?:\/\/|\/)/.test(CFG.voz.trim()) ? CFG.voz.trim() : BIBLIO + 'voz/'; return /\/$/.test(v) ? v : v + '/'; })();

/* ---------- el sonido: efectos sintetizados (0 KB de audio) ---------- */
const Son = (() => {
  let ctx = null, master = null, ruidoB = null;
  const o = { mudo: !LEC && !!prefs.mudo, vol: 0.8 };
  function despertar() {
    if (!ctx) { try { ctx = new (window.AudioContext || window.webkitAudioContext)(); master = ctx.createGain(); master.connect(ctx.destination); } catch (e) { return; } }
    if (ctx.state === 'suspended') ctx.resume();
    master.gain.value = o.mudo ? 0 : o.vol * 0.6;
  }
  function tono(f, t0, dur, tipo, g, f2) {
    const os = ctx.createOscillator(), ga = ctx.createGain();
    os.type = tipo || 'sine'; os.frequency.setValueAtTime(f, t0); if (f2) os.frequency.exponentialRampToValueAtTime(f2, t0 + dur);
    ga.gain.setValueAtTime(0.0001, t0); ga.gain.exponentialRampToValueAtTime(g || 0.3, t0 + 0.012); ga.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    os.connect(ga); ga.connect(master); os.start(t0); os.stop(t0 + dur + 0.02);
  }
  function ruido(t0, dur, g, filtro) {
    if (!ruidoB) { ruidoB = ctx.createBuffer(1, ctx.sampleRate * 0.5, ctx.sampleRate); const d = ruidoB.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1; }
    const s = ctx.createBufferSource(), fl = ctx.createBiquadFilter(), ga = ctx.createGain(); s.buffer = ruidoB;
    fl.type = 'bandpass'; fl.frequency.value = filtro || 800; ga.gain.setValueAtTime(g, t0); ga.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    s.connect(fl); fl.connect(ga); ga.connect(master); s.start(t0); s.stop(t0 + dur);
  }
  function efecto(n, x) {
    if (!ctx || o.mudo) return;
    const t = ctx.currentTime;
    if (n === 'poner') { tono(180, t, 0.08, 'triangle', 0.4, 90); ruido(t, 0.06, 0.15, 1400); }
    else if (n === 'tomar') tono(520, t, 0.08, 'triangle', 0.2, 780);
    else if (n === 'girar') tono(900, t, 0.04, 'square', 0.06);
    else if (n === 'no') { tono(220, t, 0.12, 'square', 0.06); tono(196, t + 0.1, 0.16, 'square', 0.05); }
    else if (n === 'elegir') tono(1200, t, 0.05, 'triangle', 0.12);
    else if (n === 'andar') { [392, 523, 659].forEach((f, i) => tono(f, t + i * 0.07, 0.14, 'triangle', 0.18)); }
    else if (n === 'golpe') { const k = clamp(x / 12, 0.05, 1); tono(110 + k * 60, t, 0.09, 'sine', 0.25 * k + 0.05, 60); ruido(t, 0.05, 0.1 * k, 600); }
    else if (n === 'metal') { const k = clamp(x / 12, 0.05, 1); tono(1400, t, 0.18, 'triangle', 0.08 * k + 0.02); tono(2100, t, 0.12, 'sine', 0.05 * k); }
    else if (n === 'resorte') tono(220, t, 0.35, 'sine', 0.3, 660);
    else if (n === 'palanca') { tono(160, t, 0.18, 'sawtooth', 0.06, 120); ruido(t, 0.12, 0.08, 400); }
    else if (n === 'polea') { for (let i = 0; i < 4; i++) tono(300 + i * 40, t + i * 0.06, 0.06, 'square', 0.03); }
    else if (n === 'aire') ruido(t, 0.5, 0.12, 2400);
    else if (n === 'iman') tono(140, t, 0.3, 'sawtooth', 0.05, 280);
    else if (n === 'cinta') { for (let i = 0; i < 3; i++) tono(240, t + i * 0.08, 0.05, 'square', 0.03); }
    else if (n === 'tuerca') { tono(1319, t, 0.4, 'sine', 0.22); tono(1976, t + 0.08, 0.35, 'sine', 0.15); }
    else if (n === 'bien') [523, 659, 784, 1047].forEach((f, i) => tono(f, t + i * 0.09, 0.3, 'triangle', 0.22));
    else if (n === 'mal') { tono(330, t, 0.2, 'sawtooth', 0.06, 260); tono(262, t + 0.18, 0.3, 'sawtooth', 0.05, 200); }
    else if (n === 'canasta') { ruido(t, 0.25, 0.2, 3000); [523, 659, 784, 1047, 1319].forEach((f, i) => tono(f, t + 0.15 + i * 0.08, 0.35, 'triangle', 0.2)); }
    else if (n === 'fallo') { tono(392, t, 0.25, 'triangle', 0.15, 330); tono(330, t + 0.22, 0.4, 'triangle', 0.12, 262); }
  }
  return Object.assign(o, { despertar, efecto, aplicar() { if (master) master.gain.value = o.mudo ? 0 : o.vol * 0.6; } });
})();

/* ---------- la voz en inglés: sólo MP3 grabados (la cola de leccion.js: uno no corta a otro) ---------- */
const Voz = (() => {
  let lista = null, audio = null, n = 0;
  const listo = fetch(VOZ + 'en/index.json', { credentials: 'omit' }).then(r => (r.ok ? r.json() : [])).then(a => { lista = new Set(Array.isArray(a) ? a : []); }).catch(() => { lista = new Set(); });
  const slug = t => String(sinEmoji(t)).trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  const voces = CFG && CFG.voces && typeof CFG.voces === 'object' ? CFG.voces : {};
  const carpeta = s => (typeof voces[s] === 'string' && /^[a-z-]+$/.test(voces[s]) ? voces[s] : null);
  const tiene = t => { if (t == null || !String(t).trim()) return false; const s = slug(t); return !!s && s.length <= 200 && (!!carpeta(s) || !!(lista && lista.has(s))); };
  const cola = LJ && LJ.cola && typeof LJ.cola.poner === 'function' ? LJ.cola : null;
  function callar() { if (cola) cola.callar(); n++; if (audio) { audio.onended = audio.onerror = null; audio.pause(); audio = null; } }
  function decir(texto, opc) {
    if (Son.mudo || !tiene(texto)) return Promise.resolve(false);
    opc = opc || {};
    const s = slug(texto), dirs = [carpeta(s), lista && lista.has(s) ? 'en' : null].filter((d, i, a) => d && a.indexOf(d) === i), urls = dirs.map(d => VOZ + d + '/' + s + '.mp3');
    if (cola) return cola.poner({ urls, clave: 'maquina:' + s, grupo: opc.grupo, caduca: opc.caduca || 6000, vigente: () => !Son.mudo && !S.pausa });
    n++; if (audio) { audio.onended = audio.onerror = null; audio.pause(); audio = null; }
    const mio = n;
    return new Promise(fin => { const probar = j => { if (mio !== n || j >= urls.length) { fin(false); return; } const a = new Audio(urls[j]); audio = a; a.onended = () => { if (audio === a) audio = null; fin(true); }; a.onerror = () => probar(j + 1); a.play().catch(() => fin(false)); }; probar(0); });
  }
  return { listo, tiene, decir, callar };
})();

/* ---------- estado ---------- */
const sel = Object.assign({ tema: 'maquinas', grado: 5, nivel: 't1n1' }, prefs.sel || {});
if (!MC.TEMAS.some(t => t.id === sel.tema)) sel.tema = 'maquinas';
if (!NV.NIVELES.some(n => n.id === sel.nivel)) sel.nivel = NV.NIVELES[0].id;
const S = {
  modo: LEC ? 'leccion' : 'sala', fase: 'menu', pausa: false,
  calma: LEC ? reducir : (typeof prefs.calma === 'boolean' ? prefs.calma : reducir),
  energia: LEC ? LEC.energia : !!prefs.energia,
  P: params('normal'), tareas: [], idx: -1, t: null, ingles: false,
  nivel: null, base: null, puestas: [], inv: {}, especial: {}, mano: null, cur: { c: 7, f: 5 }, occ: null,
  res: null, rep: null, lenta: false, pistas: 0, usoPista: false, intentos: 0, ganados: [],
  aciertos: 0, total: 0, fallos: 0, estrellas: 0, maquinas: 0, sinPista: 0, repasar: []
};
let taller = null;
try { if (TL.disponible) taller = TL.crear($('gl'), { biblio: BIBLIO, calma: S.calma }); } catch (e) { console.warn('Máquina: sin 3D (' + e.message + ')'); taller = null; }
if (!taller) document.body.classList.add('sin3d');

/* ---------- avisos para el lector de pantalla ---------- */
let ultAnuncio = '';
function anunciar(t, fuerte) { const el = $(fuerte ? 'alerta' : 'anuncio'); if (t === ultAnuncio) t += ' '; ultAnuncio = t; el.textContent = t; }
function estado(t) { $('estado').textContent = t || ''; }
let narraT = 0;
function narrar(t) { const n = $('narra'); n.textContent = t; n.classList.remove('oculto'); clearTimeout(narraT); narraT = setTimeout(() => n.classList.add('oculto'), 2600); anunciar(t); }

/* ---------- las tareas: niveles y preguntas ---------- */
function nivelesPara(maquinas, cuantos, difMax) {
  const usa = n => (n.sol || []).concat(n.fijas || []).map(p => (p.t === 'tabla' ? 'rampa' : p.t));
  const orden = (a, b) => a.dif - b.dif || a.taller - b.taller;
  let ps = NV.NIVELES.filter(n => n.dif <= difMax);
  if (!ps.length) ps = NV.NIVELES.slice();
  let elegidos = [];
  if (maquinas && maquinas.length) {
    // primero, la máquina más fácil de cada pieza pedida; luego las demás que las usan; luego, si faltan, las fáciles
    maquinas.forEach(m => { const n = ps.filter(x => usa(x).indexOf(m) >= 0 && elegidos.indexOf(x) < 0).sort(orden)[0]; if (n) elegidos.push(n); });
    const cuenta = n => usa(n).filter(t => maquinas.indexOf(t) >= 0).length;
    ps.filter(n => elegidos.indexOf(n) < 0 && cuenta(n)).sort((a, b) => cuenta(b) - cuenta(a) || orden(a, b)).forEach(n => elegidos.push(n));
  }
  ps.slice().sort(orden).forEach(n => { if (elegidos.indexOf(n) < 0) elegidos.push(n); });
  elegidos = elegidos.slice(0, Math.max(1, Math.min(cuantos, elegidos.length))).sort(orden);
  const out = [];
  for (let k = 0; out.length < cuantos; k++) { const n = elegidos[k % elegidos.length]; out.push(k >= elegidos.length || Math.random() < 0.4 ? F.espejo(n) : n); }
  return out;
}
function preguntasLeccion() {
  const ps = LEC.preguntas.map(q => Object.assign({}, q));
  if (LEC.palabras.length >= 2) {
    const pw = LEC.palabras, es = w => (w.emoji ? w.emoji + ' ' : '') + w.es;
    pw.forEach((w, k) => {
      const otras = barajar(pw.filter(x => x.es !== w.es)).slice(0, Math.min(2, pw.length - 1));
      if (S.P.modo !== 'facil' && k % 3 === 2) {
        const ops = barajar([w].concat(otras));
        ps.push({ p: '¿Cómo se dice «' + es(w) + '» en inglés?', opciones: ops.map(x => x.en), correcta: ops.indexOf(w), opcionesEn: true });
      } else {
        const ops = barajar([w].concat(otras));
        ps.push({ p: k % 2 ? '«' + w.en + '»: ¿qué quiere decir?' : '¿Qué quiere decir?', oir: w.en, escucha: k % 2 === 0, opciones: ops.map(es), correcta: ops.indexOf(w) });
      }
    });
  }
  return ps.slice(0, 16);
}
function armarTareas() {
  let niveles, preguntas;
  if (LEC) {
    preguntas = preguntasLeccion();
    const n = LEC.niveles || (preguntas.length ? clamp(Math.ceil(preguntas.length / 2), 2, 6) : 4);
    niveles = nivelesPara(LEC.maquinas, n, S.P.difMax);
  } else {
    const i = Math.max(0, NV.NIVELES.findIndex(n => n.id === sel.nivel));
    niveles = NV.NIVELES.slice(i).concat(NV.NIVELES.slice(0, i)).slice(0, 5).map(n => (prefs.estrellas[n.id] && Math.random() < 0.5 ? F.espejo(n) : n));
    preguntas = sel.tema === 'solo' ? [] : MC.preguntas(sel.tema, sel.grado, niveles.length);
  }
  S.ingles = preguntas.some(q => q.oir || q.opcionesEn) || (LEC ? LEC.palabras.length > 0 : sel.tema === 'ingles');
  // antes de cada máquina, sus preguntas (repartidas): la buena gana la pieza especial de esa máquina
  const tareas = [], porNivel = niveles.length ? Math.ceil(preguntas.length / niveles.length) : 0;
  niveles.forEach((n, k) => {
    preguntas.slice(k * porNivel, (k + 1) * porNivel).forEach(q => tareas.push({ tipo: 'pregunta', q, nivel: n }));
    tareas.push({ tipo: 'nivel', nivel: n });
  });
  return tareas;
}

/* ---------- empezar y seguir ---------- */
function empezar() {
  Son.despertar();
  const modo = LEC ? (LJ.dificultad || 'normal') : modoDeGrado(sel.grado);
  S.P = params(modo);
  Object.assign(S, { tareas: armarTareas(), idx: -1, aciertos: 0, total: 0, fallos: 0, estrellas: 0, maquinas: 0, sinPista: 0, repasar: [], especial: {}, pausa: false });
  S.total = S.tareas.length;
  ['inicio', 'final', 'pausa'].forEach(id => $(id).classList.add('oculto'));
  $('hud').classList.remove('oculto');
  siguiente();
}
function siguiente() {
  cerrarAviso(); $('carta').classList.add('oculto');
  // el repaso de las preguntas falladas va justo antes de la máquina siguiente
  S.idx++;
  if (S.repasar.length && S.tareas[S.idx] && S.tareas[S.idx].tipo === 'nivel') { S.tareas.splice(S.idx, 0, S.repasar.shift()); }
  if (S.idx >= S.tareas.length) { if (S.repasar.length) { S.tareas.push(S.repasar.shift()); } else { terminar(); return; } }
  S.t = S.tareas[S.idx];
  if (S.t.tipo === 'pregunta') mostrarPregunta(S.t); else abrirNivel(S.t.nivel);
}
function marcador() {
  const nN = S.tareas.filter(t => t.tipo === 'nivel').length, esta = S.tareas.filter((t, i) => i <= S.idx && t.tipo === 'nivel').length + (S.t && S.t.tipo === 'pregunta' ? 1 : 0);
  const n = S.nivel, tl = n ? NV.TALLERES[n.taller - 1] : null;
  $('hIco').textContent = tl ? tl.emoji : '🛠️';
  $('hNivel').textContent = S.t && S.t.tipo === 'pregunta' ? 'Pregunta' : (n ? n.nombre : '');
  $('hInfo').textContent = 'Máquina ' + clamp(esta, 1, nN) + ' de ' + nN + ' · ⭐ ' + S.estrellas;
}
function avisar() { if (LEC && LJ) { const nN = S.tareas.filter(t => t.tipo === 'nivel').length; LJ.progreso({ aciertos: S.aciertos, total: S.total, fallos: S.fallos, nivel: S.maquinas + ' de ' + nN + ' máquinas' }); } }

/* ---------- la pregunta ---------- */
let oidas = 0;
function mostrarPregunta(t) {
  S.fase = 'pregunta'; S.nivel = null; marcador();
  $('bandeja').classList.add('oculto'); $('energia').classList.add('oculto');
  if (taller) { taller.cursor(0, 0, false); taller.fantasma(null); taller.pista(null); taller.rastro(null); if (t.nivel) { taller.nivel(t.nivel); taller.piezas((t.nivel.fijas || []).map(p => Object.assign({ fija: true }, p))); } }
  const q = t.q, esp = t.nivel && t.nivel.especial, c = $('carta');
  $('cTipo').textContent = t.repaso ? '↺ Repaso' : esp ? 'Acierta y ganas: ' + PZ[esp].emoji + ' ' + PZ[esp].nombre + ' para la próxima máquina' : 'Pregunta';
  $('cPreg').textContent = q.p;
  const hayMp3 = q.oir && Voz.tiene(q.oir) && !Son.mudo;
  oidas = 0;
  const pal = $('cPalabra'); pal.textContent = q.oir || '';
  const tapada = q.oir && q.escucha && hayMp3;
  pal.classList.toggle('oculto', !q.oir || tapada); $('cBocina').classList.toggle('oculto', !tapada);
  $('bOir').classList.toggle('oculto', !hayMp3); $('bVer').classList.toggle('oculto', !tapada);
  const ops = $('cOps'); ops.innerHTML = '';
  const tachar = S.P.tachar && q.opciones.length > 2 ? q.opciones.map((_, i) => i).filter(i => i !== q.correcta)[Math.floor(Math.random() * (q.opciones.length - 1))] : -1;
  q.opciones.forEach((o, i) => {
    const g = GLIFOS[i], b = document.createElement('button');
    b.type = 'button'; b.className = 'op'; b.style.setProperty('--g', g.c);
    b.innerHTML = '<span class="gl" aria-hidden="true">' + g.f + '</span><span class="n">' + (i + 1) + '</span><span class="tx"></span>';
    b.querySelector('.tx').textContent = o; if (q.opcionesEn) b.querySelector('.tx').lang = 'en';
    b.setAttribute('aria-label', (i + 1) + ', ' + g.n + ': ' + o);
    if (i === tachar) { b.disabled = true; b.classList.add('tachada'); b.setAttribute('aria-label', (i + 1) + ': ' + o + ' (descartada por la pista)'); }
    b.addEventListener('click', () => responder(i));
    ops.appendChild(b);
  });
  $('cFeed').textContent = ''; $('cFeed').className = 'feed'; $('bCSeguir').classList.add('oculto');
  c.classList.remove('oculto');
  t.contestada = false;
  if (q.oir && hayMp3) oir();
  anunciar((t.repaso ? 'Repaso. ' : '') + q.p + (q.oir && !tapada ? ' ' + q.oir : '') + '. ' + q.opciones.map((o, i) => (i + 1) + ': ' + o).join('. '));
  setTimeout(() => { const b = ops.querySelector('.op:not(:disabled)'); if (b) b.focus({ preventScroll: true }); }, 50);
}
function oir() {
  const q = S.t && S.t.q; if (!q || !q.oir) return;
  Voz.decir(q.oir, { grupo: 'pregunta' }).then(ok => { if (ok) { oidas++; if (oidas >= 3) ver(); } });
}
function ver() { $('cPalabra').classList.remove('oculto'); $('cBocina').classList.add('oculto'); $('bVer').classList.add('oculto'); }
function responder(i) {
  const t = S.t; if (S.fase !== 'pregunta' || !t || t.contestada) return;
  const q = t.q, bien = i === q.correcta;
  t.contestada = true;
  if (q.opcionesEn) Voz.decir(q.opciones[i]);
  [...$('cOps').children].forEach((b, k) => { b.disabled = true; if (k === q.correcta) b.classList.add('buena'); else if (k === i) b.classList.add('mala'); });
  const fb = $('cFeed');
  if (bien) {
    Son.efecto('bien');
    if (!t.repaso) S.aciertos++;
    const esp = t.nivel && t.nivel.especial;
    if (esp && !t.repaso) S.especial[t.nivel.id] = (S.especial[t.nivel.id] || 0) + 1;
    fb.className = 'feed bien';
    fb.textContent = '✔ ¡Bien!' + (esp && !t.repaso ? ' Ganaste ' + PZ[esp].emoji + ' ' + PZ[esp].art + ' ' + PZ[esp].nombre + ' para la próxima máquina.' : '') + (q.por ? ' ' + q.por : '');
    if (S.ingles) Voz.decir('great-job');
  } else {
    Son.efecto('mal'); S.fallos++;
    fb.className = 'feed mal';
    fb.textContent = '✘ Era: ' + q.opciones[q.correcta] + '.' + (q.por ? ' ' + q.por : '');
    if (S.P.repaso && !t.repaso) S.repasar.push({ tipo: 'pregunta', q, nivel: null, repaso: true });
  }
  anunciar(fb.textContent, true);
  avisar();
  const b = $('bCSeguir'); b.classList.remove('oculto'); setTimeout(() => b.focus({ preventScroll: true }), 30);
}

/* ---------- el nivel ---------- */
const comprobados = {};
function abrirNivel(n) {
  // red de seguridad: cada máquina se comprueba antes de salir (la misma física; en node lo hace comprobar.cjs)
  if (!(n.id in comprobados)) { const r = F.comprobar(n); comprobados[n.id] = r.ok; if (!r.ok) console.warn('[maquina] ' + n.id + ' no pasa la comprobación: ' + r.errores.join(' · ')); }
  if (!comprobados[n.id]) { S.t.tipo = 'saltada'; S.total--; siguiente(); return; }
  S.fase = 'intro'; S.nivel = n; S.base = n; S.puestas = []; S.mano = null; S.res = null; S.rep = null; S.usoPista = false; S.pistas = 0; S.intentos = 0;
  S.inv = Object.assign({}, n.piezas);
  const ganadas = S.especial[n.id] || 0;
  if (ganadas && n.especial) S.inv[n.especial] = (S.inv[n.especial] || 0) + ganadas;
  S.ganadas = ganadas;
  S.occ = F.ocupadas(n);
  S.cur = { c: 7, f: 5 }; buscarLibre();
  $('carta').classList.add('oculto');
  if (taller) { taller.nivel(n); taller.piezas((n.fijas || []).map(p => Object.assign({ fija: true }, p))); taller.rastro(null); taller.pista(null); }
  marcador(); pintarBandeja(); refrescar();
  $('bandeja').classList.remove('oculto'); medirSeguro();
  const inv = Object.keys(S.inv).filter(t => S.inv[t] > 0).map(t => PZ[t].emoji + ' ' + PZ[t].nombre + ' ×' + S.inv[t]);
  const det = ['Lleva la pelota ⚽ (' + (n.bola.tipo === 'canica' ? 'esta vez, una canica de acero' : 'el balón') + ') a la canasta 🏁.', 'Tus piezas: ' + inv.join(', ') + '.'];
  if (ganadas) det.push('✨ Ganaste ' + (ganadas > 1 ? ganadas + ' ' : '') + PZ[n.especial].emoji + ' ' + PZ[n.especial].nombre + ' con tus respuestas: también te sirve.');
  if (n.tuerca) det.push('⭐ Extra: haz que pase por la tuerca dorada.');
  if ((n.fijas || []).length) det.push('🔒 Las piezas con candado son del nivel: no se mueven.');
  mostrarAviso({ est: NV.TALLERES[n.taller - 1].emoji, tit: n.nombre, txt: n.idea, det, botones: [{ txt: '🛠️ ¡A armar!', fn: () => { cerrarAviso(); S.fase = 'armar'; refrescar(); anunciar('A armar. ' + ayudaCursor()); } }] });
}
function buscarLibre() {
  for (let r = 0; r < 16; r++) for (let dc = -r; dc <= r; dc++) for (let df = -r; df <= r; df++) {
    const c = S.cur.c + dc, f = S.cur.f + df;
    if (c >= 0 && c < F.COLS && f >= 0 && f < F.FILAS && !S.occ.has(c + ',' + f) && !piezaEn(c, f)) { S.cur = { c, f }; return; }
  }
}
const piezaEn = (c, f) => S.puestas.find(p => p.c === c && p.f === f) || null;
const fijaEn = (c, f) => (S.nivel.fijas || []).find(p => p.c === c && p.f === f) || null;
function pintarBandeja() {
  const inv = $('inv'); inv.innerHTML = '';
  const tipos = TIPOS.filter(t => (S.base.piezas[t] || 0) + (t === S.base.especial && S.ganadas ? S.ganadas : 0) > 0);
  tipos.forEach((t, k) => {
    const b = document.createElement('button'); b.type = 'button'; b.className = 'pz'; b.dataset.t = t;
    b.style.setProperty('--c', TL.COLOR ? TL.COLOR[t] : '#888');
    b.innerHTML = '<span class="e" aria-hidden="true">' + PZ[t].emoji + '</span><span class="nm"></span><span class="ct"></span><small class="tk" aria-hidden="true">' + (k + 1) + '</small>';
    b.querySelector('.nm').textContent = PZ[t].nombre;
    b.addEventListener('click', e => { elegir(t); if (e.detail) b.blur(); });
    inv.appendChild(b);
  });
}
function refrescar() {
  if (!S.nivel) return;
  const armando = S.fase === 'armar';
  [...$('inv').children].forEach(b => {
    const t = b.dataset.t, n = S.inv[t] || 0, enMano = S.mano && S.mano.t === t;
    b.querySelector('.ct').textContent = '×' + n;
    b.disabled = !armando || (n <= 0 && !enMano);
    b.setAttribute('aria-pressed', enMano ? 'true' : 'false');
    b.setAttribute('aria-label', PZ[t].nombre + ', ' + PZ[t].idea + ': quedan ' + n + (enMano ? '; la llevas en la mano' : ''));
    b.classList.toggle('especial', t === S.base.especial && S.ganadas > 0);
  });
  const sobre = piezaEn(S.cur.c, S.cur.f);
  $('tPoner').textContent = S.mano ? 'Poner' : sobre ? 'Tomar' : 'Poner';
  $('bPoner').disabled = !armando || (!S.mano && !sobre);
  $('bGirarI').disabled = $('bGirarD').disabled = !armando || (!S.mano && !sobre);
  $('bQuitar').disabled = !armando || (!S.mano && !sobre);
  ['bIzq', 'bArr', 'bAba', 'bDer'].forEach(id => { $(id).disabled = !armando; });
  const quedan = S.P.pistas === Infinity ? '' : String(Math.max(0, S.P.pistas - S.pistas));
  $('nPista').textContent = quedan; $('bPista').disabled = !armando || (S.P.pistas !== Infinity && S.pistas >= S.P.pistas);
  $('bAndar').disabled = !armando;
  $('mandos').classList.toggle('oculto', S.fase === 'andando'); $('mandosRun').classList.toggle('oculto', S.fase !== 'andando');
  $('bLenta').setAttribute('aria-pressed', S.lenta ? 'true' : 'false');
  if (taller) {
    taller.cursor(S.cur.c, S.cur.f, armando);
    if (S.mano && armando) { const p = Object.assign({}, S.mano, S.cur); taller.fantasma(p, !F.sePuede(S.nivel, S.puestas, p, S.occ)); }
    else taller.fantasma(null);
  }
  if (armando) estado(lineaEstado());
}
function lineaEstado() {
  const sobre = piezaEn(S.cur.c, S.cur.f), fija = fijaEn(S.cur.c, S.cur.f);
  if (S.mano) {
    const p = Object.assign({}, S.mano, S.cur), r = F.sePuede(S.nivel, S.puestas, p, S.occ), g = giroTxt(p);
    return PZ[p.t].emoji + ' ' + PZ[p.t].nombre + (g ? ' ' + g : '') + ' · ' + casilla(p.c, p.f) + (r ? ' · ✖ ' + r : ' · Enter para ponerla');
  }
  if (sobre) return PZ[sobre.t].emoji + ' Tu ' + PZ[sobre.t].nombre + ' ' + giroTxt(sobre) + ' · Enter la toma, Q/E la giran';
  if (fija) return '🔒 ' + PZ[fija.t].nombre + ' del nivel (no se mueve) · ' + casilla(S.cur.c, S.cur.f);
  return casilla(S.cur.c, S.cur.f) + ' · Elige una pieza de la bandeja';
}
/** El tablero en palabras (tecla D): para quien no ve bien el 3D. */
function describir() {
  const n = S.nivel; if (!n) return;
  const cs = (x, y) => casilla(clamp(Math.floor(x), 0, F.COLS - 1), clamp(Math.floor(y), 0, F.FILAS - 1));
  const vx = n.bola.vx || 0, partes = [];
  partes.push((n.bola.tipo === 'canica' ? 'La canica de acero' : 'La pelota') + ' sale en ' + cs(n.bola.x, n.bola.y) + (vx > 0.1 ? ', rodando a la derecha' : vx < -0.1 ? ', rodando a la izquierda' : ', y cae'));
  partes.push('la canasta está en ' + cs(n.canasta[0], n.canasta[1] + 0.5));
  (n.pesas || []).forEach(p => partes.push('una pesa de 5 kg sale en ' + cs(p[0], p[1]) + ((p[2] || 0) > 0.1 ? ' rodando a la derecha' : (p[2] || 0) < -0.1 ? ' rodando a la izquierda' : '')));
  (n.fijas || []).forEach(p => partes.push('fija: ' + PZ[p.t].nombre + ' ' + giroTxt(p) + ' en ' + casilla(p.c, p.f)));
  const col = x => clamp(Math.floor(x), 0, F.COLS - 1) + 1, fil = y => clamp(Math.floor(y), 0, F.FILAS - 1) + 1;
  (n.muros || []).forEach(m => {
    const v = Math.abs(m[0] - m[2]) < Math.abs(m[1] - m[3]);
    const tramo = (q, a, b) => (a === b ? ', en la ' + q + ' ' + a : ', de la ' + q + ' ' + a + ' a la ' + b);
    if (v) partes.push('un muro de pie en la columna ' + col((m[0] + m[2]) / 2) + tramo('fila', fil(Math.min(m[1], m[3]) + 0.01), fil(Math.max(m[1], m[3]) - 0.01)));
    else partes.push('una repisa en la fila ' + fil((m[1] + m[3]) / 2 - 0.2) + tramo('columna', col(Math.min(m[0], m[2]) + 0.01), col(Math.max(m[0], m[2]) - 0.01)));
  });
  if (n.tuerca) partes.push('la tuerca dorada en ' + cs(n.tuerca[0], n.tuerca[1]));
  partes.push(S.puestas.length ? 'tus piezas: ' + S.puestas.map(p => PZ[p.t].nombre + ' ' + giroTxt(p) + ' en ' + casilla(p.c, p.f)).join('; ') : 'aún no has puesto piezas');
  const t = partes.map(x => x.charAt(0).toUpperCase() + x.slice(1)).join('. ') + '. Las columnas van de 1 a 16 de izquierda a derecha y las filas de 1 a 10 de abajo arriba.';
  anunciar(t, true); estado('📋 ' + partes.slice(0, 2).join(' · '));
}
function ayudaCursor() { return 'Elige una pieza con 1 a 9, muévela con las flechas, ponla con Enter y gírala con Q y E. Espacio: ¡Andando! D describe el tablero.'; }
function elegir(t) {
  if (S.fase !== 'armar') return;
  Son.despertar();
  if (S.mano && S.mano.t === t) { devolverMano(); refrescar(); return; }
  if (!(S.inv[t] > 0)) { Son.efecto('no'); anunciar('Ya no te quedan piezas de ' + PZ[t].nombre + '.'); return; }
  devolverMano();
  S.inv[t]--; S.mano = { t, a: F.TIPOS[t].ini };
  Son.efecto('tomar'); refrescar(); anunciar('Llevas ' + PZ[t].art + ' ' + PZ[t].nombre + '. ' + lineaEstado());
}
function devolverMano() { if (S.mano) { S.inv[S.mano.t] = (S.inv[S.mano.t] || 0) + 1; S.mano = null; } }
function moverCursor(dc, df) {
  if (S.fase !== 'armar') return;
  S.cur = { c: clamp(S.cur.c + dc, 0, F.COLS - 1), f: clamp(S.cur.f + df, 0, F.FILAS - 1) };
  refrescar(); anunciar(lineaEstado());
}
function irA(c, f) { if (S.fase !== 'armar') return; S.cur = { c, f }; refrescar(); }
function girar(d) {
  if (S.fase !== 'armar') return;
  const p = S.mano || piezaEn(S.cur.c, S.cur.f); if (!p) return;
  const rs = F.TIPOS[p.t].rots; if (rs.length < 2) { anunciar(PZ[p.t].nombre + ': no se gira.'); return; }
  const i = rs.indexOf(p.a), a = rs[(i + d + rs.length) % rs.length];
  if (!S.mano) {
    const viejo = p.a; p.a = a;
    if (F.sePuede(S.nivel, S.puestas, p, S.occ)) { p.a = viejo; Son.efecto('no'); return; }
    pintarPiezas();
  } else S.mano.a = a;
  S.res = null; Son.efecto('girar'); refrescar(); anunciar(PZ[p.t].nombre + ' ' + giroTxt(p));
}
function accion() {
  if (S.fase !== 'armar') return;
  Son.despertar();
  if (S.mano) {
    const p = Object.assign({}, S.mano, S.cur), r = F.sePuede(S.nivel, S.puestas, p, S.occ);
    if (r) { Son.efecto('no'); anunciar('Aquí no: ' + r + '.'); estado('✖ Aquí no: ' + r); return; }
    S.puestas.push(p); S.mano = null; S.res = null;
    Son.efecto('poner'); pintarPiezas(); refrescar();
    anunciar('Pusiste ' + PZ[p.t].art + ' ' + PZ[p.t].nombre + ' ' + giroTxt(p) + ' en ' + casilla(p.c, p.f) + '.');
    return;
  }
  const sobre = piezaEn(S.cur.c, S.cur.f);
  if (sobre) {
    S.puestas = S.puestas.filter(p => p !== sobre); S.mano = { t: sobre.t, a: sobre.a }; S.res = null;
    Son.efecto('tomar'); pintarPiezas(); refrescar(); anunciar('Tomaste ' + PZ[sobre.t].art + ' ' + PZ[sobre.t].nombre + '. Muévela y ponla con Enter.');
  } else if (fijaEn(S.cur.c, S.cur.f)) { Son.efecto('no'); anunciar('Esa pieza es del nivel: no se mueve.'); }
}
function quitar() {
  if (S.fase !== 'armar') return;
  if (S.mano) { const t = S.mano.t; devolverMano(); refrescar(); anunciar(PZ[t].nombre + ' de vuelta en la bandeja.'); return; }
  const sobre = piezaEn(S.cur.c, S.cur.f);
  if (sobre) { S.puestas = S.puestas.filter(p => p !== sobre); S.inv[sobre.t]++; S.res = null; pintarPiezas(); refrescar(); Son.efecto('tomar'); anunciar(PZ[sobre.t].nombre + ' de vuelta en la bandeja.'); }
}
function pintarPiezas() { if (taller) { taller.piezas((S.nivel.fijas || []).map(p => Object.assign({ fija: true }, p)).concat(S.puestas)); } }
/** La pista: la siguiente pieza de la solución que aún no está; si la ayuda lo permite, se pone ya. */
function pista() {
  if (S.fase !== 'armar') return;
  if (S.P.pistas !== Infinity && S.pistas >= S.P.pistas) { anunciar('Ya usaste las pistas de esta máquina.'); return; }
  const sol = S.nivel.sol || [], igual = (a, b) => a.t === b.t && a.c === b.c && a.f === b.f && a.a === b.a;
  const falta = sol.find(s => !S.puestas.some(p => igual(p, s)));
  if (!falta) { anunciar('Ya tienes las piezas de la solución: dale «¡Andando!».'); estado('💡 ¡Ya está! Dale «¡Andando!»'); return; }
  S.pistas++; S.usoPista = true; devolverMano();
  // si hay una pieza del jugador en esa casilla o una del mismo tipo que sobra, se mueve ella
  const estorba = piezaEn(falta.c, falta.f); if (estorba && !igual(estorba, falta)) { S.puestas = S.puestas.filter(p => p !== estorba); S.inv[estorba.t]++; }
  if (!(S.inv[falta.t] > 0)) { const otra = S.puestas.find(p => p.t === falta.t && !sol.some(s => igual(s, p))); if (otra) { S.puestas = S.puestas.filter(p => p !== otra); S.inv[falta.t]++; } }
  const txt = 'Pista: ' + PZ[falta.t].art + ' ' + PZ[falta.t].nombre + ' ' + giroTxt(falta) + ' en ' + casilla(falta.c, falta.f) + '.';
  S.cur = { c: falta.c, f: falta.f };
  if (S.P.ponerPista && S.inv[falta.t] > 0) {
    S.inv[falta.t]--; S.puestas.push(Object.assign({}, falta)); pintarPiezas();
    if (taller) taller.pista(null);
    anunciar(txt + ' Ya está puesta.'); estado('💡 ' + txt);
  } else {
    if (taller) taller.pista(falta);
    anunciar(txt + ' Mira la pieza verde con el foco.'); estado('💡 ' + txt);
  }
  S.res = null; Son.efecto('elegir'); refrescar(); estado('💡 ' + txt);
}

/* ---------- ¡Andando!: la física grabada y reproducida ---------- */
function andar() {
  if (S.fase !== 'armar') return;
  Son.despertar(); devolverMano();
  S.intentos++; S.avisoFin = null;
  const r = F.simular(S.nivel, S.puestas);
  S.res = r;
  if (taller) { taller.pista(null); taller.fantasma(null); taller.rastro(null); }
  Son.efecto('andar');
  reproducir(r);
}
function reproducir(r, repe) {
  S.fase = 'andando'; S.rep = { r, t: 0, k: 0, s: 0, g: 0, ult: performance.now(), repe: !!repe };
  if (taller) { taller.reposo(); taller.andando(true); }
  $('energia').classList.toggle('oculto', !S.energia);
  if (S.energia) prepararEnergia(r);
  refrescar(); estado('▶ Mirando la máquina… (Espacio para parar)');
  anunciar('¡Andando!');
  requestAnimationFrame(paso);
}
const VEL = () => (S.lenta ? 0.3 : 1);
function paso(ahora) {
  const R = S.rep; if (!R || S.fase !== 'andando') return;
  const dt = clamp((ahora - R.ult) / 1000, 0, 0.05); R.ult = ahora;
  if (!S.pausa) R.t += dt * VEL();
  const r = R.r, k = Math.min(r.cuadros.length - 1, Math.floor(R.t * 60));
  if (taller) taller.cuadro(r.cuadros[k]);
  if (S.energia) pintarEnergia(r.cuadros[k]);
  // los sucesos y los golpes que ya pasaron
  while (R.s < r.sucesos.length && r.sucesos[R.s].t <= R.t) suceso(r.sucesos[R.s++], r);
  let golpes = 0;
  while (R.g < r.golpes.length && r.golpes[R.g].t <= R.t) { const g = r.golpes[R.g++]; if (golpes++ < 2) golpe(g, r); }
  if (k >= r.cuadros.length - 1 && R.s >= r.sucesos.length) { const repe = R.repe; setTimeout(() => terminado(r, repe), S.calma ? 150 : 450); S.rep = null; return; }
  requestAnimationFrame(paso);
}
function golpe(g, r) {
  if (g.que === 'resorte' || g.que === 'canasta') return;
  Son.efecto(g.que === 'bolas' || g.bola > 0 || g.que === 'polea' ? 'metal' : 'golpe', g.f);
  if (taller && g.f > 6 && !S.calma) { const f = r.cuadros[Math.min(r.cuadros.length - 1, Math.floor(g.t * 60))], b = g.bola || 0; taller.efecto('polvo', f[b * 3], f[b * 3 + 1] - 0.2, g.f / 3); }
}
const DICE = {
  rampa: (b) => (b ? 'La pesa rueda por la rampa.' : 'La pelota rueda por la rampa: el plano inclinado la lleva.'),
  tabla: (b) => (b ? 'La pesa rueda por la tabla.' : 'La pelota rueda por la tabla.'),
  resorte: (b) => (b ? '¡Boing! El resorte lanza la pesa.' : '¡Boing! El resorte devuelve la energía y la lanza.'),
  palanca: (b) => (b ? 'La pesa cae en la palanca… ¡y la otra punta sube!' : 'La pelota está en la palanca.'),
  polea: (b) => (b ? 'La pesa cae en la cubeta: baja, y la polea sube la otra.' : 'La pelota va en la cubeta de la polea.'),
  cinta: (b) => (b ? 'La cinta lleva la pesa.' : 'La cinta arrastra la pelota.'),
  ventilador: (b) => (b ? 'El aire empuja un poco la pesa (pesa mucho).' : 'El aire del ventilador empuja la pelota.'),
  iman: (b) => (b ? 'El imán atrae la pesa de hierro.' : 'El imán atrae la canica de acero.'),
  aro: () => 'Toca el borde de la canasta…',
  choque: () => 'La pesa choca con la pelota.',
  tuerca: () => '⭐ ¡Pasó por la tuerca dorada!'
};
function suceso(s, r) {
  const f = r.cuadros[Math.min(r.cuadros.length - 1, Math.floor(s.t * 60))];
  if (s.que === 'tuerca') { Son.efecto('tuerca'); if (taller) taller.efecto('tuerca', f[0], f[1]); }
  if (s.que === 'resorte' && taller) taller.efecto('resorte', s.pz);
  if (s.que === 'resorte') Son.efecto('resorte');
  else if (s.que === 'palanca' && s.bola) Son.efecto('palanca');
  else if (s.que === 'polea' && s.bola) Son.efecto('polea');
  else if (s.que === 'ventilador' && !s.bola) Son.efecto('aire');
  else if (s.que === 'iman') Son.efecto('iman');
  else if (s.que === 'cinta' && !s.bola) Son.efecto('cinta');
  if (s.que === 'canasta' && taller) taller.efecto('canasta', S.nivel.canasta[0], S.nivel.canasta[1] + 0.6);
  const d = DICE[s.que]; if (!d) return;
  const t = d(s.bola);
  if (S.rep) { const k = s.que + s.bola; if (S.rep.dicho === k) return; S.rep.dicho = k; }
  narrar(t);
}
function parar() {
  if (S.fase !== 'andando') return;
  const repe = S.rep && S.rep.repe; S.rep = null; Son.efecto('elegir');
  if (repe && S.avisoFin) { if (taller) taller.andando(false); S.fase = 'resultado'; mostrarAviso(S.avisoFin); return; }
  volverAArmar();
  anunciar('Paraste la máquina. Sigue armando.');
}
function volverAArmar() {
  S.fase = 'armar';
  if (taller) { taller.andando(false); taller.reposo(); taller.rastro(S.res ? S.res.cuadros : null); }
  $('energia').classList.add('oculto');
  refrescar();
}
function terminado(r, repe) {
  if (S.fase !== 'andando') return;
  estado('');
  if (taller) taller.andando(false);
  const n = S.nivel;
  if (repe) { if (S.avisoFin) { S.fase = 'resultado'; mostrarAviso(S.avisoFin); } else volverAArmar(); return; }
  if (r.fin === 'canasta') {
    Son.efecto('canasta');
    const est = 1 + (r.tuerca ? 1 : 0) + (S.usoPista ? 0 : 1), id = S.base.id.replace(/-e$/, '');
    S.estrellas += est; S.maquinas++;
    if (!S.usoPista) { S.aciertos++; S.sinPista++; }
    if (!LEC) { prefs.estrellas[id] = Math.max(prefs.estrellas[id] || 0, est); guardar(); }
    avisar(); marcador();
    if (S.ingles) Voz.decir('well-done');
    const det = ['⭐ Llegó a la canasta' + (S.intentos > 1 ? ' (en ' + S.intentos + ' intentos: así se hace ciencia, probando)' : ' ¡al primer intento!'),
      (r.tuerca ? '⭐' : '☆') + (n.tuerca ? ' La tuerca dorada' + (r.tuerca ? '' : ': no pasó por ella') : ' Sin tuerca en esta máquina'),
      (S.usoPista ? '☆ Con pista' : '⭐ Sin pista')];
    S.fase = 'resultado';
    S.avisoFin = { est: '⭐'.repeat(est) + '☆'.repeat(3 - est), tit: '¡A la canasta!', txt: n.idea, det,
      botones: [{ txt: '▶ Siguiente', fn: siguiente }, { txt: '↺ Verla otra vez', sec: true, fn: () => { cerrarAviso(); S.lenta = false; reproducir(r, true); } }, { txt: '🐌 En cámara lenta', sec: true, fn: () => { cerrarAviso(); S.lenta = true; reproducir(r, true); } }] };
    mostrarAviso(S.avisoFin);
    return;
  }
  // no llegó: no pasa nada malo, se cambia algo y se prueba otra vez
  S.fallos++; Son.efecto('fallo'); avisar();
  if (S.ingles) Voz.decir('try-again');
  const f = r.cuadros[r.cuadros.length - 1], dx = f[0] - n.canasta[0];
  const donde = r.fin === 'fuera' ? 'La pelota se salió del tablero.' : r.fin === 'tiempo' ? 'La máquina sigue y sigue, pero la pelota no llega.' : 'La pelota se quedó quieta ' + (Math.abs(dx) < 1.5 && f[1] < n.canasta[1] ? 'debajo de la canasta.' : Math.abs(dx) < 2 ? 'cerca de la canasta.' : dx < 0 ? 'a la izquierda de la canasta.' : 'a la derecha de la canasta.');
  const consejo = !S.puestas.length ? 'Pon alguna pieza: sin piezas no llega.' : S.intentos >= 3 && (S.P.pistas === Infinity || S.pistas < S.P.pistas) ? 'Mira el camino punteado del intento o pide una 💡 pista.' : 'El camino punteado muestra por dónde fue: cambia una pieza de sitio o de giro.';
  S.fase = 'resultado';
  S.avisoFin = { est: '🔧', tit: 'Casi…', txt: donde, det: [consejo], botones: [{ txt: '🛠️ Seguir armando', fn: () => { cerrarAviso(); volverAArmar(); anunciar(donde + ' ' + consejo); } },
    { txt: '↺ Verla otra vez', sec: true, fn: () => { cerrarAviso(); S.lenta = false; reproducir(r, true); } }, { txt: '🐌 En cámara lenta', sec: true, fn: () => { cerrarAviso(); S.lenta = true; reproducir(r, true); } }] };
  mostrarAviso(S.avisoFin);
}

/* ---------- las barras de energía (unidades de verdad: 1 casilla = 0,5 m, g = 10 m/s²) ---------- */
let Emax = 1;
const MASA = { balon: 0.45, canica: 0.72 };
function energiaDe(f, tipo) {
  const m = MASA[tipo] || 0.45, r = F.BOLAS[tipo].r * 0.5, nb = S.res ? S.res.nbolas : 1;
  const h = Math.max(0, (f[1] - F.BOLAS[tipo].r) * 0.5), vx = f[nb * 3] * 0.5, vy = f[nb * 3 + 1] * 0.5, w = f[nb * 3 + 2];
  const v = Math.sqrt(vx * vx + vy * vy), ep = m * 10 * h, ec = 0.5 * m * v * v + 0.5 * 0.4 * m * r * r * w * w;
  return { h, v, ep, ec };
}
function prepararEnergia(r) { const tipo = S.nivel.bola.tipo || 'balon'; Emax = 0.01; r.cuadros.forEach(f => { const e = energiaDe(f, tipo); Emax = Math.max(Emax, e.ep + e.ec); }); }
function pintarEnergia(f) {
  const e = energiaDe(f, S.nivel.bola.tipo || 'balon');
  $('eH').textContent = num(e.h, 1) + ' m'; $('eV').textContent = num(e.v, 1) + ' m/s';
  $('eEp').textContent = 'Ep ' + num(e.ep, 1) + ' J'; $('eEc').textContent = 'Ec ' + num(e.ec, 1) + ' J'; $('eEt').textContent = num(e.ep + e.ec, 1) + ' J';
  $('eP').style.width = clamp(e.ep / Emax * 100, 0, 100) + '%'; $('eC').style.width = clamp(e.ec / Emax * 100, 0, 100) + '%'; $('eT').style.width = clamp((e.ep + e.ec) / Emax * 100, 0, 100) + '%';
}

/* ---------- avisos (diálogos) ---------- */
function mostrarAviso(o) {
  $('aEst').textContent = o.est || ''; $('aTit').textContent = o.tit; $('aTxt').textContent = o.txt || '';
  const ul = $('aDet'); ul.innerHTML = ''; (o.det || []).forEach(d => { const li = document.createElement('li'); li.textContent = d; ul.appendChild(li); });
  const acc = $('aAcc'); acc.innerHTML = '';
  o.botones.forEach((b, i) => { const e = document.createElement('button'); e.type = 'button'; e.className = b.sec ? 'bsec' : 'jugar'; e.textContent = b.txt; e.addEventListener('click', b.fn); acc.appendChild(e); });
  $('aviso').classList.remove('oculto');
  setTimeout(() => { const b = acc.querySelector('button'); if (b) b.focus({ preventScroll: true }); }, 40);
  refrescar();
}
function cerrarAviso() { $('aviso').classList.add('oculto'); }

/* ---------- el final ---------- */
function terminar() {
  S.fase = 'fin'; $('bandeja').classList.add('oculto'); $('energia').classList.add('oculto'); $('carta').classList.add('oculto'); cerrarAviso();
  if (taller) { taller.cursor(0, 0, false); taller.fantasma(null); }
  const nN = S.tareas.filter(t => t.tipo === 'nivel').length, nQ = S.tareas.filter(t => t.tipo === 'pregunta' && !t.repaso).length;
  const res = S.maquinas + ' de ' + nN + ' máquinas a la canasta (' + S.sinPista + ' sin pista)' + (nQ ? ' y ' + (S.aciertos - S.sinPista) + ' de ' + nQ + ' preguntas a la primera' : '') + '. ⭐ ' + S.estrellas + ' estrellas.';
  if (LEC) {
    LJ.resultado({ aciertos: S.aciertos, total: S.total, fallos: S.fallos, nivel: S.maquinas + ' de ' + nN + ' máquinas' });
    LJ.logrado({ detalle: res, chips: ['⭐ ' + S.estrellas, '⚙️ ' + S.maquinas + ' máquinas'], alOtraVez: () => empezar() });
    return;
  }
  $('fRes').textContent = res; $('fMedalla').textContent = S.estrellas >= nN * 3 ? '🏆' : S.estrellas >= nN * 2 ? '🥈' : '🎖️';
  $('final').classList.remove('oculto'); $('hud').classList.add('oculto');
  setTimeout(() => $('bOtraVez').focus({ preventScroll: true }), 40);
}

/* ---------- la sala: el inicio ---------- */
function pintarInicio() {
  const ot = $('oTema'); ot.innerHTML = '';
  MC.TEMAS.forEach(t => { const b = document.createElement('button'); b.type = 'button'; b.className = 'op-b'; b.setAttribute('aria-pressed', sel.tema === t.id ? 'true' : 'false');
    b.innerHTML = '<span aria-hidden="true">' + t.emoji + '</span> <b></b><small></small>'; b.querySelector('b').textContent = t.nombre; b.querySelector('small').textContent = t.grados;
    b.title = t.frase; b.addEventListener('click', () => { sel.tema = t.id; if (t.id === 'energia' && !prefs.energiaTocada) { S.energia = true; $('oEnergia').checked = true; } guardarSel(); pintarInicio(); }); ot.appendChild(b); });
  const og = $('oGrado'); og.innerHTML = '';
  for (let g = 0; g <= 11; g++) { const b = document.createElement('button'); b.type = 'button'; b.className = 'op-b g'; b.textContent = g ? g + '.º' : 'T'; b.setAttribute('aria-label', g ? 'grado ' + g : 'Transición'); b.setAttribute('aria-pressed', sel.grado === g ? 'true' : 'false'); b.addEventListener('click', () => { sel.grado = g; guardarSel(); pintarInicio(); }); og.appendChild(b); }
  const m = modoDeGrado(sel.grado);
  $('tModo').textContent = m === 'facil' ? 'Ayuda generosa: pistas sin límite (la pista pone la pieza) y una opción mala tachada en las preguntas.' : m === 'media' ? '3 pistas por máquina; las preguntas falladas vuelven de repaso.' : '1 pista por máquina. Nunca hay reloj ni se pierde la partida.';
  const on = $('oNiveles'); on.innerHTML = '';
  NV.TALLERES.forEach(tl => {
    const h = document.createElement('p'); h.className = 'tl'; h.textContent = tl.emoji + ' Taller ' + tl.n + ': ' + tl.nombre + ' · ' + tl.idea; on.appendChild(h);
    const fila = document.createElement('div'); fila.className = 'fila-n'; on.appendChild(fila);
    NV.NIVELES.filter(n => n.taller === tl.n).forEach((n, k) => {
      const est = prefs.estrellas[n.id] || 0, b = document.createElement('button'); b.type = 'button'; b.className = 'nv'; b.setAttribute('aria-pressed', sel.nivel === n.id ? 'true' : 'false');
      const pzs = Object.keys(n.piezas).map(t => PZ[t].emoji).join('');
      b.innerHTML = '<span class="nn">' + tl.n + '·' + (k + 1) + '</span><span class="pz2" aria-hidden="true">' + pzs + '</span><span class="nt"></span><span class="es" aria-hidden="true">' + '★'.repeat(est) + '☆'.repeat(3 - est) + '</span>';
      b.querySelector('.nt').textContent = n.nombre; b.setAttribute('aria-label', 'Máquina ' + tl.n + '.' + (k + 1) + ': ' + n.nombre + ', ' + est + ' de 3 estrellas');
      b.addEventListener('click', () => { sel.nivel = n.id; guardarSel(); pintarInicio(); });
      fila.appendChild(b);
    });
  });
  const tot = Object.values(prefs.estrellas).reduce((a, b) => a + b, 0);
  $('tRecord').textContent = tot ? '⭐ ' + tot + ' de ' + NV.NIVELES.length * 3 + ' estrellas en el taller.' : '';
  $('oCalma').checked = S.calma; $('oEnergia').checked = S.energia;
}
function guardarSel() { prefs.sel = Object.assign({}, sel); guardar(); }
function irAlInicio() {
  S.fase = 'menu'; S.rep = null; Voz.callar();
  ['hud', 'bandeja', 'energia', 'carta', 'pausa', 'final'].forEach(id => $(id).classList.add('oculto')); cerrarAviso();
  if (taller) { taller.cursor(0, 0, false); taller.fantasma(null); taller.pista(null); }
  if (LEC) { arrancarLeccion(); return; }
  pintarInicio(); $('inicio').classList.remove('oculto');
  setTimeout(() => $('bJugar').focus({ preventScroll: true }), 40);
}
function arrancarLeccion() {
  const nP = preguntasLeccion().length, chips = [];
  if (LEC.palabras.length) chips.push(...LEC.palabras.slice(0, 8).map(w => (w.emoji ? w.emoji + ' ' : '') + w.en));
  else if (nP) chips.push('❓ ' + nP + ' preguntas');
  if (LEC.maquinas.length) chips.push(...LEC.maquinas.map(t => PZ[t].emoji + ' ' + PZ[t].nombre));
  LJ.portada({ juego: '⚙️ Máquina Loca', titulo: LEC.titulo || 'Lleva la pelota a la canasta', detalle: 'Pon rampas, resortes, palancas y poleas para que la pelota llegue a la canasta.' + (nP ? ' Cada respuesta buena gana una pieza especial.' : ''), chips, alJugar: empezar });
}

/* ---------- pausa, calma, sonido, energía ---------- */
function pausar(b) {
  if (S.fase === 'menu' || S.fase === 'fin') return;
  S.pausa = b; $('pausa').classList.toggle('oculto', !b);
  if (b) { Voz.callar(); $('pRes').textContent = S.nivel ? S.nivel.nombre + ': ' + S.nivel.idea : ''; $('bInicio').classList.toggle('oculto', !!LEC); $('bVaciar').classList.toggle('oculto', !S.nivel); $('bSaltar').classList.toggle('oculto', !S.nivel); setTimeout(() => $('bReanudar').focus({ preventScroll: true }), 30); }
}
function calma(b) { S.calma = b; if (!LEC) { prefs.calma = b; guardar(); } if (taller) taller.calma(b); document.body.classList.toggle('calma', b); $('bCalma').setAttribute('aria-pressed', b ? 'true' : 'false'); }
function sonido(b) { Son.mudo = !b; Son.aplicar(); if (!b) Voz.callar(); if (!LEC) { prefs.mudo = !b; guardar(); } $('iSonido').textContent = b ? '🔊' : '🔇'; $('tSonido').textContent = b ? 'Silenciar' : 'Activar el sonido'; $('bSonido').setAttribute('aria-pressed', b ? 'false' : 'true'); }
function energia(b) { S.energia = b; if (!LEC) { prefs.energia = b; prefs.energiaTocada = true; guardar(); } $('bEnergia').setAttribute('aria-pressed', b ? 'true' : 'false'); if (S.fase === 'andando') { $('energia').classList.toggle('oculto', !b); if (b && S.res) prepararEnergia(S.res); } anunciar(b ? 'Barras de energía encendidas.' : 'Barras de energía apagadas.'); }
function saltar() {
  if (!S.nivel) return;
  pausar(false); S.rep = null; if (taller) taller.andando(false);
  S.fallos++; avisar(); siguiente();
}
function medirSeguro() {
  if (!taller) return;
  const h = $('hud').getBoundingClientRect(), b = $('bandeja').getBoundingClientRect();
  taller.seguro(Math.max(60, h.bottom + 6), $('bandeja').classList.contains('oculto') ? 20 : Math.max(80, innerHeight - b.top + 6));
  // en el celular de pie sobra alto debajo del tablero: ahí van lo que se narra y las barras de energía
  const dePie = innerHeight > innerWidth * 1.3, n = $('narra'), en = $('energia');
  if (dePie) { const y = taller.proyectar(F.COLS / 2, -1.1).y; n.style.top = Math.round(y) + 'px'; en.style.top = Math.round(y + 48) + 'px'; en.style.bottom = 'auto'; }
  else { n.style.top = ''; en.style.top = ''; en.style.bottom = ''; }
}
addEventListener('resize', () => setTimeout(medirSeguro, 50));

/* ---------- el teclado y el puntero ---------- */
addEventListener('keydown', e => {
  if (e.altKey || e.ctrlKey || e.metaKey) return;
  const k = e.key.toLowerCase();
  if (S.fase === 'menu') return;
  if (k === 'escape') { e.preventDefault(); if (S.mano && !S.pausa) { quitar(); return; } pausar(!S.pausa); return; }
  if (S.pausa) return;
  if (k === 'm') { sonido(Son.mudo); return; }
  if (k === 'c') { calma(!S.calma); return; }
  if (k === 'b') { energia(!S.energia); return; }
  if (S.fase === 'pregunta') {
    if (/^[1-4]$/.test(k) && !(S.t && S.t.contestada)) { const b = $('cOps').children[+k - 1]; if (b && !b.disabled) { e.preventDefault(); responder(+k - 1); } return; }
    if (k === 'o') { oir(); return; }
    if (k === 'v') { ver(); return; }
    return;
  }
  if (!$('aviso').classList.contains('oculto')) {
    if (k === 'r') { const bs = $('aAcc').querySelectorAll('button'); if (bs[1]) bs[1].click(); }
    return;
  }
  const enBoton = document.activeElement && document.activeElement.tagName === 'BUTTON';
  if (S.fase === 'andando') {
    if ((k === ' ' || k === 'spacebar') && !enBoton) { e.preventDefault(); parar(); }
    else if (k === 'l') { S.lenta = !S.lenta; refrescar(); anunciar(S.lenta ? 'Cámara lenta.' : 'Velocidad normal.'); }
    return;
  }
  if (S.fase !== 'armar') return;
  const dir = { arrowleft: [-1, 0], arrowright: [1, 0], arrowup: [0, 1], arrowdown: [0, -1] }[k];
  if (dir) { e.preventDefault(); moverCursor(dir[0], dir[1]); return; }
  if (/^[1-9]$/.test(k)) { const b = $('inv').children[+k - 1]; if (b) { e.preventDefault(); elegir(b.dataset.t); } return; }
  if (k === 'enter') { const a = document.activeElement; if (!S.mano && a && a.tagName === 'BUTTON' && !a.closest('#gPad')) return; e.preventDefault(); accion(); return; }
  if (k === 'q') { girar(-1); return; }
  if (k === 'e') { girar(1); return; }
  if (k === 'delete' || k === 'backspace') { e.preventDefault(); quitar(); return; }
  if (k === 'p') { pista(); return; }
  if (k === 'd') { describir(); return; }
  if ((k === ' ' || k === 'spacebar') && !enBoton) { e.preventDefault(); andar(); return; }
  if (k === 'r' && S.res) { S.lenta = false; S.avisoFin = null; reproducir(S.res, true); return; }
  if (k === 'l' && S.res) { S.lenta = true; S.avisoFin = null; reproducir(S.res, true); }
});
if (taller) {
  const lz = taller.lienzo; let tocado = null;
  lz.addEventListener('pointermove', e => { if (e.pointerType !== 'mouse' || S.fase !== 'armar' || S.pausa) return; const c = taller.celda(e.clientX, e.clientY); if (c && (c.c !== S.cur.c || c.f !== S.cur.f)) irA(c.c, c.f); });
  lz.addEventListener('pointerdown', e => {
    if (S.fase !== 'armar' || S.pausa) return;
    const c = taller.celda(e.clientX, e.clientY); if (!c) return;
    Son.despertar();
    if (e.pointerType === 'mouse') { irA(c.c, c.f); accion(); return; }
    // con el dedo: el primer toque lleva el cursor; el segundo en la misma casilla pone (o toma)
    const mismo = tocado && tocado.c === c.c && tocado.f === c.f && c.c === S.cur.c && c.f === S.cur.f;
    irA(c.c, c.f); tocado = c;
    if (mismo) { accion(); tocado = null; } else anunciar(lineaEstado());
  });
}

/* ---------- los botones ---------- */
$('bGirarI').addEventListener('click', () => girar(-1));
$('bGirarD').addEventListener('click', () => girar(1));
$('bQuitar').addEventListener('click', quitar);
$('bIzq').addEventListener('click', () => moverCursor(-1, 0));
$('bDer').addEventListener('click', () => moverCursor(1, 0));
$('bArr').addEventListener('click', () => moverCursor(0, 1));
$('bAba').addEventListener('click', () => moverCursor(0, -1));
$('bPoner').addEventListener('click', accion);
$('bPista').addEventListener('click', pista);
$('bAndar').addEventListener('click', andar);
$('bParar').addEventListener('click', parar);
$('bLenta').addEventListener('click', () => { S.lenta = !S.lenta; refrescar(); });
$('bOir').addEventListener('click', oir);
$('bVer').addEventListener('click', ver);
$('bCSeguir').addEventListener('click', siguiente);
$('bSonido').addEventListener('click', () => sonido(Son.mudo));
$('bCalma').addEventListener('click', () => calma(!S.calma));
$('bEnergia').addEventListener('click', () => energia(!S.energia));
$('bMenu').addEventListener('click', () => pausar(true));
$('bReanudar').addEventListener('click', () => pausar(false));
$('bInicio').addEventListener('click', () => { pausar(false); irAlInicio(); });
$('bVaciar').addEventListener('click', () => { S.puestas.forEach(p => { S.inv[p.t]++; }); S.puestas = []; devolverMano(); pintarPiezas(); pausar(false); if (S.fase === 'andando') parar(); refrescar(); anunciar('Quitaste todas tus piezas.'); });
$('bSaltar').addEventListener('click', saltar);
$('bJugar').addEventListener('click', empezar);
$('bOtraVez').addEventListener('click', empezar);
$('bCambiar').addEventListener('click', irAlInicio);
$('oCalma').addEventListener('change', e => calma(e.target.checked));
$('oEnergia').addEventListener('change', e => energia(e.target.checked));
document.addEventListener('visibilitychange', () => { if (document.hidden) { Voz.callar(); if (S.fase === 'armar' || S.fase === 'andando') pausar(true); } });
// al salir a medias de la lección queda lo último
addEventListener('pagehide', () => { if (LEC && S.fase !== 'fin' && S.fase !== 'menu') avisar(); });

/* ---------- arrancar ---------- */
calma(S.calma); sonido(!Son.mudo); energia(S.energia); $('anuncio').textContent = '';
$('cargando').classList.add('oculto');
irAlInicio();

window.__maquina = {
  estado: S, F, NV,
  resolver() { if (S.fase !== 'armar') return false; S.puestas.forEach(p => { S.inv[p.t]++; }); S.puestas = []; devolverMano(); (S.nivel.sol || []).forEach(p => { S.inv[p.t]--; S.puestas.push(Object.assign({}, p)); }); pintarPiezas(); refrescar(); return true; },
  andar, elegir: k => responder(k), saltar, pista, accion, girar, moverCursor, elegirPieza: elegir, irA
};
})();
