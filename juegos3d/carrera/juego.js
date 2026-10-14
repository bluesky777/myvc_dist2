/* Turbo Saber — motor. Las preguntas y los compañeros vienen de datos.js (window.DATOS_CARRERA).
   Los rivales se simulan; desde fuera se pueden mover con window.__juego.rival(id, avance).
   Las reglas de los poderes viven en poderes.js (window.PoderesCarrera): aquí sólo se usan y se dibujan;
   un poder decidido fuera entra con window.__juego.poder(evento).
   Multijugador (sólo dentro de app2): multijugador.js y ../sala/sala.js se cargan al elegirlo; aquí queda el
   motor de los dos papeles, J.red = 'tablero' (el docente: autoridad, no corre) o 'alumno' (dibuja lo que manda). */
(function () {
'use strict';
const D = window.DATOS_CARRERA;
const $ = id => document.getElementById(id);
if (!window.THREE || !D) { $('cmsg').textContent = 'No se pudo descargar el motor 3D. Revisa la conexión y vuelve a abrir el juego.'; return; }

/* ---------- utilidades ---------- */
const CLAVE = 'juegos3d.carrera';
const leerP = () => { try { return JSON.parse(localStorage.getItem(CLAVE)) || {}; } catch (e) { return {}; } };
const guardarP = o => { try { localStorage.setItem(CLAVE, JSON.stringify(o)); } catch (e) { /* sin almacenamiento */ } };
const prog = leerP(); if (!prog.marcas || typeof prog.marcas !== 'object') prog.marcas = {};
let semilla = 20261004;
const azarFijo = () => { semilla |= 0; semilla = semilla + 0x6D2B79F5 | 0; let t = Math.imul(semilla ^ semilla >>> 15, 1 | semilla); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
const rnd = (a, b) => a + Math.random() * (b - a);
const pick = a => a[Math.floor(Math.random() * a.length)];
const barajar = a => { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const suave = (a, b, x) => { const t = clamp((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };
const ord = n => n + '.º';
const reloj = s => { const m = Math.floor(s / 60), r = s - m * 60; return m + ':' + (r < 10 ? '0' : '') + r.toFixed(1); };
const hex = c => '#' + new THREE.Color(c).getHexString();
const colegio = (getComputedStyle(document.documentElement).getPropertyValue('--colegio') || '#ff6a4d').trim();

/* ---------- escena ---------- */
const V3 = THREE.Vector3;
const rd = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
rd.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));
rd.shadowMap.enabled = true; rd.shadowMap.type = THREE.PCFSoftShadowMap;
$('gl').appendChild(rd.domElement);
const scene = new THREE.Scene();
const cam = new THREE.PerspectiveCamera(55, 1, 0.1, 700);
// Cielo: una cúpula con degradado por altura que sigue a la cámara. Bajo el horizonte es del color de la niebla, así el
// suelo y el mar se funden con él miren a donde miren (un fondo de pantalla plano dejaba un borde al inclinar la cámara).
const cielo = new THREE.Mesh(new THREE.SphereGeometry(600, 24, 14), new THREE.MeshBasicMaterial({ vertexColors: true, side: THREE.BackSide, fog: false, depthWrite: false }));
cielo.renderOrder = -1; scene.add(cielo);
function pintarCielo(c, niebla) {
  const g = cielo.geometry, p = g.attributes.position, col = new Float32Array(p.count * 3), k = [niebla, c[2], c[1], c[0]].map(h => new THREE.Color(h)), x = new THREE.Color();
  for (let i = 0; i < p.count; i++) {
    const e = Math.asin(clamp(p.getY(i) / 600, -1, 1));
    if (e <= 0) x.copy(k[0]); else if (e < 0.03) x.copy(k[0]).lerp(k[1], e / 0.03); else if (e < 0.16) x.copy(k[1]).lerp(k[2], (e - 0.03) / 0.13); else x.copy(k[2]).lerp(k[3], Math.min(1, (e - 0.16) / 0.36));
    col[i * 3] = x.r; col[i * 3 + 1] = x.g; col[i * 3 + 2] = x.b;
  }
  g.setAttribute('color', new THREE.BufferAttribute(col, 3));
}
scene.fog = new THREE.Fog(0xf6ecd6, 110, 340);
const hemi = new THREE.HemisphereLight(0xfff3e0, 0x5f8f4e, 0.62); scene.add(hemi);
const sol = new THREE.DirectionalLight(0xfff0d8, 0.9);
sol.castShadow = true; sol.shadow.mapSize.set(1024, 1024); sol.shadow.bias = -0.0005;
Object.assign(sol.shadow.camera, { left: -34, right: 34, top: 34, bottom: -34, near: 1, far: 140 });
scene.add(sol, sol.target);
const SOL_OFF = new V3(28, 52, 18);

const mats = {};
const M = (c, o) => { const k = c + JSON.stringify(o || {}); return mats[k] || (mats[k] = new THREE.MeshStandardMaterial(Object.assign({ color: c, flatShading: true, roughness: 0.85 }, o || {}))); };
const sombra = (o, recibe) => { o.traverse(m => { if (m.isMesh) { m.castShadow = true; m.receiveShadow = !!recibe; } }); return o; };
const malla = (geo, mat, x, y, z) => { const m = new THREE.Mesh(geo, mat); m.position.set(x || 0, y || 0, z || 0); return m; };

/* ---------- pista: la definen pistas.js (trazado, paleta, decorado); armarPista la construye y liberarPista la suelta ---------- */
const PISTAS = (window.PISTAS_CARRERA && window.PISTAS_CARRERA.lista) || [];
const pistaDef = id => PISTAS.find(p => p.id === id) || PISTAS[0];
const ANCHO = 12, H = ANCHO / 2, NS = 720, P = [], T = [], N = [];
let PISTA = null, LARGO = 1, MUESTRAS = [], LAGO = null, HUECO = null, AFUERA = 1;
const FOCO = new V3(); // el rasgo memorable de la pista: la vista y el sobrevuelo pasan por ahí
const _ray = new THREE.Raycaster();
let MONUMENTOS = []; // {nombre, ps: [V3]}: lo que tiene que verse corriendo (de la base a la punta; para comprobarlo)
const CENTRO = new V3(), PODIO_C = new V3(), TRIB_C = new V3();
const escenario = new THREE.Group(); scene.add(escenario);
let animar = [], matsP = {};
// materiales del escenario: aparte de los de los karts, porque se liberan con la pista
const MP = (c, o) => { const k = c + JSON.stringify(o || {}); return matsP[k] || (matsP[k] = new THREE.MeshStandardMaterial(Object.assign({ color: c, flatShading: true, roughness: 0.85 }, o || {}))); };
const poner = (o, conSombra, recibe) => { if (conSombra) sombra(o, recibe); escenario.add(o); return o; };
// Punto y rumbo a una distancia d de la salida, corrido "lado" metros hacia la normal.
const _t = new V3(), _n = new V3();
function marco(d, lado, outP, outT) {
  const u = (((d % LARGO) + LARGO) % LARGO) / LARGO * NS, i = Math.floor(u), f = u - i;
  outP.lerpVectors(P[i], P[i + 1], f);
  _n.lerpVectors(N[i], N[i + 1], f).normalize();
  outP.addScaledVector(_n, lado || 0);
  if (outT) outT.lerpVectors(T[i], T[i + 1], f).normalize();
  return outP;
}
function distPista(x, z) { let m = 1e9; for (const p of MUESTRAS) { const dx = p.x - x, dz = p.z - z, d = dx * dx + dz * dz; if (d < m) m = d; } return Math.sqrt(m); }
function dentro(x, z) { let c = false; for (let i = 0, j = MUESTRAS.length - 1; i < MUESTRAS.length; j = i++) { const a = MUESTRAS[i], b = MUESTRAS[j]; if ((a.z > z) !== (b.z > z) && x < (b.x - a.x) * (z - a.z) / (b.z - a.z) + a.x) c = !c; } return c; }

// Cinta de quads a lo largo de la pista entre dos distancias laterales. recorte: sin los quads que se doblan en curvas cerradas.
function cinta(l0, l1, y, colorDe, o) {
  o = o || {};
  const pos = [], col = [], c = new THREE.Color(), a = new V3(), b = new V3(), e = new V3(), f = new V3();
  for (let i = 0; i < NS; i++) {
    const h = colorDe(i); if (h == null) continue;
    a.copy(P[i]).addScaledVector(N[i], l0); b.copy(P[i]).addScaledVector(N[i], l1);
    e.copy(P[i + 1]).addScaledVector(N[i + 1], l0); f.copy(P[i + 1]).addScaledVector(N[i + 1], l1);
    if (o.recorte && ((e.x - a.x) * T[i].x + (e.z - a.z) * T[i].z <= 0.05 || (f.x - b.x) * T[i].x + (f.z - b.z) * T[i].z <= 0.05)) continue;
    pos.push(a.x, y, a.z, e.x, y, e.z, b.x, y, b.z, b.x, y, b.z, e.x, y, e.z, f.x, y, f.z);
    c.setHex(h); for (let k = 0; k < 6; k++) col.push(c.r, c.g, c.b);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute('color', new THREE.Float32BufferAttribute(col, 3));
  g.computeVertexNormals();
  const m = new THREE.Mesh(g, o.mat || (o.brillo ? new THREE.MeshBasicMaterial({ vertexColors: true }) : new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.95 })));
  m.receiveShadow = !o.brillo; return poner(m);
}
// Muchas copias de una geometría en UNA malla. items: {x,y,z, rx,ry,rz, s | sx,sy,sz, c}
const _oi = new THREE.Object3D(), _ci = new THREE.Color();
function inst(geo, mat, items, conSombra, n) {
  const m = new THREE.InstancedMesh(geo, mat, Math.max(1, n || items.length));
  items.forEach((q, i) => {
    _oi.position.set(q.x || 0, q.y || 0, q.z || 0); _oi.rotation.set(q.rx || 0, q.ry || 0, q.rz || 0);
    if (q.sx != null) _oi.scale.set(q.sx, q.sy, q.sz); else _oi.scale.setScalar(q.s || 1);
    _oi.updateMatrix(); m.setMatrixAt(i, _oi.matrix);
    if (q.c != null) m.setColorAt(i, _ci.setHex(q.c));
  });
  // todas con color por copia (blanco si no se dio): en r128 un material compartido entre mallas de instancias con y sin
  // instanceColor reutiliza el programa equivocado y falla al dibujar
  if (!m.instanceColor) { _ci.setHex(0xffffff); for (let i = 0; i < m.count; i++) m.setColorAt(i, _ci); }
  else for (let i = items.length; i < m.count; i++) m.setColorAt(i, _ci.setHex(0xffffff));
  if (!items.length && !n) m.count = 0;
  m.frustumCulled = false; // en r128 el recorte mira sólo la geometría base, no dónde está cada copia
  m.castShadow = conSombra !== false; m.receiveShadow = true;
  return poner(m);
}
// Geometrías sueltas fusionadas en una con colores por vértice. partes: {g, c, p:[x,y,z], r:[rx,ry,rz], s: n | [sx,sy,sz]}
function fusion(partes) {
  const pos = [], col = [];
  partes.forEach(q => {
    const g = q.g.index ? q.g.toNonIndexed() : q.g;
    _oi.position.set(...(q.p || [0, 0, 0])); _oi.rotation.set(...(q.r || [0, 0, 0]));
    if (Array.isArray(q.s)) _oi.scale.set(...q.s); else _oi.scale.setScalar(q.s == null ? 1 : q.s);
    _oi.updateMatrix(); g.applyMatrix4(_oi.matrix);
    const a = g.attributes.position; _ci.setHex(q.c);
    for (let i = 0; i < a.count; i++) { pos.push(a.getX(i), a.getY(i), a.getZ(i)); col.push(_ci.r, _ci.g, _ci.b); }
    g.dispose(); q.g.dispose();
  });
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute('color', new THREE.Float32BufferAttribute(col, 3));
  g.computeVertexNormals(); return g;
}
let texPunto = null;
function puntos(pos, col, o) {
  o = o || {};
  if (!texPunto) {
    const c = document.createElement('canvas'); c.width = c.height = 32; const x = c.getContext('2d'), g = x.createRadialGradient(16, 16, 0, 16, 16, 16);
    g.addColorStop(0, '#fff'); g.addColorStop(0.45, 'rgba(255,255,255,.85)'); g.addColorStop(1, 'rgba(255,255,255,0)'); x.fillStyle = g; x.fillRect(0, 0, 32, 32);
    texPunto = new THREE.CanvasTexture(c);
  }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(pos, 3)); if (col) g.setAttribute('color', new THREE.BufferAttribute(col, 3));
  const m = new THREE.Points(g, new THREE.PointsMaterial({ size: o.tam || 1, sizeAttenuation: !o.fijo, color: o.color || 0xffffff, vertexColors: !!col, map: texPunto, transparent: true, opacity: o.opac || 1, depthWrite: false, fog: o.niebla !== false }));
  m.frustumCulled = false; return poner(m);
}
// Sitios libres para decorado: lejos de la pista, del lago, de la tribuna y del podio, y separados entre sí.
function lugares(o) {
  const out = [], lado = o.lado || 300, sep2 = (o.sep || 4) ** 2;
  for (let k = 0; k < (o.intentos || o.n * 4) && out.length < o.n; k++) {
    const x = CENTRO.x + (azarFijo() - 0.5) * lado, z = CENTRO.z + (azarFijo() - 0.5) * lado;
    const dd = distPista(x, z); if (dd < (o.min || H + 6) || dd > (o.max || 1e9)) continue;
    if (LAGO && Math.hypot(x - LAGO.x, z - LAGO.z) < LAGO.r + 3) continue;
    if (Math.hypot(x - TRIB_C.x, z - TRIB_C.z) < 26 || Math.hypot(x - PODIO_C.x, z - PODIO_C.z) < 12) continue;
    if (o.filtro && !o.filtro({ x, z })) continue;
    if (out.some(l => (l.x - x) ** 2 + (l.z - z) ** 2 < sep2)) continue;
    out.push({ x, z, dd, y: altura(x, z, dd), s: 0.8 + azarFijo() * 0.8, tipo: azarFijo() });
  }
  return out;
}

/* ---------- terreno ---------- */
const ruido = (x, z) => Math.sin(x * 0.045) * Math.cos(z * 0.05) * 1.6 + Math.sin(x * 0.11 + z * 0.07) * 0.7 + Math.cos(z * 0.13 - x * 0.03) * 0.5;
function altura(x, z, dd) {
  if (dd === undefined) dd = distPista(x, z);
  const R = PISTA.relieve || {};
  let y = -0.04 + suave(H + 11, H + 34, dd) * (ruido(x, z) + 2.8) * (R.lomas != null ? R.lomas : 0.75);
  const dx = x - CENTRO.x, dz = z - CENTRO.z, r = Math.hypot(dx, dz);
  const r0 = R.desde || 140; // donde empiezan los cerros de alrededor
  if (r > r0) { let m = (r - r0) * (R.montes != null ? R.montes : 0.42) * (0.7 + 0.3 * Math.sin(Math.atan2(dz, dx) * 7)); if (R.meseta) m = Math.min(m, R.meseta + Math.sin(dx * 0.02) * 3); y += m; }
  if (LAGO) { const dl = Math.hypot(x - LAGO.x, z - LAGO.z); y = y * suave(LAGO.r - 3, LAGO.r + 3, dl) + (-1.6) * (1 - suave(LAGO.r - 3, LAGO.r + 3, dl)); }
  if (PISTA.alturaExtra) y = PISTA.alturaExtra(x, z, y, dd);
  return y;
}

// Una casa o un edificio en (px, pz) con radio r, ¿tapa la vista hacia (x, z) desde algún tramo que mira hacia allá?
function tapaVista(x, z, ang) {
  const vistas = [];
  for (let i = 0; i < NS; i += 8) {
    const dx = x - P[i].x, dz = z - P[i].z, l = Math.hypot(dx, dz);
    if (l > 8 && (dx * T[i].x + dz * T[i].z) / l > Math.cos(ang)) vistas.push(P[i]);
  }
  return (px, pz, r) => vistas.some(p => {
    const vx = x - p.x, vz = z - p.z, l2 = vx * vx + vz * vz, t = Math.max(0, Math.min(1, ((px - p.x) * vx + (pz - p.z) * vz) / l2));
    return t < 0.97 && Math.hypot(px - p.x - vx * t, pz - p.z - vz * t) < r;
  });
}
/* ---------- armar y liberar ---------- */
const publico = [], semaforo = [], nubes = [];
let publicoMesh = null, cabezasMesh = null, nubesMesh = null, podio = null;
function liberarPista() {
  escenario.traverse(o => {
    if (o.geometry) o.geometry.dispose();
    if (o.material) [].concat(o.material).forEach(m => { Object.keys(m).forEach(k => { const t = m[k]; if (t && t.isTexture && t !== texPunto) t.dispose(); }); m.dispose(); });
  });
  while (escenario.children.length) escenario.remove(escenario.children[0]);
  Object.values(matsP).forEach(m => m.dispose()); matsP = {};
  animar = []; publico.length = 0; semaforo.length = 0; nubes.length = 0;
  publicoMesh = cabezasMesh = nubesMesh = podio = null; PISTA = null;
}
let generacion = 0;
// Modelo .glb de una pista (opcional): se pide sólo al armarla; GLTFLoader de r128 se carga la primera vez (dentro de app2
// lo copia el build junto a three.min.js; suelto, del CDN con la versión exacta). Sin fichero o con error → null.
const glbs = {};
let cargaGLTF = null;
function cargarGLTF() {
  if (THREE.GLTFLoader) return Promise.resolve();
  const J3x = window.Juegos3D || {};
  return cargaGLTF || (cargaGLTF = cargarScript(J3x.enApp ? '../GLTFLoader.js' : 'https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/loaders/GLTFLoader.js').catch(e => { cargaGLTF = null; throw e; }));
}
// Suelto (el artefacto de claude.ai no sirve .glb): si falla, se prueba <ruta>.js, que deja el fichero en base64 en
// window.MODELOS_GLB[ruta] (lo genera .pruebas/juegos-3d/glb-a-js.mjs al publicar; no se commitea). En app2, nada de esto.
function glbEnJs(ruta) {
  if ((window.Juegos3D || {}).enApp) return Promise.resolve(null);
  const leer = () => { const b = (window.MODELOS_GLB || {})[ruta]; if (!b) return null; const bin = atob(b), u = new Uint8Array(bin.length); for (let i = 0; i < bin.length; i++) u[i] = bin.charCodeAt(i); return u.buffer; };
  return leer() ? Promise.resolve(leer()) : cargarScript(ruta + '.js').then(leer, () => null);
}
function modelo(ruta) {
  const datos = glbs[ruta] || (glbs[ruta] = fetch(ruta).then(r => (r.ok ? r.arrayBuffer() : null)).catch(() => null).then(b => b || glbEnJs(ruta)));
  return datos.then(buf => {
    if (!buf) return null; // sin fichero: no se vuelve a pedir hasta recargar (un solo 404 por sesión)
    return cargarGLTF().then(() => new Promise(res => new THREE.GLTFLoader().parse(buf.slice(0), ruta.replace(/[^/]*$/, ''), g => res(g.scene), () => res(null))));
  }).catch(() => null);
}
function armarPista(id) {
  const def = pistaDef(id);
  if (PISTA === def) return false;
  liberarPista();
  const gen = ++generacion;
  PISTA = def; semilla = def.semilla || 20261004;
  // trazado: los puntos de control se escalan para que todas midan parecido (la carrera dura lo mismo)
  let cp = def.cp.map(([x, z]) => new V3(x, 0, z)), curva = new THREE.CatmullRomCurve3(cp, true, 'centripetal');
  if (def.largo) { const k = def.largo / curva.getLength(); cp = cp.map(p => p.multiplyScalar(k)); curva = new THREE.CatmullRomCurve3(cp, true, 'centripetal'); }
  LARGO = curva.getLength(); P.length = T.length = N.length = 0;
  for (let i = 0; i <= NS; i++) {
    const u = (i % NS) / NS, p = curva.getPointAt(u), t = curva.getTangentAt(u);
    P.push(p); T.push(t); N.push(new V3(t.z, 0, -t.x).normalize());
  }
  MUESTRAS = P.filter((_, i) => i % 3 === 0);
  let x0 = 1e9, x1 = -1e9, z0 = 1e9, z1 = -1e9;
  P.forEach(p => { x0 = Math.min(x0, p.x); x1 = Math.max(x1, p.x); z0 = Math.min(z0, p.z); z1 = Math.max(z1, p.z); });
  if (def.centro) CENTRO.set(def.centro[0], 0, def.centro[1]); else CENTRO.set(Math.round((x0 + x1) / 2), 0, Math.round((z0 + z1) / 2));
  // el hueco de adentro: el punto interior más lejos de la pista (lago, volcán, observatorio…)
  HUECO = null; LAGO = null;
  for (let x = Math.ceil(x0 / 4) * 4; x <= x1; x += 4) for (let z = Math.ceil(z0 / 4) * 4; z <= z1; z += 4) {
    if (!dentro(x, z)) continue;
    const d = distPista(x, z); if (!HUECO || d > HUECO.d) HUECO = { x, z, d };
  }
  if (def.lago && HUECO && HUECO.d - 13 >= 5) LAGO = { x: HUECO.x, z: HUECO.z, r: Math.min(18, HUECO.d - 13) };
  // lado de afuera en la recta de salida (allí van la tribuna y el podio)
  AFUERA = dentro(P[0].x + N[0].x * 10, P[0].z + N[0].z * 10) ? -1 : 1;
  PODIO_C.copy(P[0]).addScaledVector(N[0], AFUERA * 15).addScaledVector(T[0], 27);
  TRIB_C.copy(P[0]).addScaledVector(N[0], AFUERA * 21);
  const K = { THREE, V3, P, T, N, NS, H, ANCHO, LARGO, AFUERA, CENTRO, HUECO, LAGO, TRIB_C, PODIO_C, cam, marco, distPista, dentro, altura, suave, clamp,
    azar: azarFijo, MP, malla, poner, inst, fusion, cinta, puntos, lugares, anim: f => animar.push(f), corredores: () => J.corredores,
    modelo, vigente: () => gen === generacion, monumento: (nombre, x, ys, z, o) => MONUMENTOS.push({ nombre, algun: Array.isArray(x), todos: !!(o && o.todos), plano: !!(o && o.plano), ps: Array.isArray(x) ? x.map(q => new V3(...q)) : [].concat(ys).map(y => new V3(x, y, z)) }),
    // visual(x, z): ¿tapa (px, pz, radio) la vista desde la pista hacia (x, z)? Para dejar libre lo que hay que ver corriendo.
    visual: (x, z, ang) => tapaVista(x, z, ang || 0.5), foco: (x, y, z) => FOCO.set(x, y, z), pista: def, reencuadrar: () => { planoCompleto = null; } };
  if (def.preparar) def.preparar(K);
  // cielo, niebla y luces
  pintarCielo(def.cielo, def.niebla[0]); scene.background = new THREE.Color(def.niebla[0]);
  scene.fog.color.setHex(def.niebla[0]); scene.fog.near = def.niebla[1]; scene.fog.far = def.niebla[2];
  hemi.color.setHex(def.hemi[0]); hemi.groundColor.setHex(def.hemi[1]); hemi.intensity = def.hemi[2];
  sol.color.setHex(def.sol[0]); sol.intensity = def.sol[1];
  document.body.classList.toggle('noche', !!def.noche);
  // suelo
  {
    const S = 600, SEG = 120, g = new THREE.PlaneGeometry(S, S, SEG, SEG); g.rotateX(-Math.PI / 2); g.translate(CENTRO.x, 0, CENTRO.z);
    const pos = g.attributes.position;
    for (let i = 0; i < pos.count; i++) pos.setY(i, altura(pos.getX(i), pos.getZ(i)));
    const ng = g.toNonIndexed(), p2 = ng.attributes.position, col = [], c = new THREE.Color(), su = def.suelo;
    g.dispose();
    for (let i = 0; i < p2.count; i += 3) {
      const y = (p2.getY(i) + p2.getY(i + 1) + p2.getY(i + 2)) / 3, az = azarFijo();
      let h = su.tonos[Math.floor(az * su.tonos.length)];
      if (y < -0.6) h = su.bajo; else { const k = su.capas.find(([lim]) => y > lim); if (k) h = k[1]; }
      if (def.colorSuelo) h = def.colorSuelo((p2.getX(i) + p2.getX(i + 1) + p2.getX(i + 2)) / 3, (p2.getZ(i) + p2.getZ(i + 1) + p2.getZ(i + 2)) / 3, y, h, az);
      c.setHex(h); for (let k = 0; k < 3; k++) col.push(c.r, c.g, c.b);
    }
    ng.setAttribute('color', new THREE.Float32BufferAttribute(col, 3)); ng.computeVertexNormals();
    const suelo = new THREE.Mesh(ng, new THREE.MeshStandardMaterial({ vertexColors: true, flatShading: true, roughness: 1 }));
    suelo.receiveShadow = true; poner(suelo);
    if (LAGO) {
      const agua = malla(new THREE.CircleGeometry(LAGO.r + 1.5, 28), new THREE.MeshStandardMaterial({ color: 0x2db3ad, roughness: 0.25, metalness: 0.1, transparent: true, opacity: 0.92 }), LAGO.x, -0.35, LAGO.z);
      agua.rotation.x = -Math.PI / 2; poner(agua);
    }
  }
  // la vía
  const v = Object.assign({ asfalto: [0x5d6675, 0x5a6372], berma: 0xe9cf96, bordillo: [0xff6a4d, 0xfffdf7], linea: 0xfffdf7, centro: 0xf3e3b8 }, def.via || {});
  cinta(-H, H, 0.02, i => v.asfalto[i % 2]);
  cinta(-H - 3.2, -H - 1.1, 0.012, () => v.berma); cinta(H + 1.1, H + 3.2, 0.012, () => v.berma);
  cinta(-H - 1.1, -H, 0.07, i => v.bordillo[Math.floor(i / 5) % 2], { brillo: v.brillo }); cinta(H, H + 1.1, 0.07, i => v.bordillo[1 - Math.floor(i / 5) % 2], { brillo: v.brillo });
  cinta(-H + 0.35, -H + 0.6, 0.035, () => v.linea, { brillo: v.brillo }); cinta(H - 0.6, H - 0.35, 0.035, () => v.linea, { brillo: v.brillo });
  cinta(-0.15, 0.15, 0.035, i => (Math.floor(i / 6) % 2 ? null : v.centro));
  {
    const m = malla(new THREE.PlaneGeometry(ANCHO, 1.6), new THREE.MeshStandardMaterial({ map: cuadros(12, 2, 16), roughness: 0.9 }));
    m.geometry.rotateX(-Math.PI / 2); m.position.copy(P[0]).setY(0.045);
    m.rotation.y = Math.atan2(-N[0].z, N[0].x); // la anchura queda a lo largo de la normal
    m.receiveShadow = true; poner(m);
  }
  FOCO.set(CENTRO.x, 10, CENTRO.z); MONUMENTOS = [];
  def.decorado(K);
  armarNubes(def.nubes);
  armarTribuna(def.tribuna || {});
  armarMeta();
  armarBanderines(def.banderines || {});
  armarPodio();
  return true;
}

// Línea de meta a cuadros
function cuadros(nx, ny, px) {
  const c = document.createElement('canvas'); c.width = nx * px; c.height = ny * px; const x = c.getContext('2d');
  for (let i = 0; i < nx; i++) for (let j = 0; j < ny; j++) { x.fillStyle = (i + j) % 2 ? '#15304d' : '#fffdf7'; x.fillRect(i * px, j * px, px, px); }
  const t = new THREE.CanvasTexture(c); t.magFilter = THREE.NearestFilter; return t;
}
function armarNubes(color) {
  if (color === false) return;
  const n = 12, partes = 4;
  nubesMesh = inst(new THREE.IcosahedronGeometry(1, 0), new THREE.MeshLambertMaterial({ color: color || 0xffffff, emissive: 0x8a8a8a }), [], false, n * partes);
  for (let i = 0; i < n; i++) nubes.push({ x: CENTRO.x + rnd(-200, 200), y: rnd(42, 70), z: CENTRO.z + rnd(-200, 200), v: rnd(1, 2.5), b: [0, 1, 2, 3].map(k => [k * 3 - 4.5, Math.random() * 1.5, Math.random() * 2, 2.6 + Math.random() * 2.2]) });
}
function moverNubes(dt) {
  if (!nubesMesh) return;
  let k = 0;
  nubes.forEach(n => {
    n.x += n.v * dt; if (n.x > CENTRO.x + 220) n.x = CENTRO.x - 220;
    n.b.forEach(([bx, by, bz, s]) => { _o.position.set(n.x + bx, n.y + by, n.z + bz); _o.rotation.set(0, 0, 0); _o.scale.setScalar(s); _o.updateMatrix(); nubesMesh.setMatrixAt(k++, _o.matrix); });
  });
  _o.scale.setScalar(1);
  nubesMesh.instanceMatrix.needsUpdate = true;
}
/* ---------- tribuna, arco de meta, banderines, podio ---------- */
function armarTribuna(tb) {
  const gr = tb.gradas || [0xfff4dc, 0xf2e2bd], te = tb.techo || [0xff6a4d, 0xfffdf7];
  const g = new THREE.Group(); g.position.copy(TRIB_C);
  g.rotation.y = Math.atan2(-AFUERA * N[0].x, -AFUERA * N[0].z);
  // gradas, postes y techo: una sola malla (z local mira hacia la pista)
  const partes = [];
  for (let s = 0; s < 4; s++) partes.push({ g: new THREE.BoxGeometry(34, 1.1 + s * 1.1, 2.4), c: gr[s % 2], p: [0, (1.1 + s * 1.1) / 2, 3 - s * 2.4] });
  for (const x of [-16.5, 16.5]) for (const z of [-5.5, 3.6]) partes.push({ g: new THREE.CylinderGeometry(0.22, 0.22, 9, 6), c: 0xfffdf7, p: [x, 4.5, z] });
  for (let k = 0; k < 10; k++) partes.push({ g: new THREE.BoxGeometry(3.45, 0.3, 10.6), c: te[k % 2], p: [-15.5 + k * 3.45, 9.1, -1] });
  g.add(new THREE.Mesh(fusion(partes), MP(0xffffff, { vertexColors: true })));
  const n = 120, cuerpo = new THREE.InstancedMesh(new THREE.BoxGeometry(0.7, 0.9, 0.5), MP(0xffffff), n), cabeza = new THREE.InstancedMesh(new THREE.IcosahedronGeometry(0.33, 0), MP(0xffffff), n);
  const c = new THREE.Color(), ropa = [0xff6a4d, 0x0e9aa0, 0xffc23a, 0x2f9e5d, 0x15304d, 0x8e6bd8, 0xff8fb1], piel = [0xf1c27d, 0xe0ac69, 0xc68642, 0x8d5524, 0xffdbac];
  for (let i = 0; i < n; i++) {
    const s = i % 4, x = -15.5 + Math.floor(i / 4) * 1.07 + (s % 2) * 0.3;
    publico.push({ x, y: 1.1 + s * 1.1 + 0.45, z: 3 - s * 2.4, f: Math.random() * 6 });
    cuerpo.setColorAt(i, c.setHex(ropa[i % ropa.length])); cabeza.setColorAt(i, c.setHex(piel[(i * 7) % piel.length]));
  }
  cuerpo.frustumCulled = cabeza.frustumCulled = false;
  g.add(cuerpo, cabeza); publicoMesh = cuerpo; cabezasMesh = cabeza;
  poner(g, true, true);
}
function armarMeta() {
  const g = new THREE.Group(); g.position.copy(P[0]); g.rotation.y = Math.atan2(T[0].x, T[0].z);
  for (const x of [-(H + 1.6), H + 1.6]) { g.add(malla(new THREE.BoxGeometry(0.9, 7.4, 0.9), MP(0xfffdf7), x, 3.7, 0)); g.add(malla(new THREE.BoxGeometry(1.3, 0.5, 1.3), MP(0xff6a4d), x, 0.25, 0)); }
  const c = document.createElement('canvas'); c.width = 512; c.height = 96; const x = c.getContext('2d');
  for (let i = 0; i < 32; i++) for (let j = 0; j < 6; j++) { x.fillStyle = (i + j) % 2 ? '#15304d' : '#fffdf7'; x.fillRect(i * 16, j * 16, 16, 16); }
  const tex = new THREE.CanvasTexture(c);
  const letrero = () => {
    x.fillStyle = '#ff6a4d'; x.beginPath(); x.roundRect ? x.roundRect(156, 14, 200, 68, 20) : x.rect(156, 14, 200, 68); x.fill();
    x.fillStyle = '#fff'; x.font = '900 52px Grandstander, Lexend, sans-serif'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText('META', 256, 50);
    tex.needsUpdate = true;
  };
  letrero(); if (document.fonts) document.fonts.load('900 52px Grandstander').then(letrero, () => {});
  const banda = malla(new THREE.BoxGeometry(ANCHO + 4.2, 1.9, 0.5), [MP(0xfffdf7), MP(0xfffdf7), MP(0xfffdf7), MP(0xfffdf7), new THREE.MeshStandardMaterial({ map: tex }), new THREE.MeshStandardMaterial({ map: tex })], 0, 7.2, 0);
  g.add(banda);
  for (let i = 0; i < 3; i++) { const l = malla(new THREE.SphereGeometry(0.34, 10, 8), new THREE.MeshStandardMaterial({ color: 0x444b57, emissive: 0x000000 }), (i - 1) * 1.1, 5.85, 0.1); g.add(l); semaforo.push(l.material); }
  g.add(malla(new THREE.BoxGeometry(3.8, 0.9, 0.4), MP(0x15304d), 0, 5.85, 0));
  poner(g, true);
}
// banderines (o faroles, de noche) en postes a lo largo de la pista: dos mallas de instancias
function armarBanderines(b) {
  const cs = b.colores || [0xff6a4d, 0xffc23a, 0x0e9aa0, 0x2f9e5d], postes = [], cabos = [];
  for (let i = 0; i < NS; i += 36) for (const lado of [-1, 1]) {
    if ((i < 48 || i > NS - 30) && lado === AFUERA) continue;
    const p = P[i].clone().addScaledVector(N[i], lado * (H + 4.2));
    postes.push({ x: p.x, y: 1.8, z: p.z });
    cabos.push(b.farol ? { x: p.x, y: 3.75, z: p.z, c: cs[0] } : { x: p.x, y: 3.1, z: p.z, rz: -Math.PI / 2, ry: Math.random() * 6, sx: 1, sy: 1, sz: 0.25, c: cs[(i / 36 + (lado > 0 ? 1 : 0)) % cs.length] });
  }
  inst(new THREE.CylinderGeometry(0.07, 0.07, 3.6, 5), MP(b.poste || 0xfffdf7), postes);
  if (b.farol) inst(new THREE.SphereGeometry(0.42, 10, 8), new THREE.MeshBasicMaterial({ color: 0xffffff }), cabos, false);
  else inst(new THREE.ConeGeometry(0.5, 1.4, 3), MP(0xffffff), cabos);
}
function armarPodio() {
  podio = new THREE.Group(); podio.position.copy(PODIO_C); podio.rotation.y = Math.atan2(N[0].x, N[0].z) + (AFUERA > 0 ? Math.PI : 0);
  const alto = [1.8, 1.25, 0.8], xs = [0, -3.2, 3.2], cols = [0xffc23a, 0xd9dde3, 0xe8a06a];
  for (let i = 0; i < 3; i++) {
    const c = document.createElement('canvas'); c.width = 128; c.height = 128; const x = c.getContext('2d');
    const tx = new THREE.CanvasTexture(c);
    const num = () => { x.fillStyle = hex(cols[i]); x.fillRect(0, 0, 128, 128); x.fillStyle = '#15304d'; x.font = '900 80px Grandstander, sans-serif'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(String(i + 1), 64, 70); tx.needsUpdate = true; };
    num(); if (document.fonts) document.fonts.load('900 80px Grandstander').then(num, () => {});
    const caraM = new THREE.MeshStandardMaterial({ map: tx, flatShading: true });
    const m = MP(cols[i]);
    podio.add(malla(new THREE.BoxGeometry(3.1, alto[i], 2.9), [m, m, m, m, caraM, m], xs[i], alto[i] / 2, 0));
  }
  podio.add(malla(new THREE.CylinderGeometry(6.6, 6.9, 0.25, 22), MP(0xfff4dc), 0, 0.1, 0));
  podio.userData = { alto, xs };
  poner(podio, true, true);
}

/* ---------- corredores ---------- */
const ANIMALES = {
  gato: { nombre: 'Gato', piel: 0xf4a259, claro: 0xfff1dc, orejas: 'punta' },
  oso: { nombre: 'Oso', piel: 0x9a6a3c, claro: 0xe3c49b, orejas: 'redondas' },
  conejo: { nombre: 'Conejo', piel: 0xf3f0ea, claro: 0xffd5df, orejas: 'largas' },
  perro: { nombre: 'Perro', piel: 0xe0b07a, claro: 0xfff4dc, orejas: 'caidas' },
  zorro: { nombre: 'Zorro', piel: 0xff7a3d, claro: 0xfffdf7, orejas: 'grandes' },
  rana: { nombre: 'Rana', piel: 0x6cc04a, claro: 0xdaf5b0, orejas: 'ojos' }
};
const COLORES = [0x0e9aa0, 0xffc23a, 0x2f9e5d, 0x8e6bd8, 0xff8fb1, 0x3d7bd9, 0x15304d];
const GEO = {
  chasis: new THREE.BoxGeometry(1.5, 0.42, 2.3), nariz: new THREE.BoxGeometry(1.0, 0.32, 0.9), defensa: new THREE.BoxGeometry(1.8, 0.24, 0.32),
  pod: new THREE.BoxGeometry(0.34, 0.36, 1.3), respaldo: new THREE.BoxGeometry(1.0, 0.75, 0.24), aleron: new THREE.BoxGeometry(1.8, 0.12, 0.5), palo: new THREE.BoxGeometry(0.1, 0.45, 0.1),
  rueda: new THREE.CylinderGeometry(0.42, 0.42, 0.36, 12).rotateZ(Math.PI / 2), rin: new THREE.CylinderGeometry(0.2, 0.2, 0.38, 6).rotateZ(Math.PI / 2),
  volante: new THREE.TorusGeometry(0.22, 0.05, 5, 12), tubo: new THREE.CylinderGeometry(0.1, 0.12, 0.4, 7).rotateX(Math.PI / 2), llama: new THREE.ConeGeometry(0.17, 0.8, 7).rotateX(-Math.PI / 2).translate(0, 0, -0.4),
  torso: new THREE.IcosahedronGeometry(0.42, 1), cabeza: new THREE.IcosahedronGeometry(0.5, 1), hocico: new THREE.SphereGeometry(0.22, 8, 6), ojo: new THREE.SphereGeometry(0.075, 6, 5),
  oreja: new THREE.ConeGeometry(0.18, 0.4, 4), orejaR: new THREE.SphereGeometry(0.16, 7, 5), orejaL: new THREE.CylinderGeometry(0.1, 0.13, 0.75, 6), orejaC: new THREE.BoxGeometry(0.14, 0.42, 0.26),
  bufanda: new THREE.TorusGeometry(0.3, 0.09, 5, 12)
};
const MLLAMA = new THREE.MeshBasicMaterial({ color: 0xffb02e });
function crearKart(color, animal) {
  const A = ANIMALES[animal] || ANIMALES.gato, g = new THREE.Group(), cuerpo = new THREE.Group(); g.add(cuerpo);
  const mc = M(color), osc = M(0x2a3242), bl = M(0xfffdf7), piel = M(A.piel), claro = M(A.claro), negro = M(0x15182a, { roughness: 0.4 });
  cuerpo.add(malla(GEO.chasis, mc, 0, 0.5, 0), malla(GEO.nariz, mc, 0, 0.48, 1.5), malla(GEO.defensa, osc, 0, 0.38, 1.95));
  cuerpo.add(malla(GEO.pod, bl, -0.88, 0.46, 0.1), malla(GEO.pod, bl, 0.88, 0.46, 0.1), malla(GEO.respaldo, osc, 0, 0.98, -0.62));
  cuerpo.add(malla(GEO.aleron, mc, 0, 1.32, -1.22), malla(GEO.palo, osc, -0.5, 1.05, -1.22), malla(GEO.palo, osc, 0.5, 1.05, -1.22));
  const vol = malla(GEO.volante, osc, 0, 1.0, 0.5); vol.rotation.x = -0.9; cuerpo.add(vol);
  const ruedas = [];
  for (const [x, z] of [[-0.92, 0.85], [0.92, 0.85], [-0.92, -0.85], [0.92, -0.85]]) { const r = malla(GEO.rueda, osc, x, 0.42, z); r.add(malla(GEO.rin, bl, 0, 0, 0)); g.add(r); ruedas.push(r); }
  const llamas = [];
  for (const x of [-0.35, 0.35]) { cuerpo.add(malla(GEO.tubo, osc, x, 0.5, -1.3)); const l = malla(GEO.llama, MLLAMA, x, 0.5, -1.45); l.visible = false; cuerpo.add(l); llamas.push(l); }
  // piloto
  const a = new THREE.Group(); a.position.set(0, 0.72, -0.25); cuerpo.add(a);
  const torso = malla(GEO.torso, piel, 0, 0.32, 0); torso.scale.set(1, 1.05, 0.9); a.add(torso);
  const buf = malla(GEO.bufanda, M(0xffc23a), 0, 0.62, 0.02); buf.rotation.x = Math.PI / 2; a.add(buf);
  const cab = new THREE.Group(); cab.position.set(0, 1.08, 0.05); a.add(cab);
  cab.add(malla(GEO.cabeza, piel, 0, 0, 0));
  const h = malla(GEO.hocico, claro, 0, -0.1, 0.4); h.scale.set(1.25, 0.85, 0.8); cab.add(h);
  cab.add(malla(GEO.ojo, negro, 0, -0.02, 0.58));
  if (A.orejas === 'ojos') {
    for (const x of [-0.22, 0.22]) { cab.add(malla(GEO.hocico, bl, x, 0.38, 0.18)); cab.add(malla(GEO.ojo, negro, x, 0.42, 0.37)); }
    h.scale.set(1.7, 0.6, 0.7);
  } else {
    for (const x of [-0.19, 0.19]) cab.add(malla(GEO.ojo, negro, x, 0.1, 0.43));
    for (const s of [-1, 1]) {
      let o;
      if (A.orejas === 'punta') { o = malla(GEO.oreja, piel, s * 0.28, 0.45, 0); o.rotation.z = -s * 0.35; }
      else if (A.orejas === 'grandes') { o = malla(GEO.oreja, piel, s * 0.3, 0.5, 0); o.scale.set(1.3, 1.4, 1); o.rotation.z = -s * 0.3; }
      else if (A.orejas === 'redondas') { o = malla(GEO.orejaR, piel, s * 0.36, 0.38, -0.02); }
      else if (A.orejas === 'largas') { o = malla(GEO.orejaL, piel, s * 0.17, 0.75, -0.05); o.rotation.z = -s * 0.15; }
      else { o = malla(GEO.orejaC, M(0x9a6a3c), s * 0.5, 0.05, 0); o.rotation.z = s * 0.25; }
      cab.add(o);
    }
  }
  sombra(g);
  llamas.forEach(l => { l.castShadow = false; });
  return { g, cuerpo, ruedas, llamas, cab };
}
function etiqueta(r) {
  const c = document.createElement('canvas'); c.width = 320; c.height = 88; const x = c.getContext('2d');
  const nom = r.nombre.split(' ')[0];
  x.font = '700 34px Lexend, sans-serif'; const w = Math.min(320, 88 + x.measureText(nom).width + 22);
  x.fillStyle = 'rgba(255,253,247,.96)'; x.beginPath(); (x.roundRect ? x.roundRect((320 - w) / 2, 8, w, 72, 36) : x.rect((320 - w) / 2, 8, w, 72)); x.fill();
  x.fillStyle = hex(r.color); x.beginPath(); x.arc((320 - w) / 2 + 44, 44, 30, 0, 7); x.fill();
  x.fillStyle = '#fff'; x.font = '700 24px Lexend, sans-serif'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(r.iniciales, (320 - w) / 2 + 44, 45);
  x.fillStyle = '#15304d'; x.font = '700 34px Lexend, sans-serif'; x.textAlign = 'left'; x.fillText(nom, (320 - w) / 2 + 84, 46);
  const t = new THREE.CanvasTexture(c); t.minFilter = THREE.LinearFilter;
  const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: t, depthWrite: false })); s.scale.set(3.6, 1, 1); s.position.y = 3.3; s.renderOrder = 2;
  return s;
}

