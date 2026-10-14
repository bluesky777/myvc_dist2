/*
 * PUENTE ENTRE CADA JUEGO Y QUIEN LO ABRE. Va el primero en el <head> de cada juego, antes de three.
 *
 * - Suelto (el artefacto): three sale del CDN y «Volver a los juegos» va a ../index.html.
 * - Dentro de app2 (/juegos/<juego>, en un iframe): three sale de la propia app (../three.min.js, lo
 *   copia el build desde node_modules), el color del colegio llega por ?colegio=, el progreso se
 *   guarda por usuario (?u=) y «Volver» le avisa a la página madre en vez de navegar.
 * - window.Juegos3D: { enApp, docente, api(metodo, ruta, cuerpo), grupos() }. La API la llama la página
 *   madre con su sesión (sólo rutas `juegos/…`); el token nunca entra aquí. Suelto: enApp false.
 */
(function () {
	var q = new URLSearchParams(location.search);
	var enApp = window.parent !== window && q.has('u');
	document.write('<script src="' + (enApp ? '../three.min.js' : 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js') + '"></' + 'script>');
	if (!enApp) { window.Juegos3D = { enApp: false, docente: false }; window.volverAJuegos = function () { location.href = '../index.html'; }; return; }

	var color = q.get('colegio');
	if (color && /^#[0-9a-f]{3,8}$/i.test(color)) document.documentElement.style.setProperty('--colegio', color);

	/* cada usuario del navegador con su propio progreso: juegos3d.<juego> → juegos3d.<juego>.u<id> */
	var sufijo = '.u' + q.get('u');
	try {
		var get = Storage.prototype.getItem, set = Storage.prototype.setItem;
		var clave = function (k) { return typeof k === 'string' && k.indexOf('juegos3d.') === 0 ? k + sufijo : k; };
		Storage.prototype.getItem = function (k) { return get.call(this, clave(k)); };
		Storage.prototype.setItem = function (k, v) { return set.call(this, clave(k), v); };
	} catch (e) { /* sin almacenamiento el juego sigue igual */ }

	/* peticiones a la API por la página madre: {tipo, id, …} → {tipo, id, ok, datos | estado, error} */
	var pendientes = {}, n = 0;
	window.addEventListener('message', function (ev) {
		var d = ev.data;
		if (ev.source !== window.parent || ev.origin !== location.origin || !d || !pendientes[d.id]) return;
		if (d.tipo !== 'juegos3d:api' && d.tipo !== 'juegos3d:grupos') return;
		var p = pendientes[d.id]; delete pendientes[d.id]; clearTimeout(p.t);
		if (d.ok) p.res(d.datos);
		else { var e = new Error(d.error || 'No se pudo'); e.estado = d.estado || 0; p.rej(e); }
	});
	function pedir(msg) {
		return new Promise(function (res, rej) {
			var id = ++n;
			msg.id = id;
			pendientes[id] = { res: res, rej: rej, t: setTimeout(function () { delete pendientes[id]; var e = new Error('Sin respuesta'); e.estado = 0; rej(e); }, 20000) };
			window.parent.postMessage(msg, location.origin);
		});
	}
	window.Juegos3D = {
		enApp: true,
		docente: q.get('docente') === '1',
		api: function (metodo, ruta, cuerpo) { return pedir({ tipo: 'juegos3d:api', metodo: metodo, ruta: ruta, cuerpo: cuerpo }); },
		grupos: function () { return pedir({ tipo: 'juegos3d:grupos' }); }
	};

	window.volverAJuegos = function () { window.parent.postMessage({ tipo: 'juegos3d:volver' }, location.origin); };
	document.addEventListener('click', function (ev) {
		var a = ev.target && ev.target.closest && ev.target.closest('a[href="../index.html"]');
		if (a) { ev.preventDefault(); window.volverAJuegos(); }
	}, true);
})();
