// Cajas de Palabras — escenas de carga y menú.
(function () {
  'use strict';
  const M = CAJAS.M;

  class Carga extends Phaser.Scene {
    constructor() { super('Carga'); }
    preload() {
      const W = M.ANCHO, H = M.ALTO;
      this.cameras.main.setBackgroundColor('#14213D');
      M.texto(this, W / 2, H / 2 - 90, 'Cajas de Palabras', { size: 72, color: '#FFFFFF', stroke: '#2B3F75', strokeW: 12 });
      const msg = M.texto(this, W / 2, H / 2 + 70, 'Preparando los mundos…', { size: 24, color: '#BFD3FF', fuente: 'n' });
      const bw = 520, bh = 34, bx = W / 2 - bw / 2, by = H / 2 + 6;
      const marco = this.add.graphics();
      marco.fillStyle(0x0B1530, 1); marco.fillRoundedRect(bx - 6, by - 6, bw + 12, bh + 12, 22);
      marco.fillStyle(0x24345E, 1); marco.fillRoundedRect(bx, by, bw, bh, 17);
      const barra = this.add.graphics();
      this.load.on('progress', p => {
        barra.clear();
        const w = Math.max(bh, bw * p);
        barra.fillStyle(0xE89A1A, 1); barra.fillRoundedRect(bx, by, w, bh, 17);
        barra.fillStyle(0xFFC23D, 1); barra.fillRoundedRect(bx, by, w, bh - 7, 17);
        barra.fillStyle(0xFFFFFF, 0.35); barra.fillRoundedRect(bx + 10, by + 5, w - 20, 7, 4);
        msg.setText('Preparando los mundos… ' + Math.round(p * 100) + ' %');
      });
      this.load.on('loaderror', f => console.warn('[cajas] no se pudo cargar', f && f.key));
      this.load.setPath('assets/');
      this.load.atlasXML('tiles', 'spritesheet-tiles-default.png', 'spritesheet-tiles-default.xml');
      this.load.atlasXML('personajes', 'spritesheet-characters-default.png', 'spritesheet-characters-default.xml');
      this.load.atlasXML('enemigos', 'spritesheet-enemies-default.png', 'spritesheet-enemies-default.xml');
      this.load.atlasXML('fondos', 'spritesheet-backgrounds-default.png', 'spritesheet-backgrounds-default.xml');
      this.load.atlasXML('peces', 'peces.png', 'peces.xml');
      this.load.image('pinguino', 'extra/pinguino.png');
      ['0', '3', '6', '9'].forEach(n => this.load.image('planeta' + n, 'extra/planet0' + n + '.png'));
      ['jump', 'jump-high', 'coin', 'gem', 'hurt', 'magic', 'select', 'bump', 'disappear', 'throw']
        .forEach(s => this.load.audio('sfx_' + s, 'sonidos/sfx_' + s + '.ogg'));
    }
    create() {
      M.texturasMotor(this);
      M.tilesExtruidos(this);
      M.animacionesJugador(this);
      // las texturas propias de cada mundo se generan al entrar a él (Nivel.create)
      M.prepararMundos();
      if (!M.mundos().length) console.warn('[cajas] no hay mundos registrados');
      this.scene.start('Menu');
    }
  }

  // ---------- menú ----------
  class Menu extends Phaser.Scene {
    constructor() { super('Menu'); }

    create() {
      const W = M.ANCHO, H = M.ALTO;
      this.cameras.main.fadeIn(350, 20, 33, 61);
      const cielo = this.add.graphics();
      cielo.fillGradientStyle(0x6EC3F5, 0x6EC3F5, 0xD4F1FF, 0xD4F1FF, 1);
      cielo.fillRect(0, 0, W, H);
      this.nubes = this.add.tileSprite(W / 2, 150, W, 256, 'fondos', 'background_clouds').setAlpha(0.9);
      this.colinas = this.add.tileSprite(W / 2, H - 128, W, 256, 'fondos', 'background_color_hills');
      const sombra = this.add.graphics();
      sombra.fillGradientStyle(0x14213D, 0x14213D, 0x14213D, 0x14213D, 0, 0, 0.35, 0.35);
      sombra.fillRect(0, H - 300, W, 300);

      // título
      const tit = M.texto(this, W / 2, 74, 'Cajas de Palabras', { size: 88, color: '#FFFFFF', stroke: '#24386E', strokeW: 14, sombra: true });
      [-1, 1].forEach((s, i) => {
        const b = this.add.image(W / 2 + s * (tit.width / 2 + 62), 80, 'tiles', 'block_exclamation').setScale(0.95);
        this.tweens.add({ targets: b, y: 66, angle: s * 8, duration: 900 + i * 120, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
      });
      M.texto(this, W / 2, 140, 'Abre cada caja y busca su respuesta por el mundo', { size: 24, color: '#1D2B53', fuente: 'n' });

      this.nav = new M.Nav(this);
      this.crearPersonajes();
      this.crearMundos();
      this.crearPie();
      this.navPrincipal();

      this.input.keyboard.on('keydown-D', () => { if (!this.panelNivel) this.alternarProfe(); });
      this.input.keyboard.on('keydown-ESC', () => { if (this.panelNivel) this.cerrarNiveles(); });
      this.aviso = null;
    }

    update(_t, dt) {
      this.nubes.tilePositionX += dt * 0.012;
      this.colinas.tilePositionX += dt * 0.02;
    }

    crearPersonajes() {
      const W = M.ANCHO;
      M.texto(this, W / 2, 188, 'Elige tu personaje', { size: 24, color: '#1D2B53' });
      this.personajes = M.COLORES.map((col, i) => {
        const x = W / 2 + (i - 2) * 112, y = 262;
        const c = this.add.container(x, y);
        const g = this.add.graphics();
        const spr = this.add.sprite(0, -6, 'personajes', `character_${col}_idle`).setScale(0.62);
        spr.play({ key: `p_${col}_menu`, startFrame: i % 4 });
        this.tweens.add({ targets: spr, y: -12, duration: 700 + i * 60, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
        c.add([g, spr]);
        c.setSize(100, 110);
        c.setInteractive({ useHandCursor: true });
        let foco = false;
        c.dib = () => {
          g.clear();
          const sel = M.estado.personaje === col;
          g.fillStyle(0x14213D, 0.18); g.fillEllipse(0, 44, 70, 16);
          if (sel) { g.fillStyle(0xFFC23D, 1); g.fillCircle(0, -4, 54); g.fillStyle(0xFFF2C2, 1); g.fillCircle(0, -4, 48); }
          else { g.fillStyle(0xFFFFFF, 0.55); g.fillCircle(0, -4, 46); }
          if (foco) { g.lineStyle(5, 0x14213D, 1); g.strokeCircle(0, -4, sel ? 58 : 50); }
          spr.setScale(sel ? 0.72 : 0.6);
        };
        c.setFoco = b => { foco = b; c.dib(); };
        c.activar = () => {
          M.estado.personaje = col; M.guardar();
          M.sonar(this, 'sfx_jump');
          this.personajes.forEach(p => p.dib());
          this.tweens.add({ targets: spr, y: -40, duration: 180, yoyo: true, ease: 'Quad.out' });
        };
        c.on('pointerover', () => this.nav.enfocar(c));
        c.on('pointerup', () => c.activar());
        c.dib();
        return c;
      });
    }

    crearMundos() {
      const W = M.ANCHO;
      const lista = M.mundos();
      const gap = 16, cw = Math.min(226, Math.floor((W - 48 - (lista.length - 1) * gap) / lista.length)), ch = 262;
      const total = lista.length * cw + (lista.length - 1) * gap;
      this.tarjetas = lista.map((m, i) => this.tarjetaMundo(m, W / 2 - total / 2 + cw / 2 + i * (cw + gap), 478, cw, ch));
      if (!lista.length) M.texto(this, W / 2, 470, 'Todavía no hay mundos', { size: 30, color: '#1D2B53' });
    }

    tarjetaMundo(m, x, y, w, h) {
      const c = this.add.container(x, y);
      const g = this.add.graphics();
      c.add(g);
      const abierto = M.mundoDesbloqueado(m);
      const completo = M.mundoCompleto(m);
      const hechos = M.nivelesHechos(m), nN = m.niveles.length;
      const cielo = Phaser.Display.Color.HexStringToColor(m.colorCielo || '#BFE6FF').color;
      const topH = 138;
      let foco = false;
      const dib = () => {
        g.clear();
        if (foco) { g.fillStyle(0xFFC23D, 1); g.fillRoundedRect(-w / 2 - 7, -h / 2 - 7, w + 14, h + 14, 26); }
        M.panel(g, -w / 2, -h / 2, w, h, { borde: 0x24386E, fondo: 0xFFFFFF, r: 22, grosor: 5 });
        g.fillStyle(cielo, 1);
        g.fillRoundedRect(-w / 2 + 5, -h / 2 + 5, w - 10, topH, { tl: 17, tr: 17, bl: 0, br: 0 });
      };
      dib();
      // franja de terreno
      const t = m.terreno || 'grass';
      const n = 7, ts = 32, y0 = -h / 2 + 5 + topH - ts;
      for (let i = 0; i < n; i++) {
        const fr = i === 0 ? 'block_top_left' : i === n - 1 ? 'block_top_right' : 'block_top';
        const im = this.add.image(-((n - 1) * ts) / 2 + i * ts, y0 + ts / 2, 'tiles', `terrain_${t}_${fr}`).setScale(0.5);
        c.add(im);
      }
      // un enemigo del mundo como muestra
      try {
        // sólo arte Kenney: las texturas propias del mundo aún no existen en el menú
        const e = Object.values(m.enemigos || {}).find(x => x && x.sprite && x.sprite.atlas && this.textures.exists(x.sprite.atlas)
          && this.textures.get(x.sprite.atlas).has((x.sprite.frames || [])[0]));
        if (e) {
          const im = this.add.image(0, 0, e.sprite.atlas, e.sprite.frames[0]);
          if (im) {
            const s = Math.min(54 / im.width, 54 / im.height);
            im.setScale(s).setOrigin(0.5, 1).setPosition(52, y0 + 2);
            if (e.tinte != null) im.setTint(e.tinte);
            c.add(im);
            this.tweens.add({ targets: im, y: y0 - 4, duration: 800, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
          }
        }
      } catch (err) { /* sin muestra */ }
      const pj = this.add.image(-50, y0 + 2, 'personajes', `character_${M.estado.personaje}_idle`).setScale(0.42).setOrigin(0.5, 0.97);
      c.add(pj);
      this.personajesTarjeta = this.personajesTarjeta || [];
      this.personajesTarjeta.push(pj);
      // número
      const badge = this.add.graphics();
      badge.fillStyle(0x24386E, 1); badge.fillCircle(-w / 2 + 26, -h / 2 + 26, 17);
      badge.fillStyle(0xFFFFFF, 1); badge.fillCircle(-w / 2 + 26, -h / 2 + 26, 13);
      c.add(badge);
      c.add(M.texto(this, -w / 2 + 26, -h / 2 + 25, String(m.orden || ''), { size: 20, color: '#24386E' }));
      // nombre y estado
      c.add(M.texto(this, 0, -h / 2 + topH + 30, m.nombre || m.id, { size: 25, color: '#1D2B53', max: w - 24 }));
      const ye = -h / 2 + topH + 72;
      if (!abierto) {
        c.add(this.add.image(-66, ye, 'tiles', 'lock_yellow').setScale(0.45));
        c.add(M.texto(this, 16, ye, 'Bloqueado', { size: 22, color: '#6B7488' }));
        const capa = this.add.graphics();
        capa.fillStyle(0x14213D, 0.5);
        capa.fillRoundedRect(-w / 2 + 5, -h / 2 + 5, w - 10, topH, { tl: 17, tr: 17, bl: 0, br: 0 });
        c.add(capa);
        c.add(this.add.image(0, -h / 2 + 5 + topH / 2, 'tiles', 'lock_yellow').setScale(1));
      } else if (completo) {
        c.add(this.add.image(-70, ye, 'tiles', 'star').setScale(0.55));
        c.add(M.texto(this, 10, ye, '¡Completado!', { size: 22, color: '#2E8B3E' }));
      } else {
        for (let i = 0; i < nN; i++) {
          const ok = M.hecho(m, i);
          const im = ok ? this.add.image(-74 + i * 26, ye, 'm_check').setScale(0.55) : this.add.circle(-74 + i * 26, ye, 10, 0xDDE3EC).setStrokeStyle(3, 0xB4BECD);
          c.add(im);
        }
        c.add(M.texto(this, 24, ye, `Niveles ${hechos}/${nN}`, { size: 22, color: '#1D2B53' }));
      }
      const lib = M.librosMundo(m);
      if (lib.total) {
        c.add(this.add.image(-22, ye + 34, 'm_libro').setScale(0.36));
        c.add(M.texto(this, 18, ye + 34, `${lib.tomados}/${lib.total}`, { size: 18, color: '#6B3DBA' }));
      }
      c.setSize(w, h);
      c.setInteractive({ useHandCursor: true });
      c.setFoco = b => {
        foco = b; dib();
        this.tweens.add({ targets: c, scale: b ? 1.04 : 1, duration: 120, ease: 'Quad.out' });
      };
      c.activar = () => {
        if (!M.mundoDesbloqueado(m)) {
          M.sonar(this, 'sfx_bump');
          this.tweens.add({ targets: c, x: x + 8, duration: 50, yoyo: true, repeat: 3 });
          this.avisar('Termina los niveles del mundo anterior para abrir este');
          return;
        }
        M.sonar(this, 'sfx_select');
        this.abrirNiveles(m);
      };
      c.on('pointerover', () => this.nav.enfocar(c));
      c.on('pointerup', () => { if (!this.panelNivel) c.activar(); });
      c.mundo = m;
      return c;
    }

    crearPie() {
      const W = M.ANCHO, H = M.ALTO;
      const g = this.add.graphics();
      M.panel(g, W / 2 - 230, H - 62, 460, 48, { fondo: 0x14213D, alpha: 0.75, r: 24, sombra: false });
      this.add.image(W / 2 - 196, H - 38, 'm_libro').setScale(0.5);
      const n = M.estado.libros;
      M.texto(this, W / 2 + 16, H - 39, `${n} de 3 libros · 3 = una vida`, { size: 24, color: '#FFFFFF' });
      this.botonProfe = M.boton(this, W - 130, H - 38, 216, 44, M.estado.abrirTodo ? 'Profe: cerrar' : 'Profe: abrir todos', {
        color: 'gris', size: 19, nav: this.nav, onClick: () => this.alternarProfe(),
      });
      this.botonProfe.setAlpha(0.85);
      // Ya no hay botón de profe: los docentes llegan con todo abierto (?docente=1) y un estudiante no debe abrirlo.
      this.botonProfe.setVisible(false);
      if (window.parent !== window) {
        // Dentro de app2 (/juegos): volver a la portada de juegos.
        this.botonVolver = M.boton(this, 120, H - 38, 200, 44, '← Juegos', {
          color: 'gris', size: 19, nav: this.nav, onClick: () => window.parent.postMessage({ tipo: 'juegos3d:volver' }, location.origin),
        });
      } else {
        M.texto(this, 24, H - 38, 'Flechas y Enter, o toca', { size: 17, color: '#FFFFFF', fuente: 'n', ox: 0 }).setAlpha(0.8);
      }
      M.texto(this, W - 20, H - 12, 'Iconos: Twemoji (CC-BY 4.0) · Arte: Kenney (CC0)', { size: 13, color: '#FFFFFF', fuente: 'n', ox: 1 }).setAlpha(0.75);
    }

    alternarProfe() {
      M.estado.abrirTodo = !M.estado.abrirTodo;
      M.guardar();
      this.scene.restart();
    }

    navPrincipal() {
      const items = [...this.personajes, ...this.tarjetas, this.botonVolver || null];
      const ini = this.tarjetas.find(t => M.mundoDesbloqueado(t.mundo) && !M.mundoCompleto(t.mundo)) || this.tarjetas[0];
      this.nav.poner(items, ini);
    }

    avisar(txt) {
      if (this.aviso) this.aviso.destroy();
      const c = this.add.container(M.ANCHO / 2, 330).setDepth(50);
      const t = M.texto(this, 0, 0, txt, { size: 24, color: '#FFFFFF' });
      const g = this.add.graphics();
      M.panel(g, -t.width / 2 - 24, -26, t.width + 48, 52, { fondo: 0xC2571A, r: 26, sombra: true });
      c.add([g, t]);
      c.setAlpha(0);
      this.tweens.add({ targets: c, alpha: 1, y: 320, duration: 160 });
      this.tweens.add({ targets: c, alpha: 0, delay: 2200, duration: 300, onComplete: () => c.destroy() });
      this.aviso = c;
    }

    abrirNiveles(m) {
      const W = M.ANCHO, H = M.ALTO;
      const c = this.add.container(0, 0).setDepth(100);
      this.panelNivel = c;
      const velo = this.add.rectangle(W / 2, H / 2, W, H, 0x0B1530, 0.65).setInteractive();
      c.add(velo);
      const pw = 880, ph = 520, px = W / 2 - pw / 2, py = H / 2 - ph / 2 + 10;
      const g = this.add.graphics();
      M.panel(g, px, py, pw, ph, { borde: 0x24386E, fondo: 0xFFFFFF, r: 28, grosor: 6 });
      const cielo = Phaser.Display.Color.HexStringToColor(m.colorCielo || '#BFE6FF').color;
      g.fillStyle(cielo, 1); g.fillRoundedRect(px + 6, py + 6, pw - 12, 84, { tl: 22, tr: 22, bl: 0, br: 0 });
      c.add(g);
      c.add(M.texto(this, W / 2, py + 48, m.nombre || m.id, { size: 42, color: '#FFFFFF', stroke: '#24386E', strokeW: 10 }));
      const nav = new M.Nav(this);
      this.nav.activo = false;
      this.navNiveles = nav;
      const items = [];
      const n = m.niveles.length;
      const cw = 390, chh = 330, gap = 30;
      m.niveles.forEach((nv, i) => {
        const cx = W / 2 + (i - (n - 1) / 2) * (cw + gap), cy = py + 110 + chh / 2;
        const p = m._niveles[i];
        const abierto = M.nivelDesbloqueado(m, i) && p.valido;
        const gg = this.add.graphics();
        M.panel(gg, cx - cw / 2, cy - chh / 2, cw, chh, { borde: 0xD5DCE8, fondo: 0xF5F8FC, r: 20, grosor: 4, sombra: false });
        c.add(gg);
        // miniatura del mapa
        const tw = cw - 36, th = 150;
        const s = Math.min(tw / p.W, th / p.H);
        const mx = cx - (p.W * s) / 2, my = cy - chh / 2 + 18 + (th - p.H * s) / 2;
        gg.fillStyle(cielo, 1); gg.fillRoundedRect(cx - tw / 2, cy - chh / 2 + 18, tw, th, 10);
        M.dibujarMapa(gg, p, mx, my, s, m.terreno);
        p.cajas.forEach(cj => { gg.fillStyle(0xF5A623, 1); gg.fillRect(mx + cj.c * s - 1, my + cj.r * s - 1, s + 2, s + 2); });
        c.add(M.texto(this, cx, cy + 22, `Nivel ${i + 1} · ${nv.nombre || ''}`, { size: 26, color: '#1D2B53', max: cw - 30 }));
        const est = M.estado.estrellas[M.clave(m, i)] || 0;
        if (M.hecho(m, i)) {
          for (let k = 0; k < 3; k++) {
            const st = this.add.image(cx - 40 + k * 40, cy + 62, 'tiles', 'star').setScale(0.55);
            if (k >= est) st.setTint(0x555E70).setAlpha(0.45);
            c.add(st);
          }
        } else if (abierto) {
          c.add(M.texto(this, cx, cy + 62, 'Por jugar: 8 cajas', { size: 20, color: '#6B7488', fuente: 'n' }));
        }
        if (p.libro) {
          const tom = !!M.estado.librosTomados[M.clave(m, i)];
          const li = this.add.image(cx + cw / 2 - 34, cy - chh / 2 + 40, 'm_libro').setScale(0.5);
          if (!tom) li.setTint(0x8892A6).setAlpha(0.7);
          c.add(li);
        }
        if (abierto) {
          const b = M.boton(this, cx, cy + chh / 2 - 44, 200, 58, M.hecho(m, i) ? 'Otra vez' : 'Jugar', {
            color: M.hecho(m, i) ? 'azul' : 'verde', size: 28, nav,
            onClick: () => this.jugar(m, i),
          });
          c.add(b); items.push(b);
        } else {
          c.add(this.add.image(cx - 100, cy + chh / 2 - 44, 'tiles', 'lock_yellow').setScale(0.55));
          c.add(M.texto(this, cx + 18, cy + chh / 2 - 44, p.valido ? `Termina el nivel ${i}` : 'En construcción', { size: 22, color: '#6B7488' }));
        }
      });
      const volver = M.boton(this, W / 2, py + ph - 34, 200, 50, 'Volver', { color: 'gris', size: 24, nav, onClick: () => this.cerrarNiveles() });
      c.add(volver); items.push(volver);
      const sig = m.niveles.findIndex((_n, i) => M.nivelDesbloqueado(m, i) && !M.hecho(m, i));
      nav.poner(items, items[Math.max(0, Math.min(sig, items.length - 2))]);
      c.setAlpha(0);
      this.tweens.add({ targets: c, alpha: 1, duration: 180 });
    }

    cerrarNiveles() {
      if (!this.panelNivel) return;
      this.navNiveles.destruir();
      this.panelNivel.destroy();
      this.panelNivel = null;
      this.nav.activo = true;
      this.nav.desde = this.time.now + 200;
    }

    jugar(m, i) {
      if (this.saliendo) return;
      this.saliendo = true;
      this.cameras.main.fadeOut(300, 20, 33, 61);
      this.cameras.main.once('camerafadeoutcomplete', () => this.scene.start('Nivel', { mundo: m.id, nivel: i }));
    }
  }

  M.Carga = Carga;
  M.Menu = Menu;
})();
