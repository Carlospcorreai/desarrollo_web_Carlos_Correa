package cl.uchile.cc5002.avistamientos.services;

// Respuesta al guardar una nota: el promedio recalculado por la base de datos
public record ResumenNota(Integer avistamientoId, Double promedio, long cantidad) {
}
