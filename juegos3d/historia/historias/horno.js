/* El horno de fuego (Daniel 3). Joseth, 9 nov 2026: encargos/historias-3d.md de myvc_biblioteca.
   - La historia va por momentos ENTRE las preguntas (H.momentos; el motor los reparte): la música y la reverencia, los
     tres de pie, la acusación, el rey los llama, su respuesta, el horno siete veces más caliente, «¡átenlos!». El
     final, después de la última: al horno; la llamarada alcanza a los soldados (Dn 3:22); los cuatro caminan en el
     fuego; salen; el rey alaba a Dios.
   - Cada acierto aviva el fuego (×1 a ×7, de 600 a 1300 °C): el reto «De pie ante el fuego».
   - El horno se hace aquí con código (Joseth, 9 nov: «más grande y los cuatro dentro»): una cúpula hueca de ladrillo
     con una puerta ancha, para ver adentro a los que caminan delante del fuego. El GLB de Tripo era macizo.
   - La estatua es la del sueño de Daniel 2 (estatua-sueno) pintada toda de oro, como se enseña en las iglesias
     adventistas. Los textos parafrasean Daniel 3 (no se cita la RV1960).
   - Con las animaciones de Mixamo (idle, walk, talk, kneel, angry, point, pray, push, knockback) los personajes se
     mueven solos (ctx.anim); sin ellas, el motor hace lo que puede (respirar, asentir, balancearse).
   - Sonidos (ctx.sonido, sonido.js): el fuego según su fuerza, la música de Dn 3:5, las llamaradas, la explosión de la
     puerta y el acorde del ángel. */
