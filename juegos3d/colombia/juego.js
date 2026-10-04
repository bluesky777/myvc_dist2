/* Vuelo por Colombia — motor. El contenido (misiones, datos, mapa) vive en datos.js. */
(function () {
'use strict';
var D = window.DATOS_COLOMBIA, MAPA = D.mapa;
var $ = function (s) { return document.querySelector(s); };
var CLAVE = 'juegos3d.colombia';

if (!window.THREE) {
  $('#cargaMsg').textContent = 'No se pudo descargar el motor 3D. Revisa la conexión y vuelve a abrir el juego.';
  return;
}

/* ---------- Coordenadas: grados → mundo ---------- */
var S = 5, LON0 = -74, LAT0 = 4.5;
var LON_MIN = -82.8, LON_MAX = -65.8, LAT_MIN = -4.9, LAT_MAX = 13.8;
function toX(lon) { return (lon - LON0) * S; }
function toZ(lat) { return -(lat - LAT0) * S; }
function toLon(x) { return x / S + LON0; }
function toLat(z) { return -z / S + LAT0; }

/* ---------- Geometría plana ---------- */
function enPoligono(x, y, pol) {
  var dentro = false;
  for (var i = 0, j = pol.length - 1; i < pol.length; j = i++) {
    var xi = pol[i][0], yi = pol[i][1], xj = pol[j][0], yj = pol[j][1];
    if ((yi > y) !== (yj > y) && x < (xj - xi) * (y - yi) / (yj - yi) + xi) dentro = !dentro;
  }
  return dentro;
}
function interp(pts, x) {
  if (x <= pts[0][0]) return pts[0][1];
  for (var i = 1; i < pts.length; i++) {
    if (x <= pts[i][0]) { var a = pts[i - 1], b = pts[i]; return a[1] + (b[1] - a[1]) * (x - a[0]) / (b[0] - a[0]); }
  }
  return pts[pts.length - 1][1];
}
function distSeg(px, py, ax, ay, bx, by) {
  var dx = bx - ax, dy = by - ay, t = ((px - ax) * dx + (py - ay) * dy) / (dx * dx + dy * dy);
  t = t < 0 ? 0 : t > 1 ? 1 : t;
  var ex = ax + t * dx - px, ey = ay + t * dy - py;
  return Math.sqrt(ex * ex + ey * ey);
}
function distLinea(pts, x, y) {
  var m = 1e9;
  for (var i = 1; i < pts.length; i++) m = Math.min(m, distSeg(x, y, pts[i - 1][0], pts[i - 1][1], pts[i][0], pts[i][1]));
  return m;
}
function hash(x, y) { var s = Math.sin(x * 127.1 + y * 311.7) * 43758.5453; return s - Math.floor(s); }
function ruido(x, y) {
  var xi = Math.floor(x), yi = Math.floor(y), fx = x - xi, fy = y - yi;
  fx = fx * fx * (3 - 2 * fx); fy = fy * fy * (3 - 2 * fy);
  var a = hash(xi, yi), b = hash(xi + 1, yi), c = hash(xi, yi + 1), d = hash(xi + 1, yi + 1);
  return a + (b - a) * fx + (c - a) * fy + (a - b - c + d) * fx * fy;
}

/* ---------- Qué hay en cada punto ---------- */
var L = MAPA.limites;
function enColombia(lon, lat) { return enPoligono(lon, lat, MAPA.contorno); }
var COSTA_VE = [[-73, 11.2], [-71.3, 11.2], [-70.6, 11.3], [-70.1, 11.7], [-69.9, 12.15], [-69.6, 11.5], [-68.4, 10.9], [-67, 10.6], [-65, 10.4]];
var COSTA_EC = [[-6, -81.2], [-4.3, -81.2], [-3.4, -80.3], [-2.6, -80.2], [-2.2, -80.9], [-1.0, -80.8], [0.2, -80.1], [0.9, -79.6], [1.45, -78.9]];
function esMar(lon, lat) {
  if (enPoligono(lon, lat, MAPA.panama)) return false;
  if (lat > 8) return lon < -72.9 || lat > interp(COSTA_VE, lon);
  if (lat < 1.45) return lon < interp(COSTA_EC, lat); /* Ecuador y Perú */
  return lon < -77.0;
}
function isla(lon, lat, extra) {
  for (var i = 0; i < MAPA.islas.length; i++) {
    var s = MAPA.islas[i], dx = lon - s.pos[0], dy = lat - s.pos[1];
    if (Math.sqrt(dx * dx + dy * dy) < s.r + (extra || 0)) return s;
  }
  return null;
}
/* Región natural de un punto, o null fuera de Colombia. */
function regionEn(lon, lat) {
  if (isla(lon, lat, 0.25)) return 'insular';
  if (!enColombia(lon, lat)) return null;
  if (lat > interp(L.caribe, lon)) return 'caribe';
  if (lon < interp(L.pacifica, lat)) return 'pacifica';
  if (lon > interp(L.piedemonte, lat)) return lat > interp(L.guaviare, lon) ? 'orinoquia' : 'amazonia';
  return 'andina';
}
var RIOS = MAPA.rios, CONTORNO_CERRADO = MAPA.contorno.concat([MAPA.contorno[0]]);
function alturaBase(lon, lat) {
  if (!enColombia(lon, lat)) {
    /* los países vecinos se ven sólo cerca de la frontera, como en un mapa escolar */
    if (esMar(lon, lat) || distLinea(CONTORNO_CERRADO, lon, lat) > 1.5 + ruido(lon * 1.3, lat * 1.3) * 1.2) return -0.55;
    return 0.1 + ruido(lon * 2, lat * 2) * 0.1;
  }
  var h = 0.2 + ruido(lon * 3.1, lat * 3.1) * 0.12;
  for (var i = 0; i < MAPA.cordilleras.length; i++) {
    var c = MAPA.cordilleras[i], d = distLinea(c.puntos, lon, lat);
    if (d < 1.4) h += c.alto * Math.exp(-(d / 0.42) * (d / 0.42)) * (0.7 + 0.6 * ruido(lon * 2.3 + i * 7, lat * 2.3));
  }
  for (i = 0; i < MAPA.picos.length; i++) {
    var p = MAPA.picos[i], dx = lon - p.pos[0], dy = lat - p.pos[1], dd = Math.sqrt(dx * dx + dy * dy);
    if (dd < p.ancho * 3) h += p.alto * Math.exp(-(dd / p.ancho) * (dd / p.ancho)) * (0.8 + 0.4 * ruido(lon * 5, lat * 5));
  }
  var dr = Math.min(distLinea(RIOS.magdalena.puntos, lon, lat), distLinea(RIOS.cauca.puntos, lon, lat));
  if (dr < 0.6) h = 0.16 + (h - 0.16) * (1 - 0.7 * Math.exp(-(dr / 0.22) * (dr / 0.22)));
  return h;
}

/* ---------- Rejilla del relieve (la misma triangulación sirve para pedir alturas) ---------- */
var PASO = 0.16;
var NX = Math.ceil((LON_MAX - LON_MIN) / PASO), NY = Math.ceil((LAT_MAX - LAT_MIN) / PASO);
var H = new Float32Array((NX + 1) * (NY + 1));
for (var j = 0; j <= NY; j++) for (var i = 0; i <= NX; i++) H[j * (NX + 1) + i] = alturaBase(LON_MIN + i * PASO, LAT_MIN + j * PASO);
function hv(i, j) { return H[j * (NX + 1) + i]; }
/* Altura del suelo dibujado en (lon, lat). */
function suelo(lon, lat) {
  var fx = (lon - LON_MIN) / PASO, fy = (lat - LAT_MIN) / PASO;
  var i = Math.max(0, Math.min(NX - 1, Math.floor(fx))), j = Math.max(0, Math.min(NY - 1, Math.floor(fy)));
  var u = Math.max(0, Math.min(1, fx - i)), v = Math.max(0, Math.min(1, fy - j));
  var a = hv(i, j), b = hv(i + 1, j), c = hv(i, j + 1), d = hv(i + 1, j + 1);
  var h = u + v <= 1 ? a + u * (b - a) + v * (c - a) : d + (1 - u) * (c - d) + (1 - v) * (b - d);
  return Math.max(h, 0);
}
function sueloXZ(x, z) { return suelo(toLon(x), toLat(z)); }

/* ---------- Escena ---------- */
var rd = new THREE.WebGLRenderer({ antialias: true });
rd.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));
rd.setSize(innerWidth, innerHeight);
rd.shadowMap.enabled = true; rd.shadowMap.type = THREE.PCFSoftShadowMap;
$('#gl').appendChild(rd.domElement);
var scene = new THREE.Scene();
var cam = new THREE.PerspectiveCamera(52, innerWidth / innerHeight, 0.1, 260);
function cieloTex(a, b) {
  var c = document.createElement('canvas'); c.width = 2; c.height = 256;
  var x = c.getContext('2d'), g = x.createLinearGradient(0, 0, 0, 256);
  g.addColorStop(0, a); g.addColorStop(1, b); x.fillStyle = g; x.fillRect(0, 0, 2, 256);
  var t = new THREE.CanvasTexture(c); return t;
}
scene.background = cieloTex('#5cc3e6', '#d9f3f6');
scene.fog = new THREE.Fog(0xd2eff3, 55, 150);
scene.add(new THREE.HemisphereLight(0xffffff, 0xc9b48a, 0.5));
var sol = new THREE.DirectionalLight(0xfff3dc, 0.72);
sol.castShadow = true; sol.shadow.mapSize.set(1024, 1024);
Object.assign(sol.shadow.camera, { left: -16, right: 16, top: 16, bottom: -16, near: 1, far: 80 });
sol.shadow.bias = -0.0015;
scene.add(sol); scene.add(sol.target);
function M(c, o) { return new THREE.MeshStandardMaterial(Object.assign({ color: c, flatShading: true, roughness: 0.85 }, o || {})); }

