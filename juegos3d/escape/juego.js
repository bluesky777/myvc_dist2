/* Sala de escape — motor. El contenido (salas, retos, premios) vive en datos.js. */
(function () {
'use strict';

const DATOS = window.DATOS_ESCAPE || { salas: [] };
const $ = s => document.querySelector(s);
const CLAVE = 'juegos3d.escape';
const PUNTOS_OBJ = 100, CASTIGO_FALLO = 15, CASTIGO_PISTA = 30, MIN_OBJ = 20, CASTIGO_CODIGO = 10, BONO_TIEMPO = 50;

function leer() { try { return JSON.parse(localStorage.getItem(CLAVE)) || {}; } catch (e) { return {}; } }
function guardar(o) { try { localStorage.setItem(CLAVE, JSON.stringify(o)); } catch (e) { /* sin progreso guardado */ } }
const mmss = s => { s = Math.max(0, Math.floor(s)); return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0'); };
const barajar = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const esc = t => String(t).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

const SVG_LLAVE = '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><circle cx="7" cy="12" r="4.5" fill="none" stroke="currentColor" stroke-width="2.6"/><rect x="10.5" y="10.7" width="11" height="2.6" rx="1.2"/><rect x="17" y="12" width="2.4" height="4.5" rx="1"/><rect x="13.6" y="12" width="2.2" height="3.4" rx="1"/></svg>';
const SVG_ESTRELLA = on => `<svg viewBox="0 0 24 24" class="${on ? 'on' : ''}" aria-hidden="true"><path d="M12 2.5l2.9 6 6.6.9-4.8 4.6 1.2 6.5L12 17.4l-5.9 3.1 1.2-6.5L2.5 9.4l6.6-.9z" fill="${on ? '#ffc23a' : '#efe3c8'}" stroke="${on ? '#c88a00' : '#d9c9a4'}" stroke-width="1.2" stroke-linejoin="round"/></svg>`;
const NOMBRE_TIPO = { opcion: 'Elige una', vf: 'Verdadero o falso', numero: 'Escribe el número', ordenar: 'Ordena' };

/* ---------------- estado ---------------- */
let salaIdx = 0, sala = null, est = null, enJuego = false, pausaIntro = true;

function nuevoEstado() {
  const objs = {};
  sala.objetos.forEach(o => { objs[o.objeto] = { resuelto: false, fallos: 0, pista: false, puntos: 0 }; });
  return { objs, tiempo: 0, fallosCodigo: 0, piezas: {}, salio: false };
}
const puntosObj = e => Math.max(MIN_OBJ, PUNTOS_OBJ - CASTIGO_FALLO * e.fallos - (e.pista ? CASTIGO_PISTA : 0));
function puntaje() {
  let p = 0; for (const k in est.objs) if (est.objs[k].resuelto) p += est.objs[k].puntos;
  return Math.max(0, p - CASTIGO_CODIGO * est.fallosCodigo);
}
function ordenCodigo() {
  const ord = (sala.puerta && sala.puerta.orden) || sala.objetos.filter(o => o.premio && o.premio.tipo === 'digito').map(o => o.objeto);
  return ord.map(id => sala.objetos.find(o => o.objeto === id)).filter(Boolean);
}
const pideLlave = () => sala.objetos.some(o => o.premio && o.premio.tipo === 'llave');
function faltan() {
  return sala.objetos.filter(o => o.premio && (o.premio.tipo === 'digito' || o.premio.tipo === 'llave') && !est.objs[o.objeto].resuelto);
}

/* ---------------- interfaz: inicio ---------------- */
function pintarSalas() {
  const rec = leer();
  $('#salas').innerHTML = DATOS.salas.map((s, i) => {
    const r = rec[s.id];
    return `<button class="sala" role="radio" aria-checked="${i === salaIdx}" data-i="${i}">
      <span class="asig">${esc(s.asignatura)} · ${esc(s.grado)}</span><b>${esc(s.titulo)}</b>
      <small>${s.objetos.length} retos</small>${r ? `<span class="rec">Récord: ${'★'.repeat(r.estrellas)}${'☆'.repeat(3 - r.estrellas)} · ${r.puntos} pts</span>` : ''}</button>`;
  }).join('');
  $('#salas').querySelectorAll('.sala').forEach(b => b.onclick = () => { salaIdx = +b.dataset.i; pintarSalas(); });
}

/* ---------------- 3D ---------------- */
if (typeof THREE === 'undefined') {
  $('#cargando').textContent = 'No se pudo descargar el motor 3D. Revisa la conexión y vuelve a abrir el juego.';
  $('#btnJugar').disabled = true; pintarSalas(); return;
}

const R = 5, H = 4.4, OJO = 1.6;
const rd = new THREE.WebGLRenderer({ antialias: true });
rd.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));
rd.setSize(innerWidth, innerHeight);
rd.shadowMap.enabled = true; rd.shadowMap.type = THREE.PCFSoftShadowMap;
$('#gl').appendChild(rd.domElement);
const escena = new THREE.Scene();
escena.background = new THREE.Color(0x24160e);
escena.fog = new THREE.Fog(0x24160e, 7, 15);
const cam = new THREE.PerspectiveCamera(60, innerWidth / innerHeight, 0.1, 40);
cam.rotation.order = 'YXZ'; cam.position.set(0, OJO, 0);

const hemi = new THREE.HemisphereLight(0xffe6c4, 0x4a2e1c, 0.62); escena.add(hemi);
const sol = new THREE.DirectionalLight(0xfff0d8, 0.5);
sol.position.set(2, 8, 1.5); sol.castShadow = true; sol.shadow.mapSize.set(1024, 1024);
Object.assign(sol.shadow.camera, { left: -6, right: 6, top: 6, bottom: -6, near: 1, far: 20 });
sol.shadow.bias = -0.0008; escena.add(sol); escena.add(sol.target);
const luzLampara = new THREE.PointLight(0xffc27a, 1.0, 11, 1.5); luzLampara.position.set(0, 3.3, 0); escena.add(luzLampara);
const luzFuego = new THREE.PointLight(0xff8a3a, 1.3, 7, 2); luzFuego.position.set(0, 0.8, 4.1); escena.add(luzFuego);

const M = (c, o) => new THREE.MeshStandardMaterial(Object.assign({ color: c, flatShading: true, roughness: 0.85 }, o || {}));
const MAT = {
  madera: M(0x8a5a32), maderaOsc: M(0x5a3520), maderaClara: M(0xa8743f), oro: M(0xd9a03a, { metalness: 0.55, roughness: 0.35 }),
  piedra: M(0x9b8d7e), piedraOsc: M(0x6f6358), hierro: M(0x3d4a52, { metalness: 0.45, roughness: 0.45 }), crema: M(0xf4e6c4),
  negro: M(0x1c120c), hoja: M(0x2f9e5d), hoja2: M(0x46b86a), maceta: M(0xc4643b), rojo: M(0xa83a2a), mar: M(0x0e9aa0),
  llama: new THREE.MeshBasicMaterial({ color: 0xffb648 }), llama2: new THREE.MeshBasicMaterial({ color: 0xff6a2a }),
  luzPuerta: new THREE.MeshBasicMaterial({ color: 0xfff3c8 })
};
const sombra = o => { o.traverse(m => { if (m.isMesh) { m.castShadow = true; m.receiveShadow = true; } }); return o; };
function caja(w, h, d, mat, x, y, z, padre) {
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat); m.position.set(x || 0, y || 0, z || 0);
  if (padre) padre.add(m); return m;
}
function cil(rt, rb, h, seg, mat, x, y, z, padre) {
  const m = new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, h, seg), mat); m.position.set(x || 0, y || 0, z || 0);
  if (padre) padre.add(m); return m;
}
function encarar(g, x, z) { g.position.set(x, 0, z); g.rotation.y = Math.atan2(-x, -z); escena.add(g); g.updateMatrixWorld(true); return g; }
function lienzo(w, h, dibujar) {
  const c = document.createElement('canvas'); c.width = w; c.height = h; dibujar(c.getContext('2d'), w, h);
  const t = new THREE.CanvasTexture(c); t.anisotropy = 4; return t;
}

