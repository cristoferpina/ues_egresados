package models

import "time"

type Usuario struct {
    IDUsuario        int       `json:"id_usuario"`
    Usuario          string    `json:"usuario"`
    Nombre           string    `json:"nombre"`
    ApellidoPaterno  string    `json:"apellido_paterno"`
    ApellidoMaterno  string    `json:"apellido_materno"`
    Password         string    `json:"-"` // No se serializa en JSON
    Rol              string    `json:"rol"`
    CreatedAt        time.Time `json:"created_at"`
}

// Método para obtener nombre completo
func (u *Usuario) NombreCompleto() string {
    return u.Nombre + " " + u.ApellidoPaterno + " " + u.ApellidoMaterno
}

type LoginRequest struct {
    Usuario  string `json:"usuario"`
    Password string `json:"password"`
}