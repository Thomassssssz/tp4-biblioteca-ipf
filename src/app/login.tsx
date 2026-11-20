import { Ionicons } from '@expo/vector-icons';
import { useRef, useState, type ComponentRef } from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, View } from 'react-native';

import { Boton } from '@/components/Boton';
import { colores, espaciado, radios, tamanios, TAMANIO_TACTIL_MINIMO, tipografia } from '@/constants/tema';
import { useApp } from '@/context/AppContext';
import type { ResultadoLogin } from '@/types';

const MENSAJES_ERROR: Record<Extract<ResultadoLogin, { ok: false }>['motivo'], string> = {
  vacios: 'Completá el usuario y la contraseña.',
  incorrectas: 'Usuario o contraseña incorrectos. Revisalos e intentá de nuevo.',
};

export default function Login() {
  const { iniciarSesion } = useApp();
  const [usuario, setUsuario] = useState('');
  const [clave, setClave] = useState('');
  const [error, setError] = useState<string | null>(null);
  const claveRef = useRef<ComponentRef<typeof TextInput>>(null);

  function cambiarUsuario(texto: string) {
    setUsuario(texto);
    setError(null);
  }

  function cambiarClave(texto: string) {
    setClave(texto);
    setError(null);
  }

  //si es correcto, Stack.Protected quita esta pantalla: no hace falta navegar a mano
  function ingresar() {
    const resultado = iniciarSesion(usuario, clave);
    if (!resultado.ok) {
      setError(MENSAJES_ERROR[resultado.motivo]);
      setClave('');
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.pantalla}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={styles.cabecera}>
        <View style={styles.icono}>
          <Ionicons name="person-circle" size={44} color={colores.primario} />
        </View>
        <Text style={styles.titulo} accessibilityRole="header">
          Acceso del personal
        </Text>
        <Text style={styles.subtitulo}>Ingresá para atender el mostrador de la biblioteca.</Text>
      </View>

      <View style={styles.formulario}>
        <Text style={styles.etiqueta}>Usuario</Text>
        <TextInput
          value={usuario}
          onChangeText={cambiarUsuario}
          onSubmitEditing={() => claveRef.current?.focus()}
          accessibilityLabel="Usuario"
          autoCapitalize="none"
          autoCorrect={false}
          autoComplete="username"
          textContentType="username"
          returnKeyType="next"
          submitBehavior="submit"
          style={styles.entrada}
        />

        <Text style={styles.etiqueta}>Contraseña</Text>
        <TextInput
          ref={claveRef}
          value={clave}
          onChangeText={cambiarClave}
          onSubmitEditing={ingresar}
          accessibilityLabel="Contraseña"
          secureTextEntry
          autoCapitalize="none"
          autoCorrect={false}
          autoComplete="current-password"
          textContentType="password"
          returnKeyType="go"
          style={styles.entrada}
        />

        {error !== null && (
          <Text style={styles.error} accessibilityLiveRegion="assertive">
            {error}
          </Text>
        )}

        <Boton titulo="Ingresar" onPress={ingresar} />
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  pantalla: {
    flex: 1,
    padding: espaciado.xl,
    justifyContent: 'center',
    backgroundColor: colores.fondo,
    gap: espaciado.xl,
  },
  cabecera: {
    alignItems: 'center',
    gap: espaciado.sm,
  },
  icono: {
    width: tamanios.circuloIcono,
    height: tamanios.circuloIcono,
    borderRadius: tamanios.circuloIcono / 2,
    backgroundColor: colores.primarioClaro,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titulo: {
    fontSize: tipografia.titulo,
    fontWeight: '800',
    color: colores.texto,
  },
  subtitulo: {
    fontSize: tipografia.normal,
    color: colores.textoSecundario,
    textAlign: 'center',
  },
  formulario: {
    backgroundColor: colores.superficie,
    borderRadius: radios.grande,
    borderWidth: 1,
    borderColor: colores.borde,
    padding: espaciado.lg,
    gap: espaciado.sm,
  },
  etiqueta: {
    fontSize: tipografia.chica,
    fontWeight: '600',
    color: colores.textoSecundario,
  },
  entrada: {
    minHeight: TAMANIO_TACTIL_MINIMO,
    borderWidth: 1,
    borderColor: colores.borde,
    borderRadius: radios.medio,
    paddingHorizontal: espaciado.md,
    fontSize: tipografia.mediana,
    color: colores.texto,
    backgroundColor: colores.fondo,
    marginBottom: espaciado.xs,
  },
  error: {
    fontSize: tipografia.normal,
    color: colores.error,
  },
});
