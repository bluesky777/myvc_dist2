/* Detective de Pistas — el juego: la sala (tema, idioma, grado y ayudante), el modo lección (../leccion.js), la libreta
   en HTML (cuadrícula de ✔ y ✘ con teclado y con el dedo, legible por el lector de pantalla), el ayudante que da pistas
   razonadas y la acusación con pruebas.
   - Los casos: casos.js (window.Casos), cada uno verificado antes de salir (una sola solución, deducible pista a pista).
   - El pueblo: pueblo.js (window.Pueblo3D); sin WebGL, un cielo pintado y se juega igual.
   - Inglés: sólo los MP3 grabados de la Biblioteca (<voz>/en/<slug>.mp3 si está en <voz>/en/index.json, o la carpeta
     de `voces`). Cada palabra de una pista en inglés suena al tocarla; en algunas pistas la palabra no se ve, sólo la
     bocina: hay que oírla (las veces que se quiera) o pulsar «Ver». Sin MP3 o con el sonido apagado, se ve escrita.
     Jamás speechSynthesis en inglés. El español del «Léeme»: el MP3 de Kokoro (voz/es-lector o voz/es) si está; si no,
     la voz española del equipo, como el lector de la Biblioteca en los cursos en español.
   - Progreso (sala): localStorage juegos3d.detective {tema, idioma, grado, ayudante, calma, mudo, resueltos, estrellas}.
     puente.js lo separa por usuario. En modo lección no se guarda nada y se avisa a la lección.
   Depuración: window.__detective (estado, resolver(), acusarBien()). */
(function () {
'use strict';
const $ = id => document.getElementById(id);
const K = window.Casos, LJ = window.LeccionJuego;
const CLAVE = 'juegos3d.detective';
const leer = () => { try { return JSON.parse(localStorage.getItem(CLAVE)) || {}; } catch (e) { return {}; } };
const prefs = leer();
if (!prefs.resueltos || typeof prefs.resueltos !== 'object') prefs.resueltos = {};
if (!prefs.estrellas || typeof prefs.estrellas !== 'object') prefs.estrellas = {};
const guardar = () => { if (LEC) return; try { localStorage.setItem(CLAVE, JSON.stringify(prefs)); } catch (e) { /* sin almacenamiento */ } };
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const BIBLIO = /^(localhost|127\.0\.0\.1)$/.test(location.hostname) ? 'http://localhost:8765/' : 'https://biblioteca.micolevirtual.com/';
const reducir = matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------- modo lección: lo que manda la lección ---------- */
const CFG = LJ && LJ.activo && LJ.cfg ? LJ.cfg : null;
const LEC = (() => {
  if (!CFG) return null;
  const txt = x => (typeof x === 'string' ? x.trim() : typeof x === 'number' ? String(x) : '');
  const preguntas = (Array.isArray(CFG.preguntas) ? CFG.preguntas : []).filter(q => q && txt(q.p) && Array.isArray(q.opciones)
    && q.opciones.length >= 2 && q.opciones.length <= 4 && Number.isInteger(q.correcta) && q.correcta >= 0 && q.correcta < q.opciones.length)
    .map(q => ({ p: txt(q.p), opciones: q.opciones.map(txt), correcta: q.correcta, oir: txt(q.oir) }));
  const vistas = new Set();
  const palabras = (Array.isArray(CFG.palabras) ? CFG.palabras : []).filter(p => p && txt(p.en) && txt(p.es))
    .map(p => ({ en: txt(p.en), es: txt(p.es), emoji: txt(p.emoji) }))
    .filter(p => { const k = p.en.toLowerCase(); if (vistas.has(k)) return false; vistas.add(k); return true; });
  const conPal = palabras.length >= 3;
  if (!conPal && !preguntas.length) { console.warn('[detective] la lección no mandó palabras ni preguntas: va la sala'); return null; }
  const idioma = CFG.idioma === 'es' || CFG.idioma === 'en' ? CFG.idioma : conPal || preguntas.some(q => q.oir) ? 'en' : 'es';
  const tema = CFG.tema === 'numeros' ? 'numeros' : 'lectura';
  const grado = CFG.grado != null ? clamp(parseInt(CFG.grado, 10) || 5, 1, 11) : null;
  const casos = clamp(parseInt(CFG.casos, 10) || (conPal ? clamp(Math.ceil(palabras.length / 4), 2, 3) : 2), 1, 4);
  return { titulo: (LJ.titulo || '').trim(), preguntas, palabras: conPal ? palabras : [], idioma, tema, grado, casos };
})();
// La dificultad (FORMATO.md §3.9.1): facil | media | normal. Nunca hay reloj. facil: ayudas sin límite, ✘ automático y
// casos más pequeños; media: 4 ayudas por caso y ✘ automático; normal: 2 ayudas (Revisar también gasta) y a la tercera
// acusación mala el caso «se enfría» (se ve la solución y se sigue). En la sala la pone el grado (3.º–5.º media).
function dificultad(grado) {
  let modo = CFG && ['facil', 'media', 'normal'].includes(CFG.dificultad) ? CFG.dificultad : null;
  if (!modo) modo = CFG ? 'normal' : grado <= 2 ? 'facil' : grado <= 5 ? 'media' : 'normal';
  return { modo, ayudas: modo === 'facil' ? Infinity : modo === 'media' ? 4 : 2, intentos: modo === 'normal' ? 3 : Infinity,
    tachar: modo !== 'normal', revisarGasta: modo === 'normal', oidas: modo === 'normal' ? 2 : 1 };
}
const NIVEL_GRADO = { 1: 1, 2: 1, 3: 1, 4: 1, 5: 2, 6: 2, 7: 3, 8: 3, 9: 4, 10: 4, 11: 5 };
const VOZ = (() => {
  const v = CFG && typeof CFG.voz === 'string' && CFG.voz.trim() ? CFG.voz.trim() : BIBLIO + 'voz/';
  return /\/$/.test(v) ? v : v + '/';
})();
const AYUDANTES = [
  { id: 'buho', nombre: 'Profe Búho', emoji: '🦉' },
  { id: 'perro', nombre: 'Sabueso', emoji: '🐶' },
  { id: 'gato', nombre: 'Michi', emoji: '🐱' }
];
const PLACAS = [[3, '🥉', 'Detective de bronce'], [8, '🥈', 'Detective de plata'], [15, '🥇', 'Detective de oro'], [30, '🏆', 'Gran detective del pueblo']];

/* ---------- sonido (sintetizado, 0 KB) ---------- */
const Snd = (() => {
  let ctx = null, mudo = !!prefs.mudo;
  const ac = () => { if (!ctx) { const A = window.AudioContext || window.webkitAudioContext; if (A) ctx = new A(); } if (ctx && ctx.state === 'suspended') ctx.resume(); return ctx; };
  function tono(f, t, dur, tipo, vol, f2) {
    const c = mudo ? null : ac(); if (!c) return;
    const o = c.createOscillator(), g = c.createGain(), t0 = c.currentTime + t;
    o.type = tipo || 'sine'; o.frequency.setValueAtTime(f, t0); if (f2) o.frequency.exponentialRampToValueAtTime(f2, t0 + dur);
    g.gain.setValueAtTime(0.0001, t0); g.gain.exponentialRampToValueAtTime(vol || 0.15, t0 + 0.02); g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    o.connect(g).connect(c.destination); o.start(t0); o.stop(t0 + dur + 0.05);
  }
  function ruido(t, dur, vol, fc, tipo) {
    const c = mudo ? null : ac(); if (!c) return;
    const b = c.createBuffer(1, Math.floor(c.sampleRate * dur), c.sampleRate), d = b.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / d.length);
    const s = c.createBufferSource(), f = c.createBiquadFilter(), g = c.createGain(); s.buffer = b; f.type = tipo || 'lowpass'; f.frequency.value = fc || 600; g.gain.value = vol || 0.12;
    s.connect(f).connect(g).connect(c.destination); s.start(c.currentTime + t);
  }
  return {
    get mudo() { return mudo; }, poner(b) { mudo = !!b; }, despertar: ac,
    lapiz() { ruido(0, 0.07, 0.09, 2600, 'bandpass'); },
    tache() { ruido(0, 0.05, 0.1, 1800, 'bandpass'); ruido(0.07, 0.05, 0.1, 1500, 'bandpass'); },
    visto() { tono(880, 0, 0.09, 'triangle', 0.1); tono(1175, 0.06, 0.12, 'triangle', 0.09); },
    pagina() { ruido(0, 0.35, 0.12, 900); },
    pista() { [660, 880, 990].forEach((f, i) => tono(f, i * 0.07, 0.2, 'sine', 0.08)); },
    bien() { [523, 659, 784].forEach((f, i) => tono(f, i * 0.09, 0.25, 'triangle', 0.16)); },
    mal() { tono(260, 0, 0.3, 'sine', 0.12, 190); },
    gran() { [523, 659, 784, 1047, 1319].forEach((f, i) => tono(f, i * 0.11, 0.42, 'triangle', 0.13)); },
    clic() { tono(880, 0, 0.05, 'square', 0.03); }
  };
})();

/* ---------- la voz ---------- */
const Voz = (() => {
  const sets = { en: null, lector: null, es: null };
  const cargar = d => fetch(VOZ + d + '/index.json', { credentials: 'omit' }).then(r => (r.ok ? r.json() : [])).then(a => new Set(Array.isArray(a) ? a : [])).catch(() => new Set());
  const listo = Promise.all([cargar('en').then(s => { sets.en = s; }), cargar('es-lector').then(s => { sets.lector = s; }), cargar('es').then(s => { sets.es = s; })]);
  const huella = s => { let h = 0x811c9dc5; for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 0x01000193) >>> 0; return s.slice(0, 80) + '-' + h.toString(16).padStart(8, '0'); };
  // nombreDelAudio de app2 (voz-grabada.ts)
  const slug = t => { const s = String(t).trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, ''); return s.length <= 200 ? s : huella(s); };
  // nombreDelAudioEs: sin tildes ni eñe
  const slugEs = t => { const s = String(t).trim().normalize('NFD').replace(/\p{M}/gu, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, ''); return s.length <= 120 ? s : huella(s); };
  const voces = CFG && CFG.voces && typeof CFG.voces === 'object' ? CFG.voces : {};
  const carpeta = s => (typeof voces[s] === 'string' && /^[a-z-]+$/.test(voces[s]) ? voces[s] : null);
  const tieneEn = t => { if (!t || !String(t).trim()) return false; const s = slug(t); return !!carpeta(s) || !!(sets.en && sets.en.has(s)); };
  const cola = LJ && LJ.cola;
  let turno = 0;
  function mp3(urls, clave, grupo) {
    if (Snd.mudo || !urls.length) return Promise.resolve(false);
    if (cola) return cola.poner({ urls, clave, grupo, caduca: 8000 });
    return new Promise(fin => { const a = new Audio(urls[0]); a.onended = () => fin(true); a.onerror = () => fin(false); a.play().catch(() => fin(false)); });
  }
  /** Una palabra o frase inglesa: su MP3 grabado o nada. */
  function en(t, grupo) {
    if (!tieneEn(t)) return Promise.resolve(false);
    const s = slug(t), dirs = [carpeta(s), sets.en && sets.en.has(s) ? 'en' : null].filter(Boolean);
    return mp3(dirs.map(d => VOZ + d + '/' + s + '.mp3'), 'en:' + s, grupo);
  }
  let vozEs = null;
  function elegirVozEs() {
    if (!('speechSynthesis' in window)) return null;
    const vs = speechSynthesis.getVoices().filter(v => /^es/i.test(v.lang));
    return vs.find(v => /es[-_](CO|MX|US|419)/i.test(v.lang)) || vs[0] || null;
  }
  if ('speechSynthesis' in window) { vozEs = elegirVozEs(); speechSynthesis.addEventListener && speechSynthesis.addEventListener('voiceschanged', () => { vozEs = elegirVozEs(); }); }
  const tieneEs = t => { const s = slugEs(t); return (sets.lector && sets.lector.has(s)) ? 'es-lector' : (sets.es && sets.es.has(s)) ? 'es' : null; };
  /** Español, oración por oración: el MP3 de Kokoro o la voz española del equipo (nunca una voz inglesa). */
  function es(texto) {
    callar();
    const mio = turno, frases = String(texto).match(/[^.!?¿¡]*[.!?]+|[^.!?]+$/g) || [texto];
    const sig = i => {
      if (mio !== turno || i >= frases.length || Snd.mudo) return;
      const f = frases[i].trim(); if (!f) { sig(i + 1); return; }
      const d = tieneEs(f);
      if (d) { mp3([VOZ + d + '/' + slugEs(f) + '.mp3'], 'es:' + slugEs(f)).then(() => sig(i + 1)); return; }
      if (!vozEs) return; // sin voz española: el texto sigue en pantalla
      const u = new SpeechSynthesisUtterance(f); u.voice = vozEs; u.lang = vozEs.lang; u.rate = 0.92;
      u.onend = u.onerror = () => sig(i + 1);
      speechSynthesis.speak(u);
    };
    sig(0);
    return true;
  }
  function callar() { turno++; if (cola) cola.callar(); if ('speechSynthesis' in window) speechSynthesis.cancel(); }
  return { listo, tieneEn, en, es, callar, hayEs: () => !!vozEs };
})();

