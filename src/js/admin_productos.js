// =================================================================
// ARCHIVO: admin_productos.js (o main.js)
// Gestión del catálogo de productos para TecnoCenter
// =================================================================

// -----------------------------------------------------------------
// 1. ESTADO DE LA APLICACIÓN (Nuestros datos en memoria)
// -----------------------------------------------------------------
let productos = [
  {
    id: 1,
    name: 'Samsung Galaxy S24 Ultra',
    brand: 'Samsung',
    category: 'Celulares',
    storage: '256',
    badge: 'Nuevo',
    price: 1299999,
    oldPrice: 1499999,
    stock: 15,
    active: true,
    image: '../assets/images/samsung-s24.png'
  },
  {
    id: 2,
    name: 'MacBook Pro 16 M3',
    brand: 'Apple',
    category: 'Portátiles',
    storage: '512',
    badge: 'En oferta',
    price: 2499,
    oldPrice: 2699,
    stock: 4,
    active: true,
    image: ''
  },
  {
    id: 3,
    name: 'Sony WH-1000XM5',
    brand: 'Sony',
    category: 'Audio',
    storage: '',
    badge: '',
    price: 399,
    oldPrice: null,
    stock: 0,
    active: false,
    image: ''
  },
  {
    id: 4,
    name: 'Xiaomi Redmi Note 13',
    brand: 'Xiaomi',
    category: 'Celulares',
    storage: '128',
    badge: '',
    price: 250,
    oldPrice: 300,
    stock: 8,
    active: true,
    image: ''
  }
];

// Variables para controlar los filtros y la paginación
let textoBusqueda = '';
let categoriaFiltro = '';
let estadoFiltro = '';
let paginaActual = 1;
const itemsPorPagina = 5;
let idProductoEditando = null;

// -----------------------------------------------------------------
// 2. OBTENER ELEMENTOS DEL HTML (DOM)
// -----------------------------------------------------------------
// Tarjetas de Indicadores (KPIs)
const kpiTotal = document.getElementById('kpiTotal');
const kpiAvail = document.getElementById('kpiAvail');
const kpiLow = document.getElementById('kpiLow');

// Filtros y Tabla
const inputSearch = document.getElementById('fSearch');
const selectCat = document.getElementById('fCat');
const botonesSegmentados = document.querySelectorAll('.tca-seg button');
const tablaCuerpo = document.getElementById('tbody');
const contadorTexto = document.getElementById('counter');
const listaPaginador = document.getElementById('pager');

// Drawer (Panel Lateral) y Formulario
const drawer = document.getElementById('drawer');
const scrim = document.getElementById('scrim');
const btnAbrirAgregar = document.getElementById('btnAdd');
const botonesCerrar = document.querySelectorAll('[data-close]');
const formulario = document.getElementById('form');
const tituloDrawer = document.getElementById('drawerTitle');
const subTituloDrawer = document.getElementById('drawerSub');

// Campos del Formulario
const inputNombre = document.getElementById('pName');
const selectMarca = document.getElementById('pBrand');
const selectCategoria = document.getElementById('pCat');
const selectAlmacenador = document.getElementById('pStorage');
const selectEtiqueta = document.getElementById('pBadge');
const inputPrecio = document.getElementById('pPrice');
const inputPrecioAnterior = document.getElementById('pOld');
const textoDescuento = document.getElementById('discountTxt');
const inputStock = document.getElementById('pStock');
const inputActivo = document.getElementById('pActive');
const textoEstado = document.getElementById('stateTxt');
const inputRutaImagen = document.getElementById('pImage');
const inputArchivoImagen = document.getElementById('fImg');
const vistaPreviaImagen = document.getElementById('preview');
const contenedorCargaVacia = document.getElementById('uploadEmpty');

// -----------------------------------------------------------------
// 3. FUNCIONES DE ACTUALIZACIÓN DE LA INTERFAZ
// -----------------------------------------------------------------

// Actualiza los 3 contadores de arriba (KPIs)
function actualizarKPIs() {
  const total = productos.length;
  const disponibles = productos.filter(p => p.active && p.stock > 0).length;
  const stockBajo = productos.filter(p => p.stock > 0 && p.stock < 10).length;

  if (kpiTotal) kpiTotal.textContent = total;
  if (kpiAvail) kpiAvail.textContent = disponibles;
  if (kpiLow) kpiLow.textContent = stockBajo;
}

