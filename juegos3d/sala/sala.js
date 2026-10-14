/* SALA MULTIJUGADOR — común a los juegos 3D. Sin three ni DOM del juego: sólo la conexión.
 *
 * La sala es la pestaña del docente (anfitrión). Los alumnos (invitados) se conectan a ella por un canal
 * de datos WebRTC; 8myvc sólo los presenta (señalización por sondeo) y da los servidores ICE/TURN.
 * - ICE sin goteo: se espera a que termine la recolección y se manda UNA oferta y UNA respuesta.
 * - La API la llama la página madre (window.Juegos3D.api de puente.js): aquí no hay token.
 * - Mensajes JSON pequeños. Los que empiezan por «_» son de la sala (latido, cierre, reemplazo);
 *   el resto es del juego.
 * - La identidad del alumno es su user_id, que pone el servidor con la sesión: si se cae y vuelve,
 *   el anfitrión lo reconoce y avisa con «vuelve».
 *
 *   Sala.abrir({juego, grupo_id}) → Promise<anfitrión>
 *     anfitrión: sala, en(evento, fn), enviar(user_id, msg), todos(msg), jugadores(), cerrar()
 *     eventos: entra(jugador) · vuelve(jugador) · sale(jugador, motivo) · mensaje(jugador, msg) · perdida()
 *   Sala.entrar(sala) → invitado
 *     invitado: en(evento, fn), enviar(msg), salir()
 *     eventos: estado('conectando'|'abierto'|'reconectando') · mensaje(msg) · fin(motivo: cerrada|reemplazado|error)
 *   Sala.salas(juego) · Sala.porCodigo(codigo) → Promise
 */
