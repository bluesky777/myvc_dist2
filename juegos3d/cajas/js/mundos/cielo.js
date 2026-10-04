// Mundo 6 — Torre del Cielo (modo subida). Se sube entre nubes hasta un castillo en el cielo: primero a saltos,
// luego con jetpack. El cielo pasa de celeste a atardecer y a noche estrellada según la altura.
// Contrato: docs/juego-cajas/CONTRATO.md («Modo subida»).
(function () {
  // ---------- utilidades de dibujo (estilo Kenney: contorno grueso del mismo tono, brillo arriba-izq.) ----------
  function ojo(g, x, y, r, dx, dy, borde) {
    g.fillStyle(borde, 1); g.fillCircle(x, y, r + 2.5);
    g.fillStyle(0xffffff, 1); g.fillCircle(x, y, r);
    g.fillStyle(0x23233a, 1); g.fillCircle(x + dx, y + dy, r * 0.55);
    g.fillStyle(0xffffff, 1); g.fillCircle(x + dx - r * 0.2, y + dy - r * 0.25, r * 0.2);
  }
  function lienzo(scene) { return scene.make.graphics({ x: 0, y: 0, add: false }); }
  function mezcla(a, b, t) {
    t = Math.max(0, Math.min(1, t));
    const ca = Phaser.Display.Color.IntegerToColor(a), cb = Phaser.Display.Color.IntegerToColor(b);
    const c = Phaser.Display.Color.Interpolate.ColorWithColor(ca, cb, 100, t * 100);
    return Phaser.Display.Color.GetColor(c.r, c.g, c.b);
  }

  // Globo enfadado: globo rojo de fiesta con cejas fruncidas de dibujo animado y morros; el hilo ondea.
  function dibujarGlobo(scene, clave, f) {
    const g = lienzo(scene);
    const BORDE = 0xa3203a, CUERPO = 0xf0485f, CLARO = 0xff8a9a, SOMBRA = 0xd13450;
    const cx = 32, cy = f ? 25 : 24, rx = f ? 20 : 19, ry = f ? 20.5 : 21.5;
    // hilo
    g.lineStyle(2.5, 0x7b5a4a, 1);
    g.beginPath(); g.moveTo(cx, cy + ry + 4);
    const w = f ? -4 : 4;
    for (let i = 1; i <= 8; i++) g.lineTo(cx + Math.sin(i * 0.9) * w, cy + ry + 4 + i * 2.1);
    g.strokePath();
    // nudo
    g.fillStyle(BORDE, 1); g.fillTriangle(cx - 6, cy + ry + 6, cx + 6, cy + ry + 6, cx, cy + ry - 2);
    g.fillStyle(CUERPO, 1); g.fillTriangle(cx - 3, cy + ry + 3.5, cx + 3, cy + ry + 3.5, cx, cy + ry - 1);
    // cuerpo
    g.fillStyle(BORDE, 1); g.fillEllipse(cx, cy, (rx + 3.5) * 2, (ry + 3.5) * 2);
    g.fillStyle(CUERPO, 1); g.fillEllipse(cx, cy, rx * 2, ry * 2);
    g.fillStyle(SOMBRA, 1); g.fillEllipse(cx + 5, cy + ry * 0.55, rx * 1.2, ry * 0.55);
    g.fillStyle(CUERPO, 1); g.fillEllipse(cx + 1, cy + ry * 0.35, rx * 1.4, ry * 0.6);
    g.fillStyle(CLARO, 1); g.fillEllipse(cx - rx * 0.45, cy - ry * 0.5, rx * 0.55, ry * 0.7);
    g.fillStyle(0xffffff, 0.85); g.fillCircle(cx - rx * 0.55, cy - ry * 0.62, 2.6);
    // cara: ojos grandes con cejas fruncidas (enojo de caricatura), morros
    const oy = cy - 1, mira = f ? -1.5 : 1.5;
    ojo(g, cx - 7.5, oy, 6, mira, 1.2, BORDE);
    ojo(g, cx + 7.5, oy, 6, mira, 1.2, BORDE);
    g.lineStyle(3.5, BORDE, 1);
    g.lineBetween(cx - 15, oy - 10, cx - 3, oy - 6.5);
    g.lineBetween(cx + 15, oy - 10, cx + 3, oy - 6.5);
    g.fillStyle(0xff9fb0, 0.9); g.fillEllipse(cx - 13, oy + 8, 5.5, 3); g.fillEllipse(cx + 13, oy + 8, 5.5, 3);
    g.lineStyle(3, BORDE, 1);
    g.beginPath(); g.arc(cx, oy + 13, 4, Math.PI * 1.15, Math.PI * 1.85, false); g.strokePath();
    g.generateTexture(clave, 64, 64);
    g.destroy();
  }

  // Pajarito: bola azul con barriga clara, pico naranja, penacho y ala que sube (a) y baja (b). Mira a la izquierda.
  function dibujarPajaro(scene, clave, f) {
    const g = lienzo(scene);
    const BORDE = 0x2a5f9e, CUERPO = 0x5aa9ec, CLARO = 0x93cdf7, BARRIGA = 0xe8f4ff;
    const PICO = 0xffb340, PICO_B = 0xc0701c;
    const cx = 33, cy = 35, r = 17;
    // cola (detrás)
    g.fillStyle(BORDE, 1); g.fillTriangle(cx + 10, cy - 2, cx + 29, cy - 10, cx + 27, cy + 8);
    g.fillStyle(CUERPO, 1); g.fillTriangle(cx + 12, cy - 1, cx + 25.5, cy - 6.5, cx + 24, cy + 4.5);
    // penacho
    g.fillStyle(BORDE, 1); g.fillEllipse(cx - 1, cy - r - 2, 9, 14); g.fillEllipse(cx + 5, cy - r, 8, 12);
    g.fillStyle(CUERPO, 1); g.fillEllipse(cx - 1, cy - r - 1.5, 4.5, 9); g.fillEllipse(cx + 5, cy - r + 0.5, 3.5, 7);
    // cuerpo
    g.fillStyle(BORDE, 1); g.fillCircle(cx, cy, r + 3.5);
    g.fillStyle(CUERPO, 1); g.fillCircle(cx, cy, r);
    g.fillStyle(BARRIGA, 1); g.fillEllipse(cx - 3, cy + 7, 22, 16);
    g.fillStyle(CLARO, 1); g.fillEllipse(cx - 7, cy - 10, 10, 6);
    g.fillStyle(0xffffff, 0.85); g.fillCircle(cx - 9, cy - 11, 2.2);
    // pico
    g.fillStyle(PICO_B, 1); g.fillTriangle(cx - r - 10, cy + 1, cx - r + 4, cy - 5.5, cx - r + 4, cy + 7.5);
    g.fillStyle(PICO, 1); g.fillTriangle(cx - r - 6.5, cy + 1, cx - r + 3, cy - 3, cx - r + 3, cy + 5);
    // ojo grande y mejilla
    ojo(g, cx - 6, cy - 4, 6, -2, 0.5, BORDE);
    g.fillStyle(0xffa3b8, 0.9); g.fillEllipse(cx - 9, cy + 6, 6, 3.5);
    // ala
    g.fillStyle(BORDE, 1);
    if (f) g.fillEllipse(cx + 7, cy + 8, 20, 13); else g.fillEllipse(cx + 7, cy - 9, 20, 15);
    g.fillStyle(CLARO, 1);
    if (f) g.fillEllipse(cx + 7, cy + 7.5, 14, 7.5); else g.fillEllipse(cx + 7, cy - 9.5, 14, 9);
    g.generateTexture(clave, 64, 64);
    g.destroy();
  }

  // Cometa: rombo amarillo con varillas, cara decidida y cola con lazos que ondea.
  function dibujarCometa(scene, clave, f) {
    const g = lienzo(scene);
    const BORDE = 0xb36b12, CUERPO = 0xffc93c, CLARO = 0xffe48a, OTRO = 0xff8f3c, VARILLA = 0xc9821f;
    const cx = 32, top = 4, mid = 24, bot = 46, a = 19;
    // cola
    const w = f ? 4 : -4;
    g.lineStyle(2.5, 0x8a5a2a, 1);
    g.beginPath(); g.moveTo(cx, bot);
    const cola = [];
    for (let i = 1; i <= 8; i++) { const p = { x: cx + Math.sin(i * 0.8) * w, y: bot + i * 2.2 }; cola.push(p); g.lineTo(p.x, p.y); }
    g.strokePath();
    [cola[2], cola[6]].forEach((p, i) => {
      const col = i ? 0x5aa9ec : 0xf0485f, bo = i ? 0x2a5f9e : 0xa3203a;
      g.fillStyle(bo, 1); g.fillTriangle(p.x, p.y, p.x - 8, p.y - 4, p.x - 8, p.y + 4); g.fillTriangle(p.x, p.y, p.x + 8, p.y - 4, p.x + 8, p.y + 4);
      g.fillStyle(col, 1); g.fillTriangle(p.x, p.y, p.x - 6, p.y - 2.2, p.x - 6, p.y + 2.2); g.fillTriangle(p.x, p.y, p.x + 6, p.y - 2.2, p.x + 6, p.y + 2.2);
    });
    // rombo con contorno
    const rombo = (e, col) => {
      g.fillStyle(col, 1);
      g.fillPoints([{ x: cx, y: top - e }, { x: cx + a + e, y: mid }, { x: cx, y: bot + e }, { x: cx - a - e, y: mid }], true);
    };
    rombo(3.5, BORDE);
    rombo(0, CUERPO);
    g.fillStyle(OTRO, 1);
    g.fillTriangle(cx, mid, cx + a, mid, cx, bot); g.fillTriangle(cx, mid, cx - a, mid, cx, top);
    g.fillStyle(CLARO, 1); g.fillTriangle(cx - 2, top + 5, cx - 2, mid - 4, cx - 12, mid - 4);
    g.lineStyle(2, VARILLA, 1); g.lineBetween(cx, top + 1, cx, bot - 1); g.lineBetween(cx - a + 1, mid, cx + a - 1, mid);
    // cara
    const oy = mid - 1, mira = f ? 1.5 : -1.5;
    ojo(g, cx - 6.5, oy, 5, mira, 0.8, BORDE);
    ojo(g, cx + 6.5, oy, 5, mira, 0.8, BORDE);
    g.lineStyle(3, BORDE, 1);
    g.lineBetween(cx - 12, oy - 8, cx - 3, oy - 6); g.lineBetween(cx + 12, oy - 8, cx + 3, oy - 6);
    g.beginPath(); g.arc(cx, oy + 5, 4.5, Math.PI * 0.15, Math.PI * 0.85, false); g.strokePath();
    g.generateTexture(clave, 64, 64);
    g.destroy();
  }

  // ---------- decorado del fondo ----------
  // Nube de fondo: borlas redondas blancas con la base algo azulada (sin contorno: está lejos).
  function dibujarNubeFondo(scene, clave, variante) {
    const g = lienzo(scene);
    const W = 220, H = 110;
    const borlas = variante
      ? [[50, 70, 30], [92, 54, 38], [140, 60, 32], [178, 74, 24], [118, 78, 30]]
      : [[40, 76, 24], [76, 58, 32], [122, 46, 40], [166, 62, 30], [196, 80, 18], [100, 80, 28]];
    g.fillStyle(0xdde9f7, 1);
    borlas.forEach(([x, y, r]) => g.fillCircle(x, y + 5, r));
    g.fillRoundedRect(24, 76, W - 40, 26, 13);
    g.fillStyle(0xffffff, 1);
    borlas.forEach(([x, y, r]) => g.fillCircle(x, y, r));
    g.fillRoundedRect(26, 70, W - 44, 24, 12);
    g.generateTexture(clave, W, H);
    g.destroy();
  }
  // Globo aerostático a rayas con cesta.
  function dibujarAerostato(scene, clave, c1, c2, borde) {
    const g = lienzo(scene);
    const cx = 40, cy = 38, rx = 30, ry = 34;
    g.lineStyle(2, 0x7b5a4a, 1); g.lineBetween(cx - 14, cy + 28, cx - 8, cy + 52); g.lineBetween(cx + 14, cy + 28, cx + 8, cy + 52);
    g.fillStyle(0x8a5a2a, 1); g.fillRoundedRect(cx - 11, cy + 50, 22, 15, 4);
    g.fillStyle(0xc08a4a, 1); g.fillRoundedRect(cx - 8, cy + 52, 16, 8, 3);
    g.fillStyle(borde, 1); g.fillEllipse(cx, cy, (rx + 3) * 2, (ry + 3) * 2); g.fillTriangle(cx - 20, cy + 22, cx + 20, cy + 22, cx, cy + 46);
    g.fillStyle(c1, 1); g.fillEllipse(cx, cy, rx * 2, ry * 2); g.fillTriangle(cx - 17, cy + 22, cx + 17, cy + 22, cx, cy + 42);
    g.fillStyle(c2, 1);
    g.fillEllipse(cx, cy, rx * 0.9, ry * 2); g.fillTriangle(cx - 7, cy + 26, cx + 7, cy + 26, cx, cy + 42);
    g.fillStyle(0xffffff, 0.35); g.fillEllipse(cx - 14, cy - 14, 12, 20);
    g.generateTexture(clave, 80, 104);
    g.destroy();
  }
  // Pájaro lejano: una «v» suave.
  function dibujarAveLejos(scene, clave, f) {
    const g = lienzo(scene);
    g.lineStyle(3.5, 0x41506e, 1);
    g.beginPath();
    if (f) { g.moveTo(2, 6); g.lineTo(12, 12); g.lineTo(22, 6); } else { g.moveTo(2, 14); g.lineTo(12, 10); g.lineTo(22, 14); }
    g.strokePath();
    g.generateTexture(clave, 24, 20);
    g.destroy();
  }
  // Castillo del cielo sobre una nube: muros blancos, tejados cónicos lilas, banderines.
  function dibujarCastillo(scene, clave) {
    const g = lienzo(scene);
    const W = 420, H = 360;
    const MURO = 0xf4f0ff, MURO_B = 0x8f84c4, MURO_S = 0xdcd5f5, TEJ = 0xb36ee0, TEJ_B = 0x6b3d99, TEJ_C = 0xd9a3f5;
    const VENT = 0x4a3f87, ORO = 0xffcf4a;
    const torre = (x, w, top, base) => {
      g.fillStyle(MURO_B, 1); g.fillRect(x - w / 2 - 4, top - 4, w + 8, base - top + 4);
      g.fillStyle(MURO, 1); g.fillRect(x - w / 2, top, w, base - top);
      g.fillStyle(MURO_S, 1); g.fillRect(x + w / 2 - w * 0.28, top, w * 0.28, base - top);
      // tejado cónico
      const alto = w * 1.25;
      g.fillStyle(TEJ_B, 1); g.fillTriangle(x - w / 2 - 12, top + 2, x + w / 2 + 12, top + 2, x, top - alto - 6);
      g.fillStyle(TEJ, 1); g.fillTriangle(x - w / 2 - 7, top - 1, x + w / 2 + 7, top - 1, x, top - alto);
      g.fillStyle(TEJ_C, 1); g.fillTriangle(x - w / 2 - 2, top - 3, x - 3, top - 3, x - 2, top - alto + 10);
      // banderín
      g.lineStyle(3, TEJ_B, 1); g.lineBetween(x, top - alto - 4, x, top - alto - 28);
      g.fillStyle(ORO, 1); g.fillTriangle(x + 1, top - alto - 28, x + 1, top - alto - 16, x + 18, top - alto - 22);
      // ventanas
      g.fillStyle(VENT, 1);
      g.fillRoundedRect(x - 6, top + 18, 12, 18, { tl: 6, tr: 6, bl: 0, br: 0 });
      if (base - top > 90) g.fillRoundedRect(x - 6, top + 58, 12, 18, { tl: 6, tr: 6, bl: 0, br: 0 });
      g.fillStyle(ORO, 0.85); g.fillRect(x - 3, top + 24, 6, 9);
    };
    const suelo = 292;
    torre(80, 54, 130, suelo);
    torre(340, 54, 130, suelo);
    torre(150, 60, 92, suelo);
    torre(270, 60, 92, suelo);
    // cuerpo central con almenas
    g.fillStyle(MURO_B, 1); g.fillRect(116, 166, 188, suelo - 166);
    for (let x = 116; x < 304; x += 26) g.fillRect(x, 150, 16, 20);
    g.fillStyle(MURO, 1); g.fillRect(120, 170, 180, suelo - 170);
    for (let x = 120; x < 300; x += 26) g.fillRect(x + 0.5, 154, 11, 18);
    torre(210, 74, 48, suelo);
    // puerta
    g.fillStyle(MURO_B, 1); g.fillRoundedRect(186, 222, 48, 72, { tl: 24, tr: 24, bl: 0, br: 0 });
    g.fillStyle(0xb7783a, 1); g.fillRoundedRect(190, 226, 40, 68, { tl: 20, tr: 20, bl: 0, br: 0 });
    g.fillStyle(ORO, 1); g.fillCircle(222, 262, 3);
    // nube base
    const borlas = [[30, 312, 34], [80, 300, 42], [140, 310, 40], [210, 302, 48], [280, 310, 42], [340, 300, 40], [392, 314, 30]];
    g.fillStyle(0xd2def2, 1); borlas.forEach(([x, y, r]) => g.fillCircle(x, y + 8, r)); g.fillRoundedRect(10, 316, 400, 36, 18);
    g.fillStyle(0xffffff, 1); borlas.forEach(([x, y, r]) => g.fillCircle(x, y, r)); g.fillRoundedRect(14, 308, 392, 34, 17);
    g.generateTexture(clave, W, H);
    g.destroy();
  }

  // ---------- arte extra (imágenes sueltas del contrato) ----------
  // El motor debería cargarlas al entrar al mundo; si no están, se piden aquí y se reinicia el nivel una vez
  // al llegar (los enemigos alado/volador/nube y las capas del fondo las necesitan).
  const EXTRAS = [
    ['alado1', 'alado1.png'], ['alado2', 'alado2.png'], ['alado3', 'alado3.png'], ['alado4', 'alado4.png'], ['alado5', 'alado5.png'],
    ['volador_a', 'volador_a.png'], ['volador_b', 'volador_b.png'], ['nube_mala', 'nube.png'],
    ['jetpack', 'jetpack.png'], ['jetpack_item', 'jetpack_item.png'],
    ['cielo_capa1', 'cielo_capa1.png'], ['cielo_capa2', 'cielo_capa2.png'], ['cielo_capa3', 'cielo_capa3.png'], ['cielo_capa4', 'cielo_capa4.png'],
  ];
  let recargado = false;
  function asegurarExtras(scene) {
    const faltan = EXTRAS.filter(([k]) => !scene.textures.exists(k));
    if (!faltan.length || recargado || !scene.load) return;
    recargado = true;
    const prev = scene.load.path;
    scene.load.setPath('assets/extra/');
    faltan.forEach(([k, f]) => scene.load.image(k, f));
    scene.load.setPath(prev);
    scene.load.once('complete', () => {
      try { scene.scene.restart(scene.sys.settings.data); } catch (e) { console.warn('[cajas] cielo: no se pudo reiniciar tras cargar el arte', e); }
    });
    scene.load.start();
  }

  // Capa de silueta 1024 px (cielo_capa2..4) pegada al fondo de la subida. sy = desplazamiento vertical.
  function capaSuelo(scene, anchoPx, rango, clave, sy, prof, bordeImg, pantallaY, relleno) {
    if (!scene.textures.exists(clave)) return;
    const y = pantallaY - bordeImg + rango * sy;
    scene.add.tileSprite(0, y, Math.max(1280, anchoPx), 1024, clave)
      .setOrigin(0, 0).setScrollFactor(0.15, sy).setDepth(prof);
    scene.add.rectangle(0, y + 1020, Math.max(1280, anchoPx), 2000, relleno)
      .setOrigin(0, 0).setScrollFactor(0.15, sy).setDepth(prof);
  }

  // Colores del cielo de arriba (0) a abajo (1).
  const PARADAS = [
    [0.00, 0x1b2150], [0.14, 0x2f2f78], [0.28, 0x6b4c9e], [0.42, 0xc56fa0],
    [0.53, 0xf59a7f], [0.63, 0xffcf96], [0.74, 0xc4eaff], [1.00, 0xaee6ff],
  ];
  function colorEn(f) {
    for (let i = 1; i < PARADAS.length; i++) {
      if (f <= PARADAS[i][0]) {
        const [f0, c0] = PARADAS[i - 1], [f1, c1] = PARADAS[i];
        return mezcla(c0, c1, (f - f0) / (f1 - f0));
      }
    }
    return PARADAS[PARADAS.length - 1][1];
  }

  CAJAS.registrarMundo({
    id: 'cielo',
    nombre: 'Torre del Cielo',
    orden: 6,
    modo: 'subida',
    terreno: 'grass',
    colorCielo: '#AEE6FF',
    fisica: { gravedad: 1500, salto: 820, velocidad: 260, aceleracion: 2400, frenado: 2400, nadar: false },

    fondo(scene, anchoPx, altoPx) {
      asegurarExtras(scene);
      const VW = 1280, VH = 720;
      const rango = Math.max(0, altoPx - VH);
      const alto = sy => VH + rango * sy;       // alto de una capa con ese desplazamiento vertical
      // 1) cielo degradado por altura (muy lento: el color cambia a lo largo de toda la subida)
      const SC = 0.22, HC = alto(SC);
      const cielo = scene.add.graphics().setScrollFactor(0, SC).setDepth(-10);
      // franjas finas de color liso (fillGradientStyle no existe en Canvas)
      const trozos = Math.ceil(HC / 8);
      for (let i = 0; i < trozos; i++) {
        cielo.fillStyle(colorEn((i + 0.5) / trozos), 1);
        cielo.fillRect(0, i * 8, VW, 9);
      }
      // estrellas y luna arriba
      const rnd = new Phaser.Math.RandomDataGenerator(['cielo', String(altoPx)]);
      const est = scene.add.graphics().setScrollFactor(0, SC).setDepth(-10);
      for (let i = 0; i < 140; i++) {
        const y = rnd.realInRange(0, HC * 0.42), x = rnd.realInRange(0, VW);
        const al = Math.max(0, 1 - y / (HC * 0.42));
        est.fillStyle(rnd.pick([0xffffff, 0xfff4c2, 0xd8e4ff]), 0.35 + 0.65 * al);
        est.fillCircle(x, y, rnd.pick([1, 1.5, 2, 2.5]));
      }
      for (let i = 0; i < 8; i++) {
        const s = scene.add.star(rnd.realInRange(60, VW - 60), rnd.realInRange(20, HC * 0.25), 4, 3, 9, 0xfff4c2)
          .setScrollFactor(0, SC).setDepth(-10);
        scene.tweens.add({ targets: s, alpha: 0.35, scale: 0.7, duration: rnd.between(900, 1800), yoyo: true, repeat: -1, delay: rnd.between(0, 1500) });
      }
      const luna = scene.add.graphics().setScrollFactor(0, SC).setDepth(-10);
      luna.fillStyle(0xfff1b8, 0.18); luna.fillCircle(1040, 150, 70);
      luna.fillStyle(0xfff1b8, 1); luna.fillCircle(1040, 150, 46);
      luna.fillStyle(mezcla(colorEn(136 / HC), 0xfff1b8, 0.18), 1); luna.fillCircle(1062, 136, 40);
      // 2) siluetas del suelo de partida (sólo se ven al principio)
      capaSuelo(scene, anchoPx, rango, 'cielo_capa2', 0.3, -9, 470, 360, 0xc4ecff);
      capaSuelo(scene, anchoPx, rango, 'cielo_capa3', 0.45, -8, 585, 520, 0xb5e6ff);
      capaSuelo(scene, anchoPx, rango, 'cielo_capa4', 0.62, -7, 700, 640, 0xa5e1ff);
      // 3) nubes lejanas, teñidas según la altura (blancas abajo, melocotón al atardecer, lilas de noche)
      const nubes = (sy, n, esc, prof, alfa) => {
        const H = alto(sy);
        for (let i = 0; i < n; i++) {
          const y = (H - 260) * (i + rnd.realInRange(0.1, 0.9)) / n;
          const f = y / H;
          const tinte = f > 0.72 ? 0xffffff : f > 0.45 ? mezcla(0xffd2c2, 0xffffff, (f - 0.45) / 0.27) : mezcla(0x9b8ad0, 0xffd2c2, f / 0.45);
          const c = scene.add.image(rnd.realInRange(-60, VW + 60), y, rnd.pick(['cielo_nubef0', 'cielo_nubef1']))
            .setScrollFactor(0.1, sy).setDepth(prof).setScale(esc * rnd.realInRange(0.8, 1.2)).setTint(tinte).setAlpha(alfa)
            .setFlipX(rnd.frac() < 0.5);
          scene.tweens.add({ targets: c, x: c.x + rnd.pick([-1, 1]) * rnd.between(40, 90), duration: rnd.between(9000, 16000), yoyo: true, repeat: -1, ease: 'Sine.inOut' });
        }
      };
      nubes(0.3, Math.round(rango / 380) + 3, 0.7, -9, 0.75);
      nubes(0.5, Math.round(rango / 300) + 3, 1.0, -6, 0.9);
      // 4) globos aerostáticos y bandadas
      const H5 = alto(0.4);
      for (let i = 0; i < Math.round(rango / 900) + 2; i++) {
        const y = (H5 - 200) * (i + rnd.realInRange(0.2, 0.8)) / (Math.round(rango / 900) + 2);
        const gl = scene.add.image(rnd.realInRange(80, VW - 80), y, rnd.pick(['cielo_aero0', 'cielo_aero1', 'cielo_aero2']))
          .setScrollFactor(0.12, 0.4).setDepth(-8).setScale(rnd.realInRange(0.55, 0.85));
        scene.tweens.add({ targets: gl, y: y - rnd.between(18, 36), duration: rnd.between(2600, 4200), yoyo: true, repeat: -1, ease: 'Sine.inOut' });
      }
      if (!scene.anims.exists('cielo_ave')) scene.anims.create({ key: 'cielo_ave', frames: [{ key: 'cielo_ave0' }, { key: 'cielo_ave1' }], frameRate: 4, repeat: -1 });
      const H6 = alto(0.35);
      for (let i = 0; i < Math.round(rango / 1100) + 2; i++) {
        const y = H6 * 0.45 + (H6 * 0.55 - 120) * (i + rnd.frac()) / (Math.round(rango / 1100) + 2);
        const x0 = rnd.realInRange(100, VW - 300), dir = rnd.pick([-1, 1]);
        for (let k = 0; k < 4; k++) {
          const a = scene.add.sprite(x0 + k * 26, y + Math.abs(k - 1.5) * 12, 'cielo_ave0').setScrollFactor(0.1, 0.35).setDepth(-8).setScale(0.8);
          a.play({ key: 'cielo_ave', startFrame: k % 2 });
          scene.tweens.add({ targets: a, x: a.x + dir * 160, duration: 14000, yoyo: true, repeat: -1, ease: 'Sine.inOut', flipX: false });
        }
      }
      // 5) el castillo, detrás de la meta
      let mx = anchoPx / 2, my = 5 * 64;
      const nv = (this && this.niveles || []).find(n => n.mapa.length * 64 === altoPx && n.mapa[0].length * 64 === anchoPx);
      if (nv) nv.mapa.some((fila, r) => { const c = fila.indexOf('M'); if (c < 0) return false; mx = c * 64 + 32; my = (r + 1) * 64; return true; });
      scene.add.image(mx, my + 34, 'cielo_castillo').setOrigin(0.5, 1).setScrollFactor(0.95, 0.95).setDepth(-2).setScale(0.8);
    },

    texturas(scene) {
      asegurarExtras(scene);
      dibujarGlobo(scene, 'cielo_globo_a', 0);
      dibujarGlobo(scene, 'cielo_globo_b', 1);
      dibujarPajaro(scene, 'cielo_pajaro_a', 0);
      dibujarPajaro(scene, 'cielo_pajaro_b', 1);
      dibujarCometa(scene, 'cielo_cometa_a', 0);
      dibujarCometa(scene, 'cielo_cometa_b', 1);
      dibujarNubeFondo(scene, 'cielo_nubef0', 0);
      dibujarNubeFondo(scene, 'cielo_nubef1', 1);
      dibujarAerostato(scene, 'cielo_aero0', 0xf0485f, 0xffd166, 0xa3203a);
      dibujarAerostato(scene, 'cielo_aero1', 0x5aa9ec, 0xffffff, 0x2a5f9e);
      dibujarAerostato(scene, 'cielo_aero2', 0x7bd35a, 0xffe48a, 0x3e8a2c);
      dibujarAveLejos(scene, 'cielo_ave0', 0);
      dibujarAveLejos(scene, 'cielo_ave1', 1);
      dibujarCastillo(scene, 'cielo_castillo');
    },

    enemigos: {
      a: {
        nombre: 'Alado gruñón',
        sprite: { textura: ['alado1', 'alado2', 'alado3', 'alado4', 'alado5', 'alado4', 'alado3', 'alado2'], fps: 12 },
        escala: 0.36,
        comportamiento: 'flota', velocidad: 40, rango: 2,
        cuerpo: { w: 46, h: 38 },
      },
      b: {
        nombre: 'Volador de hélice',
        sprite: { textura: ['volador_a', 'volador_b'], fps: 8 },
        escala: 0.44,
        comportamiento: 'nada', velocidad: 45, rango: 4,
        cuerpo: { w: 44, h: 46 },
      },
      c: {
        nombre: 'Abeja',
        sprite: { atlas: 'enemigos', frames: ['bee_a', 'bee_b'], fps: 8 },
        comportamiento: 'flota', velocidad: 40, rango: 2,
        cuerpo: { w: 44, h: 36 },
      },
      d: {
        nombre: 'Mosca curiosa',
        sprite: { atlas: 'enemigos', frames: ['fly_a', 'fly_b'], fps: 10 },
        comportamiento: 'persigue', velocidad: 45, rango: 6,
        cuerpo: { w: 40, h: 32 },
      },
      e: {
        nombre: 'Globo enfadado',
        sprite: { textura: ['cielo_globo_a', 'cielo_globo_b'], fps: 2 },
        comportamiento: 'flota', velocidad: 30, rango: 2,
        cuerpo: { w: 40, h: 44 },
      },
      f: {
        nombre: 'Pajarito',
        sprite: { textura: ['cielo_pajaro_a', 'cielo_pajaro_b'], fps: 6 },
        comportamiento: 'nada', velocidad: 50, rango: 5,
        cuerpo: { w: 42, h: 36 },
      },
      h: {
        nombre: 'Cometa',
        sprite: { textura: ['cielo_cometa_a', 'cielo_cometa_b'], fps: 3 },
        comportamiento: 'flota', velocidad: 35, rango: 1.5,
        cuerpo: { w: 36, h: 40 },
      },
      n: {
        nombre: 'Nube gruñona',
        sprite: { textura: ['nube_mala'] },
        escala: 0.5,
        comportamiento: 'fijo',
        pintable: false,
        cuerpo: { w: 110, h: 50 },
      },
    },

    niveles: [
      {
        nombre: 'Entre nubes',
        mapa: [
        '..........................',
        '..........................',
        '..........................',
        '..........................',
        '..........................',
        '..........................',
        '...........M..............',
        '........##########........',
        '..........................',
        '..........................',
        '.====...............====..',
        '..........................',
        '..........................',
        '############GGGGG#########',
        '..........................',
        '..........................',
        '..........................',
        '...........======.........',
        '..d.......................',
        '..........................',
        '...................e......',
        '..C.......................',
        '.====.....................',
        '..........a...............',
        '..........................',
        '.................=====....',
        '......h..............b....',
        '..........................',
        '..........====............',
        '..........................',
        '########GGGG##############',
        '..........................',
        '..........................',
        '..........................',
        '.......======.............',
        '....................C.....',
        '...................====...',
        '..c.......................',
        '...........f..............',
        '..........................',
        '.====.....................',
        '...............e..........',
        '..........................',
        '.........=====............',
        '..........................',
        '...a...............d......',
        '..........................',
        '##################GGGGG###',
        '..........................',
        '..........................',
        '..........................',
        '.................=======..',
        '..........................',
        '..L.......................',
        '.===.......b..............',
        '..........................',
        '......C...................',
        '.....===..=====...........',
        '.h........................',
        '..........................',
        '..............c...........',
        '###BBB##########..........',
        '..........................',
        '..........................',
        '###GGGG###################',
        '..........................',
        '..........................',
        '..........................',
        '..======..................',
        '..........................',
        '...............f..........',
        '..........................',
        '.....................Q....',
        '.........====.......====..',
        '..........................',
        '..e.......................',
        '..........................',
        '..............====........',
        '.....=====................',
        '..........................',
        '.....................a....',
        '..........................',
        '##########GGGGG###########',
        '..........................',
        '..........................',
        '..........................',
        '.........=======..........',
        '..........................',
        '...................b......',
        '..........................',
        '.C........................',
        '====......................',
        '..........................',
        '..............c...........',
        '..........................',
        '......................J...',
        '....................====..',
        '..........................',
        '...............====.......',
        '..........................',
        '..........====............',
        '..........................',
        '.....====.................',
        '...P......................',
        '##########################',
        '##########################',
        ],
        palabras: [
          { caja: 'la mano', respuesta: 'hand' },
          { caja: 'el pie', respuesta: 'foot' },
          { caja: 'la cabeza', respuesta: 'head' },
          { caja: 'el ojo', respuesta: 'eye' },
          { caja: 'la boca', respuesta: 'mouth' },
        ],
      },
      {
        nombre: 'El castillo',
        mapa: [
        '............................',
        '............................',
        '............................',
        '............................',
        '............................',
        '............................',
        '.............M..............',
        '..........##########........',
        '............................',
        '............................',
        '.====.................====..',
        '............................',
        '............................',
        '####GGGGGG##################',
        '............................',
        '............................',
        '............................',
        '...=======..................',
        '.........................C..',
        '.......................====.',
        '.............e..............',
        '............................',
        '..................a.........',
        '.====.......=====...........',
        '............................',
        '......h.............d.......',
        '............................',
        '.................=====......',
        '............................',
        '###############GGGGGG#######',
        '............................',
        '............................',
        '............................',
        '..............========......',
        '..C.........................',
        '.====.......................',
        '...........d................',
        '............................',
        '..........n.................',
        '..............=====.........',
        '............................',
        '............................',
        '#########BBBBB##....e.......',
        '............................',
        '............................',
        '#########GGGGG##############',
        '............................',
        '............................',
        '............................',
        '........=======.............',
        '............................',
        '......................K.....',
        '..a..................===....',
        '............................',
        '.C.........e................',
        '===...............====......',
        '............................',
        '..................c.........',
        '.....=====..................',
        '............................',
        '............................',
        '###################GGGGG####',
        '............................',
        '............................',
        '............................',
        '.................========...',
        '............................',
        '...V..........f.............',
        '............................',
        '..C.........................',
        '.===..........=====.........',
        '......................e.....',
        '............................',
        '.........====...............',
        '............................',
        '............................',
        '............................',
        '##GGGGGG####################',
        '............................',
        '............................',
        '............................',
        '.=========..................',
        '............................',
        '...............d............',
        '.........................Q..',
        '......................====..',
        '............................',
        '..........=====.............',
        '............................',
        '...................a........',
        '....====....................',
        '............................',
        '............................',
        '###########GGGGG############',
        '............................',
        '............................',
        '............................',
        '..........=======...........',
        '............................',
        '..e................f........',
        '............................',
        '..C.........................',
        '.====.........====..........',
        '............................',
        '............................',
        '............................',
        '.......====.................',
        '...................====.....',
        '............................',
        '#################GGGGGG#####',
        '............................',
        '............................',
        '............................',
        '................=========...',
        '............................',
        '.....b......................',
        '............................',
        '..............C.............',
        '.............====...........',
        '............................',
        '............................',
        '..................J.........',
        '................====........',
        '............................',
        '...........====.............',
        '............................',
        '......====..................',
        '............................',
        '..====......................',
        '.......P....................',
        '############################',
        '############################',
        ],
        palabras: [
          { caja: 'la madre', respuesta: 'mother' },
          { caja: 'el padre', respuesta: 'father' },
          { caja: 'el hermano', respuesta: 'brother' },
          { caja: 'la hermana', respuesta: 'sister' },
          { caja: 'el abuelo', respuesta: 'grandfather' },
          { caja: 'la abuela', respuesta: 'grandmother' },
          { caja: 'el bebé', respuesta: 'baby' },
        ],
      },
    ],
  });
})();
