# Respuestas — TP N° 4 "Biblioteca IPF"

Respuestas a las Partes B a E de la consigna, sobre el código de este repositorio. Las rutas y las líneas citadas corresponden a la versión de este commit.

En cada respuesta distingo tres cosas:

- **Comprobado en código o con pruebas:** lo leí en nuestro código o en el de Expo Router y lo verifiqué con scripts en Node, usando React real.
- **Deducido del código:** sale de leer el código de la app y del router, pero todavía no lo vi en un teléfono.
- **Pendiente en dispositivo:** lo que la consigna pide observar en el teléfono y todavía no está registrado (ver `docs/evidencias/`).

---

## Parte B · Estado, efectos y renderizado

### B1. El ciclo de vida de `useLibros`

El hook está en `src/hooks/useLibros.ts`. Tiene cuatro estados (líneas 16 a 19):

```ts
const [libros, setLibros] = useState<Libro[]>([]);
const [cargando, setCargando] = useState(true);
const [error, setError] = useState<string | null>(null);
const [intento, setIntento] = useState(0);
```

El efecto (líneas 21 a 46) depende de `[intento]`. La pantalla `src/app/(tabs)/(catalogo)/index.tsx` decide qué mostrar en las líneas 23 a 29: si `cargando`, `EstadoCargando`; si hay `error`, `EstadoError`; si no, el `FlatList`.

#### a) Render por render

**Carga exitosa:**

| Render | Qué lo provoca | `libros` | `cargando` | `error` | Qué se ve |
|---|---|---|---|---|---|
| 1 | Montaje del Catálogo | `[]` | `true` | `null` | "Cargando el catálogo…" |
| — | Después del render 1 corre el efecto: llama a `cargar()`, que hace `await obtenerLibros()`. No hay render nuevo hasta que responde (800 ms) | | | | |
| 2 | Llega la respuesta: `setLibros(datos)` (línea 29) y, en el `finally`, `setCargando(false)` (línea 37). Las dos actualizaciones ocurren en la misma continuación del `await`, así que React las agrupa en **un solo render** | 17 libros | `false` | `null` | La lista |

Son **2 renders**. Lo comprobé con un script que cuenta renders: entre la respuesta y la lista hay exactamente un render.

**`obtenerLibros()` falla y la persona toca "Reintentar":**

| Render | Qué lo provoca | `libros` | `cargando` | `error` | Qué se ve |
|---|---|---|---|---|---|
| 1 | Montaje | `[]` | `true` | `null` | Cargando |
| 2 | La promesa se rechaza: `setError(MENSAJE_ERROR)` (línea 33) y `setCargando(false)` en el `finally`, agrupados | `[]` | `false` | mensaje | "Algo salió mal" y "Reintentar" |
| 3 | Toque en "Reintentar": `reintentar()` (líneas 48 a 52) hace `setError(null)`, `setCargando(true)` y `setIntento(1)`. Son tres actualizaciones en el mismo evento, así que es un render | `[]` | `true` | `null` | Cargando |
| — | Como `intento` cambió, React ejecuta la **limpieza** del efecto anterior (`activo = false`) y vuelve a ejecutar el efecto: pedido nuevo | | | | |
| 4 | Llega la respuesta (o falla otra vez, porque es al azar) | 17 libros | `false` | `null` | La lista |

#### b) ¿Se desmonta el Catálogo al cambiar de pestaña o al abrir un detalle?

**Deducido del código:** no se desmonta en ninguno de los dos casos.
- **Cambiar a "Mis reservas":** las Tabs (`expo-router/js-tabs`) mantienen montadas las pestañas que no están activas.
- **Abrir un detalle:** `libro/[isbn]` se apila **encima** de `index` en el Stack de Catálogo (`src/app/(tabs)/(catalogo)/_layout.tsx`), y el Catálogo queda montado debajo.

**Pendiente en dispositivo:** la consigna pide comprobarlo con un `console.log` temporal en la limpieza. Esa prueba todavía no está hecha en el teléfono. Para hacerla, se agrega `console.log('limpieza useLibros')` dentro del `return () => { … }` de la línea 43 y se lo saca antes de entregar.

En nuestra app, la limpieza se ejecuta en estas situaciones reales:
1. **Al tocar "Reintentar"**, antes del efecto nuevo. Si el pedido anterior todavía no respondió, su respuesta se descarta. Una prueba con dos reintentos seguidos y respuestas desordenadas mostró que gana la última.
2. **Cuando se desmonta todo el navegador de pestañas** que contiene ese Catálogo. Por ejemplo, cuando se sale de una instancia extra de `(tabs)` que creó una navegación desde el Stack raíz (ver C1 y C3).
3. **Al cerrar la app.**

#### c) ¿Por qué no se puede pasar una función `async` directamente a `useEffect`?

Una función `async` **siempre devuelve una promesa**. `useEffect` espera que la función devuelva una limpieza o nada. Si devuelve una promesa, React no la puede usar como limpieza (avisa con una advertencia) y la limpieza real nunca se ejecuta.

Lo resolví definiendo una función `async` **adentro** del efecto, llamándola, y devolviendo la limpieza de forma sincrónica (líneas 25 a 45):

```ts
useEffect(() => {
  let activo = true;
  async function cargar() { /* await obtenerLibros() … */ }
  cargar();
  return () => {
    activo = false;
  };
}, [intento]);
```

#### d) ¿Cómo implementé `reintentar`?

Con un contador en el estado (`intento`), que es la dependencia del efecto. `reintentar` (líneas 48 a 52) hace `setIntento((anterior) => anterior + 1)`. El valor cambia, React compara el array de dependencias, ve que `intento` cambió y vuelve a ejecutar el efecto, después de ejecutar la limpieza del anterior.

Elegí un número que crece porque **cada toque produce un valor distinto**:
- Con un booleano que alterna (`true`/`false`), dos toques seguidos podrían volver al valor anterior, y React no detectaría el cambio.
- Usar `libros` o `error` como dependencia crearía un ciclo: el efecto los modifica, eso cambia la dependencia y el efecto se vuelve a disparar.

`setCargando(true)` y `setError(null)` van en `reintentar` y no dentro del efecto, porque la regla `react-hooks` v7 de `eslint-config-expo` marca el `setState` sincrónico dentro de un efecto: provoca un render extra.

---

### B2. La condición de carrera del buscador

El buscador está en `src/app/buscar.tsx`. Lee `q` de la URL en la línea 26 y le pasa el texto a `useBusqueda` (`src/hooks/useBusqueda.ts`) en la línea 28.

| Momento | Qué pasa | Sin limpieza: qué se ve | Con nuestro código: qué se ve |
|---|---|---|---|
| t = 0 ms | Escribe "bor" y se pide `buscarLibros("bor")` (1400 ms) | La lista anterior (o vacía) | "Buscando libros…": la clave `0:bor` no tiene respuesta |
| t = 200 ms | Escribe "borges" y se pide `buscarLibros("borges")` (300 ms) | Lo mismo: todavía no llegó nada | "Buscando libros…". Antes del efecto de "borges" se ejecutó la limpieza del de "bor" (`vigente = false`) |
| t = 500 ms | Llega la respuesta de "borges" | Los resultados de "borges" | Los resultados de "borges": coincide la clave `0:borges` |
| t = 1400 ms | Llega la respuesta de "bor" | **Los resultados de "bor" pisan a los de "borges"**, con el campo diciendo "borges" | Siguen los de "borges". La respuesta de "bor" encuentra `vigente === false` y no ejecuta `setRespuesta`: **0 renders** |

Lo comprobé con un script que controla a mano cuándo responde cada búsqueda. Una versión sin limpieza, escrita solo para la prueba, terminó mostrando los resultados de "bor" con el texto "borges". La nuestra mostró solo los de "borges" y la respuesta vieja no provocó ningún render.

> **Ojo con nuestros datos:** en el catálogo, "bor" y "borges" devuelven **los mismos dos libros** (*Ficciones* y *El Aleph*, porque los dos son de Borges). En la pantalla la diferencia no se vería aunque el error exista. Para mostrarlo en la defensa conviene buscar **"co"** (5 resultados) y enseguida **"cortázar"** (2: *Rayuela* y *Bestiario*).

#### a) Qué hace exactamente la limpieza y cuándo se ejecuta

```ts
useEffect(() => {
  if (!hayTexto) return;
  let vigente = true;
  async function buscar() {
    const libros = await buscarLibros(texto);
    if (vigente) setRespuesta({ clave, libros, fallo: false });
  }
  buscar();
  return () => {
    vigente = false;
  };
}, [texto, clave, hayTexto]);
```
(`src/hooks/useBusqueda.ts`, líneas 28 a 52)

- Cada ejecución del efecto crea **su propia** variable `vigente`. La limpieza solo apaga la de esa ejecución.
- La limpieza se ejecuta:
  - **antes** de la ejecución siguiente, cuando cambia `texto` o la clave (al reintentar);
  - **al desmontar** la pantalla.
- La respuesta vieja llega igual, porque la promesa no se cancela, pero ya no toca ningún estado: ni los resultados, ni "buscando", ni el error.

Hay una segunda protección. La respuesta se guarda junto con la clave del pedido (`${intento}:${texto}`, línea 26), y el estado que se muestra se **calcula** (líneas 58 a 72). Si la clave guardada no es la vigente, se muestra "buscando", nunca datos de otra búsqueda.

#### b) La propuesta del compañero: `if (texto === q) setResultados(datos)`

