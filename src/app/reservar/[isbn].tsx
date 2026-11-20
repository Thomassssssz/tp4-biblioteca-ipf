import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Boton } from '@/components/Boton';
import { MensajePantalla } from '@/components/MensajePantalla';
import { colores, espaciado, radios, tipografia } from '@/constants/tema';
import { DIAS_PRESTAMO } from '@/constants/biblioteca';
import { useApp } from '@/context/AppContext';
import { formatearFecha } from '@/lib/fechas';
import { esIsbnValido } from '@/lib/isbn';
import { valorParametro } from '@/lib/parametros';
import type { ResultadoReserva } from '@/types';

//dismissTo cierra el modal y cambia a la tab: atras no vuelve a la confirmacion
function irAMisReservas() {
  router.dismissTo('/reservas');
}

function volverAlCatalogo() {
  router.dismissTo('/');
}

function cancelar() {
  router.back();
}

function describirResultado(resultado: ResultadoReserva): string {
  switch (resultado.tipo) {
    case 'prestamo':
      return `Préstamo registrado. Devolvelo antes del ${formatearFecha(resultado.fechaDevolucion)}.`;
    case 'espera':
      return `Te anotamos en la lista de espera. Estás en el puesto ${resultado.posicion}.`;
    case 'duplicada':
      return 'Ya tenías este libro reservado.';
    case 'inexistente':
      return 'No encontramos este libro en el catálogo.';
  }
}

export default function Reservar() {
  const { isbn: parametro } = useLocalSearchParams<{ isbn: string }>();
  const isbn = valorParametro(parametro);
  const { obtenerLibro, anticipar, reservar } = useApp();
  //guarda el resultado para mostrarlo mientras el modal se cierra
  const [resultado, setResultado] = useState<ResultadoReserva | null>(null);

  const libro = esIsbnValido(isbn) ? obtenerLibro(isbn) : undefined;

  if (!libro) {
    return (
      <MensajePantalla
        icono="search-outline"
        titulo="Libro no encontrado"
        mensaje="No podemos reservar un libro que no está en el catálogo.">
        <Boton titulo="Volver al Catálogo" onPress={volverAlCatalogo} />
      </MensajePantalla>
    );
  }

  if (resultado) {
    return (
      <MensajePantalla
        icono="checkmark-circle-outline"
        titulo="¡Listo!"
        mensaje={describirResultado(resultado)}
      />
    );
  }

  const anticipo = anticipar(libro.isbn);

  if (anticipo.tipo === 'duplicada') {
    return (
      <MensajePantalla
        icono="bookmark-outline"
        titulo="Ya lo reservaste"
        mensaje={`"${libro.titulo}" ya está en tus préstamos o en tu lista de espera.`}>
        <Boton titulo="Ver mis reservas" onPress={irAMisReservas} />
      </MensajePantalla>
    );
  }

  const esPrestamo = anticipo.tipo === 'prestamo';

  function confirmar() {
    if (!libro) {
      return;
    }
    setResultado(reservar(libro.isbn));
    irAMisReservas();
  }

  return (
    <View style={styles.pantalla}>
      <View style={styles.contenido}>
        <Text style={styles.titulo} accessibilityRole="header">
          {libro.titulo}
        </Text>
        <Text style={styles.autor}>{libro.autor}</Text>

        <View style={[styles.resumen, esPrestamo ? styles.resumenPrestamo : styles.resumenEspera]}>
          <Text style={[styles.tituloResumen, esPrestamo ? styles.textoPrestamo : styles.textoEspera]}>
            {esPrestamo ? 'Hay ejemplares disponibles' : 'No hay ejemplares disponibles'}
          </Text>
          <Text style={styles.detalleResumen}>
            {anticipo.tipo === 'espera'
              ? `Vas a entrar a la lista de espera en el puesto ${anticipo.posicion}. Te avisamos cuando te lo entreguen.`
              : `Te lo llevás en préstamo por ${DIAS_PRESTAMO} días.`}
          </Text>
        </View>
      </View>

      <View style={styles.acciones}>
        <Boton
          titulo={esPrestamo ? 'Confirmar préstamo' : 'Anotarme en la lista'}
          onPress={confirmar}
        />
        <Boton titulo="Cancelar" onPress={cancelar} variante="secundario" />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  pantalla: {
    flex: 1,
    padding: espaciado.xl,
    justifyContent: 'space-between',
    backgroundColor: colores.fondo,
  },
  contenido: {
    gap: espaciado.sm,
  },
  titulo: {
    fontSize: tipografia.titulo,
    fontWeight: '800',
    color: colores.primario,
  },
  autor: {
    fontSize: tipografia.mediana,
    color: colores.textoSecundario,
  },
  resumen: {
    marginTop: espaciado.lg,
    padding: espaciado.lg,
    borderRadius: radios.medio,
    gap: espaciado.xs,
  },
  resumenPrestamo: {
    backgroundColor: colores.primarioClaro,
  },
  resumenEspera: {
    backgroundColor: colores.avisoFondo,
  },
  tituloResumen: {
    fontSize: tipografia.mediana,
    fontWeight: '700',
  },
  textoPrestamo: {
    color: colores.primario,
  },
  textoEspera: {
    color: colores.aviso,
  },
  detalleResumen: {
    fontSize: tipografia.normal,
    color: colores.texto,
  },
  acciones: {
    gap: espaciado.sm,
    paddingBottom: espaciado.lg,
  },
});