/* ---------- el pueblo ---------- */
const S = {
  modo: LEC ? 'leccion' : 'sala',
  tema: LEC ? LEC.tema : prefs.tema === 'numeros' ? 'numeros' : 'lectura',
  idioma: LEC ? LEC.idioma : prefs.idioma === 'en' ? 'en' : 'es',
  grado: clamp(parseInt(prefs.grado, 10) || 7, 3, 11),
  ayudante: AYUDANTES.some(a => a.id === prefs.ayudante) ? prefs.ayudante : 'buho',
  calma: prefs.calma != null ? !!prefs.calma : reducir,
  dif: dificultad(7), caso: null, m: [], deshacer: [], tachadas: new Set(), oidas: new Map(), vistas: new Set(),
  foco: [], ayudasUsadas: 0, errores: 0, resuelto: false, completa: false, sinPrueba: false, numCaso: 0, jugando: false,
  // lección
  total: 0, aciertos: 0, fallos: 0, casosHechos: 0, bloques: [], cola: [], pregunta: null, respondida: false
};
let pueblo = null;
try { if (window.Pueblo3D && window.Pueblo3D.disponible) pueblo = window.Pueblo3D.crear($('gl'), { calma: S.calma }); } catch (e) { console.warn('[detective] sin 3D', e); pueblo = null; }
if (!pueblo) document.body.classList.add('sin3d');

/* ---------- dibujos ---------- */
const fotos = {};
function retrato(nombre, emoji, clase) {
  const url = BIBLIO + 'retratos/' + nombre + '-solo.webp';
  if (!(nombre in fotos)) { fotos[nombre] = null; const im = new Image(); im.onload = () => { fotos[nombre] = true; }; im.onerror = () => { fotos[nombre] = false; document.querySelectorAll('[data-foto="' + nombre + '"]').forEach(e => { e.style.backgroundImage = 'none'; e.textContent = e.dataset.emoji; }); }; im.src = url; }
  const ok = fotos[nombre] !== false;
  return '<span class="' + (clase || 'retrato') + '" data-foto="' + nombre + '" data-emoji="' + esc(emoji) + '" aria-hidden="true" style="' + (ok ? "background-image:url('" + url + "')" : '') + '">' + (ok ? '' : esc(emoji)) + '</span>';
}
const ayu = () => AYUDANTES.find(a => a.id === S.ayudante) || AYUDANTES[0];
const persona = p => S.caso.personas[p];
const nom = p => persona(p)[S.idioma === 'en' ? 'en' : 'es'];
const etiqueta = v => (S.idioma === 'en' ? v.en : v.es);
const valor = (c, v) => S.caso.cats[c].vals[v];
const conEmoji = v => (v.emoji ? v.emoji + ' ' : '') + etiqueta(v);
function anunciar(t) { const a = $('anuncio'); a.textContent = ''; setTimeout(() => { a.textContent = t; }, 30); }
function dice(t) { $('cDice').textContent = t; }

