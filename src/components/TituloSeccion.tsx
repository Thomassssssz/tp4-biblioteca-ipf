import { StyleSheet, Text } from 'react-native';

import { colores, espaciado, tipografia } from '../constants/tema';

type TituloSeccionProps = {
  texto: string;
};

export function TituloSeccion({ texto }: TituloSeccionProps) {
  return (
    <Text style={styles.titulo} accessibilityRole="header">
      {texto}
    </Text>
  );
}

const styles = StyleSheet.create({
  titulo: {
    fontSize: tipografia.grande,
    fontWeight: '800',
    color: colores.primario,
    marginTop: espaciado.md,
  },
});
