package cl.uchile.cc5002.avistamientos.services;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.NullSource;
import org.junit.jupiter.params.provider.ValueSource;

// Pruebas de las validaciones del servidor (no necesitan base de datos): mvn test
class ValidacionesTest {

    @ParameterizedTest
    @ValueSource(strings = {"1", "4", "7", " 5 "})
    void aceptaEnterosEntre1y7(String nota) {
        int valor = Validaciones.validarNota(nota);
        assertEquals(Integer.parseInt(nota.trim()), valor);
    }

    @ParameterizedTest
    @NullSource
    @ValueSource(strings = {"", " ", "0", "8", "-1", "5.5", "5,0", "5.0", "05", "+5", "abc", "1e0", "７", "10"})
    void rechazaTodoLoDemas(String nota) {
        assertThrows(DatosInvalidosException.class, () -> Validaciones.validarNota(nota));
    }

    @Test
    void escapaComodinesDeLike() {
        assertEquals("%100!%!_raro!!%", Validaciones.patronLike("100%_raro!"));
    }

    @Test
    void recortaLaBusquedaYLimitaElLargo() {
        assertEquals("aguila", Validaciones.validarBusqueda("  aguila "));
        assertEquals("", Validaciones.validarBusqueda(null));
        assertThrows(DatosInvalidosException.class, () -> Validaciones.validarBusqueda("a".repeat(101)));
    }
}
