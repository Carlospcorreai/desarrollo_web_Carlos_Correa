# Tarea 4 - CC5002 Desarrollo de Aplicaciones Web

Carlos Correa

Esta tarea agrega el buscador de avistamientos y la evaluación con notas. Las dos funciones están hechas con Spring Boot (Java 17, JPA y Thymeleaf) en la carpeta `tarea4/`, y el navegador se comunica con el servidor usando `fetch`. El resto del sitio (registro, avistamientos, listado, estadísticas y comentarios) sigue en la aplicación Flask de las tareas 2 y 3, que usa la misma base de datos `tarea2`.

La rama se llama `Tarea-4`, con guion, porque Git no acepta espacios en el nombre de una rama. Las tareas anteriores están en `Tarea-1`, `Tarea-2` y `Tarea-3`.

## Cómo correrla

1. Crear la tabla de notas. Si la base de la tarea 3 ya existe, basta con este comando:

   ```
   mysql -u root -p --default-character-set=utf8mb4 < database/tabla-nota.sql
   ```

   Si se parte de cero, primero van los cuatro comandos de la tarea 3 (más abajo).

2. Levantar Spring Boot (Java 17 o superior). No hace falta instalar Maven, porque el proyecto trae el wrapper:

   ```
   cd tarea4
   ./mvnw spring-boot:run          (en Windows: mvnw.cmd spring-boot:run)
   ```

   El buscador queda en http://127.0.0.1:8080. Se conecta con el mismo usuario de la tarea 2 (`cc5002` / `programacionweb`); si en el computador de corrección es otro, se cambia en `tarea4/src/main/resources/application.properties`.

3. (Opcional) Levantar Flask como en la tarea 3 (`python app.py`). Los enlaces del menú del buscador apuntan a http://127.0.0.1:5000, y en el menú de Flask agregué el enlace "Buscador" que lleva a Spring Boot.

Las validaciones del servidor tienen pruebas unitarias que no necesitan base de datos: `./mvnw test`.

## Qué agregué en esta tarea

```
database/tabla-nota.sql                     tabla nueva (el archivo del enunciado)
tarea4/pom.xml, mvnw, mvnw.cmd, .mvn/        proyecto Maven
tarea4/src/main/java/cl/uchile/cc5002/avistamientos/
    models/        entidades JPA (Comuna, Ave, Voluntario, Avistamiento, Nota) y repositorios
    services/      BuscadorService, NotaService y Validaciones
    controllers/   PaginaController (HTML) y ApiController (JSON)
tarea4/src/main/resources/
    templates/buscador.html                 vista con Thymeleaf
    static/js/buscador.js                   búsqueda, resaltado y notas con fetch
    static/css/estilos.css, buscador.css    estilos de la tarea 3 y los nuevos
tarea4/src/test/.../ValidacionesTest.java   pruebas de las validaciones
```

En Flask solo cambié el menú de `templates/base.html` y una línea de configuración en `app.py`.

Seguí la arquitectura de tres capas de la auxiliar 10: el controlador recibe la petición, el servicio tiene la lógica y el repositorio habla con la base de datos.

Rutas de Spring Boot:

| Ruta | Respuesta | Para qué |
|---|---|---|
| `GET /` | HTML | Página del buscador |
| `GET /api/avistamientos/buscar?q=texto` | JSON | Avistamientos cuyo ave, voluntario o comuna contiene el texto |
| `POST /api/avistamientos/<id>/notas` | JSON | Valida y guarda una nota (campo `nota`) y devuelve el promedio nuevo |

Las respuestas tienen el mismo formato que los comentarios de la tarea 3: `{"status": "ok", ...}` o `{"status": "error", "errores": [...]}`, con código 200 o 201 si todo salió bien, 400 si un dato es inválido y 404 si el avistamiento no existe.

## Decisiones

### Buscador

