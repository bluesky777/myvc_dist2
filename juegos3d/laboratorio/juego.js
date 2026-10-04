/* Laboratorio de ciencias — motor. El contenido vive en datos.js (window.DATOS_LABORATORIO). */
(function () {
'use strict';
const D = window.DATOS_LABORATORIO, $ = s => document.querySelector(s);
const EXP = {}; D.experimentos.forEach(e => { EXP[e.id] = e; });
const ORDEN = D.experimentos.map(e => e.id);
const CLAVE = 'juegos3d.laboratorio';

/* ---------- progreso ---------- */
const prog = (() => {
  try { const p = JSON.parse(localStorage.getItem(CLAVE) || '{}'); return { estrellas: p.estrellas && typeof p.estrellas === 'object' ? p.estrellas : {} }; }
  catch (e) { return { estrellas: {} }; }
})();
function guardar() { try { localStorage.setItem(CLAVE, JSON.stringify(prog)); } catch (e) { /* sin guardado, el juego sigue */ } }
const estDe = id => Math.max(0, Math.min(3, prog.estrellas[id] | 0));
const total = () => ORDEN.reduce((s, id) => s + estDe(id), 0);
const htmlEst = n => '★'.repeat(n) + '<span class="no">' + '★'.repeat(3 - n) + '</span>';

/* ---------- sonido ---------- */
let actx = null, mudo = false;
function tono(f, d, tipo, v, hasta) {
  if (mudo) return;
  try {
    actx = actx || new (window.AudioContext || window.webkitAudioContext)();
    const t = actx.currentTime, o = actx.createOscillator(), g = actx.createGain();
    o.type = tipo || 'sine'; o.frequency.setValueAtTime(f, t);
    if (hasta) o.frequency.exponentialRampToValueAtTime(hasta, t + d);
    g.gain.setValueAtTime(v || .07, t); g.gain.exponentialRampToValueAtTime(.0001, t + d);
    o.connect(g); g.connect(actx.destination); o.start(t); o.stop(t + d + .02);
  } catch (e) { /* sin audio */ }
}
const sBien = () => { tono(660, .12); setTimeout(() => tono(990, .2), 110); };
const sMal = () => tono(240, .28, 'triangle', .07, 150);
const sClic = () => tono(520, .06, 'square', .025);
const sClac = () => tono(180, .08, 'square', .04);

/* ---------- interfaz ---------- */
$('#p-titulo').textContent = D.titulo;
$('#p-frase').textContent = D.frase;
document.title = D.titulo;
function textoProgreso() { const t = total(); $('#p-progreso').textContent = t ? `Llevas ${t} de ${ORDEN.length * 3} estrellas.` : ''; }
textoProgreso();
const carga = v => { $('#carga').style.width = v + '%'; };

let toastT = 0;
function toast(txt, clase, ms) {
  const t = $('#toast'); t.textContent = txt; t.className = 'toast' + (clase ? ' ' + clase : ''); t.hidden = false;
  t.style.animation = 'none'; void t.offsetWidth; t.style.animation = '';
  clearTimeout(toastT); toastT = setTimeout(() => { t.hidden = true; }, ms || 2200);
}

function modal(o) {
  $('#mo-icono').textContent = o.icono || '';
  $('#mo-titulo').textContent = o.titulo || '';
  const tx = $('#mo-texto'); if (o.html) tx.innerHTML = o.html; else tx.textContent = o.texto || ''; tx.hidden = !(o.html || o.texto);
  const op = $('#mo-opciones'); op.innerHTML = '';
  const bs = (o.opciones || []).map((t, i) => {
    const b = document.createElement('button'); b.type = 'button'; b.textContent = t;
    b.onclick = () => o.alElegir && o.alElegir(i, bs); op.appendChild(b); return b;
  });
  const ex = $('#mo-explica'); ex.hidden = true;
  acciones(o.acciones || []);
  $('#modal').hidden = false;
  const f = $('#modal button'); if (f) setTimeout(() => f.focus({ preventScroll: true }), 50);
  return bs;
}
function acciones(lista) {
  const ac = $('#mo-acciones'); ac.innerHTML = '';
  lista.forEach(a => {
    const b = document.createElement('button'); b.type = 'button'; b.className = 'btn' + (a.primario ? ' primario' : ''); b.textContent = a.t;
    b.onclick = () => { sClic(); a.fn(); }; ac.appendChild(b);
  });
  return ac;
}
function explica(t) { const ex = $('#mo-explica'); ex.textContent = t; ex.hidden = false; }
const cerrarModal = () => { $('#modal').hidden = true; };

function pregunta(q, titulo) {
  return new Promise(res => {
    modal({
      icono: '🤔', titulo: titulo || 'Pregunta', texto: q.texto, opciones: q.opciones,
      alElegir: (i, bs) => {
        bs.forEach(b => { b.disabled = true; });
        const ok = i === q.correcta;
        bs[q.correcta].classList.add('ok'); if (!ok) bs[i].classList.add('mal');
        if (ok) sBien(); else sMal();
        explica((ok ? '¡Correcto! ' : 'No es esa. ') + q.explica);
        const ac = acciones([{ t: 'Seguir', primario: true, fn: () => { cerrarModal(); res(ok); } }]);
        ac.querySelector('button').focus({ preventScroll: true });
      }
    });
  });
}

function mision(chip, texto, ayuda, hechos, de) {
  $('#m-paso').textContent = chip; $('#m-texto').textContent = texto; $('#m-ayuda').textContent = ayuda || '';
  const p = $('#m-puntos'); p.innerHTML = '';
  for (let i = 0; i < de; i++) { const d = document.createElement('i'); if (i < hechos) d.className = 'ok'; else if (i === hechos) d.className = 'ya'; p.appendChild(d); }
  ajustarVista();
}
let ajustarVista = () => {};

/* ---------- arranque ---------- */
function webgl() { try { const c = document.createElement('canvas'); return !!(c.getContext('webgl') || c.getContext('experimental-webgl')); } catch (e) { return false; } }
carga(25);
if (!window.THREE) { $('#p-msg').textContent = 'No se pudo descargar el motor 3D. Revisa la conexión y vuelve a abrir el juego.'; return; }
if (!webgl()) { $('#p-msg').textContent = 'Este aparato no puede mostrar juegos en 3D.'; return; }
carga(55);
const fuentes = document.fonts ? Promise.all([document.fonts.load('900 40px Grandstander'), document.fonts.load('600 40px Lexend'), document.fonts.load('700 40px Lexend')]) : Promise.resolve();
Promise.race([fuentes, new Promise(r => setTimeout(r, 2500))]).catch(() => {}).then(() => { carga(80); setTimeout(arrancar, 20); });

function arrancar() {
const V = THREE.Vector3, PI = Math.PI;

/* ---------- motor ---------- */
const rd = new THREE.WebGLRenderer({ antialias: true });
rd.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));
rd.shadowMap.enabled = true; rd.shadowMap.type = THREE.PCFSoftShadowMap;
$('#gl').appendChild(rd.domElement);
const escena = new THREE.Scene();
const cam = new THREE.PerspectiveCamera(40, 1, .1, 200);

function lienzo(w, h, dibuja) {
  const c = document.createElement('canvas'); c.width = w; c.height = h; dibuja(c.getContext('2d'), w, h);
  const t = new THREE.CanvasTexture(c); t.anisotropy = 4; t.userData = { c }; return t;
}
function rrect(x, X, Y, w, h, r) { x.beginPath(); x.moveTo(X + r, Y); x.arcTo(X + w, Y, X + w, Y + h, r); x.arcTo(X + w, Y + h, X, Y + h, r); x.arcTo(X, Y + h, X, Y, r); x.arcTo(X, Y, X + w, Y, r); x.closePath(); }
const grad = (a, b) => lienzo(4, 256, (x) => { const g = x.createLinearGradient(0, 0, 0, 256); g.addColorStop(0, a); g.addColorStop(1, b); x.fillStyle = g; x.fillRect(0, 0, 4, 256); });
escena.background = grad('#fff3dd', '#f2d2a2');
escena.fog = new THREE.Fog(0xf4dcb4, 30, 64);

escena.add(new THREE.HemisphereLight(0xfff8ec, 0xb08a5e, .78));
const sol = new THREE.DirectionalLight(0xfff0d8, .95);
sol.position.set(7, 16, 10); sol.castShadow = true; sol.shadow.mapSize.set(2048, 2048);
Object.assign(sol.shadow.camera, { left: -11, right: 11, top: 9, bottom: -9, near: 2, far: 45 });
sol.shadow.bias = -.0006; sol.shadow.normalBias = .02;
escena.add(sol);

const M = (c, o) => new THREE.MeshStandardMaterial(Object.assign({ color: c, flatShading: true, roughness: .78 }, o || {}));
const MB = (c, o) => new THREE.MeshBasicMaterial(Object.assign({ color: c }, o || {}));
const VIDRIO = new THREE.MeshStandardMaterial({ color: 0xe3f7ff, transparent: true, opacity: .26, roughness: .08, metalness: .1, depthWrite: false, side: THREE.DoubleSide });
const INVIS = new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false });
const MAT = {
  madera: M(0xc98a52), maderaClara: M(0xe9c48e), maderaOscura: M(0x8a5a32), mesa: M(0x2a7c86, { roughness: .6 }),
  arena: M(0xfff4dc), tinta: M(0x15304d), coral: M(0xff6a4d), sol: M(0xffc23a), hoja: M(0x2f9e5d), mar: M(0x0e9aa0),
  laton: M(0xd9a441, { metalness: .5, roughness: .35 }), cobre: M(0xd0773e, { metalness: .4, roughness: .4 }), plata: M(0xcfd6dd, { metalness: .5, roughness: .3 }),
  gris: M(0x8d99a6), blanco: M(0xfdfaf2)
};
const caja = (w, h, d, m) => new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m);
const cil = (a, b, h, s, m) => new THREE.Mesh(new THREE.CylinderGeometry(a, b, h, s || 12), m);
const en = (o, x, y, z) => { o.position.set(x, y, z); return o; };
function sombras(o, recibe) { o.traverse(m => { if (m.isMesh && !(m.material && m.material.transparent)) { m.castShadow = true; m.receiveShadow = recibe !== false; } }); return o; }

