// comentarios.js
// Lista y agrega comentarios SIN recargar la pagina, usando fetch.
//  - GET  <url>  -> Flask responde {"status": "ok", "comentarios": [...]}
//  - POST <url>  -> Flask responde {"status": "ok"} o {"status": "error", "errores": [...]}

let seccion = document.getElementById("comentarios");
let URL_COMENTARIOS = seccion.dataset.url; // la puso Flask con url_for en detalle.html

// ---------- 1. Validadores (mismas reglas que validations.py) ----------

const validarTexto = (texto, minimo, maximo) => {
  if (!texto) return false;
  let largo = texto.trim().length;
  return largo >= minimo && largo <= maximo;
};

// ---------- 2. Mostrar errores ----------

const mostrarErrores = (errores) => {
  let caja = document.getElementById("mensaje");
  let cajaLista = document.getElementById("mensaje-lista");

  cajaLista.textContent = "";
  for (const error of errores) {
    let item = document.createElement("li");
    item.textContent = error;
    cajaLista.appendChild(item);
  }
  caja.hidden = false;
};

const ocultarErrores = () => {
  document.getElementById("mensaje").hidden = true;
};

// ---------- 3. Dibujar la lista de comentarios ----------

const dibujarComentarios = (comentarios) => {
  let lista = document.getElementById("lista-comentarios");
  lista.textContent = "";

  if (comentarios.length === 0) {
    let vacio = document.createElement("li");
    vacio.textContent = "Todavía no hay comentarios. ¡Sé el primero!";
    lista.appendChild(vacio);
    return;
  }

  for (const c of comentarios) {
    let item = document.createElement("li");

    let encabezado = document.createElement("p");
    encabezado.className = "comentario-autor";
    // textContent: si alguien escribio <script> en su comentario, se muestra como texto
    encabezado.textContent = c.fecha + " - " + c.nombre;

    let texto = document.createElement("p");
    texto.textContent = c.texto;

    item.appendChild(encabezado);
    item.appendChild(texto);
    lista.appendChild(item);
  }
};

// ---------- 4. Llamadas asincronas a Flask ----------

const cargarComentarios = () => {
  fetch(URL_COMENTARIOS)
    .then((response) => response.json())
    .then((data) => {
      dibujarComentarios(data.comentarios);
    })
    .catch((error) => {
      console.error("Error al cargar comentarios:", error);
    });
};

const enviarComentario = () => {
  let form = document.forms["formComentario"];
  let nombre = form["nombre"].value;
  let texto = form["texto"].value;

  // a) primero se valida en el navegador
  let errores = [];
  if (!validarTexto(nombre, 3, 50)) {
    errores.push("Nombre: entre 3 y 50 caracteres.");
  }
  if (!validarTexto(texto, 5, 300)) {
    errores.push("Comentario: entre 5 y 300 caracteres.");
  }
  if (errores.length > 0) {
    mostrarErrores(errores);
    return; // el formulario sigue visible para corregir
  }

  // b) si esta bien, se envia a Flask. FormData arma los datos igual que un submit normal
  fetch(URL_COMENTARIOS, {
    method: "POST",
    body: new FormData(form),
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.status === "ok") {
        ocultarErrores();
        form.reset();        // limpia el formulario
        cargarComentarios(); // vuelve a pedir la lista, ya con el comentario nuevo
      } else {
        // el servidor encontro errores (por ejemplo, si alguien salto el JavaScript)
        mostrarErrores(data.errores);
      }
    })
    .catch((error) => {
      console.error("Error al enviar comentario:", error);
      mostrarErrores(["No se pudo enviar el comentario. Intente de nuevo."]);
    });
};

// ---------- 5. Eventos ----------

document.getElementById("boton-comentar").addEventListener("click", enviarComentario);

cargarComentarios(); // al abrir la pagina se cargan los comentarios
