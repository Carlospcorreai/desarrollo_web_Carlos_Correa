# CC5002 - Tarea 2: Avistamientos de aves con Flask y MySQL

Continuación de la tarea 1. Ahora los formularios se envían a Flask, que valida
los datos de nuevo, los guarda en MySQL con SQLAlchemy y guarda los archivos en disco.

## Cómo ejecutarla

1. Crear la base de datos y cargar los datos (en este orden):
   ```
   mysql -u root -p < database/tarea2.sql
   mysql -u root -p tarea2 < database/region-comuna.sql
   mysql -u root -p tarea2 < database/aves.sql
   ```
2. Instalar las librerías: `pip install -r requirements.txt`
3. Ejecutar **desde la carpeta del proyecto** (la carpeta de subida es relativa):
   `python app.py` y abrir http://127.0.0.1:5000

## Estructura

```
app.py                  rutas de Flask
database/db.py          modelos SQLAlchemy (una clase por tabla) y consultas
utils/validations.py    validaciones del lado del servidor
templates/              base.html + una plantilla por página (Jinja)
static/js/              validaciones del navegador (las mismas de la tarea 1)
static/css/estilos.css  hoja de estilos única
static/uploads/         fotos y videos subidos
```

## Rutas

| URL | Qué hace |
|---|---|
| `GET /` | Portada con los últimos 2 avistamientos |
| `GET, POST /registro` | Formulario de voluntario y su inserción |
| `GET /registro/<id>` | Confirmación: ofrece informar un avistamiento o volver al inicio |
| `GET, POST /avistamiento` | Formulario de avistamiento, inserción y archivos |
| `GET /listado?pagina=N` | Listado paginado, 5 por página |
| `GET /avistamiento/<id>` | Detalle con fotos y videos |
| `GET /estadisticas` | Pendiente para la tarea 3 |

## Decisiones que hay que tener en cuenta

1. **Se valida dos veces.** El JavaScript de la tarea 1 se mantiene y, si todo está
   bien, envía el formulario con `form.submit()`. Flask vuelve a validar con las
   mismas reglas en `utils/validations.py`, porque el JavaScript se puede desactivar
   o saltar enviando los datos directamente (por ejemplo con curl).

2. **Si hay errores, el formulario se vuelve a mostrar** con la lista de errores y con
   los textos que el usuario ya había escrito.

3. **Cambios al modelo respecto de la tarea 1.** La tabla `ave` solo tiene nombre, así
   que el "tipo de ave" de la tarea 1 se reemplazó por un select con las 585 aves de
   `aves.sql`, y el listado ya no filtra por tipo. Las regiones y comunas ahora vienen
   de la base de datos: Flask las entrega al JavaScript con el filtro `tojson` de Jinja.

4. **Avistamiento y registros en una sola transacción.** `create_avistamiento` agrega el
   avistamiento, hace `flush()` para obtener su id y agrega una fila en `registro` por
   cada archivo. Recién ahí hace `commit()`, así nunca queda un avistamiento sin sus
   archivos en la base de datos.

5. **Archivos.** Se aceptan de 1 a 3 archivos. El tipo se revisa con `filetype`, que lee
   los primeros bytes del archivo, y no con la extensión, que se puede cambiar. En disco
   se guardan como `hash_del_nombre + uuid + extensión real` dentro de `static/uploads/`.
   En `registro.ruta_archivo` va la ruta relativa a `static/` y en `nombre_archivo` el
   nombre original (pasado por `secure_filename`). Límite: 50 MB por envío.

6. **Entradas maliciosas:**
   - *SQL injection*: SQLAlchemy usa consultas parametrizadas, nunca se arma SQL con texto.
   - *XSS*: Jinja escapa automáticamente todo lo que se imprime con `{{ }}`, y el
     JavaScript usa `textContent`.
   - *Parámetros en la URL*: `<int:id>` y `type=int` hacen que `/avistamiento/abc` dé 404
     y que `?pagina=abc` o `?pagina=-3` terminen en una página válida.
   - *Ids de select falsos*: el servidor busca la comuna, el voluntario y el ave en la
     base de datos; si el id no existe, es un error de validación.
   - *Nombres de archivo*: nombres como `../../app.py` nunca llegan al disco.

7. **Fecha.** El formulario tiene fecha y hora por separado; Flask las une en el
   `DATETIME` de la tabla. No puede ser futura ni anterior a un año.
   `fecha_registro` del voluntario se llena con `datetime.now()` al insertar.

8. **Mensaje después de informar un avistamiento**: se usa `flash()` y
   `redirect()` a la portada, para que recargar la página no vuelva a enviar el formulario.
