/* Microviaje — motor. Un nanorobot nada dentro de una célula (animal o vegetal) y va al organelo que
   pide la misión. El contenido (organelos, niveles, misiones, preguntas) está en datos.js. */
(function () {
'use strict';
var D = window.DATOS_CELULA, ORG = D.organelos, NIV = D.niveles;
var Sonido = window.Sonido || new Proxy({}, { get: function () { return function () {}; } });
var $ = function (s) { return document.querySelector(s); };
var CLAVE = 'juegos3d.celula';
var MR = 1.3; /* radio del nanorobot */
var COLEGIO = (getComputedStyle(document.documentElement).getPropertyValue('--colegio') || '').trim() || '#ff6a4d';

/* ---------- Escena ---------- */
var rd = new THREE.WebGLRenderer({ antialias: true });
rd.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));
rd.setSize(innerWidth, innerHeight);
rd.shadowMap.enabled = true; rd.shadowMap.type = THREE.PCFSoftShadowMap;
$('#gl').appendChild(rd.domElement);
var escena = new THREE.Scene();
escena.background = new THREE.Color('#154b63');
escena.fog = new THREE.Fog('#154b63', 70, 150);
var cam = new THREE.PerspectiveCamera(50, innerWidth / innerHeight, 0.5, 400);
escena.add(new THREE.HemisphereLight('#fff6e5', '#3a6f86', 0.7));
var sol = new THREE.DirectionalLight('#ffffff', 0.55);
sol.castShadow = true; sol.shadow.mapSize.set(1024, 1024); sol.shadow.bias = -0.0008;
(function (c) { c.left = -45; c.right = 45; c.top = 45; c.bottom = -45; c.near = 1; c.far = 140; })(sol.shadow.camera);
escena.add(sol); escena.add(sol.target);