/* --- cuarto --- */
const llamas = [];
(function cuarto() {
  const tonos = [0x8a5a32, 0x7a4e2b, 0x95643a, 0x83552f].map(c => M(c));
  for (let i = 0, x = -R; x < R; x += 0.5, i++) {
    const t = caja(0.48, 0.1, 2 * R, tonos[i % 4], x + 0.25, -0.05, 0, escena); t.receiveShadow = true;
  }
  // alfombra octogonal
  [[2.6, 0x7a2e22, 0.02], [2.4, 0xb8862e, 0.03], [2.25, 0x8e3a2a, 0.04], [1.1, 0xb8862e, 0.05], [0.95, 0x1f3b5a, 0.06]].forEach(([r, c, y]) => {
    const a = cil(r, r, 0.02, 8, M(c), 0, y, 0, escena); a.rotation.y = Math.PI / 8; a.receiveShadow = true;
  });
  const papel = lienzo(128, 128, (x, w, h) => {
    x.fillStyle = '#2f5a4c'; x.fillRect(0, 0, w, h); x.fillStyle = '#376a59'; x.fillRect(0, 0, w / 2, h);
    x.fillStyle = 'rgba(255,214,120,.18)';
    for (let i = 0; i < 2; i++) { x.beginPath(); x.moveTo(w / 4 + i * w / 2, h * .3); x.lineTo(w / 4 + i * w / 2 + 10, h * .5); x.lineTo(w / 4 + i * w / 2, h * .7); x.lineTo(w / 4 + i * w / 2 - 10, h * .5); x.fill(); }
  });
  papel.wrapS = papel.wrapT = THREE.RepeatWrapping; papel.repeat.set(7, 2.2);
  const muro = new THREE.MeshStandardMaterial({ map: papel, roughness: 0.95 });
  const pared = (w, h, x, y, z, ry) => { const m = caja(w, h, 0.2, muro, x, y, z, escena); m.rotation.y = ry; m.receiveShadow = true; return m; };
  pared(2 * R, H, 0, H / 2, R, 0); pared(2 * R, H, -R, H / 2, 0, Math.PI / 2); pared(2 * R, H, R, H / 2, 0, Math.PI / 2);
  pared(R - 1, H, -(R + 1) / 2, H / 2, -R, 0); pared(R - 1, H, (R + 1) / 2, H / 2, -R, 0); pared(2, H - 3.2, 0, 3.2 + (H - 3.2) / 2, -R, 0);
  // zócalo de madera con paneles, y moldura arriba
  const lados = [[0, -1, 0], [0, 1, Math.PI], [-1, 0, Math.PI / 2], [1, 0, -Math.PI / 2]];
  lados.forEach(([sx, sz, ry]) => {
    const g = new THREE.Group(); g.position.set(sx * (R - 0.1), 0, sz * (R - 0.1)); g.rotation.y = ry; escena.add(g);
    for (let x = -R + 0.6; x < R - 0.4; x += 1.25) {
      if (sz === -1 && Math.abs(x) < 1.4) continue;
      caja(1.15, 0.9, 0.05, MAT.maderaOsc, x + 0.55, 0.55, 0.03, g); caja(0.95, 0.7, 0.04, MAT.madera, x + 0.55, 0.55, 0.06, g);
    }
    if (sz === -1) [-1, 1].forEach(l => caja(R - 1.2, 0.08, 0.1, MAT.maderaOsc, l * (R + 1.2) / 2, 1.08, 0.04, g));
    else caja(2 * R, 0.08, 0.1, MAT.maderaOsc, 0, 1.08, 0.04, g); caja(2 * R, 0.16, 0.14, MAT.maderaOsc, 0, H - 0.08, 0.05, g);
  });
  const techo = caja(2 * R, 0.1, 2 * R, M(0x3b2618), 0, H + 0.05, 0, escena); techo.receiveShadow = true;
  for (let x = -R + 1; x < R; x += 2) caja(0.25, 0.25, 2 * R, MAT.maderaOsc, x, H - 0.12, 0, escena);
  // lámpara de velas
  const lamp = new THREE.Group(); lamp.position.set(0, 3.35, 0); escena.add(lamp);
  cil(0.02, 0.02, H - 3.35, 4, MAT.oro, 0, (H - 3.35) / 2, 0, lamp);
  const aro = new THREE.Mesh(new THREE.TorusGeometry(0.55, 0.04, 6, 16), MAT.oro); aro.rotation.x = Math.PI / 2; lamp.add(aro);
  for (let i = 0; i < 6; i++) {
    const a = i / 6 * Math.PI * 2, x = Math.cos(a) * 0.55, z = Math.sin(a) * 0.55;
    cil(0.035, 0.035, 0.18, 6, MAT.crema, x, 0.11, z, lamp);
    const ll = new THREE.Mesh(new THREE.ConeGeometry(0.03, 0.08, 5), MAT.llama); ll.position.set(x, 0.24, z); lamp.add(ll); llamas.push(ll);
  }
})();

/* --- ventana y escritorio --- */
(function ventana() {
  const g = encarar(new THREE.Group(), -2.8, -R + 0.1);
  const noche = lienzo(128, 160, (x, w, h) => {
    const gr = x.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#13284a'); gr.addColorStop(1, '#3a5f8f'); x.fillStyle = gr; x.fillRect(0, 0, w, h);
    x.fillStyle = '#fff6d6'; x.beginPath(); x.arc(88, 40, 16, 0, 7); x.fill(); x.fillStyle = '#1e3a63'; x.beginPath(); x.arc(96, 34, 14, 0, 7); x.fill();
    x.fillStyle = '#fff'; for (let i = 0; i < 26; i++) x.fillRect((i * 37) % w, (i * 53) % (h * .6), 2, 2);
    x.fillStyle = '#1b2f2a'; x.beginPath(); x.moveTo(0, h); x.lineTo(0, 120); x.lineTo(30, 100); x.lineTo(60, 118); x.lineTo(95, 96); x.lineTo(w, 112); x.lineTo(w, h); x.fill();
  });
  const vid = new THREE.Mesh(new THREE.PlaneGeometry(1.3, 1.6), new THREE.MeshBasicMaterial({ map: noche, fog: false })); vid.position.set(0, 2.6, 0.02); g.add(vid);
  caja(1.5, 0.12, 0.16, MAT.maderaOsc, 0, 1.75, 0.06, g); caja(1.5, 0.12, 0.12, MAT.maderaOsc, 0, 3.45, 0.06, g);
  caja(0.1, 1.7, 0.12, MAT.maderaOsc, -0.7, 2.6, 0.06, g); caja(0.1, 1.7, 0.12, MAT.maderaOsc, 0.7, 2.6, 0.06, g);
  caja(0.06, 1.6, 0.06, MAT.maderaOsc, 0, 2.6, 0.06, g); caja(1.3, 0.06, 0.06, MAT.maderaOsc, 0, 2.6, 0.06, g);
  caja(1.7, 0.08, 0.3, MAT.madera, 0, 1.7, 0.15, g);
  // escritorio
  const e = new THREE.Group(); e.position.set(0, 0, 0.55); g.add(e);
  caja(1.8, 0.08, 0.85, MAT.maderaClara, 0, 0.82, 0, e);
  [[-0.82, -0.35], [0.82, -0.35], [-0.82, 0.35], [0.82, 0.35]].forEach(([x, z]) => caja(0.08, 0.8, 0.08, MAT.maderaOsc, x, 0.4, z, e));
  caja(0.5, 0.5, 0.75, MAT.madera, 0.6, 0.53, 0, e);
  const globo = new THREE.Mesh(new THREE.IcosahedronGeometry(0.2, 1), MAT.mar); globo.position.set(-0.55, 1.17, -0.1); e.add(globo);
  const tierra = new THREE.Mesh(new THREE.IcosahedronGeometry(0.205, 0), MAT.hoja); tierra.position.copy(globo.position); tierra.rotation.set(0.4, 0.8, 0); tierra.scale.set(0.6, 1, 0.8); e.add(tierra);
  const anillo = new THREE.Mesh(new THREE.TorusGeometry(0.24, 0.015, 4, 16), MAT.oro); anillo.position.copy(globo.position); anillo.rotation.y = 0.5; e.add(anillo);
  cil(0.1, 0.12, 0.06, 8, MAT.oro, -0.55, 0.89, -0.1, e); cil(0.02, 0.02, 0.1, 4, MAT.oro, -0.55, 0.95, -0.1, e);
  caja(0.5, 0.02, 0.36, MAT.crema, 0.05, 0.87, 0.1, e).rotation.y = 0.2;
  cil(0.05, 0.06, 0.1, 6, MAT.negro, 0.38, 0.91, -0.2, e);
  cil(0.12, 0.14, 0.04, 8, MAT.oro, 0.62, 0.88, -0.22, e); cil(0.015, 0.015, 0.4, 4, MAT.oro, 0.62, 1.08, -0.22, e);
  const pant = new THREE.Mesh(new THREE.ConeGeometry(0.16, 0.18, 8, 1, true), M(0x2f9e5d, { side: THREE.DoubleSide, emissive: 0x1a4a2a })); pant.position.set(0.62, 1.3, -0.22); e.add(pant);
  sombra(e);
})();

/* --- planta --- */
function planta(x, z, s) {
  const g = new THREE.Group(); g.position.set(x, 0, z); g.scale.setScalar(s || 1); escena.add(g);
  cil(0.24, 0.18, 0.4, 7, MAT.maceta, 0, 0.2, 0, g);
  [[0, 0.75, 0, 0.32, MAT.hoja], [0.15, 0.95, 0.05, 0.24, MAT.hoja2], [-0.12, 1.05, -0.05, 0.22, MAT.hoja], [0.02, 1.25, 0, 0.18, MAT.hoja2]].forEach(([a, b, c, r, m]) => {
    const h = new THREE.Mesh(new THREE.IcosahedronGeometry(r, 0), m); h.position.set(a, b, c); h.rotation.set(a * 5, b * 3, 0); g.add(h);
  });
  cil(0.03, 0.03, 0.5, 4, MAT.maderaOsc, 0, 0.55, 0, g);
  return sombra(g);
}
planta(-4.35, -4.35, 1.1); planta(4.4, 1.9, 0.9); planta(-4.4, 4.4, 1);

