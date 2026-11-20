import { FlatList, StyleSheet } from 'react-native';

import { SeparadorLista } from '@/components/SeparadorLista';
import { TarjetaEspera } from '@/components/TarjetaEspera';
import { TarjetaPrestamo } from '@/components/TarjetaPrestamo';
import { TextoVacio } from '@/components/TextoVacio';
import { TituloSeccion } from '@/components/TituloSeccion';
import { espaciado } from '@/constants/tema';
import { useApp } from '@/context/AppContext';
import { construirFilasReservas, type FilaReservas } from '@/lib/filasReservas';

function obtenerClave(fila: FilaReservas) {
  return fila.clave;
}

export default function MisReservas() {
  const { prestamos, reservasEnEspera, obtenerLibro, personasEnEspera, devolver } = useApp();
  const filas = construirFilasReservas(prestamos, reservasEnEspera, obtenerLibro, personasEnEspera);

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
