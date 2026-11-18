/* José en Egipto (Gn 39–46). Joseth, 17 nov 2026: encargos/historias-3d.md de myvc_biblioteca, historia 4 (van en orden
   inverso: cruz, segunda venida, ascensión, ésta).
   - Reto «Los graneros de Faraón» (Gn 41:34-36): cada acierto llena uno de los siete graneros con la quinta parte de
     la cosecha. Siete aciertos, siete años de abundancia.
   - Momentos ENTRE las preguntas (H.momentos): el sueño de Faraón (las vacas gordas y flacas salen del Nilo), José
     explica el sueño, Faraón lo pone sobre Egipto, los años de abundancia, el hambre y los hermanos que se inclinan,
     «Yo soy José», y Jacob llega en los carros de Egipto.
   - El Nilo, las pirámides, el palacio y los graneros se hacen aquí con código. Los hermanos son los discípulos y la
     gente común (decisión del 9 nov); sólo Sadrac y el hombre del pueblo tienen rig para arrodillarse.
   - Las palabras parafrasean la Biblia (no se cita la RV1960). */
(function () {
'use strict';
const H = {};
(window.HISTORIAS = window.HISTORIAS || {}).jose = H;

H.titulo = { es: 'José en Egipto', en: 'Joseph in Egypt' };
H.frase = { es: 'José fue vendido como esclavo, pero Dios estaba con él y lo usó para salvar a muchos del hambre.',
  en: 'Joseph was sold as a slave, but God was with him and used him to save many people from hunger.' };
H.como = { es: 'Contesta las preguntas. Cada acierto llena un granero de Faraón, y la historia sigue.',
  en: 'Answer the questions. Each right answer fills one of Pharaoh’s storehouses, and the story goes on.' };
H.reto = { es: 'Los graneros de Faraón', en: 'Pharaoh’s storehouses' };
H.enOrden = true;
H.modelos = ['jose-egipto', 'jose-gobernador', 'faraon', 'jacob', 'pueblo-hombre', 'pueblo-mujer', 'discipulo-1', 'discipulo-2',
  'sadrac', 'mesac', 'abednego', 'vaca', 'carro-egipcio', 'caballo'];
H.voces = { narrador: 'narrador', jose: 'joven', faraon: 'rey', copero: 'hombre', jacob: 'anciano', hermanos: 'hombre' };

const GRANEROS = 7;
let IDI = 'es';
H.valorReto = f => {
  const n = Math.round(f * GRANEROS);
  if (f <= 0) return '';
  return IDI === 'en' ? n + ' of ' + GRANEROS + ' storehouses full' : n + ' de ' + GRANEROS + ' graneros llenos';
};
/* del verde del Nilo al dorado del trigo */
H.colorPaso = f => {
  const a = [96, 150, 96], b = [222, 172, 52], u = Math.min(1, Math.max(0, f));
  return 'rgb(' + a.map((v, i) => Math.round(v + (b[i] - v) * u)).join(' ') + ')';
};

/* la pregunta k es sobre lo que se acaba de ver (el inicio, o el momento k−1) */
H.preguntas = {
  es: [
    { p: '¿Cómo llegó José a Egipto?', opciones: ['Sus hermanos lo vendieron como esclavo', 'Fue de paseo con su papá', 'Faraón lo invitó a su palacio'], correcta: 0 },
    { p: '¿Qué soñó Faraón?', opciones: ['Siete vacas gordas y siete vacas flacas', 'Una escalera hasta el cielo', 'Un río de oro'], correcta: 0 },
    { p: '¿Quién le dio a José la explicación del sueño?', opciones: ['Dios', 'Los magos de Egipto', 'El copero'], correcta: 0 },
    { p: '¿Qué hizo Faraón con José?', opciones: ['Lo puso a gobernar todo Egipto', 'Lo devolvió a la cárcel', 'Lo mandó de vuelta a su casa'], correcta: 0 },
    { p: '¿Qué parte de la cosecha guardaban en los años de abundancia?', opciones: ['La quinta parte', 'Nada', 'La mitad de una vaca'], correcta: 0 },
    { p: '¿Para qué fueron a Egipto los hermanos de José?', opciones: ['Para comprar comida', 'Para buscar a José', 'Para ver las pirámides'], correcta: 0 },
    { p: '¿Qué hizo José con sus hermanos?', opciones: ['Los perdonó', 'Los metió en la cárcel', 'Los vendió como esclavos'], correcta: 0 }
  ],
  en: [
    { p: 'How did Joseph get to Egypt?', opciones: ['His brothers sold him as a slave', 'He went on a trip with his father', 'Pharaoh invited him to his palace'], correcta: 0 },
    { p: 'What did Pharaoh dream?', opciones: ['Seven fat cows and seven thin cows', 'A stairway up to heaven', 'A river of gold'], correcta: 0 },
    { p: 'Who gave Joseph the meaning of the dream?', opciones: ['God', 'The wise men of Egypt', 'The cupbearer'], correcta: 0 },
    { p: 'What did Pharaoh do with Joseph?', opciones: ['He put him in charge of all Egypt', 'He sent him back to prison', 'He sent him back home'], correcta: 0 },
    { p: 'What part of the harvest did they store in the good years?', opciones: ['One fifth', 'Nothing', 'Half a cow'], correcta: 0 },
    { p: 'Why did Joseph’s brothers go to Egypt?', opciones: ['To buy food', 'To look for Joseph', 'To see the pyramids'], correcta: 0 },
    { p: 'What did Joseph do with his brothers?', opciones: ['He forgave them', 'He put them in prison', 'He sold them as slaves'], correcta: 0 }
  ]
};

const QUIEN = {
  narrador: { es: '', en: '', voz: 'narrador' },
  jose: { es: 'José', en: 'Joseph', voz: 'joven' },
  faraon: { es: 'Faraón', en: 'Pharaoh', voz: 'rey' },
  copero: { es: 'El copero', en: 'The cupbearer', voz: 'hombre' },
  jacob: { es: 'Jacob', en: 'Jacob', voz: 'anciano' },
  hermanos: { es: 'Los hermanos', en: 'The brothers', voz: 'hombre' }
};

/* ---------- el lugar: el palacio de Faraón a orillas del Nilo ---------- */
const TRONO = [0, -5];
const ANTE = [0, -1.4];          // donde José está ante Faraón
const NILO = { z: -19, ancho: 7 };
const GRAN = { x: 9.5, z0: -6.5, paso: 2.4 };
const JG = [5.6, -0.6];          // José gobernador, junto a los graneros
/* los hermanos, relativos a José: dos filas delante de él */
const HERM = [['h1', 'discipulo-1', -2.1, 3.0], ['h2', 'discipulo-2', -0.7, 3.4], ['h3', 'sadrac', 0.7, 3.4], ['h4', 'pueblo-hombre', 2.1, 3.0],
  ['h5', 'mesac', -1.4, 4.6], ['h6', 'abednego', 1.4, 4.6]];
let A = {}, C = {}, inicial = [], HERMANOS = [], GORDAS = [], FLACAS = [];

const CIELOS = {
  dia: { cielo: 0x9fc4e4, luz: 1.05, hemi: 0.55, sol: 0xfff0d2 },
  sueno: { cielo: 0x3b3a6e, luz: 0.55, hemi: 0.45, sol: 0xb8b4ff },
  seco: { cielo: 0xd9b57c, luz: 1.0, hemi: 0.5, sol: 0xffd9a0 },
  tarde: { cielo: 0xeab27a, luz: 0.9, hemi: 0.5, sol: 0xffcf96 }
};
function cielo(ctx, nombre, s) {
  const T = ctx.THREE, a = { c: C.fondo.clone(), l: C.sol.intensity, h: C.hemi.intensity, s: C.sol.color.clone() }, b = CIELOS[nombre];
  const cb = new T.Color(b.cielo), sb = new T.Color(b.sol);
  return ctx.tween(s || 2, u => {
    C.fondo.copy(a.c).lerp(cb, u); ctx.escena.background.copy(C.fondo); ctx.escena.fog.color.copy(C.fondo);
    C.sol.intensity = a.l + (b.luz - a.l) * u; C.hemi.intensity = a.h + (b.hemi - a.h) * u; C.sol.color.copy(a.s).lerp(sb, u);
  });
}
/* los campos: verdes y dorados en la abundancia, pardos en el hambre */
function campos(ctx, secos, s) {
  const T = ctx.THREE, de = C.campos.map(m => m.color.clone());
  const a = secos ? [0x9c8358, 0xa48a5c] : [0x7fa04e, 0xd8b24a];
  return ctx.tween(s || 2, u => C.campos.forEach((m, i) => m.color.copy(de[i]).lerp(new T.Color(a[i % 2]), u)));
}
/* cada granero: un silo de adobe abierto por arriba, con su borde; el trigo sube por dentro y asoma en un montón
   dorado, y otro montón crece delante de la puerta */
function crearGraneros(ctx) {
  const T = ctx.THREE, E = ctx.escena, adobe = new T.MeshStandardMaterial({ color: 0xa97c4c, roughness: 1, side: T.DoubleSide });
  const trigo = new T.MeshStandardMaterial({ color: 0xe8b93c, roughness: 0.9, emissive: 0x3a2800, emissiveIntensity: 0.25 });
  const oscuro = new T.MeshStandardMaterial({ color: 0x5a4630, roughness: 1 });
  C.trigo = [];
  for (let i = 0; i < GRANEROS; i++) {
    const z = GRAN.z0 + i * GRAN.paso, g = new T.Group(); g.position.set(GRAN.x, 0, z);
    const pared = new T.Mesh(new T.CylinderGeometry(1, 1.08, 2.4, 24, 1, true), adobe); pared.position.y = 1.2; pared.castShadow = true; g.add(pared);
    const borde = new T.Mesh(new T.TorusGeometry(1.02, 0.09, 8, 28), adobe); borde.rotation.x = Math.PI / 2; borde.position.y = 2.4; g.add(borde);
    const puerta = new T.Mesh(new T.PlaneGeometry(0.7, 1.1), oscuro); puerta.position.set(-1.09, 0.6, 0); puerta.rotation.y = -Math.PI / 2; g.add(puerta);
    const t = new T.Mesh(new T.CylinderGeometry(0.98, 0.98, 1, 24), trigo); t.scale.y = 0.001; g.add(t);
    const cima = new T.Mesh(new T.ConeGeometry(0.98, 0.7, 24), trigo); cima.visible = false; g.add(cima);
    const monton = new T.Mesh(new T.ConeGeometry(0.7, 0.55, 18), trigo); monton.position.set(-1.7, 0.27, 0); monton.scale.setScalar(0.001); g.add(monton);
    E.add(g); C.trigo.push({ t, cima, monton, lleno: 0 });
  }
}
function llenar(ctx, n, s) {
  const pend = C.trigo.map((g, i) => ({ g, meta: i < n ? 1 : 0 })).filter(o => o.g.lleno !== o.meta);
  return Promise.all(pend.map(o => {
    const de = o.g.lleno;
    return ctx.tween(s || 1.2, u => {
      const v = de + (o.meta - de) * u; o.g.lleno = v;
      o.g.t.scale.y = Math.max(0.001, 2.3 * v); o.g.t.position.y = 1.15 * v;
      o.g.cima.visible = v > 0.02; o.g.cima.position.y = 2.3 * v + 0.35;
      o.g.monton.scale.setScalar(Math.max(0.001, v));
    });
  }));
}

H.montar = async function (ctx) {
  const T = ctx.THREE, E = ctx.escena;
  IDI = ctx.idioma === 'en' ? 'en' : 'es';
  C.fondo = new T.Color(CIELOS.dia.cielo);
  E.background = C.fondo.clone();
  E.fog = new T.Fog(C.fondo.clone(), 60, 210);
  C.hemi = new T.HemisphereLight(0xfff0d2, 0x8a7448, CIELOS.dia.hemi); E.add(C.hemi);
  C.sol = new T.DirectionalLight(CIELOS.dia.sol, CIELOS.dia.luz);
  C.sol.position.set(-14, 28, 16); C.sol.castShadow = true; C.sol.shadow.mapSize.set(2048, 2048);
  Object.assign(C.sol.shadow.camera, { left: -26, right: 26, top: 26, bottom: -26, near: 1, far: 90 });
  E.add(C.sol);
  const suelo = new T.Mesh(new T.PlaneGeometry(400, 400), new T.MeshStandardMaterial({ color: 0xc4a066, roughness: 1 }));
  suelo.rotation.x = -Math.PI / 2; suelo.receiveShadow = true; E.add(suelo);
  // el Nilo, de lado a lado detrás del palacio, con juncos y palmeras en la orilla
  const rio = new T.Mesh(new T.PlaneGeometry(400, NILO.ancho), new T.MeshStandardMaterial({ color: 0x3f7fa6, roughness: 0.35, metalness: 0.1 }));
  rio.rotation.x = -Math.PI / 2; rio.position.set(0, 0.02, NILO.z); E.add(rio);
  const orilla = new T.Mesh(new T.PlaneGeometry(400, 3), new T.MeshStandardMaterial({ color: 0x7f9a52, roughness: 1 }));
  orilla.rotation.x = -Math.PI / 2; orilla.position.set(0, 0.015, NILO.z + NILO.ancho / 2 + 1.4); E.add(orilla);
  const tronco = new T.MeshStandardMaterial({ color: 0x7a5a36, roughness: 1 }), hoja = new T.MeshStandardMaterial({ color: 0x5f8a3a, roughness: 1 });
  [[-16, -14], [-11, -15], [-22, -13.5], [14, -14.5], [19, -13.8], [24, -15], [-28, -14.6], [-14, 8], [-18, 3]].forEach(([x, z], i) => {
    const alto = 4.2 + (i % 3) * 0.7, p = new T.Group(); p.position.set(x, 0, z);
    const t = new T.Mesh(new T.CylinderGeometry(0.16, 0.26, alto, 8), tronco); t.position.y = alto / 2; t.rotation.z = 0.06 * (i % 2 ? 1 : -1); t.castShadow = true; p.add(t);
    for (let k = 0; k < 6; k++) {
      const h = new T.Mesh(new T.ConeGeometry(0.32, 2.4, 6), hoja); h.position.y = alto; h.rotation.z = Math.PI / 2.6; h.rotation.y = k * Math.PI / 3;
      h.geometry.translate(0, 1.1, 0); h.castShadow = true; p.add(h);
    }
    E.add(p);
  });
  // las pirámides, al otro lado del Nilo (ya tenían siglos cuando llegó José)
  const piedra = new T.MeshStandardMaterial({ color: 0xc9a86c, roughness: 1, flatShading: true });
  [[-38, -78, 30], [-8, -92, 38], [26, -84, 24]].forEach(([x, z, b]) => {
    const p = new T.Mesh(new T.ConeGeometry(b * 0.72, b * 0.66, 4), piedra); p.position.set(x, b * 0.33, z); p.rotation.y = Math.PI / 4; E.add(p);
  });
  // los campos, a la izquierda: verdes y dorados
  C.campos = [];
  [[-12, -3], [-12, 2.5], [-6.5, -8.5], [-17.5, -3], [-17.5, 2.5], [-12, -8.5]].forEach(([x, z], i) => {
    const m = new T.MeshStandardMaterial({ color: i % 2 ? 0xd8b24a : 0x7fa04e, roughness: 1 });
    const c = new T.Mesh(new T.BoxGeometry(5, 0.12, 5), m); c.position.set(x, 0.06, z); c.receiveShadow = true; E.add(c); C.campos.push(m);
  });
  // el palacio: una plataforma, el trono de oro y columnas pintadas
  const blanco = new T.MeshStandardMaterial({ color: 0xdccfb0, roughness: 0.85 });
  const plataforma = new T.Mesh(new T.BoxGeometry(9, 0.5, 5), blanco); plataforma.position.set(TRONO[0], 0.25, TRONO[1] - 0.6); plataforma.receiveShadow = true; E.add(plataforma);
  const escalon = new T.Mesh(new T.BoxGeometry(5, 0.25, 0.8), blanco); escalon.position.set(TRONO[0], 0.125, TRONO[1] + 2.2); E.add(escalon);
  const trono = new T.Mesh(new T.BoxGeometry(1.4, 2.2, 0.4), ctx.oro()); trono.position.set(TRONO[0], 1.6, TRONO[1] - 0.75); E.add(trono);
  const azul = new T.MeshStandardMaterial({ color: 0x2f6f8f, roughness: 0.7 });
  [-4, -2.2, 2.2, 4].forEach(x => {
    const c = new T.Mesh(new T.CylinderGeometry(0.38, 0.45, 6, 16), blanco); c.position.set(x, 3.5, TRONO[1] - 2.4); c.castShadow = true; E.add(c);
    const capitel = new T.Mesh(new T.CylinderGeometry(0.62, 0.38, 0.7, 16), azul); capitel.position.set(x, 6.8, TRONO[1] - 2.4); E.add(capitel);
  });
  const dintel = new T.Mesh(new T.BoxGeometry(10, 0.8, 1.4), blanco); dintel.position.set(0, 7.5, TRONO[1] - 2.4); E.add(dintel);
  const franja = new T.Mesh(new T.BoxGeometry(10.05, 0.25, 1.45), azul); franja.position.set(0, 7.25, TRONO[1] - 2.4); E.add(franja);
  crearGraneros(ctx);
  // la gente
  A.faraon = await ctx.actor('faraon', { x: TRONO[0], z: TRONO[1], altura: 1.8, color: 0xf2e2b0 });
  A.copero = await ctx.actor('pueblo-hombre', { x: -2.8, z: -3.4, altura: 1.72, color: 0xe8dcc0 });
  A.jose = await ctx.actor('jose-egipto', { x: ANTE[0], z: ANTE[1], altura: 1.65, color: 0xc0504d });
  A.gob = await ctx.actor('jose-gobernador', { x: ANTE[0], z: ANTE[1], altura: 1.78, color: 0xf3ead8 });
  A.jacob = await ctx.actor('jacob', { x: -30, z: 7, altura: 1.68, color: 0x8a6a4a });
  A.mujer = await ctx.actor('pueblo-mujer', { x: 6.6, z: 3, altura: 1.62, color: 0x9a6a4a });
  HERMANOS = [];
  for (const [clave, id, x, z] of HERM) {
    A[clave] = await ctx.actor(id, { x, z, altura: 1.7 + (HERMANOS.length % 3) * 0.04, color: 0x8a6a4a });
    HERMANOS.push(A[clave]);
  }
  // el sueño: siete vacas gordas y siete flacas que salen del Nilo
  GORDAS = []; FLACAS = [];
  for (let i = 0; i < 7; i++) {
    const g = await ctx.actor('vaca', { x: -7 + i * 2.3, z: NILO.z, altura: 1.45 });
    g.obj.scale.x *= 1.3; g.obj.scale.z *= 1.15; GORDAS.push(g);
    const f = await ctx.actor('vaca', { x: -6 + i * 2.3, z: NILO.z, altura: 1.35, material: m => { const n = m.clone(); n.color = new T.Color(0x9c8a78); return n; } });
    f.obj.scale.x *= 0.55; f.obj.scale.z *= 0.92; FLACAS.push(f);
  }
  // los carros de Egipto que trajeron a Jacob (Gn 45:27). El GLB del carro tiene la lanza hacia −X: se gira dentro de su grupo
  A.carro = await ctx.actor('carro-egipcio', { x: -34, z: 7, altura: 1.4 });
  A.carro.obj.rotation.y += Math.PI / 2;
  A.caballo = await ctx.actor('caballo', { x: -31.4, z: 7, altura: 1.7 });
  colocar(ctx);
  inicial = Object.values(A).concat(GORDAS, FLACAS).filter(a => a && a.g).map(a => ({ a, x: a.g.position.x, z: a.g.position.z, r: a.g.rotation.y }));
  ctx.camara.position.set(2, 4.5, 13); ctx.mira.set(0, 2, -2);
};

function colocar(ctx) {
  A.faraon.g.position.y = 0.5; ctx.mirarA(A.faraon, 0, 6);
  A.jose.g.visible = true; A.gob.g.visible = false;
  ctx.mirarA(A.jose, 0, 6); ctx.mirarA(A.copero, 0, 0);
  A.jacob.g.visible = false; A.mujer.g.visible = false;
  HERMANOS.forEach(a => { a.g.visible = false; a.reposo = null; ctx.anim(a, 'idle'); });
  GORDAS.concat(FLACAS).forEach(v => { v.g.visible = false; });
  A.carro.g.visible = A.caballo.g.visible = false;
  C.trigo.forEach(g => { g.lleno = 0; g.t.scale.y = 0.001; g.t.position.y = 0; g.cima.visible = false; g.monton.scale.setScalar(0.001); });
}

H.reiniciar = async function (ctx) {
  inicial.forEach(i => { i.a.g.position.set(i.x, 0, i.z); i.a.g.rotation.y = i.r; });
  colocar(ctx);
  await Promise.all([cielo(ctx, 'dia', 0.01), campos(ctx, false, 0.01)]);
  ctx.camara.position.set(2, 4.5, 13); ctx.mira.set(0, 2, -2);
};

H.inicio = async function (ctx) {
  const d = ctx.decir;
  await ctx.camaraA([1.6, 2.6, 5.2], [0, 1.4, -1.4], 2);
  await d(QUIEN.narrador, { es: 'José era el hijo querido de Jacob. Sus hermanos le tenían envidia y lo vendieron como esclavo, y así llegó a Egipto.',
    en: 'Joseph was Jacob’s beloved son. His brothers were jealous of him and sold him as a slave, and that is how he came to Egypt.' });
  await d(QUIEN.narrador, { es: 'Allí lo acusaron sin culpa y terminó en la cárcel. Pero el Señor estaba con José, y todo lo que hacía le salía bien.',
    en: 'There he was blamed for something he did not do and ended up in prison. But the Lord was with Joseph, and everything he did went well.' });
  await d(QUIEN.jose, { es: 'Estoy lejos de mi casa, pero Dios no me ha dejado solo.', en: 'I am far from home, but God has not left me alone.' }, { actor: A.jose });
};

H.avanzar = async function (ctx, k, meta, f) {
  // cada acierto, un granero más lleno (la quinta parte de la cosecha, Gn 41:34)
  await llenar(ctx, Math.round(f * GRANEROS), 1.1);
};

/* las vacas: andan con su clip cuando lo tienen */
function andar(ctx, v, x, z, s) {
  if (v.clips.caminar) ctx.anim(v, 'caminar');
  return ctx.mover(v, x, z, s).then(() => { if (v.clips.quieto) ctx.anim(v, 'quieto'); });
}

H.momentos = [
  async function sueno(ctx) {
    // Faraón sueña: de noche, junto al Nilo (Gn 41:1-7)
    await Promise.all([cielo(ctx, 'sueno', 1.6), ctx.camaraA([-0.5, 4.4, -8.4], [0, 0.4, -15.5], 1.8)]);
    await ctx.decir(QUIEN.narrador, { es: 'Una noche, Faraón, el rey de Egipto, tuvo un sueño. Estaba a la orilla del río Nilo…',
      en: 'One night Pharaoh, the king of Egypt, had a dream. He was standing by the river Nile…' });
    GORDAS.forEach(v => { v.g.position.z = NILO.z; v.g.visible = true; });
    await Promise.all(GORDAS.map((v, i) => ctx.esperar(i * 0.15).then(() => andar(ctx, v, v.g.position.x, -13.4, 2.4))));
    await ctx.decir(QUIEN.narrador, { es: 'Del río salieron siete vacas gordas y hermosas. Después salieron otras siete, flacas y feas, y se comieron a las gordas.',
      en: 'Seven fat, beautiful cows came up out of the river. Then seven other cows came up, thin and ugly, and they ate up the fat ones.' });
    FLACAS.forEach(v => { v.g.position.z = NILO.z; v.g.visible = true; });
    await Promise.all(FLACAS.map((v, i) => ctx.esperar(i * 0.15).then(() => andar(ctx, v, v.g.position.x, -14.4, 2.2))));
    ctx.sonido('llamarada', { fuerza: 0.4 });
    await ctx.tween(1.2, u => GORDAS.forEach(v => { v.g.scale.setScalar(Math.max(0.001, 1 - u)); }));
    GORDAS.forEach(v => { v.g.visible = false; v.g.scale.setScalar(1); });
    await ctx.esperar(0.8);
    FLACAS.forEach(v => { v.g.visible = false; });
    await Promise.all([cielo(ctx, 'dia', 1.6), ctx.camaraA([2.5, 2.8, 4.5], [0, 1.8, TRONO[1]], 0.01)]);
    await ctx.decir(QUIEN.faraon, { es: 'Tuve un sueño y nadie en Egipto me lo sabe explicar.', en: 'I had a dream, and no one in Egypt can explain it to me.' }, { actor: A.faraon });
  },
  async function interpreta(ctx) {
    await ctx.camaraA([-4.5, 2.6, 2.8], [0, 1.6, -3.2], 1.6);
    await ctx.decir(QUIEN.copero, { es: 'Majestad, en la cárcel hay un joven hebreo que nos explicó nuestros sueños, y todo pasó tal como él dijo.',
      en: 'Your Majesty, there is a young Hebrew in prison who explained our dreams, and everything happened just as he said.' }, { actor: A.copero });
    ctx.mirarA(A.faraon, ANTE[0], ANTE[1]);
    await ctx.decir(QUIEN.faraon, { es: 'Me han dicho que tú sabes explicar los sueños.', en: 'I have heard that you can explain dreams.' }, { actor: A.faraon });
    await ctx.decir(QUIEN.jose, { es: 'Yo no puedo, pero Dios le dará a Faraón la respuesta.', en: 'I cannot, but God will give Pharaoh the answer.' }, { actor: A.jose });
    await ctx.camaraA([1.8, 2.3, 3.6], [0, 1.5, -1.4], 1.4);
    await ctx.decir(QUIEN.jose, { es: 'Los dos sueños dicen lo mismo: vendrán siete años de mucha comida, y después siete años de hambre en toda la tierra.',
      en: 'Both dreams mean the same thing: seven years of plenty are coming, and after them seven years of hunger in all the land.' }, { actor: A.jose });
    await ctx.decir(QUIEN.jose, { es: 'Busque a un hombre sabio, y que en los años buenos guarden la quinta parte de la cosecha.',
      en: 'Find a wise man, and in the good years let them store one fifth of the harvest.' }, { actor: A.jose });
  },
  async function gobernador(ctx) {
    await ctx.camaraA([3.2, 2.4, 3.2], [0, 1.6, -2.6], 1.6);
    await ctx.decir(QUIEN.faraon, { es: 'Dios te ha mostrado todo esto: no hay nadie tan sabio como tú. Tú gobernarás todo Egipto; sólo el trono será más grande que tú.',
      en: 'God has shown you all this: there is no one as wise as you. You will rule all Egypt; only the throne will be greater than you.' }, { actor: A.faraon });
    ctx.sonido('musica');
    // el anillo, la ropa de lino y el collar de oro (Gn 41:42)
    const T = ctx.THREE, luz = new T.PointLight(0xffe2a0, 0, 6, 2); luz.position.set(ANTE[0], 1.4, ANTE[1] + 0.6); ctx.escena.add(luz);
    await ctx.tween(0.7, u => { luz.intensity = 3 * u; });
    A.jose.g.visible = false; A.gob.g.visible = true; ctx.mirarA(A.gob, 0, 6);
    await ctx.tween(0.9, u => { luz.intensity = 3 * (1 - u); });
    ctx.escena.remove(luz);
    await ctx.decir(QUIEN.narrador, { es: 'Faraón le puso su anillo, lo vistió de lino fino y le colgó un collar de oro. José tenía treinta años.',
      en: 'Pharaoh put his ring on him, dressed him in fine linen and hung a gold chain around his neck. Joseph was thirty years old.' });
  },
  async function abundancia(ctx) {
    await ctx.mover(A.gob, JG[0], JG[1], 2);
    ctx.mirarA(A.gob, GRAN.x, 0);
    await Promise.all([campos(ctx, false, 1), ctx.camaraA([0, 4.2, 8.5], [7, 1.2, -0.5], 1.8)]);
    await ctx.decir(QUIEN.narrador, { es: 'Durante siete años la tierra dio cosechas enormes. José guardó tanto trigo en las ciudades que dejaron de contarlo, porque no tenía medida.',
      en: 'For seven years the land gave huge harvests. Joseph stored so much grain in the cities that they stopped counting it, because it was beyond measure.' });
  },
  async function hambre(ctx) {
    await Promise.all([cielo(ctx, 'seco', 2), campos(ctx, true, 2)]);
    await ctx.decir(QUIEN.narrador, { es: 'Después llegaron los años de hambre, en Egipto y en todos los países. Pero en Egipto había pan, y de todas partes venían a comprarle trigo a José.',
      en: 'Then the years of hunger came, in Egypt and in every country. But in Egypt there was bread, and people came from everywhere to buy grain from Joseph.' });
    // los hermanos llegan desde Canaán y se inclinan ante él sin reconocerlo (Gn 42:6)
    ctx.mirarA(A.gob, JG[0], 8);
    HERMANOS.forEach((a, i) => { a.g.position.set(-20 + HERM[i][2], 0, 1 + HERM[i][3]); a.g.visible = true; });
    await ctx.camaraA([-1.5, 3, 10], [5.5, 1.2, 1.8], 1.6);
    await Promise.all(HERMANOS.map((a, i) => ctx.esperar(i * 0.2).then(() => ctx.mover(a, JG[0] + HERM[i][2], JG[1] + HERM[i][3], 4.5))));
    HERMANOS.forEach(a => ctx.mirarA(a, A.gob.g.position.x, A.gob.g.position.z));
    [A.h3, A.h4].forEach(a => ctx.reposo(a, 'kneel'));
    [A.h5, A.h6].forEach(a => ctx.anim(a, 'praying-b'));
    await ctx.decir(QUIEN.hermanos, { es: 'Señor, venimos de la tierra de Canaán a comprar comida.', en: 'Sir, we have come from the land of Canaan to buy food.' }, { actor: HERMANOS });
    await ctx.decir(QUIEN.narrador, { es: 'Eran sus hermanos. Ellos no lo reconocieron, pero José sí los reconoció.',
      en: 'They were his brothers. They did not recognize him, but Joseph recognized them.' });
  },
  async function perdon(ctx) {
    HERMANOS.forEach(a => { a.reposo = null; ctx.anim(a, 'idle'); });
    await ctx.camaraA([1.4, 2.2, 0.4], [JG[0], 1.4, JG[1] + 1.8], 1.6);
    await ctx.decir(QUIEN.jose, { es: 'Yo soy José, su hermano, el que ustedes vendieron. No tengan miedo ni se enojen con ustedes mismos.',
      en: 'I am Joseph, your brother, the one you sold. Do not be afraid, and do not be angry with yourselves.' }, { actor: A.gob });
    await ctx.mover(A.gob, JG[0], JG[1] + 1.1, 1.2);
    await ctx.decir(QUIEN.jose, { es: 'Ustedes quisieron hacerme mal, pero Dios lo cambió en bien: me envió delante de ustedes para salvar muchas vidas.',
      en: 'You meant to harm me, but God turned it into good: he sent me ahead of you to save many lives.' }, { actor: A.gob });
    await ctx.decir(QUIEN.narrador, { es: 'José abrazó a sus hermanos y lloró con ellos. Después los mandó a traer a su padre.',
      en: 'Joseph hugged his brothers and wept with them. Then he sent them to bring their father.' });
  },
  async function jacob(ctx) {
    // Jacob llega en los carros que José le mandó (Gn 45:27, 46:29-30)
    cielo(ctx, 'tarde', 3);
    A.carro.g.visible = A.caballo.g.visible = true;
    A.carro.g.position.set(-34, 0, 7); A.caballo.g.position.set(-31.4, 0, 7);
    ctx.mirarA(A.carro, 0, 7); ctx.mirarA(A.caballo, 0, 7);
    A.jacob.g.position.set(-28, 0, 8.4);
    await ctx.camaraA([-4, 2.6, 13], [-6, 1.2, 6], 1.6);
    if (A.caballo.clips.caminar) ctx.anim(A.caballo, 'caminar');
    await Promise.all([ctx.mover(A.carro, -13, 7, 5), ctx.mover(A.caballo, -10.4, 7, 5)]);
    if (A.caballo.clips.quieto) ctx.anim(A.caballo, 'quieto');
    A.jacob.g.position.set(-11.8, 0, 8.6); A.jacob.g.visible = true;
    ctx.mirarA(A.jacob, 6, 2);
    await ctx.mover(A.gob, -6.4, 7.8, 3);
    await ctx.mover(A.jacob, -7.3, 8.0, 0.8);
    ctx.mirarA(A.gob, A.jacob.g.position.x, A.jacob.g.position.z); ctx.mirarA(A.jacob, A.gob.g.position.x, A.gob.g.position.z);
    await ctx.camaraA([-5.4, 2.1, 12.2], [-7.6, 1.3, 7.8], 1.4);
    await ctx.decir(QUIEN.narrador, { es: 'Cuando José vio a su padre, lo abrazó y lloró mucho tiempo sobre su cuello.',
      en: 'When Joseph saw his father, he hugged him and wept on his neck for a long time.' });
    await ctx.decir(QUIEN.jacob, { es: '¡Hijo mío, estás vivo! Ya he visto tu cara: ahora puedo morir en paz.',
      en: 'My son, you are alive! I have seen your face: now I can die in peace.' }, { actor: A.jacob });
  }
];

H.final = async function (ctx) {
  await ctx.camaraA([0, 5, 15], [3, 1.6, -2], 2.4);
  await ctx.decir(QUIEN.narrador, { es: 'Dios estuvo con José en la cárcel y en el palacio. Convirtió lo malo en bueno y lo usó para salvar a su familia y a muchos pueblos.',
    en: 'God was with Joseph in prison and in the palace. He turned the bad into good and used him to save his family and many nations.' });
};
})();