/* --- chimenea (decoración) --- */
const fuego = [];
(function chimenea() {
  const g = encarar(new THREE.Group(), 0, R - 0.35);
  caja(2.6, 2.1, 0.5, MAT.piedra, 0, 1.05, -0.05, g);
  for (let i = 0; i < 9; i++) caja(0.4 + (i % 3) * 0.1, 0.18, 0.04, MAT.piedraOsc, -1.0 + (i % 3) * 0.95, 0.3 + Math.floor(i / 3) * 0.6, 0.22, g);
  caja(1.3, 1.0, 0.04, MAT.negro, 0, 0.55, 0.21, g); caja(1.5, 0.08, 0.5, MAT.piedraOsc, 0, 0.04, 0.4, g);
  caja(3.0, 0.14, 0.7, MAT.maderaOsc, 0, 2.15, 0.05, g);
  caja(1.5, 1.0, 0.25, MAT.piedra, 0, 2.7, -0.1, g);
  [[-0.25, 0.1], [0.25, -0.1]].forEach(([x, r]) => { const l = cil(0.08, 0.08, 0.9, 6, MAT.maderaOsc, x * 0.4, 0.15, 0.4, g); l.rotation.set(0, r, Math.PI / 2); });
  [[0, 0.32, 0.22, MAT.llama2], [-0.2, 0.25, 0.16, MAT.llama], [0.22, 0.24, 0.15, MAT.llama], [0.05, 0.22, 0.11, MAT.llama]].forEach(([x, h, r, m], i) => {
    const f = new THREE.Mesh(new THREE.ConeGeometry(r, h * 1.6, 5), m); f.position.set(x, 0.2 + h * 0.8, 0.42); g.add(f); fuego.push({ f, b: h * 1.6, i });
  });
  for (let i = 0; i < 3; i++) {
    const x = -1.1 + i * 0.25; cil(0.05, 0.05, 0.2 + i * 0.08, 6, MAT.crema, x, 2.32 + i * 0.04, 0.1, g);
    const ll = new THREE.Mesh(new THREE.ConeGeometry(0.03, 0.08, 5), MAT.llama); ll.position.set(x, 2.48 + i * 0.08, 0.1); g.add(ll); llamas.push(ll);
  }
  const mapa = lienzo(160, 100, (x, w, h) => {
    x.fillStyle = '#e8d3a6'; x.fillRect(0, 0, w, h); x.strokeStyle = '#a0784a'; x.lineWidth = 2;
    x.fillStyle = '#c9a76a'; x.beginPath(); x.moveTo(40, 20); x.lineTo(90, 14); x.lineTo(120, 40); x.lineTo(104, 80); x.lineTo(60, 86); x.lineTo(34, 56); x.closePath(); x.fill(); x.stroke();
    x.strokeStyle = '#c23b1f'; x.setLineDash([4, 4]); x.beginPath(); x.moveTo(52, 50); x.lineTo(80, 40); x.lineTo(96, 64); x.stroke();
    x.setLineDash([]); x.lineWidth = 3; x.beginPath(); x.moveTo(91, 59); x.lineTo(101, 69); x.moveTo(101, 59); x.lineTo(91, 69); x.stroke();
  });
  const mp = new THREE.Mesh(new THREE.PlaneGeometry(1.1, 0.7), new THREE.MeshStandardMaterial({ map: mapa, roughness: 1 })); mp.position.set(0, 2.75, 0.04); g.add(mp);
  sombra(g);
})();

/* ---------------- objetos interactivos ---------------- */
const OBJ = {};      // id -> { grupo, pick:[], brillo:[], marca, foco:Vector3, prog, meta, pose(p) }
const pickables = [];
function brillante(c, o) { const m = M(c, o); m.emissive = new THREE.Color(0x000000); return m; }
function registrar(id, grupo, foco, pose, brillo) {
  const o = { id, grupo, foco, pose, brillo: brillo || [], prog: 0, meta: 0, activo: false, marca: null };
  grupo.traverse(m => { if (m.isMesh) { m.userData.id = id; pickables.push(m); } });
  OBJ[id] = o; return o;
}

const texMarca = {};
function marcaTex(tipo) {
  if (texMarca[tipo]) return texMarca[tipo];
  return (texMarca[tipo] = lienzo(128, 128, (x) => {
    const col = { reto: '#ffc23a', hecho: '#2f9e5d', puerta: '#ff6a4d' }[tipo];
    x.fillStyle = 'rgba(0,0,0,.25)'; x.beginPath(); x.arc(64, 68, 50, 0, 7); x.fill();
    x.fillStyle = col; x.beginPath(); x.arc(64, 62, 50, 0, 7); x.fill();
    x.lineWidth = 7; x.strokeStyle = '#fffdf7'; x.stroke();
    x.fillStyle = tipo === 'reto' ? '#15304d' : '#fffdf7'; x.strokeStyle = x.fillStyle;
    if (tipo === 'reto') { x.font = '900 70px Grandstander, sans-serif'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText('?', 64, 66); }
    else if (tipo === 'hecho') { x.lineWidth = 13; x.lineCap = 'round'; x.lineJoin = 'round'; x.beginPath(); x.moveTo(40, 64); x.lineTo(57, 80); x.lineTo(88, 46); x.stroke(); }
    else { x.lineWidth = 9; x.beginPath(); x.arc(64, 52, 14, Math.PI, 0); x.stroke(); x.fillRect(42, 54, 44, 32); }
  }));
}
function ponerMarca(o, y) {
  const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: marcaTex('reto'), depthTest: false, transparent: true, fog: false }));
  s.scale.setScalar(0.34); s.renderOrder = 5; s.position.copy(o.foco); s.position.y = y; s.userData.id = o.id; s.userData.base = y;
  escena.add(s); pickables.push(s); o.marca = s;
}

// libro: estantería en la pared oeste, un libro sobresale
(function estanteria() {
  const g = encarar(new THREE.Group(), -R + 0.35, 0);
  const W = 3.0, HH = 3.4;
  caja(0.12, HH, 0.5, MAT.maderaOsc, -W / 2, HH / 2, 0, g); caja(0.12, HH, 0.5, MAT.maderaOsc, W / 2, HH / 2, 0, g);
  caja(W, HH, 0.04, MAT.maderaOsc, 0, HH / 2, -0.23, g);
  caja(W + 0.3, 0.14, 0.6, MAT.maderaOsc, 0, HH, 0.02, g);
  const colores = [0x8e2c2c, 0x2d5a7b, 0x2f6e4a, 0xc8902a, 0x6b3e7a, 0x9a5b2e, 0x1f3b5a, 0xd9c08a].map(c => M(c));
  let semilla = 7; const rnd = () => (semilla = (semilla * 9301 + 49297) % 233280) / 233280;
  for (let n = 0; n < 4; n++) {
    const y = 0.15 + n * 0.82; caja(W, 0.06, 0.48, MAT.madera, 0, y, 0, g);
    let x = -W / 2 + 0.1;
    while (x < W / 2 - 0.2) {
      if (n === 1 && x > -0.25 && x < 0.15) { x = 0.2; continue; }
      const w = 0.07 + rnd() * 0.08, h = 0.42 + rnd() * 0.2;
      if (rnd() < 0.08 && x < W / 2 - 0.5) { caja(h, w, 0.32, colores[(rnd() * 8) | 0], x + h / 2, y + 0.03 + w / 2, 0.02, g); x += h + 0.03; continue; }
      const b = caja(w, h, 0.3 + rnd() * 0.06, colores[(rnd() * 8) | 0], x + w / 2, y + 0.03 + h / 2, 0.02, g);
      if (rnd() < 0.1) { b.rotation.z = -0.15; x += 0.05; }
      x += w + 0.008;
    }
  }
  sombra(g);
  // el libro del reto
  const libro = new THREE.Group(); libro.position.set(-0.05, 0.97 + 0.33, 0.12); g.add(libro);
  const tapa = brillante(0xb52a2a);
  caja(0.2, 0.62, 0.42, tapa, 0, 0, 0, libro);
  caja(0.21, 0.04, 0.43, MAT.oro, 0, 0.2, 0, libro); caja(0.21, 0.04, 0.43, MAT.oro, 0, -0.2, 0, libro);
  caja(0.18, 0.6, 0.02, MAT.crema, 0, 0, -0.2, libro);
  sombra(libro);
  const foco = new THREE.Vector3(); libro.updateMatrixWorld(true); g.updateMatrixWorld(true); libro.getWorldPosition(foco);
  const o = registrar('libro', libro, foco, p => { libro.position.z = 0.12 + p * 0.38; libro.rotation.x = -p * 0.35; libro.rotation.z = p * 0.12; }, [tapa]);
  o.alturaMarca = foco.y + 0.6;
})();

