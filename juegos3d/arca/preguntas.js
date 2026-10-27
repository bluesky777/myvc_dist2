/* global module */
/* Two by Two — las preguntas, sin DOM ni three (UMD: <script> en el juego, require en Node).
   armar(D, especie, grado, azar) → { tipo, texto, ops: [..3], correcta, pista }.
   frases(D, quien) → el inglés que puede decir el juego, una vez cada frase; quien = 'noe' sólo lo de Noé:
     node -e "global.window={};require('./datos.js');console.log(require('./preguntas.js').frases(window.DATOS_ARCA).join('\n'))" > FRASES.txt
     node -e "global.window={};require('./datos.js');console.log(require('./preguntas.js').frases(window.DATOS_ARCA,'noe').join('\n'))" > FRASES-NOE.txt
   slug(texto) → el nombre del MP3 en <biblioteca>/voz/en/ (igual que voz-grabada.ts y tools/voz.py). */
(function (raiz, fabrica) {
  if (typeof module === 'object' && module.exports) module.exports = fabrica();
  else raiz.PreguntasArca = fabrica();
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';
  const rellenar = (t, o) => String(t).replace(/\{(\w+)\}/g, (_, k) => (o[k] != null ? o[k] : ''));
  const slug = t => String(t).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  const barajar = (a, azar) => { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(azar() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const tomar = (lista, n, azar) => barajar(lista.slice(), azar).slice(0, n);
  const unicos = a => a.filter((x, i) => x != null && a.indexOf(x) === i);

  function banda(D, grado) {
    const g = D.grados.find(x => x.id === grado) || D.grados[0];
    return g.banda;
  }
  /* Los tipos que sirven para esa especie en esa banda (sin datos, no se pregunta). */
  function tipos(D, b, e) {
    return D.bandas[b].tipos.filter(t => !(t === 'patas' && !e.patas) && !(t === 'vuela' && e.vuela == null) && !(t === 'dijo' && !e.dice) && !(t === 'comio' && !e.come));
  }
  function datosPista(e) { return { es: e.es, art: e.art, art_min: (e.art || '').toLowerCase(), inicial: e.en[0] }; }

  // los nombres en inglés de cada animal: el de la especie y los de sus modelos (bull, lioness…)
  const nombresDe = e => unicos([e.en].concat((e.modelos || []).map(m => m.en)));
  const enTierra = D => Object.keys(D.especies).filter(k => !D.especies[k].agua);
  /* nombre: el del animal tocado si es de una pareja mixta («bull»); si no, el de la especie. */
  function armar(D, id, grado, azar, nombre) {
    azar = azar || Math.random;
    const e = D.especies[id], P = D.preguntas;
    let ts = tipos(D, banda(D, grado), e);
    if (!ts.length) ts = ['nombre'];
    const tipo = ts[Math.floor(azar() * ts.length)];
    let ops, bien;
    if (tipo === 'nombre') {
      const mio = nombre || e.en, otros = unicos(enTierra(D).filter(k => k !== id).map(k => D.especies[k].en)).filter(x => x !== mio);
      bien = rellenar(P.nombre.op, { x: mio });
      ops = [bien].concat(tomar(otros, 2, azar).map(x => rellenar(P.nombre.op, { x })));
    } else if (tipo === 'patas') {
      bien = P.patas.ops[e.patas];
      ops = Object.keys(P.patas.ops).map(k => P.patas.ops[k]);
    } else if (tipo === 'vuela') {
      bien = e.vuela ? P.vuela.si : P.vuela.no;
      ops = [P.vuela.si, P.vuela.no, P.vuela.otra];
    } else if (tipo === 'comio') {
      bien = rellenar(P.comio.op, { x: e.come });
      ops = [bien].concat(tomar(e.noCome, 2, azar).map(x => rellenar(P.comio.op, { x })));
    } else {
      const otros = unicos(enTierra(D).map(k => D.especies[k].dice)).filter(x => x !== e.dice);
      bien = rellenar(P.dijo.op, { x: e.dice });
      ops = [bien].concat(tomar(otros, 2, azar).map(x => rellenar(P.dijo.op, { x })));
    }
    // el orden: «Two/Four/Six» y «Yes/No» quedan como se leen; lo demás, barajado
    if (tipo !== 'patas' && tipo !== 'vuela') ops = barajar(ops, azar);
    return { tipo, especie: id, texto: P[tipo].q, ops, correcta: ops.indexOf(bien), pista: rellenar(P[tipo].pista, datosPista(e)) };
  }

  /* quien: 'noe' = sólo lo que dice Noé (FRASES-NOE.txt); si no, el resto (FRASES.txt: preguntas, opciones, «Great job!»). */
  function frases(D, quien) {
    const P = D.preguntas, F = D.frases, l = [], noe = D.vozNoe || [];
    const esp = enTierra(D).map(k => D.especies[k]);
    // las frases con {…} salen una por especie («Find two cows!», «One more cow!»); las de pareja mixta, sólo donde la hay
    // («Find a bull and a cow!», «Now find the bull!»)
    const por = {
      encargoPar: () => esp.filter(e => e.parejaEn).map(e => rellenar(F.encargoPar, e)),
      ahora: () => esp.filter(e => e.parejaEn).reduce((a, e) => a.concat(nombresDe(e).map(en => rellenar(F.ahora, { en }))), [])
    };
    Object.keys(F).filter(k => (quien === 'noe') === noe.includes(k)).forEach(k => { if (por[k]) por[k]().forEach(x => l.push(x)); else if (F[k].indexOf('{') < 0) l.push(F[k]); else esp.forEach(e => l.push(rellenar(F[k], e))); });
    if (quien === 'noe') return unicos(l);
    Object.keys(P).forEach(k => l.push(P[k].q));
    esp.forEach(e => nombresDe(e).forEach(x => l.push(rellenar(P.nombre.op, { x }))));
    Object.keys(P.patas.ops).forEach(k => l.push(P.patas.ops[k]));
    l.push(P.vuela.si, P.vuela.no, P.vuela.otra);
    esp.forEach(e => { if (e.come) [e.come].concat(e.noCome || []).forEach(x => l.push(rellenar(P.comio.op, { x }))); });
    esp.forEach(e => { if (e.dice) l.push(rellenar(P.dijo.op, { x: e.dice })); });
    return unicos(l);
  }

  return { armar, frases, banda, tipos, slug };
});