**No funciona.** La función del `.then()` es una **clausura**: guarda las variables del render en el que se creó.
- Cuando se buscó "bor", tanto `texto` como `q` valían "bor" en ese render.
- Cuando llega la respuesta, la función sigue viendo **ese** `q` ("bor"), no el actual ("borges").
- La comparación da `true` siempre, también para la respuesta vieja, y la pisa igual.

La clausura no "ve" los valores nuevos: cada render tiene sus propias constantes. Por eso la solución tiene que avisarle a la función vieja **desde afuera** que ya no es la vigente. Eso es lo que hace la limpieza al cambiar `vigente`.

#### c) La URL y el botón atrás mientras se escribe

`actualizarBusqueda` (`buscar.tsx`, líneas 21 a 23) llama a `router.setParams({ q: texto })`:
- La URL cambia con cada letra (`/buscar?q=b`, `?q=bo`, …), pero **es la misma pantalla**: no se agrega nada a la pila.
- "Atrás" sale del buscador de una vez.

Con `router.push`, cada letra apilaría una pantalla `/buscar` nueva:
- Escribir "borges" serían 6 pantallas, y "atrás" desharía la búsqueda letra por letra.
- Cada pantalla tendría su propio efecto y su propio pedido, todos montados al mismo tiempo.

---

### B3. Mutar o reemplazar

#### a) Toca "Anotarme" tres veces: ¿qué muestra el texto?

Sigue mostrando **"Personas en espera: 0"**.
- `espera.encolar('Ana')` modifica **la misma** instancia de `Cola` que está en el estado, pero no llama a ningún `setState`.
- React no sabe que algo cambió y no vuelve a renderizar. El texto quedó calculado en el último render, cuando `tamanio` era 0.
- La referencia guardada en `useState` sigue siendo el mismo objeto, así que aunque se comparara, `Object.is` diría "no cambió".

#### b) Escribe en un `TextInput` controlado y el número salta a 3

Escribir en el campo controlado sí ejecuta un `setState`, y la pantalla se vuelve a renderizar. En ese render se vuelve a leer `espera.tamanio`, y como la Cola se mutó tres veces, ahora vale 3.

El número no cambió cuando debía (al anotarse), sino cuando **otro estado sin relación** provocó un render.

Un error que aparece "a veces" es peor que uno que aparece siempre:
- **Depende de cosas ajenas:** si en ese momento hubo otro render o no.
- **Es difícil de reproducir:** la persona que prueba ve el número correcto si justo escribió algo.
- **Pasa las pruebas rápidas:** puede llegar a producción.
- **Confunde el diagnóstico:** parece un problema del `TextInput` cuando en realidad es la mutación.

Además, con el React Compiler activado (`app.json`, `"reactCompiler": true`), que memoriza suponiendo que el estado no se muta, este comportamiento es todavía menos predecible.

#### c) Cómo lo resolví en el Context, comparado con otras alternativas

Elegí **copiar y reemplazar**. Una Cola o Pila que está en el estado **nunca se muta**: cada operación crea una estructura nueva a partir de la anterior, modifica la copia y la guarda con `setEstado`.

```ts
// src/lib/biblioteca.ts, líneas 140 a 145 (reservarLibro, rama de lista de espera)
const cola = new Cola(obtenerPersonasEnEspera(estado, isbn));
cola.encolar(USUARIO_ACTUAL);
return {
  estado: { ...estado, esperas: { ...estado.esperas, [isbn]: cola } },
  resultado: { tipo: 'espera', posicion: cola.tamanio },
};
```

- Lo mismo pasa en `entregarAlSiguiente` (líneas 164 a 170) y en `registrarVisto` con la Pila (líneas 177 a 179).
- El Context aplica el resultado con `setEstado((anterior) => reservarLibro(anterior, isbn, ahora).estado)` (`src/context/AppContext.tsx`, líneas 209 a 213).
- Si no hay nada que cambiar (por ejemplo, el libro ya está en el tope de la Pila), la función devuelve **el mismo** estado (`biblioteca.ts`, líneas 174 a 176) y React no vuelve a renderizar.
- Las pantallas nunca reciben una Cola: reciben arrays de `aArray()`, que son copias.

| Alternativa | Ventaja | Costo |
|---|---|---|
| **Copiar y reemplazar (la nuestra)** | Las funciones son puras y se prueban sin React; funciona con el modo estricto y con el React Compiler; cada estado viejo queda intacto | Copiar la cola es O(n) por operación. Con listas de 1 a 3 personas no se nota |
| **Contador de versión** (mutar la Cola y hacer `setVersion(v + 1)`) | No copia nada | Hay que acordarse de subir la versión en **cada** mutación. El objeto que React cree igual en realidad cambió, así que el Compiler o un `useMemo` pueden devolver datos viejos. Una función que se ejecuta dos veces (modo estricto) muta dos veces |
| **`useReducer`** | Concentra las transiciones en un lugar y deja un registro claro de las acciones | Adentro del reducer hay que copiar igual (el mismo costo), y un reducer no puede devolver un resultado a quien despacha. Nosotros necesitamos devolver la posición en la cola o la persona entregada. Por eso usamos funciones puras que devuelven `{ estado, resultado }` |

---

### B4. ¿Dónde vive cada dato?

| Dato | Dónde vive en nuestra app | Por qué ahí y no en otro lugar |
|---|---|---|
| Texto del buscador | **URL**: parámetro `q` de `/buscar` (`buscar.tsx`, líneas 22 y 26) | Se puede compartir y abrir con un deep link (`bibliotecaipf://buscar?q=borges`), y una sola fuente de verdad alimenta el campo y la búsqueda. No va en el Context porque solo lo usa esta pantalla, ni en estado local porque se perdería al compartir la URL |
| Préstamos y reservas | **Context**: `estado.prestamos`. Las reservas en espera **se calculan** desde las colas con `listarReservasEnEspera` | Los usan el detalle (`yaReservado`), la confirmación, Mis reservas y el mostrador. En estado local de una pantalla, las demás no se enterarían |
| Listas de espera | **Context**: `estado.esperas`, una `Cola` por ISBN (`biblioteca.ts`, línea 20) | Las comparten el alumno (que se anota) y el mostrador (que entrega). Tienen que ser la misma estructura |
| Vistos recientemente | **Context**: `estado.recientes`, una `Pila` | La escribe el detalle y la lee el Catálogo, que son pantallas distintas del mismo Stack |
| Sesión del personal | **Context**: `useState` propio (`AppContext.tsx`, línea 89) | La leen `NavegacionRaiz` (para `Stack.Protected`), `BotonPersonal` y el mostrador. No va en la URL porque no se tiene que poder compartir ni falsificar con un enlace |
| Ejemplares disponibles de un libro | **Se calcula**: `calcularDisponibles` (`biblioteca.ts`, líneas 39 a 48), a partir de `ejemplares` (datos) menos los préstamos del estante (Context) | Si se guardara, habría dos datos para mantener sincronizados (ver E4d) |
| Estado del permiso de cámara | **Sistema operativo.** `usePermiso` guarda una copia momentánea en el estado de `useCameraPermissions` | La verdad la tiene el sistema: la persona puede cambiarla en Ajustes sin pasar por la app. Por eso se vuelve a consultar con `AppState` (`usePermiso.ts`, líneas 47 a 51). En el Context quedaría desactualizado |
| Identificador de la notificación programada | **Context**: `prestamo.notificacionId`. La notificación en sí la tiene **el sistema operativo** | Está asociado a un préstamo concreto, y lo necesitan "Recordarme" y "Devolver" para cancelarla |

#### Cuando cambia el `value` del Context, ¿qué se vuelve a renderizar?

**Todos** los componentes que llaman a `useApp()`: el Catálogo, el detalle, Mis reservas, el buscador, el escáner, la confirmación, el mostrador, `BotonPersonal` y `NavegacionRaiz`.
- El `value` se arma con `useMemo` y depende de `[acciones, avisarEntrega, estado, sesion]` (`AppContext.tsx`, líneas 193 a 225).
- Cualquier cambio de `estado` crea un objeto nuevo, y React no distingue qué parte usa cada consumidor.

**¿El Catálogo se re-renderiza al activar un recordatorio en otra pestaña?** **Sí** (deducido del código). Activar guarda `notificacionId` en `estado`, el `value` cambia, y el Catálogo, que sigue montado en su pestaña, se vuelve a renderizar aunque solo use `recientes` y `disponibles`.

**¿Cómo evitarlo, y vale la pena?**
- Se podría separar el Context en varios (por ejemplo, uno para las acciones estables, otro para préstamos y otro para recientes), usar selectores, o envolver partes con `memo`.
- **En esta app no vale la pena:** son 17 libros en un `FlatList` que solo dibuja lo visible. El costo de mantener varios Contexts es mayor que el render que nos ahorraríamos.
- Lo correcto sería medirlo primero con el Profiler de React DevTools y optimizar solo si aparece un problema real.

---

## Parte C · Navegación y rutas

### C1. La pila en tu app

Hay tres navegadores:
- **Stack raíz:** `src/components/NavegacionRaiz.tsx`, renderizado por `src/app/_layout.tsx`.
- **Tabs:** `src/app/(tabs)/_layout.tsx`.
- **Stack de Catálogo:** `src/app/(tabs)/(catalogo)/_layout.tsx`.

**Deducido del código; pendiente de verificar en dispositivo.**

