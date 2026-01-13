// =====================================================
// TEMA (MODO CLARO/OSCURO)
// =====================================================

// Función para aplicar el tema
function applyTheme(theme) {
    const html = document.documentElement;
    const icon = document.getElementById('themeIcon');
    
    if (theme === 'dark') {
        html.classList.add('dark');
        if (icon) icon.textContent = 'dark_mode';
    } else {
        html.classList.remove('dark');
        if (icon) icon.textContent = 'light_mode';
    }
    
    localStorage.setItem('theme', theme);
    // Emitir evento con el tema para que dashboard.js lo use
    setTimeout(() => {
        document.dispatchEvent(new CustomEvent('themechange', { detail: { theme } }));
    }, 0);
}

// Obtener tema actual
function getCurrentTheme() {
    return localStorage.getItem('theme') || 
           (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
}

// Toggle del tema
function toggleTheme() {
    const currentTheme = document.documentElement.classList.contains('dark') ? 'dark' : 'light';
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    applyTheme(newTheme);
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    // Aplicar tema guardado
    const savedTheme = getCurrentTheme();
    applyTheme(savedTheme);
    
    // Agregar listener al botón
    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', toggleTheme);
        console.log('✅ Toggle de tema inicializado');
    } else {
        console.warn('⚠️ No se encontró el botón themeToggle');
    }
});

// Escuchar cambios en las preferencias del sistema
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
    if (!localStorage.getItem('theme')) {
        applyTheme(e.matches ? 'dark' : 'light');
    }
});

console.log('✅ Script de tema cargado');
