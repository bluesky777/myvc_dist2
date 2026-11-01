/* global module */
/* Máquina Loca — los niveles (los 3 talleres) y su comprobación.
   Un nivel: { id, taller, nombre, idea (lo que enseña, una frase), bola: {x, y, vx?, vy?, tipo: balon|canica},
   canasta: [x, y] (el centro del fondo), muros: [[x1, y1, x2, y2, grosor?]], pesas?: [[x, y, vx?, vy?]],
   fijas?: [{t, c, f, a}] (piezas del nivel que no se mueven), piezas: {tipo: cuántas} (el inventario),
   especial: tipo (la pieza que gana una respuesta buena), tuerca?: [x, y] (la estrella extra),
   sol: [{t, c, f, a}] (una solución: la «Pista» la enseña pieza a pieza), dif: 1 a 3 }.
   MaquinaFisica.comprobar(nivel) asegura que cada uno se gana con sus piezas, que sin piezas no y que sin cualquiera de las
   de la solución tampoco (también en espejo). El juego lo hace antes de abrir cada máquina; para todos, desde esta carpeta:
     node -e "const F=require('./fisica.js'),N=require('./niveles.js');N.NIVELES.forEach(n=>{const r=F.comprobar(n);console.log(n.id,r.ok?'OK':r.errores)})" */