/* ---------- partículas ---------- */
const polvo = [], confeti = [];
{
  const g = new THREE.IcosahedronGeometry(0.28, 0), m = new THREE.MeshLambertMaterial({ color: 0xfff4dc });
  for (let i = 0; i < 60; i++) { const p = new THREE.Mesh(g, m); p.visible = false; scene.add(p); polvo.push({ m: p, v: new V3(), t: 0 }); }
  const gc = new THREE.PlaneGeometry(0.28, 0.42), cs = [0xff6a4d, 0xffc23a, 0x0e9aa0, 0x2f9e5d, 0xfffdf7, 0x8e6bd8].map(c => new THREE.MeshBasicMaterial({ color: c, side: THREE.DoubleSide }));
  for (let i = 0; i < 110; i++) { const p = new THREE.Mesh(gc, cs[i % cs.length]); p.visible = false; scene.add(p); confeti.push({ m: p, v: new V3(), w: new V3(), t: 0 }); }
}
let polvoI = 0;
function soltarPolvo(pos, fuerza) {
  const q = polvo[polvoI++ % polvo.length]; q.m.visible = true; q.m.position.copy(pos); q.t = 0.6;
  q.v.set(rnd(-1, 1), rnd(0.6, 1.4) * fuerza, rnd(-1, 1)); q.m.scale.setScalar(rnd(0.35, 0.7) * fuerza);
}
function lanzarConfeti(centro) {
  confeti.forEach(q => { q.m.visible = true; q.m.position.set(centro.x + rnd(-4, 4), centro.y + rnd(6, 11), centro.z + rnd(-4, 4)); q.v.set(rnd(-2, 2), rnd(-1, 3), rnd(-2, 2)); q.w.set(rnd(-6, 6), rnd(-6, 6), rnd(-6, 6)); q.t = rnd(4, 7); });
}
// chispas de un golpe (estrellitas que saltan)
const chispas = [];
{
  const g = new THREE.OctahedronGeometry(0.2, 0), cs = [0xffc23a, 0xffe27a, 0xfffdf7, 0xff6a4d].map(c => new THREE.MeshBasicMaterial({ color: c }));
  const ce = new THREE.MeshBasicMaterial({ color: 0x8fe3e6 });
  for (let i = 0; i < 48; i++) { const p = new THREE.Mesh(g, i % 6 === 5 ? ce : cs[i % cs.length]); p.visible = false; scene.add(p); chispas.push({ m: p, v: new V3(), t: 0 }); }
}
let chispaI = 0;
function soltarChispas(pos, n, azul) {
  for (let k = 0; k < n; k++) {
    let q = chispas[chispaI++ % chispas.length];
    if (azul) { const j = chispas.findIndex((c, i) => i % 6 === 5 && c.t <= 0); if (j >= 0) q = chispas[j]; }
    q.m.visible = true; q.m.position.set(pos.x, pos.y + 1.2, pos.z); q.t = rnd(0.5, 0.9);
    const a = rnd(0, 6.28), s = rnd(3, 7); q.v.set(Math.cos(a) * s, rnd(3, 7), Math.sin(a) * s); q.m.scale.setScalar(rnd(0.8, 1.5));
  }
}

