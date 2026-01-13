package utils

import (
	"regexp"
	"strings"
)

// ValidateEmail valida formato de email
func ValidateEmail(email string) bool {
	if email == "" {
		return true // Permitir vacío si es opcional
	}
	pattern := `^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$`
	matched, _ := regexp.MatchString(pattern, email)
	return matched
}

// ValidateMatricula valida formato de matrícula (8 caracteres)
func ValidateMatricula(matricula string) bool {
	matricula = strings.TrimSpace(matricula)
	return len(matricula) == 8
}

// ValidateTelefono valida formato de teléfono (10-15 dígitos)
func ValidateTelefono(telefono string) bool {
	if telefono == "" {
		return true // Permitir vacío si es opcional
	}
	pattern := `^[\d\s\-\+\(\)]{10,15}$`
	matched, _ := regexp.MatchString(pattern, telefono)
	return matched
}

// SanitizeString limpia espacios y caracteres no deseados
func SanitizeString(s string) string {
	return strings.TrimSpace(s)
}