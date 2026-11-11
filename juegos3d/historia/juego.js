/* Historias de la Biblia — el motor (Joseth, 9 nov 2026: «que los modelos aparezcan en varias lecciones con las
   configuraciones y preguntas que le ponga cada lección»). Plan: myvc_biblioteca encargos/historias-3d.md.
   - Una historia por fichero: historias/<id>.js deja window.HISTORIAS[<id>] (ver «contrato» abajo). El motor pone la
     escena, carga los GLB de la Biblioteca (<biblioteca>/modelos/index.json, como el arca y la vitrina), hace las
     preguntas y lleva el reto; la historia monta su escenario y decide qué pasa con cada acierto y al final.
   - Modo lección (../leccion.js): cfg.historia elige la historia (sin ella, horno), cfg.preguntas / cfg.palabras son
     las preguntas; cfg.idioma ('es' | 'en') la lengua de la narración (sin ella, es). Sin lección: ?historia=<id> y
     las preguntas propias de la historia.
   - Cada acierto avanza el reto un paso (tantos pasos como preguntas, de 3 a 12). Un fallo tacha esa opción y se
     vuelve a intentar: cuenta como fallo, nunca se pierde.
   - Contrato de una historia: { titulo, frase, como, reto: {es,en}, modelos: [ids], preguntas: {es: [...], en?: [...]},
     montar(ctx), valorReto(f) → texto, colorPaso?(f), inicio(ctx), avanzar(ctx, k, meta, f), final(ctx) }; los textos
     son {es, en}. ctx: ver crearCtx().
   Depuración: window.__historia (estado, responder, ganar, ctx). */