// cuadro: pared este, se abre como puerta
(function cuadro() {
  const g = encarar(new THREE.Group(), R - 0.12, -0.7);
  // consola debajo
  caja(1.6, 0.07, 0.45, MAT.maderaClara, 0, 0.9, 0.18, g);
  [[-0.72, 0.02], [0.72, 0.02], [-0.72, 0.36], [0.72, 0.36]].forEach(([x, z]) => caja(0.06, 0.88, 0.06, MAT.maderaOsc, x, 0.44, z, g));
  for (let i = 0; i < 2; i++) { cil(0.05, 0.05, 0.25 + i * 0.1, 6, MAT.crema, -0.5 + i * 0.16, 1.06 + i * 0.05, 0.2, g); const ll = new THREE.Mesh(new THREE.ConeGeometry(0.03, 0.08, 5), MAT.llama); ll.position.set(-0.5 + i * 0.16, 1.24 + i * 0.1, 0.2); g.add(ll); llamas.push(ll); }
  [[0.3, 0x2d5a7b], [0.42, 0x8e2c2c]].forEach(([x, c], i) => caja(0.3, 0.07, 0.22, M(c), x + 0.1, 0.97 + i * 0.07, 0.2, g));
  sombra(g);
  // nicho detrás
  caja(1.2, 0.85, 0.04, MAT.negro, 0, 2.5, 0.01, g);
  const cofrecito = brillante(0xd9a03a, { metalness: 0.5, roughness: 0.3 }); caja(0.3, 0.2, 0.1, cofrecito, 0, 2.4, 0.06, g);
  const bisagra = new THREE.Group(); bisagra.position.set(-0.85, 2.5, 0.06); g.add(bisagra);
  const marco = brillante(0xc8902a, { metalness: 0.45, roughness: 0.4 });
  const c = new THREE.Group(); c.position.x = 0.85; bisagra.add(c);
  caja(1.7, 0.12, 0.08, marco, 0, 0.66, 0, c); caja(1.7, 0.12, 0.08, marco, 0, -0.66, 0, c);
  caja(0.12, 1.44, 0.08, marco, -0.79, 0, 0, c); caja(0.12, 1.44, 0.08, marco, 0.79, 0, 0, c);
  const atard = lienzo(256, 192, (x, w, h) => {
    const gr = x.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#ffb070'); gr.addColorStop(0.55, '#ff6a4d'); gr.addColorStop(1, '#6b3e7a'); x.fillStyle = gr; x.fillRect(0, 0, w, h);
    x.fillStyle = '#ffe08a'; x.beginPath(); x.arc(170, 92, 28, 0, 7); x.fill();
    x.fillStyle = '#7a3f5f'; x.beginPath(); x.moveTo(0, 130); x.lineTo(60, 80); x.lineTo(110, 120); x.lineTo(170, 70); x.lineTo(256, 125); x.lineTo(256, 192); x.lineTo(0, 192); x.fill();
    x.fillStyle = '#2f6e4a'; x.beginPath(); x.moveTo(0, 150); x.lineTo(80, 125); x.lineTo(150, 145); x.lineTo(256, 130); x.lineTo(256, 192); x.lineTo(0, 192); x.fill();
    x.fillStyle = '#0e9aa0'; x.beginPath(); x.moveTo(110, 192); x.quadraticCurveTo(130, 160, 180, 142); x.lineTo(190, 144); x.quadraticCurveTo(150, 170, 150, 192); x.fill();
  });
  const tela = new THREE.Mesh(new THREE.PlaneGeometry(1.48, 1.22), new THREE.MeshStandardMaterial({ map: atard, roughness: 1 })); tela.position.z = 0.03; c.add(tela);
  sombra(c);
  const foco = new THREE.Vector3(); g.updateMatrixWorld(true); c.getWorldPosition(foco);
  const o = registrar('cuadro', c, foco, p => { bisagra.rotation.y = -p * 1.25; }, [marco, cofrecito]);
  o.alturaMarca = foco.y + 0.95;
})();

// reloj de péndulo: esquina noreste
let pendulo, manecillas = [];
(function reloj() {
  const g = encarar(new THREE.Group(), 4.1, -4.1);
  const caoba = brillante(0x6e3a22);
  caja(0.9, 0.5, 0.6, caoba, 0, 0.25, 0, g); caja(0.72, 1.6, 0.48, caoba, 0, 1.3, 0, g);
  caja(0.96, 0.85, 0.62, caoba, 0, 2.52, 0, g);
  const techo = new THREE.Mesh(new THREE.ConeGeometry(0.62, 0.35, 4), caoba); techo.position.y = 3.12; techo.rotation.y = Math.PI / 4; techo.scale.z = 0.7; g.add(techo);
  cil(0.06, 0.06, 0.12, 6, MAT.oro, 0, 3.34, 0, g);
  const cara = cil(0.33, 0.33, 0.04, 20, MAT.crema, 0, 2.52, 0.31, g); cara.rotation.x = Math.PI / 2;
  const aro = new THREE.Mesh(new THREE.TorusGeometry(0.34, 0.03, 4, 20), MAT.oro); aro.position.set(0, 2.52, 0.33); g.add(aro);
  for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2; caja(0.03, 0.06, 0.01, MAT.negro, Math.sin(a) * 0.27, 2.52 + Math.cos(a) * 0.27, 0.335, g).rotation.z = -a; }
  [[0.2, 0.035], [0.27, 0.022]].forEach(([l, w]) => { const p = new THREE.Group(); p.position.set(0, 2.52, 0.34); g.add(p); caja(w, l, 0.01, MAT.negro, 0, l / 2, 0, p); manecillas.push(p); });
  caja(0.5, 1.2, 0.02, MAT.negro, 0, 1.3, 0.245, g);
  pendulo = new THREE.Group(); pendulo.position.set(0, 1.85, 0.27); g.add(pendulo);
  caja(0.025, 0.75, 0.02, MAT.oro, 0, -0.38, 0, pendulo); const bob = cil(0.11, 0.11, 0.03, 16, MAT.oro, 0, -0.8, 0, pendulo); bob.rotation.x = Math.PI / 2;
  const bis = new THREE.Group(); bis.position.set(-0.28, 1.3, 0.3); g.add(bis);
  const vidrio = new THREE.MeshStandardMaterial({ color: 0x9fd2e0, transparent: true, opacity: 0.25, roughness: 0.1 });
  caja(0.56, 1.24, 0.02, vidrio, 0.28, 0, 0, bis);
  caja(0.05, 1.26, 0.03, caoba, 0.03, 0, 0.01, bis); caja(0.05, 1.26, 0.03, caoba, 0.53, 0, 0.01, bis);
  const pomo = new THREE.Mesh(new THREE.SphereGeometry(0.03, 6, 4), MAT.oro); pomo.position.set(0.5, 0, 0.04); bis.add(pomo);
  sombra(g);
  const foco = new THREE.Vector3(0, 2.0, 0); g.localToWorld(foco);
  const o = registrar('reloj', g, foco, p => { bis.rotation.y = -p * 1.6; }, [caoba]);
  o.alturaMarca = 3.75; o.extra = () => manecillas.forEach((m, i) => m.rotation.z -= 0.25 * (i + 1));
})();

// cofre con candado: suroeste
(function cofre() {
  const g = encarar(new THREE.Group(), -3.3, 3.2);
  const mad = brillante(0x8a5a32); mad.side = THREE.DoubleSide;
  caja(1.3, 0.62, 0.8, mad, 0, 0.36, 0, g);
  [-0.5, 0.5].forEach(x => caja(0.1, 0.64, 0.82, MAT.oro, x, 0.36, 0, g));
  caja(1.32, 0.08, 0.82, MAT.hierro, 0, 0.08, 0, g);
  const brilloIn = new THREE.Mesh(new THREE.PlaneGeometry(1.15, 0.65), new THREE.MeshBasicMaterial({ color: 0xffd36b, transparent: true, opacity: 0 })); brilloIn.rotation.x = -Math.PI / 2; brilloIn.position.y = 0.68; g.add(brilloIn);
  const bis = new THREE.Group(); bis.position.set(0, 0.67, -0.4); g.add(bis);
  const tapa = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.4, 1.3, 8, 1, false, 0, Math.PI), mad);
  tapa.rotation.z = Math.PI / 2; tapa.position.z = 0.4; tapa.scale.x = 0.55; bis.add(tapa);
  caja(1.28, 0.02, 0.78, MAT.maderaOsc, 0, 0.005, 0.4, bis);
  [-0.5, 0.5].forEach(x => { const b = new THREE.Mesh(new THREE.CylinderGeometry(0.41, 0.41, 0.1, 8, 1, false, 0, Math.PI), MAT.oro); b.position.set(x, 0, 0.4); b.rotation.copy(tapa.rotation); b.scale.x = 0.56; bis.add(b); });
  const candado = new THREE.Group(); candado.position.set(0, 0.6, 0.44); g.add(candado);
  const oroB = brillante(0xffc23a, { metalness: 0.6, roughness: 0.3 });
  caja(0.22, 0.2, 0.08, oroB, 0, -0.08, 0, candado);
  const arco = new THREE.Mesh(new THREE.TorusGeometry(0.07, 0.022, 5, 10, Math.PI), MAT.hierro); arco.position.y = 0.02; candado.add(arco);
  for (let i = 0; i < 3; i++) cil(0.025, 0.025, 0.06, 8, MAT.hierro, -0.06 + i * 0.06, -0.08, 0.05, candado).rotation.x = Math.PI / 2;
  sombra(g);
  const foco = new THREE.Vector3(0, 0.6, 0); g.localToWorld(foco);
  const o = registrar('cofre', g, foco, p => {
    bis.rotation.x = -p * 1.9; candado.position.y = 0.6 - Math.min(1, p * 1.5) * 0.52; candado.rotation.z = p * 1.2; brilloIn.material.opacity = p * 0.85;
  }, [mad, oroB]);
  o.alturaMarca = 1.6;
})();

