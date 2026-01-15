package main

import (
	"log"
	"net/http"
	"os"
	"ues-egresados/internal/config"
	"ues-egresados/internal/handlers"
	"ues-egresados/internal/middleware"

	"github.com/gorilla/mux"
	"github.com/joho/godotenv"
)

func main() {
	// Cargar variables de entorno
	if err := godotenv.Load(); err != nil {
		log.Println("No se encontró archivo .env, usando variables del sistema")
	}

	// Conectar a la base de datos
	if err := config.InitDB(); err != nil {
		log.Fatal("Error al conectar con la base de datos:", err)
	}
	defer config.CloseDB()

	// Inicializar sesiones
	config.InitSession()
	log.Println("✅ Sesiones inicializadas")

	// Inicializar router
	r := mux.NewRouter()

	// Archivos estáticos
	r.PathPrefix("/static/").Handler(http.StripPrefix("/static/",
		http.FileServer(http.Dir("web/static"))))

	// Rutas públicas
	r.HandleFunc("/", handlers.LoginPage).Methods("GET")
	r.HandleFunc("/login", handlers.Login).Methods("POST")
	r.HandleFunc("/logout", handlers.Logout).Methods("GET")

	// Rutas protegidas (requieren autenticación)
	protected := r.PathPrefix("/").Subrouter()
	protected.Use(middleware.AuthRequired)

	protected.HandleFunc("/dashboard", handlers.DashboardPage).Methods("GET")
	protected.HandleFunc("/egresados", handlers.EgresadosPage).Methods("GET")
	protected.HandleFunc("/administradores", handlers.AdministradoresPage).Methods("GET")

	// API Routes
	api := protected.PathPrefix("/api").Subrouter()

	// Administradores
	api.HandleFunc("/administradores", handlers.GetAdministradores).Methods("GET")
	api.HandleFunc("/administradores", handlers.CreateAdministrador).Methods("POST")
	api.HandleFunc("/administradores/{id}", handlers.UpdateAdministrador).Methods("PUT")
	api.HandleFunc("/administradores/{id}", handlers.DeleteAdministrador).Methods("DELETE")

	// Egresados
	api.HandleFunc("/egresados", handlers.GetEgresados).Methods("GET")
	api.HandleFunc("/egresados/filtrados", handlers.GetEgresadosFiltrados).Methods("GET")
	api.HandleFunc("/egresados", handlers.CreateEgresado).Methods("POST")
	api.HandleFunc("/egresados/{matricula}", handlers.GetEgresado).Methods("GET")
	api.HandleFunc("/egresados/{matricula}", handlers.UpdateEgresado).Methods("PUT")
	api.HandleFunc("/egresados/{matricula}", handlers.DeleteEgresado).Methods("DELETE")

	// Estadísticas de Egresados
	api.HandleFunc("/egresados/stats/generaciones", handlers.GetGeneracionesStats).Methods("GET")
	api.HandleFunc("/egresados/stats/carreras/{id_generacion}", handlers.GetCarrerasStatsByGeneracion).Methods("GET")

	// Códigos Postales
	api.HandleFunc("/codigo-postal/{cp}", handlers.BuscarPorCodigoPostal).Methods("GET")
	api.HandleFunc("/estados", handlers.GetEstados).Methods("GET")
	api.HandleFunc("/municipios/{estado}", handlers.GetMunicipiosPorEstado).Methods("GET")
	api.HandleFunc("/asentamientos/{municipio}", handlers.GetAsentamientosPorMunicipio).Methods("GET")

	// Catálogos
	api.HandleFunc("/carreras", handlers.GetCarreras).Methods("GET")
	api.HandleFunc("/generaciones", handlers.GetGeneraciones).Methods("GET")
	api.HandleFunc("/estatus", handlers.GetEstatus).Methods("GET")

	// Iniciar servidor
	port := os.Getenv("SERVER_PORT")
	if port == "" {
		port = "8080"
	}

	log.Printf("🚀 Servidor iniciado en http://localhost:%s", port)
	log.Fatal(http.ListenAndServe(":"+port, r))
}
