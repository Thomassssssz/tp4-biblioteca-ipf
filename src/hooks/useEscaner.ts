import { useCallback, useRef, useState } from 'react';

import { esIsbnValido } from '../lib/isbn';

type ResultadoUseEscaner = {
  aviso: string | null;
  alLeerCodigo: (codigo: string) => void;
};

export function useEscaner(
  existeLibro: (isbn: string) => boolean,
  abrirLibro: (isbn: string) => void,
): ResultadoUseEscaner {
  //refs y no estado: cambian al instante, sin esperar un render, y la camara
  //puede llamar a alLeerCodigo varias veces antes de que react vuelva a renderizar
  const navegandoRef = useRef(false);
  const ultimoAvisadoRef = useRef<string | null>(null);
  const [aviso, setAviso] = useState<string | null>(null);

  const alLeerCodigo = useCallback(
    (codigo: string) => {
      const isbn = codigo.trim();
      if (navegandoRef.current || !esIsbnValido(isbn)) {
        return;
      }
      if (existeLibro(isbn)) {
        navegandoRef.current = true;
        abrirLibro(isbn);
        return;
      }
      if (ultimoAvisadoRef.current === isbn) {
        return;
      }
      ultimoAvisadoRef.current = isbn;
      setAviso(`El código ${isbn} no está en el catálogo. Probá con otro libro.`);
    },
    [existeLibro, abrirLibro],
  );

  return { aviso, alLeerCodigo };
}
