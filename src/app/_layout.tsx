import { Stack } from 'expo-router';

import { colores } from '@/constants/tema';

export default function RootLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: colores.primario },
        headerTintColor: colores.textoInvertido,
        contentStyle: { backgroundColor: colores.fondo },
      }}
    />
  );
}