(function () {
'use strict';
const H = {};
(window.HISTORIAS = window.HISTORIAS || {}).horno = H;

H.titulo = { es: 'El horno de fuego', en: 'The Fiery Furnace' };
H.frase = { es: 'Sadrac, Mesac y Abed-nego no se inclinan ante la estatua de oro, aunque el rey caliente el horno siete veces más.',
  en: 'Shadrach, Meshach and Abednego will not bow to the golden statue, even when the king makes the furnace seven times hotter.' };
H.como = { es: 'Contesta las preguntas. Entre una y otra, la historia sigue; con cada acierto el fuego crece y los tres siguen de pie.',
  en: 'Answer the questions. Between them, the story goes on; with each right answer the fire grows and the three keep standing.' };
H.reto = { es: 'De pie ante el fuego', en: 'Standing firm' };
H.modelos = ['estatua-sueno', 'nabucodonosor', 'guardia', 'sadrac', 'mesac', 'abednego', 'angel', 'pueblo-hombre', 'pueblo-mujer'];
/* las voces (Kokoro) de cada quien: tools/voz_historia.py de myvc_biblioteca */
H.voces = { narrador: 'narrador', rey: 'rey', tres: 'joven', hombre: 'hombre' };

/* la temperatura del horno: de 600 °C (rojo) a 1300 °C (blanco); «siete veces» en siete escalones */
const temp = f => Math.round((600 + 700 * f) / 10) * 10;
const veces = f => Math.max(1, Math.ceil(f * 7));
H.valorReto = f => (f > 0 ? '×' + veces(f) + ' · ' + temp(f) + ' °C' : '');
const COLORES = [[0.85, 0.16, 0.05], [1, 0.42, 0.06], [1, 0.72, 0.15], [1, 0.95, 0.78]];
function colorCalor(f) {
  const x = Math.min(0.999, Math.max(0, f)) * (COLORES.length - 1), i = Math.floor(x), u = x - i, a = COLORES[i], b = COLORES[i + 1];
  return [a[0] + (b[0] - a[0]) * u, a[1] + (b[1] - a[1]) * u, a[2] + (b[2] - a[2]) * u];
}
H.colorPaso = f => { const c = colorCalor(0.15 + 0.85 * f).map(v => Math.round(v * 255)); return 'rgb(' + c.join(' ') + ')'; };

H.preguntas = {
  es: [
    { p: '¿De qué estaba hecha la estatua que mandó hacer el rey?', opciones: ['De oro', 'De barro', 'De madera'], correcta: 0 },
    { p: '¿Qué tenían que hacer todos al oír la música?', opciones: ['Inclinarse ante la estatua', 'Bailar', 'Irse a casa'], correcta: 0 },
    { p: '¿Cuántos jóvenes no se inclinaron?', opciones: ['Tres', 'Uno', 'Doce'], correcta: 0 },
    { p: '¿Cuántas veces más mandó calentar el horno el rey?', opciones: ['Siete', 'Dos', 'Diez'], correcta: 0 },
    { p: '¿Qué les pasó a los soldados que los echaron al horno?', opciones: ['Los alcanzó la llama', 'Se fueron a casa', 'Nada'], correcta: 0 },
    { p: '¿Cuántos hombres vio el rey caminando dentro del fuego?', opciones: ['Cuatro', 'Tres', 'Ninguno'], correcta: 0 },
    { p: '¿Quién los cuidó dentro del fuego?', opciones: ['Un ángel que Dios envió', 'Los soldados', 'El rey'], correcta: 0 }
  ],
  en: [
    { p: 'What was the king’s statue made of?', opciones: ['Gold', 'Clay', 'Wood'], correcta: 0 },
    { p: 'What did everyone have to do when the music played?', opciones: ['Bow down to the statue', 'Dance', 'Go home'], correcta: 0 },
    { p: 'How many young men did not bow down?', opciones: ['Three', 'One', 'Twelve'], correcta: 0 },
    { p: 'How many times hotter did the king make the furnace?', opciones: ['Seven', 'Two', 'Ten'], correcta: 0 },
    { p: 'What happened to the soldiers who threw them into the furnace?', opciones: ['The flames reached them', 'They went home', 'Nothing'], correcta: 0 },
    { p: 'How many men did the king see walking in the fire?', opciones: ['Four', 'Three', 'None'], correcta: 0 },
    { p: 'Who took care of them in the fire?', opciones: ['An angel sent by God', 'The soldiers', 'The king'], correcta: 0 }
  ]
};

const QUIEN = {
  narrador: { es: '', en: '', voz: 'narrador' },
  rey: { es: 'El rey Nabucodonosor', en: 'King Nebuchadnezzar', voz: 'rey' },
  tres: { es: 'Sadrac, Mesac y Abed-nego', en: 'Shadrach, Meshach and Abednego', voz: 'joven' },
  hombre: { es: 'Unos hombres del rey', en: 'Some of the king’s men', voz: 'hombre' }
};

/* ---------- el horno: cúpula hueca de ladrillo con una puerta ancha ---------- */
const C = { x: -4.5, z: -4.5 }, R = 4, BASE = 0.35, ALTO_PUERTA = 2.9;
function ladrillos(THREE, oscuro) {
  const c = document.createElement('canvas'); c.width = 512; c.height = 256;
  const g = c.getContext('2d');
  g.fillStyle = oscuro ? '#2a120a' : '#8a4a24'; g.fillRect(0, 0, 512, 256);
  const filas = 8, porFila = 6, h = 256 / filas, w = 512 / porFila;
  for (let f = 0; f < filas; f++) {
    for (let i = -1; i < porFila; i++) {
      const x = i * w + (f % 2 ? w / 2 : 0);
      const l = oscuro ? 14 + Math.random() * 10 : 42 + Math.random() * 14;
      g.fillStyle = 'hsl(' + (16 + Math.random() * 10) + ' ' + (oscuro ? 45 : 62 + Math.random() * 10) + '% ' + l + '%)';
      g.fillRect(x + 3, f * h + 3, w - 6, h - 6);
    }
  }
  const t = new THREE.CanvasTexture(c); t.encoding = THREE.sRGBEncoding; t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(10, 4);
  return t;
}
function brasas(THREE) {
  const c = document.createElement('canvas'); c.width = c.height = 256;
  const g = c.getContext('2d'), r = g.createRadialGradient(128, 128, 10, 128, 128, 128);
  r.addColorStop(0, '#ffb347'); r.addColorStop(0.5, '#c2410c'); r.addColorStop(1, '#3b0d02');
  g.fillStyle = r; g.fillRect(0, 0, 256, 256);
  for (let i = 0; i < 260; i++) { g.fillStyle = 'rgba(255,' + (120 + Math.random() * 100 | 0) + ',40,' + (0.3 + Math.random() * 0.5) + ')'; g.beginPath(); g.arc(Math.random() * 256, Math.random() * 256, 2 + Math.random() * 5, 0, 6.3); g.fill(); }
  const t = new THREE.CanvasTexture(c); t.encoding = THREE.sRGBEncoding; return t;
}
function crearHorno(ctx) {
  const T = ctx.THREE, g = new T.Group(); g.position.set(C.x, 0, C.z);
  const ancho = 1.15, td = Math.acos(ALTO_PUERTA / R), chim = 0.12;
  const fuera = new T.MeshStandardMaterial({ map: ladrillos(T, false), roughness: 0.95 });
  const dentro = new T.MeshStandardMaterial({ map: ladrillos(T, true), roughness: 1, side: T.BackSide, emissive: 0x5a1a06, emissiveIntensity: 0.5 });
  const phiS = Math.PI / 2 + ancho / 2, phiL = Math.PI * 2 - ancho;
  const malla = (geo, mat, sombra) => { const m = new T.Mesh(geo, mat); m.position.y = BASE; m.castShadow = !!sombra; m.receiveShadow = true; g.add(m); return m; };
  // la banda de abajo, sin la puerta; la tapa de arriba entera, con la boca de la chimenea
  malla(new T.SphereGeometry(R, 72, 14, phiS, phiL, td, Math.PI / 2 - td), fuera, true);
  malla(new T.SphereGeometry(R, 72, 14, 0, Math.PI * 2, chim, td - chim), fuera, true);
  malla(new T.SphereGeometry(R - 0.32, 72, 14, phiS, phiL, td, Math.PI / 2 - td), dentro);
  malla(new T.SphereGeometry(R - 0.32, 72, 14, 0, Math.PI * 2, chim, td - chim), dentro);
  // el grosor del muro en el corte de la puerta: dos bandas que siguen la curva de la cúpula y el dintel por debajo
  const canto = new T.MeshStandardMaterial({ color: 0x9a4a22, roughness: 1, side: T.DoubleSide });
  [Math.PI / 2 - ancho / 2, Math.PI / 2 + ancho / 2].forEach(phi => {
    const v = [], N = 16;
    for (let i = 0; i <= N; i++) {
      const th = td + (Math.PI / 2 - td) * i / N;
      [R, R - 0.32].forEach(r => v.push(-r * Math.cos(phi) * Math.sin(th), r * Math.cos(th), r * Math.sin(phi) * Math.sin(th)));
    }
    const idx = [];
    for (let i = 0; i < N; i++) { const a = i * 2; idx.push(a, a + 1, a + 2, a + 1, a + 3, a + 2); }
    const geo = new T.BufferGeometry(); geo.setAttribute('position', new T.Float32BufferAttribute(v, 3)); geo.setIndex(idx); geo.computeVertexNormals();
    malla(geo, canto);
  });
  const dintel = new T.RingGeometry((R - 0.32) * Math.sin(td), R * Math.sin(td), 24, 1, Math.PI / 2 - ancho / 2, ancho);
  dintel.rotateX(Math.PI / 2);
  const d = malla(dintel, canto); d.position.y = BASE + ALTO_PUERTA - 0.08;
  // la base (también el escalón de la puerta), el suelo de brasas y la chimenea
  const base = new T.Mesh(new T.CylinderGeometry(R + 0.35, R + 0.5, BASE, 72), fuera); base.position.y = BASE / 2; base.receiveShadow = base.castShadow = true; g.add(base);
  const suelo = new T.Mesh(new T.CircleGeometry(R - 0.32, 48), new T.MeshStandardMaterial({ map: brasas(T), emissive: 0xff5a12, emissiveIntensity: 0.35, roughness: 1 }));
  suelo.rotation.x = -Math.PI / 2; suelo.position.y = BASE + 0.01; g.add(suelo);
  const cr = R * Math.sin(chim);
  const chimenea = new T.Mesh(new T.CylinderGeometry(cr + 0.12, cr + 0.22, 0.7, 24, 1, true), fuera); chimenea.position.y = BASE + R * Math.cos(chim) + 0.2; g.add(chimenea);
  ctx.escena.add(g);
  return { g, suelo, puerta: { x: C.x, z: C.z + R } };
}

/* ---------- el fuego: chispas que suben, una luz dentro y el resplandor de la puerta ---------- */
let fuego = null, horno = null, A = {}, inicial = [];
function textura(THREE) {
  const c = document.createElement('canvas'); c.width = c.height = 64;
  const g = c.getContext('2d'), r = g.createRadialGradient(32, 32, 0, 32, 32, 32);
  r.addColorStop(0, 'rgba(255,255,255,1)'); r.addColorStop(0.35, 'rgba(255,255,255,.55)'); r.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = r; g.fillRect(0, 0, 64, 64);
  const t = new THREE.CanvasTexture(c); t.encoding = THREE.sRGBEncoding; return t;
}
function crearFuego(ctx, centro, radio, alto, puerta) {
  const THREE = ctx.THREE, tex = textura(THREE), grupo = new THREE.Group(), N = ctx.reducir ? 80 : 170, ps = [];
  for (let i = 0; i < N; i++) {
    const m = new THREE.SpriteMaterial({ map: tex, color: 0xff7a1a, blending: THREE.AdditiveBlending, depthWrite: false, transparent: true, opacity: 0 });
    const s = new THREE.Sprite(m); grupo.add(s);
    ps.push({ s, vida: Math.random(), v: 0.6 + Math.random() * 0.8, x: 0, z: 0, tam: 0.45 + Math.random() * 0.55 });
  }
  grupo.position.copy(centro); ctx.escena.add(grupo);
  // la llamarada que sale por la puerta (Dn 3:22): chispas que se disparan hacia afuera
  const boca = new THREE.Group(), chorro = [];
  for (let i = 0; i < 70; i++) {
    const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, color: 0xffa040, blending: THREE.AdditiveBlending, depthWrite: false, transparent: true, opacity: 0 }));
    boca.add(s); chorro.push({ s, t: 1, vx: 0, vy: 0, vz: 0 });
  }
  boca.position.set(puerta.x, BASE + 1.2, puerta.z - 0.4); ctx.escena.add(boca);
  const luz = new THREE.PointLight(0xff8a2a, 0, R * 3, 2); luz.position.set(centro.x, BASE + 1.4, centro.z); ctx.escena.add(luz);
  const fuera = new THREE.PointLight(0xff8a2a, 0, 10, 2); fuera.position.set(puerta.x, 1.6, puerta.z + 0.6); ctx.escena.add(fuera);
  const F = { f: 0, meta: 0, extra: 0, haloK: 1,
    soplo() { chorro.forEach(p => { p.t = Math.random() * 0.15; p.vx = (Math.random() - 0.5) * 5; p.vy = 1 + Math.random() * 3; p.vz = 5 + Math.random() * 6; p.s.position.set(0, 0, 0); }); } };
  ctx.cadaCuadro((dt, t) => {
    F.f += (F.meta - F.f) * Math.min(1, dt * 1.5);
    F.extra = Math.max(0, F.extra - dt * 0.5);
    const fe = Math.min(1, F.f + F.extra), k = 0.2 + 0.8 * fe, c = colorCalor(fe * (0.55 + 0.45 * F.haloK));
    ps.forEach(p => {
      p.vida += dt * p.v * (0.7 + fe);
      if (p.vida >= 1) { p.vida -= 1; const a = Math.random() * 6.283, d = Math.sqrt(Math.random()) * radio; p.x = Math.cos(a) * d; p.z = Math.sin(a) * d; }
      const u = p.vida, y = u * alto * (0.35 + 0.65 * k);
      p.s.position.set(p.x * (1 - u * 0.6), y, p.z * (1 - u * 0.6));
      const e = p.tam * (0.6 + 1.3 * k) * (1 - u * 0.7); p.s.scale.set(e, e * 1.35, 1);
      const top = u * 0.7; p.s.material.color.setRGB(c[0], c[1] * (1 - top * 0.6), c[2] * (1 - top));
      p.s.material.opacity = Math.sin(u * Math.PI) * (0.35 + 0.65 * k) * (0.5 + 0.5 * F.haloK);
    });
    chorro.forEach(p => {
      if (p.t >= 1) { p.s.material.opacity = 0; return; }
      p.t += dt * 1.1; p.s.position.x += p.vx * dt; p.s.position.y += p.vy * dt; p.s.position.z += p.vz * dt;
      const e = 0.6 + p.t * 1.8; p.s.scale.set(e, e, 1); p.s.material.opacity = Math.sin(Math.min(1, p.t) * Math.PI) * 0.9;
    });
    const parpadeo = 1 + Math.sin(t * 13) * 0.06 + Math.sin(t * 7.3) * 0.05;
    luz.color.setRGB(c[0], c[1], c[2]); luz.intensity = (2 + 6 * fe) * parpadeo;
    fuera.color.setRGB(c[0], c[1] * 0.7, c[2] * 0.4); fuera.intensity = (0.3 + 1.1 * fe) * parpadeo;
    horno.suelo.material.emissiveIntensity = 0.25 + 0.75 * fe;
    ctx.sonido('fuego', { nivel: fe });
  });
  return F;
}