/* Colores */
var COLOR = {};
Object.keys(D.regiones).forEach(function (k) { COLOR[k] = new THREE.Color(D.regiones[k].color); });
var C_VECINO = new THREE.Color('#d9d0b4'), C_PLAYA = new THREE.Color('#f2dea6'), C_NIEVE = new THREE.Color('#f7f7f2'),
    C_ROCA = new THREE.Color('#9b7650'), C_ANDINA_ALTA = new THREE.Color('#b07a4c');

/* Relieve */
(function construirRelieve() {
  var pos = [], col = [], tmp = new THREE.Color();
  function vert(i, j) { pos.push(toX(LON_MIN + i * PASO), Math.max(hv(i, j), -0.55), toZ(LAT_MIN + j * PASO)); }
  function tri(a, b, c) {
    var ha = hv(a[0], a[1]), hb = hv(b[0], b[1]), hc = hv(c[0], c[1]);
    if (ha < 0 && hb < 0 && hc < 0) return;
    var clon = LON_MIN + (a[0] + b[0] + c[0]) / 3 * PASO, clat = LAT_MIN + (a[1] + b[1] + c[1]) / 3 * PASO;
    var hmax = Math.max(ha, hb, hc), hmed = (ha + hb + hc) / 3;
    var r = regionEn(clon, clat);
    if (r === 'insular') r = null;
    if (!r) tmp.copy(Math.min(ha, hb, hc) < 0 ? C_PLAYA : C_VECINO);
    else {
      tmp.copy(COLOR[r]);
      if (r === 'andina') tmp.lerp(C_ANDINA_ALTA, Math.min(1, Math.max(0, (hmed - 0.8) / 2)));
      else if (hmed > 0.9) tmp.lerp(C_ROCA, Math.min(1, (hmed - 0.9) / 1.6));
      if (hmax > 2.85) tmp.copy(C_NIEVE);
      if (Math.min(ha, hb, hc) < 0) tmp.lerp(C_PLAYA, 0.75);
    }
    var k = 0.93 + hash(clon * 9, clat * 9) * 0.12;
    tmp.multiplyScalar(k);
    vert(a[0], a[1]); vert(b[0], b[1]); vert(c[0], c[1]);
    for (var n = 0; n < 3; n++) col.push(tmp.r, tmp.g, tmp.b);
  }
  for (var j = 0; j < NY; j++) for (var i = 0; i < NX; i++) {
    tri([i, j], [i + 1, j], [i, j + 1]);
    tri([i + 1, j], [i + 1, j + 1], [i, j + 1]);
  }
  var g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute('color', new THREE.Float32BufferAttribute(col, 3));
  g.computeVertexNormals();
  var m = new THREE.Mesh(g, M(0xffffff, { vertexColors: true, roughness: 0.95 }));
  m.receiveShadow = true;
  scene.add(m);
})();

/* Mar con olas suaves */
var marGeo = new THREE.PlaneGeometry(320, 320, 64, 64); marGeo.rotateX(-Math.PI / 2);
var marBase = Float32Array.from(marGeo.attributes.position.array);
var mar = new THREE.Mesh(marGeo, M(0x1b97a8, { roughness: 0.5, metalness: 0.05 }));
mar.position.set(toX(-74.3), -0.08, toZ(4.5)); mar.receiveShadow = true; scene.add(mar);
function olas(t) {
  var p = marGeo.attributes.position.array;
  for (var i = 0; i < p.length; i += 3) p[i + 1] = marBase[i + 1] + Math.sin(marBase[i] * 0.35 + t) * 0.07 + Math.cos(marBase[i + 2] * 0.3 + t * 1.3) * 0.07;
  marGeo.attributes.position.needsUpdate = true;
}

