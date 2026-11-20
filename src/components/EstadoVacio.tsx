import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import { colores, espaciado, tipografia } from '../constants/tema';

type EstadoVacioProps = {
  mensaje: string;
};

export function EstadoVacio({ mensaje }: EstadoVacioProps) {
  return (
    <View style={styles.contenedor}>
      <Ionicons name="book-outline" size={40} color={colores.textoSecundario} />
      <Text style={styles.mensaje}>{mensaje}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  contenedor: {
    alignItems: 'center',
    padding: espaciado.xxl,
    gap: espaciado.md,
  },
  mensaje: {
    fontSize: tipografia.normal,
    color: colores.textoSecundario,
    textAlign: 'center',
  },
});
