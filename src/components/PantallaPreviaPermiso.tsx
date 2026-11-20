import { Ionicons } from '@expo/vector-icons';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { TEXTOS_PERMISO } from '../constants/permisos';
import { colores, espaciado, tamanios, tipografia } from '../constants/tema';
import { usePermiso } from '../hooks/usePermiso';
import type { RecursoPermiso } from '../types';
import { Boton } from './Boton';
import { EnlaceTexto } from './EnlaceTexto';

type PantallaPreviaPermisoProps = {
  recurso: RecursoPermiso;
  onConcedido: () => void;
  //enlace secundario opcional, por ejemplo el ingreso manual del isbn
  alternativa?: { texto: string; onPress: () => void };
  //si no se indica, al negar la pantalla queda abierta mostrando el estado nuevo
  onNegado?: () => void;
};

export function PantallaPreviaPermiso({
  recurso,
  onConcedido,
  alternativa,
  onNegado,
}: PantallaPreviaPermisoProps) {
  const { estado, pedir, abrirAjustes } = usePermiso(recurso);
  const textos = TEXTOS_PERMISO[recurso];

  async function continuar() {
    //si ya esta concedido no se vuelve a mostrar el dialogo del sistema
    if (estado === 'concedido' || (await pedir()) === 'concedido') {
      onConcedido();
      return;
    }
    onNegado?.();
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
        {alternativa && <EnlaceTexto texto={alternativa.texto} onPress={alternativa.onPress} />}
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
