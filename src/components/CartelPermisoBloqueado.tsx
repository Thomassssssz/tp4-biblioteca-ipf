import { StyleSheet, Text, View } from 'react-native';

import { colores, espaciado, radios, tipografia } from '../constants/tema';
import { Boton } from './Boton';

type CartelPermisoBloqueadoProps = {
  mensaje: string;
  onAbrirAjustes: () => void;
};

export function CartelPermisoBloqueado({ mensaje, onAbrirAjustes }: CartelPermisoBloqueadoProps) {
  return (
    <View style={styles.cartel} accessibilityLiveRegion="polite">
      <Text style={styles.mensaje}>{mensaje}</Text>
      <Boton titulo="Abrir Ajustes" onPress={onAbrirAjustes} variante="secundario" />
    </View>
  );
}

const styles = StyleSheet.create({
  cartel: {
    backgroundColor: colores.errorFondo,
    borderRadius: radios.medio,
    padding: espaciado.md,
    gap: espaciado.sm,
  },
  mensaje: {
    fontSize: tipografia.normal,
    color: colores.error,
  },
});
