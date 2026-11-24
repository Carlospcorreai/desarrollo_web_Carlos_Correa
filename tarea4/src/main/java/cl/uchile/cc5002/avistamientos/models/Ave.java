package cl.uchile.cc5002.avistamientos.models;

import org.hibernate.annotations.Immutable;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

// Tabla de la tarea 2. Esta aplicacion solo la lee (@Immutable).
@Entity
@Immutable
@Table(name = "ave")
public class Ave {

    @Id
    private Integer id;

    private String nombre;

    protected Ave() {
    }

    public Integer getId() {
        return id;
    }

    public String getNombre() {
        return nombre;
    }
}
