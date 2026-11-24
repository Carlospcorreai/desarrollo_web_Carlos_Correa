// estadisticas.js
// 1. Pide los datos a Flask con fetch (GET /estadisticas/datos).
// 2. Con la respuesta dibuja 3 graficos con Highcharts.
//
// Flask responde un JSON asi:
// {
//   "por_dia":    [["2026-09-28", 2], ["2026-09-30", 1], ...],
//   "por_ave":    [["Aguila", 3], ["Aguilucho", 1], ...],
//   "por_comuna": [["Santiago", 4], ["Tiltil", 1], ...]
// }

let URL_DATOS = document.getElementById("estadisticas").dataset.url;

// ---------- 1. Grafico de lineas: avistamientos por dia ----------

const graficoPorDia = (datos) => {
  // "2026-09-28" -> fecha en milisegundos, que es lo que usa el eje "datetime"
  // (igual que en la Auxiliar 8)
  let puntos = datos.map((fila) => {
    const [anio, mes, dia] = fila[0].split("-").map((parte) => parseInt(parte, 10));
    return [Date.UTC(anio, mes - 1, dia), fila[1]]; // en JavaScript los meses parten en 0
  });

  Highcharts.chart("grafico-dia", {
    chart: { type: "line" },
    title: { text: "Avistamientos por día" },
    xAxis: {
      type: "datetime",
      title: { text: "Día" },
    },
    yAxis: {
      title: { text: "Cantidad de avistamientos" },
      allowDecimals: false,
    },
    series: [
      {
        name: "Avistamientos",
        data: puntos,
        marker: { enabled: true },
      },
    ],
  });
};

// ---------- 2. Grafico de torta: avistamientos por ave ----------

const graficoPorAve = (datos) => {
  Highcharts.chart("grafico-ave", {
    chart: { type: "pie" },
    title: { text: "Avistamientos por ave" },
    tooltip: { pointFormat: "{point.y} avistamiento(s) ({point.percentage:.1f}%)" },
    series: [
      {
        name: "Avistamientos",
        data: datos, // pares [nombre, cantidad]: Highcharts los entiende directo
      },
    ],
  });
};

// ---------- 3. Grafico de barras: voluntarios por comuna ----------

const graficoPorComuna = (datos) => {
  let comunas = datos.map((fila) => fila[0]);
  let cantidades = datos.map((fila) => fila[1]);

  Highcharts.chart("grafico-comuna", {
    chart: { type: "column" },
    title: { text: "Voluntarios por comuna" },
    xAxis: {
      categories: comunas,
      title: { text: "Comuna" },
    },
    yAxis: {
      title: { text: "Cantidad de voluntarios" },
      allowDecimals: false,
    },
    legend: { enabled: false },
    series: [
      {
        name: "Voluntarios",
        data: cantidades,
      },
    ],
  });
};

// ---------- 4. Pedir los datos y dibujar ----------

fetch(URL_DATOS)
  .then((response) => {
    if (!response.ok) {
      throw new Error("El servidor respondio " + response.status);
    }
    return response.json();
  })
  .then((data) => {
    graficoPorDia(data.por_dia);
    graficoPorAve(data.por_ave);
    graficoPorComuna(data.por_comuna);

    let estado = document.getElementById("estado-graficos");
    if (data.por_dia.length === 0) {
      estado.textContent = "Aún no hay avistamientos registrados.";
    } else {
      estado.hidden = true;
    }
  })
  .catch((error) => {
    console.error("Error:", error);
    document.getElementById("estado-graficos").textContent =
      "No se pudieron cargar los datos de las estadísticas.";
  });
