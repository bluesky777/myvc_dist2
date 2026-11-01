/* Átomo a Átomo — el laboratorio-cocina en 3D (three r128, el de puente.js).
   - La sala: pared de baldosas, ventana, repisas con frascos de átomos (con su letra), lámparas, el mesón y la placa
     de trabajo que brilla, y el ayudante de la Biblioteca (robot.glb, o la niña o el niño) detrás del mesón.
   - La molécula: bolas CPK (los colores de las escenas `molecula` y `reaccion`) con su letra grande siempre de frente,
     palos de dos colores (sencillo, doble, triple), los brazos libres como muescas (un palito con una perilla blanca)
     y, ya completa, los pares libres (lóbulos lila). Se mueve con suavidad a su sitio (RPECV, quimica.js `disponer`).
     Al cerrarse cobra vida: gira, rebota y abre los ojos. Modo calma: sin giro solo ni rebote.
   - La fantasma: la molécula pedida, pequeña y translúcida, arriba a un lado (la pista).
   - La balanza: para balancear reacciones, con los reactivos en el platillo izquierdo y los productos en el derecho;
     se inclina hacia el lado que pesa más (la masa de verdad, en u). Al reaccionar, los átomos vuelan de un lado al otro.
   window.AtomoLab = { disponible, crear(contenedor, {biblio, calma, ayudante}) } */
(function () {
'use strict';
const T = window.THREE, Q = window.AtomoQuimica;
if (!T || !Q) { window.AtomoLab = { disponible: false }; return; }
const V3 = T.Vector3;
const M = (c, o) => new T.MeshStandardMaterial(Object.assign({ color: c, roughness: 0.7, metalness: 0, flatShading: true }, o || {}));
const caja = (x, y, z, c) => new T.Mesh(new T.BoxGeometry(x, y, z), typeof c === 'string' ? M(c) : c);
const cil = (rt, rb, h, c, n) => new T.Mesh(new T.CylinderGeometry(rt, rb, h, n || 14), typeof c === 'string' ? M(c) : c);
const RADIO = { H: 0.34, C: 0.47, N: 0.45, O: 0.44, F: 0.42, Cl: 0.56, Br: 0.6, I: 0.66, S: 0.56, P: 0.56, Na: 0.6, K: 0.68, Mg: 0.56, Ca: 0.62, Al: 0.56, Fe: 0.56, Cu: 0.56, Zn: 0.56, Ag: 0.6 };
const radio = s => RADIO[s] || 0.5;

/* ---------- texturas hechas con un lienzo ---------- */
const texLetra = {};
function letra(s) {
  if (texLetra[s]) return texLetra[s];
  const e = Q.ELEM[s], c = document.createElement('canvas'); c.width = c.height = 128; const x = c.getContext('2d');
  x.font = '800 ' + (s.length > 1 ? 70 : 84) + 'px "Baloo 2","Lexend",system-ui,sans-serif'; x.textAlign = 'center'; x.textBaseline = 'middle';
  x.lineJoin = 'round'; x.lineWidth = 14; x.strokeStyle = e.tinta === '#ffffff' ? '#15304d' : '#ffffff'; x.strokeText(s, 64, 70);
  x.fillStyle = e.tinta; x.fillText(s, 64, 70);
  const t = new T.CanvasTexture(c); t.encoding = T.sRGBEncoding; return (texLetra[s] = t);
}
let texAro = null, texBrillo = null, texSombra = null;
function aro() {
  if (texAro) return texAro;
  const c = document.createElement('canvas'); c.width = c.height = 128; const x = c.getContext('2d');
  x.lineWidth = 12; x.strokeStyle = '#ffd43b'; x.beginPath(); x.arc(64, 64, 52, 0, 7); x.stroke();
  x.lineWidth = 4; x.strokeStyle = '#15304d'; x.beginPath(); x.arc(64, 64, 59, 0, 7); x.stroke(); x.beginPath(); x.arc(64, 64, 45, 0, 7); x.stroke();
  return (texAro = new T.CanvasTexture(c));
}
function brillo() {
  if (texBrillo) return texBrillo;
  const c = document.createElement('canvas'); c.width = c.height = 64; const x = c.getContext('2d');
  const g = x.createRadialGradient(32, 32, 2, 32, 32, 32); g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(0.4, 'rgba(255,255,220,.6)'); g.addColorStop(1, 'rgba(255,255,200,0)');
  x.fillStyle = g; x.fillRect(0, 0, 64, 64); return (texBrillo = new T.CanvasTexture(c));
}
function sombra() {
  if (texSombra) return texSombra;
  const c = document.createElement('canvas'); c.width = c.height = 64; const x = c.getContext('2d');
  const g = x.createRadialGradient(32, 32, 2, 32, 32, 32); g.addColorStop(0, 'rgba(10,40,60,.45)'); g.addColorStop(1, 'rgba(10,40,60,0)');
  x.fillStyle = g; x.fillRect(0, 0, 64, 64); return (texSombra = new T.CanvasTexture(c));
}
function baldosas(a, b, n) {
  const c = document.createElement('canvas'); c.width = c.height = 256; const x = c.getContext('2d');
  x.fillStyle = '#b9d6d0'; x.fillRect(0, 0, 256, 256);
  const k = 256 / n;
  for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) { x.fillStyle = (i + j) % 2 ? a : b; x.fillRect(i * k + 3, j * k + 3, k - 6, k - 6); }
  const t = new T.CanvasTexture(c); t.wrapS = t.wrapT = T.RepeatWrapping; t.encoding = T.sRGBEncoding; return t;
}

/* ---------- materiales de los átomos (compartidos) ---------- */
const matAt = {}, matPalo = {};
const matAtomo = s => matAt[s] || (matAt[s] = new T.MeshStandardMaterial({ color: Q.ELEM[s].color, roughness: 0.32, metalness: 0.05, emissive: '#000000' }));
const matPaloDe = s => matPalo[s] || (matPalo[s] = new T.MeshStandardMaterial({ color: new T.Color(Q.ELEM[s].color).lerp(new T.Color('#ffffff'), 0.15), roughness: 0.45 }));
const GEO_BOLA = new T.SphereGeometry(1, 22, 16), GEO_PALO = new T.CylinderGeometry(1, 1, 1, 10), GEO_PERILLA = new T.SphereGeometry(1, 10, 8);
const matMuesca = new T.MeshStandardMaterial({ color: '#4d5b6b', roughness: 0.5 }), matPerilla = new T.MeshStandardMaterial({ color: '#ffe066', emissive: '#7a5b00', emissiveIntensity: 0.35, roughness: 0.3 });
const matPar = new T.MeshStandardMaterial({ color: '#b197fc', transparent: true, opacity: 0.42, roughness: 0.3, depthWrite: false });
const matOjo = new T.MeshStandardMaterial({ color: '#ffffff', roughness: 0.2 }), matPupila = new T.MeshBasicMaterial({ color: '#111827' });

const Y = new V3(0, 1, 0);
function orientar(m, a, b, r) {
  const d = new V3().subVectors(b, a), L = d.length();
  m.position.copy(a).addScaledVector(d, 0.5);
  m.scale.set(r, Math.max(0.001, L), r);
  if (L > 1e-6) m.quaternion.setFromUnitVectors(Y, d.divideScalar(L));
}

/* la pose para mirarla: lo más largo a lo ancho, su plano de frente y el átomo del centro arriba (el agua en V) */
function ejes(ps) {
  const n = ps.length, c = [0, 0, 0]; ps.forEach(p => { c[0] += p[0] / n; c[1] += p[1] / n; c[2] += p[2] / n; });
  const A = [[0, 0, 0], [0, 0, 0], [0, 0, 0]];
  ps.forEach(p => { const d = [p[0] - c[0], p[1] - c[1], p[2] - c[2]]; for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) A[i][j] += d[i] * d[j]; });
  // Jacobi: los vectores propios de la matriz de covarianza (3 × 3, simétrica)
  const V = [[1, 0, 0], [0, 1, 0], [0, 0, 1]];
  for (let it = 0; it < 30; it++) {
    let p = 0, q = 1; if (Math.abs(A[0][2]) > Math.abs(A[p][q])) { p = 0; q = 2; } if (Math.abs(A[1][2]) > Math.abs(A[p][q])) { p = 1; q = 2; }
    if (Math.abs(A[p][q]) < 1e-10) break;
    const th = 0.5 * Math.atan2(2 * A[p][q], A[q][q] - A[p][p]), co = Math.cos(th), si = Math.sin(th);
    for (let k = 0; k < 3; k++) { const a = A[k][p], b = A[k][q]; A[k][p] = co * a - si * b; A[k][q] = si * a + co * b; }
    for (let k = 0; k < 3; k++) { const a = A[p][k], b = A[q][k]; A[p][k] = co * a - si * b; A[q][k] = si * a + co * b; }
    for (let k = 0; k < 3; k++) { const a = V[k][p], b = V[k][q]; V[k][p] = co * a - si * b; V[k][q] = si * a + co * b; }
  }
  const orden = [0, 1, 2].sort((i, j) => A[j][j] - A[i][i]);
  return orden.map(i => new V3(V[0][i], V[1][i], V[2][i]));
}
function posar(d, centro) {
  if (d.pos.length < 2) return d;
  const [e1, e2] = ejes(d.pos); const e3 = new V3().crossVectors(e1, e2);
  const m = new T.Matrix4().makeBasis(e1, e2, e3).invert();
  const rot = a => { const v = new V3(...a).applyMatrix4(m); return [v.x, v.y, v.z]; };
  let pos = d.pos.map(rot), br = d.brazos.map(l => (l || []).map(rot)), pa = d.pares.map(l => (l || []).map(rot));
  // el centro (o lo que tiene pares libres) arriba
  const n = pos.length, cy = pos.reduce((s, p) => s + p[1], 0) / n;
  const sube = centro >= 0 ? pos[centro][1] - cy + (pa[centro] || []).reduce((s, x) => s + x[1], 0) * 0.3 : 0;
  if (sube < -1e-6) { const f = a => [a[0], -a[1], -a[2]]; pos = pos.map(f); br = br.map(l => l.map(f)); pa = pa.map(l => l.map(f)); }
  return { pos, brazos: br, pares: pa };
}