(function () {
'use strict';
const $ = id => document.getElementById(id);
const LJ = window.LeccionJuego || { activo: false };
const J3 = window.Juegos3D || { enApp: false };
if (!window.THREE) { $('cmsg').textContent = 'No se pudo descargar el motor 3D. Revisa la conexión y vuelve a abrir el juego.'; return; }

const q = new URLSearchParams(location.search);
const LEC = LJ.activo ? LJ.cfg : null;
const pedida = String((LEC && LEC.historia) || q.get('historia') || 'horno');
const ID = /^[a-z0-9-]{1,40}$/.test(pedida) ? pedida : 'horno';
const IDIOMA = (LEC && LEC.idioma === 'en') || q.get('idioma') === 'en' ? 'en' : 'es';
const REDUCIR = matchMedia('(prefers-reduced-motion: reduce)').matches;
const AUTO = q.get('auto') === '1';  // prueba: juega solo (contesta bien cada pregunta)
const VEL = Math.min(8, Math.max(1, Number(q.get('vel')) || 1));  // prueba: el tiempo de la escena, más rápido
const BIBLIO = /^(localhost|127\.0\.0\.1)$/.test(location.hostname) ? 'http://localhost:8765/' : 'https://biblioteca.micolevirtual.com/';
const MODELOS = BIBLIO + 'modelos/';
const tx = o => (o == null ? '' : typeof o === 'string' ? o : o[IDIOMA] || o.es || '');
const barajar = a => { const b = a.slice(); for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [b[i], b[j]] = [b[j], b[i]]; } return b; };

/* ---------- three ---------- */
const render = new THREE.WebGLRenderer({ antialias: true });
render.setPixelRatio(Math.min(devicePixelRatio || 1, 2));
render.outputEncoding = THREE.sRGBEncoding;
render.toneMapping = THREE.ACESFilmicToneMapping;
render.toneMappingExposure = 1.05;
render.shadowMap.enabled = true;
render.shadowMap.type = THREE.PCFSoftShadowMap;
$('gl').appendChild(render.domElement);
const escena = new THREE.Scene();
const camara = new THREE.PerspectiveCamera(50, 1, 0.1, 400);
const mira = new THREE.Vector3(0, 1.5, 0);
camara.position.set(0, 4, 14);
function ajustar() { render.setSize(innerWidth, innerHeight); camara.aspect = innerWidth / innerHeight; camara.updateProjectionMatrix(); }
addEventListener('resize', ajustar); ajustar();

/* cada cuadro: las funciones de la historia y los tweens; se pausan con la pausa */
const cuadros = new Set(), mezcladores = new Set();
let pausado = false, ultimo = performance.now(), tiempo = 0;
function bucle(ahora) {
  const dt = Math.min(0.05, (ahora - ultimo) / 1000) * VEL; ultimo = ahora;
  if (!pausado) {
    tiempo += dt;
    cuadros.forEach(f => { try { f(dt, tiempo); } catch (e) { console.error(e); cuadros.delete(f); } });
    mezcladores.forEach(m => m.update(dt));
  }
  camara.lookAt(mira);
  render.render(escena, camara);
  requestAnimationFrame(bucle);
}

/* ---------- carga de modelos (como el arca: GLTFLoader, meshopt y SkeletonUtils de r128) ---------- */
function cargarScript(src) {
  return new Promise((si, no) => { const s = document.createElement('script'); s.src = src; s.onload = si; s.onerror = () => no(new Error('No cargó ' + src)); document.head.appendChild(s); });
}
let libs = null;
function cargarLibs() {
  const cdn = 'https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/';
  const L = [['GLTFLoader.js', 'loaders/', () => THREE.GLTFLoader], ['meshopt_decoder.js', 'libs/', () => window.MeshoptDecoder], ['SkeletonUtils.js', 'utils/', () => THREE.SkeletonUtils]];
  const una = ([f, dir, hay]) => (hay() ? null : !J3.enApp ? cargarScript(cdn + dir + f)
    : cargarScript('../' + f).then(() => { if (!hay()) throw new Error('no define nada'); }).catch(() => cargarScript(cdn + dir + f)));
  return libs || (libs = Promise.all(L.map(una)).then(() => {
    const l = new THREE.GLTFLoader(); l.setMeshoptDecoder(window.MeshoptDecoder); l.setCrossOrigin('anonymous'); return l;
  }));
}
const glbs = {};
function cargarGlb(url) {
  return glbs[url] || (glbs[url] = Promise.race([
    cargarLibs().then(l => new Promise((si, no) => l.load(url, si, undefined, no))),
    new Promise((_, no) => setTimeout(() => no(new Error(url + ': tardó demasiado')), 30000))
  ]).catch(e => { delete glbs[url]; throw e; }));
}
let manifiesto = {};
function leerManifiesto() {
  return fetch(MODELOS + 'index.json', { credentials: 'omit' }).then(r => (r.ok ? r.json() : {})).then(j => (j && typeof j === 'object' ? j : {})).catch(() => ({}));
}
// Sin GLB: una figura de cajitas del mismo alto, para que la historia se pueda jugar igual.
function respaldo(color) {
  const g = new THREE.Group(), m = new THREE.MeshStandardMaterial({ color: color || 0x9a7b5a, roughness: 0.8 });
  const cuerpo = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.36, 1.25, 12), m); cuerpo.position.y = 0.62; g.add(cuerpo);
  const cabeza = new THREE.Mesh(new THREE.SphereGeometry(0.22, 16, 12), new THREE.MeshStandardMaterial({ color: 0xd8a27a })); cabeza.position.y = 1.47; g.add(cabeza);
  return g;
}
/** La caja de lo que se ve: en las mallas con esqueleto, los vértices ya posados (la caja de three.js mide la malla
    sin pose y sale de otro tamaño); se toma uno de cada 8 vértices, que basta para la altura. */
