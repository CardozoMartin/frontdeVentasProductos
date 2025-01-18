// Mantener el getProductos original
const carrito = [];

const getProductos = async () => {
    try {
        const res = await axios.get("https://ventasdeproductosback.onrender.com/api/productos");
        const data = res.data;
        console.log(data)
        localStorage.setItem("productos", JSON.stringify(data));
        console.log("Datos guardados en localStorage:", data);
    } catch (error) {
        console.error("Error al obtener los productos:", error);
    }
}

getProductos();

// Función para formatear precio
const formatPrice = (price) => {
    return new Intl.NumberFormat('es-MX', {
        style: 'currency',
        currency: 'MXN'
    }).format(price);
};



// Función para agregar al carrito


// Función para actualizar el carrito
const actualizarCarrito = () => {
    const listaCarrito = document.getElementById("listaCarrito");
    const carritoVacio = document.getElementById("carritoVacio");

    // Limpiar el contenido actual
    listaCarrito.innerHTML = "";

    // Mostrar mensaje si el carrito está vacío
    if (carrito.length === 0) {
        listaCarrito.innerHTML = `
            <div class="carrito-vacio">
                <svg class="carrito-vacio-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <circle cx="9" cy="21" r="1"></circle>
                    <circle cx="20" cy="21" r="1"></circle>
                    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                </svg>
                <p class="carrito-vacio-texto">Tu carrito está vacío</p>
                <p class="carrito-vacio-subtexto">¡Agrega algunos productos para comenzar!</p>
            </div>
        `;
        return;
    }

    // Renderizar items del carrito
    carrito.forEach((item, index) => {
        const itemDiv = document.createElement('div');
        itemDiv.className = 'carrito-item';
        itemDiv.innerHTML = `
            <div class="item-contenido">
                <div class="item-info">
                    <h4 class="item-nombre">${item.nombre}</h4>
                    <div class="item-detalles">
                        <span class="item-precio">${formatPrice(item.precio)}</span>
                        <div class="item-cantidad">
                            <button 
                                class="btn-cantidad" 
                                onclick="actualizarCantidadCarrito(${index}, ${item.cantidad - 1})"
                                ${item.cantidad <= 1 ? 'disabled' : ''}
                            >
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                    <line x1="5" y1="12" x2="19" y2="12"></line>
                                </svg>
                            </button>
                            <span class="cantidad-valor">${item.cantidad}</span>
                            <button 
                                class="btn-cantidad"
                                onclick="actualizarCantidadCarrito(${index}, ${item.cantidad + 1})"
                            >
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                    <line x1="12" y1="5" x2="12" y2="19"></line>
                                    <line x1="5" y1="12" x2="19" y2="12"></line>
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>
                <div class="item-acciones">
                    <span class="item-subtotal">${formatPrice(item.precio * item.cantidad)}</span>
                    <button class="btn-eliminar" onclick="eliminarDelCarrito(${index})">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <path d="M3 6h18"></path>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                        </svg>
                    </button>
                </div>
            </div>
        `;
        listaCarrito.appendChild(itemDiv);
    });

    // Actualizar el total
    const total = carrito.reduce((acc, item) => acc + (item.precio * item.cantidad), 0);
    const totalSection = document.createElement('div');
    totalSection.className = 'carrito-total';
    totalSection.innerHTML = `
        <div class="total-desglose">
            <div class="subtotal-linea">
                <span>Subtotal</span>
                <span>${formatPrice(total)}</span>
            </div>
            <div class="envio-linea">
                <span>Envío</span>
                <span>Gratis</span>
            </div>
        </div>
        <div class="total-linea">
            <span>Total</span>
            <span class="precio-total">${formatPrice(total)}</span>
        </div>
    `;
    listaCarrito.appendChild(totalSection);
};

// Función para eliminar del carrito
const eliminarDelCarrito = (index) => {
    carrito.splice(index, 1);
    actualizarCarrito();
};





// Limpiar resultados al cargar la página



// Mantener las funciones existentes y actualizar/agregar las siguientes:

const finalizarCompra = () => {
    if (carrito.length === 0) {
        alert("El carrito está vacío");
        return;
    }
    const modalPago = document.getElementById("modalPago");
    modalPago.classList.add("modal-pago2")
    mostrarModalPago();
};