/* ---------- una molécula viva: se reconstruye al cambiar el grafo, se mueve con suavidad ---------- */
function Molecula(padre, opc) {
  opc = opc || {};
  const raiz = new T.Group(), giro = new T.Group(), cuerpo = new T.Group();
  raiz.add(giro); giro.add(cuerpo); padre.add(raiz);
  let g = { sim: [], enl: [], ids: [] }, at = [], palos = [], muescas = [], paresM = [], ojos = null;
  const posAct = {}, posObj = {}; // por id de átomo: dónde está y a dónde va
  let vivoT = 0, escala = 1, escalaObj = 1, vivo = 0, rebote = 0, sel = -1, destinos = new Set(), conPares = false, fantasma = !!opc.fantasma;
  const halo = new T.Sprite(new T.SpriteMaterial({ map: aro(), transparent: true, depthTest: false, depthWrite: false })); halo.visible = false; halo.renderOrder = 5; cuerpo.add(halo);
  const sombraM = new T.Mesh(new T.PlaneGeometry(1, 1), new T.MeshBasicMaterial({ map: sombra(), transparent: true, depthWrite: false }));
  sombraM.rotation.x = -Math.PI / 2; sombraM.scale.setScalar(3.4); if (!fantasma && opc.suelo != null) { sombraM.position.y = opc.suelo; padre.add(sombraM); }
  function material(m) { if (!fantasma) return m; const c = m.clone(); c.transparent = true; c.opacity = 0.75; return c; }
  function limpiar() {
    [...at.map(a => a.bola), ...at.map(a => a.letra), ...palos.flat(), ...muescas.flat(), ...paresM.flat()].forEach(o => { if (o) cuerpo.remove(o); });
    if (ojos) { cuerpo.remove(ojos.g); ojos = null; }
    at = []; palos = []; muescas = []; paresM = [];
  }
  /** g: {sim, enl, ids?}; o: {raiz, estable, pares, sel, destinos: Set de índices, radioZona} */
  function poner(g2, o) {
    o = o || {};
    limpiar();
    g = { sim: g2.sim.slice(), enl: g2.enl.map(e => e.slice()), ids: (g2.ids || g2.sim.map((s, i) => i)).slice() };
    const n = g.sim.length;
    if (!n) { sombraM.visible = false; halo.visible = false; return; }
    let d = Q.disponer(g, o.raiz != null ? o.raiz : 0, !!o.estable);
    if (o.pose) d = posar(d, o.raiz != null ? o.raiz : 0);
    // centrar
    const c = [0, 0, 0]; d.pos.forEach(p => { c[0] += p[0] / n; c[1] += p[1] / n; c[2] += p[2] / n; });
    let r = 0;
    d.pos.forEach((p, i) => {
      const v = new V3(p[0] - c[0], p[1] - c[1], p[2] - c[2]);
      r = Math.max(r, v.length() + radio(g.sim[i]));
      const id = g.ids[i];
      posObj[id] = v;
      if (!posAct[id]) {
        // un átomo nuevo sale de su vecino (o del centro)
        const e = g.enl.find(x => x[0] === i || x[1] === i), vec = e ? (e[0] === i ? e[1] : e[0]) : -1;
        posAct[id] = vec >= 0 && posAct[g.ids[vec]] ? posAct[g.ids[vec]].clone() : v.clone();
      }
    });
    Object.keys(posAct).forEach(k => { if (g.ids.indexOf(+k) < 0) { delete posAct[k]; delete posObj[k]; } });
    const zona = o.radioZona || opc.radioZona || 1.9;
    escalaObj = Math.min(opc.max || 1.25, zona / Math.max(1.05, r));
    conPares = !!o.pares; sel = o.sel != null ? o.sel : -1; destinos = o.destinos || new Set();
    // átomos
    g.sim.forEach((s, i) => {
      const bola = new T.Mesh(GEO_BOLA, fantasma ? material(matAtomo(s)) : destinos.has(i) ? matAtomo(s).clone() : matAtomo(s));
      bola.scale.setScalar(radio(s)); cuerpo.add(bola);
      let le = null;
      if (!fantasma) { le = new T.Sprite(new T.SpriteMaterial({ map: letra(s), transparent: true, depthWrite: false })); le.scale.setScalar(radio(s) * (s.length > 1 ? 1.5 : 1.35)); le.renderOrder = 2; cuerpo.add(le); }
      at.push({ bola, letra: le, s, id: g.ids[i], r: radio(s) });
    });
    // enlaces: medio palo de cada color; el doble y el triple, palos paralelos
    g.enl.forEach(e => { const ps = []; for (let k = 0; k < e[2] * 2; k++) { const m = new T.Mesh(GEO_PALO, material(matPaloDe(g.sim[k % 2 ? e[1] : e[0]]))); cuerpo.add(m); ps.push(m); } palos.push(ps); });
    // brazos libres (muescas) y pares libres
    muescas = d.brazos.map((ds, i) => (fantasma ? [] : (ds || []).map(dir => {
      const gr = new T.Group(), p = new T.Mesh(GEO_PALO, matMuesca), k = new T.Mesh(GEO_PERILLA, matPerilla);
      gr.add(p, k); gr.userData = { dir: new V3(...dir), p, k }; cuerpo.add(gr); return gr;
    })));
    paresM = d.pares.map((ds, i) => (fantasma || !conPares || Q.vecinos(g, i).length < 1 || g.sim[i] === 'H' ? [] : (ds || []).map(dir => {
      const m = new T.Mesh(GEO_BOLA, matPar); m.userData = { dir: new V3(...dir) }; cuerpo.add(m); return m;
    })));
    halo.visible = sel >= 0 && !fantasma;
    sombraM.visible = !fantasma;
  }
  function vida(b, centro) {
    vivo = b ? 1 : 0; rebote = b ? 1 : 0; vivoT = 0; if (b) giro.rotation.y = 0;
    if (ojos) { cuerpo.remove(ojos.g); ojos = null; }
    if (b && !fantasma && at.length) {
      // los ojos van en el átomo del centro (el de más vecinos)
      let ci = centro != null && centro >= 0 ? centro : 0;
      if (centro == null || centro < 0) { let best = -1; g.sim.forEach((s, i) => { const v = Q.vecinos(g, i).length; if (v > best) { best = v; ci = i; } }); }
      const gg = new T.Group();
      const ojo = () => { const o = new T.Group(), bl = new T.Mesh(GEO_BOLA, matOjo), pu = new T.Mesh(GEO_BOLA, matPupila); bl.scale.setScalar(0.13); pu.scale.setScalar(0.065); pu.position.z = 0.1; o.add(bl, pu); return o; };
      const i1 = ojo(), i2 = ojo(); i1.position.set(-0.13, 0, 0); i2.position.set(0.13, 0, 0); gg.add(i1, i2); gg.scale.setScalar(0.75);
      cuerpo.add(gg); ojos = { g: gg, i: ci, parpadeo: 0 };
    }
  }
  const tmpA = new V3(), tmpB = new V3(), tmpC = new V3(), camLocal = new V3(), mInv = new T.Matrix4();
  function cuadro(dt, cam, calma, t) {
    const k = 1 - Math.pow(0.0008, dt);
    escala += (escalaObj - escala) * k;
    let rb = 0;
    if (rebote > 0 && !calma) { rebote = Math.max(0, rebote - dt * 0.9); rb = Math.sin((1 - rebote) * Math.PI * 4) * 0.08 * rebote; }
    raiz.scale.setScalar(escala * (1 + rb));
    if (vivo && !calma && opc.giraSolo !== false) { vivoT += dt; giro.rotation.y = Math.sin(vivoT * 0.9) * 0.75; }
    if (fantasma) giro.rotation.y += dt * 0.5;
    at.forEach(a => { const o = posObj[a.id], p = posAct[a.id]; if (o && p) p.lerp(o, k); });
    // la cámara en coordenadas del cuerpo, para poner las letras de frente
    cuerpo.updateMatrixWorld(true); mInv.copy(cuerpo.matrixWorld).invert();
    camLocal.copy(cam.position).applyMatrix4(mInv);
    at.forEach(a => {
      const p = posAct[a.id]; if (!p) return;
      a.bola.position.copy(p);
      if (a.letra) { tmpA.subVectors(camLocal, p).normalize(); a.letra.position.copy(p).addScaledVector(tmpA, a.r * 1.02); }
    });
    g.enl.forEach((e, j) => {
      const A = posAct[g.ids[e[0]]], B = posAct[g.ids[e[1]]]; if (!A || !B) return;
      const ps = palos[j], o = e[2], rr = o === 1 ? 0.12 : o === 2 ? 0.085 : 0.07;
      // la dirección para separar los palos paralelos: hacia la cámara × enlace (se ven siempre los dos o tres)
      tmpA.subVectors(B, A).normalize(); tmpB.subVectors(camLocal, A).normalize(); tmpC.crossVectors(tmpA, tmpB).normalize();
      const sep = o === 2 ? [-0.11, 0.11] : o === 3 ? [-0.16, 0, 0.16] : [0];
      sep.forEach((s, k) => {
        const a2 = A.clone().addScaledVector(tmpC, s), b2 = B.clone().addScaledVector(tmpC, s), m = a2.clone().lerp(b2, 0.5);
        orientar(ps[k * 2], a2, m, rr); orientar(ps[k * 2 + 1], m, b2, rr);
      });
    });
    muescas.forEach((ms, i) => ms.forEach(gr => {
      const p = posAct[g.ids[i]]; if (!p) return;
      const dir = gr.userData.dir, r = radio(g.sim[i]), pul = i === sel && !calma ? 1 + Math.sin(t * 6) * 0.12 : 1;
      const a = p.clone().addScaledVector(dir, r * 0.8), b = p.clone().addScaledVector(dir, r + 0.5 * pul);
      orientar(gr.userData.p, a, b, 0.08); gr.userData.k.position.copy(b); gr.userData.k.scale.setScalar(0.14 * pul);
      gr.position.set(0, 0, 0);
    }));
    paresM.forEach((ms, i) => ms.forEach(m => {
      const p = posAct[g.ids[i]]; if (!p) return;
      const dir = m.userData.dir, r = radio(g.sim[i]);
      m.position.copy(p).addScaledVector(dir, r + 0.16); m.scale.set(0.16, 0.3, 0.16); m.quaternion.setFromUnitVectors(Y, dir);
    }));
    if (sel >= 0 && at[sel]) {
      const a = at[sel]; halo.position.copy(posAct[a.id]); halo.scale.setScalar(a.r * 2.9 * (calma ? 1 : 1 + Math.sin(t * 5) * 0.05));
    }
    destinos.forEach(i => { const a = at[i]; if (a && a.bola.material !== matAtomo(a.s)) { a.bola.material.emissive.set('#ffd43b'); a.bola.material.emissiveIntensity = calma ? 0.35 : 0.25 + 0.25 * Math.sin(t * 5); } });
    if (ojos && at[ojos.i]) {
      const p = posAct[at[ojos.i].id], r = at[ojos.i].r;
      // los ojos arriba de la letra (la letra no se tapa nunca)
      tmpA.subVectors(camLocal, p).normalize(); tmpC.set(0, 1, 0).transformDirection(mInv);
      tmpA.addScaledVector(tmpC, 1.3).normalize();
      ojos.g.position.copy(p).addScaledVector(tmpA, r * 0.97);
      ojos.g.lookAt(cam.position);
      ojos.parpadeo -= dt; const cierra = ojos.parpadeo < 0.12 && ojos.parpadeo > 0;
      if (ojos.parpadeo < 0) ojos.parpadeo = 2.5 + Math.random() * 2;
      ojos.g.scale.set(0.75, cierra ? 0.1 : 0.75, 0.75);
    }
  }
  /** Las posiciones en pantalla de cada átomo (px): [{i, x, y, r, z}] */
  const pv = new V3(), pv2 = new V3(), der = new V3();
  function proyectar(cam, W, H) {
    der.setFromMatrixColumn(cam.matrixWorld, 0);
    return at.map((a, i) => {
      a.bola.getWorldPosition(pv);
      const rw = a.r * escala;
      pv2.copy(pv).addScaledVector(der, rw);
      const z = pv.distanceTo(cam.position);
      pv.project(cam); pv2.project(cam);
      const x = (pv.x + 1) / 2 * W, y = (1 - pv.y) / 2 * H, x2 = (pv2.x + 1) / 2 * W;
      return { i, x, y, r: Math.abs(x2 - x), z };
    });
  }
  function girar(dx, dy) { giro.rotation.y += dx; cuerpo.rotation.x = Math.max(-1.2, Math.min(1.2, cuerpo.rotation.x + (dy || 0))); }
  function reiniciarGiro() { giro.rotation.set(0, 0, 0); cuerpo.rotation.set(0, 0, 0); }
  /** La posición en el mundo del átomo i (para los vuelos de la reacción) */
  function mundo(i) { const a = at[i]; return a ? a.bola.getWorldPosition(new V3()) : null; }
  return { raiz, poner, vida, cuadro, proyectar, girar, reiniciarGiro, mundo, get n() { return at.length; }, get g() { return g; } };
}