// caja fuerte: sureste
(function cajaFuerte() {
  const g = encarar(new THREE.Group(), 3.5, 3.4);
  caja(1.1, 0.25, 0.9, MAT.maderaOsc, 0, 0.125, 0, g);
  const metal = brillante(0x3d4a52, { metalness: 0.45, roughness: 0.45 });
  caja(1.0, 1.15, 0.85, metal, 0, 0.83, 0, g);
  caja(0.8, 0.9, 0.04, MAT.negro, 0, 0.83, 0.42, g);
  const tesoro = brillante(0xffc23a, { metalness: 0.5, roughness: 0.3 });
  for (let i = 0; i < 3; i++) caja(0.3, 0.1, 0.05, tesoro, -0.1 + i * 0.05, 0.5 + i * 0.11, 0.45, g);
  const bis = new THREE.Group(); bis.position.set(-0.42, 0.83, 0.45); g.add(bis);
  const puerta = brillante(0x4a5a63, { metalness: 0.5, roughness: 0.4 });
  caja(0.86, 0.96, 0.08, puerta, 0.43, 0, 0, bis);
  const dial = cil(0.16, 0.16, 0.06, 16, MAT.oro, 0.43, 0.08, 0.06, bis); dial.rotation.x = Math.PI / 2;
  for (let i = 0; i < 8; i++) { const a = i / 8 * Math.PI * 2; caja(0.015, 0.04, 0.01, MAT.negro, 0.43 + Math.sin(a) * 0.13, 0.08 + Math.cos(a) * 0.13, 0.095, bis).rotation.z = -a; }
  const man = caja(0.3, 0.04, 0.04, MAT.oro, 0.43, -0.25, 0.07, bis);
  [[0.08, 0.4], [0.08, -0.4]].forEach(([x, y]) => caja(0.06, 0.12, 0.06, MAT.hierro, x - 0.08, y * 0.9, -0.02, bis));
  sombra(g);
  const foco = new THREE.Vector3(0, 0.9, 0); g.localToWorld(foco);
  const o = registrar('caja', g, foco, p => { bis.rotation.y = -p * 1.7; dial.rotation.y = p * 6; man.rotation.z = p * 0.9; }, [metal, tesoro]);
  o.alturaMarca = 1.85;
})();

// puerta de salida: norte
let luzSalida;
(function puerta() {
  const g = encarar(new THREE.Group(), 0, -R + 0.1);
  caja(0.22, 3.35, 0.32, MAT.maderaOsc, -1.06, 1.67, 0, g); caja(0.22, 3.35, 0.32, MAT.maderaOsc, 1.06, 1.67, 0, g);
  caja(2.4, 0.26, 0.34, MAT.maderaOsc, 0, 3.3, 0, g);
  const resplandor = new THREE.Mesh(new THREE.PlaneGeometry(2, 3.2), MAT.luzPuerta); resplandor.position.set(0, 1.6, -0.2); g.add(resplandor);
  const bis = new THREE.Group(); bis.position.set(-0.95, 0, 0); g.add(bis);
  const hoja = brillante(0x7a3f22);
  caja(1.9, 3.15, 0.12, hoja, 0.95, 1.58, 0, bis);
  [[0.5, 2.3], [1.4, 2.3], [0.5, 0.85], [1.4, 0.85]].forEach(([x, y]) => caja(0.66, y > 2 ? 1.1 : 1.15, 0.05, MAT.maderaOsc, x, y, 0.07, bis));
  const pomo = new THREE.Mesh(new THREE.SphereGeometry(0.07, 8, 6), MAT.oro); pomo.position.set(1.7, 1.4, 0.12); bis.add(pomo);
  const cerr = brillante(0xffc23a, { metalness: 0.6, roughness: 0.3 });
  caja(0.14, 0.26, 0.04, cerr, 1.7, 1.18, 0.08, bis);
  // teclado junto a la puerta
  caja(0.36, 0.5, 0.06, MAT.hierro, 1.5, 1.5, 0.02, g);
  const pant = new THREE.Mesh(new THREE.PlaneGeometry(0.26, 0.09), new THREE.MeshBasicMaterial({ color: 0x2f9e5d })); pant.position.set(1.5, 1.65, 0.06); g.add(pant);
  for (let i = 0; i < 9; i++) caja(0.06, 0.05, 0.02, cerr, 1.42 + (i % 3) * 0.08, 1.52 - Math.floor(i / 3) * 0.07, 0.06, g);
  const letrero = lienzo(256, 64, (x, w, h) => {
    x.fillStyle = '#2a1a12'; x.fillRect(0, 0, w, h); x.strokeStyle = '#d9a03a'; x.lineWidth = 5; x.strokeRect(4, 4, w - 8, h - 8);
    x.fillStyle = '#ffc23a'; x.font = '900 40px Grandstander, sans-serif'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText('SALIDA', w / 2, h / 2 + 3);
  });
  const placa = new THREE.Mesh(new THREE.PlaneGeometry(1.0, 0.25), new THREE.MeshBasicMaterial({ map: letrero })); placa.position.set(0, 3.62, 0.03); g.add(placa);
  sombra(g); resplandor.castShadow = false;
  luzSalida = new THREE.PointLight(0xfff0c0, 0, 9, 1.5); luzSalida.position.set(0, 1.8, -0.3); g.add(luzSalida);
  const foco = new THREE.Vector3(0, 1.8, 0); g.localToWorld(foco);
  const o = registrar('puerta', g, foco, p => { bis.rotation.y = p * 1.75; luzSalida.intensity = p * 2.2; cerr.color.setHex(p > 0 ? 0x2f9e5d : 0xffc23a); pant.material.color.setHex(p > 0 ? 0xffc23a : 0x2f9e5d); }, [hoja, cerr]);
  o.alturaMarca = 3.95;
  pickables.push(resplandor); resplandor.userData.id = 'puerta';
})();

Object.values(OBJ).forEach(o => ponerMarca(o, o.alturaMarca || o.foco.y + 0.6));
const marcaPuerta = OBJ.puerta.marca;

/* --- chispas --- */
const chispas = [];
(function () {
  const geo = new THREE.TetrahedronGeometry(0.05), mats = [MAT.oro, new THREE.MeshBasicMaterial({ color: 0xffe08a }), new THREE.MeshBasicMaterial({ color: 0xff6a4d })];
  for (let i = 0; i < 36; i++) { const m = new THREE.Mesh(geo, mats[i % 3]); m.visible = false; escena.add(m); chispas.push({ m, v: new THREE.Vector3(), vida: 0 }); }
})();
function estallar(p) {
  chispas.forEach(c => {
    c.m.position.copy(p); c.v.set((Math.random() - 0.5) * 3, 1.5 + Math.random() * 2.5, (Math.random() - 0.5) * 3); c.vida = 1 + Math.random() * 0.4; c.m.visible = true;
  });
}

/* ---------------- cámara ---------------- */
let yaw = 0, pitch = -0.05, yawMeta = 0, pitchMeta = -0.05, velYaw = 0, salida = 0;
const PITCH_MIN = -0.6, PITCH_MAX = 0.45;
const vertical = () => innerWidth / innerHeight < 0.8;
function ajustar() {
  rd.setSize(innerWidth, innerHeight);
  cam.aspect = innerWidth / innerHeight; cam.fov = vertical() ? 74 : 58; cam.updateProjectionMatrix();
}
addEventListener('resize', ajustar); ajustar();
function cercano(a, ref) { while (a - ref > Math.PI) a -= 2 * Math.PI; while (a - ref < -Math.PI) a += 2 * Math.PI; return a; }
function mirarA(id, conHoja) {
  const o = OBJ[id]; if (!o) return;
  const dx = o.foco.x, dz = o.foco.z, d = Math.hypot(dx, dz);
  yawMeta = cercano(Math.atan2(-dx, -dz), yaw); velYaw = 0;
  let pt = Math.atan2(o.foco.y - OJO, d);
  if (conHoja) pt -= vertical() ? 0.42 : 0.2;
  pitchMeta = Math.max(PITCH_MIN, Math.min(PITCH_MAX, pt));
}

