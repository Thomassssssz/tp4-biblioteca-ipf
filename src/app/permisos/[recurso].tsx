import { router, useLocalSearchParams } from 'expo-router';

import { Boton } from '@/components/Boton';
import { MensajePantalla } from '@/components/MensajePantalla';
import { PantallaPreviaPermiso } from '@/components/PantallaPreviaPermiso';
import { useApp } from '@/context/AppContext';
import { valorParametro } from '@/lib/parametros';
import { esRecursoPermiso } from '@/lib/permisos';

//dismissTo vuelve al escaner si ya estaba abierto debajo; si no, reemplaza este modal por el escaner
function irAlEscaner() {
  router.dismissTo('/escanear');
}

function volverAlCatalogo() {
  router.dismissTo('/');
}

export default function PantallaPermiso() {
  const { recurso: parametroRecurso, isbn: parametroIsbn } = useLocalSearchParams<{
    recurso: string;
    isbn?: string;
  }>();
  const recurso = valorParametro(parametroRecurso);
  const isbn = valorParametro(parametroIsbn);
  const { activarRecordatorio, avisar, obtenerLibro } = useApp();

  if (!esRecursoPermiso(recurso)) {
    return (
      <MensajePantalla
        icono="help-circle-outline"
        titulo="Permiso desconocido"
        mensaje="Esta pantalla no corresponde a ningún permiso de la app.">
        <Boton titulo="Volver al Catálogo" onPress={volverAlCatalogo} />
      </MensajePantalla>
    );
  }

  if (recurso === 'camara') {
    return (
      <PantallaPreviaPermiso
        recurso="camara"
        onConcedido={irAlEscaner}
        alternativa={{ texto: 'Ingresar ISBN manualmente', onPress: irAlEscaner }}
      />
    );
  }

  const titulo = obtenerLibro(isbn)?.titulo;

  function activar() {
    if (titulo) {
      activarRecordatorio(isbn);
    }
    router.back();
  }

  function alNegar() {
    if (titulo) {
      avisar(
        `El recordatorio de "${titulo}" no se activó porque las notificaciones están desactivadas. Revisá la fecha de devolución en esta pantalla.`,
      );
    }
    router.back();
  }

  return (
    <PantallaPreviaPermiso
      recurso="notificaciones"
      onConcedido={activar}
      onNegado={alNegar}
    />
  );
}
