import { Stack } from 'expo-router';

import { colores } from '@/constants/tema';
import { AppProvider } from '@/context/AppContext';

//con anchor, un deep link a una pantalla del stack raiz deja las tabs debajo
export const unstable_settings = {
  anchor: '(tabs)',
};

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
      </Stack>
    </AppProvider>
  );
}
