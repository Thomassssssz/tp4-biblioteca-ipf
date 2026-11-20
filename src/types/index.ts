export type Libro = {
  isbn: string;        // 13 dígitos, sin guiones
  titulo: string;
  autor: string;
  anio: number;
  ejemplares: number;  // ejemplares en el estante al iniciar la app
};

//estante: sale de los ejemplares disponibles; mostrador: copia devuelta entregada desde la lista de espera
export type OrigenPrestamo = 'estante' | 'mostrador';

export type Prestamo = {
  isbn: string;
  fechaDevolucion: number;
  origen: OrigenPrestamo;
  notificacionId: string | null;
};

export type ReservaEnEspera = {
  isbn: string;
  posicion: number;
};

export type ResultadoReserva =
  | { tipo: 'prestamo'; fechaDevolucion: number }
  | { tipo: 'espera'; posicion: number }
  | { tipo: 'duplicada' }
  | { tipo: 'inexistente' };

export type Aviso = {
  id: string;
  mensaje: string;
  fecha: number;
  leido: boolean;
};

export type Sesion = {
  usuario: string;
};
