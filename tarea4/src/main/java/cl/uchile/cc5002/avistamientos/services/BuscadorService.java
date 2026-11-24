package cl.uchile.cc5002.avistamientos.services;

import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import cl.uchile.cc5002.avistamientos.models.Avistamiento;
import cl.uchile.cc5002.avistamientos.models.AvistamientoRepository;
import cl.uchile.cc5002.avistamientos.models.NotaRepository;
import cl.uchile.cc5002.avistamientos.models.ResumenNotas;

@Service
public class BuscadorService {

    // Con una sola letra pueden calzar casi todos los avistamientos; se muestran los 50 mas recientes
    public static final int MAXIMO_RESULTADOS = 50;

    private static final DateTimeFormatter FORMATO_FECHA = DateTimeFormatter.ofPattern("dd-MM-yyyy HH:mm");

    private final AvistamientoRepository avistamientoRepository;
    private final NotaRepository notaRepository;

    public BuscadorService(AvistamientoRepository avistamientoRepository, NotaRepository notaRepository) {
        this.avistamientoRepository = avistamientoRepository;
        this.notaRepository = notaRepository;
    }

    @Transactional(readOnly = true)
    public RespuestaBusqueda buscar(String texto) {
        String consulta = Validaciones.validarBusqueda(texto);
        if (consulta.isEmpty()) {
            return new RespuestaBusqueda(consulta, 0, List.of());
        }

        Page<Avistamiento> pagina = avistamientoRepository.buscar(
                Validaciones.patronLike(consulta), PageRequest.of(0, MAXIMO_RESULTADOS));

        // promedios de todas las filas en una sola consulta
        List<Integer> ids = pagina.getContent().stream().map(Avistamiento::getId).toList();
        Map<Integer, ResumenNotas> resumenes = new HashMap<>();
        if (!ids.isEmpty()) {
            for (ResumenNotas r : notaRepository.resumenPorAvistamiento(ids)) {
                resumenes.put(r.getAvistamientoId(), r);
            }
        }

        List<ResultadoBusqueda> resultados = new ArrayList<>();
        for (Avistamiento a : pagina.getContent()) {
            ResumenNotas r = resumenes.get(a.getId());
            resultados.add(new ResultadoBusqueda(
                    a.getId(),
                    a.getVoluntario().getNombre(),
                    a.getFechaHora().toString(),
                    a.getFechaHora().format(FORMATO_FECHA),
                    a.getAve().getNombre(),
                    a.getVoluntario().getComuna().getNombre(),
                    r == null ? null : r.getPromedio(),
                    r == null ? 0 : r.getCantidad()));
        }
        return new RespuestaBusqueda(consulta, pagina.getTotalElements(), resultados);
    }
}
