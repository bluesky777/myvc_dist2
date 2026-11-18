/* El buen samaritano (Lc 10:25-37). Joseth, 17 nov 2026: encargos/historias-3d.md de myvc_biblioteca, historia 3 (van
   en orden inverso: cruz, segunda venida, ascensión, José en Egipto, ésta).
   - Reto: el camino de Jerusalén a Jericó, unos 27 km de bajada (≈ 1000 m). Cada acierto avanza un tramo.
   - Momentos ENTRE las preguntas (H.momentos): los ladrones, el sacerdote que pasa por el otro lado, el levita, el
     samaritano que se compadece, el aceite, el vino y las vendas, el burro hasta la posada, y los dos denarios.
   - Empieza y acaba con Jesús y el maestro de la ley: «¿Quién es mi prójimo?» … «Ve y haz tú lo mismo».
   - Sin modelos propios todavía: el herido es el hombre del pueblo (se arrodilla y se tumba), los ladrones son los
     guardias (empujan), el sacerdote es Jacob, el levita es Mesac, el samaritano es Sadrac (se arrodilla a curarlo), el
     maestro de la ley es Abed-nego y el posadero, el discípulo 2. El camino, los montes, Jerusalén, Jericó y la posada,
     con código.
   - Las palabras parafrasean la Biblia (no se cita la RV1960). */
