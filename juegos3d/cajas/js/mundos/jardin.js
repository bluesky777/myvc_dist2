// Mundo 1 — Jardín de Tinta. Pradera con cascadas, tinta regada que anda y tortugas lentas.
// Contrato: docs/juego-cajas/CONTRATO.md
(function () {
  // ---------- utilidades de dibujo (estilo Kenney: contorno grueso del mismo tono, brillo arriba-izq.) ----------
  function elipsePts(cx, cy, rx, ry, a0, a1, n) {
    const p = [];
    for (let i = 0; i <= n; i++) {
      const a = a0 + (a1 - a0) * (i / n);
      p.push({ x: cx + Math.cos(a) * rx, y: cy + Math.sin(a) * ry });
    }
    return p;
  }
  function hexPts(cx, cy, r, ry) {
    const p = [];
    for (let i = 0; i < 6; i++) {
      const a = Math.PI / 6 + (i * Math.PI) / 3;
      p.push({ x: cx + Math.cos(a) * r, y: cy + Math.sin(a) * (ry || r) });
    }
    return p;
  }
  function ojo(g, x, y, r, dx, dy, borde) {
    g.fillStyle(borde, 1); g.fillCircle(x, y, r + 2.5);
    g.fillStyle(0xffffff, 1); g.fillCircle(x, y, r);
    g.fillStyle(0x23233a, 1); g.fillCircle(x + dx, y + dy, r * 0.55);
    g.fillStyle(0xffffff, 1); g.fillCircle(x + dx - r * 0.2, y + dy - r * 0.25, r * 0.2);
  }
  function sonrisa(g, x, y, r, color, grosor) {
    g.lineStyle(grosor || 3, color, 1);
    g.beginPath(); g.arc(x, y, r, Math.PI * 0.15, Math.PI * 0.85, false); g.strokePath();
  }

  // Mancha de tinta con ojos: cúpula blanda con gotas salpicadas en la base.
  function dibujarTinta(scene, clave, f) {
    const g = scene.make.graphics({ x: 0, y: 0, add: false });
    const BORDE = 0x1f2770, CUERPO = 0x3a4bc4, CLARO = 0x6f82ec, SOMBRA = 0x2c3a9e;
    const ancho = f ? 21 : 18, alto = f ? 18 : 22, cx = 32, base = 51;
    const forma = (ex, col) => {
      g.fillStyle(col, 1);
      g.fillPoints(elipsePts(cx, base - 4, ancho + ex, alto + ex, Math.PI, Math.PI * 2, 40), true);
      g.fillRoundedRect(cx - ancho - ex, base - 10 - ex, (ancho + ex) * 2, 10 + ex * 2, 6);
      // salpicaduras de la base
      g.fillCircle(cx - ancho - 1, base, 4.5 + ex);
      g.fillCircle(cx + ancho + 1, base, 4.5 + ex);
      g.fillCircle(cx - ancho + 8, base + 2, 4.5 + ex);
      g.fillCircle(cx + ancho - 8, base + 2, 4.5 + ex);
      // gotita suelta que cambia de lado entre frames
      g.fillCircle(f ? cx + ancho + 2 : cx - ancho - 2, base + 6, 2.5 + ex);
    };
    forma(3.5, BORDE);
    forma(0, CUERPO);
    // sombra baja y brillo
    g.fillStyle(SOMBRA, 1);
    g.fillEllipse(cx, base - 2, ancho * 1.7, 6);
    g.fillStyle(CLARO, 1);
    g.fillEllipse(cx - ancho * 0.45, base - alto - 1, ancho * 0.6, alto * 0.35);
    g.fillStyle(0xffffff, 0.8);
    g.fillCircle(cx - ancho * 0.62, base - alto - 2, 2.5);
    // gotita en la punta
    g.fillStyle(BORDE, 1); g.fillEllipse(cx + 2, base - alto - 7, 9, 11);
    g.fillStyle(CUERPO, 1); g.fillEllipse(cx + 2, base - alto - 6.5, 5, 7);
    // ojos grandes que miran (cambian entre frames)
    const oy = base - alto * 0.62, mira = f ? 2.5 : -2.5;
    ojo(g, cx - 8, oy, 7, mira, 1, BORDE);
    ojo(g, cx + 8, oy, 7, mira, 1, BORDE);
    // mejillas y sonrisa
    g.fillStyle(0x8b9af5, 0.9);
    g.fillEllipse(cx - 15, oy + 8, 6, 3.5);
    g.fillEllipse(cx + 15, oy + 8, 6, 3.5);
    sonrisa(g, cx, oy + 5, 5, BORDE, 3);
    g.generateTexture(clave, 64, 64);
    g.destroy();
  }

  // Tortuga: caparazón verde de hexágonos, cabeza simpática mirando a la izquierda, patitas que alternan.
  function dibujarTortuga(scene, clave, f) {
    const g = scene.make.graphics({ x: 0, y: 0, add: false });
    const PIEL = 0x9fd86b, PIEL_B = 0x4c7f2c, PIEL_C = 0xc4ec97;
    const CAPA = 0x48a843, CAPA_B = 0x23602a, CAPA_C = 0x78cf5f, CAPA_H = 0x3a8f3a;
    const ARO = 0xe9c46a, ARO_B = 0x9c7426;
    const cx = 39, base = 46, rx = 19, ry = 20;
    // patitas (detrás), alternan
    const pata = (x, adelante) => {
      const dx = adelante ? -3 : 3;
      g.fillStyle(PIEL_B, 1); g.fillRoundedRect(x + dx - 6.5, base - 4, 13, 16, 6);
      g.fillStyle(PIEL, 1); g.fillRoundedRect(x + dx - 4, base - 2, 8, 12, 4);
      g.fillStyle(PIEL_C, 1); g.fillEllipse(x + dx - 1, base + 1, 3, 4);
    };
    pata(cx - 11, f === 0); pata(cx + 11, f !== 0);
    // colita
    g.fillStyle(PIEL_B, 1); g.fillTriangle(cx + rx - 2, base - 9, cx + rx - 2, base + 1, cx + rx + 7, base - 2);
    g.fillStyle(PIEL, 1); g.fillTriangle(cx + rx - 2, base - 6, cx + rx - 2, base - 1, cx + rx + 4, base - 3);
    // cabeza (sube y baja un poco)
    const hy = f ? 31 : 33, hx = 15;
    g.fillStyle(PIEL_B, 1); g.fillRoundedRect(hx + 4, hy + 2, 16, 12, 5); // cuello
    g.fillCircle(hx, hy, 13.5);
    g.fillStyle(PIEL, 1); g.fillRoundedRect(hx + 5, hy + 4.5, 14, 7, 3);
    g.fillCircle(hx, hy, 10.5);
    g.fillStyle(PIEL_C, 1); g.fillEllipse(hx - 3, hy - 5, 7, 4);
    ojo(g, hx - 2, hy - 2, 6, -1.8, 0.5, PIEL_B);
    g.fillStyle(0xf29bb0, 0.9); g.fillEllipse(hx + 5, hy + 4, 5, 3);
    sonrisa(g, hx - 4, hy + 2, 4, PIEL_B, 2.5);
    // caparazón: contorno, cúpula, aro inferior
    g.fillStyle(CAPA_B, 1);
    g.fillPoints(elipsePts(cx, base, rx + 3.5, ry + 3.5, Math.PI, Math.PI * 2, 48), true);
    g.fillStyle(CAPA, 1);
    g.fillPoints(elipsePts(cx, base, rx, ry, Math.PI, Math.PI * 2, 48), true);
    // hexágonos
    const hexas = [[cx, base - 11], [cx - 10, base - 5], [cx + 10, base - 5], [cx - 5.5, base - 18], [cx + 6, base - 18]];
    for (const [x, y] of hexas) {
      g.fillStyle(CAPA_H, 1); g.fillPoints(hexPts(x, y, 6.6, 6), true);
      g.fillStyle(CAPA_C, 1); g.fillPoints(hexPts(x - 0.6, y - 0.8, 4.4, 3.9), true);
    }
    // brillo arriba-izquierda
    g.fillStyle(0xffffff, 0.45); g.fillEllipse(cx - 9, base - 17, 7, 4);
    // aro amarillo del borde
    g.fillStyle(ARO_B, 1); g.fillRoundedRect(cx - rx - 4, base - 3.5, (rx + 4) * 2, 9, 4.5);
    g.fillStyle(ARO, 1); g.fillRoundedRect(cx - rx - 1.5, base - 1.5, (rx + 1.5) * 2, 5, 2.5);
    g.generateTexture(clave, 64, 64);
    g.destroy();
  }

  // ---------- fondo con parallax ----------
  // Los fondos de Kenney son opacos: el cielo de las colinas es blanco. Para apilarlos en parallax se saca
  // una copia con el blanco transparente (desmezclando el antialias del borde contra el blanco).
  function sinBlanco(scene, frame) {
    const clave = 'jardin_fondo_' + frame;
    if (scene.textures.exists(clave)) return clave;
    const f = scene.textures.getFrame('fondos', frame);
    const ct = scene.textures.createCanvas(clave, f.cutWidth, f.cutHeight);
    const cx = ct.getContext();
    cx.drawImage(f.source.image, f.cutX, f.cutY, f.cutWidth, f.cutHeight, 0, 0, f.cutWidth, f.cutHeight);
    const img = cx.getImageData(0, 0, f.cutWidth, f.cutHeight), d = img.data;
    for (let i = 0; i < d.length; i += 4) {
      const a = Math.min(1, (255 - Math.min(d[i], d[i + 1], d[i + 2])) / 60);
      if (a <= 0.02) { d[i + 3] = 0; continue; }
      for (let k = 0; k < 3; k++) d[i + k] = Math.max(0, Math.min(255, (d[i + k] - (1 - a) * 255) / a));
      d[i + 3] = Math.round(a * 255);
    }
    cx.putImageData(img, 0, 0);
    ct.refresh();
    return clave;
  }

  // Una capa: tileSprite de 256 px que, con la cámara abajo del todo, apoya su borde inferior `abajo` px
  // por encima del borde de la pantalla. sx/sy = scrollFactor horizontal/vertical.
  function capa(scene, anchoPx, altoPx, tex, frame, sx, sy, escala, prof, abajo, relleno) {
    const H = 256 * escala;
    const ancho = 1280 + Math.max(0, anchoPx - 1280) * sx + 256;
    const y = (720 - H - abajo) + Math.max(0, altoPx - 720) * sy;
    // Sin repetir en vertical: se recortan 2 px arriba y abajo para que el filtrado no traiga la fila
    // opuesta de la textura (eso pintaba una línea fina horizontal en el borde de la capa).
    scene.add.tileSprite(0, y + 2 * escala, ancho / escala, 252, tex, frame)
      .setTilePosition(0, 2)
      .setOrigin(0, 0).setScale(escala).setScrollFactor(sx, sy).setDepth(prof);
    // relleno bajo la capa (su parte inferior es opaca): tapa lo de detrás si la cámara baja más
    scene.add.rectangle(0, y + H - 3 * escala, ancho, 3000, relleno)
      .setOrigin(0, 0).setScrollFactor(sx, sy).setDepth(prof);
  }

  CAJAS.registrarMundo({
    id: 'jardin',
    nombre: 'Jardín de Tinta',
    orden: 1,
    terreno: 'grass',
    colorCielo: '#C3E3FF',
    fisica: { gravedad: 1500, salto: 820, velocidad: 260, aceleracion: 2400, frenado: 2400, nadar: false },

    fondo(scene, anchoPx, altoPx) {
      // nubes lejanas (casi quietas), colinas claras, colinas con árboles cerca
      // nubes (opacas: cielo arriba, blanco abajo), colinas lejanas que tapan ese blanco y colinas con
      // árboles delante. Nubes y colinas lejanas comparten el desplazamiento vertical.
      capa(scene, anchoPx, altoPx, 'fondos', 'background_clouds', 0.05, 0.12, 2, -10, 300, 0xffffff);
      capa(scene, anchoPx, altoPx, sinBlanco(scene, 'background_fade_hills'), undefined, 0.18, 0.12, 2, -8, 270, 0xc3e3ff);
      capa(scene, anchoPx, altoPx, sinBlanco(scene, 'background_color_trees'), undefined, 0.4, 0.35, 2, -6, 170, 0x2ecc71);
    },

    texturas(scene) {
      dibujarTinta(scene, 'jardin_tinta_a', 0);
      dibujarTinta(scene, 'jardin_tinta_b', 1);
      dibujarTortuga(scene, 'jardin_tortuga_a', 0);
      dibujarTortuga(scene, 'jardin_tortuga_b', 1);
    },

    enemigos: {
      a: {
        nombre: 'Tinta regada',
        sprite: { textura: ['jardin_tinta_a', 'jardin_tinta_b'], fps: 3 },
        comportamiento: 'patrulla', velocidad: 35,
        cuerpo: { w: 46, h: 30 },
      },
      b: {
        nombre: 'Tortuga',
        sprite: { textura: ['jardin_tortuga_a', 'jardin_tortuga_b'], fps: 3 },
        comportamiento: 'patrulla', velocidad: 28,
        cuerpo: { w: 52, h: 34 },
      },
      c: {
        nombre: 'Abeja dormilona',
        sprite: { atlas: 'enemigos', frames: ['bee_a', 'bee_b'], fps: 6 },
        comportamiento: 'flota', velocidad: 40, rango: 2,
        cuerpo: { w: 44, h: 36 },
      },
      d: {
        nombre: 'Mariquita',
        sprite: { atlas: 'enemigos', frames: ['ladybug_walk_a', 'ladybug_walk_b'], fps: 5 },
        comportamiento: 'patrulla', velocidad: 40,
        cuerpo: { w: 50, h: 32 },
      },
    },

    niveles: [
      {
        nombre: 'La pradera',
      mapa: [
        '........................................................................................',
        '........................................................................................',
        '........................................................................................',
        '....................................c...................................................',
        '..........................c.............................................................',
        '........................................................................................',
        '..............................................................c.........................',
        '.C.............C......a.......L..Q..................................d.C.................',
        '=====.....=======..=======..=======...............................======................',
        '........................................................................................',
        '....=====...................................................=====.......................',
        '.........................................................C..............................',
        '..........====.................................c.......====.............................',
        '........................................................................................',
        '.....====.........................................====..................................',
        '.......................................C................................................',
        '..........====........................#####|...........====.............................',
        '......................................B...#|.................................B..........',
        '.....====.........................===.B...#|.===..====.......................B..........',
        '..P...........a..........b......d.....BV.Q#|....b.......a.......b............B..a..d..C.',
        '####################..#####################~~#############################..############',
        '####################..#####################~~#############################..############',
        '####################..####################################################..############',
        '####################..####################################################..############',
      ],
        palabras: [
          { caja: 'el perro', respuesta: 'dog' },
          { caja: 'el gato', respuesta: 'cat' },
          { caja: 'la casa', respuesta: 'house' },
          { caja: 'el árbol', respuesta: 'tree' },
          { caja: 'el sol', respuesta: 'sun' },
          { caja: 'la manzana', respuesta: 'apple' },
          { caja: 'el libro', respuesta: 'book' },
          { caja: 'rojo', respuesta: 'red' },
        ],
      },
      {
        nombre: 'El estanque',
      mapa: [
        '............................................................................................',
        '............................................................................................',
        '............................................................................................',
        '............................................................................................',
        '.........................................................................c..................',
        '.....................................................................................d...C..',
        '.................................................................................|##########',
        '................................................................c..........=====.|##########',
        '............................................................K....................|##########',
        '...............................c................a.....d....=====......Q..........|##########',
        '...........................................###############........=======........|##########',
        '.................................................................................|##########',
        '..................................C..b...........................................|##########',
        '................................#########|......................====.........c...|##########',
        '................................#########|.......................................|##########',
        '.C........................C.....#######..|.......................................|##########',
        '####.....................=====..#######..|..................####.................|##########',
        '................................#######.C|.......................................|##########',
        '................................#########|.......................................|...B.....#',
        '....====....................===.B.......B|.===..................===..............|...B.....#',
        '................................B.......B|.......................................|...B.....#',
        '..P......d......................B...a...B|.......d......b..................a.....|...b.V.Q.#',
        '##########..##...............############~~#########################..##########~~##########',
        '##########..##...a...C..a....############~~#########################..##########~~##########',
        '##########..########################################################..######################',
        '##########..########################################################..######################',
      ],
        palabras: [
          { caja: 'la flor', respuesta: 'flower' },
          { caja: 'el pájaro', respuesta: 'bird' },
          { caja: 'la mariposa', respuesta: 'butterfly' },
          { caja: 'la hoja', respuesta: 'leaf' },
          { caja: 'el agua', respuesta: 'water' },
          { caja: 'la lluvia', respuesta: 'rain' },
          { caja: 'la rana', respuesta: 'frog' },
          { caja: 'verde', respuesta: 'green' },
        ],
      },
    ],
  });
})();