/* ---------- el escenario: la llanura de Dura ---------- */
const TRES = () => [A.sadrac, A.mesac, A.abednego];
const LUGAR = { rey: [6, 0.5], tres: [[1.2, 3.2], [2.3, 3.6], [3.4, 3.2]], anteRey: [[4.4, 2.9], [5.3, 3.3], [6.2, 3.0]] };
H.montar = async function (ctx) {
  const THREE = ctx.THREE, E = ctx.escena;
  E.background = new THREE.Color(0xf1c58c);
  E.fog = new THREE.Fog(0xf1c58c, 45, 160);
  E.add(new THREE.HemisphereLight(0xfff1d6, 0x8a6a45, 0.75));
  const sol = new THREE.DirectionalLight(0xffe2b0, 1.5);
  sol.position.set(-18, 26, 16); sol.castShadow = true;
  sol.shadow.mapSize.set(2048, 2048);
  Object.assign(sol.shadow.camera, { left: -26, right: 26, top: 26, bottom: -26, near: 1, far: 90 });
  E.add(sol);
  const suelo = new THREE.Mesh(new THREE.PlaneGeometry(300, 300), new THREE.MeshStandardMaterial({ color: 0xd8b47a, roughness: 1 }));
  suelo.rotation.x = -Math.PI / 2; suelo.receiveShadow = true; E.add(suelo);
  // un zigurat a lo lejos (Babilonia) y colinas bajas
  const ladrillo = new THREE.MeshStandardMaterial({ color: 0xc08a55, roughness: 0.95 });
  [[18, 4], [13, 4], [8, 4], [4, 3]].reduce((y, [lado, alto]) => {
    const b = new THREE.Mesh(new THREE.BoxGeometry(lado, alto, lado), ladrillo); b.position.set(-36, y + alto / 2, -64); E.add(b); return y + alto;
  }, 0);
  for (let i = 0; i < 7; i++) {
    const c = new THREE.Mesh(new THREE.SphereGeometry(18 + i * 3, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2), new THREE.MeshStandardMaterial({ color: 0xcfa36a, roughness: 1 }));
    c.scale.y = 0.25; c.position.set(-90 + i * 32, 0, -112 - (i % 2) * 15); E.add(c);
  }
  // la estatua en su pedestal
  const ped = new THREE.Mesh(new THREE.BoxGeometry(4.5, 3, 4.5), new THREE.MeshStandardMaterial({ color: 0xcbb89a, roughness: 0.9 }));
  ped.position.set(12, 1.5, -26); ped.castShadow = ped.receiveShadow = true; E.add(ped);
  A.estatua = await ctx.actor('estatua-sueno', { x: 12, y: 3, z: -26, altura: 18, material: ctx.oro });
  // el horno y su fuego (detrás del centro, para que se vea a los que caminan delante)
  horno = crearHorno(ctx);
  const P = horno.puerta;
  fuego = crearFuego(ctx, new THREE.Vector3(C.x, BASE, C.z - 1.1), 1.05, 3.4, P);
  // personajes
  A.rey = await ctx.actor('nabucodonosor', { x: LUGAR.rey[0], z: LUGAR.rey[1], altura: 1.9, color: 0x6b2c91 });
  A.trono = trono(ctx);
  A.g1 = await ctx.actor('guardia', { x: P.x - 3, z: P.z + 1.2, altura: 1.85, color: 0x8b2a1d });
  A.g2 = await ctx.actor('guardia', { x: P.x + 3, z: P.z + 1.2, altura: 1.85, color: 0x8b2a1d });
  A.sadrac = await ctx.actor('sadrac', { x: LUGAR.tres[0][0], z: LUGAR.tres[0][1], altura: 1.75, color: 0x2b3f8f });
  A.mesac = await ctx.actor('mesac', { x: LUGAR.tres[1][0], z: LUGAR.tres[1][1], altura: 1.75, color: 0x23703c });
  A.abednego = await ctx.actor('abednego', { x: LUGAR.tres[2][0], z: LUGAR.tres[2][1], altura: 1.75, color: 0xb7791f });
  A.angel = await ctx.actor('angel', { x: C.x, z: C.z, altura: 1.85, color: 0xffffff,
    material: m => { const n = m.clone(); n.emissive = new THREE.Color(0xffe39a); n.emissiveIntensity = 0.45; return n; } });
  A.angel.g.visible = false;
  A.luzAngel = new THREE.PointLight(0xfff4d6, 0, 6, 2); A.luzAngel.position.y = 1.4; A.angel.g.add(A.luzAngel);
  // la multitud, mirando a la estatua
  A.gente = [];
  for (let i = 0; i < 12; i++) {
    const x = 0 + (i % 6) * 2.3 + (Math.random() - 0.5) * 0.6, z = -11 - Math.floor(i / 6) * 2.4 + (Math.random() - 0.5) * 0.6;
    const p = await ctx.actor(i % 2 ? 'pueblo-mujer' : 'pueblo-hombre', { x, z, altura: 1.6 + Math.random() * 0.2, color: i % 2 ? 0xb5432a : 0x8a6a45 });
    ctx.mirarA(p, 12, -26); A.gente.push(p);
  }
  A.acusador = A.gente[0];
  [A.g1, A.g2].forEach(a => ctx.mirarA(a, P.x, P.z + 4));
  ctx.mirarA(A.rey, 2, 5);
  A.trono.rotation.y = A.rey.g.rotation.y;
  // el rey empieza sentado en su trono (con Mixamo; sin él, de pie delante)
  if (A.rey.clips.sit) ctx.reposo(A.rey, 'sit');
  TRES().forEach(a => ctx.mirarA(a, 3, 10));
  inicial = [...Object.values(A).filter(a => a && a.g), ...A.gente].map(a => ({ a, x: a.g.position.x, y: a.g.position.y, z: a.g.position.z, r: a.g.rotation.y }));
  ctx.camara.position.set(3, 6, 18); ctx.mira.set(3, 3.5, -6);
};

