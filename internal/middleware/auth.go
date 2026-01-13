package middleware

import (
	"log"
	"net/http"
	"ues-egresados/internal/config"
)

func AuthRequired(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		session, _ := config.SessionStore.Get(r, "session-name")

		auth, ok := session.Values["authenticated"].(bool)
		userID, hasUserID := session.Values["user_id"].(int)
		
		log.Printf("🔍 Auth check - Path: %s, Authenticated: %v, UserID: %d", r.URL.Path, auth, userID)

		if !ok || !auth || !hasUserID || userID == 0 {
			log.Printf("❌ Acceso denegado - Redirigiendo a login")
			http.Redirect(w, r, "/", http.StatusSeeOther)
			return
		}

		log.Printf("✅ Acceso autorizado para UserID: %d", userID)
		next.ServeHTTP(w, r)
	})
}