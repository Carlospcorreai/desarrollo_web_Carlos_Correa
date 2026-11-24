// buscador.js
// Buscador de avistamientos y evaluacion con notas, SIN recargar la pagina (fetch).
//  - GET  /api/avistamientos/buscar?q=texto -> {"status": "ok", "total": n, "resultados": [...]}
//  - POST /api/avistamientos/<id>/notas     -> {"status": "ok", "promedio": x, "cantidad": n}
//                                              o {"status": "error", "errores": [...]}

const URL_BUSCAR = "/api/avistamientos/buscar";
const ESPERA_MS = 250; // se espera a que el usuario haga una pausa antes de consultar
const NOTA_MINIMA = 1;
const NOTA_MAXIMA = 7;

let inputBuscar = document.getElementById("buscar");
let estado = document.getElementById("estado");
let tabla = document.getElementById("tabla-resultados");
let cuerpo = document.getElementById("cuerpo-resultados");
let avisoNota = document.getElementById("aviso-nota");

let dialogo = document.getElementById("dialogo-nota");
let formNota = document.forms["formNota"];
let cajaErrorNota = document.getElementById("nota-error");

let temporizador = null;      // para esperar la pausa al escribir
let controlador = null;       // AbortController de la busqueda en curso
let avistamientoActual = null; // el que se esta evaluando en el dialogo

// ---------- 1. Resaltar el texto que calza ----------

// MySQL compara sin mayusculas ni tildes ("nunoa" encuentra "Ñuñoa"), asi que el
// resaltado tambien tiene que ignorarlas. Se normaliza letra por letra y se guarda de
// que posicion del texto original viene cada letra normalizada.
const normalizar = (letra) =>
  letra.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

const resaltar = (texto, consulta) => {
  let fragmento = document.createDocumentFragment();
  let buscado = Array.from(consulta).map(normalizar).join("");
  if (buscado === "") {
    fragmento.append(texto);
    return fragmento;
  }

  let normalizado = "";
  let inicios = []; // inicios[k]: posicion en "texto" de la letra normalizada k
  let finales = [];
  let posicion = 0;
  for (const letra of texto) {
    for (const parte of normalizar(letra)) {
      normalizado += parte;
      inicios.push(posicion);
      finales.push(posicion + letra.length);
    }
    posicion += letra.length;
  }

  let ultimo = 0; // hasta donde ya se agrego texto original
  let k = normalizado.indexOf(buscado);
  while (k !== -1) {
    let desde = inicios[k];
    let hasta = finales[k + buscado.length - 1];
    fragmento.append(texto.slice(ultimo, desde));
    let marca = document.createElement("mark");
    marca.textContent = texto.slice(desde, hasta); // textContent: nunca se interpreta como HTML
    fragmento.append(marca);
    ultimo = hasta;
    k = normalizado.indexOf(buscado, k + buscado.length);
  }
  fragmento.append(texto.slice(ultimo));
  return fragmento;
};

// ---------- 2. Mostrar la nota promedio ----------

const textoPromedio = (promedio) =>
  // formato chileno con coma decimal: 5,3
  promedio.toLocaleString("es-CL", { minimumFractionDigits: 1, maximumFractionDigits: 1 });

const dibujarNota = (celda, promedio, cantidad) => {
  celda.textContent = "";
  if (promedio === null || cantidad === 0) {
    celda.append("-"); // aun no evaluado
    return;
  }
  celda.append(textoPromedio(promedio));
  let detalle = document.createElement("span");
  detalle.className = "nota-cantidad";
  detalle.textContent = cantidad === 1 ? "1 nota" : cantidad + " notas";
  celda.append(detalle);
};

// ---------- 3. Dibujar los resultados ----------

const celdaConTexto = (texto, consulta) => {
  let td = document.createElement("td");
  td.append(resaltar(texto, consulta));
  return td;
};

const dibujarResultados = (data) => {
  cuerpo.textContent = "";

  if (data.resultados.length === 0) {
    tabla.hidden = true;
    estado.textContent = "No se encontraron avistamientos para «" + data.consulta + "».";
    return;
  }

  for (const av of data.resultados) {
    let fila = document.createElement("tr");

    fila.append(celdaConTexto(av.voluntario, data.consulta));

    let tdFecha = document.createElement("td");
    let fecha = document.createElement("time");
    fecha.dateTime = av.fecha;
    // dia y hora en partes separadas: en pantallas chicas se corta entre ellas y no dentro de la fecha
    let [dia, hora] = av.fechaTexto.split(" ");
    let spanDia = document.createElement("span");
    spanDia.className = "fecha-dia";
    spanDia.textContent = dia;
    let spanHora = document.createElement("span");
    spanHora.className = "fecha-hora";
    spanHora.textContent = hora;
    fecha.append(spanDia, " ", spanHora);
    tdFecha.append(fecha);
    fila.append(tdFecha);

    fila.append(celdaConTexto(av.ave, data.consulta));
    fila.append(celdaConTexto(av.comuna, data.consulta));

    let tdNota = document.createElement("td");
    tdNota.className = "nota";
    tdNota.dataset.avistamiento = av.id; // para encontrar la celda despues de evaluar
    dibujarNota(tdNota, av.promedio, av.cantidadNotas);
    fila.append(tdNota);

    let tdBoton = document.createElement("td");
    let boton = document.createElement("button");
    boton.type = "button";
    boton.textContent = "Evaluar";
    boton.setAttribute("aria-label", "Evaluar avistamiento de " + av.ave + " del " + av.fechaTexto);
    boton.addEventListener("click", () => abrirDialogo(av));
    tdBoton.append(boton);
    fila.append(tdBoton);

    cuerpo.append(fila);
  }

  tabla.hidden = false;
  if (data.total > data.resultados.length) {
    estado.textContent = "Se encontraron " + data.total + " avistamientos. Se muestran los "
      + data.resultados.length + " más recientes; escribe más letras para acotar la búsqueda.";
  } else {
    estado.textContent = data.total === 1
      ? "Se encontró 1 avistamiento."
      : "Se encontraron " + data.total + " avistamientos.";
  }
};