/* Frontera de Colombia */
(function frontera() {
  var pts = [], c = MAPA.contorno;
  for (var i = 0; i <= c.length; i++) {
    var a = c[i % c.length], b = c[(i + 1) % c.length];
    for (var k = 0; k < 6; k++) {
      var lon = a[0] + (b[0] - a[0]) * k / 6, lat = a[1] + (b[1] - a[1]) * k / 6;
      pts.push(new THREE.Vector3(toX(lon), suelo(lon, lat) + 0.08, toZ(lat)));
    }
  }
  scene.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.75 })));
})();

/* Ríos: cinta que sigue el suelo */
function cinta(puntos, ancho, color) {
  var curva = new THREE.CatmullRomCurve3(puntos.map(function (p) { return new THREE.Vector3(p[0], 0, p[1]); }));
  var n = puntos.length * 14, ps = curva.getSpacedPoints(n), pos = [], idx = [];
  for (var i = 0; i <= n; i++) {
    var p = ps[i], q = ps[Math.min(n, i + 1)], o = ps[Math.max(0, i - 1)];
    var dx = q.x - o.x, dy = q.z - o.z, l = Math.sqrt(dx * dx + dy * dy) || 1;
    var w = ancho * (0.6 + 0.8 * i / n) / S, nx = -dy / l * w, ny = dx / l * w;
    [[p.x + nx, p.z + ny], [p.x - nx, p.z - ny]].forEach(function (e) {
      var h = Math.max(suelo(e[0], e[1]), suelo(p.x, p.z), 0);
      pos.push(toX(e[0]), h + 0.07, toZ(e[1]));
    });
    if (i < n) { var a = i * 2; idx.push(a, a + 2, a + 1, a + 1, a + 2, a + 3); }
  }
  var g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setIndex(idx); g.computeVertexNormals();
  var m = new THREE.Mesh(g, M(color, { roughness: 0.3, emissive: 0x0b3d66, emissiveIntensity: 0.25, side: THREE.DoubleSide, polygonOffset: true, polygonOffsetFactor: -2 }));
  m.receiveShadow = true; scene.add(m);
  return ps;
}
var curvaRio = {};
Object.keys(RIOS).forEach(function (k) { curvaRio[k] = cinta(RIOS[k].puntos, 0.3, 0x2a86d6); });

/* Islas de la región Insular (exageradas para que se vean) */
MAPA.islas.forEach(function (s, n) {
  var g = new THREE.Group(), r = s.r * S;
  var playa = new THREE.Mesh(new THREE.CylinderGeometry(r, r * 1.15, 0.5, 9), M(0xf2dea6));
  playa.position.y = 0.05; g.add(playa);
  var monte = new THREE.Mesh(new THREE.ConeGeometry(r * 0.75, 0.5 + r * 0.5, 7), M(D.regiones.insular.color));
  monte.position.y = 0.45 + r * 0.25; g.add(monte);
  for (var k = 0; k < 4; k++) {
    var pal = new THREE.Mesh(new THREE.ConeGeometry(0.12, 0.38, 5), M(0x2f9e5d));
    var an = k / 4 * Math.PI * 2 + n; pal.position.set(Math.cos(an) * r * 0.8, 0.45, Math.sin(an) * r * 0.8); g.add(pal);
  }
  var arrecife = new THREE.Mesh(new THREE.RingGeometry(r * 1.25, r * 1.6, 18), new THREE.MeshBasicMaterial({ color: 0x7ee6e0, transparent: true, opacity: 0.55 }));
  arrecife.rotation.x = -Math.PI / 2; arrecife.position.y = 0.03; g.add(arrecife);
  g.position.set(toX(s.pos[0]), 0, toZ(s.pos[1]));
  g.traverse(function (o) { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
  scene.add(g);
});

/* Árboles y palmas */
(function vegetacion() {
  var plan = [['amazonia', 1100, [0x2f8a3f, 0x3c9e4a, 0x25753a]], ['pacifica', 320, [0x1e8a6a, 0x2a9d70]], ['andina', 260, [0x4f8f3a, 0x6aa346]],
              ['orinoquia', 160, [0x8fb84a, 0x6f9e3a]], ['caribe', 140, [0x5ea548, 0x7cb24e]]];
  var total = plan.reduce(function (s, p) { return s + p[1]; }, 0);
  var geo = new THREE.ConeGeometry(0.15, 0.45, 5); geo.translate(0, 0.22, 0);
  var inst = new THREE.InstancedMesh(geo, M(0xffffff), total);
  var m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Vector3(), sc = new THREE.Vector3(), c = new THREE.Color();
  var n = 0, semilla = 1;
  function rnd() { semilla = (semilla * 16807) % 2147483647; return semilla / 2147483647; }
  plan.forEach(function (p) {
    var hechos = 0, intentos = 0;
    while (hechos < p[1] && intentos < p[1] * 40) {
      intentos++;
      var lon = LON_MIN + rnd() * (LON_MAX - LON_MIN), lat = LAT_MIN + rnd() * (LAT_MAX - LAT_MIN);
      if (regionEn(lon, lat) !== p[0]) continue;
      var h = suelo(lon, lat);
      if (h > 2.2 || h < 0.1) continue;
      if (Math.min(distLinea(RIOS.magdalena.puntos, lon, lat), distLinea(RIOS.cauca.puntos, lon, lat)) < 0.1) continue;
      var s = 0.7 + rnd() * 0.7;
      e.set(toX(lon), h - 0.03, toZ(lat)); sc.set(s, s * (0.8 + rnd() * 0.6), s);
      m4.compose(e, q, sc); inst.setMatrixAt(n, m4);
      inst.setColorAt(n, c.setHex(p[2][Math.floor(rnd() * p[2].length)]));
      n++; hechos++;
    }
  });
  inst.count = n; inst.instanceMatrix.needsUpdate = true;
  scene.add(inst);
})();

/* Nubes bajas sobre la selva y el Pacífico */
var nubes = [];
(function () {
  var mat = M(0xffffff, { transparent: true, opacity: 0.92, roughness: 1, emissive: 0xffffff, emissiveIntensity: 0.45 }), semilla = 7;
  function rnd() { semilla = (semilla * 16807) % 2147483647; return semilla / 2147483647; }
  var hechas = 0, intentos = 0;
  while (hechas < 22 && intentos < 2000) {
    intentos++;
    var lon = -79 + rnd() * 12, lat = -4 + rnd() * 12, r = regionEn(lon, lat);
    if (r !== 'amazonia' && r !== 'pacifica' && r !== 'orinoquia') continue;
    if (alturaBase(lon, lat) > 0.6) continue;
    var g = new THREE.Group();
    for (var k = 0; k < 4; k++) {
      var b = new THREE.Mesh(new THREE.IcosahedronGeometry(0.5 + rnd() * 0.6, 0), mat);
      b.position.set((k - 1.5) * 0.7, rnd() * 0.3, (rnd() - 0.5) * 0.6); g.add(b);
    }
    g.position.set(toX(lon), 2.6 + rnd() * 0.5, toZ(lat));
    g.traverse(function (o) { if (o.isMesh) o.castShadow = true; });
    scene.add(g); nubes.push(g); hechas++;
  }
})();

/* Ciudades: un alfiler por capital */
var CAPS = D.capitales.map(function (c) {
  var x = toX(c.pos[0]), z = toZ(c.pos[1]), y = suelo(c.pos[0], c.pos[1]);
  if (c.id === 'sanandres') y = 0.3;
  var g = new THREE.Group();
  var base = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.32, 0.08, 10), M(0xfffdf7)); g.add(base);
  var poste = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.8, 6), M(0x15304d)); poste.position.y = 0.4; g.add(poste);
  var cab = c.pais ? new THREE.Mesh(new THREE.OctahedronGeometry(0.24, 0), M(0xffc23a, { emissive: 0x5a3a00, emissiveIntensity: 0.4 }))
                   : new THREE.Mesh(new THREE.IcosahedronGeometry(0.16, 0), M(0xff6a4d, { emissive: 0x401000, emissiveIntensity: 0.3 }));
  cab.position.y = 0.9; g.add(cab);
  g.position.set(x, y, z);
  g.traverse(function (o) { if (o.isMesh) o.castShadow = true; });
  scene.add(g);
  return { d: c, g: g, cab: cab, x: x, z: z, y: y };
});
var capPorId = {}; CAPS.forEach(function (c) { capPorId[c.d.id] = c; });

