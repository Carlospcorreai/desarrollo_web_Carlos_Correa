// listado.js
// Filtra, ordena y página la lista de avistamientos.

const POR_PAGINA = 5;
let páginaActual = 1;

// ---------- 1. Poblar el filtro de tipo de ave ----------

const poblarFiltro = () => {
  let selectFiltro = document.getElementById("filtro-tipo");
  for (const tipo of TIPOS_AVE) {
    let opcion = document.createElement("option");
    opcion.value = tipo;
    opcion.text = tipo;
    selectFiltro.appendChild(opcion);
  }
};

// ---------- 2. Filtrar y ordenar ----------

const obtenerFiltrados = () => {
  let tipo = document.getElementById("filtro-tipo").value;
  let orden = document.getElementById("orden").value;

  // copia de la lista original para no modificarla
  let lista = [];
  for (const av of AVISTAMIENTOS) {
    if (tipo === "" || av.tipo === tipo) {
      lista.push(av);
    }
  }

  if (orden === "fecha") {
    lista.sort((a, b) => b.fecha.localeCompare(a.fecha));
  } else if (orden === "lugar") {
    lista.sort((a, b) => a.lugar.localeCompare(b.lugar));
  } else {
    lista.sort((a, b) => a.nombre.localeCompare(b.nombre));
  }

  return lista;
};

// ---------- 3. Dibujar la página actual ----------

const dibujarTabla = () => {
  let lista = obtenerFiltrados();
  let totalPáginas = Math.ceil(lista.length / POR_PAGINA);
  if (totalPáginas === 0) {
    totalPáginas = 1;
  }
  if (páginaActual > totalPáginas) {
    páginaActual = totalPáginas;
  }

  // los elementos que corresponden a esta página
  let desde = (páginaActual - 1) * POR_PAGINA;
  let hasta = desde + POR_PAGINA;

  let cuerpo = document.getElementById("cuerpo-tabla");
  cuerpo.textContent = "";

  for (let i = desde; i < hasta && i < lista.length; i++) {
    let av = lista[i];
    let fila = document.createElement("tr");

    // se crea una celda por cada dato del avistamiento
    for (const dato of [av.tipo, av.nombre, av.lugar, av.fecha, av.hora]) {
      let celda = document.createElement("td");
      celda.textContent = dato;
      fila.appendChild(celda);
    }

    cuerpo.appendChild(fila);
  }

  document.getElementById("resumen").textContent =
    "Avistamientos encontrados: " + lista.length;
  document.getElementById("indicador-página").textContent =
    "Página " + páginaActual + " de " + totalPáginas;

  // se desactivan los botones cuando no hay página anterior o siguiente
  document.getElementById("boton-anterior").disabled = páginaActual === 1;
  document.getElementById("boton-siguiente").disabled = páginaActual === totalPáginas;
};

// ---------- 4. Eventos ----------

const cambiarFiltro = () => {
  páginaActual = 1;
  dibujarTabla();
};

document.getElementById("filtro-tipo").addEventListener("change", cambiarFiltro);
document.getElementById("orden").addEventListener("change", cambiarFiltro);

document.getElementById("boton-anterior").addEventListener("click", () => {
  páginaActual = páginaActual - 1;
  dibujarTabla();
});

document.getElementById("boton-siguiente").addEventListener("click", () => {
  páginaActual = páginaActual + 1;
  dibujarTabla();
});

poblarFiltro();
dibujarTabla();
