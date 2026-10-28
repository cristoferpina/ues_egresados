<div align="center">

<sub>CRISTOFER PIÑA · DESARROLLO DE SOFTWARE</sub>

# Gestión de egresados | UMB

Plataforma web para administrar y dar seguimiento a egresados universitarios.

<img alt="Go" src="https://img.shields.io/badge/Go-0F172A?style=for-the-badge" />
<img alt="MySQL" src="https://img.shields.io/badge/MySQL-1D4ED8?style=for-the-badge" />
<img alt="JavaScript" src="https://img.shields.io/badge/JavaScript-0F766E?style=for-the-badge" />

**Universidad Mexiquense del Bicentenario**

[Código fuente](https://github.com/cristoferpina/ues_egresados) &nbsp; / &nbsp; [Incidencias](https://github.com/cristoferpina/ues_egresados/issues) &nbsp; / &nbsp; [Perfil](https://github.com/cristoferpina)

</div>

---

[Características Principales](#seccion-1) · [Stack Tecnológico](#seccion-2) · [Requisitos](#seccion-3) · [Instalación Local](#seccion-4) · [Credenciales por Defecto](#seccion-5)

---

Sistema web completo para la gestión y seguimiento de egresados universitarios. Desarrollado con Go en el backend, HTML5, CSS3 (Tailwind) y JavaScript en el frontend.

<a id="seccion-1"></a>

## Características Principales

### Dashboard
- Estadísticas en tiempo real (Total egresados, Titulados, Carreras, Generaciones)
- Gráficos interactivos y responsivos
- Análisis por generación, carrera y estatus

### Gestión de Egresados
- CRUD completo (Crear, Leer, Actualizar, Eliminar)
- Filtros avanzados por generación, carrera y estatus
- Búsqueda por matrícula o nombre
- Vista de tabla con información detallada
- Descarga de expedientes en PDF individual
- Exportación de tabla en PDF (horizontal) y Excel (XLSX)

### Administración
- Gestión de administradores (CRUD)
- Sistema de autenticación con sesiones
- Control de acceso por roles
- Contraseñas hasheadas con bcrypt

### Interfaz
- Diseño moderno y responsivo (mobile-first)
- Tema claro y oscuro automático
- Animaciones suaves
- Página de error 404 personalizada con colibrí
- Favicon personalizado

### Características Técnicas
- Filtros progresivos (Generación → Carrera → Egresados)
- Búsqueda por código postal
- Búsqueda por ubicación geográfica
- Validación de formularios
- Notificaciones en tiempo real

<a id="seccion-2"></a>

## Stack Tecnológico

### Backend
- **Go 1.22** - Lenguaje principal
- **Gorilla Mux** - Enrutador HTTP
- **MySQL** - Base de datos
- **bcrypt** - Hashing de contraseñas
- **Gorilla Sessions** - Gestión de sesiones

### Frontend
- **HTML5** - Estructura
- **Tailwind CSS** - Estilos
- **JavaScript Vanilla** - Interactividad
- **jsPDF + AutoTable** - Generación de PDFs
- **SheetJS/XLSX** - Exportación a Excel
- **Material Symbols Outlined** - Iconografía

### Deployment
- **Docker** - Containerización
- **Fly.io** - Hosting

<a id="seccion-3"></a>

## Requisitos

- Go 1.22 o superior
- MySQL 8.0 o superior
- Navegador web moderno (Chrome, Firefox, Safari, Edge)

<a id="seccion-4"></a>

## Instalación Local

### 1. Clonar el repositorio
```bash
git clone https://github.com/cristoferpina/ues_egresados.git
cd ues_egresados
```

### 2. Configurar variables de entorno
Crear archivo `.env` en la raíz del proyecto:
```env
DB_USER=usuario_mysql
DB_PASSWORD=contraseña_mysql
DB_NAME=ues_egresados
DB_HOST=localhost
DB_PORT=3306
SERVER_PORT=8080
SESSION_KEY=tu_clave_sesion_segura
```

### 3. Importar base de datos
```bash
mysql -u usuario_mysql -p ues_egresados < data/database/ues_egresados.sql
```

### 4. Instalar dependencias
```bash
go mod download
go mod tidy
```

### 5. Ejecutar el servidor
```bash
go run cmd/server/main.go
```

### 6. Acceder a la aplicación
Abre tu navegador y ve a: `http://localhost:8080`

<a id="seccion-5"></a>

## Credenciales por Defecto

- **Usuario:** `admin`
- **Contraseña:** `admin123`

<a id="seccion-6"></a>

## Estructura del Proyecto

```
ues-egresados/
├── cmd/
│   ├── server/              # Servidor principal
│   ├── import_cp/           # Importador de códigos postales
│   └── seed/                # Script de datos iniciales
├── internal/
│   ├── config/              # Configuración (DB, sesiones)
│   ├── handlers/            # Controladores HTTP
│   │   ├── auth_handler.go         # Autenticación
│   │   ├── egresado_handler.go     # CRUD Egresados
│   │   ├── admin_handler.go        # CRUD Administradores
│   │   ├── carrera_handler.go      # Estadísticas por carrera
│   │   ├── generacion_handler.go   # Estadísticas por generación
│   │   ├── estatus_handler.go      # Filtros por estatus
│   │   └── codigo_postal_handler.go # Búsqueda geográfica
│   ├── middleware/          # Middleware de autenticación
│   ├── models/              # Estructuras de datos
│   └── utils/               # Utilidades (respuestas, validación)
├── web/
│   ├── static/              # Archivos estáticos
│   │   ├── css/             # Estilos CSS
│   │   ├── img/             # Imágenes y logos
│   │   └── js/              # Scripts JavaScript
│   │       ├── main.js           # Script principal
│   │       ├── auth.js           # Lógica de autenticación
│   │       ├── dashboard.js      # Estadísticas del dashboard
│   │       ├── egresados.js      # Gestión de egresados
│   │       ├── administradores.js # Gestión de administradores
│   │       └── theme.js          # Tema claro/oscuro
│   └── templates/           # Templates HTML
│       ├── base.html             # Template base
│       ├── login.html            # Página de login
│       ├── dashboard.html        # Dashboard
│       ├── egresados.html        # Gestión de egresados
│       ├── administradores.html  # Gestión de administradores
│       ├── error404.html         # Página de error 404
│       └── components/           # Componentes reutilizables
│           ├── header.html
│           └── footer.html
├── data/
│   ├── database/
│   │   └── ues_egresados.sql     # Script de BD
│   └── csv/                      # Datos CSV de códigos postales
├── docker-compose.yml       # Configuración Docker
├── Dockerfile              # Imagen Docker
├── fly.toml               # Configuración Fly.io
├── go.mod                 # Módulos Go
└── README.md              # Este archivo
```

<a id="seccion-7"></a>

## Uso de la Aplicación

### Login
1. Ingresa con usuario `admin` y contraseña `admin123`
2. Se guardará la sesión automáticamente

### Dashboard
- Visualiza estadísticas generales
- Ve gráficos de distribución por generación, carrera y estatus
- Accede a todas las secciones desde el menú

### Gestión de Egresados
1. Selecciona una generación
2. Elige una carrera
3. Visualiza la tabla con filtros adicionales
4. **Buscar:** por matrícula o nombre
5. **Filtrar por estatus:** Titulado, En proceso, etc.
6. **Descargar expediente:** PDF individual con información
7. **Exportar tabla:** PDF (horizontal) o Excel

### Gestión de Administradores
1. Accede desde el dropdown de usuario
2. Visualiza lista de administradores
3. Crea nuevo administrador
4. Edita información existente
5. Elimina administradores

### Tema Oscuro/Claro
- Haz clic en el ícono de sol/luna en el header
- Se guarda tu preferencia automáticamente

<a id="seccion-8"></a>

## API Endpoints

### Autenticación
- `POST /login` - Iniciar sesión
- `GET /logout` - Cerrar sesión

### Egresados
- `GET /api/egresados` - Obtener todos
- `GET /api/egresados/{matricula}` - Obtener por matrícula
- `POST /api/egresados` - Crear
- `PUT /api/egresados/{matricula}` - Actualizar
- `DELETE /api/egresados/{matricula}` - Eliminar
- `GET /api/egresados/stats/generaciones` - Estadísticas
- `GET /api/egresados/stats/carreras/{generacion}` - Por carrera

### Administradores
- `GET /api/administradores` - Obtener todos
- `POST /api/administradores` - Crear
- `PUT /api/administradores/{id}` - Actualizar
- `DELETE /api/administradores/{id}` - Eliminar

<a id="seccion-9"></a>

## Deployment a Fly.io

### Prerequisitos
- Cuenta en Fly.io
- CLI de Fly.io instalado

### Deploy
```bash
fly auth login
fly launch
fly deploy
```

### Variables de entorno en Fly.io
```bash
fly secrets set DB_USER=usuario
fly secrets set DB_PASSWORD=contraseña
fly secrets set DB_NAME=ues_egresados
fly secrets set DB_HOST=mysql.host
fly secrets set SESSION_KEY=clave_segura
```

<a id="seccion-10"></a>

## Base de Datos

### Tablas principales
- **usuarios** - Administradores del sistema
- **egresados** - Información de egresados
- **carreras** - Programas académicos
- **generaciones** - Años de graduación
- **estatus** - Estados (Titulado, En proceso, etc.)
- **codigos_postales** - Códigos postales para búsqueda

<a id="seccion-11"></a>

## Troubleshooting

### La página 404 no aparece
- Asegúrate que la imagen del colibrí esté en `web/static/img/logos/colibri.png`
- Limpia el caché del navegador (Ctrl+Shift+Delete)

### No puedo descargar PDFs
- Verifica que jsPDF esté cargado correctamente
- Comprueba la consola del navegador (F12) para errores

### Problema con tema oscuro
- Limpia localStorage: `localStorage.clear()` en consola
- Recarga la página

### Error de conexión a BD
- Verifica credenciales en `.env`
- Asegúrate que MySQL esté ejecutándose
- Comprueba que la BD existe

<a id="seccion-12"></a>

## Licencia

Este proyecto está bajo licencia privada. Todos los derechos reservados.

<a id="seccion-13"></a>

## Autor

Desarrollado por **Cristófer Piña** para la Universidad Mexiquense del Bicentenario.

<a id="seccion-14"></a>

## Enlaces

- **Repositorio:** https://github.com/cristoferpina/ues_egresados
- **Aplicación en vivo:** https://ues-egresados.fly.dev/

---

<div align="center">
<sub>Desarrollado por <a href="https://github.com/cristoferpina">Cristofer Piña</a> · Universidad Mexiquense del Bicentenario</sub>
</div>