/* ---------- estado de la carrera ---------- */
const CARRILES = [-4.25, -2.55, -0.85, 0.85, 2.55, 4.25, -3.4, 3.4], CARRILES_SALIDA = [-0.85, 0.85, -2.55, 2.55, -4.25, 4.25, -3.4, 3.4];
const BASE = 8.6, TURBO = 8.5, TOPE_TURBO = 20;
const J = {
  fase: 'menu', modo: prog.modo === 'lectura' ? 'lectura' : 'tablas', tabla: prog.tabla || 7,
  lectura: D.lecturas.some(l => l.id === prog.lectura) ? prog.lectura : D.lecturas[0].id,
  animal: ANIMALES[prog.animal] ? prog.animal : 'zorro',
  corredores: [], yo: null, total: 0, tiempo: 0, aciertos: 0, errores: 0, racha: 0, pausa: false,
  pregunta: null, bloqueo: false, cola: [], ultimas: [], externos: {}, plantilla: null, resultado: null, ultimaVuelta: false,
  red: null, redLista: [], redYo: null, cargaRed: 0, usando: 0,
  sel: { modo: 'una', pista: pistaDef(prog.pista).id, lista: [] }, torneo: null, torneoRed: null
};
let red = null; // el control de la sala (multijugador.js), sólo cuando se eligió jugar con el grupo
const rec = r => r.d - (r.d0 || 0); // lo recorrido: en sala cada uno cuenta desde su casilla de salida
const CARRILES_RED = [-4.25, -2.55, -0.85, 0.85, 2.55, 4.25];

function limpiarCorredores() { J.corredores.forEach(r => { scene.remove(r.k.g); r.k.g.traverse(o => { if (o.isSprite) { o.material.map.dispose(); o.material.dispose(); } }); }); J.corredores = []; }
function armarCorredores() {
  limpiarCorredores();
  if (J.red) { armarRed(); return; }
  const lista = (J.plantilla || D.rivales).slice(0, 7).map(r => Object.assign({}, r));
  // animales sin repetir con el del jugador
  const libres = Object.keys(ANIMALES).filter(a => a !== J.animal && !lista.some(r => r.animal === a));
  lista.forEach(r => { if (!ANIMALES[r.animal] || r.animal === J.animal) r.animal = libres.shift() || 'gato'; });
  Object.keys(J.externos).forEach(id => { if (!lista.some(r => r.id === id) && lista.length < 7) lista.push(Object.assign({ id, nombre: id, iniciales: id.slice(0, 2).toUpperCase(), animal: pick(Object.keys(ANIMALES)) }, J.externos[id].info || {})); });
  const yo = { id: 'yo', nombre: 'Tú', iniciales: 'TÚ', animal: J.animal, color: new THREE.Color(colegio).getHex(), yo: true };
  const todos = lista.slice(); todos.splice(Math.min(2, todos.length), 0, yo);
  const sim = D.simulacion[J.modo];
  todos.forEach((r, i) => {
    r.color = r.yo ? r.color : COLORES[i % COLORES.length];
    r.carril = CARRILES_SALIDA[i];
    r.d = -3 - Math.floor(i / 2) * 5; r.d0 = 0; r.v = 0; r.turbo = 0; r.lento = 0; r.llegada = null; r.bam = 0; r.yaw = 0; r.usarEn = 0; r.paciencia = 0;
    r.acierto = rnd(sim.acierto[0], sim.acierto[1]); r.prox = rnd(sim.cada[0], sim.cada[1]) + 1;
    const ext = J.externos[r.id]; r.externo = !!ext; r.objetivo = ext ? ext.avance : 0;
    r.k = crearKart(r.color, r.animal); r.k.et = etiqueta(r); r.k.g.add(r.k.et); if (r.yo) r.k.et.visible = false;
    scene.add(r.k.g);
  });
  J.corredores = todos; J.yo = yo;
  colocar(0);
}
// En sala, los corredores son los alumnos (el tablero no tiene «yo»). Seis por fila; la salida de atrás se compensa con d0.
// Los nombres de myvc suelen venir en MAYÚSCULAS: en pantalla se leen mejor como nombre propio.
const bonito = n => { n = String(n || '').trim(); return n && n === n.toUpperCase() ? n.toLowerCase().replace(/(^|[\s-])(\p{L})/gu, (m, a, b) => a + b.toUpperCase()) : n; };
const inicialesDe = n => String(n || '?').trim().split(/\s+/).slice(0, 2).map(p => p.charAt(0)).join('').toUpperCase() || '?';
function nuevoRed(p, i) {
  const yo = J.red === 'alumno' && p.id === J.redYo;
  const r = { id: yo ? 'yo' : p.id, uid: p.id, nombre: yo ? 'Tú' : bonito(p.nombre), completo: bonito(p.nombre), iniciales: yo ? 'TÚ' : inicialesDe(p.nombre), foto: p.foto || null, animal: ANIMALES[p.animal] ? p.animal : 'zorro', yo, humano: true, externo: J.red === 'alumno' };
  r.color = yo ? new THREE.Color(colegio).getHex() : COLORES[(p.c != null ? p.c : i) % COLORES.length];
  r.carril = p.carril != null ? p.carril : CARRILES_RED[i % 6];
  r.d0 = p.d0 != null ? p.d0 : -3 - Math.floor(i / 6) * 3.4;
  Object.assign(r, { d: r.d0, v: 0, turbo: 0, lento: 0, llegada: null, yaw: 0, usarEn: 0, paciencia: 0, racha: 0, red: null, fuera: false });
  r.k = crearKart(r.color, r.animal); r.k.et = etiqueta(r); r.k.g.add(r.k.et); if (yo) r.k.et.visible = false;
  scene.add(r.k.g);
  return r;
}
function armarRed() {
  J.corredores = J.redLista.map(nuevoRed);
  J.yo = J.corredores.find(r => r.yo) || null;
  colocar(0);
}
function orden() {
  return J.corredores.slice().sort((a, b) => {
    if (a.llegada != null && b.llegada != null) return a.llegada - b.llegada;
    if (a.llegada != null) return -1; if (b.llegada != null) return 1;
    return rec(b) - rec(a);
  });
}

/* ---------- sonido: lo sintetiza sonido.js; aquí se decide cuándo y se guardan los ajustes (prog.sonido) ---------- */
const SN = window.SonidoCarrera ? window.SonidoCarrera.crear({ Contexto: window.AudioContext || window.webkitAudioContext }) : null;
const suena = (n, o) => { if (SN) SN.efecto(n, o); };
// mudo; música y efectos de 0 a 1. En sala el alumno arranca con la música apagada (musicaSala) y la enciende si quiere.
const AJ = Object.assign({ mudo: false, musica: 0.6, efectos: 0.8, musicaSala: 0 }, prog.sonido || {});
const musicaAhora = () => (J.red === 'alumno' ? AJ.musicaSala : AJ.musica);
function ajustarSonido(o, guardar) {
  Object.assign(AJ, o || {});
  if (SN) SN.ajustes({ mudo: AJ.mudo, musica: musicaAhora(), efectos: AJ.efectos });
  document.querySelectorAll('.bson').forEach(b => { b.setAttribute('aria-pressed', String(AJ.mudo)); b.setAttribute('aria-label', AJ.mudo ? 'Activar el sonido' : 'Silenciar'); b.innerHTML = ALTAVOZ(AJ.mudo); });
  document.querySelectorAll('.sonido input').forEach(i => { i.value = Math.round((i.dataset.k === 'musica' ? musicaAhora() : AJ.efectos) * 100); });
  if (guardar) { prog.sonido = { mudo: AJ.mudo, musica: AJ.musica, efectos: AJ.efectos, musicaSala: AJ.musicaSala }; guardarP(prog); }
}
const ALTAVOZ = mudo => '<svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4z" fill="currentColor" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/>' +
  (mudo ? '<path d="M15.5 9.5l5 5m0-5l-5 5" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/>' : '<path d="M15.5 9a4.2 4.2 0 0 1 0 6M18 6.5a7.6 7.6 0 0 1 0 11" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>') + '</svg>';
