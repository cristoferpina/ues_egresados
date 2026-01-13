package handlers

import (
	"database/sql"
	"encoding/json"
	"net/http"
	"ues-egresados/internal/config"
	"ues-egresados/internal/models"
	"ues-egresados/internal/utils"

	"github.com/gorilla/mux"
)

// GetEgresados obtiene todos los egresados con sus relaciones
func GetEgresados(w http.ResponseWriter, r *http.Request) {
	query := `
		SELECT 
			e.matricula,
			e.nombre_completo,
			e.genero,
			e.telefono,
			e.correo,
			e.codigo_postal,
			e.estado,
			e.municipio,
			e.asentamiento,
			e.calle,
			e.numero,
			e.id_carrera,
			e.id_generacion,
			e.id_estatus,
			e.created_at,
			c.nombre AS nombre_carrera,
			g.periodo AS periodo_generacion,
			es.descripcion AS descripcion_estatus
		FROM egresados e
		LEFT JOIN carreras c ON e.id_carrera = c.id_carrera
		LEFT JOIN generaciones g ON e.id_generacion = g.id_generacion
		LEFT JOIN estatus es ON e.id_estatus = es.id_estatus
		ORDER BY e.created_at DESC
	`

	rows, err := config.DB.Query(query)
	if err != nil {
		utils.ErrorResponse(w, http.StatusInternalServerError, "Error al obtener egresados")
		return
	}
	defer rows.Close()

	var egresados []models.Egresado
	for rows.Next() {
		var e models.Egresado
		err := rows.Scan(
			&e.Matricula,
			&e.NombreCompleto,
			&e.Genero,
			&e.Telefono,
			&e.Correo,
			&e.CodigoPostal,
			&e.Estado,
			&e.Municipio,
			&e.Asentamiento,
			&e.Calle,
			&e.Numero,
			&e.IDCarrera,
			&e.IDGeneracion,
			&e.IDEstatus,
			&e.CreatedAt,
			&e.NombreCarrera,
			&e.PeriodoGeneracion,
			&e.DescripcionEstatus,
		)
		if err != nil {
			continue
		}
		egresados = append(egresados, e)
	}

	utils.SuccessResponse(w, "Egresados obtenidos correctamente", egresados)
}

// GetEgresado obtiene un egresado por matrícula
func GetEgresado(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	matricula := vars["matricula"]

	query := `
		SELECT 
			e.matricula, e.nombre_completo, e.genero, e.telefono, e.correo,
			e.codigo_postal, e.estado, e.municipio, e.asentamiento, e.calle, e.numero,
			e.id_carrera, e.id_generacion, e.id_estatus, e.created_at
		FROM egresados e
		WHERE e.matricula = ?
	`

	var e models.Egresado
	err := config.DB.QueryRow(query, matricula).Scan(
		&e.Matricula,
		&e.NombreCompleto,
		&e.Genero,
		&e.Telefono,
		&e.Correo,
		&e.CodigoPostal,
		&e.Estado,
		&e.Municipio,
		&e.Asentamiento,
		&e.Calle,
		&e.Numero,
		&e.IDCarrera,
		&e.IDGeneracion,
		&e.IDEstatus,
		&e.CreatedAt,
	)

	if err != nil {
		if err == sql.ErrNoRows {
			utils.ErrorResponse(w, http.StatusNotFound, "Egresado no encontrado")
			return
		}
		utils.ErrorResponse(w, http.StatusInternalServerError, "Error al obtener egresado")
		return
	}

	utils.SuccessResponse(w, "Egresado obtenido correctamente", e)
}

// CreateEgresado crea un nuevo egresado
func CreateEgresado(w http.ResponseWriter, r *http.Request) {
	var egresado models.Egresado
	if err := json.NewDecoder(r.Body).Decode(&egresado); err != nil {
		utils.ErrorResponse(w, http.StatusBadRequest, "Datos inválidos")
		return
	}

	if egresado.Matricula == "" || egresado.NombreCompleto == "" {
		utils.ErrorResponse(w, http.StatusBadRequest, "Matrícula y nombre son obligatorios")
		return
	}

	query := `
		INSERT INTO egresados 
		(matricula, nombre_completo, genero, telefono, correo, 
		 codigo_postal, estado, municipio, asentamiento, calle, numero,
		 id_carrera, id_generacion, id_estatus)
		VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
	`

	_, err := config.DB.Exec(query,
		egresado.Matricula,
		egresado.NombreCompleto,
		egresado.Genero,
		egresado.Telefono,
		egresado.Correo,
		egresado.CodigoPostal,
		egresado.Estado,
		egresado.Municipio,
		egresado.Asentamiento,
		egresado.Calle,
		egresado.Numero,
		egresado.IDCarrera,
		egresado.IDGeneracion,
		egresado.IDEstatus,
	)

	if err != nil {
		utils.ErrorResponse(w, http.StatusInternalServerError, "Error al crear egresado")
		return
	}

	utils.SuccessResponse(w, "Egresado creado correctamente", egresado)
}

