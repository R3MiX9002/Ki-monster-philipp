// services/units.js
// Minimal SI unit system & dimensional analysis helper.
const SI = {
  base: { m: 'length', kg: 'mass', s: 'time', A: 'current', K: 'temperature', mol: 'amount', cd: 'luminous' },
  derived: { N: 'kg*m/s^2', J: 'N*m', W: 'J/s', Pa: 'N/m^2', C: 'A*s', V: 'W/A', Ohm: 'V/A', Hz: '1/s' }
};

function parseQuantity(str) {
  // pattern: number + unit, e.g., "9.81 m/s^2" or "10 N"
  const m = String(str).trim().match(/^([+-]?\d+(?:\.\d+)?(?:e[+-]?\d+)?)\s*([a-zA-Z\/\^\*\-0-9]+)$/);
  if (!m) return null;
  const value = parseFloat(m[1]);
  const unit = m[2];
  return { value, unit };
}

module.exports = { SI, parseQuantity };