// Filtra la lista según lo que escribió o seleccionó el usuario
function obtenerProductosFiltrados() {
  return productos.filter(producto => {
    // 1. Coincidencia por nombre o categoría
    const textoValido = producto.name.toLowerCase().includes(textoBusqueda.toLowerCase()) ||
                        producto.category.toLowerCase().includes(textoBusqueda.toLowerCase());

    // 2. Coincidencia por categoría seleccionada
    const categoriaValida = categoriaFiltro === '' || producto.category === categoriaFiltro;

    // 3. Coincidencia por el botón del filtro segmentado
    let estadoValido = true;
    if (estadoFiltro === 'activo') {
      estadoValido = producto.active && producto.stock > 0;
    } else if (estadoFiltro === 'bajo') {
      estadoValido = producto.stock > 0 && producto.stock < 10;
    } else if (estadoFiltro === 'agotado') {
      estadoValido = producto.stock === 0;
    }

    return textoValido && categoriaValida && estadoValido;
  });
}

// Renderiza los productos en el HTML de la tabla
function renderizarTabla() {
  const listaFiltrada = obtenerProductosFiltrados();
  const totalItems = listaFiltrada.length;
  const totalPaginas = Math.ceil(totalItems / itemsPorPagina) || 1;

  // Ajustar la página si eliminamos ítems y quedamos fuera de rango
  if (paginaActual > totalPaginas) {
    paginaActual = totalPaginas;
  }

  // Cortar la lista para mostrar solo los de la página actual
  const inicio = (paginaActual - 1) * itemsPorPagina;
  const productosPagina = listaFiltrada.slice(inicio, inicio + itemsPorPagina);

  // Si no hay productos que mostrar
  if (productosPagina.length === 0) {
    tablaCuerpo.innerHTML = `
      <tr>
        <td colspan="6" style="text-align: center; color: #64748b; padding: 24px;">
          No se encontraron productos disponibles.
        </td>
      </tr>`;
  } else {
    // Construir cada fila de la tabla
    let HTMLFilas = '';

    productosPagina.forEach(p => {
      // Determinar la etiqueta o badge del estado
      let claseBadge = 'bg-success-subtle text-success';
      let textoBadge = 'Activo';

      if (!p.active) {
        claseBadge = 'bg-secondary-subtle text-secondary';
        textoBadge = 'Inactivo';
      } else if (p.stock === 0) {
        claseBadge = 'bg-danger-subtle text-danger';
        textoBadge = 'Agotado';
      } else if (p.stock < 10) {
        claseBadge = 'bg-warning-subtle text-warning';
        textoBadge = 'Stock bajo';
      }

      // Imagen miniatura o caja por defecto si no hay imagen
      const miniatura = p.image
        ? `<img src="${p.image}" alt="${p.name}" style="width: 36px; height: 36px; object-fit: cover; border-radius: 6px;">`
        : `<div style="width: 36px; height: 36px; background: #e2e8f0; border-radius: 6px; display: flex; align-items: center; justify-content: center; color: #64748b;"><i class="bi bi-box-seam"></i></div>`;

      HTMLFilas += `
        <tr>
          <td>
            <div style="display: flex; align-items: center; gap: 12px;">
              ${miniatura}
              <div>
                <strong>${p.name}</strong>
                ${p.brand ? `<br><small class="text-muted">${p.brand}</small>` : ''}
              </div>
            </div>
          </td>
          <td>${p.category}</td>
          <td class="text-end">$${p.price.toFixed(2)}</td>
          <td class="text-end">${p.stock}</td>
          <td><span class="badge ${claseBadge}">${textoBadge}</span></td>
          <td class="text-end">
            <button type="button" class="tca-icon-btn btn-editar" data-id="${p.id}" title="Editar">
              <i class="bi bi-pencil"></i>
            </button>
            <button type="button" class="tca-icon-btn btn-eliminar" data-id="${p.id}" title="Eliminar" style="color: #ef4444;">
              <i class="bi bi-trash"></i>
            </button>
          </td>
        </tr>
      `;
    });

    tablaCuerpo.innerHTML = HTMLFilas;
  }

  // Actualizar el texto del contador
  const desde = totalItems === 0 ? 0 : inicio + 1;
  const hasta = Math.min(inicio + itemsPorPagina, totalItems);
  if (contadorTexto) {
    contadorTexto.textContent = `Mostrando ${desde} a ${hasta} de ${totalItems} productos`;
  }

  // Dibujar los botones del paginador
  renderizarPaginador(totalPaginas);
}

