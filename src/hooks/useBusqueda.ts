import { useCallback, useEffect, useState } from 'react';

import { buscarLibros } from '../lib/api';
import type { Libro } from '../types';

export type EstadoBusqueda = 'inicial' | 'buscando' | 'resultados' | 'sin-resultados' | 'error';

type Respuesta = {
  clave: string;
  libros: Libro[];
  fallo: boolean;
};

type ResultadoUseBusqueda = {
  estado: EstadoBusqueda;
  resultados: Libro[];
  reintentar: () => void;
};

export function useBusqueda(texto: string): ResultadoUseBusqueda {
  const [respuesta, setRespuesta] = useState<Respuesta | null>(null);
  const [intento, setIntento] = useState(0);

  const hayTexto = texto.trim().length > 0;
  //identifica el pedido vigente: cambia con cada texto nuevo y con cada reintento
  const clave = `${intento}:${texto}`;

  useEffect(() => {
    if (!hayTexto) {
      return;
    }
    //la limpieza corre al cambiar el texto o al desmontar: la respuesta vieja ya no toca el estado
    let vigente = true;

    async function buscar() {
      try {
        const libros = await buscarLibros(texto);
        if (vigente) {
          setRespuesta({ clave, libros, fallo: false });
        }
      } catch {
        if (vigente) {
          setRespuesta({ clave, libros: [], fallo: true });
        }
      }
    }

    buscar();
    return () => {
      vigente = false;
    };
  }, [texto, clave, hayTexto]);

  const reintentar = useCallback(() => {
    setIntento((anterior) => anterior + 1);
  }, []);

  if (!hayTexto) {
    return { estado: 'inicial', resultados: [], reintentar };
  }
  //mientras no llega la respuesta del pedido vigente se muestra cargando, nunca datos viejos
  if (respuesta?.clave !== clave) {
    return { estado: 'buscando', resultados: [], reintentar };
  }
  if (respuesta.fallo) {
    return { estado: 'error', resultados: [], reintentar };
  }
  return {
    estado: respuesta.libros.length === 0 ? 'sin-resultados' : 'resultados',
    resultados: respuesta.libros,
    reintentar,
  };
}