function mat(c, o) {
  o = o || {};
  var m = new THREE.MeshStandardMaterial({ color: c, flatShading: !o.liso, roughness: o.r == null ? 0.75 : o.r, metalness: o.m || 0,
    emissive: o.em || '#000000', emissiveIntensity: o.ei == null ? 1 : o.ei });
  if (o.op != null) { m.transparent = true; m.opacity = o.op; m.depthWrite = false; }
  return m;
}
function malla(geo, m, sombra) { var x = new THREE.Mesh(geo, m); x.castShadow = sombra !== false; x.receiveShadow = true; return x; }
function azar(semilla) {
  var a = semilla >>> 0;
  return function () { a = (a + 0x6D2B79F5) >>> 0; var t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}
function tubo(puntos, radio, m, cerrado, segs) {
  var c = new THREE.CatmullRomCurve3(puntos.map(function (p) { return new THREE.Vector3(p[0], p[1], p[2]); }), !!cerrado);
  return malla(new THREE.TubeGeometry(c, segs || puntos.length * 4, radio, 6, !!cerrado), m);
}
function arco(cx, cz, r, a0, a1, y, n, onda, fase) {
  var p = [];
  for (var i = 0; i <= n; i++) {
    var a = a0 + (a1 - a0) * i / n, rr = r + (onda ? Math.sin(i * 1.7 + (fase || 0)) * onda : 0);
    p.push([cx + rr * Math.cos(a), y, cz + rr * Math.sin(a)]);
  }
  return p;
}
function puntos(geo, lista, m) {
  var im = new THREE.InstancedMesh(geo, m, lista.length), o = new THREE.Object3D();
  lista.forEach(function (p, i) { o.position.set(p[0], p[1], p[2]); o.updateMatrix(); im.setMatrixAt(i, o.matrix); });
  im.castShadow = true; return im;
}
/* de local (eje x del objeto) a mundo, girado `ang` en el plano xz */
function giro(x, z, ang, lx, lz) { var c = Math.cos(ang), s = Math.sin(ang); return [x + lx * c - lz * s, z + lx * s + lz * c]; }

/* ---------- Organelos ---------- */
function pon(c, id, obj, circs, ancla) {
  c.g.add(obj);
  circs.forEach(function (k) { c.formas.push({ id: id, x: k[0], z: k[1], r: k[2], obj: obj }); });
  if (ancla) c.anclas.push({ id: id, x: ancla[0], y: ancla[1], z: ancla[2] });
}

function nucleo(c, x, z, r) {
  var g = new THREE.Group(); g.position.set(x, 0, z);
  var env = malla(new THREE.SphereGeometry(r, 24, 14), mat('#8d63d9', { op: 0.5 }), false); env.scale.y = 0.55;
  var inn = malla(new THREE.SphereGeometry(r * 0.9, 24, 14), mat('#b39af0')); inn.scale.y = 0.5;
  var nl = malla(new THREE.SphereGeometry(r * 0.3, 14, 10), mat('#4b2a8a')); nl.position.set(r * 0.2, r * 0.36, -r * 0.15); nl.scale.y = 0.6;
  g.add(env, inn, nl);
  var rr = azar(11), mc = mat('#6a3fc0');
  for (var k = 0; k < 5; k++) {
    var p = [], a = rr() * 6.28, rad = r * (0.25 + rr() * 0.4);
    for (var i = 0; i < 6; i++) {
      a += (rr() - 0.5) * 1.6; rad = Math.min(r * 0.75, Math.max(r * 0.15, rad + (rr() - 0.5) * r * 0.25));
      var px = rad * Math.cos(a), pz = rad * Math.sin(a), q = r * 0.9;
      p.push([px, 0.5 * Math.sqrt(Math.max(0, q * q - px * px - pz * pz)) + 0.1, pz]);
    }
    g.add(tubo(p, 0.2, mc));
  }
  var poros = [];
  for (var j = 0; j < 22; j++) { var b = j / 22 * 6.283; poros.push([Math.cos(b) * r * 0.97, r * 0.13, Math.sin(b) * r * 0.97]); }
  g.add(puntos(new THREE.SphereGeometry(0.28, 6, 4), poros, mat('#3b1f6b')));
  pon(c, 'nucleo', g, [[x, z, r + 0.2]], [x, r * 0.55 + 1.6, z]);
}

function reticulo(c, cx, cz, r0, a0, a1) {
  var g = new THREE.Group(), m = mat('#3b9be0'), rib = [];
  for (var k = 0; k < 3; k++) {
    var r = r0 + k * 2.1;
    g.add(tubo(arco(cx, cz, r, a0, a1, 1, 28, 0.45, k * 2), 0.8, m));
    arco(cx, cz, r + 0.9, a0, a1, 1.5, 22, 0.45, k * 2).forEach(function (p, i) { if (i % 2 === k % 2) rib.push(p); });
  }
  g.add(puntos(new THREE.SphereGeometry(0.3, 6, 4), rib, mat('#5b2d82')));
  var circs = [];
  arco(cx, cz, r0 + 2.1, a0, a1, 0, Math.ceil((a1 - a0) / 0.22)).forEach(function (p) { circs.push([p[0], p[2], 3.2]); });
  var am = (a0 + a1) / 2;
  pon(c, 're', g, circs, [cx + (r0 + 2.1) * Math.cos(am), 3.4, cz + (r0 + 2.1) * Math.sin(am)]);
}

/* `ang` apunta del Golgi hacia el núcleo: la cara convexa mira hacia allá */
function golgi(c, x, z, ang) {
  var g = new THREE.Group(), R = 7, ox = x - Math.cos(ang) * R, oz = z - Math.sin(ang) * R;
  var ms = [mat('#f2a623'), mat('#ffc23a')];
  for (var k = 0; k < 4; k++) {
    var sp = 0.85 - k * 0.1, t = tubo(arco(ox, oz, R - k * 1.35, ang - sp, ang + sp, 0, 18), 0.58, ms[k % 2]);
    t.position.y = 1.2; t.scale.y = 0.5; g.add(t);
  }
  var ves = [], mv = mat('#ffd36b');
  [-1.05, 1.05].forEach(function (s) { for (var k = 0; k < 3; k++) { var a = ang + s * (0.95 + k * 0.12), rr = R - 0.5 - k * 1.5; ves.push([ox + rr * Math.cos(a), 1.2, oz + rr * Math.sin(a)]); } });
  g.add(puntos(new THREE.SphereGeometry(0.5, 8, 6), ves, mv));
  var circs = [];
  arco(ox, oz, R - 2, ang - 0.8, ang + 0.8, 0, 6).forEach(function (p) { circs.push([p[0], p[2], 2.6]); });
  pon(c, 'golgi', g, circs, [ox + (R - 2) * Math.cos(ang), 3.4, oz + (R - 2) * Math.sin(ang)]);
}

function mitocondria(c, x, z, ang) {
  var g = new THREE.Group(); g.position.set(x, 0, z); g.rotation.y = -ang;
  var e = malla(new THREE.SphereGeometry(1, 16, 10), mat('#ff6a4d')); e.scale.set(4.2, 1.5, 1.9); e.position.y = 1.3;
  var p = [];
  for (var i = 0; i <= 9; i++) {
    var lx = -3.3 + i * 0.733, f = Math.sqrt(1 - (lx / 4.2) * (lx / 4.2)), lz = (i % 2 ? 0.95 : -0.95) * f;
    p.push([lx, 1.3 + 1.5 * Math.sqrt(Math.max(0, 1 - (lx / 4.2) * (lx / 4.2) - (lz / 1.9) * (lz / 1.9))) + 0.05, lz]);
  }
  g.add(e, tubo(p, 0.2, mat('#ffd9b3'), false, 60));
  pon(c, 'mitocondria', g, [-2.4, 0, 2.4].map(function (l) { var w = giro(x, z, ang, l, 0); return [w[0], w[1], 2.0]; }), [x, 4.2, z]);
}

function ribosomas(c, x, z, s) {
  var g = new THREE.Group(); g.position.set(x, 0, z);
  var p = [], big = [], small = [];
  for (var i = 0; i < 7; i++) {
    var a = s + i * 0.95, rad = 0.4 + i * 0.27, px = rad * Math.cos(a), pz = rad * Math.sin(a);
    p.push([px, 1.0, pz]); big.push([px, 1.2, pz]); small.push([px, 1.75, pz]);
  }
  g.add(tubo(p, 0.1, mat('#ff8f73'), false, 40));
  g.add(puntos(new THREE.SphereGeometry(0.55, 8, 6), big, mat('#5b2d82')));
  g.add(puntos(new THREE.SphereGeometry(0.38, 8, 6), small, mat('#7b4fb0')));
  pon(c, 'ribosoma', g, [[x, z, 2.6]], [x, 3.4, z]);
}

function lisosoma(c, x, z) {
  var g = new THREE.Group(); g.position.set(x, 0, z);
  var b = malla(new THREE.SphereGeometry(1.6, 14, 10), mat('#2f9e5d')); b.position.y = 1.5; b.scale.y = 0.85;
  var d = [];
  for (var i = 0; i < 6; i++) { var a = i * 1.05; d.push([Math.cos(a) * 0.8, 2.75, Math.sin(a) * 0.8]); }
  g.add(b, puntos(new THREE.SphereGeometry(0.2, 6, 4), d, mat('#c8f0c0')));
  pon(c, 'lisosoma', g, [[x, z, 1.8]], [x, 3.8, z]);
}

function centriolos(c, x, z) {
  var g = new THREE.Group(); g.position.set(x, 0, z);
  var m = mat('#ee7d12'), geo = new THREE.CylinderGeometry(0.75, 0.75, 3, 9);
  var a = malla(geo, m); a.rotation.x = Math.PI / 2; a.position.set(-0.6, 0.9, 0);
  var b = malla(geo, m); b.position.set(1.3, 1.5, 0);
  var tapa = malla(new THREE.CylinderGeometry(0.45, 0.45, 0.1, 9), mat('#ffd0a0')); tapa.position.set(1.3, 3.02, 0);
  g.add(a, b, tapa);
  pon(c, 'centriolos', g, [[x + 0.3, z, 2.2]], [x, 4.4, z]);
}

function vacuola(c, x, z) {
  var v = malla(new THREE.SphereGeometry(2.4, 16, 10), mat('#8fd3ff', { op: 0.6, liso: true }), false);
  v.position.set(x, 1.2, z); v.scale.y = 0.7;
  pon(c, 'vacuola', v, [[x, z, 2.5]], [x, 3.4, z]);
}

function cloroplasto(c, x, z, ang) {
  var g = new THREE.Group(); g.position.set(x, 0, z); g.rotation.y = -ang;
  var e = malla(new THREE.SphereGeometry(1, 16, 10), mat('#3fa34d')); e.scale.set(3.8, 1.4, 2.1); e.position.y = 1.2;
  g.add(e);
  var gm = mat('#1f6e33'), gg = new THREE.CylinderGeometry(0.55, 0.55, 0.45, 10);
  [-2.1, -0.7, 0.7, 2.1].forEach(function (lx, i) {
    var y = 1.2 + 1.4 * Math.sqrt(1 - (lx / 3.8) * (lx / 3.8)) - 0.1;
    for (var k = 0; k < 2; k++) { var d = malla(gg, gm); d.position.set(lx, y + k * 0.5, (i % 2 ? 0.3 : -0.3)); g.add(d); }
  });
  pon(c, 'cloroplasto', g, [-2, 0, 2].map(function (l) { var w = giro(x, z, ang, l, 0); return [w[0], w[1], 2.1]; }), [x, 4.4, z]);
}

/* ---------- Las dos células ---------- */
var CEL = {};

function construir(tipo) {
  var c = { tipo: tipo, g: new THREE.Group(), formas: [], anclas: [], fibras: [], gluc: [], corr: [] };
  if (tipo === 'animal') animal(c); else vegetal(c);
  extras(c);
  mapaFijo(c);
  c.g.visible = false; escena.add(c.g);
  return c;
}

function animal(c) {
  var A = 58, B = 44;
  c.borde = { tipo: 'elipse', a: A - 2.5, b: B - 2.5 }; c.ext = [A + 4, B + 4];
  c.inicio = { x: -24, z: 0 };
  var fuera = malla(new THREE.PlaneGeometry(400, 400), mat('#1e5f7a', { liso: true }), false); fuera.rotation.x = -Math.PI / 2; fuera.position.y = -0.1;
  var piso = malla(new THREE.CircleGeometry(1, 72), mat('#ffc9a8', { liso: true }), false); piso.rotation.x = -Math.PI / 2; piso.scale.set(A + 3, B + 3, 1);
  c.g.add(fuera, piso);
  /* membrana: dos filas de cabezas y las colas en medio */
  var mem = new THREE.Group(), elip = function (da, y, n) { var p = []; for (var i = 0; i < n; i++) { var t = i / n * 6.2832; p.push([(A + da) * Math.cos(t), y, (B + da) * Math.sin(t)]); } return p; };
  var colas = mat('#ffd2bf');
  mem.add(tubo(elip(0.3, 1.0, 60), 0.7, colas, true, 240), tubo(elip(1.7, 1.0, 60), 0.7, colas, true, 240));
  mem.add(puntos(new THREE.SphereGeometry(0.6, 8, 6), elip(-0.6, 1.1, 230).concat(elip(2.6, 1.1, 250)), mat('#ff7a59')));
  c.g.add(mem); c.membrana = mem;

  nucleo(c, -6, 2, 9);
  reticulo(c, -6, 2, 12, -1.1, 1.25);
  golgi(c, 22, 6, Math.atan2(2 - 6, -6 - 22));
  [[-32, -16, 0.5], [-34, 18, -0.4], [8, -27, 0.1], [6, 30, 0.9], [38, -22, -0.6]].forEach(function (m) { mitocondria(c, m[0], m[1], m[2]); });
  [[-22, -30], [26, 24], [-44, 2]].forEach(function (r, i) { ribosomas(c, r[0], r[1], i * 2); });
  [[-18, 26], [40, 8], [-8, -24]].forEach(function (l) { lisosoma(c, l[0], l[1]); });
  centriolos(c, 20, -12);
  [[-30, 32], [46, -4], [24, -34]].forEach(function (v) { vacuola(c, v[0], v[1]); });
  c.semilla = 5;
}

function vegetal(c) {
  var W = 60, H = 38;
  c.borde = { tipo: 'caja', w: W - 1.2, h: H - 1.2 }; c.ext = [W + 5, H + 5];
  c.inicio = { x: -28, z: 6 };
  var fuera = malla(new THREE.PlaneGeometry(400, 400), mat('#4f8a3a', { liso: true }), false); fuera.rotation.x = -Math.PI / 2; fuera.position.y = -0.1;
  var piso = malla(new THREE.PlaneGeometry(2 * W + 2, 2 * H + 2), mat('#d6eba4', { liso: true }), false); piso.rotation.x = -Math.PI / 2;
  c.g.add(fuera, piso);
  var pm = mat('#6fae3f'), lm = mat('#4f8a3a'), mm = mat('#ff8f73'), mem = new THREE.Group();
  [[0, -(H + 2.4), 2 * (W + 4), 3.2], [0, H + 2.4, 2 * (W + 4), 3.2], [-(W + 2.4), 0, 3.2, 2 * (H + 0.8)], [W + 2.4, 0, 3.2, 2 * (H + 0.8)]].forEach(function (p) {
    var b = malla(new THREE.BoxGeometry(p[2], 3, p[3]), pm); b.position.set(p[0], 1.5, p[1]); c.g.add(b);
    var l = malla(new THREE.BoxGeometry(p[2] > 4 ? p[2] : 0.5, 0.1, p[3] > 4 ? p[3] : 0.5), lm, false); l.position.set(p[0], 3.05, p[1]); c.g.add(l);
  });
  [[0, -(H + 0.45), 2 * W + 1.6, 0.7], [0, H + 0.45, 2 * W + 1.6, 0.7], [-(W + 0.45), 0, 0.7, 2 * H + 0.2], [W + 0.45, 0, 0.7, 2 * H + 0.2]].forEach(function (p) {
    var b = malla(new THREE.BoxGeometry(p[2], 1.8, p[3]), mm); b.position.set(p[0], 0.9, p[1]); mem.add(b);
  });
  c.g.add(mem);

  /* vacuola central: el grueso de la célula */
  var vg = new THREE.Group(), vx = 6, ra = 26, rb = 17;
  var v = malla(new THREE.SphereGeometry(1, 36, 16), mat('#9fdcf5', { op: 0.65, liso: true }), false); v.scale.set(ra, 5, rb); v.position.x = vx;
  var ton = []; for (var i = 0; i < 48; i++) { var t = i / 48 * 6.2832; ton.push([vx + ra * Math.cos(t), 0.4, rb * Math.sin(t)]); }
  vg.add(v, tubo(ton, 0.45, mat('#5bb8e8'), true, 160));
  var vc = [];
  for (var x = vx - ra + 4; x <= vx + ra - 2; x += 3) { var dx = (x - vx) / ra; vc.push([x, 0, Math.max(4, rb * Math.sqrt(1 - dx * dx))]); }
  pon(c, 'vacuolaCentral', vg, vc, [vx, 6.2, 0]);

  nucleo(c, -40, -12, 7);
  reticulo(c, -40, -12, 9.5, -1.6, 0.3);
  golgi(c, -42, 20, Math.atan2(-12 - 20, -40 + 42));
  [[-12, -30, 0.1], [20, -30, -0.1], [46, -22, 0.7], [50, 14, -0.5], [24, 30, 0.2], [-8, 30, -0.15], [-55, 4, Math.PI / 2]].forEach(function (k) { cloroplasto(c, k[0], k[1], k[2]); });
  [[-26, -30, 0.3], [36, -32, 0], [-26, 30, -0.3]].forEach(function (m) { mitocondria(c, m[0], m[1], m[2]); });
  [[-52, -30], [50, -32], [40, 32]].forEach(function (r, i) { ribosomas(c, r[0], r[1], i * 2); });
  c.semilla = 9;
}

function dentro(c, x, z, m) {
  var b = c.borde;
  if (b.tipo === 'elipse') return (x * x) / ((b.a - m) * (b.a - m)) + (z * z) / ((b.b - m) * (b.b - m)) < 1;
  return Math.abs(x) < b.w - m && Math.abs(z) < b.h - m;
}
function libre(c, x, z, m) {
  if (!dentro(c, x, z, m)) return false;
  for (var i = 0; i < c.formas.length; i++) { var f = c.formas[i], dx = x - f.x, dz = z - f.z; if (dx * dx + dz * dz < (f.r + m) * (f.r + m)) return false; }
  return true;
}
function lejosDelInicio(c, x, z, d) { var dx = x - c.inicio.x, dz = z - c.inicio.z; return dx * dx + dz * dz > d * d; }
function sitioLibre(c, m, rnd) {
  for (var t = 0; t < 300; t++) {
    var e = c.ext, x = (rnd() * 2 - 1) * e[0], z = (rnd() * 2 - 1) * e[1];
    if (libre(c, x, z, m) && lejosDelInicio(c, x, z, 5)) return { x: x, z: z };
  }
  return { x: c.inicio.x + 4, z: c.inicio.z };
}

/* fibras del citoesqueleto, glucosa, corrientes y el citoplasma con partículas */
function extras(c) {
  var rnd = azar(c.semilla), fm = mat('#8f78d0', { em: '#3a2a70', ei: 0.4 }), cg = new THREE.CylinderGeometry(0.3, 0.3, 1, 6);
  for (var t = 0; t < 600 && c.fibras.length < 8; t++) {
    var x = (rnd() * 2 - 1) * c.ext[0], z = (rnd() * 2 - 1) * c.ext[1], a = rnd() * 3.1416, L = 7 + rnd() * 5;
    var x1 = x - Math.cos(a) * L / 2, z1 = z - Math.sin(a) * L / 2, x2 = x + Math.cos(a) * L / 2, z2 = z + Math.sin(a) * L / 2;
    if (!libre(c, x1, z1, 3.4) || !libre(c, x2, z2, 3.4) || !libre(c, x, z, 3.4)) continue;
    if (!lejosDelInicio(c, x, z, 10)) continue;
    var cerca = c.fibras.some(function (f) { return Math.hypot(f.x - x, f.z - z) < 12; });
    if (cerca) continue;
    var m = malla(cg, fm); m.scale.y = L; m.rotation.z = Math.PI / 2; m.rotation.y = -a; m.position.set(x, 2, z);
    c.g.add(m);
    c.fibras.push({ x: x, z: z, x1: x1, z1: z1, x2: x2, z2: z2 });
  }
  var gg = new THREE.CylinderGeometry(0.75, 0.75, 0.35, 6), gmat = mat('#ffc23a', { em: '#a86b00', ei: 0.45 });
  for (var i = 0; i < 6; i++) {
    var s = sitioLibre(c, 2.5, rnd), gm = malla(gg, gmat); gm.position.set(s.x, 2, s.z);
    c.g.add(gm); c.gluc.push({ m: gm, x: s.x, z: s.z, fase: rnd() * 6, vuelve: 0 });
  }
  var flecha = new THREE.Shape();
  flecha.moveTo(-0.6, -0.9); flecha.lineTo(0.5, 0); flecha.lineTo(-0.6, 0.9); flecha.lineTo(-0.2, 0); flecha.lineTo(-0.6, -0.9);
  var fg = new THREE.ShapeGeometry(flecha);
  for (var k = 0; k < 3; k++) {
    var p = sitioLibre(c, 4.5, rnd), da = rnd() * 6.2832, r = 6.5, g = new THREE.Group();
    g.position.set(p.x, 0.15, p.z); g.rotation.y = -da;
    var disco = new THREE.Mesh(new THREE.CircleGeometry(r, 32), new THREE.MeshBasicMaterial({ color: '#ffffff', transparent: true, opacity: 0.16, depthWrite: false }));
    disco.rotation.x = -Math.PI / 2; g.add(disco);
    var ch = [];
    for (var j = 0; j < 6; j++) {
      var cm = new THREE.Mesh(fg, new THREE.MeshBasicMaterial({ color: '#ffffff', transparent: true, opacity: 0.7, depthWrite: false }));
      cm.rotation.x = -Math.PI / 2; cm.position.y = 0.05; g.add(cm); ch.push({ m: cm, u: (j % 3) / 3, v: j < 3 ? -2.2 : 2.2 });
    }
    c.g.add(g);
    c.corr.push({ x: p.x, z: p.z, r: r, dx: Math.cos(da), dz: Math.sin(da), ch: ch });
  }
  var n = 360, pos = new Float32Array(n * 3);
  for (var q = 0; q < n; q++) {
    var px, pz;
    do { px = (rnd() * 2 - 1) * c.ext[0]; pz = (rnd() * 2 - 1) * c.ext[1]; } while (!dentro(c, px, pz, 0));
    pos[q * 3] = px; pos[q * 3 + 1] = 0.6 + rnd() * 5; pos[q * 3 + 2] = pz;
  }
  var pg = new THREE.BufferGeometry(); pg.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  c.polvo = new THREE.Points(pg, new THREE.PointsMaterial({ color: c.tipo === 'animal' ? '#ffb89a' : '#9cc56a', size: 0.35, transparent: true, opacity: 0.7, depthWrite: false }));
  c.g.add(c.polvo);
}

/* ---------- Mapa pequeño ---------- */
var mini = $('#mini'), mctx = mini.getContext('2d');
function aMapa(c, x, z) { var s = Math.min(140 / (2 * c.ext[0]), 110 / (2 * c.ext[1])); return [75 + x * s, 60 + z * s, s]; }
function mapaFijo(c) {
  var cv = document.createElement('canvas'); cv.width = 150; cv.height = 120;
  var g = cv.getContext('2d'), s = aMapa(c, 0, 0)[2], b = c.borde;
  g.fillStyle = c.tipo === 'animal' ? '#1e5f7a' : '#4f8a3a'; g.fillRect(0, 0, 150, 120);
  g.fillStyle = c.tipo === 'animal' ? '#ffd9c2' : '#e4f2c4';
  g.strokeStyle = c.tipo === 'animal' ? '#ff7a59' : '#6fae3f'; g.lineWidth = c.tipo === 'animal' ? 2.5 : 4;
  g.beginPath();
  if (b.tipo === 'elipse') g.ellipse(75, 60, (b.a + 2.5) * s, (b.b + 2.5) * s, 0, 0, 6.2832);
  else g.rect(75 - (b.w + 1.5) * s, 60 - (b.h + 1.5) * s, 2 * (b.w + 1.5) * s, 2 * (b.h + 1.5) * s);
  g.fill(); g.stroke();
  c.formas.forEach(function (f) {
    var p = aMapa(c, f.x, f.z), o = ORG[f.id];
    g.fillStyle = o ? o.color : '#999'; g.globalAlpha = f.id === 'vacuolaCentral' || f.id === 'vacuola' ? 0.45 : 0.9;
    g.beginPath(); g.arc(p[0], p[1], Math.max(1.4, f.r * s), 0, 6.2832); g.fill();
  });
  g.globalAlpha = 1; g.strokeStyle = '#8f78d0'; g.lineWidth = 1.5;
  c.fibras.forEach(function (f) { var a = aMapa(c, f.x1, f.z1), z = aMapa(c, f.x2, f.z2); g.beginPath(); g.moveTo(a[0], a[1]); g.lineTo(z[0], z[1]); g.stroke(); });
  c.mapa = cv;
}
function pintarMapa() {
  if (!C) return;
  mctx.drawImage(C.mapa, 0, 0);
  var p = aMapa(C, M.x, M.z);
  mctx.strokeStyle = '#15304d'; mctx.lineWidth = 2;
  mctx.beginPath(); mctx.moveTo(p[0], p[1]); mctx.lineTo(p[0] + Math.cos(M.h) * 7, p[1] + Math.sin(M.h) * 7); mctx.stroke();
  mctx.fillStyle = '#ffffff'; mctx.beginPath(); mctx.arc(p[0], p[1], 4, 0, 6.2832); mctx.fill(); mctx.stroke();
}

/* ---------- El nanorobot ---------- */
var robot = new THREE.Group(), cuerpo = new THREE.Group(), helice = new THREE.Group();
(function () {
  var b = malla(new THREE.IcosahedronGeometry(1.1, 1), mat('#eef3f7', { r: 0.4, m: 0.3 }));
  var banda = malla(new THREE.TorusGeometry(1.12, 0.17, 6, 22), mat(COLEGIO)); banda.rotation.y = Math.PI / 2;
  var visor = malla(new THREE.SphereGeometry(0.7, 14, 10), mat('#15304d', { r: 0.3 })); visor.position.set(0.62, 0.22, 0); visor.scale.set(0.6, 0.75, 1.15);
  var ojo = mat('#7ff6ff', { em: '#3fe0ff', ei: 0.9 }), og = new THREE.SphereGeometry(0.15, 8, 6);
  var o1 = malla(og, ojo, false); o1.position.set(1.04, 0.32, 0.27);
  var o2 = malla(og, ojo, false); o2.position.set(1.04, 0.32, -0.27);
  var ant = malla(new THREE.CylinderGeometry(0.06, 0.06, 0.8, 5), mat('#9aa7b4')); ant.position.set(-0.1, 1.35, 0);
  var punta = malla(new THREE.SphereGeometry(0.2, 8, 6), mat('#ffc23a', { em: '#ff9a00', ei: 0.6 }), false); punta.position.set(-0.1, 1.8, 0);
  var cubo = malla(new THREE.CylinderGeometry(0.22, 0.3, 0.5, 8), mat('#9aa7b4')); cubo.rotation.z = Math.PI / 2; cubo.position.x = -1.2;
  var pm = mat(COLEGIO);
  for (var i = 0; i < 3; i++) { var a = malla(new THREE.BoxGeometry(0.08, 1.0, 0.3), pm); a.rotation.x = i * 2.094; a.position.y = 0; var h = new THREE.Group(); h.rotation.x = i * 2.094; a.rotation.x = 0; a.position.y = 0.5; h.add(a); helice.add(h); }
  helice.position.x = -1.5;
  cuerpo.add(b, banda, visor, o1, o2, ant, punta, cubo, helice);
  robot.add(cuerpo);
  escena.add(robot);
})();

/* lo que lleva en el repartidor: flota sobre su cabeza */
var carga = new THREE.Group(); carga.position.y = 3.1; robot.add(carga);
var CARGAS = {};
(function () {
  var col = ['#ff6a4d', '#ffc23a', '#2f9e5d', '#3b9be0', '#7b4fd0', '#ee7d12', '#0e9aa0'];
  var p = []; for (var i = 0; i <= 16; i++) p.push([-1.2 + i * 0.15, Math.sin(i * 0.9) * 0.25, Math.cos(i * 0.9) * 0.25]);
  var arn = new THREE.Group(); arn.add(tubo(p, 0.11, mat('#ff6a4d', { em: '#ff6a4d', ei: 0.2 })));
  var cad = new THREE.Group(), bg = new THREE.SphereGeometry(0.24, 8, 6);
  for (var j = 0; j < 7; j++) { var b = malla(bg, mat(col[j]), false); b.position.set(-1.1 + j * 0.37, Math.sin(j) * 0.12, 0); cad.add(b); }
  var pro = new THREE.Group(), r = azar(3);
  for (var k = 0; k < 9; k++) { var q = malla(bg, mat(col[k % 7]), false); q.position.set((r() - 0.5) * 0.9, (r() - 0.5) * 0.7, (r() - 0.5) * 0.9); pro.add(q); }
  var ves = new THREE.Group(), pc = pro.clone(); pc.scale.setScalar(0.75);
  ves.add(malla(new THREE.SphereGeometry(1, 14, 10), mat('#ffd36b', { op: 0.45, liso: true }), false), pc);
  CARGAS = { arnm: arn, cadena: cad, proteina: pro, vesicula: ves };
  Object.keys(CARGAS).forEach(function (k) { CARGAS[k].visible = false; carga.add(CARGAS[k]); });
})();
function llevar(que) { Object.keys(CARGAS).forEach(function (k) { CARGAS[k].visible = k === que; }); J.lleva = que || null; }

/* flecha de pista: flota junto al nanorobot y apunta al objetivo */
var flecha3 = new THREE.Group();
(function () {
  var m = mat('#ffc23a', { em: '#ff9a00', ei: 0.5 });
  var cono = malla(new THREE.ConeGeometry(0.7, 1.5, 10), m, false); cono.rotation.z = -Math.PI / 2; cono.position.x = 1.0;
  var asta = malla(new THREE.CylinderGeometry(0.25, 0.25, 1.4, 8), m, false); asta.rotation.z = Math.PI / 2; asta.position.x = -0.3;
  flecha3.add(cono, asta); flecha3.visible = false; escena.add(flecha3);
})();

/* ---------- Estado ---------- */
var M = { x: 0, z: 0, vx: 0, vz: 0, h: 0, imp: 0 };
var J = { pantalla: 'inicio', nivel: 0, mi: 0, pi: 0, t: 0, tMision: 0, err: 0, malos: {}, conocidos: {}, vistos: {}, toca: {}, espera: 0,
  energia: 1, fibraCd: 0, pista: 0, lleva: null, buenas: 0, progreso: { estrellas: [0, 0, 0, 0] } };
var C = null, T = 0, efectos = [];
try { var g0 = JSON.parse(localStorage.getItem(CLAVE) || 'null'); if (g0 && Array.isArray(g0.estrellas)) J.progreso = g0; } catch (e) {}
function guardar() { try { localStorage.setItem(CLAVE, JSON.stringify(J.progreso)); } catch (e) {} }

function nivel() { return NIV[J.nivel]; }
function mision() { return nivel().misiones[J.mi]; }
function paradas(m) { return m.paradas || [m]; }
function parada() { return paradas(mision())[J.pi]; }
function buscaActual() { var b = parada().busca; return Array.isArray(b) ? b : [b]; }

function usarCelula(tipo) {
  if (!CEL[tipo]) CEL[tipo] = construir(tipo);
  Object.keys(CEL).forEach(function (k) { CEL[k].g.visible = k === tipo; });
  C = CEL[tipo];
  var cont = $('#labels'); cont.innerHTML = '';
  C.anclas.forEach(function (a) {
    if (!a.el) {
      a.el = document.createElement('div'); a.el.className = 'lbl';
      a.el.textContent = ORG[a.id] ? ORG[a.id].nombre : a.id;
      a.el.style.setProperty('--c', ORG[a.id] ? ORG[a.id].color : '#fff');
    }
    a.el.hidden = true; cont.appendChild(a.el);
  });
  escena.background.set(tipo === 'animal' ? '#154b63' : '#2f5f2a'); escena.fog.color.set(escena.background);
}

/* ---------- Entrada ---------- */
var teclas = {}, joy = { activo: false, ox: 0, oy: 0, vx: 0, vy: 0, id: null };
addEventListener('keydown', function (e) {
  var k = e.key.toLowerCase();
  teclas[k] = true;
  if (J.pantalla === 'juego') {
    if (k === ' ') { e.preventDefault(); if (!e.repeat) impulso(); }
    if (k.indexOf('arrow') === 0) e.preventDefault();
    if (k === 'escape') pausar();
  } else if ((k === 'enter' || k === ' ') && !$('#card').hidden && !$('#cFin').hidden) { e.preventDefault(); $('#bSig').click(); }
});
addEventListener('keyup', function (e) { teclas[e.key.toLowerCase()] = false; });
addEventListener('blur', function () { teclas = {}; });
var lienzo = rd.domElement;
lienzo.addEventListener('pointerdown', function (e) {
  if (J.pantalla !== 'juego') return;
  joy.activo = true; joy.id = e.pointerId; joy.ox = e.clientX; joy.oy = e.clientY; joy.vx = joy.vy = 0;
  var el = $('#joy'); el.hidden = false; el.style.left = e.clientX + 'px'; el.style.top = e.clientY + 'px'; el.firstChild.style.transform = '';
  try { lienzo.setPointerCapture(e.pointerId); } catch (er) {}
});
lienzo.addEventListener('pointermove', function (e) {
  if (!joy.activo || e.pointerId !== joy.id) return;
  var dx = e.clientX - joy.ox, dy = e.clientY - joy.oy, l = Math.sqrt(dx * dx + dy * dy), max = 45;
  if (l > max) { dx = dx / l * max; dy = dy / l * max; }
  joy.vx = dx / max; joy.vy = dy / max;
  $('#joy').firstChild.style.transform = 'translate(' + dx + 'px,' + dy + 'px)';
});
function soltarJoy() { joy.activo = false; joy.vx = joy.vy = 0; $('#joy').hidden = true; }
function soltar(e) { if (e.pointerId === joy.id) soltarJoy(); }
lienzo.addEventListener('pointerup', soltar); lienzo.addEventListener('pointercancel', soltar);
$('#bImpulso').addEventListener('pointerdown', function (e) { e.preventDefault(); impulso(); });

function entrada() {
  var x = 0, z = 0;
  if (teclas.arrowleft || teclas.a) x -= 1;
  if (teclas.arrowright || teclas.d) x += 1;
  if (teclas.arrowup || teclas.w) z -= 1;
  if (teclas.arrowdown || teclas.s) z += 1;
  if (joy.activo) { x += joy.vx; z += joy.vy; }
  var l = Math.sqrt(x * x + z * z);
  if (l > 1) { x /= l; z /= l; }
  return { x: x, z: z };
}

function impulso() {
  if (J.pantalla !== 'juego') return;
  if (J.energia < 0.3) { tip('Te falta energía. Recoge <b>glucosa</b>: los hexágonos amarillos.', 3); Sonido.fx('mal'); return; }
  J.energia -= 0.3; M.imp = 0.6;
  M.vx += Math.cos(M.h) * 14; M.vz += Math.sin(M.h) * 14;
  Sonido.fx('impulso');
}

/* ---------- Física ---------- */
function fisica(dt) {
  J.t += dt; J.tMision += dt;
  var inp = entrada();
  M.vx += inp.x * 40 * dt; M.vz += inp.z * 40 * dt;
  C.corr.forEach(function (k) {
    var dx = M.x - k.x, dz = M.z - k.z;
    if (dx * dx + dz * dz < k.r * k.r) {
      M.vx += k.dx * 10 * dt; M.vz += k.dz * 10 * dt;
      if (!J.vistos.corriente) { J.vistos.corriente = 1; tip('Una <b>corriente</b> del citoplasma te arrastra. ¡Nada con fuerza!', 4); }
    }
  });
  var fr = Math.exp(-1.7 * dt); M.vx *= fr; M.vz *= fr;
  M.imp = Math.max(0, M.imp - dt);
  var max = M.imp > 0 ? 24 : 12, v = Math.sqrt(M.vx * M.vx + M.vz * M.vz);
  if (v > max) { M.vx *= max / v; M.vz *= max / v; v = max; }
  M.x += M.vx * dt; M.z += M.vz * dt;

  var toca = {};
  for (var it = 0; it < 2; it++) {
    C.formas.forEach(function (f) {
      var dx = M.x - f.x, dz = M.z - f.z, d = Math.sqrt(dx * dx + dz * dz), min = f.r + MR;
      if (d >= min + 0.05) return;
      toca[f.id] = f;
      if (d >= min) return;
      if (d < 1e-4) { dx = 1; dz = 0; d = 1; }
      var nx = dx / d, nz = dz / d; M.x = f.x + nx * min; M.z = f.z + nz * min;
      var vn = M.vx * nx + M.vz * nz; if (vn < 0) { M.vx -= vn * nx * 1.3; M.vz -= vn * nz * 1.3; }
    });
    var b = C.borde, nx = 0, nz = 0;
    if (b.tipo === 'elipse') {
      var e = Math.sqrt((M.x * M.x) / (b.a * b.a) + (M.z * M.z) / (b.b * b.b));
      if (e >= 0.995) { toca.borde = true; }
      if (e > 1) { M.x /= e; M.z /= e; nx = M.x / (b.a * b.a); nz = M.z / (b.b * b.b); }
    } else {
      if (Math.abs(M.x) >= b.w - 0.05) toca.borde = true;
      if (Math.abs(M.z) >= b.h - 0.05) toca.borde = true;
      if (M.x > b.w) { M.x = b.w; nx = 1; } else if (M.x < -b.w) { M.x = -b.w; nx = -1; }
      if (M.z > b.h) { M.z = b.h; nz = 1; } else if (M.z < -b.h) { M.z = -b.h; nz = -1; }
    }
    if (nx || nz) {
      var l = Math.sqrt(nx * nx + nz * nz); nx /= l; nz /= l;
      var vo = M.vx * nx + M.vz * nz; if (vo > 0) { M.vx -= vo * nx * 1.3; M.vz -= vo * nz * 1.3; }
    }
  }

  J.fibraCd -= dt;
  C.fibras.forEach(function (f) {
    var sx = f.x2 - f.x1, sz = f.z2 - f.z1, t = ((M.x - f.x1) * sx + (M.z - f.z1) * sz) / (sx * sx + sz * sz);
    t = Math.max(0, Math.min(1, t));
    var px = f.x1 + sx * t, pz = f.z1 + sz * t, dx = M.x - px, dz = M.z - pz, d = Math.sqrt(dx * dx + dz * dz), min = 0.3 + MR;
    if (d >= min) return;
    if (d < 1e-4) { dx = -sz; dz = sx; d = Math.sqrt(dx * dx + dz * dz); }
    var nx = dx / d, nz = dz / d; M.x = px + nx * min; M.z = pz + nz * min;
    var vn = M.vx * nx + M.vz * nz; if (vn < 0) { M.vx -= vn * nx * 1.8; M.vz -= vn * nz * 1.8; }
    if (J.fibraCd <= 0) {
      J.fibraCd = 0.8; J.energia = Math.max(0, J.energia - 0.2); Sonido.fx('fibra'); chispa(px, pz, '#8f78d0', 8);
      if (!J.vistos.fibra) { J.vistos.fibra = 1; tip('¡Una <b>fibra del citoesqueleto</b>! Rodéala: chocar te quita energía.', 4); }
    }
  });

  C.gluc.forEach(function (g) {
    if (g.vuelve > 0) { g.vuelve -= dt; if (g.vuelve <= 0) { var s = sitioLibre(C, 2.5, Math.random); g.x = s.x; g.z = s.z; g.m.position.set(s.x, 2, s.z); g.m.visible = true; } return; }
    var dx = M.x - g.x, dz = M.z - g.z;
    if (dx * dx + dz * dz < 4.4) {
      g.m.visible = false; g.vuelve = 8; J.energia = Math.min(1, J.energia + 0.4); Sonido.fx('glucosa'); chispa(g.x, g.z, '#ffc23a', 10);
      if (!J.vistos.glucosa) { J.vistos.glucosa = 1; tip('¡<b>Glucosa</b>! Es el azúcar que da energía. Te recarga el impulso.', 3.5); }
    }
  });
  J.energia = Math.min(1, J.energia + 0.025 * dt);

  if (J.espera > 0) { J.espera -= dt; J.toca = {}; }
  else {
    var ant = J.toca; J.toca = toca;
    for (var id in toca) if (!ant[id] && J.pantalla === 'juego') contacto(id, toca[id]);
  }

  if (v > 0.6) {
    var obj = Math.atan2(M.vz, M.vx), d = obj - M.h;
    while (d > Math.PI) d -= 6.2832; while (d < -Math.PI) d += 6.2832;
    M.h += d * Math.min(1, dt * 8);
  }
  Sonido.nado(v / 12);

  var lim = J.nivel === 0 || J.nivel === 2 ? 14 : 20;
  if (J.tMision > lim && J.pista === 0) { J.pista = 1; tip('Pista: ' + parada().pista, 6); }
  if (J.tMision > lim + 10 && J.pista === 1) { J.pista = 2; }
}

/* ---------- Misiones ---------- */
function contacto(id, forma) {
  if (id === 'borde') {
    var b = buscaActual();
    id = b.indexOf('pared') >= 0 ? 'pared' : b.indexOf('membrana') >= 0 ? 'membrana' : (C.tipo === 'vegetal' ? 'pared' : 'membrana');
  }
  J.conocidos[id] = 1;
  if (forma && forma.obj) pulso(forma.obj);
  if (buscaActual().indexOf(id) >= 0) return acierto(id);
  Sonido.fx('toque');
  var o = ORG[id]; if (!o) return;
  if (id === 'membrana' || id === 'pared') {
    if (J.vistos['borde' + J.mi + '.' + J.pi]) return;
    J.vistos['borde' + J.mi + '.' + J.pi] = 1;
    tip('<b>' + o.nombre + ':</b> ' + o.corta + ' Aquí no es: sigue buscando.', 3.5);
    return;
  }
  if (!J.malos[id]) { J.malos[id] = 1; J.err++; Sonido.fx('mal'); }
  tip('<b>' + o.nombre + ':</b> ' + o.corta + ' Busca otro.', 3.5);
}

function acierto(id) {
  var m = mision(), ps = paradas(m), p = ps[J.pi];
  chispa(M.x, M.z, ORG[id] ? ORG[id].color : '#ffc23a', 18);
  if (ps.length > 1 && J.pi < ps.length - 1) {
    Sonido.fx('parada');
    llevar(p.lleva);
    J.pi++; J.espera = 1.0; J.malos = {}; J.tMision = 0; J.pista = 0;
    tip(p.logro || '¡Listo!', 4, true);
    pintarMision();
    return;
  }
  Sonido.fx('bien');
  llevar(null);
  soltarJoy();
  var o = ORG[id] || {}, ultima = J.mi === nivel().misiones.length - 1;
  if (ps.length > 1) tarjeta({ tag: 'Entrega completa', color: o.color, tit: m.titulo || '¡Entregado!', dato: m.final || '', boton: ultima ? 'Al repaso' : 'Siguiente entrega', alSeguir: siguiente });
  else tarjeta({ tag: o.nombre, color: o.color, tit: '¡Encontraste ' + o.art + '!', dato: o.dato, boton: ultima ? 'Al repaso' : 'Siguiente misión', alSeguir: siguiente });
}

function siguiente() {
  J.mi++; J.pi = 0;
  if (J.mi >= nivel().misiones.length) return repaso();
  empezarMision();
  J.pantalla = 'juego';
}
function empezarMision() { J.malos = {}; J.tMision = 0; J.pista = 0; J.toca = {}; J.espera = 0.4; llevar(null); pintarMision(); }

function pintarMision() {
  var n = nivel(), m = mision(), ps = paradas(m);
  var cab = 'Nivel ' + (J.nivel + 1) + ' · ' + (m.paradas ? 'Entrega ' : 'Misión ') + (J.mi + 1) + ' de ' + n.misiones.length;
  $('#mNum').textContent = cab;
  $('#mTxt').textContent = parada().texto;
  var pasos = $('#mPasos');
  pasos.hidden = ps.length < 2;
  if (ps.length > 1) pasos.innerHTML = ps.map(function (_, i) { return '<i class="' + (i < J.pi ? 'hecho' : i === J.pi ? 'ahora' : '') + '"></i>'; }).join('');
}

/* ---------- Repaso y final ---------- */
function barajar(a) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)), t = a[i]; a[i] = a[j]; a[j] = t; } return a; }

