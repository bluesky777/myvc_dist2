/* Tambor Bailarín — el juego: la sala (materia, grado, tema, ritmo y bailarín), el modo lección (../leccion.js), la pista
   de notas, el pulso que se ve, la voz en inglés y los resultados.
   - Bajan notas por los carriles hacia la línea; se tocan cuando llegan (F, Espacio, J; D F J K con cuatro; las flechas;
     1 a 4; o los botones grandes de abajo). El pulso se ve siempre: el círculo que late con el número del pulso en el
     compás, la línea que destella, las rayas de cada pulso que bajan por la pista, el bailarín y el público.
   - Rondas: `golpes` (tocar con la banda: tambor, maracas…, sin nota), `pregunta` (una fila con una opción por carril:
     se toca la buena; antes de la línea también vale, en la línea suma «al compás»), `silabas` (suena la palabra, la
     banda la toca sílaba por sílaba y luego tú: suave en los lados y FUERTE en el centro, en la del acento), `pulso`
     (un golpe por pulso), `mira` (el bailarín hace la secuencia de pasos), `juntos` (cada paso por su carril),
     `memoria` (la secuencia sin dibujos: de memoria) y `contar` (de n en n al ritmo).
   - Sin prisa (🐢): cada nota espera en la línea hasta que la toques y no hay golpes de relleno; la música sigue.
     En `facil` las notas que cuentan esperan si se pasan, la ventana es amplia y el tempo más lento.
   - Inglés: sólo los MP3 grabados de la Biblioteca. Sin MP3: silencio y la palabra escrita. Jamás speechSynthesis.
   - Progreso (sala): localStorage juegos3d.tambor {sel, calma, sinPrisa, mudo, vol, estrellas, records}. En modo
     lección no se guarda nada.
   Depuración: window.__tambor (estado, auto(true) toca solo lo correcto, tocar(i)). */
