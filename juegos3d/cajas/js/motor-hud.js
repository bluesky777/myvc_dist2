// Cajas de Palabras — HUD (escena encima del nivel): vidas, libros, progreso, minimapa, avisos y paneles.
(function () {
  'use strict';
  const M = CAJAS.M;
  const T = 64;

  class HUD extends Phaser.Scene {
    constructor() { super('HUD'); }

    init(data) {
      this.nivel = data.nivel;
      this.listo = false;
      this.firma = '';
      this.modal = null;
      this.avisos = [];
      Object.assign(this, { txtAltura: null, gAltura: null, bTact: null, dashPrevF: 1, alturaPrev: null, vidasPrev: null, aviso0: null });
    }

    create() {
      const W = M.ANCHO;
      const n = this.nivel;
      // ---- vidas y libros (arriba izquierda)
      this.gVidas = this.add.graphics();
      this.corazones = [];
      for (let i = 0; i < M.MAX_VIDAS; i++) this.corazones.push(this.add.image(46 + i * 44, 44, 'tiles', 'hud_heart').setScale(0.66));
      this.iconoLibro = this.add.image(44, 92, 'm_libro').setScale(0.5);
      this.txtLibros = M.texto(this, 70, 92, '', { size: 24, color: '#FFFFFF', ox: 0 });

      // ---- progreso (centro)
      this.gProg = this.add.graphics();
      this.txtCajas = M.texto(this, 0, 44, '', { size: 26, color: '#FFFFFF', ox: 0 });
      this.numCuadros = [];
      this.checks = [];
      for (let i = 0; i < 8; i++) {
        this.numCuadros.push(M.texto(this, 0, 44, String(i + 1), { size: 17, color: '#55607A' }));
        this.checks.push(this.add.image(0, 44, 'm_check').setScale(0.55).setVisible(false));
      }

      // ---- banner de caja abierta
      this.banner = this.add.container(W / 2, M.ALTO - 46).setVisible(false);
      this.gBanner = this.add.graphics();
      this.flecha = this.add.image(0, 0, 'm_libro').setVisible(false);
      this.txtBanner = M.texto(this, 0, -2, '', { size: 26, color: '#FFFFFF', stroke: '#8A3F06', strokeW: 5, ox: 0 });
      this.banner.add([this.gBanner, this.txtBanner, this.flecha]);

      // ---- minimapa (arriba derecha) y pausa
      const p = n.p;
      const s = n.subida ? Math.min(84 / p.W, 400 / p.H) : Math.min(250 / p.W, 92 / p.H);
      this.mm = { s, w: p.W * s, h: p.H * s };
      this.mm.x = n.subida ? W - 26 - this.mm.w : W - 16 - 64 - 14 - this.mm.w - 10;
      this.mm.y = n.subida ? 102 : 26;
      const gm = this.add.graphics();
      M.panel(gm, this.mm.x - 10, this.mm.y - 10, this.mm.w + 20, this.mm.h + 20, { fondo: 0x14213D, alpha: 0.62, r: 14, sombra: false });
      const cielo = Phaser.Display.Color.HexStringToColor(n.mundo.colorCielo || '#BFE6FF').color;
      gm.fillStyle(cielo, 0.55); gm.fillRect(this.mm.x, this.mm.y, this.mm.w, this.mm.h);
      M.dibujarMapa(gm, p, this.mm.x, this.mm.y, s, n.mundo.terreno);
      this.gMini = this.add.graphics();
      // indicador del barrido (debajo de las vidas)
      this.gDash = this.add.graphics();
      this.txtDash = M.texto(this, 70, 147, 'Barrido', { size: 19, color: '#FFFFFF', ox: 0 });
      this.icoDash = this.add.image(44, 147, 'm_flecha').setScale(0.55);
      if (n.subida) {
        this.gAltura = this.add.graphics();
        this.txtAltura = M.texto(this, W / 2, 98, '', { size: 21, color: '#FFFFFF' });
        this.alturaMax = 0;
      }
      this.botonPausa = this.crearBotonPausa(W - 16 - 32, 48);

      // ---- avisos
      this.capaAvisos = this.add.container(W / 2, 0);

      // ---- controles táctiles
      const tactil = this.sys.game.device.input.touch || /[?&]tactil/.test(location.search);
      if (tactil) this.crearTactil();

      this.input.keyboard.on('keydown-ESC', () => this.alternarPausa());
      this.input.keyboard.on('keydown-P', () => this.alternarPausa());
      this.listo = true;
      this.refrescar(true);
      this.intro();
    }

    crearBotonPausa(x, y) {
      const c = this.add.container(x, y);
      const g = this.add.graphics();
      const dib = f => {
        g.clear();
        M.panel(g, -30, -30, 60, 60, { fondo: f ? 0x2A3E78 : 0x14213D, alpha: 0.72, r: 16, sombra: false });
        g.fillStyle(0xFFFFFF, 1); g.fillRoundedRect(-11, -14, 8, 28, 3); g.fillRoundedRect(3, -14, 8, 28, 3);
      };
      dib(false);
      c.add(g);
      c.setSize(60, 60).setInteractive({ useHandCursor: true });
      c.on('pointerover', () => dib(true));
      c.on('pointerout', () => dib(false));
      c.on('pointerup', () => this.alternarPausa());
      return c;
    }

    crearTactil() {
      this.input.addPointer(2);
      const H = M.ALTO;
      const mk = (x, y, r, rot, flip) => {
        const c = this.add.container(x, y).setAlpha(0.85);
        const g = this.add.graphics();
        g.fillStyle(0x14213D, 0.35); g.fillCircle(0, 4, r);
        g.fillStyle(0xFFFFFF, 0.3); g.fillCircle(0, 0, r);
        g.lineStyle(4, 0xFFFFFF, 0.7); g.strokeCircle(0, 0, r);
        const f = this.add.image(0, 0, 'm_flecha').setScale(1.3).setAngle(rot).setFlipX(!!flip).setAlpha(0.95);
        c.add([g, f]);
        return { c, x, y, r };
      };
      this.bTact = {
        izq: mk(100, H - 100, 62, 0, true),
        der: mk(250, H - 100, 62, 0, false),
        salto: mk(M.ANCHO - 120, H - 110, 74, -90, false),
        pincel: mk(M.ANCHO - 280, H - 84, 56, 0, false),
        barrido: mk(M.ANCHO - 250, H - 230, 52, 0, false),
      };
      const ip = this.bTact.pincel.c.list[1];
      ip.setTexture('m_pincel').setScale(1.15).setAngle(-35);
      const ib = this.bTact.barrido.c.list[1];
      ib.setTint(0xFFD23D).setScale(1.05);
      const ib2 = this.add.image(-16, 0, 'm_flecha').setTint(0xFFD23D).setScale(0.8).setAlpha(0.8);
      this.bTact.barrido.c.add(ib2); ib.setX(10);
      // un toque corto (abajo y arriba en el mismo cuadro) también salta
      this.input.on('pointerdown', pt => {
        const b = this.bTact.salto;
        if (!this.modal && Phaser.Math.Distance.Between(pt.x, pt.y, b.x, b.y) < b.r + 18) M.pulsoSalto = true;
        const bp = this.bTact.pincel;
        if (!this.modal && Phaser.Math.Distance.Between(pt.x, pt.y, bp.x, bp.y) < bp.r + 12) M.pulsoPincel = true;
        const bb = this.bTact.barrido;
        if (!this.modal && Phaser.Math.Distance.Between(pt.x, pt.y, bb.x, bb.y) < bb.r + 12) M.pulsoBarrido = true;
      });
    }

    leerTactil() {
      if (!this.bTact) return;
      const st = { izq: false, der: false, salto: false };
      const ptrs = this.input.manager.pointers;
      for (const pt of ptrs) {
        if (!pt.isDown) continue;
        for (const k in this.bTact) {
          const b = this.bTact[k];
          if (Phaser.Math.Distance.Between(pt.x, pt.y, b.x, b.y) < b.r + (k === 'pincel' || k === 'barrido' ? 12 : 18)) st[k] = true;
        }
      }
      for (const k in this.bTact) this.bTact[k].c.setScale(st[k] ? 0.92 : 1);
      M.tactil = this.modal ? { izq: false, der: false, salto: false, pincel: false, barrido: false } : st;
    }

    // ---------- refresco ----------
    refrescar(forzar) {
      const n = this.nivel;
      const est = n.cajas.map(c => (c.oculta ? 'o' : c.estado[0])).join('');
      const firma = [n.vidas, M.estado.libros, est, n.abierta, n.tramo].join('|');
      if (!forzar && firma === this.firma) return;
      this.firma = firma;
      const W = M.ANCHO;
      // vidas
      const slots = Math.max(3, n.vidas);
      this.gVidas.clear();
      M.panel(this.gVidas, 16, 16, 60 + slots * 44 - 16, 106, { fondo: 0x14213D, alpha: 0.62, r: 16, sombra: false });
      this.corazones.forEach((h, i) => {
        h.setVisible(i < slots);
        h.setFrame(i < n.vidas ? 'hud_heart' : 'hud_heart_empty');
      });
      if (this.vidasPrev != null && n.vidas !== this.vidasPrev) {
        const i = n.vidas > this.vidasPrev ? n.vidas - 1 : n.vidas;
        const h = this.corazones[i];
        if (h) this.tweens.add({ targets: h, scale: 1, duration: 140, yoyo: true, ease: 'Quad.out', onComplete: () => h.setScale(0.66) });
      }
      this.vidasPrev = n.vidas;
      this.txtLibros.setText(`${M.estado.libros}/3 libros`);
      // progreso
      const res = n.cajas.filter(c => c.estado === 'resuelta').length;
      this.txtCajas.setText(n.subida ? `Tramo ${Math.min(n.cajas.length, n.tramo + 1)}/${n.cajas.length}` : `Cajas ${res}/${n.cajas.length}`);
      const cajaDe = i => (n.subida ? n.cajas.find(c => c.tramo === i) || n.cajas[i] : n.cajas[i]);
      const cs = 30, gap = 6, nC = n.cajas.length;
      const pw = this.txtCajas.width + 24 + nC * (cs + gap) + 22;
      const x0 = W / 2 - pw / 2;
      this.txtCajas.setX(x0 + 18);
      const g = this.gProg;
      g.clear();
      M.panel(g, x0, 16, pw, 58, { fondo: 0x14213D, alpha: 0.62, r: 16, sombra: false });
      const cx0 = x0 + 18 + this.txtCajas.width + 16;
      for (let i = 0; i < 8; i++) {
        const vis = i < nC;
        this.numCuadros[i].setVisible(vis);
        this.checks[i].setVisible(false);
        if (!vis) continue;
        const c = cajaDe(i);
        const x = cx0 + i * (cs + gap);
        if (c.estado === 'resuelta') {
          g.fillStyle(0x1E7A2E, 1); g.fillRoundedRect(x, 29, cs, cs, 8);
          g.fillStyle(0x3DBB4E, 1); g.fillRoundedRect(x + 3, 32, cs - 6, cs - 6, 6);
          this.numCuadros[i].setVisible(false);
          this.checks[i].setPosition(x + cs / 2, 44).setVisible(true).setScale(0.5);
        } else if (c.estado === 'abierta') {
          g.fillStyle(0xFFFFFF, 1); g.fillRoundedRect(x - 3, 26, cs + 6, cs + 6, 10);
          g.fillStyle(0xC2571A, 1); g.fillRoundedRect(x, 29, cs, cs, 8);
          g.fillStyle(0xF5A623, 1); g.fillRoundedRect(x + 3, 32, cs - 6, cs - 6, 6);
          this.numCuadros[i].setPosition(x + cs / 2, 43).setColor('#FFFFFF');
        } else {
          g.fillStyle(0x9AA4B5, 1); g.fillRoundedRect(x, 29, cs, cs, 8);
          g.fillStyle(0xE9EDF4, 1); g.fillRoundedRect(x + 3, 32, cs - 6, cs - 6, 6);
          this.numCuadros[i].setPosition(x + cs / 2, 43).setColor("#55607A").setText(c.oculta ? '?' : String(n.subida ? i + 1 : c.i + 1));
        }
      }
      // banner
      if (n.abierta >= 0) {
        const cj = n.cajas[n.abierta];
        this.txtBanner.setText(`Buscando: ${cj.palabra}`);
        if (this.txtBanner.width > 520) this.txtBanner.setScale(520 / this.txtBanner.width); else this.txtBanner.setScale(1);
        const tw = this.txtBanner.displayWidth;
        const bw = tw + 56;
        this.gBanner.clear();
        M.panel(this.gBanner, -bw / 2, -26, bw, 52, { borde: 0x8A3F06, fondo: 0xF5A623, r: 26, grosor: 4 });
        this.txtBanner.setX(-bw / 2 + 28);
        this.flecha.setX(-bw / 2 + 34);
        if (!this.banner.visible) {
          this.banner.setVisible(true).setScale(0.6).setAlpha(0);
          this.tweens.add({ targets: this.banner, scale: 1, alpha: 1, duration: 240, ease: 'Back.out' });
        }
      } else if (this.banner.visible) {
        this.banner.setVisible(false);
      }
    }

    update() {
      const n = this.nivel;
      if (!n || !n.cuerpo) return;
      this.leerTactil();
      this.refrescar(false);
      const b = n.cuerpo.body;
      if (this.txtAltura) {
        const alt = Math.max(0, Math.round((n.p.P.r + 1) - b.bottom / T));
        if (alt !== this.alturaPrev) {
          this.alturaPrev = alt;
          this.alturaMax = Math.max(this.alturaMax, alt);
          this.txtAltura.setText(`Altura ${alt} m · récord ${this.alturaMax} m`);
          const w = this.txtAltura.width + 30;
          this.gAltura.clear();
          M.panel(this.gAltura, M.ANCHO / 2 - w / 2, 82, w, 34, { fondo: 0x14213D, alpha: 0.62, r: 14, sombra: false });
        }
      }
      // barrido: barra que se llena
      const ahora = n.time.now, listo = n.dashListo || 0;
      const f = ahora >= listo ? 1 : Math.max(0, 1 - (listo - ahora) / 880);
      const gd = this.gDash;
      gd.clear();
      M.panel(gd, 16, 128, 176, 38, { fondo: 0x14213D, alpha: 0.62, r: 14, sombra: false });
      gd.fillStyle(0xFFFFFF, 0.18); gd.fillRoundedRect(148, 140, 34, 14, 7);
      gd.fillStyle(f >= 1 ? 0x5BC453 : 0xF5A623, 1); gd.fillRoundedRect(148, 140, Math.max(6, 34 * f), 14, 7);
      this.icoDash.setAlpha(f >= 1 ? 1 : 0.45);
      if (f >= 1 && this.dashPrevF < 1) this.tweens.add({ targets: this.icoDash, scale: 0.8, duration: 110, yoyo: true });
      this.dashPrevF = f;
      // minimapa dinámico
      const g = this.gMini, s = this.mm.s, mx = this.mm.x, my = this.mm.y;
      g.clear();
      for (const c of n.cajas) {
        const col = c.oculta ? 0x9AA4B5 : c.estado === 'resuelta' ? 0x3DBB4E : c.estado === 'abierta' ? 0xFF8A00 : 0xFFD23D;
        g.fillStyle(0x14213D, 1); g.fillRect(mx + c.c * s - 2.5, my + c.r * s - 2.5, s + 5, s + 5);
        g.fillStyle(col, 1); g.fillRect(mx + c.c * s - 1.5, my + c.r * s - 1.5, s + 3, s + 3);
      }
      // respuestas visibles: puntos azules que laten
      const lat = 2.5 + Math.sin(this.time.now / 160) * 1.2;
      for (const t of n.tarjetas) {
        if (!t.visible) continue;
        const tx = mx + (t.c.x / T) * s, ty = my + (t.c.y / T) * s;
        g.fillStyle(0xFFFFFF, 1); g.fillCircle(tx, ty, lat + 2);
        g.fillStyle(0x2D6CDF, 1); g.fillCircle(tx, ty, lat);
      }
      if (n.decoRomp) {
        g.fillStyle(0xB0703F, 1);
        for (const k in n.decoRomp) { if (n.rotos.has(k)) continue; const rb = n.decoRomp[k].rb; g.fillRect(mx + rb.c * s, my + rb.r * s, Math.max(1.5, s), Math.max(1.5, s)); }
      }
      if (n.subida) {
        for (const q of n.compuertas) if (q.abierta) { g.fillStyle(0x5BC453, 1); g.fillRect(mx + q.c1 * s, my + q.r * s, (q.c2 - q.c1 + 1) * s, Math.max(2, s)); }
        if (n.jetItem) { g.fillStyle(0xFF8A00, 1); g.fillCircle(mx + (n.jetItem.x / T) * s, my + (n.jetItem.y / T) * s, 3.5); }
        if (n.meta) { g.fillStyle(0xFFFFFF, 1); g.fillRect(mx + (n.meta.x / T) * s - 4, my + (n.meta.y / T) * s - 4, 8, 8); g.fillStyle(0x2E8B3E, 1); g.fillRect(mx + (n.meta.x / T) * s - 2.5, my + (n.meta.y / T) * s - 2.5, 5, 5); }
      }
      if (n.libro) { g.fillStyle(0xB98CF5, 1); g.fillCircle(mx + (n.libro.x / T) * s, my + (n.libro.y / T) * s, 3); }
      const v = n.cameras.main.worldView;
      g.lineStyle(1.5, 0xFFFFFF, 0.85);
      g.strokeRect(mx + (v.x / T) * s, my + (v.y / T) * s, (v.width / T) * s, (v.height / T) * s);
      const px = mx + (b.center.x / T) * s, py = my + (b.center.y / T) * s;
      const parp = (this.time.now % 600) < 380;
      g.fillStyle(0x14213D, 1); g.fillCircle(px, py, 5);
      g.fillStyle(parp ? 0xFFFFFF : 0xFF5A6E, 1); g.fillCircle(px, py, 3.5);
    }

    // ---------- avisos ----------
    aviso(txt, tipo) {
      const col = { ok: [0x2E8B3E, 0x5BC453], mal: [0xA8481A, 0xF08A3C], info: [0x2A63A8, 0x4D9BE6], libro: [0x5E3A9E, 0x9B6BDF] }[tipo || 'info'];
      // si es el mismo texto que el último, sólo lo refresca
      const ult = this.avisos[this.avisos.length - 1];
      if (ult && ult.txt === txt && ult.c.active) {
        this.tweens.killTweensOf(ult.c);
        ult.c.setAlpha(1).setScale(1);
        this.tweens.add({ targets: ult.c, scale: 1.08, duration: 90, yoyo: true });
        this.tweens.add({ targets: ult.c, alpha: 0, delay: 1900, duration: 300, onComplete: () => this.quitarAviso(ult) });
        return;
      }
      while (this.avisos.length >= 2) this.quitarAviso(this.avisos[0], true);
      const c = this.add.container(0, 0);
      const t = M.texto(this, 0, -2, txt, { size: 28, color: '#FFFFFF', stroke: M.hex(col[0]), strokeW: 5, max: this.bTact ? 560 : 900 });
      const w = t.displayWidth + 56;
      const g = this.add.graphics();
      M.panel(g, -w / 2, -28, w, 56, { borde: col[0], fondo: col[1], r: 28, grosor: 4 });
      c.add([g, t]);
      if (tipo === 'libro') { const li = this.add.image(-w / 2 - 6, -2, 'm_libro').setScale(0.75); c.add(li); }
      this.capaAvisos.add(c);
      const it = { c, txt };
      this.avisos.push(it);
      this.colocarAvisos();
      c.setScale(0.5).setAlpha(0);
      this.tweens.add({ targets: c, scale: 1, alpha: 1, duration: 200, ease: 'Back.out' });
      this.tweens.add({ targets: c, alpha: 0, delay: 2100, duration: 300, onComplete: () => this.quitarAviso(it) });
    }
    quitarAviso(it, ya) {
      const i = this.avisos.indexOf(it);
      if (i >= 0) this.avisos.splice(i, 1);
      if (it.c.active) it.c.destroy();
      if (!ya) this.colocarAvisos();
    }
    colocarAvisos() {
      const n = this.avisos.length;
      const base = M.ALTO - (this.nivel.abierta >= 0 ? 116 : 52);
      this.capaAvisos.y = 0;
      this.avisos.forEach((a, i) => { a.c.y = base - (n - 1 - i) * 64; });
    }

    intro() {
      const n = this.nivel;
      const c = this.add.container(M.ANCHO / 2, M.ALTO / 2 - 40);
      const t1 = M.texto(this, 0, -40, n.mundo.nombre || n.mundo.id, { size: 54, color: '#FFFFFF', stroke: '#24386E', strokeW: 12, sombra: true });
      const t2 = M.texto(this, 0, 18, `Nivel ${n.nIdx + 1} · ${n.def.nombre || ''}`, { size: 32, color: '#FFFFFF', stroke: '#24386E', strokeW: 8 });
      const t3 = M.texto(this, 0, 66, 'Abre las cajas y lleva cada palabra a su respuesta', { size: 24, color: '#FFFFFF', stroke: '#24386E', strokeW: 6, fuente: 'n' });
      c.add([t1, t2, t3]);
      c.setAlpha(0).setScale(0.8);
      this.tweens.add({ targets: c, alpha: 1, scale: 1, duration: 350, ease: 'Back.out' });
      this.tweens.add({ targets: c, alpha: 0, y: c.y - 30, delay: 2300, duration: 400, onComplete: () => c.destroy() });
    }

    libroGrande() {
      const c = this.add.container(M.ANCHO / 2, M.ALTO / 2 - 20).setDepth(50);
      const g = this.add.graphics();
      M.panel(g, -330, -110, 660, 220, { borde: 0x5E3A9E, fondo: 0xF4ECFF, r: 30, grosor: 6 });
      c.add(g);
      [-1, 0, 1].forEach((k, i) => {
        const li = this.add.image(k * 80 - 90, -38, 'm_libro').setScale(0);
        c.add(li);
        this.tweens.add({ targets: li, scale: 1, delay: 120 + i * 140, duration: 260, ease: 'Back.out' });
      });
      const cor = this.add.image(190, -38, 'tiles', 'hud_heart').setScale(0);
      c.add(cor);
      this.tweens.add({ targets: cor, scale: 1.3, delay: 600, duration: 320, ease: 'Back.out' });
      c.add(M.texto(this, 92, -38, '=', { size: 54, color: '#5E3A9E' }));
      c.add(M.texto(this, 0, 52, '¡Juntaste 3 libros! +1 vida', { size: 40, color: '#5E3A9E' }));
      c.setScale(0.6).setAlpha(0);
      this.tweens.add({ targets: c, scale: 1, alpha: 1, duration: 300, ease: 'Back.out' });
      this.tweens.add({ targets: c, alpha: 0, delay: 2600, duration: 400, onComplete: () => c.destroy() });
      const em = this.add.particles(M.ANCHO / 2 + 190, M.ALTO / 2 - 58, 'm_corazon', {
        emitting: false, lifespan: 900, speed: { min: 120, max: 300 }, scale: { start: 0.9, end: 0 }, gravityY: 300,
      }).setDepth(51);
      this.time.delayedCall(650, () => em.explode(14));
      this.time.delayedCall(2000, () => em.destroy());
    }

    // ---------- paneles ----------
    abrirModal(construir, opciones) {
      this.cerrarModal(false);
      const W = M.ANCHO, H = M.ALTO;
      const c = this.add.container(0, 0).setDepth(100);
      const velo = this.add.rectangle(W / 2, H / 2, W, H, 0x0B1530, 0.62).setInteractive();
      c.add(velo);
      const nav = new M.Nav(this);
      this.modal = { c, nav, tipo: (opciones && opciones.tipo) || '' };
      const items = construir(c, nav) || [];
      nav.poner(items.lista || items, items.inicial);
      c.setAlpha(0);
      this.tweens.add({ targets: c, alpha: 1, duration: 200 });
      M.tactil = { izq: false, der: false, salto: false };
    }
    cerrarModal(reanudar) {
      if (!this.modal) return;
      this.modal.nav.destruir();
      this.modal.c.destroy();
      this.modal = null;
      if (reanudar) this.nivel.scene.resume();
    }
    marco(c, w, h, titulo, colTit) {
      const W = M.ANCHO, H = M.ALTO;
      const x = W / 2 - w / 2, y = H / 2 - h / 2;
      const g = this.add.graphics();
      M.panel(g, x, y, w, h, { borde: 0x24386E, fondo: 0xFFFFFF, r: 30, grosor: 6 });
      c.add(g);
      if (titulo) c.add(M.texto(this, W / 2, y + 52, titulo, { size: 48, color: colTit || '#24386E' }));
      return { x, y, g };
    }

    alternarPausa() {
      if (!this.listo) return;
      if (this.modal) { if (this.modal.tipo === 'pausa') this.cerrarModal(true); return; }
      if (this.nivel.fin || this.nivel.bloqueo) return;
      this.nivel.scene.pause();
      this.abrirModal((c, nav) => {
        const W = M.ANCHO;
        const m = this.marco(c, 560, 470, 'Pausa');
        const b1 = M.boton(this, W / 2, m.y + 150, 340, 64, 'Continuar', { color: 'verde', nav, onClick: () => this.cerrarModal(true) });
        const b2 = M.boton(this, W / 2, m.y + 234, 340, 64, 'Reiniciar nivel', { color: 'azul', nav, onClick: () => { this.cerrarModal(false); this.nivel.reiniciar(); } });
        const b3 = M.boton(this, W / 2, m.y + 318, 340, 64, 'Volver a los mundos', { color: 'gris', nav, onClick: () => { this.cerrarModal(false); this.nivel.salir(); } });
        c.add([b1, b2, b3]);
        c.add(M.texto(this, W / 2, m.y + 410, 'Flechas: andar · Espacio: saltar · X: pincel · Shift: barrido', { size: 19, color: '#6B7488', fuente: 'n' }));
        return [b1, b2, b3];
      }, { tipo: 'pausa' });
    }

    // Selector tras perder una vida con una caja abierta.
    selector(prev) {
      const n = this.nivel;
      this.abrirModal((c, nav) => {
        const W = M.ANCHO;
        const pw = 1000, ph = 640;
        const m = this.marco(c, pw, ph, null);
        c.add(M.texto(this, W / 2, m.y + 48, '¡Ups! Perdiste una vida', { size: 46, color: '#C2571A' }));
        c.add(M.texto(this, W / 2, m.y + 96, '¿Qué caja quieres resolver ahora?', { size: 28, color: '#24386E', fuente: 'n' }));
        // minimapa grande
        const p = n.p;
        const s = Math.min(560 / p.W, 150 / p.H);
        const mw = p.W * s, mh = p.H * s, mx = W / 2 - mw / 2, my = m.y + 128;
        const gm = this.add.graphics();
        gm.fillStyle(Phaser.Display.Color.HexStringToColor(n.mundo.colorCielo || '#BFE6FF').color, 1);
        gm.fillRoundedRect(mx - 8, my - 8, mw + 16, mh + 16, 10);
        M.dibujarMapa(gm, p, mx, my, s, n.mundo.terreno);
        c.add(gm);
        const gSel = this.add.graphics();
        c.add(gSel);
        const marcas = n.cajas.map(cj => {
          const x = mx + (cj.c + 0.5) * s, y = my + (cj.r + 0.5) * s;
          const k = this.add.container(x, y);
          const gg = this.add.graphics();
          const ok = cj.estado === 'resuelta';
          gg.fillStyle(0x14213D, 1); gg.fillCircle(0, 0, 12);
          gg.fillStyle(ok ? 0x3DBB4E : 0xFFD23D, 1); gg.fillCircle(0, 0, 9.5);
          k.add([gg, M.texto(this, 0, -1, String(cj.i + 1), { size: 14, color: ok ? '#FFFFFF' : '#5A3A00' })]);
          c.add(k);
          return { x, y };
        });
        // botones de cajas sin resolver
        const pend = n.cajas.filter(cj => cj.estado !== 'resuelta');
        const bw = 208, bh = 84, gap = 16, porFila = 4;
        const filas = Math.ceil(pend.length / porFila);
        const items = [];
        let sel = pend.find(cj => cj.i === prev) || pend[0];
        const irB = M.boton(this, W / 2, m.y + ph - 50, 340, 62, '', { color: 'verde', size: 28, nav, onClick: () => this.irACaja(sel.i) });
        const marcar = () => {
          gSel.clear();
          const mk = marcas[sel.i];
          gSel.lineStyle(4, 0xFF5A6E, 1); gSel.strokeCircle(mk.x, mk.y, 17);
          irB.etiqueta.setText(`Ir a la caja ${sel.i + 1}`);
        };
        pend.forEach((cj, k) => {
          const fila = Math.floor(k / porFila), enFila = Math.min(porFila, pend.length - fila * porFila);
          const col = k % porFila;
          const x = W / 2 + (col - (enFila - 1) / 2) * (bw + gap);
          const y = m.y + 330 + fila * (bh + gap) - (filas > 1 ? 0 : -40);
          const b = M.boton(this, x, y, bw, bh, `Caja ${cj.i + 1}`, { color: 'blanco', size: 28, nav, onClick: () => this.irACaja(cj.i) });
          b.etiqueta.setY(-16);
          b.add(M.texto(this, 0, 18, M.zona(p, cj.r, cj.c), { size: 17, color: '#55607A', fuente: 'n', max: bw - 16 }));
          b.caja = cj;
          c.add(b);
          items.push(b);
        });
        // chips de resueltas
        const hechas = n.cajas.filter(cj => cj.estado === 'resuelta');
        if (hechas.length) {
          const yC = m.y + ph - 122;
          const chips = hechas.map(cj => {
            const k = this.add.container(0, yC);
            const t = M.texto(this, 12, -1, `${cj.i + 1} ${cj.palabra}`, { size: 18, color: '#1C5A27', max: 150 });
            const w = t.displayWidth + 48;
            const gg = this.add.graphics();
            gg.fillStyle(0x2E8B3E, 1); gg.fillRoundedRect(-w / 2, -17, w, 34, 17);
            gg.fillStyle(0xDDF6D6, 1); gg.fillRoundedRect(-w / 2 + 3, -14, w - 6, 28, 14);
            const ck = this.add.image(-w / 2 + 18, 0, 'm_check').setScale(0.48);
            t.setX(12);
            k.add([gg, t, ck]);
            k.w = w;
            c.add(k);
            return k;
          });
          const total = chips.reduce((a, k) => a + k.w + 10, -10);
          let x = W / 2 - total / 2;
          chips.forEach(k => { k.x = x + k.w / 2; x += k.w + 10; });
        }
        c.add(irB);
        items.push(irB);
        nav.alEnfocar = it => { if (it && it.caja) { sel = it.caja; marcar(); } };
        marcar();
        return { lista: items, inicial: items.find(b => b.caja === sel) };
      }, { tipo: 'selector' });
    }

    irACaja(i) {
      this.cerrarModal(false);
      this.nivel.irACaja(i);
    }

    sinVidas(resueltas) {
      const n = this.nivel;
      this.abrirModal((c, nav) => {
        const W = M.ANCHO;
        const m = this.marco(c, 720, 500, 'Se acabaron las vidas', '#C2571A');
        const pj = this.add.image(W / 2, m.y + 168, 'personajes', `character_${n.color}_hit`).setScale(0.9);
        this.tweens.add({ targets: pj, angle: { from: -6, to: 6 }, duration: 600, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
        c.add(pj);
        c.add(M.texto(this, W / 2, m.y + 262, `Resolviste ${resueltas} de ${n.cajas.length} cajas.`, { size: 30, color: '#24386E' }));
        c.add(M.texto(this, W / 2, m.y + 304, '¡Casi! Las cajas se cierran y puedes intentarlo otra vez.', { size: 21, color: '#55607A', fuente: 'n' }));
        const b1 = M.boton(this, W / 2 - 165, m.y + 410, 300, 66, 'Intentar otra vez', { color: 'verde', nav, onClick: () => { this.cerrarModal(false); n.reiniciar(); } });
        const b2 = M.boton(this, W / 2 + 165, m.y + 410, 300, 66, 'Elegir otro mundo', { color: 'azul', nav, onClick: () => { this.cerrarModal(false); n.salir(); } });
        c.add([b1, b2]);
        return [b1, b2];
      }, { tipo: 'fin' });
    }

    completado(info) {
      const n = this.nivel;
      const W = M.ANCHO, H = M.ALTO;
      const conf = this.add.particles(0, -20, 'm_confeti', {
        x: { min: 0, max: W }, lifespan: 3200, speedY: { min: 160, max: 320 }, speedX: { min: -60, max: 60 },
        rotate: { start: 0, end: 540 }, scale: { min: 0.8, max: 1.4 }, frequency: 25, quantity: 2,
        tint: [0xFF5A6E, 0xFFC23D, 0x5BC453, 0x4D9BE6, 0x9B6BDF, 0xFFFFFF],
      }).setDepth(200);
      this.time.delayedCall(2600, () => conf.stop());
      this.time.delayedCall(6500, () => conf.destroy());
      this.abrirModal((c, nav) => {
        const pw = 960, ph = 640;
        const m = this.marco(c, pw, ph, null);
        c.add(M.texto(this, W / 2, m.y + 50, '¡Nivel completado!', { size: 52, color: '#2E8B3E' }));
        for (let k = 0; k < 3; k++) {
          const st = this.add.image(W / 2 + (k - 1) * 84, m.y + 124, 'tiles', 'star').setScale(0);
          const gana = k < info.estrellas;
          if (!gana) st.setTint(0x4A5268).setAlpha(0.35);
          c.add(st);
          this.tweens.add({
            targets: st, scale: k === 1 ? 1.25 : 1.05, delay: 250 + k * 260, duration: 300, ease: 'Back.out',
            onStart: () => { if (gana) M.sonar(this, 'sfx_coin', { rate: 1 + k * 0.12 }); },
          });
        }
        // pares palabra → respuesta
        n.cajas.forEach((cj, i) => {
          const col = i % 2, fila = Math.floor(i / 2);
          const x = W / 2 + (col ? 30 : -420), y = m.y + 206 + fila * 58;
          const gg = this.add.graphics();
          gg.fillStyle(0xDDF6D6, 1); gg.fillRoundedRect(x, y - 23, 390, 46, 14);
          c.add(gg);
          c.add(this.add.image(x + 24, y, 'm_check').setScale(0.55));
          const ico = M.icono(this, cj.respuesta);
          if (ico) { const im = this.add.image(x + 362, y, ico); im.setScale(36 / Math.max(im.width, im.height)); c.add(im); }
          c.add(M.texto(this, x + 48, y - 1, `${cj.palabra}  →  ${cj.respuesta}`, { size: 24, color: '#1C5A27', ox: 0, max: ico ? 290 : 330 }));
        });
        const lib = M.librosMundo(n.mundo);
        if (lib.total) {
          c.add(this.add.image(W / 2 - 150, m.y + 448, 'm_libro').setScale(0.55));
          c.add(M.texto(this, W / 2 + 14, m.y + 448, `Libros de este mundo: ${lib.tomados}/${lib.total}`, { size: 24, color: '#5E3A9E' }));
        }
        const items = [];
        const sig = info.siguiente;
        if (sig) {
          const b1 = M.boton(this, W / 2 - 170, m.y + ph - 62, 310, 66, sig.etiqueta, { color: 'verde', nav, onClick: () => { this.cerrarModal(false); n.irA({ mundo: sig.mundo, nivel: sig.nivel }); } });
          c.add(b1); items.push(b1);
        }
        const b2 = M.boton(this, sig ? W / 2 + 170 : W / 2, m.y + ph - 62, 310, 66, 'Volver a los mundos', { color: 'azul', nav, onClick: () => { this.cerrarModal(false); n.salir(); } });
        c.add(b2); items.push(b2);
        return items;
      }, { tipo: 'fin' });
      void H;
    }
  }

  M.HUD = HUD;
})();