function repaso() {
  J.qi = 0; J.buenas = 0;
  $('#mNum').textContent = 'Nivel ' + (J.nivel + 1) + ' · Repaso'; $('#mTxt').textContent = 'Contesta lo que aprendiste.'; $('#mPasos').hidden = true;
  var qs = nivel().preguntas || [];
  if (!qs.length) return terminar();
  pregunta();
}
function pregunta() {
  var qs = nivel().preguntas, q = qs[J.qi];
  var ops = barajar(q.opciones.map(function (t, i) { return { t: t, ok: i === q.correcta }; }));
  tarjeta({ tag: 'Repaso · ' + (J.qi + 1) + ' de ' + qs.length, tit: 'Repaso', preg: q.texto, ops: ops, explica: q.explica,
    boton: J.qi === qs.length - 1 ? 'Ver resultado' : 'Siguiente pregunta',
    alSeguir: function () { J.qi++; if (J.qi < qs.length) pregunta(); else terminar(); } });
  J.pantalla = 'preguntas';
}

function estrellasHtml(n, de) { var s = ''; for (var i = 0; i < (de || 3); i++) s += i < n ? '★' : '<span class="off">★</span>'; return s; }
function tiempo(s) { s = Math.round(s); return s < 60 ? s + ' s' : Math.floor(s / 60) + ' min ' + (s % 60) + ' s'; }

