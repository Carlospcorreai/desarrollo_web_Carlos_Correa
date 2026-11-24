package cl.uchile.cc5002.avistamientos.models;

import java.util.Collection;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface NotaRepository extends JpaRepository<Nota, Integer> {

    // Un solo GROUP BY para todos los avistamientos del listado. El promedio lo calcula MySQL.
    @Query("""
            SELECT n.avistamiento.id AS avistamientoId, AVG(n.valor) AS promedio, COUNT(n) AS cantidad
            FROM Nota n
            WHERE n.avistamiento.id IN :ids
            GROUP BY n.avistamiento.id
            """)
    List<ResumenNotas> resumenPorAvistamiento(@Param("ids") Collection<Integer> ids);
}
