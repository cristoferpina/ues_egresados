// =====================================================
// AUTENTICACIÓN
// =====================================================

document.getElementById('loginForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const usuario = document.getElementById('usuario').value.trim();
    const password = document.getElementById('password').value;
    const errorDiv = document.getElementById('errorMessage');
    const errorText = document.getElementById('errorText');
    const submitBtn = e.target.querySelector('button[type="submit"]');
    
    // Limpiar errores previos
    errorDiv.classList.add('hidden');
    
    // Validaciones básicas
    if (!usuario || !password) {
        errorText.textContent = 'Por favor complete todos los campos';
        errorDiv.classList.remove('hidden');
        return;
    }
    
    // Deshabilitar botón
    const originalText = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.innerHTML = `
        <span class="absolute left-0 inset-y-0 flex items-center pl-3">
            <span class="material-symbols-outlined text-white/50 animate-spin">progress_activity</span>
        </span>
        Iniciando sesión...
    `;
    
    try {
        const response = await fetch('/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ usuario, password }),
        });
        
        const data = await response.json();
        
        if (response.ok && data.success) {
            // Redirigir al dashboard
            window.location.href = '/dashboard';
        } else {
            errorText.textContent = data.error || 'Usuario o contraseña incorrectos';
            errorDiv.classList.remove('hidden');
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalText;
        }
    } catch (error) {
        console.error('Error en login:', error);
        errorText.textContent = 'Error al conectar con el servidor';
        errorDiv.classList.remove('hidden');
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalText;
    }
});

// Limpiar mensaje de error al escribir
document.getElementById('usuario')?.addEventListener('input', () => {
    document.getElementById('errorMessage').classList.add('hidden');
});

document.getElementById('password')?.addEventListener('input', () => {
    document.getElementById('errorMessage').classList.add('hidden');
});

// Toggle password visibility (ya incluido en el HTML pero aquí está la función)
function togglePassword() {
    const passwordInput = document.getElementById('password');
    const toggleIcon = document.getElementById('toggleIcon');
    
    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        toggleIcon.textContent = 'visibility_off';
    } else {
        passwordInput.type = 'password';
        toggleIcon.textContent = 'visibility';
    }
}