function terminar() {
  $('#card').hidden = true;
  var nq = (nivel().preguntas || []).length;
  var est = 1 + (J.err <= 2 ? 1 : 0) + (J.buenas >= Math.min(2, nq) ? 1 : 0);
  J.progreso.estrellas[J.nivel] = Math.max(J.progreso.estrellas[J.nivel] || 0, est);
  guardar();
  J.pantalla = 'final';
  Sonido.fx('fin'); Sonido.ambiente(false);
  ocultarJuego();
  $('#fTit').textContent = nivel().nombre;
  $('#fKick').textContent = '¡Nivel ' + (J.nivel + 1) + ' completo!';
  $('#fEst').innerHTML = estrellasHtml(est);
  $('#fRes').innerHTML = '<li>Tiempo: ' + tiempo(J.t) + '</li><li>Toques equivocados: ' + J.err + '</li>' + (nq ? '<li>Repaso: ' + J.buenas + ' de ' + nq + '</li>' : '');
  $('#bSigNivel').hidden = J.nivel >= NIV.length - 1;
  $('#final').hidden = false;
}

/* ---------- Tarjeta ---------- */
var alSeguir = null;
function tarjeta(o) {
  J.pantalla = J.pantalla === 'intro' ? 'intro' : 'tarjeta';
  $('#cTag').innerHTML = (o.color ? '<i></i>' : '') + '<span></span>';
  $('#cTag').querySelector('span').textContent = o.tag || '';
  $('#cTag').style.setProperty('--c', o.color || '#ccc');
  $('#cTit').textContent = o.tit || '';
  $('#cDato').textContent = o.dato || '';
  $('#cPreg').textContent = o.preg || '';
  var ops = $('#cOps'); ops.innerHTML = '';
  $('#bSig').textContent = o.boton || 'Seguir';
  alSeguir = o.alSeguir || null;
  if (o.ops) {
    $('#cFin').hidden = true;
    o.ops.forEach(function (op) {
      var b = document.createElement('button'); b.className = 'op'; b.textContent = op.t;
      b.addEventListener('click', function () {
        Array.prototype.forEach.call(ops.querySelectorAll('.op'), function (x) { x.disabled = true; });
        b.classList.add(op.ok ? 'bien' : 'mal');
        if (!op.ok) Array.prototype.forEach.call(ops.querySelectorAll('.op'), function (x, i) { if (o.ops[i].ok) x.classList.add('bien'); });
        if (op.ok) J.buenas++;
        Sonido.fx(op.ok ? 'bien' : 'mal');
        if (o.explica) { var p = document.createElement('p'); p.className = 'explica'; p.textContent = (op.ok ? '¡Bien! ' : 'Casi. ') + o.explica; ops.appendChild(p); }
        $('#cFin').hidden = false; $('#bSig').focus();
      });
      ops.appendChild(b);
    });
  } else $('#cFin').hidden = false;
  $('#card').hidden = false;
  $('#card').scrollTop = 0;
}
$('#bSig').addEventListener('click', function () {
  Sonido.fx('clic');
  $('#card').hidden = true;
  var f = alSeguir; alSeguir = null;
  if (f) f();
});

