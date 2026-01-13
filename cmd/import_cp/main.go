package main

import (
	"encoding/csv"
	"fmt"
	"log"
	"os"
	"strings"
	"ues-egresados/internal/config"

	"github.com/joho/godotenv"
	"golang.org/x/text/encoding/charmap"
	"golang.org/x/text/transform"
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

	// Abrir archivo CSV
	file, err := os.Open("data/CP_CONSOLIDADO.csv")
	if err != nil {
		log.Fatal("❌ Error al abrir archivo CSV:", err)
	}
	defer file.Close()

	// ⚡ CONVERTIR DE WINDOWS-1252 A UTF-8
	decoder := charmap.Windows1252.NewDecoder()
	utf8Reader := transform.NewReader(file, decoder)

	reader := csv.NewReader(utf8Reader)
	reader.LazyQuotes = true
	reader.FieldsPerRecord = -1
	
	// Leer todas las filas
	records, err := reader.ReadAll()
	if err != nil {
		log.Fatal("❌ Error al leer CSV:", err)
	}

	fmt.Printf("📊 Total de registros leídos: %d\n", len(records))

	// Mostrar encabezados
	if len(records) > 0 {
		fmt.Println("\n📋 Encabezados detectados:")
		for j, header := range records[0] {
			fmt.Printf("  [%d] %s\n", j, strings.TrimSpace(header))
		}
	}

	// ⚡ OPTIMIZACIÓN: Desactivar índices temporalmente
	fmt.Println("\n⚡ Optimizando base de datos...")
	config.DB.Exec("SET FOREIGN_KEY_CHECKS = 0")
	config.DB.Exec("SET UNIQUE_CHECKS = 0")
	config.DB.Exec("SET AUTOCOMMIT = 0")
	config.DB.Exec("SET NAMES utf8mb4")
	config.DB.Exec("SET CHARACTER SET utf8mb4")

	// Limpiar tabla antes de importar
	fmt.Println("🗑️  Limpiando tabla anterior...")
	_, err = config.DB.Exec("TRUNCATE TABLE codigos_postales")
	if err != nil {
		log.Printf("⚠️  Advertencia al limpiar tabla: %v\n", err)
	}

	// ⚡ BULK INSERT: Preparar valores
	count := 0
	skipped := 0
	batchSize := 1000
	values := []string{}
	args := []interface{}{}

	fmt.Println("\n🚀 Iniciando importación rápida...")

	for i, record := range records {
		if i == 0 {
			continue // Saltar encabezado
		}

		// Validar columnas
		if len(record) < 5 {
			skipped++
			continue
		}

		// Extraer y limpiar datos
		codigo := strings.TrimSpace(record[0])
		asenta := strings.TrimSpace(record[1])
		municipio := strings.TrimSpace(record[3])
		estado := strings.TrimSpace(record[4])

		// Validar datos
		if codigo == "" || asenta == "" || municipio == "" || estado == "" {
			skipped++
			continue
		}

		// Agregar a batch
		values = append(values, "(?, ?, ?, ?)")
		args = append(args, codigo, asenta, municipio, estado)
		count++

		// Cuando llegamos al tamaño del batch, ejecutar INSERT
		if len(values) >= batchSize {
			query := fmt.Sprintf("INSERT INTO codigos_postales (d_codigo, d_asenta, d_mnpio, d_estado) VALUES %s", 
				strings.Join(values, ","))
			
			_, err := config.DB.Exec(query, args...)
			if err != nil {
				log.Printf("⚠️ Error en batch: %v\n", err)
			} else {
				fmt.Printf("✅ Importados %d registros...\n", count)
			}

			// Limpiar batch
			values = []string{}
			args = []interface{}{}
		}
	}

	// Insertar los registros restantes
	if len(values) > 0 {
		query := fmt.Sprintf("INSERT INTO codigos_postales (d_codigo, d_asenta, d_mnpio, d_estado) VALUES %s", 
			strings.Join(values, ","))
		
		_, err := config.DB.Exec(query, args...)
		if err != nil {
			log.Printf("⚠️ Error en último batch: %v\n", err)
		}
	}

	// Commit y reactivar índices
	fmt.Println("\n💾 Guardando cambios...")
	config.DB.Exec("COMMIT")
	
	fmt.Println("🔧 Reactivando índices...")
	config.DB.Exec("SET FOREIGN_KEY_CHECKS = 1")
	config.DB.Exec("SET UNIQUE_CHECKS = 1")
	config.DB.Exec("SET AUTOCOMMIT = 1")

	// Crear índices si no existen
	fmt.Println("📇 Optimizando índices...")
	config.DB.Exec("CREATE INDEX IF NOT EXISTS idx_codigo ON codigos_postales(d_codigo)")
	config.DB.Exec("CREATE INDEX IF NOT EXISTS idx_estado_municipio ON codigos_postales(d_estado, d_mnpio)")
	config.DB.Exec("CREATE INDEX IF NOT EXISTS idx_asenta ON codigos_postales(d_asenta)")

	fmt.Printf("\n🎉 Importación completada:\n")
	fmt.Printf("   ✅ Registros importados: %d\n", count)
	fmt.Printf("   ⚠️ Registros omitidos: %d\n", skipped)
	
	// TEST: Mostrar algunos registros con acentos
	fmt.Println("\n🧪 Verificando encoding:")
	testQuery := "SELECT d_estado FROM codigos_postales WHERE d_estado LIKE '%éxico%' LIMIT 1"
	var estado string
	if err := config.DB.QueryRow(testQuery).Scan(&estado); err == nil {
		fmt.Printf("   Estado encontrado: %s\n", estado)
	}
}