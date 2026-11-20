import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';

import { colores, espaciado, radios, TAMANIO_TACTIL_MINIMO, tipografia } from '../constants/tema';

type CampoBusquedaProps = {
  valor: string;
  onCambiar: (texto: string) => void;
};

export function CampoBusqueda({ valor, onCambiar }: CampoBusquedaProps) {
  return (
    <View style={styles.campo}>
      <Ionicons name="search" size={20} color={colores.textoSecundario} />
      <TextInput
        value={valor}
        onChangeText={onCambiar}
        placeholder="Título o autor"
        placeholderTextColor={colores.textoSecundario}
        accessibilityLabel="Buscar por título o autor"
        autoFocus
        autoCorrect={false}
        autoCapitalize="none"
        returnKeyType="search"
        style={styles.entrada}
      />
      {valor.length > 0 && (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Borrar búsqueda"
          onPress={() => onCambiar('')}
          style={styles.borrar}>
          <Ionicons name="close-circle" size={22} color={colores.textoSecundario} />
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  campo: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: TAMANIO_TACTIL_MINIMO,
    paddingLeft: espaciado.md,
    backgroundColor: colores.superficie,
    borderRadius: radios.medio,
    borderWidth: 1,
    borderColor: colores.borde,
  },
  entrada: {
    flex: 1,
    minHeight: TAMANIO_TACTIL_MINIMO,
    paddingHorizontal: espaciado.sm,
    fontSize: tipografia.mediana,
    color: colores.texto,
  },
  borrar: {
    width: TAMANIO_TACTIL_MINIMO,
    height: TAMANIO_TACTIL_MINIMO,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
