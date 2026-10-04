/*
 * PUENTE ENTRE CADA JUEGO Y QUIEN LO ABRE. Va el primero en el <head> de cada juego, antes de three.
 *
 * - Suelto (el artefacto): three sale del CDN y «Volver a los juegos» va a ../index.html.
 * - Dentro de app2 (/juegos/<juego>, en un iframe): three sale de la propia app (../three.min.js, lo
 *   copia el build desde node_modules), el color del colegio llega por ?colegio=, el progreso se
 *   guarda por usuario (?u=) y «Volver» le avisa a la página madre en vez de navegar.
 */
(function () {
	var q = new URLSearchParams(location.search);
	var enApp = window.parent !== window && q.has('u');
	document.write('<script src="' + (enApp ? '../three.min.js' : 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js') + '"></' + 'script>');
	if (!enApp) { window.volverAJuegos = function () { location.href = '../index.html'; }; return; }

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

	window.volverAJuegos = function () { window.parent.postMessage({ tipo: 'juegos3d:volver' }, location.origin); };
	document.addEventListener('click', function (ev) {
		var a = ev.target && ev.target.closest && ev.target.closest('a[href="../index.html"]');
		if (a) { ev.preventDefault(); window.volverAJuegos(); }
	}, true);
})();
