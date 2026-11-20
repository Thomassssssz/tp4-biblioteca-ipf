import { StyleSheet, Text, View } from 'react-native';

import { colores, espaciado, radios, tipografia } from '../constants/tema';
import type { Libro } from '../types';

type TarjetaLibroProps = {
  libro: Libro;
  disponibles: number;
};

export function TarjetaLibro({ libro, disponibles }: TarjetaLibroProps) {
  const hayEjemplares = disponibles > 0;
  const textoDisponibilidad = hayEjemplares
    ? `${disponibles} ${disponibles === 1 ? 'disponible' : 'disponibles'}`
    : 'Sin ejemplares';

  return (
    <View style={styles.tarjeta}>
      <View style={styles.lomo} />
      <View style={styles.info}>
        <Text style={styles.titulo} numberOfLines={2}>
          {libro.titulo}
        </Text>
        <Text style={styles.autor} numberOfLines={1}>
          {libro.autor} · {libro.anio}
        </Text>
        <View style={[styles.etiqueta, hayEjemplares ? styles.etiquetaOk : styles.etiquetaAgotado]}>
          <Text style={[styles.textoEtiqueta, hayEjemplares ? styles.textoOk : styles.textoAgotado]}>
            {textoDisponibilidad}
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  tarjeta: {
    flexDirection: 'row',
    backgroundColor: colores.superficie,
    borderRadius: radios.medio,
    borderWidth: 1,
    borderColor: colores.borde,
    overflow: 'hidden',
  },
  lomo: {
    width: espaciado.sm,
    backgroundColor: colores.primario,
  },
  info: {
    flex: 1,
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
  etiqueta: {
    alignSelf: 'flex-start',
    marginTop: espaciado.xs,
    paddingHorizontal: espaciado.sm,
    paddingVertical: espaciado.xs,
    borderRadius: radios.chico,
  },
  etiquetaOk: {
    backgroundColor: colores.primarioClaro,
  },
  etiquetaAgotado: {
    backgroundColor: colores.avisoFondo,
  },
  textoEtiqueta: {
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