function alternarMudo() { ajustarSonido({ mudo: !AJ.mudo }, true); if (!AJ.mudo) suena('clic'); }
// El menú y la pausa llevan el altavoz y un deslizador para la música y otro para los efectos; el HUD, sólo el altavoz.
function construirSonido(caja) {
  caja.innerHTML = (caja.dataset.sonido === 'sin-boton' ? '' : '<button class="hb bson" type="button"></button>') +
    '<label class="sdes"><span>Música</span><input type="range" min="0" max="100" step="5" data-k="musica" aria-label="Volumen de la música"></label>' +
    '<label class="sdes"><span>Efectos</span><input type="range" min="0" max="100" step="5" data-k="efectos" aria-label="Volumen de los efectos"></label>';
  if (caja.querySelector('.bson')) caja.querySelector('.bson').addEventListener('click', alternarMudo);
  caja.querySelectorAll('input').forEach(i => {
    const val = () => { const v = +i.value / 100, o = { mudo: false }; o[i.dataset.k === 'musica' ? (J.red === 'alumno' ? 'musicaSala' : 'musica') : 'efectos'] = v; return o; };
    i.addEventListener('input', () => ajustarSonido(val(), false));
    i.addEventListener('change', () => { ajustarSonido(val(), true); if (i.dataset.k === 'efectos') suena('clic'); });
  });
}
document.querySelectorAll('[data-sonido]').forEach(construirSonido);
$('bSonido').addEventListener('click', alternarMudo); $('bSonidoM').addEventListener('click', alternarMudo);
ajustarSonido();
// Autoplay: el contexto nace o se reanuda en un gesto de verdad (sin activación Chrome lo deja suspendido y avisa).
['pointerdown', 'pointerup', 'touchend', 'keydown', 'click'].forEach(e => addEventListener(e, () => {
  if (!SN || (navigator.userActivation && !navigator.userActivation.isActive)) return;
  SN.despertar();
}, true));
// Los clics del menú (las respuestas, el poder y el altavoz suenan aparte).
document.addEventListener('click', e => {
  const b = e.target.closest && e.target.closest('button, a, .chip, .modo, .ani');
  if (b && !b.closest('#ops, #bPoder, .bson, #bSonido')) suena('clic');
}, true);
// Cada cuadro: música según la fase y la pista, motor del jugador, chapoteo en Caño Cristales, silencio en pausa.
let finSonT = 0, enAgua = false, aguaT = 0, vueltaSon = 1, redSon = null;
function sonar(dt) {
  if (!SN) return;
  if (J.red !== redSon) { redSon = J.red; ajustarSonido(); } // al entrar o salir de la sala cambia de qué música se habla
  SN.silencio('pausa', J.pausa);
  finSonT = J.fase === 'fin' ? finSonT + dt : 0;
  const intro = J.fase === 'cuenta' && cuentaT < 0;
  const modo = J.fase === 'carrera' ? 'alegre' : J.fase === 'menu' || J.fase === 'leer' || J.fase === 'vista' || intro || finSonT > 4.5 ? 'tranquila' : null;
  SN.musica(modo, PISTA ? PISTA.id : 'valle');
  const yo = J.yo, corre = yo && !J.pausa && (J.fase === 'carrera' || (J.fase === 'cuenta' && !intro));
  const agua = !!(corre && J.fase === 'carrera' && yo.chapoteo > 0);
  if (agua && !enAgua) { suena('agua'); aguaT = 0.32; }
  else if (agua && (aguaT -= dt) <= 0) { aguaT = 0.32; suena('agua', { chico: true }); }
  enAgua = agua;
  SN.motor(corre ? { v: J.fase === 'carrera' ? yo.v : 0, turbo: yo.turbo, agua } : null);
  SN.paso();
}
/* ---------- poderes: las reglas son de poderes.js; aquí se dibujan y se conectan con la carrera ---------- */
const DP = D.poderes || {};
const PZ = window.PoderesCarrera && DP.activos !== false ? window.PoderesCarrera.crear(DP) : null;
const NOMBRE_P = Object.assign({ banana: 'Cáscara de banano', caparazon: 'Caparazón', escudo: 'Burbuja', cohete: 'Cohete', alas: 'Alas', estrella: 'Estrella', iman: 'Imán', nube: 'Nube', fantasma: 'Fantasma' }, DP.nombres || {});
const PROPIOS = ['alas', 'estrella', 'fantasma', 'iman'];
const AYUDA_P = DP.ayuda || {};
const TRAZO = 'stroke="#15304d" stroke-width="2.5" stroke-linejoin="round"';
const ICONO = {
  banana: '<svg viewBox="0 0 48 48"><path d="M11 13c1 15 11 25 27 24 3 0 4-3 1-4-12-2-19-10-22-21-1-3-6-2-6 1z" fill="#ffd84a" ' + TRAZO + '/><path d="M17 15c2 9 7 15 15 18" fill="none" stroke="#e8a72a" stroke-width="2.5" stroke-linecap="round"/><path d="M11 13l-3-4 4-2 3 4z" fill="#8a5a2b" ' + TRAZO + '/></svg>',
  caparazon: '<svg viewBox="0 0 48 48"><path d="M7 31a17 16 0 0 1 34 0z" fill="#2f9e5d" ' + TRAZO + '/><path d="M19 22l5-3 5 3v5l-5 3-5-3z" fill="#8fdc8f" ' + TRAZO + '/><path d="M12 28l2-6M36 28l-2-6" stroke="#15304d" stroke-width="2.5" stroke-linecap="round"/><rect x="5" y="30" width="38" height="8" rx="4" fill="#fffdf7" ' + TRAZO + '/></svg>',
  escudo: '<svg viewBox="0 0 48 48"><circle cx="24" cy="24" r="18" fill="#bdf0f2" stroke="#0e9aa0" stroke-width="3.5"/><path d="M14 19a11 11 0 0 1 9-7" fill="none" stroke="#fff" stroke-width="4" stroke-linecap="round"/><path d="M24 15l7 3v6c0 5-3 8-7 10-4-2-7-5-7-10v-6z" fill="#0e9aa0" ' + TRAZO + '/></svg>',
  cohete: '<svg viewBox="0 0 48 48"><path d="M20 33c0 6 2 9 4 11 2-2 4-5 4-11z" fill="#ffc23a" ' + TRAZO + '/><path d="M24 4c7 6 9 16 6 27H18c-3-11-1-21 6-27z" fill="#fffdf7" ' + TRAZO + '/><circle cx="24" cy="17" r="4" fill="#0e9aa0" ' + TRAZO + '/><path d="M18 24l-7 8h8zM30 24l7 8h-8z" fill="#ff6a4d" ' + TRAZO + '/></svg>',
  alas: '<svg viewBox="0 0 48 48"><path d="M24 31C19 20 11 15 3 15c2 9 9 16 21 16z" fill="#fffdf7" ' + TRAZO + '/><path d="M24 31c5-11 13-16 21-16-2 9-9 16-21 16z" fill="#fffdf7" ' + TRAZO + '/><path d="M9 19c4 1 7 4 9 7M39 19c-4 1-7 4-9 7" stroke="#0e9aa0" stroke-width="2.5" fill="none" stroke-linecap="round"/><circle cx="24" cy="32" r="5.5" fill="#ff6a4d" ' + TRAZO + '/></svg>',
  estrella: '<svg viewBox="0 0 48 48"><path d="M24 4l5.9 12 13.1 1.9-9.5 9.3 2.3 13.1L24 34l-11.8 6.3 2.3-13.1L5 17.9l13.1-1.9z" fill="#ffd84a" ' + TRAZO + '/><circle cx="19.5" cy="21" r="2" fill="#15304d"/><circle cx="28.5" cy="21" r="2" fill="#15304d"/><path d="M20 26.5c2.2 2 5.8 2 8 0" stroke="#15304d" stroke-width="2.2" fill="none" stroke-linecap="round"/></svg>',
  iman: '<svg viewBox="0 0 48 48"><path d="M11 7v17a13 13 0 0 0 26 0V7h-8.5v17a4.5 4.5 0 0 1-9 0V7z" fill="#ff6a4d" ' + TRAZO + '/><path d="M11 7h8.5v7H11zM28.5 7H37v7h-8.5z" fill="#e8edf3" ' + TRAZO + '/><path d="M5 42l4-3.5M43 42l-4-3.5M24 46v-4" stroke="#0e9aa0" stroke-width="2.6" stroke-linecap="round"/></svg>',
  nube: '<svg viewBox="0 0 48 48"><path d="M13 31a7.5 7.5 0 0 1 .5-15 10.5 10.5 0 0 1 20-2.5A8.5 8.5 0 0 1 35 31z" fill="#c9d3e3" ' + TRAZO + '/><path d="M16 36l-2 6M24 36l-2 6M32 36l-2 6" stroke="#3d7bd9" stroke-width="2.8" stroke-linecap="round"/></svg>',
  fantasma: '<svg viewBox="0 0 48 48"><path d="M10 41V22a14 14 0 0 1 28 0v19l-4.7-3-4.6 3-4.7-3-4.7 3-4.6-3z" fill="#fffdf7" ' + TRAZO + '/><ellipse cx="19" cy="22" rx="2.6" ry="3.4" fill="#15304d"/><ellipse cx="29" cy="22" rx="2.6" ry="3.4" fill="#15304d"/><path d="M21 30c2 1.6 4 1.6 6 0" stroke="#15304d" stroke-width="2" fill="none" stroke-linecap="round"/></svg>',
  vacio: '<svg viewBox="0 0 48 48"><rect x="7" y="7" width="34" height="34" rx="10" fill="#fffdf7" stroke="#15304d" stroke-width="2.5" stroke-dasharray="5 4"/><path d="M19 19a5 5 0 1 1 7 5c-2 1-2 2-2 4" fill="none" stroke="#15304d" stroke-width="3" stroke-linecap="round"/><circle cx="24" cy="34" r="2" fill="#15304d"/></svg>'
};
const GEO_P = {
  banana: new THREE.TorusGeometry(0.5, 0.17, 6, 12, Math.PI * 1.15), punta: new THREE.SphereGeometry(0.1, 6, 4),
  domo: new THREE.SphereGeometry(0.66, 10, 5, 0, Math.PI * 2, 0, Math.PI / 2), aro: new THREE.TorusGeometry(0.66, 0.13, 6, 18),
  hexa: new THREE.CylinderGeometry(0.17, 0.17, 0.08, 6), burbuja: new THREE.IcosahedronGeometry(2, 2), estrella: new THREE.OctahedronGeometry(0.22, 0)
};
const MBURBUJA = new THREE.MeshStandardMaterial({ color: 0x8fe3e6, emissive: 0x0e9aa0, emissiveIntensity: 0.35, transparent: true, opacity: 0.3, roughness: 0.2, flatShading: true, depthWrite: false });
const MBURBUJA2 = new THREE.MeshBasicMaterial({ color: 0xffffff, wireframe: true, transparent: true, opacity: 0.22, depthWrite: false });
const MESTRELLA = new THREE.MeshBasicMaterial({ color: 0xffd84a });
// recompensas: alas, aura de estrella, imán con su rayo, nube con lluvia (todo sin luces; se crea la primera vez en cada kart)
const GEO_R = {
  pluma: new THREE.ConeGeometry(0.34, 1.9, 4).rotateZ(-Math.PI / 2).translate(0.95, 0, 0), aura: new THREE.IcosahedronGeometry(1.9, 1),
  herradura: new THREE.TorusGeometry(0.42, 0.15, 6, 12, Math.PI), punta: new THREE.BoxGeometry(0.3, 0.26, 0.3), rayo: new THREE.BoxGeometry(0.1, 0.1, 1),
  copo: new THREE.IcosahedronGeometry(0.62, 0), gota: new THREE.BoxGeometry(0.05, 0.42, 0.05)
};
const MR = {
  pluma: new THREE.MeshBasicMaterial({ color: 0xffffff }), pluma2: new THREE.MeshBasicMaterial({ color: 0xbfeaf0 }),
  aura: new THREE.MeshBasicMaterial({ color: 0xffd84a, transparent: true, opacity: 0.22, depthWrite: false, blending: THREE.AdditiveBlending }),
  iman: new THREE.MeshStandardMaterial({ color: 0xff3b2b, flatShading: true, roughness: 0.5 }), punta: new THREE.MeshStandardMaterial({ color: 0xe8edf3, flatShading: true }),
  rayo: new THREE.MeshBasicMaterial({ color: 0xff7ac8, transparent: true, opacity: 0.55, depthWrite: false }),
  nube: new THREE.MeshLambertMaterial({ color: 0xc3cddd, emissive: 0x4a5566 }), gota: new THREE.MeshBasicMaterial({ color: 0x6fb7ff })
};
const fantasmas = new Map(); // material de siempre → su copia transparente (compartida)
function crearAlas() {
  const g = new THREE.Group(); g.position.set(0, 0.95, -0.3);
  for (const s of [-1, 1]) {
    const ala = new THREE.Group(); ala.position.x = s * 0.7; ala.scale.x = s;
    [[0, 1, 0.25], [0.32, 0.86, 0], [0.6, 0.7, -0.25]].forEach(([z, l, rz], i) => { const p = new THREE.Mesh(GEO_R.pluma, i === 1 ? MR.pluma2 : MR.pluma); p.position.z = -z; p.scale.set(l * 1.25, 1, 0.3); p.rotation.z = rz; ala.add(p); });
    g.add(ala);
  }
  return g;
}
function crearAura() {
  const g = new THREE.Group(); g.position.y = 1.1;
  const a = new THREE.Mesh(GEO_R.aura, MR.aura); a.scale.set(1, 0.8, 1.3); g.add(a);
  for (let i = 0; i < 5; i++) { const e = malla(GEO_P.estrella, MESTRELLA, 0, 0, 0); e.userData.i = i; g.add(e); }
  return g;
}
function crearIman() {
  const g = new THREE.Group(), h = new THREE.Group(); h.position.set(0, 2.5, 1.6); h.scale.setScalar(1.5); g.add(h); g.userData.h = h;
  h.add(new THREE.Mesh(GEO_R.herradura, MR.iman)); // un ∩ que se ve de frente desde la cámara, con las puntas plateadas abajo
  for (const x of [-0.42, 0.42]) h.add(malla(GEO_R.punta, MR.punta, x, -0.1, 0));
  const r = new THREE.Mesh(GEO_R.rayo, MR.rayo); r.position.y = 2.3; g.add(r); g.userData.r = r;
  return g;
}
function crearNube() {
  const g = new THREE.Group(); g.position.y = 3.6;
  [[0, 0, 0, 1], [-0.75, -0.1, 0.1, 0.75], [0.75, -0.12, -0.05, 0.8], [0.2, 0.3, -0.2, 0.7]].forEach(([x, y, z, s]) => { const c = malla(GEO_R.copo, MR.nube, x, y, z); c.scale.setScalar(s); g.add(c); });
  for (let i = 0; i < 9; i++) { const d = malla(GEO_R.gota, MR.gota, (i % 3 - 1) * 0.55 + (i * 0.37 % 0.3), 0, (Math.floor(i / 3) - 1) * 0.45); d.userData.f = i / 9; g.add(d); }
  return g;
}
// Fantasma: el kart se vuelve transparente cambiando sus materiales por copias (los de siempre se comparten entre karts).
function ponerFantasma(k, si) {
  if (!!k.esFantasma === si) return;
  k.esFantasma = si;
  const cambiar = o => {
    if (!o.isMesh) return;
    if (si) {
      o.userData.mat0 = o.material;
      let c = fantasmas.get(o.material);
      if (!c) { c = o.material.clone(); c.transparent = true; c.opacity = 0.32; c.depthWrite = false; fantasmas.set(o.material, c); }
      o.material = c;
    } else if (o.userData.mat0) { o.material = o.userData.mat0; o.userData.mat0 = null; }
  };
  k.cuerpo.traverse(cambiar); k.ruedas.forEach(w => w.traverse(cambiar));
}
// Quita los efectos de recompensas de un kart (al llegar al podio o al terminar).
function limpiarFx(k) { ['alas', 'aura', 'imanFx', 'nubeFx'].forEach(n => { if (k[n]) k[n].visible = false; }); ponerFantasma(k, false); }
function crearBanana() {
  const g = new THREE.Group(), b = malla(GEO_P.banana, M(0xffd84a), 0, 0.22, 0);
  b.rotation.set(-Math.PI / 2 + 0.35, 0, -Math.PI * 0.55); b.scale.setScalar(1.3);
  b.add(malla(GEO_P.punta, M(0x8a5a2b), 0.5, 0, 0), malla(GEO_P.punta, M(0x8a5a2b), 0.5 * Math.cos(Math.PI * 1.15), 0.5 * Math.sin(Math.PI * 1.15), 0));
  g.add(b); return sombra(g);
}
function crearCaparazon() {
  const g = new THREE.Group(), c = new THREE.Group(); g.add(c); g.userData.giro = c;
  c.add(malla(GEO_P.domo, M(0x2f9e5d), 0, 0.2, 0));
  const aro = malla(GEO_P.aro, M(0xfffdf7), 0, 0.2, 0); aro.rotation.x = Math.PI / 2; c.add(aro);
  c.add(malla(GEO_P.hexa, M(0x8fdc8f), 0, 0.86, 0));
  for (let i = 0; i < 6; i++) {
    const a = i / 6 * Math.PI * 2, h = malla(GEO_P.hexa, M(0x8fdc8f), Math.cos(a) * 0.5, 0.62, Math.sin(a) * 0.5);
    h.lookAt(0, 0.2, 0); h.rotateX(Math.PI / 2); c.add(h);
  }
  g.scale.setScalar(1.25); return sombra(g);
}
const objMallas = new Map();
function limpiarObjetos() { objMallas.forEach(m => scene.remove(m)); objMallas.clear(); }
function dibujarObjetos(dt) {
  if (!PZ) return;
  const vivos = new Set(), t = PZ.hora();
  for (const o of PZ.objetos()) {
    vivos.add(o.id);
    let m = objMallas.get(o.id);
    if (!m) { m = o.poder === 'banana' ? crearBanana() : crearCaparazon(); scene.add(m); objMallas.set(o.id, m); }
    if (o.poder === 'banana') {
      // vuela hacia atrás en arco y se queda temblando en la pista
      const f = clamp((t - o.desde) / 0.45, 0, 1);
      marco(o.d0 + (o.d - o.d0) * f, o.carril0 + (o.carril - o.carril0) * f, _a, _t);
      m.position.copy(_a); m.position.y = Math.sin(f * Math.PI) * 1.8;
      m.rotation.y = Math.atan2(_t.x, _t.z) + (1 - f) * 9 + (f === 1 ? Math.sin(tGlobal * 3 + o.d) * 0.08 : 0);
    } else {
      marco(o.d, o.carril, _a, _t);
      m.position.copy(_a); m.position.y = 0.04 + Math.abs(Math.sin(tGlobal * 10)) * 0.14;
      m.rotation.y = Math.atan2(_t.x, _t.z); m.userData.giro.rotation.y += dt * 16;
      if (Math.random() < dt * 24) soltarPolvo(_q.copy(_a).setY(0.25), 0.7);
    }
  }
  objMallas.forEach((m, id) => { if (!vivos.has(id)) { scene.remove(m); objMallas.delete(id); } });
}
// Giro, rebote, estrellitas, burbuja y parpadeo de protección sobre el kart.
function efectoKart(r, yaw) {
  const e = PZ && PZ.efecto(r.id), k = r.k, g = k.g;
  k.cuerpo.visible = true;
  if (!e) { if (k.estrellas) k.estrellas.visible = false; if (k.burbuja) k.burbuja.visible = false; return; }
  if (e.golpe) {
    const p = e.p, vueltas = e.golpe === 'caparazon' ? 2 : 1, s = 1 - Math.pow(1 - p, 2.4);
    g.rotation.y = yaw + s * vueltas * Math.PI * 2;
    if (e.golpe === 'caparazon') g.position.y += Math.abs(Math.sin(p * Math.PI * 3)) * 1.3 * (1 - p);
    else k.cuerpo.rotation.z += Math.sin(p * Math.PI * 8) * 0.22 * (1 - p);
    if (!k.estrellas) {
      k.estrellas = new THREE.Group(); k.estrellas.position.y = 2.75;
      for (let i = 0; i < 3; i++) { const s3 = malla(GEO_P.estrella, MESTRELLA, Math.cos(i * 2.09) * 0.75, 0, Math.sin(i * 2.09) * 0.75); s3.scale.set(1, 1, 0.45); k.estrellas.add(s3); }
      g.add(k.estrellas);
    }
    k.estrellas.visible = true; k.estrellas.rotation.y = tGlobal * 7;
    k.estrellas.children.forEach((s3, i) => { s3.position.y = Math.sin(tGlobal * 9 + i * 2) * 0.12; s3.rotation.z = tGlobal * 5; });
  } else if (k.estrellas) k.estrellas.visible = false;
  if (e.escudo) {
    if (!k.burbuja) {
      k.burbuja = new THREE.Group(); k.burbuja.position.y = 1.15; k.burbuja.scale.set(1.05, 0.85, 1.35);
      k.burbuja.add(new THREE.Mesh(GEO_P.burbuja, MBURBUJA), new THREE.Mesh(GEO_P.burbuja, MBURBUJA2));
      k.burbuja.renderOrder = 3; g.add(k.burbuja);
    }
    const lat = 1 + Math.sin(tGlobal * 5) * 0.03;
    k.burbuja.visible = true; k.burbuja.scale.set(1.05 * lat, 0.85 * lat, 1.35 * lat); k.burbuja.rotation.y = tGlobal * 0.6;
  } else if (k.burbuja) k.burbuja.visible = false;
  if (e.protegido) k.cuerpo.visible = Math.floor(tGlobal * 12) % 3 !== 0;
  // recompensas
  const pr = e.propio;
  if (pr === 'alas') {
    if (!k.alas) { k.alas = crearAlas(); g.add(k.alas); }
    const p = e.pp, h = suave(0, 0.16, p) * (1 - suave(0.82, 1, p)) * 3.4;
    g.position.y += h + Math.sin(tGlobal * 2.6 + r.carril) * 0.22 * suave(1, 2.5, h);
    k.cuerpo.rotation.x = -0.1 * suave(0.3, 1.5, h);
    k.alas.visible = true; k.alas.children.forEach(a => { a.rotation.z = 0.15 + Math.sin(tGlobal * 13) * 0.5 * suave(0.2, 1, h); });
    if (!r.vuela && h > 0.1) { r.vuela = true; for (let q = 0; q < 8; q++) soltarPolvo(_q.copy(g.position).add(new V3(rnd(-1, 1), -h, rnd(-1, 1))), 1.2); }
  } else { if (k.alas) k.alas.visible = false; if (r.vuela) { r.vuela = false; k.cuerpo.rotation.x = 0; for (let q = 0; q < 8; q++) soltarPolvo(_q.copy(g.position).setY(0.3), 1.3); } }
  if (pr === 'estrella') {
    if (!k.aura) { k.aura = crearAura(); g.add(k.aura); }
    k.aura.visible = true; k.aura.children[0].rotation.y = tGlobal * 2; k.aura.children[0].material.opacity = 0.16 + Math.abs(Math.sin(tGlobal * 9)) * 0.14;
    k.aura.children.forEach(s3 => { if (s3.userData.i == null) return; const a = tGlobal * 6 + s3.userData.i * 1.257; s3.position.set(Math.cos(a) * 1.5, Math.sin(tGlobal * 7 + s3.userData.i) * 0.5, Math.sin(a) * 1.8); s3.rotation.y = a * 2; });
    if (Math.random() < 0.25) soltarChispas(g.position, 1);
  } else if (k.aura) k.aura.visible = false;
  ponerFantasma(k, pr === 'fantasma');
  if (pr === 'fantasma') g.position.y += 0.25 + Math.sin(tGlobal * 3) * 0.15;
  if (pr === 'iman') {
    if (!k.imanFx) { k.imanFx = crearIman(); g.add(k.imanFx); }
    const a = corredor(e.a), rr = k.imanFx.userData.r, hh = k.imanFx.userData.h;
    k.imanFx.visible = true; hh.rotation.z = Math.sin(tGlobal * 10) * 0.15;
    const dist = a ? clamp(a.d - r.d - 2.6, 0, 40) : 0;
    rr.visible = dist > 0.5; rr.scale.z = Math.max(0.01, dist); rr.position.z = 2.3 + dist / 2; rr.material.opacity = 0.35 + Math.abs(Math.sin(tGlobal * 12)) * 0.3;
  } else if (k.imanFx) k.imanFx.visible = false;
  if (e.nube) {
    if (!k.nubeFx) { k.nubeFx = crearNube(); g.add(k.nubeFx); }
    k.nubeFx.visible = true; k.nubeFx.rotation.y = -g.rotation.y + yaw; // la nube no gira con el trompo
    k.nubeFx.children.forEach(d => { if (d.userData.f == null) return; const f = (tGlobal * 1.6 + d.userData.f) % 1; d.position.y = -0.4 - f * 2.4; });
  } else if (k.nubeFx) k.nubeFx.visible = false;
}
function corredor(id) { return id == null ? null : J.corredores.find(r => r.id === id) || null; }
function listaPZ() { return J.corredores.map(r => ({ id: r.id, d: r.d, v: r.v, carril: r.carril, fin: r.llegada != null })); }
// Cara de una persona: la foto de myvc si la hay (si no carga, quedan las iniciales sobre su color).
function avatar(r, cls) {
  const s = document.createElement('span'); s.className = cls || 'av'; s.style.background = hex(r.color); s.textContent = r.yo ? 'TÚ' : r.iniciales;
  if (r.foto) { const im = new Image(); im.alt = ''; im.decoding = 'async'; im.onerror = () => im.remove(); im.src = r.foto; s.appendChild(im); }
  return s;
}
function puestoDe(r) { return orden().indexOf(r) + 1; }
const primerNombre = r => (r.yo ? 'ti' : String(r.nombre).split(' ')[0]);
function pintarPoder(gana) {
  if (!PZ) return;
  const b = $('bPoder'), p = PZ.poder('yo'), meta = DP.cargaPara || 4, c = J.red === 'alumno' ? J.cargaRed : PZ.carga('yo'), pips = $('pPips');
  b.classList.toggle('listo', !!p); b.classList.toggle('vacio', !p);
  $('pIco').innerHTML = ICONO[p || 'vacio'];
  $('pNom').textContent = p ? NOMBRE_P[p] : 'Gana un poder';
  pips.classList.toggle('ayuda', !!p);
  if (p) pips.textContent = AYUDA_P[p] || '';
  else { pips.innerHTML = ''; for (let i = 0; i < meta; i++) { const x = document.createElement('i'); if (i < c) x.className = 'on'; pips.appendChild(x); } }
  b.setAttribute('aria-label', p ? 'Usar ' + NOMBRE_P[p] + '. ' + (AYUDA_P[p] || '') : 'Poder: responde bien para llenar la barra (' + c + ' de ' + meta + ')');
  if (gana) { b.classList.remove('gana'); void b.offsetWidth; b.classList.add('gana'); }
}
function usarPoder() {
  if (!PZ || J.fase !== 'carrera' || J.pausa || !PZ.poder('yo')) return false;
  if (J.red === 'alumno') { // lo decide el tablero; aquí sólo se pide (una vez) y se espera su «lanza»
    if (J.usando > performance.now()) return false;
    J.usando = performance.now() + 2000; red.usarPoder(); return true;
  }
  const ev = PZ.usar('yo', listaPZ());
  pintarPoder();
  return !!ev;
}
// La IA de los rivales simulados: espera un momento y lo usa cuando sirve.
function iaPoder(r) {
  const p = PZ.poder(r.id), lista = listaPZ(), yo = lista.find(c => c.id === r.id);
  const delante = lista.some(c => !c.fin && c.id !== r.id && c.d > yo.d && c.d - yo.d < 70);
  const detras = lista.some(c => !c.fin && c.id !== r.id && c.d < yo.d && yo.d - c.d < 40);
  const lejos = lista.some(c => !c.fin && c.id !== r.id && c.d > yo.d);
  const viene = PZ.objetos().some(o => o.poder === 'caparazon' && o.a === r.id);
  if ((p === 'caparazon' && !delante) || (p === 'banana' && !detras && r.paciencia < 4) || ((p === 'nube' || p === 'iman') && !lejos) ||
    (p === 'iman' && !delante && r.paciencia < 3) || (p === 'fantasma' && !viene && r.paciencia < 4)) { r.paciencia++; r.usarEn = J.tiempo + 1.5; return; }
  PZ.usar(r.id, lista);
}
let sacudida = 0;
const BLOQUEO_TX = { escudo: 'La burbuja lo paró', protegido: 'Protegido', alas: 'Pasó volando', fantasma: 'Lo atravesó', estrella: '¡Invencible!' };
const PROPIO_TX = { alas: ['¡Vuelas!', 'Vuela'], estrella: ['¡Nadie te frena!', 'Es invencible'], fantasma: ['Eres fantasma', 'Es fantasma'], iman: ['¡Imán!', 'Imán'] };
function anotar(ev) {
  const de = corredor(ev.de), propio = ev.tipo === 'lanza', a = propio ? corredor(ev.a) : corredor(ev.a), f = $('feed');
  if (propio ? !de : !a) return;
  const d = document.createElement('div');
  d.className = 'fi' + (!propio && a.yo ? ' contra' : de && de.yo ? ' mio' : '');
  const banana = ev.poder === 'banana', nube = ev.poder === 'nube';
  const tx = propio ? PROPIO_TX[ev.poder][de.yo ? 0 : 1] : ev.tipo === 'bloqueo' ? BLOQUEO_TX[ev.motivo] || 'Protegido' :
    nube ? (a.yo ? '¡Te llueve!' : de && de.yo ? '¡Le llueve!' : 'Le llueve') :
    a.yo ? (banana ? '¡Resbalaste!' : '¡Te dio!') : de && de.yo ? (banana ? '¡Lo hiciste resbalar!' : '¡Le diste!') : (banana ? 'Resbaló' : '¡Pum!');
  if (de) d.appendChild(avatar(de));
  d.insertAdjacentHTML('beforeend', ICONO[ev.tipo === 'bloqueo' ? (ICONO[ev.motivo] && ev.motivo !== 'escudo' ? ev.motivo : 'escudo') : ev.poder]);
  if (a && a !== de) d.appendChild(avatar(a));
  const t = document.createElement('span'); t.className = 'tx'; t.textContent = tx; d.appendChild(t);
  f.appendChild(d);
  while (f.children.length > 3) f.firstChild.remove();
  setTimeout(() => { d.classList.add('sale'); setTimeout(() => d.remove(), 450); }, 2800);
}
if (PZ) PZ.al(ev => {
  const de = corredor(ev.de), a = corredor(ev.a);
  sonarPoder(ev, de, a);
  if (ev.tipo === 'gana') {
    if (de && de.yo) { pintarPoder(true); aviso('¡' + NOMBRE_P[ev.poder] + '!'); }
    else if (de) { de.usarEn = J.tiempo + rnd(1.2, 4); de.paciencia = 0; }
  } else if (ev.tipo === 'lanza') {
    if (de && de.yo) J.usando = 0;
    if (de && ev.poder === 'cohete') { de.turbo = Math.min(TOPE_TURBO + 6, de.turbo + (ev.turbo || 12)); for (let k = 0; k < 8; k++) soltarPolvo(_q.copy(de.k.g.position).add(new V3(rnd(-1, 1), 0.4, 0)), 1.5); }
    if (de && de.yo) { pintarPoder(); if (ev.poder === 'cohete' || ev.poder === 'escudo' || PROPIOS.includes(ev.poder)) aviso('¡' + NOMBRE_P[ev.poder] + '!'); }
    if (de && PROPIOS.includes(ev.poder)) { soltarChispas(de.k.g.position, 10, ev.poder === 'fantasma' || ev.poder === 'alas'); anotar(ev); }
  } else if (ev.tipo === 'impacto' && a && ev.poder === 'nube') {
    soltarChispas(a.k.g.position, 6, true);
    if (a.yo) aviso('¡Una nube te moja!', true);
    else if (de && de.yo) aviso('¡Le llueve a ' + primerNombre(a) + '!');
    anotar(ev);
  } else if (ev.tipo === 'impacto' && a) {
    if (!a.externo) { a.v *= ev.poder === 'banana' ? 0.5 : 0.35; a.turbo *= 0.3; }
    soltarChispas(a.k.g.position, 16);
    if (a.dot) { a.dot.classList.add('golpe'); setTimeout(() => a.dot && a.dot.classList.remove('golpe'), 1600); }
    if (a.yo) { const fl = $('flash'); fl.classList.remove('ver'); void fl.offsetWidth; fl.classList.add('ver'); sacudida = 0.9; aviso((ev.poder === 'banana' ? '¡Resbalaste!' : '¡Te dio ' + (de ? primerNombre(de) : 'alguien') + '!'), true); }
    else if (de && de.yo) aviso(ev.poder === 'banana' ? '¡' + primerNombre(a) + ' resbaló!' : '¡Le diste a ' + primerNombre(a) + '!');
    anotar(ev);
  } else if (ev.tipo === 'bloqueo' && a) {
    soltarChispas(a.k.g.position, ev.motivo === 'escudo' ? 12 : 4, ev.motivo === 'escudo');
    if (a.yo && ev.motivo === 'escudo') aviso('¡Tu burbuja te salvó!');
    else if (a.yo && BLOQUEO_TX[ev.motivo] && ev.motivo !== 'protegido') aviso({ alas: '¡Pasaste volando!', fantasma: '¡Te atravesó!', estrella: '¡Invencible!' }[ev.motivo]);
    anotar(ev);
  }
  if (!ev.remoto) {
    if (J.red === 'tablero' && red) red.poder(ev);
    try { window.dispatchEvent(new CustomEvent('carrera:poder', { detail: ev })); if (window.__juego && typeof window.__juego.alPoder === 'function') window.__juego.alPoder(ev); } catch (e) { /* oyente ajeno */ }
  }
});

// Cada poder con su sonido. Lo mío y lo que me pega, a volumen; lo de los demás, bajito y de a uno. El tablero no los
// toca: con 30 alumnos sería un ruido; allá suenan la música, la cuenta y la meta.
function sonarPoder(ev, de, a) {
  if (!SN || J.red === 'tablero') return;
  const mio = !!(de && de.yo), meDan = !!(a && a.yo), lejos = !mio && !meDan;
  if (ev.tipo === 'gana') { if (mio) suena('poder'); }
  else if (ev.tipo === 'lanza') suena(ev.poder, { lejos: !mio });
  else if (ev.tipo === 'impacto') { suena(ev.poder, { impacto: true, lejos }); if (meDan && ev.poder !== 'nube') suena('golpe'); }
  else if (ev.tipo === 'bloqueo' && ev.motivo !== 'protegido') suena(ev.motivo === 'escudo' ? 'escudo' : 'bloqueo', { impacto: true, lejos });
}

/* ---------- preguntas ---------- */
function preguntaTabla(c) {
  c = c || J;
  const max = D.tablas.factorMax || 10;
  const t = c.tabla === 'mezcla' ? pick(D.tablas.disponibles) : +c.tabla;
  let b; do { b = 1 + Math.floor(Math.random() * max); } while (c.ultimas.includes(t + 'x' + b) && max > 3);
  c.ultimas.push(t + 'x' + b); if (c.ultimas.length > 4) c.ultimas.shift();
  const inversa = Math.random() < (D.tablas.proporcionInversa || 0) && b > 1;
  const resp = inversa ? b : t * b;
  const cand = inversa ? [b + 1, b - 1, b + 2, b - 2, t] : [t * (b + 1), t * (b - 1), (t + 1) * b, (t - 1) * b, t * b + 1, t * b - 1, t * b + 10, t + b];
  const otras = barajar([...new Set(cand.filter(v => v > 0 && v !== resp))]).slice(0, 3);
  const ops = barajar([resp, ...otras]);
  return { texto: inversa ? t + ' × ? = ' + t * b : t + ' × ' + b + ' = ?', ops: ops.map(String), correcta: ops.indexOf(resp), larga: false };
}
function lecturaActual(id) { id = id || J.lectura; return D.lecturas.find(l => l.id === id) || D.lecturas[0]; }
function preguntaLectura(c) {
  c = c || J;
  if (!c.cola.length) c.cola = barajar(lecturaActual(c.lectura).preguntas.slice());
  const q = c.cola.shift(), idx = barajar(q.o.map((_, i) => i));
  return { texto: q.p, ops: idx.map(i => q.o[i]), correcta: idx.indexOf(q.correcta), larga: true };
}
function nuevaPregunta(deFuera) {
  if (J.red === 'tablero') return;
  if (J.red === 'alumno' && !deFuera) { J.pregunta = null; return; } // la manda el tablero
  J.pregunta = deFuera || (J.modo === 'tablas' ? preguntaTabla() : preguntaLectura());
  J.bloqueo = false; J.tPreg = J.tiempo;
  const q = J.pregunta, pq = $('pq'), ops = $('ops');
  pq.textContent = q.texto; pq.classList.toggle('larga', q.larga);
  ops.classList.toggle('uno', q.larga && q.ops.some(o => o.length > 12));
  ops.innerHTML = '';
  q.ops.forEach((o, i) => { const b = document.createElement('button'); b.className = 'op' + (q.larga ? ' txt' : ''); b.textContent = o; b.addEventListener('click', () => responder(i)); ops.appendChild(b); });
}
let avisoT = 0;
function aviso(txt, mal) { const a = $('aviso'); a.textContent = txt; a.className = 'aviso ver' + (mal ? ' mal' : ''); avisoT = mal ? 1.6 : 1.0; }
// Turbo por acierto, freno por fallo. Lo usa el jugador solo y, en sala, el tablero con cada alumno.
function impulso(r, bien) {
  if (bien) { r.racha = (r.racha || 0) + 1; r.turbo = Math.min(TOPE_TURBO, r.turbo + TURBO); if (r.racha % 3 === 0) r.turbo = Math.min(TOPE_TURBO + 5, r.turbo + 5); }
  else { r.racha = 0; r.lento = 1.0; }
}
function responder(i) {
  if (J.fase !== 'carrera' || J.pausa || J.bloqueo || !J.pregunta) return;
  J.bloqueo = true;
  const q = J.pregunta, bs = $('ops').children;
  [...bs].forEach(b => { b.disabled = true; });
  if (J.red === 'alumno') { bs[i].classList.add('elegida'); J.respuesta = i; red.responder(q.id, i); return; }
  const bien = i === q.correcta, rapida = bien && J.tiempo - J.tPreg <= ((DP.rapida || {})[J.modo] || 3);
  impulso(J.yo, bien);
  if (PZ) PZ.cargar('yo', bien, rapida, puestoDe(J.yo)); // si gana, el oyente pinta el botón y avisa
  mostrarVeredicto(i, bien, q.correcta, rapida);
  setTimeout(() => { if (J.fase === 'carrera') nuevaPregunta(); }, bien ? 600 : 1400);
}
function mostrarVeredicto(i, bien, correcta, rapida) {
  const bs = $('ops').children, yo = J.yo;
  if (bs[correcta]) bs[correcta].classList.add('bien');
  if (bien) {
    J.aciertos++; J.racha++;
    suena('turbo', { rapida }); if (J.racha % 3 === 0) suena('racha');
    if (J.racha % 3 === 0) aviso(D.mensajes.racha); else aviso(rapida && PZ && D.mensajes.rapida ? D.mensajes.rapida : pick(D.mensajes.bien));
    for (let k = 0; k < 6; k++) soltarPolvo(yo.k.g.position.clone().add(new V3(rnd(-1, 1), 0.4, 0)), 1.3);
  } else {
    J.errores++; J.racha = 0; if (bs[i]) bs[i].classList.add('mal');
    suena('fallo');
    aviso(pick(D.mensajes.mal) + ' ' + (J.pregunta.ops[correcta] || ''), true);
  }
  pintarPoder();
  $('hRacha').textContent = J.racha >= 2 ? 'racha ' + J.racha : '';
}

