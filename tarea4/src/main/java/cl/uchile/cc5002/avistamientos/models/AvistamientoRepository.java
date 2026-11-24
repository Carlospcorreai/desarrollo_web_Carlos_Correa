package cl.uchile.cc5002.avistamientos.models;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface AvistamientoRepository extends JpaRepository<Avistamiento, Integer> {

    // Busca en la base de datos (no en memoria). El patron llega ya armado como %texto%
    // y con los caracteres % y _ escapados con '!'. JOIN FETCH trae voluntario, comuna y
    // ave en la misma consulta, asi no se hace una consulta extra por cada fila.
    // La base usa collation utf8_general_ci, por lo que LIKE no distingue mayusculas ni tildes.
    @Query(value = """
            SELECT a FROM Avistamiento a
            JOIN FETCH a.voluntario v
            JOIN FETCH v.comuna c
            JOIN FETCH a.ave e
            WHERE e.nombre LIKE :patron ESCAPE '!'
               OR v.nombre LIKE :patron ESCAPE '!'
               OR c.nombre LIKE :patron ESCAPE '!'
            ORDER BY a.fechaHora DESC, a.id DESC
            """,
            countQuery = """
            SELECT COUNT(a) FROM Avistamiento a
            JOIN a.voluntario v
            JOIN v.comuna c
            JOIN a.ave e
            WHERE e.nombre LIKE :patron ESCAPE '!'
               OR v.nombre LIKE :patron ESCAPE '!'
               OR c.nombre LIKE :patron ESCAPE '!'
            """)
    Page<Avistamiento> buscar(@Param("patron") String patron, Pageable pageable);
}
