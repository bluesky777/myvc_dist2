/* Carrera del curso — motor. Las preguntas y los compañeros vienen de datos.js (window.DATOS_CARRERA).
   Los rivales se simulan; desde fuera se pueden mover con window.__juego.rival(id, avance). */
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
function cieloTex(a, b) {
  const c = document.createElement('canvas'); c.width = 2; c.height = 256;
  const x = c.getContext('2d'), g = x.createLinearGradient(0, 0, 0, 256);
  g.addColorStop(0, a); g.addColorStop(0.55, '#bfe8f2'); g.addColorStop(1, b); x.fillStyle = g; x.fillRect(0, 0, 2, 256);
  return new THREE.CanvasTexture(c);
}
scene.background = cieloTex('#6cc6ec', '#fff1d6');
scene.fog = new THREE.Fog(0xf6ecd6, 110, 340);
scene.add(new THREE.HemisphereLight(0xfff3e0, 0x5f8f4e, 0.62));
const sol = new THREE.DirectionalLight(0xfff0d8, 0.9);
sol.castShadow = true; sol.shadow.mapSize.set(1024, 1024); sol.shadow.bias = -0.0005;
Object.assign(sol.shadow.camera, { left: -34, right: 34, top: 34, bottom: -34, near: 1, far: 140 });
scene.add(sol, sol.target);
const SOL_OFF = new V3(28, 52, 18);

const mats = {};
const M = (c, o) => { const k = c + JSON.stringify(o || {}); return mats[k] || (mats[k] = new THREE.MeshStandardMaterial(Object.assign({ color: c, flatShading: true, roughness: 0.85 }, o || {}))); };
const sombra = (o, recibe) => { o.traverse(m => { if (m.isMesh) { m.castShadow = true; m.receiveShadow = !!recibe; } }); return o; };
const malla = (geo, mat, x, y, z) => { const m = new THREE.Mesh(geo, mat); m.position.set(x || 0, y || 0, z || 0); return m; };

/* ---------- pista ---------- */
const ANCHO = 12;
const CP = [[0, -62], [40, -62], [72, -46], [82, -12], [62, 10], [40, 18], [34, 42], [54, 64], [36, 86], [0, 84], [-26, 62], [-52, 62], [-80, 44], [-86, 8], [-66, -30], [-38, -58]];
const curva = new THREE.CatmullRomCurve3(CP.map(([x, z]) => new V3(x, 0, z)), true, 'centripetal');
const LARGO = curva.getLength();
const NS = 720, P = [], T = [], N = [];
for (let i = 0; i <= NS; i++) {
  const u = (i % NS) / NS, p = curva.getPointAt(u), t = curva.getTangentAt(u);
  P.push(p); T.push(t); N.push(new V3(t.z, 0, -t.x).normalize());
}
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
const MUESTRAS = P.filter((_, i) => i % 3 === 0);
function distPista(x, z) { let m = 1e9; for (const p of MUESTRAS) { const dx = p.x - x, dz = p.z - z, d = dx * dx + dz * dz; if (d < m) m = d; } return Math.sqrt(m); }
function dentro(x, z) { let c = false; for (let i = 0, j = MUESTRAS.length - 1; i < MUESTRAS.length; j = i++) { const a = MUESTRAS[i], b = MUESTRAS[j]; if ((a.z > z) !== (b.z > z) && x < (b.x - a.x) * (z - a.z) / (b.z - a.z) + a.x) c = !c; } return c; }

// Cinta de quads a lo largo de la pista entre dos distancias laterales.
function cinta(l0, l1, y, colorDe) {
  const pos = [], col = [], c = new THREE.Color(), a = new V3(), b = new V3(), e = new V3(), f = new V3();
  for (let i = 0; i < NS; i++) {
    const h = colorDe(i); if (h == null) continue;
    a.copy(P[i]).addScaledVector(N[i], l0); b.copy(P[i]).addScaledVector(N[i], l1);
    e.copy(P[i + 1]).addScaledVector(N[i + 1], l0); f.copy(P[i + 1]).addScaledVector(N[i + 1], l1);
    pos.push(a.x, y, a.z, e.x, y, e.z, b.x, y, b.z, b.x, y, b.z, e.x, y, e.z, f.x, y, f.z);
    c.setHex(h); for (let k = 0; k < 6; k++) col.push(c.r, c.g, c.b);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute('color', new THREE.Float32BufferAttribute(col, 3));
  g.computeVertexNormals();
  const m = new THREE.Mesh(g, new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.95 }));
  m.receiveShadow = true; scene.add(m); return m;
}
const H = ANCHO / 2;
cinta(-H, H, 0.02, i => (i % 2 ? 0x5d6675 : 0x5a6372));
cinta(-H - 3.2, -H - 1.1, 0.012, () => 0xe9cf96); cinta(H + 1.1, H + 3.2, 0.012, () => 0xe9cf96);
cinta(-H - 1.1, -H, 0.07, i => (Math.floor(i / 5) % 2 ? 0xff6a4d : 0xfffdf7));
cinta(H, H + 1.1, 0.07, i => (Math.floor(i / 5) % 2 ? 0xfffdf7 : 0xff6a4d));
cinta(-H + 0.35, -H + 0.6, 0.035, () => 0xfffdf7); cinta(H - 0.6, H - 0.35, 0.035, () => 0xfffdf7);
cinta(-0.15, 0.15, 0.035, i => (Math.floor(i / 6) % 2 ? null : 0xf3e3b8));

// Línea de meta a cuadros
function cuadros(nx, ny, px) {
  const c = document.createElement('canvas'); c.width = nx * px; c.height = ny * px; const x = c.getContext('2d');
  for (let i = 0; i < nx; i++) for (let j = 0; j < ny; j++) { x.fillStyle = (i + j) % 2 ? '#15304d' : '#fffdf7'; x.fillRect(i * px, j * px, px, px); }
  const t = new THREE.CanvasTexture(c); t.magFilter = THREE.NearestFilter; return t;
}
{
  const m = new THREE.Mesh(new THREE.PlaneGeometry(ANCHO, 1.6), new THREE.MeshStandardMaterial({ map: cuadros(12, 2, 16), roughness: 0.9 }));
  m.geometry.rotateX(-Math.PI / 2); m.position.copy(P[0]).setY(0.045);
  m.rotation.y = Math.atan2(-N[0].z, N[0].x); // la anchura queda a lo largo de la normal
  m.receiveShadow = true; scene.add(m);
}