(function (raiz) {
'use strict';
const P = (t, c, f, a) => ({ t, c, f, a });
const NIVELES = [
  /* ---------- Taller 1: rampas y resortes ---------- */
  {
    id: 't1n1', taller: 1, dif: 1, nombre: 'El primer plano inclinado', especial: 'tabla',
    idea: 'Un plano inclinado cambia el camino de la pelota: la gravedad la hace rodar hacia abajo por él.',
    bola: { x: 1.5, y: 8.35, vx: 2.5 }, canasta: [10, 0.15],
    muros: [[0, 8, 3, 8], [7, 0, 7, 0.9]],
    piezas: { rampa: 1 },
    tuerca: [6.1, 6.5],
    sol: [P('rampa', 4, 6, -15)]
  },
  {
    id: 't1n2', taller: 1, dif: 1, nombre: 'Zigzag', especial: 'tabla',
    idea: 'Dos planos inclinados seguidos: la pelota baja de un lado a otro, como por una escalera de rampas.',
    bola: { x: 10.5, y: 9.4, vx: -2 }, canasta: [1.6, 0.15],
    muros: [[0, 2.4, 3.4, 2.4], [8, 9, 11, 9]],
    piezas: { rampa: 2 },
    tuerca: [7.3, 8.4],
    sol: [P('rampa', 8, 6, 30), P('rampa', 3, 1, 15)]
  },
  {
    id: 't1n3', taller: 1, dif: 1, nombre: 'El resorte', especial: 'tabla',
    idea: 'El resorte se aplasta, guarda la energía del golpe y la devuelve: la pelota sale rebotada casi a la misma altura.',
    bola: { x: 1.5, y: 8.4, vx: 2 }, canasta: [10, 0.15],
    muros: [[0, 8, 2.4, 8], [7, 0, 7, 4, 0.2]],
    piezas: { resorte: 1 },
    tuerca: [7.0, 5.8],
    sol: [P('resorte', 3, 5, -30)]
  },
  {
    id: 't1n4', taller: 1, dif: 2, nombre: 'Rampa y resorte', especial: 'ventilador',
    idea: 'Primero la rampa le da velocidad; luego el resorte la lanza por encima del muro.',
    bola: { x: 14.5, y: 9.4, vx: -2 }, canasta: [2.5, 0.15],
    muros: [[13, 9, 16, 9], [6, 0, 6, 4.5, 0.2]],
    piezas: { rampa: 1, resorte: 1 },
    tuerca: [11.0, 7.1],
    sol: [P('rampa', 11, 6, 15), P('resorte', 8, 4, 45)]
  },
  {
    id: 't1n5', taller: 1, dif: 2, nombre: 'La escalera de tablas', especial: 'resorte',
    idea: 'Tres planos inclinados cortos, uno debajo de otro: la pelota baja en zigzag y salta el muro.',
    bola: { x: 1.5, y: 9.4, vx: 2 }, canasta: [5.8, 0.15],
    muros: [[0, 9, 2.6, 9], [4.4, 0, 4.4, 1.3]],
    piezas: { tabla: 3 },
    tuerca: [6.6, 5.9],
    sol: [P('tabla', 3, 7, -15), P('tabla', 6, 5, 15), P('tabla', 3, 3, -15)]
  },
  /* ---------- Taller 2: palancas y poleas ---------- */
  {
    id: 't2n1', taller: 2, dif: 2, nombre: 'La catapulta', especial: 'tabla',
    idea: 'La palanca gira en su punto de apoyo: si la pesa cae en una punta, la otra punta sube y lanza la pelota.',
    sinTubo: true, bola: { x: 4.0, y: 1.45 }, canasta: [13.4, 5.0],
    pesas: [[11.5, 7.45, -2]],
    fijas: [P('palanca', 5, 1, 1)],
    muros: [[10, 7, 12.5, 7], [12.3, 4.9, 14.5, 4.9]],
    piezas: { rampa: 1 },
    tuerca: [8.6, 6.8],
    sol: [P('rampa', 9, 5, 45)]
  },
  {
    id: 't2n2', taller: 2, dif: 2, nombre: 'Pon la palanca', especial: 'resorte',
    idea: 'La pelota cae en una punta de la palanca y la pesa en la otra: la pesa, más pesada, la lanza por los aires.',
    bola: { x: 3.8, y: 5.6 }, canasta: [14.4, 2.0],
    pesas: [[10.8, 8.45, -2.2]],
    muros: [[7.6, 8, 12, 8], [13.4, 1.9, 15.4, 1.9]],
    piezas: { palanca: 1 },
    tuerca: [8.8, 9.7],
    sol: [P('palanca', 5, 3, 1)]
  },
  {
    id: 't2n3', taller: 2, dif: 2, nombre: 'La polea', especial: 'tabla',
    idea: 'La polea cambia la dirección de la fuerza: cuando la pesa baja en una cubeta, la otra cubeta sube con la pelota.',
    sinTubo: true, bola: { x: 9.45, y: 5.8 }, canasta: [14.2, 3.5],
    pesas: [[3.6, 9.05, 2.6]],
    fijas: [P('polea', 8, 8, 0)],
    muros: [[1.5, 8.6, 5, 8.6], [10.2, 6.7, 13.2, 6.7], [13.2, 3.4, 15.3, 3.4]],
    piezas: { rampa: 1 },
    tuerca: [9.7, 8.8],
    sol: [P('rampa', 5, 7, 0)]
  },
  {
    id: 't2n4', taller: 2, dif: 3, nombre: 'Pon la polea', especial: 'tabla',
    idea: 'La pelota cae en una cubeta y espera; cuando la pesa cae en la otra, la pelota sube y sale por la puerta de arriba.',
    bola: { x: 9.5, y: 9.4 }, canasta: [11.2, 0.15],
    pesas: [[3.5, 9.45, 1.8]],
    muros: [[3, 9, 6.1, 9], [10.3, 0, 10.3, 0.9]],
    piezas: { polea: 1 },
    tuerca: [9.7, 8.6],
    sol: [P('polea', 8, 7, 0)]
  },
  /* ---------- Taller 3: aire, imanes y motores ---------- */
  {
    id: 't3n1', taller: 3, dif: 1, nombre: 'El ventilador', especial: 'tabla',
    idea: 'El aire del ventilador empuja sin tocar: es una fuerza, y empuja más a lo liviano que a lo pesado.',
    bola: { x: 6.5, y: 9.4 }, canasta: [11.5, 0.15],
    muros: [[9.5, 0, 9.5, 1.5]],
    piezas: { ventilador: 1 },
    tuerca: [7.7, 6.2],
    sol: [P('ventilador', 6, 5, 0)]
  },
  {
    id: 't3n2', taller: 3, dif: 1, nombre: 'La cinta transportadora', especial: 'ventilador',
    idea: 'La cinta tiene un motor: con el rozamiento arrastra la pelota hacia donde gira.',
    bola: { x: 10.5, y: 9.4 }, canasta: [6, 1.6],
    muros: [[4.9, 1.5, 7.1, 1.5], [4.9, 1.5, 4.9, 0], [7.1, 1.5, 7.1, 0]],
    piezas: { cinta: 1 },
    tuerca: [8.9, 6.0],
    sol: [P('cinta', 9, 5, -1)]
  },
  {
    id: 't3n3', taller: 3, dif: 1, nombre: 'El imán', especial: 'tabla',
    idea: 'El imán atrae el hierro y el acero a distancia: la canica de acero sí, el balón de cuero no.',
    sinTubo: true, bola: { x: 3.5, y: 5.37, tipo: 'canica' }, canasta: [7.5, 2.15],
    muros: [[0, 5, 6, 5], [6, 5, 6, 4], [6.6, 2.05, 8.4, 2.05]],
    piezas: { iman: 1 },
    tuerca: [7.9, 3.7],
    sol: [P('iman', 7, 5, 0)]
  },
  {
    id: 't3n4', taller: 3, dif: 2, nombre: 'Corriente de aire', especial: 'resorte',
    idea: 'Un ventilador que sopla hacia arriba vence a la gravedad: levanta la pelota liviana y la lleva por encima.',
    bola: { x: 2.5, y: 9.4, vx: 1.5 }, canasta: [12.5, 3.15],
    muros: [[0, 9, 2.4, 9], [11.3, 3, 13.7, 3], [11.3, 3, 11.3, 0], [13.7, 3, 13.7, 0], [7, 0, 7, 2.5, 0.2]],
    piezas: { ventilador: 1, tabla: 1 },
    tuerca: [8.8, 4.5],
    sol: [P('tabla', 3, 8, -15), P('ventilador', 8, 2, 90)]
  }
];
const TALLERES = [
  { n: 1, nombre: 'Rampas y resortes', emoji: '🛝', idea: 'Planos inclinados y energía elástica' },
  { n: 2, nombre: 'Palancas y poleas', emoji: '⚖️', idea: 'Máquinas que multiplican o cambian la fuerza' },
  { n: 3, nombre: 'Aire, imanes y motores', emoji: '🌀', idea: 'Fuerzas que empujan sin tocar' }
];
const N = { NIVELES, TALLERES };
if (typeof module !== 'undefined' && module.exports) module.exports = N; else raiz.MaquinaNiveles = N;
})(typeof window !== 'undefined' ? window : globalThis);