- La búsqueda se hace en la base de datos con `LIKE '%texto%'` sobre `ave.nombre`, `voluntario.nombre` y `comuna.nombre`. La auxiliar 10 traía todas las filas con `findAll()` y filtraba en Java; preferí no hacerlo así porque con muchos avistamientos se cargarían todos en memoria en cada letra.
- La tabla `avistamiento` no tiene comuna. Igual que en el listado de la tarea 2, la comuna de un avistamiento es la del voluntario que lo informó (`avistamiento → voluntario → comuna`).
- La consulta usa `JOIN FETCH` para traer voluntario, comuna y ave en una sola consulta. Sin eso, JPA haría una consulta extra por cada fila (problema N+1). Los promedios de todas las filas salen de un solo `GROUP BY`.
- La base de datos usa la collation `utf8_general_ci`, que no distingue mayúsculas ni tildes: "nunoa" encuentra "Ñuñoa" y "MARIA" encuentra "María". Por eso el resaltado en JavaScript también las ignora: compara las letras sin tilde y en minúscula, y marca con `<mark>` el texto original. Si el texto aparece varias veces en un nombre, se marcan todas.
- Escapo `%` y `_` antes de armar el `LIKE`. Sin eso, escribir `%` mostraría todos los avistamientos.
- La búsqueda parte con la primera letra, pero espera 250 ms sin teclear antes de consultar, para no mandar una petición por cada tecla. Si llega una búsqueda nueva, la anterior se cancela con `AbortController`, así una respuesta lenta de un texto viejo no reemplaza a la del texto actual.
- Muestro como máximo los 50 avistamientos más recientes. Con una sola letra pueden calzar casi todos; en ese caso la página indica el total y sugiere escribir más.
- Se quitan los espacios al principio y al final, y el texto puede tener hasta 100 caracteres (el servidor también lo revisa).
- Si no hay resultados, se muestra el mensaje "No se encontraron avistamientos para «texto»".

### Notas

- La columna "Nota" muestra "-" si el avistamiento no tiene notas. Si tiene, muestra el promedio con un decimal y coma (por ejemplo "5,3") y debajo cuántas notas lleva.
- "Evaluar" abre una ventana `<dialog>` (elemento nativo de HTML5, sin bibliotecas) con siete opciones del 1 al 7. Usé botones de radio porque así solo se puede elegir un entero válido.
- La nota se valida dos veces. En el navegador, para avisar altiro si no se eligió ninguna. En el servidor, porque cualquiera puede llamar a la API sin pasar por la página: `Validaciones.validarNota` solo acepta un dígito entre 1 y 7, así que rechaza "0", "8", "5.5", "5,0", "05", "+5", textos y el campo vacío. Recibo la nota como texto y no como `Integer` para controlar ese caso y responder con mi propio mensaje.
- Al guardar, el servidor inserta la nota y calcula el promedio con `AVG` en la base de datos, dentro de la misma transacción. La respuesta trae ese promedio y JavaScript actualiza solo la celda de ese avistamiento (que se pinta verde un momento) y muestra un aviso. Usar el promedio que calcula el servidor también considera las notas que otras personas hayan puesto mientras tanto.
- El botón "Guardar nota" se desactiva mientras espera la respuesta, para no guardar la misma nota dos veces con un doble clic.

### Base de datos y JPA

- Las tablas antiguas se mapean con `@Immutable`, porque esta aplicación solo las lee; la única tabla en la que escribe es `nota`. Solo mapeé las columnas que se usan.
- `spring.jpa.hibernate.ddl-auto=none`: las tablas las crean los archivos `.sql` y Hibernate no las modifica.
- En la entidad `Nota` el atributo se llama `valor` (columna `nota`) para no confundirlo con el nombre de la clase.

### Seguridad

- Todo lo que viene de la base de datos se muestra con `textContent`. Probé con un voluntario llamado `<b>Pedro</b>` y aparece como texto.
- Las consultas JPQL usan parámetros (`:patron`), así que el texto buscado no puede cambiar la consulta (inyección SQL).
- Igual que en la tarea 3, no agregué token contra CSRF porque el sitio no tiene inicio de sesión.

### Bibliotecas

En el navegador no usé bibliotecas externas: `fetch`, `AbortController` y `<dialog>` vienen en los navegadores actuales. En el servidor usé lo que pide el enunciado y lo de la auxiliar 10: Spring Web, Thymeleaf, Spring Data JPA y el driver de MySQL.

### Validadores y pruebas

- El HTML que entrega Spring (y también la página después de mostrar resultados) pasa el validador de la W3C (Nu Html Checker) sin errores ni advertencias. `estilos.css` y `buscador.css` pasan el validador CSS de la W3C sin errores ni advertencias.
- Probé en pantallas de 1100 y 375 píxeles de ancho. En celulares la tabla se desplaza hacia el lado dentro de su caja, sin agrandar la página.
- Probé el buscador y las notas con MySQL/MariaDB: búsquedas con y sin tildes, `%` y `_`, texto sin resultados, notas válidas e inválidas, avistamiento inexistente y doble envío.

---

# Tarea 3

Carlos Correa

Esta tarea continúa la tarea 2 (Flask, MySQL y SQLAlchemy). Agregué la página de estadísticas con 3 gráficos y los comentarios en el detalle de cada avistamiento. Las dos cosas usan `fetch` desde JavaScript.

### Cómo correrla

Primero hay que crear la base de datos. Si ya está la base de la tarea 2, basta con el último comando (la tabla de comentarios):

