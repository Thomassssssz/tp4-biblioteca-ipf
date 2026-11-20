import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colores, espaciado, TAMANIO_TACTIL_MINIMO, tipografia } from '../constants/tema';
import { useApp } from '../context/AppContext';

function abrirLogin() {
  router.push('/login');
}

function abrirMostrador() {
  router.push('/mostrador');
}

export function BotonPersonal() {
  const { sesion, cerrarSesion } = useApp();

  //con sesion no se vuelven a pedir credenciales: se entra directo al mostrador
  if (sesion) {
    return (
      <View style={styles.fila}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Abrir el mostrador"
          onPress={abrirMostrador}
          style={styles.boton}>
          <Ionicons name="storefront-outline" size={20} color={colores.textoInvertido} />
          <Text style={styles.texto}>Mostrador</Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Cerrar la sesión de ${sesion.usuario}`}
          onPress={cerrarSesion}
          style={styles.boton}>
          <Ionicons name="log-out-outline" size={22} color={colores.textoInvertido} />
        </Pressable>
      </View>
    );
  }

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Ingreso del personal de la biblioteca"
      onPress={abrirLogin}
      style={styles.boton}>
      <Ionicons name="person-circle-outline" size={20} color={colores.textoInvertido} />
      <Text style={styles.texto}>Personal</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  fila: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  boton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: espaciado.xs,
    minHeight: TAMANIO_TACTIL_MINIMO,
    minWidth: TAMANIO_TACTIL_MINIMO,
    paddingHorizontal: espaciado.sm,
    justifyContent: 'center',
  },
  texto: {
    fontSize: tipografia.normal,
    fontWeight: '600',
    color: colores.textoInvertido,
  },
});