/* el trono del rey: tarima, asiento y respaldo dorados, detrás de donde está el rey (Mixamo «Sitting» baja la cadera
   hasta la altura de una silla sobre el mismo punto del suelo) */
function trono(ctx) {
  const T = ctx.THREE, g = new T.Group(), oro = new T.MeshStandardMaterial({ color: 0xd9a531, metalness: 0.5, roughness: 0.35, emissive: 0x3a2500, emissiveIntensity: 0.4 });
  const tela = new T.MeshStandardMaterial({ color: 0x5e1426, roughness: 0.9 });
  const caja = (w, h, d, x, y, z, m) => { const b = new T.Mesh(new T.BoxGeometry(w, h, d), m); b.position.set(x, y, z); b.castShadow = b.receiveShadow = true; g.add(b); return b; };
  caja(1.6, 0.06, 1.8, 0, 0.03, 0.1, tela);              // alfombra
  caja(0.7, 0.1, 0.55, 0, 0.47, -0.12, oro);              // asiento
  caja(0.62, 0.06, 0.5, 0, 0.54, -0.12, tela);           // cojín
  caja(0.7, 1.25, 0.1, 0, 0.95, -0.42, oro);              // respaldo
  caja(0.1, 0.3, 0.55, -0.36, 0.7, -0.12, oro); caja(0.1, 0.3, 0.55, 0.36, 0.7, -0.12, oro);  // brazos
  [[-0.3, 0.1], [0.3, 0.1], [-0.3, -0.36], [0.3, -0.36]].forEach(([x, z]) => caja(0.08, 0.44, 0.08, x, 0.22, z, oro));
  g.position.set(LUGAR.rey[0], 0, LUGAR.rey[1]); ctx.escena.add(g);
  return g;
}

