// Mundo 2 — Arrecife de las Burbujas. Todo bajo el agua (fisica.nadar).
// Texturas propias: arrecife_medusa_a/b, arrecife_globo_a/b, arrecife_erizo_a/b, arrecife_rayo.
(function () {
  // ---------- utilidades de dibujo ----------
  const nuevo = scene => scene.make.graphics({ x: 0, y: 0, add: false });

  // Puntos de una elipse (para fillPoints/strokePoints con curvas suaves).
  function elipse(cx, cy, rx, ry, desde = 0, hasta = Math.PI * 2, n = 48) {
    const p = [];
    for (let i = 0; i <= n; i++) {
      const t = desde + (hasta - desde) * (i / n);
      p.push(new Phaser.Math.Vector2(cx + Math.cos(t) * rx, cy + Math.sin(t) * ry));
    }
    return p;
  }

  function ojo(g, x, y, r, mira = 0) {
    g.fillStyle(0xffffff, 1); g.fillEllipse(x, y, r * 2, r * 2.3);
    g.lineStyle(2, 0x2b2b3a, 0.35); g.strokeEllipse(x, y, r * 2, r * 2.3);
    g.fillStyle(0x2b2b3a, 1); g.fillCircle(x + mira, y + r * 0.25, r * 0.6);
    g.fillStyle(0xffffff, 1); g.fillCircle(x + mira - r * 0.25, y - r * 0.05, r * 0.24);
  }

  function sonrisa(g, x, y, r, color) {
    g.lineStyle(3, color, 1);
    g.beginPath(); g.arc(x, y, r, Phaser.Math.DegToRad(20), Phaser.Math.DegToRad(160), false); g.strokePath();
  }

  // ---------- medusa (64x64) ----------
  function medusa(scene, clave, fase) {
    const g = nuevo(scene);
    const rosa = 0xf79ac0, oscuro = 0xc2457f, claro = 0xffd3e6;
    // tentáculos ondulados
    const xs = [20, 28, 36, 44];
    xs.forEach((x0, i) => {
      const pts = [];
      for (let k = 0; k <= 12; k++) {
        const y = 36 + k * 2.1;
        const amp = 2.2 + k * 0.25;
        pts.push(new Phaser.Math.Vector2(x0 + Math.sin(k * 0.75 + fase * Math.PI + i * 1.3) * amp, y));
      }
      g.lineStyle(6, oscuro, 0.9); g.strokePoints(pts, false);
      g.lineStyle(3, i % 2 ? 0xffb8d6 : 0xf47fb0, 1); g.strokePoints(pts, false);
    });
    // campana: media elipse arriba + borde festoneado abajo
    const rx = 23 + (fase ? 1.5 : 0), ry = 20 - (fase ? 1.5 : 0), cx = 32, cy = 30;
    const pts = elipse(cx, cy, rx, ry, Math.PI, Math.PI * 2, 40);
    const n = 5;
    for (let i = 0; i <= n * 8; i++) {
      const t = i / (n * 8);
      const x = cx + rx - t * rx * 2;
      const y = cy + 4 + Math.abs(Math.sin(t * Math.PI * n)) * 4;
      pts.push(new Phaser.Math.Vector2(x, y));
    }
    g.fillStyle(rosa, 0.92); g.fillPoints(pts, true);
    g.lineStyle(3.5, oscuro, 1); g.strokePoints(pts, true);
    // interior más claro (translúcido) y brillo arriba-izquierda
    g.fillStyle(claro, 0.35); g.fillEllipse(cx, cy - 2, rx * 1.3, ry * 0.9);
    g.fillStyle(0xffffff, 0.85); g.fillEllipse(cx - 10, cy - 12, 10, 6);
    g.fillStyle(0xffffff, 0.6); g.fillCircle(cx - 3, cy - 15, 2);
    // mejillas, ojos y sonrisa
    g.fillStyle(0xff6fa3, 0.55); g.fillEllipse(cx - 14, cy + 1, 7, 4); g.fillEllipse(cx + 14, cy + 1, 7, 4);
    ojo(g, cx - 8, cy - 5, 5); ojo(g, cx + 8, cy - 5, 5);
    sonrisa(g, cx, cy - 1, 4.5, 0x8a2456);
    g.generateTexture(clave, 64, 64); g.destroy();
  }

  // ---------- pez globo (64x64), b = inflado ----------
  function globo(scene, clave, inflado) {
    const g = nuevo(scene);
    const am = 0xf6c453, oscuro = 0xb27a1f, panza = 0xfff0c2;
    const r = inflado ? 22 : 19, cx = 30, cy = 33;
    // cola (derecha) y aleta
    const cola = [[cx + r - 2, cy], [cx + r + 12, cy - 9], [cx + r + 9, cy], [cx + r + 12, cy + 9]].map(([x, y]) => new Phaser.Math.Vector2(x, y));
    g.fillStyle(0xf09a3e, 1); g.fillPoints(cola, true); g.lineStyle(3, oscuro, 1); g.strokePoints(cola, true);
    // púas suaves (redondeadas, sin filo)
    const np = inflado ? 14 : 10;
    for (let i = 0; i < np; i++) {
      const t = (i / np) * Math.PI * 2 + 0.2;
      if (Math.cos(t) > 0.7) continue; // no tapa la cola
      const x1 = cx + Math.cos(t) * (r - 2), y1 = cy + Math.sin(t) * (r - 2);
      const L = inflado ? 7 : 4;
      const x2 = cx + Math.cos(t) * (r + L), y2 = cy + Math.sin(t) * (r + L);
      g.lineStyle(6, oscuro, 1); g.lineBetween(x1, y1, x2, y2);
      g.fillStyle(oscuro, 1); g.fillCircle(x2, y2, 3);
      g.lineStyle(3, 0xf2b443, 1); g.lineBetween(x1, y1, x2, y2);
      g.fillStyle(0xf2b443, 1); g.fillCircle(x2, y2, 1.5);
    }
    // cuerpo
    g.fillStyle(am, 1); g.fillCircle(cx, cy, r);
    g.fillStyle(panza, 1); g.fillEllipse(cx + 1, cy + r * 0.45, r * 1.4, r * 0.9);
    g.lineStyle(3.5, oscuro, 1); g.strokeCircle(cx, cy, r);
    // manchas y brillo
    g.fillStyle(0xe7a43a, 0.8); g.fillCircle(cx + 6, cy - r * 0.55, 3); g.fillCircle(cx + 12, cy - r * 0.2, 2.2);
    g.fillStyle(0xffffff, 0.8); g.fillEllipse(cx - r * 0.45, cy - r * 0.55, 9, 5);
    // aleta lateral
    g.fillStyle(0xf09a3e, 1); g.fillEllipse(cx + 4, cy + 4, 9, 6); g.lineStyle(2.5, oscuro, 1); g.strokeEllipse(cx + 4, cy + 4, 9, 6);
    // cara mirando a la izquierda
    ojo(g, cx - 9, cy - 5, inflado ? 6 : 5.5, -1.5);
    g.fillStyle(0xff8f80, 0.6); g.fillEllipse(cx - 10, cy + 5, 6, 3.5);
    g.fillStyle(0x8a4f12, 1); g.fillEllipse(cx - r + 4, cy + 3, inflado ? 6 : 5, inflado ? 6 : 4);
    g.fillStyle(0xd9645a, 1); g.fillEllipse(cx - r + 4, cy + 3.5, inflado ? 3 : 2.5, inflado ? 3 : 2);
    g.generateTexture(clave, 64, 64); g.destroy();
  }

  // ---------- erizo de mar (64x64), apoyado abajo ----------
  function erizo(scene, clave, fase) {
    const g = nuevo(scene);
    const mor = 0x9a74dc, oscuro = 0x5b3c9a, claro = 0xc7b0f2;
    const cx = 32, cy = 47, rx = 18, ry = 14;
    const n = 15;
    for (let i = 0; i < n; i++) {
      const t = Math.PI + (i / (n - 1)) * Math.PI + (fase ? 0.05 : -0.05);
      const L = (i % 2 ? 6 : 9) + (fase ? 2 : 0);
      const x1 = cx + Math.cos(t) * (rx - 4), y1 = cy + Math.sin(t) * (ry - 4);
      const x2 = cx + Math.cos(t) * (rx + L), y2 = cy + Math.sin(t) * (ry + L);
      g.lineStyle(7, oscuro, 1); g.lineBetween(x1, y1, x2, y2);
      g.fillStyle(oscuro, 1); g.fillCircle(x2, y2, 3.5);
      g.lineStyle(3.5, i % 2 ? claro : 0xb08ee8, 1); g.lineBetween(x1, y1, x2, y2);
      g.fillStyle(0xe9dcff, 1); g.fillCircle(x2, y2, 1.8);
    }
    // cuerpo (cúpula)
    const cuerpo = elipse(cx, cy + 1, rx, ry + 2, 0, Math.PI * 2, 48);
    g.fillStyle(mor, 1); g.fillPoints(cuerpo, true);
    g.lineStyle(3.5, oscuro, 1); g.strokePoints(cuerpo, true);
    g.fillStyle(0xffffff, 0.7); g.fillEllipse(cx - 9, cy - 9, 9, 5);
    // cara
    ojo(g, cx - 7, cy - 1, 5); ojo(g, cx + 7, cy - 1, 5);
    g.fillStyle(0xff8fc0, 0.6); g.fillEllipse(cx - 13, cy + 7, 6, 3.5); g.fillEllipse(cx + 13, cy + 7, 6, 3.5);
    sonrisa(g, cx, cy + 3, 4.5, 0x3d2470);
    g.generateTexture(clave, 64, 64); g.destroy();
  }

  // Rayo de luz suave (degradado vertical que se desvanece).
  function rayo(scene) {
    const g = nuevo(scene);
    const W = 160, H = 720;
    for (let y = 0; y < H; y += 6) {
      const a = 0.22 * (1 - y / H);
      const w = 50 + (y / H) * 110;
      g.fillStyle(0xffffff, a);
      g.fillRect((W - w) / 2, y, w, 6);
    }
    g.generateTexture('arrecife_rayo', W, H); g.destroy();
  }

  // ---------- fondo ----------
  function fondo(scene, anchoPx, altoPx) {
    const cam = { w: 1280, h: 720 };
    const sy = 0.3;
    // degradado de agua (más claro arriba), fijo en X, lento en Y
    const gH = cam.h + Math.max(0, altoPx - cam.h) * sy + 80;
    const g = scene.add.graphics().setScrollFactor(0, sy).setDepth(-10);
    const arriba = Phaser.Display.Color.ValueToColor(0x5cb8e0), abajo = Phaser.Display.Color.ValueToColor(0x123a68);
    const bandas = 48;
    for (let i = 0; i < bandas; i++) {
      const c = Phaser.Display.Color.Interpolate.ColorWithColor(arriba, abajo, bandas - 1, i);
      g.fillStyle(Phaser.Display.Color.GetColor(c.r, c.g, c.b), 1);
      g.fillRect(-20, -40 + (gH / bandas) * i, cam.w + 40, gH / bandas + 1);
    }
    // rayos de luz desde la superficie
    const rayos = [];
    for (let i = 0; i < 6; i++) {
      const r = scene.add.image(100 + i * 230 + (i % 2) * 60, -40, 'arrecife_rayo')
        .setOrigin(0.5, 0).setScrollFactor(0.1, 0.15).setDepth(-9)
        .setAngle(-14 + (i % 3) * 3).setBlendMode(Phaser.BlendModes.ADD)
        .setScale(0.8 + (i % 3) * 0.35, 1.1).setAlpha(0.7);
      rayos.push(r);
      scene.tweens.add({ targets: r, alpha: 0.25, duration: 2600 + i * 500, yoyo: true, repeat: -1, ease: 'Sine.inOut', delay: i * 300 });
    }
    // capas de fondo marino (siluetas claras de Kenney) con parallax
    const capa = (s, escala, alpha, profundidad, semilla) => {
      const base = cam.h + Math.max(0, altoPx - cam.h) * s; // y de pantalla 720 con la cámara abajo del todo
      const ancho = cam.w + Math.max(0, anchoPx - cam.w) * s + 200;
      const paso = 64 * escala;
      const cont = scene.add.container(0, 0).setScrollFactor(s).setDepth(profundidad).setAlpha(alpha);
      for (let x = -100; x < ancho; x += paso) {
        cont.add(scene.add.image(x, base, 'peces', 'background_terrain_top').setOrigin(0, 1).setScale(escala));
        cont.add(scene.add.image(x, base + paso - 2, 'peces', 'background_terrain').setOrigin(0, 1).setScale(escala));
      }
      const algas = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
      let k = semilla;
      const azar = () => { k = (k * 9301 + 49297) % 233280; return k / 233280; };
      for (let x = -60; x < ancho; x += paso * (0.6 + azar() * 1.1)) {
        const roca = azar() < 0.25;
        const f = roca ? 'background_rock_' + (azar() < 0.5 ? 'a' : 'b') : 'background_seaweed_' + algas[Math.floor(azar() * 8)];
        const im = scene.add.image(x, base - paso + 8 * escala, 'peces', f).setOrigin(0.5, 1).setScale(escala * (0.9 + azar() * 0.6));
        if (azar() < 0.5) im.setFlipX(true);
        cont.add(im);
        if (!roca) scene.tweens.add({ targets: im, angle: { from: -3, to: 3 }, duration: 2200 + azar() * 1800, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
      }
      return cont;
    };
    capa(0.2, 1.6, 0.28, -8, 7);
    capa(0.45, 2.2, 0.45, -6, 31);
    // burbujas subiendo (fijas a la cámara, muy suaves)
    try {
      const em = scene.add.particles(0, 0, 'peces', {
        frame: ['bubble_a', 'bubble_b', 'bubble_c'],
        x: { min: 0, max: cam.w }, y: cam.h + 30,
        speedY: { min: -70, max: -35 }, speedX: { min: -12, max: 12 },
        scale: { min: 0.25, max: 0.6 }, alpha: { start: 0.75, end: 0 },
        lifespan: 11000, frequency: 260, quantity: 1,
      });
      em.setScrollFactor(0).setDepth(-3);
      em.fastForward && em.fastForward(9000);
    } catch (e) { /* sin partículas no pasa nada */ }
  }

  function texturas(scene) {
    medusa(scene, 'arrecife_medusa_a', 0); medusa(scene, 'arrecife_medusa_b', 1);
    globo(scene, 'arrecife_globo_a', false); globo(scene, 'arrecife_globo_b', true);
    erizo(scene, 'arrecife_erizo_a', 0); erizo(scene, 'arrecife_erizo_b', 1);
    rayo(scene);
  }

  CAJAS.registrarMundo({
    id: 'arrecife',
    nombre: 'Arrecife de las Burbujas',
    orden: 2,
    terreno: 'sand',
    colorCielo: '#1F5C8F',
    fisica: { gravedad: 520, salto: 380, velocidad: 220, aceleracion: 1100, frenado: 800, nadar: true },
    fondo,
    texturas,
    enemigos: {
      p: { nombre: 'Pez amarillo', sprite: { atlas: 'enemigos', frames: ['fish_yellow_swim_a', 'fish_yellow_swim_b'], fps: 4 },
           comportamiento: 'nada', velocidad: 45, rango: 4, cuerpo: { w: 44, h: 30 } },
      q: { nombre: 'Pez azul', sprite: { atlas: 'enemigos', frames: ['fish_blue_swim_a', 'fish_blue_swim_b'], fps: 4 },
           comportamiento: 'nada', velocidad: 35, rango: 5, cuerpo: { w: 44, h: 30 } },
      r: { nombre: 'Pez lila', sprite: { atlas: 'enemigos', frames: ['fish_purple_up', 'fish_purple_down'], fps: 3 },
           comportamiento: 'flota', velocidad: 30, rango: 1.5, cuerpo: { w: 36, h: 44 } },
      m: { nombre: 'Medusa', sprite: { textura: ['arrecife_medusa_a', 'arrecife_medusa_b'], fps: 3 },
           comportamiento: 'flota', velocidad: 30, rango: 1.5, cuerpo: { w: 40, h: 44 } },
      g: { nombre: 'Pez globo', sprite: { textura: ['arrecife_globo_a', 'arrecife_globo_b'], fps: 1.5 },
           comportamiento: 'flota', velocidad: 25, rango: 2, cuerpo: { w: 40, h: 40 } },
      e: { nombre: 'Erizo', sprite: { textura: ['arrecife_erizo_a', 'arrecife_erizo_b'], fps: 2 },
           comportamiento: 'fijo', cuerpo: { w: 44, h: 30 } },
    },
    niveles: [
      {
        nombre: 'Jardín de coral',
        mapa: [
        '########################################################################################',
        '#######...............#############.......................#################...........##',
        '......................................................................................##',
        '............................................................m.#############.............',
        '..........................g...................................#############.......C.....',
        '.......C......................................................##........K##....#######..',
        '....#######.........................#################..####...BB.........##.............',
        '...................C.....................#######.......####...BB.........##.............',
        '..................####.................................####...BB....C....##.............',
        '..................####...........q.....................####...#############.............',
        '..........q.......####........Q...............................#############.............',
        '..................####.....######.......................................................',
        '......g...........####......####........................m.......................m.......',
        '..................####..................................................................',
        '.................#####..................................................................',
        '............p....#####..............#################..####.......p........r............',
        '..................####..............#################..####.............................',
        '..................####....................#####........####.............................',
        '..................####....m............................####.............................',
        '..................B..#............r....................####.............................',
        '..................BV.#.................................####...##........................',
        '...P..............####..e..............Q.........e.....####...##........................',
        '##########......#################################################.......################',
        '#########..C.e..#################################################..e..C.################',
        '########################################################################################',
        '########################################################################################',
      ],
        palabras: [
          { caja: 'el pez', respuesta: 'fish' },
          { caja: 'la ballena', respuesta: 'whale' },
          { caja: 'el pulpo', respuesta: 'octopus' },
          { caja: 'la estrella de mar', respuesta: 'starfish' },
          { caja: 'el cangrejo', respuesta: 'crab' },
          { caja: 'la tortuga', respuesta: 'turtle' },
          { caja: 'el tiburón', respuesta: 'shark' },
          { caja: 'la concha', respuesta: 'shell' },
        ],
      },
      {
        nombre: 'Laberinto azul',
        mapa: [
        '##############################################################################################',
        '......................................................................#.......................',
        '......................#.......#.....................................V.#.......................',
        '......................#.......#.....C.................................#....................m..',
        '.################.....#.......#...###########################...###...#...###############.....',
        '......###.............#...#...#...#.........................#...###...#...#...................',
        '......###.............#...#...#...#.........................#...###...#...#...................',
        '......###......C......#...#...#...#............C............#...###...#...#.........C.........',
        '......###...###########...#.......#BBBBB###############BBBBB#...###.m.#...#...#############.r.',
        '......BBB.................#.......#.........................#...###...#...#...................',
        '......BBB.................#...#...#.........................#...###...........................',
        '......###.........m.......#...#.................................###.........g.................',
        '......###...###############...#......m...................m......###...........................',
        '..C...###.....................#.......................................#######################.',
        '#####.###.....................#...............................................................',
        '......###...........p.........#.................................###...........................',
        '......###...###################.................................###.....p.....................',
        '......###...#..........................#################........###...........................',
        '......###...#..........................#################........#######################..#####',
        '............#.........Q......................#####..............###...................#.......',
        '............#...#########....................#####..............###...................#.......',
        '......###...#................................#####........#####.###........C..........#.......',
        '......###.g...........................q......#####......r.......###...###########.....#.......',
        '......###....................................#####............................................',
        '..P...###...................e.............e..#####..e....................................e.Q..',
        '##############################################################################################',
        '##############################################################################################',
        '##############################################################################################',
      ],
        palabras: [
          { caja: 'azul', respuesta: 'blue' },
          { caja: 'verde', respuesta: 'green' },
          { caja: 'el agua', respuesta: 'water' },
          { caja: 'la playa', respuesta: 'beach' },
          { caja: 'el barco', respuesta: 'boat' },
          { caja: 'la arena', respuesta: 'sand' },
          { caja: 'la ola', respuesta: 'wave' },
          { caja: 'nadar', respuesta: 'swim' },
        ],
      },
    ],
  });
})();