(function () {
'use strict';
const $ = id => document.getElementById(id);
const LJ = window.LeccionJuego, TC = window.TamborContenido, RC = window.RallyContenido || null, TM = window.TamborMusica, TE = window.TamborEscena || {};
const RITMOS = TM.RITMOS;
const CLAVE = 'juegos3d.tambor';
const leer = () => { try { return JSON.parse(localStorage.getItem(CLAVE)) || {}; } catch (e) { return {}; } };
const prefs = leer(); if (!prefs.records || typeof prefs.records !== 'object') prefs.records = {};
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const pick = a => a[Math.floor(Math.random() * a.length)];
const barajar = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const BIBLIO = /^(localhost|127\.0\.0\.1)$/.test(location.hostname) ? 'http://localhost:8765/' : 'https://biblioteca.micolevirtual.com/';
const reducir = matchMedia('(prefers-reduced-motion: reduce)').matches;
const GLIFOS = [{ f: '●', c: '#d9480f', n: 'círculo' }, { f: '▲', c: '#1864ab', n: 'triángulo' }, { f: '■', c: '#2b8a3e', n: 'cuadrado' }, { f: '◆', c: '#7048e8', n: 'rombo' }];
const DESBLOQUEO = { cumbia: 0, bambuco: 0, currulao: 0, joropo: 3, mapale: 6, sanjuanero: 9 };
const sinEmoji = t => String(t).replace(/^[^A-Za-zÀ-ÿ0-9¿¡«$(]+/u, '').trim() || String(t);
const emojiDe = t => { const m = String(t).match(/^([^A-Za-zÀ-ÿ0-9¿¡«$(]+)\s/u); return m ? m[1].trim() : ''; };

/* ---------- modo lección: lo que manda la lección (FORMATO.md §3.9) ---------- */
const CFG = LJ && LJ.activo && LJ.cfg ? LJ.cfg : null;
const LEC = (() => {
  if (!CFG) return null;
  const preguntas = (Array.isArray(CFG.preguntas) ? CFG.preguntas : []).filter(q => q && typeof q.p === 'string' && q.p.trim() && Array.isArray(q.opciones)
    && q.opciones.length >= 2 && q.opciones.length <= 4 && q.opciones.every(o => (typeof o === 'string' && o.trim()) || typeof o === 'number') && Number.isInteger(q.correcta) && q.correcta >= 0 && q.correcta < q.opciones.length)
    .map(q => { const p = q.p.trim(), oir = typeof q.oir === 'string' ? q.oir.trim() : ''; const escucha = !!oir && p.toLowerCase().indexOf(oir.toLowerCase()) < 0; return { p, opciones: q.opciones.map(o => String(o).trim()), correcta: q.correcta, oir, escucha, palabra: escucha ? oir : '' }; });
  const palabras = (Array.isArray(CFG.palabras) ? CFG.palabras : []).filter(p => p && typeof p.en === 'string' && p.en.trim() && typeof p.es === 'string' && p.es.trim())
    .map(p => ({ en: p.en.trim(), es: p.es.trim(), emoji: typeof p.emoji === 'string' ? p.emoji.trim() : '' }));
  const pasos = [];
  (Array.isArray(CFG.pasos) ? CFG.pasos : []).forEach(x => {
    const n = TC.paso(typeof x === 'string' ? x : x && x.paso), k = x && typeof x === 'object' && Number.isInteger(x.pulsos) ? clamp(x.pulsos, 1, 4) : 1;
    if (n) pasos.push([n, k]);
  });
  // como mucho cuatro pasos distintos (cuatro carriles)
  const distintos = [...new Set(pasos.map(p => p[0]))].slice(0, 4);
  const pasosOk = pasos.filter(p => distintos.indexOf(p[0]) >= 0).slice(0, 8);
  const contar = Number.isInteger(CFG.contar) && CFG.contar >= 1 && CFG.contar <= 12 ? CFG.contar : 0;
  if (!preguntas.length && palabras.length < 2 && !pasosOk.length && !contar) { console.warn('[tambor] la lección no mandó nada que tocar: va la sala'); return null; }
  return { titulo: (LJ.titulo || '').trim(), preguntas, palabras, pasos: pasosOk, contar, ritmo: RITMOS[CFG.ritmo] ? CFG.ritmo : null, compas: CFG.compas === true };
})();
const guardar = () => { if (LEC) return; try { localStorage.setItem(CLAVE, JSON.stringify(prefs)); } catch (e) { /* sin almacenamiento */ } };

// La dificultad (FORMATO.md §3.9.1). Nunca se pierde la partida: cambia la ventana, el tempo y la ayuda.
// facil: ventana de 0,3 s, tempo al 80 %, las notas que cuentan esperan en la línea si se pasan, el acento a la vista,
//   golpes de relleno sólo en el primer pulso y lo que se falla vuelve de repaso;
// media: 0,2 s, tempo al 90 %, la secuencia de memoria espera, vuelve de repaso; normal: 0,14 s, tempo entero.
function params(modo) {
  return {
    modo, win: modo === 'facil' ? 0.3 : modo === 'media' ? 0.2 : 0.14, perf: modo === 'facil' ? 0.1 : modo === 'media' ? 0.075 : 0.055,
    vel: modo === 'facil' ? 0.8 : modo === 'media' ? 0.9 : 1, lead: modo === 'facil' ? 2.8 : modo === 'media' ? 2.3 : 1.9,
    espera: modo === 'facil', acento: modo === 'facil', memoria: modo !== 'facil', repaso: modo !== 'normal', lectura: modo === 'facil' ? 6 : modo === 'media' ? 5 : 4
  };
}
const modoDeGrado = g => (g <= 2 ? 'facil' : g <= 5 ? 'media' : 'normal');
const VOZ = (() => { const v = CFG && typeof CFG.voz === 'string' && /^(https?:\/\/|\/)/.test(CFG.voz.trim()) ? CFG.voz.trim() : BIBLIO + 'voz/'; return /\/$/.test(v) ? v : v + '/'; })();

const motor = TM.motor();
motor.volumen = typeof prefs.vol === 'number' ? prefs.vol : 0.8;
motor.mudo = !LEC && !!prefs.mudo;

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
  /** Suena el MP3 (promesa: true al acabar, false sin audio). */
  function decir(texto, opc) {
    if (motor.mudo || !tiene(texto)) return Promise.resolve(false);
    opc = opc || {};
    const s = slug(texto), dirs = [carpeta(s), lista && lista.has(s) ? 'en' : null].filter((d, i, a) => d && a.indexOf(d) === i), urls = dirs.map(d => VOZ + d + '/' + s + '.mp3');
    motor.agachar(true);
    let pr;
    if (cola) { const vig = opc.vigente; pr = cola.poner({ urls, clave: 'tambor:' + s, grupo: opc.grupo, caduca: opc.caduca || 5000, vigente: () => !motor.mudo && !S.pausa && (!vig || vig()) }); }
    else {
      n++; if (audio) { audio.onended = audio.onerror = null; audio.pause(); audio = null; }
      const mio = n;
      pr = new Promise(fin => { const probar = j => { if (mio !== n || j >= urls.length) { fin(false); return; } const a = new Audio(urls[j]); audio = a; a.onended = () => { if (audio === a) audio = null; fin(true); }; a.onerror = () => probar(j + 1); a.play().catch(() => fin(false)); }; probar(0); });
    }
    return pr.then(r => { motor.agachar(false); return r; }, () => { motor.agachar(false); return false; });
  }
  return { listo, tiene, decir, callar };
})();

/* ---------- estado ---------- */
const sel = Object.assign({ materia: 'ingles', grado: 3, tema: 'frutas', ritmo: 'azar', bailarin: 'nina-gafas' }, prefs.sel || {});
const S = {
  modo: LEC ? 'leccion' : 'sala', fase: 'menu', pausa: false,
  calma: LEC ? reducir : (typeof prefs.calma === 'boolean' ? prefs.calma : reducir),
  sinPrisa: LEC ? false : !!prefs.sinPrisa,
  P: params('normal'), ritmo: 'cumbia', R: RITMOS.cumbia, bpm: 94, B: 2,
  notas: [], segs: [], tareas: [], cursor: 0, off: 0, hold: null, chart: -4, espera: null, cerrando: false, finB: Infinity, carrilesClave: '',
  puntos: 0, maximo: 0, combo: 0, mejorCombo: 0, perfectos: 0, aciertos: 0, total: 0, fallos: 0, items: 0, hechas: 0, repasar: [], auto: false, ronda: 0, rondas: 0
};
let mundo = null;
try { if (TE.disponible) mundo = TE.crear($('gl'), { biblio: BIBLIO, calma: S.calma, bailarin: sel.bailarin }); } catch (e) { console.warn('Tambor: sin 3D (' + e.message + ')'); mundo = null; }
if (!mundo) document.body.classList.add('sin3d');

/* ---------- las tareas: lo que se va a tocar, en orden ---------- */
// cada tarea: {tipo, ...}; las que cuentan llevan `item` (se cuentan en aciertos y total)
function preguntasDePalabras(pal, modo) {
  const out = [];
  pal.forEach((w, i) => {
    const otras = barajar(pal.filter(x => x.es !== w.es && x.en !== w.en)).slice(0, modo === 'facil' ? 1 : 2);
    if (otras.length < 1) return;
    const alReves = modo !== 'facil' && i % 3 === 2 && Voz.tiene(w.en) && otras.every(x => Voz.tiene(x.en));
    if (alReves) { const ops = barajar([w].concat(otras)); out.push({ p: '¿Cómo se dice ' + (w.emoji ? w.emoji + ' ' : '') + w.es + '?', opciones: ops.map(x => x.en), correcta: ops.indexOf(w), opEn: true }); }
    else { const ops = barajar([w].concat(otras)); const escucha = Voz.tiene(w.en) && i % 2 === 0; out.push({ p: escucha ? '🔊 ¿Qué quiere decir?' : '«' + w.en + '»: ¿qué quiere decir?', opciones: ops.map(x => (x.emoji ? x.emoji + ' ' : '') + x.es), correcta: ops.indexOf(w), oir: w.en, escucha, palabra: escucha ? w.en : '' }); }
  });
  return out;
}
function tareasDePalabras(pal, modo, max) {
  const t = [];
  const conSil = pal.filter(w => TC.silabas(w.en)), sinSil = pal.filter(w => !TC.silabas(w.en));
  const ps = preguntasDePalabras(pal, modo);
  barajar(conSil).slice(0, max).forEach((w, i) => {
    t.push({ tipo: 'silabas', w, sil: TC.silabas(w.en), escucha: Voz.tiene(w.en) && modo !== 'facil' && i % 3 === 1, item: true });
    if (i % 2 === 1 && ps.length) t.push({ tipo: 'pregunta', q: ps.shift(), item: true });
  });
  sinSil.forEach(w => { const q = ps.find(x => x.oir === w.en || (x.opEn && x.opciones.indexOf(w.en) >= 0)); if (q) { ps.splice(ps.indexOf(q), 1); t.push({ tipo: 'pregunta', q, item: true }); } });
  return t;
}
function tareasDePasos(pasos, modo, compas) {
  const t = [{ tipo: 'pulso', item: true }, { tipo: 'mira', pasos }, { tipo: 'juntos', pasos, item: true }];
  if (modo === 'facil') t.push({ tipo: 'mira', pasos }, { tipo: 'juntos', pasos, item: true });
  else t.push({ tipo: 'memoria', pasos, item: true });
  if (compas) t.push({ tipo: 'pregunta', q: preguntaCompas(), item: true });
  return t;
}
function preguntaCompas() {
  const R = S.R, nombre = (TC.NOMBRES[S.ritmo] || R.nombre.toLowerCase()), B = R.compas;
  const ops = barajar(['En ' + B, 'En ' + (B === 2 ? 3 : 2)]);
  return { p: 'Mira el círculo que late: ¿en cuántos pulsos se cuenta el compás del ' + nombre + '?', opciones: ops, correcta: ops.indexOf('En ' + B), ocultaCompas: true };
}
function contarTarea(n, modo) { const hasta = modo === 'facil' ? 5 : 10; return { tipo: 'contar', n, nums: TC.contarDe(n, hasta), item: true }; }
function rellenar(t) {
  // golpes con la banda entre ronda y ronda (no en sin prisa)
  if (S.sinPrisa) return t;
  const out = [{ tipo: 'golpes' }];
  t.forEach((x, i) => { out.push(x); if (i % 2 === 1 && i < t.length - 1 && x.tipo !== 'mira') out.push({ tipo: 'golpes' }); });
  return out;
}
function armarTareas() {
  const modo = S.P.modo;
  let t = [];
  if (LEC) {
    if (LEC.pasos.length) t = t.concat(tareasDePasos(LEC.pasos, modo, LEC.compas));
    else if (LEC.compas) t.push({ tipo: 'pregunta', q: preguntaCompas(), item: true });
    if (LEC.contar) t.push(contarTarea(LEC.contar, modo));
    const mezcla = [];
    if (LEC.palabras.length) tareasDePalabras(LEC.palabras, modo, 10).forEach(x => mezcla.push(x));
    LEC.preguntas.forEach(q => mezcla.push({ tipo: 'pregunta', q, item: true }));
    // las preguntas de la lección se reparten entre las palabras
    t = t.concat(LEC.palabras.length ? mezcla : barajar(mezcla));
  } else {
    const g = sel.grado, m = sel.materia, tema = sel.tema, n = modo === 'facil' ? 6 : modo === 'media' ? 8 : 10;
    if (m === 'ingles') t = tareasDePalabras(TC.palabrasDe(tema, g), modo, n);
    else if (m === 'danza') {
      if (tema === 'pulso') t = [{ tipo: 'pulso', item: true }, { tipo: 'golpes' }, { tipo: 'pulso', item: true, doble: true }, { tipo: 'pulso', item: true }];
      else if (tema === 'danzas') t = TC.preguntasDanza(n, g).map(q => ({ tipo: 'pregunta', q, item: true }));
      else { const sq = TC.SECUENCIAS[tema.replace('sec:', '')] || TC.SECUENCIAS.cuatro; t = tareasDePasos(sq.s, modo, g >= 5); }
    } else if (m === 'matematicas' && /^contar:/.test(tema)) {
      const k = +tema.split(':')[1]; t = [contarTarea(k, modo)];
      if (modo !== 'facil') t.push({ tipo: 'golpes' }, Object.assign(contarTarea(k, modo), { desde: 3 + Math.floor(Math.random() * 3) }));
    } else if (RC) {
      const op = { tiene: Voz.tiene, modo };
      t = RC.generar(m, tema, g, n, op).map(q => ({ tipo: 'pregunta', q, item: true }));
    }
  }
  if (!t.length) t = [{ tipo: 'pulso', item: true }];
  return rellenar(t);
}

/* ---------- el reloj de la pista ---------- */
const spb = () => 60 / S.bpm;
const winB = () => S.P.win / spb();
const leadB = () => Math.ceil(S.P.lead / spb());
const alCompas = x => Math.ceil(x / S.B - 1e-6) * S.B;
/** El pulso de la pista ahora: el de la música menos lo que se esperó; congelado mientras una nota espera. */
function chartAhora() {
  let c = motor.pulso() - S.off;
  if (S.hold != null) { if (c < S.hold) return S.hold; S.hold = null; }
  const n = S.espera;
  if (n && !n.estado) { const lim = n.b + (S.sinPrisa ? 0 : winB()); if (c > lim) { S.off += c - lim; c = lim; } }
  return c;
}
// la nota que espera ya se tocó: la pista sigue en el próximo compás de la música (los pulsos siguen cuadrando)
function soltarEspera() {
  if (!S.espera) return;
  const c = motor.pulso() - S.off;
  S.hold = c; S.off = Math.ceil((S.off - 1e-6) / S.B) * S.B; S.espera = null;
}

/* ---------- los carriles: lo que dice cada botón ---------- */
function carrilesInstrumentos() { return S.R.carriles.map((k, i) => ({ texto: TM.NOMBRE_INS[k] || k, emoji: TM.EMOJI_INS[k] || '🥁', glifo: i, sonido: k })); }
function carrilesSilabas() { return [{ texto: 'suave', emoji: '', glifo: 0, sonido: 'suave', chico: true }, { texto: 'FUERTE', emoji: '', glifo: 1, sonido: 'fuerte', grande: true }, { texto: 'suave', emoji: '', glifo: 2, sonido: 'suave', chico: true }]; }
function carrilesPasos(pasos) { return [...new Set(pasos.map(p => p[0]))].map((n, i) => ({ texto: TC.PASOS[n].nombre, emoji: TC.PASOS[n].emoji, glifo: i, sonido: 'paso', paso: n })); }
function carrilesOpciones(q) { return q.opciones.map((o, i) => ({ texto: sinEmoji(o), emoji: emojiDe(o), glifo: i, sonido: null, en: q.opEn ? o : '' })); }
const TECLAS = {
  1: [[' ', 'f', 'j', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright', '1']],
  2: [['f', 'arrowleft', '1'], ['j', 'arrowright', '2']],
  3: [['f', 'arrowleft', '1'], [' ', 'arrowdown', 'arrowup', '2'], ['j', 'arrowright', '3']],
  4: [['d', 'arrowleft', '1'], ['f', 'arrowdown', '2'], ['j', 'arrowup', '3'], ['k', 'arrowright', '4']]
};
const NOMBRE_TECLA = { ' ': 'Espacio', f: 'F', j: 'J', d: 'D', k: 'K', arrowleft: '←', arrowright: '→', arrowup: '↑', arrowdown: '↓' };
let carriles = [];
function ponerCarriles(lista) {
  const clave = lista.map(c => c.texto + c.emoji + (c.en || '')).join('|');
  if (clave === S.carrilesClave) return;
  S.carrilesClave = clave; carriles = lista;
  const cont = $('carriles'); cont.innerHTML = ''; cont.style.setProperty('--n', lista.length);
  const teclas = TECLAS[lista.length] || TECLAS[3];
  lista.forEach((c, i) => {
    const b = document.createElement('button'); b.type = 'button'; b.className = 'carril' + (c.grande ? ' grande' : '') + (c.chico ? ' chico' : '') + (c.texto.length > 11 ? ' largo' : '');
    const g = GLIFOS[c.glifo % 4]; b.style.setProperty('--c', g.c);
    const t = teclas[i] || [];
    const tec = t.filter(k => k.length > 1 && NOMBRE_TECLA[k]).slice(0, 1).concat(t.filter(k => k.length === 1 && NOMBRE_TECLA[k]).slice(0, 1)).map(k => NOMBRE_TECLA[k]).join(' ');
    b.innerHTML = '<span class="gl" aria-hidden="true"></span><span class="tx"></span><small class="tec" aria-hidden="true"></small>';
    b.querySelector('.gl').textContent = c.emoji || g.f; b.querySelector('.tx').textContent = c.texto + (c.en ? ' 🔊' : ''); b.querySelector('.tec').textContent = tec;
    b.setAttribute('aria-label', (lista.length > 1 ? (i + 1) + ', ' + g.n + ': ' : '') + c.texto + (tec ? ' (tecla ' + tec + ')' : ''));
    if (c.en) b.lang = 'en';
    b.addEventListener('pointerdown', ev => { if (ev.button > 0) return; ev.preventDefault(); tocar(i); });
    b.addEventListener('click', ev => { if (ev.detail === 0) tocar(i); }); // Enter o Espacio con el foco en el botón
    b.addEventListener('contextmenu', ev => ev.preventDefault());
    cont.appendChild(b);
  });
  medirPista();
}

/* ---------- las rondas: cada tarea se vuelve un tramo de la pista con sus notas ---------- */
function nota(o) { const n = Object.assign({ b: 0, lane: -1, estado: null, espera: false, cuenta: false }, o); S.notas.push(n); return n; }
function siguienteTramo() {
  const t = S.tareas.shift();
  if (!t) return null;
  const seg = { t, tipo: t.tipo, ini: S.cursor, fin: S.cursor, eventos: [], notas: [], entro: false, salio: false, bien: 0, mal: 0, n: 0 };
  const L = leadB(), B = S.B, P = S.P;
  // si cambian los carriles, la primera nota cae después del tiempo de acercarse (para que no baje con otros letreros)
  const lista = t.tipo === 'golpes' ? carrilesInstrumentos() : t.tipo === 'silabas' ? carrilesSilabas() : /mira|juntos|memoria/.test(t.tipo) ? carrilesPasos(t.pasos)
    : t.tipo === 'pulso' ? [{ texto: 'Pulso', emoji: '👣', glifo: 1, sonido: 'paso' }] : t.tipo === 'pregunta' ? carrilesOpciones(t.q) : null;
  seg.carriles = lista;
  const clave = lista ? lista.map(c => c.texto).join('|') : 'contar';
  const mismo = clave === S.ultClave && t.tipo !== 'pregunta'; S.ultClave = clave; seg.visible = mismo; // con los mismos carriles, sus notas bajan antes de que empiece
  const primera = x => (mismo ? alCompas(seg.ini + x) : alCompas(seg.ini + Math.max(L, x)));
  const espG = S.sinPrisa || P.espera;
  if (t.tipo === 'golpes' && S.sinPrisa) { seg.fin = alCompas(seg.ini + 1); }
  else if (t.tipo === 'golpes') {
    const r0 = primera(0), largo = alCompas(8);
    const patron = P.modo === 'facil' ? [0] : P.modo === 'media' ? [...Array(B).keys()] : (B === 2 ? [0, 1, 1.5] : [0, 1, 2, 2.5]);
    const orden = B === 2 ? [0, 1, 2, 1, 0, 2, 1, 2] : [0, 1, 2, 0, 2, 1, 1, 2, 0];
    let k = 0;
    for (let c = 0; c < largo; c += B) patron.forEach(p => { seg.notas.push(nota({ tipo: 'golpe', b: r0 + c + p, lane: orden[k++ % orden.length], seg })); });
    seg.fin = r0 + largo;
  } else if (t.tipo === 'pregunta') {
    const q = t.q, lect = P.lectura + (q.opEn ? q.opciones.length * 1.6 / spb() : 0) + (q.escucha ? 1.5 : 0);
    const rb = alCompas(seg.ini + Math.max(L, lect));
    seg.notas.push(nota({ tipo: 'fila', b: rb, seg, q, cuenta: true, espera: S.sinPrisa || P.modo === 'facil' }));
    seg.fin = rb + B;
  } else if (t.tipo === 'silabas') {
    const sil = t.sil, dm = alCompas(seg.ini + 2), rs = alCompas(dm + sil.length);
    sil.forEach((s, k) => seg.eventos.push({ b: dm + k, fn: () => demoSilaba(seg, k) }));
    seg.eventos.push({ b: rs - 0.01, fn: () => { seg.respuesta = true; pintarCarta(seg); } });
    sil.forEach((s, k) => seg.notas.push(nota({ tipo: 'silaba', b: rs + k, seg, k, f: s.f, lane: P.acento ? (s.f ? 1 : (k % 2 ? 2 : 0)) : -1, cuenta: true, espera: espG })));
    seg.fin = alCompas(rs + sil.length) + (B === 2 ? 2 : 0);
  } else if (t.tipo === 'pulso') {
    const r0 = primera(2), largo = t.doble ? alCompas(12) : alCompas(8);
    for (let k = 0; k < largo; k++) seg.notas.push(nota({ tipo: 'pulso', b: r0 + k, lane: 0, seg, cuenta: true, espera: S.sinPrisa }));
    seg.fin = r0 + largo;
  } else if (t.tipo === 'mira' || t.tipo === 'juntos' || t.tipo === 'memoria') {
    const r0 = t.tipo === 'mira' ? alCompas(seg.ini + 2) : primera(1), lanes = carrilesPasos(t.pasos);
    let b = r0; seg.cartas = [];
    t.pasos.forEach(([p, k], i) => {
      const lane = lanes.findIndex(c => c.paso === p);
      seg.cartas.push({ p, k, b });
      if (t.tipo === 'mira') seg.eventos.push({ b, fn: () => { pasoBailarin(p, k); seg.ahora = i; pintarRejilla(seg); motor.golpe(p === 'palmas' ? 'palmas' : p === 'zapateo' ? 'zapateo' : 'paso'); } });
      else seg.notas.push(nota({ tipo: t.tipo === 'juntos' ? 'paso' : 'memoria', b, lane: t.tipo === 'juntos' ? lane : -1, bueno: lane, paso: p, dur: k, i, seg, cuenta: true, espera: S.sinPrisa || (t.tipo === 'memoria' && P.modo !== 'normal') || (t.tipo === 'juntos' && P.espera) }));
      b += k;
    });
    seg.fin = alCompas(b) + (t.tipo === 'mira' ? B : 0);
  } else if (t.tipo === 'contar') {
    const paso = Math.max(B, Math.ceil(4 / B) * B * (P.modo === 'normal' ? 1 : 1)), r0 = alCompas(seg.ini + Math.max(L, 4));
    const desde = t.desde || 0, nums = t.nums.slice(desde);
    seg.cadena = t.nums.slice(0, desde);
    nums.forEach((v, i) => {
      const malas = barajar([v + t.n, v - t.n, v + 1, v - 1, v + 2].filter(x => x > 0 && x !== v)).slice(0, 2);
      const ops = barajar([v].concat(malas).map(String));
      seg.notas.push(nota({ tipo: 'fila', b: r0 + i * paso, seg, q: { p: '', opciones: ops, correcta: ops.indexOf(String(v)) }, v, cuenta: true, espera: S.sinPrisa || P.modo === 'facil' }));
    });
    seg.fin = r0 + nums.length * paso;
  }
  if (t.item && t.tipo !== 'contar') { S.rondas++; }
  S.cursor = seg.fin; S.segs.push(seg);
  return seg;
}
function planificar(c) {
  while (!S.cerrando) {
    const ult = S.segs[S.segs.length - 1];
    if (ult && ult.fin > c + 14) break;
    if (!siguienteTramo()) { S.cerrando = true; S.finB = alCompas(S.cursor + 1) + S.B; break; }
  }
}

/* ---------- entrar y salir de cada ronda ---------- */
function entrar(seg) {
  seg.entro = true; S.actual = seg; const t = seg.t;
  if (seg.carriles) ponerCarriles(seg.carriles);
  if (t.item) S.ronda++;
  document.body.classList.toggle('sin-compas', !!(t.q && t.q.ocultaCompas));
  pintarCarta(seg);
  if (t.tipo === 'pregunta') {
    const q = t.q;
    if (q.oir) Voz.decir(q.oir, { grupo: 'q', vigente: () => S.actual === seg });
    if (q.opEn) cantarOpciones(seg);
    anunciar((q.escucha ? 'Escucha y elige. ' : '') + sinEmoji(q.p) + ' Opciones: ' + q.opciones.map((o, i) => (i + 1) + ', ' + sinEmoji(o)).join('; ') + '.');
  } else if (t.tipo === 'silabas') {
    Voz.decir(t.w.en, { grupo: 'q', vigente: () => S.actual === seg }).then(ok => { if (ok === false && t.escucha && !seg.visto) { seg.visto = true; pintarCarta(seg); } });
    anunciar('Escucha la palabra' + (t.escucha ? '' : ' ' + t.w.en) + ' y toca un golpe por sílaba: fuerte en la del acento.');
  } else if (t.tipo === 'golpes') anunciar('¡A tocar con la banda! Toca cada nota cuando llegue a la línea.');
  else if (t.tipo === 'pulso') anunciar('Marca el pulso: un golpe en cada pulso, cuando el círculo late.');
  else if (t.tipo === 'mira') anunciar('Mira los pasos: ' + t.pasos.map(p => TC.PASOS[p[0]].nombre).join(', ') + '.');
  else if (t.tipo === 'juntos') anunciar('Ahora tú: toca cada paso cuando llegue a la línea.');
  else if (t.tipo === 'memoria') anunciar('De memoria: los pasos en el mismo orden, sin dibujo.');
  else if (t.tipo === 'contar') anunciar('Cuenta de ' + t.n + ' en ' + t.n + ': toca el número que sigue.');
}
function salir(seg) {
  seg.salio = true; const t = seg.t;
  if (!t.item) return;
  let ok;
  if (t.tipo === 'pulso' || t.tipo === 'juntos') ok = seg.n ? seg.bien / seg.n >= 0.6 : true;
  else if (t.tipo === 'contar') return; // cada número ya contó
  else ok = seg.mal === 0 && seg.bien >= seg.n;
  contar(ok, t);
}
function contar(ok, t, item) {
  if (t && t.repaso) return; // el repaso no cuenta (como en los demás juegos)
  S.total++; if (ok) S.aciertos++;
  if (!ok) {
    S.repasar.push(item || t);
    if (S.P.repaso && t && t.tipo !== 'golpes' && !t.repaso && t.tipo !== 'contar' && t.tipo !== 'pulso') {
      const copia = Object.assign({}, t, { repaso: true }); S.tareas.push(copia);
      if (S.cerrando) { S.cerrando = false; S.finB = Infinity; }
    }
  }
  avisarLeccion(false);
}

/* ---------- tocar ---------- */
function tocar(i) {
  if (S.fase !== 'juego' || S.pausa) return;
  if (i >= carriles.length) return;
  const c = chartAhora(), w = winB(), L = leadB() + 1;
  const lane = carriles[i];
  apretar(i);
  // la nota más cercana que este toque puede resolver
  let mejor = null, dm = Infinity;
  S.notas.forEach(n => {
    if (n.estado || !n.seg.entro) return;
    const d = c - n.b, ad = Math.abs(d);
    const fila = n.tipo === 'fila' || n.tipo === 'memoria';
    const vale = n === S.espera || ad <= w || (fila && d >= -L && d < w) || (n.tipo === 'silaba' && d >= -0.5 && d < w);
    if (!vale) return;
    if (n.tipo === 'golpe' && n.lane !== i) return;
    if (ad < dm) { dm = ad; mejor = n; }
  });
  if (!mejor) { // nada que tocar: suena igual (es un tambor); una opción en inglés dice su palabra
    if (lane.en) Voz.decir(lane.en, { grupo: 'op' }); else motor.golpe(lane.sonido || 'suave', 0.6);
    destellar(i, null); return;
  }
  resolver(mejor, i, c);
}
function juicio(n, c) {
  if (n === S.espera || S.sinPrisa) return 'bien';
  const ds = Math.abs(c - n.b) * spb();
  return ds <= S.P.perf ? 'perfecto' : ds <= S.P.win ? 'bien' : 'pronto';
}
function resolver(n, i, c) {
  const j = juicio(n, c), seg = n.seg, t = seg.t;
  let ok = true;
  if (n.tipo === 'fila') ok = i === n.q.correcta;
  else if (n.tipo === 'silaba') ok = (i === 1) === n.f;
  else if (n.tipo === 'paso' || n.tipo === 'memoria') ok = i === n.bueno;
  n.estado = ok ? 'bien' : 'mal'; n.toque = i; n.juicio = j;
  if (n === S.espera) soltarEspera();
  // el sonido
  const lane = carriles[i] || {};
  if (n.tipo === 'silaba') motor.golpe(i === 1 ? 'fuerte' : 'suave');
  else if (n.tipo === 'golpe' || n.tipo === 'pulso') motor.golpe(lane.sonido || 'alegre');
  else if (n.tipo === 'paso' || n.tipo === 'memoria') motor.golpe(n.paso === 'palmas' ? 'palmas' : n.paso === 'zapateo' ? 'zapateo' : 'paso');
  if (n.cuenta) { seg.n++; if (ok) seg.bien++; else { seg.mal++; S.fallos++; } }
  // los puntos
  const base = j === 'perfecto' ? 100 : j === 'bien' ? 70 : 40;
  if (ok) {
    S.combo++; S.mejorCombo = Math.max(S.mejorCombo, S.combo); if (j === 'perfecto') S.perfectos++;
    S.puntos += Math.round(base * (S.combo >= 16 ? 3 : S.combo >= 8 ? 2 : 1)) + (n.tipo === 'fila' ? 200 : 0);
  } else { S.combo = 0; }
  destellar(i, ok ? j : 'mal', n);
  // lo que pasa en cada tipo
  if (n.tipo === 'fila') {
    const q = n.q, buena = q.opciones[q.correcta];
    if (ok) { motor.golpe('bien'); if (mundo) mundo.celebrar(true); if (q.opEn) Voz.decir(buena, { grupo: 'r' }); }
    else { motor.golpe('mal'); if (mundo) mundo.triste(); }
    if (t.tipo === 'contar') {
      seg.cadena.push(n.v); contar(ok, t, { p: 'De ' + t.n + ' en ' + t.n, opciones: [String(n.v)], correcta: 0 });
      feedback(ok ? '✔ ¡' + n.v + '!' : '✘ Era ' + n.v, ok); pintarCarta(seg);
    } else {
      feedback(ok ? '✔ ¡Correcto!' + (j === 'perfecto' || j === 'bien' ? ' ¡Al compás!' : '') : '✘ Era: ' + sinEmoji(buena), ok);
      anunciar(ok ? 'Correcto.' : 'No. Era ' + sinEmoji(buena) + '.');
      if (!ok) seg.vista = q.correcta;
      pintarCarta(seg);
    }
  } else if (n.tipo === 'silaba') {
    if (mundo && n.f && ok) mundo.paso('palmas', spb() * 0.9);
    seg.toques = seg.toques || []; seg.toques[n.k] = ok ? 'ok' : 'x'; pintarCarta(seg);
    if (!ok) feedback(n.f ? '✘ Esa era la FUERTE (centro)' : '✘ Esa era suave (a un lado)', false);
  } else if (n.tipo === 'paso') {
    if (ok) pasoBailarin(n.paso, n.dur); else feedback('✘ Era: ' + TC.PASOS[n.paso].nombre, false);
    seg.ahora = n.i; pintarRejilla(seg);
  } else if (n.tipo === 'memoria') {
    pasoBailarin(n.paso, n.dur); seg.ahora = n.i; seg.vistas = (seg.vistas || 0) + 1; n.mostrar = true;
    if (!ok) feedback('✘ Era: ' + TC.PASOS[n.paso].emoji + ' ' + TC.PASOS[n.paso].nombre, false);
    pintarRejilla(seg);
  } else if (n.tipo === 'pulso') { if (mundo && seg.bien % 2 === 0) mundo.paso(seg.bien % 4 ? 'adelante' : 'atras', spb() * 0.9); }
  if (mundo) mundo.animo(clamp(S.combo / 12, 0.2, 1));
}
function perder(n) {
  n.estado = 'perdida'; S.combo = 0;
  const seg = n.seg;
  if (n.cuenta) { seg.n++; seg.mal++; S.fallos++; }
  destellar(n.lane >= 0 ? n.lane : Math.floor(carriles.length / 2), 'perdida', n);
  if (n.tipo === 'fila') {
    const q = n.q, buena = q.opciones[q.correcta];
    if (seg.t.tipo === 'contar') { seg.cadena.push(n.v); contar(false, seg.t, { p: 'De ' + seg.t.n + ' en ' + seg.t.n, opciones: [String(n.v)], correcta: 0 }); feedback('Se pasó: era ' + n.v, false); }
    else { feedback('¡Se pasó! Era: ' + sinEmoji(buena) + (S.P.repaso ? ' (vuelve luego)' : ''), false); seg.vista = q.correcta; }
    pintarCarta(seg);
  } else if (n.tipo === 'memoria') { n.mostrar = true; pintarRejilla(seg); }
  else if (n.tipo === 'silaba') { seg.toques = seg.toques || []; seg.toques[n.k] = 'x'; pintarCarta(seg); }
}

/* ---------- la demostración: la banda toca la palabra y el bailarín da los pasos ---------- */
function demoSilaba(seg, k) {
  const s = seg.t.sil[k];
  motor.demo(s.f); seg.demo = k; pintarCarta(seg);
  if (mundo && s.f) mundo.paso('palmas', spb() * 0.8);
}
function pasoBailarin(p, k) { if (mundo) mundo.paso(p, Math.max(0.35, (k || 1) * spb() * 0.95)); }
function cantarOpciones(seg) {
  // cada opción en inglés suena con su carril encendido, una tras otra
  const q = seg.t.q;
  q.opciones.reduce((pr, o, i) => pr.then(() => { if (S.actual !== seg) return false; marcarCarril(i, true); return Voz.decir(o, { grupo: 'op' + i, caduca: 9000, vigente: () => S.actual === seg }).then(r => { marcarCarril(i, false); return r; }); }), Promise.resolve());
}
function marcarCarril(i, b) { const el = $('carriles').children[i]; if (el) el.classList.toggle('suena', b); }

/* ---------- la carta: la pregunta, la palabra, la secuencia o la cuenta ---------- */
function pintarCarta(seg) {
  const t = seg.t, carta = $('carta'), h = $('cTit'), cu = $('cCuerpo');
  carta.classList.remove('oculto'); cu.innerHTML = ''; $('cFeed').textContent = ''; $('cFeed').className = 'feed';
  $('bOir').classList.add('oculto'); $('bVer').classList.add('oculto');
  carta.dataset.tipo = t.tipo;
  if (t.tipo === 'golpes') { h.textContent = '🎶 ¡Toca con la banda!'; const p = document.createElement('p'); p.className = 'sub'; p.textContent = 'Cada nota, cuando llegue a la línea.'; cu.appendChild(p); }
  else if (t.tipo === 'pregunta') {
    const q = t.q; h.textContent = (seg.vista != null ? '' : '') + (q.escucha && !seg.visto ? '🔊 ' : '') + q.p.replace(/^🔊\s*/, '');
    if (q.escucha) { const pw = document.createElement('p'); pw.className = 'palabra'; pw.lang = 'en'; pw.textContent = seg.visto || !Voz.tiene(q.oir) || motor.mudo ? q.palabra : '🔊 🔊 🔊'; cu.appendChild(pw); if (!seg.visto && Voz.tiene(q.oir) && !motor.mudo) $('bVer').classList.remove('oculto'); }
    if (q.oir && Voz.tiene(q.oir)) $('bOir').classList.remove('oculto');
    if (q.opEn) $('bOir').classList.remove('oculto');
    if (seg.vista != null) { const p = document.createElement('p'); p.className = 'era'; p.textContent = 'Era: ' + GLIFOS[seg.vista].f + ' ' + q.opciones[seg.vista]; cu.appendChild(p); }
  } else if (t.tipo === 'silabas') {
    // «escucha primero»: la palabra se ve cuando la banda empieza a tocarla (o con «Ver»)
    const w = t.w, oculta = t.escucha && !seg.visto && seg.demo == null && !seg.respuesta && Voz.tiene(w.en) && !motor.mudo;
    h.textContent = seg.respuesta ? '¡Tu turno! Un golpe por sílaba' : 'Escucha: ¿dónde va la fuerza?';
    const pw = document.createElement('p'); pw.className = 'palabra'; pw.lang = 'en';
    pw.textContent = (w.emoji ? w.emoji + ' ' : '') + (oculta ? '🔊 🔊 🔊' : w.en) + (oculta ? '' : '  = ' + w.es);
    cu.appendChild(pw);
    if (!oculta) {
      const fila = document.createElement('div'); fila.className = 'silabas'; fila.setAttribute('aria-label', 'Sílabas: ' + t.sil.map(s => s.f ? s.t.toUpperCase() : s.t).join(', '));
      const mostrarAcento = !seg.respuesta || S.P.acento || seg.n >= t.sil.length;
      t.sil.forEach((s, k) => {
        const e = document.createElement('span'); e.className = 'sil' + (s.f && mostrarAcento ? ' fuerte' : '') + (seg.demo === k && !seg.respuesta ? ' ahora' : '') + (seg.toques && seg.toques[k] ? ' ' + seg.toques[k] : '');
        e.textContent = (s.f && mostrarAcento ? s.t.toUpperCase() : s.t); e.setAttribute('aria-hidden', 'true');
        if (s.f && mostrarAcento) { const m = document.createElement('i'); m.textContent = '★'; e.prepend(m); }
        fila.appendChild(e);
      });
      cu.appendChild(fila);
    }
    if (Voz.tiene(w.en)) $('bOir').classList.remove('oculto');
    if (oculta) $('bVer').classList.remove('oculto');
  } else if (t.tipo === 'pulso') { h.textContent = '💓 Marca el pulso'; const p = document.createElement('p'); p.className = 'sub'; p.textContent = 'Un golpe en cada pulso, cuando el círculo late.'; cu.appendChild(p); }
  else if (/mira|juntos|memoria/.test(t.tipo)) {
    h.textContent = t.tipo === 'mira' ? '👀 Mira los pasos' : t.tipo === 'juntos' ? '💃 ¡Ahora tú! Cada paso en la línea' : '🧠 De memoria: el mismo orden';
    const r = document.createElement('div'); r.className = 'rejilla'; r.id = 'rejilla'; cu.appendChild(r); pintarRejilla(seg);
  } else if (t.tipo === 'contar') {
    h.textContent = '🦘 Cuenta de ' + t.n + ' en ' + t.n;
    const p = document.createElement('p'); p.className = 'cadena'; const cad = (seg.cadena || []).slice(-5);
    p.textContent = (seg.cadena && seg.cadena.length > 5 ? '… ' : '') + cad.join(' · ') + (cad.length ? ' · ' : '') + '?';
    cu.appendChild(p);
  }
}
function pintarRejilla(seg) {
  const r = $('rejilla'); if (!r || !seg.cartas) return; r.innerHTML = '';
  const B = S.B; let acum = 0;
  seg.cartas.forEach((c, i) => {
    const P = TC.PASOS[c.p], n = seg.notas.find(x => x.i === i);
    const tapada = seg.t.tipo === 'memoria' && !(n && (n.estado || n.mostrar));
    const e = document.createElement('div'); e.className = 'carta-paso' + (seg.ahora === i ? ' ahora' : '') + (n && n.estado === 'bien' ? ' ok' : n && n.estado ? ' x' : '');
    e.style.flexGrow = c.k; e.style.setProperty('--k', c.k);
    e.innerHTML = '<b aria-hidden="true"></b><span></span><small></small>';
    e.querySelector('b').textContent = tapada ? '❓' : P.emoji; e.querySelector('span').textContent = tapada ? '?' : P.nombre;
    e.querySelector('small').textContent = c.k > 1 ? c.k + ' pulsos' : '1 pulso';
    r.appendChild(e);
    acum += c.k;
    if (acum % B === 0 && i < seg.cartas.length - 1) { const s = document.createElement('i'); s.className = 'barra'; s.setAttribute('aria-hidden', 'true'); r.appendChild(s); }
  });
  r.setAttribute('aria-label', 'La secuencia: ' + seg.cartas.map(c => TC.PASOS[c.p].nombre + (c.k > 1 ? ' (' + c.k + ' pulsos)' : '')).join(', '));
}
function feedback(txt, ok) { const f = $('cFeed'); f.textContent = txt; f.className = 'feed ' + (ok ? 'bien' : 'mal'); }
function oir() {
  const seg = S.actual; if (!seg) return; const t = seg.t;
  if (t.tipo === 'silabas') Voz.decir(t.w.en, { grupo: 'q' });
  else if (t.tipo === 'pregunta') { if (t.q.opEn) cantarOpciones(seg); else if (t.q.oir) Voz.decir(t.q.oir, { grupo: 'q' }); }
}
function ver() { const seg = S.actual; if (!seg || seg.visto) return; seg.visto = true; pintarCarta(seg); const t = seg.t; anunciar('La palabra: ' + (t.w ? t.w.en : t.q.palabra)); }

/* ---------- la pista (lienzo 2D sobre la tarima) ---------- */
const pista = $('pista'), px = pista.getContext('2d');
let PW = 0, PH = 0, DPR = 1, geo = null;
function medirPista() {
  DPR = Math.min(window.devicePixelRatio || 1, 2);
  const w = innerWidth, h = innerHeight; PW = w; PH = h;
  pista.width = Math.round(w * DPR); pista.height = Math.round(h * DPR); pista.style.width = w + 'px'; pista.style.height = h + 'px';
  // de lado (computador, video beam): la carta a la izquierda, la pista en el centro y el bailarín encima
  const angosto = w / h < 0.9, lateral = w >= 760 && w / h >= 1.05;
  const ancho = lateral ? clamp(w - 2 * clamp(w * 0.28, 230, 320), 340, 640) : angosto ? w - 16 : Math.min(640, w * 0.62);
  document.documentElement.style.setProperty('--pista', Math.round(ancho) + 'px');
  document.body.classList.toggle('lateral', lateral);
  const bot = $('carriles').getBoundingClientRect();
  const x0 = (w - ancho) / 2, lineY = (bot.top || h - 110) - 10, top = angosto ? h * 0.4 : h * 0.42;
  geo = { x0, ancho, lineY, top, alto: lineY - top, angosto };
  if (mundo) mundo.reservar((top + 14) / h);
}
addEventListener('resize', () => { medirPista(); });
// posición de una nota: u = 0 en la línea, 1 arriba
function proy(lane, n, u) {
  const k = 1 - 0.38 * u, cx = PW / 2, w = geo.ancho * k, y = geo.lineY - geo.alto * Math.pow(u, 0.9);
  const lw = w / n, x = cx - w / 2 + lw * (lane + 0.5);
  return { x, y, lw, k, izq: cx - w / 2, w };
}
const pops = [];
function destellar(i, j, n) {
  const n2 = carriles.length || 1, p = proy(n && n.lane < 0 ? (n2 - 1) / 2 : i, n2, 0);
  const txt = j === 'perfecto' ? '¡Perfecto!' : j === 'bien' ? '¡Bien!' : j === 'pronto' ? '✔' : j === 'mal' ? '✘' : j === 'perdida' ? 'Se fue' : '';
  pops.push({ x: n && n.lane < 0 && n.tipo !== 'silaba' ? PW / 2 : p.x, y: geo.lineY, txt, j, t: 0, ok: j && j !== 'mal' && j !== 'perdida' });
}
function apretar(i) { const el = $('carriles').children[i]; if (!el) return; el.classList.add('on'); setTimeout(() => el.classList.remove('on'), 110); }
function redondo(x, y, w, h, r) { px.beginPath(); px.moveTo(x + r, y); px.arcTo(x + w, y, x + w, y + h, r); px.arcTo(x + w, y + h, x, y + h, r); px.arcTo(x, y + h, x, y, r); px.arcTo(x, y, x + w, y, r); px.closePath(); }
function dibujarPista(dt) {
  px.setTransform(DPR, 0, 0, DPR, 0, 0); px.clearRect(0, 0, PW, PH);
  if (S.fase !== 'juego' && S.fase !== 'cuenta' || !geo) return;
  const n = Math.max(1, carriles.length), c = S.chart, L = leadB(), cal = S.calma;
  const a = proy(0, 1, 1), b = proy(0, 1, 0);
  // la pista
  px.beginPath(); px.moveTo(a.izq, a.y); px.lineTo(a.izq + a.w, a.y); px.lineTo(b.izq + b.w, b.y + 8); px.lineTo(b.izq, b.y + 8); px.closePath();
  const gr = px.createLinearGradient(0, a.y, 0, b.y); gr.addColorStop(0, 'rgba(20,14,48,0.15)'); gr.addColorStop(1, 'rgba(20,14,48,0.78)'); px.fillStyle = gr; px.fill();
  // carriles: un tinte por carril y la raya entre ellos
  for (let i = 0; i < n; i++) {
    const t0 = proy(i, n, 1), t1 = proy(i, n, 0), g = GLIFOS[(carriles[i] ? carriles[i].glifo : i) % 4];
    px.beginPath(); px.moveTo(t0.x - t0.lw / 2, t0.y); px.lineTo(t0.x + t0.lw / 2, t0.y); px.lineTo(t1.x + t1.lw / 2, t1.y); px.lineTo(t1.x - t1.lw / 2, t1.y); px.closePath();
    px.fillStyle = g.c + '22'; px.fill();
    if (i) { px.strokeStyle = 'rgba(255,255,255,.28)'; px.lineWidth = 2; px.beginPath(); px.moveTo(t0.x - t0.lw / 2, t0.y); px.lineTo(t1.x - t1.lw / 2, t1.y); px.stroke(); }
  }
  // las rayas de los pulsos (gruesas en el primero del compás): el pulso se ve bajar
  const B = S.B;
  for (let p = Math.ceil(c); p <= c + L; p++) {
    const u = (p - c) / L; if (u < 0 || u > 1) continue; const q = proy(0, 1, u), primero = ((p % B) + B) % B === 0;
    px.strokeStyle = primero ? 'rgba(255,224,102,.75)' : 'rgba(255,255,255,.28)'; px.lineWidth = primero ? 4 * q.k : 2 * q.k;
    px.beginPath(); px.moveTo(q.izq, q.y); px.lineTo(q.izq + q.w, q.y); px.stroke();
  }
  // la línea: destella en cada pulso (en calma, cambia de color sin destello)
  const fase = c - Math.floor(c), late = c >= 0 ? Math.pow(1 - fase, 3) : 0, primeroAhora = ((Math.floor(c) % B) + B) % B === 0;
  px.fillStyle = cal ? (fase < 0.3 ? '#ffe066' : '#fff4cc') : 'rgba(255,240,180,' + (0.75 + 0.25 * late) + ')';
  px.fillRect(b.izq - 4, geo.lineY - 4 - (cal ? 0 : late * 3), b.w + 8, 8 + (cal ? 0 : late * 6));
  if (!cal && late > 0.05) { px.fillStyle = 'rgba(255,224,102,' + (late * (primeroAhora ? 0.35 : 0.2)) + ')'; px.fillRect(b.izq, geo.lineY - 30 * late, b.w, 30 * late); }
  // las dianas
  for (let i = 0; i < n; i++) { const q = proy(i, n, 0), g = GLIFOS[(carriles[i] ? carriles[i].glifo : i) % 4], r = Math.min(30, q.lw * 0.3); px.lineWidth = 4; px.strokeStyle = '#fff'; px.fillStyle = g.c + '55'; forma(g.f, q.x, q.y, r); px.fill(); px.stroke(); }
  // las notas
  const notas = S.notas.filter(x => (x.seg.entro || x.seg.visible) && x.estado !== 'quitada' && (!x.estado || c - x.b < 0.5) && x.b - c <= L && x.b + (x.dur || 0) - c > -1.2).sort((x, y) => y.b - x.b);
  notas.forEach(x => dibujarNota(x, c, L, n));
  // lo que salta en la línea
  for (let i = pops.length - 1; i >= 0; i--) {
    const p = pops[i]; p.t += dt; if (p.t > 0.8) { pops.splice(i, 1); continue; }
    const al = 1 - p.t / 0.8;
    if (!cal && p.ok) { px.strokeStyle = 'rgba(255,224,102,' + al + ')'; px.lineWidth = 5; px.beginPath(); px.arc(p.x, p.y, 20 + p.t * 90, 0, 7); px.stroke(); }
    if (p.txt) { px.font = '800 ' + (p.j === 'perfecto' ? 26 : 22) + 'px "Baloo 2", sans-serif'; px.textAlign = 'center'; px.lineWidth = 5; px.strokeStyle = 'rgba(20,14,48,' + al + ')'; px.fillStyle = p.ok ? 'rgba(255,240,150,' + al + ')' : 'rgba(255,170,170,' + al + ')'; const y = p.y - 34 - (cal ? 0 : p.t * 40); px.strokeText(p.txt, p.x, y); px.fillText(p.txt, p.x, y); }
  }
}
function forma(f, x, y, r) {
  px.beginPath();
  if (f === '▲') { px.moveTo(x, y - r); px.lineTo(x + r * 0.95, y + r * 0.75); px.lineTo(x - r * 0.95, y + r * 0.75); px.closePath(); }
  else if (f === '■') { px.rect(x - r * 0.8, y - r * 0.8, r * 1.6, r * 1.6); }
  else if (f === '◆') { px.moveTo(x, y - r); px.lineTo(x + r, y); px.lineTo(x, y + r); px.lineTo(x - r, y); px.closePath(); }
  else px.arc(x, y, r, 0, 7);
}
function dibujarNota(x, c, L, n) {
  const u = clamp((x.b - c) / L, 0, 1), espera = x === S.espera && c >= x.b - 0.02;
  const hecho = !!x.estado, al = hecho ? clamp(1 - (c - x.b) * 2, 0, 1) : 1;
  px.globalAlpha = al;
  const ancha = x.tipo === 'fila' || x.tipo === 'memoria' || (x.tipo === 'silaba' && x.lane < 0);
  if (x.dur > 1 && !ancha) { // la cola de un paso de varios pulsos
    const q0 = proy(x.lane, n, u), q1 = proy(x.lane, n, clamp((x.b + x.dur - 0.3 - c) / L, 0, 1));
    px.fillStyle = 'rgba(255,255,255,.35)'; px.fillRect(q0.x - q0.lw * 0.12, q1.y, q0.lw * 0.24, q0.y - q1.y);
  }
  if (ancha) {
    const q = proy(0, 1, u), h = 46 * q.k, y = q.y - h / 2, w = q.w - 8 * q.k, x0 = q.izq + 4 * q.k;
    px.fillStyle = hecho ? (x.estado === 'bien' ? '#2b8a3e' : '#c92a2a') : espera ? '#ffd43b' : '#fff8e6'; px.strokeStyle = '#1d1440'; px.lineWidth = 4 * q.k;
    redondo(x0, y, w, h, 14 * q.k); px.fill(); px.stroke();
    px.fillStyle = hecho ? '#fff' : '#1d1440'; px.textAlign = 'center'; px.textBaseline = 'middle';
    if (x.tipo === 'fila') {
      // una casilla por carril, con su forma: la fila se toca en el carril de la respuesta
      for (let i = 0; i < n; i++) { const qq = proy(i, n, u), g = GLIFOS[i % 4]; px.fillStyle = hecho && i === x.toque ? '#fff' : g.c; forma(g.f, qq.x, q.y, 13 * q.k); px.fill(); }
    } else if (x.tipo === 'memoria') {
      px.font = '800 ' + Math.round(26 * q.k) + 'px "Baloo 2", sans-serif'; px.fillText(x.mostrar || hecho ? TC.PASOS[x.paso].emoji + ' ' + TC.PASOS[x.paso].nombre : '❓', PW / 2, q.y + 1);
    } else {
      const s = x.seg.t.sil[x.k]; px.font = '800 ' + Math.round(28 * q.k) + 'px "Baloo 2", sans-serif'; px.fillText(s.t, PW / 2, q.y + 1);
    }
    if (espera && !S.calma) { px.strokeStyle = 'rgba(255,224,102,' + (0.5 + 0.5 * Math.sin(performance.now() / 120)) + ')'; px.lineWidth = 4; redondo(x0 - 6, y - 6, w + 12, h + 12, 18); px.stroke(); }
  } else {
    const q = proy(x.lane, n, u), g = GLIFOS[(carriles[x.lane] ? carriles[x.lane].glifo : x.lane) % 4];
    const grande = x.tipo === 'silaba' ? (x.f ? 1.35 : 0.8) : x.tipo === 'pulso' ? 1.2 : 1;
    const r = Math.min(34, q.lw * 0.32) * q.k * grande;
    px.fillStyle = hecho ? (x.estado === 'bien' ? '#ffe066' : '#c92a2a') : g.c; px.strokeStyle = espera ? '#ffd43b' : '#fff'; px.lineWidth = (espera ? 6 : 4) * q.k;
    // la sombra de la gema
    px.save(); px.translate(0, 5 * q.k); px.fillStyle = 'rgba(0,0,0,.35)'; forma(g.f, q.x, q.y, r); px.fill(); px.restore();
    forma(g.f, q.x, q.y, r); px.fill(); px.stroke();
    px.fillStyle = '#fff'; px.textAlign = 'center'; px.textBaseline = 'middle';
    const tx = x.tipo === 'silaba' ? x.seg.t.sil[x.k].t : x.tipo === 'paso' ? TC.PASOS[x.paso].emoji : x.tipo === 'pulso' ? '👣' : '';
    if (tx) { px.font = '800 ' + Math.round((x.tipo === 'silaba' ? 20 : 24) * q.k * (x.tipo === 'silaba' && x.f ? 1.15 : 1)) + 'px "Baloo 2", sans-serif'; px.lineWidth = 3; px.strokeStyle = 'rgba(0,0,0,.5)'; if (x.tipo === 'silaba') px.strokeText(x.f ? tx.toUpperCase() : tx, q.x, q.y + 1); px.fillText(x.tipo === 'silaba' && x.f ? tx.toUpperCase() : tx, q.x, q.y + 1); }
  }
  px.globalAlpha = 1;
}

/* ---------- el pulso que se ve: el círculo que late y los puntos del compás ---------- */
function latido(c) {
  const B = S.B, p = Math.floor(c), en = ((p % B) + B) % B, fase = c - p;
  const el = $('latido'), k = c < 0 ? 0 : Math.pow(1 - fase, 2.5);
  el.style.setProperty('--k', S.calma ? (fase < 0.25 ? 1 : 0) : k);
  el.classList.toggle('uno', en === 0);
  const num = c < 0 ? '' : String(en + 1); if ($('lNum').textContent !== num) $('lNum').textContent = num;
  const puntos = $('lPuntos');
  if (puntos.children.length !== B) { puntos.innerHTML = ''; for (let i = 0; i < B; i++) { const s = document.createElement('i'); if (!i) s.className = 'p1'; puntos.appendChild(s); } }
  [...puntos.children].forEach((s, i) => s.classList.toggle('on', c >= 0 && i === en));
}

/* ---------- el bucle ---------- */
let tAnt = performance.now(), tHud = 0;
function bucle(ahora) {
  requestAnimationFrame(bucle);
  const dt = Math.min(0.1, (ahora - tAnt) / 1000); tAnt = ahora;
  let pulsoVis = 0;
  if ((S.fase === 'juego' || S.fase === 'cuenta') && !S.pausa) {
    const c = chartAhora(); S.chart = c; pulsoVis = motor.pulso();
    if (S.fase === 'cuenta') {
      const falta = Math.ceil(-c); mostrarCuenta(c < 0 ? String(Math.max(1, S.cuentaN - falta + 1)) : '¡Ya!');
      if (c >= 0) { S.fase = 'juego'; setTimeout(() => { if (S.fase === 'juego') mostrarCuenta(''); }, 500); }
    }
    planificar(c);
    S.segs.forEach(seg => {
      if (!seg.entro && c >= seg.ini) entrar(seg);
      if (seg.entro) seg.eventos.forEach(ev => { if (!ev.hecho && c >= ev.b) { ev.hecho = true; ev.fn(); } });
      if (seg.entro && !seg.salio && c >= seg.fin && seg.notas.every(x => x.estado)) salir(seg);
    });
    // las notas que se pasaron (las que esperan no se pierden: congelan la pista)
    const w = winB();
    let primeraEspera = null;
    S.notas.forEach(n => {
      if (n.estado || !n.seg.entro) return;
      if (n.espera) { if (!primeraEspera || n.b < primeraEspera.b) primeraEspera = n; return; }
      if (c > n.b + w) perder(n);
    });
    if (primeraEspera && (!S.espera || S.espera.estado)) S.espera = primeraEspera;
    if (S.auto) autoTocar(c);
    // contar: los botones dicen las opciones de la fila que viene (cada fila trae las suyas)
    if (S.actual && S.actual.tipo === 'contar') {
      const sig = S.actual.notas.find(n => !n.estado);
      if (sig && sig !== S.actual.filaVista) { S.actual.filaVista = sig; ponerCarriles(carrilesOpciones(sig.q)); }
    }
    // limpiar
    if (S.notas.length > 60) S.notas = S.notas.filter(n => !n.estado || c - n.b < 3);
    if (S.segs.length > 6) S.segs = S.segs.filter(s => !s.salio || s === S.actual);
    if (S.fase === 'juego') latido(c);
    if (S.cerrando && c >= S.finB && S.notas.every(n => n.estado)) terminar();
    tHud -= dt; if (tHud <= 0) { tHud = 0.2; hud(); }
  } else if (S.fase === 'menu' || S.fase === 'fin') pulsoVis = performance.now() / 1000 * 1.5;
  else pulsoVis = motor.pulso();
  dibujarPista(dt);
  if (mundo) mundo.cuadro(dt, pulsoVis, motor.sonados());
}
function autoTocar(c) {
  S.notas.forEach(n => {
    if (n.estado || !n.seg.entro || c < n.b - 0.02) return;
    const i = n.tipo === 'fila' ? n.q.correcta : n.tipo === 'silaba' ? (n.f ? 1 : 0) : n.tipo === 'paso' || n.tipo === 'memoria' ? n.bueno : n.lane;
    resolver(n, Math.max(0, i), c);
  });
}

/* ---------- empezar, pausar, terminar ---------- */
function elegirRitmo() {
  if (LEC && LEC.ritmo) return LEC.ritmo;
  if (LEC) return pick(['cumbia', 'bambuco', 'currulao', 'joropo']);
  if (sel.ritmo !== 'azar' && ritmoLibre(sel.ritmo)) return sel.ritmo;
  return pick(Object.keys(RITMOS).filter(ritmoLibre));
}
const ritmoLibre = id => LEC || (prefs.estrellas || 0) >= (DESBLOQUEO[id] || 0);
function empezar() {
  const modo = S.modo === 'leccion' ? (['facil', 'media', 'normal'].indexOf(LJ.dificultad) >= 0 ? LJ.dificultad : 'normal') : modoDeGrado(sel.grado);
  S.P = params(modo);
  S.ritmo = elegirRitmo(); S.R = RITMOS[S.ritmo]; S.B = S.R.compas; S.bpm = Math.round(S.R.bpm * S.P.vel);
  Object.assign(S, { notas: [], segs: [], cursor: 0, off: 0, hold: null, chart: -4, espera: null, cerrando: false, finB: Infinity, carrilesClave: '', ultClave: '', actual: null,
    puntos: 0, combo: 0, mejorCombo: 0, perfectos: 0, aciertos: 0, total: 0, fallos: 0, repasar: [], ronda: 0, rondas: 0, pausa: false });
  S.tareas = armarTareas();
  S.rondasTot = S.tareas.filter(t => t.item).length;
  if (mundo) { mundo.ritmo(S.R); mundo.calma(S.calma); if (!LEC) mundo.bailarin(sel.bailarin); }
  ['inicio', 'final', 'pausa'].forEach(id => $(id).classList.add('oculto'));
  $('hud').classList.remove('oculto'); $('carriles').classList.remove('oculto'); $('latido').classList.remove('oculto');
  $('carta').classList.add('oculto');
  ponerCarriles(carrilesInstrumentos());
  medirPista();
  motor.despertar();
  S.cuentaN = S.B === 2 ? 4 : 3;
  motor.empezar(S.ritmo, { bpm: S.bpm, cuenta: S.cuentaN });
  S.fase = 'cuenta';
  $('hRitmo').textContent = S.R.emoji + ' ' + S.R.nombre + ' · ' + S.R.region;
  anunciar('Suena ' + S.R.nombre + ', de la región ' + S.R.region + '. Se cuenta en ' + S.B + '.');
  hud();
}
function mostrarCuenta(t) { const c = $('cuenta'); if (c.textContent !== t) c.textContent = t; c.classList.toggle('oculto', !t); }
function avisarLeccion(terminado) {
  if (S.modo !== 'leccion' || !LJ) return;
  const r = { aciertos: S.aciertos, total: S.total, fallos: S.fallos, nivel: S.R.nombre };
  try { if (terminado) LJ.resultado(r); else LJ.progreso(r); } catch (e) { /* sin padre: nada */ }
}
function estrellas() {
  const nGolpes = S.notas.length; void nGolpes;
  const frac = S.total ? S.aciertos / S.total : 1;
  return frac >= 0.9 && S.fallos <= 1 ? 3 : frac >= 0.7 ? 2 : 1;
}
function terminar() {
  S.fase = 'fin'; motor.golpe('fin'); Voz.callar();
  setTimeout(() => { if (S.fase === 'fin') motor.parar(); }, 1600);
  if (mundo) mundo.celebrar(true);
  ['carta', 'carriles', 'latido', 'hud'].forEach(id => $(id).classList.add('oculto'));
  mostrarCuenta('');
  const est = estrellas();
  const resumen = 'Bien a la primera: ' + S.aciertos + ' de ' + S.total + '. Puntos: ' + S.puntos.toLocaleString('es-CO') + '. Mejor racha: ' + S.mejorCombo + (S.perfectos ? '. Perfectos: ' + S.perfectos : '') + '.';
  const repaso = S.repasar.filter(x => x && (x.q || x.w || x.p)).slice(0, 4).map(x => x.w ? x.w.en + ' (' + x.sil.map(s => s.f ? s.t.toUpperCase() : s.t).join('-') + ')' : x.q ? sinEmoji(x.q.p).slice(0, 40) + ' → ' + sinEmoji(x.q.opciones[x.q.correcta]) : x.p + ': ' + x.opciones[0]);
  if (S.modo === 'leccion') {
    avisarLeccion(true);
    const chips = LEC.palabras.length ? LEC.palabras.slice(0, 10).map(w => { const s = TC.silabas(w.en); return (w.emoji ? w.emoji + ' ' : '') + (s ? s.map(x => x.f ? x.t.toUpperCase() : x.t).join('-') : w.en) + ' = ' + w.es; })
      : LEC.pasos.length ? LEC.pasos.map(p => TC.PASOS[p[0]].emoji + ' ' + TC.PASOS[p[0]].nombre) : repaso;
    setTimeout(() => LJ.logrado({ detalle: '⭐'.repeat(est) + ' ' + resumen + ' Ritmo: ' + S.R.nombre + ' (' + S.R.region + ').', chips, chipsRotulo: LEC.palabras.length ? 'Lo que practicaste (en mayúscula, la sílaba fuerte)' : 'Lo que practicaste', alOtraVez: () => { motor.despertar(); empezar(); } }), 1200);
    return;
  }
  const antes = prefs.estrellas || 0, clave = sel.materia + '|' + sel.tema + '|' + sel.grado + '|' + S.ritmo, rec = prefs.records[clave];
  const mejora = !rec || S.puntos > rec.puntos;
  prefs.estrellas = antes + est;
  if (mejora) { prefs.records[clave] = { puntos: S.puntos, est }; const ks = Object.keys(prefs.records); if (ks.length > 40) delete prefs.records[ks[0]]; }
  guardar();
  const nuevos = Object.keys(DESBLOQUEO).filter(id => DESBLOQUEO[id] > antes && DESBLOQUEO[id] <= prefs.estrellas);
  $('fEst').textContent = '⭐'.repeat(est) + '☆'.repeat(3 - est); $('fEst').setAttribute('aria-label', est + ' de 3 estrellas');
  $('fTit').textContent = est === 3 ? '¡Perfecto, gran baile!' : est === 2 ? '¡Muy bien!' : '¡Lo lograste!';
  $('fRes').textContent = resumen + (rec && !mejora ? ' Tu récord: ' + rec.puntos.toLocaleString('es-CO') + '.' : rec ? ' ¡Nuevo récord!' : '');
  $('fRepasa').textContent = repaso.length ? 'Para repasar: ' + repaso.join(' · ') : '¡Nada que repasar!';
  $('fNuevo').textContent = nuevos.length ? '🎶 ¡Ritmo nuevo: ' + nuevos.map(id => RITMOS[id].nombre).join(', ') + '! Elígelo en el inicio.' : '';
  setTimeout(() => { if (S.fase === 'fin') { $('final').classList.remove('oculto'); $('bOtra2').focus(); } }, 1300);
}
function hud() {
  const tot = S.rondasTot || 0;
  $('hRonda').textContent = S.fase === 'cuenta' ? '¡Prepárate!' : tot ? 'Ronda ' + Math.min(Math.max(1, S.ronda), tot) + ' de ' + tot : '¡A tocar!';
  $('hPuntos').textContent = S.puntos.toLocaleString('es-CO') + ' puntos';
  const r = $('hCombo'); r.textContent = S.combo >= 4 ? '🔥 ' + S.combo + (S.combo >= 16 ? ' ×3' : S.combo >= 8 ? ' ×2' : '') : ''; r.classList.toggle('oculto', S.combo < 4);
  $('iSonido').textContent = motor.mudo ? '🔇' : '🔊'; $('tSonido').textContent = motor.mudo ? 'Activar sonido' : 'Silenciar'; $('bSonido').setAttribute('aria-pressed', String(motor.mudo));
  $('bPrisa').setAttribute('aria-pressed', String(S.sinPrisa));
}
function anunciar(t) { const a = $('anuncio'); a.textContent = ''; setTimeout(() => { a.textContent = t; }, 30); }
function pausar() {
  if (S.fase !== 'juego' && S.fase !== 'cuenta') return;
  S.pausa = true; motor.pausar(); Voz.callar();
  $('pRes').textContent = 'Llevas ' + S.aciertos + ' de ' + S.total + ' bien y ' + S.puntos.toLocaleString('es-CO') + ' puntos.';
  $('bInicio').classList.toggle('oculto', S.modo === 'leccion');
  $('pVol').value = Math.round(motor.volumen * 100);
  $('pausa').classList.remove('oculto'); $('bSeguir').focus();
}
function seguir() { $('pausa').classList.add('oculto'); S.pausa = false; motor.seguir(); tAnt = performance.now(); }
function ponerSinPrisa(b) {
  S.sinPrisa = !!b; if (!LEC) { prefs.sinPrisa = S.sinPrisa; guardar(); }
  // en una partida, las notas que vienen esperan (los golpes de relleno que faltan se quitan)
  if (S.sinPrisa) S.notas.forEach(n => { if (!n.estado) { if (n.tipo === 'golpe') n.estado = 'quitada'; else n.espera = true; } });
  else S.notas.forEach(n => { if (!n.estado && n !== S.espera) n.espera = S.P.espera && n.cuenta; });
  anunciar(S.sinPrisa ? 'Sin prisa: cada nota te espera en la línea.' : 'Con el ritmo: las notas siguen la música.');
  hud();
}
function ponerCalma(b) { S.calma = !!b; if (!LEC) { prefs.calma = S.calma; guardar(); } if (mundo) mundo.calma(S.calma); document.body.classList.toggle('calmo', S.calma); }
function irAlInicio() {
  S.fase = 'menu'; S.pausa = false; motor.parar(); Voz.callar();
  ['pausa', 'final', 'carta', 'hud', 'carriles', 'latido'].forEach(id => $(id).classList.add('oculto')); mostrarCuenta('');
  armarInicio(); $('inicio').classList.remove('oculto'); $('bBailar').focus({ preventScroll: true });
}

$('bSonido').addEventListener('click', () => { motor.mudo = !motor.mudo; if (!LEC) { prefs.mudo = motor.mudo; guardar(); } if (motor.mudo) Voz.callar(); else motor.despertar(); hud(); if (S.actual) pintarCarta(S.actual); });
$('bPrisa').addEventListener('click', () => ponerSinPrisa(!S.sinPrisa));
$('bMenu').addEventListener('click', pausar);
$('bSeguir').addEventListener('click', seguir);
$('bOtra').addEventListener('click', () => { $('pausa').classList.add('oculto'); empezar(); });
$('bInicio').addEventListener('click', irAlInicio);
$('bOir').addEventListener('click', oir);
$('bVer').addEventListener('click', ver);
$('bOtra2').addEventListener('click', () => { motor.despertar(); empezar(); });
$('bCambiar').addEventListener('click', irAlInicio);
const volumen = ev => { motor.volumen = ev.target.value / 100; prefs.vol = motor.volumen; guardar(); };
$('pVol').addEventListener('input', volumen); $('oVol').addEventListener('input', volumen);
// con el ratón o el dedo, el botón de arriba suelta el foco: así Espacio sigue siendo el tambor del centro
['bSonido', 'bPrisa', 'bMenu', 'bOir', 'bVer'].forEach(id => $(id).addEventListener('click', ev => { if (ev.detail > 0) ev.currentTarget.blur(); }));
document.addEventListener('visibilitychange', () => { if (document.hidden && !S.pausa) pausar(); });

/* ---------- el teclado ---------- */
addEventListener('keydown', ev => {
  if (ev.ctrlKey || ev.metaKey || ev.altKey) return;
  const k = ev.key.toLowerCase();
  if (!$('pausa').classList.contains('oculto')) { if (k === 'escape') { ev.preventDefault(); seguir(); } return; }
  if (!$('inicio').classList.contains('oculto') || !$('final').classList.contains('oculto') || document.querySelector('.lj-capa')) return;
  if (S.fase !== 'juego' && S.fase !== 'cuenta') return;
  const enBoton = ev.target && ev.target.tagName === 'BUTTON';
  if ((k === ' ' || k === 'enter') && enBoton) return; // el botón con el foco hace lo suyo
  if (k === 'escape') { ev.preventDefault(); pausar(); return; }
  if (k === 'o') { oir(); return; }
  if (k === 'v') { ver(); return; }
  if (k === 'm') { $('bSonido').click(); return; }
  if (k === 's') { ponerSinPrisa(!S.sinPrisa); return; }
  if (ev.repeat) { if (k === ' ' || k.indexOf('arrow') === 0) ev.preventDefault(); return; }
  const tec = TECLAS[carriles.length] || [];
  const i = tec.findIndex(lista => lista.indexOf(k) >= 0);
  if (i >= 0) { ev.preventDefault(); tocar(i); }
});

/* ---------- la sala: el inicio con todas las opciones ---------- */
const GRADOS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
const BAILARINES = [{ id: 'nina-gafas', nombre: 'Niña', emoji: '👧' }, { id: 'nino-sol', nombre: 'Niño', emoji: '👦' }];
function boton(cont, txt, activo, alPulsar, extra) {
  const b = document.createElement('button'); b.type = 'button'; b.setAttribute('aria-pressed', String(!!activo));
  if (extra) extra(b); b.appendChild(document.createTextNode(txt));
  b.addEventListener('click', alPulsar); cont.appendChild(b); return b;
}
function armarInicio() {
  const oM = $('oMat'), oG = $('oGrado'), oT = $('oTema'), oR = $('oRitmo'), oB = $('oBail');
  [oM, oG, oT, oR, oB].forEach(c => { c.innerHTML = ''; });
  const re = foco => { prefs.sel = Object.assign({}, sel); guardar(); armarInicio(); if (foco) { const b = document.querySelector('#' + foco + ' [aria-pressed="true"]'); if (b) b.focus(); } };
  Object.keys(TC.MATERIAS).forEach(m => { if ((m === 'ciencias' || m === 'sociales') && !RC) return; boton(oM, TC.MATERIAS[m].emoji + ' ' + TC.MATERIAS[m].nombre, sel.materia === m, () => { sel.materia = m; sel.tema = ''; re('oMat'); }); });
  GRADOS.forEach(g => boton(oG, g === 0 ? 'Transición' : g + '.º', sel.grado === g, () => { sel.grado = g; re('oGrado'); }, b => { b.className = 'grado'; }));
  const ts = TC.temas(sel.materia, sel.grado, RC);
  if (!ts.some(t => t.id === sel.tema)) sel.tema = ts.length ? ts[0].id : '';
  ts.forEach(t => boton(oT, t.emoji + ' ' + t.nombre, sel.tema === t.id, () => { sel.tema = t.id; re('oTema'); }));
  boton(oR, '🎲 Al azar', sel.ritmo === 'azar', () => { sel.ritmo = 'azar'; re('oRitmo'); });
  Object.keys(RITMOS).forEach(id => {
    const R = RITMOS[id], libre = ritmoLibre(id);
    const b = boton(oR, (libre ? R.emoji + ' ' : '🔒 ') + R.nombre + ' · ' + R.region + (libre ? '' : ' (' + DESBLOQUEO[id] + ' ⭐)'), sel.ritmo === id, () => {
      if (!libre) { anunciar(R.nombre + ' se abre con ' + DESBLOQUEO[id] + ' estrellas. Llevas ' + (prefs.estrellas || 0) + '.'); return; }
      sel.ritmo = id; re('oRitmo'); motor.despertar(); motor.empezar(id, { cuenta: 0, intensidad: 2 }); setTimeout(() => { if (S.fase === 'menu') motor.parar(); }, 4000); if (mundo) mundo.ritmo(R);
    });
    if (!libre) b.setAttribute('aria-disabled', 'true');
  });
  BAILARINES.forEach(x => boton(oB, x.emoji + ' ' + x.nombre, sel.bailarin === x.id, () => { sel.bailarin = x.id; re('oBail'); if (mundo) mundo.bailarin(x.id); }));
  $('oFrase').textContent = (TC.MATERIAS[sel.materia] || TC.MATERIAS.ingles).frase;
  $('oPrisa').checked = S.sinPrisa; $('oCalma').checked = S.calma; $('oVol').value = Math.round(motor.volumen * 100);
  const dif = modoDeGrado(sel.grado), est = prefs.estrellas || 0;
  $('tRecord').textContent = 'Estrellas: ' + est + ' ⭐. ' + (dif === 'facil' ? 'En este grado la música va más despacio, tienes mucho margen y las notas que cuentan te esperan en la línea.'
    : dif === 'media' ? 'En este grado tienes buen margen y lo que falles vuelve de repaso.' : 'En este grado la música va a su tempo y hay que tocar justo en la línea.');
}
$('oPrisa').addEventListener('change', ev => ponerSinPrisa(ev.target.checked));
$('oCalma').addEventListener('change', ev => ponerCalma(ev.target.checked));
$('bBailar').addEventListener('click', () => { motor.despertar(); empezar(); });

/* ---------- arrancar ---------- */
function listo() {
  $('cargando').classList.add('oculto');
  document.body.classList.toggle('calmo', S.calma);
  if (mundo) { mundo.ritmo(RITMOS[LEC && LEC.ritmo ? LEC.ritmo : sel.ritmo !== 'azar' && RITMOS[sel.ritmo] ? sel.ritmo : 'cumbia']); mundo.calma(S.calma); }
  S.fase = 'menu';
  if (S.modo === 'leccion') {
    let detalle, chips = [];
    if (LEC.pasos.length) { detalle = 'Mira los pasos y luego dalos tú, uno en cada pulso: toca cada uno cuando llegue a la línea (o su botón grande).'; chips = LEC.pasos.map(p => TC.PASOS[p[0]].emoji + ' ' + TC.PASOS[p[0]].nombre + (p[1] > 1 ? ' (' + p[1] + ')' : '')); }
    else if (LEC.palabras.length) { detalle = 'Escucha la palabra y toca un golpe por sílaba, el FUERTE en la del acento (botón del centro). También hay preguntas: toca la buena cuando la fila llegue a la línea.'; chips = LEC.palabras.slice(0, 12).map(w => (w.emoji ? w.emoji + ' ' : '') + w.en); }
    else if (LEC.contar) detalle = 'Cuenta de ' + LEC.contar + ' en ' + LEC.contar + ' al ritmo: toca el número que sigue cuando la fila llegue a la línea.';
    else detalle = 'Cada pregunta baja como una fila: toca su respuesta (1, 2, 3 o su botón) cuando llegue a la línea. ¡Al compás suma más!';
    detalle += ' ¿Sin prisa? Toca 🐢 y cada nota te espera.';
    LJ.portada({ juego: 'Tambor Bailarín', titulo: LEC.titulo || 'Toca al ritmo con lo de la lección', detalle, chips, chipsRotulo: LEC.pasos.length ? 'La secuencia' : 'Las palabras de la lección', alJugar: () => { motor.despertar(); empezar(); } });
  } else { armarInicio(); $('inicio').classList.remove('oculto'); $('bBailar').focus({ preventScroll: true }); }
  requestAnimationFrame(bucle);
}
const fuentes = document.fonts && document.fonts.load ? Promise.all([document.fonts.load('800 32px "Baloo 2"'), document.fonts.ready]).catch(() => {}) : Promise.resolve();
Promise.race([Promise.all([Voz.listo, fuentes]), new Promise(r => setTimeout(r, 2500))]).then(listo);

window.__tambor = { estado: S, auto: b => { S.auto = b !== false; }, tocar, empezar, motor, silabas: TC.silabas };
})();