/* la multitud se inclina: con Mixamo se arrodilla; sin él, se dobla hacia adelante */
function inclinar(ctx, a, si) {
  if (a.clips && a.clips.kneel) return si ? ctx.anim(a, 'kneel', { una: true, quedarse: true }) : ctx.anim(a, 'idle');
  if (a.clips && a.clips['kneel-idle']) return ctx.anim(a, si ? 'kneel-idle' : 'idle', { fundido: 0.8 });  // la mujer: sólo «Kneeling Idle»
  const r0 = a.obj.rotation.x, r1 = si ? 0.55 : 0;
  return ctx.tween(0.9, u => { a.obj.rotation.x = r0 + (r1 - r0) * u; });
}
/* la llamarada tira a un soldado hacia atrás: con Mixamo, «Roll Kicking» (knockback); sin él, cae de espaldas */
function tumbar(ctx, a, dx, dz) {
  const x0 = a.g.position.x, z0 = a.g.position.z;
  const vuelo = ctx.tween(0.7, u => { a.g.position.x = x0 + dx * u; a.g.position.z = z0 + dz * u; });
  if (a.clips && a.clips.knockback) return Promise.all([vuelo, ctx.anim(a, 'knockback', { una: true, quedarse: true })]);
  return Promise.all([vuelo, ctx.tween(0.6, u => { a.obj.rotation.x = -1.45 * u; a.obj.position.y = a.base + Math.sin(u * Math.PI) * 0.4; })]);
}

