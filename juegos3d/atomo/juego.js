/* Átomo a Átomo — el juego: la sala (qué haces, grado, tema y ayudante), el modo lección (../leccion.js), la mesa de
   armar, la balanza, las preguntas, la voz en inglés y los resultados.
   - Armar: se toca un átomo de la molécula (queda marcado con el aro) y luego el átomo nuevo de la paleta: se pega con
     el enlace elegido (– = ≡; si no cabe, el más grande que cabe). Tocar el vecino del marcado sube su enlace
     (sencillo → doble → triple → sencillo). El primer átomo se pone solo; si sólo un átomo tiene brazos libres, se pega
     ahí. Cuando ya no quedan brazos libres la molécula se cierra y se compara con el pedido (por estructura si el
     pedido es una molécula con nombre: etanol no es éter dimetílico; por fórmula si es sólo una fórmula).
   - Balancear: un coeficiente por sustancia (de 1 a 16); la balanza se inclina por la masa y abajo se cuentan los
     átomos de cada lado. «Comprobar» pide los números enteros más pequeños.
   - Preguntas: de 2 a 4 opciones con forma, número y texto (1 a 4 o tocarlas). La mala muestra «Era: …».
   - Inglés: sólo los MP3 grabados de la Biblioteca. Sin MP3: silencio y lo escrito. Jamás speechSynthesis.
   - Nunca hay reloj ni se pierde la partida. Progreso (sala): localStorage juegos3d.atomo {sel, calma, mudo, vol,
     ayudas, ingles, estrellas, album, records}. En modo lección no se guarda nada.
   Depuración: window.__atomo (estado, pegar(s), tocar(i), resolver() arma solo lo pedido, elegir(k), coef(j, n)). */
