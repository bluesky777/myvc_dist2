/* Torre de los Enigmas — el juego: la sala (inicio con grado, idioma y familias), el modo lección (../leccion.js),
   la carta del enigma en HTML (legible y para el lector de pantalla), el sonido sintetizado y la voz en inglés.
   - Los enigmas: enigmas.js (window.Enigmas). La torre: torre3d.js (window.Torre3D); sin WebGL, se juega igual.
   - Inglés: sólo los MP3 grabados de la Biblioteca, <voz>/en/<slug>.mp3 si el slug está en <voz>/en/index.json
     (slug = nombreDelAudio de app2 voz-grabada.ts). Sin MP3: silencio y la palabra escrita. Jamás speechSynthesis.
   - Sin reloj y sin vidas: al fallar sale la explicación y otro enigma de la misma familia (o la misma pregunta de la
     lección, más tarde). Cada 5 pisos, el búho guardián pone un enigma doble.
   - Progreso (sala): localStorage juegos3d.torre {grado, idioma, familias, calma, mudo, records: {grado: piso}}.
     puente.js lo separa por usuario. En modo lección no se guarda nada y al final se avisa a la lección.
   Depuración: window.__torre (estado, responder(i), correcta()). */
(function () {
'use strict';
const $ = id => document.getElementById(id);
const E = window.Enigmas, LJ = window.LeccionJuego;
const CLAVE = 'juegos3d.torre';
const leer = () => { try { return JSON.parse(localStorage.getItem(CLAVE)) || {}; } catch (e) { return {}; } };
const prefs = leer(); if (!prefs.records || typeof prefs.records !== 'object') prefs.records = {};
const guardar = () => { if (LEC) return; try { localStorage.setItem(CLAVE, JSON.stringify(prefs)); } catch (e) { /* sin almacenamiento */ } };
const barajar = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const BIBLIO = /^(localhost|127\.0\.0\.1)$/.test(location.hostname) ? 'http://localhost:8765/' : 'https://biblioteca.micolevirtual.com/';
const FAMS = Object.keys(E.FAMILIAS);
const reducir = matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------- modo lección: lo que manda la lección ---------- */
const CFG = LJ && LJ.activo && LJ.cfg ? LJ.cfg : null;
const LEC = (() => {
  if (!CFG) return null;
  const preguntas = (Array.isArray(CFG.preguntas) ? CFG.preguntas : []).filter(q => q && typeof q.p === 'string' && q.p.trim() && Array.isArray(q.opciones)
    && q.opciones.length >= 2 && q.opciones.length <= 4 && q.opciones.every(o => typeof o === 'string' || typeof o === 'number') && Number.isInteger(q.correcta) && q.correcta >= 0 && q.correcta < q.opciones.length)
    .map(q => ({ p: q.p.trim(), opciones: q.opciones.map(o => String(o).trim()), correcta: q.correcta, oir: typeof q.oir === 'string' ? q.oir.trim() : '', explicacion: q.explicacion }));
  const palabras = (Array.isArray(CFG.palabras) ? CFG.palabras : []).filter(p => p && typeof p.en === 'string' && p.en.trim() && typeof p.es === 'string' && p.es.trim())
    .map(p => ({ en: p.en.trim(), es: p.es.trim(), emoji: typeof p.emoji === 'string' ? p.emoji.trim() : '' }));
  const familias = (Array.isArray(CFG.familias) ? CFG.familias : []).filter(f => FAMS.includes(f));
  if (!preguntas.length && !palabras.length && !familias.length) { console.warn('[torre] la lección no mandó preguntas, palabras ni familias: va la sala'); return null; }
  const grado = clamp(parseInt(CFG.grado, 10) || 5, 1, 11);
  return { titulo: (LJ.titulo || '').trim(), preguntas, palabras, familias, grado, idioma: palabras.length || preguntas.some(q => q.oir) ? 'en' : 'es' };
})();
// La dificultad (FORMATO.md §3.9.1): facil | media | normal. Este juego no tiene vidas ni reloj: nunca se pierde.
// facil: un nivel más fácil y la pista en todos los pisos; media: la pista en todos los pisos; normal: la pista sólo en
// los de figuras (como dice la ficha). En la lección la manda el cfg; en la sala, el grado (1.º–2.º, 3.º–5.º, 6.º en adelante).
function dificultad(grado) {
  let modo = CFG && ['facil', 'media', 'normal'].includes(CFG.dificultad) ? CFG.dificultad : null;
  if (!modo) modo = CFG ? 'normal' : grado <= 2 ? 'facil' : grado <= 5 ? 'media' : 'normal';
  return { modo, ayudas: Infinity, todas: modo !== 'normal', nivel: modo === 'facil' ? -1 : 0 };
}
const VOZ = (() => {
  const v = CFG && typeof CFG.voz === 'string' && CFG.voz.trim() ? CFG.voz.trim() : BIBLIO + 'voz/';
  return /\/$/.test(v) ? v : v + '/';
})();

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
  function ruido(t, dur, vol, fc) {
    const c = mudo ? null : ac(); if (!c) return;
    const b = c.createBuffer(1, Math.floor(c.sampleRate * dur), c.sampleRate), d = b.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / d.length);
    const s = c.createBufferSource(), f = c.createBiquadFilter(), g = c.createGain(); s.buffer = b; f.type = 'lowpass'; f.frequency.value = fc || 600; g.gain.value = vol || 0.12;
    s.connect(f).connect(g).connect(c.destination); s.start(c.currentTime + t);
  }
  return {
    get mudo() { return mudo; }, poner(b) { mudo = !!b; }, despertar: ac,
    bien() { [523, 659, 784].forEach((f, i) => tono(f, i * 0.09, 0.25, 'triangle', 0.16)); },
    mal() { tono(260, 0, 0.3, 'sine', 0.12, 190); },
    puerta() { ruido(0, 0.6, 0.18, 420); tono(110, 0.05, 0.5, 'sawtooth', 0.03, 70); },
    subir() { tono(330, 0.1, 0.9, 'sine', 0.06, 660); },
    buho() { tono(430, 0, 0.32, 'sine', 0.13, 380); tono(410, 0.42, 0.55, 'sine', 0.13, 340); },
    gran() { [523, 659, 784, 1047, 1319].forEach((f, i) => tono(f, i * 0.1, 0.4, 'triangle', 0.13)); },
    clic() { tono(880, 0, 0.05, 'square', 0.03); }
  };
})();

