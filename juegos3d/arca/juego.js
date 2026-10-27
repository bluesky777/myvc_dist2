/* Two by Two (el arca de Noé) — motor, fase 1. Lo pedagógico viene de datos.js (window.DATOS_ARCA) y las preguntas
   las arma preguntas.js (window.PreguntasArca); el sonido es sonido.js (window.SonidoArca).
   - Los modelos son los de la Biblioteca MyVC (<biblioteca>/modelos/index.json + GLB con meshopt y webp), como la
     vitrina de app2 (paginas/biblioteca/escenas/vitrina-carga.ts): en local http://localhost:8765/, si no
     https://biblioteca.micolevirtual.com/. Lo que no carga tiene respaldo hecho con código (arca, niño, animales).
   - El arca (modelos/arca.glb) se mide al cargar: el lado largo va en x y la rampa es lo que más sobresale por un
     costado; se gira para que la rampa mire a +z (hacia la pradera). Sin GLB, un arca provisional del mismo tamaño.
   - La voz: <biblioteca>/voz/en/<slug>.mp3 si está en voz/en/index.json; si no, speechSynthesis en-US.
   - Grado: ?grado=0..5 (0 = Transición) o el selector del inicio (se recuerda en juegos3d.arca).
   - MyVC: Turbo Saber no reporta notas a MyVC (sólo usa la API para las salas), así que este tampoco. PENDIENTE: cuando
     exista la ruta `juegos/resultados`, mandar {juego:'arca', grado, estrellas, aciertos, errores, segundos} con
     window.Juegos3D.api('POST', …) al terminar (ver terminar()).
   Depuración: window.__juego (estado, tocar, responder, pareja, ganar, vista, ir). */
