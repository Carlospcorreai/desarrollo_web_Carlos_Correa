package cl.uchile.cc5002.avistamientos.services;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import cl.uchile.cc5002.avistamientos.models.Avistamiento;
import cl.uchile.cc5002.avistamientos.models.AvistamientoRepository;
import cl.uchile.cc5002.avistamientos.models.Nota;
import cl.uchile.cc5002.avistamientos.models.NotaRepository;
import cl.uchile.cc5002.avistamientos.models.ResumenNotas;

@Service
public class NotaService {

    private final AvistamientoRepository avistamientoRepository;
    private final NotaRepository notaRepository;

    public NotaService(AvistamientoRepository avistamientoRepository, NotaRepository notaRepository) {
        this.avistamientoRepository = avistamientoRepository;
        this.notaRepository = notaRepository;
    }

    // Guarda la nota y devuelve el promedio recalculado con todas las notas del avistamiento.
    // Todo ocurre en una transaccion: si algo falla no queda una nota a medias.
    @Transactional
    public ResumenNota agregarNota(Integer avistamientoId, String textoNota) {
        int valor = Validaciones.validarNota(textoNota);

        Avistamiento avistamiento = avistamientoRepository.findById(avistamientoId)
                .orElseThrow(() -> new AvistamientoNoEncontradoException(avistamientoId));

        notaRepository.saveAndFlush(new Nota(avistamiento, valor));

        // el promedio sale de la base de datos (AVG), ya incluyendo la nota recien insertada
        List<ResumenNotas> resumen = notaRepository.resumenPorAvistamiento(List.of(avistamientoId));
        ResumenNotas r = resumen.get(0);
        return new ResumenNota(avistamientoId, r.getPromedio(), r.getCantidad());
    }
}
