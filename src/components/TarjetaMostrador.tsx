import { StyleSheet, Text, View } from 'react-native';

import { USUARIO_ACTUAL } from '../constants/biblioteca';
import { colores, espaciado, radios, tipografia } from '../constants/tema';
import type { ColaMostrador } from '../types';
import { Boton } from './Boton';

type TarjetaMostradorProps = {
  cola: ColaMostrador;
  onEntregar: () => void;
};

export function TarjetaMostrador({ cola, onEntregar }: TarjetaMostradorProps) {
  const frente = cola.frente === USUARIO_ACTUAL ? 'Vos (usuario de esta app)' : cola.frente;
  const esperando = `${cola.cantidad} ${cola.cantidad === 1 ? 'persona esperando' : 'personas esperando'}`;

  return (
    <View style={styles.tarjeta}>
      <Text style={styles.titulo}>{cola.libro.titulo}</Text>
      <Text style={styles.autor}>{cola.libro.autor}</Text>
      <View style={styles.datos}>
        <Text style={styles.etiqueta}>Al frente</Text>
        <Text style={styles.frente}>{frente}</Text>
        <Text style={styles.cantidad}>{esperando}</Text>
      </View>
      <Boton titulo="Entregar al siguiente" onPress={onEntregar} />
    </View>
  );
}

const styles = StyleSheet.create({
  tarjeta: {
    backgroundColor: colores.superficie,
    borderRadius: radios.medio,
    borderWidth: 1,
    borderColor: colores.borde,
    padding: espaciado.lg,
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
  datos: {
    marginVertical: espaciado.sm,
    padding: espaciado.md,
    borderRadius: radios.chico,
    backgroundColor: colores.fondo,
    gap: espaciado.xs,
  },
  etiqueta: {
    fontSize: tipografia.chica,
    color: colores.textoSecundario,
  },
  frente: {
    fontSize: tipografia.mediana,
    fontWeight: '700',
    color: colores.primario,
  },
  cantidad: {
    fontSize: tipografia.chica,
    color: colores.aviso,
    fontWeight: '600',
  },
});