(function () {
'use strict';
const D = window.DATOS_ARCA, PQ = window.PreguntasArca, SN = window.SonidoArca;
const $ = id => document.getElementById(id);
if (!window.THREE || !D || !PQ || !SN) { $('cmsg').textContent = 'No se pudo descargar el motor 3D. Revisa la conexión y vuelve a abrir el juego.'; return; }

/* ---------- utilidades ---------- */
const CLAVE = 'juegos3d.arca';
const leerP = () => { try { return JSON.parse(localStorage.getItem(CLAVE)) || {}; } catch (e) { return {}; } };
const guardarP = o => { try { localStorage.setItem(CLAVE, JSON.stringify(o)); } catch (e) { /* sin almacenamiento */ } };
const prog = leerP(); if (!prog.estrellas || typeof prog.estrellas !== 'object') prog.estrellas = {};
let semilla = 20261026;
const azar = () => { semilla |= 0; semilla = semilla + 0x6D2B79F5 | 0; let t = Math.imul(semilla ^ semilla >>> 15, 1 | semilla); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
const az = (a, b) => a + azar() * (b - a);
const rnd = (a, b) => a + Math.random() * (b - a);
const barajar = a => { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const lerp = (a, b, t) => a + (b - a) * t;
const suave = (a, b, x) => { const t = clamp((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };
const angDif = (a, b) => { let d = (b - a) % (Math.PI * 2); if (d > Math.PI) d -= Math.PI * 2; if (d < -Math.PI) d += Math.PI * 2; return d; };
const V3 = THREE.Vector3;
// Los colores se escriben en sRGB (como en CSS) y se pasan a lineal: la salida es sRGB, igual que las texturas de los GLB.
const C = h => new THREE.Color(h).convertSRGBToLinear();
const colegio = (getComputedStyle(document.documentElement).getPropertyValue('--colegio') || '#ff6a4d').trim();
const q = new URLSearchParams(location.search);
const J3 = window.Juegos3D || {};
const BIBLIO = /^(localhost|127\.0\.0\.1)$/.test(location.hostname) ? 'http://localhost:8765/' : 'https://biblioteca.micolevirtual.com/';
const MODELOS = BIBLIO + 'modelos/';
const ALTO_ARCA = 32; // m: unas 35 ovejas de alto
let tactil = !!(window.matchMedia && matchMedia('(pointer: coarse)').matches);

function gradoDeUrl() {
  const g = (q.get('grado') || '').toLowerCase();
  if (!g) return null;
  if (/^t/.test(g)) return 0;
  const n = parseInt(g, 10);
  return n >= 0 && n <= 5 ? n : null;
}

/* ---------- estado ---------- */
const J = {
  fase: 'carga', pausa: false, vista: 3, nino: prog.nino === 'nina' ? 'nina' : 'nino',
  grado: gradoDeUrl() != null ? gradoDeUrl() : (Number.isInteger(prog.grado) ? prog.grado : 2),
  orden: [], iEnc: 0, dentro: 0, total: 12, aciertos: 0, errores: 0, primera: 0, t0: 0, segundos: 0,
  pregunta: null, foco: null, tf: 0, mixto: {}, pendientes: []
};

/* ---------- escena ---------- */
const rd = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
let dpr = Math.min(2, window.devicePixelRatio || 1);
rd.setPixelRatio(dpr);
rd.outputEncoding = THREE.sRGBEncoding;
rd.shadowMap.enabled = true; rd.shadowMap.type = THREE.PCFSoftShadowMap;
$('gl').appendChild(rd.domElement);
const scene = new THREE.Scene();
const cam = new THREE.PerspectiveCamera(58, 1, 0.15, 1100);
const reloj3 = new THREE.Clock();

// Cielo: cúpula con degradado por altura que sigue a la cámara; se nubla con el clima.
const CIELO = { claro: ['#3b8de0', '#86c3ee', '#dceff7'], nublado: ['#3a434e', '#59636d', '#8b949c'] };
const cielo = new THREE.Mesh(new THREE.SphereGeometry(900, 28, 16), new THREE.MeshBasicMaterial({ vertexColors: true, side: THREE.BackSide, fog: false, depthWrite: false }));
cielo.renderOrder = -2; scene.add(cielo);
const _ca = new THREE.Color(), _cb = new THREE.Color();
function mezclar(a, b, t) { return _ca.set(a).lerp(_cb.set(b), t).clone().convertSRGBToLinear(); }
let cieloNub = -1;
function pintarCielo(n) {
  if (Math.abs(n - cieloNub) < 0.01) return;
  cieloNub = n;
  const k = [0, 1, 2].map(i => mezclar(CIELO.claro[i], CIELO.nublado[i], n));
  const g = cielo.geometry, p = g.attributes.position, col = g.attributes.color ? g.attributes.color.array : new Float32Array(p.count * 3), x = new THREE.Color();
  for (let i = 0; i < p.count; i++) {
    const e = Math.asin(clamp(p.getY(i) / 900, -1, 1));
    if (e <= 0.02) x.copy(k[2]); else if (e < 0.2) x.copy(k[2]).lerp(k[1], (e - 0.02) / 0.18); else x.copy(k[1]).lerp(k[0], Math.min(1, (e - 0.2) / 0.6));
    col[i * 3] = x.r; col[i * 3 + 1] = x.g; col[i * 3 + 2] = x.b;
  }
  if (!g.attributes.color) g.setAttribute('color', new THREE.BufferAttribute(col, 3)); else g.attributes.color.needsUpdate = true;
  scene.fog.color.copy(k[2]);
}
scene.fog = new THREE.Fog(0xdceff7, 140, 560);
const hemi = new THREE.HemisphereLight(0xfff3e0, 0x5f8f4e, 0.6); scene.add(hemi);
const sol = new THREE.DirectionalLight(0xfff0d8, 1);
sol.castShadow = true; sol.shadow.mapSize.set(1024, 1024); sol.shadow.bias = -0.0006; sol.shadow.normalBias = 0.02;
Object.assign(sol.shadow.camera, { left: -45, right: 45, top: 45, bottom: -45, near: 1, far: 220 });
scene.add(sol, sol.target);
const SOL_DIR = new V3(0.55, 0.62, 0.56).normalize();
// el disco del sol: un sprite con halo, lejos en la dirección de la luz
const solSprite = (() => {
  const c = document.createElement('canvas'); c.width = c.height = 128;
  const x = c.getContext('2d'), g = x.createRadialGradient(64, 64, 4, 64, 64, 64);
  g.addColorStop(0, 'rgba(255,253,235,1)'); g.addColorStop(0.18, 'rgba(255,246,200,1)'); g.addColorStop(0.3, 'rgba(255,230,150,.45)'); g.addColorStop(1, 'rgba(255,220,140,0)');
  x.fillStyle = g; x.fillRect(0, 0, 128, 128);
  const t = new THREE.CanvasTexture(c); t.encoding = THREE.sRGBEncoding;
  const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: t, fog: false, depthWrite: false, transparent: true }));
  s.scale.set(160, 160, 1); s.renderOrder = -1; scene.add(s); return s;
})();

const mats = {};
const M = (c, o) => { const k = c + JSON.stringify(o || {}); return mats[k] || (mats[k] = new THREE.MeshStandardMaterial(Object.assign({ color: C(c), flatShading: true, roughness: 0.85 }, o || {}))); };
function texMadera(base, veta) {
  const c = document.createElement('canvas'); c.width = c.height = 128;
  const x = c.getContext('2d');
  for (let i = 0; i < 8; i++) {
    x.fillStyle = i % 2 ? base : veta; x.fillRect(0, i * 16, 128, 16);
    x.fillStyle = 'rgba(60,35,15,.55)'; x.fillRect(0, i * 16 + 15, 128, 1);
    x.fillRect((i * 37) % 128, i * 16, 1, 16);
  }
  const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.encoding = THREE.sRGBEncoding; return t;
}

/* ---------- carga de scripts y modelos ---------- */
function cargarScript(src) {
  return new Promise((res, rej) => { const s = document.createElement('script'); s.src = src; s.onload = res; s.onerror = () => rej(new Error('No cargó ' + src)); document.head.appendChild(s); });
}
// GLTFLoader, el decodificador meshopt y SkeletonUtils de r128 (dentro de app2 los copia el build junto a three.min.js;
// suelto, de jsdelivr con la versión exacta, porque cdnjs no trae examples/).
let libs = null, sinLibs = false;
function cargarLibs() {
  if (sinLibs) return Promise.reject(new Error('Sin GLTFLoader'));
  const cdn = 'https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/';
  const L = [['GLTFLoader.js', 'loaders/', () => THREE.GLTFLoader], ['meshopt_decoder.js', 'libs/', () => window.MeshoptDecoder], ['SkeletonUtils.js', 'utils/', () => THREE.SkeletonUtils]];
  // Dentro de app2, si el fichero no está (p. ej. `ng serve` arrancado antes de cambiar angular.json), se pide a jsdelivr.
  const una = ([f, dir, hay]) => (hay() ? null : !J3.enApp ? cargarScript(cdn + dir + f)
    : cargarScript('../' + f).then(() => { if (!hay()) throw new Error('no define nada'); }).catch(e => {
      console.warn('Two by Two: ../' + f + ' no cargó en la app (' + e.message + '); se pide a jsdelivr. Si es `ng serve`, reinícialo: angular.json copia ese fichero.');
      return cargarScript(cdn + dir + f);
    }));
  return libs || (libs = Promise.all(L.map(una)).then(() => {
    const l = new THREE.GLTFLoader(); l.setMeshoptDecoder(window.MeshoptDecoder); l.setCrossOrigin('anonymous'); return l;
  }).catch(e => { sinLibs = true; console.error('Two by Two: sin GLTFLoader/meshopt/SkeletonUtils (' + e.message + '): el arca, el personaje y los animales salen hechos con cajitas.'); throw e; }));
}
const conPaciencia = (p, ms, que) => Promise.race([p, new Promise((_, no) => setTimeout(() => no(new Error(que + ': tardó demasiado')), ms))]);
const glbs = {};
function cargarGlb(url) {
  return glbs[url] || (glbs[url] = conPaciencia(cargarLibs().then(l => new Promise((si, no) => l.load(url, si, undefined, no))), 30000, url).catch(e => { delete glbs[url]; throw e; }));
}
let manifiesto = {};
function leerManifiesto() {
  return fetch(MODELOS + 'index.json', { credentials: 'omit' }).then(r => (r.ok ? r.json() : {})).then(j => (j && typeof j === 'object' ? j : {})).catch(() => ({}));
}
// Las animaciones: dentro del GLB, o en ficheros aparte ({nombre: archivo}) como en la vitrina.
function clipsDe(gltf, ficha) {
  const clips = (gltf.animations || []).slice(), an = ficha && ficha.animaciones;
  if (!an || Array.isArray(an) || typeof an !== 'object') return Promise.resolve(clips);
  return Promise.all(Object.keys(an).map(k => (typeof an[k] === 'string' ? cargarGlb(MODELOS + an[k]).then(g => { const c = g.animations && g.animations[0] && g.animations[0].clone(); if (c) c.name = k; return c; }).catch(() => null) : null)))
    .then(s => clips.concat(s.filter(Boolean)));
}
function buscarClip(clips, clave, ficha) {
  const k = clave.toLowerCase();
  const alias = { idle: ['idle', 'reposo', 'quieto', 'breath', 'stand'], walk: ['walk', 'camina'], run: ['run', 'corre', 'jog', 'trote'], wave: ['wave', 'saluda', 'hello'], talk: ['talk', 'habla'], pray: ['pray', 'ora', 'reza'], kneel: ['kneel', 'rodilla'] }[k] || [k];
  const lista = Array.isArray(ficha && ficha.animaciones) ? ficha.animaciones : [];
  return clips.find(c => c.name.toLowerCase() === k) || clips.find(c => alias.some(a => c.name.toLowerCase().includes(a))) || (k === 'idle' && lista[0] ? clips.find(c => c.name === lista[0]) : null) || null;
}
// Los clips de Mixamo traen la primera clave en t = 1/30 s: se corren a 0 (si no, cada vuelta se queda un cuadro quieto).
function alCero(c) {
  if (!c) return null;
  const k = c.clone(); let t0 = Infinity;
  k.tracks.forEach(t => { if (t.times.length) t0 = Math.min(t0, t.times[0]); });
  if (t0 > 0 && isFinite(t0)) k.tracks.forEach(t => { t.times = Float32Array.from(t.times, x => x - t0); });
  k.resetDuration();
  return k;
}
// El «Walking» de Mixamo sin «In Place» lleva la cadera hacia delante y al repetirse vuelve de golpe. En estos GLB el avance
// va por la Y local de la cadera (el esqueleto viene girado), no por x/z: se le quita la deriva lineal en los tres ejes,
// así la vuelta cierra sin salto y quedan el balanceo y el sube y baja. La escena es la que mueve al actor.
function enSuSitio(c) {
  if (!c) return null;
  const k = c.clone();
  k.tracks.forEach(t => {
    if (!/Hips\.position$/.test(t.name)) return;
    const n = t.times.length, T = (t.times[n - 1] - t.times[0]) || 1, v = t.values = Float32Array.from(t.values);
    for (let j = 0; j < 3; j++) { const d = v[(n - 1) * 3 + j] - v[j]; for (let i = 0; i < n; i++) v[i * 3 + j] -= d * (t.times[i] - t.times[0]) / T; }
  });
  return k;
}
// Cuántos m/s avanza el clip crudo (la cadera de la primera a la última clave): con eso el timeScale hace que los pies no patinen.
function velocidadNatural(copia, centro, clip) {
  let hips = null; copia.traverse(o => { if (!hips && o.isBone && /Hips$/.test(o.name)) hips = o; });
  if (!hips || !clip || clip.duration < 0.1) return null;
  const mx = new THREE.AnimationMixer(copia); mx.clipAction(clip).play();
  const a = new V3(), b = new V3();
  mx.setTime(0); centro.updateMatrixWorld(true); hips.getWorldPosition(a);
  mx.setTime(clip.duration * 0.999); centro.updateMatrixWorld(true); hips.getWorldPosition(b);
  mx.stopAllAction(); mx.uncacheRoot(copia);
  const v = Math.hypot(b.x - a.x, b.z - a.z) / clip.duration;
  return v > 0.15 ? v : null;
}
const tope = a => (a instanceof Int8Array ? 127 : a instanceof Uint8Array ? 255 : a instanceof Int16Array ? 32767 : a instanceof Uint16Array ? 65535 : 1);
// Los vértices de verdad (con cuantización y esqueleto): three 0.128 no desnormaliza las posiciones cuantizadas en la CPU
// y con esqueleto la malla está donde la pone el esqueleto. La misma cuenta que vitrina-carga.ts › cajaReal.
function recorrer(raiz, fn, max) {
  raiz.updateMatrixWorld(true);
  const v = new V3(), q2 = new V3(), suma = new V3(), m = new THREE.Matrix4();
  raiz.traverse(o => {
    const pos = o.isMesh && o.geometry ? o.geometry.attributes.position : null;
    if (!pos) return;
    const k = pos.normalized ? 1 / tope(pos.array || (pos.data && pos.data.array)) : 1;
    const paso = Math.max(1, Math.floor(pos.count / (max || 4000)));
    const si = o.isSkinnedMesh ? o.geometry.attributes.skinIndex : null, sw = si ? o.geometry.attributes.skinWeight : null;
    for (let i = 0; i < pos.count; i += paso) {
      v.set(pos.getX(i) * k, pos.getY(i) * k, pos.getZ(i) * k);
      if (si && sw) {
        v.applyMatrix4(o.bindMatrix); suma.set(0, 0, 0);
        const pe = [sw.getX(i), sw.getY(i), sw.getZ(i), sw.getW(i)], hu = [si.getX(i), si.getY(i), si.getZ(i), si.getW(i)];
        const tot = pe[0] + pe[1] + pe[2] + pe[3] || 1;
        for (let j = 0; j < 4; j++) {
          const b = o.skeleton.bones[hu[j]];
          if (!pe[j] || !b) continue;
          m.multiplyMatrices(b.matrixWorld, o.skeleton.boneInverses[hu[j]]);
          suma.addScaledVector(q2.copy(v).applyMatrix4(m), pe[j] / tot);
        }
        v.copy(suma).applyMatrix4(o.bindMatrixInverse).applyMatrix4(o.matrixWorld);
      } else v.applyMatrix4(o.matrixWorld);
      fn(v);
    }
  });
}
function cajaReal(raiz) { const c = new THREE.Box3(); recorrer(raiz, v => c.expandByPoint(v)); return c; }

/* Un actor de un GLB del manifiesto: el modelo de pie en y = 0, centrado, mirando a +z y con `altura` metros. */
function actorDeGlb(gltf, ficha, clipsGLB, altura) {
  const copia = THREE.SkeletonUtils.clone(gltf.scene), matsA = [];
  copia.traverse(o => {
    if (!o.isMesh) return;
    o.castShadow = true;
    if (o.isSkinnedMesh) o.frustumCulled = false;
    o.material = Array.isArray(o.material) ? o.material.map(m => m.clone()) : o.material.clone();
    [].concat(o.material).forEach(m => matsA.push(m));
  });
  // «walk» exacto antes que «caminar_cuidado» (buscarClip prueba primero el nombre exacto)
  const crudo = {}; ['idle', 'walk', 'run', 'wave', 'talk', 'pray', 'kneel'].forEach(k => { crudo[k] = alCero(buscarClip(clipsGLB, k, ficha)); });
  const clips = { idle: enSuSitio(crudo.idle), walk: enSuSitio(crudo.walk), run: enSuSitio(crudo.run), wave: crudo.wave, talk: crudo.talk, pray: crudo.pray, kneel: crudo.kneel };
  const mixer = clips.idle || clips.walk ? new THREE.AnimationMixer(copia) : null;
  if (mixer && clips.idle) { mixer.clipAction(clips.idle).play(); mixer.update(0); }
  const giro = new THREE.Group(); giro.rotation.y = (Number(ficha.giro) || 0) * Math.PI / 180; giro.add(copia);
  const caja = cajaReal(giro), tam = caja.getSize(new V3());
  const s = altura / Math.max(1e-6, tam.y);
  const centro = new THREE.Group(); centro.add(giro); centro.scale.setScalar(s);
  centro.position.set(-(caja.min.x + tam.x / 2) * s, -caja.min.y * s, -(caja.min.z + tam.z / 2) * s);
  const vNat = crudo.walk ? velocidadNatural(copia, centro, crudo.walk) : null, vRun = crudo.run ? velocidadNatural(copia, centro, crudo.run) : null;
  if (mixer && clips.idle) mixer.update(0);
  if (vNat) console.info('Two by Two: ' + ficha.archivo + ' camina ' + vNat.toFixed(2) + ' m/s con «' + crudo.walk.name + '» (' + crudo.walk.duration.toFixed(2) + ' s)');
  return { modelo: centro, mixer, clips, mats: matsA, alto: altura, largo: Math.max(tam.x, tam.z) * s, accion: null, actual: '', vNat, vRun };
}
// El paso del actor a esa velocidad: clip de correr si lo hay y va rápido; si no, caminar con el timeScale que no patina.
function pasoDe(a, vel, tope) {
  if (a.clips.run && a.vRun && vel > (a.vNat || 1) * 1.8) return animar(a, 'run', clamp(vel / a.vRun, 0.6, tope || 2.2));
  return animar(a, 'walk', a.vNat ? clamp(vel / a.vNat, 0.5, tope || 4.5) : clamp(vel / (0.9 * a.alto), 0.6, 2.4));
}
// El niño: las piernas al ritmo del avance (timeScale = velocidad / velocidad medida del clip), con tope ×3 caminando y ×4
// corriendo (a 14–22 m/s los pies patinan un poco: Joseth prefiere eso a unas piernas a ×10). Con un «Running» In Place
// (clip `run`), ése corre a su ritmo con el mismo tope.
function pasoJugador(a, vel) {
  const tope = vel > 17 ? 4 : 3;
  if (a.clips.run && a.vRun && vel > 6) return animar(a, 'run', clamp(vel / a.vRun, 0.5, tope));
  return animar(a, 'walk', a.vNat ? clamp(vel / a.vNat, 0.5, tope) : clamp(vel / (0.9 * a.alto), 0.6, tope));
}
// Un clip una sola vez (saludar) y después vuelve a `despues`.
function animarUnaVez(a, nombre, despues) {
  if (!a || !a.mixer || !a.clips[nombre]) return false;
  const c = a.clips[nombre], ac = a.mixer.clipAction(c);
  ac.reset(); ac.setLoop(THREE.LoopOnce, 1); ac.clampWhenFinished = true; ac.timeScale = 1; ac.setEffectiveWeight(1).play();
  if (a.accion && a.accion !== ac) a.accion.crossFadeTo(ac, 0.3, false);
  a.accion = ac; a.actual = c.name;
  const fin = e => { if (e.action !== ac) return; a.mixer.removeEventListener('finished', fin); if (a.actual === c.name && despues) animar(a, despues, 1); };
  a.mixer.addEventListener('finished', fin);
  return true;
}
function animar(a, nombre, escala) {
  if (!a.mixer) return false;
  const c = a.clips[nombre] || a.clips.idle;
  if (!c) return false;
  if (a.actual !== c.name) {
    const nueva = a.mixer.clipAction(c);
    nueva.setLoop(THREE.LoopRepeat, Infinity); nueva.clampWhenFinished = false;
    nueva.reset().setEffectiveWeight(1).play();
    if (a.accion) a.accion.crossFadeTo(nueva, 0.25, false);
    a.accion = nueva; a.actual = c.name;
  }
  if (escala != null && a.accion) a.accion.timeScale = escala;
  return true;
}

/* ---------- respaldo hecho con cajitas (si un GLB no carga) ---------- */
function animalDeCajas(e) {
  const r = e.respaldo || { forma: 'cuadrupedo', color: '#c9a27a', alto: 0.8 };
  const h = r.alto, g = new THREE.Group(), m1 = M(r.color), m2 = M(r.mancha || '#3a2c25'), ojo = M('#1d1d1d');
  const caja = (w, a, l, x, y, z, m) => { const b = new THREE.Mesh(new THREE.BoxGeometry(w, a, l), m); b.position.set(x, y, z); b.castShadow = true; g.add(b); return b; };
  const bola = (rr, x, y, z, m, sy) => { const b = new THREE.Mesh(new THREE.IcosahedronGeometry(rr, 1), m); b.position.set(x, y, z); if (sy) b.scale.set(1, sy, 1.15); b.castShadow = true; g.add(b); return b; };
  if (r.forma === 'cuadrupedo') {
    caja(0.42 * h, 0.4 * h, 0.95 * h, 0, 0.62 * h, 0, m1);
    caja(0.3 * h, 0.3 * h, 0.34 * h, 0, 0.86 * h, 0.55 * h, m1);
    caja(0.06 * h, 0.06 * h, 0.02 * h, -0.08 * h, 0.92 * h, 0.72 * h, ojo); caja(0.06 * h, 0.06 * h, 0.02 * h, 0.08 * h, 0.92 * h, 0.72 * h, ojo);
    [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([sx, sz]) => caja(0.11 * h, 0.44 * h, 0.11 * h, sx * 0.14 * h, 0.22 * h, sz * 0.36 * h, sx > 0 && sz < 0 ? m2 : m1));
    caja(0.07 * h, 0.07 * h, 0.3 * h, 0, 0.72 * h, -0.6 * h, m1);
    if (r.mancha) caja(0.43 * h, 0.2 * h, 0.3 * h, 0, 0.7 * h, -0.1 * h, m2);
  } else if (r.forma === 'ave') {
    bola(0.32 * h, 0, 0.45 * h, 0, m1, 0.9);
    bola(0.2 * h, 0, 0.8 * h, 0.2 * h, m1);
    const pico = new THREE.Mesh(new THREE.ConeGeometry(0.06 * h, 0.16 * h, 5), M('#f2a51f')); pico.rotation.x = Math.PI / 2; pico.position.set(0, 0.78 * h, 0.4 * h); g.add(pico);
    bola(0.035 * h, -0.08 * h, 0.85 * h, 0.36 * h, ojo); bola(0.035 * h, 0.08 * h, 0.85 * h, 0.36 * h, ojo);
    if (r.mancha) caja(0.04 * h, 0.12 * h, 0.16 * h, 0, 1.0 * h, 0.2 * h, m2);
    [-1, 1].forEach(s => caja(0.04 * h, 0.2 * h, 0.04 * h, s * 0.1 * h, 0.1 * h, 0, M('#f2a51f')));
  } else {
    bola(0.4 * h, 0, 0.3 * h, 0, m1, 0.55);
    [-1, 1].forEach(s => { bola(0.1 * h, s * 0.18 * h, 0.55 * h, 0.22 * h, M('#ffffff')); bola(0.05 * h, s * 0.18 * h, 0.58 * h, 0.3 * h, ojo); caja(0.14 * h, 0.12 * h, 0.4 * h, s * 0.36 * h, 0.08 * h, -0.1 * h, m1); });
  }
  const matsA = []; g.traverse(o => { if (o.isMesh) { o.material = o.material.clone(); matsA.push(o.material); } });
  return { modelo: g, mixer: null, clips: {}, mats: matsA, alto: h, largo: h, accion: null, actual: '' };
}
function ninoDeCajas(tipo) {
  const g = new THREE.Group(), piel = M('#d9a07a'), ropa = M(tipo === 'nina' ? '#ff6a4d' : '#2f7ad9'), pelo = M('#3b2416');
  const add = (geo, m, x, y, z) => { const o = new THREE.Mesh(geo, m); o.position.set(x, y, z); o.castShadow = true; g.add(o); return o; };
  add(new THREE.CylinderGeometry(0.17, 0.2, 0.5, 8), ropa, 0, 0.62, 0);
  [-1, 1].forEach(s => { add(new THREE.CylinderGeometry(0.06, 0.06, 0.4, 6), M('#2b3a55'), s * 0.08, 0.2, 0); add(new THREE.CylinderGeometry(0.045, 0.045, 0.42, 6), piel, s * 0.24, 0.62, 0); });
  add(new THREE.IcosahedronGeometry(0.17, 1), piel, 0, 1.02, 0);
  add(new THREE.IcosahedronGeometry(0.175, 1), pelo, 0, 1.08, -0.03).scale.set(1, tipo === 'nina' ? 1.05 : 0.7, 1);
  return { modelo: g, mixer: null, clips: {}, mats: [], alto: 1.2, largo: 0.5, accion: null, actual: '' };
}

/* ---------- el arca ---------- */
// ARCA = { grupo, hx, hz (medio largo y medio ancho del casco, para chocar), rampa: { cx, ancho, zTope, yTope, zPie, yPie, zSuelo, zPuerta, altoPuerta }, provisional, lado }
let ARCA = null;
function analizarArca(gltf) {
  const raiz = new THREE.Group(), giro = new THREE.Group();
  giro.add(gltf.scene); raiz.add(giro);
  gltf.scene.traverse(o => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
  let caja = cajaReal(raiz), tam = caja.getSize(new V3());
  if (tam.z > tam.x * 1.15) { giro.rotation.y = Math.PI / 2; caja = cajaReal(raiz); tam = caja.getSize(new V3()); }
  const s = ALTO_ARCA / Math.max(1e-6, tam.y);
  raiz.scale.setScalar(s);
  const pts = []; recorrer(raiz, v => pts.push(v.x, v.y, v.z), 12000);
  caja = new THREE.Box3(); for (let i = 0; i < pts.length; i += 3) caja.expandByPoint(new V3(pts[i], pts[i + 1], pts[i + 2]));
  tam = caja.getSize(new V3());
  // el casco a media altura (ahí no está la rampa): su ancho y su largo
  let zMin = Infinity, zMax = -Infinity, xMin = Infinity, xMax = -Infinity;
  for (let i = 0; i < pts.length; i += 3) {
    const y = (pts[i + 1] - caja.min.y) / tam.y;
    if (y > 0.3 && y < 0.6) { zMin = Math.min(zMin, pts[i + 2]); zMax = Math.max(zMax, pts[i + 2]); xMin = Math.min(xMin, pts[i]); xMax = Math.max(xMax, pts[i]); }
  }
  const cz = (zMin + zMax) / 2, cx = (xMin + xMax) / 2, hz = (zMax - zMin) / 2, hx = (xMax - xMin) / 2;
  const sale = { mas: caja.max.z - zMax, menos: zMin - caja.min.z };
  const lado = sale.mas >= sale.menos ? 1 : -1;
  // a coordenadas del mundo: centro del casco en (0, 0), la quilla en y = 0 y la rampa hacia +z
  const P = [];
  for (let i = 0; i < pts.length; i += 3) P.push([(pts[i] - cx) * lado, pts[i + 1] - caja.min.y, (pts[i + 2] - cz) * lado]);
  raiz.position.set(-cx * lado, -caja.min.y, -cz * lado);
  const grupo = new THREE.Group(); grupo.rotation.y = lado < 0 ? Math.PI : 0;
  grupo.add(raiz);
  let rampa = null;
  const max = Math.max(sale.mas, sale.menos);
  if (max > hz * 0.12) {
    const R = P.filter(p => p[2] > hz * 1.03);
    if (R.length > 6) {
      let rx0 = Infinity, rx1 = -Infinity, zP = -Infinity, zT = Infinity;
      R.forEach(p => { rx0 = Math.min(rx0, p[0]); rx1 = Math.max(rx1, p[0]); zP = Math.max(zP, p[2]); zT = Math.min(zT, p[2]); });
      const largo = zP - zT;
      let yPie = 0, yTope = 0;
      R.forEach(p => { if (p[2] > zP - largo * 0.18) yPie = Math.max(yPie, p[1]); if (p[2] < zT + largo * 0.18) yTope = Math.max(yTope, p[1]); });
      const ancho = rx1 - rx0, rcx = (rx0 + rx1) / 2;
      // la pared del casco encima de la rampa: ahí va la puerta
      let zPuerta = -Infinity;
      P.forEach(p => { if (Math.abs(p[0] - rcx) < ancho / 2 && p[1] > yTope + 0.6 && p[1] < yTope + 5 && p[2] < zT + 0.5) zPuerta = Math.max(zPuerta, p[2]); });
      if (!isFinite(zPuerta)) zPuerta = zT;
      if (yTope > yPie + 0.3 && ancho > 2) rampa = { cx: rcx, ancho, zTope: zT, yTope, zPie: zP, yPie, zPuerta, altoPuerta: Math.min(6, ALTO_ARCA * 0.15) };
    }
  }
  return { grupo, hx, hz, rampa, lado, glb: true, nodoPuerta: gltf.scene.getObjectByName('puerta') || null };
}
// La rampa sigue hasta el suelo (la del modelo puede quedar en el aire); si el modelo no trae rampa, se hace entera.
function completarRampa(A) {
  const madera = new THREE.MeshStandardMaterial({ map: texMadera('#9b6b3d', '#8a5d33'), roughness: 0.9, flatShading: true });
  if (!A.rampa) {
    A.rampa = { cx: 0, ancho: 6, yTope: 3.8, zTope: A.hz * 0.8, yPie: 3.8, zPie: A.hz * 0.8, zPuerta: A.hz * 0.78, altoPuerta: 5 };
    A.rampaPropia = true;
  }
  const r = A.rampa;
  const pend = A.rampaPropia || r.zPie - r.zTope < 0.5 ? 0.38 : clamp((r.yTope - r.yPie) / (r.zPie - r.zTope), 0.2, 0.6);
  r.zSuelo = r.zPie + r.yPie / pend;
  r.pend = pend;
  const desde = A.rampaPropia ? r.zTope : r.zPie - 0.3, hasta = r.zSuelo, y0 = A.rampaPropia ? r.yTope : r.yPie;
  // la del arca por partes (tools/arca_tripo.py) ya baja hasta el suelo: lo que queda alto al pie son los listones
  if (hasta - desde > 0.4 && (A.rampaPropia || r.yPie > 2.5)) {
    const l = Math.hypot(hasta - desde, y0), cuña = new THREE.Mesh(new THREE.BoxGeometry(r.ancho * 0.96, 0.45, l), madera);
    madera.map.repeat.set(r.ancho / 3, l / 3);
    cuña.position.set(r.cx, y0 / 2 - 0.2, (desde + hasta) / 2); cuña.rotation.x = Math.atan2(y0, hasta - desde);
    cuña.castShadow = cuña.receiveShadow = true; scene.add(cuña);
  }
  A.abre = 0; A.abreMeta = 0;
  if (A.nodoPuerta) {
    // La puerta del modelo es corrediza (tools/arca_tripo.py): una hoja gruesa bajo un riel que corre a los dos lados.
    // Primero sale un metro hacia la rampa (+z) para librar el marco y luego corre su ancho a lo largo del casco (+x).
    // Se mueve en el espacio del padre, así que da igual la escala o la cuantización del GLB.
    const n = A.nodoPuerta, padre = n.parent;
    A.grupo.updateMatrixWorld(true);
    const bb = cajaReal(n), w0 = n.getWorldPosition(new V3()), p0 = n.position.clone();
    const enPadre = (dx, dz) => padre.worldToLocal(w0.clone().add(new V3(dx, 0, dz))).sub(p0);
    const fuera = enPadre(0, 1), corre = enPadre((bb.max.x - bb.min.x) * 1.03, 1).sub(fuera);
    A.abrir = f => { n.position.copy(p0).addScaledVector(fuera, suave(0, 0.25, f)).addScaledVector(corre, suave(0.2, 1, f)); };
    console.info('Two by Two: la puerta del arca es corrediza (nodo «puerta», ' + (bb.max.x - bb.min.x).toFixed(1) + ' m de ancho).');
    return;
  }
  // la puerta que se cierra al final (no se ve hasta entonces): bisagra abajo, abierta tumbada hacia afuera
  const piv = new THREE.Group(); piv.position.set(r.cx, r.yTope, r.zPuerta + 0.35);
  const p = new THREE.Mesh(new THREE.BoxGeometry(r.ancho * 0.92, r.altoPuerta, 0.35), new THREE.MeshStandardMaterial({ map: texMadera('#8a5a2e', '#7a4f28'), roughness: 0.9 }));
  p.material.map.rotation = Math.PI / 2; p.position.y = r.altoPuerta / 2; p.castShadow = true; piv.add(p);
  piv.visible = false; scene.add(piv); A.puerta = piv;
  A.abierta = Math.PI / 2 + Math.atan(pend) - 0.06;
}
function arcaProvisional() {
  const grupo = new THREE.Group(), hx = 31, hz = 14.6, hc = 13.5;
  const madera = new THREE.MeshStandardMaterial({ map: texMadera('#8f5f34', '#a06c3d'), roughness: 0.9, flatShading: true });
  madera.map.repeat.set(6, 2);
  const g = new THREE.BoxGeometry(2 * hx, hc, 2 * hz, 14, 5, 6); g.translate(0, hc / 2, 0);
  const p = g.attributes.position;
  for (let i = 0; i < p.count; i++) {
    const u = p.getX(i) / hx, v = p.getY(i) / hc, w = p.getZ(i) / hz;
    p.setXYZ(i, u * hx * (0.82 + 0.18 * v), p.getY(i) + v * 3 * Math.pow(Math.abs(u), 4), w * hz * (0.5 + 0.5 * Math.sqrt(v)) * (1 - 0.45 * Math.pow(Math.abs(u), 3)));
  }
  g.computeVertexNormals();
  const casco = new THREE.Mesh(g, madera); casco.castShadow = casco.receiveShadow = true; grupo.add(casco);
  const casa = new THREE.Mesh(new THREE.BoxGeometry(2 * hx * 0.62, 9, 2 * hz * 0.7), M('#b07a45')); casa.position.y = hc + 4.5; casa.castShadow = true; grupo.add(casa);
  const vent = new THREE.Mesh(new THREE.BoxGeometry(2 * hx * 0.56, 1.3, 2 * hz * 0.7 + 0.12), M('#3a2414')); vent.position.y = hc + 6.8; grupo.add(vent);
  // el techo: un prisma triangular a lo largo (cilindro de 3 lados con la arista arriba)
  const techo = new THREE.Mesh(new THREE.CylinderGeometry(1, 1, 2 * hx * 0.7, 3), M('#6e4526'));
  techo.rotation.z = Math.PI / 2; techo.rotation.x = -Math.PI / 2; techo.scale.set(hz * 0.85, 1, 5); techo.position.y = hc + 9 + 2.5; techo.castShadow = true; grupo.add(techo);
  const yTope = 3.8, zT = hz * (0.5 + 0.5 * Math.sqrt(yTope / hc));
  const hueco = new THREE.Mesh(new THREE.BoxGeometry(5.6, 5.2, 0.4), M('#24160c')); hueco.position.set(0, yTope + 2.6, zT + 0.15); grupo.add(hueco);
  return { grupo, hx, hz: hz * 0.9, lado: 1, glb: false, rampa: { cx: 0, ancho: 6.2, yTope, zTope: zT, yPie: yTope, zPie: zT, zPuerta: zT, altoPuerta: 5.2 }, rampaPropia: true };
}

/* ---------- terreno ---------- */
const TAM = 900, N = 180, PASO = TAM / N;
const alturas = new Float32Array((N + 1) * (N + 1));
const CHARCA = { x: 46, z: 92, r: 8 };
let camino = []; // puntos [x, z] del camino de tierra, cada ~1,5 m
function distCamino(x, z) { let d = Infinity; for (let i = 0; i < camino.length; i += 2) { const dx = x - camino[i][0], dz = z - camino[i][1], e = dx * dx + dz * dz; if (e < d) d = e; } return Math.sqrt(d); }
function distArca(x, z) {
  if (!ARCA) return 99;
  const r = ARCA.rampa, ex = Math.max(0, Math.abs(x) - ARCA.hx - 2), ez = Math.max(0, z > 0 ? z - (Math.abs(x - r.cx) < r.ancho ? r.zSuelo + 2 : ARCA.hz + 2) : -z - ARCA.hz - 2);
  return Math.hypot(ex, ez);
}
function alturaTeorica(x, z) {
  const r = Math.hypot(x, z - 40);
  let h = 0.6 + (0.45 + suave(50, 170, r) * 1.8) * (Math.sin(x * 0.031 + 1.3) * Math.cos(z * 0.027 - 0.4) + 0.6 * Math.sin(x * 0.067 + z * 0.043 + 2) + 0.3 * Math.sin(x * 0.13 - z * 0.11));
  const lado = 1 - suave(-70, -140, x);
  h += suave(150, 380, r) * 70 * lado * (0.55 + 0.45 * Math.sin(Math.atan2(z - 40, x) * 3 + 0.7));
  const o = suave(-100, -160, x); h = h * (1 - o) - o * 6;
  h *= suave(3, 24, distArca(x, z));
  const dc = Math.hypot(x - CHARCA.x, z - CHARCA.z);
  if (dc < CHARCA.r + 6) { const base = 0.5; h = lerp(base, h, suave(CHARCA.r, CHARCA.r + 6, dc)); if (dc < CHARCA.r) h -= 1.4 * (1 - (dc / CHARCA.r) ** 2); }
  return h;
}
function terreno(x, z) {
  const fx = clamp((x + TAM / 2) / PASO, 0, N - 1e-4), fz = clamp((z + TAM / 2) / PASO, 0, N - 1e-4);
  const ix = Math.floor(fx), iz = Math.floor(fz), u = fx - ix, v = fz - iz, W = N + 1;
  const a = alturas[ix + iz * W], b = alturas[ix + (iz + 1) * W], c = alturas[ix + 1 + (iz + 1) * W], d = alturas[ix + 1 + iz * W];
  return u + v <= 1 ? a + (d - a) * u + (b - a) * v : c + (b - c) * (1 - u) + (d - c) * (1 - v);
}
// El suelo donde se pisa: el terreno, o la rampa del arca (y dentro de la puerta, el umbral).
function suelo(x, z) {
  const t = terreno(x, z);
  if (!ARCA) return t;
  const r = ARCA.rampa;
  if (Math.abs(x - r.cx) < r.ancho / 2 && z > r.zPuerta - 6 && z < r.zSuelo) return Math.max(t, z <= r.zTope ? r.yTope : r.yTope - (z - r.zTope) * r.pend);
  return t;
}

let agua = null, charcaAgua = null, nubes = null, nubesDatos = [], lluvia = null, arco = null, pasto = null, marcaArca = null, anillo = null, aro = null, huellas = null;
const ARO = { x: 0, z: 0, r: 3.2 };
const tiempoU = { value: 0 };
function armarMundo() {
  semilla = 20261026;
  const r = ARCA.rampa;
  // el camino: de la entrada de la pradera al pie de la rampa
  const cp = [[10, 140], [-16, 112], [12, 84], [-8, 58], [r.cx + 3, r.zSuelo + 14], [r.cx, r.zSuelo + 1]].map(p => new V3(p[0], 0, p[1]));
  camino = new THREE.CatmullRomCurve3(cp).getSpacedPoints(110).map(p => [p.x, p.z]);
  // alturas y colores
  const W = N + 1, pos = new Float32Array(W * W * 3), col = new Float32Array(W * W * 3), idx = [];
  for (let iz = 0; iz <= N; iz++) for (let ix = 0; ix <= N; ix++) {
    const x = -TAM / 2 + ix * PASO, z = -TAM / 2 + iz * PASO, h = alturaTeorica(x, z), i = ix + iz * W;
    alturas[i] = h; pos[i * 3] = x; pos[i * 3 + 1] = h; pos[i * 3 + 2] = z;
  }
  const verde = C('#79c25a'), verde2 = C('#5ea548'), monte = C('#5d8a45'), roca = C('#8b8a80'), nieve = C('#eef2f5'), arena = C('#e3d09c'), pisado = C('#a9b46a'), x0 = new THREE.Color();
  for (let iz = 0; iz <= N; iz++) for (let ix = 0; ix <= N; ix++) {
    const i = ix + iz * W, x = pos[i * 3], z = pos[i * 3 + 2], h = alturas[i];
    const pend = Math.abs(alturas[Math.min(N, ix + 1) + iz * W] - alturas[Math.max(0, ix - 1) + iz * W]) + Math.abs(alturas[ix + Math.min(N, iz + 1) * W] - alturas[ix + Math.max(0, iz - 1) * W]);
    x0.copy(verde).lerp(verde2, 0.5 + 0.5 * Math.sin(x * 0.05 + Math.cos(z * 0.04) * 2));
    x0.lerp(monte, suave(6, 30, h)); x0.lerp(roca, Math.max(suave(40, 70, h), suave(10, 22, pend) * suave(8, 20, h))); x0.lerp(nieve, suave(85, 110, h));
    if (x < -70) x0.lerp(arena, suave(1.2, -0.6, h));
    x0.lerp(pisado, 0.6 * (1 - suave(2, 12, distArca(x, z))));
    col[i * 3] = x0.r; col[i * 3 + 1] = x0.g; col[i * 3 + 2] = x0.b;
  }
  for (let iz = 0; iz < N; iz++) for (let ix = 0; ix < N; ix++) { const a = ix + iz * W, b = a + W, c = b + 1, d = a + 1; idx.push(a, b, d, b, c, d); }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(pos, 3)); g.setAttribute('color', new THREE.BufferAttribute(col, 3)); g.setIndex(idx); g.computeVertexNormals();
  const suelo3 = new THREE.Mesh(g, new THREE.MeshLambertMaterial({ vertexColors: true })); suelo3.receiveShadow = true; scene.add(suelo3);
  // el camino de tierra: una cinta sobre el terreno
  {
    const n = camino.length, p = new Float32Array(n * 6), c = new Float32Array(n * 6), ix = [], t1 = C('#c79b62'), t2 = C('#b38652');
    for (let i = 0; i < n; i++) {
      const a = camino[Math.max(0, i - 1)], b = camino[Math.min(n - 1, i + 1)], dx = b[0] - a[0], dz = b[1] - a[1], l = Math.hypot(dx, dz) || 1, ancho = 1.7 + 0.25 * Math.sin(i * 0.7);
      const nx = -dz / l * ancho, nz = dx / l * ancho, [x, z] = camino[i];
      [[x + nx, z + nz], [x - nx, z - nz]].forEach(([px, pz], k) => { p[i * 6 + k * 3] = px; p[i * 6 + k * 3 + 1] = suelo(px, pz) + 0.07; p[i * 6 + k * 3 + 2] = pz; const cc = (i + k) % 3 ? t1 : t2; c[i * 6 + k * 3] = cc.r; c[i * 6 + k * 3 + 1] = cc.g; c[i * 6 + k * 3 + 2] = cc.b; });
      if (i < n - 1) { const a2 = i * 2; ix.push(a2, a2 + 2, a2 + 1, a2 + 1, a2 + 2, a2 + 3); }
    }
    const gc = new THREE.BufferGeometry(); gc.setAttribute('position', new THREE.BufferAttribute(p, 3)); gc.setAttribute('color', new THREE.BufferAttribute(c, 3)); gc.setIndex(ix); gc.computeVertexNormals();
    const cin = new THREE.Mesh(gc, new THREE.MeshLambertMaterial({ vertexColors: true, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2 })); cin.receiveShadow = true; scene.add(cin);
    const exp = new THREE.Mesh(new THREE.CircleGeometry(9, 20), new THREE.MeshLambertMaterial({ color: C('#c39a64'), polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2 }));
    exp.rotation.x = -Math.PI / 2; exp.position.set(r.cx, 0.05, r.zSuelo + 4); exp.receiveShadow = true; scene.add(exp);
  }
  // el agua: el lago al oeste (un plano grande bajo todo) y la charca de las ranas
  agua = new THREE.Mesh(new THREE.PlaneGeometry(2400, 2400), new THREE.MeshPhongMaterial({ color: C('#3f9cc0'), specular: 0x6688aa, shininess: 70, transparent: true, opacity: 0.9 }));
  agua.rotation.x = -Math.PI / 2; agua.position.y = -1; scene.add(agua);
  charcaAgua = new THREE.Mesh(new THREE.CircleGeometry(CHARCA.r + 0.6, 24), agua.material);
  charcaAgua.rotation.x = -Math.PI / 2; charcaAgua.position.set(CHARCA.x, 0.15, CHARCA.z); scene.add(charcaAgua);
  armarMontes(); armarArboles(); armarPasto(); armarCielo();
  // el anillo que marca al animal que se puede tocar
  anillo = new THREE.Mesh(new THREE.RingGeometry(0.85, 1.05, 32), new THREE.MeshBasicMaterial({ color: C('#ffd447'), transparent: true, opacity: 0.85, depthWrite: false }));
  anillo.rotation.x = -Math.PI / 2; anillo.visible = false; scene.add(anillo);
  // el aro al pie de la rampa: ahí se trae la pareja; y las huellas brillantes que llevan hasta él
  ARO.x = r.cx; ARO.z = r.zSuelo + 3.6;
  aro = new THREE.Group();
  const amat = new THREE.MeshBasicMaterial({ color: C('#ffd447'), transparent: true, opacity: 0.9, depthWrite: false, fog: false });
  const toro = new THREE.Mesh(new THREE.TorusGeometry(ARO.r, 0.2, 6, 48), amat); toro.rotation.x = -Math.PI / 2; aro.add(toro);
  const disco = new THREE.Mesh(new THREE.CircleGeometry(ARO.r, 40), new THREE.MeshBasicMaterial({ color: C('#ffd447'), transparent: true, opacity: 0.22, depthWrite: false })); disco.rotation.x = -Math.PI / 2; aro.add(disco);
  aro.position.set(ARO.x, suelo(ARO.x, ARO.z) + 0.12, ARO.z); scene.add(aro);
  marcaArca = flecha(2.2, colegio); marcaArca.position.set(ARO.x, 6, ARO.z); marcaArca.visible = false; scene.add(marcaArca);
  crearFaros();
  const sh = new THREE.Shape(); [[-0.7, -0.2], [0, 0.5], [0.7, -0.2], [0.7, -0.55], [0, 0.15], [-0.7, -0.55]].forEach(([x, y], i) => (i ? sh.lineTo(x, y) : sh.moveTo(x, y)));
  const hg = new THREE.ShapeGeometry(sh); hg.rotateX(Math.PI / 2);
  huellas = new THREE.InstancedMesh(hg, new THREE.MeshBasicMaterial({ color: C('#ffd447'), transparent: true, opacity: 0.95, depthWrite: false, side: THREE.DoubleSide, fog: false }), 48);
  huellas.frustumCulled = false; huellas.visible = false; scene.add(huellas);
}
// Cada cuadro: el aro late (más cuando hay que llevar la pareja) y las huellas corren del jugador al aro.
const _h = new THREE.Object3D();
function guiar(t) {
  if (!aro) return;
  const llevar = J.fase === 'juego' && pasoActual() === 'llevar';
  aro.visible = J.fase === 'juego' || J.fase === 'pregunta';
  aro.children[0].material.opacity = llevar ? 0.75 + 0.25 * Math.sin(t * 6) : 0.45;
  aro.scale.setScalar(llevar ? 1 + 0.06 * Math.sin(t * 6) : 1);
  marcaArca.visible = llevar;
  if (llevar) { marcaArca.position.y = suelo(ARO.x, ARO.z) + 5 + Math.sin(t * 3) * 0.5; marcaArca.rotation.y = t * 1.2; }
  huellas.visible = llevar;
  if (!llevar) return;
  const dx = ARO.x - jug.x, dz = ARO.z - jug.z, L = Math.hypot(dx, dz), ang = Math.atan2(dx, dz), paso = 2.2, off = (t * 3) % paso;
  for (let i = 0; i < huellas.count; i++) {
    const d = 1.6 + off + i * paso, ok = d < L - ARO.r * 0.6;
    const x = jug.x + dx / L * d, z = jug.z + dz / L * d;
    _h.position.set(x, ok ? suelo(x, z) + 0.15 : -50, z); _h.rotation.set(0, ang, 0); _h.scale.setScalar(ok ? 0.9 : 0.001); _h.updateMatrix();
    huellas.setMatrixAt(i, _h.matrix);
  }
  huellas.instanceMatrix.needsUpdate = true;
}
function flecha(t, color) {
  const g = new THREE.Group(), m = new THREE.MeshBasicMaterial({ color: C(color), fog: false });
  const c = new THREE.Mesh(new THREE.ConeGeometry(0.5 * t, 0.8 * t, 4), m); c.rotation.x = Math.PI; g.add(c);
  const b = new THREE.Mesh(new THREE.BoxGeometry(0.32 * t, 0.6 * t, 0.32 * t), m); b.position.y = 0.65 * t; g.add(b);
  return g;
}
// Une geometrías (sin índice) en una sola, con su color por vértice: los montes son una malla.
function fusionar(lista) {
  let n = 0; lista.forEach(g => { n += g.attributes.position.count; });
  const p = new Float32Array(n * 3), c = new Float32Array(n * 3); let o = 0;
  lista.forEach(g => { p.set(g.attributes.position.array, o * 3); c.set(g.attributes.color.array, o * 3); o += g.attributes.position.count; g.dispose(); });
  const r = new THREE.BufferGeometry(); r.setAttribute('position', new THREE.BufferAttribute(p, 3)); r.setAttribute('color', new THREE.BufferAttribute(c, 3)); r.computeVertexNormals(); return r;
}
function armarMontes() {
  const lista = [], roca = C('#7d8a8f'), roca2 = C('#66757c'), nieve = C('#f3f6f8'), bosque = C('#4f7a46');
  for (let i = 0; i < 18; i++) {
    const ang = -Math.PI * 0.95 + i / 17 * Math.PI * 1.55 + az(-0.08, 0.08); // del norte al este, sin tapar el lago
    const rr = az(360, 470), x = Math.cos(ang) * rr, z = 40 + Math.sin(ang) * rr, alto = az(120, 210), radio = az(80, 130);
    const g = new THREE.ConeGeometry(radio, alto, 9, 4).toNonIndexed(), p = g.attributes.position, col = new Float32Array(p.count * 3);
    const base = alturaTeorica(x, z) - 12, cc = new THREE.Color();
    for (let k = 0; k < p.count; k++) {
      const y = p.getY(k) + alto / 2, f = y / alto;
      if (f < 0.98) { const j = Math.sin(p.getX(k) * 0.11 + p.getZ(k) * 0.07 + i) * radio * 0.08; p.setX(k, p.getX(k) + j); p.setZ(k, p.getZ(k) - j * 0.6); }
      p.setXYZ(k, p.getX(k) + x, y + base, p.getZ(k) + z);
    }
    for (let k = 0; k < p.count; k += 3) {
      const f = (p.getY(k) + p.getY(k + 1) + p.getY(k + 2)) / 3 - base;
      cc.copy(f / alto < 0.25 ? bosque : (k / 3) % 2 ? roca : roca2); if (f / alto > 0.62) cc.copy(nieve);
      for (let j = 0; j < 3; j++) { col[(k + j) * 3] = cc.r; col[(k + j) * 3 + 1] = cc.g; col[(k + j) * 3 + 2] = cc.b; }
    }
    g.setAttribute('color', new THREE.BufferAttribute(col, 3)); lista.push(g);
  }
  const montes = new THREE.Mesh(fusionar(lista), new THREE.MeshLambertMaterial({ vertexColors: true }));
  scene.add(montes);
}
function libre(x, z, dCamino, dArca) {
  return x > -95 && distCamino(x, z) > dCamino && distArca(x, z) > dArca && Math.hypot(x - CHARCA.x, z - CHARCA.z) > CHARCA.r + 2;
}
function armarArboles() {
  const dummy = new THREE.Object3D(), lista = [];
  for (let k = 0; k < 2000 && lista.length < 280; k++) {
    const a = az(0, Math.PI * 2), rr = az(55, 330), x = Math.cos(a) * rr, z = 40 + Math.sin(a) * rr;
    if (!libre(x, z, 7, 18) || alturaTeorica(x, z) > 60) continue;
    // más tupido hacia los cerros que en la pradera
    if (rr < 110 && azar() > 0.25) continue;
    lista.push([x, z, az(0.8, 1.5), azar() < 0.45]);
  }
  const tronco = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.22, 0.35, 3, 6).translate(0, 1.5, 0), M('#7a5230'), lista.length);
  const redondos = lista.filter(t => !t[3]), pinos = lista.filter(t => t[3]);
  const copaR = new THREE.InstancedMesh(new THREE.IcosahedronGeometry(2.4, 0).translate(0, 4.4, 0), new THREE.MeshStandardMaterial({ color: 0xffffff, flatShading: true, roughness: 0.9 }), redondos.length);
  const copaP = new THREE.InstancedMesh(new THREE.ConeGeometry(2.2, 6.5, 7).translate(0, 5.6, 0), new THREE.MeshStandardMaterial({ color: 0xffffff, flatShading: true, roughness: 0.9 }), pinos.length);
  const tonosR = ['#4f9a3c', '#62ad45', '#3f8a3a', '#7bb84a'].map(C), tonosP = ['#2f6e45', '#3a7d4c', '#285f3d'].map(C);
  let iR = 0, iP = 0;
  lista.forEach((t, i) => {
    dummy.position.set(t[0], alturaTeorica(t[0], t[1]) - 0.2, t[1]); dummy.rotation.set(0, az(0, 6.28), 0); dummy.scale.setScalar(t[2]); dummy.updateMatrix();
    tronco.setMatrixAt(i, dummy.matrix);
    if (t[3]) { copaP.setMatrixAt(iP, dummy.matrix); copaP.setColorAt(iP++, tonosP[i % 3]); } else { copaR.setMatrixAt(iR, dummy.matrix); copaR.setColorAt(iR++, tonosR[i % 4]); }
  });
  [tronco, copaR, copaP].forEach(m => { m.castShadow = true; m.receiveShadow = true; m.frustumCulled = false; scene.add(m); });
  // rocas
  const rocas = []; for (let k = 0; k < 900 && rocas.length < 130; k++) { const a = az(0, 6.28), rr = az(18, 300), x = Math.cos(a) * rr, z = 40 + Math.sin(a) * rr; if (libre(x, z, 4, 8)) rocas.push([x, z, az(0.3, rr > 100 ? 3.2 : 1.2)]); }
  const piedras = new THREE.InstancedMesh(new THREE.DodecahedronGeometry(1, 0), M('#9a968b'), rocas.length);
  rocas.forEach((t, i) => { dummy.position.set(t[0], alturaTeorica(t[0], t[1]) + t[2] * 0.2, t[1]); dummy.rotation.set(az(0, 3), az(0, 3), az(0, 3)); dummy.scale.set(t[2], t[2] * 0.65, t[2] * 0.9); dummy.updateMatrix(); piedras.setMatrixAt(i, dummy.matrix); });
  piedras.castShadow = piedras.receiveShadow = true; piedras.frustumCulled = false; scene.add(piedras);
}
function armarPasto() {
  // Mata de 5 briznas: cada una en dos tramos (se curva), se afina hasta la punta y se inclina a su lado; alto, ancho y
  // color cambian por brizna (verde oscuro abajo, claro o pajizo en la punta). El viento las mece suave, con rachas que
  // viajan por la pradera (shader: sólo mueve los vértices de arriba).
  const p = [], c = [], base = C('#356b27'), medio = C('#5f9f3c'), puntas = ['#a9d468', '#c3dc7c', '#d6cf86', '#8fc65a'].map(C), pc = new THREE.Color();
  const v = (x, y, z, k) => { p.push(x, y, z); c.push(k.r, k.g, k.b); };
  for (let k = 0; k < 5; k++) {
    const a = k * 1.2566 + az(-0.3, 0.3), r = az(0.01, 0.09), bx = Math.cos(a) * r, bz = Math.sin(a) * r;
    const h = az(0.26, 0.62), w = az(0.022, 0.04), inc = az(0.12, 0.35), dir = a + az(-0.7, 0.7), ix = Math.cos(dir), iz = Math.sin(dir);
    const nx = -iz * w, nz = ix * w, o1 = inc * h * 0.3, o2 = inc * h;
    const mx = bx + ix * o1, mz = bz + iz * o1, tx = bx + ix * o2, tz = bz + iz * o2;
    pc.copy(puntas[k % 4]);
    v(bx - nx, 0, bz - nz, base); v(bx + nx, 0, bz + nz, base); v(mx - nx * 0.6, h * 0.55, mz - nz * 0.6, medio);
    v(bx + nx, 0, bz + nz, base); v(mx + nx * 0.6, h * 0.55, mz + nz * 0.6, medio); v(mx - nx * 0.6, h * 0.55, mz - nz * 0.6, medio);
    v(mx - nx * 0.6, h * 0.55, mz - nz * 0.6, medio); v(mx + nx * 0.6, h * 0.55, mz + nz * 0.6, medio); v(tx, h, tz, pc);
  }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(p, 3)); g.setAttribute('color', new THREE.Float32BufferAttribute(c, 3)); g.computeVertexNormals();
  const m = new THREE.MeshLambertMaterial({ vertexColors: true, side: THREE.DoubleSide });
  m.onBeforeCompile = sh => {
    sh.uniforms.uT = tiempoU;
    sh.vertexShader = 'uniform float uT;\n' + sh.vertexShader.replace('#include <begin_vertex>', '#include <begin_vertex>\n#ifdef USE_INSTANCING\nvec2 wp = vec2(instanceMatrix[3].x, instanceMatrix[3].z);\nfloat racha = 0.55 + 0.45 * sin(uT * 0.5 - wp.x * 0.06 - wp.y * 0.04);\nfloat f = position.y * position.y * racha;\ntransformed.x += (sin(uT * 1.7 + wp.x * 0.35 + wp.y * 0.2) * 0.35 + 0.25) * f;\ntransformed.z += sin(uT * 1.2 + wp.y * 0.3) * 0.15 * f;\n#endif');
  };
  const n = tactil ? 4500 : 9000, lista = [];
  for (let k = 0; k < n * 3 && lista.length < n; k++) {
    const a = az(0, 6.28), rr = Math.sqrt(azar()) * 150, x = Math.cos(a) * rr, z = 45 + Math.sin(a) * rr;
    if (libre(x, z, 2.2, 3)) lista.push([x, z]);
  }
  pasto = new THREE.InstancedMesh(g, m, lista.length);
  const flores = new THREE.InstancedMesh(new THREE.IcosahedronGeometry(0.11, 0), new THREE.MeshLambertMaterial({ color: 0xffffff }), Math.floor(lista.length / 9));
  const tonos = ['#ffffff', '#ffe14d', '#ff9ec7', '#c8a6ff', '#ffffff'].map(C), dummy = new THREE.Object3D(), tinte = new THREE.Color();
  lista.forEach(([x, z], i) => {
    dummy.position.set(x, terreno(x, z) - 0.02, z); dummy.rotation.set(0, az(0, 6.28), 0); const s = az(0.75, 1.45); dummy.scale.set(s, s * az(0.7, 1.5), s); dummy.updateMatrix();
    pasto.setMatrixAt(i, dummy.matrix);
    const seco = azar() < 0.12; // unas matas más pajizas
    pasto.setColorAt(i, tinte.setRGB(az(0.88, 1.05) + (seco ? 0.15 : 0), az(0.9, 1.08), az(0.75, 0.95) - (seco ? 0.1 : 0)));
    if (i % 9 === 0 && i / 9 < flores.count) { dummy.position.y += 0.4 * s; dummy.scale.setScalar(az(0.8, 1.3)); dummy.updateMatrix(); flores.setMatrixAt(i / 9, dummy.matrix); flores.setColorAt(i / 9, tonos[(i / 9) % 5]); }
  });
  pasto.receiveShadow = true; pasto.frustumCulled = flores.frustumCulled = false; scene.add(pasto, flores);
}
function armarCielo() {
  // nubes: 20 nubes de 6 bolas; las que se ven y su color siguen al clima
  nubes = new THREE.InstancedMesh(new THREE.IcosahedronGeometry(1, 1), new THREE.MeshLambertMaterial({ color: 0xffffff, fog: false, emissive: C('#9aa4ad'), emissiveIntensity: 0.55 }), 120);
  for (let i = 0; i < 20; i++) {
    const a = az(0, 6.28), rr = az(140, 430), cx = Math.cos(a) * rr, cz = Math.sin(a) * rr, cy = az(85, 140), t = az(14, 26);
    for (let k = 0; k < 6; k++) nubesDatos.push({ i, x: cx + az(-1.6, 1.6) * t, y: cy + az(-0.2, 0.35) * t, z: cz + az(-0.7, 0.7) * t, s: t * az(0.45, 0.85), umbral: i / 20 });
  }
  scene.add(nubes);
  // lluvia: líneas que caen alrededor de la cámara
  const n = tactil ? 1000 : 1800, p = new Float32Array(n * 6);
  for (let i = 0; i < n; i++) { const x = rnd(-35, 35), y = rnd(0, 30), z = rnd(-35, 35); p.set([x, y, z, x + 0.05, y + 0.9, z], i * 6); }
  const gl = new THREE.BufferGeometry(); gl.setAttribute('position', new THREE.BufferAttribute(p, 3));
  lluvia = new THREE.LineSegments(gl, new THREE.LineBasicMaterial({ color: C('#d5dde6'), transparent: true, opacity: 0, fog: false }));
  lluvia.frustumCulled = false; lluvia.visible = false; scene.add(lluvia);
  // arcoíris: siete arcos detrás del arca
  arco = new THREE.Group();
  ['#e8443a', '#f39233', '#f6d33c', '#5cbf4f', '#3b8fe0', '#5a52c8', '#9a52c8'].forEach((h, i) => {
    const m = new THREE.Mesh(new THREE.TorusGeometry(190 - i * 5, 2.6, 4, 72, Math.PI), new THREE.MeshBasicMaterial({ color: C(h), transparent: true, opacity: 0, fog: false, depthWrite: false }));
    arco.add(m);
  });
  arco.position.set(30, -25, -300); arco.visible = false; scene.add(arco);
}