/* ---------- interfaz ---------- */
const mostrar = (id, si) => $(id).classList.toggle('oculto', !si);
function claveMarca(pid) { return (J.modo === 'tablas' ? 'tabla-' + J.tabla : 'lectura-' + J.lectura) + (pid && pid !== PISTAS[0].id ? '@' + pid : ''); }
function nombreModo() { return J.modo === 'tablas' ? (J.tabla === 'mezcla' ? 'Tablas mezcladas' : 'Tabla del ' + J.tabla) : lecturaActual().titulo; }
function pintarCara(cv, animal) {
  const A = ANIMALES[animal], x = cv.getContext('2d'), s = cv.width / 92; x.setTransform(s, 0, 0, s, 0, 0); x.clearRect(0, 0, 92, 92);
  const piel = hex(A.piel), claro = hex(A.claro);
  const circ = (cx, cy, r, c) => { x.fillStyle = c; x.beginPath(); x.arc(cx, cy, r, 0, 7); x.fill(); };
  x.fillStyle = piel;
  if (A.orejas === 'punta' || A.orejas === 'grandes') { const e = A.orejas === 'grandes' ? 10 : 0; x.beginPath(); x.moveTo(20, 38); x.lineTo(24 - e / 2, 8 - e); x.lineTo(42, 26); x.moveTo(72, 38); x.lineTo(68 + e / 2, 8 - e); x.lineTo(50, 26); x.fill(); }
  if (A.orejas === 'redondas') { circ(24, 26, 12, piel); circ(68, 26, 12, piel); }
  if (A.orejas === 'largas') { x.beginPath(); x.ellipse(34, 18, 8, 20, -0.15, 0, 7); x.ellipse(58, 18, 8, 20, 0.15, 0, 7); x.fill(); }
  circ(46, 52, 28, piel);
  if (A.orejas === 'caidas') { x.fillStyle = '#9a6a3c'; x.beginPath(); x.ellipse(20, 50, 8, 16, 0.3, 0, 7); x.ellipse(72, 50, 8, 16, -0.3, 0, 7); x.fill(); }
  if (A.orejas === 'ojos') { circ(32, 30, 11, '#fffdf7'); circ(60, 30, 11, '#fffdf7'); circ(32, 31, 5, '#15182a'); circ(60, 31, 5, '#15182a'); x.fillStyle = claro; x.beginPath(); x.ellipse(46, 62, 20, 10, 0, 0, 7); x.fill(); }
  else { x.fillStyle = claro; x.beginPath(); x.ellipse(46, 62, 14, 11, 0, 0, 7); x.fill(); circ(36, 46, 4, '#15182a'); circ(56, 46, 4, '#15182a'); circ(46, 58, 4, '#15182a'); }
}
function construirInicio() {
  $('frase').textContent = D.frase;
  const ct = $('optTablas'); ct.innerHTML = '';
  [...D.tablas.disponibles, 'mezcla'].forEach(t => {
    const b = document.createElement('button'); b.className = 'chip'; b.textContent = t === 'mezcla' ? 'Mezcla' : '×' + t; b.dataset.t = t;
    b.addEventListener('click', () => { J.tabla = t === 'mezcla' ? t : +t; refrescarInicio(); }); ct.appendChild(b);
  });
  const cl = $('optLectura'); cl.innerHTML = '';
  D.lecturas.forEach(l => {
    const b = document.createElement('button'); b.className = 'lect'; b.dataset.id = l.id; b.innerHTML = '<b></b><span></span>';
    b.firstChild.textContent = l.titulo; b.lastChild.textContent = l.grado;
    b.addEventListener('click', () => { J.lectura = l.id; refrescarInicio(); }); cl.appendChild(b);
  });
  const ca = $('animales'); ca.innerHTML = '';
  Object.keys(ANIMALES).forEach(a => {
    const b = document.createElement('button'); b.className = 'ani'; b.dataset.a = a;
    const cv = document.createElement('canvas'); cv.width = cv.height = 92; pintarCara(cv, a);
    b.appendChild(cv); b.appendChild(document.createTextNode(ANIMALES[a].nombre));
    b.addEventListener('click', () => { J.animal = a; refrescarInicio(); }); ca.appendChild(b);
  });
  document.querySelectorAll('.modo').forEach(b => b.addEventListener('click', () => { J.modo = b.dataset.modo; refrescarInicio(); }));
  const sp = $('optPistas'); sp.innerHTML = '';
  sp.appendChild(selectorPistas(J.sel, (sel, ver) => { if (ver) armarPista(ver); refrescarInicio(); }, id => verPista(id)));
}
// Miniatura de una pista: su trazado sobre los colores del lugar, con un icono de su rasgo.
function miniPista(def) {
  const c = new THREE.CatmullRomCurve3(def.cp.map(([x, z]) => new V3(x, 0, z)), true, 'centripetal').getSpacedPoints(96);
  let x0 = 1e9, x1 = -1e9, z0 = 1e9, z1 = -1e9; c.forEach(p => { x0 = Math.min(x0, p.x); x1 = Math.max(x1, p.x); z0 = Math.min(z0, p.z); z1 = Math.max(z1, p.z); });
  const k = Math.min(132 / (x1 - x0), 70 / (z1 - z0)), ox = 80 - (x0 + x1) / 2 * k, oz = 45 - (z0 + z1) / 2 * k;
  const d = c.map((p, i) => (i ? 'L' : 'M') + (ox + p.x * k).toFixed(1) + ' ' + (oz + p.z * k).toFixed(1)).join('') + 'Z';
  const g = 'gp-' + def.id, a = c[0];
  return '<svg viewBox="0 0 160 90" aria-hidden="true"><defs><linearGradient id="' + g + '" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="' + def.tarjeta[0] + '"/><stop offset="1" stop-color="' + def.tarjeta[1] + '"/></linearGradient></defs>' +
    '<rect width="160" height="90" fill="url(#' + g + ')"/><path d="' + d + '" fill="none" stroke="rgba(21,48,77,.45)" stroke-width="11" stroke-linejoin="round"/>' +
    '<path d="' + d + '" fill="none" stroke="#fffdf7" stroke-width="6" stroke-linejoin="round"/><circle cx="' + (ox + a.x * k).toFixed(1) + '" cy="' + (oz + a.z * k).toFixed(1) + '" r="4.5" fill="#15304d" stroke="#fffdf7" stroke-width="2"/>' +
    '<circle cx="139" cy="69" r="17" fill="#fffdf7" opacity=".94"/><g transform="translate(125.5 55.5) scale(.5625)">' + def.icono + '</g></svg>';
}
// Elegir pista: una carrera o un torneo de 3. Lo usan el inicio y la sala del docente. sel = {modo, pista, lista}.
function selectorPistas(sel, alCambiar, ver) {
  const raiz = document.createElement('div'); raiz.className = 'selpistas';
  raiz.innerHTML = '<div class="tmodo" role="group" aria-label="Cuántas carreras"><button type="button" data-m="una"><b>Una carrera</b></button><button type="button" data-m="torneo"><b>Torneo</b><span>3 pistas</span></button></div><div class="pgrid"></div><div class="pdesc"><span class="ptx" aria-live="polite"></span><button type="button" class="azar">Al azar</button></div>';
  const grid = raiz.querySelector('.pgrid'), tx = raiz.querySelector('.ptx');
  PISTAS.forEach(def => {
    const caja = document.createElement('div'); caja.className = 'pcaja';
    const b = document.createElement('button'); b.type = 'button'; b.className = 'pista'; b.dataset.id = def.id;
    b.innerHTML = miniPista(def) + '<b></b><i class="num"></i>'; b.children[1].textContent = def.nombre;
    caja.appendChild(b);
    if (ver) {
      const v = document.createElement('button'); v.type = 'button'; v.className = 'verp'; v.setAttribute('aria-label', 'Ver la pista ' + def.nombre);
      v.innerHTML = '<svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true"><path d="M3 8h4l2-3h6l2 3h4v11H3z" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linejoin="round"/><circle cx="12" cy="13" r="3.4" fill="none" stroke="currentColor" stroke-width="2.2"/></svg><span>Ver pista</span>';
      v.addEventListener('click', () => ver(def.id)); caja.appendChild(v);
    }
    b.addEventListener('click', () => {
      if (sel.modo === 'torneo') { const i = sel.lista.indexOf(def.id); if (i >= 0) sel.lista.splice(i, 1); else if (sel.lista.length < 3) sel.lista.push(def.id); else sel.lista.splice(2, 1, def.id); }
      else sel.pista = def.id;
      pintar(); alCambiar(sel, def.id);
    });
    grid.appendChild(caja);
  });
  raiz.querySelectorAll('.tmodo button').forEach(b => b.addEventListener('click', () => { sel.modo = b.dataset.m; pintar(); alCambiar(sel, sel.modo === 'torneo' ? sel.lista[0] || sel.pista : sel.pista); }));
  raiz.querySelector('.azar').addEventListener('click', () => { sel.lista = completarTorneo([]); pintar(); alCambiar(sel, sel.lista[0]); });
  function pintar() {
    const tor = sel.modo === 'torneo';
    raiz.classList.toggle('es-torneo', tor);
    raiz.querySelectorAll('.tmodo button').forEach(b => { b.classList.toggle('sel', b.dataset.m === sel.modo); b.setAttribute('aria-pressed', b.dataset.m === sel.modo); });
    grid.querySelectorAll('.pista').forEach(b => {
      const k = sel.lista.indexOf(b.dataset.id), on = tor ? k >= 0 : b.dataset.id === sel.pista;
      b.classList.toggle('sel', on); b.parentNode.classList.toggle('sel', on); b.setAttribute('aria-pressed', on); b.lastChild.textContent = tor && k >= 0 ? String(k + 1) : '';
    });
    tx.innerHTML = '';
    if (!tor) { const d = pistaDef(sel.pista), nb = document.createElement('b'); nb.textContent = d.nombre; tx.append(nb, ' · ' + d.rasgo); }
    else if (!sel.lista.length) tx.textContent = 'Toca 3 pistas en el orden que quieras, o pide 3 al azar.';
    else tx.textContent = sel.lista.map((id, i) => (i + 1) + '. ' + pistaDef(id).nombre).join(' · ') + (sel.lista.length < 3 ? ' · las que falten salen al azar' : '');
  }
  pintar();
  raiz.pintar = pintar;
  return raiz;
}
function refrescarInicio() {
  document.querySelectorAll('.modo').forEach(b => b.classList.toggle('sel', b.dataset.modo === J.modo));
  mostrar('optTablas', J.modo === 'tablas'); mostrar('optLectura', J.modo === 'lectura');
  document.querySelectorAll('.chip').forEach(b => b.classList.toggle('sel', String(J.tabla) === b.dataset.t));
  document.querySelectorAll('.lect').forEach(b => b.classList.toggle('sel', J.lectura === b.dataset.id));
  document.querySelectorAll('.ani').forEach(b => b.classList.toggle('sel', J.animal === b.dataset.a));
  if (J.sel.modo === 'torneo') {
    const t = prog.torneos;
    $('marcaP').textContent = t && t.jugados ? 'Torneos: ' + t.jugados + ' jugados · ' + (t.ganados || 0) + ' ganados · mejor puesto ' + ord(t.mejor) : 'Tres carreras seguidas: cada puesto da puntos y gana quien más sume.';
  } else {
    const m = prog.marcas[claveMarca(J.sel.pista)], donde = '«' + nombreModo() + '» · ' + pistaDef(J.sel.pista).nombre;
    $('marcaP').textContent = m ? 'Tu marca en ' + donde + ': ' + reloj(m.tiempo) + ' · mejor puesto ' + ord(m.puesto) : 'Aún no tienes marca en ' + donde + '. ¡Pon la primera!';
  }
  $('bJugar').textContent = J.sel.modo === 'torneo' ? 'Jugar el torneo' : 'Jugar';
}
function irInicio() {
  J.fase = 'menu'; J.pausa = false; J.torneo = null; J.torneoRed = null;
  armarPista(J.sel.modo === 'torneo' && J.sel.lista.length ? J.sel.lista[J.sel.lista.length - 1] : J.sel.pista);
  if (J.red) dejarRed();
  ['hud', 'velo', 'panel', 'pausa', 'fin', 'leer', 'cuenta', 'bPoder', 'tablero', 'intro'].forEach(id => mostrar(id, false));
  limpiarObjetos(); $('feed').innerHTML = '';
  confeti.forEach(q => { q.m.visible = false; });
  mostrar('inicio', true); refrescarInicio(); encuadre();
  semaforo.forEach(m => m.emissive.setHex(0));
  buscarSalas();
}
function guardarElecciones() { prog.modo = J.modo; prog.tabla = J.tabla; prog.lectura = J.lectura; prog.animal = J.animal; prog.pista = J.sel.pista; guardarP(prog); }
function jugar() {
  if (J.red) dejarRed();
  guardarElecciones();
  J.torneo = J.sel.modo === 'torneo' ? { pistas: completarTorneo(J.sel.lista), i: 0, tabla: {} } : null;
  correr();
}
function siguienteCarrera() { if (!J.torneo || ultimaDelTorneo()) return; J.torneo.i++; correr(); }
function correr() {
  armarPista(J.torneo ? J.torneo.pistas[J.torneo.i] : J.sel.pista);
  mostrar('inicio', false); mostrar('fin', false);
  confeti.forEach(q => { q.m.visible = false; });
  J.pregunta = null; J.aciertos = 0; J.errores = 0; J.racha = 0; J.tiempo = 0; J.cola = []; J.ultimas = []; J.resultado = null; J.ultimaVuelta = false;
  J.total = (D.vueltas[J.modo] || 2) * LARGO;
  armarCorredores();
  if (PZ) PZ.reiniciar(J.total);
  limpiarObjetos(); $('feed').innerHTML = ''; sacudida = 0;
  pintarPoder();
  $('hRacha').textContent = '';
  $('pTag').textContent = nombreModo();
  mostrar('bTexto', J.modo === 'lectura');
  construirTira();
  if (J.modo === 'lectura') abrirTexto(false); else empezarCuenta();
}
function abrirTexto(enCarrera) {
  const l = lecturaActual();
  $('lGrado').textContent = l.grado; $('lTitulo').textContent = l.titulo; $('lTexto').textContent = l.texto;
  $('bLeido').textContent = enCarrera ? 'Seguir corriendo' : '¡Ya lo leí, a correr!';
  $('bLeido').onclick = () => { mostrar('leer', false); if (enCarrera) J.pausa = false; else empezarCuenta(); };
  if (enCarrera) J.pausa = true; else J.fase = 'leer';
  mostrar('leer', true);
}
let cuentaT = 0, cuentaN = 0, cuentaSon = 4;
function arrancar() {
  semaforo.forEach(m => m.emissive.setHex(0x3bd16f)); J.fase = 'carrera'; reloj3.getDelta();
  if (J.red === 'alumno') { const q = J.preguntaPend; J.preguntaPend = null; if (q) nuevaPregunta(q); else $('pq').textContent = '¡A correr!'; }
  else nuevaPregunta();
  if (J.red === 'tablero' && red) red.arranca();
}
// Antes de la cuenta, un sobrevuelo de INTRO s de la pista. Solo se salta con un toque; en sala no (manda el reloj del
// docente: todos empiezan juntos). Con movimiento reducido no hay sobrevuelo.
const INTRO = 4.6, INTRO_QUIETO = 1.4; // s: el plano completo (girando muy despacio) y la bajada hasta la parrilla
const movReducido = () => !!(window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches);
function empezarCuenta() {
  J.fase = 'cuenta'; cuentaT = movReducido() ? 0 : -INTRO; cuentaN = 3;
  const tab = J.red === 'tablero', intro = cuentaT < 0;
  mostrar('hud', !intro); mostrar('panel', !tab); mostrar('velo', !tab && !intro); mostrar('cuenta', !intro); mostrar('bPoder', !!PZ && !tab && !intro); mostrar('tablero', tab && !intro);
  $('iNom').textContent = PISTA.nombre; $('iRas').textContent = PISTA.rasgo; $('iSaltar').classList.toggle('oculto', !!J.red); mostrar('intro', intro);
  $('cNum').textContent = '3'; $('cTip').textContent = tab ? 'Cada uno responde en su pantalla. ¡Gana el primero en llegar a la meta!' : D.comoSeJuega;
  $('pq').textContent = 'Prepárate…'; $('pq').classList.remove('larga'); $('ops').innerHTML = '';
  semaforo.forEach(m => m.emissive.setHex(0)); semaforo[0].emissive.setHex(0xff3b2b);
  vueltaSon = 1; cuentaSon = 4; encuadre(); actualizarHUD(true);
}
function construirTira() {
  const t = $('tira'); t.innerHTML = '';
  J.corredores.forEach(r => { r.dot = avatar(r, 'pt' + (r.yo ? ' yo' : '')); t.appendChild(r.dot); });
  if (J.red === 'tablero') { $('tabla2').innerHTML = ''; J.corredores.forEach(filaTablero); }
}
// El tablero del docente: una fila por alumno, con foto; se reordena sola.
function filaTablero(r) {
  const li = document.createElement('li'), n = document.createElement('b'), nom = document.createElement('span'), t = document.createElement('i');
  n.className = 'n'; nom.className = 'nom'; nom.textContent = r.completo || r.nombre;
  li.append(n, avatar(r), nom, t); r.fila = li; $('tabla2').appendChild(li);
}
function pintarTablero() {
  const o = orden(), ul = $('tabla2'), vueltas = D.vueltas[J.modo] || 2;
  o.forEach((r, i) => {
    const li = r.fila; if (!li) return;
    li.children[0].textContent = ord(i + 1);
    li.lastChild.textContent = r.llegada != null ? reloj(r.llegada) : r.fuera ? 'sin conexión' : 'vuelta ' + clamp(Math.floor(Math.max(0, rec(r)) / LARGO) + 1, 1, vueltas);
    li.classList.toggle('fuera', !!r.fuera); li.classList.toggle('meta', r.llegada != null);
    if (ul.children[i] !== li) ul.insertBefore(li, ul.children[i] || null);
  });
  $('tCuenta').textContent = o.filter(r => r.llegada != null).length + ' de ' + o.length + ' en la meta';
}
let hudT = 0, ultPuesto = 0, tableroT = 0;
function actualizarHUD(forzar) {
  const o = orden(), f = foco(), p = J.yo ? o.indexOf(J.yo) + 1 : 0;
  if (J.yo && (p !== ultPuesto || forzar)) { $('hPuesto').textContent = ord(p); $('hDe').textContent = 'de ' + o.length; ultPuesto = p; }
  const vueltas = D.vueltas[J.modo] || 2, v = f ? clamp(Math.floor(Math.max(0, rec(f)) / LARGO) + 1, 1, vueltas) : 1;
  $('hVuelta').textContent = (J.yo ? 'Vuelta ' : 'Puntero · vuelta ') + v + '/' + vueltas;
  if (v === vueltas && vueltas > 1 && !J.ultimaVuelta && J.fase === 'carrera') { J.ultimaVuelta = true; aviso('¡Última vuelta!'); }
  if (J.yo && v > vueltaSon && J.fase === 'carrera') suena('vuelta', { ultima: v === vueltas });
  vueltaSon = v;
  J.corredores.forEach(r => { r.dot.style.left = (clamp(rec(r) / J.total, 0, 1) * 100) + '%'; });
  if (J.yo) $('hVel').textContent = Math.round(J.yo.v * 7);
  if (J.red === 'tablero' && (forzar || --tableroT <= 0)) { tableroT = 4; pintarTablero(); }
}
// A quién sigue la cámara: el jugador; en el tablero, el primero que siga corriendo.
function foco() {
  if (J.yo) return J.yo;
  if (J.fase === 'cuenta') return J.corredores[Math.min(2, J.corredores.length - 1)] || null;
  const o = orden();
  return o.find(r => r.llegada == null) || o[0] || null;
}

/* ---------- final ---------- */
const ESTRELLA = on => '<svg viewBox="0 0 24 24"><path d="M12 2.5l2.9 6 6.6.9-4.8 4.6 1.2 6.5L12 17.4 6.1 20.5l1.2-6.5L2.5 9.4l6.6-.9z" fill="' + (on ? '#ffc23a' : '#ead9b4') + '" stroke="#15304d" stroke-width="1.4" stroke-linejoin="round"/></svg>';
function terminar() {
  if (J.fase !== 'carrera' && !(J.red && J.fase === 'cuenta')) return;
  J.fase = 'fin'; J.pausa = false;
  if (J.red) {
    ['hud', 'velo', 'panel', 'cuenta', 'bPoder', 'pausa', 'leer', 'tablero'].forEach(id => mostrar(id, false));
    limpiarObjetos(); $('feed').innerHTML = '';
    pintarFinalRed();
    if (J.yo) suena('meta');
    suena('podio', { puesto: J.yo ? orden().indexOf(J.yo) + 1 : 1 });
    lanzarConfeti(podio.position); camOrbita = 0;
    mostrar('fin', true); encuadre();
    if (J.red === 'tablero' && red) red.fin();
    return;
  }
  const yo = J.yo; if (yo.llegada == null) yo.llegada = J.tiempo;
  J.corredores.forEach(r => { if (r.llegada == null) r.llegada = J.tiempo + Math.max(0.5, (J.total - r.d) / Math.max(BASE, r.v)); });
  const o = orden(), puesto = o.indexOf(yo) + 1, est = puesto === 1 ? 3 : puesto <= 3 ? 2 : 1;
  const clave = claveMarca(PISTA.id), prev = prog.marcas[clave];
  const nueva = !prev || yo.llegada < prev.tiempo;
  prog.marcas[clave] = { tiempo: nueva ? +yo.llegada.toFixed(1) : prev.tiempo, puesto: prev ? Math.min(prev.puesto, puesto) : puesto, estrellas: Math.max(prev ? prev.estrellas : 0, est), carreras: (prev ? prev.carreras || 0 : 0) + 1 };
  guardarP(prog);
  J.resultado = { puesto, estrellas: est, tiempo: yo.llegada, nueva, aciertos: J.aciertos, errores: J.errores };
  ['hud', 'velo', 'panel', 'cuenta', 'bPoder'].forEach(id => mostrar(id, false));
  limpiarObjetos(); $('feed').innerHTML = '';
  $('fEst').innerHTML = [1, 2, 3].map(i => ESTRELLA(i <= est)).join('');
  $('fTit').textContent = puesto === 1 ? '¡Ganaste la carrera!' : puesto <= 3 ? '¡Subiste al podio!' : '¡Llegaste a la meta!';
  const total = J.aciertos + J.errores;
  $('fSub').innerHTML = 'Acertaste <b>' + J.aciertos + ' de ' + total + '</b> · tiempo <b>' + reloj(yo.llegada) + '</b><br>' +
    (nueva ? '¡Nueva marca personal!' : 'Tu marca: ' + reloj(prev.tiempo));
  pintarTabla(o);
  alPodio(o);
  finTorneo(o);
  const tp = J.torneo && ultimaDelTorneo() ? filasTorneo().findIndex(t => t.yo) + 1 : 0;
  suena('meta'); suena('podio', { puesto: tp || puesto, campeon: tp === 1 });
  lanzarConfeti(podio.position);
  camOrbita = 0;
  mostrar('fin', true); encuadre();
}
/* ---------- torneo: tres carreras, puntos por puesto (como en los karts), tabla acumulada y podio final ---------- */
const PUNTOS = [15, 12, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1];
const puntosDe = i => PUNTOS[i] || 1;
function completarTorneo(l) {
  const r = (l || []).filter((id, i, a) => PISTAS.some(p => p.id === id) && a.indexOf(id) === i).slice(0, 3);
  barajar(PISTAS.map(p => p.id).filter(id => !r.includes(id))).forEach(id => { if (r.length < 3) r.push(id); });
  return r;
}
const ultimaDelTorneo = () => !!J.torneo && J.torneo.i >= J.torneo.pistas.length - 1;
function sumarTorneo(o) {
  const tor = J.torneo; if (!tor || tor.sumada === tor.i) return;
  tor.sumada = tor.i;
  o.forEach((r, i) => {
    const t = tor.tabla[r.id] || (tor.tabla[r.id] = { id: r.id, pts: 0, carreras: [] });
    Object.assign(t, { nombre: r.yo ? 'Tú' : r.completo || r.nombre, iniciales: r.iniciales, color: r.color, foto: r.foto, yo: !!r.yo });
    t.ult = r.fuera ? 0 : puntosDe(i); t.pts += t.ult; t.carreras[tor.i] = t.ult;
  });
}
const filasTorneo = () => Object.values(J.torneo.tabla).sort((a, b) => b.pts - a.pts || (b.ult || 0) - (a.ult || 0));
function pintarTablaTorneo(filas) {
  const ol = $('fTabla'); ol.innerHTML = '';
  filas.forEach((t, i) => {
    const li = document.createElement('li'); if (t.yo) li.className = 'yo';
    const n = document.createElement('span'); n.className = 'n'; n.textContent = ord(i + 1);
    const nom = document.createElement('span'); nom.className = 'nom'; nom.textContent = t.nombre;
    const mas = document.createElement('span'); mas.className = 'mas'; mas.textContent = '+' + (t.ult || 0);
    const p = document.createElement('span'); p.className = 't'; p.innerHTML = '<b>' + t.pts + '</b> pts';
    li.append(n, avatar(t), nom, mas, p); ol.appendChild(li);
  });
}
// El final de una carrera del torneo (solo o tablero): la tabla acumulada y, en la última, el podio del torneo.
function finTorneo(o) {
  const ft = $('fTorneo');
  if (!J.torneo) { ft.classList.add('oculto'); $('bOtra').textContent = J.red === 'tablero' ? 'Otra carrera' : J.red ? 'Salir de la sala' : 'Otra carrera'; return; }
  sumarTorneo(o);
  const tor = J.torneo, filas = filasTorneo(), ult = ultimaDelTorneo(), n = tor.pistas.length;
  ft.textContent = ult ? 'Torneo · resultado final' : 'Torneo · carrera ' + (tor.i + 1) + ' de ' + n + ' · ' + PISTA.nombre;
  ft.classList.remove('oculto');
  pintarTablaTorneo(filas);
  if (ult) $('bOtra').textContent = J.red ? 'Otra carrera' : 'Otro torneo';
  else { const b = $('bOtra'), sm = document.createElement('small'); sm.textContent = pistaDef(tor.pistas[tor.i + 1]).nombre; b.textContent = 'Siguiente'; b.appendChild(sm); }
  const mio = filas.find(t => t.yo), puesto = mio ? filas.indexOf(mio) + 1 : 0;
  if (J.red === 'tablero') {
    if (ult && filas[0]) $('fTit').textContent = '¡' + String(filas[0].nombre).split(' ')[0] + ' ganó el torneo!';
  } else if (mio) {
    if (ult) {
      const est = puesto === 1 ? 3 : puesto <= 3 ? 2 : 1;
      $('fEst').innerHTML = [1, 2, 3].map(i => ESTRELLA(i <= est)).join('');
      $('fTit').textContent = puesto === 1 ? '¡Ganaste el torneo!' : puesto <= 3 ? '¡Subiste al podio del torneo!' : 'Terminaste ' + ord(puesto) + ' en el torneo';
      $('fSub').innerHTML = 'Sumaste <b>' + mio.carreras.map(x => x || 0).join(' + ') + ' = ' + mio.pts + ' puntos</b> en ' + n + ' carreras.';
      const t = prog.torneos || { jugados: 0, ganados: 0, mejor: 99 };
      prog.torneos = { jugados: t.jugados + 1, ganados: t.ganados + (puesto === 1 ? 1 : 0), mejor: Math.min(t.mejor || 99, puesto) }; guardarP(prog);
    } else $('fSub').innerHTML += '<br>En el torneo vas <b>' + ord(puesto) + '</b> con <b>' + mio.pts + ' puntos</b>.';
  }
  if (ult) alPodio(filas.map(t => corredor(t.id)).filter(Boolean));
}