function cajaReal(obj) {
  obj.updateMatrixWorld(true);
  const caja = new THREE.Box3(), v = new THREE.Vector3();
  let hay = false;
  obj.traverse(m => {
    if (!m.isSkinnedMesh) return;
    hay = true;
    // las mallas cuantizadas (meshopt) guardan enteros «normalizados» que r128 no convierte al leerlos en la CPU
    const escala = at => (!at.normalized ? 1 : at.array instanceof Int16Array ? 1 / 32767 : at.array instanceof Uint16Array ? 1 / 65535
      : at.array instanceof Int8Array ? 1 / 127 : at.array instanceof Uint8Array ? 1 / 255 : 1);
    const g = m.geometry.attributes, pos = g.position, si = g.skinIndex, sw = g.skinWeight, kp = escala(pos), kw = escala(sw);
    const huesos = m.skeleton.bones, inv = m.skeleton.boneInverses, base = new THREE.Vector3(), t = new THREE.Vector3(), mat = new THREE.Matrix4();
    for (let i = 0; i < pos.count; i += 8) {
      base.fromBufferAttribute(pos, i).multiplyScalar(kp).applyMatrix4(m.bindMatrix);
      v.set(0, 0, 0);
      for (let j = 0; j < 4; j++) {
        const w = sw.getComponent ? sw.getComponent(i, j) * kw : [sw.getX(i), sw.getY(i), sw.getZ(i), sw.getW(i)][j] * kw;
        if (!w) continue;
        const b = [si.getX(i), si.getY(i), si.getZ(i), si.getW(i)][j];
        mat.multiplyMatrices(huesos[b].matrixWorld, inv[b]);
        v.addScaledVector(t.copy(base).applyMatrix4(mat), w);
      }
      caja.expandByPoint(v.applyMatrix4(m.bindMatrixInverse).applyMatrix4(m.matrixWorld));
    }
  });
  return hay ? caja : new THREE.Box3().setFromObject(obj);
}
/** Un actor: el GLB del manifiesto con los pies en el suelo, `altura` de alto (o la del manifiesto) y de frente a +z. */
async function actor(id, o) {
  o = o || {};
  const f = manifiesto[id];
  let obj, clips = [];
  try {
    if (!f) throw new Error('no está en modelos/index.json');
    const g = await cargarGlb(MODELOS + (f.archivo || id + '.glb'));
    obj = THREE.SkeletonUtils.clone(g.scene); clips = g.animations || [];
  } catch (e) { console.warn('Historia: ' + id + ' sale de respaldo (' + e.message + ')'); obj = respaldo(o.color); }
  // con esqueleto, se mide ya en su pose de reposo
  const reposo = clips.find(c => /^idle$/i.test(c.name)) || clips[0];
  let mx0 = null;
  if (reposo) { mx0 = new THREE.AnimationMixer(obj); mx0.clipAction(reposo).play(); mx0.update(0); }
  const caja = cajaReal(obj), tam = caja.getSize(new THREE.Vector3()), centro = caja.getCenter(new THREE.Vector3());
  const k = (o.altura || (f && f.altura) || 1.7) / (tam.y || 1);
  obj.scale.multiplyScalar(k);
  obj.position.set(-centro.x * k, -caja.min.y * k, -centro.z * k);
  const g = new THREE.Group(); g.add(obj); g.name = id;
  g.position.set(o.x || 0, o.y || 0, o.z || 0);
  g.rotation.y = THREE.MathUtils.degToRad(o.giro || 0);
  obj.traverse(m => {
    if (!m.isMesh) return;
    m.castShadow = true; m.receiveShadow = true;
    if (o.material) m.material = typeof o.material === 'function' ? o.material(m.material) : o.material;
  });
  escena.add(g);
  const a = { id, g, obj, alto: tam.y * k, base: obj.position.y, escY: obj.scale.y, mixer: null, clips: {}, accion: null, moviendo: false };
  if (mx0) { mx0.stopAllAction(); mx0.uncacheRoot(obj); }
  clips.forEach(c => { a.clips[c.name.toLowerCase()] = c; });
  if (clips.length) {
    a.mixer = new THREE.AnimationMixer(obj); mezcladores.add(a.mixer);
    anim(a, a.clips.idle ? 'idle' : clips[0].name.toLowerCase());
    // cada uno empieza su reposo en otro punto, para que la multitud no respire a la vez
    if (a.accion) a.accion.time = Math.random() * a.accion.getClip().duration;
  } else {
    // sin rig (hasta que pase por Mixamo): al menos respira
    const fase = Math.random() * 6.3;
    cuadros.add((dt, t) => { if (!a.moviendo) a.obj.scale.y = a.escY * (1 + 0.012 * Math.sin(t * 2.2 + fase)); });
  }
  return a;
}