/* ---------- pintar el caso ---------- */
function trozoHTML(x, i, j) {
  if (typeof x === 'string') return esc(x);
  if (x.per != null) return '<b>' + esc(x.txt) + '</b>';
  const v = x.val, lab = etiqueta(v), em = v.emoji ? '<span aria-hidden="true">' + v.emoji + '</span>' : '';
  if (S.idioma === 'en' && Voz.tieneEn(v.en) && !Snd.mudo) {
    if (S.oidas.get(i) === j && !S.vistas.has(i)) {
      return '<button type="button" class="ficha oida" data-en="' + esc(v.en) + '" data-pista="' + i + '" aria-label="Palabra escondida: tócala para oírla"><span aria-hidden="true">🔊</span> <span class="q" aria-hidden="true">¿…?</span></button>'
        + '<button type="button" class="verpal" data-ver="' + i + '" aria-label="Ver la palabra escondida de la pista ' + (i + 1) + '">👁 Ver</button>';
    }
    return '<button type="button" class="ficha" data-en="' + esc(v.en) + '" aria-label="' + esc(lab) + ', oír"><span lang="en">' + em + ' ' + esc(lab) + '</span> <span class="bocina" aria-hidden="true">🔊</span></button>';
  }
  return '<span class="ficha"' + (S.idioma === 'en' ? ' lang="en"' : '') + '>' + em + ' ' + esc(lab) + '</span>';
}
function fraseHTML(trozos, i) { return trozos.map((x, j) => trozoHTML(x, i, j)).join(''); }
function pintarCaso() {
  const c = S.caso, h = c.historia, L = S.idioma;
  $('cEtiqueta').textContent = (S.modo === 'leccion' ? 'Caso ' + (S.numCaso) + ' de ' + LEC.casos : 'Caso n.º ' + S.numCaso) + ' · ' + c.personas.length + ' sospechosos';
  $('cTit').innerHTML = '<span aria-hidden="true">' + h.emoji + '</span> ' + esc(h.titulo[L]);
  $('cTit').lang = L; $('cEvento').lang = L; $('cClave').lang = L;
  $('cEvento').textContent = h.evento[L];
  $('cClave').innerHTML = fraseHTML(K.rastro(c), -1);
  const leerCaso = L === 'es' || Voz.tieneEn(h.evento.en);
  $('bLeerCaso').classList.toggle('oculto', !leerCaso);
  $('cSos').innerHTML = c.personas.map(p => '<li>' + retrato(p.retrato, p.marca) + '<b>' + esc(p[L === 'en' ? 'en' : 'es']) + '</b><small>' + esc(p.marca) + ' '
    + esc(p.rasgo ? p.rasgo[L] : (p.g === 'f' ? (L === 'en' ? 'a girl' : 'una niña') : (L === 'en' ? 'a boy' : 'un niño'))) + '</small></li>').join('');
  $('cPisAyuda').textContent = L === 'en' ? 'Las pistas están en inglés: toca una palabra para oírla. 🔊 ¿…? es una palabra escondida: óyela (o pulsa «Ver»). Tacha la pista cuando ya no te sirva.'
    : 'Lee cada pista y márcala en la libreta. Cuando una ya no te sirva, táchala.';
  pintarPistas(); pintarTablas();
  $('bAyuda').innerHTML = '💡 ' + esc(ayu().nombre) + ' <small>(P)</small>';
  $('cCara').outerHTML = retrato(ayu().id, ayu().emoji, 'cara').replace('<span class="cara"', '<span class="cara" id="cCara"');
  herramientas();
}
function pintarPistas() {
  const c = S.caso, L = S.idioma;
  $('cPis').innerHTML = c.pistas.map((k, i) => {
    const tr = K.frase(c, k), plano = K.plano(c, tr), tach = S.tachadas.has(i);
    const leer = L === 'es' || Voz.tieneEn(plano);
    return '<li data-i="' + i + '" class="' + (tach ? 'tachada' : '') + '"><span class="txt"' + (L === 'en' ? ' lang="en"' : '') + '>' + fraseHTML(tr, i) + '</span><span class="acc">'
      + (leer ? '<button type="button" class="mini" data-leer="' + i + '" aria-label="Léeme la pista ' + (i + 1) + '">🔊</button>' : '')
      + '<button type="button" class="mini" data-tachar="' + i + '" aria-pressed="' + tach + '" aria-label="Tachar la pista ' + (i + 1) + '">✓<small>' + (tach ? 'usada' : 'tachar') + '</small></button></span></li>';
  }).join('');
}
function pintarTablas() {
  const c = S.caso, L = S.idioma, n = c.personas.length;
  $('cTablas').innerHTML = c.cats.map((cat, ci) => {
    const cab = cat.vals.map((v, vi) => {
      const ras = c.rastro.c === ci && c.rastro.v === vi;
      const trad = S.modo === 'leccion' && S.dif.modo === 'facil' && cat.tipo === 'tarjeta' && L === 'en' ? '<span class="t">' + esc(v.es) + '</span>' : '';
      const dentro = '<span class="e" aria-hidden="true">' + (v.emoji || (cat.tipo === 'numero' ? '🔵' : '🃏')) + '</span><span class="w"' + (L === 'en' ? ' lang="en"' : '') + '>' + esc(etiqueta(v)) + '</span>' + trad;
      const suena = L === 'en' && Voz.tieneEn(v.en) && !Snd.mudo;
      return '<th scope="col">' + (suena ? '<button type="button" class="col' + (ras ? ' rastro' : '') + '" data-en="' + esc(v.en) + '" aria-label="' + esc(etiqueta(v)) + (ras ? ', la clave' : '') + ', oír">' + dentro + '</button>'
        : '<div class="col' + (ras ? ' rastro' : '') + '"' + (ras ? ' title="La clave del caso"' : '') + '>' + dentro + '</div>') + '</th>';
    }).join('');
    const filas = c.personas.map((p, pi) => '<tr><th scope="row"><span class="fila-nom">' + retrato(p.retrato, p.marca) + '<b>' + esc(p[L === 'en' ? 'en' : 'es']) + '</b></span></th>'
      + cat.vals.map((v, vi) => '<td><button type="button" class="celda" data-c="' + ci + '" data-p="' + pi + '" data-v="' + vi + '" tabindex="-1"></button></td>').join('') + '</tr>').join('');
    return '<div class="rollo"><table class="tabla" data-c="' + ci + '"><caption><span aria-hidden="true">' + cat.titulo.icono + '</span> ' + esc(cat.titulo.es) + '</caption><thead><tr><td></td>' + cab + '</tr></thead><tbody>' + filas + '</tbody></table></div>';
  }).join('');
  if (!S.foco.length) S.foco = c.cats.map(() => [0, 0]);
  void n;
  celdas();
}
const MARCA = ['', '✘', '✔'], ESTADO = ['vacía', 'no puede ser', 'sí es'];
function celdas() {
  document.querySelectorAll('.celda').forEach(b => {
    const c = +b.dataset.c, p = +b.dataset.p, v = +b.dataset.v, m = S.m[c][p][v];
    b.dataset.m = m; b.textContent = MARCA[m];
    b.setAttribute('aria-label', nom(p) + ', ' + etiqueta(valor(c, v)) + ': ' + ESTADO[m]);
    b.tabIndex = S.foco[c] && S.foco[c][0] === p && S.foco[c][1] === v ? 0 : -1;
    b.classList.toggle('fija', S.resuelto);
  });
}
function herramientas() {
  const r = S.dif.ayudas - S.ayudasUsadas;
  $('bAyuda').disabled = S.resuelto || r <= 0;
  $('bAyuda').setAttribute('aria-label', 'Pedirle una pista a ' + ayu().nombre + (isFinite(r) ? ' (te quedan ' + Math.max(0, r) + ')' : ''));
  $('bAyuda').title = isFinite(r) ? 'Te quedan ' + Math.max(0, r) + ' ayudas' : 'Ayudas sin límite';
  $('bRevisar').disabled = S.resuelto || (S.dif.revisarGasta && r <= 0);
  $('bDeshacer').disabled = S.resuelto || !S.deshacer.length;
  $('bBorrar').disabled = S.resuelto;
  $('bTachar').setAttribute('aria-pressed', String(S.dif.tachar));
  $('bTachar').title = 'Al marcar ✔, poner ✘ en el resto de su fila y su columna';
  $('bAcusar').disabled = S.resuelto;
  $('bAcusar').classList.toggle('listo', S.completa && !S.resuelto);
  hud();
}

