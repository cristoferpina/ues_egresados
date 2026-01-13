package config

import (
	"database/sql"
	"fmt"
	"os"

	_ "github.com/go-sql-driver/mysql"
	"github.com/gorilla/sessions"
)

var (
	DB    *sql.DB
	Store *sessions.CookieStore
)

// InitDB inicializa la conexión a la base de datos
func InitDB() error {
	dbUser := os.Getenv("DB_USER")
	dbPass := os.Getenv("DB_PASSWORD")
	dbHost := os.Getenv("DB_HOST")
	dbPort := os.Getenv("DB_PORT")
	dbName := os.Getenv("DB_NAME")

	dsn := fmt.Sprintf("%s:%s@tcp(%s:%s)/%s?parseTime=true&charset=utf8mb4",
		dbUser, dbPass, dbHost, dbPort, dbName)

	var err error
	DB, err = sql.Open("mysql", dsn)
	if err != nil {
		return fmt.Errorf("error al abrir conexión: %w", err)
	}

	if err = DB.Ping(); err != nil {
		return fmt.Errorf("error al hacer ping a la BD: %w", err)
	}

	// Configuración del pool de conexiones
	DB.SetMaxOpenConns(25)
	DB.SetMaxIdleConns(5)

	return nil
}

// CloseDB cierra la conexión a la base de datos
func CloseDB() {
	if DB != nil {
		DB.Close()
	}
}

// InitSessions inicializa el store de sesiones
func InitSessions() {
	secret := os.Getenv("SESSION_SECRET")
	if secret == "" {
		secret = "default-secret-key-change-in-production"
	}
	Store = sessions.NewCookieStore([]byte(secret))
	Store.Options = &sessions.Options{
		Path:     "/",
		MaxAge:   3600 * 8, // 8 horas
		HttpOnly: true,
		Secure:   false, // Cambiar a true en producción con HTTPS
	}
}