// Cajas de Palabras — barrido (embestida) y bloques rompibles B/K/Q/V. Amplía la escena Nivel.
(function () {
  'use strict';
  const M = CAJAS.M;
  const T = 64;
  const DASH_V = 1780;       // ~5 bloques en 0,18 s
  const DASH_MS = 180;
  const DASH_RECARGA = 700;  // ms después de terminar
  const choca = (a, b) => a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;

  Object.assign(M.Nivel.prototype, {
    // ================= bloques rompibles =================
    crearRompibles() {
      const p = this.p;
      this.decoRomp = {};
      if (!p.rompibles.length) { this.capaRomp = null; return; }
      this.capaRomp = this.mapaT.createBlankLayer('rompibles', this.tsT, 0, 0).setDepth(0);
      for (const rb of p.rompibles) {
        this.capaRomp.putTileAt(this.idxT('bricks_brown'), rb.c, rb.r);
        const x = rb.c * T + 32, y = rb.r * T + 32;
        const cosas = [this.add.image(x, y, 'm_grietas').setDepth(1)];
        const asoma = { K: ['m_libro', null, 0.42], V: ['tiles', 'heart', 0.42], Q: ['tiles', 'block_exclamation', 0.38] }[rb.ch];
        if (asoma) cosas.push(this.add.image(x + 14, y + 14, asoma[0], asoma[1] || undefined).setScale(asoma[2]).setAlpha(0.7).setDepth(1));
        this.decoRomp[rb.r + ',' + rb.c] = { rb, cosas };
      }
      this.capaRomp.setCollisionByExclusion([-1]);
      this.fxTrozos = this.add.particles(0, 0, 'tiles', {
        frame: 'brick_brown', emitting: false, lifespan: 900, speed: { min: 140, max: 380 }, angle: { min: 200, max: 340 },
        rotate: { min: 0, max: 360 }, scale: { start: 0.45, end: 0.2 }, gravityY: 1300, alpha: { start: 1, end: 0.6 },
      }).setDepth(12);
    },

    roto(r, c) { return this.rotos.has(r + ',' + c); },

    romperEnRect(rect) {
      if (!this.capaRomp) return false;
      let alguno = false;
      const c1 = Math.floor(rect.x / T), c2 = Math.floor((rect.x + rect.w) / T);
      const r1 = Math.floor(rect.y / T), r2 = Math.floor((rect.y + rect.h) / T);
      for (let r = r1; r <= r2; r++) for (let c = c1; c <= c2; c++) {
        if (this.decoRomp[r + ',' + c] && !this.roto(r, c)) { this.romper(r, c); alguno = true; }
      }
      return alguno;
    },

    romper(r, c) {
      const k = r + ',' + c, d = this.decoRomp[k];
      if (!d || this.roto(r, c)) return;
      this.rotos.add(k);
      this.capaRomp.removeTileAt(c, r);
      d.cosas.forEach(o => o.destroy());
      const x = c * T + 32, y = r * T + 32;
      this.fxTrozos.explode(12, x, y);
      this.fxPolvo.explode(8, x, y + 10);
      M.sonar(this, 'sfx_bump', { rate: 0.6, volume: 0.55 });
      this.cameras.main.shake(80, 0.003);
      const ch = d.rb.ch;
      if (ch === 'Q') {
        const cj = this.cajas.find(q => q.r === r && q.c === c);
        if (cj) {
          cj.oculta = false;
          cj.spr.setVisible(true).setScale(0).setPosition(cj.x, cj.y);
          this.tweens.add({ targets: cj.spr, scale: 1, duration: 360, ease: 'Back.out' });
          cj.brillo.setVisible(true);
          cj.badge.setVisible(true).setScale(0);
          this.tweens.add({ targets: cj.badge, scale: 1, duration: 300, delay: 200, ease: 'Back.out' });
          cj.tocando = true;
          this.fxChispa.explode(16, cj.x, cj.y);
          M.sonar(this, 'sfx_magic', { volume: 0.35 });
          this.aviso(`¡Una caja escondida! Es la caja ${cj.i + 1}`, 'ok');
        }
      } else if (ch === 'K') {
        const L = this.p.libro;
        if (L && L.r === r && L.c === c && !this.libroRevelado) {
          this.libroRevelado = true;
          this.crearLibro();
          if (this.libro) {
            this.libro.spr.setScale(0);
            this.tweens.add({ targets: this.libro.spr, scale: 1, duration: 360, ease: 'Back.out' });
            M.sonar(this, 'sfx_magic', { volume: 0.3 });
          }
        }
      } else if (ch === 'V') {
        const im = this.add.image(x, y, 'tiles', 'heart').setDepth(6).setScale(0);
        this.tweens.add({ targets: im, scale: 0.9, duration: 320, ease: 'Back.out' });
        this.tweens.add({ targets: im, y: y - 8, duration: 700, yoyo: true, repeat: -1, ease: 'Sine.inOut', delay: 320 });
        this.corazonesItem.push({ x, y, im });
      }
    },

    revisarCorazones() {
      if (!this.corazonesItem.length) return;
      const b = this.cuerpo.body, rj = { x: b.x, y: b.y, w: b.width, h: b.height };
      this.corazonesItem = this.corazonesItem.filter(h => {
        if (!choca(rj, { x: h.x - 28, y: h.y - 28, w: 56, h: 56 })) return true;
        this.tweens.killTweensOf(h.im);
        this.tweens.add({ targets: h.im, y: h.y - 60, alpha: 0, scale: 1.4, duration: 400, onComplete: () => h.im.destroy() });
        const antes = this.vidas;
        this.vidas = Math.min(M.MAX_VIDAS, this.vidas + 1);
        M.sonar(this, 'sfx_coin', { rate: 1.2 });
        this.aviso(this.vidas > antes ? '¡+1 vida!' : 'Ya tienes todas las vidas', 'ok');
        return false;
      });
    },

    // ================= barrido =================
    barrer() {
      if (this.time.now < this.dashListo || this.aturdido > 0 || this.bloqueo || this.fin) return;
      const b = this.cuerpo.body;
      const enSuelo = b.blocked.down || b.touching.down;
      if (!enSuelo) { if (!this.dashAire) return; this.dashAire = false; }
      const d = (this.der ? 1 : 0) - (this.izq ? 1 : 0);
      this.dashDir = d || (this.spr.flipX ? -1 : 1);
      this.spr.setFlipX(this.dashDir < 0);
      this.dashHasta = this.time.now + DASH_MS;
      this.dashListo = this.dashHasta + DASH_RECARGA;
      this.dashActivo = true;
      this.tEstela = 0;
      b.setAllowGravity(false);
      b.setVelocity(this.dashDir * DASH_V, 0);
      M.sonar(this, 'sfx_jump-high', { rate: 1.6, volume: 0.22 });
      M.sonar(this, 'sfx_throw', { rate: 0.8, volume: 0.3 });
      this.fxPolvo.explode(9, b.center.x, b.bottom);
      this.cameras.main.shake(70, 0.0025);
      this.spr.play(`p_${this.color}_walk`).anims.pause();
      this.spr.setAngle(this.dashDir * 10);
    },

    actualizarBarrido(dt) {
      const b = this.cuerpo.body, dir = this.dashDir;
      // romper lo que hay delante antes de chocar
      const delante = { x: dir > 0 ? b.right - 4 : b.left - 52, y: b.top + 4, w: 56, h: b.height - 8 };
      const rompio = this.romperEnRect(delante);
      if (!rompio && ((dir > 0 && b.blocked.right) || (dir < 0 && b.blocked.left))) {
        this.cameras.main.shake(90, 0.004);
        this.fxPolvo.explode(6, dir > 0 ? b.right : b.left, b.center.y);
        this.dashHasta = this.time.now;
      }
      b.setVelocity(dir * DASH_V, 0);
      // enemigos atravesados
      const rj = { x: b.x - 10, y: b.y - 6, w: b.width + 20, h: b.height + 12 };
      for (const e of this.enemigos.slice()) {
        if (!this.puedePintarse(e)) continue;
        const eb = e.spr.body;
        if (choca(rj, { x: eb.x, y: eb.y, w: eb.width, h: eb.height })) this.pintarEnemigo(e);
      }
      // estela
      this.tEstela -= dt;
      if (this.tEstela <= 0) {
        this.tEstela = 0.022;
        const s = this.spr;
        const f = this.add.image(s.x, s.y, s.texture.key, s.frame.name).setOrigin(s.originX, s.originY)
          .setScale(s.scaleX, s.scaleY).setFlipX(s.flipX).setAngle(s.angle).setTint(0x9FD8FF).setAlpha(0.6).setDepth(9);
        this.tweens.add({ targets: f, alpha: 0, duration: 220, onComplete: () => f.destroy() });
        this.fxPolvo.explode(1, b.center.x - dir * 14, b.bottom - 4);
      }
      this.spr.setPosition(Math.round(b.center.x), Math.round(b.bottom + 1));
    },

    finBarrido() {
      this.dashActivo = false;
      const b = this.cuerpo.body;
      b.setAllowGravity(true);
      b.setVelocityX(this.dashDir * this.fis.velocidad);
      this.spr.setAngle(0);
      this.spr.anims.resume();
    },
  });
})();
