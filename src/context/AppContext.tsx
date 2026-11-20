import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';

import { CANTIDAD_RECIENTES } from '../constants/biblioteca';
import {
  agregarAviso,
  asignarNotificacion,
  buscarLibroPorIsbn,
  calcularDisponibles,
  crearEstadoInicial,
  devolverLibro,
  entregarAlSiguiente,
  listarReservasEnEspera,
  marcarAvisoLeido,
  obtenerPersonasEnEspera,
  obtenerPosicionEnEspera,
  obtenerRecientes,
  registrarVisto,
  reservarLibro,
  tieneReserva,
} from '../lib/biblioteca';
import type { Aviso, Libro, Prestamo, ReservaEnEspera, ResultadoReserva, Sesion } from '../types';

type AppContextValue = {
  prestamos: Prestamo[];
  reservasEnEspera: ReservaEnEspera[];
  recientes: Libro[];
  avisos: Aviso[];
  sesion: Sesion | null;
  obtenerLibro: (isbn: string) => Libro | undefined;
  disponibles: (isbn: string) => number;
  personasEnEspera: (isbn: string) => string[];
  posicionEnEspera: (isbn: string) => number | null;
  yaReservado: (isbn: string) => boolean;
  reservar: (isbn: string) => ResultadoReserva;
  devolver: (isbn: string) => void;
  entregarSiguiente: (isbn: string) => string | undefined;
  registrarLibroVisto: (isbn: string) => void;
  guardarNotificacion: (isbn: string, notificacionId: string | null) => void;
  avisar: (mensaje: string) => void;
  marcarLeido: (id: string) => void;
  iniciarSesion: (usuario: string) => void;
  cerrarSesion: () => void;
};

const AppContext = createContext<AppContextValue | null>(null);

type AppProviderProps = {
  children: ReactNode;
};

export function AppProvider({ children }: AppProviderProps) {
  //inicializacion diferida: las colas iniciales se crean una sola vez
  const [estado, setEstado] = useState(crearEstadoInicial);
  const [sesion, setSesion] = useState<Sesion | null>(null);

  const valor = useMemo<AppContextValue>(
    () => ({
      prestamos: estado.prestamos,
      reservasEnEspera: listarReservasEnEspera(estado),
      recientes: obtenerRecientes(estado, CANTIDAD_RECIENTES),
      avisos: estado.avisos,
      sesion,
      obtenerLibro: buscarLibroPorIsbn,
      disponibles: (isbn) => calcularDisponibles(estado, isbn),
      personasEnEspera: (isbn) => obtenerPersonasEnEspera(estado, isbn),
      posicionEnEspera: (isbn) => obtenerPosicionEnEspera(estado, isbn),
      yaReservado: (isbn) => tieneReserva(estado, isbn),
      //el resultado se calcula con el estado visible y el cambio con el estado mas reciente
      reservar: (isbn) => {
        const ahora = Date.now();
        setEstado((anterior) => reservarLibro(anterior, isbn, ahora).estado);
        return reservarLibro(estado, isbn, ahora).resultado;
      },
      devolver: (isbn) => setEstado((anterior) => devolverLibro(anterior, isbn)),
      entregarSiguiente: (isbn) => {
        const ahora = Date.now();
        setEstado((anterior) => entregarAlSiguiente(anterior, isbn, ahora).estado);
        return entregarAlSiguiente(estado, isbn, ahora).persona;
      },
      registrarLibroVisto: (isbn) => setEstado((anterior) => registrarVisto(anterior, isbn)),
      guardarNotificacion: (isbn, notificacionId) =>
        setEstado((anterior) => asignarNotificacion(anterior, isbn, notificacionId)),
      avisar: (mensaje) => {
        const aviso: Aviso = {
          id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
          mensaje,
          fecha: Date.now(),
          leido: false,
        };
        setEstado((anterior) => agregarAviso(anterior, aviso));
      },
      marcarLeido: (id) => setEstado((anterior) => marcarAvisoLeido(anterior, id)),
      iniciarSesion: (usuario) => setSesion({ usuario }),
      cerrarSesion: () => setSesion(null),
    }),
    [estado, sesion],
  );

  return <AppContext.Provider value={valor}>{children}</AppContext.Provider>;
}

export function useApp(): AppContextValue {
  const contexto = useContext(AppContext);
  if (!contexto) {
    throw new Error('useApp debe usarse dentro de AppProvider');
  }
  return contexto;
}