/* ---------- la finca: los modelos del manifiesto que sirven de decorado ----------
   árbol (mezclado con los de código), maíz en surcos, mangos y bananos de provisión junto a Noé, mariposas, abejas
   y colibríes revoloteando, peces en la charca. Se cargan después del menú (no demoran el inicio). Cada GLB trae
   ~10 000 triángulos: pocas copias, y la mitad en tableta. Sin el modelo, simplemente no sale. */
const adornos = [];
function instanciar(gltf, lugares, sombra, nombre) {
  if (!lugares.length) return;
  const raiz = gltf.scene; raiz.updateMatrixWorld(true);
  const caja = cajaReal(raiz), tam = caja.getSize(new V3());
  const base = new THREE.Matrix4().makeTranslation(-(caja.min.x + tam.x / 2), -caja.min.y, -(caja.min.z + tam.z / 2));
  const mallas = []; raiz.traverse(o => { if (o.isMesh && !o.isSkinnedMesh) mallas.push(o); });
  const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler(), P = new V3(), S = new V3();
  mallas.forEach(m => {
    const im = new THREE.InstancedMesh(m.geometry, m.material, lugares.length); im.name = nombre || 'glb';
    lugares.forEach((l, i) => { const k = l.alto / tam.y; m4.compose(P.set(l.x, l.y, l.z), q.setFromEuler(e.set(0, l.rot || 0, l.inc || 0)), S.set(k, k, k)).multiply(base).multiply(m.matrixWorld); im.setMatrixAt(i, m4); });
    im.castShadow = !!sombra; im.receiveShadow = true; im.frustumCulled = false; scene.add(im);
  });
}
function figura(gltf, alto) {
  const copia = gltf.scene.clone(true), g = new THREE.Group(), c = new THREE.Group(); c.add(copia); g.add(c);
  const caja = cajaReal(c), tam = caja.getSize(new V3()), k = alto / Math.max(1e-6, tam.y);
  c.scale.setScalar(k); c.position.set(-(caja.min.x + tam.x / 2) * k, -caja.min.y * k, -(caja.min.z + tam.z / 2) * k);
  copia.traverse(o => { if (o.isMesh) o.castShadow = true; });
  scene.add(g); return g;
}
async function decorarFinca() {
  const traer2 = f => cargarGlb(MODELOS + f.archivo).catch(() => null);
  const traer = id => (manifiesto[id] && manifiesto[id].archivo ? cargarGlb(MODELOS + manifiesto[id].archivo).catch(e => { console.warn('Two by Two: no cargó ' + id + ' (' + (e && e.message || e) + ')'); return null; }) : Promise.resolve(null));
  const ids = ['arbol', 'maiz', 'mango', 'banano', 'mariposa', 'abeja', 'colibri', 'pez', 'heno', 'sacos', 'canasta'];
  const G = {}; (await Promise.all(ids.map(traer))).forEach((g, i) => { G[ids[i]] = g; });
  semilla = 4242;
  if (G.arbol) {
    const l = [];
    for (let k = 0; k < 600 && l.length < (tactil ? 6 : 12); k++) {
      const a = az(0, 6.28), r = az(40, 125), x = Math.cos(a) * r, z = 50 + Math.sin(a) * r * 0.9;
      if (!libre(x, z, 7, 16) || l.some(o => Math.hypot(o.x - x, o.z - z) < 9)) continue;
      l.push({ x, z, y: terreno(x, z) - 0.1, alto: az(5.5, 8.5), rot: az(0, 6.28) });
    }
    instanciar(G.arbol, l, !tactil, 'arbol');
  }
  if (G.maiz) { // un maizal en surcos, a la izquierda del camino
    const l = [], filas = 2, cols = tactil ? 3 : 5;
    for (let f = 0; f < filas; f++) for (let k = 0; k < cols; k++) {
      const x = -44 + k * 1.3 + az(-0.2, 0.2), z = 104 + f * 1.6 + az(-0.2, 0.2);
      if (libre(x, z, 3, 8)) l.push({ x, z, y: terreno(x, z) - 0.05, alto: az(1.7, 2.2), rot: az(0, 6.28), inc: az(-0.06, 0.06) });
    }
    instanciar(G.maiz, l, false, 'maiz');
  }
  if (noe && (G.mango || G.banano)) { // provisiones para el viaje (Génesis 6:21), en un cajón junto a Noé
    const cx = noe.x + 1.6, cz = noe.z - 1.4, y = terreno(cx, cz);
    const cajon = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.5, 0.8), new THREE.MeshStandardMaterial({ map: texMadera('#9b6b3d', '#8a5d33'), roughness: 0.9 }));
    cajon.position.set(cx, y + 0.25, cz); cajon.castShadow = cajon.receiveShadow = true; scene.add(cajon);
    if (G.banano) instanciar(G.banano, [{ x: cx - 0.25, z: cz, y: y + 0.5, alto: 0.3, rot: 0.4 }], true);
    if (G.mango) instanciar(G.mango, [[0.15, -0.2], [0.45, 0.1]].map(([dx, dz], i) => ({ x: cx + dx, z: cz + dz, y: y + 0.5, alto: 0.13, rot: i * 1.7 })), true);
  }
  // la carga del arca, arriba de la rampa a los lados de la puerta (el paso del centro queda libre para las parejas)
  const r = ARCA.rampa, ladoX = Math.max(1.8, r.ancho / 2 - 0.9), zA = r.zTope + 0.7, yA = x => suelo(x, zA) - 0.05;
  if (G.heno) instanciar(G.heno, [{ x: r.cx - ladoX, z: zA, y: yA(r.cx - ladoX), alto: 0.9, rot: 0.2 }, { x: r.cx - ladoX, z: zA + 1.3, y: yA(r.cx - ladoX) - 0.45, alto: 0.9, rot: -0.15 }], true);
  if (G.sacos) instanciar(G.sacos, [{ x: r.cx + ladoX, z: zA, y: yA(r.cx + ladoX), alto: 0.8, rot: 2.6 }], true);
  if (G.canasta) instanciar(G.canasta, [{ x: r.cx + ladoX, z: zA + 1.4, y: yA(r.cx + ladoX) - 0.5, alto: 0.5, rot: 0.8 }], true);
  // los que vuelan: se mueven por código (giran sobre flores y aletean con la escala)
  const volar = (g, n, alto, cerca, rapidez) => {
    if (!g) return;
    for (let i = 0; i < n; i++) {
      const o = figura(g, alto), c = cerca(i), r = az(1.5, 4), w = az(0.4, 0.9) * rapidez, f = az(0, 6.28), h = az(0.7, 1.6);
      adornos.push((t, dt) => {
        const a = t * w + f, x = c[0] + Math.cos(a) * r, z = c[1] + Math.sin(a * 1.3) * r * 0.7;
        o.position.set(x, terreno(x, z) + h + Math.sin(t * 2.3 + f) * 0.25, z);
        o.rotation.y = Math.atan2(-Math.sin(a) * r, Math.cos(a * 1.3) * r * 0.91);
        o.children[0].scale.x = o.children[0].scale.y * (1 + 0.3 * Math.sin(t * 28 + f));
      });
    }
  };
  const junto = (d0, d1) => () => { const k = camino[Math.floor(az(camino.length * 0.3, camino.length * 0.9))], a = az(0, 6.28), r = az(d0, d1); return [k[0] + Math.cos(a) * r, k[1] + Math.sin(a) * r]; };
  // cada uno trae ~10 000 triángulos: pocos
  volar(G.mariposa, tactil ? 2 : 3, 0.22, junto(3, 12), 1);
  volar(G.abeja, tactil ? 0 : 1, 0.12, junto(2, 10), 1.6);
  volar(G.colibri, tactil ? 0 : 1, 0.16, () => [-40, 100], 2.2);
  const md = modelosDe('delfin');
  if (md) {
    const g = await traer2(md[0].ficha);
    if (g) for (let i = 0; i < 2; i++) {
      const o = figura(g, 0.7), f = i * 2.4, cx = -190 + i * 18, cz = 40 + i * 50, r = 22;
      adornos.push(t => {
        const a = t * 0.25 + f, salto = Math.max(0, Math.sin(t * 0.9 + f)), x = cx + Math.cos(a) * r, z = cz + Math.sin(a) * r;
        o.position.set(x, clima.agua - 0.8 + salto * 2.2, z); o.rotation.set(0, -a, 0); o.children[0].rotation.x = -Math.cos(t * 0.9 + f) * 0.6 * (salto > 0 ? 1 : 0);
      });
    }
  }
  if (G.pez) for (let i = 0; i < 2; i++) {
    const o = figura(G.pez, 0.32), f = i * Math.PI, r = CHARCA.r * 0.5;
    adornos.push(t => { const a = t * 0.4 + f; o.position.set(CHARCA.x + Math.cos(a) * r, 0.15 - 0.35 + Math.sin(t * 1.3 + f) * 0.05, CHARCA.z + Math.sin(a) * r); o.rotation.y = -a; });
  }
}