/* ---------- la voz en inglés: sólo MP3 grabados ---------- */
const Voz = (() => {
  let lista = null, audio = null, n = 0;
  const listo = fetch(VOZ + 'en/index.json', { credentials: 'omit' }).then(r => (r.ok ? r.json() : [])).then(a => { lista = new Set(Array.isArray(a) ? a : []); })
    .catch(() => { lista = new Set(); });
  // nombreDelAudio de app2 (voz-grabada.ts): minúsculas, lo que no es letra o número → «-»; más de 200, 80 letras + FNV-1a
  function slug(t) {
    const s = String(t).trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
    if (s.length <= 200) return s;
    let h = 0x811c9dc5; for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 0x01000193) >>> 0;
    return s.slice(0, 80) + '-' + h.toString(16).padStart(8, '0');
  }
  const voces = CFG && CFG.voces && typeof CFG.voces === 'object' ? CFG.voces : {};
  const carpeta = s => (typeof voces[s] === 'string' && /^[a-z-]+$/.test(voces[s]) ? voces[s] : null);
  const tiene = t => { if (t == null || !String(t).trim()) return false; const s = slug(t); return !!carpeta(s) || !!(lista && lista.has(s)); };
  function callar() { n++; if (audio) { audio.onended = audio.onerror = null; audio.pause(); audio = null; } }
  function decir(textos, cadaUno, fin) {
    callar();
    const mio = n, ts = [].concat(textos || []).filter(tiene);
    if (Snd.mudo || !ts.length) { if (fin) fin(); return false; }
    let i = 0;
    const sig = () => {
      if (mio !== n) return;
      if (i >= ts.length) { if (cadaUno) cadaUno(-1); if (fin) fin(); return; }
      const k = i++; if (cadaUno) cadaUno(k, ts[k]);
      const s = slug(ts[k]), dirs = [carpeta(s), lista && lista.has(s) ? 'en' : null].filter(Boolean);
      const probar = j => {
        const a = new Audio(VOZ + dirs[j] + '/' + s + '.mp3'); audio = a;
        const f = () => { a.onended = a.onerror = null; if (audio === a) audio = null; setTimeout(sig, 220); };
        a.onended = f; a.onerror = () => { if (mio === n && j + 1 < dirs.length) probar(j + 1); else f(); }; a.play().catch(() => {});
      };
      probar(0);
    };
    sig(); return true;
  }
  return { listo, tiene, decir, callar };
})();
// Una frase de la lección en inglés: entera si está grabada; si no, sus palabras con contenido que estén grabadas.
const VACIAS = new Set('a an the is are am to as of and or in on at it its be was were do does did what which who how this that these those for with'.split(' '));
function vozDeFrase(p) {
  const limpio = String(p).replace(/[…_]+/g, ' ').replace(/\.\.\./g, ' ').trim();
  if (Voz.tiene(limpio)) return [limpio];
  return (limpio.toLowerCase().match(/[a-z']+/g) || []).filter(w => !VACIAS.has(w) && Voz.tiene(w)).slice(0, 4);
}
function pareceIngles(p) {
  const ws = String(p).toLowerCase().match(/[a-záéíóúñ']+/g) || [];
  if (!ws.length || /[áéíóúñ¿¡]/i.test(p)) return false;
  return ws.filter(w => Voz.tiene(w) || VACIAS.has(w)).length / ws.length >= 0.6;
}

/* ---------- dibujar las piezas ---------- */
const COL = { circulo: '#1f5fbf', cuadrado: '#b8460b', triangulo: '#137a3a', rombo: '#7a2bbf', estrella: '#8f5400', hexagono: '#b3123f' };
(function defs() {
  const d = document.createElementNS('http://www.w3.org/2000/svg', 'svg'); d.setAttribute('aria-hidden', 'true'); d.style.cssText = 'position:absolute;width:0;height:0';
  d.innerHTML = '<defs>' + Object.keys(COL).map(k => '<pattern id="ray-' + k + '" patternUnits="userSpaceOnUse" width="9" height="9" patternTransform="rotate(45)"><rect width="9" height="9" fill="#fff"/><rect width="4.5" height="9" fill="' + COL[k] + '"/></pattern>').join('')
    + '<clipPath id="mitad" clipPathUnits="objectBoundingBox"><rect width="0.5" height="1"/></clipPath></defs>';
  document.body.appendChild(d);
})();
function forma(f, cx, cy, r) {
  const pts = (n, a0, rr) => Array.from({ length: n }, (_, i) => { const a = a0 + (i / n) * Math.PI * 2; return (cx + Math.cos(a) * (rr || r)).toFixed(1) + ',' + (cy + Math.sin(a) * (rr || r)).toFixed(1); }).join(' ');
  switch (f) {
    case 'circulo': return '<circle cx="' + cx + '" cy="' + cy + '" r="' + (r * 0.92).toFixed(1) + '"';
    case 'cuadrado': { const s = r * 0.82; return '<rect x="' + (cx - s).toFixed(1) + '" y="' + (cy - s).toFixed(1) + '" width="' + (2 * s).toFixed(1) + '" height="' + (2 * s).toFixed(1) + '"'; }
    case 'triangulo': return '<polygon points="' + pts(3, -Math.PI / 2, r * 1.05).replace(/,(\S+)/g, (m, y) => ',' + (+y + r * 0.15).toFixed(1)) + '"';
    case 'rombo': return '<polygon points="' + cx + ',' + (cy - r) + ' ' + (cx + r * 0.72) + ',' + cy + ' ' + cx + ',' + (cy + r) + ' ' + (cx - r * 0.72) + ',' + cy + '"';
    case 'hexagono': return '<polygon points="' + pts(6, 0, r * 0.95) + '"';
    default: { const p = []; for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + (i / 10) * Math.PI * 2, rr = i % 2 ? r * 0.45 : r; p.push((cx + Math.cos(a) * rr).toFixed(1) + ',' + (cy + Math.sin(a) * rr).toFixed(1)); } return '<polygon points="' + p.join(' ') + '"'; }
  }
}
function svgFig(f) {
  const k = { p: 0.55, m: 0.78, g: 1 }[f.tam] || 0.78, c = COL[f.forma] || '#24386e', n = f.n || 1;
  const pos = n === 1 ? [[50, 50, 44 * k]] : n === 2 ? [[28, 50, 22 * k + 2], [72, 50, 22 * k + 2]] : n === 3 ? [[50, 27, 21 * k + 1], [27, 70, 21 * k + 1], [73, 70, 21 * k + 1]] : [[28, 28, 19 * k], [72, 28, 19 * k], [28, 72, 19 * k], [72, 72, 19 * k]];
  const sw = n === 1 ? 6 : 5;
  const una = ([x, y, r]) => {
    const base = forma(f.forma, x, y, r);
    if (f.relleno === 'medio') return base + ' fill="#fff" stroke="' + c + '" stroke-width="' + sw + '" stroke-linejoin="round"/>' + base + ' fill="' + c + '" clip-path="url(#mitad)"/>';
    const fill = f.relleno === 'lleno' ? c : f.relleno === 'rayas' ? 'url(#ray-' + f.forma + ')' : '#fff';
    return base + ' fill="' + fill + '" stroke="' + c + '" stroke-width="' + sw + '" stroke-linejoin="round"/>';
  };
  return '<svg viewBox="0 0 100 100" aria-hidden="true" focusable="false">' + pos.map(una).join('') + '</svg>';
}
function svgFlecha(p) {
  const lleno = p.relleno !== 'vacio';
  return '<svg viewBox="0 0 100 100" aria-hidden="true" focusable="false"><g transform="rotate(' + p.giro + ' 50 50)"><path d="M50 8 L84 46 H62 V92 H38 V46 H16 Z" fill="' + (lleno ? '#24386e' : '#fff') + '" stroke="#24386e" stroke-width="6" stroke-linejoin="round"/></g></svg>';
}
function svgVista(p) {
  let s = '';
  if (p.kind === 'arriba') {
    for (let y = 0; y < 3; y++) for (let x = 0; x < 3; x++) s += '<rect x="' + (8 + x * 28) + '" y="' + (4 + y * 28) + '" width="26" height="26" rx="2" fill="' + (p.m[y][x] ? '#24386e' : '#fff') + '" stroke="' + (p.m[y][x] ? '#24386e' : '#9aa6c4') + '" stroke-width="2"/>';
    s += '<text x="50" y="106" text-anchor="middle" font-size="15" font-weight="800" fill="#3b4766">▲ frente</text>';
    return '<svg class="vista" viewBox="0 0 100 110" aria-hidden="true" focusable="false">' + s + '</svg>';
  }
  for (let x = 0; x < 3; x++) for (let z = 0; z < 3; z++) {
    const on = p.m[x] > z;
    s += '<rect x="' + (8 + x * 28) + '" y="' + (62 - z * 28) + '" width="26" height="26" rx="2" fill="' + (on ? '#24386e' : 'none') + '" stroke="' + (on ? '#24386e' : '#dfe4f0') + '" stroke-width="2"' + (on ? '' : ' stroke-dasharray="3 3"') + '/>';
  }
  s += '<line x1="2" y1="91" x2="98" y2="91" stroke="#3b4766" stroke-width="3"/>';
  return '<svg class="vista" viewBox="0 0 100 96" aria-hidden="true" focusable="false">' + s + '</svg>';
}
function svgCubos(h) {
  const s = 20, cx = 0.866 * s, sy = 0.5 * s;
  const P = (x, y, z) => [(x - y) * cx, (x + y) * sy - z * s];
  const poly = (pts, fill) => '<polygon points="' + pts.map(p => p[0].toFixed(1) + ',' + p[1].toFixed(1)).join(' ') + '" fill="' + fill + '" stroke="#1d2b53" stroke-width="1.5" stroke-linejoin="round"/>';
  let out = '';
  for (let y = 0; y < 3; y++) for (let x = 0; x < 3; x++) out += poly([P(x, y, 0), P(x + 1, y, 0), P(x + 1, y + 1, 0), P(x, y + 1, 0)], '#e9edf7');
  const cubos = [];
  for (let y = 0; y < 3; y++) for (let x = 0; x < 3; x++) for (let z = 0; z < h[y][x]; z++) cubos.push([x, y, z]);
  cubos.sort((a, b) => (a[0] + a[1]) - (b[0] + b[1]) || a[2] - b[2]);
  for (const [x, y, z] of cubos) {
    out += poly([P(x, y + 1, z), P(x + 1, y + 1, z), P(x + 1, y + 1, z + 1), P(x, y + 1, z + 1)], '#7d95d6');
    out += poly([P(x + 1, y, z), P(x + 1, y + 1, z), P(x + 1, y + 1, z + 1), P(x + 1, y, z + 1)], '#4a63a8');
    out += poly([P(x, y, z + 1), P(x + 1, y, z + 1), P(x + 1, y + 1, z + 1), P(x, y + 1, z + 1)], '#c9d6ff');
  }
  const f = P(1.5, 3, 0), d = P(3, 1.5, 0);
  out += '<text x="' + (f[0] - 16).toFixed(1) + '" y="' + (f[1] + 22).toFixed(1) + '" text-anchor="middle" font-size="12" font-weight="800" fill="#1d2b53">▲ frente</text>';
  out += '<text x="' + (d[0] + 16).toFixed(1) + '" y="' + (d[1] + 22).toFixed(1) + '" text-anchor="middle" font-size="12" font-weight="800" fill="#1d2b53">derecha ▲</text>';
  const minX = P(0, 3, 0)[0] - 40, maxX = P(3, 0, 0)[0] + 40, minY = P(0, 0, 3)[1] - 6, maxY = P(3, 3, 0)[1] + 30;
  return '<svg viewBox="' + minX.toFixed(0) + ' ' + minY.toFixed(0) + ' ' + (maxX - minX).toFixed(0) + ' ' + (maxY - minY).toFixed(0) + '" aria-hidden="true" focusable="false">' + out + '</svg>';
}
function svgBalanza(b) {
  const lado = (items, x) => {
    let s = '', y = 52;
    items.forEach(it => {
      if (it.kg != null) { s += '<rect x="' + (x - 30) + '" y="' + (y - 26) + '" width="60" height="28" rx="6" fill="#24386e"/><text x="' + x + '" y="' + (y - 7) + '" text-anchor="middle" font-size="17" font-weight="800" fill="#fff">' + it.kg + ' kg</text>'; y -= 30; return; }
      if (it.q) { s += '<circle cx="' + x + '" cy="' + (y - 14) + '" r="15" fill="#f7f3ff" stroke="#6d4bd1" stroke-width="3" stroke-dasharray="5 3"/><text x="' + x + '" y="' + (y - 7) + '" text-anchor="middle" font-size="20" font-weight="800" fill="#6d4bd1">?</text>'; y -= 32; return; }
      const n = it.n, porFila = n > 3 ? 3 : n, filas = Math.ceil(n / porFila);
      for (let f = 0; f < filas; f++) { const k = Math.min(porFila, n - f * porFila); for (let i = 0; i < k; i++) s += '<text x="' + (x + (i - (k - 1) / 2) * 22).toFixed(1) + '" y="' + (y - f * 23) + '" text-anchor="middle" font-size="23">' + it.e + '</text>'; }
      y -= filas * 23 + 4;
    });
    tope = Math.min(tope, y - 4);
    return s;
  };
  let tope = 20;
  const izq = lado(b.izq, 52), der = lado(b.der, 198), y0 = Math.floor(tope);
  return '<svg viewBox="0 ' + y0 + ' 250 ' + (110 - y0) + '" aria-hidden="true" focusable="false"><polygon points="125,72 112,100 138,100" fill="#8d8478"/><rect x="20" y="66" width="210" height="6" rx="3" fill="#6e655b"/>'
    + '<path d="M20 70 q32 10 64 0" fill="none" stroke="#6e655b" stroke-width="4"/><path d="M166 70 q32 10 64 0" fill="none" stroke="#6e655b" stroke-width="4"/>'
    + '<text x="125" y="58" text-anchor="middle" font-size="22" font-weight="800" fill="#1d2b53">=</text>' + izq + der + '</svg>';
}
function htmlPieza(p, enOpcion) {
  switch (p.t) {
    case 'fig': return svgFig(p);
    case 'flecha': return svgFlecha(p);
    case 'vista': return svgVista(p);
    case 'emo': return '<span class="emo" aria-hidden="true">' + esc(p.e || '') + '</span>' + (p.s ? '<span' + (p.en ? ' lang="en"' : '') + '>' + esc(p.s) + '</span>' : '');
    case 'num': return '<span>' + esc(p.s) + '</span>';
    default: return '<span' + (p.en ? ' lang="en"' : '') + (p.mono ? ' class="mono"' : '') + '>' + esc(p.s) + '</span>';
  }
}
function tile(p) {
  if (p.t === 'hueco') return '<div class="tile hueco" aria-hidden="true">?</div>';
  const voz = p.en && p.s ? ' data-voz="' + esc(p.s) + '"' : '';
  if (p.t === 'fig' || p.t === 'flecha') return '<div class="tile" aria-hidden="true">' + (p.t === 'fig' ? svgFig(p) : svgFlecha(p)) + '</div>';
  if (p.t === 'emo') return '<div class="tile emo con-rot"' + voz + ' aria-hidden="true"><span>' + esc(p.e) + '</span><span class="rot"' + (p.en ? ' lang="en"' : '') + '>' + esc(p.s) + '</span></div>';
  return '<div class="tile ancho"' + voz + ' aria-hidden="true"' + (p.en ? ' lang="en"' : '') + '>' + esc(p.s) + '</div>';
}
function dibujarVisual(e) {
  const v = e.visual, cont = $('cVis');
  cont.removeAttribute('role'); cont.removeAttribute('aria-label');
  if (!v) { cont.innerHTML = ''; return; }
  let html = '', d = '';
  const lista = its => its.map(p => p.d).join(', ');
  if (v.kind === 'fila') { html = v.items.map(tile).join(''); d = 'Serie: ' + lista(v.items) + '.'; }
  else if (v.kind === 'matriz') {
    html = '<div class="matriz">' + v.celdas.map(tile).join('') + '</div>';
    d = 'Cuadrícula de 3 por 3. ' + [0, 1, 2].map(r => 'Fila ' + (r + 1) + ': ' + lista(v.celdas.slice(r * 3, r * 3 + 3))).join('. ') + '.';
  } else if (v.kind === 'analogia') {
    html = tile(v.a) + '<span class="sep">es a</span>' + tile(v.b) + '<span class="sep">como</span>' + tile(v.c) + '<span class="sep">es a</span>' + tile({ t: 'hueco' });
    d = v.a.d + ' es a ' + v.b.d + ' como ' + v.c.d + ' es a… ¿qué?';
  } else if (v.kind === 'balanzas') {
    html = '<div class="balanzas">' + v.platos.map(svgBalanza).join('') + '</div>';
    d = v.platos.map(b => 'Balanza: ' + b.izq.map(x => x.d).join(' y ') + ' pesan lo mismo que ' + b.der.map(x => x.d).join(' y ')).join('. ') + '.';
  } else if (v.kind === 'codigo') {
    const fila = (a, b) => '<div><span>' + esc(a) + '</span><span class="flecha" aria-hidden="true">→</span><span>' + esc(b) + '</span></div>';
    html = '<div class="codigo">' + v.ejemplos.map(([a, b]) => fila(a, b)).join('') + fila(v.palabra, '?') + '</div>';
    if (v.abc) html += '<div class="abc" aria-hidden="true">' + 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').map((ch, i) => '<span>' + ch + '<i>' + (i + 1) + '</i></span>').join('') + '</div>';
    d = v.ejemplos.map(([a, b]) => a.split('').join(' ') + ' se escribe ' + b.split('').join(' ')).join('. ') + '. ¿Cómo se escribe ' + v.palabra.split('').join(' ') + '?';
  } else if (v.kind === 'cubos') {
    html = '<div class="cubos">' + svgCubos(v.h) + '</div>';
    const filas = ['Atrás', 'En medio', 'Al frente'];
    d = 'Montón de cubos sobre una cuadrícula de 3 por 3. Alturas de izquierda a derecha. ' + v.h.map((f, y) => filas[y] + ': ' + f.join(', ')).join('. ') + '.';
  } else if (v.kind === 'escucha') {
    html = '<button type="button" class="escucha" id="bEscucha"><span aria-hidden="true">🔊</span> Escucha</button>';
  } else if (v.kind === 'pieza') { html = tile(v.p); d = v.p.d; }
  cont.innerHTML = html;
  if (d) { cont.setAttribute('role', 'img'); cont.setAttribute('aria-label', d); }
  const be = $('bEscucha'); if (be) be.onclick = () => oir();
}

/* ---------- estado ---------- */
const BASE = [0, 1, 1, 2, 3, 3, 4, 5, 6, 6, 7, 8];
const S = {
  modo: LEC ? 'leccion' : 'sala', grado: clamp(+prefs.grado || 3, 1, 11), idioma: prefs.idioma === 'en' ? 'en' : 'es',
  familias: Array.isArray(prefs.familias) && prefs.familias.filter(f => FAMS.includes(f)).length ? prefs.familias.filter(f => FAMS.includes(f)) : FAMS.slice(),
  calma: prefs.calma != null ? !!prefs.calma : reducir, piso: 1, pisoMax: 1, enigma: null, respondido: false, pistaUsada: false, pistas: 0,
  guardian: null, ajuste: {}, bolsa: [], aciertos: 0, primera: 0, fallos: 0, total: 0, fallasEste: 0, jugando: false, terminado: false, cola: [], dif: null, timer: 0
};
if (LEC) { S.grado = LEC.grado; S.idioma = LEC.idioma; }
S.dif = dificultad(S.grado);

let torre = null;
try { if (window.Torre3D && window.Torre3D.disponible) torre = window.Torre3D.crear($('gl'), { biblio: BIBLIO, calma: S.calma }); }
catch (e) { console.warn('Torre: sin 3D (' + e.message + '): se juega con el fondo plano.'); torre = null; }
if (!torre) document.body.style.background = 'linear-gradient(#9fd3ff, #6d7fd6)';

function nivelDe(fam) {
  const b = BASE[S.grado];
  const sube = S.modo === 'sala' ? Math.min(4, Math.floor((S.piso - 1) / 6)) : 0;
  return clamp(b + sube + Math.round(S.ajuste[fam] || 0) + S.dif.nivel, 1, 10);
}
function deLaBolsa() {
  if (!S.bolsa.length) S.bolsa = barajar(S.familias);
  return S.bolsa.shift();
}
function generar(fam) { return E.generar(fam, nivelDe(fam), { idioma: S.idioma }); }

/* ---------- enigmas de la lección ---------- */
const RESERVA = [{ en: 'one', es: 'uno', emoji: '1️⃣' }, { en: 'cat', es: 'gato', emoji: '🐱' }, { en: 'dog', es: 'perro', emoji: '🐶' }, { en: 'apple', es: 'manzana', emoji: '🍎' },
  { en: 'sun', es: 'sol', emoji: '☀️' }, { en: 'red', es: 'rojo', emoji: '🔴' }, { en: 'house', es: 'casa', emoji: '🏠' }, { en: 'water', es: 'agua', emoji: '💧' }];
const otrasPalabras = w => barajar(LEC.palabras.filter(x => x.en.toLowerCase() !== w.en.toLowerCase() && x.es.toLowerCase() !== w.es.toLowerCase()))
  .concat(barajar(RESERVA.filter(x => !LEC.palabras.some(y => y.en.toLowerCase() === x.en || y.es.toLowerCase() === x.es))));
function conOpciones(e, buena, malas) {
  const vistas = new Set([E.clave(buena)]), ok = [];
  for (const m of malas) { const k = E.clave(m); if (!vistas.has(k)) { vistas.add(k); ok.push(m); } if (ok.length === 3) break; }
  e.opciones = barajar([buena].concat(ok)); e.correcta = e.opciones.indexOf(buena); return e;
}
const piezaEs = w => ({ t: 'emo', e: w.emoji || '', s: w.es, d: w.es + (w.emoji ? '' : '') });
const piezaEn = w => ({ t: 'txt', s: w.en, en: true, d: w.en });
function enigmaPalabra(w, sub) {
  const otras = otrasPalabras(w);
  if (sub === 'escucha' && !Voz.tiene(w.en)) sub = 'lee';
  if (sub === 'codigo' && !(/^[a-z]{3,8}$/i.test(w.en) && otras.some(o => /^[a-z]{3,8}$/i.test(o.en)))) sub = 'traduce';
  if (sub === 'analogia' && !otras.length) sub = 'traduce';
  const e = { familia: 'leccion', tipo: sub, figuras: false };
  if (sub === 'escucha' || sub === 'lee') {
    e.pregunta = sub === 'escucha' ? '¿Qué escuchaste?' : '¿Qué significa «' + w.en + '»?'; e.preguntaEn = sub === 'escucha' ? 'What did you hear?' : null;
    e.visual = sub === 'escucha' ? { kind: 'escucha' } : { kind: 'pieza', p: piezaEn(w) };
    e.voz = [w.en]; e.explica = '«' + w.en + '» es «' + w.es + '»' + (w.emoji ? ' ' + w.emoji : '') + '.';
    return conOpciones(e, piezaEs(w), otras.map(piezaEs));
  }
  if (sub === 'traduce') {
    e.pregunta = '¿Cómo se dice en inglés?'; e.preguntaEn = 'How do you say it in English?';
    e.visual = { kind: 'pieza', p: { t: w.emoji ? 'emo' : 'txt', e: w.emoji, s: w.es, d: w.es } };
    e.vozRespuesta = w.en; e.explica = '«' + w.es + '» en inglés es «' + w.en + '».';
    return conOpciones(e, piezaEn(w), otras.map(piezaEn));
  }
  if (sub === 'analogia') {
    const m = otras[0];
    e.pregunta = '«' + m.en + '» es a «' + m.es + '» como «' + w.en + '» es a…'; e.preguntaEn = null;
    e.visual = { kind: 'analogia', a: piezaEn(m), b: { t: 'txt', s: m.es, d: m.es }, c: piezaEn(w) };
    e.voz = [m.en, w.en]; e.explica = 'Cada palabra va con su traducción: «' + w.en + '» es «' + w.es + '».';
    return conOpciones(e, { t: 'txt', s: w.es, d: w.es }, otras.slice(1).concat(otras[0]).map(x => ({ t: 'txt', s: x.es, d: x.es })));
  }
  // código: cada letra una más en el abecedario, con otra palabra de la lección de ejemplo
  const ej = otras.find(o => /^[a-z]{3,8}$/i.test(o.en)), k = S.grado <= 4 ? 1 : 2;
  const W = w.en.toUpperCase(), X = ej.en.toUpperCase(), cod = s => E._.corre(s, k);
  e.pregunta = '¿Cómo se escribe «' + W + '» en el código?'; e.preguntaEn = 'How do you write ' + W + ' in code?';
  e.visual = { kind: 'codigo', ejemplos: [[X, cod(X)]], palabra: W, abc: true }; e.codigo = true;
  e.vozRespuesta = w.en; e.explica = 'Cada letra se corre ' + (k === 1 ? 'una letra' : k + ' letras') + ' hacia adelante: «' + W + '» queda ' + cod(W) + '.';
  const t = s => ({ t: 'txt', s, d: s.split('').join(' '), mono: true });
  return conOpciones(e, t(cod(W)), [t(E._.corre(W, k + 1)), t(E._.corre(W, k - 1 || -1)), t(E._.alReves(cod(W))), t(E._.corre(W, -k))]);
}
function enigmaPregunta(q) {
  const en = LEC.idioma === 'en' || pareceIngles(q.p);
  const idx = barajar(q.opciones.map((_, i) => i));
  const ops = idx.map(i => { const s = String(q.opciones[i]); return { t: 'txt', s, d: s, en: en && pareceIngles(s) }; });
  const buena = String(q.opciones[q.correcta]);
  // con `oir`: el botón «Escucha» si está grabado; si no, la palabra escrita (nada depende sólo del sonido)
  const visual = q.oir ? (Voz.tiene(q.oir) ? { kind: 'escucha' } : { kind: 'pieza', p: { t: 'txt', s: q.oir, en: true, d: q.oir } }) : null;
  return { familia: 'leccion', tipo: 'pregunta', pregunta: q.p, visual, opciones: ops, correcta: idx.indexOf(q.correcta), figuras: false,
    voz: q.oir ? [q.oir] : en ? vozDeFrase(q.p) : null, vozRespuesta: en && Voz.tiene(buena) ? buena : null,
    explica: (typeof q.explicacion === 'string' && q.explicacion.trim() ? q.explicacion.trim() + ' ' : '') + 'La respuesta es «' + buena + '».' };
}
function armarCola() {
  const c = [], ps = barajar(LEC.preguntas);
  if (ps.length) ps.forEach((q, i) => { c.push({ k: 'pregunta', q }); if (LEC.familias.length && i % 2 === 0) c.push({ k: 'gen', f: LEC.familias[(i / 2) % LEC.familias.length] }); });
  if (LEC.palabras.length) {
    const ws = barajar(LEC.palabras), total = clamp(ws.length * 2, 6, 12), subs = ['traduce', 'analogia', 'codigo'];
    for (let i = 0; i < total; i++) c.push({ k: 'palabra', w: ws[i % ws.length], sub: i < ws.length ? 'escucha' : subs[(i - ws.length) % subs.length] });
    if (ps.length) { /* palabras y preguntas: se mezclan */ const m = barajar(c); c.length = 0; c.push(...m); }
  }
  if (!c.length) for (let i = 0; i < 8; i++) c.push({ k: 'gen', f: LEC.familias[i % LEC.familias.length] });
  return c;
}
function deLaCola(item) {
  if (item.k === 'pregunta') return enigmaPregunta(item.q);
  if (item.k === 'palabra') return enigmaPalabra(item.w, item.sub);
  return generar(item.f);
}

/* ---------- la carta ---------- */
const FAM_NOMBRE = f => (f === 'leccion' ? '📘 La lección' : E.FAMILIAS[f].icono + ' ' + E.FAMILIAS[f].nombre);
let voces = [];
function mostrar(e) {
  S.enigma = e; S.respondido = false; S.pistaUsada = false; S.fallasEste = 0;
  clearTimeout(S.timer);
  $('carta').classList.remove('oculto'); $('carta').scrollTop = 0;
  $('cFam').textContent = FAM_NOMBRE(e.familia) + ' · Piso ' + S.piso;
  const g = $('cGuard');
  if (S.guardian) { g.textContent = '🦉 El guardián: enigma ' + S.guardian.paso + ' de 2'; g.classList.remove('oculto'); }
  else if (S.modo === 'leccion' && S.cola.length === 0) { g.textContent = '🦉 Último piso'; g.classList.remove('oculto'); }
  else g.classList.add('oculto');
  const ingles = (S.idioma === 'en' || e.familia === 'leccion') && e.preguntaEn;
  $('cPreg').textContent = ingles ? e.preguntaEn : e.pregunta;
  $('cPreg').setAttribute('lang', ingles ? 'en' : 'es');
  $('cSub').textContent = ingles ? e.pregunta : '';
  $('cSub').classList.toggle('oculto', !ingles);
  dibujarVisual(e);
  const ops = $('cOps'); ops.innerHTML = '';
  e.opciones.forEach((p, i) => {
    const d = document.createElement('div'); d.className = 'op';
    const b = document.createElement('button'); b.type = 'button'; b.className = 'elegir';
    b.setAttribute('aria-label', 'Opción ' + (i + 1) + ': ' + p.d);
    if (e.codigo && p.t === 'txt') p.mono = true;
    b.innerHTML = '<kbd aria-hidden="true">' + (i + 1) + '</kbd><span class="cont' + (p.t === 'emo' ? ' col' : '') + '">' + htmlPieza(p, true) + '</span><span class="marca" aria-hidden="true"></span>';
    b.onclick = () => responder(i);
    d.appendChild(b);
    if (p.en && Voz.tiene(p.s)) {
      const o = document.createElement('button'); o.type = 'button'; o.className = 'oir-op'; o.textContent = '🔊';
      o.setAttribute('aria-label', 'Escuchar ' + p.s); o.onclick = ev => { ev.stopPropagation(); Voz.decir([p.s]); };
      d.appendChild(o);
    }
    ops.appendChild(d);
  });
  ops.setAttribute('aria-label', 'Opciones: elige con ' + e.opciones.map((_, i) => i + 1).join(', ').replace(/, (\d)$/, ' o $1'));
  $('cFeed').className = 'feed'; $('cFeed').innerHTML = '';
  voces = [].concat(e.voz || []).filter(t => Voz.tiene(t));
  $('bOir').classList.toggle('oculto', !voces.length);
  actualizarPista();
  hud();
  anunciar('Piso ' + S.piso + '. ' + FAM_NOMBRE(e.familia).replace(/^\S+ /, '') + '. ' + $('cPreg').textContent);
  ajustarHueco();
  $('cPreg').setAttribute('tabindex', '-1');
  try { $('cPreg').focus({ preventScroll: true }); } catch (err) { /* nada */ }
  if (voces.length) setTimeout(() => { if (S.enigma === e && !S.respondido) oir(); }, 450);
}
function oir() {
  if (!voces.length) return;
  const tiles = [...$('cVis').querySelectorAll('[data-voz]')];
  Voz.decir(voces, (k, t) => { tiles.forEach(x => x.classList.toggle('suena', k >= 0 && x.dataset.voz.toLowerCase() === String(t).toLowerCase())); });
}
function puedePista() {
  const e = S.enigma;
  if (!e || S.respondido || S.pistaUsada || e.opciones.length < 3) return false;
  if (!(e.figuras || S.dif.todas)) return false;
  return S.pistas < S.dif.ayudas;
}
function actualizarPista() {
  const b = $('bPista'), e = S.enigma, aplica = e && (e.figuras || S.dif.todas) && S.dif.ayudas > 0 && e.opciones.length >= 3;
  b.classList.toggle('oculto', !aplica);
  b.disabled = !puedePista();
}
function pista() {
  if (!puedePista()) return;
  S.pistaUsada = true; S.pistas++;
  const e = S.enigma, malas = barajar(e.opciones.map((_, i) => i).filter(i => i !== e.correcta)).slice(0, e.opciones.length >= 4 ? 2 : 1);
  const divs = $('cOps').children;
  malas.forEach(i => { divs[i].classList.add('tapada'); const b = divs[i].querySelector('.elegir'); b.disabled = true; b.setAttribute('aria-label', b.getAttribute('aria-label') + ' (tapada por la pista)'); });
  Snd.clic(); actualizarPista();
  anunciar('Pista: quedan ' + (e.opciones.length - malas.length) + ' opciones.');
  const libre = [...divs].find(d => !d.classList.contains('tapada')); if (libre) libre.querySelector('.elegir').focus();
}
function responder(i) {
  const e = S.enigma;
  if (!e || S.respondido || !S.jugando) return;
  const divs = $('cOps').children; if (!divs[i] || divs[i].classList.contains('tapada')) return;
  Snd.despertar();
  S.respondido = true; clearTimeout(S.timer);
  [...divs].forEach(d => { d.querySelector('.elegir').disabled = true; });
  const feed = $('cFeed'), bien = i === e.correcta;
  const marca = (k, cl, txt) => { divs[k].classList.add(cl); divs[k].querySelector('.marca').textContent = txt; };
  if (bien) {
    marca(i, 'bien', '✓ Sí');
    S.aciertos++; if (!S.fallasEste && !(S.modo === 'leccion' && S.actual && S.actual.fallado)) S.primera++;
    if (S.modo === 'sala') S.ajuste[e.familia] = clamp((S.ajuste[e.familia] || 0) + (S.fallasEste ? 0 : 0.35), -2, 2);
    Snd.bien();
    if (e.vozRespuesta) setTimeout(() => Voz.decir([e.vozRespuesta]), 350);
    const ultimo = S.modo === 'leccion' && !S.cola.length;
    const textoBoton = S.guardian && S.guardian.paso === 1 ? 'El segundo enigma ▶' : ultimo ? 'Terminar ▶' : 'Subir al piso ' + (S.piso + 1) + ' ▶';
    feed.className = 'feed bien';
    feed.innerHTML = '<b>¡Lo viste! ✓</b><span>' + esc(e.explica) + '</span><br><button type="button" class="bseguir" id="bSeguirE">' + textoBoton + '</button>';
    $('bSeguirE').onclick = avanzar; $('bSeguirE').focus({ preventScroll: true });
    if (!S.calma) S.timer = setTimeout(avanzar, 2600 + Math.min(2500, e.explica.length * 25));
  } else {
    marca(i, 'mal', '✗ No'); marca(e.correcta, 'bien', '✓ Era esta');
    S.fallos++; S.fallasEste++;
    if (S.modo === 'sala') S.ajuste[e.familia] = clamp((S.ajuste[e.familia] || 0) - 1, -2, 2);
    Snd.mal(); if (torre) torre.sacudir();
    const repetir = e.vozRespuesta ? [e.vozRespuesta] : voces; if (repetir.length) setTimeout(() => Voz.decir(repetir), 600);
    feed.className = 'feed mal';
    feed.innerHTML = '<b>Casi. Mira por qué:</b><span>' + esc(e.explica) + '</span><br><button type="button" class="bseguir" id="bSeguirE">' + (e.familia === 'leccion' ? 'Seguir ▶' : 'Otro enigma ▶') + '</button>';
    $('bSeguirE').onclick = otroIgual; $('bSeguirE').focus({ preventScroll: true });
    if (S.modo === 'leccion') { const it = S.actual; if (it) { if (it.k === 'gen') S.cola.unshift({ k: 'gen', f: it.f, fallado: true }); else if (it.k === 'palabra') S.cola.push({ k: 'palabra', w: it.w, sub: it.sub === 'escucha' ? 'traduce' : 'escucha', fallado: true }); else { it.fallado = true; S.cola.push(it); } } }
  }
  avisarLeccion(false);
  actualizarPista();
  anunciar((bien ? '¡Correcto! ' : 'No es esa. ') + e.explica);
  ajustarHueco();
  try { feed.scrollIntoView({ block: 'nearest', behavior: S.calma ? 'auto' : 'smooth' }); } catch (err) { /* nada */ }
}
function otroIgual() {
  clearTimeout(S.timer);
  if (S.modo === 'leccion') { siguienteLeccion(); return; }
  const e = generar(S.enigma.familia) || generar(deLaBolsa());
  mostrar(e);
}
function avanzar() {
  clearTimeout(S.timer);
  if (!S.respondido || !S.jugando) return;
  S.respondido = false;
  if (S.guardian && S.guardian.paso === 1) { S.guardian.paso = 2; Snd.buho(); mostrar(generar(S.guardian.fams[1]) || generar(deLaBolsa())); return; }
  const eraGuardian = !!S.guardian; S.guardian = null;
  if (S.modo === 'leccion' && !S.cola.length) { terminarLeccion(); return; }
  // sube: la puerta se abre, la cámara sube y la torre gira hasta la puerta del piso de arriba
  $('carta').classList.add('oculto'); ajustarHueco();
  if (eraGuardian) Snd.gran(); else Snd.puerta();
  setTimeout(() => Snd.subir(), 300);
  const sigue = () => {
    S.piso++; S.pisoMax = Math.max(S.pisoMax, S.piso);
    if (S.modo === 'sala') { const r = prefs.records[S.grado] || 0; if (S.piso > r) { prefs.records[S.grado] = S.piso; guardar(); } }
    ponerBuho();
    if (S.modo === 'leccion') siguienteLeccion(); else siguienteSala();
  };
  if (torre) torre.subir(S.piso, sigue); else setTimeout(sigue, S.calma ? 0 : 500);
}
function ponerBuho() {
  if (!torre) return;
  if (S.modo === 'leccion') { torre.buho(S.piso - 1 + S.cola.length); return; }
  torre.buho(Math.ceil(S.piso / 5) * 5 - 1);
}
function siguienteSala() {
  if (S.piso % 5 === 0) {
    const fs = barajar(S.familias), f2 = fs[1] || fs[0];
    S.guardian = { paso: 1, fams: [fs[0], f2] };
    Snd.buho();
    mostrar(generar(fs[0]));
    return;
  }
  mostrar(generar(deLaBolsa()));
}
function siguienteLeccion() {
  const it = S.cola.shift();
  if (!it) { terminarLeccion(); return; }
  S.actual = it;
  const e = deLaCola(it);
  if (!e) { siguienteLeccion(); return; }
  ponerBuho();
  mostrar(e);
}

/* ---------- empezar y terminar ---------- */
function empezar() {
  S.piso = 1; S.pisoMax = 1; S.aciertos = 0; S.primera = 0; S.fallos = 0; S.pistas = 0; S.guardian = null; S.bolsa = []; S.ajuste = {}; S.terminado = false;
  S.dif = dificultad(S.grado);
  if (torre) { torre.irA(0); torre.calma(S.calma); }
  document.body.classList.toggle('calmo', S.calma);
  $('hud').classList.remove('oculto'); $('inicio').classList.add('oculto'); $('pausa').classList.add('oculto');
  S.jugando = true;
  ponerBuho();
  if (S.modo === 'leccion') { S.cola = armarCola(); S.total = S.cola.length; siguienteLeccion(); }
  else siguienteSala();
}
// A la lección (FORMATO.md §3.9.1): progreso con cada respuesta y resultado al terminar. aciertos = a la primera.
function avisarLeccion(terminado) {
  if (S.modo !== 'leccion' || !LJ) return;
  const r = { aciertos: S.primera, total: S.total, fallos: S.fallos, nivel: 'piso ' + S.pisoMax };
  try { if (terminado) LJ.resultado(r); else LJ.progreso(r); } catch (e) { /* sin padre: nada */ }
}
function terminarLeccion() {
  S.jugando = false; S.terminado = true; clearTimeout(S.timer);
  $('carta').classList.add('oculto'); ajustarHueco();
  Snd.gran(); if (torre) torre.subir(S.piso, () => {});
  avisarLeccion(true);
  const chips = LEC.palabras.length ? LEC.palabras.slice(0, 10).map(p => p.en + ' = ' + p.es) : LEC.familias.map(f => E.FAMILIAS[f].nombre);
  LJ.logrado({ detalle: 'Subiste ' + S.piso + ' pisos de la torre. A la primera: ' + S.primera + ' de ' + S.total + '.', chips,
    alOtraVez: () => empezar() });
}

/* ---------- HUD, menús y teclado ---------- */
function hud() {
  $('hPiso').textContent = 'Piso ' + S.piso;
  $('hRecord').textContent = S.modo === 'sala' ? 'Récord en ' + S.grado + '.º: piso ' + Math.max(prefs.records[S.grado] || 1, S.piso) : (LEC.titulo || 'La lección') + ' · ' + Math.max(0, S.total - S.cola.length) + ' de ' + S.total;
  $('bSonido').setAttribute('aria-pressed', String(Snd.mudo)); $('iSonido').textContent = Snd.mudo ? '🔇' : '🔊'; $('tSonido').textContent = Snd.mudo ? 'Activar el sonido' : 'Silenciar';
  $('bCalma').setAttribute('aria-pressed', String(S.calma));
}
function anunciar(t) { const a = $('anuncio'); a.textContent = ''; setTimeout(() => { a.textContent = t; }, 30); }
function ajustarHueco() {
  if (!torre) return;
  const c = $('carta');
  if (c.classList.contains('oculto')) { torre.hueco({ x: 0, y: 0 }); return; }
  const r = c.getBoundingClientRect();
  if (innerWidth > innerHeight) torre.hueco({ x: Math.round((innerWidth - r.left) / 2), y: -20 });
  else torre.hueco({ x: 0, y: Math.round((innerHeight - r.top) / 2) });
}
addEventListener('resize', ajustarHueco);
if (window.ResizeObserver) new ResizeObserver(ajustarHueco).observe($('carta'));

function armarInicio() {
  const g = $('oGrado'); g.innerHTML = '';
  for (let i = 1; i <= 11; i++) {
    const b = document.createElement('button'); b.type = 'button'; b.textContent = i + '.º'; b.setAttribute('aria-label', 'Grado ' + i);
    b.setAttribute('aria-pressed', String(i === S.grado)); b.onclick = () => { S.grado = i; armarInicio(); Snd.clic(); }; g.appendChild(b);
  }
  [...$('oIdioma').children].forEach(b => { b.setAttribute('aria-pressed', String(b.dataset.idioma === S.idioma)); b.onclick = () => { S.idioma = b.dataset.idioma; armarInicio(); Snd.clic(); }; });
  const f = $('oFam'); f.innerHTML = '';
  FAMS.forEach(k => {
    const F = E.FAMILIAS[k], b = document.createElement('button'); b.type = 'button'; b.className = 'fam';
    b.innerHTML = '<i aria-hidden="true">' + F.icono + '</i>' + F.nombre; b.setAttribute('aria-pressed', String(S.familias.includes(k)));
    b.onclick = () => {
      const on = S.familias.includes(k);
      if (on && S.familias.length === 1) { $('tAviso').textContent = 'Deja al menos un tipo de enigma.'; return; }
      S.familias = on ? S.familias.filter(x => x !== k) : FAMS.filter(x => x === k || S.familias.includes(x));
      $('tAviso').textContent = ''; armarInicio(); Snd.clic();
    };
    f.appendChild(b);
  });
  $('oCalma').checked = S.calma;
  const r = prefs.records[S.grado];
  $('tRecord').textContent = r > 1 ? '🏆 Tu récord en ' + S.grado + '.º: piso ' + r + '.' : 'Todavía no has subido en ' + S.grado + '.º: ¡estrena la torre!';
}
$('oCalma').onchange = () => { S.calma = $('oCalma').checked; };
$('bSubir').onclick = () => {
  Snd.despertar();
  prefs.grado = S.grado; prefs.idioma = S.idioma; prefs.familias = S.familias; prefs.calma = S.calma; guardar();
  empezar();
};
function pausar() {
  if (!S.jugando) return;
  clearTimeout(S.timer);
  $('pRes').textContent = 'Vas en el piso ' + S.piso + '. Acertaste ' + S.aciertos + (S.aciertos === 1 ? ' enigma.' : ' enigmas.');
  $('bInicio').classList.toggle('oculto', S.modo === 'leccion');
  $('pausa').classList.remove('oculto'); $('bSeguir').focus();
}
$('bSeguir').onclick = () => { $('pausa').classList.add('oculto'); if (S.respondido && $('bSeguirE')) $('bSeguirE').focus(); else $('cPreg').focus(); };
$('bInicio').onclick = () => { S.jugando = false; Voz.callar(); $('pausa').classList.add('oculto'); $('carta').classList.add('oculto'); $('hud').classList.add('oculto'); ajustarHueco(); armarInicio(); $('inicio').classList.remove('oculto'); $('bSubir').focus(); };
$('bMenu').onclick = pausar;
$('bSonido').onclick = () => { Snd.poner(!Snd.mudo); if (Snd.mudo) Voz.callar(); prefs.mudo = Snd.mudo; guardar(); hud(); };
$('bCalma').onclick = () => {
  S.calma = !S.calma; prefs.calma = S.calma; guardar(); if (torre) torre.calma(S.calma); document.body.classList.toggle('calmo', S.calma);
  if (S.calma) clearTimeout(S.timer); hud(); anunciar(S.calma ? 'Modo calma: la torre quieta.' : 'Modo calma apagado.');
};
$('bPista').onclick = pista;
$('bOir').onclick = oir;

document.addEventListener('keydown', ev => {
  if (ev.ctrlKey || ev.metaKey || ev.altKey) return;
  if (document.querySelector('.lj-capa')) return;
  if (!$('pausa').classList.contains('oculto')) { if (ev.key === 'Escape') { ev.preventDefault(); $('bSeguir').click(); } return; }
  if (!S.jugando || !$('inicio').classList.contains('oculto')) return;
  const k = ev.key.toLowerCase();
  if (/^[1-4]$/.test(k)) { ev.preventDefault(); responder(+k - 1); return; }
  if (k === 'escape') { ev.preventDefault(); pausar(); return; }
  if (k === 'p') { pista(); return; }
  if (k === 'o') { oir(); return; }
  if (k === 's') { $('bSonido').click(); return; }
  if (k === 'c') { $('bCalma').click(); return; }
  if (k.startsWith('arrow')) {
    const bs = [...$('cOps').querySelectorAll('.elegir:not(:disabled)')]; if (!bs.length) return;
    const i = bs.indexOf(document.activeElement), d = k === 'arrowright' || k === 'arrowdown' ? 1 : -1;
    ev.preventDefault(); bs[(i < 0 ? 0 : i + d + bs.length) % bs.length].focus();
  }
});

/* ---------- arrancar ---------- */
function listo() {
  $('cargando').classList.add('oculto');
  hud();
  if (S.modo === 'leccion') {
    const chips = LEC.palabras.length ? LEC.palabras.slice(0, 12).map(p => p.en) : LEC.familias.length && !LEC.preguntas.length ? LEC.familias.map(f => E.FAMILIAS[f].nombre) : [];
    LJ.portada({ juego: 'Torre de los Enigmas', titulo: LEC.titulo || 'Los enigmas de la lección',
      detalle: 'Sube la torre: cada puerta se abre con un enigma de la lección. Elige con 1 a 4 o tocando. Sin reloj: si fallas, ves por qué.',
      chips, chipsRotulo: LEC.palabras.length ? 'Las palabras de la lección' : 'Los enigmas',
      alJugar: () => { Snd.despertar(); empezar(); } });
  } else { armarInicio(); $('inicio').classList.remove('oculto'); $('bSubir').focus(); }
}
// la lista de MP3 llega antes de empezar (si tarda más de 2,5 s, se empieza sin ella y los MP3 aparecen al cargar)
Promise.race([Voz.listo, new Promise(r => setTimeout(r, 2500))]).then(listo);

window.__torre = { estado: S, responder, correcta: () => S.enigma && S.enigma.correcta, avanzar, empezar };
})();
