/* Mi Finca — el juego: la sala (qué practicas, grado, granjero, calma), los días de la finca, las tareas, las visitas
   con preguntas, «escucha y toca» en inglés, el mercado en pesos, la tienda, el modo lección (../leccion.js) y la voz.
   - Un día: la lista de tareas (regar, sembrar, cosechar, dar de comer, vender, y las de la lección: visitas con
     pregunta y palabras para oír y tocar). No hay reloj: el día acaba cuando se hacen las tareas y se toca 🌙.
     De noche crece lo regado. Fallar no quita nada: sale la respuesta y, en `facil` y `media`, la pregunta vuelve.
   - Inglés: sólo los MP3 grabados de la Biblioteca (<voz>/en/<slug>.mp3, o la carpeta de `voces`), en la cola de voz de
     leccion.js (un MP3 no corta a otro). «Touch the cow» si está grabado; si no, la palabra sola. A veces sólo se ve la
     bocina hasta oírla 3 veces o tocar «Ver»; sin MP3 o sin sonido se ve escrita. Jamás speechSynthesis.
   - Español hablado (Transición no lee): lo del granjero y las preguntas de ciencias con sus MP3 de voz/ (Kokoro, en
     esta carpeta); el texto de una lección suena si la Biblioteca lo tiene grabado (voz/es, voz/es-lector).
   - Progreso (sala): localStorage juegos3d.finca {sel, calma, mudo, finca: {dia, pesos, parcelas, animales, canasta,
     abono}}; puente.js lo separa por usuario. En modo lección no se guarda nada y al final se avisa a la lección.
   Depuración: window.__finca (estado, tocar(id), responder(i), bien(), dormir()). */