// Lado de afuera en la recta de salida (allí van la tribuna y el podio).
const AFUERA = dentro(P[0].x + N[0].x * 10, P[0].z + N[0].z * 10) ? -1 : 1;
const PODIO_C = P[0].clone().addScaledVector(N[0], AFUERA * 15).addScaledVector(T[0], 27);
const TRIB_C = P[0].clone().addScaledVector(N[0], AFUERA * 21);

/* ---------- terreno ---------- */
const ruido = (x, z) => Math.sin(x * 0.045) * Math.cos(z * 0.05) * 1.6 + Math.sin(x * 0.11 + z * 0.07) * 0.7 + Math.cos(z * 0.13 - x * 0.03) * 0.5;
let LAGO = null;
{
  let mejor = 0;
  for (let x = -80; x <= 80; x += 4) for (let z = -60; z <= 90; z += 4) {
    if (!dentro(x, z)) continue;
    const d = distPista(x, z); if (d > mejor) { mejor = d; LAGO = { x, z, r: Math.min(18, d - 13) }; }
  }
  if (LAGO && LAGO.r < 5) LAGO = null;
}
const CENTRO = new V3(-2, 0, 12);
function altura(x, z, dd) {
  if (dd === undefined) dd = distPista(x, z);
  let y = -0.04 + suave(H + 11, H + 34, dd) * (ruido(x, z) + 2.8) * 0.75;
  const dx = x - CENTRO.x, dz = z - CENTRO.z, r = Math.hypot(dx, dz);
  if (r > 140) y += (r - 140) * 0.42 * (0.7 + 0.3 * Math.sin(Math.atan2(dz, dx) * 7));
  if (LAGO) { const dl = Math.hypot(x - LAGO.x, z - LAGO.z); y = y * suave(LAGO.r - 3, LAGO.r + 3, dl) + (-1.6) * (1 - suave(LAGO.r - 3, LAGO.r + 3, dl)); }
  return y;
}
{
  const S = 600, SEG = 120, g = new THREE.PlaneGeometry(S, S, SEG, SEG); g.rotateX(-Math.PI / 2); g.translate(CENTRO.x, 0, CENTRO.z);
  const pos = g.attributes.position;
  for (let i = 0; i < pos.count; i++) pos.setY(i, altura(pos.getX(i), pos.getZ(i)));
  const ng = g.toNonIndexed(), p2 = ng.attributes.position, col = [], c = new THREE.Color();
  const verdes = [0x7cbf57, 0x72b652, 0x69ad4d];
  for (let i = 0; i < p2.count; i += 3) {
    const y = (p2.getY(i) + p2.getY(i + 1) + p2.getY(i + 2)) / 3;
    let h = verdes[Math.floor(azarFijo() * 3)];
    if (y < -0.6) h = 0xe9cf96; else if (y > 60) h = 0xfbf4e4; else if (y > 34) h = 0xc8ae86; else if (y > 16) h = 0x86a463; else if (y > 3.5) h = 0x68a84f;
    c.setHex(h); for (let k = 0; k < 3; k++) col.push(c.r, c.g, c.b);
  }
  ng.setAttribute('color', new THREE.Float32BufferAttribute(col, 3)); ng.computeVertexNormals();
  const suelo = new THREE.Mesh(ng, new THREE.MeshStandardMaterial({ vertexColors: true, flatShading: true, roughness: 1 }));
  suelo.receiveShadow = true; scene.add(suelo);
  if (LAGO) {
    const agua = new THREE.Mesh(new THREE.CircleGeometry(LAGO.r + 1.5, 28), new THREE.MeshStandardMaterial({ color: 0x2db3ad, roughness: 0.25, metalness: 0.1, transparent: true, opacity: 0.92 }));
    agua.rotation.x = -Math.PI / 2; agua.position.set(LAGO.x, -0.35, LAGO.z); scene.add(agua);
    for (let k = 0; k < 3; k++) { // nenúfares
      const a = azarFijo() * 6.28, r = azarFijo() * LAGO.r * 0.7;
      const n = malla(new THREE.CylinderGeometry(0.9, 0.9, 0.08, 7), M(0x2f9e5d), LAGO.x + Math.cos(a) * r, -0.28, LAGO.z + Math.sin(a) * r); scene.add(n);
    }
  }
}

