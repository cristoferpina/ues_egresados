// =====================================================
// VARIABLES GLOBALES
// =====================================================

let administradoresData = [];
let adminEnEdicion = null;
let passwordVerified = false;

// =====================================================
// INICIALIZAR PÁGINA
// =====================================================

document.addEventListener('DOMContentLoaded', function() {
    mostrarModalPassword();
});

// =====================================================
// VERIFICACIÓN DE CONTRASEÑA
// =====================================================

function mostrarModalPassword() {
    document.getElementById('passwordModal').classList.remove('hidden');
    document.getElementById('passwordInput').focus();
    passwordVerified = false;
}

function ocultarModalPassword() {
    document.getElementById('passwordModal').classList.add('hidden');
}

async function verificarContraseña(event) {
    event.preventDefault();
    
    const password = document.getElementById('passwordInput').value;
    const errorElement = document.getElementById('passwordError');
    
    errorElement.classList.add('hidden');
    errorElement.textContent = '';
    
    try {
        const response = await fetch('/api/verify-password', {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ password })
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            errorElement.textContent = data.message || 'Contraseña incorrecta';
            errorElement.classList.remove('hidden');
            return;
        }
        
        // Contraseña correcta
        passwordVerified = true;
        ocultarModalPassword();
        cargarAdministradores();
        setupFormSubmit();
    } catch (error) {
        console.error('Error:', error);
        errorElement.textContent = 'Error al verificar contraseña';
        errorElement.classList.remove('hidden');
    }
}

function salirDeAdmin() {
    window.location.href = '/dashboard';
}

// =====================================================
// CARGAR ADMINISTRADORES
// =====================================================

async function cargarAdministradores() {
    if (!passwordVerified) {
        mostrarModalPassword();
        return;
    }
    
    try {
        const data = await fetch('/api/administradores', {
            method: 'GET',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json'
            }
        }).then(res => res.json());

        administradoresData = data.data || [];
        renderAdministradores();
    } catch (error) {
        console.error('Error al cargar administradores:', error);
        mostrarNotificacion('Error al cargar administradores', 'error');
        document.getElementById('administradoresTable').innerHTML = `
            <tr><td colspan="5" class="text-center py-8 text-gray-500">Error al cargar datos</td></tr>
        `;
    }
}

// =====================================================
// RENDERIZAR TABLA DE ADMINISTRADORES
// =====================================================

