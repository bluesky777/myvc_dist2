/* Tambor Bailarín — la tarima en 3D (three r128, el de puente.js): la tarima de madera con su faldón de colores, el arco
   de bombillos y las guirnaldas de banderines, los instrumentos que se mueven cuando suenan (tambor alegre, llamador,
   maracas, guacharaca y el del ritmo: gaitas, tiple, arpa o marimba), el cielo de cada región, el bailarín (niña o niño
   de la Biblioteca, con sus clips) que da los pasos, y el público de animales (mono, tucán, rana, guacamaya, perezoso)
   que baila al pulso. Modo calma: sin destellos ni barridos de luz; el público se mece suave.
   window.TamborEscena = { disponible, crear(contenedor, {biblio, calma, bailarin}) } */
(function () {
'use strict';
const T = window.THREE;
if (!T) { window.TamborEscena = { disponible: false }; return; }
const V3 = T.Vector3;
const M = (c, o) => new T.MeshStandardMaterial(Object.assign({ color: c, roughness: 0.75, metalness: 0, flatShading: true }, o || {}));
const caja = (x, y, z, c) => new T.Mesh(new T.BoxGeometry(x, y, z), typeof c === 'string' ? M(c) : c);
const cil = (rt, rb, h, c, n) => new T.Mesh(new T.CylinderGeometry(rt, rb, h, n || 14), typeof c === 'string' ? M(c) : c);
const esf = (r, c, n) => new T.Mesh(new T.SphereGeometry(r, n || 10, Math.max(6, (n || 10) - 3)), typeof c === 'string' ? M(c) : c);

/* el cielo de cada región: degradado y siluetas en un lienzo (barato y bonito) */
const CIELOS = {
  caribe: { arriba: '#16205c', abajo: '#7b3fa0', horizonte: '#f08a5d', astro: 'luna', silueta: 'palmas', suelo: '#3b2a4d' },
  fuego: { arriba: '#1a0b2e', abajo: '#8a1c3c', horizonte: '#ff7b39', astro: 'luna', silueta: 'palmas', suelo: '#3a1c24' },
  andes: { arriba: '#3d2c8d', abajo: '#e8638c', horizonte: '#ffc46b', astro: 'sol', silueta: 'montanas', suelo: '#3e3a2a' },
  pueblo: { arriba: '#1f3c88', abajo: '#7aa6e0', horizonte: '#ffd89c', astro: 'luna', silueta: 'pueblo', suelo: '#3a3f2e' },
  llano: { arriba: '#5b2a86', abajo: '#ff7e47', horizonte: '#ffd166', astro: 'sol', silueta: 'llano', suelo: '#4a3b1f' },
  pacifico: { arriba: '#0b2e3f', abajo: '#1f7a6e', horizonte: '#9be3c5', astro: 'luna', silueta: 'selva', suelo: '#1e3b30' }
};
function pintarCielo(c) {
  const lz = document.createElement('canvas'); lz.width = 1024; lz.height = 512; const x = lz.getContext('2d');
  const g = x.createLinearGradient(0, 0, 0, 512); g.addColorStop(0, c.arriba); g.addColorStop(0.62, c.abajo); g.addColorStop(0.78, c.horizonte); g.addColorStop(1, c.suelo);
  x.fillStyle = g; x.fillRect(0, 0, 1024, 512);
  // estrellas
  x.fillStyle = 'rgba(255,255,255,.85)'; for (let i = 0; i < 90; i++) { const sx = Math.random() * 1024, sy = Math.random() * 240; x.globalAlpha = 0.3 + Math.random() * 0.7; x.fillRect(sx, sy, 2, 2); }
  x.globalAlpha = 1;
  if (c.astro === 'luna') { x.fillStyle = '#fff7d6'; x.beginPath(); x.arc(800, 110, 44, 0, 7); x.fill(); x.fillStyle = c.arriba; x.beginPath(); x.arc(822, 98, 40, 0, 7); x.fill(); }
  else { const s = x.createRadialGradient(512, 360, 10, 512, 360, 150); s.addColorStop(0, '#fff3b0'); s.addColorStop(0.35, 'rgba(255,214,102,.9)'); s.addColorStop(1, 'rgba(255,214,102,0)'); x.fillStyle = s; x.fillRect(300, 200, 424, 300); }
  const base = 400; x.fillStyle = 'rgba(20,10,40,.85)';
  const palma = (px, h, k) => { x.save(); x.translate(px, base); x.fillRect(-4 * k, -h, 8 * k, h); for (let a = 0; a < 6; a++) { x.save(); x.translate(0, -h); x.rotate(-1.4 + a * 0.55); x.beginPath(); x.ellipse(32 * k, 0, 36 * k, 7 * k, 0.25, 0, 7); x.fill(); x.restore(); } x.restore(); };
  if (c.silueta === 'palmas') { x.fillRect(0, base - 6, 1024, 112); palma(90, 150, 1.1); palma(180, 110, 0.9); palma(880, 170, 1.2); palma(960, 120, 0.9); x.fillStyle = 'rgba(255,255,255,.15)'; for (let i = 0; i < 6; i++) x.fillRect(260 + i * 90, base + 4 + (i % 2) * 6, 50, 2); }
  if (c.silueta === 'montanas' || c.silueta === 'pueblo') {
    [['rgba(60,40,100,.7)', 300, 0.0], ['rgba(30,20,60,.9)', 345, 1.3]].forEach(([col, alto, f]) => { x.fillStyle = col; x.beginPath(); x.moveTo(0, base + 20); for (let i = 0; i <= 16; i++) x.lineTo(i * 64, alto + Math.sin(i * 1.7 + f) * 40 + (i % 3) * 14); x.lineTo(1024, 512); x.lineTo(0, 512); x.fill(); });
    if (c.silueta === 'pueblo') { x.fillStyle = 'rgba(20,14,40,.95)'; x.fillRect(430, 300, 70, 110); x.beginPath(); x.moveTo(425, 300); x.lineTo(465, 250); x.lineTo(505, 300); x.fill(); x.fillRect(458, 228, 6, 26); x.fillRect(450, 236, 22, 5); for (let i = 0; i < 7; i++) x.fillRect(120 + i * 110, 360 - (i % 3) * 8, 70, 60); x.fillStyle = 'rgba(255,214,120,.8)'; for (let i = 0; i < 7; i++) x.fillRect(140 + i * 110, 378 - (i % 3) * 8, 10, 12); }
  }
  if (c.silueta === 'llano') { x.fillRect(0, base, 1024, 112); x.beginPath(); x.ellipse(820, base - 40, 60, 34, 0, 0, 7); x.fill(); x.fillRect(816, base - 40, 8, 40); x.save(); x.translate(210, base); x.fillRect(-30, -34, 60, 18); x.fillRect(22, -48, 12, 24); x.fillRect(-26, -18, 6, 18); x.fillRect(20, -18, 6, 18); x.restore(); }
  if (c.silueta === 'selva') { x.fillStyle = 'rgba(5,30,25,.9)'; x.beginPath(); x.moveTo(0, 512); for (let i = 0; i <= 32; i++) x.lineTo(i * 32, 330 + Math.sin(i * 2.1) * 30 + Math.cos(i * 0.7) * 20); x.lineTo(1024, 512); x.fill(); palma(140, 180, 1.2); palma(900, 160, 1.1); }
  const t = new T.CanvasTexture(lz); t.encoding = T.sRGBEncoding; return t;
}
// un emoji como sprite (los aplausos, las notas y las estrellas que suben)
const texEmoji = {};
function spriteEmoji(e, tam) {
  if (!texEmoji[e]) { const c = document.createElement('canvas'); c.width = c.height = 96; const x = c.getContext('2d'); x.font = '76px "Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(e, 48, 54); texEmoji[e] = new T.CanvasTexture(c); }
  const s = new T.Sprite(new T.SpriteMaterial({ map: texEmoji[e], transparent: true, depthWrite: false })); s.scale.setScalar(tam || 0.5); return s;
}

function crear(cont, o) {
  o = o || {};
  let calma = !!o.calma;
  const ren = new T.WebGLRenderer({ antialias: (window.devicePixelRatio || 1) < 2, powerPreference: 'high-performance' });
  ren.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5)); ren.outputEncoding = T.sRGBEncoding;
  cont.appendChild(ren.domElement);
  const scene = new T.Scene(), cam = new T.PerspectiveCamera(42, 1, 0.1, 120);
  scene.fog = new T.Fog('#2a1f4d', 18, 46);
  scene.add(new T.HemisphereLight('#ffe1c2', '#2a2050', 0.55));
  const sol = new T.DirectionalLight('#fff1d6', 0.55); sol.position.set(3, 8, 6); scene.add(sol);
  const foco1 = new T.PointLight('#ffb36b', 0.6, 10), foco2 = new T.PointLight('#8fd8ff', 0.5, 10); foco1.position.set(-3, 4.5, 2.5); foco2.position.set(3, 4.5, 2.5); scene.add(foco1, foco2);

  /* ---------- el piso, la tarima y el faldón ---------- */
  const suelo = new T.Mesh(new T.PlaneGeometry(80, 60), M('#3b2a4d')); suelo.rotation.x = -Math.PI / 2; scene.add(suelo);
  const plaza = new T.Mesh(new T.CircleGeometry(9, 28), M('#6e2f1c')); plaza.rotation.x = -Math.PI / 2; plaza.position.set(0, 0.01, 3); scene.add(plaza);
  const tarima = new T.Group(); scene.add(tarima);
  const ALTO = 0.7;
  const maderas = ['#8a4f22', '#74401b', '#9a5a2a'];
  for (let i = 0; i < 9; i++) { const t = caja(7.6, 0.14, 0.42, maderas[i % 3]); t.position.set(0, ALTO, -1.6 + i * 0.42 + 0.21); tarima.add(t); }
  const cuerpo = caja(7.5, ALTO, 3.7, '#6b4226'); cuerpo.position.y = ALTO / 2 - 0.04; cuerpo.position.z = 0.1; tarima.add(cuerpo);
  // el faldón: franjas amarilla, azul y roja con un festón de triángulos
  [['#ffcd00', 0.5, 0.26], ['#003893', 0.24, 0.13], ['#ce1126', 0.11, 0.13]].forEach(([c, y, h]) => { const f = caja(7.62, h, 0.06, M(c, { roughness: 0.6 })); f.position.set(0, y, 1.98); tarima.add(f); });
  for (let i = 0; i < 19; i++) { const tr = new T.Mesh(new T.ConeGeometry(0.17, 0.26, 3), M(['#ffffff', '#ffcd00'][i % 2])); tr.rotation.z = Math.PI; tr.rotation.y = Math.PI / 6; tr.position.set(-3.6 + i * 0.4, ALTO - 0.06, 2.02); tarima.add(tr); }
  // escalones
  for (let i = 0; i < 2; i++) { const e = caja(1.6, 0.22, 0.4, '#8a5a30'); e.position.set(0, 0.11 + i * 0.22, 2.4 - i * 0.35); tarima.add(e); }

  /* ---------- el arco de bombillos y las guirnaldas ---------- */
  const poste = c => { const p = cil(0.1, 0.12, 4.6, '#5a3a22', 8); p.position.set(c, 2.3, -1.4); scene.add(p); };
  poste(-3.7); poste(3.7);
  const viga = caja(7.8, 0.22, 0.22, '#5a3a22'); viga.position.set(0, 4.55, -1.4); scene.add(viga);
  const bombillos = [], COL_B = ['#ffd43b', '#ff6b6b', '#69db7c', '#4dabf7', '#f783ac'];
  const curva = (a, b, caida, n, alPoner) => { for (let i = 0; i <= n; i++) { const t = i / n, p = new V3().lerpVectors(a, b, t); p.y -= Math.sin(Math.PI * t) * caida; alPoner(p, i, t); } };
  curva(new V3(-3.7, 4.4, -1.3), new V3(3.7, 4.4, -1.3), 0.5, 22, (p, i) => { const m = esf(0.11, M(COL_B[i % 5], { emissive: COL_B[i % 5], emissiveIntensity: 0.8 }), 7); m.position.copy(p); scene.add(m); bombillos.push(m); });
  const banderines = [], COL_F = ['#e64980', '#fab005', '#12b886', '#4c6ef5', '#fd7e14', '#be4bdb', '#ffffff'];
  const guirnalda = (a, b, caida, n) => {
    const g = new T.Group(); scene.add(g);
    curva(a, b, caida, n, (p, i) => { const f = new T.Mesh(new T.ConeGeometry(0.16, 0.34, 3), M(COL_F[(i * 3) % COL_F.length], { side: T.DoubleSide })); f.scale.z = 0.12; f.rotation.z = Math.PI; f.position.copy(p).add(new V3(0, -0.15, 0)); f.userData.f = Math.random() * 6; g.add(f); banderines.push(f); });
    return g;
  };
  guirnalda(new V3(-3.7, 4.2, -1.2), new V3(3.7, 4.2, -1.2), 0.9, 18);
  guirnalda(new V3(-3.7, 4.5, -1.3), new V3(-7.5, 3.4, 6), 0.8, 14);
  guirnalda(new V3(3.7, 4.5, -1.3), new V3(7.5, 3.4, 6), 0.8, 14);
  guirnalda(new V3(-3.7, 3.6, -1.2), new V3(3.7, 3.6, 2.2), 1.1, 16);
  // el telón de fondo
  const telon = caja(7.4, 3.8, 0.08, M('#5c1230', { roughness: 0.95 })); telon.position.set(0, ALTO + 1.9, -1.55); scene.add(telon);
  for (let i = 0; i < 8; i++) { const pl = caja(0.06, 3.8, 0.12, '#5e1630'); pl.position.set(-3.3 + i * 0.95, ALTO + 1.9, -1.5); scene.add(pl); }
  // los conos de luz (se barren con el pulso; en calma, quietos)
  const conos = [-2, 2].map((x, i) => { const g = new T.ConeGeometry(1.1, 4, 18, 1, true); g.translate(0, -2, 0); const m = new T.Mesh(g, new T.MeshBasicMaterial({ color: i ? '#5fd3ff' : '#ff6fb5', transparent: true, opacity: 0.12, depthWrite: false, blending: T.AdditiveBlending, side: T.DoubleSide })); m.position.set(x * 1.3, 4.5, -1.2); scene.add(m); return m; });

  /* ---------- los instrumentos (se mueven cuando suenan) ---------- */
  const ins = {};
  function tambor(x, z, alto, r, col) {
    const g = new T.Group(); g.position.set(x, ALTO + 0.07, z); scene.add(g);
    const cuerpoT = cil(r, r * 0.78, alto, col, 14); cuerpoT.position.y = alto / 2; g.add(cuerpoT);
    for (let i = 0; i < 2; i++) { const a = new T.Mesh(new T.TorusGeometry(r * (i ? 0.8 : 1.0), 0.03, 5, 16), M('#3b2412')); a.rotation.x = Math.PI / 2; a.position.y = i ? 0.08 : alto - 0.02; g.add(a); }
    // las cuerdas en zigzag
    for (let i = 0; i < 8; i++) { const c = caja(0.02, alto * 0.9, 0.02, '#f1e3c4'); const ang = i / 8 * Math.PI * 2; c.position.set(Math.cos(ang) * r * 0.9, alto / 2, Math.sin(ang) * r * 0.9); c.rotation.z = (i % 2 ? 0.35 : -0.35); c.lookAt(new V3(0, alto / 2, 0)); c.rotateX(Math.PI / 2); g.add(c); }
    const cuero = cil(r * 0.98, r * 0.98, 0.03, '#f3e1bd', 16); cuero.position.y = alto; g.add(cuero);
    return { g, cuero, golpe: 0 };
  }
  ins.alegre = tambor(-2.9, -0.4, 0.95, 0.32, '#8b4a1f');
  ins.llamador = tambor(-2.35, 0.2, 0.62, 0.22, '#a0592a');
  ins.tambora = tambor(-3.0, 0.65, 0.55, 0.38, '#5c3b1e');
  ins.bombo = ins.tambora; ins.cununo = ins.alegre;
  { // maracas
    const g = new T.Group(); g.position.set(2.7, ALTO + 0.07, 0.5); scene.add(g);
    const mesa = cil(0.32, 0.32, 0.6, '#6b4226', 10); mesa.position.y = 0.3; g.add(mesa);
    const par = [-1, 1].map(s => { const m = new T.Group(); m.position.set(s * 0.14, 0.62, 0); const bola = esf(0.13, M(s < 0 ? '#e8590c' : '#2b8a3e'), 10); bola.position.y = 0.32; bola.scale.y = 1.15; const mango = cil(0.025, 0.03, 0.3, '#f1e3c4', 6); mango.position.y = 0.12; m.add(bola, mango); m.rotation.z = s * 0.3; g.add(m); return m; });
    ins.maracas = { g, par, golpe: 0 };
  }
  { // guacharaca y su horquilla
    const g = new T.Group(); g.position.set(3.0, ALTO + 0.07, -0.4); scene.add(g);
    const tubo = cil(0.07, 0.07, 1.1, '#c49a6c', 10); tubo.rotation.z = 0.5; tubo.position.y = 0.75; g.add(tubo);
    for (let i = 0; i < 9; i++) { const r = new T.Mesh(new T.TorusGeometry(0.072, 0.012, 4, 10), M('#7a5530')); r.rotation.x = Math.PI / 2; r.position.set(-0.24 + i * 0.06 * Math.sin(0.5) * 2.1, 0.5 + i * 0.06 * Math.cos(0.5) * 1.05, 0); r.rotation.y = 0.5; g.add(r); }
    const tenedor = new T.Group(); const mango = cil(0.025, 0.025, 0.35, '#5a3a22', 6); mango.rotation.z = Math.PI / 2; tenedor.add(mango);
    for (let i = 0; i < 3; i++) { const p = caja(0.25, 0.012, 0.012, '#c0c0c0'); p.position.set(0.28, 0, -0.04 + i * 0.04); tenedor.add(p); }
    tenedor.position.set(0.15, 0.95, 0.15); g.add(tenedor);
    ins.guacharaca = { g, tenedor, golpe: 0 };
  }
  // el instrumento del ritmo, atrás
  const especial = new T.Group(); especial.position.set(0, ALTO + 0.07, -1.05); scene.add(especial);
  let marimbaBarras = [];
  function ponerEspecial(r) {
    while (especial.children.length) especial.remove(especial.children[0]);
    marimbaBarras = [];
    const mel = r && r.mel;
    if (mel === 'marimba') {
      const marco = caja(2.4, 0.08, 0.6, '#5a3a22'); marco.position.y = 0.75; especial.add(marco);
      for (let i = 0; i < 4; i++) { const p = cil(0.04, 0.04, 0.75, '#5a3a22', 6); p.position.set(i < 2 ? -1.1 : 1.1, 0.37, i % 2 ? 0.25 : -0.25); especial.add(p); }
      for (let i = 0; i < 12; i++) { const b = caja(0.15, 0.05, 0.58 - i * 0.022, M('#c88a4a', { emissive: '#ffb347', emissiveIntensity: 0 })); b.position.set(-1.05 + i * 0.19, 0.82, 0); especial.add(b); marimbaBarras.push(b); const tu = cil(0.05, 0.05, 0.5 - i * 0.025, '#3d7a3a', 6); tu.position.set(-1.05 + i * 0.19, 0.52, 0.08); especial.add(tu); }
      ins.marimba = { g: especial, golpe: 0 };
    } else if (mel === 'arpa') {
      const g = new T.Group(); g.position.x = 1.5; especial.add(g);
      const col = caja(0.1, 1.8, 0.1, '#7a4a22'); col.position.set(-0.45, 0.9, 0); col.rotation.z = -0.1; g.add(col);
      const caj = caja(0.2, 1.7, 0.3, '#a0622e'); caj.position.set(0.35, 0.85, 0); caj.rotation.z = 0.35; g.add(caj);
      const arriba = caja(1.0, 0.1, 0.1, '#7a4a22'); arriba.position.set(-0.05, 1.75, 0); arriba.rotation.z = -0.15; g.add(arriba);
      const cuerdas = []; for (let i = 0; i < 9; i++) { const c = caja(0.008, 1.0 + i * 0.07, 0.008, M('#fff3bf', { emissive: '#fff3bf', emissiveIntensity: 0.2 })); c.position.set(-0.35 + i * 0.08, 0.95 + i * 0.05, 0); g.add(c); cuerdas.push(c); }
      ins.arpa = { g, cuerdas, golpe: 0 };
      ins.cuatro = guitarra(-1.6, 0.6, '#d9a066');
    } else if (mel === 'bandola') {
      ins.tiple = guitarra(-1.4, 0.8, '#e0a96d'); ins.bandola = guitarra(1.5, 0.65, '#b97a3c');
      ins.cucharas = ins.maracas;
    } else { // gaitas
      const g = new T.Group(); g.position.x = 1.6; especial.add(g);
      [-0.15, 0.15].forEach((x, i) => { const t = cil(0.04, 0.05, 1.2, '#4b2e1a', 8); t.position.set(x, 0.8, 0); t.rotation.z = i ? -0.08 : 0.08; g.add(t); const p = cil(0.1, 0.05, 0.14, '#222', 8); p.position.set(x, 1.45, 0); g.add(p); const pluma = new T.Mesh(new T.ConeGeometry(0.06, 0.25, 5), M('#f8f9fa')); pluma.position.set(x, 1.6, 0); g.add(pluma); });
      ins.melodia = { g, golpe: 0 };
      ins.palmas = { g: new T.Group(), golpe: 0 };
    }
  }
  function guitarra(x, k, col) {
    const g = new T.Group(); g.position.set(x, 0, 0); especial.add(g);
    const c1 = cil(0.32 * k, 0.32 * k, 0.12, col, 14); c1.rotation.x = Math.PI / 2; c1.position.y = 0.55; g.add(c1);
    const c2 = cil(0.25 * k, 0.25 * k, 0.12, col, 14); c2.rotation.x = Math.PI / 2; c2.position.y = 0.55 + 0.42 * k; g.add(c2);
    const boca = cil(0.08 * k, 0.08 * k, 0.13, '#2b1a0e', 10); boca.rotation.x = Math.PI / 2; boca.position.y = 0.6 + 0.3 * k; g.add(boca);
    const brazo = caja(0.08, 0.75 * k, 0.05, '#5a3a22'); brazo.position.y = 0.55 + 0.42 * k + 0.55 * k; g.add(brazo);
    const pata = caja(0.04, 0.5, 0.3, '#3b2412'); pata.position.set(0, 0.25, -0.12); g.add(pata);
    g.rotation.z = x < 0 ? 0.25 : -0.25;
    return { g, golpe: 0 };
  }

  /* ---------- los GLB de la Biblioteca (el cargador de Mi Finca) ---------- */
  function cargarScript(src) { return new Promise((si, no) => { const s = document.createElement('script'); s.src = src; s.onload = si; s.onerror = () => no(new Error('no cargó ' + src)); document.head.appendChild(s); }); }
  let cargador = null;
  function loader() {
    if (cargador) return cargador;
    const J3 = window.Juegos3D || {}, cdn = 'https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/';
    const una = (f, dir, hay) => (hay() ? Promise.resolve() : (J3.enApp ? cargarScript('../' + f).then(() => { if (!hay()) throw new Error('vacío'); }) : Promise.reject(new Error('suelto'))).catch(() => cargarScript(cdn + dir + f)));
    return (cargador = una('GLTFLoader.js', 'loaders/', () => T.GLTFLoader).then(() => una('meshopt_decoder.js', 'libs/', () => window.MeshoptDecoder))
      .then(() => { const l = new T.GLTFLoader(); if (window.MeshoptDecoder) l.setMeshoptDecoder(window.MeshoptDecoder); l.setCrossOrigin('anonymous'); return l; }));
  }
  const glb = {};
  function cargar(id) {
    return glb[id] || (glb[id] = loader().then(l => new Promise((si, no) => {
      const t = setTimeout(() => no(new Error('tardó')), 30000);
      l.load(o.biblio + 'modelos/' + id + '.glb', g => { clearTimeout(t); si(g); }, undefined, e => { clearTimeout(t); no(e instanceof Error ? e : new Error('no cargó')); });
    })).catch(e => { console.warn('Tambor: sin ' + id + ' (' + e.message + ')'); return null; }));
  }
  const tope = a => (a instanceof Int8Array ? 127 : a instanceof Uint8Array ? 255 : a instanceof Int16Array ? 32767 : a instanceof Uint16Array ? 65535 : 1);
  function cajaReal(raiz) {
    raiz.updateMatrixWorld(true);
    const c = new T.Box3(), v = new V3(), q2 = new V3(), suma = new V3(), m = new T.Matrix4();
    raiz.traverse(ob => {
      const pos = ob.isMesh && ob.geometry ? ob.geometry.attributes.position : null;
      if (!pos) return;
      const k = pos.normalized ? 1 / tope(pos.array || (pos.data && pos.data.array)) : 1, paso = Math.max(1, Math.floor(pos.count / 3000));
      const si = ob.isSkinnedMesh ? ob.geometry.attributes.skinIndex : null, sw = si ? ob.geometry.attributes.skinWeight : null;
      for (let i = 0; i < pos.count; i += paso) {
        v.set(pos.getX(i) * k, pos.getY(i) * k, pos.getZ(i) * k);
        if (si && sw) {
          v.applyMatrix4(ob.bindMatrix); suma.set(0, 0, 0);
          const pe = [sw.getX(i), sw.getY(i), sw.getZ(i), sw.getW(i)], hu = [si.getX(i), si.getY(i), si.getZ(i), si.getW(i)], tot = pe[0] + pe[1] + pe[2] + pe[3] || 1;
          for (let j = 0; j < 4; j++) { const b = ob.skeleton.bones[hu[j]]; if (!pe[j] || !b) continue; m.multiplyMatrices(b.matrixWorld, ob.skeleton.boneInverses[hu[j]]); suma.addScaledVector(q2.copy(v).applyMatrix4(m), pe[j] / tot); }
          v.copy(suma).applyMatrix4(ob.bindMatrixInverse).applyMatrix4(ob.matrixWorld);
        } else v.applyMatrix4(ob.matrixWorld);
        c.expandByPoint(v);
      }
    });
    return c;
  }
  function enSuSitio(c) {
    const k = c.clone();
    k.tracks.forEach(t => {
      if (!/Hips\.position$/.test(t.name)) return;
      const n = t.times.length, L = (t.times[n - 1] - t.times[0]) || 1, v = t.values = Float32Array.from(t.values);
      for (let j = 0; j < 3; j += 2) { const d = v[(n - 1) * 3 + j] - v[j]; for (let i = 0; i < n; i++) v[i * 3 + j] -= d * (t.times[i] - t.times[0]) / L; }
    });
    return k;
  }
  const mezcladores = [], usados = {};
  function poner(id, padre, alto, color) {
    const r = { obj: null, mezclador: null, clips: {} };
    const resp = new T.Group(); const cu = caja(alto * 0.5, alto * 0.55, alto * 0.4, color || '#888'); cu.position.y = alto * 0.3; const ca = esf(alto * 0.2, color || '#aaa', 8); ca.position.y = alto * 0.75; resp.add(cu, ca);
    padre.add(resp); r.obj = resp;
    cargar(id).then(g => {
      if (!g) return;
      // el mismo animal dos veces: el segundo es una copia (los del público no tienen esqueleto)
      const s = usados[id] ? g.scene.clone(true) : g.scene; usados[id] = true;
      s.traverse(m => { if (m.isMesh) { if (m.isSkinnedMesh) m.frustumCulled = false; if (m.material) m.material.side = T.FrontSide; } });
      if (g.animations && g.animations.length) {
        r.mezclador = new T.AnimationMixer(s);
        g.animations.forEach(c => { const n = c.name.toLowerCase(); r.clips[n] = r.mezclador.clipAction(/walk|caminar/.test(n) ? enSuSitio(c) : c); });
        const quieto = r.clips.dance || r.clips.idle || null;
        if (quieto) { quieto.play(); r.mezclador.update(0); }
        mezcladores.push(r.mezclador);
      }
      const caja3 = cajaReal(s), tam = caja3.getSize(new V3()), cen = caja3.getCenter(new V3());
      const k = Math.min(alto / Math.max(0.001, tam.y), alto * 1.6 / Math.max(0.001, tam.x, tam.z)), envol = new T.Group();
      s.position.x -= cen.x; s.position.y -= caja3.min.y; s.position.z -= cen.z; envol.add(s); envol.scale.setScalar(k);
      padre.remove(resp); padre.add(envol); r.obj = envol;
      if (r.alCargar) r.alCargar();
    });
    return r;
  }

  /* ---------- el bailarín ---------- */
  const HOGAR = new V3(0, ALTO + 0.07, 0.55);
  const bail = { g: new T.Group(), giro: new T.Group(), m: null, id: '', paso: null, actual: null, x: 0, z: 0, ry: 0, y: 0 };
  bail.g.add(bail.giro); scene.add(bail.g); bail.g.position.copy(HOGAR);
  const sombra = new T.Mesh(new T.CircleGeometry(0.45, 18), new T.MeshBasicMaterial({ color: '#000', transparent: true, opacity: 0.28, depthWrite: false })); sombra.rotation.x = -Math.PI / 2; sombra.position.set(0, ALTO + 0.075, 0.55); scene.add(sombra);
  const bailarines = {};
  function ponerBailarin(id) {
    if (bail.id === id) return; bail.id = id;
    // cada bailarín se carga una vez y se guarda (un esqueleto no se copia)
    Object.keys(bailarines).forEach(k => { bailarines[k].pivote.visible = k === id; });
    if (!bailarines[id]) {
      const pivote = new T.Group(); bail.giro.add(pivote);
      const m = poner(id, pivote, 1.55, /nina/.test(id) ? '#d6336c' : '#1971c2');
      bailarines[id] = { pivote, m };
      m.alCargar = () => { if (bail.id === id) { bail.actual = null; clip('dance'); } };
    }
    bail.m = bailarines[id].m; bail.actual = null; clip('dance');
  }
  function clip(nombre, unaVez, vel) {
    const w = bail.m && bail.m.clips; if (!w || !bail.m.mezclador) return;
    const a = w[nombre] || w.dance || w.idle; if (!a) return;
    const act = bail.actual;
    if (a === act && !unaVez) return;
    a.reset(); a.setLoop(unaVez ? T.LoopOnce : T.LoopRepeat, unaVez ? 1 : Infinity); a.clampWhenFinished = !!unaVez; a.timeScale = vel || 1; a.fadeIn(0.15).play();
    if (act && act !== a) act.fadeOut(0.15);
    bail.actual = a;
  }
  /** Un paso de baile que dura `dur` segundos. */
  function paso(nombre, dur) {
    dur = Math.max(0.3, dur || 0.6);
    bail.paso = { n: nombre, t: 0, dur, ry0: bail.ry, x0: bail.x, z0: bail.z };
    const w = bail.m && bail.m.clips;
    if (!w) return;
    if (nombre === 'palmas') { clip('jumping_jacks', true, 1.6); estallido('👏', 1); }
    else if (nombre === 'salto' || nombre === 'remate') clip(w.jump ? 'jump' : 'victory', true, 1.3);
    else if (nombre === 'adelante' || nombre === 'atras' || nombre === 'desplazamiento' || nombre === 'derecha' || nombre === 'izquierda') clip('walk', false, 1.4);
    else if (nombre === 'panuelo') { clip('wave', true, 1.2); estallido('🧣', 1); }
    else if (nombre === 'zapateo') { clip('dance', false, 1.6); }
    else clip('dance');
    if (nombre === 'remate') estallido('🎉', 2);
  }
  function moverPaso(dt) {
    const p = bail.paso;
    if (!p) { // vuelve a su sitio poco a poco
      bail.x += (0 - bail.x) * Math.min(1, dt * 3); bail.z += (0 - bail.z) * Math.min(1, dt * 3); bail.y = 0;
      bail.ry += (0 - bail.ry) * Math.min(1, dt * 4);
      return;
    }
    p.t += dt; const k = Math.min(1, p.t / p.dur), e = k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2, ida = Math.sin(Math.PI * k);
    const lado = calma ? 0.5 : 1;
    switch (p.n) {
      case 'adelante': bail.z = p.z0 + 0.5 * e * lado; bail.y = ida * 0.06; break;
      case 'atras': bail.z = p.z0 - 0.5 * e * lado; bail.y = ida * 0.06; break;
      case 'derecha': bail.x = p.x0 + 0.6 * e * lado; break;
      case 'izquierda': bail.x = p.x0 - 0.6 * e * lado; break;
      case 'desplazamiento': bail.x = p.x0 + Math.sin(Math.PI * 2 * k) * 0.8 * lado; break;
      case 'giro': bail.ry = p.ry0 + Math.PI * 2 * e; break;
      case 'salto': case 'remate': bail.y = ida * (calma ? 0.15 : 0.35); if (p.n === 'remate') bail.ry = p.ry0 + Math.PI * 2 * e; break;
      case 'zapateo': bail.y = Math.abs(Math.sin(Math.PI * 4 * k)) * 0.08; break;
      case 'basico': bail.x = p.x0 + Math.sin(Math.PI * 2 * k) * 0.15; break;
      default: break;
    }
    if (k >= 1) {
      bail.paso = null; if (p.n === 'giro' || p.n === 'remate') bail.ry = 0;
      if (p.n !== 'palmas' && p.n !== 'salto' && p.n !== 'remate' && p.n !== 'panuelo') clip('dance');
      else setTimeout(() => { if (!bail.paso) clip('dance'); }, 350);
    }
  }

  /* ---------- el público: animales que bailan al pulso ---------- */
  const PUBLICO = [['mono', -4.6, 2.2, 0.85, '#8d5a3b'], ['tucan', -5.4, 3.6, 0.7, '#222'], ['rana', -3.9, 3.9, 0.55, '#5c940d'], ['guacamaya', 4.7, 2.3, 0.85, '#e03131'], ['perezoso', 5.4, 3.7, 0.8, '#8a7a5c'], ['rana', 4.0, 4.1, 0.5, '#5c940d']];
  const publico = PUBLICO.map(([id, x, z, alto, col], i) => {
    const g = new T.Group(); g.position.set(x, 0, z); g.rotation.y = Math.atan2(-x, 6 - z) * 0.85; scene.add(g);
    const inner = new T.Group(); g.add(inner); poner(id, inner, alto, col);
    return { g, inner, fase: i * 0.37, salto: 0 };
  });
  const flotan = [];
  function estallido(e, n, donde) {
    for (let i = 0; i < (n || 1); i++) {
      const s = spriteEmoji(e, 0.45); const base = donde || new V3(bail.g.position.x, bail.g.position.y + 1.7, bail.g.position.z);
      s.position.copy(base).add(new V3((Math.random() - 0.5) * 0.8, Math.random() * 0.2, 0)); scene.add(s); flotan.push({ s, v: 0.9 + Math.random() * 0.5, vida: 1.3 });
    }
  }

  /* ---------- el cielo y la vista ---------- */
  let cieloTex = null;
  function ritmo(r) {
    const c = CIELOS[(r && r.cielo) || 'caribe'] || CIELOS.caribe;
    if (cieloTex) cieloTex.dispose(); cieloTex = pintarCielo(c); scene.background = cieloTex;
    scene.fog.color.set(c.abajo); suelo.material.color.set(c.suelo);
    ponerEspecial(r);
  }
  let pies = 0.42; // dónde quedan los pies del bailarín (fracción del alto): justo encima de la pista de notas
  function medir() {
    const w = cont.clientWidth || innerWidth, h = cont.clientHeight || innerHeight;
    ren.setSize(w, h, false); cam.aspect = w / h;
    const angosto = w / h < 0.9;
    cam.fov = angosto ? 50 : 40;
    cam.position.set(0, angosto ? 3.0 : 2.7, angosto ? 11.5 : 9.6);
    cam.lookAt(0, 1.75, 0);
    cam.clearViewOffset(); cam.updateProjectionMatrix(); cam.updateMatrixWorld(true);
    // corre la imagen para que los pies del bailarín caigan donde termina la pista
    const p = HOGAR.clone().project(cam), y = (1 - p.y) / 2 * h, corr = y - pies * h;
    cam.setViewOffset(w, h, 0, corr, w, h);
    cam.updateProjectionMatrix();
  }
  addEventListener('resize', medir);

  /* ---------- cada cuadro ---------- */
  let pulsoAnt = 0, animo = 0.5, tiempo = 0, destello = 0;
  function cuadro(dt, pulso, eventos) {
    tiempo += dt; dt = Math.min(dt, 0.05);
    mezcladores.forEach(m => m.update(dt));
    moverPaso(dt);
    bail.g.position.set(HOGAR.x + bail.x, HOGAR.y + bail.y, HOGAR.z + bail.z); bail.giro.rotation.y = bail.ry;
    sombra.position.x = bail.g.position.x; sombra.position.z = bail.g.position.z; sombra.scale.setScalar(1 - bail.y * 0.8);
    const fase = pulso - Math.floor(pulso), golpeP = Math.floor(pulso) !== Math.floor(pulsoAnt) && pulso >= 0; pulsoAnt = pulso;
    if (golpeP) destello = 1;
    destello = Math.max(0, destello - dt * 4);
    const late = Math.pow(1 - fase, 3);
    // el público
    publico.forEach((p, i) => {
      const f = ((pulso + p.fase) % 1 + 1) % 1, b = Math.sin(Math.PI * f);
      p.salto = Math.max(0, p.salto - dt * 1.5);
      const alto = calma ? 0.03 : 0.05 + animo * 0.12;
      p.inner.position.y = b * alto + Math.sin(Math.PI * Math.min(1, p.salto * 2)) * (calma ? 0.1 : 0.4) * (p.salto > 0 ? 1 : 0);
      p.inner.scale.set(1 + (1 - b) * 0.05, 1 - (1 - b) * 0.06, 1 + (1 - b) * 0.05);
      p.inner.rotation.z = calma ? 0 : Math.sin((pulso + i) * Math.PI) * 0.08 * animo;
    });
    // las luces
    bombillos.forEach((b, i) => { b.material.emissiveIntensity = calma ? 0.7 : 0.45 + 0.9 * (((i + Math.floor(pulso)) % 3 === 0) ? late : 0.1); });
    banderines.forEach(f => { f.rotation.x = Math.sin(tiempo * 1.6 + f.userData.f) * (calma ? 0.05 : 0.18); });
    conos.forEach((c, i) => { c.rotation.z = calma ? (i ? -0.25 : 0.25) : Math.sin(tiempo * 0.7 + i * 2) * 0.45; c.material.opacity = calma ? 0.08 : 0.07 + 0.1 * late; });
    foco1.intensity = calma ? 0.6 : 0.45 + 0.45 * late; foco2.intensity = calma ? 0.5 : 0.35 + 0.4 * late;
    // los instrumentos que sonaron
    (eventos || []).forEach(ev => { const x = ins[ev.ins]; if (x) x.golpe = Math.max(x.golpe, ev.v); });
    Object.keys(ins).forEach(k => { const x = ins[k]; if (!x || x._v === tiempo) return; x._v = tiempo; x.golpe = Math.max(0, x.golpe - dt * 6); });
    [ins.alegre, ins.llamador, ins.tambora].forEach(x => { if (x) { x.cuero.scale.y = 1 + x.golpe * 4; x.g.scale.set(1 + x.golpe * 0.04, 1 - x.golpe * 0.05, 1 + x.golpe * 0.04); } });
    if (ins.maracas) ins.maracas.par.forEach((m, i) => { m.rotation.x = Math.sin(tiempo * 40 + i) * ins.maracas.golpe * 0.4; m.position.y = 0.62 + ins.maracas.golpe * 0.06; });
    if (ins.guacharaca) ins.guacharaca.tenedor.position.x = 0.15 + Math.sin(tiempo * 30) * ins.guacharaca.golpe * 0.12;
    if (ins.arpa) ins.arpa.cuerdas.forEach((c, i) => { c.position.z = Math.sin(tiempo * 60 + i) * ins.arpa.golpe * 0.02; c.material.emissiveIntensity = 0.2 + ins.arpa.golpe * 0.8; });
    ['tiple', 'bandola', 'cuatro', 'melodia'].forEach(k => { const x = ins[k]; if (x && x.g) x.g.scale.setScalar(1 + x.golpe * 0.05); });
    if (marimbaBarras.length && ins.marimba) { const n = Math.floor(tiempo * 9) % marimbaBarras.length; marimbaBarras.forEach((b, i) => { b.material.emissiveIntensity = i === n ? ins.marimba.golpe * 0.9 : b.material.emissiveIntensity * 0.85; }); }
    // lo que sube
    for (let i = flotan.length - 1; i >= 0; i--) { const f = flotan[i]; f.vida -= dt; f.s.position.y += f.v * dt; f.s.material.opacity = Math.min(1, f.vida * 1.5); if (f.vida <= 0) { scene.remove(f.s); f.s.material.dispose(); flotan.splice(i, 1); } }
    // la cámara se mece con el pulso (no en calma)
    if (!calma) { cam.position.x = Math.sin(tiempo * 0.3) * 0.3; cam.lookAt(0, 1.75, 0); }
    ren.render(scene, cam);
  }

  ritmo(null);
  medir();
  ponerBailarin(o.bailarin || 'nina-gafas');
  return {
    lienzo: ren.domElement,
    cuadro, ritmo, paso, estallido,
    bailarin: ponerBailarin,
    clip,
    calma(b) { calma = !!b; if (calma) cam.position.x = 0; },
    animo(x) { animo = Math.max(0, Math.min(1, x)); },
    /** El público aplaude (bien) o mira (mal). */
    celebrar(fuerte) {
      publico.forEach((p, i) => { if (fuerte || i % 2 === 0) p.salto = 1; });
      const e = ['⭐', '🎵', '❤️', '🎶']; publico.forEach((p, i) => { if (fuerte || i % 3 === 0) estallido(e[i % e.length], 1, new V3(p.g.position.x, 1.4, p.g.position.z)); });
      if (fuerte && !bail.paso) { clip('jump', true, 1.3); setTimeout(() => { if (!bail.paso) clip('dance'); }, 900); }
    },
    triste() { if (!bail.paso) { clip('laugh', true); setTimeout(() => { if (!bail.paso) clip('dance'); }, 1200); } },
    quieto(b) { clip(b ? 'idle' : 'dance'); },
    reservar(f) { pies = f; medir(); },
    medir
  };
}

window.TamborEscena = { disponible: true, crear };
})();