/* ---------- sala ---------- */
const piso = new THREE.Mesh(new THREE.PlaneGeometry(140, 140), new THREE.MeshStandardMaterial({
  roughness: .9, map: (() => {
    const t = lienzo(256, 256, (x) => { for (let i = 0; i < 8; i++) { x.fillStyle = i % 2 ? '#d9b07a' : '#d2a670'; x.fillRect(0, i * 32, 256, 32); x.fillStyle = 'rgba(120,80,40,.25)'; x.fillRect(0, i * 32, 256, 2); x.fillRect((i * 97) % 256, i * 32, 3, 32); } });
    t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(18, 18); return t;
  })()
}));
piso.rotation.x = -PI / 2; piso.position.y = -3.6; piso.receiveShadow = true; escena.add(piso);
escena.add(en(caja(70, 18, .4, M(0xf7e3bf)), 0, 5, -10.5));
escena.add(en(caja(70, 3.4, .5, MAT.mar), 0, -1.9, -10.2));
escena.add(en(caja(70, .25, .6, MAT.blanco), 0, -.2, -10.2));
[-1, 1].forEach(s => escena.add(en(caja(.4, 18, 40, M(0xf3dbb2)), s * 24, 5, 8)));
// ventanas
const cielo = grad('#9fe0f2', '#fff1d0');
[-8.5, 8.5].forEach(x => {
  const g = new THREE.Group(); g.position.set(x, 5.4, -10.25);
  g.add(caja(5.6, 4.2, .3, MAT.blanco));
  g.add(en(new THREE.Mesh(new THREE.PlaneGeometry(5, 3.6), MB(0xffffff, { map: cielo, fog: false })), 0, 0, .16));
  g.add(en(caja(.14, 3.6, .1, MAT.blanco), 0, 0, .2)); g.add(en(caja(5, .14, .1, MAT.blanco), 0, 0, .2));
  g.add(en(caja(6.1, .3, .7, MAT.blanco), 0, -2.2, .3));
  const m = en(cil(.35, .26, .5, 8, MAT.coral), 1.8, -1.8, .35); g.add(m);
  for (let i = 0; i < 5; i++) { const h = en(new THREE.Mesh(new THREE.IcosahedronGeometry(.28, 0), MAT.hoja), 1.8 + Math.cos(i * 1.3) * .2, -1.3 + (i % 2) * .25, .35 + Math.sin(i * 1.3) * .2); g.add(h); }
  escena.add(g);
});
// cartel de la tabla periódica
const cartel = new THREE.Mesh(new THREE.PlaneGeometry(5.4, 3.2), new THREE.MeshStandardMaterial({
  roughness: .9, map: lienzo(540, 320, (x) => {
    x.fillStyle = '#fffdf7'; x.fillRect(0, 0, 540, 320);
    x.fillStyle = '#15304d'; x.font = '900 38px Grandstander, sans-serif'; x.textAlign = 'center'; x.fillText('Los elementos', 270, 50);
    const cols = ['#ff6a4d', '#ffc23a', '#2f9e5d', '#0e9aa0', '#7aa7e0', '#c78fd8'], sim = 'HHeLiBeBCNOFNeNaMgAlSiPSClArKCaFeCuZnAgAu'.match(/[A-Z][a-z]?/g);
    let k = 0;
    for (let r = 0; r < 4; r++) for (let c = 0; c < 12; c++) {
      if (r === 0 && c > 0 && c < 11) continue;
      const X = 18 + c * 42.5, Y = 76 + r * 58;
      x.fillStyle = cols[(c + r * 2) % cols.length]; rrect(x, X, Y, 38, 52, 6); x.fill();
      x.fillStyle = '#fff'; x.font = '700 18px Lexend, sans-serif'; x.fillText(sim[k++ % sim.length], X + 19, Y + 33);
    }
  })
}));
cartel.position.set(0, 7.2, -10.27); escena.add(cartel);
escena.add(en(caja(5.8, 3.6, .1, MAT.maderaOscura), 0, 7.2, -10.32));
// repisa con frascos
const repisa = new THREE.Group(); repisa.position.set(0, 4.2, -10);
repisa.add(caja(9, .18, 1, MAT.madera));
[0xff6a4d, 0x0e9aa0, 0xffc23a, 0x2f9e5d, 0x7aa7e0].forEach((c, i) => {
  const x = -3.8 + i * 1.1;
  if (i % 2) { repisa.add(en(cil(.12, .42, .7, 9, M(c)), x, .44, 0)); repisa.add(en(cil(.12, .12, .3, 8, VIDRIO), x, .94, 0)); }
  else { repisa.add(en(new THREE.Mesh(new THREE.IcosahedronGeometry(.36, 1), M(c)), x, .45, 0)); repisa.add(en(cil(.1, .1, .4, 8, VIDRIO), x, .9, 0)); }
});
[0xff6a4d, 0x15304d, 0xffc23a, 0x2f9e5d, 0xf3e6cf, 0x0e9aa0].forEach((c, i) => { const b = caja(.22, .9 + (i % 3) * .12, .7, M(c)); b.position.set(1.8 + i * .26, .5, 0); b.rotation.z = i === 5 ? -.25 : 0; repisa.add(b); });
escena.add(sombras(repisa));

/* ---------- mesa ---------- */
const mesa = new THREE.Group(); escena.add(mesa);
mesa.add(en(caja(17.4, .36, 6.8, MAT.mesa), 0, -.18, 0));
mesa.add(en(caja(17.6, .16, 7, MAT.madera), 0, -.44, 0));
[[-8.2, -3], [8.2, -3], [-8.2, 3], [8.2, 3]].forEach(([x, z]) => mesa.add(en(caja(.5, 3.1, .5, MAT.madera), x, -2.05, z)));
[-4.4, 4.4].forEach(x => {
  mesa.add(en(caja(5.6, 2.6, 6, MAT.arena), x, -1.9, -.2));
  [-1.4, 1.4].forEach(d => { mesa.add(en(caja(2.6, 2.3, .06, M(0xf1dfb8)), x + d, -1.9, 2.82)); mesa.add(en(cil(.08, .08, .12, 8, MAT.laton), x + d + (d < 0 ? 1 : -1), -1.6, 2.88).rotateX(PI / 2)); });
});
mesa.add(en(caja(17.2, .8, .45, MAT.arena), 0, .4, -3.15));
for (let i = 0; i < 6; i++) { const t = en(cil(.07, .07, .35, 8, MAT.laton), -7 + i * 2.8, .35, -2.85); t.rotation.x = PI / 2; mesa.add(t); }
// microscopio
const micro = new THREE.Group(); micro.position.set(-2.75, 0, -2.25);
micro.add(en(caja(.7, .12, .55, MAT.tinta), 0, .06, 0));
const brazo = en(caja(.16, .95, .22, MAT.tinta), 0, .55, -.18); brazo.rotation.x = .25; micro.add(brazo);
micro.add(en(caja(.5, .05, .4, MAT.gris), 0, .42, .06));
const tubo = en(cil(.08, .11, .62, 10, MAT.blanco), 0, .95, .05); tubo.rotation.x = -.35; micro.add(tubo);
micro.add(en(cil(.05, .05, .14, 8, MAT.tinta), 0, 1.28, .16));
mesa.add(micro);
// gradilla con tubos de ensayo
const grad2 = new THREE.Group(); grad2.position.set(2.75, 0, -2.3);
grad2.add(en(caja(1.2, .08, .35, MAT.madera), 0, .04, 0)); grad2.add(en(caja(1.2, .06, .35, MAT.madera), 0, .45, 0));
[0xff6a4d, 0xffc23a, 0x2f9e5d, 0x0e9aa0].forEach((c, i) => { const x = -.42 + i * .28; grad2.add(en(cil(.07, .07, .7, 8, VIDRIO), x, .4, 0)); grad2.add(en(cil(.06, .06, .3 + i * .06, 8, M(c)), x, .2 + i * .03, 0)); });
mesa.add(grad2);
sombras(mesa);

/* ---------- estaciones ---------- */
const POS = { circuito: new V(-5.4, 0, 0), solar: new V(0, 0, -.2), mezclas: new V(5.4, 0, 0) };
const est = {}, picks = { hub: [], circuito: [], solar: [], mezclas: [] };
ORDEN.forEach(id => {
  const g = new THREE.Group(); g.position.copy(POS[id]); escena.add(g); est[id] = g;
  const tapete = en(cil(2.3, 2.3, .03, 48, M(0xfff4dc, { roughness: .95 })), 0, .015, 0); tapete.receiveShadow = true; g.add(tapete);
  tapete.userData.a = { tipo: 'estacion', id }; picks.hub.push(tapete);
});

// letreros de la mesa
const letreros = {};
function dibujarLetrero(id) {
  const L = letreros[id], x = L.tex.userData.c.getContext('2d'), e = EXP[id], n = estDe(id);
  x.clearRect(0, 0, 512, 256);
  x.fillStyle = 'rgba(21,48,77,.25)'; rrect(x, 14, 22, 484, 214, 40); x.fill();
  x.fillStyle = '#fffdf7'; rrect(x, 10, 10, 484, 214, 40); x.fill();
  x.lineWidth = 8; x.strokeStyle = n ? '#2f9e5d' : '#ff6a4d'; x.stroke();
  x.font = '86px "Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(e.icono, 96, 116);
  x.textAlign = 'left'; x.fillStyle = '#15304d'; x.font = '900 46px Grandstander, sans-serif';
  const pal = e.nombre.split(' ');
  if (pal.length > 1 && x.measureText(e.nombre).width > 320) { x.fillText(pal[0], 168, 72); x.fillText(pal.slice(1).join(' '), 168, 120); }
  else x.fillText(e.nombre, 168, 96);
  x.font = '700 44px Lexend, sans-serif'; x.fillStyle = '#e8a300'; x.fillText('★'.repeat(n), 168, 176);
  x.fillStyle = '#e3d7bd'; x.fillText('★'.repeat(3 - n), 168 + x.measureText('★'.repeat(n)).width, 176);
  L.tex.needsUpdate = true;
}
ORDEN.forEach(id => {
  const tex = lienzo(512, 256, () => {});
  const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true, fog: false }));
  sp.scale.set(2.8, 1.4, 1); sp.position.set(0, id === 'solar' ? 3.1 : 2.6, 0); sp.renderOrder = 5;
  sp.userData.a = { tipo: 'estacion', id }; est[id].add(sp); picks.hub.push(sp);
  letreros[id] = { sp, tex, y: sp.position.y }; dibujarLetrero(id);
});

