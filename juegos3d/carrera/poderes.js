/* global module */
/* Turbo Saber — REGLAS DE LOS PODERES. Sin DOM ni three: lo usan el juego (con <script>) y, más
   adelante, el servidor de la sala (require/import en Node). juego.js sólo le pasa datos y dibuja.

   - Un poder se GANA respondiendo: cada acierto llena la barra (uno rápido vale doble) y fallar la vacía.
     Nunca sale al azar: el tipo depende del puesto (el de adelante defiende, el de atrás ataca).
   - Todo es serializable: corredores {id, d, v, carril, fin} en metros de carrera; eventos planos
     {n, t, tipo, poder, de, a, obj, avance, carril, dur}. El reloj es el que se le inyecta con paso(dt)
     (o la opción `ahora`), nunca performance.now: la pausa congela los efectos y el servidor manda su hora.
   - Tipos de evento: gana · lanza · impacto · bloqueo (escudo o protección) · contacto (sólo en modo
     remoto: el cliente propone, el servidor responde con impacto/bloqueo) · fin (el objeto se acabó).
   - Para no castigar al que más sabe: un golpe dura poco, no se apila y deja una protección breve.
   - Recompensas de ventaja propia (alas, estrella, fantasma, imán) y una de ataque suave (nube). Las que más ayudan salen
     a los de atrás; el primero recibe sobre todo defensa. Ninguna se apila: un poder a la vez, y una nube o un golpe
     dejan protección. Alas, estrella y fantasma hacen inmune: un golpe se vuelve «bloqueo» con ese motivo. */
