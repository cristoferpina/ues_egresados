# Sistema de Gestión de Egresados - UES

Sistema web para la gestión y seguimiento de egresados universitarios desarrollado en Go.

## 🚀 Características

- Gestión completa de egresados (CRUD)
- Autenticación de usuarios
- Dashboard con estadísticas
- Filtros y búsquedas avanzadas
- Interfaz responsive

## 📋 Requisitos

- Go 1.21 o superior
- MySQL 8.0 o superior
- Navegador web moderno

## 🔧 Instalación

1. Clonar el repositorio
2. Configurar archivo `.env` con credenciales de la BD
3. Importar el script SQL en phpMyAdmin
4. Instalar dependencias:
```bash
go mod download
```

5. Ejecutar el servidor:
```bash
go run cmd/server/main.go
```

6. Abrir en navegador: `http://localhost:8080`

## 👤 Usuario por defecto

- Usuario: `admin`
- Contraseña: `admin123`

## 📁 Estructura del proyecto

```
ues-egresados/
├── cmd/server/          # Punto de entrada
├── internal/            # Código privado
│   ├── config/         # Configuración
│   ├── handlers/       # Controladores
│   ├── middleware/     # Middleware
│   ├── models/         # Modelos de datos
│   └── utils/          # Utilidades
└── web/                # Frontend
    ├── static/         # CSS, JS
    └── templates/      # HTML
```

## 📝 Licencia

Proyecto educativo - UES
```