function etiqueta(texto, alto, o) {
  o = o || {};
  const fs = 60, pad = 30, f = `${o.peso || 700} ${fs}px ${o.fuente || 'Lexend'}, sans-serif`;
  const m = document.createElement('canvas').getContext('2d'); m.font = f;
  const w = Math.ceil(m.measureText(texto).width) + pad * 2, h = fs + 40;
  const tex = lienzo(w, h, (x) => {
    rrect(x, 4, 4, w - 8, h - 8, (h - 8) / 2); x.fillStyle = o.fondo || 'rgba(21,48,77,.92)'; x.fill();
    x.font = f; x.fillStyle = o.color || '#fff'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(texto, w / 2, h / 2 + 3);
  });
  const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, depthTest: false, transparent: true, fog: false }));
  sp.scale.set(alto * w / h, alto, 1); sp.renderOrder = 20; return sp;
}
const halo = lienzo(128, 128, (x) => { const g = x.createRadialGradient(64, 64, 0, 64, 64, 64); g.addColorStop(0, 'rgba(255,235,160,1)'); g.addColorStop(.35, 'rgba(255,200,80,.55)'); g.addColorStop(1, 'rgba(255,190,60,0)'); x.fillStyle = g; x.fillRect(0, 0, 128, 128); });
const spriteHalo = (s, c) => { const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: halo, color: c || 0xffffff, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, fog: false })); sp.scale.set(s, s, 1); return sp; };

/* ---------- tweens ---------- */
const tweens = [];
const suave = k => k < .5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2;
function tw(dur, fn, fin) { const t = { t: 0, dur, fn, fin }; tweens.push(t); return t; }
const twp = (dur, fn) => new Promise(r => tw(dur, fn, r));
const espera = s => new Promise(r => tw(s, () => {}, r));

/* ---------- confeti ---------- */
const confeti = [];
{
  const geo = new THREE.PlaneGeometry(.09, .055), cols = [0xff6a4d, 0xffc23a, 0x2f9e5d, 0x0e9aa0, 0xffffff];
  for (let i = 0; i < 70; i++) { const m = new THREE.Mesh(geo, MB(cols[i % 5], { side: THREE.DoubleSide })); m.visible = false; escena.add(m); confeti.push({ m, v: new V(), w: new V(), vida: 0 }); }
}
function estallar(p, n) {
  let k = 0;
  for (const c of confeti) {
    if (c.vida > 0) continue; if (k++ >= (n || 30)) break;
    c.m.position.copy(p); c.v.set((Math.random() - .5) * 3, 2 + Math.random() * 2.5, (Math.random() - .5) * 3); c.w.set(Math.random() * 8, Math.random() * 8, 0); c.vida = 1.6; c.m.visible = true;
  }
}

/* ======================================================================
   1) CIRCUITO
   ====================================================================== */
const CI = { g: est.circuito, slots: [], piezas: [], sel: null, errores: 0, paso: 0, estuvo: false, completo: false, cerrado: false, activo: false };
{
  const g = CI.g, xL = -1.3, xR = 1.3, zT = -1.5, zB = .1, zM = (zT + zB) / 2, YB = .12;
  CI.YB = YB;
  g.add(sombras(en(caja(3.3, .12, 2.3, MAT.maderaClara), 0, .06, -.7)));
  g.add(sombras(en(caja(4.1, .06, 1.9, M(0xe4d6bb)), 0, .03, 1.6)));
  [[xL, zT], [xR, zT], [xR, zB], [xL, zB], [0, zB]].forEach(([x, z]) => g.add(sombras(en(cil(.07, .09, .14, 8, MAT.laton), x, YB + .07, z))));
  const defs = [['pila', 'pila', xL, zM, PI / 2, 1.6], ['cableA', 'cable', 0, zT, 0, 2.6], ['bombillo', 'bombillo', xR, zM, PI / 2, 1.6], ['cableB', 'cable', .65, zB, 0, 1.3], ['interruptor', 'interruptor', -.65, zB, 0, 1.3]];
  defs.forEach(([id, tipo, x, z, rot, L]) => {
    const w = L - .2, h = .46, cw = Math.round(128 * w / h);
    const nombre = EXP.circuito.piezas[tipo].nombre;
    const tex = lienzo(cw, 128, (c) => {
      c.fillStyle = 'rgba(255,253,247,.85)'; rrect(c, 6, 6, cw - 12, 116, 26); c.fill();
      c.setLineDash([16, 12]); c.lineWidth = 6; c.strokeStyle = 'rgba(21,48,77,.45)'; c.stroke();
      c.fillStyle = 'rgba(21,48,77,.6)'; c.font = `600 ${nombre.length > 9 ? 40 : 50}px Lexend, sans-serif`; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(nombre, cw / 2, 68);
    });
    const pad = new THREE.Mesh(new THREE.PlaneGeometry(w, h), MB(0xffffff, { map: tex, transparent: true, polygonOffset: true, polygonOffsetFactor: -2 }));
    pad.geometry.rotateX(-PI / 2); pad.position.set(x, YB + .004, z); pad.rotation.y = rot; g.add(pad);
    const s = { id, tipo, x, z, rot, L, pad, p: null };
    pad.userData.a = { tipo: 'ranura', ref: s }; picks.circuito.push(pad);
    CI.slots.push(s);
  });
  // electrones que dan la vuelta
  const camino = [new V(xL, .5, zB), new V(xL, .5, zT), new V(xR, .5, zT), new V(xR, .5, zB), new V(xL, .5, zB)];
  CI.camino = camino; CI.largo = 2 * (xR - xL) + 2 * (zB - zT);
  CI.electrones = [];
  const ge = new THREE.SphereGeometry(.05, 8, 6), me = MB(0xffe066);
  for (let i = 0; i < 18; i++) { const m = new THREE.Mesh(ge, me); m.visible = false; g.add(m); CI.electrones.push(m); }
}
function piezaPunto(t, out) {
  let d = ((t % CI.largo) + CI.largo) % CI.largo;
  for (let i = 0; i < 4; i++) { const a = CI.camino[i], b = CI.camino[i + 1], l = a.distanceTo(b); if (d <= l) return out.lerpVectors(a, b, d / l); d -= l; }
  return out.copy(CI.camino[0]);
}
const cable = (x1, x2, y, m) => { const c = cil(.028, .028, Math.abs(x2 - x1), 6, m || MAT.cobre); c.rotation.z = PI / 2; c.position.set((x1 + x2) / 2, y, 0); return c; };
function construir(p, L) {
  const v = p.vis; while (v.children.length) { const c = v.children.pop(); if (c.userData.propia) c.geometry.dispose(); }
  p.L = L;
  if (p.tipo === 'pila') {
    const b = cil(.2, .2, 1, 14, MAT.coral); b.rotation.z = PI / 2; b.position.y = .2; v.add(b);
    const f = cil(.205, .205, .28, 14, MAT.tinta); f.rotation.z = PI / 2; f.position.set(.36, .2, 0); v.add(f);
    const t = cil(.08, .08, .1, 10, MAT.laton); t.rotation.z = PI / 2; t.position.set(.55, .2, 0); v.add(t);
    const s = en(caja(.12, .03, .03, MAT.sol), .36, .41, 0); v.add(s); v.add(en(caja(.03, .03, .12, MAT.sol), .36, .41, 0));
    v.add(cable(-L / 2, -.5, .06)); v.add(cable(.6, L / 2, .06));
  } else if (p.tipo === 'bombillo') {
    v.add(en(caja(.5, .05, .42, MAT.tinta), 0, .025, 0));
    v.add(en(cil(.16, .19, .22, 12, MAT.gris), 0, .16, 0));
    v.add(en(cil(.13, .15, .14, 12, MAT.laton), 0, .34, 0));
    const vidrio = new THREE.Mesh(new THREE.SphereGeometry(.3, 18, 12), new THREE.MeshStandardMaterial({ color: 0xfff0b8, transparent: true, opacity: .62, roughness: .1, emissive: 0x000000, depthWrite: false }));
    vidrio.position.y = .66; vidrio.userData.propia = true; v.add(vidrio);
    const fil = new THREE.Mesh(new THREE.TorusGeometry(.08, .014, 6, 14, PI), M(0x5b4a3a, { emissive: 0x000000 })); fil.position.y = .6; fil.userData.propia = true; v.add(fil);
    const h = spriteHalo(2.2); h.position.y = .66; h.material.opacity = 0; v.add(h);
    p.vidrio = vidrio; p.fil = fil; p.halo = h;
    if (!p.luz) { p.luz = new THREE.PointLight(0xffc860, 0, 5, 2); p.luz.position.y = .8; p.g.add(p.luz); }
    v.add(cable(-L / 2, -.19, .05)); v.add(cable(.19, L / 2, .05));
  } else if (p.tipo === 'interruptor') {
    v.add(en(caja(.72, .08, .36, M(0x264b6e)), 0, .04, 0));
    v.add(en(cil(.05, .05, .14, 8, MAT.laton), -.26, .15, 0)); v.add(en(cil(.05, .05, .14, 8, MAT.laton), .26, .15, 0));
    const pal = new THREE.Group(); pal.position.set(-.26, .22, 0);
    pal.add(en(caja(.56, .04, .08, MAT.plata), .28, 0, 0)); pal.add(en(new THREE.Mesh(new THREE.SphereGeometry(.065, 10, 8), MAT.coral), .5, .05, 0));
    pal.rotation.z = p.cerrado ? 0 : .7; v.add(pal); p.palanca = pal;
    v.add(cable(-L / 2, -.3, .05)); v.add(cable(.3, L / 2, .05));
  } else {
    const curva = new THREE.QuadraticBezierCurve3(new V(-L / 2 + .06, .05, 0), new V(0, .34, 0), new V(L / 2 - .06, .05, 0));
    const t = new THREE.Mesh(new THREE.TubeGeometry(curva, 18, .045, 6), p.color); t.userData.propia = true; v.add(t);
    [-1, 1].forEach(s => v.add(en(caja(.12, .06, .08, MAT.plata), s * (L / 2 - .06), .05, 0)));
  }
  sombras(v);
}
['pila', 'cable', 'bombillo', 'cable', 'interruptor'].forEach((tipo, i) => {
  const p = { tipo, g: new THREE.Group(), vis: new THREE.Group(), slot: null, cerrado: false, color: i === 1 ? M(0xe84a3a) : M(0x2f6fd8) };
  p.g.add(p.vis);
  p.hit = new THREE.Mesh(new THREE.BoxGeometry(1, .7, .62), INVIS); p.hit.position.y = .3; p.g.add(p.hit);
  p.hit.userData.a = { tipo: 'pieza', ref: p }; picks.circuito.push(p.hit);
  CI.g.add(p.g); CI.piezas.push(p);
  if (tipo === 'interruptor') CI.inter = p;
  if (tipo === 'bombillo') CI.bomb = p;
});
function largoBandeja(p) { return p.tipo === 'cable' ? 1.2 : p.tipo === 'interruptor' ? 1.3 : 1.6; }
function aCasa(p, rapido) {
  if (p.slot) { p.slot.p = null; p.slot = null; }
  if (p.L !== largoBandeja(p)) construir(p, largoBandeja(p));
  p.hit.scale.x = p.L;
  moverPieza(p, p.casa.x, .06, p.casa.z, PI / 2, rapido ? 0 : .35);
}
function moverPieza(p, x, y, z, rot, dur) {
  const a = p.g.position.clone(), r0 = p.g.rotation.y;
  if (!dur) { p.g.position.set(x, y, z); p.g.rotation.y = rot; return Promise.resolve(); }
  return twp(dur, k => { p.g.position.set(a.x + (x - a.x) * k, a.y + (y - a.y) * k + Math.sin(k * PI) * .3, a.z + (z - a.z) * k); p.g.rotation.y = r0 + (rot - r0) * k; });
}
function ciReset() {
  const xs = [-1.6, -.8, 0, .8, 1.6].sort(() => Math.random() - .5);
  CI.slots.forEach(s => { s.p = null; });
  CI.piezas.forEach((p, i) => { p.slot = null; p.cerrado = false; p.casa = { x: xs[i], z: 1.6 }; construir(p, largoBandeja(p)); aCasa(p, true); });
  Object.assign(CI, { sel: null, errores: 0, paso: 0, estuvo: false, activo: true });
  ciEvaluar(true); ciMision();
}
function ciMision() {
  const e = EXP.circuito, p = e.pasos[CI.paso];
  if (!p) return;
  mision(`Paso ${CI.paso + 1} de ${e.pasos.length}`, p.texto, CI.sel ? e.piezas[CI.sel.tipo].pista : e.como, CI.paso, e.pasos.length);
}
function ciEvaluar(silencio) {
  CI.completo = CI.slots.every(s => s.p);
  const antes = CI.cerrado;
  CI.cerrado = CI.completo && CI.inter.cerrado;
  const b = CI.bomb, on = CI.cerrado;
  b.vidrio.material.emissive.setHex(on ? 0xffc23a : 0); b.vidrio.material.emissiveIntensity = on ? 1.1 : 0; b.vidrio.material.opacity = on ? .9 : .62;
  b.fil.material.emissive.setHex(on ? 0xff8a1a : 0);
  b.halo.material.opacity = on ? .9 : 0; b.luz.intensity = on ? 1.4 : 0;
  CI.electrones.forEach(m => { m.visible = on; });
  if (on && !antes && !silencio) { tono(880, .15, 'sine', .05); estallar(b.g.getWorldPosition(new V()).add(new V(0, .8, 0)), 18); }
  if (!silencio) ciPaso();
}
function ciPaso() {
  const e = EXP.circuito, p = e.pasos[CI.paso]; if (!p || !CI.activo) return;
  let hecho = false;
  if (p.tipo === 'armar') hecho = CI.completo;
  else if (p.tipo === 'encender') hecho = CI.cerrado;
  else if (p.tipo === 'apagar') hecho = CI.completo && !CI.inter.cerrado;
  else if (p.tipo === 'quitar') { if (CI.cerrado) CI.estuvo = true; hecho = CI.estuvo && CI.slots.some(s => s.tipo === 'cable' && !s.p); }
  if (!hecho) return;
  CI.paso++; CI.estuvo = false; sBien();
  if (CI.paso < e.pasos.length) { toast('¡Muy bien!', 'bien', 1400); ciMision(); }
  else {
    mision('Preguntas', 'Ahora responde lo que viste.', '', e.pasos.length, e.pasos.length);
    setTimeout(ciPreguntas, 1100);
  }
}
async function ciPreguntas() {
  const qs = EXP.circuito.preguntas;
  for (let i = 0; i < qs.length; i++) { const ok = await pregunta(qs[i], `Pregunta ${i + 1} de ${qs.length}`); if (!ok) CI.errores++; if (!CI.activo) return; }
  CI.activo = false;
  const e = CI.errores; terminar('circuito', e <= 1 ? 3 : e <= 3 ? 2 : 1);
}
function ciSeleccionar(p) {
  CI.piezas.forEach(o => { o.sel = false; });
  CI.sel = p; if (p) p.sel = true;
  CI.slots.forEach(s => s.pad.material.color.setHex(p && s.tipo === p.tipo && !s.p ? 0xffd970 : 0xffffff));
  ciMision();
}
function ciSoltar(p, s) {
  if (s && s.tipo === p.tipo && !s.p) {
    s.p = p; p.slot = s; if (p.L !== s.L) construir(p, s.L); p.hit.scale.x = s.L;
    sClac(); moverPieza(p, s.x, CI.YB, s.z, s.rot, .25).then(() => ciEvaluar());
    ciSeleccionar(null); return;
  }
  if (s && s.tipo !== p.tipo) {
    CI.errores++; sMal();
    toast(`Ahí no va. ${EXP.circuito.piezas[p.tipo].pista}`, 'mal', 2800);
  } else if (s && s.p) toast('Esa ranura ya tiene pieza.', '', 1600);
  ciSeleccionar(null); aCasa(p); ciEvaluar();
}
function ranuraCerca(pos) {
  let mejor = null, dm = .75;
  CI.slots.forEach(s => { const d = Math.hypot(pos.x - s.x, pos.z - s.z); if (d < dm) { dm = d; mejor = s; } });
  return mejor;
}
function ciToque(a) {
  if (a.tipo === 'pieza') {
    const p = a.ref;
    if (p.slot && p.tipo === 'interruptor') {
      p.cerrado = !p.cerrado; sClac();
      const r0 = p.palanca.rotation.z, r1 = p.cerrado ? 0 : .7; tw(.18, k => { p.palanca.rotation.z = r0 + (r1 - r0) * k; }, () => ciEvaluar());
      return;
    }
    if (p.slot) { sClic(); aCasa(p); ciSeleccionar(null); ciEvaluar(); return; }
    sClic(); ciSeleccionar(CI.sel === p ? null : p); return;
  }
  if (a.tipo === 'ranura') {
    if (CI.sel) ciSoltar(CI.sel, a.ref);
    else if (a.ref.p) ciToque({ tipo: 'pieza', ref: a.ref.p });
    else toast('Primero toca una pieza de la bandeja.', '', 1600);
  }
}