(function () {
'use strict';
const $ = id => document.getElementById(id);
const LJ = window.LeccionJuego, Q = window.AtomoQuimica, AC = window.AtomoContenido, LAB = window.AtomoLab || {};
const CLAVE = 'juegos3d.atomo';
const leer = () => { try { return JSON.parse(localStorage.getItem(CLAVE)) || {}; } catch (e) { return {}; } };
const prefs = leer(); if (!Array.isArray(prefs.album)) prefs.album = []; if (!prefs.records || typeof prefs.records !== 'object') prefs.records = {};
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const barajar = AC.barajar;
const BIBLIO = /^(localhost|127\.0\.0\.1)$/.test(location.hostname) ? 'http://localhost:8765/' : 'https://biblioteca.micolevirtual.com/';
const reducir = matchMedia('(prefers-reduced-motion: reduce)').matches;
const GLIFOS = [{ f: '●', c: '#c2410c', n: 'círculo' }, { f: '▲', c: '#1864ab', n: 'triángulo' }, { f: '■', c: '#2b8a3e', n: 'cuadrado' }, { f: '◆', c: '#7048e8', n: 'rombo' }];
const ORDEN_EL = ['C', 'H', 'O', 'N', 'S', 'P', 'F', 'Cl', 'Br', 'I'];
const TECLA_EL = { h: 'H', c: 'C', n: 'N', o: 'O', s: 'S', p: 'P', f: 'F', l: 'Cl', b: 'Br', i: 'I' };
const TECLA_DE = { H: 'H', C: 'C', N: 'N', O: 'O', S: 'S', P: 'P', F: 'F', Cl: 'L', Br: 'B', I: 'I' };
const sub = Q.sub;
const nombreEl = s => Q.ELEM[s].nombre.toLowerCase();
const plural = (n, uno, varios) => n + ' ' + (n === 1 ? uno : varios);
const nAt = c => Object.values(c).reduce((a, b) => a + b, 0);
const sinEmoji = t => String(t).replace(/^[^A-Za-zÀ-ÿ0-9¿¡«$(]+/u, '').trim() || String(t);
const emojiDe = t => { const m = String(t).match(/^([^A-Za-zÀ-ÿ0-9¿¡«$(]+)\s/u); return m ? m[1].trim() : ''; };

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
  const construir = lista(CFG.construir).slice(0, 12).map(x => { const r = Q.resolver(x); if (!r) { console.warn('[atomo] no sé armar', x); return null; } return { obj: r, p: x && typeof x === 'object' && typeof x.p === 'string' ? x.p.trim() : '' }; }).filter(Boolean);
  const reacciones = lista(CFG.reacciones).slice(0, 8).map(x => { const ec = typeof x === 'string' ? x : x && x.ecuacion; const e = Q.leerEcuacion(ec), coef = e && Q.balancear(e); if (!coef || Math.max(...coef) > 16) { console.warn('[atomo] no sé balancear', x); return null; } const cat = Q.REACCIONES.find(r => r.ec.replace(/\s/g, '') === String(ec).replace(/\s/g, '').replace(/→/g, '->')); return { ec, e, coef, tipo: cat ? cat.tipo : '', vida: cat ? cat.vida : '' }; }).filter(Boolean);
  if (!preguntas.length && palabras.length < 1 && !construir.length && !reacciones.length) { console.warn('[atomo] la lección no mandó nada que hacer: va la sala'); return null; }
  return { titulo: (LJ.titulo || '').trim(), preguntas, palabras, construir, reacciones, geometria: CFG.geometria === true };
})();
const guardar = () => { if (LEC) return; try { localStorage.setItem(CLAVE, JSON.stringify(prefs)); } catch (e) { /* sin almacenamiento */ } };

// La dificultad (FORMATO.md §3.9.1). Nunca se pierde la partida: cambia la ayuda.
// facil: la molécula del pedido siempre a la vista (la fantasma), la receta, las marcas ✔ en vivo, pistas sin límite, una
//   opción mala tachada y lo fallado vuelve de repaso; media: la receta y las marcas, 3 pistas, vuelve de repaso;
// normal: 1 pista por partida, la receta sólo con la pista, sin repaso.
function params(modo) {
  return { modo, fantasma: modo === 'facil', receta: modo !== 'normal', marcas: modo !== 'normal', pistas: modo === 'facil' ? Infinity : modo === 'media' ? 3 : 1, tachar: modo === 'facil', repaso: modo !== 'normal' };
}
const modoDeGrado = g => (g <= 7 ? 'media' : 'normal');
const VOZ = (() => { const v = CFG && typeof CFG.voz === 'string' && /^(https?:\/\/|\/)/.test(CFG.voz.trim()) ? CFG.voz.trim() : BIBLIO + 'voz/'; return /\/$/.test(v) ? v : v + '/'; })();

/* ---------- el sonido: efectos sintetizados (0 KB de audio) ---------- */
const Son = (() => {
  let ctx = null, master = null;
  const o = { mudo: !LEC && !!prefs.mudo, vol: typeof prefs.vol === 'number' ? prefs.vol : 0.8 };
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
  const PITCH = { H: 880, C: 523, N: 587, O: 659, S: 440, P: 494, F: 784, Cl: 698, Br: 392, I: 349 };
  function efecto(n, x) {
    if (!ctx || o.mudo) return;
    const t = ctx.currentTime;
    if (n === 'pegar') { const f = PITCH[x] || 600; tono(f * 0.6, t, 0.09, 'sine', 0.35, f * 1.4); tono(f * 2, t + 0.03, 0.08, 'triangle', 0.12); }
    else if (n === 'enlace') { [0, 0.07, 0.14].slice(0, x || 2).forEach(d => tono(700 + d * 2000, t + d, 0.07, 'triangle', 0.22)); }
    else if (n === 'quitar') tono(500, t, 0.14, 'sine', 0.25, 220);
    else if (n === 'elegir') tono(1200, t, 0.05, 'triangle', 0.12);
    else if (n === 'no') { tono(220, t, 0.12, 'square', 0.06); tono(196, t + 0.1, 0.16, 'square', 0.05); }
    else if (n === 'bien') [523, 659, 784, 1047].forEach((f, i) => tono(f, t + i * 0.09, 0.3, 'triangle', 0.22));
    else if (n === 'mal') { tono(330, t, 0.2, 'sawtooth', 0.06, 260); tono(262, t + 0.18, 0.3, 'sawtooth', 0.05, 200); }
    else if (n === 'ding') { tono(1319, t, 0.9, 'sine', 0.25); tono(1760, t + 0.12, 0.8, 'sine', 0.18); }
    else if (n === 'tic') tono(900, t, 0.04, 'square', 0.05);
    else if (n === 'reaccion') { for (let i = 0; i < 10; i++) tono(300 + i * 90, t + i * 0.08, 0.12, 'triangle', 0.1); tono(1047, t + 0.95, 0.5, 'sine', 0.25); }
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
    if (cola) return cola.poner({ urls, clave: 'atomo:' + s, grupo: opc.grupo, caduca: opc.caduca || 6000, vigente: () => !Son.mudo && !S.pausa });
    n++; if (audio) { audio.onended = audio.onerror = null; audio.pause(); audio = null; }
    const mio = n;
    return new Promise(fin => { const probar = j => { if (mio !== n || j >= urls.length) { fin(false); return; } const a = new Audio(urls[j]); audio = a; a.onended = () => { if (audio === a) audio = null; fin(true); }; a.onerror = () => probar(j + 1); a.play().catch(() => fin(false)); }; probar(0); });
  }
  /** El primero de los textos que esté grabado (la frase entera o la palabra sola). */
  const elegir = textos => textos.find(tiene) || '';
  return { listo, tiene, decir, callar, elegir };
})();

/* ---------- estado ---------- */
const sel = Object.assign({ modo: 'pedidos', grado: 7, tema: 'vida', ayudante: 'robot' }, prefs.sel || {});
const S = {
  modo: LEC ? 'leccion' : 'sala', fase: 'menu', pausa: false,
  calma: LEC ? reducir : (typeof prefs.calma === 'boolean' ? prefs.calma : reducir),
  P: params('normal'), tareas: [], idx: -1, t: null,
  g: { sim: [], enl: [], ids: [] }, sigId: 1, hist: [], ancla: -1, orden: 1, puestos: 0,
  coef: [], aciertos: 0, total: 0, fallos: 0, estrellas: 0, items: 0, hechos: 0, pistasUsadas: 0, repasar: [], nuevas: [], cerrada: false
};
let lab = null;
try { if (LAB.disponible) lab = LAB.crear($('gl'), { biblio: BIBLIO, calma: S.calma, ayudante: LEC ? 'robot' : sel.ayudante }); } catch (e) { console.warn('Átomo: sin 3D (' + e.message + ')'); lab = null; }
if (!lab) document.body.classList.add('sin3d');

/* ---------- las tareas ---------- */
function tareasLeccion() {
  const ts = [], pre = LEC.preguntas.map(q => ({ tipo: 'pregunta', q, item: true }));
  // las palabras: si es una molécula del catálogo, un pedido en inglés; si no, escuchar y elegir
  const pal = [], oir = [];
  LEC.palabras.forEach(w => { const r = Q.resolver(w.en) || Q.resolver(w.es); if (r && r.mol && r.mol.armar) pal.push({ w, r }); else oir.push(w); });
  pal.forEach(({ w, r }, i) => ts.push({ tipo: 'armar', obj: r, en: w, bocina: i % 2 === 1, item: true }));
  LEC.construir.forEach(c => ts.push({ tipo: 'armar', obj: c.obj, p: c.p, item: true }));
  if (oir.length) {
    const todas = LEC.palabras;
    oir.forEach((w, i) => {
      const otras = barajar(todas.filter(x => x.es !== w.es)).slice(0, 2).map(x => (x.emoji ? x.emoji + ' ' : '') + x.es);
      const q = AC.q('🔊 «' + w.en + '»: ¿qué quiere decir?', (w.emoji ? w.emoji + ' ' : '') + w.es, otras, { oir: w.en, escucha: i % 2 === 1 });
      if (q.opciones.length >= 2) pre.push({ tipo: 'pregunta', q, item: true });
    });
  }
  // la forma, después de cada molécula con un centro
  if (LEC.geometria) for (let i = ts.length - 1; i >= 0; i--) { const m = ts[i].obj && ts[i].obj.mol; const pf = m && AC.preguntaForma(m); if (pf) ts.splice(i + 1, 0, { tipo: 'pregunta', q: pf, item: true, conMol: true }); }
  // las preguntas, repartidas entre los pedidos; luego las reacciones
  const out = [];
  let k = 0;
  ts.forEach((t, i) => { out.push(t); if (t.tipo === 'armar' && pre.length && (i % 2 === 1)) out.push(pre.shift()); k++; });
  LEC.reacciones.forEach((r, i) => { out.push({ tipo: 'balancear', r, item: true }); if (pre.length && i % 2 === 1) out.push(pre.shift()); });
  return out.concat(pre);
}
function armarTareas() {
  if (S.modo === 'leccion') return tareasLeccion();
  const ts = AC.generar(sel.modo, sel.tema, sel.grado);
  if (prefs.ingles && sel.modo === 'pedidos') ts.forEach((t, i) => { if (t.tipo === 'armar') { t.en = { en: t.obj.mol.en, es: t.obj.mol.nombre, emoji: t.obj.mol.emoji }; t.bocina = i % 2 === 1; } });
  return ts;
}

/* ---------- empezar y seguir ---------- */
function empezar() {
  Son.despertar(); Voz.callar();
  const modo = S.modo === 'leccion' ? (['facil', 'media', 'normal'].indexOf(LJ.dificultad) >= 0 ? LJ.dificultad : 'normal') : (prefs.ayudas ? 'facil' : modoDeGrado(sel.grado));
  S.P = params(modo);
  S.tareas = armarTareas();
  S.items = S.tareas.filter(t => t.item).length;
  Object.assign(S, { idx: -1, aciertos: 0, total: 0, fallos: 0, estrellas: 0, hechos: 0, pistasUsadas: 0, repasar: [], nuevas: [], pausa: false });
  ['inicio', 'final', 'pausa', 'album'].forEach(id => $(id).classList.add('oculto'));
  $('hud').classList.remove('oculto');
  $('bAlbum').classList.toggle('oculto', S.modo === 'leccion');
  S.fase = 'juego';
  siguiente();
}
function siguiente() {
  Voz.callar();
  S.idx++;
  if (S.idx >= S.tareas.length) { terminar(); return; }
  S.t = S.tareas[S.idx];
  S.t.fallo = S.t.fallo || false; S.t.pista = false;
  ['mesa', 'balanceo', 'opciones', 'seguir', 'capa'].forEach(id => $(id).classList.add('oculto'));
  feedback('', '');
  $('carta').classList.remove('oculto');
  if (lab) { lab.mol.vida(false); lab.fantasma(null); lab.balanza(null); }
  if (S.t.tipo === 'armar' || S.t.tipo === 'libre') empezarArmar();
  else if (S.t.tipo === 'balancear') empezarBalanceo();
  else empezarPregunta();
  hud(); medir();
}
function contar(ok) {
  if (!S.t || !S.t.item || S.t.contado) return;
  S.t.contado = true;
  if (S.t.repaso) return; // lo que vuelve de repaso no cuenta
  S.total++; S.hechos++;
  if (ok) S.aciertos++; else S.fallos++;
  avisarLeccion(false);
}
function repasarLuego(t) {
  if (!S.P.repaso || t.repaso) return;
  const copia = Object.assign({}, t, { contado: false, fallo: false, repaso: true });
  S.tareas.push(copia);
}

/* ---------- armar ---------- */
function paletaDe() {
  const t = S.t;
  if (t.tipo === 'libre') return S.modo === 'leccion' ? ['C', 'H', 'O', 'N'] : AC.elementosDe(sel.grado);
  const ne = Object.keys(t.obj.cuenta);
  if (S.P.modo === 'facil') return ORDEN_EL.filter(s => ne.indexOf(s) >= 0);
  // uno de más, para pensar (el O si no está; si no, el N o el C)
  const extra = ['O', 'N', 'C', 'H'].find(s => ne.indexOf(s) < 0);
  return ORDEN_EL.filter(s => ne.indexOf(s) >= 0 || s === extra);
}
function empezarArmar() {
  const t = S.t;
  S.g = { sim: [], enl: [], ids: [] }; S.hist = []; S.ancla = -1; S.puestos = 0; S.cerrada = false; ponerOrden(1);
  t.vistoVer = !t.bocina; t.oidas = 0;
  $('mesa').classList.remove('oculto'); $('capa').classList.remove('oculto');
  pintarPaleta();
  pintarCartaArmar();
  dibujar();
  if (lab && t.obj && t.obj.mol && (S.P.fantasma || t.pista)) lab.fantasma(t.obj.mol.g);
  Son.efecto('ding'); if (lab) lab.hola();
  if (t.en) setTimeout(() => oirPedido(), 350);
  anunciar(textoPedido());
}
function textoPedido() {
  const t = S.t;
  if (t.tipo === 'libre') return 'Laboratorio libre: arma la molécula que quieras.';
  return 'Pedido: ' + (t.en && !t.vistoVer ? 'escucha qué necesita' : (t.p || (t.obj.mol ? t.obj.mol.pedido : 'una molécula')) + '. Arma ' + (t.obj.nombre ? t.obj.nombre + ', ' : '') + t.obj.formula.split('').join(' ') + '.');
}
const fraseEn = w => 'I need ' + w.en;
function oirPedido() {
  const t = S.t; if (!t || !t.en) return;
  const txt = Voz.elegir([fraseEn(t.en), t.en.en]);
  if (!txt || Son.mudo) { if (!t.vistoVer) { t.vistoVer = true; pintarCartaArmar(); } return; }
  t.oidas++;
  Voz.decir(txt, { grupo: 'pedido' });
  if (t.oidas >= 3 && !t.vistoVer) { t.vistoVer = true; pintarCartaArmar(); }
}
function pintarCartaArmar() {
  const t = S.t, c = $('cCuerpo');
  c.innerHTML = '';
  $('bOir').classList.toggle('oculto', !t.en || !Voz.elegir([fraseEn(t.en || {}), (t.en || {}).en]));
  $('bVer').classList.add('oculto');
  if (t.tipo === 'libre') {
    $('cEti').textContent = '📒 Laboratorio libre';
    $('cTit').textContent = 'Arma la molécula que quieras';
    const n = albumN();
    c.appendChild(el('p', 'sub', 'Cuando ya no le queden brazos libres, la miro: si existe en el álbum, ¡es tuya! Llevas ' + n.tengo + ' de ' + n.todas + '.'));
    return;
  }
  const m = t.obj.mol, f = t.obj.formula;
  $('cEti').textContent = '🧾 Pedido ' + (pos() + 1) + ' de ' + S.items + (t.repaso ? ' · repaso' : '');
  if (t.en) {
    const oculto = !t.vistoVer && Voz.elegir([fraseEn(t.en), t.en.en]) && !Son.mudo;
    if (oculto) {
      $('cTit').textContent = '🔊 Listen: what do they need?';
      c.appendChild(el('p', 'sub', 'Escucha el pedido (las veces que quieras) y arma lo que piden.'));
      $('bVer').classList.remove('oculto');
    } else {
      $('cTit').textContent = (t.en.emoji ? t.en.emoji + ' ' : '') + fraseEn(t.en);
      c.appendChild(el('p', 'formula', '')).innerHTML = sub(f) + ' <small>(' + t.en.en + ' = ' + t.en.es + ')</small>';
    }
  } else {
    $('cTit').textContent = (m ? m.emoji + ' ' : '🧪 ') + (t.p || (m ? m.pedido : 'Arma esta molécula'));
    const fo = c.appendChild(el('p', 'formula', ''));
    fo.innerHTML = (t.obj.nombre ? '<small>Arma </small>' + t.obj.nombre + ' · ' : '<small>Arma </small>') + sub(f);
  }
  if (S.P.receta || t.pista) pintarReceta(c);
}
function pintarReceta(c) {
  const t = S.t, cu = Q.contar(S.g.sim), ul = el('ul', 'receta');
  ul.id = 'receta'; ul.setAttribute('aria-label', 'Lo que lleva');
  Object.keys(t.obj.cuenta).sort((a, b) => ORDEN_EL.indexOf(a) - ORDEN_EL.indexOf(b)).forEach(s => {
    const li = el('li', '', ''), hay = cu[s] || 0, pide = t.obj.cuenta[s];
    li.appendChild(bolita(s)); li.appendChild(document.createTextNode(pide + ' ' + (pide === 1 ? nombreEl(s) : nombreEl(s) + 's') + (S.P.marcas ? ' (' + hay + ')' : '')));
    if (S.P.marcas && hay === pide) li.className = 'ok';
    if (hay > pide) li.className = 'sobra';
    ul.appendChild(li);
  });
  const viejo = $('receta'); if (viejo) viejo.replaceWith(ul); else c.appendChild(ul);
}
function bolita(s) { const b = el('span', 'bolita', s); b.style.setProperty('--c', Q.ELEM[s].color); b.style.setProperty('--t', Q.ELEM[s].tinta); b.setAttribute('aria-hidden', 'true'); return b; }
function pintarPaleta() {
  const p = $('paleta'); p.innerHTML = '';
  paletaDe().forEach(s => {
    const e = Q.ELEM[s], b = el('button', 'atomo', '');
    b.type = 'button'; b.dataset.s = s;
    b.setAttribute('aria-label', e.nombre + ' (' + s + '), ' + plural(e.val, 'brazo', 'brazos') + '. Tecla ' + TECLA_DE[s]);
    b.appendChild(el('span', 'tec', TECLA_DE[s])).setAttribute('aria-hidden', 'true');
    b.appendChild(bolita(s));
    const br = el('span', 'brazos', ''); br.setAttribute('aria-hidden', 'true'); for (let k = 0; k < e.val; k++) br.appendChild(document.createElement('i')); b.appendChild(br);
    b.appendChild(el('span', 'nom', e.nombre)).setAttribute('aria-hidden', 'true');
    b.addEventListener('click', ev => { pegar(s); if (ev.detail > 0) b.blur(); });
    p.appendChild(b);
  });
}
function ponerOrden(o) {
  S.orden = o;
  document.querySelectorAll('.enl').forEach(b => b.setAttribute('aria-checked', String(+b.dataset.o === o)));
}
const libresDe = i => Q.libres(S.g, i);
const conBrazos = () => S.g.sim.map((s, i) => i).filter(i => libresDe(i) > 0);
function guardarHist() { S.hist.push({ g: { sim: S.g.sim.slice(), enl: S.g.enl.map(e => e.slice()), ids: S.g.ids.slice() }, ancla: S.ancla }); if (S.hist.length > 60) S.hist.shift(); }
function pegar(s) {
  if (S.fase !== 'juego' || S.pausa || !S.t || (S.t.tipo !== 'armar' && S.t.tipo !== 'libre') || S.cerrada) return;
  const e = Q.ELEM[s];
  if (paletaDe().indexOf(s) < 0) return;
  const g = S.g;
  if (g.sim.length >= 26) { aviso('La placa está llena: deshaz o vacía.'); return; }
  if (!g.sim.length) {
    guardarHist();
    g.sim.push(s); g.ids.push(S.sigId++); S.ancla = 0; S.puestos++;
    Son.efecto('pegar', s); anunciar('Pusiste un ' + nombreEl(s) + ' con ' + plural(e.val, 'brazo libre', 'brazos libres') + '. Toca otro átomo abajo para pegárselo.');
    despues(); return;
  }
  let a = S.ancla;
  if (a < 0 || libresDe(a) <= 0) {
    const cand = conBrazos();
    if (cand.length === 1) a = cand[0];
    else if (a >= 0 && !cand.length) { aviso('Ya no quedan brazos libres.'); return; }
    else if (a >= 0) { aviso('Al ' + nombreEl(g.sim[a]) + ' ya no le quedan brazos: toca en la molécula otro átomo con muescas.'); Son.efecto('no'); return; }
    else { aviso('Primero toca en la molécula el átomo al que se lo quieres pegar (los que tienen muescas).'); Son.efecto('no'); destacar(cand); return; }
  }
  const o = Math.max(1, Math.min(S.orden, libresDe(a), e.val));
  guardarHist();
  g.sim.push(s); g.ids.push(S.sigId++); const k = g.sim.length - 1;
  g.enl.push([a, k, o]); S.puestos++;
  Son.efecto('pegar', s); if (o > 1) setTimeout(() => Son.efecto('enlace', o), 90);
  // el aro: sigue en el mismo si le quedan brazos; si no, pasa al nuevo o a otro con brazos
  S.ancla = libresDe(a) > 0 ? a : libresDe(k) > 0 ? k : (conBrazos()[0] != null ? conBrazos()[0] : -1);
  let msg = nombreEl(s) + ' pegado al ' + nombreEl(g.sim[a]) + (o > 1 ? ' con un enlace ' + (o === 2 ? 'doble' : 'triple') : '') + '.';
  if (S.orden > o && e.val < S.orden) msg += ' (El ' + s + ' sólo hace ' + plural(e.val, 'enlace', 'enlaces') + ': quedó ' + (o === 1 ? 'sencillo' : 'doble') + '.)';
  anunciar(msg + ' ' + estadoTexto());
  despues();
}
function tocarAtomo(i) {
  if (S.fase !== 'juego' || S.pausa || S.cerrada) return;
  const g = S.g;
  if (i === S.ancla) { S.ancla = -1; Son.efecto('elegir'); anunciar('Sin marcar.'); dibujar(); return; }
  const a = S.ancla;
  const e = a >= 0 ? g.enl.find(x => (x[0] === a && x[1] === i) || (x[1] === a && x[0] === i)) : null;
  if (e) {
    const cur = e[2], puede = cur < 3 && libresDe(a) >= 1 && libresDe(i) >= 1;
    if (!puede && cur === 1) { aviso('Para un enlace doble, al ' + nombreEl(g.sim[a]) + ' y al ' + nombreEl(g.sim[i]) + ' les tiene que quedar un brazo libre a cada uno.'); Son.efecto('no'); return; }
    guardarHist();
    e[2] = puede ? cur + 1 : 1;
    Son.efecto(e[2] > 1 ? 'enlace' : 'quitar', e[2]);
    anunciar('El enlace ' + g.sim[a] + '–' + g.sim[i] + ' ahora es ' + ['', 'sencillo', 'doble', 'triple'][e[2]] + '. ' + estadoTexto());
    despues(); return;
  }
  S.ancla = i; Son.efecto('elegir');
  anunciar('Marcaste el ' + nombreEl(g.sim[i]) + ': ' + (libresDe(i) ? 'le ' + (libresDe(i) === 1 ? 'queda 1 brazo libre' : 'quedan ' + libresDe(i) + ' brazos libres') + '. Elige abajo el átomo que le pegas.' : 'ya no le quedan brazos. Toca un vecino para cambiar su enlace.'));
  dibujar();
}
function quitar() {
  if (S.cerrada && S.t.tipo !== 'libre') return;
  const g = S.g, i = S.ancla;
  if (!g.sim.length) return;
  if (i < 0) { aviso('Marca primero el átomo que quieres quitar (uno de la punta).'); return; }
  const vs = Q.vecinos(g, i);
  if (g.sim.length > 1 && vs.length !== 1) { aviso('Sólo se quita un átomo de la punta (con un solo vecino). Usa ↶ Deshacer.'); Son.efecto('no'); return; }
  guardarHist();
  const s = g.sim[i];
  g.sim.splice(i, 1); g.ids.splice(i, 1);
  g.enl = g.enl.filter(x => x[0] !== i && x[1] !== i).map(x => [x[0] > i ? x[0] - 1 : x[0], x[1] > i ? x[1] - 1 : x[1], x[2]]);
  S.ancla = vs.length ? (vs[0].j > i ? vs[0].j - 1 : vs[0].j) : -1;
  S.cerrada = false;
  Son.efecto('quitar'); anunciar('Quitaste el ' + nombreEl(s) + '. ' + estadoTexto());
  despues(true);
}
function deshacer() {
  if (!S.hist.length) { aviso('No hay nada que deshacer.'); return; }
  if (S.cerrada && S.t.tipo !== 'libre' && S.t.hecho) return;
  const h = S.hist.pop(); S.g = h.g; S.ancla = h.ancla; S.cerrada = false;
  if (lab) lab.mol.vida(false);
  Son.efecto('quitar'); anunciar('Deshecho. ' + estadoTexto());
  despues(true);
}
function vaciar() {
  if (!S.g.sim.length) return;
  if (S.cerrada && S.t.tipo !== 'libre' && S.t.hecho) return;
  guardarHist(); S.g = { sim: [], enl: [], ids: [] }; S.ancla = -1; S.cerrada = false;
  if (lab) lab.mol.vida(false);
  Son.efecto('quitar'); anunciar('La placa quedó vacía.');
  despues(true);
}
function estadoTexto() {
  const g = S.g; if (!g.sim.length) return 'La placa está vacía.';
  const f = Q.hill(Q.contar(g.sim)), cb = conBrazos();
  if (!cb.length) return 'Llevas ' + f + ': no quedan brazos libres.';
  return 'Llevas ' + f + '. ' + cb.slice(0, 3).map(i => 'Al ' + nombreEl(g.sim[i]) + ' le ' + (libresDe(i) === 1 ? 'falta 1 enlace' : 'faltan ' + libresDe(i) + ' enlaces')).join('; ') + (cb.length > 3 ? '…' : '.');
}
function despues(sinCerrar) {
  feedback('', '');
  dibujar();
  if (S.t.tipo === 'armar' && (S.P.receta || S.t.pista)) pintarReceta($('cCuerpo'));
  if (Q.completa(S.g)) cerrar();
}
function lecturaTexto() {
  const g = S.g, l = $('lectura');
  if (!g.sim.length) { l.innerHTML = S.t.tipo === 'libre' ? 'Toca un átomo de abajo para empezar.' : 'Empieza: toca un átomo de abajo.'; return; }
  const f = Q.hill(Q.contar(g.sim)), cb = conBrazos();
  let extra = '';
  if (S.t.tipo === 'armar') {
    const cu = Q.contar(g.sim), sobra = Object.keys(cu).filter(s => cu[s] > (S.t.obj.cuenta[s] || 0));
    if (sobra.length) extra = ' · ⚠ el pedido lleva ' + sobra.map(s => (S.t.obj.cuenta[s] || 0) + ' ' + s).join(' y ');
  }
  l.innerHTML = 'Llevas <b>' + sub(f) + '</b> · ' + (cb.length ? plural(cb.reduce((n, i) => n + libresDe(i), 0), 'brazo libre', 'brazos libres') + (S.ancla >= 0 ? ' · marcado: ' + S.g.sim[S.ancla] : '') : 'cerrada') + extra;
}
let destacados = new Set();
function destacar(lista) { destacados = new Set(lista); dibujar(); setTimeout(() => { destacados = new Set(); dibujar(); }, 1800); }
function dibujar() {
  lecturaTexto();
  if (lab) {
    if (S.cerrada) return;
    lab.mol.poner(S.g, { raiz: 0, estable: true, sel: S.ancla, destinos: destacados });
  }
  pintarCapa();
  $('bDeshacer').disabled = !S.hist.length; $('bVaciar').disabled = !S.g.sim.length; $('bQuitar').disabled = S.ancla < 0;
}
/* los botones encima de los átomos */
function pintarCapa() {
  const c = $('capa'), g = S.g;
  while (c.children.length > g.sim.length) c.lastChild.remove();
  while (c.children.length < g.sim.length) {
    const b = el('button', 'atb', ''); b.type = 'button';
    b.addEventListener('click', ev => { tocarAtomo(+b.dataset.i); if (ev.detail > 0) b.blur(); });
    c.appendChild(b);
  }
  [...c.children].forEach((b, i) => {
    b.dataset.i = i;
    const s = g.sim[i], lb = libresDe(i), vs = Q.vecinos(g, i);
    b.classList.toggle('ancla', i === S.ancla); b.classList.toggle('lleno', lb === 0);
    b.setAttribute('aria-pressed', String(i === S.ancla));
    b.setAttribute('aria-label', Q.ELEM[s].nombre + ' ' + (i + 1) + (vs.length ? ', unido a ' + vs.map(v => g.sim[v.j] + (v.o > 1 ? (v.o === 2 ? ' (doble)' : ' (triple)') : '')).join(', ') : '') + (lb ? ', le ' + (lb === 1 ? 'falta 1 enlace' : 'faltan ' + lb + ' enlaces') : ', completo'));
  });
  ubicarCapa();
}
function ubicarCapa() {
  if (!lab || $('capa').classList.contains('oculto')) return;
  const c = $('capa'), ps = lab.proyectar();
  [...c.children].forEach((b, i) => {
    const p = ps[i]; if (!p) { b.style.display = 'none'; return; }
    const tam = Math.max(44, Math.min(120, p.r * 2.1));
    b.style.display = ''; b.style.width = b.style.height = tam + 'px';
    b.style.transform = 'translate(' + (p.x - tam / 2).toFixed(1) + 'px,' + (p.y - tam / 2).toFixed(1) + 'px)';
    b.style.zIndex = String(1000 - Math.round(p.z * 20));
  });
}
function cerrar() {
  const t = S.t, g = S.g;
  S.cerrada = true;
  const cod = Q.codigo(g), cu = Q.contar(g.sim), conocida = Q.porCodigo(cod);
  const esNueva = !!(conocida && conocida.armar && prefs.album.indexOf(conocida.id) < 0);
  if (esNueva) { prefs.album.push(conocida.id); S.nuevas.push(conocida); guardar(); }
  const nombreDe = conocida ? conocida.nombre : '';
  if (t.tipo === 'libre') {
    const nueva = esNueva;
    vivir(conocida);
    S.estrellas += nueva ? 1 : 0;
    $('cEti').textContent = '📒 Laboratorio libre';
    $('cTit').textContent = conocida ? (nueva ? '¡Descubriste ' + articulo(conocida) + '!' : 'Es ' + articulo(conocida)) : '¡Cumple las valencias!';
    const c = $('cCuerpo'); c.innerHTML = '';
    c.appendChild(el('p', 'formula', '')).innerHTML = (conocida ? conocida.emoji + ' ' + conocida.nombre + ' · ' : '') + sub(Q.hill(cu));
    c.appendChild(el('p', 'info', conocida ? conocida.dato + formaTexto(g) : 'Cada átomo tiene todos sus enlaces: ' + sub(Q.hill(cu)) + '. No está en el álbum.' + formaTexto(g)));
    $('bSiguiente').textContent = '🧪 Otra molécula';
    mostrarSeguir();
    Son.efecto('bien'); if (lab) lab.celebrar();
    anunciar($('cTit').textContent + ' ' + c.textContent);
    hud(); return;
  }
  const ok = t.obj.exacta ? cod === t.obj.mol.codigo : Q.igualCuenta(cu, t.obj.cuenta);
  if (ok) {
    t.hecho = true;
    contar(!t.fallo);
    const extra = Math.max(0, S.puestos - g.sim.length), est = t.fallo ? 1 : (t.pista || extra > 2) ? 2 : extra > 0 ? 2 : 3;
    if (!t.repaso) S.estrellas += est;
    const m = conocida || t.obj.mol;
    vivir(m);
    Son.efecto('bien'); if (lab) lab.celebrar();
    $('cEti').textContent = '✅ ¡Pedido listo!';
    $('cTit').textContent = m ? '¡' + cap(articulo(m)) + ', listo para servir!' : '¡Pedido listo!';
    const c = $('cCuerpo'); c.innerHTML = '';
    if (!t.repaso) c.appendChild(el('p', 'estrellas', '⭐'.repeat(est) + '☆'.repeat(3 - est))).setAttribute('aria-label', est + ' de 3 estrellas');
    c.appendChild(el('p', 'formula', '')).innerHTML = (m ? m.emoji + ' ' : '') + sub(Q.hill(cu)) + (t.en ? ' <small>' + t.en.en + ' = ' + t.en.es + '</small>' : '');
    c.appendChild(el('p', 'info', (m ? m.dato : 'Todos los átomos con sus enlaces completos.') + formaTexto(g) + (extra ? ' Pusiste ' + plural(extra, 'átomo de más', 'átomos de más') + ' por el camino.' : ' ¡Con los átomos justos!')));
    if (t.en) { Voz.decir(t.en.en, { grupo: 'pedido' }); $('bOir').classList.add('oculto'); $('bVer').classList.add('oculto'); }
    $('bSiguiente').textContent = S.idx + 1 >= S.tareas.length ? 'Terminar ▶' : 'Siguiente ▶';
    mostrarSeguir();
    anunciar('¡Bien! ' + c.textContent);
  } else {
    if (!t.fallo) { t.fallo = true; }
    Son.efecto('mal'); if (lab) lab.triste();
    let msg;
    const pide = t.obj.cuenta, falta = [], sobra = [];
    Object.keys(Object.assign({}, pide, cu)).forEach(s => { const d = (cu[s] || 0) - (pide[s] || 0); if (d > 0) sobra.push(plural(d, s, s)); if (d < 0) falta.push(plural(-d, s, s)); });
    if (!falta.length && !sobra.length) msg = 'Tiene la fórmula ' + sub(Q.hill(cu)) + ', pero es ' + (nombreDe ? 'el ' + nombreDe : 'otra molécula') + ': los átomos están en otro orden (un isómero). ' + (t.obj.mol ? pistaIsomero(t.obj.mol) : '');
    else msg = (nombreDe ? 'Armaste ' + articulo(conocida) + ' (' + sub(Q.hill(cu)) + '). ' : 'Armaste ' + sub(Q.hill(cu)) + '. ') + (sobra.length ? 'Sobra ' + sobra.join(' y ') + '. ' : '') + (falta.length ? 'Falta ' + falta.join(' y ') + '. ' : '');
    feedback(msg + ' Toca ↶ Deshacer o 🗑 Vaciar y prueba otra vez.', 'mal');
    S.cerrada = false;
    if (lab && t.obj.mol && S.P.modo !== 'normal') lab.fantasma(t.obj.mol.g);
    anunciar(msg);
    dibujar();
  }
  hud();
}
function pistaIsomero(m) {
  const g = m.g, cs = g.sim.map((s, i) => i).filter(i => g.sim[i] !== 'H');
  const o = cs.find(i => g.sim[i] === 'O' || g.sim[i] === 'N');
  if (o != null) { const vs = Q.vecinos(g, o).filter(v => g.sim[v.j] !== 'H'); return 'En ' + articulo(m) + ' el ' + g.sim[o] + ' va ' + (vs.length >= 2 ? 'entre dos átomos de carbono.' : 'en la punta, pegado a un solo carbono.'); }
  const ram = cs.some(i => Q.vecinos(g, i).filter(v => g.sim[v.j] === 'C').length >= 3);
  return ram ? 'Es ramificada: un C del medio lleva tres C.' : 'Es una cadena recta: cada C, como mucho, con dos C.';
}
const cap = t => t.charAt(0).toUpperCase() + t.slice(1);
const FEM = ['agua'];
function articulo(m) { return (FEM.indexOf(m.id) >= 0 ? 'el ' : /^(urea|glucosa|acetona|metilamina|fosfina)/.test(m.nombre) ? 'la ' : 'el ') + m.nombre; }
function formaTexto(g) {
  const f = Q.formaMolecula(g); if (!f) return '';
  const geo = f.centro >= 0 ? Q.geometria(g, f.centro) : null;
  return ' Forma: ' + Q.FORMAS[f.forma].nombre + (geo && geo.pares ? ' (el ' + g.sim[f.centro] + ' tiene ' + plural(geo.pares, 'par libre', 'pares libres') + ', en lila)' : '') + '.';
}
function vivir(m) {
  if (!lab) return;
  const g = S.g, c = Q.centros(g)[0];
  lab.mol.poner(g, { raiz: c, pares: true, pose: true });
  const f = Q.formaMolecula(g);
  lab.mol.vida(true, f ? f.centro : -1);
  lab.fantasma(null);
  $('capa').classList.add('oculto');
}
function mostrarSeguir(conOpciones) {
  $('mesa').classList.add('oculto'); $('balanceo').classList.add('oculto');
  if (!conOpciones) $('opciones').classList.add('oculto');
  // en una pregunta las opciones se quedan a la vista (la buena ✔ y la elegida ✘) y «Siguiente» va encima
  $('seguir').style.bottom = conOpciones ? (innerHeight - $('opciones').getBoundingClientRect().top + 12) + 'px' : '';
  $('seguir').classList.remove('oculto');
  setTimeout(() => { try { $('bSiguiente').focus({ preventScroll: true }); } catch (e) { /* nada */ } }, 50);
  medir();
}
$('bSiguiente').addEventListener('click', () => {
  if (S.t && S.t.tipo === 'libre') { $('seguir').classList.add('oculto'); empezarArmar(); medir(); return; }
  siguiente();
});

/* ---------- balancear ---------- */
function empezarBalanceo() {
  const r = S.t.r, e = r.e;
  S.coef = e.izq.concat(e.der).map(() => 1);
  // si ya está equilibrada con todo en 1, se empieza con un 2 en una sustancia: hay que verlo y arreglarlo
  if (r.coef.every(k => k === 1)) S.coef[Math.floor(Math.random() * S.coef.length)] = 2;
  $('balanceo').classList.remove('oculto');
  $('cEti').textContent = '⚖️ Reacción ' + (pos() + 1) + ' de ' + S.items + (r.tipo ? ' · ' + r.tipo : '') + (S.t.repaso ? ' · repaso' : '');
  $('cTit').textContent = 'Equilibra: los mismos átomos a cada lado';
  $('bOir').classList.add('oculto'); $('bVer').classList.add('oculto');
  pintarCoefs();
  Son.efecto('ding'); if (lab) lab.hola();
  anunciar('Equilibra la reacción: ' + leerEc(S.coef) + '. Cambia los números con más y menos.');
}
const especies = () => S.t.r.e.izq.concat(S.t.r.e.der);
function leerEc(coef) { const e = S.t.r.e; const f = (l, o) => l.map((x, j) => (coef[j + o] > 1 ? coef[j + o] + ' ' : '') + x).join(' más '); return f(e.izq, 0) + ' da ' + f(e.der, e.izq.length); }
function pintarCoefs() {
  const e = S.t.r.e, box = $('coefs'); box.innerHTML = '';
  especies().forEach((f, j) => {
    if (j === e.izq.length) box.appendChild(el('div', 'coef flecha', '→')).setAttribute('aria-hidden', 'true');
    const d = el('div', 'coef', '');
    d.appendChild(el('span', 'lado', j < e.izq.length ? 'entra' : 'sale'));
    const fo = el('span', 'f', ''); fo.innerHTML = sub(f); d.appendChild(fo);
    const ctl = el('div', 'ctl', '');
    const menos = el('button', '', '−'), mas = el('button', '', '+'), out = el('output', '', String(S.coef[j]));
    menos.type = mas.type = 'button';
    menos.setAttribute('aria-label', 'Menos ' + f); mas.setAttribute('aria-label', 'Más ' + f);
    out.setAttribute('aria-label', 'Moléculas de ' + f); out.id = 'k' + j;
    menos.addEventListener('click', () => ponerCoef(j, S.coef[j] - 1)); mas.addEventListener('click', () => ponerCoef(j, S.coef[j] + 1));
    ctl.append(menos, out, mas); d.appendChild(ctl); box.appendChild(d);
  });
  actualizarBalanceo();
}
function ponerCoef(j, n) {
  if (S.fase !== 'juego' || !S.t || S.t.tipo !== 'balancear' || S.t.hecho) return;
  n = clamp(n, 1, 16); if (n === S.coef[j]) { Son.efecto('no'); return; }
  S.coef[j] = n; Son.efecto('tic');
  const o = $('k' + j); if (o) o.textContent = String(n);
  feedback('', '');
  actualizarBalanceo();
  anunciar(n + ' ' + especies()[j] + '. ' + $('cuentaAt').textContent);
}
function lados() {
  const e = S.t.r.e, ci = S.coef.slice(0, e.izq.length), cd = S.coef.slice(e.izq.length);
  return { e, ci, cd, ai: Q.cuentaLado(e.izq, ci), ad: Q.cuentaLado(e.der, cd), mi: Q.masaLado(e.izq, ci), md: Q.masaLado(e.der, cd) };
}
const u = x => x.toLocaleString('es-CO', { maximumFractionDigits: 1, minimumFractionDigits: 1 }) + ' u';
function actualizarBalanceo() {
  const L = lados(), els = [...new Set(Object.keys(L.ai).concat(Object.keys(L.ad)))];
  const cuerpo = $('cCuerpo'); cuerpo.innerHTML = '';
  const ec = el('p', 'ecuacion', '');
  especies().forEach((f, j) => {
    if (j === L.e.izq.length) ec.appendChild(el('span', 'flecha', '→'));
    else if (j > 0) ec.appendChild(el('span', '', '+'));
    const k = el('span', 'k' + (S.coef[j] === 1 ? ' uno' : ''), String(S.coef[j])); ec.appendChild(k);
    const fo = el('span', '', ''); fo.innerHTML = sub(f); ec.appendChild(fo);
  });
  ec.setAttribute('aria-label', leerEc(S.coef)); cuerpo.appendChild(ec);
  if (S.t.r.vida) cuerpo.appendChild(el('p', 'info', S.t.r.vida));
  const ca = $('cuentaAt'); ca.innerHTML = '';
  els.forEach(s => {
    const a = L.ai[s] || 0, b = L.ad[s] || 0, sp = el('span', S.P.marcas ? (a === b ? 'ok' : 'no') : '', '');
    sp.textContent = s + ': ' + a + ' → ' + b + (S.P.marcas ? (a === b ? ' ✔' : ' ✘') : '');
    ca.appendChild(sp);
  });
  ca.appendChild(el('span', 'masa', '⚖️ ' + u(L.mi) + (Math.abs(L.mi - L.md) < 1e-6 ? ' = ' : L.mi > L.md ? ' > ' : ' < ') + u(L.md)));
  if (lab) lab.balanza({ izq: L.e.izq.map((f, j) => ({ f, coef: L.ci[j] })), der: L.e.der.map((f, j) => ({ f, coef: L.cd[j] })) });
}
function comprobarBalanceo() {
  const t = S.t; if (!t || t.tipo !== 'balancear' || t.hecho || S.fase !== 'juego') return;
  const L = lados();
  if (!Q.igualCuenta(L.ai, L.ad)) {
    t.fallo = true; Son.efecto('mal'); if (lab) lab.triste();
    const s = Object.keys(Object.assign({}, L.ai, L.ad)).find(x => (L.ai[x] || 0) !== (L.ad[x] || 0));
    feedback('Todavía no: hay ' + (L.ai[s] || 0) + ' ' + s + ' a la izquierda y ' + (L.ad[s] || 0) + ' a la derecha. Los átomos no aparecen ni desaparecen.', 'mal');
    return;
  }
  const k = S.coef.reduce((a, b) => { while (b) [a, b] = [b, a % b]; return a; });
  if (k > 1) { feedback('¡Está equilibrada! Pero se puede simplificar: todos los números se dividen entre ' + k + '. Usa los más pequeños.', 'aviso'); Son.efecto('no'); return; }
  t.hecho = true;
  contar(!t.fallo);
  const est = t.fallo ? 1 : t.pista ? 2 : 3;
  if (!t.repaso) S.estrellas += est;
  Son.efecto('reaccion');
  $('balanceo').classList.add('oculto');
  const fin = () => {
    Son.efecto('bien'); if (lab) lab.celebrar();
    $('cEti').textContent = '✅ ¡Equilibrada!';
    $('cTit').textContent = 'La masa se conserva';
    const c = $('cCuerpo'); c.innerHTML = '';
    if (!t.repaso) c.appendChild(el('p', 'estrellas', '⭐'.repeat(est) + '☆'.repeat(3 - est))).setAttribute('aria-label', est + ' de 3 estrellas');
    const ec = el('p', 'ecuacion', ''); ec.innerHTML = especies().map((f, j) => (j === L.e.izq.length ? '<span class="flecha">→</span> ' : j ? '+ ' : '') + (S.coef[j] > 1 ? S.coef[j] + ' ' : '') + sub(f)).join(' '); c.appendChild(ec);
    c.appendChild(el('p', 'info', 'Antes y después: ' + Object.keys(L.ai).map(s => L.ai[s] + ' ' + s).join(', ') + '. Masa: ' + u(L.mi) + ' = ' + u(L.md) + '. ' + (t.r.vida || '')));
    $('bSiguiente').textContent = S.idx + 1 >= S.tareas.length ? 'Terminar ▶' : 'Siguiente ▶';
    mostrarSeguir();
    anunciar('¡Equilibrada! ' + leerEc(S.coef) + '. La masa se conserva.');
    hud();
  };
  if (lab) lab.reaccionar(fin); else fin();
}
$('bComprobar').addEventListener('click', comprobarBalanceo);

/* ---------- preguntas ---------- */
function empezarPregunta() {
  const t = S.t, q = t.q;
  t.vistoVer = !q.escucha; t.oidas = 0; t.respondida = false;
  $('cEti').textContent = '❓ Pregunta ' + (pos() + 1) + ' de ' + S.items + (t.repaso ? ' · repaso' : '');
  pintarPregunta();
  const box = $('opciones'); box.innerHTML = ''; box.style.setProperty('--n', String(q.opciones.length > 3 ? 2 : q.opciones.length));
  const tachada = S.P.tachar && q.opciones.length > 2 ? barajar(q.opciones.map((o, i) => i).filter(i => i !== q.correcta))[0] : -1;
  q.opciones.forEach((o, i) => {
    const b = el('button', 'op' + (i === tachada ? ' tachada' : ''), ''); b.type = 'button'; b.style.setProperty('--c', GLIFOS[i].c);
    b.appendChild(el('span', 'gl', GLIFOS[i].f)).setAttribute('aria-hidden', 'true');
    b.appendChild(el('span', 'tx', o)); b.appendChild(el('span', 'tec', String(i + 1))).setAttribute('aria-hidden', 'true');
    b.setAttribute('aria-label', (i + 1) + ', ' + GLIFOS[i].n + ': ' + o + (i === tachada ? ' (tachada: no es)' : ''));
    if (i === tachada) b.setAttribute('aria-disabled', 'true');
    b.addEventListener('click', () => responder(i));
    box.appendChild(b);
  });
  box.classList.remove('oculto');
  if (t.conMol && lab && S.g.sim.length) { lab.mol.poner(S.g, { raiz: Q.centros(S.g)[0], pares: true, pose: true }); lab.mol.vida(true); }
  else if (lab) { const g = S.g.sim.length && Q.completa(S.g) ? S.g : Q.POR_ID.agua.g; lab.mol.poner(g, { raiz: Q.centros(g)[0], pares: true, pose: true }); lab.mol.vida(true); }
  if (q.oir) setTimeout(oirPregunta, 300);
  anunciar('Pregunta: ' + (t.vistoVer ? q.p : 'escucha') + '. Opciones: ' + q.opciones.map((o, i) => (i + 1) + ', ' + o).join('; ') + '.');
}
function pintarPregunta() {
  const t = S.t, q = t.q, c = $('cCuerpo'); c.innerHTML = '';
  const hay = q.oir && Voz.tiene(q.oir) && !Son.mudo;
  $('bOir').classList.toggle('oculto', !hay);
  if (q.escucha && !t.vistoVer && hay) {
    $('cTit').textContent = '🔊 Escucha y elige';
    c.appendChild(el('p', 'bocina', '🔊 🔊 🔊'));
    $('bVer').classList.remove('oculto');
  } else {
    $('cTit').textContent = q.p;
    $('bVer').classList.add('oculto');
  }
}
function oirPregunta() {
  const t = S.t; if (!t || t.tipo !== 'pregunta' || !t.q.oir) return;
  if (!Voz.tiene(t.q.oir) || Son.mudo) { if (!t.vistoVer) { t.vistoVer = true; pintarPregunta(); } return; }
  t.oidas++; Voz.decir(t.q.oir, { grupo: 'pregunta' });
  if (t.oidas >= 3 && !t.vistoVer) { t.vistoVer = true; pintarPregunta(); }
}
function responder(i) {
  const t = S.t; if (!t || t.tipo !== 'pregunta' || t.respondida || S.fase !== 'juego' || S.pausa) return;
  const q = t.q, b = $('opciones').children[i]; if (!b || b.getAttribute('aria-disabled') === 'true') return;
  t.respondida = true;
  const ok = i === q.correcta;
  [...$('opciones').children].forEach((x, k) => { if (k === q.correcta) x.classList.add('bien'); else if (k === i) x.classList.add('mal'); });
  contar(ok);
  if (ok) { if (!t.repaso) S.estrellas += 1; Son.efecto('bien'); if (lab) lab.celebrar(); feedback('¡Bien! ' + (q.porque || ''), 'bien'); }
  else { Son.efecto('mal'); if (lab) lab.triste(); feedback('Era: ' + q.opciones[q.correcta] + '. ' + (q.porque || ''), 'mal'); S.repasar.push(q); repasarLuego(t); }
  if (!t.vistoVer) { t.vistoVer = true; $('cTit').textContent = q.p; $('cCuerpo').innerHTML = ''; }
  if (q.oir && ok) Voz.decir(q.oir, { grupo: 'pregunta' });
  $('bSiguiente').textContent = S.idx + 1 >= S.tareas.length ? 'Terminar ▶' : 'Siguiente ▶';
  setTimeout(() => mostrarSeguir(true), 700);
  anunciar((ok ? '¡Bien! ' : 'No. Era ' + q.opciones[q.correcta] + '. ') + (q.porque || ''));
  hud();
}

/* ---------- la pista ---------- */
function pista() {
  const t = S.t; if (!t || S.fase !== 'juego' || S.pausa) return;
  const quedan = S.P.pistas - S.pistasUsadas;
  if (t.tipo === 'libre') { aviso('En el laboratorio libre no hay pedido: prueba con lo que dice el álbum (las fórmulas con ❓).'); return; }
  if (quedan <= 0 && !t.pista) { aviso('Ya usaste tus pistas de esta partida.'); return; }
  if (!t.pista) { S.pistasUsadas++; t.pista = true; }
  if (t.tipo === 'armar') {
    if (lab && t.obj.mol) lab.fantasma(t.obj.mol.g);
    pintarCartaArmar();
    const g = S.g, cb = conBrazos();
    let m;
    if (!g.sim.length) { const c = Object.keys(t.obj.cuenta).sort((a, b) => Q.ELEM[b].val - Q.ELEM[a].val)[0]; m = 'Empieza por el átomo con más brazos: el ' + nombreEl(c) + ' (' + c + '). Luego pégale los demás.'; }
    else if (t.obj.mol && /=|#/.test(t.obj.mol.est) && !g.enl.some(e => e[2] > 1)) m = 'Esta molécula tiene un enlace ' + (/#/.test(t.obj.mol.est) ? 'triple (≡)' : 'doble (=)') + ': elige el enlace abajo antes de pegar, o toca un átomo y luego su vecino.';
    else m = cb.length ? 'Al ' + nombreEl(g.sim[cb[0]]) + ' le ' + (libresDe(cb[0]) === 1 ? 'falta 1 enlace' : 'faltan ' + libresDe(cb[0]) + ' enlaces') + '. Mira la receta y la molécula pequeña de arriba.' : 'Mira la molécula pequeña de arriba.';
    feedback('💡 ' + m, 'aviso'); anunciar(m);
  } else if (t.tipo === 'balancear') {
    const L = lados(), sol = t.r.coef;
    const s = Object.keys(Object.assign({}, L.ai, L.ad)).find(x => (L.ai[x] || 0) !== (L.ad[x] || 0));
    let m = s ? 'Mira el ' + nombreEl(s) + ' (' + s + '): hay ' + (L.ai[s] || 0) + ' a la izquierda y ' + (L.ad[s] || 0) + ' a la derecha. Cambia el número de una sustancia que lo tenga.' : 'Los átomos ya cuadran: ¿se pueden simplificar los números?';
    if (S.P.modo === 'facil') { const j = S.coef.findIndex((c, k) => c !== sol[k]); if (j >= 0) { S.coef[j] = sol[j]; pintarCoefs(); m += ' Te puse el de ' + especies()[j] + ': ' + sol[j] + '.'; } }
    feedback('💡 ' + m, 'aviso'); anunciar(m);
  } else if (t.tipo === 'pregunta') {
    const box = $('opciones'), malas = [...box.children].map((b, i) => i).filter(i => i !== t.q.correcta && !box.children[i].classList.contains('tachada'));
    if (malas.length > 1 || (malas.length === 1 && t.q.opciones.length > 2)) { const i = barajar(malas)[0]; box.children[i].classList.add('tachada'); box.children[i].setAttribute('aria-disabled', 'true'); anunciar('Taché una opción que no es.'); }
  }
  hud();
}

/* ---------- el final ---------- */
function avisarLeccion(terminado) {
  if (S.modo !== 'leccion' || !LJ) return;
  const r = { aciertos: S.aciertos, total: S.total, fallos: S.fallos, nivel: 'Tarea ' + Math.min(S.items, S.hechos) + ' de ' + S.items };
  try { if (terminado) LJ.resultado(r); else LJ.progreso(r); } catch (e) { /* sin padre: nada */ }
}
function estrellasPartida() { const f = S.total ? S.aciertos / S.total : 1; return f >= 0.9 ? 3 : f >= 0.6 ? 2 : 1; }
function terminar() {
  S.fase = 'fin'; Voz.callar();
  ['carta', 'mesa', 'balanceo', 'opciones', 'seguir', 'capa', 'hud'].forEach(id => $(id).classList.add('oculto'));
  if (lab) lab.celebrar();
  const est = estrellasPartida(), libre = S.tareas.length === 1 && S.tareas[0].tipo === 'libre';
  const resumen = libre ? 'Descubriste ' + plural(S.nuevas.length, 'molécula nueva', 'moléculas nuevas') + '.' : 'Bien a la primera: ' + S.aciertos + ' de ' + S.total + '. Estrellas: ' + S.estrellas + ' ⭐.';
  const repaso = S.repasar.slice(0, 3).map(q => sinEmoji(q.p).slice(0, 44) + ' → ' + q.opciones[q.correcta]);
  if (S.modo === 'leccion') {
    avisarLeccion(true);
    const chips = S.tareas.filter(t => !t.repaso && (t.tipo === 'armar' || t.tipo === 'balancear')).slice(0, 10).map(t => t.tipo === 'armar' ? (t.obj.mol ? t.obj.mol.emoji + ' ' + (t.en ? t.en.en + ' · ' : '') + t.obj.mol.nombre + ' ' + sub(t.obj.formula) : sub(t.obj.formula)) : t.r.coef.map((k, j) => (j === t.r.e.izq.length ? '→ ' : j ? '+ ' : '') + (k > 1 ? k + ' ' : '') + sub(t.r.e.izq.concat(t.r.e.der)[j])).join(' '));
    setTimeout(() => LJ.logrado({ detalle: '⭐'.repeat(est) + ' ' + resumen, chips: chips.length ? chips : repaso, chipsRotulo: 'Lo que armaste y equilibraste', alOtraVez: () => empezar() }), 900);
    return;
  }
  prefs.estrellas = (prefs.estrellas || 0) + S.estrellas;
  const clave = sel.modo + '|' + sel.tema + '|' + sel.grado, rec = prefs.records[clave];
  const mejora = !libre && (!rec || S.estrellas > rec.estrellas);
  if (mejora) { prefs.records[clave] = { estrellas: S.estrellas }; const ks = Object.keys(prefs.records); if (ks.length > 40) delete prefs.records[ks[0]]; }
  guardar();
  const n = albumN();
  $('fEst').textContent = libre ? '📒' : '⭐'.repeat(est) + '☆'.repeat(3 - est); $('fEst').setAttribute('aria-label', libre ? 'Álbum' : est + ' de 3 estrellas');
  $('fTit').textContent = libre ? '¡Buen laboratorio!' : est === 3 ? '¡Chef de moléculas!' : est === 2 ? '¡Muy bien!' : '¡Lo lograste!';
  $('fRes').textContent = resumen + (rec && !mejora && !libre ? ' Tu récord aquí: ' + rec.estrellas + ' ⭐.' : mejora && rec ? ' ¡Nuevo récord!' : '') + ' Álbum: ' + n.tengo + ' de ' + n.todas + '.';
  $('fRepasa').textContent = repaso.length ? 'Para repasar: ' + repaso.join(' · ') : '';
  $('fNuevo').textContent = S.nuevas.length ? '📒 Nuevas en tu álbum: ' + [...new Set(S.nuevas)].map(m => m.emoji + ' ' + m.nombre).join(', ') + '.' : '';
  setTimeout(() => { if (S.fase === 'fin') { $('final').classList.remove('oculto'); $('bOtra2').focus(); } }, 900);
}

/* ---------- el álbum ---------- */
function albumN() { const todas = Q.MOLECULAS.filter(m => m.armar); return { todas: todas.length, tengo: todas.filter(m => prefs.album.indexOf(m.id) >= 0).length }; }
function abrirAlbum() {
  const ul = $('aLista'); ul.innerHTML = '';
  Q.MOLECULAS.filter(m => m.armar).sort((a, b) => a.grado - b.grado || nAt(a.cuenta) - nAt(b.cuenta)).forEach(m => {
    const tengo = prefs.album.indexOf(m.id) >= 0, li = el('li', tengo ? '' : 'no', '');
    li.appendChild(el('span', 'e', tengo ? m.emoji : '❓')).setAttribute('aria-hidden', 'true');
    const d = el('div', '', ''); d.appendChild(el('b', '', tengo ? cap(m.nombre) : 'Por descubrir'));
    const f = el('span', '', ''); f.innerHTML = sub(m.hill) + (tengo ? '' : ' · desde ' + m.grado + '.º'); d.appendChild(f); li.appendChild(d);
    ul.appendChild(li);
  });
  const n = albumN();
  $('aRes').textContent = 'Tienes ' + n.tengo + ' de ' + n.todas + '. Las que faltan muestran su fórmula: ármalas en el laboratorio libre (o en los pedidos) para descubrirlas.';
  $('album').classList.remove('oculto'); $('bCerrarAlbum').focus();
}
$('bVerAlbum').addEventListener('click', abrirAlbum);
$('bAlbum').addEventListener('click', () => { if (S.fase === 'juego') { S.pausa = true; abrirAlbum(); } });
$('bCerrarAlbum').addEventListener('click', () => { $('album').classList.add('oculto'); if (S.fase === 'juego') { S.pausa = false; $('bAlbum').focus(); } else $('bJugar').focus(); });

/* ---------- el HUD, la pausa y las teclas ---------- */
function pos() { return Math.max(0, S.tareas.slice(0, S.idx).filter(t => t.item && !t.repaso).length); }
function hud() {
  const t = S.t;
  $('hTarea').textContent = !t ? '¡A cocinar!' : t.tipo === 'libre' ? 'Laboratorio libre' : t.repaso ? 'Repaso' : (t.tipo === 'balancear' ? 'Reacción ' : t.tipo === 'pregunta' ? 'Pregunta ' : 'Pedido ') + Math.min(S.items, pos() + 1) + ' de ' + S.items;
  $('hEstrellas').textContent = S.estrellas + ' ⭐' + (t && t.tipo === 'libre' ? ' · álbum ' + albumN().tengo + '/' + albumN().todas : '');
  $('iSonido').textContent = Son.mudo ? '🔇' : '🔊'; $('tSonido').textContent = Son.mudo ? 'Activar sonido' : 'Silenciar'; $('bSonido').setAttribute('aria-pressed', String(Son.mudo));
  const q = S.P.pistas - S.pistasUsadas;
  $('tPista').textContent = S.P.pistas === Infinity ? 'Pista' : 'Pista (' + Math.max(0, q) + ')';
  $('bPista').disabled = !t || t.tipo === 'libre' || (q <= 0 && !(t && t.pista));
}
function anunciar(t) { const a = $('anuncio'); a.textContent = ''; setTimeout(() => { a.textContent = t; }, 30); }
function feedback(txt, tono) { const f = $('cFeed'); f.textContent = txt; f.className = 'feed ' + (tono || ''); medir(); }
function aviso(t) { feedback(t, 'aviso'); anunciar(t); }
function el(tag, cls, txt) { const e = document.createElement(tag); if (cls) e.className = cls; if (txt != null && txt !== '') e.textContent = txt; return e; }
function pausar() {
  if (S.fase !== 'juego') return;
  S.pausa = true; Voz.callar();
  $('pRes').textContent = S.t && S.t.tipo === 'libre' ? 'Álbum: ' + albumN().tengo + ' de ' + albumN().todas + '.' : 'Llevas ' + S.aciertos + ' de ' + S.total + ' bien a la primera y ' + S.estrellas + ' ⭐.';
  $('bInicio').classList.toggle('oculto', S.modo === 'leccion');
  $('bTerminar').classList.toggle('oculto', !(S.t && S.t.tipo === 'libre'));
  $('pVol').value = Math.round(Son.vol * 100);
  $('pausa').classList.remove('oculto'); $('bSeguir').focus();
}
function seguir() { $('pausa').classList.add('oculto'); S.pausa = false; }
function ponerCalma(b) { S.calma = !!b; if (!LEC) { prefs.calma = S.calma; guardar(); } if (lab) lab.calma(S.calma); }
function irAlInicio() {
  S.fase = 'menu'; S.pausa = false; Voz.callar();
  ['pausa', 'final', 'carta', 'hud', 'mesa', 'balanceo', 'opciones', 'seguir', 'capa'].forEach(id => $(id).classList.add('oculto'));
  if (lab) { lab.balanza(null); lab.fantasma(null); lab.mol.vida(false); lab.mol.poner(Q.POR_ID.agua.g, { raiz: 0, pares: true, pose: true }); lab.mol.vida(true); }
  armarInicio(); $('inicio').classList.remove('oculto'); $('bJugar').focus({ preventScroll: true });
}
$('bSonido').addEventListener('click', () => { Son.mudo = !Son.mudo; if (!LEC) { prefs.mudo = Son.mudo; guardar(); } Son.despertar(); Son.aplicar(); if (Son.mudo) Voz.callar(); hud(); if (S.t && S.t.tipo === 'armar') pintarCartaArmar(); });
$('bPista').addEventListener('click', pista);
$('bMenu').addEventListener('click', pausar);
$('bSeguir').addEventListener('click', seguir);
$('bOtra').addEventListener('click', () => { $('pausa').classList.add('oculto'); empezar(); });
$('bTerminar').addEventListener('click', () => { $('pausa').classList.add('oculto'); S.pausa = false; terminar(); });
$('bInicio').addEventListener('click', irAlInicio);
$('bOir').addEventListener('click', () => { if (S.t && S.t.tipo === 'pregunta') oirPregunta(); else oirPedido(); });
$('bVer').addEventListener('click', ver);
$('bOtra2').addEventListener('click', empezar);
$('bCambiar').addEventListener('click', irAlInicio);
$('bDeshacer').addEventListener('click', deshacer); $('bQuitar').addEventListener('click', quitar); $('bVaciar').addEventListener('click', vaciar);
document.querySelectorAll('.enl').forEach(b => b.addEventListener('click', () => { ponerOrden(+b.dataset.o); Son.efecto('elegir'); anunciar('Enlace ' + ['', 'sencillo', 'doble', 'triple'][+b.dataset.o] + ' para lo que pegues.'); }));
function ver() {
  const t = S.t; if (!t || t.vistoVer) return; t.vistoVer = true;
  if (t.tipo === 'pregunta') pintarPregunta(); else pintarCartaArmar();
  anunciar(t.tipo === 'pregunta' ? t.q.p : textoPedido());
}
const volumen = ev => { Son.vol = ev.target.value / 100; prefs.vol = Son.vol; guardar(); Son.despertar(); Son.aplicar(); };
$('pVol').addEventListener('input', volumen); $('oVol').addEventListener('input', volumen);
['bSonido', 'bPista', 'bMenu', 'bOir', 'bVer', 'bAlbum'].forEach(id => $(id).addEventListener('click', ev => { if (ev.detail > 0) ev.currentTarget.blur(); }));
document.addEventListener('visibilitychange', () => { if (document.hidden && !S.pausa) pausar(); });
addEventListener('keydown', ev => {
  if (ev.ctrlKey || ev.metaKey || ev.altKey) return;
  const k = ev.key.toLowerCase();
  if (!$('pausa').classList.contains('oculto')) { if (k === 'escape') { ev.preventDefault(); seguir(); } return; }
  if (!$('album').classList.contains('oculto')) { if (k === 'escape') { ev.preventDefault(); $('bCerrarAlbum').click(); } return; }
  if (!$('inicio').classList.contains('oculto') || !$('final').classList.contains('oculto') || document.querySelector('.lj-capa')) return;
  if (S.fase !== 'juego') return;
  const t = S.t; if (!t) return;
  const enBoton = ev.target && ev.target.tagName === 'BUTTON';
  if ((k === ' ' || k === 'enter') && enBoton) return;
  if (k === 'escape') { ev.preventDefault(); if (S.ancla >= 0 && (t.tipo === 'armar' || t.tipo === 'libre') && !S.cerrada) { S.ancla = -1; dibujar(); anunciar('Sin marcar.'); } else pausar(); return; }
  if (k === 'm') { $('bSonido').click(); return; }
  if (k === '?') { pista(); return; }
  if (k === 'e') { $('bOir').classList.contains('oculto') || $('bOir').click(); return; }
  if (k === 'v') { ver(); return; }
  if (k === 'enter' && !$('seguir').classList.contains('oculto')) { ev.preventDefault(); $('bSiguiente').click(); return; }
  if (t.tipo === 'pregunta') { const i = '1234'.indexOf(k); if (i >= 0 && i < t.q.opciones.length) { ev.preventDefault(); responder(i); } return; }
  if (t.tipo === 'balancear') { if (k === 'enter') { ev.preventDefault(); comprobarBalanceo(); } return; }
  if (S.cerrada) return;
  if (TECLA_EL[k] && paletaDe().indexOf(TECLA_EL[k]) >= 0) { ev.preventDefault(); pegar(TECLA_EL[k]); const b = document.querySelector('.atomo[data-s="' + TECLA_EL[k] + '"]'); if (b) { b.classList.add('on'); setTimeout(() => b.classList.remove('on'), 120); } return; }
  if ('123'.indexOf(k) >= 0 && k) { ponerOrden(+k); anunciar('Enlace ' + ['', 'sencillo', 'doble', 'triple'][+k] + '.'); return; }
  if (k === 'z' || k === 'backspace') { ev.preventDefault(); deshacer(); return; }
  if (k === 'delete') { ev.preventDefault(); quitar(); return; }
  if (k === 'arrowleft' || k === 'arrowright') { ev.preventDefault(); if (lab) lab.mol.girar(k === 'arrowleft' ? -0.3 : 0.3, 0); return; }
  if (k === 'arrowup' || k === 'arrowdown') { ev.preventDefault(); if (lab) lab.mol.girar(0, k === 'arrowup' ? -0.25 : 0.25); return; }
});
// arrastrar sobre el 3D gira la molécula (opcional: también ← → ↑ ↓)
(() => {
  let ar = null;
  $('gl').addEventListener('pointerdown', ev => { ar = { x: ev.clientX, y: ev.clientY }; });
  addEventListener('pointermove', ev => { if (!ar || !lab) return; lab.mol.girar((ev.clientX - ar.x) * 0.01, (ev.clientY - ar.y) * 0.006); ar = { x: ev.clientX, y: ev.clientY }; });
  addEventListener('pointerup', () => { ar = null; });
  addEventListener('pointercancel', () => { ar = null; });
})();

/* ---------- el tamaño: lo que tapan la carta y la mesa ---------- */
function medir() {
  const vis = id => !$(id).classList.contains('oculto');
  const W = innerWidth, H = innerHeight;
  // de lado y ancho (un portátil, el iframe de la sala): la carta a la izquierda y la molécula con todo el alto
  const lateral = W >= 860 && W / H >= 1.45;
  document.body.classList.toggle('lateral', lateral);
  if (!lab) return;
  let arriba = 60, abajo = 0, izq = 0;
  if (vis('carta')) { const r = $('carta').getBoundingClientRect(); if (lateral) izq = r.right + 8; else arriba = Math.max(arriba, r.bottom + 6); }
  ['mesa', 'balanceo', 'opciones', 'seguir'].forEach(id => { if (vis(id)) { const r = $(id).getBoundingClientRect(); abajo = Math.max(abajo, H - r.top + 6); } });
  if (!vis('hud') && !vis('carta')) { arriba = 0; abajo = 0; izq = 0; }
  lab.tam(W, H, { arriba: Math.min(arriba, H * 0.5), abajo: Math.min(abajo, H * 0.45), izq: Math.min(izq, W * 0.45) });
}
addEventListener('resize', () => { medir(); setTimeout(medir, 200); });
if (lab) lab.alCuadro(() => { if (S.fase === 'juego' && (S.t && (S.t.tipo === 'armar' || S.t.tipo === 'libre')) && !S.cerrada) ubicarCapa(); });

/* ---------- la sala: el inicio con todas las opciones ---------- */
const GRADOS = [6, 7, 8, 9, 10, 11];
const AYUDANTES = [{ id: 'robot', nombre: 'Robot', emoji: '🤖' }, { id: 'nina-gafas', nombre: 'Niña', emoji: '👧' }, { id: 'nino-sol', nombre: 'Niño', emoji: '👦' }];
function boton(cont, txt, activo, alPulsar, extra) {
  const b = document.createElement('button'); b.type = 'button'; b.setAttribute('aria-pressed', String(!!activo));
  if (extra) extra(b); b.appendChild(document.createTextNode(txt));
  b.addEventListener('click', alPulsar); cont.appendChild(b); return b;
}
function armarInicio() {
  const oM = $('oModo'), oG = $('oGrado'), oT = $('oTema'), oA = $('oAyud');
  [oM, oG, oT, oA].forEach(c => { c.innerHTML = ''; });
  const re = foco => { prefs.sel = Object.assign({}, sel); guardar(); armarInicio(); if (foco) { const b = document.querySelector('#' + foco + ' [aria-pressed="true"]'); if (b) b.focus(); } };
  if (sel.modo === 'balancear' && sel.grado < 8) sel.grado = 8;
  Object.keys(AC.MODOS).forEach(m => boton(oM, AC.MODOS[m].emoji + ' ' + AC.MODOS[m].nombre + (m === 'balancear' ? ' (8.º a 11.º)' : ''), sel.modo === m, () => { sel.modo = m; sel.tema = ''; re('oModo'); }));
  GRADOS.forEach(g => { const b = boton(oG, g + '.º', sel.grado === g, () => { if (sel.modo === 'balancear' && g < 8) { anunciar('Balancear reacciones es de 8.º en adelante.'); return; } sel.grado = g; re('oGrado'); }, x => { x.className = 'grado'; }); if (sel.modo === 'balancear' && g < 8) b.setAttribute('aria-disabled', 'true'); });
  const ts = AC.temas(sel.modo, sel.grado);
  if (!ts.some(t => t.id === sel.tema)) sel.tema = ts.length ? ts[0].id : '';
  ts.forEach(t => boton(oT, t.emoji + ' ' + t.nombre, sel.tema === t.id, () => { sel.tema = t.id; re('oTema'); }));
  AYUDANTES.forEach(x => boton(oA, x.emoji + ' ' + x.nombre, sel.ayudante === x.id, () => { sel.ayudante = x.id; re('oAyud'); if (lab) lab.ayudante(x.id); }));
  $('oFrase').textContent = AC.MODOS[sel.modo].frase;
  $('lIngles').classList.toggle('oculto', sel.modo !== 'pedidos');
  $('oIngles').checked = !!prefs.ingles; $('oAyudas').checked = !!prefs.ayudas; $('oCalma').checked = S.calma; $('oVol').value = Math.round(Son.vol * 100);
  const dif = prefs.ayudas ? 'facil' : modoDeGrado(sel.grado), n = albumN();
  $('tRecord').textContent = 'Estrellas: ' + (prefs.estrellas || 0) + ' ⭐ · Álbum: ' + n.tengo + ' de ' + n.todas + '. ' + (dif === 'facil' ? 'Con ayudas: la molécula del pedido se ve en pequeño, la receta marca lo que llevas y las pistas no se acaban.'
    : dif === 'media' ? 'En este grado ves la receta de cada pedido y tienes 3 pistas.' : 'En este grado tienes 1 pista por partida: la receta sale con ella.');
}
$('oIngles').addEventListener('change', ev => { prefs.ingles = ev.target.checked; guardar(); });
$('oAyudas').addEventListener('change', ev => { prefs.ayudas = ev.target.checked; guardar(); armarInicio(); });
$('oCalma').addEventListener('change', ev => ponerCalma(ev.target.checked));
$('bJugar').addEventListener('click', empezar);

/* ---------- arrancar ---------- */
function listo() {
  $('cargando').classList.add('oculto');
  medir();
  if (lab) { lab.calma(S.calma); lab.mol.poner(Q.POR_ID.agua.g, { raiz: 0, pares: true, pose: true }); lab.mol.vida(true); }
  S.fase = 'menu';
  if (S.modo === 'leccion') {
    const partes = [];
    if (LEC.construir.length || LEC.palabras.length) partes.push('arma cada molécula que te piden: toca un átomo de la molécula y luego el que le pegas (el H tiene un brazo, el O dos, el N tres y el C cuatro)');
    if (LEC.reacciones.length) partes.push('equilibra las reacciones con más y menos hasta que haya los mismos átomos a cada lado');
    if (LEC.preguntas.length) partes.push('contesta las preguntas (1, 2, 3 o tocándolas)');
    const detalle = cap(partes.join('; ') || 'Arma y equilibra') + '. Sin reloj: si algo no sale, deshaces y pruebas otra vez.';
    const chips = LEC.construir.map(c => (c.obj.mol ? c.obj.mol.emoji + ' ' + c.obj.mol.nombre + ' ' : '') + sub(c.obj.formula))
      .concat(LEC.palabras.slice(0, 8).map(w => (w.emoji ? w.emoji + ' ' : '') + w.en))
      .concat(LEC.reacciones.map(r => sub(r.ec.replace(/->/, '→'))));
    LJ.portada({ juego: 'Átomo a Átomo', titulo: LEC.titulo || 'Arma las moléculas de la lección', detalle, chips: chips.slice(0, 12), chipsRotulo: 'Lo que vas a armar', alJugar: () => empezar() });
  } else { armarInicio(); $('inicio').classList.remove('oculto'); $('bJugar').focus({ preventScroll: true }); }
}
const fuentes = document.fonts && document.fonts.load ? Promise.all([document.fonts.load('800 32px "Baloo 2"'), document.fonts.ready]).catch(() => {}) : Promise.resolve();
Promise.race([Promise.all([Voz.listo, fuentes]), new Promise(r => setTimeout(r, 2500))]).then(listo);

/* depuración y pruebas: arma solo lo pedido (como lo haría un niño, átomo a átomo) */
function resolver() {
  const t = S.t; if (!t) return false;
  if (t.tipo === 'pregunta') { responder(t.q.correcta); return true; }
  if (t.tipo === 'balancear') { t.r.coef.forEach((c, j) => { S.coef[j] = c; }); pintarCoefs(); comprobarBalanceo(); return true; }
  if (t.tipo !== 'armar' || !t.obj.mol) return false;
  vaciarSilencio();
  const m = t.obj.mol.g, mapa = {};
  // desde el centro, por anchura: cada átomo se pega a su padre ya puesto
  const c = Q.centros(m)[0], cola = [c], visto = new Set([c]);
  S.g = { sim: [m.sim[c]], enl: [], ids: [S.sigId++] }; mapa[c] = 0;
  while (cola.length) { const a = cola.shift(); Q.vecinos(m, a).forEach(v => { if (visto.has(v.j)) return; visto.add(v.j); S.ancla = mapa[a]; ponerOrden(v.o); pegarDirecto(m.sim[v.j]); mapa[v.j] = S.g.sim.length - 1; cola.push(v.j); }); }
  ponerOrden(1);
  despues();
  return true;
}
function vaciarSilencio() { S.g = { sim: [], enl: [], ids: [] }; S.ancla = -1; S.hist = []; S.cerrada = false; }
function pegarDirecto(s) { const a = S.ancla, o = Math.min(S.orden, libresDe(a), Q.ELEM[s].val); S.g.sim.push(s); S.g.ids.push(S.sigId++); S.g.enl.push([a, S.g.sim.length - 1, o]); S.puestos++; }
window.__atomo = { lab: () => lab, estado: S, pegar, tocar: tocarAtomo, resolver, elegir: responder, coef: ponerCoef, comprobar: comprobarBalanceo, empezar, siguiente, quitar, deshacer, Q };
})();
