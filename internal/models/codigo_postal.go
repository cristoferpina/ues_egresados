package models

type CodigoPostal struct {
	ID           int    `json:"id"`
	Codigo       string `json:"codigo"`
	Asentamiento string `json:"asentamiento"`
	Municipio    string `json:"municipio"`
	Estado       string `json:"estado"`
}

type EstadoMunicipio struct {
	Estado    string   `json:"estado"`
	Municipios []string `json:"municipios"`
}

type MunicipioAsentamiento struct {
	Municipio     string   `json:"municipio"`
	Asentamientos []string `json:"asentamientos"`
}