(function () {
  'use strict';
  const J3 = window.Juegos3D || {};
  const api = (metodo, ruta, cuerpo) => (J3.api ? J3.api(metodo, ruta, cuerpo) : Promise.reject(Object.assign(new Error('Sin app'), { estado: 0 })));
  const espera = ms => new Promise(r => setTimeout(r, ms));
  const STUN = [{ urls: 'stun:stun.cloudflare.com:3478' }];
  const LATIDO = 10000, PING = 2000, SORDO = 7000;
  // 404: no existe · 410: cerrada o muerta (sin latido). Las dos quieren decir «se acabó».
  const acabada = e => e && (e.estado === 404 || e.estado === 410);

  let ice = null, iceT = 0;
  async function servidoresIce() {
    if (ice && Date.now() - iceT < 10 * 60000) return ice;
    try {
      const r = await api('GET', 'juegos/turn');
      ice = r && Array.isArray(r.iceServers) && r.iceServers.length ? r.iceServers : STUN;
    } catch (e) { ice = ice || STUN; }
    iceT = Date.now();
    return ice;
  }

  // ICE sin goteo: la descripción local queda completa cuando termina la recolección (tope por si un TURN no contesta).
  function recolectar(pc, tope) {
    return new Promise(res => {
      if (pc.iceGatheringState === 'complete') return res();
      const t = setTimeout(fin, tope || 5000);
      function mira() { if (pc.iceGatheringState === 'complete') fin(); }
      function cand(e) { if (!e.candidate) fin(); }
      function fin() { clearTimeout(t); pc.removeEventListener('icegatheringstatechange', mira); pc.removeEventListener('icecandidate', cand); res(); }
      pc.addEventListener('icegatheringstatechange', mira);
      pc.addEventListener('icecandidate', cand);
    });
  }

  // El backend recorta la sdp (TrimStrings de Laravel se lleva el \r\n final) y Chrome no la acepta sin él.
  const sdpEntera = t => String(t || '').replace(/\r?\n/g, '\r\n').replace(/(\r\n)*$/, '\r\n');

  function emisor() {
    const o = {};
    return {
      en(t, f) { (o[t] = o[t] || []).push(f); return () => { o[t] = (o[t] || []).filter(x => x !== f); }; },
      emitir(t, a, b) { (o[t] || []).slice().forEach(f => { try { f(a, b); } catch (e) { setTimeout(() => { throw e; }); } }); }
    };
  }
  function leer(ev) {
    if (typeof ev.data !== 'string' || ev.data.length > 16384) return null;
    try { const m = JSON.parse(ev.data); return m && typeof m === 'object' && typeof m.t === 'string' ? m : null; } catch (e) { return null; }
  }
  function mandar(dc, msg) {
    if (!dc || dc.readyState !== 'open') return false;
    try { dc.send(JSON.stringify(msg)); return true; } catch (e) { return false; }
  }

  /* ---------- anfitrión: la pestaña del docente ---------- */
  async function abrir(op) {
    const sala = await api('POST', 'juegos/salas', { juego: op.juego, grupo_id: op.grupo_id });
    if (!sala || !sala.id) throw new Error('La sala no se pudo abrir');
    const ev = emisor(), pares = new Map(), vistos = new Set(), conocidos = new Set();
    let desde = 0, vivo = true, sondeoT = 0;

    async function sondear() {
      if (!vivo) return;
      try {
        const lista = await api('GET', 'juegos/salas/' + sala.id + '/ofertas?desde=' + desde);
        (Array.isArray(lista) ? lista : []).forEach(o => {
          desde = Math.max(desde, +o.id || 0);
          if (o.sdp && !vistos.has(o.id)) { vistos.add(o.id); atender(o); }
        });
      } catch (e) { if (acabada(e)) { perder(); return; } }
      if (vivo) sondeoT = setTimeout(sondear, 1500);
    }
    async function atender(o) {
      const jugador = { user_id: String(o.user_id), nombre: o.nombre || 'Estudiante', foto: o.foto || null };
      const pc = new RTCPeerConnection({ iceServers: await servidoresIce() });
      const par = { pc, dc: null, jugador, ultimo: Date.now(), fuera: false };
      pc.ondatachannel = e => {
        const dc = e.channel; par.dc = dc;
        dc.onopen = () => {
          if (!vivo) { pc.close(); return; }
          const viejo = pares.get(jugador.user_id);
          if (viejo && viejo !== par) { viejo.fuera = true; mandar(viejo.dc, { t: '_reemplazo' }); viejo.pc.close(); }
          pares.set(jugador.user_id, par); par.ultimo = Date.now();
          const ya = conocidos.has(jugador.user_id); conocidos.add(jugador.user_id);
          ev.emitir(ya ? 'vuelve' : 'entra', jugador);
        };
        dc.onmessage = m => {
          par.ultimo = Date.now();
          const msg = leer(m); if (!msg || pares.get(jugador.user_id) !== par) return;
          if (msg.t === '_p') return;
          if (msg.t === '_adios') { soltar(par, 'adios'); return; }
          if (msg.t.charAt(0) !== '_') ev.emitir('mensaje', jugador, msg);
        };
        dc.onclose = () => soltar(par, 'caida');
      };
      pc.onconnectionstatechange = () => { if (pc.connectionState === 'failed') soltar(par, 'caida'); };
      try {
        await pc.setRemoteDescription({ type: 'offer', sdp: sdpEntera(o.sdp) });
        await pc.setLocalDescription(await pc.createAnswer());
        await recolectar(pc);
        await api('PUT', 'juegos/salas/' + sala.id + '/ofertas/' + o.id, { sdp: pc.localDescription.sdp });
      } catch (e) { console.warn('sala: no se pudo contestar a ' + jugador.nombre, e); pc.close(); }
    }
    function soltar(par, motivo) {
      if (par.fuera) return;
      par.fuera = true;
      try { par.pc.close(); } catch (e) { /* ya cerrada */ }
      if (pares.get(par.jugador.user_id) === par) { pares.delete(par.jugador.user_id); if (vivo) ev.emitir('sale', par.jugador, motivo); }
    }
    // latido de la sala (para el listado) y ping por el canal (para notar una caída sin esperar al ICE)
    const latidoT = setInterval(() => {
      if (vivo) api('PUT', 'juegos/salas/' + sala.id + '/latido').catch(e => { if (acabada(e)) perder(); });
    }, LATIDO);
    const pingT = setInterval(() => {
      const ahora = Date.now();
      pares.forEach(par => { if (ahora - par.ultimo > SORDO + 2000) soltar(par, 'caida'); else mandar(par.dc, { t: '_p' }); });
    }, PING);
    function parar() {
      vivo = false; clearTimeout(sondeoT); clearInterval(latidoT); clearInterval(pingT);
      removeEventListener('pagehide', alSalir);
      pares.forEach(par => { par.fuera = true; mandar(par.dc, { t: '_cierre' }); setTimeout(() => par.pc.close(), 150); });
      pares.clear();
    }
    function perder() { if (!vivo) return; parar(); ev.emitir('perdida'); }
    function alSalir() { if (vivo) { parar(); api('DELETE', 'juegos/salas/' + sala.id).catch(() => {}); } }
    addEventListener('pagehide', alSalir);
    sondear();

    return {
      sala,
      en: ev.en,
      enviar(uid, msg) { const par = pares.get(String(uid)); return par ? mandar(par.dc, msg) : false; },
      todos(msg) { const s = JSON.stringify(msg); pares.forEach(par => { if (par.dc && par.dc.readyState === 'open') try { par.dc.send(s); } catch (e) { /* se cae sola */ } }); },
      jugadores() { return [...pares.values()].map(p => p.jugador); },
      conectado(uid) { return pares.has(String(uid)); },
      async cerrar() { if (!vivo) return; parar(); try { await api('DELETE', 'juegos/salas/' + sala.id); } catch (e) { /* el latido ya no la sostiene */ } }
    };
  }

  /* ---------- invitado: el alumno ---------- */
  function entrar(sala) {
    const ev = emisor();
    let pc = null, dc = null, vivo = true, ultimo = 0, caidoDesde = 0;

    function limpiar() { if (dc) { dc.onclose = null; dc.onmessage = null; } if (pc) try { pc.close(); } catch (e) { /* ya cerrada */ } pc = null; dc = null; }
    function terminar(motivo) { if (!vivo) return; vivo = false; clearInterval(vigiaT); limpiar(); ev.emitir('fin', motivo); }

    async function intento() {
      pc = new RTCPeerConnection({ iceServers: await servidoresIce() });
      const miPc = pc;
      dc = pc.createDataChannel('juego', { ordered: true });
      const canal = dc;
      const abierto = new Promise((res, rej) => {
        canal.onopen = res;
        miPc.onconnectionstatechange = () => { if (miPc.connectionState === 'failed') rej(new Error('ICE')); };
        setTimeout(() => rej(new Error('tiempo')), 30000);
      });
      abierto.catch(() => {});
      await pc.setLocalDescription(await pc.createOffer());
      await recolectar(pc);
      if (!vivo) throw new Error('fuera');
      const of = await api('POST', 'juegos/salas/' + sala.id + '/ofertas', { sdp: pc.localDescription.sdp });
      let sdp = null;
      const hasta = Date.now() + 30000; // el backend limita a 120 peticiones por minuto y usuario
      while (!sdp && vivo && Date.now() < hasta) {
        await espera(1000);
        const r = await api('GET', 'juegos/salas/' + sala.id + '/ofertas/' + of.id);
        sdp = r && r.sdp;
      }
      if (!sdp) throw new Error('sin respuesta');
      await pc.setRemoteDescription({ type: 'answer', sdp: sdpEntera(sdp) });
      await abierto;
      if (!vivo || miPc !== pc) throw new Error('fuera');
      ultimo = Date.now();
      canal.onmessage = m => {
        ultimo = Date.now();
        const msg = leer(m); if (!msg) return;
        if (msg.t === '_cierre') terminar('cerrada');
        else if (msg.t === '_reemplazo') terminar('reemplazado');
        else if (msg.t.charAt(0) !== '_') ev.emitir('mensaje', msg);
      };
      canal.onclose = () => { if (vivo && dc === canal) reconectar(); };
    }

    let conectando = false;
    async function conectar(primera) {
      if (conectando || !vivo) return;
      conectando = true;
      ev.emitir('estado', primera ? 'conectando' : 'reconectando');
      if (!caidoDesde) caidoDesde = Date.now();
      let n = 0;
      while (vivo) {
        try {
          await intento();
          caidoDesde = 0; conectando = false;
          ev.emitir('estado', 'abierto');
          return;
        } catch (e) {
          limpiar();
          if (!vivo) break;
          console.warn('sala: intento fallido', e && e.message);
          if (acabada(e)) { conectando = false; return terminar('cerrada'); }
          // ¿sigue viva la sala? Si el docente la cerró, se acaba; si es la red, se insiste un rato.
          try { await api('GET', 'juegos/salas/codigo/' + encodeURIComponent(sala.codigo)); } catch (e2) { if (acabada(e2)) { conectando = false; return terminar('cerrada'); } }
          if (Date.now() - caidoDesde > (primera ? 45000 : 120000)) { conectando = false; return terminar(primera ? 'error' : 'cerrada'); }
          await espera(Math.min(5000, 1000 + 1000 * n++));
        }
      }
      conectando = false;
    }
    function reconectar() { if (!vivo || conectando) return; limpiar(); conectar(false); }

    const vigiaT = setInterval(() => {
      if (!vivo || conectando || !dc) return;
      if (Date.now() - ultimo > SORDO) reconectar(); else mandar(dc, { t: '_p' });
    }, PING);
    conectar(true);

    return {
      en: ev.en,
      enviar(msg) { return mandar(dc, msg); },
      salir() { if (!vivo) return; mandar(dc, { t: '_adios' }); const d = dc; vivo = false; clearInterval(vigiaT); setTimeout(() => { if (d === dc) limpiar(); }, 150); }
    };
  }

  window.Sala = {
    disponible: !!(J3.enApp && window.RTCPeerConnection),
    abrir,
    entrar,
    salas(juego) { return api('GET', 'juegos/salas?juego=' + encodeURIComponent(juego)); },
    porCodigo(codigo) { return api('GET', 'juegos/salas/codigo/' + encodeURIComponent(String(codigo).trim().toUpperCase())); }
  };
})();
