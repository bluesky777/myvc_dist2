/* La cruz y la tumba vacía (Mt 27–28, Lc 23–24, Jn 19–20). Joseth, 15 nov 2026: encargos/historias-3d.md de
   myvc_biblioteca, historia 7 (se hacen en orden inverso, empezando por ésta).
   - Sin sangre (decisión del 9 nov): la cruz se ve de lejos, el cielo se oscurece al mediodía y María está al pie.
     Sin juego de puntos sobre la cruz: el reto no es ganarle a nadie, es el tiempo que pasa del viernes al domingo.
   - La historia va por momentos ENTRE las preguntas (H.momentos; el motor los reparte): el perdón, la ropa repartida,
     «ahí tienes a tu madre», la oscuridad, «todo se ha cumplido» y el centurión, la tumba cerrada con guardias, y el
     sábado de reposo (Lc 23:56). El final, después de la última: el domingo al amanecer, el terremoto, el ángel
     quita la piedra, los guardias quedan como muertos, María Magdalena, Juan que corre y Jesús resucitado.
   - La cruz, el monte, la piedra y el cielo se hacen aquí con código. A Jesús en la cruz se le abren los brazos con
     sus huesos (brazosEnCruz): el clip se para y cada brazo se lleva a la horizontal.
   - Las palabras parafrasean la Biblia (no se cita la RV1960).
   - Con Mixamo (idle, walk, talk, sit, terrified, falling-back-death, crying, running, kneel, sad-idle, surprised)
     los personajes se mueven solos; sin él, el motor hace lo que puede (respirar, asentir, balancearse). */