/* ---------- árboles, rocas, nubes ---------- */
{
  const lugares = [];
  for (let k = 0; k < 900 && lugares.length < 230; k++) {
    const x = CENTRO.x + (azarFijo() - 0.5) * 300, z = CENTRO.z + (azarFijo() - 0.5) * 300;
    const dd = distPista(x, z); if (dd < H + 6) continue;
    if (LAGO && Math.hypot(x - LAGO.x, z - LAGO.z) < LAGO.r + 3) continue;
    if (Math.hypot(x - TRIB_C.x, z - TRIB_C.z) < 26 || Math.hypot(x - PODIO_C.x, z - PODIO_C.z) < 12) continue;
    if (lugares.some(l => Math.hypot(l.x - x, l.z - z) < 4)) continue;
    lugares.push({ x, z, y: altura(x, z, dd), s: 0.8 + azarFijo() * 0.8, tipo: azarFijo() });
  }
  const redondos = lugares.filter(l => l.tipo < 0.55), pinos = lugares.filter(l => l.tipo >= 0.55 && l.tipo < 0.9), rocas = lugares.filter(l => l.tipo >= 0.9);
  const tronco = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.25, 0.35, 2, 6), M(0x9a6a3c), redondos.length + pinos.length);
  const copa = new THREE.InstancedMesh(new THREE.IcosahedronGeometry(1.7, 0), M(0xffffff), redondos.length);
  const cono = new THREE.InstancedMesh(new THREE.ConeGeometry(1.5, 3.6, 7), M(0xffffff), pinos.length * 2);
  const roca = new THREE.InstancedMesh(new THREE.DodecahedronGeometry(1, 0), M(0xd8c7a6), rocas.length);
  const o = new THREE.Object3D(), c = new THREE.Color();
  const tonos = [0x2f9e5d, 0x46b86a, 0x5cc26e, 0x3aa860, 0x8fcf5a];
  let it = 0;
  redondos.forEach((l, i) => {
    o.position.set(l.x, l.y + l.s, l.z); o.scale.setScalar(l.s); o.rotation.set(0, 0, 0); o.updateMatrix(); tronco.setMatrixAt(it++, o.matrix);
    o.position.set(l.x, l.y + l.s * 3.1, l.z); o.rotation.set(azarFijo(), azarFijo() * 6, 0); o.scale.set(l.s, l.s * 1.1, l.s); o.updateMatrix(); copa.setMatrixAt(i, o.matrix);
    copa.setColorAt(i, c.setHex(tonos[i % tonos.length]));
  });
  pinos.forEach((l, i) => {
    o.rotation.set(0, 0, 0); o.position.set(l.x, l.y + l.s * 0.8, l.z); o.scale.setScalar(l.s * 0.8); o.updateMatrix(); tronco.setMatrixAt(it++, o.matrix);
    o.position.set(l.x, l.y + l.s * 3.0, l.z); o.scale.setScalar(l.s); o.updateMatrix(); cono.setMatrixAt(i * 2, o.matrix);
    o.position.set(l.x, l.y + l.s * 4.6, l.z); o.scale.setScalar(l.s * 0.72); o.updateMatrix(); cono.setMatrixAt(i * 2 + 1, o.matrix);
    cono.setColorAt(i * 2, c.setHex(0x23804a)); cono.setColorAt(i * 2 + 1, c.setHex(0x2f9e5d));
  });
  rocas.forEach((l, i) => { o.position.set(l.x, l.y + 0.3, l.z); o.rotation.set(azarFijo() * 3, azarFijo() * 3, 0); o.scale.set(l.s * 1.4, l.s, l.s * 1.2); o.updateMatrix(); roca.setMatrixAt(i, o.matrix); });
  [tronco, copa, cono, roca].forEach(m => { m.castShadow = true; m.receiveShadow = true; scene.add(m); });
}
const nubes = [];
{
  const g = new THREE.IcosahedronGeometry(1, 0), m = new THREE.MeshLambertMaterial({ color: 0xffffff, emissive: 0x8a8a8a });
  for (let i = 0; i < 12; i++) {
    const n = new THREE.Group();
    for (let k = 0; k < 4; k++) { const b = new THREE.Mesh(g, m); b.position.set(k * 3 - 4.5, Math.random() * 1.5, Math.random() * 2); b.scale.setScalar(2.6 + Math.random() * 2.2); n.add(b); }
    n.position.set(CENTRO.x + rnd(-200, 200), rnd(42, 70), CENTRO.z + rnd(-200, 200)); n.userData.v = rnd(1, 2.5);
    scene.add(n); nubes.push(n);
  }
}
// Globos aerostáticos
const globos = [];
[[0xff6a4d, 0xffc23a, -40, 34, -20], [0x0e9aa0, 0xfffdf7, 60, 40, 70], [0xffc23a, 0x2f9e5d, -70, 30, 90]].forEach(([a, b, x, y, z]) => {
  const g = new THREE.Group();
  g.add(malla(new THREE.SphereGeometry(4, 10, 8), M(a), 0, 0, 0));
  const banda = malla(new THREE.CylinderGeometry(4.08, 3.3, 2.2, 10, 1, true), M(b, { side: THREE.DoubleSide }), 0, -1.6, 0); g.add(banda);
  g.add(malla(new THREE.BoxGeometry(1.4, 1.1, 1.4), M(0x9a6a3c), 0, -6.4, 0));
  g.position.set(x, y, z); g.userData.y = y; scene.add(g); globos.push(g);
});

