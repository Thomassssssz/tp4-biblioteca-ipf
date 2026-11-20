# Evidencias de funcionamiento

Capturas pedidas en la consigna (F2, punto 4). Se toman desde un teléfono real con **Expo Go** y se guardan en esta carpeta con el **nombre exacto** de la tabla.

**Estado actual: todavía no hay capturas cargadas.** No se agregan imágenes de ejemplo ni archivos vacíos: cada captura tiene que salir de la app funcionando.

## Antes de empezar

1. Ejecutar `npx expo start` y abrir la app en Expo Go.
2. Para empezar sin permisos concedidos: Ajustes del teléfono → Expo Go → desactivar Cámara y Notificaciones. En iOS, el estado "preguntable" solo se ve con un permiso que nunca se preguntó; ver la nota 10.
3. Las pantallas que duran poco (como "Catálogo cargando" o "Escáner cargando") se capturan más fácil con una grabación de pantalla y una foto tomada del video.

## Lista de evidencias

| # | Archivo | Qué tiene que verse | Cómo obtenerla | Estado |
|---|---|---|---|---|
| 1 | `01-catalogo-cargando.png` | Indicador y "Cargando el catálogo…" | Recargar la app (sacudir el teléfono → Reload) y capturar en el primer segundo | Pendiente |
| 2 | `02-catalogo-error.png` | "Algo salió mal" y el botón **Reintentar** | `obtenerLibros()` falla aproximadamente 1 de cada 5 veces: recargar hasta que aparezca | Pendiente |
| 3 | `03-catalogo-datos.png` | Lista de libros, accesos "Buscar" y "Escanear libro", y "Vistos recientemente" | Abrir dos o tres libros y volver al Catálogo | Pendiente |
| 4 | `04-buscador.png` | `/buscar` con texto y resultados | Catálogo → Buscar → escribir `borges` | Pendiente |
| 5 | `05-detalle-inexistente.png` | "ISBN no válido" o "Libro no encontrado" | Abrir `exp://IP:8081/--/libro/123` o `exp://IP:8081/--/libro/9781234567897` | Pendiente |
| 6 | `06-reserva-con-ejemplares.png` | Confirmación "Hay ejemplares disponibles · préstamo por 7 días" | *Ficciones* → Reservar | Pendiente |
| 7 | `07-reserva-sin-ejemplares.png` | Confirmación "No hay ejemplares disponibles" con el puesto en la lista | *El Aleph* → Reservar (puesto 3) | Pendiente |
| 8 | `08-escaner-cargando.png` | Indicador sobre el recuadro negro de la cámara | Abrir `/escanear` y grabar la pantalla: dura un instante | Pendiente |
| 9 | `09-escaner-concedido.png` | Vista de la cámara con la indicación del código de barras | Escanear libro → Continuar → Permitir | Pendiente |
| 10 | `10-escaner-preguntable.png` | Pantalla previa con **Continuar**, o el panel "Activar cámara" en `/escanear` | Con el permiso sin preguntar (iOS: reinstalar Expo Go) o, en Android, después de una sola negativa | Pendiente |
| 11 | `11-escaner-bloqueado.png` | **Abrir Ajustes** y el ingreso manual del ISBN | Desactivar la cámara de Expo Go en Ajustes y abrir Escanear libro | Pendiente |
| 12 | `12-notificacion-recibida.png` | Notificación "Biblioteca IPF · Recordá devolver…" | Reservar un libro → activar **Recordarme** → esperar 15 s con el teléfono bloqueado | Pendiente |
| 13 | `13-mostrador-antes.png` | Mostrador con *El Aleph* y la persona al frente | Login `biblioteca` / `ipf2026` → Mostrador | Pendiente |
| 14 | `14-mostrador-despues.png` | La confirmación "Entregaste…" y el nuevo frente de la cola | Tocar **Entregar al siguiente** en *El Aleph* | Pendiente |
| 15 | `15-pantalla-404.png` | "404 · Página no encontrada" con la dirección solicitada | Abrir `exp://IP:8081/--/no/existe` | Pendiente |

Cuando una captura esté cargada, cambiar su estado a **Cargada**.

## Alternativa: video

La consigna acepta "capturas (o un video corto)". Si se graba un video, guardarlo como `recorrido.mp4` (o subirlo y dejar el enlace acá) y anotar en qué minuto aparece cada una de las 15 situaciones.
