/* Honda Estelar — el espacio en three r128: planetas low-poly (con su halo de gravedad: más masa, halo más grande),
   anillos, agujeros negros, rocas, lunas con su número y su forma, cristales, la honda con el robot piloto (robot.glb
   de la Biblioteca, con «lanzar», «hechizo» y «caer»), la nave, su estela y la línea punteada.
   El plano del juego es el suelo de three (x, -z): el (x, y) del juego va a (x, 0, -y). La cámara mira desde arriba
   e inclinada; en una pantalla vertical gira 90° para que «adelante» quede hacia arriba. Se encaja en el hueco que
   dejan el marcador y los controles (seguro()). Sin WebGL: window.HondaEspacio.disponible = false y el juego sigue. */
(function () {
'use strict';
const T = window.THREE;
if (!T) { window.HondaEspacio = { disponible: false }; return; }
const P = (x, y, h) => new T.Vector3(x, h || 0, -y);
const NAVES = [
  { id: 'condor', nombre: 'Cóndor', cuerpo: '#f1f3f5', franja: '#e03131', vidrio: '#4dabf7' },
  { id: 'colibri', nombre: 'Colibrí', cuerpo: '#c3fae8', franja: '#0ca678', vidrio: '#845ef7' },
  { id: 'tucan', nombre: 'Tucán', cuerpo: '#343a40', franja: '#fab005', vidrio: '#ff922b' }
];
const LUNAS = [
  { color: '#ff922b', forma: 'círculo', glifo: '●' }, { color: '#4dabf7', forma: 'triángulo', glifo: '▲' },
  { color: '#69db7c', forma: 'cuadrado', glifo: '■' }, { color: '#da77f2', forma: 'rombo', glifo: '◆' }
];
const ESTILOS = {
  roca: ['#a0715a', '#7d5443', '#c49a7c'], lava: ['#c92a2a', '#5c1a10', '#ff8a3d'], hielo: ['#a5d8ff', '#e7f5ff', '#74c0fc'],
  verde: ['#2f9e44', '#1971c2', '#8ce99a'], gas: ['#e8a35a', '#f4d6a4', '#b8682e'], arena: ['#e9c46a', '#f8e1a8', '#c08a3a'], enana: ['#7048e8', '#d0bfff', '#3b1f9c'],
  neptuno: ['#3b5bdb', '#91a7ff', '#1c2f8a'], morado: ['#ae3ec9', '#f3d9fa', '#6a1b7a']
};
const GIGANTES = ['gas', 'arena', 'neptuno', 'morado'];
const rnd = (() => { let s = 7; return () => { s = (s * 16807) % 2147483647; return s / 2147483647; }; })();

function textura(dibujar, w, h) {
  const c = document.createElement('canvas'); c.width = w; c.height = h || w;
  dibujar(c.getContext('2d'), c.width, c.height);
  const t = new T.CanvasTexture(c); t.minFilter = T.LinearFilter; return t;
}
const PUNTO = () => textura((g, w) => { const r = g.createRadialGradient(w / 2, w / 2, 0, w / 2, w / 2, w / 2); r.addColorStop(0, '#fff'); r.addColorStop(0.35, 'rgba(255,255,255,.9)'); r.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = r; g.fillRect(0, 0, w, w); }, 32);
function etiqueta(texto, fondo, tinta) {
  const t = textura((g, w, h) => {
    g.fillStyle = fondo; g.strokeStyle = '#1d2b53'; g.lineWidth = 8;
    g.beginPath(); g.arc(w / 2, h / 2, w / 2 - 6, 0, Math.PI * 2); g.fill(); g.stroke();
    g.fillStyle = tinta || '#1d2b53'; g.font = '800 70px "Baloo 2", system-ui, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle';
    g.fillText(texto, w / 2, h / 2 + 4);
  }, 128);
  const s = new T.Sprite(new T.SpriteMaterial({ map: t, depthTest: false, transparent: true }));
  s.renderOrder = 10; return s;
}

function crear(cont, o) {
  o = o || {};
  const ren = new T.WebGLRenderer({ antialias: (window.devicePixelRatio || 1) < 2, alpha: true, powerPreference: 'low-power' });
  ren.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
  ren.setClearColor(0x000000, 0);
  cont.appendChild(ren.domElement);
  const esc = new T.Scene();
  const cam = new T.PerspectiveCamera(34, 1, 1, 600);
  esc.add(new T.AmbientLight(0x8090c0, 0.55));
  const sol = new T.DirectionalLight(0xfff4e0, 1.05); sol.position.set(-60, 90, 40); esc.add(sol);
  esc.add(new T.HemisphereLight(0x9ab8ff, 0x302040, 0.35));
  let calma = !!o.calma, vertical = false, seguroR = null, tam = [1, 1], centro = new T.Vector3(), sacudida = 0, t = 0;
  const F = window.HondaFisica, W = F.W, H = F.H, tex = PUNTO();

  // las estrellas del fondo (debajo del plano, lejos)
  {
    const n = 900, pos = new Float32Array(n * 3), col = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) {
      pos[3 * i] = (rnd() - 0.5) * 360; pos[3 * i + 1] = -30 - rnd() * 90; pos[3 * i + 2] = (rnd() - 0.5) * 300;
      const c = new T.Color().setHSL(0.55 + rnd() * 0.15, 0.5, 0.65 + rnd() * 0.35); col.set([c.r, c.g, c.b], 3 * i);
    }
    const g = new T.BufferGeometry(); g.setAttribute('position', new T.BufferAttribute(pos, 3)); g.setAttribute('color', new T.BufferAttribute(col, 3));
    esc.add(new T.Points(g, new T.PointsMaterial({ size: 1.6, map: tex, vertexColors: true, transparent: true, depthWrite: false, sizeAttenuation: true })));
  }
  // la cuadrícula tenue del plano (para leer distancias) y el borde del mapa
  {
    const g = new T.BufferGeometry(), v = [];
    for (let x = -W; x <= W + 0.1; x += 8) v.push(x, -0.3, -H, x, -0.3, H);
    for (let y = -H; y <= H + 0.1; y += 8) v.push(-W, -0.3, -y, W, -0.3, -y);
    g.setAttribute('position', new T.Float32BufferAttribute(v, 3));
    esc.add(new T.LineSegments(g, new T.LineBasicMaterial({ color: 0x6b7fd7, transparent: true, opacity: 0.12 })));
  }

  const nivelG = new T.Group(); esc.add(nivelG);
  let planetas = [], lunas = [], cristales = [], efectos = [];

  function planeta(p) {
    const [x, y, r, m, est0, anillo] = p;
    const estilo = est0 === 'gas' || est0 === 'arena' ? GIGANTES[Math.abs(Math.round(x * 7 + y * 13)) % 4] : est0, cs = ESTILOS[estilo] || ESTILOS.roca;
    const g = new T.IcosahedronGeometry(r, 2), pos = g.attributes.position, col = [];
    const a = new T.Color(cs[0]), b = new T.Color(cs[1]), c3 = new T.Color(cs[2]), tmp = new T.Color();
    const bandas = GIGANTES.indexOf(estilo) >= 0;
    for (let i = 0; i < pos.count; i += 3) { // cada cara de un color (low-poly)
      const yy = (pos.getY(i) + pos.getY(i + 1) + pos.getY(i + 2)) / 3 / r;
      const k = bandas ? 0.5 + 0.5 * Math.sin(yy * 9 + Math.sin(yy * 3) * 2) : rnd();
      tmp.copy(a).lerp(k < 0.5 ? b : c3, bandas ? k : k * 0.8);
      for (let j = 0; j < 3; j++) col.push(tmp.r, tmp.g, tmp.b);
      if (!bandas) for (let j = 0; j < 3; j++) { const q = 1 + (rnd() - 0.5) * 0.08; pos.setXYZ(i + j, pos.getX(i + j) * q, pos.getY(i + j) * q, pos.getZ(i + j) * q); }
    }
    g.setAttribute('color', new T.Float32BufferAttribute(col, 3)); g.computeVertexNormals();
    const mesh = new T.Mesh(g, new T.MeshPhongMaterial({ vertexColors: true, flatShading: true, shininess: 10 }));
    const grupo = new T.Group(); grupo.position.copy(P(x, y)); grupo.add(mesh);
    mesh.rotation.set(rnd() * 0.6 - 0.3, 0, rnd() * 0.5 - 0.25);
    if (anillo) {
      const rg = new T.RingGeometry(r * 1.35, r * 2.05, 48, 3), rc = [];
      for (let i = 0; i < rg.attributes.position.count; i++) { const d = Math.hypot(rg.attributes.position.getX(i), rg.attributes.position.getY(i)) / r; const k = 0.55 + 0.45 * Math.sin(d * 11); tmp.copy(c3).lerp(b, k); rc.push(tmp.r, tmp.g, tmp.b); }
      rg.setAttribute('color', new T.Float32BufferAttribute(rc, 3));
      const ring = new T.Mesh(rg, new T.MeshBasicMaterial({ vertexColors: true, side: T.DoubleSide, transparent: true, opacity: 0.8 }));
      ring.rotation.x = -Math.PI / 2 + 0.45; ring.rotation.y = 0.2; grupo.add(ring);
    }
    grupo.add(halo(Math.sqrt(m) * 0.62, estilo === 'enana' ? 0xb197fc : 0x9ec5fe));
    grupo.userData.giro = (rnd() * 0.25 + 0.08) * (rnd() < 0.5 ? -1 : 1); grupo.userData.mesh = mesh;
    return grupo;
  }
  function halo(r, color) { // el alcance de la gravedad: anillos tenues sobre el plano
    const g = new T.Group();
    [1, 0.66, 0.36].forEach((k, i) => {
      const ring = new T.Mesh(new T.RingGeometry(r * k - 0.12, r * k + 0.12, 64), new T.MeshBasicMaterial({ color, transparent: true, opacity: 0.1 + i * 0.05, depthWrite: false }));
      ring.rotation.x = -Math.PI / 2; ring.position.y = -0.25; g.add(ring);
    });
    return g;
  }
  function agujero(h) {
    const [x, y, m] = h, g = new T.Group(); g.position.copy(P(x, y));
    g.add(new T.Mesh(new T.SphereGeometry(1.4, 20, 14), new T.MeshBasicMaterial({ color: 0x000000 })));
    const disco = new T.Mesh(new T.RingGeometry(1.8, 4.2, 48, 2), new T.MeshBasicMaterial({ map: textura((c, w) => {
      const r = c.createRadialGradient(w / 2, w / 2, w * 0.2, w / 2, w / 2, w / 2); r.addColorStop(0, '#fff3bf'); r.addColorStop(0.4, '#ff922b'); r.addColorStop(0.75, 'rgba(201,42,42,.6)'); r.addColorStop(1, 'rgba(0,0,0,0)');
      c.fillStyle = r; c.fillRect(0, 0, w, w); }, 64), transparent: true, side: T.DoubleSide, blending: T.AdditiveBlending, depthWrite: false }));
    disco.geometry.attributes.uv && fixUV(disco.geometry, 4.2);
    disco.rotation.x = -Math.PI / 2 + 0.35; g.add(disco); g.userData.disco = disco;
    g.add(halo(Math.sqrt(m) * 0.62, 0xffa94d));
    return g;
  }
  function fixUV(geo, R) { const p = geo.attributes.position, uv = geo.attributes.uv; for (let i = 0; i < p.count; i++) uv.setXY(i, p.getX(i) / (2 * R) + 0.5, p.getY(i) / (2 * R) + 0.5); }
  function roca(r) {
    const [x, y, rr] = r, g = new T.DodecahedronGeometry(rr, 0), p = g.attributes.position;
    for (let i = 0; i < p.count; i++) { const q = 0.8 + rnd() * 0.35; p.setXYZ(i, p.getX(i) * q, p.getY(i) * q, p.getZ(i) * q); }
    g.computeVertexNormals();
    const m = new T.Mesh(g, new T.MeshPhongMaterial({ color: new T.Color().setHSL(0.07, 0.25, 0.32 + rnd() * 0.15), flatShading: true, shininess: 10 }));
    m.position.copy(P(x, y)); m.rotation.set(rnd() * 3, rnd() * 3, rnd() * 3); m.userData.giro = (rnd() - 0.5) * 0.8; return m;
  }
  function luna(l, d) {
    const [x, y, r] = l, g = new T.Group(); g.position.copy(P(x, y));
    const geo = new T.IcosahedronGeometry(r, 1), col = [], tmp = new T.Color();
    for (let i = 0; i < geo.attributes.position.count; i += 3) { tmp.setHSL(0.6, 0.06, 0.62 + rnd() * 0.22); for (let j = 0; j < 3; j++) col.push(tmp.r, tmp.g, tmp.b); }
    geo.setAttribute('color', new T.Float32BufferAttribute(col, 3));
    const cuerpo = new T.Mesh(geo, new T.MeshPhongMaterial({ vertexColors: true, flatShading: true, shininess: 10 })); g.add(cuerpo);
    const aro = new T.Mesh(new T.TorusGeometry(r + 0.9, 0.32, 8, 40), new T.MeshBasicMaterial({ color: d.color }));
    aro.rotation.x = -Math.PI / 2; g.add(aro);
    const brillo = new T.Mesh(new T.RingGeometry(r + 1.3, r + 2.6, 40), new T.MeshBasicMaterial({ color: d.color, transparent: true, opacity: 0, depthWrite: false, blending: T.AdditiveBlending }));
    brillo.rotation.x = -Math.PI / 2; brillo.position.y = -0.2; g.add(brillo);
    const et = etiqueta(d.texto, d.base ? '#fff3bf' : '#fffdf7'); et.scale.set(4.6, 4.6, 1); et.position.set(0, r + 3, 0); g.add(et);
    if (d.base) { const cup = new T.Mesh(new T.SphereGeometry(r * 0.55, 14, 8, 0, Math.PI * 2, 0, Math.PI / 2), new T.MeshPhongMaterial({ color: 0xa5d8ff, transparent: true, opacity: 0.85 })); cup.position.y = r * 0.75; g.add(cup); }
    g.userData = { aro, brillo, cuerpo, et, estado: 'normal', color: new T.Color(d.color), r };
    return g;
  }
  function cristal(c) {
    const m = new T.Mesh(new T.OctahedronGeometry(0.95, 0), new T.MeshPhongMaterial({ color: 0x66e3ff, emissive: 0x1a7fa0, flatShading: true, shininess: 10 }));
    m.position.copy(P(c[0], c[1], 0.6)); m.scale.set(1, 1.5, 1); return m;
  }

  // la honda, el robot y la nave
  const honda = new T.Group(); esc.add(honda);
  const piedra = new T.Mesh(new T.DodecahedronGeometry(3.2, 1), new T.MeshPhongMaterial({ color: 0x6b5b73, flatShading: true, shininess: 10 }));
  piedra.scale.set(1, 0.45, 1); piedra.position.set(-4.2, -1.1, 0); honda.add(piedra);
  const horquilla = new T.Group(); honda.add(horquilla);
  const palo = (x, y, z, l, rz, rx) => { const m = new T.Mesh(new T.CylinderGeometry(0.22, 0.28, l, 6), new T.MeshPhongMaterial({ color: 0x8d6e63, flatShading: true, shininess: 10 })); m.position.set(x, y, z); m.rotation.set(rx || 0, 0, rz || 0); horquilla.add(m); return m; };
  palo(-1.6, 0.2, 0, 2.2, 0); palo(-1.6, 1.6, -1.1, 2, 0, -0.5); palo(-1.6, 1.6, 1.1, 2, 0, 0.5);
  const puntas = [new T.Vector3(-1.6, 2.4, -1.6), new T.Vector3(-1.6, 2.4, 1.6)];
  const ligas = new T.Line(new T.BufferGeometry().setFromPoints([puntas[0], new T.Vector3(), puntas[1]]), new T.LineBasicMaterial({ color: 0xff6b6b }));
  horquilla.add(ligas);
  const flecha = new T.Group(); honda.add(flecha);
  const fCuerpo = new T.Mesh(new T.BoxGeometry(1, 0.15, 0.5), new T.MeshBasicMaterial({ color: 0xffd43b, transparent: true, opacity: 0.85 }));
  const fPunta = new T.Mesh(new T.ConeGeometry(0.75, 1.5, 3), new T.MeshBasicMaterial({ color: 0xffd43b })); fPunta.rotation.z = -Math.PI / 2;
  flecha.add(fCuerpo); flecha.add(fPunta); flecha.position.y = 0.4;

  const nave = new T.Group(); esc.add(nave);
  let naveId = o.nave || 'condor';
  function armarNave(id) {
    while (nave.children.length) nave.remove(nave.children[0]);
    const d = NAVES.find(n => n.id === id) || NAVES[0];
    const mat = c => new T.MeshPhongMaterial({ color: c, flatShading: true, shininess: 10 });
    const cuerpo = new T.Mesh(new T.CylinderGeometry(0.55, 0.65, 2, 8), mat(d.cuerpo)); cuerpo.rotation.z = -Math.PI / 2; nave.add(cuerpo);
    const nariz = new T.Mesh(new T.ConeGeometry(0.55, 1.1, 8), mat(d.franja)); nariz.rotation.z = -Math.PI / 2; nariz.position.x = 1.55; nave.add(nariz);
    const franja = new T.Mesh(new T.CylinderGeometry(0.67, 0.67, 0.35, 8), mat(d.franja)); franja.rotation.z = -Math.PI / 2; franja.position.x = -0.3; nave.add(franja);
    const vidrio = new T.Mesh(new T.SphereGeometry(0.36, 10, 8), new T.MeshPhongMaterial({ color: d.vidrio, emissive: d.vidrio, emissiveIntensity: 0.35 })); vidrio.position.set(0.55, 0.38, 0); nave.add(vidrio);
    [0, 1, 2].forEach(k => { const a = new T.Mesh(new T.BoxGeometry(0.8, 0.08, 0.7), mat(d.franja)); const ang = k * Math.PI * 2 / 3 + Math.PI / 2; a.position.set(-0.85, Math.cos(ang) * 0.7, Math.sin(ang) * 0.7); a.rotation.x = -ang; nave.add(a); });
    const fuego = new T.Mesh(new T.ConeGeometry(0.42, 1.4, 8), new T.MeshBasicMaterial({ color: 0xffa94d, transparent: true, opacity: 0.85, blending: T.AdditiveBlending, depthWrite: false }));
    fuego.rotation.z = Math.PI / 2; fuego.position.x = -1.7; nave.add(fuego); nave.userData.fuego = fuego;
    nave.scale.setScalar(1.5); naveId = id;
  }
  armarNave(naveId);
  nave.position.y = 0.8;

  // la estela y la línea punteada (puntos)
  function puntos(n, color, tam, aditivo) {
    const g = new T.BufferGeometry(); g.setAttribute('position', new T.BufferAttribute(new Float32Array(n * 3), 3)); g.setAttribute('color', new T.BufferAttribute(new Float32Array(n * 3), 3));
    g.setDrawRange(0, 0);
    const p = new T.Points(g, new T.PointsMaterial({ size: tam, map: tex, vertexColors: true, transparent: true, depthWrite: false, blending: aditivo ? T.AdditiveBlending : T.NormalBlending }));
    p.userData.c = new T.Color(color); p.frustumCulled = false; esc.add(p); return p;
  }
  const estela = puntos(160, 0xffc078, 1.9, true), linea = puntos(400, 0xfff3bf, 1.55, false);
  const rastro = [];

  // el robot piloto (de la Biblioteca); si no llega, la honda sola
  let robot = null, mezcla = null, acciones = {}, animActual = null;
  if (o.biblio) cargarGLB(o.biblio + 'modelos/robot.glb', g => {
    robot = g.scene; const caja = new T.Box3().setFromObject(robot), alto = caja.max.y - caja.min.y || 1;
    const e = 7 / alto; robot.scale.setScalar(e); robot.position.set(-5.6, -0.6 - caja.min.y * e, -3); robot.rotation.y = Math.PI / 2 - 0.6;
    honda.add(robot);
    if (g.animations && g.animations.length) {
      mezcla = new T.AnimationMixer(robot);
      g.animations.forEach(c => { const k = String(c.name).toLowerCase(); ['quieto', 'lanzar', 'hechizo', 'caer', 'levantarse'].forEach(n => { if (k.indexOf(n) >= 0 && !acciones[n]) acciones[n] = mezcla.clipAction(c); }); });
      anim('quieto');
    }
  });
  function anim(n) {
    const a = acciones[n]; if (!a || !mezcla) return;
    const una = n !== 'quieto';
    a.reset(); a.setLoop(una ? T.LoopOnce : T.LoopRepeat, una ? 1 : Infinity); a.clampWhenFinished = una;
    if (animActual && animActual !== a) a.crossFadeFrom(animActual, 0.25, false);
    a.play(); animActual = a;
    if (una) { const fin = e => { if (e.action === a) { mezcla.removeEventListener('finished', fin); if (animActual === a) anim(n === 'caer' && acciones.levantarse ? 'levantarse' : 'quieto'); } }; mezcla.addEventListener('finished', fin); }
  }

  function vaciar(g) { while (g.children.length) { const c = g.children[0]; g.remove(c); c.traverse(x => { if (x.geometry) x.geometry.dispose(); if (x.material) { if (x.material.map) x.material.map.dispose(); x.material.dispose(); } }); } }
  /** Arma un nivel: n (de fisica.js) y las lunas: [{texto: '1', color, base?}]. */
  function nivel(n, ds) {
    vaciar(nivelG); efectos.forEach(e => esc.remove(e.obj)); efectos = [];
    planetas = (n.pl || []).map(p => { const g = planeta(p); nivelG.add(g); return g; });
    (n.hn || []).forEach(h => { const g = agujero(h); planetas.push(g); nivelG.add(g); });
    (n.ro || []).forEach(r => { const m = roca(r); planetas.push(m); nivelG.add(m); });
    lunas = (n.lu || []).map((l, i) => { const g = luna(l, ds[i] || { texto: String(i + 1), color: '#fff' }); nivelG.add(g); return g; });
    cristales = (n.cr || []).map(c => { const m = cristal(c); nivelG.add(m); return m; });
    honda.position.copy(P(n.sal[0], n.sal[1]));
    nave.visible = true; nave.position.copy(P(n.sal[0], n.sal[1], 0.8)); nave.userData.fuego.visible = false;
    rastro.length = 0; estela.geometry.setDrawRange(0, 0); linea.geometry.setDrawRange(0, 0);
    encajar();
  }
  let apunte = { ang: 0, f: 5 };
  function apuntar(ang, f) {
    apunte = { ang, f };
    const a = ang * Math.PI / 180, tirar = 0.6 + f * 0.17;
    honda.rotation.y = a; // la honda gira con la dirección
    nave.rotation.set(0, a, 0);
    const base = honda.position.clone();
    nave.position.set(base.x - Math.cos(a) * tirar, 0.8, base.z + Math.sin(a) * tirar);
    ligas.geometry.setFromPoints([puntas[0], new T.Vector3(-1.6 - tirar, 1.6, 0), puntas[1]]);
    const largo = 2 + f * 0.75; fCuerpo.scale.x = largo; fCuerpo.position.x = 1.4 + largo / 2; fPunta.position.x = 1.4 + largo + 0.6;
  }
  function ponerPuntos(p, arr, desde, color, apagar) {
    const pos = p.geometry.attributes.position, col = p.geometry.attributes.color, n = Math.min(arr.length / 2, pos.count);
    for (let i = 0; i < n; i++) {
      pos.setXYZ(i, arr[2 * i], 0.5, -arr[2 * i + 1]);
      const k = apagar ? 1 - (i / n) * (p === linea ? 0.45 : 0.8) : 1; col.setXYZ(i, color.r * k, color.g * k, color.b * k);
    }
    pos.needsUpdate = true; col.needsUpdate = true; p.geometry.setDrawRange(0, n); p.geometry.computeBoundingSphere();
  }
  /** La línea punteada: [x, y, …] (o null para quitarla). */
  function lineaPuntos(arr) { if (!arr) { linea.geometry.setDrawRange(0, 0); return; } ponerPuntos(linea, arr, 0, linea.userData.c, true); }
  /** La nave en vuelo: posición y rumbo; `fuego` = recién lanzada. */
  function enVuelo(x, y, rumbo, fuego) {
    nave.position.copy(P(x, y, 0.8)); nave.rotation.set(0, rumbo, 0); nave.visible = true;
    nave.userData.fuego.visible = !!fuego; flecha.visible = false;
    rastro.push(x, y); if (rastro.length > 320) rastro.splice(0, 2);
    const inv = []; for (let i = rastro.length - 2; i >= 0; i -= 2) inv.push(rastro[i], rastro[i + 1]);
    ponerPuntos(estela, inv, 0, estela.userData.c, true);
  }
  function enHonda() { flecha.visible = true; nave.visible = true; nave.userData.fuego.visible = false; rastro.length = 0; estela.geometry.setDrawRange(0, 0); apuntar(apunte.ang, apunte.f); }
  function marcarLuna(i, estado) {
    const l = lunas[i]; if (!l) return; l.userData.estado = estado;
    const c = estado === 'bien' ? 0x51cf66 : estado === 'mal' ? 0xff6b6b : l.userData.color.getHex();
    l.userData.aro.material.color.setHex(c); l.userData.brillo.material.color.setHex(c);
  }
  function tomarCristal(i) { const c = cristales[i]; if (!c || !c.visible) return; c.visible = false; chispas(c.position, 0x66e3ff, 14); }
  function chispas(pos, color, n) {
    if (calma) n = Math.ceil(n / 3);
    const p = puntos(n, color, 1.3, true), v = [];
    const a = p.geometry.attributes.position, c = p.geometry.attributes.color, col = new T.Color(color);
    for (let i = 0; i < n; i++) { a.setXYZ(i, pos.x, pos.y + 0.6, pos.z); c.setXYZ(i, col.r, col.g, col.b); const an = rnd() * Math.PI * 2, s = 4 + rnd() * 9; v.push(Math.cos(an) * s, (rnd() - 0.3) * 4, Math.sin(an) * s); }
    p.geometry.setDrawRange(0, n);
    efectos.push({ obj: p, v, vida: 0.9, col });
  }
  function efecto(tipo, x, y) {
    const pos = P(x, y);
    if (tipo === 'choque') { chispas(pos, 0xff8a3d, 30); chispas(pos, 0xffe066, 16); if (!calma) sacudida = 0.45; nave.visible = false; anim('caer'); }
    else if (tipo === 'llegada') { chispas(pos, 0x8ce99a, 26); chispas(pos, 0xfff3bf, 14); nave.visible = false; anim('hechizo'); }
    else if (tipo === 'mal') { chispas(pos, 0xff8787, 16); nave.visible = false; }
    else if (tipo === 'fuera') { nave.visible = false; }
    else if (tipo === 'lanzar') anim('lanzar');
  }

  // encajar el mapa en el hueco que dejan el marcador y los controles
  const rc = new T.Raycaster(), plano = new T.Plane(new T.Vector3(0, 1, 0), 0);
  function encajar() {
    const w = tam[0], h = tam[1];
    cam.aspect = w / h; cam.clearViewOffset();
    vertical = h > w * 1.1;
    const s = seguroR || { l: 0, t: 0, r: w, b: h }, sw = Math.max(80, s.r - s.l), sh = Math.max(60, s.b - s.t);
    const esq = [[-W - 7, -H - 1], [W + 1, -H - 1], [-W - 7, H + 1], [W + 1, H + 1]].map(e => P(e[0], e[1]));
    centro.set(-3, 0, 0);
    const el = 1.08; // elevación de la cámara (rad, ~62°)
    const colocar = D => {
      if (vertical) { cam.position.set(centro.x - Math.cos(el) * D, Math.sin(el) * D, centro.z); cam.up.set(1, 0, 0); }
      else { cam.position.set(centro.x, Math.sin(el) * D, centro.z + Math.cos(el) * D); cam.up.set(0, 1, 0); }
      cam.lookAt(centro); cam.updateMatrixWorld(); cam.updateProjectionMatrix();
      let x0 = 1e9, x1 = -1e9, y0 = 1e9, y1 = -1e9;
      esq.forEach(e => { const q = e.clone().project(cam); const px = (q.x + 1) / 2 * w, py = (1 - q.y) / 2 * h; x0 = Math.min(x0, px); x1 = Math.max(x1, px); y0 = Math.min(y0, py); y1 = Math.max(y1, py); });
      return { x0, x1, y0, y1 };
    };
    let a = 20, b = 600, caja = null;
    for (let i = 0; i < 26; i++) { const m = (a + b) / 2, c = colocar(m); if (c.x1 - c.x0 <= sw && c.y1 - c.y0 <= sh) b = m; else a = m; }
    caja = colocar(b);
    const ox = (caja.x0 + caja.x1) / 2 - (s.l + s.r) / 2, oy = (caja.y0 + caja.y1) / 2 - (s.t + s.b) / 2;
    cam.setViewOffset(w, h, ox, oy, w, h); cam.updateProjectionMatrix();
  }
  function medir() {
    const w = cont.clientWidth || innerWidth, h = cont.clientHeight || innerHeight;
    tam = [w, h]; ren.setSize(w, h, false); encajar();
  }
  addEventListener('resize', medir); medir();

  /** De la pantalla al plano: {x, y} del juego y la luna tocada (-1 si ninguna). */
  function tocar(cx, cy) {
    const r = ren.domElement.getBoundingClientRect();
    const v = new T.Vector2((cx - r.left) / r.width * 2 - 1, -((cy - r.top) / r.height) * 2 + 1);
    rc.setFromCamera(v, cam);
    let luna = -1;
    const hits = rc.intersectObjects(lunas, true);
    if (hits.length) { let o = hits[0].object; while (o && lunas.indexOf(o) < 0) o = o.parent; luna = lunas.indexOf(o); }
    const p = new T.Vector3(); if (!rc.ray.intersectPlane(plano, p)) return { luna, x: null, y: null };
    if (luna < 0) lunas.forEach((l, i) => { if (luna < 0 && Math.hypot(l.position.x - p.x, l.position.z - p.z) < l.userData.r + 2.4) luna = i; });
    return { luna, x: p.x, y: -p.z };
  }
  /** Del juego a la pantalla (px dentro del lienzo). */
  function proyectar(x, y, h) { const q = P(x, y, h).project(cam); return { x: (q.x + 1) / 2 * tam[0], y: (1 - q.y) / 2 * tam[1], dentro: q.z < 1 }; }

  function cuadro(dt) {
    t += dt;
    const k = calma ? 0.3 : 1;
    planetas.forEach(p => { if (p.userData.mesh) p.userData.mesh.rotation.y += dt * p.userData.giro * k; else if (p.userData.giro) p.rotation.y += dt * p.userData.giro * k; if (p.userData.disco) p.userData.disco.rotation.z += dt * 0.8 * k; });
    cristales.forEach((c, i) => { c.rotation.y += dt * 1.6 * k; c.position.y = 0.6 + (calma ? 0 : Math.sin(t * 2 + i) * 0.25); });
    lunas.forEach(l => {
      const u = l.userData, e = u.estado;
      u.brillo.material.opacity = e === 'elegida' ? 0.35 + (calma ? 0.1 : Math.sin(t * 5) * 0.15) : e === 'bien' ? 0.55 : e === 'mal' ? 0.35 : 0;
      u.cuerpo.rotation.y += dt * 0.2 * k;
    });
    if (nave.userData.fuego.visible) nave.userData.fuego.scale.set(1, 0.8 + Math.random() * 0.4 * k, 1);
    for (let i = efectos.length - 1; i >= 0; i--) {
      const e = efectos[i], a = e.obj.geometry.attributes.position, c = e.obj.geometry.attributes.color; e.vida -= dt;
      for (let j = 0; j < a.count; j++) { a.setXYZ(j, a.getX(j) + e.v[3 * j] * dt, a.getY(j) + e.v[3 * j + 1] * dt, a.getZ(j) + e.v[3 * j + 2] * dt); const f = Math.max(0, e.vida / 0.9); c.setXYZ(j, e.col.r * f, e.col.g * f, e.col.b * f); }
      a.needsUpdate = true; c.needsUpdate = true;
      if (e.vida <= 0) { esc.remove(e.obj); e.obj.geometry.dispose(); e.obj.material.dispose(); efectos.splice(i, 1); }
    }
    if (mezcla) mezcla.update(dt);
    if (sacudida > 0) { sacudida -= dt; const s = sacudida * 0.6; cam.position.x += (Math.random() - 0.5) * s; cam.position.z += (Math.random() - 0.5) * s; }
    ren.render(esc, cam);
    if (sacudida <= 0 && sacudida > -1) { sacudida = -1; encajar(); }
  }

  return {
    nivel, apuntar, linea: lineaPuntos, enVuelo, enHonda, marcarLuna, tomarCristal, efecto, tocar, proyectar, cuadro, anim,
    nave: armarNave, calma(b) { calma = !!b; }, seguro(r) { seguroR = r; encajar(); }, vertical: () => vertical, lienzo: ren.domElement, medir
  };
}

function cargarScript(src) { return new Promise((si, no) => { const s = document.createElement('script'); s.src = src; s.onload = si; s.onerror = () => no(new Error('no cargó ' + src)); document.head.appendChild(s); }); }
function cargarGLB(url, alCargar) {
  const J3 = window.Juegos3D || {}, cdn = 'https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/';
  const una = (f, dir, hay) => (hay() ? Promise.resolve() : (J3.enApp ? cargarScript('../' + f).then(() => { if (!hay()) throw new Error('vacío'); }) : Promise.reject(new Error('suelto')))
    .catch(() => cargarScript(cdn + dir + f)));
  una('GLTFLoader.js', 'loaders/', () => T.GLTFLoader).then(() => una('meshopt_decoder.js', 'libs/', () => window.MeshoptDecoder)).then(() => {
    const l = new T.GLTFLoader(); if (window.MeshoptDecoder) l.setMeshoptDecoder(window.MeshoptDecoder); l.setCrossOrigin('anonymous');
    l.load(url, alCargar, undefined, e => console.warn('Honda: sin robot (' + (e && e.message) + ')'));
  }).catch(e => console.warn('Honda: el robot no cargó (' + e.message + ')'));
}

window.HondaEspacio = { disponible: true, crear, NAVES, LUNAS };
})();
