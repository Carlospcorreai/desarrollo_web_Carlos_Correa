package cl.uchile.cc5002.avistamientos.models;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

// Tabla nueva de la tarea 4 (database/tabla-nota.sql). Cada fila es una evaluacion.
@Entity
@Table(name = "nota")
public class Nota {

    // IDENTITY usa el AUTO_INCREMENT de MySQL
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "avistamiento_id")
    private Avistamiento avistamiento;

    // la columna se llama "nota"; en Java le puse "valor" para no confundirla con la clase
    @Column(name = "nota", nullable = false)
    private Integer valor;

    protected Nota() {
    }

    public Nota(Avistamiento avistamiento, Integer valor) {
        this.avistamiento = avistamiento;
        this.valor = valor;
    }

    public Integer getId() {
        return id;
    }

    public Avistamiento getAvistamiento() {
        return avistamiento;
    }

    public Integer getValor() {
        return valor;
    }
}