function pintarTabla(o) {
  const ol = $('fTabla'); ol.innerHTML = '';
  o.forEach((r, i) => {
    const li = document.createElement('li'); if (r.yo) li.className = 'yo';
    const n = document.createElement('span'); n.className = 'n'; n.textContent = ord(i + 1);
    const nom = document.createElement('span'); nom.className = 'nom'; nom.textContent = r.yo ? 'Tú' : r.completo || r.nombre;
    const t = document.createElement('span'); t.className = 't'; t.textContent = r.llegada != null ? reloj(r.llegada) : J.fase === 'fin' && J.red === 'alumno' ? 'corriendo' : 'sin llegar';
    li.append(n, avatar(r), nom, t); ol.appendChild(li);
  });
}
// Al podio: los tres primeros arriba, los siete siguientes en fila; con un curso entero, el resto no cabe.
function alPodio(o) {
  const u = podio.userData, fila = Math.min(7, Math.max(0, o.length - 3));
  o.forEach((r, i) => {
    const g = r.k.g;
    g.visible = i < 10;
    if (i < 3) { g.position.set(u.xs[i], u.alto[i], 0); podio.localToWorld(g.position); }
    else { g.position.set((i - 3 - (fila - 1) / 2) * 2.6, 0, -4.6); podio.localToWorld(g.position); }
    if (r.k.et) { r.k.et.visible = i < 3; r.k.et.scale.set(2.9, 0.8, 1); r.k.et.position.y = 2.9; }
    g.rotation.set(0, podio.rotation.y, 0); r.k.cuerpo.rotation.set(0, 0, 0); r.k.llamas.forEach(l => { l.visible = false; });
    r.k.cuerpo.visible = true; if (r.k.estrellas) r.k.estrellas.visible = false; if (r.k.burbuja) r.k.burbuja.visible = false; limpiarFx(r.k);
  });
}
// Final en sala: sin marcas personales (otra carrera, otras condiciones). El del alumno se repinta mientras llegan los demás.
function pintarFinalRed() {
  const o = orden(), yo = J.yo, llegaron = o.filter(r => r.llegada != null).length;
  if (J.red === 'tablero') {
    const g = o[0];
    $('fEst').innerHTML = '';
    $('fTit').textContent = g && g.llegada != null ? '¡Ganó ' + String(g.completo || g.nombre).split(' ')[0] + '!' : 'Carrera terminada';
    $('fSub').textContent = llegaron + ' de ' + o.length + ' llegaron a la meta.';
  } else if (yo) {
    const puesto = o.indexOf(yo) + 1, est = yo.llegada == null ? 0 : puesto === 1 ? 3 : puesto <= 3 ? 2 : 1;
    $('fEst').innerHTML = [1, 2, 3].map(i => ESTRELLA(i <= est)).join('');
    $('fTit').textContent = yo.llegada == null ? 'Carrera terminada' : puesto === 1 ? '¡Ganaste la carrera!' : puesto <= 3 ? '¡Subiste al podio!' : '¡Llegaste de ' + ord(puesto) + '!';
    const total = J.aciertos + J.errores;
    $('fSub').innerHTML = 'Acertaste <b>' + J.aciertos + ' de ' + total + '</b>' + (yo.llegada != null ? ' · tiempo <b>' + reloj(yo.llegada) + '</b>' : '') +
      '<br>' + (llegaron < o.length && !J.redFin ? 'Faltan ' + (o.length - llegaron) + ' por llegar.' : J.torneoRed && J.torneoRed.i < J.torneoRed.n - 1 ? 'Tu profe pone la siguiente pista.' : 'Si tu profe arma otra, entras sin hacer nada.');
    J.resultado = { puesto, estrellas: est, tiempo: yo.llegada, nueva: false, aciertos: J.aciertos, errores: J.errores };
  }
  $('bOtra').textContent = J.red === 'tablero' ? 'Otra carrera' : 'Salir de la sala';
  mostrar('bCerrar', J.red === 'tablero'); document.querySelector('.botones a.sec').classList.toggle('oculto', J.red === 'tablero');
  pintarTabla(o);
  alPodio(o);
  if (J.red === 'tablero') finTorneo(o);
  else torneoAlumno();
}
// El alumno no lleva el torneo: el tablero le manda la tabla con el «fin» de cada carrera ([uid, puntos, últimos]).
function torneoAlumno() {
  const tr = J.torneoRed, ft = $('fTorneo');
  if (!tr) { ft.classList.add('oculto'); return; }
  const ult = tr.i >= tr.n - 1;
  ft.textContent = ult ? 'Torneo · resultado final' : 'Torneo · carrera ' + (tr.i + 1) + ' de ' + tr.n + ' · ' + (PISTA ? PISTA.nombre : '');
  ft.classList.remove('oculto');
  if (!Array.isArray(tr.filas)) return;
  const filas = tr.filas.map(([uid, pts, ultP]) => {
    const r = J.corredores.find(c => c.uid === uid) || { nombre: '?', iniciales: '?', color: 0x8e6bd8 };
    return { nombre: r.yo ? 'Tú' : r.completo || r.nombre, iniciales: r.iniciales, color: r.color, foto: r.foto, yo: !!r.yo, pts, ult: ultP, r };
  });
  pintarTablaTorneo(filas);
  const mio = filas.find(t => t.yo);
  if (mio) $('fSub').innerHTML += '<br>' + (ult ? 'Terminaste el torneo ' : 'En el torneo vas ') + '<b>' + ord(filas.indexOf(mio) + 1) + '</b> con <b>' + mio.pts + ' puntos</b>.';
  if (ult) alPodio(filas.map(t => t.r).filter(r => r.k));
}

/* ---------- encuadre: el centro de la vista queda en el hueco libre ---------- */
let abajo = 0, derecha = 0, arriba = 0, fovBase = 55;
function encuadre() {
  const W = innerWidth, Hh = innerHeight;
  abajo = 0; derecha = 0;
  if (!$('panel').classList.contains('oculto')) abajo = $('panel').offsetHeight;
  if (!$('fin').classList.contains('oculto')) { const c = $('fin').firstElementChild; if (W >= 900) derecha = c.offsetWidth + 24; else abajo = c.offsetHeight; }
  else if (!$('tablero').classList.contains('oculto')) { const c = $('tablero'); if (W >= 900) derecha = c.offsetWidth + 24; else abajo = c.offsetHeight; }
  // arriba: lo que tapan los rótulos de arriba en la vista y en el sobrevuelo de entrada (el plano completo se encuadra debajo)
  arriba = 0;
  const bajoDe = id => { const e = $(id); if (!e || e.classList.contains('oculto')) return 0; const r = e.querySelector('.vrot'); return r ? r.getBoundingClientRect().bottom + 8 : 0; };
  arriba = Math.max(bajoDe('vista'), bajoDe('intro'));
  if (!$('vista').classList.contains('oculto')) { const b = $('vista').querySelector('.vbtns'), a = $('vAyuda'); abajo = Math.max(abajo, Hh - Math.min(b.getBoundingClientRect().top, a.textContent ? a.getBoundingClientRect().top : 1e9) + 8); }
  rd.setSize(W, Hh);
  // marco virtual: el centro de la cámara cae en el centro del hueco libre (entre arriba y abajo, a la izquierda de derecha)
  const fw = W + derecha, fh = Hh + Math.abs(abajo - arriba);
  const libreAsp = (W - derecha) / Math.max(1, Hh - abajo - arriba);
  fovBase = libreAsp < 0.8 ? 64 : libreAsp < 1.2 ? 58 : 50;
  cam.aspect = fw / fh;
  cam.setViewOffset(fw, fh, derecha, Math.max(0, abajo - arriba), W, Hh);
  planoCompleto = null; // el encuadre del trazado entero depende de este hueco
  document.documentElement.style.setProperty('--panel', abajo + 'px');
  aplicarFov(fovBase);
}
function aplicarFov(f) {
  // f es el ángulo que queremos en el hueco libre; la cámara completa es más alta
  const fh = innerHeight + Math.abs(abajo - arriba), libre = Math.max(1, innerHeight - abajo - arriba);
  cam.fov = 2 * Math.atan(Math.tan(f * Math.PI / 360) * fh / libre) * 180 / Math.PI;
  cam.updateProjectionMatrix();
}
addEventListener('resize', encuadre);
if (window.ResizeObserver) { const ro = new ResizeObserver(() => encuadre()); ro.observe($('panel')); ro.observe($('fin').firstElementChild); ro.observe($('tablero')); }

/* ---------- bucle ---------- */
const reloj3 = new THREE.Clock();
let camOrbita = 0, tGlobal = 0, avanceT = 0;
const camMira = new V3(), _a = new V3(), _b = new V3(), _q = new V3();
function colocar(dt) {
  J.corredores.forEach(r => {
    marco(r.d, r.carril, _a, _t);
    const g = r.k.g; g.position.copy(_a);
    const yaw = Math.atan2(_t.x, _t.z);
    let dy = yaw - r.yaw; while (dy > Math.PI) dy -= 2 * Math.PI; while (dy < -Math.PI) dy += 2 * Math.PI;
    r.yaw = yaw; g.rotation.y = yaw;
    if (PZ && J.fase === 'carrera') efectoKart(r, yaw);
    if (dt > 0) {
      const giro = clamp(dy / dt, -1.5, 1.5);
      r.k.cuerpo.rotation.z += (giro * 0.12 - r.k.cuerpo.rotation.z) * Math.min(1, dt * 6);
      r.k.cuerpo.position.y = Math.abs(Math.sin(tGlobal * 18 + r.carril)) * 0.035 * clamp(r.v / 10, 0, 1.5);
      r.k.ruedas.forEach(w => { w.rotation.x += r.v * dt / 0.42; });
      const fuego = r.turbo > 3;
      r.k.llamas.forEach(l => { l.visible = fuego; if (fuego) l.scale.set(1, 1, 0.6 + r.turbo / 12 + Math.random() * 0.3); });
      r.k.cab.rotation.y = Math.sin(tGlobal * 1.3 + r.carril) * 0.15;
    }
    if (r.k.et && !r.yo) { const dc = cam.position.distanceTo(g.position), e = clamp(dc / 18, 0.45, 1.25); r.k.et.visible = dc > 6.5 && dc < 110; r.k.et.scale.set(3.6 * e, e, 1); }
  });
}
function simular(dt) {
  J.tiempo += dt;
  if (J.red === 'alumno') { simularRed(dt); return; }
  const yo = J.yo, sim = D.simulacion[J.modo];
  J.corredores.forEach(r => {
    if (r.llegada != null && !r.yo) { r.d += r.v * dt; r.v = Math.max(4, r.v - dt * 3); return; }
    if (r.externo) {
      const obj = r.objetivo * J.total, antes = r.d;
      r.d += (obj - r.d) * Math.min(1, dt * 2.5);
      r.v = Math.max(0, (r.d - antes) / dt);
      if (r.objetivo >= 1 && r.llegada == null) r.llegada = J.tiempo;
      return;
    }
    const ia = !r.yo && !r.humano;
    if (ia) {
      r.prox -= dt;
      if (r.prox <= 0) {
        r.prox = rnd(sim.cada[0], sim.cada[1]);
        const bien = Math.random() < r.acierto;
        if (bien) r.turbo = Math.min(TOPE_TURBO, r.turbo + TURBO); else r.lento = 1.0;
        if (PZ) PZ.cargar(r.id, bien, false, puestoDe(r), DP.cargaRival || 4);
      }
      if (PZ && r.usarEn && J.tiempo >= r.usarEn && PZ.poder(r.id)) iaPoder(r);
    }
    let meta = BASE + r.turbo;
    if (ia && yo) meta *= 1 - clamp((r.d - yo.d) / 160, -0.14, 0.14); // ni muy lejos ni muy atrás
    if (r.lento > 0) { meta *= 0.6; r.lento -= dt; }
    if (PZ) meta *= PZ.factor(r.id);
    r.v += (meta - r.v) * Math.min(1, dt * 2.2);
    r.turbo *= Math.exp(-dt / 3.2);
    r.d += r.v * dt;
    if (r.turbo > 4 && Math.random() < dt * 14) soltarPolvo(_q.copy(r.k.g.position).setY(0.3), 0.8);
    if (rec(r) >= J.total && r.llegada == null) r.llegada = J.tiempo - (rec(r) - J.total) / Math.max(1, r.v);
  });
  if (PZ) PZ.paso(dt, listaPZ());
  if (J.red === 'tablero') { if (J.corredores.every(r => r.llegada != null)) terminar(); return; }
  if (yo.llegada != null || yo.d >= J.total) { yo.llegada = J.tiempo - (yo.d - J.total) / Math.max(1, yo.v); terminar(); }
}
// El alumno dibuja lo que manda el tablero: va hacia la última posición, adelantada con su velocidad.
function simularRed(dt) {
  const ahora = performance.now();
  J.corredores.forEach(r => {
    const e = r.red; if (!e) return;
    const meta = e.d + e.v * Math.min(1, (ahora - e.t) / 1000);
    r.d += (meta - r.d) * Math.min(1, dt * 6); r.v = e.v;
    r.turbo = Math.max(0, e.v - BASE) * 1.4;
    if (r.turbo > 4 && Math.random() < dt * 14) soltarPolvo(_q.copy(r.k.g.position).setY(0.3), 0.8);
  });
  if (PZ) PZ.paso(dt, listaPZ());
  if (J.yo && J.yo.llegada != null) terminar();
}
// Al acercarse de frente a un monumento alto (el Coltejer, la piedra) la cámara se echa atrás, abre el ángulo y levanta la
// mirada para que se vea entero; el kart queda abajo, a la vista. alza: 0..1, suavizado.
let alza = 0, giro = 0;
const _ok = new V3();
const estrecha = () => (innerWidth - derecha) / Math.max(1, innerHeight - abajo) < 1; // celular en vertical
// En pantalla estrecha, al pasar cerca de un monumento que queda a un lado, la cámara da la vuelta alrededor del kart
// (hasta 60°) para mirarlo con el kart delante: el kart no se maneja, así que el plano puede ser de cine un momento.
function giroMeta(c, m) {
  if (!estrecha()) return 0;
  let mejor = 0, peso = 0;
  const yaw = Math.atan2(m.x - c.x, m.z - c.z);
  for (const mo of MONUMENTOS) {
    const top = mo.ps.reduce((a, p) => Math.max(a, p.y), 0), p = mo.ps[0], l = Math.hypot(p.x - c.x, p.z - c.z);
    let d = Math.atan2(p.x - c.x, p.z - c.z) - yaw; while (d > Math.PI) d -= 2 * Math.PI; while (d < -Math.PI) d += 2 * Math.PI;
    const w = clamp((1.5 - Math.abs(d)) / 0.4, 0, 1) * clamp((Math.max(110, top * 3) - l) / 50, 0, 1) * clamp((l - 15) / 20, 0, 1);
    if (w > peso) { peso = w; mejor = clamp(d, -1.05, 1.05) * w; }
  }
  return mejor;
}
let bajo = 0; // 0..1: cuánto subir la cámara para ver un monumento plano
function alzaMeta(c, m) {
  let meta = 0; bajo = 0;
  const yaw = Math.atan2(m.x - c.x, m.z - c.z);
  for (const mo of MONUMENTOS) {
    const top = mo.ps.reduce((a, p) => Math.max(a, p.y), 0); if (top < 30 && !mo.plano) continue;
    const p = mo.plano ? mo.ps[mo.ps.length - 1] : mo.ps[0], l = Math.hypot(p.x - c.x, p.z - c.z);
    let d = Math.atan2(p.x - c.x, p.z - c.z) - yaw; while (d > Math.PI) d -= 2 * Math.PI; while (d < -Math.PI) d += 2 * Math.PI;
    if (mo.plano) { bajo = Math.max(bajo, Math.max(0, 1 - Math.abs(d) / 0.8) * clamp((110 - l) / 40, 0, 1)); continue; } // algo plano (un lago): subir a verlo
    // de frente (±40°) y entre 40 m y 2,6 veces su altura
    meta = Math.max(meta, Math.max(0, 1 - Math.abs(d) / 0.7) * clamp((top * 2.6 - l) / (top * 0.8), 0, 1) * clamp((l - 25) / 30, 0, 1));
  }
  return meta;
}
// La pose de la cámara de carrera a la distancia d de la vuelta (la usan la carrera y la sonda de monumentos).
let subir = 0;
function poseCarrera(d, carril, lejos, vuelo, a, pos, mira, gi) {
  marco(d - (10 + 16 * a + 4 * subir) * lejos, carril * 0.6, pos); pos.y = (5.2 + 1.6 * a + 9 * subir) * lejos + vuelo * 0.7;
  marco(d + 8, carril * 0.5, mira); mira.y = 1.8 + vuelo * 0.6 + 15.5 * a;
  if (gi) { // órbita alrededor del kart
    const k0 = marco(d, carril, _ok), c = Math.cos(gi), s = Math.sin(gi);
    for (const q of [pos, mira]) { const dx = q.x - k0.x, dz = q.z - k0.z; q.x = k0.x + dx * c + dz * s; q.z = k0.z - dx * s + dz * c; }
  }
  return 17 * a + Math.abs(gi || 0) * 6; // grados de más de ángulo de visión
}
function camaraCarrera(dt, suaveK) {
  const yo = foco(); if (!yo) return;
  const lejos = J.red === 'tablero' ? 1.5 : 1;
  const vuelo = yo.vuela ? Math.max(0, yo.k.g.position.y - 0.2) : 0; // con alas, la cámara sube con el kart
  const kk = Math.min(1, (dt || 0.016) * 1.2), s0 = subir; subir = 0;
  poseCarrera(yo.d, yo.carril, lejos, 0, 0, _a, _b);
  giro += (giroMeta(_a, _b) - giro) * kk;
  poseCarrera(yo.d, yo.carril, lejos, 0, 0, _a, _b, giro);
  alza += (alzaMeta(_a, _b) - alza) * kk; subir = s0 + (bajo - s0) * kk;
  const masFov = poseCarrera(yo.d, yo.carril, lejos, vuelo, alza, _a, _b, giro);
  const k = suaveK == null ? 1 - Math.exp(-dt * 4) : suaveK;
  cam.position.lerp(_a, k); camMira.lerp(_b, suaveK == null ? 1 - Math.exp(-dt * 7) : suaveK);
  if (sacudida > 0) { sacudida = Math.max(0, sacudida - dt * 1.6); const s = sacudida * sacudida * 0.6; cam.position.x += rnd(-s, s); cam.position.y += rnd(-s, s) * 0.6; }
  cam.lookAt(camMira);
  aplicarFov(fovBase + masFov + clamp((yo.v - BASE) * 0.55, -4, 10));
  sol.target.position.copy(yo.k.g.position); sol.position.copy(yo.k.g.position).add(SOL_OFF);
}
function cuadro(dt, pintar) {
  tGlobal += dt;
  moverNubes(dt);
  for (const f of animar) f(dt, tGlobal);
  // público que salta
  const fiesta = J.fase === 'fin' ? 1 : J.fase === 'carrera' ? 0.35 : 0.15, o = _o;
  if (publicoMesh) publico.forEach((p, i) => {
    const s = Math.max(0, Math.sin(tGlobal * 7 + p.f)) * 0.25 * fiesta;
    o.position.set(p.x, p.y + s, p.z); o.updateMatrix(); publicoMesh.setMatrixAt(i, o.matrix);
    o.position.y += 0.75; o.updateMatrix(); cabezasMesh.setMatrixAt(i, o.matrix);
  });
  if (publicoMesh) { publicoMesh.instanceMatrix.needsUpdate = true; cabezasMesh.instanceMatrix.needsUpdate = true; }
  polvo.forEach(q => { if (q.t > 0) { q.t -= dt; q.m.position.addScaledVector(q.v, dt); q.m.scale.multiplyScalar(1 - dt * 3); if (q.t <= 0) q.m.visible = false; } });
  confeti.forEach(q => { if (q.t > 0) { q.t -= dt; q.v.y -= dt * 3; q.v.multiplyScalar(1 - dt * 0.8); q.m.position.addScaledVector(q.v, dt); q.m.rotation.x += q.w.x * dt; q.m.rotation.y += q.w.y * dt; if (q.t <= 0 || q.m.position.y < 0) { q.m.visible = false; q.t = 0; } } });
  chispas.forEach(q => { if (q.t > 0) { q.t -= dt; q.v.y -= dt * 18; q.m.position.addScaledVector(q.v, dt); q.m.rotation.y += dt * 9; if (q.t <= 0) q.m.visible = false; } });
  if (avisoT > 0) { avisoT -= dt; if (avisoT <= 0) $('aviso').classList.remove('ver'); }

  if (J.fase === 'vista' && V) vistaCuadro(dt);
  else if (J.fase === 'menu' || J.fase === 'leer') {
    camOrbita += dt * 0.06;
    const ob = (PISTA && PISTA.orbita) || { r: 120, y: 62, mira: 0 }; // una pista con algo muy alto en medio pide alejarse
    const ox = ob.x != null ? ob.x : CENTRO.x, oz = ob.z != null ? ob.z : CENTRO.z;
    cam.position.set(ox + Math.cos(camOrbita) * ob.r, ob.y, oz + Math.sin(camOrbita) * ob.r);
    camMira.set(ox, ob.mira, oz); cam.lookAt(camMira); aplicarFov(fovBase);
    sol.target.position.copy(CENTRO); sol.position.copy(CENTRO).add(SOL_OFF);
    if (J.corredores.length) colocar(0);
  } else if (J.fase === 'cuenta' && cuentaT + dt < 0) {
    cuentaT += dt; introCamara(cuentaT + INTRO); colocar(dt);
  } else if (J.fase === 'cuenta') {
    if (cuentaT < 0 || !$('intro').classList.contains('oculto')) {
      cuentaT = Math.max(0, cuentaT); const tab = J.red === 'tablero';
      mostrar('intro', false); mostrar('cuenta', true); mostrar('hud', true); mostrar('velo', !tab); mostrar('bPoder', !!PZ && !tab); mostrar('tablero', tab); encuadre();
    }
    cuentaT += dt;
    const n = 3 - Math.floor(cuentaT / 0.85);
    if (n !== cuentaSon && n >= 0) { cuentaSon = n; suena(n > 0 ? 'cuenta' : 'ya'); }
    if (n !== cuentaN) {
      cuentaN = n;
      if (n > 0) { $('cNum').textContent = String(n); semaforo.forEach((m, i) => m.emissive.setHex(i <= 3 - n ? 0xff3b2b : 0)); }
      else if (n === 0) { $('cNum').textContent = '¡Ya!'; arrancar(); setTimeout(() => { if (J.fase !== 'cuenta') mostrar('cuenta', false); }, 700); }
      const c = $('cNum'); c.style.animation = 'none'; void c.offsetWidth; c.style.animation = '';
    }
    // la cámara pasa de frente al corredor a su espalda
    const yo = foco(), f = suave(0, 2.4, cuentaT);
    // órbita de frente a espalda alrededor del corredor
    marco(yo.d, yo.carril, _b, _t); _n.set(_t.z, 0, -_t.x);
    const ang = Math.PI * f, R = 9.5 + f * 0.5;
    _a.copy(_b).addScaledVector(_t, Math.cos(ang) * R).addScaledVector(_n, Math.sin(ang) * R * (yo.carril > 0 ? -1 : 1)); _a.y = 3.6 + f * 1.6;
    _b.addScaledVector(_t, 8 * f * f); _b.y = 1.2 - f * 0.2;
    if (PISTA.mirarSalida) { // algo enorme delante (la piedra): la cuenta empieza mirándolo desde detrás de la parrilla y baja al corredor
      const g = 1 - suave(0.9, 2.5, cuentaT);
      marco(yo.d - 16, yo.carril * 0.5, _q); _q.y = 7; _a.lerp(_q, g);
      _q.copy(FOCO); _q.y = PISTA.mirarSalida; _b.lerp(_q, g);
    }
    cam.position.copy(_a); camMira.copy(_b); cam.lookAt(camMira); aplicarFov(fovBase);
    sol.target.position.copy(yo.k.g.position); sol.position.copy(yo.k.g.position).add(SOL_OFF);
    colocar(dt);
  } else if (J.fase === 'carrera') {
    if (!J.pausa || J.red) { simular(dt); if (J.fase === 'carrera') { colocar(dt); dibujarObjetos(dt); camaraCarrera(dt); } }
    hudT -= dt; if (hudT <= 0 && J.fase === 'carrera') { hudT = 0.1; actualizarHUD(); }
    avanceT -= dt;
    if (avanceT <= 0 && J.fase === 'carrera') {
      avanceT = 0.5; const av = J.yo ? clamp(rec(J.yo) / J.total, 0, 1) : 0;
      try { window.dispatchEvent(new CustomEvent('carrera:avance', { detail: { avance: av, aciertos: J.aciertos } })); if (typeof window.__juego.alAvanzar === 'function') window.__juego.alAvanzar(av); } catch (e) { /* oyente ajeno */ }
    }
  } else if (J.fase === 'fin') {
    camOrbita += dt * 0.25;
    const ang = podio.rotation.y + Math.sin(camOrbita) * 0.55;
    _a.set(Math.sin(ang) * 14, 6.2, Math.cos(ang) * 14).add(podio.position);
    _b.copy(podio.position).setY(1.8);
    cam.position.lerp(_a, 1 - Math.exp(-dt * 2)); camMira.lerp(_b, 1 - Math.exp(-dt * 3)); cam.lookAt(camMira);
    aplicarFov(fovBase - 4);
    sol.target.position.copy(podio.position); sol.position.copy(podio.position).add(SOL_OFF);
    J.corredores.forEach((r, i) => { r.k.cuerpo.position.y = Math.max(0, Math.sin(tGlobal * 6 + i)) * 0.25; r.k.cab.rotation.y = Math.sin(tGlobal * 2 + i) * 0.3; });
  }
  sonar(dt);
  if (pintar) {
    // desde el plano completo la niebla se aleja con la cámara (si no, el trazado entero saldría borrado)
    if (PISTA) { const lejos = (J.fase === 'vista' || (J.fase === 'cuenta' && cuentaT < 0)) && planoCompleto ? Math.max(0, cam.position.distanceTo(planoCompleto.cen) - 120) : 0; scene.fog.near = PISTA.niebla[1] + lejos; scene.fog.far = PISTA.niebla[2] + lejos * 1.2; }
    cielo.position.copy(cam.position); rd.render(scene, cam);
  }
}
const _o = new THREE.Object3D();
let raf = 0, fondo = 0;
function bucle() { raf = requestAnimationFrame(bucle); cuadro(Math.min(0.05, reloj3.getDelta()), true); }
// En segundo plano no hay requestAnimationFrame: el tablero es la sala y sigue corriendo con un reloj (Chrome lo frena a 1 s).
function pasoFondo() { let d = Math.min(60, reloj3.getDelta()); while (d > 0) { const s = Math.min(0.05, d); cuadro(s, false); d -= s; } }
document.addEventListener('visibilitychange', () => {
  if (SN) SN.silencio('oculto', document.hidden);
  if (document.hidden) {
    cancelAnimationFrame(raf); raf = 0;
    if (J.red === 'tablero') { clearInterval(fondo); fondo = setInterval(pasoFondo, 200); }
    else if (J.fase === 'carrera' && !J.pausa && !J.red) pausar();
  } else { clearInterval(fondo); fondo = 0; if (!raf) { reloj3.getDelta(); bucle(); } }
});

