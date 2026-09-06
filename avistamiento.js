// avistamiento.js
// Validacion del formulario de avistamiento. Toda la validacion es en JavaScript.

// ---------- 1. Poblar el select de tipo de ave ----------

const poblarTipos = () => {
  let selectTipo = document.getElementById("tipo");
  for (const tipo of TIPOS_AVE) {
    let opcion = document.createElement("option");
    opcion.value = tipo;
    opcion.text = tipo;
    selectTipo.appendChild(opcion);
  }
};

// ---------- 2. Validadores ----------

const validarTexto = (texto) => {
  if (!texto) return false;
  return texto.trim().length >= 3;
};

const validarSeleccion = (valor) => {
  return valor !== "";
};

// La fecha no puede estar en el futuro ni ser anterior a un año.
const validarFecha = (fecha) => {
  if (!fecha) return false;

  let fechaAvistamiento = new Date(fecha);
  let hoy = new Date();

  let hace1Ano = new Date();
  hace1Ano.setFullYear(hoy.getFullYear() - 1);

  return fechaAvistamiento <= hoy && fechaAvistamiento >= hace1Ano;
};

const validarHora = (hora) => {
  return hora !== "";
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

// ---------- 3. Mostrar el resultado ----------

const mostrarMensaje = (titulo, errores, esError) => {
  let caja = document.getElementById("mensaje");
  let cajaTitulo = document.getElementById("mensaje-titulo");
  let cajaLista = document.getElementById("mensaje-lista");

  cajaTitulo.textContent = titulo;
  cajaLista.textContent = "";

  for (const error of errores) {
    let item = document.createElement("li");
    item.textContent = error;
    cajaLista.appendChild(item);
  }

  caja.className = esError ? "error" : "exito";
  caja.hidden = false;
};

// ---------- 4. Validacion del formulario completo ----------

const validarAvistamiento = () => {
  let form = document.forms["formAvistamiento"];
  let tipo = form["tipo"].value;
  let nombre = form["nombre"].value;
  let lugar = form["lugar"].value;
  let fecha = form["fecha"].value;
  let hora = form["hora"].value;
  let archivos = form["archivos"].files;

  let errores = [];

  if (!validarSeleccion(tipo)) {
    errores.push("Tipo de ave: debe seleccionar un tipo.");
  }
  if (!validarTexto(nombre)) {
    errores.push("Nombre del ave: minimo 3 caracteres.");
  }
  if (!validarTexto(lugar)) {
    errores.push("Lugar: minimo 3 caracteres.");
  }
  if (!validarFecha(fecha)) {
    errores.push("Fecha: no puede ser futura ni anterior a un año.");
  }
  if (!validarHora(hora)) {
    errores.push("Hora: debe indicar la hora del avistamiento.");
  }
  if (!validarArchivos(archivos)) {
    errores.push("Foto o video: debe adjuntar entre 1 y 3 archivos de imagen o video.");
  }

  if (errores.length > 0) {
    mostrarMensaje("Corrija los siguientes datos:", errores, true);
  } else {
    mostrarMensaje("Avistamiento informado correctamente.", [], false);
  }
};

// ---------- 5. Conectar los eventos ----------

document.getElementById("boton-informar").addEventListener("click", validarAvistamiento);

poblarTipos();