H.reiniciar = async function (ctx) {
  inicial.forEach(i => { i.a.g.position.set(i.x, i.y, i.z); i.a.g.rotation.y = i.r; i.a.obj.rotation.x = 0; i.a.obj.position.y = i.a.base; ctx.anim(i.a, 'idle'); });
  A.angel.g.visible = false; A.luzAngel.intensity = 0;
  if (A.rey.clips.sit) ctx.reposo(A.rey, 'sit');
  Object.assign(fuego, { meta: 0, f: 0, extra: 0, haloK: 1 });
  ctx.camara.position.set(3, 6, 18); ctx.mira.set(3, 3.5, -6);
};

H.inicio = async function (ctx) {
  const d = ctx.decir;
  fuego.meta = 0.05;
  await ctx.camaraA([8, 9, 6], [12, 10, -26], 2.2);
  await d(QUIEN.narrador, { es: 'El rey Nabucodonosor mandó hacer una estatua de oro muy alta y la puso en la llanura de Dura.',
    en: 'King Nebuchadnezzar made a very tall golden statue and set it up on the plain of Dura.' });
  await ctx.camaraA([9.5, 2.6, 5.5], [6, 1.6, 0.5], 1.6);
  await d(QUIEN.rey, { es: '¡Cuando suene la música, todos se inclinan ante la estatua! Quien no lo haga, irá al horno de fuego.',
    en: 'When the music plays, everyone must bow down to the statue! Whoever does not will go into the fiery furnace.' }, { actor: A.rey, gesto: A.rey.reposo === 'sit' ? 'sit-talk' : 'point' });
};

/* cada acierto: el fuego sube un escalón (una llamarada y se asienta) */
H.avanzar = async function (ctx, k, meta, f) {
  fuego.meta = 0.05 + 0.95 * f; fuego.extra = 0.25;
  ctx.sonido('llamarada', { fuerza: 0.5 });
  await ctx.esperar(0.5);
};