/* --- entrada --- */
const ray = new THREE.Raycaster(), ndc = new THREE.Vector2();
function tocado(cx, cy) {
  ndc.set(cx / innerWidth * 2 - 1, -(cy / innerHeight) * 2 + 1); ray.setFromCamera(ndc, cam);
  const hits = ray.intersectObjects(pickables, false);
  for (const h of hits) { const id = h.object.userData.id; if (id && (id === 'puerta' || OBJ[id].activo)) return id; }
  return null;
}
let arr = null;
const cv = rd.domElement;
cv.addEventListener('pointerdown', e => {
  if (!enJuego || hojaAbierta()) return;
  arr = { x: e.clientX, y: e.clientY, x0: e.clientX, y0: e.clientY, t: performance.now(), mov: 0 };
  cv.setPointerCapture(e.pointerId); velYaw = 0;
});
cv.addEventListener('pointermove', e => {
  if (!arr) {
    if (enJuego && !hojaAbierta() && e.pointerType === 'mouse') cv.classList.toggle('apunta', !!tocado(e.clientX, e.clientY));
    return;
  }
  const k = (e.pointerType === 'touch' ? 0.0058 : 0.0045) * (cam.fov / 60);
  const dx = e.clientX - arr.x, dy = e.clientY - arr.y;
  arr.mov += Math.abs(dx) + Math.abs(dy); arr.x = e.clientX; arr.y = e.clientY;
  yaw += dx * k; yawMeta = yaw; velYaw = dx * k * 0.6;
  pitch = Math.max(PITCH_MIN, Math.min(PITCH_MAX, pitch + dy * k)); pitchMeta = pitch;
});
function soltar(e) {
  if (!arr) return;
  const fue = arr.mov < 10 && performance.now() - arr.t < 600; arr = null;
  if (fue) { velYaw = 0; const id = tocado(e.clientX, e.clientY); if (id) tocar(id); }
}
cv.addEventListener('pointerup', soltar);
/* sin esto, el clic que el navegador inventa tras el toque cae en el velo del reto recién abierto y lo cierra */
cv.addEventListener('touchend', e => e.preventDefault(), { passive: false });
cv.addEventListener('pointercancel', () => { arr = null; });
function girar(s) { yawMeta = cercano(yawMeta + s * Math.PI / 4, yaw); velYaw = 0; }
$('#girarIzq').onclick = () => girar(1); $('#girarDer').onclick = () => girar(-1);

addEventListener('keydown', e => {
  if (hojaAbierta()) { teclaHoja(e); return; }
  if (!enJuego || !$('#panel').hidden) return;
  const k = e.key.toLowerCase();
  if (k === 'arrowleft' || k === 'a') { girar(1); e.preventDefault(); }
  else if (k === 'arrowright' || k === 'd') { girar(-1); e.preventDefault(); }
  else if (k === 'arrowup' || k === 'w') { pitchMeta = Math.min(PITCH_MAX, pitchMeta + 0.15); }
  else if (k === 'arrowdown' || k === 's') { pitchMeta = Math.max(PITCH_MIN, pitchMeta - 0.15); }
  else if (k === 'enter' || k === ' ') {
    // tocar lo que está en el centro de la vista
    const id = tocado(innerWidth / 2, innerHeight / 2); if (id) { tocar(id); e.preventDefault(); }
  }
});

/* ---------------- juego ---------------- */
function aviso(t, ms) {
  const a = $('#aviso'); a.textContent = t; a.hidden = false; a.style.animation = 'none'; void a.offsetWidth; a.style.animation = '';
  clearTimeout(aviso.t); aviso.t = setTimeout(() => { a.hidden = true; }, ms || 2600);
}
function objetoDe(id) { return sala.objetos.find(o => o.objeto === id); }

function empezar(i) {
  salaIdx = i; sala = DATOS.salas[i]; est = nuevoEstado();
  Object.values(OBJ).forEach(o => {
    o.activo = o.id === 'puerta' || !!objetoDe(o.id); o.prog = o.meta = 0; o.pose(0);
    o.marca.visible = o.activo && o.id !== 'puerta'; o.marca.material.map = marcaTex('reto');
  });
  marcaPuerta.material.map = marcaTex('puerta'); marcaPuerta.visible = false;
  salida = 0; cam.position.set(0, OJO, 0);
  yaw = yawMeta = 0; pitch = pitchMeta = -0.05; velYaw = 0;
  $('#inicio').hidden = true; $('#final').hidden = true;
  ['#hud', '#inventario', '#girarIzq', '#girarDer'].forEach(s => { $(s).hidden = false; });
  $('#hudSala').textContent = sala.titulo;
  enJuego = true; pintarHud(); pintarInventario();
  mostrarPanel(sala.titulo, sala.intro + ' Tienes ' + sala.objetos.length + ' objetos por revisar.', 'Entrar');
}
function salirAlInicio() {
  enJuego = false; cerrarHoja(true); $('#panel').hidden = true;
  ['#hud', '#inventario', '#girarIzq', '#girarDer', '#aviso'].forEach(s => { $(s).hidden = true; });
  $('#final').hidden = true; $('#inicio').hidden = false; pintarSalas();
}
function mostrarPanel(titulo, texto, boton) {
  pausaIntro = true; $('#panelTitulo').textContent = titulo; $('#panelTexto').textContent = texto; $('#panelBtn').textContent = boton;
  $('#panel').hidden = false; $('#velo').hidden = false; $('#panelBtn').focus();
}
$('#panelBtn').onclick = () => {
  $('#panel').hidden = true; $('#velo').hidden = true; pausaIntro = false;
  /* se entra mirando la puerta; el aviso dice cómo llegar a los retos */
  if (enJuego && est && !Object.values(est.objs).some(o => o.resuelto)) aviso('Gira con las flechas y toca lo que tiene «?», o su nombre abajo.', 4200);
};
$('#btnAyuda').onclick = () => mostrarPanel('Cómo se juega', sala.intro, 'Seguir');
$('#btnSalir').onclick = salirAlInicio;
$('#btnJugar').onclick = () => empezar(salaIdx);
$('#btnOtraVez').onclick = () => empezar(salaIdx);
$('#btnOtraSala').onclick = () => { salaIdx = (salaIdx + 1) % DATOS.salas.length; salirAlInicio(); };

function pintarHud() { $('#hudTiempo').textContent = mmss(est.tiempo); $('#hudPuntos').textContent = puntaje() + ' pts'; }
function pintarInventario(nuevo) {
  const chips = sala.objetos.filter(o => o.premio).map(o => {
    const p = o.premio, ok = est.objs[o.objeto].resuelto;
    const cls = 'pieza' + (ok ? ' tiene' : '') + (p.tipo === 'llave' ? ' llave' : p.tipo === 'pista' ? ' nota' : '') + (nuevo === o.objeto ? ' nueva' : '');
    const ic = p.tipo === 'digito' ? (ok ? esc(p.valor) : '?') : p.tipo === 'llave' ? SVG_LLAVE : '!';
    const nom = p.tipo === 'pista' && ok ? 'Pista: tócala' : esc(o.nombre);
    return `<div class="${cls}" data-id="${o.objeto}" title="${esc(o.nombre)}"><span class="ic">${ic}</span><span class="nom">${nom}</span></div>`;
  });
  $('#inventario').innerHTML = chips.join('');
  /* las piezas que faltan también son botones: giran hacia su objeto y abren el reto */
  $('#inventario').querySelectorAll('.pieza:not(.tiene)').forEach(el => {
    el.style.pointerEvents = 'auto'; el.style.cursor = 'pointer';
    el.onclick = () => { if (enJuego && !hojaAbierta()) tocar(el.dataset.id); };
  });
  $('#inventario').querySelectorAll('.pieza.nota.tiene').forEach(el => {
    el.style.pointerEvents = 'auto'; el.style.cursor = 'pointer';
    el.onclick = () => aviso(objetoDe(el.dataset.id).premio.texto, 6000);
  });
}

function tocar(id) {
  if (id === 'puerta') return tocarPuerta();
  const e = est.objs[id]; if (!e) return;
  if (e.resuelto) { aviso('Ya resolviste este reto.'); return; }
  mirarA(id, true); abrirReto(id);
}

/* --- hoja --- */
let hojaCtx = null;
const hojaAbierta = () => !$('#hoja').hidden;
function abrirHoja(tipoChip, titulo, enunciado) {
  $('#hojaTipo').textContent = tipoChip; $('#hojaTitulo').textContent = titulo; $('#hojaEnunciado').textContent = enunciado;
  $('#hojaPista').hidden = true; $('#hojaMsg').textContent = ''; $('#hojaMsg').className = 'msg';
  $('#hoja').hidden = false; $('#velo').hidden = false; $('#hoja').scrollTop = 0; $('#hoja').focus({ preventScroll: true });
}
function cerrarHoja(silencio) {
  $('#hoja').hidden = true; if ($('#panel').hidden) $('#velo').hidden = true;
  const ctx = hojaCtx; hojaCtx = null;
  if (!silencio && ctx && ctx.alCerrar) ctx.alCerrar();
  pitchMeta = Math.max(pitchMeta, -0.15);
}
$('#btnCerrar').onclick = () => cerrarHoja();
$('#velo').onclick = () => { if (hojaAbierta()) cerrarHoja(); };
function msg(t, tipo) { const m = $('#hojaMsg'); m.textContent = t; m.className = 'msg ' + (tipo || ''); }

