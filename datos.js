// datos.js
// Datos de ejemplo del prototipo. No hay servidor ni base de datos:
// todo vive en estas variables mientras la página está abierta.

// Regiones con sus comunas (misma idea del objeto "data" de la Auxiliar 3).
const REGIONES = {
  "Arica y Parinacota": ["Arica", "Camarones", "Putre"],
  "Valparaíso": ["Valparaíso", "Viña del Mar", "Quintero", "La Ligua"],
  "Metropolitana": ["Santiago", "Providencia", "Maipú", "Lo Barnechea"],
  "Los Lagos": ["Puerto Montt", "Castro", "Ancud"],
  "Magallanes": ["Punta Arenas", "Puerto Natales", "Porvenir"]
};

// Tipos de ave que ofrece el sistema.
const TIPOS_AVE = ["Rapaz", "Marina", "Acuática", "Paseriforme", "Picaflor"];

// Avistamientos ya cargados (los usan listado.js y estadisticas.js).
const AVISTAMIENTOS = [
  { tipo: "Rapaz", nombre: "Cóndor andino", lugar: "Farellones", fecha: "2026-08-23", hora: "11:15" },
  { tipo: "Picaflor", nombre: "Picaflor de Arica", lugar: "Arica", fecha: "2026-08-24", hora: "07:40" },
  { tipo: "Marina", nombre: "Pingüino de Humboldt", lugar: "Isla Damas", fecha: "2026-08-21", hora: "16:05" },
  { tipo: "Acuática", nombre: "Cisne de cuello negro", lugar: "Valdivia", fecha: "2026-08-19", hora: "09:30" },
  { tipo: "Paseriforme", nombre: "Diucón", lugar: "Maipú", fecha: "2026-08-18", hora: "17:20" },
  { tipo: "Rapaz", nombre: "Aguilucho", lugar: "La Ligua", fecha: "2026-08-15", hora: "12:00" },
  { tipo: "Marina", nombre: "Pelícano", lugar: "Quintero", fecha: "2026-08-12", hora: "08:10" },
  { tipo: "Acuática", nombre: "Tagua", lugar: "Providencia", fecha: "2026-08-10", hora: "10:45" },
  { tipo: "Paseriforme", nombre: "Zorzal", lugar: "Santiago", fecha: "2026-08-08", hora: "07:55" },
  { tipo: "Picaflor", nombre: "Picaflor chico", lugar: "Viña del Mar", fecha: "2026-08-05", hora: "15:30" },
  { tipo: "Rapaz", nombre: "Peuco", lugar: "Puerto Montt", fecha: "2026-08-02", hora: "13:00" },
  { tipo: "Marina", nombre: "Albatros", lugar: "Punta Arenas", fecha: "2026-07-30", hora: "18:40" }
];

// Voluntarios registrados por región (solo para el gráfico de estadísticas).
const VOLUNTARIOS = {
  "Arica y Parinacota": 4,
  "Valparaíso": 12,
  "Metropolitana": 20,
  "Los Lagos": 8,
  "Magallanes": 3
};