/* ---------- el faro de la pareja buscada ----------
   Una flecha GIGANTE dorada que baja del cielo y palpita sobre cada animal buscado, un haz de luz vertical que se ve
   desde lejos (sin niebla) y chispas doradas que caen por el haz. Se apaga cuando ese animal ya te sigue. */
const faros = [];
function crearFaros() {
  const c = document.createElement('canvas'); c.width = c.height = 64;
  const x = c.getContext('2d'), gr = x.createRadialGradient(32, 32, 0, 32, 32, 32);
  gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.25, 'rgba(255,230,120,.9)'); gr.addColorStop(1, 'rgba(255,190,40,0)');
  x.fillStyle = gr; x.fillRect(0, 0, 64, 64);
  const tex = new THREE.CanvasTexture(c);
  const matHaz = () => new THREE.ShaderMaterial({
    uniforms: { uT: tiempoU, uA: { value: 1 }, uC: { value: C('#ffd447') } },
    vertexShader: 'varying vec2 vUv; varying float vBorde;\nvoid main(){ vUv = uv; vec4 mv = modelViewMatrix * vec4(position, 1.0); vec3 n = normalize(normalMatrix * normal); vBorde = abs(dot(n, normalize(-mv.xyz))); gl_Position = projectionMatrix * mv; }',
    // color propio (no aditivo): contra el cielo claro un haz aditivo casi no se ve
    fragmentShader: 'uniform float uT; uniform float uA; uniform vec3 uC; varying vec2 vUv; varying float vBorde;\nvoid main(){ float a = pow(1.0 - vUv.y, 0.8) * pow(vBorde, 1.2) * (0.75 + 0.25 * sin(uT * 5.0)) * uA * 0.7; gl_FragColor = vec4(mix(uC, vec3(1.0), pow(vBorde, 6.0) * 0.6), a); }',
    transparent: true, depthWrite: false, side: THREE.DoubleSide
  });
  for (let i = 0; i < 2; i++) {
    const g = new THREE.Group();
    const haz = new THREE.Mesh(new THREE.CylinderGeometry(2, 1.1, 160, 20, 1, true).translate(0, 80, 0), matHaz());
    const N = 70, pos = new Float32Array(N * 3), vel = new Float32Array(N);
    for (let k = 0; k < N; k++) { const a = rnd(0, 6.28), r = rnd(0, 1.6); pos.set([Math.cos(a) * r, rnd(0.5, 40), Math.sin(a) * r], k * 3); vel[k] = rnd(3, 8); }
    const gp = new THREE.BufferGeometry(); gp.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    const chispas = new THREE.Points(gp, new THREE.PointsMaterial({ map: tex, size: 0.55, color: C('#ffd447'), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, fog: false }));
    chispas.frustumCulled = haz.frustumCulled = false;
    g.add(haz, chispas); g.visible = false; scene.add(g);
    const fl = flecha(4.2, '#ffc23a'); fl.visible = false; scene.add(fl);
    faros.push({ g, haz, chispas, vel, flecha: fl, obj: null, t0: 0 });
  }
}
function actualizarFaros(t, dt) {
  const buscados = J.fase === 'juego' ? parejaActual().filter(a => a.estado === 'pasea' || a.estado === 'mira') : [];
  faros.forEach((f, i) => {
    const a = buscados[i] || null;
    if (a !== f.obj) { f.obj = a; f.t0 = t; }
    f.g.visible = f.flecha.visible = !!a;
    if (!a) return;
    const baja = 1 - suave(0, 1, (t - f.t0) / 1.5), pul = 1 + 0.16 * Math.sin(t * 6);
    f.g.position.set(a.x, a.y, a.z);
    f.flecha.position.set(a.x, a.y + a.actor.alto + 3.4 + Math.abs(Math.sin(t * 3)) * 0.9 + baja * 75, a.z);
    f.flecha.scale.setScalar(pul); f.flecha.rotation.y = t * 1.4;
    // de cerca el haz se aclara para dejar ver al animal; desde lejos, a toda luz
    const dj = Math.hypot(a.x - jug.x, a.z - jug.z);
    f.haz.material.uniforms.uA.value = (1 - baja * 0.8) * (0.2 + 0.8 * suave(4, 18, dj));
    f.chispas.material.opacity = 0.35 + 0.65 * suave(3, 12, dj);
    const p = f.chispas.geometry.attributes.position.array;
    for (let k = 0; k < f.vel.length; k++) {
      p[k * 3 + 1] -= f.vel[k] * dt;
      if (p[k * 3 + 1] < 0.3) { const an = rnd(0, 6.28), r = rnd(0, 1.6); p[k * 3] = Math.cos(an) * r; p[k * 3 + 1] = rnd(25, 45); p[k * 3 + 2] = Math.sin(an) * r; }
    }
    f.chispas.geometry.attributes.position.needsUpdate = true;
  });
}

