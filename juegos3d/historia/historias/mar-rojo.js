/* Moisés y el mar Rojo (Éx 14–15). Joseth, 9 nov 2026: «Moisés abre el mar Rojo, entran los carros y el mar se
   cierra»; encargos/historias-3d.md de myvc_biblioteca.
   - Reto: las doce tribus de Israel a salvo; cada acierto pone a una más en la otra orilla.
   - Momentos ENTRE las preguntas (H.momentos): el faraón los persigue, la columna se pone entre los dos campamentos,
     el viento abre el mar, cruzan en seco, los carros se traban, el mar vuelve a su lugar y el canto de María.
   - El mar, con código: dos bloques de agua que se tocan (mar llano) y se apartan creciendo hasta ser dos paredes,
     con olas en la cara de dentro. La columna de nube (de fuego por la noche), con esferas.
   - Modelos: moises, faraon y carro-egipcio (Tripo, sin rig; el carro sale con la lanza hacia −X y se gira dentro de
     su grupo), caballo, guardias del horno de aurigas, y el pueblo: pueblo-hombre, pueblo-mujer (María, con pandero),
     niño, niña, ovejas y cabra.
   - Las palabras parafrasean la Biblia (no se cita la RV1960). */
(function () {
'use strict';
const H = {};
(window.HISTORIAS = window.HISTORIAS || {})['mar-rojo'] = H;

H.titulo = { es: 'Moisés y el mar Rojo', en: 'Moses and the Red Sea' };
H.frase = { es: 'El faraón persiguió a Israel hasta el mar, y Dios abrió un camino en medio de las aguas.',
  en: 'Pharaoh chased Israel to the sea, and God opened a path through the waters.' };
H.como = { es: 'Contesta las preguntas. Cada acierto pone a salvo a una de las doce tribus de Israel, y la historia sigue.',
  en: 'Answer the questions. Each right answer brings one of the twelve tribes of Israel to safety, and the story goes on.' };
H.reto = { es: 'Tribus a salvo', en: 'Tribes safe' };
H.enOrden = true;
H.modelos = ['moises', 'faraon', 'carro-egipcio', 'caballo', 'guardia', 'pueblo-hombre', 'pueblo-mujer', 'nino', 'nina', 'oveja', 'cabra'];
H.voces = { narrador: 'narrador', moises: 'anciano', faraon: 'rey', pueblo: 'hombre', nina: 'nina', mama: 'mujer', miriam: 'mujer', egipcios: 'soldado' };

const TRIBUS = 12;
let IDI = 'es';
H.valorReto = f => {
  if (f <= 0) return '';
  const k = Math.round(f * TRIBUS);
  return IDI === 'en' ? k + ' of ' + TRIBUS : k + ' de ' + TRIBUS;
};
/* de la arena de Egipto al azul del mar */
H.colorPaso = f => {
  const a = [206, 168, 104], b = [42, 116, 173], u = Math.min(1, Math.max(0, f));
  return 'rgb(' + a.map((v, i) => Math.round(v + (b[i] - v) * u)).join(' ') + ')';
};

/* la pregunta k es sobre lo que se acaba de ver (el inicio, o el momento k−1) */
H.preguntas = {
  es: [
    { p: '¿Qué iba delante del pueblo para guiarlo de día?', opciones: ['Una columna de nube', 'Una estrella', 'Un pájaro'], correcta: 0 },
    { p: '¿Qué le dijo Moisés al pueblo asustado?', opciones: ['No tengan miedo: Dios peleará por ustedes', 'Corran a esconderse', 'Volvamos a Egipto'], correcta: 0 },
    { p: '¿Dónde se puso la columna de nube?', opciones: ['Entre los israelitas y los egipcios', 'Encima del mar', 'Detrás de las montañas'], correcta: 0 },
    { p: '¿Qué hizo Moisés para que el mar se abriera?', opciones: ['Extendió su mano sobre el mar', 'Tiró una piedra al agua', 'Gritó muy fuerte'], correcta: 0 },
    { p: '¿Cómo cruzaron los israelitas el mar?', opciones: ['Por tierra seca, entre dos paredes de agua', 'Nadando', 'En barcos'], correcta: 0 },
    { p: '¿Qué les pasó a los carros de los egipcios?', opciones: ['Las ruedas se trababan y no podían avanzar', 'Salieron volando', 'Llegaron primero a la orilla'], correcta: 0 },
    { p: '¿Qué pasó cuando Moisés extendió la mano otra vez?', opciones: ['El mar volvió a su lugar', 'Salió el arcoíris', 'Empezó a llover'], correcta: 0 }
  ],
  en: [
    { p: 'What went ahead of the people to guide them by day?', opciones: ['A pillar of cloud', 'A star', 'A bird'], correcta: 0 },
    { p: 'What did Moses tell the frightened people?', opciones: ['Do not be afraid: God will fight for you', 'Run and hide', 'Let’s go back to Egypt'], correcta: 0 },
    { p: 'Where did the pillar of cloud go?', opciones: ['Between the Israelites and the Egyptians', 'Over the sea', 'Behind the mountains'], correcta: 0 },
    { p: 'What did Moses do so that the sea opened?', opciones: ['He stretched out his hand over the sea', 'He threw a stone into the water', 'He shouted very loudly'], correcta: 0 },
    { p: 'How did the Israelites cross the sea?', opciones: ['On dry ground, between two walls of water', 'Swimming', 'In boats'], correcta: 0 },
    { p: 'What happened to the Egyptians’ chariots?', opciones: ['Their wheels got stuck and they could not move on', 'They flew away', 'They reached the shore first'], correcta: 0 },
    { p: 'What happened when Moses stretched out his hand again?', opciones: ['The sea went back to its place', 'A rainbow came out', 'It started to rain'], correcta: 0 }
  ]
};

const QUIEN = {
  narrador: { es: '', en: '', voz: 'narrador' },
  moises: { es: 'Moisés', en: 'Moses', voz: 'anciano' },
  faraon: { es: 'El faraón', en: 'Pharaoh', voz: 'rey' },
  pueblo: { es: 'El pueblo', en: 'The people', voz: 'hombre' },
  nina: { es: 'Una niña', en: 'A girl', voz: 'nina' },
  mama: { es: 'Su mamá', en: 'Her mother', voz: 'mujer' },
  miriam: { es: 'María, la hermana de Moisés', en: 'Miriam, Moses’ sister', voz: 'mujer' },
  egipcios: { es: 'Los egipcios', en: 'The Egyptians', voz: 'soldado' }
};

/* ---------- el lugar: Egipto delante (z > 0), el mar (z de 0 a −36) y la otra orilla detrás ---------- */
const MAR = { cerca: 0, lejos: -36 };
const ABRE = 4.2, ALTO = 5.5, LLANO = 0.35;   // medio ancho del camino, alto de las paredes, alto del mar llano
const MOISES = [0.6, 1.6];
const FARAON = [7, 32];
let A = {}, C = {}, inicial = [], quitaOlas = null, quitaAurigas = null;

const CIELOS = {
  dia: { cielo: 0x9ccbe8, luz: 0.95, hemi: 0.45, sol: 0xfff0d6 },
  tarde: { cielo: 0xe7a36c, luz: 0.85, hemi: 0.45, sol: 0xffc48a },
  noche: { cielo: 0x18203c, luz: 0.25, hemi: 0.28, sol: 0x9fb0ff },
  alba: { cielo: 0xe6b6a8, luz: 0.8, hemi: 0.5, sol: 0xffd6c0 }
};
function cielo(ctx, nombre, s) {
  const T = ctx.THREE, a = { c: C.fondo.clone(), l: C.sol.intensity, h: C.hemi.intensity, s: C.sol.color.clone() }, b = CIELOS[nombre];
  const cb = new T.Color(b.cielo), sb = new T.Color(b.sol);
  return ctx.tween(s || 2, u => {
    C.fondo.copy(a.c).lerp(cb, u); ctx.escena.background.copy(C.fondo); ctx.escena.fog.color.copy(C.fondo);
    C.sol.intensity = a.l + (b.luz - a.l) * u; C.hemi.intensity = a.h + (b.hemi - a.h) * u; C.sol.color.copy(a.s).lerp(sb, u);
  });
}

/* ---------- el mar: dos bloques que se apartan (abierto 0 → 1); las olas de la cara de dentro, cada cuadro ---------- */
function crearMar(ctx) {
  const T = ctx.THREE, mat = new T.MeshStandardMaterial({ color: 0x1d5e93, roughness: 0.15, metalness: 0.1, transparent: true, opacity: 0.92, emissive: 0x0a2440, emissiveIntensity: 0.35 });
  const bloque = lado => {
    const g = new T.BoxGeometry(1, 1, 1, 1, 10, 48);
    g.translate(lado * 0.5, 0.5, 0);   // la cara de dentro en x = 0, el suelo en y = 0
    const m = new T.Mesh(g, mat); m.scale.set(120, LLANO, MAR.cerca - MAR.lejos); m.position.set(0, 0, (MAR.cerca + MAR.lejos) / 2);
    m.userData.base = Float32Array.from(g.attributes.position.array);
    ctx.escena.add(m); return m;
  };
  C.aguaI = bloque(-1); C.aguaD = bloque(1); C.abierto = 0;
  // la espuma en lo alto de cada pared
  const espuma = new T.MeshStandardMaterial({ color: 0xf2f7fa, roughness: 1, transparent: true, opacity: 0.85 });
  C.espuma = [-1, 1].map(() => { const m = new T.Mesh(new T.BoxGeometry(0.45, 0.22, MAR.cerca - MAR.lejos, 1, 1, 24), espuma); m.position.z = (MAR.cerca + MAR.lejos) / 2; ctx.escena.add(m); return m; });
}
function abrirMar(u) {
  C.abierto = u;
  const borde = ABRE * u, alto = LLANO + (ALTO - LLANO) * Math.min(1, u * 1.6);
  C.aguaI.position.x = -borde; C.aguaD.position.x = borde;
  C.aguaI.scale.y = C.aguaD.scale.y = alto;
  C.espuma.forEach((m, i) => { m.visible = u > 0.04; m.position.set((i ? 1 : -1) * (borde + 0.12), alto + 0.02, m.position.z); });
}
function olas(t) {
  const amp = Math.min(1, C.abierto * 3);
  [C.aguaI, C.aguaD].forEach(m => {
    const p = m.geometry.attributes.position, b = m.userData.base, sx = m.scale.x, sy = m.scale.y, sz = m.scale.z;
    for (let i = 0; i < p.count; i++) {
      const x = b[i * 3], y = b[i * 3 + 1], z = b[i * 3 + 2], zw = z * sz;
      let nx = x, ny = y;
      if (Math.abs(x) < 1e-6 && amp > 0) nx = (0.22 * Math.sin(zw * 0.55 + t * 1.8 + y * 3) + 0.1 * Math.sin(zw * 1.7 - t * 2.6)) * amp / sx;
      if (y > 0.999) ny = 1 + (0.07 * Math.sin(zw * 0.8 + t * 1.3) + 0.05 * Math.sin(x * sx * 0.6 + t)) / sy;
      p.setX(i, nx); p.setY(i, ny);
    }
    p.needsUpdate = true; m.geometry.computeVertexNormals();
  });
}

/* ---------- la columna de nube (de día) y de fuego (de noche) ---------- */
function crearColumna(ctx) {
  const T = ctx.THREE, g = new T.Group();
  C.colMat = new T.MeshStandardMaterial({ color: 0xf4f1ea, roughness: 1, transparent: true, opacity: 0.92, emissive: 0xff7a1a, emissiveIntensity: 0 });
  for (let i = 0; i < 34; i++) {
    const r = 1.1 + Math.abs(Math.sin(i * 1.7)) * 0.6 + (i > 26 ? (i - 26) * 0.18 : 0);
    const s = new T.Mesh(new T.SphereGeometry(r, 14, 10), C.colMat);
    s.position.set(Math.sin(i * 2.3) * 0.7, 0.8 + i * 0.45, Math.cos(i * 1.9) * 0.7); g.add(s);
  }
  C.colLuz = new T.PointLight(0xff9a40, 0, 30, 1.6); C.colLuz.position.y = 5; g.add(C.colLuz);
  ctx.escena.add(g); return g;
}
function fuego(ctx, si, s) {
  const T = ctx.THREE, c0 = C.colMat.color.clone(), c1 = new T.Color(si ? 0xffb066 : 0xf4f1ea), e0 = C.colMat.emissiveIntensity, l0 = C.colLuz.intensity;
  return ctx.tween(s || 2, u => {
    C.colMat.color.copy(c0).lerp(c1, u); C.colMat.emissiveIntensity = e0 + ((si ? 0.9 : 0) - e0) * u; C.colLuz.intensity = l0 + ((si ? 2.2 : 0) - l0) * u;
  });
}

/* ---------- el viento del oriente: rayas blancas que cruzan el mar ---------- */
function crearViento(ctx) {
  const T = ctx.THREE, g = new T.Group(), mat = new T.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.45, depthWrite: false });
  C.rayas = [];
  for (let i = 0; i < 70; i++) {
    const m = new T.Mesh(new T.PlaneGeometry(2.6 + Math.random() * 2, 0.05), mat);
    m.position.set(-30 + Math.random() * 60, 0.8 + Math.random() * 6, MAR.lejos + Math.random() * (MAR.cerca - MAR.lejos));
    m.rotation.y = Math.PI * (Math.random() < 0.5 ? 0 : 1); m.userData.v = 14 + Math.random() * 10; g.add(m); C.rayas.push(m);
  }
  g.visible = false; ctx.escena.add(g); return g;
}