/* lo que pasa entre pregunta y pregunta (el motor reparte estos siete entre las preguntas de la lección) */
H.momentos = [
  async function musica(ctx) {
    // de lado: la gente inclinada hacia la estatua, y la estatua al fondo
    await ctx.camaraA([-6, 3.5, -8], [9, 3, -20], 1.6);
    ctx.sonido('musica');
    if (A.rey.reposo === 'sit') ctx.anim(A.rey, 'sit-clap', { una: true });
    await Promise.all([ctx.decir(QUIEN.narrador, { es: 'Sonó la música, y todos se inclinaron ante la estatua de oro…', en: 'The music played, and everyone bowed down to the golden statue…' }),
      ...A.gente.map((p, i) => ctx.esperar(i * 0.08).then(() => inclinar(ctx, p, true)))]);
  },
  async function deDie(ctx) {
    await ctx.camaraA([2.3, 1.7, 8], [2.3, 1.3, 3.4], 1.6);
    await ctx.decir(QUIEN.narrador, { es: '…menos tres jóvenes: Sadrac, Mesac y Abed-nego. Ellos sólo adoraban al Dios del cielo.',
      en: '…except three young men: Shadrach, Meshach and Abednego. They worshiped only the God of heaven.' });
  },
  async function acusan(ctx) {
    const a = A.acusador;
    await inclinar(ctx, a, false);
    await ctx.camaraA([9, 2.6, 4], [6, 1.4, -2], 1.4);
    await ctx.mover(a, LUGAR.rey[0] + 0.4, LUGAR.rey[1] - 2.2, 2.6);
    ctx.mirarA(a, LUGAR.rey[0], LUGAR.rey[1]);
    if (A.rey.reposo !== 'sit') ctx.mirarA(A.rey, a.g.position.x, a.g.position.z);
    await ctx.decir(QUIEN.hombre, { es: '¡Oh rey! Esos tres jóvenes no te obedecen: no adoran tu estatua de oro.',
      en: 'O king! Those three young men do not obey you: they do not worship your golden statue.' }, { actor: a });
  },
  async function losLlama(ctx) {
    await ctx.decir(QUIEN.rey, { es: '¡Tráiganlos aquí!', en: 'Bring them here!' }, { actor: A.rey, gesto: A.rey.reposo === 'sit' ? 'sit-angry' : 'angry' });
    await ctx.camaraA([5.3, 2.2, 8.5], [5.3, 1.3, 1.5], 1.4);
    await Promise.all(TRES().map((a, i) => ctx.mover(a, LUGAR.anteRey[i][0], LUGAR.anteRey[i][1], 2.4)));
    TRES().forEach(a => ctx.mirarA(a, LUGAR.rey[0], LUGAR.rey[1]));
    await ctx.decir(QUIEN.rey, { es: '¿Es verdad que no adoran mi estatua? Si no lo hacen, irán al horno. ¿Qué dios los podrá librar de mi mano?',
      en: 'Is it true that you do not worship my statue? If you do not, you will go into the furnace. What god can save you from my hand?' }, { actor: A.rey, gesto: A.rey.reposo === 'sit' ? 'sit-talk' : 'point' });
  },
  async function responden(ctx) {
    await ctx.camaraA([7.5, 1.7, 5.5], [4.8, 1.4, 3], 1.3);
    await ctx.decir(QUIEN.tres, { es: 'Nuestro Dios puede librarnos del horno, y nos librará de tu mano, oh rey.',
      en: 'Our God is able to save us from the furnace, and he will save us from your hand, O king.' }, { actor: TRES() });
    await ctx.decir(QUIEN.tres, { es: 'Y si no lo hace, igual no adoraremos tu estatua.', en: 'And even if he does not, we will not worship your statue.' }, { actor: TRES(), gesto: 'no' });
  },
  async function sieteVeces(ctx) {
    await ctx.camaraA([8.5, 2.4, 1], [6, 1.6, 0.5], 1.2);
    // Dn 3:19: se llenó de ira; se levanta del trono
    if (A.rey.reposo === 'sit') { ctx.reposo(A.rey, 'idle'); await ctx.mover(A.rey, LUGAR.rey[0] - 0.6, LUGAR.rey[1] + 0.9, 0.9); ctx.mirarA(A.rey, 5.3, 3.1); }
    await ctx.decir(QUIEN.rey, { es: '¡Calienten el horno siete veces más de lo normal!', en: 'Heat the furnace seven times hotter than usual!' }, { actor: A.rey, gesto: A.rey.clips.furious ? 'furious' : 'angry' });
    const P = horno.puerta;
    await ctx.camaraA([P.x + 1, 2.4, P.z + 9], [P.x, 1.8, P.z - 1], 1.6);
    await Promise.all([ctx.mover(A.g1, P.x - 1.6, P.z + 0.8, 1.6), ctx.mover(A.g2, P.x + 1.6, P.z + 0.8, 1.6)]);
    [A.g1, A.g2].forEach(a => ctx.mirarA(a, P.x, P.z - 2));
    await Promise.all([ctx.anim(A.g1, 'push', { una: true }), ctx.anim(A.g2, 'push', { una: true })]);
    fuego.extra = 0.6; ctx.sonido('llamarada', { fuerza: 1 });
    await ctx.decir(QUIEN.narrador, { es: 'El fuego rugía tanto que nadie podía acercarse.', en: 'The fire roared so much that no one could come near.' });
    await Promise.all([ctx.mover(A.g1, P.x - 3, P.z + 2.2, 1.4), ctx.mover(A.g2, P.x + 3, P.z + 2.2, 1.4)]);
  },
  async function atenlos(ctx) {
    await ctx.camaraA([8.5, 2.4, 6], [5.3, 1.4, 2], 1.3);
    await ctx.decir(QUIEN.rey, { es: '¡Átenlos!', en: 'Tie them up!' }, { actor: A.rey, gesto: 'point' });
    await Promise.all([ctx.mover(A.g1, 4.4, 4.3, 3), ctx.mover(A.g2, 6.2, 4.4, 3)]);
    [A.g1, A.g2].forEach(a => ctx.mirarA(a, 5.3, 3.2));
    await ctx.decir(QUIEN.narrador, { es: 'Los soldados ataron a los tres jóvenes, con su ropa puesta.', en: 'The soldiers tied up the three young men, still wearing their clothes.' });
  }
];