/** Pone una animación de Mixamo (idle, walk, talk, kneel, pray…) con fundido. `una`: una vez y espera a que acabe
    (después vuelve a idle, salvo `quedarse`). Sin ese clip, false y no pasa nada. */
function anim(a, nombre, o) {
  o = o || {};
  const c = a && a.clips && a.clips[nombre];
  if (!c || !a.mixer) return Promise.resolve(false);
  const nueva = a.mixer.clipAction(c);
  if (a.accion === nueva && !o.una) return Promise.resolve(true);
  nueva.reset(); nueva.setLoop(o.una ? THREE.LoopOnce : THREE.LoopRepeat, Infinity); nueva.clampWhenFinished = !!o.quedarse;
  nueva.setEffectiveWeight(1); nueva.play();
  if (a.accion && a.accion !== nueva) a.accion.crossFadeTo(nueva, o.fundido || 0.35, false);
  a.accion = nueva;
  if (!o.una) return Promise.resolve(true);
  return new Promise(si => {
    const fin = e => { if (e.action !== nueva) return; a.mixer.removeEventListener('finished', fin); if (!o.quedarse) anim(a, a.reposo || 'idle'); si(true); };
    a.mixer.addEventListener('finished', fin);
  });
}

/* ---------- tiempo, movimiento y cámara ---------- */
let saltando = false;
const esperar = s => new Promise(si => { if (saltando || REDUCIR && s > 0.3) { si(); return; } let t = 0; const f = dt => { t += dt; if (t >= s || saltando) { cuadros.delete(f); si(); } }; cuadros.add(f); });
/** Lleva de 0 a 1 en `s` segundos (suave a la entrada y a la salida); con «saltar» o movimiento reducido, de golpe. */
function tween(s, cada) {
  return new Promise(si => {
    if (saltando || REDUCIR) { cada(1); si(); return; }
    let t = 0;
    const f = dt => { t = Math.min(s, t + dt); const u = t / s; cada(u * u * (3 - 2 * u)); if (t >= s || saltando) { if (saltando) cada(1); cuadros.delete(f); si(); } };
    cuadros.add(f);
  });
}
/** Camina hasta (x, z): mira hacia allá y se balancea (sin rig, el cuerpo entero). */
function mover(a, x, z, s, o) {
  o = o || {};
  const x0 = a.g.position.x, z0 = a.g.position.z, dx = x - x0, dz = z - z0;
  if (!o.deEspaldas && (dx || dz)) a.g.rotation.y = Math.atan2(dx, dz);
  const conClip = !!(a.clips && a.clips.walk);
  a.moviendo = true;
  if (conClip) anim(a, 'walk');
  return tween(s, u => {
    a.g.position.x = x0 + dx * u; a.g.position.z = z0 + dz * u;
    if (!conClip) {
      const paso = Math.sin(u * s * 9);
      a.obj.position.y = a.base + (u < 1 ? Math.abs(paso) * 0.05 : 0);
      a.obj.rotation.z = u < 1 ? paso * 0.05 : 0;
    }
  }).then(() => { a.moviendo = false; if (conClip && o.idle !== false) anim(a, a.reposo || 'idle'); });
}
function mirarA(a, x, z) { a.g.rotation.y = Math.atan2(x - a.g.position.x, z - a.g.position.z); }
/** Mueve la cámara a `pos` mirando a `objetivo` en `s` segundos. */
function camaraA(pos, objetivo, s) {
  const p0 = camara.position.clone(), m0 = mira.clone(), p1 = new THREE.Vector3(...pos), m1 = new THREE.Vector3(...objetivo);
  return tween(s || 1.6, u => { camara.position.lerpVectors(p0, p1, u); mira.lerpVectors(m0, m1, u); });
}

