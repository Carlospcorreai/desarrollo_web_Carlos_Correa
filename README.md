# Tarea 3 - CC5002 Desarrollo de Aplicaciones Web

Carlos Correa

Esta tarea continúa la tarea 2 (Flask, MySQL y SQLAlchemy). Agregué la página de estadísticas con 3 gráficos y los comentarios en el detalle de cada avistamiento. Las dos cosas usan `fetch` desde JavaScript.

## Cómo correrla

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

## Qué agregué en esta tarea

Archivos nuevos: `static/js/estadisticas.js`, `static/js/comentarios.js` y `database/tabla-comentario.sql`. También modifiqué `app.py`, `database/db.py`, `utils/validations.py`, las plantillas `detalle.html` y `estadisticas.html`, y el CSS.

Rutas nuevas:

| Ruta | Respuesta | Para qué |
|---|---|---|
| `GET /estadisticas` | HTML | Página con los 3 gráficos y el enlace a la portada |
| `GET /estadisticas/datos` | JSON | Datos de los gráficos, sacados de la base de datos |
| `GET /avistamiento/<id>/comentarios` | JSON | Comentarios de un avistamiento |
| `POST /avistamiento/<id>/comentarios` | JSON | Valida y guarda un comentario |

## Decisiones

### Gráficos

Usé Highcharts (https://www.highcharts.com), que es la biblioteca que vimos en clases y en la auxiliar 8. Es gratis para uso personal y educativo. Se carga desde `https://code.highcharts.com/highcharts.js`.

Los tres gráficos piden sus datos en un solo `fetch` a `/estadisticas/datos`. Flask responde un JSON con tres listas de pares `[etiqueta, cantidad]`, y cada lista sale de una consulta con `GROUP BY` en `db.py`.

Algunas cosas que tuve que decidir por el modelo de datos:

- Para el gráfico de avistamientos por día agrupé por `DATE(fecha_hora)`, que es el día en que se vio el ave. La tabla `avistamiento` no guarda otra fecha.
- El gráfico de torta pide avistamientos "por tipo de ave", pero desde la tarea 2 la tabla `ave` solo tiene el nombre. Por eso cada parte de la torta es un ave.
- En el gráfico de voluntarios por comuna hice un `JOIN` entre `comuna` y `voluntario`, así solo salen las comunas que tienen al menos un voluntario.

### Comentarios

Cuando se abre el detalle de un avistamiento, `comentarios.js` pide la lista con un `GET` y la dibuja. Al apretar "Agregar comentario" primero se valida en el navegador y, si está todo bien, se envía el formulario con `fetch` usando `FormData`. Flask vuelve a validar y responde:

- 201 si se guardó. En ese caso limpio el formulario y vuelvo a pedir la lista.
- 400 con la lista de errores si algún dato está malo. Los errores se muestran y el formulario sigue ahí para corregirlo.
- 404 si el avistamiento no existe.

Las reglas son las mismas en `comentarios.js` y en `validations.py`: el nombre debe tener entre 3 y 50 caracteres y el comentario entre 5 y 300. El enunciado no pide máximo para el comentario, pero le puse 300 porque la columna `texto` es `VARCHAR(300)`. Los espacios al principio y al final no cuentan. La fecha del comentario la pone el servidor con `datetime.now()`.

### Seguridad

- Los comentarios se muestran con `textContent`. Si alguien escribe algo como `<img src=x onerror=alert(1)>`, aparece como texto y no se ejecuta (XSS).
- SQLAlchemy arma las consultas con parámetros, así que un texto con comillas o `DROP TABLE` se guarda como texto normal.
- No agregué token contra CSRF. Por lo que vimos en la clase de OWASP, el ataque sirve contra usuarios con sesión iniciada, y este sistema no tiene login. Si más adelante se agrega login, habría que usar un token, por ejemplo con Flask-WTF.

## Lo que viene de la tarea 2

Todo lo de la tarea 2 sigue igual: validación en JavaScript y de nuevo en Flask, avistamiento y archivos guardados en una sola transacción, archivos revisados con `filetype` y guardados con nombre hash + uuid, y parámetros de URL con `<int:id>` y `type=int` para evitar valores raros.
