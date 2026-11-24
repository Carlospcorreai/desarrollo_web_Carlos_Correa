package cl.uchile.cc5002.avistamientos.services;

import java.util.List;

public class DatosInvalidosException extends RuntimeException {

    private final List<String> errores;

    public DatosInvalidosException(List<String> errores) {
        super(String.join(" ", errores));
        this.errores = errores;
    }

    public List<String> getErrores() {
        return errores;
    }
}
