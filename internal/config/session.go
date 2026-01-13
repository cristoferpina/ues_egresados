package config

import (
	"os"

	"github.com/gorilla/sessions"
)

var SessionStore *sessions.CookieStore

func InitSession() {
	secret := os.Getenv("SESSION_SECRET")
	if secret == "" {
		secret = "tu_clave_secreta_aqui_cambiar_en_produccion"
	}
	
	SessionStore = sessions.NewCookieStore([]byte(secret))
	SessionStore.Options = &sessions.Options{
		Path:     "/",
		MaxAge:   86400 * 7, // 7 días
		HttpOnly: true,
		SameSite: 1,
	}
}