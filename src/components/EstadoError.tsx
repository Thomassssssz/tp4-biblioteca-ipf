import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import { colores, espaciado, tipografia } from '../constants/tema';
import { Boton } from './Boton';

type EstadoErrorProps = {
  mensaje: string;
  onReintentar: () => void;
};

export function EstadoError({ mensaje, onReintentar }: EstadoErrorProps) {
  return (
    <View style={styles.contenedor}>
      <Ionicons name="cloud-offline-outline" size={48} color={colores.error} />
      <Text style={styles.titulo}>Algo salió mal</Text>
      <Text style={styles.mensaje}>{mensaje}</Text>
      <Boton titulo="Reintentar" onPress={onReintentar} />
    </View>
  );
}

const styles = StyleSheet.create({
  contenedor: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: espaciado.xl,
    gap: espaciado.md,
  },
  titulo: {
    fontSize: tipografia.grande,
    fontWeight: '700',
    color: colores.texto,
  },
  mensaje: {
    fontSize: tipografia.normal,
    color: colores.textoSecundario,
    textAlign: 'center',
    marginBottom: espaciado.sm,
  },
});
