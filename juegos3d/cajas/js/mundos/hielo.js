// Mundo 4 — Hielo. Suelo resbaloso, pingüinos que se tiran de panza, orcas que saltan del agua helada.
// Texturas propias: hielo_pinguino_a/b, hielo_orca_a/b, hielo_muneco_a/b y las del fondo.
(function () {
  // ---------- utilidades de dibujo ----------
  function lienzo(scene) { return scene.make.graphics({ x: 0, y: 0, add: false }); }
  function guardar(scene, g, clave, w, h) {
    if (scene.textures.exists(clave)) scene.textures.remove(clave);
    g.generateTexture(clave, w, h);
    g.destroy();
  }
  // Elipse rotada (rotateCanvas) con contorno: primero el borde inflado, luego el relleno.
  function elipseRot(g, x, y, rx, ry, ang, relleno, borde, grosor) {
    g.save(); g.translateCanvas(x, y); g.rotateCanvas(ang);
    if (borde !== undefined) { g.fillStyle(borde, 1); g.fillEllipse(0, 0, (rx + grosor) * 2, (ry + grosor) * 2, 40); }
    g.fillStyle(relleno, 1); g.fillEllipse(0, 0, rx * 2, ry * 2, 40);
    g.restore();
  }
  function ojo(g, x, y, r, mirax, pupila) {
    g.fillStyle(0xFFFFFF, 1); g.fillCircle(x, y, r);
    g.fillStyle(pupila, 1); g.fillCircle(x + mirax, y + 0.5, r * 0.62);
    g.fillStyle(0xFFFFFF, 1); g.fillCircle(x + mirax - r * 0.25, y - r * 0.25, r * 0.22);
  }
  function arco(g, cx, cy, r, a0, a1, color, ancho) {
    g.lineStyle(ancho, color, 1); g.beginPath(); g.arc(cx, cy, r, a0, a1, false); g.strokePath();
  }

  // ---------- pingüino 64×64, de cuerpo entero ----------
  function pinguino(scene, clave, fase) {
    const g = lienzo(scene);
    g.translateCanvas(0, -3);
    const AZUL = 0x3A4D78, AZUL_B = 0x1E2A47, NAR = 0xFFA233, NAR_B = 0xC4650F;
    // patas
    const pie = fase ? 1.5 : -1.5;
    elipseRot(g, 23, 57 - pie * 0.4, 8, 4, -0.15, NAR, NAR_B, 3);
    elipseRot(g, 41, 57 + pie * 0.4, 8, 4, 0.15, NAR, NAR_B, 3);
    // aletas (detrás del cuerpo): arriba en _a, abajo en _b
    const ang = fase ? 0.35 : 1.05;
    elipseRot(g, 13, 38, 5, 12, ang, AZUL, AZUL_B, 3);
    elipseRot(g, 51, 38, 5, 12, -ang, AZUL, AZUL_B, 3);
    // cuerpo gordito
    g.fillStyle(AZUL_B, 1); g.fillEllipse(32, 35, 46, 50, 48);
    g.fillStyle(AZUL, 1); g.fillEllipse(32, 35, 39, 43, 48);
    // brillo arriba-izquierda
    g.fillStyle(0x7F95C4, 1); g.fillEllipse(21, 20, 10, 6, 24);
    // cara y panza blancas
    g.fillStyle(0xFFFFFF, 1);
    g.fillEllipse(32, 42, 28, 30, 40);
    g.fillCircle(26, 25, 8.5); g.fillCircle(38, 25, 8.5);
    g.fillEllipse(32, 31, 22, 14, 32);
    g.fillStyle(0xE3ECF7, 1); g.fillEllipse(35, 49, 16, 8, 24);
    // ojos grandes
    ojo(g, 26, 24, 5.5, 0.8, 0x1E2A47);
    ojo(g, 38, 24, 5.5, 0.8, 0x1E2A47);
    // mejillas
    g.fillStyle(0xFF9AA8, 0.7); g.fillEllipse(20, 32, 6, 4, 16); g.fillEllipse(44, 32, 6, 4, 16);
    // pico
    g.fillStyle(NAR_B, 1); g.fillEllipse(32, 32, 13, 9, 24);
    g.fillStyle(NAR, 1); g.fillEllipse(32, 31.5, 9.5, 6, 24);
    g.fillStyle(0xFFD08A, 1); g.fillEllipse(30.5, 30.5, 3.5, 2, 12);
    guardar(scene, g, clave, 64, 64);
  }

  // ---------- orca 128×64, sonriente, sin dientes ----------
  function orca(scene, clave, fase) {
    const g = lienzo(scene);
    const NEG = 0x34405E, NEG_B = 0x182036, BLA = 0xFFFFFF;
    const cola = fase ? -0.35 : 0.35;
    // aleta caudal (dos lóbulos) y pedúnculo
    elipseRot(g, 113, 32 - 8 + cola * 6, 11, 5, -0.7 + cola, NEG, NEG_B, 3);
    elipseRot(g, 113, 32 + 8 + cola * 6, 11, 5, 0.7 + cola, NEG, NEG_B, 3);
    g.fillStyle(NEG_B, 1); g.fillTriangle(84, 21, 84, 47, 112, 32 + cola * 6);
    // aleta dorsal
    g.fillStyle(NEG_B, 1); g.fillTriangle(50, 18, 78, 18, 71, 2);
    g.fillStyle(NEG, 1); g.fillTriangle(55, 18, 74, 18, 70, 7);
    // cuerpo
    g.fillStyle(NEG_B, 1); g.fillEllipse(58, 35, 100, 44, 56);
    g.fillStyle(NEG, 1); g.fillTriangle(86, 25, 86, 43, 108, 32 + cola * 6);
    g.fillStyle(NEG, 1); g.fillEllipse(58, 35, 93, 37, 56);
    // brillo
    g.fillStyle(0x6E7FA6, 1); g.fillEllipse(44, 22, 26, 5, 24);
    // panza blanca y mancha del ojo
    g.fillStyle(BLA, 1); g.fillEllipse(48, 44, 62, 16, 40);
    g.fillStyle(BLA, 1); g.fillEllipse(84, 41, 16, 7, 24);
    g.fillStyle(0xE3ECF7, 1); g.fillEllipse(54, 49, 36, 5, 24);
    g.fillStyle(BLA, 1); elipseRot(g, 44, 26, 9, 4.5, -0.2, BLA);
    // aleta pectoral (alterna)
    elipseRot(g, 58, 49, 11, 5, fase ? 0.9 : 0.4, NEG, NEG_B, 3);
    // ojo grande
    ojo(g, 27, 29, 6.5, -1, NEG_B);
    // sonrisa y mejilla
    arco(g, 22, 33, 10, 0.35 * Math.PI, 0.82 * Math.PI, NEG_B, 3);
    arco(g, 22, 33, 10, 0.35 * Math.PI, 0.82 * Math.PI, NEG_B, 3);
    g.fillStyle(0xFF9AA8, 0.75); g.fillEllipse(34, 38, 7, 4, 16);
    guardar(scene, g, clave, 128, 64);
  }

  // ---------- muñeco de nieve 64×64 (patrulla) ----------
  function muneco(scene, clave, fase) {
    const g = lienzo(scene);
    const NIE = 0xF6FAFF, NIE_B = 0x7F97B8, SOM = 0xD9E5F3, ROJ = 0xE8564F, ROJ_B = 0xA8302C;
    const ramas = 0x8A5A33, ramasB = 0x5C3A1E;
    // brazos de rama
    const br = fase ? -4 : 4;
    g.lineStyle(6, ramasB, 1); g.lineBetween(18, 40, 5, 31 + br); g.lineBetween(46, 40, 59, 31 - br);
    g.lineStyle(3, ramas, 1); g.lineBetween(18, 40, 5, 31 + br); g.lineBetween(46, 40, 59, 31 - br);
    // cuerpo
    g.fillStyle(NIE_B, 1); g.fillCircle(32, 46, 17.5);
    g.fillStyle(NIE, 1); g.fillCircle(32, 46, 14);
    g.fillStyle(SOM, 1); g.fillEllipse(36, 52, 18, 8, 24);
    g.fillStyle(0x4A5878, 1); g.fillCircle(32, 42, 2); g.fillCircle(32, 50, 2);
    // cabeza
    g.fillStyle(NIE_B, 1); g.fillCircle(32, 23, 13.5);
    g.fillStyle(NIE, 1); g.fillCircle(32, 23, 10);
    g.fillStyle(0xFFFFFF, 1); g.fillEllipse(27, 18, 6, 4, 16);
    // bufanda
    g.fillStyle(ROJ_B, 1); g.fillRoundedRect(17, 30, 30, 8, 4);
    g.fillStyle(ROJ, 1); g.fillRoundedRect(19, 31.5, 26, 5, 2.5);
    g.fillStyle(ROJ_B, 1); g.fillRoundedRect(36 + (fase ? 1 : 0), 33, 8, 13, 3);
    g.fillStyle(ROJ, 1); g.fillRoundedRect(37.5 + (fase ? 1 : 0), 34.5, 5, 10, 2);
    // gorro azul con pompón
    g.fillStyle(0x2E6DB4, 1); g.fillEllipse(32, 13, 24, 13, 32);
    g.fillStyle(0x4C93E0, 1); g.fillEllipse(32, 13, 19, 9, 32);
    g.fillStyle(0x2E6DB4, 1); g.fillRoundedRect(19, 13, 26, 5, 2.5);
    g.fillStyle(NIE_B, 1); g.fillCircle(32, 5, 4.5); g.fillStyle(NIE, 1); g.fillCircle(32, 5, 3);
    // ojos, zanahoria, sonrisa
    ojo(g, 27.5, 22, 3.6, 0.4, 0x2A3348);
    ojo(g, 36.5, 22, 3.6, 0.4, 0x2A3348);
    g.fillStyle(0xC4650F, 1); g.fillTriangle(32, 24, 32, 29, 19, 27);
    g.fillStyle(0xFF9A2E, 1); g.fillTriangle(31, 25, 31, 28, 21.5, 27);
    arco(g, 34, 25, 4, 0.2 * Math.PI, 0.8 * Math.PI, 0x2A3348, 1.8);
    guardar(scene, g, clave, 64, 64);
  }

  // ---------- fondo ----------
  function montes(scene, clave, w, h, cuerpo, borde, nieve, picos, semilla) {
    const g = lienzo(scene);
    let s = semilla;
    const azar = () => { s = (s * 9301 + 49297) % 233280; return s / 233280; };
    // cordillera como polígono de picos suaves
    const pts = [{ x: 0, y: h }];
    const cimas = [];
    for (let i = 0; i <= picos; i++) {
      const x = (i / picos) * w;
      const cima = h * (0.18 + azar() * 0.32);
      const valle = h * (0.55 + azar() * 0.15);
      if (i > 0) pts.push({ x: x - w / picos / 2, y: valle });
      pts.push({ x, y: i === 0 || i === picos ? h * 0.42 : cima });
      cimas.push({ x, y: i === 0 || i === picos ? h * 0.42 : cima });
    }
    pts.push({ x: w, y: h });
    g.fillStyle(borde, 1); g.fillPoints(pts.map(p => ({ x: p.x, y: p.y - 3 })), true);
    g.fillStyle(cuerpo, 1); g.fillPoints(pts, true);
    // casquetes de nieve
    g.fillStyle(nieve, 1);
    for (const c of cimas) {
      const a = (h - c.y) * 0.32;
      g.fillPoints([
        { x: c.x, y: c.y + 1 }, { x: c.x + a * 0.9, y: c.y + a * 0.75 }, { x: c.x + a * 0.45, y: c.y + a * 0.6 },
        { x: c.x + a * 0.1, y: c.y + a * 0.85 }, { x: c.x - a * 0.35, y: c.y + a * 0.6 }, { x: c.x - a * 0.9, y: c.y + a * 0.75 },
      ], true);
    }
    guardar(scene, g, clave, w, h);
  }
  function iceberg(scene, clave) {
    const g = lienzo(scene);
    const B = 0x6FA9CF, F = 0xD8F0FF, S = 0xA9D6F2;
    const pts = [{ x: 6, y: 120 }, { x: 22, y: 60 }, { x: 44, y: 46 }, { x: 62, y: 14 }, { x: 84, y: 30 }, { x: 104, y: 22 },
      { x: 128, y: 64 }, { x: 150, y: 80 }, { x: 170, y: 120 }];
    g.fillStyle(B, 1); g.fillPoints(pts, true);
    g.fillStyle(F, 1); g.fillPoints(pts.map(p => ({ x: p.x + (p.x < 88 ? 4 : -4), y: p.y + 4 })), true);
    g.fillStyle(S, 1); g.fillPoints([{ x: 88, y: 120 }, { x: 104, y: 30 }, { x: 124, y: 66 }, { x: 146, y: 82 }, { x: 164, y: 120 }], true);
    g.fillStyle(0xFFFFFF, 1); g.fillPoints([{ x: 34, y: 62 }, { x: 46, y: 52 }, { x: 60, y: 24 }, { x: 52, y: 54 }], true);
    guardar(scene, g, clave, 176, 128);
  }
  function aurora(scene, clave, w, h) {
    if (scene.textures.exists(clave)) scene.textures.remove(clave);
    const ct = scene.textures.createCanvas(clave, w, h);
    const c = ct.getContext();
    const bandas = [
      { col: '120,240,200', y: 0.38, amp: 0.10, fase: 0.0, grosor: 0.22, a: 0.30 },
      { col: '140,200,255', y: 0.52, amp: 0.08, fase: 1.7, grosor: 0.18, a: 0.22 },
      { col: '200,170,255', y: 0.30, amp: 0.06, fase: 3.1, grosor: 0.12, a: 0.16 },
    ];
    for (const b of bandas) {
      for (let x = 0; x < w; x += 2) {
        const yc = h * (b.y + b.amp * Math.sin((x / w) * Math.PI * 4 + b.fase));
        const alto = h * b.grosor * (0.7 + 0.3 * Math.sin((x / w) * Math.PI * 6 + b.fase * 2));
        const gr = c.createLinearGradient(0, yc - alto, 0, yc + alto * 0.4);
        gr.addColorStop(0, `rgba(${b.col},0)`);
        gr.addColorStop(0.75, `rgba(${b.col},${b.a})`);
        gr.addColorStop(1, `rgba(${b.col},0)`);
        c.fillStyle = gr; c.fillRect(x, yc - alto, 2, alto * 1.4);
      }
    }
    ct.refresh();
  }
  function cielo(scene, clave) {
    if (scene.textures.exists(clave)) scene.textures.remove(clave);
    const ct = scene.textures.createCanvas(clave, 4, 256);
    const c = ct.getContext();
    const gr = c.createLinearGradient(0, 0, 0, 256);
    gr.addColorStop(0, '#9FCDEB'); gr.addColorStop(1, '#E6F6FF');
    c.fillStyle = gr; c.fillRect(0, 0, 4, 256);
    ct.refresh();
  }
  function copo(scene, clave) {
    const g = lienzo(scene);
    g.fillStyle(0xFFFFFF, 0.35); g.fillCircle(6, 6, 6);
    g.fillStyle(0xFFFFFF, 1); g.fillCircle(6, 6, 3.4);
    guardar(scene, g, clave, 12, 12);
  }

  // Los suelos de los mapas quedan ~7 filas sobre el fondo del nivel: con la cámara centrada ahí,
  // el objeto de parallax aparece en `yPantalla`.
  function yParallax(altoPx, s, yPantalla) { return yPantalla + Math.max(0, altoPx - 7 * 64 - 360) * s; }

  CAJAS.registrarMundo({
    id: 'hielo',
    nombre: 'Polo de Escarcha',
    orden: 4,
    terreno: 'snow',
    colorCielo: '#D6EEFB',
    fisica: { gravedad: 1500, salto: 820, velocidad: 260, aceleracion: 500, frenado: 250, nadar: false },

    texturas(scene) {
      pinguino(scene, 'hielo_pinguino_a', 0); pinguino(scene, 'hielo_pinguino_b', 1);
      orca(scene, 'hielo_orca_a', 0); orca(scene, 'hielo_orca_b', 1);
      muneco(scene, 'hielo_muneco_a', 0); muneco(scene, 'hielo_muneco_b', 1);
      montes(scene, 'hielo_montes_lejos', 1024, 300, 0xB9D3EA, 0x9DBBD8, 0xF4FAFF, 6, 7);
      montes(scene, 'hielo_montes_cerca', 1024, 260, 0x9CC0E0, 0x7FA6CB, 0xFFFFFF, 5, 31);
      iceberg(scene, 'hielo_iceberg');
      aurora(scene, 'hielo_aurora', 1024, 360);
      cielo(scene, 'hielo_cielo');
      copo(scene, 'hielo_copo');
    },

    fondo(scene, anchoPx, altoPx) {
      const anchoVisto = s => 1280 + Math.max(0, anchoPx - 1280) * s + 64;
      // degradado del cielo, fijo a la cámara
      scene.add.image(0, 0, 'hielo_cielo').setOrigin(0, 0).setDisplaySize(1280, 720)
        .setScrollFactor(0).setDepth(-10);
      // aurora boreal tenue, casi fija
      const au = scene.add.tileSprite(0, 10, anchoVisto(0.05), 360, 'hielo_aurora')
        .setOrigin(0, 0).setScrollFactor(0.05).setDepth(-9).setAlpha(0.9);
      scene.tweens.add({ targets: au, alpha: 0.55, duration: 4200, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
      // montañas lejanas y cercanas
      scene.add.tileSprite(0, yParallax(altoPx, 0.15, 470), anchoVisto(0.15), 300, 'hielo_montes_lejos')
        .setOrigin(0, 1).setScrollFactor(0.15).setDepth(-8);
      scene.add.tileSprite(-200, yParallax(altoPx, 0.3, 500), anchoVisto(0.3) + 200, 260, 'hielo_montes_cerca')
        .setOrigin(0, 1).setScrollFactor(0.3).setDepth(-7);
      // mar helado e icebergs
      const yMar = yParallax(altoPx, 0.45, 570);
      const mar = scene.add.graphics().setScrollFactor(0.45).setDepth(-6);
      mar.fillStyle(0xBFE2F7, 1); mar.fillRect(0, yMar - 70, anchoVisto(0.45), 400);
      mar.fillStyle(0xE6F6FF, 1); mar.fillRect(0, yMar - 70, anchoVisto(0.45), 6);
      for (let x = 120, i = 0; x < anchoVisto(0.45); x += 420 + (i * 137) % 260, i++) {
        const esc = 0.6 + ((i * 53) % 50) / 100;
        scene.add.image(x, yMar - 58, 'hielo_iceberg').setOrigin(0.5, 1).setScale(esc)
          .setScrollFactor(0.45).setDepth(-5);
      }
      // copos de nieve cayendo, fijos a la pantalla
      scene.add.particles(0, -20, 'hielo_copo', {
        x: { min: -100, max: 1380 },
        lifespan: 9000,
        speedY: { min: 30, max: 70 },
        speedX: { min: -25, max: 15 },
        scale: { min: 0.35, max: 1 },
        alpha: { start: 0.95, end: 0.4 },
        frequency: 110,
        quantity: 1,
        advance: 9000,
      }).setScrollFactor(0).setDepth(-1);
    },

    enemigos: {
      p: {
        nombre: 'Pingüino',
        sprite: { textura: ['hielo_pinguino_a', 'hielo_pinguino_b'], fps: 4 },
        comportamiento: 'desliza',
        velocidad: 70,
        rango: 3,
        cuerpo: { w: 42, h: 50 },
      },
      o: {
        nombre: 'Orca',
        sprite: { textura: ['hielo_orca_a', 'hielo_orca_b'], fps: 3 },
        comportamiento: 'salta',
        rango: 4,
        cuerpo: { w: 92, h: 36 },
      },
      s: {
        nombre: 'Muñeco de nieve',
        sprite: { textura: ['hielo_muneco_a', 'hielo_muneco_b'], fps: 3 },
        comportamiento: 'patrulla',
        velocidad: 30,
        cuerpo: { w: 34, h: 52 },
      },
    },

    niveles: [
      {
        nombre: 'La bahía de los pingüinos',
        mapa: [
          '........................................................................................',
          '........................................................................................',
          '........................................................................................',
          '........................................................................................',
          '........................................................................................',
          '........................................................................................',
          '........................................................................................',
          '........................................................................................',
          '........................C...............................................C...............',
          '.....................======..........................................======.............',
          '.................p..............................................p.......................',
          '...............======.........................................======............C.......',
          '............C............................................Q...................======.....',
          '.........======........................................======...........................',
          '.....C...........................................p......................................',
          '...======.....................................=======...................................',
          '..P.................p.......s........^......s.......s...................................',
          '############~~################################BB#######..............................s..',
          '############o~################################BB#######.............................####',
          '##########################################.............###..........................####',
          '##########################################...............B.......................#######',
          '##########################################..V.....Q......B###..s......C....p.....#######',
          '##################################################################o~####################',
          '########################################################################################',
        ],
        palabras: [
          { caja: 'la bufanda', respuesta: 'scarf' },
          { caja: 'el gorro', respuesta: 'hat' },
          { caja: 'los guantes', respuesta: 'gloves' },
          { caja: 'el abrigo', respuesta: 'coat' },
          { caja: 'las botas', respuesta: 'boots' },
          { caja: 'la camisa', respuesta: 'shirt' },
          { caja: 'los calcetines', respuesta: 'socks' },
          { caja: 'el pantalón', respuesta: 'pants' },
        ],
      },
      {
        nombre: 'La tormenta de nieve',
        mapa: [
          '..............................................................................................',
          '..............................................................................................',
          '..............................................................................................',
          '................................C.............................................................',
          '.............................======...........................................................',
          '..............................................................................................',
          '.................p....s..Q................................................K...................',
          '............#######BB######.............................................=====.................',
          '............#######BB######...................................................................',
          '......C........................p........................................p.....C...............',
          '....======..................=====...................................#############.............',
          '....................................................................#############.............',
          '................................................................C.............................',
          '..........======..............................................=====...............=====.......',
          '..............................................................................................',
          '.................=====....................................p...................................',
          '....======..............................................=====.................................',
          '..............................................................................................',
          '..P.......p...............s...^...............s....p...........................^........C.s...',
          '#####################~~##############~~################.....................######~~##########',
          '#####################o~##############~o################.....................######o~##########',
          '#########################################..............BBB...............#####################',
          '#########################################...V...Q......BBB........C...s..#####################',
          '##########################################################~~##################################',
          '##########################################################~o##################################',
          '##############################################################################################',
        ],
        palabras: [
          { caja: 'frío', respuesta: 'cold' },
          { caja: 'caliente', respuesta: 'hot' },
          { caja: 'la nieve', respuesta: 'snow' },
          { caja: 'la lluvia', respuesta: 'rain' },
          { caja: 'el viento', respuesta: 'wind' },
          { caja: 'la nube', respuesta: 'cloud' },
          { caja: 'el hielo', respuesta: 'ice' },
          { caja: 'el invierno', respuesta: 'winter' },
        ],
      },
    ],
  });
})();
