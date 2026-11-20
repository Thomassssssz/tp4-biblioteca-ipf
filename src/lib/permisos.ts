import type { EstadoPermiso, RecursoPermiso } from '../types';

export type RespuestaPermiso = {
  status: string;
  canAskAgain: boolean;
};

const RECURSOS: readonly RecursoPermiso[] = ['camara', 'notificaciones'];

export function esRecursoPermiso(valor: string): valor is RecursoPermiso {
  return RECURSOS.some((recurso) => recurso === valor);
}

//status solo dice si esta concedido; canAskAgain distingue si todavia se puede mostrar el dialogo
export function clasificarPermiso(respuesta: RespuestaPermiso | null): EstadoPermiso {
  if (!respuesta) {
    return 'cargando';
  }
  if (respuesta.status === 'granted') {
    return 'concedido';
  }
  return respuesta.canAskAgain ? 'preguntable' : 'bloqueado';
}
