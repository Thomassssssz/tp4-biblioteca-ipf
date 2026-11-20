import { useCameraPermissions } from 'expo-camera';
import { useCallback, useEffect, useRef, useState } from 'react';
import { AppState, Linking } from 'react-native';

import { consultarPermisoNotificaciones, pedirPermisoNotificaciones } from '../lib/notificaciones';
import { clasificarPermiso, type RespuestaPermiso } from '../lib/permisos';
import type { EstadoPermiso, RecursoPermiso } from '../types';

type ResultadoUsePermiso = {
  estado: EstadoPermiso;
  pedir: () => Promise<EstadoPermiso>;
  abrirAjustes: () => void;
};

export function usePermiso(recurso: RecursoPermiso): ResultadoUsePermiso {
  //consultar no muestra el dialogo del sistema; solo pedir lo hace
  const [camara, solicitarCamara, consultarCamara] = useCameraPermissions({
    get: recurso === 'camara',
  });
  //expo-notifications no trae un hook de permisos: el estado se guarda aca
  const [notificaciones, setNotificaciones] = useState<RespuestaPermiso | null>(null);
  const montadoRef = useRef(true);

  useEffect(() => {
    montadoRef.current = true;
    return () => {
      montadoRef.current = false;
    };
  }, []);

  const actualizar = useCallback(async () => {
    if (recurso === 'camara') {
      await consultarCamara();
      return;
    }
    const respuesta = await consultarPermisoNotificaciones();
    if (montadoRef.current) {
      setNotificaciones(respuesta);
    }
  }, [recurso, consultarCamara]);

  useEffect(() => {
    if (recurso === 'notificaciones') {
      actualizar();
    }
    //al volver de ajustes la app pasa a active: se vuelve a consultar el permiso
    const suscripcion = AppState.addEventListener('change', (estadoApp) => {
      if (estadoApp === 'active') {
        actualizar();
      }
    });
    return () => suscripcion.remove();
  }, [recurso, actualizar]);

  const pedir = useCallback(async () => {
    if (recurso === 'camara') {
      return clasificarPermiso(await solicitarCamara());
    }
    const respuesta = await pedirPermisoNotificaciones();
    if (montadoRef.current) {
      setNotificaciones(respuesta);
    }
    return clasificarPermiso(respuesta);
  }, [recurso, solicitarCamara]);

  const abrirAjustes = useCallback(() => {
    Linking.openSettings();
  }, []);

  return {
    estado: clasificarPermiso(recurso === 'camara' ? camara : notificaciones),
    pedir,
    abrirAjustes,
  };
}
