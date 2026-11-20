import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { colores, espaciado, tipografia } from '../constants/tema';

type EstadoCargandoProps = {
  mensaje: string;
};

export function EstadoCargando({ mensaje }: EstadoCargandoProps) {
  return (
    <View style={styles.contenedor} accessibilityLiveRegion="polite">
      <ActivityIndicator size="large" color={colores.primario} />
      <Text style={styles.mensaje}>{mensaje}</Text>
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
  mensaje: {
    fontSize: tipografia.normal,
    color: colores.textoSecundario,
    textAlign: 'center',
  },
});
