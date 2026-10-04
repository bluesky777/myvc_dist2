/* Taller de fracciones y sólidos — motor 3D (three r128, sin build).
   Tres estaciones sobre mesas de un taller: fracciones (cortar y servir), sólidos (redes y conteo) y volumen (cubitos).
   Los retos vienen de window.DATOS_GEOMETRIA (datos.js). */
(function () {
'use strict';
const D = window.DATOS_GEOMETRIA, T = THREE, V3 = T.Vector3, PI = Math.PI;
const $ = s => document.querySelector(s);
const clamp = (x, a, b) => Math.max(a, Math.min(b, x));
const easeO = k => 1 - Math.pow(1 - k, 3);
const easeIO = k => k < .5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2;
const rebote = k => { const n = 7.5625, d = 2.75; if (k < 1 / d) return n * k * k; if (k < 2 / d) return n * (k -= 1.5 / d) * k + .75; if (k < 2.5 / d) return n * (k -= 2.25 / d) * k + .9375; return n * (k -= 2.625 / d) * k + .984375; };
const KEYS = ['fracciones', 'solidos', 'volumen'];
const azar = a => a[Math.floor(Math.random() * a.length)];

/* ---------- progreso ---------- */
const CLAVE = 'juegos3d.geometria';
const prog = { fracciones: [], solidos: [], volumen: [], visto: {} };
try { const p = JSON.parse(localStorage.getItem(CLAVE) || 'null'); if (p && typeof p === 'object') KEYS.concat('visto').forEach(k => { if (p[k] && typeof p[k] === 'object') prog[k] = p[k]; }); } catch (e) { /* sin progreso */ }
function guardar() { try { localStorage.setItem(CLAVE, JSON.stringify(prog)); } catch (e) { /* el juego sigue igual */ } }
const niveles = k => D.estaciones[k].niveles;
const estrellasDe = k => niveles(k).reduce((s, _, i) => s + (prog[k][i] || 0), 0);
const hechos = k => niveles(k).filter((_, i) => prog[k][i] > 0).length;
const todoHecho = () => KEYS.every(k => hechos(k) === niveles(k).length);

/* ---------- motor ---------- */
const rd = new T.WebGLRenderer({ antialias: true });
rd.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
rd.shadowMap.enabled = true; rd.shadowMap.type = T.PCFSoftShadowMap;
$('#gl').appendChild(rd.domElement);
const scene = new T.Scene();
const FONDO = 0xf3dcb8;
scene.background = new T.Color(FONDO); scene.fog = new T.Fog(FONDO, 34, 75);
const cam = new T.PerspectiveCamera(40, 1, .1, 120);
const camTgt = new V3(0, 1.5, 0);
scene.add(new T.HemisphereLight(0xfff6e8, 0xc0915e, .8));
const sun = new T.DirectionalLight(0xfff1dc, .78);
sun.castShadow = true; sun.shadow.mapSize.set(1024, 1024); sun.shadow.bias = -.0006; sun.shadow.normalBias = .02;
scene.add(sun, sun.target);

const mats = {};
function M(c, o) { const k = c + (o ? JSON.stringify(o) : ''); return mats[k] || (mats[k] = new T.MeshStandardMaterial(Object.assign({ color: c, flatShading: true, roughness: .82, metalness: 0 }, o || {}))); }
const COMPARTIDA = new Set();
const GEO = {};
function geo(k, g) { if (!GEO[k]) { GEO[k] = g(); COMPARTIDA.add(GEO[k]); } return GEO[k]; }
function malla(g, m, x = 0, y = 0, z = 0, sombra = true) { const o = new T.Mesh(g, m); o.position.set(x, y, z); o.castShadow = sombra; o.receiveShadow = true; return o; }
const caja = (w, h, d, c, x, y, z) => malla(new T.BoxGeometry(w, h, d), typeof c === 'number' ? M(c) : c, x, y, z);
const cil = (rt, rb, h, s, c, x, y, z) => malla(new T.CylinderGeometry(rt, rb, h, s), typeof c === 'number' ? M(c) : c, x, y, z);
const INVIS = new T.MeshBasicMaterial({ visible: false });
const LINEA = new T.LineBasicMaterial({ color: 0x15304d, transparent: true, opacity: .55 });
function liberar(o) {
  o.traverse(m => {
    if (m.geometry && !COMPARTIDA.has(m.geometry)) m.geometry.dispose();
    if (m.isSprite) { m.material.map && m.material.map.dispose(); m.material.dispose(); }
    if (m.userData.propia) m.material.dispose();
  });
  o.parent && o.parent.remove(o);
}

function rrect(x, a, b, w, h, r) { x.beginPath(); x.moveTo(a + r, b); x.arcTo(a + w, b, a + w, b + h, r); x.arcTo(a + w, b + h, a, b + h, r); x.arcTo(a, b + h, a, b, r); x.arcTo(a, b, a + w, b, r); x.closePath(); }
function etiqueta(txt, h = .34, o = {}) {
  const fs = 72, pad = fs * .42, font = `900 ${fs}px Grandstander, Lexend, sans-serif`;
  const c = document.createElement('canvas'); let x = c.getContext('2d'); x.font = font;
  const w = Math.ceil(x.measureText(txt).width + pad * 2); c.width = w; c.height = Math.round(fs * 1.4);
  x = c.getContext('2d'); x.font = font; x.textAlign = 'center'; x.textBaseline = 'middle';
  rrect(x, 4, 4, w - 8, c.height - 8, (c.height - 8) / 2); x.fillStyle = o.bg || '#fffdf7'; x.fill();
  x.lineWidth = 6; x.strokeStyle = o.borde || '#15304d'; x.stroke();
  x.fillStyle = o.color || '#15304d'; x.fillText(txt, w / 2, c.height / 2 + fs * .05);
  const tex = new T.CanvasTexture(c); tex.minFilter = T.LinearFilter;
  const sp = new T.Sprite(new T.SpriteMaterial({ map: tex, depthTest: !!o.dt, transparent: true }));
  sp.scale.set(h * w / c.height, h, 1); sp.renderOrder = 20; return sp;
}

/* ---------- animaciones ---------- */
let tws = [];
function anim(dur, fn) { return new Promise(res => tws.push({ t: 0, dur: Math.max(dur, .001), fn, res })); }
const esperar = s => anim(s, () => {});
function tick(dt) { const l = tws; tws = []; const keep = []; for (const w of l) { w.t += dt; const k = Math.min(1, w.t / w.dur); w.fn(k); if (k < 1) keep.push(w); else w.res(); } tws = keep.concat(tws); }

/* ---------- cámara y encuadre ---------- */
let vista = null, camMov = null, banda = { top: 0, bottom: 1, H: 1 };
function medirBanda() {
  const H = innerHeight; let top = 0, bottom = H;
  ui.reto.style.top = (ui.hud.classList.contains('oculto') ? 70 : ui.hud.getBoundingClientRect().bottom + 8) + 'px';
  const vis = el => el && el.innerHTML.trim() !== '' && getComputedStyle(el).display !== 'none';
  ['#hud', '#reto'].forEach(s => { const el = $(s); if (vis(el)) top = Math.max(top, el.getBoundingClientRect().bottom); });
  ['#controles', '#hub'].forEach(s => { const el = $(s); if (vis(el)) bottom = Math.min(bottom, el.getBoundingClientRect().top); });
  if (pantalla === 'inicio') { top = 0; bottom = H; }
  if (bottom - top < H * .35) { top = H * .2; bottom = H * .78; }
  banda = { top, bottom, H };
  const c = $('#controles'); document.documentElement.style.setProperty('--ctlh', (vis(c) ? c.offsetHeight : 0) + 'px');
  const off = H / 2 - (top + bottom) / 2;
  cam.setViewOffset(innerWidth, H, 0, off, innerWidth, H);
}
function posVista(v) {
  const vf = cam.fov * PI / 360, frac = (banda.bottom - banda.top) / banda.H;
  const tv = Math.tan(vf) * frac, th = Math.tan(vf) * cam.aspect * .94, vert = cam.aspect < .9;
  const rx = (vert && v.rxv) || v.rx || v.R, ry = (vert && v.ryv) || v.ry || v.R;
  const d = Math.max(rx / th, ry / tv) + (v.dz === undefined ? 1 : v.dz);
  const el = v.el * PI / 180, az = (v.az || 0) * PI / 180;
  return { p: new V3(v.t.x + d * Math.cos(el) * Math.sin(az), v.t.y + d * Math.sin(el), v.t.z + d * Math.cos(el) * Math.cos(az)), t: v.t.clone() };
}
function irVista(v, dur = 1) {
  vista = v; const b = posVista(v);
  const s = v.sombra || 6, c = sun.shadow.camera;
  c.left = -s; c.right = s; c.top = s; c.bottom = -s; c.near = 1; c.far = 50; c.updateProjectionMatrix();
  sun.target.position.copy(v.t); sun.position.copy(v.t).add(new V3(5, 12, 7));
  if (!dur) { cam.position.copy(b.p); camTgt.copy(b.t); cam.lookAt(camTgt); camMov = null; return; }
  camMov = { a: { p: cam.position.clone(), t: camTgt.clone() }, b, t: 0, dur };
}
function reencuadrar(dur = .45) { medirBanda(); if (vista) irVista(vista, dur); }

/* ---------- el taller ---------- */
const TOP = 1.1;
const EST_X = { fracciones: -9, solidos: 0, volumen: 9 };
const COL_EST = { fracciones: 0xff6a4d, solidos: 0x0e9aa0, volumen: 0xffc23a };
const est = {}, mesas = [], lamparas = [];
function textura(w, h, pintar) { const c = document.createElement('canvas'); c.width = w; c.height = h; pintar(c.getContext('2d'), w, h); const t = new T.CanvasTexture(c); t.anisotropy = 4; return t; }
function planta(x, z, s = 1) {
  const g = new T.Group(); g.position.set(x, 0, z); g.scale.setScalar(s);
  g.add(cil(.42, .3, .7, 8, 0xc8643c, 0, .35, 0), cil(.46, .46, .1, 8, 0xb4552f, 0, .7, 0));
  [[0, 1.25, 0, .55], [.3, 1.05, .2, .4], [-.3, 1.1, -.1, .42], [.05, 1.6, -.1, .38]].forEach(([a, b, c, r], i) => g.add(malla(new T.IcosahedronGeometry(r, 0), M(i % 2 ? 0x46b86a : 0x2f9e5d), a, b, c)));
  return g;
}
function construirTaller() {
  const g = new T.Group(); scene.add(g);
  const tablas = [0xc99a6b, 0xbd8d5f, 0xd3a577];
  for (let i = 0; i < 15; i++) { const t = caja(40, .2, 1.6, tablas[i % 3], 0, -.1, -6.2 + i * 1.6 + .8); t.castShadow = false; g.add(t); }
  g.add(caja(40, 18, .3, 0xfbe6c4, 0, 9, -6.3), caja(40, 1.3, .2, 0xd88a5a, 0, .65, -6.08), caja(40, .14, .3, 0xb8683f, 0, 1.32, -6.05));
  [-19, 19].forEach(x => g.add(caja(.3, 18, 26, 0xf3d9b0, x, 9, 6.5)));
  // ventanas con cielo
  const vidrio = M(0xaee6f7, { emissive: 0x7fd0ec, emissiveIntensity: .45 });
  [-10.5, 3.5, 13.5].forEach(x => {
    g.add(caja(3.3, 2.5, .2, 0xfffdf7, x, 4.7, -6.1), caja(2.9, 2.1, .22, vidrio, x, 4.7, -6.05), caja(.14, 2.1, .26, 0xfffdf7, x, 4.7, -6.0), caja(2.9, .14, .26, 0xfffdf7, x, 4.7, -6.0), caja(3.6, .16, .5, 0xd88a5a, x, 3.4, -5.9));
    const s = planta(x + 1.1, -5.8, .35); s.position.y = 3.48; g.add(s);
  });
  // repisas con frascos y sólidos de adorno
  [[-3.5, [0xff6a4d, 0xffc23a, 0x2f9e5d, 0x0e9aa0]], [9, [0x8a6fd1, 0xff8fab, 0xffc23a]]].forEach(([x, cols]) => {
    g.add(caja(3.8, .16, .7, 0xa86b3c, x, 4.1, -5.8));
    cols.forEach((c, i) => { const xx = x - 1.3 + i * .85; g.add(cil(.24, .24, .55, 8, M(c, { transparent: true, opacity: .85 }), xx, 4.46, -5.8), cil(.26, .26, .1, 8, 0x8a5a32, xx, 4.78, -5.8)); });
  });
  g.add(caja(3.2, .16, .7, 0xa86b3c, -14.5, 3.3, -5.8));
  [[new T.ConeGeometry(.35, .7, 6), 0xff6a4d], [new T.BoxGeometry(.55, .55, .55), 0x0e9aa0], [new T.IcosahedronGeometry(.32, 0), 0xffc23a], [new T.CylinderGeometry(.28, .28, .6, 10), 0x2f9e5d]].forEach(([gg, c], i) => g.add(malla(gg, M(c), -15.6 + i * .75, 3.72, -5.8)));
  [[-17, -4.5, 1.3], [17.2, -4.3, 1.4], [-3.6, -4.8, .9], [3.6, -4.8, .9]].forEach(([x, z, s]) => g.add(planta(x, z, s)));

  KEYS.forEach(k => {
    const x = EST_X[k];
    // tapete
    const tap = malla(new T.CylinderGeometry(4.6, 4.6, .03, 32), M(COL_EST[k], { roughness: 1 }), x, .015, .3, false); tap.scale.z = .78; g.add(tap);
    const tap2 = malla(new T.CylinderGeometry(4.2, 4.2, .035, 32), M(0xfff4dc, { roughness: 1 }), x, .02, .3, false); tap2.scale.z = .78; g.add(tap2);
    // mesa
    const m = caja(7.2, .24, 5.6, 0xcf9560, x, TOP - .12, .2); m.userData.est = k; g.add(m); mesas.push(m);
    g.add(caja(6.9, .3, 5.3, 0xa86b3c, x, TOP - .38, .2));
    [[-3.3, -2.4], [3.3, -2.4], [-3.3, 2.8], [3.3, 2.8]].forEach(([a, b]) => g.add(caja(.24, TOP - .24, .24, 0x8f5b33, x + a, (TOP - .24) / 2, b)));
    // lámpara colgante
    const lam = new T.Group(); lam.add(cil(.015, .015, 3.2, 4, 0x15304d, x, 8.2, 0), malla(new T.ConeGeometry(.6, .5, 10, 1, true), M(COL_EST[k], { side: T.DoubleSide }), x, 6.55, 0), malla(new T.SphereGeometry(.2, 8, 6), M(0xfff1c4, { emissive: 0xffd36b, emissiveIntensity: .9 }), x, 6.3, 0, false)); g.add(lam); lamparas.push(lam);
    // letrero
    const tex = textura(512, 160, (c, w, h) => { c.fillStyle = '#fffdf7'; c.fillRect(0, 0, w, h); c.fillStyle = '#' + COL_EST[k].toString(16).padStart(6, '0'); c.fillRect(0, h - 22, w, 22); c.fillStyle = '#15304d'; c.font = '900 78px Grandstander, Lexend, sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(D.estaciones[k].nombre, w / 2, h / 2 - 8); });
    const letrero = new T.Group(); letrero.position.set(x, 4.5, -3.4);
    letrero.add(caja(3.3, 1.12, .12, 0x8f5b33, 0, 0, -.07), new T.Mesh(new T.PlaneGeometry(3.1, .97), new T.MeshBasicMaterial({ map: tex })));
    letrero.add(cil(.02, .02, 2.3, 4, 0x15304d, -1.3, 1.7, -.05), cil(.02, .02, 2.3, 4, 0x15304d, 1.3, 1.7, -.05));
    g.add(letrero);
    const e = new T.Group(); e.position.set(x, TOP, 0); scene.add(e); est[k] = e;
  });

  // decoración de fracciones: horno de ladrillo
  const xf = EST_X.fracciones, horno = new T.Group(); horno.position.set(xf - 1.2, 0, -4.6);
  horno.add(caja(3.6, 1.1, 2.6, 0xb85a3c, 0, .55, 0), malla(new T.SphereGeometry(1.45, 10, 6, 0, 2 * PI, 0, PI / 2), M(0xd9634a), 0, 1.1, 0));
  const boca = malla(new T.CircleGeometry(.62, 10, 0, PI), M(0x3a1d14), 0, 1.12, 1.4); horno.add(boca);
  horno.add(malla(new T.ConeGeometry(.22, .45, 6), M(0xffa53a, { emissive: 0xff7a1a, emissiveIntensity: .9 }), -.15, 1.32, 1.1, false), malla(new T.ConeGeometry(.17, .35, 6), M(0xffd36b, { emissive: 0xffb02a, emissiveIntensity: 1 }), .15, 1.28, 1.15, false));
  horno.add(cil(.25, .3, 1.4, 8, 0x9c4a30, .7, 2.6, -.4));
  g.add(horno);
  const fe = est.fracciones; fe.add(cil(.25, .25, .5, 8, 0xfff4dc, 3.0, .25, -1.9));
  [0, .5, 1].forEach(i => { const cu = caja(.06, .9, .06, 0x8a5a32, 2.95 + i * .06 - .06, .7, -1.9); cu.rotation.z = (i - .5) * .25; fe.add(cu); });
  // decoración de sólidos: plano azul y lápiz
  const se = est.solidos;
  const plano = new T.Mesh(new T.PlaneGeometry(5.6, 4), new T.MeshStandardMaterial({ map: textura(256, 180, (c, w, h) => { c.fillStyle = '#2f6fb5'; c.fillRect(0, 0, w, h); c.strokeStyle = 'rgba(255,255,255,.28)'; c.lineWidth = 1; for (let i = 0; i < w; i += 16) { c.beginPath(); c.moveTo(i, 0); c.lineTo(i, h); c.stroke(); } for (let j = 0; j < h; j += 16) { c.beginPath(); c.moveTo(0, j); c.lineTo(w, j); c.stroke(); } }), roughness: 1 }));
  plano.rotation.x = -PI / 2; plano.position.y = .005; plano.receiveShadow = true; se.add(plano);
  se.add(cil(.62, .72, .1, 16, 0xffe3a8, 0, .05, 0), cil(.74, .74, .03, 16, 0x0e9aa0, 0, .015, 0));
  const lapiz = new T.Group(); lapiz.add(cil(.05, .05, 1.1, 6, 0xffc23a, 0, 0, 0), malla(new T.ConeGeometry(.05, .18, 6), M(0xf2d0a0), 0, .64, 0)); lapiz.rotation.set(PI / 2, 0, .6); lapiz.position.set(2.3, .05, 1.5); se.add(lapiz);
  se.add(caja(1.4, .02, .22, 0xffe08a, -2.2, .02, 1.6));
  // decoración de volumen: guacales y torre de cubitos
  const xv = EST_X.volumen;
  [[xv + 1.6, -4.4, 0], [xv - .4, -4.6, .3], [xv + .6, -4.5, 0, 1]].forEach(([x, z, r, alto]) => {
    const gc = new T.Group(); gc.position.set(x, alto ? 1.2 : 0, z); gc.rotation.y = r;
    [.15, .55, .95].forEach(y => gc.add(caja(1.6, .26, 1.2, 0xc08850, 0, y, 0)));
    gc.add(caja(1.5, 1.15, 1.1, 0x8f5b33, 0, .57, 0)); g.add(gc);
  });
  const ve = est.volumen, colv = [0xff6a4d, 0xffc23a, 0x2f9e5d, 0x0e9aa0];
  [[0, 0, 0], [1, 0, 0], [0, 0, 1], [0, 1, 0]].forEach(([a, b, c], i) => ve.add(caja(.3, .3, .3, colv[i], 2.8 + a * .31, .15 + b * .31, -1.9 + c * .31)));
}

/* ---------- interfaz ---------- */
const ui = { reto: $('#reto'), ctl: $('#controles'), toast: $('#toast'), velo: $('#velo'), panel: $('#panel'), hub: $('#hub'), inicio: $('#inicio'), hud: $('#hud') };
const frac = (a, b) => `<span class="fr"><span>${a}</span><span>${b}</span></span>`;
const fracTxt = (a, b) => a + '/' + b;
const plantilla = (s, v) => String(s || '').replace(/\{(\w+)\}/g, (m, k) => v[k] !== undefined ? v[k] : m);
const estrellasHTML = n => [0, 1, 2].map(i => `<i class="${i < n ? 'on' : ''}">★</i>`).join('');
let toastT = 0;
function toast(msg, tipo) { const t = ui.toast; t.innerHTML = msg; t.className = 'toast ' + (tipo || ''); void t.offsetWidth; t.classList.add('ver'); clearTimeout(toastT); toastT = setTimeout(() => t.classList.remove('ver'), 3200); }
function setReto(html) { ui.reto.innerHTML = html; }
function setControles(html) { ui.ctl.innerHTML = html; reencuadrar(); }
function abrirPanel(html, acciones) {
  ui.panel.innerHTML = html; ui.velo.classList.add('ver');
  ui.panel.onclick = e => { const b = e.target.closest('[data-p]'); if (!b) return; cerrarPanel(); acciones[b.dataset.p] && acciones[b.dataset.p](); };
  const f = ui.panel.querySelector('button'); f && f.focus();
}
function cerrarPanel() { ui.velo.classList.remove('ver'); }
ui.ctl.addEventListener('click', e => { const b = e.target.closest('[data-a]'); if (!b || b.disabled || !modo) return; modo.accion(b.dataset.a, b); });

const ICONOS = {
  fracciones: '<svg viewBox="0 0 52 52"><circle cx="26" cy="26" r="22" fill="#e0a458"/><circle cx="26" cy="26" r="18" fill="#ffcf4d"/><path d="M26 26 L26 4 A22 22 0 0 1 48 26 Z" fill="#ff6a4d" stroke="#15304d" stroke-width="2"/><circle cx="18" cy="31" r="3.5" fill="#c63d2f"/><circle cx="27" cy="38" r="3.5" fill="#c63d2f"/><path d="M26 4V48M4 26H48" stroke="#15304d" stroke-width="2"/></svg>',
  solidos: '<svg viewBox="0 0 52 52"><path d="M26 6 46 16 46 38 26 48 6 38 6 16Z" fill="#0e9aa0"/><path d="M26 6 46 16 26 26 6 16Z" fill="#5cc7cb"/><path d="M26 26 46 16 46 38 26 48Z" fill="#0b7d82"/><path d="M26 6 46 16 46 38 26 48 6 38 6 16Z M6 16 26 26 46 16 M26 26V48" fill="none" stroke="#15304d" stroke-width="2" stroke-linejoin="round"/></svg>',
  volumen: '<svg viewBox="0 0 52 52"><g stroke="#15304d" stroke-width="1.6" stroke-linejoin="round"><path d="M8 20 20 14 32 20 20 26Z" fill="#ffd96e"/><path d="M8 20V32L20 38V26Z" fill="#ffc23a"/><path d="M20 26V38L32 32V20Z" fill="#e0a51c"/><path d="M20 14 32 8 44 14 32 20Z" fill="#ff8b72"/><path d="M32 20V32L44 26V14Z" fill="#e2563b"/><path d="M20 26 32 20 44 26 32 32Z" fill="#7fd08f"/><path d="M32 32V44L44 38V26Z" fill="#2f9e5d"/><path d="M20 38V38L32 44V32L20 38" fill="#46b86a"/></g></svg>'
};

/* ---------- estado ---------- */
let pantalla = 'inicio', estAct = null, nivAct = 0, modo = null, G = 0;

function actualizarHud() {
  const enEst = pantalla === 'estacion';
  $('#hNombre').textContent = enEst ? D.estaciones[estAct].nombre : 'Taller';
  $('#bAyuda').classList.toggle('oculto', !enEst);
  const dots = $('#hDots');
  if (enEst) {
    dots.innerHTML = niveles(estAct).map((_, i) => { const ok = prog[estAct][i] > 0, abierto = i === 0 || ok || prog[estAct][i - 1] > 0; return `<button class="dot ${ok ? 'hecho' : ''} ${i === nivAct ? 'act' : ''}" data-n="${i}" ${abierto ? '' : 'disabled'} aria-label="Reto ${i + 1}"></button>`; }).join('');
    $('#hEstrellas').innerHTML = `<i>★</i>${estrellasDe(estAct)}<small style="font-size:12px;opacity:.6">/${niveles(estAct).length * 3}</small>`;
  } else {
    dots.innerHTML = `<span style="font-size:12px;font-weight:500">Fracciones · sólidos · volumen</span>`;
    $('#hEstrellas').innerHTML = `<i>★</i>${KEYS.reduce((s, k) => s + estrellasDe(k), 0)}`;
  }
}
$('#hDots').addEventListener('click', e => { const b = e.target.closest('[data-n]'); if (b && !b.disabled) iniciarNivel(+b.dataset.n); });
$('#bAtras').addEventListener('click', () => { if (pantalla === 'estacion') irHub(); else window.volverAJuegos(); });
$('#bAyuda').addEventListener('click', () => { if (estAct) mostrarComo(estAct); });

function mostrarComo(k, luego) {
  abrirPanel(`<h2>${D.estaciones[k].nombre}</h2><p>${D.estaciones[k].como}</p><div class="pbtns"><button class="btn pri" data-p="ok">¡A jugar!</button></div>`, { ok: () => luego && luego() });
}

function pintarHub() {
  ui.hub.innerHTML = KEYS.map(k => { const n = niveles(k).length, h = hechos(k); return `<button class="card" data-k="${k}">${ICONOS[k]}<b>${D.estaciones[k].nombre}</b><span>★ ${estrellasDe(k)} de ${n * 3} · ${h} de ${n} retos</span><div class="barra"><i style="width:${Math.round(100 * h / n)}%"></i></div></button>`; }).join('') + `<div class="hubnota">${D.como}</div>`;
}
ui.hub.addEventListener('click', e => { const b = e.target.closest('[data-k]'); if (b) entrarEstacion(b.dataset.k); });

const VISTA_HUB = { t: new V3(0, 1.3, -.4), rx: 13.6, ry: 3.6, rxv: 4.6, ryv: 4, el: 24, az: 0, sombra: 18 };
function irHub() {
  G++; quitarModo(); pantalla = 'hub'; estAct = null;
  setReto(''); ui.ctl.innerHTML = ''; ui.hub.classList.remove('oculto'); ui.hud.classList.remove('oculto');
  pintarHub(); actualizarHud(); vista = VISTA_HUB; reencuadrar(1.1);
  if (todoHecho() && !prog.visto.final) { prog.visto.final = 1; guardar(); setTimeout(panelFinal, 1200); }
}
function panelFinal() {
  const tot = KEYS.reduce((s, k) => s + estrellasDe(k), 0), max = KEYS.reduce((s, k) => s + niveles(k).length * 3, 0);
  const n = Math.round(3 * tot / max);
  abrirPanel(`<div class="pstar">${estrellasHTML(n)}</div><h2>¡Terminaste el taller!</h2><p>Ganaste <b>${tot}</b> de ${max} estrellas en las tres estaciones.</p><div class="pbtns"><a class="btn pri" href="../index.html" data-p="x" style="text-decoration:none;display:grid;place-items:center">Volver a los juegos</a><button class="btn" data-p="seguir">Seguir en el taller</button></div>`, {});
}
function entrarEstacion(k) {
  pantalla = 'estacion'; estAct = k; ui.hub.classList.add('oculto');
  const n = niveles(k).findIndex((_, i) => !(prog[k][i] > 0));
  iniciarNivel(n < 0 ? 0 : n);
  if (!prog.visto[k]) { prog.visto[k] = 1; guardar(); mostrarComo(k); }
}
function quitarModo() { if (modo) { modo.fin && modo.fin(); liberar(modo.g); modo = null; } tws = []; }
function iniciarNivel(i) {
  G++; quitarModo(); nivAct = i; cerrarPanel();
  const nv = niveles(estAct)[i];
  modo = ({ fracciones: modoFracciones, solidos: modoSolidos, volumen: modoVolumen })[estAct](nv, G);
  actualizarHud();
}
function ganar(n, msg) {
  const k = estAct, i = nivAct, g0 = G;
  prog[k][i] = Math.max(prog[k][i] || 0, n); guardar(); actualizarHud();
  confeti(); modo && (modo.terminado = true);
  setTimeout(() => {
    if (g0 !== G) return;
    const ultimo = i === niveles(k).length - 1;
    if (ultimo) {
      abrirPanel(`<div class="pstar">${estrellasHTML(n)}</div><h2>¡Estación completa!</h2><p>${msg || ''}<br>En ${D.estaciones[k].nombre} llevas <b>★ ${estrellasDe(k)}</b> de ${niveles(k).length * 3}.</p><div class="pbtns"><button class="btn pri" data-p="hub">Volver al taller</button><button class="btn" data-p="rep">Repetir este reto</button><a class="lnk" href="../index.html">Volver a los juegos</a></div>`, { hub: irHub, rep: () => iniciarNivel(i) });
    } else {
      abrirPanel(`<div class="pstar">${estrellasHTML(n)}</div><h2>${azar(D.bien)}</h2><p>${msg || ''}</p><div class="pbtns"><button class="btn pri" data-p="sig">Siguiente reto</button><button class="btn" data-p="rep">Repetir</button></div>`, { sig: () => iniciarNivel(i + 1), rep: () => iniciarNivel(i) });
    }
  }, 1100);
}

/* confeti */
function confeti() {
  const g = new T.Group(); scene.add(g); const cols = [0xff6a4d, 0xffc23a, 0x2f9e5d, 0x0e9aa0, 0x8a6fd1];
  const pg = geo('conf', () => new T.PlaneGeometry(.09, .14));
  const ps = []; for (let i = 0; i < 46; i++) { const m = new T.Mesh(pg, M(cols[i % 5], { side: T.DoubleSide })); m.position.copy(camTgt).add(new V3((Math.random() - .5) * 3, 1.6 + Math.random() * 1.2, (Math.random() - .5) * 2)); m.userData.v = new V3((Math.random() - .5) * 2, 1 + Math.random() * 2, (Math.random() - .5) * 2); g.add(m); ps.push(m); }
  const t0 = performance.now();
  (function paso() { const t = (performance.now() - t0) / 1000; if (t > 2 || !g.parent) { liberar(g); return; } ps.forEach(m => { m.userData.v.y -= .06; m.position.addScaledVector(m.userData.v, .016); m.rotation.x += .2; m.rotation.y += .13; }); requestAnimationFrame(paso); })();
}

/* ---------- entrada ---------- */
const ray = new T.Raycaster(), ndc = new T.Vector2();
function setRay(e) { const r = rd.domElement.getBoundingClientRect(); ndc.set((e.clientX - r.left) / r.width * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1); ray.setFromCamera(ndc, cam); return ray; }
let pd = null;
const cv = rd.domElement;
cv.addEventListener('pointerdown', e => { pd = { x: e.clientX, y: e.clientY, lx: e.clientX, ly: e.clientY, t: performance.now(), drag: false }; try { cv.setPointerCapture(e.pointerId); } catch (er) { /* nada */ } });
cv.addEventListener('pointermove', e => {
  if (!pd) return; const dx = e.clientX - pd.lx, dy = e.clientY - pd.ly;
  if (!pd.drag && Math.hypot(e.clientX - pd.x, e.clientY - pd.y) > 9) pd.drag = true;
  if (pd.drag && modo && modo.arrastre) modo.arrastre(dx, dy);
  pd.lx = e.clientX; pd.ly = e.clientY;
});
cv.addEventListener('pointerup', e => {
  if (!pd) return; const p = pd; pd = null;
  if (!p.drag) {
    setRay(e);
    if (pantalla === 'hub') { const h = ray.intersectObjects(mesas)[0]; if (h) entrarEstacion(h.object.userData.est); return; }
    if (modo && modo.toque && !ui.velo.classList.contains('ver')) modo.toque(ray);
  } else if (modo && modo.desliz) { setRay(e); modo.desliz(e.clientX - p.x, e.clientY - p.y, p); }
});
cv.addEventListener('pointercancel', () => { pd = null; });
addEventListener('keydown', e => {
  if (e.key === 'Escape') { if (ui.velo.classList.contains('ver')) return; if (pantalla === 'estacion') irHub(); }
  if (modo && modo.arrastre && /^Arrow/.test(e.key)) { const s = 18; modo.arrastre(e.key === 'ArrowLeft' ? -s : e.key === 'ArrowRight' ? s : 0, e.key === 'ArrowUp' ? -s : e.key === 'ArrowDown' ? s : 0); }
});

/* =====================================================================
   ESTACIÓN 1 — FRACCIONES
   ===================================================================== */
const PEP = [[.3, .55], [1.2, .78], [2.1, .5], [2.95, .8], [3.8, .55], [4.65, .8], [5.45, .52], [.75, .24], [3.4, .22], [5.95, .82], [2.55, .84], [4.2, .3], [1.6, .4]];
const ALB = [[.6, .82], [1.75, .62], [2.75, .38], [4.25, .66], [5.1, .3], [5.8, .6], [3.25, .62], [1.05, .5]];
function sector(r, a0, len, h, segs) {
  const s = new T.Shape(); s.moveTo(0, 0); s.absarc(0, 0, r, a0, a0 + len, false); s.lineTo(0, 0);
  const g = new T.ExtrudeGeometry(s, { depth: h, bevelEnabled: false, curveSegments: segs }); g.rotateX(-PI / 2); return g;
}
function adornos(lista, i, len, R, rad, poner) {
  lista.forEach(([ang, rf]) => {
    if (Math.floor(ang / len) !== i) return;
    const rr = rf * R; if (len * rr < 2 * (rad + .03) && len < 2 * PI - .01) return;
    let la = ang - i * len;
    if (len < 2 * PI - .01) { const m = Math.asin(Math.min(1, (rad + .03) / rr)); la = clamp(la, m, len - m); }
    const a = i * len + la; poner(rr * Math.cos(a), -rr * Math.sin(a), a);
  });
}
// Hace una comida cortada en n partes. Cada pieza es un grupo con userData.off(gap) = desplazamiento desde el centro.
function hacerComida(forma, n) {
  const grupo = new T.Group(), piezas = [];
  if (forma === 'chocolate') {
    const W = 2.3, Dp = 1.05, w = W / n;
    for (let i = 0; i < n; i++) {
      const p = new T.Group(); const x = -W / 2 + w * (i + .5);
      p.add(caja(w - .004, .16, Dp, 0x6b3a22, 0, .08, 0), caja(Math.max(.04, w - .08), .05, Dp - .1, 0x8a5232, 0, .185, 0));
      for (let j = 0; j < 3; j++) { const lx = -W / 2 + (j + 1) * W / 4 - x; if (Math.abs(lx) < w / 2 - .04) p.add(caja(.025, .01, Dp - .14, 0x5a2f1a, lx, .215, 0)); }
      p.add(caja(Math.max(.04, w - .1), .01, .025, 0x5a2f1a, 0, .215, 0));
      p.userData = { i, off: g => new V3(x + (i - (n - 1) / 2) * g * .9, 0, 0) };
      piezas.push(p); grupo.add(p);
    }
    return { grupo, piezas, alto: .22 };
  }
  const len = 2 * PI / n, segs = Math.max(2, Math.round(40 / n));
  for (let i = 0; i < n; i++) {
    const p = new T.Group(), a0 = i * len, m = a0 + len / 2;
    if (forma === 'pizza') {
      p.add(malla(sector(1.2, a0, len, .12, segs), M(0xd9984a)));
      const q = malla(sector(1.06, a0, len, .05, segs), M(0xffcf4d)); q.position.y = .1; p.add(q);
      adornos(PEP, i, len, 1.06, .12, (x, z) => p.add(malla(geo('pep', () => new T.CylinderGeometry(.12, .12, .03, 10)), M(0xc63d2f), x, .165, z)));
      adornos(ALB, i, len, 1.06, .07, (x, z, a) => { const h = malla(geo('hoja', () => new T.BoxGeometry(.16, .025, .08)), M(0x2f9e5d), x, .16, z); h.rotation.y = a * 3; p.add(h); });
    } else {
      [[0, .2, 0xf5c77e], [.2, .05, 0xfff4dc], [.25, .2, 0xf5c77e], [.45, .08, 0xff8fab]].forEach(([y, h, c]) => { const s = malla(sector(1.15, a0, len, h, segs), M(c)); s.position.y = y; p.add(s); });
      const cer = []; for (let k = 0; k < 8; k++) cer.push([.39 + k * PI / 4, .78]);
      adornos(cer, i, len, 1.15, .09, (x, z) => { p.add(malla(geo('crema', () => new T.SphereGeometry(.12, 8, 5)), M(0xfffdf7), x, .55, z), malla(geo('cer', () => new T.SphereGeometry(.085, 8, 6)), M(0xd7263d), x, .66, z)); });
    }
    const dir = new V3(Math.cos(m), 0, -Math.sin(m));
    p.userData = { i, off: g => dir.clone().multiplyScalar(n === 1 ? 0 : g) };
    piezas.push(p); grupo.add(p);
  }
  return { grupo, piezas, alto: forma === 'pizza' ? .17 : .53 };
}
function plato(r = 1.4) {
  const g = new T.Group();
  g.add(cil(r, r * .85, .08, 28, 0xfffdf7, 0, .04, 0));
  const aro = malla(new T.TorusGeometry(r - .04, .045, 6, 32), M(0x9fdce3), 0, .08, 0); aro.rotation.x = PI / 2; g.add(aro);
  return g;
}
function cuchillo() {
  const g = new T.Group();
  g.add(caja(1.45, .04, .26, M(0xdfe6ee, { metalness: .5, roughness: .3 }), .62, 0, 0), caja(.6, .11, .16, 0x8a4b2a, -.4, 0, 0), caja(.06, .14, .3, 0x5a3420, -.08, 0, 0));
  g.traverse(o => { o.castShadow = true; }); return g;
}

function modoFracciones(nv, g0) {
  const g = new T.Group(); est.fracciones.add(g);
  const m = { g, info: () => ({ tipo: nv.tipo }) };
  const vivo = () => g0 === G;
  const forma = nv.forma || 'pizza', nombreC = (D.comidas && D.comidas[forma]) || forma;
  let errores = 0;

  if (nv.tipo === 'comparar') {
    const lados = [['A', nv.a, -1.6], ['B', nv.b, 1.6]];
    const grupos = lados.map(([L, f, x]) => {
      const c = new T.Group(); c.position.x = x; g.add(c); c.add(plato(1.42));
      const co = hacerComida(forma, f[1]);
      co.piezas.forEach((p, i) => {
        p.position.copy(p.userData.off(.04)); p.position.y = .08;
        if (i >= f[0]) p.traverse(o => { if (o.isMesh) { o.material = M(o.material.color.getHex(), { transparent: true, opacity: .2, depthWrite: false }); o.castShadow = false; } });
      });
      c.add(co.grupo);
      const s = etiqueta(L + ' · ' + fracTxt(f[0], f[1]), .42); s.position.set(0, 1.25, -.6); c.add(s);
      c.userData.L = L; co.grupo.traverse(o => { o.userData.lado = L; });
      return c;
    });
    const ubicarC = () => grupos.forEach((c, i) => { if (cam.aspect < .9) c.position.set(0, 0, i ? 1.5 : -1.5); else c.position.set(i ? 1.6 : -1.6, 0, 0); });
    ubicarC(); m.resize = ubicarC;
    m.vista = () => ({ t: new V3(EST_X.fracciones, TOP + .25, .1), rx: 3.3, ry: 1.75, rxv: 1.7, ryv: 2.9, el: 52, sombra: 5 });
    setReto(`${nv.texto || ''}<small>Toca el plato con más, o «Iguales».</small>`);
    setControles(`<div class="fila"><button class="btn sec" data-a="A">Plato A</button><button class="btn" data-a="=">Iguales</button><button class="btn sec" data-a="B">Plato B</button></div>`);
    irVista(m.vista());
    const resp = () => { const x = nv.a[0] * nv.b[1], y = nv.b[0] * nv.a[1]; return x > y ? 'A' : x < y ? 'B' : '='; };
    m.accion = a => {
      if (m.terminado) return;
      const ok = resp();
      if (a === ok) {
        const exp = ok === '=' ? `${frac(nv.a[0], nv.a[1])} y ${frac(nv.b[0], nv.b[1])} son iguales: son fracciones equivalentes.` : `${frac(...(ok === 'A' ? nv.a : nv.b))} es más que ${frac(...(ok === 'A' ? nv.b : nv.a))}.`;
        grupos.forEach(c => { if (ok === '=' || c.userData.L === ok) { const y0 = c.position.y; anim(.5, k => { c.position.y = y0 + Math.sin(k * PI) * .35; }); } });
        ganar(Math.max(1, 3 - errores), exp);
      } else {
        errores++;
        toast(a === '=' ? 'No son iguales. Mira cuánto le falta a cada plato para estar lleno.' : 'Mira otra vez: ¿a cuál plato le falta menos para estar lleno?', 'mal');
      }
    };
    m.toque = r => { const h = r.intersectObjects(g.children, true).find(h => h.object.userData.lado); if (h) m.accion(h.object.userData.lado); };
    return m;
  }

  // --- servir ---
  const [pa, pb] = nv.pide, libre = !nv.partes;
  let n = nv.partes || 1, nSel = 2, cortada = !libre, ocupado = false, comida = null, guias = null;
  const tablaG = new T.Group(), platoG = plato(1.42); g.add(tablaG, platoG);
  if (forma === 'chocolate') { tablaG.add(caja(2.9, .12, 1.7, 0xd9a066, 0, .06, 0)); tablaG.add(caja(.5, .1, .3, 0xd9a066, 1.6, .05, 0)); }
  else { tablaG.add(cil(1.52, 1.52, .12, 28, 0xd9a066, 0, .06, 0)); const anillo = malla(new T.TorusGeometry(1.35, .02, 4, 36), M(0xb57a42), 0, .121, 0); anillo.rotation.x = PI / 2; tablaG.add(anillo); }
  const cuch = cuchillo(); g.add(cuch);
  const vert = () => cam.aspect < .9;
  function ubicar() {
    if (vert()) { tablaG.position.set(0, 0, -1.5); platoG.position.set(0, 0, 1.6); }
    else { tablaG.position.set(-1.65, 0, 0); platoG.position.set(1.75, 0, .1); }
    if (comida) comida.piezas.forEach(p => { if (!p.userData.anim) p.position.copy(sitio(p)); });
    cuch.position.copy(tablaG.position).add(new V3(forma === 'chocolate' ? 0 : .1, .95, forma === 'chocolate' ? -.75 : 0));
    cuch.rotation.set(0, forma === 'chocolate' ? -PI / 2 : .35, .25);
    cuch.visible = libre && !cortada;
    if (guias) guias.position.copy(tablaG.position);
  }
  function sitio(p) { const base = p.userData.servida ? platoG.position.clone().setY(.08) : tablaG.position.clone().setY(.12); return base.add(p.userData.off(n === 1 ? 0 : p.userData.servida ? .03 : .08)); }
  function ponerComida(nn) {
    if (comida) liberar(comida.grupo);
    n = nn; comida = hacerComida(forma, n); g.add(comida.grupo);
    comida.piezas.forEach(p => { p.userData.servida = false; p.position.copy(sitio(p)); p.traverse(o => { o.userData.pieza = p; }); });
  }
  function ponerGuias() {
    if (guias) liberar(guias); guias = null;
    if (cortada) return;
    guias = new T.Group(); g.add(guias); guias.position.copy(tablaG.position);
    const mat = M(0xff6a4d, { emissive: 0xff6a4d, emissiveIntensity: .35 });
    if (forma === 'chocolate') { for (let i = 1; i < nSel; i++) guias.add(caja(.035, .02, 1.25, mat, -1.15 + 2.3 * i / nSel, .245, 0)); }
    else { const y = comida.alto + .13; for (let i = 0; i < nSel; i++) { const a = i * 2 * PI / nSel, b = caja(1.2, .02, .04, mat, .6 * Math.cos(a), y, -.6 * Math.sin(a)); b.rotation.y = a; guias.add(b); } }
    guias.traverse(o => { o.castShadow = false; });
  }
  const servidas = () => comida.piezas.filter(p => p.userData.servida).length;
  function pintar() {
    const vars = { pide: frac(pa, pb), a: pa, b: pb };
    setReto(plantilla(nv.texto, vars) + (libre && !cortada ? `<small>Elige las partes y desliza hacia abajo sobre la ${nombreC} para cortar.</small>` : `<small>Toca los pedazos para pasarlos al plato.</small>`));
    if (libre && !cortada) setControles(`<div class="step"><em>Partes</em><button data-a="menos" aria-label="Menos partes" ${nSel <= 2 ? 'disabled' : ''}>−</button><span>${nSel}</span><button data-a="mas" aria-label="Más partes" ${nSel >= 12 ? 'disabled' : ''}>+</button></div><button class="btn pri" data-a="cortar">Cortar</button>`);
    else setControles(`<div class="info">En el plato: ${frac(servidas(), n)}</div>${libre ? '<button class="btn" data-a="otra">Volver a cortar</button>' : '<button class="btn" data-a="devolver">Devolver todo</button>'}<button class="btn pri" data-a="servir">Servir</button>`);
  }
  function infoPlato() { const el = ui.ctl.querySelector('.info'); if (el) el.innerHTML = `En el plato: ${frac(servidas(), n)}`; }
  async function cortar() {
    if (ocupado || cortada) return; ocupado = true;
    const k = nSel; if (guias) { liberar(guias); guias = null; }
    const c0 = tablaG.position;
    const lineas = forma === 'chocolate' ? Array.from({ length: k - 1 }, (_, i) => -1.15 + 2.3 * (i + 1) / k) : Array.from({ length: k }, (_, i) => i * 2 * PI / k);
    const alto = comida.alto + .13;
    for (const L of lineas) {
      if (!vivo()) return;
      if (forma === 'chocolate') { cuch.position.set(c0.x + L, .9, c0.z - .72); cuch.rotation.set(0, -PI / 2, 0); }
      else { cuch.position.set(c0.x, .9, c0.z); cuch.rotation.set(0, L, 0); }
      await anim(.13, q => { cuch.position.y = .9 - (.9 - alto) * easeO(q); });
      await anim(.1, q => { cuch.position.y = alto + (.9 - alto) * q; });
    }
    if (!vivo()) return;
    cuch.visible = false; cortada = true;
    ponerComida(k);
    comida.piezas.forEach(p => { p.userData.anim = true; const a = p.position.clone(); const b0 = tablaG.position.clone().setY(.12); p.position.copy(b0.add(p.userData.off(0))); const s = p.position.clone(); anim(.35, q => p.position.lerpVectors(s, a, easeO(q))).then(() => { p.userData.anim = false; }); });
    ocupado = false; pintar();
  }
  async function mover(p) {
    if (ocupado) return;
    p.userData.servida = !p.userData.servida; p.userData.anim = true;
    const a = p.position.clone(), b = sitio(p);
    infoPlato();
    await anim(.36, q => { p.position.lerpVectors(a, b, easeIO(q)); p.position.y += Math.sin(q * PI) * .7; });
    p.userData.anim = false;
  }
  m.accion = a => {
    if (m.terminado) return;
    if (a === 'menos' || a === 'mas') { nSel = clamp(nSel + (a === 'mas' ? 1 : -1), 2, 12); ponerGuias(); pintar(); }
    else if (a === 'cortar') cortar();
    else if (a === 'otra') { if (ocupado) return; cortada = false; ponerComida(1); ponerGuias(); ubicar(); pintar(); }
    else if (a === 'devolver') comida.piezas.forEach(p => { if (p.userData.servida) mover(p); });
    else if (a === 'servir') {
      const s = servidas();
      if (!s) { toast('Primero toca los pedazos para pasarlos al plato.'); return; }
      if (s * pb === pa * n) {
        const eq = n !== pb ? ` ${frac(s, n)} es lo mismo que ${frac(pa, pb)}.` : '';
        const y0 = platoG.position.y; anim(.5, k => { platoG.position.y = y0 + Math.sin(k * PI) * .15; });
        ganar(Math.max(1, 3 - errores), `Serviste ${frac(s, n)}.${eq}`);
        return;
      }
      errores++;
      if ((pa * n) % pb !== 0) toast(`Con ${n} pedazos iguales no se puede servir ${frac(pa, pb)}. ${libre ? 'Vuelve a cortar.' : ''}`, 'mal');
      else if (s * pb > pa * n) toast(`Serviste ${frac(s, n)}: te pasaste. Devuelve algunos pedazos.`, 'mal');
      else toast(`Serviste ${frac(s, n)}: te faltan pedazos.`, 'mal');
    }
  };
  m.toque = r => {
    if (m.terminado || !comida) return;
    const h = r.intersectObjects(comida.grupo.children, true)[0];
    if (!h) return;
    if (!cortada) { toast(libre ? 'Primero córtala: desliza hacia abajo o toca Cortar.' : ''); return; }
    mover(h.object.userData.pieza);
  };
  m.desliz = (dx, dy) => { if (libre && !cortada && dy > 40 && Math.abs(dy) > Math.abs(dx) * .8) cortar(); };
  m.resize = ubicar;
  m.vista = () => ({ t: new V3(EST_X.fracciones, TOP + .2, .05), rx: 3.45, ry: 1.8, rxv: 1.75, ryv: 2.85, el: 54, sombra: 5 });
  ponerComida(n); cortada = !libre;
  ubicar(); ponerGuias(); pintar(); irVista(m.vista());
  m.fin = () => { cuch.visible = false; };
  m.resolver = () => { // para pruebas: deja servida la fracción correcta
    if (libre) { nSel = pb; cortada = false; ponerComida(1); m.accion('cortar'); }
    return new Promise(res => setTimeout(() => { const need = pa * n / pb; comida.piezas.forEach((p, i) => { if (i < need && !p.userData.servida) mover(p); }); setTimeout(() => { m.accion('servir'); res(); }, 500); }, libre ? 1400 + pb * 260 : 50));
  };
  return m;
}

/* =====================================================================
   ESTACIÓN 2 — SÓLIDOS Y REDES
   ===================================================================== */
const COLOR_S = { cubo: 0x0e9aa0, prisma: 0x2f9e5d, prisma3: 0xffb020, piramide4: 0xff6a4d, piramide3: 0x8a6fd1, cilindro: 0x3d8fd9 };
const centro2 = P => P.reduce((s, q) => [s[0] + q[0] / P.length, s[1] + q[1] / P.length], [0, 0]);
function redCuadricula(filas, s) {
  const cel = []; filas.forEach((f, r) => [...f].forEach((ch, c) => { if (ch === '#') cel.push([c, r]); }));
  const key = (c, r) => c + ',' + r, idx = {}; cel.forEach((p, i) => { idx[key(p[0], p[1])] = i; });
  const vec = (c, r) => [[c + 1, r], [c - 1, r], [c, r + 1], [c, r - 1]].filter(q => idx[key(q[0], q[1])] !== undefined);
  let base = 0, mv = -1; cel.forEach((p, i) => { const k = vec(p[0], p[1]).length; if (k > mv) { mv = k; base = i; } });
  const caras = cel.map(([c, r]) => ({ poly: [[c * s, r * s], [(c + 1) * s, r * s], [(c + 1) * s, (r + 1) * s], [c * s, (r + 1) * s]] }));
  const orden = [base], visto = { [base]: 1 };
  for (let q = 0; q < orden.length; q++) {
    const i = orden[q], [c, r] = cel[i];
    for (const [c2, r2] of vec(c, r)) {
      const j = idx[key(c2, r2)]; if (visto[j]) continue; visto[j] = 1; orden.push(j);
      caras[j].p = i;
      caras[j].h = c2 > c ? [[(c + 1) * s, r * s], [(c + 1) * s, (r + 1) * s]] : c2 < c ? [[c * s, r * s], [c * s, (r + 1) * s]] : r2 > r ? [[c * s, (r + 1) * s], [(c + 1) * s, (r + 1) * s]] : [[c * s, r * s], [(c + 1) * s, r * s]];
    }
  }
  const mapa = {}; orden.forEach((i, k) => { mapa[i] = k; });
  return orden.map(i => ({ poly: caras[i].poly, p: caras[i].p === undefined ? undefined : mapa[caras[i].p], h: caras[i].h }));
}
function redCaras(spec) {
  const k = spec.solido, R2 = Math.sqrt(3) / 2;
  if (k === 'cubo') return redCuadricula(spec.red || ['.#..', '####', '.#..'], 1.05);
  if (k === 'prisma') { const L = 1.5, W = 1, H = .8; return [{ poly: [[0, 0], [L, 0], [L, W], [0, W]] }, { poly: [[0, W], [L, W], [L, W + H], [0, W + H]], p: 0, h: [[0, W], [L, W]] }, { poly: [[0, W + H], [L, W + H], [L, 2 * W + H], [0, 2 * W + H]], p: 1, h: [[0, W + H], [L, W + H]] }, { poly: [[0, -H], [L, -H], [L, 0], [0, 0]], p: 0, h: [[0, 0], [L, 0]] }, { poly: [[-H, 0], [0, 0], [0, W], [-H, W]], p: 0, h: [[0, 0], [0, W]] }, { poly: [[L, 0], [L + H, 0], [L + H, W], [L, W]], p: 0, h: [[L, 0], [L, W]] }]; }
  if (k === 'prisma3') { const L = 1.6, w = 1.1, a = 2 * PI / 3; return [{ poly: [[0, 0], [L, 0], [L, w], [0, w]] }, { poly: [[0, w], [L, w], [L, 2 * w], [0, 2 * w]], p: 0, h: [[0, w], [L, w]], ang: a }, { poly: [[0, 2 * w], [L, 2 * w], [L, 3 * w], [0, 3 * w]], p: 1, h: [[0, 2 * w], [L, 2 * w]], ang: a }, { poly: [[0, 0], [0, w], [-w * R2, w / 2]], p: 0, h: [[0, 0], [0, w]] }, { poly: [[L, 0], [L + w * R2, w / 2], [L, w]], p: 0, h: [[L, 0], [L, w]] }]; }
  if (k === 'piramide4') { const s = 1.3, h = 1.2, l = Math.hypot(h, s / 2), a = PI - Math.atan2(h, s / 2); return [{ poly: [[0, 0], [s, 0], [s, s], [0, s]] }, { poly: [[0, s], [s, s], [s / 2, s + l]], p: 0, h: [[0, s], [s, s]], ang: a }, { poly: [[0, 0], [s / 2, -l], [s, 0]], p: 0, h: [[0, 0], [s, 0]], ang: a }, { poly: [[0, 0], [0, s], [-l, s / 2]], p: 0, h: [[0, 0], [0, s]], ang: a }, { poly: [[s, 0], [s + l, s / 2], [s, s]], p: 0, h: [[s, 0], [s, s]], ang: a }]; }
  const s = 1.5, A = [0, 0], B = [s, 0], C = [s / 2, s * R2], a = PI - Math.acos(1 / 3), ref = (p, q, o) => [p[0] + q[0] - o[0], p[1] + q[1] - o[1]];
  return [{ poly: [A, B, C] }, { poly: [A, B, ref(A, B, C)], p: 0, h: [A, B], ang: a }, { poly: [B, C, ref(B, C, A)], p: 0, h: [B, C], ang: a }, { poly: [C, A, ref(C, A, B)], p: 0, h: [C, A], ang: a }];
}
function matCara(col) { const m = new T.MeshStandardMaterial({ color: col, flatShading: true, side: T.DoubleSide, roughness: .7, polygonOffset: true, polygonOffsetFactor: 1, polygonOffsetUnits: 1 }); return m; }
function poliedro(caras, color) {
  const root = new T.Group(), hold = new T.Group(); root.add(hold);
  const piv = [], mallas = [], anc = [], prof = []; let maxD = 1;
  caras.forEach((f, i) => {
    const p = new T.Group(), raiz = f.p === undefined, a = raiz ? [0, 0] : f.h[0];
    anc[i] = a; prof[i] = raiz ? 0 : prof[f.p] + 1; maxD = Math.max(maxD, prof[i]);
    if (raiz) hold.add(p);
    else {
      piv[f.p].add(p); const pa = anc[f.p]; p.position.set(a[0] - pa[0], 0, a[1] - pa[1]);
      const b = f.h[1], u = new V3(b[0] - a[0], 0, b[1] - a[1]).normalize(), c = centro2(f.poly), w = new V3(c[0] - a[0], 0, c[1] - a[1]);
      if (new V3().crossVectors(u, w).y < 0) u.negate();
      p.userData = { eje: u, ang: f.ang || PI / 2, d: prof[i] };
    }
    const sh = new T.Shape(f.poly.map(q => new T.Vector2(q[0] - a[0], -(q[1] - a[1]))));
    const g = new T.ShapeGeometry(sh); g.rotateX(-PI / 2);
    const col = new T.Color(color).offsetHSL(0, 0, i % 2 ? .07 : -.02);
    const m = new T.Mesh(g, matCara(col)); m.castShadow = true; m.receiveShadow = true;
    m.userData = { cara: i, base: col.getHex(), propia: true, c: (() => { const c = centro2(f.poly); return new V3(c[0] - a[0], 0, c[1] - a[1]); })() };
    const pts = []; f.poly.forEach((q, k) => { const r = f.poly[(k + 1) % f.poly.length]; pts.push(q[0] - a[0], 0, q[1] - a[1], r[0] - a[0], 0, r[1] - a[1]); });
    const lg = new T.BufferGeometry(); lg.setAttribute('position', new T.Float32BufferAttribute(pts, 3)); m.add(new T.LineSegments(lg, LINEA));
    p.add(m); piv[i] = p; mallas[i] = m;
  });
  const S = { root, hold, caras: mallas, fold: 1 };
  S.setFold = t => {
    S.fold = t; const span = 1 + .4 * (maxD - 1);
    piv.forEach(p => { const e = p.userData.eje; if (!e) return; const k = clamp(t * span - .4 * (p.userData.d - 1), 0, 1); p.quaternion.setFromAxisAngle(e, p.userData.ang * easeIO(k)); });
  };
  S.setFold(1); root.updateMatrixWorld(true);
  const inv = new T.Matrix4().copy(hold.matrixWorld).invert();
  const vk = {}, verts = [], ek = {}, aristas = [], centros = [];
  const key = v => [v.x, v.y, v.z].map(n => Math.round(n * 40)).join(',');
  caras.forEach((f, i) => {
    const M4 = new T.Matrix4().multiplyMatrices(inv, mallas[i].matrixWorld), a = anc[i];
    const ps = f.poly.map(q => new V3(q[0] - a[0], 0, q[1] - a[1]).applyMatrix4(M4));
    const c = new V3(); ps.forEach(v => c.add(v)); c.multiplyScalar(1 / ps.length); centros.push(c);
    ps.forEach((v, k) => { const kv = key(v); if (!(kv in vk)) { vk[kv] = verts.length; verts.push(v); } const w = ps[(k + 1) % ps.length], ke = [kv, key(w)].sort().join('|'); if (!ek[ke]) { ek[ke] = 1; aristas.push([v.clone(), w.clone()]); } });
  });
  const ck = {}; centros.forEach(c => { ck[key(c)] = 1; });
  S.valido = Object.keys(ck).length === caras.length;
  const bb = new T.Box3(); verts.forEach(v => bb.expandByPoint(v)); const cen = bb.getCenter(new V3());
  hold.position.set(-cen.x, -cen.y, -cen.z);
  S.alto = bb.max.y - bb.min.y; S.verts = verts; S.aristas = aristas; S.centro = cen;
  S.flat = caras.map((f, i) => ({ poly: f.poly, color: mallas[i].userData.base }));
  return S;
}
function cilindro(color) {
  const r = .62, Hh = 1.5, W = 2 * PI * r, N = 36;
  const root = new T.Group(), hold = new T.Group(); root.add(hold);
  const g = new T.PlaneGeometry(W, Hh, N, 1); g.rotateX(-PI / 2); g.translate(0, 0, Hh / 2);
  const base = Float32Array.from(g.attributes.position.array);
  const col = new T.Color(color), col2 = col.clone().offsetHSL(0, 0, .08);
  const tira = new T.Mesh(g, matCara(col)); tira.castShadow = true; tira.userData = { cara: 0, base: col.getHex(), propia: true, c: new V3(0, 0, Hh / 2) }; hold.add(tira);
  const lineas = [0, Hh].map(z => { const lg = new T.BufferGeometry(); lg.setAttribute('position', new T.Float32BufferAttribute(new Float32Array((N + 1) * 3), 3)); const l = new T.Line(lg, LINEA); l.userData.z = z; hold.add(l); return l; });
  const bend = (s, t) => { if (t < 1e-3) return [s, 0]; const R = r / t; return [R * Math.sin(s / R), R * (1 - Math.cos(s / R))]; };
  const disco = (z0, dir, i) => {
    const p = new T.Group(); p.position.set(0, 0, z0); const cg = new T.CircleGeometry(r, 28); cg.rotateX(-PI / 2);
    const m = new T.Mesh(cg, matCara(col2)); m.position.z = dir * r; m.castShadow = true; m.userData = { cara: i, base: col2.getHex(), propia: true, c: new V3(0, 0, 0) };
    const pts = []; for (let k = 0; k <= 28; k++) { const a = k / 28 * 2 * PI; pts.push(r * Math.cos(a), 0, r * Math.sin(a)); }
    const lg = new T.BufferGeometry(); lg.setAttribute('position', new T.Float32BufferAttribute(pts, 3)); m.add(new T.Line(lg, LINEA));
    p.add(m); hold.add(p); return { p, m };
  };
  const d1 = disco(0, -1, 1), d2 = disco(Hh, 1, 2);
  const S = { root, hold, caras: [tira, d1.m, d2.m], fold: 1, verts: [], aristas: [], valido: true, alto: 2 * r };
  S.setFold = t => {
    S.fold = t; const te = easeIO(clamp(t / .6, 0, 1)), pos = g.attributes.position;
    for (let i = 0; i < pos.count; i++) { const [x, y] = bend(base[i * 3], te); pos.setXYZ(i, x, y, base[i * 3 + 2]); }
    pos.needsUpdate = true; g.computeBoundingSphere();
    lineas.forEach(l => { const a = l.geometry.attributes.position; for (let k = 0; k <= N; k++) { const [x, y] = bend(-W / 2 + W * k / N, te); a.setXYZ(k, x, y, l.userData.z); } a.needsUpdate = true; l.geometry.computeBoundingSphere(); });
    const kd = easeIO(clamp((t - .55) / .45, 0, 1)); d1.p.rotation.x = PI / 2 * kd; d2.p.rotation.x = -PI / 2 * kd;
  };
  S.setFold(1); hold.position.set(0, -r, -Hh / 2);
  const circ = (cx, cz) => Array.from({ length: 24 }, (_, k) => [cx + r * Math.cos(k / 24 * 2 * PI), cz + r * Math.sin(k / 24 * 2 * PI)]);
  S.flat = [{ poly: [[-W / 2, 0], [W / 2, 0], [W / 2, Hh], [-W / 2, Hh]], color: col.getHex() }, { poly: circ(0, -r), color: col2.getHex() }, { poly: circ(0, Hh + r), color: col2.getHex() }];
  return S;
}
function hacerSolido(spec, color) {
  const c = color || COLOR_S[spec.solido] || 0x0e9aa0;
  const S = spec.solido === 'cilindro' ? cilindro(c) : poliedro(redCaras(spec), c);
  S.tipo = spec.solido; return S;
}
function svgRed(S) {
  let x0 = 1e9, z0 = 1e9, x1 = -1e9, z1 = -1e9;
  S.flat.forEach(f => f.poly.forEach(([x, z]) => { x0 = Math.min(x0, x); z0 = Math.min(z0, z); x1 = Math.max(x1, x); z1 = Math.max(z1, z); }));
  const pad = .15, hex = c => '#' + c.toString(16).padStart(6, '0');
  return `<svg viewBox="${(x0 - pad).toFixed(2)} ${(z0 - pad).toFixed(2)} ${(x1 - x0 + 2 * pad).toFixed(2)} ${(z1 - z0 + 2 * pad).toFixed(2)}" aria-hidden="true">${S.flat.map(f => `<polygon points="${f.poly.map(q => q[0].toFixed(3) + ',' + q[1].toFixed(3)).join(' ')}" fill="${hex(f.color)}" stroke="#15304d" stroke-width="2" vector-effect="non-scaling-stroke" stroke-linejoin="round"/>`).join('')}</svg>`;
}

function modoSolidos(nv, g0) {
  const g = new T.Group(); est.solidos.add(g);
  const m = { g, info: () => ({ tipo: nv.tipo, fold: S && S.fold, marcadas: marcadas.length, total }) };
  const vivo = () => g0 === G;
  const nombre = (D.nombres && D.nombres[nv.solido]) || nv.solido;
  const FLOTA = .7;
  let S = null, errores = 0, giro = { x: .38, y: .55 }, tocando = 0, auto = true, ocupado = false;
  const marcadas = []; let total = 0, marcas = null;
  function montar(nuevo) {
    if (S) liberar(S.root);
    S = nuevo; g.add(S.root); S.root.position.set(0, FLOTA + S.alto / 2, 0);
    S.root.rotation.set(giro.x, giro.y, 0);
  }
  const vistaS = abierta => abierta ? { t: new V3(EST_X.solidos, TOP + FLOTA + 1.25, .2), rx: 2.35, ry: 2.05, el: 24, sombra: 5 } : { t: new V3(EST_X.solidos, TOP + FLOTA + .55, .2), rx: 1.35, ry: 1.3, el: 24, sombra: 4 };
  m.vista = () => vistaS(S && S.fold < .5);
  m.arrastre = (dx, dy) => { if (!S) return; auto = false; tocando = 2; giro.y += dx * .012; giro.x = clamp(giro.x + dy * .01, -1.2, 1.3); };
  m.update = (dt, t) => {
    if (!S) return;
    if (tocando > 0) tocando -= dt;
    if (auto && tocando <= 0 && nv.tipo === 'red' && !ocupado) giro.y += dt * .35;
    S.root.rotation.set(giro.x, giro.y, 0);
    S.root.position.y = FLOTA + S.alto / 2 + (1 - S.fold) * .85 + Math.sin(t * 1.6) * .04;
    if (marcas) marcas.visible = S.fold > .98;
    marcadas.forEach(o => { if (o.userData.num && o.userData.cara !== undefined) o.userData.num.position.y = S.fold > .5 ? -.24 : .24; });
  };
  async function plegar(to, dur = 1.3) {
    const from = S.fold, gx = giro.x, gx2 = to < .5 ? .95 : .38; ocupado = true;
    irVista(vistaS(to < .5), dur);
    await anim(dur, k => { S.setFold(from + (to - from) * k); giro.x = gx + (gx2 - gx) * easeIO(k); });
    ocupado = false;
  }

  if (nv.tipo === 'contar') {
    const que = nv.que || 'caras', palabra = (D.partes && D.partes[que]) || que;
    montar(hacerSolido({ solido: nv.solido }));
    if (que !== 'caras') {
      marcas = new T.Group(); S.hold.add(marcas);
      const c = S.centro;
      if (que === 'vertices') S.verts.forEach(v => { const vis = malla(geo('vtx', () => new T.SphereGeometry(.085, 12, 8)), new T.MeshStandardMaterial({ color: 0x15304d, roughness: .5 }), v.x, v.y, v.z); vis.userData = { propia: true, marca: true, dir: v.clone().sub(c).normalize() }; const hit = new T.Mesh(geo('vtxh', () => new T.SphereGeometry(.24, 8, 6)), INVIS); hit.userData.obj = vis; vis.add(hit); marcas.add(vis); });
      else S.aristas.forEach(([a, b]) => { const len = a.distanceTo(b), mid = a.clone().add(b).multiplyScalar(.5); const vis = malla(new T.CylinderGeometry(.045, .045, len, 6), new T.MeshStandardMaterial({ color: 0x15304d, roughness: .5 }), mid.x, mid.y, mid.z); vis.quaternion.setFromUnitVectors(new V3(0, 1, 0), b.clone().sub(a).normalize()); vis.userData = { propia: true, marca: true, dir: mid.clone().sub(c).normalize() }; const hit = new T.Mesh(new T.CylinderGeometry(.17, .17, len * .8, 6), INVIS); hit.userData.obj = vis; vis.add(hit); marcas.add(vis); });
      total = marcas.children.length;
    } else total = S.caras.length;
    const pintar = () => {
      setReto(`${plantilla(nv.texto, { solido: nombre })}<small>Arrastra para girarlo.</small>`);
      setControles(`<div class="info">Contaste <b data-cont>${marcadas.length}</b></div><button class="btn" data-a="red">${S.fold > .5 ? 'Desarmar' : 'Armar'}</button><button class="btn pri" data-a="listo">Ya las conté</button>`);
    };
    const contar = () => { const b = ui.ctl.querySelector('[data-cont]'); if (b) b.textContent = marcadas.length; };
    function marcar(o) {
      const i = marcadas.indexOf(o);
      if (i >= 0) { marcadas.splice(i, 1); o.material.color.setHex(o.userData.cara !== undefined ? o.userData.base : 0x15304d); if (o.userData.num) { liberar(o.userData.num); o.userData.num = null; } marcadas.forEach((x, k) => { if (x.userData.num) { liberar(x.userData.num); x.userData.num = null; } numerar(x, k + 1); }); }
      else { marcadas.push(o); o.material.color.setHex(o.userData.cara !== undefined ? 0xffd25e : 0xffb020); numerar(o, marcadas.length); const s0 = o.scale.clone(); anim(.25, k => o.scale.copy(s0).multiplyScalar(1 + Math.sin(k * PI) * .25)).then(() => o.scale.copy(s0)); }
      contar();
    }
    function numerar(o, k) {
      const s = etiqueta(String(k), .3);
      if (o.userData.cara !== undefined) { s.position.copy(o.userData.c); s.position.y = S.fold > .5 ? -.24 : .24; o.add(s); }
      else { const p = o.userData.dir.clone().multiplyScalar(.28); s.position.copy(p.applyQuaternion(o.quaternion.clone().invert())); o.add(s); }
      o.userData.num = s;
    }
    m.toque = r => {
      if (m.terminado || ocupado) return;
      if (que === 'caras') { const h = r.intersectObjects(S.caras, false)[0]; if (h) marcar(h.object); return; }
      if (S.fold < .98) { toast('Arma el sólido para ver sus ' + palabra + '.'); return; }
      const hs = r.intersectObjects(marcas.children, true).filter(h => h.object.userData.obj);
      if (hs.length) marcar(hs[0].object.userData.obj);
    };
    m.accion = async a => {
      if (m.terminado || ocupado) return;
      if (a === 'red') { await plegar(S.fold > .5 ? 0 : 1); if (vivo()) pintar(); }
      if (a === 'listo') {
        if (marcadas.length === total) {
          if (S.fold < .5) plegar(1);
          ganar(Math.max(1, 3 - errores), `${nombre[0].toUpperCase() + nombre.slice(1)} tiene <b>${total}</b> ${palabra}.`);
        } else { errores++; toast(`Llevas ${marcadas.length}. Todavía falta alguna: gira el sólido para buscarla.`, 'mal'); }
      }
    };
    m.resolver = () => { (que === 'caras' ? S.caras : marcas.children).forEach(o => { if (!marcadas.includes(o)) marcar(o); }); m.accion('listo'); };
    pintar(); irVista(vistaS(false));
    return m;
  }

  // --- red: ¿qué red arma este sólido? ---
  const color = COLOR_S[nv.solido];
  const opciones = (nv.opciones || []).map(o => { const T0 = hacerSolido(o, color); const ok = o.solido === nv.solido && T0.valido; const svg = svgRed(T0); liberar(T0.root); return { spec: o, ok, svg }; });
  montar(hacerSolido({ solido: nv.solido }));
  setReto(`${plantilla(nv.texto, { solido: nombre })}<small>Toca una red: la vas a ver armarse.</small>`);
  setControles(`<div class="opts">${opciones.map((o, i) => `<button class="opt" data-a="o${i}">${o.svg}Red ${i + 1}</button>`).join('')}</div>`);
  irVista(vistaS(false));
  m.accion = async a => {
    if (m.terminado || ocupado || a[0] !== 'o') return;
    const i = +a.slice(1), o = opciones[i], btn = ui.ctl.querySelector(`[data-a="o${i}"]`);
    ocupado = true; ui.ctl.querySelectorAll('.opt').forEach(b => { b.style.pointerEvents = 'none'; });
    const objetivo = S;
    S.root.visible = false;
    const P = hacerSolido(o.spec, color); g.add(P.root); P.root.position.set(0, FLOTA + P.alto / 2, 0);
    giro.x = .95; P.root.rotation.set(giro.x, giro.y, 0); P.setFold(0);
    const prev = S; S = P; irVista(vistaS(true), .5);
    await esperar(.6); if (!vivo()) return;
    irVista(vistaS(false), 1.8);
    await anim(1.8, k => { P.setFold(k); giro.x = .95 - .57 * easeIO(k); }); if (!vivo()) return;
    if (o.ok) { btn.classList.add('bien'); ocupado = false; ganar(Math.max(1, 3 - errores), `Esa red arma ${nombre}.`); return; }
    errores++; btn.classList.add('mal'); btn.disabled = true;
    const un = x => String(x).replace(/^el /, 'un ').replace(/^la /, 'una ');
    const otra = P.tipo !== nv.solido ? `Esa red arma ${un(D.nombres[P.tipo])}, no ${un(nombre)}.` : 'Esa red no cierra: hay caras que quedan una encima de otra.';
    toast(otra, 'mal');
    await esperar(1.6); if (!vivo()) return;
    liberar(P.root); S = prev; S.root.visible = true; giro.x = .38; S.root.scale.setScalar(.01);
    await anim(.4, k => S.root.scale.setScalar(Math.max(.01, easeO(k)))); if (!vivo()) return;
    ocupado = false; ui.ctl.querySelectorAll('.opt').forEach(b => { b.style.pointerEvents = ''; });
    void objetivo;
  };
  m.resolver = () => { const i = opciones.findIndex(o => o.ok); m.accion('o' + i); };
  m.opciones = () => opciones.map(o => o.ok);
  return m;
}

/* =====================================================================
   ESTACIÓN 3 — VOLUMEN
   ===================================================================== */
const U = .42;
const COL_CAPA = [0xff6a4d, 0xffc23a, 0x2f9e5d, 0x0e9aa0, 0x8a6fd1, 0x3d8fd9, 0xff8fab, 0x46b86a];
function modoVolumen(nv, g0) {
  const g = new T.Group(); est.volumen.add(g);
  const tx = D.estaciones.volumen.textos || {};
  const m = { g, info: () => ({ tipo: nv.tipo, L, W, H, puestos: puestos() }) };
  const vivo = () => g0 === G;
  let L, W, H;
  if (nv.tipo === 'altura') { [L, W] = nv.base; H = 1; } else [L, W, H] = nv.caja;
  const V = () => L * W * H;
  let cajaG = null, cubos = {}, errores = 0, ocupado = false, avisos = {}, valor = 0, carteles = new T.Group(); g.add(carteles);
  const cubosG = new T.Group(); g.add(cubosG);
  const k3 = (x, y, z) => x + ',' + y + ',' + z;
  const puestos = () => Object.keys(cubos).length;
  const pos = (x, y, z) => new V3((x + .5) * U - L * U / 2, (y + .5) * U, (z + .5) * U - W * U / 2);
  function construirCaja() {
    if (cajaG) liberar(cajaG);
    cajaG = new T.Group(); g.add(cajaG);
    const Lu = L * U, Wu = W * U, Hu = H * U;
    cajaG.add(caja(Lu + .14, .06, Wu + .14, 0xb57a42, 0, -.03, 0));
    const vid = new T.MeshStandardMaterial({ color: 0xbfeaf2, transparent: true, opacity: .2, depthWrite: false, side: T.DoubleSide, roughness: .2 });
    const pared = (w, h, x, z, ry) => { const p = new T.Mesh(new T.PlaneGeometry(w, h), vid); p.position.set(x, h / 2, z); p.rotation.y = ry; p.userData.propia = false; cajaG.add(p); };
    pared(Lu, Hu, 0, -Wu / 2, 0); pared(Lu, Hu, 0, Wu / 2, 0); pared(Wu, Hu, -Lu / 2, 0, PI / 2); pared(Wu, Hu, Lu / 2, 0, PI / 2);
    cajaG.userData.vid = vid;
    const bx = new T.LineSegments(new T.EdgesGeometry(new T.BoxGeometry(Lu, Hu, Wu)), new T.LineBasicMaterial({ color: 0x15304d })); bx.position.y = Hu / 2; cajaG.add(bx);
    const pts = [];
    for (let i = 1; i < L; i++) pts.push(-Lu / 2 + i * U, .002, -Wu / 2, -Lu / 2 + i * U, .002, Wu / 2);
    for (let j = 1; j < W; j++) pts.push(-Lu / 2, .002, -Wu / 2 + j * U, Lu / 2, .002, -Wu / 2 + j * U);
    for (let k = 1; k < H; k++) pts.push(Lu / 2 - .0, k * U, Wu / 2, Lu / 2 + .08, k * U, Wu / 2 + .08);
    for (let i = 1; i < L; i++) pts.push(-Lu / 2 + i * U, 0, Wu / 2, -Lu / 2 + i * U, -.06, Wu / 2 + .1);
    if (pts.length) { const lg = new T.BufferGeometry(); lg.setAttribute('position', new T.Float32BufferAttribute(pts, 3)); cajaG.add(new T.LineSegments(lg, LINEA)); }
    const piso = new T.Mesh(new T.PlaneGeometry(Lu, Wu), INVIS); piso.rotation.x = -PI / 2; piso.position.y = .01; piso.userData.piso = true; cajaG.add(piso); cajaG.userData.piso = piso;
    const e1 = etiqueta('largo ' + L, .22), e2 = etiqueta('ancho ' + W, .22), e3 = etiqueta('alto ' + H, .22, { bg: nv.tipo === 'altura' ? '#ffc23a' : '#fffdf7' });
    e1.position.set(0, .02, Wu / 2 + .3); e2.position.set(Lu / 2 + .55, .02, -Wu / 4); e3.position.set(-Lu / 2 - .5, Hu / 2, Wu / 2);
    cajaG.add(e1, e2, e3);
  }
  function vistaV() { const Lu = L * U, Wu = W * U, Hu = H * U, rx = .5 * Math.hypot(Lu, Wu) + .75, ry = .5 * Hu + .3 * Wu + .55; return { t: new V3(EST_X.volumen, TOP + Hu * .45 + .05, .15), rx, ry, rxv: rx * .86, ryv: ry, el: 30, az: 24, sombra: Math.max(3.5, rx + 1.5) }; }
  m.vista = vistaV;
  function siguiente() { for (let y = 0; y < H; y++) for (let z = 0; z < W; z++) for (let x = 0; x < L; x++) if (!cubos[k3(x, y, z)]) return [x, y, z]; return null; }
  function poner(x, y, z, demora = 0) {
    if (cubos[k3(x, y, z)] || y >= H) return false;
    const c = (x + z + y) % 2 ? new T.Color(COL_CAPA[y % COL_CAPA.length]).offsetHSL(0, 0, .07).getHex() : COL_CAPA[y % COL_CAPA.length];
    const mesh = malla(geo('cubito', () => new T.BoxGeometry(U * .94, U * .94, U * .94)), M(c), 0, 0, 0);
    const p = pos(x, y, z); mesh.position.copy(p); mesh.position.y += 1.4; mesh.visible = false; cubosG.add(mesh); cubos[k3(x, y, z)] = mesh;
    const go = () => { if (!vivo()) return; mesh.visible = true; anim(.34, k => { mesh.position.y = p.y + 1.4 * (1 - rebote(k)); }); };
    demora ? esperar(demora).then(go) : go();
    return true;
  }
  function vaciar() { while (cubosG.children.length) liberar(cubosG.children[0]); cubos = {}; }
  function filaLlena(y, z) { for (let x = 0; x < L; x++) if (!cubos[k3(x, y, z)]) return false; return true; }
  function capaLlena(y) { for (let z = 0; z < W; z++) if (!filaLlena(y, z)) return false; return true; }
  function revisarAvisos() {
    if (!avisos.fila) for (let y = 0; y < H && !avisos.fila; y++) for (let z = 0; z < W; z++) if (filaLlena(y, z)) { avisos.fila = 1; cartel(`fila de ${L}`, new V3(L * U / 2 + .6, (y + .5) * U + .3, (z + .5) * U - W * U / 2)); break; }
    if (!avisos.capa) for (let y = 0; y < H; y++) if (capaLlena(y)) { avisos.capa = 1; cartel(`capa: ${L} × ${W} = ${L * W}`, new V3(-L * U / 2 - .2, (y + 1) * U + .25, -W * U / 2 - .1)); break; }
    const capas = Array.from({ length: H }, (_, y) => capaLlena(y)).filter(Boolean).length;
    const el = ui.ctl.querySelector('[data-capas]'); if (el) el.textContent = `${capas} de ${H}`;
    return capas;
  }
  function cartel(txt, p, h = .3) { const s = etiqueta(txt, h, { bg: '#ffc23a' }); s.position.copy(p); carteles.add(s); s.scale.multiplyScalar(.01); const s0 = s.scale.clone().multiplyScalar(100); esperar(.3).then(() => anim(.35, k => s.scale.copy(s0).multiplyScalar(Math.max(.01, easeO(k))))); return s; }
  function formula() { cartel(`${L} × ${W} × ${H} = ${V()}`, new V3(0, H * U + .45, 0), .42); }
  function llenarTodo(maximo, paso) { let n = 0; let p; const lista = []; while ((p = siguiente()) && n < maximo) { poner(...p, n * paso); lista.push(p); n++; } return n * paso + .4; }

  if (nv.tipo === 'llenar') {
    let preguntando = false;
    const pintar = () => {
      setReto(`${tx.llenar || ''}`);
      setControles(`<div class="info">Capas llenas: <b data-capas>0 de ${H}</b></div><div class="fila"><button class="btn" data-a="uno">+1 cubito</button><button class="btn" data-a="fila">+1 fila</button><button class="btn" data-a="capa">+1 capa</button><button class="btn" data-a="vaciar">Vaciar</button></div>`);
    };
    function opcionesV() { const v = V(), set = new Set([v]); [L * W + H, L + W + H, v + L * W, v - L, L * W * (H + 1), v + W].forEach(x => { if (set.size < 3 && x > 0 && x !== v) set.add(x); }); return [...set].sort((a, b) => a - b); }
    function quizas() {
      if (preguntando || puestos() < V()) return;
      preguntando = true;
      esperar(.6).then(() => {
        if (!vivo()) return;
        setReto(tx.preguntaLlenar || '¿Cuántos cubitos caben?');
        setControles(`<div class="fila">${opcionesV().map(v => `<button class="btn sec" data-a="r${v}">${v}</button>`).join('')}</div>`);
      });
    }
    function tras() { revisarAvisos(); quizas(); }
    m.accion = a => {
      if (m.terminado) return;
      if (a === 'uno') { const p = siguiente(); if (p) poner(...p); tras(); }
      else if (a === 'fila') { const p = siguiente(); if (!p) return; let d = 0; for (let x = p[0]; x < L; x++) { poner(x, p[1], p[2], d); d += .06; } tras(); }
      else if (a === 'capa') { const p = siguiente(); if (!p) return; let d = 0; for (let z = 0; z < W; z++) for (let x = 0; x < L; x++) if (poner(x, p[1], z, d)) d += .04; tras(); }
      else if (a === 'vaciar') { vaciar(); revisarAvisos(); }
      else if (a[0] === 'r') {
        const v = +a.slice(1);
        if (v === V()) { formula(); ganar(Math.max(1, 3 - errores), `Caben <b>${V()}</b> cubitos: ${L} × ${W} × ${H} = ${V()}. Ese es el volumen de la caja.`); }
        else { errores++; toast('Cuenta otra vez: ¿cuántos hay en una capa y cuántas capas hay?', 'mal'); }
      }
    };
    m.toque = r => {
      if (m.terminado || preguntando) return;
      const hc = r.intersectObjects(cubosG.children, false)[0];
      let x, z;
      if (hc) { const p = hc.object.position; x = Math.floor((p.x + L * U / 2) / U); z = Math.floor((p.z + W * U / 2) / U); }
      else { const h = r.intersectObject(cajaG.userData.piso, false)[0]; if (!h) return; const p = g.worldToLocal(h.point.clone()); x = clamp(Math.floor((p.x + L * U / 2) / U), 0, L - 1); z = clamp(Math.floor((p.z + W * U / 2) / U), 0, W - 1); }
      let y = 0; while (cubos[k3(x, y, z)]) y++;
      if (y >= H) { toast('Esa columna ya llegó arriba.'); return; }
      poner(x, y, z); tras();
    };
    m.resolver = () => { m.accion('capa'); for (let i = 0; i < H; i++) m.accion('capa'); return esperar(1.4).then(() => m.accion('r' + V())); };
    construirCaja(); pintar(); irVista(vistaV());
    return m;
  }

  if (nv.tipo === 'predecir') {
    valor = 0;
    const pintar = () => setControles(`<div class="step"><button data-a="m10" aria-label="Menos diez">−10</button><button data-a="m1" aria-label="Menos uno">−</button><span data-v>${valor}</span><button data-a="p1" aria-label="Más uno">+</button><button data-a="p10" aria-label="Más diez">+10</button></div><button class="btn pri" data-a="ok">Comprobar</button>`);
    setReto(tx.predecir || '');
    m.accion = async a => {
      if (m.terminado || ocupado) return;
      const d = { m10: -10, m1: -1, p1: 1, p10: 10 }[a];
      if (d) { valor = clamp(valor + d, 0, 300); const s = ui.ctl.querySelector('[data-v]'); if (s) s.textContent = valor; return; }
      if (a === 'ok') {
        if (!valor) { toast('Primero escribe tu predicción con − y +.'); return; }
        ocupado = true; ui.ctl.querySelectorAll('button').forEach(b => { b.disabled = true; });
        const dur = llenarTodo(1e9, Math.min(.06, 2.4 / V()));
        await esperar(dur); if (!vivo()) return; formula();
        const dif = Math.abs(valor - V()), n = dif === 0 ? 3 : dif <= Math.max(1, Math.round(V() * .1)) ? 2 : 1;
        ganar(n, dif === 0 ? `¡Exacto! ${L} × ${W} × ${H} = ${V()}.` : `Dijiste ${valor} y caben <b>${V()}</b>: ${L} × ${W} × ${H} = ${V()}.`);
      }
    };
    m.resolver = () => { valor = V(); m.accion('ok'); };
    construirCaja(); pintar(); irVista(vistaV());
    return m;
  }

  // altura: dado el volumen y el piso, encontrar el alto
  const VOL = nv.volumen;
  H = 1;
  const pintar = () => setControles(`<div class="step"><em>Alto</em><button data-a="m" aria-label="Más bajita" ${H <= 1 ? 'disabled' : ''}>−</button><span>${H}</span><button data-a="p" aria-label="Más alta" ${H >= 9 ? 'disabled' : ''}>+</button></div><button class="btn pri" data-a="ok">Probar con ${VOL} cubitos</button>`);
  setReto(plantilla(tx.altura, { v: VOL, l: L, w: W }));
  m.accion = async a => {
    if (m.terminado || ocupado) return;
    if (a === 'm' || a === 'p') { H = clamp(H + (a === 'p' ? 1 : -1), 1, 9); vaciar(); liberar(carteles); carteles = new T.Group(); g.add(carteles); construirCaja(); pintar(); irVista(vistaV(), .5); return; }
    if (a === 'ok') {
      ocupado = true; vaciar(); ui.ctl.querySelectorAll('button').forEach(b => { b.disabled = true; });
      const cab = Math.min(VOL, V()); const dur = llenarTodo(cab, Math.min(.06, 2.2 / cab));
      await esperar(dur); if (!vivo()) return;
      if (V() === VOL) { formula(); ganar(Math.max(1, 3 - errores), `Con alto ${H}: ${L} × ${W} × ${H} = ${VOL}. ¡Justo!`); return; }
      errores++;
      if (V() < VOL) toast(`No caben: quedaron ${VOL - V()} cubitos por fuera. Hazla más alta.`, 'mal');
      else toast(`Sobra espacio: quedan ${V() - VOL} huecos. Hazla más bajita.`, 'mal');
      ocupado = false; pintar();
    }
  };
  m.resolver = () => { H = VOL / (L * W); vaciar(); construirCaja(); m.accion('ok'); };
  construirCaja(); pintar(); irVista(vistaV());
  return m;
}

/* ---------- bucle ---------- */
const reloj = new T.Clock(); let activo = true, tiempo = 0;
function resize() { rd.setSize(innerWidth, innerHeight); cam.aspect = innerWidth / innerHeight; cam.updateProjectionMatrix(); if (modo && modo.resize) modo.resize(); medirBanda(); if (modo && modo.vista) vista = modo.vista(); if (vista) irVista(vista, 0); }
addEventListener('resize', resize);
document.addEventListener('visibilitychange', () => { activo = !document.hidden; if (activo) { reloj.getDelta(); requestAnimationFrame(bucle); } });
function bucle() {
  if (!activo) return;
  requestAnimationFrame(bucle);
  const dt = Math.min(reloj.getDelta(), .05); tiempo += dt;
  tick(dt);
  if (camMov) { camMov.t += dt; const k = easeIO(Math.min(1, camMov.t / camMov.dur)); cam.position.lerpVectors(camMov.a.p, camMov.b.p, k); camTgt.lerpVectors(camMov.a.t, camMov.b.t, k); cam.lookAt(camTgt); if (k >= 1) camMov = null; }
  else if (pantalla === 'inicio') { const v = posVista(VISTA_HUB); const a = Math.sin(tiempo * .25) * .18; cam.position.set(v.p.x + Math.sin(a) * 6, v.p.y, v.p.z); camTgt.copy(v.t); cam.lookAt(camTgt); }
  if (modo && modo.update) modo.update(dt, tiempo);
  lamparas.forEach(l => { l.visible = pantalla !== 'estacion'; });
  rd.render(scene, cam);
}

/* ---------- arranque ---------- */
$('#iTitulo').textContent = D.titulo; $('#iFrase').textContent = D.frase; $('#iGrados').textContent = D.grados || '';
document.title = D.titulo;
construirTaller();
ui.hub.classList.add('oculto'); ui.hud.classList.add('oculto');
resize(); irVista(VISTA_HUB, 0); bucle();
const listo = () => { const b = $('#bJugar'); b.disabled = false; b.textContent = 'Jugar'; };
(document.fonts && document.fonts.ready ? Promise.race([document.fonts.ready, new Promise(r => setTimeout(r, 2500))]) : Promise.resolve()).then(listo);
$('#bJugar').addEventListener('click', () => { ui.inicio.classList.add('oculto'); ui.hud.classList.remove('oculto'); irHub(); });

window.__juego = {
  estado: () => ({ pantalla, estacion: estAct, nivel: nivAct, estrellas: Object.fromEntries(KEYS.map(k => [k, estrellasDe(k)])), modo: modo && modo.info && modo.info() }),
  ir: (k, i = 0) => { ui.inicio.classList.add('oculto'); ui.hud.classList.remove('oculto'); ui.hub.classList.add('oculto'); pantalla = 'estacion'; estAct = k; iniciarNivel(i); },
  saltar: () => { if (pantalla === 'estacion') ganar(3, 'Saltado.'); },
  resolver: () => modo && modo.resolver && modo.resolver(),
  hub: irHub, modo: () => modo, prog
};
})();
