package cl.uchile.cc5002.avistamientos.services;

public class AvistamientoNoEncontradoException extends RuntimeException {

    public AvistamientoNoEncontradoException(Integer id) {
        super("No existe el avistamiento " + id + ".");
    }
}
