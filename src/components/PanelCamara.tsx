import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import { colores, espaciado, tipografia } from '../constants/tema';
import { Boton } from './Boton';

type PanelCamaraProps = {
  mensaje: string;
  textoBoton: string;
  onPress: () => void;
};

export function PanelCamara({ mensaje, textoBoton, onPress }: PanelCamaraProps) {
  return (
    <View style={styles.panel}>
      <Ionicons name="camera-outline" size={40} color={colores.textoInvertido} />
      <Text style={styles.mensaje}>{mensaje}</Text>
      <Boton titulo={textoBoton} onPress={onPress} variante="secundario" />
    </View>
  );
}

const styles = StyleSheet.create({
  panel: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: espaciado.xl,
    gap: espaciado.md,
  },
  mensaje: {
    fontSize: tipografia.normal,
    color: colores.textoInvertido,
    textAlign: 'center',
  },
});
