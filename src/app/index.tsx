import { StyleSheet, Text, View } from 'react-native';

import { colores, espaciado, tipografia } from '@/constants/tema';

export default function Inicio() {
  return (
    <View style={styles.contenedor}>
      <Text style={styles.titulo}>Biblioteca IPF</Text>
      <Text style={styles.subtitulo}>El catálogo estará disponible muy pronto.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  contenedor: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: espaciado.xl,
    backgroundColor: colores.fondo,
  },
  titulo: {
    fontSize: tipografia.titulo,
    fontWeight: '700',
    color: colores.primario,
  },
  subtitulo: {
    marginTop: espaciado.sm,
    fontSize: tipografia.normal,
    color: colores.textoSecundario,
    textAlign: 'center',
  },
});
