import { router, usePathname } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { Boton } from '@/components/Boton';
import { colores, espaciado, radios, tipografia } from '@/constants/tema';

function volverAlCatalogo() {
  router.dismissTo('/');
}

export default function NoEncontrada() {
  //en una ruta inexistente, usePathname devuelve la direccion que se intento abrir
  const ruta = usePathname();

  return (
    <View style={styles.pantalla}>
      <Text style={styles.codigo}>404</Text>
      <Text style={styles.titulo} accessibilityRole="header">
        Página no encontrada
      </Text>
      <Text style={styles.mensaje}>
        La dirección que abriste no existe en Biblioteca IPF. Puede que el enlace esté mal escrito o
        sea de una versión anterior de la app.
      </Text>
      <View style={styles.ruta}>
        <Text style={styles.etiquetaRuta}>Dirección solicitada</Text>
        <Text style={styles.textoRuta} selectable>
          {ruta}
        </Text>
      </View>
      <Boton titulo="Volver al Catálogo" onPress={volverAlCatalogo} />
    </View>
  );
}

const styles = StyleSheet.create({
  pantalla: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: espaciado.xl,
    gap: espaciado.md,
    backgroundColor: colores.fondo,
  },
  codigo: {
    fontSize: tipografia.titulo * 3,
    fontWeight: '900',
    color: colores.primario,
  },
  titulo: {
    fontSize: tipografia.titulo,
    fontWeight: '800',
    color: colores.texto,
    textAlign: 'center',
  },
  mensaje: {
    fontSize: tipografia.normal,
    color: colores.textoSecundario,
    textAlign: 'center',
  },
  ruta: {
    alignSelf: 'stretch',
    backgroundColor: colores.superficie,
    borderRadius: radios.medio,
    borderWidth: 1,
    borderColor: colores.borde,
    padding: espaciado.md,
    marginBottom: espaciado.sm,
    gap: espaciado.xs,
  },
  etiquetaRuta: {
    fontSize: tipografia.chica,
    color: colores.textoSecundario,
  },
  textoRuta: {
    fontSize: tipografia.mediana,
    fontWeight: '600',
    color: colores.error,
  },
});