/* ---------- clima: 0 sol, 1 nublado; lluvia y arcoíris aparte ---------- */
let destello = 0;
const clima = { nub: 0, lluvia: 0, arco: 0, meta: { nub: 0, lluvia: 0, arco: 0 }, agua: -1 };
const _d = new THREE.Object3D();
function actualizarClima(dt, t) {
  ['nub', 'lluvia', 'arco'].forEach(k => { clima[k] += (clima.meta[k] - clima[k]) * Math.min(1, dt * (k === 'nub' ? 0.6 : 0.9)); });
  const n = clima.nub;
  pintarCielo(n);
  scene.fog.near = lerp(140, 60, n); scene.fog.far = lerp(560, 300, n);
  destello = Math.max(0, destello - dt * 2.5);
  hemi.intensity = lerp(0.62, 0.42, n) + destello * 1.4; sol.intensity = lerp(1.05, 0.22, n);
  solSprite.material.opacity = clamp(1 - n * 1.3, 0, 1);
  solSprite.position.copy(cam.position).addScaledVector(SOL_DIR, 700);
  if (nubes) {
    const visibles = 0.25 + 0.75 * n, giro = t * 0.004;
    nubes.material.color.copy(mezclar('#ffffff', '#6b737c', n)); nubes.material.emissive.copy(mezclar('#9aa4ad', '#3b4048', n));
    nubesDatos.forEach((b, i) => {
      const s = b.s * suave(b.umbral, b.umbral + 0.1, visibles), c = Math.cos(giro), sn = Math.sin(giro);
      _d.position.set(b.x * c - b.z * sn, b.y - n * 25, b.x * sn + b.z * c); _d.scale.set(s * 1.4, s * 0.8, s); _d.updateMatrix(); nubes.setMatrixAt(i, _d.matrix);
    });
    nubes.instanceMatrix.needsUpdate = true;
  }
  if (lluvia) {
    lluvia.visible = clima.lluvia > 0.02;
    lluvia.material.opacity = 0.55 * clima.lluvia;
    if (lluvia.visible) {
      const p = lluvia.geometry.attributes.position.array, caida = dt * 38;
      for (let i = 0; i < p.length; i += 6) { p[i + 1] -= caida; p[i + 4] -= caida; if (p[i + 1] < -2) { p[i + 1] += 32; p[i + 4] += 32; } }
      lluvia.geometry.attributes.position.needsUpdate = true;
      lluvia.position.set(cam.position.x, cam.position.y - 12, cam.position.z);
    }
  }
  if (arco) { arco.visible = clima.arco > 0.01; arco.children.forEach(m => { m.material.opacity = 0.42 * clima.arco; }); }
  if (agua) { agua.position.y = clima.agua + Math.sin(t * 0.6) * 0.05; }
  SN.lluvia(clima.lluvia);
}

/* ---------- voz ---------- */
const Voz = (() => {
  // Lo de Noé se busca primero en voz/en-noe (un hombre mayor), después en voz/en; lo demás, sólo en voz/en.
  let lista = null, listaNoe = null, audio = null;
  const leer = dir => fetch(BIBLIO + dir + '/index.json', { credentials: 'omit' }).then(r => (r.ok ? r.json() : [])).then(n => new Set(Array.isArray(n) ? n : [])).catch(() => new Set());
  leer('voz/en').then(l => { lista = l; }); leer('voz/en-noe').then(l => { listaNoe = l; });
  const ss = window.speechSynthesis;
  let voz = null;
  const elegir = () => { const v = ss ? ss.getVoices() : []; voz = v.find(x => x.lang === 'en-US' && /female|samantha|jenny|aria|google us/i.test(x.name)) || v.find(x => x.lang === 'en-US') || v.find(x => /^en/i.test(x.lang)) || null; };
  // la voz del navegador para Noé: la masculina más grave que haya (Grandpa en Mac, si está)
  let vozNoe = null;
  const elegirNoe = () => { const v = (ss ? ss.getVoices() : []).filter(x => /^en/i.test(x.lang)); vozNoe = v.find(x => /grandpa/i.test(x.name)) || v.find(x => /\b(fred|ralph|rocko|reed|daniel|arthur|aaron|gordon|alex|male|david|mark|george|guy|james|tom)\b/i.test(x.name)) || null; };
  if (ss) { elegir(); elegirNoe(); ss.onvoiceschanged = () => { elegir(); elegirNoe(); }; }
  let n = 0;
  function callar() { n++; if (audio) { audio.onended = audio.onerror = null; audio.pause(); audio = null; } if (ss) ss.cancel(); }
  function sintetizar(texto, fin, deNoe) {
    if (!ss || typeof SpeechSynthesisUtterance === 'undefined') { setTimeout(fin, 600); return; }
    const u = new SpeechSynthesisUtterance(texto); u.lang = 'en-US';
    if (deNoe) { if (vozNoe || voz) u.voice = vozNoe || voz; u.rate = 0.85; u.pitch = vozNoe ? 0.7 : 0.4; } else { if (voz) u.voice = voz; u.rate = 0.9; u.pitch = 1.05; }
    let listo = false; const f = () => { if (!listo) { listo = true; fin(); } };
    u.onend = f; u.onerror = f; setTimeout(f, 1200 + texto.length * 120);
    ss.speak(u);
  }
  function una(texto, fin, deNoe) {
    const s = PQ.slug(texto);
    const dir = deNoe && listaNoe && listaNoe.has(s) ? 'voz/en-noe/' : lista && lista.has(s) ? 'voz/en/' : null;
    if (dir) {
      const a = new Audio(BIBLIO + dir + s + '.mp3'); audio = a;
      let listo = false; const f = () => { if (!listo) { listo = true; if (audio === a) audio = null; fin(); } };
      a.onended = f; a.onerror = () => { if (!listo) { listo = true; sintetizar(texto, fin, deNoe); } };
      a.play().catch(() => { if (!listo) { listo = true; sintetizar(texto, fin, deNoe); } });
    } else sintetizar(texto, fin, deNoe);
  }
  function decir(textos, alAcabar, deNoe) {
    callar();
    textos = [].concat(textos).filter(Boolean);
    if (SN.esMudo() || !textos.length) { if (alAcabar) setTimeout(alAcabar, 400); return; }
    const mio = n;
    const sig = i => { if (mio !== n) return; if (i >= textos.length) { if (alAcabar) alAcabar(); return; } una(textos[i], () => setTimeout(() => sig(i + 1), 150), deNoe); };
    sig(0);
  }
  return { decir, callar, noe: (t, f) => decir(t, f, true) };
})();

/* ---------- jugador y cámara ---------- */
const jug = { x: 0, z: 0, y: 0, rumbo: Math.PI, vel: 0, actor: null, grupo: new THREE.Group(), estela: [], tipo: '' };
jug.grupo.visible = false; scene.add(jug.grupo);
const camS = { yaw: Math.PI, pitch: 0.3, dist: 5, fpPitch: 0.05, pos: new V3(), mira: new V3(), cine: null };
let cargaJug = null;
function cargarJugador(tipo) {
  if (jug.tipo === tipo && jug.actor) return Promise.resolve();
  const f = manifiesto[tipo];
  const p = f ? cargarGlb(MODELOS + f.archivo).then(g => clipsDe(g, f).then(cl => actorDeGlb(g, f, cl, Number(f.altura) || 1.2))).catch(() => ninoDeCajas(tipo)) : Promise.resolve(ninoDeCajas(tipo));
  cargaJug = p.then(a => {
    if (jug.actor) jug.grupo.remove(jug.actor.modelo);
    jug.actor = a; jug.tipo = tipo; jug.grupo.add(a.modelo); animar(a, 'idle', 1);
  });
  return cargaJug;
}
const teclas = new Set();
const palanca = { x: 0, y: 0, id: null };
function moverJugador(dt) {
  let fx = 0, fz = 0;
  if (teclas.has('KeyW') || teclas.has('ArrowUp')) fz += 1;
  if (teclas.has('KeyS') || teclas.has('ArrowDown')) fz -= 1;
  if (teclas.has('KeyA')) fx -= 1;
  if (teclas.has('KeyD')) fx += 1;
  if (teclas.has('ArrowLeft')) camS.yaw += 2 * dt;
  if (teclas.has('ArrowRight')) camS.yaw -= 2 * dt;
  fx += palanca.x; fz -= palanca.y;
  const mag = Math.min(1, Math.hypot(fx, fz));
  // caminar 14 m/s, correr 22 (Shift, o la palanca al tope): el mundo es grande
  const palTope = Math.hypot(palanca.x, palanca.y) > 0.92;
  const corre = teclas.has('ShiftLeft') || teclas.has('ShiftRight') || palTope;
  const objetivo = mag > 0.08 ? (corre ? 22 : 14 * Math.min(1, mag / 0.92)) : 0;
  jug.vel += (objetivo - jug.vel) * Math.min(1, dt * 7);
  if (mag > 0.08) {
    const y = camS.yaw, f = [Math.sin(y), Math.cos(y)], r = [-Math.cos(y), Math.sin(y)];
    const dx = (f[0] * fz + r[0] * fx) / (Math.hypot(fx, fz) || 1), dz = (f[1] * fz + r[1] * fx) / (Math.hypot(fx, fz) || 1);
    const deseado = Math.atan2(dx, dz);
    if (J.vista === 1) jug.rumbo = camS.yaw; else jug.rumbo += angDif(jug.rumbo, deseado) * Math.min(1, dt * 10);
    let nx = jug.x + dx * jug.vel * dt, nz = jug.z + dz * jug.vel * dt;
    [nx, nz] = chocar(nx, nz);
    jug.x = nx; jug.z = nz;
  }
  jug.y += (suelo(jug.x, jug.z) - jug.y) * Math.min(1, dt * 14);
  jug.grupo.position.set(jug.x, jug.y, jug.z); jug.grupo.rotation.y = jug.rumbo;
  const ul = jug.estela[0];
  if (!ul || Math.hypot(ul[0] - jug.x, ul[1] - jug.z) > 0.3) { jug.estela.unshift([jug.x, jug.z]); if (jug.estela.length > 90) jug.estela.pop(); }
  if (jug.actor) {
    if (!(jug.vel > 0.3 ? pasoJugador(jug.actor, jug.vel) : animar(jug.actor, 'idle', 1))) jug.actor.modelo.position.y = jug.vel > 0.3 ? Math.abs(Math.sin(performance.now() / 110)) * 0.06 : 0;
  }
}
// El casco del arca (una superelipse) y el borde del mundo: no se atraviesan.
function chocar(x, z) {
  if (ARCA) {
    const a = ARCA.hx + 0.5, b = ARCA.hz + 0.5, k = Math.pow(Math.pow(Math.abs(x) / a, 4) + Math.pow(Math.abs(z) / b, 4), 0.25);
    if (k < 1) { x /= k; z /= k; }
  }
  const dx = x, dz = z - 45, r = Math.hypot(dx, dz);
  if (r > 165) { x = dx / r * 165; z = 45 + dz / r * 165; }
  if (x < -92) x = -92;
  return [x, z];
}
function actualizarCamara(dt) {
  if (camS.cine) {
    const c = camS.cine; c.t = Math.min(1, c.t + dt / c.dur); const e = suave(0, 1, c.t);
    cam.position.lerpVectors(c.desde, c.pos, e); camS.mira.lerpVectors(c.mirarDesde, c.mira, e); cam.lookAt(camS.mira);
    return;
  }
  const alto = jug.actor ? jug.actor.alto : 1.2;
  jug.grupo.visible = J.vista === 3;
  if (J.vista === 1) {
    const ojo = new V3(jug.x, jug.y + alto * 0.93, jug.z);
    cam.position.copy(ojo);
    const p = camS.fpPitch, y = camS.yaw;
    camS.mira.set(ojo.x + Math.sin(y) * Math.cos(p), ojo.y + Math.sin(p), ojo.z + Math.cos(y) * Math.cos(p));
    cam.lookAt(camS.mira);
    return;
  }
  const blanco = new V3(jug.x, jug.y + alto * 0.85, jug.z), d = camS.dist + jug.vel * 0.1, p = camS.pitch, y = camS.yaw;
  const quiere = new V3(blanco.x - Math.sin(y) * Math.cos(p) * d, blanco.y + Math.sin(p) * d, blanco.z - Math.cos(y) * Math.cos(p) * d);
  const piso = suelo(quiere.x, quiere.z) + 0.4; if (quiere.y < piso) quiere.y = piso;
  const k = 1 - Math.exp(-dt * 14);
  cam.position.lerp(quiere, k); camS.mira.lerp(blanco, k * 1.4 > 1 ? 1 : k * 1.4);
  cam.lookAt(camS.mira);
}
function cine(pos, mira, dur) { camS.cine = { desde: cam.position.clone(), mirarDesde: camS.mira.clone(), pos, mira, dur, t: 0 }; }
function cambiarVista() {
  if (J.fase !== 'juego' && J.fase !== 'pregunta') return;
  J.vista = J.vista === 3 ? 1 : 3;
  if (J.vista === 1) { camS.yaw = jug.rumbo; camS.fpPitch = 0.05; }
  SN.tocar('clic');
}