/* ---------- una molécula quieta (en los platillos de la balanza): del catálogo o un racimo de átomos ---------- */
function estatica(formula) {
  const gr = new T.Group(), c = Q.leerFormula(formula) || {};
  const m = Q.MOLECULAS.find(x => Q.igualCuenta(x.cuenta, c) && x.id !== 'eter' && x.id !== 'isobutano');
  const pos = [], sim = [];
  if (m) {
    const d = Q.disponer(m.g, Q.centros(m.g)[0]);
    d.pos.forEach((p, i) => { pos.push(new V3(...p)); sim.push(m.g.sim[i]); });
    m.g.enl.forEach(e => {
      const A = pos[e[0]], B = pos[e[1]], o = e[2], dir = new V3().subVectors(B, A).normalize(), per = new V3(0, 0, 1).cross(dir).normalize();
      if (per.lengthSq() < 0.1) per.set(1, 0, 0);
      (o === 1 ? [0] : o === 2 ? [-0.1, 0.1] : [-0.14, 0, 0.14]).forEach(s => { const p = new T.Mesh(GEO_PALO, matPaloDe('C')); orientar(p, A.clone().addScaledVector(per, s), B.clone().addScaledVector(per, s), 0.08); gr.add(p); });
    });
  } else {
    // un racimo: los átomos juntitos (lo iónico y los metales)
    const lista = []; Object.keys(c).forEach(s => { for (let k = 0; k < c[s]; k++) lista.push(s); });
    const n = lista.length, oro = Math.PI * (3 - Math.sqrt(5));
    lista.forEach((s, i) => {
      if (n === 1) { pos.push(new V3()); sim.push(s); return; }
      const y = 1 - (i / (n - 1)) * 2, rr = Math.sqrt(1 - y * y), th = oro * i, R = 0.45 * Math.cbrt(n) + 0.2;
      pos.push(new V3(Math.cos(th) * rr * R, y * R * 0.8, Math.sin(th) * rr * R)); sim.push(s);
    });
  }
  const cen = new V3(); pos.forEach(p => cen.add(p)); cen.divideScalar(pos.length || 1);
  let r = 0.3;
  pos.forEach((p, i) => { p.sub(cen); r = Math.max(r, p.length() + radio(sim[i])); const b = new T.Mesh(GEO_BOLA, matAtomo(sim[i])); b.scale.setScalar(radio(sim[i])); b.position.copy(p); gr.add(b); });
  gr.children.forEach(ch => { if (ch.geometry === GEO_PALO) ch.position.sub(cen); });
  return { g: gr, radio: r, pos, sim };
}

