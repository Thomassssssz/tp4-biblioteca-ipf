import { StyleSheet, Text } from 'react-native';

import { colores, tipografia } from '../constants/tema';

type TextoVacioProps = {
  texto: string;
};

export function TextoVacio({ texto }: TextoVacioProps) {
  return <Text style={styles.texto}>{texto}</Text>;
}

const styles = StyleSheet.create({
  texto: {
    fontSize: tipografia.normal,
    color: colores.textoSecundario,
  },
});
