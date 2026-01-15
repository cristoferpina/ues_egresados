package handlers

import (
	"database/sql"
	"encoding/json"
	"net/http"
	"strconv"
	"ues-egresados/internal/config"
	"ues-egresados/internal/models"
	"ues-egresados/internal/utils"

	"github.com/gorilla/mux"
	"golang.org/x/crypto/bcrypt"
)

// GetAdministradores obtiene todos los administradores
func GetAdministradores(w http.ResponseWriter, r *http.Request) {
	query := `
		SELECT id_usuario, usuario, nombre, apellido_paterno, apellido_materno, rol, created_at
		FROM usuarios
		ORDER BY created_at DESC
	`

	rows, err := config.DB.Query(query)
	if err != nil {
		utils.ErrorResponse(w, http.StatusInternalServerError, "Error al obtener administradores")
		return
	}
	defer rows.Close()

	var administradores []models.Usuario

	for rows.Next() {
		var admin models.Usuario
		err := rows.Scan(
			&admin.IDUsuario,
			&admin.Usuario,
			&admin.Nombre,
			&admin.ApellidoPaterno,
			&admin.ApellidoMaterno,
			&admin.Rol,
			&admin.CreatedAt,
		)
		if err != nil {
			utils.ErrorResponse(w, http.StatusInternalServerError, "Error al procesar administradores")
			return
		}
		administradores = append(administradores, admin)
	}

	utils.SuccessResponse(w, administradores, "Administradores obtenidos correctamente")
}

// CreateAdministrador crea un nuevo administrador
func CreateAdministrador(w http.ResponseWriter, r *http.Request) {
	var req struct {
		Usuario         string `json:"usuario"`
		Nombre          string `json:"nombre"`
		ApellidoPaterno string `json:"apellido_paterno"`
		ApellidoMaterno string `json:"apellido_materno"`
		Password        string `json:"password"`
		Rol             string `json:"rol"`
	}

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		utils.ErrorResponse(w, http.StatusBadRequest, "Datos inválidos")
		return
	}

	// Validar campos requeridos
	if req.Usuario == "" || req.Nombre == "" || req.ApellidoPaterno == "" || req.Password == "" || req.Rol == "" {
		utils.ErrorResponse(w, http.StatusBadRequest, "Faltan campos requeridos")
		return
	}

	// Verificar si el usuario ya existe
	var exists bool
	err := config.DB.QueryRow("SELECT EXISTS(SELECT 1 FROM usuarios WHERE usuario = ?)", req.Usuario).Scan(&exists)
	if err != nil {
		utils.ErrorResponse(w, http.StatusInternalServerError, "Error al verificar usuario")
		return
	}

	if exists {
		utils.ErrorResponse(w, http.StatusBadRequest, "El usuario ya existe")
		return
	}

	// Encriptar contraseña
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		utils.ErrorResponse(w, http.StatusInternalServerError, "Error al procesar contraseña")
		return
	}

	// Insertar administrador
	result, err := config.DB.Exec(
		"INSERT INTO usuarios (usuario, nombre, apellido_paterno, apellido_materno, password, rol) VALUES (?, ?, ?, ?, ?, ?)",
		req.Usuario,
		req.Nombre,
		req.ApellidoPaterno,
		req.ApellidoMaterno,
		hashedPassword,
		req.Rol,
	)

	if err != nil {
		utils.ErrorResponse(w, http.StatusInternalServerError, "Error al crear administrador")
		return
	}

	lastID, _ := result.LastInsertId()
	w.WriteHeader(http.StatusCreated)
	utils.SuccessResponse(w, map[string]interface{}{
		"id_usuario": lastID,
		"usuario":    req.Usuario,
	}, "Administrador creado correctamente")
}