/* ---------- marcar ---------- */
const copia = () => S.m.map(c => c.map(f => f.slice()));
function guardarPaso() { S.deshacer.push(copia()); if (S.deshacer.length > 60) S.deshacer.shift(); }
function poner(c, p, v, m) {
  S.m[c][p][v] = m;
  if (m === 2 && S.dif.tachar) {
    const n = S.caso.personas.length;
    for (let x = 0; x < n; x++) { if (x !== v && !S.m[c][p][x]) S.m[c][p][x] = 1; if (x !== p && !S.m[c][x][v]) S.m[c][x][v] = 1; }
  }
}
function tocar(c, p, v, m) {
  if (S.resuelto) return;
  guardarPaso();
  const nueva = m != null ? m : (S.m[c][p][v] + 1) % 3;
  poner(c, p, v, nueva);
  if (nueva === 1) Snd.tache(); else if (nueva === 2) Snd.visto(); else Snd.lapiz();
  document.querySelectorAll('.celda.mal').forEach(b => b.classList.remove('mal'));
  S.foco[c] = [p, v];
  celdas(); comprobar(); herramientas();
  anunciar(nom(p) + ', ' + etiqueta(valor(c, v)) + ': ' + ESTADO[nueva]);
}
const solDe = (c, p) => S.caso.sol[c][p];
function malas() {
  const out = [];
  S.caso.cats.forEach((cat, c) => S.m[c].forEach((f, p) => f.forEach((m, v) => {
    if ((m === 2 && solDe(c, p) !== v) || (m === 1 && solDe(c, p) === v)) out.push([c, p, v]);
  })));
  return out;
}
function faltan() { let n = 0; S.caso.cats.forEach((cat, c) => S.m[c].forEach((f, p) => { if (f[solDe(c, p)] !== 2) n++; })); return n; }
function comprobar() {
  const ya = !malas().length && faltan() === 0;
  if (ya && !S.completa) { S.completa = true; dice('¡Tu libreta ya lo dice todo! Mira la columna de la clave 🔑 y acusa cuando quieras.'); Snd.pista(); }
  else if (!ya) S.completa = false;
}
function enfocarCelda(c, p, v) { const b = document.querySelector('.celda[data-c="' + c + '"][data-p="' + p + '"][data-v="' + v + '"]'); if (b) { S.foco[c] = [p, v]; celdas(); b.focus(); } return b; }
function brillar(c, p, v) {
  const b = document.querySelector('.celda[data-c="' + c + '"][data-p="' + p + '"][data-v="' + v + '"]');
  if (!b) return; b.classList.add('brilla'); setTimeout(() => b.classList.remove('brilla'), 2000);
  b.scrollIntoView({ block: 'nearest', behavior: S.calma ? 'auto' : 'smooth' });
}
function resaltarPista(i) {
  const li = document.querySelector('#cPis li[data-i="' + i + '"]'); if (!li) return;
  li.classList.add('foco'); setTimeout(() => li.classList.remove('foco'), 3500);
}

/* ---------- el ayudante: una pista razonada ---------- */
function ayuda() {
  if (S.resuelto) return;
  const quedan = S.dif.ayudas - S.ayudasUsadas;
  if (quedan <= 0) { dice('Ya usaste las ayudas de este caso. ¡Tú puedes: relee las pistas una por una!'); return; }
  const c = S.caso, a = ayu().nombre, ms = malas();
  if (ms.length) {
    const [mc, mp, mv] = ms[0];
    S.ayudasUsadas++;
    document.querySelectorAll('.celda.mal').forEach(b => b.classList.remove('mal'));
    const b = enfocarCelda(mc, mp, mv); if (b) b.classList.add('mal');
    brillar(mc, mp, mv); Snd.pista();
    dice(a + ': mira la casilla de ' + nom(mp) + ' y ' + etiqueta(valor(mc, mv)) + ' (⚠). Esa marca no cuadra con las pistas.');
    herramientas(); return;
  }
  const e = c.eventos.find(x => S.m[x.c][x.p][x.v] !== (x.marca === 'si' ? 2 : 1) && !(x.marca === 'no' && S.m[x.c][x.p][x.v] === 1));
  if (!e) { dice(a + ': tu libreta ya está completa. ¡Acusa!'); return; }
  S.ayudasUsadas++;
  guardarPaso();
  poner(e.c, e.p, e.v, e.marca === 'si' ? 2 : 1);
  celdas(); comprobar(); enfocarCelda(e.c, e.p, e.v); brillar(e.c, e.p, e.v); Snd.pista();
  const casilla = nom(e.p) + ' · ' + etiqueta(valor(e.c, e.v)), signo = e.marca === 'si' ? '✔' : '✘';
  let t;
  if (e.por >= 0) {
    resaltarPista(e.por);
    t = a + ': lee la pista ' + (e.por + 1) + '. Con ella sabemos que ' + (e.marca === 'si' ? 'sí' : 'no') + ' puede ser: ' + signo + ' en ' + casilla + '.';
  } else if (e.marca === 'si') t = a + ': a ' + nom(e.p) + ' sólo le queda una posibilidad en «' + c.cats[e.c].titulo.es + '»: ' + signo + ' en ' + casilla + '.';
  else t = a + ': cada uno tiene una sola y cada una es de uno solo. Mira la fila y la columna: ' + signo + ' en ' + casilla + '.';
  dice(t);
  herramientas();
}
function revisar() {
  if (S.resuelto) return;
  if (S.dif.revisarGasta) { if (S.dif.ayudas - S.ayudasUsadas <= 0) return; S.ayudasUsadas++; }
  const ms = malas();
  document.querySelectorAll('.celda.mal').forEach(b => b.classList.remove('mal'));
  ms.forEach(([c, p, v]) => { const b = document.querySelector('.celda[data-c="' + c + '"][data-p="' + p + '"][data-v="' + v + '"]'); if (b) b.classList.add('mal'); });
  if (ms.length) { Snd.mal(); dice(ms.length === 1 ? 'Una marca no cuadra: está señalada con ⚠.' : ms.length + ' marcas no cuadran: están señaladas con ⚠.'); }
  else { Snd.bien(); const f = faltan(); dice(f ? 'Todo lo que marcaste cuadra. Te faltan ' + f + (f === 1 ? ' casilla ✔.' : ' casillas ✔.') : '¡Todo cuadra y está completo!'); }
  herramientas();
}

