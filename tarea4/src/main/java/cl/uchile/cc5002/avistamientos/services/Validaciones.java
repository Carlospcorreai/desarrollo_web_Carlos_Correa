package cl.uchile.cc5002.avistamientos.services;

import java.util.List;
import java.util.regex.Pattern;

// Validaciones del servidor. Se repiten aunque el navegador ya valido,
// porque cualquiera puede llamar a la API sin pasar por el JavaScript.
public final class Validaciones {

    public static final int NOTA_MINIMA = 1;
    public static final int NOTA_MAXIMA = 7;
    public static final int LARGO_MAXIMO_BUSQUEDA = 100;

    // Exactamente un digito entre 1 y 7. Rechaza "5.5", "5,0", "05", "+5", "abc", "0", "8", "".
    private static final Pattern NOTA_VALIDA = Pattern.compile("[1-7]");

    private Validaciones() {
    }

    public static int validarNota(String texto) {
        if (texto == null || !NOTA_VALIDA.matcher(texto.trim()).matches()) {
            throw new DatosInvalidosException(List.of(
                    "La nota debe ser un número entero entre " + NOTA_MINIMA + " y " + NOTA_MAXIMA + "."));
        }
        return Integer.parseInt(texto.trim());
    }

    public static String validarBusqueda(String texto) {
        String limpio = texto == null ? "" : texto.trim();
        if (limpio.length() > LARGO_MAXIMO_BUSQUEDA) {
            throw new DatosInvalidosException(List.of(
                    "La búsqueda puede tener como máximo " + LARGO_MAXIMO_BUSQUEDA + " caracteres."));
        }
        return limpio;
    }

    // Arma el patron de LIKE. Sin escapar, buscar "%" o "_" calzaria con todo.
    public static String patronLike(String texto) {
        String escapado = texto.replace("!", "!!").replace("%", "!%").replace("_", "!_");
        return "%" + escapado + "%";
    }
}
