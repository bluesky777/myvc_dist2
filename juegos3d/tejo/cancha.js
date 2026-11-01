/* Tejo — la cancha en three r128, toda hecha con código: el cajón de madera con la greda inclinada, el bocín de metal,
   las mechas (papeletas triangulares que revientan en un chispazo de luz, chispas y papelitos), el tejo de hierro
   torneado (★ el tuyo, ◆ el de Don Tulio, el dorado muisca con su espiral), los lanzadores con ruana y sombrero (Ana,
   Leo y Don Tulio), la pizarra con los palitos de tiza, el techo de zinc, los banderines y las montañas de Boyacá.
   Mundo = el de fisica.js: x adelante (hacia el cajón), y arriba, z a la derecha del lanzador. La lupa es una segunda
   cámara que mira la cara de greda de frente y se pinta en el rectángulo que diga el juego (setScissor).
   Sin WebGL: window.TejoCancha.disponible = false y el juego sigue con el texto. */
(function () {
'use strict';
const T = window.THREE, F = window.TejoFisica;
if (!T || !F) { window.TejoCancha = { disponible: false }; return; }
const V = (x, y, z) => new T.Vector3(x, y, z);
const N_CARA = V(-F.SA, F.CA, 0), E_S = V(F.CA, F.SA, 0);       // la normal de la greda (hacia el lanzador) y «arriba» en ella
const rnd = (() => { let s = 11; return () => { s = (s * 16807) % 2147483647; return s / 2147483647; }; })();

function lienzo(w, h, dibujar) {
  const c = document.createElement('canvas'); c.width = w; c.height = h; dibujar(c.getContext('2d'), w, h);
  const t = new T.CanvasTexture(c); t.anisotropy = 4; return t;
}
const lam = (color, o) => (o && o.flatShading ? new T.MeshPhongMaterial(Object.assign({ color, shininess: 0, specular: 0x000000 }, o)) : new T.MeshLambertMaterial(Object.assign({ color }, o || {})));
const pho = (color, o) => new T.MeshPhongMaterial(Object.assign({ color, shininess: 60 }, o || {}));
function malla(geo, mat, x, y, z, padre) { const m = new T.Mesh(geo, mat); m.position.set(x || 0, y || 0, z || 0); if (padre) padre.add(m); return m; }

/* ---------- texturas ---------- */
const TX = {
  pasto: () => lienzo(256, 256, (g, w, h) => { g.fillStyle = '#5f9e3f'; g.fillRect(0, 0, w, h); for (let i = 0; i < 2600; i++) { g.fillStyle = ['#6aac47', '#548f37', '#78b852', '#4f8834'][i % 4]; g.fillRect(rnd() * w, rnd() * h, 2, 3 + rnd() * 4); } }),
  tierra: () => lienzo(256, 256, (g, w, h) => { g.fillStyle = '#a77b52'; g.fillRect(0, 0, w, h); for (let i = 0; i < 2200; i++) { g.fillStyle = ['#b48a5f', '#96693f', '#bf9a70', '#8c623c'][i % 4]; const r = 1 + rnd() * 2.5; g.fillRect(rnd() * w, rnd() * h, r, r); } }),
  greda: () => lienzo(512, 512, (g, w, h) => {
    g.fillStyle = '#8a7f72'; g.fillRect(0, 0, w, h);
    for (let i = 0; i < 4200; i++) { g.fillStyle = ['#968b7d', '#7c7266', '#a19686', '#857a6c'][i % 4]; const r = 1 + rnd() * 3; g.beginPath(); g.arc(rnd() * w, rnd() * h, r, 0, 7); g.fill(); }
    const gr = g.createRadialGradient(w / 2, h / 2, 10, w / 2, h / 2, w * 0.42); gr.addColorStop(0, 'rgba(70,60,50,.45)'); gr.addColorStop(1, 'rgba(70,60,50,0)'); g.fillStyle = gr; g.fillRect(0, 0, w, h); // más húmeda en el centro
    g.strokeStyle = 'rgba(60,52,44,.35)'; g.lineWidth = 3; for (let i = 0; i < 9; i++) { g.beginPath(); const x = rnd() * w, y = rnd() * h; g.moveTo(x, y); g.quadraticCurveTo(x + 30, y + 10, x + 60 * rnd(), y + 40 * rnd()); g.stroke(); }
  }),
  madera: (c1, c2) => lienzo(128, 256, (g, w, h) => { g.fillStyle = c1; g.fillRect(0, 0, w, h); g.strokeStyle = c2; for (let i = 0; i < 26; i++) { g.lineWidth = 1 + rnd() * 2; g.beginPath(); const x = rnd() * w; g.moveTo(x, 0); g.bezierCurveTo(x + 8, h / 3, x - 8, 2 * h / 3, x + 4, h); g.stroke(); } }),
  zinc: () => lienzo(256, 64, (g, w, h) => { for (let x = 0; x < w; x++) { const v = 150 + 60 * Math.sin(x / 4); g.fillStyle = 'rgb(' + v + ',' + (v + 6) + ',' + (v + 12) + ')'; g.fillRect(x, 0, 1, h); } g.fillStyle = 'rgba(150,80,40,.25)'; for (let i = 0; i < 60; i++) g.fillRect(rnd() * w, rnd() * h, 3, 2); }),
  ruana: (a, b, c) => lienzo(256, 256, (g, w, h) => { g.fillStyle = a; g.fillRect(0, 0, w, h); [[0.18, b, 14], [0.26, c, 6], [0.72, c, 6], [0.8, b, 14]].forEach(([y, col, gr]) => { g.fillStyle = col; g.fillRect(0, y * h, w, gr); }); g.fillStyle = 'rgba(0,0,0,.08)'; for (let x = 0; x < w; x += 4) g.fillRect(x, 0, 1, h); }),
  cielo: () => lienzo(8, 256, (g, w, h) => { const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#5aa7e6'); gr.addColorStop(0.55, '#a9d6f5'); gr.addColorStop(1, '#eaf4f0'); g.fillStyle = gr; g.fillRect(0, 0, w, h); }),
  mecha: () => lienzo(128, 128, (g, w, h) => {
    g.fillStyle = '#fffaf0'; g.beginPath(); g.moveTo(w / 2, 6); g.lineTo(w - 6, h - 10); g.lineTo(6, h - 10); g.closePath(); g.fill();
    g.strokeStyle = '#d6336c'; g.lineWidth = 7; g.stroke();
    g.fillStyle = '#1d2b53'; g.font = '800 46px "Baloo 2", system-ui, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('3', w / 2, h * 0.64);
  }),
  marca: (fondo, glifo, tinta, espiral) => lienzo(128, 128, (g, w, h) => {
    g.fillStyle = fondo; g.beginPath(); g.arc(w / 2, h / 2, w / 2, 0, 7); g.fill();
    if (espiral) { g.strokeStyle = '#7a4e00'; g.lineWidth = 5; g.beginPath(); for (let a = 0; a < 16; a += 0.1) { const r = 4 + a * 3.2; g.lineTo(w / 2 + r * Math.cos(a), h / 2 + r * Math.sin(a)); } g.stroke(); return; }
    g.strokeStyle = 'rgba(0,0,0,.35)'; g.lineWidth = 6; g.beginPath(); g.arc(w / 2, h / 2, w / 2 - 8, 0, 7); g.stroke();
    g.fillStyle = tinta; g.font = '800 80px system-ui, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(glifo, w / 2, h / 2 + 4);
  })
};
const MARCAS = { yo: ['#ffd43b', '★', '#1d2b53'], rival: ['#74c0fc', '◆', '#1d2b53'] };

/* ---------- figuras ---------- */
/** El tejo: un disco de hierro torneado (perfil con bisel) y su marca pintada arriba. */
function tejo(r, tipo) {
  const e = r * 0.62, pts = [[0, -e / 2], [r * 0.86, -e / 2], [r, -e * 0.2], [r, e * 0.2], [r * 0.86, e / 2], [0, e / 2]].map(p => new T.Vector2(p[0], p[1]));
  const g = new T.Group(), oro = tipo === 'dorado';
  malla(new T.LatheGeometry(pts, 24), pho(oro ? '#d9a521' : '#5b646c', { shininess: oro ? 110 : 80, specular: oro ? '#fff1b8' : '#c8d0d6' }), 0, 0, 0, g);
  const m = oro ? TX.marca('#e9b93a', '', '', true) : TX.marca.apply(null, MARCAS[tipo] || MARCAS.yo);
  const tapa = malla(new T.CircleGeometry(r * 0.8, 24), new T.MeshLambertMaterial({ map: m }), 0, e / 2 + 0.0008, 0, g); tapa.rotation.x = -Math.PI / 2;
  g.userData.e = e; return g;
}
/** Un lanzador: piernas, ruana boyacense de rayas, cabeza, sombrero de paja y los brazos con su hombro (para lanzar). */
function persona(o) {
  const g = new T.Group(), cuerpo = new T.Group(); g.add(cuerpo);
  const piel = lam(o.piel), pant = lam(o.pantalon || '#3b4a6b'), zap = lam('#3d2b1f');
  const pierna = new T.CylinderGeometry(0.075, 0.07, 0.62, 8);
  [-0.1, 0.1].forEach(x => { malla(pierna, pant, x, 0.36, 0, cuerpo); malla(new T.BoxGeometry(0.13, 0.08, 0.22), zap, x, 0.04, 0.04, cuerpo); });
  malla(new T.CylinderGeometry(0.16, 0.19, 0.5, 10), lam(o.camisa || '#f1f3f5'), 0, 0.9, 0, cuerpo);
  const ruana = malla(new T.CylinderGeometry(0.12, 0.42, 0.52, 4, 1), new T.MeshLambertMaterial({ map: TX.ruana(o.ruana[0], o.ruana[1], o.ruana[2]) }), 0, 0.95, 0, cuerpo);
  ruana.rotation.y = Math.PI / 4; ruana.scale.set(1, 1, 0.72);
  malla(new T.CylinderGeometry(0.06, 0.07, 0.08, 8), piel, 0, 1.24, 0, cuerpo);
  const cab = new T.Group(); cab.position.set(0, 1.38, 0); cuerpo.add(cab);
  malla(new T.SphereGeometry(0.15, 16, 12), piel, 0, 0, 0, cab);
  const ojo = new T.SphereGeometry(0.018, 8, 6), negro = lam('#1b1b1b');
  [-0.05, 0.05].forEach(x => malla(ojo, negro, x, 0.02, 0.135, cab));
  malla(new T.TorusGeometry(0.035, 0.008, 6, 12, Math.PI), lam('#8a3b2e'), 0, -0.05, 0.13, cab).rotation.z = Math.PI;
  [-0.085, 0.085].forEach(x => malla(new T.SphereGeometry(0.025, 8, 6), lam(o.mejillas || '#f08c7a'), x, -0.03, 0.115, cab));
  const pelo = lam(o.pelo);
  const casco = malla(new T.SphereGeometry(0.155, 16, 10, 0, Math.PI * 2, 0, Math.PI * 0.55), pelo, 0, 0.01, -0.01, cab); casco.rotation.x = -0.25;
  if (o.trenzas) [-0.12, 0.12].forEach(x => { const t = malla(new T.CylinderGeometry(0.03, 0.022, 0.26, 6), pelo, x, -0.16, -0.06, cab); t.rotation.z = x > 0 ? -0.15 : 0.15; malla(new T.SphereGeometry(0.03, 6, 5), lam('#e03131'), x * 1.1, -0.29, -0.06, cab); });
  if (o.bigote) malla(new T.BoxGeometry(0.12, 0.025, 0.03), lam('#d9d9d9'), 0, -0.035, 0.145, cab);
  const paja = lam('#e8cf8a'), cinta = lam(o.cinta || '#1d2b53');
  malla(new T.CylinderGeometry(0.27, 0.27, 0.015, 20), paja, 0, 0.1, 0, cab);
  malla(new T.CylinderGeometry(0.115, 0.135, 0.14, 16), paja, 0, 0.17, 0, cab);
  malla(new T.CylinderGeometry(0.136, 0.136, 0.03, 16), cinta, 0, 0.12, 0, cab);
  const brazos = [-1, 1].map(lado => {
    const h = new T.Group(); h.position.set(0.24 * lado, 1.12, 0); cuerpo.add(h);
    malla(new T.CylinderGeometry(0.05, 0.045, 0.46, 8), lam(o.ruana[0]), 0, -0.23, 0, h);
    const mano = malla(new T.SphereGeometry(0.05, 8, 6), piel, 0, -0.48, 0, h);
    h.rotation.z = 0.08 * lado; return { h, mano };
  });
  g.scale.setScalar(o.alto || 1);
  g.rotation.y = Math.PI / 2; // de frente al cajón (+x)
  g.userData = { cuerpo, brazo: brazos[0], izq: brazos[1], cab, nombre: o.nombre };
  return g;
}
const PERSONAS = {
  ana: { nombre: 'Ana', piel: '#c68863', pelo: '#2b1a12', trenzas: true, ruana: ['#c92a2a', '#ffd43b', '#1d2b53'], camisa: '#fff', pantalon: '#364fc7', alto: 0.82, cinta: '#c92a2a' },
  leo: { nombre: 'Leo', piel: '#8d5a3b', pelo: '#1b120c', ruana: ['#2f9e44', '#f1f3f5', '#1d2b53'], camisa: '#ffe066', pantalon: '#495057', alto: 0.84 },
  tulio: { nombre: 'Don Tulio', piel: '#d9a07a', pelo: '#bfbfbf', bigote: true, ruana: ['#7a5230', '#efe3c8', '#3b2414'], camisa: '#f8f9fa', pantalon: '#343a40', alto: 1.04, cinta: '#3b2414', mejillas: '#e8957f' }
};

function crear(cont, o) {
  o = o || {};
  const ren = new T.WebGLRenderer({ antialias: (window.devicePixelRatio || 1) < 2, powerPreference: 'low-power' });
  ren.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
  cont.appendChild(ren.domElement);
  const esc = new T.Scene();
  esc.background = TX.cielo();
  esc.fog = new T.Fog(0xcfe6ee, 45, 140);
  esc.add(new T.HemisphereLight(0xdff1ff, 0x6b5a3a, 0.75));
  const sol = new T.DirectionalLight(0xfff2d8, 0.85); sol.position.set(-20, 40, -25); esc.add(sol);
  const cam = new T.PerspectiveCamera(42, 1, 0.05, 400), lupa = new T.PerspectiveCamera(29, 1, 0.9, 20); // near 0,9: el tejo que pasa volando cerca de la lupa no la tapa
  let calma = !!o.calma, C = F.CANCHAS[o.cancha] || F.CANCHAS.escolar, tam = [1, 1], lupaR = null;

  /* el campo: pasto, la cancha de tierra, sus tablas, la línea y el fondo de Boyacá */
  const tp = TX.pasto(); tp.wrapS = tp.wrapT = T.RepeatWrapping; tp.repeat.set(40, 40);
  const suelo = malla(new T.PlaneGeometry(300, 300), new T.MeshLambertMaterial({ map: tp }), 30, 0, 0, esc); suelo.rotation.x = -Math.PI / 2;
  const tt = TX.tierra(); tt.wrapS = tt.wrapT = T.RepeatWrapping;
  const carril = malla(new T.PlaneGeometry(1, 3.4), new T.MeshLambertMaterial({ map: tt }), 0, 0.006, 0, esc); carril.rotation.x = -Math.PI / 2;
  const tabla = new T.MeshLambertMaterial({ map: TX.madera('#9c6b3c', '#7a4f2a') });
  const rieles = [-1.75, 1.75].map(z => malla(new T.BoxGeometry(1, 0.16, 0.08), tabla, 0, 0.08, z, esc));
  malla(new T.BoxGeometry(0.06, 0.012, 3.4), lam('#ffffff'), 0, 0.012, 0, esc);
  const fondo = new T.Group(); esc.add(fondo);
  [[90, -30, 26, '#6f9f4c'], [120, 30, 34, '#7cae57'], [70, 55, 22, '#5d8f40'], [150, -70, 40, '#89b866'], [40, -80, 30, '#6a9a48'], [-30, 70, 28, '#78a955'], [-40, -60, 26, '#6d9d4a']].forEach(([x, z, r, c]) => {
    const m = malla(new T.IcosahedronGeometry(r, 1), lam(c, { flatShading: true }), x, -r * 0.55, z, fondo); m.scale.set(1.4, 0.6, 1);
  });
  const eucal = (x, z, s) => {
    const a = new T.Group(); a.position.set(x, 0, z); a.scale.setScalar(s); fondo.add(a);
    malla(new T.CylinderGeometry(0.12, 0.2, 6, 6), lam('#d8cbb3'), 0, 3, 0, a);
    [[4.6, 1.1], [6, 1.3], [7.4, 0.9]].forEach(([y, r]) => { const m = malla(new T.IcosahedronGeometry(r, 0), lam('#4b7a46', { flatShading: true }), 0, y, 0, a); m.scale.set(1, 1.6, 1); });
  };
  [[10, -9, 1.1], [24, 10, 1.3], [-6, 8, 1], [34, -12, 1.2], [46, 9, 1.4], [5, 12, 0.9], [-9, -10, 1.2]].forEach(e => eucal(e[0], e[1], e[2]));
  // la casa campesina: paredes blancas, zócalo y puerta verdes, techo de teja
  const casa = new T.Group(); casa.position.set(9, 0, -15); casa.rotation.y = 0.35; fondo.add(casa);
  malla(new T.BoxGeometry(7, 2.8, 4), lam('#f8f5ee'), 0, 1.4, 0, casa);
  malla(new T.BoxGeometry(7.02, 0.6, 4.02), lam('#2f9e44'), 0, 0.3, 0, casa);
  malla(new T.BoxGeometry(1, 1.9, 0.06), lam('#1971c2'), -1.2, 0.95, 2.02, casa);
  [1.2, 2.8].forEach(x => malla(new T.BoxGeometry(0.9, 0.8, 0.06), lam('#1971c2'), x, 1.7, 2.02, casa));
  const techo = malla(new T.CylinderGeometry(0.01, 3.4, 1.4, 4, 1), lam('#b5523b', { flatShading: true }), 0, 3.5, 0, casa); techo.rotation.y = Math.PI / 4; techo.scale.set(1.5, 1, 0.85);

  /* el cajón: la cuña de madera, la cara de greda, el bocín, las mechas, el respaldo y el techo de zinc */
  const cajon = new T.Group(); esc.add(cajon);
  const L = F.LADO, xF = -L * F.CA, xB = L * F.CA, yT = 2 * L * F.SA; // relativos al bocín (x = D)
  const cuña = new T.Shape(); cuña.moveTo(xF + 0.02, 0); cuña.lineTo(xB, 0); cuña.lineTo(xB, yT - 0.02); cuña.lineTo(xF + 0.02, 0);
  const gCuña = new T.ExtrudeGeometry(cuña, { depth: 1.16, bevelEnabled: false }); gCuña.translate(0, 0, -0.58);
  malla(gCuña, new T.MeshLambertMaterial({ map: TX.madera('#7a4f2a', '#5c3a1d') }), 0, 0, 0, cajon);
  const gCara = new T.BufferGeometry();
  const P = (s, u) => { const p = F.enCara({ D: 0 }, s, u); return [p.x + N_CARA.x * 0.004, p.y + N_CARA.y * 0.004, p.z]; };
  gCara.setAttribute('position', new T.Float32BufferAttribute([].concat(P(-L, -L), P(-L, L), P(L, L), P(L, -L)), 3));
  gCara.setAttribute('uv', new T.Float32BufferAttribute([0, 0, 1, 0, 1, 1, 0, 1], 2));
  gCara.setIndex([0, 2, 1, 0, 3, 2]); gCara.computeVertexNormals();
  malla(gCara, new T.MeshLambertMaterial({ map: TX.greda(), side: T.DoubleSide }), 0, 0, 0, cajon);
  [-1, 1].forEach(l => { const b = malla(new T.BoxGeometry(2 * L + 0.12, 0.07, 0.07), tabla, 0, F.YB + 0.03, l * 0.56, cajon); b.rotation.z = F.ALFA; });
  malla(new T.BoxGeometry(0.08, F.RESPALDO.alto, 1.36), new T.MeshLambertMaterial({ map: TX.madera('#8a5a2e', '#6b4422') }), xB + F.RESPALDO.x + 0.04, F.RESPALDO.alto / 2, 0, cajon);
  const metal = pho('#c3ccd4', { shininess: 120, specular: '#ffffff' });
  const bocin = new T.Group(); cajon.add(bocin);
  bocin.position.set(0, F.YB, 0); bocin.quaternion.setFromUnitVectors(V(0, 1, 0), N_CARA);
  function armarBocin() { // el aro de metal a ras de la greda, el tubo hacia dentro y el hueco oscuro
    while (bocin.children.length) bocin.remove(bocin.children[0]);
    const R = C.R;
    const hueco = malla(new T.CircleGeometry(R, 28), lam('#2a211b'), 0, 0.005, 0, bocin); hueco.rotation.x = -Math.PI / 2;
    const aro = malla(new T.TorusGeometry(R, 0.009, 8, 36), metal, 0, 0.008, 0, bocin); aro.rotation.x = Math.PI / 2;
    malla(new T.CylinderGeometry(R, R, 0.06, 28, 1, true), pho('#8e979f', { side: T.DoubleSide }), 0, -0.025, 0, bocin);
  }
  const mechasG = new T.Group(); cajon.add(mechasG);
  const gMecha = (() => { const s = new T.Shape(), a = 0.04; s.moveTo(0, a); s.lineTo(a * 0.87, -a / 2); s.lineTo(-a * 0.87, -a / 2); s.lineTo(0, a);
    const gg = new T.ExtrudeGeometry(s, { depth: 0.012, bevelEnabled: true, bevelThickness: 0.004, bevelSize: 0.004, bevelSegments: 1 });
    const pos = gg.attributes.position, uv = gg.attributes.uv; for (let i = 0; i < pos.count; i++) uv.setXY(i, (pos.getX(i) + a) / (2 * a), (pos.getY(i) + a * 0.6) / (2 * a)); return gg; })();
  const matMecha = [new T.MeshLambertMaterial({ map: TX.mecha() }), lam('#f3e9d2')];
  let mechaMallas = [];
  // el techo de zinc sobre el cajón, sus postes, y los banderines tricolor a los lados de la cancha
  const techoZ = new T.Group(); cajon.add(techoZ);
  const poste = new T.CylinderGeometry(0.06, 0.07, 2.9, 8), mPoste = lam('#6b4422');
  [[-1.2, -1.9], [-1.2, 1.9], [1.3, -1.9], [1.3, 1.9]].forEach(([x, z]) => malla(poste, mPoste, x, 1.45, z, techoZ));
  const tz = TX.zinc(); tz.wrapS = T.RepeatWrapping; tz.repeat.set(3, 1);
  const lamina = malla(new T.PlaneGeometry(3.2, 4.4), new T.MeshLambertMaterial({ map: tz, side: T.DoubleSide }), 0.05, 3.0, 0, techoZ); lamina.rotation.set(-Math.PI / 2, 0.12, 0);
  const banderas = new T.Group(); esc.add(banderas);
  const gBand = (() => { const s = new T.Shape(); s.moveTo(-0.13, 0); s.lineTo(0.13, 0); s.lineTo(0, -0.26); s.lineTo(-0.13, 0); return new T.ShapeGeometry(s); })();
  const coloresB = [lam('#ffd43b', { side: T.DoubleSide }), lam('#1c4fd1', { side: T.DoubleSide }), lam('#d62828', { side: T.DoubleSide })];

  /* la pizarra de anotación (tiza sobre verde) */
  const cPiz = document.createElement('canvas'); cPiz.width = 512; cPiz.height = 300;
  const tPiz = new T.CanvasTexture(cPiz); tPiz.anisotropy = 4;
  const pizarra = new T.Group(); esc.add(pizarra);
  malla(new T.BoxGeometry(1.9, 1.16, 0.06), lam('#6b4422'), 0, 1.5, -0.04, pizarra);
  malla(new T.PlaneGeometry(1.76, 1.03), new T.MeshLambertMaterial({ map: tPiz }), 0, 1.5, 0, pizarra);
  [-0.8, 0.8].forEach(x => malla(new T.CylinderGeometry(0.035, 0.035, 1.2, 6), lam('#6b4422'), x, 0.6, -0.06, pizarra));
  function pintarPizarra(d) {
    const g = cPiz.getContext('2d'), w = cPiz.width, h = cPiz.height;
    g.fillStyle = '#24453a'; g.fillRect(0, 0, w, h); g.fillStyle = 'rgba(255,255,255,.05)'; for (let i = 0; i < 300; i++) g.fillRect(rnd() * w, rnd() * h, 6, 1);
    g.fillStyle = '#f8f9fa'; g.strokeStyle = '#f8f9fa'; g.textBaseline = 'middle';
    g.font = '800 30px "Baloo 2", system-ui, sans-serif'; g.textAlign = 'left';
    g.fillText(d && d.titulo ? d.titulo : 'TEJO', 18, 26);
    g.font = '700 20px "Baloo 2", system-ui, sans-serif'; g.textAlign = 'right'; g.fillText(d && d.meta ? 'a ' + d.meta : '', w - 18, 28);
    (d ? d.filas : []).forEach((f, i) => {
      const y = 92 + i * 92; g.textAlign = 'left'; g.font = '800 28px "Baloo 2", system-ui, sans-serif'; g.fillText(f.glifo + ' ' + f.nombre, 18, y - 18);
      g.textAlign = 'right'; g.font = '800 44px "Baloo 2", system-ui, sans-serif'; g.fillText(String(f.puntos), w - 18, y + 4);
      g.lineWidth = 4; g.lineCap = 'round'; // los palitos de tiza, de cinco en cinco
      const n = Math.min(f.puntos, 40);
      for (let k = 0; k < n; k++) { const grupo = Math.floor(k / 5), j = k % 5, x0 = 22 + grupo * 44, yy = y + 28;
        g.beginPath(); if (j < 4) { g.moveTo(x0 + j * 8, yy - 14); g.lineTo(x0 + j * 8 + 1, yy + 14); } else { g.moveTo(x0 - 4, yy + 10); g.lineTo(x0 + 30, yy - 10); } g.stroke(); }
    });
    g.font = '600 17px "Lexend", system-ui, sans-serif'; g.textAlign = 'left'; g.fillStyle = '#d3f9d8';
    g.fillText('mecha 3 · embocinada 6 · moñona 9 · mano 1', 18, h - 18);
    tPiz.needsUpdate = true;
  }
  pintarPizarra(null);

  /* los lanzadores */
  const gente = { tulio: persona(PERSONAS.tulio) };
  let yo = null, turno = 'yo';
  function ponerPersona(id) { if (yo) esc.remove(yo); yo = persona(PERSONAS[id] || PERSONAS.ana); esc.add(yo); colocarGente(true); }
  esc.add(gente.tulio);
  const SITIO = { linea: V(-0.42, 0, 0.12), lado: V(-1.1, 0, -1.25) };
  const des = { yo: SITIO.linea.clone(), tulio: SITIO.lado.clone() };
  function colocarGente(ya) {
    des.yo.copy(turno === 'yo' ? SITIO.linea : SITIO.lado); des.tulio.copy(turno === 'yo' ? SITIO.lado : SITIO.linea);
    if (ya || calma) { if (yo) yo.position.copy(des.yo); gente.tulio.position.copy(des.tulio); }
  }

  /* los tejos */
  const quietos = new T.Group(); esc.add(quietos);
    const sombra = malla(new T.CircleGeometry(1, 20), new T.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.25, depthWrite: false }), 0, 0.012, 0, esc);
  sombra.rotation.x = -Math.PI / 2; sombra.visible = false;

  /* la línea punteada (bolitas que crecen con la distancia, para verse de lejos), la estela y el tiro anterior */
  const gBola = new T.SphereGeometry(1, 8, 6);
  const puntos = new T.InstancedMesh(gBola, new T.MeshBasicMaterial({ color: 0xffffff }), 80); puntos.count = 0; esc.add(puntos);
  const fantasma = new T.InstancedMesh(gBola, new T.MeshBasicMaterial({ color: 0x1d2b53, transparent: true, opacity: 0.35 }), 80); fantasma.count = 0; esc.add(fantasma);
  const estela = new T.InstancedMesh(gBola, new T.MeshBasicMaterial({ color: 0xff6b00 }), 40); estela.count = 0; esc.add(estela);
  const marcaLlegada = malla(new T.TorusGeometry(1, 0.12, 6, 24), new T.MeshBasicMaterial({ color: 0xffffff }), 0, 0, 0, esc); marcaLlegada.visible = false;
  let previa = [], fantasmaPts = [], estelaPts = [], conEstela = false;
  const M4 = new T.Matrix4(), Q0 = new T.Quaternion(), S3 = new T.Vector3();
  function bolas(im, pts, k) {
    im.count = Math.min(pts.length, im.instanceMatrix.count);
    for (let i = 0; i < im.count; i++) { const p = pts[i], d = cam.position.distanceTo(p); S3.setScalar(Math.max(0.018, d * k)); M4.compose(p, Q0, S3); im.setMatrixAt(i, M4); }
    im.instanceMatrix.needsUpdate = true;
  }

  /* el chispazo: luz, chispas, papelitos y un poco de humo */
  const NCH = 160, chPos = new Float32Array(NCH * 3), chCol = new Float32Array(NCH * 3), chis = [];
  const gCh = new T.BufferGeometry(); gCh.setAttribute('position', new T.BufferAttribute(chPos, 3)); gCh.setAttribute('color', new T.BufferAttribute(chCol, 3));
  const chispas = new T.Points(gCh, new T.PointsMaterial({ size: 0.04, map: lienzo(32, 32, (g, w) => { const r = g.createRadialGradient(w / 2, w / 2, 0, w / 2, w / 2, w / 2); r.addColorStop(0, '#fff'); r.addColorStop(0.4, 'rgba(255,255,255,.8)'); r.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = r; g.fillRect(0, 0, w, w); }), vertexColors: true, transparent: true, depthWrite: false, blending: T.AdditiveBlending })); chispas.frustumCulled = false; esc.add(chispas);
  for (let i = 0; i < NCH; i++) { chis.push({ v: V(0, 0, 0), vida: 0 }); chPos[i * 3 + 1] = -50; }
  const brillo = new T.Sprite(new T.SpriteMaterial({ map: lienzo(64, 64, (g, w) => { const r = g.createRadialGradient(w / 2, w / 2, 0, w / 2, w / 2, w / 2); r.addColorStop(0, 'rgba(255,255,230,1)'); r.addColorStop(0.3, 'rgba(255,210,90,.8)'); r.addColorStop(1, 'rgba(255,150,0,0)'); g.fillStyle = r; g.fillRect(0, 0, w, w); }),
    transparent: true, depthWrite: false, blending: T.AdditiveBlending })); brillo.visible = false; esc.add(brillo);
  const luz = new T.PointLight(0xffd27a, 0, 3); esc.add(luz);
  const papeles = [];
  const gPapel = new T.PlaneGeometry(0.03, 0.022), mPapel = [lam('#fffaf0', { side: T.DoubleSide }), lam('#f783ac', { side: T.DoubleSide })];
  for (let i = 0; i < 14; i++) { const m = malla(gPapel, mPapel[i % 2], 0, -50, 0, esc); papeles.push({ m, v: V(0, 0, 0), w: V(0, 0, 0), vida: 0 }); }
  let flash = 0, sacudida = 0;
  function estallar(p) {
    const n = calma ? 50 : NCH;
    for (let i = 0; i < n; i++) {
      const c = chis[i], a = rnd() * Math.PI * 2, e = Math.acos(1 - rnd() * 1.6), sp = (calma ? 1.1 : 1.8) * (0.4 + rnd());
      c.v.set(Math.sin(e) * Math.cos(a) * sp, Math.cos(e) * sp * 1.1, Math.sin(e) * Math.sin(a) * sp).addScaledVector(N_CARA, 0.6);
      c.vida = 0.35 + rnd() * 0.45; chPos[i * 3] = p.x; chPos[i * 3 + 1] = p.y; chPos[i * 3 + 2] = p.z;
    }
    if (!calma) papeles.forEach(q => { q.m.position.copy(p); q.v.set((rnd() - 0.5) * 1.6, 0.8 + rnd() * 1.2, (rnd() - 0.5) * 1.6).addScaledVector(N_CARA, 0.5); q.w.set(rnd() * 9, rnd() * 9, rnd() * 9); q.vida = 1.6; });
    brillo.position.copy(p).addScaledVector(N_CARA, 0.04); brillo.visible = true; luz.position.copy(brillo.position);
    flash = calma ? 0.35 : 0.6; if (!calma) sacudida = 0.25;
  }
  function chispazos(dt) {
    let vivas = 0;
    for (let i = 0; i < NCH; i++) {
      const c = chis[i]; if (c.vida <= 0) continue; vivas++;
      c.vida -= dt; c.v.y -= 4 * dt;
      chPos[i * 3] += c.v.x * dt; chPos[i * 3 + 1] += c.v.y * dt; chPos[i * 3 + 2] += c.v.z * dt;
      const k = Math.max(0, Math.min(1, c.vida * 2.2)); chCol[i * 3] = k; chCol[i * 3 + 1] = k * (0.55 + 0.4 * (i % 3) / 2); chCol[i * 3 + 2] = k * 0.25;
      if (c.vida <= 0) chPos[i * 3 + 1] = -50;
    }
    if (vivas) { gCh.attributes.position.needsUpdate = true; gCh.attributes.color.needsUpdate = true; }
    papeles.forEach(q => { if (q.vida <= 0) return; q.vida -= dt; q.v.y -= 2.2 * dt; q.v.multiplyScalar(1 - 1.8 * dt); q.m.position.addScaledVector(q.v, dt); q.m.rotation.x += q.w.x * dt; q.m.rotation.y += q.w.y * dt; if (q.vida <= 0 || q.m.position.y < 0.02) { q.vida = 0; q.m.position.y = -50; } });
    if (flash > 0) { flash -= dt; const k = Math.max(0, flash) / 0.6; brillo.scale.setScalar(0.15 + (1 - k) * (calma ? 0.25 : 0.55)); brillo.material.opacity = k; luz.intensity = k * 3; if (flash <= 0) { brillo.visible = false; luz.intensity = 0; } }
  }

  /* armar la cancha a la distancia de C */
  function armar() {
    const D = C.D;
    cajon.position.set(D, 0, 0);
    armarBocin();
    const largo = D + 6; carril.scale.x = largo; carril.position.x = largo / 2 - 3; tt.repeat.set(largo / 2, 1.7);
    rieles.forEach(r => { r.scale.x = largo; r.position.x = largo / 2 - 3; });
    while (banderas.children.length) banderas.remove(banderas.children[0]);
    [-2.3, 2.3].forEach(z => {
      const x0 = Math.min(3.4, Math.max(1.4, D - 4.6)), x1 = D - 1.4, n = Math.max(5, Math.round((x1 - x0) * 1.3));
      const curva = []; for (let i = 0; i <= n; i++) { const t = i / n; curva.push(V(x0 + (x1 - x0) * t, 2.5 - Math.sin(t * Math.PI) * 0.35, z)); }
      banderas.add(new T.Line(new T.BufferGeometry().setFromPoints(curva), new T.LineBasicMaterial({ color: 0x5c3a1d })));
      [x0, x1].forEach(x => malla(new T.CylinderGeometry(0.05, 0.05, 2.6, 6), mPoste, x, 1.3, z, banderas));
      for (let i = 1; i < n; i++) { const b = malla(gBand, coloresB[i % 3], curva[i].x, curva[i].y, z, banderas); b.rotation.y = Math.PI / 2; }
    });
    pizarra.position.set(0.8, 0, -3.0); pizarra.rotation.y = -0.7;
    limpiar(); encuadrar();
  }
  /** Pone las mechas vivas (índices de F.mechas). */
  function ponerMechas(vivas) {
    mechaMallas.forEach(m => mechasG.remove(m)); mechaMallas = [];
    F.mechas(C).forEach((mc, i) => {
      if (vivas.indexOf(i) < 0) { mechaMallas.push(null); return; }
      const m = new T.Mesh(gMecha, matMecha), p = F.enCara({ D: 0 }, mc.s, mc.u);
      m.position.set(p.x, p.y, p.z).addScaledVector(N_CARA, 0.006);
      const y = E_S.clone().multiplyScalar(-mc.s).add(V(0, 0, -mc.u)).normalize(); // la punta hacia el bocín
      m.quaternion.setFromRotationMatrix(new T.Matrix4().makeBasis(y.clone().cross(N_CARA), y, N_CARA));
      mechasG.add(m); mechaMallas.push(m);
    });
  }
  function limpiar() { while (quietos.children.length) quietos.remove(quietos.children[0]); fantasmaPts = []; estelaPts = []; bolas(fantasma, [], 0); bolas(estela, [], 0); }
  /** Deja un tejo quieto donde quedó (en la greda, en el bocín, en el suelo o al pie del respaldo). */
  function dejarTejo(res, tipo, i) {
    const m = tejo(C.r, tipo), e = m.userData.e;
    if (res.tipo === 'tablero') {
      const p = res.reposo, hund = res.embocinada ? -0.05 : -e * 0.25;
      m.position.set(p.x, p.y, p.z).addScaledVector(N_CARA, hund);
      m.quaternion.setFromUnitVectors(V(0, 1, 0), N_CARA);
      m.rotateX((i % 3 - 1) * 0.12); m.rotateZ(((i * 7) % 5 - 2) * 0.06);
    } else if (res.tipo === 'paso' && res.respaldo) { m.position.set(C.D + F.LADO * F.CA + F.RESPALDO.x - 0.06, C.r, res.fin.z); m.rotation.z = Math.PI / 2.4; }
    else { const f = res.fin; m.position.set(f.x, e / 2, f.z); m.rotation.y = i; }
    quietos.add(m); return m;
  }

  /* la cámara */
  const vista = { pos: V(0, 0, 0), mira: V(0, 0, 0), modo: 'apuntar' }, camMira = V(0, 0, 0);
  function vistaApuntar(p, m) { const D = C.D; p.set(-7, 3.2, 1.0); m.set(D * 0.62, 3.2 - 0.231 * (D * 0.62 + 7), 0); } // de lejos y 13° hacia abajo: el lanzador queda sobre el mando y el cajón en el centro
  function encuadrar() { vistaApuntar(vista.pos, vista.mira); cam.position.copy(vista.pos); camMira.copy(vista.mira); cam.lookAt(camMira); vista.modo = 'apuntar'; }
  function tamano() {
    const w = cont.clientWidth || innerWidth, h = cont.clientHeight || innerHeight;
    tam = [w, h]; ren.setSize(w, h, false); ren.domElement.style.width = w + 'px'; ren.domElement.style.height = h + 'px';
    cam.aspect = w / Math.max(1, h); cam.fov = cam.aspect < 0.8 ? 58 : cam.aspect < 1.2 ? 50 : 42; cam.updateProjectionMatrix();
  }
  addEventListener('resize', tamano); tamano();

  /* el lanzamiento: el brazo atrás, adelante, el vuelo por la parábola y la llegada */
  let anim = null, t = 0;
  function lanzar(res, tipo, cb) {
    const quien = tipo === 'rival' ? gente.tulio : yo, tj = tejo(C.r, tipo);
    quien.userData.brazo.mano.add(tj); tj.position.set(0, -0.04, 0.03); tj.rotation.x = Math.PI / 2;
    anim = { res, tipo, quien, tj, k: 0, fase: 'atras', cb: cb || {}, estelaT: 0, avisos: [] };
    estelaPts = []; bolas(estela, [], 0); puntos.count = 0; marcaLlegada.visible = false;
  }
  function animar(dt) {
    const a = anim; if (!a) return;
    const br = a.quien.userData.brazo.h, cu = a.quien.userData.cuerpo;
    a.k += dt;
    if (a.fase === 'atras') { const k = Math.min(1, a.k / 0.42); br.rotation.x = 1.25 * Math.sin(k * Math.PI / 2); cu.rotation.x = -0.12 * k; if (k >= 1) { a.fase = 'adelante'; a.k = 0; } return; }
    if (a.fase === 'adelante') {
      const k = Math.min(1, a.k / 0.16); br.rotation.x = 1.25 - 2.45 * k; cu.rotation.x = -0.12 + 0.3 * k;
      if (k >= 1) { a.quien.userData.brazo.mano.remove(a.tj); esc.add(a.tj); a.fase = 'vuelo'; a.k = 0; if (a.cb.salir) a.cb.salir(); }
      return;
    }
    if (a.fase === 'vuelo') {
      br.rotation.x += (0 - br.rotation.x) * Math.min(1, dt * 4); cu.rotation.x += (0 - cu.rotation.x) * Math.min(1, dt * 4);
      const tf = a.res.t, k = Math.min(a.k, tf), p = F.posicion(a.res.tiro, k);
      a.tj.position.set(p.x, p.y, p.z); a.tj.rotation.set(0.25, a.k * 14, 0.4 + 0.2 * Math.sin(a.k * 3));
      sombra.visible = true; sombra.position.set(p.x, 0.012, p.z); sombra.scale.setScalar(C.r * (1.4 - Math.min(0.8, p.y / 8)));
      if (conEstela) while (a.estelaT <= k + 1e-9) { const q = F.posicion(a.res.tiro, a.estelaT); estelaPts.push(V(q.x, q.y, q.z)); a.estelaT += 0.1; bolas(estela, estelaPts, 0.0065); }
      if (a.k >= tf) { a.fase = 'llegar'; a.k = 0; sombra.visible = false; if (a.cb.tocar) a.cb.tocar(); }
      return;
    }
    if (a.fase === 'llegar') { // resbala por la greda (si toca) y se queda
      const r = a.res, dur = r.resbalo ? 0.25 + r.resbalo : 0.01, k = Math.min(1, a.k / dur);
      if (r.contacto && r.reposo) { const s = r.contacto.s + (r.reposo.s - r.contacto.s) * k, u = r.contacto.u + (r.reposo.u - r.contacto.u) * k, p = F.enCara(C, s, u); a.tj.position.set(p.x, p.y, p.z).addScaledVector(N_CARA, 0.01); a.tj.quaternion.setFromUnitVectors(V(0, 1, 0), N_CARA); }
      if (k >= 1) { esc.remove(a.tj); anim = null; if (a.cb.fin) a.cb.fin(); }
    }
  }

  function cuadro(dt) {
    t += dt;
    animar(dt); chispazos(dt);
    // la gente: el que tira va a la línea; respiran un poco
    [[yo, des.yo], [gente.tulio, des.tulio]].forEach(([g, d], i) => { if (!g) return; g.position.lerp(d, Math.min(1, dt * 3)); if (!calma) g.userData.cuerpo.position.y = Math.sin(t * 2 + i) * 0.008; });
    // la cámara: apuntando, siguiendo el vuelo o mirando el cajón
    const D = C.D, objP = V(0, 0, 0), objM = V(0, 0, 0);
    if (!calma && anim && anim.fase === 'vuelo' && D > 7) { const p = anim.tj.position; objP.set(p.x - 4.5, Math.max(1.6, p.y * 0.6 + 1.2), 1.8); objM.set(p.x + 3, p.y * 0.6 + 0.3, 0); }
    else if (!calma && (vista.modo === 'cajon' || (anim && anim.fase === 'llegar')) && D > 7) { objP.set(D - 3.6, 2.2, 1.3); objM.set(D - 0.2, F.YB - 0.75, 0); }
    else vistaApuntar(objP, objM);
    const kc = Math.min(1, dt * (calma ? 50 : 2.6));
    cam.position.lerp(objP, kc); camMira.lerp(objM, kc);
    if (sacudida > 0) { sacudida -= dt; cam.position.y += (rnd() - 0.5) * 0.02 * sacudida; }
    cam.lookAt(camMira);
    if (previa.length) bolas(puntos, previa, 0.0045);
    if (fantasmaPts.length) bolas(fantasma, fantasmaPts, 0.0035);
    if (estelaPts.length) bolas(estela, estelaPts, 0.0065);
    // pintar: la vista grande y la lupa encima (en su rectángulo)
    const [w, h] = tam;
    ren.setScissorTest(false); ren.setViewport(0, 0, w, h); ren.render(esc, cam);
    if (lupaR && lupaR.w > 20 && lupaR.h > 20) {
      const b = V(C.D, F.YB, 0); lupa.position.copy(b).addScaledVector(N_CARA, 1.75); lupa.up.copy(E_S); lupa.lookAt(b);
      lupa.aspect = lupaR.w / lupaR.h; lupa.fov = lupa.aspect < 1 ? 29 / lupa.aspect : 29; lupa.updateProjectionMatrix();
      puntos.visible = fantasma.visible = estela.visible = false;
      ren.setScissorTest(true); const y = h - lupaR.y - lupaR.h;
      ren.setScissor(lupaR.x, y, lupaR.w, lupaR.h); ren.setViewport(lupaR.x, y, lupaR.w, lupaR.h);
      const fg = esc.fog; esc.fog = null; ren.render(esc, lupa); esc.fog = fg;
      puntos.visible = fantasma.visible = estela.visible = true;
      ren.setScissorTest(false);
    }
  }

  armar(); ponerPersona(o.persona || 'ana'); ponerMechas([0, 1, 2, 3]);

  return {
    lienzo: ren.domElement,
    /** Cambia la cancha (mini, escolar, grande). */
    cancha(id) { C = F.CANCHAS[id] || C; armar(); },
    persona: ponerPersona,
    mechas: ponerMechas,
    limpiar,
    dejar: dejarTejo,
    turno(q) { turno = q; colocarGente(false); },
    /** La línea punteada del tiro (fracción del vuelo: 1 = entera, con la marca de llegada en la greda). */
    apuntar(tiro, frac) {
      if (!tiro) { previa = []; puntos.count = 0; marcaLlegada.visible = false; return; }
      const r = F.lanzar(C, tiro, []), tf = r.t * Math.min(1, frac), n = Math.max(2, Math.min(80, Math.ceil(tf / 0.035)));
      previa = []; for (let i = 0; i <= n; i++) { const p = F.posicion(tiro, tf * i / n); previa.push(V(p.x, p.y, p.z)); }
      bolas(puntos, previa, 0.0045);
      marcaLlegada.visible = frac >= 1 && !!r.contacto;
      if (marcaLlegada.visible) { const c = r.reposo || r.contacto, p = F.enCara(C, c.s, c.u); marcaLlegada.position.set(p.x, p.y, p.z).addScaledVector(N_CARA, 0.012); marcaLlegada.quaternion.setFromUnitVectors(V(0, 0, 1), N_CARA); marcaLlegada.scale.setScalar(C.r * 1.15); }
    },
    /** El camino del tiro anterior, tenue. */
    fantasma(res) { fantasmaPts = []; if (res) { const n = 40; for (let i = 0; i <= n; i++) { const p = F.posicion(res.tiro, res.t * i / n); fantasmaPts.push(V(p.x, p.y, p.z)); } } bolas(fantasma, fantasmaPts, 0.0035); },
    estela(b) { conEstela = !!b; if (!b) { estelaPts = []; bolas(estela, [], 0); } },
    lanzar, estallar(i) { const mc = F.mechas(C)[i], p = F.enCara(C, mc.s, mc.u); if (mechaMallas[i]) { mechasG.remove(mechaMallas[i]); mechaMallas[i] = null; } estallar(V(p.x, p.y, p.z)); },
    mirarCajon(b) { vista.modo = b ? 'cajon' : 'apuntar'; },
    pizarra: pintarPizarra,
    calma(b) { calma = !!b; },
    lupa(r) { lupaR = r; },
    cuadro,
    ocupado: () => !!anim
  };
}

window.TejoCancha = { disponible: (() => { try { const c = document.createElement('canvas'); return !!(window.WebGLRenderingContext && (c.getContext('webgl') || c.getContext('experimental-webgl'))); } catch (e) { return false; } })(), crear, PERSONAS };
})();
