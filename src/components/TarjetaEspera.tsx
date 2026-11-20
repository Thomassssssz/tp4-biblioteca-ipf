import { StyleSheet, Text, View } from 'react-native';

import { colores, espaciado, radios, tipografia } from '../constants/tema';
import type { Libro } from '../types';

type TarjetaEsperaProps = {
  libro: Libro;
  posicion: number;
  total: number;
};

export function TarjetaEspera({ libro, posicion, total }: TarjetaEsperaProps) {
  const estado =
    posicion === 1 ? 'Sos la próxima persona en recibirlo' : `${posicion - 1} antes que vos`;

  return (
    <View style={styles.tarjeta}>
      <View style={styles.posicion}>
        <Text style={styles.numero}>{posicion}</Text>
        <Text style={styles.deTotal}>de {total}</Text>
      </View>
      <View style={styles.info}>
        <Text style={styles.titulo}>{libro.titulo}</Text>
        <Text style={styles.autor}>{libro.autor}</Text>
        <Text style={styles.estado}>{estado}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  tarjeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: espaciado.lg,
    backgroundColor: colores.superficie,
    borderRadius: radios.medio,
    borderWidth: 1,
    borderColor: colores.borde,
    padding: espaciado.lg,
  },
  posicion: {
    alignItems: 'center',
    minWidth: espaciado.xxl * 2,
    paddingVertical: espaciado.sm,
    borderRadius: radios.medio,
    backgroundColor: colores.avisoFondo,
  },
  numero: {
    fontSize: tipografia.titulo,
    fontWeight: '800',
    color: colores.aviso,
  },
  deTotal: {
    fontSize: tipografia.chica,
    color: colores.aviso,
  },
  info: {
    flex: 1,
    gap: espaciado.xs,
  },
  titulo: {
    fontSize: tipografia.mediana,
    fontWeight: '700',
    color: colores.texto,
  },
  autor: {
    fontSize: tipografia.chica,
    color: colores.textoSecundario,
  },
  estado: {
    fontSize: tipografia.chica,
    color: colores.aviso,
    fontWeight: '600',
  },
});
