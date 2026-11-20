import { Pressable, StyleSheet, Text } from 'react-native';

import { colores, espaciado, radios, TAMANIO_TACTIL_MINIMO, tipografia } from '../constants/tema';

type BotonProps = {
  titulo: string;
  onPress: () => void;
  variante?: 'primario' | 'secundario';
  deshabilitado?: boolean;
};

export function Boton({ titulo, onPress, variante = 'primario', deshabilitado = false }: BotonProps) {
  const esPrimario = variante === 'primario';
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: deshabilitado }}
      disabled={deshabilitado}
      onPress={onPress}
      style={({ pressed }) => [
        styles.base,
        esPrimario ? styles.primario : styles.secundario,
        pressed && styles.presionado,
        deshabilitado && styles.deshabilitado,
      ]}>
      <Text style={[styles.texto, esPrimario ? styles.textoPrimario : styles.textoSecundario]}>
        {titulo}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: TAMANIO_TACTIL_MINIMO,
    minWidth: TAMANIO_TACTIL_MINIMO,
    paddingHorizontal: espaciado.xl,
    borderRadius: radios.medio,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primario: {
    backgroundColor: colores.primario,
  },
  secundario: {
    backgroundColor: colores.superficie,
    borderWidth: 1,
    borderColor: colores.primario,
  },
  presionado: {
    opacity: 0.8,
  },
  deshabilitado: {
    opacity: 0.5,
  },
  texto: {
    fontSize: tipografia.normal,
    fontWeight: '600',
  },
  textoPrimario: {
    color: colores.textoInvertido,
  },
  textoSecundario: {
    color: colores.primario,
  },
});