(function () {
'use strict';
const $ = id => document.getElementById(id);
const LJ = window.LeccionJuego, FC = window.FincaContenido, FM = window.FincaMundo || {};
const CLAVE = 'juegos3d.finca';
const leer = () => { try { return JSON.parse(localStorage.getItem(CLAVE)) || {}; } catch (e) { return {}; } };
const prefs = leer();
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const pick = a => a[Math.floor(Math.random() * a.length)];
const barajar = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const BIBLIO = /^(localhost|127\.0\.0\.1)$/.test(location.hostname) ? 'http://localhost:8765/' : 'https://biblioteca.micolevirtual.com/';
const reducir = matchMedia('(prefers-reduced-motion: reduce)').matches;
const pesos = FC.pesos;
const EMO = /^((?:\p{Extended_Pictographic}|\p{Regional_Indicator}|[\u{1F3FB}-\u{1F3FF}#*0-9]|\u200D|\uFE0F|\u20E3)+)\s*/u;
const partir = t => { t = String(t).trim(); const m = t.match(EMO); return m && m[1].replace(/[#*0-9]/g, '') ? { emoji: m[1], texto: t.slice(m[0].length) } : { emoji: '', texto: t }; };
const sinEmoji = t => String(t).replace(/(\p{Extended_Pictographic}|\p{Regional_Indicator}|[\u{1F3FB}-\u{1F3FF}]|\u200D|\uFE0F|\u20E3)/gu, '').replace(/\s+/g, ' ').trim();
const FORMAS = [{ c: '#ffd43b', g: '●', n: 'círculo' }, { c: '#74c0fc', g: '▲', n: 'triángulo' }, { c: '#8ce99a', g: '■', n: 'cuadrado' }, { c: '#e599f7', g: '◆', n: 'rombo' }];

/* ---------- modo lección (FORMATO.md §3.9) ---------- */
const CFG = LJ && LJ.activo && LJ.cfg ? LJ.cfg : null;
const LEC = (() => {
  if (!CFG) return null;
  const preguntas = (Array.isArray(CFG.preguntas) ? CFG.preguntas : []).filter(q => q && typeof q.p === 'string' && q.p.trim() && Array.isArray(q.opciones)
    && q.opciones.length >= 2 && q.opciones.length <= 4 && q.opciones.every(o => (typeof o === 'string' && o.trim()) || typeof o === 'number') && Number.isInteger(q.correcta) && q.correcta >= 0 && q.correcta < q.opciones.length)
    .map(q => ({ p: q.p.trim(), opciones: q.opciones.map(o => String(o).trim()), correcta: q.correcta, oir: typeof q.oir === 'string' ? q.oir.trim() : '' }));
  const palabras = (Array.isArray(CFG.palabras) ? CFG.palabras : []).filter(p => p && typeof p.en === 'string' && p.en.trim() && typeof p.es === 'string' && p.es.trim())
    .map(p => ({ en: p.en.trim(), es: p.es.trim(), emoji: typeof p.emoji === 'string' ? p.emoji.trim() : '' }));
  if (!preguntas.length && palabras.length < 3) { console.warn('[finca] la lección no mandó preguntas ni palabras: va la sala'); return null; }
  return { titulo: (LJ.titulo || '').trim(), preguntas, palabras: palabras.slice(0, 12) };
})();
const guardar = () => { if (LEC) return; try { localStorage.setItem(CLAVE, JSON.stringify(prefs)); } catch (e) { /* sin almacenamiento */ } };
const modoDeGrado = g => (g <= 2 ? 'facil' : g <= 5 ? 'media' : 'normal');
// La dificultad (FORMATO.md §3.9.1). Nunca se pierde: cambia la ayuda. facil = pista puesta (una mala tachada) y la
// buena brilla al primer error; media = 3 pistas al día y brilla al segundo; normal = 1 pista y brilla al tercero.
const params = m => ({ modo: m, pistas: m === 'facil' ? Infinity : m === 'media' ? 3 : 1, brilla: m === 'facil' ? 1 : m === 'media' ? 2 : 3, repaso: m !== 'normal', porDia: m === 'facil' ? 3 : 4 });
const VOZ = (() => { const v = CFG && typeof CFG.voz === 'string' && /^(https?:\/\/|\/)/.test(CFG.voz.trim()) ? CFG.voz.trim() : BIBLIO + 'voz/'; return /\/$/.test(v) ? v : v + '/'; })();

/* ---------- sonido (sintetizado, 0 KB) ---------- */
const Snd = (() => {
  let ctx = null, mudo = !!prefs.mudo;
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
  return {
    get mudo() { return mudo; }, set mudo(v) { mudo = !!v; },
    despertar() { if (!mudo) ac(); },
    clic() { tono(880, 0, 0.05, 'sine', 0.05); },
    paso() { tono(300, 0, 0.05, 'triangle', 0.03); },
    agua() { soplo(0.9, 0.18, 2400, 700); },
    semilla() { [0, 0.08, 0.16].forEach(t => tono(1200, t, 0.04, 'square', 0.025)); },
    comer() { [0, 0.15, 0.3].forEach(t => soplo(0.09, 0.2, 900, 500)); },
    pop() { tono(520, 0, 0.12, 'triangle', 0.12, 1040); },
    bien() { [523, 659, 784, 1047].forEach((f, i) => tono(f, i * 0.09, 0.26, 'triangle', 0.11)); },
    mal() { tono(330, 0, 0.2, 'sine', 0.08, 262); },
    moneda() { [0, 0.1, 0.2].forEach((t, i) => { tono(1318 + i * 200, t, 0.14, 'square', 0.04); tono(1760 + i * 200, t + 0.05, 0.2, 'triangle', 0.05); }); },
    noche() { [392, 330, 294, 262].forEach((f, i) => tono(f, i * 0.32, 0.5, 'sine', 0.08)); },
    dia() { [523, 587, 659, 784, 1047].forEach((f, i) => tono(f, i * 0.12, 0.3, 'triangle', 0.08)); }
  };
})();

/* ---------- la voz: inglés (MP3 de la Biblioteca) y español (los de esta carpeta y los de la Biblioteca) ---------- */
const slugEn = t => { // = nombreDelAudio de app2 (voz-grabada.ts)
  const s = String(t).trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  if (s.length <= 200) return s;
  let h = 0x811c9dc5; for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 0x01000193) >>> 0;
  return s.slice(0, 80) + '-' + h.toString(16).padStart(8, '0');
};
const slugEs = t => { // = nombreDelAudioEs (sin tildes ni eñe), como tools/voz_kokoro.py --lector
  const s = String(t).normalize('NFD').replace(/\p{M}/gu, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  if (s.length <= 120) return s;
  let h = 0x811c9dc5; for (const c of new TextEncoder().encode(s)) h = Math.imul(h ^ c, 0x01000193) >>> 0;
  return s.slice(0, 80) + '-' + h.toString(16).padStart(8, '0');
};
const Voz = (() => {
  let en = null, es = null, audio = null;
  const lista = u => fetch(u, { credentials: 'omit' }).then(r => (r.ok ? r.json() : [])).then(a => new Set(Array.isArray(a) ? a : [])).catch(() => new Set());
  const listo = Promise.all([lista(VOZ + 'en/index.json').then(s => { en = s; }), lista('voz/index.json').then(s => { es = s; })]);
  const voces = CFG && CFG.voces && typeof CFG.voces === 'object' ? CFG.voces : {};
  const carpeta = s => (typeof voces[s] === 'string' && /^[a-z-]+$/.test(voces[s]) ? voces[s] : null);
  const tieneEn = t => { const s = t && slugEn(partir(t).texto || t); return !!s && (!!carpeta(s) || !!(en && en.has(s))); };
  const cola = LJ && LJ.cola && typeof LJ.cola.poner === 'function' ? LJ.cola : null;
  function poner(urls, clave, opc) {
    opc = opc || {};
    if (cola) return cola.poner({ urls, clave, grupo: opc.grupo, caduca: opc.caduca || 7000, vigente: () => !Snd.mudo && !S.pausa });
    if (audio) { audio.onended = audio.onerror = null; audio.pause(); }
    return new Promise(fin => { const probar = j => { if (j >= urls.length) { fin(false); return; } const a = new Audio(urls[j]); audio = a; a.onended = () => fin(true); a.onerror = () => probar(j + 1); a.play().catch(() => fin(false)); }; probar(0); });
  }
  /** El MP3 inglés de `texto` (si está grabado): true si va a sonar. */
  function ingles(texto, opc) {
    if (Snd.mudo || !tieneEn(texto)) return false;
    const s = slugEn(partir(texto).texto || texto);
    poner([carpeta(s), en && en.has(s) ? 'en' : null].filter((d, i, a) => d && a.indexOf(d) === i).map(d => VOZ + d + '/' + s + '.mp3'), 'en:' + s, opc);
    return true;
  }
  /** «Touch the cow» si está grabado; si no, «cow». */
  function toca(w, opc) { const f = 'touch the ' + w; return tieneEn(f) ? ingles(f, opc) : ingles(w, opc); }
  /** El español: los MP3 de esta carpeta (voz/) o, si `biblio`, los de la Biblioteca (es, es-lector); si no está, nada. */
  function espanol(texto, opc) {
    opc = opc || {};
    if (Snd.mudo || !texto) return false;
    const s = slugEs(sinEmoji(texto));
    if (!s) return false;
    if (es && es.has(s)) { poner(['voz/' + s + '.mp3'], 'es:' + s, opc); return true; }
    if (opc.biblio) { poner([VOZ + 'es/' + s + '.mp3', VOZ + 'es-lector/' + s + '.mp3'], 'es:' + s, opc); return true; }
    return false;
  }
  function callar() { if (cola) cola.callar(); if (audio) { audio.onended = audio.onerror = null; audio.pause(); audio = null; } }
  return { listo, tieneEn, ingles, toca, espanol, callar, tieneEs: t => !!(es && es.has(slugEs(sinEmoji(t)))) };
})();

/* ---------- lo que dice el granjero (cada frase tiene su MP3 en voz/) ---------- */
const FR = {
  hola: '¡Buenos días! Mira las tareas de hoy.', toca: 'Toca lo que tiene un dibujo encima.', escucha: 'Escucha y toca.',
  bien: ['¡Muy bien!', '¡Excelente!', '¡Lo hiciste!'], casi: 'Casi. Escucha otra vez.', era: 'Esa no era. Mira la respuesta.',
  regar: '¡A regar! La planta tenía sed.', sembrar: 'Elige qué sembrar.', sembrado: '¡Sembraste! Ahora hay que regar.',
  cosechar: '¡A cosechar!', comer: '¡A comer!', recoger: '¡A la canasta!',
  huevo: 'La gallina puso un huevo.', leche: 'La vaca dio leche.', lana: 'La oveja dio lana.', abono: 'El cerdo dio abono.',
  creciendo: 'Está creciendo. Mañana estará más grande.', lleno: 'Ya comió. Está contento.', vacio: 'Primero recoge algo para vender.',
  vendido: '¡Vendiste todo! Ganaste pesos.', conAbono: 'Con el abono, la planta creció.',
  vet: 'La veterinaria tiene una pregunta.', clima: 'El clima trae una pregunta.', comprador: 'El comprador tiene una pregunta.', vecina: 'La vecina tiene una pregunta.',
  responde: 'Toca la respuesta.', listo: '¡Terminaste las tareas! Toca la luna para dormir.', noche: 'Buenas noches. Mañana crecen las plantas.',
  compra: '¡La finca creció!', faltan: 'Te faltan pesos. ¡Vende más!', fin: '¡Lo lograste!', visita: 'Está de visita. ¡Salúdalo!', otra: 'Todavía hay tareas. Mira la lista.'
};
const NUM = ['cero', 'uno', 'dos', 'tres', 'cuatro', 'cinco', 'seis', 'siete', 'ocho', 'nueve', 'diez'];

/* ---------- lo que hay en la finca ---------- */
const INFO = {
  vaca: ['🐄', 'Vaca', 'la vaca', 'cow'], gallina: ['🐔', 'Gallina', 'la gallina', 'hen'], oveja: ['🐑', 'Oveja', 'la oveja', 'sheep'], cerdo: ['🐖', 'Cerdo', 'el cerdo', 'pig'],
  gallo: ['🐓', 'Gallo', 'el gallo', 'rooster'], pollito: ['🐥', 'Pollito', 'el pollito', 'chick'], caballo: ['🐴', 'Caballo', 'el caballo', 'horse'], burro: ['🫏', 'Burro', 'el burro', 'donkey'],
  pato: ['🦆', 'Pato', 'el pato', 'duck'], cabra: ['🐐', 'Cabra', 'la cabra', 'goat'], perro: ['🐕', 'Perro', 'el perro', 'dog'], gato: ['🐈', 'Gato', 'el gato', 'cat'],
  conejo: ['🐇', 'Conejo', 'el conejo', 'rabbit'], toro: ['🐂', 'Toro', 'el toro', 'bull'], buey: ['🐂', 'Buey', 'el buey', 'ox'], cordero: ['🐑', 'Cordero', 'el cordero', 'lamb'],
  banano: ['🍌', 'Banano', 'el banano', 'banana'], mercado: ['🏪', 'Mercado', 'el mercado', 'market'], establo: ['🛖', 'Establo', 'el establo', 'barn'],
  maiz: ['🌽', 'Maíz', 'el maíz', 'corn'], mango: ['🥭', 'Mango', 'el mango', 'mango']
};
const PROD = { vaca: 'leche', gallina: 'huevo', oveja: 'lana', cerdo: 'abono' };
const especieDe = id => id.replace(/\d+$/, '');
const VISITA = { animal: ['🧑🏽‍⚕️', 'La veterinaria', 'vet'], parcela: ['🌦️', 'El clima', 'clima'], mercado: ['🧑🏽‍🌾', 'El comprador', 'comprador'], otro: ['👵🏽', 'La vecina', 'vecina'] };
const TIENDA = [
  { id: 'gallina2', emoji: '🐔', nombre: 'Otra gallina', precio: 4000, tipo: 'animal' },
  { id: 'cerdo', emoji: '🐖', nombre: 'Un cerdo (da abono)', precio: 6000, tipo: 'animal' },
  { id: 'parcela2', emoji: '🟫', nombre: 'Otra parcela', precio: 6000, tipo: 'parcela' },
  { id: 'oveja', emoji: '🐑', nombre: 'Una oveja (da lana)', precio: 8000, tipo: 'animal' },
  { id: 'gallina3', emoji: '🐔', nombre: 'Una gallina más', precio: 6000, tipo: 'animal', antes: 'gallina2' },
  { id: 'parcela3', emoji: '🟫', nombre: 'La cuarta parcela', precio: 10000, tipo: 'parcela', antes: 'parcela2' },
  { id: 'pato', emoji: '🦆', nombre: 'Un pato', precio: 3000, tipo: 'extra' },
  { id: 'caballo', emoji: '🐴', nombre: 'Un caballo', precio: 15000, tipo: 'extra' }
];

/* ---------- estado ---------- */
const sel = Object.assign({ materia: 'ingles', grado: 1, quien: 'nino-ruana' }, prefs.sel || {});
const S = {
  modo: LEC ? 'leccion' : 'sala', fase: 'menu', pausa: false, calma: LEC ? reducir : (typeof prefs.calma === 'boolean' ? prefs.calma : reducir),
  P: params('normal'), dia: 1, dias: 1, pesos: 0, ganado: 0, canasta: {}, abono: 0, parcelas: [], animales: [], extras: [],
  tareas: [], items: [], palabra: null, preg: null, pistas: 0, errores: 0, aciertos: 0, total: 0, fallos: 0, hechos: 0, elegido: -1, primera: true, usadas: new Set()
};
let mundo = null;
try { if (FM.disponible) mundo = FM.crear($('gl'), { biblio: BIBLIO, calma: S.calma, granjero: LEC ? 'nino-ruana' : sel.quien }); } catch (e) { console.warn('Mi Finca: sin 3D (' + e.message + ')'); mundo = null; }
document.body.classList.toggle('sin3d', !mundo);

const anunciar = t => { const a = $('anuncio'); a.textContent = ''; setTimeout(() => { a.textContent = t; }, 30); };
let ultimaDicha = '';
/** El granjero dice algo: se ve en su globo y, si hay MP3, suena. */
function decir(t, opc) {
  ultimaDicha = t; $('dTxt').textContent = t; $('dice').classList.remove('oculto');
  $('bDice').classList.toggle('oculto', !Voz.tieneEs(t));
  Voz.espanol(t, opc);
  // en un iframe bajo el globo tapa la finca: se va solo (lo dicho ya sonó y queda en el anuncio del lector)
  clearTimeout(decir.t); if (innerHeight < 420) decir.t = setTimeout(() => $('dice').classList.add('oculto'), 5000);
  anunciar(t);
}

/* ---------- las cosas, lo que necesitan y sus etiquetas ---------- */
const lista = () => [...S.parcelas.map(p => p.id), ...S.animales.map(a => a.id), ...S.extras.map(x => x.id), 'mercado'];
const parcela = id => S.parcelas.find(p => p.id === id);
const animal = id => S.animales.find(a => a.id === id);
function info(id) {
  const p = parcela(id);
  if (p) return p.cultivo ? [p.cultivo === 'maiz' ? '🌽' : '🥭', p.cultivo === 'maiz' ? 'Maíz' : 'Mango', p.cultivo === 'maiz' ? 'el maíz' : 'el mango', p.cultivo === 'maiz' ? 'corn' : 'mango'] : ['🟫', 'Parcela', 'la parcela', 'field'];
  return INFO[especieDe(id)] || ['❔', id, id, id];
}
/** Lo que necesita: {k, ico, txt} o null. */
function necesita(id) {
  const p = parcela(id);
  if (p) {
    if (!p.cultivo || !p.etapa) return { k: 'sembrar', ico: '🌱', txt: 'para sembrar' };
    if (p.etapa >= 3) return { k: 'cosechar', ico: '🧺', txt: '¡lista para cosechar!' };
    if (!p.regada) return { k: 'regar', ico: '💧', txt: 'tiene sed' };
    return null;
  }
  const a = animal(id);
  if (a) {
    if (a.listo) return { k: 'recoger', ico: FC.PRODUCTOS[PROD[a.especie]] ? FC.PRODUCTOS[PROD[a.especie]].emoji : '💩', txt: 'dio ' + (PROD[a.especie] === 'abono' ? 'abono' : FC.PRODUCTOS[PROD[a.especie]].uno.split(' ')[0]) };
    if (!a.comio) return { k: 'alimentar', ico: '🌾', txt: 'tiene hambre' };
    return null;
  }
  if (id === 'mercado' && Object.values(S.canasta).some(n => n > 0)) return { k: 'vender', ico: '🪙', txt: 'para vender' };
  return null;
}
const estadoTxt = id => { const n = necesita(id); if (n) return n.txt; if (parcela(id)) return 'creciendo'; if (animal(id)) return 'contento'; if (id === 'mercado') return 'canasta vacía'; return 'de visita'; };
const preguntaEn = id => S.tareas.find(t => !t.hecha && t.k === 'pregunta' && t.id === id && t.activa);

const etqs = {};
function armarEtiquetas() {
  const caja = $('etqs'); caja.textContent = ''; Object.keys(etqs).forEach(k => delete etqs[k]);
  lista().forEach((id, i) => {
    const b = document.createElement('button'); b.type = 'button'; b.className = 'etq'; b.dataset.id = id;
    b.innerHTML = '<span class="e" aria-hidden="true"></span><span class="n"></span><span class="s" aria-hidden="true"></span>';
    b.addEventListener('click', () => { S.elegido = i; tocar(id); });
    b.addEventListener('focus', () => { S.elegido = lista().indexOf(id); if (mundo) mundo.resaltar(id); });
    caja.appendChild(b); etqs[id] = b;
  });
  pintarEtiquetas();
}
function pintarEtiquetas() {
  lista().forEach(id => {
    const b = etqs[id]; if (!b) return;
    const [emo, nom] = info(id), n = necesita(id), q = preguntaEn(id);
    b.querySelector('.e').textContent = emo;
    b.querySelector('.n').textContent = nom;
    b.querySelector('.s').textContent = q ? VISITA[q.lugar][0] + '❓' : n ? n.ico : '';
    b.classList.toggle('pide', !!(n || q));
    b.setAttribute('aria-label', nom + ': ' + (q ? q.quien + ' tiene una pregunta' : estadoTxt(id)));
    if (mundo) mundo.marca(id, q ? VISITA[q.lugar][0] : '');
    if (mundo && parcela(id)) mundo.estado(id, parcela(id));
  });
  if (mundo) mundo.puestoCajas(Object.keys(S.canasta).filter(k => S.canasta[k] > 0).map(k => ({ emoji: FC.PRODUCTOS[k].emoji, n: S.canasta[k] })));
  const c = Object.keys(S.canasta).filter(k => S.canasta[k] > 0).map(k => FC.PRODUCTOS[k].emoji + S.canasta[k]).join(' ');
  $('hPesos').textContent = pesos(S.pesos) + (c ? ' · 🧺 ' + c : '') + (S.abono ? ' · 💩' + S.abono : '');
}
function posEtiquetas() {
  if (!mundo) return;
  const H = innerHeight;
  lista().forEach(id => {
    const b = etqs[id], p = mundo.pos2d(id); if (!b || !p) return;
    b.style.transform = 'translate(' + Math.round(p.x) + 'px,' + Math.round(clamp(p.y, 0, H)) + 'px) translate(-50%,-100%)';
    b.classList.toggle('fuera', !p.dentro);
  });
}

/* ---------- las tareas del día ---------- */
function textoTarea(t) {
  if (t.k === 'pregunta') return VISITA[t.lugar][0] + ' ' + t.quien + (t.repaso ? ' (repaso)' : '');
  if (t.k === 'palabra') return '👂 Escucha y toca ' + (S.tareas.filter(x => x.k === 'palabra').indexOf(t) + 1);
  if (t.k === 'vender') return '🪙 Vende en el mercado';
  const [, , art] = info(t.id);
  return { regar: '💧 Riega ' + art, sembrar: '🌱 Siembra la parcela', cosechar: '🧺 Cosecha ' + art, alimentar: '🌾 Dale comida a ' + art }[t.k] || t.k;
}
function pintarTareas() {
  const ul = $('lTareas'); ul.textContent = '';
  S.tareas.forEach(t => {
    const li = document.createElement('li'); li.className = t.hecha ? 'hecha' : t === S.palabra || (t.k === 'pregunta' && t.activa) ? 'ahora' : '';
    li.textContent = (t.hecha ? '✔ ' : '') + textoTarea(t);
    if (t.hecha) li.setAttribute('aria-label', 'Hecha: ' + textoTarea(t));
    ul.appendChild(li);
  });
  const h = S.tareas.filter(t => t.hecha).length;
  $('hTareas').textContent = h + '/' + S.tareas.length;
  $('hDia').textContent = 'Día ' + S.dia + (S.modo === 'leccion' && S.dias > 1 ? ' de ' + S.dias : '');
}

/* el lugar de una pregunta de la lección: por lo que dice (dinero → mercado, plantas → parcela, animales → ese animal) */
function lugarDe(q, i) {
  const t = (q.p + ' ' + q.opciones.join(' ')).toLowerCase();
  if (/\$|peso|cuesta|precio|vend|compr|pag|cambio|devuelv/.test(t)) return 'mercado';
  const an = S.animales.find(a => t.indexOf(a.especie) >= 0);
  if (an) return an.id;
  if (/plant|semilla|raíz|raiz|hoja|flor|fruto|maíz|maiz|mango|riego|lluvia|sol\b|agua|tierra|abono|germin|cosech/.test(t)) return pick(S.parcelas).id;
  const todos = [...S.animales.map(a => a.id), ...S.parcelas.map(p => p.id), 'mercado'];
  return todos[i % todos.length];
}
function tareaPregunta(q, i, repaso) {
  let id = lugarDe(q, i), otro = false;
  // una visita por sitio: si ya hay alguien esperando ahí, va la vecina a otra cosa de la finca
  const ocupado = x => S.tareas.some(t => t.k === 'pregunta' && !t.hecha && t.id === x);
  if (ocupado(id)) { const libre = barajar([...S.animales.map(a => a.id), ...S.parcelas.map(p => p.id)]).find(x => !ocupado(x)); if (libre) { id = libre; otro = true; } }
  const lugar = otro ? 'otro' : parcela(id) ? 'parcela' : animal(id) ? 'animal' : id === 'mercado' ? 'mercado' : 'otro';
  return { k: 'pregunta', id, q, lugar, quien: VISITA[lugar][1], frase: FR[VISITA[lugar][2]], hecha: false, activa: true, repaso: !!repaso };
}

function nuevoDia() {
  if (S.fase === 'fin') return;
  S.fase = 'dia'; S.palabra = null; S.preg = null; S.errores = 0;
  S.pistas = S.P.pistas;
  // los animales amanecen con hambre
  S.animales.forEach(a => { a.comio = false; });
  // lo del día: palabras y preguntas
  let items;
  if (S.modo === 'leccion') items = S.items.splice(0, S.P.porDia);
  else {
    const n = sel.grado <= 2 ? 3 : 4;
    if (sel.materia === 'ingles') { if (S.items.length < n) S.items = S.items.concat(FC.palabras(sel.grado)); items = S.items.splice(0, n).map(w => ({ w })); }
    else if (sel.materia === 'dinero') items = FC.preguntas('dinero', sel.grado, 2).map(q => ({ q }));
    else if (sel.materia === 'ciencias') items = FC.preguntas('ciencias', sel.grado, 3, S.usadas).map(q => ({ q }));
    else items = [];
  }
  // si una palabra pide un animal que no está, viene de visita
  items.filter(it => it.w).forEach(it => {
    const e = FC.entidad(it.w.en);
    if (e && !e.startsWith('@') && INFO[e] && !lista().includes(e) && !['maiz', 'mango', 'granjero'].includes(e)) {
      S.extras.push({ id: e, tipo: e === 'banano' ? 'cosa' : e === 'establo' ? 'establo' : 'animal' });
      if (mundo) mundo.montar([{ id: e, tipo: e === 'banano' ? 'cosa' : e === 'establo' ? 'establo' : 'animal', especie: e }]);
    }
  });
  // las tareas de la finca: las más urgentes primero
  const orden = { cosechar: 0, regar: 1, alimentar: 2, sembrar: 3 };
  const pend = lista().map(id => ({ id, n: necesita(id) })).filter(x => x.n && x.n.k in orden).sort((a, b) => orden[a.n.k] - orden[b.n.k] || Math.random() - 0.5);
  const nTareas = S.modo === 'leccion' ? 2 : sel.grado <= 2 ? 3 : 4;
  S.tareas = pend.slice(0, nTareas).map(x => ({ k: x.n.k, id: x.id, hecha: false }));
  items.forEach((it, i) => S.tareas.push(it.w ? { k: 'palabra', w: it.w, hecha: false } : tareaPregunta(it.q, i)));
  S.tareas.push({ k: 'vender', id: 'mercado', hecha: false, venta: S.modo === 'sala' && sel.materia === 'dinero' });
  $('bDormir').classList.add('oculto');
  armarEtiquetas(); pintarTareas();
  if (!S.calma) Snd.dia();
  decir(FR.hola);
  if (S.primera) { Voz.espanol(FR.toca); S.primera = false; }
  anunciar('Día ' + S.dia + '. Tareas: ' + S.tareas.map(textoTarea).join('; ') + '.');
  setTimeout(siguientePalabra, 400);
  guardarFinca();
}

/* ---------- tocar una cosa de la finca ---------- */
function tocar(id) {
  if (S.fase !== 'dia' || S.pausa || !id) return;
  Snd.despertar();
  if (S.preg) return; // con una pregunta abierta, primero se responde
  if (mundo) { mundo.resaltar(id); mundo.seguir(id); }
  // «escucha y toca»: lo que se toca es la respuesta
  if (S.palabra && S.palabra.ids && S.palabra.ids.length) { juzgarPalabra(id); return; }
  const q = preguntaEn(id);
  if (q) { ir(id, () => abrirPregunta(q)); return; }
  const n = necesita(id);
  if (!n) {
    if (parcela(id)) decir(FR.creciendo); else if (animal(id)) decir(FR.lleno); else if (id === 'mercado') decir(FR.vacio); else { decir(FR.visita); if (mundo) mundo.efecto(id, 'feliz'); Voz.ingles(info(id)[3]); }
    if (mundo) mundo.caminar(id);
    return;
  }
  ir(id, () => hacer(id, n.k));
}
function ir(id, luego) { Snd.paso(); if (mundo) mundo.caminar(id, luego); else luego(); }

const tareaDe = (k, id) => S.tareas.find(t => !t.hecha && t.k === k && (t.id === id || !t.id));
function cumplir(k, id) { const t = tareaDe(k, id); if (t) { t.hecha = true; S.hechos++; } revisar(); }
function hacer(id, k) {
  const p = parcela(id), a = animal(id);
  S.ultimaK = k;
  if (k === 'sembrar') { elegirSemilla(c => { p.cultivo = c; p.etapa = 1; p.regada = false; Snd.semilla(); if (mundo) mundo.efecto(id, 'semilla'); decir(FR.sembrado); cumplir('sembrar', id); }); return; }
  if (k === 'regar') {
    p.regada = true; Snd.agua(); if (mundo) mundo.efecto(id, 'agua');
    if (S.abono > 0 && p.etapa < 3) { S.abono--; p.etapa++; p.regada = p.etapa < 3 ? false : p.regada; setTimeout(() => { if (mundo) mundo.efecto(id, 'abono'); pintarEtiquetas(); decir(FR.conAbono); }, 700); }
    else decir(FR.regar);
    Voz.ingles('water', { grupo: 'eco' });
    cumplir('regar', id); return;
  }
  if (k === 'cosechar') {
    const prod = p.cultivo, n = prod === 'maiz' ? 6 : 5;
    S.canasta[prod] = (S.canasta[prod] || 0) + n; p.etapa = 0; p.regada = false; p.cultivo = null;
    Snd.pop(); if (mundo) mundo.efecto(id, 'cosecha', FC.PRODUCTOS[prod].emoji);
    decir(FR.cosechar); Voz.ingles('harvest', { grupo: 'eco' }); cumplir('cosechar', id); return;
  }
  if (k === 'alimentar') {
    a.comio = true; Snd.comer(); if (mundo) mundo.efecto(id, 'comida');
    decir(FR.comer);
    const son = { vaca: 'moo', gallina: 'cluck cluck', oveja: 'baa', pato: 'quack female' }[a.especie];
    if (son) Voz.ingles(son, { grupo: 'eco', caduca: 2500 });
    cumplir('alimentar', id);
    // lo que da, al rato
    setTimeout(() => { if (!a.comio || a.listo) return; a.listo = true; if (mundo) mundo.efecto(id, 'feliz'); Snd.pop(); decir(FR[PROD[a.especie]] || FR.lleno); pintarEtiquetas(); }, S.calma ? 600 : 1800);
    return;
  }
  if (k === 'recoger') {
    a.listo = false; const prod = PROD[a.especie];
    if (prod === 'abono') S.abono++; else S.canasta[prod] = (S.canasta[prod] || 0) + 1;
    Snd.pop(); if (mundo) mundo.efecto(id, 'recoger', prod === 'abono' ? '💩' : FC.PRODUCTOS[prod].emoji);
    decir(prod === 'abono' ? FR.abono : FR.recoger); revisar(); return;
  }
  if (k === 'vender') {
    const t = tareaDe('vender', 'mercado');
    if (t && t.venta && !t.preguntada) { // Matemáticas en la sala: el comprador pregunta por la venta
      const q = FC.venta(S.canasta, sel.grado);
      if (q) { t.preguntada = true; abrirPregunta({ k: 'pregunta', id: 'mercado', q, lugar: 'mercado', quien: 'El comprador', frase: FR.comprador, venta: true, activa: true }); return; }
    }
    vender();
  }
}
function vender() {
  let total = 0;
  Object.keys(S.canasta).forEach(k => { total += (S.canasta[k] || 0) * FC.PRODUCTOS[k].precio; S.canasta[k] = 0; });
  if (!total) { decir(FR.vacio); return; }
  S.pesos += total; S.ganado += total;
  Snd.moneda(); if (mundo) { mundo.efecto('mercado', 'vender'); mundo.celebrar(); }
  decir(FR.vendido); anunciar('Vendiste por ' + pesos(total) + '. Tienes ' + pesos(S.pesos) + '.');
  flotar('+' + pesos(total));
  cumplir('vender', 'mercado');
}
function flotar(t) { const d = document.createElement('div'); d.className = 'flota'; d.textContent = t; d.setAttribute('aria-hidden', 'true'); document.body.appendChild(d); setTimeout(() => d.remove(), 1600); }

function elegirSemilla(alElegir) {
  if (S.modo === 'leccion') { alElegir(Math.random() < 0.5 ? 'maiz' : 'mango'); return; }
  const c = $('oSemilla'); c.textContent = '';
  [['maiz', '🌽', 'Maíz', 'se cosecha en 2 días'], ['mango', '🥭', 'Mango', 'se cosecha en 2 días']].forEach(([k, e, n, d], i) => {
    const b = document.createElement('button'); b.type = 'button'; b.className = 'op grande';
    b.innerHTML = '<span class="emo" aria-hidden="true">' + e + '</span><b>' + n + '</b><small>' + d + '</small>';
    b.addEventListener('click', () => { $('sembrar').classList.add('oculto'); S.pausa = false; alElegir(k); });
    c.appendChild(b); if (!i) setTimeout(() => b.focus(), 0);
  });
  S.pausa = true; $('sembrar').classList.remove('oculto'); decir(FR.sembrar);
}

/* ---------- la carta: preguntas y palabras ---------- */
function abrirCarta(tipo, texto) {
  $('cTipo').textContent = tipo; $('cPreg').textContent = texto;
  $('cFeed').textContent = ''; $('cFeed').className = 'feed';
  $('cOps').textContent = ''; $('bSeguir').classList.add('oculto'); $('bVer').classList.add('oculto'); $('bPista').classList.add('oculto');
  $('cPalabra').classList.add('oculto');
  $('carta').classList.remove('oculto', 'bien', 'mal', 'compacta');
  document.body.classList.add('con-carta');
}
function cerrarCarta() { $('carta').classList.add('oculto'); document.body.classList.remove('con-carta'); }
function botonesOps(ops, alElegir) {
  const c = $('cOps'); c.textContent = '';
  ops.forEach((o, i) => {
    const f = FORMAS[i], { emoji, texto } = partir(o.txt);
    const b = document.createElement('button'); b.type = 'button'; b.className = 'op-r'; b.style.setProperty('--c', f.c);
    b.innerHTML = '<span class="num" aria-hidden="true">' + (i + 1) + ' ' + f.g + '</span>' + (emoji ? '<span class="emo" aria-hidden="true">' + emoji + '</span>' : '') + '<span class="tx"></span>';
    b.querySelector('.tx').textContent = texto || o.txt;
    if (o.lang) b.querySelector('.tx').lang = o.lang;
    b.setAttribute('aria-label', (i + 1) + ', ' + f.n + ': ' + (texto || o.txt));
    b.addEventListener('click', () => alElegir(i, b));
    c.appendChild(b);
  });
}
function pistaOps(correcta) { // tacha una mala
  const bs = [...$('cOps').children].filter((b, i) => i !== correcta && !b.disabled);
  if (bs.length < 2) return false;
  const b = pick(bs); b.disabled = true; b.classList.add('tachada'); b.setAttribute('aria-label', b.getAttribute('aria-label') + ' (descartada por la pista)');
  return true;
}

function abrirPregunta(t) {
  S.preg = t; Voz.callar();
  const q = t.q, oir = q.oir || '';
  abrirCarta(VISITA[t.lugar][0] + ' ' + t.quien + (t.repaso ? ' · repaso' : ''), q.p);
  botonesOps(q.opciones.map(o => ({ txt: o, lang: oir && FC.entidad(o) ? 'en' : null })), (i, b) => responder(i, b));
  $('bOir').classList.toggle('oculto', !(oir && Voz.tieneEn(oir)) && !Voz.tieneEs(q.p) && S.modo !== 'leccion');
  if (S.P.modo === 'facil' && q.opciones.length >= 3) pistaOps(q.correcta);
  else if (q.opciones.length >= 3 && S.pistas > 0) { $('bPista').classList.remove('oculto'); $('nPista').textContent = S.pistas === Infinity ? '' : '(' + S.pistas + ')'; }
  Voz.espanol(t.frase);
  leerPregunta();
  anunciar(t.quien + ' pregunta: ' + q.p);
  setTimeout(() => { const b = $('cOps').querySelector('button:not(:disabled)'); if (b) b.focus({ preventScroll: true }); }, 50);
}
function leerPregunta(todas) {
  const q = S.preg && S.preg.q; if (!q) return;
  if (q.oir) Voz.ingles(q.oir);
  Voz.espanol(q.p, { biblio: true });
  // a los que aún no leen, también las opciones (si están grabadas); a los demás, cuando tocan 🔊
  if (todas || (S.modo === 'sala' ? sel.grado <= 1 : S.P.modo === 'facil')) q.opciones.forEach(o => { const x = sinEmoji(o); if (/^\d+$/.test(x) && NUM[+x]) Voz.espanol(NUM[+x]); else Voz.espanol(x, { biblio: S.modo === 'leccion' }); });
}
function responder(i, b) {
  const t = S.preg; if (!t || t.respondida) return;
  const q = t.q, bien = i === q.correcta, primera = !t.intentada;
  t.intentada = true; contarIntento(t);
  const contar = !t.repaso;
  [...$('cOps').children].forEach((x, k) => { x.disabled = true; if (k === q.correcta) x.classList.add('buena'); });
  t.respondida = true;
  if (bien) {
    b.classList.add('buena'); $('carta').classList.add('bien');
    if (contar && primera) { S.aciertos++; }
    const fr = pick(FR.bien);
    $('cFeed').textContent = '✔ ' + fr + (q.por ? ' ' + q.por : '') + ' +' + pesos(500); $('cFeed').className = 'feed bien';
    S.pesos += 500; flotar('+' + pesos(500)); Snd.bien(); Voz.espanol(fr);
    if (mundo) { mundo.efecto(t.id, 'feliz'); mundo.celebrar(); }
  } else {
    b.classList.add('mala'); $('carta').classList.add('mal'); S.fallos++;
    $('cFeed').textContent = '✘ Era: ' + q.opciones[q.correcta] + '.' + (q.por ? ' ' + q.por : ''); $('cFeed').className = 'feed mal';
    Snd.mal(); Voz.espanol(FR.era); if (q.por) Voz.espanol(q.por);
    if (mundo) mundo.efecto(t.id, 'mal');
    if (S.P.repaso && !t.venta && !t.repaso) S.tareas.push(tareaPregunta(rebarajar(q), S.hechos + 1, true));
  }
  $('bSeguir').classList.remove('oculto'); $('bPista').classList.add('oculto');
  setTimeout(() => $('bSeguir').focus({ preventScroll: true }), 30);
  avisarLeccion(false);
}
// en la sala, cada cosa que se pregunta por primera vez cuenta en el total
function contarIntento(t) { if (S.modo === 'sala' && !t.contado && !t.repaso) { t.contado = true; S.total++; } }
function rebarajar(q) { const idx = barajar(q.opciones.map((_, i) => i)); return { p: q.p, opciones: idx.map(i => q.opciones[i]), correcta: idx.indexOf(q.correcta), oir: q.oir, por: q.por }; }
function seguirPregunta() {
  const t = S.preg; if (!t) return;
  S.preg = null; cerrarCarta();
  t.hecha = true; t.activa = false; S.hechos++;
  if (t.venta) { vender(); return; }
  // la visita deja hecha la tarea de esa cosa, si la tenía
  const n = necesita(t.id);
  if (n && n.k !== 'vender' && t.id !== 'mercado') hacer(t.id, n.k); else if (t.id === 'mercado' && n) vender(); else revisar();
}

/* «Escucha y toca»: la palabra suena (y a veces se ve); se toca en la finca, o se elige en el mercado. */
function objetivos(w) {
  const e = FC.entidad(w.en); if (!e) return [];
  if (e === '@animal') return S.animales.map(a => a.id).concat(S.extras.filter(x => x.tipo === 'animal').map(x => x.id));
  if (e === '@parcela') return S.parcelas.map(p => p.id);
  if (e === 'maiz' || e === 'mango') return S.parcelas.filter(p => p.cultivo === e && p.etapa > 0).map(p => p.id);
  return lista().filter(id => id === e || especieDe(id) === e);
}
let nPalabra = 0;
function siguientePalabra() {
  if (S.fase !== 'dia' || S.palabra || S.preg) return;
  const t = S.tareas.find(x => !x.hecha && x.k === 'palabra'); if (!t) return;
  S.palabra = t; t.ids = objetivos(t.w); t.oidas = 0; t.errores = 0; t.intentada = false;
  // la mitad de las veces sólo la bocina (hay que oírla); sin MP3 o sin sonido, escrita
  const puede = Voz.tieneEn(t.w.en) && !Snd.mudo;
  t.ver = !puede || (nPalabra++ % 2 === 1);
  abrirCarta('👂 Escucha y toca' + (t.ids.length ? ' en la finca' : ''), t.ids.length ? '👂 ¿Dónde está?' : '¿Qué te pide el comprador?');
  $('carta').classList.toggle('compacta', t.ids.length > 0); document.body.classList.toggle('con-carta', !t.ids.length);
  $('cPalabra').textContent = t.w.en; $('cPalabra').classList.toggle('oculto', !t.ver);
  $('bVer').classList.toggle('oculto', t.ver);
  $('bOir').classList.toggle('oculto', !puede);
  if (!t.ids.length) { // el pedido del mercado: tres cajas (dibujo y palabra en español)
    const otras = barajar((LEC ? LEC.palabras : FC.palabras(sel.grado)).filter(x => x.es !== t.w.es && x.en !== t.w.en)).slice(0, 2);
    t.ops = barajar([t.w].concat(otras));
    botonesOps(t.ops.map(x => ({ txt: (x.emoji ? x.emoji + ' ' : '') + x.es })), (i, b) => juzgarCaja(i, b));
  }
  pintarTareas();
  if (nPalabra <= 1) Voz.espanol(FR.escucha);
  oirPalabra();
  anunciar('Escucha y toca: ' + (t.ver ? t.w.en : 'oye la palabra con el botón Oír'));
}
function oirPalabra() {
  const t = S.palabra; if (!t) return;
  const s = t.ids.length ? Voz.toca(t.w.en, { grupo: 'palabra' }) : Voz.ingles(t.w.en, { grupo: 'palabra' });
  if (s) t.oidas++;
  if (!s || t.oidas >= 3) verPalabra();
}
function verPalabra() { const t = S.palabra; if (!t) return; t.ver = true; $('cPalabra').classList.remove('oculto'); $('bVer').classList.add('oculto'); }
function juzgarPalabra(id) {
  const t = S.palabra;
  if (t.ids.includes(id)) {
    if (mundo) mundo.caminar(id);
    acertarPalabra(id);
  } else {
    t.errores++; S.fallos++; t.intentada = true; contarIntento(t); Snd.mal();
    const [emo, nom, , en] = info(id);
    $('cFeed').textContent = '✘ Ese es ' + emo + ' ' + en + ' (' + nom.toLowerCase() + '). ' + FR.casi; $('cFeed').className = 'feed mal';
    if (mundo) mundo.efecto(id, 'mal');
    Voz.ingles(en, { grupo: 'eco', caduca: 2500 }); Voz.espanol(FR.casi); Voz.toca(t.w.en, { grupo: 'palabra' });
    if (t.errores >= S.P.brilla) { verPalabra(); if (mundo) mundo.pista(t.ids[0]); t.ids.forEach(x => etqs[x] && etqs[x].classList.add('pista')); }
    avisarLeccion(false);
  }
}
function juzgarCaja(i, b) {
  const t = S.palabra; if (!t) return;
  if (t.ops[i] === t.w) { b.classList.add('buena'); acertarPalabra('mercado'); return; }
  t.errores++; S.fallos++; t.intentada = true; contarIntento(t); Snd.mal(); b.classList.add('mala'); b.disabled = true;
  $('cFeed').textContent = '✘ ' + FR.casi; $('cFeed').className = 'feed mal';
  Voz.espanol(FR.casi); Voz.ingles(t.w.en, { grupo: 'palabra' });
  if (t.errores >= S.P.brilla) { verPalabra(); pistaOps(t.ops.indexOf(t.w)); }
  avisarLeccion(false);
}
function acertarPalabra(id) {
  const t = S.palabra;
  contarIntento(t); S.ultimaK = 'palabra';
  if (!t.intentada) S.aciertos++;
  t.hecha = true; S.hechos++; S.palabra = null;
  Snd.bien(); const fr = pick(FR.bien);
  $('cFeed').textContent = '✔ ' + fr + ' ' + (t.w.emoji ? t.w.emoji + ' ' : '') + t.w.en + ' = ' + t.w.es; $('cFeed').className = 'feed bien';
  verPalabra(); $('carta').classList.add('bien');
  [...$('cOps').children].forEach(x => { x.disabled = true; });
  Voz.ingles(t.w.en, { grupo: 'palabra' }); Voz.espanol(fr);
  if (mundo) { mundo.efecto(id, 'feliz'); mundo.pista(null); mundo.celebrar(); }
  Object.values(etqs).forEach(e => e.classList.remove('pista'));
  S.pesos += 300; flotar('+' + pesos(300));
  avisarLeccion(false);
  pintarTareas(); pintarEtiquetas();
  // la carta se queda un momento con la respuesta; la palabra siguiente llega después de otra tarea de la finca
  clearTimeout(acertarPalabra.t);
  acertarPalabra.t = setTimeout(() => { if (!S.palabra && !S.preg) cerrarCarta(); revisar(); }, 1600);
}

/* ---------- revisar el día ---------- */
function revisar() {
  pintarEtiquetas(); pintarTareas(); guardarFinca();
  if (S.fase !== 'dia') return;
  // la palabra siguiente, cuando ya se hizo algo más (o no queda nada más por hacer)
  const quedan = S.tareas.filter(t => !t.hecha);
  if (!S.palabra && !S.preg && quedan.some(t => t.k === 'palabra')) {
    const otras = quedan.filter(t => t.k !== 'palabra' && t.k !== 'vender');
    if (!otras.length || S.ultimaK !== 'palabra') setTimeout(siguientePalabra, 900);
  }
  if (!quedan.length) {
    const ultimo = S.modo === 'leccion' && !S.items.length;
    S.fase = ultimo ? 'cierre' : 'finDia';
    setTimeout(() => {
      if (ultimo) { terminar(); return; }
      $('bDormir').classList.remove('oculto'); decir(FR.listo); $('bDormir').focus({ preventScroll: true });
    }, 1400);
  }
}
function dormir() {
  if (S.fase !== 'finDia') return;
  $('bDormir').classList.add('oculto'); cerrarCarta(); Voz.callar();
  S.fase = 'noche'; Snd.noche(); decir(FR.noche);
  const amanecer = () => {
    S.parcelas.forEach(p => { if (p.cultivo && p.etapa > 0 && p.etapa < 3 && p.regada) p.etapa++; p.regada = false; });
    S.dia++; nuevoDia();
  };
  if (mundo) mundo.dormir(amanecer); else setTimeout(amanecer, 900);
}

/* ---------- lección: avisar y terminar ---------- */
function avisarLeccion(fin) {
  if (S.modo !== 'leccion' || !LJ) return;
  const r = { aciertos: S.aciertos, total: S.total, fallos: S.fallos, nivel: 'Día ' + S.dia + ' de ' + S.dias };
  try { if (fin) LJ.resultado(r); else LJ.progreso(r); } catch (e) { /* sin padre: nada */ }
}
function terminar() {
  S.fase = 'fin'; Voz.callar(); cerrarCarta();
  ['hud', 'tareas', 'etqs', 'dice'].forEach(id => $(id).classList.add('oculto'));
  avisarLeccion(true);
  decirSolo(FR.fin);
  const chips = LEC.palabras.length ? LEC.palabras.map(w => (w.emoji ? w.emoji + ' ' : '') + w.en + ' = ' + w.es) : [];
  LJ.logrado({ detalle: 'Bien a la primera: ' + S.aciertos + ' de ' + S.total + '. Vendiste por ' + pesos(S.ganado) + ' en ' + S.dias + (S.dias === 1 ? ' día.' : ' días.'), chips, alOtraVez: () => { Snd.despertar(); empezar(); } });
}
const decirSolo = t => Voz.espanol(t);

/* ---------- la finca: empezar, guardar, la tienda ---------- */
function fincaNueva(leccion) {
  if (leccion) return {
    dia: 1, pesos: 0, canasta: {}, abono: 0,
    parcelas: [{ id: 'parcela0', cultivo: 'maiz', etapa: 2, regada: false }, { id: 'parcela1', cultivo: 'mango', etapa: 3, regada: false }],
    animales: ['vaca', 'gallina', 'oveja', 'cerdo'].map(e => ({ id: e, especie: e, comio: false, listo: false })), extras: []
  };
  return {
    dia: 1, pesos: 2000, canasta: {}, abono: 0,
    parcelas: [{ id: 'parcela0', cultivo: 'maiz', etapa: 2, regada: false }, { id: 'parcela1', cultivo: null, etapa: 0, regada: false }],
    animales: [{ id: 'vaca', especie: 'vaca', comio: false, listo: false }, { id: 'gallina', especie: 'gallina', comio: false, listo: false }], extras: []
  };
}
function guardarFinca() {
  if (S.modo !== 'sala') return;
  prefs.finca = { dia: S.dia, pesos: S.pesos, canasta: S.canasta, abono: S.abono, parcelas: S.parcelas, animales: S.animales, extras: S.extras.filter(x => x.comprado) };
  guardar();
}
function cargarFinca(f) {
  const ok = f && Array.isArray(f.parcelas) && Array.isArray(f.animales);
  const b = ok ? f : fincaNueva(false);
  S.dia = Math.max(1, +b.dia || 1); S.pesos = Math.max(0, +b.pesos || 0); S.canasta = Object.assign({}, b.canasta || {}); S.abono = Math.max(0, +b.abono || 0);
  S.parcelas = b.parcelas.filter(p => p && /^parcela\d$/.test(p.id)).map(p => ({ id: p.id, cultivo: p.cultivo === 'maiz' || p.cultivo === 'mango' ? p.cultivo : null, etapa: clamp(+p.etapa || 0, 0, 3), regada: !!p.regada }));
  S.animales = b.animales.filter(a => a && PROD[especieDe(a.id)]).map(a => ({ id: a.id, especie: especieDe(a.id), comio: !!a.comio, listo: !!a.listo }));
  S.extras = (b.extras || []).filter(x => x && INFO[x.id]).map(x => ({ id: x.id, tipo: 'animal', comprado: true }));
}
function montarMundo() {
  if (!mundo) return;
  mundo.montar([{ id: 'mercado', tipo: 'mercado' }, { id: 'establo', tipo: 'establo' }].concat(S.parcelas.map(p => ({ id: p.id, tipo: 'parcela' })),
    S.animales.map(a => ({ id: a.id, tipo: 'animal', especie: a.especie })), S.extras.map(x => ({ id: x.id, tipo: x.tipo, especie: x.id }))));
}
function empezar() {
  LJ && LJ.cerrar && LJ.cerrar();
  ['inicio', 'pausa', 'tienda', 'sembrar'].forEach(id => $(id).classList.add('oculto'));
  S.pausa = false; S.aciertos = 0; S.fallos = 0; S.hechos = 0; S.ganado = 0; S.primera = true; S.ultimaK = ''; nPalabra = 0;
  if (S.modo === 'leccion') {
    S.P = params(LJ.dificultad || 'normal');
    const f = fincaNueva(true);
    S.parcelas = f.parcelas; S.animales = f.animales; S.extras = [];
    S.dia = 1; S.pesos = 0; S.canasta = {}; S.abono = 0;
    const its = LEC.palabras.map(w => ({ w })).concat(LEC.preguntas.map(q => ({ q })));
    // palabras y preguntas intercaladas
    S.items = []; const a = barajar(its.filter(x => x.w)), b = LEC.preguntas.map(q => ({ q }));
    while (a.length || b.length) { if (a.length) S.items.push(a.shift()); if (b.length) S.items.push(b.shift()); }
    S.total = its.length;
    S.dias = Math.max(1, Math.ceil(S.items.length / S.P.porDia));
  } else {
    S.P = params(modoDeGrado(sel.grado));
    cargarFinca(prefs.finca);
    S.items = []; S.total = 0; S.dias = 1;
    $('bTienda').classList.remove('oculto');
  }
  montarMundo();
  ['hud', 'etqs', 'tareas'].forEach(id => $(id).classList.remove('oculto'));
  medir();
  nuevoDia(); medir();
}
// lo que es de la finca (un animal de visita no cuenta: se puede comprar)
const tiene = id => S.parcelas.some(p => p.id === id) || S.animales.some(a => a.id === id) || S.extras.some(x => x.id === id && x.comprado);
function armarTienda() {
  const c = $('oTienda'); c.textContent = '';
  $('kPesos').textContent = 'Tienes ' + pesos(S.pesos) + '. Lo que compras se queda en tu finca.';
  TIENDA.forEach(it => {
    const ya = tiene(it.id), falta = it.antes && !tiene(it.antes);
    if (falta) return;
    const b = document.createElement('button'); b.type = 'button'; b.className = 'mis';
    b.innerHTML = '<span class="emo" aria-hidden="true">' + it.emoji + '</span><b></b><small></small>';
    b.querySelector('b').textContent = it.nombre; b.querySelector('small').textContent = ya ? '✔ Ya lo tienes' : pesos(it.precio) + (S.pesos < it.precio ? ' · te faltan ' + pesos(it.precio - S.pesos) : '');
    b.disabled = ya; if (!ya && S.pesos < it.precio) b.classList.add('caro');
    b.addEventListener('click', () => comprar(it));
    c.appendChild(b);
  });
}
function comprar(it) {
  if (S.pesos < it.precio) { Snd.mal(); decir(FR.faltan); return; }
  S.pesos -= it.precio;
  S.extras = S.extras.filter(x => x.id !== it.id);
  if (it.tipo === 'parcela') S.parcelas.push({ id: it.id, cultivo: null, etapa: 0, regada: false });
  else if (it.tipo === 'animal') S.animales.push({ id: it.id, especie: especieDe(it.id), comio: false, listo: false });
  else S.extras.push({ id: it.id, tipo: 'animal', comprado: true });
  montarMundo(); armarEtiquetas(); Snd.moneda(); decir(FR.compra); guardarFinca(); armarTienda();
}

/* ---------- la sala ---------- */
const MATERIAS = [['ingles', '🔤', 'Inglés', 'animales, comida y verbos'], ['dinero', '💰', 'Matemáticas', 'el dinero: sumar, el cambio, multiplicar'], ['ciencias', '🌱', 'Ciencias', 'plantas, cuidados y cadenas de alimento'], ['finca', '🧑🏽‍🌾', 'Sólo la finca', 'sin preguntas']];
const GRADOS = [[0, 'Transición'], [1, '1.º'], [2, '2.º'], [3, '3.º'], [4, '4.º'], [5, '5.º']];
const QUIEN = [['nino-ruana', '👦🏽', 'Niño'], ['nina-gafas', '👧🏽', 'Niña']];
function filaOps(caja, ops, val, alElegir) {
  const c = $(caja); c.textContent = '';
  ops.forEach(o => {
    const b = document.createElement('button'); b.type = 'button'; b.className = 'op'; b.setAttribute('aria-pressed', String(o[0] === val));
    b.innerHTML = (o[1] && o.length > 2 ? '<span aria-hidden="true">' + o[1] + '</span> ' : '') + '<b></b>' + (o[3] ? ' <small></small>' : '');
    b.querySelector('b').textContent = o.length > 2 ? o[2] : o[1]; if (o[3]) b.querySelector('small').textContent = o[3];
    b.addEventListener('click', () => { alElegir(o[0]); armarInicio(); Snd.clic(); });
    c.appendChild(b);
  });
}
function armarInicio() {
  filaOps('oMateria', MATERIAS, sel.materia, v => { sel.materia = v; });
  filaOps('oGrado', GRADOS, sel.grado, v => { sel.grado = v; });
  filaOps('oQuien', QUIEN, sel.quien, v => { if (v !== sel.quien) { sel.quien = v; prefs.sel = sel; guardar(); $('tFinca').textContent = 'El granjero nuevo llega cuando vuelvas a abrir el juego.'; } });
  $('oCalma').checked = S.calma;
  const f = prefs.finca;
  if (f && Array.isArray(f.animales)) {
    $('tFinca').textContent = '🏡 Tu finca: día ' + (f.dia || 1) + ' · ' + pesos(f.pesos || 0) + ' · ' + f.animales.map(a => (INFO[especieDe(a.id)] || ['❔'])[0]).join('') + ' · ' + f.parcelas.length + ' parcelas';
    $('bNueva').classList.remove('oculto');
  } else $('bNueva').classList.add('oculto');
}

/* ---------- pausa, botones y teclado ---------- */
function pausa(b) {
  if (S.modo === 'leccion' && b === false) { S.pausa = false; $('pausa').classList.add('oculto'); return; }
  S.pausa = b; $('pausa').classList.toggle('oculto', !b);
  if (b) { Voz.callar(); $('pRes').textContent = 'Día ' + S.dia + ' · ' + pesos(S.pesos) + ' · tareas ' + S.tareas.filter(t => t.hecha).length + ' de ' + S.tareas.length + '.'; $('bReanudar').focus(); }
  $('bInicio').classList.toggle('oculto', S.modo === 'leccion');
}
$('bReanudar').addEventListener('click', () => pausa(false));
$('bInicio').addEventListener('click', () => { pausa(false); S.fase = 'menu'; guardarFinca(); ['hud', 'tareas', 'etqs', 'dice', 'bDormir'].forEach(id => $(id).classList.add('oculto')); cerrarCarta(); armarInicio(); $('inicio').classList.remove('oculto'); $('bEmpezar').focus(); });
$('bMenu').addEventListener('click', () => pausa(true));
$('bEmpezar').addEventListener('click', () => { prefs.sel = sel; S.calma = $('oCalma').checked; prefs.calma = S.calma; guardar(); if (mundo) mundo.calma(S.calma); pintarCalma(); Snd.despertar(); empezar(); });
$('bNueva').addEventListener('click', () => { if (!confirm('¿Empezar una finca nueva? La de ahora se borra.')) return; delete prefs.finca; guardar(); armarInicio(); });
$('bSonido').addEventListener('click', () => { Snd.mudo = !Snd.mudo; prefs.mudo = Snd.mudo; guardar(); if (Snd.mudo) Voz.callar(); pintarSonido(); });
$('bCalma').addEventListener('click', () => { S.calma = !S.calma; prefs.calma = S.calma; guardar(); if (mundo) mundo.calma(S.calma); pintarCalma(); });
$('bTareas').addEventListener('click', () => { const ab = $('tareas').classList.toggle('abierta'); $('bTareas').setAttribute('aria-expanded', String(ab)); });
$('bTienda').addEventListener('click', () => { if (S.fase !== 'dia' && S.fase !== 'finDia') return; armarTienda(); $('tienda').classList.remove('oculto'); S.pausaTienda = true; $('bTiendaFin').focus(); });
$('bTiendaFin').addEventListener('click', () => { $('tienda').classList.add('oculto'); revisar(); });
$('bDormir').addEventListener('click', dormir);
$('bSeguir').addEventListener('click', seguirPregunta);
$('bOir').addEventListener('click', () => { Snd.despertar(); if (S.palabra) oirPalabra(); else { Voz.callar(); leerPregunta(true); } });
$('bVer').addEventListener('click', verPalabra);
$('bDice').addEventListener('click', () => Voz.espanol(ultimaDicha));
$('bPista').addEventListener('click', () => { if (!S.preg || S.pistas <= 0) return; if (pistaOps(S.preg.q.correcta)) { S.pistas--; $('nPista').textContent = S.pistas === Infinity ? '' : '(' + S.pistas + ')'; if (S.pistas <= 0) $('bPista').classList.add('oculto'); } });
function pintarSonido() { $('iSonido').textContent = Snd.mudo ? '🔇' : '🔊'; $('tSonido').textContent = Snd.mudo ? 'Activar el sonido' : 'Silenciar'; $('bSonido').setAttribute('aria-pressed', String(Snd.mudo)); }
function pintarCalma() { $('bCalma').setAttribute('aria-pressed', String(S.calma)); document.body.classList.toggle('calma', S.calma); }

if (mundo) {
  const lz = mundo.lienzo;
  lz.addEventListener('pointerup', ev => { if (ev.button > 0) return; const id = mundo.tocar(ev.clientX, ev.clientY); if (id && lista().includes(id)) { S.elegido = lista().indexOf(id); tocar(id); } });
}
addEventListener('keydown', ev => {
  if (ev.target && /^(INPUT|SELECT|TEXTAREA)$/.test(ev.target.tagName)) return;
  const k = ev.key;
  if (k === 'Escape') { if (!$('tienda').classList.contains('oculto')) { $('bTiendaFin').click(); return; } if (S.fase === 'dia' || S.fase === 'finDia') pausa(!S.pausa); return; }
  if (S.pausa || (S.fase !== 'dia' && S.fase !== 'finDia')) return;
  if (/^[1-4]$/.test(k)) { const b = $('cOps').children[+k - 1]; if (b && !b.disabled && !$('carta').classList.contains('oculto')) { b.click(); ev.preventDefault(); } return; }
  const l = k.toLowerCase();
  if (k === 'ArrowRight' || k === 'ArrowLeft') {
    const ls = lista(); S.elegido = (S.elegido + (k === 'ArrowRight' ? 1 : -1) + ls.length) % ls.length;
    const id = ls[S.elegido]; if (etqs[id]) etqs[id].focus({ preventScroll: true }); if (mundo) { mundo.resaltar(id); mundo.seguir(id); }
    ev.preventDefault(); return;
  }
  if (l === 'o') $('bOir').click(); else if (l === 'v') verPalabra(); else if (l === 't') $('bTareas').click(); else if (l === 'c') $('bCalma').click(); else if (l === 'm') $('bSonido').click();
  else if (l === 'k' && S.modo === 'sala') $('bTienda').click();
});
document.addEventListener('visibilitychange', () => { if (document.hidden) Voz.callar(); });
addEventListener('pagehide', () => { if (S.modo === 'leccion' && S.fase !== 'fin' && S.hechos) avisarLeccion(false); });

/* ---------- medir: la cámara deja sitio al HUD de arriba y a la carta ---------- */
function medir() {
  if (!mundo) return;
  // la carta va y viene: no mueve la cámara (sólo el HUD de arriba y el globo de abajo)
  const arriba = $('hud').classList.contains('oculto') ? 0 : $('hud').getBoundingClientRect().bottom;
  const ta = $('tareas'), izq = !ta.classList.contains('oculto') && getComputedStyle(ta).display !== 'none' ? ta.getBoundingClientRect().right : 0;
  mundo.medir(arriba, $('dice').classList.contains('oculto') ? 0 : innerHeight - $('dice').getBoundingClientRect().top, izq);
}
addEventListener('resize', () => setTimeout(medir, 50));

/* ---------- el bucle ---------- */
let antes = performance.now();
function bucle(ahora) {
  const dt = Math.min(0.05, (ahora - antes) / 1000); antes = ahora;
  if (mundo) { mundo.cuadro(S.pausa ? 0 : dt); posEtiquetas(); }
  requestAnimationFrame(bucle);
}

/* ---------- arrancar ---------- */
function listo() {
  $('cargando').classList.add('oculto');
  pintarSonido(); pintarCalma();
  if (S.modo === 'leccion') {
    S.P = params(LJ.dificultad || 'normal');
    const f = fincaNueva(true); S.parcelas = f.parcelas; S.animales = f.animales; montarMundo(); medir();
    const n = LEC.palabras.length + LEC.preguntas.length;
    const chips = LEC.palabras.length ? LEC.palabras.slice(0, 12).map(w => (w.emoji ? w.emoji + ' ' : '') + w.en) : [];
    LJ.portada({ juego: '🧑🏽‍🌾 Mi Finca', titulo: LEC.titulo || 'Un día en la finca',
      detalle: 'Riega, dales comida a los animales y vende en el mercado. ' + (LEC.palabras.length ? 'Escucha la palabra y toca lo que te piden. ' : '') + (LEC.preguntas.length ? 'Las visitas te hacen ' + LEC.preguntas.length + (LEC.preguntas.length === 1 ? ' pregunta.' : ' preguntas.') : '') + (n ? '' : ''),
      chips, chipsRotulo: 'Las palabras de la lección', alJugar: () => { Snd.despertar(); empezar(); } });
  } else { montarVista(); armarInicio(); $('inicio').classList.remove('oculto'); $('bEmpezar').focus(); }
  requestAnimationFrame(bucle);
}
// detrás del inicio de la sala ya se ve la finca guardada
function montarVista() { cargarFinca(prefs.finca); montarMundo(); medir(); }
const fuentes = document.fonts && document.fonts.load ? Promise.all([document.fonts.load('800 32px "Baloo 2"'), document.fonts.ready]).catch(() => {}) : Promise.resolve();
Promise.race([Promise.all([Voz.listo, fuentes]), new Promise(r => setTimeout(r, 2500))]).then(listo);

window.__finca = {
  estado: S, tocar, responder: i => { const b = $('cOps').children[i]; if (b) b.click(); }, seguir: seguirPregunta, dormir,
  /** hace lo que toca: la palabra activa, la pregunta abierta (bien) o la primera tarea pendiente */
  bien() {
    if (!$('sembrar').classList.contains('oculto')) { $('oSemilla').firstChild.click(); return 'semilla'; }
    if (S.preg) { if (S.preg.respondida) seguirPregunta(); else responder(S.preg.q.correcta, $('cOps').children[S.preg.q.correcta]); return 'pregunta'; }
    if (S.palabra) { if (S.palabra.ids.length) juzgarPalabra(S.palabra.ids[0]); else juzgarCaja(S.palabra.ops.indexOf(S.palabra.w), $('cOps').children[S.palabra.ops.indexOf(S.palabra.w)]); return 'palabra'; }
    if (S.fase === 'finDia' && !$('bDormir').classList.contains('oculto')) { dormir(); return 'dormir'; }
    if (S.fase !== 'dia') return null;
    const t = S.tareas.find(x => !x.hecha && x.k !== 'palabra'); if (!t) return null;
    if (t.k === 'vender' && !Object.values(S.canasta).some(n => n > 0)) { const a = S.animales.find(x => x.listo) || S.animales.find(x => !x.comio); if (a) { tocar(a.id); return 'producir'; } }
    tocar(t.id); return t.k;
  }
};
})();