/* ======================================================================
   2) SISTEMA SOLAR
   ====================================================================== */
const SO = { g: est.solar, planetas: [], reto: 0, k: 0, errores: 0, activo: false, Y: 1.15 };
{
  const g = SO.g, Y = SO.Y;
  /* sin base ni varillas: el Sol y los planetas flotan solos sobre la mesa */
  const astro = en(new THREE.Mesh(new THREE.IcosahedronGeometry(.36, 2), MB(0xffb52e)), 0, Y, 0); g.add(astro); SO.astro = astro;
  const hs = spriteHalo(1.9, 0xffd27a); hs.position.y = Y; g.add(hs); SO.halo = hs;
  astro.userData.a = { tipo: 'sol' }; picks.solar.push(astro);
  const radios = [.62, .84, 1.06, 1.28, 1.6, 1.92, 2.17, 2.4];
  const texTierra = lienzo(128, 64, (x) => { x.fillStyle = '#2f7fd8'; x.fillRect(0, 0, 128, 64); x.fillStyle = '#3fae5a'; [[20, 26, 14, 10], [52, 36, 10, 16], [86, 22, 18, 10], [104, 44, 10, 7]].forEach(([a, b, c, d]) => { x.beginPath(); x.ellipse(a, b, c, d, .4, 0, 7); x.fill(); }); x.fillStyle = '#fff'; x.fillRect(0, 0, 128, 5); x.fillRect(0, 59, 128, 5); });
  const texJup = lienzo(16, 64, (x) => { ['#e8c39a', '#c98e5c', '#efd6b4', '#b8774a', '#e8c39a', '#d9a46c', '#f2dfc4', '#c98e5c'].forEach((c, i) => { x.fillStyle = c; x.fillRect(0, i * 8, 16, 8); }); });
  EXP.solar.planetas.forEach((d, i) => {
    const r = radios[i] || 2.4 + i * .2, piv = new THREE.Group();
    piv.position.y = Y; g.add(piv);
    const mat = d.id === 'tierra' ? M(0xffffff, { map: texTierra }) : d.id === 'jupiter' ? M(0xffffff, { map: texJup }) : M(new THREE.Color(d.color));
    const pl = en(new THREE.Mesh(new THREE.SphereGeometry(d.tam, 18, 12), mat), r, 0, 0); piv.add(pl);
    if (d.anillo) { const an = new THREE.Mesh(new THREE.RingGeometry(d.tam * 1.35, d.tam * 2.2, 36), M(0xd9c08a, { side: THREE.DoubleSide })); an.rotation.x = -PI / 2 + .45; pl.add(an); }
    const hit = new THREE.Mesh(new THREE.SphereGeometry(Math.max(.19, d.tam * 1.35), 8, 6), INVIS); pl.add(hit);
    const orb = new THREE.Mesh(new THREE.TorusGeometry(r, .006, 4, 96), MB(0x15304d, { transparent: true, opacity: .22 })); orb.rotation.x = PI / 2; orb.position.y = Y; g.add(orb);
    const lab = etiqueta(d.nombre, .17); lab.visible = false; lab.position.set(r, d.tam + .17, 0); piv.add(lab);
    const P = { d, piv, pl, hit, lab, r, w: .17 / Math.pow(r, 1.5), ang: i * 2.39 };
    hit.userData.a = { tipo: 'planeta', ref: P }; picks.solar.push(hit);
    sombras(piv); SO.planetas.push(P);
  });
}
function soEtiqueta(P, texto, visible) {
  if (P.lab.userData.t !== texto) {
    const n = etiqueta(texto, .17); P.lab.material.map.dispose(); P.lab.material.map = n.material.map; P.lab.scale.copy(n.scale); P.lab.userData.t = texto;
  }
  P.lab.visible = visible;
}
function soReset() {
  Object.assign(SO, { reto: 0, k: 0, errores: 0, activo: true });
  SO.planetas.forEach(P => { soEtiqueta(P, P.d.nombre, false); clearTimeout(P.tt); });
  soMision();
}
function soMision() {
  const rs = EXP.solar.retos, r = rs[SO.reto]; if (!r) return;
  let txt = r.pide, ay = EXP.solar.como;
  if (r.tipo === 'orden') ay = `Llevas ${SO.k} de ${SO.planetas.length}. Empieza por el más cercano al Sol.`;
  mision(`Reto ${SO.reto + 1} de ${rs.length}`, txt, ay, SO.reto, rs.length);
}
function soToque(a) {
  const r = EXP.solar.retos[SO.reto]; if (!r || !SO.activo) return;
  if (a.tipo === 'sol') { toast('Ese es el Sol: es una estrella, no un planeta.', '', 2400); return; }
  const P = a.ref, pos = P.pl.getWorldPosition(new V());
  if (r.tipo === 'orden') {
    const quiere = SO.planetas[SO.k];
    if (P === quiere) {
      SO.k++; sBien(); soEtiqueta(P, `${SO.k} · ${P.d.nombre}`, true); estallar(pos, 12);
      if (SO.k >= SO.planetas.length) { toast('¡Los ocho en orden!', 'bien'); SO.activo = false; setTimeout(soSiguiente, 1200); }
      else soMision();
    } else if (P.lab.visible && P.lab.userData.t[0] !== P.d.nombre[0]) {
      toast('Ese ya lo tocaste. ¿Cuál sigue?', '', 1600);
    } else {
      SO.errores++; sMal(); toast(`Ese es ${P.d.nombre}. Todavía no le toca: ¿cuál está más cerca del Sol?`, 'mal', 2600);
    }
    return;
  }
  if (P.d.id === r.id) {
    sBien(); estallar(pos, 26); soEtiqueta(P, P.d.nombre, true);
    toast(`¡Sí! ${P.d.nombre}: ${P.d.dato}`, 'bien', 3200);
    SO.activo = false; setTimeout(soSiguiente, 2400);
  } else {
    SO.errores++; sMal(); soEtiqueta(P, P.d.nombre, true);
    toast(`Ese es ${P.d.nombre}. Busca otra vez.`, 'mal', 2000);
    clearTimeout(P.tt); P.tt = setTimeout(() => { P.lab.visible = false; }, 1800);
  }
}
function soSiguiente() {
  if (modo !== 'solar') return;
  SO.reto++;
  const r = EXP.solar.retos[SO.reto];
  if (!r) { const e = SO.errores; terminar('solar', e <= 1 ? 3 : e <= 4 ? 2 : 1); return; }
  SO.planetas.forEach(P => { P.lab.visible = false; clearTimeout(P.tt); });
  if (r.tipo === 'orden') SO.planetas.forEach(P => soEtiqueta(P, P.d.nombre, false));
  SO.activo = true; soMision();
}

