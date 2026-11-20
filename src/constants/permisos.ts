import type { Ionicons } from '@expo/vector-icons';
import type { ComponentProps } from 'react';

import type { RecursoPermiso } from '../types';

type TextosPermiso = {
  icono: ComponentProps<typeof Ionicons>['name'];
  titulo: string;
  beneficio: string;
  bloqueado: string;
};

export const TEXTOS_PERMISO: Record<RecursoPermiso, TextosPermiso> = {
  camara: {
    icono: 'camera',
    titulo: 'Escanear con la cámara',
    beneficio: 'Usamos tu cámara para leer el código ISBN de la contratapa y abrir ese libro al instante.',
    bloqueado:
      'La cámara está bloqueada para esta app. Podés habilitarla desde Ajustes o escribir el ISBN a mano.',
  },
  notificaciones: {
    icono: 'notifications',
    titulo: 'Recordatorios de devolución',
    beneficio: 'Usamos las notificaciones para recordarte cuándo devolver tus libros y avisarte cuando te entreguen uno reservado.',
    bloqueado:
      'Las notificaciones están bloqueadas para esta app. Podés habilitarlas desde Ajustes; mientras tanto, los avisos aparecen en Mis reservas.',
  },
};
