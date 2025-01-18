// Elementos del DOM
const listaProductos = document.getElementById("lista-productos");
const paginationContainer = document.getElementById("pagination");
let currentPage = 1;
const limit = 10;

// Función para crear el HTML de la paginación
const createPaginationButtons = (pagination) => {
    const { currentPage, totalPages, hasNextPage, hasPrevPage } = pagination;
    
    let html = `
        <nav aria-label="Navegación de productos">
            <ul class="pagination justify-content-center">
                <li class="page-item ${!hasPrevPage ? 'disabled' : ''}">
                    <button class="page-link" data-page="${currentPage - 1}" ${!hasPrevPage ? 'disabled' : ''}>
                        Anterior
                    </button>
                </li>
    `;

    // Agregar números de página
    for (let i = 1; i <= totalPages; i++) {
        html += `
            <li class="page-item ${currentPage === i ? 'active' : ''}">
                <button class="page-link" data-page="${i}">${i}</button>
            </li>
        `;
    }

    html += `
                <li class="page-item ${!hasNextPage ? 'disabled' : ''}">
                    <button class="page-link" data-page="${currentPage + 1}" ${!hasNextPage ? 'disabled' : ''}>
                        Siguiente
                    </button>
                </li>
            </ul>
        </nav>
    `;

    return html;
};

// Función para renderizar los productos
// ... (Mantener todo el código existente hasta la función renderProducts)

// Modificar la función renderProducts para incluir los botones de editar y eliminar
const renderProducts = (productos) => {
    listaProductos.innerHTML = '';
    
    productos.forEach(producto => {
        const tr = document.createElement('tr');
        const stockStatus = producto.stock === 0 ? 'out-of-stock' :
            producto.stock < 10 ? 'low-stock' : 'active';
        
        tr.innerHTML = `
            <td>
                <div class="d-flex align-items-center">
                   
                    <div>
                        <h6 class="mb-0">${producto.nombre}</h6>
                        <small class="text-muted">${producto.descripcion || 'Sin descripción'}</small>
                    </div>
                </div>
            </td>
            <td><span class="badge bg-secondary">${producto.codigoBarras}</span></td>
            <td>${producto.categoria}</td>
            <td class="price">$${producto.precio.toFixed(2)}</td>
            <td>
                <span class="badge ${producto.stock === 0 ? 'bg-danger' :
                    producto.stock < 10 ? 'bg-warning' :
                    'bg-success'} stock-badge">
                    ${producto.stock} unidades
                </span>
            </td>
            <td>
                <span class="status-indicator ${stockStatus}"></span>
                ${producto.stock === 0 ? 'Sin Stock' :
                    producto.stock < 10 ? 'Bajo Stock' : 'Activo'}
            </td>
            <td>
                <div class="btn-group" role="group">
                    <button 
                        class="btn btn-sm btn-outline-primary edit-button" 
                        data-id="${producto._id}"
                        title="Editar">
                        <i class="bi bi-pencil"></i>
                    </button>
                    <button 
                        class="btn btn-sm btn-outline-danger delete-button" 
                        data-id="${producto._id}"
                        title="Eliminar">
                        <i class="bi bi-trash"></i>
                    </button>
                </div>
            </td>
        `;
        listaProductos.appendChild(tr);
    });

    // Agregar event listeners a los botones
    addButtonListeners();
};

// Función para agregar event listeners a los botones de editar y eliminar
const addButtonListeners = () => {
    // Event listeners para botones de editar
    document.querySelectorAll('.edit-button').forEach(button => {
        button.addEventListener('click', (e) => {
            const productId = e.currentTarget.dataset.id;
            openEditModal(productId);
        });
    });

    // Event listeners para botones de eliminar
    document.querySelectorAll('.delete-button').forEach(button => {
        button.addEventListener('click', (e) => {
            const productId = e.currentTarget.dataset.id;
            openDeleteModal(productId);
        });
    });
};

// Variables para los modales
const editModal = new bootstrap.Modal(document.getElementById('editProductModal'));
const deleteModal = new bootstrap.Modal(document.getElementById('deleteConfirmModal'));
let currentProductId = null;

// Función para abrir el modal de edición
const openEditModal = async (productId) => {
    try {
        const res = await fetch(`https://ventasdeproductosback.onrender.com/api/productos/${productId}`);
        const producto = await res.json();
        
        // Llenar el formulario con los datos del producto
        document.getElementById('editProductId').value = producto._id;
        document.getElementById('editNombre').value = producto.nombre;
        document.getElementById('editDescripcion').value = producto.descripcion || '';
        document.getElementById('editCodigoBarras').value = producto.codigoBarras;
        document.getElementById('editCategoria').value = producto.categoria;
        document.getElementById('editPrecio').value = producto.precio;
        document.getElementById('editStock').value = producto.stock;

        editModal.show();
    } catch (error) {
        console.error('Error al cargar los datos del producto:', error);
        
    }
};

