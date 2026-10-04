// Cajas de Palabras — base del motor: estado guardado, mapa, texturas propias y piezas de interfaz.
(function () {
  'use strict';
  const M = (CAJAS.M = CAJAS.M || {});
  M.T = 64;
  M.ANCHO = 1280;
  M.ALTO = 720;
  M.FT = '"Baloo 2", "Nunito", system-ui, sans-serif';
  M.FN = '"Nunito", "Baloo 2", system-ui, sans-serif';
  M.COLORES = ['green', 'pink', 'purple', 'yellow', 'beige'];
  // Color único de la pintura del pincel (trazo, cerdas, golpe y destello). Un solo tono, no arcoíris.
  M.PINTURA = { base: 0xE83E8C, clara: 0xFF9CC8, oscura: 0x9E1F5C };
  M.NOMBRE_COLOR = { green: 'Verde', pink: 'Rosa', purple: 'Lila', yellow: 'Amarillo', beige: 'Arena' };
  M.MAX_VIDAS = 5;
  M.RAPIDEZ = 1.35; // multiplica velocidad y aceleración horizontal del jugador en todos los mundos
  M.esRompible = k => k === 'B' || k === 'K' || k === 'Q' || k === 'V';

  // ---------- estado guardado ----------
  // Progreso por usuario dentro de app2 (?u=<id>), como los demás juegos de /juegos.
  const usuario = new URLSearchParams(location.search).get('u');
  const CLAVE = 'cajasDePalabras.v1' + (usuario ? '.u' + usuario : '');
  const base = () => ({ personaje: 'green', libros: 0, hechos: {}, estrellas: {}, librosTomados: {}, abrirTodo: false });
  M.estado = base();
  try {
    const s = localStorage.getItem(CLAVE);
    if (s) {
      const o = JSON.parse(s);
      if (o && typeof o === 'object') Object.assign(M.estado, o);
    }
  } catch (e) { /* sin localStorage: se juega igual */ }
  if (!M.COLORES.includes(M.estado.personaje)) M.estado.personaje = 'green';
  ['hechos', 'estrellas', 'librosTomados'].forEach(k => { if (!M.estado[k] || typeof M.estado[k] !== 'object') M.estado[k] = {}; });
  M.estado.libros = Math.max(0, Math.min(2, Number(M.estado.libros) || 0));
  M.guardar = function () {
    try { localStorage.setItem(CLAVE, JSON.stringify(M.estado)); } catch (e) { /* nada */ }
  };
  M.clave = (m, i) => m.id + ':' + i;

  // ---------- mundos ----------
  M.FISICA = { gravedad: 1500, salto: 820, velocidad: 260, aceleracion: 2400, frenado: 2400, nadar: false };
  M.mundos = () => CAJAS.mundos.filter(m => !m._roto && m._niveles && m._niveles.some(n => n.valido));
  M.hecho = (m, i) => !!M.estado.hechos[M.clave(m, i)];
  M.nivelesHechos = m => m.niveles.reduce((a, _n, i) => a + (M.hecho(m, i) ? 1 : 0), 0);
  M.mundoCompleto = m => M.nivelesHechos(m) >= m.niveles.length;
  M.mundoDesbloqueado = m => {
    const l = M.mundos();
    const i = l.indexOf(m);
    return i <= 0 || M.PRUEBAS || M.DOCENTE || M.estado.abrirTodo || M.mundoCompleto(l[i - 1]);
  };
  M.nivelDesbloqueado = (m, i) => M.mundoDesbloqueado(m) && (i === 0 || M.PRUEBAS || M.DOCENTE || M.estado.abrirTodo || M.hecho(m, i - 1));
  M.librosMundo = m => {
    let total = 0, tomados = 0;
    (m._niveles || []).forEach((p, i) => { if (p.libro) { total++; if (M.estado.librosTomados[M.clave(m, i)]) tomados++; } });
    return { total, tomados };
  };

  M.prepararMundos = function () {
    for (const m of CAJAS.mundos) {
      if (m._roto) continue;
      try {
        m._fis = Object.assign({}, M.FISICA, m.fisica || {});
        // nadar sin gravedad propia: 30 % de la estándar
        if (m._fis.nadar && !(m.fisica && m.fisica.gravedad)) m._fis.gravedad = M.FISICA.gravedad * 0.3;
        m._fisBase = Object.assign({}, m._fis); // la del contrato: la usa el cálculo de alcance
        m._fis.velocidad *= M.RAPIDEZ;
        m._fis.aceleracion *= M.RAPIDEZ;
        m._niveles = m.niveles.map((n, i) => {
          const p = M.parsear(n, m);
          p.idx = i;
          p.errores.forEach(e => console.warn(`[cajas] ${m.id} nivel ${i + 1}: ${e}`));
          return p;
        });
        if (!m._niveles.some(n => n.valido)) throw new Error('ningún nivel válido');
      } catch (e) {
        m._roto = true;
        console.warn('[cajas] el mundo', m.id, 'se omite:', e);
      }
    }
  };

  // ---------- mapa ----------
  M.parsear = function (nivel, mundo) {
    const filas = (nivel.mapa || []).map(String);
    const H = filas.length;
    const W = filas.reduce((a, f) => Math.max(a, f.length), 0);
    const g = filas.map(f => f.padEnd(W, '.').split(''));
    const subida = !!(mundo && mundo.modo === 'subida');
    const p = { W, H, g, P: null, subida, meta: null, jet: null, compuertas: [], rompibles: [], cajas: [], libro: null, enemigos: [], errores: [], def: nivel };
    if (filas.some(f => f.length !== W)) p.errores.push('filas de distinta longitud (se rellenan con «.»)');
    for (let r = 0; r < H; r++) {
      for (let c = 0; c < W; c++) {
        const ch = g[r][c];
        if (ch === 'P') p.P = { r, c };
        else if (ch === 'C') p.cajas.push({ r, c });
        else if (ch === 'L') p.libro = { r, c };
        else if (ch === 'Q') { p.cajas.push({ r, c, oculta: true }); p.rompibles.push({ r, c, ch }); }
        else if (ch === 'K') { p.libro = p.libro || { r, c, oculto: true }; p.rompibles.push({ r, c, ch }); }
        else if (ch === 'B' || ch === 'V') p.rompibles.push({ r, c, ch });
        else if (ch === 'M') p.meta = { r, c };
        else if (ch === 'J') p.jet = { r, c };
        else if (ch >= 'a' && ch <= 'z') p.enemigos.push({ r, c, ch });
      }
    }
    // celda de enemigo rodeada de agua = agua
    for (const e of p.enemigos) {
      const iz = c => c >= 0 && c < W && g[e.r][c] === '~';
      if (iz(e.c - 1) && iz(e.c + 1)) e.agua = true;
    }
    // compuertas: tramos de G seguidos en una fila (de abajo arriba)
    for (let r = 0; r < H; r++) {
      let c = 0;
      while (c < W) {
        if (g[r][c] !== 'G') { c++; continue; }
        const c1 = c;
        while (c < W && g[r][c] === 'G') c++;
        p.compuertas.push({ r, c1, c2: c - 1 });
      }
    }
    p.compuertas.sort((a, b) => b.r - a.r);
    const pal = Array.isArray(nivel.palabras) ? nivel.palabras : [];
    if (!p.P) p.errores.push('falta la P (salida)');
    if (subida) {
      if (!p.meta) p.errores.push('falta la M (meta)');
      if (p.cajas.length !== pal.length) p.errores.push(`hay ${p.cajas.length} cajas y ${pal.length} palabras (deben coincidir)`);
      if (p.compuertas.length !== p.cajas.length) p.errores.push(`hay ${p.compuertas.length} compuertas y ${p.cajas.length} cajas (una por tramo)`);
    } else {
      if (p.cajas.length !== 8) p.errores.push(`hay ${p.cajas.length} cajas (deben ser 8)`);
      if (pal.length !== 8) p.errores.push(`hay ${pal.length} palabras (deben ser 8)`);
    }
    const n = Math.min(p.cajas.length, pal.length);
    p.cajas = p.cajas.slice(0, n).map((cj, i) => Object.assign(cj, { palabra: String(pal[i].caja), respuesta: String(pal[i].respuesta) }));
    if (subida) {
      p.cajas.forEach((cj, i) => { cj.tramo = p.compuertas.filter(q => q.r > cj.r).length; });
      p.compuertas.forEach((q, t) => { q.caja = p.cajas.findIndex(cj => cj.tramo === t); });
    }
    p.valido = !!(p.P && n > 0 && (!subida || p.meta));
    return p;
  };
  M.celda = (p, r, c) => (c < 0 || c >= p.W || r < 0) ? '#' : (r >= p.H ? '.' : p.g[r][c]);
  M.solido = (p, r, c) => M.celda(p, r, c) === '#';
  M.apoyo = (p, r, c) => { const k = M.celda(p, r, c); return k === '#' || k === '='; };
  M.esAgua = (p, r, c) => {
    if (r < 0 || c < 0 || r >= p.H || c >= p.W) return false;
    const k = p.g[r][c];
    if (k === '~') return true;
    if (k >= 'a' && k <= 'z') {
      // enemigo dentro del agua: agua a un lado y agua o pared al otro
      const iz = M.celda(p, r, c - 1), de = M.celda(p, r, c + 1);
      return (iz === '~' && (de === '~' || de === '#')) || (de === '~' && iz === '#');
    }
    return false;
  };

  M.TERRENO_COLOR = {
    grass: [0x7ACB4F, 0xB0703F], dirt: [0xC98A55, 0x94592F], sand: [0xF0D08A, 0xCF9F59],
    snow: [0xEFF7FF, 0x9FBCD6], stone: [0xB7BEC7, 0x78838F], purple: [0xB58AE6, 0x7B55B5],
  };
  M.colTerreno = t => M.TERRENO_COLOR[t] || M.TERRENO_COLOR.grass;

  // Dibuja el mapa a escala s (px por bloque) en un Graphics.
  M.dibujarMapa = function (g, p, x, y, s, terreno) {
    const [cTop, cIn] = M.colTerreno(terreno);
    for (let r = 0; r < p.H; r++) {
      let c = 0;
      while (c < p.W) {
        const k = p.g[r][c];
        let e = c;
        while (e < p.W && p.g[r][e] === k) e++;
        const w = (e - c) * s;
        if (k === '#') {
          const top = M.celda(p, r - 1, c) !== '#';
          g.fillStyle(top ? cTop : cIn, 1);
          g.fillRect(x + c * s, y + r * s, w, s);
        } else if (k === '=') {
          g.fillStyle(cTop, 0.9);
          g.fillRect(x + c * s, y + r * s, w, Math.max(1, s * 0.45));
        } else if (k === '~') {
          g.fillStyle(0x3FA9F5, 0.85);
          g.fillRect(x + c * s, y + r * s, w, s);
        } else if (k === '|') {
          g.fillStyle(0x9BE0FF, 0.8);
          g.fillRect(x + c * s, y + r * s, w, s);
        } else if (k === 'G') {
          g.fillStyle(0xF5A623, 1);
          g.fillRect(x + c * s, y + r * s, w, s);
        } else if (k === '^') {
          g.fillStyle(0xE05A5A, 0.9);
          g.fillRect(x + c * s, y + r * s + s * 0.5, w, s * 0.5);
        }
        c = e;
      }
    }
  };

  // Pista de zona en palabras: «arriba a la izquierda», «abajo, al centro»…
  M.zona = function (p, r, c) {
    const fx = (c + 0.5) / p.W, fy = (r + 0.5) / p.H;
    const h = fx < 0.36 ? 'izq' : fx > 0.64 ? 'der' : 'cen';
    const v = fy < 0.4 ? 'arriba' : fy > 0.66 ? 'abajo' : 'medio';
    if (h === 'cen' && v === 'medio') return 'en el centro';
    const hs = { izq: 'a la izquierda', der: 'a la derecha', cen: 'al centro' }[h];
    if (v === 'medio') return 'en medio, ' + hs;
    return h === 'cen' ? v + ', al centro' : v + ' ' + hs;
  };

  // PRNG con semilla
  M.semilla = function (str) {
    let h = 1779033703 ^ str.length;
    for (let i = 0; i < str.length; i++) { h = Math.imul(h ^ str.charCodeAt(i), 3432918353); h = (h << 13) | (h >>> 19); }
    let a = h >>> 0;
    return function () {
      a |= 0; a = (a + 0x6D2B79F5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  };
  M.barajar = function (arr, rnd) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
    return a;
  };

  // ---------- sonido ----------
  const VOL = { sfx_jump: 0.25, 'sfx_jump-high': 0.3, sfx_coin: 0.45, sfx_gem: 0.5, sfx_hurt: 0.5, sfx_magic: 0.45, sfx_select: 0.35, sfx_bump: 0.4, sfx_disappear: 0.4, sfx_throw: 0.35 };
  M.sonar = function (scene, key, cfg) {
    try {
      if (!scene || !scene.sound || scene.sound.locked) return;
      if (!scene.cache.audio.exists(key)) return;
      scene.sound.play(key, Object.assign({ volume: VOL[key] || 0.4 }, cfg || {}));
    } catch (e) { /* sin sonido */ }
  };

  // ---------- texto e interfaz ----------
  M.hex = n => '#' + (n >>> 0).toString(16).padStart(6, '0').slice(-6);
  M.texto = function (scene, x, y, str, o) {
    o = o || {};
    const st = {
      fontFamily: o.fuente === 'n' ? M.FN : M.FT,
      fontSize: (o.size || 24) + 'px',
      fontStyle: o.peso || (o.fuente === 'n' ? '800' : '700'),
      color: o.color || '#ffffff',
      align: o.align || 'center',
    };
    if (o.stroke) { st.stroke = o.stroke; st.strokeThickness = o.strokeW || 6; }
    if (o.wrap) st.wordWrap = { width: o.wrap, useAdvancedWrap: true };
    if (o.sombra) st.shadow = { offsetX: 0, offsetY: 4, color: 'rgba(0,0,0,0.35)', blur: 0, fill: true, stroke: true };
    const t = scene.add.text(x, y, String(str), st);
    t.setResolution(2);
    t.setOrigin(o.ox == null ? 0.5 : o.ox, o.oy == null ? 0.5 : o.oy);
    if (o.max && t.width > o.max) t.setScale(o.max / t.width);
    return t;
  };

  M.PALETA = {
    verde: { base: 0x5BC453, borde: 0x2F8A35 },
    azul: { base: 0x4D9BE6, borde: 0x2A63A8 },
    naranja: { base: 0xF5A623, borde: 0xB8700C },
    morado: { base: 0x9B6BDF, borde: 0x5E3A9E },
    rojo: { base: 0xEE6A5A, borde: 0xA83A2E },
    gris: { base: 0x9AA4B5, borde: 0x5D6678 },
    blanco: { base: 0xFFFFFF, borde: 0xB9C3D3 },
  };

  // Panel redondeado con borde (dibuja en g)
  M.panel = function (g, x, y, w, h, o) {
    o = o || {};
    const r = o.r == null ? 18 : o.r;
    if (o.sombra !== false) { g.fillStyle(0x000000, 0.25); g.fillRoundedRect(x + 3, y + 8, w, h, r); }
    if (o.borde != null) { g.fillStyle(o.borde, o.bordeA == null ? 1 : o.bordeA); g.fillRoundedRect(x, y, w, h, r); }
    const b = o.borde != null ? (o.grosor || 5) : 0;
    g.fillStyle(o.fondo == null ? 0xFFFFFF : o.fondo, o.alpha == null ? 1 : o.alpha);
    g.fillRoundedRect(x + b, y + b, w - b * 2, h - b * 2, Math.max(2, r - b));
  };

  // Botón estilo Kenney con foco para teclado.
  M.boton = function (scene, x, y, w, h, label, o) {
    o = o || {};
    const col = M.PALETA[o.color || 'verde'];
    const c = scene.add.container(x, y);
    const g = scene.add.graphics();
    const r = Math.min(16, h / 3);
    let foco = false, abajo = false;
    const dib = () => {
      g.clear();
      if (foco) { g.fillStyle(0xFFFFFF, 1); g.fillRoundedRect(-w / 2 - 5, -h / 2 - 5, w + 10, h + 10, r + 5); g.fillStyle(0x14213D, 1); g.fillRoundedRect(-w / 2 - 2, -h / 2 - 2, w + 4, h + 4, r + 2); }
      const d = abajo ? 3 : 0;
      g.fillStyle(col.borde, 1); g.fillRoundedRect(-w / 2, -h / 2 + d, w, h - d, r);
      g.fillStyle(c.deshabilitado ? 0xB8BFCA : col.base, 1); g.fillRoundedRect(-w / 2, -h / 2 + d, w, h - 6, r);
      g.fillStyle(0xFFFFFF, 0.22); g.fillRoundedRect(-w / 2 + 8, -h / 2 + 5 + d, w - 16, Math.max(4, (h - 6) * 0.32), r * 0.6);
      if (o.color === 'blanco') { g.lineStyle(3, 0xB9C3D3, 1); g.strokeRoundedRect(-w / 2 + 1.5, -h / 2 + d + 1.5, w - 3, h - d - 3, r); }
    };
    c.add(g);
    const oscuro = o.color === 'blanco';
    const t = M.texto(scene, o.icono ? 14 : 0, -3, label, {
      size: o.size || 26, color: oscuro ? '#2A3550' : '#ffffff', stroke: oscuro ? null : M.hex(col.borde), strokeW: 5,
      max: w - (o.icono ? 64 : 24),
    });
    c.add(t);
    c.etiqueta = t;
    if (o.icono) {
      const ic = scene.add.image(-w / 2 + 30, -3, o.icono.key, o.icono.frame);
      ic.setScale((o.icono.tam || 36) / Math.max(ic.width, ic.height));
      c.add(ic);
      t.x = 14;
    }
    dib();
    c.setSize(w, h);
    c.setInteractive({ useHandCursor: true });
    c.on('pointerover', () => { if (o.nav) o.nav.enfocar(c); else c.setFoco(true); });
    c.on('pointerout', () => { abajo = false; if (!o.nav) c.setFoco(false); else dib(); });
    c.on('pointerdown', () => { abajo = true; dib(); });
    c.on('pointerup', () => { if (!abajo) return; abajo = false; dib(); c.activar(); });
    c.activar = () => {
      if (c.deshabilitado) { M.sonar(scene, 'sfx_bump'); return; }
      if (o.nav && o.nav.bloqueado()) return;
      M.sonar(scene, 'sfx_select');
      if (o.onClick) o.onClick(c);
    };
    c.setFoco = b => {
      if (foco === b) return;
      foco = b; dib();
      scene.tweens.add({ targets: c, scale: b ? 1.05 : 1, duration: 110, ease: 'Quad.out' });
    };
    c.redibujar = dib;
    return c;
  };

  // Navegación con teclado entre elementos con setFoco/activar. Mueve por geometría.
  M.Nav = class {
    constructor(scene) {
      this.scene = scene; this.items = []; this.foco = null; this.activo = true; this.desde = 0;
      this.h = e => this.tecla(e);
      scene.input.keyboard.on('keydown', this.h);
      scene.events.once('shutdown', () => this.destruir());
    }
    bloqueado() { return this.scene.time.now < this.desde; }
    poner(items, inicial) {
      if (this.foco && this.foco.setFoco) this.foco.setFoco(false);
      this.foco = null;
      this.items = items.filter(Boolean);
      this.enfocar(inicial || this.items[0]);
      this.desde = this.scene.time.now + 350;
    }
    enfocar(it) {
      if (this.foco === it) return;
      if (this.foco && this.foco.setFoco) this.foco.setFoco(false);
      this.foco = it || null;
      if (it && it.setFoco) it.setFoco(true);
      if (this.alEnfocar) this.alEnfocar(it);
    }
    centro(it) {
      try { const b = it.getBounds(); return { x: b.centerX, y: b.centerY }; } catch (e) { return { x: it.x, y: it.y }; }
    }
    mover(dx, dy) {
      if (!this.foco) { this.enfocar(this.items[0]); return; }
      const a = this.centro(this.foco);
      let mejor = null, md = Infinity;
      for (const it of this.items) {
        if (it === this.foco || !it.visible) continue;
        const b = this.centro(it);
        const vx = b.x - a.x, vy = b.y - a.y;
        const prim = dx ? vx * dx : vy * dy;
        if (prim <= 4) continue;
        const sec = dx ? Math.abs(vy) : Math.abs(vx);
        const d = prim + sec * 2.2;
        if (d < md) { md = d; mejor = it; }
      }
      if (mejor) { this.enfocar(mejor); M.sonar(this.scene, 'sfx_select', { volume: 0.15 }); }
    }
    tecla(e) {
      if (!this.activo || !this.items.length) return;
      const k = e.key;
      if (k === 'ArrowLeft') this.mover(-1, 0);
      else if (k === 'ArrowRight') this.mover(1, 0);
      else if (k === 'ArrowUp') this.mover(0, -1);
      else if (k === 'ArrowDown') this.mover(0, 1);
      else if (k === 'Tab') {
        if (e.preventDefault) e.preventDefault();
        const i = this.items.indexOf(this.foco);
        this.enfocar(this.items[(i + (e.shiftKey ? -1 : 1) + this.items.length) % this.items.length]);
      } else if (k === 'Enter' || k === ' ') {
        if (this.bloqueado()) return;
        if (this.foco && this.foco.activar) this.foco.activar();
      }
    }
    destruir() {
      try { this.scene.input.keyboard.off('keydown', this.h); } catch (e) { /* nada */ }
      this.items = []; this.activo = false;
    }
  };

  // ---------- texturas del motor ----------
  M.texturasMotor = function (scene) {
    const mk = () => scene.make.graphics({ x: 0, y: 0, add: false });
    const estrella = (g, cx, cy, ro, ri, n) => {
      const pts = [];
      for (let i = 0; i < n * 2; i++) {
        const a = -Math.PI / 2 + i * Math.PI / n;
        const rr = i % 2 ? ri : ro;
        pts.push(new Phaser.Geom.Point(cx + Math.cos(a) * rr, cy + Math.sin(a) * rr));
      }
      g.fillPoints(pts, true);
    };
    let g;
    // libro morado
    g = mk();
    g.fillStyle(0x000000, 0.18); g.fillRoundedRect(10, 12, 48, 48, 10);
    g.fillStyle(0x3B2370, 1); g.fillRoundedRect(12, 6, 46, 52, 10);
    g.fillStyle(0xFFF3D6, 1); g.fillRoundedRect(16, 10, 38, 44, 6);
    g.fillStyle(0xE3CFA4, 1); for (let i = 0; i < 4; i++) g.fillRect(44, 16 + i * 9, 8, 2);
    g.fillStyle(0x3B2370, 1); g.fillRoundedRect(4, 4, 44, 54, 10);
    g.fillStyle(0x8E5BD9, 1); g.fillRoundedRect(8, 8, 36, 46, 7);
    g.fillStyle(0x6B3DBA, 1); g.fillRoundedRect(8, 8, 9, 46, { tl: 7, bl: 7, tr: 0, br: 0 });
    g.fillStyle(0xB993F2, 1); g.fillRoundedRect(20, 11, 20, 5, 2.5);
    g.fillStyle(0xC58A12, 1); estrella(g, 30, 32, 12, 5.5, 5);
    g.fillStyle(0xFFD34D, 1); estrella(g, 30, 32, 8.5, 3.8, 5);
    g.fillStyle(0xE8524A, 1); g.fillRect(36, 54, 6, 8); g.fillTriangle(36, 62, 42, 62, 39, 58);
    g.generateTexture('m_libro', 64, 64); g.destroy();

    // check verde
    g = mk();
    g.fillStyle(0x1E7A2E, 1); g.fillCircle(20, 20, 20);
    g.fillStyle(0x3DBB4E, 1); g.fillCircle(20, 20, 16);
    g.fillStyle(0x6FDB7C, 1); g.fillEllipse(15, 12, 12, 6);
    g.lineStyle(6, 0xFFFFFF, 1); g.beginPath(); g.moveTo(11, 21); g.lineTo(18, 28); g.lineTo(30, 13); g.strokePath();
    g.generateTexture('m_check', 40, 40); g.destroy();

    // chispa (estrella de 4 puntas)
    g = mk(); g.fillStyle(0xFFFFFF, 1); estrella(g, 12, 12, 12, 3.5, 4); g.generateTexture('m_chispa', 24, 24); g.destroy();
    // estrella de 5 puntas para confeti/celebración
    g = mk(); g.fillStyle(0xFFFFFF, 1); estrella(g, 12, 12, 12, 5, 5); g.generateTexture('m_estrellita', 24, 24); g.destroy();
    // polvo
    g = mk(); g.fillStyle(0xFFFFFF, 1); g.fillCircle(8, 8, 8); g.generateTexture('m_polvo', 16, 16); g.destroy();
    // confeti
    g = mk(); g.fillStyle(0xFFFFFF, 1); g.fillRoundedRect(0, 0, 14, 8, 2); g.generateTexture('m_confeti', 14, 8); g.destroy();
    // brillo radial
    g = mk();
    for (let i = 0; i < 22; i++) { g.fillStyle(0xFFFFFF, 0.05); g.fillCircle(64, 64, 64 * (1 - i / 22)); }
    g.generateTexture('m_brillo', 128, 128); g.destroy();
    // flecha
    g = mk();
    const fl = [[4, 15], [22, 15], [22, 6], [40, 21], [22, 36], [22, 27], [4, 27]].map(([a, b]) => new Phaser.Geom.Point(a, b));
    g.lineStyle(7, 0x7A3A06, 1); g.strokePoints(fl, true, true);
    g.fillStyle(0xFFFFFF, 1); g.fillPoints(fl, true);
    g.generateTexture('m_flecha', 44, 42); g.destroy();
    // cascada
    g = mk();
    const rnd = M.semilla('cascada');
    g.fillStyle(0x5CC3F2, 1); g.fillRect(0, 0, 64, 128);
    for (let i = 0; i < 26; i++) {
      const x = 6 + Math.floor(rnd() * 50), y = Math.floor(rnd() * 128), l = 18 + Math.floor(rnd() * 40);
      const claro = rnd() > 0.35;
      g.fillStyle(claro ? 0xC8F2FF : 0x3FA7DE, claro ? 0.9 : 0.8);
      g.fillRoundedRect(x, y, 3, l, 1.5); g.fillRoundedRect(x, y - 128, 3, l, 1.5);
    }
    g.fillStyle(0x2F8CC4, 1); g.fillRect(0, 0, 5, 128); g.fillRect(59, 0, 5, 128);
    g.fillStyle(0xE8FBFF, 0.7); g.fillRect(5, 0, 3, 128);
    g.generateTexture('m_cascada', 64, 128); g.destroy();
    // corazón pequeño para partículas
    g = mk(); g.fillStyle(0xFF5A6E, 1); g.fillCircle(8, 8, 7); g.fillCircle(20, 8, 7); g.fillTriangle(1.5, 11, 26.5, 11, 14, 25);
    g.generateTexture('m_corazon', 28, 28); g.destroy();
    // grietas para los bloques rompibles
    g = mk();
    g.lineStyle(3, 0x3A1E0C, 0.75);
    [[[8, 6], [20, 18], [16, 30], [28, 40]], [[56, 10], [44, 22], [48, 34]], [[30, 58], [36, 46], [28, 40], [40, 30]], [[6, 50], [16, 44]]].forEach(l => {
      g.beginPath(); g.moveTo(l[0][0], l[0][1]); l.slice(1).forEach(([x, y]) => g.lineTo(x, y)); g.strokePath();
    });
    g.lineStyle(2, 0xFFFFFF, 0.35);
    g.beginPath(); g.moveTo(9, 8); g.lineTo(21, 19); g.strokePath();
    g.generateTexture('m_grietas', 64, 64); g.destroy();
    // pincel: mango de madera, virola y cerdas de colores (sale hacia la derecha desde x=0)
    g = mk();
    g.fillStyle(0x6B3A16, 1); g.fillRoundedRect(0, 7, 36, 10, 5);
    g.fillStyle(0xC98A4E, 1); g.fillRoundedRect(2, 9, 32, 6, 3);
    g.fillStyle(0x5D6678, 1); g.fillRect(34, 5, 9, 14);
    g.fillStyle(0xC9D1DD, 1); g.fillRect(36, 7, 5, 10);
    g.fillStyle(M.PINTURA.oscura, 1); g.fillRoundedRect(41, 3, 21, 18, { tl: 2, bl: 2, tr: 9, br: 9 });
    g.fillStyle(M.PINTURA.clara, 1); g.fillRoundedRect(43, 5, 17, 5, { tl: 1, bl: 1, tr: 4, br: 0 });
    g.fillStyle(M.PINTURA.base, 1); g.fillRect(43, 10, 17, 4);
    g.fillStyle(M.PINTURA.base, 1); g.fillRoundedRect(43, 14, 17, 5, { tl: 1, bl: 1, tr: 0, br: 4 });
    g.generateTexture('m_pincel', 64, 24); g.destroy();
    // icono de pincel para el botón táctil
    g = mk();
    g.lineStyle(0, 0, 0);
    g.fillStyle(0xFFFFFF, 1); g.fillRoundedRect(6, 30, 30, 9, 4); g.fillRoundedRect(32, 26, 16, 17, { tl: 2, bl: 2, tr: 8, br: 8 });
    g.generateTexture('m_pincel_ico', 54, 64); g.destroy();
  };

  // Copia del atlas de tiles con 1 px de borde repetido en cada celda (sin costuras al mover la cámara).
  M.tilesExtruidos = function (scene) {
    if (scene.textures.exists('tiles_ext')) return;
    const img = scene.textures.get('tiles').getSourceImage();
    const cols = Math.floor((img.width + 1) / 65), rows = Math.floor((img.height + 1) / 65);
    const cv = scene.textures.createCanvas('tiles_ext', cols * 66, rows * 66);
    const ctx = cv.getContext();
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const sx = c * 65, sy = r * 65, dx = c * 66 + 1, dy = r * 66 + 1;
        ctx.drawImage(img, sx, sy, 64, 1, dx, dy - 1, 64, 1);
        ctx.drawImage(img, sx, sy + 63, 64, 1, dx, dy + 64, 64, 1);
        ctx.drawImage(img, sx, sy, 1, 64, dx - 1, dy, 1, 64);
        ctx.drawImage(img, sx + 63, sy, 1, 64, dx + 64, dy, 1, 64);
        ctx.drawImage(img, sx, sy, 64, 64, dx, dy, 64, 64);
      }
    }
    cv.refresh();
  };

  // Animaciones de los personajes
  M.animacionesJugador = function (scene) {
    const A = scene.anims;
    for (const col of M.COLORES) {
      const f = n => ({ key: 'personajes', frame: `character_${col}_${n}` });
      if (!A.exists(`p_${col}_walk`)) A.create({ key: `p_${col}_walk`, frames: [f('walk_a'), f('walk_b')], frameRate: 9, repeat: -1 });
      if (!A.exists(`p_${col}_swim`)) A.create({ key: `p_${col}_swim`, frames: [f('walk_a'), f('walk_b')], frameRate: 4, repeat: -1 });
      if (!A.exists(`p_${col}_idle`)) A.create({ key: `p_${col}_idle`, frames: [f('idle')], frameRate: 1, repeat: -1 });
      if (!A.exists(`p_${col}_jump`)) A.create({ key: `p_${col}_jump`, frames: [f('jump')], frameRate: 1, repeat: -1 });
      if (!A.exists(`p_${col}_hit`)) A.create({ key: `p_${col}_hit`, frames: [f('hit')], frameRate: 1, repeat: -1 });
      if (!A.exists(`p_${col}_menu`)) A.create({ key: `p_${col}_menu`, frames: [f('idle'), f('idle'), f('front'), f('idle')], frameRate: 2, repeat: -1 });
    }
  };

  // Placa de palabra (caja abierta / resuelta) o tarjeta de respuesta.
  M.ESTILO_PLACA = {
    abierta: { fondo: 0xFFF4DE, borde: 0xC2571A, texto: '#5A2A0A' },
    resuelta: { fondo: 0xDDF6D6, borde: 0x2E8B3E, texto: '#1C5A27' },
    tarjeta: { fondo: 0xFFFFFF, borde: 0x2D6CDF, texto: '#1D2B53' },
    usada: { fondo: 0xE6E9EF, borde: 0x9AA4B5, texto: '#6B7488' },
  };
  // Iconos de las respuestas (Twemoji): clave de textura si está cargado, o null.
  M.claveIcono = txt => 'ico_' + String(txt).trim().toLowerCase();
  M.rutaIcono = txt => (CAJAS.iconos || {})[String(txt).trim().toLowerCase()] || null;
  M.icono = (scene, txt) => (scene.textures.exists(M.claveIcono(txt)) ? M.claveIcono(txt) : null);

  // Tarjeta de respuesta: dibujo a la izquierda (si lo hay) y la palabra.
  M.crearTarjeta = function (scene, texto) {
    const ico = M.icono(scene, texto);
    const w = ico ? 224 : 180, h = ico ? 64 : 54;
    const c = scene.add.container(0, 0);
    const brillo = scene.add.image(0, 0, 'm_brillo').setTint(0x9FD0FF).setAlpha(0.5).setScale(w / 95, 1.05);
    const g = scene.add.graphics();
    M.dibujarPlaca(g, w, h, 'tarjeta');
    c.add([brillo, g]);
    let tx = 0, max = w - 24;
    if (ico) {
      const im = scene.add.image(-w / 2 + 36, -2, ico);
      im.setScale(46 / Math.max(im.width, im.height));
      c.add(im);
      tx = 30; max = w - 92;
    }
    const t = M.texto(scene, tx, -2, texto, { size: 27, color: M.ESTILO_PLACA.tarjeta.texto, max });
    c.add(t);
    return { c, g, t, w, h };
  };

  M.dibujarPlaca = function (g, w, h, estilo) {
    const e = M.ESTILO_PLACA[estilo];
    g.clear();
    g.fillStyle(0x000000, 0.2); g.fillRoundedRect(-w / 2 + 2, -h / 2 + 6, w, h, 14);
    g.fillStyle(e.borde, 1); g.fillRoundedRect(-w / 2, -h / 2, w, h, 14);
    g.fillStyle(e.fondo, 1); g.fillRoundedRect(-w / 2 + 4, -h / 2 + 4, w - 8, h - 9, 11);
    g.fillStyle(0xFFFFFF, 0.6); g.fillRoundedRect(-w / 2 + 10, -h / 2 + 7, w - 20, 6, 3);
  };
})();