/* ======================================================================
   3) MEZCLAS
   ====================================================================== */
const MZ = { g: est.mezclas, frascos: {}, reto: 0, fase: 'primero', correctas: 0, pred: -1, ocupado: false, activo: false, h1: 0, h2: 0, hE: 0, res: null };
{
  const g = MZ.g, vaso = new THREE.Group(); vaso.position.set(0, 0, 1.15); g.add(vaso); MZ.vaso = vaso;
  vaso.add(sombras(en(caja(1.6, .06, 1.6, MAT.blanco), 0, .03, 0)));
  const BASE = MZ.BASE = .11, R = .53;
  const fondo = en(cil(.57, .57, .05, 28, VIDRIO), 0, .085, 0); vaso.add(fondo);
  const pared = en(new THREE.Mesh(new THREE.CylinderGeometry(.61, .57, 1.45, 28, 1, true), VIDRIO), 0, .06 + .725, 0); pared.renderOrder = 4; vaso.add(pared);
  const borde = en(new THREE.Mesh(new THREE.TorusGeometry(.61, .025, 6, 32), M(0xffffff, { transparent: true, opacity: .7 })), 0, 1.51, 0); borde.rotation.x = PI / 2; vaso.add(borde);
  for (let i = 1; i <= 4; i++) vaso.add(en(caja(i % 2 ? .16 : .1, .016, .01, MB(0x15304d, { transparent: true, opacity: .45 })), -.12, BASE + i * .26, .585));
  const liq = (o) => { const m = new THREE.Mesh(new THREE.CylinderGeometry(R, R, 1, 28), new THREE.MeshStandardMaterial({ color: 0xffffff, transparent: true, opacity: o, roughness: .2, depthWrite: false })); m.visible = false; vaso.add(m); return m; };
  MZ.l1 = liq(.72); MZ.l1.renderOrder = 1; MZ.l2 = liq(.88); MZ.l2.renderOrder = 2;
  const esp = new THREE.Group(); esp.visible = false; vaso.add(esp); MZ.esp = esp;
  const mEsp = new THREE.MeshStandardMaterial({ color: 0xfffaf0, roughness: 1 });
  MZ.espC = new THREE.Mesh(new THREE.CylinderGeometry(R + .02, R + .02, 1, 28), mEsp); esp.add(MZ.espC);
  MZ.espB = [];
  for (let i = 0; i < 14; i++) { const b = new THREE.Mesh(new THREE.IcosahedronGeometry(.09 + (i % 3) * .03, 1), mEsp); const a = i * 2.4, rr = i < 8 ? .4 : .17; b.userData.p = [Math.cos(a) * rr, Math.sin(a) * rr]; esp.add(b); MZ.espB.push(b); }
  MZ.chorro = new THREE.Mesh(new THREE.CylinderGeometry(.04, .05, 1, 8), new THREE.MeshStandardMaterial({ color: 0xffffff, transparent: true, opacity: .8, depthWrite: false })); MZ.chorro.visible = false; g.add(MZ.chorro);
  const gp = new THREE.SphereGeometry(1, 8, 6), gg = new THREE.BoxGeometry(.04, .04, .04);
  MZ.mBur = new THREE.MeshStandardMaterial({ color: 0xffffff, transparent: true, opacity: .75, roughness: .1, depthWrite: false });
  MZ.mGota = M(0xf2be2e, { transparent: true, opacity: .95 });
  MZ.part = []; for (let i = 0; i < 70; i++) { const m = new THREE.Mesh(gp, MZ.mBur); m.visible = false; m.renderOrder = 3; vaso.add(m); MZ.part.push({ m, on: false, v: 0, s: .04, tipo: '' }); }
  MZ.granos = []; for (let i = 0; i < 50; i++) { const m = new THREE.Mesh(gg, M(0xffffff)); m.visible = false; vaso.add(m); MZ.granos.push({ m, on: false, v: new V(), s: 1 }); }
  // frascos
  const ids = Object.keys(EXP.mezclas.sustancias), xs = [-1.85, -.92, 0, .92, 1.85];
  ids.forEach((id, i) => {
    const s = EXP.mezclas.sustancias[id], f = new THREE.Group(), col = new THREE.Color(s.color);
    const tapa = [MAT.coral, MAT.mar, MAT.hoja, MAT.sol, MAT.tinta][i % 5];
    let boca, tapaM;
    if (s.tipo === 'solido') {
      f.add(en(cil(.3, .3, .56, 14, VIDRIO), 0, .28, 0));
      f.add(en(cil(.27, .27, .38, 14, M(col)), 0, .2, 0));
      for (let k = 0; k < 6; k++) f.add(en(new THREE.Mesh(new THREE.IcosahedronGeometry(.07, 0), M(col)), Math.cos(k) * .15, .4, Math.sin(k) * .15));
      tapaM = en(cil(.32, .32, .12, 14, tapa), 0, .62, 0); f.add(tapaM); boca = .6;
    } else {
      f.add(en(cil(.25, .27, .8, 12, VIDRIO), 0, .4, 0));
      f.add(en(cil(.22, .24, .58, 12, M(col, { roughness: .3 })), 0, .31, 0));
      f.add(en(cil(.1, .16, .22, 10, VIDRIO), 0, .91, 0));
      tapaM = en(cil(.11, .11, .12, 10, tapa), 0, 1.08, 0); f.add(tapaM); boca = 1.04;
    }
    const et = new THREE.Mesh(new THREE.PlaneGeometry(.5, .2), MB(0xffffff, { map: lienzo(250, 100, (x) => { x.fillStyle = '#fffdf7'; rrect(x, 3, 3, 244, 94, 18); x.fill(); x.lineWidth = 5; x.strokeStyle = '#15304d'; x.stroke(); x.fillStyle = '#15304d'; x.font = `700 ${s.nombre.length > 8 ? 34 : 42}px Lexend, sans-serif`; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(s.nombre, 125, 54); }) }));
    et.position.set(0, s.tipo === 'solido' ? .3 : .42, s.tipo === 'solido' ? .31 : .275); f.add(et);
    const hit = en(new THREE.Mesh(new THREE.BoxGeometry(.7, 1.25, .7), INVIS), 0, .6, 0); f.add(hit);
    f.position.set(xs[i], 0, -1.25); g.add(sombras(f));
    const F = { id, s, g: f, casa: f.position.clone(), boca, tapa: tapaM, col };
    hit.userData.a = { tipo: 'frasco', ref: F }; picks.mezclas.push(hit);
    MZ.frascos[id] = F;
  });
  // cuchara de mezclar, de adorno
  const cuchara = en(cil(.03, .03, 1.4, 6, MAT.plata), 1.3, .05, 1.2); cuchara.rotation.z = PI / 2; cuchara.rotation.y = .5; g.add(sombras(cuchara));
}
function mzNiveles() {
  const B = MZ.BASE;
  MZ.l1.visible = MZ.h1 > .002; MZ.l1.scale.y = Math.max(.001, MZ.h1); MZ.l1.position.y = B + MZ.h1 / 2;
  MZ.l2.visible = MZ.h2 > .002; MZ.l2.scale.y = Math.max(.001, MZ.h2); MZ.l2.position.y = B + MZ.h1 + MZ.h2 / 2;
  MZ.esp.visible = MZ.hE > .01;
  const top = B + MZ.h1 + MZ.h2;
  MZ.espC.scale.y = Math.max(.001, MZ.hE); MZ.espC.position.y = top + MZ.hE / 2;
  MZ.espB.forEach((b, i) => { b.position.set(b.userData.p[0], top + MZ.hE + .02 * Math.sin(tiempo * 3 + i), b.userData.p[1]); b.scale.setScalar(Math.min(1, MZ.hE * 4)); });
}
const nombreS = id => EXP.mezclas.sustancias[id].nombre.toLowerCase();
function mzReset() {
  Object.assign(MZ, { reto: 0, fase: 'primero', correctas: 0, pred: -1, ocupado: false, activo: true, h1: 0, h2: 0, hE: 0, res: null });
  MZ.part.forEach(p => { p.on = false; p.m.visible = false; }); MZ.granos.forEach(p => { p.on = false; p.m.visible = false; });
  Object.values(MZ.frascos).forEach(F => { F.g.position.copy(F.casa); F.g.rotation.set(0, 0, 0); F.tapa.visible = true; });
  mzNiveles(); mzMision();
}
function mzMision() {
  const e = EXP.mezclas, r = e.retos[MZ.reto]; if (!r) return;
  const chip = `Mezcla ${MZ.reto + 1} de ${e.retos.length}`;
  if (MZ.fase === 'primero') mision(chip, `Vierte ${nombreS(r.primero)} en el vaso.`, e.como, MZ.reto, e.retos.length);
  else if (MZ.fase === 'segundo') mision(chip, `Ahora echa ${nombreS(r.segundo)} y mira si acertaste.`, `Tu predicción: «${r.opciones[MZ.pred]}»`, MZ.reto, e.retos.length);
  else mision(chip, 'Mira con atención qué pasa en el vaso…', '', MZ.reto, e.retos.length);
}
function mzGrano(F) {
  const g = MZ.granos.find(o => !o.on); if (!g) return;
  const boca = F.g.localToWorld(new V(0, F.boca, 0)); MZ.vaso.worldToLocal(boca);
  g.on = true; g.s = 1; g.liq = false; g.m.visible = true; g.m.position.copy(boca).add(new V((Math.random() - .5) * .1, 0, (Math.random() - .5) * .1));
  g.v.set((Math.random() - .1) * .5, -.3, (Math.random() - .5) * .3); g.m.scale.setScalar(1); g.m.material.color.copy(F.col);
}
function mzParticula(tipo, y) {
  const p = MZ.part.find(o => !o.on); if (!p) return;
  const a = Math.random() * PI * 2, r = Math.random() * .42;
  p.on = true; p.tipo = tipo; p.m.visible = true; p.m.material = tipo === 'gota' ? MZ.mGota : MZ.mBur;
  p.s = tipo === 'gota' ? .05 + Math.random() * .05 : .025 + Math.random() * .035; p.m.scale.setScalar(p.s);
  p.v = tipo === 'gota' ? .2 + Math.random() * .25 : .6 + Math.random() * .7;
  p.m.position.set(Math.cos(a) * r, y != null ? y : MZ.BASE + .05 + Math.random() * .2, Math.sin(a) * r);
}
async function mzVerter(F, rol) {
  const r = EXP.mezclas.retos[MZ.reto];
  MZ.ocupado = true;
  const solido = F.s.tipo === 'solido', tilt = solido ? 2.1 : 2.0;
  const vasoW = MZ.vaso.getWorldPosition(new V()), local = new V().copy(vasoW).sub(MZ.g.position);
  const boca = new V(local.x - .18, 1.72, local.z);
  const R = new THREE.Euler(0, 0, -tilt), off = new V(0, F.boca, 0).applyEuler(R);
  const P = boca.clone().sub(off), a = F.g.position.clone(), ra = F.g.rotation.z;
  await twp(.6, k => { F.g.position.lerpVectors(a, P, k); F.g.position.y += Math.sin(k * PI) * .4; F.g.rotation.z = ra + (-tilt - ra) * k; });
  F.tapa.visible = false; tono(solido ? 900 : 300, .5, solido ? 'triangle' : 'sine', .025, solido ? 1300 : 180);
  const esSegundo = rol === 'segundo', res = r.resultado;
  if (esSegundo) { MZ.res = res; mzResultado(res); }
  const h0 = MZ.h1, ch = MZ.chorro;
  if (!solido) { ch.material.color.copy(F.col); ch.visible = true; }
  let acum = 0;
  await twp(1.3, k => {
    if (!solido) {
      const sup = MZ.BASE + MZ.h1 + MZ.h2 + vasoW.y - MZ.g.position.y, top = boca.y - .02;
      ch.scale.y = Math.max(.01, top - sup); ch.position.set(boca.x + .02, (top + sup) / 2, boca.z);
      if (!esSegundo) { MZ.h1 = h0 + .55 * k; mzNiveles(); }
    } else { acum += .6; while (acum > 1) { acum--; mzGrano(F); mzGrano(F); } }
  });
  ch.visible = false; F.tapa.visible = true;
  await twp(.55, k => { F.g.position.lerpVectors(P, F.casa, k); F.g.position.y += Math.sin(k * PI) * .3; F.g.rotation.z = -tilt * (1 - k); });
  F.g.position.copy(F.casa); F.g.rotation.z = 0;
  MZ.ocupado = false;
}
function mzResultado(res) {
  if (res === 'capas') {
    MZ.l2.material.color.set(EXP.mezclas.sustancias[EXP.mezclas.retos[MZ.reto].segundo].color);
    for (let i = 0; i < 16; i++) setTimeout(() => mzParticula('gota'), 150 + i * 110);
    tw(3.2, k => { MZ.h2 = .26 * Math.min(1, k * 1.2); mzNiveles(); });
  } else if (res === 'disolucion') {
    tw(3.4, k => { MZ.l1.material.opacity = .72 + .18 * Math.sin(k * PI); });
  } else if (res === 'burbujas') {
    let n = 0;
    tw(4.2, k => { if (k > .2) { n += 1; if (n % 2 === 0) { mzParticula('burbuja'); mzParticula('burbuja'); } } MZ.hE = k < .2 ? 0 : k < .55 ? .62 * suave((k - .2) / .35) : .62 - .42 * suave((k - .55) / .45); mzNiveles(); });
  }
}
async function mzFrasco(F) {
  if (MZ.ocupado || !MZ.activo) return;
  const r = EXP.mezclas.retos[MZ.reto]; if (!r) return;
  const quiere = MZ.fase === 'primero' ? r.primero : MZ.fase === 'segundo' ? r.segundo : null;
  if (!quiere) return;
  if (F.id !== quiere) {
    sMal(); toast(`Ahora toca ${nombreS(quiere)}.`, '', 1800);
    if (F.g.position.distanceTo(F.casa) > .01) await twp(.3, k => { F.g.position.lerp(F.casa, k); });
    return;
  }
  if (MZ.fase === 'primero') {
    MZ.l1.material.color.set(F.s.color); MZ.l1.material.opacity = .72;
    await mzVerter(F, 'primero');
    MZ.fase = 'predecir'; mzMision();
    const bs = modal({
      icono: '🔮', titulo: '¿Qué crees que pasará?', texto: r.pregunta, opciones: r.opciones,
      alElegir: (i) => { MZ.pred = i; sClic(); cerrarModal(); MZ.fase = 'segundo'; mzMision(); }
    });
    void bs;
  } else {
    MZ.fase = 'mirar'; mzMision();
    await mzVerter(F, 'segundo');
    await espera(r.resultado === 'burbujas' ? 2.6 : 1.8);
    if (modo !== 'mezclas') return;
    const ok = MZ.pred === r.correcta; if (ok) { MZ.correctas++; sBien(); estallar(MZ.vaso.getWorldPosition(new V()).add(new V(0, 1.6, 0)), 30); } else sMal();
    const bs = modal({ icono: ok ? '🎯' : '🔍', titulo: ok ? '¡Predijiste bien!' : 'Pasó otra cosa', texto: r.pregunta, opciones: r.opciones });
    bs.forEach(b => { b.disabled = true; }); bs[r.correcta].classList.add('ok'); if (!ok && bs[MZ.pred]) bs[MZ.pred].classList.add('mal');
    explica(r.explica);
    acciones([{ t: MZ.reto + 1 < EXP.mezclas.retos.length ? 'Siguiente mezcla' : 'Terminar', primario: true, fn: () => { cerrarModal(); mzSiguiente(); } }]);
  }
}
async function mzSiguiente() {
  MZ.ocupado = true;
  const h1 = MZ.h1, h2 = MZ.h2, hE = MZ.hE;
  await twp(.7, k => { MZ.h1 = h1 * (1 - k); MZ.h2 = h2 * (1 - k); MZ.hE = hE * (1 - k); mzNiveles(); });
  MZ.h1 = MZ.h2 = MZ.hE = 0; mzNiveles(); MZ.l1.material.opacity = .72;
  MZ.part.forEach(p => { p.on = false; p.m.visible = false; });
  MZ.ocupado = false; MZ.reto++;
  if (MZ.reto >= EXP.mezclas.retos.length) { MZ.activo = false; terminar('mezclas', Math.max(1, MZ.correctas)); return; }
  MZ.fase = 'primero'; mzMision();
}
function mzActualizar(dt) {
  const B = MZ.BASE, sup = B + MZ.h1 + MZ.h2;
  for (const p of MZ.part) {
    if (!p.on) continue;
    p.m.position.y += p.v * dt;
    p.m.position.x += Math.sin(tiempo * 6 + p.s * 99) * .002;
    const lim = p.tipo === 'gota' ? B + MZ.h1 + MZ.h2 * .5 : sup + MZ.hE * .6;
    if (p.m.position.y > lim) { p.on = false; p.m.visible = false; }
  }
  for (const g of MZ.granos) {
    if (!g.on) continue;
    if (!g.liq) {
      g.v.y -= 9 * dt; g.m.position.addScaledVector(g.v, dt);
      const r = Math.hypot(g.m.position.x, g.m.position.z); if (r > .45) { g.m.position.x *= .45 / r; g.m.position.z *= .45 / r; }
      if (g.m.position.y < sup) {
        g.liq = true; g.v.set(0, -.18, 0);
        if (MZ.res === 'burbujas') { g.s = .2; mzParticula('burbuja', g.m.position.y - .1); }
      }
    } else {
      g.m.position.y = Math.max(B + .02, g.m.position.y + g.v.y * dt);
      g.s -= dt * (MZ.res === 'burbujas' ? 2 : .55); g.m.scale.setScalar(Math.max(.001, g.s)); g.m.rotation.x += dt * 2;
      if (g.s <= 0) { g.on = false; g.m.visible = false; }
    }
  }
}

