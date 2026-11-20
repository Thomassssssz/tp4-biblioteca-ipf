import { Redirect } from 'expo-router';

//url de la version anterior de la app: Redirect hace replace, no deja esta ruta en el historial
export default function ReservaAntigua() {
  return <Redirect href="/reservas" />;
}