(function (raiz, fabrica) {
  'use strict';
  if (typeof module === 'object' && module.exports) module.exports = fabrica();
  else raiz.PoderesCarrera = fabrica();
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';
  const TIPOS = ['banana', 'caparazon', 'escudo', 'cohete', 'alas', 'estrella', 'iman', 'nube', 'fantasma'];
  const PROPIOS = ['alas', 'estrella', 'fantasma', 'iman']; // duran un rato sobre quien los usa
  // Qué sale según dónde vas (0 = primero, 1 = último); se alterna dentro de cada fila.
  const REPARTO = [
    [0, ['escudo', 'banana', 'fantasma']],
    [0.4, ['banana', 'caparazon', 'fantasma', 'iman']],
    [0.75, ['caparazon', 'cohete', 'iman', 'nube', 'alas']],
    [1, ['alas', 'estrella', 'cohete', 'nube', 'caparazon']]
  ];
  const BASE = {
    cargaPara: 4,              // puntos de barra para ganar un poder (acierto 1, rápido 2)
    cargaRival: 4,             // los rivales simulados: aciertos seguidos que necesitan
    golpe: { banana: 1.1, caparazon: 1.6 },   // segundos girando
    frenoGolpe: { banana: 0.5, caparazon: 0.4 }, // factor de velocidad mientras gira
    proteccion: 3,             // segundos intocable después de recuperarse
    escudo: 7,                 // segundos que dura la burbuja (o hasta parar un golpe)
    cohete: 12,                // turbo extra del cohete
    vidaBanana: 40, vidaCaparazon: 7,
    velCaparazon: 15,          // m/s por encima del objetivo
    alcanceBanana: 45,         // la cáscara cae en el carril del que viene detrás si está a menos de esto
    dur: { alas: 3.5, estrella: 5, fantasma: 5, iman: 4, nube: 4 }, // segundos de cada recompensa
    vel: { alas: 1.3, estrella: 1.22, nube: 0.8 },                  // factor de velocidad mientras dura
    imanMax: 1.45              // el imán acelera hasta esto según lo lejos que esté el de adelante
  };
  const copia = o => JSON.parse(JSON.stringify(o));

  function crear(cfg, opciones) {
    const C = Object.assign({}, BASE, cfg || {});
    C.golpe = Object.assign({}, BASE.golpe, (cfg && cfg.golpe) || {});
    C.frenoGolpe = Object.assign({}, BASE.frenoGolpe, (cfg && cfg.frenoGolpe) || {});
    C.dur = Object.assign({}, BASE.dur, (cfg && cfg.dur) || {});
    C.vel = Object.assign({}, BASE.vel, (cfg && cfg.vel) || {});
    const ahora = opciones && typeof opciones.ahora === 'function' ? opciones.ahora : null;
    const S = { t: 0, total: 1, n: 0, obj: 0, remoto: false, objetos: [], corredores: {}, antes: {}, cuantos: 0 };
    const oyentes = [];
    const hora = () => (ahora ? ahora() : S.t);

    function emitir(ev) {
      ev.n = ++S.n; ev.t = +hora().toFixed(2);
      oyentes.forEach(f => { try { f(ev); } catch (e) { /* oyente ajeno */ } });
      return ev;
    }
    function k(id) { return S.corredores[id] || (S.corredores[id] = { carga: 0, poder: null, golpe: null, protegido: 0, escudo: 0, ronda: 0, propio: null, nube: null }); }
    // inmune a golpes: volando, con estrella o de fantasma (devuelve el motivo)
    function inmune(c, t) { return c.propio && c.propio.hasta > t && c.propio.tipo !== 'iman' ? c.propio.tipo : null; }
    const activo = (c, tipo, t) => !!(c && c.propio && c.propio.tipo === tipo && c.propio.hasta > t);

    // El tipo sale del puesto, alternando para que no se repita siempre el mismo.
    function elegir(id, puesto) {
      const n = Math.max(S.cuantos, puesto || 1), f = n > 1 ? ((puesto || 1) - 1) / (n - 1) : 0;
      const fila = (REPARTO.find(([lim]) => f <= lim) || REPARTO[REPARTO.length - 1])[1];
      return fila[k(id).ronda++ % fila.length];
    }
    function adelante(lista, yo) { return lista.filter(r => r.id !== yo.id && !r.fin && r.d > yo.d).sort((a, b) => a.d - b.d)[0] || null; }
    function atras(lista, yo) { return lista.filter(r => r.id !== yo.id && !r.fin && r.d < yo.d).sort((a, b) => b.d - a.d)[0] || null; }

    function golpear(poder, de, a, obj) {
      const c = k(a), t = hora(), inm = inmune(c, t);
      if (inm) return emitir({ tipo: 'bloqueo', motivo: inm, poder, de, a, obj });
      if (c.escudo > t) { c.escudo = 0; return emitir({ tipo: 'bloqueo', motivo: 'escudo', poder, de, a, obj }); }
      if (c.protegido > t) return emitir({ tipo: 'bloqueo', motivo: 'protegido', poder, de, a, obj });
      if (poder === 'nube') { // no hace girar: frena un poco y, mientras dura, protege (no se apila otro golpe)
        const d = C.dur.nube;
        c.nube = { de, desde: t, hasta: t + d }; c.protegido = t + d;
        return emitir({ tipo: 'impacto', poder, de, a, dur: d });
      }
      const dur = C.golpe[poder] || 1.2;
      c.golpe = { poder, de, desde: t, hasta: t + dur };
      c.protegido = t + dur + C.proteccion;
      return emitir({ tipo: 'impacto', poder, de, a, obj, dur });
    }
    function chocar(o, r) {
      quitar(o.id);
      if (S.remoto) return emitir({ tipo: 'contacto', poder: o.poder, de: o.de, a: r.id, obj: o.id });
      return golpear(o.poder, o.de, r.id, o.id);
    }
    function quitar(id) { const i = S.objetos.findIndex(o => o.id === id); if (i >= 0) S.objetos.splice(i, 1); }

    const api = {
      tipos: TIPOS.slice(),
      config: C,
      reiniciar(total) { S.t = 0; S.total = Math.max(1, +total || 1); S.objetos = []; S.corredores = {}; S.antes = {}; S.obj = 0; },
      remoto(si) { S.remoto = !!si; },
      al(f) { oyentes.push(f); return () => { const i = oyentes.indexOf(f); if (i >= 0) oyentes.splice(i, 1); }; },

      // Una respuesta. puesto: el de quien responde (1 = primero). Devuelve el evento «gana» o null.
      cargar(id, bien, rapida, puesto, meta) {
        const c = k(id); meta = meta || C.cargaPara;
        if (!bien) { c.carga = 0; return null; }
        if (c.poder) return null; // un poder a la vez: no se acumulan
        c.carga = Math.min(meta, c.carga + (rapida ? 2 : 1));
        if (c.carga < meta) return null;
        c.carga = 0; c.poder = elegir(id, puesto || 1);
        return emitir({ tipo: 'gana', poder: c.poder, de: id });
      },

      // Usa el poder que tenga `id`. lista: todos los corredores {id, d, v, carril, fin}.
      usar(id, lista) {
        const c = k(id), p = c.poder, yo = lista.find(r => r.id === id);
        if (!p || !yo || yo.fin) return null;
        c.poder = null;
        const t = hora();
        if (p === 'escudo') { c.escudo = t + C.escudo; return emitir({ tipo: 'lanza', poder: p, de: id, dur: C.escudo }); }
        if (p === 'cohete') return emitir({ tipo: 'lanza', poder: p, de: id, dur: 2.5, turbo: C.cohete });
        if (PROPIOS.indexOf(p) >= 0) {
          // el imán busca al siguiente que lleve ventaja (más de 3 m); si no hay, al de adelante
          const a = p === 'iman' ? lista.filter(r => r.id !== id && !r.fin && r.d > yo.d + 3).sort((x, y) => x.d - y.d)[0] || adelante(lista, yo) : null, d = C.dur[p];
          c.propio = { tipo: p, desde: t, hasta: t + d, a: a ? a.id : null };
          if (p === 'estrella' || p === 'alas') c.golpe = null; // te saca del giro
          return emitir({ tipo: 'lanza', poder: p, de: id, a: a ? a.id : null, dur: d });
        }
        if (p === 'nube') { // va al que va primero (si no eres tú)
          const lider = lista.filter(r => r.id !== id && !r.fin && r.d > yo.d).sort((x, y) => y.d - x.d)[0] || null;
          const ev = emitir({ tipo: 'lanza', poder: p, de: id, a: lider ? lider.id : null });
          if (lider && !S.remoto) golpear('nube', id, lider.id, null);
          else if (lider) emitir({ tipo: 'contacto', poder: p, de: id, a: lider.id });
          return ev;
        }
        const o = { id: 'o' + (++S.obj), poder: p, de: id, desde: t, d0: yo.d, carril0: yo.carril };
        if (p === 'banana') {
          const b = atras(lista, yo);
          Object.assign(o, { d: yo.d - 3.5, carril: b && yo.d - b.d < C.alcanceBanana ? b.carril : yo.carril, hasta: t + C.vidaBanana });
        } else {
          const a = adelante(lista, yo);
          Object.assign(o, { a: a ? a.id : null, d: yo.d + 1.6, carril: yo.carril, hasta: t + C.vidaCaparazon });
        }
        S.objetos.push(o);
        return emitir({ tipo: 'lanza', poder: p, de: id, a: o.a, obj: o.id, avance: +(o.d / S.total).toFixed(4), carril: o.carril });
      },

      // Avanza el reloj y los objetos; decide los choques (en modo local).
      paso(dt, lista) {
        S.t += dt;
        const t = hora(), por = {};
        lista.forEach(r => { por[r.id] = r; });
        for (const o of S.objetos.slice()) {
          if (t >= o.hasta) { quitar(o.id); emitir({ tipo: 'fin', poder: o.poder, de: o.de, obj: o.id }); continue; }
          if (o.poder === 'caparazon') {
            const a = o.a && por[o.a] && !por[o.a].fin ? por[o.a] : null;
            o.d += ((a ? a.v : 9) + C.velCaparazon) * dt;
            if (a) { o.carril += (a.carril - o.carril) * Math.min(1, dt * 3); if (o.d >= a.d - 0.6) chocar(o, a); }
          } else {
            // volando o de fantasma se pasa por encima; con estrella se revienta sin frenar (lo decide golpear)
            const quien = lista.find(r => !r.fin && S.antes[r.id] != null && S.antes[r.id] < o.d && r.d >= o.d && Math.abs(r.carril - o.carril) < 1.2 && !activo(S.corredores[r.id], 'alas', t) && !activo(S.corredores[r.id], 'fantasma', t));
            if (quien) chocar(o, quien);
          }
        }
        lista.forEach(r => { S.antes[r.id] = r.d; });
        S.cuantos = lista.length;
        // el imán: cuanto más lejos el de adelante, más tira (hasta imanMax); se apaga al alcanzarlo
        lista.forEach(r => {
          const c = S.corredores[r.id];
          if (!activo(c, 'iman', t)) return;
          const a = c.propio.a && por[c.propio.a];
          c.propio.f = a && !a.fin && a.d > r.d + 1.5 ? Math.min(C.imanMax, 1.15 + (a.d - r.d) / 60) : 1.12;
        });
      },

      // Un evento que llega de fuera (el servidor): se aplica tal cual, sin volver a decidir.
      aplicar(ev) {
        if (!ev || typeof ev !== 'object' || !ev.tipo) return false;
        const t = hora(), e = Object.assign({}, ev, { remoto: true });
        if (ev.tipo === 'gana') { if (TIPOS.indexOf(ev.poder) < 0) return false; k(ev.de).poder = ev.poder; }
        else if (ev.tipo === 'lanza') {
          if (TIPOS.indexOf(ev.poder) < 0) return false;
          k(ev.de).poder = null; // lanzado = gastado (el que lo usó desde una sala lo ve desaparecer)
          if (ev.poder === 'escudo') k(ev.de).escudo = t + (ev.dur || C.escudo);
          else if (PROPIOS.indexOf(ev.poder) >= 0) { const c = k(ev.de); c.propio = { tipo: ev.poder, desde: t, hasta: t + (ev.dur || C.dur[ev.poder]), a: ev.a || null }; if (ev.poder !== 'iman' && ev.poder !== 'fantasma') c.golpe = null; }
          else if (ev.poder !== 'cohete' && ev.poder !== 'nube') {
            const d = (+ev.avance || 0) * S.total, id = ev.obj || 'x' + (++S.obj);
            quitar(id);
            S.objetos.push({ id, poder: ev.poder, de: ev.de, a: ev.a || null, desde: t, d0: d, carril0: +ev.carril || 0, d, carril: +ev.carril || 0, hasta: t + (ev.poder === 'banana' ? C.vidaBanana : C.vidaCaparazon) });
            e.obj = id;
          }
        } else if (ev.tipo === 'impacto') {
          if (ev.obj) quitar(ev.obj);
          const c = k(ev.a), dur = ev.dur || C.golpe[ev.poder] || (ev.poder === 'nube' ? C.dur.nube : 1.2);
          if (ev.poder === 'nube') { c.nube = { de: ev.de, desde: t, hasta: t + dur }; c.protegido = t + dur; }
          else { c.golpe = { poder: ev.poder, de: ev.de, desde: t, hasta: t + dur }; c.protegido = t + dur + C.proteccion; }
          e.dur = dur;
        } else if (ev.tipo === 'bloqueo' || ev.tipo === 'fin') {
          if (ev.obj) quitar(ev.obj);
          if (ev.tipo === 'bloqueo' && ev.motivo === 'escudo') k(ev.a).escudo = 0;
        } else return false;
        emitir(e);
        return true;
      },

      // Lo que necesita quien dibuja o simula.
      factor(id) {
        const c = S.corredores[id], t = hora(); if (!c) return 1;
        let f = c.golpe && c.golpe.hasta > t ? (C.frenoGolpe[c.golpe.poder] || 0.5) : 1;
        if (c.propio && c.propio.hasta > t) f *= c.propio.tipo === 'iman' ? (c.propio.f || 1.1) : (C.vel[c.propio.tipo] || 1);
        if (c.nube && c.nube.hasta > t) f *= C.vel.nube;
        return f;
      },
      efecto(id) {
        const c = S.corredores[id], t = hora();
        if (!c) return null;
        const g = c.golpe && c.golpe.hasta > t ? c.golpe : null, pr = c.propio && c.propio.hasta > t ? c.propio : null, nb = c.nube && c.nube.hasta > t ? c.nube : null;
        return { golpe: g ? g.poder : null, p: g ? (t - g.desde) / (g.hasta - g.desde) : 0, protegido: !g && !nb && !pr && c.protegido > t, escudo: c.escudo > t,
          propio: pr ? pr.tipo : null, pp: pr ? (t - pr.desde) / (pr.hasta - pr.desde) : 0, a: pr ? pr.a : null, nube: !!nb };
      },
      poder(id) { return S.corredores[id] ? S.corredores[id].poder : null; },
      carga(id) { return S.corredores[id] ? S.corredores[id].carga : 0; },
      objetos() { return S.objetos; },
      hora,
      estado() {
        return copia({ t: +hora().toFixed(2), remoto: S.remoto, objetos: S.objetos.map(o => Object.assign({}, o, { avance: +(o.d / S.total).toFixed(4) })), corredores: S.corredores });
      }
    };
    return api;
  }

  return { crear, tipos: TIPOS.slice(), reparto: REPARTO.map(([lim, l]) => [lim, l.slice()]) };
});