| # | Acción | Pilas resultantes (de base a tope) |
|---|---|---|
| 1 | Abre la app | **Stack raíz:** `[(tabs)]` · **Tabs:** Catálogo activa · **Stack de Catálogo:** `[index]` |
| 2 | Toca un libro del Catálogo | **Stack raíz:** `[(tabs)]` · **Stack de Catálogo:** `[index, libro/9789500700016]` |
| 3 | Toca "Reservar" | **Stack raíz:** `[(tabs), reservar/9789500700016 (modal)]` · **Stack de Catálogo:** `[index, libro/…]` (sigue igual debajo) |
| 4 | Toca "Confirmar" | **Stack raíz:** `[(tabs)]`, porque el modal salió · **Tabs:** Mis reservas activa · **Stack de Catálogo:** `[index, libro/…]` (se conserva) |
| 5 | Toca atrás (Android) | **Stack raíz:** `[(tabs)]` · **Tabs:** vuelve a Catálogo, porque el `backBehavior` por defecto es `'firstRoute'` (`expo-router/build/react-navigation/routers/TabRouter.js`, línea 240) · **Stack de Catálogo:** `[index, libro/…]`, así que se ve el **detalle** |
| 6 | Toca la tab "Catálogo" | **Stack de Catálogo:** `[index]`. La pestaña ya estaba enfocada, así que el Stack vuelve al inicio (ver b) |

#### a) Qué método usé en el paso 4 y por qué

`router.dismissTo('/reservas')` (`src/app/reservar/[isbn].tsx`, líneas 16 a 18, llamado desde `confirmar()` en la línea 91). Genera un `POP_TO` en el Stack raíz: como `(tabs)` ya está debajo, recorta la pila hasta ahí, saca el modal y, adentro de las Tabs, cambia a "Mis reservas".

- **`push('/reservas')`:** desde el Stack raíz agregaría otra instancia de `(tabs)` **encima** del modal: `[(tabs), reservar, (tabs)']`. "Atrás" volvería a la confirmación, que es justo lo que pide evitar la consigna.
- **`replace('/reservas')`:** cambiaría el modal por una **segunda** instancia de las tabs: `[(tabs), (tabs)']`. "Atrás" no vuelve a la confirmación, pero quedan dos barras de pestañas, y el Catálogo de la primera (con su detalle) queda escondido debajo.
- **`dismissTo`:** cierra el modal y reutiliza las tabs que ya existen. No duplica nada y "atrás" no puede volver a la confirmación porque ya no está en la pila. Por eso lo elegí.

Mientras el modal se cierra, la pantalla muestra "¡Listo!" con el resultado (líneas 61 a 69). Esa es la confirmación que pide la consigna.

#### b) En el paso 6, ¿qué ve la persona?

Depende de si la pestaña Catálogo ya estaba enfocada:
- **Si ya estaba enfocada** (después del paso 5, con el detalle a la vista): ve el **Catálogo**. Expo Router escucha `tabPress` y, si el Stack de esa pestaña está enfocado y tiene más de una pantalla, hace `popToTop` (`expo-router/build/standard-navigation/subscribePopToTopOnParentTabPress.js`, líneas 14 a 22).
- **Si venía de otra pestaña** (por ejemplo, desde Mis reservas): ve el **detalle**. El Stack de Catálogo conservó `[index, libro]` y tocar la pestaña solo la activa.

Me parece correcto para esta app porque copia el comportamiento nativo de iOS y Android. Al volver a una pestaña, la persona encuentra el libro que estaba mirando; y tocar otra vez la pestaña activa sirve como atajo para volver al inicio del Catálogo.

---

### C2. El escáner que dispara de más

El escáner está en `src/app/escanear.tsx` y su protección en `src/hooks/useEscaner.ts`.

#### a) ¿Qué pasaría con `router.push` sin protección?

`onBarcodeScanned` se ejecuta muchas veces por segundo mientras el código sigue frente a la cámara. Cada llamada haría un `router.push`, y esas acciones de navegación entran a la **cola de acciones** del router (TP 2), que las procesa en orden, una por una.

Resultado: `[…, escanear, libro, libro, libro, …]`, varias copias del mismo detalle apiladas. Para volver al Catálogo, la persona tendría que tocar "atrás" varias veces.

#### b) ¿`useState` o `useRef`?

**`useRef`** (`useEscaner.ts`, líneas 16 y 17):

```ts
const navegandoRef = useRef(false);
// …
if (navegandoRef.current || !esIsbnValido(isbn)) return;
if (existeLibro(isbn)) {
  navegandoRef.current = true;
  abrirLibro(isbn);
  return;
}
```
(líneas 23 a 29)

Un `useState` puesto en `true` en el primer escaneo no alcanza:
- `setNavegando(true)` no cambia la variable al instante: **pide** un render nuevo.
- Las llamadas de la cámara que llegan antes de ese render ejecutan la función creada en el render anterior. Esa función, por clausura, sigue viendo `navegando === false`, así que todas navegan.
- Un ref es un objeto mutable que no depende de los renders: `navegandoRef.current = true` vale **en ese mismo instante** para cualquier llamada siguiente.

**Comprobado con pruebas:**
- 50 lecturas seguidas del mismo ISBN, sin render entre medio, produjeron **una sola** navegación.
- Una versión de prueba con `useState` produjo **5 navegaciones con 5 lecturas**.

#### c) ¿Por qué `replace` para ir del escáner al detalle?

`abrirLibro` usa `router.replace` (`escanear.tsx`, líneas 16 a 18). Así el escáner sale de la pila y "atrás" desde el detalle no vuelve a la cámara.

Con `push`, al tocar "atrás" la persona volvería al escáner con la cámara abierta. Además, en nuestra implementación ese escáner quedaría "muerto": `navegandoRef` sigue en `true` mientras la pantalla esté montada, así que ignoraría cualquier código nuevo. Con `replace`, cada vez que se entra al escáner es una pantalla nueva, con el ref en `false`.

**Deducido del código del router:** como el detalle vive dentro de `(tabs)`, el `replace` desde `escanear` (Stack raíz) cambia esa entrada por una instancia de las tabs con el detalle adentro. Pendiente de ver en el dispositivo cuántos "atrás" hacen falta para llegar al Catálogo original.

#### d) Si el ISBN leído no está en el catálogo

La app muestra un aviso ámbar: "El código … no está en el catálogo. Probá con otro libro." (`escanear.tsx`, líneas 80 a 84). **Sigue escaneando**: el escáner no se bloquea por un código inexistente.

Para que el mismo aviso no aparezca diez veces seguidas, uso otro ref que recuerda el último código avisado (`useEscaner.ts`, líneas 31 a 35):

```ts
if (ultimoAvisadoRef.current === isbn) return;
ultimoAvisadoRef.current = isbn;
setAviso(`El código ${isbn} no está en el catálogo. Probá con otro libro.`);
```

Si aparece otro código, se procesa normalmente: un aviso nuevo, o la navegación si el libro existe. **Comprobado con pruebas:** 30 lecturas del mismo código inexistente produjeron un solo aviso; un segundo código cambió el aviso.

---

### C3. Deep links y rutas protegidas

En Expo Go se prueban como `exp://IP:8081/--/RUTA`. En una build propia, como `bibliotecaipf://RUTA`.

**Comprobado con pruebas:** con las funciones del router (`getRoutes` y `getStateFromPath` de Expo Router) aplicadas a los archivos reales de `src/app`, verifiqué **a qué pantalla resuelve** cada enlace. Lo que queda debajo en la pila y el efecto de `Stack.Protected` ocurren en tiempo de ejecución: eso está **deducido del código** y **pendiente en dispositivo**.

| Link | Qué ve la persona | Qué queda debajo en la pila | Qué parte del código lo decide |
|---|---|---|---|
| `bibliotecaipf://libro/9789500700016` | Detalle de *Ficciones*, con su título en el header | Stack de Catálogo: `[index, libro]`, por `anchor: 'index'`. Stack raíz: `[(tabs)]` | `(catalogo)/_layout.tsx`, líneas 7 a 9 (anchor); `libro/[isbn].tsx`, líneas 28, 29 y 67 |
| `bibliotecaipf://libro/123` | "ISBN no válido" y "Volver al Catálogo", con el header "Detalle del libro" | Igual que el anterior: el Catálogo debajo | `libro/[isbn].tsx`, líneas 28 y 37 a 49; `src/lib/isbn.ts`, líneas 1 a 5 |
| `bibliotecaipf://buscar?q=borges` | Buscador con "borges" escrito, *Ficciones* y *El Aleph* | Stack raíz: `[(tabs), buscar]`, por el anchor | `src/app/_layout.tsx`, líneas 6 a 8 (anchor); `buscar.tsx`, líneas 26 a 28 |
| `bibliotecaipf://mostrador` (sin sesión) | El Catálogo | Stack raíz: `[(tabs)]`; `mostrador` no existe | `NavegacionRaiz.tsx`, líneas 34 a 36 (`Stack.Protected guard={!!sesion}`) |
| `bibliotecaipf://reserva` | Mis reservas | `reserva` se reemplaza (no queda). Deducido: como el anchor deja un `(tabs)` debajo y el `replace` crea otra, la pila quedaría `[(tabs), (tabs) con Mis reservas]` | `src/app/reserva.tsx`, línea 5 (`<Redirect href="/reservas" />`) |
| `bibliotecaipf://escanear` (cámara bloqueada) | El escáner con el panel "La cámara está bloqueada…" y "Abrir Ajustes", y debajo el ingreso manual del ISBN, que funciona | Stack raíz: `[(tabs), escanear]` | `escanear.tsx`, líneas 65 a 71 y 86; `usePermiso.ts`, línea 71; `src/lib/permisos.ts`, línea 22 |

