import { DIAS_PRESTAMO, USUARIO_ACTUAL } from '../constants/biblioteca';
import { ESPERAS_INICIALES, LIBROS } from '../data/libros';
import { Cola } from '../estructuras/Cola';
import { Pila } from '../estructuras/Pila';
import type {
  Aviso,
  Libro,
  OrigenPrestamo,
  Prestamo,
  ReservaEnEspera,
  ResultadoReserva,
  VistoReciente,
} from '../types';

//las estructuras guardadas aca nunca se mutan: cada cambio trabaja sobre una copia
export type EstadoBiblioteca = {
  prestamos: Prestamo[];
  esperas: Readonly<Record<string, Cola<string>>>;
  recientes: Pila<string>;
  avisos: Aviso[];
};

const MS_POR_DIA = 24 * 60 * 60 * 1000;

export function crearEstadoInicial(): EstadoBiblioteca {
  const esperas: Record<string, Cola<string>> = {};
  for (const [isbn, personas] of Object.entries(ESPERAS_INICIALES)) {
    esperas[isbn] = new Cola(personas);
  }
  return { prestamos: [], esperas, recientes: new Pila(), avisos: [] };
}

export function buscarLibroPorIsbn(isbn: string): Libro | undefined {
  return LIBROS.find((libro) => libro.isbn === isbn);
}

export function calcularDisponibles(estado: EstadoBiblioteca, isbn: string): number {
  const libro = buscarLibroPorIsbn(isbn);
  if (!libro) {
    return 0;
  }
  const prestadosDelEstante = estado.prestamos.filter(
    (prestamo) => prestamo.isbn === isbn && prestamo.origen === 'estante',
  ).length;
  return Math.max(0, libro.ejemplares - prestadosDelEstante);
}

export function obtenerPersonasEnEspera(estado: EstadoBiblioteca, isbn: string): string[] {
  return estado.esperas[isbn]?.aArray() ?? [];
}

export function obtenerPosicionEnEspera(estado: EstadoBiblioteca, isbn: string): number | null {
  const indice = obtenerPersonasEnEspera(estado, isbn).indexOf(USUARIO_ACTUAL);
  return indice === -1 ? null : indice + 1;
}

export function tieneReserva(estado: EstadoBiblioteca, isbn: string): boolean {
  return (
    estado.prestamos.some((prestamo) => prestamo.isbn === isbn) ||
    obtenerPosicionEnEspera(estado, isbn) !== null
  );
}

export function listarReservasEnEspera(estado: EstadoBiblioteca): ReservaEnEspera[] {
  const reservas: ReservaEnEspera[] = [];
  for (const isbn of Object.keys(estado.esperas)) {
    const posicion = obtenerPosicionEnEspera(estado, isbn);
    if (posicion !== null) {
      reservas.push({ isbn, posicion });
    }
  }
  return reservas;
}

export function obtenerRecientes(estado: EstadoBiblioteca, cantidad: number): VistoReciente[] {
  const vistos: VistoReciente[] = [];
  const isbns = estado.recientes.aArray();
  for (let posicion = isbns.length - 1; posicion >= 0 && vistos.length < cantidad; posicion--) {
    const libro = buscarLibroPorIsbn(isbns[posicion]);
    if (libro) {
      vistos.push({ libro, posicion });
    }
  }
  return vistos;
}

function crearPrestamo(isbn: string, origen: OrigenPrestamo, ahora: number): Prestamo {
  return {
    isbn,
    fechaDevolucion: ahora + DIAS_PRESTAMO * MS_POR_DIA,
    origen,
    notificacionId: null,
  };
}

export function reservarLibro(
  estado: EstadoBiblioteca,
  isbn: string,
  ahora: number,
): { estado: EstadoBiblioteca; resultado: ResultadoReserva } {
  if (!buscarLibroPorIsbn(isbn)) {
    return { estado, resultado: { tipo: 'inexistente' } };
  }
  if (tieneReserva(estado, isbn)) {
    return { estado, resultado: { tipo: 'duplicada' } };
  }
  if (calcularDisponibles(estado, isbn) > 0) {
    const prestamo = crearPrestamo(isbn, 'estante', ahora);
    return {
      estado: { ...estado, prestamos: [...estado.prestamos, prestamo] },
      resultado: { tipo: 'prestamo', fechaDevolucion: prestamo.fechaDevolucion },
    };
  }
  const cola = new Cola(obtenerPersonasEnEspera(estado, isbn));
  cola.encolar(USUARIO_ACTUAL);
  return {
    estado: { ...estado, esperas: { ...estado.esperas, [isbn]: cola } },
    resultado: { tipo: 'espera', posicion: cola.tamanio },
  };
}

export function devolverLibro(estado: EstadoBiblioteca, isbn: string): EstadoBiblioteca {
  if (!estado.prestamos.some((prestamo) => prestamo.isbn === isbn)) {
    return estado;
  }
  return { ...estado, prestamos: estado.prestamos.filter((prestamo) => prestamo.isbn !== isbn) };
}

export function entregarAlSiguiente(
  estado: EstadoBiblioteca,
  isbn: string,
  ahora: number,
): { estado: EstadoBiblioteca; persona: string | undefined } {
  const personas = obtenerPersonasEnEspera(estado, isbn);
  if (personas.length === 0) {
    return { estado, persona: undefined };
  }
  const cola = new Cola(personas);
  const persona = cola.desencolar();
  const prestamos =
    persona === USUARIO_ACTUAL
      ? [...estado.prestamos, crearPrestamo(isbn, 'mostrador', ahora)]
      : estado.prestamos;
  return { estado: { ...estado, prestamos, esperas: { ...estado.esperas, [isbn]: cola } }, persona };
}

export function registrarVisto(estado: EstadoBiblioteca, isbn: string): EstadoBiblioteca {
  if (estado.recientes.verTope() === isbn) {
    return estado;
  }
  const recientes = new Pila(estado.recientes.aArray());
  recientes.apilar(isbn);
  return { ...estado, recientes };
}

export function asignarNotificacion(
  estado: EstadoBiblioteca,
  isbn: string,
  notificacionId: string | null,
): EstadoBiblioteca {
  return {
    ...estado,
    prestamos: estado.prestamos.map((prestamo) =>
      prestamo.isbn === isbn ? { ...prestamo, notificacionId } : prestamo,
    ),
  };
}

export function agregarAviso(estado: EstadoBiblioteca, aviso: Aviso): EstadoBiblioteca {
  return { ...estado, avisos: [aviso, ...estado.avisos] };
}

export function marcarAvisoLeido(estado: EstadoBiblioteca, id: string): EstadoBiblioteca {
  return {
    ...estado,
    avisos: estado.avisos.map((aviso) => (aviso.id === id ? { ...aviso, leido: true } : aviso)),
  };
}
