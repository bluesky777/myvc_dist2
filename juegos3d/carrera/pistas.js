/* Turbo Saber — PISTAS. Cada una es un objeto: trazado (cp, puntos de control x/z que juego.js escala a
   `largo` metros), paleta (cielo, niebla, luces, suelo, vía, tribuna, banderines) y su decorado(K), que arma con las
   herramientas que le pasa el motor (K: THREE, la pista muestreada P/T/N, altura(), lugares(), inst(), fusion(),
   cinta(), puntos(), anim()…). Todo lo que pone el decorado cuelga del escenario y se libera al cambiar de pista.
   Ligeras: cada familia de objetos es UNA malla (instancias o geometría fusionada), sin luces ni texturas extra. */
(function () {
'use strict';
const PI = Math.PI;

/* --- piezas fusionables: {g, c, p, r, s} --- */
const pieza = (g, c, p, r, s) => ({ g, c, p, r, s });
// Hoja (cono aplanado) que sale del punto `y` hacia el ángulo a, inclinada `inc` (0 = hacia arriba, π/2 = horizontal).
function hoja(T, a, inc, largo, ancho, c, y, base) {
  const dx = Math.sin(inc) * Math.cos(a), dy = Math.cos(inc), dz = -Math.sin(inc) * Math.sin(a), m = largo / 2 + (base || 0);
  return pieza(new T.ConeGeometry(ancho, largo, 4), c, [dx * m, y + dy * m, dz * m], [0, a, -inc], [1, 1, 0.22]);
}
const palma = (T, tronco, hojas, alto, n, caida) => {
  const ps = [pieza(new T.CylinderGeometry(0.22, 0.36, alto, 6), tronco, [0, alto / 2, 0])];
  for (let k = 0; k < n; k++) ps.push(hoja(T, k / n * PI * 2 + 0.3, caida + (k % 2) * 0.25, 4.2, 0.85, hojas[k % hojas.length], alto - 0.2, 0.2));
  return ps;
};

const K_H = 6; // media anchura de la vía (la misma que juego.js)
// Agua con onditas: shader barato (vertex colors + brillos que se mueven), sin reflejos. opaca: el embalse.
function aguaShader(T, opaca) {
  return new T.ShaderMaterial({
    uniforms: T.UniformsUtils.merge([T.UniformsLib.fog, { t: { value: 0 } }]), vertexColors: true, transparent: !opaca, depthWrite: !!opaca, fog: true,
    vertexShader: 'varying vec3 vP;\nvarying vec3 vC;\n#include <fog_pars_vertex>\nvoid main() {\n  vC = color;\n  vec4 w = modelMatrix * vec4(position, 1.0); vP = w.xyz;\n  vec4 mvPosition = viewMatrix * w;\n  gl_Position = projectionMatrix * mvPosition;\n#include <fog_vertex>\n}',
    fragmentShader: 'uniform float t;\nvarying vec3 vP;\nvarying vec3 vC;\n#include <fog_pars_fragment>\nvoid main() {\n' +
      '  float w = sin(vP.x * 1.7 + t * 2.1) * sin(vP.z * 1.5 - t * 1.6) + 0.6 * sin((vP.x - vP.z) * 0.9 + t * 1.2);\n' +
      '  float brillo = smoothstep(0.9, 1.5, w), onda = 0.5 + 0.5 * sin(w * 3.0);\n' +
      (opaca ? '  gl_FragColor = vec4(mix(vC, vec3(1.0), brillo * 0.35 + onda * 0.04), 1.0);\n' : '  gl_FragColor = vec4(mix(vC, vec3(1.0), brillo * 0.85), 0.24 + 0.12 * onda + brillo * 0.5);\n') +
      '#include <fog_fragment>\n}'
  });
}
// La Piedra del Peñol: domo ovalado de lados casi verticales, estrías oscuras de escurrimiento, franjas de vegetación,
// y la grieta de la escalera. Una malla con colores por vértice.
const GRIETA = 2.25, ANCHO_GRIETA = 0.075; // ángulo (rad) de la grieta: mira a la recta de salida
function radioPiedra(R, th, h) {
  // lados casi verticales y domo redondeado; el pie un poco más ancho (derrubios y monte)
  const perfil = Math.pow(Math.max(0, 1 - Math.pow(h, 3)), 0.38) * (1 + 0.07 * (1 - Math.min(1, h / 0.08)));
  const estria = Math.sin(th * 23 + 1.3) * 0.005 + Math.sin(th * 41 + h * 2) * 0.004 + Math.sin(th * 9 - 0.4) * 0.014 + Math.sin(th * 3 + h * 2.5) * 0.02;
  const dg = Math.abs(((th - GRIETA + PI) % (2 * PI) + 2 * PI) % (2 * PI) - PI), grieta = h < 0.94 ? K_suave(ANCHO_GRIETA, 0, dg) * 0.06 : 0;
  return perfil * (1 + estria - grieta);
}
function puntoPiedra(R, th, h, extra) {
  const r = radioPiedra(R, th, h);
  return [R.x + Math.cos(th) * (R.a * r + (extra || 0)), h * R.alto - 4, R.z + Math.sin(th) * (R.b * r + (extra || 0))];
}
function piedra(T, R) {
  const NT = 144, NH = 64, pos = [], col = [], idx = [], c = new T.Color();
  const claro = new T.Color(0xc9c7c0), medio = new T.Color(0xa9a7a0), oscuro = new T.Color(0x5e5d59), negro = new T.Color(0x3e3d3a), verde = new T.Color(0x4f7a3a), verde2 = new T.Color(0x6a8f45);
  for (let j = 0; j <= NH; j++) for (let i = 0; i <= NT; i++) {
    const th = i / NT * PI * 2, h = j / NH, p = puntoPiedra(R, th, h); pos.push(...p);
    // escurrimiento: vetas verticales oscuras que bajan desde arriba; vegetación en franjas y al pie
    // cada veta empieza a una altura distinta y baja hasta perderse
    const veta = Math.sin(th * 31 + 0.7) * 0.5 + Math.sin(th * 57 + h * 1.5) * 0.35 + Math.sin(th * 13 - 1.1) * 0.45 + Math.sin(th * 83 + 2) * 0.2;
    const desde = 0.55 + 0.35 * Math.sin(th * 17 + 0.3), hasta = 0.12 + 0.2 * Math.sin(th * 11 - 1);
    const dg = Math.abs(((th - GRIETA + PI) % (2 * PI) + 2 * PI) % (2 * PI) - PI);
    const veg = Math.sin(th * 7 + 2.2) * 0.55 + Math.sin(th * 19 - h * 6) * 0.3 + Math.sin(th * 5 + h * 11) * 0.25;
    c.copy(claro).lerp(medio, 0.5 + 0.5 * Math.sin(th * 5 + h * 9));
    if (veta > 0.45 && h > hasta && h < desde) c.lerp(veta > 0.75 ? negro : oscuro, Math.min(1, (veta - 0.45) * 2.5) * K_suave(hasta, hasta + 0.1, h) * (1 - K_suave(desde - 0.12, desde, h)));
    if ((veg > 0.7 && h < 0.7 * (0.75 + 0.25 * Math.sin(th * 3))) || h < 0.06 + 0.04 * Math.sin(th * 11) + 0.03 * Math.sin(th * 29)) c.copy(veg > 0.82 ? verde : verde2);
    if (dg < ANCHO_GRIETA * 0.8 && h < 0.94) c.copy(oscuro);
    if (h > 0.985) c.copy(medio);
    col.push(c.r, c.g, c.b);
  }
  for (let j = 0; j < NH; j++) for (let i = 0; i < NT; i++) { const a = j * (NT + 1) + i, b = a + NT + 1; idx.push(a, b, a + 1, a + 1, b, b + 1); }
  const g = new T.BufferGeometry(); g.setIndex(idx); g.setAttribute('position', new T.Float32BufferAttribute(pos, 3)); g.setAttribute('color', new T.Float32BufferAttribute(col, 3));
  g.computeVertexNormals(); return g;
}
// ~740 escalones: de lejos, una cinta blanca en zigzag (con su muro) que sube por la grieta
function escalera(T, R) {
  const partes = [], o = new T.Object3D(), pts = [];
  for (let k = 0, h = 0.02; h < 0.95; k++, h += 0.022) { const th = GRIETA + (k % 2 ? 1 : -1) * ANCHO_GRIETA * 0.45; pts.push(new T.Vector3(...puntoPiedra(R, th, h, -0.6))); }
  for (let i = 0; i < pts.length - 1; i++) {
    const a = pts[i], b = pts[i + 1], m = a.clone().add(b).multiplyScalar(0.5), l = a.distanceTo(b);
    o.position.copy(m); o.lookAt(b);
    partes.push(pieza(new T.BoxGeometry(2.4, 0.9, l + 1), 0xfffdf7, [m.x, m.y, m.z], [o.rotation.x, o.rotation.y, o.rotation.z]));
    partes.push(pieza(new T.BoxGeometry(0.4, 1.6, l + 1), 0xe8e4da, [m.x, m.y + 1, m.z], [o.rotation.x, o.rotation.y, o.rotation.z]));
  }
  return partes;
}
// «G I» en blanco, pintadas sobre la cara de la roca: un parche que sigue la superficie, con la textura de las letras
function letras(T, R) {
  const cv = document.createElement('canvas'); cv.width = 512; cv.height = 256; const x = cv.getContext('2d');
  x.fillStyle = '#f4f2ea'; x.font = '900 236px "Arial Black", Arial, sans-serif'; x.textAlign = 'center'; x.textBaseline = 'middle';
  x.fillText('G', 170, 136); x.fillRect(368, 22, 54, 224);
  x.globalCompositeOperation = 'destination-out'; // pintura gastada
  for (let i = 0; i < 260; i++) { x.globalAlpha = 0.25 + Math.random() * 0.5; x.fillRect(Math.random() * 512, Math.random() * 256, 2 + Math.random() * 6, 6 + Math.random() * 26); }
  const tx = new T.CanvasTexture(cv); tx.anisotropy = 4;
  const th0 = GRIETA - 1.0, dth = 0.72, h0 = 0.3, dh = 0.24, NU = 18, NV = 10, pos = [], uv = [], idx = [];
  for (let j = 0; j <= NV; j++) for (let i = 0; i <= NU; i++) {
    const th = th0 + dth * (1 - i / NU), h = h0 + dh * (j / NV); pos.push(...puntoPiedra(R, th, h, 0.45)); uv.push(i / NU, j / NV);
  }
  for (let j = 0; j < NV; j++) for (let i = 0; i < NU; i++) { const a = j * (NU + 1) + i, b = a + NU + 1; idx.push(a, a + 1, b, a + 1, b + 1, b); }
  const g = new T.BufferGeometry(); g.setIndex(idx); g.setAttribute('position', new T.Float32BufferAttribute(pos, 3)); g.setAttribute('uv', new T.Float32BufferAttribute(uv, 2)); g.computeVertexNormals();
  return new T.Mesh(g, new T.MeshBasicMaterial({ map: tx, color: 0xe9e7df, transparent: true, alphaTest: 0.3, side: T.DoubleSide, polygonOffset: true, polygonOffsetFactor: -2 }));
}

// El modelo de la piedra (modelos/penol.glb, hecho aparte): se pide sólo al armar esta pista. Se centra en la piedra,
// se apoya en el agua y se escala a unos 200 m de alto sin salirse de la planta que deja libre el trazado
// (planta procedural + 8 m). Llega → reemplaza a la procedural. No hay fichero o falla → se queda la procedural.
function ponerModelo(K, R, propia) {
  const T = K.THREE;
  K.modelo('modelos/penol.glb').then(m => {
    if (!m) return;
    if (!K.vigente()) { m.traverse(o => { if (o.geometry) o.geometry.dispose(); }); return; }
    // en el modelo, la cara de la escalera y las letras mira a +z: se gira hacia la recta de salida
    m.rotation.y = Math.atan2(K.P[0].x - R.x, K.P[0].z - R.z); m.updateMatrixWorld(true);
    let b = new T.Box3().setFromObject(m); const s = b.getSize(new T.Vector3());
    const k = Math.min(185 / s.y, 2 * (R.a + 8) / s.x, 2 * (R.b + 8) / s.z);
    m.scale.multiplyScalar(k); m.updateMatrixWorld(true);
    b = new T.Box3().setFromObject(m); const c = b.getCenter(new T.Vector3());
    m.position.x += R.x - c.x; m.position.z += R.z - c.z; m.position.y += -2 - b.min.y;
    // sin sombras (200 m no caben en la del sol); la textura de Tripo sale oscura junto al resto: se aclara con ella misma
    m.traverse(o => {
      if (!o.isMesh) return; o.castShadow = false; o.receiveShadow = false;
      [].concat(o.material).forEach(mt => { if (mt.map) { mt.emissive = new T.Color(0xffffff); mt.emissiveMap = mt.map; mt.emissiveIntensity = 0.85; } mt.metalness = 0; mt.roughness = 1; mt.needsUpdate = true; });
    });
    m.userData.escala = +k.toFixed(2); m.userData.alto = +(s.y * k).toFixed(1); m.userData.planta = [+(s.x * k).toFixed(1), +(s.z * k).toFixed(1)]; m.name = 'penol.glb';
    m.traverse(o => { o.userData.monumento = 'piedra'; }); K.poner(m); propia.forEach(p => { p.visible = false; });
    K.pista.encuadre = [[R.x, s.y * k + 12, R.z]]; K.reencuadrar();
  });
}
// Dentro de la pista, el sitio desde el que un monumento (a h m de alto) queda de frente en más tramos de la vuelta con
// la cámara de carrera: centrado a lo ancho (±24°), y entre 10° por debajo y 16° por encima de hacia donde mira.
function mejorSitio(K, h, minPista, fuera) {
  let mejor = null;
  const cams = [];
  for (let i = 0; i < K.NS; i += 6) {
    const d = i / K.NS * K.LARGO, a = new K.V3(), b = new K.V3(); K.marco(d - 10, 0, a); K.marco(d + 8, 0, b);
    cams.push({ x: a.x, z: a.z, yaw: Math.atan2(b.x - a.x, b.z - a.z), pitch: Math.atan2(1.8 - 5.2, Math.hypot(b.x - a.x, b.z - a.z)) });
  }
  for (let x = K.CENTRO.x - 110; x <= K.CENTRO.x + 110; x += 6) for (let z = K.CENTRO.z - 110; z <= K.CENTRO.z + 110; z += 6) {
    if ((!fuera && !K.dentro(x, z)) || K.distPista(x, z) < minPista || Math.hypot(x - K.CENTRO.x, z - K.CENTRO.z) > 125) continue;
    if (Math.hypot(x - K.TRIB_C.x, z - K.TRIB_C.z) < 30 || Math.hypot(x - K.PODIO_C.x, z - K.PODIO_C.z) < 16) continue;
    let n = 0;
    for (const c of cams) {
      const dx = x - c.x, dz = z - c.z, l = Math.hypot(dx, dz); if (l < 25) continue;
      let dy = Math.atan2(dx, dz) - c.yaw; while (dy > PI) dy -= 2 * PI; while (dy < -PI) dy += 2 * PI;
      const pv = Math.atan2(h - 5.2, l) - c.pitch;
      if (Math.abs(dy) < 0.6 && pv > -0.17 && pv < 0.38) n += 1;
    }
    if (!mejor || n > mejor.n) mejor = { x, z, n };
  }
  return mejor;
}
// Como K.fusion, pero las piezas que traen {colores} conservan su color por vértice.
function fusionColores(T, K, partes) {
  const normales = partes.filter(q => !q.colores), propias = partes.filter(q => q.colores);
  const g1 = K.fusion(normales), pos = Array.from(g1.attributes.position.array), col = Array.from(g1.attributes.color.array);
  propias.forEach(q => { pos.push(...q.g.attributes.position.array); col.push(...q.colores); q.g.dispose(); });
  g1.dispose();
  const g = new T.BufferGeometry(); g.setAttribute('position', new T.Float32BufferAttribute(pos, 3)); g.setAttribute('color', new T.Float32BufferAttribute(col, 3));
  g.computeVertexNormals(); return g;
}
// Cartagena: un tramo de la muralla (piedra coralina, baluartes en punta con garitas y cañones) y la Torre del Reloj
// (puerta de tres arcos en la muralla, torre de tres cuerpos con el reloj y remate con cupulín), más el Castillo de
// San Felipe en una loma al fondo. Todo en mallas fusionadas.
function murallaYTorre(K, o) {
  const T = K.THREE, az = K.azar, pz = [], cor = [0xd9b77a, 0xcfa968, 0xe2c38a], yb = -1.4, alto = 7.5;
  const W = (u, s, y) => [o.m0x + o.cdx * u + o.dx * s, y, o.m0z + o.cdz * u + o.dz * s], ry = Math.atan2(o.cdx, o.cdz);
  // lienzo de muralla en tramos (con un poco de variación de color) y el parapeto redondeado arriba
  for (let u = -o.LM / 2; u < o.LM / 2; u += 10) {
    pz.push(pieza(new T.BoxGeometry(4.2, alto, 10.2), cor[Math.floor(az() * 3)], W(u + 5, 0, yb + alto / 2), [0, ry, 0]));
    pz.push(pieza(new T.CylinderGeometry(0.7, 0.7, 10.2, 6).rotateX(PI / 2), 0xe8cf9c, W(u + 5, 1.6, yb + alto + 0.3), [0, ry, 0]));
  }
  // baluartes en punta hacia el mar, cada uno con su garita en la punta y dos cañones
  const fl = new T.Shape(); fl.moveTo(-9, 0); fl.lineTo(-7, 7); fl.lineTo(0, 13); fl.lineTo(7, 7); fl.lineTo(9, 0); fl.lineTo(-9, 0);
  const garita = (x, y, z) => [pieza(new T.ConeGeometry(1.25, 1.2, 10), 0xcfa968, [x, y - 0.4, z], [PI, 0, 0]), pieza(new T.CylinderGeometry(1.1, 1.1, 2.4, 10), 0xe2c38a, [x, y + 1.0, z]),
    pieza(new T.SphereGeometry(1.2, 10, 5, 0, PI * 2, 0, PI / 2), 0xd9b77a, [x, y + 2.2, z]), pieza(new T.SphereGeometry(0.25, 6, 4), 0xe2c38a, [x, y + 3.5, z]), pieza(new T.BoxGeometry(0.2, 0.7, 2.3), 0x3a2a1a, [x, y + 1.1, z])];
  for (const u of [-o.LM / 2 + 18, 0, o.LM / 2 - 18]) {
    const g = new T.ExtrudeGeometry(fl, { depth: alto, bevelEnabled: false }).rotateX(-PI / 2); // en el suelo; la punta hacia +z local
    pz.push(pieza(g, 0xd9b77a, W(u, 1.5, yb), [0, Math.atan2(o.dx, o.dz), 0]));
    const [tx, , tz] = W(u, 1.5 + 13.2, 0); pz.push(...garita(tx, yb + alto, tz));
    for (const k of [-1, 1]) { const [cx, , cz] = W(u + k * 4.5, 1.5 + 9.6, 0); pz.push(pieza(new T.CylinderGeometry(0.22, 0.3, 2.6, 7), 0x23252b, [cx, yb + alto + 0.3, cz], [PI / 2 - 0.08, Math.atan2(o.dx, o.dz), 0])); }
  }
  for (const u of [-o.LM / 2, o.LM / 2]) { const [x, , z] = W(u, 2.2, 0); pz.push(...garita(x, yb + alto, z)); }
  K.poner(new T.Mesh(K.fusion(pz), K.MP(0xffffff, { vertexColors: true })), true, true).userData.monumento = 'muralla';

  // Torre del Reloj
  const t = [], cr = 0xf4e2b0, bl = 0xfffdf3, os = 0x2b2230, C = (w, h, d, c, y, x, z) => pieza(new T.BoxGeometry(w, h, d), c, [x || 0, y, z || 0]);
  t.push(C(20, 10, 9, 0xd9b77a, 5), C(20.4, 0.8, 9.4, bl, 10.2)); // la puerta en la muralla
  for (const [x, w, h] of [[0, 5, 7], [-6.3, 2.6, 4.6], [6.3, 2.6, 4.6]]) for (const z of [-4.55, 4.55]) {
    t.push(C(w, h - w / 2, 0.2, os, (h - w / 2) / 2, x, z), pieza(new T.CylinderGeometry(w / 2, w / 2, 0.2, 14, 1, false, 0, PI), os, [x, h - w / 2, z], [PI / 2, 0, PI / 2]));
    for (const sx of [-1, 1]) t.push(C(0.6, h + 0.6, 0.5, bl, (h + 0.6) / 2, x + sx * (w / 2 + 0.5), z));
  }
  t.push(C(9, 6.5, 7.5, cr, 13.8), C(9.6, 0.6, 8.1, bl, 17.2)); // primer cuerpo
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) t.push(C(0.6, 6.5, 0.6, bl, 13.8, sx * 4.3, sz * 3.55));
  t.push(C(6.6, 5.8, 6.6, cr, 20.4), C(7.1, 0.5, 7.1, bl, 23.4)); // segundo cuerpo: el del reloj
  t.push(C(5, 4.6, 5, cr, 26), C(5.4, 0.45, 5.4, bl, 28.5)); // tercer cuerpo: campanario
  for (const [x, z, w, d] of [[0, 2.52, 1.6, 0.1], [0, -2.52, 1.6, 0.1], [2.52, 0, 0.1, 1.6], [-2.52, 0, 0.1, 1.6]]) t.push(C(w, 2.6, d, os, 26, x, z)); // los vanos del campanario
  t.push(pieza(new T.SphereGeometry(2.3, 12, 6, 0, PI * 2, 0, PI / 2), bl, [0, 28.7, 0]), C(1, 1.4, 1, cr, 31.4), pieza(new T.ConeGeometry(0.55, 1.6, 8), bl, [0, 32.9, 0]), pieza(new T.BoxGeometry(0.08, 1.8, 0.08), 0x2b2230, [0, 34.4, 0]));
  const gt = K.fusion(t), torre = K.poner(new T.Mesh(gt, new T.MeshStandardMaterial({ vertexColors: true, roughness: 0.8, emissive: 0x3a2410, flatShading: true })), true, true);
  const yT = K.altura(o.TX, o.TZ) - 0.2, rT = Math.atan2(o.P0.x - o.TX, o.P0.z - o.TZ) + PI / 2; // los arcos miran a la recta de salida
  torre.position.set(o.TX, yT, o.TZ); torre.rotation.y = rT; torre.scale.setScalar(1.25); torre.userData.monumento = 'Torre del Reloj';
  // las cuatro esferas del reloj (una textura chica)
  const cv = document.createElement('canvas'); cv.width = cv.height = 64; const x = cv.getContext('2d');
  x.fillStyle = '#fffdf3'; x.beginPath(); x.arc(32, 32, 30, 0, 7); x.fill(); x.strokeStyle = '#2b2230'; x.lineWidth = 3; x.stroke();
  for (let k = 0; k < 12; k++) { const a = k * PI / 6; x.fillStyle = '#2b2230'; x.fillRect(32 + Math.cos(a) * 24 - 1.5, 32 + Math.sin(a) * 24 - 1.5, 3, 3); }
  x.lineCap = 'round'; x.lineWidth = 4; x.beginPath(); x.moveTo(32, 32); x.lineTo(32, 14); x.moveTo(32, 32); x.lineTo(44, 36); x.stroke();
  const mR = new T.MeshBasicMaterial({ map: new T.CanvasTexture(cv), transparent: true });
  for (let k = 0; k < 4; k++) { const r = K.malla(new T.CircleGeometry(2.1, 20), mR, 0, 20.6, 0); r.rotation.y = k * PI / 2; r.translateZ(3.35); torre.add(r); }
  K.pista.encuadre = [[o.TX, yT + 44, o.TZ]];

  // Castillo de San Felipe de Barajas, en la loma de San Lázaro al fondo: baterías escalonadas con murallas en talud
  // (inclinadas hacia adentro), baluartes en punta con garitas, rampas en zigzag entre niveles y césped en los taludes bajos.
  const ang = Math.atan2(-o.dz, -o.dx) + 0.35, cx = K.CENTRO.x + Math.cos(ang) * 172, cz = K.CENTRO.z + Math.sin(ang) * 172, cy = K.altura(cx, cz);
  const cs = [], piedra = [0xc9a868, 0xbf9c5c, 0xd4b376], cesped = 0x5f9442;
  // un prisma en talud: polígono de base, altura y cuánto se mete la cara de arriba (la de abajo puede ir con césped)
  const talud = (pol, y0, h, mete, col, colPie) => {
    const n = pol.length, cxp = pol.reduce((a, q) => a + q[0], 0) / n, czp = pol.reduce((a, q) => a + q[1], 0) / n;
    const arriba = pol.map(([x, z]) => { const dx = cxp - x, dz = czp - z, l = Math.hypot(dx, dz) || 1; return [x + dx / l * mete, z + dz / l * mete]; });
    const pos = [], colA = [], c1 = new T.Color(col), c2 = new T.Color(colPie == null ? col : colPie), cc = new T.Color();
    const tri = (a, b, c, ca, cb, ccc) => { pos.push(...a, ...b, ...c); colA.push(ca.r, ca.g, ca.b, cb.r, cb.g, cb.b, ccc.r, ccc.g, ccc.b); };
    for (let i = 0; i < n; i++) {
      const j = (i + 1) % n, a = [pol[i][0], y0, pol[i][1]], b = [pol[j][0], y0, pol[j][1]], A = [arriba[i][0], y0 + h, arriba[i][1]], B = [arriba[j][0], y0 + h, arriba[j][1]];
      cc.copy(c1).multiplyScalar(0.92 + (i % 3) * 0.05);
      tri(a, A, b, c2, cc, c2); tri(b, A, B, c2, cc, cc);
    }
    const sh = new T.Shape(arriba.map(([x, z]) => new T.Vector2(x, -z))), gs = new T.ShapeGeometry(sh).rotateX(-PI / 2).translate(0, y0 + h, 0), pt = gs.attributes.position, ix = gs.index.array;
    cc.copy(c1).multiplyScalar(0.88); // el patio de arriba, un poco más oscuro que el muro
    for (let k = 0; k < ix.length; k += 3) tri(...[ix[k], ix[k + 2], ix[k + 1]].map(v => [pt.getX(v), pt.getY(v), pt.getZ(v)]), cc, cc, cc);
    gs.dispose();
    const g = new T.BufferGeometry(); g.setAttribute('position', new T.Float32BufferAttribute(pos, 3));
    cs.push({ g, c: 0xffffff, colores: colA });
    return arriba;
  };
  // parapeto: un muro bajo por el borde de arriba de cada batería (dibuja la silueta), con troneras
  const parapeto = (pol, y) => pol.forEach((q, i) => {
    const r = pol[(i + 1) % pol.length], l = Math.hypot(r[0] - q[0], r[1] - q[1]), a = Math.atan2(r[0] - q[0], r[1] - q[1]);
    for (let u = 0.8; u < l - 0.8; u += 2.4) { const f = u / l; cs.push(pieza(new T.BoxGeometry(0.6, 1.1, 1.8), 0xe6cd98, [q[0] + (r[0] - q[0]) * f, y + 0.55, q[1] + (r[1] - q[1]) * f], [0, a, 0])); }
  });
  // la loma de San Lázaro
  cs.push(pieza(new T.CylinderGeometry(44, 64, 18, 10), cesped, [2, -8, 0]));
  // baluarte en punta: polígono en talud con su garita en la punta (la punta de arriba, ya metida)
  const baluarte = (x, z, rot, y0, h, largo) => {
    const c = Math.cos(rot), s2 = Math.sin(rot), L = largo || 15;
    const pts = [[-6, -2], [-6.5, L * 0.5], [0, L], [6.5, L * 0.5], [6, -2]].map(([u, v]) => [x + u * c + v * s2, z - u * s2 + v * c]);
    const top = talud(pts, y0, h, h * 0.28, piedra[1]); parapeto(top, y0 + h);
    cs.push(...garita(top[2][0], y0 + h, top[2][1]));
  };
  // batería baja del frente (la de la entrada), ancha y quebrada, con dos baluartes
  const A = talud([[-6, -30], [22, -24], [34, -6], [30, 16], [10, 30], [-8, 22], [-2, 0]], 0, 8, 2.6, piedra[0], cesped); parapeto(A, 8);
  baluarte(33, -14, PI / 2 - 0.45, 0, 8); baluarte(24, 22, PI / 2 + 0.6, 0, 8, 11);
  // batería de la izquierda, más atrás y un poco más alta (no concéntrica: se apoya en otra parte del cerro)
  const B = talud([[-36, -22], [-10, -26], [-4, -6], [-14, 10], [-34, 6]], 2, 12, 3.6, piedra[2]); parapeto(B, 14);
  for (const [x, z] of [[-36, -22], [-34, 6]]) cs.push(...garita(x, 14, z));
  // el cuerpo alto de atrás a la derecha (Apóstoles / San Lázaro), el más alto, con el cuerpo de guardia
  const Cu = talud([[-14, 12], [4, 6], [14, 14], [8, 30], [-12, 28]], 6, 15, 4, piedra[0]); parapeto(Cu, 21);
  baluarte(-12, 28, -0.5, 6, 15, 10);
  cs.push(pieza(new T.BoxGeometry(10, 4.5, 7), 0xdcbf86, [0, 23.2, 20], [0, 0.3, 0]), pieza(new T.BoxGeometry(10.4, 0.5, 7.4), 0xeed7a6, [0, 25.6, 20], [0, 0.3, 0]));
  // rampas en zigzag: suben por el frente de la batería de la izquierda, desde el patio de la de abajo
  for (let k = 0; k < 5; k++) { const sg = k % 2 ? 1 : -1, y = 2 + k * 2.4; cs.push(pieza(new T.BoxGeometry(2.6, 0.5, 13), 0xe2c38a, [-3 + k * 0.15, y + 1.4, -10 + sg * 1.5], [0.18 * sg, 0.25, 0])); }
  // cañones asomados por las troneras
  for (const [x, z, y, r] of [[34, -6, 8.6, 0], [30, 16, 8.6, 0.3], [-36, -22, 14.6, PI], [14, 14, 21.6, 0.2], [22, -24, 8.6, -0.7]]) cs.push(pieza(new T.CylinderGeometry(0.25, 0.32, 2.8, 7), 0x23252b, [x, y, z], [0, r, PI / 2 + 0.05]));
  // colores por vértice de los taludes (fusion pone uno por pieza): se meten después
  const castillo = K.poner(new T.Mesh(fusionColores(T, K, cs), new T.MeshStandardMaterial({ vertexColors: true, side: T.DoubleSide, flatShading: true, roughness: 0.9, emissive: 0x1e160a })), true);
  K.pista.castillo = [cx, cy, cz];
  castillo.position.set(cx, cy, cz); castillo.rotation.y = ang; castillo.scale.setScalar(1.3);
}
// Caño Cristales inundado. Cada charco: un tramo de la pista con el lecho de un color (alga roja, arena amarilla, musgo,
// poza azul, piedra negra), el borde mordido franja por franja, y encima agua transparente con onditas en un shader.
const CHARCOS = [[0.06, 0.17, 'rojo'], [0.21, 0.31, 'amarillo'], [0.35, 0.46, 'verde'], [0.5, 0.6, 'azul'], [0.64, 0.73, 'negro'], [0.78, 0.9, 'rojo']];
const LECHO = {
  rojo: [0xe0105a, 0xf0206a, 0xff3f7a, 0xb80c4a, 0xffc23a], amarillo: [0xffc21a, 0xffb000, 0xffd84a, 0xe89a00, 0x6cc34a],
  verde: [0x18b060, 0x22c070, 0x3fd080, 0x0f8a4a, 0xffc21a], azul: [0x0f9fd0, 0x20b8e0, 0x16c8c8, 0x0a70b0, 0xe0105a], negro: [0x07090c, 0x0e1116, 0x040506, 0x161a20, 0xe0105a]
};
function inundar(K) {
  const T = K.THREE, NS = K.NS, H = K.H, NK = 10, enAgua = new Uint8Array(NS + 1), mitad = new Float32Array(NS + 1), medio = new Float32Array(NS + 1);
  const ruido = (x, y) => Math.sin(x * 0.11 + y * 0.23) + Math.sin(x * 0.05 - y * 0.31) * 0.8 + Math.sin(x * 0.21 - y * 0.4) * 0.45;
  // Cada charco es una lente sobre la vía: su anchura crece y decrece en curva suave a lo largo del tramo y su eje se
  // mece un poco; de orilla a centro la malla lleva la hondura (0 → 1), que el shader usa para el color y la opacidad.
  const pos = [], col = [], prof = [], cc = new T.Color(), c2 = new T.Color(), p = new T.Vector3();
  CHARCOS.forEach(([fa, fb, nombre], c) => {
    const a = Math.floor(fa * NS), b = Math.floor(fb * NS), pal = LECHO[nombre], fila = [];
    for (let i = a; i <= b; i++) {
      const u = (i - a) / (b - a), s = Math.pow(Math.sin(Math.PI * u), 0.55);
      let w = (H + 1.2) * s * (0.86 + 0.14 * Math.sin(i * 0.083 + c * 2.3)), m = 1.1 * Math.sin(i * 0.047 + c * 1.9) * s;
      if (Math.abs(m) + w > H + 1.5) w = H + 1.5 - Math.abs(m);
      mitad[i] = w; medio[i] = m; if (w > 0.6) enAgua[i] = 1;
      const ext = Math.min(1, Math.sin(Math.PI * u) * 2.2), r = [];
      for (let k = 0; k <= NK; k++) {
        const v = 2 * k / NK - 1, l = m + w * v, d = (1 - Math.pow(Math.abs(v), 1.6)) * ext;
        p.copy(K.P[i]).addScaledVector(K.N[i], l);
        const n = ruido(i * 0.78, l);
        // mezcla continua (sin manchas en escalera): del tono hondo al claro, y el acento (alga, arena) donde el ruido sube
        cc.setHex(pal[3]).lerp(c2.setHex(pal[0]), K_suave(-1.4, -0.2, n)).lerp(c2.setHex(pal[2]), K_suave(0.1, 0.9, n) * 0.6).lerp(c2.setHex(pal[4]), K_suave(1.05, 1.5, n));
        r.push([p.x, p.z, cc.r, cc.g, cc.b, d]);
      }
      fila.push(r);
    }
    for (let j = 0; j < fila.length - 1; j++) for (let k = 0; k < NK; k++) {
      [[j, k], [j + 1, k], [j, k + 1], [j, k + 1], [j + 1, k], [j + 1, k + 1]].forEach(([jj, kk]) => { const q = fila[jj][kk]; pos.push(q[0], 0.1, q[1]); col.push(q[2], q[3], q[4]); prof.push(q[5]); });
    }
  });
  const g = new T.BufferGeometry();
  g.setAttribute('position', new T.Float32BufferAttribute(pos, 3)); g.setAttribute('color', new T.Float32BufferAttribute(col, 3)); g.setAttribute('prof', new T.Float32BufferAttribute(prof, 1));
  const agua = new T.ShaderMaterial({
    uniforms: T.UniformsUtils.merge([T.UniformsLib.fog, { t: { value: 0 } }]), vertexColors: true, transparent: true, depthWrite: false, fog: true,
    vertexShader: 'attribute float prof;\nvarying float vD;\nvarying vec3 vP;\nvarying vec3 vC;\n#include <fog_pars_vertex>\nvoid main() {\n  vD = prof; vC = color; vP = position;\n' +
      '  vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);\n  gl_Position = projectionMatrix * mvPosition;\n#include <fog_vertex>\n}',
    fragmentShader: 'uniform float t;\nvarying float vD;\nvarying vec3 vP;\nvarying vec3 vC;\n#include <fog_pars_fragment>\nvoid main() {\n' +
      // hondo: el color del lecho intenso; orilla: agua clara casi sin color
      '  float h = smoothstep(0.0, 0.5, vD);\n' +
      '  vec3 c = mix(mix(vC, vec3(0.86, 0.97, 1.0), 0.35), vC, h);\n' +
      // brillo especular barato que se mueve, más en lo hondo
      '  float w = sin(vP.x * 1.3 + t * 1.9) * sin(vP.z * 1.1 - t * 1.4) + 0.6 * sin((vP.x - vP.z) * 0.7 + t * 1.1);\n' +
      '  float brillo = smoothstep(1.1, 1.55, w) * (0.3 + 0.5 * h);\n' +
      // espuma fina en la orilla, que respira
      '  float espuma = (1.0 - smoothstep(0.015, 0.07, vD)) * step(0.003, vD) * (0.7 + 0.3 * sin(t * 2.6 + vP.x * 1.7 + vP.z));\n' +
      '  c = mix(c, vec3(1.0), max(brillo * 0.8, espuma * 0.85));\n' +
      '  float a = mix(0.22, 0.62, h) + brillo * 0.25 + espuma * 0.45;\n' +
      '  gl_FragColor = vec4(c, clamp(a, 0.0, 0.92) * smoothstep(0.0, 0.02, vD + 0.015));\n#include <fog_fragment>\n}'
  });
  const sup = K.poner(new T.Mesh(g, agua)); sup.renderOrder = 1;
  // salpicaduras (gotas) y onditas que se abren detrás de cada kart que cruza: dos mallas de instancias
  const NG = 90, NO = 48, gotas = [], ondas = [], o = new T.Object3D(), negro = new T.Color(0), c = new T.Color();
  const gM = K.inst(new T.OctahedronGeometry(0.17, 0), new T.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.9, depthWrite: false }), [], false, NG);
  const oM = K.inst(new T.RingGeometry(0.62, 0.74, 24).rotateX(-Math.PI / 2), new T.MeshBasicMaterial({ color: 0xffffff, transparent: true, depthWrite: false, blending: T.AdditiveBlending }), [], false, NO);
  for (let i = 0; i < NG; i++) { gotas.push({ t: 0, p: new T.Vector3(), v: new T.Vector3() }); gM.setColorAt(i, c.setHex(0xd8f6ff)); }
  for (let i = 0; i < NO; i++) { ondas.push({ t: 0, x: 0, z: 0, s: 1 }); oM.setColorAt(i, negro); }
  let gi = 0, oi = 0;
  K.anim((dt, t) => {
    agua.uniforms.t.value = t;
    K.corredores().forEach(r => {
      if (!r.k || r.v < 1.5) return;
      const i = Math.floor((((r.d % K.LARGO) + K.LARGO) % K.LARGO) / K.LARGO * NS);
      if (!enAgua[i] || Math.abs(r.carril - medio[i]) > mitad[i] - 0.3) { r.chapoteo = 0; return; }
      const g = r.k.g.position, sy = Math.sin(r.yaw), cy = Math.cos(r.yaw), f = Math.min(1.6, r.v / 9);
      for (const lado of [-1, 1]) {
        const q = gotas[gi++ % NG]; q.t = 0.45 + Math.random() * 0.25;
        q.p.set(g.x + cy * lado * 0.95 - sy * 0.9, 0.2, g.z - sy * lado * 0.95 - cy * 0.9);
        q.v.set(cy * lado * (1 + Math.random() * 1.5) - sy * 2 * f, 2.2 + Math.random() * 2.2 * f, -sy * lado * (1 + Math.random() * 1.5) - cy * 2 * f);
      }
      r.chapoteo = (r.chapoteo || 0) - dt;
      if (r.chapoteo <= 0) { r.chapoteo = 0.14; for (const lado of [-1, 1]) { const w = ondas[oi++ % NO]; w.t = 0.85; w.x = g.x + cy * lado * 0.9 - sy * 1.1; w.z = g.z - sy * lado * 0.9 - cy * 1.1; w.s = 0.5 + f * 0.2; } }
    });
    gotas.forEach((q, i) => {
      if (q.t > 0) { q.t -= dt; q.v.y -= dt * 14; q.p.addScaledVector(q.v, dt); if (q.p.y < 0.1) q.t = 0; }
      o.position.copy(q.p); o.rotation.set(t * 5 + i, t * 3, 0); o.scale.setScalar(q.t > 0 ? 0.6 + q.t : 0); o.updateMatrix(); gM.setMatrixAt(i, o.matrix);
    });
    ondas.forEach((w, i) => {
      if (w.t > 0) w.t = Math.max(0, w.t - dt);
      const e = 1 - w.t / 0.85; o.position.set(w.x, 0.13, w.z); o.rotation.set(0, 0, 0); o.scale.setScalar(w.t > 0 ? w.s * (1 + e * 2.2) : 0); o.updateMatrix(); oM.setMatrixAt(i, o.matrix);
      oM.setColorAt(i, c.setScalar(w.t > 0 ? 0.42 * (1 - e) * (1 - e) : 0));
    });
    gM.instanceMatrix.needsUpdate = true; oM.instanceMatrix.needsUpdate = true; oM.instanceColor.needsUpdate = true;
  });
}

