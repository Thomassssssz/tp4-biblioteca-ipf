import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';

import { CANTIDAD_RECIENTES } from '../constants/biblioteca';
import {
  agregarAviso,
  anticiparReserva,
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
import type {
  AnticipoReserva,
  Aviso,
  Libro,
  Prestamo,
  ReservaEnEspera,
  ResultadoReserva,
  Sesion,
  VistoReciente,
} from '../types';

type AccionesEstables = {
  devolver: (isbn: string) => void;
  registrarLibroVisto: (isbn: string) => void;
  guardarNotificacion: (isbn: string, notificacionId: string | null) => void;
  avisar: (mensaje: string) => void;
  marcarLeido: (id: string) => void;
  iniciarSesion: (usuario: string) => void;
  cerrarSesion: () => void;
};

type AppContextValue = AccionesEstables & {
  prestamos: Prestamo[];
  reservasEnEspera: ReservaEnEspera[];
  recientes: VistoReciente[];
  avisos: Aviso[];
  sesion: Sesion | null;
  obtenerLibro: (isbn: string) => Libro | undefined;
  disponibles: (isbn: string) => number;
  personasEnEspera: (isbn: string) => string[];
  posicionEnEspera: (isbn: string) => number | null;
  yaReservado: (isbn: string) => boolean;
  anticipar: (isbn: string) => AnticipoReserva;
  reservar: (isbn: string) => ResultadoReserva;
  entregarSiguiente: (isbn: string) => string | undefined;
};

const AppContext = createContext<AppContextValue | null>(null);

type AppProviderProps = {
  children: ReactNode;
};

export function AppProvider({ children }: AppProviderProps) {
  //inicializacion diferida: las colas iniciales se crean una sola vez
  const [estado, setEstado] = useState(crearEstadoInicial);
  const [sesion, setSesion] = useState<Sesion | null>(null);

  //solo usan actualizaciones funcionales, asi mantienen la misma referencia entre renders
  //y se pueden usar como dependencia de un efecto sin volver a dispararlo
  const acciones = useMemo<AccionesEstables>(
    () => ({
      devolver: (isbn) => setEstado((anterior) => devolverLibro(anterior, isbn)),
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
    [],
  );

  const valor = useMemo<AppContextValue>(
    () => ({
      ...acciones,
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
      anticipar: (isbn) => anticiparReserva(estado, isbn),
      //el resultado se calcula con el estado visible y el cambio con el estado mas reciente
      reservar: (isbn) => {
        const ahora = Date.now();
        setEstado((anterior) => reservarLibro(anterior, isbn, ahora).estado);
        return reservarLibro(estado, isbn, ahora).resultado;
      },
      entregarSiguiente: (isbn) => {
        const ahora = Date.now();
        setEstado((anterior) => entregarAlSiguiente(anterior, isbn, ahora).estado);
        return entregarAlSiguiente(estado, isbn, ahora).persona;
      },
    }),
    [acciones, estado, sesion],
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
