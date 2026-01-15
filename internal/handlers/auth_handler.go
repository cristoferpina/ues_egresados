package handlers

import (
	"database/sql"
	"encoding/json"
	"html/template"
	"log"
	"net/http"
	"ues-egresados/internal/config"
	"ues-egresados/internal/models"
	"ues-egresados/internal/utils"

	"golang.org/x/crypto/bcrypt"
)

func LoginPage(w http.ResponseWriter, r *http.Request) {
	tmpl, err := template.ParseFiles("web/templates/login.html")
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	tmpl.Execute(w, nil)
}

func Login(w http.ResponseWriter, r *http.Request) {
	var loginReq models.LoginRequest
	if err := json.NewDecoder(r.Body).Decode(&loginReq); err != nil {
		utils.ErrorResponse(w, http.StatusBadRequest, "Datos inválidos")
		return
	}

	// Buscar usuario en la base de datos
	var usuario models.Usuario
	query := `SELECT id_usuario, usuario, nombre, apellido_paterno, apellido_materno, password, rol, created_at 
	          FROM usuarios WHERE usuario = ?`

	err := config.DB.QueryRow(query, loginReq.Usuario).Scan(
		&usuario.IDUsuario,
		&usuario.Usuario,
		&usuario.Nombre,
		&usuario.ApellidoPaterno,
		&usuario.ApellidoMaterno,
		&usuario.Password,
		&usuario.Rol,
		&usuario.CreatedAt,
	)

	if err != nil {
		if err == sql.ErrNoRows {
			utils.ErrorResponse(w, http.StatusUnauthorized, "Usuario o contraseña incorrectos")
			return
		}
		log.Println("Error al buscar usuario:", err)
		utils.ErrorResponse(w, http.StatusInternalServerError, "Error en el servidor")
		return
	}

	// Verificar contraseña
	if err := bcrypt.CompareHashAndPassword([]byte(usuario.Password), []byte(loginReq.Password)); err != nil {
		utils.ErrorResponse(w, http.StatusUnauthorized, "Usuario o contraseña incorrectos")
		return
	}

	// Crear sesión usando el store centralizado
	session, _ := config.SessionStore.Get(r, "session-name")
	session.Values["authenticated"] = true
	session.Values["user_id"] = usuario.IDUsuario
	session.Values["username"] = usuario.Usuario
	session.Values["nombre_completo"] = usuario.NombreCompleto()
	session.Values["rol"] = usuario.Rol
	
	if err := session.Save(r, w); err != nil {
		log.Println("❌ Error al guardar sesión:", err)
		utils.ErrorResponse(w, http.StatusInternalServerError, "Error al crear sesión")
		return
	}

	log.Printf("✅ Login exitoso para: %s (ID: %d)", usuario.Usuario, usuario.IDUsuario)

	utils.SuccessResponse(w, "Login exitoso", map[string]interface{}{
		"usuario":         usuario.Usuario,
		"nombre_completo": usuario.NombreCompleto(),
		"rol":             usuario.Rol,
	})
}

func Logout(w http.ResponseWriter, r *http.Request) {
	session, _ := config.SessionStore.Get(r, "session-name")
	session.Values["authenticated"] = false
	session.Options.MaxAge = -1
	session.Save(r, w)
	http.Redirect(w, r, "/", http.StatusSeeOther)
}

func DashboardPage(w http.ResponseWriter, r *http.Request) {
	session, _ := config.SessionStore.Get(r, "session-name")

	data := map[string]interface{}{
		"Title":          "Dashboard",
		"Username":       session.Values["username"],
		"NombreCompleto": session.Values["nombre_completo"],
	}

	tmpl, err := template.ParseFiles(
		"web/templates/base.html",
		"web/templates/dashboard.html",
		"web/templates/components/header.html",
		"web/templates/components/footer.html",
	)

	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	tmpl.ExecuteTemplate(w, "base", data)
}

func EgresadosPage(w http.ResponseWriter, r *http.Request) {
	session, _ := config.SessionStore.Get(r, "session-name")

	data := map[string]interface{}{
		"Title":          "Gestión de Egresados",
		"Username":       session.Values["username"],
		"NombreCompleto": session.Values["nombre_completo"],
	}

	tmpl, err := template.ParseFiles(
		"web/templates/base.html",
		"web/templates/egresados.html",
		"web/templates/components/header.html",
		"web/templates/components/footer.html",
	)

	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	tmpl.ExecuteTemplate(w, "base", data)
}

func AdministradoresPage(w http.ResponseWriter, r *http.Request) {
	session, _ := config.SessionStore.Get(r, "session-name")

	data := map[string]interface{}{
		"Title":          "Gestión de Administradores",
		"Username":       session.Values["username"],
		"NombreCompleto": session.Values["nombre_completo"],
	}

	tmpl, err := template.ParseFiles(
		"web/templates/base.html",
		"web/templates/administradores.html",
		"web/templates/components/header.html",
		"web/templates/components/footer.html",
	)

	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	tmpl.ExecuteTemplate(w, "base", data)
}
}