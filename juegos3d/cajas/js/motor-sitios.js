// Cajas de Palabras — dónde aparecen las respuestas: celdas alcanzables y muestreo disperso.
// El modelo de salto es el de .pruebas/juego-cajas/validar-mapa.mjs, con su margen de comodidad.
(function () {
  'use strict';
  const M = CAJAS.M;

  // Grafo de celdas «de pie» (vacío con sólido debajo). Devuelve el conjunto que se alcanza desde P
  // y desde el que se puede volver a P (componente fuerte), más los vecinos para quien lo quiera recorrer.
  M.alcance = function (p, fis, nivelIdx) {
    const W = p.W, H = p.H;
    const at = (x, y) => (y < 0 || x < 0 || x >= W) ? '#' : (y >= H ? '.' : p.g[y][x]);
    const solido = (x, y) => at(x, y) === '#' || at(x, y) === '=';
    const duro = (x, y) => at(x, y) === '#';
    const key = (x, y) => x + ',' + y;
    const P = p.P;
    if (fis.nadar) {
      // todo es agua: basta con estar conectado (4 vecinos) a P
      const vis = new Set([key(P.c, P.r)]);
      const q = [[P.c, P.r]];
      while (q.length) {
        const [x, y] = q.shift();
        for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
          const tx = x + dx, ty = y + dy;
          if (tx < 0 || ty < 0 || tx >= W || ty >= H || solido(tx, ty)) continue;
          const k = key(tx, ty);
          if (!vis.has(k)) { vis.add(k); q.push([tx, ty]); }
        }
      }
      return { celdas: vis, nadar: true };
    }
    const g = fis.gravedad, v = fis.salto, vel = fis.velocidad;
    const subir = Math.floor((v * v) / (2 * g) / 64 - 0.2);
    const lado = Math.floor((vel * ((2 * v) / g)) / 64 - 0.3);
    const sub = Math.max(1, subir - (nivelIdx === 0 ? 1 : 0)), lad = Math.max(2, lado - 1);
    const pie = (x, y) => y >= 0 && y < H && x >= 0 && x < W && !solido(x, y) && solido(x, y + 1) && at(x, y) !== '~' && at(x, y) !== '^';
    const caer = (x, y) => { while (y < H && !solido(x, y + 1)) { y++; if (at(x, y) === '~') return null; } return y >= H - 1 && !solido(x, y + 1) ? null : [x, y]; };
    const vecinos = (x, y) => {
      const r = [];
      for (let dx = -lad; dx <= lad; dx++) for (let dy = -sub; dy <= 0; dy++) {
        const tx = x + dx, ty = y + dy;
        if (!pie(tx, ty)) continue;
        let libre = true;
        for (let k = 1; k <= -dy + 1 && libre; k++) { if (duro(x, y - k) && dy < 0) libre = false; }
        if (libre) r.push([tx, ty]);
      }
      for (const dx of [-1, 1]) { const tx = x + dx; if (tx >= 0 && tx < W && !solido(tx, y)) { const c = caer(tx, y); if (c) r.push(c); } }
      for (let dx = -lad; dx <= lad; dx++) { const tx = x + dx; if (tx >= 0 && tx < W && !solido(tx, y - 1) && !solido(tx, y)) { const c = caer(tx, y); if (c) r.push(c); } }
      return r;
    };
    const ini = caer(P.c, P.r) || [P.c, P.r];
    const ida = new Map(); // celda -> vecinos
    const vis = new Set([key(...ini)]);
    const q = [ini];
    while (q.length) {
      const [x, y] = q.shift();
      const vs = vecinos(x, y);
      ida.set(key(x, y), vs);
      for (const n of vs) { const k = key(...n); if (!vis.has(k)) { vis.add(k); q.push(n); } }
    }
    const inv = new Map();
    for (const [k, vs] of ida) for (const n of vs) { const kn = key(...n); if (!inv.has(kn)) inv.set(kn, []); inv.get(kn).push(k); }
    // desde(k): celdas a las que se llega desde k; hacia(k): celdas desde las que se llega a k
    const bfs = (k0, adj) => {
      const out = new Set([k0]); const qq = [k0];
      while (qq.length) { const k = qq.shift(); for (const o of adj(k)) if (!out.has(o)) { out.add(o); qq.push(o); } }
      return out;
    };
    const desde = k0 => bfs(k0, k => (ida.get(k) || []).map(n => key(...n)));
    const hacia = k0 => bfs(k0, k => inv.get(k) || []);
    const celdas = vis;
    return { celdas, ida, desde, hacia, nadar: false, sub, lad, pie };
  };

  // Rectángulos (en celdas) que ocupa cada enemigo con su recorrido.
  M.zonasEnemigos = function (p, mundo) {
    const out = [];
    for (const e of p.enemigos) {
      const d = (mundo.enemigos || {})[e.ch];
      if (!d) continue;
      const comp = d.comportamiento || 'fijo';
      const rg = d.rango == null ? 3 : Number(d.rango);
      let x1 = e.c, x2 = e.c, y1 = e.r, y2 = e.r;
      if (comp === 'patrulla') {
        while (x1 - 1 >= 0 && !M.solido(p, e.r, x1 - 1) && M.apoyo(p, e.r + 1, x1 - 1)) x1--;
        while (x2 + 1 < p.W && !M.solido(p, e.r, x2 + 1) && M.apoyo(p, e.r + 1, x2 + 1)) x2++;
        x1--; x2++;
      } else if (comp === 'nada' || comp === 'desliza') { x1 -= Math.ceil(rg); x2 += Math.ceil(rg); }
      else if (comp === 'flota') { y1 -= Math.ceil(rg / 2); y2 += Math.ceil(rg / 2); }
      else if (comp === 'gira' || comp === 'atrae') { const k = Math.ceil(rg); x1 -= k; x2 += k; y1 -= k; y2 += k; }
      else if (comp === 'salta') { y1 -= Math.ceil(Math.max(1, rg)); x1--; x2++; }
      out.push({ x1, x2, y1, y2 });
    }
    return out;
  };

  // Celdas candidatas para una respuesta, con la distancia al peligro más cercano (en celdas, Chebyshev).
  M.candidatosRespuesta = function (p, mundo, alc) {
    const pel = M.zonasEnemigos(p, mundo);
    for (let r = 0; r < p.H; r++) for (let c = 0; c < p.W; c++) {
      const k = p.g[r][c];
      if (k === '^' || k === '~' || k === '|' || M.esAgua(p, r, c)) pel.push({ x1: c, x2: c, y1: r, y2: r });
    }
    const objetos = [...p.cajas.map(cj => ({ r: cj.r, c: cj.c })), ...(p.libro ? [p.libro] : []), p.P];
    const libre = (r, c) => { const k = M.celda(p, r, c); return k !== '#' && k !== '=' && k !== 'G' && !M.esRompible(k); };
    const out = [];
    for (const kk of alc.celdas) {
      const [c, r] = kk.split(',').map(Number);
      // la tarjeta (≈3 bloques de ancho) no puede quedar metida en terreno
      if (!libre(r, c - 1) || !libre(r, c + 1) || !libre(r, c)) continue;
      if (alc.nadar && (!libre(r - 1, c) && !libre(r + 1, c))) continue;
      if (objetos.some(o => Math.abs(o.r - r) <= 1 && Math.abs(o.c - c) <= 2)) continue;
      let dist = 99;
      for (const z of pel) {
        const dx = c < z.x1 ? z.x1 - c : c > z.x2 ? c - z.x2 : 0;
        const dy = r < z.y1 ? z.y1 - r : r > z.y2 ? r - z.y2 : 0;
        dist = Math.min(dist, Math.max(dx, dy));
      }
      out.push({ r, c, peligro: dist });
    }
    return out;
  };

  // Elige n sitios dispersos: el primero cerca del jugador, el resto por punto más lejano con algo de azar.
  M.elegirSitios = function (cands, n, evitar, jug, rnd) {
    let pool = [];
    for (const radio of [3, 2, 1, 0]) {
      pool = cands.filter(s => s.peligro >= radio && evitar.every(e => Math.max(Math.abs(e.r - s.r), Math.abs(e.c - s.c)) >= Math.max(radio, 2)));
      if (pool.length >= n * 3) break;
    }
    if (!pool.length) return [];
    const d2 = (a, b) => { const dx = a.c - b.c, dy = (a.r - b.r) * 1.6; return dx * dx + dy * dy; };
    const elegidos = [];
    const cerca = pool.filter(s => { const d = Math.sqrt(d2(s, jug)); return d >= 5 && d <= 16; });
    elegidos.push((cerca.length ? cerca : pool)[Math.floor(rnd() * (cerca.length || pool.length))]);
    while (elegidos.length < n) {
      const resto = pool.filter(s => !elegidos.includes(s))
        .map(s => ({ s, d: Math.min(...elegidos.map(e => d2(s, e))) }))
        .filter(x => x.d >= 9) // separadas al menos ~3 bloques
        .sort((a, b) => b.d - a.d);
      if (!resto.length) break;
      // entre el 35 % más lejano, uno al azar: dispersas pero no todas en las esquinas
      const top = Math.max(1, Math.ceil(resto.length * 0.35));
      elegidos.push(resto[Math.floor(rnd() * top)].s);
    }
    return elegidos;
  };
})();