/* ---------- tribuna, arco de meta, banderines, podio ---------- */
const publico = [];
let publicoMesh = null, cabezasMesh = null;
{
  const g = new THREE.Group(); g.position.copy(TRIB_C);
  g.rotation.y = Math.atan2(-AFUERA * N[0].x, -AFUERA * N[0].z);
  // gradas: z local mira hacia la pista
  for (let s = 0; s < 4; s++) { const b = malla(new THREE.BoxGeometry(34, 1.1 + s * 1.1, 2.4), M(s % 2 ? 0xfff4dc : 0xf2e2bd), 0, (1.1 + s * 1.1) / 2, 3 - s * 2.4); g.add(b); }
  for (const x of [-16.5, 16.5]) for (const z of [-5.5, 3.6]) g.add(malla(new THREE.CylinderGeometry(0.22, 0.22, 9, 6), M(0xfffdf7), x, 4.5, z));
  for (let k = 0; k < 10; k++) g.add(malla(new THREE.BoxGeometry(3.45, 0.3, 10.6), M(k % 2 ? 0xff6a4d : 0xfffdf7), -15.5 + k * 3.45, 9.1, -1));
  const n = 120, cuerpo = new THREE.InstancedMesh(new THREE.BoxGeometry(0.7, 0.9, 0.5), M(0xffffff), n), cabeza = new THREE.InstancedMesh(new THREE.IcosahedronGeometry(0.33, 0), M(0xffffff), n);
  const c = new THREE.Color(), ropa = [0xff6a4d, 0x0e9aa0, 0xffc23a, 0x2f9e5d, 0x15304d, 0x8e6bd8, 0xff8fb1], piel = [0xf1c27d, 0xe0ac69, 0xc68642, 0x8d5524, 0xffdbac];
  for (let i = 0; i < n; i++) {
    const s = i % 4, x = -15.5 + Math.floor(i / 4) * 1.07 + (s % 2) * 0.3;
    publico.push({ x, y: 1.1 + s * 1.1 + 0.45, z: 3 - s * 2.4, f: Math.random() * 6 });
    cuerpo.setColorAt(i, c.setHex(ropa[i % ropa.length])); cabeza.setColorAt(i, c.setHex(piel[(i * 7) % piel.length]));
  }
  g.add(cuerpo, cabeza); publicoMesh = cuerpo; cabezasMesh = cabeza;
  sombra(g, true); scene.add(g);
}
const semaforo = [];
{
  const g = new THREE.Group(); g.position.copy(P[0]); g.rotation.y = Math.atan2(T[0].x, T[0].z);
  for (const x of [-(H + 1.6), H + 1.6]) { g.add(malla(new THREE.BoxGeometry(0.9, 7.4, 0.9), M(0xfffdf7), x, 3.7, 0)); g.add(malla(new THREE.BoxGeometry(1.3, 0.5, 1.3), M(0xff6a4d), x, 0.25, 0)); }
  const c = document.createElement('canvas'); c.width = 512; c.height = 96; const x = c.getContext('2d');
  for (let i = 0; i < 32; i++) for (let j = 0; j < 6; j++) { x.fillStyle = (i + j) % 2 ? '#15304d' : '#fffdf7'; x.fillRect(i * 16, j * 16, 16, 16); }
  const tex = new THREE.CanvasTexture(c);
  const letrero = () => {
    x.fillStyle = '#ff6a4d'; x.beginPath(); x.roundRect ? x.roundRect(156, 14, 200, 68, 20) : x.rect(156, 14, 200, 68); x.fill();
    x.fillStyle = '#fff'; x.font = '900 52px Grandstander, Lexend, sans-serif'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText('META', 256, 50);
    tex.needsUpdate = true;
  };
  letrero(); if (document.fonts) document.fonts.load('900 52px Grandstander').then(letrero, () => {});
  const banda = malla(new THREE.BoxGeometry(ANCHO + 4.2, 1.9, 0.5), [M(0xfffdf7), M(0xfffdf7), M(0xfffdf7), M(0xfffdf7), new THREE.MeshStandardMaterial({ map: tex }), new THREE.MeshStandardMaterial({ map: tex })], 0, 7.2, 0);
  g.add(banda);
  for (let i = 0; i < 3; i++) { const l = malla(new THREE.SphereGeometry(0.34, 10, 8), new THREE.MeshStandardMaterial({ color: 0x444b57, emissive: 0x000000 }), (i - 1) * 1.1, 5.85, 0.1); g.add(l); semaforo.push(l.material); }
  g.add(malla(new THREE.BoxGeometry(3.8, 0.9, 0.4), M(0x15304d), 0, 5.85, 0));
  sombra(g); scene.add(g);
}
// banderines en postes a lo largo de la pista
{
  const g = new THREE.ConeGeometry(0.5, 1.4, 3), poste = new THREE.CylinderGeometry(0.07, 0.07, 3.6, 5), cs = [0xff6a4d, 0xffc23a, 0x0e9aa0, 0x2f9e5d];
  for (let i = 0; i < NS; i += 36) {
    for (const lado of [-1, 1]) {
      if ((i < 48 || i > NS - 30) && lado === AFUERA) continue;
      const p = P[i].clone().addScaledVector(N[i], lado * (H + 4.2));
      scene.add(malla(poste, M(0xfffdf7), p.x, 1.8, p.z));
      const f = malla(g, M(cs[(i / 36 + (lado > 0 ? 1 : 0)) % 4]), p.x, 3.1, p.z); f.rotation.z = -Math.PI / 2; f.rotation.y = Math.random() * 6; f.scale.set(1, 1, 0.25); scene.add(f);
    }
  }
}
let podio;
{
  podio = new THREE.Group(); podio.position.copy(PODIO_C); podio.rotation.y = Math.atan2(N[0].x, N[0].z) + (AFUERA > 0 ? Math.PI : 0);
  const alto = [1.8, 1.25, 0.8], xs = [0, -3.2, 3.2], cols = [0xffc23a, 0xd9dde3, 0xe8a06a];
  for (let i = 0; i < 3; i++) {
    const c = document.createElement('canvas'); c.width = 128; c.height = 128; const x = c.getContext('2d');
    const tx = new THREE.CanvasTexture(c);
    const num = () => { x.fillStyle = hex(cols[i]); x.fillRect(0, 0, 128, 128); x.fillStyle = '#15304d'; x.font = '900 80px Grandstander, sans-serif'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(String(i + 1), 64, 70); tx.needsUpdate = true; };
    num(); if (document.fonts) document.fonts.load('900 80px Grandstander').then(num, () => {});
    const caraM = new THREE.MeshStandardMaterial({ map: tx, flatShading: true });
    const m = M(cols[i]);
    podio.add(malla(new THREE.BoxGeometry(3.1, alto[i], 2.9), [m, m, m, m, caraM, m], xs[i], alto[i] / 2, 0));
  }
  podio.add(malla(new THREE.CylinderGeometry(6.6, 6.9, 0.25, 22), M(0xfff4dc), 0, 0.1, 0));
  podio.userData = { alto, xs };
  sombra(podio, true); scene.add(podio);
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

/* ---------- estado de la carrera ---------- */
const CARRILES = [-4.25, -2.55, -0.85, 0.85, 2.55, 4.25, -3.4, 3.4], CARRILES_SALIDA = [-0.85, 0.85, -2.55, 2.55, -4.25, 4.25, -3.4, 3.4];
const BASE = 8.6, TURBO = 8.5, TOPE_TURBO = 20;
const J = {
  fase: 'menu', modo: prog.modo === 'lectura' ? 'lectura' : 'tablas', tabla: prog.tabla || 7,
  lectura: D.lecturas.some(l => l.id === prog.lectura) ? prog.lectura : D.lecturas[0].id,
  animal: ANIMALES[prog.animal] ? prog.animal : 'zorro',
  corredores: [], yo: null, total: 0, tiempo: 0, aciertos: 0, errores: 0, racha: 0, pausa: false,
  pregunta: null, bloqueo: false, cola: [], ultimas: [], externos: {}, plantilla: null, resultado: null, ultimaVuelta: false
};

function limpiarCorredores() { J.corredores.forEach(r => { scene.remove(r.k.g); r.k.g.traverse(o => { if (o.isSprite) { o.material.map.dispose(); o.material.dispose(); } }); }); J.corredores = []; }
function armarCorredores() {
  limpiarCorredores();
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
    r.d = -3 - Math.floor(i / 2) * 5; r.v = 0; r.turbo = 0; r.lento = 0; r.llegada = null; r.bam = 0; r.yaw = 0;
    r.acierto = rnd(sim.acierto[0], sim.acierto[1]); r.prox = rnd(sim.cada[0], sim.cada[1]) + 1;
    const ext = J.externos[r.id]; r.externo = !!ext; r.objetivo = ext ? ext.avance : 0;
    r.k = crearKart(r.color, r.animal); r.k.et = etiqueta(r); r.k.g.add(r.k.et); if (r.yo) r.k.et.visible = false;
    scene.add(r.k.g);
  });
  J.corredores = todos; J.yo = yo;
  colocar(0);
}
function orden() {
  return J.corredores.slice().sort((a, b) => {
    if (a.llegada != null && b.llegada != null) return a.llegada - b.llegada;
    if (a.llegada != null) return -1; if (b.llegada != null) return 1;
    return b.d - a.d;
  });
}

