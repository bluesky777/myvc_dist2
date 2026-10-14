/* Turbo Saber — MULTIJUGADOR. Se carga sólo al elegir «Jugar con mi grupo» o al entrar a una sala
   (después de ../sala/sala.js). La autoridad es la pestaña del docente: reparte preguntas SIN la respuesta,
   cronometra desde el envío, valida, mueve a todos (juego.js en papel 'tablero') y decide los poderes con
   poderes.js. El alumno sólo manda respuestas y el uso del poder, y dibuja lo que le llega.

   Mensajes (JSON, `t` = tipo):
     alumno → docente: hola{animal} · r{q, i} · u
     docente → alumno: bienvenida{yo, fase, practica, plan, pista?, torneo?, lista, estado?, codigo} · lista{lista}
                       practica{practica, plan} · empieza{practica, pista, torneo?, lista}
                       q{id, texto, ops, larga} · v{q, bien, correcta, rapida, carga}
                       e{s, c:[[id, d, v, llegada]]} · p{ev} · fin{s, c, torneo?} · espera
   Pistas: el docente elige en la sala una pista o un torneo de 3 (plan {modo, pista, lista}); con «empieza» manda el id
   de la pista y el alumno la arma. torneo = {i, pistas}; la tabla acumulada la lleva el tablero y la manda en cada
   «fin» como torneo.filas [[id, puntos, últimos]]. Entre carreras, el docente pasa a la siguiente desde el final.
   Ids = user_id en texto. El alumno no lee nada del estado antes de su «bienvenida». */