// UpdateEgresado actualiza un egresado existente
func UpdateEgresado(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	matricula := vars["matricula"]

	var egresado models.Egresado
	if err := json.NewDecoder(r.Body).Decode(&egresado); err != nil {
		utils.ErrorResponse(w, http.StatusBadRequest, "Datos inválidos")
		return
	}

	query := `
		UPDATE egresados 
		SET nombre_completo = ?, genero = ?, telefono = ?, correo = ?,
		    codigo_postal = ?, estado = ?, municipio = ?, asentamiento = ?,
		    calle = ?, numero = ?,
		    id_carrera = ?, id_generacion = ?, id_estatus = ?
		WHERE matricula = ?
	`

	result, err := config.DB.Exec(query,
		egresado.NombreCompleto,
		egresado.Genero,
		egresado.Telefono,
		egresado.Correo,
		egresado.CodigoPostal,
		egresado.Estado,
		egresado.Municipio,
		egresado.Asentamiento,
		egresado.Calle,
		egresado.Numero,
		egresado.IDCarrera,
		egresado.IDGeneracion,
		egresado.IDEstatus,
		matricula,
	)

	if err != nil {
		utils.ErrorResponse(w, http.StatusInternalServerError, "Error al actualizar egresado")
		return
	}

	rowsAffected, _ := result.RowsAffected()
	if rowsAffected == 0 {
		utils.ErrorResponse(w, http.StatusNotFound, "Egresado no encontrado")
		return
	}

	utils.SuccessResponse(w, "Egresado actualizado correctamente", egresado)
}

// DeleteEgresado elimina un egresado
func DeleteEgresado(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	matricula := vars["matricula"]

	query := "DELETE FROM egresados WHERE matricula = ?"
	result, err := config.DB.Exec(query, matricula)

	if err != nil {
		utils.ErrorResponse(w, http.StatusInternalServerError, "Error al eliminar egresado")
		return
	}

	rowsAffected, _ := result.RowsAffected()
	if rowsAffected == 0 {
		utils.ErrorResponse(w, http.StatusNotFound, "Egresado no encontrado")
		return
	}

	utils.SuccessResponse(w, "Egresado eliminado correctamente", nil)
}

// GetGeneracionesStats obtiene las generaciones con el conteo de egresados
func GetGeneracionesStats(w http.ResponseWriter, r *http.Request) {
	query := `
		SELECT 
			g.id_generacion,
			g.periodo,
			COUNT(e.matricula) as total_egresados
		FROM generaciones g
		LEFT JOIN egresados e ON g.id_generacion = e.id_generacion
		GROUP BY g.id_generacion, g.periodo
		ORDER BY g.periodo DESC
	`

	rows, err := config.DB.Query(query)
	if err != nil {
		utils.ErrorResponse(w, http.StatusInternalServerError, "Error al obtener estadísticas de generaciones")
		return
	}
	defer rows.Close()

	type GeneracionStats struct {
		IDGeneracion   int    `json:"id_generacion"`
		Periodo        string `json:"periodo"`
		TotalEgresados int    `json:"total_egresados"`
	}

	var stats []GeneracionStats
	totalGeneral := 0

	for rows.Next() {
		var s GeneracionStats
		if err := rows.Scan(&s.IDGeneracion, &s.Periodo, &s.TotalEgresados); err != nil {
			continue
		}
		stats = append(stats, s)
		totalGeneral += s.TotalEgresados
	}

	// Agregar opción "Todas"
	response := map[string]interface{}{
		"generaciones":  stats,
		"total_general": totalGeneral,
	}

	utils.SuccessResponse(w, "Estadísticas obtenidas correctamente", response)
}

