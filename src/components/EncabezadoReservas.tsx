import { StyleSheet, View } from 'react-native';

import { TEXTOS_PERMISO } from '../constants/permisos';
import { espaciado } from '../constants/tema';
import type { Aviso } from '../types';
import { AvisoInterno } from './AvisoInterno';
import { CartelPermisoBloqueado } from './CartelPermisoBloqueado';
import { TituloSeccion } from './TituloSeccion';

type EncabezadoReservasProps = {
  avisos: Aviso[];
  notificacionesBloqueadas: boolean;
  onAbrirAjustes: () => void;
  onMarcarLeido: (id: string) => void;
};

export function EncabezadoReservas({
  avisos,
  notificacionesBloqueadas,
  onAbrirAjustes,
  onMarcarLeido,
}: EncabezadoReservasProps) {
  if (avisos.length === 0 && !notificacionesBloqueadas) {
    return null;
  }

  return (
    <View style={styles.encabezado}>
      {notificacionesBloqueadas && (
        <CartelPermisoBloqueado
          mensaje={TEXTOS_PERMISO.notificaciones.bloqueado}
          onAbrirAjustes={onAbrirAjustes}
        />
      )}
      {avisos.length > 0 && <TituloSeccion texto="Avisos" />}
      {avisos.map((aviso) => (
        <AvisoInterno key={aviso.id} aviso={aviso} onMarcarLeido={onMarcarLeido} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  encabezado: {
    gap: espaciado.md,
    marginBottom: espaciado.md,
  },
});