/* ---------- animales ---------- */
const animales = [];
// La ficha del manifiesto de uno de esos nombres (por clave, o por su `nombre` sin tildes: «oso-de-anteojos»).
const sinTilde = t => String(t).normalize('NFD').replace(/[̀-ͯ]/g, '');
function fichaDe(ids) {
  for (const c of ids) if (manifiesto[c] && manifiesto[c].archivo) return manifiesto[c];
  for (const c of ids) for (const k in manifiesto) {
    const n = manifiesto[k].nombre, n0 = Array.isArray(n) ? n[0] : n;
    if (n0 && manifiesto[k].archivo && PQ.slug(sinTilde(n0)) === c) return manifiesto[k];
  }
  return null;
}
// Los dos de la pareja: [{ficha, nom}, {ficha, nom}]. Con macho y hembra distintos, cada uno con su nombre (mixta);
// con uno solo, sale dos veces con el nombre de la especie. null si no hay modelo.
function modelosDe(id) {
  const e = D.especies[id], base = { en: e.en, es: (e.art || 'El').toLowerCase() + ' ' + e.es };
  const ms = (e.modelos || [{ ids: [id] }]).map(m => ({ ficha: fichaDe(m.ids), nom: { en: m.en || e.en, es: m.es || base.es } })).filter(m => m.ficha);
  if (!ms.length) return null;
  if (ms.length === 1 || ms[0].ficha === ms[1].ficha) return [{ ficha: ms[0].ficha, nom: base }, { ficha: ms[0].ficha, nom: base }];
  return ms.slice(0, 2);
}
const deTierra = () => Object.keys(D.especies).filter(id => !D.especies[id].agua);
// Las especies del mundo: todas las que tengan modelo (en tableta, hasta 14), barajadas; si no llegan a `parejas`,
// se completan con las de cajitas. Las primeras se cargan antes del menú; el resto, después (J.pendientes).
function especiesDelMundo() {
  const con = barajar(deTierra().filter(id => modelosDe(id))).slice(0, tactil ? 14 : 60);
  const cajitas = deTierra().filter(id => D.especies[id].respaldo && !con.includes(id));
  const todas = con.length >= D.parejas ? con : con.concat(barajar(cajitas).slice(0, D.parejas - con.length));
  const n = Math.max(D.parejas + 2, 8);
  J.pendientes = todas.slice(n);
  return todas.slice(0, n);
}
function lugarPara(zona, otros) {
  for (let k = 0; k < 400; k++) {
    let x, z;
    if (zona === 'charca') { const a = rnd(0, 6.28), r = rnd(CHARCA.r + 2.5, CHARCA.r + 9); x = CHARCA.x + Math.cos(a) * r; z = CHARCA.z + Math.sin(a) * r; }
    else if (zona === 'camino') { const c = camino[Math.floor(rnd(5, camino.length - 25))], a = rnd(0, 6.28), r = rnd(5, 14); x = c[0] + Math.cos(a) * r; z = c[1] + Math.sin(a) * r; }
    else if (zona === 'lejos' || zona === 'arboles') { const a = rnd(-0.4, Math.PI + 0.4), r = rnd(70, 120); x = Math.cos(a) * r; z = 45 + Math.sin(a) * r * 0.9; }
    else { const a = rnd(0, 6.28), r = rnd(25, 95); x = Math.cos(a) * r; z = 55 + Math.sin(a) * r * 0.8; }
    if (!libre(x, z, 3.5, 12) || Math.hypot(x, z - 45) > 150) continue;
    if (otros.some(o => Math.hypot(o[0] - x, o[1] - z) < (k < 200 ? 9 : 4))) continue;
    return [x, z];
  }
  return [rnd(-40, 40), rnd(60, 110)];
}
// Pareja i del encargo: alrededor del camino entre donde empieza el niño y la rampa (a la vista), más lejos cuanto más tarde.
function lugarCerca(i, zona, otros) {
  if (zona === 'charca' && i >= 3) return lugarPara('charca', otros);
  const n = camino.length, d0 = 4 + i * 7, d1 = 11 + i * 10;
  for (let k = 0; k < 400; k++) {
    const c = camino[Math.floor(rnd(n * 0.36, n * 0.9))], a = rnd(0, 6.28), r = rnd(d0, d1), x = c[0] + Math.cos(a) * r, z = c[1] + Math.sin(a) * r;
    if (!libre(x, z, 3, 10) || Math.hypot(x, z - 45) > 150 || distCamino(x, z) < d0 * 0.6) continue;
    if (otros.some(o => Math.hypot(o[0] - x, o[1] - z) < (k < 200 ? 8 : 4))) continue;
    return [x, z];
  }
  return lugarPara('pradera', otros);
}
function repartir() {
  const usados = [];
  animales.forEach(a => { if (!J.orden.includes(a.especie)) { a.casa = a.casaLejos; a.x = a.casa[0]; a.z = a.casa[1]; a.y = suelo(a.x, a.z); a.meta = null; } });
  J.orden.forEach((id, i) => animales.filter(a => a.especie === id).forEach(a => {
    a.casa = lugarCerca(i, a.e.zona, usados); usados.push(a.casa);
    a.x = a.casa[0]; a.z = a.casa[1]; a.y = suelo(a.x, a.z); a.meta = null; a.espera = rnd(0, 3); a.rumbo = rnd(0, 6.28);
  }));
}
const usadosMundo = [];
// Una pareja de esa especie en el mundo (clonada de los GLB que ya están en caché: no se recarga nada).
async function crearPareja(id) {
  const e = D.especies[id], ms = modelosDe(id);
  let partes = null;
  if (ms) {
    try { partes = await Promise.all(ms.map(async m => { const g = await cargarGlb(MODELOS + m.ficha.archivo); return { g, f: m.ficha, cl: await clipsDe(g, m.ficha), nom: m.nom }; })); }
    catch (err) { partes = null; console.warn('Two by Two: no cargó la pareja de ' + id + ' (' + (err && err.message || err) + ')' + (e.respaldo ? '; sale de cajitas.' : '; no sale.')); }
  }
  if (!partes && !e.respaldo) return false;
  J.mixto[id] = !!(partes && partes[0].f !== partes[1].f && e.parejaEs);
  for (let k = 0; k < 2; k++) {
    const pt = partes && partes[k];
    const actor = pt ? actorDeGlb(pt.g, pt.f, pt.cl, Number(pt.f.altura) || (e.respaldo ? e.respaldo.alto : 1)) : animalDeCajas(e);
    const casa = lugarPara(e.zona, usadosMundo); usadosMundo.push(casa);
    const grupo = new THREE.Group(), cuerpo = new THREE.Group(); cuerpo.add(actor.modelo); grupo.add(cuerpo); scene.add(grupo);
    const nom = pt ? pt.nom : { en: e.en, es: (e.art || 'El').toLowerCase() + ' ' + e.es };
    const a = { id: id + (k + 1), especie: id, e, nom, actor, grupo, cuerpo, casa, casaLejos: casa, x: casa[0], z: casa[1], y: suelo(casa[0], casa[1]), rumbo: rnd(0, 6.28), estado: 'pasea', meta: null, espera: rnd(0, 3), fase: rnd(0, 6), vel: 0, orden: 0, ruta: null, opac: 1, brillo: 0, modelo: !!pt, sombra: true };
    a.radio = Math.max(0.5, actor.largo * 0.5);
    animar(actor, 'idle', 1);
    animales.push(a);
  }
  return true;
}
async function crearAnimales(ids, avance) {
  let hechos = 0;
  await Promise.all(ids.map(id => crearPareja(id).then(() => { hechos++; if (avance) avance(hechos / ids.length); })));
}
// El resto de parejas, de a una (sin trancar el cuadro) mientras se juega; salen lejos, alrededor.
async function poblarResto() {
  while (J.pendientes.length) { const id = J.pendientes.shift(); await crearPareja(id).catch(() => false); }
  console.info('Two by Two: ' + animales.length / 2 + ' parejas en la pradera.');
}
function ponerOpacidad(a, o) {
  if (Math.abs(a.opac - o) < 0.005) return;
  a.opac = o;
  a.actor.mats.forEach(m => { m.transparent = o < 0.999; m.opacity = o; m.depthWrite = o > 0.5; });
}
function ponerBrillo(a, b) {
  if (Math.abs(a.brillo - b) < 0.01) return;
  a.brillo = b;
  a.actor.mats.forEach(m => { if (m.emissive) { m.emissive.setRGB(1, 0.82, 0.3); m.emissiveIntensity = b; } });
}
function actualizarAnimal(a, dt, t) {
  if (a.estado === 'dentro') return;
  let quiere = 0, vmax = clamp(0.6 + a.actor.alto * 0.7, 0.8, 2), mirar = null;
  const dj = Math.hypot(jug.x - a.x, jug.z - a.z);
  if (a.estado === 'pasea' || a.estado === 'mira') {
    if (J.fase === 'juego' && dj < 7) a.estado = 'mira'; else if (a.estado === 'mira' && dj > 9) a.estado = 'pasea';
    if (a.estado === 'mira') mirar = [jug.x, jug.z];
    else if (a.espera > 0) a.espera -= dt;
    else {
      if (!a.meta) { const an = rnd(0, 6.28), r = rnd(1, 7); a.meta = [a.casa[0] + Math.cos(an) * r, a.casa[1] + Math.sin(an) * r]; if (!libre(a.meta[0], a.meta[1], 2, 8)) a.meta = a.casa.slice(); }
      const d = Math.hypot(a.meta[0] - a.x, a.meta[1] - a.z);
      if (d < 0.3) { a.meta = null; a.espera = rnd(2, 6); } else { quiere = vmax * 0.55; mirar = a.meta; }
    }
  } else if (a.estado === 'pregunta') mirar = [jug.x, jug.z];
  else if (a.estado === 'sigue') {
    let acum = 0, obj = jug.estela[jug.estela.length - 1] || [jug.x, jug.z];
    const lejos = 1.3 + a.orden * 1.7 + a.radio;
    for (let i = 1; i < jug.estela.length; i++) { acum += Math.hypot(jug.estela[i][0] - jug.estela[i - 1][0], jug.estela[i][1] - jug.estela[i - 1][1]); if (acum >= lejos) { obj = jug.estela[i]; break; } }
    const d = Math.hypot(obj[0] - a.x, obj[1] - a.z);
    if (dj > lejos + 0.3 && d > 0.25) { quiere = Math.min(26, d * 3.4); mirar = obj; } else mirar = [jug.x, jug.z];
    if (d > 35) { a.x = obj[0]; a.z = obj[1]; } // se quedó muy atrás: lo alcanzamos
  } else if (a.estado === 'va') {
    const w = a.ruta[0];
    if (w) {
      const d = Math.hypot(w[0] - a.x, w[1] - a.z);
      if (d < 0.35) a.ruta.shift(); else { quiere = 2.2; mirar = w; }
    }
    const r = ARCA.rampa;
    ponerOpacidad(a, clamp((a.z - (r.zPuerta - 2.2)) / 2, 0, 1));
    if (!a.ruta.length || a.opac <= 0.01) entrar(a);
  }
  a.vel += (quiere - a.vel) * Math.min(1, dt * (a.estado === 'sigue' ? 8 : 5));
  if (mirar) { const ang = Math.atan2(mirar[0] - a.x, mirar[1] - a.z); a.rumbo += angDif(a.rumbo, ang) * Math.min(1, dt * 5); }
  if (a.vel > 0.02) { a.x += Math.sin(a.rumbo) * a.vel * dt; a.z += Math.cos(a.rumbo) * a.vel * dt; }
  a.y += (suelo(a.x, a.z) - a.y) * Math.min(1, dt * 12);
  a.grupo.position.set(a.x, a.y, a.z); a.grupo.rotation.y = a.rumbo;
  // con clips (la vaca): quieto/caminar; sin clips: respira, da saltitos al andar y se mece
  const anda = a.vel > 0.15;
  if (!(anda ? pasoDe(a.actor, a.vel, 3.5) : animar(a.actor, 'idle', 1))) {
    // sin clip: pasitos con el cuerpo vivo (balanceo, cabeceo, inclinación en la subida); el «andar» se suaviza
    // para que arrancar y parar no sea un golpe
    a.anda = lerp(a.anda || 0, anda ? 1 : 0, Math.min(1, dt * 6));
    const h = Math.max(0.3, a.actor.alto), w = a.anda;
    a.fase += dt * (1.8 + w * (3 + a.vel * 4.5 / h));
    const paso = Math.sin(a.fase), salto = Math.abs(paso);
    const sube = clamp((suelo(a.x + Math.sin(a.rumbo) * 0.6, a.z + Math.cos(a.rumbo) * 0.6) - a.y) / 0.6, -0.6, 0.6);
    a.cuerpo.position.y = w * salto * Math.min(0.14, h * 0.07);
    a.cuerpo.position.x = w * paso * h * 0.025;
    a.cuerpo.rotation.set(w * (-0.07 + Math.cos(a.fase * 2) * 0.06) - sube * 0.5, w * paso * 0.08, w * paso * 0.09);
    a.cuerpo.scale.set(1, 1 + (1 - w) * Math.sin(a.fase) * 0.025 - w * (1 - salto) * 0.04, 1);
  }
}
function entrar(a) {
  a.estado = 'dentro'; a.grupo.visible = false;
  J.dentro++;
  SN.tocar('entra');
  hud();
  const pareja = animales.filter(b => b.especie === a.especie);
  if (pareja.every(b => b.estado === 'dentro')) {
    if (J.dentro >= J.total) { empezarFinal(); return; }
    objetivo('entraron', { ms: 2600 });
    const gen = J.gen;
    setTimeout(() => { if (gen === J.gen && (J.fase === 'juego' || J.fase === 'pregunta')) { J.iEnc++; darEncargo(); } }, 2800);
  }
}

/* ---------- Noé ---------- */
let noe = null;
async function crearNoe() {
  const r = ARCA.rampa, x = r.cx + r.ancho / 2 + 4.5, z = r.zSuelo + 2.5;
  const f = manifiesto[D.noe.modelo];
  if (f && f.archivo) {
    try {
      const g = await cargarGlb(MODELOS + f.archivo), cl = await clipsDe(g, f), a = actorDeGlb(g, f, cl, Number(f.altura) || 1.75);
      const grupo = new THREE.Group(); grupo.add(a.modelo); grupo.position.set(x, suelo(x, z), z); scene.add(grupo); animar(a, 'idle', 1);
      noe = { actor: a, grupo, x, z, rumbo: 0 };
      console.info('Two by Two: Noé de ' + f.archivo + ' (' + Object.keys(a.clips).filter(k => a.clips[k]).join(', ') + ')');
      return;
    } catch (e) { console.warn('Two by Two: no cargó Noé (' + (e && e.message || e) + '); sale el cartel.'); }
  }
  // el cartel: dos postes y una tabla pintada
  const c = document.createElement('canvas'); c.width = 512; c.height = 256;
  const x2 = c.getContext('2d');
  x2.fillStyle = '#f3e2bd'; x2.fillRect(0, 0, 512, 256);
  x2.strokeStyle = '#8a5a2b'; x2.lineWidth = 14; x2.strokeRect(7, 7, 498, 242);
  x2.fillStyle = '#5b3418'; x2.font = '900 92px Grandstander, Lexend, sans-serif'; x2.textAlign = 'center'; x2.fillText(D.noe.cartel, 256, 118);
  x2.font = '700 44px Lexend, sans-serif'; x2.fillStyle = '#8a5a2b'; x2.fillText('Two by Two', 256, 190);
  const tex = new THREE.CanvasTexture(c); tex.encoding = THREE.sRGBEncoding;
  const grupo = new THREE.Group();
  const tabla = new THREE.Mesh(new THREE.BoxGeometry(3.2, 1.6, 0.15), [M('#8a5a2b'), M('#8a5a2b'), M('#8a5a2b'), M('#8a5a2b'), new THREE.MeshStandardMaterial({ map: tex, roughness: 0.9 }), M('#8a5a2b')]);
  tabla.position.y = 2.3; tabla.castShadow = true; grupo.add(tabla);
  [-1.3, 1.3].forEach(px => { const p = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.13, 3, 6), M('#6e4526')); p.position.set(px, 1.5, -0.1); p.castShadow = true; grupo.add(p); });
  grupo.position.set(x, suelo(x, z), z); grupo.rotation.y = 0.35; scene.add(grupo);
  noe = { actor: null, grupo, x, z };
}