/* Avioncito */
var avion = (function () {
  var g = new THREE.Group(), cuerpo = new THREE.Group(); g.add(cuerpo);
  var col = new THREE.Color(getComputedStyle(document.documentElement).getPropertyValue('--colegio').trim() || '#ff6a4d');
  var mc = M(col.getHex(), { roughness: 0.5 }), mb = M(0xfffdf7, { roughness: 0.6 }), ms = M(0xffc23a, { roughness: 0.5 });
  var fus = new THREE.Mesh(new THREE.CylinderGeometry(0.17, 0.09, 1.25, 8), mc); fus.rotation.x = Math.PI / 2; cuerpo.add(fus);
  var nariz = new THREE.Mesh(new THREE.ConeGeometry(0.17, 0.24, 8), mc); nariz.rotation.x = -Math.PI / 2; nariz.position.z = -0.74; cuerpo.add(nariz);
  var ala = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.06, 0.4), mb); ala.position.set(0, 0.02, -0.12); cuerpo.add(ala);
  [-0.75, 0.75].forEach(function (x) { var f = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.07, 0.41), ms); f.position.set(x, 0.02, -0.12); cuerpo.add(f); });
  var cola = new THREE.Mesh(new THREE.BoxGeometry(0.75, 0.05, 0.22), mb); cola.position.set(0, 0.04, 0.55); cuerpo.add(cola);
  var timon = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.34, 0.26), mc); timon.position.set(0, 0.2, 0.56); cuerpo.add(timon);
  var cabina = new THREE.Mesh(new THREE.SphereGeometry(0.13, 8, 6, 0, Math.PI * 2, 0, Math.PI / 2), M(0x8fe3f0, { roughness: 0.2, metalness: 0.3 }));
  cabina.position.set(0, 0.1, -0.25); cabina.scale.set(1, 1, 1.6); cuerpo.add(cabina);
  var helice = new THREE.Group(); helice.position.z = -0.88; cuerpo.add(helice);
  helice.add(new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.07, 0.03), M(0x15304d)));
  var buje = new THREE.Mesh(new THREE.SphereGeometry(0.06, 6, 4), ms); helice.add(buje);
  g.traverse(function (o) { if (o.isMesh) o.castShadow = true; });
  scene.add(g);
  return { g: g, cuerpo: cuerpo, helice: helice };
})();

/* Aros de los ríos */
var aroGeo = new THREE.TorusGeometry(0.95, 0.12, 6, 18);
var aroMat = M(0xffc23a, { emissive: 0x6a4600, emissiveIntensity: 0.5, roughness: 0.4 });
var aroMat2 = M(0xffc23a, { transparent: true, opacity: 0.35 });
var aros = [];
function crearAros(rio) {
  quitarAros();
  var ps = curvaRio[rio], paso = 0.75, acum = 0, sel = [ps[0]];
  for (var i = 1; i < ps.length; i++) {
    acum += ps[i].distanceTo(ps[i - 1]);
    if (acum >= paso) { sel.push(ps[i]); acum = 0; }
  }
  if (sel[sel.length - 1] !== ps[ps.length - 1]) sel.push(ps[ps.length - 1]);
  sel.shift(); /* el primero queda bajo el avión: no cuenta */
  sel.forEach(function (p, k) {
    var sig = sel[Math.min(sel.length - 1, k + 1)], ant = k > 0 ? sel[k - 1] : p;
    var x = toX(p.x), z = toZ(p.z), y = alturaVuelo(x, z);
    var m = new THREE.Mesh(aroGeo, aroMat);
    m.position.set(x, y, z);
    m.rotation.y = Math.atan2(toX(sig.x) - toX(ant.x), toZ(sig.z) - toZ(ant.z));
    m.visible = false; scene.add(m); aros.push(m);
  });
}
function quitarAros() { aros.forEach(function (a) { scene.remove(a); }); aros = []; }

/* ---------- Estado del juego ---------- */
var CRUCERO = 4.2;
function alturaVuelo(x, z) { return Math.max(CRUCERO, sueloXZ(x, z) + 1.7); }
var P = { x: 0, z: 0, y: CRUCERO, rumbo: 0, vel: 3.6, giro: 0 };
var J = {
  pantalla: 'cargando', idx: 0, t: 0, errores: 0, pista: false, sigAro: 0, aterr: null, region: null,
  progreso: { estrellas: {} }
};
try { var guardado = JSON.parse(localStorage.getItem(CLAVE) || 'null'); if (guardado && guardado.estrellas) J.progreso = guardado; } catch (e) {}
function guardar() { try { localStorage.setItem(CLAVE, JSON.stringify(J.progreso)); } catch (e) {} }
var MIS = D.misiones;
function mision() { return MIS[J.idx]; }

