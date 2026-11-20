import { Stack } from 'expo-router';

import { colores } from '@/constants/tema';
import { AppProvider } from '@/context/AppContext';

export default function RootLayout() {
  return (
    <AppProvider>
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: colores.primario },
          headerTintColor: colores.textoInvertido,
          contentStyle: { backgroundColor: colores.fondo },
        }}
      />
    </AppProvider>
  );
}
