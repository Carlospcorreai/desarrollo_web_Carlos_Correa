// estadisticas.js
// Calcula los indicadores y dibuja graficos de barras con JavaScript.

// ---------- 1. Contar avistamientos por tipo de ave ----------

const contarPorTipo = () => {
  let conteo = {};
  for (const tipo of TIPOS_AVE) {
    conteo[tipo] = 0;
  }
  for (const av of AVISTAMIENTOS) {
    conteo[av.tipo] = conteo[av.tipo] + 1;
  }
  return conteo;
};

// ---------- 2. Dibujar un grafico de barras ----------
// Cada barra es un <li> con una etiqueta y un <span> cuyo ancho
// se calcula como un porcentaje del valor mas grande.

const dibujarGrafico = (idLista, datos) => {
  let lista = document.getElementById(idLista);
  lista.textContent = "";

  // buscamos el valor maximo para escalar las barras
  let maximo = 0;
  for (const clave in datos) {
    if (datos[clave] > maximo) {
      maximo = datos[clave];
    }
  }
  if (maximo === 0) {
    maximo = 1;
  }

  for (const clave in datos) {
    let item = document.createElement("li");

    let etiqueta = document.createElement("span");
    etiqueta.className = "etiqueta";
    etiqueta.textContent = clave;

    let barra = document.createElement("span");
    barra.className = "barra";
    barra.style.width = (datos[clave] / maximo) * 100 + "%";
    barra.textContent = datos[clave];

    item.appendChild(etiqueta);
    item.appendChild(barra);
    lista.appendChild(item);
  }
};

// ---------- 3. Calcular los indicadores ----------

const calcularIndicadores = () => {
  let conteoTipos = contarPorTipo();

  // total de voluntarios sumando las regiónes
  let totalVoluntarios = 0;
  for (const región in VOLUNTARIOS) {
    totalVoluntarios = totalVoluntarios + VOLUNTARIOS[región];
  }

  // tipo de ave con mas avistamientos
  let tipoFrecuente = "";
  let maximo = -1;
  for (const tipo in conteoTipos) {
    if (conteoTipos[tipo] > maximo) {
      maximo = conteoTipos[tipo];
      tipoFrecuente = tipo;
    }
  }

  document.getElementById("total-avistamientos").textContent = AVISTAMIENTOS.length;
  document.getElementById("total-voluntarios").textContent = totalVoluntarios;
  document.getElementById("tipo-frecuente").textContent = tipoFrecuente;

  dibujarGrafico("grafico-aves", conteoTipos);
  dibujarGrafico("grafico-voluntarios", VOLUNTARIOS);
};

calcularIndicadores();