function renderAdministradores() {
    const tbody = document.getElementById('administradoresTable');
    
    if (administradoresData.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="5" class="text-center py-8 text-gray-500 dark:text-gray-400">
                    <div class="empty-state">
                        <h3 class="text-lg font-semibold text-gray-600 dark:text-gray-400">No hay administradores</h3>
                        <p class="text-sm text-gray-500 dark:text-gray-500">Haz clic en "Nuevo Administrador" para crear uno</p>
                    </div>
                </td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = administradoresData.map(admin => {
        const fechaFormateada = formatDate(admin.created_at);
        
        return `
        <tr class="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
            <td class="px-6 py-4 text-sm font-medium text-text-main dark:text-white">
                ${admin.usuario}
            </td>
            <td class="px-6 py-4 text-sm text-text-main dark:text-gray-300">
                ${admin.nombre} ${admin.apellido_paterno} ${admin.apellido_materno || ''}
            </td>
            <td class="px-6 py-4 text-sm">
                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRolColor(admin.rol)}">
                    ${admin.rol}
                </span>
            </td>
            <td class="px-6 py-4 text-sm text-text-secondary dark:text-gray-400">
                ${fechaFormateada}
            </td>
            <td class="px-6 py-4 text-sm text-right space-x-2">
                <button onclick="editarAdministrador(${admin.id_usuario})" 
                        class="text-blue-600 hover:text-blue-900 dark:hover:text-blue-400 transition-colors"
                        title="Editar">
                    <span class="material-symbols-outlined">edit</span>
                </button>
                <button onclick="eliminarAdministrador(${admin.id_usuario}, '${admin.usuario}')" 
                        class="text-red-600 hover:text-red-900 dark:hover:text-red-400 transition-colors"
                        title="Eliminar">
                    <span class="material-symbols-outlined">delete</span>
                </button>
            </td>
        </tr>
        `;
    }).join('');
}

// =====================================================
// FUNCIONES DE MODAL
// =====================================================

function abrirModalAdministrador() {
    adminEnEdicion = null;
    document.getElementById('administradorForm').reset();
    document.getElementById('admin-modal-title').textContent = 'Nuevo Administrador';
    document.getElementById('password').required = true;
    document.getElementById('passwordRequired').textContent = '*';
    document.getElementById('passwordHint').innerHTML = '';
    document.getElementById('administradorModal').classList.remove('hidden');
}

function cerrarModalAdministrador() {
    document.getElementById('administradorModal').classList.add('hidden');
    document.getElementById('administradorForm').reset();
    adminEnEdicion = null;
}

// =====================================================
// EDITAR ADMINISTRADOR
// =====================================================

function editarAdministrador(idUsuario) {
    const admin = administradoresData.find(a => a.id_usuario === idUsuario);
    if (!admin) return;

    adminEnEdicion = admin;
    
    document.getElementById('usuario').value = admin.usuario;
    document.getElementById('nombre').value = admin.nombre;
    document.getElementById('apellido_paterno').value = admin.apellido_paterno;
    document.getElementById('apellido_materno').value = admin.apellido_materno;
    document.getElementById('rol').value = admin.rol;
    document.getElementById('password').value = '';
    document.getElementById('password').required = false;
    document.getElementById('passwordRequired').textContent = '';
    document.getElementById('passwordHint').innerHTML = '<span class="text-gray-500">Dejar vacío para mantener la contraseña actual</span>';
    
    document.getElementById('admin-modal-title').textContent = 'Editar Administrador';
    document.getElementById('administradorModal').classList.remove('hidden');
}

// =====================================================
// SETUP FORM SUBMIT
// =====================================================

function setupFormSubmit() {
    document.getElementById('administradorForm').addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const usuario = document.getElementById('usuario').value.trim();
        const nombre = document.getElementById('nombre').value.trim();
        const apellido_paterno = document.getElementById('apellido_paterno').value.trim();
        const apellido_materno = document.getElementById('apellido_materno').value.trim();
        const password = document.getElementById('password').value;
        const rol = document.getElementById('rol').value;

        if (!usuario || !nombre || !apellido_paterno) {
            mostrarNotificacion('Por favor completa los campos requeridos', 'error');
            return;
        }

        if (!adminEnEdicion && !password) {
            mostrarNotificacion('La contraseña es requerida para nuevos administradores', 'error');
            return;
        }

        try {
            const url = adminEnEdicion 
                ? `/api/administradores/${adminEnEdicion.id_usuario}`
                : '/api/administradores';
            
            const method = adminEnEdicion ? 'PUT' : 'POST';
            
            const payload = {
                usuario,
                nombre,
                apellido_paterno,
                apellido_materno,
                rol
            };

            if (password) {
                payload.password = password;
            }

            const response = await fetch(url, {
                method,
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            const data = await response.json();

            if (!response.ok) {
                mostrarNotificacion(data.message || 'Error al guardar', 'error');
                return;
            }

            mostrarNotificacion(
                adminEnEdicion 
                    ? 'Administrador actualizado correctamente' 
                    : 'Administrador creado correctamente',
                'success'
            );
            
            cerrarModalAdministrador();
            cargarAdministradores();

        } catch (error) {
            console.error('Error:', error);
            mostrarNotificacion('Error al guardar administrador', 'error');
        }
    });
}

// =====================================================
// ELIMINAR ADMINISTRADOR
// =====================================================

async function eliminarAdministrador(idUsuario, usuario) {
    if (!confirm(`¿Estás seguro de que deseas eliminar al administrador "${usuario}"?`)) {
        return;
    }

    try {
        const response = await fetch(`/api/administradores/${idUsuario}`, {
            method: 'DELETE',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        const data = await response.json();

        if (!response.ok) {
            mostrarNotificacion(data.message || 'Error al eliminar', 'error');
            return;
        }

        mostrarNotificacion('Administrador eliminado correctamente', 'success');
        cargarAdministradores();

    } catch (error) {
        console.error('Error:', error);
        mostrarNotificacion('Error al eliminar administrador', 'error');
    }
}

// =====================================================
// UTILIDADES
// =====================================================

function getRolColor(rol) {
    const colors = {
        'Administrador': 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
        'Operador': 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
    };
    return colors[rol] || 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
}

function formatDate(dateString) {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleString('es-MX', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
    });
}

function mostrarNotificacion(mensaje, tipo = 'info') {
    // Crear elemento de notificación
    const notification = document.createElement('div');
    notification.className = `fixed top-4 right-4 px-6 py-3 rounded-lg text-white text-sm font-medium z-50 animate-fade-in ${
        tipo === 'success' ? 'bg-green-500' :
        tipo === 'error' ? 'bg-red-500' :
        'bg-blue-500'
    }`;
    notification.textContent = mensaje;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}
