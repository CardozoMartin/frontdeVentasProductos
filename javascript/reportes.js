// Función para formatear moneda
const formatearMoneda = (monto) => {
    return new Intl.NumberFormat('es-MX', {
        style: 'currency',
        currency: 'MXN'
    }).format(monto);
};

// Función para formatear fecha y hora
const formatearFechaHora = (fecha) => {
    return new Date(fecha).toLocaleString('es-MX', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
};

// Función para mostrar las ventas en el DOM
const mostrarVentas = (ventasPorDia) => {
    const contenedor = document.getElementById('ventasPorDia');
    let totalPeriodo = 0;
    
    const ventasHTML = Object.entries(ventasPorDia).map(([fecha, data]) => {
        totalPeriodo += data.total;
        
        const ventasDelDia = data.ventas.map(venta => {
            // Crear un resumen de los productos
            const resumenProductos = venta.items
                .map(item => `${item.cantidad}x ${item.producto?.nombre || 'Producto no disponible'}`)
                .join(', ');

            return `
                <div class="venta-item" onclick="verDetalleVenta('${venta._id}')">
                    <div class="venta-info">
                        <div class="venta-hora">${formatearFechaHora(venta.createdAt)}</div>
                        <div class="venta-productos">${resumenProductos}</div>
                    </div>
                    <div class="venta-total">${formatearMoneda(venta.total)}</div>
                </div>
            `;
        }).join('');

        return `
            <div class="dia-ventas">
                <h3>${new Date(fecha).toLocaleDateString('es-MX', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                })}</h3>
                <div class="ventas-lista">
                    ${ventasDelDia}
                </div>
                <div class="total-dia">
                    Total del día: ${formatearMoneda(data.total)}
                </div>
            </div>
        `;
    }).join('');
    
    contenedor.innerHTML = ventasHTML;
    document.getElementById('totalPeriodo').textContent = formatearMoneda(totalPeriodo);
};

// Función principal para obtener ventas
const obtenerVentas = async () => {
    try {
        const fechaInicio = document.getElementById('fechaInicio').value;
        const fechaFin = document.getElementById('fechaFin').value;
        
        // Mostrar estado de carga
        const contenedor = document.getElementById('ventasPorDia');
        contenedor.innerHTML = '<div class="loading">Cargando ventas...</div>';
        
        console.log('Fechas de consulta:', { fechaInicio, fechaFin });
        
        // Usar la nueva ruta /ventas
        const response = await axios.get('https://ventasdeproductosback.onrender.com/api/carrito/ventas', {
            params: {
                fechaInicio,
                fechaFin
            }
        });
        
        console.log('Respuesta del servidor:', response.data);
        
        // Asegurarse de que response.data sea un array
        const ventas = Array.isArray(response.data) ? response.data : [];
        
        if (ventas.length === 0) {
            contenedor.innerHTML = '<div class="no-ventas">No hay ventas en el período seleccionado</div>';
            document.getElementById('totalPeriodo').textContent = formatearMoneda(0);
            return;
        }

        // Agrupar ventas por fecha
        const ventasPorDia = ventas.reduce((acc, venta) => {
            // Usar createdAt como fecha
            const fecha = new Date(venta.createdAt).toISOString().split('T')[0];
            if (!acc[fecha]) {
                acc[fecha] = {
                    ventas: [],
                    total: 0
                };
            }
            acc[fecha].ventas.push(venta);
            acc[fecha].total += venta.total || 0;
            return acc;
        }, {});

        mostrarVentas(ventasPorDia);
    } catch (error) {
        console.error('Error completo:', error);
        const contenedor = document.getElementById('ventasPorDia');
        contenedor.innerHTML = `
            <div class="error-mensaje">
                <h4>Error al cargar las ventas:</h4>
                <p>${error.message}</p>
                <pre>${JSON.stringify(error.response?.data || {}, null, 2)}</pre>
                <button onclick="obtenerVentas()" class="btn-reintentar">Reintentar</button>
            </div>
        `;
    }
};

// Función para ver el detalle de una venta
const verDetalleVenta = async (ventaId) => {
    try {
        const response = await axios.get(`https://ventasdeproductosback.onrender.com/${ventaId}`);
        const venta = response.data;

        let detalleHTML = `
            <div class="modal-detalle">
                <div class="modal-contenido">
                    <h3>Detalle de Venta</h3>
                    <p class="fecha-venta">${formatearFechaHora(venta.createdAt)}</p>
                    <div class="items-lista">
                        ${venta.items.map(item => `
                            <div class="item-detalle">
                                <div class="item-info">
                                    <span class="item-nombre">${item.producto?.nombre || 'Producto no disponible'}</span>
                                    <span class="item-cantidad">${item.cantidad} unidades a ${formatearMoneda(item.precio)}</span>
                                </div>
                                <span class="item-total">${formatearMoneda(item.precio * item.cantidad)}</span>
                            </div>
                        `).join('')}
                    </div>
                    <div class="total-detalle">
                        <strong>Total: ${formatearMoneda(venta.total)}</strong>
                    </div>
                    <button onclick="this.closest('.modal-detalle').remove()" class="btn-cerrar">
                        Cerrar
                    </button>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', detalleHTML);
    } catch (error) {
        console.error('Error al obtener el detalle:', error);
        alert(`Error al cargar el detalle de la venta: ${error.message}`);
    }
};

// Función para filtrar por fecha
const filtrarPorFecha = () => {
    obtenerVentas();
};

// Inicialización con event listeners
window.addEventListener('DOMContentLoaded', () => {
    const hoy = new Date();
    const inicioMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
    
    // Establecer fechas iniciales
    document.getElementById('fechaInicio').value = inicioMes.toISOString().split('T')[0];
    document.getElementById('fechaFin').value = hoy.toISOString().split('T')[0];
    
    // Agregar event listener al botón de filtrar
    const btnFiltrar = document.getElementById('btnFiltrar');
    if (btnFiltrar) {
        btnFiltrar.addEventListener('click', filtrarPorFecha);
    }
    
    // Cargar ventas iniciales
    obtenerVentas();
});