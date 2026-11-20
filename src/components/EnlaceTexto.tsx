import { Pressable, StyleSheet, Text } from 'react-native';

import { colores, espaciado, TAMANIO_TACTIL_MINIMO, tipografia } from '../constants/tema';

type EnlaceTextoProps = {
  texto: string;
  onPress: () => void;
};

export function EnlaceTexto({ texto, onPress }: EnlaceTextoProps) {
  return (
    <Pressable accessibilityRole="button" onPress={onPress} style={styles.enlace}>
      <Text style={styles.texto}>{texto}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  enlace: {
    minHeight: TAMANIO_TACTIL_MINIMO,
    paddingHorizontal: espaciado.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  texto: {
    fontSize: tipografia.normal,
    color: colores.primario,
    textDecorationLine: 'underline',
  },
});