/* ---------- narración y voz ---------- */
let avanzarNarra = null, vocesHay = new Set(), vozSuena = null;
const SN = window.SonidoHistoria || { tocar() {}, silenciar() {}, silencio: () => false, agachar() {} };
/** El nombre del MP3 de una línea: el slug de tools/voz_historia.py (sin tildes; largo, 80 letras y huella FNV-1a). */
function slugEs(t) {
  let s = t.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  if (s.length > 120) { let h = 0x811c9dc5; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 0x01000193) >>> 0; } s = s.slice(0, 80) + '-' + h.toString(16).padStart(8, '0'); }
  return s;
}
/** Suena la voz grabada (Kokoro) de una línea en español, si está; promesa que se cumple al acabar (o enseguida). */
function voz(texto) {
  if (vozSuena) { vozSuena.pause(); vozSuena = null; }
  const sl = IDIOMA === 'es' && slugEs(texto);
  if (!sl || !vocesHay.has(sl) || SN.silencio() || saltando) return null;
  const a = new Audio(BIBLIO + 'voz/historia-' + ID + '/' + sl + '.mp3'); vozSuena = a;
  SN.agachar(true);
  return new Promise(si => {
    const fin = ok => { if (vozSuena === a) vozSuena = null; SN.agachar(false); si(ok); };
    a.onended = () => fin(true); a.onerror = () => fin(false); a.play().catch(() => fin(false));
  });
}
/** Muestra una línea (quién la dice y el texto) y espera a que se lea: lo que dure leerla, o «Seguir». */
function decir(quien, texto, o) {
  o = o || {};
  if (saltando) return Promise.resolve();
  // quien habla, se mueve: su clip (talk, o el que pida la línea) mientras dura; sin clip, asiente
  const hablan = [].concat(o.actor || []);
  hablan.forEach(a => anim(a, o.gesto || 'talk').then(hay => {
    if (hay || REDUCIR) return;
    const r0 = a.obj.rotation.x; tween(0.5, u => { a.obj.rotation.x = r0 + Math.sin(u * Math.PI) * 0.08; });
  }));
  $('narraQuien').textContent = tx(quien); $('narraTx').textContent = tx(texto);
  $('narra').classList.remove('oculto'); $('bSeguirNarra').classList.remove('oculto');
  // con voz: hasta que acabe de hablar (y un respiro); sin voz: lo que tarda leerla
  const sonando = voz(tx(texto)), lectura = o.s || Math.min(9, 2.2 + tx(texto).length / 16);
  let callada = !sonando, s = sonando ? 0.5 : lectura;
  // si el navegador no la dejó sonar, la línea dura lo que tarda leerla
  if (sonando) sonando.then(ok => { callada = true; if (!ok) s = lectura; });
  return new Promise(si => {
    let hecho = false;
    const fin = () => { if (hecho) return; hecho = true; avanzarNarra = null; cuadros.delete(f); if (vozSuena) { vozSuena.pause(); vozSuena = null; SN.agachar(false); } if (!o.seguir) hablan.forEach(a => anim(a, a.reposo || 'idle')); si(); };
    let t = 0; const f = dt => { t += dt; if ((t >= s && callada) || saltando) fin(); };
    cuadros.add(f); avanzarNarra = fin;
  });
}
function callarNarra() { $('narra').classList.add('oculto'); $('bSeguirNarra').classList.add('oculto'); }
$('bSeguirNarra').addEventListener('click', () => avanzarNarra && avanzarNarra());

