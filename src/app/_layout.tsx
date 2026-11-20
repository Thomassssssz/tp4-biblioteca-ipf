import { NavegacionRaiz } from '@/components/NavegacionRaiz';
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
      <NavegacionRaiz />
    </AppProvider>
  );
}
