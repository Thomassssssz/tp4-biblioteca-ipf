import { StyleSheet, Text, View } from 'react-native';

import { colores, espaciado, tipografia } from '../constants/tema';

type DatoFichaProps = {
  etiqueta: string;
  valor: string;
};

export function DatoFicha({ etiqueta, valor }: DatoFichaProps) {
  return (
    <View style={styles.fila}>
      <Text style={styles.etiqueta}>{etiqueta}</Text>
      <Text style={styles.valor}>{valor}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  fila: {
    borderTopWidth: 1,
    borderTopColor: colores.borde,
    paddingTop: espaciado.md,
    gap: espaciado.xs,
  },
  etiqueta: {
    fontSize: tipografia.chica,
    color: colores.textoSecundario,
  },
  valor: {
    fontSize: tipografia.normal,
    fontWeight: '600',
    color: colores.texto,
  },
});