(function () {
'use strict';
const H = {};
(window.HISTORIAS = window.HISTORIAS || {}).samaritano = H;

H.titulo = { es: 'El buen samaritano', en: 'The Good Samaritan' };
H.frase = { es: 'Jesús contó la historia de un samaritano que se detuvo a ayudar a un herido en el camino.',
  en: 'Jesus told the story of a Samaritan who stopped to help a wounded man on the road.' };
H.como = { es: 'Contesta las preguntas. Cada acierto avanza un tramo del camino de Jerusalén a Jericó, y la historia sigue.',
  en: 'Answer the questions. Each right answer moves you along the road from Jerusalem to Jericho, and the story goes on.' };
H.reto = { es: 'De Jerusalén a Jericó', en: 'From Jerusalem to Jericho' };
H.enOrden = true;
H.modelos = ['jesus', 'abednego', 'pueblo-hombre', 'guardia', 'jacob', 'mesac', 'sadrac', 'burro', 'discipulo-2'];
H.voces = { narrador: 'narrador', jesus: 'jesus', maestro: 'rey', ladron: 'soldado', samaritano: 'hombre', herido: 'joven', posadero: 'soldado' };

const KM = 27;
let IDI = 'es';
H.valorReto = f => {
  if (f <= 0) return '';
  const k = Math.round(f * KM);
  return IDI === 'en' ? 'km ' + k + ' of ' + KM : 'km ' + k + ' de ' + KM;
};
/* de la piedra de Jerusalén al verde de las palmeras de Jericó */
H.colorPaso = f => {
  const a = [196, 160, 108], b = [70, 150, 90], u = Math.min(1, Math.max(0, f));
  return 'rgb(' + a.map((v, i) => Math.round(v + (b[i] - v) * u)).join(' ') + ')';
};

/* la pregunta k es sobre lo que se acaba de ver (el inicio, o el momento k−1) */
H.preguntas = {
  es: [
    { p: '¿Qué le preguntó el maestro de la ley a Jesús?', opciones: ['¿Quién es mi prójimo?', '¿Dónde queda Jericó?', '¿Cuánto cuesta un burro?'], correcta: 0 },
    { p: '¿Qué le hicieron los ladrones al viajero?', opciones: ['Le quitaron todo y lo dejaron herido', 'Le regalaron comida', 'Lo llevaron a su casa'], correcta: 0 },
    { p: '¿Qué hizo el sacerdote cuando vio al herido?', opciones: ['Pasó por el otro lado', 'Lo curó', 'Llamó a un médico'], correcta: 0 },
    { p: '¿Quién pasó después del sacerdote?', opciones: ['Un levita', 'Un rey', 'Un pastor con sus ovejas'], correcta: 0 },
    { p: '¿Qué sintió el samaritano cuando vio al herido?', opciones: ['Compasión', 'Miedo', 'Nada'], correcta: 0 },
    { p: '¿Con qué le curó las heridas?', opciones: ['Con aceite y vino, y lo vendó', 'Con barro', 'Con agua del mar'], correcta: 0 },
    { p: '¿A dónde llevó el samaritano al herido?', opciones: ['A una posada', 'Al templo', 'A la cárcel'], correcta: 0 }
  ],
  en: [
    { p: 'What did the teacher of the law ask Jesus?', opciones: ['Who is my neighbor?', 'Where is Jericho?', 'How much is a donkey?'], correcta: 0 },
    { p: 'What did the robbers do to the traveler?', opciones: ['They took everything and left him hurt', 'They gave him food', 'They took him home'], correcta: 0 },
    { p: 'What did the priest do when he saw the hurt man?', opciones: ['He passed by on the other side', 'He healed him', 'He called a doctor'], correcta: 0 },
    { p: 'Who came by after the priest?', opciones: ['A Levite', 'A king', 'A shepherd with his sheep'], correcta: 0 },
    { p: 'What did the Samaritan feel when he saw the hurt man?', opciones: ['Compassion', 'Fear', 'Nothing'], correcta: 0 },
    { p: 'What did he use to treat the wounds?', opciones: ['Oil and wine, and he bandaged them', 'Mud', 'Sea water'], correcta: 0 },
    { p: 'Where did the Samaritan take the hurt man?', opciones: ['To an inn', 'To the temple', 'To prison'], correcta: 0 }
  ]
};

const QUIEN = {
  narrador: { es: '', en: '', voz: 'narrador' },
  jesus: { es: 'Jesús', en: 'Jesus', voz: 'jesus' },
  maestro: { es: 'El maestro de la ley', en: 'The teacher of the law', voz: 'rey' },
  ladron: { es: 'Los ladrones', en: 'The robbers', voz: 'soldado' },
  samaritano: { es: 'El samaritano', en: 'The Samaritan', voz: 'hombre' },
  herido: { es: 'El herido', en: 'The hurt man', voz: 'joven' },
  posadero: { es: 'El posadero', en: 'The innkeeper', voz: 'soldado' }
};

/* ---------- el lugar: el camino que baja de Jerusalén (izquierda) a Jericó (derecha) entre montes de piedra ---------- */
const CAIDO = [0.6, 0.9];       // donde queda el herido, a la orilla del camino
const POSADA = [17, -4.5];
const CHARLA = [-9, 8];          // Jesús y el maestro de la ley, a la sombra de un árbol
let A = {}, C = {}, inicial = [], quitaCuadro = null;

const CIELOS = {
  dia: { cielo: 0x96bfe2, luz: 0.95, hemi: 0.45, sol: 0xfff0d6 },
  tarde: { cielo: 0xeab27a, luz: 0.95, hemi: 0.5, sol: 0xffcf96 },
  noche: { cielo: 0x2c3558, luz: 0.45, hemi: 0.4, sol: 0xb6c2ff },
  manana: { cielo: 0xf2c9a0, luz: 1.05, hemi: 0.55, sol: 0xffe2b8 }
};
function cielo(ctx, nombre, s) {
  const T = ctx.THREE, a = { c: C.fondo.clone(), l: C.sol.intensity, h: C.hemi.intensity, s: C.sol.color.clone() }, b = CIELOS[nombre];
  const cb = new T.Color(b.cielo), sb = new T.Color(b.sol);
  return ctx.tween(s || 2, u => {
    C.fondo.copy(a.c).lerp(cb, u); ctx.escena.background.copy(C.fondo); ctx.escena.fog.color.copy(C.fondo);
    C.sol.intensity = a.l + (b.luz - a.l) * u; C.hemi.intensity = a.h + (b.hemi - a.h) * u; C.sol.color.copy(a.s).lerp(sb, u);
  });
}

/* el GLB de Jesús no viene mirando a +Z: se gira el modelo dentro de su grupo (ver cruz.js) */
function esqueleto(a) { let sk = null; a.obj.traverse(m => { if (!sk && m.isSkinnedMesh) sk = m.skeleton; }); return sk; }
function hueso(sk, re) { return sk && sk.bones.find(b => re.test(b.name)); }
function enderezar(ctx, a) {
  const T = ctx.THREE, sk = esqueleto(a), i = hueso(sk, /LeftArm$/), d = hueso(sk, /RightArm$/);
  if (!i || !d) return;
  a.g.updateMatrixWorld(true);
  const v = i.getWorldPosition(new T.Vector3()).sub(d.getWorldPosition(new T.Vector3()));
  const giro = Math.atan2(v.z, v.x);
  if (Math.abs(giro) < 0.05) return;
  const centro = new T.Box3().setFromObject(a.obj).getCenter(new T.Vector3()); a.g.worldToLocal(centro);
  a.obj.rotation.y += giro;
  a.g.updateMatrixWorld(true);
  const nuevo = new T.Box3().setFromObject(a.obj).getCenter(new T.Vector3()); a.g.worldToLocal(nuevo);
  a.obj.position.x += centro.x - nuevo.x; a.obj.position.z += centro.z - nuevo.z;
}

/* el herido: tumbado boca arriba a la orilla del camino, o de pie otra vez */
function tumbar(ctx, s) {
  const a = A.herido, x0 = a.obj.rotation.x, y0 = a.obj.position.y;
  ctx.anim(a, 'idle');
  return ctx.tween(s || 0.6, u => { a.obj.rotation.x = x0 + (-Math.PI / 2 - x0) * u; a.obj.position.y = y0 + (C.baseHerido + 0.16 - y0) * u; });
}
function levantar() { const a = A.herido; a.obj.rotation.x = 0; a.obj.position.y = C.baseHerido; }
/* las vendas: una en la cabeza y otra en el brazo, colgadas de sus huesos para que lo sigan tumbado, de pie o en el burro */
function vendar(ctx) {
  const T = ctx.THREE, sk = esqueleto(A.herido), tela = new T.MeshStandardMaterial({ color: 0xf6f1e4, roughness: 1 });
  const poner = (re, geo, rx, dy) => {
    const b = hueso(sk, re); if (!b) return;
    const k = 1 / b.getWorldScale(new T.Vector3()).x, m = new T.Mesh(geo, tela);
    m.scale.setScalar(k); m.rotation.x = rx; m.position.y = dy * k; b.add(m); C.vendas.push(m);
  };
  poner(/Head$/, new T.TorusGeometry(0.1, 0.03, 8, 20), Math.PI / 2, 0.09);
  poner(/LeftForeArm$/, new T.CylinderGeometry(0.055, 0.055, 0.13, 12), 0, 0.12);
}
function quitarVendas() { C.vendas.forEach(v => v.parent && v.parent.remove(v)); C.vendas = []; }

H.montar = async function (ctx) {
  const T = ctx.THREE, E = ctx.escena;
  IDI = ctx.idioma === 'en' ? 'en' : 'es';
  C.vendas = [];
  C.fondo = new T.Color(CIELOS.dia.cielo);
  E.background = C.fondo.clone();
  E.fog = new T.Fog(C.fondo.clone(), 55, 190);
  C.hemi = new T.HemisphereLight(0xfff0d6, 0x7a6448, CIELOS.dia.hemi); E.add(C.hemi);
  C.sol = new T.DirectionalLight(CIELOS.dia.sol, CIELOS.dia.luz);
  C.sol.position.set(-14, 26, 16); C.sol.castShadow = true; C.sol.shadow.mapSize.set(2048, 2048);
  Object.assign(C.sol.shadow.camera, { left: -28, right: 28, top: 28, bottom: -28, near: 1, far: 90 });
  E.add(C.sol);
  const suelo = new T.Mesh(new T.PlaneGeometry(400, 400), new T.MeshStandardMaterial({ color: 0xa3864f, roughness: 1 }));
  suelo.rotation.x = -Math.PI / 2; suelo.receiveShadow = true; E.add(suelo);
  // el camino, de izquierda a derecha
  const camino = new T.Mesh(new T.PlaneGeometry(80, 2.6), new T.MeshStandardMaterial({ color: 0xd2bd92, roughness: 1 }));
  camino.rotation.x = -Math.PI / 2; camino.position.y = 0.02; camino.receiveShadow = true; E.add(camino);
  // montes y piedras del desierto de Judea
  const roca = new T.MeshStandardMaterial({ color: 0x7d6447, roughness: 1, flatShading: true });
  [[-20, -16, 9, 6], [-4, -20, 11, 7], [14, -18, 10, 5], [30, -14, 8, 4], [-28, 14, 8, 5], [12, 18, 9, 5], [30, 12, 7, 4]].forEach(([x, z, r, h]) => {
    const m = new T.Mesh(new T.SphereGeometry(r, 9, 6, 0, Math.PI * 2, 0, Math.PI / 2), roca); m.scale.y = h / r; m.position.set(x, 0, z); m.receiveShadow = true; E.add(m);
  });
  // las rocas donde se esconden los ladrones
  [[1.8, -3.4, 1.4], [3.6, 3.4, 1.2], [-4.5, -3.2, 0.9], [7, -2.8, 0.8], [-12, 3.2, 1], [11, 3.6, 1.1]].forEach(([x, z, r]) => {
    const m = new T.Mesh(new T.DodecahedronGeometry(r, 0), roca); m.position.set(x, r * 0.55, z); m.scale.y = 0.75; m.castShadow = true; m.receiveShadow = true; E.add(m);
  });
  // Jerusalén, arriba a la izquierda
  const muro = new T.MeshStandardMaterial({ color: 0xd8c39a, roughness: 0.95 });
  for (let i = 0; i < 7; i++) {
    const b = new T.Mesh(new T.BoxGeometry(7, 5 + (i % 3) * 1.4, 3), muro); b.position.set(-70 + i * 7.5, 6, -46); E.add(b);
  }
  const cerro = new T.Mesh(new T.SphereGeometry(28, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2), roca); cerro.scale.y = 0.16; cerro.position.set(-48, 0, -48); E.add(cerro);
  // Jericó, abajo a la derecha: palmeras y casas
  const tronco = new T.MeshStandardMaterial({ color: 0x7a5a36, roughness: 1 }), hoja = new T.MeshStandardMaterial({ color: 0x4f8a3a, roughness: 1 });
  const palmera = (x, z, alto) => {
    const p = new T.Group(); p.position.set(x, 0, z);
    const t = new T.Mesh(new T.CylinderGeometry(0.16, 0.26, alto, 8), tronco); t.position.y = alto / 2; t.castShadow = true; p.add(t);
    for (let k = 0; k < 6; k++) {
      const h = new T.Mesh(new T.ConeGeometry(0.32, 2.4, 6), hoja); h.geometry.translate(0, 1.1, 0);
      h.position.y = alto; h.rotation.z = Math.PI / 2.6; h.rotation.y = k * Math.PI / 3; h.castShadow = true; p.add(h);
    }
    E.add(p);
  };
  [[22, -9, 4.6], [25, -6, 5.2], [27, -11, 4.4], [31, -7, 5], [36, -10, 4.8], [24, 6, 4.4], [34, 5, 5]].forEach(([x, z, h]) => palmera(x, z, h));
  const adobe = new T.MeshStandardMaterial({ color: 0xcfb284, roughness: 1 });
  [[40, -16], [45, -12], [48, -18], [42, 9]].forEach(([x, z]) => { const c = new T.Mesh(new T.BoxGeometry(4, 3, 4), adobe); c.position.set(x, 1.5, z); E.add(c); });
  // la posada
  const posada = new T.Mesh(new T.BoxGeometry(7, 3.4, 4.5), adobe); posada.position.set(POSADA[0], 1.7, POSADA[1] - 1.6); posada.castShadow = true; posada.receiveShadow = true; E.add(posada);
  const techo = new T.Mesh(new T.BoxGeometry(7.4, 0.3, 4.9), new T.MeshStandardMaterial({ color: 0x8a6a46, roughness: 1 })); techo.position.set(POSADA[0], 3.55, POSADA[1] - 1.6); E.add(techo);
  const puerta = new T.Mesh(new T.PlaneGeometry(1.2, 2.1), new T.MeshStandardMaterial({ color: 0x5a4028, roughness: 1 })); puerta.position.set(POSADA[0], 1.05, POSADA[1] + 0.66); E.add(puerta);
  const toldo = new T.Mesh(new T.BoxGeometry(3.2, 0.12, 1.6), new T.MeshStandardMaterial({ color: 0xb5523a, roughness: 1 })); toldo.position.set(POSADA[0], 2.5, POSADA[1] + 1.4); toldo.rotation.x = 0.2; E.add(toldo);
  // el árbol de la charla
  const olivo = new T.MeshStandardMaterial({ color: 0x7c9160, roughness: 1 });
  const t = new T.Mesh(new T.CylinderGeometry(0.2, 0.3, 2.2, 8), tronco); t.position.set(CHARLA[0] - 1.6, 1.1, CHARLA[1] - 1.4); t.castShadow = true; E.add(t);
  const copa = new T.Mesh(new T.SphereGeometry(1.8, 14, 10), olivo); copa.scale.y = 0.7; copa.position.set(CHARLA[0] - 1.6, 2.9, CHARLA[1] - 1.4); copa.castShadow = true; E.add(copa);
  // la gente
  A.jesus = await ctx.actor('jesus', { x: CHARLA[0] - 0.9, z: CHARLA[1], altura: 1.8, color: 0xf2efe6 });
  enderezar(ctx, A.jesus);
  A.maestro = await ctx.actor('abednego', { x: CHARLA[0] + 0.9, z: CHARLA[1] + 0.2, altura: 1.74, color: 0x6a5a8a });
  A.herido = await ctx.actor('pueblo-hombre', { x: -24, z: 0, altura: 1.72, color: 0xe0d2b4 });
  C.baseHerido = A.herido.obj.position.y;
  const oscuro = m => { const n = m.clone(); if (n.color) n.color.multiplyScalar(0.5); return n; };
  A.ladron1 = await ctx.actor('guardia', { x: 1.8, z: -4.8, altura: 1.8, material: oscuro });
  A.ladron2 = await ctx.actor('guardia', { x: 3.6, z: 4.8, altura: 1.75, material: oscuro });
  A.sacerdote = await ctx.actor('jacob', { x: -26, z: -0.7, altura: 1.72, color: 0xf2efe6 });
  A.levita = await ctx.actor('mesac', { x: -26, z: -0.7, altura: 1.74 });
  A.samaritano = await ctx.actor('sadrac', { x: -26, z: 0.4, altura: 1.76 });
  A.burro = await ctx.actor('burro', { x: -27.6, z: 0.4, altura: 1.2 });
  A.posadero = await ctx.actor('discipulo-2', { x: POSADA[0] + 1.6, z: POSADA[1] + 1.2, altura: 1.72 });
  // aceite, vino y los dos denarios
  C.frascos = new T.Group();
  [[0xd8b84a, -0.18], [0x7a1f3a, 0.18]].forEach(([col, dx]) => {
    const f = new T.Mesh(new T.CylinderGeometry(0.08, 0.11, 0.3, 12), new T.MeshStandardMaterial({ color: col, roughness: 0.4 })); f.position.set(dx, 0.15, 0); C.frascos.add(f);
  });
  E.add(C.frascos);
  C.monedas = new T.Group();
  [0, 1].forEach(i => { const m = new T.Mesh(new T.CylinderGeometry(0.1, 0.1, 0.025, 18), ctx.oro()); m.position.set(i * 0.12, 1.15 + i * 0.03, 0); m.rotation.x = 0.5; C.monedas.add(m); });
  E.add(C.monedas);
  colocar(ctx);
  inicial = Object.values(A).filter(a => a && a.g).map(a => ({ a, x: a.g.position.x, z: a.g.position.z, r: a.g.rotation.y }));
  ctx.camara.position.set(-4, 4.5, 15); ctx.mira.set(-4, 1.5, 2);
};

function colocar(ctx) {
  if (quitaCuadro) { quitaCuadro(); quitaCuadro = null; }
  levantar(); quitarVendas();
  A.herido.reposo = null; ctx.anim(A.herido, 'idle'); A.herido.g.visible = true;
  ctx.mirarA(A.jesus, A.maestro.g.position.x, A.maestro.g.position.z);
  ctx.mirarA(A.maestro, A.jesus.g.position.x, A.jesus.g.position.z);
  ctx.mirarA(A.herido, 10, 0);
  [A.ladron1, A.ladron2].forEach(a => { a.g.visible = false; a.reposo = null; ctx.anim(a, 'crouch'); ctx.mirarA(a, CAIDO[0], 0); });
  A.ladron1.reposo = A.ladron2.reposo = 'crouch';
  [A.sacerdote, A.levita, A.samaritano, A.burro].forEach(a => { a.g.visible = false; ctx.mirarA(a, 10, a.g.position.z); });
  A.samaritano.reposo = null;
  ctx.mirarA(A.posadero, 0, 6);
  C.frascos.visible = false; C.monedas.visible = false;
}

H.reiniciar = async function (ctx) {
  inicial.forEach(i => { i.a.g.position.set(i.x, 0, i.z); i.a.g.rotation.y = i.r; });
  colocar(ctx);
  await cielo(ctx, 'dia', 0.01);
  ctx.camara.position.set(-4, 4.5, 15); ctx.mira.set(-4, 1.5, 2);
};

H.inicio = async function (ctx) {
  const d = ctx.decir;
  await ctx.camaraA([CHARLA[0] + 1.2, 2.2, CHARLA[1] + 5], [CHARLA[0], 1.5, CHARLA[1]], 2);
  await d(QUIEN.maestro, { es: 'Maestro, ¿qué tengo que hacer para tener la vida eterna?', en: 'Teacher, what must I do to have eternal life?' }, { actor: A.maestro });
  await d(QUIEN.jesus, { es: '¿Qué dice la ley? ¿Qué lees en ella?', en: 'What does the law say? What do you read in it?' }, { actor: A.jesus });
  await d(QUIEN.maestro, { es: 'Ama al Señor tu Dios con todo tu corazón, y a tu prójimo como a ti mismo.',
    en: 'Love the Lord your God with all your heart, and love your neighbor as yourself.' }, { actor: A.maestro });
  await d(QUIEN.jesus, { es: 'Muy bien contestado. Haz eso y vivirás.', en: 'You have answered well. Do this and you will live.' }, { actor: A.jesus });
  await d(QUIEN.maestro, { es: 'Pero, ¿quién es mi prójimo?', en: 'But who is my neighbor?' }, { actor: A.maestro });
  await d(QUIEN.jesus, { es: 'Un hombre bajaba de Jerusalén a Jericó…', en: 'A man was going down from Jerusalem to Jericho…' }, { actor: A.jesus });
};

H.avanzar = async function (ctx) { await ctx.esperar(0.4); };

H.momentos = [
  async function ladrones(ctx) {
    await ctx.camaraA([-5, 3, 9], [-2, 1.2, 0], 1.6);
    await ctx.mover(A.herido, -2.2, 0, 4.5);
    A.ladron1.g.visible = A.ladron2.g.visible = true;
    ctx.sonido('mal');
    await Promise.all([ctx.mover(A.ladron1, -0.6, -1.1, 0.8), ctx.mover(A.ladron2, -0.4, 1.2, 0.8)]);
    ctx.mirarA(A.ladron1, A.herido.g.position.x, 0); ctx.mirarA(A.ladron2, A.herido.g.position.x, 0);
    ctx.mirarA(A.herido, 0, 0);
    await ctx.decir(QUIEN.ladron, { es: '¡Danos todo lo que llevas!', en: 'Give us everything you have!' }, { actor: [A.ladron1, A.ladron2] });
    ctx.anim(A.ladron1, 'push', { una: true });
    await ctx.esperar(0.5);
    await ctx.mover(A.herido, CAIDO[0], CAIDO[1], 0.4);
    await tumbar(ctx, 0.5);
    await ctx.decir(QUIEN.narrador, { es: 'Unos ladrones lo asaltaron, le quitaron la ropa, lo golpearon y se fueron, dejándolo medio muerto.',
      en: 'Some robbers attacked him, took his clothes, beat him and went away, leaving him half dead.' });
    A.ladron1.reposo = A.ladron2.reposo = null;
    await Promise.all([ctx.mover(A.ladron1, 8, -9, 2.2), ctx.mover(A.ladron2, 10, -8, 2.4)]);
    A.ladron1.g.visible = A.ladron2.g.visible = false;
  },
  async function sacerdote(ctx) {
    A.sacerdote.g.position.set(-14, 0, -0.9); A.sacerdote.g.visible = true; ctx.mirarA(A.sacerdote, 10, -0.9);
    await ctx.camaraA([2.5, 2.6, 7.5], [-1, 1, 0], 1.6);
    await ctx.decir(QUIEN.narrador, { es: 'Por casualidad bajaba por ese camino un sacerdote.', en: 'By chance a priest was going down that road.' });
    await ctx.mover(A.sacerdote, -3, -0.9, 3);
    ctx.mirarA(A.sacerdote, CAIDO[0], CAIDO[1]);
    await ctx.esperar(0.8);
    await ctx.mover(A.sacerdote, CAIDO[0], -2.4, 1.6);
    await ctx.decir(QUIEN.narrador, { es: 'Lo vio, pero pasó por el otro lado del camino.', en: 'He saw him, but he passed by on the other side of the road.' });
    await ctx.mover(A.sacerdote, 14, -1.2, 4);
    A.sacerdote.g.visible = false;
  },
  async function levita(ctx) {
    A.levita.g.position.set(-14, 0, -0.6); A.levita.g.visible = true; ctx.mirarA(A.levita, 10, -0.6);
    await ctx.camaraA([-3.5, 2.4, -6.5], [0, 0.9, 0.4], 1.6);
    await ctx.decir(QUIEN.narrador, { es: 'Después pasó un levita, un ayudante del templo.', en: 'Then a Levite came by, a helper at the temple.' });
    await ctx.mover(A.levita, -1, -0.4, 3);
    ctx.mirarA(A.levita, CAIDO[0], CAIDO[1]);
    await ctx.esperar(1);
    await ctx.mover(A.levita, CAIDO[0] + 0.6, -2.3, 1.2);
    await ctx.decir(QUIEN.narrador, { es: 'Se acercó, lo miró… y también pasó de largo.', en: 'He came closer, looked at him… and he also passed by.' });
    await ctx.mover(A.levita, 14, -1, 4);
    A.levita.g.visible = false;
  },
  async function compasion(ctx) {
    A.samaritano.g.position.set(-14, 0, 0.3); A.burro.g.position.set(-15.6, 0, 0.3);
    A.samaritano.g.visible = A.burro.g.visible = true;
    ctx.mirarA(A.samaritano, 10, 0.3); ctx.mirarA(A.burro, 10, 0.3);
    await ctx.camaraA([-6, 2.6, 7], [-3, 1, 0], 1.6);
    await ctx.decir(QUIEN.narrador, { es: 'Pero un samaritano que iba de viaje llegó adonde estaba el herido. Los judíos y los samaritanos no se trataban.',
      en: 'But a Samaritan who was traveling came to where the hurt man was. Jews and Samaritans did not get along.' });
    if (A.burro.clips.caminar) ctx.anim(A.burro, 'caminar');
    await Promise.all([ctx.mover(A.samaritano, -1.2, 0.6, 3.4), ctx.mover(A.burro, -2.9, 0.2, 3.4)]);
    if (A.burro.clips.quieto) ctx.anim(A.burro, 'quieto');
    ctx.mirarA(A.samaritano, CAIDO[0], CAIDO[1]);
    await ctx.camaraA([-1.8, 1.9, 4.2], [0, 0.6, 0.8], 1.4);
    await ctx.decir(QUIEN.narrador, { es: 'Cuando lo vio, sintió compasión de él.', en: 'When he saw him, he felt compassion for him.' });
    await ctx.decir(QUIEN.samaritano, { es: 'Amigo, no tengas miedo. Yo te voy a ayudar.', en: 'Friend, do not be afraid. I am going to help you.' }, { actor: A.samaritano });
  },
  async function curar(ctx) {
    // aceite y vino en las heridas, y las vendas (Lc 10:34)
    await ctx.mover(A.samaritano, CAIDO[0] - 0.1, CAIDO[1] + 1.1, 0.8);
    ctx.mirarA(A.samaritano, CAIDO[0], CAIDO[1]);
    ctx.reposo(A.samaritano, 'kneel');
    C.frascos.position.set(CAIDO[0] + 0.7, 0, CAIDO[1] + 1.3); C.frascos.visible = true;
    await ctx.camaraA([-1.6, 1.7, -2.6], [0.4, 0.5, 1.2], 1.4);
    await ctx.decir(QUIEN.narrador, { es: 'Se arrodilló a su lado, le echó aceite y vino en las heridas y se las vendó.',
      en: 'He knelt beside him, poured oil and wine on his wounds and bandaged them.' });
    vendar(ctx);
    ctx.sonido('bien');
    await ctx.decir(QUIEN.herido, { es: 'Gracias… ¿Por qué me ayudas?', en: 'Thank you… Why are you helping me?' }, { actor: A.herido });
    await ctx.decir(QUIEN.samaritano, { es: 'Porque me necesitas.', en: 'Because you need me.' }, { actor: A.samaritano });
  },
  async function burro(ctx) {
    // lo subió en su propio burro y lo llevó a una posada
    A.samaritano.reposo = null; ctx.anim(A.samaritano, 'idle');
    C.frascos.visible = false; levantar();
    A.herido.g.position.set(A.burro.g.position.x, 0.42, A.burro.g.position.z);
    ctx.reposo(A.herido, 'kneel-idle');
    ctx.mirarA(A.herido, 10, A.burro.g.position.z);
    // el herido va encima del burro: lo sigue cada cuadro
    quitaCuadro = ctx.cadaCuadro(() => {
      A.herido.g.position.set(A.burro.g.position.x, 0.42, A.burro.g.position.z); A.herido.g.rotation.y = A.burro.g.rotation.y;
    });
    cielo(ctx, 'tarde', 6);
    await ctx.camaraA([-4.5, 2.4, 5.5], [-2.2, 1, 0], 1.2);
    if (A.burro.clips.caminar) ctx.anim(A.burro, 'caminar');
    await Promise.all([
      ctx.camaraA([POSADA[0] - 7, 2.6, POSADA[1] + 9.5], [POSADA[0] - 2.2, 1.1, POSADA[1] + 2.4], 8),
      ctx.mover(A.burro, POSADA[0] - 2.4, POSADA[1] + 2.6, 8),
      ctx.mover(A.samaritano, POSADA[0] - 0.8, POSADA[1] + 2.4, 8),
      ctx.decir(QUIEN.narrador, { es: 'Lo subió en su propio burro, lo llevó a una posada y lo cuidó toda la noche.',
        en: 'He put him on his own donkey, took him to an inn and took care of him all night.' })
    ]);
    if (A.burro.clips.quieto) ctx.anim(A.burro, 'quieto');
  },
  async function denarios(ctx) {
    if (quitaCuadro) { quitaCuadro(); quitaCuadro = null; }
    A.herido.g.visible = false;
    await cielo(ctx, 'noche', 1.2);
    await cielo(ctx, 'manana', 1.6);
    ctx.mirarA(A.samaritano, A.posadero.g.position.x, A.posadero.g.position.z);
    ctx.mirarA(A.posadero, A.samaritano.g.position.x, A.samaritano.g.position.z);
    await ctx.camaraA([POSADA[0] - 0.4, 2, POSADA[1] + 7], [POSADA[0] + 0.4, 1.4, POSADA[1] + 1.8], 1.6);
    C.monedas.position.set((A.samaritano.g.position.x + A.posadero.g.position.x) / 2, 0, (A.samaritano.g.position.z + A.posadero.g.position.z) / 2 + 0.2);
    C.monedas.visible = true; ctx.sonido('bien');
    await ctx.decir(QUIEN.samaritano, { es: 'Aquí tienes dos denarios. Cuídalo, y lo que gastes de más, yo te lo pagaré cuando vuelva.',
      en: 'Here are two silver coins. Take care of him, and whatever you spend beyond that, I will pay you when I come back.' }, { actor: A.samaritano });
    await ctx.decir(QUIEN.posadero, { es: 'Así lo haré. Puedes irte tranquilo.', en: 'I will. You can go in peace.' }, { actor: A.posadero });
    C.monedas.visible = false;
  }
];

H.final = async function (ctx) {
  await cielo(ctx, 'dia', 1.2);
  await ctx.camaraA([CHARLA[0] + 1.2, 2.2, CHARLA[1] + 5], [CHARLA[0], 1.5, CHARLA[1]], 2.2);
  await ctx.decir(QUIEN.jesus, { es: '¿Cuál de los tres fue el prójimo del hombre que cayó en manos de los ladrones?',
    en: 'Which of the three was a neighbor to the man who fell into the hands of the robbers?' }, { actor: A.jesus });
  await ctx.decir(QUIEN.maestro, { es: 'El que tuvo compasión de él.', en: 'The one who had compassion on him.' }, { actor: A.maestro });
  await ctx.decir(QUIEN.jesus, { es: 'Ve, y haz tú lo mismo.', en: 'Go, and do the same.' }, { actor: A.jesus });
  await ctx.decir(QUIEN.narrador, { es: 'Mi prójimo es cualquiera que necesite ayuda, aunque sea diferente a mí.',
    en: 'My neighbor is anyone who needs help, even if they are different from me.' });
};
})();
