package main

import (
	"fmt"
	"golang.org/x/crypto/bcrypt"
)

func main() {
	// Generar hash
	password := "gerardosc2026$"
	hash, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		fmt.Println("Error:", err)
		return
	}
	
	fmt.Println("Hash generado para 'gerardosc2026$':")
	fmt.Println(string(hash))
	fmt.Println("\nSQL para actualizar:")
	fmt.Printf("UPDATE usuarios SET password = '%s' WHERE usuario = 'gerardo_moreno';\n", string(hash))
	
	// Probar que funciona
	err = bcrypt.CompareHashAndPassword(hash, []byte("gerardosc2026$"))
	if err == nil {
		fmt.Println("\n✅ Hash verificado correctamente")
	} else {
		fmt.Println("\n❌ Error al verificar hash")
	}
}