/* Honda Estelar — el juego: la sala (qué juegas, grado, nave, ayuda y calma), las 30 misiones de física, las partidas
   de preguntas, el modo lección (../leccion.js), la puntería, el vuelo, las estrellas, el sonido y la voz en inglés.
   - Cada nivel: la honda a la izquierda, planetas que doblan el camino y de 1 a 4 lunas. Se apunta con la dirección
     (grados: 0 = adelante) y la fuerza (1 a 10) y se lanza; la línea punteada dice por dónde irá (larga en `facil` y en
     modo ayuda; más corta en los niveles difíciles). Chocar o salirse no castiga: se vuelve a lanzar.
   - Con pregunta, cada luna lleva una opción (número, forma, color y texto). Se puede marcar antes la luna a la que se
     va (1 a 4 o tocándola): entonces sólo esa cuenta y llegar a otra es «te desviaste», sin fallo. La luna mala no se
     pierde: sale «Era: …» y su porqué, y en `facil` y `media` la pregunta vuelve de repaso al final (no cuenta).
   - Estrellas: llegar (la buena), con un solo lanzamiento y sin «Apuntar por mí», y con los cristales del camino.
   - Inglés: sólo los MP3 grabados de la Biblioteca (<voz>/en/<slug>.mp3 si el slug está en <voz>/en/index.json, o la
     carpeta de `voces`), en la cola de voz de leccion.js. Sin MP3: silencio y la palabra escrita. Jamás speechSynthesis.
   - Progreso (sala): localStorage juegos3d.honda {sel, calma, ayuda, mudo, misiones: {n: estrellas}, records}; puente.js
     lo separa por usuario. En modo lección no se guarda nada y al final se avisa a la lección.
   Depuración: window.__honda (estado, ganar(), lanzar(), apuntar(ang, f), elegir(i)). */