```
mysql -u root -p --default-character-set=utf8mb4 < database/tarea2.sql
mysql -u root -p --default-character-set=utf8mb4 tarea2 < database/region-comuna.sql
mysql -u root -p --default-character-set=utf8mb4 tarea2 < database/aves.sql
mysql -u root -p --default-character-set=utf8mb4 < database/tabla-comentario.sql
```

Agregué `--default-character-set=utf8mb4` porque en una de mis pruebas las comunas con ñ quedaron mal guardadas ("ViÃ±a del Mar" en vez de "Viña del Mar").

Después:

```
pip install -r requirements.txt
python app.py
```

Hay que ejecutarlo desde la carpeta del proyecto, porque la carpeta donde se suben los archivos (`static/uploads`) está escrita como ruta relativa. La app queda en http://127.0.0.1:5000. Para ver los gráficos se necesita internet, ya que Highcharts se carga desde su CDN.

### Qué agregué en esta tarea

Archivos nuevos: `static/js/estadisticas.js`, `static/js/comentarios.js` y `database/tabla-comentario.sql`. También modifiqué `app.py`, `database/db.py`, `utils/validations.py`, las plantillas `detalle.html` y `estadisticas.html`, y el CSS.

Rutas nuevas:

| Ruta | Respuesta | Para qué |
|---|---|---|
| `GET /estadisticas` | HTML | Página con los 3 gráficos y el enlace a la portada |
| `GET /estadisticas/datos` | JSON | Datos de los gráficos, sacados de la base de datos |
| `GET /avistamiento/<id>/comentarios` | JSON | Comentarios de un avistamiento |
| `POST /avistamiento/<id>/comentarios` | JSON | Valida y guarda un comentario |

### Decisiones

#### Gráficos

Usé Highcharts (https://www.highcharts.com), que es la biblioteca que vimos en clases y en la auxiliar 8. Es gratis para uso personal y educativo. Se carga desde `https://code.highcharts.com/highcharts.js`.

Los tres gráficos piden sus datos en un solo `fetch` a `/estadisticas/datos`. Flask responde un JSON con tres listas de pares `[etiqueta, cantidad]`, y cada lista sale de una consulta con `GROUP BY` en `db.py`.

Algunas cosas que tuve que decidir por el modelo de datos:

- Para el gráfico de avistamientos por día agrupé por `DATE(fecha_hora)`, que es el día en que se vio el ave. La tabla `avistamiento` no guarda otra fecha.
- El gráfico de torta pide avistamientos "por tipo de ave", pero desde la tarea 2 la tabla `ave` solo tiene el nombre. Por eso cada parte de la torta es un ave.
- En el gráfico de voluntarios por comuna hice un `JOIN` entre `comuna` y `voluntario`, así solo salen las comunas que tienen al menos un voluntario.

#### Comentarios

Cuando se abre el detalle de un avistamiento, `comentarios.js` pide la lista con un `GET` y la dibuja. Al apretar "Agregar comentario" primero se valida en el navegador y, si está todo bien, se envía el formulario con `fetch` usando `FormData`. Flask vuelve a validar y responde:

- 201 si se guardó. En ese caso limpio el formulario y vuelvo a pedir la lista.
- 400 con la lista de errores si algún dato está malo. Los errores se muestran y el formulario sigue ahí para corregirlo.
- 404 si el avistamiento no existe.

Las reglas son las mismas en `comentarios.js` y en `validations.py`: el nombre debe tener entre 3 y 50 caracteres y el comentario entre 5 y 300. El enunciado no pide máximo para el comentario, pero le puse 300 porque la columna `texto` es `VARCHAR(300)`. Los espacios al principio y al final no cuentan. La fecha del comentario la pone el servidor con `datetime.now()`.

#### Seguridad

- Los comentarios se muestran con `textContent`. Si alguien escribe algo como `<img src=x onerror=alert(1)>`, aparece como texto y no se ejecuta (XSS).
- SQLAlchemy arma las consultas con parámetros, así que un texto con comillas o `DROP TABLE` se guarda como texto normal.
- No agregué token contra CSRF. Por lo que vimos en la clase de OWASP, el ataque sirve contra usuarios con sesión iniciada, y este sistema no tiene login. Si más adelante se agrega login, habría que usar un token, por ejemplo con Flask-WTF.

### Lo que viene de la tarea 2

Todo lo de la tarea 2 sigue igual: validación en JavaScript y de nuevo en Flask, avistamiento y archivos guardados en una sola transacción, archivos revisados con `filetype` y guardados con nombre hash + uuid, y parámetros de URL con `<int:id>` y `type=int` para evitar valores raros.
