import { Stack } from 'expo-router';

import { colores } from '@/constants/tema';

export default function CatalogoLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: colores.primario },
        headerTintColor: colores.textoInvertido,
        contentStyle: { backgroundColor: colores.fondo },
      }}>
      <Stack.Screen name="index" options={{ title: 'Catálogo' }} />
    </Stack>
  );
}