/* ---------- acusar ---------- */
const sel = { quien: -1, otros: {} };
function abrirAcusar() {
  if (S.resuelto) return;
  const c = S.caso, r = c.rastro;
  sel.quien = c.personas.findIndex((p, i) => S.m[r.c][i][r.v] === 2);
  prellenar();
  S.sinPrueba = false;
  $('aClave').innerHTML = fraseHTML(K.rastro(c), -1);
  $('aClave').lang = S.idioma;
  $('aAviso').textContent = isFinite(S.dif.intentos) ? 'Te quedan ' + (S.dif.intentos - S.errores) + ' acusaciones.' : '';
  pintarAcusar();
  $('dAcusar').classList.remove('oculto');
  setTimeout(() => { const b = $('aQuien').querySelector('[aria-pressed="true"]') || $('aQuien').querySelector('button'); if (b) b.focus(); }, 0);
}
function prellenar() {
  const c = S.caso;
  sel.otros = {};
  c.cats.forEach((cat, ci) => { if (ci === c.rastro.c || sel.quien < 0) return; const v = S.m[ci][sel.quien].indexOf(2); if (v >= 0) sel.otros[ci] = v; });
}
function pintarAcusar() {
  const c = S.caso;
  $('aQuien').innerHTML = c.personas.map((p, i) => '<button type="button" data-quien="' + i + '" aria-pressed="' + (sel.quien === i) + '">' + retrato(p.retrato, p.marca) + '<span>' + esc(nom(i)) + '</span></button>').join('');
  $('aOtros').innerHTML = c.cats.map((cat, ci) => {
    if (ci === c.rastro.c) return '';
    return '<div class="paso" id="aL' + ci + '">' + cat.titulo.icono + ' ' + esc(cat.titulo.es) + '</div><div class="fila-b" role="group" aria-labelledby="aL' + ci + '">'
      + cat.vals.map((v, vi) => '<button type="button" data-cat="' + ci + '" data-val="' + vi + '" aria-pressed="' + (sel.otros[ci] === vi) + '"' + (S.idioma === 'en' ? ' lang="en"' : '') + '>' + esc(conEmoji(v)) + '</button>').join('') + '</div>';
  }).join('');
}
function confirmar() {
  const c = S.caso, r = c.rastro;
  if (sel.quien < 0) { $('aAviso').textContent = 'Elige primero a quién acusas.'; return; }
  const faltaOtro = c.cats.some((cat, ci) => ci !== r.c && sel.otros[ci] == null);
  if (faltaOtro) { $('aAviso').textContent = 'Completa también lo demás de su fila: así se prueba.'; return; }
  if (S.m[r.c][sel.quien][r.v] !== 2 && !S.sinPrueba) {
    S.sinPrueba = true;
    $('aAviso').textContent = 'Un buen detective no acusa sin pruebas: en tu libreta, ' + nom(sel.quien) + ' no tiene ✔ en ' + etiqueta(valor(r.c, r.v)) + '. Si estás seguro, pulsa «Acusar» otra vez.';
    return;
  }
  const bien = sel.quien === c.culpable && c.cats.every((cat, ci) => ci === r.c || sel.otros[ci] === c.sol[ci][c.culpable]);
  if (bien) { $('dAcusar').classList.add('oculto'); resolver(true); return; }
  S.errores++; S.fallos++; S.sinPrueba = false;
  Snd.mal();
  avisarLeccion(false);
  let t;
  if (sel.quien === c.culpable) {
    const mal = c.cats.findIndex((cat, ci) => ci !== r.c && sel.otros[ci] !== c.sol[ci][c.culpable]);
    t = '¡Vas bien con ' + nom(sel.quien) + '! Pero «' + c.cats[mal].titulo.es + '» no cuadra con las pistas. Revisa esa parte de su fila.';
  } else t = 'No cuadra con las pistas: no pudo ser ' + nom(sel.quien) + '. Vuelve a la libreta y revisa su fila.';
  if (isFinite(S.dif.intentos)) {
    const q = S.dif.intentos - S.errores;
    if (q <= 0) { $('dAcusar').classList.add('oculto'); resolver(false); return; }
    t += ' Te quedan ' + q + (q === 1 ? ' acusación.' : ' acusaciones.');
  } else if (S.dif.modo === 'facil') t += ' Si quieres, pídele una pista a ' + ayu().nombre + '.';
  $('aAviso').textContent = t;
}

/* ---------- el final del caso: cómo pasó ---------- */
function resolver(ok) {
  const c = S.caso;
  S.resuelto = true;
  document.querySelectorAll('.celda.mal').forEach(b => b.classList.remove('mal'));
  const estrellas = ok ? clamp(3 - S.errores - (S.ayudasUsadas >= 2 ? 1 : 0), 1, 3) : 0;
  // la libreta queda con la solución
  c.cats.forEach((cat, ci) => c.personas.forEach((p, pi) => cat.vals.forEach((v, vi) => { S.m[ci][pi][vi] = c.sol[ci][pi] === vi ? 2 : 1; })));
  celdas(); herramientas();
  const cul = c.personas[c.culpable];
  $('fFoto').outerHTML = retrato(cul.retrato, cul.marca, 'foto').replace('<span class="foto"', '<div class="foto" id="fFoto"').replace(/<\/span>$/, '</div>');
  $('fTit').textContent = ok ? '¡Caso resuelto!' : 'El caso se enfrió';
  $('fEstrellas').innerHTML = ok ? '<span aria-hidden="true">' + '⭐'.repeat(estrellas) + '<span style="opacity:.3">' + '⭐'.repeat(3 - estrellas) + '</span></span><span class="sr">' + estrellas + ' de 3 estrellas</span>' : '';
  const perfil = c.cats.map((cat, ci) => conEmoji(valor(ci, c.sol[ci][c.culpable]))).join(', ');
  $('fComo').lang = S.idioma;
  $('fComo').textContent = (S.idioma === 'en' ? 'It was ' + cul.en + ' (' + perfil + '). ' : 'Fue ' + cul.es + ' (' + perfil + '). ') + c.historia.fin[S.idioma].replace('{N}', cul[S.idioma === 'en' ? 'en' : 'es']);
  $('fMoraleja').textContent = ok ? (S.errores ? 'Lo lograste revisando: así trabaja un detective.' : 'Sin acusar a nadie sin pruebas. Y nadie lo hizo por maldad: por eso se pregunta antes de juzgar.')
    : 'Tres acusaciones no cuadraron. Mira la libreta resuelta para ver cómo encaja cada pista.';
  $('fPlaca').classList.add('oculto');
  if (S.modo === 'sala' && ok) {
    const clave = S.tema + '-' + S.idioma + '-' + S.grado, antes = totalResueltos();
    prefs.resueltos[clave] = (prefs.resueltos[clave] || 0) + 1;
    prefs.estrellas[clave] = (prefs.estrellas[clave] || 0) + estrellas;
    guardar();
    const nueva = PLACAS.find(([n]) => antes < n && totalResueltos() >= n);
    if (nueva) { $('fPlaca').textContent = nueva[1] + ' ¡Nueva placa: ' + nueva[2] + '!'; $('fPlaca').classList.remove('oculto'); }
  }
  if (S.modo === 'leccion') { S.casosHechos++; if (ok && !S.errores) S.aciertos++; avisarLeccion(false); }
  const ultimo = S.modo === 'leccion' && S.casosHechos >= LEC.casos && !(S.bloques[S.casosHechos - 1] || []).length;
  $('bSiguiente').innerHTML = S.modo === 'leccion' ? ((S.bloques[S.casosHechos - 1] || []).length ? '👮 Al comisario ▶' : ultimo ? '🏁 Terminar' : '▶ Siguiente caso') : '▶ Siguiente caso';
  if (ok) { Snd.gran(); if (pueblo) pueblo.celebrar(); confeti(); } else Snd.mal();
  hud();
  setTimeout(() => { $('dFin').classList.remove('oculto'); $('bSiguiente').focus(); anunciar($('fTit').textContent + '. ' + $('fComo').textContent); }, ok && !S.calma ? 500 : 0);
}
function totalResueltos() { return Object.values(prefs.resueltos).reduce((a, b) => a + (+b || 0), 0); }
function confeti() {
  if (S.calma || reducir) return;
  const cs = ['⭐', '🎉', '🌟'];
  for (let i = 0; i < 16; i++) {
    const s = document.createElement('span'); s.className = 'confeti'; s.textContent = cs[i % cs.length]; s.setAttribute('aria-hidden', 'true');
    s.style.left = Math.random() * 100 + 'vw'; s.style.animationDelay = (Math.random() * 0.8) + 's';
    document.body.appendChild(s); setTimeout(() => s.remove(), 3600);
  }
}
$('bSiguiente').onclick = () => {
  $('dFin').classList.add('oculto');
  if (S.modo === 'leccion') {
    const b = S.bloques[S.casosHechos - 1] || [];
    if (b.length) { S.cola = b.slice(); S.bloques[S.casosHechos - 1] = []; siguientePregunta(); return; }
    if (S.casosHechos >= LEC.casos) { terminarLeccion(); return; }
  }
  nuevoCaso();
};
$('bVerLib').onclick = () => {
  $('dFin').classList.add('oculto');
  $('bAcusar').innerHTML = S.modo === 'leccion' && S.casosHechos >= LEC.casos && !(S.bloques[S.casosHechos - 1] || []).length ? '🏁 Terminar' : '▶ Siguiente caso';
  $('bAcusar').disabled = false; $('bAcusar').dataset.sigue = '1';
  $('cTablas').scrollIntoView({ block: 'start', behavior: S.calma ? 'auto' : 'smooth' });
};

