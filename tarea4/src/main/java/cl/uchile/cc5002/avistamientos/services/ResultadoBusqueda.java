package cl.uchile.cc5002.avistamientos.services;

// Una fila del buscador, tal como se envia en el JSON.
// promedio es null si el avistamiento aun no tiene notas (la pagina muestra "-").
public record ResultadoBusqueda(
        Integer id,
        String voluntario,
        String fecha,       // ISO, para el atributo datetime de <time>
        String fechaTexto,  // dd-MM-yyyy HH:mm, igual que en el listado de la tarea 2
        String ave,
        String comuna,
        Double promedio,
        long cantidadNotas) {
}