function abrirReto(id) {
  const o = objetoDe(id), r = o.reto, e = est.objs[id];
  abrirHoja(NOMBRE_TIPO[r.tipo] || 'Reto', o.nombre, r.enunciado);
  hojaCtx = { id, tipo: r.tipo };
  const cuerpo = $('#hojaCuerpo');
  const bp = $('#btnPista'); bp.hidden = !r.pista; bp.disabled = e.pista; bp.textContent = e.pista ? 'Pista usada' : 'Pista (−' + CASTIGO_PISTA + ')';
  if (e.pista && r.pista) { $('#hojaPista').textContent = r.pista; $('#hojaPista').hidden = false; }
  bp.onclick = () => {
    if (e.pista) return; e.pista = true; bp.disabled = true; bp.textContent = 'Pista usada';
    $('#hojaPista').textContent = r.pista; $('#hojaPista').hidden = false; pintarHud();
  };
  const fallo = (t) => { e.fallos++; msg((t || 'Casi. Inténtalo otra vez.') + ' (−' + CASTIGO_FALLO + ')', 'mal'); pintarHud(); };
  const acierto = () => premiar(id);

  if (r.tipo === 'opcion' || r.tipo === 'vf') {
    const ops = r.tipo === 'vf' ? ['Verdadero', 'Falso'] : r.opciones;
    cuerpo.innerHTML = `<div class="opciones ${r.tipo === 'vf' ? 'vf' : ''}">` + ops.map((t, i) =>
      `<button class="opcion" data-i="${i}">${r.tipo === 'vf' ? '' : `<span class="l">${'ABCDEFGH'[i]}</span>`}<span>${esc(t)}</span></button>`).join('') + '</div>';
    cuerpo.querySelectorAll('.opcion').forEach(b => b.onclick = () => {
      const i = +b.dataset.i, bien = r.tipo === 'vf' ? (i === 0) === !!r.respuesta : i === r.respuesta;
      if (bien) { b.classList.add('bien'); cuerpo.querySelectorAll('.opcion').forEach(x => { x.disabled = true; }); setTimeout(acierto, 550); }
      else { b.classList.add('mal'); b.disabled = true; fallo(r.tipo === 'vf' ? 'No es así. Piénsalo de nuevo.' : null); }
    });
    hojaCtx.teclas = k => { const i = r.tipo === 'vf' ? ({ v: 0, f: 1 })[k] : 'abcdefgh'.indexOf(k); const b = cuerpo.querySelector(`.opcion[data-i="${i}"]`); if (b && !b.disabled) b.click(); };
  } else if (r.tipo === 'numero') {
    teclado(cuerpo, { max: 8, extras: true, ok: 'Probar', alProbar: (txt, mal) => {
      const v = parseFloat(txt.replace(',', '.').replace('−', '-'));
      if (isNaN(v)) { msg('Escribe un número.', 'mal'); return; }
      if (Math.abs(v - Number(r.respuesta)) <= (Number(r.tolerancia) || 0) + 1e-9) acierto();
      else { mal(); fallo(); }
    } });
  } else if (r.tipo === 'ordenar') {
    const n = r.opciones.length; let dispo = barajar(r.opciones.map((_, i) => i));
    if (dispo.every((v, i) => v === i)) dispo.reverse();
    const puesto = [];
    const pintar = () => {
      cuerpo.innerHTML = `<div class="orden-zona ${puesto.length ? '' : 'vacia'}">` + puesto.map((v, j) => `<button class="ficha" data-p="${j}"><span class="n">${j + 1}</span>${esc(r.opciones[v])}</button>`).join('') + '</div>'
        + '<div class="fichas">' + dispo.filter(v => !puesto.includes(v)).map(v => `<button class="ficha" data-d="${v}">${esc(r.opciones[v])}</button>`).join('') + '</div>'
        + `<button class="btn comprobar" ${puesto.length === n ? '' : 'disabled style="opacity:.5"'}>Comprobar</button>`;
      cuerpo.querySelectorAll('[data-d]').forEach(b => b.onclick = () => { puesto.push(+b.dataset.d); pintar(); });
      cuerpo.querySelectorAll('[data-p]').forEach(b => b.onclick = () => { puesto.splice(+b.dataset.p, 1); pintar(); });
      cuerpo.querySelector('.comprobar').onclick = () => {
        if (puesto.length < n) return;
        const bien = puesto.filter((v, i) => v === i).length;
        if (bien === n) acierto();
        else { const z = cuerpo.querySelector('.orden-zona'); z.classList.add('mal'); fallo('Tienes ' + bien + ' de ' + n + ' en su sitio. Toca uno para quitarlo.'); }
      };
    };
    pintar();
  }
}

function teclado(cuerpo, cfg) {
  let txt = '';
  const casillas = cfg.casillas;
  cuerpo.innerHTML = (casillas ? `<div class="casillas">${casillas.map((c, i) => `<div class="casilla"><b data-c="${i}"></b><small>${esc(c)}</small></div>`).join('')}</div>`
    : '<div class="pantalla-num" aria-live="polite"><span class="v"></span><span class="cursor"></span></div>')
    + '<div class="teclado">' + ['7', '8', '9', '⌫', '4', '5', '6', cfg.extras ? '−' : '', '1', '2', '3', cfg.extras ? ',' : '', '0'].map(k =>
      k ? `<button class="tecla ${k === '⌫' ? 'bor' : ''}" data-k="${k}" aria-label="${k === '⌫' ? 'Borrar' : k}">${k}</button>` : '<span></span>').join('')
    + `<button class="tecla ok" data-k="ok" style="grid-column:span 3">${cfg.ok}</button></div>`;
  const pintar = () => {
    if (casillas) cuerpo.querySelectorAll('[data-c]').forEach((b, i) => { b.textContent = txt[i] || ''; b.parentNode.classList.toggle('activa', i === txt.length); });
    else cuerpo.querySelector('.v').textContent = txt;
  };
  const mal = () => {
    const el = cuerpo.querySelector(casillas ? '.casillas' : '.pantalla-num');
    el.classList.remove('mal'); void el.offsetWidth; el.classList.add('mal'); el.style.animation = 'none'; void el.offsetWidth; el.style.animation = 'sacude .35s';
    txt = ''; setTimeout(pintar, 350);
  };
  const pulsar = k => {
    if (k === '⌫') txt = txt.slice(0, -1);
    else if (k === 'ok') { if (txt) cfg.alProbar(txt, mal); return; }
    else if (k === '−') txt = txt.startsWith('−') ? txt.slice(1) : '−' + txt;
    else if (k === ',') { if (!txt.includes(',')) txt += txt.replace('−', '') ? ',' : '0,'; }
    else if (txt.length < (casillas ? casillas.length : cfg.max)) txt += k;
    pintar();
  };
  cuerpo.querySelectorAll('.tecla').forEach(b => b.onclick = () => pulsar(b.dataset.k));
  hojaCtx.teclas = k => {
    if (/^[0-9]$/.test(k)) pulsar(k); else if (k === 'backspace') pulsar('⌫'); else if (k === 'enter') pulsar('ok');
    else if (cfg.extras && (k === ',' || k === '.')) pulsar(','); else if (cfg.extras && k === '-') pulsar('−');
  };
  pintar();
}
function teclaHoja(e) {
  const k = e.key.toLowerCase();
  if (k === 'escape') { cerrarHoja(); e.preventDefault(); return; }
  if (hojaCtx && hojaCtx.teclas && !(e.target && e.target.tagName === 'BUTTON' && e.target.closest('#hoja') && (k === 'enter' || k === ' '))) { hojaCtx.teclas(k); if (k === 'enter' || k === 'backspace') e.preventDefault(); }
}

function premiar(id) {
  const o = objetoDe(id), e = est.objs[id], p = o.premio || {};
  e.resuelto = true; e.puntos = puntosObj(e); pintarHud();
  const ic = p.tipo === 'digito' ? `<div class="grande-ic">${esc(p.valor)}</div>` : p.tipo === 'llave' ? `<div class="grande-ic llave">${SVG_LLAVE}</div>` : p.tipo === 'pista' ? '<div class="grande-ic nota">!</div>' : '';
  const que = p.tipo === 'digito' ? `Encontraste el dígito <b>${esc(p.valor)}</b>.` : p.tipo === 'llave' ? 'Encontraste una <b>llave</b>.' : p.tipo === 'pista' ? `Encontraste una nota: <b>«${esc(p.texto)}»</b>` : '';
  $('#hojaTipo').textContent = '+' + e.puntos + ' pts';
  $('#hojaEnunciado').textContent = '¡Lo lograste!';
  $('#hojaPista').hidden = true; msg('');
  $('#hojaCuerpo').innerHTML = `<div class="premio">${ic}<p>${que}</p>${o.reto.explicacion ? `<p class="expl">${esc(o.reto.explicacion)}</p>` : ''}<button class="btn grande" id="btnSeguir">Seguir</button></div>`;
  $('#btnPista').hidden = true;
  hojaCtx.teclas = k => { if (k === 'enter') cerrarHoja(); };
  hojaCtx.alCerrar = () => celebrar(id);
  // el objeto se abre ya; la hoja tapa poco en PC
  OBJ[id].meta = 1; OBJ[id].marca.material.map = marcaTex('hecho');
  $('#btnSeguir').onclick = () => cerrarHoja();
  setTimeout(() => { const b = $('#btnSeguir'); if (b) b.focus({ preventScroll: true }); }, 250);
}
function celebrar(id) {
  estallar(OBJ[id].foco); if (OBJ[id].extra) OBJ[id].extra();
  pintarInventario(id);
  if (!faltan().length) {
    marcaPuerta.visible = true;
    setTimeout(() => aviso('¡Tienes todas las piezas! Ve a la puerta.', 3200), 500);
  } else {
    const n = Object.values(est.objs).filter(x => !x.resuelto).length;
    aviso(n ? 'Quedan ' + n + (n === 1 ? ' reto.' : ' retos.') : 'Ya revisaste todo.');
  }
}

