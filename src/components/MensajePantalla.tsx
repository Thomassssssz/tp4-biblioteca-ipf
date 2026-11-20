import { Ionicons } from '@expo/vector-icons';
import type { ComponentProps, ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { colores, espaciado, tipografia } from '../constants/tema';

type MensajePantallaProps = {
  icono: ComponentProps<typeof Ionicons>['name'];
  titulo: string;
  mensaje: string;
  children?: ReactNode;
};

export function MensajePantalla({ icono, titulo, mensaje, children }: MensajePantallaProps) {
  return (
    <View style={styles.contenedor}>
      <Ionicons name={icono} size={48} color={colores.primario} />
      <Text style={styles.titulo} accessibilityRole="header">
        {titulo}
      </Text>
      <Text style={styles.mensaje}>{mensaje}</Text>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  contenedor: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: espaciado.xl,
    gap: espaciado.md,
  },
  titulo: {
    fontSize: tipografia.grande,
    fontWeight: '700',
    color: colores.texto,
    textAlign: 'center',
  },
  mensaje: {
    fontSize: tipografia.normal,
    color: colores.textoSecundario,
    textAlign: 'center',
    marginBottom: espaciado.sm,
  },
});