/* ---------- la historia ---------- */
let H = null;
const ctx = {
  THREE, escena, camara, mira, render, idioma: IDIOMA, reducir: REDUCIR, tx,
  actor, anim, mover,
  /** Lo que hace un actor cuando no hace nada (idle; el rey en su trono, sit): a eso vuelve tras hablar o moverse. */
  reposo: (a, nombre) => { a.reposo = nombre; return anim(a, nombre); }, mirarA, camaraA, tween, esperar, decir, callar: callarNarra,
  sonido: (n, o) => SN.tocar(n, o),
  cadaCuadro: f => { cuadros.add(f); return () => cuadros.delete(f); },
  saltando: () => saltando,
  // sin mapa de entorno un metal puro sale negro: oro a medias, con un brillo propio
  oro: m => new THREE.MeshStandardMaterial({ color: 0xf2b632, metalness: 0.55, roughness: 0.32, emissive: 0x4a3000, emissiveIntensity: 0.6, normalMap: m && m.normalMap || null }),
  actores: {}
};

/* ---------- preguntas y reto ---------- */
const E = { meta: 0, aciertos: 0, fallos: 0, primera: 0, cola: [], actual: null, fallada: false, jugando: false };
function pintarReto() {
  const ol = $('pasos'); ol.textContent = '';
  for (let i = 0; i < E.meta; i++) {
    const li = document.createElement('li'); if (i < E.aciertos) { li.className = 'hecho'; if (H.colorPaso) li.style.setProperty('--paso', H.colorPaso((i + 1) / E.meta)); }
    ol.appendChild(li);
  }
  ol.setAttribute('aria-label', 'Avance: ' + E.aciertos + ' de ' + E.meta);
  $('retoVal').textContent = H.valorReto ? H.valorReto(E.aciertos / E.meta) : '';
}
function mostrar(p) {
  E.actual = p; E.fallada = false;
  $('pTag').textContent = (IDIOMA === 'en' ? 'Question ' : 'Pregunta ') + (E.aciertos + 1) + (IDIOMA === 'en' ? ' of ' : ' de ') + E.meta;
  $('pq').textContent = p.p;
  $('pPista').textContent = ''; $('pPista').className = 'pista';
  const ops = $('ops'); ops.textContent = '';
  p.opciones.forEach((t, i) => {
    const b = document.createElement('button'); b.type = 'button'; b.className = 'op';
    const n = document.createElement('span'); n.className = 'n'; n.textContent = i + 1; n.setAttribute('aria-hidden', 'true');
    const s = document.createElement('span'); s.textContent = t;
    b.append(n, s); b.addEventListener('click', () => responder(i)); ops.appendChild(b);
  });
  $('bOirPreg').classList.toggle('oculto', !(p.oir && LJ.oir));
  if (p.oir && LJ.oir) LJ.oir(p.oir);
  $('panel').classList.remove('oculto');
  const primero = ops.querySelector('.op'); if (primero) primero.focus({ preventScroll: true });
  if (AUTO) setTimeout(() => responder(p.correcta), 1500);
}
async function responder(i) {
  const p = E.actual; if (!p || !E.jugando) return;
  const bs = $('ops').querySelectorAll('.op'), b = bs[i]; if (!b || b.disabled) return;
  if (i === p.correcta) {
    b.classList.add('bien'); bs.forEach(x => { x.disabled = true; }); SN.tocar('bien');
    E.aciertos++; if (!E.fallada) E.primera++;
    $('pPista').textContent = IDIOMA === 'en' ? 'Correct!' : '¡Bien!'; $('pPista').className = 'pista bien';
    if (LJ.activo) LJ.progreso({ aciertos: E.aciertos, total: E.meta, fallos: E.fallos, nivel: ID });
    E.actual = null;
    await esperar(0.6);
    $('panel').classList.add('oculto');
    pintarReto();
    await H.avanzar(ctx, E.aciertos, E.meta, E.aciertos / E.meta);
    // la historia sigue entre pregunta y pregunta: a cada acierto le tocan los momentos que caen en su tramo
    const M = H.momentos || [], L = M.length;
    const desde = Math.floor((E.aciertos - 1) * L / E.meta), hasta = Math.floor(E.aciertos * L / E.meta);
    if (hasta > desde) $('bSaltar').classList.remove('oculto');
    for (let i = desde; i < hasta; i++) await M[i](ctx);
    saltando = false; $('bSaltar').classList.add('oculto');
    callarNarra();
    if (E.aciertos >= E.meta) terminar(); else mostrar(E.cola.shift());
  } else {
    b.classList.add('mal'); b.disabled = true; E.fallos++; E.fallada = true; SN.tocar('mal');
    $('pPista').textContent = IDIOMA === 'en' ? 'Not that one. Try another.' : 'Ésa no. Prueba otra.'; $('pPista').className = 'pista mal';
    // en fácil, además se tapa otra mala (que queden dos)
    if (LJ.dificultad === 'facil') {
      const malas = [...bs].filter((x, j) => j !== p.correcta && !x.disabled);
      if (malas.length > 1) { malas[0].disabled = true; malas[0].classList.add('tapada'); }
    }
  }
}
function preguntas() {
  let ps = LJ.activo && LJ.preguntas ? LJ.preguntas() : [];
  if (!ps.length) ps = (H.preguntas && (H.preguntas[IDIOMA] || H.preguntas.es)) || [];
  ps = barajar(ps).slice(0, 12).map(p => {
    // las opciones se barajan sin perder cuál es la buena
    const orden = barajar(p.opciones.map((_, i) => i));
    return { p: p.p, oir: p.oir, opciones: orden.map(i => p.opciones[i]), correcta: orden.indexOf(p.correcta) };
  });
  return ps;
}

