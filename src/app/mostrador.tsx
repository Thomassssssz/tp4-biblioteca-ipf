import { useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';

import { Boton } from '@/components/Boton';
import { EstadoVacio } from '@/components/EstadoVacio';
import { SeparadorLista } from '@/components/SeparadorLista';
import { TarjetaMostrador } from '@/components/TarjetaMostrador';
import { USUARIO_ACTUAL } from '@/constants/biblioteca';
import { colores, espaciado, radios, tipografia } from '@/constants/tema';
import { useApp } from '@/context/AppContext';
import type { ColaMostrador, Libro } from '@/types';

function obtenerClave(cola: ColaMostrador) {
  return cola.libro.isbn;
}

function describirEntrega(libro: Libro, persona: string | undefined): string {
  if (persona === undefined) {
    return `Nadie estaba esperando "${libro.titulo}".`;
  }
  if (persona === USUARIO_ACTUAL) {
    return `Entregaste "${libro.titulo}" a Vos. Le avisamos por notificación o en Mis reservas.`;
  }
  return `Entregaste "${libro.titulo}" a ${persona}.`;
}

export default function Mostrador() {
  const { sesion, colasConEspera, entregarSiguiente, cerrarSesion } = useApp();
  const [confirmacion, setConfirmacion] = useState<string | null>(null);

  function entregar(libro: Libro) {
    setConfirmacion(describirEntrega(libro, entregarSiguiente(libro.isbn)));
  }

  return (
    <FlatList
      data={colasConEspera}
      keyExtractor={obtenerClave}
      renderItem={({ item }) => <TarjetaMostrador cola={item} onEntregar={() => entregar(item.libro)} />}
      ListHeaderComponent={
        <View style={styles.encabezado}>
          <Text style={styles.sesion}>Sesión iniciada como {sesion?.usuario}</Text>
          <Text style={styles.ayuda}>
            Entregar al siguiente simula que se devolvió un ejemplar y se lo da a la primera persona de la
            lista.
          </Text>
          {confirmacion !== null && (
            <View style={styles.confirmacion} accessibilityLiveRegion="polite">
              <Text style={styles.textoConfirmacion}>{confirmacion}</Text>
            </View>
          )}
        </View>
      }
      ListEmptyComponent={<EstadoVacio mensaje="No hay libros con personas esperando." />}
      ListFooterComponent={
        <View style={styles.pie}>
          <Boton titulo="Cerrar sesión" onPress={cerrarSesion} variante="secundario" />
        </View>
      }
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
    gap: espaciado.sm,
    marginBottom: espaciado.lg,
  },
  sesion: {
    fontSize: tipografia.normal,
    fontWeight: '600',
    color: colores.primario,
  },
  ayuda: {
    fontSize: tipografia.chica,
    color: colores.textoSecundario,
  },
  confirmacion: {
    backgroundColor: colores.primarioClaro,
    borderRadius: radios.medio,
    padding: espaciado.md,
  },
  textoConfirmacion: {
    fontSize: tipografia.normal,
    color: colores.primario,
  },
  pie: {
    marginTop: espaciado.xl,
  },
});
