// =====================================================
// GESTIÓN DE EGRESADOS CON FILTRADO PROGRESIVO
// =====================================================

let egresadosData = [];
let isEditMode = false;
let currentMatricula = null;
let searchMode = 'cp'; // 'cp' o 'location'

// Estado de filtros seleccionados
let filtrosSeleccionados = {
    generacion: null,
    generacionTexto: '',
    carrera: null,
    carreraTexto: ''
};

// Cargar datos al iniciar
document.addEventListener('DOMContentLoaded', () => {
    loadGeneracionesStats();
    loadEstatus();
    setupSearchModeToggle();
    setupCodigoPostalSearch();
    setupLocationSearch();
});

// =====================================================
// FLUJO PROGRESIVO - NIVEL 1: GENERACIONES
// =====================================================

async function loadGeneracionesStats() {
    try {
        const data = await fetchAPI('/api/egresados/stats/generaciones');
        renderGeneraciones(data.data);
    } catch (error) {
        showNotification('Error al cargar generaciones', 'error');
        document.getElementById('generacionesGrid').innerHTML = `
            <div class="text-center py-8 col-span-full text-gray-500">
                Error al cargar datos
            </div>
        `;
    }
}

function renderGeneraciones(statsData) {
    const grid = document.getElementById('generacionesGrid');
    const { generaciones, total_general } = statsData;
    
    if (!generaciones || generaciones.length === 0) {
        grid.innerHTML = `
            <div class="text-center py-8 col-span-full text-gray-500">
                No hay generaciones registradas
            </div>
        `;
        return;
    }
    
    // Tarjeta "Mostrar todas"
    let html = `
        <div onclick="seleccionarGeneracion('all', 'Todas las generaciones')" 
             class="bg-gradient-to-br from-primary to-primary-hover text-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer p-6 transform hover:scale-105">
            <div class="flex items-center justify-between mb-3">
                <span class="material-symbols-outlined text-4xl">school</span>
                <div class="bg-white/20 rounded-full px-3 py-1">
                    <span class="text-sm font-semibold">${total_general}</span>
                </div>
            </div>
            <h3 class="text-lg font-bold mb-1">Todas</h3>
            <p class="text-sm text-white/80">Ver todos los egresados</p>
        </div>
    `;
    
    // Tarjetas de generaciones individuales
    generaciones.forEach(gen => {
        html += `
            <div onclick="seleccionarGeneracion(${gen.id_generacion}, '${gen.periodo}')" 
                 class="bg-white dark:bg-[#2a1a1e] rounded-xl shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer p-6 border border-card-border dark:border-[#3a252a] transform hover:scale-105 hover:border-primary">
                <div class="flex items-center justify-between mb-3">
                    <span class="material-symbols-outlined text-primary text-3xl">calendar_month</span>
                    <div class="bg-primary/10 dark:bg-primary/20 rounded-full px-3 py-1">
                        <span class="text-sm font-semibold text-primary">${gen.total_egresados}</span>
                    </div>
                </div>
                <h3 class="text-lg font-bold text-text-main dark:text-white mb-1">${gen.periodo}</h3>
                <p class="text-sm text-text-secondary dark:text-gray-400">
                    ${gen.total_egresados} ${gen.total_egresados === 1 ? 'egresado' : 'egresados'}
                </p>
            </div>
        `;
    });
    
    grid.innerHTML = html;
}

function seleccionarGeneracion(idGeneracion, textoGeneracion) {
    filtrosSeleccionados.generacion = idGeneracion;
    filtrosSeleccionados.generacionTexto = textoGeneracion;
    
    // Ocultar vista de generaciones y mostrar vista de carreras
    document.getElementById('vistaGeneraciones').classList.add('hidden');
    document.getElementById('vistaCarreras').classList.remove('hidden');
    
    // Actualizar texto de generación seleccionada
    document.getElementById('generacionSeleccionada').textContent = textoGeneracion;
    
    // Cargar carreras según la generación seleccionada
    loadCarrerasStats(idGeneracion);
}

// =====================================================
// FLUJO PROGRESIVO - NIVEL 2: CARRERAS
// =====================================================

async function loadCarrerasStats(idGeneracion) {
    try {
        const data = await fetchAPI(`/api/egresados/stats/carreras/${idGeneracion}`);
        renderCarreras(data.data);
    } catch (error) {
        showNotification('Error al cargar carreras', 'error');
        document.getElementById('carrerasGrid').innerHTML = `
            <div class="text-center py-8 col-span-full text-gray-500">
                Error al cargar datos
            </div>
        `;
    }
}

