import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { Boton } from '@/components/Boton';
import { EnlaceTexto } from '@/components/EnlaceTexto';
import { MensajePantalla } from '@/components/MensajePantalla';
import { TEXTOS_PERMISO } from '@/constants/permisos';
import { colores, espaciado, tamanios, tipografia } from '@/constants/tema';
import { usePermiso } from '@/hooks/usePermiso';
import { valorParametro } from '@/lib/parametros';
import { esRecursoPermiso } from '@/lib/permisos';

//dismissTo vuelve al escaner si ya estaba abierto debajo; si no, reemplaza este modal por el escaner
function irAlEscaner() {
  router.dismissTo('/escanear');
}

export default function PantallaPermiso() {
  const { recurso: parametro } = useLocalSearchParams<{ recurso: string }>();
  const recurso = valorParametro(parametro);
  const { estado, pedir, abrirAjustes } = usePermiso();

  if (!esRecursoPermiso(recurso)) {
    return (
      <MensajePantalla
        icono="help-circle-outline"
        titulo="Permiso desconocido"
        mensaje="Esta pantalla no corresponde a ningún permiso de la app.">
        <Boton titulo="Volver al Catálogo" onPress={() => router.dismissTo('/')} />
      </MensajePantalla>
    );
  }

  const textos = TEXTOS_PERMISO[recurso];

  async function continuar() {
    if (estado === 'concedido' || (await pedir()) === 'concedido') {
      irAlEscaner();
    }
  }

  return (
    <View style={styles.pantalla}>
      <View style={styles.contenido}>
        <View style={styles.icono}>
          <Ionicons name={textos.icono} size={40} color={colores.primario} />
        </View>
        <Text style={styles.titulo} accessibilityRole="header">
          {textos.titulo}
        </Text>
        <Text style={styles.beneficio}>{textos.beneficio}</Text>
        {estado === 'bloqueado' && <Text style={styles.bloqueado}>{textos.bloqueado}</Text>}
      </View>

      <View style={styles.acciones}>
        {estado === 'cargando' && <ActivityIndicator color={colores.primario} />}
        {(estado === 'preguntable' || estado === 'concedido') && (
          <Boton titulo="Continuar" onPress={continuar} />
        )}
        {estado === 'bloqueado' && <Boton titulo="Abrir Ajustes" onPress={abrirAjustes} />}
        <EnlaceTexto texto="Ingresar ISBN manualmente" onPress={irAlEscaner} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  pantalla: {
    flex: 1,
    padding: espaciado.xl,
    backgroundColor: colores.fondo,
    justifyContent: 'space-between',
  },
  contenido: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: espaciado.md,
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
    textAlign: 'center',
  },
  beneficio: {
    fontSize: tipografia.mediana,
    color: colores.textoSecundario,
    textAlign: 'center',
  },
  bloqueado: {
    fontSize: tipografia.normal,
    color: colores.aviso,
    textAlign: 'center',
  },
  acciones: {
    gap: espaciado.sm,
    paddingBottom: espaciado.lg,
  },
});