/* ---------- los GLB de la Biblioteca (el cargador de Mi Finca y el Tambor) ---------- */
function cargarScript(src) { return new Promise((si, no) => { const s = document.createElement('script'); s.src = src; s.onload = si; s.onerror = () => no(new Error('no cargó ' + src)); document.head.appendChild(s); }); }
let cargador = null;
function loader() {
  if (cargador) return cargador;
  const J3 = window.Juegos3D || {}, cdn = 'https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/';
  const una = (f, dir, hay) => (hay() ? Promise.resolve() : (J3.enApp ? cargarScript('../' + f).then(() => { if (!hay()) throw new Error('vacío'); }) : Promise.reject(new Error('suelto'))).catch(() => cargarScript(cdn + dir + f)));
  return (cargador = una('GLTFLoader.js', 'loaders/', () => T.GLTFLoader).then(() => una('meshopt_decoder.js', 'libs/', () => window.MeshoptDecoder))
    .then(() => { const l = new T.GLTFLoader(); if (window.MeshoptDecoder) l.setMeshoptDecoder(window.MeshoptDecoder); l.setCrossOrigin('anonymous'); return l; }));
}

/* la caja de verdad de un modelo con esqueleto (la del Tambor): Box3.setFromObject no mira los huesos */
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

function crear(cont, o) {
  o = o || {};
  let calma = !!o.calma;
  const ren = new T.WebGLRenderer({ antialias: (window.devicePixelRatio || 1) < 2, powerPreference: 'high-performance' });
  ren.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5)); ren.outputEncoding = T.sRGBEncoding;
  cont.appendChild(ren.domElement);
  const scene = new T.Scene(), cam = new T.PerspectiveCamera(38, 1, 0.1, 80);
  scene.background = new T.Color('#cfe9e4');
  scene.add(new T.HemisphereLight('#ffffff', '#7aa39b', 0.75));
  const sol = new T.DirectionalLight('#fff4e0', 0.75); sol.position.set(4, 9, 7); scene.add(sol);
  const relleno = new T.DirectionalLight('#cfe3ff', 0.35); relleno.position.set(-6, 3, 5); scene.add(relleno);

  /* ---------- la sala ---------- */
  const sala = new T.Group(); scene.add(sala);
  const piso = new T.Mesh(new T.PlaneGeometry(40, 20), new T.MeshStandardMaterial({ map: (() => { const t = baldosas('#f1e3c8', '#e2cfa8', 4); t.repeat.set(10, 5); return t; })(), roughness: 0.9 }));
  piso.rotation.x = -Math.PI / 2; piso.position.z = 2; sala.add(piso);
  const pared = new T.Mesh(new T.PlaneGeometry(40, 14), new T.MeshStandardMaterial({ map: (() => { const t = baldosas('#e9f7f3', '#d8f0ea', 8); t.repeat.set(10, 3.5); return t; })(), roughness: 0.85 }));
  pared.position.set(0, 7, -3.2); sala.add(pared);
  // la ventana con el cielo y unas montañas
  const cielo = (() => { const c = document.createElement('canvas'); c.width = 256; c.height = 160; const x = c.getContext('2d'); const gr = x.createLinearGradient(0, 0, 0, 160); gr.addColorStop(0, '#74c0fc'); gr.addColorStop(1, '#e7f5ff'); x.fillStyle = gr; x.fillRect(0, 0, 256, 160);
    x.fillStyle = '#69db7c'; x.beginPath(); x.moveTo(0, 160); for (let i = 0; i <= 8; i++) x.lineTo(i * 32, 110 - Math.sin(i * 1.3) * 22 - (i % 2) * 10); x.lineTo(256, 160); x.fill();
    x.fillStyle = '#fff'; [[60, 40], [180, 30]].forEach(([a, b]) => { x.beginPath(); x.ellipse(a, b, 26, 10, 0, 0, 7); x.ellipse(a + 18, b - 6, 18, 9, 0, 0, 7); x.fill(); });
    const t = new T.CanvasTexture(c); t.encoding = T.sRGBEncoding; return t; })();
  const ventana = new T.Mesh(new T.PlaneGeometry(3.4, 2.2), new T.MeshBasicMaterial({ map: cielo })); ventana.position.set(-4.6, 4.4, -3.15); sala.add(ventana);
  [[0, 1.15, 3.7, 0.16], [0, -1.15, 3.7, 0.16], [-1.78, 0, 0.16, 2.46], [1.78, 0, 0.16, 2.46], [0, 0, 0.1, 2.3], [0, 0, 3.5, 0.1]].forEach(([x, y, w, h]) => { const m = caja(w, h, 0.12, '#ffffff'); m.position.set(-4.6 + x, 4.4 + y, -3.1); sala.add(m); });
  // las repisas con frascos de átomos (con su letra)
  const repisa = (x, y, w) => { const r = caja(w, 0.12, 0.7, '#a0693b'); r.position.set(x, y, -2.85); sala.add(r); return r; };
  repisa(3.9, 3.6, 4.4); repisa(3.9, 5.0, 4.4);
  ['H', 'C', 'N', 'O', 'Cl', 'S', 'P', 'F'].forEach((s, i) => {
    const fila = i < 4 ? 0 : 1, x = 2.15 + (i % 4) * 1.15, y = fila ? 5.06 : 3.66;
    const vid = cil(0.36, 0.36, 0.9, new T.MeshStandardMaterial({ color: '#e7f5ff', transparent: true, opacity: 0.35, roughness: 0.1 }), 16); vid.position.set(x, y + 0.45, -2.8); sala.add(vid);
    const tapa = cil(0.38, 0.38, 0.14, '#495057', 16); tapa.position.set(x, y + 0.95, -2.8); sala.add(tapa);
    for (let k = 0; k < 4; k++) { const b = new T.Mesh(GEO_BOLA, matAtomo(s)); b.scale.setScalar(0.15); b.position.set(x + (k % 2 ? 0.13 : -0.13), y + 0.16 + Math.floor(k / 2) * 0.27, -2.8 + (k === 1 || k === 2 ? 0.08 : -0.08)); sala.add(b); }
    const et = new T.Sprite(new T.SpriteMaterial({ map: letra(s) })); et.scale.setScalar(0.42); et.position.set(x, y + 0.5, -2.4); sala.add(et);
  });
  // lámparas colgantes
  [-2.6, 2.6].forEach(x => { const cable = cil(0.02, 0.02, 2.2, '#343a40', 6); cable.position.set(x, 7.1, -0.6); sala.add(cable);
    const pan = cil(0.25, 0.75, 0.55, '#ff922b', 16); pan.position.set(x, 5.8, -0.6); sala.add(pan);
    const bom = new T.Mesh(new T.SphereGeometry(0.2, 12, 8), new T.MeshBasicMaterial({ color: '#fff3bf' })); bom.position.set(x, 5.5, -0.6); sala.add(bom); });
  // el mesón: gabinetes y la cubierta
  const meson = new T.Group(); sala.add(meson);
  const gab = caja(13, 1.0, 2.2, '#1c7c74'); gab.position.set(0, 0.5, -0.6); meson.add(gab);
  for (let i = -3; i <= 3; i++) { const pu = caja(1.7, 0.75, 0.04, '#23958b'); pu.position.set(i * 1.85, 0.52, 0.52); meson.add(pu); const ma = caja(0.4, 0.07, 0.07, '#e9ecef'); ma.position.set(i * 1.85, 0.75, 0.56); meson.add(ma); }
  const cub = caja(13.3, 0.18, 2.45, '#f8f9fa'); cub.position.set(0, 1.09, -0.6); meson.add(cub);
  const borde = caja(13.3, 0.06, 0.08, '#ced4da'); borde.position.set(0, 1.0, 0.64); meson.add(borde);
  // a la izquierda: el matraz que burbujea y la olla sobre el fogón (la cocina)
  const matraz = new T.Group(); matraz.position.set(-3.4, 1.18, -0.9); meson.add(matraz);
  const vidrio = new T.MeshStandardMaterial({ color: '#e7f5ff', transparent: true, opacity: 0.35, roughness: 0.05 });
  const bulbo = new T.Mesh(new T.SphereGeometry(0.55, 16, 12), vidrio); bulbo.position.y = 0.5; matraz.add(bulbo);
  const liq = new T.Mesh(new T.SphereGeometry(0.5, 16, 12, 0, Math.PI * 2, Math.PI * 0.45, Math.PI * 0.55), new T.MeshStandardMaterial({ color: '#63e6be', transparent: true, opacity: 0.85, roughness: 0.2 })); liq.position.y = 0.5; matraz.add(liq);
  const cuello = cil(0.14, 0.16, 0.7, vidrio, 12); cuello.position.y = 1.25; matraz.add(cuello);
  const burbujas = [];
  for (let i = 0; i < 6; i++) { const b = new T.Mesh(new T.SphereGeometry(0.06, 8, 6), new T.MeshBasicMaterial({ color: '#ffffff', transparent: true, opacity: 0.8 })); b.userData.t = i / 6; matraz.add(b); burbujas.push(b); }
  const fogon = caja(1.4, 0.12, 1.1, '#343a40'); fogon.position.set(-5.3, 1.24, -0.9); meson.add(fogon);
  const olla = cil(0.55, 0.5, 0.6, '#adb5bd', 18); olla.position.set(-5.3, 1.6, -0.9); meson.add(olla);
  const asa = caja(1.4, 0.08, 0.12, '#495057'); asa.position.set(-5.3, 1.8, -0.9); meson.add(asa);
  // la placa de trabajo: un disco con su aro que brilla
  const placa = new T.Group(); placa.position.set(0, 1.19, 0); meson.add(placa);
  const disco = cil(1.45, 1.55, 0.14, '#dee2e6', 32); placa.add(disco);
  const aroP = new T.Mesh(new T.TorusGeometry(1.35, 0.06, 8, 48), new T.MeshBasicMaterial({ color: '#3bc9db' })); aroP.rotation.x = Math.PI / 2; aroP.position.y = 0.08; placa.add(aroP);
  const luzP = new T.PointLight('#99e9f2', 0.5, 6); luzP.position.set(0, 1.4, 0.8); placa.add(luzP);

  /* ---------- la molécula y la fantasma ---------- */
  const CENTRO = new V3(0, 3.0, 0);
  const zonaMol = new T.Group(); zonaMol.position.copy(CENTRO); scene.add(zonaMol);
  const mol = Molecula(zonaMol, { radioZona: 1.9, suelo: 1.19 + 0.09 - CENTRO.y });
  const zonaFan = new T.Group(); zonaFan.position.set(2.6, 4.6, 0.3); scene.add(zonaFan);
  const fan = Molecula(zonaFan, { fantasma: true, radioZona: 0.75, max: 0.6 });
  const aroFan = new T.Mesh(new T.TorusGeometry(0.95, 0.04, 6, 40), new T.MeshBasicMaterial({ color: '#ffffff', transparent: true, opacity: 0.6 })); zonaFan.add(aroFan);
  // un fondo blanco detrás de la fantasma, para que se lea encima de las repisas
  const fondoFan = new T.Sprite(new T.SpriteMaterial({ map: (() => { const c = document.createElement('canvas'); c.width = c.height = 64; const x = c.getContext('2d'); x.fillStyle = 'rgba(255,255,255,.82)'; x.beginPath(); x.arc(32, 32, 29, 0, 7); x.fill(); x.lineWidth = 3; x.strokeStyle = '#15304d'; x.stroke(); return new T.CanvasTexture(c); })(), transparent: true, depthWrite: false }));
  fondoFan.scale.setScalar(1.75); fondoFan.position.z = -0.6; fondoFan.renderOrder = -1; zonaFan.add(fondoFan);
  zonaFan.visible = false;

  /* ---------- la balanza ---------- */
  const bal = new T.Group(); bal.position.set(0, 1.19, -0.2); bal.visible = false; scene.add(bal);
  const latón = M('#e8b04b', { roughness: 0.35, metalness: 0.35, flatShading: false });
  const pie = cil(0.9, 1.1, 0.25, latón, 20); pie.position.y = 0.12; bal.add(pie);
  const col = cil(0.14, 0.18, 2.6, latón, 12); col.position.y = 1.5; bal.add(col);
  const brazo = new T.Group(); brazo.position.y = 2.8; bal.add(brazo);
  const viga = caja(5.6, 0.16, 0.22, latón); brazo.add(viga);
  const fiel = new T.Mesh(new T.ConeGeometry(0.12, 0.7, 10), M('#c92a2a')); fiel.position.y = 0.42; brazo.add(fiel);
  const pivote = new T.Mesh(new T.SphereGeometry(0.2, 14, 10), latón); brazo.add(pivote);
  const platos = [-1, 1].map(lado => {
    const gr = new T.Group(); bal.add(gr);
    const plato = cil(1.25, 1.05, 0.1, latón, 28); plato.position.y = -1.7; gr.add(plato);
    const fondo = cil(1.15, 1.15, 0.02, M(lado < 0 ? '#d0ebff' : '#ffe8cc'), 28); fondo.position.y = -1.64; gr.add(fondo);
    [0.5, 2.6, 4.7].forEach(a => { const h = new T.Mesh(GEO_PALO, M('#868e96')); orientar(h, new V3(0, 0, 0), new V3(Math.cos(a) * 1.1, -1.66, Math.sin(a) * 1.1), 0.022); gr.add(h); });
    const carga = new T.Group(); carga.position.y = -1.6; gr.add(carga);
    return { gr, lado, carga, items: [] };
  });
  let incl = 0, inclObj = 0;
  function cargarPlato(pl, especies) {
    while (pl.carga.children.length) pl.carga.remove(pl.carga.children[0]);
    pl.items = [];
    const todos = []; especies.forEach((e, k) => { for (let i = 0; i < Math.min(e.coef, 16); i++) todos.push({ f: e.f, k }); });
    const n = todos.length; if (!n) return;
    const cols = Math.min(4, Math.ceil(Math.sqrt(n))), filas = Math.min(3, Math.ceil(n / cols)), porCapa = cols * filas, celda = 2.1 / Math.max(cols, filas);
    todos.forEach((t, i) => {
      const s = estatica(t.f), capa = Math.floor(i / porCapa), j = i % porCapa, cx = j % cols, cz = Math.floor(j / cols);
      const k = Math.min(0.62, celda * 0.5 / s.radio);
      s.g.scale.setScalar(k);
      s.g.position.set((cx - (cols - 1) / 2) * celda, s.radio * k + capa * celda * 0.8 + 0.02, (cz - (filas - 1) / 2) * celda * 0.85);
      s.g.rotation.y = (i * 1.7) % 6.28;
      pl.carga.add(s.g); pl.items.push({ s, k: t.k });
    });
  }
  /** lados: {izq: [{f, coef}], der: [...]}; inclinación por la masa (u) */
  function balanza(lados) {
    if (!lados) { bal.visible = false; zonaMol.visible = true; placa.visible = true; return; }
    bal.visible = true; zonaMol.visible = false; placa.visible = false; zonaFan.visible = false;
    cargarPlato(platos[0], lados.izq); cargarPlato(platos[1], lados.der);
    const mi = lados.izq.reduce((m, e) => m + Q.masa(Q.leerFormula(e.f)) * e.coef, 0), md = lados.der.reduce((m, e) => m + Q.masa(Q.leerFormula(e.f)) * e.coef, 0);
    const dif = (md - mi) / Math.max(1, Math.max(mi, md));
    inclObj = Math.max(-0.32, Math.min(0.32, -dif * 0.9)); // el lado que pesa más baja
    if (Math.abs(md - mi) < 1e-6) inclObj = 0;
  }
  // el vuelo de los átomos al reaccionar: de cada molécula de la izquierda a un sitio del mismo elemento a la derecha
  let vuelos = [];
  function reaccionar(listo) {
    bal.updateMatrixWorld(true);
    const de = {}, a = {};
    platos[0].items.forEach(it => it.s.pos.forEach((p, i) => { (de[it.s.sim[i]] = de[it.s.sim[i]] || []).push(p.clone().applyMatrix4(it.s.g.matrixWorld)); }));
    platos[1].items.forEach(it => it.s.pos.forEach((p, i) => { (a[it.s.sim[i]] = a[it.s.sim[i]] || []).push(p.clone().applyMatrix4(it.s.g.matrixWorld)); }));
    vuelos.forEach(v => scene.remove(v.m)); vuelos = [];
    Object.keys(de).forEach(s => (de[s] || []).forEach((p, i) => {
      const q = (a[s] || [])[i]; if (!q) return;
      const m = new T.Mesh(GEO_BOLA, matAtomo(s)); m.scale.setScalar(radio(s) * 0.4); m.position.copy(p); scene.add(m);
      vuelos.push({ m, a: p, b: q, t: -Math.random() * 0.4 });
    }));
    platos[1].items.forEach(it => { it.s.g.visible = false; });
    setTimeout(() => { platos[1].items.forEach(it => { it.s.g.visible = true; }); vuelos.forEach(v => scene.remove(v.m)); vuelos = []; destellar(new V3(2.8, 2.2, -0.2)); if (listo) listo(); }, calma ? 300 : 1900);
  }

  /* ---------- chispas al acertar ---------- */
  const chispas = [];
  function destellar(p, n) {
    if (calma) return;
    for (let i = 0; i < (n || 26); i++) {
      const s = new T.Sprite(new T.SpriteMaterial({ map: brillo(), color: ['#ffd43b', '#63e6be', '#ff8787', '#74c0fc', '#ffffff'][i % 5], transparent: true, depthWrite: false, blending: T.AdditiveBlending }));
      s.position.copy(p); s.scale.setScalar(0.35); scene.add(s);
      const v = new V3(Math.random() - 0.5, Math.random() * 0.9 + 0.3, Math.random() - 0.5).normalize().multiplyScalar(2.5 + Math.random() * 2.5);
      chispas.push({ s, v, t: 0 });
    }
  }

  /* ---------- el ayudante ---------- */
  const ayud = { obj: null, mezcla: null, acc: {}, actual: null, id: '' };
  const glb = {};
  function cargar(id) {
    return glb[id] || (glb[id] = loader().then(l => new Promise((si, no) => {
      const t = setTimeout(() => no(new Error('tardó')), 30000);
      l.load(o.biblio + 'modelos/' + id + '.glb', g => { clearTimeout(t); si(g); }, undefined, e => { clearTimeout(t); no(e instanceof Error ? e : new Error('no cargó')); });
    })).catch(e => { console.warn('Átomo: sin ' + id + ' (' + e.message + ')'); return null; }));
  }
  function ayudante(id) {
    if (ayud.id === id) return; ayud.id = id;
    if (ayud.obj) { scene.remove(ayud.obj); ayud.obj = null; ayud.mezcla = null; ayud.acc = {}; ayud.actual = null; }
    if (!o.biblio) return;
    cargar(id).then(g => {
      if (!g || ayud.id !== id) return;
      const s = g.scene; s.traverse(m => { if (m.isSkinnedMesh) m.frustumCulled = false; });
      const bx = cajaReal(s), alto = bx.max.y - bx.min.y || 1, k = (id === 'robot' ? 3.7 : 3.0) / alto;
      const env = new T.Group(), dentro = new T.Group(); dentro.add(s);
      s.position.set(-(bx.min.x + bx.max.x) / 2, -bx.min.y, -(bx.min.z + bx.max.z) / 2);
      dentro.scale.setScalar(k); env.add(dentro);
      env.position.set(4.5, 0, -2.3); env.rotation.y = -0.45; scene.add(env); ayud.obj = env;
      if (g.animations && g.animations.length) {
        ayud.mezcla = new T.AnimationMixer(s);
        g.animations.forEach(c => { ayud.acc[String(c.name).toLowerCase()] = ayud.mezcla.clipAction(c); });
        animar('quieto');
      }
    });
  }
  const ALIAS = { quieto: ['quieto', 'idle'], bien: ['hechizo', 'victory', 'dance', 'laugh'], hola: ['lanzar', 'wave', 'talk'], mal: ['pegado', 'talk', 'defeat'] };
  function animar(que) {
    if (!ayud.mezcla) return;
    const nombre = (ALIAS[que] || [que]).find(n => ayud.acc[n]); if (!nombre) return;
    const a = ayud.acc[nombre], una = que !== 'quieto';
    a.reset(); a.setLoop(una ? T.LoopOnce : T.LoopRepeat, una ? 1 : Infinity); a.clampWhenFinished = una;
    if (ayud.actual && ayud.actual !== a) a.crossFadeFrom(ayud.actual, 0.25, false);
    a.timeScale = que === 'quieto' ? 1 : ayud.id === 'robot' ? 1.8 : 1.2;
    a.play(); ayud.actual = a;
    if (una) { const fin = e => { if (e.action === a) { ayud.mezcla.removeEventListener('finished', fin); if (ayud.actual === a) animar('quieto'); } }; ayud.mezcla.addEventListener('finished', fin); }
  }
  ayudante(o.ayudante || 'robot');

  /* ---------- el encuadre: la zona de trabajo cabe entre la carta de arriba y los botones de abajo ---------- */
  let W = 1, H = 1, ins = { arriba: 0, abajo: 0, izq: 0, der: 0 }, modoBal = false;
  function encuadrar() {
    // la mitad de lo ancho y de lo alto que tiene que caber (en unidades de la escena), y su centro
    const hx = modoBal ? 4.3 : 2.3, hy = modoBal ? 1.85 : 2.3, centro = modoBal ? new V3(0, 2.75, -0.2) : CENTRO.clone().add(new V3(0, -0.15, 0));
    const hAv = Math.max(80, H - ins.arriba - ins.abajo), wAv = Math.max(80, W - ins.izq - ins.der);
    const tan = Math.tan(T.MathUtils.degToRad(cam.fov / 2)), asp = W / H;
    const d = Math.max(hy / (0.92 * tan * hAv / H), hx / (0.92 * tan * asp * wAv / W), 7);
    const dir = new V3(0, 0.22, 1).normalize();
    cam.position.copy(centro).addScaledVector(dir, d); cam.lookAt(centro);
    // el centro de la zona libre en la pantalla
    const yc = ins.arriba + hAv / 2, xc = ins.izq + wAv / 2;
    cam.setViewOffset(W, H, W / 2 - xc, H / 2 - yc, W, H);
    cam.updateProjectionMatrix();
    // la fantasma, arriba a la derecha de la zona libre
    const hh = d * tan * hAv / H, hw = d * tan * asp * wAv / W;
    zonaFan.position.set(Math.max(1.1, Math.min(2.7, hw - 1.15)), CENTRO.y + Math.max(0.6, Math.min(1.7, hh - 1.05)), 0.3);
  }
  function tam(w, h, insets) {
    W = Math.max(1, w); H = Math.max(1, h); if (insets) ins = Object.assign(ins, insets);
    ren.setSize(W, H, false); ren.domElement.style.width = W + 'px'; ren.domElement.style.height = H + 'px';
    cam.aspect = W / H; encuadrar();
  }

  /* ---------- el bucle ---------- */
  let tAnt = performance.now(), t = 0, alCuadro = null, vivoBucle = true;
  function bucle(ahora) {
    if (!vivoBucle) return;
    requestAnimationFrame(bucle);
    const dt = Math.min(0.05, (ahora - tAnt) / 1000); tAnt = ahora; t += dt;
    mol.cuadro(dt, cam, calma, t); if (zonaFan.visible) fan.cuadro(dt, cam, calma, t);
    if (!calma) aroFan.rotation.z += dt * 0.4;
    aroP.material.color.setHSL(0.52, 0.7, 0.55 + (calma ? 0 : Math.sin(t * 2) * 0.08));
    burbujas.forEach(b => { b.userData.t = (b.userData.t + dt * (calma ? 0.12 : 0.35)) % 1; const u = b.userData.t; b.position.set(Math.sin(u * 9 + b.id) * 0.15, 0.35 + u * 1.3, Math.cos(u * 7) * 0.1); b.material.opacity = 0.8 * (1 - u); });
    if (bal.visible) {
      incl += (inclObj - incl) * (1 - Math.pow(0.02, dt));
      brazo.rotation.z = incl;
      platos.forEach(pl => { const x = pl.lado * 2.6; pl.gr.position.set(Math.cos(incl) * x, 2.8 + Math.sin(incl) * x, 0); });
    }
    vuelos.forEach(v => { v.t += dt / 1.4; const u = Math.max(0, Math.min(1, v.t)), e = u * u * (3 - 2 * u); v.m.position.lerpVectors(v.a, v.b, e); v.m.position.y += Math.sin(e * Math.PI) * 1.6; });
    for (let i = chispas.length - 1; i >= 0; i--) { const c = chispas[i]; c.t += dt; c.v.y -= dt * 4; c.s.position.addScaledVector(c.v, dt); c.s.material.opacity = Math.max(0, 1 - c.t / 1.1); if (c.t > 1.1) { scene.remove(c.s); chispas.splice(i, 1); } }
    if (ayud.mezcla) ayud.mezcla.update(dt);
    ren.render(scene, cam);
    if (alCuadro) alCuadro(dt);
  }
  requestAnimationFrame(bucle);

  return {
    tam,
    mol, fan,
    fantasma(g) { if (!g) { zonaFan.visible = false; return; } zonaFan.visible = true; fan.poner(g, { raiz: Q.centros(g)[0], pose: true }); },
    balanza(l) { modoBal = !!l; balanza(l); encuadrar(); },
    reaccionar,
    celebrar() { animar('bien'); destellar(CENTRO.clone(), 30); },
    hola() { animar('hola'); },
    triste() { animar('mal'); },
    ayudante,
    calma(b) { calma = !!b; },
    proyectar() { return mol.proyectar(cam, W, H); },
    alCuadro(f) { alCuadro = f; },
    get canvas() { return ren.domElement; },
    get anim() { const a = ayud.actual; return a ? Object.keys(ayud.acc).find(k => ayud.acc[k] === a) + ' ' + a.time.toFixed(2) + '/' + a.getClip().duration.toFixed(2) + ' w' + a.getEffectiveWeight().toFixed(2) : ''; }
  };
}

window.AtomoLab = { disponible: true, crear };
})();