Cómo funciona cada pieza:
- **Anchor:** `unstable_settings = { anchor: '(tabs)' }` (`_layout.tsx`, líneas 6 a 8). Al entrar por un enlace a una pantalla del Stack raíz, el router arma la pila con las tabs debajo, así que "atrás" vuelve a la app en lugar de cerrarla.
- **`Stack.Protected`:** cuando `guard` es `false`, las pantallas de adentro quedan excluidas. Si alguna estaba abierta o se intenta abrir, el router redirige al anchor. Lo vi en `expo-router/build/layouts/withLayoutContext.js`, líneas 70 a 77.
- **`Redirect`:** usa `useFocusEffect` y llama a `router.replace(href)` (`expo-router/build/link/Redirect.js`, líneas 18 a 21). La URL vieja no queda en el historial.

#### ¿Por qué `/libro/123` llega al detalle aunque no exista? ¿De quién es la responsabilidad?

El router solo compara la **forma** de la URL con los archivos. `libro/[isbn].tsx` es un segmento dinámico: acepta **cualquier** texto como `isbn`, sea "123", "abc" o un ISBN real. El router no conoce el catálogo ni sabe qué es un ISBN válido.

La responsabilidad es de **la pantalla de detalle**, que es la que conoce las reglas:
- valida el formato con `esIsbnValido` (línea 28);
- busca el libro con `obtenerLibro` (línea 29);
- si algo falla, muestra un mensaje claro con salida al Catálogo.

`+not-found.tsx` es para otra cosa: URLs que no coinciden con **ningún** archivo, como `/libros/123`.

---

### C4. Foco, montaje y primer plano

#### a) Qué detecta cada herramienta

| Herramienta | Qué evento detecta |
|---|---|
| `useEffect` con `[]` | El **montaje** del componente (y la limpieza al desmontarlo). Se ejecuta una vez por montaje |
| `useFocusEffect` | Que la pantalla **gana el foco dentro del navegador** (y la limpieza al perderlo): volver a una pestaña, cerrar una pantalla que estaba encima |
| `AppState` | Que **la app entera** cambia de estado en el sistema operativo: `active`, `background` o `inactive` |

#### b) ¿Cuál se entera en cada caso?

- **Sale a Ajustes, habilita las notificaciones y vuelve:** se entera **`AppState`** (la app pasa de `background` a `active`). `useEffect` con `[]` no, porque la pantalla nunca se desmontó. `useFocusEffect` tampoco: para el navegador, la pantalla nunca perdió el foco.
- **Va a la pestaña Catálogo y vuelve a "Mis reservas":** se entera **`useFocusEffect`**, porque la pestaña recuperó el foco. `AppState` no, porque la app siguió activa. `useEffect` con `[]` tampoco, porque la pestaña sigue montada.

#### c) ¿Cuál usamos y por qué?

Usamos **`useEffect` para la primera consulta y `AppState` para volver a consultar**. No usamos `useFocusEffect`. Está todo en `src/hooks/usePermiso.ts`, líneas 42 a 53:

```ts
useEffect(() => {
  if (recurso === 'notificaciones') actualizar();          // al montar
  const suscripcion = AppState.addEventListener('change', (estadoApp) => {
    if (estadoApp === 'active') actualizar();              // al volver de Ajustes
  });
  return () => suscripcion.remove();
}, [recurso, actualizar]);
```

Elegí `AppState` porque el caso que importa para un permiso es justamente volver de Ajustes, y ese cambio solo lo ve `AppState`. Mis reservas (`src/app/(tabs)/reservas.tsx`, línea 32) usa este hook para mostrar el cartel de "bloqueado".

**Un caso en el que nuestra pantalla muestra un estado viejo** (deducido del código, no probado en dispositivo):
- Mis reservas y la pantalla previa `/permisos/notificaciones` usan **instancias distintas** de `usePermiso`.
- Si la persona concede el permiso desde la pantalla previa y el sistema **no** hace pasar la app por `background` al mostrar el diálogo, la instancia de Mis reservas sigue con el valor anterior (`preguntable`).
- No se corrige al volver, porque no usamos `useFocusEffect`.
- La consecuencia es menor: si después activa "Recordarme" en otro préstamo, vuelve a pasar por la pantalla previa, que consulta el permiso de nuevo, muestra "Continuar" sin abrir el diálogo, y activa el recordatorio.
- Sumar `useFocusEffect` en Mis reservas cerraría este hueco.

---

## Parte D · Permisos en tu app

### D1. Recorrido completo de la cámara

La pantalla previa es `src/app/permisos/[recurso].tsx` y renderiza `src/components/PantallaPreviaPermiso.tsx`. Los estados salen de `usePermiso('camara')` y `clasificarPermiso` (`src/lib/permisos.ts`, líneas 15 a 23).

**Android 14, app recién instalada.** Deducido del código y del comportamiento documentado de Android. **Pendiente en dispositivo:** todavía no lo recorrí en un Android.

| # | Acción | Qué muestra nuestra app | `status` | `canAskAgain` |
|---|---|---|---|---|
| 1 | Toca "Escanear" por primera vez | Pantalla previa (modal) con el beneficio, **Continuar** y el enlace "Ingresar ISBN manualmente". Antes, por un instante, un indicador de carga | `undetermined` | `true` |
| 2 | "Continuar" y "No permitir" | Sigue en la pantalla previa con **Continuar**, porque sigue preguntable. Para la cámara no se cierra al negar: `onNegado` no está definido (`[recurso].tsx`, líneas 39 a 47) | `denied` | `true` |
| 3 | Toca "Escanear" otra vez | Pantalla previa con **Continuar** | `denied` | `true` |
| 4 | "Continuar" y "No permitir" | Pasa a **bloqueado**: texto ámbar ("La cámara está bloqueada…") y el botón **Abrir Ajustes**. El enlace manual sigue | `denied` | `false` |
| 5 | Toca "Escanear" otra vez | Pantalla previa con **Abrir Ajustes** y el enlace manual. Tocar "Continuar" ya no tendría efecto, porque Android no muestra más el diálogo | `denied` | `false` |
| 6 | "Abrir Ajustes", habilita la cámara y vuelve | Al volver, `AppState` pasa a `active`, se vuelve a consultar y la pantalla pasa a **Continuar**. Al tocarlo **no** aparece el diálogo (ya está concedido) y se abre el escáner con la cámara | `granted` | `true` |

**Comprobado con pruebas:** simulando `useCameraPermissions` y `AppState`, el hook recorrió `cargando → preguntable → preguntable → bloqueado → concedido`. Montar no pidió el permiso, y en segundo plano no se consultó.

#### a) ¿Y en iOS?

En iOS el diálogo se muestra **una sola vez**.
- **El cambio está en el paso 2:** después del primer "No permitir", `status` es `denied` y `canAskAgain` ya es `false`.
- Nuestra app pasa directo a **bloqueado** y muestra "Abrir Ajustes".
- Los pasos 3 a 5 muestran lo mismo.

Una prueba con la respuesta de iOS simulada dio `preguntable → bloqueado` con una sola negativa.

Para tener en cuenta en el paso 6 (pendiente de verificar): en iOS, cambiar un permiso de privacidad en Ajustes puede hacer que el sistema reinicie la app. En ese caso la app arranca de cero y el estado del Context se pierde, porque no tenemos persistencia.

#### b) La línea que decide entre "Continuar" y "Abrir Ajustes"

```ts
return respuesta.canAskAgain ? 'preguntable' : 'bloqueado';
```
(`src/lib/permisos.ts`, línea 22)

Y en la pantalla (`src/components/PantallaPreviaPermiso.tsx`, líneas 53 a 56):

```tsx
{(estado === 'preguntable' || estado === 'concedido') && <Boton titulo="Continuar" onPress={continuar} />}
{estado === 'bloqueado' && <Boton titulo="Abrir Ajustes" onPress={abrirAjustes} />}
```

Usa el campo **`canAskAgain`**. Mirar solo `status` no alcanza: en los pasos 2, 3, 4 y 5 `status` vale `denied`, pero en 2 y 3 todavía se puede preguntar y en 4 y 5 no.
- Con solo `status`, mostraríamos "Continuar" con el permiso bloqueado, y el botón no haría nada (el sistema no muestra el diálogo).
- O mostraríamos "Abrir Ajustes" cuando todavía se podía preguntar.

#### c) En el paso 6, ¿qué parte del código se entera?

El listener de `AppState` de `src/hooks/usePermiso.ts`, líneas 47 a 51. Cuando la app vuelve a `active`, llama a `actualizar()` (líneas 31 a 40), que en la cámara ejecuta `consultarCamara()`, la función de `useCameraPermissions` que hace `getCameraPermissionsAsync`.

Si esa parte no existiera, la app seguiría mostrando **"Abrir Ajustes"** aunque el permiso ya esté concedido. La persona tendría que cerrar y volver a abrir la pantalla (o la app) para que se vuelva a consultar. Parecería que habilitar la cámara en Ajustes "no funcionó".

---

### D2. Notificaciones y consistencia

La programación está en `src/lib/notificaciones.ts` y las acciones en `src/context/AppContext.tsx`.

#### a) Activa "Recordarme" y antes de 15 segundos toca "Devolver": ¿qué pasaría sin cancelar?

