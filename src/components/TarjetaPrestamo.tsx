import { StyleSheet, Switch, Text, View } from 'react-native';

import { colores, espaciado, radios, TAMANIO_TACTIL_MINIMO, tipografia } from '../constants/tema';
import { formatearFecha } from '../lib/fechas';
import type { Libro, Prestamo } from '../types';
import { Boton } from './Boton';

type TarjetaPrestamoProps = {
  libro: Libro;
  prestamo: Prestamo;
  onDevolver: () => void;
  //sin manejador el interruptor queda deshabilitado
  onCambiarRecordatorio?: (activo: boolean) => void;
};

export function TarjetaPrestamo({ libro, prestamo, onDevolver, onCambiarRecordatorio }: TarjetaPrestamoProps) {
  const estado =
    prestamo.origen === 'mostrador' ? 'Entregado en el mostrador' : 'Retirado del estante';

  return (
    <View style={styles.tarjeta}>
      <Text style={styles.titulo}>{libro.titulo}</Text>
      <Text style={styles.autor}>{libro.autor}</Text>
      <Text style={styles.estado}>{estado}</Text>
      <Text style={styles.fecha}>Devolver antes del {formatearFecha(prestamo.fechaDevolucion)}</Text>

      <View style={styles.recordatorio}>
        <Text style={styles.textoRecordatorio}>Recordarme</Text>
        <Switch
          value={prestamo.notificacionId !== null}
          onValueChange={onCambiarRecordatorio}
          disabled={!onCambiarRecordatorio}
          accessibilityLabel={`Recordarme la devolución de ${libro.titulo}`}
          trackColor={{ true: colores.primario, false: colores.borde }}
        />
      </View>

      <Boton titulo="Devolver" onPress={onDevolver} variante="secundario" />
    </View>
  );
}

const styles = StyleSheet.create({
  tarjeta: {
    backgroundColor: colores.superficie,
    borderRadius: radios.medio,
    borderWidth: 1,
    borderColor: colores.borde,
    padding: espaciado.lg,
    gap: espaciado.xs,
  },
  titulo: {
    fontSize: tipografia.mediana,
    fontWeight: '700',
    color: colores.texto,
  },
  autor: {
    fontSize: tipografia.chica,
    color: colores.textoSecundario,
  },
  estado: {
    fontSize: tipografia.chica,
    color: colores.exito,
    fontWeight: '600',
  },
  fecha: {
    fontSize: tipografia.normal,
    color: colores.texto,
    marginTop: espaciado.xs,
  },
  recordatorio: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: TAMANIO_TACTIL_MINIMO,
    marginVertical: espaciado.xs,
  },
  textoRecordatorio: {
    fontSize: tipografia.normal,
    color: colores.texto,
  },
});