(function () {
'use strict';
const H = {};
(window.HISTORIAS = window.HISTORIAS || {}).cruz = H;

H.titulo = { es: 'La cruz y la tumba vacía', en: 'The Cross and the Empty Tomb' };
H.frase = { es: 'Jesús dio su vida en la cruz un viernes, descansó en la tumba el sábado y el domingo resucitó.',
  en: 'Jesus gave his life on the cross on a Friday, rested in the tomb on the Sabbath, and on Sunday he rose again.' };
H.como = { es: 'Contesta las preguntas. Entre una y otra, la historia sigue: del viernes por la tarde al domingo por la mañana.',
  en: 'Answer the questions. Between them, the story goes on: from Friday afternoon to Sunday morning.' };
H.reto = { es: 'Del viernes al domingo', en: 'From Friday to Sunday' };
/* las preguntas siguen el orden de la historia (el motor no las baraja) */
H.enOrden = true;
H.modelos = ['jesus', 'maria', 'maria-magdalena', 'juan', 'soldado-romano', 'angel', 'tumba'];
/* las voces (Kokoro) de cada quien: tools/voz_historia.py de myvc_biblioteca */
H.voces = { narrador: 'narrador', jesus: 'jesus', centurion: 'soldado', angel: 'angel', magdalena: 'mujer', juan: 'joven' };

/* el reto: el tiempo, del viernes al mediodía al domingo al amanecer (la semana va de domingo a sábado) */
const HORAS = {
  // el k-ésimo acierto trae el k-ésimo momento: el perdón, la ropa, «ahí tienes a tu madre», la oscuridad (mediodía);
  // «todo se ha cumplido» (tres de la tarde); la tumba (al caer el sol); el sábado. El domingo lo pone el final.
  es: ['', 'Viernes, mediodía', 'Viernes, mediodía', 'Viernes, mediodía', 'Viernes, mediodía', 'Viernes, tres de la tarde',
    'Viernes, al caer el sol', 'Sábado, día de reposo'],
  en: ['', 'Friday, noon', 'Friday, noon', 'Friday, noon', 'Friday, noon', 'Friday, three in the afternoon',
    'Friday, at sunset', 'Sabbath, the day of rest']
};
const DOMINGO = { es: 'Domingo, al amanecer', en: 'Sunday, at sunrise' };
let IDI = 'es';
H.valorReto = f => {
  const L = HORAS[IDI] || HORAS.es;
  return f > 0 ? L[Math.min(L.length - 1, Math.round(f * (L.length - 1)))] : '';
};
/* de la noche (azul oscuro) al amanecer (oro) */
H.colorPaso = f => {
  const a = [44, 52, 86], b = [255, 196, 92], u = Math.min(1, Math.max(0, f));
  return 'rgb(' + a.map((v, i) => Math.round(v + (b[i] - v) * u)).join(' ') + ')';
};

H.preguntas = {
  es: [
    { p: '¿Cómo se llamaba el monte donde crucificaron a Jesús?', opciones: ['Gólgota', 'Sinaí', 'Carmelo'], correcta: 0 },
    { p: '¿Qué le pidió Jesús a su Padre por los que lo crucificaban?', opciones: ['Que los perdonara', 'Que los castigara', 'Que se fueran'], correcta: 0 },
    { p: '¿A quién le pidió Jesús que cuidara a su madre?', opciones: ['A Juan', 'A un soldado', 'A Pilato'], correcta: 0 },
    { p: '¿Qué pasó con el cielo al mediodía?', opciones: ['Se oscureció', 'Salió un arcoíris', 'Nevó'], correcta: 0 },
    { p: '¿Qué día descansaron las mujeres, como manda el mandamiento?', opciones: ['El sábado', 'El domingo', 'El lunes'], correcta: 0 },
    { p: '¿Quién quitó la piedra de la tumba?', opciones: ['Un ángel del Señor', 'Los soldados', 'María Magdalena'], correcta: 0 },
    { p: '¿Qué dijo el ángel a las mujeres?', opciones: ['No está aquí: ha resucitado', 'Vuelvan mañana', 'Aquí está dormido'], correcta: 0 }
  ],
  en: [
    { p: 'What was the name of the hill where Jesus was crucified?', opciones: ['Golgotha', 'Sinai', 'Carmel'], correcta: 0 },
    { p: 'What did Jesus ask his Father for the people who crucified him?', opciones: ['To forgive them', 'To punish them', 'To send them away'], correcta: 0 },
    { p: 'Who did Jesus ask to take care of his mother?', opciones: ['John', 'A soldier', 'Pilate'], correcta: 0 },
    { p: 'What happened to the sky at noon?', opciones: ['It became dark', 'A rainbow came out', 'It snowed'], correcta: 0 },
    { p: 'On which day did the women rest, as the commandment says?', opciones: ['The Sabbath', 'Sunday', 'Monday'], correcta: 0 },
    { p: 'Who rolled the stone away from the tomb?', opciones: ['An angel of the Lord', 'The soldiers', 'Mary Magdalene'], correcta: 0 },
    { p: 'What did the angel tell the women?', opciones: ['He is not here: he has risen', 'Come back tomorrow', 'He is sleeping here'], correcta: 0 }
  ]
};

const QUIEN = {
  narrador: { es: '', en: '', voz: 'narrador' },
  jesus: { es: 'Jesús', en: 'Jesus', voz: 'jesus' },
  centurion: { es: 'El centurión', en: 'The centurion', voz: 'soldado' },
  angel: { es: 'El ángel', en: 'The angel', voz: 'angel' },
  magdalena: { es: 'María Magdalena', en: 'Mary Magdalene', voz: 'mujer' },
  juan: { es: 'Juan', en: 'John', voz: 'joven' }
};

/* ---------- el lugar: el Gólgota a la izquierda, el huerto con la tumba a la derecha (Jn 19:41) ---------- */
const CRUZ = { x: -6, z: -4, monte: 0.55, travesano: 4.75 };
const TUMBA = { x: 7, z: -10, frente: -7.35, radio: 1.05 };
const L = {
  maria: [-7.5, -1.5], juan: [-6.6, -1.1], magdalena: [-8.5, -1.9],
  soldado: [-4.1, -2.2], centurion: [-4.3, -0.4],
  guardia1: [5.2, -5.8], guardia2: [8.9, -5.8],
  angel: [8.7, -6.4], magLlega: [5.6, -3.6], juanLlega: [6.4, -5.2], jesusHuerto: [3.2, -4.6]
};
let A = {}, C = {}, inicial = [];

function crearMonte(ctx) {
  const T = ctx.THREE;
  const roca = new T.MeshStandardMaterial({ color: 0x9a8a72, roughness: 1 });
  const m = new T.Mesh(new T.CylinderGeometry(1.7, 2.8, CRUZ.monte, 28), roca);
  m.position.set(CRUZ.x, CRUZ.monte / 2, CRUZ.z); m.receiveShadow = m.castShadow = true; ctx.escena.add(m);
  // la cruz: un madero alto y el travesaño
  const madera = new T.MeshStandardMaterial({ color: 0x6b4a2b, roughness: 0.9 });
  const g = new T.Group(); g.position.set(CRUZ.x, CRUZ.monte, CRUZ.z);
  const palo = new T.Mesh(new T.BoxGeometry(0.24, 5.2, 0.22), madera); palo.position.y = 2.6;
  const trav = new T.Mesh(new T.BoxGeometry(2.7, 0.22, 0.2), madera); trav.position.set(0, CRUZ.travesano - CRUZ.monte, 0);
  [palo, trav].forEach(b => { b.castShadow = b.receiveShadow = true; g.add(b); });
  ctx.escena.add(g);
  return g;
}

/* la piedra de la tumba: un disco grueso que rueda de lado */
function crearPiedra(ctx) {
  const T = ctx.THREE;
  const p = new T.Mesh(new T.CylinderGeometry(TUMBA.radio, TUMBA.radio, 0.38, 32), new T.MeshStandardMaterial({ color: 0x8c8274, roughness: 1 }));
  p.rotation.x = Math.PI / 2; p.castShadow = p.receiveShadow = true;
  const g = new T.Group(); g.add(p); g.position.set(TUMBA.x, TUMBA.radio, TUMBA.frente + 0.25);
  ctx.escena.add(g);
  return g;
}
function rodarPiedra(ctx, hasta, s) {
  const x0 = C.piedra.position.x, r0 = C.piedra.rotation.z;
  return ctx.tween(s, u => { const x = x0 + (hasta - x0) * u; C.piedra.position.x = x; C.piedra.rotation.z = r0 - (x - x0) / TUMBA.radio; });
}

/* ---------- el cielo: de día, oscuro al mediodía (Lc 23:44), noche, y el amanecer del domingo ---------- */
const CIELOS = {
  dia: { cielo: 0xc9d8e6, luz: 1.4, hemi: 0.8, sol: 0xfff1d6 },
  oscuro: { cielo: 0x2a2f3c, luz: 0.14, hemi: 0.2, sol: 0x8090b0 },
  noche: { cielo: 0x151a2c, luz: 0.08, hemi: 0.14, sol: 0x6070a0 },
  reposo: { cielo: 0xb8c6d6, luz: 0.9, hemi: 0.6, sol: 0xf4ead8 },
  amanecer: { cielo: 0xf0b98a, luz: 0.95, hemi: 0.4, sol: 0xffc27a }
};
function cielo(ctx, nombre, s) {
  const T = ctx.THREE, a = { c: C.fondo.clone(), l: C.sol.intensity, h: C.hemi.intensity, s: C.sol.color.clone() }, b = CIELOS[nombre];
  const cb = new T.Color(b.cielo), sb = new T.Color(b.sol);
  return ctx.tween(s || 2, u => {
    C.fondo.copy(a.c).lerp(cb, u); ctx.escena.background.copy(C.fondo); ctx.escena.fog.color.copy(C.fondo);
    C.sol.intensity = a.l + (b.luz - a.l) * u; C.hemi.intensity = a.h + (b.hemi - a.h) * u; C.sol.color.copy(a.s).lerp(sb, u);
  });
}

/* el temblor de tierra (Mt 27:51, 28:2): la cámara tiembla un rato */
function temblor(ctx, s, fuerza) {
  ctx.sonido('explosion');
  if (ctx.reducir || ctx.saltando()) return ctx.esperar(0.1);
  const off = new ctx.THREE.Vector3();
  let t = 0;
  return new Promise(si => {
    const parar = ctx.cadaCuadro(dt => {
      ctx.camara.position.sub(off); t += dt;
      if (t >= s) { off.set(0, 0, 0); parar(); si(); return; }
      const k = fuerza * (1 - t / s);
      off.set((Math.random() - 0.5) * k, (Math.random() - 0.5) * k * 0.6, (Math.random() - 0.5) * k);
      ctx.camara.position.add(off);
    });
  });
}

/* ---------- Jesús en la cruz: el clip se para y cada brazo se lleva a la horizontal con sus huesos ---------- */
function esqueleto(a) { let sk = null; a.obj.traverse(m => { if (!sk && m.isSkinnedMesh) sk = m.skeleton; }); return sk; }
function hueso(sk, re) { return sk && sk.bones.find(b => re.test(b.name)); }
function alinear(T, b, hijo, dir) {
  const pb = b.getWorldPosition(new T.Vector3()), pc = hijo.getWorldPosition(new T.Vector3());
  const cur = pc.sub(pb).normalize(), qd = new T.Quaternion().setFromUnitVectors(cur, dir);
  const nueva = qd.multiply(b.getWorldQuaternion(new T.Quaternion()));
  const padre = b.parent.getWorldQuaternion(new T.Quaternion()).invert();
  b.quaternion.copy(padre.multiply(nueva)); b.updateMatrixWorld(true);
}
/* el GLB de Jesús no viene mirando a +Z: se mide con los hombros (el izquierdo tiene que quedar en +X) y se gira el
   modelo dentro de su grupo, para que mirarA y la cruz funcionen */
function enderezar(ctx, a) {
  const T = ctx.THREE, sk = esqueleto(a), i = hueso(sk, /LeftArm$/), d = hueso(sk, /RightArm$/);
  if (!i || !d) return;
  a.g.updateMatrixWorld(true);
  const v = i.getWorldPosition(new T.Vector3()).sub(d.getWorldPosition(new T.Vector3()));
  const giro = Math.atan2(v.z, v.x);   // lo que hay que girar (en Y) para llevar el eje de los hombros a +X
  if (Math.abs(giro) < 0.05) return;
  const centro = new T.Box3().setFromObject(a.obj).getCenter(new T.Vector3()); a.g.worldToLocal(centro);
  a.obj.rotation.y += giro;
  a.g.updateMatrixWorld(true);
  const nuevo = new T.Box3().setFromObject(a.obj).getCenter(new T.Vector3()); a.g.worldToLocal(nuevo);
  a.obj.position.x += centro.x - nuevo.x; a.obj.position.z += centro.z - nuevo.z;
}
function brazosEnCruz(ctx, a) {
  const T = ctx.THREE, sk = esqueleto(a);
  if (a.mixer) { a.mixer.stopAllAction(); a.accion = null; }
  a.reposo = 'cruz';
  if (!sk) return false;
  sk.pose(); a.g.updateMatrixWorld(true);
  const giro = a.g.getWorldQuaternion(new T.Quaternion());
  [['Left', 1], ['Right', -1]].forEach(([lado, s]) => {
    const dir = new T.Vector3(s, 0.06, 0).normalize().applyQuaternion(giro);
    const brazo = hueso(sk, new RegExp(lado + 'Arm$')), ante = hueso(sk, new RegExp(lado + 'ForeArm$')), mano = hueso(sk, new RegExp(lado + 'Hand$'));
    if (brazo && ante) alinear(T, brazo, ante, dir);
    if (ante && mano) alinear(T, ante, mano, dir);
  });
  // las manos a la altura del travesaño
  const mano = hueso(sk, /LeftHand$/);
  if (mano) { const y = mano.getWorldPosition(new T.Vector3()).y; a.g.position.y += CRUZ.travesano - 0.02 - y; }
  return true;
}
/* inclina la cabeza (Jn 19:30) */
function inclinarCabeza(ctx, a) {
  const sk = esqueleto(a), c = hueso(sk, /Head$/);
  if (!c) return ctx.tween(0.8, u => { a.obj.rotation.x = 0.12 * u; });
  const r0 = c.rotation.x;
  return ctx.tween(1.4, u => { c.rotation.x = r0 + 0.45 * u; });
}

/* correr (Jn 20:2-4): con «Running» de Mixamo; sin él, caminar más rápido */
function correr(ctx, a, x, z, s) {
  if (!(a.clips && a.clips.running)) return ctx.mover(a, x, z, s);
  const x0 = a.g.position.x, z0 = a.g.position.z;
  a.g.rotation.y = Math.atan2(x - x0, z - z0); a.moviendo = true;
  ctx.anim(a, 'running');
  return ctx.tween(s, u => { a.g.position.x = x0 + (x - x0) * u; a.g.position.z = z0 + (z - z0) * u; })
    .then(() => { a.moviendo = false; ctx.anim(a, a.reposo || 'idle'); });
}
/* los guardias de la tumba, de miedo, quedan como muertos (Mt 28:4) */
function caer(ctx, a, dx, dz) {
  const x0 = a.g.position.x, z0 = a.g.position.z;
  const paso = ctx.tween(0.8, u => { a.g.position.x = x0 + dx * u; a.g.position.z = z0 + dz * u; });
  if (a.clips && a.clips['falling-back-death']) return Promise.all([paso, ctx.anim(a, 'falling-back-death', { una: true, quedarse: true })]);
  return Promise.all([paso, ctx.tween(0.7, u => { a.obj.rotation.x = -1.45 * u; })]);
}
function brillo(ctx, a, color, k) {
  const T = ctx.THREE;
  a.obj.traverse(m => { if (m.isMesh) { m.material = m.material.clone(); m.material.emissive = new T.Color(color); m.material.emissiveIntensity = k; } });
}

H.montar = async function (ctx) {
  const T = ctx.THREE, E = ctx.escena;
  IDI = ctx.idioma === 'en' ? 'en' : 'es';
  C.fondo = new T.Color(CIELOS.dia.cielo);
  E.background = C.fondo.clone();
  E.fog = new T.Fog(C.fondo.clone(), 40, 150);
  C.hemi = new T.HemisphereLight(0xfff1d6, 0x6a5a40, CIELOS.dia.hemi); E.add(C.hemi);
  C.sol = new T.DirectionalLight(CIELOS.dia.sol, CIELOS.dia.luz);
  C.sol.position.set(-16, 24, 18); C.sol.castShadow = true; C.sol.shadow.mapSize.set(2048, 2048);
  Object.assign(C.sol.shadow.camera, { left: -26, right: 26, top: 26, bottom: -26, near: 1, far: 90 });
  E.add(C.sol);
  const suelo = new T.Mesh(new T.PlaneGeometry(300, 300), new T.MeshStandardMaterial({ color: 0xb9a57c, roughness: 1 }));
  suelo.rotation.x = -Math.PI / 2; suelo.receiveShadow = true; E.add(suelo);
  // el huerto: un prado verde alrededor de la tumba, unos olivos y las murallas de Jerusalén a lo lejos
  const prado = new T.Mesh(new T.CircleGeometry(9, 40), new T.MeshStandardMaterial({ color: 0x8aa564, roughness: 1 }));
  prado.rotation.x = -Math.PI / 2; prado.position.set(TUMBA.x, 0.01, TUMBA.z + 3); prado.receiveShadow = true; E.add(prado);
  const hoja = new T.MeshStandardMaterial({ color: 0x6f8a52, roughness: 1 }), tronco = new T.MeshStandardMaterial({ color: 0x5b4632, roughness: 1 });
  [[2.5, -11], [11.5, -8], [12, -13], [3.5, -14], [13.5, -3.5]].forEach(([x, z]) => {
    const t = new T.Mesh(new T.CylinderGeometry(0.12, 0.2, 1.6, 8), tronco); t.position.set(x, 0.8, z); t.castShadow = true; E.add(t);
    const c = new T.Mesh(new T.SphereGeometry(1.1, 14, 10), hoja); c.scale.y = 0.75; c.position.set(x, 2.1, z); c.castShadow = true; E.add(c);
  });
  const muro = new T.MeshStandardMaterial({ color: 0xc9b48a, roughness: 0.95 });
  for (let i = 0; i < 9; i++) {
    const b = new T.Mesh(new T.BoxGeometry(9, 5 + (i % 3) * 1.5, 3), muro); b.position.set(-48 + i * 9.5, 2.5, -62); E.add(b);
    if (i % 3 === 1) { const t = new T.Mesh(new T.BoxGeometry(4, 10, 4), muro); t.position.set(-48 + i * 9.5, 5, -60); E.add(t); }
  }
  C.cruz = crearMonte(ctx);
  A.tumba = await ctx.actor('tumba', { x: TUMBA.x, z: TUMBA.z, altura: 3 });
  C.piedra = crearPiedra(ctx);
  // personajes
  A.jesus = await ctx.actor('jesus', { x: CRUZ.x, z: CRUZ.z + 0.16, altura: 1.8, color: 0xf2efe6 });
  enderezar(ctx, A.jesus);
  A.maria = await ctx.actor('maria', { x: L.maria[0], z: L.maria[1], altura: 1.65, color: 0x2b4c8f });
  A.juan = await ctx.actor('juan', { x: L.juan[0], z: L.juan[1], altura: 1.72, color: 0x8a5a2b });
  A.magdalena = await ctx.actor('maria-magdalena', { x: L.magdalena[0], z: L.magdalena[1], altura: 1.65, color: 0x9b2c4a });
  A.soldado = await ctx.actor('soldado-romano', { x: L.soldado[0], z: L.soldado[1], altura: 1.8, color: 0x8b2a1d });
  A.centurion = await ctx.actor('soldado-romano', { x: L.centurion[0], z: L.centurion[1], altura: 1.85, color: 0x8b2a1d });
  A.guardia1 = await ctx.actor('soldado-romano', { x: L.guardia1[0], z: L.guardia1[1], altura: 1.8, color: 0x8b2a1d });
  A.guardia2 = await ctx.actor('soldado-romano', { x: L.guardia2[0], z: L.guardia2[1], altura: 1.8, color: 0x8b2a1d });
  A.angel = await ctx.actor('angel', { x: L.angel[0], z: L.angel[1], altura: 1.9, color: 0xffffff,
    material: m => { const n = m.clone(); n.emissive = new T.Color(0xffe9b0); n.emissiveIntensity = 0.5; return n; } });
  A.luzAngel = new T.PointLight(0xfff4d6, 0, 9, 2); A.luzAngel.position.y = 1.5; A.angel.g.add(A.luzAngel);
  A.luzJesus = new T.PointLight(0xfff6e0, 0, 7, 2); A.luzJesus.position.y = 1.4; A.jesus.g.add(A.luzJesus);
  colocar(ctx);
  inicial = Object.values(A).filter(a => a && a.g).map(a => ({ a, x: a.g.position.x, y: a.g.position.y, z: a.g.position.z, r: a.g.rotation.y }));
  ctx.camara.position.set(-2, 5, 14); ctx.mira.set(-4, 2.6, -3);
};

/* cómo empieza: Jesús en la cruz; los suyos al pie; los guardias de la tumba y el ángel, todavía no */
function colocar(ctx) {
  brazosEnCruz(ctx, A.jesus);
  [A.maria, A.juan, A.magdalena].forEach(a => ctx.mirarA(a, CRUZ.x, CRUZ.z));
  ctx.mirarA(A.soldado, CRUZ.x, CRUZ.z); ctx.mirarA(A.centurion, CRUZ.x, CRUZ.z);
  [A.guardia1, A.guardia2, A.angel].forEach(a => { a.g.visible = false; });
  ctx.mirarA(A.guardia1, TUMBA.x - 1, 2); ctx.mirarA(A.guardia2, TUMBA.x + 1, 2);
  C.piedra.position.x = TUMBA.x + 2.6; C.piedra.rotation.z = 0;   // la tumba nueva, abierta, todavía sin nadie
  A.luzAngel.intensity = 0; A.luzJesus.intensity = 0;
}

H.reiniciar = async function (ctx) {
  inicial.forEach(i => { i.a.g.position.set(i.x, i.y, i.z); i.a.g.rotation.y = i.r; i.a.g.visible = true; i.a.obj.rotation.x = 0; i.a.obj.position.y = i.a.base; i.a.reposo = null; ctx.anim(i.a, 'idle'); });
  colocar(ctx);
  await cielo(ctx, 'dia', 0.01);
  ctx.camara.position.set(-2, 5, 14); ctx.mira.set(-4, 2.6, -3);
};

H.inicio = async function (ctx) {
  const d = ctx.decir;
  await ctx.camaraA([-3.5, 3.2, 7], [-6, 3.2, -4], 2.2);
  await d(QUIEN.narrador, { es: 'Un viernes, en un monte llamado Gólgota, a las afueras de Jerusalén, crucificaron a Jesús.',
    en: 'One Friday, on a hill called Golgotha, outside Jerusalem, Jesus was crucified.' });
  await d(QUIEN.narrador, { es: 'Él no había hecho nada malo. Dio su vida por amor, para salvarnos a todos.',
    en: 'He had done nothing wrong. He gave his life out of love, to save us all.' });
};

/* cada acierto: el tiempo avanza un paso (lo cuenta el reto); un respiro */
H.avanzar = async function (ctx) { await ctx.esperar(0.4); };

H.momentos = [
  async function perdon(ctx) {
    await ctx.camaraA([-5.2, 4.2, 2.5], [-6, 4.1, -4], 1.6);
    await ctx.decir(QUIEN.jesus, { es: 'Padre, perdónalos, porque no saben lo que están haciendo.',
      en: 'Father, forgive them, for they do not know what they are doing.' });
  },
  async function ropa(ctx) {
    await ctx.camaraA([-1.5, 2.4, 2.5], [-4.2, 1, -1.5], 1.6);
    if (A.soldado.clips.sit) ctx.reposo(A.soldado, 'sit');
    if (A.centurion.clips.sit) { ctx.mover(A.centurion, L.soldado[0] + 0.9, L.soldado[1] + 0.9, 1.4).then(() => { ctx.mirarA(A.centurion, L.soldado[0], L.soldado[1]); ctx.reposo(A.centurion, 'sit'); }); }
    await ctx.decir(QUIEN.narrador, { es: 'Los soldados se repartieron su ropa, y echaron suertes por su túnica, que era de una sola pieza.',
      en: 'The soldiers divided his clothes among them, and cast lots for his tunic, which was woven in one piece.' });
  },
  async function madre(ctx) {
    await ctx.camaraA([-7.2, 2.2, 3.5], [-6.9, 1.6, -1.6], 1.6);
    await ctx.decir(QUIEN.narrador, { es: 'Junto a la cruz estaban María, su madre, María Magdalena y Juan, el discípulo que Jesús amaba.',
      en: 'Near the cross stood Mary his mother, Mary Magdalene, and John, the disciple whom Jesus loved.' });
    await ctx.decir(QUIEN.jesus, { es: 'Mujer, ahí tienes a tu hijo.', en: 'Woman, here is your son.' });
    ctx.mirarA(A.juan, L.maria[0], L.maria[1]);
    await ctx.decir(QUIEN.jesus, { es: 'Juan, ahí tienes a tu madre.', en: 'John, here is your mother.' });
    await ctx.mover(A.juan, L.maria[0] + 0.55, L.maria[1] + 0.25, 0.8);
    ctx.mirarA(A.juan, CRUZ.x, CRUZ.z);
    await ctx.decir(QUIEN.narrador, { es: 'Desde ese día, Juan la recibió en su casa y la cuidó como a su propia madre.',
      en: 'From that day on, John took her into his home and cared for her as his own mother.' });
  },
  async function oscuridad(ctx) {
    await ctx.camaraA([-1, 6, 13], [-5, 3, -4], 1.8);
    await Promise.all([cielo(ctx, 'oscuro', 3),
      ctx.decir(QUIEN.narrador, { es: 'Al mediodía, el cielo se oscureció sobre toda la tierra, y así estuvo hasta las tres de la tarde.',
        en: 'At noon, darkness came over the whole land, and it lasted until three in the afternoon.' })]);
  },
  async function cumplido(ctx) {
    await ctx.camaraA([-5, 3.8, 3], [-6, 4.2, -4], 1.6);
    await ctx.decir(QUIEN.jesus, { es: '¡Todo se ha cumplido!', en: 'It is finished!' });
    await inclinarCabeza(ctx, A.jesus);
    await ctx.decir(QUIEN.narrador, { es: 'Inclinó la cabeza y entregó su vida. La tierra tembló y las rocas se partieron.',
      en: 'He bowed his head and gave up his life. The earth shook and the rocks split apart.' });
    await temblor(ctx, 1.8, 0.35);
    if (A.centurion.reposo === 'sit') ctx.reposo(A.centurion, 'idle');
    await ctx.mover(A.centurion, L.centurion[0], L.centurion[1], 1);
    ctx.mirarA(A.centurion, CRUZ.x, CRUZ.z);
    await ctx.camaraA([-2.2, 2.2, 2.6], [-4.3, 1.6, -0.4], 1.4);
    await ctx.decir(QUIEN.centurion, { es: '¡De verdad, este hombre era el Hijo de Dios!', en: 'Truly, this man was the Son of God!' }, { actor: A.centurion });
  },
  async function sepultura(ctx) {
    // sin mostrar cómo lo bajan: la cámara va al huerto, y Jesús ya no está en la cruz
    await cielo(ctx, 'noche', 1.6);
    A.jesus.g.visible = false; A.jesus.g.position.set(TUMBA.x, 0, TUMBA.z - 1); A.jesus.g.rotation.y = 0;
    await ctx.camaraA([TUMBA.x - 2, 2.8, TUMBA.frente + 9], [TUMBA.x, 1.4, TUMBA.frente], 1.8);
    await ctx.decir(QUIEN.narrador, { es: 'Al caer la tarde, José de Arimatea envolvió el cuerpo de Jesús en una sábana limpia y lo puso en una tumba nueva, cavada en la roca.',
      en: 'In the evening, Joseph of Arimathea wrapped the body of Jesus in a clean linen cloth and laid it in a new tomb cut in the rock.' });
    ctx.sonido('llamarada', { fuerza: 0.2 });
    await rodarPiedra(ctx, TUMBA.x, 2.4);
    await ctx.decir(QUIEN.narrador, { es: 'Hizo rodar una gran piedra a la entrada. Después pusieron soldados a vigilar la tumba.',
      en: 'He rolled a large stone in front of the entrance. Then soldiers were sent to guard the tomb.' });
    A.guardia1.g.visible = A.guardia2.g.visible = true;
  },
  async function sabado(ctx) {
    await Promise.all([cielo(ctx, 'reposo', 2), ctx.camaraA([-8, 2.4, 6], [-7.5, 1.4, -1.5], 1.6)]);
    [A.maria, A.magdalena, A.juan].forEach(a => ctx.mirarA(a, -7, 6));
    if (A.magdalena.clips.crying) ctx.reposo(A.magdalena, 'crying');
    await ctx.decir(QUIEN.narrador, { es: 'Las mujeres prepararon especias y perfumes. Y el sábado descansaron, como manda el mandamiento.',
      en: 'The women prepared spices and perfumes. And on the Sabbath they rested, as the commandment says.' });
  }
];

H.final = async function (ctx) {
  const d = ctx.decir, P = { x: TUMBA.x, z: TUMBA.frente };
  // el domingo, muy temprano
  A.magdalena.reposo = null; ctx.anim(A.magdalena, 'idle');
  A.magdalena.g.position.set(-2, 0, 2); A.juan.g.position.set(-3.2, 0, 2.6);
  const rv = document.getElementById('retoVal'); if (rv) rv.textContent = DOMINGO[IDI];
  await cielo(ctx, 'amanecer', 2.5);
  await ctx.camaraA([P.x - 1, 2.6, P.z + 9.5], [P.x, 1.6, P.z], 1.6);
  await d(QUIEN.narrador, { es: 'El domingo, el primer día de la semana, muy temprano, hubo un gran temblor de tierra.',
    en: 'On Sunday, the first day of the week, very early in the morning, there was a great earthquake.' });
  // el ángel baja del cielo y quita la piedra (Mt 28:2)
  A.angel.g.visible = true; A.angel.g.position.set(L.angel[0], 9, L.angel[1]); ctx.mirarA(A.angel, P.x, P.z + 6);
  ctx.sonido('angel');
  await Promise.all([temblor(ctx, 2.2, 0.3), ctx.tween(2.2, u => { A.angel.g.position.y = 9 * (1 - u); A.luzAngel.intensity = 3 * u; })]);
  await rodarPiedra(ctx, TUMBA.x + 2.6, 1.8);
  // los guardias tiemblan de miedo y quedan como muertos (Mt 28:4)
  [A.guardia1, A.guardia2].forEach(a => ctx.mirarA(a, L.angel[0], L.angel[1]));
  await Promise.all([A.guardia1, A.guardia2].map(a => ctx.anim(a, 'terrified', { una: true })));
  await Promise.all([caer(ctx, A.guardia1, -0.6, 0.9), caer(ctx, A.guardia2, 0.6, 0.9)]);
  await d(QUIEN.narrador, { es: 'Un ángel del Señor bajó del cielo y quitó la piedra de la entrada. Los guardias temblaron de miedo y quedaron como muertos.',
    en: 'An angel of the Lord came down from heaven and rolled the stone away from the entrance. The guards shook with fear and became like dead men.' });
  // María Magdalena llega con las especias
  await ctx.camaraA([P.x - 4.5, 2, P.z + 6.5], [P.x - 0.5, 1.4, P.z + 1.5], 1.4);
  await ctx.mover(A.magdalena, L.magLlega[0], L.magLlega[1], 2.6);
  ctx.mirarA(A.magdalena, L.angel[0], L.angel[1]); ctx.mirarA(A.angel, L.magLlega[0], L.magLlega[1]);
  if (A.magdalena.clips.surprised) ctx.anim(A.magdalena, 'surprised', { una: true });
  await d(QUIEN.angel, { es: 'No tengan miedo. Sé que buscan a Jesús, el que fue crucificado. No está aquí: ¡ha resucitado, como él dijo!',
    en: 'Do not be afraid. I know you are looking for Jesus, who was crucified. He is not here: he has risen, just as he said!' }, { actor: A.angel });
  await d(QUIEN.angel, { es: 'Vengan a ver el lugar donde lo pusieron, y vayan pronto a contarlo a sus discípulos.',
    en: 'Come and see the place where he lay, and go quickly and tell his disciples.' }, { actor: A.angel });
  // Juan corre a la tumba y llega primero (Jn 20:4)
  await ctx.camaraA([P.x - 6, 2.4, P.z + 9], [P.x - 1, 1.2, P.z + 1], 1.4);
  await correr(ctx, A.juan, L.juanLlega[0], L.juanLlega[1], 2.4);
  ctx.mirarA(A.juan, P.x, P.z);
  await d(QUIEN.narrador, { es: 'Pedro y Juan corrieron a la tumba. Juan llegó primero, miró adentro y vio las sábanas dobladas. ¡La tumba estaba vacía!',
    en: 'Peter and John ran to the tomb. John got there first, looked inside and saw the linen cloths folded. The tomb was empty!' });
  await ctx.tween(1.2, u => { A.luzAngel.intensity = 3 * (1 - u); });
  A.angel.g.visible = false;
  // Jesús resucitado, en el huerto (Jn 20:14-16)
  A.jesus.g.position.set(L.jesusHuerto[0], 0, L.jesusHuerto[1]); A.jesus.g.visible = true;
  const sk = esqueleto(A.jesus); if (sk) sk.pose();
  A.jesus.reposo = null; ctx.anim(A.jesus, 'idle');
  brillo(ctx, A.jesus, 0xfff1c8, 0.28);
  ctx.mirarA(A.jesus, L.magLlega[0], L.magLlega[1]); ctx.mirarA(A.magdalena, L.jesusHuerto[0], L.jesusHuerto[1]);
  ctx.sonido('angel');
  await ctx.camaraA([4.6, 1.9, 1.2], [4.3, 1.4, -4.1], 1.6);
  await ctx.tween(1.4, u => { A.luzJesus.intensity = 2.2 * u; });
  await d(QUIEN.jesus, { es: '¡María!', en: 'Mary!' }, { actor: A.jesus });
  await d(QUIEN.magdalena, { es: '¡Maestro!', en: 'Teacher!' }, { actor: A.magdalena });
  await d(QUIEN.jesus, { es: 'Ve y diles a mis hermanos que estoy vivo.', en: 'Go and tell my brothers that I am alive.' }, { actor: A.jesus, gesto: 'standing-greeting' });
  await d(QUIEN.narrador, { es: '¡Jesús venció a la muerte! Y vive para siempre.', en: 'Jesus defeated death! And he lives forever.' });
};
})();
