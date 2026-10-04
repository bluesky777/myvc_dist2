// Registro de mundos: cada js/mundos/*.js llama a CAJAS.registrarMundo({...}) antes de que cargue el motor.
window.CAJAS = window.CAJAS || { mundos: [] };
CAJAS.registrarMundo = function (def) {
  try {
    if (!def || !def.id || !Array.isArray(def.niveles)) throw new Error('mundo sin id o sin niveles');
    CAJAS.mundos = CAJAS.mundos.filter(m => m.id !== def.id);
    CAJAS.mundos.push(def);
    CAJAS.mundos.sort((a, b) => (a.orden || 0) - (b.orden || 0));
  } catch (e) {
    console.error('[cajas] mundo no registrado:', e);
  }
};
