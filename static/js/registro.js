// registro.js
// Igual que en la tarea 1, pero ahora:
//  - las regiones y comunas vienen de la base de datos (variable REGIONES del template)
//  - si todo esta bien, el formulario se envia a Flask con form.submit()

// ---------- 1. Poblar los select de region y comuna ----------

const poblarRegiones = () => {
  let selectRegion = document.getElementById("region");
  for (const region of REGIONES) {
    let opcion = document.createElement("option");
    opcion.value = region.id;
    opcion.text = region.nombre;
    selectRegion.appendChild(opcion);
  }
};

// Cuando cambia la region, se rehacen las comunas de esa region.
const actualizarComunas = () => {
  let selectRegion = document.getElementById("region");
  let selectComuna = document.getElementById("comuna");
  let regionElegida = selectRegion.value;

  // dejamos el select con solo la opcion vacia
  selectComuna.textContent = "";
  let vacia = document.createElement("option");
  vacia.value = "";
  vacia.text = "Seleccione una comuna";
  selectComuna.appendChild(vacia);

  for (const region of REGIONES) {
    if (String(region.id) === regionElegida) {
      for (const comuna of region.comunas) {
        let opcion = document.createElement("option");
        opcion.value = comuna.id;
        opcion.text = comuna.nombre;
        selectComuna.appendChild(opcion);
      }
    }
  }
};

// ---------- 2. Validadores ----------

const validarNombre = (nombre) => {
  if (!nombre) return false;
  let largoOk = nombre.trim().length >= 3;
  // À-ſ cubre las letras con tilde y la ñ
  let formatoOk = /^[a-zA-ZÀ-ſ ]+$/.test(nombre.trim());
  return largoOk && formatoOk;
};

const validarEmail = (email) => {
  if (!email) return false;
  let re = /^[\w.-]+@[\w-]+\.[a-zA-Z]{2,4}$/;
  return re.test(email);
};

const validarCelular = (celular) => {
  if (!celular) return false;
  // 9 digitos que parten con 9
  let re = /^9[0-9]{8}$/;
  return re.test(celular);
};

const validarSeleccion = (valor) => {
  return valor !== "";
};

// ---------- 3. Mostrar los errores ----------

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

// ---------- 4. Validacion del formulario completo ----------

const validarRegistro = () => {
  let form = document.forms["formRegistro"];
  let nombre = form["nombre"].value;
  let email = form["email"].value;
  let celular = form["celular"].value;
  let region = form["region"].value;
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
  if (!validarSeleccion(region)) {
    errores.push("Región: debe seleccionar una región.");
  }
  if (!validarSeleccion(comuna)) {
    errores.push("Comuna: debe seleccionar una comuna.");
  }

  if (errores.length > 0) {
    mostrarErrores(errores);
  } else {
    // NUEVO en la tarea 2: se envia el formulario a Flask (POST /registro)
    form.submit();
  }
};

// ---------- 5. Conectar los eventos ----------

document.getElementById("region").addEventListener("change", actualizarComunas);
document.getElementById("boton-registrar").addEventListener("click", validarRegistro);

poblarRegiones();
