import { createContext, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';

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
import { cancelarRecordatorio, programarRecordatorio } from '../lib/notificaciones';
import { validarCredenciales } from '../lib/sesion';
import type {
  AnticipoReserva,
  Aviso,
  Libro,
  Prestamo,
  ReservaEnEspera,
  ResultadoLogin,
  ResultadoReserva,
  Sesion,
  VistoReciente,
} from '../types';

type AccionesEstables = {
  devolver: (isbn: string) => void;
  registrarLibroVisto: (isbn: string) => void;
  activarRecordatorio: (isbn: string) => Promise<void>;
  desactivarRecordatorio: (isbn: string) => void;
  avisar: (mensaje: string) => void;
  marcarLeido: (id: string) => void;
  iniciarSesion: (usuario: string, clave: string) => ResultadoLogin;
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
  //las acciones asincronas leen el ultimo estado confirmado sin depender de el
  const estadoRef = useRef(estado);
  //cada cambio de recordatorio sube la version y deja sin efecto las programaciones en curso
  const versionesRef = useRef(new Map<string, number>());

  useEffect(() => {
    estadoRef.current = estado;
  }, [estado]);

  //no dependen del estado, asi mantienen la misma referencia entre renders
  //y se pueden usar como dependencia de un efecto sin volver a dispararlo
  const acciones = useMemo<AccionesEstables>(() => {
    function avisar(mensaje: string) {
      const aviso: Aviso = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
        mensaje,
        fecha: Date.now(),
        leido: false,
      };
      setEstado((anterior) => agregarAviso(anterior, aviso));
    }

    function nuevaVersion(isbn: string): number {
      const version = (versionesRef.current.get(isbn) ?? 0) + 1;
      versionesRef.current.set(isbn, version);
      return version;
    }

    function cancelarPendiente(isbn: string) {
      const prestamo = estadoRef.current.prestamos.find((p) => p.isbn === isbn);
      if (prestamo?.notificacionId) {
        cancelarRecordatorio(prestamo.notificacionId).catch(() =>
          avisar("No pudimos cancelar un recordatorio. Si te llega, ya podés ignorarlo."),
        );
      }
    }

    return {
      avisar,
      devolver: (isbn) => {
        nuevaVersion(isbn);
        cancelarPendiente(isbn);
        setEstado((anterior) => devolverLibro(anterior, isbn));
      },
      activarRecordatorio: async (isbn) => {
        const prestamo = estadoRef.current.prestamos.find((p) => p.isbn === isbn);
        const libro = buscarLibroPorIsbn(isbn);
        if (!prestamo || !libro || prestamo.notificacionId) {
          return;
        }
        const version = nuevaVersion(isbn);
        try {
          const notificacionId = await programarRecordatorio(libro, prestamo.fechaDevolucion);
          //si mientras se programaba se desactivo o se devolvio, se cancela enseguida
          if (versionesRef.current.get(isbn) !== version) {
            await cancelarRecordatorio(notificacionId);
            return;
          }
          setEstado((anterior) => asignarNotificacion(anterior, isbn, notificacionId));
        } catch {
          avisar(`No pudimos programar el recordatorio de "${libro.titulo}". Revisá la fecha de devolución en Mis reservas.`);
        }
      },
      desactivarRecordatorio: (isbn) => {
        nuevaVersion(isbn);
        cancelarPendiente(isbn);
        setEstado((anterior) => asignarNotificacion(anterior, isbn, null));
      },
      registrarLibroVisto: (isbn) => setEstado((anterior) => registrarVisto(anterior, isbn)),
      marcarLeido: (id) => setEstado((anterior) => marcarAvisoLeido(anterior, id)),
      //solo se guarda el usuario: la clave nunca entra al estado
      iniciarSesion: (usuario, clave) => {
        const resultado = validarCredenciales(usuario, clave);
        if (resultado.ok) {
          setSesion(resultado.sesion);
        }
        return resultado;
      },
      cerrarSesion: () => setSesion(null),
    };
  }, []);

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
