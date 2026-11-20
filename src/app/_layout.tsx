import { Stack } from 'expo-router';

import { colores } from '@/constants/tema';
import { AppProvider } from '@/context/AppContext';
import { configurarPresentacion } from '@/lib/notificaciones';

//con anchor, un deep link a una pantalla del stack raiz deja las tabs debajo
export const unstable_settings = {
  anchor: '(tabs)',
};

//solo define como se muestran las notificaciones con la app abierta; no pide permisos
configurarPresentacion();

export default function RootLayout() {
  return (
    <AppProvider>
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: colores.primario },
          headerTintColor: colores.textoInvertido,
          contentStyle: { backgroundColor: colores.fondo },
        }}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="buscar" options={{ title: 'Buscar' }} />
        <Stack.Screen name="escanear" options={{ title: 'Escanear libro' }} />
        <Stack.Screen
          name="permisos/[recurso]"
          options={{ presentation: 'modal', title: 'Permiso' }}
        />
        <Stack.Screen
          name="reservar/[isbn]"
          options={{ presentation: 'modal', title: 'Confirmar reserva' }}
        />
      </Stack>
    </AppProvider>
  );
}