// Agregar estas funciones al JavaScript existente

let montoTotal = 0;
let montoPagado = 0;

const mostrarModalPago = () => {
    if (carrito.length === 0) {
        alert("El carrito está vacío");
        return;
    }

    const modal = document.getElementById("modalPago");
    montoTotal = carrito.reduce((acc, item) => acc + (item.precio * item.cantidad), 0);

    document.getElementById("totalPagar").textContent = formatPrice(montoTotal);
    document.getElementById("montoPagado").value = "";
    document.getElementById("cambio").textContent = "$0.00";

    modal.style.display = "block";
};

const cerrarModal = () => {
    const modal = document.getElementById("modalPago");
    modal.classList.remove("modal-pago2")


    document.getElementById("modalPago").style.display = "none";
};

const calcularCambio = () => {
    montoPagado = parseFloat(document.getElementById("montoPagado").value) || 0;
    const cambio = montoPagado - montoTotal;

    if (cambio >= 0) {
        document.getElementById("cambio").textContent = formatPrice(cambio);
    } else {
        document.getElementById("cambio").textContent = "Monto insuficiente";
    }
};

const procesarPago = async () => {
    const cambio = montoPagado - montoTotal;

    if (cambio < 0) {
        alert("El monto pagado es insuficiente");
        return;
    }

    try {
        const response = await axios.post('https://ventasdeproductosback.onrender.com/api/carrito/finalizar-compra', {
            items: carrito,
            montoPagado: montoPagado,
            cambio: cambio
        });

        if (response.status === 200) {
            // Primero generar y mostrar el ticket
            const ticketGenerado = generarTicket();
            if (ticketGenerado) {
                // Solo si el ticket se generó correctamente, actualizamos el stock
                const productos = JSON.parse(localStorage.getItem("productos"));
                carrito.forEach(item => {
                    const producto = productos.data.find(p => p._id === item.id);
                    if (producto) {
                        producto.stock -= item.cantidad;
                    }
                });
                localStorage.setItem("productos", JSON.stringify(productos));

                // Limpiar carrito y actualizar UI
                carrito.length = 0;
                actualizarCarrito();
                cerrarModal();

                alert("¡Compra finalizada con éxito!");
            }
        }
    } catch (error) {
        console.error("Error al finalizar la compra:", error);
        alert("Error al procesar la compra. Por favor, intente nuevamente.");
    }
};

const generarTicket = () => {
    try {
        const cambio = montoPagado - montoTotal;
        const fecha = new Date().toLocaleString();
        const folio = 'V-' + Date.now().toString().slice(-6);

        // Crear un elemento temporal para el ticket
        const ticketTemp = document.createElement('div');
        ticketTemp.innerHTML = `
            <div class="ticket">
                <div class="ticket-header">
                    <h3>COMPROBANTE DE VENTA</h3>
                    <p>Fecha: ${fecha}</p>
                    <p>Folio: ${folio}</p>
                </div>
                
                <div class="ticket-items">
                    ${carrito.map(item => `
                        <div>
                            <p>${item.cantidad}x ${item.nombre}</p>
                            <p>${formatPrice(item.precio)} c/u</p>
                            <p>Subtotal: ${formatPrice(item.precio * item.cantidad)}</p>
                        </div>
                    `).join('')}
                </div>
                
                <div class="ticket-total">
                    <p>Total: ${formatPrice(montoTotal)}</p>
                    <p>Pagado con: ${formatPrice(montoPagado)}</p>
                    <p>Cambio: ${formatPrice(cambio)}</p>
                </div>
                
                <div class="ticket-footer">
                    <p>¡Gracias por su compra!</p>
                    <p>Vuelva pronto</p>
                </div>
            </div>
        `;

        // Imprimir ticket
        const ticketWindow = window.open('', '_blank');
        ticketWindow.document.write('<html><head><title>Ticket de Compra</title>');

        // Agregar estilos básicos para el ticket
        ticketWindow.document.write(`
            <style>
                .ticket {
                    width: 300px;
                    margin: 0 auto;
                    padding: 20px;
                    font-family: 'Arial', sans-serif;
                }
                .ticket-header {
                    text-align: center;
                    margin-bottom: 20px;
                }
                .ticket-items {
                    margin-bottom: 20px;
                }
                .ticket-items div {
                    margin-bottom: 10px;
                }
                .ticket-total {
                    border-top: 1px dashed #000;
                    margin-top: 20px;
                    padding-top: 10px;
                }
                .ticket-footer {
                    text-align: center;
                    margin-top: 20px;
                    border-top: 1px dashed #000;
                    padding-top: 10px;
                }
            </style>
        `);

        ticketWindow.document.write('</head><body>');
        ticketWindow.document.write(ticketTemp.innerHTML);
        ticketWindow.document.write('</body></html>');
        ticketWindow.document.close();
        ticketWindow.print();

        return true;
    } catch (error) {
        console.error("Error al generar el ticket:", error);
        alert("Error al generar el ticket. Por favor, intente nuevamente.");
        return false;
    }
};


