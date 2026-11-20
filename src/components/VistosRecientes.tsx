import { Link } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colores, espaciado, radios, TAMANIO_TACTIL_MINIMO, tipografia } from '../constants/tema';
import type { VistoReciente } from '../types';

type VistosRecientesProps = {
  vistos: VistoReciente[];
};

export function VistosRecientes({ vistos }: VistosRecientesProps) {
  if (vistos.length === 0) {
    return null;
  }

  return (
    <View style={styles.seccion}>
      <Text style={styles.titulo}>Vistos recientemente</Text>
      <View style={styles.fila}>
        {vistos.map(({ libro, posicion }) => (
          <Link
            key={`${posicion}-${libro.isbn}`}
            href={{ pathname: '/libro/[isbn]', params: { isbn: libro.isbn } }}
            asChild>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`Volver a ver ${libro.titulo}`}
              style={({ pressed }) => [styles.item, pressed && styles.presionado]}>
              <Text style={styles.tituloLibro} numberOfLines={2}>
                {libro.titulo}
              </Text>
              <Text style={styles.autor} numberOfLines={1}>
                {libro.autor}
              </Text>
            </Pressable>
          </Link>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  seccion: {
    marginTop: espaciado.lg,
  },
  titulo: {
    fontSize: tipografia.mediana,
    fontWeight: '700',
    color: colores.texto,
    marginBottom: espaciado.sm,
  },
  fila: {
    flexDirection: 'row',
    gap: espaciado.sm,
  },
  item: {
    flex: 1,
    minHeight: TAMANIO_TACTIL_MINIMO,
    padding: espaciado.md,
    borderRadius: radios.medio,
    backgroundColor: colores.primarioClaro,
    justifyContent: 'space-between',
    gap: espaciado.xs,
  },
  presionado: {
    opacity: 0.8,
  },
  tituloLibro: {
    fontSize: tipografia.chica,
    fontWeight: '700',
    color: colores.primario,
  },
  autor: {
    fontSize: tipografia.chica,
    color: colores.textoSecundario,
  },
});
