const MESES = [
  'enero',
  'febrero',
  'marzo',
  'abril',
  'mayo',
  'junio',
  'julio',
  'agosto',
  'septiembre',
  'octubre',
  'noviembre',
  'diciembre',
];

//formato propio para no depender del soporte de intl de cada motor de javascript
export function formatearFecha(milisegundos: number): string {
  const fecha = new Date(milisegundos);
  return `${fecha.getDate()} de ${MESES[fecha.getMonth()]} de ${fecha.getFullYear()}`;
}
