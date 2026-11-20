import { FlatList, StyleSheet, Text, View } from 'react-native';

import { AccesoRapido } from '@/components/AccesoRapido';
import { EstadoCargando } from '@/components/EstadoCargando';
import { EstadoError } from '@/components/EstadoError';
import { EstadoVacio } from '@/components/EstadoVacio';
import { SeparadorLista } from '@/components/SeparadorLista';
import { TarjetaLibro } from '@/components/TarjetaLibro';
import { VistosRecientes } from '@/components/VistosRecientes';
import { colores, espaciado, tipografia } from '@/constants/tema';
import { useApp } from '@/context/AppContext';
import { useLibros } from '@/hooks/useLibros';
import type { Libro } from '@/types';

function obtenerClave(libro: Libro) {
  return libro.isbn;
}

export default function Catalogo() {
  const { libros, cargando, error, reintentar } = useLibros();
  const { disponibles, recientes } = useApp();

  if (cargando) {
    return <EstadoCargando mensaje="Cargando el catálogo…" />;
  }

  if (error) {
    return <EstadoError mensaje={error} onReintentar={reintentar} />;
  }

  return (
    <FlatList
      data={libros}
      keyExtractor={obtenerClave}
      renderItem={({ item }) => <TarjetaLibro libro={item} disponibles={disponibles(item.isbn)} />}
      ListHeaderComponent={
        <View style={styles.encabezado}>
          <Text style={styles.titulo}>Biblioteca IPF</Text>
          <Text style={styles.subtitulo}>
            {libros.length} {libros.length === 1 ? 'título' : 'títulos'} en el catálogo
          </Text>
          <View style={styles.accesos}>
            <AccesoRapido
              href={{ pathname: '/buscar', params: { q: '' } }}
              icono="search"
              texto="Buscar"
            />
            <AccesoRapido
              href={{ pathname: '/permisos/[recurso]', params: { recurso: 'camara' } }}
              icono="barcode-outline"
              texto="Escanear libro"
            />
          </View>
          <VistosRecientes vistos={recientes} />
        </View>
      }
      ListEmptyComponent={<EstadoVacio mensaje="Todavía no hay libros en el catálogo." />}
      ItemSeparatorComponent={SeparadorLista}
      contentContainerStyle={styles.lista}
    />
  );
}

const styles = StyleSheet.create({
  lista: {
    padding: espaciado.lg,
    paddingBottom: espaciado.xxl,
  },
  encabezado: {
    marginBottom: espaciado.lg,
  },
  titulo: {
    fontSize: tipografia.titulo,
    fontWeight: '800',
    color: colores.primario,
  },
  accesos: {
    flexDirection: 'row',
    gap: espaciado.sm,
    marginTop: espaciado.lg,
  },
  subtitulo: {
    marginTop: espaciado.xs,
    fontSize: tipografia.normal,
    color: colores.textoSecundario,
  },
});