/* ---------- los carros: carro + caballo delante + auriga encima ---------- */
function ponerCarro(c, x, z, rumbo) {
  const dx = Math.sin(rumbo), dz = Math.cos(rumbo);
  c.carro.g.position.set(x, 0, z); c.carro.g.rotation.y = rumbo;
  c.caballo.g.position.set(x + dx * 2.6, 0, z + dz * 2.6); c.caballo.g.rotation.y = rumbo;
}
function moverCarro(ctx, c, x, z, s) {
  const x0 = c.carro.g.position.x, z0 = c.carro.g.position.z, rumbo = Math.atan2(x - x0, z - z0);
  if (c.caballo.clips.caminar) ctx.anim(c.caballo, 'caminar');
  return ctx.tween(s, u => ponerCarro(c, x0 + (x - x0) * u, z0 + (z - z0) * u, rumbo)).then(() => { if (c.caballo.clips.quieto) ctx.anim(c.caballo, 'quieto'); });
}

/* ---------- el pueblo: dónde acampa y dónde queda en la otra orilla ---------- */
const PUEBLO = [
  ['pueblo-hombre', 1.72, 0x8a6a45], ['pueblo-mujer', 1.64, 0xb5432a], ['nino', 1.2], ['pueblo-hombre', 1.7, 0x5d7a3e],
  ['pueblo-mujer', 1.62, 0x3d5f8a], ['nina', 1.15], ['oveja', 0.85], ['pueblo-hombre', 1.74, 0x7a4a6a], ['pueblo-mujer', 1.66, 0x9a7a2a],
  ['oveja', 0.8], ['cabra', 0.8]
];
const CAMPO = (i) => [-6 + (i % 6) * 2.3 + (i % 2) * 0.4, 5 + Math.floor(i / 6) * 2.6 + (i % 3) * 0.3];
const ORILLA = (i) => [-6.5 + (i % 6) * 2.5 + (i % 2) * 0.3, MAR.lejos - 5 - Math.floor(i / 6) * 2.4 - (i % 3) * 0.3];

