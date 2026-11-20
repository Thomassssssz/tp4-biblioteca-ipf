import {
  AndroidImportance,
  cancelScheduledNotificationAsync,
  getPermissionsAsync,
  requestPermissionsAsync,
  SchedulableTriggerInputTypes,
  scheduleNotificationAsync,
  setNotificationChannelAsync,
  setNotificationHandler,
} from 'expo-notifications';
import { Platform } from 'react-native';

import { CANAL_PRESTAMOS, SEGUNDOS_RECORDATORIO } from '../constants/biblioteca';
import type { Libro } from '../types';
import { formatearFecha } from './fechas';

//sin este manejador la notificacion no se muestra si la app esta abierta
export function configurarPresentacion(): void {
  setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });
}

//en android 13 o superior el dialogo del permiso solo aparece si ya existe un canal
//setNotificationChannelAsync actualiza el canal si ya existe, no lo duplica
async function prepararCanal(): Promise<void> {
  if (Platform.OS !== 'android') {
    return;
  }
  await setNotificationChannelAsync(CANAL_PRESTAMOS, {
    name: 'Préstamos',
    description: 'Recordatorios de devolución y entregas de libros reservados',
    importance: AndroidImportance.HIGH,
  });
}

export function consultarPermisoNotificaciones() {
  return getPermissionsAsync();
}

export async function pedirPermisoNotificaciones() {
  await prepararCanal();
  return requestPermissionsAsync();
}

export function programarRecordatorio(libro: Libro, fechaDevolucion: number): Promise<string> {
  return scheduleNotificationAsync({
    content: {
      title: 'Biblioteca IPF',
      body: `Recordá devolver "${libro.titulo}" antes del ${formatearFecha(fechaDevolucion)}.`,
      data: { isbn: libro.isbn },
    },
    trigger: {
      type: SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds: SEGUNDOS_RECORDATORIO,
      channelId: CANAL_PRESTAMOS,
    },
  });
}

export function cancelarRecordatorio(notificacionId: string): Promise<void> {
  return cancelScheduledNotificationAsync(notificacionId);
}
