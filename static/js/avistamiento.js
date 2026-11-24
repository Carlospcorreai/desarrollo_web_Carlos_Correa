// avistamiento.js
// Igual que en la tarea 1, pero ahora el voluntario y el ave se eligen de la
// base de datos, y si todo esta bien el formulario se envia a Flask con form.submit().

// ---------- 1. Validadores ----------

const validarTexto = (texto, minimo, maximo) => {
  if (!texto) return false;
  let largo = texto.trim().length;
  return largo >= minimo && largo <= maximo;
};

const validarSeleccion = (valor) => {
  return valor !== "";
};

// La fecha y hora no pueden estar en el futuro ni ser anteriores a un año.
const validarFechaHora = (fecha, hora) => {
  if (!fecha || !hora) return false;

  let fechaAvistamiento = new Date(fecha + "T" + hora);
  let hoy = new Date();

  let hace1Ano = new Date();
  hace1Ano.setFullYear(hoy.getFullYear() - 1);

  return fechaAvistamiento <= hoy && fechaAvistamiento >= hace1Ano;
};

// Se exige al menos un archivo, y todos deben ser imagen o video.
const validarArchivos = (archivos) => {
  if (!archivos) return false;

  let cantidadOk = archivos.length >= 1 && archivos.length <= 3;

  let tipoOk = true;
  for (const archivo of archivos) {
    let familia = archivo.type.split("/")[0];
    if (familia !== "image" && familia !== "video") {
      tipoOk = false;
    }
  }

  return cantidadOk && tipoOk;
};

// ---------- 2. Mostrar los errores ----------

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

// ---------- 3. Validacion del formulario completo ----------

const validarAvistamiento = () => {
  let form = document.forms["formAvistamiento"];
  let voluntario = form["voluntario"].value;
  let ave = form["ave"].value;
  let lugar = form["lugar"].value;
  let fecha = form["fecha"].value;
  let hora = form["hora"].value;
  let descripcion = form["descripcion"].value;
  let archivos = form["archivos"].files;

  let errores = [];

  if (!validarSeleccion(voluntario)) {
    errores.push("Voluntario: debe seleccionar un voluntario.");
  }
  if (!validarSeleccion(ave)) {
    errores.push("Ave: debe seleccionar un ave.");
  }
  if (!validarTexto(lugar, 3, 200)) {
    errores.push("Lugar: entre 3 y 200 caracteres.");
  }
  if (!validarFechaHora(fecha, hora)) {
    errores.push("Fecha y hora: no puede ser futura ni anterior a un año.");
  }
  if (descripcion.length > 500) {
    errores.push("Descripción: máximo 500 caracteres.");
  }
  if (!validarArchivos(archivos)) {
    errores.push("Foto o video: debe adjuntar entre 1 y 3 archivos de imagen o video.");
  }

  if (errores.length > 0) {
    mostrarErrores(errores);
  } else {
    // NUEVO en la tarea 2: se envia el formulario a Flask (POST /avistamiento)
    form.submit();
  }
};

// ---------- 4. Conectar los eventos ----------

document.getElementById("boton-informar").addEventListener("click", validarAvistamiento);
