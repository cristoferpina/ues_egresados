// =====================================================
// DASHBOARD - GRÁFICOS CON CHART.JS
// =====================================================

// Paleta de colores del proyecto
const COLORS = {
    primary: '#2563eb',
    secondary: '#64748b',
    success: '#25be64',
    warning: '#febf02',
    danger: '#fb4f83',
    info: '#0ea5e9',
    light: '#f2f6f9',
    dark: '#141a4e',
    activo: '#25be64',
    inactivo: '#dadde4',
    nuevo: '#febf02',
};

// Paleta extendida para gráficos
const CHART_COLORS = {
    primary: 'rgba(37, 99, 235, 1)',
    primaryLight: 'rgba(37, 99, 235, 0.1)',
    secondary: 'rgba(100, 116, 139, 1)',
    secondaryLight: 'rgba(100, 116, 139, 0.1)',
    success: 'rgba(37, 190, 100, 1)',
    successLight: 'rgba(37, 190, 100, 0.1)',
    warning: 'rgba(254, 191, 2, 1)',
    warningLight: 'rgba(254, 191, 2, 0.1)',
    danger: 'rgba(251, 79, 131, 1)',
    dangerLight: 'rgba(251, 79, 131, 0.1)',
    info: 'rgba(14, 165, 233, 1)',
    infoLight: 'rgba(14, 165, 233, 0.1)',
};

// Instancias de gráficos
let charts = {};

// Paleta dinámica según tema
function getThemePalette() {
    const isDark = document.documentElement.classList.contains('dark');
    return {
        isDark,
        text: isDark ? '#e5e7eb' : '#141a4e',
        subText: isDark ? '#cbd5e1' : '#475569',
        grid: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(237, 238, 242, 0.6)',
        tooltipBg: isDark ? 'rgba(23,23,27,0.92)' : 'rgba(20, 26, 78, 0.9)',
        tooltipText: isDark ? '#f8fafc' : '#e5e7eb',
        border: isDark ? 'rgba(255,255,255,0.14)' : '#ffffff',
    };
}

function applyThemeDefaults() {
    const palette = getThemePalette();
    Chart.defaults.color = palette.text;
    Chart.defaults.borderColor = palette.grid;
    Chart.defaults.font.family = 'Inter, system-ui, -apple-system, sans-serif';
    Chart.defaults.plugins.legend.labels.color = palette.text;
    Chart.defaults.plugins.tooltip.backgroundColor = palette.tooltipBg;
    Chart.defaults.plugins.tooltip.titleColor = palette.tooltipText;
    Chart.defaults.plugins.tooltip.bodyColor = palette.tooltipText;
    return palette;
}

// =====================================================
// INICIALIZAR TODOS LOS GRÁFICOS
// =====================================================

async function initCharts() {
    try {
        const palette = applyThemeDefaults();
        const [generacionesData, carrerasData, estatusData] = await Promise.all([
            fetchAPI('/api/egresados/stats/generaciones'),
            fetchAPI('/api/egresados'),
            fetchAPI('/api/estatus'),
        ]);

        createChartGeneraciones(generacionesData.data, palette);
        createChartCarreras(generacionesData.data, carrerasData.data || [], palette);
        createChartEstatus(carrerasData.data || [], palette);
        createChartCrecimiento(generacionesData.data, palette);
    } catch (error) {
        console.error('Error al inicializar gráficos:', error);
    }
}

// =====================================================
// GRÁFICO 1: EGRESADOS POR GENERACIÓN (Barras)
// =====================================================

