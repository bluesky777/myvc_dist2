// Cajas de Palabras — escena del nivel: mapa, jugador, cajas, respuestas, enemigos, peligros.
(function () {
  'use strict';
  const M = CAJAS.M;
  const T = 64;
  const ESCALA_J = 0.6;
  const CUERPO_J = { w: 54, h: 80 }; // en px del marco de 128 (×0,6 en el mundo = 32×48)

  const acercar = (v, obj, paso) => (v < obj ? Math.min(v + paso, obj) : Math.max(v - paso, obj));
  const choca = (a, b) => a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;

  class Nivel extends Phaser.Scene {
    constructor() { super('Nivel'); }

    init(data) {
      this.datos = data || {};
      this.mundo = CAJAS.mundos.find(m => m.id === this.datos.mundo) || M.mundos()[0];
      this.nIdx = this.datos.nivel || 0;
      const base = this.mundo._niveles[this.nIdx];
      this.p = base; // las R se ignoran (vacío)
      this.def = this.mundo.niveles[this.nIdx];
      this.fis = this.mundo._fis;
      this.vidas = 3;
      this.abierta = -1;
      this.fin = false;
      this.bloqueo = false;
      this.invulHasta = 0;
      this.golpeHasta = 0;
      this.aturdido = 0;
      this.coyote = 0;
      this.buffer = 0;
      this.saltando = false;
      this.cortado = false;
      this.saltoPrev = false;
      this.brazadaCd = 0;
      this.bajarHasta = 0;
      this.vyPrev = 0;
      this.enSueloPrev = true;
      this.color = M.estado.personaje;
      this.enemigos = [];
      this.cascadas = [];
      this.subida = this.mundo.modo === 'subida';
      this.jetpack = false;
      this.ataqueCd = 0;
      this.ataqueHasta = 0;
      this.dashHasta = 0;
      this.dashListo = 0;
      this.dashAire = true;
      this.rotos = new Set();
      this.corazonesItem = [];
      // la escena se reutiliza: nada del nivel anterior debe sobrevivir
      Object.assign(this, {
        capaComp: null, capaRomp: null, compuertas: [], tarjetas: [], decoRomp: {}, mochila: null, jetItem: null, meta: null,
        libro: null, libroRevelado: false, opcionesDe: -1, offY: 0, dashActivo: false, cacheIda: null, cacheVuelta: null,
        empujando: false, avisoTramo: -1, tramo: 0, ultimaComp: -1, fxLlama: null, fxTrozos: null, fxBurbujas: null, enCascada: false,
      });
    }

    preload() {
      if (this.subida) this.cargarSubida();
      // sólo los dibujos de las respuestas de este nivel
      for (const cj of this.p.cajas) {
        const ruta = M.rutaIcono(cj.respuesta), k = M.claveIcono(cj.respuesta);
        if (ruta && !this.textures.exists(k)) this.load.image(k, ruta);
      }
    }

    create() {
      const p = this.p;
      this.anchoPx = p.W * T;
      this.altoPx = p.H * T;
      const cam = this.cameras.main;
      cam.setBackgroundColor(this.mundo.colorCielo || '#BFE6FF');
      cam.setBounds(0, 0, this.anchoPx, this.altoPx);
      cam.setRoundPixels(true);
      if (!this.mundo._texturas) {
        this.mundo._texturas = true;
        try {
          if (typeof this.mundo.texturas === 'function') this.mundo.texturas(this);
        } catch (e) {
          console.warn('[cajas] texturas() de', this.mundo.id, 'falló; sus enemigos propios se omiten:', e);
        }
      }
      try {
        if (typeof this.mundo.fondo === 'function') this.mundo.fondo(this, this.anchoPx, this.altoPx);
      } catch (e) {
        console.warn('[cajas] fondo() de', this.mundo.id, 'falló; se usa el color del cielo:', e);
      }
      const W = this.physics.world;
      W.gravity.y = this.fis.gravedad;
      W.TILE_BIAS = 40;
      W.setBounds(0, 0, this.anchoPx, this.altoPx + 800);
      W.setBoundsCollision(true, true, true, false);

      this.crearMapa();
      if (this.subida) this.crearSubida();
      this.crearRompibles();
      this.crearCascadas();
      this.crearTarjetas();
      this.crearCajas();
      this.crearLibro();
      this.crearParticulas();
      this.crearJugador();
      this.crearPincel();
      this.crearEnemigos();

      const K = Phaser.Input.Keyboard.KeyCodes;
      this.teclas = this.input.keyboard.addKeys({
        izq: K.LEFT, der: K.RIGHT, arr: K.UP, abj: K.DOWN, a: K.A, d: K.D, w: K.W, s: K.S, esp: K.SPACE, x: K.X, j: K.J, shift: K.SHIFT, k: K.K,
      });
      M.tactil = { izq: false, der: false, salto: false };

      cam.startFollow(this.spr, true, 0.12, 0.12, 0, 0);
      cam.setDeadzone(140, 110);
      cam.fadeIn(400, 20, 33, 61);

      this.scene.launch('HUD', { nivel: this });
      this.events.once('shutdown', () => { this.scene.stop('HUD'); });
      M.actual = this;
    }

    hud() {
      const h = this.scene.get('HUD');
      return h && h.listo ? h : null;
    }
    aviso(txt, tipo) { const h = this.hud(); if (h) h.aviso(txt, tipo); }

    // ---------- mapa ----------
    crearMapa() {
      const p = this.p, t = this.mundo.terreno || 'grass';
      const tex = this.textures.get('tiles');
      const cols = Math.floor((tex.source[0].width + 1) / 65);
      const idx = n => {
        const f = tex.has(n) ? tex.get(n) : tex.get(`terrain_${t}_block_center`);
        return Math.round(f.cutX / 65) + Math.round(f.cutY / 65) * cols;
      };
      const map = this.make.tilemap({ tileWidth: T, tileHeight: T, width: p.W, height: p.H });
      const ts = map.addTilesetImage('tiles', 'tiles_ext', T, T, 1, 2, 0);
      this.mapaT = map; this.tsT = ts; this.idxT = idx;
      this.capaSolida = map.createBlankLayer('solidos', ts, 0, 0).setDepth(0);
      this.capaPlat = map.createBlankLayer('plataformas', ts, 0, 0).setDepth(0);
      this.capaDeco = map.createBlankLayer('deco', ts, 0, 0).setDepth(1);
      this.capaAgua = map.createBlankLayer('agua', ts, 0, 0).setDepth(12).setAlpha(0.88);
      const S = (r, c) => (r >= p.H ? true : M.solido(p, r, c));
      const conecta = (r, c) => { const k = M.celda(p, r, c); return k === '#' || k === '='; };
      for (let r = 0; r < p.H; r++) {
        for (let c = 0; c < p.W; c++) {
          const k = p.g[r][c];
          if (k === '#') {
            const up = S(r - 1, c), dn = S(r + 1, c), lf = S(r, c - 1), rt = S(r, c + 1);
            let n;
            if (!up) {
              if (!dn) n = lf && rt ? 'horizontal_middle' : rt ? 'horizontal_left' : lf ? 'horizontal_right' : 'block';
              else n = lf && rt ? 'block_top' : rt ? 'block_top_left' : lf ? 'block_top_right' : 'vertical_top';
            } else if (!dn) n = lf && rt ? 'block_bottom' : rt ? 'block_bottom_left' : lf ? 'block_bottom_right' : 'vertical_bottom';
            else n = lf && rt ? 'block_center' : rt ? 'block_left' : lf ? 'block_right' : 'vertical_middle';
            this.capaSolida.putTileAt(idx(`terrain_${t}_${n}`), c, r);
          } else if (k === '=') {
            const lf = conecta(r, c - 1) && c > 0, rt = conecta(r, c + 1) && c < p.W - 1;
            const n = lf && rt ? 'horizontal_middle' : rt ? 'horizontal_left' : lf ? 'horizontal_right' : 'cloud';
            this.capaPlat.putTileAt(idx(`terrain_${t}_${n}`), c, r);
          } else if (k === '^') {
            this.capaDeco.putTileAt(idx('spikes'), c, r);
          }
          if (M.esAgua(p, r, c)) this.capaAgua.putTileAt(idx(M.esAgua(p, r - 1, c) ? 'water' : 'water_top'), c, r);
        }
      }
      this.capaSolida.setCollisionByExclusion([-1]);
      this.capaPlat.setCollisionByExclusion([-1]);
      this.capaPlat.forEachTile(tl => { if (tl.index >= 0) tl.setCollision(false, false, true, false, false); });
      if (this.capaAgua.layer.data.some(f => f.some(tl => tl.index >= 0))) {
        this.tweens.add({ targets: this.capaAgua, y: 3, duration: 1100, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
      }
      // decoración ligera sobre el césped, lejos de todo lo importante
      const deco = { grass: ['grass', 'bush', 'grass', 'mushroom_red'], dirt: ['rock', 'mushroom_brown', 'grass'], sand: ['cactus', 'rock'],
        snow: ['rock', 'snow'], stone: ['rock'], purple: ['grass_purple', 'mushroom_red'] }[t] || ['grass'];
      const rnd = M.semilla('deco:' + this.mundo.id + ':' + this.nIdx);
      const libre = k => k === '.';
      const importante = new Set(['P', 'C', 'R', 'L', '|', '^', '~']);
      for (let r = 1; r < p.H; r++) {
        for (let c = 1; c < p.W - 1; c++) {
          if (p.g[r][c] !== '#' || !libre(p.g[r - 1][c]) || rnd() > 0.11) continue;
          let ok = true;
          for (let dc = -2; dc <= 2 && ok; dc++) for (let dr = -2; dr <= 0 && ok; dr++) {
            const k = M.celda(p, r - 1 + dr, c + dc);
            if (importante.has(k) || (k >= 'a' && k <= 'z')) ok = false;
          }
          if (!ok) continue;
          this.add.image(c * T + 32, r * T + 2, 'tiles', deco[Math.floor(rnd() * deco.length)]).setOrigin(0.5, 1).setDepth(1).setScale(0.8);
        }
      }
    }

    crearCascadas() {
      const p = this.p;
      for (let c = 0; c < p.W; c++) {
        let r = 0;
        while (r < p.H) {
          if (p.g[r][c] !== '|') { r++; continue; }
          const r0 = r;
          while (r < p.H && p.g[r][c] === '|') r++;
          const h = (r - r0) * T;
          const ts = this.add.tileSprite(c * T + 32, r0 * T + h / 2, T, h, 'm_cascada').setDepth(3).setAlpha(0.92);
          this.cascadas.push(ts);
          const em = this.add.particles(c * T + 32, r * T - 6, 'm_polvo', {
            speedX: { min: -70, max: 70 }, speedY: { min: -170, max: -60 }, gravityY: 420, lifespan: 650,
            scale: { start: 0.9, end: 0.1 }, alpha: { start: 0.9, end: 0 }, frequency: 70, quantity: 2, tint: [0xFFFFFF, 0xD8F6FF],
          }).setDepth(4);
          this.cascadas.push(em);
        }
      }
    }

    // ---------- respuestas repartidas por el mundo ----------
    crearTarjetas() {
      const p = this.p;
      if (this.subida) { this.tarjetas = []; return; }
      this.alc = M.alcance(p, this.mundo._fisBase || this.fis, this.nIdx);
      this.candidatos = M.candidatosRespuesta(p, this.mundo, this.alc);
      if (this.candidatos.length < 8) console.warn(`[cajas] ${this.mundo.id} nivel ${this.nIdx + 1}: sólo ${this.candidatos.length} sitios para respuestas`);
      this.rndSitios = Math.random;
      const rnd = M.semilla('tarjetas:' + this.mundo.id + ':' + this.nIdx);
      const orden = M.barajar(p.cajas.map((cj, i) => i), rnd);
      this.tarjetas = orden.map(ci => {
        const { c, g: gg, t: tt, w, h } = M.crearTarjeta(this, p.cajas[ci].respuesta);
        c.setDepth(6).setVisible(false);
        return { caja: ci, texto: p.cajas[ci].respuesta, c, g: gg, t: tt, w, h, y0: 0, usada: false, tocando: false, visible: false, dur: 1000 + rnd() * 500 };
      });
    }

    // Cada respuesta sin resolver aparece en un sitio al azar (nuevo cada vez que se abre una caja).
    mostrarTarjetas() {
      const vis = this.tarjetas.filter(t => !t.usada);
      const b = this.cuerpo.body;
      const jug = { c: Math.floor(b.center.x / T), r: Math.floor((b.bottom - 4) / T) };
      const cj = this.cajas[this.abierta];
      const evitar = [jug, ...(cj ? [{ r: cj.r, c: cj.c }] : [])];
      // sólo sitios a los que se llega desde la caja abierta y desde los que se vuelve a las cajas pendientes
      let cands = this.candidatos;
      if (!this.alc.nadar && cj) {
        const ck = cj.c + ',' + cj.r;
        this.cacheIda = this.cacheIda || {};
        this.cacheVuelta = this.cacheVuelta || {};
        const ida = this.cacheIda[ck] = this.cacheIda[ck] || this.alc.desde(ck);
        const pend = this.cajas.filter(x => x.estado !== 'resuelta' && x !== cj).map(x => x.c + ',' + x.r);
        const vuelta = pend.map(k => (this.cacheVuelta[k] = this.cacheVuelta[k] || this.alc.hacia(k)));
        const sk = s => s.c + ',' + s.r;
        const conIda = cands.filter(s => ida.has(sk(s)));
        const todo = conIda.filter(s => vuelta.every(v => v.has(sk(s))));
        cands = todo.length >= vis.length * 3 ? todo : conIda.length >= vis.length ? conIda : cands;
      }
      const sitios = M.elegirSitios(cands, vis.length, evitar, jug, this.rndSitios);
      this.sitios = sitios;
      vis.forEach((t, k) => {
        const s = sitios[k % Math.max(1, sitios.length)];
        if (!s) return;
        const x = s.c * T + 32;
        const y = this.fis.nadar ? s.r * T + 32 : (s.r + 1) * T - 42;
        this.tweens.killTweensOf(t.c);
        t.visible = true; t.tocando = false; t.y0 = y; t.sitio = s;
        t.c.setPosition(x, y).setVisible(true).setScale(0).setAlpha(1);
        this.tweens.add({ targets: t.c, scale: 1, duration: 320, delay: 80 + k * 60, ease: 'Back.out' });
        t.bob = this.tweens.add({ targets: t.c, y: y - 6, duration: t.dur, yoyo: true, repeat: -1, ease: 'Sine.inOut', delay: 420 + k * 60 });
        this.time.delayedCall(80 + k * 60, () => { this.fxChispa.explode(10, x, y); });
      });
    }

    ocultarTarjetas(salvo) {
      this.opcionesDe = -1;
      for (const t of this.tarjetas) {
        if (!t.visible) continue;
        t.visible = false;
        if (t === salvo) continue;
        this.tweens.killTweensOf(t.c);
        this.fxPolvo.explode(4, t.c.x, t.c.y);
        this.tweens.add({ targets: t.c, scale: 0, alpha: 0, duration: 200, ease: 'Back.in', onComplete: () => t.c.setVisible(false) });
      }
    }

    // ---------- cajas ----------
    crearCajas() {
      this.cajas = this.p.cajas.map((cj, i) => {
        const x = cj.c * T + 32, y = cj.r * T + 32;
        const brillo = this.add.image(x, y, 'm_brillo').setDepth(4).setTint(0xFFE27A).setAlpha(0.35).setScale(0.9);
        this.tweens.add({ targets: brillo, alpha: 0.12, scale: 0.75, duration: 900, yoyo: true, repeat: -1, ease: 'Sine.inOut', delay: i * 130 });
        const spr = this.add.image(x, y, 'tiles', 'block_exclamation').setDepth(5);
        const badge = this.add.container(x + 24, y - 25).setDepth(6);
        const bg = this.add.graphics();
        bg.fillStyle(0x24386E, 1); bg.fillCircle(0, 0, 14); bg.fillStyle(0xFFFFFF, 1); bg.fillCircle(0, 0, 11);
        badge.add([bg, M.texto(this, 0, -1, String(i + 1), { size: 17, color: '#24386E' })]);
        const placa = this.add.container(x, y - 4).setDepth(7).setVisible(false);
        if (cj.oculta) { spr.setVisible(false); brillo.setVisible(false); badge.setVisible(false); }
        return { i, r: cj.r, c: cj.c, tramo: cj.tramo, oculta: !!cj.oculta, x, y, palabra: cj.palabra, respuesta: cj.respuesta, estado: 'cerrada', spr, brillo, badge, placa, tocando: false };
      });
    }

    pintarPlaca(cj, estilo) {
      const pl = cj.placa;
      pl.removeAll(true);
      const g = this.add.graphics();
      const t = M.texto(this, 0, -2, cj.palabra, { size: 28, color: M.ESTILO_PLACA[estilo].texto });
      const conCheck = estilo === 'resuelta';
      const w = Math.max(110, Math.min(340, t.width + 44 + (conCheck ? 30 : 0))), h = 54;
      if (t.width > w - 44 - (conCheck ? 30 : 0)) t.setScale((w - 44 - (conCheck ? 30 : 0)) / t.width);
      if (conCheck) t.x = -14;
      M.dibujarPlaca(g, w, h, estilo);
      pl.add([g, t]);
      const num = this.add.container(-w / 2 + 6, -h / 2 + 2);
      const ng = this.add.graphics();
      ng.fillStyle(M.ESTILO_PLACA[estilo].borde, 1); ng.fillCircle(0, 0, 13); ng.fillStyle(0xFFFFFF, 1); ng.fillCircle(0, 0, 10);
      num.add([ng, M.texto(this, 0, -1, String(cj.i + 1), { size: 15, color: M.hex(M.ESTILO_PLACA[estilo].borde) })]);
      pl.add(num);
      if (conCheck) pl.add(this.add.image(w / 2 - 26, -2, 'm_check').setScale(0.8));
      cj.placaW = w;
    }

    abrirCaja(i) {
      const cj = this.cajas[i];
      if (!cj || cj.estado !== 'cerrada') return;
      cj.estado = 'abierta';
      this.abierta = i;
      M.sonar(this, 'sfx_magic');
      this.tweens.killTweensOf([cj.spr, cj.placa]);
      cj.brillo.setVisible(false);
      cj.badge.setVisible(false);
      this.tweens.add({
        targets: cj.spr, y: cj.y - 16, duration: 110, yoyo: true, ease: 'Quad.out',
        onComplete: () => {
          this.tweens.add({
            targets: cj.spr, scaleX: 0, duration: 110, onComplete: () => {
              cj.spr.setVisible(false).setScale(1);
              if (cj.estado !== 'abierta') return;
              this.pintarPlaca(cj, 'abierta');
              cj.placa.setVisible(true).setScale(0.2);
              this.tweens.add({ targets: cj.placa, scale: 1, duration: 320, ease: 'Back.out' });
              cj.pulso = this.tweens.add({ targets: cj.placa, scale: 1.05, duration: 700, yoyo: true, repeat: -1, ease: 'Sine.inOut', delay: 320 });
            },
          });
        },
      });
      this.fxChispa.explode(16, cj.x, cj.y - 10);
      if (this.subida) this.aviso(`«${cj.palabra}»: sube hasta la compuerta`, 'info');
      else {
        this.mostrarTarjetas();
        this.aviso(`Caja ${i + 1}: «${cj.palabra}». ¡Busca su respuesta!`, 'info');
      }
    }

    cerrarCaja(i) {
      const cj = this.cajas[i];
      if (!cj || cj.estado !== 'abierta') return;
      cj.estado = 'cerrada';
      if (this.abierta === i) this.abierta = -1;
      this.ocultarTarjetas();
      this.tweens.killTweensOf([cj.spr, cj.placa]);
      cj.placa.setVisible(false).setScale(1);
      cj.spr.setVisible(true).setScale(1).setPosition(cj.x, cj.y);
      cj.brillo.setVisible(true);
      cj.badge.setVisible(true);
      cj.tocando = true; // no se reabre sola si el jugador sigue encima
    }

    resolverCaja(i) {
      const cj = this.cajas[i];
      cj.estado = 'resuelta';
      if (this.abierta === i) this.abierta = -1;
      this.tweens.killTweensOf([cj.spr, cj.placa]);
      cj.spr.setVisible(false);
      cj.brillo.setVisible(false);
      cj.badge.setVisible(false);
      this.pintarPlaca(cj, 'resuelta');
      cj.placa.setVisible(true).setScale(1.3);
      this.tweens.add({ targets: cj.placa, scale: 1, duration: 380, ease: 'Back.out' });
      this.fxConfeti.explode(24, cj.x, cj.y - 20);
    }

    // ---------- libro ----------
    crearLibro() {
      const L = this.p.libro;
      this.libro = null;
      if (!L) return;
      if (L.oculto && !this.libroRevelado) return;
      if (M.estado.librosTomados[M.clave(this.mundo, this.nIdx)]) return;
      const x = L.c * T + 32, y = L.r * T + 32;
      const brillo = this.add.image(x, y, 'm_brillo').setDepth(5).setTint(0xC9A2FF).setAlpha(0.6);
      this.tweens.add({ targets: brillo, scale: 0.8, alpha: 0.3, duration: 800, yoyo: true, repeat: -1 });
      const spr = this.add.image(x, y, 'm_libro').setDepth(6);
      this.tweens.add({ targets: [spr], y: y - 8, angle: { from: -4, to: 4 }, duration: 900, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
      const chispas = this.add.particles(x, y, 'm_chispa', {
        x: { min: -30, max: 30 }, y: { min: -30, max: 30 }, lifespan: 700, scale: { start: 0.6, end: 0 }, frequency: 260,
        tint: [0xFFFFFF, 0xE6D2FF, 0xFFE27A], speedY: { min: -30, max: -10 },
      }).setDepth(6);
      this.libro = { x, y, spr, brillo, chispas };
    }

    tomarLibro() {
      const L = this.libro;
      this.libro = null;
      M.sonar(this, 'sfx_coin');
      L.chispas.destroy();
      this.tweens.killTweensOf([L.spr, L.brillo]);
      this.tweens.add({ targets: [L.spr, L.brillo], y: L.y - 70, alpha: 0, scale: 1.4, duration: 450, onComplete: () => { L.spr.destroy(); L.brillo.destroy(); } });
      this.fxChispa.explode(14, L.x, L.y);
      M.estado.librosTomados[M.clave(this.mundo, this.nIdx)] = true;
      M.estado.libros = (M.estado.libros || 0) + 1;
      const h = this.hud();
      if (M.estado.libros >= 3) {
        M.estado.libros = 0;
        this.vidas = Math.min(M.MAX_VIDAS, this.vidas + 1);
        M.sonar(this, 'sfx_jump-high');
        if (h) h.libroGrande();
      } else {
        this.aviso(`¡Un libro! Llevas ${M.estado.libros} de 3`, 'libro');
      }
      M.guardar();
    }

    // ---------- partículas ----------
    crearParticulas() {
      const polvo = { snow: 0xFFFFFF, sand: 0xF3DFA8, purple: 0xE3D2FF }[this.mundo.terreno] || 0xEFE3CC;
      this.fxPolvo = this.add.particles(0, 0, 'm_polvo', {
        emitting: false, lifespan: 420, speed: { min: 30, max: 110 }, angle: { min: 200, max: 340 },
        scale: { start: 0.8, end: 0 }, alpha: { start: 0.8, end: 0 }, gravityY: -60, tint: polvo,
      }).setDepth(11);
      this.fxChispa = this.add.particles(0, 0, 'm_chispa', {
        emitting: false, lifespan: 750, speed: { min: 120, max: 330 }, scale: { start: 1, end: 0 }, rotate: { min: 0, max: 360 },
        tint: [0xFFE066, 0xFFFFFF, 0x8FE3FF, 0xB9F28C], gravityY: 260,
      }).setDepth(13);
      this.fxConfeti = this.add.particles(0, 0, 'm_confeti', {
        emitting: false, lifespan: 1300, speed: { min: 160, max: 420 }, angle: { min: 210, max: 330 }, rotate: { min: 0, max: 360 },
        scale: { start: 1, end: 0.6 }, gravityY: 620, tint: [0xFF5A6E, 0xFFC23D, 0x5BC453, 0x4D9BE6, 0x9B6BDF],
      }).setDepth(13);
      this.fxPintura = this.add.particles(0, 0, 'm_confeti', {
        emitting: false, lifespan: 1000, speed: { min: 140, max: 360 }, rotate: { min: 0, max: 360 },
        scale: { start: 1, end: 0.4 }, gravityY: 520, tint: [M.PINTURA.base, M.PINTURA.clara, M.PINTURA.oscura],
      }).setDepth(13);
      if (this.fis.nadar) {
        this.fxBurbujas = this.add.particles(0, 0, 'peces', {
          frame: ['bubble_a', 'bubble_b', 'bubble_c'], emitting: false, lifespan: 1500, speedY: { min: -110, max: -50 },
          speedX: { min: -25, max: 25 }, scale: { start: 0.55, end: 0.2 }, alpha: { start: 0.95, end: 0 },
        }).setDepth(11);
      }
    }

    // ---------- jugador ----------
    crearJugador() {
      const P = this.p.P;
      this.cuerpo = this.add.zone(P.c * T + 32, (P.r + 1) * T - 24, CUERPO_J.w * ESCALA_J, CUERPO_J.h * ESCALA_J);
      this.physics.add.existing(this.cuerpo);
      const b = this.cuerpo.body;
      b.setCollideWorldBounds(true);
      b.setMaxVelocity(2000, this.fis.nadar ? 280 : 1000);
      this.physics.add.collider(this.cuerpo, this.capaSolida);
      this.physics.add.collider(this.cuerpo, this.capaPlat, null, (o, tl) => this.unaVia(o.body, tl, true));
      if (this.capaComp) this.physics.add.collider(this.cuerpo, this.capaComp);
      if (this.capaRomp) this.physics.add.collider(this.cuerpo, this.capaRomp);
      this.spr = this.add.sprite(this.cuerpo.x, b.bottom, 'personajes', `character_${this.color}_idle`)
        .setOrigin(0.5, 126 / 128).setScale(ESCALA_J).setDepth(10);
      this.spr.play(`p_${this.color}_idle`);
      this.seguro = { x: this.cuerpo.x, y: this.cuerpo.y };
    }

    unaVia(b, tl, esJugador) {
      if (esJugador && this.time.now < this.bajarHasta) return false;
      return b.velocity.y >= 0 && b.prev.y + b.height <= tl.pixelY + 12;
    }

    colocar(x, pieY) {
      const b = this.cuerpo.body;
      b.reset(x, pieY - b.height / 2 - 1);
      b.setVelocity(0, 0);
      this.cuerpo.setPosition(x, pieY - b.height / 2 - 1);
      this.spr.setPosition(x, pieY);
    }

    leerEntrada() {
      const k = this.teclas, t = M.tactil || {};
      this.izq = k.izq.isDown || k.a.isDown || !!t.izq;
      this.der = k.der.isDown || k.d.isDown || !!t.der;
      this.abajo = k.abj.isDown || k.s.isDown;
      const s = k.esp.isDown || k.arr.isDown || k.w.isDown || !!t.salto;
      this.saltoDown = (s && !this.saltoPrev) || !!M.pulsoSalto;
      if (M.pulsoSalto && !s) this.toqueHasta = this.time.now + 700; // toque corto: salto completo, sin cortarlo
      M.pulsoSalto = false;
      this.saltoHeld = s;
      this.saltoPrev = s;
      const at = k.x.isDown || k.j.isDown || !!t.pincel;
      this.ataqueDown = (at && !this.ataquePrev) || !!M.pulsoPincel;
      this.ataquePrev = at;
      M.pulsoPincel = false;
      const ds = k.shift.isDown || k.k.isDown || !!t.barrido;
      this.dashDown = (ds && !this.dashPrev) || !!M.pulsoBarrido;
      this.dashPrev = ds;
      M.pulsoBarrido = false;
    }

    moverJugador(dt) {
      const b = this.cuerpo.body, f = this.fis;
      const enSuelo = b.blocked.down || b.touching.down;
      if (enSuelo) this.dashAire = true;
      if (this.dashActivo && this.time.now >= this.dashHasta) this.finBarrido();
      if (this.dashDown) this.barrer();
      if (this.time.now < this.dashHasta) { this.actualizarBarrido(dt); return; }
      let dir = (this.der ? 1 : 0) - (this.izq ? 1 : 0);
      if (this.aturdido > 0) { this.aturdido -= dt; dir = 0; }
      const obj = dir * f.velocidad;
      let vx = b.velocity.x;
      let a = dir !== 0 ? (vx !== 0 && Math.sign(vx) !== dir ? Math.max(f.aceleracion, f.frenado) : f.aceleracion) : f.frenado;
      if (this.aturdido > 0) a = 500;
      a *= enSuelo ? 1 : (f.nadar ? 0.9 : 0.8);
      if (Math.abs(vx) > f.velocidad && dir === Math.sign(vx)) a = f.frenado; // tras un empujón
      vx = acercar(vx, obj, a * dt);
      b.setVelocityX(vx);

      if (!f.nadar) {
        this.coyote = enSuelo ? 0.12 : this.coyote - dt;
        this.buffer = this.saltoDown ? 0.15 : this.buffer - dt;
        if (enSuelo && this.abajo && this.saltoDown && this.sobrePlataforma()) {
          this.bajarHasta = this.time.now + 260; this.buffer = 0;
        } else if (this.buffer > 0 && this.coyote > 0 && this.aturdido <= 0) {
          b.setVelocityY(-f.salto);
          this.coyote = 0; this.buffer = 0; this.saltando = true; this.cortado = this.time.now < (this.toqueHasta || 0);
          M.sonar(this, 'sfx_jump');
          this.fxPolvo.explode(5, b.center.x, b.bottom);
          this.tweens.add({ targets: this.spr, scaleX: ESCALA_J * 0.85, scaleY: ESCALA_J * 1.15, duration: 90, yoyo: true });
        }
        if (this.saltando && !this.saltoHeld && !this.cortado && b.velocity.y < -120) { b.velocity.y *= 0.5; this.cortado = true; }
        if (enSuelo && b.velocity.y >= 0) this.saltando = false;
        if (this.jetpack) this.volar(dt, enSuelo);
      } else {
        this.brazadaCd -= dt;
        if ((this.saltoHeld || this.saltoDown) && this.brazadaCd <= 0 && (this.saltoDown || this.brazadaCd <= -0.12) && this.aturdido <= 0) {
          b.setVelocityY(Math.min(b.velocity.y * 0.3, 0) - f.salto);
          this.brazadaCd = 0.3;
          M.sonar(this, 'sfx_jump', { volume: 0.14, rate: 1.3 });
          if (this.fxBurbujas) this.fxBurbujas.explode(4, b.center.x, b.bottom - 6);
          this.tweens.add({ targets: this.spr, scaleX: ESCALA_J * 0.9, scaleY: ESCALA_J * 1.1, duration: 110, yoyo: true });
        }
        if (this.abajo) b.velocity.y += 700 * dt;
        b.velocity.y *= Math.pow(0.55, dt); // arrastre del agua
        this.tBurbuja = (this.tBurbuja || 0) - dt;
        if (this.tBurbuja <= 0 && this.fxBurbujas) { this.fxBurbujas.explode(1, b.center.x + (this.spr.flipX ? -8 : 8), b.y + 6); this.tBurbuja = 0.7; }
      }
      if (this.enCascada) {
        if (b.velocity.y < 0) b.velocity.y *= Math.pow(0.03, dt);
        b.velocity.y = Math.min(b.velocity.y + 1500 * dt, 560);
      }

      // animación
      const col = this.color;
      let an;
      if (this.time.now < this.golpeHasta) an = 'hit';
      else if (this.time.now < this.ataqueHasta) an = 'jump';
      else if (!enSuelo) an = f.nadar ? 'swim' : 'jump';
      else if (Math.abs(vx) > 30 && dir !== 0) an = 'walk';
      else if (Math.abs(vx) > 60) an = 'walk';
      else an = 'idle';
      const key = `p_${col}_${an}`;
      if (this.spr.anims.getName() !== key) this.spr.play(key);
      if (an === 'walk') this.spr.anims.timeScale = Phaser.Math.Clamp(Math.abs(vx) / f.velocidad, 0.5, 1.3);
      if (dir !== 0 && this.aturdido <= 0) this.spr.setFlipX(dir < 0);
      // aterrizaje
      if (enSuelo && !this.enSueloPrev && this.vyPrev > 320) {
        this.fxPolvo.explode(7, b.center.x, b.bottom);
        this.tweens.add({ targets: this.spr, scaleX: ESCALA_J * 1.18, scaleY: ESCALA_J * 0.8, duration: 80, yoyo: true, ease: 'Quad.out' });
      }
      if (enSuelo && Math.abs(vx) > 40 && dir !== 0 && Math.sign(vx) !== dir) this.fxPolvo.explode(1, b.center.x, b.bottom);
      this.enSueloPrev = enSuelo;
      this.vyPrev = b.velocity.y;
      this.spr.setPosition(Math.round(b.center.x), Math.round(b.bottom + 1));
      // suelo seguro
      if (enSuelo && this.time.now > this.invulHasta - 1000) {
        const r = Math.floor((b.bottom + 4) / T);
        const c1 = Math.floor((b.left + 2) / T), c2 = Math.floor((b.right - 2) / T);
        const cm = Math.floor(b.center.x / T);
        const malo = cc => ['^', '~', '|'].includes(M.celda(this.p, r - 1, cc)) || M.esAgua(this.p, r, cc);
        if (M.apoyo(this.p, r, c1) && M.apoyo(this.p, r, c2) && !malo(c1 - 1) && !malo(cm) && !malo(c2 + 1)
          && !this.enemigos.some(e => Phaser.Math.Distance.Between(e.spr.x, e.spr.y, b.center.x, b.center.y) < 150)) {
          this.seguro = { x: b.center.x, y: b.bottom };
        }
      }
    }

    sobrePlataforma() {
      const b = this.cuerpo.body;
      const r = Math.floor((b.bottom + 4) / T);
      return M.celda(this.p, r, Math.floor(b.center.x / T)) === '=';
    }

    rectJ() { const b = this.cuerpo.body; return { x: b.x, y: b.y, w: b.width, h: b.height }; }

    revisarPeligros() {
      const b = this.cuerpo.body, p = this.p;
      const cm = Math.floor(b.center.x / T), rm = Math.floor(b.center.y / T);
      this.enCascada = M.celda(p, rm, cm) === '|' || M.celda(p, Math.floor((b.bottom - 6) / T), cm) === '|';
      if (b.y > (this.subida ? this.fondoCaida() : this.altoPx + 30)) { this.herir('caida'); return; }
      if (M.esAgua(p, rm, cm) || M.esAgua(p, Math.floor((b.bottom - 10) / T), cm)) { this.herir('agua'); return; }
      const rp = Math.floor((b.bottom - 4) / T);
      for (const cc of [Math.floor((b.left + 5) / T), Math.floor((b.right - 5) / T)]) {
        if (M.celda(p, rp, cc) === '^' && b.bottom > rp * T + 34) { this.herir('pinchos'); return; }
      }
      const rj = this.rectJ();
      for (const e of this.enemigos) {
        const eb = e.spr.body;
        if (choca(rj, { x: eb.x, y: eb.y, w: eb.width, h: eb.height })) { this.herir('enemigo', e.spr); return; }
      }
    }

    herir(tipo, fuente) {
      if (this.fin || this.bloqueo || this.time.now < this.invulHasta) return;
      if (this.time.now < this.dashHasta + 60 && (tipo === 'enemigo' || tipo === 'pinchos')) return;
      const b = this.cuerpo.body;
      this.vidas = Math.max(0, this.vidas - 1);
      this.invulHasta = this.time.now + 1500;
      this.golpeHasta = this.time.now + 450;
      M.sonar(this, 'sfx_hurt');
      this.cameras.main.shake(180, 0.006);
      const abierta = this.abierta;
      if (abierta >= 0) this.cerrarCaja(abierta);
      if (tipo === 'caida' || tipo === 'agua') {
        this.cameras.main.flash(200, 255, 255, 255);
        const sp = this.subida ? this.puntoSubida() : this.seguro;
        this.colocar(sp.x, sp.y);
      } else {
        const dx = fuente ? Math.sign(b.center.x - fuente.x) || 1 : (this.spr.flipX ? 1 : -1);
        const k = this.fis.nadar ? 0.6 : 1;
        b.setVelocity(dx * 330 * k, -380 * k);
        this.aturdido = 0.35;
      }
      this.parpadeo();
      if (this.vidas <= 0) {
        this.bloqueo = true;
        this.time.delayedCall(650, () => this.sinVidas());
      } else if (abierta >= 0) {
        // la caja se cerró: reaparece a su lado, sin selector
        this.bloqueo = true;
        this.time.delayedCall(380, () => {
          if (this.fin) return;
          const pos = this.ladoDeCaja(abierta);
          this.colocar(pos.x, pos.y);
          this.seguro = { x: pos.x, y: pos.y };
          this.aturdido = 0;
          this.bloqueo = false;
          this.invulHasta = this.time.now + 1500;
          this.parpadeo();
          this.cameras.main.flash(220, 255, 255, 255);
          this.spr.setFlipX(this.cajas[abierta].x < pos.x);
          this.aviso(`La caja ${abierta + 1} se cerró. ¡Ábrela otra vez!`, 'mal');
        });
      } else {
        this.aviso(tipo === 'caida' ? '¡Cuidado! Te caíste' : tipo === 'agua' ? '¡Al agua no!' : '¡Ay! Perdiste una vida', 'mal');
      }
    }

    parpadeo() {
      if (this.tParpadeo) this.tParpadeo.stop();
      this.spr.setAlpha(1);
      this.tParpadeo = this.tweens.add({
        targets: this.spr, alpha: 0.25, duration: 110, yoyo: true, repeat: 6, onComplete: () => this.spr.setAlpha(1),
      });
    }

    abrirSelector(prev) {
      const h = this.hud();
      if (!h) { this.bloqueo = false; return; }
      this.scene.pause();
      h.selector(prev);
    }

    // Lado libre con suelo junto a la caja n.
    ladoDeCaja(n) {
      const cj = this.cajas[n], p = this.p;
      const vacia = (r, c) => { const k = M.celda(p, r, c); return (!['#', '=', '~', '^', '|', 'C', 'G'].includes(k) || this.roto(r, c)) && !(M.esRompible(k) && !this.roto(r, c)) && !(k >= 'a' && k <= 'z'); };
      const hacia = cj.c > this.p.W / 2 ? [-1, 1] : [1, -1];
      for (const d of hacia) if (vacia(cj.r, cj.c + d) && M.apoyo(p, cj.r + 1, cj.c + d)) return { x: (cj.c + d) * T + 32, y: (cj.r + 1) * T };
      return { x: cj.x, y: (cj.r + 1) * T };
    }

    irACaja(n) {
      const pos = this.ladoDeCaja(n);
      this.colocar(pos.x, pos.y);
      this.seguro = { x: pos.x, y: pos.y };
      this.aturdido = 0;
      this.saltoPrev = true;
      this.bloqueo = false;
      this.scene.resume();
      this.invulHasta = this.time.now + 1500;
      this.parpadeo();
      const cam = this.cameras.main;
      cam.stopFollow();
      cam.centerOn(pos.x, pos.y - 40);
      cam.startFollow(this.spr, true, 0.12, 0.12);
      cam.fadeIn(300, 20, 33, 61);
      this.spr.setFlipX(this.cajas[n].x < pos.x);
      this.aviso(`Ve a la caja ${n + 1}`, 'info');
    }

    sinVidas() {
      this.fin = true;
      const h = this.hud();
      this.scene.pause();
      if (h) h.sinVidas(this.cajas.filter(c => c.estado === 'resuelta').length);
    }

    reiniciar() { this.scene.restart({ mundo: this.mundo.id, nivel: this.nIdx }); }
    salir() {
      this.scene.stop('HUD');
      this.scene.start('Menu');
    }
    irA(destino) {
      this.scene.stop('HUD');
      this.scene.start('Nivel', destino);
    }

    // ---------- cajas, tarjetas y libro ----------
    revisarCajas() {
      const rj = this.rectJ();
      for (const cj of this.cajas) {
        const toca = choca(rj, { x: cj.x - 36, y: cj.y - 36, w: 72, h: 72 });
        if (!toca) { cj.tocando = false; continue; }
        if (cj.tocando) continue;
        cj.tocando = true;
        if (cj.estado !== 'cerrada' || cj.oculta || this.bloqueo) continue;
        if (this.abierta >= 0) continue; // con una caja abierta, tocar otra no hace nada
        this.abrirCaja(cj.i);
      }
    }

    revisarTarjetas() {
      const rj = this.rectJ(), b = this.cuerpo.body;
      const quieto = this.subida || this.jetpack || Math.abs(b.velocity.y) < 300 || b.blocked.down;
      for (const t of this.tarjetas) {
        if (!t.visible) continue;
        const toca = choca(rj, { x: t.c.x - t.w / 2, y: t.c.y - t.h / 2, w: t.w, h: t.h });
        if (!toca) { t.tocando = false; continue; }
        if (t.tocando || t.usada || !t.visible || !quieto || this.bloqueo) continue;
        t.tocando = true;
        this.tocarTarjeta(t);
      }
    }

    tocarTarjeta(t) {
      if (this.abierta < 0) {
        M.sonar(this, 'sfx_bump', { volume: 0.2 });
        this.aviso('Primero abre una caja', 'info');
        return;
      }
      const cj = this.cajas[this.abierta];
      if (t.caja === cj.i) {
        t.usada = true;
        M.sonar(this, 'sfx_gem');
        this.time.delayedCall(140, () => M.sonar(this, 'sfx_coin', { volume: 0.25 }));
        this.tweens.killTweensOf(t.c);
        this.tweens.add({ targets: t.c, scale: 1.2, duration: 140, yoyo: true, hold: 220, onComplete: () => this.tweens.add({ targets: t.c, scale: 0, alpha: 0, duration: 220, onComplete: () => t.c.setVisible(false) }) });
        this.ocultarTarjetas(t);
        this.fxChispa.explode(20, t.c.x, t.c.y);
        this.fxConfeti.explode(18, t.c.x, t.c.y);
        this.resolverCaja(cj.i);
        this.aviso(`¡Bien! ${cj.palabra} = ${cj.respuesta}`, 'ok');
        if (this.subida) this.correctaSubida(cj);
        else if (this.cajas.every(c => c.estado === 'resuelta')) this.completar();
      } else {
        M.sonar(this, 'sfx_bump');
        const x0 = t.c.x;
        this.tweens.add({ targets: t.c, x: x0 + 9, duration: 45, yoyo: true, repeat: 3, ease: 'Sine.inOut', onComplete: () => t.c.setX(x0) });
        this.aviso('Esa no es', 'mal');
      }
    }

    revisarLibro() {
      if (!this.libro) return;
      if (choca(this.rectJ(), { x: this.libro.x - 30, y: this.libro.y - 30, w: 60, h: 60 })) this.tomarLibro();
    }

    completar() {
      if (this.fin) return;
      this.fin = true;
      const k = M.clave(this.mundo, this.nIdx);
      const est = this.vidas >= 3 ? 3 : this.vidas >= 2 ? 2 : 1;
      M.estado.hechos[k] = true;
      M.estado.estrellas[k] = Math.max(M.estado.estrellas[k] || 0, est);
      M.guardar();
      this.cuerpo.body.setVelocityX(0);
      this.time.delayedCall(900, () => {
        M.sonar(this, 'sfx_jump-high');
        const h = this.hud();
        this.scene.pause();
        if (h) h.completado({ estrellas: est, siguiente: this.siguiente() });
      });
    }

    siguiente() {
      const m = this.mundo;
      for (let i = this.nIdx + 1; i < m.niveles.length; i++) {
        if (m._niveles[i].valido) return { mundo: m.id, nivel: i, etiqueta: 'Siguiente nivel' };
      }
      const l = M.mundos();
      const j = l.indexOf(m);
      if (j >= 0 && j + 1 < l.length && M.mundoDesbloqueado(l[j + 1])) {
        const n = l[j + 1];
        const i = n._niveles.findIndex(x => x.valido);
        return { mundo: n.id, nivel: Math.max(0, i), etiqueta: 'Siguiente mundo' };
      }
      return null;
    }

    // ---------- enemigos ----------
    crearEnemigos() {
      const p = this.p, m = this.mundo;
      const rnd = M.semilla('enemigos:' + m.id + ':' + this.nIdx);
      for (const e of p.enemigos) {
        const d = m.enemigos && m.enemigos[e.ch];
        if (!d) { console.warn(`[cajas] ${m.id}: letra «${e.ch}» sin enemigo; se omite`); continue; }
        try {
          this.enemigos.push(this.crearEnemigo(d, e, rnd));
        } catch (err) {
          console.warn(`[cajas] ${m.id}: enemigo «${e.ch}» no se pudo crear:`, err);
        }
      }
    }

    crearEnemigo(d, e, rnd) {
      const m = this.mundo, sp = d.sprite || {};
      let frames = [];
      if (sp.atlas && this.textures.exists(sp.atlas)) {
        const tx = this.textures.get(sp.atlas);
        frames = (sp.frames || []).filter(f => tx.has(f)).map(f => ({ key: sp.atlas, frame: f }));
      } else if (sp.textura) {
        frames = sp.textura.filter(k => this.textures.exists(k)).map(k => ({ key: k }));
      }
      if (!frames.length) throw new Error('sin frames válidos');
      const comp = d.comportamiento || 'fijo';
      const esc = d.escala || 1;
      const suelo = ['patrulla', 'fijo', 'salta', 'desliza'].includes(comp);
      const x = e.c * T + 32, y = suelo ? (e.r + 1) * T : e.r * T + 32;
      const spr = this.add.sprite(x, y, frames[0].key, frames[0].frame).setScale(esc).setDepth(8).setOrigin(0.5, suelo ? 1 : 0.5);
      if (d.tinte != null) spr.setTint(d.tinte);
      if (frames.length > 1) {
        const ak = `en_${m.id}_${e.ch}`;
        if (!this.anims.exists(ak)) this.anims.create({ key: ak, frames, frameRate: Math.max(0.1, Number(sp.fps) || 4), repeat: -1 });
        spr.play({ key: ak, startFrame: Math.floor(rnd() * frames.length) });
      }
      this.physics.add.existing(spr);
      const body = spr.body;
      const fw = spr.frame.width, fh = spr.frame.height;
      const abajo = comp === 'patrulla' || comp === 'fijo';
      const bw = d.cuerpo ? d.cuerpo.w / esc : fw * 0.7, bh = d.cuerpo ? d.cuerpo.h / esc : fh * 0.62;
      body.setSize(bw, bh, false);
      body.setOffset((fw - bw) / 2, abajo ? fh - bh : (fh - bh) / 2);
      body.setAllowGravity(comp === 'patrulla');
      body.moves = comp === 'patrulla';
      const o = { spr, d, comp, x0: x, y0: y, vel: Number(d.velocidad) || 40, rango: d.rango == null ? 3 : Number(d.rango), t: rnd() * 6, dir: -1, ang: rnd() * 360, fase: 0, estado: 'ir', espera: 0 };
      if (comp === 'patrulla') {
        body.setCollideWorldBounds(true);
        body.setMaxVelocity(400, 900);
        this.physics.add.collider(spr, this.capaSolida);
        this.physics.add.collider(spr, this.capaPlat, null, (s, tl) => this.unaVia(s.body, tl, false));
        if (this.capaComp) this.physics.add.collider(spr, this.capaComp);
        if (this.capaRomp) this.physics.add.collider(spr, this.capaRomp);
      }
      if (comp === 'nada' || comp === 'desliza') {
        // hacia el lado con sitio libre
        const libres = sgn => { let n = 0; for (let k = 1; k <= Math.ceil(o.rango); k++) { if (M.solido(this.p, e.r, e.c + sgn * k)) break; n++; } return n; };
        const s = libres(1) >= libres(-1) ? 1 : -1;
        o.xa = x; o.xb = x + s * o.rango * T; o.dir = s;
      }
      if (comp === 'atrae') this.tweens.add({ targets: spr, scale: esc * 1.08, duration: 700, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
      if (comp === 'salta') o.t = rnd() * 3;
      return o;
    }

    actualizarEnemigos(dt) {
      const b = this.cuerpo.body;
      for (const e of this.enemigos) {
        const s = e.spr, bd = s.body;
        switch (e.comp) {
          case 'patrulla': {
            if (bd.blocked.left) e.dir = 1;
            else if (bd.blocked.right) e.dir = -1;
            else if (bd.blocked.down) {
              const fx = e.dir > 0 ? bd.right + 3 : bd.left - 3;
              const col = Math.floor(fx / T), row = Math.floor((bd.bottom + 4) / T);
              const delante = M.celda(this.p, row - 1, col);
              if (!M.apoyo(this.p, row, col) || delante === '^' || delante === '~' || M.esAgua(this.p, row, col)) e.dir *= -1;
            }
            bd.setVelocityX(e.dir * e.vel);
            s.setFlipX(e.dir > 0);
            break;
          }
          case 'nada': {
            const lo = Math.min(e.xa, e.xb), hi = Math.max(e.xa, e.xb);
            const nx = s.x + e.dir * e.vel * dt;
            s.x = nx;
            if (s.x >= hi) { s.x = hi; e.dir = -1; } else if (s.x <= lo) { s.x = lo; e.dir = 1; }
            s.setFlipX(e.dir > 0);
            break;
          }
          case 'flota': {
            e.t += dt;
            const A = e.rango > 0 ? (e.rango * T) / 2 : 6;
            const w = e.vel / A;
            s.y = e.y0 + Math.sin(e.t * w) * A;
            break;
          }
          case 'gira': {
            e.ang += e.vel * dt;
            s.angle = e.ang;
            if (e.rango > 0) {
              const a = Phaser.Math.DegToRad(e.ang);
              s.x = e.x0 + Math.cos(a) * e.rango * T;
              s.y = e.y0 + Math.sin(a) * e.rango * T;
            }
            break;
          }
          case 'atrae': {
            const R = e.rango * T;
            const dx = s.x - b.center.x, dy = s.y - b.center.y, dd = Math.hypot(dx, dy);
            if (dd < R && dd > 4 && !this.bloqueo && this.time.now > this.invulHasta) {
              const v = 50 + 110 * (1 - dd / R);
              b.x += (dx / dd) * v * dt;
              b.y += (dy / dd) * v * dt * 0.5;
            }
            break;
          }
          case 'salta': {
            e.t += dt;
            const per = 3.2, dur = 1.15;
            const ph = e.t % per;
            if (ph < dur) {
              if (e.fase === 0) { e.fase = 1; e.dirArc = -(e.dirArc || 1); }
              const q = ph / dur;
              const h = Math.max(1, e.rango) * T;
              s.y = e.y0 - h * Math.sin(Math.PI * q);
              s.x = e.x0 + (q - 0.5) * T * 1.2 * e.dirArc;
              s.setFlipX(e.dirArc > 0);
              s.angle = (q - 0.5) * 110 * (e.dirArc > 0 ? 1 : -1);
            } else {
              e.fase = 0;
              s.x = e.x0;
              s.y = e.y0 + Math.sin(e.t * 3) * 2;
              s.angle = 0;
            }
            break;
          }
          case 'desliza': {
            if (e.espera > 0) { e.espera -= dt; break; }
            const obj = e.estado === 'ir' ? e.xb : e.xa;
            const sg = Math.sign(obj - s.x);
            s.setFlipX(sg > 0);
            const nx = s.x + sg * Math.max(e.vel, 60) * dt;
            s.x = nx;
            if ((sg > 0 && s.x >= obj) || (sg < 0 && s.x <= obj) || sg === 0) {
              s.x = obj; e.espera = 1.5; e.estado = e.estado === 'ir' ? 'volver' : 'ir';
            }
            break;
          }
          case 'persigue': {
            const dx = b.center.x - s.x, dy = b.center.y - s.y, dd = Math.hypot(dx, dy);
            let tx = e.x0, ty = e.y0 + Math.sin((e.t += dt) * 2) * 10, v = e.vel * 0.6;
            if (dd < (e.d.rango != null ? e.rango : 6) * T && !this.bloqueo && this.time.now > this.invulHasta) { tx = b.center.x; ty = b.center.y; v = e.vel; }
            const ex = tx - s.x, ey = ty - s.y, de = Math.hypot(ex, ey);
            if (de > 2) { s.x += (ex / de) * Math.min(de, v * dt); s.y += (ey / de) * Math.min(de, v * dt); }
            if (Math.abs(ex) > 4) s.setFlipX(ex > 0);
            break;
          }
          default: break;
        }
      }
    }

    update(_time, delta) {
      const dt = Math.min(delta, 50) / 1000;
      for (const c of this.cascadas) if (c.tilePositionY !== undefined) c.tilePositionY -= delta * 0.42;
      this.actualizarEnemigos(dt);
      if (this.fin) { this.spr.setPosition(Math.round(this.cuerpo.body.center.x), Math.round(this.cuerpo.body.bottom + 1)); return; }
      this.leerEntrada();
      this.moverJugador(dt);
      this.actualizarPincel(dt);
      if (this.subida) this.actualizarSubida(dt);
      if (this.bloqueo) return;
      this.revisarPeligros();
      this.revisarCajas();
      this.revisarTarjetas();
      this.revisarLibro();
      this.revisarCorazones();
    }
  }

  M.Nivel = Nivel;
})();