H.montar = async function (ctx) {
  const T = ctx.THREE, E = ctx.escena;
  IDI = ctx.idioma === 'en' ? 'en' : 'es';
  C.fondo = new T.Color(CIELOS.dia.cielo);
  E.background = C.fondo.clone();
  E.fog = new T.Fog(C.fondo.clone(), 60, 200);
  C.hemi = new T.HemisphereLight(0xfff0d6, 0x6f5a40, CIELOS.dia.hemi); E.add(C.hemi);
  C.sol = new T.DirectionalLight(CIELOS.dia.sol, CIELOS.dia.luz);
  C.sol.position.set(18, 28, 14); C.sol.castShadow = true; C.sol.shadow.mapSize.set(2048, 2048);
  Object.assign(C.sol.shadow.camera, { left: -30, right: 30, top: 30, bottom: -30, near: 1, far: 100 });
  E.add(C.sol);
  const suelo = new T.Mesh(new T.PlaneGeometry(400, 400), new T.MeshStandardMaterial({ color: 0xcfb07a, roughness: 1 }));
  suelo.rotation.x = -Math.PI / 2; suelo.receiveShadow = true; E.add(suelo);
  // el fondo del mar: arena mojada, con piedras y conchas
  const lecho = new T.Mesh(new T.PlaneGeometry(240, MAR.cerca - MAR.lejos), new T.MeshStandardMaterial({ color: 0x8f7d58, roughness: 1 }));
  lecho.rotation.x = -Math.PI / 2; lecho.position.set(0, 0.01, (MAR.cerca + MAR.lejos) / 2); lecho.receiveShadow = true; E.add(lecho);
  const piedra = new T.MeshStandardMaterial({ color: 0x7a6a52, roughness: 1, flatShading: true });
  for (let i = 0; i < 26; i++) {
    const r = 0.12 + Math.random() * 0.22, m = new T.Mesh(new T.DodecahedronGeometry(r, 0), piedra);
    m.position.set(-3.6 + Math.random() * 7.2, r * 0.4, MAR.cerca - 1 - Math.random() * 34); m.receiveShadow = true; E.add(m);
  }
  // los montes del desierto, a los dos lados
  const roca = new T.MeshStandardMaterial({ color: 0xa48a62, roughness: 1, flatShading: true });
  [[-34, 18, 12, 7], [30, 22, 10, 6], [-40, -58, 14, 8], [34, -62, 12, 7], [0, -80, 18, 9], [-22, 44, 9, 5]].forEach(([x, z, r, h]) => {
    const m = new T.Mesh(new T.SphereGeometry(r, 10, 6, 0, Math.PI * 2, 0, Math.PI / 2), roca); m.scale.y = h / r; m.position.set(x, 0, z); E.add(m);
  });
  // las tiendas del campamento
  const lona = [0xe8dcc0, 0xc9a77a, 0xb88b5a].map(c => new T.MeshStandardMaterial({ color: c, roughness: 1, flatShading: true }));
  [[-11, 6], [-10, 11], [10, 7], [11, 12], [-4, 14], [4, 15], [-14, 15], [14, 16]].forEach(([x, z], i) => {
    const t = new T.Mesh(new T.ConeGeometry(1.5, 2.2, 4), lona[i % 3]); t.position.set(x, 1.1, z); t.rotation.y = i * 0.5; t.castShadow = true; E.add(t);
  });
  crearMar(ctx);
  A.columna = crearColumna(ctx);
  C.viento = crearViento(ctx);
  // la gente
  A.moises = await ctx.actor('moises', { x: MOISES[0], z: MOISES[1], altura: 1.78 });
  A.faraon = await ctx.actor('faraon', { x: FARAON[0], z: FARAON[1], altura: 1.8 });
  C.pueblo = [];
  for (let i = 0; i < PUEBLO.length; i++) {
    const [id, alto, color] = PUEBLO[i], [x, z] = CAMPO(i);
    C.pueblo.push(await ctx.actor(id, { x, z, altura: alto, color }));
  }
  A.miriam = C.pueblo[1]; A.mama = C.pueblo[4]; A.nina = C.pueblo[5];
  // el pandero de María, en su mano derecha
  let sk = null; A.miriam.obj.traverse(m => { if (!sk && m.isSkinnedMesh) sk = m.skeleton; });
  const mano = sk && sk.bones.find(b => /RightHand$/.test(b.name));
  if (mano) {
    const k = 1 / mano.getWorldScale(new T.Vector3()).x, p = new T.Group();
    const aro = new T.Mesh(new T.CylinderGeometry(0.13, 0.13, 0.05, 20, 1, true), new T.MeshStandardMaterial({ color: 0x9a6a3a, roughness: 0.8, side: T.DoubleSide }));
    const piel = new T.Mesh(new T.CircleGeometry(0.13, 20), new T.MeshStandardMaterial({ color: 0xeedcb4, roughness: 1, side: T.DoubleSide })); piel.rotation.x = -Math.PI / 2;
    p.add(aro, piel); p.scale.setScalar(k); p.position.y = 0.1 * k; p.rotation.z = Math.PI / 2; mano.add(p); C.pandero = p;
  }
  // los carros del faraón, con su auriga
  C.carros = [];
  for (let i = 0; i < 3; i++) {
    const carro = await ctx.actor('carro-egipcio', { x: 0, z: 60, altura: 1.4 });
    carro.obj.rotation.y += Math.PI / 2;
    const caballo = await ctx.actor('caballo', { x: 0, z: 62, altura: 1.7 });
    const auriga = await ctx.actor('guardia', { x: 0, z: 60, altura: 1.8, color: 0x8b6a1d });
    C.carros.push({ carro, caballo, auriga });
  }
  quitaAurigas = ctx.cadaCuadro(() => C.carros.forEach(c => {
    const r = c.carro.g.rotation.y;
    c.auriga.g.position.set(c.carro.g.position.x - Math.sin(r) * 0.3, 0.3, c.carro.g.position.z - Math.cos(r) * 0.3);
    c.auriga.g.rotation.y = r; c.auriga.g.visible = c.carro.g.visible;
  }));
  quitaOlas = ctx.cadaCuadro((dt, t) => {
    olas(t);
    A.columna.rotation.y += dt * 0.15;
    if (C.viento.visible) C.rayas.forEach(m => { m.position.x -= m.userData.v * dt; if (m.position.x < -30) m.position.x = 30; });
  });
  colocar(ctx);
  inicial = [...Object.values(A).filter(a => a && a.g), ...C.pueblo].map(a => ({ a, x: a.g.position.x, z: a.g.position.z, r: a.g.rotation.y }));
  ctx.camara.position.set(16, 10, 26); ctx.mira.set(0, 0, -4);
};