/* ---------- Entrada ---------- */
var teclas = {}, joy = { activo: false, ox: 0, oy: 0, vx: 0, vy: 0, id: null };
addEventListener('keydown', function (e) {
  teclas[e.key.toLowerCase()] = true;
  if ((e.key === ' ' || e.key === 'Enter') && J.pantalla === 'vuelo' && !$('#bAterrizar').hidden) { e.preventDefault(); aterrizar(); }
  if (e.key === 'Escape' && J.pantalla === 'vuelo') pausar();
});
addEventListener('keyup', function (e) { teclas[e.key.toLowerCase()] = false; });
var lienzo = rd.domElement;
lienzo.addEventListener('pointerdown', function (e) {
  if (J.pantalla !== 'vuelo') return;
  joy.activo = true; joy.id = e.pointerId; joy.ox = e.clientX; joy.oy = e.clientY; joy.vx = joy.vy = 0;
  var el = $('#joy'); el.hidden = false; el.style.left = e.clientX + 'px'; el.style.top = e.clientY + 'px'; el.firstChild.style.transform = '';
  try { lienzo.setPointerCapture(e.pointerId); } catch (er) {}
  ocultarTip();
});
lienzo.addEventListener('pointermove', function (e) {
  if (!joy.activo || e.pointerId !== joy.id) return;
  var dx = e.clientX - joy.ox, dy = e.clientY - joy.oy, l = Math.sqrt(dx * dx + dy * dy), max = 45;
  if (l > max) { dx = dx / l * max; dy = dy / l * max; }
  joy.vx = dx / max; joy.vy = dy / max;
  $('#joy').firstChild.style.transform = 'translate(' + dx + 'px,' + dy + 'px)';
});
function soltar(e) { if (e.pointerId !== joy.id) return; joy.activo = false; joy.vx = joy.vy = 0; $('#joy').hidden = true; }
lienzo.addEventListener('pointerup', soltar); lienzo.addEventListener('pointercancel', soltar);

function entrada() {
  var g = 0, a = 0;
  if (teclas.arrowleft || teclas.a) g -= 1;
  if (teclas.arrowright || teclas.d) g += 1;
  if (teclas.arrowup || teclas.w) a += 1;
  if (teclas.arrowdown || teclas.s) a -= 1;
  if (joy.activo) { g += joy.vx; a -= joy.vy; }
  return { g: Math.max(-1, Math.min(1, g)), a: Math.max(-1, Math.min(1, a)) };
}

/* ---------- HUD ---------- */
var tipT = 0;
function tip(txt, seg, arriba) {
  var el = $('#tip'); el.textContent = txt; el.hidden = false; el.classList.toggle('arriba', !!arriba);
  el.style.animation = 'none'; void el.offsetWidth; el.style.animation = '';
  tipT = seg || 3;
}
function quitarTip() { tipT = 0; $('#tip').hidden = true; }
function ocultarTip() { if (tipT > 0 && tipT < 900) tipT = Math.min(tipT, 0.6); }
function estrellasHTML(n, de) {
  var s = ''; for (var i = 0; i < (de || 3); i++) s += i < n ? '★' : '<span class="off">★</span>'; return s;
}
var tactil = matchMedia('(pointer:coarse)').matches || 'ontouchstart' in window;
function como() { return tactil ? 'Arrastra el dedo en la pantalla: a los lados para girar, arriba para ir más rápido.' : 'Flechas o WASD para volar. Espacio para aterrizar.'; }
$('#iFrase').textContent = D.frase;
$('#iComo').textContent = D.comoSeJuega;
$('#pComo').textContent = como();

function pintarLista(sel) {
  var el = $(sel); el.innerHTML = '';
  MIS.forEach(function (m, i) {
    var b = document.createElement('button'), est = J.progreso.estrellas[m.id] || 0;
    b.innerHTML = (i + 1) + '<small>' + estrellasHTML(est) + '</small>';
    b.title = m.pide;
    if (sel === '#pLista' && i === J.idx) b.className = 'actual';
    b.onclick = function () { cerrarPantallas(); empezar(i); };
    el.appendChild(b);
  });
}
function cerrarPantallas() { ['#inicio', '#pausa', '#final'].forEach(function (s) { $(s).hidden = true; }); }
function mostrarInicio() {
  J.pantalla = 'inicio'; cerrarPantallas(); $('#inicio').hidden = false; pintarLista('#iLista');
  $('#hud').hidden = $('#lado').hidden = true; $('#card').hidden = true; $('#bAterrizar').hidden = true; $('#flecha').hidden = true;
  var hechas = MIS.filter(function (m) { return J.progreso.estrellas[m.id]; }).length;
  $('#bJugar').textContent = hechas > 0 && hechas < MIS.length ? 'Seguir el viaje' : 'Jugar';
}
function pausar() {
  if (J.pantalla !== 'vuelo') return;
  J.pantalla = 'pausa'; $('#pausa').hidden = false; pintarLista('#pLista'); joy.activo = false; $('#joy').hidden = true;
}
$('#bMenu').onclick = pausar;
$('#bSeguir').onclick = function () { $('#pausa').hidden = true; J.pantalla = 'vuelo'; };
$('#bJugar').onclick = function () {
  var i = MIS.findIndex(function (m) { return !J.progreso.estrellas[m.id]; });
  cerrarPantallas(); empezar(i < 0 ? 0 : i);
};
$('#bOtra').onclick = function () { cerrarPantallas(); empezar(0); };
$('#bAterrizar').onclick = function () { aterrizar(); };