// ---------- 4. Buscar (llamada asincrona) ----------

const buscar = (consulta) => {
  // si todavia hay una busqueda en curso, se cancela: asi una respuesta lenta y antigua
  // no reemplaza a la de lo ultimo que se escribio
  if (controlador) {
    controlador.abort();
  }
  controlador = new AbortController();

  fetch(URL_BUSCAR + "?q=" + encodeURIComponent(consulta), { signal: controlador.signal })
    .then((response) => response.json())
    .then((data) => {
      if (data.status === "ok") {
        dibujarResultados(data);
      } else {
        tabla.hidden = true;
        estado.textContent = data.errores.join(" ");
      }
    })
    .catch((error) => {
      if (error.name === "AbortError") return; // se cancelo a proposito
      console.error("Error al buscar:", error);
      tabla.hidden = true;
      estado.textContent = "No se pudo realizar la búsqueda. Intente de nuevo.";
    });
};

const alEscribir = () => {
  clearTimeout(temporizador);
  if (controlador) controlador.abort(); // la respuesta de un texto anterior ya no sirve
  avisoNota.hidden = true;
  let consulta = inputBuscar.value.trim(); // el servidor tambien quita los espacios de los extremos

  if (consulta === "") {
    cuerpo.textContent = "";
    tabla.hidden = true;
    estado.textContent = "Escribe para buscar.";
    return;
  }

  estado.textContent = "Buscando…";
  temporizador = setTimeout(() => buscar(consulta), ESPERA_MS);
};

// ---------- 5. Evaluar con una nota ----------

const mostrarErrorNota = (errores) => {
  cajaErrorNota.textContent = errores.join(" ");
  cajaErrorNota.hidden = false;
};

const abrirDialogo = (av) => {
  avistamientoActual = av;
  formNota.reset();
  cajaErrorNota.hidden = true;
  document.getElementById("dialogo-detalle").textContent =
    av.ave + ", visto por " + av.voluntario + " (" + av.comuna + ") el " + av.fechaTexto + ".";
  dialogo.showModal();
};

// misma regla que Validaciones.java: entero entre 1 y 7
const validarNota = (valor) => /^[1-7]$/.test(valor);

const enviarNota = (evento) => {
  evento.preventDefault(); // el envio lo hace fetch, no el formulario

  let seleccionada = formNota.querySelector("input[name='nota']:checked");
  let valor = seleccionada ? seleccionada.value : "";

  // a) primero se valida en el navegador
  if (!validarNota(valor)) {
    mostrarErrorNota(["Selecciona una nota entera entre " + NOTA_MINIMA + " y " + NOTA_MAXIMA + "."]);
    return;
  }

  let id = avistamientoActual.id;
  let datos = new FormData();
  datos.append("nota", valor);

  let botonGuardar = document.getElementById("boton-guardar");
  botonGuardar.disabled = true; // evita guardar dos veces con doble clic

  // b) se envia al servidor, que vuelve a validar y responde el promedio nuevo
  fetch("/api/avistamientos/" + encodeURIComponent(id) + "/notas", { method: "POST", body: datos })
    .then((response) => response.json())
    .then((data) => {
      if (data.status === "ok") {
        dialogo.close();
        let celda = cuerpo.querySelector("td[data-avistamiento='" + id + "']");
        if (celda) {
          dibujarNota(celda, data.promedio, data.cantidad);
          celda.classList.add("nota-actualizada");
          setTimeout(() => celda.classList.remove("nota-actualizada"), 2000);
        }
        avisoNota.textContent = "Nota " + valor + " guardada para " + avistamientoActual.ave
          + ". Nuevo promedio: " + textoPromedio(data.promedio) + ".";
        avisoNota.hidden = false;
      } else {
        mostrarErrorNota(data.errores);
      }
    })
    .catch((error) => {
      console.error("Error al guardar la nota:", error);
      mostrarErrorNota(["No se pudo guardar la nota. Intente de nuevo."]);
    })
    .finally(() => {
      botonGuardar.disabled = false;
    });
};

// ---------- 6. Eventos ----------

inputBuscar.addEventListener("input", alEscribir);

// Enter en el buscador no debe recargar la pagina
document.getElementById("form-buscador").addEventListener("submit", (evento) => {
  evento.preventDefault();
  clearTimeout(temporizador);
  let consulta = inputBuscar.value.trim();
  if (consulta !== "") buscar(consulta);
});

formNota.addEventListener("submit", enviarNota);
document.getElementById("boton-cancelar").addEventListener("click", () => dialogo.close());

// si el navegador recuerda el texto al volver atras, se busca de nuevo
if (inputBuscar.value.trim() !== "") {
  alEscribir();
}
