/* Átomo a Átomo — lo que trae el juego para la sala (sin lección), sacado del catálogo de quimica.js:
   - MODOS: pedidos (armar lo que pide el cliente), balancear (reacciones en la balanza) y libre (el álbum).
   - temas(modo, grado): los temas de ese modo que ya tienen qué jugar en ese grado.
   - generar(modo, tema, grado): las tareas de una partida (pedidos, reacciones y preguntas que salen de la química:
     cuántos enlaces hace un átomo, cuántos átomos tiene una fórmula, la forma, la masa, los pares libres).
   - preguntaForma(mol, g): «¿Qué forma tiene…?» con la forma que da RPECV (quimica.js `formaMolecula`).
   Todo lo que se pregunta sale calculado del catálogo: no hay respuestas escritas a mano.
   window.AtomoContenido = { MODOS, TEMAS, temas, generar, preguntaForma, preguntasDe, elementosDe } */
(function () {
'use strict';
const Q = window.AtomoQuimica;
const barajar = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const pick = a => a[Math.floor(Math.random() * a.length)];
function q(p, buena, malas, extra) {
  const ops = barajar([String(buena)].concat(malas.map(String)).filter((o, i, a) => a.indexOf(o) === i)).slice(0, 4);
  if (ops.indexOf(String(buena)) < 0) ops[0] = String(buena);
  return Object.assign({ p, opciones: ops, correcta: ops.indexOf(String(buena)) }, extra || {});
}
const MODOS = {
  pedidos: { nombre: 'Pedidos', emoji: '🧪', frase: 'Llegan pedidos a la cocina: arma cada molécula uniendo átomos. Cada átomo tiene sus brazos: el H uno, el O dos, el N tres y el C cuatro.' },
  balancear: { nombre: 'Balancear', emoji: '⚖️', frase: 'Equilibra las reacciones: cambia cuántas moléculas entran y salen hasta que haya los mismos átomos a cada lado. La balanza dice si la masa se conserva.' },
  libre: { nombre: 'Laboratorio libre', emoji: '📒', frase: 'Arma lo que quieras. Cada molécula de verdad que descubras se guarda en tu álbum.' }
};
const TEMAS = {
  pedidos: [
    { id: 'vida', nombre: 'Las moléculas de la vida', emoji: '💧', desde: 6 },
    { id: 'aire', nombre: 'El aire y sus gases', emoji: '🌬️', desde: 6 },
    { id: 'casa', nombre: 'La química de la casa', emoji: '🏠', desde: 7 },
    { id: 'formas', nombre: 'Las formas de las moléculas', emoji: '📐', desde: 8 },
    { id: 'organica', nombre: 'Cadenas de carbono', emoji: '🔗', desde: 9 }
  ],
  balancear: [
    { id: 'sintesis', nombre: 'Síntesis y descomposición', emoji: '🧱', desde: 8 },
    { id: 'combustion', nombre: 'Combustión', emoji: '🔥', desde: 8 },
    { id: 'vida', nombre: 'Fotosíntesis y respiración', emoji: '🌱', desde: 9 },
    { id: 'metales', nombre: 'Metales, ácidos y sales', emoji: '🔩', desde: 9 }
  ],
  libre: [{ id: 'album', nombre: 'Descubre moléculas', emoji: '🔍', desde: 6 }]
};
/** Los elementos de la paleta por grado (en el modo libre y como distractores). */
function elementosDe(grado) { return grado >= 10 ? ['C', 'H', 'O', 'N', 'S', 'P', 'F', 'Cl', 'Br', 'I'] : grado >= 8 ? ['C', 'H', 'O', 'N', 'S', 'Cl'] : ['C', 'H', 'O', 'N']; }
const molsDe = (tema, grado) => Q.MOLECULAS.filter(m => m.armar && m.grado <= grado && m.temas.indexOf(tema) >= 0);
const reacsDe = (tema, grado) => Q.REACCIONES.filter(r => r.grado <= Math.max(grado, 8) && r.temas.indexOf(tema) >= 0);
function temas(modo, grado) {
  return (TEMAS[modo] || []).filter(t => modo === 'libre' || (t.desde <= grado && (modo === 'pedidos' ? molsDe(t.id, grado).length >= 3 : reacsDe(t.id, grado).length >= 2)));
}

/* ---------- las preguntas, calculadas ---------- */
const nAtomos = c => Object.values(c).reduce((a, b) => a + b, 0);
function preguntaForma(mol, g) {
  const f = Q.formaMolecula(g || mol.g); if (!f || f.centro < 0) return null; // dos átomos solos: siempre lineal, no hay qué preguntar
  const buena = Q.FORMAS[f.forma].nombre;
  const otras = barajar(Object.keys(Q.FORMAS).filter(k => k !== f.forma).map(k => Q.FORMAS[k].nombre)).slice(0, 2);
  const cen = f.centro >= 0 ? (g || mol.g).sim[f.centro] : '';
  const geo = f.centro >= 0 ? Q.geometria(g || mol.g, f.centro) : null;
  const porque = geo ? 'El ' + Q.ELEM[cen].nombre.toLowerCase() + ' tiene ' + geo.enlazados + ' vecinos y ' + (geo.pares ? geo.pares + (geo.pares === 1 ? ' par libre' : ' pares libres') : 'ningún par libre') + ': ' + buena + (mol.angulo ? ' (' + mol.angulo + ')' : '') + '.'
    : '';
  return q('📐 ¿Qué forma tiene ' + (mol.nombre ? 'el ' + mol.nombre : 'esta molécula') + '?', buena, otras, { porque, forma: f.forma });
}
function preguntasDe(grado, mols) {
  const out = [];
  const els = elementosDe(grado).filter(s => s !== 'H' || grado < 8);
  // cuántos enlaces hace un átomo
  const s = pick(els.filter(x => ['C', 'N', 'O', 'H', 'S', 'Cl'].indexOf(x) >= 0));
  const e = Q.ELEM[s];
  out.push(q('🖐️ ¿Cuántos enlaces (brazos) hace el ' + e.nombre.toLowerCase() + ' (' + s + ')?', e.val, [1, 2, 3, 4].filter(v => v !== e.val).slice(0, 2), { porque: s === 'H' ? 'El H tiene 1 electrón y le falta 1 para llegar a 2: hace 1 enlace.' : 'El ' + s + ' tiene ' + e.ve + ' electrones de valencia y le faltan ' + e.val + ' para llegar a 8: hace ' + e.val + (e.val === 1 ? ' enlace.' : ' enlaces.') }));
  // cuántos átomos tiene una fórmula
  const m = pick(mols.length ? mols : Q.MOLECULAS.filter(x => x.armar && x.grado <= grado));
  const n = nAtomos(m.cuenta);
  out.push(q('🔢 ¿Cuántos átomos tiene una molécula de ' + Q.sub(m.hill) + ' (' + m.nombre + ')?', n, [n - 1, n + 1, n + 2].filter(v => v > 0), { porque: Object.keys(m.cuenta).map(k => m.cuenta[k] + ' ' + k).join(' + ') + ' = ' + n + ' átomos.' }));
  if (grado >= 9) {
    // la masa de una molécula (u)
    const MASA = { H: 1, C: 12, N: 14, O: 16, S: 32 };
    const mm = pick(Q.MOLECULAS.filter(x => x.armar && x.grado <= grado && nAtomos(x.cuenta) <= 6 && Object.keys(x.cuenta).every(k => MASA[k])));
    const buena = Object.keys(mm.cuenta).reduce((t, k) => t + MASA[k] * mm.cuenta[k], 0), malas = [buena + 2, buena - 2, buena + 16].filter(v => v > 0);
    out.push(q('⚖️ ¿Cuánto pesa una molécula de ' + Q.sub(mm.hill) + '? (H = 1, C = 12, N = 14, O = 16, S = 32)', buena + ' u', malas.map(v => v + ' u'), { porque: Object.keys(mm.cuenta).map(k => mm.cuenta[k] + ' × ' + MASA[k]).join(' + ') + ' = ' + buena + ' u.' }));
  }
  if (grado >= 10) {
    const pl = pick(['N', 'O', 'S', 'Cl']), e2 = Q.ELEM[pl];
    out.push(q('🟣 ¿Cuántos pares de electrones libres tiene el ' + e2.nombre.toLowerCase() + ' cuando hace todos sus enlaces?', e2.libres, [0, 1, 2, 3].filter(v => v !== e2.libres).slice(0, 2), { porque: e2.ve + ' electrones de valencia − ' + e2.val + ' en enlaces = ' + (e2.ve - e2.val) + ': ' + e2.libres + ' pares libres.' }));
  }
  return barajar(out);
}

/* ---------- una partida de la sala ---------- */
function generar(modo, tema, grado) {
  if (modo === 'libre') return [{ tipo: 'libre' }];
  if (modo === 'balancear') {
    let rs = reacsDe(tema, grado);
    if (rs.length < 5) rs = rs.concat(barajar(Q.REACCIONES.filter(r => r.grado <= Math.max(grado, 8) && rs.indexOf(r) < 0)).slice(0, 5 - rs.length));
    rs = barajar(rs).slice(0, 5).sort((a, b) => Math.max(...a.coef) - Math.max(...b.coef));
    const ts = rs.map(r => ({ tipo: 'balancear', r, item: true }));
    const pr = preguntasDe(grado, []).find(x => /pesa/.test(x.p)) || preguntasDe(grado, [])[0];
    ts.splice(3, 0, { tipo: 'pregunta', q: pr, item: true });
    return ts;
  }
  let ms = molsDe(tema, grado);
  ms = barajar(ms).slice(0, 6).sort((a, b) => nAtomos(a.cuenta) - nAtomos(b.cuenta));
  const ts = [];
  const ps = preguntasDe(grado, ms);
  ms.forEach((m, i) => {
    ts.push({ tipo: 'armar', obj: { mol: m, cuenta: m.cuenta, formula: m.hill, nombre: m.nombre, exacta: true }, item: true });
    if (tema === 'formas') { const pf = preguntaForma(m); if (pf) ts.push({ tipo: 'pregunta', q: pf, item: true, conMol: true }); }
    else if ((i === 1 || i === 3) && ps.length) ts.push({ tipo: 'pregunta', q: ps.shift(), item: true });
  });
  return ts;
}

window.AtomoContenido = { MODOS, TEMAS, temas, generar, preguntaForma, preguntasDe, elementosDe, q, barajar };
})();