/* Mapa pequeño */
var mini = $('#mini'), mctx = mini.getContext('2d'), MW = mini.width, MH = mini.height, fondoMini;
(function () {
  var c = document.createElement('canvas'); c.width = MW; c.height = MH;
  var x = c.getContext('2d'), img = x.createImageData(MW, MH);
  for (var py = 0; py < MH; py++) for (var px = 0; px < MW; px++) {
    var lon = LON_MIN + (px + 0.5) / MW * (LON_MAX - LON_MIN), lat = LAT_MAX - (py + 0.5) / MH * (LAT_MAX - LAT_MIN);
    var r = regionEn(lon, lat), col;
    if (r) col = COLOR[r]; else col = esMar(lon, lat) ? new THREE.Color('#7fd0dc') : C_VECINO;
    var k = (py * MW + px) * 4;
    img.data[k] = col.r * 255; img.data[k + 1] = col.g * 255; img.data[k + 2] = col.b * 255; img.data[k + 3] = 255;
  }
  x.putImageData(img, 0, 0);
  x.strokeStyle = '#2a8fd6'; x.lineWidth = 1.5;
  Object.keys(RIOS).forEach(function (k) {
    x.beginPath(); RIOS[k].puntos.forEach(function (p, i) { var q = aMini(p[0], p[1]); i ? x.lineTo(q[0], q[1]) : x.moveTo(q[0], q[1]); }); x.stroke();
  });
  fondoMini = c;
})();
function aMini(lon, lat) { return [(lon - LON_MIN) / (LON_MAX - LON_MIN) * MW, (LAT_MAX - lat) / (LAT_MAX - LAT_MIN) * MH]; }
function pintarMini(tiempo) {
  mctx.drawImage(fondoMini, 0, 0);
  var obj = objetivo();
  if (obj && (J.pista || mision().tipo === 'rio')) {
    var o = aMini(toLon(obj.x), toLat(obj.z)), r = 5 + Math.sin(tiempo * 5) * 2;
    mctx.strokeStyle = '#ff6a4d'; mctx.lineWidth = 2.5; mctx.beginPath(); mctx.arc(o[0], o[1], r, 0, 7); mctx.stroke();
  }
  var p = aMini(toLon(P.x), toLat(P.z));
  mctx.save(); mctx.translate(p[0], p[1]); mctx.rotate(P.rumbo);
  mctx.fillStyle = '#15304d'; mctx.strokeStyle = '#fff'; mctx.lineWidth = 1.5;
  mctx.beginPath(); mctx.moveTo(0, -7); mctx.lineTo(5, 5); mctx.lineTo(0, 2.5); mctx.lineTo(-5, 5); mctx.closePath(); mctx.fill(); mctx.stroke();
  mctx.restore();
}

/* Etiquetas de ciudades cercanas */
var lbls = [];
for (var li = 0; li < 5; li++) { var le = document.createElement('div'); le.className = 'lbl'; le.hidden = true; $('#labels').appendChild(le); lbls.push(le); }
var vtmp = new THREE.Vector3();
function pintarEtiquetas(cercana) {
  var lista = CAPS.map(function (c) { var dx = c.x - P.x, dz = c.z - P.z; return { c: c, d: Math.sqrt(dx * dx + dz * dz) }; })
    .filter(function (o) { return o.d < 8; }).sort(function (a, b) { return a.d - b.d; }).slice(0, lbls.length);
  lbls.forEach(function (el, i) {
    var o = lista[i];
    if (!o || J.pantalla === 'inicio' || J.pantalla === 'final') { el.hidden = true; return; }
    vtmp.set(o.c.x, o.c.y + 1.25, o.c.z).project(cam);
    if (vtmp.z > 1) { el.hidden = true; return; }
    el.hidden = false; el.textContent = o.c.d.ciudad;
    el.className = 'lbl' + (o.c === cercana ? ' cerca' : '');
    el.style.left = ((vtmp.x + 1) / 2 * innerWidth) + 'px'; el.style.top = ((1 - vtmp.y) / 2 * innerHeight) + 'px';
  });
}

/* ---------- Misiones ---------- */
function objetivo() {
  var m = mision(); if (!m) return null;
  if (m.tipo === 'capital') { var c = capPorId[m.ciudad]; return { x: c.x, z: c.z }; }
  if (m.tipo === 'region') { var r = D.regiones[m.region].centro; return { x: toX(r[0]), z: toZ(r[1]) }; }
  var a = aros[J.sigAro]; return a ? { x: a.position.x, z: a.position.z } : null;
}
function colocar(lon, lat, rumboGrados) {
  P.x = toX(lon); P.z = toZ(lat); P.rumbo = rumboGrados * Math.PI / 180; P.y = alturaVuelo(P.x, P.z); P.vel = 3.6; P.giro = 0;
  camaraA(true);
}
function empezar(i) {
  J.idx = i; J.t = 0; J.errores = 0; J.pista = false; J.sigAro = 0; J.aterr = null; J.region = null;
  var m = mision();
  quitarAros();
  if (m.tipo === 'rio') {
    var pr = RIOS[m.rio].puntos, a = pr[0], b = pr[1];
    colocar(a[0], a[1], Math.atan2(b[0] - a[0], b[1] - a[1]) * 180 / Math.PI);
    crearAros(m.rio);
  } else colocar(m.salida[0], m.salida[1], m.salida[2]);
  $('#hud').hidden = $('#lado').hidden = false; $('#card').hidden = true;
  $('#mNum').textContent = 'Misión ' + (i + 1) + ' de ' + MIS.length;
  $('#mTxt').textContent = m.pide;
  J.pantalla = 'vuelo';
  if (i === 0 || !J.yaVolo) tip(como(), 6); else tip(m.pide, 3.5);
  J.yaVolo = true;
}
function llegar(titulo, etiqueta, color) {
  var m = mision();
  J.pantalla = 'tarjeta'; quitarTip(); $('#bAterrizar').hidden = true; $('#flecha').hidden = true; joy.activo = false; $('#joy').hidden = true;
  $('#cTag').textContent = etiqueta; $('#cTag').style.background = color;
  $('#cTit').textContent = titulo; $('#cDato').textContent = m.dato; $('#cPreg').textContent = m.pregunta.texto;
  $('#cFin').hidden = true;
  var ops = $('#cOps'); ops.innerHTML = '';
  var orden = m.pregunta.opciones.map(function (t, k) { return k; });
  for (var k = orden.length - 1; k > 0; k--) { var r = Math.floor(Math.random() * (k + 1)), t = orden[k]; orden[k] = orden[r]; orden[r] = t; }
  orden.forEach(function (k) {
    var b = document.createElement('button'); b.className = 'op'; b.textContent = m.pregunta.opciones[k]; b.dataset.k = k;
    b.onclick = function () { responder(k); };
    ops.appendChild(b);
  });
  $('#card').hidden = false; $('#card').scrollTop = 0;
}
function responder(k) {
  if (J.pantalla !== 'tarjeta' || !$('#cFin').hidden) return;
  var m = mision(), bien = k === m.pregunta.correcta;
  Array.prototype.forEach.call(document.querySelectorAll('.op'), function (b) {
    b.disabled = true; var kk = +b.dataset.k;
    if (kk === m.pregunta.correcta) b.classList.add('bien'); else if (kk === k) b.classList.add('mal');
  });
  var est = 3 - (J.errores > 0 ? 1 : 0) - (bien ? 0 : 1) - (J.t > m.tiempo ? 1 : 0);
  est = Math.max(1, est);
  J.progreso.estrellas[m.id] = Math.max(J.progreso.estrellas[m.id] || 0, est);
  guardar();
  var msg = bien ? '¡Respuesta correcta!' : 'La respuesta era: ' + m.pregunta.opciones[m.pregunta.correcta] + '.';
  if (J.t > m.tiempo) msg += ' Tardaste un poco: vuela más directo.';
  else if (J.errores > 0) msg += ' Aterrizaste antes en otra ciudad.';
  $('#cEst').innerHTML = estrellasHTML(est); $('#cMsg').textContent = msg;
  $('#bSig').textContent = J.idx + 1 < MIS.length ? 'Siguiente misión' : 'Ver mi resultado';
  $('#cFin').hidden = false;
  setTimeout(function () { var c = $('#card'); c.scrollTop = c.scrollHeight; }, 50);
}
$('#bSig').onclick = function () { siguiente(); };
function siguiente() {
  $('#card').hidden = true;
  if (J.idx + 1 < MIS.length) empezar(J.idx + 1); else final();
}
function final() {
  J.pantalla = 'final'; quitarTip(); $('#hud').hidden = $('#lado').hidden = true; $('#bAterrizar').hidden = true;
  var tot = MIS.reduce(function (s, m) { return s + (J.progreso.estrellas[m.id] || 0); }, 0), max = MIS.length * 3;
  $('#fEst').innerHTML = '★ ' + tot + ' <span class="off" style="font-size:.6em">/ ' + max + '</span>';
  var p = tot / max;
  $('#fMsg').textContent = p >= 0.9 ? 'Eres un gran piloto: conoces Colombia de punta a punta.' :
    p >= 0.6 ? 'Muy buen viaje. Repite las misiones con menos estrellas para completar el mapa.' :
    'Buen comienzo. Vuelve a volar las misiones para ganar más estrellas.';
  $('#final').hidden = false;
}
function aterrizar() {
  if (J.pantalla !== 'vuelo' || !J.cerca) return;
  J.aterr = { c: J.cerca, t: 0, x0: P.x, z0: P.z, y0: P.y, fase: 'baja' };
  J.pantalla = 'aterrizando'; $('#bAterrizar').hidden = true; joy.activo = false; $('#joy').hidden = true;
}

