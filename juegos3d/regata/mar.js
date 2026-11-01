/* Regata del Viento — el mar en 3D (three r128, el de puente.js). Es el decorado, los veleros y las boyas; la pregunta
   y las opciones van en HTML encima (legibles y para el lector de pantalla).
   window.Mar.crear(div, {biblio, calma, brujula}) → { mar(id), veleros(id, vela, rivales), boyas(items), marcar(i, estado),
     quitarBoyas(), puerta(tipo, x, z, rumbo), islas(lista), estallar(x, z, color), cuadro(dt, E), tocar(cx, cy), calma(b) }
   Coordenadas: x = este, z = sur (el norte es −z); el rumbo en grados: 0 = norte, 90 = este. Todo low-poly de juguete:
   sombreado de dibujo animado (tres tonos), contorno oscuro en los veleros y las boyas, sin sombras. La brújula 3D
   (la flecha grande del viento con la nube que sopla) se pinta en un rincón, en el sitio del elemento `brujula`. */
(function () {
'use strict';
const T = window.THREE;
if (!T) { window.Mar = { disponible: false }; return; }
const C = h => new T.Color(h).convertSRGBToLinear();
const azar = (a, b) => a + Math.random() * (b - a);
const RAD = Math.PI / 180;
const dir = b => [Math.sin(b * RAD), -Math.cos(b * RAD)]; // rumbo → (x, z)

const MARES = {
  caribe: { nombre: 'Bahía de Cartagena', emoji: '🏝️', arriba: '#2f8fe6', horizonte: '#c6efff', agua: ['#0a6fa6', '#27c1c6'], ola: 0.3, islas: ['arena', 'arena', 'faro', 'casa'], fondo: 'muralla', luz: 1 },
  sanandres: { nombre: 'San Andrés, el mar de siete colores', emoji: '🐠', arriba: '#3a9cf0', horizonte: '#d2f6ff', agua: ['#0b5aa8', '#1fc8c8'], siete: true, ola: 0.26, islas: ['arena', 'casa', 'arena'], fondo: null, luz: 1 },
  pacifico: { nombre: 'Bahía Solano, en el Pacífico', emoji: '🐋', arriba: '#5f93b8', horizonte: '#cfe0e3', agua: ['#0b4a63', '#2c8584'], ola: 0.42, islas: ['selva', 'selva', 'faro'], fondo: 'selva', ballena: true, luz: 0.9 },
  atardecer: { nombre: 'Atardecer en Santa Marta', emoji: '🌅', arriba: '#41539e', horizonte: '#ffb070', agua: ['#283f78', '#d9845c'], ola: 0.3, islas: ['arena', 'faro', 'casa'], fondo: 'sierra', sol: true, luz: 0.8, faros: true },
  tormenta: { nombre: 'La tormenta', emoji: '⛈️', arriba: '#323a4e', horizonte: '#737c8f', agua: ['#18333f', '#3b5c66'], ola: 0.62, islas: ['selva', 'faro', 'arena'], fondo: 'selva', lluvia: true, rayos: true, luz: 0.7, faros: true }
};
// los veleros: cada uno con la cara y los colores de su animal de mar (como las avionetas del rally)
const VELEROS = [
  { id: 'delfin', nombre: 'Delfín rosado', emoji: '🐬', c: '#e64980', casco: '#f783ac', franja: '#ffffff', quilla: '#c2255c', cubierta: '#d9a066', cabina: '#ffdeeb', acento: '#7048e8', mejilla: '#ff8fab', aleta: true },
  { id: 'tortuga', nombre: 'Tortuga verde', emoji: '🐢', c: '#2f9e44', casco: '#51cf66', franja: '#ffd43b', quilla: '#2b8a3e', cubierta: '#d9a066', cabina: '#8ce99a', cabina2: '#37b24d', acento: '#f59f00', caparazon: true },
  { id: 'pelicano', nombre: 'Pelícano', emoji: '🐦', c: '#1c7ed6', casco: '#f8f9fa', franja: '#1c7ed6', quilla: '#1864ab', cubierta: '#d9a066', cabina: '#a5d8ff', acento: '#ff922b', pico: true },
  { id: 'loro', nombre: 'Pez loro', emoji: '🐠', c: '#0c8599', casco: '#22b8cf', franja: '#ff6b6b', quilla: '#0b7285', cubierta: '#d9a066', cabina: '#ffc9c9', acento: '#ff6b6b', escamas: '#3bc9db', labios: '#ff8787' }
];
// los diseños de vela (los de `desde` > 0 se ganan con boyas buenas en la sala)
const VELAS = [
  { id: 'lisa', nombre: 'Lisa', desde: 0 }, { id: 'rayas', nombre: 'Rayas', desde: 0 }, { id: 'estrellas', nombre: 'Estrellas', desde: 10 },
  { id: 'arcoiris', nombre: 'Arcoíris', desde: 25 }, { id: 'tricolor', nombre: 'Tricolor', desde: 45 }
];
// cada boya: color, forma y número (nada sólo por color)
const BOYAS = [
  { color: '#e8590c', forma: 'círculo', glifo: '●' }, { color: '#1971c2', forma: 'triángulo', glifo: '▲' },
  { color: '#2b8a3e', forma: 'cuadrado', glifo: '■' }, { color: '#7048e8', forma: 'rombo', glifo: '◆' }
];
const LETRAS = ['N', 'E', 'S', 'O'];

function lienzo(w, h) { const c = document.createElement('canvas'); c.width = w; c.height = h; return [c, c.getContext('2d')]; }
function textura(c) { const t = new T.CanvasTexture(c); t.encoding = T.sRGBEncoding; t.anisotropy = 2; return t; }
const EMOJI_DELANTE = /^((?:\p{Extended_Pictographic}|\p{Regional_Indicator}|[0-9#*]\uFE0F?\u20E3|\u200D|\uFE0F|[\u{1F3FB}-\u{1F3FF}])+)\s*/u;
/** «🐄 vaca» → {emoji: '🐄', texto: 'vaca'} (el emoji de delante va grande en el letrero). */
function partir(t) { const m = String(t).match(EMOJI_DELANTE); return m ? { emoji: m[1], texto: String(t).slice(m[0].length) } : { emoji: '', texto: String(t) }; }
const FUENTE = '"Baloo 2", system-ui, sans-serif', EMOJI = '"Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif';
function forma(g, k, x, y, r) {
  g.beginPath();
  if (k === 0) g.arc(x, y, r, 0, Math.PI * 2);
  else if (k === 1) { g.moveTo(x, y - r * 1.15); g.lineTo(x + r * 1.1, y + r * 0.75); g.lineTo(x - r * 1.1, y + r * 0.75); g.closePath(); }
  else if (k === 2) g.rect(x - r * 0.9, y - r * 0.9, r * 1.8, r * 1.8);
  else { g.moveTo(x, y - r * 1.15); g.lineTo(x + r * 1.15, y); g.lineTo(x, y + r * 1.15); g.lineTo(x - r * 1.15, y); g.closePath(); }
}
/** El letrero de la boya: la forma y el número arriba, el emoji grande y el texto; con su estado (✔, ✘, tapado). */
function rotulo(k, texto, estado) {
  const [c, g] = lienzo(256, 256), A = BOYAS[k] || { color: '#f59f00' }, { emoji, texto: tx } = partir(texto);
  const gris = estado === 'tapado' || estado === 'mal';
  g.fillStyle = gris ? 'rgba(222,226,232,0.9)' : 'rgba(255,253,247,0.96)'; g.beginPath(); g.arc(128, 128, 122, 0, Math.PI * 2); g.fill();
  g.lineWidth = 9; g.strokeStyle = gris ? '#868e96' : estado === 'bien' || estado === 'era' ? '#2b8a3e' : A.color; g.stroke();
  g.textAlign = 'center'; g.textBaseline = 'middle';
  if (k >= 0) { g.fillStyle = gris ? '#868e96' : A.color; forma(g, k, 128, 40, 26); g.fill(); g.fillStyle = '#fff'; g.font = '800 34px ' + FUENTE; g.fillText(String(k + 1), 128, k === 1 ? 46 : 42); }
  if (estado === 'tapado') { g.strokeStyle = '#495057'; g.lineWidth = 12; g.beginPath(); g.moveTo(80, 100); g.lineTo(176, 196); g.moveTo(176, 100); g.lineTo(80, 196); g.stroke(); return textura(c); }
  g.fillStyle = gris ? '#495057' : '#1d2b53';
  if (emoji) { g.font = (tx ? 74 : 104) + 'px ' + EMOJI; g.fillText(emoji, 128, tx ? 118 : 140); }
  if (tx) {
    const pal = tx.split(/\s+/), lin = [];
    let fs = emoji ? 40 : tx.length <= 4 ? 96 : tx.length <= 7 ? 70 : 52;
    const ancho = s => { g.font = '800 ' + fs + 'px ' + FUENTE; return g.measureText(s).width; };
    for (; fs >= 20; fs -= 3) {
      lin.length = 0; let cur = '';
      for (const p of pal) { const t = cur ? cur + ' ' + p : p; if (ancho(t) <= 200 || !cur) cur = t; else { lin.push(cur); cur = p; } }
      lin.push(cur);
      if (lin.length <= (emoji ? 2 : 3) && lin.every(l => ancho(l) <= 206)) break;
    }
    g.font = '800 ' + fs + 'px ' + FUENTE;
    const y0 = emoji ? 186 : 140 - (lin.length - 1) * fs * 0.55;
    lin.forEach((l, i) => g.fillText(l, 128, y0 + i * fs * 1.08));
  }
  if (estado === 'bien' || estado === 'era' || estado === 'mal') { // la marca, con forma además de color
    const ok = estado !== 'mal';
    g.fillStyle = ok ? '#2b8a3e' : '#868e96'; g.beginPath(); g.arc(214, 214, 36, 0, Math.PI * 2); g.fill();
    g.strokeStyle = '#fff'; g.lineWidth = 10; g.lineCap = 'round'; g.beginPath();
    if (ok) { g.moveTo(196, 214); g.lineTo(209, 228); g.lineTo(233, 199); } else { g.moveTo(201, 201); g.lineTo(227, 227); g.moveTo(227, 201); g.lineTo(201, 227); }
    g.stroke();
  }
  return textura(c);
}
function cartel(texto, fondo, tinta, w) {
  const [c, g] = lienzo(w || 256, 64);
  g.fillStyle = fondo; g.beginPath(); if (g.roundRect) g.roundRect(4, 6, c.width - 8, 52, 24); else g.rect(4, 6, c.width - 8, 52); g.fill();
  g.fillStyle = tinta; g.font = '800 30px ' + FUENTE; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(texto, c.width / 2, 34);
  const s = new T.Sprite(new T.SpriteMaterial({ map: textura(c), transparent: true, depthWrite: false }));
  s.scale.set(3.2 * c.width / 256, 0.8, 1); return s;
}

function crear(div, op) {
  const movil = matchMedia('(pointer: coarse)').matches;
  const ren = new T.WebGLRenderer({ antialias: !movil, powerPreference: 'low-power' });
  ren.setPixelRatio(Math.min(devicePixelRatio || 1, movil ? 1.25 : 1.6));
  ren.outputEncoding = T.sRGBEncoding; ren.autoClear = false;
  div.appendChild(ren.domElement);
  const scene = new T.Scene(), cam = new T.PerspectiveCamera(58, 1, 0.3, 900);
  scene.fog = new T.Fog(0xffffff, 100, 360);
  const hemi = new T.HemisphereLight(0xfff6e5, 0x4a7a8a, 0.9); scene.add(hemi);
  const sol = new T.DirectionalLight(0xfff1d6, 0.8); scene.add(sol); scene.add(sol.target);
  let calma = !!op.calma, marAct = MARES.caribe, tiempo = 0;
  const A0 = () => marAct.ola * (calma ? 0.45 : 1);
  /** La altura del agua (la misma cuenta que el shader). */
  function ola(x, z, t) { const A = A0(); return A * (0.5 * Math.sin(x * 0.21 + t * 1.3) + 0.5 * Math.sin(z * 0.17 - t * 1.1) + 0.35 * Math.sin((x + z) * 0.33 + t * 1.9)); }

  /* ---------- el cielo ---------- */
  const domo = new T.Mesh(new T.SphereGeometry(700, 24, 12), new T.MeshBasicMaterial({ vertexColors: true, side: T.BackSide, fog: false, depthWrite: false }));
  domo.renderOrder = -2; scene.add(domo);
  function pintarDomo(arriba, horiz) {
    const g = domo.geometry, p = g.attributes.position, col = new Float32Array(p.count * 3), a = C(arriba), h = C(horiz), m = new T.Color();
    for (let i = 0; i < p.count; i++) { const k = Math.max(0, Math.min(1, p.getY(i) / 700 * 1.7)); m.copy(h).lerp(a, Math.pow(k, 0.65)); col[i * 3] = m.r; col[i * 3 + 1] = m.g; col[i * 3 + 2] = m.b; }
    g.setAttribute('color', new T.BufferAttribute(col, 3));
  }
  // el sol (un disco con su halo) y el fondo de montes o murallas en el horizonte
  const solDisco = (() => {
    const [c, g] = lienzo(128, 128), r = g.createRadialGradient(64, 64, 6, 64, 64, 63);
    r.addColorStop(0, 'rgba(255,250,220,1)'); r.addColorStop(0.32, 'rgba(255,236,170,0.95)'); r.addColorStop(0.36, 'rgba(255,214,140,0.45)'); r.addColorStop(1, 'rgba(255,190,120,0)');
    g.fillStyle = r; g.fillRect(0, 0, 128, 128);
    const s = new T.Sprite(new T.SpriteMaterial({ map: textura(c), transparent: true, depthWrite: false, fog: false })); s.scale.set(150, 150, 1); scene.add(s); return s;
  })();
  const fondo = new T.Mesh(new T.CylinderGeometry(560, 560, 70, 48, 1, true), new T.MeshBasicMaterial({ transparent: true, side: T.BackSide, fog: false, depthWrite: false }));
  fondo.renderOrder = -1; scene.add(fondo);
  function pintarFondo(tipo, tinta) {
    if (fondo.material.map) fondo.material.map.dispose();
    fondo.visible = !!tipo; if (!tipo) return;
    const [c, g] = lienzo(1024, 128); g.fillStyle = tinta; g.beginPath(); g.moveTo(0, 128);
    if (tipo === 'muralla') { // la ciudad amurallada: la muralla almenada, garitas, torres y la cúpula
      g.fill(); g.beginPath();
      g.fillRect(0, 100, 1024, 28); for (let x = 0; x < 1024; x += 14) g.fillRect(x, 94, 8, 7);
      for (let x = 30; x < 1024; x += 256) { g.fillRect(x, 80, 18, 22); g.beginPath(); g.arc(x + 9, 80, 9, Math.PI, 0); g.fill(); g.fillRect(x + 90, 52, 26, 50); g.fillRect(x + 96, 40, 14, 14); g.fillRect(x + 160, 70, 46, 32); g.beginPath(); g.arc(x + 183, 70, 20, Math.PI, 0); g.fill(); }
      g.beginPath(); g.moveTo(0, 128);
    } else { // montes: la Sierra Nevada (con nieve) o la selva del Pacífico
      for (let x = 0; x <= 1024; x += 8) { const y = 92 - 26 * Math.abs(Math.sin(x * 0.012)) - 18 * Math.abs(Math.sin(x * 0.031 + 1)) - (tipo === 'sierra' ? 34 * Math.max(0, Math.sin(x * 0.0061)) : 0); g.lineTo(x, y); }
    }
    g.lineTo(1024, 128); g.fill();
    if (tipo === 'sierra') { g.globalCompositeOperation = 'source-atop'; g.fillStyle = 'rgba(255,255,255,0.85)'; g.fillRect(0, 0, 1024, 40); g.globalCompositeOperation = 'source-over'; }
    const t = textura(c); t.wrapS = T.RepeatWrapping; t.repeat.set(3, 1);
    fondo.material.map = t; fondo.material.needsUpdate = true;
  }
  // nubes de algodón: tres bolitas por nube
  const N_NUBES = movil ? 12 : 18;
  const nubes = new T.InstancedMesh(new T.IcosahedronGeometry(1, 1), new T.MeshLambertMaterial({ color: 0xffffff }), N_NUBES * 3);
  nubes.frustumCulled = false; scene.add(nubes);
  const nubeF = Array.from({ length: N_NUBES }, () => ({ a: azar(0, Math.PI * 2), r: azar(140, 400), y: azar(40, 90), t: azar(9, 18) }));
  const mat4 = new T.Matrix4(), q0 = new T.Quaternion(), v0 = new T.Vector3(), sc = new T.Vector3(), eY = new T.Euler();
  function escribirNubes(cx, cz) {
    nubeF.forEach((f, n) => {
      for (let b = 0; b < 3; b++) {
        const r = f.t * (b === 1 ? 0.8 : 0.55), ax = Math.cos(f.a + 1.57), az = Math.sin(f.a + 1.57), dx = (b - 1) * f.t * 0.8;
        eY.set(0, n + b, 0); q0.setFromEuler(eY);
        mat4.compose(v0.set(cx + Math.cos(f.a) * f.r + ax * dx, f.y + (b === 1 ? r * 0.3 : 0), cz + Math.sin(f.a) * f.r + az * dx), q0, sc.set(r * 1.3, r * 0.7, r)); nubes.setMatrixAt(n * 3 + b, mat4);
      }
    });
    nubes.instanceMatrix.needsUpdate = true;
  }

  /* ---------- el agua: olas en el shader (el truco del agua de la carrera), con espuma en las crestas ---------- */
  const TAM = 900, SEG = movil ? 96 : 150;
  const geoMar = new T.PlaneGeometry(TAM, TAM, SEG, SEG); geoMar.rotateX(-Math.PI / 2);
  const OLA_GLSL = 'float ola(vec2 p){ return A*(0.5*sin(p.x*0.21+t*1.3)+0.5*sin(p.y*0.17-t*1.1)+0.35*sin((p.x+p.y)*0.33+t*1.9)); }\n';
  const agua = new T.ShaderMaterial({
    uniforms: T.UniformsUtils.merge([T.UniformsLib.fog, { t: { value: 0 }, A: { value: 0.3 }, c1: { value: new T.Color() }, c2: { value: new T.Color() }, siete: { value: 0 } }]), fog: true,
    vertexShader: 'uniform float t; uniform float A;\nvarying vec3 vP; varying float vH;\n#include <fog_pars_vertex>\n' + OLA_GLSL +
      'void main(){ vec4 w = modelMatrix*vec4(position,1.0); float h = ola(w.xz); w.y += h; vH = h/max(A,0.001); vP = w.xyz;\n vec4 mvPosition = viewMatrix*w; gl_Position = projectionMatrix*mvPosition;\n#include <fog_vertex>\n}',
    fragmentShader: 'uniform float t; uniform vec3 c1; uniform vec3 c2; uniform float siete;\nvarying vec3 vP; varying float vH;\n#include <fog_pars_fragment>\n' +
      'void main(){\n float n = 0.5+0.5*sin(vP.x*0.031+sin(vP.z*0.023)*2.0)*sin(vP.z*0.027+t*0.05);\n vec3 col = mix(c1, c2, clamp(n*0.55 + vH*0.16 + 0.22, 0.0, 1.0));\n' +
      // San Andrés: franjas de azules y turquesas que cambian despacio con la distancia
      ' if (siete > 0.5) { float b = fract(vP.x*0.006 + sin(vP.z*0.011)*0.35 + vP.z*0.003); vec3 s = b < 0.2 ? vec3(0.02,0.16,0.42) : b < 0.4 ? vec3(0.0,0.30,0.62) : b < 0.6 ? vec3(0.0,0.52,0.70) : b < 0.8 ? vec3(0.05,0.68,0.66) : vec3(0.35,0.80,0.68); col = mix(col, s, 0.6); }\n' +
      ' float w = sin(vP.x*1.1+t*2.0)*sin(vP.z*0.9-t*1.5)+0.6*sin((vP.x-vP.z)*0.7+t*1.2);\n float brillo = smoothstep(1.3,1.6,w), cresta = smoothstep(0.75,1.0,vH);\n' +
      ' col = mix(col, vec3(1.0), brillo*0.22 + cresta*0.22);\n gl_FragColor = vec4(col,1.0);\n#include <encodings_fragment>\n#include <fog_fragment>\n}'
  });
  const marMalla = new T.Mesh(geoMar, agua); marMalla.frustumCulled = false; scene.add(marMalla);

  /* ---------- materiales de juguete ---------- */
  const RAMPA = (() => { const t = new T.DataTexture(new Uint8Array([120, 190, 255]), 3, 1, T.LuminanceFormat); t.minFilter = t.magFilter = T.NearestFilter; t.generateMipmaps = false; t.needsUpdate = true; return t; })();
  const M_TOON = new T.MeshToonMaterial({ vertexColors: true, gradientMap: RAMPA });
  const M_CONTORNO = new T.MeshBasicMaterial({ color: C('#1b1f3b'), side: T.BackSide });
  M_CONTORNO.onBeforeCompile = sh => { sh.vertexShader = sh.vertexShader.replace('#include <begin_vertex>', 'vec3 transformed = position + normal * 0.035;'); };
  const mtx = (x, y, z, rx, ry, rz, sx, sy, sz) => new T.Matrix4().compose(new T.Vector3(x, y, z),
    new T.Quaternion().setFromEuler(new T.Euler(rx || 0, ry || 0, rz || 0, 'ZYX')), new T.Vector3(sx == null ? 1 : sx, sy == null ? (sx == null ? 1 : sx) : sy, sz == null ? (sx == null ? 1 : sx) : sz));
  // funde piezas [geo, color o (x, y, z) → color, matriz, {sinContorno}] en una geometría con color por triángulo.
  // Con `contorno`: sin color y con las normales promediadas (para inflarla sin que se abra en las aristas).
  function fundir(piezas, contorno) {
    const gs = piezas.filter(pz => !(contorno && pz[3] && pz[3].sinContorno)).map(([geo, col, m]) => { const g = geo.index ? geo.toNonIndexed() : geo.clone(); if (m) g.applyMatrix4(m); return [g, col]; });
    const n = gs.reduce((a, [g]) => a + g.attributes.position.count, 0);
    const pos = new Float32Array(n * 3), nor = new Float32Array(n * 3), col = contorno ? null : new Float32Array(n * 3), cache = {};
    let o = 0;
    gs.forEach(([g, c]) => {
      const P = g.attributes.position.array, k = g.attributes.position.count;
      pos.set(P, o * 3); nor.set(g.attributes.normal.array, o * 3);
      if (col) for (let t = 0; t < k; t += 3) {
        const cx = (P[t * 3] + P[t * 3 + 3] + P[t * 3 + 6]) / 3, cy = (P[t * 3 + 1] + P[t * 3 + 4] + P[t * 3 + 7]) / 3, cz = (P[t * 3 + 2] + P[t * 3 + 5] + P[t * 3 + 8]) / 3;
        const hex = typeof c === 'function' ? c(cx, cy, cz) : c, cc = cache[hex] || (cache[hex] = C(hex));
        for (let j = 0; j < 3; j++) { col[(o + t + j) * 3] = cc.r; col[(o + t + j) * 3 + 1] = cc.g; col[(o + t + j) * 3 + 2] = cc.b; }
      }
      o += k; g.dispose();
    });
    if (contorno) {
      const acc = new Map(), key = i => Math.round(pos[i] * 300) + ',' + Math.round(pos[i + 1] * 300) + ',' + Math.round(pos[i + 2] * 300);
      for (let i = 0; i < pos.length; i += 3) { const kk = key(i), a = acc.get(kk) || [0, 0, 0]; a[0] += nor[i]; a[1] += nor[i + 1]; a[2] += nor[i + 2]; acc.set(kk, a); }
      for (let i = 0; i < pos.length; i += 3) { const a = acc.get(key(i)), l = Math.hypot(a[0], a[1], a[2]) || 1; nor[i] = a[0] / l; nor[i + 1] = a[1] / l; nor[i + 2] = a[2] / l; }
    }
    const out = new T.BufferGeometry();
    out.setAttribute('position', new T.BufferAttribute(pos, 3)); out.setAttribute('normal', new T.BufferAttribute(nor, 3));
    if (col) out.setAttribute('color', new T.BufferAttribute(col, 3));
    out.computeBoundingSphere(); return out;
  }
  const juguete = (piezas, sinContorno) => { const g = new T.Group(); g.add(new T.Mesh(fundir(piezas), M_TOON)); if (!sinContorno) g.add(new T.Mesh(fundir(piezas, true), M_CONTORNO)); piezas.forEach(([q]) => q.dispose()); return g; };
  const bola = (r, a, b) => new T.SphereGeometry(r, a || 12, b || 8);
  // una pluma u hoja: un huevo aplanado de base en el origen, a lo largo de +y
  function hoja(largo, ancho, grueso) { const g = new T.SphereGeometry(1, 10, 6); g.scale(ancho, largo / 2, grueso || 0.05); g.translate(0, largo / 2, 0); return g; }

  /* ---------- los veleros ---------- */
  // el casco: una bañera redonda y gorda (esfera aplanada arriba, fina en la proa, que sube un poco), con su
  // defensa de juguete alrededor, la cabina, el mástil y la cara del animal en la proa
  const GEO_V = {};
  function geoVelero(e) {
    if (GEO_V[e.id]) return GEO_V[e.id];
    const P = [], pon = (g, c, m, o) => P.push([g, c, m, o]);
    const casco = new T.SphereGeometry(1, 24, 14), p = casco.attributes.position;
    const borde = (z) => { const pr = Math.max(0, -z); return 0.86 * (1 - 0.5 * pr * pr); };
    for (let i = 0; i < p.count; i++) {
      let x = p.getX(i), y = p.getY(i), z = p.getZ(i);
      const pr = Math.max(0, -z);
      x *= borde(z); y = y > 0.22 ? 0.22 + (y - 0.22) * 0.1 : y * 0.8; y += 0.16 * pr * pr * (y > -0.1 ? 1 : 0.4);
      p.setXYZ(i, x, y + 0.42, z * 2.1);
    }
    casco.computeVertexNormals();
    pon(casco, (x, y, z) => {
      if (y > 0.62) return Math.floor(x * 7 + 10) % 2 ? e.cubierta : '#c98c52';
      if (y < 0.1) return e.quilla;
      if (e.escamas && y < 0.5 && (Math.sin(z * 9) + Math.sin(y * 30 + z * 4)) > 1.1) return e.escamas;
      return y > 0.5 ? e.franja : e.casco;
    });
    // la defensa: un tubo gordo por el borde de la cubierta
    const pts = []; for (let i = 0; i < 40; i++) { const a = i / 40 * Math.PI * 2, z = Math.cos(a) * 0.975, pr = Math.max(0, -z); pts.push(new T.Vector3(Math.sin(a) * 0.975 * borde(z), 0.65 + 0.16 * pr * pr, z * 2.1)); }
    pon(new T.TubeGeometry(new T.CatmullRomCurve3(pts, true), 60, 0.085, 7, true), e.franja === '#ffffff' ? e.acento : '#ffffff');
    // la cabina: una gota redonda con ventanitas; la de la tortuga es su caparazón
    pon(bola(1, 18, 10), (x, y, z) => {
      if (e.caparazon) { const u = Math.round(x * 4.2), v = Math.round(z * 3 + (u % 2) * 0.5); return (u + v) % 2 ? e.cabina2 : e.cabina; }
      return e.cabina;
    }, mtx(0, 0.74, 0.62, 0, 0, 0, 0.52, e.caparazon ? 0.42 : 0.34, 0.78));
    if (!e.caparazon) [-1, 1].forEach(sx => [0.38, 0.82].forEach(z => pon(bola(0.075, 10, 6), '#1d2b53', mtx(sx * 0.47, 0.84, z, 0, 0, 0, 0.4, 1, 1), { sinContorno: true })));
    if (e.aleta) pon(hoja(0.55, 0.06, 0.16), e.c, mtx(0, 0.97, 0.85, 0.95, 0, 0)); // la aleta del delfín
    // el mástil con su bola, y el timón atrás
    pon(new T.CylinderGeometry(0.07, 0.09, 3.9, 10), '#f1f3f5', mtx(0, 2.57, -0.35));
    pon(bola(0.15), e.acento, mtx(0, 4.54, -0.35));
    pon(new T.BoxGeometry(0.08, 0.6, 0.38), e.quilla, mtx(0, 0.25, 2.15, 0.15, 0, 0));
    // la cara en la proa: ojos (con su brillo), cejas alzadas y mejillas; el pico del pelícano, los labios del pez loro
    [-1, 1].forEach(sx => {
      const c = new T.Vector3(sx * 0.36, 0.82, -1.2), dd = new T.Vector3(sx * 0.8, 0.2, -1).normalize();
      pon(bola(0.23, 16, 10), '#ffffff', mtx(c.x, c.y, c.z, 0, sx * 0.6, 0, 1, 1.1, 0.75));
      const pu = c.clone().addScaledVector(dd, 0.12); pu.y -= 0.01;
      pon(bola(0.125, 12, 8), '#1b1f3b', mtx(pu.x, pu.y, pu.z, 0, sx * 0.6, 0, 1, 1.15, 0.6), { sinContorno: true });
      const br = pu.clone().addScaledVector(dd, 0.06); br.y += 0.05; br.x -= sx * 0.03;
      pon(bola(0.04, 6, 4), '#ffffff', mtx(br.x, br.y, br.z), { sinContorno: true });
      pon(bola(1, 8, 4), e.quilla, mtx(c.x, c.y + 0.3, c.z + 0.02, 0, sx * 0.6, -sx * 0.25, 0.16, 0.04, 0.05), { sinContorno: true });
      if (e.mejilla) pon(bola(0.12, 8, 6), e.mejilla, mtx(sx * 0.5, 0.5, -1.0, 0, sx * 0.6, 0, 1, 0.6, 0.35), { sinContorno: true });
    });
    if (e.pico) { // el pico largo con su bolsa
      pon(bola(1, 12, 8), e.acento, mtx(0, 0.74, -2.3, 0, 0, 0, 0.16, 0.11, 0.62));
      pon(bola(1, 12, 8), '#ffd8a8', mtx(0, 0.57, -2.15, 0, 0, 0, 0.13, 0.13, 0.42));
    }
    if (e.labios) pon(new T.TorusGeometry(0.12, 0.06, 8, 14), e.labios, mtx(0, 0.52, -2.08, 0, 0, 0, 1.2, 0.8, 1));
    const cuerpo = fundir(P), contorno = fundir(P, true);
    P.forEach(([g]) => g.dispose());
    return (GEO_V[e.id] = { cuerpo, contorno });
  }
  // la vela: una malla triangular que se infla hacia sotavento y flamea cuando no le da bien el viento
  const NV = 6, MAYOR = { L: 2.25, H: 3.5, y0: 0.94 }, FOQUE = { cabeza: [0, 2.45, 1.5], puno: [0, 0.12, 1.32] };
  function mallaVela() {
    const n = (NV + 1) * (NV + 1), g = new T.BufferGeometry(), pos = new Float32Array(n * 3), uv = new Float32Array(n * 2), idx = [];
    for (let r = 0; r <= NV; r++) for (let c = 0; c <= NV; c++) { const i = r * (NV + 1) + c, h = r / NV, w = c / NV; uv[i * 2] = w * (1 - h); uv[i * 2 + 1] = h; }
    for (let r = 0; r < NV; r++) for (let c = 0; c < NV; c++) { const a = r * (NV + 1) + c, b = a + 1, d = a + NV + 1, e = d + 1; idx.push(a, b, d, b, e, d); }
    g.setAttribute('position', new T.BufferAttribute(pos, 3)); g.setAttribute('uv', new T.BufferAttribute(uv, 2)); g.setIndex(idx);
    return g;
  }
  function moverMayor(g, comba, flamea, lado) {
    const p = g.attributes.position.array, { L, H, y0 } = MAYOR;
    for (let r = 0; r <= NV; r++) for (let c = 0; c <= NV; c++) {
      const i = (r * (NV + 1) + c) * 3, h = r / NV, w = c / NV, ancho = L * (1 - h);
      const panza = lado * comba * 0.32 * ancho * Math.sin(Math.PI * w) * (1 - 0.35 * h);
      const fl = flamea * 0.2 * Math.sin(tiempo * 24 + w * 7 + h * 5) * w * (1 - h * 0.7);
      p[i] = panza + fl; p[i + 1] = y0 + h * H; p[i + 2] = w * ancho;
    }
    g.attributes.position.needsUpdate = true; g.computeVertexNormals();
  }
  function moverFoque(g, comba, flamea, lado) {
    const p = g.attributes.position.array, [hx, hy, hz] = FOQUE.cabeza, [cx, cy, cz] = FOQUE.puno;
    for (let r = 0; r <= NV; r++) for (let c = 0; c <= NV; c++) {
      const i = (r * (NV + 1) + c) * 3, h = r / NV, w = c / NV;
      const lx = hx * h, ly = hy * h, lz = hz * h, ex = cx * (1 - h) + hx * h, ey = cy * (1 - h) + hy * h, ez = cz * (1 - h) + hz * h;
      const largo = Math.hypot(ex - lx, ey - ly, ez - lz);
      const panza = lado * comba * 0.3 * largo * Math.sin(Math.PI * w), fl = flamea * 0.16 * Math.sin(tiempo * 26 + w * 6 + h * 4) * w;
      p[i] = lx + (ex - lx) * w + panza + fl; p[i + 1] = ly + (ey - ly) * w; p[i + 2] = lz + (ez - lz) * w;
    }
    g.attributes.position.needsUpdate = true; g.computeVertexNormals();
  }
  // el dibujo de la vela (u: del mástil a la botavara; v: de abajo arriba); lleva el animal pintado
  function texVela(e, diseno) {
    const [c, g] = lienzo(256, 256), W = 256;
    const bandas = (cols, inclinado) => cols.forEach((col, i) => { g.fillStyle = col; g.beginPath(); const y0 = i * W / cols.length, y1 = (i + 1) * W / cols.length, d = inclinado ? 60 : 0; g.moveTo(0, y0); g.lineTo(W, y0 + d); g.lineTo(W, y1 + d); g.lineTo(0, y1); g.fill(); });
    if (diseno === 'rayas') bandas(['#ffffff', e.c, '#ffffff', e.c, '#ffffff', e.c, '#ffffff', e.c]);
    else if (diseno === 'estrellas') {
      g.fillStyle = '#1b2a6b'; g.fillRect(0, 0, W, W); g.fillStyle = '#ffd43b';
      for (let i = 0; i < 16; i++) { const x = (i * 67) % 230 + 10, y = (i * 43) % 230 + 14, r = 7 + (i % 3) * 3; g.beginPath(); for (let k = 0; k < 10; k++) { const a = k * Math.PI / 5 - Math.PI / 2, rr = k % 2 ? r * 0.45 : r; g.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr); } g.fill(); }
    } else if (diseno === 'arcoiris') bandas(['#e03131', '#f76707', '#fcc419', '#37b24d', '#1c7ed6', '#7048e8'], true);
    else if (diseno === 'tricolor') { g.fillStyle = '#fcd116'; g.fillRect(0, 0, W, W * 0.5); g.fillStyle = '#003893'; g.fillRect(0, W * 0.5, W, W * 0.25); g.fillStyle = '#ce1126'; g.fillRect(0, W * 0.75, W, W * 0.25); }
    else { g.fillStyle = '#fffdf7'; g.fillRect(0, 0, W, W); g.fillStyle = e.c; g.fillRect(0, W * 0.84, W, W * 0.16); g.fillRect(0, W * 0.74, W, W * 0.04); }
    // el animal en un círculo blanco
    g.fillStyle = 'rgba(255,255,255,0.92)'; g.beginPath(); g.arc(70, 150, 42, 0, Math.PI * 2); g.fill();
    g.lineWidth = 6; g.strokeStyle = e.c; g.stroke();
    g.font = '58px ' + EMOJI; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(e.emoji, 70, 154);
    return textura(c);
  }
  const TEX_BANDERA = (() => { const [c, g] = lienzo(64, 40); g.fillStyle = '#fcd116'; g.fillRect(0, 0, 64, 20); g.fillStyle = '#003893'; g.fillRect(0, 20, 64, 10); g.fillStyle = '#ce1126'; g.fillRect(0, 30, 64, 10); return textura(c); })();
  const M_ESTELA = new T.MeshBasicMaterial({ vertexColors: true, transparent: true, depthWrite: false, side: T.DoubleSide });
  const N_ES = 26;
  function nuevaEstela() {
    const nv = N_ES * 2, pos = new Float32Array(nv * 3), col = new Float32Array(nv * 4), idx = [];
    for (let i = 0; i < N_ES - 1; i++) { const a = i * 2; idx.push(a, a + 1, a + 2, a + 1, a + 3, a + 2); }
    const geo = new T.BufferGeometry(); geo.setAttribute('position', new T.BufferAttribute(pos, 3)); geo.setAttribute('color', new T.BufferAttribute(col, 4)); geo.setIndex(idx);
    const m = new T.Mesh(geo, M_ESTELA); m.frustumCulled = false; m.renderOrder = 1; scene.add(m);
    return { m, pts: [], t: 0 };
  }
  function velero(e, diseno) {
    const g = new T.Group(), cuerpo = new T.Group(); g.add(cuerpo);
    const G = geoVelero(e);
    cuerpo.add(new T.Mesh(G.cuerpo, M_TOON), new T.Mesh(G.contorno, M_CONTORNO));
    // la botavara (gira alrededor del mástil) con la vela mayor
    const bot = new T.Group(); bot.position.set(0, 0, -0.35); cuerpo.add(bot);
    const palo = new T.Mesh(new T.CylinderGeometry(0.065, 0.065, MAYOR.L + 0.1, 8), new T.MeshToonMaterial({ color: C(e.acento), gradientMap: RAMPA })); palo.rotation.x = Math.PI / 2; palo.position.set(0, MAYOR.y0 - 0.06, MAYOR.L / 2); bot.add(palo);
    const tex = texVela(e, diseno || 'lisa');
    const mayor = new T.Mesh(mallaVela(), new T.MeshToonMaterial({ map: tex, gradientMap: RAMPA, side: T.DoubleSide })); mayor.frustumCulled = false; bot.add(mayor);
    const foqueG = new T.Group(); foqueG.position.set(0, 0.74, -1.95); cuerpo.add(foqueG);
    const foque = new T.Mesh(mallaVela(), new T.MeshToonMaterial({ color: C(diseno === 'tricolor' ? '#fcd116' : diseno === 'estrellas' ? '#ffd43b' : e.c), gradientMap: RAMPA, side: T.DoubleSide })); foque.frustumCulled = false; foqueG.add(foque);
    // la bandera arriba: siempre apunta hacia donde va el viento (se lee el viento mirándola)
    const bandera = new T.Group(); bandera.position.set(0, 4.37, -0.35); cuerpo.add(bandera);
    const tela = new T.Mesh(new T.PlaneGeometry(0.7, 0.44, 6, 1), new T.MeshBasicMaterial({ map: TEX_BANDERA, side: T.DoubleSide })); tela.position.z = 0.36; tela.rotation.y = Math.PI / 2; bandera.add(tela);
    scene.add(g);
    return { g, cuerpo, bot, mayor, foqueG, foque, bandera, tela, tex, estela: nuevaEstela(), bota: 0, fase: Math.random() * 6 };
  }
  function soltarVelero(v) { if (!v) return; scene.remove(v.g); scene.remove(v.estela.m); v.estela.m.geometry.dispose(); v.tex.dispose(); v.mayor.geometry.dispose(); v.foque.geometry.dispose(); v.mayor.material.dispose(); v.foque.material.dispose(); }
  let jugador = null, rivales = [];
  function veleros(id, diseno, conRivales) {
    [jugador].concat(rivales.map(r => r.v)).forEach(soltarVelero);
    const e = VELEROS.find(a => a.id === id) || VELEROS[0];
    jugador = velero(e, diseno);
    rivales = conRivales ? VELEROS.filter(a => a !== e).map((a, i) => { const v = velero(a, ['rayas', 'lisa', 'rayas'][i]); const t = cartel(a.emoji + ' ' + a.nombre, 'rgba(255,253,247,0.92)', '#1d2b53'); t.scale.multiplyScalar(0.62); t.position.set(0, 5.5, 0); v.g.add(t); v.tag = t; return { v, e: a }; }) : [];
    return rivales.map(r => r.e);
  }
  function poseVelero(v, b, dt) {
    const y = ola(b.x, b.z, tiempo), [fx, fz] = dir(b.rumbo);
    v.g.position.set(b.x, y, b.z); v.g.rotation.y = -b.rumbo * RAD;
    const k = Math.min(1, dt * 5);
    const cabeceo = calma ? 0 : (ola(b.x + fx * 1.8, b.z + fz * 1.8, tiempo) - ola(b.x - fx * 1.8, b.z - fz * 1.8, tiempo)) * 0.28;
    v.cuerpo.rotation.x += (cabeceo - v.cuerpo.rotation.x) * k;
    v.cuerpo.rotation.z += ((b.escora || 0) + (calma ? 0 : Math.sin(tiempo * 1.6 + v.fase) * 0.035) - v.cuerpo.rotation.z) * k;
    // la botavara va hacia sotavento; si la vela flamea, se sacude
    v.bota += ((b.botavara || 0) * RAD - v.bota) * Math.min(1, dt * 3.5);
    v.bot.rotation.y = v.bota + (b.flamea ? b.flamea * 0.07 * Math.sin(tiempo * 9 + v.fase) : 0);
    const lado = Math.abs(v.bota) < 0.02 ? 0 : Math.sign(v.bota);
    moverMayor(v.mayor.geometry, b.comba || 0, calma ? (b.flamea || 0) * 0.4 : b.flamea || 0, lado);
    v.foqueG.rotation.y = v.bota * 0.7; moverFoque(v.foque.geometry, b.comba || 0, calma ? (b.flamea || 0) * 0.4 : b.flamea || 0, lado);
    // la bandera hacia donde sopla el viento
    v.bandera.rotation.y = (b.rumbo - vientoA) * RAD;
    v.tela.rotation.x = calma ? 0 : Math.sin(tiempo * 8 + v.fase) * 0.12;
    // la estela de espuma por detrás
    const es = v.estela; es.t += dt;
    if (es.t > 0.09) { es.t = 0; es.pts.unshift([b.x - fx * 2.0, b.z - fz * 2.0, b.v || 0]); if (es.pts.length > N_ES) es.pts.pop(); }
    const pos = es.m.geometry.attributes.position.array, col = es.m.geometry.attributes.color.array;
    for (let i = 0; i < N_ES; i++) {
      const p = es.pts[Math.min(i, es.pts.length - 1)] || [b.x, b.z, 0], q = es.pts[Math.min(i + 1, es.pts.length - 1)] || p;
      let dx = p[0] - q[0], dz = p[1] - q[1]; const l = Math.hypot(dx, dz) || 1; dx /= l; dz /= l;
      const u = i / (N_ES - 1), w = (0.35 + u * 1.6) * Math.min(1, p[2] / 6), yy = ola(p[0], p[1], tiempo) + 0.06;
      pos.set([p[0] - dz * w, yy, p[1] + dx * w, p[0] + dz * w, yy, p[1] - dx * w], i * 6);
      const a = es.pts.length > 1 ? (1 - u) * 0.55 * Math.min(1, p[2] / 3) : 0, cc = b.magia ? C(['#ff8787', '#ffd43b', '#69db7c', '#74c0fc', '#b197fc'][i % 5]) : null;
      for (let j = 0; j < 2; j++) col.set(cc ? [cc.r, cc.g, cc.b, a] : [1, 1, 1, a], (i * 2 + j) * 4);
    }
    es.m.geometry.attributes.position.needsUpdate = true; es.m.geometry.attributes.color.needsUpdate = true;
  }

  /* ---------- las boyas ---------- */
  const GEO_B = {};
  function geoBoya(hex) {
    if (GEO_B[hex]) return GEO_B[hex];
    const P = [], pon = (g, c, m) => P.push([g, c, m]);
    pon(bola(1, 18, 10), hex, mtx(0, 0.1, 0, 0, 0, 0, 1.25, 0.8, 1.25));
    pon(new T.CylinderGeometry(0.55, 0.8, 1.3, 16), (x, y) => (y > 1.0 && y < 1.4 ? '#ffffff' : hex), mtx(0, 1.1, 0));
    pon(new T.ConeGeometry(0.62, 0.8, 16), hex, mtx(0, 2.15, 0));
    pon(bola(0.24), '#fff3bf', mtx(0, 2.6, 0));
    const r = [fundir(P), fundir(P, true)]; P.forEach(([g]) => g.dispose());
    return (GEO_B[hex] = r);
  }
  const GEO_HIT = new T.SphereGeometry(3.4, 8, 6), M_HIT = new T.MeshBasicMaterial({ visible: false });
  let boyasV = [];
  function quitarBoyas() { boyasV.forEach(b => { scene.remove(b.g); b.sig.material.map.dispose(); b.sig.material.dispose(); b.aro.material.dispose(); }); boyasV = []; }
  /** items: [{x, z, texto, k, radio}] (k = −1: la de práctica, amarilla con estrella). */
  function ponerBoyas(items) {
    quitarBoyas();
    boyasV = items.map((it, i) => {
      const hex = it.k >= 0 ? BOYAS[it.k].color : '#fab005', G = geoBoya(hex), g = new T.Group();
      const cuerpo = new T.Group(); cuerpo.add(new T.Mesh(G[0], M_TOON), new T.Mesh(G[1], M_CONTORNO)); g.add(cuerpo);
      const sig = new T.Sprite(new T.SpriteMaterial({ map: rotulo(it.k, it.texto, ''), transparent: true, depthWrite: false }));
      sig.position.y = 5.0; sig.scale.setScalar(4.4); sig.renderOrder = 3; g.add(sig);
      const aro = new T.Mesh(new T.RingGeometry(Math.max(1.5, (it.radio || 4.5) - 0.5), it.radio || 4.5, 40), new T.MeshBasicMaterial({ color: C(hex), transparent: true, opacity: 0.5, depthWrite: false, side: T.DoubleSide }));
      aro.rotation.x = -Math.PI / 2; aro.position.y = 0.12; aro.renderOrder = 1; g.add(aro);
      const hit = new T.Mesh(GEO_HIT, M_HIT); hit.position.y = 2.5; g.add(hit);
      g.position.set(it.x, 0, it.z); scene.add(g);
      return { g, cuerpo, sig, aro, hit, k: it.k, i, texto: it.texto, x: it.x, z: it.z, estado: '', t: 0, fuera: null };
    });
  }
  function marcar(i, estado) {
    const b = boyasV[i]; if (!b) return;
    const antes = b.estado; b.estado = estado; b.t = 0;
    if (estado === 'tapado' || estado === 'mal' || estado === 'bien' || estado === 'era' || (antes && antes !== 'elegido')) { b.sig.material.map.dispose(); b.sig.material.map = rotulo(b.k, b.texto, estado === 'elegido' ? '' : estado); b.sig.material.needsUpdate = true; }
    if (estado === 'tapado' || estado === 'mal') b.aro.material.color.copy(C('#adb5bd'));
    if (estado === 'bien' || estado === 'era') b.aro.material.color.copy(C('#40c057'));
  }
  // las boyas de una pregunta ya contestada se hunden despacio
  function hundirBoyas() { boyasV.forEach(b => { if (b.fuera == null) b.fuera = 0; }); }
  function boyasCuadro(dt) {
    boyasV = boyasV.filter(b => {
      b.t += dt;
      const y = ola(b.x, b.z, tiempo);
      let s = 1, sube = 0;
      if (b.estado === 'elegido') { s = 1.12 + (calma ? 0 : 0.06 * Math.sin(tiempo * 7)); sube = 0.4; }
      else if (b.estado === 'bien') s = 1 + Math.min(0.35, b.t);
      else if (b.estado === 'era') s = 1.1 + (calma ? 0 : 0.1 * Math.abs(Math.sin(tiempo * 5)));
      b.cuerpo.position.y = y + sube; b.cuerpo.rotation.z = calma ? 0 : Math.sin(tiempo * 1.7 + b.x) * 0.06; b.cuerpo.rotation.x = calma ? 0 : Math.cos(tiempo * 1.3 + b.z) * 0.06;
      b.sig.position.y = y + 5 + sube; b.sig.scale.setScalar(4.4 * s * (cam.aspect < 1 ? 0.85 : 1));
      b.aro.position.y = y + 0.1; b.aro.material.opacity = b.estado === 'elegido' ? 0.85 : b.estado === 'tapado' || b.estado === 'mal' ? 0.2 : 0.45 + (calma ? 0 : 0.12 * Math.sin(tiempo * 3 + b.i));
      if (b.fuera != null) {
        b.fuera += dt; const u = b.fuera / 1.4;
        b.g.position.y = -u * 3.5; b.sig.material.opacity = Math.max(0, 1 - u * 1.4); b.aro.material.opacity *= Math.max(0, 1 - u);
        if (u >= 1) { scene.remove(b.g); b.sig.material.map.dispose(); b.sig.material.dispose(); b.aro.material.dispose(); return false; }
      }
      return true;
    });
  }

  /* ---------- la salida y la meta: dos boyas con banderas y el cartel ---------- */
  const puertas = {};
  function hacerPuerta(texto, fondo, ancho, conBanda) {
    const g = new T.Group(), P = [], pon = (q, c, m) => P.push([q, c, m]);
    [-ancho, ancho].forEach(x => {
      pon(bola(1, 14, 8), '#f8f9fa', mtx(x, 0.1, 0, 0, 0, 0, 1.1, 0.7, 1.1)); pon(new T.CylinderGeometry(0.14, 0.14, 7, 8), '#495057', mtx(x, 3.6, 0));
      pon(bola(0.3), '#ffd43b', mtx(x, 7.2, 0));
    });
    g.add(juguete(P));
    const [c, gx] = lienzo(512, 96);
    for (let i = 0; i < 32; i++) for (let j = 0; j < 6; j++) { gx.fillStyle = (i + j) % 2 ? '#1d2b53' : '#ffffff'; gx.fillRect(i * 16, j * 16, 16, 16); }
    gx.fillStyle = fondo; gx.fillRect(130, 8, 252, 80); gx.fillStyle = '#1d2b53'; gx.font = '800 54px ' + FUENTE; gx.textAlign = 'center'; gx.textBaseline = 'middle'; gx.fillText(texto, 256, 52);
    if (conBanda) { const banda = new T.Mesh(new T.PlaneGeometry(ancho * 2, 3.4), new T.MeshBasicMaterial({ map: textura(c), side: T.DoubleSide })); banda.position.y = 7.4; g.add(banda); }
    else { const s = cartel(texto, 'rgba(165,216,255,0.95)', '#1d2b53'); [-ancho, ancho].forEach(x => { const k = s.clone(); k.position.set(x, 8.4, 0); g.add(k); }); }
    g.visible = false; scene.add(g); return g;
  }
  function puerta(tipo, x, z, rumbo) {
    if (!puertas[tipo]) puertas[tipo] = tipo === 'meta' ? hacerPuerta('🏁 META', '#ffd43b', 9, true) : hacerPuerta('SALIDA', '#a5d8ff', 15, false);
    const g = puertas[tipo]; g.visible = x != null;
    if (x != null) { g.position.set(x, 0, z); g.rotation.y = -rumbo * RAD; }
  }

  /* ---------- las islas: arena con palmeras, faro, casita de palafito o el morro de selva del Pacífico ---------- */
  function palmera(P, x, z, h, giro, alto) {
    const n = 6; let px = x, py = alto, pz = z;
    for (let i = 0; i < n; i++) { const t = i / n, nx = x + Math.sin(giro) * h * 0.35 * t * t, nz = z + Math.cos(giro) * h * 0.35 * t * t, ny = alto + h * (i + 1) / n;
      P.push([new T.CylinderGeometry(0.16 - t * 0.05, 0.2 - t * 0.05, h / n + 0.05, 7), i % 2 ? '#a9743f' : '#8f5f32', mtx((px + nx) / 2, (py + ny) / 2, (pz + nz) / 2, Math.cos(giro) * t * 0.6, 0, -Math.sin(giro) * t * 0.6)]); px = nx; py = ny; pz = nz; }
    for (let k = 0; k < 7; k++) { const a = k / 7 * Math.PI * 2; P.push([hoja(1.9, 0.32, 0.06), k % 2 ? '#2f9e44' : '#40c057', mtx(px, py, pz, 0, a, 0)]); P[P.length - 1][2] = new T.Matrix4().compose(new T.Vector3(px, py, pz), new T.Quaternion().setFromEuler(new T.Euler(1.95, a, 0, 'YXZ')), new T.Vector3(1, 1, 1)); }
    P.push([bola(0.17), '#7c4a1f', mtx(px + 0.15, py - 0.15, pz)], [bola(0.17), '#7c4a1f', mtx(px - 0.1, py - 0.2, pz + 0.12)]);
  }
  const GEO_I = {};
  function geoIsla(tipo) {
    if (GEO_I[tipo]) return GEO_I[tipo];
    const P = [], pon = (q, c, m) => P.push([q, c, m]);
    if (tipo === 'selva') {
      pon(bola(1, 14, 8), '#6b5a4a', mtx(0, -0.2, 0, 0, 0, 0, 1, 0.5, 1));
      pon(bola(1, 16, 10), '#2b8a3e', mtx(0, 0.4, 0, 0, 0, 0, 0.85, 1.1, 0.85));
      for (let k = 0; k < 7; k++) { const a = k * 0.9, r = 0.55; pon(bola(0.32, 10, 6), k % 2 ? '#37b24d' : '#2f9e44', mtx(Math.cos(a) * r, 0.75 + (k % 3) * 0.22, Math.sin(a) * r)); }
      pon(new T.DodecahedronGeometry(0.22), '#495057', mtx(0.95, 0.05, 0.2)); pon(new T.DodecahedronGeometry(0.16), '#495057', mtx(-0.8, 0.02, 0.55));
    } else {
      pon(bola(1, 18, 8), '#f4dfa0', mtx(0, -0.05, 0, 0, 0, 0, 1, 0.22, 1));
      pon(bola(1, 14, 8), '#69db7c', mtx(0.1, 0.12, -0.05, 0, 0, 0, 0.55, 0.18, 0.5));
      if (tipo === 'faro') {
        pon(new T.DodecahedronGeometry(0.3), '#868e96', mtx(-0.35, 0.15, 0.1));
        pon(new T.CylinderGeometry(0.17, 0.24, 1.6, 12), (x, y) => (Math.floor((y - 0.2) * 3.2) % 2 ? '#e03131' : '#ffffff'), mtx(-0.35, 1.0, 0.1));
        pon(new T.CylinderGeometry(0.2, 0.2, 0.22, 10), '#ffe066', mtx(-0.35, 1.9, 0.1)); pon(new T.ConeGeometry(0.26, 0.3, 10), '#c92a2a', mtx(-0.35, 2.15, 0.1));
      }
      if (tipo === 'casa') {
        [[-0.3, -0.3], [0.3, -0.3], [-0.3, 0.2], [0.3, 0.2]].forEach(([x, z]) => pon(new T.CylinderGeometry(0.03, 0.03, 0.4, 5), '#8f5f32', mtx(x - 0.3, 0.2, z + 0.4)));
        pon(new T.BoxGeometry(0.75, 0.42, 0.65), '#ffd8a8', mtx(-0.3, 0.6, 0.35)); pon(new T.ConeGeometry(0.62, 0.42, 4), '#e8590c', mtx(-0.3, 1.02, 0.35, 0, Math.PI / 4, 0));
        pon(new T.BoxGeometry(0.16, 0.24, 0.02), '#7c4a1f', mtx(-0.3, 0.52, 0.68));
      }
    }
    const pal = []; if (tipo !== 'selva') { palmera(pal, 0.3, -0.2, 1.4, 0.8, 0.2); palmera(pal, 0.6, 0.35, 1.1, 2.4, 0.15); if (tipo === 'arena') palmera(pal, -0.45, 0.1, 1.25, 4, 0.18); }
    // las palmeras se ven delgadas si se escalan con la isla: van aparte, a escala propia
    const r = { g: fundir(P), pal: pal.length ? fundir(pal) : null }; P.concat(pal).forEach(([g]) => g.dispose());
    return (GEO_I[tipo] = r);
  }
  const luzFaro = new T.MeshBasicMaterial({ color: C('#fff3bf'), transparent: true, opacity: 0.22, depthWrite: false, side: T.DoubleSide, blending: T.AdditiveBlending });
  const GEO_HAZ = (() => { const g = new T.ConeGeometry(2.2, 22, 12, 1, true); g.rotateZ(Math.PI / 2); g.translate(11, 0, 0); return g; })();
  let islasV = [];
  /** lista: [{x, z, r, tipo}] — reemplaza las islas que hay. */
  function islas(lista) {
    islasV.forEach(i => scene.remove(i.g)); islasV = [];
    lista.forEach(it => {
      const G = geoIsla(it.tipo), g = new T.Group(), a = azar(0, Math.PI * 2);
      const m = new T.Mesh(G.g, M_TOON); m.scale.set(it.r, it.tipo === 'selva' ? it.r * 0.9 : it.r * 0.85, it.r); g.add(m);
      if (G.pal) { const p = new T.Mesh(G.pal, M_TOON); p.scale.setScalar(Math.min(it.r, 5.5)); p.position.y = 0; g.add(p); }
      let haz = null;
      if (it.tipo === 'faro') { haz = new T.Mesh(GEO_HAZ, luzFaro); haz.position.set(-0.35 * it.r, 1.9 * it.r * 0.85, 0.1 * it.r); haz.visible = !!marAct.faros; g.add(haz); }
      g.position.set(it.x, -0.25, it.z); g.rotation.y = a; scene.add(g);
      islasV.push({ g, haz, x: it.x, z: it.z });
    });
  }

  /* ---------- el viento sobre el mar, la zona sin avance, la ruta y la flecha al destino ---------- */
  let vientoA = 0;
  const N_VI = movil ? 22 : 34, viento = new T.LineSegments(new T.BufferGeometry(), new T.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.55 }));
  const viPos = new Float32Array(N_VI * 6), viD = []; for (let i = 0; i < N_VI; i++) viD.push({ x: azar(-40, 40), y: azar(0.2, 2.5), z: azar(-40, 40), l: azar(2.5, 5) });
  viento.geometry.setAttribute('position', new T.BufferAttribute(viPos, 3)); viento.frustumCulled = false; scene.add(viento);
  const TEX_ZONA = (() => { const [c, g] = lienzo(64, 64); g.fillStyle = 'rgba(224,49,49,0.45)'; g.fillRect(0, 0, 64, 64); g.strokeStyle = 'rgba(255,255,255,0.8)'; g.lineWidth = 6; for (let i = -64; i < 128; i += 16) { g.beginPath(); g.moveTo(i, 0); g.lineTo(i + 64, 64); g.stroke(); } const t = textura(c); t.wrapS = t.wrapT = T.RepeatWrapping; t.repeat.set(3, 1); return t; })();
  const zona = new T.Mesh(new T.BufferGeometry(), new T.MeshBasicMaterial({ map: TEX_ZONA, transparent: true, depthWrite: false, side: T.DoubleSide }));
  zona.renderOrder = 1; scene.add(zona); let zonaN = -1;
  const zonaX = cartel('✋ Contra el viento', 'rgba(201,42,42,0.9)', '#ffffff', 320); zonaX.scale.multiplyScalar(0.9); scene.add(zonaX);
  function hacerZona(n) {
    zona.geometry.dispose(); const g = new T.RingGeometry(3.6, 6.6, 18, 1, (90 - n) * RAD, 2 * n * RAD); g.rotateX(-Math.PI / 2); zona.geometry = g; zonaN = n;
  }
  const N_PT = 70, puntos = new T.InstancedMesh((() => { const g = new T.CircleGeometry(0.42, 10); g.rotateX(-Math.PI / 2); return g; })(), new T.MeshBasicMaterial({ color: C('#fff3bf'), transparent: true, opacity: 0.9, depthWrite: false }), N_PT);
  puntos.frustumCulled = false; puntos.count = 0; puntos.renderOrder = 1; scene.add(puntos);
  const flecha = (() => {
    const s = new T.Shape(); s.moveTo(0, 1.6); s.lineTo(1.1, 0.2); s.lineTo(0.4, 0.2); s.lineTo(0.4, -1); s.lineTo(-0.4, -1); s.lineTo(-0.4, 0.2); s.lineTo(-1.1, 0.2); s.closePath();
    const g = new T.ExtrudeGeometry(s, { depth: 0.18, bevelEnabled: true, bevelThickness: 0.08, bevelSize: 0.08, bevelSegments: 2 }); g.rotateX(-Math.PI / 2);
    const m = new T.Mesh(g, new T.MeshToonMaterial({ color: C('#ffd43b'), gradientMap: RAMPA, emissive: C('#7a5800'), emissiveIntensity: 0.25 })); m.visible = false; scene.add(m); return m;
  })();

  /* ---------- la brújula 3D en su rincón: la rosa con N E S O, la flecha grande del viento y la nube que sopla ---------- */
  const bru = (() => {
    const sc2 = new T.Scene(), c2 = new T.PerspectiveCamera(40, 1, 0.5, 60);
    c2.position.set(0, 11, 9.5); c2.lookAt(0, 0, 0.3);
    sc2.add(new T.HemisphereLight(0xffffff, 0x8899aa, 1.0)); const dl = new T.DirectionalLight(0xffffff, 0.6); dl.position.set(3, 8, 5); sc2.add(dl);
    const rosa = new T.Group(); sc2.add(rosa);
    const P = [];
    P.push([new T.CylinderGeometry(3.3, 3.3, 0.3, 40), '#fffdf7', mtx(0, -0.15, 0)], [new T.TorusGeometry(3.3, 0.22, 8, 40), '#24386e', mtx(0, 0, 0, Math.PI / 2, 0, 0)]);
    for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4, l = i % 2 ? 0.45 : 0.8; P.push([new T.BoxGeometry(0.09, 0.05, l), '#24386e', mtx(Math.sin(a) * (3.0 - l / 2), 0.03, -Math.cos(a) * (3.0 - l / 2), 0, -a, 0)]); }
    rosa.add(juguete(P, true));
    LETRAS.forEach((L, i) => {
      const [c, g] = lienzo(64, 64); g.fillStyle = L === 'N' ? '#c92a2a' : '#24386e'; g.beginPath(); g.arc(32, 32, 28, 0, 7); g.fill();
      g.fillStyle = '#fff'; g.font = '800 40px ' + FUENTE; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(L, 32, 35);
      const s = new T.Sprite(new T.SpriteMaterial({ map: textura(c), depthTest: false })); s.scale.setScalar(1.25); const a = i * Math.PI / 2; s.position.set(Math.sin(a) * 3.95, 0.4, -Math.cos(a) * 3.95); s.renderOrder = 5; rosa.add(s);
    });
    // la flecha del viento: gorda, azul con franjas blancas; la nube con cara sopla desde la cola
    const vi = new T.Group(); rosa.add(vi);
    const FP = [];
    FP.push([new T.CylinderGeometry(0.38, 0.38, 3.0, 14), (x, y) => (Math.floor((y + 1.5) * 2) % 2 ? '#ffffff' : '#228be6'), mtx(0, 0.9, 0.4, Math.PI / 2, 0, 0)]);
    FP.push([new T.ConeGeometry(0.95, 1.5, 16), '#1971c2', mtx(0, 0.9, 2.5, Math.PI / 2, 0, 0)]);
    FP.push([bola(0.95, 14, 10), '#ffffff', mtx(0, 1.05, -2.0, 0, 0, 0, 1.15, 0.85, 0.9)], [bola(0.7, 12, 8), '#ffffff', mtx(-0.85, 0.85, -2.25)], [bola(0.7, 12, 8), '#ffffff', mtx(0.85, 0.85, -2.25)], [bola(0.6, 12, 8), '#ffffff', mtx(0, 1.75, -2.25)]);
    [-1, 1].forEach(sx => { FP.push([bola(0.13), '#1b1f3b', mtx(sx * 0.35, 1.35, -1.12)], [bola(0.17, 8, 6), '#ffa8a8', mtx(sx * 0.62, 0.9, -1.2, 0, 0, 0, 1, 0.7, 0.4)]); });
    FP.push([new T.TorusGeometry(0.17, 0.08, 8, 12), '#1b1f3b', mtx(0, 0.82, -1.08)]);
    vi.add(juguete(FP));
    // tu barquito en el centro: hacia dónde apunta la proa
    const BP = [[bola(1, 12, 8), '#fffdf7', mtx(0, 0.25, 0, 0, 0, 0, 0.42, 0.22, 0.95)], [new T.ConeGeometry(0.3, 0.7, 10), '#fffdf7', mtx(0, 0.25, -1.1, -Math.PI / 2, 0, 0)], [new T.ConeGeometry(0.42, 0.6, 3), '#ffd43b', mtx(0, 0.75, 0.1, 0, Math.PI / 2, 0, 0.5, 1.3, 1)]];
    const barco = juguete(BP); rosa.add(barco);
    return { sc2, c2, rosa, vi, barco };
  })();
  let rectB = null;
  function medirBrujula() { rectB = op.brujula && op.brujula.getClientRects().length ? op.brujula.getBoundingClientRect() : null; }

  /* ---------- los animales: delfines rosados y peces (GLB de la Biblioteca), pelícanos, tortugas y la ballena ---------- */
  const glb = {};
  cargarGLB(op.biblio, ['delfin-rosado', 'pez'], (id, g) => {
    const m = g.scene, caja = new T.Box3().setFromObject(m), tam = Math.max(caja.max.x - caja.min.x, caja.max.y - caja.min.y, caja.max.z - caja.min.z) || 1;
    m.scale.setScalar((id === 'pez' ? 1.5 : 3.6) / tam); const c = caja.getCenter(new T.Vector3()).multiplyScalar(m.scale.x); m.position.sub(c);
    const lista = id === 'pez' ? [0, 1, 2].map(() => { const h = new T.Group(), k = m.clone(); k.rotation.y = Math.PI / 2; h.add(k); h.visible = false; scene.add(h); return h; }) : [(() => { const h = new T.Group(), k = new T.Group(); k.add(m); k.rotation.y = Math.PI / 2; h.add(k); h.visible = false; scene.add(h); return h; })()];
    glb[id] = lista;
  });
  // el pelícano de juguete: cuerpo blanco, pico largo con bolsa y alas que aletean
  function hacerPelicano() {
    const g = new T.Group();
    g.add(juguete([[bola(1, 12, 8), '#f1f3f5', mtx(0, 0, 0, 0, 0, 0, 0.45, 0.42, 0.95)], [bola(0.3), '#f1f3f5', mtx(0, 0.35, -0.8)], [bola(1, 10, 6), '#ffa94d', mtx(0, 0.28, -1.45, 0, 0, 0, 0.1, 0.08, 0.55)],
      [bola(1, 10, 6), '#ffd8a8', mtx(0, 0.16, -1.35, 0, 0, 0, 0.09, 0.1, 0.4)], [bola(0.06), '#1b1f3b', mtx(0.17, 0.45, -0.95)], [bola(0.06), '#1b1f3b', mtx(-0.17, 0.45, -0.95)]]));
    const alas = [-1, 1].map(sx => { const a = new T.Group(); a.position.set(sx * 0.35, 0.1, 0); a.add(juguete([[bola(1, 10, 6), '#dee2e6', mtx(sx * 1.0, 0, 0, 0, 0, 0, 1.05, 0.08, 0.42)], [bola(1, 8, 6), '#343a40', mtx(sx * 1.9, 0, 0.05, 0, 0, 0, 0.3, 0.07, 0.3)]])); g.add(a); return a; });
    g.userData.alas = alas; g.visible = false; scene.add(g); return g;
  }
  const pelicanos = [hacerPelicano(), hacerPelicano(), hacerPelicano()];
  function hacerTortuga() {
    const g = new T.Group(), P = [[bola(1, 14, 8), (x, y, z) => ((Math.round(x * 3) + Math.round(z * 3)) % 2 ? '#2b8a3e' : '#40c057'), mtx(0, 0, 0, 0, 0, 0, 0.9, 0.38, 1.1)], [bola(0.32), '#8ce99a', mtx(0, 0.05, -1.2)],
      [bola(0.06), '#1b1f3b', mtx(0.14, 0.18, -1.42)], [bola(0.06), '#1b1f3b', mtx(-0.14, 0.18, -1.42)]];
    g.add(juguete(P));
    const aletas = [[-1, -0.5], [1, -0.5], [-1, 0.7], [1, 0.7]].map(([sx, z]) => { const a = new T.Group(); a.position.set(sx * 0.75, -0.05, z); a.add(new T.Mesh(fundir([[bola(1, 8, 6), '#8ce99a', mtx(sx * 0.35, 0, 0, 0, 0, 0, 0.45, 0.08, 0.22)]]), M_TOON)); g.add(a); return a; });
    g.userData.aletas = aletas; g.scale.setScalar(1.8); g.visible = false; scene.add(g); return g;
  }
  const tortugas = [hacerTortuga(), hacerTortuga()];
  const ballena = (() => {
    const g = new T.Group();
    g.add(juguete([[bola(1, 12, 8), '#364fc7', mtx(0, -0.6, 1.4, 0, 0, 0, 0.55, 0.45, 1.4)], [new T.CylinderGeometry(0.2, 0.3, 1.6, 8), '#364fc7', mtx(0, 0.4, 0)],
      [bola(1, 10, 6), '#3b5bdb', mtx(0.9, 1.25, 0, 0, 0, 0.35, 1.0, 0.12, 0.45)], [bola(1, 10, 6), '#3b5bdb', mtx(-0.9, 1.25, 0, 0, 0, -0.35, 1.0, 0.12, 0.45)]]));
    g.scale.setScalar(2.4); g.visible = false; scene.add(g); return g;
  })();
  const N_GO = 60, gotas = new T.Points(new T.BufferGeometry(), new T.PointsMaterial({ size: 0.4, vertexColors: true, transparent: true, depthWrite: false }));
  const goPos = new Float32Array(N_GO * 3), goCol = new Float32Array(N_GO * 3), goVel = new Float32Array(N_GO * 3); let goVida = 0;
  gotas.geometry.setAttribute('position', new T.BufferAttribute(goPos, 3)); gotas.geometry.setAttribute('color', new T.BufferAttribute(goCol, 3)); gotas.frustumCulled = false; gotas.visible = false; scene.add(gotas);
  /** Una explosión de confeti (o de gotas, sin color) en x, z. */
  function estallar(x, z, hex, y) {
    const cs = hex ? [C(hex), C('#ffffff'), C('#ffd43b'), C('#ff8787')] : [C('#ffffff'), C('#d0ebff'), C('#a5d8ff'), C('#ffffff')];
    for (let i = 0; i < N_GO; i++) {
      goPos.set([x + azar(-0.5, 0.5), (y || 1) + azar(0, 0.5), z + azar(-0.5, 0.5)], i * 3);
      const a = Math.random() * Math.PI * 2, r = hex ? azar(3, 8) : azar(1.5, 4); goVel.set([Math.cos(a) * r, azar(4, hex ? 11 : 7), Math.sin(a) * r], i * 3);
      const c = cs[i % 4]; goCol.set([c.r, c.g, c.b], i * 3);
    }
    gotas.geometry.attributes.color.needsUpdate = true; goVida = calma ? 0.7 : 1.3; gotas.visible = true;
    gotas.material.size = hex ? 0.5 : 0.32;
  }
  let salto = null, forzar = null, esperaSalto = 5, vueloP = null, esperaP = 8, esperaB = 12, bTiempo = -1;
  function animales(dt, yo) {
    const [fx, fz] = dir(yo.rumbo);
    // un delfín o tres peces saltan cerca del velero
    if (!salto) {
      esperaSalto -= dt;
      const hay = glb['delfin-rosado'] || glb.pez;
      if (esperaSalto <= 0 && hay && !calma) {
        const pez = forzar === 'pez' || !glb['delfin-rosado'] || (forzar !== 'delfin' && glb.pez && Math.random() < 0.3), ms = pez ? glb.pez : glb['delfin-rosado'], lado = Math.random() < 0.5 ? -1 : 1;
        const d0 = azar(9, 14), off = lado * azar(5, 8);
        forzar = null;
        salto = { ms, t: 0, dur: pez ? 0.9 : 1.5, alto: pez ? 1.8 : 3.2, largo: pez ? 4 : 8, x: yo.x + fx * d0 - fz * off, z: yo.z + fz * d0 + fx * off, r: yo.rumbo - lado * azar(60, 85), n: ms.length };
        ms.forEach(m => { m.visible = true; }); estallar(salto.x, salto.z, null, 0.3);
        esperaSalto = azar(7, 14);
      }
    } else {
      const s = salto; s.t += dt; const u = s.t / s.dur, [dx, dz] = dir(s.r);
      s.ms.forEach((m, i) => {
        const uu = Math.max(0, Math.min(1, u - i * 0.18)), d = (uu - 0.5) * s.largo;
        m.position.set(s.x + dx * d + i * 0.8 * -dz, -0.4 + Math.sin(uu * Math.PI) * s.alto, s.z + dz * d + i * 0.8 * dx);
        m.rotation.set(0, 0, 0); m.rotation.y = -s.r * RAD; m.rotateX(-Math.cos(uu * Math.PI) * 0.9 * -1);
        m.visible = uu > 0 && uu < 1;
      });
      if (u > 1 + (s.n - 1) * 0.18) { estallar(s.x + dx * s.largo / 2, s.z + dz * s.largo / 2, null, 0.3); s.ms.forEach(m => { m.visible = false; }); salto = null; }
    }
    // tres pelícanos en fila cruzan el cielo
    if (!vueloP) { esperaP -= dt; if (esperaP <= 0) { const lado = Math.random() < 0.5 ? -1 : 1, d = azar(30, 55); vueloP = { t: 0, x0: yo.x + fx * d - fz * lado * 60, z0: yo.z + fz * d + fx * lado * 60, vx: fz * lado * 9, vz: -fx * lado * 9, y: azar(11, 17) }; pelicanos.forEach(p => { p.visible = true; }); } }
    else {
      const v = vueloP; v.t += dt; const r = Math.atan2(v.vx, -v.vz);
      pelicanos.forEach((p, i) => { p.position.set(v.x0 + v.vx * v.t - Math.sin(r) * i * 2.2 + Math.cos(r) * i * 1.6 * (i % 2 ? 1 : -1), v.y + Math.sin(tiempo * 2 + i) * 0.3, v.z0 + v.vz * v.t + Math.cos(r) * i * 2.2 + Math.sin(r) * i * 1.6 * (i % 2 ? 1 : -1)); p.rotation.y = -r;
        const al = calma ? 0.1 : Math.sin(tiempo * 6 + i) * 0.5; p.userData.alas[0].rotation.z = al; p.userData.alas[1].rotation.z = -al; });
      if (v.t > 14) { pelicanos.forEach(p => { p.visible = false; }); vueloP = null; esperaP = azar(10, 20); }
    }
    // las tortugas nadan junto a las islas que están cerca
    tortugas.forEach((t, i) => {
      const isla = islasV.slice().sort((a, b) => Math.hypot(a.x - yo.x, a.z - yo.z) - Math.hypot(b.x - yo.x, b.z - yo.z))[i];
      if (!isla) { t.visible = false; return; }
      const a = tiempo * 0.08 + i * 2.5, r = 14 + i * 3; t.visible = true;
      t.position.set(isla.x + Math.cos(a) * r, ola(isla.x + Math.cos(a) * r, isla.z + Math.sin(a) * r, tiempo) - 0.15, isla.z + Math.sin(a) * r);
      t.rotation.y = -a + Math.PI; t.userData.aletas.forEach((f, k) => { f.rotation.y = calma ? 0 : Math.sin(tiempo * 3 + k * 1.6) * 0.5; });
    });
    // la ballena jorobada del Pacífico: saca la cola de vez en cuando, lejos
    if (marAct.ballena && !calma) {
      if (bTiempo < 0) { esperaB -= dt; if (esperaB <= 0) { bTiempo = 0; const lado = Math.random() < 0.5 ? -1 : 1; ballena.position.set(yo.x + fx * 45 - fz * lado * 28, 0, yo.z + fz * 45 + fx * lado * 28); ballena.rotation.y = azar(0, 6); ballena.visible = true; } }
      else { bTiempo += dt; const u = bTiempo / 4; ballena.position.y = Math.sin(Math.min(1, u) * Math.PI) * 2.8 - 2.2; ballena.rotation.x = -0.3 + u * 0.5; if (u >= 1) { ballena.visible = false; bTiempo = -1; esperaB = azar(14, 24); estallar(ballena.position.x, ballena.position.z, null, 0.5); } }
    } else ballena.visible = false;
  }

  // lluvia y rayos (la tormenta)
  const lluvia = (() => {
    const n = movil ? 160 : 280, pos = new Float32Array(n * 6), g = new T.BufferGeometry(); g.setAttribute('position', new T.BufferAttribute(pos, 3));
    const l = new T.LineSegments(g, new T.LineBasicMaterial({ color: C('#c8d3e6'), transparent: true, opacity: 0.5 })); l.frustumCulled = false; l.visible = false; scene.add(l);
    const d = []; for (let i = 0; i < n; i++) d.push({ x: azar(-35, 35), y: azar(0, 30), z: azar(-35, 35) });
    return { l, d, pos };
  })();
  let relampago = 0, proxRayo = 6;

  function mar(id) {
    const c = marAct = MARES[id] || MARES.caribe;
    pintarDomo(c.arriba, c.horizonte);
    scene.fog.color.set(c.horizonte); scene.background = new T.Color(c.horizonte);
    agua.uniforms.c1.value.copy(C(c.agua[0])); agua.uniforms.c2.value.copy(C(c.agua[1])); agua.uniforms.siete.value = c.siete ? 1 : 0;
    pintarFondo(c.fondo, c.fondo === 'muralla' ? 'rgba(140,110,80,0.55)' : c.fondo === 'sierra' ? 'rgba(70,60,110,0.75)' : 'rgba(40,90,70,0.7)');
    hemi.intensity = 0.9 * c.luz; sol.intensity = 0.8 * c.luz; hemi.color.set(c.sol ? '#ffd8b0' : '#fff6e5');
    solDisco.visible = !c.lluvia; solDisco.material.color.set(c.sol ? '#ffb070' : '#ffffff');
    nubes.material.color.copy(C(c.lluvia ? '#8a93a6' : c.sol ? '#ffd0b0' : '#ffffff'));
    lluvia.l.visible = !!c.lluvia;
    islasV.forEach(i => { if (i.haz) i.haz.visible = !!c.faros; });
  }

  /* ---------- la cámara y el cuadro ---------- */
  let camR = 0, sacude = 0, vitrina = null;
  const mira = new T.Vector3(), camPos = new T.Vector3(0, 8, 14);
  function tam() {
    const w = div.clientWidth || innerWidth, h = div.clientHeight || innerHeight;
    ren.setSize(w, h, false); cam.aspect = w / h; cam.userData.lejos = w / h < 1 ? 1.45 : w / h < 1.4 ? 1.15 : 1;
    cam.fov = w / h < 1 ? 66 : 58; cam.updateProjectionMatrix(); medirBrujula();
  }
  addEventListener('resize', tam); tam();
  const dif = (a, b) => ((a - b + 540) % 360) - 180;

  /** E = { yo: {x, z, rumbo, v, escora, botavara, comba, flamea, magia}, rivales: [..], viento: {desde, fuerza, racha},
   *  destino: {x, z} | null, ruta: [[x, z]..] | null, nogo, zona: bool, sacudir } */
  function cuadro(dt, E) {
    tiempo += dt; vientoA = E.viento.desde;
    const yo = E.yo;
    agua.uniforms.t.value = tiempo; agua.uniforms.A.value = A0();
    if (jugador) poseVelero(jugador, yo, dt);
    rivales.forEach((r, i) => { const d = E.rivales && E.rivales[i]; r.v.g.visible = r.v.estela.m.visible = !!d; if (d) { poseVelero(r.v, d, dt); r.v.tag.visible = Math.hypot(d.x - yo.x, d.z - yo.z) > 9; } });
    boyasCuadro(dt);
    // el mar sigue al velero a saltos de su cuadrícula (no se nota)
    const paso = TAM / SEG; marMalla.position.set(Math.round(yo.x / paso) * paso, 0, Math.round(yo.z / paso) * paso);
    // la cámara: detrás y arriba, girando despacio con el rumbo
    const lejos = cam.userData.lejos || 1;
    camR += dif(yo.rumbo, camR) * Math.min(1, dt * (calma ? 1.4 : 2.2));
    const [bx, bz] = dir(camR);
    v0.set(yo.x - bx * 14.5 * lejos, 8 * lejos + 1.6, yo.z - bz * 14.5 * lejos);
    camPos.lerp(v0, Math.min(1, dt * 4)); cam.position.copy(camPos);
    mira.set(yo.x + bx * 10, 0.6, yo.z + bz * 10);
    if (E.sacudir && !calma) sacude = 0.8;
    if (sacude > 0) { cam.position.x += (Math.random() - 0.5) * sacude * 0.5; cam.position.y += (Math.random() - 0.5) * sacude * 0.5; sacude = Math.max(0, sacude - dt * 2); }
    cam.lookAt(mira);
    if (vitrina != null && jugador) { const p = jugador.g.position; cam.position.set(p.x + Math.sin(vitrina) * 9, p.y + 3.4, p.z + Math.cos(vitrina) * 9); cam.lookAt(p.x, p.y + 1.8, p.z); }
    domo.position.copy(cam.position); fondo.position.set(cam.position.x, 18, cam.position.z);
    const sa = (marAct.sol ? 255 : 210) * RAD; solDisco.position.set(cam.position.x + Math.sin(sa) * 600, marAct.sol ? 55 : 260, cam.position.z - Math.cos(sa) * 600);
    sol.position.set(yo.x + 40, 70, yo.z + 30); sol.target.position.set(yo.x, 0, yo.z);
    escribirNubes(Math.round(yo.x / 50) * 50, Math.round(yo.z / 50) * 50);
    // las rayas del viento corren sobre el mar hacia donde sopla (más y más rápidas con la racha)
    const [wx, wz] = dir(E.viento.desde + 180), vel = (E.viento.racha ? 30 : 14) * (calma ? 0.5 : 1);
    viento.material.opacity = E.viento.racha ? 0.8 : 0.38;
    viD.forEach((d, i) => {
      d.x += wx * vel * dt; d.z += wz * vel * dt;
      if (Math.abs(d.x) > 40 || Math.abs(d.z) > 40) { d.x = -wx * 38 + azar(-30, 30) * Math.abs(wz) + azar(-4, 4); d.z = -wz * 38 + azar(-30, 30) * Math.abs(wx) + azar(-4, 4); }
      const px = yo.x + d.x, pz = yo.z + d.z, py = ola(px, pz, tiempo) + d.y * 0.5 + 0.3;
      viPos.set([px, py, pz, px + wx * d.l, py, pz + wz * d.l], i * 6);
    });
    viento.geometry.attributes.position.needsUpdate = true;
    // la zona sin avance (contra el viento), rayada y con su letrero
    zona.visible = zonaX.visible = !!E.zona;
    if (E.zona) {
      if (zonaN !== E.nogo) hacerZona(E.nogo);
      zona.position.set(yo.x, ola(yo.x, yo.z, tiempo) + 0.15, yo.z); zona.rotation.y = -E.viento.desde * RAD;
      const [ux, uz] = dir(E.viento.desde); zonaX.position.set(yo.x + ux * 6.6, ola(yo.x, yo.z, tiempo) + 1.6, yo.z + uz * 6.6);
      zonaX.visible = !!E.contra;
    }
    // la ruta de puntos y la flecha que apunta a la boya elegida
    let n = 0;
    if (E.ruta && E.ruta.length > 1) {
      let resto = 1.2;
      for (let s = 0; s < E.ruta.length - 1 && n < N_PT; s++) {
        const [ax, az] = E.ruta[s], [cx, cz] = E.ruta[s + 1], L = Math.hypot(cx - ax, cz - az);
        for (let d = resto; d < L && n < N_PT; d += 2.4) { const px = ax + (cx - ax) * d / L, pz = az + (cz - az) * d / L; mat4.makeTranslation(px, ola(px, pz, tiempo) + 0.12, pz); puntos.setMatrixAt(n++, mat4); resto = d + 2.4 - L; }
      }
      puntos.instanceMatrix.needsUpdate = true;
    }
    puntos.count = n;
    flecha.visible = !!E.destino;
    if (E.destino) {
      const r = Math.atan2(E.destino.x - yo.x, -(E.destino.z - yo.z)), d = Math.min(5.5, Math.hypot(E.destino.x - yo.x, E.destino.z - yo.z) * 0.5);
      const px = yo.x + Math.sin(r) * d, pz = yo.z - Math.cos(r) * d;
      flecha.position.set(px, ola(px, pz, tiempo) + 0.5 + (calma ? 0 : Math.sin(tiempo * 4) * 0.15), pz); flecha.rotation.y = -r;
    }
    // efectos
    if (goVida > 0) {
      goVida -= dt;
      for (let i = 0; i < N_GO; i++) { goPos[i * 3] += goVel[i * 3] * dt; goPos[i * 3 + 1] += goVel[i * 3 + 1] * dt; goPos[i * 3 + 2] += goVel[i * 3 + 2] * dt; goVel[i * 3 + 1] -= 14 * dt; }
      gotas.geometry.attributes.position.needsUpdate = true; gotas.material.opacity = Math.max(0, Math.min(1, goVida * 1.5));
      if (goVida <= 0) gotas.visible = false;
    }
    if (lluvia.l.visible) {
      const p = lluvia.pos;
      lluvia.d.forEach((d, i) => { d.y -= dt * 34; if (d.y < -1) { d.y = azar(16, 30); d.x = azar(-35, 35); d.z = azar(-35, 35); } p.set([yo.x + d.x, d.y, yo.z + d.z, yo.x + d.x + wx * 0.6, d.y + 1.3, yo.z + d.z + wz * 0.6], i * 6); });
      lluvia.l.geometry.attributes.position.needsUpdate = true;
    }
    if (marAct.rayos && !calma) { proxRayo -= dt; if (proxRayo <= 0) { relampago = 0.18; proxRayo = azar(6, 12); } }
    if (relampago > 0) { relampago -= dt; hemi.intensity = 0.9 * marAct.luz + (relampago > 0 ? 1.0 : 0); } else hemi.intensity = 0.9 * marAct.luz;
    islasV.forEach(i => { if (i.haz && i.haz.visible) i.haz.rotation.y = tiempo * 0.9; });
    animales(dt, yo);
    ren.setViewport(0, 0, ren.domElement.width / ren.getPixelRatio(), ren.domElement.height / ren.getPixelRatio()); ren.setScissorTest(false);
    ren.clear(); ren.render(scene, cam);
    // la brújula en su rincón: «arriba» es hacia donde mira la cámara
    medirBrujula();
    if (rectB && rectB.width > 10) {
      const H = ren.domElement.height / ren.getPixelRatio(), x = rectB.left, y = H - rectB.bottom, w = rectB.width, h = rectB.height;
      bru.rosa.rotation.y = camR * RAD; bru.vi.rotation.y = -E.viento.desde * RAD;
      bru.vi.position.y = calma ? 0 : Math.sin(tiempo * 3) * 0.1; bru.barco.rotation.y = -yo.rumbo * RAD;
      bru.c2.aspect = w / h; bru.c2.updateProjectionMatrix();
      ren.setViewport(x, y, w, h); ren.setScissor(x, y, w, h); ren.setScissorTest(true); ren.clearDepth(); ren.render(bru.sc2, bru.c2); ren.setScissorTest(false);
    }
  }

  const ray = new T.Raycaster(), pt = new T.Vector2();
  function tocar(cx, cy) {
    const r = ren.domElement.getBoundingClientRect();
    pt.set(((cx - r.left) / r.width) * 2 - 1, -((cy - r.top) / r.height) * 2 + 1);
    ray.setFromCamera(pt, cam);
    const vivas = boyasV.filter(b => b.fuera == null && b.estado !== 'tapado');
    const hits = ray.intersectObjects(vivas.map(b => b.hit), false);
    if (!hits.length) return -1;
    const b = vivas.find(x => x.hit === hits[0].object); return b ? b.i : -1;
  }

  return { mar, veleros, boyas: ponerBoyas, marcar, hundirBoyas, quitarBoyas, puerta, islas, estallar, cuadro, tocar, medirBrujula, ola: (x, z) => ola(x, z, tiempo),
    calma(b) { calma = !!b; }, salto(k) { esperaSalto = 0; if (salto) salto.ms.forEach(m => { m.visible = false; }); salto = null; forzar = k || null; }, vitrina(a) { vitrina = a == null ? null : +a; }, estrecho: () => cam.aspect < 1, lienzo: ren.domElement };
}

/* Los GLB de la Biblioteca: GLTFLoader y meshopt de r128 (dentro de app2 junto a three.min.js; suelto, de jsdelivr).
   Si no cargan, no pasa nada: la regata se juega igual. */
function cargarScript(src) { return new Promise((si, no) => { const s = document.createElement('script'); s.src = src; s.onload = si; s.onerror = () => no(new Error('no cargó ' + src)); document.head.appendChild(s); }); }
function cargarGLB(biblio, ids, alCargar) {
  const J3 = window.Juegos3D || {}, cdn = 'https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/';
  const una = (f, d, hay) => (hay() ? Promise.resolve() : (J3.enApp ? cargarScript('../' + f).then(() => { if (!hay()) throw new Error('vacío'); }) : Promise.reject(new Error('suelto')))
    .catch(() => cargarScript(cdn + d + f)));
  una('GLTFLoader.js', 'loaders/', () => T.GLTFLoader).then(() => una('meshopt_decoder.js', 'libs/', () => window.MeshoptDecoder)).then(() => {
    const l = new T.GLTFLoader(); if (window.MeshoptDecoder) l.setMeshoptDecoder(window.MeshoptDecoder); l.setCrossOrigin('anonymous');
    ids.forEach(id => l.load(biblio + 'modelos/' + id + '.glb', g => alCargar(id, g), undefined, e => console.warn('Regata: sin ' + id + ' (' + (e && e.message) + ')')));
  }).catch(e => console.warn('Regata: los animales no cargaron (' + e.message + ')'));
}

window.Mar = { crear, disponible: true, MARES, VELEROS, VELAS, BOYAS, partir, dir };
})();
