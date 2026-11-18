/* Daniel en el foso de los leones (Dn 6). Joseth, 17 nov 2026: encargos/historias-3d.md de myvc_biblioteca, historia 2
   (van en orden inverso: cruz, segunda venida, ascensión, José en Egipto, el buen samaritano, ésta).
   - Reto: los siete leones del foso; cada acierto calma a uno.
   - Momentos ENTRE las preguntas (H.momentos): la ley de los treinta días, Daniel ora tres veces al día en su ventana,
     lo acusan y el rey se entristece, al foso y la piedra sellada, la noche (el ángel cierra la boca de los leones), la
     madrugada (el rey llama a Daniel) y la salida del foso con el decreto del rey.
   - Sin modelos propios: Daniel es Sadrac (se arrodilla a orar), el rey Darío es Nabucodonosor de azul (se sienta en su
     trono), los gobernadores envidiosos son el hombre del pueblo y los discípulos 1 y 2, los guardias son los del horno
     de azul, y el ángel, el del horno. Los leones y las leonas son los de la Biblioteca (quieto y caminar). El palacio,
     la casa con la ventana hacia Jerusalén y el foso (un hueco de verdad en el suelo), con código.
   - Las palabras parafrasean la Biblia (no se cita la RV1960). */
(function () {
'use strict';
const H = {};
(window.HISTORIAS = window.HISTORIAS || {}).daniel = H;

H.titulo = { es: 'Daniel en el foso de los leones', en: 'Daniel in the Lions’ Den' };
H.frase = { es: 'Daniel siguió orando a Dios aunque una ley lo prohibía, y Dios lo cuidó en el foso de los leones.',
  en: 'Daniel kept praying to God even when a law forbade it, and God kept him safe in the lions’ den.' };
H.como = { es: 'Contesta las preguntas. Cada acierto calma a uno de los siete leones del foso, y la historia sigue.',
  en: 'Answer the questions. Each right answer calms one of the seven lions in the den, and the story goes on.' };
H.reto = { es: 'Leones en calma', en: 'Calm lions' };
H.enOrden = true;
H.modelos = ['sadrac', 'nabucodonosor', 'pueblo-hombre', 'discipulo-1', 'discipulo-2', 'guardia', 'angel', 'leon', 'leona'];
H.voces = { narrador: 'narrador', rey: 'rey', daniel: 'hombre', gobernadores: 'joven' };

const LEONES = 7;
let IDI = 'es';
H.valorReto = f => {
  if (f <= 0) return '';
  const k = Math.round(f * LEONES);
  return IDI === 'en' ? k + ' of ' + LEONES : k + ' de ' + LEONES;
};
/* del naranja del león que ruge al azul de la noche en calma */
H.colorPaso = f => {
  const a = [214, 120, 46], b = [74, 120, 196], u = Math.min(1, Math.max(0, f));
  return 'rgb(' + a.map((v, i) => Math.round(v + (b[i] - v) * u)).join(' ') + ')';
};

/* la pregunta k es sobre lo que se acaba de ver (el inicio, o el momento k−1) */
H.preguntas = {
  es: [
    { p: '¿Por qué el rey quería poner a Daniel al frente de todo el reino?', opciones: ['Porque era fiel y trabajaba muy bien', 'Porque era su hermano', 'Porque era el más rico'], correcta: 0 },
    { p: '¿Durante cuántos días nadie podía orar a nadie más que al rey?', opciones: ['Treinta', 'Siete', 'Cien'], correcta: 0 },
    { p: '¿Cuántas veces al día oraba Daniel?', opciones: ['Tres', 'Una', 'Ninguna'], correcta: 0 },
    { p: '¿Cómo se sintió el rey cuando acusaron a Daniel?', opciones: ['Muy triste', 'Muy contento', 'Le dio risa'], correcta: 0 },
    { p: '¿Qué pusieron sobre la boca del foso?', opciones: ['Una piedra', 'Una red', 'Una manta'], correcta: 0 },
    { p: '¿Quién cerró la boca de los leones?', opciones: ['Un ángel que Dios envió', 'Los guardias', 'El rey'], correcta: 0 },
    { p: '¿Qué le había pasado a Daniel en el foso?', opciones: ['Nada: los leones no le hicieron daño', 'Estaba muy herido', 'Se había escapado'], correcta: 0 }
  ],
  en: [
    { p: 'Why did the king want to put Daniel over the whole kingdom?', opciones: ['Because he was faithful and worked very well', 'Because he was his brother', 'Because he was the richest'], correcta: 0 },
    { p: 'For how many days could no one pray to anyone but the king?', opciones: ['Thirty', 'Seven', 'One hundred'], correcta: 0 },
    { p: 'How many times a day did Daniel pray?', opciones: ['Three', 'One', 'None'], correcta: 0 },
    { p: 'How did the king feel when they accused Daniel?', opciones: ['Very sad', 'Very happy', 'He laughed'], correcta: 0 },
    { p: 'What did they put over the mouth of the den?', opciones: ['A stone', 'A net', 'A blanket'], correcta: 0 },
    { p: 'Who shut the lions’ mouths?', opciones: ['An angel sent by God', 'The guards', 'The king'], correcta: 0 },
    { p: 'What had happened to Daniel in the den?', opciones: ['Nothing: the lions did not hurt him', 'He was badly hurt', 'He had escaped'], correcta: 0 }
  ]
};

const QUIEN = {
  narrador: { es: '', en: '', voz: 'narrador' },
  rey: { es: 'El rey Darío', en: 'King Darius', voz: 'rey' },
  daniel: { es: 'Daniel', en: 'Daniel', voz: 'hombre' },
  gobernadores: { es: 'Los gobernadores', en: 'The governors', voz: 'joven' }
};

/* ---------- el lugar: el palacio (izquierda), la casa de Daniel (derecha) y el foso (delante) ---------- */
const TRONO = [-9, -5];
const CASA = [6, -8];                 // la ventana, en la pared del fondo (z = CASA − 2.5), mira hacia Jerusalén
const ORA = [6, -9.7];                // donde se arrodilla Daniel
const FOSO = [2, 8], R = 3.6, PROF = 3.4;
const BORDE = [FOSO[0], FOSO[1] - R - 0.6];   // la orilla del foso del lado del palacio
let A = {}, C = {}, inicial = [], quitaRonda = null;

const CIELOS = {
  dia: { cielo: 0x9cc6e8, luz: 0.95, hemi: 0.45, sol: 0xfff0d6 },
  manana: { cielo: 0xf2c9a0, luz: 0.9, hemi: 0.5, sol: 0xffe0b0 },
  tarde: { cielo: 0xe9a66e, luz: 0.85, hemi: 0.45, sol: 0xffc48a },
  noche: { cielo: 0x1c2442, luz: 0.22, hemi: 0.2, sol: 0x9fb0ff },
  alba: { cielo: 0xe7b9b0, luz: 0.8, hemi: 0.5, sol: 0xffd6c0 }
};
function cielo(ctx, nombre, s) {
  const T = ctx.THREE, a = { c: C.fondo.clone(), l: C.sol.intensity, h: C.hemi.intensity, s: C.sol.color.clone() }, b = CIELOS[nombre];
  const cb = new T.Color(b.cielo), sb = new T.Color(b.sol);
  return ctx.tween(s || 2, u => {
    C.fondo.copy(a.c).lerp(cb, u); ctx.escena.background.copy(C.fondo); ctx.escena.fog.color.copy(C.fondo);
    C.sol.intensity = a.l + (b.luz - a.l) * u; C.hemi.intensity = a.h + (b.hemi - a.h) * u; C.sol.color.copy(a.s).lerp(sb, u);
  });
}

/* el trono de Darío (el de horno.js: Mixamo «Sitting» baja la cadera hasta la altura de una silla) */
function trono(ctx) {
  const T = ctx.THREE, g = new T.Group(), oro = new T.MeshStandardMaterial({ color: 0xd9a531, metalness: 0.5, roughness: 0.35, emissive: 0x3a2500, emissiveIntensity: 0.4 });
  const tela = new T.MeshStandardMaterial({ color: 0x1f3a6e, roughness: 0.9 });
  const caja = (w, h, d, x, y, z, m) => { const b = new T.Mesh(new T.BoxGeometry(w, h, d), m); b.position.set(x, y, z); b.castShadow = b.receiveShadow = true; g.add(b); return b; };
  caja(1.6, 0.06, 1.8, 0, 0.03, 0.1, tela);
  caja(0.7, 0.1, 0.55, 0, 0.47, -0.12, oro);
  caja(0.62, 0.06, 0.5, 0, 0.54, -0.12, tela);
  caja(0.7, 1.25, 0.1, 0, 0.95, -0.42, oro);
  caja(0.1, 0.3, 0.55, -0.36, 0.7, -0.12, oro); caja(0.1, 0.3, 0.55, 0.36, 0.7, -0.12, oro);
  [[-0.3, 0.1], [0.3, 0.1], [-0.3, -0.36], [0.3, -0.36]].forEach(([x, z]) => caja(0.08, 0.44, 0.08, x, 0.22, z, oro));
  g.position.set(TRONO[0], 0, TRONO[1]); ctx.escena.add(g);
  return g;
}

/* Daniel de rodillas: «kneel» una vez y se queda abajo; mientras habla, sigue de rodillas */
function arrodillar(ctx, a) { a.reposo = 'kneel'; return ctx.anim(a, 'kneel', { una: true, quedarse: true }); }
function deRodillas(a) { return { actor: a, gesto: a.reposo === 'kneel' ? 'kneel' : 'talk' }; }
function levantar(ctx, a) { a.reposo = null; return ctx.anim(a, 'idle'); }

/* los leones rondan el foso en círculo; `parar` los deja quietos donde estén */
function rondar(ctx) {
  if (quitaRonda) return;
  C.leones.forEach(l => { if (l.ronda && l.clips.caminar) ctx.anim(l, 'caminar'); });
  quitaRonda = ctx.cadaCuadro(dt => {
    C.leones.forEach(l => {
      if (!l.ronda) return;
      l.th += dt * l.w;
      l.g.position.x = FOSO[0] + Math.cos(l.th) * l.r; l.g.position.z = FOSO[1] + Math.sin(l.th) * l.r;
      l.g.rotation.y = l.w > 0 ? -l.th : Math.PI - l.th;
    });
  });
}
function parar(ctx) {
  if (quitaRonda) { quitaRonda(); quitaRonda = null; }
  C.leones.forEach(l => { if (l.clips.quieto) ctx.anim(l, 'quieto'); });
}
function verTapa(u) { C.tapa.position.x = C.tapaFuera + (FOSO[0] - C.tapaFuera) * u; }

H.montar = async function (ctx) {
  const T = ctx.THREE, E = ctx.escena;
  IDI = ctx.idioma === 'en' ? 'en' : 'es';
  C.fondo = new T.Color(CIELOS.dia.cielo);
  E.background = C.fondo.clone();
  E.fog = new T.Fog(C.fondo.clone(), 50, 170);
  C.hemi = new T.HemisphereLight(0xfff0d6, 0x6f5a40, CIELOS.dia.hemi); E.add(C.hemi);
  C.sol = new T.DirectionalLight(CIELOS.dia.sol, CIELOS.dia.luz);
  C.sol.position.set(-14, 26, 16); C.sol.castShadow = true; C.sol.shadow.mapSize.set(2048, 2048);
  Object.assign(C.sol.shadow.camera, { left: -26, right: 26, top: 26, bottom: -26, near: 1, far: 90 });
  E.add(C.sol);
  // el suelo, con el hueco del foso (la forma se acuesta: su y pasa a ser −z)
  const forma = new T.Shape();
  forma.moveTo(-200, -200); forma.lineTo(200, -200); forma.lineTo(200, 200); forma.lineTo(-200, 200); forma.lineTo(-200, -200);
  const hueco = new T.Path(); hueco.absarc(FOSO[0], -FOSO[1], R, 0, Math.PI * 2, true); forma.holes.push(hueco);
  const suelo = new T.Mesh(new T.ShapeGeometry(forma, 48), new T.MeshStandardMaterial({ color: 0xb59a68, roughness: 1 }));
  suelo.rotation.x = -Math.PI / 2; suelo.receiveShadow = true; E.add(suelo);
  // el foso: la pared de piedra por dentro, el fondo de arena y piedras en la orilla
  const piedra = new T.MeshStandardMaterial({ color: 0x75644c, roughness: 1, flatShading: true });
  const pared = new T.Mesh(new T.CylinderGeometry(R, R, PROF, 40, 3, true), new T.MeshStandardMaterial({ color: 0x6d5c45, roughness: 1, side: T.BackSide, flatShading: true }));
  pared.position.set(FOSO[0], -PROF / 2, FOSO[1]); pared.receiveShadow = true; E.add(pared);
  const fondo = new T.Mesh(new T.CircleGeometry(R, 40), new T.MeshStandardMaterial({ color: 0x8a7552, roughness: 1 }));
  fondo.rotation.x = -Math.PI / 2; fondo.position.set(FOSO[0], -PROF, FOSO[1]); fondo.receiveShadow = true; E.add(fondo);
  for (let i = 0; i < 22; i++) {
    const a = i / 22 * Math.PI * 2, r = 0.25 + (i % 3) * 0.08;
    const m = new T.Mesh(new T.DodecahedronGeometry(r, 0), piedra);
    m.position.set(FOSO[0] + Math.cos(a) * (R + 0.25), r * 0.4, FOSO[1] + Math.sin(a) * (R + 0.25)); m.castShadow = true; E.add(m);
  }
  [[0.6, 0.3], [2.1, 0.45], [3.8, 0.35], [5.2, 0.5]].forEach(([a, r]) => {
    const m = new T.Mesh(new T.DodecahedronGeometry(r, 0), piedra); m.position.set(FOSO[0] + Math.cos(a) * (R - 0.5), -PROF + r * 0.5, FOSO[1] + Math.sin(a) * (R - 0.5)); E.add(m);
  });
  // la piedra que tapa la boca del foso, al lado mientras tanto, con el sello del rey
  C.tapa = new T.Group();
  const losa = new T.Mesh(new T.CylinderGeometry(R + 0.5, R + 0.6, 0.45, 40), new T.MeshStandardMaterial({ color: 0x8c7b62, roughness: 1, flatShading: true }));
  losa.position.y = 0.23; losa.castShadow = losa.receiveShadow = true; C.tapa.add(losa);
  C.sello = new T.Mesh(new T.CylinderGeometry(0.22, 0.22, 0.06, 20), new T.MeshStandardMaterial({ color: 0xa3201f, roughness: 0.6 }));
  C.sello.position.set(0, 0.48, -R + 0.3); C.tapa.add(C.sello);
  C.tapaFuera = FOSO[0] + 2 * R + 2.6;
  C.tapa.position.set(C.tapaFuera, 0, FOSO[1]); E.add(C.tapa);
  // el palacio de Darío: la pared de ladrillo azul con leones de oro, columnas y el trono
  const azul = new T.MeshStandardMaterial({ color: 0x2f5d9a, roughness: 0.6 }), oro = ctx.oro();
  const fondoPal = new T.Mesh(new T.BoxGeometry(14, 6, 0.6), azul); fondoPal.position.set(TRONO[0], 3, TRONO[1] - 3.2); fondoPal.receiveShadow = true; E.add(fondoPal);
  for (let i = 0; i < 5; i++) {
    const f = new T.Mesh(new T.BoxGeometry(1.4, 0.7, 0.08), oro); f.position.set(TRONO[0] - 5 + i * 2.5, 1.6, TRONO[1] - 2.86); E.add(f);
  }
  const franja = new T.Mesh(new T.BoxGeometry(14, 0.25, 0.08), oro); franja.position.set(TRONO[0], 4.6, TRONO[1] - 2.86); E.add(franja);
  const crema = new T.MeshStandardMaterial({ color: 0xe6d6b0, roughness: 0.8 });
  [[-6, -1.6], [-6, 2.4], [6, -1.6], [6, 2.4]].forEach(([dx, dz]) => {
    const c = new T.Mesh(new T.CylinderGeometry(0.35, 0.42, 5.2, 14), crema); c.position.set(TRONO[0] + dx, 2.6, TRONO[1] + dz); c.castShadow = true; E.add(c);
  });
  [-6, 6].forEach(dx => { const v = new T.Mesh(new T.BoxGeometry(1, 0.5, 5.4), crema); v.position.set(TRONO[0] + dx, 5.4, TRONO[1] + 0.4); E.add(v); });
  const alfombra = new T.Mesh(new T.BoxGeometry(2.2, 0.04, 7), new T.MeshStandardMaterial({ color: 0x8a1e2a, roughness: 1 })); alfombra.position.set(TRONO[0], 0.02, TRONO[1] + 3.2); E.add(alfombra);
  A.trono = trono(ctx);
  C.rollo = new T.Group();
  const papiro = new T.Mesh(new T.CylinderGeometry(0.05, 0.05, 0.5, 12), new T.MeshStandardMaterial({ color: 0xe9dcb5, roughness: 1 })); papiro.rotation.z = Math.PI / 2; papiro.position.y = 0.82; C.rollo.add(papiro);
  const mesa = new T.Mesh(new T.BoxGeometry(0.8, 0.76, 0.5), new T.MeshStandardMaterial({ color: 0x6b4a2c, roughness: 1 })); mesa.position.y = 0.38; mesa.castShadow = true; C.rollo.add(mesa);
  C.rollo.position.set(TRONO[0] + 1.3, 0, TRONO[1] + 0.6); E.add(C.rollo);
  // la casa de Daniel: tres paredes, techo y la ventana abierta en la del fondo
  const adobe = new T.MeshStandardMaterial({ color: 0xd2b98c, roughness: 1 });
  const muro = (w, h, d, x, y, z) => { const m = new T.Mesh(new T.BoxGeometry(w, h, d), adobe); m.position.set(x, y, z); m.castShadow = m.receiveShadow = true; E.add(m); };
  const zf = CASA[1] - 2.5;
  muro(2.3, 3.2, 0.25, CASA[0] - 1.85, 1.6, zf); muro(2.3, 3.2, 0.25, CASA[0] + 1.85, 1.6, zf);
  muro(1.4, 1.1, 0.25, CASA[0], 0.55, zf); muro(1.4, 0.9, 0.25, CASA[0], 2.75, zf);
  muro(0.25, 3.2, 5, CASA[0] - 3, 1.6, CASA[1]); muro(0.25, 3.2, 5, CASA[0] + 3, 1.6, CASA[1]);
  const techo = new T.Mesh(new T.BoxGeometry(6.5, 0.25, 5.4), new T.MeshStandardMaterial({ color: 0x8a6a46, roughness: 1 })); techo.position.set(CASA[0], 3.32, CASA[1]); techo.castShadow = true; E.add(techo);
  const marco = new T.MeshStandardMaterial({ color: 0x6b4a2c, roughness: 1 });
  [[-0.72, 0], [0.72, 0]].forEach(([dx]) => { const p = new T.Mesh(new T.BoxGeometry(0.08, 1.3, 0.3), marco); p.position.set(CASA[0] + dx, 1.7, zf); E.add(p); });
  const estera = new T.Mesh(new T.BoxGeometry(1.4, 0.03, 1), new T.MeshStandardMaterial({ color: 0xa8763e, roughness: 1 })); estera.position.set(ORA[0], 0.02, ORA[1] + 0.2); E.add(estera);
  C.lampara = new T.PointLight(0xffd59a, 0.5, 7, 2); C.lampara.position.set(CASA[0] + 1.5, 2.6, CASA[1]); E.add(C.lampara);
  // Babilonia a lo lejos: el zigurat, las murallas y palmeras; y los montes que se ven por la ventana
  const ladrillo = new T.MeshStandardMaterial({ color: 0xc8a473, roughness: 1 });
  [[22, 5], [16, 4.2], [10, 3.4], [5, 2.6]].forEach(([w, h], i) => {
    const z = new T.Mesh(new T.BoxGeometry(w, h, w), ladrillo); z.position.set(-34, [2.5, 7.1, 10.9, 13.9][i], -50); E.add(z);
  });
  for (let i = 0; i < 9; i++) { const b = new T.Mesh(new T.BoxGeometry(8, 4.5 + (i % 2), 2), ladrillo); b.position.set(-60 + i * 15, 2.3, -70); E.add(b); }
  const roca = new T.MeshStandardMaterial({ color: 0x9a8566, roughness: 1, flatShading: true });
  [[0, -60, 14, 5], [18, -66, 12, 6], [-14, -64, 10, 4]].forEach(([x, z, r, h]) => {
    const m = new T.Mesh(new T.SphereGeometry(r, 10, 6, 0, Math.PI * 2, 0, Math.PI / 2), roca); m.scale.y = h / r; m.position.set(x, 0, z); E.add(m);
  });
  const tronco = new T.MeshStandardMaterial({ color: 0x7a5a36, roughness: 1 }), hoja = new T.MeshStandardMaterial({ color: 0x4f8a3a, roughness: 1 });
  [[-18, -2, 4.6], [-17, 4, 5.2], [14, -4, 4.8], [15, 2, 5], [-3, -14, 4.4], [11, 14, 4.6]].forEach(([x, z, alto]) => {
    const p = new T.Group(); p.position.set(x, 0, z);
    const t = new T.Mesh(new T.CylinderGeometry(0.16, 0.26, alto, 8), tronco); t.position.y = alto / 2; t.castShadow = true; p.add(t);
    for (let k = 0; k < 6; k++) {
      const h = new T.Mesh(new T.ConeGeometry(0.32, 2.4, 6), hoja); h.geometry.translate(0, 1.1, 0);
      h.position.y = alto; h.rotation.z = Math.PI / 2.6; h.rotation.y = k * Math.PI / 3; h.castShadow = true; p.add(h);
    }
    E.add(p);
  });
  // la gente
  A.rey = await ctx.actor('nabucodonosor', { x: TRONO[0], z: TRONO[1], altura: 1.9, color: 0x2a4f8f });
  A.daniel = await ctx.actor('sadrac', { x: TRONO[0] + 0.3, z: TRONO[1] + 2.6, altura: 1.76, color: 0x7a3b2a });
  A.gob1 = await ctx.actor('pueblo-hombre', { x: TRONO[0] - 3.2, z: TRONO[1] + 4, altura: 1.72, color: 0x7a2a4a });
  A.gob2 = await ctx.actor('discipulo-1', { x: TRONO[0] - 4.2, z: TRONO[1] + 4.8, altura: 1.74, color: 0x4a3a8a });
  A.gob3 = await ctx.actor('discipulo-2', { x: TRONO[0] - 2.4, z: TRONO[1] + 5, altura: 1.72, color: 0x2a6a6a });
  A.guardia1 = await ctx.actor('guardia', { x: FOSO[0] - R - 1.6, z: FOSO[1] - 1.4, altura: 1.85, color: 0x2a3f7a });
  A.guardia2 = await ctx.actor('guardia', { x: FOSO[0] + R + 1.6, z: FOSO[1] - 1.4, altura: 1.85, color: 0x2a3f7a });
  A.angel = await ctx.actor('angel', { x: FOSO[0] + 1.1, y: -PROF, z: FOSO[1] - 1.2, altura: 1.85, color: 0xffffff,
    material: m => { const n = m.clone(); n.emissive = new T.Color(0xffe39a); n.emissiveIntensity = 0.18; return n; } });
  C.luzAngel = new T.PointLight(0xfff4d6, 0, 9, 2); C.luzAngel.position.y = 1.4; A.angel.g.add(C.luzAngel);
  // los siete leones del foso: tres rondan, los demás esperan
  C.leones = [];
  for (let i = 0; i < LEONES; i++) {
    const macho = i % 2 === 0, th = i / LEONES * Math.PI * 2;
    const l = await ctx.actor(macho ? 'leon' : 'leona', { x: FOSO[0] + Math.cos(th) * 2.5, y: -PROF, z: FOSO[1] + Math.sin(th) * 2.5, altura: macho ? 1.1 : 0.95 });
    Object.assign(l, { th0: th, th, r: i < 3 ? 2.2 : 2.65, w: i < 3 ? (i === 1 ? -0.32 : 0.28) : 0, ronda: i < 3 });
    C.leones.push(l);
  }
  colocar(ctx);
  inicial = Object.values(A).filter(a => a && a.g).map(a => ({ a, x: a.g.position.x, y: a.g.position.y, z: a.g.position.z, r: a.g.rotation.y }));
  ctx.camara.position.set(-1, 9, 24); ctx.mira.set(-1, 0.5, 0);
};

function colocar(ctx) {
  parar(ctx);
  C.leones.forEach(l => {
    l.th = l.th0; l.g.position.set(FOSO[0] + Math.cos(l.th0) * l.r, -PROF, FOSO[1] + Math.sin(l.th0) * l.r);
    if (!l.ronda) ctx.mirarA(l, FOSO[0], FOSO[1]);
  });
  rondar(ctx);
  verTapa(0); C.sello.visible = false;
  C.rollo.visible = false;
  A.angel.g.visible = false; C.luzAngel.intensity = 0;
  [A.guardia1, A.guardia2, A.gob1, A.gob2, A.gob3].forEach(a => { a.g.visible = true; });
  levantar(ctx, A.daniel);
  ctx.mirarA(A.rey, TRONO[0], TRONO[1] + 5);
  A.trono.rotation.y = A.rey.g.rotation.y;
  if (A.rey.clips.sit) ctx.reposo(A.rey, 'sit');
  ctx.mirarA(A.daniel, TRONO[0], TRONO[1]);
  [A.gob1, A.gob2, A.gob3].forEach(a => ctx.mirarA(a, TRONO[0], TRONO[1]));
  ctx.mirarA(A.guardia1, FOSO[0], FOSO[1]); ctx.mirarA(A.guardia2, FOSO[0], FOSO[1]);
}

H.reiniciar = async function (ctx) {
  inicial.forEach(i => { i.a.g.position.set(i.x, i.y, i.z); i.a.g.rotation.y = i.r; });
  colocar(ctx);
  await cielo(ctx, 'dia', 0.01);
  ctx.camara.position.set(-1, 9, 24); ctx.mira.set(-1, 0.5, 0);
};

H.inicio = async function (ctx) {
  const d = ctx.decir;
  await d(QUIEN.narrador, { es: 'El rey Darío puso ciento veinte gobernantes en su reino, y sobre ellos a tres jefes. Daniel era uno de los tres.',
    en: 'King Darius put one hundred and twenty rulers over his kingdom, and three leaders over them. Daniel was one of the three.' });
  await ctx.camaraA([TRONO[0] + 3.4, 2.3, TRONO[1] + 7.5], [TRONO[0], 1.3, TRONO[1] + 1.4], 2);
  await d(QUIEN.narrador, { es: 'Daniel hacía su trabajo mejor que todos, porque era fiel y honrado.',
    en: 'Daniel did his work better than all the others, because he was faithful and honest.' });
  await d(QUIEN.rey, { es: 'Daniel, eres fiel y trabajas muy bien. Pronto te pondré al frente de todo mi reino.',
    en: 'Daniel, you are faithful and you work very well. Soon I will put you over my whole kingdom.' }, { actor: A.rey, gesto: 'sit-talk' });
  await d(QUIEN.daniel, { es: 'Gracias, oh rey. Te serviré con honradez.', en: 'Thank you, O king. I will serve you honestly.' }, { actor: A.daniel });
  await ctx.camaraA([TRONO[0] - 1.2, 1.9, TRONO[1] + 8.6], [TRONO[0] - 3.2, 1.3, TRONO[1] + 4.4], 1.4);
  [A.gob1, A.gob2, A.gob3].forEach(a => ctx.mirarA(a, A.gob1.g.position.x - 0.4, A.gob1.g.position.z + 0.3));
  ctx.mirarA(A.gob1, A.gob3.g.position.x, A.gob3.g.position.z);
  await d(QUIEN.gobernadores, { es: 'Busquemos algo malo en Daniel… Pero no hace nada mal. Sólo lo podremos atrapar con la ley de su Dios.',
    en: 'Let us find something wrong with Daniel… But he does nothing wrong. We can only trap him with the law of his God.' }, { actor: [A.gob1, A.gob2, A.gob3] });
};

H.avanzar = async function (ctx) { await ctx.esperar(0.4); };

H.momentos = [
  async function decreto(ctx) {
    // Daniel se va a su casa; los gobernadores le proponen la ley al rey y él la firma
    ctx.mover(A.daniel, CASA[0] - 1, CASA[1] + 4, 6).then(() => ctx.mirarA(A.daniel, CASA[0], CASA[1]));
    await Promise.all([ctx.mover(A.gob1, TRONO[0] - 1.9, TRONO[1] + 2.3, 2.2), ctx.mover(A.gob2, TRONO[0] - 1, TRONO[1] + 3, 2.2), ctx.mover(A.gob3, TRONO[0] - 0.1, TRONO[1] + 3.5, 2.2)]);
    [A.gob1, A.gob2, A.gob3].forEach(a => ctx.mirarA(a, TRONO[0], TRONO[1]));
    await ctx.camaraA([TRONO[0] + 2.8, 2.2, TRONO[1] + 7.2], [TRONO[0], 1.3, TRONO[1] + 1.2], 1.6);
    await ctx.decir(QUIEN.gobernadores, { es: '¡Oh rey Darío, vive para siempre! Firma esta ley: durante treinta días, nadie podrá orar a ningún dios ni a ningún hombre, sino sólo a ti.',
      en: 'O King Darius, live forever! Sign this law: for thirty days, no one may pray to any god or any man, but only to you.' }, { actor: [A.gob1, A.gob2, A.gob3] });
    await ctx.decir(QUIEN.gobernadores, { es: 'Y el que no obedezca, será echado al foso de los leones.', en: 'And whoever does not obey will be thrown into the lions’ den.' }, { actor: A.gob1 });
    C.rollo.visible = true;
    await ctx.decir(QUIEN.rey, { es: 'Está bien. Firmo la ley, y nadie la podrá cambiar.', en: 'Very well. I sign the law, and no one can change it.' }, { actor: A.rey, gesto: 'sit-talk' });
    await ctx.decir(QUIEN.narrador, { es: 'Era una ley de los medos y los persas: una vez firmada, ni el mismo rey la podía cambiar.',
      en: 'It was a law of the Medes and Persians: once it was signed, not even the king could change it.' });
  },
  async function orar(ctx) {
    // en su casa, de rodillas ante la ventana abierta hacia Jerusalén, mañana, mediodía y tarde
    A.daniel.g.position.set(CASA[0] - 1, 0, CASA[1] + 3.6);
    await cielo(ctx, 'manana', 0.01);
    await ctx.camaraA([CASA[0] + 1.6, 1.8, CASA[1] + 2.6], [CASA[0] - 0.2, 1.2, ORA[1]], 1.4);
    await ctx.mover(A.daniel, ORA[0], ORA[1], 2.4);
    ctx.mirarA(A.daniel, ORA[0], ORA[1] - 10);
    await arrodillar(ctx, A.daniel);
    await Promise.all([
      ctx.decir(QUIEN.narrador, { es: 'Daniel supo que la ley estaba firmada. Pero fue a su casa, abrió la ventana que miraba hacia Jerusalén, se arrodilló y oró a Dios, tres veces al día, como siempre lo había hecho.',
        en: 'Daniel knew that the law had been signed. But he went home, opened the window that faced Jerusalem, knelt down and prayed to God three times a day, just as he had always done.' }),
      cielo(ctx, 'dia', 4).then(() => cielo(ctx, 'tarde', 4))
    ]);
    await ctx.camaraA([CASA[0] + 0.9, 1.4, ORA[1] + 2.4], [ORA[0], 1, ORA[1] - 0.6], 1.4);
    await ctx.decir(QUIEN.daniel, { es: 'Dios mío, gracias por cuidarme cada día. Sólo a ti te oro.', en: 'My God, thank you for taking care of me every day. I pray only to you.' }, deRodillas(A.daniel));
  },
  async function acusan(ctx) {
    // los gobernadores lo ven orando y van a decírselo al rey
    A.gob1.g.position.set(CASA[0] - 1.6, 0, CASA[1] + 6.5); A.gob2.g.position.set(CASA[0] - 0.4, 0, CASA[1] + 7.2); A.gob3.g.position.set(CASA[0] + 0.8, 0, CASA[1] + 6.6);
    await ctx.camaraA([CASA[0] + 3.4, 2.2, CASA[1] + 8.8], [CASA[0] - 0.4, 1.2, CASA[1] + 1], 1.6);
    await Promise.all([ctx.mover(A.gob1, CASA[0] - 1.6, CASA[1] + 3.6, 2), ctx.mover(A.gob2, CASA[0] - 0.4, CASA[1] + 4.2, 2), ctx.mover(A.gob3, CASA[0] + 0.8, CASA[1] + 3.6, 2)]);
    [A.gob1, A.gob2, A.gob3].forEach(a => ctx.mirarA(a, ORA[0], ORA[1]));
    await ctx.decir(QUIEN.gobernadores, { es: '¡Miren! Daniel está orando a su Dios. ¡Vamos a decírselo al rey!', en: 'Look! Daniel is praying to his God. Let’s go and tell the king!' }, { actor: A.gob1 });
    // ante el rey
    A.gob1.g.position.set(TRONO[0] - 1.9, 0, TRONO[1] + 2.3); A.gob2.g.position.set(TRONO[0] - 1, 0, TRONO[1] + 3); A.gob3.g.position.set(TRONO[0] - 0.1, 0, TRONO[1] + 3.5);
    [A.gob1, A.gob2, A.gob3].forEach(a => ctx.mirarA(a, TRONO[0], TRONO[1]));
    await ctx.camaraA([TRONO[0] + 2.8, 2.2, TRONO[1] + 7.2], [TRONO[0], 1.3, TRONO[1] + 1.2], 0.01);
    await ctx.decir(QUIEN.gobernadores, { es: 'Oh rey, Daniel no te obedece: no respeta tu ley, y tres veces al día ora a su Dios.',
      en: 'O king, Daniel does not obey you: he does not respect your law, and three times a day he prays to his God.' }, { actor: [A.gob1, A.gob2, A.gob3] });
    A.rey.reposo = null;
    await ctx.anim(A.rey, 'surprised', { una: true });
    await ctx.decir(QUIEN.rey, { es: '¡Oh, no! ¿Qué he hecho? ¡Daniel es mi amigo!', en: 'Oh no! What have I done? Daniel is my friend!' }, { actor: A.rey, gesto: 'argue' });
    await Promise.all([
      ctx.decir(QUIEN.narrador, { es: 'El rey se puso muy triste, y hasta que se puso el sol buscó la manera de salvar a Daniel.',
        en: 'The king was very sad, and until the sun went down he looked for a way to save Daniel.' }),
      cielo(ctx, 'tarde', 3)
    ]);
    await ctx.decir(QUIEN.gobernadores, { es: 'Recuerda, oh rey: una ley de los medos y los persas no se puede cambiar.',
      en: 'Remember, O king: a law of the Medes and Persians cannot be changed.' }, { actor: A.gob1 });
  },
  async function foso(ctx) {
    // los guardias llevan a Daniel al foso; el rey va detrás
    levantar(ctx, A.daniel); C.rollo.visible = false;
    A.daniel.g.position.set(BORDE[0] - 1.4, 0, BORDE[1] - 4);
    A.guardia1.g.position.set(BORDE[0] - 2.4, 0, BORDE[1] - 4.4); A.guardia2.g.position.set(BORDE[0] - 0.4, 0, BORDE[1] - 4.4);
    A.rey.g.position.set(BORDE[0] - 1.6, 0, BORDE[1] - 7.5);
    [A.gob1, A.gob2, A.gob3].forEach((a, i) => a.g.position.set(BORDE[0] - 5.5 + i * 0.9, 0, BORDE[1] - 3 - (i % 2)));
    [A.gob1, A.gob2, A.gob3].forEach(a => ctx.mirarA(a, FOSO[0], FOSO[1]));
    await ctx.camaraA([FOSO[0] + 6.5, 4.2, FOSO[1] + 2.5], [FOSO[0] - 1, 0.6, BORDE[1] - 1.5], 0.01);
    await Promise.all([
      ctx.mover(A.daniel, BORDE[0], BORDE[1], 2.6), ctx.mover(A.guardia1, BORDE[0] - 1.1, BORDE[1] - 0.3, 2.6),
      ctx.mover(A.guardia2, BORDE[0] + 1.1, BORDE[1] - 0.3, 2.6), ctx.mover(A.rey, BORDE[0] - 0.4, BORDE[1] - 2.4, 3)
    ]);
    ctx.mirarA(A.daniel, A.rey.g.position.x, A.rey.g.position.z);
    ctx.mirarA(A.rey, A.daniel.g.position.x, A.daniel.g.position.z);
    ctx.mover(A.guardia1, BORDE[0] - 2.2, BORDE[1] - 1.4, 0.6); ctx.mover(A.guardia2, BORDE[0] + 2.2, BORDE[1] - 1.4, 0.6)
      .then(() => { ctx.mirarA(A.guardia1, BORDE[0], BORDE[1]); ctx.mirarA(A.guardia2, BORDE[0], BORDE[1]); });
    await ctx.camaraA([BORDE[0] + 2.2, 2, BORDE[1] + 0.6], [BORDE[0] - 0.2, 1.3, BORDE[1] - 1.2], 1.4);
    await ctx.decir(QUIEN.rey, { es: 'Daniel, tu Dios, a quien siempre sirves, él te salvará.', en: 'Daniel, your God, whom you always serve, will save you.' }, { actor: A.rey });
    // lo bajan al foso
    ctx.mirarA(A.daniel, FOSO[0], FOSO[1]);
    await ctx.camaraA([FOSO[0] + 5, 4.6, FOSO[1] + 5.5], [FOSO[0], -2, FOSO[1]], 1.4);
    parar(ctx);
    C.leones.forEach(l => ctx.mirarA(l, BORDE[0], BORDE[1]));
    const y0 = 0, x0 = A.daniel.g.position.x, z0 = A.daniel.g.position.z, z1 = FOSO[1] - 1;
    await ctx.tween(0.8, u => { A.daniel.g.position.z = z0 + (FOSO[1] - R + 0.5 - z0) * u; A.daniel.g.position.x = x0; });
    await ctx.tween(1.4, u => { A.daniel.g.position.y = y0 - PROF * u; A.daniel.g.position.z = FOSO[1] - R + 0.5 + (z1 - FOSO[1] + R - 0.5) * u; });
    ctx.sonido('mal');
    // la piedra y el sello
    cielo(ctx, 'noche', 3);
    await ctx.tween(2.4, verTapa);
    C.sello.visible = true; ctx.sonido('bien');
    await ctx.decir(QUIEN.narrador, { es: 'Trajeron una piedra, la pusieron sobre la boca del foso, y el rey la selló con su anillo.',
      en: 'They brought a stone and placed it over the mouth of the den, and the king sealed it with his ring.' });
  },
  async function noche(ctx) {
    // el rey no duerme; dentro del foso, los leones y el ángel
    A.rey.g.position.set(TRONO[0], 0, TRONO[1]); ctx.mirarA(A.rey, TRONO[0], TRONO[1] + 5);
    if (A.rey.clips.sit) ctx.reposo(A.rey, 'sit');
    [A.guardia1, A.guardia2, A.gob1, A.gob2, A.gob3].forEach(a => { a.g.visible = false; });
    await ctx.camaraA([TRONO[0] + 2.4, 2, TRONO[1] + 5.4], [TRONO[0], 1.1, TRONO[1]], 0.01);
    await ctx.decir(QUIEN.narrador, { es: 'Esa noche el rey no quiso comer, y no pudo dormir.', en: 'That night the king would not eat, and he could not sleep.' });
    // en el foso: los leones se acercan
    ctx.mirarA(A.daniel, FOSO[0] + 2, FOSO[1] + 2);
    await ctx.camaraA([FOSO[0] + 2.4, -1.5, FOSO[1] + 2.1], [FOSO[0] - 0.3, -2.6, FOSO[1] - 0.8], 0.01);
    C.leones.forEach((l, i) => { l.ronda = false; if (l.clips.caminar) ctx.anim(l, 'caminar'); });
    await Promise.all(C.leones.map(l => {
      const ang = Math.atan2(l.g.position.z - A.daniel.g.position.z, l.g.position.x - A.daniel.g.position.x);
      return ctx.mover(l, A.daniel.g.position.x + Math.cos(ang) * 1.7, A.daniel.g.position.z + Math.sin(ang) * 1.7, 2.2);
    }));
    C.leones.forEach(l => { if (l.clips.quieto) ctx.anim(l, 'quieto'); });
    ctx.sonido('mal');
    await arrodillar(ctx, A.daniel);
    await ctx.decir(QUIEN.daniel, { es: 'Dios mío, en tus manos estoy.', en: 'My God, I am in your hands.' }, deRodillas(A.daniel));
    // el ángel
    A.angel.g.visible = true; ctx.mirarA(A.angel, A.daniel.g.position.x, A.daniel.g.position.z);
    ctx.sonido('angel');
    await ctx.tween(1.2, u => { C.luzAngel.intensity = 1.2 * u; });
    C.leones.forEach(l => { if (l.clips.caminar) ctx.anim(l, 'caminar'); });
    await Promise.all(C.leones.map((l, i) => {
      const th = l.th0;
      return ctx.mover(l, FOSO[0] + Math.cos(th) * 2.75, FOSO[1] + Math.sin(th) * 2.75, 1.8);
    }));
    C.leones.forEach(l => { if (l.clips.quieto) ctx.anim(l, 'quieto'); ctx.mirarA(l, A.daniel.g.position.x, A.daniel.g.position.z); });
    await ctx.decir(QUIEN.narrador, { es: 'Dios envió a su ángel, que cerró la boca de los leones. Los leones se echaron tranquilos, y no le hicieron ningún daño a Daniel.',
      en: 'God sent his angel, who shut the lions’ mouths. The lions lay down calmly and did not hurt Daniel at all.' });
  },
  async function madrugada(ctx) {
    // al amanecer el rey corre al foso
    await cielo(ctx, 'alba', 1.6);
    A.rey.reposo = null; ctx.anim(A.rey, 'idle');
    A.rey.g.position.set(BORDE[0] - 1.5, 0, BORDE[1] - 7);
    await ctx.camaraA([FOSO[0] + 6.5, 3.6, FOSO[1] - 1], [BORDE[0] - 0.6, 1, BORDE[1] - 3], 0.01);
    await Promise.all([
      ctx.mover(A.rey, BORDE[0], BORDE[1], 2.4),
      ctx.decir(QUIEN.narrador, { es: 'Muy de madrugada, el rey se levantó y fue corriendo al foso de los leones.',
        en: 'Very early in the morning, the king got up and hurried to the lions’ den.' })
    ]);
    ctx.mirarA(A.rey, FOSO[0], FOSO[1]);
    await ctx.tween(2, u => verTapa(1 - u));
    // desde dentro del foso: el rey asomado arriba
    levantar(ctx, A.daniel);
    ctx.mirarA(A.daniel, BORDE[0], BORDE[1]);
    await ctx.camaraA([FOSO[0] + 1.2, -1.8, FOSO[1] + 1.6], [BORDE[0], 1.2, BORDE[1]], 1.2);
    await ctx.decir(QUIEN.rey, { es: '¡Daniel, siervo del Dios vivo! ¿Pudo salvarte de los leones tu Dios, a quien siempre sirves?',
      en: 'Daniel, servant of the living God! Was your God, whom you always serve, able to save you from the lions?' }, { actor: A.rey, gesto: 'argue' });
    await ctx.camaraA([BORDE[0] + 1, 1.9, BORDE[1] + 0.2], [A.daniel.g.position.x, -2.4, A.daniel.g.position.z], 0.01);
    await ctx.decir(QUIEN.daniel, { es: '¡Oh rey, vive para siempre! Mi Dios envió a su ángel y cerró la boca de los leones, porque soy inocente delante de él, y tampoco te he hecho ningún mal a ti.',
      en: 'O king, live forever! My God sent his angel and shut the lions’ mouths, because I am innocent before him, and I have never done anything wrong to you either.' }, { actor: A.daniel });
    await ctx.tween(1, u => { C.luzAngel.intensity = 1.2 * (1 - u); });
    A.angel.g.visible = false;
  },
  async function salida(ctx) {
    // lo sacan sin un rasguño; el rey alaba al Dios de Daniel
    cielo(ctx, 'dia', 3);
    A.guardia1.g.visible = A.guardia2.g.visible = true;
    A.guardia1.g.position.set(BORDE[0] - 1.1, 0, BORDE[1] - 0.6); A.guardia2.g.position.set(BORDE[0] + 1.1, 0, BORDE[1] - 0.6);
    ctx.mirarA(A.guardia1, FOSO[0], FOSO[1]); ctx.mirarA(A.guardia2, FOSO[0], FOSO[1]);
    await Promise.all([ctx.mover(A.rey, BORDE[0] - 0.4, BORDE[1] - 2.6, 1.2), ctx.camaraA([FOSO[0] + 5.5, 3.2, FOSO[1] - 0.5], [BORDE[0], 0.4, BORDE[1] - 0.8], 1.4)]);
    ctx.mirarA(A.rey, BORDE[0], BORDE[1]);
    if (A.guardia1.clips.crouch) { ctx.anim(A.guardia1, 'crouch'); ctx.anim(A.guardia2, 'crouch'); }
    const x0 = A.daniel.g.position.x, z0 = A.daniel.g.position.z;
    await ctx.tween(1.8, u => {
      A.daniel.g.position.y = -PROF * (1 - u);
      A.daniel.g.position.x = x0 + (BORDE[0] - x0) * u; A.daniel.g.position.z = z0 + (BORDE[1] - 0.6 - z0) * u;
    });
    ctx.anim(A.guardia1, 'idle'); ctx.anim(A.guardia2, 'idle');
    ctx.mirarA(A.daniel, A.rey.g.position.x, A.rey.g.position.z);
    ctx.sonido('bien');
    ctx.mover(A.guardia1, BORDE[0] - 2.4, BORDE[1] - 1.2, 1); ctx.mover(A.guardia2, BORDE[0] - 1.6, BORDE[1] - 3.6, 1.4)
      .then(() => { ctx.mirarA(A.guardia1, A.daniel.g.position.x, A.daniel.g.position.z); ctx.mirarA(A.guardia2, A.daniel.g.position.x, A.daniel.g.position.z); });
    await ctx.camaraA([BORDE[0] + 2.6, 2.6, BORDE[1] + 2.6], [BORDE[0] - 0.2, 1.1, BORDE[1] - 1.4], 1.2);
    await ctx.decir(QUIEN.narrador, { es: 'El rey se alegró mucho y mandó sacar a Daniel del foso. No tenía ni un rasguño, porque había confiado en su Dios.',
      en: 'The king was very glad and ordered Daniel to be lifted out of the den. He did not have a single scratch, because he had trusted in his God.' });
    await ctx.decir(QUIEN.rey, { es: 'Ordeno que en todo mi reino todos respeten al Dios de Daniel, porque él es el Dios vivo, que salva y hace maravillas.',
      en: 'I order that everyone in my kingdom must respect the God of Daniel, because he is the living God, who saves and does wonders.' }, { actor: A.rey, gesto: 'point' });
  }
];

H.final = async function (ctx) {
  ctx.mirarA(A.daniel, BORDE[0] + 2.6, BORDE[1] + 0.9);
  await ctx.camaraA([BORDE[0] + 2.6, 1.7, BORDE[1] + 0.9], [BORDE[0], 1.3, BORDE[1] - 1], 1.6);
  await ctx.decir(QUIEN.daniel, { es: 'Habla con Dios cada día, como yo. Él siempre te escucha y te cuida.', en: 'Talk to God every day, as I do. He always listens to you and takes care of you.' }, { actor: A.daniel });
  await ctx.decir(QUIEN.narrador, { es: 'Daniel no dejó de orar aunque fuera peligroso, y Dios lo cuidó en el foso de los leones.',
    en: 'Daniel did not stop praying even when it was dangerous, and God kept him safe in the lions’ den.' });
};
})();