/* ---------- Bucle ---------- */
var reloj = new THREE.Clock(), tiempo = 0, raf = 0, orbita = 0;
var camPos = new THREE.Vector3(), camMira = new THREE.Vector3();
function camaraA(salto) {
  var vertical = innerWidth / innerHeight < 0.8;
  var dist = vertical ? 13 : 12, alto = vertical ? 13 : 9;
  var fx = Math.sin(P.rumbo), fz = -Math.cos(P.rumbo);
  var px = P.x - fx * dist, pz = P.z - fz * dist, py = P.y + alto;
  var mx = P.x + fx * (vertical ? 6 : 5), mz = P.z + fz * (vertical ? 6 : 5), my = P.y - 1.5;
  if (salto) { camPos.set(px, py, pz); camMira.set(mx, my, mz); }
  else { camPos.lerp(vtmp.set(px, py, pz), 0.08); camMira.lerp(vtmp.set(mx, my, mz), 0.12); }
  cam.position.copy(camPos); cam.lookAt(camMira);
}
function paso() {
  raf = requestAnimationFrame(paso);
  var dt = Math.min(0.05, reloj.getDelta()); tiempo += dt;
  if (Math.floor(tiempo * 30) !== Math.floor((tiempo - dt) * 30)) olas(tiempo);
  nubes.forEach(function (n, i) { n.position.x += dt * 0.25; if (n.position.x > toX(-67)) n.position.x = toX(-79); });
  CAPS.forEach(function (c) { c.cab.rotation.y += dt * 1.5; });
  aros.forEach(function (a) { a.rotation.z += dt * 0.8; });
  if (tipT > 0 && tipT < 900) { tipT -= dt; if (tipT <= 0) $('#tip').hidden = true; }

  if (J.pantalla === 'inicio' || J.pantalla === 'cargando') {
    orbita += dt * 0.05;
    var ancho = innerWidth >= 900;
    cam.position.set(toX(-73.5) + Math.sin(orbita) * 22, 78, toZ(3.2) + 48 + Math.cos(orbita) * 10);
    cam.lookAt(toX(-73.5), 0, toZ(4.6));
    if (ancho) cam.setViewOffset(innerWidth, innerHeight, -innerWidth * 0.2, 0, innerWidth, innerHeight); else cam.clearViewOffset();
    scene.fog.near = 140; scene.fog.far = 300;
    avion.g.visible = false;
    rd.render(scene, cam); return;
  }
  if (cam.view && cam.view.enabled) cam.clearViewOffset();
  scene.fog.near = 55; scene.fog.far = 150;
  avion.g.visible = true;
  if (J.pantalla === 'vuelo') volar(dt);
  else if (J.pantalla === 'aterrizando') bajar(dt);
  avion.helice.rotation.z += dt * (J.pantalla === 'tarjeta' ? 6 : 30);
  avion.g.position.set(P.x, P.y + (J.pantalla === 'vuelo' ? Math.sin(tiempo * 2) * 0.05 : 0), P.z);
  avion.g.rotation.set(0, -P.rumbo, 0);
  avion.cuerpo.rotation.z += (-P.giro * 0.55 - avion.cuerpo.rotation.z) * Math.min(1, dt * 6);
  sol.position.set(P.x - 8, P.y + 22, P.z + 10); sol.target.position.set(P.x, 0, P.z);
  camaraA(false);
  pintarMini(tiempo);
  pintarEtiquetas(J.cerca);
  rd.render(scene, cam);
}
function volar(dt) {
  var m = mision(), inp = entrada();
  J.t += dt;
  $('#mReloj').textContent = Math.floor(J.t) + ' s';
  P.giro += (inp.g - P.giro) * Math.min(1, dt * 5);
  P.rumbo += P.giro * 1.35 * dt;
  var velObj = 3.6 + (inp.a > 0 ? inp.a * 2.6 : inp.a * 1.6);
  P.vel += (velObj - P.vel) * Math.min(1, dt * 2);
  if (!J.quieto) { P.x += Math.sin(P.rumbo) * P.vel * dt; P.z += -Math.cos(P.rumbo) * P.vel * dt; }
  /* bordes del mapa: empuja de vuelta */
  var x0 = toX(LON_MIN + 0.6), x1 = toX(LON_MAX - 0.6), z0 = toZ(LAT_MAX - 0.6), z1 = toZ(LAT_MIN + 0.6);
  if (P.x < x0 || P.x > x1 || P.z < z0 || P.z > z1) {
    P.x = Math.max(x0, Math.min(x1, P.x)); P.z = Math.max(z0, Math.min(z1, P.z));
    var hacia = Math.atan2(toX(-74) - P.x, -(toZ(4.5) - P.z));
    var dif = Math.atan2(Math.sin(hacia - P.rumbo), Math.cos(hacia - P.rumbo));
    P.rumbo += dif * Math.min(1, dt * 2);
    if (!J.avisoBorde) { tip('Hasta aquí llega el mapa. ¡Da la vuelta!', 2.5); J.avisoBorde = true; setTimeout(function () { J.avisoBorde = false; }, 4000); }
  }
  var fx = Math.sin(P.rumbo), fz = -Math.cos(P.rumbo);
  var meta = Math.max(alturaVuelo(P.x, P.z), alturaVuelo(P.x + fx * 2, P.z + fz * 2));
  P.y += (meta - P.y) * Math.min(1, dt * 2.5);

  var lon = toLon(P.x), lat = toLat(P.z), reg = regionEn(lon, lat);
  if (reg !== J.region) {
    J.region = reg;
    var chip = $('#chip');
    chip.lastChild.textContent = reg ? D.regiones[reg].nombre : (esMar(lon, lat) ? (lat > 7 ? 'Mar Caribe' : 'Océano Pacífico') : 'Fuera de Colombia');
    chip.firstChild.style.background = reg ? D.regiones[reg].color : (esMar(lon, lat) ? '#7fd0dc' : '#e6dcc3');
  }

  /* ciudad bajo el avión */
  var cerca = null, dmin = 1.7;
  CAPS.forEach(function (c) { var dx = c.x - P.x, dz = c.z - P.z, d = Math.sqrt(dx * dx + dz * dz); if (d < dmin) { dmin = d; cerca = c; } });
  J.cerca = m.tipo === 'capital' ? cerca : null;
  var ba = $('#bAterrizar');
  if (J.cerca) { ba.lastChild.textContent = J.cerca.d.ciudad; if (ba.hidden) { ba.hidden = false; quitarTip(); } } else if (!ba.hidden) ba.hidden = true;

  if (m.tipo === 'region' && reg === m.region) {
    var R = D.regiones[m.region];
    llegar('¡Llegaste a la ' + (R.nombre.indexOf('Región') === 0 ? R.nombre.replace('Región', 'región') : R.nombre) + '!', R.nombre, R.color);
    return;
  }
  if (m.tipo === 'rio') {
    aros.forEach(function (a, k) { a.visible = k >= J.sigAro && k <= J.sigAro + 2; a.material = k === J.sigAro ? aroMat : aroMat2; });
    var a = aros[J.sigAro];
    if (a) {
      var dx = a.position.x - P.x, dz = a.position.z - P.z;
      if (Math.sqrt(dx * dx + dz * dz) < 1.6) {
        J.sigAro++;
        if (J.sigAro >= aros.length) { llegar('¡Llegaste al final del ' + RIOS[m.rio].nombre.replace('Río', 'río') + '!', RIOS[m.rio].nombre, '#9fe0f5'); return; }
      }
    }
  }
  if (!J.pista && m.tipo !== 'rio' && J.t > 35) { J.pista = true; tip('Sigue la flecha amarilla.', 3); }
  flecha();
}
function flecha() {
  var m = mision(), obj = objetivo(), el = $('#flecha');
  var mostrar = obj && (J.pista || (m.tipo === 'rio' && J.t > 2));
  if (!mostrar) { if (!el.hidden) el.hidden = true; return; }
  var dx = obj.x - P.x, dz = obj.z - P.z, d = Math.sqrt(dx * dx + dz * dz);
  if (m.tipo === 'rio' && d < 6) { if (!el.hidden) el.hidden = true; return; }
  el.hidden = false;
  var ang = Math.atan2(dx, -dz) - P.rumbo;
  el.firstChild.style.transform = 'rotate(' + ang + 'rad)';
  $('#flechaTxt').textContent = m.tipo === 'rio' ? 'Siguiente aro' : 'Pista';
}
function bajar(dt) {
  var A = J.aterr, c = A.c; A.t += dt;
  if (A.fase === 'baja') {
    var k = Math.min(1, A.t / 1.2), e = k * k * (3 - 2 * k);
    P.x = A.x0 + (c.x - A.x0) * e; P.z = A.z0 + (c.z - A.z0) * e; P.y = A.y0 + (c.y + 1.5 - A.y0) * e;
    P.giro *= 0.9;
    if (k >= 1) {
      var m = mision();
      if (c.d.id === m.ciudad) { llegar(c.d.ciudad, 'Capital de ' + c.d.depto, D.regiones[c.d.region].color); return; }
      J.errores++; J.pista = true;
      tip('Esta es ' + c.d.ciudad + ', capital de ' + c.d.depto + '. No es la que buscas: sigue la flecha.', 4, true);
      A.fase = 'sube'; A.t = 0; A.y0 = P.y;
    }
  } else {
    var k2 = Math.min(1, A.t / 1.0);
    P.x += Math.sin(P.rumbo) * 2.5 * dt; P.z += -Math.cos(P.rumbo) * 2.5 * dt;
    P.y = A.y0 + (alturaVuelo(P.x, P.z) - A.y0) * k2;
    if (k2 >= 1) { J.aterr = null; J.pantalla = 'vuelo'; }
  }
}

