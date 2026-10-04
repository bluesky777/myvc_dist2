// Mundo 5 — Babilonia: zigurat, jardines colgantes y la puerta de Ishtar al atardecer.
// Texturas propias: babilonia_leon_a/b, babilonia_sabio_a/b, babilonia_pozo y siluetas del fondo.
(function () {
  // ---------- utilidades de dibujo ----------
  const nuevo = (scene) => scene.make.graphics({ x: 0, y: 0, add: false });
  const hecho = (scene, g, clave, w, h) => {
    if (scene.textures.exists(clave)) scene.textures.remove(clave);
    g.generateTexture(clave, w, h);
    g.destroy();
  };
  // Curva cuadrática como lista de puntos (Graphics no trae quadraticCurveTo).
  const curva = (x0, y0, cx, cy, x1, y1, n = 18) => {
    const p = [];
    for (let i = 0; i <= n; i++) {
      const t = i / n, u = 1 - t;
      p.push({ x: u * u * x0 + 2 * u * t * cx + t * t * x1, y: u * u * y0 + 2 * u * t * cy + t * t * y1 });
    }
    return p;
  };
  const trazo = (g, pts, ancho, color) => {
    g.lineStyle(ancho, color, 1);
    g.strokePoints(pts, false, false);
    g.fillStyle(color, 1);
    g.fillCircle(pts[0].x, pts[0].y, ancho / 2);
    g.fillCircle(pts[pts.length - 1].x, pts[pts.length - 1].y, ancho / 2);
  };
  // Dibuja una figura dos veces: crecida y oscura (contorno) y luego en su color.
  const conBorde = (g, oscuro, claro, figura, borde = 3) => {
    g.fillStyle(oscuro, 1); figura(borde);
    g.fillStyle(claro, 1); figura(0);
  };

  // ---------- León (128×64, mira a la izquierda como los enemigos de Kenney) ----------
  function leon(scene, clave, paso) {
    const g = nuevo(scene);
    const OSC = 0x9A5A18, CUERPO = 0xF4B844, CLARO = 0xFBDA8C, MELENA = 0xF0782A, MEL_OSC = 0xA2441A;
    const piernas = [[54, 0], [68, 1], [90, 0], [104, 1]];
    const sube = (k) => ((k === 0) === (paso === 0) ? 3 : 0);
    const mueve = (k) => ((k === 0) === (paso === 0) ? -3 : 2);
    // cola (detrás)
    const meneo = paso ? 4 : 0;
    const cola = curva(104, 36, 126, 38, 116 + meneo, 12);
    trazo(g, cola, 10, OSC);
    trazo(g, cola, 5, CUERPO);
    conBorde(g, MEL_OSC, MELENA, (e) => g.fillCircle(116 + meneo, 11, 7 + e));
    // patas + cuerpo como una sola silueta
    const patas = (e) => piernas.forEach(([x, k]) => g.fillRoundedRect(x + mueve(k) - e, 36 - e, 14 + 2 * e, 25 - sube(k) + 2 * e, 6 + e));
    const cuerpo = (e) => g.fillEllipse(80, 34, 64 + 2 * e, 30 + 2 * e);
    g.fillStyle(OSC, 1); patas(3); cuerpo(3);
    g.fillStyle(CUERPO, 1); patas(0); cuerpo(0);
    // patitas claras
    g.fillStyle(CLARO, 1);
    piernas.forEach(([x, k]) => g.fillEllipse(x + mueve(k) + 7, 58 - sube(k), 14, 7));
    g.fillEllipse(82, 41, 42, 11);
    g.fillStyle(0xFFFFFF, 0.45); g.fillEllipse(70, 25, 26, 8);
    // melena: corona de bolitas
    const melena = (e) => {
      g.fillCircle(36, 32, 20 + e);
      for (let i = 0; i < 12; i++) {
        const a = (i / 12) * Math.PI * 2;
        g.fillCircle(36 + Math.cos(a) * 20, 32 + Math.sin(a) * 19, 8 + e);
      }
    };
    conBorde(g, MEL_OSC, MELENA, melena);
    g.fillStyle(0xF89A4E, 1);
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * Math.PI * 2;
      g.fillCircle(36 + Math.cos(a) * 19, 32 + Math.sin(a) * 18, 4.5);
    }
    g.fillStyle(0xFFFFFF, 0.4); g.fillEllipse(22, 15, 14, 7);
    // orejas
    [[24, 15], [48, 15]].forEach(([x, y]) => {
      conBorde(g, OSC, CUERPO, (e) => g.fillCircle(x, y, 6 + e));
      g.fillStyle(0xF5A7A0, 1); g.fillCircle(x, y + 1, 3);
    });
    // cara
    conBorde(g, OSC, CLARO, (e) => g.fillCircle(36, 33, 15 + e));
    g.fillStyle(0xFFF3D6, 1); g.fillEllipse(34, 41, 18, 11);
    // mejillas
    g.fillStyle(0xF59A8A, 0.55); g.fillCircle(24, 38, 3.5); g.fillCircle(46, 38, 3.5);
    // ojos grandes
    [[29, 28], [42, 28]].forEach(([x, y]) => {
      g.fillStyle(0x6B3A12, 1); g.fillEllipse(x, y, 11, 13);
      g.fillStyle(0xFFFFFF, 1); g.fillEllipse(x, y, 8, 10);
      g.fillStyle(0x3A2410, 1); g.fillCircle(x - 1.5, y + 1, 3);
      g.fillStyle(0xFFFFFF, 1); g.fillCircle(x - 2.5, y - 0.5, 1.2);
    });
    // nariz y sonrisa
    g.fillStyle(0x6B3A1A, 1);
    g.fillTriangle(29, 36, 39, 36, 34, 41);
    g.fillCircle(31, 36.5, 2); g.fillCircle(37, 36.5, 2);
    g.lineStyle(2, 0x6B3A1A, 1);
    g.beginPath(); g.arc(30.5, 42, 3.5, 0.15 * Math.PI, 0.95 * Math.PI); g.strokePath();
    g.beginPath(); g.arc(37.5, 42, 3.5, 0.05 * Math.PI, 0.85 * Math.PI); g.strokePath();
    hecho(scene, g, clave, 128, 64);
  }

  // ---------- Sabio con túnica, enojado (64×64, de frente, brazos cruzados) ----------
  function sabio(scene, clave, paso) {
    const g = nuevo(scene);
    const dy = paso ? 1 : 0;
    const TUN = 0x7B4FC6, TUN_OSC = 0x43297E, MANGA = 0x6A3FB4, ORO = 0xF6C443, ORO_OSC = 0xB0801A;
    const PIEL = 0xF6C9A0, PIEL_OSC = 0x9A6440, BARBA = 0xEDEAE3, BARBA_OSC = 0x8E877C, CEJA = 0x5A4A3E;
    const AZUL = 0x3E72D2, AZUL_OSC = 0x22407E;
    // pies
    conBorde(g, 0x4E2F14, 0x8B5A2B, (e) => {
      g.fillEllipse(24, 61 - (paso ? 2 : 0), 12 + 2 * e, 6 + 2 * e);
      g.fillEllipse(40, 61 - (paso ? 0 : 2), 12 + 2 * e, 6 + 2 * e);
    });
    // túnica (trapecio redondeado)
    const tunica = (e) => {
      g.fillPoints([
        { x: 19 - e, y: 30 + dy - e }, { x: 45 + e, y: 30 + dy - e },
        { x: 53 + e, y: 59 + e }, { x: 11 - e, y: 59 + e },
      ], true);
      g.fillRoundedRect(17 - e, 27 + dy - e, 30 + 2 * e, 10, 6);
    };
    conBorde(g, TUN_OSC, TUN, tunica, 3);
    g.fillStyle(0xFFFFFF, 0.25); g.fillEllipse(21, 40 + dy, 6, 14);
    // bordado dorado: banda del ruedo y franja central con puntitos
    g.fillStyle(ORO, 1);
    g.fillRect(11, 52, 42, 5);
    g.fillRect(29, 42 + dy, 6, 11);
    g.fillStyle(ORO_OSC, 1);
    for (let x = 14; x < 52; x += 6) g.fillCircle(x, 54.5, 1.3);
    g.fillStyle(TUN_OSC, 1); g.fillRect(11, 57, 42, 2);
    // barba rizada
    const rizos = [[26, 31], [32, 32], [38, 31], [23, 36], [29, 37], [35, 37], [41, 36], [27, 42], [32, 43], [37, 42]];
    conBorde(g, BARBA_OSC, BARBA, (e) => rizos.forEach(([x, y]) => g.fillCircle(x, y + dy, 4.5 + e)), 2);
    g.fillStyle(0xFFFFFF, 1); rizos.forEach(([x, y]) => g.fillCircle(x - 1, y - 1 + dy, 1.6));
    // brazos cruzados
    conBorde(g, TUN_OSC, MANGA, (e) => g.fillRoundedRect(13 - e, 40 + dy - e, 38 + 2 * e, 10 + 2 * e, 5 + e), 3);
    g.lineStyle(2, TUN_OSC, 1); g.lineBetween(32, 41 + dy, 36, 49 + dy);
    conBorde(g, PIEL_OSC, PIEL, (e) => { g.fillCircle(19, 45 + dy, 3.5 + e); g.fillCircle(45, 45 + dy, 3.5 + e); }, 2);
    g.fillStyle(ORO, 1); g.fillRect(23, 41 + dy, 3, 8); g.fillRect(38, 41 + dy, 3, 8);
    // cabeza
    conBorde(g, PIEL_OSC, PIEL, (e) => g.fillCircle(32, 22 + dy, 10 + e), 3);
    // gorro alto (cilindro un poco abierto arriba)
    const gorro = (e) => g.fillPoints([
      { x: 23 - e, y: 15 + dy + e }, { x: 41 + e, y: 15 + dy + e },
      { x: 43 + e, y: 4 + dy - e }, { x: 21 - e, y: 4 + dy - e },
    ], true);
    conBorde(g, AZUL_OSC, AZUL, gorro, 3);
    g.fillStyle(ORO, 1); g.fillRect(23, 11 + dy, 18, 4); g.fillRect(21, 4 + dy, 22, 2);
    g.fillStyle(0xE04F5F, 1); g.fillCircle(32, 8.5 + dy, 2.2);
    g.fillStyle(0xFFFFFF, 0.35); g.fillRect(25, 6 + dy, 3, 5);
    // ojos con cejas de caricatura
    [[28, 22], [36, 22]].forEach(([x, y]) => {
      g.fillStyle(0xFFFFFF, 1); g.fillCircle(x, y + dy, 3.6);
      g.fillStyle(0x2E1B0E, 1); g.fillCircle(x + (x < 32 ? 0.8 : -0.8), y + 0.8 + dy, 1.9);
    });
    g.lineStyle(3, CEJA, 1);
    g.lineBetween(23.5, 16.5 + dy, 30, 19.5 + dy);
    g.lineBetween(40.5, 16.5 + dy, 34, 19.5 + dy);
    // nariz, bigote y boquita enfurruñada
    g.fillStyle(0xE7A57E, 1); g.fillCircle(32, 26 + dy, 2.4);
    conBorde(g, BARBA_OSC, BARBA, (e) => { g.fillEllipse(28.5, 29 + dy, 8 + e, 4 + e); g.fillEllipse(35.5, 29 + dy, 8 + e, 4 + e); }, 1.5);
    // nubecita de enfado que aparece y se va
    if (paso) {
      g.fillStyle(0xFFFFFF, 0.9);
      g.fillCircle(52, 10, 4); g.fillCircle(57, 8, 3.5); g.fillCircle(55, 13, 3);
    } else {
      g.fillStyle(0xFFFFFF, 0.6); g.fillCircle(50, 13, 2.5);
    }
    hecho(scene, g, clave, 64, 64);
  }

  // ---------- Pozo (64×64; el peligro es el brocal de abajo) ----------
  function pozo(scene) {
    const g = nuevo(scene);
    const MAD = 0x8E5B2C, MAD_OSC = 0x4E2F14, BARRO = 0xCF8C4E, BARRO_OSC = 0x7A4A22;
    // postes y travesaño
    conBorde(g, MAD_OSC, MAD, (e) => {
      g.fillRoundedRect(8 - e, 8 - e, 7 + 2 * e, 34 + 2 * e, 2);
      g.fillRoundedRect(49 - e, 8 - e, 7 + 2 * e, 34 + 2 * e, 2);
      g.fillRoundedRect(4 - e, 5 - e, 56 + 2 * e, 7 + 2 * e, 3);
    }, 2.5);
    g.fillStyle(0xFFFFFF, 0.3); g.fillRect(7, 6, 40, 2);
    // cuerda y cubo
    g.lineStyle(2, 0xD9B47A, 1); g.lineBetween(32, 12, 32, 20);
    conBorde(g, 0x3D4F63, 0x8DA2B8, (e) => g.fillPoints([
      { x: 26 - e, y: 20 - e }, { x: 38 + e, y: 20 - e }, { x: 36 + e, y: 29 + e }, { x: 28 - e, y: 29 + e }], true), 2);
    g.fillStyle(0xC9D6E3, 1); g.fillRect(27, 21, 10, 2);
    // brocal de ladrillo de barro
    conBorde(g, BARRO_OSC, BARRO, (e) => g.fillRoundedRect(4 - e, 36 - e, 56 + 2 * e, 26 + 2 * e, 7), 3);
    g.lineStyle(2, 0xA86A35, 1);
    g.lineBetween(6, 48, 58, 48); g.lineBetween(6, 55, 58, 55);
    [[16, 40, 48], [30, 40, 48], [44, 40, 48], [10, 48, 55], [23, 48, 55], [37, 48, 55], [51, 48, 55], [16, 55, 61], [30, 55, 61], [44, 55, 61]]
      .forEach(([x, a, b]) => g.lineBetween(x, a, x, b));
    g.fillStyle(0xFFFFFF, 0.25); g.fillRoundedRect(8, 44, 10, 3, 1.5);
    // boca del pozo: borde claro y agua oscura con brillo
    conBorde(g, BARRO_OSC, 0xE8A86C, (e) => g.fillEllipse(32, 38, 56 + 2 * e, 16 + 2 * e), 2.5);
    g.fillStyle(0x1E3A5C, 1); g.fillEllipse(32, 39, 44, 10);
    g.fillStyle(0x2E5A88, 1); g.fillEllipse(32, 40, 36, 6);
    g.fillStyle(0x8FC0EE, 0.9); g.fillEllipse(24, 38.5, 9, 2.5);
    hecho(scene, g, 'babilonia_pozo', 64, 64);
  }

  // ---------- Siluetas del fondo ----------
  function zigurat(scene) {
    const W = 760, H = 360, g = nuevo(scene);
    const pisos = [[0, 300, 760, 60], [70, 236, 620, 64], [150, 176, 460, 60], [230, 120, 300, 56], [300, 74, 160, 46]];
    pisos.forEach(([x, y, w, h], i) => {
      g.fillStyle(0xC98A55, 1); g.fillRect(x, y, w, h);
      g.fillStyle(0xB2733F, 1); g.fillRect(x + w * 0.62, y, w * 0.38, h);         // cara en sombra
      g.fillStyle(0xE3AC74, 1); g.fillRect(x, y, w, 6);                          // canto iluminado
      g.fillStyle(0xA96B3B, 0.5);
      for (let k = x + 20; k < x + w - 10; k += 34) g.fillRect(k, y + 16, 14, h - 26); // nichos
      if (i === 0) { g.fillStyle(0x6E9B4C, 1); for (let k = 6; k < W; k += 22) g.fillCircle(k, y + 2, 9); }
    });
    // escalinata central
    g.fillStyle(0xE8BB86, 1); g.fillRect(350, 74, 60, 286);
    g.fillStyle(0xC98A55, 1);
    for (let y = 82; y < 360; y += 10) g.fillRect(350, y, 60, 3);
    // templo azul en la cima
    g.fillStyle(0x3E6FC4, 1); g.fillRect(330, 34, 100, 40);
    g.fillStyle(0xF2C14E, 1); g.fillRect(330, 34, 100, 6); g.fillRect(366, 50, 28, 24);
    g.fillStyle(0x2A4F94, 1); g.fillRect(370, 54, 20, 20);
    hecho(scene, g, 'babilonia_zigurat', W, H);
  }

  function puerta(scene) {
    const W = 460, H = 330, g = nuevo(scene);
    const AZ = 0x3567C0, AZ_OSC = 0x24498F, ORO = 0xF2C14E;
    const almenas = (x, w, y) => { g.fillStyle(AZ, 1); for (let k = x; k < x + w - 6; k += 22) g.fillRect(k + 2, y - 16, 14, 16); };
    // torres y muro
    almenas(0, 110, 40); almenas(350, 110, 40); almenas(110, 240, 80);
    g.fillStyle(AZ, 1); g.fillRect(0, 40, 110, 290); g.fillRect(350, 40, 110, 290); g.fillRect(110, 80, 240, 250);
    g.fillStyle(AZ_OSC, 1); g.fillRect(84, 40, 26, 290); g.fillRect(434, 40, 26, 290);
    // franjas doradas
    g.fillStyle(ORO, 1);
    [[0, 52, 110], [350, 52, 110], [110, 92, 240]].forEach(([x, y, w]) => { g.fillRect(x, y, w, 5); });
    g.fillRect(0, 316, 460, 5);
    // arco
    g.fillStyle(0x17325F, 1); g.fillRect(180, 190, 100, 140); g.fillCircle(230, 190, 50);
    g.lineStyle(8, ORO, 1); g.beginPath(); g.arc(230, 190, 54, Math.PI, 0); g.strokePath();
    g.lineBetween(176, 190, 176, 330); g.lineBetween(284, 190, 284, 330);
    // animales dorados (leones y toros esquemáticos) en filas
    const animal = (x, y, toro) => {
      g.fillStyle(ORO, 1);
      g.fillEllipse(x, y, 26, 12);
      g.fillCircle(x - 13, y - 5, toro ? 5 : 7);
      g.fillRect(x - 10, y + 3, 4, 9); g.fillRect(x - 3, y + 3, 4, 9); g.fillRect(x + 4, y + 3, 4, 9); g.fillRect(x + 9, y + 3, 4, 9);
      g.lineStyle(3, ORO, 1); g.lineBetween(x + 12, y - 2, x + 18, y - 8);
      if (toro) { g.lineBetween(x - 16, y - 9, x - 20, y - 14); g.lineBetween(x - 11, y - 9, x - 8, y - 14); }
    };
    for (let fila = 0; fila < 3; fila++) {
      const y = 100 + fila * 66;
      animal(55, y, fila % 2); animal(405, y, fila % 2);
    }
    animal(140, 130, 0); animal(320, 130, 1);
    // rosetas
    g.fillStyle(0xFFFFFF, 0.85);
    for (let k = 130; k < 340; k += 30) g.fillCircle(k, 110, 4);
    hecho(scene, g, 'babilonia_puerta', W, H);
  }

  function palmera(scene) {
    const W = 180, H = 260, g = nuevo(scene);
    const tronco = curva(96, 258, 84, 150, 92, 60, 14);
    trazo(g, tronco, 22, 0x5E3A1C);
    trazo(g, tronco, 15, 0x9A6738);
    g.lineStyle(3, 0x6E4524, 1);
    tronco.forEach((p, i) => { if (i > 0 && i < tronco.length - 1) { g.beginPath(); g.arc(p.x, p.y + 6, 7, 1.15 * Math.PI, 1.85 * Math.PI); g.strokePath(); } });
    g.fillStyle(0xFFFFFF, 0.2); tronco.forEach((p) => g.fillCircle(p.x - 4, p.y, 1.8));
    const hojas = [[-80, 18], [-60, -26], [-20, -44], [24, -44], [62, -24], [82, 20], [-36, 40], [40, 42]];
    hojas.forEach(([dx, dy]) => {
      const pts = curva(92, 60, 92 + dx * 0.5, 60 + dy - 30, 92 + dx, 60 + dy + 26, 16);
      trazo(g, pts, 18, 0x24703A);
      trazo(g, pts, 11, 0x3FA35B);
      g.fillStyle(0x7FD08A, 0.7); pts.slice(2, 10).forEach(p => g.fillCircle(p.x, p.y - 2, 2));
    });
    g.fillStyle(0x5A3416, 1); g.fillCircle(86, 68, 7); g.fillCircle(98, 70, 7); g.fillCircle(92, 76, 7);
    hecho(scene, g, 'babilonia_palmera', W, H);
  }

  function jardin(scene) {
    const W = 360, H = 300, g = nuevo(scene);
    const pisos = [[20, 230, 320, 70], [60, 160, 240, 70], [100, 90, 160, 70], [140, 40, 80, 50]];
    pisos.forEach(([x, y, w, h]) => {
      g.fillStyle(0xC6905E, 1); g.fillRect(x, y, w, h);
      g.fillStyle(0xAE7848, 1); g.fillRect(x, y + h - 10, w, 10);
      g.fillStyle(0x8F5F37, 1); for (let k = x + 18; k < x + w - 10; k += 30) { g.fillRect(k, y + 18, 12, h - 34); g.fillCircle(k + 6, y + 18, 6); }
      // arbustos arriba
      for (let k = x + 8; k < x + w; k += 18) {
        g.fillStyle(0x2F8A47, 1); g.fillCircle(k, y, 13);
        g.fillStyle(0x4DB463, 1); g.fillCircle(k - 3, y - 3, 8);
      }
      // enredaderas que caen
      for (let k = x + 14; k < x + w - 6; k += 26) {
        const largo = 24 + ((k * 7) % 30);
        g.lineStyle(3, 0x2F8A47, 1); g.lineBetween(k, y + 4, k + 2, y + 4 + largo);
        g.fillStyle(0x4DB463, 1);
        for (let t = 10; t < largo; t += 9) g.fillEllipse(k + (t % 18 ? -3 : 4), y + 4 + t, 7, 4);
        g.fillStyle((k % 3) ? 0xF27BA8 : 0xFFE16B, 1); g.fillCircle(k + 2, y + 6 + largo, 3.5);
      }
    });
    hecho(scene, g, 'babilonia_jardin', W, H);
  }

  function crearTexturas(scene) {
    leon(scene, 'babilonia_leon_a', 0); leon(scene, 'babilonia_leon_b', 1);
    sabio(scene, 'babilonia_sabio_a', 0); sabio(scene, 'babilonia_sabio_b', 1);
    pozo(scene);
    zigurat(scene); puerta(scene); palmera(scene); jardin(scene);
  }

  // Copia de background_color_desert sin el cielo blanco y con las colinas azules en tono arena.
  let arenaKenney = 0xF4C9A0;
  function desiertoCalido(scene) {
    if (scene.textures.exists('babilonia_desierto')) return true;
    try {
      if (!scene.textures.exists('fondos')) return false;
      const fr = scene.textures.getFrame('fondos', 'background_color_desert');
      if (!fr) return false;
      const lienzo = scene.textures.createCanvas('babilonia_desierto', 256, 256);
      const ctx = lienzo.getContext();
      ctx.drawImage(fr.source.image, fr.cutX, fr.cutY, 256, 256, 0, 0, 256, 256);
      const img = ctx.getImageData(0, 0, 256, 256), d = img.data;
      for (let i = 0; i < d.length; i += 4) {
        const r = d[i], gg = d[i + 1], b = d[i + 2];
        if (r > 235 && gg > 235 && b > 235) d[i + 3] = 0;                 // cielo
        else if (b > r + 15) { d[i] = 236; d[i + 1] = 196; d[i + 2] = 140; } // colinas lejanas
      }
      const k = (250 * 256 + 128) * 4;
      arenaKenney = (d[k] << 16) | (d[k + 1] << 8) | d[k + 2];
      ctx.putImageData(img, 0, 0);
      lienzo.refresh();
      return true;
    } catch (e) {
      return false;
    }
  }

  // ---------- Fondo con parallax ----------
  function fondo(scene, anchoPx, altoPx) {
    if (!scene.textures.exists('babilonia_zigurat')) crearTexturas(scene);
    const VW = 1280, VH = 720;
    const rangoY = Math.max(0, altoPx - VH);
    // Ancho que recorre una capa con ese scrollFactor, y su y para quedar abajo con la cámara abajo.
    const ancho = (sf) => VW + Math.max(0, anchoPx - VW) * sf;
    const yAbajo = (sf, ySeccion) => ySeccion + rangoY * sf;

    // cielo de atardecer (fijo)
    const cielo = scene.add.graphics().setScrollFactor(0).setDepth(-10);
    cielo.fillGradientStyle(0xF39A63, 0xF6A866, 0xFCE3A2, 0xFCE3A2, 1);
    cielo.fillRect(0, 0, VW, VH);
    // sol con halo
    const sol = scene.add.graphics().setScrollFactor(0.02, 0.05).setDepth(-10);
    [[130, 0.12], [100, 0.2], [78, 0.35]].forEach(([r, a]) => { sol.fillStyle(0xFFF2C0, a); sol.fillCircle(980, 210, r); });
    sol.fillStyle(0xFFF6D2, 1); sol.fillCircle(980, 210, 60);
    // nubes alargadas
    const nubes = scene.add.graphics().setScrollFactor(0.06, 0.08).setDepth(-10);
    for (let x = 80, i = 0; x < ancho(0.06); x += 520, i++) {
      const y = 90 + (i % 3) * 70;
      nubes.fillStyle(0xFFE6BE, 0.85);
      nubes.fillEllipse(x, y, 220, 26); nubes.fillEllipse(x + 60, y - 12, 120, 26); nubes.fillEllipse(x - 50, y + 8, 140, 18);
    }
    // dunas lejanas
    const dunas = (sf, color, base, alto, paso, depth) => {
      const d = scene.add.graphics().setScrollFactor(sf).setDepth(depth);
      const w = ancho(sf), y0 = yAbajo(sf, base);
      const pts = [{ x: 0, y: y0 + 600 }];
      for (let x = 0; x <= w + paso; x += 24) pts.push({ x, y: y0 - alto * (0.55 + 0.45 * Math.sin(x / paso) * Math.sin(x / (paso * 2.7) + 1)) });
      pts.push({ x: w + paso, y: y0 + 600 });
      d.fillStyle(color, 1); d.fillPoints(pts, true);
    };
    dunas(0.1, 0xF3C98F, 500, 80, 260, -9);
    // zigurat y puerta de Ishtar, alternados
    const wz = ancho(0.16);
    for (let x = 420, i = 0; x < wz + 400; x += 1500, i++) {
      scene.add.image(x, yAbajo(0.16, 545), 'babilonia_zigurat').setOrigin(0.5, 1).setScrollFactor(0.16).setDepth(-8).setAlpha(0.92);
    }
    const wp = ancho(0.2);
    for (let x = 1150; x < wp + 400; x += 1500) {
      scene.add.image(x, yAbajo(0.2, 550), 'babilonia_puerta').setOrigin(0.5, 1).setScrollFactor(0.2).setDepth(-8).setScale(0.9);
    }
    dunas(0.24, 0xEDB877, 575, 50, 200, -7);
    // desierto de Kenney: se le quita el cielo blanco y se entibian las colinas azules
    const wd = ancho(0.3), esc = 1.5;
    if (desiertoCalido(scene)) {
      scene.add.tileSprite(0, yAbajo(0.3, 600), wd / esc + 256, 256, 'babilonia_desierto')
        .setOrigin(0, 1).setScale(esc).setScrollFactor(0.3).setDepth(-6);
      scene.add.rectangle(0, yAbajo(0.3, 600) - 2, wd + 400, 900, arenaKenney).setOrigin(0, 0).setScrollFactor(0.3).setDepth(-6);
    }
    // jardines colgantes y palmeras, más cerca
    const wj = ancho(0.4);
    for (let x = 700, i = 0; x < wj + 300; x += 1100, i++) {
      scene.add.image(x, yAbajo(0.4, 590), 'babilonia_jardin').setOrigin(0.5, 1).setScrollFactor(0.4).setDepth(-5).setTint(0xF2E2CC);
    }
    const wpal = ancho(0.5);
    for (let x = 160, i = 0; x < wpal + 200; x += 430 + (i % 3) * 140, i++) {
      scene.add.image(x, yAbajo(0.5, 610), 'babilonia_palmera').setOrigin(0.5, 1).setScrollFactor(0.5).setDepth(-4)
        .setScale(0.85 + (i % 2) * 0.25).setFlipX(i % 2 === 1);
    }
  }

  CAJAS.registrarMundo({
    id: 'babilonia',
    nombre: 'Jardines de Babilonia',
    orden: 5,
    terreno: 'sand',
    colorCielo: '#F7B76E',
    fisica: { gravedad: 1500, salto: 820, velocidad: 260, aceleracion: 2400, frenado: 2400, nadar: false },
    fondo,
    texturas: crearTexturas,
    enemigos: {
      a: {
        nombre: 'León dormilón',
        sprite: { textura: ['babilonia_leon_a', 'babilonia_leon_b'], fps: 4 },
        escala: 1,
        comportamiento: 'patrulla',
        velocidad: 45,
        cuerpo: { w: 104, h: 52 },
      },
      b: {
        nombre: 'Sabio gruñón',
        sprite: { textura: ['babilonia_sabio_a', 'babilonia_sabio_b'], fps: 3 },
        escala: 1.35,
        comportamiento: 'patrulla',
        velocidad: 28,
        cuerpo: { w: 40, h: 56 },
      },
      d: {
        nombre: 'Escarabajo dorado',
        sprite: { atlas: 'enemigos', frames: ['ladybug_walk_a', 'ladybug_walk_b'], fps: 5 },
        tinte: 0xF2C14E,
        comportamiento: 'patrulla',
        velocidad: 40,
      },
      c: {
        nombre: 'Pozo',
        sprite: { textura: ['babilonia_pozo'], fps: 1 },
        comportamiento: 'fijo',
        cuerpo: { w: 52, h: 28 },
      },
    },
    niveles: [
      {
        nombre: 'Las terrazas del zigurat',
        mapa: [
        '..........................................................................................',
        '..........................................................................................',
        '..........................................................................................',
        '..........................................................................................',
        '..........................................................................................',
        '..........................................................................................',
        '..........................................................................................',
        '..........................................................................................',
        '..........................................................................................',
        '..........................................................................................',
        '.........................................d.L..............................................',
        '........................................=====.............................................',
        '.......................b.C........................C.............................d.C.......',
        '......................#######.....=====........=====...........................=====......',
        '......................#######..............................................a..............',
        '..................###############........................................=====............',
        '..................###############....................................C....................',
        '..............#######################..............................####...................',
        '............C.#######################..............................####.b.................',
        '..........################...........BBBB........................B.....##...............C.',
        '..P.....b.################...Q...V...BBBB...^...b..a...d....d.c..B..Q..##..............###',
        '#########################################################..###############...b......a..###',
        '#########################################################..###############################',
        '#########################################################..###############################',
        ],
        palabras: [
          { caja: 'buenos días', respuesta: 'good morning' },
          { caja: 'hola', respuesta: 'hello' },
          { caja: 'buenas noches', respuesta: 'good night' },
          { caja: 'gracias', respuesta: 'thank you' },
          { caja: 'adiós', respuesta: 'goodbye' },
          { caja: '¿cómo estás?', respuesta: 'how are you?' },
          { caja: 'por favor', respuesta: 'please' },
          { caja: 'lo siento', respuesta: 'sorry' },
        ],
      },
      {
        nombre: 'Los jardines colgantes',
        mapa: [
        '................................................................................................',
        '................................................................................................',
        '................................................................................................',
        '................................................................................................',
        '................................................................................................',
        '................................................................................................',
        '................................................................................................',
        '................d..........................................C....................................',
        '...............=====.....................................====...................................',
        '................................................................................................',
        '.....................................................d..........................................',
        '..........====.....................................=====........................................',
        '................................................................................................',
        '.................C.............................C............................d...b......a........',
        '...............====..........................=====......................########################',
        '........................................................................########################',
        '..........................a.....b.....................................C.########################',
        '..........====......###############.....====........................############################',
        '.....................####...........................................B......#####################',
        '.....................####........................................C..B....Q.#####################',
        '..............====...####............###........................################################',
        '.....................####............###........................B............###################',
        '..P.........a.....d..####..c.........###..b.^.....a...d......a..B........Q..K###################',
        '######..#####################........####################..#####################################',
        '######..#####################....Q.b.####################..#####################################',
        '######..#################################################..#####################################',
        ],
        palabras: [
          { caja: 'correr', respuesta: 'run' },
          { caja: 'saltar', respuesta: 'jump' },
          { caja: 'leer', respuesta: 'read' },
          { caja: 'escribir', respuesta: 'write' },
          { caja: 'comer', respuesta: 'eat' },
          { caja: 'beber', respuesta: 'drink' },
          { caja: 'dormir', respuesta: 'sleep' },
          { caja: 'cantar', respuesta: 'sing' },
        ],
      },
    ],
  });
})();