La notificación quedaría programada en el **sistema operativo**, que no sabe nada de nuestros préstamos. A los 15 segundos llegaría "Recordá devolver *Ficciones*…" de un libro que la persona **ya devolvió**. La app parecería rota y la persona dejaría de confiar en los recordatorios.

Por eso `devolver` cancela primero (`AppContext.tsx`, líneas 129 a 133):

```ts
devolver: (isbn) => {
  nuevaVersion(isbn);
  cancelarPendiente(isbn);   // cancelScheduledNotificationAsync(prestamo.notificacionId)
  setEstado((anterior) => devolverLibro(anterior, isbn));
},
```

También cubrimos un caso más fino: tocar "Devolver" **mientras** la notificación se está programando, cuando todavía no hay un id para cancelar. Cada préstamo tiene una versión (`versionesRef`, línea 93). `activarRecordatorio` compara la versión al terminar y, si cambió, cancela su propia notificación (líneas 140 a 147).

**Comprobado con pruebas:** la cancelación al desactivar, al devolver, al devolver **durante** la programación, y al activar y desactivar varias veces seguidas. En todos los casos quedó como máximo una notificación viva.

#### b) ¿Dónde se guarda el identificador? ¿Qué pasa si la app se cierra antes de que llegue?

En el Context: `prestamo.notificacionId`, que se asigna con `asignarNotificacion` (`biblioteca.ts`, líneas 182 a 193; en el Context, línea 148). El interruptor no tiene estado propio: está encendido si `notificacionId !== null` (`src/components/TarjetaPrestamo.tsx`, línea 30).

Si la app se cierra antes de los 15 segundos:
- **La notificación llega igual**, porque la programó el sistema operativo y no depende de que la app siga abierta.
- **El identificador se pierde**, porque el Context vive en memoria y no hay persistencia. Al abrir la app de nuevo, el estado arranca vacío: no hay préstamos ni `notificacionId`.

**El problema:** quedan notificaciones "huérfanas". La app ya no puede cancelarlas (no conoce su id), ni mostrar el préstamo al que pertenecen. Si el préstamo se hubiera devuelto justo antes de cerrar… en ese caso sí se canceló. Pero cualquier notificación pendiente de un préstamo que la app "olvidó" va a llegar igual.

**Cómo lo resolvería:**
1. **Persistir** los préstamos con sus `notificacionId` en `@react-native-async-storage/async-storage`. Es el desafío opcional de la consigna, y no lo implementamos.
2. **Al iniciar, reconciliar con el sistema:** `getAllScheduledNotificationsAsync()` y cancelar las que no correspondan a un préstamo vigente. Nuestras notificaciones llevan `data: { isbn }` (`notificaciones.ts`, línea 56), justamente para poder identificarlas.

#### c) ¿Por qué en Android 13 o superior se crea el canal antes de pedir el permiso? ¿Qué cambia en Android 12?

Desde Android 13, mostrar notificaciones requiere el permiso en tiempo de ejecución `POST_NOTIFICATIONS`, y el sistema muestra ese diálogo **solo si la app ya tiene al menos un canal**. Si se pide el permiso sin un canal creado, el diálogo puede no aparecer.

Por eso `pedirPermisoNotificaciones` crea el canal `prestamos` antes de pedir (`notificaciones.ts`, líneas 46 a 49, que llaman a `prepararCanal` en las líneas 31 a 40). **Comprobado con pruebas:** en Android el orden registrado fue *canal → pedir*. En iOS se pide sin canal.

**En Android 12 o anterior** no existe el permiso en tiempo de ejecución: las notificaciones están permitidas desde la instalación. `requestPermissionsAsync` devuelve concedido **sin mostrar ningún diálogo**. El canal igual hace falta (existe desde Android 8): es el que define la importancia, el sonido y la vibración, y lo que la persona puede apagar desde los ajustes del sistema.

#### d) Permiso denegado y el mostrador te entrega un libro

Te enterás por un **aviso interno** en Mis reservas: "Te entregaron '…' en el mostrador. Ya figura en tus préstamos.", con "Marcar como leído". El código que decide está en `AppContext.tsx`, líneas 173 a 191:

```ts
const avisarEntrega = useCallback(async (isbn: string) => {
  const libro = buscarLibroPorIsbn(isbn);
  if (!libro) return;
  const avisoInterno = `Te entregaron "${libro.titulo}" en el mostrador. Ya figura en tus préstamos.`;
  try {
    if (await notificacionesPermitidas()) {
      await notificarEntrega(libro);
      return;
    }
  } catch {
    //si la notificacion falla se usa el aviso interno
  }
  acciones.avisar(avisoInterno);
}, [acciones]);
```

Lo llama `entregarSiguiente` cuando la persona entregada es `'Vos'` (líneas 218 a 220). `notificacionesPermitidas` consulta `getPermissionsAsync()` **en ese momento** (`notificaciones.ts`, líneas 66 a 69). No usa un valor guardado.

Importa porque el permiso puede cambiar desde Ajustes en cualquier momento, sin que la app se entere. Un valor guardado podría decir "concedido" cuando ya no lo está: la notificación no aparecería y tampoco el aviso interno, y la persona no se enteraría de la entrega. Consultando en el momento, siempre se elige el canal que realmente funciona. Además, si la notificación falla con el permiso concedido, también se usa el aviso.

**Comprobado con pruebas:** con permiso, 1 notificación inmediata por el canal `prestamos` y ningún aviso. Sin permiso, ninguna notificación y el aviso interno. Si el envío falla, el aviso interno.

---

### D3. Lo que tu app pide y lo que no

Lo saqué de `npx expo config --type introspect` y de los `AndroidManifest.xml` de cada librería en `node_modules`.

| Plataforma | Permiso o clave declarada | Función de la app que lo justifica | ¿Quién lo agrega? |
|---|---|---|---|
| Android | `android.permission.CAMERA` | Leer el código EAN-13 en `/escanear` | El plugin y el manifiesto de `expo-camera` |
| Android | `android.permission.POST_NOTIFICATIONS` | Recordatorio de devolución y aviso de entrega (Android 13+) | El manifiesto de `expo-notifications` |
| Android | `android.permission.RECEIVE_BOOT_COMPLETED` | Que las notificaciones programadas sobrevivan a un reinicio del teléfono | El manifiesto de `expo-notifications` |
| Android | `android.permission.VIBRATE` | Vibración al llegar una notificación | Expo, por defecto |
| Android | `android.permission.INTERNET` | Comunicación con Metro en desarrollo (React Native) | Expo, por defecto |
| Android | `RECORD_AUDIO`, `READ_EXTERNAL_STORAGE`, `WRITE_EXTERNAL_STORAGE`, `SYSTEM_ALERT_WINDOW` → **quitados** (`tools:node="remove"`) | Ninguna: la app no graba audio, no usa archivos y no se dibuja sobre otras apps | `android.blockedPermissions` en `app.json` |
| iOS | `NSCameraUsageDescription` = "Usamos tu cámara para leer el código ISBN de los libros y encontrarlos en el catálogo." | Diálogo de permiso de la cámara | El plugin `expo-camera`, con `cameraPermission` |
| iOS | *(sin `NSMicrophoneUsageDescription`)* | — | `microphonePermission: false` |
| iOS | Permiso de notificaciones (sin clave en Info.plist) | Recordatorios y avisos de entrega | Se pide en tiempo de ejecución con `requestPermissionsAsync`. `enableRemoteNotifications: false` evita el entitlement de push |

#### a) ¿Por qué no declaramos `RECORD_AUDIO` aunque usamos `expo-camera`?

`expo-camera` también graba video con sonido, y su plugin agrega `RECORD_AUDIO` **por defecto**. Nosotros solo leemos códigos de barras, así que por mínimo privilegio lo desactivamos en el plugin, y además lo bloqueamos por si alguna otra dependencia lo agregara:

```json
"android": {
  "blockedPermissions": [
    "android.permission.RECORD_AUDIO",
    "android.permission.READ_EXTERNAL_STORAGE",
    "android.permission.WRITE_EXTERNAL_STORAGE",
    "android.permission.SYSTEM_ALERT_WINDOW"
  ]
},
"plugins": [
  ["expo-camera", {
    "cameraPermission": "Usamos tu cámara para leer el código ISBN de los libros y encontrarlos en el catálogo.",
    "microphonePermission": false,
    "recordAudioAndroid": false
  }]
]
```

El introspect lo confirma: `RECORD_AUDIO` aparece solo con `[remove]`. En iOS, `microphonePermission: false` hace que no exista `NSMicrophoneUsageDescription`.

#### b) Elegir una foto de portada desde la galería

- **Paquete:** `expo-image-picker`, instalado con `npx expo install expo-image-picker`, usando `launchImageLibraryAsync`.
- **Permiso:** en las versiones actuales, elegir **una** imagen con el selector del sistema (PHPicker en iOS 14+, Photo Picker en Android 13+) no requiere el permiso de leer toda la galería: el sistema solo le entrega a la app la foto elegida. Si se quisiera leer la galería entera haría falta `NSPhotoLibraryUsageDescription` y el permiso de lectura de medios. En ese caso habría que revisar nuestro `blockedPermissions`, que hoy bloquea `READ_EXTERNAL_STORAGE`, y redactar el texto de propósito siguiendo el molde. Esto lo digo por la documentación de los sistemas, no lo probé.
- **¿Alcanza con una actualización OTA?** **No, hace falta una build nueva.**
  - Una actualización OTA (EAS Update) solo reemplaza el **JavaScript** y los recursos.
  - `expo-image-picker` trae **código nativo** que no está en el binario que la gente tiene instalado, y su plugin modifica `Info.plist` y `AndroidManifest.xml`, que también son parte del binario.
  - Si se mandara solo el JS, la app llamaría a un módulo nativo que no existe y fallaría.
  - En Expo Go funcionaría, pero solo porque Expo Go ya trae ese módulo.

