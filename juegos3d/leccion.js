/*
 * EL MODO LECCIÓN DE LOS JUEGOS (Joseth, 31 oct: «desde la lección le pasas al jueguito la configuración; se le da
 * play y ya empieza a jugar con lo de la lección, sin el menú de mundos ni de personaje»).
 *
 * La lección (bloque `juego` de la Biblioteca, FORMATO.md; app2 bloques/juego.ts) abre el juego con
 * `?leccion=<JSON en base64url>`. Este fichero lo lee y deja:
 *   window.LeccionJuego = { activo, cfg, titulo, portada({…, alJugar}), logrado({…, alOtraVez}), cerrar(), preguntas(), oir(texto) }
 * Sin `leccion` en la URL, `activo` es false y el juego sigue como siempre. El contrato del cfg (FORMATO.md, «`juego`»):
 *   { titulo?, palabras?: [{en, es, emoji?}], preguntas?: [{p, opciones: [2..4], correcta, oir?}], dificultad?, voz?, voces? }
 * EL RESULTADO: el juego llama a `progreso(r)` con cada respuesta y a `resultado(r)` al terminar; los dos avisan a la
 * lección (el padre, mismo origen) con postMessage:
 *   { tipo: 'juegos3d:resultado', juego, aciertos, total, fallos, terminado, nivel?, puesto? }
 * (`terminado` false en `progreso`: lo que lleva si sale a medias; true en `resultado`). bloques/juego.ts lo anota.
 * `dificultad`: facil (Transición a 2.º: no se pierde la partida), media (3.º a 5.º: más oportunidades) o normal (6.º en
 * adelante: el juego como es); sin ella, normal. La pone el front según el grado si el bloque no la fija.
 * `cola`: la cola de voz (un MP3 no corta a otro; ver abajo). `preguntas()` da las de la lección: las `preguntas`, o si no las arma con las `palabras` («eight» suena y se elige
 * «ocho»). `oir(texto)` hace sonar el MP3 grabado <voz><carpeta>/<slug>.mp3 (carpeta: voces[slug] o «en»); si no
 * está, silencio: jamás la voz del navegador en inglés (regla de Joseth). Lo escrito sigue en pantalla.
 *
 * Las dos pantallas son HTML encima del juego (no dibujadas en el canvas) para que el lector de pantalla las lea y el
 * teclado llegue: botón con texto, foco visible, contraste AA, nada que dependa sólo del color o del sonido.
 */