/* ---------- Pantallas ---------- */
function listaNiveles(sel, actual) {
  var el = $(sel); el.innerHTML = '';
  NIV.forEach(function (n, i) {
    var b = document.createElement('button');
    if (i === actual) b.className = 'actual';
    b.innerHTML = '<span class="n">' + (i + 1) + '</span><span class="t"><b></b><small></small></span><span class="e">' + estrellasHtml(J.progreso.estrellas[i] || 0) + '</span>';
    b.querySelector('b').textContent = n.nombre;
    b.querySelector('small').textContent = n.resumen || '';
    b.addEventListener('click', function () { Sonido.fx('clic'); empezarNivel(i); });
    el.appendChild(b);
  });
}
function cerrarPantallas() { ['#inicio', '#pausa', '#final', '#card'].forEach(function (s) { $(s).hidden = true; }); }
function ocultarJuego() { ['#hud', '#lado', '#bImpulso', '#tip'].forEach(function (s) { $(s).hidden = true; }); soltarJoy(); flecha3.visible = false; }
function mostrarInicio() {
  cerrarPantallas(); ocultarJuego();
  J.pantalla = 'inicio';
  if (!C) usarCelula('animal');
  M.x = C.inicio.x; M.z = C.inicio.z;
  $('#iTit').textContent = D.titulo; $('#iFrase').textContent = D.frase; $('#iComo').textContent = D.comoSeJuega;
  listaNiveles('#iLista', -1);
  $('#inicio').hidden = false;
}
function recomendado() { for (var i = 0; i < NIV.length; i++) if (!J.progreso.estrellas[i]) return i; return 0; }