const CARROS_LEJOS = [[3, 64], [7, 70], [11, 66]];
function colocar(ctx) {
  abrirMar(0); fuego(ctx, false, 0.01); C.viento.visible = false;
  A.columna.position.set(-7, 0, -3);
  A.columna.visible = true;
  ctx.mirarA(A.moises, MOISES[0], -10);
  ctx.mirarA(A.faraon, 0, 0); A.faraon.g.visible = false;
  C.pueblo.forEach((a, i) => { const [x, z] = CAMPO(i); a.g.position.set(x, 0, z); ctx.mirarA(a, MOISES[0], MOISES[1]); a.reposo = null; ctx.anim(a, 'idle'); });
  C.carros.forEach((c, i) => { c.carro.g.visible = c.caballo.g.visible = true; ponerCarro(c, CARROS_LEJOS[i][0], CARROS_LEJOS[i][1], Math.PI); c.carro.g.rotation.z = 0; ctx.anim(c.auriga, 'idle'); });
  if (C.pandero) C.pandero.visible = false;
}

H.reiniciar = async function (ctx) {
  inicial.forEach(i => { i.a.g.position.set(i.x, 0, i.z); i.a.g.rotation.y = i.r; });
  colocar(ctx);
  await cielo(ctx, 'dia', 0.01);
  ctx.camara.position.set(16, 10, 26); ctx.mira.set(0, 0, -4);
};

