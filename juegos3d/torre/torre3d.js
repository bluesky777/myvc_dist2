/* Torre de los Enigmas — la torre en 3D (three r128, la de puente.js). Es el decorado: el enigma va en HTML encima.
   window.Torre3D.crear(div, {biblio, calma}) → {subir(piso, alAcabar), irA(piso), buho(piso|null), calma(b), hueco({x, y}),
   celebrar(), sacudir()}. Piedra con InstancedMesh (una llamada de dibujo por piso), vitrales con una textura pintada en
   un canvas, el búho es modelos/buho.glb de la Biblioteca (con respaldo hecho de esferas si no carga).
   En calma: la torre quieta, sin nubes que se mueven y los cambios de piso de golpe. */
(function () {
'use strict';
const T = window.THREE;
const H = 4.2, R = 5.2, PASO = (2 * Math.PI) / 5, N = 28, FILAS = 4;
const C = h => new T.Color(h).convertSRGBToLinear();
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const suave = t => t * t * (3 - 2 * t);

function vitral(semilla) {
  const c = document.createElement('canvas'); c.width = 64; c.height = 128;
  const g = c.getContext('2d'), cols = ['#e63946', '#2a9df4', '#ffd43b', '#2fbf71', '#9b5de5', '#ff8c42'];
  let s = semilla * 9301 + 49297;
  const az = () => { s = (s * 9301 + 49297) % 233280; return s / 233280; };
  g.fillStyle = '#20263a'; g.fillRect(0, 0, 64, 128);
  for (let y = 0; y < 128; y += 16) for (let x = 0; x < 64; x += 16) { g.fillStyle = cols[Math.floor(az() * cols.length)]; g.fillRect(x + 2, y + 2, 12, 12); }
  g.fillStyle = '#20263a'; g.beginPath(); g.moveTo(0, 0); g.lineTo(0, 28); g.quadraticCurveTo(0, 0, 32, 0); g.fill(); g.beginPath(); g.moveTo(64, 0); g.lineTo(64, 28); g.quadraticCurveTo(64, 0, 32, 0); g.fill();
  const t = new T.CanvasTexture(c); t.encoding = T.sRGBEncoding; t.magFilter = T.NearestFilter; return t;
}

function crear(div, op) {
  const movil = matchMedia('(pointer: coarse)').matches;
  const ren = new T.WebGLRenderer({ antialias: !movil, powerPreference: 'low-power' });
  ren.setPixelRatio(Math.min(devicePixelRatio || 1, movil ? 1.5 : 1.75));
  ren.outputEncoding = T.sRGBEncoding;
  div.appendChild(ren.domElement);
  const scene = new T.Scene(), cam = new T.PerspectiveCamera(50, 1, 0.1, 400);
  const cielo0 = C('#9fd3ff'), cielo1 = C('#1b1f4b');
  scene.background = cielo0.clone(); scene.fog = new T.Fog(scene.background, 30, 120);
  scene.add(new T.HemisphereLight(0xfff4e0, 0x4a5a3a, 0.75));
  const sol = new T.DirectionalLight(0xfff1d6, 0.9); sol.position.set(8, 20, 14); scene.add(sol); scene.add(sol.target);

  // suelo, camino y árboles
  const suelo = new T.Mesh(new T.CircleGeometry(90, 32), new T.MeshLambertMaterial({ color: C('#6dbb5a') }));
  suelo.rotation.x = -Math.PI / 2; scene.add(suelo);
  const camino = new T.Mesh(new T.PlaneGeometry(2.2, 14), new T.MeshLambertMaterial({ color: C('#d9c49a') }));
  camino.rotation.x = -Math.PI / 2; camino.position.set(0, 0.02, R + 7); scene.add(camino);
  const copa = new T.ConeGeometry(1.4, 3.2, 7), tronco = new T.CylinderGeometry(0.25, 0.3, 1.2, 6);
  const mCopa = new T.MeshLambertMaterial({ color: C('#2f8a4b') }), mTronco = new T.MeshLambertMaterial({ color: C('#7a5230') });
  for (let i = 0; i < 22; i++) {
    const a = (i / 22) * Math.PI * 2 + 0.3, d = 14 + (i * 37 % 19);
    if (Math.abs(Math.sin(a)) < 0.25 && Math.cos(a) > 0) continue; // que no tapen el camino
    const g = new T.Group(), k = 0.7 + ((i * 13) % 7) / 10;
    const c1 = new T.Mesh(copa, mCopa); c1.position.y = 2.6; const t1 = new T.Mesh(tronco, mTronco); t1.position.y = 0.6;
    g.add(c1, t1); g.scale.setScalar(k); g.position.set(Math.sin(a) * d, 0, Math.cos(a) * d); scene.add(g);
  }

  // la torre: un grupo que gira; cada piso es un anillo de piedras, una cornisa, una puerta y dos vitrales
  const torre = new T.Group(); scene.add(torre);
  const bloque = new T.BoxGeometry((2 * Math.PI * R) / N * 0.93, H / FILAS * 0.88, 0.6);
  const mPiedra = new T.MeshLambertMaterial({ color: 0xffffff });
  const cornisa = new T.CylinderGeometry(R + 0.55, R + 0.55, 0.35, N), mCornisa = new T.MeshLambertMaterial({ color: C('#8d8478') });
  const nucleo = new T.CylinderGeometry(R - 0.05, R - 0.05, H, N, 1, true), mNucleo = new T.MeshLambertMaterial({ color: C('#5b5248') });
  const marco = new T.BoxGeometry(2.3, 3.0, 0.5), mMarco = new T.MeshLambertMaterial({ color: C('#6e655b') });
  const hoja = new T.BoxGeometry(0.88, 2.5, 0.14), mHoja = new T.MeshLambertMaterial({ color: C('#7b4a26') });
  const luz = new T.PlaneGeometry(1.8, 2.5), mLuz = new T.MeshBasicMaterial({ color: C('#ffd27a') });
  const vent = new T.PlaneGeometry(0.9, 1.8), mVent = [0, 1, 2, 3].map(i => new T.MeshBasicMaterial({ map: vitral(i + 1) }));
  const pisos = [];
  const dummy = new T.Object3D(), tmp = new T.Color();
  function piso(i) {
    if (pisos[i]) return pisos[i];
    const g = new T.Group(); g.position.y = i * H;
    const im = new T.InstancedMesh(bloque, mPiedra, N * FILAS);
    let k = 0;
    for (let f = 0; f < FILAS; f++) for (let j = 0; j < N; j++) {
      const a = ((j + (f % 2) * 0.5) / N) * Math.PI * 2;
      dummy.position.set(Math.sin(a) * R, (f + 0.5) * (H / FILAS), Math.cos(a) * R); dummy.rotation.set(0, a, 0); dummy.updateMatrix();
      im.setMatrixAt(k, dummy.matrix);
      const v = 0.78 + (((i * 7 + j * 13 + f * 5) % 11) / 11) * 0.22;
      im.setColorAt(k, tmp.setRGB(0.66 * v, 0.6 * v, 0.52 * v)); k++;
    }
    g.add(im);
    const nu = new T.Mesh(nucleo, mNucleo); nu.position.y = H / 2; g.add(nu);
    const co = new T.Mesh(cornisa, mCornisa); co.position.y = 0.1; g.add(co);
    const a = i * PASO, pg = new T.Group();
    pg.position.set(Math.sin(a) * (R + 0.45), 0, Math.cos(a) * (R + 0.45)); pg.rotation.y = a;
    const mm = new T.Mesh(marco, mMarco); mm.position.y = 1.5; pg.add(mm);
    const lz = new T.Mesh(luz, mLuz); lz.position.set(0, 1.45, 0.26); pg.add(lz);
    const hojas = [-1, 1].map(s => { const p = new T.Group(); p.position.set(s * 0.9, 0, 0.32); const h = new T.Mesh(hoja, mHoja); h.position.set(-s * 0.44, 1.45, 0); p.add(h); pg.add(p); return p; });
    g.add(pg);
    [-1, 1].forEach((s, n) => {
      const b = a + s * 1.9, w = new T.Mesh(vent, mVent[(i + n) % 4]);
      w.position.set(Math.sin(b) * (R + 0.52), H * 0.55, Math.cos(b) * (R + 0.52)); w.rotation.y = b; g.add(w);
    });
    torre.add(g);
    return (pisos[i] = { g, hojas, abierto: 0 });
  }
  // el techo: un cono que siempre va tres pisos por encima del que estás
  const techo = new T.Mesh(new T.ConeGeometry(R + 1.2, 6, N), new T.MeshLambertMaterial({ color: C('#3d5a99') }));
  const bandera = new T.Mesh(new T.PlaneGeometry(1.4, 0.8), new T.MeshLambertMaterial({ color: C(getComputedStyle(document.documentElement).getPropertyValue('--colegio').trim() || '#6d4bd1'), side: T.DoubleSide }));
  bandera.position.set(0.7, 3.9, 0); techo.add(bandera);
  const asta = new T.Mesh(new T.CylinderGeometry(0.05, 0.05, 2), mMarco); asta.position.y = 3.8; techo.add(asta);
  torre.add(techo);

  // nubes: pocas, de esferas aplastadas, repartidas alrededor de la altura de la cámara
  const nubes = [], mNube = new T.MeshLambertMaterial({ color: 0xffffff, transparent: true, opacity: 0.9 }), esf = new T.SphereGeometry(1, 8, 6);
  for (let i = 0; i < 9; i++) {
    const g = new T.Group();
    for (let j = 0; j < 4; j++) { const m = new T.Mesh(esf, mNube); m.position.set(j * 1.3 - 2, Math.sin(j * 2) * 0.3, (j % 2) * 0.6); m.scale.set(1.4, 0.8, 1); g.add(m); }
    g.userData = { a: i * 0.7, d: 18 + (i % 4) * 7, dy: (i - 4) * 4.5, v: 0.02 + (i % 3) * 0.01 };
    scene.add(g); nubes.push(g);
  }
  // estrellas: aparecen de noche (pisos altos)
  const est = new T.BufferGeometry(), pos = [];
  for (let i = 0; i < 300; i++) { const a = Math.random() * Math.PI * 2, e = Math.random() * 1.2 + 0.1, d = 150; pos.push(Math.cos(a) * Math.cos(e) * d, Math.sin(e) * d, Math.sin(a) * Math.cos(e) * d); }
  est.setAttribute('position', new T.Float32BufferAttribute(pos, 3));
  const mEst = new T.PointsMaterial({ color: 0xffffff, size: 1.2, sizeAttenuation: false, transparent: true, opacity: 0, fog: false });
  const estrellas = new T.Points(est, mEst); scene.add(estrellas);

  // el búho guardián
  const buhoG = new T.Group(); buhoG.visible = false; torre.add(buhoG);
  let mixer = null;
  (function respaldo() {
    const cuerpo = new T.Mesh(new T.SphereGeometry(0.55, 10, 8), new T.MeshLambertMaterial({ color: C('#8a5a33') })); cuerpo.scale.set(1, 1.25, 0.9); cuerpo.position.y = 0.7;
    const panza = new T.Mesh(new T.SphereGeometry(0.4, 10, 8), new T.MeshLambertMaterial({ color: C('#f2d7a6') })); panza.position.set(0, 0.6, 0.26); panza.scale.set(1, 1.2, 0.6);
    const ojoG = new T.SphereGeometry(0.16, 10, 8), ojoM = new T.MeshLambertMaterial({ color: 0xffffff }), niM = new T.MeshBasicMaterial({ color: 0x111111 });
    const r = new T.Group(); r.name = 'respaldo'; r.add(cuerpo, panza);
    [-1, 1].forEach(s => { const o = new T.Mesh(ojoG, ojoM); o.position.set(s * 0.2, 1.15, 0.42); const n = new T.Mesh(new T.SphereGeometry(0.07, 8, 6), niM); n.position.set(s * 0.2, 1.15, 0.56); const or = new T.Mesh(new T.ConeGeometry(0.1, 0.3, 4), cuerpo.material); or.position.set(s * 0.32, 1.55, 0); r.add(o, n, or); });
    const pico = new T.Mesh(new T.ConeGeometry(0.07, 0.2, 4), new T.MeshLambertMaterial({ color: C('#e0a12b') })); pico.rotation.x = Math.PI / 2; pico.position.set(0, 1.0, 0.55); r.add(pico);
    r.scale.setScalar(1.15); buhoG.add(r);
  })();
  cargarBuho(op.biblio).then(g => {
    const m = g.scene; const caja = new T.Box3().setFromObject(m), alto = caja.max.y - caja.min.y || 1;
    m.scale.setScalar(1.9 / alto); m.position.y = -caja.min.y * (1.9 / alto);
    const r = buhoG.getObjectByName('respaldo'); if (r) buhoG.remove(r);
    buhoG.add(m);
    if (g.animations && g.animations.length) { mixer = new T.AnimationMixer(m); mixer.clipAction(g.animations[0]).play(); }
  }).catch(e => console.warn('Torre: el búho sale de respaldo (' + e.message + ')'));

  // estado de la cámara y la torre
  let dist = 15, pisoAct = 0, camY = H * 0.45, camYObj = camY, giro = 0, giroObj = 0, calma = !!op.calma, hueco = { x: 0, y: 0 }, t0 = performance.now(), sacude = 0, salto = null;
  function asegurar(n) { for (let i = 0; i <= n + 3; i++) piso(i); techo.position.y = (n + 4) * H + 3; pisos.forEach((p, i) => { p.g.visible = i >= n - 5 && i <= n + 3; }); }
  asegurar(0);
  function tam() {
    const w = div.clientWidth || innerWidth, h = div.clientHeight || innerHeight;
    ren.setSize(w, h, false); cam.aspect = w / h;
    cam.setViewOffset(w, h, hueco.x, hueco.y, w, h);
    cam.fov = w / h < 0.8 ? 58 : 50; cam.updateProjectionMatrix();
    // que la torre (unos 12 m de ancho) quepa en el 70 % del ancho libre
    const libre = Math.max(0.3, (w - hueco.x * 2) / w), th = Math.tan((cam.fov * Math.PI) / 360) * cam.aspect * libre;
    dist = Math.max(15, 8.6 / th - 1);
  }
  addEventListener('resize', tam); tam();

  let ultimo = performance.now(), visible = true;
  document.addEventListener('visibilitychange', () => { visible = !document.hidden; if (visible) { ultimo = performance.now(); requestAnimationFrame(cuadro); } });
  function cuadro(ahora) {
    if (!visible) return;
    const dt = Math.min(0.05, (ahora - ultimo) / 1000); ultimo = ahora;
    const t = (ahora - t0) / 1000;
    // el salto de piso: la puerta se abre, la cámara sube y la torre gira hasta la puerta de arriba
    if (salto) {
      salto.t += dt / salto.dur;
      const p = clamp(salto.t, 0, 1);
      const pa = pisos[salto.de]; if (pa) { const ab = suave(clamp(p * 2.2, 0, 1)); pa.hojas[0].rotation.y = -ab * 1.7; pa.hojas[1].rotation.y = ab * 1.7; }
      const q = suave(clamp((p - 0.35) / 0.65, 0, 1));
      camY = salto.y0 + (salto.y1 - salto.y0) * q; giro = salto.g0 + (salto.g1 - salto.g0) * q;
      if (p >= 1) { const fin = salto.fin; salto = null; camYObj = camY; giroObj = giro; if (fin) fin(); }
    } else { camY += (camYObj - camY) * Math.min(1, dt * 4); giro += (giroObj - giro) * Math.min(1, dt * 4); }
    torre.rotation.y = giro + (calma ? 0 : Math.sin(t * 0.25) * 0.05);
    const sx = sacude > 0 ? Math.sin(t * 60) * 0.12 * sacude : 0; sacude = Math.max(0, sacude - dt * 2.5);
    cam.position.set(sx, camY + 2.2, R + dist);
    cam.lookAt(0, camY + 0.2, 0);
    // el cielo oscurece al subir: de día a noche en unos 40 pisos
    const n = clamp(camY / (40 * H), 0, 1);
    scene.background.copy(cielo0).lerp(cielo1, n); scene.fog.color.copy(scene.background);
    mEst.opacity = clamp((n - 0.45) * 2, 0, 1); estrellas.position.y = camY;
    sol.position.set(8, camY + 20, 14); sol.target.position.set(0, camY, 0);
    nubes.forEach(g => {
      const u = g.userData; if (!calma) u.a += u.v * dt;
      let y = u.dy + Math.round((camY - u.dy) / 40) * 40; // se reparten en franjas de 40 m alrededor de la cámara
      g.position.set(Math.sin(u.a) * u.d, y, Math.cos(u.a) * u.d - 6); g.lookAt(cam.position.x, y, cam.position.z);
    });
    if (buhoG.visible) { buhoG.children.forEach(c => { c.rotation.y = calma ? 0 : Math.sin(t * 0.9) * 0.35; }); if (mixer && !calma) mixer.update(dt); }
    ren.render(scene, cam);
    requestAnimationFrame(cuadro);
  }
  requestAnimationFrame(cuadro);

  const ponBuho = i => {
    if (i == null) { buhoG.visible = false; return; }
    const a = i * PASO + 0.42, rr = R + 0.75;
    buhoG.position.set(Math.sin(a) * rr, i * H + 0.28, Math.cos(a) * rr); buhoG.rotation.y = a; buhoG.visible = true;
  };
  return {
    /** De pisoAct a `n` (0 = el primero), con la puerta que se abre; `fin` cuando la cámara llegó. */
    subir(n, fin) {
      asegurar(n);
      const de = pisoAct; pisoAct = n;
      const y1 = n * H + H * 0.45, g1 = -n * PASO;
      if (calma) { const pa = pisos[de]; if (pa) { pa.hojas[0].rotation.y = -1.7; pa.hojas[1].rotation.y = 1.7; } camY = camYObj = y1; giro = giroObj = g1; if (fin) setTimeout(fin, 0); return; }
      salto = { t: 0, dur: 1.5, de, y0: camY, y1, g0: giro, g1, fin };
    },
    /** Sin animación (al empezar de nuevo): las puertas de abajo abiertas, las de arriba cerradas. */
    irA(n) {
      asegurar(n); pisoAct = n; salto = null;
      pisos.forEach((p, i) => { const ab = i < n ? 1.7 : 0; p.hojas[0].rotation.y = -ab; p.hojas[1].rotation.y = ab; });
      camY = camYObj = n * H + H * 0.45; giro = giroObj = -n * PASO;
    },
    buho: ponBuho,
    calma(b) { calma = !!b; },
    hueco(h) { hueco = h; tam(); },
    sacudir() { if (!calma) sacude = 1; }
  };
}

/* El GLB del búho: GLTFLoader y meshopt de r128 (dentro de app2 junto a three.min.js; suelto, de jsdelivr). */
function cargarScript(src) { return new Promise((si, no) => { const s = document.createElement('script'); s.src = src; s.onload = si; s.onerror = () => no(new Error('no cargó ' + src)); document.head.appendChild(s); }); }
function cargarBuho(biblio) {
  const J3 = window.Juegos3D || {}, cdn = 'https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/';
  const una = (f, dir, hay) => (hay() ? Promise.resolve() : (J3.enApp ? cargarScript('../' + f).then(() => { if (!hay()) throw new Error('vacío'); }) : Promise.reject(new Error('suelto')))
    .catch(() => cargarScript(cdn + dir + f)));
  return una('GLTFLoader.js', 'loaders/', () => T.GLTFLoader).then(() => una('meshopt_decoder.js', 'libs/', () => window.MeshoptDecoder)).then(() => new Promise((si, no) => {
    const l = new T.GLTFLoader(); if (window.MeshoptDecoder) l.setMeshoptDecoder(window.MeshoptDecoder); l.setCrossOrigin('anonymous');
    const t = setTimeout(() => no(new Error('tardó demasiado')), 25000);
    l.load(biblio + 'modelos/buho.glb', g => { clearTimeout(t); si(g); }, undefined, e => { clearTimeout(t); no(e instanceof Error ? e : new Error('no cargó el GLB')); });
  }));
}

window.Torre3D = { crear, disponible: !!T };
})();