/* ---------- plano completo: la cámara alta que encuadra el trazado entero y el rasgo ---------- */
// Se calcula con la caja del trazado, el FOV vertical y el aspecto del hueco libre (sin HUD ni panel), con 8 % de margen.
// La distancia es la mayor que pide cualquier rumbo, para que al girar despacio nunca se salga nada.
let planoCompleto = null;
const MARGEN = 0.08;
function puntosEncuadre() {
  const l = P.filter((_, i) => i % 6 === 0).map(p => p.clone());
  (PISTA.encuadre || []).forEach(q => l.push(new V3(q[0], q[1], q[2])));
  l.push(FOCO.clone());
  return l;
}
function calcularPlano() {
  const pts = puntosEncuadre(), cen = new V3(), lim = 1 - 2 * MARGEN;
  let y0 = 1e9, y1 = -1e9, x0 = 1e9, x1 = -1e9, z0 = 1e9, z1 = -1e9;
  pts.forEach(p => { x0 = Math.min(x0, p.x); x1 = Math.max(x1, p.x); y0 = Math.min(y0, p.y); y1 = Math.max(y1, p.y); z0 = Math.min(z0, p.z); z1 = Math.max(z1, p.z); });
  cen.set((x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2);
  const W = innerWidth - derecha, Hl = Math.max(1, innerHeight - abajo - arriba), tv = Math.tan(fovBase * Math.PI / 360), th = tv * W / Hl;
  const pitch = (PISTA.vuelo && PISTA.vuelo.inclina) || 0.85, dir = new V3(), dx = new V3(), dy = new V3(), q = new V3();
  // ¿cabe todo a esta distancia con este rumbo? (proyección en el espacio de la cámara, margen en cada borde)
  const cabe = (yaw, dist) => {
    dir.set(-Math.cos(pitch) * Math.sin(yaw), -Math.sin(pitch), -Math.cos(pitch) * Math.cos(yaw)); // hacia donde mira
    dx.set(Math.cos(yaw), 0, -Math.sin(yaw)); dy.crossVectors(dx, dir);
    for (const p of pts) {
      q.copy(p).sub(cen).addScaledVector(dir, dist); // punto relativo a la cámara (que está en cen - dir·dist)
      const z = q.dot(dir); if (z < 1) return false;
      if (Math.abs(q.dot(dx)) / z > th * lim || Math.abs(q.dot(dy)) / z > tv * lim) return false;
    }
    return true;
  };
  let dist = 0;
  for (let k = 0; k < 32; k++) {
    const yaw = k / 32 * Math.PI * 2; let a = 20, b = 3000;
    if (cabe(yaw, dist)) continue;
    for (let it = 0; it < 26; it++) { const m = (a + b) / 2; if (cabe(yaw, m)) b = m; else a = m; }
    dist = Math.max(dist, b);
  }
  return (planoCompleto = { cen, dist, pitch, pista: PISTA.id });
}
// pose del plano completo con un rumbo (yaw: hacia dónde queda la cámara respecto al centro)
function posePlano(yaw, pos, mira) {
  const pl = planoCompleto && planoCompleto.pista === PISTA.id ? planoCompleto : calcularPlano();
  pos.set(Math.sin(yaw) * Math.cos(pl.pitch), Math.sin(pl.pitch), Math.cos(yaw) * Math.cos(pl.pitch)).multiplyScalar(pl.dist).add(pl.cen);
  mira.copy(pl.cen);
}
// Cuántos puntos del trazado caen dentro del área visible (y dentro del margen) con la cámara actual. Para comprobarlo.
function medirEncuadre() {
  cam.updateMatrixWorld(); const pts = puntosEncuadre(), W = innerWidth, H = innerHeight;
  let dentro = 0, enMargen = 0;
  const mx = (W - derecha) * MARGEN * 0.9, my = (H - abajo - arriba) * MARGEN * 0.9;
  pts.forEach(p => {
    const v = p.clone().project(cam), x = (v.x + 1) / 2 * W, y = (1 - v.y) / 2 * H; // con setViewOffset, NDC ya es la ventana visible
    if (v.z < 1 && x >= 0 && x <= W - derecha && y >= arriba && y <= H - abajo) { dentro++; if (x >= mx && x <= W - derecha - mx && y >= arriba + my && y <= H - abajo - my) enMargen++; }
  });
  return { puntos: pts.length, dentro, enMargen, hueco: [W - derecha, H - abajo - arriba], arriba, abajo };
}

/* ---------- vista de la pista: recorrido de cámara para admirarla (sólo existe mientras se usa) ---------- */
const ease = x => { x = clamp(x, 0, 1); return x * x * x * (x * (x * 6 - 15) + 10); };
// La cámara del sobrevuelo inicial: de lo alto, detrás de la salida, hasta la pose de la cuenta (de frente al corredor).
function introCamara(t) {
  const yo = foco(); if (!yo) return;
  // el plano completo mira desde detrás de la salida, para que la bajada vaya derecho hacia la parrilla
  const yaw0 = Math.atan2(-T[0].x, -T[0].z) + 0.35;
  posePlano(yaw0 + t * 0.02, _q, _o.position);
  const f = ease((t - INTRO_QUIETO) / (INTRO - INTRO_QUIETO));
  marco(yo.d, yo.carril, _b, _t); const fin = _a.copy(_b).addScaledVector(_t, 9.5); fin.y = 3.6; _b.y = 1.2;
  cam.position.copy(_q).lerp(fin, f); camMira.copy(_o.position).lerp(_b, ease(f * 1.15));
  cam.lookAt(camMira); aplicarFov(fovBase);
  sol.target.position.copy(camMira); sol.position.copy(camMira).add(SOL_OFF);
}
addEventListener('pointerdown', () => { if (J.fase === 'cuenta' && cuentaT < 0 && !J.red) cuentaT = -0.0001; });
addEventListener('keydown', e => { if (J.fase === 'cuenta' && cuentaT < 0 && !J.red && (e.key === ' ' || e.key === 'Enter' || e.key === 'Escape')) cuentaT = -0.0001; });

let V = null; // estado de la vista: null fuera de ella
function verPista(id) {
  if (J.fase !== 'menu' || J.red) return;
  if (id) armarPista(id);
  J.fase = 'vista'; mostrar('inicio', false);
  $('vNom').textContent = PISTA.nombre; $('vRas').textContent = PISTA.rasgo;
  $('vAyuda').textContent = window.matchMedia && matchMedia('(pointer: coarse)').matches ? 'Arrastra para girar · pellizca para acercar' : 'Arrastra para girar · rueda para acercar';
  mostrar('vista', true); encuadre();
  let x0 = 1e9, x1 = -1e9, z0 = 1e9, z1 = -1e9; P.forEach(p => { x0 = Math.min(x0, p.x); x1 = Math.max(x1, p.x); z0 = Math.min(z0, p.z); z1 = Math.max(z1, p.z); });
  const ob = PISTA.orbita || { r: Math.max(x1 - x0, z1 - z0) * 0.62 + 50, y: Math.max(x1 - x0, z1 - z0) * 0.42 + 30, mira: 0 };
  let im = 0, md = 1e9; P.forEach((p, i) => { const d = (p.x - FOCO.x) ** 2 + (p.z - FOCO.z) ** 2; if (d < md) { md = d; im = i; } });
  const lado = (FOCO.x - P[im].x) * N[im].x + (FOCO.z - P[im].z) * N[im].z > 0 ? -1 : 1;
  const tramo = (PISTA.vuelo && PISTA.vuelo.tramo) || 0.3; // qué parte de la vuelta recorre el sobrevuelo
  const ruta = PISTA.ruta && PISTA.ruta.length > 2 ? [new THREE.CatmullRomCurve3(PISTA.ruta.map(r => new V3(...r.p))), new THREE.CatmullRomCurve3(PISTA.ruta.map(r => new V3(...r.m)))] : null;
  V = { t: 0, lado, ob, cx: ob.x != null ? ob.x : CENTRO.x, cz: ob.z != null ? ob.z : CENTRO.z, d0: (im / NS - tramo * 0.53) * LARGO, d1: (im / NS + tramo * 0.47) * LARGO, dv: ruta ? 24 : V_VUELO * Math.max(1, tramo / 0.3) * 0.8, ruta,
    mano: null, manoT: 0, punteros: new Map(), quieto: movReducido(), plano: -1, planoT: 0, siguiente: null, cambio: 0 };
  const c = rd.domElement; c.style.touchAction = 'none';
  V.on = [['pointerdown', vAbajo], ['pointermove', vMover], ['pointerup', vArriba], ['pointercancel', vArriba], ['wheel', vRueda]];
  V.on.forEach(([e, f]) => c.addEventListener(e, f, { passive: false }));
}
function salirVista(jugarAqui) {
  if (!V) return;
  const c = rd.domElement; V.on.forEach(([e, f]) => c.removeEventListener(e, f)); c.style.touchAction = '';
  V = null; mostrar('vista', false); $('vFundido').classList.remove('ver');
  J.fase = 'menu';
  if (jugarAqui) { J.sel.modo = 'una'; J.sel.pista = PISTA.id; const sp = document.querySelector('#optPistas .selpistas'); if (sp) sp.pintar(); jugar(); }
  else { mostrar('inicio', true); refrescarInicio(); encuadre(); }
}
// El recorrido: plano alto que gira (9 s) → baja (3 s) → sobrevuelo bajo por el rasgo (14 s) → sube (3 s) → otra vez.
const V_ALTO = 9, V_BAJA = 3, V_VUELO = 14;
function poseAlto(t, pos, mira) { posePlano(0.6 + t * 0.045, pos, mira); }
function poseVuelo(u, pos, mira) {
  if (V.ruta) { const f = ease(u); V.ruta[0].getPointAt(f, pos); V.ruta[1].getPointAt(f, mira); return; } // una ruta propia de la pista
  const d = V.d0 + (V.d1 - V.d0) * ease(u);
  // va del lado contrario al rasgo, para verlo a cierta distancia, y nunca mira al suelo
  const vu = PISTA.vuelo || {}; // una pista con edificios o con algo enorme al lado pide volar más alto
  marco(d, V.lado * (vu.lado != null ? vu.lado : 9), pos); pos.y = (vu.alto || 12) + Math.sin(u * Math.PI) * 5;
  // mira hacia delante y, al pasar, gira la cabeza hacia el rasgo (sólo el rumbo; la altura apenas cambia)
  marco(d + 40, 0, mira); mira.sub(pos).setY(0).normalize();
  _ve.copy(FOCO).sub(pos).setY(0); const lejos = _ve.length(); _ve.normalize();
  const w = ease(Math.max(0, 1 - Math.abs(u - 0.5) / 0.45)) * (FOCO.y > 15 ? 0.6 : 0.3); // un rasgo bajo se mira de reojo
  mira.lerp(_ve, w).normalize().multiplyScalar(40).add(pos);
  mira.y = Math.max(3, pos.y - 10 + (FOCO.y - pos.y) * w * Math.min(1, 40 / Math.max(1, lejos)));
}
const _va = new V3(), _vb = new V3(), _vc = new V3(), _vd = new V3(), _ve = new V3();
function poseCine(t, pos, mira) {
  const VV = V.dv || V_VUELO;
  t %= V_ALTO + V_BAJA + VV + V_BAJA;
  if (t < V_ALTO) poseAlto(t, pos, mira);
  else if (t < V_ALTO + V_BAJA) { const f = ease((t - V_ALTO) / V_BAJA); poseAlto(V_ALTO, pos, mira); poseVuelo(0, _vc, _vd); pos.lerp(_vc, f); mira.lerp(_vd, f); pos.y += Math.sin(f * Math.PI) * 15; }
  else if (t < V_ALTO + V_BAJA + VV) poseVuelo((t - V_ALTO - V_BAJA) / VV, pos, mira);
  else { const f = ease((t - V_ALTO - V_BAJA - VV) / V_BAJA); poseVuelo(1, pos, mira); poseAlto(0, _vc, _vd); pos.lerp(_vc, f); mira.lerp(_vd, f); }
}
// Con movimiento reducido: tres planos fijos (todo, el rasgo, la salida) que cambian por fundido cada 5 s.
function poseFija(k, pos, mira) {
  if (k === 0) poseAlto(0, pos, mira);
  else if (k === 1) { _vc.set(FOCO.x - V.cx, 0, FOCO.z - V.cz); if (_vc.lengthSq() < 100) _vc.set(1, 0, 0.4); _vc.setLength(Math.max(90, FOCO.y * 1.4)); pos.copy(FOCO).add(_vc); pos.y = FOCO.y * 0.6 + 40; mira.copy(FOCO); }
  else { marco(-40, 0, pos); pos.y = 26; marco(25, 0, mira); mira.y = 0; }
}
function vistaCuadro(dt) {
  V.t += dt;
  if (V.quieto) { // el plano cambia a mitad del fundido, cuando la pantalla está tapada
    V.planoT -= dt;
    if (V.planoT <= 0) { V.planoT = 5; V.siguiente = (V.plano + 1) % 3; V.cambio = V.plano < 0 ? 0 : 0.35; if (V.plano >= 0) $('vFundido').classList.add('ver'); }
    if (V.siguiente != null && (V.cambio -= dt) <= 0) { V.plano = V.siguiente; V.siguiente = null; $('vFundido').classList.remove('ver'); }
    poseFija(Math.max(0, V.plano), _va, _vb);
  } else poseCine(V.t, _va, _vb);
  if (V.mano) { // girando o acercando a mano; si se suelta y pasan 4 s, vuelve sola al recorrido
    const m = V.mano;
    _vc.set(Math.sin(m.th) * Math.cos(m.ph), Math.sin(m.ph), Math.cos(m.th) * Math.cos(m.ph)).multiplyScalar(m.r).add(m.mira);
    if (!V.punteros.size) V.manoT += dt;
    const vuelve = ease((V.manoT - 4) / 2);
    if (vuelve >= 1) V.mano = null;
    else { _va.copy(_vc).lerp(_va, vuelve); _vb.copy(m.mira).lerp(_vb, vuelve); }
  }
  cam.position.copy(_va); camMira.copy(_vb);
  if (cam.position.y < altura(cam.position.x, cam.position.z) + 3) cam.position.y = altura(cam.position.x, cam.position.z) + 3;
  cam.lookAt(camMira); aplicarFov(fovBase);
  sol.target.position.copy(camMira); sol.position.copy(camMira).add(SOL_OFF);
  if (J.corredores.length) colocar(0);
}
function manoDesdeCamara() {
  if (V.mano) return V.mano;
  const off = _vc.copy(cam.position).sub(camMira), r = off.length();
  return (V.mano = { mira: camMira.clone(), r, th: Math.atan2(off.x, off.z), ph: Math.asin(clamp(off.y / r, -1, 1)) });
}
function vAbajo(e) { e.preventDefault(); rd.domElement.setPointerCapture && rd.domElement.setPointerCapture(e.pointerId); V.punteros.set(e.pointerId, { x: e.clientX, y: e.clientY }); manoDesdeCamara(); V.manoT = 0; }
function vMover(e) {
  const p = V.punteros.get(e.pointerId); if (!p) return;
  const m = manoDesdeCamara(); V.manoT = 0;
  if (V.punteros.size === 1) { m.th -= (e.clientX - p.x) * 0.006; m.ph = clamp(m.ph + (e.clientY - p.y) * 0.004, 0.08, 1.45); }
  else if (V.punteros.size === 2) { const [a, b] = [...V.punteros.values()], antes = Math.hypot(a.x - b.x, a.y - b.y); p.x = e.clientX; p.y = e.clientY; const [c, d] = [...V.punteros.values()], ahora = Math.hypot(c.x - d.x, c.y - d.y); if (antes > 0 && ahora > 0) m.r = clamp(m.r * antes / ahora, 18, 520); return; }
  p.x = e.clientX; p.y = e.clientY;
}
function vArriba(e) { V.punteros.delete(e.pointerId); }
function vRueda(e) { e.preventDefault(); const m = manoDesdeCamara(); V.manoT = 0; m.r = clamp(m.r * Math.exp(e.deltaY * 0.0012), 18, 520); }
$('vVolver').addEventListener('click', () => salirVista(false));
$('vJugar').addEventListener('click', () => salirVista(true));
addEventListener('keydown', e => { if (V && e.key === 'Escape') salirVista(false); });

/* ---------- controles ---------- */
function pausar() {
  if (J.fase !== 'carrera' || J.pausa || J.red === 'tablero') return;
  J.pausa = true;
  $('pausaTx').textContent = J.red ? 'La carrera sigue: tus compañeros no se detienen.' : 'La carrera te espera. Nadie avanza mientras tanto.';
  $('bSalir').textContent = J.red ? 'Salir de la sala' : 'Salir al inicio';
  mostrar('pausa', true);
}
$('bPausa').addEventListener('click', pausar);
$('bSeguir').addEventListener('click', () => { J.pausa = false; mostrar('pausa', false); });
$('bSalir').addEventListener('click', () => { if (J.red && red) { red.salir(); return; } limpiarCorredores(); irInicio(); });
$('bTexto').addEventListener('click', () => { if (J.fase === 'carrera' && !J.pausa) abrirTexto(true); });
$('bJugar').addEventListener('click', jugar);
$('bTerminar').addEventListener('click', () => { if (red && J.red === 'tablero') red.terminar(); });
$('bCerrar').addEventListener('click', () => { if (red) red.cerrar(); });
$('bPoder').addEventListener('click', usarPoder);
$('bOtra').addEventListener('click', () => {
  if (J.red && red) { if (J.red !== 'tablero') red.salir(); else if (J.torneo && !ultimaDelTorneo()) red.siguiente(); else red.otra(); return; }
  if (J.torneo && !ultimaDelTorneo()) { siguienteCarrera(); return; }
  mostrar('fin', false); irInicio();
});
addEventListener('keydown', e => {
  if (J.fase === 'carrera' && !J.pausa && (e.key === ' ' || e.code === 'Space')) {
    e.preventDefault(); if (document.activeElement && document.activeElement.blur) document.activeElement.blur();
    usarPoder();
  } else if (J.fase === 'carrera' && !J.pausa) {
    const i = '1234'.indexOf(e.key) >= 0 ? '1234'.indexOf(e.key) : 'abcd'.indexOf(e.key.toLowerCase());
    if (i >= 0 && J.pregunta && i < J.pregunta.ops.length) { e.preventDefault(); responder(i); }
    else if (e.key === 'Escape' || e.key.toLowerCase() === 'p') pausar();
  } else if (J.fase === 'menu' && !red && e.key === 'Enter' && document.activeElement === document.body) jugar();
});

/* ---------- depuración y puente con app2 ---------- */
window.__juego = {
  estado() {
    const o = J.corredores.length ? orden() : [];
    return {
      fase: J.fase, intro: J.fase === 'cuenta' && cuentaT < 0, pausa: J.pausa, modo: J.modo, nivel: J.modo === 'tablas' ? 'tabla-' + J.tabla : J.lectura,
      puntaje: J.aciertos, aciertos: J.aciertos, errores: J.errores, racha: J.racha, tiempo: +J.tiempo.toFixed(2),
      puesto: J.yo ? o.indexOf(J.yo) + 1 : 0, avance: J.yo ? +clamp(rec(J.yo) / J.total, 0, 1).toFixed(3) : 0,
      pregunta: J.pregunta && { texto: J.pregunta.texto, ops: J.pregunta.ops, correcta: J.pregunta.correcta },
      corredores: o.map(r => ({ id: r.id, nombre: r.nombre, avance: +clamp(rec(r) / J.total, 0, 1).toFixed(3), externo: !!r.externo, llegada: r.llegada, fuera: !!r.fuera, alto: +r.k.g.position.y.toFixed(2), v: +r.v.toFixed(2), carril: r.carril })),
      resultado: J.resultado, largoPista: Math.round(LARGO), pista: PISTA && PISTA.id,
      modelo: (() => { const m = escenario.children.find(o => o.name && /\.glb$/.test(o.name)); return m ? Object.assign({ nombre: m.name }, m.userData) : null; })(),
      torneo: J.torneo ? { i: J.torneo.i, pistas: J.torneo.pistas, tabla: filasTorneo().map(t => ({ id: t.id, pts: t.pts, ult: t.ult })) } : J.torneoRed,
      poder: PZ ? PZ.poder('yo') : null, carga: PZ ? (J.red === 'alumno' ? J.cargaRed : PZ.carga('yo')) : 0,
      red: J.red, sala: red && red.sala ? red.sala() : null
    };
  },
  // Mueve un rival desde fuera (avance 0..1 de la carrera entera). Si no existe, se suma a la parrilla.
  rival(id, avance, info) {
    id = String(id); avance = clamp(+avance || 0, 0, 1);
    J.externos[id] = { avance, info: info || (J.externos[id] && J.externos[id].info) };
    const r = J.corredores.find(c => c.id === id);
    if (r) { r.externo = true; r.objetivo = avance; return true; }
    if (J.fase === 'carrera' || J.fase === 'cuenta') {
      if (J.corredores.length >= 8) return false;
      const n = J.corredores.length, base = Object.assign({ id, nombre: id, iniciales: id.slice(0, 2).toUpperCase(), animal: pick(Object.keys(ANIMALES)) }, info || {});
      Object.assign(base, { color: COLORES[n % COLORES.length], carril: CARRILES[n], d: avance * J.total, v: 0, turbo: 0, lento: 0, llegada: null, yaw: 0, externo: true, objetivo: avance, acierto: 0.7, prox: 5 });
      base.k = crearKart(base.color, base.animal); base.k.et = etiqueta(base); base.k.g.add(base.k.et); scene.add(base.k.g);
      J.corredores.push(base); construirTira(); return true;
    }
    return true; // se aplicará al armar la próxima carrera
  },
  // Lista de compañeros para la próxima carrera: [{id, nombre, iniciales, animal}]
  rivales(lista) { if (J.red) return; J.plantilla = Array.isArray(lista) && lista.length ? lista : null; J.externos = {}; },
  jugar(op) {
    if (op) {
      if (op.modo) J.modo = op.modo; if (op.tabla) J.tabla = op.tabla; if (op.lectura) J.lectura = op.lectura; if (op.animal && ANIMALES[op.animal]) J.animal = op.animal;
      if (op.pista) { J.sel.pista = pistaDef(op.pista).id; J.sel.modo = 'una'; }
      if (op.torneo) { J.sel.modo = 'torneo'; J.sel.lista = Array.isArray(op.torneo) ? op.torneo.slice() : []; }
    }
    jugar(); if (J.fase === 'leer') $('bLeido').click();
  },
  // Pistas: lista, cambiar la del inicio (se arma ya detrás), siguiente carrera del torneo, salir al inicio.
  pistas: () => PISTAS.map(p => p.id),
  ver(id) { verPista(id); return J.fase === 'vista'; },
  salirVista(jugarAqui) { salirVista(!!jugarAqui); },
  adelantarVista(s) { if (V) V.t += +s || 0; },
  // en la vista, pone la cámara a mano en p mirando a m (para mirar de cerca algo del decorado)
  verDesde(p, m) { if (!V) return false; const mira = new V3(...m), off = new V3(...p).sub(mira), r = off.length(); V.mano = { mira, r, th: Math.atan2(off.x, off.z), ph: Math.asin(clamp(off.y / r, -1, 1)) }; V.manoT = -60; return true; },
  encuadre: () => medirEncuadre(),
  monumentos: () => MONUMENTOS.map(m => ({ nombre: m.nombre, ps: m.ps.map(p => p.toArray().map(v => +v.toFixed(1))) })),
  // En qué partes de la vuelta se ve cada monumento con la cámara de carrera (centro dentro de la pantalla, sin el HUD de
  // arriba ni el panel de abajo). Se llama en carrera; mueve la cámara de prueba y la devuelve.
  visibles(paso) {
    paso = paso || 0.005; const res = {}, p0 = cam.position.clone(), m0 = camMira.clone(), W = innerWidth, H = innerHeight;
    const hud = ($('hud').getBoundingClientRect().bottom || 60) + 6, pie = H - abajo - 6;
    MONUMENTOS.forEach(m => { res[m.nombre] = []; });
    for (let f = 0; f < 1; f += paso) {
      const d = f * LARGO; subir = 0; poseCarrera(d, 0, 1, 0, 0, _a, _b); const g = giroMeta(_a, _b); poseCarrera(d, 0, 1, 0, 0, _a, _b, g);
      const a = alzaMeta(_a, _b); subir = bajo; const mf = poseCarrera(d, 0, 1, 0, a, _a, _b, g);
      cam.position.copy(_a); cam.lookAt(_b); aplicarFov(fovBase + mf); cam.updateMatrixWorld();
      // de frente: su punto central (el primero) en el 70 % central de la pantalla, entre el HUD y el panel, y sin nada delante
      const ve = p => {
        const v = p.clone().project(cam), x = (v.x + 1) / 2 * W, y = (1 - v.y) / 2 * H;
        if (!(v.z < 1 && x > W * 0.15 && x < W * 0.85 && y > hud && y < pie)) return false;
        _ray.set(cam.position, _q.copy(p).sub(cam.position).normalize()); _ray.far = Math.max(1, cam.position.distanceTo(p) - 6);
        const h = _ray.intersectObject(escenario, true).find(q => q.object.isMesh && !q.object.material.transparent && !(q.object.userData.monumento && m0.has(q.object.userData.monumento)));
        return !h;
      };
      let m0 = null;
      MONUMENTOS.forEach(m => { m0 = new Set([m.nombre]); if (m.todos ? m.ps.every(ve) : m.algun ? m.ps.some(ve) : ve(m.ps[0])) res[m.nombre].push(+(f * 100).toFixed(1)); });
    }
    cam.position.copy(p0); camMira.copy(m0); cam.lookAt(camMira);
    // juntar en tramos
    const tramos = {};
    Object.entries(res).forEach(([n, l]) => { const t = []; l.forEach(v => { const u = t[t.length - 1]; if (u && v - u[1] <= paso * 100 + 0.01) u[1] = v; else t.push([v, v]); }); tramos[n] = t.map(([a, b]) => a + '–' + b + '%'); });
    return tramos;
  },
  vista: () => (V ? { t: +V.t.toFixed(2), mano: !!V.mano, quieto: V.quieto, plano: V.plano, cam: cam.position.toArray().map(v => +v.toFixed(1)) } : null),
  saltarIntro() { if (J.fase === 'cuenta' && cuentaT < 0) { cuentaT = -0.0001; return true; } return false; },
  pista(id) { if (!PISTAS.some(p => p.id === id)) return false; J.sel.pista = id; J.sel.modo = 'una'; if (J.fase === 'menu') { armarPista(id); refrescarInicio(); const sp = document.querySelector('#optPistas .selpistas'); if (sp) sp.pintar(); } return true; },
  siguiente() { if (J.fase === 'fin' && J.torneo && !ultimaDelTorneo() && !J.red) { siguienteCarrera(); return true; } return false; },
  salir() { if (J.red) return false; mostrar('pausa', false); mostrar('fin', false); limpiarCorredores(); irInicio(); return true; },
  rendimiento: () => ({ dibujos: rd.info.render.calls, triangulos: rd.info.render.triangles, geometrias: rd.info.memory.geometries, texturas: rd.info.memory.textures }),
  responder(i) { responder(i); },
  saltar() { if (J.fase === 'carrera' && J.yo && !J.red) J.yo.d += J.total * 0.25; },
  ir(f) { if (J.fase === 'carrera' && J.yo && !J.red) { J.yo.d = Math.floor(J.yo.d / LARGO) * LARGO + f * LARGO; return true; } return false; }, // a una fracción de la vuelta
  terminar() { if (J.fase === 'carrera' && J.yo && !J.red) { J.yo.d = J.total; } },
  alAvanzar: null,
  // Poderes. El jugador local es 'yo'. Eventos planos: {tipo: gana|lanza|impacto|bloqueo|fin, poder, de, a, obj, avance, carril, dur}.
  // poder(ev): aplica uno decidido fuera (el servidor) sin volver a decidirlo; lo dibuja igual que uno local.
  poder(ev) { return PZ ? PZ.aplicar(ev) : false; },
  // Con remotos(true) el cliente ya no decide choques: emite «contacto» y espera impacto/bloqueo por poder().
  poderesRemotos(si) { if (PZ) PZ.remoto(si); },
  poderes() { return PZ ? PZ.estado() : null; },
  usarPoder() { return usarPoder(); },
  darPoder(tipo) { return PZ ? PZ.aplicar({ tipo: 'gana', poder: tipo || 'caparazon', de: 'yo' }) : false; },
  // efecto y factor de velocidad de un corredor; usarDe: en el tablero, usa el poder que tenga un alumno (como si lo pidiera)
  efecto: id => (PZ ? Object.assign({ factor: +PZ.factor(id || 'yo').toFixed(3) }, PZ.efecto(id || 'yo')) : null),
  usarDe(id) { return PZ && J.fase === 'carrera' && J.red !== 'alumno' ? !!PZ.usar(String(id), listaPZ()) : false; },
  alPoder: null, // cada evento local sale aquí y como CustomEvent 'carrera:poder'
  // Sonido: estado del contexto, ajustes, música, motor, voces vivas y cuántas veces se pidió cada efecto.
  sonido: () => (SN ? SN.estado() : null)
};

/* ---------- multijugador: la puerta del inicio; lo pesado (sala.js, multijugador.js) se carga al elegirlo ---------- */
const J3 = window.Juegos3D || {};
const conSala = !!(J3.enApp && J3.api && window.RTCPeerConnection);
function cargarScript(src) {
  return new Promise((res, rej) => { const s = document.createElement('script'); s.src = src; s.onload = res; s.onerror = () => rej(new Error('No se pudo cargar ' + src)); document.head.appendChild(s); });
}
let cargaRed = null;
function cargarRed() {
  if (window.CarreraRed) return Promise.resolve(window.CarreraRed);
  return cargaRed || (cargaRed = cargarScript('../sala/sala.js').then(() => cargarScript('multijugador.js')).then(() => window.CarreraRed).catch(e => { cargaRed = null; throw e; }));
}
const profe = n => 'Profe ' + (bonito(n).split(/\s+/)[0] || '');
let buscarT = 0;
async function buscarSalas() {
  clearTimeout(buscarT);
  if (!conSala || J3.docente || J.fase !== 'menu' || J.red || red) return;
  let lista = [];
  try { const l = await J3.api('GET', 'juegos/salas?juego=carrera'); lista = Array.isArray(l) ? l : []; } catch (e) { /* sin salas: el inicio queda como siempre */ }
  if (J.fase !== 'menu' || J.red || red) return;
  pintarInvitaciones(lista);
  buscarT = setTimeout(buscarSalas, 8000);
}
function pintarInvitaciones(lista) {
  const c = $('invita'); c.innerHTML = '';
  lista.forEach(sala => {
    const b = document.createElement('button'); b.type = 'button'; b.className = 'invita';
    const tx = document.createElement('span'), t = document.createElement('b'), g = document.createElement('small'), e = document.createElement('em');
    tx.className = 'itx'; t.textContent = profe(sala.docente_nombre) + ' te espera'; g.textContent = (sala.grupo_nombre || 'Tu grupo') + ' · Carrera en vivo'; e.textContent = 'Entrar';
    tx.append(t, g);
    b.append(avatar({ foto: sala.docente_foto, iniciales: inicialesDe(sala.docente_nombre), color: 0x0e9aa0 }), tx, e);
    b.addEventListener('click', () => entrarSala(sala));
    c.appendChild(b);
  });
  mostrar('invita', lista.length > 0);
}
async function entrarConCodigo(ev) {
  ev.preventDefault();
  const cod = $('codigoIn').value.trim().toUpperCase(), m = $('codigoMsg');
  if (!/^[A-Z0-9]{4}$/.test(cod)) { m.textContent = 'El código tiene 4 letras.'; return; }
  m.textContent = 'Buscando…';
  try { const sala = await J3.api('GET', 'juegos/salas/codigo/' + cod); m.textContent = ''; entrarSala(sala); }
  catch (e) { m.textContent = e.estado === 404 || e.estado === 410 ? 'No hay ninguna sala abierta con ese código.' : 'No se pudo buscar. Revisa la conexión.'; }
}
function entrarSala(sala) {
  if (red) return;
  clearTimeout(buscarT); guardarElecciones();
  cargarRed().then(CR => { red = CR.alumno(motor, sala); }).catch(() => aviso('No se pudo abrir la sala', true));
}
function jugarConGrupo() {
  if (red) return;
  clearTimeout(buscarT); guardarElecciones();
  cargarRed().then(CR => { red = CR.docente(motor); }).catch(() => aviso('No se pudo abrir la sala', true));
}
function prepararPuerta() {
  if (!conSala) return;
  mostrar('multi', true);
  mostrar('bGrupo', !!J3.docente); mostrar('codigoAbrir', !J3.docente);
  $('bGrupo').addEventListener('click', jugarConGrupo);
  $('codigoAbrir').addEventListener('click', () => { mostrar('codigoAbrir', false); mostrar('codigoForm', true); $('codigoIn').focus(); });
  $('codigoForm').addEventListener('submit', entrarConCodigo);
  $('codigoIn').addEventListener('input', e => { e.target.value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 4); });
}
// Sale del modo sala (la sala la cierra quien la tenga): limpia y deja el juego como el de siempre.
function dejarRed() {
  J.red = null; J.redLista = []; J.redYo = null; J.preguntaPend = null;
  document.body.classList.remove('red-tablero', 'red-alumno');
  $('bOtra').textContent = 'Otra carrera'; mostrar('bCerrar', false); document.querySelector('.botones a.sec').classList.remove('oculto');
  if (PZ) PZ.remoto(false);
  J.corredores.forEach(r => { r.k.g.visible = true; });
}