#### c) ¿Qué no pudimos verificar del todo en Expo Go?

- **El texto de propósito de la cámara:** en Expo Go el diálogo muestra el texto **de Expo Go**, no el nuestro, porque el permiso es de la app Expo Go.
- **`blockedPermissions`, `microphonePermission` y `recordAudioAndroid`:** se aplican al compilar nuestra app. Expo Go tiene su propio manifiesto con todos sus permisos.
- **El canal "prestamos" en Android:** se crea, pero aparece dentro de los ajustes de notificaciones de **Expo Go**, no de "Biblioteca IPF".
- **`enableRemoteNotifications: false`** y el ícono y color de la notificación.

Cómo lo verificaría:
- Con un **development build** (`npx expo run:android` o `npx expo run:ios`, o `eas build --profile development`), que instala una app propia con nuestro `app.json`: ahí se vería nuestro diálogo y nuestro canal.
- Revisando el resultado de `npx expo prebuild`: `android/app/src/main/AndroidManifest.xml` e `ios/<app>/Info.plist`.

Lo que sí verificamos sin teléfono es la configuración resultante, con `npx expo config --type introspect`.

---

## Parte E · Buenas prácticas y decisiones de diseño

### E1. Revisión de código

#### a) Problemas en el Catálogo del compañero

| # | Línea | Clasificación | Problema y por qué sucede | Corrección |
|---|---|---|---|---|
| 1 | 10 y 22 | Mala práctica | `useState<any[]>` y `{ libro: any }`: con `any`, TypeScript deja de controlar los datos (por ejemplo, un `libro.titlo` mal escrito compila) | Tipar con `Libro[]` y `{ libro: Libro }` de `src/types` |
| 2 | 11 y 13 a 16 | Mala práctica (y riesgo de rechazo en la tienda) | Pide cámara **y** notificaciones al abrir el Catálogo, sin contexto ni pantalla previa. La persona no sabe para qué son, tiende a negarlos, y la cámara ni siquiera se usa en esta pantalla | Pedir cada permiso en el momento en que se necesita, después de una pantalla previa (nuestro `/permisos/[recurso]`) |
| 3 | 13 a 16 | Advertencia | El efecto usa `pedirPermiso` pero el array de dependencias está vacío: `react-hooks/exhaustive-deps` lo marca | Sacar el pedido del efecto (punto 2). Si quedara, declarar las dependencias |
| 4 | 15 | Error de ejecución (advertencia de promesa no manejada) | `Notifications.requestPermissionsAsync()` devuelve una promesa que nadie espera ni captura, y el resultado se descarta. Además, en Android 13+ sin canal creado el diálogo puede no aparecer | Esperar el resultado, crear el canal antes y actuar según la respuesta (nuestro `pedirPermisoNotificaciones`) |
| 5 | 18 a 20 | Rendimiento (y error de lógica) | `useEffect` **sin** array de dependencias: se ejecuta después de **cada** render, y `setLibros` con un array nuevo provoca otro render y otro pedido (ver b) | `useEffect(…, [])` o, mejor, un hook como `useLibros` |
| 6 | 19 | Error de ejecución | No hay `catch`: `obtenerLibros()` falla 1 de cada 5 veces, y eso es un *unhandled promise rejection*. No hay estado de error ni forma de reintentar: la persona ve una pantalla vacía sin explicación | `try/catch`, estado `error` y botón "Reintentar" |
| 7 | 18 a 20 | Error de ejecución (advertencia) | No hay limpieza: si el Catálogo se desmonta antes de que responda, `setLibros` corre igual; y una respuesta vieja puede pisar a una nueva | Bandera `activo` en la limpieza, como en `useLibros.ts`, líneas 23 y 43 a 45 |
| 8 | 9 a 41 | Mala práctica | No hay estados de **cargando** ni **vacío**: durante 800 ms se ve una pantalla en blanco | `EstadoCargando`, `EstadoError` y `ListEmptyComponent` |
| 9 | 22 a 30 | Rendimiento (y mala práctica) | `Fila` está declarado **adentro** de `Catalogo`: en cada render es un componente **nuevo**, así que React desmonta y vuelve a montar todas las filas | Declararlo a nivel de módulo, en su propio archivo (nuestro `TarjetaLibro.tsx`) |
| 10 | 24 | Mala práctica | `router.push('/libro/' + libro.isbn)` arma la ruta concatenando texto: las rutas tipadas no la controlan | `href={{ pathname: '/libro/[isbn]', params: { isbn } }}` con `Link` |
| 11 | 24 | Mala práctica (accesibilidad) | `Pressable` sin `accessibilityRole="button"` ni etiqueta; con `padding: 12` y texto de 16 queda por debajo de los 44 px de alto mínimo | `accessibilityRole`, `accessibilityLabel` y `minHeight: TAMANIO_TACTIL_MINIMO` |
| 12 | 25 | Mala práctica | Estilos en línea con valores fijos (`'#333'`, `16`, `12`): se crea un objeto en cada render, y los colores no salen del tema | `StyleSheet.create` con `colores`, `tipografia` y `espaciado` de `src/constants/tema.ts` |
| 13 | 33 a 36 | Rendimiento | `ScrollView` + `map` renderiza **todos** los libros aunque no se vean | `FlatList`, que solo dibuja lo visible y recicla filas |
| 14 | 35 | Advertencia (y mala práctica) | `key={i}` usa el índice: si la lista cambia de orden o se filtra, React confunde las filas | `keyExtractor` con el ISBN |
| 15 | 37 a 39 | Mala práctica (accesibilidad) | Botón **solo con ícono** sin `accessibilityRole` ni `accessibilityLabel`: un lector de pantalla no puede anunciarlo | Agregar los dos, o un texto visible ("Escanear libro") |
| 16 | 37 | Mala práctica | Va directo a `/escanear` sin pasar por la pantalla previa del permiso | Ir a `/permisos/camara` primero |

#### b) El efecto de las líneas 18 a 20 sin array de dependencias: el primer minuto

1. **Render 1:** `libros = []`. Después del render corre el efecto y llama a `obtenerLibros()`.
2. **A los 800 ms:** si responde bien, `setLibros(copia)`. Como `obtenerLibros` devuelve **objetos nuevos** cada vez (`LIBROS.map((libro) => ({ ...libro }))`), el array es distinto del anterior, y React renderiza.
3. **Render 2:** como el efecto no tiene dependencias, **se ejecuta de nuevo** y pide otra vez. Otros 800 ms después, otra copia, otro render, otro pedido…
4. Esto se repite cada 800 ms **mientras las respuestas sean exitosas**. Cuando falla una (en promedio 1 de cada 5), no hay `setLibros`, no hay render y el ciclo **se corta**, con un *unhandled promise rejection* en la consola.
5. Pero cualquier otro render lo reinicia. En este mismo código, `useCameraPermissions` actualiza su estado cuando el permiso responde: eso es un render, otro efecto y otro pedido.

En el primer minuto la app hace ráfagas de pedidos cada 800 ms (en promedio unos 5 por ráfaga, hasta el primer error), vuelve a dibujar la lista sin parar, consume batería y red, y acumula advertencias. La persona ve la lista "parpadear" y no hay ningún indicador de qué pasa.

**¿Cambia algo si `obtenerLibros()` devolviera siempre el mismo array?** Sí. Con el mismo array:
- El segundo `setLibros(mismoArray)` compara con `Object.is`, ve que es igual y **no provoca render**.
- Sin render no se vuelve a ejecutar el efecto, y el ciclo se corta después del segundo pedido (React puede hacer como mucho un render extra antes de cortar).

El error de fondo sigue (el efecto sin dependencias está mal), pero queda oculto. Por eso la consigna dice que la API simulada devuelve "objetos nuevos como una API real": eso hace visible el problema.

#### c) La pantalla reescrita con nuestros hooks, componentes y constantes

Es la que usamos (`src/app/(tabs)/(catalogo)/index.tsx`), simplificada sin los accesos y la sección de recientes:

```tsx
import { FlatList, StyleSheet } from 'react-native';

import { AccesoRapido } from '@/components/AccesoRapido';
import { EstadoCargando } from '@/components/EstadoCargando';
import { EstadoError } from '@/components/EstadoError';
import { EstadoVacio } from '@/components/EstadoVacio';
import { SeparadorLista } from '@/components/SeparadorLista';
import { TarjetaLibro } from '@/components/TarjetaLibro';
import { espaciado } from '@/constants/tema';
import { useApp } from '@/context/AppContext';
import { useLibros } from '@/hooks/useLibros';
import type { Libro } from '@/types';

function obtenerClave(libro: Libro) {
  return libro.isbn;
}

export default function Catalogo() {
  const { libros, cargando, error, reintentar } = useLibros();
  const { disponibles } = useApp();

  if (cargando) {
    return <EstadoCargando mensaje="Cargando el catálogo…" />;
  }
  if (error) {
    return <EstadoError mensaje={error} onReintentar={reintentar} />;
  }

  return (
    <FlatList
      data={libros}
      keyExtractor={obtenerClave}
      renderItem={({ item }) => <TarjetaLibro libro={item} disponibles={disponibles(item.isbn)} />}
      ListHeaderComponent={
        <AccesoRapido
          href={{ pathname: '/permisos/[recurso]', params: { recurso: 'camara' } }}
          icono="barcode-outline"
          texto="Escanear libro"
        />
      }
      ListEmptyComponent={<EstadoVacio mensaje="Todavía no hay libros en el catálogo." />}
      ItemSeparatorComponent={SeparadorLista}
      contentContainerStyle={styles.lista}
    />
  );
}

const styles = StyleSheet.create({
  lista: {
    padding: espaciado.lg,
  },
});
```

