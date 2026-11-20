import { useCallback, useEffect, useState } from 'react';

import { obtenerLibros } from '../lib/api';
import type { Libro } from '../types';

const MENSAJE_ERROR = 'No pudimos cargar el catálogo. Revisá tu conexión e intentá de nuevo.';

type ResultadoUseLibros = {
  libros: Libro[];
  cargando: boolean;
  error: string | null;
  reintentar: () => void;
};

export function useLibros(): ResultadoUseLibros {
  const [libros, setLibros] = useState<Libro[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [intento, setIntento] = useState(0);

  useEffect(() => {
    //si la pantalla se desmonta o se reintenta antes de la respuesta, se descarta
    let activo = true;

    async function cargar() {
      try {
        const datos = await obtenerLibros();
        if (activo) {
          setLibros(datos);
        }
      } catch {
        if (activo) {
          setError(MENSAJE_ERROR);
        }
      } finally {
        if (activo) {
          setCargando(false);
        }
      }
    }

    cargar();
    return () => {
      activo = false;
    };
  }, [intento]);

  const reintentar = useCallback(() => {
    setError(null);
    setCargando(true);
    setIntento((anterior) => anterior + 1);
  }, []);

  return { libros, cargando, error, reintentar };
}
