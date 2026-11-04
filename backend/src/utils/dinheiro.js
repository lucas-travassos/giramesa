const LIMITE_CENTAVOS = 99999999; // DECIMAL(8,2).

function emCentavos(valor) {
  if (typeof valor !== 'number' && typeof valor !== 'string') return null;
  const partes = /^(\d{1,6})(?:\.(\d{1,2}))?$/.exec(String(valor).trim());
  if (!partes) return null;
  return Number(partes[1]) * 100 + Number((partes[2] || '').padEnd(2, '0'));
}

function formatarCentavos(valor) {
  return (valor / 100).toFixed(2);
}

module.exports = { emCentavos, formatarCentavos, LIMITE_CENTAVOS };
