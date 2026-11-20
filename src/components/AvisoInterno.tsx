import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import { colores, espaciado, radios, tipografia } from '../constants/tema';
import type { Aviso } from '../types';
import { EnlaceTexto } from './EnlaceTexto';

type AvisoInternoProps = {
  aviso: Aviso;
  onMarcarLeido: (id: string) => void;
};

export function AvisoInterno({ aviso, onMarcarLeido }: AvisoInternoProps) {
  return (
    <View style={[styles.aviso, aviso.leido && styles.leido]}>
      <View style={styles.fila}>
        <Ionicons
          name={aviso.leido ? 'mail-open-outline' : 'mail-unread-outline'}
          size={20}
          color={aviso.leido ? colores.textoSecundario : colores.aviso}
        />
        <Text style={[styles.mensaje, aviso.leido && styles.mensajeLeido]}>{aviso.mensaje}</Text>
      </View>
      {!aviso.leido && (
        <EnlaceTexto texto="Marcar como leído" onPress={() => onMarcarLeido(aviso.id)} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  aviso: {
    backgroundColor: colores.avisoFondo,
    borderRadius: radios.medio,
    padding: espaciado.md,
    gap: espaciado.xs,
  },
  leido: {
    backgroundColor: colores.superficie,
    borderWidth: 1,
    borderColor: colores.borde,
  },
  fila: {
    flexDirection: 'row',
    gap: espaciado.sm,
  },
  mensaje: {
    flex: 1,
    fontSize: tipografia.normal,
    color: colores.texto,
  },
  mensajeLeido: {
    color: colores.textoSecundario,
  },
});