/* ---------- partida ---------- */
async function empezar() {
  $('inicio').classList.add('oculto'); $('fin').classList.add('oculto');
  if (LJ.cerrar) LJ.cerrar();
  if (E.yaJugo) await H.reiniciar(ctx);
  E.yaJugo = true;
  const ps = preguntas();
  Object.assign(E, { meta: Math.max(1, ps.length), aciertos: 0, fallos: 0, primera: 0, cola: ps, jugando: false });
  saltando = false;
  $('retoTit').textContent = tx(H.reto); $('hud').classList.remove('oculto');
  pintarReto();
  $('bSaltar').classList.remove('oculto');
  if (q.get('ir') === 'final') {  // prueba: todo lo de antes de golpe y el final a su ritmo
    saltando = true;
    await H.inicio(ctx);
    for (const m of H.momentos || []) await m(ctx);
    E.aciertos = E.meta; await H.avanzar(ctx, E.meta, E.meta, 1);
    saltando = false; pintarReto();
    return terminar();
  }
  await H.inicio(ctx);
  saltando = false; $('bSaltar').classList.add('oculto'); callarNarra();
  E.jugando = true;
  mostrar(E.cola.shift());
}
async function terminar() {
  E.jugando = false;
  $('bSaltar').classList.remove('oculto');
  await H.final(ctx);
  saltando = false; $('bSaltar').classList.add('oculto'); callarNarra();
  const detalle = (IDIOMA === 'en' ? 'You answered ' + E.primera + ' of ' + E.meta + ' on the first try.'
    : 'Acertaste a la primera ' + E.primera + ' de ' + E.meta + ' preguntas.');
  if (LJ.activo) {
    LJ.resultado({ aciertos: E.aciertos, total: E.meta, fallos: E.fallos, nivel: ID });
    LJ.logrado({ detalle, alOtraVez: empezar });
  } else {
    $('fTit').textContent = IDIOMA === 'en' ? 'Well done!' : '¡Lo lograste!'; $('fSub').textContent = detalle;
    $('fin').classList.remove('oculto'); $('bOtra').focus();
  }
}

