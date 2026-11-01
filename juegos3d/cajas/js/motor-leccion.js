// Cajas de Palabras — modo lección (../../leccion.js): con ?leccion= el juego no abre el menú de mundos ni de
// personaje. Un nivel del Jardín con las palabras de la lección, «Jugar», y al resolverlas «¡Lo lograste!».
// cfg: { titulo?, palabras: [{ en: 'eight', es: 'ocho', emoji?: '8️⃣' }…], voz?, voces? } (FORMATO.md, «`juego`»).
// Al revés que los mundos (Joseth, 31 oct): la caja dice la palabra EN INGLÉS y suena su MP3 (y otra vez cada vez que
// se vuelve a tocar); la respuesta que se busca es su traducción, con su dibujo. Media de las cajas son «bocina»: no
// dicen la palabra, sólo 🔊; hay que volver a ella para oírla otra vez. A las 3 escuchas (o si no hay MP3 o el sonido
// está apagado) la palabra se ve escrita: no depende sólo del sonido. De 3 a 8 palabras; con más, 8 al azar cada partida.
(function () {
  'use strict';
  const M = CAJAS.M;
  const LJ = window.LeccionJuego;
  if (!LJ || !LJ.activo) return;
  const palabras = (Array.isArray(LJ.cfg.palabras) ? LJ.cfg.palabras : [])
    .filter(p => p && typeof p.en === 'string' && p.en.trim() && typeof p.es === 'string' && p.es.trim())
    .map(p => ({ en: p.en.trim(), es: p.es.trim(), emoji: typeof p.emoji === 'string' ? p.emoji.trim() : '' }));
  if (!palabras.length) { console.warn('[cajas] modo lección sin palabras: va el juego normal'); return; }

  const MUNDO = 'jardin', NIVEL = 0;
  const mundo = CAJAS.mundos.find(m => m.id === MUNDO);
  if (!mundo) return;
  const def = mundo.niveles[NIVEL];
  const mapaBase = def.mapa.slice();

  // Las 8 cajas del nivel en orden de lectura (C a la vista, Q dentro de un bloque). Con menos palabras sobran
  // cajas: se quitan primero las escondidas (la Q queda como bloque que se rompe) y luego las últimas.
  let fallos = 0;
  function armar() {
    fallos = 0;
    const elegidas = LJ.barajar(palabras).slice(0, 8);
    const filas = mapaBase.map(f => f.split(''));
    const cajas = [];
    filas.forEach((f, r) => f.forEach((ch, c) => { if (ch === 'C' || ch === 'Q') cajas.push({ r, c, ch }); }));
    let sobran = cajas.length - elegidas.length;
    for (const k of cajas.filter(x => x.ch === 'Q').concat(cajas.filter(x => x.ch === 'C').reverse())) {
      if (sobran <= 0) break;
      filas[k.r][k.c] = k.ch === 'Q' ? 'B' : '.';
      sobran--;
    }
    // sin libro: en la lección no hay colección de libros que cuente
    filas.forEach(f => f.forEach((ch, c) => { if (ch === 'L') f[c] = '.'; else if (ch === 'K') f[c] = 'B'; }));
    def.mapa = filas.map(f => f.join(''));
    def.palabras = elegidas.map(p => ({ caja: p.en, respuesta: p.es }));
    def.nombre = LJ.titulo || 'Las palabras de la lección';
    // las cajas bocina: la mitad, al azar
    const bocinas = new Set(LJ.barajar(elegidas.map((_, k) => k)).slice(0, Math.floor(elegidas.length / 2)));
    def._bocinas = bocinas;
    if (mundo._niveles) parsear();
  }
  function parsear() {
    const p = M.parsear(def, mundo); p.idx = NIVEL;
    p.cajas.forEach((cj, k) => { cj.bocina = def._bocinas.has(k); });
    mundo._niveles[NIVEL] = p;
  }
  armar();

  // El dibujo de cada respuesta (que está en español): el de la palabra inglesa en iconos.js si lo hay; si no, el emoji
  // de la lección pintado en una textura.
  for (const p of palabras) {
    const ico = M.rutaIcono(p.en), k = p.es.toLowerCase();
    if (ico && !CAJAS.iconos[k]) CAJAS.iconos[k] = ico;
  }
  function emojis(scene) {
    for (const p of palabras) {
      const k = M.claveIcono(p.es);
      if (!p.emoji || M.rutaIcono(p.es) || scene.textures.exists(k)) continue;
      const tx = scene.textures.createCanvas(k, 96, 96);
      if (!tx) continue;
      const ctx = tx.getContext();
      ctx.font = '76px "Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", sans-serif';
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText(p.emoji, 48, 54);
      tx.refresh();
    }
  }

  const empezar = scene => {
    emojis(scene);
    parsear();
    scene.scene.start('Nivel', { mundo: MUNDO, nivel: NIVEL });
  };

  // facil: 5 vidas que vuelven al acabarse y la caja abierta no se cierra con un golpe; media: 5 vidas; normal: 3.
  const DIF = { facil: { vidas: 5, cierraCaja: false, recupera: true }, media: { vidas: 5, cierraCaja: true, recupera: false },
    normal: { vidas: 3, cierraCaja: true, recupera: false } }[LJ.dificultad];

  M.LECCION = {
    dif: DIF,
    // Carga.create, en vez del menú
    portada(scene) {
      LJ.portada({
        juego: 'Cajas de Palabras', titulo: LJ.titulo || 'Las palabras de la lección',
        detalle: 'Toca una caja: suena una palabra en inglés. Ve a buscar lo que quiere decir. Las cajas 🔊 sólo suenan: tócalas otra vez para volver a oír. Flechas para andar y Espacio para saltar.',
        alJugar: () => empezar(scene),
      });
    },
    oir(en) { return mudo() ? Promise.resolve(false) : LJ.oir(en); },
    // lo que dice la placa de la caja: la palabra, o 🔊 en una caja bocina que aún no se ve
    texto(cj, estilo) { return cj.bocina && !cj.vista && estilo !== 'resuelta' ? '🔊' : cj.palabra; },
    aviso(cj, i) {
      return cj.bocina && !cj.vista ? `Caja ${i + 1}: 🔊 escucha y busca lo que quiere decir. Tócala otra vez para oírla.`
        : `Caja ${i + 1}: «${cj.palabra}». ¡Busca lo que quiere decir!`;
    },
    // al abrir la caja y cada vez que se vuelve a tocar: suena; a las 3 escuchas, o sin audio, la palabra se ve
    tocada(nivel, cj) {
      cj.oidas = (cj.oidas || 0) + 1;
      const ver = () => {
        if (!cj.bocina || cj.vista || cj.estado === 'resuelta') return;
        cj.vista = true;
        if (cj.estado === 'abierta' && cj.placa.visible) nivel.pintarPlaca(cj, 'abierta');
        nivel.aviso(`Caja ${cj.i + 1}: «${cj.palabra}»`, 'info');
      };
      this.oir(cj.palabra).then(ok => { if (!ok || cj.oidas >= 3) ver(); });
    },
    // a la lección: lo que lleva (cada acierto o fallo) y, al terminar, el resultado
    anotar(nivel, bien, fin) {
      if (bien === false) fallos++;
      const r = { aciertos: nivel.cajas.filter(c => c.estado === 'resuelta').length, total: nivel.cajas.length, fallos, nivel: 'jardin-1' };
      if (fin) LJ.resultado(r); else LJ.progreso(r);
    },
    // HUD.completado, en vez de «Siguiente nivel / Volver a los mundos»
    completado(nivel) {
      const n = nivel.cajas.length;
      this.anotar(nivel, null, true);
      LJ.logrado({
        detalle: `Encontraste las ${n} palabras${nivel.vidas >= 3 ? ' sin perder ninguna vida' : ''}.`,
        chips: nivel.cajas.map(c => `${c.palabra} = ${c.respuesta}`),
        alOtraVez: () => { armar(); nivel.reiniciar(); },
      });
    },
  };
  const mudo = () => !!(CAJAS.juego && CAJAS.juego.sound && CAJAS.juego.sound.mute);
  // el progreso de los mundos no se toca desde una lección
  M.guardar = function () { /* modo lección: no se guarda */ };
})();