function createChartGeneraciones(data, palette) {
    const ctx = document.getElementById('chartGeneraciones');
    if (!ctx) return;

    const { generaciones = [] } = data;
    
    // Ordenar por periodo descendente
    const sorted = [...generaciones].sort((a, b) => b.periodo.localeCompare(a.periodo));
    
    const labels = sorted.map(g => g.periodo);
    const values = sorted.map(g => g.total_egresados);
    
    // Crear gradiente de colores
    const colors = labels.map((_, i) => {
        const colorVariants = [
            CHART_COLORS.primary,
            CHART_COLORS.secondary,
            CHART_COLORS.info,
            CHART_COLORS.warning,
            CHART_COLORS.success,
        ];
        return colorVariants[i % colorVariants.length];
    });

    charts.generaciones = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Egresados',
                data: values,
                backgroundColor: colors,
                borderColor: colors,
                borderWidth: 0,
                borderRadius: 8,
                hoverBackgroundColor: CHART_COLORS.danger,
                hoverBorderColor: CHART_COLORS.danger,
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            aspectRatio: 1.4,
            plugins: {
                legend: {
                    display: false,
                },
                tooltip: {
                    backgroundColor: palette.tooltipBg,
                    titleColor: palette.tooltipText,
                    bodyColor: palette.tooltipText,
                    padding: 12,
                    cornerRadius: 8,
                    callbacks: {
                        label: function(context) {
                            return `${context.parsed.y} egresados`;
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        color: palette.text,
                        font: {
                            size: 12,
                            weight: '500'
                        }
                    },
                    grid: {
                        color: palette.grid,
                        drawBorder: false,
                    },
                    border: {
                        display: false,
                    }
                },
                x: {
                    ticks: {
                        color: palette.text,
                        font: {
                            size: 12,
                            weight: '500'
                        }
                    },
                    grid: {
                        display: false,
                        drawBorder: false,
                    },
                    border: {
                        display: false,
                    }
                }
            }
        }
    });
}

// =====================================================
// GRÁFICO 2: DISTRIBUCIÓN POR CARRERA (Dónut)
// =====================================================

function createChartCarreras(generacionesData, egresados, palette) {
    const ctx = document.getElementById('chartCarreras');
    if (!ctx) return;

    // Agrupar egresados por carrera
    const carrerasMap = {};
    egresados.forEach(e => {
        const carrera = e.nombre_carrera || 'Sin Carrera';
        carrerasMap[carrera] = (carrerasMap[carrera] || 0) + 1;
    });

    const labels = Object.keys(carrerasMap);
    const values = Object.values(carrerasMap);

    // Paleta de colores para carreras
    const colors = [
        CHART_COLORS.primary,
        CHART_COLORS.secondary,
        CHART_COLORS.warning,
        CHART_COLORS.success,
        CHART_COLORS.info,
        CHART_COLORS.danger,
    ];

    charts.carreras = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                data: values,
                backgroundColor: colors.slice(0, labels.length),
                borderColor: palette.border,
                borderWidth: 2,
                hoverBorderColor: palette.text,
                hoverBorderWidth: 3,
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            aspectRatio: 1,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        color: palette.text,
                        font: {
                            size: 12,
                            weight: '500'
                        },
                        padding: 16,
                        usePointStyle: true,
                        pointStyle: 'circle',
                    }
                },
                tooltip: {
                    backgroundColor: palette.tooltipBg,
                    titleColor: palette.tooltipText,
                    bodyColor: palette.tooltipText,
                    padding: 12,
                    cornerRadius: 8,
                    callbacks: {
                        label: function(context) {
                            const label = context.label || '';
                            const value = context.parsed;
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const percentage = ((value / total) * 100).toFixed(1);
                            return `${label}: ${value} (${percentage}%)`;
                        }
                    }
                }
            }
        }
    });
}

// =====================================================
// GRÁFICO 3: DISTRIBUCIÓN POR ESTATUS (Gráfico Circular)
// =====================================================