Cómo resuelve cada problema:
- **Permisos:** no se pide ninguno; escanear pasa por la pantalla previa.
- **Pedido de datos:** `useLibros` tiene dependencias correctas, limpieza, `catch` y reintento.
- **Lista:** `FlatList` con key por ISBN, `TarjetaLibro` declarado afuera y accesible, y los tres estados de pantalla.
- **Estilos:** solo `StyleSheet` y el tema.

#### d) ¿Cuál provocaría el rechazo en una tienda y cuál haría que la desinstalen primero?

- **Rechazo en la tienda: pedir la cámara (y las notificaciones) al abrir, sin necesidad visible** (puntos 2 y 4). Las guías de revisión de Apple sobre privacidad piden solicitar un permiso cuando la función lo necesita, con un propósito claro. Un pedido de cámara en el Catálogo, donde no hay cámara, es justo lo que se observa en la revisión. Google Play también revisa que los permisos tengan relación con la función.
- **Desinstalación: el ciclo de pedidos sin dependencias** (punto 5) junto con los dos diálogos al abrir. En el primer uso aparecen dos diálogos del sistema sin explicación, y después la lista parpadea, gasta batería y datos, y cuando falla queda en blanco sin mensaje. La primera impresión es "esta app no anda", y eso se resuelve desinstalando.

---

### E2. Organización y acoplamiento

#### a) Qué carpetas importan a cuáles

```
app ──► components ──► hooks ──► lib ──► estructuras
 │         │   │        │         │ ├──► data ──► types
 │         │   └──► context ──────┘ ├──► constants ──► types
 │         └──► lib (fechas)          └──► types
 └──► hooks, context, lib, constants, types
```

- **`app`** importa todo lo de abajo: componentes, hooks, context, lib, constants y types.
- **`components`** importa `constants` y `types`. Algunos componentes usan además `context` (`NavegacionRaiz`, `BotonPersonal`), `hooks` (`PantallaPreviaPermiso` usa `usePermiso`) o `lib` (`TarjetaPrestamo` usa `formatearFecha`).
- **`hooks`** importa `lib` y `types` (por ejemplo, `useLibros` → `lib/api`, `usePermiso` → `lib/permisos` y `lib/notificaciones`).
- **`context`** importa `lib`, `constants` y `types`.
- **`lib`** importa `estructuras`, `data`, `constants` y `types`.
- **`data`** y **`constants`** importan solo `types`.

**¿Hay alguna importación "hacia arriba"? No.** Lo comprobé buscando en `src/`:
- ningún archivo fuera de `src/app` importa desde `src/app`;
- `lib`, `estructuras`, `data`, `types` y `constants` no importan de `hooks`, `context` ni `components`;
- `hooks` no importa de `components` ni de `context`.

**Por qué sería un problema**, por ejemplo con un hook que importe de `src/app`:
- **Ciclos de dependencias:** la pantalla importa el hook y el hook importa la pantalla. Metro avisa de los *require cycles* y el orden de carga puede dejar valores `undefined`.
- **Expo Router trata cada archivo de `src/app` como ruta:** importar una pantalla desde un hook acopla la lógica a la navegación.
- **El hook deja de ser reutilizable:** depende de una pantalla concreta.
- **Romper la capa de abajo rompe la de arriba:** cualquier cambio en la pantalla puede romper la lógica que debería ser estable.

#### b) Si el catálogo pasara a venir de una API real, ¿qué archivos cambiarían?

Siendo honesto con nuestro diseño, **más de dos**:
1. **`src/lib/api.ts`**: `obtenerLibros` y `buscarLibros` harían `fetch` en lugar de leer `LIBROS`. `useLibros` y `useBusqueda` **no cambiarían**, porque ya manejan la carga, el error y la limpieza.
2. **`src/lib/biblioteca.ts`**: `buscarLibroPorIsbn`, `calcularDisponibles` y `listarColasConEspera` leen `LIBROS` **directamente** desde `src/data/libros.ts`, de forma sincrónica (líneas 2, 36 y 80). Con una API real, el catálogo tendría que llegar por parámetro o desde el estado.
3. **`src/context/AppContext.tsx`**: tendría que cargar y guardar el catálogo (con su estado de carga) para que `obtenerLibro` y `disponibles` lo usen. Además, las listas de espera iniciales (`ESPERAS_INICIALES`) también vendrían del servidor.
4. Posiblemente **el detalle y el escáner**, que hoy validan contra el catálogo en memoria al instante. Tendrían que contemplar un estado "cargando el libro".

**Qué dice eso del diseño:** la lógica de negocio está **acoplada a la fuente de datos**. Las reglas puras de `lib/biblioteca.ts` son buenas (se prueban sin React), pero importan el módulo de datos en lugar de recibir el catálogo. Un diseño más desacoplado tendría **una sola puerta de entrada al catálogo** (un repositorio, o el catálogo en el Context cargado por la API) y funciones que reciban los libros como parámetro. Así, cambiar a una API real tocaría `api.ts` y ese punto de entrada.

#### c) Reemplazar `usePermiso` y la pantalla previa por `<ConPermiso recurso="camara">…</ConPermiso>`

**Qué ganaría:**
- menos código repetido en cada pantalla;
- sería imposible "olvidarse" de manejar un estado, porque el componente decide qué mostrar;
- se leería de forma declarativa.

**Qué perdería:**
- **La pantalla previa como ruta.** Hoy `/permisos/[recurso]` es un modal que se abre por navegación y por deep link, y la consigna exige que esa URL exista. Un componente que envuelve no es una ruta.
- **Flexibilidad dentro de la pantalla.** Nuestro escáner muestra el ingreso manual **en los cuatro estados**, y la cámara solo en `concedido` (`escanear.tsx`, líneas 48 a 86). Un `ConPermiso` que reemplace a sus hijos mientras no hay permiso escondería también la alternativa sin cámara, que es justo lo que exige A3.9.
- **Separación entre consultar y pedir.** Un wrapper suele pedir el permiso al montarse. Nosotros consultamos al montar y pedimos solo con un toque explícito en "Continuar".

**¿Serviría para las notificaciones?** No. Las notificaciones se piden desde un **interruptor** de una tarjeta (`TarjetaPrestamo`), no al abrir una pantalla. Lo que se protege es una **acción** ("activar Recordarme"), no un contenido que se muestra. Por eso el hook es la abstracción correcta: `reservas.tsx` lo usa para consultar el estado y decidir si activa directamente o abre la pantalla previa (líneas 35 a 46), y `PantallaPreviaPermiso` lo usa para pedir. El mismo hook sirve para los dos recursos.

---

### E3. Mapa de fallas

| Situación | Qué ve la persona | Dónde se maneja (archivo y línea) |
|---|---|---|
| `obtenerLibros()` falla | Ícono de nube tachada, "Algo salió mal", "No pudimos cargar el catálogo. Revisá tu conexión e intentá de nuevo." y el botón **Reintentar** | `src/hooks/useLibros.ts`, líneas 31 a 34 (catch) y 48 a 52 (reintentar); `src/app/(tabs)/(catalogo)/index.tsx`, líneas 27 a 29; `src/components/EstadoError.tsx` |
| Se abre `/libro/abc` | "ISBN no válido", "'abc' no es un ISBN válido. Debe tener exactamente 13 números, sin letras ni guiones." y **Volver al Catálogo**; header "Detalle del libro" | `src/app/(tabs)/(catalogo)/libro/[isbn].tsx`, líneas 28 y 37 a 49; `src/lib/isbn.ts`, líneas 1 a 5 |
| Se escanea un ISBN que no está en el catálogo | Un aviso ámbar, una sola vez por código: "El código … no está en el catálogo. Probá con otro libro."; la cámara sigue leyendo | `src/hooks/useEscaner.ts`, líneas 31 a 35; `src/app/escanear.tsx`, líneas 80 a 84 |
| La cámara está bloqueada | En la pantalla previa: texto ámbar y **Abrir Ajustes**, más "Ingresar ISBN manualmente". En el escáner: panel con **Abrir Ajustes** y el ingreso manual, que funciona | `src/lib/permisos.ts`, línea 22; `src/components/PantallaPreviaPermiso.tsx`, líneas 48 y 56 a 57; `src/app/escanear.tsx`, líneas 65 a 71 y 86 |
| Las notificaciones están denegadas | "Recordarme" queda apagado y aparece un aviso interno en Mis reservas. Si están **bloqueadas**, además un cartel rojo con **Abrir Ajustes**. Las entregas del mostrador llegan como aviso interno | `src/app/permisos/[recurso].tsx`, líneas 58 a 65; `src/app/(tabs)/reservas.tsx`, líneas 40 a 45 y 76; `src/context/AppContext.tsx`, líneas 179 a 188 |
| Se intenta reservar un libro ya reservado | En el detalle, "Ya tenés este libro en Mis reservas." y **Ver mis reservas** en lugar de "Reservar". Si se llega igual a la confirmación (por ejemplo, por deep link): "Ya lo reservaste" con **Ver mis reservas**. El estado no cambia | `src/lib/biblioteca.ts`, líneas 115 a 117 y 129 a 132; `src/app/(tabs)/(catalogo)/libro/[isbn].tsx`, líneas 73 a 77; `src/app/reservar/[isbn].tsx`, líneas 73 a 82 |
| "Entregar al siguiente" con la lista de espera vacía | El libro **no aparece** en el mostrador (solo se listan las colas con gente). Si no queda ninguna: "No hay libros con personas esperando." Si igual se llamara, devuelve `undefined` sin cambiar nada y la confirmación dice "Nadie estaba esperando…" | `src/lib/biblioteca.ts`, líneas 78 a 88 y 160 a 163; `src/app/mostrador.tsx`, líneas 18 a 20 y 54 |
| Login con clave incorrecta | "Usuario o contraseña incorrectos. Revisalos e intentá de nuevo." Se borra la contraseña y se puede reintentar; la sesión sigue cerrada | `src/lib/sesion.ts`, líneas 10 a 12; `src/app/login.tsx`, líneas 10 a 13 y 33 a 39 |

