// Cajas de Palabras — pincel (atacar) y modo subida (jetpack, compuertas, meta). Amplía la escena Nivel.
(function () {
  'use strict';
  const M = CAJAS.M;
  const T = 64;
  const choca = (a, b) => a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;

  const EXTRA_SUBIDA = {
    jetpack: 'jetpack.png', jetpack_item: 'jetpack_item.png',
    alado1: 'alado1.png', alado2: 'alado2.png', alado3: 'alado3.png', alado4: 'alado4.png', alado5: 'alado5.png',
    volador_a: 'volador_a.png', volador_b: 'volador_b.png', nube_mala: 'nube.png',
    cielo_capa1: 'cielo_capa1.png', cielo_capa2: 'cielo_capa2.png', cielo_capa3: 'cielo_capa3.png', cielo_capa4: 'cielo_capa4.png',
  };

  Object.assign(M.Nivel.prototype, {
    // ================= pincel =================
    crearPincel() {
      this.pincel = this.add.image(0, 0, 'm_pincel').setOrigin(0.08, 0.5).setDepth(11);
      this.angP = { a: -55 };
      if (this.subida) {
        this.fxLlama = this.add.particles(0, 0, 'm_polvo', {
          emitting: false, lifespan: 380, speedY: { min: 160, max: 300 }, speedX: { min: -30, max: 30 },
          scale: { start: 0.9, end: 0 }, alpha: { start: 1, end: 0 }, tint: [0xFFE066, 0xFFA43A, 0xFF6A3D], blendMode: 'ADD',
        }).setDepth(9);
      }
    },

    puedePintarse(e) {
      return e.comp !== 'fijo' && e.comp !== 'atrae' && e.d.pintable !== false;
    },

    actualizarPincel(dt) {
      this.ataqueCd -= dt;
      if (this.ataqueDown && this.ataqueCd <= 0 && this.aturdido <= 0 && !this.bloqueo && !this.fin) this.atacar();
      const dir = this.spr.flipX ? -1 : 1;
      const hx = this.spr.x + dir * 15, hy = this.spr.y - 22;
      this.pincel.setPosition(hx, hy).setScale(0.72 * dir, 0.72).setAngle(dir * this.angP.a).setAlpha(this.spr.alpha);
      if (this.mochila) {
        this.mochila.setPosition(this.spr.x - dir * 13, this.spr.y - 26).setFlipX(dir < 0).setAlpha(this.spr.alpha);
      }
      // golpe del barrido
      if (this.time.now < this.ataqueHasta - 40) {
        const b = this.cuerpo.body;
        const zona = { x: dir > 0 ? b.center.x - 14 : b.center.x - 100, y: b.top - 38, w: 114, h: b.height + 50 };
        this.romperEnRect({ x: dir > 0 ? b.right : b.left - 70, y: b.top + 6, w: 70, h: b.height - 12 });
        for (const e of this.enemigos.slice()) {
          if (!this.puedePintarse(e)) continue;
          const eb = e.spr.body;
          if (choca(zona, { x: eb.x, y: eb.y, w: eb.width, h: eb.height })) this.pintarEnemigo(e);
        }
      }
    },

    atacar() {
      this.ataqueCd = 0.35;
      this.ataqueHasta = this.time.now + 230;
      M.sonar(this, 'sfx_throw', { volume: 0.3, rate: 1.15 });
      this.tweens.killTweensOf(this.angP);
      this.angP.a = -115;
      this.tweens.add({
        targets: this.angP, a: 45, duration: 130, ease: 'Quad.out',
        onComplete: () => this.tweens.add({ targets: this.angP, a: -55, duration: 170, ease: 'Sine.inOut' }),
      });
      this.tweens.add({ targets: this.spr, angle: (this.spr.flipX ? -1 : 1) * 9, duration: 90, yoyo: true });
      // trazo de pintura en arco
      const dir = this.spr.flipX ? -1 : 1;
      const g = this.add.graphics().setDepth(11).setPosition(this.spr.x + dir * 12, this.spr.y - 22);
      const rad = Phaser.Math.DegToRad;
      const ini = dir > 0 ? rad(-110) : rad(-70), fin = dir > 0 ? rad(40) : rad(140);
      [[M.PINTURA.clara, 48, 7], [M.PINTURA.base, 60, 14], [M.PINTURA.oscura, 72, 5]].forEach(([col, r, ancho]) => {
        g.lineStyle(ancho, col, 0.95);
        g.beginPath(); g.arc(0, 0, r, ini, fin, dir < 0); g.strokePath();
      });
      g.setScale(0.85);
      this.tweens.add({ targets: g, alpha: 0, scale: 1.12, duration: 300, ease: 'Quad.out', onComplete: () => g.destroy() });
    },

    pintarEnemigo(e) {
      const i = this.enemigos.indexOf(e);
      if (i < 0) return;
      this.enemigos.splice(i, 1);
      const s = e.spr;
      s.body.enable = false;
      if (s.anims) s.anims.pause();
      // parón corto y sacudida leve
      this.physics.world.pause();
      this.time.delayedCall(75, () => { if (this.sys.isActive()) this.physics.world.resume(); });
      this.cameras.main.shake(110, 0.004);
      M.sonar(this, 'sfx_disappear');
      M.sonar(this, 'sfx_magic', { volume: 0.25, rate: 1.4 });
      this.fxChispa.explode(10, s.x, s.y - (s.originY === 1 ? s.displayHeight / 2 : 0));
      const k = { v: 0 }, esc = s.scaleX;
      this.tweens.add({
        targets: k, v: 1, duration: 420, ease: 'Sine.in',
        onUpdate: () => {
          const c = Phaser.Display.Color.Interpolate.ColorWithColor(Phaser.Display.Color.ValueToColor(0xFFFFFF), Phaser.Display.Color.ValueToColor(M.PINTURA.base), 1, Math.min(1, k.v * 2.5));
          s.setTint(Phaser.Display.Color.GetColor(c.r, c.g, c.b));
          s.setScale(Math.abs(esc) * (1 + k.v * 0.35));
          s.setAlpha(1 - k.v * k.v);
        },
        onComplete: () => {
          const cy = s.y - (s.originY === 1 ? s.displayHeight / 2 : 0);
          this.fxChispa.explode(18, s.x, cy);
          this.fxPintura.explode(16, s.x, cy);
          s.destroy();
        },
      });
    },

    // ================= modo subida =================
    cargarSubida() {
      for (const [k, f] of Object.entries(EXTRA_SUBIDA)) if (!this.textures.exists(k)) this.load.image(k, 'assets/extra/' + f);
      this.load.on('loaderror', f => console.warn('[cajas] no se pudo cargar', f && f.key));
    },

    crearSubida() {
      const p = this.p;
      this.tramo = 0;
      this.ultimaComp = -1;
      this.opcionesDe = -1;
      this.camFondo = this.camFondoObj = this.altoPx;
      this.capaComp = this.mapaT.createBlankLayer('compuertas', this.tsT, 0, 0).setDepth(0).setAlpha(0);
      this.compuertas = p.compuertas.map((q, i) => {
        for (let c = q.c1; c <= q.c2; c++) this.capaComp.putTileAt(this.idxT('block_strong_empty'), c, q.r);
        const n = q.c2 - q.c1 + 1, hw = (n * T) / 2, x1 = q.c1 * T, y = q.r * T;
        const hoja = lado => {
          const c = this.add.container(lado < 0 ? x1 : x1 + n * T, y).setDepth(2);
          const g = this.add.graphics();
          const x0 = lado < 0 ? 0 : -hw;
          g.fillStyle(0x8A4B12, 1); g.fillRoundedRect(x0, 2, hw, T - 4, 8);
          g.fillStyle(0xF5A623, 1); g.fillRoundedRect(x0 + 4, 6, hw - 8, T - 14, 6);
          g.fillStyle(0xFFD27A, 1); g.fillRoundedRect(x0 + 10, 10, hw - 20, 7, 3);
          g.fillStyle(0xB8700C, 1);
          for (let xx = x0 + 18; xx < x0 + hw - 10; xx += 30) { g.fillCircle(xx, 36, 4); }
          c.add(g);
          return c;
        };
        const izq = hoja(-1), der = hoja(1);
        const candado = this.add.image(x1 + hw, y + 30, 'tiles', 'lock_yellow').setScale(0.62).setDepth(3);
        this.tweens.add({ targets: candado, angle: { from: -6, to: 6 }, duration: 900, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
        return Object.assign({}, q, { i, abierta: false, pasada: false, izq, der, candado, cx: x1 + hw });
      });
      this.capaComp.setCollisionByExclusion([-1]);
      // meta
      if (p.meta) {
        const mx = p.meta.c * T + 32, my = (p.meta.r + 1) * T;
        const br = this.add.image(mx, my - 40, 'm_brillo').setDepth(4).setTint(0xFFF2A0).setScale(1.3).setAlpha(0.6);
        this.tweens.add({ targets: br, alpha: 0.25, scale: 1.1, duration: 900, yoyo: true, repeat: -1 });
        if (!this.anims.exists('m_meta')) this.anims.create({ key: 'm_meta', frames: [{ key: 'tiles', frame: 'flag_green_a' }, { key: 'tiles', frame: 'flag_green_b' }], frameRate: 5, repeat: -1 });
        this.add.sprite(mx, my, 'tiles', 'flag_green_a').setOrigin(0.5, 1).setDepth(5).setScale(1.2).play('m_meta');
        M.texto(this, mx, my - 100, '¡Meta!', { size: 30, color: '#FFFFFF', stroke: '#2E8B3E', strokeW: 7 }).setDepth(5);
        this.meta = { x: mx, y: my - 40 };
      }
      // jetpack
      if (p.jet && this.textures.exists('jetpack_item')) {
        const jx = p.jet.c * T + 32, jy = p.jet.r * T + 32;
        const br = this.add.image(jx, jy, 'm_brillo').setDepth(5).setTint(0xFFB347).setAlpha(0.6);
        const im = this.add.image(jx, jy, 'jetpack_item').setDepth(6);
        im.setScale(52 / Math.max(im.width, im.height));
        this.tweens.add({ targets: im, y: jy - 8, duration: 800, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
        this.tweens.add({ targets: br, scale: 0.8, alpha: 0.3, duration: 800, yoyo: true, repeat: -1 });
        this.jetItem = { x: jx, y: jy, im, br };
      }
    },

    fondoCaida() { return this.camFondoObj + 30; },

    puntoSubida() {
      const q = this.compuertas[this.ultimaComp];
      if (!q) return this.seguro;
      return { x: q.cx, y: q.r * T };
    },

    tomarJetpack() {
      const J = this.jetItem;
      this.jetItem = null;
      this.jetpack = true;
      this.tweens.killTweensOf([J.im, J.br]);
      J.im.destroy(); J.br.destroy();
      this.fxChispa.explode(18, J.x, J.y);
      M.sonar(this, 'sfx_jump-high');
      if (this.textures.exists('jetpack')) {
        this.mochila = this.add.image(0, 0, 'jetpack').setDepth(9).setOrigin(0.5, 0.5);
        this.mochila.setScale(36 / this.mochila.height);
      }
      this.aviso('¡Jetpack! Mantén saltar para volar', 'ok');
    },

    volar(dt, enSuelo) {
      const b = this.cuerpo.body;
      const empuja = this.saltoHeld && !(enSuelo && this.saltoDown);
      if (empuja) {
        b.velocity.y = Math.max(b.velocity.y - (this.fis.gravedad + 1550) * dt, -430);
        this.saltando = false;
        if (this.fxLlama) {
          const dir = this.spr.flipX ? -1 : 1;
          this.fxLlama.explode(2, this.spr.x - dir * 13, this.spr.y - 8);
        }
        if (!this.empujando) M.sonar(this, 'sfx_throw', { volume: 0.12, rate: 0.7 });
      }
      this.empujando = empuja;
    },

    mostrarOpciones(q) {
      const p = this.p, cj = this.cajas[q.caja];
      for (const t of this.tarjetas) t.c.destroy();
      const n = Math.min(this.nIdx === 0 ? 3 : 5, p.cajas.length);
      const otras = M.barajar(p.cajas.filter(x => x !== p.cajas[q.caja] && x.respuesta !== cj.respuesta), Math.random)
        .filter((x, i, a) => a.findIndex(y => y.respuesta === x.respuesta) === i).slice(0, n - 1);
      const lista = M.barajar([p.cajas[q.caja], ...otras], Math.random);
      // dentro de la pantalla y lejos del minimapa (derecha) : 3 por fila como mucho
      const paso = 240, porFila = 3;
      // la cámara sigue al jugador: se centra respecto a él, sin pisar el minimapa (derecha) y dentro del mapa
      const px = this.cuerpo.body.center.x;
      const ancho = (Math.min(porFila, lista.length) - 1) * paso, medio = ancho / 2 + 112;
      const izq = Math.max(px - M.ANCHO / 2 + 30, 10), der = Math.min(px + M.ANCHO / 2 - 150, this.anchoPx - 10);
      const cx = Phaser.Math.Clamp(q.cx, izq + medio, Math.max(izq + medio, der - medio));
      this.tarjetas = lista.map((x, k) => {
        const fila = Math.floor(k / porFila), enFila = Math.min(porFila, lista.length - fila * porFila), col = k % porFila;
        const y = (q.r + 1) * T + 50 + fila * 80;
        const tj = M.crearTarjeta(this, x.respuesta);
        const c = tj.c.setPosition(cx + (col - (enFila - 1) / 2) * paso, y).setDepth(6), gg = tj.g, tt = tj.t;
        c.setScale(0);
        this.tweens.add({ targets: c, scale: 1, duration: 300, delay: k * 70, ease: 'Back.out' });
        this.tweens.add({ targets: c, y: y + 6, duration: 1000 + k * 90, yoyo: true, repeat: -1, ease: 'Sine.inOut', delay: 350 });
        this.time.delayedCall(k * 70, () => this.fxChispa.explode(8, c.x, c.y));
        return { caja: p.cajas.indexOf(x), texto: x.respuesta, c, g: gg, t: tt, w: tj.w, h: tj.h, y0: y, usada: false, tocando: false, visible: true, sitio: { c: Math.floor(c.x / T), r: q.r + 1 } };
      });
      this.opcionesDe = q.i;
      M.sonar(this, 'sfx_magic', { volume: 0.3 });
      this.aviso('¿Cuál es? Toca la respuesta de «' + cj.palabra + '»', 'info');
    },

    correctaSubida() {
      const q = this.compuertas[this.tramo];
      if (!q) return;
      this.tramo++;
      q.abierta = true;
      for (let c = q.c1; c <= q.c2; c++) {
        this.capaComp.removeTileAt(c, q.r);
        const tl = this.capaPlat.putTileAt(this.idxT('bridge'), c, q.r);
        if (tl) tl.setCollision(false, false, true, false, false);
      }
      this.tweens.killTweensOf(q.candado);
      this.tweens.add({ targets: q.candado, y: q.candado.y - 60, alpha: 0, angle: 30, duration: 450, ease: 'Quad.out' });
      this.tweens.add({ targets: [q.izq, q.der], scaleX: 0, duration: 650, delay: 200, ease: 'Cubic.inOut' });
      this.time.delayedCall(250, () => {
        M.sonar(this, 'sfx_disappear', { rate: 0.8 });
        for (let c = q.c1; c <= q.c2; c++) this.fxChispa.explode(4, c * T + 32, q.r * T + 32);
      });
      this.cameras.main.shake(200, 0.003);
      this.time.delayedCall(700, () => this.aviso(this.tramo >= this.compuertas.length ? '¡Última compuerta! Sube a la meta' : '¡Compuerta abierta! Sigue subiendo', 'ok'));
    },

    actualizarSubida(dt) {
      const b = this.cuerpo.body;
      const rj = { x: b.x, y: b.y, w: b.width, h: b.height };
      if (this.jetItem && choca(rj, { x: this.jetItem.x - 30, y: this.jetItem.y - 30, w: 60, h: 60 })) this.tomarJetpack();
      if (this.meta && !this.fin && choca(rj, { x: this.meta.x - 40, y: this.meta.y - 60, w: 80, h: 110 })) {
        if (this.tramo >= this.compuertas.length) this.completar();
      }
      // compuertas ya cruzadas: la cámara no baja de ahí y se reaparece encima
      this.compuertas.forEach((q, i) => {
        if (q.abierta && !q.pasada && b.bottom < q.r * T - 2) {
          q.pasada = true;
          this.ultimaComp = Math.max(this.ultimaComp, i);
          this.camFondoObj = Math.max(M.ALTO, Math.min(this.altoPx, (q.r + 2) * T));
        }
      });
      this.camFondo += (this.camFondoObj - this.camFondo) * Math.min(1, dt * 3);
      if (Math.abs(this.camFondo - this.camFondoObj) < 1) this.camFondo = this.camFondoObj;
      this.cameras.main.setBounds(0, 0, this.anchoPx, this.camFondo);
      // bajo la compuerta del tramo actual
      const q = this.compuertas[this.tramo];
      const bajo = !!q && b.top > (q.r + 1) * T - 8 && b.top < (q.r + 1) * T + 4.5 * T;
      // con las opciones a la vista, la cámara sube para que queden lejos del HUD
      this.offY = (this.offY || 0) + (((bajo || this.tarjetas.some(t => t.visible)) ? 150 : 0) - (this.offY || 0)) * Math.min(1, dt * 4);
      this.cameras.main.setFollowOffset(0, this.offY);
      if (!q || this.bloqueo) return;
      if (!bajo) { this.avisoTramo = -1; return; }
      const cj = this.cajas[q.caja];
      if (cj && this.abierta === q.caja) {
        if (this.opcionesDe !== q.i) this.mostrarOpciones(q);
      } else if (this.avisoTramo !== q.i && (!cj || cj.estado !== 'resuelta')) {
        this.avisoTramo = q.i;
        M.sonar(this, 'sfx_bump', { volume: 0.2 });
        this.aviso('Busca la caja de este tramo', 'mal');
      }
    },
  });
})();
