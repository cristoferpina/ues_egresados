package handlers

import (
	"net/http"
	"ues-egresados/internal/config"
	"ues-egresados/internal/models"
	"ues-egresados/internal/utils"
)

// GetCarreras obtiene todas las carreras
func GetCarreras(w http.ResponseWriter, r *http.Request) {
	rows, err := config.DB.Query("SELECT id_carrera, nombre FROM carreras ORDER BY nombre")
	if err != nil {
		utils.ErrorResponse(w, http.StatusInternalServerError, "Error al obtener carreras")
		return
	}
	defer rows.Close()

	var carreras []models.Carrera
	for rows.Next() {
		var c models.Carrera
		if err := rows.Scan(&c.IDCarrera, &c.Nombre); err != nil {
			utils.ErrorResponse(w, http.StatusInternalServerError, "Error al procesar datos")
			return
		}
		carreras = append(carreras, c)
	}

	utils.SuccessResponse(w, "Carreras obtenidas correctamente", carreras)
}