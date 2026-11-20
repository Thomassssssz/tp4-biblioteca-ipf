import { router, useLocalSearchParams } from 'expo-router';
import { FlatList, StyleSheet, View } from 'react-native';

import { CampoBusqueda } from '@/components/CampoBusqueda';
import { EstadoCargando } from '@/components/EstadoCargando';
import { EstadoError } from '@/components/EstadoError';
import { MensajePantalla } from '@/components/MensajePantalla';
import { SeparadorLista } from '@/components/SeparadorLista';
import { TarjetaLibro } from '@/components/TarjetaLibro';
import { colores, espaciado } from '@/constants/tema';
import { useApp } from '@/context/AppContext';
import { useBusqueda } from '@/hooks/useBusqueda';
import { valorParametro } from '@/lib/parametros';
import type { Libro } from '@/types';

function obtenerClave(libro: Libro) {
  return libro.isbn;
}

//setParams reemplaza q en la ruta actual: no apila una pantalla por cada letra
function actualizarBusqueda(texto: string) {
  router.setParams({ q: texto });
}

export default function Buscar() {
  const { q } = useLocalSearchParams<{ q?: string }>();
  const texto = valorParametro(q);
  const { estado, resultados, reintentar } = useBusqueda(texto);
  const { disponibles } = useApp();

  return (
    <View style={styles.pantalla}>
      <View style={styles.cabecera}>
        <CampoBusqueda valor={texto} onCambiar={actualizarBusqueda} />
      </View>

      {estado === 'inicial' && (
        <MensajePantalla
          icono="book-outline"
          titulo="Buscá en el catálogo"
          mensaje="Escribí el título o el autor del libro que necesitás."
        />
      )}

      {estado === 'buscando' && <EstadoCargando mensaje="Buscando libros…" />}

      {estado === 'error' && (
        <EstadoError
          mensaje="No pudimos completar la búsqueda. Intentá de nuevo."
          onReintentar={reintentar}
        />
      )}

      {estado === 'sin-resultados' && (
        <MensajePantalla
          icono="search-outline"
          titulo="Sin resultados"
          mensaje={`No encontramos libros para "${texto.trim()}". Probá con otro título o autor.`}
        />
      )}

      {estado === 'resultados' && (
        <FlatList
          data={resultados}
          keyExtractor={obtenerClave}
          renderItem={({ item }) => <TarjetaLibro libro={item} disponibles={disponibles(item.isbn)} />}
          ItemSeparatorComponent={SeparadorLista}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.lista}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  pantalla: {
    flex: 1,
    backgroundColor: colores.fondo,
  },
  cabecera: {
    padding: espaciado.lg,
    paddingBottom: espaciado.sm,
  },
  lista: {
    padding: espaciado.lg,
    paddingTop: espaciado.sm,
  },
});