/* ---------- el juego: el objetivo de arriba guía cada paso ---------- */
// buscar (0 lo siguen) → otro (1) → llevar (2: al aro de la rampa) → suben → entraron → buscar la siguiente pareja
const encargoActual = () => J.orden[J.iEnc] || null;
const rellenar = (t, o) => String(t).replace(/\{(\w+)\}/g, (_, k) => (o[k] != null ? o[k] : ''));
// Las palabras de los objetivos. Pareja mixta: «Busca el toro y la vaca» / «Ahora busca la vaca» / «Now find the cow!».
function palabras() {
  const id = encargoActual() || J.orden[J.orden.length - 1], e = D.especies[id], f = e.art === 'La', mixto = !!J.mixto[id], esPl = e.esPl || e.es + 's';
  const p = animales.filter(a => a.especie === id), falta = p.find(a => a.estado !== 'sigue' && a.estado !== 'va' && a.estado !== 'dentro') || p[1] || p[0];
  return {
    es: e.es, esPl, en: e.en, plural: e.plural, parejaEn: e.parejaEn, n: J.dentro, total: J.total, mixto,
    parejaEs: mixto ? e.parejaEs : '2 ' + esPl,
    falta: mixto && falta ? falta.nom.es : (f ? 'la otra ' : 'el otro ') + e.es,
    losDos: mixto ? e.parejaEs : (f ? 'las dos ' : 'los dos ') + esPl,
    faltaEn: falta ? falta.nom.en : e.en
  };
}
const parejaActual = () => animales.filter(a => a.especie === encargoActual());
function pasoActual() {
  const p = parejaActual(), siguen = p.filter(a => a.estado === 'sigue').length;
  if (!p.length || p.some(a => a.estado === 'va' || a.estado === 'dentro')) return 'suben';
  return siguen >= 2 ? 'llevar' : siguen === 1 ? 'otro' : 'buscar';
}
// el inglés que va al lado de cada objetivo (y que se oye)
const INGLES = { buscar: 'encargo', otro: 'otro', llevar: 'llevar', suben: 'entra', entraron: 'gracias', falta: 'deDos', primero: 'encargo', todos: 'todos' };
function textos(clave) {
  const w = palabras(); let k = INGLES[clave], wEn = w;
  if (w.mixto && w.parejaEn && k === 'encargo') k = 'encargoPar';
  if (w.mixto && k === 'otro') { k = 'ahora'; wEn = Object.assign({}, w, { en: w.faltaEn }); }
  return [rellenar(D.objetivos[clave], w), rellenar(D.frases[k], wEn)];
}
let tAnuncio = 0;
function anunciar(es, en, ms) {
  $('aEs').textContent = es; $('aEn').textContent = en;
  const a = $('anuncio'); a.classList.remove('ver'); void a.offsetWidth; a.classList.add('ver');
  clearTimeout(tAnuncio); tAnuncio = setTimeout(() => a.classList.remove('ver'), ms || 3200);
}
function latir() { const e = $('encargo'); e.classList.remove('nuevo'); void e.offsetWidth; e.classList.add('nuevo'); }
// Cambia el objetivo de arriba, lo anuncia en grande en el centro y Noé lo dice en inglés.
function objetivo(clave, opc) {
  opc = opc || {};
  const [es, en] = textos(clave);
  $('hObj').textContent = es; $('hObjEn').textContent = en; latir();
  if (opc.anuncio !== false) anunciar(es, en, opc.ms);
  if (opc.voz !== false) Voz.noe([].concat(opc.antes || [], en), opc.luego);
  if (noe && noe.actor && !noe.ora) { if (clave === 'buscar') animarUnaVez(noe.actor, 'wave', 'idle'); else if (noe.actor.clips.talk) animarUnaVez(noe.actor, 'talk', 'idle'); }
}
function darEncargo(antes) {
  if (!encargoActual()) return;
  objetivo('buscar', { antes });
}
let tAyuda = 0;
function ayuda(texto, ms) { const a = $('ayuda'); a.textContent = texto; a.classList.toggle('oculto', !texto); clearTimeout(tAyuda); if (ms) tAyuda = setTimeout(() => a.classList.add('oculto'), ms); }
let tAviso = 0;
function aviso(texto, mal, ms) { const a = $('aviso'); a.textContent = texto; a.className = 'aviso ver' + (mal ? ' mal' : ''); clearTimeout(tAviso); tAviso = setTimeout(() => { a.className = 'aviso' + (mal ? ' mal' : ''); }, ms || 1400); }
function hud() {
  $('hCuenta').textContent = J.dentro + ' / ' + J.total;
  const p = $('hPares');
  if (p.children.length !== J.total) { p.innerHTML = ''; for (let i = 0; i < J.total; i++) p.appendChild(document.createElement('i')); }
  [...p.children].forEach((x, i) => x.classList.toggle('si', i < J.dentro));
  // el cielo se nubla a medida que el arca se llena
  if (J.fase === 'juego' || J.fase === 'pregunta') clima.meta.nub = 0.75 * J.dentro / J.total;
}
function buscarFoco() {
  let mejor = null, d = Infinity;
  animales.forEach(a => {
    if (a.estado !== 'pasea' && a.estado !== 'mira') return;
    const e = Math.hypot(a.x - jug.x, a.z - jug.z) - a.radio;
    if (e < 2.6 && e < d) { d = e; mejor = a; }
  });
  if (mejor !== J.foco) { if (mejor) SN.tocar('brillo'); J.foco = mejor; }
  $('bTocar').classList.toggle('oculto', !mejor || J.fase !== 'juego');
}
function tocar(a) {
  if (!a || J.fase !== 'juego') return;
  if (Math.hypot(a.x - jug.x, a.z - jug.z) - a.radio > 6) { aviso('Acércate más', true); return; }
  if (a.estado !== 'pasea' && a.estado !== 'mira') return;
  const quiere = encargoActual();
  if (a.especie !== quiere || pasoActual() === 'llevar') {
    SN.tocar('mal');
    const [es, en] = textos(pasoActual() === 'llevar' ? 'llevar' : 'buscar');
    aviso('Ese no. ' + es, true, 2200); latir(); Voz.noe(en);
    return;
  }
  SN.tocar('clic');
  J.fase = 'pregunta'; a.estado = 'pregunta';
  jug.rumbo = Math.atan2(a.x - jug.x, a.z - jug.z); jug.vel = 0;
  if (J.vista === 3) camS.yaw = jug.rumbo;
  const pq = PQ.armar(D, a.especie, J.grado, undefined, J.mixto[a.especie] ? a.nom.en : undefined);
  J.pregunta = Object.assign(pq, { animal: a, fallos: 0 });
  const banda = D.bandas[PQ.banda(D, J.grado)];
  $('pTag').textContent = banda.etiqueta;
  $('pq').textContent = pq.texto;
  $('pPista').textContent = '';
  const ops = $('ops'); ops.innerHTML = '';
  pq.ops.forEach((t, i) => { const b = document.createElement('button'); b.type = 'button'; b.className = 'op'; b.textContent = t; b.addEventListener('click', () => responder(i)); ops.appendChild(b); });
  $('panel').classList.remove('oculto'); $('bTocar').classList.add('oculto'); $('palanca').classList.add('oculto');
  palanca.x = palanca.y = 0; teclas.clear();
  Voz.decir(pq.texto);
}
function responder(i) {
  const p = J.pregunta; if (!p || p.listo) return;
  const b = $('ops').children[i]; if (!b || b.disabled) return;
  if (i === p.correcta) {
    p.listo = true; b.classList.add('bien');
    J.aciertos++; if (!p.fallos) J.primera++;
    SN.tocar('bien'); aviso(D.frases.bien);
    Voz.decir([p.ops[i], D.frases.bien]);
    setTimeout(() => cerrarPregunta(true), 1700);
  } else {
    p.fallos++; J.errores++;
    b.classList.add('mal'); b.disabled = true;
    SN.tocar('mal');
    $('pPista').textContent = p.pista;
    Voz.decir([p.ops[i], D.frases.otraVez]);
  }
}
function cerrarPregunta(bien) {
  const p = J.pregunta; J.pregunta = null;
  $('panel').classList.add('oculto'); if (tactil) $('palanca').classList.remove('oculto');
  J.fase = 'juego';
  if (!p) return;
  const a = p.animal;
  if (!bien) { a.estado = 'mira'; return; }
  const siguen = animales.filter(b => b.estado === 'sigue');
  a.orden = siguen.length; a.estado = 'sigue';
  SN.tocar('sigue');
  ayuda('');
  objetivo(pasoActual() === 'llevar' ? 'llevar' : 'otro');
}
// Al pisar el aro: con la pareja, suben solas; con uno solo, Noé recuerda que entran de dos en dos.
function revisarEntrega() {
  const r = ARCA.rampa, enAro = Math.hypot(jug.x - ARO.x, jug.z - ARO.z) < ARO.r;
  const antes = J.enAro; J.enAro = enAro;
  if (!enAro) return;
  const paso = pasoActual();
  if (paso === 'llevar') {
    const pareja = parejaActual(), lado = Math.min(1.3, r.ancho / 4);
    pareja.forEach((a, k) => {
      const s = k ? 1 : -1, x = r.cx + s * lado;
      a.estado = 'va'; a.ruta = [[x, ARO.z], [x, r.zSuelo - 0.5], [x, r.zTope + 0.5], [r.cx + s * lado * 0.5, r.zPuerta - 2.4]];
      if (Math.hypot(a.x - x, a.z - ARO.z) > 12) { a.x = x + rnd(-1, 1); a.z = ARO.z + 4; } // el rezagado llega de una
    });
    animales.filter(a => a.estado === 'sigue').forEach((a, i) => { a.orden = i; });
    ARCA.abreMeta = 1;
    objetivo('suben');
    return;
  }
  if (antes) return; // los avisos, sólo al entrar al aro
  if (paso === 'otro') { const [es, en] = textos('falta'); anunciar('Noé: ' + es, en, 4000); latir(); SN.tocar('mal'); Voz.noe([en, textos('otro')[1]]); }
  else if (paso === 'buscar') { const [es, en] = textos('primero'); anunciar('Noé: ' + es, en, 3500); latir(); Voz.noe(en); }
}

/* ---------- final: la puerta, la lluvia y el arcoíris ---------- */
function empezarFinal() {
  J.fase = 'final'; J.tf = 0; J.segundos = Math.round((performance.now() - J.t0) / 1000);
  const [tEs, tEn] = textos('todos'); $('hObj').textContent = tEs; $('hObjEn').textContent = tEn;
  huellas.visible = false; aro.visible = false;
  ['bTocar', 'palanca', 'ayuda'].forEach(id => $(id).classList.add('oculto'));
  marcaArca.visible = false; anillo.visible = false;
  const r = ARCA.rampa;
  if (ARCA.abrir) ARCA.abreMeta = 1; else { ARCA.puerta.visible = true; ARCA.puerta.rotation.x = ARCA.abierta; }
  jug.grupo.visible = true; J.vista = 3;
  cine(new V3(r.cx + 34, 11, r.zSuelo + 46), new V3(0, 13, 0), 2.6);
  J.hitos = {};
}
function cuadroFinal(dt) {
  J.tf += dt; const t = J.tf, h = J.hitos;
  const una = (k, fn) => { if (!h[k]) { h[k] = 1; fn(); } };
  if (ARCA.abrir) { ARCA.abre = 1 - suave(0.4, 2.6, t); ARCA.abrir(ARCA.abre); } else ARCA.puerta.rotation.x = lerp(ARCA.abierta, 0, suave(0.4, 2.6, t));
  una('golpe', () => setTimeout(() => SN.tocar('puerta'), 2500));
  if (t > 2.7) una('puerta', () => { Voz.noe(D.frases.puerta); clima.meta.nub = 1; });
  if (t > 4.5) una('lluvia', () => { clima.meta.lluvia = 1; Voz.noe(D.frases.lluvia); });
  if (t > 4.5 && t < 11) clima.agua = Math.min(-0.3, clima.agua + dt * 0.08);
  if (t > 6) una('rayo1', rayo);
  if (t > 8.6) una('rayo2', rayo);
  if (t > 11) una('escampa', () => { clima.meta.lluvia = 0; clima.meta.nub = 0.15; });
  if (t > 13) una('arco', () => { clima.meta.arco = 1; SN.tocar('arcoiris'); Voz.noe(D.frases.arcoiris); if (noe && noe.actor) { noe.ora = true; animar(noe.actor, noe.actor.clips.pray ? 'pray' : 'kneel', 1); } });
  if (t > 13) una('cineArco', () => cine(new V3(ARCA.rampa.cx + 20, 6, ARCA.rampa.zSuelo + 70), new V3(10, 30, -120), 4));
  if (t > 17.5) una('fin', terminar);
}
function rayo() { const f = $('flash'); f.classList.remove('ver'); void f.offsetWidth; f.classList.add('ver'); destello = 1; setTimeout(() => SN.tocar('trueno'), 350); }
function terminar() {
  J.fase = 'fin';
  const est = J.errores <= 2 ? 3 : J.errores <= 6 ? 2 : 1;
  const k = 'g' + J.grado; prog.estrellas[k] = Math.max(prog.estrellas[k] || 0, est); prog.grado = J.grado; prog.nino = J.nino; guardarP(prog);
  const svg = on => '<svg viewBox="0 0 24 24"><path d="M12 2.5l2.9 6 6.6.8-4.9 4.5 1.3 6.5L12 17l-5.9 3.3 1.3-6.5L2.5 9.3l6.6-.8z" fill="' + (on ? '#ffc23a' : '#e8dcc0') + '" stroke="#15304d" stroke-width="1.2" stroke-linejoin="round"/></svg>';
  $('fEst').innerHTML = [0, 1, 2].map(i => svg(i < est)).join('');
  $('fTit').textContent = D.frases.todos;
  const m = Math.floor(J.segundos / 60), s = J.segundos % 60;
  $('fSub').innerHTML = 'Subiste <b>' + J.total + '</b> animales al arca. Respuestas a la primera: <b>' + J.primera + '</b> de ' + J.total + '. Tiempo: <b>' + m + ':' + (s < 10 ? '0' : '') + s + '</b>.';
  $('fin').classList.remove('oculto'); $('hud').classList.add('oculto');
  SN.tocar('fanfarria');
  Voz.noe([D.frases.todos, D.frases.final]);
  // PENDIENTE (MyVC): aquí se mandaría el resultado cuando exista la ruta; hoy ningún juego 3D reporta notas.
}

/* ---------- inicio, partida y pausa ---------- */
function armarInicio() {
  $('frase').textContent = D.frase; $('como').textContent = tactil ? D.comoTactil : D.como;
  const og = $('optGrados'); og.innerHTML = '';
  D.grados.forEach(g => { const b = document.createElement('button'); b.type = 'button'; b.className = 'chip'; b.dataset.g = g.id; b.textContent = g.nombre; b.addEventListener('click', () => { J.grado = g.id; SN.tocar('clic'); marcarInicio(); }); og.appendChild(b); });
  document.querySelectorAll('.nino').forEach(b => b.addEventListener('click', () => { J.nino = b.dataset.nino; SN.tocar('clic'); marcarInicio(); cargarJugador(J.nino).catch(() => {}); }));
  marcarInicio();
}
function marcarInicio() {
  document.querySelectorAll('.nino').forEach(b => b.classList.toggle('sel', b.dataset.nino === J.nino));
  document.querySelectorAll('#optGrados .chip').forEach(b => b.classList.toggle('sel', +b.dataset.g === J.grado));
}
function reiniciarMundo() {
  animales.forEach(a => {
    a.estado = 'pasea'; a.x = a.casa[0]; a.z = a.casa[1]; a.meta = null; a.ruta = null; a.grupo.visible = true; ponerOpacidad(a, 1); ponerBrillo(a, 0);
  });
  Object.assign(clima.meta, { nub: 0, lluvia: 0, arco: 0 }); clima.agua = -1;
  if (ARCA.puerta) ARCA.puerta.visible = false;
  if (ARCA.abrir) { ARCA.abre = ARCA.abreMeta = 0; ARCA.abrir(0); }
  camS.cine = null;
}
async function jugar() {
  SN.despertar();
  const b = $('bJugar'); b.disabled = true; b.textContent = 'Cargando…';
  try { await cargarJugador(J.nino); } catch (e) { /* queda el de cajitas */ }
  b.disabled = false; b.textContent = 'Jugar';
  prog.grado = J.grado; prog.nino = J.nino; guardarP(prog);
  reiniciarMundo();
  const ids = [...new Set(animales.map(a => a.especie))];
  J.orden = barajar(ids.slice()).slice(0, D.parejas); repartir(); J.iEnc = 0; J.dentro = 0; J.total = 2 * J.orden.length; J.aciertos = 0; J.errores = 0; J.primera = 0; J.t0 = performance.now();
  // de pie en el camino, a unos 75 m del arca, mirándola
  const c = camino[Math.floor(camino.length * 0.38)];
  jug.x = c[0]; jug.z = c[1]; jug.y = suelo(jug.x, jug.z); jug.rumbo = Math.PI; jug.estela = []; jug.vel = 0;
  camS.yaw = Math.PI; camS.pitch = 0.32; camS.cine = null; J.vista = 3;
  cam.position.set(jug.x, jug.y + 3, jug.z + 6); camS.mira.set(jug.x, jug.y + 1, jug.z);
  $('inicio').classList.add('oculto'); $('fin').classList.add('oculto'); $('hud').classList.remove('oculto');
  if (tactil) $('palanca').classList.remove('oculto');
  J.fase = 'juego'; J.pausa = false;
  hud();
  J.gen = (J.gen || 0) + 1; J.enAro = false;
  ayuda(tactil ? D.comoTactil : D.como, 8000);
  // el primer encargo se ve y se oye de una, después del saludo de Noé
  objetivo('buscar', { antes: D.frases.bienvenida, ms: 4500 });
}
function pausar(si) {
  if (J.fase !== 'juego' && J.fase !== 'pregunta' && !J.pausa) return;
  J.pausa = si; $('pausa').classList.toggle('oculto', !si); SN.silencio('pausa', si);
  if (si) { Voz.callar(); teclas.clear(); }
}
function alInicio() {
  pausar(false); Voz.callar(); J.gen = (J.gen || 0) + 1;
  J.fase = 'menu'; J.pregunta = null;
  ['hud', 'panel', 'bTocar', 'palanca', 'ayuda', 'fin'].forEach(id => $(id).classList.add('oculto'));
  reiniciarMundo(); jug.grupo.visible = false;
  $('inicio').classList.remove('oculto');
}