// Lo que multijugador.js usa del motor. Ids de corredor = user_id (texto); el alumno se ve a sí mismo como 'yo'.
const motor = {
  D, ANIMALES, avatar, inicialesDe, bonito, aviso, ord, reloj,
  practica: () => ({ modo: J.modo, tabla: J.tabla, lectura: J.lectura }),
  nombrePractica: p => (p.modo === 'tablas' ? (p.tabla === 'mezcla' ? 'Tablas mezcladas' : 'Tabla del ' + p.tabla) : lecturaActual(p.lectura).titulo),
  lectura: id => { const l = lecturaActual(id); return { id: l.id, titulo: l.titulo, grado: l.grado, texto: l.texto }; },
  animal: () => J.animal,
  fase: () => J.fase,
  // tablero: genera una pregunta para el contexto de un alumno {modo, tabla, lectura, ultimas, cola}
  pregunta: c => (c.modo === 'tablas' ? preguntaTabla(c) : preguntaLectura(c)),
  rapida: modo => (DP.rapida || {})[modo] || 3,
  empezar(op) {
    J.red = op.papel; J.redYo = op.yo || null; J.redLista = op.lista.slice();
    if (op.practica) { J.modo = op.practica.modo; J.tabla = op.practica.tabla; J.lectura = op.practica.lectura; }
    document.body.classList.toggle('red-tablero', J.red === 'tablero'); document.body.classList.toggle('red-alumno', J.red === 'alumno');
    ['inicio', 'fin', 'leer', 'pausa'].forEach(id => mostrar(id, false));
    confeti.forEach(q => { q.m.visible = false; });
    Object.assign(J, { pausa: false, pregunta: null, preguntaPend: null, aciertos: op.aciertos || 0, errores: op.errores || 0, racha: 0, tiempo: op.t || 0, cola: [], ultimas: [], resultado: null, ultimaVuelta: false, cargaRed: 0, usando: 0 });
    armarPista(op.pista || J.sel.pista); J.redFin = false;
    const tor = op.torneo && Array.isArray(op.torneo.pistas) ? op.torneo : null;
    if (J.red === 'tablero') {
      if (!tor) J.torneo = null;
      else { if (!J.torneo || tor.i === 0) J.torneo = { pistas: tor.pistas.slice(), i: 0, tabla: {} }; J.torneo.i = tor.i; }
    } else { J.torneo = null; J.torneoRed = tor ? { i: tor.i, n: tor.pistas.length } : null; }
    J.total = (D.vueltas[J.modo] || 2) * LARGO;
    armarCorredores();
    if (PZ) { PZ.reiniciar(J.total); PZ.remoto(J.red === 'alumno'); }
    limpiarObjetos(); $('feed').innerHTML = ''; sacudida = 0;
    pintarPoder(); $('hRacha').textContent = '';
    $('pTag').textContent = nombreModo(); mostrar('bTexto', J.modo === 'lectura' && J.red === 'alumno');
    $('hCodigo').textContent = op.codigo || '';
    construirTira();
    empezarCuenta();
    if (op.fase === 'carrera') { cuentaN = 0; mostrar('cuenta', false); arrancar(); }
  },
  // tablero
  corredores: () => J.corredores.map(r => ({ id: r.uid, nombre: r.completo, foto: r.foto, animal: r.animal, carril: r.carril, d0: r.d0, c: COLORES.indexOf(r.color) })),
  sumar(p) {
    if (J.corredores.some(r => r.uid === p.id)) return false;
    const r = nuevoRed(Object.assign({ carril: CARRILES_RED[J.corredores.length % 6], d0: 0, c: J.corredores.length }, p), J.corredores.length);
    J.corredores.push(r); J.redLista.push(p); if (p.id === J.redYo) J.yo = r;
    construirTira(); return true;
  },
  fuera(uid, si) { const r = J.corredores.find(c => c.uid === uid); if (r) r.fuera = !!si; },
  responderRed(uid, bien, rapida) {
    const r = J.corredores.find(c => c.uid === uid); if (!r || J.fase !== 'carrera' || r.llegada != null) return null;
    impulso(r, bien);
    if (PZ) PZ.cargar(r.id, bien, rapida, puestoDe(r));
    return { racha: r.racha, carga: PZ ? PZ.carga(r.id) : 0 };
  },
  usarRed(uid) { const r = J.corredores.find(c => c.uid === uid); return !!(PZ && r && J.fase === 'carrera' && PZ.usar(r.id, listaPZ())); },
  poderDe: uid => (PZ ? PZ.poder(uid) : null),
  estado: () => ({ s: +J.tiempo.toFixed(2), c: J.corredores.map(r => [r.uid, +r.d.toFixed(2), +r.v.toFixed(2), r.llegada != null ? +r.llegada.toFixed(2) : null]) }),
  terminar() { if (J.fase === 'carrera' || J.fase === 'cuenta') terminar(); },
  // alumno
  aplicarEstado(e) {
    const ahora = performance.now();
    (e.c || []).forEach(([uid, d, v, ll]) => {
      const r = J.corredores.find(c => c.uid === uid); if (!r) return;
      if (!r.red || J.fase === 'fin') r.d = d;
      r.red = { d, v, t: ahora };
      if (ll != null && r.llegada == null) r.llegada = ll;
    });
    if (J.fase === 'fin') { const k = orden().map(r => r.uid + (r.llegada != null ? '+' : '-')).join(); if (k !== J.finClave) { J.finClave = k; pintarFinalRed(); } }
  },
  pregunta2(q) {
    if (J.fase === 'carrera') nuevaPregunta(q); else J.preguntaPend = q;
  },
  veredicto(v) {
    if (!J.pregunta || J.pregunta.id !== v.q) return;
    J.cargaRed = v.carga || 0;
    mostrarVeredicto(J.respuesta, !!v.bien, v.correcta, !!v.rapida);
  },
  poder(ev) {
    if (!PZ) return false;
    const yo = id => (id != null && id === J.redYo ? 'yo' : id);
    return PZ.aplicar(Object.assign({}, ev, { de: yo(ev.de), a: yo(ev.a) }));
  },
  finRed(e) {
    J.redFin = true;
    if (e && e.torneo && J.torneoRed) J.torneoRed.filas = e.torneo.filas;
    if (e) motor.aplicarEstado(e);
    if (J.fase !== 'fin') { J.fase = 'carrera'; terminar(); } else if (e && e.torneo) pintarFinalRed();
  },
  // pistas y torneo (el tablero elige; el alumno sólo arma la que le llega)
  PISTAS: PISTAS.map(p => ({ id: p.id, nombre: p.nombre, rasgo: p.rasgo })),
  selectorPistas, completarTorneo,
  plan: () => ({ modo: J.sel.modo, pista: J.sel.pista, lista: J.sel.lista.slice() }),
  nombrePlan: pl => (pl && pl.modo === 'torneo' ? 'Torneo: ' + (pl.lista && pl.lista.length ? pl.lista.map(id => pistaDef(id).nombre).join(' · ') : '3 pistas') : 'Pista: ' + pistaDef(pl && pl.pista).nombre),
  verPista: id => { if (J.fase === 'menu') armarPista(id); },
  torneo: () => (J.torneo ? { i: J.torneo.i, pistas: J.torneo.pistas, filas: filasTorneo().map(t => [t.id, t.pts, t.ult]) } : null),
  // los dos
  salir() { red = null; limpiarCorredores(); irInicio(); },
  // de vuelta a la sala de espera (sigue en la sala): sin carrera ni inicio debajo de la tarjeta
  alLobby() {
    J.fase = 'menu'; J.pausa = false; dejarRed(); limpiarCorredores();
    ['hud', 'velo', 'panel', 'pausa', 'fin', 'leer', 'cuenta', 'bPoder', 'tablero', 'inicio', 'intro'].forEach(id => mostrar(id, false));
    limpiarObjetos(); $('feed').innerHTML = ''; confeti.forEach(q => { q.m.visible = false; }); encuadre();
  },
  entrar: sala => { red = null; entrarSala(sala); },
  red: () => red
};

/* ---------- arranque ---------- */
prepararPuerta();
construirInicio();
$('cargando').remove();
irInicio();
reloj3.getDelta();
bucle();
})();
