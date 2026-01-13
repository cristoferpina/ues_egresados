package models

import "time"

type Egresado struct {
	Matricula      string    `json:"matricula"`
	NombreCompleto string    `json:"nombre_completo"`
	Genero         *string   `json:"genero"`
	Telefono       *string   `json:"telefono"`
	Correo         *string   `json:"correo"`
	
	// Dirección
	CodigoPostal   *string   `json:"codigo_postal"`
	Estado         *string   `json:"estado"`
	Municipio      *string   `json:"municipio"`
	Asentamiento   *string   `json:"asentamiento"`
	Calle          *string   `json:"calle"`
	Numero         *string   `json:"numero"`
	
	IDCarrera      int       `json:"id_carrera"`
	IDGeneracion   int       `json:"id_generacion"`
	IDEstatus      int       `json:"id_estatus"`
	CreatedAt      time.Time `json:"created_at"`
	
	// Campos relacionados
	NombreCarrera      string `json:"nombre_carrera,omitempty"`
	PeriodoGeneracion  string `json:"periodo_generacion,omitempty"`
	DescripcionEstatus string `json:"descripcion_estatus,omitempty"`
}