/* ======================================================================
   cámara, vistas y entrada
   ====================================================================== */
const VISTAS = {
  hub: { t: [0, .4, -.2], th: 0, dth: .6, ph: .95, W: 17.4, H: 7 },
  hubAlto: { t: [0, .4, 0], th: .72, dth: .5, ph: 1.0, W: 9.6, H: 8 },
  circuito: { t: [-5.4, .25, .1], th: 0, dth: .9, ph: .72, W: 4.5, H: 4.0 },
  solar: { t: [0, .95, -.2], th: 0, dth: 9, ph: .95, W: 5.2, H: 3.8 },
  mezclas: { t: [5.4, .6, 0], th: 0, dth: .9, ph: .78, W: 4.6, H: 4.7 }
};
const vista = { t: new V(0, .4, -.2), th: .3, ph: .9, d: 26 };
let cfg = VISTAS.hub, fit = 20, camT = null, Hf = 1, util = 1;
const vistaDe = n => n === 'hub' && innerWidth / innerHeight < .9 ? VISTAS.hubAlto : VISTAS[n];
function aplicarCam() {
  const s = Math.sin(vista.ph);
  cam.position.set(vista.t.x + vista.d * s * Math.sin(vista.th), vista.t.y + vista.d * Math.cos(vista.ph), vista.t.z + vista.d * s * Math.cos(vista.th));
  cam.lookAt(vista.t);
}
function ajustar() {
  const W = innerWidth, H = innerHeight;
  rd.setSize(W, H);
  const arriba = $('#barra').hidden ? 8 : $('#barra').getBoundingClientRect().bottom + 6;
  let abajo = 0;
  if (!$('#mision').hidden) abajo = H - $('#mision').getBoundingClientRect().top + 6;
  else if (!$('#hub').hidden) abajo = H - $('#hub').getBoundingClientRect().top + 6;
  const delta = (arriba - abajo) / 2;
  Hf = H + 2 * Math.abs(delta); util = Math.max(120, H - arriba - abajo);
  cam.aspect = W / Hf; cam.setViewOffset(W, Hf, 0, delta < 0 ? 2 * Math.abs(delta) : 0, W, H); cam.updateProjectionMatrix();
  const tv = Math.tan(cam.fov * PI / 360);
  fit = Math.max(cfg.W * Hf / (2 * tv * W), cfg.H * Hf / (2 * tv * util));
  if (!camT) vista.d = Math.min(Math.max(vista.d, fit * .55), fit * 1.35);
}
function irVista(n, dur) {
  cfg = vistaDe(n); ajustar();
  const a = { t: vista.t.clone(), th: vista.th, ph: vista.ph, d: vista.d }, b = { t: new V().fromArray(cfg.t), th: cfg.th, ph: cfg.ph, d: fit };
  while (a.th - b.th > PI) a.th -= 2 * PI; while (b.th - a.th > PI) a.th += 2 * PI;
  if (camT) camT.cancel = true;
  camT = tw(dur == null ? 1 : dur, k => { vista.t.lerpVectors(a.t, b.t, k); vista.th = a.th + (b.th - a.th) * k; vista.ph = a.ph + (b.ph - a.ph) * k; vista.d = a.d + (fit - a.d) * k; }, () => { camT = null; });
}
function orbitar(dx, dy) {
  if (camT) { camT.cancel = true; camT = null; }
  vista.th = Math.min(cfg.th + cfg.dth, Math.max(cfg.th - cfg.dth, vista.th - dx * .006));
  vista.ph = Math.min(1.3, Math.max(.3, vista.ph - dy * .005));
}
function zoom(f) { if (camT) { camT.cancel = true; camT = null; } vista.d = Math.min(fit * 1.35, Math.max(fit * .55, vista.d * f)); }

