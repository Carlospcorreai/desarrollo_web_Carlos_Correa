package cl.uchile.cc5002.avistamientos.models;

import org.hibernate.annotations.Immutable;

import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

// Tabla de la tarea 2. Solo se mapean las columnas que usa el buscador.
@Entity
@Immutable
@Table(name = "voluntario")
public class Voluntario {

    @Id
    private Integer id;

    private String nombre;

    // El avistamiento no guarda comuna: la comuna es la del voluntario que lo informo
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "comuna_id")
    private Comuna comuna;

    protected Voluntario() {
    }

    public Integer getId() {
        return id;
    }

    public String getNombre() {
        return nombre;
    }

    public Comuna getComuna() {
        return comuna;
    }
}
