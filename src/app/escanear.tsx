import { CameraView, type BarcodeScanningResult } from 'expo-camera';
import { router } from 'expo-router';
import { useCallback } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';

import { IngresoManualIsbn } from '@/components/IngresoManualIsbn';
import { PanelCamara } from '@/components/PanelCamara';
import { TEXTOS_PERMISO } from '@/constants/permisos';
import { colores, espaciado, radios, tamanios, tipografia } from '@/constants/tema';
import { useApp } from '@/context/AppContext';
import { useEscaner } from '@/hooks/useEscaner';
import { usePermiso } from '@/hooks/usePermiso';
import { esIsbnValido } from '@/lib/isbn';

//replace: el escaner sale de la pila y atras no vuelve a abrir la camara
function abrirLibro(isbn: string) {
  router.replace({ pathname: '/libro/[isbn]', params: { isbn } });
}

function irAPermiso() {
  router.push({ pathname: '/permisos/[recurso]', params: { recurso: 'camara' } });
}

export default function Escanear() {
  const { estado, abrirAjustes } = usePermiso();
  const { obtenerLibro } = useApp();

  const existeLibro = useCallback((isbn: string) => obtenerLibro(isbn) !== undefined, [obtenerLibro]);
  const { aviso, alLeerCodigo } = useEscaner(existeLibro, abrirLibro);

  function alEscanear({ data }: BarcodeScanningResult) {
    alLeerCodigo(data);
  }

  function buscarManual(isbn: string): string | null {
    if (!esIsbnValido(isbn)) {
      return 'El ISBN debe tener exactamente 13 números, sin letras ni guiones.';
    }
    if (!existeLibro(isbn)) {
      return `No encontramos el ISBN ${isbn} en el catálogo. Revisá los números o probá con otro.`;
    }
    abrirLibro(isbn);
    return null;
  }

  return (
    <ScrollView contentContainerStyle={styles.contenido} keyboardShouldPersistTaps="handled">
      <View style={styles.marcoCamara}>
        {estado === 'cargando' && <ActivityIndicator size="large" color={colores.textoInvertido} />}
        {estado === 'concedido' && (
          <CameraView
            style={styles.camara}
            facing="back"
            barcodeScannerSettings={{ barcodeTypes: ['ean13'] }}
            onBarcodeScanned={alEscanear}
          />
        )}
        {estado === 'preguntable' && (
          <PanelCamara
            mensaje="Para escanear necesitamos activar la cámara."
            textoBoton="Activar cámara"
            onPress={irAPermiso}
          />
        )}
        {estado === 'bloqueado' && (
          <PanelCamara
            mensaje={TEXTOS_PERMISO.camara.bloqueado}
            textoBoton="Abrir Ajustes"
            onPress={abrirAjustes}
          />
        )}
      </View>

      {estado === 'concedido' && (
        <Text style={styles.indicacion}>
          Ubicá el código de barras de la contratapa dentro del recuadro.
        </Text>
      )}

      {aviso !== null && (
        <View style={styles.aviso} accessibilityLiveRegion="polite">
          <Text style={styles.textoAviso}>{aviso}</Text>
        </View>
      )}

      <IngresoManualIsbn onBuscar={buscarManual} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  contenido: {
    padding: espaciado.lg,
    gap: espaciado.lg,
  },
  marcoCamara: {
    height: tamanios.vistaCamara,
    borderRadius: radios.grande,
    overflow: 'hidden',
    backgroundColor: colores.texto,
    alignItems: 'center',
    justifyContent: 'center',
  },
  camara: {
    ...StyleSheet.absoluteFill,
  },
  indicacion: {
    fontSize: tipografia.normal,
    color: colores.textoSecundario,
    textAlign: 'center',
  },
  aviso: {
    backgroundColor: colores.avisoFondo,
    borderRadius: radios.medio,
    padding: espaciado.md,
  },
  textoAviso: {
    fontSize: tipografia.normal,
    color: colores.aviso,
  },
});