// Crea los botones dinámicos de paginación
function renderizarPaginador(totalPaginas) {
  if (!listaPaginador) return;

  if (totalPaginas <= 1) {
    listaPaginador.innerHTML = '';
    return;
  }

  let HTMLBotones = '';
  for (let i = 1; i <= totalPaginas; i++) {
    const esActiva = i === paginaActual ? 'is-active' : '';
    HTMLBotones += `
      <li>
        <button type="button" class="tca-btn tca-btn--ghost ${esActiva}" data-pagina="${i}" style="padding: 4px 10px; font-size: 0.85rem;">
          ${i}
        </button>
      </li>
    `;
  }
  listaPaginador.innerHTML = HTMLBotones;
}

// -----------------------------------------------------------------
// 4. FUNCIONES PARA EL PANEL LATERAL (DRAWER) Y FORMULARIO
// -----------------------------------------------------------------

function abrirDrawer(esEdicion = false, producto = null) {
  drawer.setAttribute('aria-hidden', 'false');
  drawer.classList.add('is-open');
  if (scrim) scrim.classList.add('is-open');

  if (esEdicion && producto) {
    idProductoEditando = producto.id;
    tituloDrawer.textContent = 'Editar producto';
    subTituloDrawer.textContent = 'Modifica los datos del producto seleccionado.';

    // Llenar campos con la información existente
    inputNombre.value = producto.name;
    selectMarca.value = producto.brand || '';
    selectCategoria.value = producto.category;
    selectAlmacenador.value = producto.storage || '';
    selectEtiqueta.value = producto.badge || '';
    inputPrecio.value = producto.price;
    inputPrecioAnterior.value = producto.oldPrice || '';
    inputStock.value = producto.stock;
    inputActivo.checked = producto.active;
    inputRutaImagen.value = producto.image || '';

    // Vista previa si hay imagen subida/cargada
    if (producto.image) {
      vistaPreviaImagen.src = producto.image;
      vistaPreviaImagen.hidden = false;
      contenedorCargaVacia.hidden = true;
    } else {
      limpiarVistaPreviaImagen();
    }

    calcularDescuento();
    actualizarTextoEstado();
  } else {
    // Es registro nuevo
    idProductoEditando = null;
    tituloDrawer.textContent = 'Agregar producto';
    subTituloDrawer.textContent = 'Completa los datos para publicarlo en la tienda.';
    formulario.reset();
    inputActivo.checked = true;
    limpiarVistaPreviaImagen();
    actualizarTextoEstado();
    if (textoDescuento) textoDescuento.textContent = 'El descuento se calcula solo.';
  }
}

function cerrarDrawer() {
  drawer.setAttribute('aria-hidden', 'true');
  drawer.classList.remove('is-open');
  if (scrim) scrim.classList.remove('is-open');
  formulario.reset();
  idProductoEditando = null;
  limpiarVistaPreviaImagen();
}

function limpiarVistaPreviaImagen() {
  vistaPreviaImagen.src = '';
  vistaPreviaImagen.hidden = true;
  contenedorCargaVacia.hidden = false;
  inputArchivoImagen.value = '';
}

function actualizarTextoEstado() {
  if (textoEstado) {
    textoEstado.textContent = inputActivo.checked ? 'Activo' : 'Inactivo';
  }
}

// Calcula el porcentaje de descuento cuando ingresas precio de venta y precio anterior
function calcularDescuento() {
  const precioVenta = parseFloat(inputPrecio.value);
  const precioAnterior = parseFloat(inputPrecioAnterior.value);

  if (precioAnterior > precioVenta && precioVenta > 0) {
    const ahorro = precioAnterior - precioVenta;
    const porcentaje = Math.round((ahorro / precioAnterior) * 100);
    textoDescuento.textContent = `¡Tiene un ${porcentaje}% de descuento!`;
    textoDescuento.style.color = '#10b981'; // Verde
  } else {
    textoDescuento.textContent = 'El descuento se calcula solo.';
    textoDescuento.style.color = '';
  }
}

// -----------------------------------------------------------------
// 5. CONFIGURACIÓN DE LISTENERS / EVENTOS
// -----------------------------------------------------------------

// Evento al escribir en el campo de búsqueda
inputSearch.addEventListener('input', (evento) => {
  textoBusqueda = evento.target.value;
  paginaActual = 1;
  renderizarTabla();
});

// Evento al cambiar la categoría en el filtro superior
selectCat.addEventListener('change', (evento) => {
  categoriaFiltro = evento.target.value;
  paginaActual = 1;
  renderizarTabla();
});