// Actualizar la función agregarAlCarrito para verificar stock
const agregarAlCarrito = (productoId, nombre, precio, stock) => {
    const cantidad = parseInt(document.getElementById(`cantidad-${productoId}`).value);

    // Verificar si hay suficiente stock
    const existingProductIndex = carrito.findIndex(item => item.id === productoId);
    const cantidadEnCarrito = existingProductIndex !== -1 ? carrito[existingProductIndex].cantidad : 0;

    if (cantidadEnCarrito + cantidad > stock) {
        alert("No hay suficiente stock disponible");
        return;
    }

    if (existingProductIndex !== -1) {
        carrito[existingProductIndex].cantidad += cantidad;
    } else {
        const addProduct = {
            id: productoId,
            nombre: nombre,
            precio: parseFloat(precio),
            cantidad: cantidad
        };
        carrito.push(addProduct);
    }

    console.log('Carrito actualizado:', carrito);
    actualizarCarrito();
};
// Mantener las funciones existentes y agregar las nuevas

const abrirModalBusqueda = () => {
    const modal = document.getElementById("modalBusqueda");
    modal.classList.add("modal-activo");
    document.getElementById("busquedaModal").focus();
    mostrarProductosModal([]); // Mostrar mensaje inicial de búsqueda
};

const cerrarModalBusqueda = () => {
    const modal = document.getElementById("modalBusqueda");
    modal.classList.remove("modal-activo");
};

// Función modificada para mostrar productos en el modal
const mostrarProductosModal = (productos) => {
    const resultados = document.getElementById("resultadosModal");

    // Estado vacío
    if (!productos || productos.length === 0) {
        resultados.innerHTML = `
            <div class="empty-state">
                <div class="search-icon">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="11" cy="11" r="8"></circle>
                        <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                    </svg>
                </div>
                <h3 class="empty-title">No se encontraron productos</h3>
                <p class="empty-description">Intente buscar por nombre o código del producto</p>
            </div>
        `;
        return;
    }

    // Grid de productos
    resultados.innerHTML = `
        <div class="productos-grid">
            ${productos.map(producto => `
                <div class="producto-card">
                    <div class="producto-header">
                        <span class="stock-badge ${producto.stock > 0 ? 'in-stock' : 'out-stock'}">
                            ${producto.stock > 0 ? `${producto.stock} disponibles` : 'Sin stock'}
                        </span>
                    </div>
                    
                    <div class="producto-info">
                        <h3 class="producto-nombre">${producto.nombre}</h3>
                        <p class="producto-precio">${formatPrice(producto.precio)}</p>
                    </div>

                    <div class="producto-actions">
                        <div class="cantidad-control">
                            <button 
                                onclick="decrementarCantidad('${producto._id}')" 
                                class="btn-cantidad"
                                ${producto.stock === 0 ? 'disabled' : ''}
                            >
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                    <line x1="5" y1="12" x2="19" y2="12"></line>
                                </svg>
                            </button>
                            
                            <input 
                                type="number"
                                min="1"
                                max="${producto.stock}"
                                value="1"
                                class="cantidad-input"
                                id="cantidad-${producto._id}"
                                onchange="validarCantidad('${producto._id}', ${producto.stock})"
                                ${producto.stock === 0 ? 'disabled' : ''}
                            >
                            
                            <button 
                                onclick="incrementarCantidad('${producto._id}', ${producto.stock})" 
                                class="btn-cantidad"
                                ${producto.stock === 0 ? 'disabled' : ''}
                            >
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                    <line x1="12" y1="5" x2="12" y2="19"></line>
                                    <line x1="5" y1="12" x2="19" y2="12"></line>
                                </svg>
                            </button>
                        </div>

                        <button 
                            class="btn-agregar ${producto.stock === 0 ? 'disabled' : ''}"
                            onclick="agregarAlCarritoModal('${producto._id}','${producto.nombre}',${producto.precio},${producto.stock})"
                            ${producto.stock === 0 ? 'disabled' : ''}
                        >
                            <svg class="cart-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                <circle cx="9" cy="21" r="1"></circle>
                                <circle cx="20" cy="21" r="1"></circle>
                                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                            </svg>
                            Agregar al carrito
                        </button>
                    </div>
                </div>
            `).join('')}
        </div>
    `;
};