// UpdateAdministrador actualiza un administrador
func UpdateAdministrador(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	idUsuario, err := strconv.Atoi(vars["id"])
	if err != nil {
		utils.ErrorResponse(w, http.StatusBadRequest, "ID de usuario inválido")
		return
	}

	var req struct {
		Usuario         string `json:"usuario"`
		Nombre          string `json:"nombre"`
		ApellidoPaterno string `json:"apellido_paterno"`
		ApellidoMaterno string `json:"apellido_materno"`
		Password        string `json:"password"`
		Rol             string `json:"rol"`
	}

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		utils.ErrorResponse(w, http.StatusBadRequest, "Datos inválidos")
		return
	}

	// Validar campos requeridos
	if req.Usuario == "" || req.Nombre == "" || req.ApellidoPaterno == "" || req.Rol == "" {
		utils.ErrorResponse(w, http.StatusBadRequest, "Faltan campos requeridos")
		return
	}

	// Verificar que el usuario existe
	var exists bool
	err = config.DB.QueryRow("SELECT EXISTS(SELECT 1 FROM usuarios WHERE id_usuario = ?)", idUsuario).Scan(&exists)
	if err != nil || !exists {
		utils.ErrorResponse(w, http.StatusNotFound, "Administrador no encontrado")
		return
	}

	// Verificar si el nuevo usuario ya existe (y no es el mismo)
	var otherExists bool
	err = config.DB.QueryRow("SELECT EXISTS(SELECT 1 FROM usuarios WHERE usuario = ? AND id_usuario != ?)", req.Usuario, idUsuario).Scan(&otherExists)
	if err != nil {
		utils.ErrorResponse(w, http.StatusInternalServerError, "Error al verificar usuario")
		return
	}

	if otherExists {
		utils.ErrorResponse(w, http.StatusBadRequest, "El usuario ya existe")
		return
	}

	// Preparar actualización
	var query string
	var args []interface{}

	if req.Password != "" {
		// Si hay contraseña, encriptarla y actualizar
		hashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
		if err != nil {
			utils.ErrorResponse(w, http.StatusInternalServerError, "Error al procesar contraseña")
			return
		}
		query = "UPDATE usuarios SET usuario = ?, nombre = ?, apellido_paterno = ?, apellido_materno = ?, password = ?, rol = ? WHERE id_usuario = ?"
		args = []interface{}{req.Usuario, req.Nombre, req.ApellidoPaterno, req.ApellidoMaterno, hashedPassword, req.Rol, idUsuario}
	} else {
		// Sin contraseña, solo actualizar datos
		query = "UPDATE usuarios SET usuario = ?, nombre = ?, apellido_paterno = ?, apellido_materno = ?, rol = ? WHERE id_usuario = ?"
		args = []interface{}{req.Usuario, req.Nombre, req.ApellidoPaterno, req.ApellidoMaterno, req.Rol, idUsuario}
	}

	_, err = config.DB.Exec(query, args...)
	if err != nil {
		utils.ErrorResponse(w, http.StatusInternalServerError, "Error al actualizar administrador")
		return
	}

	utils.SuccessResponse(w, nil, "Administrador actualizado correctamente")
}

// DeleteAdministrador elimina un administrador
func DeleteAdministrador(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	idUsuario, err := strconv.Atoi(vars["id"])
	if err != nil {
		utils.ErrorResponse(w, http.StatusBadRequest, "ID de usuario inválido")
		return
	}

	// Verificar que el usuario existe
	var exists bool
	err = config.DB.QueryRow("SELECT EXISTS(SELECT 1 FROM usuarios WHERE id_usuario = ?)", idUsuario).Scan(&exists)
	if err != nil || !exists {
		utils.ErrorResponse(w, http.StatusNotFound, "Administrador no encontrado")
		return
	}

	// Eliminar administrador
	_, err = config.DB.Exec("DELETE FROM usuarios WHERE id_usuario = ?", idUsuario)
	if err != nil {
		utils.ErrorResponse(w, http.StatusInternalServerError, "Error al eliminar administrador")
		return
	}

	utils.SuccessResponse(w, nil, "Administrador eliminado correctamente")
}