const ray = new THREE.Raycaster(), ptr = new THREE.Vector2(), plano = new THREE.Plane(new V(0, 1, 0), 0), tmp = new V();
function rayo(x, y) { const r = rd.domElement.getBoundingClientRect(); ptr.set((x - r.left) / r.width * 2 - 1, -(y - r.top) / r.height * 2 + 1); ray.setFromCamera(ptr, cam); }
function tocado(x, y) {
  const lista = picks[modo]; if (!lista || !lista.length) return null;
  rayo(x, y);
  const hs = ray.intersectObjects(lista, false);
  for (const h of hs) { if (h.object.userData.a) return h.object.userData.a; }
  return null;
}
function puntoEnPlano(x, y, h) { rayo(x, y); plano.constant = -h; return ray.ray.intersectPlane(plano, tmp) ? tmp.clone() : null; }

const dedos = new Map();
let gesto = null; // {x0,y0,x,y,a,movio,arr}
const cv = rd.domElement;
cv.addEventListener('pointerdown', e => {
  cv.setPointerCapture(e.pointerId); dedos.set(e.pointerId, { x: e.clientX, y: e.clientY });
  if (dedos.size === 2) { if (gesto && gesto.arr) soltarArrastre(gesto, true); const [p, q] = [...dedos.values()]; gesto = { pinza: Math.hypot(p.x - q.x, p.y - q.y) }; return; }
  if (dedos.size > 2) return;
  gesto = { x0: e.clientX, y0: e.clientY, x: e.clientX, y: e.clientY, a: tocado(e.clientX, e.clientY), movio: false, arr: null };
});
cv.addEventListener('pointermove', e => {
  if (!dedos.has(e.pointerId)) {
    if (e.pointerType === 'mouse') cv.style.cursor = tocado(e.clientX, e.clientY) ? 'pointer' : 'grab';
    return;
  }
  dedos.set(e.pointerId, { x: e.clientX, y: e.clientY });
  if (!gesto) return;
  if (gesto.pinza != null) { const [p, q] = [...dedos.values()]; if (!q) return; const d = Math.hypot(p.x - q.x, p.y - q.y); zoom(gesto.pinza / d); gesto.pinza = d; return; }
  const dx = e.clientX - gesto.x, dy = e.clientY - gesto.y; gesto.x = e.clientX; gesto.y = e.clientY;
  if (!gesto.movio && Math.hypot(e.clientX - gesto.x0, e.clientY - gesto.y0) > 7) { gesto.movio = true; empezarArrastre(gesto); }
  if (!gesto.movio) return;
  if (gesto.arr) moverArrastre(gesto, e.clientX, e.clientY); else orbitar(dx, dy);
});
function fin(e) {
  if (!dedos.has(e.pointerId)) return;
  dedos.delete(e.pointerId);
  if (!gesto) return;
  if (gesto.pinza != null) { if (!dedos.size) gesto = null; return; }
  if (gesto.arr) soltarArrastre(gesto);
  else if (!gesto.movio && e.type === 'pointerup') tocar(gesto.a);
  gesto = null;
}
cv.addEventListener('pointerup', fin); cv.addEventListener('pointercancel', fin);
cv.addEventListener('wheel', e => { e.preventDefault(); zoom(Math.exp(e.deltaY * .0012)); }, { passive: false });
addEventListener('keydown', e => {
  if (!$('#modal').hidden || !$('#inicio').hidden || !$('#final').hidden) return;
  const k = e.key;
  if (k === 'ArrowLeft') orbitar(-30, 0); else if (k === 'ArrowRight') orbitar(30, 0);
  else if (k === 'ArrowUp') orbitar(0, -24); else if (k === 'ArrowDown') orbitar(0, 24);
  else if (k === '+' || k === '=') zoom(.9); else if (k === '-') zoom(1.1);
  else if (k === 'Escape' && modo !== 'hub') irMesa();
  else return;
  e.preventDefault();
});

function empezarArrastre(g) {
  const a = g.a; if (!a) return;
  if (modo === 'circuito' && a.tipo === 'pieza' && CI.activo) {
    const p = a.ref; if (p.slot) { p.slot.p = null; p.slot = null; ciEvaluar(); }
    ciSeleccionar(p); g.arr = { tipo: 'pieza', p }; sClic();
  } else if (modo === 'mezclas' && a.tipo === 'frasco' && MZ.activo && !MZ.ocupado && (MZ.fase === 'primero' || MZ.fase === 'segundo')) {
    g.arr = { tipo: 'frasco', F: a.ref }; sClic();
  }
}
function moverArrastre(g, x, y) {
  if (g.arr.tipo === 'pieza') {
    const pt = puntoEnPlano(x, y, CI.YB); if (!pt) return;
    pt.sub(CI.g.position); pt.x = Math.max(-2.2, Math.min(2.2, pt.x)); pt.z = Math.max(-2.2, Math.min(2.6, pt.z));
    const p = g.arr.p; p.g.position.set(pt.x, .5, pt.z);
    const s = ranuraCerca(pt); g.arr.s = s;
    CI.slots.forEach(o => o.pad.material.color.setHex(o === s ? (o.tipo === p.tipo && !o.p ? 0x8ff0b0 : 0xffb0a0) : o.tipo === p.tipo && !o.p ? 0xffd970 : 0xffffff));
    if (s && s.tipo === p.tipo) p.g.rotation.y += (s.rot - p.g.rotation.y) * .3;
  } else {
    const pt = puntoEnPlano(x, y, 0); if (!pt) return;
    pt.sub(MZ.g.position); const F = g.arr.F;
    F.g.position.set(Math.max(-2.3, Math.min(2.3, pt.x)), .35, Math.max(-1.8, Math.min(2, pt.z)));
  }
}
function soltarArrastre(g, cancelar) {
  const A = g.arr; g.arr = null; if (!A) return;
  if (A.tipo === 'pieza') { if (cancelar || !A.s) { ciSeleccionar(null); aCasa(A.p); ciEvaluar(); } else ciSoltar(A.p, A.s); return; }
  const F = A.F, vp = MZ.vaso.position, d = Math.hypot(F.g.position.x - vp.x, F.g.position.z - vp.z);
  if (!cancelar && d < 1) mzFrasco(F);
  else tw(.3, k => { F.g.position.lerp(F.casa, k); }, () => F.g.position.copy(F.casa));
}
function tocar(a) {
  if (!a) { if (modo === 'circuito' && CI.sel) ciSeleccionar(null); return; }
  if (a.tipo === 'estacion') { sClic(); entrar(a.id); return; }
  if (modo === 'circuito' && CI.activo) ciToque(a);
  else if (modo === 'solar') soToque(a);
  else if (modo === 'mezclas' && a.tipo === 'frasco') mzFrasco(a.ref);
}