(function () {
'use strict';
const $ = id => document.getElementById(id);
const LJ = window.LeccionJuego, HF = window.HondaFisica, HN = window.HondaNiveles, HC = window.HondaContenido, HE = window.HondaEspacio || {};
const CLAVE = 'juegos3d.honda';
const leer = () => { try { return JSON.parse(localStorage.getItem(CLAVE)) || {}; } catch (e) { return {}; } };
const prefs = leer();
if (!prefs.misiones || typeof prefs.misiones !== 'object') prefs.misiones = {};
if (!prefs.records || typeof prefs.records !== 'object') prefs.records = {};
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const pick = a => a[Math.floor(Math.random() * a.length)];
const barajar = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const BIBLIO = /^(localhost|127\.0\.0\.1)$/.test(location.hostname) ? 'http://localhost:8765/' : 'https://biblioteca.micolevirtual.com/';
const reducir = matchMedia('(prefers-reduced-motion: reduce)').matches;
const LUNAS = HE.LUNAS || [{ color: '#ff922b', forma: 'círculo', glifo: '●' }, { color: '#4dabf7', forma: 'triángulo', glifo: '▲' }, { color: '#69db7c', forma: 'cuadrado', glifo: '■' }, { color: '#da77f2', forma: 'rombo', glifo: '◆' }];
const NAVES = HE.NAVES || [{ id: 'condor', nombre: 'Cóndor', franja: '#e03131' }];
const MIS = (HN && HN.misiones) || [];
const COLOR = ['naranja', 'azul', 'verde', 'morado'];
const EMO = /^((?:\p{Extended_Pictographic}|\p{Regional_Indicator}|[\u{1F3FB}-\u{1F3FF}‍️⃣#*0-9])+)\s*/u;
const partir = t => { t = String(t).trim(); const m = t.match(EMO); return m && m[1].replace(/[#*0-9]/g, '') ? { emoji: m[1], texto: t.slice(m[0].length) } : { emoji: '', texto: t }; };

/* ---------- modo lección (FORMATO.md §3.9) ---------- */
const CFG = LJ && LJ.activo && LJ.cfg ? LJ.cfg : null;
const LEC = (() => {
  if (!CFG) return null;
  const preguntas = (Array.isArray(CFG.preguntas) ? CFG.preguntas : []).filter(q => q && typeof q.p === 'string' && q.p.trim() && Array.isArray(q.opciones)
    && q.opciones.length >= 2 && q.opciones.length <= 4 && q.opciones.every(o => (typeof o === 'string' && o.trim()) || typeof o === 'number') && Number.isInteger(q.correcta) && q.correcta >= 0 && q.correcta < q.opciones.length)
    .map(q => {
      const p = q.p.trim(), oir = typeof q.oir === 'string' ? q.oir.trim() : '';
      const escucha = !!oir && p.toLowerCase().indexOf(oir.toLowerCase()) < 0;
      return { p, opciones: q.opciones.map(o => String(o).trim()), correcta: q.correcta, oir, escucha, palabra: escucha ? oir : '', opEn: false };
    });
  const palabras = (Array.isArray(CFG.palabras) ? CFG.palabras : []).filter(p => p && typeof p.en === 'string' && p.en.trim() && typeof p.es === 'string' && p.es.trim())
    .map(p => ({ en: p.en.trim(), es: p.es.trim(), emoji: typeof p.emoji === 'string' ? p.emoji.trim() : '' }));
  const misiones = Number.isInteger(CFG.misiones) ? clamp(CFG.misiones, 0, 6) : 0;
  if (!preguntas.length && palabras.length < 3 && !misiones) { console.warn('[honda] la lección no mandó preguntas ni palabras: va la sala'); return null; }
  return { titulo: (LJ.titulo || '').trim(), preguntas, palabras, misiones };
})();
const guardar = () => { if (LEC) return; try { localStorage.setItem(CLAVE, JSON.stringify(prefs)); } catch (e) { /* sin almacenamiento */ } };

// La dificultad (FORMATO.md §3.9.1). Nunca se pierde la partida: lo que cambia es la ayuda.
// facil: lunas que atrapan de lejos, línea punteada entera, «Apuntar por mí» sin límite y el fallo vuelve de repaso;
// media: algo de imán, línea de 3,5 s, 3 «Apuntar» y repaso; normal: lunas justas, línea de 2,2 s y 1 «Apuntar».
function params(modo) {
  return { modo, captura: modo === 'facil' ? 1.6 : modo === 'media' ? 0.8 : 0.3, linea: modo === 'facil' ? 99 : modo === 'media' ? 3.5 : 2.2,
    apuntes: modo === 'facil' ? Infinity : modo === 'media' ? 3 : 1, repaso: modo !== 'normal' };
}
const modoDeGrado = g => (g <= 2 ? 'facil' : g <= 5 ? 'media' : 'normal');
const VOZ = (() => { const v = CFG && typeof CFG.voz === 'string' && CFG.voz.trim() ? CFG.voz.trim() : BIBLIO + 'voz/'; return /\/$/.test(v) ? v : v + '/'; })();

/* ---------- sonido (sintetizado, 0 KB) ---------- */
const Snd = (() => {
  let ctx = null, mudo = !!prefs.mudo, ultimo = 0;
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
    s.buffer = b; f.type = 'bandpass'; f.Q.value = 1.4; f.frequency.setValueAtTime(f0, t0); f.frequency.exponentialRampToValueAtTime(f1, t0 + dur);
    g.gain.value = vol; s.connect(f); f.connect(g); g.connect(c.destination); s.start(t0);
  }
  return {
    get mudo() { return mudo; }, set mudo(v) { mudo = !!v; },
    despertar() { if (!mudo) ac(); },
    clic() { tono(990, 0, 0.05, 'sine', 0.05); },
    mover() { const a = Date.now(); if (a - ultimo < 70) return; ultimo = a; tono(620, 0, 0.03, 'triangle', 0.025); },
    lanzar() { tono(220, 0, 0.18, 'triangle', 0.12, 660); soplo(0.6, 0.14, 400, 2600); },
    cristal() { tono(1318, 0, 0.12, 'triangle', 0.1); tono(1760, 0.07, 0.18, 'triangle', 0.09); },
    llegar() { [523, 659, 784, 1047].forEach((f, i) => tono(f, i * 0.1, 0.3, 'triangle', 0.12)); },
    mal() { tono(392, 0, 0.18, 'square', 0.05, 330); tono(311, 0.16, 0.28, 'square', 0.05, 262); },
    choque() { soplo(0.5, 0.3, 900, 120); tono(110, 0, 0.35, 'sawtooth', 0.08, 50); },
    fuera() { tono(880, 0, 0.6, 'sine', 0.06, 220); },
    estrella(i) { tono(880 + i * 220, 0, 0.2, 'triangle', 0.1); }
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
  /** Pone en la cola el MP3 de `texto` si está grabado y hay sonido. true si va a sonar. */
  function decir(texto, opc) {
    if (Snd.mudo || !tiene(texto)) return false;
    opc = opc || {};
    const s = slug(texto), urls = [carpeta(s), lista && lista.has(s) ? 'en' : null].filter((d, i, a) => d && a.indexOf(d) === i).map(d => VOZ + d + '/' + s + '.mp3');
    if (cola) { const vig = opc.vigente; cola.poner({ urls, clave: 'honda:' + s, grupo: opc.grupo, caduca: opc.caduca || 5000, vigente: () => !Snd.mudo && !S.pausa && (!vig || vig()) }); return true; }
    if (audio) { audio.onended = audio.onerror = null; audio.pause(); }
    const probar = j => { if (j >= urls.length) return; const a = new Audio(urls[j]); audio = a; a.onerror = () => probar(j + 1); a.play().catch(() => {}); };
    probar(0); return true;
  }
  return { listo, tiene, decir, callar };
})();

/* ---------- estado ---------- */
const sel = Object.assign({ tema: 'misiones', grado: 6, nave: 'condor' }, prefs.sel || {});
const S = {
  modo: LEC ? 'leccion' : 'sala', fase: 'menu', pausa: false,
  calma: LEC ? reducir : (typeof prefs.calma === 'boolean' ? prefs.calma : reducir), ayuda: !LEC && !!prefs.ayuda,
  P: params('normal'), cola: [], item: null, n: null, mapa: [], hechos: 0, total: 0, aciertos: 0, fallos: 0, estrellas: 0, maxEstrellas: 0,
  repasar: [], ang: 0, fuerza: 5, destino: -1, lanzamientos: 0, ayudado: false, apuntes: 0, vuelo: null, ingles: false, mision: -1, buscando: null
};
let esp = null;
try { if (HE.disponible) esp = HE.crear($('gl'), { biblio: BIBLIO, calma: S.calma, nave: sel.nave }); } catch (e) { console.warn('Honda: sin 3D (' + e.message + ')'); esp = null; }

const anunciar = t => { const a = $('anuncio'); a.textContent = ''; setTimeout(() => { a.textContent = t; }, 30); };
const lineaSeg = () => {
  if (S.ayuda) return 99;
  if (S.item && S.item.tipo === 'm') { const m = MIS[S.item.m] || {}; return S.P.modo === 'facil' ? 99 : S.P.modo === 'media' ? Math.max(m.linea || 3, 3.5) : (m.linea || 2.2); }
  return S.P.linea;
};

/* ---------- armar la partida ---------- */
function itemsDePalabras(pal, modo, max) {
  const n = Math.min(max, Math.max(4, pal.length)), orden = [];
  while (orden.length < n) orden.push(...barajar(pal));
  const es = w => (w.emoji ? w.emoji + ' ' : '') + w.es;
  return orden.slice(0, n).map((w, i) => {
    const otras = barajar(pal.filter(x => x.es !== w.es && x.en !== w.en)).slice(0, 2);
    const tipo = modo !== 'facil' && i % 3 === 2 ? 'reves' : i % 2 === 0 ? 'escuchar' : 'leer';
    if (tipo === 'reves') {
      const ops = barajar([w].concat(otras));
      return { p: '¿Cómo se dice ' + es(w) + ' en inglés?', opciones: ops.map(x => x.en), correcta: ops.indexOf(w), oir: '', escucha: false, palabra: '', opEn: true, w };
    }
    const ops = barajar([w].concat(otras));
    const escucha = tipo === 'escuchar' && Voz.tiene(w.en);
    return { p: escucha ? 'Escucha y llega a la luna de lo que oíste' : '«' + w.en + '»: ¿qué quiere decir?', opciones: ops.map(es), correcta: ops.indexOf(w), oir: w.en, escucha, palabra: escucha ? w.en : '', opEn: false, w };
  });
}
function misionesPara(modo, k) {
  const desde = modo === 'facil' ? 0 : modo === 'media' ? 3 : 7, hasta = modo === 'facil' ? 9 : modo === 'media' ? 16 : 24;
  const ids = barajar(Array.from({ length: Math.max(1, Math.min(hasta, MIS.length) - desde) }, (_, i) => desde + i)).slice(0, k).sort((a, b) => a - b);
  return ids.filter(i => MIS[i]).map(m => ({ tipo: 'm', m }));
}
function partidaLeccion() {
  const P = S.P;
  let qs = LEC.preguntas.slice(0, 10).map(q => ({ tipo: 'q', q }));
  if (LEC.palabras.length >= 3) qs = qs.concat(itemsDePalabras(LEC.palabras, P.modo, Math.max(4, 10 - qs.length)).map(q => ({ tipo: 'q', q })));
  qs = qs.slice(0, 12);
  const ms = misionesPara(P.modo, LEC.misiones);
  // las misiones repartidas entre las preguntas
  const out = qs.slice(); ms.forEach((m, i) => out.splice(Math.round((i + 1) * (out.length + 1) / (ms.length + 1)), 0, m));
  return out;
}
function partidaSala() {
  const tema = HC.TEMAS[sel.tema], g = sel.grado;
  if (tema.palabras) {
    let pal = HC.PALABRAS.filter(w => w.g <= g);
    const cerca = pal.filter(w => w.g >= g - 2);
    pal = cerca.length >= 6 ? barajar(cerca).concat(barajar(pal.filter(w => w.g < g - 2))).slice(0, 12) : pal;
    return itemsDePalabras(pal, S.P.modo, 8).map(q => ({ tipo: 'q', q }));
  }
  let pool = tema.q.filter(q => q[0] <= g);
  if (pool.length < 8) pool = tema.q.slice().sort((a, b) => a[0] - b[0]).slice(0, Math.max(8, pool.length));
  const cerca = barajar(pool.filter(q => q[0] >= g - 2)), lejos = barajar(pool.filter(q => q[0] < g - 2));
  return cerca.concat(lejos).slice(0, 8).map(q => {
    const ops = barajar(q[2]);
    return { tipo: 'q', q: { p: q[1], opciones: ops, correcta: ops.indexOf(q[2][0]), oir: '', escucha: false, palabra: '', opEn: false, x: q[3] } };
  });
}
function empezar() {
  Voz.callar(); cerrarCapas();
  const modo = S.modo === 'leccion' ? (LJ.dificultad || 'normal') : modoDeGrado(sel.grado);
  S.P = params(modo);
  S.cola = S.modo === 'leccion' ? partidaLeccion() : S.mision >= 0 ? [{ tipo: 'm', m: S.mision }] : partidaSala();
  S.total = S.cola.filter(it => it.tipo === 'q').length;
  S.hechos = 0; S.aciertos = 0; S.fallos = 0; S.estrellas = 0; S.maxEstrellas = S.cola.length * 3; S.repasar = []; S.apuntes = S.P.apuntes; S.indice = 0;
  S.ingles = S.modo === 'leccion' ? (LEC.palabras.length > 0 || LEC.preguntas.some(q => q.oir)) : sel.tema === 'ingles';
  S.fase = 'juego';
  ['hud', 'carta', 'mando'].forEach(id => $(id).classList.remove('oculto'));
  siguiente();
}

/* ---------- un nivel ---------- */
function plantillaPara(k) {
  const ps = (HN && HN.plantillas && HN.plantillas[k]) || [];
  let n = pick(ps);
  if (!n) return null;
  if (Math.random() < 0.5) n = HF.espejo(n);
  return n;
}
function siguiente() {
  if (S.cola.length === 0) { terminar(); return; }
  const it = S.cola.shift(); S.item = it; S.indice++;
  S.destino = -1; S.lanzamientos = 0; S.ayudado = false; S.vuelo = null; S.respondida = false; S.cristalesVuelo = [];
  if (S.buscando) { S.buscando(); S.buscando = null; }
  if (it.tipo === 'm') {
    const m = MIS[it.m]; S.n = m; S.mapa = [];
    if (esp) esp.nivel(m, [{ texto: '🏁', color: '#ffd43b', base: true }]);
    S.destino = 0;
  } else {
    const q = it.q, k = q.opciones.length;
    S.n = plantillaPara(k) || { sal: [-44, 0], pl: [], lu: Array.from({ length: k }, (_, i) => [30, 18 - i * 12, 2.4]) };
    // la opción j va a la luna perm[j]
    const perm = barajar(Array.from({ length: k }, (_, i) => i));
    S.mapa = Array.from({ length: k }, (_, luna) => perm.indexOf(luna)); // luna → opción
    if (esp) esp.nivel(S.n, S.mapa.map((op, luna) => ({ texto: String(luna + 1), color: LUNAS[luna].color })));
  }
  S.ang = 0; S.fuerza = it.tipo === 'm' ? 4 : 5;
  pintarCarta(); pintarLunas(); apuntar(S.ang, S.fuerza, true); hud();
  S.fase = 'apuntar';
  if (it.tipo === 'q' && it.q.oir) Voz.decir(it.q.oir, { grupo: 'pregunta' });
  setTimeout(medirSeguro, 30);
  anunciar(textoDelNivel());
}
function textoDelNivel() {
  const it = S.item;
  if (it.tipo === 'm') { const m = MIS[it.m]; return 'Misión ' + (it.m + 1) + ': ' + m.nom + '. ' + m.ide + ' Llega a la base 🏁.'; }
  const q = it.q;
  return (q.escucha ? 'Escucha la palabra en inglés.' : q.p) + ' ' + S.mapa.map((op, l) => 'Luna ' + (l + 1) + ', ' + LUNAS[l].forma + ' ' + COLOR[l] + ': ' + q.opciones[op] + '.').join(' ');
}
function pintarCarta() {
  const it = S.item, h = $('cPreg'), pal = $('cPalabra');
  $('cFeed').textContent = ''; $('cFeed').className = 'feed';
  $('bOir').classList.add('oculto'); $('bVer').classList.add('oculto'); pal.classList.add('oculto');
  $('cExtra').textContent = '';
  if (it.tipo === 'm') {
    const m = MIS[it.m];
    $('cTipo').textContent = 'Misión ' + (it.m + 1) + (S.modo === 'sala' ? ' de ' + MIS.length : '');
    h.textContent = m.nom; $('cExtra').textContent = m.ide;
  } else {
    const q = it.q;
    $('cTipo').textContent = it.repaso ? 'Repaso' : 'Pregunta ' + preguntaN() + ' de ' + S.total;
    h.textContent = q.escucha ? '🔊 ' + q.p : q.p;
    if (q.oir) { $('bOir').classList.remove('oculto'); if (q.escucha) { $('bVer').classList.remove('oculto'); if (!Voz.tiene(q.oir) || Snd.mudo) verPalabra(); } }
  }
}
function preguntaN() { return Math.min(S.total, S.hechos + 1); }
function verPalabra() { const q = S.item && S.item.q; if (!q || !q.palabra) return; $('cPalabra').textContent = q.palabra; $('cPalabra').classList.remove('oculto'); $('bVer').classList.add('oculto'); medirSeguro(); }
function oir() { const q = S.item && S.item.q; if (!q || !q.oir) return; if (!Voz.decir(q.oir, { grupo: 'pregunta' })) { verPalabra(); anunciar('Esta palabra no está grabada: aquí está escrita.'); } }
function pintarLunas() {
  const box = $('lunas'); box.innerHTML = '';
  const it = S.item;
  if (it.tipo === 'm') { box.classList.add('oculto'); return; }
  box.classList.remove('oculto');
  S.mapa.forEach((op, l) => {
    const b = document.createElement('button'); b.type = 'button'; b.className = 'luna-op'; b.dataset.l = l;
    b.style.setProperty('--c', LUNAS[l].color);
    const t = it.q.opciones[op];
    b.innerHTML = '<span class="num" aria-hidden="true">' + (l + 1) + ' ' + LUNAS[l].glifo + '</span><span class="tx"></span>';
    b.querySelector('.tx').textContent = t; if (it.q.opEn) b.querySelector('.tx').lang = 'en';
    b.setAttribute('aria-label', 'Luna ' + (l + 1) + ', ' + LUNAS[l].forma + ': ' + t + '. Elegirla como destino');
    b.setAttribute('aria-pressed', 'false');
    b.addEventListener('click', () => elegir(l));
    box.appendChild(b);
  });
}
function elegir(l) {
  if (S.fase !== 'apuntar' || !S.item || S.item.tipo !== 'q' || l < 0 || l >= S.mapa.length) return;
  S.destino = S.destino === l ? -1 : l; Snd.clic();
  [...$('lunas').children].forEach((b, i) => b.setAttribute('aria-pressed', String(i === S.destino)));
  if (esp) S.mapa.forEach((_, i) => esp.marcarLuna(i, i === S.destino ? 'elegida' : 'normal'));
  const t = S.item.q.opciones[S.mapa[l]];
  if (S.item.q.opEn && S.destino === l) Voz.decir(t, { grupo: 'luna' });
  anunciar(S.destino === l ? 'Destino: luna ' + (l + 1) + ', ' + t + '.' : 'Sin destino: vale la primera luna a la que llegues.');
  hud();
}

/* ---------- apuntar ---------- */
let tAnuncio = 0, linViejo = '';
function apuntar(ang, f, callado) {
  ang = clamp(Math.round(ang), -90, 90); // la honda apunta hacia adelante (de -90° a 90°)
  S.ang = ang; S.fuerza = clamp(Math.round(f * 10) / 10, 1, 10);
  $('rAng').value = S.ang; $('rFuerza').value = S.fuerza;
  $('oAng').textContent = S.ang + '°'; $('oFuerza').textContent = S.fuerza.toFixed(1).replace('.', ',');
  $('rAng').setAttribute('aria-valuetext', textoAng()); $('rFuerza').setAttribute('aria-valuetext', 'fuerza ' + fmt(S.fuerza) + ' de 10');
  if (esp) esp.apuntar(S.ang, S.fuerza);
  lineaPrevia();
  if (!callado) { Snd.mover(); clearTimeout(tAnuncio); tAnuncio = setTimeout(() => anunciar(textoAng() + ', fuerza ' + fmt(S.fuerza) + ' de 10.'), 600); }
}
const fmt = v => (Math.round(v * 10) / 10).toString().replace('.', ',');
function textoAng() {
  const a = S.ang, haciaPos = esp && esp.vertical() ? 'hacia la izquierda' : 'hacia arriba', haciaNeg = esp && esp.vertical() ? 'hacia la derecha' : 'hacia abajo';
  return a === 0 ? 'Dirección 0 grados, derecho adelante' : 'Dirección ' + Math.abs(a) + ' grados ' + (a > 0 ? haciaPos : haciaNeg) + (Math.abs(a) > 90 ? ', hacia atrás' : '');
}
function lineaPrevia() {
  if (!esp || !S.n) return;
  if (S.fase === 'vuelo') { esp.linea(null); return; }
  const r = HF.simular(S.n, S.ang, S.fuerza, { captura: S.P.captura, hasta: lineaSeg(), cada: 5 });
  esp.linea(r.pts);
  // qué dice la línea, también en texto (si se ve hasta el final)
  let t = '';
  if (r.fin === 'luna') t = S.item.tipo === 'm' ? '🏁 La línea llega a la base' : 'La línea llega a la luna ' + (r.i + 1);
  else if (r.fin === 'choque' || r.fin === 'roca') t = '💥 La línea choca';
  else if (r.fin === 'fuera') t = '↗ La línea se sale';
  if (t !== linViejo) { linViejo = t; $('hLinea').textContent = t; }
}
function paso(da, df) { if (S.fase !== 'apuntar') return; apuntar(S.ang + da, S.fuerza + df); }

/* ---------- «Apuntar por mí» ---------- */
function puedeApuntar() {
  if (!S.item || S.fase !== 'apuntar') return false;
  if (S.ayuda || S.P.modo === 'facil') return true;
  if (S.item.tipo === 'm') return S.lanzamientos >= 2;
  return S.apuntes > 0;
}
function apuntarPorMi() {
  if (!puedeApuntar()) {
    if (S.item && S.item.tipo === 'm') anunciar('«Apuntar por mí» se abre después de dos lanzamientos. ¡Inténtalo!');
    else anunciar('Ya usaste tus ayudas para apuntar en esta partida.');
    return;
  }
  if (S.destino < 0) { anunciar('Primero elige la luna a la que quieres ir (1, 2, 3… o tócala).'); $('cFeed').textContent = 'Primero toca la luna a la que quieres ir.'; $('cFeed').className = 'feed nada'; return; }
  const meta = S.destino;
  $('bApuntar').disabled = true; $('cFeed').textContent = '🎯 Buscando un buen camino…'; $('cFeed').className = 'feed nada';
  if (S.buscando) S.buscando();
  const sol = S.n.sol && S.n.sol[meta] && S.P.captura <= 0.3 ? S.n.sol[meta] : null;
  const fin = s => {
    S.buscando = null; $('bApuntar').disabled = false;
    if (!s) { $('cFeed').textContent = 'No encontré un camino: prueba tú.'; return; }
    if (S.item.tipo === 'q' && S.P.apuntes !== Infinity && !S.ayuda) S.apuntes--;
    S.ayudado = true;
    animarApunte(s.ang, s.fuerza);
    $('cFeed').textContent = '🎯 Listo: dirección ' + s.ang + '°, fuerza ' + fmt(s.fuerza) + '. ¡Lanza!';
    hud();
  };
  if (sol) { setTimeout(() => fin({ ang: sol[0], fuerza: sol[1] }), 120); return; }
  S.buscando = HF.apuntar(S.n, meta, S.P.captura, fin, S.item.tipo === 'm' ? 'cristales' : null);
}
function animarApunte(a, f) {
  if (S.calma || reducir) { apuntar(a, f); return; }
  const a0 = S.ang, f0 = S.fuerza, t0 = performance.now();
  const ir = () => { const k = Math.min(1, (performance.now() - t0) / 500), e = 1 - (1 - k) * (1 - k); apuntar(a0 + (a - a0) * e, f0 + (f - f0) * e, k < 1); if (k < 1 && S.fase === 'apuntar') requestAnimationFrame(ir); };
  ir();
}

/* ---------- lanzar y volar ---------- */
function lanzar() {
  if (S.fase !== 'apuntar' || !S.n) return;
  Snd.despertar(); Snd.lanzar();
  const r = HF.simular(S.n, S.ang, S.fuerza, { captura: S.P.captura, cada: 2 });
  S.lanzamientos++; S.fase = 'vuelo'; S.vuelo = { r, t: 0, tomados: [] };
  if (esp) { esp.linea(null); esp.efecto('lanzar'); }
  $('cFeed').textContent = ''; mandoActivo(false);
  anunciar('¡Lanzada! Dirección ' + S.ang + ' grados, fuerza ' + fmt(S.fuerza) + '.');
  hud();
  if (!esp) acabarVuelo(); // sin 3D: el resultado de una
}
function volar(dt) {
  const v = S.vuelo; if (!v) return;
  v.t += dt * 1.25 * clamp(Math.sqrt(5 / S.fuerza), 1, 1.8); // los lanzamientos lentos no se hacen eternos
  const pts = v.r.pts, n = pts.length / 2, k = Math.min(n - 1, v.t * 60), i = Math.floor(k), f = k - i, j = Math.min(n - 1, i + 1);
  const x = pts[2 * i] + (pts[2 * j] - pts[2 * i]) * f, y = pts[2 * i + 1] + (pts[2 * j + 1] - pts[2 * i + 1]) * f;
  const a = Math.max(0, i - 2), rumbo = Math.atan2(pts[2 * j + 1] - pts[2 * a + 1], pts[2 * j] - pts[2 * a]);
  if (esp) esp.enVuelo(x, y, rumbo, v.t < 0.35);
  (S.n.cr || []).forEach((c, ci) => {
    if (v.tomados.indexOf(ci) < 0 && v.r.cr.indexOf(ci) >= 0 && Math.hypot(c[0] - x, c[1] - y) < HF.CRISTAL + 0.3) { v.tomados.push(ci); Snd.cristal(); if (esp) esp.tomarCristal(ci); }
  });
  if (k >= n - 1) acabarVuelo();
}
function acabarVuelo() {
  const v = S.vuelo, r = v.r, end = [r.pts[r.pts.length - 2], r.pts[r.pts.length - 1]];
  S.vuelo = null;
  if (r.fin !== 'luna') {
    const txt = r.fin === 'choque' ? (S.n.hn && r.i >= (S.n.pl || []).length ? '🕳️ ¡El agujero negro se tragó la nave!' : '💥 ¡Pum! Chocaste con un planeta.')
      : r.fin === 'roca' ? '💥 Chocaste con una roca.' : r.fin === 'fuera' ? '↗ La nave se salió del mapa.' : '🔄 La nave se quedó dando vueltas.';
    const consejo = r.fin === 'fuera' ? (S.fuerza > 6 ? ' Prueba con menos fuerza o pasa más cerca de un planeta.' : ' Cambia la dirección.') : r.fin === 'tiempo' ? ' Con más fuerza escapa de la órbita.' : ' Cambia un poco la dirección o la fuerza.';
    if (esp) esp.efecto(r.fin === 'fuera' || r.fin === 'tiempo' ? 'fuera' : 'choque', end[0], end[1]);
    r.fin === 'fuera' || r.fin === 'tiempo' ? Snd.fuera() : Snd.choque();
    if (S.ingles) Voz.decir('try-again', { grupo: 'feedback' });
    otraVez(txt + consejo);
    return;
  }
  const luna = r.i;
  if (S.item.tipo === 'm') { llegarBien(end, r); return; }
  if (S.destino >= 0 && luna !== S.destino) {
    if (esp) esp.efecto('fuera', end[0], end[1]);
    Snd.fuera();
    otraVez('🌙 Te desviaste a la luna ' + (luna + 1) + '; tu destino es la ' + (S.destino + 1) + '. Vuelve a lanzar (o toca la luna ' + (luna + 1) + ' si es la que quieres).');
    return;
  }
  const op = S.mapa[luna], q = S.item.q, bien = op === q.correcta;
  if (q.opEn) Voz.decir(q.opciones[op], { grupo: 'luna' });
  if (bien) llegarBien(end, r); else llegarMal(end, luna);
}
function otraVez(t) {
  S.fase = 'apuntar'; mandoActivo(true);
  $('cFeed').textContent = t; $('cFeed').className = 'feed mal';
  anunciar(t); hud();
  setTimeout(() => { if (S.fase === 'apuntar' && esp) { esp.enHonda(); lineaPrevia(); } }, 700);
  if (S.item.tipo === 'm' && S.lanzamientos === 2 && !S.ayuda && S.P.modo !== 'facil') setTimeout(() => { if (S.fase === 'apuntar') $('cExtra').textContent = (MIS[S.item.m] || {}).ide + ' Si quieres, ya puedes usar 🎯 Apuntar por mí.'; }, 800);
}
function estrellasDe(r) {
  const una = S.lanzamientos === 1 && !S.ayudado, crs = (S.n.cr || []).length;
  const cristal = S.item.tipo === 'm' ? crs > 0 && r.cr.length === crs : r.cr.length > 0;
  return 1 + (una ? 1 : 0) + (cristal ? 1 : 0);
}
function llegarBien(end, r) {
  S.fase = 'resultado';
  const e = estrellasDe(r), it = S.item;
  if (esp) { esp.efecto('llegada', end[0], end[1]); if (it.tipo === 'q') esp.marcarLuna(r.i, 'bien'); }
  Snd.llegar(); for (let i = 0; i < e; i++) setTimeout(() => Snd.estrella(i), 450 + i * 160);
  if (S.ingles) Voz.decir(pick(['great-job', 'well-done', 'good-job']), { grupo: 'feedback' });
  let t = '';
  if (it.tipo === 'm') {
    t = '🏁 ¡Llegaste a la base!';
    if (S.modo === 'sala') { const k = String(it.m); if (!prefs.misiones[k] || prefs.misiones[k] < e) { prefs.misiones[k] = e; guardar(); } }
  } else {
    const q = it.q; t = '✔ ¡Correcto! ' + q.opciones[q.correcta] + (q.palabra ? ' («' + q.palabra + '»)' : '') + (q.x ? '. ' + q.x : '');
    if (!it.repaso) { S.aciertos++; S.hechos++; }
  }
  S.estrellas += e;
  mostrarAviso(t, e, r);
  avisarLeccion(false);
}
function llegarMal(end, luna) {
  S.fase = 'resultado';
  const it = S.item, q = it.q, buena = S.mapa.indexOf(q.correcta);
  if (esp) { esp.efecto('mal', end[0], end[1]); esp.marcarLuna(luna, 'mal'); esp.marcarLuna(buena, 'bien'); }
  Snd.mal();
  if (S.ingles) Voz.decir('oops', { grupo: 'feedback' });
  if (q.opEn) setTimeout(() => Voz.decir(q.opciones[q.correcta], { grupo: 'luna2' }), 50);
  const t = '✘ Esa luna dice «' + q.opciones[S.mapa[luna]] + '». Era la luna ' + (buena + 1) + ' ' + LUNAS[buena].glifo + ': ' + q.opciones[q.correcta] + (q.palabra ? ' («' + q.palabra + '»)' : '') + '.' + (q.x ? ' ' + q.x : '');
  if (!it.repaso) {
    S.fallos++; S.hechos++; S.repasar.push(q);
    if (S.P.repaso) S.cola.push({ tipo: 'q', q, repaso: true });
  }
  mostrarAviso(t, 0, null);
  avisarLeccion(false);
}
function mostrarAviso(t, e, r) {
  const a = $('aviso');
  $('aTit').textContent = e ? '⭐'.repeat(e) + '☆'.repeat(3 - e) : '';
  $('aTit').setAttribute('aria-label', e ? e + ' de 3 estrellas' : '');
  $('aTxt').textContent = t;
  const d = [];
  if (e) {
    d.push('⭐ Llegaste');
    d.push((S.lanzamientos === 1 && !S.ayudado ? '⭐' : '☆') + ' ' + (S.lanzamientos === 1 ? (S.ayudado ? 'Con ayuda para apuntar' : 'Al primer lanzamiento') : S.lanzamientos + ' lanzamientos'));
    const crs = (S.n.cr || []).length, n = r ? r.cr.length : 0;
    d.push((e && (S.item.tipo === 'm' ? n === crs && crs > 0 : n > 0) ? '⭐' : '☆') + ' Cristales: ' + n + (S.item.tipo === 'm' ? ' de ' + crs : ''));
  }
  $('aDet').innerHTML = ''; d.forEach(x => { const li = document.createElement('li'); li.textContent = x; $('aDet').appendChild(li); });
  const ultimo = S.cola.length === 0;
  $('bSeguir').textContent = ultimo ? (S.modo === 'sala' && S.item.tipo === 'm' ? '▶ Seguir' : '🏁 Terminar') : '▶ Siguiente';
  a.classList.toggle('bien', !!e); a.classList.toggle('mal', !e);
  a.classList.remove('oculto'); mandoActivo(false);
  anunciar(t);
  setTimeout(() => { if (!a.classList.contains('oculto')) $('bSeguir').focus({ preventScroll: true }); }, 60);
  hud();
}
function seguir() {
  $('aviso').classList.add('oculto');
  if (S.fase !== 'resultado') return;
  mandoActivo(true);
  if (S.modo === 'sala' && S.item.tipo === 'm') { finMision(); return; }
  siguiente();
}
function mandoActivo(b) {
  ['bIzq', 'bDer', 'bMenos', 'bMas', 'bLanzar', 'rAng', 'rFuerza'].forEach(id => { $(id).disabled = !b; });
  $('bApuntar').disabled = !b; $('mando').classList.toggle('quieto', !b);
}

/* ---------- avisar a la lección y terminar ---------- */
function avisarLeccion(terminado) {
  if (S.modo !== 'leccion' || !LJ) return;
  const r = { aciertos: S.aciertos, total: S.total, fallos: S.fallos, nivel: 'Nivel ' + Math.min(S.indice, S.indice + S.cola.length) + ' de ' + (S.indice + S.cola.length) };
  try { if (terminado) LJ.resultado(r); else LJ.progreso(r); } catch (e) { /* sin padre: nada */ }
}
function terminar() {
  S.fase = 'fin'; Voz.callar();
  ['hud', 'carta', 'mando', 'lunas'].forEach(id => $(id).classList.add('oculto'));
  if (esp) esp.linea(null);
  const resumen = (S.total ? 'Respuestas buenas a la primera: ' + S.aciertos + ' de ' + S.total + '. ' : '') + 'Estrellas: ' + S.estrellas + ' de ' + S.maxEstrellas + '.';
  if (S.modo === 'leccion') {
    avisarLeccion(true);
    const chips = LEC.palabras.length ? LEC.palabras.slice(0, 10).map(w => w.en + ' = ' + w.es) : S.repasar.slice(0, 4).map(q => q.p.replace(/^🔊\s*/, '').slice(0, 40) + ' → ' + q.opciones[q.correcta]);
    LJ.logrado({ detalle: '¡Todas las lunas visitadas! ' + resumen, chips, chipsRotulo: LEC.palabras.length ? 'Lo que practicaste' : 'Para repasar', alOtraVez: () => { Snd.despertar(); empezar(); } });
    return;
  }
  const k = sel.tema + '|' + sel.grado, rec = prefs.records[k];
  const nuevo = !rec || S.estrellas > rec.estrellas;
  if (nuevo) { prefs.records[k] = { estrellas: S.estrellas, aciertos: S.aciertos, total: S.total }; guardar(); }
  const fr = S.estrellas / Math.max(1, S.maxEstrellas);
  $('fMedalla').textContent = fr >= 0.85 ? '🏆' : fr >= 0.6 ? '🥇' : fr >= 0.4 ? '🥈' : '🚀';
  $('fTit').textContent = fr >= 0.85 ? '¡Piloto estelar!' : '¡Misión cumplida!';
  $('fRes').textContent = resumen + (nuevo && rec ? ' ¡Nuevo récord!' : rec ? ' Tu récord: ' + rec.estrellas + ' estrellas.' : '');
  $('fRepasa').textContent = S.repasar.length ? 'Para repasar: ' + S.repasar.slice(0, 4).map(q => q.p.replace(/^🔊\s*/, '') + ' → ' + q.opciones[q.correcta] + (q.palabra ? ' («' + q.palabra + '»)' : '')).join(' · ') : '¡Ninguna luna equivocada!';
  $('final').classList.remove('oculto'); $('bOtraVez').focus();
}
function finMision() {
  const m = S.item.m, e = prefs.misiones[String(m)] || 0;
  S.fase = 'fin';
  ['carta', 'mando', 'lunas'].forEach(id => $(id).classList.add('oculto'));
  $('mTit').textContent = 'Misión ' + (m + 1) + ': ' + MIS[m].nom;
  $('mRes').textContent = 'Tu mejor marca: ' + '⭐'.repeat(e) + '☆'.repeat(3 - e) + '. Estrellas de todas las misiones: ' + totalEstrellas() + ' de ' + MIS.length * 3 + '.';
  $('bSigMision').classList.toggle('oculto', m + 1 >= MIS.length);
  $('finMision').classList.remove('oculto');
  (m + 1 < MIS.length ? $('bSigMision') : $('bRepMision')).focus();
}
const totalEstrellas = () => Object.keys(prefs.misiones).reduce((t, k) => t + (+prefs.misiones[k] || 0), 0);

/* ---------- HUD ---------- */
function hud() {
  const it = S.item;
  $('hNivel').textContent = !it ? '' : it.tipo === 'm' && S.modo === 'sala' ? 'Misión ' + (it.m + 1) : 'Nivel ' + S.indice + ' de ' + (S.indice + S.cola.length);
  $('hInfo').textContent = '⭐ ' + S.estrellas + ' · 🚀 ' + S.lanzamientos + (S.destino >= 0 && it && it.tipo === 'q' ? ' · 🎯 ' + (S.destino + 1) : '');
  const ap = $('bApuntar'), lim = S.ayuda || S.P.modo === 'facil' ? '' : it && it.tipo === 'm' ? (S.lanzamientos >= 2 ? '' : ' 🔒') : ' (' + S.apuntes + ')';
  ap.querySelector('small').textContent = lim;
  $('bAyuda').setAttribute('aria-pressed', String(S.ayuda)); $('bCalma').setAttribute('aria-pressed', String(S.calma));
  $('bSonido').setAttribute('aria-pressed', String(Snd.mudo)); $('iSonido').textContent = Snd.mudo ? '🔇' : '🔊'; $('tSonido').textContent = Snd.mudo ? 'Activar el sonido' : 'Silenciar';
}
function medirSeguro() {
  if (!esp) return;
  const h = innerHeight, w = innerWidth;
  let top = 0, bot = h;
  ['hud', 'carta'].forEach(id => { const e = $(id); if (!e.classList.contains('oculto')) { const r = (id === 'hud' ? e.querySelector('.marcador') : e).getBoundingClientRect(); if (r.height) top = Math.max(top, r.bottom); } });
  ['mando', 'lunas'].forEach(id => { const e = $(id); if (!e.classList.contains('oculto')) { const r = e.getBoundingClientRect(); if (r.height) bot = Math.min(bot, r.top); } });
  esp.seguro({ l: 4, t: top + 4, r: w - 4, b: Math.max(top + 60, bot - 4) });
}
function etiquetas() { // los textos junto a las lunas (en pantallas con sitio)
  const box = $('etqs');
  if (!esp || !S.item || S.item.tipo !== 'q' || S.fase === 'fin' || S.fase === 'menu') { if (box.childElementCount) box.innerHTML = ''; return; }
  const q = S.item.q;
  if (box.childElementCount !== S.mapa.length || box.dataset.k !== String(S.indice)) {
    box.innerHTML = ''; box.dataset.k = String(S.indice);
    S.mapa.forEach((op, l) => { const d = document.createElement('div'); d.className = 'etq'; d.style.setProperty('--c', LUNAS[l].color); d.setAttribute('aria-hidden', 'true'); d.textContent = q.opciones[op]; if (q.opEn) d.lang = 'en'; box.appendChild(d); });
  }
  S.n.lu.forEach((lu, l) => {
    const p = esp.proyectar(lu[0], lu[1]), d = box.children[l]; if (!d) return;
    d.style.transform = 'translate(' + Math.round(p.x) + 'px,' + Math.round(p.y) + 'px)';
    d.classList.toggle('elegida', S.destino === l);
  });
}

/* ---------- la sala: el inicio ---------- */
function botonOpcion(caja, txt, activo, alElegir, extra) {
  const b = document.createElement('button'); b.type = 'button'; b.className = 'op'; b.setAttribute('aria-pressed', String(activo));
  b.innerHTML = txt; if (extra) b.title = extra;
  b.addEventListener('click', () => { Snd.clic(); alElegir(); armarInicio(); });
  caja.appendChild(b); return b;
}
function armarInicio() {
  const t = $('oTema'); t.innerHTML = '';
  botonOpcion(t, '<span aria-hidden="true">🚀</span> Misiones de física <small>30 niveles</small>', sel.tema === 'misiones', () => { sel.tema = 'misiones'; });
  Object.keys(HC.TEMAS).forEach(k => { const m = HC.TEMAS[k]; botonOpcion(t, '<span aria-hidden="true">' + m.emoji + '</span> ' + m.nombre + ' <small>' + m.grados[0] + '.º a ' + m.grados[1] + '.º</small>', sel.tema === k, () => { sel.tema = k; }); });
  const g = $('oGrado'); g.innerHTML = '';
  for (let i = 3; i <= 11; i++) botonOpcion(g, i + '.º', sel.grado === i, () => { sel.grado = i; });
  const n = $('oNave'); n.innerHTML = '';
  NAVES.forEach(d => botonOpcion(n, '<span class="pinta" style="--c:' + d.franja + '" aria-hidden="true"></span> ' + d.nombre, sel.nave === d.id, () => { sel.nave = d.id; if (esp) esp.nave(d.id); }));
  $('oAyuda').checked = S.ayuda; $('oCalma').checked = S.calma;
  const modo = modoDeGrado(sel.grado);
  $('tModo').textContent = modo === 'facil' ? 'Con este grado: lunas grandes, la línea entera y ayuda para apuntar sin límite.' : modo === 'media' ? 'Con este grado: lunas algo más grandes, línea mediana y 3 ayudas para apuntar.' : 'Con este grado: la línea se acorta y hay 1 ayuda para apuntar por partida.';
  const tm = HC.TEMAS[sel.tema];
  if (tm && (sel.grado < tm.grados[0] || sel.grado > tm.grados[1])) $('tModo').textContent += ' Este tema es de ' + tm.grados[0] + '.º a ' + tm.grados[1] + '.º: saldrán las preguntas más cercanas a tu grado.';
  const rec = prefs.records[sel.tema + '|' + sel.grado];
  $('tRecord').textContent = sel.tema === 'misiones' ? 'Estrellas de las misiones: ' + totalEstrellas() + ' de ' + MIS.length * 3 + '.' : rec ? 'Tu récord aquí: ' + rec.estrellas + ' estrellas (' + rec.aciertos + ' de ' + rec.total + ' a la primera).' : '';
  $('bDespegar').textContent = sel.tema === 'misiones' ? '▶ Ver las misiones' : '▶ Despegar';
  prefs.sel = sel; guardar();
}
function armarMisiones() {
  const g = $('oMisiones'); g.innerHTML = '';
  let abierta = 0; while (abierta < MIS.length && prefs.misiones[String(abierta)]) abierta++;
  MIS.forEach((m, i) => {
    const e = prefs.misiones[String(i)] || 0, cerrada = i > abierta + 1;
    const b = document.createElement('button'); b.type = 'button'; b.className = 'mis' + (cerrada ? ' cerrada' : ''); b.disabled = cerrada;
    b.innerHTML = '<b>' + (i + 1) + '</b><span class="est" aria-hidden="true">' + (cerrada ? '🔒' : '⭐'.repeat(e) + '☆'.repeat(3 - e)) + '</span><small></small>';
    b.querySelector('small').textContent = m.nom;
    b.setAttribute('aria-label', 'Misión ' + (i + 1) + ': ' + m.nom + (cerrada ? ', cerrada' : ', ' + e + ' de 3 estrellas'));
    b.addEventListener('click', () => { Snd.despertar(); S.mision = i; empezar(); });
    g.appendChild(b);
  });
  $('tMisiones').textContent = 'Estrellas: ' + totalEstrellas() + ' de ' + MIS.length * 3 + '. Termina una para abrir las siguientes.';
}
function cerrarCapas() { ['inicio', 'misiones', 'pausa', 'final', 'finMision', 'aviso'].forEach(id => $(id).classList.add('oculto')); S.pausa = false; }
function irInicio() {
  Voz.callar(); cerrarCapas(); S.fase = 'menu'; S.item = null; S.mision = -1;
  ['hud', 'carta', 'mando', 'lunas'].forEach(id => $(id).classList.add('oculto'));
  if (S.modo === 'leccion') { empezar(); return; }
  armarInicio(); $('inicio').classList.remove('oculto'); $('bDespegar').focus();
}
function irMisiones() { cerrarCapas(); S.fase = 'menu'; ['hud', 'carta', 'mando', 'lunas'].forEach(id => $(id).classList.add('oculto')); armarMisiones(); $('misiones').classList.remove('oculto'); const b = $('oMisiones').querySelector('button:not(:disabled)'); if (b) b.focus(); }
function pausa(b) {
  if (S.fase === 'menu' || S.fase === 'fin') return;
  S.pausa = b; $('pausa').classList.toggle('oculto', !b);
  if (b) { Voz.callar(); $('pRes').textContent = (S.total ? 'Respuestas buenas a la primera: ' + S.aciertos + ' de ' + S.hechos + '. ' : '') + 'Estrellas: ' + S.estrellas + '.'; $('bReanudar').focus(); }
  $('bInicio').textContent = S.modo === 'leccion' ? '↻ Empezar de nuevo' : 'Volver al inicio';
}

/* ---------- controles ---------- */
function repetir(id, fn) { // tocar = un paso; mantener = sigue
  const b = $(id); let t1 = 0, t2 = 0;
  const parar = () => { clearTimeout(t1); clearInterval(t2); };
  b.addEventListener('pointerdown', e => { if (b.disabled) return; e.preventDefault(); fn(e.shiftKey ? 5 : 1); parar(); t1 = setTimeout(() => { t2 = setInterval(() => fn(1), 60); }, 380); });
  ['pointerup', 'pointerleave', 'pointercancel'].forEach(ev => b.addEventListener(ev, parar));
  b.addEventListener('click', e => { if (e.detail === 0) fn(1); }); // teclado (Enter / Espacio)
}
repetir('bIzq', k => paso(k, 0)); repetir('bDer', k => paso(-k, 0));
repetir('bMas', k => paso(0, 0.1 * k)); repetir('bMenos', k => paso(0, -0.1 * k));
$('rAng').addEventListener('input', e => apuntar(+e.target.value, S.fuerza));
$('rFuerza').addEventListener('input', e => apuntar(S.ang, +e.target.value));
$('bLanzar').addEventListener('click', lanzar);
$('bApuntar').addEventListener('click', apuntarPorMi);
$('bOir').addEventListener('click', oir); $('bVer').addEventListener('click', verPalabra);
$('bSeguir').addEventListener('click', seguir);
$('bSonido').addEventListener('click', () => { Snd.mudo = !Snd.mudo; prefs.mudo = Snd.mudo; guardar(); if (Snd.mudo) Voz.callar(); hud(); });
$('bCalma').addEventListener('click', () => { S.calma = !S.calma; if (!LEC) { prefs.calma = S.calma; guardar(); } if (esp) esp.calma(S.calma); hud(); anunciar(S.calma ? 'Modo calma: poco movimiento.' : 'Modo calma apagado.'); });
$('bAyuda').addEventListener('click', () => { S.ayuda = !S.ayuda; if (!LEC) { prefs.ayuda = S.ayuda; guardar(); } lineaPrevia(); hud(); anunciar(S.ayuda ? 'Modo ayuda: la línea punteada entera y «Apuntar por mí» sin límite.' : 'Modo ayuda apagado.'); });
$('bMenu').addEventListener('click', () => pausa(true));
$('bReanudar').addEventListener('click', () => pausa(false));
$('bInicio').addEventListener('click', irInicio);
$('bDespegar').addEventListener('click', () => { Snd.despertar(); if (sel.tema === 'misiones') irMisiones(); else { S.mision = -1; empezar(); } });
$('bMisVolver').addEventListener('click', irInicio);
$('oAyuda').addEventListener('change', e => { S.ayuda = e.target.checked; prefs.ayuda = S.ayuda; guardar(); });
$('oCalma').addEventListener('change', e => { S.calma = e.target.checked; prefs.calma = S.calma; guardar(); if (esp) esp.calma(S.calma); });
$('bOtraVez').addEventListener('click', () => { Snd.despertar(); empezar(); });
$('bCambiar').addEventListener('click', irInicio);
$('bSigMision').addEventListener('click', () => { S.mision = S.item.m + 1; empezar(); });
$('bRepMision').addEventListener('click', () => { S.mision = S.item.m; empezar(); });
$('bListaMisiones').addEventListener('click', irMisiones);

// tocar el espacio: una luna = destino; otro punto = apuntar hacia allí (y arrastrar para afinar)
let arrastre = false;
function apuntarHacia(x, y) { if (x == null || !S.n) return; apuntar(Math.atan2(y - S.n.sal[1], x - S.n.sal[0]) * 180 / Math.PI, S.fuerza); }
if (esp) {
  const c = esp.lienzo;
  c.addEventListener('pointerdown', e => {
    if (S.fase !== 'apuntar' || S.pausa) return;
    const t = esp.tocar(e.clientX, e.clientY);
    if (t.luna >= 0 && S.item.tipo === 'q') { elegir(t.luna); return; }
    arrastre = true; c.setPointerCapture(e.pointerId); apuntarHacia(t.x, t.y);
  });
  c.addEventListener('pointermove', e => { if (!arrastre || S.fase !== 'apuntar') return; const t = esp.tocar(e.clientX, e.clientY); apuntarHacia(t.x, t.y); });
  ['pointerup', 'pointercancel'].forEach(ev => c.addEventListener(ev, () => { arrastre = false; }));
}

addEventListener('keydown', e => {
  if (document.querySelector('.lj-capa')) return;
  const k = e.key, enControl = e.target && /^(BUTTON|INPUT|A)$/.test(e.target.tagName);
  if (k === 'Escape') { if (S.pausa) pausa(false); else if (S.fase === 'apuntar' || S.fase === 'vuelo' || S.fase === 'resultado') pausa(true); e.preventDefault(); return; }
  if (S.pausa || S.fase === 'menu' || S.fase === 'fin') return;
  if (S.fase === 'resultado') { if ((k === 'Enter' || k === ' ') && !enControl) { e.preventDefault(); seguir(); } return; }
  const enRango = e.target && e.target.type === 'range';
  if (!enRango && (k === 'ArrowLeft' || k === 'ArrowRight')) { e.preventDefault(); paso((k === 'ArrowLeft' ? 1 : -1) * (e.shiftKey ? 5 : 1), 0); return; }
  if (!enRango && (k === 'ArrowUp' || k === 'ArrowDown')) { e.preventDefault(); paso(0, (k === 'ArrowUp' ? 1 : -1) * (e.shiftKey ? 1 : 0.1)); return; }
  if ((k === ' ' || k === 'Enter') && !enControl) { e.preventDefault(); lanzar(); return; }
  if (/^[1-4]$/.test(k)) { elegir(+k - 1); return; }
  const l = k.toLowerCase();
  if (l === 'a') apuntarPorMi(); else if (l === 'o') oir(); else if (l === 'v') verPalabra();
  else if (l === 'l') $('bAyuda').click(); else if (l === 'c') $('bCalma').click(); else if (l === 'm') $('bSonido').click();
});
document.addEventListener('visibilitychange', () => { if (document.hidden) { Voz.callar(); if (S.fase === 'apuntar' || S.fase === 'vuelo') pausa(true); } });
addEventListener('resize', () => setTimeout(medirSeguro, 50));
if (window.ResizeObserver) { const ro = new ResizeObserver(() => medirSeguro()); ['carta', 'mando', 'lunas'].forEach(id => ro.observe($(id))); }
addEventListener('pagehide', () => { if (S.modo === 'leccion' && S.fase !== 'fin' && S.hechos) avisarLeccion(false); });

/* ---------- el bucle ---------- */
let antes = performance.now();
function bucle(ahora) {
  const dt = Math.min(0.05, (ahora - antes) / 1000); antes = ahora;
  if (!S.pausa && S.fase === 'vuelo') volar(dt);
  if (esp) { esp.cuadro(S.pausa ? 0 : dt); etiquetas(); }
  requestAnimationFrame(bucle);
}

/* ---------- arrancar ---------- */
function listo() {
  $('cargando').classList.add('oculto');
  if (esp) { esp.calma(S.calma); if (MIS[0]) { esp.nivel(MIS[0], [{ texto: '🏁', color: '#ffd43b', base: true }]); esp.apuntar(12, 5); } }
  if (!esp) anunciar('Este equipo no muestra 3D: apunta con los controles y lee el resultado.');
  if (S.modo === 'leccion') {
    const chips = LEC.palabras.length ? LEC.palabras.slice(0, 12).map(w => (w.emoji ? w.emoji + ' ' : '') + w.en) : [];
    LJ.portada({ juego: 'Honda Estelar', titulo: LEC.titulo || 'Vuela a la luna de la respuesta',
      detalle: 'Elige la dirección y la fuerza y lanza la nave: la gravedad de los planetas dobla su camino. Llega a la luna de la respuesta correcta; si chocas, vuelves a lanzar.',
      chips, chipsRotulo: 'Las palabras de la lección', alJugar: () => { Snd.despertar(); empezar(); } });
  } else { armarInicio(); $('inicio').classList.remove('oculto'); $('bDespegar').focus(); }
  requestAnimationFrame(bucle);
}
const fuentes = document.fonts && document.fonts.load ? Promise.all([document.fonts.load('800 32px "Baloo 2"'), document.fonts.ready]).catch(() => {}) : Promise.resolve();
Promise.race([Promise.all([Voz.listo, fuentes]), new Promise(r => setTimeout(r, 2500))]).then(listo);

window.__honda = {
  estado: S, apuntar: (a, f) => apuntar(a, f), lanzar, elegir, seguir,
  mision(i) { S.mision = i; empezar(); },
  /** la solución guardada del nivel, con la línea entera (para revisar los niveles) */
  verSol() { const s = S.n && S.n.sol && S.n.sol[S.item.tipo === 'm' ? 0 : S.mapa.indexOf(S.item.q.correcta)]; if (!s) return false; S.ayuda = true; apuntar(s[0], s[1], true); return s; },
  /** apunta a la buena (o a la base) y lanza: para las pruebas */
  ganar() {
    if (S.fase !== 'apuntar') return false;
    const meta = S.item.tipo === 'm' ? 0 : S.mapa.indexOf(S.item.q.correcta);
    S.destino = meta;
    HF.apuntar(S.n, meta, S.P.captura, s => { if (s) { apuntar(s.ang, s.fuerza, true); lanzar(); } }, 'cristales');
    return true;
  },
  fallar() { // a una luna mala
    if (S.fase !== 'apuntar' || S.item.tipo !== 'q') return false;
    const meta = S.mapa.findIndex(op => op !== S.item.q.correcta); S.destino = meta;
    HF.apuntar(S.n, meta, S.P.captura, s => { if (s) { apuntar(s.ang, s.fuerza, true); lanzar(); } });
    return true;
  }
};
})();
