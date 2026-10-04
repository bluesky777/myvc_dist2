// Cajas de Palabras — arranque del juego y API de depuración (window.__cajas).
(function () {
  'use strict';
  const M = CAJAS.M;
  // Mientras se prueba: todos los mundos y niveles abiertos. Con false vuelve el desbloqueo normal.
  // Dentro de app2 (iframe juegos3d/cajas/index.html?u=<id>&docente=1) el desbloqueo es el normal; en el prototipo
  // suelto (sin ?u=), todo abierto.
  const q = new URLSearchParams(location.search);
  const PRUEBAS = !q.has('u');
  M.PRUEBAS = PRUEBAS;
  // Docentes: todo desbloqueado siempre. Lo decide quien embebe el juego (app2: personal del colegio) con
  // window.CAJAS.config = { docente: true } antes de cargar el motor.
  M.DOCENTE = !!(CAJAS.config && CAJAS.config.docente) || q.get('docente') === '1';

  function arrancar() {
    if (CAJAS.juego) return;
    const carga = document.getElementById('aviso-carga');
    if (carga) carga.remove();
    CAJAS.juego = new Phaser.Game({
      type: Phaser.AUTO,
      parent: 'juego',
      backgroundColor: '#14213D',
      scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH, width: M.ANCHO, height: M.ALTO },
      physics: { default: 'arcade', arcade: { gravity: { y: 1500 }, debug: /[?&]cuerpos/.test(location.search) } },
      input: { activePointers: 3 },
      render: { antialias: true, roundPixels: true },
      audio: { disableWebAudio: false },
      scene: [M.Carga, M.Menu, M.Nivel, M.HUD],
    });
  }

  // Esperar a las fuentes para que los textos no salgan con la de reserva (máx. 3 s).
  const fuentes = document.fonts
    ? Promise.all([
      document.fonts.load('700 32px "Baloo 2"'), document.fonts.load('800 32px "Baloo 2"'),
      document.fonts.load('800 24px "Nunito"'), document.fonts.load('700 24px "Nunito"'),
    ]).then(() => document.fonts.ready)
    : Promise.resolve();
  Promise.race([fuentes, new Promise(r => setTimeout(r, 3000))]).catch(() => {}).then(arrancar);

  // ---------- depuración ----------
  const nivel = () => {
    const s = CAJAS.juego && CAJAS.juego.scene.getScene('Nivel');
    return s && (s.sys.isActive() || s.sys.isPaused()) ? s : null;
  };
  const hud = () => { const s = CAJAS.juego && CAJAS.juego.scene.getScene('HUD'); return s && s.listo ? s : null; };
  window.__cajas = {
    // Resumen de lo que pasa ahora.
    estado() {
      const g = CAJAS.juego;
      const activas = g ? g.scene.getScenes(true).map(s => s.sys.settings.key) : [];
      const n = nivel();
      const out = { escenas: activas, libros: M.estado.libros, guardado: JSON.parse(JSON.stringify(M.estado)), mundos: M.mundos().map(m => m.id) };
      if (n) {
        const b = n.cuerpo.body;
        Object.assign(out, {
          mundo: n.mundo.id, nivel: n.nIdx, vidas: n.vidas, abierta: n.abierta, fin: n.fin, pausado: n.sys.isPaused(),
          cajas: n.cajas.map(c => ({ n: c.i + 1, estado: c.estado, palabra: c.palabra, respuesta: c.respuesta })),
          jugador: { x: Math.round(b.center.x), y: Math.round(b.bottom), enSuelo: b.blocked.down },
          modal: hud() && hud().modal ? hud().modal.tipo : null,
          enemigos: n.enemigos.length,
        });
      }
      return out;
    },
    menu() { const g = CAJAS.juego; g.scene.stop('HUD'); g.scene.stop('Nivel'); g.scene.start('Menu'); },
    ir(mundo, n) { const g = CAJAS.juego; g.scene.stop('Menu'); g.scene.stop('HUD'); g.scene.stop('Nivel'); g.scene.start('Nivel', { mundo, nivel: n || 0 }); },
    abrirTodo(v) { M.estado.abrirTodo = v !== false; M.guardar(); },
    borrarProgreso() { Object.assign(M.estado, { libros: 0, hechos: {}, estrellas: {}, librosTomados: {}, abrirTodo: false }); M.guardar(); },
    // Teletransporta junto a la caja n (1..8).
    aCaja(k) { const n = nivel(); const pos = n.ladoDeCaja(k - 1); n.colocar(pos.x, pos.y); },
    // Teletransporta junto a la respuesta visible k (1..n).
    aRespuesta(k) { const n = nivel(); const t = n.tarjetas.filter(x => x.visible)[(k || 1) - 1]; if (t) n.colocar(t.c.x, (t.sitio.r + 1) * 64); },
    respuestas() { const n = nivel(); return n.tarjetas.filter(x => x.visible).map(t => ({ texto: t.texto, c: t.sitio.c, r: t.sitio.r, correcta: t.caja === n.abierta })); },    abrir(k) { const n = nivel(); n.abrirCaja(k - 1); },
    // Toca la tarjeta correcta de la caja abierta (ok=true) o una equivocada (ok=false).
    responder(ok) {
      const n = nivel();
      if (n.abierta < 0) { n.tocarTarjeta(n.tarjetas.find(t => !t.usada)); return; }
      const t = n.tarjetas.find(x => ok === false ? x.caja !== n.abierta && !x.usada && x.visible : x.caja === n.abierta);
      if (t) n.tocarTarjeta(t);
    },
    resolverTodo() {
      const n = nivel();
      for (const c of n.cajas) { if (c.estado === 'resuelta') continue; if (n.abierta >= 0 && n.abierta !== c.i) continue; n.abrirCaja(c.i); window.__cajas.responder(true); }
    },
    herir(tipo) { const n = nivel(); n.invulHasta = 0; n.herir(tipo || 'enemigo'); },
    vidas(v) { nivel().vidas = v; },
    libro() { const n = nivel(); if (n.libro) n.tomarLibro(); },
    // Pulsa un botón de un panel abierto por su texto.
    pulsar(txt) {
      const h = hud();
      const s = h && h.modal ? h : CAJAS.juego.scene.getScene('Menu');
      const navs = h && h.modal ? [h.modal.nav] : [s.navNiveles, s.nav].filter(x => x && x.activo);
      for (const nv of navs) {
        const b = nv.items.find(i => i.etiqueta && i.etiqueta.text.includes(txt));
        if (b) { b.activar(); return true; }
      }
      return false;
    },
  };
})();
