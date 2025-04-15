document.addEventListener('DOMContentLoaded', () => {
    const proveedorSelect = document.getElementById('proveedor-select');
    const nombreArticulo = document.getElementById('nombre-articulo');
    const stockActual = document.getElementById('stock-actual');
    const cantidadSolicitar = document.getElementById('cantidad-solicitar');
    const agregarArticuloBtn = document.getElementById('agregar-articulo');
    
    let canastas = {
        quillay: [],
        qve: [],
        nini: [],
        maxclean: [],
        fabrica: []
    };

    // Configurar acordeón
    document.querySelectorAll('.accordion-header').forEach(header => {
        header.addEventListener('click', () => {
            const content = header.nextElementSibling;
            const isActive = header.classList.contains('active');

            // Cerrar todos los paneles activos
            document.querySelectorAll('.accordion-header.active').forEach(activeHeader => {
                activeHeader.classList.remove('active');
                activeHeader.nextElementSibling.classList.remove('active');
            });

            // Abrir/cerrar el panel actual
            if (!isActive) {
                header.classList.add('active');
                content.classList.add('active');
            }
        });
    });

    // Agregar evento a los iconos de detalle
    document.querySelectorAll('.detalle-icono').forEach(icono => {
        icono.addEventListener('click', (event) => {
            event.stopPropagation(); // Evita que se active el acordeón
            const proveedor = icono.dataset.proveedor;
            mostrarModalDetalle(proveedor);
        });
    });

    agregarArticuloBtn.addEventListener('click', () => {
        const proveedorSeleccionado = proveedorSelect.value;

        if (!proveedorSeleccionado) {
            alert('Por favor seleccione un proveedor primero');
            return;
        }

        if (!nombreArticulo.value || !stockActual.value || !cantidadSolicitar.value) {
            alert('Por favor complete todos los campos');
            return;
        }

        if (parseInt(cantidadSolicitar.value) <= 0) {
            alert('La cantidad a solicitar debe ser mayor a 0');
            return;
        }

        const articulo = {
            nombre: nombreArticulo.value,
            stock: parseInt(stockActual.value),
            cantidad: parseInt(cantidadSolicitar.value)
        };

        canastas[proveedorSeleccionado].push(articulo);
        actualizarCanasta(proveedorSeleccionado);

        // Limpiar campos
        nombreArticulo.value = '';
        stockActual.value = '';
        cantidadSolicitar.value = '';
    });

    // Agregar función de exportación a Excel
    document.getElementById('exportar-excel').addEventListener('click', () => {
        const selectedProvider = document.querySelector('input[name="proveedor-export"]:checked');
        
        if (!selectedProvider) {
            alert('Por favor seleccione un proveedor para exportar');
            return;
        }

        const proveedor = selectedProvider.value;
        const items = canastas[proveedor];

        if (items.length === 0) {
            alert('No hay artículos para exportar en la canasta seleccionada');
            return;
        }

        // Preparar datos para Excel
        const data = items.map(item => ({
            'Nombre': item.nombre,
            'Stock Actual': item.stock,
            'Cantidad Pedida': item.cantidad
        }));

        // Crear workbook y worksheet
        const ws = XLSX.utils.json_to_sheet(data);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Canasta");

        // Generar archivo Excel
        XLSX.writeFile(wb, `Canasta_${proveedor}_${new Date().toISOString().split('T')[0]}.xlsx`);
    });

    function actualizarCanasta(proveedor) {
        const canastaElement = document.getElementById(`canasta-${proveedor}`);
        const itemCount = document.querySelector(`.accordion-header[data-proveedor="${proveedor}"] .item-count`);
        
        canastaElement.innerHTML = '';
        itemCount.textContent = canastas[proveedor].length;

        canastas[proveedor].forEach((articulo, index) => {
            const articuloElement = document.createElement('div');
            articuloElement.className = 'articulo-item';
            articuloElement.innerHTML = `
                <div>
                    <strong>${articulo.nombre}</strong>
                    <br>
                    Stock actual: ${articulo.stock}
                    <br>
                    Cantidad solicitada: ${articulo.cantidad}
                </div>
                <button class="eliminar-articulo" data-proveedor="${proveedor}" data-index="${index}">Eliminar</button>
            `;
            canastaElement.appendChild(articuloElement);
        });

        // Agregar eventos a los botones de eliminar
        canastaElement.querySelectorAll('.eliminar-articulo').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const proveedorBtn = e.target.dataset.proveedor;
                const index = e.target.dataset.index;
                canastas[proveedorBtn].splice(index, 1);
                actualizarCanasta(proveedorBtn);
            });
        });
    }

    function mostrarModalDetalle(proveedor) {
        const modal = document.getElementById('modal-detalle');
        const modalProveedorNombre = document.getElementById('modal-proveedor-nombre');
        const modalListaArticulos = document.getElementById('modal-lista-articulos');

        modalProveedorNombre.textContent = proveedor.toUpperCase();
        modalListaArticulos.innerHTML = ''; // Limpiar lista anterior

        canastas[proveedor].forEach(articulo => {
            const li = document.createElement('li');
            li.textContent = `${articulo.nombre} - Stock: ${articulo.stock}, Cantidad: ${articulo.cantidad}`;
            modalListaArticulos.appendChild(li);
        });

        modal.style.display = "block";
    }

    // Cerrar el modal
    document.querySelector('.close-button').addEventListener('click', () => {
        document.getElementById('modal-detalle').style.display = "none";
    });

    // Cerrar el modal si se hace clic fuera del contenido
    window.addEventListener('click', (event) => {
        if (event.target == document.getElementById('modal-detalle')) {
            document.getElementById('modal-detalle').style.display = "none";
        }
    });
});