addEventListener('resize', function () {
  cam.aspect = innerWidth / innerHeight; cam.updateProjectionMatrix(); rd.setSize(innerWidth, innerHeight);
});
document.addEventListener('visibilitychange', function () {
  if (document.hidden) { cancelAnimationFrame(raf); raf = 0; }
  else if (!raf) { reloj.getDelta(); paso(); }
});

/* Depuración */
window.__juego = {
  estado: function () {
    var m = mision();
    return { pantalla: J.pantalla, mision: J.idx, id: m && m.id, tipo: m && m.tipo, region: J.region, lon: +toLon(P.x).toFixed(2), lat: +toLat(P.z).toFixed(2),
      tiempo: +J.t.toFixed(1), errores: J.errores, aro: J.sigAro, aros: aros.length, cerca: J.cerca && J.cerca.d.id, estrellas: J.progreso.estrellas };
  },
  saltar: function (n) { cerrarPantallas(); $('#card').hidden = true; empezar(Math.max(0, Math.min(MIS.length - 1, n))); },
  ir: function (lon, lat, rumbo) { colocar(lon, lat, rumbo == null ? P.rumbo * 180 / Math.PI : rumbo); },
  quieto: function (q) { J.quieto = !!q; }, arranque: 0,
  aterrizar: aterrizar, responder: responder, siguiente: siguiente, regionEn: regionEn,
  pasarAros: function () { J.sigAro = Math.max(0, aros.length - 1); var a = aros[J.sigAro]; if (a) { P.x = a.position.x; P.z = a.position.z; } }
};

$('#carga').hidden = true;
window.__juego.arranque = Math.round(performance.now());
mostrarInicio();
paso();
})();
