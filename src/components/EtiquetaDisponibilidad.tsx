import { StyleSheet, Text, View } from 'react-native';

import { colores, espaciado, radios, tipografia } from '../constants/tema';

type EtiquetaDisponibilidadProps = {
  disponibles: number;
};

export function EtiquetaDisponibilidad({ disponibles }: EtiquetaDisponibilidadProps) {
  const hayEjemplares = disponibles > 0;
  const texto = hayEjemplares
    ? `${disponibles} ${disponibles === 1 ? 'disponible' : 'disponibles'}`
    : 'Sin ejemplares';

  return (
    <View style={[styles.etiqueta, hayEjemplares ? styles.fondoOk : styles.fondoAgotado]}>
      <Text style={[styles.texto, hayEjemplares ? styles.textoOk : styles.textoAgotado]}>{texto}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  etiqueta: {
    alignSelf: 'flex-start',
    marginTop: espaciado.xs,
    paddingHorizontal: espaciado.sm,
    paddingVertical: espaciado.xs,
    borderRadius: radios.chico,
  },
  fondoOk: {
    backgroundColor: colores.primarioClaro,
  },
  fondoAgotado: {
    backgroundColor: colores.avisoFondo,
  },
  texto: {
    fontSize: tipografia.chica,
    fontWeight: '600',
  },
  textoOk: {
    color: colores.primario,
  },
  textoAgotado: {
    color: colores.aviso,
  },
});
