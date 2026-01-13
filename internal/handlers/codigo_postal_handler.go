package handlers

import (
	"net/http"
	"ues-egresados/internal/config"
	"ues-egresados/internal/utils"

	"github.com/gorilla/mux"
)

// BuscarPorCodigoPostal - Busca por CP y devuelve estado, municipio y asentamientos
func BuscarPorCodigoPostal(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	cp := vars["cp"]

	if len(cp) != 5 {
		utils.ErrorResponse(w, http.StatusBadRequest, "Código postal debe tener 5 dígitos")
		return
	}

	// Obtener estado y municipio
	query := `
		SELECT DISTINCT d_estado, d_mnpio
		FROM codigos_postales
		WHERE d_codigo = ?
		LIMIT 1
	`

	var estado, municipio string
	err := config.DB.QueryRow(query, cp).Scan(&estado, &municipio)
	if err != nil {
		utils.ErrorResponse(w, http.StatusNotFound, "Código postal no encontrado")
		return
	}

	// Obtener asentamientos
	queryAsenta := `
		SELECT DISTINCT d_asenta
		FROM codigos_postales
		WHERE d_codigo = ?
		ORDER BY d_asenta
	`

	rows, err := config.DB.Query(queryAsenta, cp)
	if err != nil {
		utils.ErrorResponse(w, http.StatusInternalServerError, "Error al obtener asentamientos")
		return
	}
	defer rows.Close()

	var asentamientos []string
	for rows.Next() {
		var asenta string
		if err := rows.Scan(&asenta); err != nil {
			continue
		}
		asentamientos = append(asentamientos, asenta)
	}

	resultado := map[string]interface{}{
		"codigo_postal": cp,
		"estado":        estado,
		"municipio":     municipio,
		"asentamientos": asentamientos,
	}

	utils.SuccessResponse(w, "Código postal encontrado", resultado)
}

// GetEstados - Obtiene lista de estados únicos
func GetEstados(w http.ResponseWriter, r *http.Request) {
	query := `
		SELECT DISTINCT d_estado
		FROM codigos_postales
		ORDER BY d_estado
	`

	rows, err := config.DB.Query(query)
	if err != nil {
		utils.ErrorResponse(w, http.StatusInternalServerError, "Error al obtener estados")
		return
	}
	defer rows.Close()

	var estados []string
	for rows.Next() {
		var estado string
		if err := rows.Scan(&estado); err != nil {
			continue
		}
		estados = append(estados, estado)
	}

	utils.SuccessResponse(w, "Estados obtenidos", estados)
}

// GetMunicipiosPorEstado - Obtiene municipios de un estado
func GetMunicipiosPorEstado(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	estado := vars["estado"]

	query := `
		SELECT DISTINCT d_mnpio
		FROM codigos_postales
		WHERE d_estado = ?
		ORDER BY d_mnpio
	`

	rows, err := config.DB.Query(query, estado)
	if err != nil {
		utils.ErrorResponse(w, http.StatusInternalServerError, "Error al obtener municipios")
		return
	}
	defer rows.Close()

	var municipios []string
	for rows.Next() {
		var municipio string
		if err := rows.Scan(&municipio); err != nil {
			continue
		}
		municipios = append(municipios, municipio)
	}

	utils.SuccessResponse(w, "Municipios obtenidos", municipios)
}

// GetAsentamientosPorMunicipio - Obtiene asentamientos de un municipio
func GetAsentamientosPorMunicipio(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	estado := r.URL.Query().Get("estado")
	municipio := vars["municipio"]

	query := `
		SELECT DISTINCT d_asenta, d_codigo
		FROM codigos_postales
		WHERE d_estado = ? AND d_mnpio = ?
		ORDER BY d_asenta
	`

	rows, err := config.DB.Query(query, estado, municipio)
	if err != nil {
		utils.ErrorResponse(w, http.StatusInternalServerError, "Error al obtener asentamientos")
		return
	}
	defer rows.Close()

	var asentamientos []map[string]string
	for rows.Next() {
		var asenta, codigo string
		if err := rows.Scan(&asenta, &codigo); err != nil {
			continue
		}
		asentamientos = append(asentamientos, map[string]string{
			"asentamiento":   asenta,
			"codigo_postal": codigo,
		})
	}

	utils.SuccessResponse(w, "Asentamientos obtenidos", asentamientos)
}