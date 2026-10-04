// Mundo 3 — Espacio: islas flotantes con gravedad baja, asteroides dormilones, agujeros negros curiosos y un ovni.
(function () {
  // PRNG con semilla: el cielo sale igual en cada partida.
  function azar(semilla) {
    let s = semilla >>> 0;
    return function () {
      s = (s + 0x6D2B79F5) >>> 0;
      let t = s;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  // Puntos de una elipse (o arco) para fillPoints.
  function elipse(cx, cy, rx, ry, a0, a1, n) {
    const p = [];
    for (let i = 0; i <= n; i++) {
      const a = a0 + (a1 - a0) * (i / n);
      p.push({ x: cx + Math.cos(a) * rx, y: cy + Math.sin(a) * ry });
    }
    return p;
  }

  // Roca redondeada con bultos suaves.
  function roca(cx, cy, r) {
    const p = [];
    for (let i = 0; i < 48; i++) {
      const a = (i / 48) * Math.PI * 2;
      const k = r + 1.6 * Math.sin(3 * a + 0.6) + 1.1 * Math.cos(5 * a + 1.3);
      p.push({ x: cx + Math.cos(a) * k, y: cy + Math.sin(a) * k });
    }
    return p;
  }

  function ojo(g, x, y, r, mirada) {
    const mx = (mirada && mirada.x) || 0, my = (mirada && mirada.y) || 0;
    g.fillStyle(0xffffff, 1).fillCircle(x, y, r);
    g.fillStyle(0x2B2140, 1).fillCircle(x + mx, y + my, r * 0.58);
    g.fillStyle(0xffffff, 1).fillCircle(x + mx - r * 0.22, y + my - r * 0.25, r * 0.2);
  }

  function arco(g, x, y, r, a0, a1, grosor, color) {
    g.lineStyle(grosor, color, 1);
    g.beginPath();
    g.arc(x, y, r, a0, a1, false);
    g.strokePath();
  }

  function dibujarAsteroide(scene, clave, dormido) {
    const g = scene.make.graphics({ x: 0, y: 0, add: false });
    const cx = 32, cy = 32;
    g.fillStyle(0x5E4B3F, 1).fillPoints(roca(cx, cy, 28), true);        // contorno
    g.fillStyle(0xC9B7A4, 1).fillPoints(roca(cx, cy, 24.5), true);      // brillo (borde arriba-izq)
    g.fillStyle(0xA58F7B, 1).fillPoints(roca(cx + 2.2, cy + 2.4, 22.5), true); // cuerpo
    g.fillStyle(0xE3D6C8, 0.9).fillEllipse(cx - 12, cy - 14, 9, 5);    // reflejo
    // cráteres
    const crater = (x, y, r) => {
      g.fillStyle(0x7F6A59, 1).fillCircle(x, y, r);
      g.fillStyle(0x93806E, 1).fillCircle(x + r * 0.25, y + r * 0.25, r * 0.7);
    };
    crater(cx + 13, cy - 9, 5);
    crater(cx - 15, cy + 9, 3.5);
    crater(cx + 5, cy + 17, 3);
    crater(cx - 3, cy - 17, 2.5);
    // cara
    if (dormido) {
      arco(g, cx - 8, cy + 1, 4.5, 0.15 * Math.PI, 0.85 * Math.PI, 3, 0x3B2E26);
      arco(g, cx + 8, cy + 1, 4.5, 0.15 * Math.PI, 0.85 * Math.PI, 3, 0x3B2E26);
    } else {
      ojo(g, cx - 8, cy + 1, 6, { x: 0.6, y: 0.8 });
      ojo(g, cx + 8, cy + 1, 6, { x: 0.6, y: 0.8 });
    }
    g.fillStyle(0xF29A9A, 0.75).fillEllipse(cx - 15, cy + 9, 7, 4).fillEllipse(cx + 15, cy + 9, 7, 4);
    arco(g, cx, cy + 8, 4.5, 0.2 * Math.PI, 0.8 * Math.PI, 3, 0x3B2E26);
    g.generateTexture(clave, 64, 64);
    g.destroy();
  }

  function dibujarAgujero(scene, clave, f) {
    const g = scene.make.graphics({ x: 0, y: 0, add: false });
    const cx = 64, cy = 29, dy = 39; // centro de la esfera y del disco
    g.fillStyle(0x8F6BFF, 0.14).fillEllipse(cx, 34, 124, 60);
    g.fillStyle(0x8F6BFF, 0.16).fillEllipse(cx, 36, 110, 40);
    const banda = (rx, ry, ancho, a0, a1, color) => {
      const fuera = elipse(cx, dy, rx, ry, a0, a1, 40);
      const dentro = elipse(cx, dy, rx - ancho, ry - ancho * 0.4, a1, a0, 40);
      g.fillStyle(color, 1).fillPoints(fuera.concat(dentro), true);
    };
    const disco = (a0, a1) => {
      banda(60, 16, 16, a0, a1, 0x3A2785);
      banda(57, 13.5, 11, a0, a1, 0xC489FF);
      banda(53, 11.5, 4.5, a0, a1, 0x8FE8FF);
    };
    disco(Math.PI, Math.PI * 2);
    // esfera
    g.fillStyle(0x24164F, 1).fillCircle(cx, cy, 24);
    g.fillStyle(0x6A55C9, 1).fillCircle(cx, cy, 20.5);
    g.fillStyle(0x3E2D8C, 1).fillCircle(cx + 1.8, cy + 1.8, 18.5);
    const giro = f ? 1.0 : 0;
    g.lineStyle(2.5, 0x5B48BE, 1);
    for (let k = 0; k < 3; k++) {
      g.beginPath();
      for (let i = 0; i <= 18; i++) {
        const t = i / 18, a = giro + k * (Math.PI * 2 / 3) + t * 2.4, r = 5 + t * 12;
        const x = cx + 1 + Math.cos(a) * r, y = cy + 1 + Math.sin(a) * r;
        if (i === 0) g.moveTo(x, y); else g.lineTo(x, y);
      }
      g.strokePath();
    }
    g.fillStyle(0xC2B3FF, 0.9).fillEllipse(cx - 10, cy - 13, 10, 5);
    ojo(g, cx - 7.5, cy - 3, 7, { x: f ? 1.3 : -1.3, y: -1.5 });
    ojo(g, cx + 7.5, cy - 3, 7, { x: f ? 1.3 : -1.3, y: -1.5 });
    g.fillStyle(0xFF9ED2, 0.85).fillEllipse(cx - 14, cy + 6, 6, 3.5).fillEllipse(cx + 14, cy + 6, 6, 3.5);
    arco(g, cx, cy + 4, 4, 0.2 * Math.PI, 0.8 * Math.PI, 2.5, 0x1A0F3A);
    disco(0, Math.PI);
    g.fillStyle(0xF6E4FF, 1);
    const chispas = f ? [0.35, 1.4, 2.6, 3.7, 5.6] : [0.0, 0.9, 2.0, 3.2, 6.0];
    chispas.forEach(a => {
      if (Math.sin(a) < 0 && Math.abs(Math.cos(a)) < 0.5) return;
      g.fillCircle(cx + Math.cos(a) * 49, dy + Math.sin(a) * 10.5, 1.8);
    });
    g.generateTexture(clave, 128, 64);
    g.destroy();
  }

  function dibujarOvni(scene, clave, f) {
    const g = scene.make.graphics({ x: 0, y: 0, add: false });
    const cx = 32;
    // marciano (detrás de la cúpula)
    g.lineStyle(2.5, 0x3E8A2E, 1).lineBetween(cx - 4, 22, cx - 7, 13).lineBetween(cx + 4, 22, cx + 7, 13);
    g.fillStyle(0xFF8FC8, 1).fillCircle(cx - 7, 12, 2.8).fillCircle(cx + 7, 12, 2.8);
    g.fillStyle(0x3E8A2E, 1).fillCircle(cx, 29, 11);
    g.fillStyle(0x86E05C, 1).fillCircle(cx, 29, 8.5);
    ojo(g, cx - 3.6, 28, 4, { x: f ? -0.6 : 0.6, y: 0.6 });
    ojo(g, cx + 3.6, 28, 4, { x: f ? -0.6 : 0.6, y: 0.6 });
    arco(g, cx, 31.5, 2.8, 0.2 * Math.PI, 0.8 * Math.PI, 1.8, 0x2F6B22);
    // cúpula de cristal
    const cupula = elipse(cx, 36, 16, 18, Math.PI, Math.PI * 2, 30);
    g.fillStyle(0xA8F0FF, 0.35).fillPoints(cupula, true);
    g.lineStyle(3, 0x3C6E86, 1).strokePoints(cupula, true);
    arco(g, cx, 36, 12, 1.15 * Math.PI, 1.4 * Math.PI, 2.5, 0xFFFFFF);
    // platillo
    g.fillStyle(0x3C5A6B, 1).fillEllipse(cx, 41, 62, 22);
    g.fillStyle(0xD8E6EE, 1).fillEllipse(cx, 40, 56, 16);
    g.fillStyle(0x9FB6C4, 1).fillEllipse(cx + 1, 42, 54, 13);
    g.fillStyle(0xEEF6FA, 0.9).fillEllipse(cx - 12, 37, 12, 3.5);
    g.fillStyle(0x3C5A6B, 1).fillEllipse(cx, 49, 22, 7);
    g.fillStyle(0x7E98A8, 1).fillEllipse(cx, 48.5, 18, 4.5);
    // luces que alternan
    const luces = [-19, -9.5, 0, 9.5, 19];
    luces.forEach((dx, i) => {
      const on = (i % 2 === 0) !== !!f;
      g.fillStyle(0x3C5A6B, 1).fillCircle(cx + dx, 43 + Math.abs(dx) * -0.05, 3.4);
      g.fillStyle(on ? 0xFFE45C : 0xFF8FC8, 1).fillCircle(cx + dx, 43 + Math.abs(dx) * -0.05, 2.2);
    });
    g.generateTexture(clave, 64, 64);
    g.destroy();
  }

  function dibujarCielo(scene, clave, tam, n, grande, semilla) {
    const g = scene.make.graphics({ x: 0, y: 0, add: false });
    const r = azar(semilla);
    const tonos = [0xffffff, 0xDCE6FF, 0xFFF1C9, 0xE6D4FF];
    for (let i = 0; i < n; i++) {
      const x = r() * tam, y = r() * tam;
      const rad = grande ? 1 + r() * 1.6 : 0.5 + r() * 0.9;
      g.fillStyle(tonos[Math.floor(r() * tonos.length)], grande ? 0.9 : 0.35 + r() * 0.5).fillCircle(x, y, rad);
    }
    g.generateTexture(clave, tam, tam);
    g.destroy();
  }

  function dibujarDestello(scene, clave) {
    const g = scene.make.graphics({ x: 0, y: 0, add: false });
    const c = 16;
    g.fillStyle(0xBFD3FF, 0.25).fillCircle(c, c, 7);
    g.fillStyle(0xffffff, 1);
    g.fillPoints([{ x: c, y: 1 }, { x: c + 2.4, y: c - 2.4 }, { x: 31, y: c }, { x: c + 2.4, y: c + 2.4 },
      { x: c, y: 31 }, { x: c - 2.4, y: c + 2.4 }, { x: 1, y: c }, { x: c - 2.4, y: c - 2.4 }], true);
    g.generateTexture(clave, 32, 32);
    g.destroy();
  }

  function dibujarNebulosa(scene, clave, semilla, tonos) {
    const g = scene.make.graphics({ x: 0, y: 0, add: false });
    const r = azar(semilla);
    for (let i = 0; i < 70; i++) {
      const a = r() * Math.PI * 2, d = r() * 150;
      const x = 256 + Math.cos(a) * d * 1.3, y = 160 + Math.sin(a) * d * 0.6;
      const rad = 30 + r() * 70 * (1 - d / 220);
      g.fillStyle(tonos[i % tonos.length], 0.035).fillCircle(x, y, rad);
    }
    g.generateTexture(clave, 512, 320);
    g.destroy();
  }

  function texturas(scene) {
    dibujarAsteroide(scene, 'espacio_asteroide_a', false);
    dibujarAsteroide(scene, 'espacio_asteroide_b', true);
    dibujarAgujero(scene, 'espacio_agujero_a', 0);
    dibujarAgujero(scene, 'espacio_agujero_b', 1);
    dibujarOvni(scene, 'espacio_ovni_a', 0);
    dibujarOvni(scene, 'espacio_ovni_b', 1);
    dibujarCielo(scene, 'espacio_cielo_lejos', 256, 140, false, 11);
    dibujarCielo(scene, 'espacio_cielo_cerca', 512, 45, true, 23);
    dibujarDestello(scene, 'espacio_destello');
    dibujarNebulosa(scene, 'espacio_nebulosa_a', 5, [0x9B5CFF, 0x5C7CFF, 0xFF6FD8]);
    dibujarNebulosa(scene, 'espacio_nebulosa_b', 9, [0x3FC8FF, 0x6A5CFF, 0x9B5CFF]);
  }

  function fondo(scene, anchoPx, altoPx) {
    if (!scene.textures.exists('espacio_cielo_lejos')) texturas(scene);
    const cam = scene.cameras.main;
    const vw = cam.width / (cam.zoom || 1), vh = cam.height / (cam.zoom || 1);
    // Tamaño que necesita una capa con scrollFactor f para cubrir todo el recorrido de la cámara.
    const caja = f => ({ w: vw + Math.max(0, anchoPx - vw) * f + 64, h: vh + Math.max(0, altoPx - vh) * f + 64 });
    const r = azar(77);

    // degradado: franja más clara abajo (luz de galaxia)
    const g = scene.add.graphics().setScrollFactor(0).setDepth(-10);
    for (let i = 0; i < 40; i++) {
      g.fillStyle(0x2A2A7A, 0.012 * i).fillRect(0, vh * (0.45 + i * 0.01375), vw, vh * 0.01375 + 1);
    }

    const c1 = caja(0.04);
    scene.add.tileSprite(-32, -32, c1.w, c1.h, 'espacio_cielo_lejos').setOrigin(0).setScrollFactor(0.04).setDepth(-9);

    // nebulosas
    const cn = caja(0.08);
    [['espacio_nebulosa_a', 0.25, 0.3], ['espacio_nebulosa_b', 0.75, 0.55]].forEach(([k, fx, fy]) => {
      scene.add.image(cn.w * fx, cn.h * fy, k).setScale(2.4, 2).setScrollFactor(0.08).setDepth(-8)
        .setBlendMode(Phaser.BlendModes.ADD).setAlpha(0.9);
    });

    // planetas grandes y lejanos
    const cp = caja(0.1);
    const planetas = [['planeta0', 0.1, 0.25, 0.17], ['planeta6', 0.46, 0.7, 0.09], ['planeta3', 0.78, 0.2, 0.22], ['planeta9', 0.97, 0.78, 0.08]];
    planetas.forEach(([k, fx, fy, s]) => {
      if (!scene.textures.exists(k)) return;
      scene.add.image(cp.w * fx, cp.h * fy, k).setScale(s).setScrollFactor(0.1).setDepth(-7).setTint(0xC8C4E8);
    });

    const c2 = caja(0.18);
    scene.add.tileSprite(-32, -32, c2.w, c2.h, 'espacio_cielo_cerca').setOrigin(0).setScrollFactor(0.18).setDepth(-6);

    // estrellas que titilan
    const ct = caja(0.25);
    const nEstrellas = Math.round((ct.w * ct.h) / 60000);
    for (let i = 0; i < nEstrellas; i++) {
      const s = scene.add.image(r() * ct.w, r() * ct.h, 'espacio_destello').setScrollFactor(0.25).setDepth(-5)
        .setScale(0.35 + r() * 0.45).setAlpha(0.3);
      scene.tweens.add({
        targets: s, alpha: 1, scale: s.scale * 1.35, duration: 700 + r() * 1300, delay: r() * 2500,
        yoyo: true, repeat: -1, ease: 'Sine.easeInOut',
      });
    }
  }

  CAJAS.registrarMundo({
    id: 'espacio',
    nombre: 'Espacio de Estrellas',
    orden: 3,
    terreno: 'purple',
    colorCielo: '#0B1033',
    fisica: {
      gravedad: 900,
      salto: 700,
      velocidad: 240,
      aceleracion: 1800,
      frenado: 1800,
      nadar: false,
    },
    fondo,
    texturas,
    enemigos: {
      a: {
        nombre: 'Asteroide viajero',
        sprite: { textura: ['espacio_asteroide_a', 'espacio_asteroide_b'], fps: 1.5 },
        comportamiento: 'gira', velocidad: 45, rango: 2, cuerpo: { w: 44, h: 44 },
      },
      s: {
        nombre: 'Asteroide dormilón',
        sprite: { textura: ['espacio_asteroide_b', 'espacio_asteroide_a'], fps: 0.8 },
        escala: 1.15, comportamiento: 'gira', velocidad: 30, rango: 0, cuerpo: { w: 46, h: 46 },
      },
      h: {
        nombre: 'Agujero negro curioso',
        sprite: { textura: ['espacio_agujero_a', 'espacio_agujero_b'], fps: 3 },
        comportamiento: 'atrae', rango: 3, cuerpo: { w: 36, h: 36 },
      },
      o: {
        nombre: 'Ovni saludador',
        sprite: { textura: ['espacio_ovni_a', 'espacio_ovni_b'], fps: 3 },
        comportamiento: 'nada', velocidad: 40, rango: 3, cuerpo: { w: 52, h: 30 },
      },
      f: {
        nombre: 'Ovni mirón',
        sprite: { textura: ['espacio_ovni_b', 'espacio_ovni_a'], fps: 2 },
        escala: 0.8, comportamiento: 'flota', velocidad: 35, rango: 2, cuerpo: { w: 42, h: 24 },
      },
      m: {
        nombre: 'Babosa lunar',
        sprite: { atlas: 'enemigos', frames: ['slime_normal_walk_a', 'slime_normal_walk_b'], fps: 3 },
        tinte: 0xC9A8FF, comportamiento: 'patrulla', velocidad: 30, cuerpo: { w: 48, h: 30 },
      },
    },
    niveles: [
      {
        nombre: 'Islas de los números',
        mapa: [
          '........................................................................................',
          '........................................................................................',
          '........................................................................................',
          '........................................................................................',
          '........................................................................................',
          '........................................o...............................................',
          '................................................C.......................................',
          '..............................................=====.....................................',
          '............C...........................................................................',
          '..........====.................................................o........................',
          '...................................................====.................====........s...',
          '........................s.......................................B.......................',
          '......====.......................a..............................B.............a.......B.',
          '...................f....................................===.....B...===...............B.',
          '...........................B........................................................Q.BK',
          '..........====............BV...................m..................................######',
          '.....................#######...........#################........f.######.....C....######',
          '...P...C........m....#######...######..#################.....Q....######..######..######',
          '.#########..#######............######..#################..######..........######==......',
          '.#########..#######.......................................######........................',
          '.#########..................===.........................................................',
          '....................................................a.........................===.......',
          '................C........m..............h...............................................',
          '.............##################...................................C...m.................',
          '.............##################...........................####################..........',
          '..........................................................####################..........',
        ],
        palabras: [
          { caja: 'uno', respuesta: 'one' },
          { caja: 'dos', respuesta: 'two' },
          { caja: 'tres', respuesta: 'three' },
          { caja: 'cuatro', respuesta: 'four' },
          { caja: 'cinco', respuesta: 'five' },
          { caja: 'seis', respuesta: 'six' },
          { caja: 'siete', respuesta: 'seven' },
          { caja: 'ocho', respuesta: 'eight' },
        ],
      },
      {
        nombre: 'La órbita de las formas',
        mapa: [
          '................................................................................................',
          '................................................................................................',
          '................................................................................................',
          '................................................................................................',
          '................................................................................................',
          '..............................................L.................................................',
          '.............................................===....................................o...........',
          '.....C..........................................................................................',
          '...====........................................................................C................',
          '............o...........................h............Q.......................====...............',
          '...................................................====.........................................',
          '..................................o.............................................................',
          '.......===...............................................................................f...Q..',
          '.....................................a............................a.....===...............######',
          '..............................CV........................===...............................######',
          '..............a............#####..........................................................######',
          '...===................^....#####...................................................#####........',
          '....................####...........###........m...........f........#####...........#####........',
          '....................####.........==###...###############...........#####......s.................',
          '...P..C.....####.........................###############...................#####................',
          '.#######....####.........................###############....####...........#####................',
          '.#######.......................===..........................####........................h.......',
          '.#######........................................................................B..===..........',
          '.........h......................................................................B...............',
          '.............C........m........................................s........m.......BC..............',
          '............###################...............................#####################.............',
          '............###################...............................#####################.............',
          '................................................................................................',
        ],
        palabras: [
          { caja: 'la estrella', respuesta: 'star' },
          { caja: 'la luna', respuesta: 'moon' },
          { caja: 'el planeta', respuesta: 'planet' },
          { caja: 'el cohete', respuesta: 'rocket' },
          { caja: 'el círculo', respuesta: 'circle' },
          { caja: 'el cuadrado', respuesta: 'square' },
          { caja: 'el triángulo', respuesta: 'triangle' },
          { caja: 'grande', respuesta: 'big' },
        ],
      },
    ],
  });
})();