/* ---------- las preguntas de la lección (el comisario) ---------- */
function siguientePregunta() {
  const q = S.cola.shift();
  if (!q) {
    $('dPreg').classList.add('oculto');
    if (S.casosHechos >= LEC.casos) terminarLeccion(); else nuevoCaso();
    return;
  }
  S.pregunta = q; S.respondida = false;
  const resto = S.cola.length;
  $('qCuenta').textContent = resto ? '(quedan ' + resto + ' más)' : '';
  $('qTit').textContent = q.p.item.p;
  $('qFeed').textContent = '';
  $('bOirPreg').classList.toggle('oculto', !q.p.item.oir || !Voz.tieneEn(q.p.item.oir));
  $('bSeguirPreg').classList.add('oculto');
  $('qOps').innerHTML = q.p.item.opciones.map((o, i) => '<button type="button" data-op="' + i + '"><span class="n" aria-hidden="true">' + (i + 1) + '</span><span>' + esc(o) + '</span></button>').join('');
  $('dPreg').classList.remove('oculto');
  setTimeout(() => $('qTit').focus(), 0);
  if (q.p.item.oir) Voz.en(q.p.item.oir, 'preg');
}
function responder(i) {
  const q = S.pregunta; if (!q || S.respondida) return;
  const it = q.p.item, bs = [...$('qOps').children];
  if (i < 0 || i >= bs.length) return;
  S.respondida = true;
  bs.forEach(b => { b.disabled = true; });
  if (i === it.correcta) {
    bs[i].classList.add('bien'); Snd.bien();
    if (q.primera) S.aciertos++;
    $('qFeed').textContent = '✔ ¡Bien! ' + (q.primera ? '' : '(de repaso)');
    if (S.idioma === 'en') Voz.en('great job', 'feed');
  } else {
    bs[i].classList.add('mal'); bs[it.correcta].classList.add('bien'); Snd.mal(); S.fallos++;
    $('qFeed').textContent = '✘ Era: ' + it.opciones[it.correcta] + '. Te la vuelvo a preguntar al final.';
    if (q.primera) S.cola.push({ p: q.p, primera: false });
  }
  avisarLeccion(false);
  $('bSeguirPreg').classList.remove('oculto'); $('bSeguirPreg').focus();
}
$('qOps').addEventListener('click', ev => { const b = ev.target.closest('[data-op]'); if (b) responder(+b.dataset.op); });
$('bSeguirPreg').onclick = siguientePregunta;
$('bOirPreg').onclick = () => { if (S.pregunta && S.pregunta.p.item.oir) Voz.en(S.pregunta.p.item.oir, 'preg'); };

/* ---------- empezar, casos, lección ---------- */
function nivelActual() {
  if (S.modo === 'leccion') {
    if (LEC.grado) return NIVEL_GRADO[LEC.grado];
    return S.dif.modo === 'facil' ? 1 : S.dif.modo === 'media' ? 2 : 3;
  }
  const base = NIVEL_GRADO[S.grado], hechos = prefs.resueltos[S.tema + '-' + S.idioma + '-' + S.grado] || 0;
  return clamp(base + (hechos >= 4 ? 1 : 0), 1, 5);
}
function nuevoCaso() {
  S.numCaso++;
  const op = { nivel: nivelActual(), idioma: S.idioma, tema: S.tema, historia: S.historias[(S.numCaso - 1) % S.historias.length] };
  if (S.modo === 'leccion' && LEC.palabras.length) {
    // las palabras de la lección son las tarjetas; cada caso empieza más allá, para pasar por todas
    const P = LEC.palabras, n = clamp(S.dif.modo === 'facil' ? 3 : S.dif.modo === 'media' ? 4 : 5, 3, P.length), ini = ((S.numCaso - 1) * n) % P.length;
    op.palabras = P.slice(ini).concat(P.slice(0, ini)); op.palabrasFijas = true; op.n = n; op.cats = 1;
    op.nivel = S.dif.modo === 'facil' ? 1 : S.dif.modo === 'media' ? 2 : n >= 5 ? 5 : 4;
  }
  const caso = K.generar(op) || K.generar(Object.assign({}, op, { nivel: 1, palabras: null }));
  S.caso = caso;
  const n = caso.personas.length;
  S.m = caso.cats.map(() => Array.from({ length: n }, () => Array(n).fill(0)));
  S.deshacer = []; S.tachadas = new Set(); S.vistas = new Set(); S.oidas = new Map(); S.foco = [];
  S.ayudasUsadas = 0; S.errores = 0; S.resuelto = false; S.completa = false;
  delete $('bAcusar').dataset.sigue; $('bAcusar').innerHTML = '⚖️ Acusar <small>(A)</small>';
  // pistas «de oído»: la palabra no se ve, sólo la bocina (en inglés y con su MP3)
  if (S.idioma === 'en') {
    const cand = caso.pistas.map((k, i) => ({ i, j: K.frase(caso, k).findIndex(x => x && x.val && Voz.tieneEn(x.val.en)) })).filter(o => o.j >= 0);
    K.barajar(cand, Math.random).slice(0, S.dif.oidas).forEach(o => S.oidas.set(o.i, o.j));
  }
  pintarCaso();
  dice(ayu().nombre + ': ' + (S.numCaso === 1 ? 'empieza por la pista que diga algo seguro y márcala. Cada ✘ te acerca.' : 'otro caso. Lee la clave 🔑: es la columna que más importa.'));
  if (pueblo) pueblo.ir(caso.historia.sitio);
  Snd.pagina();
  $('mesa').scrollTop = 0;
  setTimeout(() => $('cTit').focus({ preventScroll: true }), 30);
  avisarLeccion(false);
}
function empezar() {
  S.dif = dificultad(S.grado);
  if (S.modo === 'sala' && prefs.tachar != null) S.dif.tachar = !!prefs.tachar;
  S.numCaso = S.modo === 'sala' ? (prefs.resueltos[S.tema + '-' + S.idioma + '-' + S.grado] || 0) : 0;
  S.historias = K.barajar([...Array(K.HISTORIAS.length).keys()], Math.random);
  S.aciertos = 0; S.fallos = 0; S.casosHechos = 0;
  if (S.modo === 'leccion') {
    // las preguntas, repartidas después de cada caso
    const qs = LEC.preguntas, N = LEC.casos;
    S.bloques = Array.from({ length: N }, (x, i) => qs.slice(Math.round(i * qs.length / N), Math.round((i + 1) * qs.length / N)).map(item => ({ p: { item }, primera: true })));
    S.total = N + qs.length;
  }
  document.body.classList.toggle('calmo', S.calma);
  if (pueblo) pueblo.calma(S.calma);
  ['inicio', 'pausa', 'dFin', 'dAcusar', 'dPreg'].forEach(id => $(id).classList.add('oculto'));
  $('hud').classList.remove('oculto'); $('mesa').classList.remove('oculto');
  ajustarBanda();
  S.jugando = true;
  nuevoCaso();
}
// A la lección (FORMATO.md §3.9.1): progreso con cada paso y resultado al terminar.
// aciertos = casos resueltos a la primera acusación + preguntas acertadas a la primera; total = casos + preguntas.
function avisarLeccion(terminado) {
  if (S.modo !== 'leccion' || !LJ) return;
  const r = { aciertos: S.aciertos, total: S.total, fallos: S.fallos, nivel: 'caso ' + Math.min(S.numCaso, LEC.casos) + ' de ' + LEC.casos };
  try { if (terminado) LJ.resultado(r); else LJ.progreso(r); } catch (e) { /* sin padre: nada */ }
}
function terminarLeccion() {
  S.jugando = false;
  avisarLeccion(true);
  const chips = LEC.palabras.length ? LEC.palabras.slice(0, 10).map(p => (p.emoji ? p.emoji + ' ' : '') + p.en + ' = ' + p.es) : [];
  LJ.logrado({ detalle: 'Resolviste ' + LEC.casos + (LEC.casos === 1 ? ' caso' : ' casos') + '. A la primera: ' + S.aciertos + ' de ' + S.total + '.', chips,
    alOtraVez: () => { Snd.despertar(); empezar(); } });
}

