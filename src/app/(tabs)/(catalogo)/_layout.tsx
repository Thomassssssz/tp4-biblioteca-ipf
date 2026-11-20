import { Stack } from 'expo-router';

import { BotonPersonal } from '@/components/BotonPersonal';
import { colores } from '@/constants/tema';

//si se entra por deep link a un detalle, el catalogo queda debajo para poder volver
export const unstable_settings = {
  anchor: 'index',
};

export default function CatalogoLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: colores.primario },
        headerTintColor: colores.textoInvertido,
        contentStyle: { backgroundColor: colores.fondo },
      }}>
      <Stack.Screen
        name="index"
        options={{ title: 'Catálogo', headerRight: () => <BotonPersonal /> }}
      />
      <Stack.Screen name="libro/[isbn]" options={{ title: 'Detalle del libro' }} />
    </Stack>
  );
}
