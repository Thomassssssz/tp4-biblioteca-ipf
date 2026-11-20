import type { Libro, Prestamo, ReservaEnEspera } from '../types';

export type FilaReservas =
  | { tipo: 'titulo'; clave: string; texto: string }
  | { tipo: 'vacio'; clave: string; texto: string }
  | { tipo: 'prestamo'; clave: string; prestamo: Prestamo; libro: Libro }
  | { tipo: 'espera'; clave: string; reserva: ReservaEnEspera; libro: Libro; total: number };

//arma una sola lista con las dos secciones para usar un unico flatlist
export function construirFilasReservas(
  prestamos: Prestamo[],
  reservas: ReservaEnEspera[],
  obtenerLibro: (isbn: string) => Libro | undefined,
  personasEnEspera: (isbn: string) => string[],
): FilaReservas[] {
  const filas: FilaReservas[] = [{ tipo: 'titulo', clave: 'titulo-prestamos', texto: 'Mis préstamos' }];

  for (const prestamo of prestamos) {
    const libro = obtenerLibro(prestamo.isbn);
    if (libro) {
      filas.push({ tipo: 'prestamo', clave: `prestamo-${prestamo.isbn}`, prestamo, libro });
    }
  }
  if (prestamos.length === 0) {
    filas.push({ tipo: 'vacio', clave: 'vacio-prestamos', texto: 'No tenés libros prestados.' });
  }

  filas.push({ tipo: 'titulo', clave: 'titulo-espera', texto: 'En lista de espera' });
  for (const reserva of reservas) {
    const libro = obtenerLibro(reserva.isbn);
    if (libro) {
      filas.push({
        tipo: 'espera',
        clave: `espera-${reserva.isbn}`,
        reserva,
        libro,
        total: personasEnEspera(reserva.isbn).length,
      });
    }
  }
  if (reservas.length === 0) {
    filas.push({ tipo: 'vacio', clave: 'vacio-espera', texto: 'No estás esperando ningún libro.' });
  }

  return filas;
}
