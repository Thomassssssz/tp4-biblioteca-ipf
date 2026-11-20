import { Link } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colores, espaciado, radios, tipografia } from '../constants/tema';
import type { Libro } from '../types';
import { EtiquetaDisponibilidad } from './EtiquetaDisponibilidad';

type TarjetaLibroProps = {
  libro: Libro;
  disponibles: number;
};

export function TarjetaLibro({ libro, disponibles }: TarjetaLibroProps) {
  return (
    <Link href={{ pathname: '/libro/[isbn]', params: { isbn: libro.isbn } }} asChild>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${libro.titulo}, de ${libro.autor}. Ver detalle`}
        style={({ pressed }) => [styles.tarjeta, pressed && styles.presionada]}>
        <View style={styles.lomo} />
        <View style={styles.info}>
          <Text style={styles.titulo} numberOfLines={2}>
            {libro.titulo}
          </Text>
          <Text style={styles.autor} numberOfLines={1}>
            {libro.autor} · {libro.anio}
          </Text>
          <EtiquetaDisponibilidad disponibles={disponibles} />
        </View>
      </Pressable>
    </Link>
  );
}

const styles = StyleSheet.create({
  tarjeta: {
    flexDirection: 'row',
    backgroundColor: colores.superficie,
    borderRadius: radios.medio,
    borderWidth: 1,
    borderColor: colores.borde,
    overflow: 'hidden',
  },
  presionada: {
    opacity: 0.85,
  },
  lomo: {
    width: espaciado.sm,
    backgroundColor: colores.primario,
  },
  info: {
    flex: 1,
    padding: espaciado.lg,
    gap: espaciado.xs,
  },
  titulo: {
    fontSize: tipografia.mediana,
    fontWeight: '700',
    color: colores.texto,
  },
  autor: {
    fontSize: tipografia.chica,
    color: colores.textoSecundario,
  },
});