// GetCarrerasStatsByGeneracion obtiene las carreras con el conteo de egresados por generación
func GetCarrerasStatsByGeneracion(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	generacionID := vars["id_generacion"]

	var query string
	var rows *sql.Rows
	var err error

	if generacionID == "all" || generacionID == "" {
		// Obtener todas las carreras sin filtrar por generación
		query = `
			SELECT 
				c.id_carrera,
				c.nombre,
				COUNT(e.matricula) as total_egresados
			FROM carreras c
			LEFT JOIN egresados e ON c.id_carrera = e.id_carrera
			GROUP BY c.id_carrera, c.nombre
			ORDER BY c.nombre
		`
		rows, err = config.DB.Query(query)
	} else {
		// Filtrar por generación específica
		query = `
			SELECT 
				c.id_carrera,
				c.nombre,
				COUNT(e.matricula) as total_egresados
			FROM carreras c
			LEFT JOIN egresados e ON c.id_carrera = e.id_carrera AND e.id_generacion = ?
			GROUP BY c.id_carrera, c.nombre
			ORDER BY c.nombre
		`
		rows, err = config.DB.Query(query, generacionID)
	}

	if err != nil {
		utils.ErrorResponse(w, http.StatusInternalServerError, "Error al obtener estadísticas de carreras")
		return
	}
	defer rows.Close()

	type CarreraStats struct {
		IDCarrera      int    `json:"id_carrera"`
		Nombre         string `json:"nombre"`
		TotalEgresados int    `json:"total_egresados"`
	}

	var stats []CarreraStats
	totalGeneral := 0

	for rows.Next() {
		var s CarreraStats
		if err := rows.Scan(&s.IDCarrera, &s.Nombre, &s.TotalEgresados); err != nil {
			continue
		}
		stats = append(stats, s)
		totalGeneral += s.TotalEgresados
	}

	response := map[string]interface{}{
		"carreras":      stats,
		"total_general": totalGeneral,
	}

	utils.SuccessResponse(w, "Estadísticas obtenidas correctamente", response)
}

// GetEgresadosFiltrados obtiene egresados filtrados por generación y/o carrera
func GetEgresadosFiltrados(w http.ResponseWriter, r *http.Request) {
	generacionID := r.URL.Query().Get("generacion")
	carreraID := r.URL.Query().Get("carrera")

	query := `
		SELECT 
			e.matricula,
			e.nombre_completo,
			e.genero,
			e.telefono,
			e.correo,
			e.codigo_postal,
			e.estado,
			e.municipio,
			e.asentamiento,
			e.calle,
			e.numero,
			e.id_carrera,
			e.id_generacion,
			e.id_estatus,
			e.created_at,
			c.nombre AS nombre_carrera,
			g.periodo AS periodo_generacion,
			es.descripcion AS descripcion_estatus
		FROM egresados e
		LEFT JOIN carreras c ON e.id_carrera = c.id_carrera
		LEFT JOIN generaciones g ON e.id_generacion = g.id_generacion
		LEFT JOIN estatus es ON e.id_estatus = es.id_estatus
		WHERE 1=1
	`

	var args []interface{}

	// Agregar filtro de generación si no es "all"
	if generacionID != "" && generacionID != "all" {
		query += " AND e.id_generacion = ?"
		args = append(args, generacionID)
	}

	// Agregar filtro de carrera si no es "all"
	if carreraID != "" && carreraID != "all" {
		query += " AND e.id_carrera = ?"
		args = append(args, carreraID)
	}

	query += " ORDER BY e.created_at DESC"

	rows, err := config.DB.Query(query, args...)
	if err != nil {
		utils.ErrorResponse(w, http.StatusInternalServerError, "Error al obtener egresados")
		return
	}
	defer rows.Close()

	var egresados []models.Egresado
	for rows.Next() {
		var e models.Egresado
		err := rows.Scan(
			&e.Matricula,
			&e.NombreCompleto,
			&e.Genero,
			&e.Telefono,
			&e.Correo,
			&e.CodigoPostal,
			&e.Estado,
			&e.Municipio,
			&e.Asentamiento,
			&e.Calle,
			&e.Numero,
			&e.IDCarrera,
			&e.IDGeneracion,
			&e.IDEstatus,
			&e.CreatedAt,
			&e.NombreCarrera,
			&e.PeriodoGeneracion,
			&e.DescripcionEstatus,
		)
		if err != nil {
			continue
		}
		egresados = append(egresados, e)
	}

	utils.SuccessResponse(w, "Egresados obtenidos correctamente", egresados)
}