function empezarNivel(i) {
  cerrarPantallas();
  J.nivel = i; J.mi = 0; J.pi = 0; J.t = 0; J.err = 0; J.conocidos = {}; J.vistos = {}; J.energia = 1;
  usarCelula(nivel().celula);
  M.x = C.inicio.x; M.z = C.inicio.z; M.vx = M.vz = 0; M.h = 0; M.imp = 0;
  C.gluc.forEach(function (g) { g.vuelve = 0; g.m.visible = true; });
  camara(1, true);
  ['#hud', '#lado', '#bImpulso'].forEach(function (s) { $(s).hidden = false; });
  $('#tip').hidden = true;
  empezarMision();
  Sonido.ambiente(true);
  J.pantalla = 'intro';
  tarjeta({ tag: 'Nivel ' + (i + 1) + ' de ' + NIV.length + (nivel().celula === 'vegetal' ? ' · célula vegetal' : ' · célula animal'),
    tit: nivel().nombre, dato: nivel().intro, boton: '¡A nadar!', alSeguir: function () { J.pantalla = 'juego'; tip(D.comoSeJuega, 5); } });
}

function pausar() {
  if (J.pantalla !== 'juego') return;
  J.pantalla = 'pausa'; soltarJoy(); teclas = {};
  $('#pComo').textContent = D.comoSeJuega;
  listaNiveles('#pLista', J.nivel);
  $('#pausa').hidden = false;
}
$('#bMenu').addEventListener('click', function () { Sonido.fx('clic'); pausar(); });
$('#bSeguir').addEventListener('click', function () { Sonido.fx('clic'); $('#pausa').hidden = true; J.pantalla = 'juego'; });
$('#bJugar').addEventListener('click', function () { Sonido.fx('clic'); empezarNivel(recomendado()); });
$('#bOtra').addEventListener('click', function () { Sonido.fx('clic'); empezarNivel(J.nivel); });
$('#bSigNivel').addEventListener('click', function () { Sonido.fx('clic'); empezarNivel(Math.min(NIV.length - 1, J.nivel + 1)); });
Sonido.boton($('#bSonido'));

