import { Stack } from 'expo-router';

import { colores } from '../constants/tema';
import { useApp } from '../context/AppContext';

//vive dentro del provider para que el stack pueda leer la sesion
export function NavegacionRaiz() {
  const { sesion } = useApp();

  return (
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
      {/*cuando guard pasa a false la ruta deja de existir y sale sola del historial*/}
      <Stack.Protected guard={!sesion}>
        <Stack.Screen name="login" options={{ presentation: 'modal', title: 'Personal' }} />
      </Stack.Protected>
    </Stack>
  );
}
