package main

import (
	"fmt"
	"log"
	"math/rand"
	"strings"
	"time"
	"ues-egresados/internal/config"

	"github.com/brianvoe/gofakeit/v6"
	"github.com/joho/godotenv"
)

func main() {
	// Cargar variables de entorno
	if err := godotenv.Load(); err != nil {
		log.Println("No se encontró archivo .env")
	}

	// Conectar a la base de datos
	if err := config.InitDB(); err != nil {
		log.Fatal("❌ Error al conectar con la base de datos:", err)
	}
	defer config.CloseDB()

	// Configurar generador
	gofakeit.Seed(time.Now().UnixNano())
	rand.Seed(time.Now().UnixNano())

	fmt.Println("🎓 Generador de Egresados Ficticios UES")
	fmt.Println("========================================")

	// Configuración
	cantidadEgresados := 500
	plantel := "13" // Número fijo del plantel
	
	fmt.Printf("📊 Generando %d egresados ficticios...\n", cantidadEgresados)
	fmt.Printf("🏫 Plantel: %s\n\n", plantel)

	// Obtener catálogos
	carreras := obtenerCarreras()
	generaciones := obtenerGeneracionesCompletas()
	estatus := obtenerEstatus()
	codigosPostales := obtenerCodigosPostalesAleatorios(100)

	if len(carreras) == 0 || len(generaciones) == 0 || len(estatus) == 0 {
		log.Fatal("❌ Faltan catálogos en la base de datos")
	}

	// Inicializar contadores por generación
	contadoresPorGeneracion := make(map[int]int)

	// Generar egresados
	count := 0
	duplicados := 0

	stmt, err := config.DB.Prepare(`
		INSERT INTO egresados 
		(matricula, nombre_completo, genero, telefono, correo, 
		codigo_postal, estado, municipio, asentamiento, calle, numero,
		id_carrera, id_generacion, id_estatus)
		VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
	`)
	if err != nil {
		log.Fatal("❌ Error al preparar statement:", err)
	}
	defer stmt.Close()

	for i := 0; i < cantidadEgresados; i++ {
		// Seleccionar generación aleatoria
		generacion := generaciones[rand.Intn(len(generaciones))]
		
		// Incrementar contador de esa generación
		contadoresPorGeneracion[generacion.ID]++
		consecutivo := contadoresPorGeneracion[generacion.ID]
		
		// Generar matrícula con formato correcto
		matricula := generarMatriculaUES(plantel, generacion.AnioInicio, consecutivo)

		// Generar datos personales
		genero := generarGenero()
		nombreCompleto := generarNombreCompleto(genero)
		telefono := generarTelefonoMexico()
		correo := generarCorreoInstitucional(nombreCompleto, matricula)

		// Seleccionar dirección aleatoria
		var cp CodigoPostalData
		if len(codigosPostales) > 0 {
			cp = codigosPostales[rand.Intn(len(codigosPostales))]
		}
		calle := gofakeit.Street()
		numero := fmt.Sprintf("%d", gofakeit.Number(1, 999))

		// Seleccionar catálogos aleatorios
		carrera := carreras[rand.Intn(len(carreras))]
		estatusEgresado := estatus[rand.Intn(len(estatus))]

		// Insertar en la BD
		_, err := stmt.Exec(
			matricula,
			nombreCompleto,
			genero,
			telefono,
			correo,
			cp.CodigoPostal,
			cp.Estado,
			cp.Municipio,
			cp.Asentamiento,
			calle,
			numero,
			carrera,
			generacion.ID,
			estatusEgresado,
		)

		if err != nil {
			log.Printf("⚠️ Error al insertar %s: %v\n", matricula, err)
			duplicados++
			continue
		}

		count++
		if count%50 == 0 {
			fmt.Printf("✅ Generados %d egresados...\n", count)
		}
	}

	fmt.Printf("\n🎉 Generación completada:\n")
	fmt.Printf("   ✅ Egresados creados: %d\n", count)
	fmt.Printf("   ⚠️  Duplicados omitidos: %d\n", duplicados)
	
	fmt.Printf("\n📊 Distribución por generación:\n")
	for idGen, cantidad := range contadoresPorGeneracion {
		for _, gen := range generaciones {
			if gen.ID == idGen {
				fmt.Printf("   %s: %d egresados\n", gen.Periodo, cantidad)
			}
		}
	}
}

// =====================================================
// ESTRUCTURAS
// =====================================================

type GeneracionData struct {
	ID         int
	Periodo    string
	AnioInicio int
}

type CodigoPostalData struct {
	CodigoPostal string
	Estado       string
	Municipio    string
	Asentamiento string
}

// =====================================================
// GENERACIÓN DE MATRÍCULA UES
// =====================================================

func generarMatriculaUES(plantel string, anioInicio int, consecutivo int) string {
	// Formato: PP-AA-NNNN
	// Ejemplo: 13220030 = Plantel 13, Generación 2022, Alumno 30
	
	// Extraer los últimos 2 dígitos del año
	anio2Digitos := anioInicio % 100
	
	// Formatear con ceros a la izquierda
	matricula := fmt.Sprintf("%s%02d%04d", plantel, anio2Digitos, consecutivo)
	
	return matricula
}

// =====================================================
// OBTENER CATÁLOGOS
// =====================================================

func obtenerCarreras() []int {
	rows, err := config.DB.Query("SELECT id_carrera FROM carreras")
	if err != nil {
		return []int{}
	}
	defer rows.Close()

	var ids []int
	for rows.Next() {
		var id int
		rows.Scan(&id)
		ids = append(ids, id)
	}
	return ids
}