// Función para abrir el modal de confirmación de eliminación
const openDeleteModal = (productId) => {
    currentProductId = productId;
    deleteModal.show();
};

// Event listener para el botón de guardar cambios
document.getElementById('saveEditButton').addEventListener('click', async () => {
    const productId = document.getElementById('editProductId').value;
    
    const productoActualizado = {
        nombre: document.getElementById('editNombre').value,
        descripcion: document.getElementById('editDescripcion').value,
        codigoBarras: document.getElementById('editCodigoBarras').value,
        categoria: document.getElementById('editCategoria').value,
        precio: parseFloat(document.getElementById('editPrecio').value),
        stock: parseInt(document.getElementById('editStock').value)
    };

    try {
        const res = await fetch(`https://ventasdeproductosback.onrender.com/api/productos/${productId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(productoActualizado)
        });

        if (res.ok) {
            editModal.hide();
            getProductos(currentPage); // Recargar la página actual
        } else {
            throw new Error('Error al actualizar el producto');
        }
    } catch (error) {
        console.error('Error al actualizar el producto:', error);
        
    }
});

// Event listener para el botón de confirmar eliminación
document.getElementById('confirmDeleteButton').addEventListener('click', async () => {
    if (currentProductId) {
        try {
            const res = await fetch(`https://ventasdeproductosback.onrender.com/api/productos/${currentProductId}`, {
                method: 'DELETE'
            });

            if (res.ok) {
                deleteModal.hide();
                getProductos(currentPage); // Recargar la página actual
            } else {
                throw new Error('Error al eliminar el producto');
            }
        } catch (error) {
            console.error('Error al eliminar el producto:', error);
            
        }
    }
});

// ... (Mantener el resto del código existente)
// Variables globales
let productoActual = null;

async function abrirModalEditar(productoId) {
    console.log('ID recibido:', productoId); // Para debugging
    
    try {
        if (!productoId || typeof productoId !== 'string') {
            console.error('ID inválido:', productoId);
            mostrarNotificacion('Error: ID de producto inválido', 'error');
            return;
        }

        const response = await fetch(`https://ventasdeproductosback.onrender.com/api/productos/${productoId}`);
        const data = await response.json();
        
        if (data.success) {
            productoActual = data.producto;
            
            const modal = document.getElementById('modalEditar');
            
            // Llenar el formulario
            document.getElementById('editNombre').value = data.producto.nombre;
            document.getElementById('editDescripcion').value = data.producto.descripcion || '';
            document.getElementById('editCodigo').value = data.producto.codigoBarras;
            document.getElementById('editCategoria').value = data.producto.categoria;
            document.getElementById('editPrecio').value = data.producto.precio;
            document.getElementById('editStock').value = data.producto.stock;
            document.getElementById('editFechaVencimiento').value = data.producto.fechaVencimiento ? 
                data.producto.fechaVencimiento.split('T')[0] : '';
            
            modal.style.display = 'block';
            document.body.style.overflow = 'hidden';
        } else {
            throw new Error(data.message || 'Error al cargar el producto');
        }
    } catch (error) {
        console.error('Error al cargar el producto:', error);
        mostrarNotificacion('Error al cargar el producto', 'error');
    }
}


// Función para cerrar el modal
function cerrarModal() {
    const modal = document.getElementById('modalEditar');
    modal.style.display = 'none';
    document.body.style.overflow = 'auto'; // Restaurar scroll
    productoActual = null;
}


const guardarCambios = document.getElementById('guardarCambios');



// Agregar evento de click a la tabla para editar
document.getElementById('lista-productos').addEventListener('click', (e) => {
    const row = e.target.closest('tr');
    if (row) {
        // Obtener los datos del producto de la fila
        const nombre = row.querySelector('h6').textContent;
        const descripcion = row.querySelector('small').textContent;
        const codigoBarras = row.querySelector('.badge').textContent;
        const categoria = row.cells[2].textContent;
        const precio = parseFloat(row.querySelector('.price').textContent.replace('$', ''));
        const stock = parseInt(row.querySelector('.stock-badge').textContent);
        
        const producto = {
            id: row.dataset.id, // Asegúrate de agregar data-id a tus filas
            nombre,
            descripcion,
            codigoBarras,
            categoria,
            precio,
            stock
        };
        
        abrirModalEditar(producto);
    }
});

// Cerrar modal al hacer click fuera de él
window.addEventListener('click', (e) => {
    const modal = document.getElementById('modalEditar');
    if (e.target === modal) {
        cerrarModal();
    }
});