function createChartEstatus(egresados, palette) {
    const ctx = document.getElementById('chartEstatus');
    if (!ctx) return;

    // Contar por estatus
    const estatus = {
        'Activo': 0,
        'Inactivo': 0,
        'Nuevo': 0,
    };

    egresados.forEach(e => {
        if (e.id_estatus === 1) estatus['Activo']++;
        else if (e.id_estatus === 2) estatus['Inactivo']++;
        else if (e.id_estatus === 3) estatus['Nuevo']++;
    });

    const labels = Object.keys(estatus);
    const values = Object.values(estatus);

    charts.estatus = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: labels,
            datasets: [{
                data: values,
                backgroundColor: [
                    CHART_COLORS.success,    // Activo - Verde
                    CHART_COLORS.warning,    // Inactivo - Amarillo
                    CHART_COLORS.info,       // Nuevo - Azul
                ],
                borderColor: palette.border,
                borderWidth: 2,
                hoverBorderColor: palette.text,
                hoverBorderWidth: 3,
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            aspectRatio: 1,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        color: palette.text,
                        font: {
                            size: 12,
                            weight: '500'
                        },
                        padding: 16,
                        usePointStyle: true,
                        pointStyle: 'circle',
                    }
                },
                tooltip: {
                    backgroundColor: palette.tooltipBg,
                    titleColor: palette.tooltipText,
                    bodyColor: palette.tooltipText,
                    padding: 12,
                    cornerRadius: 8,
                    callbacks: {
                        label: function(context) {
                            const value = context.parsed;
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const percentage = ((value / total) * 100).toFixed(1);
                            return `${value} egresados (${percentage}%)`;
                        }
                    }
                }
            }
        }
    });
}

// =====================================================
// GRÁFICO 4: CRECIMIENTO ACUMULADO (Líneas)
// =====================================================

function createChartCrecimiento(data, palette) {
    const ctx = document.getElementById('chartCrecimiento');
    if (!ctx) return;

    const { generaciones = [] } = data;
    
    // Ordenar por periodo ascendente
    const sorted = [...generaciones].sort((a, b) => a.periodo.localeCompare(b.periodo));
    
    const labels = sorted.map(g => g.periodo);
    let acumulado = 0;
    const values = sorted.map(g => {
        acumulado += g.total_egresados;
        return acumulado;
    });

    charts.crecimiento = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Egresados Acumulados',
                data: values,
                borderColor: CHART_COLORS.primary,
                backgroundColor: CHART_COLORS.primaryLight,
                borderWidth: 3,
                fill: true,
                tension: 0.4,
                pointRadius: 5,
                pointBackgroundColor: CHART_COLORS.primary,
                pointBorderColor: palette.border,
                pointBorderWidth: 2,
                hoverPointRadius: 7,
                hoverPointBackgroundColor: CHART_COLORS.danger,
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            aspectRatio: 1.4,
            plugins: {
                legend: {
                    display: true,
                    labels: {
                        color: palette.text,
                        font: {
                            size: 12,
                            weight: '500'
                        },
                        usePointStyle: true,
                    }
                },
                tooltip: {
                    backgroundColor: palette.tooltipBg,
                    titleColor: palette.tooltipText,
                    bodyColor: palette.tooltipText,
                    padding: 12,
                    cornerRadius: 8,
                    callbacks: {
                        label: function(context) {
                            return `${context.parsed.y} egresados acumulados`;
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        color: palette.text,
                        font: {
                            size: 12,
                            weight: '500'
                        }
                    },
                    grid: {
                        color: palette.grid,
                        drawBorder: false,
                    },
                    border: {
                        display: false,
                    }
                },
                x: {
                    ticks: {
                        color: palette.text,
                        font: {
                            size: 12,
                            weight: '500'
                        }
                    },
                    grid: {
                        display: false,
                        drawBorder: false,
                    },
                    border: {
                        display: false,
                    }
                }
            }
        }
    });
}

// =====================================================
// FUNCIÓN AUXILIAR PARA FETCH
// =====================================================

async function fetchAPI(endpoint) {
    try {
        const response = await fetch(endpoint);
        const data = await response.json();
        return data;
    } catch (error) {
        console.error(`Error fetching ${endpoint}:`, error);
        return { success: false, data: null };
    }
}

// =====================================================
// REFRESH CHARTS
// =====================================================

async function refreshCharts() {
    // Destruir gráficos existentes
    Object.values(charts).forEach(chart => {
        if (chart) chart.destroy();
    });
    charts = {};
    
    // Reinicializar con la nueva paleta
    await initCharts();
}

// Escuchar cambios de tema para re-renderizar con la paleta correcta
document.addEventListener('themechange', (e) => {
    console.log('📊 Tema cambió a:', e.detail.theme);
    refreshCharts();
});
