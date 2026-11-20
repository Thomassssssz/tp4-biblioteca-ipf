import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useEffect } from 'react';
import { ScrollView, StyleSheet } from 'react-native';

import { Boton } from '@/components/Boton';
import { FichaLibro } from '@/components/FichaLibro';
import { MensajePantalla } from '@/components/MensajePantalla';
import { espaciado } from '@/constants/tema';
import { useApp } from '@/context/AppContext';
import { esIsbnValido } from '@/lib/isbn';
import { valorParametro } from '@/lib/parametros';

const TITULO_GENERICO = 'Detalle del libro';

function volverAlCatalogo() {
  router.dismissTo('/');
}

export default function DetalleLibro() {
  const { isbn: parametro } = useLocalSearchParams<{ isbn: string }>();
  const isbn = valorParametro(parametro);
  const { obtenerLibro, disponibles, personasEnEspera, registrarLibroVisto } = useApp();

  const formatoValido = esIsbnValido(isbn);
  const libro = formatoValido ? obtenerLibro(isbn) : undefined;

  useEffect(() => {
    if (libro) {
      registrarLibroVisto(libro.isbn);
    }
  }, [libro, registrarLibroVisto]);

  if (!formatoValido) {
    return (
      <>
        <Stack.Title>{TITULO_GENERICO}</Stack.Title>
        <MensajePantalla
          icono="alert-circle-outline"
          titulo="ISBN no válido"
          mensaje={`"${isbn}" no es un ISBN válido. Debe tener exactamente 13 números, sin letras ni guiones.`}>
          <Boton titulo="Volver al Catálogo" onPress={volverAlCatalogo} />
        </MensajePantalla>
      </>
    );
  }

  if (!libro) {
    return (
      <>
        <Stack.Title>{TITULO_GENERICO}</Stack.Title>
        <MensajePantalla
          icono="search-outline"
          titulo="Libro no encontrado"
          mensaje={`No encontramos ningún libro con el ISBN ${isbn} en el catálogo de la biblioteca.`}>
          <Boton titulo="Volver al Catálogo" onPress={volverAlCatalogo} />
        </MensajePantalla>
      </>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.contenido}>
      <Stack.Title>{libro.titulo}</Stack.Title>
      <FichaLibro
        libro={libro}
        disponibles={disponibles(libro.isbn)}
        enEspera={personasEnEspera(libro.isbn).length}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  contenido: {
    padding: espaciado.lg,
  },
});