(function () {
  'use strict';
  const $ = id => document.getElementById(id);
  const J3 = window.Juegos3D || {};
  const el = (tag, cls, txt) => { const e = document.createElement(tag); if (cls) e.className = cls; if (txt != null) e.textContent = txt; return e; };
  const boton = (txt, cls, fn) => { const b = el('button', cls || 'jugar', txt); b.type = 'button'; b.addEventListener('click', fn); return b; };
  const B = n => (window.CarreraRed && window.CarreraRed.bonito ? window.CarreraRed.bonito(n) : String(n || ''));
  const primer = n => B(n).trim().split(/\s+/)[0] || '';
  const profe = n => 'Profe ' + primer(n);
  const COLOR_P = [0x0e9aa0, 0xffc23a, 0x2f9e5d, 0x8e6bd8, 0xff8fb1, 0x3d7bd9, 0x15304d];

  function capa() { return { caja: $('salaCaja'), ver(si) { $('sala').classList.toggle('oculto', !si); } }; }
  function pintar(nodos, ancho) {
    const c = capa(); $('inicio').classList.add('oculto'); c.caja.innerHTML = ''; c.caja.className = 'tarjeta sala' + (ancho ? ' ancha' : '');
    nodos.forEach(n => n && c.caja.appendChild(n)); c.ver(true);
  }
  function caras(M, lista, yoId) {
    const g = el('div', 'caras');
    lista.forEach((p, i) => {
      const c = el('div', 'cara' + (p.fuera ? ' fuera' : ''));
      c.append(M.avatar({ foto: p.foto, iniciales: M.inicialesDe(p.nombre), color: COLOR_P[i % COLOR_P.length] }, 'av'), el('span', null, p.id === yoId ? 'Tú' : primer(p.nombre)));
      g.appendChild(c);
    });
    return g;
  }
  function avisoRed(txt) { const a = $('redAviso'); a.textContent = txt || ''; a.classList.toggle('oculto', !txt); }

  /* =================== DOCENTE: la sala =================== */
  function docente(M) {
    let anf = null, fase = 'grupos', grupo = null, practica = M.practica(), seq = 0, estadoT = 0, vivo = true;
    let tor = null, actual = null; // el torneo en curso {pistas, i} y la carrera que corre {pista, torneo}
    const plan = M.plan(); // lo elegido en la sala: {modo: 'una' | 'torneo', pista, lista}; el selector lo cambia en sitio
    const planMsg = () => ({ modo: plan.modo, pista: plan.pista, lista: plan.lista.slice() });
    const jug = new Map(); // uid → {id, nombre, foto, animal, fuera, ctx}

    const lista = () => [...jug.values()].filter(p => !p.fuera || fase === 'carrera' || fase === 'cuenta').map(p => ({ id: p.id, nombre: p.nombre, foto: p.foto, animal: p.animal }));
    const enviar = (uid, msg) => anf && anf.enviar(uid, msg);
    const todos = msg => anf && anf.todos(msg);

    function grupos() {
      fase = 'grupos';
      const lst = el('div', 'grupos', 'Cargando tus grupos…');
      pintar([el('h2', null, 'Jugar con mi grupo'), el('p', 'sub', 'Elige el grupo. Abres una sala, la proyectas y tus estudiantes entran desde su pantalla.'), lst, boton('Volver', 'sec', salir)]);
      (J3.grupos ? J3.grupos() : Promise.resolve([])).then(gs => {
        lst.innerHTML = '';
        if (!gs || !gs.length) { lst.textContent = 'No encontramos grupos tuyos en el año que tienes elegido.'; return; }
        gs.forEach(g => {
          const b = boton('', 'grupo', () => abrir(g));
          b.dataset.id = g.id;
          b.append(el('b', null, g.nombre), el('span', null, g.titular ? 'Eres titular' : 'Tu grupo'));
          lst.appendChild(b);
        });
      }).catch(() => { lst.textContent = 'No se pudieron cargar tus grupos. Revisa la conexión.'; });
    }

    async function abrir(g) {
      grupo = g; fase = 'abriendo';
      pintar([el('h2', null, 'Abriendo la sala…'), el('p', 'sub', g.nombre)]);
      try { anf = await window.Sala.abrir({ juego: 'carrera', grupo_id: g.id }); }
      catch (e) {
        pintar([el('h2', null, 'No se pudo abrir la sala'), el('p', 'sub', e && e.message ? e.message : 'Revisa la conexión e inténtalo otra vez.'), boton('Intentar otra vez', 'jugar', () => abrir(g)), boton('Volver', 'sec', salir)]);
        return;
      }
      if (!vivo) { anf.cerrar(); return; }
      anf.en('entra', p => llega(p, false));
      anf.en('vuelve', p => llega(p, true));
      anf.en('sale', (p, motivo) => {
        const j = jug.get(p.user_id); if (!j) return;
        if (fase === 'carrera' || fase === 'cuenta' || fase === 'fin') { j.fuera = true; M.fuera(j.id, true); }
        else { jug.delete(p.user_id); todos({ t: 'lista', lista: lista() }); }
        if (fase === 'espera') sala();
        void motivo;
      });
      anf.en('mensaje', recibir);
      anf.en('perdida', () => {
        clearInterval(estadoT);
        pintar([el('h2', null, 'La sala se cerró'), el('p', 'sub', 'Se perdió la conexión con el servidor. Puedes abrir otra.'), boton('Abrir otra sala', 'jugar', () => { anf = null; jug.clear(); grupos(); }), boton('Salir', 'sec', salir)]);
      });
      fase = 'espera'; sala();
    }

    function llega(p, vuelve) {
      const viejo = jug.get(p.user_id);
      const j = viejo || { id: p.user_id, nombre: p.nombre, foto: p.foto, animal: 'zorro', ctx: null };
      j.fuera = false; j.listo = false; jug.set(p.user_id, j);
      if (viejo) M.fuera(j.id, false);
      void vuelve;
    }

    // contexto de preguntas de cada alumno: el mismo generador del modo solo, uno por cabeza
    function ctx(j) {
      if (!j.ctx || j.ctx.modo !== practica.modo || j.ctx.tabla !== practica.tabla || j.ctx.lectura !== practica.lectura) j.ctx = { modo: practica.modo, tabla: practica.tabla, lectura: practica.lectura, ultimas: [], cola: [], actual: null };
      return j.ctx;
    }
    function preguntar(j) {
      if (fase !== 'carrera' || j.fuera) return;
      const c = ctx(j), q = M.pregunta(c);
      c.actual = { id: ++seq, correcta: q.correcta, enviada: performance.now(), lista: false };
      enviar(j.id, { t: 'q', id: c.actual.id, texto: q.texto, ops: q.ops, larga: q.larga });
    }

    function recibir(p, msg) {
      const j = jug.get(p.user_id); if (!j) return;
      if (msg.t === 'hola') {
        if (M.ANIMALES[msg.animal]) j.animal = msg.animal;
        j.listo = true;
        const racing = fase === 'carrera' || fase === 'cuenta';
        if (racing && M.sumar({ id: j.id, nombre: j.nombre, foto: j.foto, animal: j.animal })) todos({ t: 'lista', lista: M.corredores() });
        enviar(j.id, { t: 'bienvenida', yo: j.id, fase: racing ? 'carrera' : fase === 'fin' ? 'fin' : 'espera', practica, lectura: practica.modo === 'lectura' ? M.lectura(practica.lectura) : null,
          plan: planMsg(), pista: actual ? actual.pista : null, torneo: actual ? actual.torneo : null,
          lista: racing ? M.corredores() : lista(), estado: racing ? M.estado() : null, codigo: anf.sala.codigo, aciertos: j.ok || 0, errores: j.mal || 0 });
        if (fase === 'carrera') { M.fuera(j.id, false); preguntar(j); const pd = M.poderDe(j.id); if (pd) enviar(j.id, { t: 'p', ev: { tipo: 'gana', poder: pd, de: j.id } }); }
        else if (fase === 'espera') { todos({ t: 'lista', lista: lista() }); sala(); }
      } else if (msg.t === 'r' && fase === 'carrera') {
        const c = j.ctx, a = c && c.actual;
        if (!a || a.lista || msg.q !== a.id || typeof msg.i !== 'number') return;
        a.lista = true;
        const bien = msg.i === a.correcta, rapida = bien && (performance.now() - a.enviada) / 1000 <= M.rapida(practica.modo) + 0.3;
        const res = M.responderRed(j.id, bien, rapida);
        if (res) { if (bien) j.ok = (j.ok || 0) + 1; else j.mal = (j.mal || 0) + 1; }
        enviar(j.id, { t: 'v', q: a.id, bien, correcta: a.correcta, rapida, carga: res ? res.carga : 0 });
        if (res) setTimeout(() => { if (j.ctx === c && c.actual === a) preguntar(j); }, bien ? 600 : 1400);
      } else if (msg.t === 'u' && fase === 'carrera') M.usarRed(j.id);
    }

    function selectorPractica() {
      const s = el('select', 'practica'); s.setAttribute('aria-label', 'Qué practican');
      const op = (v, t) => { const o = el('option', null, t); o.value = v; s.appendChild(o); };
      M.D.tablas.disponibles.forEach(t => op('tablas:' + t, 'Tabla del ' + t));
      op('tablas:mezcla', 'Tablas mezcladas');
      M.D.lecturas.forEach(l => op('lectura:' + l.id, 'Lectura: ' + l.titulo + ' (' + l.grado + ')'));
      s.value = practica.modo === 'tablas' ? 'tablas:' + practica.tabla : 'lectura:' + practica.lectura;
      s.addEventListener('change', () => {
        const [m, v] = s.value.split(':');
        practica = m === 'tablas' ? { modo: 'tablas', tabla: v === 'mezcla' ? v : +v, lectura: practica.lectura } : { modo: 'lectura', tabla: practica.tabla, lectura: v };
        avisarPlan();
      });
      return s;
    }
    function avisarPlan() { todos({ t: 'practica', practica, lectura: practica.modo === 'lectura' ? M.lectura(practica.lectura) : null, plan: planMsg() }); }

    // la sala de espera, para proyectar: código grande, quién va entrando, Empezar
    function sala() {
      fase = 'espera';
      const s = anf.sala, l = lista().filter(p => jug.get(p.id).listo);
      const izq = el('div', 'sizq');
      izq.append(el('div', 'paso', s.grupo_nombre || (grupo && grupo.nombre) || 'Tu grupo'), el('h2', null, 'Entren a la carrera'),
        el('p', 'sub', 'En su pantalla: Juegos › Turbo Saber › Entrar. O con este código:'));
      const cod = el('div', 'codigo'); String(s.codigo || '').split('').forEach(ch => cod.appendChild(el('b', null, ch))); izq.appendChild(cod);
      const pr = el('label', 'prac'); pr.append(el('span', null, 'Practican'), selectorPractica()); izq.appendChild(pr);
      const pp = el('div', 'ppista'); pp.append(el('span', null, 'Pista'), M.selectorPistas(plan, (p, ver) => { if (ver) M.verPista(ver); avisarPlan(); }));
      const der = el('div', 'sder');
      der.appendChild(el('div', 'cuantos', l.length ? l.length + (l.length === 1 ? ' estudiante en la sala' : ' estudiantes en la sala') : 'Todavía no entra nadie'));
      der.appendChild(l.length ? caras(M, l) : el('p', 'vacio', 'Cuando abran la Carrera verán tu invitación. Sus fotos van a ir apareciendo aquí.'));
      const bt = el('div', 'sbtns');
      const emp = boton('Empezar', 'jugar', empezar); emp.disabled = !l.length;
      bt.append(emp, boton('Cerrar sala', 'sec', cerrar));
      der.appendChild(bt);
      pintar([izq, der, pp], true);
    }

    // seguir: la siguiente carrera del mismo torneo (si no, empieza uno nuevo o una carrera suelta)
    function empezar(seguir) {
      const l = lista().filter(p => jug.get(p.id).listo);
      if (!l.length) return;
      if (seguir !== true) tor = plan.modo === 'torneo' ? { pistas: M.completarTorneo(plan.lista), i: 0 } : null;
      actual = { pista: tor ? tor.pistas[tor.i] : plan.pista, torneo: tor ? { i: tor.i, pistas: tor.pistas.slice() } : null };
      fase = 'cuenta';
      jug.forEach(j => { j.ctx = null; j.ok = 0; j.mal = 0; });
      capa().ver(false);
      M.empezar({ papel: 'tablero', lista: l, practica, codigo: anf.sala.codigo, pista: actual.pista, torneo: actual.torneo });
      todos({ t: 'empieza', practica, lista: M.corredores(), lectura: practica.modo === 'lectura' ? M.lectura(practica.lectura) : null, pista: actual.pista, torneo: actual.torneo });
      clearInterval(estadoT);
      estadoT = setInterval(() => { if (fase === 'carrera') todos(Object.assign({ t: 'e' }, M.estado())); }, 200);
    }

    const ctrl = {
      sala: () => anf ? { id: anf.sala.id, codigo: anf.sala.codigo, fase, jugadores: lista().length } : { fase },
      arranca() { fase = 'carrera'; jug.forEach(j => { if (!j.fuera) preguntar(j); }); },
      poder(ev) { if (fase === 'carrera' && ev.tipo !== 'contacto') todos({ t: 'p', ev }); },
      fin() { fase = 'fin'; clearInterval(estadoT); jug.forEach(j => { if (j.ctx) j.ctx.actual = null; }); todos(Object.assign({ t: 'fin', torneo: M.torneo() }, M.estado())); },
      siguiente() {
        if (!tor || tor.i >= tor.pistas.length - 1) return;
        tor.i++;
        jug.forEach((j, k) => { if (j.fuera) jug.delete(k); });
        $('fin').classList.add('oculto');
        empezar(true);
      },
      terminar() { M.terminar(); },
      otra() {
        tor = null; actual = null;
        jug.forEach((j, k) => { if (j.fuera) jug.delete(k); });
        todos({ t: 'espera' }); todos({ t: 'lista', lista: lista() });
        $('fin').classList.add('oculto');
        sala();
      },
      async cerrar() { await cerrar(); },
      salir() { cerrar(); }
    };
    async function cerrar() {
      vivo = false; clearInterval(estadoT); capa().ver(false);
      const a = anf; anf = null;
      M.salir();
      if (a) await a.cerrar();
    }
    function salir() { cerrar(); }

    grupos();
    return ctrl;
  }

  /* =================== ALUMNO =================== */
  function alumno(M, salaInfo) {
    let fase = 'entrando', yo = null, lista = [], practica = null, lectura = null, enCarrera = false, bienvenido = false, plan = null;
    const verPlan = () => { if (plan) M.verPista(plan.modo === 'torneo' ? plan.lista[0] || plan.pista : plan.pista); };
    const quien = profe(salaInfo.docente_nombre);
    const inv = window.Sala.entrar(salaInfo);

    function entrando(txt) {
      const cab = el('div', 'quien');
      cab.append(M.avatar({ foto: salaInfo.docente_foto, iniciales: M.inicialesDe(salaInfo.docente_nombre), color: 0x0e9aa0 }, 'av grande'), el('div', null, quien));
      pintar([cab, el('h2', null, txt || 'Entrando a la sala…'), el('p', 'sub', (salaInfo.grupo_nombre || '') + ' · código ' + (salaInfo.codigo || '')), el('div', 'cargador'), boton('Cancelar', 'sec', salir)]);
    }
    function espera() {
      fase = 'espera';
      const cab = el('div', 'quien');
      cab.append(M.avatar({ foto: salaInfo.docente_foto, iniciales: M.inicialesDe(salaInfo.docente_nombre), color: 0x0e9aa0 }, 'av grande'), el('div', null, quien));
      const n = [cab, el('h2', null, '¡Estás en la sala!'), el('p', 'sub', 'Espera a que ' + quien + ' empiece la carrera.')];
      if (practica) n.push(el('div', 'ptag', M.nombrePractica(practica)));
      if (plan) n.push(el('div', 'ptag', M.nombrePlan(plan)));
      if (lectura) { const t = el('div', 'texto'); t.append(el('b', null, lectura.titulo), el('p', null, lectura.texto)); n.push(el('p', 'sub', 'Mientras tanto, lee el texto: las preguntas salen de aquí.'), t); }
      n.push(el('div', 'cuantos', lista.length + (lista.length === 1 ? ' en la sala' : ' en la sala')), caras(M, lista, yo), boton('Salir de la sala', 'sec', salir));
      pintar(n);
    }
    function terminar(titulo, txt, reintentar) {
      fase = 'cerrada'; avisoRed('');
      const n = [el('h2', null, titulo), el('p', 'sub', txt)];
      if (reintentar) n.push(boton('Intentar otra vez', 'jugar', () => { capa().ver(false); M.entrar(salaInfo); }));
      n.push(boton('Jugar solo', reintentar ? 'sec' : 'jugar', () => { capa().ver(false); M.salir(); }));
      enCarrera = false; M.alLobby();
      pintar(n);
    }

    inv.en('estado', e => {
      if (e === 'abierto') { avisoRed(''); inv.enviar({ t: 'hola', animal: M.animal() }); }
      else if (e === 'reconectando') { if (enCarrera) avisoRed('Se fue la conexión. Reconectando…'); else if (fase !== 'cerrada') entrando('Reconectando…'); }
    });
    inv.en('fin', motivo => {
      if (motivo === 'reemplazado') terminar('Entraste desde otra pantalla', 'Aquí se cerró la sala. Puedes seguir jugando solo.');
      else if (motivo === 'error') terminar('No pudimos entrar', 'Revisa el wifi e inténtalo otra vez.', true);
      else terminar(quien + ' cerró la sala', 'La carrera en grupo terminó. Puedes seguir jugando solo.');
    });
    inv.en('mensaje', msg => {
      if (msg.t === 'bienvenida') {
        bienvenido = true; yo = msg.yo; practica = msg.practica || null; lectura = msg.lectura || null; lista = Array.isArray(msg.lista) ? msg.lista : []; plan = msg.plan || null;
        avisoRed('');
        if (msg.fase === 'carrera') {
          capa().ver(false); enCarrera = true; fase = 'carrera';
          M.empezar({ papel: 'alumno', yo, lista, practica, pista: msg.pista, torneo: msg.torneo, fase: 'carrera', t: msg.estado ? msg.estado.s : 0, codigo: msg.codigo, aciertos: msg.aciertos, errores: msg.errores });
          if (msg.estado) M.aplicarEstado(msg.estado);
        } else { if (enCarrera) enCarrera = false; M.alLobby(); verPlan(); espera(); }
        return;
      }
      if (!bienvenido) return; // nada del estado antes del primero
      switch (msg.t) {
        case 'lista':
          lista = Array.isArray(msg.lista) ? msg.lista : lista;
          if (enCarrera) lista.forEach(p => M.sumar(p)); else if (fase === 'espera') espera();
          break;
        case 'practica': practica = msg.practica; lectura = msg.lectura || null; plan = msg.plan || plan; if (fase === 'espera') { verPlan(); espera(); } break;
        case 'empieza':
          practica = msg.practica; lectura = msg.lectura || null; lista = msg.lista || lista;
          capa().ver(false); enCarrera = true; fase = 'carrera';
          M.empezar({ papel: 'alumno', yo, lista, practica, pista: msg.pista, torneo: msg.torneo });
          break;
        case 'q': if (enCarrera) M.pregunta2(msg); break;
        case 'v': if (enCarrera) M.veredicto(msg); break;
        case 'e': if (enCarrera) M.aplicarEstado(msg); break;
        case 'p': if (enCarrera && msg.ev) M.poder(msg.ev); break;
        case 'fin': if (enCarrera) { fase = 'fin'; M.finRed(msg); } break;
        case 'espera': enCarrera = false; M.alLobby(); verPlan(); espera(); break;
      }
    });

    function salir() { inv.salir(); avisoRed(''); capa().ver(false); fase = 'cerrada'; enCarrera = false; M.salir(); }

    entrando();
    return {
      sala: () => ({ id: salaInfo.id, codigo: salaInfo.codigo, fase, yo }),
      responder(q, i) { inv.enviar({ t: 'r', q, i }); },
      usarPoder() { inv.enviar({ t: 'u' }); },
      salir,
      cerrar: salir
    };
  }

  window.CarreraRed = {
    docente(M) { this.bonito = M.bonito; return docente(M); },
    alumno(M, sala) { this.bonito = M.bonito; return alumno(M, sala); }
  };
})();