function renderCarreras(statsData) {
    const grid = document.getElementById('carrerasGrid');
    const { carreras, total_general } = statsData;
    
    if (!carreras || carreras.length === 0) {
        grid.innerHTML = `
            <div class="text-center py-8 col-span-full text-gray-500">
                No hay carreras registradas
            </div>
        `;
        return;
    }
    
    // Tarjeta "Mostrar todas"
    let html = `
        <div onclick="seleccionarCarrera('all', 'Todas las carreras')" 
             class="bg-gradient-to-br from-secondary to-primary text-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer p-6 transform hover:scale-105">
            <div class="flex items-center justify-between mb-3">
                <span class="material-symbols-outlined text-4xl">grid_view</span>
                <div class="bg-white/20 rounded-full px-3 py-1">
                    <span class="text-sm font-semibold">${total_general}</span>
                </div>
            </div>
            <h3 class="text-lg font-bold mb-1">Todas</h3>
            <p class="text-sm text-white/80">Ver todas las carreras</p>
        </div>
    `;
    
    // Tarjetas de carreras individuales
    carreras.forEach(carrera => {
        const nombreEscapado = carrera.nombre.replace(/'/g, "\\'");
        html += `
            <div onclick="seleccionarCarrera(${carrera.id_carrera}, '${nombreEscapado}')" 
                 class="bg-white dark:bg-[#2a1a1e] rounded-xl shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer p-6 border border-card-border dark:border-[#3a252a] transform hover:scale-105 hover:border-secondary">
                <div class="flex items-center justify-between mb-3">
                    <span class="material-symbols-outlined text-secondary text-3xl">auto_stories</span>
                    <div class="bg-secondary/10 dark:bg-secondary/20 rounded-full px-3 py-1">
                        <span class="text-sm font-semibold text-secondary">${carrera.total_egresados}</span>
                    </div>
                </div>
                <h3 class="text-base font-bold text-text-main dark:text-white mb-1 line-clamp-2">${carrera.nombre}</h3>
                <p class="text-sm text-text-secondary dark:text-gray-400">
                    ${carrera.total_egresados} ${carrera.total_egresados === 1 ? 'egresado' : 'egresados'}
                </p>
            </div>
        `;
    });
    
    grid.innerHTML = html;
}

function seleccionarCarrera(idCarrera, textoCarrera) {
    filtrosSeleccionados.carrera = idCarrera;
    filtrosSeleccionados.carreraTexto = textoCarrera;
    
    // Ocultar vista de carreras y mostrar vista de tabla
    document.getElementById('vistaCarreras').classList.add('hidden');
    document.getElementById('vistaTabla').classList.remove('hidden');
    
    // Actualizar breadcrumb de filtros
    document.getElementById('filtroGeneracion').textContent = filtrosSeleccionados.generacionTexto;
    document.getElementById('filtroCarrera').textContent = filtrosSeleccionados.carreraTexto;
    
    // Cargar egresados filtrados
    loadEgresadosFiltrados();
}

// =====================================================
// NAVEGACIÓN ENTRE VISTAS
// =====================================================

function volverAGeneraciones() {
    // Resetear filtros
    filtrosSeleccionados = {
        generacion: null,
        generacionTexto: '',
        carrera: null,
        carreraTexto: ''
    };
    
    // Ocultar todas las vistas excepto generaciones
    document.getElementById('vistaGeneraciones').classList.remove('hidden');
    document.getElementById('vistaCarreras').classList.add('hidden');
    document.getElementById('vistaTabla').classList.add('hidden');
    
    // Limpiar filtros de búsqueda
    clearSearchFilters();
}

function volverACarreras() {
    // Mantener generación pero limpiar carrera
    filtrosSeleccionados.carrera = null;
    filtrosSeleccionados.carreraTexto = '';
    
    // Mostrar vista de carreras
    document.getElementById('vistaCarreras').classList.remove('hidden');
    document.getElementById('vistaTabla').classList.add('hidden');
    
    // Recargar carreras
    loadCarrerasStats(filtrosSeleccionados.generacion);
    
    // Limpiar filtros de búsqueda
    clearSearchFilters();
}

// =====================================================
// CARGAR EGRESADOS FILTRADOS
// =====================================================

async function loadEgresadosFiltrados() {
    try {
        const params = new URLSearchParams();
        
        if (filtrosSeleccionados.generacion && filtrosSeleccionados.generacion !== 'all') {
            params.append('generacion', filtrosSeleccionados.generacion);
        }
        
        if (filtrosSeleccionados.carrera && filtrosSeleccionados.carrera !== 'all') {
            params.append('carrera', filtrosSeleccionados.carrera);
        }
        
        const data = await fetchAPI(`/api/egresados/filtrados?${params.toString()}`);
        egresadosData = data.data || [];
        renderEgresados(egresadosData);
        
        // Setup filtros adicionales de búsqueda
        setupTableFilters();
    } catch (error) {
        showNotification('Error al cargar egresados', 'error');
        document.getElementById('egresadosTable').innerHTML = `
            <tr><td colspan="7" class="text-center py-8 text-gray-500">Error al cargar datos</td></tr>
        `;
    }
}

// =====================================================
// ALTERNAR MÉTODO DE BÚSQUEDA
// =====================================================

function setupSearchModeToggle() {
    const toggleBtn = document.getElementById('toggleSearchMode');
    const searchByCP = document.getElementById('searchByCP');
    const searchByLocation = document.getElementById('searchByLocation');
    
    toggleBtn?.addEventListener('click', () => {
        if (searchMode === 'cp') {
            // Cambiar a búsqueda por ubicación
            searchMode = 'location';
            searchByCP.classList.add('hidden');
            searchByLocation.classList.remove('hidden');
            toggleBtn.textContent = '🔄 Buscar por Código Postal';
            
            // Cargar estados si no están cargados
            loadEstadosSelect();
        } else {
            // Cambiar a búsqueda por CP
            searchMode = 'cp';
            searchByCP.classList.remove('hidden');
            searchByLocation.classList.add('hidden');
            toggleBtn.textContent = '🔄 Buscar por Estado/Municipio';
        }
        
        // Limpiar campos
        clearAddressFields();
    });
}

// =====================================================
// BÚSQUEDA POR CÓDIGO POSTAL
// =====================================================

function setupCodigoPostalSearch() {
    const cpInput = document.getElementById('codigo_postal_search');
    
    cpInput?.addEventListener('input', async function(e) {
        const cp = e.target.value.trim();
        const errorMsg = document.getElementById('cp_error');
        const estadoInput = document.getElementById('estado_readonly');
        const municipioInput = document.getElementById('municipio_readonly');
        const asentamientoSelect = document.getElementById('asentamiento_select');
        
        // Limpiar campos
        estadoInput.value = '';
        municipioInput.value = '';
        asentamientoSelect.innerHTML = '<option value="">Seleccione una colonia</option>';
        errorMsg.classList.add('hidden');
        
        // Validar longitud
        if (cp.length !== 5) {
            return;
        }
        
        try {
            const data = await fetchAPI(`/api/codigo-postal/${cp}`);
            
            if (data.success) {
                const info = data.data;
                
                // Llenar campos readonly
                estadoInput.value = info.estado;
                municipioInput.value = info.municipio;
                
                // Llenar asentamientos
                asentamientoSelect.innerHTML = '<option value="">Seleccione una colonia</option>';
                info.asentamientos.forEach(asenta => {
                    const option = document.createElement('option');
                    option.value = asenta;
                    option.textContent = asenta;
                    asentamientoSelect.appendChild(option);
                });
                
                // Guardar en campos hidden
                document.getElementById('codigo_postal').value = cp;
                document.getElementById('estado').value = info.estado;
                document.getElementById('municipio').value = info.municipio;
                
                errorMsg.classList.add('hidden');
            }
        } catch (error) {
            errorMsg.textContent = 'Código postal no encontrado';
            errorMsg.classList.remove('hidden');
        }
    });
    
    // Cuando selecciona un asentamiento
    document.getElementById('asentamiento_select')?.addEventListener('change', function(e) {
        document.getElementById('asentamiento').value = e.target.value;
    });
}

// =====================================================
// BÚSQUEDA POR ESTADO/MUNICIPIO
// =====================================================

function setupLocationSearch() {
    const estadoSelect = document.getElementById('estado_select');
    const municipioSelect = document.getElementById('municipio_select');
    const asentamientoSelect = document.getElementById('asentamiento_location_select');
    const cpGenerated = document.getElementById('codigo_postal_generated');
    
    // Cuando selecciona un estado
    estadoSelect?.addEventListener('change', async function(e) {
        const estado = e.target.value;
        
        // Limpiar municipios y asentamientos
        municipioSelect.innerHTML = '<option value="">Cargando municipios...</option>';
        municipioSelect.disabled = true;
        asentamientoSelect.innerHTML = '<option value="">Primero seleccione un municipio</option>';
        asentamientoSelect.disabled = true;
        cpGenerated.value = '';
        
        if (!estado) {
            municipioSelect.innerHTML = '<option value="">Primero seleccione un estado</option>';
            return;
        }
        
        try {
            const data = await fetchAPI(`/api/municipios/${encodeURIComponent(estado)}`);
            
            if (data.success) {
                municipioSelect.innerHTML = '<option value="">Seleccione un municipio</option>';
                data.data.forEach(municipio => {
                    const option = document.createElement('option');
                    option.value = municipio;
                    option.textContent = municipio;
                    municipioSelect.appendChild(option);
                });
                municipioSelect.disabled = false;
                
                // Guardar estado en hidden
                document.getElementById('estado').value = estado;
            }
        } catch (error) {
            showNotification('Error al cargar municipios', 'error');
        }
    });
    
    // Cuando selecciona un municipio
    municipioSelect?.addEventListener('change', async function(e) {
        const municipio = e.target.value;
        const estado = estadoSelect.value;
        
        asentamientoSelect.innerHTML = '<option value="">Cargando asentamientos...</option>';
        asentamientoSelect.disabled = true;
        cpGenerated.value = '';
        
        if (!municipio) {
            asentamientoSelect.innerHTML = '<option value="">Primero seleccione un municipio</option>';
            return;
        }
        
        try {
            const data = await fetchAPI(`/api/asentamientos/${encodeURIComponent(municipio)}?estado=${encodeURIComponent(estado)}`);
            
            if (data.success) {
                asentamientoSelect.innerHTML = '<option value="">Seleccione un asentamiento</option>';
                data.data.forEach(item => {
                    const option = document.createElement('option');
                    option.value = item.asentamiento;
                    option.dataset.cp = item.codigo_postal;
                    option.textContent = `${item.asentamiento} (CP: ${item.codigo_postal})`;
                    asentamientoSelect.appendChild(option);
                });
                asentamientoSelect.disabled = false;
                
                // Guardar municipio en hidden
                document.getElementById('municipio').value = municipio;
            }
        } catch (error) {
            showNotification('Error al cargar asentamientos', 'error');
        }
    });
    
    // Cuando selecciona un asentamiento
    asentamientoSelect?.addEventListener('change', function(e) {
        const selectedOption = e.target.options[e.target.selectedIndex];
        const cp = selectedOption.dataset.cp;
        const asentamiento = e.target.value;
        
        if (cp) {
            cpGenerated.value = cp;
            document.getElementById('codigo_postal').value = cp;
        }
        
        if (asentamiento) {
            document.getElementById('asentamiento').value = asentamiento;
        }
    });
}

// =====================================================
// CARGAR ESTADOS PARA SELECT
// =====================================================

async function loadEstadosSelect() {
    const estadoSelect = document.getElementById('estado_select');
    
    if (!estadoSelect || estadoSelect.dataset.loaded === 'true') {
        return; // Ya está cargado
    }
    
    try {
        const data = await fetchAPI('/api/estados');
        
        if (data.success) {
            estadoSelect.innerHTML = '<option value="">Seleccione un estado</option>';
            data.data.forEach(estado => {
                const option = document.createElement('option');
                option.value = estado;
                option.textContent = estado;
                estadoSelect.appendChild(option);
            });
            estadoSelect.dataset.loaded = 'true';
        }
    } catch (error) {
        showNotification('Error al cargar estados', 'error');
    }
}

// =====================================================
// LIMPIAR CAMPOS DE DIRECCIÓN
// =====================================================

function clearAddressFields() {
    // Campos de búsqueda por CP
    document.getElementById('codigo_postal_search').value = '';
    document.getElementById('estado_readonly').value = '';
    document.getElementById('municipio_readonly').value = '';
    document.getElementById('asentamiento_select').innerHTML = '<option value="">Primero ingrese el código postal</option>';
    
    // Campos de búsqueda por ubicación
    document.getElementById('estado_select').value = '';
    document.getElementById('municipio_select').innerHTML = '<option value="">Primero seleccione un estado</option>';
    document.getElementById('municipio_select').disabled = true;
    document.getElementById('asentamiento_location_select').innerHTML = '<option value="">Primero seleccione un municipio</option>';
    document.getElementById('asentamiento_location_select').disabled = true;
    document.getElementById('codigo_postal_generated').value = '';
    
    // Campos hidden
    document.getElementById('codigo_postal').value = '';
    document.getElementById('estado').value = '';
    document.getElementById('municipio').value = '';
    document.getElementById('asentamiento').value = '';
    
    // Otros campos
    document.getElementById('calle').value = '';
    document.getElementById('numero').value = '';
}

// =====================================================
// CARGAR DATOS
// =====================================================

async function loadCarreras() {
    try {
        const data = await fetchAPI('/api/carreras');
        const select = document.getElementById('id_carrera');
        
        select.innerHTML = '<option value="">Seleccione una carrera</option>';
        
        data.data.forEach(carrera => {
            select.innerHTML += `<option value="${carrera.id_carrera}">${carrera.nombre}</option>`;
        });
    } catch (error) {
        showNotification('Error al cargar carreras', 'error');
    }
}

async function loadGeneraciones() {
    try {
        const data = await fetchAPI('/api/generaciones');
        const select = document.getElementById('id_generacion');
        
        select.innerHTML = '<option value="">Seleccione una generación</option>';
        
        data.data.forEach(gen => {
            select.innerHTML += `<option value="${gen.id_generacion}">${gen.periodo}</option>`;
        });
    } catch (error) {
        showNotification('Error al cargar generaciones', 'error');
    }
}

async function loadEstatus() {
    try {
        const data = await fetchAPI('/api/estatus');
        const select = document.getElementById('id_estatus');
        const filterSelect = document.getElementById('filterEstatus');
        
        if (select) {
            select.innerHTML = '<option value="">Seleccione un estatus</option>';
            data.data.forEach(est => {
                select.innerHTML += `<option value="${est.id_estatus}">${est.descripcion}</option>`;
            });
        }
        
        if (filterSelect) {
            filterSelect.innerHTML = '<option value="">Todos los estatus</option>';
            data.data.forEach(est => {
                filterSelect.innerHTML += `<option value="${est.id_estatus}">${est.descripcion}</option>`;
            });
        }
    } catch (error) {
        showNotification('Error al cargar estatus', 'error');
    }
}

// =====================================================
// RENDERIZAR TABLA
// =====================================================

function renderEgresados(egresados) {
    const tbody = document.getElementById('egresadosTable');
    
    if (egresados.length === 0) {
        tbody.innerHTML = `
            <tr class="grid md:grid-cols-[0.8fr_2fr_1fr_2fr_1.5fr_1.5fr_1.2fr] px-6">
                <td colspan="7" class="text-center py-8 col-span-full">
                    <div class="empty-state">
                        <h3 class="text-lg font-semibold text-gray-600 dark:text-gray-400">No hay egresados con estos filtros</h3>
                        <p class="text-sm text-gray-500 dark:text-gray-500">Intenta con otros criterios de búsqueda</p>
                    </div>
                </td>
            </tr>
        `;
        return;
    }
    
    tbody.innerHTML = egresados.map(e => {
        const avatar = getInitialsAvatar(e.nombre_completo);
        const { color: estatusColor, label: estatusLabel } = getEstatusInfo(e.id_estatus, e.descripcion_estatus);
        const fechaFormateada = formatDate(e.created_at);
        const emailShort = e.correo ? e.correo.substring(0, 20) + (e.correo.length > 20 ? '...' : '') : '-';
        const telefonoDisplay = e.telefono || '-';
        
        return `
        <tr class="grid md:grid-cols-[0.8fr_2fr_1fr_2fr_1.5fr_1.5fr_1.2fr] px-6 border-b border-[#edeef2] dark:border-[#3a252a] hover:bg-[#fb4f83] hover:text-white dark:hover:bg-[#fb4f83] transition-colors duration-200 group">
            
            <!-- Matrícula -->
            <td class="flex items-center py-4 before:content-[attr(data-title)] before:font-semibold before:mr-2 before:text-[#141a4e] md:before:content-none group-hover:before:text-white dark:before:text-gray-300" data-title="Matrícula:">
                <span class="text-sm font-medium text-[#141a4e] dark:text-white group-hover:text-white">${e.matricula}</span>
            </td>

            <!-- Nombre con Avatar -->
            <td class="flex items-center gap-3 py-4 before:content-[attr(data-title)] before:font-semibold before:mr-2 before:text-[#141a4e] md:before:content-none group-hover:before:text-white dark:before:text-gray-300" data-title="Nombre:">
                <div class="flex items-center gap-3">
                    ${avatar}
                    <span class="font-semibold text-[#141a4e] dark:text-white group-hover:text-white text-sm">${e.nombre_completo}</span>
                </div>
            </td>

            <!-- Estatus -->
            <td class="flex items-center gap-2 py-4 before:content-[attr(data-title)] before:font-semibold before:mr-2 before:text-[#141a4e] md:before:content-none group-hover:before:text-white dark:before:text-gray-300" data-title="Estatus:">
                <span class="w-4 h-4 rounded-full flex-shrink-0" style="background-color: ${estatusColor};"></span>
                <span class="text-sm text-[#141a4e] dark:text-white group-hover:text-white">${estatusLabel}</span>
            </td>

            <!-- Carrera -->
            <td class="py-4 before:content-[attr(data-title)] before:font-semibold before:mr-2 before:text-[#141a4e] md:before:content-none group-hover:before:text-white dark:before:text-gray-300" data-title="Carrera:">
                <span class="text-sm text-[#141a4e] dark:text-gray-300 group-hover:text-white">${e.nombre_carrera || '-'}</span>
            </td>

            <!-- Generación -->
            <td class="py-4 before:content-[attr(data-title)] before:font-semibold before:mr-2 before:text-[#141a4e] md:before:content-none group-hover:before:text-white dark:before:text-gray-300" data-title="Generación:">
                <span class="text-sm text-[#141a4e] dark:text-gray-300 group-hover:text-white">${e.periodo_generacion || '-'}</span>
            </td>

            <!-- Contacto -->
            <td class="py-4 before:content-[attr(data-title)] before:font-semibold before:mr-2 before:text-[#141a4e] md:before:content-none group-hover:before:text-white dark:before:text-gray-300" data-title="Contacto:">
                <div class="text-sm">
                    <div class="text-[#141a4e] dark:text-gray-300 group-hover:text-white">${emailShort}</div>
                    <div class="text-xs text-gray-500 group-hover:text-white/80">${telefonoDisplay}</div>
                </div>
            </td>

            <!-- Acciones -->
            <td class="py-4 text-right before:content-[attr(data-title)] before:font-semibold before:mr-2 before:text-[#141a4e] md:before:content-none group-hover:before:text-white dark:before:text-gray-300" data-title="Acciones:">
                <div class="flex gap-2 md:justify-end">
                    <button onclick="editEgresado('${e.matricula}')" 
                            class="text-secondary hover:text-primary group-hover:text-white group-hover:hover:text-white/80 transition-colors p-2 rounded-lg hover:bg-white/10"
                            title="Editar">
                        <span class="material-symbols-outlined text-[20px]">edit</span>
                    </button>
                    <button onclick="deleteEgresado('${e.matricula}')" 
                            class="text-red-600 hover:text-red-900 group-hover:text-white group-hover:hover:text-white/80 dark:hover:text-red-400 transition-colors p-2 rounded-lg hover:bg-white/10"
                            title="Eliminar">
                        <span class="material-symbols-outlined text-[20px]">delete</span>
                    </button>
                </div>
            </td>

        </tr>
        `;
    }).join('');
    
    // Copiar títulos del thead a data-title del tbody para responsive
    applyDataTitles();
}

// Función para copiar títulos del thead a los data-title de las celdas
function applyDataTitles() {
    const headTitles = document.querySelectorAll("#egresadosTableMain thead th");
    const bodyRows = document.querySelectorAll("#egresadosTableMain tbody tr");
    
    bodyRows.forEach(row => {
        const cells = row.querySelectorAll("td");
        cells.forEach((cell, index) => {
            if (headTitles[index] && !cell.hasAttribute('colspan')) {
                const title = headTitles[index].innerText;
                cell.setAttribute("data-title", title + ":");
            }
        });
    });
}

// Función para obtener avatar con iniciales
function getInitialsAvatar(nombre) {
    if (!nombre) return '<div class="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center text-white font-semibold">?</div>';
    
    const palabras = nombre.trim().split(' ');
    let iniciales = '';
    
    if (palabras.length >= 2) {
        iniciales = palabras[0][0] + palabras[1][0];
    } else {
        iniciales = palabras[0].substring(0, 2);
    }
    
    // Colores aleatorios pero consistentes basados en el nombre
    const colors = [
        'bg-blue-500', 'bg-green-500', 'bg-purple-500', 
        'bg-pink-500', 'bg-indigo-500', 'bg-red-500',
        'bg-yellow-500', 'bg-teal-500'
    ];
    const colorIndex = nombre.charCodeAt(0) % colors.length;
    const bgColor = colors[colorIndex];
    
    return `<div class="w-10 h-10 rounded-full ${bgColor} flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">${iniciales.toUpperCase()}</div>`;
}

// Función para obtener información del estatus
function getEstatusInfo(idEstatus, descripcion) {
    let color, label;
    
    switch(idEstatus) {
        case 1: // Activo
            color = '#25be64';
            label = descripcion || 'Activo';
            break;
        case 2: // Inactivo
            color = '#dadde4';
            label = descripcion || 'Inactivo';
            break;
        case 3: // Nuevo
            color = '#febf02';
            label = descripcion || 'Nuevo';
            break;
        default:
            color = '#dadde4';
            label = descripcion || 'Desconocido';
    }
    
    return { color, label };
}

// Función para formatear fecha
function formatDate(dateString) {
    if (!dateString) return '-';
    
    const date = new Date(dateString);
    const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    
    const month = months[date.getMonth()];
    const day = date.getDate();
    const year = date.getFullYear();
    
    return `${month} ${day}, ${year}`;
}

function getEstatusBadgeClass(idEstatus) {
    switch(idEstatus) {
        case 1: return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
        case 2: return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
        case 3: return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
        default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
    }
}

// =====================================================
// FILTROS DE BÚSQUEDA EN TABLA
// =====================================================

function setupTableFilters() {
    const searchInput = document.getElementById('searchInput');
    const filterEstatus = document.getElementById('filterEstatus');
    
    const applyFilters = () => {
        let filtered = [...egresadosData];
        
        const searchTerm = searchInput.value.toLowerCase();
        if (searchTerm) {
            filtered = filtered.filter(e => 
                e.matricula.toLowerCase().includes(searchTerm) ||
                e.nombre_completo.toLowerCase().includes(searchTerm)
            );
        }
        
        const estatusId = filterEstatus.value;
        if (estatusId) {
            filtered = filtered.filter(e => e.id_estatus == estatusId);
        }
        
        renderEgresados(filtered);
    };
    
    searchInput?.addEventListener('input', applyFilters);
    filterEstatus?.addEventListener('change', applyFilters);
}

function clearSearchFilters() {
    const searchInput = document.getElementById('searchInput');
    const filterEstatus = document.getElementById('filterEstatus');
    
    if (searchInput) searchInput.value = '';
    if (filterEstatus) filterEstatus.value = '';
    
    if (egresadosData.length > 0) {
        renderEgresados(egresadosData);
    }
}

// =====================================================
// MODAL
// =====================================================

function openModal() {
    isEditMode = false;
    currentMatricula = null;
    searchMode = 'cp';
    
    document.getElementById('modalTitle').textContent = 'Nuevo Egresado';
    document.getElementById('egresadoForm').reset();
    document.getElementById('matricula').readOnly = false;
    
    // Cargar catálogos si no están cargados
    loadCarreras();
    loadGeneraciones();
    
    // Mostrar búsqueda por CP por defecto
    document.getElementById('searchByCP').classList.remove('hidden');
    document.getElementById('searchByLocation').classList.add('hidden');
    document.getElementById('toggleSearchMode').textContent = '🔄 Buscar por Estado/Municipio';
    
    clearAddressFields();
    
    document.getElementById('egresadoModal').style.display = 'block';
}

function closeModal() {
    document.getElementById('egresadoModal').style.display = 'none';
    document.getElementById('egresadoForm').reset();
    clearAddressFields();
}

window.onclick = function(event) {
    const modal = document.getElementById('egresadoModal');
    if (event.target == modal) {
        closeModal();
    }
}

// =====================================================
// CREAR/EDITAR EGRESADO
// =====================================================

document.getElementById('egresadoForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const formData = {
        matricula: document.getElementById('matricula').value.trim(),
        nombre_completo: document.getElementById('nombre_completo').value.trim(),
        genero: document.getElementById('genero').value || null,
        telefono: document.getElementById('telefono').value.trim() || null,
        correo: document.getElementById('correo').value.trim() || null,
        codigo_postal: document.getElementById('codigo_postal').value || null,
        estado: document.getElementById('estado').value || null,
        municipio: document.getElementById('municipio').value || null,
        asentamiento: document.getElementById('asentamiento').value || null,
        calle: document.getElementById('calle').value.trim() || null,
        numero: document.getElementById('numero').value.trim() || null,
        id_carrera: parseInt(document.getElementById('id_carrera').value),
        id_generacion: parseInt(document.getElementById('id_generacion').value),
        id_estatus: parseInt(document.getElementById('id_estatus').value),
    };
    
    // Validaciones
    if (formData.matricula.length !== 8) {
        showNotification('La matrícula debe tener 8 caracteres', 'error');
        return;
    }
    
    if (formData.correo && !isValidEmail(formData.correo)) {
        showNotification('El correo electrónico no es válido', 'error');
        return;
    }
    
    const submitBtn = e.target.querySelector('button[type="submit"]');
    setButtonLoading(submitBtn, true);
    
    try {
        if (isEditMode) {
            await fetchAPI(`/api/egresados/${currentMatricula}`, {
                method: 'PUT',
                body: JSON.stringify(formData),
            });
            showNotification('Egresado actualizado correctamente', 'success');
        } else {
            await fetchAPI('/api/egresados', {
                method: 'POST',
                body: JSON.stringify(formData),
            });
            showNotification('Egresado creado correctamente', 'success');
        }
        
        closeModal();
        
        // Recargar datos si estamos en la vista de tabla
        if (!document.getElementById('vistaTabla').classList.contains('hidden')) {
            loadEgresadosFiltrados();
        }
    } catch (error) {
        showNotification(error.message || 'Error al guardar egresado', 'error');
    } finally {
        setButtonLoading(submitBtn, false);
    }
});

