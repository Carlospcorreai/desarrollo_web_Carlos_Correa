// listado.js
// Hace que toda la fila de la tabla sea clickeable.
// Cada <tr> trae en data-url la direccion del detalle, generada por Flask.

let filas = document.getElementsByClassName("fila");

for (const fila of filas) {
  fila.addEventListener("click", () => {
    window.location.href = fila.dataset.url;
  });
}
