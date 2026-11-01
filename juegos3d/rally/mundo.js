/* Rally de los Aros — el cielo en 3D (three r128, el de puente.js). Es el decorado y los aros; la pregunta y las opciones
   van en HTML encima (legibles y para el lector de pantalla).
   window.Mundo.crear(div, {biblio, calma}) → { cielo(id), avionetas(jugador, rivales), aros(s, items), marcar(i, estado),
     quitarAros(), meta(s|null), estallar(x, y, s, color), cuadro(dt, E), tocar(clientX, clientY), calma(b) }
   Coordenadas: x de lado, y la altura, z = −s (s, lo recorrido). Todo low-poly, sin sombras, con niebla, y el decorado
   se recicla por delante (un InstancedMesh por tipo): cabe en un celular modesto. */
(function () {
'use strict';
const T = window.THREE;
if (!T) { window.Mundo = { disponible: false }; return; }
const C = h => new T.Color(h).convertSRGBToLinear();
const azar = (a, b) => a + Math.random() * (b - a);
const LARGO = 520; // lo que se ve por delante: el decorado se recicla en esa franja

const CIELOS = {
  chicamocha: { nombre: 'Cañón del Chicamocha', emoji: '🏜️', arriba: '#5fb3e6', horizonte: '#ffd9a8', niebla: '#f2cf9f', suelo: ['#c98a4b', '#b8783e'], deco: 'meseta',
    colores: ['#b5653a', '#cf8a4f', '#9c4f2e', '#a8603a'], nubes: 10, nube: '#fffaf0', rio: '#3a86ad' },
  sierra: { nombre: 'Sierra Nevada', emoji: '🏔️', arriba: '#3d8fe0', horizonte: '#cfe9ff', niebla: '#d4ebff', suelo: ['#4f9a55', '#458a4b'], deco: 'pico',
    colores: ['#5d7a6a', '#6c8a72', '#55705f'], nubes: 14, nube: '#ffffff' },
  mar: { nombre: 'El mar Caribe', emoji: '🌊', arriba: '#2f8fe6', horizonte: '#bfe8ff', niebla: '#c4eaff', suelo: ['#1f8fc2', '#2a9ccf'], deco: 'isla',
    colores: ['#3d9a4a', '#4caf50', '#2f8a3e'], nubes: 12, nube: '#ffffff', olas: true },
  tormenta: { nombre: 'La tormenta', emoji: '⛈️', arriba: '#3a4256', horizonte: '#7a8396', niebla: '#6f788c', suelo: ['#3d5a45', '#36503d'], deco: 'colina',
    colores: ['#2f4a37', '#3a5642', '#2a4030'], nubes: 22, nube: '#8a93a6', lluvia: true, rayos: true },
  noche: { nombre: 'Noche de estrellas', emoji: '🌌', arriba: '#060c24', horizonte: '#1d2f66', niebla: '#15244f', suelo: ['#1b2d4f', '#18284a'], deco: 'colina',
    colores: ['#16264a', '#1c2f58', '#132042'], nubes: 6, nube: '#3b4f86', estrellas: true, luz: 0.8 },
  ciudad: { nombre: 'La ciudad', emoji: '🏙️', arriba: '#4aa0f0', horizonte: '#d6e8fb', niebla: '#cfe0f5', suelo: ['#7a8a99', '#6f7f8e'], deco: 'edificio',
    colores: ['#e9ecef', '#adb5bd', '#ffd8a8', '#a5d8ff', '#ced4da', '#ffc9c9'], nubes: 10, nube: '#ffffff', calle: true }
};
// las avionetas: cada una con la paleta y los rasgos de su ave (pico en la nariz, plumas en la cola, ojos en la cabina)
const AVIONETAS = [
  { id: 'condor', nombre: 'Cóndor', c: '#3b4a9c', cuerpo: '#3b4a9c', panza: '#f8f9ff', cara: '#ff6b6b', franja: '#ffffff', acento: '#ff4757', ceja: '#1b1f3b',
    pico: { L: 0.34, R: 0.15, gancho: 0.42, color: '#ffe8b0', punta: '#5c3d2e' }, collar: '#ffffff',
    ala: { L: 1.22, cr: 0.64, ct: 0.38, plumas: 4, color: '#ffffff', punta: '#23295a' },
    cola: { n: 5, largo: 0.52, ancho: 0.12, inclina: 0.75, abre: 1.0, colores: ['#23295a', '#2f3a7a'] }, estela: ['#ffffff', '#ff4757', '#7d8cff'] },
  { id: 'colibri', nombre: 'Colibrí', c: '#0ca678', cuerpo: '#12b886', panza: '#d3f9d8', garganta: '#f0147c', franja: '#5c7cfa', acento: '#f0147c', ceja: '#087f5b',
    pico: { L: 0.95, R: 0.075, gancho: 0.05, color: '#2b2d42', punta: '#2b2d42' }, cresta: ['#5c7cfa'],
    ala: { L: 1.3, cr: 0.5, ct: 0.26, plumas: 5, color: '#74e4ff', punta: '#3b5bdb' },
    cola: { n: 3, largo: 0.68, ancho: 0.08, inclina: 1.05, abre: 0.5, recorte: -0.4, colores: ['#3b5bdb', '#12b886', '#3b5bdb'] }, estela: ['#f0147c', '#74e4ff', '#69db7c'] },
  { id: 'guacamaya', nombre: 'Guacamaya', c: '#e03131', cuerpo: '#f03e3e', panza: '#ffd43b', cara: '#ffffff', franja: '#ffd43b', acento: '#1c7ed6', ceja: '#a61e1e',
    pico: { L: 0.36, R: 0.17, gancho: 0.55, color: '#f2cf96', punta: '#212529', corte: 0.6 }, cresta: ['#ffd43b', '#1c7ed6', '#f03e3e'],
    ala: { L: 1.22, cr: 0.62, ct: 0.36, plumas: 4, color: '#ffd43b', punta: '#1c7ed6' },
    cola: { n: 3, largo: 1.05, ancho: 0.09, inclina: 1.25, abre: 0.3, colores: ['#1c7ed6', '#f03e3e', '#1c7ed6'] }, estela: ['#f03e3e', '#ffd43b', '#1c7ed6'] },
  { id: 'tucan', nombre: 'Tucán', c: '#343a40', cuerpo: '#2f3542', panza: '#fff3bf', cara: '#ffe066', franja: '#ff922b', acento: '#22b8cf', ceja: '#ff922b', anillo: '#22b8cf',
    pico: { L: 0.72, R: 0.21, gancho: 0.2, alto: 1.3, color: '#ff8c1a', punta: '#e03131', base: '#ffe066', corte: 0.8 }, bajoCola: '#e03131',
    ala: { L: 1.2, cr: 0.64, ct: 0.38, plumas: 4, color: '#3d4454', punta: '#22b8cf' },
    cola: { n: 4, largo: 0.52, ancho: 0.11, inclina: 0.75, abre: 0.85, colores: ['#2f3542', '#ffffff'] }, estela: ['#ff8c1a', '#ffe066', '#22b8cf'] }
];
// cada aro: color, forma y número (nada sólo por color)
const AROS = [
  { color: '#d9480f', forma: 'círculo', glifo: '●' }, { color: '#1971c2', forma: 'triángulo', glifo: '▲' },
  { color: '#2b8a3e', forma: 'cuadrado', glifo: '■' }, { color: '#7048e8', forma: 'rombo', glifo: '◆' }
];

// Lambert no tiene flatShading en r128: las caras planas salen de quitar los índices y recalcular las normales
function facetas(g) { const n = g.index ? g.toNonIndexed() : g; n.computeVertexNormals(); return n; }
function lienzo(w, h) { const c = document.createElement('canvas'); c.width = w; c.height = h; return [c, c.getContext('2d')]; }
function textura(c, rep) { const t = new T.CanvasTexture(c); t.encoding = T.sRGBEncoding; if (rep) { t.wrapS = t.wrapT = T.RepeatWrapping; t.repeat.set(rep, rep); } t.anisotropy = 2; return t; }
const EMOJI_DELANTE = /^((?:\p{Extended_Pictographic}|\p{Regional_Indicator}|[0-9#*]️?⃣|[‍️\u{1F3FB}-\u{1F3FF}])+)\s*/u;
/** «🐄 vaca» → {emoji: '🐄', texto: 'vaca'} (el emoji de delante va grande en el aro). */
function partir(t) { const m = String(t).match(EMOJI_DELANTE); return m ? { emoji: m[1], texto: String(t).slice(m[0].length) } : { emoji: '', texto: String(t) }; }

function forma(g, k, x, y, r) {
  g.beginPath();
  if (k === 0) g.arc(x, y, r, 0, Math.PI * 2);
  else if (k === 1) { g.moveTo(x, y - r * 1.15); g.lineTo(x + r * 1.1, y + r * 0.75); g.lineTo(x - r * 1.1, y + r * 0.75); g.closePath(); }
  else if (k === 2) g.rect(x - r * 0.9, y - r * 0.9, r * 1.8, r * 1.8);
  else { g.moveTo(x, y - r * 1.15); g.lineTo(x + r * 1.15, y); g.lineTo(x, y + r * 1.15); g.lineTo(x - r * 1.15, y); g.closePath(); }
}
/** El rótulo del aro: el disco blanco con la forma y el número arriba, el emoji grande y el texto. */
function rotulo(k, texto, tapado) {
  const [c, g] = lienzo(256, 256), A = AROS[k], { emoji, texto: tx } = partir(texto);
  g.fillStyle = tapado ? 'rgba(220,224,232,0.75)' : 'rgba(255,253,247,0.94)'; g.beginPath(); g.arc(128, 128, 122, 0, Math.PI * 2); g.fill();
  g.lineWidth = 8; g.strokeStyle = tapado ? '#868e96' : A.color; g.stroke();
  g.fillStyle = tapado ? '#868e96' : A.color; forma(g, k, 128, 40, 26); g.fill();
  g.fillStyle = '#fff'; g.font = '800 34px "Baloo 2", system-ui, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(String(k + 1), 128, k === 1 ? 46 : 42);
  if (tapado) { g.strokeStyle = '#495057'; g.lineWidth = 12; g.beginPath(); g.moveTo(80, 100); g.lineTo(176, 196); g.moveTo(176, 100); g.lineTo(80, 196); g.stroke(); return textura(c); }
  g.fillStyle = '#1d2b53';
  if (emoji) { g.font = (tx ? 74 : 104) + 'px "Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif'; g.fillText(emoji, 128, tx ? 118 : 140); }
  if (tx) {
    const pal = tx.split(/\s+/), lin = [];
    let fs = emoji ? 40 : tx.length <= 4 ? 96 : tx.length <= 7 ? 70 : 52;
    const ancho = s => { g.font = '800 ' + fs + 'px "Baloo 2", system-ui, sans-serif'; return g.measureText(s).width; };
    // dos líneas como mucho; la letra se achica hasta que quepa
    for (; fs >= 20; fs -= 3) {
      lin.length = 0; let cur = '';
      for (const p of pal) { const t = cur ? cur + ' ' + p : p; if (ancho(t) <= 200 || !cur) cur = t; else { lin.push(cur); cur = p; } }
      lin.push(cur);
      if (lin.length <= (emoji ? 2 : 3) && lin.every(l => ancho(l) <= 206)) break;
    }
    g.font = '800 ' + fs + 'px "Baloo 2", system-ui, sans-serif';
    const y0 = emoji ? 186 : 140 - (lin.length - 1) * fs * 0.55;
    lin.forEach((l, i) => g.fillText(l, 128, y0 + i * fs * 1.08));
  }
  return textura(c);
}
function cartel(texto, fondo, tinta, w) {
  const [c, g] = lienzo(w || 256, 64);
  g.fillStyle = fondo; g.beginPath(); if (g.roundRect) g.roundRect(4, 6, c.width - 8, 52, 24); else g.rect(4, 6, c.width - 8, 52); g.fill();
  g.fillStyle = tinta; g.font = '800 32px "Baloo 2", system-ui, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(texto, c.width / 2, 34);
  const s = new T.Sprite(new T.SpriteMaterial({ map: textura(c), transparent: true, depthWrite: false }));
  s.scale.set(3.2 * c.width / 256, 0.8, 1); return s;
}

function crear(div, op) {
  const movil = matchMedia('(pointer: coarse)').matches;
  const ren = new T.WebGLRenderer({ antialias: !movil, powerPreference: 'low-power' });
  ren.setPixelRatio(Math.min(devicePixelRatio || 1, movil ? 1.25 : 1.6));
  ren.outputEncoding = T.sRGBEncoding;
  div.appendChild(ren.domElement);
  const scene = new T.Scene(), cam = new T.PerspectiveCamera(62, 1, 0.3, 700);
  scene.fog = new T.Fog(0xffffff, 90, 420);
  const hemi = new T.HemisphereLight(0xfff6e5, 0x5a6a4a, 0.85); scene.add(hemi);
  const sol = new T.DirectionalLight(0xfff1d6, 0.85); sol.position.set(30, 60, 20); scene.add(sol); scene.add(sol.target);
  let calma = !!op.calma;

  // la cúpula del cielo: un degradado de vértices que va con la cámara
  const domo = new T.Mesh(new T.SphereGeometry(600, 24, 12), new T.MeshBasicMaterial({ vertexColors: true, side: T.BackSide, fog: false, depthWrite: false }));
  domo.renderOrder = -2; scene.add(domo);
  function pintarDomo(arriba, horiz) {
    const g = domo.geometry, p = g.attributes.position, col = new Float32Array(p.count * 3), a = C(arriba), h = C(horiz), m = new T.Color();
    for (let i = 0; i < p.count; i++) { const k = Math.max(0, Math.min(1, p.getY(i) / 600 * 1.6)); m.copy(h).lerp(a, Math.pow(k, 0.7)); col[i * 3] = m.r; col[i * 3 + 1] = m.g; col[i * 3 + 2] = m.b; }
    g.setAttribute('color', new T.BufferAttribute(col, 3));
  }
  // estrellas y luna (noche)
  const estrellas = (() => {
    const n = 500, pos = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) { const a = Math.random() * Math.PI * 2, e = azar(0.08, 1.4), r = 560; pos[i * 3] = Math.cos(a) * Math.cos(e) * r; pos[i * 3 + 1] = Math.sin(e) * r; pos[i * 3 + 2] = Math.sin(a) * Math.cos(e) * r; }
    const g = new T.BufferGeometry(); g.setAttribute('position', new T.BufferAttribute(pos, 3));
    return new T.Points(g, new T.PointsMaterial({ color: 0xffffff, size: 2.2, sizeAttenuation: false, fog: false }));
  })();
  const luna = new T.Mesh(new T.SphereGeometry(18, 16, 12), new T.MeshBasicMaterial({ color: C('#fff7d6'), fog: false }));
  scene.add(estrellas, luna);

  // el suelo: una textura de manchas que se repite; el plano salta de 20 en 20 con la cámara (no se nota)
  const suelo = new T.Mesh(new T.PlaneGeometry(1400, 1400), new T.MeshLambertMaterial({ color: 0xffffff }));
  suelo.rotation.x = -Math.PI / 2; scene.add(suelo);
  function texSuelo(a, b, olas) {
    const [c, g] = lienzo(128, 128); g.fillStyle = a; g.fillRect(0, 0, 128, 128);
    for (let i = 0; i < 40; i++) { g.fillStyle = b; g.globalAlpha = azar(0.35, 0.9); const x = azar(0, 128), y = azar(0, 128); if (olas) { g.fillRect(x, y, azar(10, 26), 2); } else { g.beginPath(); g.arc(x, y, azar(4, 14), 0, 7); g.fill(); } }
    if (olas) { g.globalAlpha = 0.5; g.fillStyle = '#e7f8ff'; for (let i = 0; i < 14; i++) g.fillRect(azar(0, 128), azar(0, 128), azar(6, 14), 1.5); }
    g.globalAlpha = 1; const t = textura(c, 70); return t;
  }
  // franja del río (cañón) o de la calle (ciudad)
  const franja = new T.Mesh(new T.PlaneGeometry(9, 1400), new T.MeshLambertMaterial({ color: 0xffffff }));
  franja.rotation.x = -Math.PI / 2; franja.position.y = 0.05; scene.add(franja);

  // el decorado: un InstancedMesh por tipo que se recicla por delante
  const GEOS = {
    meseta: (() => { const g = new T.CylinderGeometry(0.78, 1, 1, 7, 1); g.translate(0, 0.5, 0); return g; })(),
    pico: (() => { const g = new T.ConeGeometry(1, 1, 6, 1); g.translate(0, 0.5, 0); return g; })(),
    nieve: (() => { const g = new T.ConeGeometry(1, 1, 6, 1); g.translate(0, 0.5, 0); return g; })(),
    isla: (() => { const g = new T.SphereGeometry(1, 8, 5, 0, Math.PI * 2, 0, Math.PI / 2); return g; })(),
    arena: (() => { const g = new T.CylinderGeometry(1, 1.05, 0.2, 10); return g; })(),
    colina: (() => { const g = new T.SphereGeometry(1, 8, 5, 0, Math.PI * 2, 0, Math.PI / 2); return g; })(),
    edificio: (() => { const g = new T.BoxGeometry(1, 1, 1); g.translate(0, 0.5, 0); return g; })()
  };
  const ventanas = (() => { const [c, g] = lienzo(64, 128); g.fillStyle = '#fff'; g.fillRect(0, 0, 64, 128); g.fillStyle = '#5c7c99'; for (let y = 6; y < 128; y += 14) for (let x = 6; x < 64; x += 14) g.fillRect(x, y, 8, 8); const t = textura(c); t.wrapS = t.wrapT = T.RepeatWrapping; return t; })();
  const N_DECO = movil ? 34 : 50;
  const deco = {}, ficha = [];
  const mat4 = new T.Matrix4(), q0 = new T.Quaternion(), v0 = new T.Vector3(), sc = new T.Vector3(), eY = new T.Euler();
  for (const k of ['meseta', 'pico', 'nieve', 'isla', 'arena', 'colina', 'edificio']) {
    const m = new T.MeshLambertMaterial({ color: 0xffffff, map: k === 'edificio' ? ventanas : null });
    const im = new T.InstancedMesh(k === 'edificio' ? GEOS[k] : facetas(GEOS[k]), m, N_DECO); im.frustumCulled = false;
    im.instanceColor = new T.InstancedBufferAttribute(new Float32Array(N_DECO * 3).fill(1), 3); // antes del primer cuadro: el shader nace con color por instancia
    scene.add(im); deco[k] = im;
  }
  // las nubes de papel: tres bolitas por nube, en un solo InstancedMesh
  const N_NUBES = movil ? 14 : 22;
  const nubes = new T.InstancedMesh(facetas(new T.IcosahedronGeometry(1, 0)), new T.MeshLambertMaterial({ color: 0xffffff, transparent: true, opacity: 0.95 }), N_NUBES * 3);
  nubes.frustumCulled = false; scene.add(nubes);
  const nubeF = [];
  // lluvia
  const lluvia = (() => {
    const n = movil ? 160 : 260, pos = new Float32Array(n * 6);
    const g = new T.BufferGeometry(); g.setAttribute('position', new T.BufferAttribute(pos, 3));
    const l = new T.LineSegments(g, new T.LineBasicMaterial({ color: C('#c8d3e6'), transparent: true, opacity: 0.55 })); l.frustumCulled = false; l.visible = false; scene.add(l);
    const d = []; for (let i = 0; i < n; i++) d.push({ x: azar(-30, 30), y: azar(0, 30), z: azar(-60, 10) });
    return { l, d, pos };
  })();
  let cieloAct = null, relampago = 0, proxRayo = 6;

  function ponerDeco(f) {
    const k = f.k, cfg = cieloAct, lado = Math.random() < 0.5 ? -1 : 1;
    let x, w, h, d;
    // el pasillo del vuelo (|x| < 18) queda libre: el borde de cada cosa, no su centro, empieza fuera
    if (k === 'meseta') { w = azar(8, 18); x = lado * (w + azar(18, 55)); h = azar(14, 38); d = w; }
    else if (k === 'pico') { w = azar(14, 30); x = lado * (w + azar(22, 100)); h = azar(28, 70); d = w; }
    else if (k === 'isla') { w = azar(5, 14); x = lado * (w + azar(10, 100)); h = azar(2, 6); d = w * azar(0.7, 1.2); }
    else if (k === 'colina') { w = azar(10, 28); x = lado * (w + azar(16, 90)); h = azar(5, 16); d = w; }
    else { w = azar(5, 11); x = lado * (w / 2 + azar(17, 85)); h = azar(9, 44) * (Math.abs(x) < 26 ? 0.5 : 1); d = azar(5, 11); }
    f.x = x; f.w = w; f.h = h; f.d = d; f.giro = azar(0, Math.PI * 2);
    f.color = C(cfg.colores[Math.floor(Math.random() * cfg.colores.length)]);
  }
  function escribirDeco() {
    const usados = {};
    for (const f of ficha) {
      const k = f.k, im = deco[k], i = usados[k] = (usados[k] || 0);
      usados[k]++;
      eY.set(0, f.giro, 0); q0.setFromEuler(eY);
      if (k === 'isla') { mat4.compose(v0.set(f.x, 0, f.z), q0, sc.set(f.w, f.h, f.d)); im.setMatrixAt(i, mat4); im.setColorAt(i, f.color);
        const a = deco.arena, j = usados.arena = (usados.arena || 0); usados.arena++; mat4.compose(v0.set(f.x, 0.1, f.z), q0, sc.set(f.w * 1.18, 1, f.d * 1.18)); a.setMatrixAt(j, mat4); a.setColorAt(j, C('#f4e1a6')); }
      else { mat4.compose(v0.set(f.x, 0, f.z), q0, sc.set(f.w, f.h, f.d)); im.setMatrixAt(i, mat4); im.setColorAt(i, f.color); }
      if (k === 'pico') { const nv = deco.nieve, j = usados.nieve = (usados.nieve || 0); usados.nieve++; mat4.compose(v0.set(f.x, f.h * 0.62, f.z), q0, sc.set(f.w * 0.385, f.h * 0.385, f.d * 0.385)); nv.setMatrixAt(j, mat4); nv.setColorAt(j, C('#ffffff')); }
    }
    for (const k in deco) { deco[k].count = usados[k] || 0; deco[k].instanceMatrix.needsUpdate = true; if (deco[k].instanceColor) deco[k].instanceColor.needsUpdate = true; }
  }
  function ponerNube(f, s0, cerca) {
    const enMedio = Math.random() < 0.3;
    f.x = enMedio ? azar(-40, 40) : (Math.random() < 0.5 ? -1 : 1) * azar(18, 110);
    f.y = enMedio ? azar(19, 34) : azar(cerca ? 4 : 10, 36);
    f.z = -s0; f.t = azar(4, 9);
  }
  function escribirNubes() {
    nubeF.forEach((f, n) => {
      for (let b = 0; b < 3; b++) {
        const dx = (b - 1) * f.t * 0.75, r = f.t * (b === 1 ? 0.75 : 0.5);
        eY.set(0, n + b, 0); q0.setFromEuler(eY);
        mat4.compose(v0.set(f.x + dx, f.y + (b === 1 ? r * 0.25 : 0), f.z + (b - 1) * 1.2), q0, sc.set(r * 1.25, r * 0.6, r)); nubes.setMatrixAt(n * 3 + b, mat4);
      }
    });
    nubes.instanceMatrix.needsUpdate = true;
  }

  function cielo(id, s0) {
    const c = cieloAct = CIELOS[id] || CIELOS.sierra; s0 = s0 || 0;
    pintarDomo(c.arriba, c.horizonte);
    scene.fog.color.copy(C(c.niebla)); scene.background = C(c.niebla);
    const ts = suelo.material.map; if (ts) ts.dispose();
    suelo.material.map = texSuelo(c.suelo[0], c.suelo[1], c.olas); suelo.material.needsUpdate = true;
    franja.visible = !!(c.rio || c.calle); franja.material.color.copy(C(c.rio || '#4a5560'));
    estrellas.visible = luna.visible = !!c.estrellas;
    hemi.intensity = c.luz ? 0.55 : 0.85; sol.intensity = c.luz ? 0.35 : 0.85;
    hemi.color.copy(C(c.estrellas ? '#9fb4ff' : '#fff6e5'));
    nubes.material.color.copy(C(c.nube)); nubes.material.opacity = c.lluvia ? 0.92 : 0.95;
    lluvia.l.visible = !!c.lluvia;
    // decorado nuevo: la franja por delante, repartida
    ficha.length = 0;
    const tipo = c.deco;
    for (let i = 0; i < N_DECO; i++) { const f = { k: tipo }; ponerDeco(f); f.z = -(s0 - 40 + (i / N_DECO) * LARGO); ficha.push(f); }
    escribirDeco();
    nubeF.length = 0;
    const nn = Math.min(N_NUBES, c.nubes);
    for (let i = 0; i < nn; i++) { const f = {}; ponerNube(f, s0 - 40 + (i / nn) * LARGO, true); nubeF.push(f); }
    nubes.count = nn * 3; escribirNubes();
    pajaro.reset();
  }

  /* ---------- avionetas ---------- */
  function M(hex, extra) { return new T.MeshLambertMaterial(Object.assign({ color: C(hex) }, extra || {})); }
  /* Cada avioneta es UNA malla: sus piezas (geometría por código) se funden en una y el color va por vértice, con
     sombreado de dibujo animado (tres tonos) y un contorno oscuro (la misma malla inflada, por detrás). Más la hélice,
     su disco borroso, la sombra en el suelo y la estela: seis dibujos por avioneta, sin texturas de imagen. */
  const ESC = 1.08;
  const RAMPA = (() => { const t = new T.DataTexture(new Uint8Array([118, 186, 255]), 3, 1, T.LuminanceFormat); t.minFilter = t.magFilter = T.NearestFilter; t.generateMipmaps = false; t.needsUpdate = true; return t; })();
  const M_TOON = new T.MeshToonMaterial({ vertexColors: true, gradientMap: RAMPA });
  const M_HELICE = new T.MeshToonMaterial({ vertexColors: true, gradientMap: RAMPA, transparent: true, opacity: 0.4, depthWrite: false });
  const M_CONTORNO = new T.MeshBasicMaterial({ color: C('#1b1f3b'), side: T.BackSide });
  M_CONTORNO.onBeforeCompile = sh => { sh.vertexShader = sh.vertexShader.replace('#include <begin_vertex>', 'vec3 transformed = position + normal * 0.03;'); };
  const M_FANTASMA = new T.MeshBasicMaterial({ color: C('#d0ebff'), transparent: true, opacity: 0.38, depthWrite: false });
  const M_ESTELA = new T.MeshBasicMaterial({ vertexColors: true, transparent: true, depthWrite: false, side: T.DoubleSide });
  const TEX_DISCO = (() => {
    const [c, g] = lienzo(128, 128), r = g.createRadialGradient(64, 64, 4, 64, 64, 63);
    r.addColorStop(0, 'rgba(255,255,255,0)'); r.addColorStop(0.3, 'rgba(255,255,255,0.08)'); r.addColorStop(0.78, 'rgba(255,255,255,0.3)');
    r.addColorStop(0.9, 'rgba(255,255,255,0.85)'); r.addColorStop(1, 'rgba(255,255,255,0)');
    g.fillStyle = r; g.fillRect(0, 0, 128, 128); return textura(c);
  })();
  const GEO_DISCO = new T.CircleGeometry(0.6, 32);
  const M_SOMBRA = (() => {
    const [c, g] = lienzo(64, 64), r = g.createRadialGradient(32, 32, 2, 32, 32, 31);
    r.addColorStop(0, 'rgba(20,24,48,0.55)'); r.addColorStop(0.6, 'rgba(20,24,48,0.25)'); r.addColorStop(1, 'rgba(20,24,48,0)');
    g.fillStyle = r; g.fillRect(0, 0, 64, 64);
    return new T.MeshBasicMaterial({ map: textura(c), transparent: true, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2 });
  })();
  const GEO_SOMBRA = new T.PlaneGeometry(2, 2);

  // una matriz: posición, giro (primero x, luego y, luego z) y escala
  const mtx = (x, y, z, rx, ry, rz, sx, sy, sz) => new T.Matrix4().compose(new T.Vector3(x, y, z),
    new T.Quaternion().setFromEuler(new T.Euler(rx || 0, ry || 0, rz || 0, 'ZYX')), new T.Vector3(sx == null ? 1 : sx, sy == null ? (sx == null ? 1 : sx) : sy, sz == null ? (sx == null ? 1 : sx) : sz));
  // funde piezas [geo, color o (x, y, z) → color, matriz, {quads, sinContorno}] en una geometría con color por triángulo
  // (por cuadro en las de torno: así las franjas salen rectas). Con `contorno`: sin color, sin las piezas diminutas y con
  // las normales promediadas en cada vértice (para inflarla sin que se abra en las aristas).
  function fundir(piezas, contorno) {
    const gs = piezas.filter(pz => !(contorno && pz[3] && pz[3].sinContorno)).map(([geo, col, m, o]) => {
      const g = geo.index ? geo.toNonIndexed() : geo.clone(); if (m) g.applyMatrix4(m); return [g, col, (o && o.quads) ? 6 : 3];
    });
    const n = gs.reduce((a, [g]) => a + g.attributes.position.count, 0);
    const pos = new Float32Array(n * 3), nor = new Float32Array(n * 3), col = contorno ? null : new Float32Array(n * 3), cache = {};
    let o = 0;
    gs.forEach(([g, c, paso]) => {
      const P = g.attributes.position.array, k = g.attributes.position.count;
      pos.set(P, o * 3); nor.set(g.attributes.normal.array, o * 3);
      if (col) for (let t = 0; t < k; t += paso) {
        const m = Math.min(paso, k - t); let cx = 0, cy = 0, cz = 0;
        for (let j = 0; j < m; j++) { cx += P[(t + j) * 3]; cy += P[(t + j) * 3 + 1]; cz += P[(t + j) * 3 + 2]; }
        const hex = typeof c === 'function' ? c(cx / m, cy / m, cz / m) : c, cc = cache[hex] || (cache[hex] = C(hex));
        for (let j = 0; j < m; j++) { col[(o + t + j) * 3] = cc.r; col[(o + t + j) * 3 + 1] = cc.g; col[(o + t + j) * 3 + 2] = cc.b; }
      }
      o += k; g.dispose();
    });
    if (contorno) {
      const acc = new Map(), key = i => Math.round(pos[i] * 400) + ',' + Math.round(pos[i + 1] * 400) + ',' + Math.round(pos[i + 2] * 400);
      for (let i = 0; i < pos.length; i += 3) { const kk = key(i), a = acc.get(kk) || [0, 0, 0]; a[0] += nor[i]; a[1] += nor[i + 1]; a[2] += nor[i + 2]; acc.set(kk, a); }
      for (let i = 0; i < pos.length; i += 3) { const a = acc.get(key(i)), l = Math.hypot(a[0], a[1], a[2]) || 1; nor[i] = a[0] / l; nor[i + 1] = a[1] / l; nor[i + 2] = a[2] / l; }
    }
    const out = new T.BufferGeometry();
    out.setAttribute('position', new T.BufferAttribute(pos, 3)); out.setAttribute('normal', new T.BufferAttribute(nor, 3));
    if (col) out.setAttribute('color', new T.BufferAttribute(col, 3));
    out.computeBoundingSphere(); return out;
  }
  // el ala de ave: borde de ataque redondo, punta redonda y el borde de salida en plumas; sx = 1 derecha, −1 izquierda.
  // Sale en dos piezas, cortada en x = corte·L: la de dentro y la punta (de otro color), con su surco entre las dos.
  function ala(L, cr, ct, plumas, sx, grueso, corte) {
    const s = new T.Shape();
    s.moveTo(0, cr * 0.55);
    s.bezierCurveTo(L * 0.35, cr * 0.66, L * 0.82, ct * 0.8, L, ct * 0.3);
    s.quadraticCurveTo(L * 1.05, -ct * 0.25, L * 0.92, -ct * 0.6);
    const x0 = L * 0.92, y0 = -ct * 0.6, x1 = L * 0.1, y1 = -cr * 0.45;
    for (let i = 1; i <= plumas; i++) {
      const u = i / plumas, um = (i - 0.5) / plumas;
      s.quadraticCurveTo(x0 + (x1 - x0) * um, y0 + (y1 - y0) * um - 0.14, x0 + (x1 - x0) * u, y0 + (y1 - y0) * u);
    }
    s.lineTo(0, -cr * 0.45); s.lineTo(0, cr * 0.55);
    const pts = s.getPoints(6); if (pts.length > 2 && pts[0].distanceTo(pts[pts.length - 1]) < 1e-6) pts.pop();
    const xc = (corte || 0.7) * L;
    // Sutherland–Hodgman contra la recta x = xc (dentro: x ≤ xc; fuera: x ≥ xc)
    const recortar = fuera => {
      const den = p => (fuera ? p.x >= xc : p.x <= xc), out = [];
      for (let i = 0; i < pts.length; i++) {
        const a = pts[i], b = pts[(i + 1) % pts.length], ia = den(a), ib = den(b);
        if (ia) out.push(a);
        if (ia !== ib) { const t = (xc - a.x) / (b.x - a.x); out.push(new T.Vector2(xc, a.y + (b.y - a.y) * t)); }
      }
      return out;
    };
    const b = grueso || 0.045;
    return [false, true].map(fuera => {
      const g = new T.ExtrudeGeometry(new T.Shape(recortar(fuera).map(p => new T.Vector2(p.x * sx, p.y))), { depth: 0.02, bevelEnabled: true, bevelThickness: b, bevelSize: b * 0.8, bevelSegments: 2 });
      g.translate(0, 0, -0.01); g.rotateX(-Math.PI / 2); return g;
    });
  }
  // una pluma: un huevo aplanado de base en el origen, a lo largo de +y
  function pluma(largo, ancho, grueso) { const g = new T.SphereGeometry(1, 10, 6); g.scale(ancho, largo / 2, grueso || 0.05); g.translate(0, largo / 2, 0); return g; }
  // el pico: un cono redondeado hacia delante (−z), curvo hacia abajo (gancho), alto o ancho
  function pico(L, R, gancho, alto) {
    const pts = []; for (let i = 0; i <= 8; i++) { const t = i / 8; pts.push(new T.Vector2(Math.max(0.004, R * Math.pow(1 - t, 0.85) * (1 - 0.15 * t)), t * L)); }
    const g = new T.LatheGeometry(pts, 12), p = g.attributes.position;
    for (let i = 0; i < p.count; i++) { const t = p.getY(i) / L; p.setX(i, p.getX(i) * (alto > 1 ? 0.82 : 1)); p.setZ(i, p.getZ(i) * (alto || 1) - gancho * L * t * t); }
    g.computeVertexNormals(); g.rotateX(-Math.PI / 2); return g;
  }
  const GEOS_AV = {};
  function geoAvioneta(e) {
    if (GEOS_AV[e.id]) return GEOS_AV[e.id];
    const P = [], pon = (geo, col, m, o) => P.push([geo, col, m, o]);
    // el fuselaje: un huevo largo, gordo delante (la cabeza) y fino atrás
    const perfil = [[0.02, -0.88], [0.1, -0.84], [0.17, -0.64], [0.25, -0.38], [0.32, -0.1], [0.36, 0.16], [0.355, 0.38], [0.31, 0.56], [0.24, 0.68], [0.14, 0.76], [0.02, 0.79]];
    pon(new T.LatheGeometry(perfil.map(([r, y]) => new T.Vector2(r, y)), 18), (x, y, z) => {
      if (z < -0.5 && y > -0.13 && e.cara) return e.cara;
      if (y < -0.13) return z < -0.28 && e.garganta ? e.garganta : e.panza;
      if (Math.abs(x) < 0.075 && y > 0.1 && z > 0.02) return e.franja || e.acento;
      return e.cuerpo;
    }, mtx(0, 0, 0, -Math.PI / 2, 0, 0, 1, 1.04, 1), { quads: true });
    // la cabina (de vidrio, con un brillo) y los ojos en el parabrisas
    pon(new T.SphereGeometry(0.21, 16, 10), (x, y) => (x > 0.035 && x < 0.1 && y > 0.37 ? '#ffffff' : '#b9f1ff'), mtx(0, 0.28, -0.1, 0, 0, 0, 0.95, 0.8, 1.55));
    [-1, 1].forEach(sx => {
      const d = new T.Vector3(sx * 0.42, 0.22, -1).normalize(), c = new T.Vector3(sx * 0.095, 0.34, -0.36);
      if (e.anillo) pon(new T.TorusGeometry(0.088, 0.022, 6, 16), e.anillo, mtx(c.x + d.x * 0.01, c.y, c.z + d.z * 0.01, 0.22, sx * 0.42, 0));
      pon(new T.SphereGeometry(0.085, 12, 8), '#ffffff', mtx(c.x, c.y, c.z, 0.22, sx * 0.42, 0, 1, 1.15, 0.55));
      const p = c.clone().addScaledVector(d, 0.04); p.x -= sx * 0.012; p.y -= 0.005;
      pon(new T.SphereGeometry(0.048, 10, 6), '#1b1f3b', mtx(p.x, p.y, p.z, 0.22, sx * 0.42, 0, 1, 1.15, 0.6), { sinContorno: true });
      const h = p.clone().addScaledVector(d, 0.025); h.x += sx * 0.012; h.y += 0.022;
      pon(new T.SphereGeometry(0.016, 6, 4), '#ffffff', mtx(h.x, h.y, h.z), { sinContorno: true });
      // la ceja, alzada: cara de curioso y contento
      pon(new T.SphereGeometry(1, 8, 4), e.ceja || e.cuerpo, mtx(c.x + sx * 0.005, c.y + 0.125, c.z + 0.005, 0, sx * 0.42, -sx * 0.22, 0.07, 0.02, 0.025), { sinContorno: true });
    });
    // el pico en la nariz (la hélice gira detrás de él)
    const z0 = -0.7, pk = e.pico;
    pon(pico(pk.L, pk.R, pk.gancho, pk.alto), (x, y, z) => { const t = (z0 - z) / pk.L; return t > (pk.corte || 0.72) ? pk.punta : pk.base && t < 0.16 ? pk.base : pk.color; }, mtx(0, -0.02, z0), { quads: true });
    // las alas (con diedro) y su escarapela
    const A = e.ala, LR = 0.2;
    [-1, 1].forEach(sx => {
      const [dentro, punta] = ala(A.L, A.cr, A.ct, A.plumas, sx, 0.045, 0.7);
      pon(dentro, A.color, mtx(sx * LR, -0.08, -0.02, 0, 0, sx * 0.12)); pon(punta, A.punta, mtx(sx * LR, -0.08, -0.02, 0, 0, sx * 0.12));
      const xe = LR + A.L * 0.42, ye = -0.08 + 0.065 + Math.sin(0.12) * A.L * 0.42;
      pon(new T.CylinderGeometry(0.15, 0.15, 0.02, 18), '#ffffff', mtx(sx * xe, ye, -0.05, 0, 0, sx * 0.12));
      pon(new T.CylinderGeometry(0.095, 0.095, 0.03, 18), e.acento, mtx(sx * xe, ye + 0.006, -0.05, 0, 0, sx * 0.12));
      // la cola horizontal
      ala(0.4, 0.3, 0.2, 2, sx, 0.035, 0.62).forEach((g, j) => pon(g, j ? A.punta : A.color, mtx(sx * 0.06, 0.03, 0.66, 0, 0, sx * 0.08)));
    });
    // las plumas de la cola (la del medio hace de timón)
    const K = e.cola;
    for (let i = 0; i < K.n; i++) {
      const u = K.n > 1 ? i / (K.n - 1) - 0.5 : 0, a = K.abre * u * 2, l = K.largo * (1 - Math.abs(u) * (K.recorte || 0.25));
      pon(pluma(l, K.ancho, 0.05), K.colores[i % K.colores.length], mtx(u * 0.08, 0.06, 0.72, K.inclina, 0, -a));
    }
    if (e.bajoCola) pon(new T.SphereGeometry(0.11, 10, 6), e.bajoCola, mtx(0, -0.07, 0.72, 0, 0, 0, 1, 0.7, 1.4));
    // lo de cada ave en la cabeza
    if (e.collar) pon(new T.TorusGeometry(0.31, 0.075, 8, 22), e.collar, mtx(0, 0, 0.14, 0, 0, 0, 1, 1.04, 1.25));
    if (e.cresta) e.cresta.forEach((c, i) => pon(pluma(0.26 - i * 0.03, 0.05, 0.035), c, mtx(0, 0.42, -0.02 + i * 0.07, -0.55 - i * 0.25, 0, 0)));
    // las ruedas: de juguete, gordas
    [-1, 1].forEach(sx => {
      pon(new T.BoxGeometry(0.05, 0.26, 0.07), e.cuerpo, mtx(sx * 0.2, -0.34, -0.24, 0, 0, -sx * 0.25));
      pon(new T.CylinderGeometry(0.12, 0.12, 0.09, 14), '#2b2d42', mtx(sx * 0.25, -0.46, -0.24, 0, 0, Math.PI / 2));
      pon(new T.CylinderGeometry(0.06, 0.06, 0.1, 10), e.acento, mtx(sx * 0.25, -0.46, -0.24, 0, 0, Math.PI / 2));
    });
    const cuerpo = fundir(P), contorno = fundir(P, true);
    P.forEach(([g]) => g.dispose());
    // la hélice: tres palas con la punta de color
    const H = [];
    for (let k = 0; k < 3; k++) H.push([pluma(0.56, 0.075, 0.022), (x, y) => (Math.hypot(x, y) > 0.44 ? e.acento : '#2b2d42'), mtx(0, 0, 0, 0, 0.35, k * Math.PI * 2 / 3)]);
    const helice = fundir(H); H.forEach(([g]) => g.dispose());
    const puntas = [-1, 1].map(sx => new T.Vector3(sx * (LR + A.L * 0.97), -0.08 + Math.sin(0.12) * A.L, -0.02));
    return (GEOS_AV[e.id] = { cuerpo, contorno, helice, puntas });
  }
  const N_TR = 26; // puntos de cada estela (una por punta de ala)
  function nuevaEstela(e) {
    const nv = 2 * N_TR * 2, pos = new Float32Array(nv * 3), col = new Float32Array(nv * 4), idx = [];
    for (let t = 0; t < 2; t++) for (let i = 0; i < N_TR - 1; i++) { const a = (t * N_TR + i) * 2; idx.push(a, a + 1, a + 2, a + 1, a + 3, a + 2); }
    const geo = new T.BufferGeometry(); geo.setAttribute('position', new T.BufferAttribute(pos, 3)); geo.setAttribute('color', new T.BufferAttribute(col, 4)); geo.setIndex(idx);
    const m = new T.Mesh(geo, M_ESTELA); m.frustumCulled = false; scene.add(m);
    return { m, cs: e.estela.map(C), pts: [[], []] };
  }
  function avioneta(e, fantasma) {
    const g = new T.Group(), cuerpo = new T.Group(); g.add(cuerpo);
    const G = geoAvioneta(e);
    cuerpo.add(new T.Mesh(G.cuerpo, fantasma ? M_FANTASMA : M_TOON));
    if (!fantasma) cuerpo.add(new T.Mesh(G.contorno, M_CONTORNO));
    const helice = new T.Group(); helice.position.set(0, -0.02, -0.79); cuerpo.add(helice);
    helice.add(new T.Mesh(G.helice, fantasma ? M_FANTASMA : M_HELICE));
    let disco = null;
    if (!fantasma) { disco = new T.Mesh(GEO_DISCO, new T.MeshBasicMaterial({ map: TEX_DISCO, color: C(e.acento), transparent: true, depthWrite: false, opacity: 0.45, side: T.DoubleSide })); disco.position.set(0, -0.02, -0.8); cuerpo.add(disco); }
    g.scale.setScalar(ESC);
    scene.add(g);
    let sombra = null;
    if (!fantasma) { sombra = new T.Mesh(GEO_SOMBRA, M_SOMBRA); sombra.rotation.x = -Math.PI / 2; scene.add(sombra); }
    return { g, cuerpo, helice, disco, sombra, estela: fantasma ? null : nuevaEstela(e), puntas: G.puntas, fase: Math.random() * 6 };
  }
  function soltarAvioneta(a) {
    if (!a) return;
    scene.remove(a.g); if (a.sombra) scene.remove(a.sombra);
    if (a.disco) a.disco.material.dispose();
    if (a.estela) { scene.remove(a.estela.m); a.estela.m.geometry.dispose(); }
  }
  function verAvioneta(a, b) { a.g.visible = b; if (a.sombra) a.sombra.visible = b; if (a.estela) a.estela.m.visible = b; }
  let jugador = null, rivales = [], fantasma = null;
  function avionetas(idJugador, conRivales) {
    [jugador, fantasma].concat(rivales.map(r => r.a)).forEach(soltarAvioneta);
    const e = AVIONETAS.find(a => a.id === idJugador) || AVIONETAS[0], k = 0.55 * 1.45 / ESC;
    jugador = avioneta(e);
    rivales = conRivales ? AVIONETAS.filter(a => a !== e).map(a => { const av = avioneta(a); const t = cartel(a.nombre, 'rgba(255,253,247,0.92)', '#1d2b53'); t.scale.multiplyScalar(k); t.position.set(0, 1.2, 0); av.g.add(t); return { a: av, e: a, tag: t }; }) : [];
    fantasma = avioneta(e, true); const tf = cartel('👻 Tu mejor vuelo', 'rgba(29,43,83,0.75)', '#ffffff', 320); tf.scale.multiplyScalar(k); tf.position.set(0, 1.2, 0); fantasma.g.add(tf); fantasma.tag = tf; fantasma.g.visible = false;
    return rivales.map(r => r.e);
  }
  // la estela de colores: una cinta por punta de ala que siempre mira a la cámara y se desvanece hacia atrás
  const _d = new T.Vector3(), _v = new T.Vector3(), _l = new T.Vector3();
  function estelaCuadro(av, fuerza, ancho) {
    const E = av.estela; if (!E) return;
    av.g.updateMatrixWorld(true);
    const pos = E.m.geometry.attributes.position.array, col = E.m.geometry.attributes.color.array, nc = E.cs.length;
    for (let t = 0; t < 2; t++) {
      const p = av.puntas[t].clone().applyMatrix4(av.cuerpo.matrixWorld), L = E.pts[t];
      if (L.length && L[0].distanceToSquared(p) > 36) L.length = 0; // saltó (otra partida): se empieza de nuevo
      if (L.length < 2 || L[1].distanceToSquared(p) > 0.1) { L.unshift(p); if (L.length > N_TR) L.length = N_TR; } else L[0] = p;
      for (let i = 0; i < N_TR; i++) {
        const a = L[Math.min(i, L.length - 1)], b = L[Math.min(i + 1, L.length - 1)], u = i / (N_TR - 1);
        _d.subVectors(a, b); if (_d.lengthSq() < 1e-6) _d.set(0, 0, 1);
        _v.subVectors(cam.position, a); _l.crossVectors(_d, _v).normalize().multiplyScalar(ancho * (1 - u * 0.6));
        const o = ((t * N_TR + i) * 2) * 3;
        pos[o] = a.x + _l.x; pos[o + 1] = a.y + _l.y; pos[o + 2] = a.z + _l.z; pos[o + 3] = a.x - _l.x; pos[o + 4] = a.y - _l.y; pos[o + 5] = a.z - _l.z;
        const k = (u * nc * 1.5) % nc, c0 = E.cs[Math.floor(k)], c1 = E.cs[(Math.floor(k) + 1) % nc], f = k - Math.floor(k), al = i >= L.length - 1 ? 0 : fuerza * Math.pow(1 - u, 1.2);
        const q = ((t * N_TR + i) * 2) * 4;
        for (let j = 0; j < 2; j++) { col[q + j * 4] = c0.r + (c1.r - c0.r) * f; col[q + j * 4 + 1] = c0.g + (c1.g - c0.g) * f; col[q + j * 4 + 2] = c0.b + (c1.b - c0.b) * f; col[q + j * 4 + 3] = al; }
      }
    }
    E.m.geometry.attributes.position.needsUpdate = true; E.m.geometry.attributes.color.needsUpdate = true;
  }

  /* ---------- los aros ---------- */
  const GEO_ARO = [new T.TorusGeometry(3.1, 0.34, 8, 30), new T.TorusGeometry(4.5, 0.36, 6, 3), new T.TorusGeometry(3.7, 0.34, 6, 4), new T.TorusGeometry(3.6, 0.34, 6, 4)];
  const GIRO_ARO = [0, Math.PI / 2, Math.PI / 4, 0];
  const GEO_ROT = new T.PlaneGeometry(4.2, 4.2);
  let aros = [];
  function quitarAros() { aros.forEach(a => { scene.remove(a.g); a.rot.material.map.dispose(); a.rot.material.dispose(); a.aro.material.dispose(); }); aros = []; }
  function ponerAros(s, items, escala) {
    quitarAros();
    aros = items.map((it, k) => {
      const g = new T.Group(); g.position.set(it.x, it.y, -s); g.userData.e = escala || 1;
      const col = C(AROS[k].color);
      const aro = new T.Mesh(GEO_ARO[k], new T.MeshLambertMaterial({ color: col, emissive: col, emissiveIntensity: cieloAct && cieloAct.estrellas ? 0.7 : 0.25 }));
      aro.rotation.z = GIRO_ARO[k]; g.add(aro);
      const rot = new T.Mesh(GEO_ROT, new T.MeshBasicMaterial({ map: rotulo(k, it.texto), transparent: true, depthWrite: false }));
      rot.renderOrder = 2; g.add(rot);
      scene.add(g);
      return { g, aro, rot, k, texto: it.texto, estado: '', t: 0 };
    });
  }
  function marcar(i, estado) {
    const a = aros[i]; if (!a) return;
    a.estado = estado; a.t = 0;
    if (estado === 'tapado') { a.rot.material.map.dispose(); a.rot.material.map = rotulo(a.k, a.texto, true); a.aro.material.color.copy(C('#adb5bd')); a.aro.material.emissive.copy(C('#495057')); a.aro.material.emissiveIntensity = 0.1; a.aro.material.transparent = true; a.aro.material.opacity = 0.45; }
    if (estado === 'mal') { a.aro.material.color.copy(C('#868e96')); a.aro.material.emissiveIntensity = 0.05; }
    if (estado === 'bien' || estado === 'era') { a.aro.material.emissiveIntensity = 0.9; }
  }
  // ya pasó el avión: los rótulos se van y los aros se desvanecen (la cámara, que va detrás, no choca con ellos)
  function pasados() { aros.forEach(a => { a.pasado = 0; a.rot.visible = false; a.aro.material.transparent = true; }); }
  function aroAnimar(dt, tiempo) {
    aros.forEach(a => {
      a.t += dt;
      if (a.pasado != null) { a.pasado += dt; a.aro.material.opacity = Math.max(0, 1 - a.pasado * 2.5); a.g.visible = a.pasado < 0.4; }
      let s = 1;
      if (a.estado === 'elegido') s = 1 + (calma ? 0.06 : 0.08 * Math.sin(tiempo * 8));
      else if (a.estado === 'bien') s = 1 + Math.min(0.5, a.t * 1.4);
      else if (a.estado === 'era') s = 1 + (calma ? 0.12 : 0.14 * Math.abs(Math.sin(tiempo * 5)));
      a.g.scale.setScalar(s * (a.g.userData.e || 1));
      if (!calma && a.estado !== 'tapado') a.aro.rotation.z = GIRO_ARO[a.k] + (a.k === 0 ? tiempo * 0.6 : 0);
    });
  }

  /* ---------- la meta ---------- */
  const metaG = (() => {
    const g = new T.Group();
    const poste = new T.CylinderGeometry(0.7, 0.7, 24, 8), mp = M('#f8f9fa');
    [-18, 18].forEach(x => { const p = new T.Mesh(poste, mp); p.position.set(x, 12, 0); g.add(p); });
    const [c, gx] = lienzo(512, 64);
    for (let i = 0; i < 32; i++) for (let j = 0; j < 4; j++) { gx.fillStyle = (i + j) % 2 ? '#1d2b53' : '#ffffff'; gx.fillRect(i * 16, j * 16, 16, 16); }
    gx.fillStyle = '#ffd43b'; gx.fillRect(176, 4, 160, 56); gx.fillStyle = '#1d2b53'; gx.font = '800 40px "Baloo 2", system-ui, sans-serif'; gx.textAlign = 'center'; gx.textBaseline = 'middle'; gx.fillText('META', 256, 34);
    const banda = new T.Mesh(new T.BoxGeometry(37, 4, 0.4), new T.MeshLambertMaterial({ map: textura(c) })); banda.position.y = 22; g.add(banda);
    g.visible = false; scene.add(g); return g;
  })();
  function meta(s) { metaG.visible = s != null; if (s != null) metaG.position.z = -s; }

  /* ---------- efectos: chispas y el chorro de viento ---------- */
  // el chorro: un túnel de rayas de viento que corre hacia la cámara, y una onda que se abre al empezar
  const TEX_VIENTO = (() => {
    const [c, g] = lienzo(64, 256);
    for (let i = 0; i < 26; i++) {
      const x = Math.random() * 64, y = Math.random() * 256, l = 30 + Math.random() * 90, gr = g.createLinearGradient(0, y, 0, y + l);
      gr.addColorStop(0, 'rgba(255,255,255,0)'); gr.addColorStop(0.5, 'rgba(255,255,255,0.95)'); gr.addColorStop(1, 'rgba(255,255,255,0)');
      g.fillStyle = gr; g.fillRect(x, y, 1.5 + Math.random() * 2.5, l); if (y + l > 256) g.fillRect(x, y - 256, 1.5, l);
    }
    const t = textura(c); t.wrapS = t.wrapT = T.RepeatWrapping; t.repeat.set(4, 1); return t;
  })();
  const tunel = new T.Mesh(new T.CylinderGeometry(6, 3.4, 46, 20, 1, true), new T.MeshBasicMaterial({ map: TEX_VIENTO, color: C('#c5f6fa'), transparent: true, opacity: 0, depthWrite: false, side: T.BackSide, blending: T.AdditiveBlending, fog: false }));
  tunel.rotation.x = Math.PI / 2; tunel.visible = false; tunel.renderOrder = 2; scene.add(tunel);
  const onda = new T.Mesh(new T.TorusGeometry(1, 0.09, 6, 36), new T.MeshBasicMaterial({ color: C('#e3fafc'), transparent: true, opacity: 0, depthWrite: false, blending: T.AdditiveBlending }));
  onda.visible = false; scene.add(onda);
  let ondaT = 0, chorroAnt = false;
  const N_CH = 70, chispas = new T.Points(new T.BufferGeometry(), new T.PointsMaterial({ size: 0.45, vertexColors: true, transparent: true, depthWrite: false }));
  const chPos = new Float32Array(N_CH * 3), chCol = new Float32Array(N_CH * 3), chVel = new Float32Array(N_CH * 3); let chVida = 0;
  chispas.geometry.setAttribute('position', new T.BufferAttribute(chPos, 3)); chispas.geometry.setAttribute('color', new T.BufferAttribute(chCol, 3)); chispas.frustumCulled = false; chispas.visible = false; scene.add(chispas);
  function estallar(x, y, s, hex) {
    const cs = [C(hex || '#ffd43b'), C('#ffffff'), C('#ff8787'), C('#74c0fc')];
    for (let i = 0; i < N_CH; i++) {
      chPos[i * 3] = x; chPos[i * 3 + 1] = y; chPos[i * 3 + 2] = -s;
      const a = Math.random() * Math.PI * 2, r = azar(4, 11); chVel[i * 3] = Math.cos(a) * r; chVel[i * 3 + 1] = Math.sin(a) * r; chVel[i * 3 + 2] = azar(-4, 4);
      const c = cs[i % 4]; chCol[i * 3] = c.r; chCol[i * 3 + 1] = c.g; chCol[i * 3 + 2] = c.b;
    }
    chispas.geometry.attributes.color.needsUpdate = true; chVida = calma ? 0.6 : 1.1; chispas.visible = true;
  }
  const N_VI = 40, viento = new T.LineSegments(new T.BufferGeometry(), new T.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.6 }));
  const viPos = new Float32Array(N_VI * 6), viD = []; for (let i = 0; i < N_VI; i++) viD.push({ x: azar(-9, 9), y: azar(-5, 6), z: azar(-40, 6), l: azar(2, 5) });
  viento.geometry.setAttribute('position', new T.BufferAttribute(viPos, 3)); viento.frustumCulled = false; viento.visible = false; scene.add(viento);

  /* ---------- el público: cóndor, colibrí y guacamaya de la Biblioteca ---------- */
  const pajaro = (() => {
    const modelos = [], ESC = { condor: 4.2, colibri: 2.2, guacamaya: 3.2 };
    let vuelo = null, espera = 4;
    cargarGLB(op.biblio, Object.keys(ESC), (id, g) => {
      const m = g.scene, caja = new T.Box3().setFromObject(m), tam = Math.max(caja.max.x - caja.min.x, caja.max.y - caja.min.y, caja.max.z - caja.min.z) || 1;
      m.scale.setScalar(ESC[id] / tam); const h = new T.Group(); h.add(m); h.visible = false; scene.add(h); modelos.push(h);
    });
    return {
      reset() { if (vuelo) vuelo.m.visible = false; vuelo = null; espera = 3; },
      cuadro(dt, s, tiempo) {
        if (!modelos.length) return;
        if (!vuelo) {
          espera -= dt; if (espera > 0) return;
          const m = modelos[Math.floor(Math.random() * modelos.length)], lado = Math.random() < 0.5 ? -1 : 1;
          vuelo = { m, lado, x: lado * 42, y: azar(11, 20), z: -(s + azar(70, 110)), v: azar(7, 10) }; m.visible = true;
        }
        const f = vuelo; f.x -= f.lado * f.v * dt;
        f.m.position.set(f.x, f.y + Math.sin(tiempo * 3) * 0.6, f.z);
        f.m.rotation.set(0, f.lado > 0 ? -Math.PI / 2 : Math.PI / 2, calma ? 0 : Math.sin(tiempo * 6) * 0.25);
        if (Math.abs(f.x) > 46 || -f.z > s + 200 || -f.z < s - 10) { f.m.visible = false; vuelo = null; espera = azar(5, 10); }
      }
    };
  })();

  /* ---------- la cámara y el cuadro ---------- */
  const camPos = new T.Vector3(0, 10, 12), mira = new T.Vector3(), mira0 = new T.Vector3(0, 8, -20);
  let fov = 62, tiempo = 0, sacude = 0, sAnt = 0;
  let vitrina = null; // un ángulo: la cámara de cerca alrededor de la avioneta
  function tam() {
    const w = div.clientWidth || innerWidth, h = div.clientHeight || innerHeight;
    ren.setSize(w, h, false); cam.aspect = w / h;
    // en vertical (celular) se aleja un poco para que quepan los tres aros
    cam.userData.lejos = w / h < 1 ? 1.5 : w / h < 1.4 ? 1.15 : 1;
    cam.updateProjectionMatrix();
  }
  addEventListener('resize', tam); tam();

  function pose(av, x, y, s, banco, cabeceo, dt) {
    av.g.position.set(x, y, -s);
    av.g.rotation.set(0, 0, 0);
    // el alabeo al girar (y la nariz hacia el giro), un mecerse suave y la hélice; en calma, quieta y lenta
    const k = Math.min(1, dt * 6), mece = calma ? 0 : Math.sin(tiempo * 2.1 + av.fase) * 0.05;
    av.cuerpo.rotation.z += (-banco * 0.78 + mece - av.cuerpo.rotation.z) * k;
    av.cuerpo.rotation.x += (cabeceo * 0.35 - av.cuerpo.rotation.x) * k;
    av.cuerpo.rotation.y += (-banco * 0.2 - av.cuerpo.rotation.y) * k;
    av.cuerpo.position.y = calma ? 0 : Math.sin(tiempo * 1.7 + av.fase) * 0.06;
    av.helice.rotation.z += dt * (calma ? 5 : 38);
    if (av.disco) av.disco.material.opacity = calma ? 0.18 : 0.45;
    if (av.sombra) { const h = 1 + y * 0.07; av.sombra.position.set(x, 0.14, -s); av.sombra.scale.set(1.5 * h, 1.05 * h, 1); }
  }
  function cuadro(dt, E) {
    tiempo += dt;
    const s = E.s;
    if (jugador) pose(jugador, E.x, E.y, s, E.banco || 0, E.cabeceo || 0, dt);
    rivales.forEach((r, i) => { const d = E.rivales && E.rivales[i]; verAvioneta(r.a, !!d); if (d) { pose(r.a, d.x, d.y, d.s, d.banco || 0, 0, dt); r.tag.visible = d.s - s > 4; } });
    if (fantasma) { fantasma.g.visible = !!E.fantasma; if (E.fantasma) { pose(fantasma, E.fantasma.x, E.fantasma.y, E.fantasma.s, 0, 0, dt); fantasma.tag.visible = E.fantasma.s - s > 4; } }

    // reciclar decorado y nubes que quedaron atrás
    let cambio = false;
    for (const f of ficha) if (f.z > -s + 60) { ponerDeco(f); f.z -= LARGO; cambio = true; }
    if (cambio) escribirDeco();
    let cn = false;
    for (const f of nubeF) if (f.z > -s + 30) { ponerNube(f, -f.z + LARGO, false); cn = true; }
    if (cn) escribirNubes();
    suelo.position.set(Math.round(E.x / 20) * 20, 0, -Math.round(s / 20) * 20);
    franja.position.z = -Math.round(s / 20) * 20;

    // la cámara: detrás y arriba; con turbo se abre el ángulo
    const lejos = cam.userData.lejos || 1;
    v0.set(E.x * 0.7, E.y + 2.4 * lejos, -s + 8.6 * lejos);
    camPos.lerp(v0, Math.min(1, dt * (calma ? 3 : 5)));
    camPos.z = -s + 8.6 * lejos; // sin retraso hacia delante: así no se aleja con la velocidad
    mira.set(E.x * 0.85, E.y + 1.7, -s - 16); mira0.lerp(mira, Math.min(1, dt * 6)); // mira algo arriba: los aros quedan bajo la pregunta
    cam.position.copy(camPos);
    if (E.sacudir) sacude = calma ? 0 : 1;
    if (sacude > 0) { cam.position.x += (Math.random() - 0.5) * sacude * 0.6; cam.position.y += (Math.random() - 0.5) * sacude * 0.6; sacude = Math.max(0, sacude - dt * 2.2); }
    cam.lookAt(mira0);
    const fovObj = (E.chorro ? 76 : E.turbo ? 70 : 62) + (lejos > 1.2 ? 8 : 0);
    fov += (fovObj - fov) * Math.min(1, dt * 3); if (Math.abs(cam.fov - fov) > 0.05) { cam.fov = fov; cam.updateProjectionMatrix(); }
    if (vitrina != null && jugador) { // de cerca, alrededor de tu avioneta (las fotos y las pruebas)
      const p = jugador.g.position; cam.position.set(p.x + Math.sin(vitrina) * 4.4, p.y + 1.3, p.z + Math.cos(vitrina) * 4.4); cam.lookAt(p.x, p.y + 0.05, p.z);
      cam.fov = 45; cam.updateProjectionMatrix(); fov = 45;
    }
    domo.position.copy(cam.position); estrellas.position.copy(cam.position); luna.position.set(cam.position.x + 160, cam.position.y + 180, cam.position.z - 420);
    sol.position.set(E.x + 30, 60, -s + 20); sol.target.position.set(E.x, 0, -s - 20);

    // la estela de colores (más ancha y viva con turbo y con el chorro) y la sombra
    M_HELICE.opacity = calma ? 1 : 0.4;
    if (jugador) estelaCuadro(jugador, E.chorro ? 0.95 : E.turbo ? 0.85 : 0.45, E.chorro ? 0.26 : E.turbo ? 0.2 : 0.1);
    rivales.forEach(r => { if (r.a.g.visible) estelaCuadro(r.a, 0.4, 0.1); });
    // el chorro de viento: el túnel aparece, corre, y al empezar sale una onda
    const tObj = E.chorro && !calma ? 0.6 : 0, tm = tunel.material;
    tm.opacity += (tObj - tm.opacity) * Math.min(1, dt * 4); tunel.visible = tm.opacity > 0.01;
    if (tunel.visible) { tunel.position.set(E.x, E.y, -s - 16); TEX_VIENTO.offset.y -= dt * 2.4; tunel.rotation.y += dt * 0.6; }
    if (E.chorro && !chorroAnt && !calma) { ondaT = 0.7; onda.visible = true; }
    chorroAnt = !!E.chorro;
    if (ondaT > 0) { ondaT -= dt; const u = 1 - ondaT / 0.7; onda.position.set(E.x, E.y, -s - 1 - u * 3); onda.scale.setScalar(1 + u * 9); onda.material.opacity = Math.max(0, 0.9 * (1 - u)); if (ondaT <= 0) onda.visible = false; }
    // viento del chorro
    viento.visible = !!E.chorro && !calma;
    if (viento.visible) {
      const vv = (s - sAnt);
      viD.forEach((d, i) => { d.z += vv * 1.6 + dt * 30; if (d.z > 8) { d.z = -40; d.x = azar(-9, 9); d.y = azar(-5, 6); }
        viPos.set([E.x + d.x, E.y + d.y, -s + d.z, E.x + d.x, E.y + d.y, -s + d.z - d.l], i * 6); });
      viento.geometry.attributes.position.needsUpdate = true;
    }
    sAnt = s;
    // chispas
    if (chVida > 0) {
      chVida -= dt;
      for (let i = 0; i < N_CH; i++) { chPos[i * 3] += chVel[i * 3] * dt; chPos[i * 3 + 1] += chVel[i * 3 + 1] * dt; chPos[i * 3 + 2] += chVel[i * 3 + 2] * dt; chVel[i * 3 + 1] -= 9 * dt; }
      chispas.geometry.attributes.position.needsUpdate = true; chispas.material.opacity = Math.max(0, Math.min(1, chVida * 1.5));
      if (chVida <= 0) chispas.visible = false;
    }
    // lluvia y rayos
    if (lluvia.l.visible) {
      const p = lluvia.pos;
      lluvia.d.forEach((d, i) => { d.y -= dt * 38; if (d.y < -2) { d.y = azar(18, 30); d.x = azar(-30, 30); d.z = azar(-60, 10); } p.set([E.x + d.x, d.y, -s + d.z, E.x + d.x + 0.2, d.y + 1.4, -s + d.z + 0.6], i * 6); });
      lluvia.l.geometry.attributes.position.needsUpdate = true;
    }
    if (cieloAct && cieloAct.rayos && !calma) {
      proxRayo -= dt;
      if (proxRayo <= 0) { relampago = 0.18; proxRayo = azar(6, 11); }
    }
    if (relampago > 0) { relampago -= dt; hemi.intensity = 0.85 + (relampago > 0 ? 0.9 : 0); } else if (cieloAct && cieloAct.rayos) hemi.intensity = 0.85;
    aroAnimar(dt, tiempo);
    pajaro.cuadro(dt, s, tiempo);
    ren.render(scene, cam);
  }

  const ray = new T.Raycaster(), pt = new T.Vector2();
  function tocar(cx, cy) {
    const r = ren.domElement.getBoundingClientRect();
    pt.set(((cx - r.left) / r.width) * 2 - 1, -((cy - r.top) / r.height) * 2 + 1);
    ray.setFromCamera(pt, cam);
    const hits = ray.intersectObjects(aros.flatMap(a => [a.aro, a.rot]), false);
    if (!hits.length) return -1;
    return aros.findIndex(a => a.aro === hits[0].object || a.rot === hits[0].object);
  }

  return { vitrina(a) { vitrina = a == null ? null : +a; }, cielo, avionetas, aros: ponerAros, marcar, pasados, quitarAros, meta, estallar, cuadro, tocar, calma(b) { calma = !!b; }, estrecho: () => cam.aspect < 1, lienzo: ren.domElement };
}

/* Los GLB del público: GLTFLoader y meshopt de r128 (dentro de app2 junto a three.min.js; suelto, de jsdelivr). Si no
   cargan, no pasa nada: el rally se juega igual. */
function cargarScript(src) { return new Promise((si, no) => { const s = document.createElement('script'); s.src = src; s.onload = si; s.onerror = () => no(new Error('no cargó ' + src)); document.head.appendChild(s); }); }
function cargarGLB(biblio, ids, alCargar) {
  const J3 = window.Juegos3D || {}, cdn = 'https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/';
  const una = (f, dir, hay) => (hay() ? Promise.resolve() : (J3.enApp ? cargarScript('../' + f).then(() => { if (!hay()) throw new Error('vacío'); }) : Promise.reject(new Error('suelto')))
    .catch(() => cargarScript(cdn + dir + f)));
  una('GLTFLoader.js', 'loaders/', () => T.GLTFLoader).then(() => una('meshopt_decoder.js', 'libs/', () => window.MeshoptDecoder)).then(() => {
    const l = new T.GLTFLoader(); if (window.MeshoptDecoder) l.setMeshoptDecoder(window.MeshoptDecoder); l.setCrossOrigin('anonymous');
    ids.forEach(id => l.load(biblio + 'modelos/' + id + '.glb', g => alCargar(id, g), undefined, e => console.warn('Rally: sin ' + id + ' (' + (e && e.message) + ')')));
  }).catch(e => console.warn('Rally: el público no cargó (' + e.message + ')'));
}

window.Mundo = { crear, disponible: true, CIELOS, AVIONETAS, AROS, partir };
})();