/* ---------- preguntas ---------- */
function preguntaTabla() {
  const max = D.tablas.factorMax || 10;
  const t = J.tabla === 'mezcla' ? pick(D.tablas.disponibles) : J.tabla;
  let b; do { b = 1 + Math.floor(Math.random() * max); } while (J.ultimas.includes(t + 'x' + b) && max > 3);
  J.ultimas.push(t + 'x' + b); if (J.ultimas.length > 4) J.ultimas.shift();
  const inversa = Math.random() < (D.tablas.proporcionInversa || 0) && b > 1;
  const resp = inversa ? b : t * b;
  const cand = inversa ? [b + 1, b - 1, b + 2, b - 2, t] : [t * (b + 1), t * (b - 1), (t + 1) * b, (t - 1) * b, t * b + 1, t * b - 1, t * b + 10, t + b];
  const otras = barajar([...new Set(cand.filter(v => v > 0 && v !== resp))]).slice(0, 3);
  const ops = barajar([resp, ...otras]);
  return { texto: inversa ? t + ' × ? = ' + t * b : t + ' × ' + b + ' = ?', ops: ops.map(String), correcta: ops.indexOf(resp), larga: false };
}
function lecturaActual() { return D.lecturas.find(l => l.id === J.lectura) || D.lecturas[0]; }
function preguntaLectura() {
  if (!J.cola.length) J.cola = barajar(lecturaActual().preguntas.slice());
  const q = J.cola.shift(), idx = barajar(q.o.map((_, i) => i));
  return { texto: q.p, ops: idx.map(i => q.o[i]), correcta: idx.indexOf(q.correcta), larga: true };
}
function nuevaPregunta() {
  J.pregunta = J.modo === 'tablas' ? preguntaTabla() : preguntaLectura();
  J.bloqueo = false;
  const q = J.pregunta, pq = $('pq'), ops = $('ops');
  pq.textContent = q.texto; pq.classList.toggle('larga', q.larga);
  ops.classList.toggle('uno', q.larga && q.ops.some(o => o.length > 12));
  ops.innerHTML = '';
  q.ops.forEach((o, i) => { const b = document.createElement('button'); b.className = 'op' + (q.larga ? ' txt' : ''); b.textContent = o; b.addEventListener('click', () => responder(i)); ops.appendChild(b); });
}
let avisoT = 0;
function aviso(txt, mal) { const a = $('aviso'); a.textContent = txt; a.className = 'aviso ver' + (mal ? ' mal' : ''); avisoT = mal ? 1.6 : 1.0; }
function responder(i) {
  if (J.fase !== 'carrera' || J.pausa || J.bloqueo || !J.pregunta) return;
  J.bloqueo = true;
  const q = J.pregunta, bs = $('ops').children, bien = i === q.correcta, yo = J.yo;
  [...bs].forEach(b => { b.disabled = true; });
  bs[q.correcta].classList.add('bien');
  if (bien) {
    J.aciertos++; J.racha++;
    yo.turbo = Math.min(TOPE_TURBO, yo.turbo + TURBO);
    if (J.racha % 3 === 0) { yo.turbo = Math.min(TOPE_TURBO + 5, yo.turbo + 5); aviso(D.mensajes.racha); } else aviso(pick(D.mensajes.bien));
    for (let k = 0; k < 6; k++) soltarPolvo(yo.k.g.position.clone().add(new V3(rnd(-1, 1), 0.4, 0)), 1.3);
  } else {
    J.errores++; J.racha = 0; yo.lento = 1.0; bs[i].classList.add('mal');
    aviso(pick(D.mensajes.mal) + ' ' + q.ops[q.correcta], true);
  }
  $('hRacha').textContent = J.racha >= 2 ? 'racha ' + J.racha : '';
  setTimeout(() => { if (J.fase === 'carrera') nuevaPregunta(); }, bien ? 600 : 1400);
}

