package cl.uchile.cc5002.avistamientos.models;

// Proyeccion de Spring Data: promedio y cantidad de notas de un avistamiento
public interface ResumenNotas {

    Integer getAvistamientoId();

    Double getPromedio();

    Long getCantidad();
}