window.PISTAS_CARRERA = { lista: [

/* ================= 1. Valle del Lago: la pista de siempre ================= */
{
  id: 'valle', nombre: 'Valle del Lago', rasgo: 'Globos sobre el lago',
  tarjeta: ['#8fd6f0', '#7cbf57'], icono: '<circle cx="24" cy="18" r="11" fill="#ff6a4d"/><path d="M13 20c2 6 6 9 11 10 5-1 9-4 11-10" fill="#ffc23a"/><rect x="20" y="33" width="8" height="6" rx="1.5" fill="#9a6a3c"/>',
  centro: [-2, 12], semilla: 20261004, lago: true,
  cp: [[0, -62], [40, -62], [72, -46], [82, -12], [62, 10], [40, 18], [34, 42], [54, 64], [36, 86], [0, 84], [-26, 62], [-52, 62], [-80, 44], [-86, 8], [-66, -30], [-38, -58]],
  cielo: ['#6cc6ec', '#bfe8f2', '#fff1d6'], niebla: [0xf6ecd6, 110, 340], hemi: [0xfff3e0, 0x5f8f4e, 0.62], sol: [0xfff0d8, 0.9],
  suelo: { tonos: [0x7cbf57, 0x72b652, 0x69ad4d], capas: [[60, 0xfbf4e4], [34, 0xc8ae86], [16, 0x86a463], [3.5, 0x68a84f]], bajo: 0xe9cf96 },
  nubes: 0xffffff,
  decorado(K) {
    const T = K.THREE, az = K.azar;
    const tapaLago = K.LAGO ? K.visual(K.LAGO.x, K.LAGO.z, 0.9) : () => false; // árboles fuera de las visuales hacia el lago
    const l = K.lugares({ n: 230, intentos: 900, min: K.H + 6, sep: 4, filtro: p => !tapaLago(p.x, p.z, 4) });
    const red = l.filter(p => p.tipo < 0.55), pin = l.filter(p => p.tipo >= 0.55 && p.tipo < 0.9), roc = l.filter(p => p.tipo >= 0.9);
    const tonos = [0x2f9e5d, 0x46b86a, 0x5cc26e, 0x3aa860, 0x8fcf5a];
    K.inst(new T.CylinderGeometry(0.25, 0.35, 2, 6), K.MP(0x9a6a3c), red.map(p => ({ x: p.x, y: p.y + p.s, z: p.z, s: p.s })).concat(pin.map(p => ({ x: p.x, y: p.y + p.s * 0.8, z: p.z, s: p.s * 0.8 }))));
    K.inst(new T.IcosahedronGeometry(1.7, 0), K.MP(0xffffff), red.map((p, i) => ({ x: p.x, y: p.y + p.s * 3.1, z: p.z, rx: az(), ry: az() * 6, sx: p.s, sy: p.s * 1.1, sz: p.s, c: tonos[i % 5] })));
    K.inst(new T.ConeGeometry(1.5, 3.6, 7), K.MP(0xffffff), [].concat(...pin.map(p => [{ x: p.x, y: p.y + p.s * 3, z: p.z, s: p.s, c: 0x23804a }, { x: p.x, y: p.y + p.s * 4.6, z: p.z, s: p.s * 0.72, c: 0x2f9e5d }])));
    K.inst(new T.DodecahedronGeometry(1, 0), K.MP(0xd8c7a6), roc.map(p => ({ x: p.x, y: p.y + 0.3, z: p.z, rx: az() * 3, ry: az() * 3, sx: p.s * 1.4, sy: p.s, sz: p.s * 1.2 })));
    if (K.LAGO) K.inst(new T.CylinderGeometry(0.9, 0.9, 0.08, 7), K.MP(0x2f9e5d), [0, 1, 2].map(() => { const a = az() * 6.28, r = az() * K.LAGO.r * 0.7; return { x: K.LAGO.x + Math.cos(a) * r, y: -0.28, z: K.LAGO.z + Math.sin(a) * r }; }), false);
    // globos aerostáticos: cada uno, una malla fusionada
    // uno, bajito, delante de la recta de salida: es lo primero que se ve desde la parrilla
    const gx = K.P[0].x + K.T[0].x * 95 - K.N[0].x * K.AFUERA * 12, gz = K.P[0].z + K.T[0].z * 95 - K.N[0].z * K.AFUERA * 12;
    K.monumento('globo', gx, [14, 19], gz);
    const globos = [[0xff6a4d, 0xffc23a, gx, 17, gz], [0x0e9aa0, 0xfffdf7, 60, 40, 70], [0xffc23a, 0x2f9e5d, -70, 30, 90]].map(([a, b, x, y, z]) => {
      const m = K.poner(new T.Mesh(K.fusion([pieza(new T.SphereGeometry(4, 10, 8), a), pieza(new T.CylinderGeometry(4.08, 3.3, 2.2, 10, 1, true), b, [0, -1.6, 0]), pieza(new T.BoxGeometry(1.4, 1.1, 1.4), 0x9a6a3c, [0, -6.4, 0])]),
        K.MP(0xffffff, { vertexColors: true, side: T.DoubleSide })), true);
      m.position.set(x, y, z); m.userData.y = y; return m;
    });
    if (K.LAGO) { K.foco(K.LAGO.x, 14, K.LAGO.z); K.monumento('lago', [0, 1, 2, 3, 4, 5, 6, 7, 8].map(k => k === 8 ? [K.LAGO.x, 0.5, K.LAGO.z] : [K.LAGO.x + Math.cos(k * PI / 4) * K.LAGO.r * 0.7, 0.5, K.LAGO.z + Math.sin(k * PI / 4) * K.LAGO.r * 0.7]), null, null, { plano: true }); }
    
    K.anim((dt, t) => globos.forEach((g, i) => { g.position.y = g.userData.y + Math.sin(t * 0.5 + i * 2) * 1.5; g.rotation.y += dt * 0.1; }));
  }
},

/* ================= 2. Caño Cristales: el río de cinco colores ================= */
{
  id: 'cano', nombre: 'Caño Cristales', rasgo: 'El río de cinco colores',
  tarjeta: ['#4fb7f0', '#e5265f'], icono: '<path d="M6 30c6-6 10 6 18 0s12 6 18 0" fill="none" stroke="#e5265f" stroke-width="5" stroke-linecap="round"/><path d="M6 38c6-6 10 6 18 0s12 6 18 0" fill="none" stroke="#ffc23a" stroke-width="4" stroke-linecap="round"/><path d="M6 22c6-6 10 6 18 0s12 6 18 0" fill="none" stroke="#2fb8c8" stroke-width="4" stroke-linecap="round"/>',
  semilla: 777, largo: 560,
  cp: [[0, -50], [30, -60], [55, -45], [80, -55], [105, -35], [110, 0], [95, 30], [60, 45], [20, 40], [-15, 55], [-50, 50], [-80, 30], [-95, 0], [-85, -30], [-55, -45], [-25, -40]],
  cielo: ['#2f8fe0', '#a9dcf5', '#fff4d8'], niebla: [0xe9f1e0, 120, 350], hemi: [0xfff6e0, 0x7b8f3a, 0.62], sol: [0xfff2d6, 0.95],
  suelo: { tonos: [0x8ea06a, 0x869a63, 0x95a771], capas: [[22, 0xa65a40], [12, 0x8f6a46], [4, 0x7d9260]], bajo: 0xe8d9a8 },
  relieve: { lomas: 0.55, montes: 0.5, meseta: 28 },
  via: { berma: 0xd9c08a },
  nubes: 0xffffff,
  decorado(K) {
    const T = K.THREE, az = K.azar, s = K.AFUERA, i0 = 70, i1 = K.NS - 40;
    // el río va por fuera de la pista; cinco franjas: laja, alga roja, agua, alga roja, laja
    const ruido = (i, k) => Math.sin(i * 0.071 + k) + Math.sin(i * 0.023 + k * 2.3) * 0.8 + Math.sin(i * 0.17 + k * 0.7) * 0.4;
    const banda = (u0, u1) => (s > 0 ? [K.H + u0, K.H + u1] : [-K.H - u1, -K.H - u0]);
    const fr = [[5, 6.4], [6.4, 8.6], [8.6, 11.4], [11.4, 13.6], [13.6, 15]];
    const rango = i => i >= i0 && i <= i1;
    const color = (i, f) => {
      if (!rango(i)) return null;
      const n = ruido(i, f * 1.7);
      if (f === 0 || f === 4) return n > 0.4 ? 0x9c8b70 : 0x7d7466;
      if (f === 2) return n > 1.25 ? 0xd81b60 : n < -1.3 ? 0x1f8fb0 : n > 0.7 ? 0x37c3b8 : 0x2fb3cc;
      return n > 0.85 ? 0xffc23a : n < -0.95 ? 0x2f9e5d : n < -0.4 ? 0x8e3bd0 : Math.floor(i / 7) % 2 ? 0xe5265f : 0xff4f6e;
    };
    fr.forEach(([a, b], f) => K.cinta(...banda(a, b), 0.05, i => color(i, f), { recorte: true }));
    K.cinta(...banda(6.4, 13.6), 0.1, i => (rango(i) ? 0xbff3ff : null), { recorte: true, mat: new T.MeshStandardMaterial({ vertexColors: true, transparent: true, opacity: 0.3, roughness: 0.1, metalness: 0.3, depthWrite: false }) });
    // lajas junto al río y en la sabana
    const lajas = [];
    for (let i = i0; i < i1; i += 5) { if (az() < 0.5) continue; const l = s * (K.H + (az() < 0.5 ? 4.6 : 15.6)); const p = K.P[i], n = K.N[i]; lajas.push({ x: p.x + n.x * l, y: 0, z: p.z + n.z * l, ry: az() * 6, sx: 1.2 + az() * 1.6, sy: 0.35, sz: 1 + az(), c: az() < 0.5 ? 0x9c8b70 : 0x6f675d }); }
    K.inst(new T.DodecahedronGeometry(1, 0), K.MP(0xffffff), lajas);
    // morichales y matas
    const l = K.lugares({ n: 170, intentos: 900, min: K.H + 18, sep: 5 });
    const pal = K.fusion(palma(T, 0x8a7a66, [0x3f9a4a, 0x56b25a, 0x2f8a44], 8, 9, 1.75));
    K.inst(pal, K.MP(0xffffff, { vertexColors: true }), l.filter(p => p.tipo < 0.45).map(p => ({ x: p.x, y: p.y, z: p.z, ry: az() * 6, s: 0.8 + p.s * 0.4 })));
    K.inst(new T.IcosahedronGeometry(1.2, 0), K.MP(0xffffff), l.filter(p => p.tipo >= 0.45).map((p, i) => ({ x: p.x, y: p.y + 0.5, z: p.z, ry: az() * 6, sx: p.s * 1.3, sy: p.s * 0.8, sz: p.s * 1.2, c: [0x6fae3c, 0x8bbd45, 0x4f9a3a][i % 3] })));
    // la pista inundada: charcos de colores sobre el asfalto, agua clara encima y los karts que salpican al cruzar
    inundar(K);
    { const i = Math.floor(K.NS * 0.12); K.foco(K.P[i].x, 2, K.P[i].z); K.monumento('charco', K.P[i].x, [0.3], K.P[i].z); } // el primer charco, sobre la vía
    // guacamayas dando vueltas
    const ave = K.fusion([pieza(new T.BoxGeometry(0.5, 0.5, 1.6), 0xffffff, [0, 0, 0]), pieza(new T.BoxGeometry(3.2, 0.08, 0.8), 0xffffff, [0, 0.1, 0]), pieza(new T.BoxGeometry(0.3, 0.06, 1.4), 0xffffff, [0, 0, -1.3])]);
    const aves = K.inst(ave, K.MP(0xffffff), [0xe5265f, 0xffc23a, 0x2f7fe0, 0xe5265f].map(c => ({ c })), false, 4), o = new T.Object3D();
    K.anim((dt, t) => {
      for (let i = 0; i < 4; i++) {
        const a = t * 0.35 + i * 1.6, r = 30 + i * 9;
        o.position.set(K.CENTRO.x + Math.cos(a) * r, 22 + i * 3 + Math.sin(t * 2 + i) * 1.2, K.CENTRO.z + Math.sin(a) * r);
        o.rotation.set(0, -a, Math.sin(t * 6 + i) * 0.25); o.updateMatrix(); aves.setMatrixAt(i, o.matrix);
      }
      aves.instanceMatrix.needsUpdate = true;
    });
  }
},

/* ================= 3. Desierto de la Tatacoa: el cañón rojo ================= */
{
  id: 'tatacoa', nombre: 'Desierto de la Tatacoa', rasgo: 'Un cañón rojo y el observatorio',
  tarjeta: ['#ffb46a', '#c4552f'], icono: '<rect x="21" y="12" width="6" height="28" rx="3" fill="#2f7a3a"/><path d="M21 28h-6a3 3 0 0 1-3-3v-7a3 3 0 0 1 6 0v4h3M27 24h5v-6a3 3 0 0 1 6 0v6a4 4 0 0 1-4 4h-7" fill="#2f7a3a"/>',
  semilla: 4242, largo: 560,
  cp: [[0, -70], [50, -70], [85, -55], [90, -30], [60, -15], [10, -5], [-20, 5], [-10, 25], [30, 35], [70, 50], [75, 80], [40, 95], [-30, 90], [-75, 70], [-90, 30], [-70, -5], [-60, -40], [-35, -65]],
  cielo: ['#3f8fd0', '#ffd7a0', '#ffb46a'], niebla: [0xf3c08a, 100, 320], hemi: [0xffe8cc, 0xb4532c, 0.6], sol: [0xffe2b8, 1.0],
  suelo: { tonos: [0xd9733f, 0xcc6634, 0xe2864c], capas: [[30, 0xf0c08a], [14, 0xc0532c], [4, 0xd36a3a]], bajo: 0xe6a86a },
  relieve: { lomas: 1.25, montes: 0.5 },
  via: { asfalto: [0x6b5a52, 0x67574f], berma: 0xe6b27a },
  tribuna: { gradas: [0xfff4dc, 0xf2d2a8], techo: [0xc4552f, 0xfffdf7] },
  banderines: { colores: [0xc4552f, 0xffc23a, 0x0e9aa0, 0xfffdf7] },
  nubes: 0xfff1e0,
  decorado(K) {
    const T = K.THREE, az = K.azar;
    const bandas = [0xb8452a, 0xe08a4a, 0xc4552f, 0xf2c28a, 0xa63a24];
    // cárcavas: torres de tierra a franjas
    const carc = K.fusion([2.4, 1.9, 1.35, 0.75].map((r, k) => pieza(new T.CylinderGeometry(r * 0.85, r, 2.6, 6), bandas[k], [0, 1.3 + k * 2.6, 0])));
    const l = K.lugares({ n: 190, intentos: 1100, min: K.H + 9, sep: 4.5 });
    K.inst(carc, K.MP(0xffffff, { vertexColors: true }), l.filter(p => p.tipo < 0.4).map(p => ({ x: p.x, y: p.y - 0.5, z: p.z, ry: az() * 6, sx: 0.8 + p.s, sy: 0.7 + p.s * 0.9, sz: 0.8 + p.s })));
    // cardones (cactus de brazos) y matas secas
    const verde = 0x4f8a3c;
    const cardon = K.fusion([pieza(new T.CylinderGeometry(0.34, 0.4, 4.4, 7), verde, [0, 2.2, 0]), pieza(new T.CylinderGeometry(0.22, 0.22, 1.3, 6), verde, [0.7, 1.9, 0], [0, 0, PI / 2]),
      pieza(new T.CylinderGeometry(0.22, 0.24, 1.7, 6), verde, [1.25, 2.7, 0]), pieza(new T.CylinderGeometry(0.2, 0.2, 1, 6), verde, [-0.55, 2.6, 0], [0, 0, PI / 2]), pieza(new T.CylinderGeometry(0.2, 0.22, 1.3, 6), verde, [-0.95, 3.2, 0])]);
    const cerca = K.lugares({ n: 110, intentos: 700, min: K.H + 5, max: K.H + 40, sep: 5 });
    K.inst(cardon, K.MP(0xffffff, { vertexColors: true }), cerca.filter(p => p.tipo < 0.6).map(p => ({ x: p.x, y: p.y, z: p.z, ry: az() * 6, s: 0.7 + p.s * 0.5 })));
    K.inst(new T.IcosahedronGeometry(0.9, 0), K.MP(0xffffff), cerca.filter(p => p.tipo >= 0.6).concat(l.filter(p => p.tipo >= 0.4)).map((p, i) => ({ x: p.x, y: p.y + 0.3, z: p.z, ry: az() * 6, sx: p.s, sy: p.s * 0.6, sz: p.s, c: [0x9a8f5a, 0x7c8a4a, 0xb59a6a][i % 3] })));
    // las cárcavas grandes, frente a la recta de salida (lo primero que se ve desde la parrilla)
    { const gx = K.P[0].x + K.T[0].x * 110 + K.N[0].x * K.AFUERA * 24, gz = K.P[0].z + K.T[0].z * 110 + K.N[0].z * K.AFUERA * 24;
      if (K.distPista(gx, gz) > K.H + 14) {
        K.inst(carc, K.MP(0xffffff, { vertexColors: true }), [[0, 0, 3.2], [7, 3, 2.4], [-6, 4, 2.6], [2, -6, 2]].map(([u, v, k]) => ({ x: gx + u, y: K.altura(gx + u, gz + v) - 0.5, z: gz + v, ry: az() * 6, sx: k, sy: k * 1.3, sz: k }))).userData.monumento = 'cárcavas';
        K.monumento('cárcavas', [[0, 0], [7, 3], [-6, 4], [2, -6]].map(([u, v]) => [gx + u, K.altura(gx + u, gz + v) + 9, gz + v]));
      } }
    // el cañón: paredes a franjas a los dos lados de un tramo
    const a = Math.floor(K.NS * 0.36), b = Math.floor(K.NS * 0.56), pared = K.fusion([[7.6, 4.6, 0], [6.6, 3.4, 4.6], [5.2, 2.6, 8]].map(([w, h, y], k) => pieza(new T.BoxGeometry(w, h, 4.2 - k * 0.6), bandas[(k * 2) % 5], [0, y + h / 2, 0])));
    const muros = [];
    for (let i = a; i < b; i += 9) for (const lado of [-1, 1]) {
      const l2 = lado * (K.H + 7.2), p = K.P[i], n = K.N[i], x = p.x + n.x * l2, z = p.z + n.z * l2;
      if (K.distPista(x, z) < K.H + 6.2) continue;
      muros.push({ x, y: -0.4, z, ry: Math.atan2(K.T[i].x, K.T[i].z), sx: 1, sy: 1 + az() * 0.9, sz: 1 });
    }
    K.inst(pared, K.MP(0xffffff, { vertexColors: true }), muros);
    { const i = Math.floor((a + b) / 2); K.foco(K.P[i].x, 6, K.P[i].z); K.monumento('cañón', K.P[i].x + K.N[i].x * (K.H + 7), [2, 8], K.P[i].z + K.N[i].z * (K.H + 7)); }
    // el observatorio en una meseta, en el hueco de adentro
    const h = K.HUECO;
    if (h && h.d > K.H + 14) {
      const r = Math.min(13, h.d - K.H - 8), y = K.altura(h.x, h.z);
      const obs = K.fusion([pieza(new T.CylinderGeometry(r * 0.8, r, 4, 9), 0xc4552f, [0, 2, 0]), pieza(new T.CylinderGeometry(r * 0.82, r * 0.8, 0.6, 9), 0xf2c28a, [0, 4.3, 0]),
        pieza(new T.CylinderGeometry(3.2, 3.2, 3.6, 12), 0xfffdf7, [0, 6.4, 0]), pieza(new T.SphereGeometry(3.4, 12, 6, 0, PI * 2, 0, PI / 2), 0xf4f6fa, [0, 8.2, 0]),
        pieza(new T.BoxGeometry(1.1, 3.6, 3.6), 0x2a3242, [0, 9.4, 1.8], [-0.5, 0, 0])]);
      K.inst(obs, K.MP(0xffffff, { vertexColors: true }), [{ x: h.x, y: y - 0.3, z: h.z, ry: az() * 6 }]).userData.monumento = 'observatorio';
      K.monumento('observatorio', h.x, [y + 2, y + 8], h.z);
    }
  }
},

/* ================= 4. Volcán Nevado: nieve y lava ================= */
{
  id: 'nevado', nombre: 'Volcán Nevado', rasgo: 'Nieve, frailejones y lava',
  tarjeta: ['#8fb4e8', '#f4f8fd'], icono: '<path d="M4 40L19 14h10l15 26z" fill="#4f4a57"/><path d="M15 21l4-7h10l4 7-4 3-3-2-3 3-3-3z" fill="#fff"/><path d="M22 14c0-5 4-6 4-10" stroke="#ff7a1a" stroke-width="3" fill="none" stroke-linecap="round"/>',
  semilla: 9090, largo: 570, vuelo: { alto: 24, lado: 16 },
  cp: [[0, -75], [45, -70], [80, -40], [85, 5], [78, 50], [50, 82], [18, 62], [-6, 40], [-30, 58], [-62, 74], [-92, 40], [-95, 0], [-80, -35], [-45, -65]], // la entrada a la «mordida» va derecho hacia el volcán
  cielo: ['#5b7fc7', '#cdd8f2', '#f6f3ff'], niebla: [0xe6ecf7, 100, 320], hemi: [0xeef3ff, 0x8a9ab8, 0.72], sol: [0xfff4e6, 0.82],
  suelo: { tonos: [0xf4f8fd, 0xe8f0f9, 0xdfe9f5], capas: [[34, 0x5d5866], [14, 0xe8eef7]], bajo: 0xdfe9f5 },
  relieve: { lomas: 0.9, montes: 0.55 },
  via: { asfalto: [0x4d5563, 0x4a5260], berma: 0xf1f5fb, bordillo: [0x3d7bd9, 0xfffdf7] },
  tribuna: { gradas: [0xeef3fa, 0xd5e1f2], techo: [0x3d7bd9, 0xfffdf7] },
  banderines: { colores: [0x3d7bd9, 0xff6a4d, 0xffc23a, 0xfffdf7] },
  nubes: 0xf4f6ff,
  preparar(K) {
    const h = K.HUECO; if (!h) return;
    const R = Math.min(62, h.d - K.H - 3);
    this.vol = R > 18 ? { x: h.x, z: h.z, R, alto: R * 1.05, rc: R * 0.16 } : null;
    this.encuadre = this.vol ? [[h.x, this.vol.alto + 6, h.z]] : []; // el plano completo incluye el volcán entero
  },
  alturaExtra(x, z, y) {
    const v = this.vol; if (!v) return y;
    const r = Math.hypot(x - v.x, z - v.z); if (r >= v.R) return y;
    const f = 1 - r / v.R, top = v.alto * Math.pow(1 - v.rc / v.R, 1.3);
    return y + (r < v.rc ? top - (1 - r / v.rc) * 6 : v.alto * Math.pow(f, 1.3));
  },
  colorSuelo(x, z, y, c, az) {
    const v = this.vol; if (!v) return c;
    const r = Math.hypot(x - v.x, z - v.z); if (r >= v.R * 0.96) return c;
    if (r < v.rc * 0.9) return 0xff5a1f;
    const cima = v.alto * (0.6 + Math.sin(Math.atan2(z - v.z, x - v.x) * 5) * 0.08);
    if (y > cima) return az < 0.5 ? 0xf7fbff : 0xeef4fb;
    if (y > v.alto * 0.1) return az < 0.12 ? 0xe8eef7 : az < 0.6 ? 0x4a4650 : 0x57525e;
    return c;
  },
  decorado(K) {
    const T = K.THREE, az = K.azar, v = this.vol;
    // pinos con nieve y frailejones
    const pino = K.fusion([pieza(new T.CylinderGeometry(0.25, 0.35, 1.6, 6), 0x7a5a3c, [0, 0.8, 0]), pieza(new T.ConeGeometry(1.7, 3.2, 7), 0x2f6d4f, [0, 2.8, 0]),
      pieza(new T.ConeGeometry(1.25, 2.6, 7), 0x3a7d5a, [0, 4.3, 0]), pieza(new T.ConeGeometry(0.62, 1.2, 7), 0xf7fbff, [0, 5.35, 0])]);
    const frai = K.fusion([pieza(new T.CylinderGeometry(0.26, 0.34, 1.7, 6), 0x7b6f5c, [0, 0.85, 0]), pieza(new T.IcosahedronGeometry(0.55, 0), 0xa3b37c, [0, 1.95, 0])]
      .concat([0, 1, 2, 3, 4, 5, 6].map(k => hoja(T, k * 0.9, 0.75, 1.3, 0.28, 0xc4cf9e, 1.8))).concat([pieza(new T.SphereGeometry(0.16, 5, 4), 0xffd84a, [0.3, 2.45, 0]), pieza(new T.SphereGeometry(0.16, 5, 4), 0xffd84a, [-0.25, 2.5, 0.2])]));
    const fuera = p => !v || Math.hypot(p.x - v.x, p.z - v.z) > v.R + 2;
    const l = K.lugares({ n: 220, intentos: 1000, min: K.H + 6, sep: 4, filtro: fuera });
    K.inst(pino, K.MP(0xffffff, { vertexColors: true }), l.filter(p => p.tipo < 0.55 && p.dd > K.H + 12).map(p => ({ x: p.x, y: p.y, z: p.z, ry: az() * 6, s: 0.8 + p.s * 0.45 })));
    K.inst(frai, K.MP(0xffffff, { vertexColors: true }), l.filter(p => p.tipo >= 0.55 && p.tipo < 0.92).map(p => ({ x: p.x, y: p.y, z: p.z, ry: az() * 6, s: 0.8 + p.s * 0.4 })));
    K.inst(new T.DodecahedronGeometry(1, 0), K.MP(0xffffff), l.filter(p => p.tipo >= 0.92).map(p => ({ x: p.x, y: p.y + 0.2, z: p.z, rx: az() * 3, ry: az() * 3, sx: p.s * 1.4, sy: p.s, sz: p.s * 1.2, c: 0x4f4a57 })));
    // nieve que cae alrededor de la cámara
    const NN = 500, pos = new Float32Array(NN * 3), base = [];
    for (let i = 0; i < NN; i++) base.push([az() * 120, az() * 46, az() * 120, 2 + az() * 2.5]);
    const nieve = K.puntos(pos, null, { color: 0xffffff, tam: 0.42, opac: 0.9 });
    const W = (u, c) => c + ((((u - c) % 120) + 180) % 120) - 60;
    K.anim((dt, t) => {
      const cx = K.cam.position.x, cz = K.cam.position.z;
      for (let i = 0; i < NN; i++) { const b = base[i]; pos[i * 3] = W(b[0] + Math.sin(t * 0.6 + i) * 1.5, cx); pos[i * 3 + 1] = 46 - ((t * b[3] + b[1]) % 46); pos[i * 3 + 2] = W(b[2], cz); }
      nieve.geometry.attributes.position.needsUpdate = true;
    });
    if (!v) return;
    // el volcán: lava en el cráter, ríos de lava y humo
    const top = v.alto * Math.pow(1 - v.rc / v.R, 1.3);
    K.foco(v.x, top * 0.75, v.z); { const anillo = f => [0, 1, 2, 3, 4, 5, 6, 7].map(k => { const x = v.x + Math.cos(k * PI / 4) * v.R * f, z = v.z + Math.sin(k * PI / 4) * v.R * f; return [x, K.altura(x, z) + 4, z]; });
      K.monumento('volcán', [[v.x, top, v.z]].concat(anillo(0.55), anillo(0.75))); }
    const lavaM = new T.MeshBasicMaterial({ color: 0xff6a1a });
    K.poner(K.malla(new T.CircleGeometry(v.rc * 0.95, 16).rotateX(-PI / 2), lavaM, v.x, top - 4.6, v.z));
    const pos2 = [], col = [], c0 = new T.Color(0xffd04a), c1 = new T.Color(0xff3d14), c = new T.Color();
    for (let k = 0; k < 4; k++) {
      const a0 = k * PI / 2 + 0.5 + az() * 0.6; let prev = null;
      for (let r = v.rc * 0.9; r < v.R * (0.6 + k * 0.09); r += 1.5) {
        const a = a0 + Math.sin(r * 0.11 + k) * 0.09, x = v.x + Math.cos(a) * r, z = v.z + Math.sin(a) * r, w = 0.45 + (r / v.R) * 0.9;
        const px = -Math.sin(a) * w, pz = Math.cos(a) * w, y = K.altura(x, z) + 0.3;
        const cur = [x - px, y, z - pz, x + px, y, z + pz]; c.copy(c0).lerp(c1, r / v.R);
        if (prev) { pos2.push(...prev.slice(0, 3), ...cur.slice(0, 3), ...prev.slice(3), ...prev.slice(3), ...cur.slice(0, 3), ...cur.slice(3)); for (let q = 0; q < 6; q++) col.push(c.r, c.g, c.b); }
        prev = cur;
      }
    }
    const gl = new T.BufferGeometry(); gl.setAttribute('position', new T.Float32BufferAttribute(pos2, 3)); gl.setAttribute('color', new T.Float32BufferAttribute(col, 3));
    K.poner(new T.Mesh(gl, new T.MeshBasicMaterial({ vertexColors: true, side: T.DoubleSide })));
    const humo = K.inst(new T.IcosahedronGeometry(1, 0), new T.MeshLambertMaterial({ color: 0x8a8790, transparent: true, opacity: 0.72, depthWrite: false }), new Array(10).fill(0).map(() => ({})), false, 10);
    const o = new T.Object3D();
    K.anim((dt, t) => {
      lavaM.color.setRGB(1, 0.4 + Math.sin(t * 2.2) * 0.1, 0.1);
      for (let i = 0; i < 10; i++) {
        const p = (t * 0.07 + i / 10) % 1;
        o.position.set(v.x + Math.sin(i * 2.1) * p * 5 + p * 16, top + p * 42, v.z + Math.cos(i * 1.7) * p * 5); o.scale.setScalar(2.4 + p * 8); o.rotation.set(i, t * 0.1 + i, 0);
        o.updateMatrix(); humo.setMatrixAt(i, o.matrix);
      }
      humo.instanceMatrix.needsUpdate = true;
    });
  }
},

/* ================= 5. Caribe al atardecer: mar, palmeras y faro ================= */
{
  id: 'caribe', nombre: 'Cartagena al atardecer', rasgo: 'Las murallas, la Torre del Reloj y el mar',
  tarjeta: ['#ff9d6b', '#1fb5c4'], icono: '<path d="M20 40l2-26h4l2 26z" fill="#fffdf7"/><path d="M21 22h6v5h-6zm-1 10h8v4h-8z" fill="#ff6a4d"/><rect x="19" y="9" width="10" height="6" rx="2" fill="#ffc23a"/><path d="M29 12l14-5v10z" fill="#ffe7a0" opacity=".8"/>',
  semilla: 5150, largo: 560, mar: [-1, 0],
  cp: [[15, -80], [-30, -90], [-65, -85], [-80, -70], [-80, -30], [-80, 10], [-80, 50], [-70, 80], [-40, 90], [-10, 75], [0, 50], [25, 40], [60, 55], [85, 30], [80, -10], [55, -25], [45, -55]],
  cielo: ['#4d5fc4', '#ff9d6b', '#ffc9a0'], niebla: [0xffc9a0, 120, 380], hemi: [0xffe0c0, 0x7a8f5a, 0.62], sol: [0xffc08a, 1.0],
  suelo: { tonos: [0x74b052, 0x6ba84c, 0x7fb95a], capas: [[34, 0xc8ae86], [14, 0x5f9c48]], bajo: 0xf3dca0 },
  via: { berma: 0xf3dca0, bordillo: [0x0e9aa0, 0xfffdf7] },
  tribuna: { gradas: [0xfff4dc, 0xbdeef0], techo: [0x0e9aa0, 0xfffdf7] },
  banderines: { colores: [0x0e9aa0, 0xff6a4d, 0xffc23a, 0xff8fb1] },
  nubes: 0xffd9c4,
  preparar(K) {
    const [dx, dz] = this.mar; let m = -1e9;
    K.P.forEach(p => { m = Math.max(m, p.x * dx + p.z * dz); });
    this.d0 = m + K.H + 14; // playa ancha: entre la pista y el mar va la muralla
  },
  costa(x, z) { return x * this.mar[0] + z * this.mar[1] - this.d0; },
  alturaExtra(x, z, y) {
    const s = this.costa(x, z); if (s < -32) return y;
    y *= 1 - K_suave(-32, -10, s);
    return y + (-2.8 - y) * K_suave(-5, 9, s);
  },
  colorSuelo(x, z, y, c, az) { const s = this.costa(x, z); return s > -3 ? 0xdcc38c : s > -15 ? (az < 0.5 ? 0xf3dca0 : 0xeed59a) : c; },
  decorado(K) {
    const T = K.THREE, az = K.azar, [dx, dz] = this.mar, d0 = this.d0;
    const cx = K.CENTRO.x + dx * (d0 - (K.CENTRO.x * dx + K.CENTRO.z * dz)), cz = K.CENTRO.z + dz * (d0 - (K.CENTRO.x * dx + K.CENTRO.z * dz));
    const giro = Math.atan2(-dz, dx);
    // el mar: un plano con degradado de turquesa a azul hondo, y la espuma que va y viene
    const gm = new T.PlaneGeometry(1300, 1500, 26, 1).rotateX(-PI / 2).translate(644, 0, 0), pm = gm.attributes.position, col = [], c = new T.Color(), a = new T.Color(0x3fd6c6), b = new T.Color(0x1e5fa8);
    for (let i = 0; i < pm.count; i++) { c.copy(a).lerp(b, Math.min(1, Math.max(0, pm.getX(i)) / 260)); col.push(c.r, c.g, c.b); }
    gm.setAttribute('color', new T.Float32BufferAttribute(col, 3));
    const mar = K.poner(new T.Mesh(gm, new T.MeshStandardMaterial({ vertexColors: true, roughness: 0.35, metalness: 0.1 })));
    mar.position.set(cx, -0.5, cz); mar.rotation.y = giro;
    const espM = new T.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.6, depthWrite: false });
    const esp = K.poner(new T.Mesh(new T.PlaneGeometry(1.6, 760).rotateX(-PI / 2), espM)); esp.rotation.y = giro;
    K.anim((dt, t) => { const w = Math.sin(t * 0.9); esp.position.set(cx + dx * (1.5 + w * 1.2), -0.42, cz + dz * (1.5 + w * 1.2)); espM.opacity = 0.45 + w * 0.2; });
    // el sol que se pone sobre el mar
    const solM = new T.MeshBasicMaterial({ color: 0xffe7a0, fog: false }), sol = K.poner(new T.Mesh(new T.CircleGeometry(30, 28), solM));
    sol.position.set(cx + dx * 430, 24, cz + dz * 430); sol.lookAt(cx, 24, cz);
    // palmeras, casas de colores y sombrillas
    const pal = K.fusion(palma(T, 0x9a7a52, [0x2f9e5d, 0x46b86a, 0x3aa860], 7.5, 8, 1.95).concat([0, 1, 2].map(k => pieza(new T.SphereGeometry(0.3, 6, 4), 0x6b4a2b, [Math.cos(k * 2.1) * 0.4, 7, Math.sin(k * 2.1) * 0.4]))));
    // la muralla: un tramo a lo largo de la playa, frente a la parte de la pista más cercana al mar
    let im = 0; K.P.forEach((p, i) => { if (p.x * dx + p.z * dz > K.P[im].x * dx + K.P[im].z * dz) im = i; });
    const cdx = -dz, cdz = dx, sM = -3.8, LM = 150; // a lo largo de la costa; la muralla va de sM-2 a sM+2
    const m0x = K.P[im].x + dx * (d0 - (K.P[im].x * dx + K.P[im].z * dz) + sM), m0z = K.P[im].z + dz * (d0 - (K.P[im].x * dx + K.P[im].z * dz) + sM);
    const aLo = (x, z) => (x - m0x) * cdx + (z - m0z) * cdz; // posición a lo largo de la muralla
    const enMuralla = (x, z) => Math.abs(aLo(x, z)) < LM / 2 + 6 && this.costa(x, z) > sM - 6;
    const sT = mejorSitio(K, 18, K.H + 18) || K.HUECO || K.CENTRO, TX = sT.x, TZ = sT.z;
    const tapaTorre = K.visual(TX, TZ, 0.75);
    const l = K.lugares({ n: 200, intentos: 1200, min: K.H + 6, sep: 5, filtro: p => this.costa(p.x, p.z) < -1.5 && !enMuralla(p.x, p.z) && Math.hypot(p.x - TX, p.z - TZ) > 17 && !tapaTorre(p.x, p.z, 5) });
    const playa = l.filter(p => this.costa(p.x, p.z) > -24), tierra = l.filter(p => this.costa(p.x, p.z) <= -24);
    K.inst(pal, K.MP(0xffffff, { vertexColors: true }), playa.filter(p => p.tipo < 0.7).concat(tierra.filter(p => p.tipo < 0.35)).map(p => ({ x: p.x, y: p.y, z: p.z, rx: (az() - 0.5) * 0.25, ry: az() * 6, rz: (az() - 0.5) * 0.25, s: 0.85 + p.s * 0.3 })));
    const somb = K.fusion([pieza(new T.CylinderGeometry(0.06, 0.06, 2.6, 5), 0xfffdf7, [0, 1.3, 0]), pieza(new T.ConeGeometry(1.6, 0.7, 8), 0xffffff, [0, 2.6, 0])]);
    K.inst(somb, K.MP(0xffffff, { vertexColors: true }), playa.filter(p => p.tipo >= 0.7).map((p, i) => ({ x: p.x, y: p.y, z: p.z, rz: 0.15, ry: az() * 6, c: [0xff6a4d, 0xffc23a, 0x0e9aa0, 0xff8fb1][i % 4] })));
    const casas = tierra.filter(p => p.tipo >= 0.35 && p.dd < K.H + 40 && p.dd > K.H + 9);
    const colores = [0xffd25a, 0xffa184, 0x6fe0d6, 0xffb3cb, 0x9cc4ff, 0xfff6d8];
    casas.forEach(p => { p.ry = az() * 6; });
    K.inst(new T.BoxGeometry(1, 1, 1).translate(0, 0.5, 0), K.MP(0xffffff), casas.map((p, i) => ({ x: p.x, y: p.y - 0.2, z: p.z, ry: p.ry, sx: 3 + p.s * 1.4, sy: 2.6 + p.s * 1.4, sz: 3 + p.s, c: colores[i % colores.length] })));
    K.inst(new T.ConeGeometry(0.75, 0.5, 4).translate(0, 0.25, 0), K.MP(0xc4552f), casas.map(p => ({ x: p.x, y: p.y - 0.2 + 2.6 + p.s * 1.4, z: p.z, ry: p.ry + PI / 4, sx: 4.6 + p.s * 1.9, sy: 3, sz: 4.6 + p.s * 1.9 })));
    // balcones de madera con buganvilias en la mitad de las casas
    const balcon = K.fusion([pieza(new T.BoxGeometry(2.4, 0.18, 0.8), 0x6b3f22, [0, 0, 0.4]), pieza(new T.BoxGeometry(2.4, 0.7, 0.08), 0x7a4a28, [0, 0.4, 0.8]), pieza(new T.BoxGeometry(2.5, 0.12, 0.9), 0x5a3420, [0, 1.3, 0.42]),
      pieza(new T.IcosahedronGeometry(0.55, 0), 0xe0207a, [-1.2, 0.9, 0.7], null, [1.2, 0.8, 0.7]), pieza(new T.IcosahedronGeometry(0.45, 0), 0xff4fa3, [-0.6, 1.4, 0.75], null, [1.3, 0.6, 0.6]), pieza(new T.IcosahedronGeometry(0.4, 0), 0x2f8a44, [-1.5, 0.3, 0.6])]);
    K.inst(balcon, K.MP(0xffffff, { vertexColors: true }), casas.filter((p, i) => i % 2 === 0).map(p => {
      const sz = 3 + p.s, cs = Math.cos(p.ry), sn = Math.sin(p.ry);
      return { x: p.x + sn * sz / 2, y: p.y - 0.2 + 1.6 + p.s * 0.5, z: p.z + cs * sz / 2, ry: p.ry };
    }), false);
    // veleros que se mecen
    const vel = K.fusion([pieza(new T.BoxGeometry(1.6, 0.8, 4.4), 0xfffdf7, [0, 0.3, 0]), pieza(new T.BoxGeometry(1.7, 0.25, 4.5), 0x3d7bd9, [0, 0, 0]),
      pieza(new T.CylinderGeometry(0.07, 0.07, 6, 4), 0x6b4a2b, [0, 3.4, 0]), pieza(new T.ConeGeometry(1.9, 5.2, 3), 0xfffdf7, [0, 3.6, -0.7], [0, PI / 2, 0], [0.1, 1, 1])]);
    const barcos = [0, 1, 2, 3, 4].map(() => ({ s: 20 + az() * 160, u: (az() - 0.5) * 300, f: az() * 6 }));
    const velM = K.inst(vel, K.MP(0xffffff, { vertexColors: true }), barcos.map(() => ({})), false, barcos.length), o = new T.Object3D();
    K.anim((dt, t) => {
      barcos.forEach((q, i) => {
        o.position.set(cx + dx * q.s - dz * (q.u + t * 0.6), -0.4 + Math.sin(t * 1.4 + q.f) * 0.15, cz + dz * q.s + dx * (q.u + t * 0.6));
        o.rotation.set(Math.sin(t * 1.1 + q.f) * 0.06, giro + PI / 2, Math.sin(t * 1.3 + q.f) * 0.08); o.updateMatrix(); velM.setMatrixAt(i, o.matrix);
      });
      velM.instanceMatrix.needsUpdate = true;
    });
    // el faro, en la orilla más cercana a la pista, con su haz que gira
    const fx = m0x + cdx * (LM / 2 + 16) + dx * 2, fz = m0z + cdz * (LM / 2 + 16) + dz * 2, fy = K.altura(fx, fz); // al final de la muralla
    const faro = K.fusion([0, 1, 2, 3, 4, 5].map(k => pieza(new T.CylinderGeometry(1.7 - (k + 1) * 0.16, 1.7 - k * 0.16, 2.4, 10), k % 2 ? 0xff6a4d : 0xfffdf7, [0, 1.2 + k * 2.4, 0]))
      .concat([pieza(new T.CylinderGeometry(1.4, 1.4, 0.35, 10), 0x15304d, [0, 14.6, 0]), pieza(new T.CylinderGeometry(0.75, 0.75, 1.6, 8), 0xffe7a0, [0, 15.6, 0]), pieza(new T.ConeGeometry(1.0, 1.2, 8), 0xff6a4d, [0, 17, 0]),
        pieza(new T.DodecahedronGeometry(2.6, 0), 0x6f675d, [1.5, 0, 1], null, [1, 0.5, 1]), pieza(new T.DodecahedronGeometry(2, 0), 0x7d7466, [-1.8, 0, -0.8], null, [1, 0.45, 1])]));
    K.inst(faro, K.MP(0xffffff, { vertexColors: true }), [{ x: fx, y: fy, z: fz }]);
    const haz = new T.Group(), hm = new T.MeshBasicMaterial({ color: 0xffeeb0, transparent: true, opacity: 0.1, depthWrite: false, side: T.DoubleSide, blending: T.AdditiveBlending });
    for (const sg of [1, -1]) { const m = K.malla(new T.ConeGeometry(1.8, 38, 10, 1, true).translate(0, -19, 0).rotateZ(sg * PI / 2), hm, 0, 0, 0); haz.add(m); }
    haz.position.set(fx, fy + 15.6, fz); K.poner(haz);
    murallaYTorre(K, { m0x, m0z, cdx, cdz, dx, dz, LM, TX, TZ, P0: K.P[0] });
    K.foco(TX, 14, TZ); K.monumento('Torre del Reloj', TX, [18, 4, 36], TZ); K.monumento('muralla', m0x, [4, 1], m0z);
    // «Ver pista»: a lo largo de la muralla por fuera, sobre la playa, y luego a la Torre del Reloj
    const en = (u, sOff, y) => [m0x + cdx * u + dx * sOff, y, m0z + cdz * u + dz * sOff];
    const aT = Math.atan2(K.P[0].x - TX, K.P[0].z - TZ);
    K.pista.ruta = [
      { p: en(-LM / 2 - 40, 26, 14), m: en(-LM / 2 + 10, 0, 4) },
      { p: en(-LM / 4, 22, 11), m: en(0, 0, 5) },
      { p: en(LM / 4, 20, 10), m: en(LM / 2, 0, 5) },
      { p: en(LM / 2 + 20, 4, 24), m: [TX, 10, TZ] },
      { p: [TX + Math.sin(aT) * 34, 16, TZ + Math.cos(aT) * 34], m: [TX, 12, TZ] },
      { p: [TX + Math.sin(aT + 1.8) * 30, 22, TZ + Math.cos(aT + 1.8) * 30], m: [TX, 14, TZ] },
      { p: [TX + Math.sin(aT + 3.2) * 70, 45, TZ + Math.cos(aT + 3.2) * 70], m: [TX, 8, TZ] }
    ];
    K.anim((dt, t) => { haz.rotation.y = t * 0.9; });
  }
},

