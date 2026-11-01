/* Mi Finca — el mundo 3D (three r128): la finca low-poly al sol, con las parcelas (maíz y mango), el corral con los
   animales (GLB de la Biblioteca: vaca, gallina, cerdo, oveja… con respaldo de cajitas si no cargan), el establo, el
   mercado del pueblo y el granjero (niño o niña de la Biblioteca), que camina hasta lo que se toca.
   - Los animales miran a la cámara: CARA (los grados que le ponen la cara de frente a cada GLB, medidos para la vitrina
     de la Biblioteca, app2 escenas/vitrina.ts) más LADOS (35°, −35°, 0° según su puesto: nunca todos iguales).
   - Cada cosa tiene una caja invisible para tocarla y un punto en pantalla para su etiqueta (la pone juego.js).
   - Modo calma: sin vaivén, sin saltos y el granjero aparece donde va en vez de caminar.
   window.FincaMundo = { disponible, crear(contenedor, {biblio, calma, granjero}) } */
(function () {
'use strict';
const T = window.THREE;
const disponible = (() => { try { const c = document.createElement('canvas'); return !!(T && (c.getContext('webgl2') || c.getContext('webgl'))); } catch (e) { return false; } })();
if (!disponible) { window.FincaMundo = { disponible: false }; return; }

const V3 = T.Vector3, D = Math.PI / 180;
const C = h => new T.Color(h).convertSRGBToLinear();
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const lerp = (a, b, t) => a + (b - a) * t;

// La cara de cada GLB (grados alrededor de y; la misma tabla CARA de vitrina.ts) y el corrimiento por puesto (LADOS).
const CARA = { buey: -90, burro: -90, caballo: -90, cordero: -90, gallo: -90, oveja: -90, pato: -90, toro: -90, cabra: -100, cerdo: -100, chivo: -100, conejo: -100,
  perro: -15, gato: 25, vaca: 30, gallina: 5, pollito: -20 };
const LADOS = [35, -35, 0];
// alto en la finca (m) y color del respaldo
const MODELOS = {
  vaca: [1.6, '#f1ece2'], gallina: [0.8, '#f4f1ea'], gallo: [0.85, '#c0392b'], pollito: [0.45, '#ffd43b'], cerdo: [0.95, '#f4a6b8'], oveja: [1.1, '#f8f9fa'],
  cabra: [1, '#d9c8a9'], caballo: [1.8, '#8d5a2b'], burro: [1.35, '#9c948a'], pato: [0.65, '#fff'], perro: [0.8, '#b07a43'], gato: [0.6, '#f08c00'],
  conejo: [0.55, '#e9ecef'], toro: [1.6, '#3b2a1e'], cordero: [0.7, '#fff'], buey: [1.6, '#7a5230'], establo: [3.2, '#b33b2e', 5.2], maiz: [1.35, '#5c940d'],
  mango: [0.2, '#f59f00'], banano: [0.5, '#ffd43b'], 'nino-ruana': [1.22, '#3b5bdb'], 'nina-gafas': [1.18, '#d6336c']
};

/* Dónde va cada cosa (x, z): las parcelas a la izquierda, el corral a la derecha, el mercado delante. */
const SITIO = {
  parcela0: [-6.3, -2.7], parcela1: [-3.5, -2.7], parcela2: [-6.3, 0.3], parcela3: [-3.5, 0.3],
  vaca: [6.3, -2.6], oveja: [3.5, -3.0], cerdo: [6.7, 0.4], gallina: [3.7, 0.0], gallina2: [4.8, 0.7], gallina3: [3.0, 1.1],
  mercado: [0.3, 2.6], establo: [5.4, -7.6]
};
const LIBRES = [[0.6, -3.4], [-1.5, -0.8], [1.6, -0.6], [-8.6, -4.6], [8.9, -2.2], [-8.7, 2.6], [8.8, 2.6], [-1.2, -5.2], [2.2, 2.9]];

function crear(cont, o) {
  o = o || {};
  let calma = !!o.calma;
  const ren = new T.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
  ren.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
  ren.outputEncoding = T.sRGBEncoding;
  ren.shadowMap.enabled = true; ren.shadowMap.type = T.PCFSoftShadowMap;
  cont.appendChild(ren.domElement);
  const scene = new T.Scene();
  const cam = new T.PerspectiveCamera(40, 1, 0.5, 400);
  scene.fog = new T.Fog(0xcfe8f5, 45, 130);

  /* ---------- cielo y luz (día y noche) ---------- */
  const cielo = new T.Mesh(new T.SphereGeometry(180, 24, 12), new T.MeshBasicMaterial({ vertexColors: true, side: T.BackSide, fog: false, depthWrite: false }));
  scene.add(cielo);
  const DIA = ['#3d8fdc', '#8cc8ee', '#e3f3fa'], NOCHE = ['#0b1033', '#1d2a5c', '#3a4677'];
  const _a = new T.Color(), _b = new T.Color();
  let noche = 0, nocheMeta = 0, nocheFin = null;
  function pintarCielo() {
    const k = [0, 1, 2].map(i => _a.set(DIA[i]).lerp(_b.set(NOCHE[i]), noche).clone().convertSRGBToLinear());
    const g = cielo.geometry, p = g.attributes.position, col = g.attributes.color ? g.attributes.color.array : new Float32Array(p.count * 3), x = new T.Color();
    for (let i = 0; i < p.count; i++) {
      const e = Math.asin(clamp(p.getY(i) / 180, -1, 1));
      if (e <= 0.03) x.copy(k[2]); else if (e < 0.25) x.copy(k[2]).lerp(k[1], (e - 0.03) / 0.22); else x.copy(k[1]).lerp(k[0], Math.min(1, (e - 0.25) / 0.6));
      col[i * 3] = x.r; col[i * 3 + 1] = x.g; col[i * 3 + 2] = x.b;
    }
    if (!g.attributes.color) g.setAttribute('color', new T.BufferAttribute(col, 3)); else g.attributes.color.needsUpdate = true;
    scene.fog.color.copy(k[2]);
    hemi.intensity = lerp(0.75, 0.22, noche); sol.intensity = lerp(1.05, 0.12, noche);
    sol.color.copy(_a.set('#fff1d6').lerp(_b.set('#8ea2ff'), noche));
    estrellas.material.opacity = noche; luna.material.opacity = noche;
    farol.intensity = noche * 1.4;
  }
  const hemi = new T.HemisphereLight(0xfff6e5, 0x6a9a50, 0.75); scene.add(hemi);
  const sol = new T.DirectionalLight(0xfff1d6, 1.05);
  sol.position.set(12, 22, 10); sol.castShadow = true;
  sol.shadow.mapSize.set(1024, 1024); sol.shadow.bias = -0.0008; sol.shadow.normalBias = 0.03;
  Object.assign(sol.shadow.camera, { left: -14, right: 14, top: 12, bottom: -12, near: 1, far: 60 });
  scene.add(sol, sol.target);
  const farol = new T.PointLight(0xffc56b, 0, 14, 1.6); farol.position.set(0, 3.1, 3.2); scene.add(farol);
  const estrellas = (() => {
    const n = 260, pos = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) { const a = Math.random() * Math.PI * 2, e = 0.15 + Math.random() * 1.2; pos[i * 3] = Math.cos(a) * Math.cos(e) * 170; pos[i * 3 + 1] = Math.sin(e) * 170; pos[i * 3 + 2] = Math.sin(a) * Math.cos(e) * 170; }
    const g = new T.BufferGeometry(); g.setAttribute('position', new T.BufferAttribute(pos, 3));
    const p = new T.Points(g, new T.PointsMaterial({ color: 0xffffff, size: 1.6, sizeAttenuation: false, transparent: true, opacity: 0, fog: false, depthWrite: false }));
    scene.add(p); return p;
  })();
  const luna = new T.Mesh(new T.CircleGeometry(6, 24), new T.MeshBasicMaterial({ color: 0xfff8d6, transparent: true, opacity: 0, fog: false, depthWrite: false }));
  luna.position.set(-60, 70, -120); luna.lookAt(0, 0, 0); scene.add(luna);

  /* ---------- materiales y piezas ---------- */
  const mats = {};
  const M = (c, x) => { const k = c + (x ? JSON.stringify(x) : ''); return mats[k] || (mats[k] = new T.MeshStandardMaterial(Object.assign({ color: C(c), flatShading: true, roughness: 0.9 }, x || {}))); };
  const caja = (w, h, d, c) => { const m = new T.Mesh(new T.BoxGeometry(w, h, d), M(c)); m.castShadow = m.receiveShadow = true; return m; };
  const tex = {};
  function emojiTex(t) {
    if (tex[t]) return tex[t];
    const c = document.createElement('canvas'); c.width = c.height = 128;
    const x = c.getContext('2d'); x.textAlign = 'center'; x.textBaseline = 'middle';
    x.font = '96px "Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif'; x.fillText(t, 64, 70);
    const tx = new T.CanvasTexture(c); tx.encoding = T.sRGBEncoding; return (tex[t] = tx);
  }
  function emoji(t, s, encima) {
    const sp = new T.Sprite(new T.SpriteMaterial({ map: emojiTex(t), transparent: true, depthTest: !encima, depthWrite: false }));
    sp.scale.set(s, s, 1); if (encima) sp.renderOrder = 10; return sp;
  }

  /* ---------- el terreno ---------- */
  const suelo = (() => {
    const g = new T.PlaneGeometry(140, 140, 70, 70); g.rotateX(-Math.PI / 2);
    const p = g.attributes.position, col = new Float32Array(p.count * 3), c = new T.Color();
    for (let i = 0; i < p.count; i++) {
      const x = p.getX(i), z = p.getZ(i), r = Math.hypot(x, z * 1.3);
      let y = r > 16 ? Math.pow((r - 16) / 10, 1.6) * (1.6 + Math.sin(x * 0.21) * 0.9 + Math.cos(z * 0.17) * 0.8) : 0;
      if (z < -30) y += (Math.sin(x * 0.08) * 0.5 + 0.7) * (-z - 30) * 0.45; // las montañas del fondo
      p.setY(i, Math.min(y, 30));
      c.set(y > 9 ? '#5f8f4e' : '#7fbf4d').lerp(_b.set('#9ccc5a'), (Math.sin(x * 1.3) * Math.cos(z * 1.1) + 1) * 0.18).convertSRGBToLinear();
      col[i * 3] = c.r; col[i * 3 + 1] = c.g; col[i * 3 + 2] = c.b;
    }
    g.setAttribute('color', new T.BufferAttribute(col, 3)); g.computeVertexNormals();
    const m = new T.Mesh(g, new T.MeshStandardMaterial({ vertexColors: true, flatShading: true, roughness: 1 }));
    m.receiveShadow = true; scene.add(m); return m;
  })();
  // los caminos de tierra
  const camino = (x, z, w, d, r) => { const m = new T.Mesh(new T.PlaneGeometry(w, d), M('#c9a66b')); m.rotation.x = -Math.PI / 2; m.rotation.z = r || 0; m.position.set(x, 0.015, z); m.receiveShadow = true; scene.add(m); };
  camino(0, 0.2, 2.2, 9.6); camino(-2.6, -1.2, 3.4, 1.4); camino(1.8, -0.6, 2.2, 1.4); camino(0, 5.5, 2.4, 5);
  // árboles alrededor (una geometría para todos)
  const tronco = new T.CylinderGeometry(0.16, 0.24, 1.4, 6), copa = new T.IcosahedronGeometry(1, 0);
  function arbol(x, z, s, verde) {
    const g = new T.Group(); const t = new T.Mesh(tronco, M('#7a4f2a')); t.position.y = 0.7; t.castShadow = true;
    const c = new T.Mesh(copa, M(verde || '#3f8f3a')); c.position.y = 1.9; c.scale.set(1.2, 1.05, 1.2); c.castShadow = true;
    g.add(t, c); g.position.set(x, 0, z); g.scale.setScalar(s); scene.add(g); return g;
  }
  [[-10.5, -6.5, 1.3], [-12, -1, 1.1], [-11, 4, 1.2], [10.8, -6, 1.2], [12, 0.5, 1], [11, 5, 1.3], [-6, -8.8, 1.1], [-2, -9.4, 1.4], [8.5, -9.2, 1.2], [-14, -8, 1.5], [14, -7, 1.4], [-7.5, 6.8, 1], [7.5, 7.2, 1.1]]
    .forEach(([x, z, s], i) => arbol(x, z, s, i % 3 ? '#3f8f3a' : '#2f7d32'));
  // flores sueltas
  for (let i = 0; i < 28; i++) {
    const a = Math.random() * Math.PI * 2, r = 9 + Math.random() * 5, f = new T.Mesh(new T.SphereGeometry(0.09, 5, 4), M(['#ffd43b', '#ff8787', '#f8f9fa', '#da77f2'][i % 4]));
    f.position.set(Math.cos(a) * r * 1.1, 0.12, Math.sin(a) * r * 0.75); scene.add(f);
  }
  // el corral: postes y dos travesaños, con la puerta hacia el camino
  (() => {
    const x0 = 2.1, x1 = 8.3, z0 = -4.6, z1 = 1.9, poste = new T.BoxGeometry(0.14, 0.9, 0.14), mat = M('#8b5a2b');
    const tramo = (ax, az, bx, bz) => {
      const L = Math.hypot(bx - ax, bz - az), n = Math.max(1, Math.round(L / 1.2));
      for (let i = 0; i <= n; i++) { const p = new T.Mesh(poste, mat); p.position.set(lerp(ax, bx, i / n), 0.45, lerp(az, bz, i / n)); p.castShadow = true; scene.add(p); }
      [0.38, 0.72].forEach(y => { const r = new T.Mesh(new T.BoxGeometry(L, 0.08, 0.06), mat); r.position.set((ax + bx) / 2, y, (az + bz) / 2); r.rotation.y = -Math.atan2(bz - az, bx - ax); r.castShadow = true; scene.add(r); });
    };
    tramo(x0, z0, x1, z0); tramo(x1, z0, x1, z1); tramo(x0, z1, x1, z1); tramo(x0, z0, x0, -1.4); tramo(x0, 0.4, x0, z1);
    // el bebedero y el gallinero
    const beb = caja(1.4, 0.35, 0.5, '#8d6e63'); beb.position.set(7.4, 0.18, -1.1); scene.add(beb);
    const agua = new T.Mesh(new T.BoxGeometry(1.25, 0.04, 0.38), M('#4dabf7', { roughness: 0.3 })); agua.position.set(7.4, 0.34, -1.1); scene.add(agua);
    const gal = new T.Group(); const base = caja(1.3, 0.8, 1, '#d9a066'); base.position.y = 0.55;
    const techo = new T.Mesh(new T.ConeGeometry(1.05, 0.6, 4), M('#b33b2e')); techo.position.y = 1.25; techo.rotation.y = Math.PI / 4; techo.castShadow = true;
    const pata = new T.CylinderGeometry(0.05, 0.05, 0.3, 4); [[-0.5, -0.4], [0.5, -0.4], [-0.5, 0.4], [0.5, 0.4]].forEach(([a, b]) => { const p = new T.Mesh(pata, M('#6d4c41')); p.position.set(a, 0.15, b); gal.add(p); });
    const hueco = caja(0.36, 0.36, 0.05, '#3b2a1e'); hueco.position.set(0, 0.55, 0.51);
    gal.add(base, techo, hueco); gal.position.set(2.9, 0, -0.6); gal.rotation.y = 0.4; scene.add(gal);
  })();

  /* ---------- carga de los GLB ---------- */
  function cargarScript(src) { return new Promise((si, no) => { const s = document.createElement('script'); s.src = src; s.onload = si; s.onerror = () => no(new Error('no cargó ' + src)); document.head.appendChild(s); }); }
  let cargador = null;
  function loader() {
    if (cargador) return cargador;
    const J3 = window.Juegos3D || {}, cdn = 'https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/';
    const una = (f, dir, hay) => (hay() ? Promise.resolve() : (J3.enApp ? cargarScript('../' + f).then(() => { if (!hay()) throw new Error('vacío'); }) : Promise.reject(new Error('suelto'))).catch(() => cargarScript(cdn + dir + f)));
    return (cargador = una('GLTFLoader.js', 'loaders/', () => T.GLTFLoader).then(() => una('meshopt_decoder.js', 'libs/', () => window.MeshoptDecoder))
      .then(() => una('SkeletonUtils.js', 'utils/', () => T.SkeletonUtils).catch(() => null))
      .then(() => { const l = new T.GLTFLoader(); if (window.MeshoptDecoder) l.setMeshoptDecoder(window.MeshoptDecoder); l.setCrossOrigin('anonymous'); return l; }));
  }
  const glb = {};
  function cargar(id) {
    return glb[id] || (glb[id] = loader().then(l => new Promise((si, no) => {
      const t = setTimeout(() => no(new Error('tardó')), 30000);
      l.load(o.biblio + 'modelos/' + id + '.glb', g => { clearTimeout(t); si(g); }, undefined, e => { clearTimeout(t); no(e instanceof Error ? e : new Error('no cargó')); });
    })).catch(e => { console.warn('Mi Finca: sin ' + id + ' (' + e.message + '): va de cajitas'); return null; }));
  }
  // Los vértices de verdad (con cuantización y esqueleto): three 0.128 no desnormaliza las posiciones cuantizadas y con
  // esqueleto la malla está donde la pone el esqueleto. La misma cuenta que arca/juego.js y vitrina-carga.ts › cajaReal.
  const tope = a => (a instanceof Int8Array ? 127 : a instanceof Uint8Array ? 255 : a instanceof Int16Array ? 32767 : a instanceof Uint16Array ? 65535 : 1);
  function cajaReal(raiz) {
    raiz.updateMatrixWorld(true);
    const c = new T.Box3(), v = new V3(), q2 = new V3(), suma = new V3(), m = new T.Matrix4();
    raiz.traverse(o => {
      const pos = o.isMesh && o.geometry ? o.geometry.attributes.position : null;
      if (!pos) return;
      const k = pos.normalized ? 1 / tope(pos.array || (pos.data && pos.data.array)) : 1, paso = Math.max(1, Math.floor(pos.count / 3000));
      const si = o.isSkinnedMesh ? o.geometry.attributes.skinIndex : null, sw = si ? o.geometry.attributes.skinWeight : null;
      for (let i = 0; i < pos.count; i += paso) {
        v.set(pos.getX(i) * k, pos.getY(i) * k, pos.getZ(i) * k);
        if (si && sw) {
          v.applyMatrix4(o.bindMatrix); suma.set(0, 0, 0);
          const pe = [sw.getX(i), sw.getY(i), sw.getZ(i), sw.getW(i)], hu = [si.getX(i), si.getY(i), si.getZ(i), si.getW(i)], tot = pe[0] + pe[1] + pe[2] + pe[3] || 1;
          for (let j = 0; j < 4; j++) { const b = o.skeleton.bones[hu[j]]; if (!pe[j] || !b) continue; m.multiplyMatrices(b.matrixWorld, o.skeleton.boneInverses[hu[j]]); suma.addScaledVector(q2.copy(v).applyMatrix4(m), pe[j] / tot); }
          v.copy(suma).applyMatrix4(o.bindMatrixInverse).applyMatrix4(o.matrixWorld);
        } else v.applyMatrix4(o.matrixWorld);
        c.expandByPoint(v);
      }
    });
    return c;
  }
  // El caminar de Mixamo lleva la cadera hacia delante y al repetirse vuelve de golpe: se deja en su sitio.
  function enSuSitio(c) {
    const k = c.clone();
    k.tracks.forEach(t => {
      if (!/Hips\.position$/.test(t.name)) return;
      const n = t.times.length, L = (t.times[n - 1] - t.times[0]) || 1, v = t.values = Float32Array.from(t.values);
      for (let j = 0; j < 3; j += 2) { const d = v[(n - 1) * 3 + j] - v[j]; for (let i = 0; i < n; i++) v[i * 3 + j] -= d * (t.times[i] - t.times[0]) / L; }
    });
    return k;
  }
  const clonar = (g, primero) => (primero ? g.scene : T.SkeletonUtils && T.SkeletonUtils.clone ? T.SkeletonUtils.clone(g.scene) : g.scene.clone(true));
  const usados = {};
  /** El modelo `id` en `padre`, de alto `MODELOS[id][0]`, centrado y con los pies en 0. Devuelve {obj, mezclador, clips}. */
  function poner(id, padre, alto) {
    const r = { obj: null, mezclador: null, clips: {} };
    const ficha = MODELOS[id] || [1, '#ccc'];
    alto = alto || ficha[0];
    const resp = respaldo(id, alto, ficha[1]); padre.add(resp); r.obj = resp;
    cargar(id).then(g => {
      if (!g) return;
      const s = clonar(g, !usados[id]); usados[id] = true;
      s.traverse(m => { if (m.isMesh) { m.castShadow = true; m.receiveShadow = false; if (m.isSkinnedMesh) m.frustumCulled = false; } });
      if (g.animations && g.animations.length) {
        r.mezclador = new T.AnimationMixer(s);
        g.animations.forEach(c => { const n = c.name.toLowerCase(); r.clips[n] = r.mezclador.clipAction(/walk|caminar/.test(n) ? enSuSitio(c) : c); });
        const quieto = r.clips.quieto || r.clips.idle || null;
        if (quieto) { quieto.play(); r.mezclador.update(0); }
        mezcladores.push(r.mezclador);
      }
      const caja3 = cajaReal(s), tam = caja3.getSize(new V3()), cen = caja3.getCenter(new V3());
      // el alto manda, pero sin pasarse de ancho (el establo de la Biblioteca es muy ancho)
      const anchoMax = ficha[2] || alto * 2.4;
      const k = Math.min(alto / Math.max(0.001, tam.y), anchoMax / Math.max(0.001, tam.x, tam.z)), envol = new T.Group();
      s.position.x -= cen.x; s.position.y -= caja3.min.y; s.position.z -= cen.z; envol.add(s); envol.scale.setScalar(k);
      padre.remove(resp); padre.add(envol); r.obj = envol;
      if (r.alCargar) r.alCargar();
    });
    return r;
  }
  // El respaldo: un cuerpo de caja y una cabeza (si el GLB no carga se ve algo con su color y su forma).
  function respaldo(id, alto, color) {
    const g = new T.Group();
    if (id === 'establo') {
      const b = caja(3.6, 2.2, 2.6, color); b.position.y = 1.1; const t = new T.Mesh(new T.ConeGeometry(2.7, 1.4, 4), M('#6d4c41')); t.position.y = 2.9; t.rotation.y = Math.PI / 4; t.scale.z = 0.75; g.add(b, t); return g;
    }
    if (id === 'maiz') { const t = new T.Mesh(new T.ConeGeometry(0.18, alto, 5), M('#5c940d')); t.position.y = alto / 2; g.add(t); return g; }
    if (id === 'mango' || id === 'banano') { const f = new T.Mesh(new T.SphereGeometry(alto / 2, 6, 5), M(color)); f.position.y = alto / 2; f.scale.y = 1.25; g.add(f); return g; }
    if (/^nin/.test(id)) { const c = caja(0.42, alto * 0.55, 0.28, color); c.position.y = alto * 0.3; const h = new T.Mesh(new T.SphereGeometry(alto * 0.17, 8, 6), M('#e0a77a')); h.position.y = alto * 0.78; g.add(c, h); return g; }
    const w = alto * 0.9, cu = caja(w * 0.55, alto * 0.5, w, color); cu.position.y = alto * 0.45;
    const ca = caja(w * 0.42, alto * 0.38, w * 0.38, color); ca.position.set(0, alto * 0.78, w * 0.55);
    g.add(cu, ca); return g;
  }
  const mezcladores = [];

  /* ---------- las cosas de la finca ---------- */
  const ents = {}; // id → {id, tipo, g (grupo con posición), giro (grupo que mira), hit, base [x,z], extra…}
  const tocables = [];
  const dirCam = () => new V3().subVectors(cam.position, mira).setY(0).normalize();
  let puestoAnimal = 0;
  function nueva(id, tipo, x, z, hitW, hitH, hitD) {
    const g = new T.Group(); g.position.set(x, 0, z); scene.add(g);
    const giro = new T.Group(); g.add(giro);
    const hit = new T.Mesh(new T.BoxGeometry(hitW, hitH, hitD), new T.MeshBasicMaterial({ visible: false }));
    hit.position.y = hitH / 2; hit.userData.id = id; g.add(hit); tocables.push(hit);
    const e = { id, tipo, g, giro, hit, x, z, alto: hitH, salto: 0, fase: Math.random() * 6, marca: null, prod: null };
    ents[id] = e; return e;
  }
  function animal(id, especie, x, z) {
    const alto = MODELOS[especie][0], e = nueva(id, 'animal', x, z, Math.max(1, alto * 1.2), Math.max(0.9, alto * 1.15), Math.max(1, alto * 1.2));
    e.especie = especie; e.puesto = puestoAnimal++;
    e.m = poner(especie, e.giro);
    mirar(e);
    // la comida (heno) delante del animal, escondida hasta que se le da
    const heno = caja(0.5, 0.18, 0.36, '#e5c35a'); heno.visible = false; heno.position.set(0, 0.09, 0.6); e.g.add(heno); e.heno = heno;
    return e;
  }
  function mirar(e) { // de cara a la cámara, corrido según su puesto (CARA + LADOS)
    const d = new V3(cam.position.x - e.x, 0, cam.position.z - e.z), hacia = Math.atan2(d.x, d.z);
    const c = CARA[e.especie];
    e.giro.rotation.y = (c != null ? c * D : 0) + hacia + (c != null ? LADOS[e.puesto % LADOS.length] * D : 0);
  }
  function parcela(id, x, z) {
    const e = nueva(id, 'parcela', x, z, 2.5, 1.4, 2.5);
    const tierra = caja(2.4, 0.16, 2.4, '#7a5534'); tierra.position.y = 0.08; tierra.castShadow = false; e.g.add(tierra); e.tierra = tierra;
    for (let i = -1; i <= 1; i++) { const s = caja(0.5, 0.1, 2.2, '#6b4529'); s.position.set(i * 0.72, 0.19, 0); s.castShadow = false; e.g.add(s); }
    // el borde de madera
    [[0, 1.24, 2.6, 0.12], [0, -1.24, 2.6, 0.12], [1.24, 0, 0.12, 2.6], [-1.24, 0, 0.12, 2.6]].forEach(([a, b, w, d]) => { const t = caja(w, 0.22, d, '#a0703f'); t.position.set(a, 0.11, b); e.g.add(t); });
    e.plantas = new T.Group(); e.g.add(e.plantas);
    e.estado = { cultivo: null, etapa: 0, regada: false };
    return e;
  }
  function plantar(e) {
    const { cultivo, etapa, regada } = e.estado;
    while (e.plantas.children.length) e.plantas.remove(e.plantas.children[0]);
    e.tierra.material = M(regada ? '#5a3d24' : '#7a5534');
    if (!cultivo || !etapa) return;
    if (etapa === 1) { // brotes
      [[-0.72, -0.6], [0, 0.1], [0.72, -0.4], [-0.72, 0.6], [0.72, 0.7]].forEach(([a, b]) => { const s = new T.Mesh(new T.ConeGeometry(0.1, 0.32, 5), M('#69db7c')); s.position.set(a, 0.38, b); e.plantas.add(s); });
      return;
    }
    if (cultivo === 'maiz') {
      const k = etapa === 2 ? 0.55 : 1;
      [[-0.72, -0.62], [0, -0.62], [0.72, -0.62], [-0.72, 0.5], [0, 0.5], [0.72, 0.5]].forEach(([a, b], i) => {
        const p = new T.Group(); p.position.set(a, 0.2, b); p.rotation.y = i * 1.3; e.plantas.add(p);
        poner('maiz', p, MODELOS.maiz[0] * k);
      });
    } else { // el árbol de mango, con mangos cuando está listo
      const t = new T.Group(); t.position.y = 0.2; e.plantas.add(t);
      const k = etapa === 2 ? 0.6 : 1;
      const tr = new T.Mesh(tronco, M('#7a4f2a')); tr.scale.set(1, k, 1); tr.position.y = 0.7 * k; tr.castShadow = true; t.add(tr);
      const co = new T.Mesh(copa, M('#2f9e44')); co.position.y = 1.75 * k; co.scale.setScalar(1.05 * k); co.castShadow = true; t.add(co);
      if (etapa >= 3) [[0.7, 1.4, 0.5], [-0.6, 1.5, 0.6], [0.2, 1.2, 0.9], [-0.3, 1.9, 0.75], [0.8, 1.85, -0.2]].forEach(([a, b, c]) => {
        const m = new T.Group(); m.position.set(a, b, c); t.add(m); poner('mango', m);
      });
    }
  }
  // el mercado del pueblo: mesa, toldo de rayas, cajas y el letrero
  function mercado(x, z) {
    const e = nueva('mercado', 'mercado', x, z, 3.6, 2.6, 2);
    const mesa = caja(3, 0.9, 1.1, '#a0703f'); mesa.position.y = 0.45; e.giro.add(mesa);
    [[-1.45, -0.55], [1.45, -0.55]].forEach(([a, b]) => { const p = caja(0.12, 2.6, 0.12, '#6d4c41'); p.position.set(a, 1.3, b); e.giro.add(p); });
    const c = document.createElement('canvas'); c.width = 256; c.height = 32; const x2 = c.getContext('2d');
    for (let i = 0; i < 8; i++) { x2.fillStyle = i % 2 ? '#fff4e0' : '#e03131'; x2.fillRect(i * 32, 0, 32, 32); }
    const tt = new T.CanvasTexture(c); tt.encoding = T.sRGBEncoding;
    const toldo = new T.Mesh(new T.BoxGeometry(3.4, 0.08, 0.9), new T.MeshStandardMaterial({ map: tt, roughness: 0.9 })); toldo.position.set(0, 2.5, -0.45); toldo.rotation.x = -0.5; toldo.castShadow = true; e.giro.add(toldo);
    const cajas = new T.Group(); e.giro.add(cajas); e.cajas = cajas;
    const letrero = (() => { const k = document.createElement('canvas'); k.width = 256; k.height = 64; const q = k.getContext('2d'); q.fillStyle = '#fff4e0'; q.fillRect(0, 0, 256, 64); q.strokeStyle = '#6d4c41'; q.lineWidth = 8; q.strokeRect(4, 4, 248, 56); q.fillStyle = '#5c3a1e'; q.font = '800 38px "Baloo 2",sans-serif'; q.textAlign = 'center'; q.textBaseline = 'middle'; q.fillText('MERCADO', 128, 35); const t2 = new T.CanvasTexture(k); t2.encoding = T.sRGBEncoding; return t2; })();
    const l = new T.Mesh(new T.PlaneGeometry(1.8, 0.45), new T.MeshBasicMaterial({ map: letrero })); l.position.set(0, 2.05, -0.5); l.rotation.x = -0.5; e.giro.add(l);
    const comprador = emoji('🧑🏽‍🌾', 1.3); comprador.position.set(-0.95, 1.35, -0.35); e.giro.add(comprador); e.comprador = comprador;
    return e;
  }
  function puestoCajas(lista) { // [{emoji, n}] lo que hay en la canasta, en cajas sobre la mesa
    const e = ents.mercado; if (!e) return;
    while (e.cajas.children.length) e.cajas.remove(e.cajas.children[0]);
    lista.slice(0, 5).forEach((it, i) => {
      const cx = -1.15 + i * 0.58, b = caja(0.48, 0.26, 0.42, '#c08a4a'); b.position.set(cx, 1.03, 0.15); e.cajas.add(b);
      const s = emoji(it.emoji, 0.48); s.position.set(cx, 1.38, 0.2); e.cajas.add(s);
    });
  }

  /* ---------- el granjero ---------- */
  const granjero = { g: new T.Group(), giro: new T.Group(), m: null, meta: null, fin: null, quieto: true, x: 0, z: 0.6 };
  granjero.g.add(granjero.giro); scene.add(granjero.g); granjero.g.position.set(0, 0, 0.6);
  granjero.m = poner(o.granjero || 'nino-ruana', granjero.giro);
  granjero.m.alCargar = () => { const w = granjero.m.clips; if (w.idle) { w.idle.play(); granjero.clipActual = w.idle; } };
  function clip(nombre) {
    const w = granjero.m.clips; if (!granjero.m.mezclador) return;
    const a = w[nombre] || null, act = granjero.clipActual;
    if (!a || a === act) return;
    a.reset().fadeIn(0.2).play(); if (act) act.fadeOut(0.2);
    granjero.clipActual = a;
  }
  function caminar(id, alLlegar) {
    const e = ents[id]; if (!e) { if (alLlegar) alLlegar(); return; }
    // se para delante (del lado de la cámara) de lo que se tocó
    const d = dirCam(), r = e.tipo === 'parcela' ? 1.75 : e.tipo === 'mercado' ? 1.6 : Math.max(0.9, e.alto * 0.9);
    const mx = e.x + d.x * r, mz = e.z + d.z * r;
    granjero.meta = [mx, mz]; granjero.fin = alLlegar || null; granjero.hacia = e;
    if (calma) { granjero.g.position.set(mx, 0, mz); llegar(); return; }
    clip('walk');
  }
  function llegar() {
    const g = granjero, f = g.fin; g.meta = null; g.fin = null;
    const e = g.hacia; if (e) g.giro.rotation.y = Math.atan2(e.x - g.g.position.x, e.z - g.g.position.z);
    clip('idle');
    if (f) f();
  }
  function moverGranjero(dt) {
    const g = granjero; if (!g.meta) return;
    const p = g.g.position, dx = g.meta[0] - p.x, dz = g.meta[1] - p.z, L = Math.hypot(dx, dz), v = 5.2 * dt;
    if (L <= v) { p.x = g.meta[0]; p.z = g.meta[1]; llegar(); return; }
    p.x += dx / L * v; p.z += dz / L * v;
    const a = Math.atan2(dx, dz); let dA = a - g.giro.rotation.y; dA = Math.atan2(Math.sin(dA), Math.cos(dA)); g.giro.rotation.y += dA * Math.min(1, dt * 12);
  }
  function celebrar() { if (granjero.m.clips.wave && !granjero.meta) { clip('wave'); setTimeout(() => { if (!granjero.meta) clip('idle'); }, 1800); } }

  /* ---------- efectos ---------- */
  const efectos = [];
  function chispas(x, y, z, color, n, sube) {
    for (let i = 0; i < n; i++) {
      const m = new T.Mesh(new T.SphereGeometry(0.07, 4, 3), new T.MeshBasicMaterial({ color: C(color), transparent: true }));
      m.position.set(x + (Math.random() - 0.5) * 1.6, y + Math.random() * 0.8, z + (Math.random() - 0.5) * 1.6); scene.add(m);
      efectos.push({ m, t: 0, dur: 0.9 + Math.random() * 0.5, v: new V3((Math.random() - 0.5) * 0.6, sube ? 1.2 + Math.random() : -2.6 - Math.random(), (Math.random() - 0.5) * 0.6) });
    }
  }
  function volar(txt, desde, hasta, s) { // un emoji que vuela de una cosa a otra (lo cosechado a la canasta)
    const sp = emoji(txt, s || 0.7, true); sp.position.copy(desde); scene.add(sp);
    efectos.push({ m: sp, t: 0, dur: calma ? 0.01 : 0.8, desde: desde.clone(), hasta: hasta.clone() });
  }
  function subir(txt, x, y, z) { const sp = emoji(txt, 0.75, true); sp.position.set(x, y, z); scene.add(sp); efectos.push({ m: sp, t: 0, dur: 1.4, v: new V3(0, 0.9, 0) }); }
  function efecto(id, tipo, extra) {
    const e = ents[id]; if (!e) return;
    const top = e.alto + 0.2;
    if (tipo === 'agua') { if (!calma) chispas(e.x, 2.6, e.z, '#4dabf7', 26, false); subir('💧', e.x, top + 0.6, e.z); }
    else if (tipo === 'semilla') { if (!calma) chispas(e.x, 1.6, e.z, '#c08a4a', 14, false); subir('🌰', e.x, top + 0.4, e.z); }
    else if (tipo === 'comida') { if (e.heno) { e.heno.visible = true; e.heno.scale.set(1, 1, 1); e.henoT = 3; } subir('🌾', e.x, top + 0.3, e.z); }
    else if (tipo === 'feliz') { e.salto = calma ? 0 : 1; subir('💛', e.x, top + 0.2, e.z); if (!calma) chispas(e.x, top, e.z, '#ffd43b', 10, true); }
    else if (tipo === 'abono') { subir('💩', e.x, top + 0.4, e.z); if (!calma) chispas(e.x, 0.8, e.z, '#8d6e63', 14, true); }
    else if (tipo === 'mal') { subir('🤔', e.x, top + 0.4, e.z); }
    else if (tipo === 'recoger' || tipo === 'cosecha') volar(extra || '🧺', new V3(e.x, top, e.z), granjero.g.position.clone().setY(1.4));
    else if (tipo === 'vender') { for (let i = 0; i < (calma ? 1 : 6); i++) setTimeout(() => subir('🪙', e.x + (Math.random() - 0.5) * 2, 1.4, e.z + 0.4), i * 120); }
  }
  /** El emoji que flota encima de una cosa: lo que necesita (💧, 🌾, 🥚…) o quién tiene una pregunta (🩺❓). */
  function marca(id, txt) {
    const e = ents[id]; if (!e) return;
    if (e.marca && e.marcaTxt === txt) return;
    if (e.marca) { e.g.remove(e.marca); e.marca = null; }
    e.marcaTxt = txt;
    if (!txt) return;
    // la visita, de pie al lado de lo que se toca (la etiqueta ya dice qué necesita)
    const sp = emoji(txt, 1.15, false), r = e.tipo === 'parcela' ? 1.5 : e.tipo === 'mercado' ? 1.9 : Math.max(0.7, e.alto * 0.8);
    sp.position.set(r, 0.6, 0.5); sp.userData.y = 0.6; e.g.add(sp); e.marca = sp;
  }
  // el anillo de lo elegido (además, la etiqueta se marca con forma y texto: no sólo color)
  const anillo = new T.Mesh(new T.RingGeometry(1, 1.22, 32), new T.MeshBasicMaterial({ color: 0xffd43b, transparent: true, opacity: 0.95, depthWrite: false, side: T.DoubleSide }));
  anillo.rotation.x = -Math.PI / 2; anillo.visible = false; scene.add(anillo);
  let elegido = null, pistaId = null;
  const brillo = new T.Mesh(new T.RingGeometry(0.95, 1.4, 32), new T.MeshBasicMaterial({ color: 0x69db7c, transparent: true, opacity: 0.8, depthWrite: false, side: T.DoubleSide }));
  brillo.rotation.x = -Math.PI / 2; brillo.visible = false; scene.add(brillo);
  function radio(e) { return e.tipo === 'parcela' ? 1.55 : e.tipo === 'mercado' ? 2 : Math.max(0.6, e.alto * 0.75); }
  function resaltar(id) { elegido = ents[id] || null; anillo.visible = !!elegido; if (elegido) { anillo.position.set(elegido.x, 0.04, elegido.z); anillo.scale.setScalar(radio(elegido)); } }
  function pista(id) { pistaId = ents[id] || null; brillo.visible = !!pistaId; if (pistaId) { brillo.position.set(pistaId.x, 0.05, pistaId.z); brillo.scale.setScalar(radio(pistaId) * 1.1); } }

  /* ---------- montar la finca ---------- */
  /** lista: [{id, tipo: parcela|animal|mercado|establo|cosa, especie?}] */
  function montar(lista) {
    lista.forEach(it => {
      if (ents[it.id]) return;
      const s = SITIO[it.id] || LIBRES.shift() || [Math.random() * 10 - 5, -5];
      if (it.tipo === 'parcela') parcela(it.id, s[0], s[1]);
      else if (it.tipo === 'mercado') mercado(s[0], s[1]);
      else if (it.tipo === 'establo') { const e = nueva(it.id, 'establo', s[0], s[1], 4, 3.6, 3); e.m = poner('establo', e.giro); e.giro.rotation.y = Math.atan2(cam.position.x - s[0], cam.position.z - s[1]) * 0.5; }
      else if (it.tipo === 'cosa') { const e = nueva(it.id, 'cosa', s[0], s[1], 1, 1, 1); const b = caja(0.7, 0.4, 0.6, '#c08a4a'); b.position.y = 0.2; e.giro.add(b); const p = new T.Group(); p.position.y = 0.4; e.giro.add(p); e.m = poner(it.especie || it.id, p); e.alto = 1; }
      else animal(it.id, it.especie || it.id, s[0], s[1]);
    });
  }
  function estado(id, st) {
    const e = ents[id]; if (!e) return;
    if (e.tipo === 'parcela') { const a = e.estado; if (a.cultivo !== st.cultivo || a.etapa !== st.etapa || a.regada !== st.regada) { e.estado = Object.assign({}, st); plantar(e); } }
  }

  /* ---------- cámara, pantalla y toques ---------- */
  const mira = new V3(0.3, 0, -2.2);
  let ancho = 1, alto = 1, panX = 0, panMeta = 0, arriba = 0, abajo = 0, izq = 0, panBase = 0;
  const DIR = new V3(0, 0.78, 0.63).normalize();
  function medir(margenArriba, margenAbajo, margenIzq) {
    if (margenArriba != null) { arriba = margenArriba; abajo = margenAbajo; izq = margenIzq || 0; }
    ancho = Math.max(1, cont.clientWidth); alto = Math.max(1, cont.clientHeight);
    ren.setSize(ancho, alto, false); cam.aspect = ancho / alto;
    // que quepa la finca (17 m de ancho, 11 de fondo) entre el HUD de arriba y la barra de abajo
    const util = Math.max(0.35, 1 - (arriba + abajo) / alto), utilW = Math.max(0.5, 1 - izq / ancho);
    const vfov = cam.fov * D, hfov = 2 * Math.atan(Math.tan(vfov / 2) * cam.aspect * utilW);
    const anchoVer = cam.aspect < 1.05 ? 11 : 20; // de pie, la cámara sigue al granjero
    const dW = (anchoVer / 2) / Math.tan(hfov / 2), dH = (11.5 / 2) / Math.tan(vfov * util / 2) * 0.82;
    cam.userData.dist = clamp(Math.max(dW, dH), 14, 42);
    // corre la mira para que el centro de la finca quede en el hueco entre las barras
    cam.userData.corr = ((abajo - arriba) / alto) * cam.userData.dist * Math.tan(vfov / 2) * 1.2;
    // y a un lado, si la lista de tareas ocupa la izquierda
    panBase = -(izq / 2 / ancho) * 2 * cam.userData.dist * Math.tan(vfov / 2) * cam.aspect;
    cam.updateProjectionMatrix(); colocar();
    Object.values(ents).forEach(e => { if (e.tipo === 'animal') mirar(e); });
  }
  function colocar() {
    const d = cam.userData.dist || 22;
    const m = new V3(mira.x + panX + panBase, 0, mira.z + (cam.userData.corr || 0));
    cam.position.copy(m).addScaledVector(DIR, d); cam.lookAt(m);
  }
  const _p = new V3();
  function pos2d(id) {
    const e = ents[id]; if (!e) return null;
    _p.set(e.x, e.alto + (e.tipo === 'parcela' ? 0.2 : 0.15), e.z).project(cam);
    return { x: (_p.x + 1) / 2 * ancho, y: (1 - _p.y) / 2 * alto, dentro: _p.z < 1 && Math.abs(_p.x) < 1.05 && Math.abs(_p.y) < 1.1 };
  }
  const ray = new T.Raycaster(), _v2 = new T.Vector2();
  function tocar(cx, cy) {
    const r = ren.domElement.getBoundingClientRect();
    _v2.set((cx - r.left) / r.width * 2 - 1, -((cy - r.top) / r.height) * 2 + 1);
    ray.setFromCamera(_v2, cam);
    const h = ray.intersectObjects(tocables, false);
    return h.length ? h[0].object.userData.id : null;
  }
  function seguir(id) { const e = ents[id]; panMeta = e && cam.aspect < 1.05 ? clamp(e.x * 0.85, -5.2, 5.2) : 0; }

  /* ---------- el día y la noche ---------- */
  function dormir(alAcabar) {
    if (calma) { noche = 1; pintarCielo(); setTimeout(() => { noche = 0; pintarCielo(); if (alAcabar) alAcabar(); }, 700); return; }
    nocheMeta = 1; nocheFin = () => { setTimeout(() => { nocheMeta = 0; nocheFin = alAcabar || null; }, 900); };
  }

  /* ---------- el cuadro ---------- */
  let t = 0;
  function cuadro(dt) {
    t += dt;
    mezcladores.forEach(m => m.update(calma ? dt * 0.6 : dt));
    moverGranjero(dt);
    if (Math.abs(panMeta - panX) > 0.01) { panX = calma ? panMeta : lerp(panX, panMeta, Math.min(1, dt * 3)); colocar(); }
    if (cam.aspect < 1.05) { const gx = clamp(granjero.g.position.x * 0.85, -5.2, 5.2); if (granjero.meta && Math.abs(gx - panMeta) > 0.5) panMeta = gx; }
    // los animales sin esqueleto se mueven un poco (picotean, respiran); al ponerse contentos, saltan
    Object.values(ents).forEach(e => {
      if (e.tipo === 'animal') {
        const sinRig = !(e.m && e.m.mezclador);
        let y = 0, inc = 0;
        if (!calma && sinRig) { const f = t * 1.7 + e.fase; if (/gallin|gallo|pollito|pato/.test(e.especie)) inc = Math.max(0, Math.sin(f * 1.3)) ** 6 * 0.5; else y = Math.sin(f) * 0.015; }
        if (e.salto > 0) { e.salto = Math.max(0, e.salto - dt * 1.6); y += Math.abs(Math.sin(e.salto * Math.PI * 2)) * 0.35 * e.salto; }
        e.giro.position.y = y; e.giro.rotation.x = inc;
        if (e.henoT > 0) { e.henoT -= dt; const k = clamp(e.henoT / 3, 0, 1); e.heno.scale.set(k, k, k); if (e.henoT <= 0) e.heno.visible = false; }
      }
      if (e.marca) e.marca.position.y = 0.6 + (calma ? 0 : Math.abs(Math.sin(t * 3 + e.fase)) * 0.12);
    });
    if (elegido) anillo.material.opacity = calma ? 0.95 : 0.7 + Math.sin(t * 4) * 0.25;
    if (pistaId) brillo.material.opacity = calma ? 0.8 : 0.5 + Math.sin(t * 5) * 0.35;
    for (let i = efectos.length - 1; i >= 0; i--) {
      const f = efectos[i]; f.t += dt; const k = f.t / f.dur;
      if (f.desde) { f.m.position.lerpVectors(f.desde, f.hasta, Math.min(1, k)); f.m.position.y += Math.sin(Math.min(1, k) * Math.PI) * 1.2; }
      else f.m.position.addScaledVector(f.v, dt);
      if (f.m.material) f.m.material.opacity = 1 - Math.max(0, k - 0.6) / 0.4;
      if (k >= 1) { scene.remove(f.m); if (f.m.geometry && !f.m.isSprite) f.m.geometry.dispose(); if (f.m.material) f.m.material.dispose(); efectos.splice(i, 1); }
    }
    if (Math.abs(nocheMeta - noche) > 0.001) {
      noche = clamp(noche + Math.sign(nocheMeta - noche) * dt * 1.1, 0, 1); pintarCielo();
      if (Math.abs(nocheMeta - noche) <= 0.001 && nocheFin) { const f = nocheFin; nocheFin = null; f(); }
    }
    ren.render(scene, cam);
  }
  pintarCielo(); medir();

  return {
    lienzo: ren.domElement, montar, estado, efecto, marca, caminar, celebrar, resaltar, pista, seguir, pos2d, tocar, medir, cuadro, dormir, puestoCajas,
    calma(b) { calma = !!b; }, hay: id => !!ents[id], sitio: id => (ents[id] ? [ents[id].x, ents[id].z] : null), ocupado: () => !!granjero.meta
  };
}

window.FincaMundo = { disponible: true, crear };
})();