H.final = async function (ctx) {
  const d = ctx.decir, P = horno.puerta, tres = TRES();
  fuego.meta = 1;
  await d(QUIEN.rey, { es: '¡Échenlos al horno!', en: 'Throw them into the furnace!' }, { actor: A.rey, gesto: 'angry' });
  await ctx.camaraA([P.x + 2.5, 3.2, P.z + 11], [P.x, 1, P.z + 2], 1.6);
  // los soldados los llevan hasta la puerta y los echan adentro
  await Promise.all([
    ...tres.map((a, i) => ctx.mover(a, P.x - 0.8 + i * 0.8, P.z + 1.4, 3.2)),
    ctx.mover(A.g1, P.x - 1.3, P.z + 2.4, 3.2), ctx.mover(A.g2, P.x + 1.3, P.z + 2.4, 3.2)
  ]);
  [A.g1, A.g2].forEach(a => ctx.mirarA(a, P.x, P.z));
  ctx.anim(A.g1, 'push', { una: true }); ctx.anim(A.g2, 'push', { una: true });
  await Promise.all(tres.map((a, i) => ctx.mover(a, P.x - 0.7 + i * 0.7, P.z - 1.2, 1.1).then(() => ctx.tween(0.25, u => { a.g.position.y = BASE * u; }))));
  // la llamarada sale por la puerta y alcanza a los soldados (Dn 3:22)
  fuego.extra = 1; fuego.soplo(); ctx.sonido('explosion');
  await Promise.all([tumbar(ctx, A.g1, -1.8, 3.2), tumbar(ctx, A.g2, 1.8, 3.2)]);
  await d(QUIEN.narrador, { es: 'La llama salió con tanta fuerza que alcanzó a los soldados que los habían echado al horno.',
    en: 'The flames came out so strongly that they reached the soldiers who had thrown them into the furnace.' });
  // frente a la puerta, para ver adentro; el fuego baja un poco su brillo para que se vea quién camina
  await ctx.camaraA([P.x + 0.8, 1.8, P.z + 5.2], [C.x, 1.2, C.z + 0.8], 1.6);
  await ctx.tween(0.8, u => { fuego.haloK = 1 - 0.7 * u; });
  A.angel.g.visible = true; A.angel.g.position.y = BASE;
  ctx.sonido('angel');
  await ctx.tween(1.2, u => { A.luzAngel.intensity = 2.5 * u; });
  // los cuatro caminan alrededor del fuego (los de adelante, cerca de la puerta, se ven)
  const cuatro = [A.angel, ...tres], rc = 2.35, cz = C.z - 0.3;
  cuatro.forEach(a => ctx.anim(a, 'walk'));
  let ang = Math.PI / 2;
  const parar = ctx.cadaCuadro(dt => {
    ang -= dt * 0.32;
    cuatro.forEach((a, i) => {
      const t = ang + i * Math.PI / 2, x = C.x + Math.cos(t) * rc, z = cz + Math.sin(t) * rc * 0.85;
      a.g.rotation.y = Math.atan2(x - a.g.position.x, z - a.g.position.z); a.g.position.x = x; a.g.position.z = z;
    });
  });
  ctx.mover(A.rey, P.x + 2.6, P.z + 3.4, 2.4).then(() => ctx.mirarA(A.rey, P.x, P.z));
  await d(QUIEN.rey, { es: '¿No echamos al fuego a tres hombres atados? ¡Veo cuatro, sueltos, caminando en medio del fuego, y ninguno se quema!',
    en: 'Didn’t we throw three men, tied up, into the fire? I see four men, untied, walking around in the fire, and they are not hurt!' }, { actor: A.rey, gesto: 'surprised' });
  await d(QUIEN.rey, { es: 'Y el cuarto parece un hijo de los dioses.', en: 'And the fourth one looks like a son of the gods.' }, { actor: A.rey });
  await d(QUIEN.rey, { es: 'Sadrac, Mesac y Abed-nego, siervos del Dios Altísimo, ¡salgan y vengan aquí!',
    en: 'Shadrach, Meshach and Abednego, servants of the Most High God, come out! Come here!' }, { actor: A.rey, gesto: 'point' });
  parar();
  await Promise.all(tres.map((a, i) => ctx.mover(a, P.x - 0.7 + i * 0.7, P.z - 0.4, 1.4)));
  await Promise.all(tres.map((a, i) => ctx.tween(0.3, u => { a.g.position.y = BASE * (1 - u); }).then(() => ctx.mover(a, P.x - 0.8 + i * 0.8, P.z + 2.2, 1.8))));
  tres.forEach(a => ctx.mirarA(a, P.x + 2.6, P.z + 3.4));
  ctx.anim(A.angel, 'idle');
  await ctx.tween(1.4, u => { A.luzAngel.intensity = 2.5 * (1 - u); });
  A.angel.g.visible = false;
  fuego.meta = 0.25; fuego.haloK = 1;
  await ctx.camaraA([P.x + 1.2, 2, P.z + 8.5], [P.x + 1, 1.3, P.z + 2.5], 1.6);
  await d(QUIEN.narrador, { es: 'El fuego no les hizo nada: ni un cabello quemado, y su ropa ni olía a humo.',
    en: 'The fire had not hurt them: not one hair was burned, and their clothes did not even smell of smoke.' });
  await d(QUIEN.rey, { es: '¡Bendito sea el Dios de Sadrac, Mesac y Abed-nego, que envió a su ángel y salvó a los que confiaron en él!',
    en: 'Praise the God of Shadrach, Meshach and Abednego, who sent his angel and saved the men who trusted in him!' }, { actor: A.rey });
  await Promise.all(TRES().map(a => ctx.anim(a, 'pray', { una: true })));
};
})();
