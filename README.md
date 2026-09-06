# CC5002 - Tarea 1: Avistamientos de aves

Prototipo de la Union de Ornitologos de Chile. Son solo archivos HTML, CSS y
JavaScript: se abren directamente con el navegador, sin servidor web.

## Archivos

- `index.html` - portada y explicacion del sistema.
- `registro.html` + `js/registro.js` - registro de voluntario.
- `avistamiento.html` + `js/avistamiento.js` - informar un avistamiento.
- `listado.html` + `js/listado.js` - listado con filtro, orden y paginacion.
- `estadisticas.html` + `js/estadisticas.js` - indicadores y graficos.
- `js/datos.js` - datos de ejemplo (regiones, comunas, tipos de ave, avistamientos).
- `css/estilos.css` - unica hoja de estilos del sitio.

## Decisiones tomadas

1. **Toda la validacion es JavaScript.** No se usa el atributo `required`. Cada
   campo tiene una funcion validadora propia y el boton es `type="button"`, asi
   el formulario nunca se envia solo y no hace falta `preventDefault()`.

2. **Los errores se muestran juntos.** Se recorren todos los campos, se acumulan
   los mensajes en un arreglo `errores` y se muestran en una lista sobre el
   formulario. El usuario ve de una vez todo lo que debe corregir.

3. **Region y comuna son dependientes.** El select de comuna se rellena con
   JavaScript segun la region elegida, usando el objeto `REGIONES` de `datos.js`.

4. **Reglas de validacion definidas:**
   - Nombre: minimo 3 caracteres, solo letras y espacios.
   - Email: expresion regular `texto@dominio.ext`.
   - Celular: 9 digitos que parten con 9.
   - Region y comuna: obligatorio elegir una opcion distinta de la vacia.
   - Fecha del avistamiento: no puede ser futura ni anterior a un ano.
   - Foto o video: entre 1 y 3 archivos, todos de tipo `image/*` o `video/*`.
   - Campos opcionales: observaciones del voluntario y comentario del avistamiento.

5. **No se guarda informacion.** Al validar correctamente solo se muestra un
   mensaje de exito, porque el enunciado indica que es un prototipo.

6. **Se usa `textContent` y no `innerHTML`** al escribir datos en la pagina, para
   que un texto ingresado por el usuario nunca se interprete como HTML.

7. **La paginacion del listado** muestra 5 avistamientos por pagina. El filtro por
   tipo y el ordenamiento se aplican antes de cortar la pagina, y al cambiarlos se
   vuelve a la pagina 1.

8. **Los graficos estan hechos a mano**, sin librerias: cada barra es un `span`
   cuyo ancho en porcentaje se calcula con respecto al valor mas grande.

9. **HTML semantico:** se usan `header`, `nav`, `main`, `section`, `footer`,
   `table` y listas, evitando `div` sin proposito.