/* ---------- HUD, menús y teclado ---------- */
function hud() {
  $('hCaso').textContent = S.caso ? 'Caso ' + (S.modo === 'leccion' ? S.numCaso + ' de ' + LEC.casos : S.numCaso) : 'Detective';
  const quedan = S.dif.ayudas - S.ayudasUsadas;
  $('hSub').textContent = S.modo === 'leccion' ? (LEC.titulo || 'La lección') + (isFinite(quedan) ? ' · 💡 ' + Math.max(0, quedan) : '')
    : (S.tema === 'numeros' ? 'Números' : 'Lugares y cosas') + ' · ' + S.grado + '.º · ' + (S.idioma === 'en' ? 'English' : 'Español') + (isFinite(quedan) ? ' · 💡 ' + Math.max(0, quedan) : '');
  $('bSonido').setAttribute('aria-pressed', String(Snd.mudo)); $('iSonido').textContent = Snd.mudo ? '🔇' : '🔊'; $('tSonido').textContent = Snd.mudo ? 'Activar el sonido' : 'Silenciar';
  $('bCalma').setAttribute('aria-pressed', String(S.calma));
}
function armarInicio() {
  const g = $('oGrado'); g.innerHTML = '';
  for (let i = 3; i <= 11; i++) {
    const b = document.createElement('button'); b.type = 'button'; b.textContent = i + '.º'; b.setAttribute('aria-label', 'Grado ' + i);
    b.setAttribute('aria-pressed', String(i === S.grado)); b.onclick = () => { S.grado = i; armarInicio(); Snd.clic(); }; g.appendChild(b);
  }
  [...$('oTema').children].forEach(b => { b.setAttribute('aria-pressed', String(b.dataset.tema === S.tema)); b.onclick = () => { S.tema = b.dataset.tema; armarInicio(); Snd.clic(); }; });
  [...$('oIdioma').children].forEach(b => { b.setAttribute('aria-pressed', String(b.dataset.idioma === S.idioma)); b.onclick = () => { S.idioma = b.dataset.idioma; armarInicio(); Snd.clic(); }; });
  $('oAyu').innerHTML = AYUDANTES.map(a => '<button type="button" data-ayu="' + a.id + '" aria-pressed="' + (a.id === S.ayudante) + '">' + retrato(a.id, a.emoji) + '<span>' + esc(a.nombre) + '</span></button>').join('');
  $('oCalma').checked = S.calma;
  const hechos = prefs.resueltos[S.tema + '-' + S.idioma + '-' + S.grado] || 0, tot = totalResueltos();
  const placa = PLACAS.filter(([n]) => tot >= n).pop(), sig = PLACAS.find(([n]) => tot < n);
  $('tRecord').textContent = (hechos ? '🗂️ Casos resueltos en ' + S.grado + '.º: ' + hechos + '. ' : 'Todavía no hay casos resueltos en ' + S.grado + '.º. ')
    + (placa ? placa[1] + ' ' + placa[2] + '. ' : '') + (sig ? 'Siguiente placa a los ' + sig[0] + ' casos.' : '');
  $('bEmpezar').textContent = hechos ? '▶ Abrir el caso n.º ' + (hechos + 1) : '▶ Abrir el primer caso';
}
$('oAyu').addEventListener('click', ev => { const b = ev.target.closest('[data-ayu]'); if (b) { S.ayudante = b.dataset.ayu; armarInicio(); Snd.clic(); } });
$('oCalma').onchange = () => { S.calma = $('oCalma').checked; if (pueblo) pueblo.calma(S.calma); };
$('bEmpezar').onclick = () => {
  Snd.despertar();
  prefs.tema = S.tema; prefs.idioma = S.idioma; prefs.grado = S.grado; prefs.ayudante = S.ayudante; prefs.calma = S.calma; guardar();
  empezar();
};
function pausar() {
  if (!S.jugando) return;
  $('pRes').textContent = S.caso ? 'Vas en el caso ' + S.numCaso + '. Te faltan ' + faltan() + ' casillas ✔.' : '';
  $('bInicio').classList.toggle('oculto', S.modo === 'leccion');
  $('bOtroCaso').classList.toggle('oculto', S.modo === 'leccion');
  $('pausa').classList.remove('oculto'); $('bSeguir').focus();
}
$('bSeguir').onclick = () => { $('pausa').classList.add('oculto'); $('cTit').focus({ preventScroll: true }); };
$('bOtroCaso').onclick = () => { $('pausa').classList.add('oculto'); S.numCaso--; nuevoCaso(); };
$('bInicio').onclick = () => { S.jugando = false; Voz.callar(); ['pausa', 'mesa', 'hud'].forEach(id => $(id).classList.add('oculto')); if (pueblo) { pueblo.banda(0); pueblo.ir('plaza'); } armarInicio(); $('inicio').classList.remove('oculto'); $('bEmpezar').focus(); };
$('bMenu').onclick = pausar;
$('bSonido').onclick = () => { Snd.poner(!Snd.mudo); if (Snd.mudo) Voz.callar(); prefs.mudo = Snd.mudo; guardar(); hud(); if (S.caso) { pintarPistas(); pintarTablas(); } };
$('bCalma').onclick = () => {
  S.calma = !S.calma; prefs.calma = S.calma; guardar(); if (pueblo) pueblo.calma(S.calma); document.body.classList.toggle('calmo', S.calma);
  hud(); anunciar(S.calma ? 'Modo calma: el pueblo quieto.' : 'Modo calma apagado.');
};
$('bAyuda').onclick = ayuda;
$('bRevisar').onclick = revisar;
$('bDeshacer').onclick = () => { if (!S.deshacer.length || S.resuelto) return; S.m = S.deshacer.pop(); Snd.lapiz(); celdas(); comprobar(); herramientas(); anunciar('Deshecho.'); };
$('bBorrar').onclick = () => { if (S.resuelto) return; guardarPaso(); S.m = S.m.map(c => c.map(f => f.map(() => 0))); Snd.pagina(); celdas(); comprobar(); herramientas(); dice('Libreta en blanco. Puedes deshacerlo con ↶.'); };
$('bTachar').onclick = () => { S.dif.tachar = !S.dif.tachar; if (S.modo === 'sala') { prefs.tachar = S.dif.tachar; guardar(); } herramientas(); anunciar(S.dif.tachar ? '✘ automático encendido: al marcar ✔ se tacha el resto de su fila y su columna.' : '✘ automático apagado.'); };
$('bAcusar').onclick = () => { if ($('bAcusar').dataset.sigue) { delete $('bAcusar').dataset.sigue; $('bSiguiente').click(); return; } abrirAcusar(); };
$('bConfirmar').onclick = confirmar;
$('bVolverLib').onclick = () => { $('dAcusar').classList.add('oculto'); $('bAcusar').focus(); };
$('aQuien').addEventListener('click', ev => { const b = ev.target.closest('[data-quien]'); if (!b) return; sel.quien = +b.dataset.quien; S.sinPrueba = false; prellenar(); pintarAcusar(); Snd.clic(); $('aQuien').querySelector('[data-quien="' + sel.quien + '"]').focus(); });
$('aOtros').addEventListener('click', ev => { const b = ev.target.closest('[data-cat]'); if (!b) return; sel.otros[+b.dataset.cat] = +b.dataset.val; pintarAcusar(); Snd.clic(); $('aOtros').querySelector('[data-cat="' + b.dataset.cat + '"][data-val="' + b.dataset.val + '"]').focus(); });
$('bLeerCaso').onclick = () => {
  const h = S.caso.historia, L = S.idioma;
  if (L === 'es') Voz.es(h.titulo.es + '. ' + h.evento.es + ' ' + K.plano(S.caso, K.rastro(S.caso)));
  else Voz.en(h.evento.en, 'leer');
};
// las pistas: tachar, léeme y las palabras que suenan
$('libreta').addEventListener('click', ev => {
  const t = ev.target.closest('button'); if (!t) return;
  if (t.dataset.tachar != null) {
    const i = +t.dataset.tachar; if (S.tachadas.has(i)) S.tachadas.delete(i); else S.tachadas.add(i);
    Snd.lapiz(); pintarPistas(); const b = document.querySelector('[data-tachar="' + i + '"]'); if (b) b.focus(); return;
  }
  if (t.dataset.leer != null) {
    const k = S.caso.pistas[+t.dataset.leer], pl = K.plano(S.caso, K.frase(S.caso, k));
    if (S.idioma === 'es') Voz.es(pl); else Voz.en(pl, 'leer');
    return;
  }
  if (t.dataset.ver != null) { const i = +t.dataset.ver; S.vistas.add(i); pintarPistas(); const b = document.querySelector('#cPis li[data-i="' + i + '"] .ficha'); if (b) b.focus(); return; }
  if (t.dataset.en) {
    t.classList.add('suena');
    Voz.en(t.dataset.en, 'pal').then(() => t.classList.remove('suena'));
    return;
  }
  if (t.classList.contains('celda')) tocar(+t.dataset.c, +t.dataset.p, +t.dataset.v);
});
// la cuadrícula con el teclado: flechas, espacio, X, V y borrar
$('cTablas').addEventListener('keydown', ev => {
  const b = ev.target.closest('.celda'); if (!b) return;
  const c = +b.dataset.c, p = +b.dataset.p, v = +b.dataset.v, n = S.caso.personas.length, k = ev.key;
  const mover = (dp, dv) => { ev.preventDefault(); enfocarCelda(c, clamp(p + dp, 0, n - 1), clamp(v + dv, 0, n - 1)); };
  if (k === 'ArrowUp') return mover(-1, 0);
  if (k === 'ArrowDown') return mover(1, 0);
  if (k === 'ArrowLeft') return mover(0, -1);
  if (k === 'ArrowRight') return mover(0, 1);
  if (k === 'Home') return mover(0, -n);
  if (k === 'End') return mover(0, n);
  if (k === ' ' || k === 'Enter') { ev.preventDefault(); tocar(c, p, v); b.focus(); ev.stopPropagation(); return; }
  if (k === 'x' || k === 'X') { ev.preventDefault(); tocar(c, p, v, 1); b.focus(); ev.stopPropagation(); return; }
  if (k === 'v' || k === 'V') { ev.preventDefault(); tocar(c, p, v, 2); b.focus(); ev.stopPropagation(); return; }
  if (k === 'Delete' || k === 'Backspace') { ev.preventDefault(); tocar(c, p, v, 0); b.focus(); ev.stopPropagation(); }
});
const visible = id => !$(id).classList.contains('oculto');
document.addEventListener('keydown', ev => {
  if (ev.ctrlKey || ev.metaKey || ev.altKey) return;
  if (document.querySelector('.lj-capa')) return;
  const k = ev.key.toLowerCase();
  if (visible('pausa')) { if (k === 'escape') { ev.preventDefault(); $('bSeguir').click(); } return; }
  if (visible('dPreg')) {
    if (/^[1-4]$/.test(k)) { ev.preventDefault(); responder(+k - 1); }
    else if (k === 'o') $('bOirPreg').click();
    return;
  }
  if (visible('dAcusar')) { if (k === 'escape') { ev.preventDefault(); $('bVolverLib').click(); } return; }
  if (visible('dFin') || visible('inicio') || !S.jugando) return;
  if (k === 'escape') { ev.preventDefault(); pausar(); return; }
  if (k === 'p') { ayuda(); return; }
  if (k === 'r') { revisar(); return; }
  if (k === 'z') { $('bDeshacer').click(); return; }
  if (k === 'a') { $('bAcusar').click(); return; }
  if (k === 's') { $('bSonido').click(); return; }
  if (k === 'c') { $('bCalma').click(); }
});
// el pueblo duerme cuando la libreta lo tapa entero
// el sitio del caso se ve en la banda de arriba, la que deja la libreta
function ajustarBanda() { if (pueblo) pueblo.banda($('mesa').classList.contains('oculto') ? 0 : $('mesa').querySelector('.ventana').offsetHeight + 30); }
addEventListener('resize', ajustarBanda);
// y el marcador se esconde al bajar, para no tapar la libreta (los botones de la derecha siguen)
$('mesa').addEventListener('scroll', () => {
  const y = $('mesa').scrollTop, alto = $('mesa').querySelector('.ventana').offsetHeight;
  $('hud').classList.toggle('bajo', y > alto - 50);
  if (pueblo) pueblo.dormir(y > alto + 40 && innerWidth < 1220);
}, { passive: true });
document.addEventListener('visibilitychange', () => { if (document.hidden) Voz.callar(); });

