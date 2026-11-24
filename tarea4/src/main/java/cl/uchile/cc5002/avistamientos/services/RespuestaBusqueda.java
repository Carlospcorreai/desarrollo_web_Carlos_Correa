package cl.uchile.cc5002.avistamientos.services;

import java.util.List;

// total: cuantos avistamientos calzan; resultados: los que se muestran (maximo 50)
public record RespuestaBusqueda(String consulta, long total, List<ResultadoBusqueda> resultados) {
}