/* ---------- teclado y botones ---------- */
addEventListener('keydown', e => {
  if (e.key === 'Escape' && !$('bSaltar').classList.contains('oculto')) { saltando = true; if (avanzarNarra) avanzarNarra(); e.preventDefault(); return; }
  if (e.key === 'Enter' && avanzarNarra && document.activeElement && !document.activeElement.classList.contains('op')) { avanzarNarra(); e.preventDefault(); return; }
  if (E.actual && /^[1-4]$/.test(e.key)) { responder(+e.key - 1); e.preventDefault(); }
});
$('bSaltar').addEventListener('click', () => { saltando = true; if (avanzarNarra) avanzarNarra(); });
function pintarSonido() {
  const m = SN.silencio(); $('bSonido').setAttribute('aria-pressed', String(m)); $('bSonido').setAttribute('aria-label', m ? 'Activar el sonido' : 'Silenciar');
  $('sOndas').style.display = m ? 'none' : ''; $('sMudo').style.display = m ? '' : 'none';
}
$('bSonido').addEventListener('click', () => { SN.silenciar(!SN.silencio()); if (SN.silencio() && vozSuena) vozSuena.pause(); pintarSonido(); });
pintarSonido();
$('bPausa').addEventListener('click', () => { pausado = true; $('pausa').classList.remove('oculto'); $('bSeguir').focus(); });
$('bSeguir').addEventListener('click', () => { pausado = false; $('pausa').classList.add('oculto'); });
$('bJugar').addEventListener('click', empezar);
$('bOtra').addEventListener('click', empezar);
$('bOirPreg').addEventListener('click', () => { if (E.actual && E.actual.oir && LJ.oir) LJ.oir(E.actual.oir); });
if (J3.enApp && window.volverAJuegos) $('bVolver').addEventListener('click', e => { e.preventDefault(); window.volverAJuegos(); });

/* ---------- arranque ---------- */
function progreso(f, msg) { $('cbar').style.width = Math.round(f * 100) + '%'; if (msg) $('cmsg').textContent = msg; }
(async function arrancar() {
  try {
    progreso(0.05, 'Buscando la historia…');
    await cargarScript('historias/' + ID + '.js');
    H = (window.HISTORIAS || {})[ID];
    if (!H) throw new Error('historia desconocida: ' + ID);
    document.title = tx(H.titulo); $('cTit').textContent = tx(H.titulo);
    progreso(0.15, IDIOMA === 'en' ? 'Getting the characters ready…' : 'Llamando a los personajes…');
    manifiesto = await leerManifiesto();
    if (IDIOMA === 'es') vocesHay = new Set(await fetch(BIBLIO + 'voz/historia-' + ID + '/index.json', { credentials: 'omit' }).then(r => (r.ok ? r.json() : [])).catch(() => []));
    // se piden todos a la vez; la historia los coloca en montar()
    let n = 0; const ids = H.modelos || [];
    await Promise.all(ids.map(id => (manifiesto[id] ? cargarGlb(MODELOS + (manifiesto[id].archivo || id + '.glb')).catch(() => null) : null)
      .then(() => progreso(0.15 + 0.6 * (++n / Math.max(1, ids.length))))));
    progreso(0.8, IDIOMA === 'en' ? 'Building the scene…' : 'Armando la escena…');
    await H.montar(ctx);
    progreso(1);
    requestAnimationFrame(bucle);
    $('cargando').classList.add('oculto');
    if (LJ.activo) {
      LJ.portada({ juego: tx(H.titulo), titulo: LJ.titulo || tx(H.titulo), detalle: tx(H.como), alJugar: empezar });
    } else {
      $('iTit').textContent = tx(H.titulo); $('iFrase').textContent = tx(H.frase); $('iComo').textContent = tx(H.como);
      $('inicio').classList.remove('oculto'); $('bJugar').focus();
      if (AUTO) setTimeout(empezar, 800);
    }
  } catch (e) {
    console.error(e);
    $('cmsg').textContent = 'No se pudo abrir la historia (' + e.message + '). Vuelve a intentarlo.';
  }
})();

window.__historia = { E, ctx, responder: i => responder(i), ganar: () => { E.aciertos = E.meta - 1; return responder(E.actual ? E.actual.correcta : 0); } };
})();