/* ---------- modos ---------- */
let modo = 'inicio';
const hub = $('#hub');
function pintarHub() {
  hub.innerHTML = '';
  ORDEN.forEach(id => {
    const e = EXP[id], n = estDe(id), b = document.createElement('button');
    b.type = 'button'; b.className = 'exp' + (n ? ' hecho' : '');
    b.innerHTML = `<span class="ic">${e.icono}</span><b>${e.nombre}</b><span class="est">${htmlEst(n)}</span><small>${e.aprende}</small>`;
    b.onclick = () => { sClic(); entrar(id); }; hub.appendChild(b);
  });
  const f = document.createElement('button'); f.type = 'button'; f.className = 'btn fin'; f.textContent = `Ver mi resultado · ${total()} ★`;
  f.onclick = () => { sClic(); mostrarFinal(); }; hub.appendChild(f);
}
function irMesa() {
  modo = 'hub'; SO.planetas.forEach(P => { P.lab.visible = false; clearTimeout(P.tt); }); CI.activo = false; SO.activo = false; MZ.activo = false; cerrarModal();
  $('#barra').hidden = true; $('#mision').hidden = true; $('#toast').hidden = true; hub.hidden = false; pintarHub();
  ORDEN.forEach(id => { letreros[id].sp.visible = true; dibujarLetrero(id); });
  if (CI.sel) ciSeleccionar(null);
  irVista('hub');
}
function entrar(id) {
  modo = id; const e = EXP[id]; SO.planetas.forEach(P => { P.lab.visible = false; clearTimeout(P.tt); });
  hub.hidden = true; $('#barra').hidden = false; $('#mision').hidden = false; cerrarModal();
  $('#t-titulo').textContent = `${e.icono} ${e.nombre}`; $('#t-estrellas').innerHTML = htmlEst(estDe(id));
  ORDEN.forEach(k => { letreros[k].sp.visible = false; });
  if (id === 'circuito') ciReset(); else if (id === 'solar') soReset(); else mzReset();
  irVista(id);
  toast(e.como, '', 3600);
}
function terminar(id, n) {
  const e = EXP[id], antes = estDe(id), todos = ORDEN.every(k => estDe(k) > 0);
  prog.estrellas[id] = Math.max(antes, n); guardar(); textoProgreso();
  $('#t-estrellas').innerHTML = htmlEst(estDe(id));
  const ahoraTodos = ORDEN.every(k => estDe(k) > 0);
  sBien(); setTimeout(() => tono(1320, .3), 260);
  estallar(cam.position.clone().add(cam.getWorldDirection(new V()).multiplyScalar(4)), 50);
  mision('¡Terminado!', `${e.nombre}: ${'★'.repeat(n)}`, e.aprende, 99, 0);
  modal({
    icono: '🏅', titulo: `¡${e.nombre} listo!`, html: `<div class="estrellas-grandes">${htmlEst(n)}</div>Aprendiste: ${e.aprende}`,
    acciones: [
      { t: 'Repetir', fn: () => entrar(id) },
      { t: ahoraTodos && !todos ? 'Ver mi resultado' : 'Volver a la mesa', primario: true, fn: () => { if (ahoraTodos && !todos) mostrarFinal(); else irMesa(); } }
    ]
  });
}
function mostrarFinal() {
  $('#f-titulo').textContent = ORDEN.every(k => estDe(k) > 0) ? D.final.titulo : 'Tu resultado';
  $('#f-texto').textContent = ORDEN.every(k => estDe(k) > 0) ? D.final.texto : 'Todavía te faltan experimentos. ¡Vuelve a la mesa y termínalos!';
  $('#f-lista').innerHTML = ORDEN.map(id => `<div><span>${EXP[id].icono} ${EXP[id].nombre}</span><span class="est">${htmlEst(estDe(id))}</span></div>`).join('');
  $('#f-total').textContent = `${total()} de ${ORDEN.length * 3} estrellas`;
  cerrarModal(); $('#final').hidden = false;
  $('#final .btn.primario').focus({ preventScroll: true });
}
$('#b-seguir').onclick = () => { sClic(); $('#final').hidden = true; irMesa(); };
$('#b-atras').onclick = () => { sClic(); irMesa(); };
$('#b-sonido').onclick = e => { mudo = !mudo; e.currentTarget.setAttribute('aria-pressed', String(!mudo)); e.currentTarget.textContent = mudo ? '🔇' : '🔊'; };
$('#b-jugar').onclick = () => { sClic(); $('#inicio').hidden = true; irMesa(); };

/* ---------- bucle ---------- */
let tiempo = 0, ultimo = performance.now(), raf = 0;
const ep = new V();
function actualizar(dt) {
  tiempo += dt;
  for (let i = tweens.length - 1; i >= 0; i--) {
    const t = tweens[i]; if (t.cancel) { tweens.splice(i, 1); continue; }
    t.t += dt; const k = Math.min(1, t.t / t.dur); t.fn(suave(k));
    if (k >= 1) { tweens.splice(i, 1); if (t.fin) t.fin(); }
  }
  aplicarCam();
  ORDEN.forEach((id, i) => { const L = letreros[id]; L.sp.position.y = L.y + Math.sin(tiempo * 1.6 + i) * .08; });
  SO.planetas.forEach((P, i) => { P.ang += P.w * dt; P.piv.rotation.y = P.ang; P.pl.rotation.y += dt * .8; P.pl.position.y = Math.sin(tiempo * 1.3 + i * 1.7) * .05; });
  SO.astro.rotation.y += dt * .2; SO.astro.position.y = SO.Y + Math.sin(tiempo * .9) * .04; SO.halo.scale.setScalar(1.9 + Math.sin(tiempo * 2) * .08);
  if (CI.cerrado) CI.electrones.forEach((m, i) => piezaPunto(tiempo * 1.2 + i * CI.largo / CI.electrones.length, m.position));
  if (CI.cerrado) CI.bomb.halo.material.opacity = .82 + Math.sin(tiempo * 9) * .06;
  CI.piezas.forEach(p => { if (p.sel && !(gesto && gesto.arr && gesto.arr.p === p)) p.vis.position.y = .12 + Math.sin(tiempo * 5) * .05; else p.vis.position.y = 0; });
  mzActualizar(dt);
  if (MZ.hE > .01) mzNiveles();
  for (const c of confeti) {
    if (c.vida <= 0) continue;
    c.vida -= dt; c.v.y -= 5 * dt; c.v.multiplyScalar(.985); c.m.position.addScaledVector(c.v, dt);
    c.m.rotation.x += c.w.x * dt; c.m.rotation.y += c.w.y * dt;
    if (c.vida <= 0) c.m.visible = false;
  }
  void ep;
}
function cuadro(now) {
  raf = requestAnimationFrame(cuadro);
  const dt = Math.min(.05, (now - ultimo) / 1000); ultimo = now;
  actualizar(dt); rd.render(escena, cam);
}
document.addEventListener('visibilitychange', () => {
  if (document.hidden) { cancelAnimationFrame(raf); raf = 0; }
  else if (!raf) { ultimo = performance.now(); raf = requestAnimationFrame(cuadro); }
});
addEventListener('resize', () => { cfg = vistaDe(modo === 'inicio' ? 'hub' : modo); ajustar(); });
if (window.ResizeObserver) { const ro = new ResizeObserver(() => ajustar()); ro.observe($('#mision')); ro.observe(hub); }

ajustarVista = ajustar;
cfg = VISTAS.hub; ajustar(); vista.d = fit * 1.15; aplicarCam();
raf = requestAnimationFrame(cuadro);
carga(100); $('#p-msg').textContent = D.comoSeJuega; $('#b-jugar').disabled = false; $('#b-jugar').focus({ preventScroll: true });

/* ---------- depuración ---------- */
const objetivo = n => {
  const [t, id] = n.split(':'); let o = null;
  if (t === 'pieza') o = CI.piezas.filter(p => p.tipo === id)[0];
  if (t === 'cable2') o = CI.piezas.filter(p => p.tipo === 'cable')[1];
  if (o) return o.g;
  if (t === 'ranura') { const s = CI.slots.find(s => s.id === id); return s && s.pad; }
  if (t === 'planeta') { const P = SO.planetas.find(P => P.d.id === id); return P && P.pl; }
  if (t === 'frasco') return MZ.frascos[id] && MZ.frascos[id].g;
  if (t === 'vaso') return MZ.vaso;
  if (t === 'sol') return SO.astro;
  return null;
};
window.__juego = {
  estado: () => ({ modo, quieta: !camT, estrellas: Object.assign({}, prog.estrellas), circuito: { paso: CI.paso, completo: CI.completo, cerrado: CI.cerrado, errores: CI.errores }, solar: { reto: SO.reto, k: SO.k, errores: SO.errores, activo: SO.activo }, mezclas: { reto: MZ.reto, fase: MZ.fase, correctas: MZ.correctas, ocupado: MZ.ocupado } }),
  ir: id => (id === 'hub' || id === 'mesa' ? irMesa() : entrar(id)),
  saltar: () => { if (EXP[modo]) terminar(modo, 3); },
  pantalla: (n, dy) => {
    const o = objetivo(n); if (!o) return null;
    const p = o.getWorldPosition(new V()); p.y += dy || 0; p.project(cam);
    const r = cv.getBoundingClientRect(); return { x: r.left + (p.x + 1) / 2 * r.width, y: r.top + (1 - p.y) / 2 * r.height };
  },
  queHay: (x, y) => { const a = tocado(x, y); return a ? a.tipo + ':' + (a.id || (a.ref && (a.ref.tipo || (a.ref.d && a.ref.d.id) || a.ref.id)) || '') : null; },
  borrar: () => { prog.estrellas = {}; guardar(); }
};
}
})();