H.inicio = async function (ctx) {
  const d = ctx.decir;
  await d(QUIEN.narrador, { es: 'Después de muchos años de esclavitud, Dios sacó a su pueblo de Egipto, y Moisés los guiaba.',
    en: 'After many years of slavery, God brought his people out of Egypt, and Moses led them.' });
  await ctx.camaraA([-15, 7, 10], [-7, 5, -3], 2);
  await d(QUIEN.narrador, { es: 'De día, una columna de nube iba delante de ellos, y de noche, una columna de fuego les daba luz.',
    en: 'By day, a pillar of cloud went ahead of them, and by night, a pillar of fire gave them light.' });
  await ctx.camaraA([MOISES[0] + 3.2, 2, MOISES[1] + 5.5], [MOISES[0], 1.4, MOISES[1] - 1], 1.6);
  ctx.mirarA(A.moises, 0, 8);
  await d(QUIEN.moises, { es: 'Dios nos dijo que acampáramos aquí, junto al mar.', en: 'God told us to camp here, by the sea.' }, { actor: A.moises });
};

H.avanzar = async function (ctx) { await ctx.esperar(0.4); };

H.momentos = [
  async function persecucion(ctx) {
    // el faraón cambia de idea y sale con sus carros
    A.faraon.g.visible = true; ctx.mirarA(A.faraon, 0, 0);
    await ctx.camaraA([FARAON[0] + 3, 2.2, FARAON[1] + 6], [FARAON[0] - 0.5, 1.4, FARAON[1]], 0.01);
    await ctx.decir(QUIEN.faraon, { es: '¿Qué hemos hecho? ¡Dejamos ir a los israelitas! ¡Preparen mi carro y todos los carros de Egipto! ¡Vamos tras ellos!',
      en: 'What have we done? We let the Israelites go! Prepare my chariot and all the chariots of Egypt! After them!' }, { actor: A.faraon });
    await ctx.camaraA([14, 4, 24], [3, 1, 18], 1.4);
    await Promise.all(C.carros.map((c, i) => moverCarro(ctx, c, -3 + i * 4, 24 + (i % 2) * 2.5, 4)));
    // el pueblo los ve y tiene miedo
    C.pueblo.forEach(a => ctx.mirarA(a, 0, 24));
    await ctx.camaraA([MOISES[0] + 3, 2.4, MOISES[1] - 3.2], [MOISES[0] - 0.5, 1.3, 7], 1.4);
    await ctx.decir(QUIEN.pueblo, { es: '¡Moisés! ¿Para qué nos sacaste de Egipto? ¡Los egipcios vienen detrás de nosotros!',
      en: 'Moses! Why did you bring us out of Egypt? The Egyptians are coming after us!' }, { actor: [C.pueblo[0], C.pueblo[3]] });
    ctx.mirarA(A.moises, 0, 8);
    await ctx.decir(QUIEN.moises, { es: '¡No tengan miedo! Quédense firmes y verán cómo Dios los salva hoy. Dios peleará por ustedes.',
      en: 'Do not be afraid! Stand firm and you will see how God saves you today. God will fight for you.' }, { actor: A.moises });
  },
  async function columna(ctx) {
    // la columna pasa de delante a detrás: oscuridad para Egipto, luz para Israel
    cielo(ctx, 'noche', 3);
    await ctx.camaraA([20, 9, 18], [0, 3, 8], 1.6);
    await Promise.all([
      ctx.tween(4, u => { A.columna.position.set(-7 + 7 * u, 0, -3 + 20 * u); }),
      fuego(ctx, true, 4)
    ]);
    await ctx.decir(QUIEN.narrador, { es: 'La columna de nube se movió y se puso detrás de ellos, entre los israelitas y los egipcios. Para los egipcios era oscuridad, y a Israel le alumbraba toda la noche.',
      en: 'The pillar of cloud moved and stood behind them, between the Israelites and the Egyptians. For the Egyptians it was darkness, and for Israel it gave light all night.' });
  },
  async function abrir(ctx) {
    // Moisés extiende la mano y el viento del oriente abre el mar toda la noche
    await ctx.camaraA([MOISES[0] + 2.6, 1.8, MOISES[1] + 4], [MOISES[0], 1.6, MOISES[1] - 4], 1.4);
    ctx.mirarA(A.moises, MOISES[0], -10);
    await ctx.decir(QUIEN.narrador, { es: 'Dios le dijo a Moisés: «Levanta tu vara y extiende tu mano sobre el mar».',
      en: 'God said to Moses, “Lift up your staff and stretch out your hand over the sea.”' });
    const r0 = A.moises.obj.rotation.x;
    await ctx.tween(0.6, u => { A.moises.obj.rotation.x = r0 - 0.12 * u; });
    ctx.sonido('angel');
    C.viento.visible = true;
    await ctx.camaraA([24, 12, 10], [0, 1, -18], 1.6);
    await Promise.all([
      ctx.tween(7, abrirMar),
      ctx.decir(QUIEN.narrador, { es: 'Moisés extendió su mano sobre el mar, y Dios mandó un viento muy fuerte del oriente toda la noche. Las aguas se dividieron.',
        en: 'Moses stretched out his hand over the sea, and God sent a very strong east wind all night. The waters were divided.' })
    ]);
    A.moises.obj.rotation.x = r0;
    C.viento.visible = false;
  },
  async function cruzar(ctx) {
    // por tierra seca, con una pared de agua a cada lado
    await ctx.camaraA([0, 2.4, 9], [0, 1.6, -20], 1.6);
    const filas = C.pueblo.map((a, i) => ({ a, i, dx: (i % 3 - 1) * 1.6 }));
    await ctx.mover(A.moises, 0, MAR.cerca - 2, 1.4);
    const ir = filas.map(({ a, i, dx }) => ctx.esperar(i * 0.35).then(() => ctx.mover(a, dx, MAR.cerca - 1 - (i % 4) * 1.5, 1.6)));
    ir.push(ctx.mover(A.moises, -0.4, MAR.cerca - 10, 4));
    await Promise.all(ir);
    await Promise.all([
      ctx.camaraA([2.6, 1.8, MAR.cerca - 6], [-0.5, 1.4, MAR.cerca - 16], 6),
      ...filas.map(({ a, i, dx }) => ctx.mover(a, dx * 0.9, MAR.cerca - 8 - i * 1.1, 6)),
      ctx.decir(QUIEN.narrador, { es: 'Los israelitas entraron por en medio del mar, en tierra seca, con una pared de agua a la derecha y otra a la izquierda.',
        en: 'The Israelites went through the middle of the sea on dry ground, with a wall of water on their right and another on their left.' })
    ]);
    ctx.mirarA(A.nina, A.nina.g.position.x - 4, A.nina.g.position.z);
    await ctx.camaraA([A.nina.g.position.x + 2.2, 1.4, A.nina.g.position.z + 2.4], [A.nina.g.position.x - 0.6, 1, A.nina.g.position.z - 0.4], 1.2);
    await ctx.decir(QUIEN.nina, { es: '¡Mamá, mira! ¡El agua está parada como un muro!', en: 'Mom, look! The water is standing up like a wall!' }, { actor: A.nina });
    await ctx.decir(QUIEN.mama, { es: 'Es Dios, hija. Él nos está abriendo el camino.', en: 'It is God, my child. He is opening the way for us.' }, { actor: A.mama });
    // todos a la otra orilla
    await Promise.all([
      ...C.pueblo.map((a, i) => { const [x, z] = ORILLA(i); return ctx.mover(a, x, z, 5); }),
      ctx.mover(A.moises, 1.2, MAR.lejos - 2.4, 5),
      ctx.camaraA([0, 9, 2], [0, 0.5, -32], 4)
    ]);
    C.pueblo.forEach(a => ctx.mirarA(a, 0, 0)); ctx.mirarA(A.moises, 0, 0);
  },
  async function carros(ctx) {
    // los egipcios entran detrás; al amanecer las ruedas se traban
    A.columna.visible = false;
    await ctx.camaraA([0, 3.4, 12], [0, 1, -8], 1.4);
    await ctx.decir(QUIEN.narrador, { es: 'Los egipcios los siguieron con todos los carros y los caballos del faraón, hasta la mitad del mar.',
      en: 'The Egyptians followed them with all of Pharaoh’s chariots and horses, into the middle of the sea.' });
    await Promise.all(C.carros.map((c, i) => moverCarro(ctx, c, -1.8 + i * 1.8, -10 - i * 4.5, 5)));
    cielo(ctx, 'alba', 3);
    await ctx.camaraA([3.4, 2.2, -5], [0, 1, -15], 1.4);
    ctx.sonido('mal');
    const quita = ctx.cadaCuadro((dt, t) => C.carros.forEach((c, i) => { c.carro.g.rotation.z = Math.sin(t * 14 + i) * 0.05; }));
    C.carros.forEach(c => ctx.anim(c.auriga, 'push'));
    await ctx.decir(QUIEN.narrador, { es: 'Al amanecer, Dios hizo que las ruedas de sus carros se trabaran, y casi no podían avanzar.',
      en: 'At dawn, God made the wheels of their chariots get stuck, and they could hardly move.' });
    await ctx.decir(QUIEN.egipcios, { es: '¡Huyamos de los israelitas! ¡Su Dios pelea por ellos!', en: 'Let’s run away from the Israelites! Their God is fighting for them!' }, { actor: C.carros.map(c => c.auriga) });
    quita(); C.carros.forEach(c => { c.carro.g.rotation.z = 0; ctx.anim(c.auriga, 'idle'); });
  },
  async function cerrar(ctx) {
    // Moisés extiende la mano otra vez y el mar vuelve a su lugar
    await ctx.camaraA([A.moises.g.position.x + 2.4, 1.9, A.moises.g.position.z - 4], [A.moises.g.position.x, 1.6, A.moises.g.position.z + 4], 0.01);
    await ctx.decir(QUIEN.narrador, { es: 'Dios le dijo a Moisés: «Extiende tu mano sobre el mar, para que las aguas vuelvan».',
      en: 'God said to Moses, “Stretch out your hand over the sea, so that the waters may come back.”' });
    const r0 = A.moises.obj.rotation.x;
    await ctx.tween(0.6, u => { A.moises.obj.rotation.x = r0 - 0.12 * u; });
    await ctx.camaraA([14, 11, -54], [0, 1, -16], 1.4);
    await Promise.all([
      ctx.tween(2.6, u => { abrirMar(1 - u); if (u > 0.85) C.carros.forEach(c => { c.carro.g.visible = c.caballo.g.visible = false; }); }),
      ctx.decir(QUIEN.narrador, { es: 'Moisés extendió su mano, y el mar volvió a su lugar y cubrió los carros y los caballos del faraón.',
        en: 'Moses stretched out his hand, and the sea went back to its place and covered Pharaoh’s chariots and horses.' })
    ]);
    A.moises.obj.rotation.x = r0;
    cielo(ctx, 'dia', 3);
    await ctx.decir(QUIEN.narrador, { es: 'Así salvó Dios a Israel aquel día. El pueblo vio lo que Dios había hecho, y confió en él y en Moisés.',
      en: 'That is how God saved Israel that day. The people saw what God had done, and they trusted him and Moses.' });
  },
  async function cantico(ctx) {
    // el canto de María con su pandero (Éx 15)
    if (C.pandero) C.pandero.visible = true;
    ctx.mirarA(A.miriam, A.miriam.g.position.x, 0);
    await ctx.camaraA([A.miriam.g.position.x + 2.4, 1.8, A.miriam.g.position.z + 4.4], [A.miriam.g.position.x, 1.3, A.miriam.g.position.z - 0.6], 1.4);
    ctx.sonido('musica');
    [A.nina, C.pueblo[2]].forEach(a => { if (a.clips.dance) ctx.reposo(a, 'dance'); });
    await ctx.decir(QUIEN.miriam, { es: '¡Canten al Señor, que ha triunfado con gloria! ¡Al caballo y al jinete los echó en el mar!',
      en: 'Sing to the Lord, for he has triumphed gloriously! The horse and its rider he has thrown into the sea!' }, { actor: A.miriam });
    await ctx.decir(QUIEN.moises, { es: 'El Señor es mi fuerza y mi canción. Él es mi salvación.', en: 'The Lord is my strength and my song. He is my salvation.' }, { actor: A.moises });
  }
];

H.final = async function (ctx) {
  [A.nina, C.pueblo[2]].forEach(a => { a.reposo = null; ctx.anim(a, 'idle'); });
  await ctx.camaraA([8, 6, -24], [0, 1.2, -42], 2);
  await ctx.decir(QUIEN.narrador, { es: 'Cuando parecía que no había salida, Dios abrió un camino en medio del mar. Él también abre caminos para ti.',
    en: 'When it seemed there was no way out, God opened a path through the sea. He opens paths for you too.' });
};
})();