/* ---------- interfaz ---------- */
const mostrar = (id, si) => $(id).classList.toggle('oculto', !si);
function claveMarca() { return J.modo === 'tablas' ? 'tabla-' + J.tabla : 'lectura-' + J.lectura; }
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
}
function refrescarInicio() {
  document.querySelectorAll('.modo').forEach(b => b.classList.toggle('sel', b.dataset.modo === J.modo));
  mostrar('optTablas', J.modo === 'tablas'); mostrar('optLectura', J.modo === 'lectura');
  document.querySelectorAll('.chip').forEach(b => b.classList.toggle('sel', String(J.tabla) === b.dataset.t));
  document.querySelectorAll('.lect').forEach(b => b.classList.toggle('sel', J.lectura === b.dataset.id));
  document.querySelectorAll('.ani').forEach(b => b.classList.toggle('sel', J.animal === b.dataset.a));
  const m = prog.marcas[claveMarca()];
  $('marcaP').textContent = m ? 'Tu marca en «' + nombreModo() + '»: ' + reloj(m.tiempo) + ' · mejor puesto ' + ord(m.puesto) : 'Aún no tienes marca en «' + nombreModo() + '». ¡Pon la primera!';
}
function irInicio() {
  J.fase = 'menu'; J.pausa = false;
  ['hud', 'velo', 'panel', 'pausa', 'fin', 'leer', 'cuenta'].forEach(id => mostrar(id, false));
  confeti.forEach(q => { q.m.visible = false; });
  mostrar('inicio', true); refrescarInicio(); encuadre();
  semaforo.forEach(m => m.emissive.setHex(0));
}
function guardarElecciones() { prog.modo = J.modo; prog.tabla = J.tabla; prog.lectura = J.lectura; prog.animal = J.animal; guardarP(prog); }
function jugar() {
  guardarElecciones();
  mostrar('inicio', false); mostrar('fin', false);
  confeti.forEach(q => { q.m.visible = false; });
  J.pregunta = null; J.aciertos = 0; J.errores = 0; J.racha = 0; J.tiempo = 0; J.cola = []; J.ultimas = []; J.resultado = null; J.ultimaVuelta = false;
  J.total = (D.vueltas[J.modo] || 2) * LARGO;
  armarCorredores();
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
let cuentaT = 0, cuentaN = 0;
function empezarCuenta() {
  J.fase = 'cuenta'; cuentaT = 0; cuentaN = 3;
  mostrar('hud', true); mostrar('panel', true); mostrar('velo', true); mostrar('cuenta', true);
  $('cNum').textContent = '3'; $('cTip').textContent = D.comoSeJuega;
  $('pq').textContent = 'Prepárate…'; $('pq').classList.remove('larga'); $('ops').innerHTML = '';
  semaforo.forEach(m => m.emissive.setHex(0)); semaforo[0].emissive.setHex(0xff3b2b);
  encuadre(); actualizarHUD(true);
}
function construirTira() {
  const t = $('tira'); t.innerHTML = '';
  J.corredores.forEach(r => { const d = document.createElement('div'); d.className = 'pt' + (r.yo ? ' yo' : ''); d.style.background = hex(r.color); d.textContent = r.yo ? 'TÚ' : r.iniciales; r.dot = d; t.appendChild(d); });
}
let hudT = 0, ultPuesto = 0;
function actualizarHUD(forzar) {
  const o = orden(), p = o.indexOf(J.yo) + 1;
  if (p !== ultPuesto || forzar) { $('hPuesto').textContent = ord(p); $('hDe').textContent = 'de ' + o.length; ultPuesto = p; }
  const vueltas = D.vueltas[J.modo] || 2, v = clamp(Math.floor(Math.max(0, J.yo.d) / LARGO) + 1, 1, vueltas);
  $('hVuelta').textContent = 'Vuelta ' + v + '/' + vueltas;
  if (v === vueltas && vueltas > 1 && !J.ultimaVuelta && J.fase === 'carrera') { J.ultimaVuelta = true; aviso('¡Última vuelta!'); }
  J.corredores.forEach(r => { r.dot.style.left = (clamp(r.d / J.total, 0, 1) * 100) + '%'; });
  $('hVel').textContent = Math.round(J.yo.v * 7);
}

/* ---------- final ---------- */
const ESTRELLA = on => '<svg viewBox="0 0 24 24"><path d="M12 2.5l2.9 6 6.6.9-4.8 4.6 1.2 6.5L12 17.4 6.1 20.5l1.2-6.5L2.5 9.4l6.6-.9z" fill="' + (on ? '#ffc23a' : '#ead9b4') + '" stroke="#15304d" stroke-width="1.4" stroke-linejoin="round"/></svg>';
function terminar() {
  if (J.fase !== 'carrera') return;
  J.fase = 'fin'; J.pausa = false;
  const yo = J.yo; if (yo.llegada == null) yo.llegada = J.tiempo;
  J.corredores.forEach(r => { if (r.llegada == null) r.llegada = J.tiempo + Math.max(0.5, (J.total - r.d) / Math.max(BASE, r.v)); });
  const o = orden(), puesto = o.indexOf(yo) + 1, est = puesto === 1 ? 3 : puesto <= 3 ? 2 : 1;
  const clave = claveMarca(), prev = prog.marcas[clave];
  const nueva = !prev || yo.llegada < prev.tiempo;
  prog.marcas[clave] = { tiempo: nueva ? +yo.llegada.toFixed(1) : prev.tiempo, puesto: prev ? Math.min(prev.puesto, puesto) : puesto, estrellas: Math.max(prev ? prev.estrellas : 0, est), carreras: (prev ? prev.carreras || 0 : 0) + 1 };
  guardarP(prog);
  J.resultado = { puesto, estrellas: est, tiempo: yo.llegada, nueva, aciertos: J.aciertos, errores: J.errores };
  ['hud', 'velo', 'panel', 'cuenta'].forEach(id => mostrar(id, false));
  $('fEst').innerHTML = [1, 2, 3].map(i => ESTRELLA(i <= est)).join('');
  $('fTit').textContent = puesto === 1 ? '¡Ganaste la carrera!' : puesto <= 3 ? '¡Subiste al podio!' : '¡Llegaste a la meta!';
  const total = J.aciertos + J.errores;
  $('fSub').innerHTML = 'Acertaste <b>' + J.aciertos + ' de ' + total + '</b> · tiempo <b>' + reloj(yo.llegada) + '</b><br>' +
    (nueva ? '¡Nueva marca personal!' : 'Tu marca: ' + reloj(prev.tiempo));
  const ol = $('fTabla'); ol.innerHTML = '';
  o.forEach((r, i) => {
    const li = document.createElement('li'); if (r.yo) li.className = 'yo';
    li.innerHTML = '<span class="n"></span><span class="av"></span><span class="nom"></span><span class="t"></span>';
    li.children[0].textContent = ord(i + 1); li.children[1].textContent = r.yo ? 'TÚ' : r.iniciales; li.children[1].style.background = hex(r.color);
    li.children[2].textContent = r.yo ? 'Tú' : r.nombre; li.children[3].textContent = reloj(r.llegada); ol.appendChild(li);
  });
  // al podio
  const u = podio.userData;
  o.forEach((r, i) => {
    const g = r.k.g;
    if (i < 3) { g.position.set(u.xs[i], u.alto[i], 0); podio.localToWorld(g.position); }
    else { g.position.set((i - 3 - (o.length - 4) / 2) * 2.6, 0, -4.6); podio.localToWorld(g.position); }
    if (r.k.et) { r.k.et.visible = i < 3; r.k.et.scale.set(2.9, 0.8, 1); r.k.et.position.y = 2.9; }
    g.rotation.set(0, podio.rotation.y, 0); r.k.cuerpo.rotation.set(0, 0, 0); r.k.llamas.forEach(l => { l.visible = false; });
  });
  lanzarConfeti(podio.position);
  camOrbita = 0;
  mostrar('fin', true); encuadre();
}

/* ---------- encuadre: el centro de la vista queda en el hueco libre ---------- */
let abajo = 0, derecha = 0, fovBase = 55;
function encuadre() {
  const W = innerWidth, Hh = innerHeight;
  abajo = 0; derecha = 0;
  if (!$('panel').classList.contains('oculto')) abajo = $('panel').offsetHeight;
  if (!$('fin').classList.contains('oculto')) { const c = $('fin').firstElementChild; if (W >= 900) derecha = c.offsetWidth + 24; else abajo = c.offsetHeight; }
  rd.setSize(W, Hh);
  const fw = W + derecha, fh = Hh + abajo;
  const libreAsp = (W - derecha) / Math.max(1, Hh - abajo);
  fovBase = libreAsp < 0.8 ? 64 : libreAsp < 1.2 ? 58 : 50;
  cam.aspect = fw / fh;
  cam.setViewOffset(fw, fh, derecha, abajo, W, Hh);
  document.documentElement.style.setProperty('--panel', abajo + 'px');
  aplicarFov(fovBase);
}
function aplicarFov(f) {
  // f es el ángulo que queremos en el hueco libre; la cámara completa es más alta
  const fh = innerHeight + abajo, libre = Math.max(1, innerHeight - abajo);
  cam.fov = 2 * Math.atan(Math.tan(f * Math.PI / 360) * fh / libre) * 180 / Math.PI;
  cam.updateProjectionMatrix();
}
addEventListener('resize', encuadre);
if (window.ResizeObserver) { const ro = new ResizeObserver(() => encuadre()); ro.observe($('panel')); ro.observe($('fin').firstElementChild); }

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
    if (!r.yo) {
      r.prox -= dt;
      if (r.prox <= 0) {
        r.prox = rnd(sim.cada[0], sim.cada[1]);
        if (Math.random() < r.acierto) r.turbo = Math.min(TOPE_TURBO, r.turbo + TURBO); else r.lento = 1.0;
      }
    }
    let meta = BASE + r.turbo;
    if (!r.yo) meta *= 1 - clamp((r.d - yo.d) / 160, -0.14, 0.14); // ni muy lejos ni muy atrás
    if (r.lento > 0) { meta *= 0.6; r.lento -= dt; }
    r.v += (meta - r.v) * Math.min(1, dt * 2.2);
    r.turbo *= Math.exp(-dt / 3.2);
    r.d += r.v * dt;
    if (r.turbo > 4 && Math.random() < dt * 14) soltarPolvo(_q.copy(r.k.g.position).setY(0.3), 0.8);
    if (r.d >= J.total && r.llegada == null) r.llegada = J.tiempo - (r.d - J.total) / Math.max(1, r.v);
  });
  if (yo.llegada != null || yo.d >= J.total) { yo.llegada = J.tiempo - (yo.d - J.total) / Math.max(1, yo.v); terminar(); }
}
function camaraCarrera(dt, suaveK) {
  const yo = J.yo;
  marco(yo.d - 10, yo.carril * 0.6, _a); _a.y = 5.2;
  marco(yo.d + 8, yo.carril * 0.5, _b); _b.y = 1.0;
  const k = suaveK == null ? 1 - Math.exp(-dt * 4) : suaveK;
  cam.position.lerp(_a, k); camMira.lerp(_b, suaveK == null ? 1 - Math.exp(-dt * 7) : suaveK); cam.lookAt(camMira);
  aplicarFov(fovBase + clamp((yo.v - BASE) * 0.55, -4, 10));
  sol.target.position.copy(yo.k.g.position); sol.position.copy(yo.k.g.position).add(SOL_OFF);
}
function cuadro() {
  const dt = Math.min(0.05, reloj3.getDelta());
  tGlobal += dt;
  nubes.forEach(n => { n.position.x += n.userData.v * dt; if (n.position.x > CENTRO.x + 220) n.position.x = CENTRO.x - 220; });
  globos.forEach((g, i) => { g.position.y = g.userData.y + Math.sin(tGlobal * 0.5 + i * 2) * 1.5; g.rotation.y += dt * 0.1; });
  // público que salta
  const fiesta = J.fase === 'fin' ? 1 : J.fase === 'carrera' ? 0.35 : 0.15, o = _o;
  publico.forEach((p, i) => {
    const s = Math.max(0, Math.sin(tGlobal * 7 + p.f)) * 0.25 * fiesta;
    o.position.set(p.x, p.y + s, p.z); o.updateMatrix(); publicoMesh.setMatrixAt(i, o.matrix);
    o.position.y += 0.75; o.updateMatrix(); cabezasMesh.setMatrixAt(i, o.matrix);
  });
  publicoMesh.instanceMatrix.needsUpdate = true; cabezasMesh.instanceMatrix.needsUpdate = true;
  polvo.forEach(q => { if (q.t > 0) { q.t -= dt; q.m.position.addScaledVector(q.v, dt); q.m.scale.multiplyScalar(1 - dt * 3); if (q.t <= 0) q.m.visible = false; } });
  confeti.forEach(q => { if (q.t > 0) { q.t -= dt; q.v.y -= dt * 3; q.v.multiplyScalar(1 - dt * 0.8); q.m.position.addScaledVector(q.v, dt); q.m.rotation.x += q.w.x * dt; q.m.rotation.y += q.w.y * dt; if (q.t <= 0 || q.m.position.y < 0) { q.m.visible = false; q.t = 0; } } });
  if (avisoT > 0) { avisoT -= dt; if (avisoT <= 0) $('aviso').classList.remove('ver'); }

  if (J.fase === 'menu' || J.fase === 'leer') {
    camOrbita += dt * 0.06;
    cam.position.set(CENTRO.x + Math.cos(camOrbita) * 120, 62, CENTRO.z + Math.sin(camOrbita) * 120);
    camMira.set(CENTRO.x, 0, CENTRO.z); cam.lookAt(camMira); aplicarFov(fovBase);
    sol.target.position.copy(CENTRO); sol.position.copy(CENTRO).add(SOL_OFF);
    if (J.corredores.length) colocar(0);
  } else if (J.fase === 'cuenta') {
    cuentaT += dt;
    const n = 3 - Math.floor(cuentaT / 0.85);
    if (n !== cuentaN) {
      cuentaN = n;
      if (n > 0) { $('cNum').textContent = String(n); semaforo.forEach((m, i) => m.emissive.setHex(i <= 3 - n ? 0xff3b2b : 0)); }
      else if (n === 0) { $('cNum').textContent = '¡Ya!'; semaforo.forEach(m => m.emissive.setHex(0x3bd16f)); J.fase = 'carrera'; reloj3.getDelta(); nuevaPregunta(); setTimeout(() => { if (J.fase !== 'cuenta') mostrar('cuenta', false); }, 700); }
      const c = $('cNum'); c.style.animation = 'none'; void c.offsetWidth; c.style.animation = '';
    }
    // la cámara pasa de frente al corredor a su espalda
    const yo = J.yo, f = suave(0, 2.4, cuentaT);
    // órbita de frente a espalda alrededor del corredor
    marco(yo.d, yo.carril, _b, _t); _n.set(_t.z, 0, -_t.x);
    const ang = Math.PI * f, R = 9.5 + f * 0.5;
    _a.copy(_b).addScaledVector(_t, Math.cos(ang) * R).addScaledVector(_n, Math.sin(ang) * R * (yo.carril > 0 ? -1 : 1)); _a.y = 3.6 + f * 1.6;
    _b.addScaledVector(_t, 8 * f * f); _b.y = 1.2 - f * 0.2;
    cam.position.copy(_a); camMira.copy(_b); cam.lookAt(camMira); aplicarFov(fovBase);
    sol.target.position.copy(yo.k.g.position); sol.position.copy(yo.k.g.position).add(SOL_OFF);
    colocar(dt);
  } else if (J.fase === 'carrera') {
    if (!J.pausa) { simular(dt); if (J.fase === 'carrera') { colocar(dt); camaraCarrera(dt); } }
    hudT -= dt; if (hudT <= 0 && J.fase === 'carrera') { hudT = 0.1; actualizarHUD(); }
    avanceT -= dt;
    if (avanceT <= 0 && J.fase === 'carrera') {
      avanceT = 0.5; const av = clamp(J.yo.d / J.total, 0, 1);
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
  rd.render(scene, cam);
}
const _o = new THREE.Object3D();
let raf = 0;
function bucle() { raf = requestAnimationFrame(bucle); cuadro(); }
document.addEventListener('visibilitychange', () => {
  if (document.hidden) { cancelAnimationFrame(raf); raf = 0; if (J.fase === 'carrera' && !J.pausa) pausar(); }
  else if (!raf) { reloj3.getDelta(); bucle(); }
});

/* ---------- controles ---------- */
function pausar() { if (J.fase !== 'carrera' || J.pausa) return; J.pausa = true; mostrar('pausa', true); }
$('bPausa').addEventListener('click', pausar);
$('bSeguir').addEventListener('click', () => { J.pausa = false; mostrar('pausa', false); });
$('bSalir').addEventListener('click', () => { limpiarCorredores(); irInicio(); });
$('bTexto').addEventListener('click', () => { if (J.fase === 'carrera' && !J.pausa) abrirTexto(true); });
$('bJugar').addEventListener('click', jugar);
$('bOtra').addEventListener('click', () => { mostrar('fin', false); irInicio(); });
addEventListener('keydown', e => {
  if (J.fase === 'carrera' && !J.pausa) {
    const i = '1234'.indexOf(e.key) >= 0 ? '1234'.indexOf(e.key) : 'abcd'.indexOf(e.key.toLowerCase());
    if (i >= 0 && J.pregunta && i < J.pregunta.ops.length) { e.preventDefault(); responder(i); }
    else if (e.key === 'Escape' || e.key.toLowerCase() === 'p') pausar();
  } else if (J.fase === 'menu' && e.key === 'Enter' && document.activeElement === document.body) jugar();
});

/* ---------- depuración y puente con app2 ---------- */
window.__juego = {
  estado() {
    const o = J.corredores.length ? orden() : [];
    return {
      fase: J.fase, pausa: J.pausa, modo: J.modo, nivel: J.modo === 'tablas' ? 'tabla-' + J.tabla : J.lectura,
      puntaje: J.aciertos, aciertos: J.aciertos, errores: J.errores, racha: J.racha, tiempo: +J.tiempo.toFixed(2),
      puesto: J.yo ? o.indexOf(J.yo) + 1 : 0, avance: J.yo ? +clamp(J.yo.d / J.total, 0, 1).toFixed(3) : 0,
      pregunta: J.pregunta && { texto: J.pregunta.texto, ops: J.pregunta.ops, correcta: J.pregunta.correcta },
      corredores: o.map(r => ({ id: r.id, nombre: r.nombre, avance: +clamp(r.d / J.total, 0, 1).toFixed(3), externo: !!r.externo, llegada: r.llegada })),
      resultado: J.resultado, largoPista: Math.round(LARGO)
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
  rivales(lista) { J.plantilla = Array.isArray(lista) && lista.length ? lista : null; J.externos = {}; },
  jugar(op) { if (op) { if (op.modo) J.modo = op.modo; if (op.tabla) J.tabla = op.tabla; if (op.lectura) J.lectura = op.lectura; if (op.animal && ANIMALES[op.animal]) J.animal = op.animal; } jugar(); if (J.fase === 'leer') $('bLeido').click(); },
  responder(i) { responder(i); },
  saltar() { if (J.fase === 'carrera') J.yo.d += J.total * 0.25; },
  terminar() { if (J.fase === 'carrera') { J.yo.d = J.total; } },
  alAvanzar: null
};

/* ---------- arranque ---------- */
construirInicio();
$('cargando').remove();
irInicio();
reloj3.getDelta();
bucle();
})();