En ninguna situación la respuesta es "nada" ni "la app se rompe". Las que dependen de permisos están pendientes de confirmar en el dispositivo (ver D1).

**Limitaciones que encontré al revisar** (no son caídas de la app, pero las dejo informadas):
- **Recordatorios huérfanos al reiniciar** (D2b): sin persistencia, una notificación programada puede llegar después de cerrar y abrir la app, cuando el préstamo ya no figura.
- **Permiso de notificaciones posiblemente desactualizado en Mis reservas** (C4c): sin `useFocusEffect`, si el permiso cambia sin que la app pase por segundo plano.
- **Instancias extra de las tabs** (C1a y C2c, deducido del código): `replace` y `Redirect` desde el Stack raíz hacia una ruta que vive dentro de `(tabs)` crean otra instancia de las pestañas.
- **Libros físicos de prueba:** los dos primeros registros de `src/data/libros.ts` todavía tienen ISBN y datos de reserva ("Libro físico 1 (reemplazar)") hasta que se carguen los libros reales. Por eso aparecen, por ejemplo, al buscar "co" (su autor es "Autor a completar").

---

### E4. Decisiones con argumentos

#### a) Identificador: ISBN como parámetro de ruta y como `key`

**Mi postura: usar el ISBN.**

A favor, en nuestra app:
- **Es el identificador que la persona tiene en la mano.** El escáner lee el EAN-13 de la contratapa, que **es** el ISBN-13, y navega a `/libro/[isbn]` sin ninguna traducción. Con un id numérico propio, el escáner necesitaría una tabla ISBN → id.
- **Las URLs se leen y se pueden compartir:** `bibliotecaipf://libro/9789500700016`.
- **Dos ediciones del mismo título tienen ISBN distintos.** Si la biblioteca tuviera *Ficciones* en dos ediciones, serían dos libros distintos, que es lo correcto: cada edición tiene sus propios ejemplares y su propia lista de espera.
- **Sobre `useLocalSearchParams`:** los parámetros **siempre llegan como `string`** (o como arreglo). Es lo que vimos en el E1 del TP 2. Un id numérico obligaría a convertir con `Number()` y a validar `NaN`, y una comparación `===` entre "5" y 5 fallaría sin aviso. El ISBN lo manejamos **como texto de punta a punta** (`esIsbnValido` con `/^\d{13}$/`), así que no hay conversión. Además, un ISBN como número perdería los ceros a la izquierda.

En contra, y cómo lo manejaríamos:
- **Libros sin ISBN** (donaciones viejas, apuntes, publicaciones del instituto) no podrían cargarse. Si eso pasara, agregaría un id interno de la biblioteca y dejaría el ISBN como dato opcional para escanear.

Para la `key` del `FlatList` el ISBN es único y estable. Hay una excepción en nuestra app: en "Vistos recientemente" el mismo libro puede aparecer dos veces (A, B, A), así que ahí la key es la **posición en la Pila** más el ISBN (`src/components/VistosRecientes.tsx`).

#### b) Estructuras: clase `Pila` con `#items` o un array con `[...pila, x]` y `slice`

**Mi postura: la clase, combinada con la estrategia de copiar y reemplazar.**

Lo que nos dio la clase:
- **Encapsulamiento real:** con `#items` nadie puede insertar en el medio de la cola ni saltear el orden FIFO. Las pantallas reciben `aArray()`, que es una copia.
- **Operaciones con nombre:** `encolar`, `desencolar`, `verFrente`, `apilar`, `verTope`. El código de `lib/biblioteca.ts` se lee como el enunciado ("entregar al siguiente desencola al frente").
- **`desencolar` en O(1)** sin `shift()`, con índices `#inicio` y `#fin` sobre un `Map` (`src/estructuras/Cola.ts`, líneas 18 a 26). Con un array, `shift()` es O(n) y `slice(1)` copia todo.

Lo que nos complicó al combinarla con React:
- **La clase es mutable y React necesita referencias nuevas.** No pudimos guardar una sola instancia y llamar a `encolar`: es el problema de B3. Tuvimos que copiar en cada operación (`new Cola(anterior.aArray())`), así que en el estado la ventaja del O(1) se diluye.
- **Comparar contenido requiere `aArray()`.** No se puede pasar una Cola directamente a un `FlatList`.
- **Todo el estado tuvo que pasar por funciones puras** que devuelven estado nuevo, para que el React Compiler y el modo estricto no tengan sorpresas.

Un array en el estado con `[...pila, x]` sería más natural para React, pero el orden dependería de la disciplina de cada programador.

#### c) Memorización: `useMemo` y `useCallback`

**Dónde aportan de verdad:**
- **El `value` del Context y las acciones estables** (`src/context/AppContext.tsx`: `acciones` con `useMemo` en las líneas 101 a 170, y `valor` con `useMemo` en las líneas 193 a 225).
  - El caso concreto: el detalle registra la visita en un efecto que depende de `registrarLibroVisto` (`libro/[isbn].tsx`, líneas 31 a 35).
  - Si esa función se recreara en cada render del Provider, cualquier cambio de estado (por ejemplo, reservar otro libro) volvería a ejecutar el efecto de un detalle que quedó montado debajo, y apilaría ese libro otra vez en "Vistos recientemente" sin que la persona lo haya abierto.
  - Con las acciones estables, el efecto solo corre al abrir el detalle.
- **`useCallback` en `existeLibro`** (`escanear.tsx`, línea 28). Es dependencia de `alLeerCodigo` en `useEscaner`. Sin él, la función que recibe la cámara cambiaría en cada render.

**Dónde serían ruido:**
- `useCallback` en `abrirAjustes` (`usePermiso.ts`, líneas 66 a 68) y en `reintentar` de `useLibros` (líneas 48 a 52). Solo se pasan como `onPress` a un botón, y ningún efecto depende de ellas.
- Además, el proyecto tiene el **React Compiler activado** (`app.json`, `"reactCompiler": true`), que ya memoriza componentes y valores automáticamente. Varios `useCallback` manuales son redundantes con el compilador. Los dejaría solo donde la estabilidad es parte del **contrato** de una API (las acciones del Context que se usan como dependencias de efectos).

**Cómo lo comprobaría en lugar de suponerlo:**
- Contando renders y ejecuciones de efectos. Es lo que hice en las pruebas: un componente que registra cuántas veces renderiza, y una prueba que verificó que, con el detalle de A montado debajo, una reserva no vuelve a apilar A, y que `registrarLibroVisto` conserva la misma referencia.
- En el teléfono, con el **Profiler de React DevTools** (con la opción "Highlight updates" o "Why did this render?"), comparando con y sin la memorización.

#### d) Datos duplicados: ¿los ejemplares disponibles se guardan o se calculan?

**Se calculan.** `calcularDisponibles` (`src/lib/biblioteca.ts`, líneas 39 a 48) toma `ejemplares` del catálogo y resta los préstamos activos sacados del estante:

```ts
const prestadosDelEstante = estado.prestamos.filter(
  (prestamo) => prestamo.isbn === isbn && prestamo.origen === 'estante',
).length;
return Math.max(0, libro.ejemplares - prestadosDelEstante);
```

**El error que aparece cuando un mismo dato vive en dos lugares:** si guardáramos un contador `disponibles` además de la lista de préstamos, cada operación tendría que actualizar **los dos** de forma coherente. Basta con olvidarse en un camino para que se desincronicen. Por ejemplo:
- devolver sin sumar el ejemplar deja un libro "Sin ejemplares" que en realidad está en el estante;
- entregar desde el mostrador y restar un ejemplar que ya estaba en 0 lo deja en −1.

Además, el error aparece lejos de donde se produjo, y es difícil saber cuál de los dos datos tiene razón.

**Cómo lo evita nuestro diseño:**
- Hay **una sola fuente de verdad**: la lista de préstamos. Los disponibles se derivan de ella cada vez, así que no pueden contradecirla.
- El préstamo que entrega el mostrador tiene `origen: 'mostrador'`: es un ejemplar que se devolvió y fue directo a la persona de la cola sin pasar por el estante. Por eso no se descuenta, y nunca da negativo.
- El mismo criterio usamos para "Recordarme", que no se guarda aparte (es `notificacionId !== null`), y para "reservas en espera", que se calculan buscando `'Vos'` en las colas.