function tocarPuerta() {
  if (est.salio) return;
  const f = faltan();
  mirarA('puerta', !f.length);
  if (f.length) {
    const dig = ordenCodigo().length;
    aviso('La puerta pide ' + dig + ' dígitos' + (pideLlave() ? ' y una llave' : '') + '. Te ' + (f.length === 1 ? 'falta 1 pieza.' : 'faltan ' + f.length + ' piezas.'), 3200);
    return;
  }
  const ord = ordenCodigo(), ver = !sala.puerta || sala.puerta.mostrarOrden !== false;
  abrirHoja('La puerta', 'Código de salida', (pideLlave() ? 'La llave ya giró. ' : '') + 'Escribe el código de ' + ord.length + ' dígitos.' + (ver ? '' : ' ¿En qué orden van? Busca la pista.'));
  hojaCtx = { id: 'puerta' }; $('#btnPista').hidden = true;
  teclado($('#hojaCuerpo'), { casillas: ord.map((o, i) => ver ? o.nombre.replace(/^(El|La|Los|Las) /, '') : String(i + 1)), ok: 'Abrir', alProbar: (txt, mal) => {
    const bueno = ord.map(o => o.premio.valor).join('');
    if (txt.length < ord.length) { msg('Faltan dígitos.', 'mal'); return; }
    if (txt === bueno) { cerrarHoja(true); escapar(); }
    else { est.fallosCodigo++; pintarHud(); mal(); msg('Ese código no abre. Revisa el orden. (−' + CASTIGO_CODIGO + ')', 'mal'); }
  } });
  // lo que juntó, a la vista mientras escribe (en PC la hoja tapa el inventario)
  const tengo = sala.objetos.filter(o => o.premio && est.objs[o.objeto].resuelto && o.premio.tipo !== 'llave').sort((a, b) => (a.premio.tipo === 'pista') - (b.premio.tipo === 'pista'));
  if (tengo.length) $('#hojaCuerpo').insertAdjacentHTML('afterbegin', '<div class="tengo">' + tengo.map(o => o.premio.tipo === 'digito'
    ? `<span><b>${esc(o.premio.valor)}</b>${esc(o.nombre)}</span>` : `<span class="nota"><b>!</b>${esc(o.premio.texto)}</span>`).join('') + '</div>');
}

function escapar() {
  est.salio = true; enJuego = false; marcaPuerta.visible = false;
  ['#girarIzq', '#girarDer', '#inventario'].forEach(s => { $(s).hidden = true; });
  mirarA('puerta'); pitchMeta = 0; OBJ.puerta.meta = 1; estallar(OBJ.puerta.foco);
  setTimeout(final, 2900);
}
function final() {
  const n = sala.objetos.length, base = Object.values(est.objs).reduce((s, e) => s + e.puntos, 0);
  const aTiempo = est.tiempo <= (sala.tiempoObjetivo || 600);
  const total = puntaje() + (aTiempo ? BONO_TIEMPO : 0);
  const ratio = (base - CASTIGO_CODIGO * est.fallosCodigo) / (n * PUNTOS_OBJ);
  const estrellas = ratio >= 0.85 ? 3 : ratio >= 0.6 ? 2 : 1;
  const rec = leer(), ant = rec[sala.id];
  const mejor = !ant || total > ant.puntos;
  if (mejor) { rec[sala.id] = { estrellas: Math.max(estrellas, ant ? ant.estrellas : 0), puntos: total, tiempo: Math.round(est.tiempo) }; guardar(rec); }
  $('#hud').hidden = true;
  $('#finTitulo').textContent = estrellas === 3 ? '¡Escapaste!' : estrellas === 2 ? '¡Bien hecho!' : '¡Saliste!';
  $('#finMsg').textContent = (sala.puerta && sala.puerta.mensaje) || '¡Abriste la puerta!';
  $('#finEstrellas').innerHTML = [0, 1, 2].map(i => SVG_ESTRELLA(i < estrellas)).join('');
  $('#finPuntos').textContent = total; $('#finTiempo').textContent = mmss(est.tiempo);
  $('#finPistas').textContent = Object.values(est.objs).filter(e => e.pista).length;
  $('#finRecord').textContent = (aTiempo ? 'Bono por tiempo: +' + BONO_TIEMPO + '. ' : '') + (mejor && ant ? '¡Nuevo récord!' : !mejor ? 'Tu récord: ' + ant.puntos + ' pts' : '');
  $('#final').hidden = false; $('#btnOtraVez').focus();
}

/* ---------------- bucle ---------------- */
const reloj = new THREE.Clock(); let t = 0, raf = 0;
function cuadroAnim() {
  raf = requestAnimationFrame(cuadroAnim);
  const dt = Math.min(0.1, reloj.getDelta()); t += dt;
  if (enJuego && !pausaIntro && est) { const antes = Math.floor(est.tiempo); est.tiempo += dt; if (Math.floor(est.tiempo) !== antes) pintarHud(); }
  // cámara
  if (!enJuego && !$('#inicio').hidden) { yawMeta += dt * 0.08; }
  if (!arr) { yawMeta += velYaw; velYaw *= 0.9; if (Math.abs(velYaw) < 1e-4) velYaw = 0; }
  yaw += (yawMeta - yaw) * Math.min(1, dt * 7); pitch += (pitchMeta - pitch) * Math.min(1, dt * 7);
  cam.rotation.set(pitch, yaw, 0);
  if (est && est.salio) { salida = Math.min(1, salida + dt * 0.45); cam.position.z = -salida * 3.2; cam.position.y = OJO + Math.sin(salida * Math.PI * 4) * 0.03 * salida; }
  // objetos
  for (const id in OBJ) {
    const o = OBJ[id];
    if (o.prog !== o.meta) { o.prog += Math.sign(o.meta - o.prog) * Math.min(Math.abs(o.meta - o.prog), dt * 1.4); const e = o.prog < 0.5 ? 2 * o.prog * o.prog : 1 - Math.pow(-2 * o.prog + 2, 2) / 2; o.pose(e); }
    const brilla = enJuego && o.activo && (id === 'puerta' ? marcaPuerta.visible : !est.objs[id].resuelto);
    const v = brilla ? 0.16 + 0.14 * Math.sin(t * 3.2) : 0;
    o.brillo.forEach(m => m.emissive.setRGB(v, v * 0.7, v * 0.2));
    if (o.marca.visible) o.marca.position.y = o.marca.userData.base + Math.sin(t * 2.4 + o.foco.x) * 0.06;
  }
  pendulo.rotation.z = Math.sin(t * 2.6) * 0.22;
  manecillas[0].rotation.z -= dt * 0.02; manecillas[1].rotation.z -= dt * 0.24;
  llamas.forEach((l, i) => { l.scale.y = 0.85 + 0.25 * Math.sin(t * 11 + i * 1.7); });
  fuego.forEach(({ f, i }) => { f.scale.set(1, 0.8 + 0.3 * Math.sin(t * 9 + i * 2.1) + 0.1 * Math.sin(t * 23 + i), 1); f.rotation.y = t * (i % 2 ? 1 : -1); });
  luzFuego.intensity = 1.2 + 0.25 * Math.sin(t * 13) + 0.15 * Math.sin(t * 7.3);
  for (const c of chispas) if (c.vida > 0) {
    c.vida -= dt; c.v.y -= 6 * dt; c.m.position.addScaledVector(c.v, dt); c.m.rotation.x += dt * 8; c.m.rotation.y += dt * 6;
    c.m.scale.setScalar(Math.max(0.01, Math.min(1, c.vida))); if (c.vida <= 0) c.m.visible = false;
  }
  rd.render(escena, cam);
}
document.addEventListener('visibilitychange', () => {
  if (document.hidden) { cancelAnimationFrame(raf); raf = 0; }
  else if (!raf) { reloj.getDelta(); cuadroAnim(); }
});

pintarSalas();
$('#cargando').hidden = true;
cuadroAnim();

/* depuración */
window.__juego = {
  get estado() { return est && { sala: sala.id, tiempo: Math.round(est.tiempo), puntaje: puntaje(), resueltos: Object.keys(est.objs).filter(k => est.objs[k].resuelto), faltan: faltan().map(o => o.objeto), salio: est.salio }; },
  empezar: i => { empezar(i || 0); $('#panelBtn').click(); },
  tocar,
  resolver: id => { if (est && est.objs[id] && !est.objs[id].resuelto) { abrirReto(id); premiar(id); cerrarHoja(); } },
  saltar: () => { Object.keys(est.objs).forEach(id => window.__juego.resolver(id)); },
  codigo: () => ordenCodigo().map(o => o.premio.valor).join(''),
  mirar: id => mirarA(id),
  yaw: v => { yaw = yawMeta = v; }
};
})();
