
document.getElementById('productoForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const producto = {
        nombre: document.getElementById('nombre').value,
        categoria: document.getElementById('categoria').value,
        precio: parseFloat(document.getElementById('precio').value),
        stock: parseInt(document.getElementById('stock').value),
        fechaVencimiento: document.getElementById('fechaVencimiento').value,
        descripcion: document.getElementById('descripcion').value,
        codigoBarras: document.getElementById('codigoBarras').value
    };

    try {
        const response = await fetch('https://ventasdeproductosback.onrender.com/api/productos', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(producto)
        });

        if (!response.ok) {
            throw new Error('Error al guardar el producto');
        }

        const data = await response.json();
        mostrarMensaje('Producto guardado exitosamente!', 'exito');
        document.getElementById('productoForm').reset();

    } catch (error) {
        mostrarMensaje('Error al guardar el producto: ' + error.message, 'error');
    }
});

function mostrarMensaje(texto, tipo) {
    const mensajeDiv = document.getElementById('mensaje');
    mensajeDiv.textContent = texto;
    mensajeDiv.className = 'mensaje ' + tipo;
    setTimeout(() => {
        mensajeDiv.textContent = '';
        mensajeDiv.className = '';
    }, 3000);
}