func obtenerGeneracionesCompletas() []GeneracionData {
	rows, err := config.DB.Query("SELECT id_generacion, periodo FROM generaciones")
	if err != nil {
		log.Printf("⚠️ Error al obtener generaciones: %v\n", err)
		return []GeneracionData{}
	}
	defer rows.Close()

	var generaciones []GeneracionData
	for rows.Next() {
		var gen GeneracionData
		rows.Scan(&gen.ID, &gen.Periodo)
		
		// Extraer año de inicio del periodo (ej: "2022-2027" -> 2022)
		var anioInicio int
		fmt.Sscanf(gen.Periodo, "%d", &anioInicio)
		gen.AnioInicio = anioInicio
		
		generaciones = append(generaciones, gen)
	}
	return generaciones
}

func obtenerEstatus() []int {
	rows, err := config.DB.Query("SELECT id_estatus FROM estatus")
	if err != nil {
		return []int{}
	}
	defer rows.Close()

	var ids []int
	for rows.Next() {
		var id int
		rows.Scan(&id)
		ids = append(ids, id)
	}
	return ids
}

func obtenerCodigosPostalesAleatorios(cantidad int) []CodigoPostalData {
	query := `
		SELECT DISTINCT d_codigo, d_estado, d_mnpio, d_asenta 
		FROM codigos_postales 
		ORDER BY RAND() 
		LIMIT ?
	`
	
	rows, err := config.DB.Query(query, cantidad)
	if err != nil {
		log.Printf("⚠️ Error al obtener códigos postales: %v\n", err)
		return []CodigoPostalData{}
	}
	defer rows.Close()

	var cps []CodigoPostalData
	for rows.Next() {
		var cp CodigoPostalData
		rows.Scan(&cp.CodigoPostal, &cp.Estado, &cp.Municipio, &cp.Asentamiento)
		cps = append(cps, cp)
	}
	return cps
}

// =====================================================
// GENERACIÓN DE DATOS PERSONALES
// =====================================================

var nombresHombres = []string{
	"Juan", "Carlos", "Luis", "Miguel", "José", "Antonio", "Francisco",
	"Manuel", "Pedro", "Jesús", "David", "Daniel", "Ricardo", "Roberto",
	"Alejandro", "Fernando", "Javier", "Sergio", "Rafael", "Eduardo",
}

var nombresMujeres = []string{
	"María", "Ana", "Laura", "Carmen", "Rosa", "Patricia", "Lucía",
	"Gabriela", "Sofía", "Isabella", "Valentina", "Andrea", "Diana",
	"Fernanda", "Paola", "Carolina", "Daniela", "Verónica", "Mónica",
}

var apellidos = []string{
	"García", "Rodríguez", "Martínez", "López", "González", "Hernández",
	"Pérez", "Sánchez", "Ramírez", "Torres", "Flores", "Rivera",
	"Gómez", "Díaz", "Cruz", "Morales", "Reyes", "Gutiérrez",
	"Ortiz", "Jiménez", "Ruiz", "Mendoza", "Vargas", "Castillo",
	"Romero", "Herrera", "Medina", "Aguilar", "Vega", "Ramos",
}

func generarGenero() string {
	generos := []string{"Masculino", "Femenino"}
	return generos[rand.Intn(len(generos))]
}

func generarNombreCompleto(genero string) string {
	var nombre string
	var apellido1 = apellidos[rand.Intn(len(apellidos))]
	var apellido2 = apellidos[rand.Intn(len(apellidos))]
	
	if genero == "Masculino" {
		nombre = nombresHombres[rand.Intn(len(nombresHombres))]
	} else {
		nombre = nombresMujeres[rand.Intn(len(nombresMujeres))]
	}
	
	// A veces agregar segundo nombre
	if rand.Float32() < 0.3 {
		if genero == "Masculino" {
			nombre += " " + nombresHombres[rand.Intn(len(nombresHombres))]
		} else {
			nombre += " " + nombresMujeres[rand.Intn(len(nombresMujeres))]
		}
	}
	
	return fmt.Sprintf("%s %s %s", nombre, apellido1, apellido2)
}

func generarTelefonoMexico() string {
	// LADA del Estado de México y zonas cercanas
	ladas := []string{"722", "728", "712", "725", "55"}
	lada := ladas[rand.Intn(len(ladas))]
	numero := rand.Intn(10000000)
	return fmt.Sprintf("%s%07d", lada, numero)
}

func generarCorreoInstitucional(nombreCompleto string, matricula string) string {
	// Formato: inicial.apellido.matricula@ues.edu.sv
	partes := strings.Split(strings.ToLower(nombreCompleto), " ")
	
	if len(partes) >= 2 {
		// Remover acentos y caracteres especiales
		nombre := quitarAcentos(partes[0])
		apellido := quitarAcentos(partes[len(partes)-1])
		
		return fmt.Sprintf("%s.%s.%s@ues.edu.sv", 
			string(nombre[0]), 
			apellido, 
			matricula)
	}
	
	return fmt.Sprintf("egresado.%s@ues.edu.sv", matricula)
}

func quitarAcentos(s string) string {
	replacements := map[rune]string{
		'á': "a", 'é': "e", 'í': "i", 'ó': "o", 'ú': "u",
		'Á': "A", 'É': "E", 'Í': "I", 'Ó': "O", 'Ú': "U",
		'ñ': "n", 'Ñ': "N",
	}
	
	var result strings.Builder
	for _, char := range s {
		if replacement, found := replacements[char]; found {
			result.WriteString(replacement)
		} else {
			result.WriteRune(char)
		}
	}
	return result.String()
}