/* Detective de Pistas — el pueblito low-poly del fondo (three r128, el de puente.js). Es el decorado: el juego va en
   HTML encima. window.Pueblo3D.crear(div, {calma}) → {ir(sitio), calma(b), dormir(b), celebrar(), banda(px)}.
   sitio: 'plaza' | 'iglesia' | 'colegio' | 'tienda' | 'casa'. La cámara vuela hasta allá y una lupa marca el sitio.
   Casas blancas de zócalo y puertas de colores, tejas de barro, la iglesia con su reloj, el colegio con la bandera, la
   tienda con su toldo, palmas de cera y montañas. Sin sombras: todo Lambert (va en celular).
   En calma: la cámara quieta, sin nubes que se mueven y el vuelo de golpe. Sin WebGL: disponible = false. */
(function () {
'use strict';
const T = window.THREE;
const disponible = (() => {
  if (!T) return false;
  try { const c = document.createElement('canvas'); return !!(c.getContext('webgl') || c.getContext('experimental-webgl')); } catch (e) { return false; }
})();
const C = h => new T.Color(h).convertSRGBToLinear();
const suave = t => t * t * (3 - 2 * t);

// cada sitio: dónde está, a qué altura se mira, dónde flota la lupa y desde qué lado despejado lo ve la cámara
const SITIOS = {
  plaza: { x: 0, z: 0, mira: 1, lupa: 3.5, ang: 0.6, r: 34, alto: 18 },
  iglesia: { x: 0, z: -12, mira: 5, lupa: 13, ang: 0, r: 18, alto: 8 },
  colegio: { x: 17, z: -2, mira: 1.6, lupa: 5.5, ang: 1.35, r: 13, alto: 6 },
  tienda: { x: -14, z: 3, mira: 1.4, lupa: 5, ang: 1.57, r: 10, alto: 6 },
  casa: { x: -6, z: 15, mira: 1.3, lupa: 5, ang: 2.74, r: 10, alto: 6 }
};

function crear(div, op) {
  const movil = matchMedia('(pointer: coarse)').matches;
  const ren = new T.WebGLRenderer({ antialias: !movil, powerPreference: 'low-power' });
  ren.setPixelRatio(Math.min(devicePixelRatio || 1, movil ? 1.25 : 1.5));
  ren.outputEncoding = T.sRGBEncoding;
  div.appendChild(ren.domElement);
  const scene = new T.Scene(), cam = new T.PerspectiveCamera(45, 1, 0.5, 300);
  scene.background = C('#a9dcf5'); scene.fog = new T.Fog(scene.background, 60, 150);
  scene.add(new T.HemisphereLight(0xfff6e5, 0x5d7a45, 0.85));
  const sol = new T.DirectionalLight(0xfff0d0, 0.75); sol.position.set(20, 30, 12); scene.add(sol);

  const mats = {};
  const M = (h) => mats[h] || (mats[h] = new T.MeshLambertMaterial({ color: C(h) }));
  const caja = new T.BoxGeometry(1, 1, 1);
  const pieza = (geo, color, x, y, z, sx, sy, sz, ry) => {
    const m = new T.Mesh(geo, M(color)); m.position.set(x, y, z); m.scale.set(sx || 1, sy || 1, sz || 1); if (ry) m.rotation.y = ry; scene.add(m); return m;
  };
  // un techo a dos aguas: un prisma de 3 lados acostado
  const prisma = new T.CylinderGeometry(0.5, 0.5, 1, 3, 1); prisma.rotateZ(Math.PI / 2); prisma.rotateX(Math.PI / 6); prisma.translate(0, -0.25, 0);

  // el suelo, la plaza y las calles
  const suelo = new T.Mesh(new T.CircleGeometry(140, 40), M('#74b85a')); suelo.rotation.x = -Math.PI / 2; scene.add(suelo);
  pieza(caja, '#e7d7b5', 0, 0.02, 0, 16, 0.05, 16);
  pieza(caja, '#d8c39a', 0, 0.01, 0, 60, 0.03, 4);
  pieza(caja, '#d8c39a', 0, 0.01, 0, 4, 0.03, 60);
  // la fuente
  const cil = new T.CylinderGeometry(1, 1, 1, 12);
  pieza(cil, '#cfc6b5', 0, 0.3, 0, 2.2, 0.6, 2.2);
  const agua = pieza(cil, '#5fb3e6', 0, 0.62, 0, 1.9, 0.06, 1.9);
  pieza(cil, '#cfc6b5', 0, 1.1, 0, 0.3, 1.2, 0.3);
  pieza(cil, '#cfc6b5', 0, 1.75, 0, 0.9, 0.15, 0.9);

  // una casa: paredes blancas, zócalo y puerta de color, ventanas, tejado de barro
  const COLORES = ['#2f6fb5', '#2e8b57', '#c0392b', '#e0a100', '#7d3c98', '#16a085'];
  function casa(x, z, ry, ancho, alto, color, techo) {
    const g = new T.Group(); g.position.set(x, 0, z); g.rotation.y = ry || 0; scene.add(g);
    const add = (geo, col, px, py, pz, sx, sy, sz) => { const m = new T.Mesh(geo, M(col)); m.position.set(px, py, pz); m.scale.set(sx, sy, sz); g.add(m); return m; };
    add(caja, '#f7f3ea', 0, alto / 2, 0, ancho, alto, 3);
    add(caja, color, 0, 0.35, 0, ancho + 0.04, 0.7, 3.04);
    add(caja, color, 0, 0.8, 1.52, 0.9, 1.6, 0.06);
    [-1, 1].forEach(s => { if (ancho > 3) add(caja, color, s * ancho * 0.3, alto * 0.62, 1.52, 0.8, 0.8, 0.06); });
    add(prisma, techo || '#b5532e', 0, alto + 0.55, 0, ancho + 0.5, 1.3, 3.6);
    return g;
  }
  const filas = [
    [-9, -8, 0], [-13, -8, 0], [-17, -8, 0], [9, -8, 0], [13, -8, 0],
    [-9, 8, Math.PI], [-13, 8, Math.PI], [9, 8, Math.PI], [13, 8, Math.PI], [17, 8, Math.PI],
    [-21, 9, Math.PI], [5, 22, Math.PI], [-16, 18, Math.PI / 2], [22, -12, -Math.PI / 2]
  ];
  filas.forEach(([x, z, r], i) => casa(x, z, r, 3.2 + (i % 3) * 0.4, 2.4 + (i % 2) * 0.5, COLORES[i % COLORES.length]));

  // la iglesia: nave, torre, reloj y cúpula
  pieza(caja, '#fbf8f0', 0, 2.5, -17, 6, 5, 9);
  pieza(prisma, '#a84a2a', 0, 5.6, -17, 6.6, 2.2, 9.6).rotation.y = Math.PI / 2;
  pieza(caja, '#fbf8f0', 0, 4.5, -12.2, 3, 9, 3);
  const reloj = pieza(cil, '#fffdf4', 0, 7.2, -10.65, 0.9, 0.1, 0.9); reloj.rotation.x = Math.PI / 2;
  const aguja = pieza(caja, '#2b2b2b', 0, 7.45, -10.58, 0.08, 0.55, 0.04);
  pieza(new T.ConeGeometry(2.2, 2.8, 4), '#a84a2a', 0, 10.4, -12.2, 1, 1, 1, Math.PI / 4);
  pieza(caja, '#8a5a2b', 0, 1.2, -10.65, 1.4, 2.4, 0.1);

  // el colegio: largo, amarillo, con bandera
  pieza(caja, '#f6d365', 17, 1.6, -2, 4, 3.2, 10);
  pieza(caja, '#2f6fb5', 17, 0.4, -2, 4.04, 0.8, 10.04);
  pieza(prisma, '#b5532e', 17, 3.75, -2, 4.6, 1.4, 10.6).rotation.y = Math.PI / 2;
  pieza(cil, '#9aa0a6', 13.6, 3, 3.6, 0.08, 6, 0.08);
  const bandera = new T.Group(); bandera.position.set(13.6, 5.4, 3.6); scene.add(bandera);
  [['#fcd116', 0.5], ['#003893', 0.25], ['#ce1126', 0.25]].reduce((y, [col, h]) => {
    const m = new T.Mesh(caja, M(col)); m.scale.set(1.6, h * 1.1, 0.04); m.position.set(0.8, y - h * 0.55, 0); bandera.add(m); return y - h * 1.1;
  }, 0.55);

  // la tienda: casa con toldo a rayas
  casa(-14, 3, Math.PI / 2, 4, 2.8, '#c0392b', '#9c4426');
  for (let i = 0; i < 6; i++) pieza(caja, i % 2 ? '#ffffff' : '#e74c3c', -12.4, 2.3, 1.4 + i * 0.55, 1.2, 0.08, 0.55).rotation.z = -0.35;

  // la casa de doña Rosa, con su palo de mango
  casa(-6, 16, Math.PI, 4.4, 2.6, '#16a085');
  const arbol = (x, z, s, col) => {
    pieza(cil, '#7a4f2a', x, 1 * s, z, 0.25 * s, 2 * s, 0.25 * s);
    pieza(new T.IcosahedronGeometry(1.5, 0), col || '#3f8f3a', x, 2.6 * s, z, s, s * 0.9, s);
  };
  arbol(-2.5, 13.5, 1.2, '#2f7d32');
  [[-3, 13], [-2, 14.2], [-1.8, 12.9]].forEach(([x, z]) => pieza(new T.SphereGeometry(0.22, 6, 4), '#f4a300', x, 3.2, z));
  // palmas de cera
  const palma = (x, z, h) => {
    pieza(cil, '#cfc8b8', x, h / 2, z, 0.16, h, 0.16);
    for (let i = 0; i < 6; i++) { const m = pieza(new T.ConeGeometry(0.35, 2.6, 4), '#3e8e41', x, h, z); m.rotation.set(1.1, i * Math.PI / 3, 0); m.position.set(x + Math.sin(i * Math.PI / 3) * 0.9, h - 0.2, z + Math.cos(i * Math.PI / 3) * 0.9); }
  };
  [[-6, -5, 9], [6, 5, 10], [-6, 5, 8], [6, -5, 9.5], [24, 6, 11], [-24, -6, 10]].forEach(p => palma(p[0], p[1], p[2]));
  [[-26, 16], [26, 18], [-30, -18], [30, -20], [10, 28], [-12, 30], [20, -26], [-20, -28], [36, 14], [-34, 4]].forEach(([x, z], i) => arbol(x, z, 1 + (i % 3) * 0.3));
  // las montañas
  for (let i = 0; i < 16; i++) {
    const a = (i / 16) * Math.PI * 2, r = 85 + (i % 3) * 12, h = 22 + (i % 4) * 9;
    pieza(new T.ConeGeometry(18 + (i % 3) * 5, h, 6), i % 2 ? '#5f9e6e' : '#4d8a63', Math.cos(a) * r, h / 2 - 1, Math.sin(a) * r, 1, 1, 1, a);
  }
  // nubes
  const nubes = [];
  for (let i = 0; i < 7; i++) {
    const g = new T.Group(); g.position.set(-60 + i * 20, 28 + (i % 3) * 4, -40 + (i % 4) * 22); scene.add(g);
    for (let j = 0; j < 4; j++) { const m = new T.Mesh(new T.IcosahedronGeometry(2.4 + (j % 2), 0), M('#ffffff')); m.position.set(j * 2.4 - 3.6, (j % 2) * 0.8, 0); g.add(m); }
    nubes.push(g);
  }
  // la lupa que marca el sitio
  const lupa = new T.Group(); scene.add(lupa);
  const aro = new T.Mesh(new T.TorusGeometry(0.9, 0.16, 8, 24), M('#ffb703')); lupa.add(aro);
  const vidrio = new T.Mesh(new T.CircleGeometry(0.85, 24), new T.MeshBasicMaterial({ color: C('#bfe9ff'), transparent: true, opacity: 0.55, side: T.DoubleSide })); lupa.add(vidrio);
  const mango = new T.Mesh(caja, M('#6b3e1f')); mango.scale.set(0.24, 1.3, 0.24); mango.position.set(0.9, -1.3, 0); mango.rotation.z = 0.6; lupa.add(mango);

  let calma = !!op.calma, dormido = false, t0 = performance.now(), sitio = 'plaza', vuelo = null, fiesta = 0;
  const camPos = new T.Vector3(), mira = new T.Vector3();
  function deseado(s, t) {
    // en una pantalla angosta (el celular de pie) se ve menos de lado: la cámara se aleja
    const k = cam.aspect < 1.3 ? Math.pow(1.3 / cam.aspect, 0.75) : 1;
    const p = SITIOS[s] || SITIOS.plaza, lejos = s === 'plaza', r = p.r * k, alto = p.alto * k;
    // la plaza se recorre despacio en círculo; los sitios se miran desde su lado despejado, meciéndose un poco
    const ang = calma ? p.ang : lejos ? p.ang + t * 0.05 : p.ang + Math.sin(t * 0.15) * 0.15;
    return { pos: new T.Vector3(p.x + Math.sin(ang) * r, alto, p.z + Math.cos(ang) * r), mira: new T.Vector3(p.x, p.mira, p.z) };
  }
  const d0 = deseado('plaza', 0); camPos.copy(d0.pos); mira.copy(d0.mira);
  // banda: la altura de arriba que deja ver la libreta (0 = toda la pantalla). El sitio se centra en esa banda.
  let banda = 0;
  function tamano() {
    const w = div.clientWidth || innerWidth, h = div.clientHeight || innerHeight;
    ren.setSize(w, h, false); cam.aspect = w / h;
    const dy = banda > 0 && banda < h ? Math.round((h - banda) / 2) : 0;
    if (dy) cam.setViewOffset(w, h, 0, dy, w, h); else cam.clearViewOffset();
    cam.updateProjectionMatrix(); pintar();
  }
  function pintar() {
    const t = (performance.now() - t0) / 1000;
    const d = deseado(sitio, t);
    if (vuelo) {
      const k = Math.min(1, (performance.now() - vuelo.t) / vuelo.dur), e = suave(k);
      camPos.lerpVectors(vuelo.desde, d.pos, e); mira.lerpVectors(vuelo.mira, d.mira, e);
      camPos.y += Math.sin(e * Math.PI) * 6;
      if (k >= 1) vuelo = null;
    } else { camPos.copy(d.pos); mira.copy(d.mira); }
    cam.position.copy(camPos); cam.lookAt(mira);
    const p = SITIOS[sitio] || SITIOS.plaza;
    lupa.visible = sitio !== 'plaza';
    lupa.position.set(p.x, p.lupa + (calma ? 0 : Math.sin(t * 2) * 0.3), p.z);
    lupa.rotation.y = calma ? 0.5 : t * 0.8;
    if (!calma) {
      nubes.forEach((g, i) => { g.position.x = ((g.position.x + 0.02 + i * 0.002 + 80) % 160) - 80; });
      bandera.rotation.y = Math.sin(t * 2.2) * 0.25; agua.position.y = 0.62 + Math.sin(t * 3) * 0.02;
      aguja.rotation.z = -t * 0.2;
      if (fiesta > 0) { fiesta--; lupa.scale.setScalar(1 + Math.sin(fiesta * 0.3) * 0.25); } else lupa.scale.setScalar(1);
    }
    ren.render(scene, cam);
  }
  let par = false;
  function bucle() {
    requestAnimationFrame(bucle);
    if (dormido || document.hidden) return;
    if (calma && !vuelo) return;
    par = !par; if (par && !vuelo) return; // 30 cuadros por segundo bastan para el decorado
    pintar();
  }
  addEventListener('resize', tamano);
  tamano(); bucle();
  return {
    ir(s) {
      if (!SITIOS[s]) s = 'plaza';
      if (calma) { sitio = s; vuelo = null; pintar(); return; }
      vuelo = { desde: camPos.clone(), mira: mira.clone(), t: performance.now(), dur: 2200 };
      sitio = s;
    },
    calma(b) { calma = !!b; vuelo = null; pintar(); },
    dormir(b) { dormido = !!b; if (!b) pintar(); },
    celebrar() { if (!calma) fiesta = 60; },
    banda(px) { banda = px || 0; tamano(); },
    tamano
  };
}
window.Pueblo3D = { disponible, crear, SITIOS };
})();
