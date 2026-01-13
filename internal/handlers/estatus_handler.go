package handlers

import (
	"net/http"
	"ues-egresados/internal/config"
	"ues-egresados/internal/models"
	"ues-egresados/internal/utils"
)

// GetEstatus obtiene todos los estatus
func GetEstatus(w http.ResponseWriter, r *http.Request) {
	rows, err := config.DB.Query("SELECT id_estatus, descripcion FROM estatus ORDER BY descripcion")
	if err != nil {
		utils.ErrorResponse(w, http.StatusInternalServerError, "Error al obtener estatus")
		return
	}
	defer rows.Close()

	var estatusList []models.Estatus
	for rows.Next() {
		var e models.Estatus
		if err := rows.Scan(&e.IDEstatus, &e.Descripcion); err != nil {
			utils.ErrorResponse(w, http.StatusInternalServerError, "Error al procesar datos")
			return
		}
		estatusList = append(estatusList, e)
	}

	utils.SuccessResponse(w, "Estatus obtenidos correctamente", estatusList)
}