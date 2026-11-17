/* La segunda venida de Jesús (Jn 14:1-3, Hch 1:9-11, Mt 24:30-31.36, 1 Ts 4:16-17, Ap 1:7). Joseth, 17 nov 2026:
   encargos/historias-3d.md de myvc_biblioteca, historia 6 (van en orden inverso; la 7 fue la cruz).
   - Sin juego de puntos (decisión del 9 nov): el reto es la espera, de la promesa a «juntos en las nubes».
   - Momentos ENTRE las preguntas (H.momentos): las palabras de los ángeles en la ascensión, la espera (nadie sabe el
     día ni la hora), la nube pequeña que se acerca y todo ojo lo ve, la trompeta de Dios, los que dormían resucitan
     primero, el abrazo con el abuelo y los vivos que suben, y los ángeles que reúnen a los suyos. El final: con Jesús.
   - La nube, el pueblo, el cementerio y la luz se hacen aquí con código. Jesús en gloria y los ángeles con trompeta
     viajan dentro de la nube (son hijos de su grupo) y crecen con ella.
   - Las palabras parafrasean la Biblia (no se cita la RV1960).
   - Sin Mixamo, la gente respira y se balancea; flotar y subir lo hace el código. */
(function () {
'use strict';
const H = {};
(window.HISTORIAS = window.HISTORIAS || {}).venida = H;

H.titulo = { es: 'Jesús vuelve', en: 'Jesus Is Coming Back' };
H.frase = { es: 'Jesús prometió volver. Vendrá en las nubes, todos lo verán, y los que lo esperan se irán con él.',
  en: 'Jesus promised to come back. He will come in the clouds, everyone will see him, and those who wait for him will go with him.' };
H.como = { es: 'Contesta las preguntas. Entre una y otra, la historia sigue: de la promesa al día en que Jesús vuelve.',
  en: 'Answer the questions. Between them, the story goes on: from the promise to the day Jesus comes back.' };
H.reto = { es: '¡Jesús viene!', en: 'Jesus is coming!' };
H.enOrden = true;
H.modelos = ['jesus-gloria', 'angel-trompeta', 'nina', 'nino-sol', 'pueblo-mujer', 'pueblo-hombre', 'jacob'];
H.voces = { narrador: 'narrador', jesus: 'jesus', angel: 'angel', nina: 'nina', mama: 'mujer', abuelo: 'anciano' };

const PASOS = {
  es: ['', 'La promesa', 'Lo que dijeron los ángeles', 'Esperando', 'Una nube en el oriente', 'La trompeta de Dios',
    'Los que dormían despiertan', '¡Juntos en las nubes!'],
  en: ['', 'The promise', 'What the angels said', 'Waiting', 'A cloud in the east', 'The trumpet of God',
    'Those who slept wake up', 'Together in the clouds!']
};
let IDI = 'es';
H.valorReto = f => {
  const L = PASOS[IDI] || PASOS.es;
  return f > 0 ? L[Math.min(L.length - 1, Math.round(f * (L.length - 1)))] : '';
};
/* del gris de la espera al oro de la gloria */
H.colorPaso = f => {
  const a = [120, 132, 150], b = [255, 205, 90], u = Math.min(1, Math.max(0, f));
  return 'rgb(' + a.map((v, i) => Math.round(v + (b[i] - v) * u)).join(' ') + ')';
};

/* la pregunta k es sobre lo que se acaba de ver (el inicio, o el momento k−1) */
H.preguntas = {
  es: [
    { p: '¿Qué les prometió Jesús a sus discípulos antes de volver al cielo?', opciones: ['Que vendría otra vez por ellos', 'Que no volvería nunca', 'Que mandaría a otro rey'], correcta: 0 },
    { p: '¿Cómo dijeron los ángeles que volvería Jesús?', opciones: ['De la misma manera que se fue: en las nubes', 'En secreto, sin que nadie lo vea', 'Naciendo otra vez como un bebé'], correcta: 0 },
    { p: '¿Quién sabe el día y la hora en que vendrá Jesús?', opciones: ['Sólo el Padre que está en el cielo', 'Los científicos', 'Los reyes de la tierra'], correcta: 0 },
    { p: '¿Quiénes verán a Jesús cuando venga en las nubes?', opciones: ['Todos: todo ojo lo verá', 'Sólo unos pocos, a escondidas', 'Nadie podrá verlo'], correcta: 0 },
    { p: '¿Qué se oirá cuando Jesús baje del cielo?', opciones: ['Una voz de mando y la trompeta de Dios', 'Nada: será en silencio', 'Sólo el viento'], correcta: 0 },
    { p: '¿Qué pasará con los que murieron confiando en Jesús?', opciones: ['Resucitarán primero', 'Seguirán dormidos para siempre', 'Se volverán ángeles'], correcta: 0 },
    { p: '¿Qué pasará con los que estén vivos y esperen a Jesús?', opciones: ['Subirán con los resucitados a recibirlo en las nubes', 'Se quedarán solos en la tierra', 'Tendrán que esconderse'], correcta: 0 }
  ],
  en: [
    { p: 'What did Jesus promise his disciples before he went back to heaven?', opciones: ['That he would come again for them', 'That he would never come back', 'That he would send another king'], correcta: 0 },
    { p: 'How did the angels say Jesus would come back?', opciones: ['The same way he left: in the clouds', 'In secret, so that no one sees him', 'Being born again as a baby'], correcta: 0 },
    { p: 'Who knows the day and the hour when Jesus will come?', opciones: ['Only the Father in heaven', 'Scientists', 'The kings of the earth'], correcta: 0 },
    { p: 'Who will see Jesus when he comes in the clouds?', opciones: ['Everyone: every eye will see him', 'Only a few people, in secret', 'No one will be able to see him'], correcta: 0 },
    { p: 'What will be heard when Jesus comes down from heaven?', opciones: ['A loud command and the trumpet of God', 'Nothing: it will be silent', 'Only the wind'], correcta: 0 },
    { p: 'What will happen to those who died trusting in Jesus?', opciones: ['They will rise first', 'They will sleep forever', 'They will become angels'], correcta: 0 },
    { p: 'What will happen to those who are alive and waiting for Jesus?', opciones: ['They will rise with the others to meet him in the clouds', 'They will stay alone on the earth', 'They will have to hide'], correcta: 0 }
  ]
};

const QUIEN = {
  narrador: { es: '', en: '', voz: 'narrador' },
  jesus: { es: 'Jesús', en: 'Jesus', voz: 'jesus' },
  angel: { es: 'Los ángeles', en: 'The angels', voz: 'angel' },
  nina: { es: 'Sofía', en: 'Sofia', voz: 'nina' },
  mama: { es: 'Su mamá', en: 'Her mother', voz: 'mujer' },
  abuelo: { es: 'El abuelo', en: 'Grandpa', voz: 'anciano' }
};

/* ---------- el lugar: el pueblo al fondo, la familia delante y el cementerio a la derecha ---------- */
const NUBE = { lejos: [46, 26, -95], cerca: [0, 11.5, -16], escLejos: 0.12 };
const TUMBAS = [[8.2, -3.2], [10.2, -3.2], [12.2, -3.2]];
const L = { nina: [-1.2, 0.6], nino: [-0.1, 0.1], mama: [-2.2, 0.1], papa: [-3.2, -0.6] };
let A = {}, C = {}, inicial = [], ANGELES = [];

const CIELOS = {
  dia: { cielo: 0xbfd3e6, luz: 1.35, hemi: 0.8, sol: 0xfff1d6 },
  gris: { cielo: 0x7d8796, luz: 0.55, hemi: 0.45, sol: 0xc8d0dc },
  gloria: { cielo: 0xf0c473, luz: 1.15, hemi: 0.65, sol: 0xffe6b8 },
  alto: { cielo: 0xf3d08c, luz: 1.1, hemi: 0.7, sol: 0xfff0d0 }
};
function cielo(ctx, nombre, s) {
  const T = ctx.THREE, a = { c: C.fondo.clone(), l: C.sol.intensity, h: C.hemi.intensity, s: C.sol.color.clone() }, b = CIELOS[nombre];
  const cb = new T.Color(b.cielo), sb = new T.Color(b.sol);
  return ctx.tween(s || 2, u => {
    C.fondo.copy(a.c).lerp(cb, u); ctx.escena.background.copy(C.fondo); ctx.escena.fog.color.copy(C.fondo);
    C.sol.intensity = a.l + (b.luz - a.l) * u; C.hemi.intensity = a.h + (b.hemi - a.h) * u; C.sol.color.copy(a.s).lerp(sb, u);
  });
}

/* la nube: bolas blandas que empiezan grises y pequeñas, lejos en el oriente, y llegan blancas y brillantes */
function crearNube(ctx) {
  const T = ctx.THREE, g = new T.Group();
  C.nubeMat = new T.MeshStandardMaterial({ color: 0x4c525e, roughness: 1, emissive: 0xfff2cc, emissiveIntensity: 0 });
  const bolas = [[0, 0, 0, 3.4], [3.6, -0.4, 0.6, 2.6], [-3.6, -0.3, 0.4, 2.7], [6.6, -0.9, 0, 1.9], [-6.6, -0.8, 0.2, 2],
    [1.8, 0.4, -2.2, 2.4], [-1.9, 0.3, -2.1, 2.4], [0, -0.8, 2.4, 2.2], [4.6, -0.6, -2, 1.8], [-4.6, -0.7, -1.8, 1.8]];
  bolas.forEach(([x, y, z, r]) => { const m = new T.Mesh(new T.SphereGeometry(r, 20, 14), C.nubeMat); m.scale.y = 0.62; m.position.set(x, y, z); g.add(m); });
  C.luzNube = new T.PointLight(0xfff0c8, 0, 60, 1.6); C.luzNube.position.set(0, -2, 4); g.add(C.luzNube);
  g.position.set(...NUBE.lejos); g.scale.setScalar(NUBE.escLejos);
  ctx.escena.add(g);
  return g;
}
function acercarNube(ctx, s) {
  const p0 = C.nube.position.clone(), p1 = new ctx.THREE.Vector3(...NUBE.cerca), e0 = C.nube.scale.x;
  return ctx.tween(s, u => { C.nube.position.lerpVectors(p0, p1, u); C.nube.scale.setScalar(e0 + (1 - e0) * u); });
}
function brillarNube(ctx, s) {
  const T = ctx.THREE, c0 = C.nubeMat.color.clone(), c1 = new T.Color(0xffffff);
  return ctx.tween(s, u => { C.nubeMat.color.copy(c0).lerp(c1, u); C.nubeMat.emissiveIntensity = 0.55 * u; C.luzNube.intensity = 1.1 * u; });
}

/* el pueblo: casas sencillas al fondo; el cementerio con su cerca y tres tumbas */
function crearPueblo(ctx) {
  const T = ctx.THREE, E = ctx.escena;
  const pared = [0xe9dcc3, 0xd9c7a6, 0xf0e6d2, 0xcfd9c8], techo = new T.MeshStandardMaterial({ color: 0xa4553a, roughness: 0.9 });
  [[-14, -18], [-8, -21], [-2, -22], [5, -21], [-19, -12], [17, -20], [22, -13]].forEach(([x, z], i) => {
    const c = new T.Mesh(new T.BoxGeometry(4.2, 3, 3.6), new T.MeshStandardMaterial({ color: pared[i % 4], roughness: 1 }));
    c.position.set(x, 1.5, z); c.castShadow = c.receiveShadow = true; E.add(c);
    const t = new T.Mesh(new T.ConeGeometry(3.3, 1.6, 4), techo); t.rotation.y = Math.PI / 4; t.position.set(x, 3.8, z); t.castShadow = true; E.add(t);
  });
  const hoja = new T.MeshStandardMaterial({ color: 0x5f8f4a, roughness: 1 }), tronco = new T.MeshStandardMaterial({ color: 0x5b4632, roughness: 1 });
  [[-7, -8], [3.5, -9], [15, -8], [-12, -4], [-9, 3]].forEach(([x, z]) => {
    const t = new T.Mesh(new T.CylinderGeometry(0.14, 0.22, 1.8, 8), tronco); t.position.set(x, 0.9, z); t.castShadow = true; E.add(t);
    const c = new T.Mesh(new T.SphereGeometry(1.25, 14, 10), hoja); c.position.set(x, 2.4, z); c.castShadow = true; E.add(c);
  });
  // el cementerio: la cerca baja y una tumba (un montículo y su lápida) por cada uno que espera la resurrección
  const cerca = new T.MeshStandardMaterial({ color: 0xf2f0ea, roughness: 0.9 });
  [[10.2, -0.9, 7.4, 0], [10.2, -5.6, 7.4, 0], [6.5, -3.25, 4.7, 1], [13.9, -3.25, 4.7, 1]].forEach(([x, z, l, giro]) => {
    const b = new T.Mesh(new T.BoxGeometry(l, 0.5, 0.08), cerca); b.position.set(x, 0.25, z); b.rotation.y = giro * Math.PI / 2; E.add(b);
  });
  const tierra = new T.MeshStandardMaterial({ color: 0x7c8f55, roughness: 1 }), piedra = new T.MeshStandardMaterial({ color: 0xb8b4ab, roughness: 0.95 });
  C.tumbas = TUMBAS.map(([x, z]) => {
    const m = new T.Mesh(new T.BoxGeometry(0.95, 0.22, 1.9), tierra); m.position.set(x, 0.11, z); m.receiveShadow = true; E.add(m);
    const lap = new T.Group(); lap.position.set(x, 0, z - 1.05);
    const l = new T.Mesh(new T.BoxGeometry(0.75, 0.9, 0.14), piedra); l.position.y = 0.45; l.castShadow = true; lap.add(l);
    E.add(lap);
    return { m, lap };
  });
}

/* sube a un actor del suelo (o lo deja flotar), con un vaivén suave mientras está en el aire */
function flotar(ctx, a, y, s) {
  const y0 = a.g.position.y;
  return ctx.tween(s, u => { a.g.position.y = y0 + (y - y0) * u; });
}
function brillo(ctx, a, color, k) {
  const T = ctx.THREE;
  a.obj.traverse(m => {
    if (!m.isMesh) return;
    if (!m.userData.mat0) m.userData.mat0 = m.material;
    m.material = m.userData.mat0.clone(); m.material.emissive = new T.Color(color); m.material.emissiveIntensity = k;
  });
  a.brilla = true;
}
function sinBrillo(a) {
  a.obj.traverse(m => { if (m.isMesh && m.userData.mat0) m.material = m.userData.mat0; });
  a.brilla = false;
}
function mirarArriba(ctx, gente) { gente.forEach(a => ctx.mirarA(a, C.nube.position.x, C.nube.position.z)); }

H.montar = async function (ctx) {
  const T = ctx.THREE, E = ctx.escena;
  IDI = ctx.idioma === 'en' ? 'en' : 'es';
  C.fondo = new T.Color(CIELOS.dia.cielo);
  E.background = C.fondo.clone();
  E.fog = new T.Fog(C.fondo.clone(), 45, 170);
  C.hemi = new T.HemisphereLight(0xfff1d6, 0x5a6a40, CIELOS.dia.hemi); E.add(C.hemi);
  C.sol = new T.DirectionalLight(CIELOS.dia.sol, CIELOS.dia.luz);
  C.sol.position.set(-14, 26, 16); C.sol.castShadow = true; C.sol.shadow.mapSize.set(2048, 2048);
  Object.assign(C.sol.shadow.camera, { left: -26, right: 26, top: 26, bottom: -26, near: 1, far: 90 });
  E.add(C.sol);
  const suelo = new T.Mesh(new T.PlaneGeometry(320, 320), new T.MeshStandardMaterial({ color: 0x8fae68, roughness: 1 }));
  suelo.rotation.x = -Math.PI / 2; suelo.receiveShadow = true; E.add(suelo);
  const camino = new T.Mesh(new T.PlaneGeometry(3, 40), new T.MeshStandardMaterial({ color: 0xc8b48c, roughness: 1 }));
  camino.rotation.x = -Math.PI / 2; camino.position.set(-1.5, 0.01, -8); camino.receiveShadow = true; E.add(camino);
  crearPueblo(ctx);
  C.nube = crearNube(ctx);
  // Jesús en gloria y los ángeles van dentro de la nube: llegan y crecen con ella
  A.jesus = await ctx.actor('jesus-gloria', { altura: 3.4, color: 0xffffff });
  brillo(ctx, A.jesus, 0xfff1c8, 0.2);
  C.nube.add(A.jesus.g); A.jesus.g.position.set(0, 1.7, 3.1);
  A.luzJesus = new T.PointLight(0xfff6e0, 0, 16, 1.5); A.luzJesus.position.set(0, 2.4, 2.5); A.jesus.g.add(A.luzJesus);
  ANGELES = [];
  for (let i = 0; i < 8; i++) {
    const ang = (i + 0.5) / 8 * Math.PI * 2, r = 7.6 + (i % 2) * 1.3;
    const a = await ctx.actor('angel-trompeta', { altura: 2.4, color: 0xffffff,
      material: m => { const n = m.clone(); n.emissive = new T.Color(0xffe9b0); n.emissiveIntensity = 0.2; return n; } });
    C.nube.add(a.g);
    a.g.position.set(Math.sin(ang) * r, 0.6 + (i % 3) * 1.1, Math.cos(ang) * r * 0.55);
    a.g.rotation.y = ang;
    a.fase = i * 0.8;
    ANGELES.push(a);
  }
  // los ángeles flotan (sin rig: suben y bajan un poco)
  ctx.cadaCuadro((dt, t) => { ANGELES.forEach(a => { a.obj.position.y = a.base + Math.sin((t || 0) * 1.6 + a.fase) * 0.12; }); });
  // la familia que espera y los que duermen en el cementerio
  A.nina = await ctx.actor('nina', { x: L.nina[0], z: L.nina[1], altura: 1.15, color: 0xd9577a });
  A.nino = await ctx.actor('nino-sol', { x: L.nino[0], z: L.nino[1], altura: 1.25, color: 0x3a78c2 });
  A.mama = await ctx.actor('pueblo-mujer', { x: L.mama[0], z: L.mama[1], altura: 1.65, color: 0x9b2c4a });
  A.papa = await ctx.actor('pueblo-hombre', { x: L.papa[0], z: L.papa[1], altura: 1.75, color: 0x6b4a2b });
  A.abuelo = await ctx.actor('jacob', { x: TUMBAS[0][0], z: TUMBAS[0][1], altura: 1.66, color: 0x7a5a3a });
  A.abuela = await ctx.actor('pueblo-mujer', { x: TUMBAS[1][0], z: TUMBAS[1][1], altura: 1.6, color: 0x5a6a8a });
  A.vecino = await ctx.actor('pueblo-hombre', { x: TUMBAS[2][0], z: TUMBAS[2][1], altura: 1.72, color: 0x4a6a4a });
  colocar(ctx);
  inicial = [A.nina, A.nino, A.mama, A.papa, A.abuelo, A.abuela, A.vecino].map(a => ({ a, x: a.g.position.x, z: a.g.position.z, r: a.g.rotation.y }));
  ctx.camara.position.set(1.5, 3, 10); ctx.mira.set(-1, 1.6, -4);
};

/* cómo empieza: un día cualquiera; la nube, lejos y pequeña, todavía no se ve; los que duermen, bajo la tierra */
function colocar(ctx) {
  C.nube.visible = false; C.nube.position.set(...NUBE.lejos); C.nube.scale.setScalar(NUBE.escLejos);
  C.nubeMat.color.set(0x4c525e); C.nubeMat.emissiveIntensity = 0; C.luzNube.intensity = 0;
  A.jesus.g.visible = false; A.luzJesus.intensity = 0;
  ANGELES.forEach(a => { a.g.visible = false; a.g.rotation.x = 0; });
  [A.nina, A.nino, A.mama, A.papa, A.abuelo, A.abuela, A.vecino].forEach(sinBrillo);
  [A.nina, A.nino, A.mama, A.papa].forEach(a => { a.g.position.y = 0; a.g.visible = true; ctx.mirarA(a, 0, 8); });
  [A.abuelo, A.abuela, A.vecino].forEach((a, i) => { a.g.position.set(TUMBAS[i][0], -2.2, TUMBAS[i][1]); a.g.rotation.y = 0; a.g.visible = false; });
  C.tumbas.forEach(t => { t.lap.rotation.x = 0; t.m.scale.y = 1; t.m.material.emissive && t.m.material.emissive.set(0); });
}

H.reiniciar = async function (ctx) {
  inicial.forEach(i => { i.a.g.position.set(i.x, 0, i.z); i.a.g.rotation.y = i.r; i.a.reposo = null; ctx.anim(i.a, 'idle'); });
  colocar(ctx);
  await cielo(ctx, 'dia', 0.01);
  ctx.camara.position.set(1.5, 3, 10); ctx.mira.set(-1, 1.6, -4);
};

H.inicio = async function (ctx) {
  const d = ctx.decir;
  await ctx.camaraA([0.5, 2.2, 6], [-1.5, 1.3, -1], 2);
  await d(QUIEN.narrador, { es: 'La noche antes de morir, Jesús les dijo a sus discípulos que no se preocuparan, y les hizo una promesa.',
    en: 'The night before he died, Jesus told his disciples not to be worried, and he made them a promise.' });
  await d(QUIEN.jesus, { es: 'En la casa de mi Padre hay muchas moradas. Voy a prepararles un lugar, y vendré otra vez para llevarlos conmigo.',
    en: 'In my Father\'s house there are many rooms. I am going to prepare a place for you, and I will come again to take you with me.' });
};

H.avanzar = async function (ctx) { await ctx.esperar(0.4); };

H.momentos = [
  async function angeles(ctx) {
    await ctx.camaraA([1.2, 1.3, 6.5], [-1.5, 4.5, -8], 1.8);
    mirarArriba(ctx, [A.mama, A.papa]);
    await ctx.decir(QUIEN.narrador, { es: 'Cuarenta días después de resucitar, Jesús subió al cielo y una nube lo ocultó. Dos ángeles les dijeron a los discípulos:',
      en: 'Forty days after he rose again, Jesus went up to heaven and a cloud hid him. Two angels told the disciples:' });
    await ctx.decir(QUIEN.angel, { es: '¿Por qué se quedan mirando al cielo? Este mismo Jesús volverá de la misma manera que lo han visto irse.',
      en: 'Why do you stand looking up at the sky? This same Jesus will come back in the same way you have seen him go.' });
  },
  async function espera(ctx) {
    await ctx.camaraA([-0.6, 1.5, 4.2], [-1.4, 1.1, 0.2], 1.6);
    ctx.mirarA(A.nina, L.mama[0], L.mama[1]); ctx.mirarA(A.mama, L.nina[0], L.nina[1]);
    await ctx.decir(QUIEN.nina, { es: 'Mamá, ¿cuándo va a volver Jesús?', en: 'Mom, when is Jesus coming back?' }, { actor: A.nina });
    await ctx.decir(QUIEN.mama, { es: 'Nadie sabe el día ni la hora, Sofía, sólo el Padre. Pero él lo prometió, y siempre cumple. Por eso estamos listos.',
      en: 'No one knows the day or the hour, Sofia, only the Father. But he promised, and he always keeps his word. That is why we are ready.' }, { actor: A.mama });
  },
  async function nube(ctx) {
    C.nube.visible = true;
    await Promise.all([cielo(ctx, 'gris', 2.2), ctx.camaraA([2, 1.4, 7], [8, 9, -30], 2)]);
    await ctx.decir(QUIEN.narrador, { es: 'Un día, en el oriente, aparece una nube pequeña. Se acerca, crece y brilla cada vez más.',
      en: 'One day, in the east, a small cloud appears. It comes closer, grows bigger and shines brighter and brighter.' });
    mirarArriba(ctx, [A.nina, A.nino, A.mama, A.papa]);
    A.jesus.g.visible = true; ANGELES.forEach(a => { a.g.visible = true; });
    ctx.sonido('angel');
    await Promise.all([acercarNube(ctx, 5), brillarNube(ctx, 5), ctx.camaraA([1, 1.2, 8], [0, 9, -14], 5),
      ctx.tween(5, u => { A.luzJesus.intensity = 1.6 * u; })]);
    cielo(ctx, 'gloria', 2.5);
    await ctx.decir(QUIEN.narrador, { es: '¡Es Jesús, con poder y mucha gloria, y todos sus ángeles con él! Todo ojo lo verá.',
      en: 'It is Jesus, with power and great glory, and all his angels with him! Every eye will see him.' });
  },
  async function trompeta(ctx) {
    await ctx.camaraA([3, 6, 4], [0, 11, -15], 1.8);
    ctx.sonido('musica');
    await Promise.all(ANGELES.map(a => ctx.tween(1, u => { a.g.rotation.x = -0.25 * u; })));
    await ctx.decir(QUIEN.narrador, { es: 'El Señor mismo baja del cielo con voz de mando, con voz de arcángel y con la trompeta de Dios. ¡Toda la tierra la oye!',
      en: 'The Lord himself comes down from heaven with a loud command, with the voice of an archangel and with the trumpet of God. The whole earth hears it!' });
  },
  async function resurreccion(ctx) {
    await ctx.camaraA([10.2, 2.4, 4.5], [10.2, 0.8, -3.6], 1.8);
    await ctx.decir(QUIEN.narrador, { es: 'Y los que murieron confiando en Jesús resucitan primero.',
      en: 'And those who died trusting in Jesus rise first.' });
    ctx.sonido('angel');
    // las lápidas caen, las tumbas se abren y ellos se levantan, nuevos y sanos
    await ctx.tween(1, u => { C.tumbas.forEach(t => { t.lap.rotation.x = -1.4 * u; t.m.scale.y = 1 - 0.85 * u; }); });
    const salen = [A.abuelo, A.abuela, A.vecino];
    salen.forEach(a => { a.g.visible = true; brillo(ctx, a, 0xfff1c8, 0.15); ctx.mirarA(a, 0, 8); });
    await Promise.all(salen.map((a, i) => ctx.esperar(i * 0.35).then(() => flotar(ctx, a, 0, 1.8))));
    await ctx.decir(QUIEN.abuelo, { es: '¡Desperté! Ya no me duele nada. ¡Jesús vino, como lo prometió!',
      en: 'I woke up! Nothing hurts anymore. Jesus came, just as he promised!' }, { actor: A.abuelo });
  },
  async function abrazo(ctx) {
    await ctx.camaraA([4.5, 1.8, 4.5], [5, 1, -2], 1.6);
    ctx.mirarA(A.nina, TUMBAS[0][0], TUMBAS[0][1]);
    await ctx.decir(QUIEN.nina, { es: '¡Abuelo! ¡Abuelo!', en: 'Grandpa! Grandpa!' }, { actor: A.nina });
    const m = ctx.mover(A.nina, TUMBAS[0][0] - 1.6, TUMBAS[0][1] + 0.9, 2.2);
    ctx.mover(A.mama, TUMBAS[0][0] - 2.4, TUMBAS[0][1] + 1.6, 2.6);
    ctx.mover(A.papa, TUMBAS[0][0] - 3, TUMBAS[0][1] + 0.6, 2.8);
    ctx.mover(A.nino, TUMBAS[0][0] - 1.2, TUMBAS[0][1] + 1.9, 2.4);
    ctx.mover(A.abuelo, TUMBAS[0][0] - 0.7, TUMBAS[0][1] + 0.6, 2);
    await m;
    ctx.mirarA(A.nina, A.abuelo.g.position.x, A.abuelo.g.position.z); ctx.mirarA(A.abuelo, A.nina.g.position.x, A.nina.g.position.z);
    await ctx.esperar(0.6);
    // los vivos que esperaban suben con ellos a recibir al Señor (1 Ts 4:17)
    const todos = [A.nina, A.nino, A.mama, A.papa, A.abuelo, A.abuela, A.vecino];
    todos.forEach(a => { if (!a.brilla) brillo(ctx, a, 0xfff1c8, 0.12); });
    await Promise.all([ctx.camaraA([4.5, 3.5, 9], [6, 3.5, -2], 3.5),
      ...todos.map((a, i) => ctx.esperar(i * 0.15).then(() => flotar(ctx, a, 3, 3.2)))]);
    await ctx.decir(QUIEN.narrador, { es: 'Después, los que están vivos y lo esperan suben con ellos en las nubes, para recibir al Señor en el aire.',
      en: 'Then those who are alive and waiting for him are taken up with them in the clouds, to meet the Lord in the air.' });
  },
  async function reunidos(ctx) {
    const todos = [A.nina, A.nino, A.mama, A.papa, A.abuelo, A.abuela, A.vecino];
    await Promise.all([ctx.camaraA([2, 8, 6], [0, 9, -12], 3),
      ...todos.map(a => flotar(ctx, a, 7.5, 3.4))]);
    await ctx.decir(QUIEN.narrador, { es: 'Los ángeles reúnen a todos los que aman a Dios, desde un extremo del cielo hasta el otro.',
      en: 'The angels gather all who love God, from one end of the sky to the other.' });
  }
];

H.final = async function (ctx) {
  const d = ctx.decir, todos = [A.nina, A.nino, A.mama, A.papa, A.abuelo, A.abuela, A.vecino];
  await cielo(ctx, 'alto', 2);
  // todos delante de Jesús, frente a la nube
  const delante = [[-3.2, 8.2], [-2, 9.3], [-0.8, 8.4], [0.6, 9.4], [1.8, 8.5], [3.1, 9.2], [4.2, 8.3]];
  await Promise.all(todos.map((a, i) => ctx.tween(2.6, u => {
    const p = a.g.position, x = delante[i][0], z = NUBE.cerca[2] + 7.5 + (i % 2) * 0.8;
    p.x += (x - p.x) * u; p.z += (z - p.z) * u; p.y += (delante[i][1] - p.y) * u;
  })));
  todos.forEach(a => ctx.mirarA(a, 0, NUBE.cerca[2]));
  ctx.sonido('angel');
  await ctx.camaraA([0, 10.5, 2], [0, 12, -15], 2.2);
  await d(QUIEN.jesus, { es: 'Vengan, benditos de mi Padre. Les preparé un lugar, y aquí estoy, como se los prometí.',
    en: 'Come, you who are blessed by my Father. I prepared a place for you, and here I am, just as I promised.' }, { actor: A.jesus });
  await d(QUIEN.nina, { es: '¡Abuelo, mira! ¡Es Jesús!', en: 'Grandpa, look! It is Jesus!' }, { actor: A.nina });
  await d(QUIEN.narrador, { es: 'Ya no habrá más llanto, ni dolor, ni muerte. Y así estaremos siempre con el Señor.',
    en: 'There will be no more crying, no more pain, no more death. And so we will be with the Lord forever.' });
  await ctx.camaraA([0, 13, 14], [0, 11, -15], 3);
  await d(QUIEN.narrador, { es: 'Jesús viene pronto. ¡Y te está esperando a ti también!', en: 'Jesus is coming soon. And he is waiting for you too!' });
};
})();
