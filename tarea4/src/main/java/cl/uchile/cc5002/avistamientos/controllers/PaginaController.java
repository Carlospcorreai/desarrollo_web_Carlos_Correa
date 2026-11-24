package cl.uchile.cc5002.avistamientos.controllers;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;

// Entrega el HTML. Los datos se piden despues con fetch a ApiController.
@Controller
public class PaginaController {

    private final String flaskUrl;

    public PaginaController(@Value("${app.flask-url}") String flaskUrl) {
        this.flaskUrl = flaskUrl;
    }

    @GetMapping({"/", "/buscador"})
    public String buscador(Model model) {
        model.addAttribute("flaskUrl", flaskUrl);
        return "buscador";
    }
}
