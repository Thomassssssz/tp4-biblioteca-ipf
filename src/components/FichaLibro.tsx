import { StyleSheet, Text, View } from 'react-native';

import { colores, espaciado, radios, tipografia } from '../constants/tema';
import type { Libro } from '../types';
import { DatoFicha } from './DatoFicha';
import { EtiquetaDisponibilidad } from './EtiquetaDisponibilidad';

type FichaLibroProps = {
  libro: Libro;
  disponibles: number;
  enEspera: number;
};

export function FichaLibro({ libro, disponibles, enEspera }: FichaLibroProps) {
  const textoEspera =
    enEspera === 0
      ? 'Nadie en lista de espera'
      : `${enEspera} ${enEspera === 1 ? 'persona' : 'personas'} en lista de espera`;

  return (
    <View style={styles.ficha}>
      <Text style={styles.titulo} accessibilityRole="header">
        {libro.titulo}
      </Text>
      <Text style={styles.autor}>{libro.autor}</Text>
      <EtiquetaDisponibilidad disponibles={disponibles} />
      <View style={styles.datos}>
        <DatoFicha etiqueta="Año" valor={String(libro.anio)} />
        <DatoFicha etiqueta="ISBN" valor={libro.isbn} />
        <DatoFicha etiqueta="Ejemplares disponibles" valor={String(disponibles)} />
        <DatoFicha etiqueta="Lista de espera" valor={textoEspera} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  ficha: {
    backgroundColor: colores.superficie,
    borderRadius: radios.grande,
    borderWidth: 1,
    borderColor: colores.borde,
    padding: espaciado.xl,
    gap: espaciado.xs,
  },
  titulo: {
    fontSize: tipografia.titulo,
    fontWeight: '800',
    color: colores.primario,
  },
  autor: {
    fontSize: tipografia.mediana,
    color: colores.textoSecundario,
  },
  datos: {
    marginTop: espaciado.lg,
    gap: espaciado.md,
  },
});