var tipT = 0;
function tip(html, seg, bien) {
  var t = $('#tip'); t.innerHTML = html; t.className = 'tip' + (bien ? ' bien' : ''); t.hidden = false;
  t.style.animation = 'none'; void t.offsetWidth; t.style.animation = '';
  tipT = seg || 3;
}

/* ---------- Efectos ---------- */
function pulso(obj) {
  if (obj.__pulso) return;
  obj.__pulso = 1;
  var y0 = obj.position.y;
  efectos.push({ t: 0, dur: 0.45, paso: function (k) { obj.position.y = y0 + 0.5 * Math.sin(k * Math.PI); }, fin: function () { obj.position.y = y0; obj.__pulso = 0; } });
}
var bolita = new THREE.SphereGeometry(0.22, 6, 4);
function chispa(x, z, color, n) {
  var m = new THREE.MeshBasicMaterial({ color: color, transparent: true }), ps = [];
  for (var i = 0; i < n; i++) {
    var p = new THREE.Mesh(bolita, m), a = Math.random() * 6.28, s = 3 + Math.random() * 5;
    p.position.set(x, 2.2, z); p.userData = { vx: Math.cos(a) * s, vy: 2 + Math.random() * 4, vz: Math.sin(a) * s };
    escena.add(p); ps.push(p);
  }
  efectos.push({ t: 0, dur: 0.8, paso: function (k, dt) {
    m.opacity = 1 - k;
    ps.forEach(function (p) { var u = p.userData; p.position.x += u.vx * dt; p.position.y += u.vy * dt; p.position.z += u.vz * dt; u.vy -= 6 * dt; });
  }, fin: function () { ps.forEach(function (p) { escena.remove(p); }); m.dispose(); } });
}

