import { Ionicons } from '@expo/vector-icons';
import { Link, type Href } from 'expo-router';
import type { ComponentProps } from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';

import { colores, espaciado, radios, TAMANIO_TACTIL_MINIMO, tipografia } from '../constants/tema';

type AccesoRapidoProps = {
  href: Href;
  icono: ComponentProps<typeof Ionicons>['name'];
  texto: string;
};

export function AccesoRapido({ href, icono, texto }: AccesoRapidoProps) {
  return (
    <Link href={href} asChild>
      <Pressable
        accessibilityRole="button"
        style={({ pressed }) => [styles.acceso, pressed && styles.presionado]}>
        <Ionicons name={icono} size={20} color={colores.primario} />
        <Text style={styles.texto}>{texto}</Text>
      </Pressable>
    </Link>
  );
}

const styles = StyleSheet.create({
  acceso: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: espaciado.sm,
    minHeight: TAMANIO_TACTIL_MINIMO,
    paddingHorizontal: espaciado.lg,
    backgroundColor: colores.superficie,
    borderRadius: radios.medio,
    borderWidth: 1,
    borderColor: colores.borde,
  },
  presionado: {
    opacity: 0.8,
  },
  texto: {
    fontSize: tipografia.normal,
    color: colores.textoSecundario,
  },
});