// Evento para los botones segmentados (Todos, Activos, Stock bajo, Agotados)
botonesSegmentados.forEach(boton => {
  boton.addEventListener('click', () => {
    botonesSegmentados.forEach(b => b.classList.remove('is-active'));
    boton.classList.add('is-active');
    estadoFiltro = boton.dataset.status;
    paginaActual = 1;
    renderizarTabla();
  });
});

// Evento para cambiar de página desde los botones numéricos
if (listaPaginador) {
  listaPaginador.addEventListener('click', (evento) => {
    const botonPagina = evento.target.closest('[data-pagina]');
    if (botonPagina) {
      paginaActual = parseInt(botonPagina.dataset.pagina, 10);
      renderizarTabla();
    }
  });
}

// Eventos para Abrir y Cerrar el Drawer
btnAbrirAgregar.addEventListener('click', () => abrirDrawer(false));
botonesCerrar.forEach(btn => btn.addEventListener('click', cerrarDrawer));
if (scrim) scrim.addEventListener('click', cerrarDrawer);

// Evento del interruptor/checkbox (Estado Activo/Inactivo)
inputActivo.addEventListener('change', actualizarTextoEstado);

// Eventos para cálculo automático de descuento
inputPrecio.addEventListener('input', calcularDescuento);
inputPrecioAnterior.addEventListener('input', calcularDescuento);

// Vista previa cuando el usuario sube un archivo local
inputArchivoImagen.addEventListener('change', (evento) => {
  const archivo = evento.target.files[0];
  if (archivo) {
    const lector = new FileReader();
    lector.onload = (e) => {
      vistaPreviaImagen.src = e.target.result;
      vistaPreviaImagen.hidden = false;
      contenedorCargaVacia.hidden = true;
      // Colocar el nombre asignado dinámicamente en el campo de ruta por referencia
      inputRutaImagen.value = `../assets/images/${archivo.name}`;
    };
    lector.readAsDataURL(archivo);
  }
});

// Evento cuando se presiona "Guardar producto" en el formulario
formulario.addEventListener('submit', (evento) => {
  evento.preventDefault();

  // Validaciones básicas requeridas del navegador
  if (!formulario.checkValidity()) {
    formulario.reportValidity();
    return;
  }

  // Capturar los datos en un nuevo objeto
  const nuevoProducto = {
    id: idProductoEditando ? idProductoEditando : Date.now(),
    name: inputNombre.value.trim(),
    brand: selectMarca.value,
    category: selectCategoria.value,
    storage: selectAlmacenador.value,
    badge: selectEtiqueta.value,
    price: parseFloat(inputPrecio.value) || 0,
    oldPrice: parseFloat(inputPrecioAnterior.value) || null,
    stock: parseInt(inputStock.value, 10) || 0,
    active: inputActivo.checked,
    image: inputRutaImagen.value.trim() || vistaPreviaImagen.src || ''
  };

  if (idProductoEditando) {
    // Reemplazar los datos del producto existente
    productos = productos.map(p => p.id === idProductoEditando ? nuevoProducto : p);
  } else {
    // Agregar el nuevo producto al principio del arreglo
    productos.unshift(nuevoProducto);
  }

  // Limpiar, refrescar y cerrar
  cerrarDrawer();
  actualizarKPIs();
  renderizarTabla();
});

// Eventos Delegados en la Tabla (Editar y Eliminar)
tablaCuerpo.addEventListener('click', (evento) => {
  const botonEditar = evento.target.closest('.btn-editar');
  const botonEliminar = evento.target.closest('.btn-eliminar');

  // Si hizo clic en el botón de Editar
  if (botonEditar) {
    const id = parseInt(botonEditar.dataset.id, 10);
    const productoEncontrado = productos.find(p => p.id === id);
    if (productoEncontrado) {
      abrirDrawer(true, productoEncontrado);
    }
  }

  // Si hizo clic en el botón de Eliminar
  if (botonEliminar) {
    const id = parseInt(botonEliminar.dataset.id, 10);
    const confirmacion = confirm('¿Estás seguro de que deseas eliminar este producto?');
    if (confirmacion) {
      productos = productos.filter(p => p.id !== id);
      actualizarKPIs();
      renderizarTabla();
    }
  }
});

// -----------------------------------------------------------------
// 6. INICIALIZACIÓN
// -----------------------------------------------------------------
actualizarKPIs();
renderizarTabla();