/* ---------- Cámara, etiquetas, animación ---------- */
var mira = new THREE.Vector3(), vec = new THREE.Vector3();
function camara(dt, ya) {
  var asp = innerWidth / innerHeight, f = asp < 0.8 ? 1.45 : asp < 1.2 ? 1.2 : 1;
  var tx = M.x, ty = 30 * f, tz = M.z + 22 * f, k = ya ? 1 : Math.min(1, dt * 4);
  cam.position.x += (tx - cam.position.x) * k; cam.position.y += (ty - cam.position.y) * k; cam.position.z += (tz - cam.position.z) * k;
  mira.set(cam.position.x, 0, cam.position.z - 22 * f - 1);
  cam.lookAt(mira);
  sol.position.set(M.x + 20, 50, M.z + 12); sol.target.position.set(M.x, 0, M.z);
}

function etiquetas() {
  if (!C) return;
  var ver = J.pantalla !== 'inicio' && J.pantalla !== 'final', todas = nivel() && nivel().etiquetas;
  C.anclas.forEach(function (a) {
    var dx = a.x - M.x, dz = a.z - M.z, d = Math.sqrt(dx * dx + dz * dz);
    var mostrar = ver && d < 22 && (todas || J.conocidos[a.id]);
    if (mostrar) {
      vec.set(a.x, a.y, a.z).project(cam);
      if (vec.z > 1) mostrar = false;
      else { a.el.style.left = ((vec.x + 1) / 2 * innerWidth) + 'px'; a.el.style.top = ((1 - vec.y) / 2 * innerHeight) + 'px'; }
    }
    if (a.el.hidden === mostrar) a.el.hidden = !mostrar;
  });
}

function objetivoCercano() {
  var ids = buscaActual(), mejor = null, md = 1e9;
  C.formas.forEach(function (f) {
    if (ids.indexOf(f.id) < 0) return;
    var d = (f.x - M.x) * (f.x - M.x) + (f.z - M.z) * (f.z - M.z);
    if (d < md) { md = d; mejor = { x: f.x, z: f.z }; }
  });
  if (ids.indexOf('membrana') >= 0 || ids.indexOf('pared') >= 0) {
    var b = C.borde, p;
    if (b.tipo === 'elipse') { var e = Math.sqrt((M.x * M.x) / (b.a * b.a) + (M.z * M.z) / (b.b * b.b)); p = e < 0.01 ? { x: b.a, z: 0 } : { x: M.x / e, z: M.z / e }; }
    else { var ds = [b.w - M.x, b.w + M.x, b.h - M.z, b.h + M.z], i = ds.indexOf(Math.min.apply(null, ds)); p = [{ x: b.w, z: M.z }, { x: -b.w, z: M.z }, { x: M.x, z: b.h }, { x: M.x, z: -b.h }][i]; }
    var d2 = (p.x - M.x) * (p.x - M.x) + (p.z - M.z) * (p.z - M.z);
    if (d2 < md) mejor = p;
  }
  return mejor;
}

function animar(dt) {
  T += dt;
  robot.position.set(M.x, 2 + Math.sin(T * 3) * 0.15, M.z);
  robot.rotation.y = -M.h;
  var v = Math.sqrt(M.vx * M.vx + M.vz * M.vz);
  cuerpo.rotation.z = -Math.min(0.25, v * 0.015); cuerpo.rotation.x = Math.sin(T * 2.3) * 0.06;
  helice.rotation.x += dt * (4 + v * 2.2);
  carga.rotation.y += dt * 1.2; carga.position.y = 3.1 + Math.sin(T * 2) * 0.12;
  if (C) {
    if (C.membrana) { var s = 1 + Math.sin(T * 1.3) * 0.004; C.membrana.scale.set(s, 1, s); }
    if (C.tipo === 'animal') C.polvo.rotation.y = T * 0.01; else C.polvo.position.x = Math.sin(T * 0.3) * 0.8;
    C.gluc.forEach(function (g) { g.m.rotation.y += dt; g.m.position.y = 2 + Math.sin(T * 2 + g.fase) * 0.25; });
    C.corr.forEach(function (k) {
      k.ch.forEach(function (c) {
        c.u = (c.u + dt * 0.35) % 1;
        var u = (c.u * 2 - 1) * k.r * 0.8; c.m.position.x = u; c.m.position.z = c.v;
        c.m.material.opacity = 0.75 * Math.sin(c.u * Math.PI);
      });
    });
  }
  var obj = J.pantalla === 'juego' && J.pista === 2 ? objetivoCercano() : null;
  flecha3.visible = !!obj;
  if (obj) {
    var a = Math.atan2(obj.z - M.z, obj.x - M.x);
    flecha3.position.set(M.x + Math.cos(a) * (3.4 + Math.sin(T * 6) * 0.3), 2.6, M.z + Math.sin(a) * (3.4 + Math.sin(T * 6) * 0.3));
    flecha3.rotation.y = -a;
  }
  for (var i = efectos.length - 1; i >= 0; i--) {
    var e = efectos[i]; e.t += dt;
    var k = Math.min(1, e.t / e.dur); e.paso(k, dt);
    if (k >= 1) { if (e.fin) e.fin(); efectos.splice(i, 1); }
  }
  if (tipT > 0) { tipT -= dt; if (tipT <= 0) $('#tip').hidden = true; }
  if (J.pantalla === 'juego' || J.pantalla === 'tarjeta' || J.pantalla === 'intro' || J.pantalla === 'preguntas') {
    $('#mReloj').textContent = tiempo(J.t);
    $('#energia').style.width = Math.round(J.energia * 100) + '%';
    $('#bImpulso').classList.toggle('vacio', J.energia < 0.3);
  }
}

/* ---------- Bucle ---------- */
var reloj = new THREE.Clock(), raf = 0;
function paso() {
  raf = requestAnimationFrame(paso);
  var dt = Math.min(reloj.getDelta(), 0.05);
  if (J.pantalla === 'juego') fisica(dt);
  animar(dt);
  camara(dt);
  etiquetas();
  if (J.pantalla !== 'inicio' && J.pantalla !== 'final') pintarMapa();
  rd.render(escena, cam);
}
addEventListener('resize', function () {
  cam.aspect = innerWidth / innerHeight; cam.updateProjectionMatrix(); rd.setSize(innerWidth, innerHeight);
});
document.addEventListener('visibilitychange', function () {
  if (document.hidden) { cancelAnimationFrame(raf); raf = 0; teclas = {}; }
  else if (!raf) { reloj.getDelta(); paso(); }
});

/* ---------- Depuración ---------- */
window.__juego = {
  estado: function () {
    var m = nivel().misiones[J.mi], p = m ? paradas(m)[J.pi] : null;
    return { pantalla: J.pantalla, nivel: J.nivel, mision: J.mi, parada: J.pi, busca: p && p.busca, lleva: J.lleva, x: +M.x.toFixed(1), z: +M.z.toFixed(1),
      tiempo: +J.t.toFixed(1), errores: J.err, energia: +J.energia.toFixed(2), pista: J.pista, celula: C && C.tipo, estrellas: J.progreso.estrellas.slice() };
  },
  nivel: function (i) { empezarNivel(i); },
  jugar: function () { cerrarPantallas(); $('#card').hidden = true; J.pantalla = 'juego'; },
  ir: function (x, z) { M.x = x; M.z = z; M.vx = M.vz = 0; camara(1, true); },
  tocar: function (id) { contacto(id, null); },
  acertar: function () { var b = buscaActual()[0]; contacto(b === 'pared' || b === 'membrana' ? 'borde' : b, null); },
  objetivo: objetivoCercano,
  formas: function () { return C ? C.formas.map(function (f) { return [f.id, +f.x.toFixed(1), +f.z.toFixed(1), f.r]; }) : []; },
  fibras: function () { return C ? C.fibras.length : 0; },
  libre: function (x, z) { return libre(C, x, z, MR); },
  arranque: 0
};

usarCelula('animal');
M.x = C.inicio.x; M.z = C.inicio.z; camara(1, true);
$('#carga').hidden = true;
window.__juego.arranque = Math.round(performance.now());
mostrarInicio();
paso();
})();
