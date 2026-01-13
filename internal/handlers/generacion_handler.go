package handlers

import (
	"net/http"
	"ues-egresados/internal/config"
	"ues-egresados/internal/models"
	"ues-egresados/internal/utils"
)

// GetGeneraciones obtiene todas las generaciones
func GetGeneraciones(w http.ResponseWriter, r *http.Request) {
	rows, err := config.DB.Query("SELECT id_generacion, periodo FROM generaciones ORDER BY periodo DESC")
	if err != nil {
		utils.ErrorResponse(w, http.StatusInternalServerError, "Error al obtener generaciones")
		return
	}
	defer rows.Close()

	var generaciones []models.Generacion
	for rows.Next() {
		var g models.Generacion
		if err := rows.Scan(&g.IDGeneracion, &g.Periodo); err != nil {
			utils.ErrorResponse(w, http.StatusInternalServerError, "Error al procesar datos")
			return
		}
		generaciones = append(generaciones, g)
	}

	utils.SuccessResponse(w, "Generaciones obtenidas correctamente", generaciones)
}