// Agregar estilos para las notificaciones
const styleNotificaciones = document.createElement('style');
styleNotificaciones.textContent = `
    .notificacion {
        position: fixed;
        top: 20px;
        right: -300px;
        background: white;
        padding: 16px 24px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        display: flex;
        align-items: center;
        gap: 12px;
        transition: all 0.3s ease;
        z-index: 1100;
    }
    
    .notificacion.mostrar {
        right: 20px;
    }
    
    .notificacion-success {
        border-left: 4px solid #2ecc71;
    }
    
    .notificacion-error {
        border-left: 4px solid #e74c3c;
    }
    
    .notificacion i {
        font-size: 1.2rem;
    }
    
    .notificacion-success i {
        color: #2ecc71;
    }
    
    .notificacion-error i {
        color: #e74c3c;
    }
`;
document.head.appendChild(styleNotificaciones);
const eliminarProducto = async (id) => {
    try {
        const res = await fetch(`https://ventasdeproductosback.onrender.com/api/productos/${id}`, {
            method: 'DELETE',
        });
        const data = await res.json();

        if (data.success) {
            // Mostrar alerta de éxito
            Swal.fire({
                title: '¡Eliminado!',
                text: 'El producto ha sido eliminado exitosamente.',
                icon: 'success',
                confirmButtonColor: '#3498db'
            });

            // Recargar la lista de productos
            getProductos(currentPage);
        } else {
            // Mostrar alerta de error si la respuesta del servidor indica fallo
            Swal.fire({
                title: 'Error',
                text: data.message || 'No se pudo eliminar el producto.',
                icon: 'error',
                confirmButtonColor: '#3498db'
            });
        }
    } catch (error) {
        console.error("Error al eliminar el producto", error);

        // Mostrar alerta de error si ocurre un problema en la petición
        Swal.fire({
            title: 'Error',
            text: 'Ocurrió un error al intentar eliminar el producto. Por favor, inténtalo de nuevo.',
            icon: 'error',
            confirmButtonColor: '#3498db'
        });
    }
};

// Función para actualizar las estadísticas
const updateStats = (productos, totalProducts) => {
    let stockTotal = 0;
    let bajoStock = 0;
    let sinStock = 0;

    productos.forEach(producto => {
        stockTotal += producto.stock;
        if (producto.stock === 0) sinStock++;
        else if (producto.stock < 10) bajoStock++;
    });

    document.getElementById('total-productos').textContent = totalProducts;
    document.getElementById('total-stock').textContent = stockTotal;
    document.getElementById('bajo-stock').textContent = bajoStock;
    document.getElementById('sin-stock').textContent = sinStock;
};

// Función para obtener los productos paginados
const getProductos = async (page = 1) => {
    try {
        const res = await fetch(`https://ventasdeproductosback.onrender.com/api/productos?page=${page}&limit=${limit}`);
        const data = await res.json();

       

        if (data.success) {
            // Renderizar productos
            renderProducts(data.data);
            
            // Actualizar estadísticas
            updateStats(data.data, data.pagination.totalProducts);
            
            // Renderizar paginación
            paginationContainer.innerHTML = createPaginationButtons(data.pagination);
            
            // Actualizar página actual
            currentPage = page;
            
            // Agregar event listeners a los botones de paginación
            addPaginationListeners();
        }
    } catch (error) {
        console.error("Error al obtener los productos", error);
        // Mostrar mensaje de error al usuario
        listaProductos.innerHTML = `
            <tr>
                <td colspan="6" class="text-center text-danger">
                    Error al cargar los productos. Por favor, intente nuevamente.
                </td>
            </tr>
        `;
    }
};

// Función para agregar event listeners a los botones de paginación
const addPaginationListeners = () => {
    const buttons = document.querySelectorAll('.page-link');
    buttons.forEach(button => {
        button.addEventListener('click', (e) => {
            const pageNumber = parseInt(e.target.dataset.page);
            if (!isNaN(pageNumber) && pageNumber !== currentPage) {
                getProductos(pageNumber);
                // Hacer scroll al inicio de la lista
                listaProductos.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });
};

// Agregar búsqueda de productos
const searchInput = document.getElementById('search-input');
let searchTimeout;

searchInput.addEventListener('input', (e) => {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(async () => {
        const searchTerm = e.target.value.trim();
        
        if (searchTerm) {
            try {
                const res = await fetch(`https://ventasdeproductosback.onrender.com/api/productos/buscar?termino=${searchTerm}&page=1&limit=${limit}`);
                const data = await res.json();
                
                if (data.success) {
                    renderProducts(data.data);
                    updateStats(data.data, data.pagination.totalProducts);
                    paginationContainer.innerHTML = createPaginationButtons(data.pagination);
                    addPaginationListeners();
                }
            } catch (error) {
                console.error("Error en la búsqueda", error);
            }
        } else {
            // Si el campo de búsqueda está vacío, volver a la primera página
            getProductos(1);
        }
    }, 300); // Debounce de 300ms
});

// Inicializar la primera carga de productos
getProductos();






