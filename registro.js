// registro.js
// Validacion del formulario de voluntario. Toda la validacion es en JavaScript.

// ---------- 1. Poblar los select de región y comuna ----------

const poblarRegiónes = () => {
  let selectRegión = document.getElementById("región");
  for (const región in REGIONES) {
    let opcion = document.createElement("option");
    opcion.value = región;
    opcion.text = región;
    selectRegión.appendChild(opcion);
  }
};

// Cuando cambia la región, se rehacen las comunas de esa región.
const actualizarComunas = () => {
  let selectRegión = document.getElementById("región");
  let selectComuna = document.getElementById("comuna");
  let regiónElegida = selectRegión.value;

  // dejamos el select con solo la opcion vacia
  selectComuna.textContent = "";
  let vacia = document.createElement("option");
  vacia.value = "";
  vacia.text = "Seleccione una comuna";
  selectComuna.appendChild(vacia);

  if (REGIONES[regiónElegida]) {
    for (const comuna of REGIONES[regiónElegida]) {
      let opcion = document.createElement("option");
      opcion.value = comuna;
      opcion.text = comuna;
      selectComuna.appendChild(opcion);
    }
  }
};

// ---------- 2. Validadores ----------

const validarNombre = (nombre) => {
  if (!nombre) return false;
  let largoOk = nombre.trim().length >= 3;
  // \u00C0-\u017F cubre las letras con acento y la ñ
  let formatoOk = /^[a-zA-Z\u00C0-\u017F ]+$/.test(nombre.trim());
  return largoOk && formatoOk;
};

const validarEmail = (email) => {
  if (!email) return false;
  let re = /^[\w.-]+@[\w-]+\.[a-zA-Z]{2,4}$/;
  return re.test(email);
};

const validarCelular = (celular) => {
  if (!celular) return false;
  // 9 dígitos que parten con 9
  let re = /^9[0-9]{8}$/;
  return re.test(celular);
};

const validarSeleccion = (valor) => {
  return valor !== "";
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

const validarRegistro = () => {
  let form = document.forms["formRegistro"];
  let nombre = form["nombre"].value;
  let email = form["email"].value;
  let celular = form["celular"].value;
  let región = form["región"].value;
  let comuna = form["comuna"].value;

  let errores = [];

  if (!validarNombre(nombre)) {
    errores.push("Nombre: debe tener al menos 3 letras y no puede tener números.");
  }
  if (!validarEmail(email)) {
    errores.push("Email: el formato no es válido.");
  }
  if (!validarCelular(celular)) {
    errores.push("Celular: deben ser 9 dígitos partiendo con 9.");
  }
  if (!validarSeleccion(región)) {
    errores.push("Región: debe seleccionar una región.");
  }
  if (!validarSeleccion(comuna)) {
    errores.push("Comuna: debe seleccionar una comuna.");
  }

  if (errores.length > 0) {
    mostrarMensaje("Corrija los siguientes datos:", errores, true);
  } else {
    mostrarMensaje("Voluntario registrado correctamente.", [], false);
  }
};

// ---------- 5. Conectar los eventos ----------

document.getElementById("región").addEventListener("change", actualizarComunas);
document.getElementById("boton-registrar").addEventListener("click", validarRegistro);

poblarRegiónes();
