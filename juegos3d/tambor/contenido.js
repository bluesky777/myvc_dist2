/* Tambor Bailarín — lo que se toca: las sílabas del inglés (con su acento), los pasos de baile, las danzas de Colombia y
   el contar saltando. Para las preguntas de la sala por materia y grado usa el banco del Rally (../rally/contenido.js).
   window.TamborContenido = { silabas(en), PASOS, paso(nombre), DANZAS, preguntasDanza(n, grado), temas(materia, grado),
     palabrasDe(tema, grado), SECUENCIAS, contarDe(n, hasta) } */
(function () {
'use strict';

/* LAS SÍLABAS. Cada palabra partida en sílabas, la del acento en MAYÚSCULAS (BA-na-na no: ba-NA-na). Las de una sola
   sílaba no hace falta escribirlas (se cuentan solas); sólo las que la cuenta automática se equivoca (TIRED, ASKED…).
   Los números en -teen llevan el acento al final dichos solos (thir-TEEN) y los de -ty al principio (THIR-ty). */
const DIC = (
  // números
  'ZE-ro SEV-en e-LEV-en TWELVE thir-TEEN four-TEEN fif-TEEN six-TEEN sev-en-TEEN eigh-TEEN nine-TEEN TWEN-ty THIR-ty FOR-ty FIF-ty ' +
  'SIX-ty SEV-en-ty EIGH-ty NINE-ty HUN-dred THOU-sand ' +
  // colores
  'YEL-low OR-ange PUR-ple IN-di-go VI-o-let COL-or COL-ors RAIN-bow SIL-ver GOLD-en ' +
  // animales
  'EL-e-phant MON-key TI-ger RAB-bit BUT-ter-fly CHICK-en DON-key ZE-bra gi-RAFFE HIP-po CROC-o-dile TUR-tle PAR-rot ROOST-er PEA-cock ' +
  'TOU-can ma-CAW JAG-uar OS-trich RA-ven CON-dor HUM-ming-bird LI-on LI-on-ess KIT-ten PUP-py AN-i-mal AN-i-mals SPI-der DOL-phin ' +
  'PEN-guin kan-ga-ROO IN-sect BEE-tle LIZ-ard SQUIR-rel CAM-el TUR-key EA-gle ' +
  // comida
  'ba-NA-na ba-NA-nas AP-ple AP-ples MAN-go GUA-va PINE-ap-ple STRAW-ber-ry WA-ter-mel-on CAR-rot to-MA-to po-TA-to WA-ter CAN-dy ' +
  'CHOC-o-late SAND-wich COOK-ie PIZ-za HAM-bur-ger a-RE-pa a-RE-pas em-pa-NA-da em-pa-NA-das CO-co-nut SO-da LEM-on CHER-ry ' +
  'HON-ey BUT-ter SU-gar SAL-ad OR-an-ges CHEESE JUICE GRAPES ON-ion PEP-per PUMP-kin BREAK-fast DIN-ner LUNCH COF-fee ' +
  // familia y cuerpo
  'MOTH-er FA-ther SIS-ter BROTH-er BROTH-ers GRAND-moth-er GRAND-fa-ther GRAND-ma GRAND-pa BA-by FAM-i-ly UN-cle COUS-in DAUGH-ter ' +
  'SHOUL-ders FIN-gers BEL-ly BOD-y CHIL-dren PEO-ple WOM-an NEIGH-bor ' +
  // colegio
  'PEN-cil e-RAS-er CRAY-on SCIS-sors TEACH-er BACK-pack NOTE-book RU-ler CLASS-room STU-dent PA-per com-PU-ter TA-ble LI-brar-y ' +
  'PLAY-ground CLASS-mate AL-pha-bet LET-ter LET-ters STO-ry MU-sic HOME-work PIC-ture ' +
  // días, meses y tiempo
  'MON-day TUES-day WEDNES-day THURS-day FRI-day SAT-ur-day SUN-day to-DAY to-MOR-row YES-ter-day JAN-u-ar-y FEB-ru-ar-y A-pril ' +
  'ju-LY AU-gust sep-TEM-ber oc-TO-ber no-VEM-ber de-CEM-ber MORN-ing af-ter-NOON EVE-ning BIRTH-day HOL-i-day va-CA-tion ' +
  'SUN-ny RAIN-y CLOUD-y WIN-dy SNOW-y WEATH-er SUM-mer WIN-ter ' +
  // cómo estoy, cómo es
  'HAP-py AN-gry HUN-gry THIRST-y SLEEP-y TIRED SCARED BORED sur-PRISED ex-CIT-ed NER-vous WOR-ried a-FRAID HEAV-y DIR-ty EMP-ty ' +
  'PRET-ty FUN-ny NOIS-y QUI-et EAS-y DIF-fi-cult HEALTH-y HON-est GEN-tle GEN-er-ous FAITH-ful GRATE-ful THANK-ful HELP-ful CU-ri-ous ' +
  'JEAL-ous po-LITE BEAU-ti-ful WON-der-ful CLEV-er LAZ-y BRAVE ' +
  // lugares y oficios
  'KITCH-en BED-room BATH-room GAR-den MAR-ket HOS-pi-tal CIT-y MOUN-tain RIV-er IS-land DES-ert FOR-est O-cean PLAN-et WIN-dow ' +
  'MIR-ror OF-fice TEM-ple co-LOM-bi-a SU-per-mar-ket RES-tau-rant DOC-tor FARM-er FIRE-fight-er DRI-ver PI-lot po-LICE SING-er DAN-cer ' +
  'NURSE CHEF ' +
  // música
  'gui-TAR ma-RA-cas ma-RIM-ba ac-COR-di-on TRUM-pet pi-AN-o vi-o-LIN DRUM-mer ' +
  // acciones
  'LIS-ten AN-swer O-pen SWIM-ming RUN-ning READ-ing DRAW-ing SLEEP-ing EAT-ing PLAY-ing SING-ing DANC-ing WALK-ing COOK-ing ' +
  'WRIT-ing JUMP-ing ASKED CALLED LOOKED LOVED LIVED WALKED TOUCHED KISSED PLAYED STOPPED CHANGED CLIMBED ' +
  // palabras de todos los días
  'HEL-lo good-BYE SOR-ry WEL-come PAR-ty CHRIST-mas AL-ways NEV-er SOME-times US-u-al-ly OF-ten AF-ter be-FORE a-GAIN a-BOUT ' +
  'be-CAUSE to-GETH-er EV-er-y MAN-y VER-y EAR-ly LAT-er ROB-ot bal-LOON PRES-ent CAN-dles PHO-to SMART-phone FLOW-er FLOW-ers ' +
  'GAR-bage re-CY-cle pol-LUTE en-VI-ron-ment SOC-cer BAS-ket-ball VOL-ley-ball BAS-ket MED-i-cine CIR-cle TRI-an-gle REC-tan-gle ' +
  'O-val DI-a-mond SQUARE MIN-utes SEC-ond PROM-ise WA-ter HOUSE ' +
  // de las lecciones cristianas
  'JE-sus AN-gel AN-gels HEAV-en BLESS-ing MER-cy BI-ble SHEP-herd MAN-ger BETH-le-hem MO-ses DA-vid MA-ry JO-seph NO-ah DAN-iel ' +
  'JO-nah PE-ter SAM-u-el go-LI-ath JA-cob e-LI-jah'
).split(/\s+/).filter(Boolean);
const SIL = {};
DIC.forEach(x => { const partes = x.split('-'), en = partes.join('').toLowerCase(); SIL[en] = partes.map(p => ({ t: p.toLowerCase(), f: p === p.toUpperCase() && /[A-Z]/.test(p) })); });
// una sola sílaba, contada: sin la e muda, sin el -ed y el -es que no suenan
function contar1(w) {
  let x = w.toLowerCase();
  if (/[^td]ed$/.test(x)) x = x.slice(0, -2);
  else if (/[^sxzhcg]es$/.test(x)) x = x.slice(0, -2);
  else if (/[^l]e$/.test(x) || /[aeiou]le$/.test(x)) x = x.slice(0, -1);
  const g = x.replace(/^y/, '').match(/[aeiouy]+/g);
  return g ? g.length : 1;
}
/** Las sílabas de una palabra inglesa: [{t, f}] (f = la del acento), o null si no se sabe (se juega de otra forma). */
function silabas(en) {
  const w = String(en || '').trim().toLowerCase();
  if (!/^[a-z']+$/.test(w)) return null;
  const k = w.replace(/'/g, '');
  if (SIL[k]) return SIL[k];
  if (contar1(k) === 1) return [{ t: w, f: true }];
  return null;
}

/* LOS PASOS DE BAILE (los que manda la lección en `pasos`) */
const PASOS = {
  adelante: { nombre: 'Adelante', emoji: '⬆️', frase: 'un paso adelante' },
  atras: { nombre: 'Atrás', emoji: '⬇️', frase: 'un paso atrás' },
  derecha: { nombre: 'Derecha', emoji: '➡️', frase: 'un paso a la derecha' },
  izquierda: { nombre: 'Izquierda', emoji: '⬅️', frase: 'un paso a la izquierda' },
  giro: { nombre: 'Giro', emoji: '🔄', frase: 'una vuelta' },
  palmas: { nombre: 'Palmas', emoji: '👏', frase: 'aplaudir' },
  salto: { nombre: 'Salto', emoji: '⭐', frase: 'un salto' },
  basico: { nombre: 'Paso básico', emoji: '💃', frase: 'el paso básico' },
  desplazamiento: { nombre: 'Desplazamiento', emoji: '↔️', frase: 'moverse de lado' },
  remate: { nombre: 'Remate', emoji: '🎉', frase: 'el final, con pose' },
  zapateo: { nombre: 'Zapateo', emoji: '👞', frase: 'golpear el piso con los pies' },
  panuelo: { nombre: 'Pañuelo', emoji: '🧣', frase: 'agitar el pañuelo' }
};
const sinTilde = s => String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z]/g, '');
const ALIAS = { pasobasico: 'basico', palma: 'palmas', aplauso: 'palmas', vuelta: 'giro', pañuelo: 'panuelo', saltar: 'salto' };
/** El paso de un nombre («Atrás», «atras», «paso básico»): su id o null. */
function paso(n) { const k = sinTilde(n); return PASOS[k] ? k : ALIAS[k] && PASOS[ALIAS[k]] ? ALIAS[k] : null; }
// las secuencias de la sala: [paso, pulsos]
const SECUENCIAS = {
  cuatro: { nombre: 'Cuatro pasos', emoji: '👣', desde: 0, s: [['adelante', 1], ['atras', 1], ['giro', 1], ['palmas', 1]] },
  ronda: { nombre: 'La ronda', emoji: '⭕', desde: 1, s: [['derecha', 1], ['derecha', 1], ['izquierda', 1], ['izquierda', 1], ['palmas', 1], ['palmas', 1], ['giro', 2]] },
  ocho: { nombre: 'Ocho pulsos', emoji: '💃', desde: 4, s: [['basico', 2], ['giro', 1], ['palmas', 1], ['desplazamiento', 2], ['basico', 2]] },
  llanera: { nombre: 'Zapateo llanero', emoji: '👞', desde: 5, s: [['zapateo', 1], ['zapateo', 1], ['giro', 1], ['basico', 2], ['zapateo', 1], ['remate', 2]] },
  panuelo: { nombre: 'El pañuelo', emoji: '🧣', desde: 5, s: [['basico', 2], ['panuelo', 2], ['giro', 1], ['palmas', 1], ['panuelo', 2]] }
};

/* LAS DANZAS (art-3-u2-l04 y art-6-u1-l04): región, vestuario, compás e instrumentos; preguntas para la sala. */
const DANZAS = {
  cumbia: { region: 'Caribe', prenda: 'la pollera ancha y el sombrero vueltiao', compas: 2, ins: 'el tambor alegre y la gaita' },
  mapale: { region: 'Caribe', prenda: 'ropa ligera, para bailar con mucha energía', compas: 2, ins: 'los tambores y las palmas' },
  bambuco: { region: 'Andes', prenda: 'el pañuelo que se agita', compas: 3, ins: 'el tiple y la bandola' },
  sanjuanero: { region: 'Andes (Huila)', prenda: 'el sombrero y el pañuelo', compas: 3, ins: 'el tiple y la tambora' },
  joropo: { region: 'Llanos', prenda: 'el sombrero, el liquiliqui y las alpargatas', compas: 3, ins: 'el arpa llanera, el cuatro y las maracas' },
  currulao: { region: 'Pacífico', prenda: 'el pañuelo y la ropa blanca', compas: 2, ins: 'la marimba de chonta y los cununos' }
};
const NOMBRES = { cumbia: 'cumbia', mapale: 'mapalé', bambuco: 'bambuco', sanjuanero: 'sanjuanero', joropo: 'joropo', currulao: 'currulao' };
const barajar = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
function q(p, buena, malas) { const ops = barajar([buena].concat(malas).filter((o, i, a) => a.indexOf(o) === i)); return { p, opciones: ops, correcta: ops.indexOf(buena) }; }
const REG = { Caribe: '🏝️ Caribe', Andes: '⛰️ Andes', 'Andes (Huila)': '⛰️ Andes', Llanos: '🐎 Llanos', 'Pacífico': '🌊 Pacífico' };
/** Preguntas de las danzas: región (desde 1.º), prenda e instrumentos (desde 3.º), compás (desde 5.º). */
function preguntasDanza(n, grado) {
  const out = [], ds = Object.keys(DANZAS).filter(d => grado >= 5 || ['cumbia', 'bambuco', 'joropo', 'currulao'].indexOf(d) >= 0);
  const regiones = ['🏝️ Caribe', '⛰️ Andes', '🐎 Llanos', '🌊 Pacífico'];
  barajar(ds).forEach(d => {
    const D = DANZAS[d], N = NOMBRES[d], r = REG[D.region];
    out.push(q('¿De qué región es el ' + (d === 'cumbia' ? 'baile de la cumbia' : N) + '?', r, barajar(regiones.filter(x => x !== r)).slice(0, 2)));
    if (grado >= 3) {
      const otras = barajar(ds.filter(x => x !== d && DANZAS[x].ins !== D.ins)).slice(0, 2).map(x => DANZAS[x].ins);
      out.push(q('¿Qué instrumentos suenan en el ' + N + '?', D.ins, otras));
    }
    if (grado >= 5) out.push(q('Cuenta los pulsos: ¿en cuántos se baila el ' + N + '?', 'En ' + D.compas, ['En ' + (D.compas === 2 ? 3 : 2)]));
  });
  if (grado >= 3) {
    out.push(q('¿Con qué danza va la pollera ancha y el sombrero vueltiao?', 'Cumbia', ['Joropo', 'Bambuco']));
    out.push(q('¿Con qué danza van las alpargatas y el sombrero llanero?', 'Joropo', ['Cumbia', 'Currulao']));
  }
  out.push(q('Bailar es mover el cuerpo al…', '🥁 pulso', ['🌙 silencio', '🎨 color']));
  return barajar(out).slice(0, n);
}

/* LA SALA: los temas de cada materia. Inglés: las palabras con sus sílabas, por tema y grado. */
const VOC = {
  frutas: { nombre: 'Frutas y comida', emoji: '🍌', desde: 0, w: [['banana', 'banano', '🍌'], ['apple', 'manzana', '🍎'], ['mango', 'mango', '🥭'], ['orange', 'naranja', '🍊'], ['water', 'agua', '💧'],
    ['pineapple', 'piña', '🍍'], ['strawberry', 'fresa', '🍓'], ['watermelon', 'sandía', '🍉'], ['tomato', 'tomate', '🍅'], ['potato', 'papa', '🥔'], ['chicken', 'pollo', '🍗'], ['arepa', 'arepa', '🫓'],
    ['cheese', 'queso', '🧀'], ['bread', 'pan', '🍞'], ['juice', 'jugo', '🧃'], ['lemon', 'limón', '🍋'], ['coconut', 'coco', '🥥'], ['carrot', 'zanahoria', '🥕']] },
  animales: { nombre: 'Animales', emoji: '🐒', desde: 0, w: [['monkey', 'mono', '🐒'], ['elephant', 'elefante', '🐘'], ['tiger', 'tigre', '🐯'], ['rabbit', 'conejo', '🐰'], ['butterfly', 'mariposa', '🦋'],
    ['donkey', 'burro', '🐴'], ['zebra', 'cebra', '🦓'], ['giraffe', 'jirafa', '🦒'], ['crocodile', 'cocodrilo', '🐊'], ['turtle', 'tortuga', '🐢'], ['parrot', 'loro', '🦜'], ['toucan', 'tucán', '🐦'],
    ['jaguar', 'jaguar', '🐆'], ['lion', 'león', '🦁'], ['dog', 'perro', '🐶'], ['cat', 'gato', '🐱'], ['frog', 'rana', '🐸'], ['spider', 'araña', '🕷️'], ['dolphin', 'delfín', '🐬']] },
  numeros: { nombre: 'Números', emoji: '🔢', desde: 1, w: [['seven', 'siete', '7️⃣'], ['eleven', 'once', '11'], ['twelve', 'doce', '12'], ['thirteen', 'trece', '13'], ['thirty', 'treinta', '30'],
    ['fourteen', 'catorce', '14'], ['forty', 'cuarenta', '40'], ['fifteen', 'quince', '15'], ['fifty', 'cincuenta', '50'], ['twenty', 'veinte', '20'], ['eighteen', 'dieciocho', '18'], ['eighty', 'ochenta', '80'],
    ['one', 'uno', '1️⃣'], ['three', 'tres', '3️⃣'], ['zero', 'cero', '0️⃣'], ['hundred', 'cien', '💯']] },
  colores: { nombre: 'Colores', emoji: '🎨', desde: 0, w: [['yellow', 'amarillo', '🟡'], ['orange', 'naranja', '🟠'], ['purple', 'morado', '🟣'], ['red', 'rojo', '🔴'], ['blue', 'azul', '🔵'],
    ['green', 'verde', '🟢'], ['rainbow', 'arcoíris', '🌈'], ['silver', 'plateado', '🥈'], ['color', 'color', '🎨'], ['pink', 'rosado', '🌸']] },
  familia: { nombre: 'Familia', emoji: '👪', desde: 1, w: [['mother', 'mamá', '👩'], ['father', 'papá', '👨'], ['sister', 'hermana', '👧'], ['brother', 'hermano', '👦'], ['baby', 'bebé', '👶'],
    ['grandmother', 'abuela', '👵'], ['grandfather', 'abuelo', '👴'], ['family', 'familia', '👪'], ['uncle', 'tío', '🧔'], ['cousin', 'primo', '🧒'], ['shoulders', 'hombros', '🤷'], ['fingers', 'dedos', '🖐️']] },
  colegio: { nombre: 'El colegio', emoji: '🏫', desde: 1, w: [['pencil', 'lápiz', '✏️'], ['eraser', 'borrador', '🧽'], ['teacher', 'profesor', '🧑‍🏫'], ['scissors', 'tijeras', '✂️'], ['crayon', 'crayola', '🖍️'],
    ['backpack', 'maleta', '🎒'], ['notebook', 'cuaderno', '📓'], ['ruler', 'regla', '📏'], ['computer', 'computador', '💻'], ['table', 'mesa', '🪑'], ['paper', 'papel', '📄'], ['library', 'biblioteca', '📚'], ['book', 'libro', '📕']] },
  dias: { nombre: 'Días y meses', emoji: '📅', desde: 3, w: [['monday', 'lunes', '📅'], ['tuesday', 'martes', '📅'], ['wednesday', 'miércoles', '📅'], ['thursday', 'jueves', '📅'], ['friday', 'viernes', '📅'],
    ['saturday', 'sábado', '📅'], ['sunday', 'domingo', '📅'], ['today', 'hoy', '📍'], ['tomorrow', 'mañana', '➡️'], ['yesterday', 'ayer', '⬅️'], ['january', 'enero', '❄️'], ['april', 'abril', '🌷'],
    ['july', 'julio', '☀️'], ['september', 'septiembre', '🍂'], ['october', 'octubre', '🎃'], ['december', 'diciembre', '🎄'], ['birthday', 'cumpleaños', '🎂']] },
  sentir: { nombre: 'Cómo me siento', emoji: '😀', desde: 2, w: [['happy', 'feliz', '😀'], ['angry', 'enojado', '😠'], ['hungry', 'con hambre', '😋'], ['sleepy', 'con sueño', '😴'], ['tired', 'cansado', '😩'],
    ['scared', 'asustado', '😨'], ['excited', 'emocionado', '🤩'], ['surprised', 'sorprendido', '😮'], ['sad', 'triste', '😢'], ['thirsty', 'con sed', '🥤'], ['funny', 'chistoso', '🤣'], ['beautiful', 'hermoso', '🌺']] },
  lugares: { nombre: 'Lugares y oficios', emoji: '🏠', desde: 3, w: [['kitchen', 'cocina', '🍳'], ['bedroom', 'habitación', '🛏️'], ['bathroom', 'baño', '🛁'], ['garden', 'jardín', '🌻'], ['market', 'mercado', '🏪'],
    ['hospital', 'hospital', '🏥'], ['mountain', 'montaña', '⛰️'], ['river', 'río', '🏞️'], ['island', 'isla', '🏝️'], ['doctor', 'médico', '🩺'], ['farmer', 'granjero', '🧑‍🌾'], ['firefighter', 'bombero', '🧑‍🚒'],
    ['pilot', 'piloto', '✈️'], ['police', 'policía', '👮'], ['dancer', 'bailarín', '💃'], ['singer', 'cantante', '🎤']] },
  musica: { nombre: 'La música', emoji: '🎸', desde: 2, w: [['guitar', 'guitarra', '🎸'], ['maracas', 'maracas', '🎶'], ['marimba', 'marimba', '🎹'], ['drum', 'tambor', '🥁'], ['music', 'música', '🎵'],
    ['dancing', 'bailando', '💃'], ['singing', 'cantando', '🎤'], ['piano', 'piano', '🎹'], ['violin', 'violín', '🎻'], ['trumpet', 'trompeta', '🎺'], ['accordion', 'acordeón', '🪗'], ['party', 'fiesta', '🎉']] }
};
const MATERIAS = {
  ingles: { nombre: 'Inglés', emoji: '🗣️', frase: 'Escucha la palabra y toca un golpe por sílaba: el fuerte, en la del acento.' },
  danza: { nombre: 'Danza', emoji: '💃', frase: 'Marca el pulso y sigue los pasos al compás de la música.' },
  matematicas: { nombre: 'Matemáticas', emoji: '🔢', frase: 'Cuenta saltando al ritmo: de 2 en 2, de 3 en 3… y responde al compás.' },
  ciencias: { nombre: 'Ciencias', emoji: '🔬', frase: 'Toca la respuesta correcta cuando la fila llegue a la línea.' },
  sociales: { nombre: 'Sociales', emoji: '🗺️', frase: 'Toca la respuesta correcta cuando la fila llegue a la línea.' }
};
// contar saltando por grado: de cuánto en cuánto
const SALTOS = g => (g <= 1 ? [2, 5, 10] : g === 2 ? [2, 3, 5, 10] : g === 3 ? [3, 4, 6, 9] : g === 4 ? [6, 7, 8, 9] : [7, 8, 9, 11, 12]);
/** Los temas de la sala: [{id, nombre, emoji}] */
function temas(m, g, rc) {
  if (m === 'ingles') return Object.keys(VOC).filter(k => g >= VOC[k].desde).map(k => ({ id: k, nombre: VOC[k].nombre, emoji: VOC[k].emoji }));
  if (m === 'danza') {
    const t = Object.keys(SECUENCIAS).filter(k => g >= SECUENCIAS[k].desde).map(k => ({ id: 'sec:' + k, nombre: SECUENCIAS[k].nombre, emoji: SECUENCIAS[k].emoji }));
    t.unshift({ id: 'pulso', nombre: 'Marca el pulso', emoji: '💓' });
    if (g >= 1) t.push({ id: 'danzas', nombre: 'Danzas de Colombia', emoji: '🇨🇴' });
    return t;
  }
  if (m === 'matematicas') {
    const t = SALTOS(g).map(n => ({ id: 'contar:' + n, nombre: 'De ' + n + ' en ' + n, emoji: '🦘' }));
    if (rc) rc.temas('matematicas', g).filter(x => x.id !== 'mezcla').slice(0, 4).forEach(x => t.push(x));
    return t;
  }
  return rc ? rc.temas(m, g) : [];
}
/** Las palabras de un tema de inglés para un grado: [{en, es, emoji}] */
function palabrasDe(tema, g) {
  const v = VOC[tema] || VOC.frutas;
  return v.w.map(([en, es, emoji]) => ({ en, es, emoji }));
}
/** Contar de n en n: los números de la cuenta hasta `hasta` veces. */
function contarDe(n, hasta) { const out = []; for (let i = 1; i <= hasta; i++) out.push(n * i); return out; }

window.TamborContenido = { silabas, PASOS, paso, SECUENCIAS, DANZAS, NOMBRES, preguntasDanza, VOC, MATERIAS, SALTOS, temas, palabrasDe, contarDe };
})();
