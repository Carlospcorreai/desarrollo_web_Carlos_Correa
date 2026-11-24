package cl.uchile.cc5002.avistamientos.controllers;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;

import cl.uchile.cc5002.avistamientos.services.AvistamientoNoEncontradoException;
import cl.uchile.cc5002.avistamientos.services.BuscadorService;
import cl.uchile.cc5002.avistamientos.services.DatosInvalidosException;
import cl.uchile.cc5002.avistamientos.services.NotaService;
import cl.uchile.cc5002.avistamientos.services.RespuestaBusqueda;
import cl.uchile.cc5002.avistamientos.services.ResumenNota;

// API JSON que usa buscador.js. Mismo formato que en la tarea 3:
// {"status": "ok", ...} o {"status": "error", "errores": [...]}
@RestController
@RequestMapping("/api/avistamientos")
public class ApiController {

    private final BuscadorService buscadorService;
    private final NotaService notaService;

    public ApiController(BuscadorService buscadorService, NotaService notaService) {
        this.buscadorService = buscadorService;
        this.notaService = notaService;
    }

    // GET /api/avistamientos/buscar?q=texto
    @GetMapping("/buscar")
    public Map<String, Object> buscar(@RequestParam(name = "q", required = false) String q) {
        RespuestaBusqueda respuesta = buscadorService.buscar(q);
        Map<String, Object> json = new LinkedHashMap<>();
        json.put("status", "ok");
        json.put("consulta", respuesta.consulta());
        json.put("total", respuesta.total());
        json.put("resultados", respuesta.resultados());
        return json;
    }

    // POST /api/avistamientos/{id}/notas con el campo "nota" (FormData)
    // required = false: si falta el campo, la validacion responde con nuestro mensaje en vez del error de Spring
    @PostMapping("/{id}/notas")
    public ResponseEntity<Map<String, Object>> agregarNota(
            @PathVariable("id") Integer id,
            @RequestParam(name = "nota", required = false) String nota) {
        ResumenNota resumen = notaService.agregarNota(id, nota);
        Map<String, Object> json = new LinkedHashMap<>();
        json.put("status", "ok");
        json.put("avistamientoId", resumen.avistamientoId());
        json.put("promedio", resumen.promedio());
        json.put("cantidad", resumen.cantidad());
        return ResponseEntity.status(HttpStatus.CREATED).body(json);
    }

    // ----- errores: siempre JSON, con el codigo HTTP que corresponde -----

    @ExceptionHandler(DatosInvalidosException.class)
    public ResponseEntity<Map<String, Object>> datosInvalidos(DatosInvalidosException e) {
        return error(HttpStatus.BAD_REQUEST, e.getErrores());
    }

    @ExceptionHandler(AvistamientoNoEncontradoException.class)
    public ResponseEntity<Map<String, Object>> noEncontrado(AvistamientoNoEncontradoException e) {
        return error(HttpStatus.NOT_FOUND, List.of(e.getMessage()));
    }

    // por ejemplo /api/avistamientos/abc/notas
    @ExceptionHandler(MethodArgumentTypeMismatchException.class)
    public ResponseEntity<Map<String, Object>> idInvalido(MethodArgumentTypeMismatchException e) {
        return error(HttpStatus.BAD_REQUEST, List.of("El identificador del avistamiento no es válido."));
    }

    private ResponseEntity<Map<String, Object>> error(HttpStatus codigo, List<String> errores) {
        Map<String, Object> json = new LinkedHashMap<>();
        json.put("status", "error");
        json.put("errores", errores);
        return ResponseEntity.status(codigo).body(json);
    }
}