/* ================= 6. Medellín de noche: neón y metrocable ================= */
{
  id: 'ciudad', nombre: 'Medellín de noche', rasgo: 'El Coltejer, el metro elevado y el metrocable',
  tarjeta: ['#2b1a5c', '#ff4f9a'], icono: '<rect x="6" y="20" width="9" height="20" fill="#5b4fb0"/><rect x="17" y="12" width="10" height="28" fill="#7a6fe0"/><rect x="29" y="24" width="12" height="16" fill="#5b4fb0"/><path d="M4 10l40 8" stroke="#ff4fd8" stroke-width="2"/><rect x="31" y="14" width="6" height="5" rx="1" fill="#ffd23a"/>',
  semilla: 6060, largo: 560, noche: true, mirarSalida: 55,
  cp: [[-80, -46], [-66, -60], [56, -60], [70, -46], [70, -14], [56, 0], [34, 0], [20, 14], [20, 46], [6, 60], [-16, 60], [-30, 46], [-30, 34], [-44, 20], [-66, 20], [-80, 6]],
  cielo: ['#0b0a26', '#2b1a5c', '#b8407e'], niebla: [0x2a1b4f, 80, 300], hemi: [0xa89aff, 0x2a2440, 0.85], sol: [0xc9d6ff, 0.55],
  suelo: { tonos: [0x2a2d40, 0x2e3146, 0x272a3b], capas: [[30, 0x1c2a2a], [6, 0x24363a]], bajo: 0x2a2d40 },
  relieve: { lomas: 0.25, montes: 0.8 },
  via: { asfalto: [0x2b2f3d, 0x2e3242], berma: 0x4a4e66, bordillo: [0xff2bd6, 0x2bf0ff], linea: 0x2bf0ff, centro: 0xffe14d, brillo: true },
  tribuna: { gradas: [0x3a3f5c, 0x2f3450], techo: [0xff2bd6, 0x2bf0ff] },
  banderines: { farol: true, colores: [0xffe9a8], poste: 0x5a5f7a },
  nubes: false,
  decorado(K) {
    const T = K.THREE, az = K.azar, neon = [0xff2bd6, 0x2bf0ff, 0xffe14d, 0x7cff6b], c = new T.Color(), H = K.H, o = new T.Object3D();
    const dSeg = (px, pz, ax, aZ, bx, bz) => { const vx = bx - ax, vz = bz - aZ, l2 = vx * vx + vz * vz || 1, t = Math.max(0, Math.min(1, ((px - ax) * vx + (pz - aZ) * vz) / l2)); return Math.hypot(px - ax - vx * t, pz - aZ - vz * t); };
    const P0 = K.P[0];
    // --- el Coltejer, en el hueco de adentro de la pista, con la cara mirando a la recta de salida ---
    const h = mejorSitio(K, 60, K.H + 22) || K.HUECO || { x: K.CENTRO.x, z: K.CENTRO.z }, CX = h.x, CZ = h.z, CRY = Math.atan2(P0.x - CX, P0.z - CZ);
    // --- metro elevado: una recta que cruza la pista en la primera recta larga (a 95 m de la meta) y sigue por la ciudad ---
    const ic = Math.floor(95 / K.LARGO * K.NS), ca = Math.cos(0.3), sa = Math.sin(0.3);
    let mx = K.N[ic].x * ca + K.T[ic].x * sa, mz = K.N[ic].z * ca + K.T[ic].z * sa; const ml = Math.hypot(mx, mz); mx /= ml; mz /= ml;
    const MX0 = K.P[ic].x, MZ0 = K.P[ic].z, enLinea = t => [MX0 + mx * t, MZ0 + mz * t], yT0 = 11.5;
    let tA = -400, tB = 400; // el viaducto acaba donde empiezan los cerros (r ≈ 140 del centro)
    for (let t = 0; t > -400; t -= 2) { const [x, z] = enLinea(t); if (Math.hypot(x - K.CENTRO.x, z - K.CENTRO.z) > 140) { tA = t; break; } }
    for (let t = 0; t < 400; t += 2) { const [x, z] = enLinea(t); if (Math.hypot(x - K.CENTRO.x, z - K.CENTRO.z) > 140) { tB = t; break; } }
    const [ax_, az_] = enLinea(tA), [bx_, bz_] = enLinea(tB), dMetro = (x, z) => dSeg(x, z, ax_, az_, bx_, bz_);
    // la estación elevada: en un tramo fuera de la pista, lejos del Coltejer
    const tapaColtejer = K.visual(CX, CZ, 0.75);
    let tE = 0, mejor = -1e9;
    for (let t = tA + 40; t < tB - 40; t += 4) { const [x, z] = enLinea(t), dd = K.distPista(x, z), v = -Math.abs(dd - 32) - (Math.hypot(x - CX, z - CZ) < 40 ? 100 : 0) - (tapaColtejer(x, z, 24) ? 60 : 0); if (v > mejor) { mejor = v; tE = t; } }
    const [EX, EZ] = enLinea(tE);
    // --- metrocable: estación al lado del Coltejer y la línea sube hacia los cerros, por delante de la salida ---
    let ux = K.T[0].x - K.N[0].x * K.AFUERA * 0.7, uz = K.T[0].z - K.N[0].z * K.AFUERA * 0.7; const ul = Math.hypot(ux, uz); ux /= ul; uz /= ul;
    // la estación, pegada al Coltejer pero por donde no tape la vista hacia él
    let SX = CX - uz * 26, SZ = CZ + ux * 26;
    for (let k = 0; k < 12; k++) { const a = Math.atan2(-uz, ux) + k * PI / 6, x = CX + Math.cos(a) * 26, z = CZ + Math.sin(a) * 26; if (!tapaColtejer(x, z, 11) && K.distPista(x, z) > K.H + 10) { SX = x; SZ = z; break; } }
    const vx = -uz, vz = ux;
    const torres = [{ x: SX, z: SZ, y: K.altura(SX, SZ), top: 15, est: true }];
    for (let r = 42; r < 420; r += 38) {
      let x = SX + ux * r, z = SZ + uz * r;
      for (let k = 0; k < 6 && K.distPista(x, z) < H + 4; k++) { x += ux * 5; z += uz * 5; }
      const y = K.altura(x, z), fuera = Math.hypot(x - K.CENTRO.x, z - K.CENTRO.z);
      torres.push({ x, z, y, top: y + (fuera < 140 ? Math.max(40 - y, 16) : 18) });
      if (fuera > 270) break;
    }
    K.monumento('metrocable', torres.slice(1).map(t2 => [t2.x, t2.top - 3, t2.z]));
    K.monumento('metro', MX0, [yT0], MZ0);
    const lineaMC = (x, z) => { let m = 1e9; for (let i = 0; i < torres.length - 1; i++) m = Math.min(m, dSeg(x, z, torres[i].x, torres[i].z, torres[i + 1].x, torres[i + 1].z)); return m; };
    K.foco(CX, 60, CZ); K.monumento('Coltejer', CX, [45, 97], CZ, { todos: true }); // entero: el cuerpo y la punta de la aguja
    K.pista.encuadre = [[CX, 100, CZ]];
    // ruta del sobrevuelo de «Ver pista»: por la recta, bajo el metro, por la estación, alrededor del Coltejer y siguiendo el
    // metrocable hacia la montaña ({p: cámara, m: hacia dónde mira})
    { const [cx1, cz1] = enLinea(0), sx = -mz, sz = mx, ty = torres[Math.min(3, torres.length - 1)], tl = torres[torres.length - 1];
      const aC = Math.atan2(EX - CX, EZ - CZ);
      K.pista.ruta = [
        { p: [P0.x - K.T[0].x * 30, 9, P0.z - K.T[0].z * 30], m: [cx1, 11, cz1] },
        { p: [cx1 - K.T[ic].x * 22 + sx * 6, 8, cz1 - K.T[ic].z * 22 + sz * 6], m: [EX, 14, EZ] },
        { p: [EX + sx * 26, 20, EZ + sz * 26], m: [EX, 12, EZ] },
        { p: [CX + Math.sin(aC) * 60, 34, CZ + Math.cos(aC) * 60], m: [CX, 60, CZ] },
        { p: [CX + Math.sin(aC + 1.6) * 75, 72, CZ + Math.cos(aC + 1.6) * 75], m: [CX, 80, CZ] },
        { p: [SX - ux * 30 + vx * 26, 34, SZ - uz * 30 + vz * 26], m: [SX + ux * 40, 30, SZ + uz * 40] },
        { p: [(SX + ty.x) / 2 + vx * 22, ty.top + 8, (SZ + ty.z) / 2 + vz * 22], m: [tl.x, tl.top, tl.z] }
      ]; }

    // --- edificios alineados con la calle más cercana, dejando libres el Coltejer, el metro y el metrocable ---
    const tapaCable = torres.slice(1).map(t2 => K.visual(t2.x, t2.z, 0.75));
    const libre = p => Math.hypot(p.x - CX, p.z - CZ) > 24 && !tapaColtejer(p.x, p.z, 10) && !tapaCable.some(f => f(p.x, p.z, 9)) && dMetro(p.x, p.z) > 11 && lineaMC(p.x, p.z) > 9 && Math.hypot(p.x - EX, p.z - EZ) > 26 && Math.hypot(p.x - SX, p.z - SZ) > 14;
    const l = K.lugares({ n: 130, intentos: 1600, min: H + 9, max: H + 70, sep: 11, lado: 260, filtro: libre });
    const ed = l.map((p, i) => {
      let m = 1e9, k = 0; for (let j = 0; j < K.NS; j += 6) { const q = K.P[j], d = (q.x - p.x) ** 2 + (q.z - p.z) ** 2; if (d < m) { m = d; k = j; } }
      const lejos = Math.min(1, (p.dd - H) / 70);
      return { x: p.x, y: p.y - 0.3, z: p.z, ry: Math.atan2(K.T[k].x, K.T[k].z), sx: 6 + az() * 5, sy: 8 + az() * 9 + lejos * 12, sz: 6 + az() * 5, c: [0x2a2550, 0x352d63, 0x1f2a4d, 0x3b2f5e][i % 4] };
    });
    K.inst(new T.BoxGeometry(1, 1, 1).translate(0, 0.5, 0), K.MP(0xffffff, { roughness: 0.7 }), ed);
    // ventanas encendidas (puntos) y letreros de neón (una malla que brilla sola)
    const vp = [], vc = [], tonos = [0xffd27a, 0xfff4e0, 0x8fe9ff, 0xffb45a], partes = [];
    ed.forEach((e, i) => {
      const cs = Math.cos(e.ry), sn = Math.sin(e.ry);
      const w = (u, v, hh) => [e.x + u * cs + v * sn, e.y + hh, e.z - u * sn + v * cs];
      for (const [ax, lado] of [[0, 1], [0, -1], [1, 1], [1, -1]]) {
        const ancho = ax ? e.sz : e.sx, prof = (ax ? e.sx : e.sz) / 2 + 0.12;
        for (let u = -ancho / 2 + 1.4; u < ancho / 2 - 1; u += 2.1) for (let hh = 2.2; hh < e.sy - 1; hh += 2.8) {
          if (az() > 0.42 || vp.length > 27000) continue;
          vp.push(...(ax ? w(lado * prof, u, hh) : w(u, lado * prof, hh))); c.setHex(tonos[Math.floor(az() * 4)]); vc.push(c.r, c.g, c.b);
        }
      }
      if (i % 2 === 0) {
        const n = neon[i % 4], y = e.sy + 0.2;
        partes.push(pieza(new T.BoxGeometry(e.sx + 0.3, 0.35, 0.3), n, [e.x - sn * (e.sz / 2), e.y + y, e.z - cs * (e.sz / 2)], [0, e.ry, 0]), pieza(new T.BoxGeometry(e.sx + 0.3, 0.35, 0.3), n, [e.x + sn * (e.sz / 2), e.y + y, e.z + cs * (e.sz / 2)], [0, e.ry, 0]));
        if (i % 4 === 0) partes.push(pieza(new T.BoxGeometry(0.5, Math.min(8, e.sy * 0.5), 1.6), neon[(i + 1) % 4], [e.x + cs * (e.sx / 2 + 0.3), e.y + e.sy * 0.6, e.z - sn * (e.sx / 2 + 0.3)], [0, e.ry, 0]));
      }
    });

    // --- Edificio Coltejer (1972, 175 m, 36 pisos; la punta en aguja de Raúl Fajardo) ---
    // Silueta de frente: cuerpo recto y, arriba, dos curvas que se juntan en una aguja con el «ojo» abierto.
    // 98 m: el más alto del decorado (la cámara de carrera levanta la mirada al acercarse)
    const CW = 11, CH = 60, CT = 98, prof = 13, CU = 26, OJ = 4.6;
    const sil = new T.Shape();
    sil.moveTo(-CW, 0); sil.lineTo(CW, 0); sil.lineTo(CW, CH); sil.quadraticCurveTo(CW * 0.98, CH + CU, 0, CT); sil.quadraticCurveTo(-CW * 0.98, CH + CU, -CW, CH); sil.lineTo(-CW, 0);
    const ojo = new T.Path(); ojo.moveTo(0, CH + 4); ojo.quadraticCurveTo(OJ, CH + 9, 0, CT - 9); ojo.quadraticCurveTo(-OJ, CH + 9, 0, CH + 4); sil.holes.push(ojo);
    const gC = new T.ExtrudeGeometry(sil, { depth: prof, bevelEnabled: true, bevelThickness: 0.6, bevelSize: 0.6, bevelSegments: 1, curveSegments: 14 }).translate(0, 0, -prof / 2);
    const pc = gC.attributes.position, colC = [];
    for (let i = 0; i < pc.count; i++) { const y = pc.getY(i); c.setHex(0x3a3f66).lerp(new T.Color(0xdfe5ff), K_suave(CH - 3, CH + 12, y)); colC.push(c.r, c.g, c.b); }
    gC.setAttribute('color', new T.Float32BufferAttribute(colC, 3)); gC.computeVertexNormals();
    const colt = K.poner(new T.Mesh(gC, new T.MeshStandardMaterial({ vertexColors: true, roughness: 0.6, emissive: 0x1c2048, flatShading: true })), true);
    colt.position.set(CX, K.altura(CX, CZ) - 0.3, CZ); colt.rotation.y = CRY; colt.userData.monumento = 'Coltejer';
    // ventanas encendidas en las dos caras y luces que suben por los bordes de la aguja; luz roja en la punta
    const cs = Math.cos(CRY), sn = Math.sin(CRY), yC = colt.position.y, cw = (u, v, y) => [CX + u * cs + v * sn, yC + y, CZ - u * sn + v * cs];
    for (const lado of [-1, 1]) for (let y = 3; y < CT - 6; y += 2.1) {
      const media = y < CH ? CW - 1 : CW * Math.max(0, 1 - Math.pow((y - CH) / (CT - CH), 1.6)) - 1.2;
      for (let u = -media; u <= media; u += 1.6) {
        if (y > CH + 3 && y < CT - 8 && Math.abs(u) < OJ * Math.sin(PI * (y - CH - 4) / (CT - CH - 13)) + 1) continue;
        if (az() > 0.55) continue;
        vp.push(...cw(u, lado * (prof / 2 + 0.75), y)); c.setHex(az() < 0.7 ? 0xfff1c4 : 0xffd27a); vc.push(c.r, c.g, c.b);
      }
    }
    for (const sg of [-1, 1]) for (let k = 0; k < 16; k++) {
      const f0 = k / 16, f1 = (k + 1) / 16, q = (f, a) => { const b = 1 - f; return [(b * b * CW + 2 * b * f * CW * 0.98) * sg, b * b * CH + 2 * b * f * (CH + CU) + f * f * CT][a]; };
      const x0 = q(f0, 0), y0 = q(f0, 1), x1 = q(f1, 0), y1 = q(f1, 1), l2 = Math.hypot(x1 - x0, y1 - y0);
      for (const lado of [-1, 1]) partes.push(pieza(new T.BoxGeometry(0.35, l2 + 0.1, 0.35), 0xbfe8ff, cw((x0 + x1) / 2, lado * (prof / 2 + 0.7), (y0 + y1) / 2), [0, CRY, -Math.atan2(x1 - x0, y1 - y0)]));
    }
    for (const lado of [-1, 1]) for (const u of [-CW - 0.5, CW + 0.5]) partes.push(pieza(new T.BoxGeometry(0.35, CH, 0.35), 0x8fd0ff, cw(u, lado * (prof / 2 + 0.5), CH / 2), [0, CRY, 0]));
    const faro = K.poner(new T.Mesh(new T.SphereGeometry(0.9, 8, 6), new T.MeshBasicMaterial({ color: 0xff2b2b })));
    faro.position.set(CX, yC + CT + 0.6, CZ);
    K.anim((dt, t) => { faro.visible = Math.floor(t * 1.2) % 2 === 0; });

    // --- viaducto del metro: pilares en T fuera de la vía, tablero continuo, rieles; estación con cubierta curva ---
    const yT = 10.5, pil = [];
    for (let t = Math.ceil(tA / 24) * 24; t <= tB; t += 24) {
      const [x, z] = enLinea(t);
      if (K.distPista(x, z) < H + 3.5 || Math.hypot(x - K.TRIB_C.x, z - K.TRIB_C.z) < 24 || Math.hypot(x - K.PODIO_C.x, z - K.PODIO_C.z) < 11 || Math.hypot(x - CX, z - CZ) < 16) continue;
      pil.push({ x, y: K.altura(x, z) - 0.5, z, ry: Math.atan2(mx, mz) });
    }
    const pilar = K.fusion([pieza(new T.BoxGeometry(1.8, 11, 1.8), 0x8d8f99, [0, 5.5, 0]), pieza(new T.BoxGeometry(8.4, 1.2, 2.4), 0x9a9ca6, [0, yT - 0.5, 0])]);
    K.inst(pilar, K.MP(0xffffff, { vertexColors: true }), pil).userData.monumento = 'metro';
    const largoV = tB - tA, [vmx, vmz] = enLinea((tA + tB) / 2), ryV = Math.atan2(mx, mz);
    const tablero = K.fusion([pieza(new T.BoxGeometry(7.6, 1.2, largoV), 0xa9abb5, [0, yT + 1.0, 0]), pieza(new T.BoxGeometry(0.5, 1.1, largoV), 0x8d8f99, [-3.6, yT + 2.1, 0]), pieza(new T.BoxGeometry(0.5, 1.1, largoV), 0x8d8f99, [3.6, yT + 2.1, 0]),
      ...[-2.6, -1.0, 1.0, 2.6].map(x => pieza(new T.BoxGeometry(0.18, 0.25, largoV), 0x5a5d68, [x, yT + 1.72, 0]))]);
    const vi = K.poner(new T.Mesh(tablero, K.MP(0xffffff, { vertexColors: true })), true, true); vi.position.set(vmx, 0, vmz); vi.rotation.y = ryV; vi.userData.monumento = 'metro';
    // estación elevada (andenes, cubierta blanca curva y luces) y una terminal en cada punta donde entra el tren
    const est = [pieza(new T.BoxGeometry(14, 1.4, 44), 0xb5b7c0, [0, yT + 0.9, 0]), pieza(new T.CylinderGeometry(8.2, 8.2, 46, 18, 1, true, -PI / 2, PI), 0xf4f6fa, [0, yT + 6.4, 0], [PI / 2, 0, 0], [1, 1, 0.42]),
      pieza(new T.BoxGeometry(14.4, 0.3, 46), 0xffe9a8, [0, yT + 6.2, 0])];
    for (const x of [-6.4, 6.4]) for (const z of [-18, 0, 18]) est.push(pieza(new T.BoxGeometry(0.6, yT + 6, 0.6), 0x8d8f99, [x, (yT + 6) / 2, z]));
    est.push(pieza(new T.BoxGeometry(5, yT + 1, 5), 0x6f7280, [9.6, (yT + 1) / 2, 14]));
    const gEst = K.fusion(est);
    const terminal = K.fusion([pieza(new T.BoxGeometry(14, 22, 20), 0x3a3550, [0, 11, 0]), pieza(new T.BoxGeometry(8.4, 6, 0.6), 0x101018, [0, yT + 3.5, 10.05]), pieza(new T.BoxGeometry(14.4, 1, 20.4), 0x1fd08a, [0, 22, 0])]);
    const [ta1, ta2] = [enLinea(tA - 6), enLinea(tB + 6)];
    K.inst(gEst, K.MP(0xffffff, { vertexColors: true, emissive: 0x15161f }), [{ x: EX, y: K.altura(EX, EZ) - 0.4, z: EZ, ry: ryV }]);
    K.inst(terminal, K.MP(0xffffff, { vertexColors: true }), [{ x: ta1[0], y: K.altura(ta1[0], ta1[1]) - 1, z: ta1[1], ry: ryV + PI }, { x: ta2[0], y: K.altura(ta2[0], ta2[1]) - 1, z: ta2[1], ry: ryV }]);
    partes.push(pieza(new T.BoxGeometry(12, 1.2, 0.3), 0x1fd08a, [EX, yT + 3.2, EZ], [0, ryV + PI / 2, 0]));
    // dos trenes de 3 vagones (gris plata, franja verde, ventanas encendidas), uno en cada vía, en bucle por el viaducto
    const LV = 12.5, carro = K.fusion([pieza(new T.BoxGeometry(3.2, 3.3, LV), 0xc9ced6, [0, 1.75, 0]), pieza(new T.BoxGeometry(3.25, 0.5, LV + 0.02), 0x1f9e5a, [0, 0.75, 0]),
      pieza(new T.BoxGeometry(3.0, 0.5, LV - 0.4), 0x2a2d36, [0, 0.2, 0]), pieza(new T.BoxGeometry(3.25, 0.25, LV - 0.6), 0xffe14d, [0, 3.0, 0])]);
    const ventanas = K.fusion([pieza(new T.BoxGeometry(3.28, 1.1, LV - 2), 0xfff1c4, [0, 2.05, 0]), pieza(new T.BoxGeometry(2.6, 1.1, LV + 0.1), 0x9fe9ff, [0, 2.05, 0])]);
    const NT = 6, trM = K.inst(carro, K.MP(0xffffff, { vertexColors: true }), [], true, NT), vnM = K.inst(ventanas, new T.MeshBasicMaterial({ vertexColors: true }), [], false, NT);
    const trenes = [{ s: -1.8, v: 13, f: 0 }, { s: 1.8, v: -13, f: 0.5 }], largoT = largoV + 30;
    K.anim((dt, t) => {
      trenes.forEach((tr, j) => {
        const base = ((((t * tr.v + tr.f * largoT) % largoT) + largoT) % largoT) + tA - 15;
        for (let k = 0; k < 3; k++) {
          const u = base - Math.sign(tr.v) * k * (LV + 0.6), [x, z] = enLinea(u), visible = u > tA - 4 && u < tB + 4;
          o.position.set(x + (-mz) * tr.s, yT + 1.6, z + mx * tr.s); o.rotation.set(0, ryV + (tr.v < 0 ? PI : 0), 0); o.scale.setScalar(visible ? 1 : 0); o.updateMatrix();
          trM.setMatrixAt(j * 3 + k, o.matrix); vnM.setMatrixAt(j * 3 + k, o.matrix);
        }
      });
      trM.instanceMatrix.needsUpdate = true; vnM.instanceMatrix.needsUpdate = true;
    });

    K.puntos(new Float32Array(vp), new Float32Array(vc), { tam: 1.5 });
    if (partes.length) K.poner(new T.Mesh(K.fusion(partes), new T.MeshBasicMaterial({ vertexColors: true })));
    // la montaña de Medellín llena de luces, y estrellas
    const lp = [], lc = [];
    for (let k = 0; k < 9000 && lp.length < 4500 * 3; k++) {
      const a = az() * PI * 2, r = 150 + az() * 150, x = K.CENTRO.x + Math.cos(a) * r, z = K.CENTRO.z + Math.sin(a) * r, y = K.altura(x, z);
      if (y < 4) continue; lp.push(x, y + 0.6, z); c.setHex(az() < 0.75 ? 0xffb45a : 0xffe6b0); lc.push(c.r, c.g, c.b);
    }
    K.puntos(new Float32Array(lp), new Float32Array(lc), { tam: 2.4, niebla: false });
    const ep = []; for (let k = 0; k < 260; k++) { const a = az() * PI * 2, e = 0.25 + az() * 1.1; ep.push(K.CENTRO.x + Math.cos(a) * Math.cos(e) * 480, Math.sin(e) * 480, K.CENTRO.z + Math.sin(a) * Math.cos(e) * 480); }
    K.puntos(new Float32Array(ep), null, { color: 0xffffff, tam: 2, fijo: true, niebla: false });

    // --- metrocable: la estación junto al Coltejer, torres altas sobre los edificios y la línea que sube a la montaña ---
    const ang = Math.atan2(uz, ux);
    // torre: el fuste se estira hasta la altura de cada una; la cruceta y la luz roja van arriba sin estirar
    K.inst(new T.CylinderGeometry(0.45, 0.8, 1, 6).translate(0, 0.5, 0), K.MP(0x8a8fa8, { emissive: 0x15161f }), torres.slice(1).map(tt => ({ x: tt.x, y: tt.y, z: tt.z, sx: 1, sy: tt.top - tt.y, sz: 1 }))).userData.monumento = 'metrocable';
    const cruceta = K.fusion([pieza(new T.BoxGeometry(0.6, 0.6, 7.4), 0x9aa0b8, [0, 0, 0]), pieza(new T.SphereGeometry(0.45, 6, 4), 0xff3b2b, [0, 0.7, 0])]);
    K.inst(cruceta, new T.MeshBasicMaterial({ vertexColors: true }), torres.slice(1).map(tt => ({ x: tt.x, y: tt.top, z: tt.z, ry: -ang })), false);
    const estMC = K.fusion([pieza(new T.BoxGeometry(14, 12, 12), 0x3b3f63, [0, 6, 0]), pieza(new T.BoxGeometry(16, 1.2, 15), 0xf4f6fa, [0, 16.4, 0]), pieza(new T.BoxGeometry(14.4, 0.4, 12.4), 0x1fd08a, [0, 12, 0]),
      ...[-6, 6].map(x => pieza(new T.BoxGeometry(0.6, 4.4, 0.6), 0x8a8fa8, [x, 14, 6])), ...[-6, 6].map(x => pieza(new T.BoxGeometry(0.6, 4.4, 0.6), 0x8a8fa8, [x, 14, -6]))]);
    K.inst(estMC, K.MP(0xffffff, { vertexColors: true, emissive: 0x15161f }), [{ x: SX, y: torres[0].y - 0.3, z: SZ, ry: -ang + PI / 2 }]);
    const lin = [];
    for (const sg of [-1, 1]) for (let i = 0; i < torres.length - 1; i++) { const a = torres[i], b = torres[i + 1]; lin.push(a.x + vx * 3 * sg, a.top, a.z + vz * 3 * sg, b.x + vx * 3 * sg, b.top, b.z + vz * 3 * sg); }
    const gl = new T.BufferGeometry(); gl.setAttribute('position', new T.Float32BufferAttribute(lin, 3));
    K.poner(new T.LineSegments(gl, new T.LineBasicMaterial({ color: 0xc8cde8 })));
    // largo de la línea, para que las cabinas vayan a velocidad constante
    const acum = [0]; for (let i = 1; i < torres.length; i++) acum.push(acum[i - 1] + Math.hypot(torres[i].x - torres[i - 1].x, torres[i].z - torres[i - 1].z));
    const LMC = acum[acum.length - 1];
    const cabina = K.fusion([pieza(new T.BoxGeometry(2.2, 2.2, 2.2), 0xf2f4f7, [0, -2.6, 0]), pieza(new T.BoxGeometry(2.26, 0.8, 2.26), 0xfff1c4, [0, -2.3, 0]), pieza(new T.BoxGeometry(2.26, 0.3, 2.26), 0x1fd08a, [0, -3.5, 0]), pieza(new T.BoxGeometry(0.15, 1.6, 0.15), 0x8a8fa8, [0, -0.8, 0])]);
    const NC = 16, cabM = K.inst(cabina, new T.MeshBasicMaterial({ vertexColors: true }), [], false, NC);
    const enCable = (dist, sg) => {
      let i = 0; while (i < acum.length - 2 && acum[i + 1] < dist) i++;
      const a = torres[i], b = torres[i + 1], q = (dist - acum[i]) / Math.max(1, acum[i + 1] - acum[i]);
      o.position.set(a.x + (b.x - a.x) * q + vx * 3 * sg, a.top + (b.top - a.top) * q - Math.sin(q * PI) * 1.2, a.z + (b.z - a.z) * q + vz * 3 * sg);
    };
    K.anim((dt, t) => {
      for (let k = 0; k < NC; k++) { const sg = k % 2 ? 1 : -1, dd = ((t * 5 + k / NC * LMC) % LMC); enCable(sg > 0 ? dd : LMC - dd, sg); o.rotation.set(0, -ang, 0); o.scale.setScalar(1); o.updateMatrix(); cabM.setMatrixAt(k, o.matrix); }
      cabM.instanceMatrix.needsUpdate = true;
    });
  }
},
/* ================= 7. Piedra del Peñol: el monolito sobre el embalse de Guatapé ================= */
// Referencias (2026-10-11): unos 200 m sobre la base, ~285 × 110 m de planta (Wikipedia, «El Peñón de Guatapé»), granito;
// 702–740 escalones en una grieta lateral; en la cara occidental una «G» y el palo de la «U» pintados en blanco (finales de
// los 80), que se leen «GI»; en la cima, una torre-mirador de tres pisos. Aquí: unos 180 m de alto.
// Trazado en «cerradura»: la recta de salida va derecho hacia la piedra y la vuelta la rodea casi entera (≈ 850 m).
{
  id: 'penol', nombre: 'Piedra del Peñol', rasgo: 'La piedra gigante sobre el embalse',
  tarjeta: ['#8fd0f0', '#2f8f8a'], icono: '<path d="M7 42C7 19 14 6 24 6s17 13 17 36z" fill="#bdbbb3" stroke="#15304d" stroke-width="2"/><path d="M14 40V22M19 41V14M37 40V24" stroke="#77756e" stroke-width="2" stroke-linecap="round"/><path d="M31 40l4-4-4-4 4-4-4-4 4-4-4-4" stroke="#fff" stroke-width="2.2" fill="none" stroke-linejoin="round"/><path d="M15 28a4 4 0 1 0 4-4M19 28h-2M24 24v8" stroke="#fff" stroke-width="2.2" fill="none" stroke-linecap="round"/><rect x="21" y="3" width="6" height="5" fill="#fff" stroke="#15304d" stroke-width="1.5"/>',
  semilla: 1977, orbita: { r: 380, y: 160, mira: 80, x: 0, z: 0 }, vuelo: { alto: 70, lado: 45 }, mirarSalida: 55,
  cp: [[0, -182], [0, -146], [12, -108], [82, -77], [106, -23], [104, 32], [81, 78], [41, 107], [0, 115], [-41, 107], [-81, 78], [-104, 32], [-106, -23], [-82, -77], [-48, -108], [-36, -146], [-36, -182], [-27, -199], [-9, -199]],
  cielo: ['#3f8fdc', '#a9d8f2', '#e8f4f3'], niebla: [0xdcebee, 170, 620], hemi: [0xf4f8ff, 0x557a52, 0.66], sol: [0xfff4e0, 0.95],
  suelo: { tonos: [0x5fa64a, 0x56a046, 0x68ad52], capas: [[40, 0x4f8a3e], [10, 0x4f9a42]], bajo: 0x7d9a6a },
  relieve: { lomas: 1.1, montes: 0.5, desde: 190 },
  via: { berma: 0xd9d2bd, bordillo: [0xffc23a, 0xe5265f] },
  tribuna: { gradas: [0xfff4dc, 0xffe0e8], techo: [0xe5265f, 0xffc23a] },
  banderines: { colores: [0xe5265f, 0xffc23a, 0x2f7fe0, 0x2f9e5d] },
  nubes: 0xffffff,
  preparar(K) {
    this.roca = { x: 0, z: 0, a: 84, b: 88, alto: 180 };
    this.encuadre = [[0, 183, 0]]; // la piedra entera (procedural); el modelo lo corrige al llegar
    this.lugaresTierra = [K.TRIB_C.clone(), K.PODIO_C.clone()];
  },
  // el embalse: hay tierra cerca de la pista, al pie de la piedra, en islas y penínsulas y en los cerros de lejos
  tierra(x, z, dd) {
    const R = this.roca, q = Math.hypot((x - R.x) / R.a, (z - R.z) / R.b), r = Math.hypot(x - R.x, z - R.z);
    const isla = Math.sin(x * 0.029 + 1.3) * Math.cos(z * 0.031 - 0.7) + Math.sin((x + z) * 0.047) * 0.55 + Math.sin(x * 0.011 - z * 0.013) * 0.4;
    let t = Math.max(1 - K_suave(K_H + 11, K_H + 22, dd), 1 - K_suave(1.12, 1.4, q), K_suave(0.55, 0.85, isla), K_suave(205, 235, r));
    this.lugaresTierra.forEach(p => { t = Math.max(t, 1 - K_suave(16, 26, Math.hypot(x - p.x, z - p.z))); });
    return { t, isla };
  },
  alturaExtra(x, z, y, dd) {
    const { t, isla } = this.tierra(x, z, dd);
    const alto = y + Math.max(0, isla - 0.55) * 12 * K_suave(K_H + 20, K_H + 60, dd); // islas bajas cerca de la pista: que no tapen la piedra
    return alto * t + -4.5 * (1 - t);
  },
  colorSuelo(x, z, y, c, az) { return y < -1.3 ? 0x6d7f5c : y < -0.15 ? (az < 0.5 ? 0xc9b07a : 0xb89f6c) : c; },
  decorado(K) {
    const T = K.THREE, az = K.azar, R = this.roca;
    // el embalse: azul verdoso, más hondo lejos de la orilla, con un brillo que se mueve
    const ga = new T.PlaneGeometry(1400, 1400, 28, 28).rotateX(-PI / 2), pa = ga.attributes.position, ca = [], c = new T.Color(), c0 = new T.Color(0x3fa197), c1 = new T.Color(0x1f6f80);
    for (let i = 0; i < pa.count; i++) { c.copy(c0).lerp(c1, Math.min(1, Math.hypot(pa.getX(i), pa.getZ(i)) / 320)); ca.push(c.r, c.g, c.b); }
    ga.setAttribute('color', new T.Float32BufferAttribute(ca, 3));
    K.foco(R.x, 80, R.z); K.monumento('piedra', R.x, [10, 60, 120, 170], R.z);
    const lago = aguaShader(T, true), em = K.poner(new T.Mesh(ga, lago)); em.position.set(R.x, -0.6, R.z);
    K.anim((dt, t) => { lago.uniforms.t.value = t * 0.6; });
    // la piedra procedural: se ve mientras llega el modelo (o si no hay)
    const propia = [K.poner(new T.Mesh(piedra(T, R), new T.MeshStandardMaterial({ vertexColors: true, roughness: 0.92 })))];
    propia[0].userData.monumento = 'piedra';
    // la escalera blanca en zigzag dentro de la grieta, las letras «G I» y la torre-mirador de la cima
    propia.push(K.poner(new T.Mesh(K.fusion(escalera(T, R)), new T.MeshStandardMaterial({ vertexColors: true, roughness: 0.7 }))), K.poner(letras(T, R)));
    const cima = R.alto - 5.5, torre = [pieza(new T.CylinderGeometry(8, 9.5, 3, 12), 0x9e9c94, [0, 0, 0]), pieza(new T.TorusGeometry(7.6, 0.25, 4, 24), 0xfffdf7, [0, 2.6, 0], [PI / 2, 0, 0])];
    [[9, 0xfffdf7, 0xe5265f], [8, 0xfffdf7, 0xffc23a], [7, 0xfffdf7, 0x2f7fe0]].forEach(([w, m, z], k) => {
      torre.push(pieza(new T.BoxGeometry(w, 4.4, w * 0.8), m, [0, 3.7 + k * 4.6, 0]), pieza(new T.BoxGeometry(w + 0.3, 1, w * 0.8 + 0.3), z, [0, 2 + k * 4.6, 0]));
    });
    torre.push(pieza(new T.ConeGeometry(5.6, 3.4, 4), 0xc4552f, [0, 3 + 3 * 4.6 + 0.6, 0], [0, PI / 4, 0]));
    propia.push(K.inst(K.fusion(torre), K.MP(0xffffff, { vertexColors: true }), [{ x: R.x, y: cima, z: R.z, s: 1.3 }], false));
    ponerModelo(K, R, propia);
    // islas y orillas con pinos y árboles redondos
    const roca = p => Math.hypot((p.x - R.x) / R.a, (p.z - R.z) / R.b) > 1.25;
    const l = K.lugares({ n: 260, intentos: 1600, min: K.H + 6, sep: 4.5, lado: 460, filtro: roca }).filter(p => p.y > 0.8);
    const pino = K.fusion([pieza(new T.CylinderGeometry(0.25, 0.35, 1.6, 6), 0x7a5a3c, [0, 0.8, 0]), pieza(new T.ConeGeometry(1.6, 3.4, 7), 0x2f6d4f, [0, 2.9, 0]), pieza(new T.ConeGeometry(1.15, 2.6, 7), 0x3a7d5a, [0, 4.5, 0])]);
    K.inst(pino, K.MP(0xffffff, { vertexColors: true }), l.filter(p => p.tipo < 0.55).map(p => ({ x: p.x, y: p.y, z: p.z, ry: az() * 6, s: 0.9 + p.s * 0.5 })));
    K.inst(new T.CylinderGeometry(0.25, 0.35, 2, 6), K.MP(0x9a6a3c), l.filter(p => p.tipo >= 0.55).map(p => ({ x: p.x, y: p.y + p.s, z: p.z, s: p.s })));
    K.inst(new T.IcosahedronGeometry(1.7, 0), K.MP(0xffffff), l.filter(p => p.tipo >= 0.55).map((p, i) => ({ x: p.x, y: p.y + p.s * 3.1, z: p.z, ry: az() * 6, sx: p.s, sy: p.s * 1.1, sz: p.s, c: [0x2f9e5d, 0x46b86a, 0x3aa860][i % 3] })));
    // casas de Guatapé: blancas, con zócalo de colores, puerta y ventanas con marco, techo de teja
    const zoc = [0xe5265f, 0xffc23a, 0x2f7fe0, 0x2f9e5d, 0x8e6bd8, 0xff8f3d], casas = [];
    K.lugares({ n: 22, intentos: 900, min: K.H + 7, max: K.H + 22, sep: 7, filtro: roca }).filter(p => p.y > 0.5).forEach((p, i) => {
      let m = 1e9, k = 0; for (let j = 0; j < K.NS; j += 6) { const q = K.P[j], d = (q.x - p.x) ** 2 + (q.z - p.z) ** 2; if (d < m) { m = d; k = j; } }
      const ry = Math.atan2(K.T[k].x, K.T[k].z), z = zoc[i % zoc.length], z2 = zoc[(i + 2) % zoc.length], cs = Math.cos(ry), sn = Math.sin(ry);
      const en = (u, v, h) => [p.x + u * cs + v * sn, p.y + h, p.z - u * sn + v * cs];
      casas.push(pieza(new T.BoxGeometry(5, 3.6, 4), 0xfffdf7, en(0, 0, 1.8), [0, ry, 0]), pieza(new T.BoxGeometry(5.2, 1.1, 4.2), z, en(0, 0, 0.55), [0, ry, 0]),
        pieza(new T.BoxGeometry(1.1, 2, 0.2), z2, en(0, 2.05, 1.05), [0, ry, 0]), pieza(new T.BoxGeometry(0.9, 0.9, 0.2), z2, en(-1.6, 2.05, 2.4), [0, ry, 0]), pieza(new T.BoxGeometry(0.9, 0.9, 0.2), z2, en(1.6, 2.05, 2.4), [0, ry, 0]),
        pieza(new T.ConeGeometry(3.9, 1.8, 4), 0xc4552f, en(0, 0, 4.5), [0, ry + PI / 4, 0], [1, 1, 0.78]));
    });
    if (casas.length) K.poner(new T.Mesh(K.fusion(casas), K.MP(0xffffff, { vertexColors: true })), true, true);
    // lanchas que dan vueltas por el embalse
    const lancha = K.fusion([pieza(new T.BoxGeometry(1.8, 0.7, 5), 0xfffdf7, [0, 0.3, 0]), pieza(new T.ConeGeometry(0.9, 1.6, 4), 0xfffdf7, [0, 0.3, 3.2], [PI / 2, PI / 4, 0], [1, 1, 0.5]),
      pieza(new T.BoxGeometry(1.9, 0.25, 5.1), 0xffffff, [0, 0.05, 0]), pieza(new T.BoxGeometry(1.4, 0.8, 1.6), 0x2a3242, [0, 1, -0.6])]);
    const botes = [0, 1, 2, 3, 4, 5, 6].map(i => ({ r: 140 + i * 13 + az() * 10, a: az() * 6.28, v: (0.025 + az() * 0.02) * (i % 2 ? 1 : -1), c: zoc[i % zoc.length] }));
    const bm = K.inst(lancha, K.MP(0xffffff, { vertexColors: true }), botes.map(b => ({ c: b.c })), false, botes.length), o = new T.Object3D();
    K.anim((dt, t) => {
      botes.forEach((b, i) => { const a = b.a + t * b.v; o.position.set(R.x + Math.cos(a) * b.r, -0.45 + Math.sin(t * 2 + i) * 0.08, R.z + Math.sin(a) * b.r * 0.85); o.rotation.set(0, -a + (b.v > 0 ? 0 : PI), Math.sin(t * 1.7 + i) * 0.05); o.updateMatrix(); bm.setMatrixAt(i, o.matrix); });
      bm.instanceMatrix.needsUpdate = true;
    });
  }
}
] };

// suave() para las funciones de relieve, que corren antes de que exista K
function K_suave(a, b, x) { const t = Math.max(0, Math.min(1, (x - a) / (b - a))); return t * t * (3 - 2 * t); }
})();
