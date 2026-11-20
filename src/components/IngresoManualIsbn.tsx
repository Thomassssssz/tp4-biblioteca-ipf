import { useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';

import { colores, espaciado, radios, TAMANIO_TACTIL_MINIMO, tipografia } from '../constants/tema';
import { Boton } from './Boton';

type IngresoManualIsbnProps = {
  //devuelve un mensaje si no se pudo abrir el libro, o null si se navego al detalle
  onBuscar: (isbn: string) => string | null;
};

export function IngresoManualIsbn({ onBuscar }: IngresoManualIsbnProps) {
  const [isbn, setIsbn] = useState('');
  const [mensaje, setMensaje] = useState<string | null>(null);

  function cambiarTexto(texto: string) {
    setIsbn(texto);
    setMensaje(null);
  }

  function buscar() {
    setMensaje(onBuscar(isbn.trim()));
  }

  return (
    <View style={styles.tarjeta}>
      <Text style={styles.titulo}>Ingresar ISBN manualmente</Text>
      <Text style={styles.ayuda}>Son los 13 números que figuran debajo del código de barras.</Text>
      <TextInput
        value={isbn}
        onChangeText={cambiarTexto}
        onSubmitEditing={buscar}
        placeholder="9789500700016"
        placeholderTextColor={colores.textoSecundario}
        accessibilityLabel="ISBN de 13 dígitos"
        keyboardType="number-pad"
        maxLength={13}
        returnKeyType="search"
        style={styles.entrada}
      />
      {mensaje !== null && (
        <Text style={styles.mensaje} accessibilityLiveRegion="polite">
          {mensaje}
        </Text>
      )}
      <Boton titulo="Buscar libro" onPress={buscar} deshabilitado={isbn.trim().length === 0} />
    </View>
  );
}

const styles = StyleSheet.create({
  tarjeta: {
    backgroundColor: colores.superficie,
    borderRadius: radios.grande,
    borderWidth: 1,
    borderColor: colores.borde,
    padding: espaciado.lg,
    gap: espaciado.sm,
  },
  titulo: {
    fontSize: tipografia.mediana,
    fontWeight: '700',
    color: colores.texto,
  },
  ayuda: {
    fontSize: tipografia.chica,
    color: colores.textoSecundario,
  },
  entrada: {
    minHeight: TAMANIO_TACTIL_MINIMO,
    borderWidth: 1,
    borderColor: colores.borde,
    borderRadius: radios.medio,
    paddingHorizontal: espaciado.md,
    fontSize: tipografia.mediana,
    letterSpacing: 1,
    color: colores.texto,
    backgroundColor: colores.fondo,
  },
  mensaje: {
    fontSize: tipografia.chica,
    color: colores.error,
  },
});