/* ---------- arrancar ---------- */
function listo() {
  $('cargando').classList.add('oculto');
  hud();
  if (S.modo === 'leccion') {
    const chips = LEC.palabras.length ? LEC.palabras.slice(0, 12).map(p => (p.emoji ? p.emoji + ' ' : '') + (LEC.idioma === 'en' ? p.en : p.es)) : [];
    LJ.portada({ juego: 'Detective de Pistas', titulo: LEC.titulo || 'El caso de la lección',
      detalle: 'Lee las pistas' + (LEC.idioma === 'en' ? ' en inglés' : '') + ', marca ✔ y ✘ en tu libreta y descubre quién fue. ' + LEC.casos + (LEC.casos === 1 ? ' caso' : ' casos')
        + (LEC.preguntas.length ? ' y las preguntas del comisario' : '') + '. Sin reloj.',
      chips, chipsRotulo: 'Las palabras de la lección',
      alJugar: () => { Snd.despertar(); empezar(); } });
  } else { armarInicio(); $('inicio').classList.remove('oculto'); $('bEmpezar').focus(); }
}
// la lista de MP3 llega antes de empezar (si tarda más de 2,5 s, se empieza sin ella)
Promise.race([Voz.listo, new Promise(r => setTimeout(r, 2500))]).then(listo);

window.__detective = {
  estado: S,
  acusarBien() { const c = S.caso; sel.quien = c.culpable; sel.otros = {}; c.cats.forEach((cat, ci) => { if (ci !== c.rastro.c) sel.otros[ci] = c.sol[ci][c.culpable]; }); S.sinPrueba = true; confirmar(); },
  llenar() { const c = S.caso; c.cats.forEach((cat, ci) => c.personas.forEach((p, pi) => { S.m[ci][pi][c.sol[ci][pi]] = 2; })); celdas(); comprobar(); herramientas(); },
  responder, resolver, nuevoCaso, ayuda, get pueblo() { return pueblo; }
};
})();