// Funciones para el control de cantidad
const decrementarCantidad = (productoId) => {
    const input = document.getElementById(`cantidad-${productoId}`);
    const nuevoValor = Math.max(1, parseInt(input.value) - 1);
    input.value = nuevoValor;
};

const incrementarCantidad = (productoId, stockMaximo) => {
    const input = document.getElementById(`cantidad-${productoId}`);
    const nuevoValor = Math.min(stockMaximo, parseInt(input.value) + 1);
    input.value = nuevoValor;
};

const validarCantidad = (productoId, stockMaximo) => {
    const input = document.getElementById(`cantidad-${productoId}`);
    let valor = parseInt(input.value);

    if (isNaN(valor) || valor < 1) {
        valor = 1;
    } else if (valor > stockMaximo) {
        valor = stockMaximo;
    }

    input.value = valor;
};

// Función modificada para agregar al carrito desde el modal
const agregarAlCarritoModal = (productoId, nombre, precio, stock) => {
    const cantidad = parseInt(document.getElementById(`cantidad-${productoId}`).value);

    // Verificar si hay suficiente stock
    const existingProductIndex = carrito.findIndex(item => item.id === productoId);
    const cantidadEnCarrito = existingProductIndex !== -1 ? carrito[existingProductIndex].cantidad : 0;

    if (cantidadEnCarrito + cantidad > stock) {
        alert("No hay suficiente stock disponible");
        return;
    }

    if (existingProductIndex !== -1) {
        carrito[existingProductIndex].cantidad += cantidad;
    } else {
        const addProduct = {
            id: productoId,
            nombre: nombre,
            precio: parseFloat(precio),
            cantidad: cantidad
        };
        carrito.push(addProduct);
    }

    actualizarCarrito();

    // Mostrar confirmación
    mostrarNotificacion(`Se agregó ${cantidad}x ${nombre} al carrito`);
};

// Función para mostrar notificación
const mostrarNotificacion = (mensaje) => {
    const notificacion = document.createElement('div');
    notificacion.className = 'notificacion';
    notificacion.textContent = mensaje;
    document.body.appendChild(notificacion);

    setTimeout(() => {
        notificacion.classList.add('mostrar');
        setTimeout(() => {
            notificacion.classList.remove('mostrar');
            setTimeout(() => {
                notificacion.remove();
            }, 300);
        }, 2000);
    }, 100);
};

// Evento de búsqueda para el modal
document.addEventListener('DOMContentLoaded', () => {
    const busquedaModal = document.getElementById("busquedaModal");
    if (busquedaModal) {
        busquedaModal.addEventListener("input", (e) => {
            const texto = e.target.value.toLowerCase().trim();
            const productos = JSON.parse(localStorage.getItem("productos"));
            console.log(productos)
            const productosFiltrados = productos.data.filter(producto =>
                producto.nombre.toLowerCase().includes(texto) ||
                (producto.codigo && producto.codigo.toLowerCase().includes(texto))
            );
            mostrarProductosModal(productosFiltrados);
        });
    }
});
// Inicializar la visualización de productos
const productosIniciales = JSON.parse(localStorage.getItem("productos")) || [];

actualizarCarrito();