(function () {
	'use strict';
	var crudo = new URLSearchParams(location.search).get('leccion');
	var cfg = null;
	if (crudo) {
		try {
			var b = crudo.replace(/-/g, '+').replace(/_/g, '/');
			while (b.length % 4) b += '=';
			var bin = atob(b), bytes = new Uint8Array(bin.length);
			for (var i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
			cfg = JSON.parse(new TextDecoder().decode(bytes));
		} catch (e) { console.warn('[leccion] la configuración no se pudo leer', e); cfg = null; }
		if (!cfg || typeof cfg !== 'object' || Array.isArray(cfg)) cfg = null;
	}

	var CSS = '' +
		'.lj-capa{position:fixed;inset:0;z-index:2147483000;display:grid;place-items:center;padding:16px;background:rgb(10 18 40 / 62%);' +
		'font-family:"Baloo 2","Nunito",system-ui,sans-serif;-webkit-user-select:none;user-select:none}' +
		'.lj-tarjeta{width:min(560px,100%);max-height:calc(100vh - 32px);overflow:auto;box-sizing:border-box;padding:24px 26px;border-radius:24px;' +
		'background:#fff;color:#1d2b53;text-align:center;box-shadow:0 16px 48px rgb(0 0 0 / 40%);border:4px solid #24386e}' +
		'.lj-tarjeta h2{margin:0 0 4px;font-size:clamp(26px,5vw,36px);line-height:1.15}' +
		'.lj-juego{margin:0;font-size:16px;font-weight:700;color:#55607a;letter-spacing:.02em}' +
		'.lj-detalle{margin:8px 0 0;font-family:"Nunito",system-ui,sans-serif;font-size:18px;font-weight:700;color:#3b4766;line-height:1.35}' +
		'.lj-chips{display:flex;flex-wrap:wrap;justify-content:center;gap:6px;margin:12px 0 0;padding:0;list-style:none}' +
		'.lj-chips li{padding:3px 12px;border-radius:999px;background:#eef2fb;border:2px solid #c9d3ea;font-size:17px;font-weight:700;color:#24386e}' +
		'.lj-boton{display:inline-flex;align-items:center;justify-content:center;gap:12px;margin-top:20px;min-width:240px;min-height:68px;padding:10px 32px;' +
		'border:0;border-radius:999px;background:#1a7f37;color:#fff;font:800 28px/1 "Baloo 2","Nunito",system-ui,sans-serif;cursor:pointer;' +
		'box-shadow:0 6px 0 #0f5223}' +
		'.lj-boton:hover{background:#166b2f}.lj-boton:active{transform:translateY(3px);box-shadow:0 3px 0 #0f5223}' +
		'.lj-boton:focus-visible{outline:4px solid #1d2b53;outline-offset:4px}' +
		'.lj-boton .lj-ico{font-size:.9em}' +
		'.lj-ok{font-size:56px;line-height:1;margin:0 0 6px}' +
		// en un iframe bajo (la tarjeta de la lección): todo más apretado para que el botón quepa entero
		'@media (max-height:440px){.lj-tarjeta{padding:14px 18px;border-width:3px}.lj-tarjeta h2{font-size:24px}.lj-ok{font-size:34px;margin:0}' +
		'.lj-detalle{font-size:15px;margin-top:4px}.lj-chips{margin-top:8px}.lj-chips li{font-size:14px;padding:1px 9px}' +
		'.lj-boton{margin-top:12px;min-height:54px;font-size:22px}}' +
		'@media (prefers-reduced-motion:no-preference){.lj-tarjeta{animation:lj-entra .25s ease-out}}' +
		'@keyframes lj-entra{from{transform:scale(.94);opacity:0}to{transform:none;opacity:1}}';

	var capa = null;
	function estilo() {
		if (document.getElementById('lj-estilo')) return;
		var s = document.createElement('style');
		s.id = 'lj-estilo'; s.textContent = CSS;
		document.head.appendChild(s);
	}
	function cerrar() { if (capa) { capa.remove(); capa = null; } }
	function el(tag, cls, txt) { var e = document.createElement(tag); if (cls) e.className = cls; if (txt != null) e.textContent = txt; return e; }

	// Una tarjeta en el centro con un único botón grande; Enter o Espacio lo pulsan (es un <button>).
	function tarjeta(o) {
		estilo(); cerrar();
		capa = el('div', 'lj-capa');
		var t = el('div', 'lj-tarjeta');
		t.setAttribute('role', 'dialog'); t.setAttribute('aria-modal', 'true');
		t.setAttribute('aria-labelledby', 'lj-titulo'); t.setAttribute('aria-describedby', 'lj-detalle');
		if (o.ok) t.appendChild(el('p', 'lj-ok', o.ok)).setAttribute('aria-hidden', 'true');
		if (o.juego) t.appendChild(el('p', 'lj-juego', o.juego));
		var h = el('h2', null, o.titulo); h.id = 'lj-titulo'; t.appendChild(h);
		var d = el('p', 'lj-detalle', o.detalle || ''); d.id = 'lj-detalle'; t.appendChild(d);
		if (o.chips && o.chips.length) {
			var ul = el('ul', 'lj-chips'); ul.setAttribute('aria-label', o.chipsRotulo || 'Lo que vas a practicar');
			o.chips.forEach(function (c) { ul.appendChild(el('li', null, c)); });
			t.appendChild(ul);
		}
		var b = el('button', 'lj-boton'); b.type = 'button';
		b.appendChild(el('span', 'lj-ico', o.icono)).setAttribute('aria-hidden', 'true');
		b.appendChild(el('span', null, o.boton));
		b.addEventListener('click', function () { cerrar(); o.alPulsar(); });
		t.appendChild(b);
		capa.appendChild(t);
		document.body.appendChild(capa);
		// las teclas no deben llegar al juego de debajo mientras la tarjeta está abierta
		capa.addEventListener('keydown', function (e) { e.stopPropagation(); });
		setTimeout(function () { try { b.focus({ preventScroll: true }); } catch (e) { /* nada */ } }, 0);
		return b;
	}

	var slug = function (t) { return String(t).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, ''); }; // = nombreDelAudio (voz-grabada.ts)
	var barajar = function (a) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var x = a[i]; a[i] = a[j]; a[j] = x; } return a; };
	var txt = function (x) { return typeof x === 'string' ? x.trim() : typeof x === 'number' ? String(x) : ''; };

	function palabras() {
		return (cfg && Array.isArray(cfg.palabras) ? cfg.palabras : []).filter(function (p) { return p && txt(p.en) && txt(p.es); })
			.map(function (p) { return { en: txt(p.en), es: txt(p.es), emoji: txt(p.emoji) }; });
	}
	function preguntas() {
		var ps = (cfg && Array.isArray(cfg.preguntas) ? cfg.preguntas : []).filter(function (q) {
			return q && txt(q.p) && Array.isArray(q.opciones) && q.opciones.length >= 2 && q.opciones.length <= 4 &&
				Number.isInteger(q.correcta) && q.correcta >= 0 && q.correcta < q.opciones.length;
		}).map(function (q) { return { p: txt(q.p), opciones: q.opciones.map(txt), correcta: q.correcta, oir: txt(q.oir) }; });
		if (ps.length) return ps;
		// con las palabras: suena la palabra en inglés (y se ve escrita) y se elige qué quiere decir
		var pw = palabras();
		if (pw.length < 2) return [];
		var es = function (p) { return (p.emoji ? p.emoji + ' ' : '') + p.es; };
		return pw.map(function (w) {
			var otras = barajar(pw.filter(function (x) { return x.es !== w.es; })).slice(0, 2).map(es);
			var ops = barajar([es(w)].concat(otras));
			return { p: '🔊 «' + w.en + '»: ¿qué quiere decir?', opciones: ops, correcta: ops.indexOf(es(w)), oir: w.en };
		});
	}
	var base = cfg && typeof cfg.voz === 'string' && /^(https?:\/\/|\/)/.test(cfg.voz) ? cfg.voz.replace(/\/?$/, '/') : null;
	var voces = cfg && cfg.voces && typeof cfg.voces === 'object' ? cfg.voces : {};
	/*
	 * LA COLA DE VOZ (Joseth, 31 oct: «empieza la felicitación "Great job!" y de inmediato "Into the ark" la interrumpe.
	 * Que no se choquen»). Un MP3 NUNCA corta a otro: lo nuevo espera en fila y suena cuando acaba el que suena.
	 * La usan leccion.js (oir) y el arca para todo lo suyo, así nada suena encima de nada. Cada pedido:
	 *   { urls: [..] o () => [..]   las direcciones a probar en orden (la primera que cargue)
	 *     clave?    si ya espera algo con la misma clave, no se pone dos veces
	 *     grupo?    lo nuevo de un grupo reemplaza a lo que de ese grupo aún espera (la palabra de la pregunta anterior)
	 *     caduca?   ms: si esperó más que eso, ya no hace falta y se salta (por omisión 6000)
	 *     vigente?  () => bool: si al llegarle el turno da false, se salta
	 *     silencio? ms de pausa si no hay MP3 (para quien espera el final); si no, se pasa al siguiente sin esperar }
	 * poner() devuelve una promesa: true si sonó entero, false si no había MP3, null si se saltó o se calló.
	 * soltar() quita lo que espera (no lo que suena); callar() además para lo que suena: sólo para el silencio que pide
	 * el jugador o el juego (mudo, pausa, pestaña oculta, salir). Jamás la voz del navegador.
	 */
	var cola = (function () {
		var fila = [], actual = null, respiro = 0;
		function cerrar(it, r) { if (!it.listo) { it.listo = true; it.fin(r); } }
		function siguiente() {
			if (actual || respiro) return;
			while (fila.length) {
				var it = fila.shift(), ahora = Date.now();
				if (ahora - it.t > it.caduca || (it.vigente && !it.vigente())) { cerrar(it, null); continue; }
				tocar(it); return;
			}
		}
		function acabar(it, r) {
			if (!actual || actual.it !== it) return;
			actual = null; cerrar(it, r);
			respiro = setTimeout(function () { respiro = 0; siguiente(); }, 150); // un respiro entre frase y frase
		}
		function tocar(it) {
			var urls = (typeof it.urls === 'function' ? it.urls() : it.urls) || [];
			actual = { it: it, audio: null, reloj: 0 };
			var mudo = function () {
				if (it.silencio > 0) actual.reloj = setTimeout(function () { acabar(it, false); }, it.silencio);
				else acabar(it, false);
			};
			var probar = function (k) {
				if (!actual || actual.it !== it) return;
				if (k >= urls.length) { actual.audio = null; mudo(); return; }
				var a = new Audio(urls[k]); actual.audio = a;
				a.onended = function () { if (actual && actual.audio === a) acabar(it, true); };
				a.onerror = function () { if (actual && actual.audio === a) probar(k + 1); };
				a.play().catch(function (e) { if (e && e.name === 'NotAllowedError' && actual && actual.audio === a) acabar(it, false); }); // sin MP3 lo resuelve onerror
			};
			probar(0);
		}
		function poner(o) {
			// si lo mismo ya espera en la fila, no se pone dos veces: se responde con su promesa (si es lo que suena, se
			// repite después)
			var ya = o.clave ? fila.filter(function (x) { return x.clave === o.clave; })[0] : null;
			if (ya) return ya.promesa;
			var it = { urls: o.urls, clave: o.clave || '', grupo: o.grupo || '', caduca: o.caduca > 0 ? o.caduca : 6000,
				vigente: o.vigente, silencio: +o.silencio || 0, t: Date.now(), listo: false };
			it.promesa = new Promise(function (fin) { it.fin = fin; });
			if (it.grupo) fila = fila.filter(function (x) { if (x.grupo !== it.grupo) return true; cerrar(x, null); return false; });
			fila.push(it);
			siguiente();
			return it.promesa;
		}
		function soltar() { var f = fila; fila = []; f.forEach(function (x) { cerrar(x, null); }); }
		function callar() {
			soltar();
			if (actual) {
				var c = actual; actual = null;
				clearTimeout(c.reloj);
				if (c.audio) { c.audio.onended = c.audio.onerror = null; c.audio.pause(); }
				cerrar(c.it, null);
			}
			clearTimeout(respiro); respiro = 0;
		}
		return { poner: poner, soltar: soltar, callar: callar, ocupada: function () { return !!actual || fila.length > 0; } };
	})();
	var callar = cola.callar;
	/** El MP3 grabado de `texto` (en la cola: espera a lo que suena); sin él, silencio. Promesa: true al acabar de sonar,
	 *  false sin audio, null si se saltó. `opc`: grupo, caduca, vigente (ver la cola). */
	function oir(texto, opc) {
		var s = slug(texto || '');
		if (!base || !s) return Promise.resolve(false);
		var dirs = [voces[s], 'en'].filter(function (d, i, a) { return d && /^[a-z-]+$/.test(d) && a.indexOf(d) === i; });
		opc = opc || {};
		return cola.poner({ urls: dirs.map(function (d) { return base + d + '/' + s + '.mp3'; }), clave: 'oir:' + s,
			grupo: opc.grupo, caduca: opc.caduca, vigente: opc.vigente });
	}

	// el id del juego sale de su carpeta: /juegos3d/<id>/index.html
	var idJuego = (location.pathname.match(/juegos3d\/([\w-]+)\//) || [])[1] || '';
	function avisar(r, fin) {
		if (!cfg || window.parent === window) return;
		var m = { tipo: 'juegos3d:resultado', juego: idJuego, aciertos: Math.max(0, +r.aciertos || 0), total: Math.max(0, +r.total || 0),
			fallos: Math.max(0, +r.fallos || 0), terminado: !!fin, nivel: r.nivel != null ? String(r.nivel) : null };
		if (r.puesto) m.puesto = +r.puesto;
		try { window.parent.postMessage(m, location.origin); } catch (e) { /* sin padre: nada */ }
	}

	window.LeccionJuego = {
		activo: !!cfg,
		cfg: cfg,
		titulo: cfg && typeof cfg.titulo === 'string' ? cfg.titulo : '',
		dificultad: cfg && ['facil', 'media', 'normal'].indexOf(cfg.dificultad) >= 0 ? cfg.dificultad : 'normal',
		/** La pantalla del principio: el nombre del juego, lo de la lección y «Jugar». */
		portada: function (o) {
			return tarjeta({ juego: o.juego, titulo: o.titulo || 'Practica lo de la lección', detalle: o.detalle, chips: o.chips, chipsRotulo: o.chipsRotulo,
				icono: '▶', boton: 'Jugar', alPulsar: o.alJugar });
		},
		/** La pantalla del final: «¡Lo lograste!» y «Volver a jugar». */
		logrado: function (o) {
			return tarjeta({ ok: '🎉', titulo: o.titulo || '¡Lo lograste!', detalle: o.detalle, chips: o.chips, chipsRotulo: o.chipsRotulo || 'Lo que practicaste',
				icono: '↻', boton: 'Volver a jugar', alPulsar: o.alOtraVez });
		},
		cerrar: cerrar,
		barajar: barajar,
		palabras: palabras,
		preguntas: preguntas,
		oir: oir,
		callar: callar,
		/** La cola de voz compartida: poner(pedido), soltar(), callar(), ocupada(). */
		cola: cola,
		/** Lo que lleva (cada respuesta): {aciertos, total, fallos, nivel?}. */
		progreso: function (r) { avisar(r, false); },
		/** Al terminar: {aciertos, total, fallos, nivel?, puesto?}. */
		resultado: function (r) { avisar(r, true); }
	};
})();
