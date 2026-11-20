import { useCameraPermissions } from 'expo-camera';
import { useCallback, useEffect } from 'react';
import { AppState, Linking } from 'react-native';

import { clasificarPermiso } from '../lib/permisos';
import type { EstadoPermiso } from '../types';

type ResultadoUsePermiso = {
  estado: EstadoPermiso;
  pedir: () => Promise<EstadoPermiso>;
  abrirAjustes: () => void;
};

export function usePermiso(): ResultadoUsePermiso {
  //useCameraPermissions consulta el estado al montar, sin mostrar el dialogo del sistema
  const [respuesta, solicitar, consultar] = useCameraPermissions();

  //al volver de ajustes la app pasa a active: se vuelve a consultar el permiso
  useEffect(() => {
    const suscripcion = AppState.addEventListener('change', (estadoApp) => {
      if (estadoApp === 'active') {
        consultar();
      }
    });
    return () => suscripcion.remove();
  }, [consultar]);

  const pedir = useCallback(async () => clasificarPermiso(await solicitar()), [solicitar]);

  const abrirAjustes = useCallback(() => {
    Linking.openSettings();
  }, []);

  return { estado: clasificarPermiso(respuesta), pedir, abrirAjustes };
}
