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

//posicion en la pila: identifica cada visita aunque el mismo libro aparezca dos veces
export type VistoReciente = {
  libro: Libro;
  posicion: number;
};

export type ReservaEnEspera = {
  isbn: string;
  posicion: number;
};

//lo que pasaria al confirmar, sin modificar el estado
export type AnticipoReserva =
  | { tipo: 'prestamo' }
  | { tipo: 'espera'; posicion: number }
  | { tipo: 'duplicada' }
  | { tipo: 'inexistente' };

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

export type RecursoPermiso = 'camara' | 'notificaciones';

export type EstadoPermiso = 'cargando' | 'concedido' | 'preguntable' | 'bloqueado';

export type Sesion = {
  usuario: string;
};