// =====================================================
// EDITAR EGRESADO
// =====================================================

async function editEgresado(matricula) {
    try {
        const data = await fetchAPI(`/api/egresados/${matricula}`);
        const egresado = data.data;
        
        isEditMode = true;
        currentMatricula = matricula;
        
        // Cargar catálogos primero
        await Promise.all([loadCarreras(), loadGeneraciones()]);
        
        document.getElementById('modalTitle').textContent = 'Editar Egresado';
        document.getElementById('matricula').value = egresado.matricula;
        document.getElementById('matricula').readOnly = true;
        document.getElementById('nombre_completo').value = egresado.nombre_completo;
        document.getElementById('genero').value = egresado.genero || '';
        document.getElementById('telefono').value = egresado.telefono || '';
        document.getElementById('correo').value = egresado.correo || '';
        
        // Dirección
        if (egresado.codigo_postal) {
            document.getElementById('codigo_postal_search').value = egresado.codigo_postal;
            document.getElementById('estado_readonly').value = egresado.estado || '';
            document.getElementById('municipio_readonly').value = egresado.municipio || '';
            
            // Simular búsqueda de CP para cargar asentamientos
            const cpEvent = new Event('input', { bubbles: true });
            document.getElementById('codigo_postal_search').dispatchEvent(cpEvent);
            
            setTimeout(() => {
                const asentaSelect = document.getElementById('asentamiento_select');
                if (asentaSelect && egresado.asentamiento) {
                    asentaSelect.value = egresado.asentamiento;
                }
            }, 500);
        }
        
        document.getElementById('calle').value = egresado.calle || '';
        document.getElementById('numero').value = egresado.numero || '';
        
        // Datos académicos
        document.getElementById('id_carrera').value = egresado.id_carrera;
        document.getElementById('id_generacion').value = egresado.id_generacion;
        document.getElementById('id_estatus').value = egresado.id_estatus;
        
        document.getElementById('egresadoModal').style.display = 'block';
    } catch (error) {
        showNotification('Error al cargar datos del egresado', 'error');
    }
}

// =====================================================
// ELIMINAR EGRESADO
// =====================================================

async function deleteEgresado(matricula) {
    if (!confirmAction('¿Está seguro de eliminar este egresado? Esta acción no se puede deshacer.')) {
        return;
    }
    
    try {
        await fetchAPI(`/api/egresados/${matricula}`, {
            method: 'DELETE',
        });
        showNotification('Egresado eliminado correctamente', 'success');
        
        // Recargar datos si estamos en la vista de tabla
        if (!document.getElementById('vistaTabla').classList.contains('hidden')) {
            loadEgresadosFiltrados();
        }
    } catch (error) {
        showNotification('Error al eliminar egresado', 'error');
    }
}