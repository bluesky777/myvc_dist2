/* Máquina Loca — el taller en 3D (three r128, el de puente.js).
   - El tablero de clavijas (16 × 10 casillas con su agujero en el centro: ahí se ponen las piezas), el marco, la pared
     de tablas, el banco de trabajo y las herramientas colgadas.
   - Las piezas low-poly y chunky, cada una con su forma (no sólo su color): la rampa naranja con rayas, la tabla, el
     resorte rojo con su espiral, la palanca azul con su apoyo, la polea con su rueda y dos cubetas, la cinta con flechas
     que corren, el ventilador con aspas y chorro de aire, el imán en U con N y S.
   - La pelota (balon.glb de la Biblioteca o, si no carga, una esfera de gajos), la canica de acero, las pesas de hierro
     «5 kg», la canasta (canasta.glb) y la tuerca dorada.
   - El cursor de la rejilla, la pieza «fantasma» (la que llevas en la mano: verde si cabe, roja con ✖ si no), la pista
     (la fantasma de la solución, con 💡) y el rastro punteado del último intento.
   - Modo calma: sin confeti, sin polvo y sin el aire que corre; la cámara nunca se mueve.
   window.MaquinaTaller = { disponible, crear(contenedor, {biblio, calma}) } */
(function () {
'use strict';
const T = window.THREE, F = window.MaquinaFisica;
if (!T || !F) { window.MaquinaTaller = { disponible: false }; return; }
const V3 = T.Vector3, CX = F.COLS / 2, CY = F.FILAS / 2;
const M = (c, o) => new T.MeshLambertMaterial(Object.assign({ color: c }, o || {}));
const caja = (x, y, z, c) => new T.Mesh(new T.BoxGeometry(x, y, z), typeof c === 'string' ? M(c) : c);
const cil = (rt, rb, h, c, n) => new T.Mesh(new T.CylinderGeometry(rt, rb, h, n || 14), typeof c === 'string' ? M(c) : c);
const W3 = (x, y, z) => new V3(x - CX, y - CY, z || 0);
const PROF = 0.7; // el fondo de las piezas

/* ---------- texturas de lienzo ---------- */
function lienzo(w, h, pintar, rep) {
  const c = document.createElement('canvas'); c.width = w; c.height = h; pintar(c.getContext('2d'), w, h);
  const t = new T.CanvasTexture(c); t.encoding = T.sRGBEncoding; if (rep) { t.wrapS = t.wrapT = T.RepeatWrapping; t.repeat.set(rep[0], rep[1]); } return t;
}
const texClavijas = () => lienzo(128, 128, (x, w) => {
  x.fillStyle = '#e9c891'; x.fillRect(0, 0, w, w);
  for (let i = 0; i < 18; i++) { x.fillStyle = 'rgba(160,110,50,' + (0.05 + (i % 3) * 0.03) + ')'; x.fillRect(0, i * 7 + (i % 2) * 3, w, 2); }
  x.strokeStyle = 'rgba(120,80,30,.35)'; x.lineWidth = 3; x.strokeRect(0, 0, w, w);
  x.fillStyle = '#7a5223'; x.beginPath(); x.arc(64, 64, 11, 0, 7); x.fill();
  x.fillStyle = '#4a3214'; x.beginPath(); x.arc(64, 66, 8, 0, 7); x.fill();
}, [F.COLS, F.FILAS]);
const texTablas = () => lienzo(256, 256, (x, w) => {
  const cs = ['#9c6b3c', '#a8743f', '#94643a', '#ad7a45'];
  for (let i = 0; i < 8; i++) { x.fillStyle = cs[i % 4]; x.fillRect(0, i * 32, w, 32); x.fillStyle = 'rgba(60,35,10,.35)'; x.fillRect(0, i * 32, w, 3); x.fillStyle = 'rgba(255,255,255,.06)'; x.fillRect(0, i * 32 + 6, w, 2); }
  x.fillStyle = 'rgba(60,35,10,.4)'; [40, 170].forEach(a => [10, 74, 138, 202].forEach(b => { x.beginPath(); x.arc(a, b + 20, 3, 0, 7); x.fill(); }));
}, [6, 3]);
const texRayas = (a, b) => lienzo(64, 16, (x) => { x.fillStyle = a; x.fillRect(0, 0, 64, 16); x.fillStyle = b; for (let i = -1; i < 5; i++) { x.beginPath(); x.moveTo(i * 16, 16); x.lineTo(i * 16 + 8, 16); x.lineTo(i * 16 + 16, 0); x.lineTo(i * 16 + 8, 0); x.fill(); } }, [4, 1]);
const texFlechas = () => lienzo(64, 32, (x) => { x.fillStyle = '#343a40'; x.fillRect(0, 0, 64, 32); x.fillStyle = '#ffd43b'; for (let i = 0; i < 2; i++) { x.beginPath(); x.moveTo(i * 32 + 6, 6); x.lineTo(i * 32 + 18, 16); x.lineTo(i * 32 + 6, 26); x.lineTo(i * 32 + 12, 16); x.fill(); } }, [3, 1]);
const texBalon = () => lienzo(256, 128, (x) => {
  x.fillStyle = '#ffffff'; x.fillRect(0, 0, 256, 128); x.fillStyle = '#212529';
  [[32, 30], [96, 64], [160, 30], [224, 64], [32, 98], [160, 98], [0, 64], [256, 64]].forEach(([a, b]) => { x.beginPath(); for (let k = 0; k < 5; k++) { const t = k / 5 * Math.PI * 2 - Math.PI / 2; x.lineTo(a + Math.cos(t) * 15, b + Math.sin(t) * 15); } x.fill(); });
});
function texTexto(txt, o) {
  o = o || {};
  return lienzo(o.w || 128, o.h || 64, (x, w, h) => {
    if (o.fondo) { x.fillStyle = o.fondo; x.beginPath(); x.roundRect ? x.roundRect(4, 4, w - 8, h - 8, 14) : x.rect(4, 4, w - 8, h - 8); x.fill(); }
    x.font = '800 ' + (o.px || 40) + 'px "Baloo 2","Lexend",system-ui,sans-serif'; x.textAlign = 'center'; x.textBaseline = 'middle';
    if (o.borde) { x.lineJoin = 'round'; x.lineWidth = 8; x.strokeStyle = o.borde; x.strokeText(txt, w / 2, h / 2 + 2); }
    x.fillStyle = o.color || '#15304d'; x.fillText(txt, w / 2, h / 2 + 2);
  });
}
let texBrillo = null;
function brillo() {
  return texBrillo || (texBrillo = lienzo(64, 64, (x) => { const g = x.createRadialGradient(32, 32, 2, 32, 32, 32); g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(0.4, 'rgba(255,250,210,.6)'); g.addColorStop(1, 'rgba(255,250,200,0)'); x.fillStyle = g; x.fillRect(0, 0, 64, 64); }));
}
const sprite = (tex, s) => { const m = new T.Sprite(new T.SpriteMaterial({ map: tex, depthWrite: false })); m.scale.set(s[0], s[1], 1); return m; };

/* ---------- las piezas (un grupo por pieza, en su casilla) ---------- */
const COLOR = { rampa: '#f08c00', tabla: '#fab005', resorte: '#e03131', palanca: '#1971c2', polea: '#2f9e44', cinta: '#343a40', ventilador: '#0c8599', iman: '#c92a2a' };
function armarPieza(p) {
  const g = new T.Group(), t = p.t, a = (p.a || 0) * Math.PI / 180;
  g.userData = { p, partes: {} };
  if (t === 'rampa' || t === 'tabla') {
    const L = F.TIPOS[t].largo, cuerpo = new T.Group(); cuerpo.rotation.z = a; g.add(cuerpo);
    const tabla = caja(L + 0.1, 0.26, PROF, [M(COLOR[t]), M(COLOR[t]), new T.MeshLambertMaterial({ map: texRayas(COLOR[t], '#212529') }), M('#c76b00'), M(COLOR[t]), M(COLOR[t])]);
    cuerpo.add(tabla);
    [-L / 2, L / 2].forEach(x => { const tor = cil(0.07, 0.07, PROF + 0.06, '#495057', 8); tor.rotation.x = Math.PI / 2; tor.position.set(x * 0.85, 0, 0); cuerpo.add(tor); });
  } else if (t === 'resorte') {
    const cuerpo = new T.Group(); cuerpo.rotation.z = a; g.add(cuerpo);
    const base = caja(0.95, 0.12, PROF, '#868e96'); base.position.y = -0.4; cuerpo.add(base);
    const espiral = new T.Group(); espiral.position.y = -0.34; cuerpo.add(espiral);
    const pts = []; for (let i = 0; i <= 64; i++) { const u = i / 64 * Math.PI * 2 * 4; pts.push(new V3(Math.cos(u) * 0.28, i / 64 * 0.36, Math.sin(u) * 0.22)); }
    espiral.add(new T.Mesh(new T.TubeGeometry(new T.CatmullRomCurve3(pts), 96, 0.045, 6, false), M('#ced4da')));
    const pad = caja(0.95, 0.16, PROF, COLOR.resorte); pad.position.y = 0.1; cuerpo.add(pad);
    const tira = caja(0.97, 0.05, PROF + 0.02, '#ffd43b'); tira.position.y = 0.17; cuerpo.add(tira);
    g.userData.partes = { espiral, pad, tira };
    cuerpo.scale.set(1, 1.25, 1);
  } else if (t === 'palanca') {
    const apoyo = cil(0.02, 0.45, 0.55, '#868e96', 3); apoyo.position.y = -0.22; apoyo.rotation.y = Math.PI / 6; apoyo.scale.z = 0.9; g.add(apoyo);
    const giro = new T.Group(); giro.position.y = 0.12; g.add(giro);
    const viga = caja(4.1, 0.22, PROF, COLOR.palanca); giro.add(viga);
    [-2, 2].forEach(x => { const borde = caja(0.12, 0.36, PROF, '#0b4f8a'); borde.position.set(x, 0.16, 0); giro.add(borde); });
    for (let k = -3; k <= 3; k++) { if (!k) continue; const r = caja(0.04, 0.23, PROF + 0.01, '#4dabf7'); r.position.x = k * 0.55; giro.add(r); }
    const eje = cil(0.1, 0.1, PROF + 0.12, '#ffd43b', 10); eje.rotation.x = Math.PI / 2; giro.add(eje);
    giro.rotation.z = p.a === -1 ? -F.PALANCA.tope : F.PALANCA.tope;
    g.userData.partes = { giro };
  } else if (t === 'polea') {
    const P = F.POLEA;
    const rueda = new T.Group(); g.add(rueda);
    const disco = cil(P.sep - 0.05, P.sep - 0.05, 0.22, '#adb5bd', 20); disco.rotation.x = Math.PI / 2; rueda.add(disco);
    const canal = new T.Mesh(new T.TorusGeometry(P.sep - 0.05, 0.05, 6, 24), M('#495057')); rueda.add(canal);
    for (let k = 0; k < 3; k++) { const r = caja(0.12, 1.7, 0.26, '#868e96'); r.rotation.z = k * Math.PI / 3; rueda.add(r); }
    const eje = cil(0.14, 0.14, 0.4, '#ffd43b', 10); eje.rotation.x = Math.PI / 2; g.add(eje);
    const Lc = F.FILAS - (p.f + 0.5), colg = caja(0.14, Lc, 0.14, '#495057'); colg.position.set(0, Lc / 2, -0.25); g.add(colg);
    const cubetas = [], cuerdas = [];
    [-1, 1].forEach(lado => {
      const cu = new T.Group(); cu.position.x = lado * P.sep; g.add(cu);
      const A = P.ancho * lado;
      const suelo = caja(P.ancho * 2 + 0.12, 0.12, PROF, COLOR.polea); suelo.position.y = 0.06; suelo.rotation.z = lado * -0.108; cu.add(suelo);
      const dentro = caja(0.12, P.alto, PROF, COLOR.polea); dentro.position.set(-A, P.alto / 2 + 0.06, 0); cu.add(dentro);
      const bisagra = new T.Group(); bisagra.position.set(A, 0, 0); cu.add(bisagra);
      const fuera = caja(0.12, P.alto, PROF, '#2b8a3e'); fuera.position.set(0, P.alto / 2, 0); bisagra.add(fuera);
      const flecha = sprite(texTexto(lado < 0 ? 'A' : 'B', { color: '#fff', borde: '#1b4d23', px: 44, w: 64, h: 64 }), [0.42, 0.42]); flecha.position.set(0, 0.42, PROF / 2 + 0.05); cu.add(flecha);
      cubetas.push({ cu, bisagra, lado });
      const cuerda = caja(0.05, 1, 0.05, '#e9d8a6'); g.add(cuerda); cuerdas.push(cuerda);
    });
    g.userData.partes = { rueda, cubetas, cuerdas };
  } else if (t === 'cinta') {
    const tex = texFlechas(); if (p.a === -1) { tex.repeat.x = -3; }
    const banda = caja(3, 0.36, PROF, [M('#343a40'), M('#343a40'), new T.MeshLambertMaterial({ map: tex }), M('#212529'), new T.MeshLambertMaterial({ map: tex }), M('#343a40')]);
    g.add(banda);
    [-1.5, 1.5].forEach(x => { const r = cil(0.19, 0.19, PROF + 0.04, '#ffd43b', 12); r.rotation.x = Math.PI / 2; r.position.x = x; g.add(r); });
    const motor = caja(0.5, 0.3, 0.3, '#868e96'); motor.position.set(0, -0.32, -0.1); g.add(motor);
    g.userData.partes = { tex };
  } else if (t === 'ventilador') {
    // un ventilador de cara a nosotros (se ven las aspas girar), con su boquilla y las flechas del chorro hacia donde sopla
    const cara = new T.Group(); g.add(cara);
    const caja2 = cil(0.46, 0.46, 0.34, COLOR.ventilador, 20); caja2.rotation.x = Math.PI / 2; cara.add(caja2);
    const rejilla = new T.Mesh(new T.TorusGeometry(0.38, 0.05, 6, 20), M('#e3fafc')); rejilla.position.z = 0.18; cara.add(rejilla);
    const aspas = new T.Group(); aspas.position.z = 0.2; cara.add(aspas);
    for (let k = 0; k < 4; k++) { const as = caja(0.13, 0.32, 0.04, '#e3fafc'); as.position.y = 0.17; as.rotation.y = 0.5; const h = new T.Group(); h.rotation.z = k * Math.PI / 2; h.add(as); aspas.add(h); }
    const cubo = cil(0.08, 0.08, 0.08, '#ffd43b', 10); cubo.rotation.x = Math.PI / 2; aspas.add(cubo);
    const boca = new T.Group(); boca.rotation.z = a; g.add(boca);
    const cono = cil(0.2, 0.36, 0.22, '#0b7285', 14); cono.rotation.z = -Math.PI / 2; cono.position.x = 0.5; boca.add(cono);
    const aire = new T.Group(); boca.add(aire);
    const tf = texTexto('➜', { color: '#e3fafc', borde: '#0b7285', px: 54, w: 64, h: 64 });
    for (let k = 0; k < 5; k++) { const s = sprite(tf, [0.55, 0.55]); s.material.transparent = true; s.material.rotation = a; s.position.set(0.95 + k * 1.0, 0, 0.3); aire.add(s); }
    g.userData.partes = { aspas, aire };
  } else if (t === 'iman') {
    const u = new T.Mesh(new T.TorusGeometry(0.24, 0.11, 8, 16, Math.PI), M(COLOR.iman)); u.rotation.z = Math.PI; u.position.y = 0.12; g.add(u);
    [-0.24, 0.24].forEach((x, i) => { const pt = caja(0.22, 0.26, 0.22, '#e9ecef'); pt.position.set(x, -0.08, 0); g.add(pt);
      const l = sprite(texTexto(i ? 'S' : 'N', { color: '#fff', borde: '#7d1414', px: 46, w: 64, h: 64 }), [0.3, 0.3]); l.position.set(x, 0.2, 0.25); g.add(l); });
    const campo = new T.Mesh(new T.RingGeometry(F.IMAN.R - 0.06, F.IMAN.R, 48), new T.MeshBasicMaterial({ color: '#ff8787', transparent: true, opacity: 0.35, depthWrite: false }));
    campo.position.z = -0.3; g.add(campo);
    g.userData.partes = { campo };
    [...g.children].forEach(c => { if (c !== campo) { c.scale.multiplyScalar(1.35); c.position.multiplyScalar(1.35); } });
  }
  g.position.copy(W3(p.c + 0.5, p.f + 0.5, 0));
  g.traverse(m => { if (m.isMesh) { m.castShadow = true; } });
  if (p.fija) { const can = sprite(texTexto('🔒', { px: 40, w: 64, h: 64 }), [0.36, 0.36]); can.position.set(0.32, 0.32, 0.6); g.add(can); }
  return g;
}

function cargarScript(src) { return new Promise((si, no) => { const s = document.createElement('script'); s.src = src; s.onload = si; s.onerror = () => no(new Error('no cargó ' + src)); document.head.appendChild(s); }); }
let cargador = null;
function loader() {
  if (cargador) return cargador;
  const J3 = window.Juegos3D || {}, cdn = 'https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/';
  const una = (f, dir, hay) => (hay() ? Promise.resolve() : (J3.enApp ? cargarScript('../' + f).then(() => { if (!hay()) throw new Error('vacío'); }) : Promise.reject(new Error('suelto'))).catch(() => cargarScript(cdn + dir + f)));
  return (cargador = una('GLTFLoader.js', 'loaders/', () => T.GLTFLoader).then(() => una('meshopt_decoder.js', 'libs/', () => window.MeshoptDecoder))
    .then(() => { const l = new T.GLTFLoader(); if (window.MeshoptDecoder) l.setMeshoptDecoder(window.MeshoptDecoder); l.setCrossOrigin('anonymous'); return l; }));
}

function crear(cont, o) {
  o = o || {};
  let calma = !!o.calma, seguroA = 70, seguroB = 150;
  const ren = new T.WebGLRenderer({ antialias: (window.devicePixelRatio || 1) < 2, powerPreference: 'high-performance' });
  ren.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75)); ren.outputEncoding = T.sRGBEncoding;
  ren.shadowMap.enabled = true; ren.shadowMap.type = T.PCFSoftShadowMap;
  cont.appendChild(ren.domElement);
  const scene = new T.Scene(), cam = new T.PerspectiveCamera(30, 1, 0.5, 120);
  scene.background = new T.Color('#5c3d23');
  scene.add(new T.HemisphereLight('#fff8ec', '#6b4a2b', 0.85));
  const sol = new T.DirectionalLight('#fff1d6', 0.7); sol.position.set(-5, 9, 14); sol.castShadow = true;
  sol.shadow.mapSize.set(1024, 1024); Object.assign(sol.shadow.camera, { left: -11, right: 11, top: 8, bottom: -8, near: 1, far: 40 }); sol.shadow.bias = -0.002;
  scene.add(sol); scene.add(sol.target);

  /* ---------- el taller ---------- */
  const pared = new T.Mesh(new T.PlaneGeometry(60, 34), new T.MeshLambertMaterial({ map: texTablas() })); pared.position.set(0, 2, -1.6); scene.add(pared);
  const tablero = new T.Mesh(new T.PlaneGeometry(F.COLS, F.FILAS), new T.MeshLambertMaterial({ map: texClavijas() })); tablero.position.set(0, 0, -0.5); tablero.receiveShadow = true; scene.add(tablero);
  // el marco
  [[0, CY + 0.32, F.COLS + 1.1, 0.5], [-CX - 0.3, 0, 0.6, F.FILAS + 0.9], [CX + 0.3, 0, 0.6, F.FILAS + 0.9]].forEach(([x, y, w, h]) => { const m = caja(w, h, 1.1, '#6b3f1d'); m.position.set(x, y, -0.4); m.receiveShadow = true; scene.add(m); });
  // el banco de trabajo
  const banco = caja(F.COLS + 3, 0.6, 3, '#b07a44'); banco.position.set(0, -CY - 0.3, 0.6); banco.receiveShadow = true; scene.add(banco);
  const frente = caja(F.COLS + 3, 2.4, 0.3, '#8a5a2b'); frente.position.set(0, -CY - 1.8, 2); scene.add(frente);
  // herramientas colgadas a los lados (adorno)
  const herramientas = new T.Group(); scene.add(herramientas);
  [[-CX - 2.4, 2.6, '#c92a2a'], [-CX - 2.4, -0.6, '#1971c2'], [CX + 2.4, 2.2, '#2f9e44'], [CX + 2.4, -1, '#f08c00']].forEach(([x, y, c], i) => {
    const mango = caja(0.3, 1.6, 0.3, c); mango.position.set(x, y, -1.2); herramientas.add(mango);
    const cab = i % 2 ? caja(0.9, 0.35, 0.3, '#adb5bd') : cil(0.12, 0.12, 1.0, '#adb5bd', 8); cab.position.set(x, y + 0.9, -1.2); if (!(i % 2)) cab.rotation.z = Math.PI / 2; herramientas.add(cab);
  });
  const nivelG = new T.Group(); scene.add(nivelG);
  const piezasG = new T.Group(); scene.add(piezasG);
  const movil = new T.Group(); scene.add(movil);

  /* ---------- la pelota, la canica, las pesas ---------- */
  const glb = {};
  function cargar(id) {
    if (!o.biblio) return Promise.resolve(null);
    return glb[id] || (glb[id] = loader().then(l => new Promise((si, no) => {
      const t = setTimeout(() => no(new Error('tardó')), 30000);
      l.load(o.biblio + 'modelos/' + id + '.glb', g => { clearTimeout(t); si(g); }, undefined, e => { clearTimeout(t); no(e instanceof Error ? e : new Error('no cargó')); });
    })).catch(e => { console.warn('Máquina: sin ' + id + ' (' + e.message + ')'); return null; }));
  }
  const ajustar = (obj, ancho) => { const bx = new T.Box3().setFromObject(obj), s = new V3(); bx.getSize(s); const k = ancho / Math.max(s.x, s.y, s.z, 1e-3), c = new V3(); bx.getCenter(c); const env = new T.Group(); obj.position.sub(c); env.add(obj); env.scale.setScalar(k); return env; };
  function bolaMesh(tipo) {
    const B = F.BOLAS[tipo], g = new T.Group();
    if (tipo === 'balon') {
      const m = new T.Mesh(new T.IcosahedronGeometry(B.r, 2), new T.MeshLambertMaterial({ map: texBalon() })); g.add(m);
      cargar('balon').then(gl => { if (!gl) return; const s = ajustar(gl.scene.clone(), B.r * 2); g.remove(m); g.add(s); s.traverse(x => { if (x.isMesh) x.castShadow = true; }); });
    } else if (tipo === 'canica') {
      g.add(new T.Mesh(new T.SphereGeometry(B.r, 20, 14), new T.MeshPhongMaterial({ color: '#ced4da', specular: '#ffffff', shininess: 90 })));
      const vena = new T.Mesh(new T.TorusGeometry(B.r * 0.98, 0.025, 6, 24), M('#495057')); g.add(vena);
    } else {
      g.add(new T.Mesh(new T.SphereGeometry(B.r, 14, 10), M('#343a40')));
      const asa = new T.Mesh(new T.TorusGeometry(0.17, 0.06, 6, 12, Math.PI), M('#212529')); asa.position.y = B.r * 0.85; g.add(asa);
      const et = sprite(texTexto('5 kg', { color: '#fff', px: 40, w: 128, h: 64 }), [0.6, 0.3]); et.position.set(0, -0.02, B.r + 0.05); g.add(et);
    }
    g.traverse(x => { if (x.isMesh) x.castShadow = true; });
    return g;
  }
  let bolas = [], canasta = null, tuerca = null, tubo = null, nivelAct = null, piezasAct = [], grupos = [], mecG = [];

  function vaciar(gr) { while (gr.children.length) { const c = gr.children[0]; gr.remove(c); c.traverse(m => { if (m.geometry) m.geometry.dispose(); }); } }
  /** El nivel: muros, canasta, tuerca, la pelota y las pesas en su sitio de salida. */
  function nivel(n) {
    nivelAct = n; vaciar(nivelG); vaciar(movil); bolas = [];
    (n.muros || []).forEach(m => {
      const r = m[4] || 0.15, dx = m[2] - m[0], dy = m[3] - m[1], L = Math.hypot(dx, dy);
      const mu = caja(L + r * 2, Math.max(0.26, r * 2), 0.9, [M('#8d5524'), M('#8d5524'), M('#c08552'), M('#6b3f1d'), M('#a0693b'), M('#8d5524')]);
      mu.position.copy(W3((m[0] + m[2]) / 2, (m[1] + m[3]) / 2, -0.05)); mu.rotation.z = Math.atan2(dy, dx); mu.castShadow = mu.receiveShadow = true; nivelG.add(mu);
    });
    if (n.canasta) {
      const [x, y] = n.canasta; canasta = new T.Group(); canasta.position.copy(W3(x, y, 0)); nivelG.add(canasta);
      // una canasta de mimbre, abierta arriba (la de la física: 1,4 de ancho por dentro y 0,95 de alto)
      const mimbre = lienzo(128, 96, (x, w, h) => {
        x.fillStyle = '#b5773a'; x.fillRect(0, 0, w, h);
        for (let j = 0; j < 6; j++) for (let i = 0; i < 8; i++) { x.fillStyle = (i + j) % 2 ? '#d6a05a' : '#9c6230'; x.beginPath(); x.ellipse(i * 16 + 8, j * 16 + 8, 8, 5.5, 0, 0, 7); x.fill(); }
        x.fillStyle = 'rgba(60,30,5,.35)'; for (let j = 1; j < 6; j++) x.fillRect(0, j * 16 - 1, w, 2);
      });
      const matM = new T.MeshLambertMaterial({ map: mimbre }), borde = M('#7a4a1c');
      const frente = caja(1.56, 0.95, 0.1, matM); frente.position.set(0, 0.47, PROF / 2 + 0.05); canasta.add(frente);
      const atras = caja(1.56, 0.95, 0.1, matM); atras.position.set(0, 0.47, -PROF / 2 - 0.05); canasta.add(atras);
      [-0.74, 0.74].forEach(dx => { const p = caja(0.12, 0.98, PROF + 0.2, matM); p.position.set(dx, 0.48, 0); p.rotation.z = dx < 0 ? -0.06 : 0.06; canasta.add(p); });
      const fondo = caja(1.5, 0.12, PROF + 0.2, borde); canasta.add(fondo);
      const aro = caja(1.7, 0.12, PROF + 0.34, borde); aro.position.y = 0.97; canasta.add(aro);
      const hueco = caja(1.36, 0.13, PROF + 0.02, M('#3d240c')); hueco.position.y = 0.975; canasta.add(hueco);
      canasta.traverse(q => { if (q.isMesh) q.castShadow = true; });
      const meta = sprite(texTexto('🏁 Meta', { fondo: '#fff3bf', color: '#15304d', px: 34, w: 192, h: 64 }), [1.1, 0.37]); meta.position.set(0, 1.45, 0.4); canasta.add(meta);
    }
    tuerca = null;
    if (n.tuerca) {
      tuerca = new T.Group(); tuerca.position.copy(W3(n.tuerca[0], n.tuerca[1], 0.1)); nivelG.add(tuerca);
      const hx = cil(0.24, 0.24, 0.14, new T.MeshPhongMaterial({ color: '#fcc419', specular: '#fff3bf', shininess: 80, flatShading: true }), 6); hx.rotation.x = Math.PI / 2; tuerca.add(hx);
      const hueco = cil(0.1, 0.1, 0.16, '#5c3d23', 10); hueco.rotation.x = Math.PI / 2; tuerca.add(hueco);
      const halo = sprite(brillo(), [0.9, 0.9]); halo.material.transparent = true; halo.material.opacity = 0.7; tuerca.add(halo);
    }
    // el tubo de salida de la pelota
    const b = n.bola;
    tubo = new T.Group(); nivelG.add(tubo); tubo.visible = !n.sinTubo;
    const vx = b.vx || 0, dir = vx > 0.1 ? -1 : vx < -0.1 ? 1 : 0;
    const t1 = cil(0.42, 0.42, 1.0, '#868e96', 14), t2 = cil(0.46, 0.46, 0.14, '#495057', 14);
    if (dir) { t1.rotation.z = Math.PI / 2; t2.rotation.z = Math.PI / 2; t1.position.set(dir * 0.75, 0, -0.15); t2.position.set(dir * 0.28, 0, -0.15); }
    else { t1.position.set(0, 0.75, -0.15); t2.position.set(0, 0.28, -0.15); }
    tubo.add(t1, t2); tubo.position.copy(W3(b.x, b.y, 0));
    bolas.push(bolaMesh(b.tipo || 'balon'));
    (n.pesas || []).forEach(() => bolas.push(bolaMesh('pesa')));
    bolas.forEach(m => movil.add(m));
    reposo();
  }
  /** Las piezas puestas (las fijas del nivel primero, como en la física). */
  function piezas(lista) {
    vaciar(piezasG); piezasAct = lista.slice(); grupos = []; mecG = [];
    lista.forEach(p => { const g = armarPieza(p); piezasG.add(g); grupos.push(g); if (p.t === 'palanca' || p.t === 'polea') mecG.push(g); });
    reposo();
  }
  function ponerMec(g, q) {
    const P = g.userData.partes, p = g.userData.p;
    if (p.t === 'palanca') { P.giro.rotation.z = q; return; }
    const base = -F.POLEA.baja, alto = F.POLEA.alto;
    P.cubetas.forEach((c, i) => {
      const k = c.lado; c.cu.position.y = base + q * k;
      const arriba = k === 1 ? q >= F.POLEA.viaje - 0.02 : q <= -F.POLEA.viaje + 0.02;
      const obj = arriba ? -k * 1.2 : 0; c.bisagra.rotation.z += (obj - c.bisagra.rotation.z) * (calma ? 1 : 0.3);
      const cu = P.cuerdas[i], y0 = 0, y1 = base + q * k + alto; cu.scale.y = Math.max(0.05, y0 - y1); cu.position.set(k * F.POLEA.sep, (y0 + y1) / 2, 0.05);
    });
    P.rueda.rotation.z = -q / F.POLEA.sep;
  }
  /** Todo a su sitio de salida. */
  function reposo() {
    if (!nivelAct) return;
    const n = nivelAct, sal = [[n.bola.x, n.bola.y]].concat((n.pesas || []).map(p => [p[0], p[1]]));
    bolas.forEach((m, i) => { if (sal[i]) { m.position.copy(W3(sal[i][0], sal[i][1], 0)); m.rotation.set(0, 0, 0); m.visible = true; } });
    mecG.forEach(g => ponerMec(g, g.userData.p.t === 'palanca' ? (g.userData.p.a === -1 ? -F.PALANCA.tope : F.PALANCA.tope) : 0));
    if (tuerca) tuerca.visible = true;
  }
  /** Un cuadro de la grabación: [x, y, ang] por bola, [vx, vy, w] de la pelota y q de cada máquina. */
  function cuadro(f) {
    const nb = bolas.length;
    for (let i = 0; i < nb; i++) { const m = bolas[i]; m.position.set(f[i * 3] - CX, f[i * 3 + 1] - CY, 0); m.rotation.z = f[i * 3 + 2]; }
    for (let k = 0; k < mecG.length; k++) ponerMec(mecG[k], f[nb * 3 + 3 + k]);
  }

  /* ---------- cursor, fantasma, pista y rastro ---------- */
  const cursor = new T.Group(); scene.add(cursor);
  const matCur = new T.MeshBasicMaterial({ color: '#ffd43b' }), matCurB = new T.MeshBasicMaterial({ color: '#15304d' });
  [[0, 0.5, 1.04, 0.08], [0, -0.5, 1.04, 0.08], [0.5, 0, 0.08, 1.04], [-0.5, 0, 0.08, 1.04]].forEach(([x, y, w, h]) => {
    const b = new T.Mesh(new T.PlaneGeometry(w + 0.08, h + 0.08), matCurB); b.position.set(x, y, 0.44); cursor.add(b);
    const a = new T.Mesh(new T.PlaneGeometry(w, h), matCur); a.position.set(x, y, 0.45); cursor.add(a);
  });
  let fantasma = null, pistaG = null, cruz = null;
  function translucir(g, color, op) {
    g.traverse(m => { if (m.isMesh || m.isSprite) { m.material = m.material.clone ? (Array.isArray(m.material) ? m.material.map(x => x.clone()) : m.material.clone()) : m.material; (Array.isArray(m.material) ? m.material : [m.material]).forEach(x => { x.transparent = true; x.opacity = op; x.depthWrite = false; if (color && x.color) x.color.lerp(new T.Color(color), 0.55); }); m.castShadow = false; } });
  }
  function ponCursor(c, f, ver) { cursor.visible = !!ver; cursor.position.copy(W3(c + 0.5, f + 0.5, 0)); }
  function ponFantasma(p, ok) {
    if (fantasma) { scene.remove(fantasma); fantasma = null; }
    if (cruz) { scene.remove(cruz); cruz = null; }
    if (!p) return;
    fantasma = armarPieza(Object.assign({}, p, { fija: false })); translucir(fantasma, ok ? '#69db7c' : '#ff6b6b', 0.6); fantasma.position.z = 0.15; scene.add(fantasma);
    if (!ok) { cruz = sprite(texTexto('✖', { color: '#fff', borde: '#a3261b', px: 54, w: 64, h: 64 }), [0.7, 0.7]); cruz.position.copy(W3(p.c + 0.5, p.f + 0.5, 0.8)); scene.add(cruz); }
  }
  function ponPista(p) {
    if (pistaG) { scene.remove(pistaG); pistaG = null; }
    if (!p) return;
    pistaG = armarPieza(Object.assign({}, p, { fija: false })); translucir(pistaG, '#8ce99a', 0.45); pistaG.position.z = 0.1;
    const fo = sprite(texTexto('💡', { px: 46, w: 64, h: 64 }), [0.6, 0.6]); fo.position.set(0, 0.75, 0.7); pistaG.add(fo);
    scene.add(pistaG);
  }
  let rastroG = null;
  function rastro(cuadros) {
    if (rastroG) { scene.remove(rastroG); rastroG.geometry.dispose(); rastroG = null; }
    if (!cuadros || cuadros.length < 2) return;
    const pts = []; for (let k = 0; k < cuadros.length; k += 2) pts.push(new V3(cuadros[k][0] - CX, cuadros[k][1] - CY, 0.36));
    const geo = new T.BufferGeometry().setFromPoints(pts);
    rastroG = new T.Line(geo, new T.LineDashedMaterial({ color: '#ffffff', dashSize: 0.16, gapSize: 0.14, transparent: true, opacity: 0.85 }));
    rastroG.computeLineDistances(); scene.add(rastroG);
  }

  /* ---------- efectos ---------- */
  const chispas = [];
  function efecto(n, x, y, fuerza) {
    if (n === 'tuerca' && tuerca) tuerca.visible = false;
    if (n === 'resorte') { const g = grupos[x]; if (g && g.userData.partes.espiral) g.userData.anim = 1; return; }
    if (calma) return;
    const p = W3(x, y, 0.4);
    const cols = n === 'canasta' ? ['#ffd43b', '#63e6be', '#ff8787', '#74c0fc', '#ffffff', '#b197fc'] : n === 'tuerca' ? ['#fcc419', '#fff3bf'] : ['#e9d8a6', '#d6b98c'];
    const cuantas = n === 'canasta' ? 60 : n === 'tuerca' ? 18 : Math.min(10, 3 + Math.round(fuerza || 0));
    for (let i = 0; i < cuantas; i++) {
      const s = new T.Sprite(new T.SpriteMaterial({ map: brillo(), color: cols[i % cols.length], transparent: true, depthWrite: false, blending: n === 'polvo' ? T.NormalBlending : T.AdditiveBlending }));
      s.position.copy(p); s.scale.setScalar(n === 'polvo' ? 0.3 : 0.32); scene.add(s);
      const ang = Math.random() * Math.PI * 2, v = n === 'canasta' ? 3 + Math.random() * 4 : n === 'polvo' ? 0.8 + Math.random() : 1.5 + Math.random() * 2;
      chispas.push({ s, v: new V3(Math.cos(ang) * v, Math.abs(Math.sin(ang)) * v + (n === 'canasta' ? 3 : 0.5), 0), t: 0, vida: n === 'polvo' ? 0.5 : 1.3, g: n === 'polvo' ? 0 : 6 });
    }
  }

  /* ---------- la cámara: el tablero entero en el hueco que dejan el HUD de arriba y la bandeja de abajo ---------- */
  let ancho = 1, alto = 1;
  function encajar() {
    ancho = cont.clientWidth || innerWidth; alto = cont.clientHeight || innerHeight;
    ren.setSize(ancho, alto, false); ren.domElement.style.width = ancho + 'px'; ren.domElement.style.height = alto + 'px';
    cam.aspect = ancho / alto;
    const libre = Math.max(120, alto - seguroA - seguroB), s = Math.max((F.COLS + (ancho < 600 ? 0.7 : 1.2)) / ancho, (F.FILAS + 1.4) / libre);
    const visH = s * alto, d = visH / 2 / Math.tan(cam.fov * Math.PI / 360);
    const dy = (seguroA - seguroB) / 2 * s;
    cam.position.set(0, dy + 0.4, d); cam.lookAt(0, dy, 0); cam.updateProjectionMatrix();
  }
  addEventListener('resize', encajar); encajar();
  const ray = new T.Raycaster(), plano = new T.Plane(new V3(0, 0, 1), 0), tmp = new V3();
  function celda(cx, cy) {
    const r = ren.domElement.getBoundingClientRect();
    ray.setFromCamera({ x: (cx - r.left) / r.width * 2 - 1, y: -((cy - r.top) / r.height) * 2 + 1 }, cam);
    if (!ray.ray.intersectPlane(plano, tmp)) return null;
    const c = Math.floor(tmp.x + CX), f = Math.floor(tmp.y + CY);
    return c >= 0 && c < F.COLS && f >= 0 && f < F.FILAS ? { c, f } : null;
  }
  function proyectar(x, y) { const v = W3(x, y, 0).project(cam); return { x: (v.x + 1) / 2 * ancho, y: (1 - v.y) / 2 * alto }; }

  /* ---------- el bucle ---------- */
  let ult = performance.now(), andando = false, tiempo = 0;
  function anim(ahora) {
    const dt = Math.min(0.05, (ahora - ult) / 1000); ult = ahora; tiempo += dt;
    if (tuerca && tuerca.visible && !calma) tuerca.rotation.y += dt * 2;
    cursor.children.forEach(m => { if (m.material === matCur) m.material.color.setHSL(0.13, 1, calma ? 0.6 : 0.55 + Math.sin(tiempo * 5) * 0.08); });
    grupos.forEach(g => {
      const P = g.userData.partes, p = g.userData.p;
      if (p.t === 'ventilador') { if (andando) P.aspas.rotation.z -= dt * (calma ? 6 : 22);  P.aire.children.forEach((s, k) => { s.position.x = 0.95 + ((k * 1.0 + (andando && !calma ? tiempo * 3 : 0)) % 5); s.material.opacity = andando ? 0.75 : 0.6; }); }
      if (p.t === 'cinta' && andando && !calma) P.tex.offset.x -= dt * (p.a === -1 ? -1 : 1) * 1.2;
      if (p.t === 'iman') P.campo.visible = !andando;
      if (P.espiral && g.userData.anim) { g.userData.anim = Math.max(0, g.userData.anim - dt * 4); const k = 1 - Math.sin(g.userData.anim * Math.PI) * 0.45; P.espiral.scale.y = k; P.pad.position.y = 0.1 - (1 - k) * 0.3; P.tira.position.y = P.pad.position.y + 0.07; }
    });
    for (let i = chispas.length - 1; i >= 0; i--) {
      const c = chispas[i]; c.t += dt; c.v.y -= c.g * dt; c.s.position.addScaledVector(c.v, dt); c.s.material.opacity = Math.max(0, 1 - c.t / c.vida);
      if (c.t > c.vida) { scene.remove(c.s); c.s.material.dispose(); chispas.splice(i, 1); }
    }
    ren.render(scene, cam);
    requestAnimationFrame(anim);
  }
  requestAnimationFrame(anim);

  return {
    nivel, piezas, reposo, cuadro, efecto, celda, proyectar, rastro,
    cursor: ponCursor, fantasma: ponFantasma, pista: ponPista,
    andando(b) { andando = !!b; if (pistaG) pistaG.visible = !b; cursor.visible = cursor.visible && !b; },
    calma(b) { calma = !!b; },
    seguro(a, b) { seguroA = a; seguroB = b; encajar(); },
    lienzo: ren.domElement
  };
}

window.MaquinaTaller = { disponible: true, crear, COLOR };
})();
