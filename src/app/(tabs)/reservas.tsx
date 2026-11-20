import { router } from 'expo-router';
import { FlatList, StyleSheet } from 'react-native';

import { EncabezadoReservas } from '@/components/EncabezadoReservas';
import { SeparadorLista } from '@/components/SeparadorLista';
import { TarjetaEspera } from '@/components/TarjetaEspera';
import { TarjetaPrestamo } from '@/components/TarjetaPrestamo';
import { TextoVacio } from '@/components/TextoVacio';
import { TituloSeccion } from '@/components/TituloSeccion';
import { espaciado } from '@/constants/tema';
import { useApp } from '@/context/AppContext';
import { usePermiso } from '@/hooks/usePermiso';
import { construirFilasReservas, type FilaReservas } from '@/lib/filasReservas';

function obtenerClave(fila: FilaReservas) {
  return fila.clave;
}

export default function MisReservas() {
  const {
    prestamos,
    reservasEnEspera,
    avisos,
    obtenerLibro,
    personasEnEspera,
    devolver,
    activarRecordatorio,
    desactivarRecordatorio,
    marcarLeido,
  } = useApp();
  //solo consulta el permiso para mostrar el cartel; nunca abre el dialogo del sistema
  const { estado: permisoNotificaciones, abrirAjustes } = usePermiso('notificaciones');
  const filas = construirFilasReservas(prestamos, reservasEnEspera, obtenerLibro, personasEnEspera);

  function cambiarRecordatorio(isbn: string, activo: boolean) {
    if (!activo) {
      desactivarRecordatorio(isbn);
      return;
    }
    if (permisoNotificaciones === 'concedido') {
      activarRecordatorio(isbn);
      return;
    }
    //el permiso se pide recien aca, despues de la pantalla previa
    router.push({ pathname: '/permisos/[recurso]', params: { recurso: 'notificaciones', isbn } });
  }

  function renderFila({ item }: { item: FilaReservas }) {
    switch (item.tipo) {
      case 'titulo':
        return <TituloSeccion texto={item.texto} />;
      case 'vacio':
        return <TextoVacio texto={item.texto} />;
      case 'prestamo':
        return (
          <TarjetaPrestamo
            libro={item.libro}
            prestamo={item.prestamo}
            onDevolver={() => devolver(item.prestamo.isbn)}
            onCambiarRecordatorio={(activo) => cambiarRecordatorio(item.prestamo.isbn, activo)}
          />
        );
      case 'espera':
        return <TarjetaEspera libro={item.libro} posicion={item.reserva.posicion} total={item.total} />;
    }
  }

  return (
    <FlatList
      data={filas}
      keyExtractor={obtenerClave}
      renderItem={renderFila}
      ListHeaderComponent={
        <EncabezadoReservas
          avisos={avisos}
          notificacionesBloqueadas={permisoNotificaciones === 'bloqueado'}
          onAbrirAjustes={abrirAjustes}
          onMarcarLeido={marcarLeido}
        />
      }
      ItemSeparatorComponent={SeparadorLista}
      contentContainerStyle={styles.lista}
    />
  );
}

const styles = StyleSheet.create({
  lista: {
    padding: espaciado.lg,
    paddingBottom: espaciado.xxl,
  },
});