/* ---------- entrada ---------- */
const AN = ['KeyW', 'KeyA', 'KeyS', 'KeyD', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ShiftLeft', 'ShiftRight'];
addEventListener('keydown', ev => {
  if (ev.code === 'Escape') { if (J.fase === 'juego' || J.fase === 'pregunta') pausar(!J.pausa); return; }
  if (J.pausa) return;
  if (J.fase === 'pregunta' && /^Digit[123]$|^Numpad[123]$/.test(ev.code)) { responder(+ev.code.slice(-1) - 1); return; }
  if (ev.code === 'KeyV') { cambiarVista(); return; }
  if ((ev.code === 'KeyE' || ev.code === 'Space' || ev.code === 'Enter') && J.fase === 'juego' && J.foco) { ev.preventDefault(); tocar(J.foco); return; }
  if (AN.includes(ev.code) && J.fase === 'juego') { teclas.add(ev.code); if (ev.code.startsWith('Arrow')) ev.preventDefault(); }
});
addEventListener('keyup', ev => teclas.delete(ev.code));
addEventListener('blur', () => teclas.clear());
// arrastrar para mirar; un toque corto sobre un animal lo toca
const lienzo = rd.domElement, arrastres = {};
lienzo.addEventListener('pointerdown', ev => { if (ev.pointerType === 'touch' && !tactil) { tactil = true; if (J.fase === 'juego') $('palanca').classList.remove('oculto'); } arrastres[ev.pointerId] = { x: ev.clientX, y: ev.clientY, x0: ev.clientX, y0: ev.clientY, t: performance.now() }; try { lienzo.setPointerCapture(ev.pointerId); } catch (e) { /* nada */ } SN.despertar(); });
lienzo.addEventListener('pointermove', ev => {
  const a = arrastres[ev.pointerId]; if (!a) return;
  const dx = ev.clientX - a.x, dy = ev.clientY - a.y; a.x = ev.clientX; a.y = ev.clientY;
  if (J.fase !== 'juego' && J.fase !== 'pregunta') return;
  const k = ev.pointerType === 'touch' ? 0.007 : 0.005;
  camS.yaw -= dx * k;
  if (J.vista === 1) camS.fpPitch = clamp(camS.fpPitch - dy * k, -1.1, 1.2);
  else camS.pitch = clamp(camS.pitch + dy * k * 0.8, -0.25, 1.15);
});
const soltar = ev => {
  const a = arrastres[ev.pointerId]; delete arrastres[ev.pointerId];
  if (!a || ev.type === 'pointercancel') return;
  if (Math.hypot(ev.clientX - a.x0, ev.clientY - a.y0) < 9 && performance.now() - a.t < 400) tocarEnPantalla(ev.clientX, ev.clientY);
};
lienzo.addEventListener('pointerup', soltar); lienzo.addEventListener('pointercancel', soltar);
lienzo.addEventListener('wheel', ev => { if (J.vista === 3) camS.dist = clamp(camS.dist + Math.sign(ev.deltaY) * 0.6, 2.6, 11); ev.preventDefault(); }, { passive: false });
const ray = new THREE.Raycaster(), _p2 = new THREE.Vector2(), _esf = new THREE.Sphere();
function tocarEnPantalla(x, y) {
  if (J.fase !== 'juego') return;
  _p2.set(x / innerWidth * 2 - 1, -(y / innerHeight) * 2 + 1); ray.setFromCamera(_p2, cam);
  let mejor = null, d = Infinity;
  animales.forEach(a => {
    if (a.estado === 'dentro' || a.estado === 'va' || !a.grupo.visible) return;
    _esf.center.set(a.x, a.y + a.actor.alto * 0.5, a.z); _esf.radius = Math.max(0.6, a.actor.alto * 0.7, a.radio);
    const p = ray.ray.intersectSphere(_esf, new V3()); if (p) { const e = p.distanceTo(cam.position); if (e < d) { d = e; mejor = a; } }
  });
  if (mejor && mejor.estado !== 'sigue') tocar(mejor);
  else if (noe && ray.ray.distanceToPoint(new V3(noe.x, 2, noe.z)) < 2) { latir(); Voz.noe($('hObjEn').textContent); }
}
// la palanca
const pal = $('palanca'), bola = $('palancaBola');
function moverPalanca(ev) {
  const r = pal.getBoundingClientRect(), cx = r.left + r.width / 2, cy = r.top + r.height / 2, R = r.width / 2;
  let dx = (ev.clientX - cx) / R, dy = (ev.clientY - cy) / R; const l = Math.hypot(dx, dy); if (l > 1) { dx /= l; dy /= l; }
  palanca.x = dx; palanca.y = dy; bola.style.transform = 'translate(' + dx * R * 0.6 + 'px,' + dy * R * 0.6 + 'px)';
}
pal.addEventListener('pointerdown', ev => { palanca.id = ev.pointerId; try { pal.setPointerCapture(ev.pointerId); } catch (e) { /* nada */ } moverPalanca(ev); SN.despertar(); });
pal.addEventListener('pointermove', ev => { if (ev.pointerId === palanca.id) moverPalanca(ev); });
const soltarPal = ev => { if (ev.pointerId !== palanca.id) return; palanca.id = null; palanca.x = palanca.y = 0; bola.style.transform = ''; };
pal.addEventListener('pointerup', soltarPal); pal.addEventListener('pointercancel', soltarPal);
// botones
$('bTocar').addEventListener('click', () => tocar(J.foco));
$('bVista').addEventListener('click', cambiarVista);
$('bPausa').addEventListener('click', () => pausar(true));
$('bSeguir').addEventListener('click', () => pausar(false));
$('bSalir').addEventListener('click', alInicio);
$('bJugar').addEventListener('click', jugar);
$('bOtra').addEventListener('click', jugar);
$('bOirEnc').addEventListener('click', () => { latir(); Voz.noe($('hObjEn').textContent); });
$('bOirPreg').addEventListener('click', () => { if (J.pregunta) Voz.decir(J.pregunta.texto); });
function pintarSonido() { document.querySelectorAll('.bson').forEach(b => { b.setAttribute('aria-pressed', SN.esMudo() ? 'true' : 'false'); b.setAttribute('aria-label', SN.esMudo() ? 'Activar el sonido' : 'Silenciar'); }); }
document.querySelectorAll('.bson').forEach(b => b.addEventListener('click', () => { SN.mudo(!SN.esMudo()); if (SN.esMudo()) Voz.callar(); prog.mudo = SN.esMudo(); guardarP(prog); pintarSonido(); }));
if (prog.mudo) SN.mudo(true);
pintarSonido();

/* ---------- bucle ---------- */
function ajustar() { rd.setSize(innerWidth, innerHeight); cam.aspect = innerWidth / innerHeight; cam.updateProjectionMatrix(); }
addEventListener('resize', ajustar); ajustar();
let raf = 0, medida = { t: 0, n: 0, hecho: false };
const _frustum = new THREE.Frustum(), _pv = new THREE.Matrix4(), _esfA = new THREE.Sphere();
function cuadro(dt) {
  const t = reloj3.elapsedTime;
  tiempoU.value = t;
  if (!J.pausa) {
    if (J.fase === 'menu' || J.fase === 'carga') {
      const a = t * 0.05, r = ARCA ? ARCA.rampa : null;
      cam.position.set(Math.sin(a) * 62 + 8, 9 + Math.sin(t * 0.1) * 2, (r ? r.zSuelo : 20) + 30 + Math.cos(a) * 30);
      camS.mira.set(0, 12, 0); cam.lookAt(camS.mira);
    } else if (J.fase === 'juego') { moverJugador(dt); buscarFoco(); revisarEntrega(); actualizarCamara(dt); }
    else if (J.fase === 'pregunta') { jug.vel = 0; if (jug.actor) animar(jug.actor, 'idle', 1); jug.grupo.rotation.y = jug.rumbo; actualizarCamara(dt); }
    else if (J.fase === 'final') { cuadroFinal(dt); if (jug.actor) animar(jug.actor, 'idle', 1); actualizarCamara(dt); }
    else if (J.fase === 'fin') actualizarCamara(dt);
    animales.forEach(a => actualizarAnimal(a, dt, t));
    // brillo y anillo del animal que se puede tocar
    const busca = J.fase === 'juego' && pasoActual() !== 'llevar' ? encargoActual() : null;
    animales.forEach(a => ponerBrillo(a, J.fase !== 'juego' ? 0 : a === J.foco ? 0.35 + 0.25 * Math.sin(t * 6) : a.especie === busca && (a.estado === 'pasea' || a.estado === 'mira') ? 0.12 + 0.1 * Math.sin(t * 4) : 0));
    guiar(t);
    if (anillo) { anillo.visible = !!J.foco && J.fase === 'juego'; if (anillo.visible) { const a = J.foco; anillo.position.set(a.x, a.y + 0.06, a.z); anillo.scale.setScalar(a.radio + 0.4 + Math.sin(t * 5) * 0.08); } }
    if (noe && noe.actor && J.fase !== 'menu' && !noe.ora) { const ang = Math.atan2(jug.x - noe.x, jug.z - noe.z); noe.rumbo += angDif(noe.rumbo, ang) * Math.min(1, dt * 2); noe.grupo.rotation.y = noe.rumbo; }
    if (jug.actor && jug.actor.mixer) jug.actor.mixer.update(dt);
    // muchos animales: los lejanos se esconden (menos en tableta), y el esqueleto y la sombra sólo se calculan cerca
    // y los que quedan fuera de cámara también (los de esqueleto no los recorta three: van con frustumCulled = false)
    const lejos = tactil ? 70 : 115, cercaAnim = tactil ? 35 : 60, enc = encargoActual();
    _frustum.setFromProjectionMatrix(_pv.multiplyMatrices(cam.projectionMatrix, cam.matrixWorldInverse));
    animales.forEach(a => {
      if (a.estado === 'dentro') return;
      const d = Math.hypot(a.x - cam.position.x, a.z - cam.position.z), importa = a.especie === enc || a.estado === 'sigue' || a.estado === 'va';
      _esfA.center.set(a.x, a.y + a.actor.alto * 0.5, a.z); _esfA.radius = Math.max(a.actor.alto, a.radio * 2) + 0.5;
      const enCamara = _frustum.intersectsSphere(_esfA);
      a.grupo.visible = enCamara && (d < lejos || importa);
      if (a.actor.mixer && a.grupo.visible && (d < cercaAnim || importa)) a.actor.mixer.update(dt);
      const sombra = d < 30;
      if (sombra !== a.sombra) { a.sombra = sombra; a.actor.modelo.traverse(o => { if (o.isMesh) o.castShadow = sombra; }); }
    });
    actualizarFaros(t, dt);
    if (noe && noe.actor && noe.actor.mixer) noe.actor.mixer.update(dt);
    actualizarClima(dt, t);
    if (ARCA && ARCA.abrir && J.fase !== 'final') { const d = ARCA.abreMeta - ARCA.abre; if (Math.abs(d) > 0.001) { ARCA.abre += Math.sign(d) * Math.min(Math.abs(d), dt * 0.45); ARCA.abrir(suave(0, 1, ARCA.abre)); } }
    adornos.forEach(f => f(t, dt));
  }
  // la sombra sigue a lo que se mira
  const foco = J.fase === 'juego' || J.fase === 'pregunta' ? new V3(jug.x, jug.y, jug.z) : camS.mira;
  sol.target.position.copy(foco); sol.position.copy(foco).addScaledVector(SOL_DIR, 120);
  cielo.position.copy(cam.position);
  rd.render(scene, cam);
  // si el equipo no da, menos píxeles (tabletas del colegio)
  if (!medida.hecho && J.fase === 'juego') { medida.t += dt; medida.n++; if (medida.t > 4) { medida.hecho = true; if (medida.n / medida.t < 32 && dpr > 1) { dpr = 1; rd.setPixelRatio(1); ajustar(); } } }
}
function bucle() { raf = requestAnimationFrame(bucle); cuadro(Math.min(0.05, reloj3.getDelta())); }
document.addEventListener('visibilitychange', () => {
  SN.silencio('oculto', document.hidden);
  if (document.hidden) { cancelAnimationFrame(raf); raf = 0; Voz.callar(); if (J.fase === 'juego' || J.fase === 'pregunta') pausar(true); }
  else if (!raf) { reloj3.getDelta(); bucle(); }
});

/* ---------- arranque ---------- */
function progreso(f, msg) { $('cbar').style.width = Math.round(f * 100) + '%'; if (msg) $('cmsg').textContent = msg; }
async function preparar() {
  progreso(0.05, 'Buscando los animales…');
  const [man] = await Promise.all([leerManifiesto(), cargarLibs().catch(() => null)]);
  manifiesto = man;
  progreso(0.2, 'Construyendo el arca…');
  let A = null;
  const urlArca = MODELOS + (manifiesto.arca && manifiesto.arca.archivo || 'arca.glb');
  try {
    A = analizarArca(await cargarGlb(urlArca));
    console.info('Two by Two: arca de ' + urlArca + ' (' + (2 * A.hx).toFixed(0) + ' × ' + (2 * A.hz).toFixed(0) + ' m, rampa ' + (A.rampa ? 'del modelo, lado ' + (A.lado > 0 ? '+z' : '−z') : 'hecha aquí: el modelo no la trae') + ').');
  } catch (e) { A = null; console.warn('Two by Two: no cargó el arca ' + urlArca + ' (' + (e && e.message || e) + '); sale el arca provisional.'); }
  if (!A) A = arcaProvisional();
  ARCA = A; completarRampa(A); scene.add(A.grupo);
  progreso(0.35, 'Sembrando la pradera…');
  armarMundo();
  progreso(0.45, 'Llamando a los animales…');
  await crearAnimales(especiesDelMundo(), f => progreso(0.45 + f * 0.45));
  await crearNoe();
  J.total = 2 * D.parejas;
  progreso(1);
  armarInicio();
  J.fase = 'menu';
  $('cargando').classList.add('oculto'); $('inicio').classList.remove('oculto');
  // el personaje de la última vez, de una vez
  cargarJugador(J.nino).catch(() => {});
  decorarFinca().catch(e => console.warn('Two by Two: decorado', e)).then(poblarResto);
}
bucle();
preparar().catch(e => { $('cmsg').textContent = 'No se pudo preparar el juego. Vuelve a abrirlo.'; console.error(e); });

/* ---------- depuración ---------- */
window.__juego = {
  estado: () => ({
    fase: J.fase, grado: J.grado, nino: J.nino, vista: J.vista, dentro: J.dentro, total: J.total, encargo: encargoActual(), aciertos: J.aciertos, errores: J.errores,
    foco: J.foco && J.foco.id, jugador: { x: +jug.x.toFixed(2), z: +jug.z.toFixed(2), y: +jug.y.toFixed(2), modelo: !!(jug.actor && jug.actor.mixer) },
    pregunta: J.pregunta && { texto: J.pregunta.texto, ops: J.pregunta.ops, correcta: J.pregunta.correcta, tipo: J.pregunta.tipo },
    arca: ARCA && { glb: ARCA.glb, lado: ARCA.lado, hx: +ARCA.hx.toFixed(1), hz: +ARCA.hz.toFixed(1), rampa: Object.fromEntries(Object.entries(ARCA.rampa).map(([k, v]) => [k, typeof v === 'number' ? +v.toFixed(2) : v])) },
    animales: animales.map(a => ({ id: a.id, modelo: a.modelo, clips: !!a.actor.mixer, estado: a.estado, x: +a.x.toFixed(1), z: +a.z.toFixed(1) })),
    clima: { nub: +clima.nub.toFixed(2), lluvia: +clima.lluvia.toFixed(2), arco: +clima.arco.toFixed(2) }, noe: noe ? (noe.actor ? 'modelo' : 'cartel') : null,
    dpr
  }),
  // pone al jugador junto al animal buscado que falte y abre su pregunta
  tocar: () => { const a = animales.find(x => x.especie === encargoActual() && (x.estado === 'pasea' || x.estado === 'mira')); if (!a) return false; jug.x = a.x + 1.5; jug.z = a.z + 1.5; jug.y = suelo(jug.x, jug.z); jug.estela = []; tocar(a); return a.id; },
  responder: i => responder(i),
  // completa la pareja que se busca y la lleva a la rampa
  pareja: () => { const id = encargoActual(); animales.filter(a => a.especie === id && a.estado !== 'dentro').forEach((a, i) => { a.estado = 'sigue'; a.orden = i; }); jug.x = ARO.x; jug.z = ARO.z; jug.estela = []; animales.filter(a => a.especie === id).forEach(a => { a.x = ARO.x + rnd(-2, 2); a.z = ARO.z + 3; }); revisarEntrega(); return id; },
  objetivo: () => ({ paso: J.fase === 'juego' ? pasoActual() : J.fase, texto: $('hObj').textContent, en: $('hObjEn').textContent }),
  ganar: () => { animales.forEach(a => { if (J.orden.includes(a.especie) && a.estado !== 'dentro') { a.estado = 'dentro'; a.grupo.visible = false; } }); J.dentro = J.total; hud(); empezarFinal(); },
  vista: () => cambiarVista(),
  // lleva la cámara a un punto mirando a otro (para revisar el arca de cerca): cine([x, y, z], [x, y, z])
  cine: (pos, mira) => cine(new V3(...pos), new V3(...mira), 0.01),
  // pone esa especie como el encargo actual (si está en el mundo)
  encargo: id => { if (!animales.some(a => a.especie === id)) return false; const i = J.orden.indexOf(id); if (i >= 0) J.orden.splice(i, 1); J.orden.splice(J.iEnc, 0, id); J.orden.length = Math.min(J.orden.length, D.parejas); repartir(); darEncargo(); return true; },
  faros: () => faros.map(f => f.obj && f.obj.id),
  modelos: () => Object.fromEntries(Object.keys(D.especies).map(id => [id, (modelosDe(id) || []).map(m => m.ficha.archivo)])),
  mixto: () => Object.assign({}, J.mixto),
  // triángulos por objeto (para ajustar el rendimiento)
  pesos: () => { const m = {}; scene.traverse(o => { if (!o.isMesh || !o.visible) return; let v = o; while (v && v.visible) v = v.parent; if (v) return; const g = o.geometry, t = (g.index ? g.index.count : g.attributes.position.count) / 3 * (o.isInstancedMesh ? o.count : 1); const k = o.name || (o.isInstancedMesh ? 'inst' : o.isSkinnedMesh ? 'esqueleto' : 'malla'); m[k] = (m[k] || 0) + Math.round(t); }); return Object.entries(m).sort((a, b) => b[1] - a[1]).slice(0, 14); },
  info: () => ({ tris: rd.info.render.triangles, llamadas: rd.info.render.calls, geometrias: rd.info.memory.geometries, texturas: rd.info.memory.textures, heapMB: performance.memory ? Math.round(performance.memory.usedJSHeapSize / 1048576) : null, animales: animales.length, visibles: animales.filter(a => a.grupo.visible).length }),
  ir: (x, z) => { jug.x = x; jug.z = z; jug.y = suelo(x, z); jug.estela = []; },
  sonido: () => SN.estado()
};
})();
