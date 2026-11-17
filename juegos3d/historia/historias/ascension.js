/* La ascensión (Lc 24:36-53, Jn 20:24-29, Jn 21:15-17, Hch 1:1-12). Joseth, 17 nov 2026: encargos/historias-3d.md de
   myvc_biblioteca, historia 5 (van en orden inverso: cruz, segunda venida, ésta).
   - Sin juego de puntos (decisión del 9 nov): el reto son los cuarenta días, de la resurrección al monte de los Olivos.
   - Momentos ENTRE las preguntas (H.momentos): Tomás cree, «Pedro, ¿me amas?», la promesa del Espíritu, «serán mis
     testigos», Jesús sube mientras los bendice y una nube lo oculta, los dos varones de blanco, y la vuelta a Jerusalén
     con alegría. El final une con la historia 6: Jesús volverá.
   - El monte, la nube y Jerusalén se hacen aquí con código. Los once: Pedro, Juan, Tomás (discipulo-1), discipulo-2,
     Sadrac, Mesac y Abed-nego del horno (con rig: oran y se arrodillan), y la gente común. Jesús bendice con los brazos
     levantados por sus huesos (bendecir), como en la cruz.
   - Las palabras parafrasean la Biblia (no se cita la RV1960). */
(function () {
'use strict';
const H = {};
(window.HISTORIAS = window.HISTORIAS || {}).ascension = H;

H.titulo = { es: 'Jesús sube al cielo', en: 'Jesus Goes Up to Heaven' };
H.frase = { es: 'Durante cuarenta días Jesús resucitado estuvo con sus discípulos; después subió al cielo y prometió volver.',
  en: 'For forty days the risen Jesus was with his disciples; then he went up to heaven and promised to come back.' };
H.como = { es: 'Contesta las preguntas. Entre una y otra, la historia sigue: los cuarenta días después de la resurrección.',
  en: 'Answer the questions. Between them, the story goes on: the forty days after the resurrection.' };
H.reto = { es: 'Los cuarenta días', en: 'The forty days' };
H.enOrden = true;
H.modelos = ['jesus', 'pedro', 'juan', 'discipulo-1', 'discipulo-2', 'sadrac', 'mesac', 'abednego', 'pueblo-hombre', 'angel'];
H.voces = { narrador: 'narrador', jesus: 'jesus', pedro: 'hombre', tomas: 'joven', angel: 'angel' };

const PASOS = {
  es: ['', 'Día 1: ¡resucitó!', 'Día 8: Tomás cree', 'Junto al lago: Pedro', 'La promesa del Espíritu', 'Testigos hasta lo último de la tierra',
    'Día 40: sube al cielo', 'Volverá'],
  en: ['', 'Day 1: he is risen!', 'Day 8: Thomas believes', 'By the lake: Peter', 'The promise of the Spirit', 'Witnesses to the ends of the earth',
    'Day 40: he goes up to heaven', 'He will come back']
};
let IDI = 'es';
H.valorReto = f => {
  const L = PASOS[IDI] || PASOS.es;
  return f > 0 ? L[Math.min(L.length - 1, Math.round(f * (L.length - 1)))] : '';
};
/* del verde del monte al azul del cielo */
H.colorPaso = f => {
  const a = [108, 140, 76], b = [86, 150, 230], u = Math.min(1, Math.max(0, f));
  return 'rgb(' + a.map((v, i) => Math.round(v + (b[i] - v) * u)).join(' ') + ')';
};

/* la pregunta k es sobre lo que se acaba de ver (el inicio, o el momento k−1) */
H.preguntas = {
  es: [
    { p: '¿Cuántos días estuvo Jesús con sus discípulos después de resucitar?', opciones: ['Cuarenta días', 'Tres días', 'Un año'], correcta: 0 },
    { p: '¿Qué dijo Tomás cuando vio a Jesús?', opciones: ['¡Señor mío y Dios mío!', '¡Todavía no lo creo!', '¡Me voy a pescar!'], correcta: 0 },
    { p: '¿Cuántas veces le preguntó Jesús a Pedro si lo amaba?', opciones: ['Tres veces', 'Una vez', 'Siete veces'], correcta: 0 },
    { p: '¿Qué les prometió Jesús que iban a recibir?', opciones: ['El Espíritu Santo', 'Oro y plata', 'Un palacio en Jerusalén'], correcta: 0 },
    { p: '¿Hasta dónde tenían que contar los discípulos lo que vieron?', opciones: ['Hasta lo último de la tierra', 'Sólo en su casa', 'A nadie'], correcta: 0 },
    { p: '¿Qué hacía Jesús mientras subía al cielo?', opciones: ['Los bendecía', 'Los regañaba', 'Se despedía para siempre'], correcta: 0 },
    { p: '¿Qué dijeron los dos varones vestidos de blanco?', opciones: ['Que Jesús volverá de la misma manera', 'Que Jesús no volvería', 'Que se fueran a otro país'], correcta: 0 }
  ],
  en: [
    { p: 'How many days was Jesus with his disciples after he rose again?', opciones: ['Forty days', 'Three days', 'One year'], correcta: 0 },
    { p: 'What did Thomas say when he saw Jesus?', opciones: ['My Lord and my God!', 'I still do not believe it!', 'I am going fishing!'], correcta: 0 },
    { p: 'How many times did Jesus ask Peter if he loved him?', opciones: ['Three times', 'Once', 'Seven times'], correcta: 0 },
    { p: 'What did Jesus promise they would receive?', opciones: ['The Holy Spirit', 'Gold and silver', 'A palace in Jerusalem'], correcta: 0 },
    { p: 'How far did the disciples have to tell what they had seen?', opciones: ['To the ends of the earth', 'Only at home', 'To no one'], correcta: 0 },
    { p: 'What was Jesus doing while he went up to heaven?', opciones: ['Blessing them', 'Scolding them', 'Saying goodbye forever'], correcta: 0 },
    { p: 'What did the two men dressed in white say?', opciones: ['That Jesus will come back the same way', 'That Jesus would not come back', 'That they should move to another country'], correcta: 0 }
  ]
};

const QUIEN = {
  narrador: { es: '', en: '', voz: 'narrador' },
  jesus: { es: 'Jesús', en: 'Jesus', voz: 'jesus' },
  pedro: { es: 'Pedro', en: 'Peter', voz: 'hombre' },
  tomas: { es: 'Tomás', en: 'Thomas', voz: 'joven' },
  angel: { es: 'Los dos varones de blanco', en: 'The two men in white', voz: 'angel' }
};

/* ---------- el lugar: el monte de los Olivos, con Jerusalén al fondo ---------- */
const MONTE = { r: 13, alto: 1.6 };
/* la altura del suelo en (x, z): un monte bajo y redondo en el centro */
const alto = (x, z) => { const d = Math.hypot(x, z) / MONTE.r; return d >= 1 ? 0 : MONTE.alto * Math.sqrt(1 - d * d); };
const JESUS = [0, -1.2];
/* los once en media luna delante de Jesús; Pedro, Tomás y Juan, los más cerca */
const ONCE = [
  ['pedro', 'pedro', -1.3, 1.6], ['juan', 'juan', 1.3, 1.6], ['tomas', 'discipulo-1', 2.6, 1.0], ['d2', 'discipulo-2', -2.6, 1.0],
  ['sadrac', 'sadrac', -3.4, 2.6], ['mesac', 'mesac', 3.4, 2.6], ['abednego', 'abednego', -2.0, 3.2], ['h1', 'pueblo-hombre', 2.0, 3.2],
  ['d1b', 'discipulo-1', -0.6, 3.6], ['d2b', 'discipulo-2', 0.8, 3.7], ['h2', 'pueblo-hombre', -4.2, 1.6]
];
let A = {}, C = {}, inicial = [], LOS_ONCE = [];

const CIELOS = {
  dia: { cielo: 0xb9d3ec, luz: 1.35, hemi: 0.8, sol: 0xfff1d6 },
  tarde: { cielo: 0xf2c58e, luz: 1.05, hemi: 0.6, sol: 0xffd29a }
};
function cielo(ctx, nombre, s) {
  const T = ctx.THREE, a = { c: C.fondo.clone(), l: C.sol.intensity, h: C.hemi.intensity, s: C.sol.color.clone() }, b = CIELOS[nombre];
  const cb = new T.Color(b.cielo), sb = new T.Color(b.sol);
  return ctx.tween(s || 2, u => {
    C.fondo.copy(a.c).lerp(cb, u); ctx.escena.background.copy(C.fondo); ctx.escena.fog.color.copy(C.fondo);
    C.sol.intensity = a.l + (b.luz - a.l) * u; C.hemi.intensity = a.h + (b.hemi - a.h) * u; C.sol.color.copy(a.s).lerp(sb, u);
  });
}

/* la nube que lo oculta (Hch 1:9) */
function crearNube(ctx) {
  const T = ctx.THREE, g = new T.Group(), mat = new T.MeshStandardMaterial({ color: 0xffffff, roughness: 1, emissive: 0xfff6e0, emissiveIntensity: 0.25, transparent: true, opacity: 0 });
  [[0, 0, 0, 2.2], [2.3, -0.3, 0.4, 1.7], [-2.3, -0.2, 0.3, 1.8], [1.1, 0.3, -1.4, 1.6], [-1.2, 0.2, -1.3, 1.6], [0, -0.5, 1.6, 1.5]]
    .forEach(([x, y, z, r]) => { const m = new T.Mesh(new T.SphereGeometry(r, 18, 12), mat); m.scale.y = 0.6; m.position.set(x, y, z); g.add(m); });
  g.position.set(JESUS[0], 12, JESUS[1]); g.visible = false; C.nubeMat = mat;
  ctx.escena.add(g);
  return g;
}

/* ---------- Jesús bendice con los brazos en alto (Lc 24:50): con sus huesos, como en la cruz ---------- */
function esqueleto(a) { let sk = null; a.obj.traverse(m => { if (!sk && m.isSkinnedMesh) sk = m.skeleton; }); return sk; }
function hueso(sk, re) { return sk && sk.bones.find(b => re.test(b.name)); }
function alinear(T, b, hijo, dir) {
  const pb = b.getWorldPosition(new T.Vector3()), pc = hijo.getWorldPosition(new T.Vector3());
  const cur = pc.sub(pb).normalize(), qd = new T.Quaternion().setFromUnitVectors(cur, dir);
  const nueva = qd.multiply(b.getWorldQuaternion(new T.Quaternion()));
  const padre = b.parent.getWorldQuaternion(new T.Quaternion()).invert();
  b.quaternion.copy(padre.multiply(nueva)); b.updateMatrixWorld(true);
}
/* el GLB de Jesús no viene mirando a +Z: se gira el modelo dentro de su grupo (ver cruz.js) */
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
function bendecir(ctx, a) {
  const T = ctx.THREE, sk = esqueleto(a);
  if (!sk) return ctx.anim(a, 'standing-greeting');
  if (a.mixer) { a.mixer.stopAllAction(); a.accion = null; }
  a.reposo = 'bendice';
  sk.pose(); a.g.updateMatrixWorld(true);
  const giro = a.g.getWorldQuaternion(new T.Quaternion());
  [['Left', 1], ['Right', -1]].forEach(([lado, s]) => {
    const dir = new T.Vector3(s * 0.62, 0.62, 0.48).normalize().applyQuaternion(giro);
    const brazo = hueso(sk, new RegExp(lado + 'Arm$')), ante = hueso(sk, new RegExp(lado + 'ForeArm$')), mano = hueso(sk, new RegExp(lado + 'Hand$'));
    if (brazo && ante) alinear(T, brazo, ante, dir);
    if (ante && mano) alinear(T, ante, mano, new T.Vector3(s * 0.45, 0.85, 0.3).normalize().applyQuaternion(giro));
  });
  return Promise.resolve(true);
}
function soltarBrazos(ctx, a) {
  const sk = esqueleto(a); if (sk) sk.pose();
  a.reposo = null; ctx.anim(a, 'idle');
}
function brillo(ctx, a, color, k) {
  const T = ctx.THREE;
  a.obj.traverse(m => {
    if (!m.isMesh) return;
    if (!m.userData.mat0) m.userData.mat0 = m.material;
    m.material = m.userData.mat0.clone(); m.material.emissive = new T.Color(color); m.material.emissiveIntensity = k;
  });
}
function sinBrillo(a) { a.obj.traverse(m => { if (m.isMesh && m.userData.mat0) m.material = m.userData.mat0; }); }
const todosMiran = (ctx, x, z) => LOS_ONCE.forEach(a => ctx.mirarA(a, x, z));

H.montar = async function (ctx) {
  const T = ctx.THREE, E = ctx.escena;
  IDI = ctx.idioma === 'en' ? 'en' : 'es';
  C.fondo = new T.Color(CIELOS.dia.cielo);
  E.background = C.fondo.clone();
  E.fog = new T.Fog(C.fondo.clone(), 50, 170);
  C.hemi = new T.HemisphereLight(0xfff1d6, 0x5a6a40, CIELOS.dia.hemi); E.add(C.hemi);
  C.sol = new T.DirectionalLight(CIELOS.dia.sol, CIELOS.dia.luz);
  C.sol.position.set(-16, 26, 18); C.sol.castShadow = true; C.sol.shadow.mapSize.set(2048, 2048);
  Object.assign(C.sol.shadow.camera, { left: -24, right: 24, top: 24, bottom: -24, near: 1, far: 90 });
  E.add(C.sol);
  const suelo = new T.Mesh(new T.PlaneGeometry(320, 320), new T.MeshStandardMaterial({ color: 0xb5a678, roughness: 1 }));
  suelo.rotation.x = -Math.PI / 2; suelo.receiveShadow = true; E.add(suelo);
  // el monte: media esfera muy aplastada, verde de olivos
  const monte = new T.Mesh(new T.SphereGeometry(MONTE.r, 48, 24, 0, Math.PI * 2, 0, Math.PI / 2), new T.MeshStandardMaterial({ color: 0x8ea766, roughness: 1 }));
  monte.scale.y = MONTE.alto / MONTE.r; monte.receiveShadow = true; E.add(monte);
  const hoja = new T.MeshStandardMaterial({ color: 0x7c9160, roughness: 1 }), tronco = new T.MeshStandardMaterial({ color: 0x5b4632, roughness: 1 });
  [[-8, -5], [7.5, -6], [-9.5, 3], [9, 2.5], [-5, -9], [5, -10], [-12, -1], [12, -3]].forEach(([x, z]) => {
    const y = alto(x, z);
    const t = new T.Mesh(new T.CylinderGeometry(0.14, 0.22, 1.7, 8), tronco); t.position.set(x, y + 0.85, z); t.castShadow = true; E.add(t);
    const c = new T.Mesh(new T.SphereGeometry(1.2, 14, 10), hoja); c.scale.y = 0.75; c.position.set(x, y + 2.2, z); c.castShadow = true; E.add(c);
  });
  // Jerusalén al fondo, con el templo
  const muro = new T.MeshStandardMaterial({ color: 0xd8c39a, roughness: 0.95 });
  for (let i = 0; i < 10; i++) {
    const b = new T.Mesh(new T.BoxGeometry(9, 5 + (i % 3) * 1.5, 3), muro); b.position.set(-45 + i * 9.5, 2.5, -58); E.add(b);
    if (i % 3 === 1) { const t = new T.Mesh(new T.BoxGeometry(4, 10, 4), muro); t.position.set(-45 + i * 9.5, 5, -56); E.add(t); }
  }
  const templo = new T.Mesh(new T.BoxGeometry(14, 12, 10), new T.MeshStandardMaterial({ color: 0xf2ead6, roughness: 0.8 }));
  templo.position.set(4, 6, -68); E.add(templo);
  const techo = new T.Mesh(new T.BoxGeometry(14.6, 0.8, 10.6), ctx.oro()); techo.position.set(4, 12.4, -68); E.add(techo);
  C.nube = crearNube(ctx);
  // Jesús y los once
  A.jesus = await ctx.actor('jesus', { x: JESUS[0], z: JESUS[1], altura: 1.8, color: 0xf2efe6 });
  enderezar(ctx, A.jesus);
  A.luzJesus = new T.PointLight(0xfff6e0, 0, 8, 2); A.luzJesus.position.y = 1.4; A.jesus.g.add(A.luzJesus);
  LOS_ONCE = [];
  for (const [clave, id, x, z] of ONCE) {
    A[clave] = await ctx.actor(id, { x, z, altura: 1.72 + (LOS_ONCE.length % 3) * 0.03, color: 0x8a6a4a });
    LOS_ONCE.push(A[clave]);
  }
  // los dos varones de blanco (Hch 1:10)
  const blanco = m => { const n = m.clone(); n.emissive = new T.Color(0xffe9b0); n.emissiveIntensity = 0.4; return n; };
  A.angel1 = await ctx.actor('angel', { x: -2.4, z: 5.4, altura: 1.9, color: 0xffffff, material: blanco });
  A.angel2 = await ctx.actor('angel', { x: 2.4, z: 5.4, altura: 1.9, color: 0xffffff, material: blanco });
  // los pies en el monte: cada cuadro, a la altura del suelo (menos quien sube)
  ctx.cadaCuadro(() => { Object.values(A).forEach(a => { if (a && a.g && !a.vuela) a.g.position.y = alto(a.g.position.x, a.g.position.z); }); });
  colocar(ctx);
  inicial = Object.values(A).filter(a => a && a.g).map(a => ({ a, x: a.g.position.x, z: a.g.position.z, r: a.g.rotation.y }));
  ctx.camara.position.set(2, 4.5, 13); ctx.mira.set(0, 2, -1);
};

function colocar(ctx) {
  A.jesus.vuela = false; A.jesus.g.visible = true; A.luzJesus.intensity = 0.6;
  soltarBrazos(ctx, A.jesus); sinBrillo(A.jesus); brillo(ctx, A.jesus, 0xfff1c8, 0.12);
  ctx.mirarA(A.jesus, 0, 6);
  todosMiran(ctx, JESUS[0], JESUS[1]);
  LOS_ONCE.forEach(a => { a.reposo = null; ctx.anim(a, 'idle'); });
  [A.angel1, A.angel2].forEach(a => { a.g.visible = false; });
  C.nube.visible = false; C.nubeMat.opacity = 0; C.nube.position.set(JESUS[0], 12, JESUS[1]);
}

H.reiniciar = async function (ctx) {
  inicial.forEach(i => { i.a.g.position.set(i.x, 0, i.z); i.a.g.rotation.y = i.r; });
  colocar(ctx);
  await cielo(ctx, 'dia', 0.01);
  ctx.camara.position.set(2, 4.5, 13); ctx.mira.set(0, 2, -1);
};

H.inicio = async function (ctx) {
  const d = ctx.decir;
  await ctx.camaraA([1.5, 3.4, 8.5], [0, 2.2, 0], 2);
  await d(QUIEN.narrador, { es: 'Después de resucitar, Jesús se apareció a sus discípulos durante cuarenta días y les enseñaba sobre el reino de Dios.',
    en: 'After he rose again, Jesus appeared to his disciples for forty days and taught them about the kingdom of God.' });
  await d(QUIEN.jesus, { es: 'La paz sea con ustedes.', en: 'Peace be with you.' }, { actor: A.jesus, gesto: 'standing-greeting' });
};

H.avanzar = async function (ctx) { await ctx.esperar(0.4); };

H.momentos = [
  async function tomas(ctx) {
    await ctx.camaraA([6, 3.2, -4.4], [0.6, 1.9, 0.4], 1.6);
    await ctx.decir(QUIEN.narrador, { es: 'Tomás no estaba la primera vez, y dijo que no lo creería hasta verlo. Ocho días después, Jesús le habló.',
      en: 'Thomas was not there the first time, and he said he would not believe it until he saw him. Eight days later, Jesus spoke to him.' });
    ctx.mirarA(A.jesus, A.tomas.g.position.x, A.tomas.g.position.z);
    await ctx.decir(QUIEN.jesus, { es: 'Tomás, mira mis manos. No dudes más: cree.', en: 'Thomas, look at my hands. Stop doubting and believe.' }, { actor: A.jesus });
    await ctx.mover(A.tomas, 1.4, -0.1, 1);
    ctx.mirarA(A.tomas, JESUS[0], JESUS[1]);
    await ctx.decir(QUIEN.tomas, { es: '¡Señor mío y Dios mío!', en: 'My Lord and my God!' }, { actor: A.tomas });
    await ctx.decir(QUIEN.jesus, { es: 'Creíste porque me viste. Dichosos los que creen sin haber visto.',
      en: 'You believed because you saw me. Blessed are those who believe without having seen.' }, { actor: A.jesus });
    await ctx.mover(A.tomas, ONCE[2][2], ONCE[2][3], 0.9);
    ctx.mirarA(A.tomas, JESUS[0], JESUS[1]);
  },
  async function pedro(ctx) {
    await ctx.camaraA([-6, 3.2, -4.4], [-0.6, 1.9, 0.6], 1.6);
    ctx.mirarA(A.jesus, A.pedro.g.position.x, A.pedro.g.position.z);
    await ctx.decir(QUIEN.narrador, { es: 'Una mañana, junto al lago, después de desayunar, Jesús le preguntó a Pedro tres veces si lo amaba.',
      en: 'One morning, by the lake, after breakfast, Jesus asked Peter three times if he loved him.' });
    await ctx.decir(QUIEN.jesus, { es: 'Pedro, ¿me amas?', en: 'Peter, do you love me?' }, { actor: A.jesus });
    await ctx.decir(QUIEN.pedro, { es: 'Señor, tú lo sabes todo. Tú sabes que te amo.', en: 'Lord, you know all things. You know that I love you.' }, { actor: A.pedro });
    await ctx.decir(QUIEN.jesus, { es: 'Entonces cuida de mis ovejas.', en: 'Then take care of my sheep.' }, { actor: A.jesus });
  },
  async function espiritu(ctx) {
    ctx.mirarA(A.jesus, 0, 6);
    await ctx.camaraA([0.8, 5.6, 7.5], [0, 2.4, -1], 1.6);
    await ctx.decir(QUIEN.jesus, { es: 'No se vayan de Jerusalén. Esperen la promesa del Padre: dentro de pocos días recibirán el Espíritu Santo.',
      en: 'Do not leave Jerusalem. Wait for the promise of the Father: in a few days you will receive the Holy Spirit.' }, { actor: A.jesus });
  },
  async function testigos(ctx) {
    await ctx.camaraA([-3.2, 3.4, -7.5], [0, 1.9, 1.6], 1.8);
    await ctx.decir(QUIEN.jesus, { es: 'Recibirán poder, y serán mis testigos en Jerusalén, en Judea, en Samaria y hasta lo último de la tierra.',
      en: 'You will receive power, and you will be my witnesses in Jerusalem, in Judea, in Samaria and to the ends of the earth.' }, { actor: A.jesus });
  },
  async function sube(ctx) {
    await ctx.camaraA([0.5, 2.6, 7.5], [0, 3.2, -1], 1.6);
    await ctx.decir(QUIEN.narrador, { es: 'Entonces los llevó al monte de los Olivos, cerca de Betania, levantó las manos y los bendijo.',
      en: 'Then he led them to the Mount of Olives, near Bethany, lifted up his hands and blessed them.' });
    await bendecir(ctx, A.jesus);
    ctx.sonido('angel');
    // mientras los bendice, sube; una nube lo recibe y lo oculta (Hch 1:9)
    A.jesus.vuela = true; C.nube.visible = true;
    const y0 = A.jesus.g.position.y;
    LOS_ONCE.forEach(a => ctx.anim(a, 'pray'));
    await Promise.all([
      ctx.tween(7, u => { A.jesus.g.position.y = y0 + 11.5 * u; A.luzJesus.intensity = 0.6 + 1.6 * u; }),
      ctx.tween(7, u => { C.nubeMat.opacity = Math.min(1, u * 1.6); C.nube.position.y = 12 + 1.5 * u; }),
      ctx.camaraA([0.5, 1.6, 8.5], [0, 9, -1.2], 6)
    ]);
    A.jesus.g.visible = false;
    await ctx.decir(QUIEN.narrador, { es: 'Mientras los bendecía, subió al cielo, y una nube lo ocultó de su vista.',
      en: 'While he was blessing them, he was taken up to heaven, and a cloud hid him from their sight.' });
  },
  async function varones(ctx) {
    await ctx.tween(2, u => { C.nubeMat.opacity = 1 - u; });
    C.nube.visible = false;
    A.angel1.g.visible = A.angel2.g.visible = true;
    ctx.mirarA(A.angel1, 0, 2); ctx.mirarA(A.angel2, 0, 2);
    ctx.sonido('angel');
    await ctx.camaraA([0, 2.9, 12], [0, 2, 3], 1.6);
    todosMiran(ctx, 0, 8);
    await ctx.decir(QUIEN.angel, { es: 'Hombres de Galilea, ¿por qué se quedan mirando al cielo? Este mismo Jesús volverá de la misma manera que lo han visto irse.',
      en: 'Men of Galilee, why do you stand looking up at the sky? This same Jesus will come back in the same way you have seen him go.' }, { actor: [A.angel1, A.angel2] });
  },
  async function vuelven(ctx) {
    // lo adoraron y volvieron a Jerusalén con gran alegría (Lc 24:52)
    [A.sadrac, A.h1, A.h2].forEach(a => ctx.anim(a, 'kneel', { una: true }));
    await ctx.esperar(1.2);
    [A.angel1, A.angel2].forEach(a => { a.g.visible = false; });
    LOS_ONCE.forEach(a => { a.reposo = null; ctx.anim(a, 'idle'); });
    cielo(ctx, 'tarde', 3);
    await ctx.camaraA([3, 3.5, 6], [0, 2, -12], 2);
    await Promise.all([
      ...LOS_ONCE.map((a, i) => ctx.esperar(i * 0.12).then(() => ctx.mover(a, a.g.position.x * 0.5, -12 - (i % 4) * 1.2, 5.2))),
      ctx.decir(QUIEN.narrador, { es: 'Ellos lo adoraron y volvieron a Jerusalén con gran alegría. Y estaban siempre en el templo, alabando a Dios.',
        en: 'They worshipped him and went back to Jerusalem with great joy. And they were always in the temple, praising God.' })
    ]);
  }
];

H.final = async function (ctx) {
  await ctx.camaraA([0, 2, 10], [0, 10, -20], 2.4);
  await ctx.decir(QUIEN.narrador, { es: 'Jesús subió al cielo para prepararnos un lugar. Desde allí nos ayuda, y un día volverá en las nubes, tal como se fue.',
    en: 'Jesus went up to heaven to prepare a place for us. From there he helps us, and one day he will come back in the clouds, just as he left.' });
};
})();
