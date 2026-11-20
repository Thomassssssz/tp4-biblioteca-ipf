import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router/js-tabs';

import { colores } from '@/constants/tema';

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colores.primario,
        tabBarInactiveTintColor: colores.textoSecundario,
        tabBarStyle: { backgroundColor: colores.superficie },
      }}>
      <Tabs.Screen
        name="(catalogo)"
        options={{
          title: 'Catálogo',
          tabBarIcon: ({ focused, size }) => (
            <Ionicons
              name={focused ? 'library' : 'library-outline'}
              color={focused ? colores.primario : colores.textoSecundario}
              size={size}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="reservas"
        options={{
          title: 'Mis reservas',
          headerShown: true,
          headerStyle: { backgroundColor: colores.primario },
          headerTintColor: colores.textoInvertido,
          sceneStyle: { backgroundColor: colores.fondo },
          tabBarIcon: ({ focused, size }) => (
            <Ionicons
              name={focused ? 'bookmarks' : 'bookmarks-outline'}
              color={focused ? colores.primario : colores.textoSecundario}
              size={size}
            />
          ),
        }}
      />
    </Tabs>
  );
}
