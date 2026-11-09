// =================================================================
// ARCHIVO: src/js/Administrador/admin_productos.js
// Gestión del catálogo de productos para TecnoCenter
// Fuente de datos: src/data/celulares.json (vía ./productos.js)
//
// Campos del JSON que maneja esta vista:
//   id, marca, modelo, sku, categoria, almacenamiento, etiqueta, precio,
//   precioAnterior, descuento, stock, activo, rating, reviews, colores, imagen
// =================================================================

import { cargarProductos, guardarProductos, OPCIONES } from './productos.js';

// -----------------------------------------------------------------
// 0. CONSTANTES
// -----------------------------------------------------------------
const UMBRAL_STOCK_BAJO = 10;              // menos de 10 unidades = "Stock bajo"
const ITEMS_POR_PAGINA = 6;
const TAMANO_MAX_IMAGEN = 2 * 1024 * 1024; // 2 MB, como indica el formulario
const MAX_DIGITOS_MONTO = 12;              // tope de dígitos en los campos de dinero
const CARPETA_IMAGENES = '../assets/images/celulares/'; // donde se guardan las imágenes del catálogo
const TEXTO_PRECIO_DEFECTO = 'Escribe solo números, los puntos se ponen solos.';
const TEXTO_DESCUENTO_DEFECTO = 'El descuento se calcula solo.';

// -----------------------------------------------------------------
// 1. DATOS: JSON (español) <-> modelo del admin (inglés)
// -----------------------------------------------------------------

// JSON -> admin (da valores seguros si al JSON le falta algún campo)
const aAdmin = (p) => ({
  id: p.id,
  name: p.modelo,
  brand: p.marca,
  sku: p.sku ?? '',
  // Acepta 256 o "256 GB": se queda solo con el número
  storage: String(parseInt(p.almacenamiento, 10) || ''),
  badge: p.etiqueta || '',
  price: p.precio,
  oldPrice: p.precioAnterior ?? null,
  stock: p.stock ?? 0,
  active: p.activo ?? true,
  image: p.imagen,
  rating: p.rating ?? 0,
  reviews: p.reviews ?? 0,
  colors: Array.isArray(p.colores) ? p.colores : []
});

// admin -> JSON (conserva categoría y cualquier otro campo del producto original)
const deAdmin = (a, previo = {}) => {
  const descuento =
    a.oldPrice && a.oldPrice > a.price
      ? Math.round(((a.oldPrice - a.price) / a.oldPrice) * 100)
      : 0;

  return {
    ...previo,
    id: a.id,
    marca: a.brand,
    modelo: a.name,
    sku: a.sku ?? previo.sku ?? '',
    categoria: previo.categoria ?? 'Celulares',
    almacenamiento: Number(a.storage) || 0,
    etiqueta: a.badge || null,
    precio: a.price,
    precioAnterior: a.oldPrice,
    descuento,
    stock: a.stock,
    activo: a.active,
    rating: a.rating ?? previo.rating ?? 0,
    reviews: a.reviews ?? previo.reviews ?? 0,
    colores: a.colors ?? previo.colores ?? [],
    imagen: a.image
  };
};

// -----------------------------------------------------------------
// 2. ESTADO DE LA APLICACIÓN (datos en memoria)
// -----------------------------------------------------------------
let originales = await cargarProductos(); // formato del JSON
let productos = originales.map(aAdmin);   // formato del admin

// Guarda los cambios (el catálogo lee de ahí)
function persistir() {
  const porId = new Map(originales.map((p) => [p.id, p]));
  originales = productos.map((a) => deAdmin(a, porId.get(a.id)));
  try {
    guardarProductos(originales);
  } catch (e) {
    alert('No se pudo guardar: el almacenamiento del navegador está lleno. Usa imágenes más pequeñas o elimina productos.');
  }
}

// Las rutas de imagen del JSON son relativas a src/html/ (así las usa el catálogo).
// Esta página vive en src/html/Administrador/, por eso se resuelven contra src/html/.
const BASE_IMAGENES = new URL('../', window.location.href);
const resolverImagen = (ruta) => (ruta ? new URL(ruta, BASE_IMAGENES).href : '');

// Imagen subida desde el formulario, ya reducida y en formato data URL.
// El sitio no tiene servidor: así la imagen queda guardada junto al producto.
let imagenData = '';

// Ruta que el formulario propuso solo al subir una imagen (carpeta + nombre del archivo).
// Sirve para saber si la persona la dejó tal cual o la cambió a mano.
let rutaAutogenerada = '';

// Filtros, orden y paginación
let textoBusqueda = '';
let filtroPublicacion = '';  // '' | 'publicado' | 'borrador'
let filtroInventario = '';   // '' | 'disponible' | 'bajo' | 'agotado'
let marcaFiltro = '';
let ordenCampo = '';         // '' | 'name' | 'brand' | 'price' | 'stock'
let ordenDireccion = 'asc';  // 'asc' | 'desc'
let paginaActual = 1;

// Selección de filas (casillas) y menú de la fila (⋯)
const seleccion = new Set();   // ids de los productos marcados
let idsPagina = [];            // ids que se ven en la página actual
let menuProductoId = null;     // producto al que pertenece el menú abierto
let menuBotonActivo = null;    // botón ⋯ que abrió el menú

let idProductoEditando = null;
let elementoPrevio = null; // quién tenía el foco antes de abrir el panel

// Modal de confirmación
let resolverDialogo = null;      // función que cierra la promesa de confirmar()
let elementoPrevioDialogo = null;

// -----------------------------------------------------------------
// 3. OBTENER ELEMENTOS DEL HTML (DOM)
// -----------------------------------------------------------------
// Tarjetas de indicadores (KPIs)
const kpiTotal = document.getElementById('kpiTotal');
const kpiNew = document.getElementById('kpiNew');
const kpiAvail = document.getElementById('kpiAvail');
const kpiAvailPct = document.getElementById('kpiAvailPct');
const kpiAvailRing = document.getElementById('kpiAvailRing');
const kpiLow = document.getElementById('kpiLow');
const kpiOut = document.getElementById('kpiOut');
const kpiOutPct = document.getElementById('kpiOutPct');

// Filtros y tabla
const inputSearch = document.getElementById('fSearch');
const selectPublicacion = document.getElementById('fPublish');
const selectInventario = document.getElementById('fStock');
const selectMarcaFiltro = document.getElementById('fBrand');
const btnLimpiar = document.getElementById('btnClear');
const botonesOrden = document.querySelectorAll('.tca-sort');
const tablaCuerpo = document.getElementById('tbody');
const contadorTexto = document.getElementById('counter');
const listaPaginador = document.getElementById('pager');

// Selección múltiple y menú de la fila
const chkTodos = document.getElementById('chkAll');
const barraSeleccion = document.getElementById('bulkBar');
const textoSeleccion = document.getElementById('bulkCount');
const btnQuitarSeleccion = document.getElementById('btnBulkClear');
const btnEliminarSeleccion = document.getElementById('btnBulkDelete');
const menuFila = document.getElementById('rowMenu');

// Panel lateral (drawer) y formulario
const drawer = document.getElementById('drawer');
const scrim = document.getElementById('scrim');
const btnAbrirAgregar = document.getElementById('btnAdd');
const botonesCerrar = document.querySelectorAll('[data-close]');
const formulario = document.getElementById('form');
const tituloDrawer = document.getElementById('drawerTitle');
const subTituloDrawer = document.getElementById('drawerSub');

// Campos del formulario
const inputNombre = document.getElementById('pName');
const inputSku = document.getElementById('pSku');
const selectMarca = document.getElementById('pBrand');
const selectAlmacenador = document.getElementById('pStorage');
const selectEtiqueta = document.getElementById('pBadge');
const inputPrecio = document.getElementById('pPrice');
const inputPrecioAnterior = document.getElementById('pOld');
const textoPrecio = document.getElementById('priceTxt');
const textoDescuento = document.getElementById('discountTxt');
const inputStock = document.getElementById('pStock');
const inputRating = document.getElementById('pRating');
const inputReviews = document.getElementById('pReviews');
const contenedorColores = document.getElementById('pColors');
const inputActivo = document.getElementById('pActive');
const textoEstado = document.getElementById('stateTxt');
const inputRutaImagen = document.getElementById('pImage');
const inputArchivoImagen = document.getElementById('fImg');
const zonaCarga = document.getElementById('upload');
const vistaPreviaImagen = document.getElementById('preview');
const contenedorCargaVacia = document.getElementById('uploadEmpty');

// Modal de confirmación
const dialogo = document.getElementById('dialog');
const dialogoTitulo = document.getElementById('dialogTitle');
const dialogoMensaje = document.getElementById('dialogMsg');
const dialogoItem = document.getElementById('dialogItem');
const dialogoOkTexto = document.getElementById('dialogOkText');
const btnDialogoCancelar = document.getElementById('dialogCancel');
const btnDialogoOk = document.getElementById('dialogOk');

// -----------------------------------------------------------------
// 4. UTILIDADES
// -----------------------------------------------------------------

// Escapa texto antes de insertarlo como HTML (nombres, marcas, rutas)
const esc = (valor) =>
  String(valor ?? '').replace(/[&<>"']/g, (c) => (
    { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
  ));

const formatoCOP = (n) =>
  new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0
  }).format(n);

// 8,3% (una decimal, coma decimal)
const formatoPorcentaje = (n) =>
  `${new Intl.NumberFormat('es-CO', { minimumFractionDigits: 1, maximumFractionDigits: 1 }).format(n)}%`;

// 1024 GB se muestra como "1 TB"; el resto en GB
const etiquetaAlmacenamiento = (v) =>
  Number(v) >= 1024 ? `${Number(v) / 1024} TB` : `${v} GB`;

// ----- Dinero: los campos de precio se escriben como 3.500.000 -----

// Deja solo los dígitos de un texto ("$ 3.500.000" -> "3500000")
const soloDigitos = (texto) => String(texto ?? '').replace(/\D/g, '');

// Valor numérico de un campo de dinero (0 si está vacío)
const leerMonto = (input) => parseInt(soloDigitos(input.value), 10) || 0;

// 3500000 -> "3.500.000" (0 -> vacío, para que se vea el placeholder)
const formatoMiles = (n) => (n > 0 ? String(n).replace(/\B(?=(\d{3})+(?!\d))/g, '.') : '');

// 3500000 -> "Son 3 millones 500 mil pesos"
function montoEnTexto(n) {
  if (n <= 0) return '';
  if (n < 1000) return `Son ${n} pesos`;

  const millones = Math.floor(n / 1e6);
  const miles = Math.floor((n % 1e6) / 1e3);
  const resto = n % 1e3;

  const partes = [];
  if (millones) partes.push(`${millones} ${millones === 1 ? 'millón' : 'millones'}`);
  if (miles) partes.push(`${miles} mil`);
  if (resto) partes.push(String(resto));

  // "1 millón de pesos", pero "3 millones 500 mil pesos"
  const conDe = millones > 0 && miles === 0 && resto === 0;
  return `Son ${partes.join(' ')}${conDe ? ' de' : ''} pesos`;
}

// Da formato de miles mientras se escribe y deja el cursor donde estaba
function formatearInputMonto(input) {
  const posicion = input.selectionStart ?? input.value.length;
  const digitosAntes = soloDigitos(input.value.slice(0, posicion)).length;

  const digitos = soloDigitos(input.value).replace(/^0+/, '').slice(0, MAX_DIGITOS_MONTO);
  input.value = formatoMiles(parseInt(digitos, 10) || 0);

  let nuevaPosicion = 0;
  if (digitosAntes > 0) {
    let contados = 0;
    nuevaPosicion = input.value.length;
    for (let i = 0; i < input.value.length; i++) {
      if (/\d/.test(input.value[i])) contados++;
      if (contados === digitosAntes) { nuevaPosicion = i + 1; break; }
    }
  }
  input.setSelectionRange(nuevaPosicion, nuevaPosicion);
}

// Dibuja las casillas de color del formulario a partir de OPCIONES.colores (una sola vez)
function dibujarColores() {
  if (!contenedorColores) return;
  contenedorColores.innerHTML = Object.entries(OPCIONES.colores).map(([nombre, hex]) => `
    <label class="tca-color" title="${esc(nombre)}">
      <input type="checkbox" name="color" value="${esc(nombre)}" aria-label="${esc(nombre)}">
      <span style="--c: ${hex}"></span>
    </label>`).join('');
}

// Marca las casillas de la lista recibida (al editar un producto)
const marcarColores = (lista = []) =>
  contenedorColores?.querySelectorAll('input').forEach((i) => { i.checked = lista.includes(i.value); });

// Colores seleccionados en el formulario
const leerColores = () =>
  [...(contenedorColores?.querySelectorAll('input:checked') ?? [])].map((i) => i.value);

// Disponibilidad que se muestra en la tabla (depende solo del stock)
function disponibilidad(p) {
  if (p.stock === 0) return { texto: 'Agotado', clase: 'danger' };
  if (p.stock < UMBRAL_STOCK_BAJO) return { texto: 'Stock bajo', clase: 'warning' };
  return { texto: 'Disponible', clase: 'success' };
}

// Clase de color para el número de stock
function claseStock(stock) {
  if (stock === 0) return ' tca-stock--out';
  if (stock < UMBRAL_STOCK_BAJO) return ' tca-stock--low';
  return '';
}

// Miniatura del producto, o un ícono si no tiene imagen (tabla y modal)
function miniaturaHTML(p) {
  return p.image
    ? `<img class="tca-thumb" src="${esc(resolverImagen(p.image))}" alt="${esc(p.name)}" loading="lazy">`
    : '<span class="tca-thumb tca-thumb--empty"><i class="bi bi-box-seam"></i></span>';
}

// Reducir y convertir a JPG la imagen subida (así cabe en el navegador)
function comprimirImagen(archivo, maxLado = 600, calidad = 0.8) {
  return new Promise((resolve, reject) => {
    const lector = new FileReader();
    lector.onerror = reject;
    lector.onload = () => {
      const img = new Image();
      img.onerror = reject;
      img.onload = () => {
        const escala = Math.min(1, maxLado / Math.max(img.width, img.height));
        const canvas = document.createElement('canvas');
        canvas.width = Math.round(img.width * escala);
        canvas.height = Math.round(img.height * escala);
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#ffffff'; // evita fondo negro en PNG con transparencia
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/jpeg', calidad));
      };
      img.src = lector.result;
    };
    lector.readAsDataURL(archivo);
  });
}

// -----------------------------------------------------------------
// 5. FUNCIONES DE ACTUALIZACIÓN DE LA INTERFAZ
// -----------------------------------------------------------------

// Actualiza las 4 tarjetas de arriba (KPIs)
function actualizarKPIs() {
  const total = productos.length;
  const activos = productos.filter((p) => p.active && p.stock > 0).length;
  const stockBajo = productos.filter((p) => p.stock > 0 && p.stock < UMBRAL_STOCK_BAJO).length;
  const agotados = productos.filter((p) => p.stock === 0).length;
  const nuevos = productos.filter((p) => p.badge === 'Nuevo').length;

  const pctActivos = total ? (activos / total) * 100 : 0;
  const pctAgotados = total ? (agotados / total) * 100 : 0;

  if (kpiTotal) kpiTotal.textContent = total;
  if (kpiNew) kpiNew.textContent = `${nuevos} ${nuevos === 1 ? 'nuevo' : 'nuevos'}`;
  if (kpiAvail) kpiAvail.textContent = activos;
  if (kpiAvailPct) kpiAvailPct.textContent = formatoPorcentaje(pctActivos);
  if (kpiAvailRing) kpiAvailRing.style.setProperty('--p', pctActivos.toFixed(1));
  if (kpiLow) kpiLow.textContent = stockBajo;
  if (kpiOut) kpiOut.textContent = agotados;
  if (kpiOutPct) kpiOutPct.textContent = formatoPorcentaje(pctAgotados);
}

// Llena el filtro de marcas de la tabla con las marcas que existen en los productos
function poblarFiltroMarcas() {
  if (!selectMarcaFiltro) return;

  const marcas = [...new Set(productos.map((p) => p.brand).filter(Boolean))]
    .sort((a, b) => a.localeCompare(b, 'es'));

  // Si la marca seleccionada ya no existe (se eliminó su último producto), se limpia
  if (marcaFiltro && !marcas.includes(marcaFiltro)) marcaFiltro = '';

  selectMarcaFiltro.innerHTML =
    '<option value="">Todas las marcas</option>' +
    marcas
      .map((m) => `<option value="${esc(m)}"${m === marcaFiltro ? ' selected' : ''}>${esc(m)}</option>`)
      .join('');
}

// Llena un <select> del formulario con los valores que existen en el JSON.
// Conserva la primera opción (la vacía) y quita las repetidas.
function completarSelect(select, valores, { orden, etiqueta = (v) => v } = {}) {
  if (!select) return;

  const [opcionVacia, ...resto] = [...select.options];
  const mapa = new Map(resto.map((o) => [o.value, o.textContent]));

  valores.forEach((v) => {
    const clave = String(v);
    if (!mapa.has(clave)) mapa.set(clave, etiqueta(v));
  });

  const claves = [...mapa.keys()];
  if (orden) claves.sort(orden);

  const seleccionado = select.value; // no perder lo que ya estaba elegido
  select.innerHTML = '';
  select.append(opcionVacia);
  claves.forEach((c) => select.add(new Option(mapa.get(c), c)));
  select.value = seleccionado;
}

// Marca, almacenamiento y etiqueta del formulario salen de OPCIONES (productos.js)
// más lo que ya tengan los productos (por si alguno trae un valor que no está en la lista)
function actualizarOpcionesFormulario() {
  completarSelect(
    selectMarca,
    [...OPCIONES.marcas, ...productos.map((p) => p.brand).filter(Boolean)]
  );

  completarSelect(
    selectAlmacenador,
    [...OPCIONES.almacenamientos, ...productos.map((p) => p.storage)].filter((v) => Number(v) > 0),
    { orden: (a, b) => Number(a) - Number(b), etiqueta: etiquetaAlmacenamiento }
  );

  completarSelect(
    selectEtiqueta,
    [...OPCIONES.etiquetas, ...productos.map((p) => p.badge).filter(Boolean)]
  );
}

// Ordena la lista según la columna elegida (si hay una)
function ordenarProductos(lista) {
  if (!ordenCampo) return lista;

  const dir = ordenDireccion === 'asc' ? 1 : -1;
  const valor = (p) => (ordenCampo === 'name' ? p.name : ordenCampo === 'brand' ? p.brand : p[ordenCampo]);

  return [...lista].sort((a, b) => {
    const va = valor(a);
    const vb = valor(b);
    const comparacion = typeof va === 'number'
      ? va - vb
      : String(va ?? '').localeCompare(String(vb ?? ''), 'es');
    return comparacion * dir;
  });
}

// Filtra la lista según lo que escribió o seleccionó el usuario
function obtenerProductosFiltrados() {
  const q = textoBusqueda.trim().toLowerCase();

  const filtrados = productos.filter((p) => {
    // 1. Búsqueda por nombre, marca o modelo (SKU)
    const textoValido = !q ||
      [p.name, p.brand, p.sku].some((v) => String(v ?? '').toLowerCase().includes(q));

    // 2. Estado de publicación
    const publicacionValida =
      filtroPublicacion === '' ||
      (filtroPublicacion === 'publicado' && p.active) ||
      (filtroPublicacion === 'borrador' && !p.active);

    // 3. Inventario
    let inventarioValido = true;
    if (filtroInventario === 'disponible') {
      // Igual que la insignia "Disponible" de la tabla: stock suficiente (no bajo ni agotado)
      inventarioValido = p.stock >= UMBRAL_STOCK_BAJO;
    } else if (filtroInventario === 'bajo') {
      inventarioValido = p.stock > 0 && p.stock < UMBRAL_STOCK_BAJO;
    } else if (filtroInventario === 'agotado') {
      inventarioValido = p.stock === 0;
    }

    // 4. Marca
    const marcaValida = marcaFiltro === '' || p.brand === marcaFiltro;

    return textoValido && publicacionValida && inventarioValido && marcaValida;
  });

  return ordenarProductos(filtrados);
}

// Una fila de la tabla (usa las clases .tca-* de la hoja de estilos)
function crearFila(p) {
  const disp = disponibilidad(p);
  const marcada = seleccion.has(p.id);

  // Segunda línea: modelo | almacenamiento (se omite lo que no exista)
  const partes = [];
  if (p.sku) partes.push(`<span class="tca-product__model">${esc(p.sku)}</span>`);
  if (Number(p.storage) > 0) {
    partes.push(`<span class="tca-product__storage">${etiquetaAlmacenamiento(p.storage)}</span>`);
  }
  const detalle = partes.length
    ? `<span class="tca-product__meta">${partes.join('<span class="tca-product__sep" aria-hidden="true">|</span>')}</span>`
    : '';

  const tieneDescuento = p.oldPrice && p.oldPrice > p.price;

  return `
    <tr class="${marcada ? 'is-selected' : ''}">
      <td class="tca-col-check">
        <input type="checkbox" class="tca-check js-fila" data-id="${p.id}" ${marcada ? 'checked' : ''}
          aria-label="Seleccionar ${esc(p.name)}">
      </td>
      <td>
        <div class="tca-product">
          ${miniaturaHTML(p)}
          <div class="tca-product__info">
            <span class="tca-product__name" title="${esc(p.name)}">${esc(p.name)}</span>
            ${detalle}
          </div>
        </div>
      </td>
      <td>${esc(p.brand)}</td>
      <td>
        <span class="tca-price">${formatoCOP(p.price)}</span>
        ${tieneDescuento ? `<span class="tca-price__old">${formatoCOP(p.oldPrice)}</span>` : ''}
      </td>
      <td class="text-center"><span class="tca-stock${claseStock(p.stock)}">${p.stock}</span></td>
      <td class="text-center">
        <span class="tca-badge tca-badge--${disp.clase}">${disp.texto}</span>
      </td>
      <td class="text-center">
        <label class="tca-switch tca-switch--sm" title="${p.active ? 'Publicado' : 'No publicado'}">
          <input type="checkbox" class="js-publicar" data-id="${p.id}" ${p.active ? 'checked' : ''}
            role="switch" aria-label="Publicar ${esc(p.name)} en la tienda">
          <span></span>
        </label>
      </td>
      <td class="text-center">
        <span class="tca-actions">
          <button type="button" class="tca-icon-btn tca-icon-btn--outline btn-editar" data-id="${p.id}"
            title="Editar" aria-label="Editar ${esc(p.name)}">
            <i class="bi bi-pencil"></i>
          </button>
          <button type="button" class="tca-icon-btn tca-icon-btn--outline btn-mas" data-id="${p.id}"
            title="Más acciones" aria-label="Más acciones para ${esc(p.name)}" aria-haspopup="menu" aria-expanded="false">
            <i class="bi bi-three-dots"></i>
          </button>
        </span>
      </td>
    </tr>`;
}

// "Limpiar filtros" solo se activa cuando hay algún filtro aplicado
function actualizarBotonLimpiar() {
  const hayFiltros = textoBusqueda.trim() !== '' || filtroPublicacion !== '' ||
    filtroInventario !== '' || marcaFiltro !== '';
  btnLimpiar.disabled = !hayFiltros;
}

// Renderiza los productos en la tabla
function renderizarTabla() {
  const listaFiltrada = obtenerProductosFiltrados();
  const totalItems = listaFiltrada.length;
  const totalPaginas = Math.ceil(totalItems / ITEMS_POR_PAGINA) || 1;

  // Ajustar la página si eliminamos ítems y quedamos fuera de rango
  if (paginaActual > totalPaginas) paginaActual = totalPaginas;

  // Cortar la lista para mostrar solo los de la página actual
  const inicio = (paginaActual - 1) * ITEMS_POR_PAGINA;
  const productosPagina = listaFiltrada.slice(inicio, inicio + ITEMS_POR_PAGINA);
  idsPagina = productosPagina.map((p) => p.id);

  if (productosPagina.length === 0) {
    tablaCuerpo.innerHTML = `
      <tr>
        <td colspan="8" class="tca-table__empty">No se encontraron productos.</td>
      </tr>`;
  } else {
    tablaCuerpo.innerHTML = productosPagina.map(crearFila).join('');
  }

  // Texto del contador
  const desde = totalItems === 0 ? 0 : inicio + 1;
  const hasta = Math.min(inicio + ITEMS_POR_PAGINA, totalItems);
  if (contadorTexto) {
    contadorTexto.textContent = `Mostrando ${desde} – ${hasta} de ${totalItems} productos`;
  }

  renderizarPaginador(totalPaginas);
  actualizarCabecerasOrden();
  actualizarSeleccionUI();
  actualizarBotonLimpiar();
}

// Páginas que se muestran: 1 … 4 5 6 … 20 (con "…" cuando hay saltos)
function paginasVisibles(actual, total) {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);

  const lista = [...new Set([1, total, actual - 1, actual, actual + 1])]
    .filter((n) => n >= 1 && n <= total)
    .sort((a, b) => a - b);

  const salida = [];
  lista.forEach((n, i) => {
    if (i > 0 && n - lista[i - 1] > 1) salida.push('…');
    salida.push(n);
  });
  return salida;
}

// Crea los botones de la paginación (anterior, números y siguiente)
function renderizarPaginador(totalPaginas) {
  if (!listaPaginador) return;

  if (totalPaginas <= 1) {
    listaPaginador.innerHTML = '';
    return;
  }

  const numeros = paginasVisibles(paginaActual, totalPaginas).map((n) => {
    if (n === '…') return '<li><span class="tca-page tca-page--gap" aria-hidden="true">…</span></li>';
    const esActiva = n === paginaActual;
    return `
      <li>
        <button type="button" class="tca-page${esActiva ? ' is-active' : ''}" data-pagina="${n}"
          ${esActiva ? 'aria-current="page"' : ''} aria-label="Página ${n}">${n}</button>
      </li>`;
  }).join('');

  listaPaginador.innerHTML = `
    <li>
      <button type="button" class="tca-page" data-pagina="${paginaActual - 1}" aria-label="Página anterior"
        ${paginaActual === 1 ? 'disabled' : ''}><i class="bi bi-chevron-left"></i></button>
    </li>
    ${numeros}
    <li>
      <button type="button" class="tca-page" data-pagina="${paginaActual + 1}" aria-label="Página siguiente"
        ${paginaActual === totalPaginas ? 'disabled' : ''}><i class="bi bi-chevron-right"></i></button>
    </li>`;
}

// Muestra la flecha de orden en la columna activa
function actualizarCabecerasOrden() {
  botonesOrden.forEach((boton) => {
    const activo = boton.dataset.sort === ordenCampo;
    const icono = boton.querySelector('i');

    if (icono) {
      icono.className = 'bi ' + (!activo ? 'bi-arrow-down-up' : (ordenDireccion === 'asc' ? 'bi-arrow-up' : 'bi-arrow-down'));
    }
    boton.classList.toggle('is-active', activo);
    boton.closest('th')?.setAttribute('aria-sort', activo ? (ordenDireccion === 'asc' ? 'ascending' : 'descending') : 'none');
  });
}

// Casilla general, contador y barra de acciones según lo seleccionado
function actualizarSeleccionUI() {
  const marcadosEnPagina = idsPagina.filter((id) => seleccion.has(id)).length;

  if (chkTodos) {
    chkTodos.checked = idsPagina.length > 0 && marcadosEnPagina === idsPagina.length;
    chkTodos.indeterminate = marcadosEnPagina > 0 && marcadosEnPagina < idsPagina.length;
  }

  const n = seleccion.size;
  if (barraSeleccion) barraSeleccion.hidden = n === 0;
  if (textoSeleccion) textoSeleccion.textContent = `${n} ${n === 1 ? 'seleccionado' : 'seleccionados'}`;
}

// -----------------------------------------------------------------
// 6. PANEL LATERAL (DRAWER) Y FORMULARIO
// -----------------------------------------------------------------

function abrirDrawer(esEdicion = false, producto = null) {
  elementoPrevio = document.activeElement;
  drawer.setAttribute('aria-hidden', 'false');
  drawer.classList.add('is-open');
  if (scrim) scrim.classList.add('is-open');

  if (esEdicion && producto) {
    idProductoEditando = producto.id;
    tituloDrawer.textContent = 'Editar producto';
    subTituloDrawer.textContent = 'Modifica los datos del producto seleccionado.';

    // Llenar campos con la información existente
    inputNombre.value = producto.name;
    inputSku.value = producto.sku || '';
    selectMarca.value = producto.brand || '';
    selectAlmacenador.value = producto.storage || '';
    selectEtiqueta.value = producto.badge || '';
    inputPrecio.value = formatoMiles(producto.price);
    inputPrecioAnterior.value = formatoMiles(producto.oldPrice);
    inputStock.value = producto.stock;
    inputRating.value = producto.rating ?? 0;
    inputReviews.value = producto.reviews ?? 0;
    marcarColores(producto.colors);
    inputActivo.checked = producto.active;

    // Si la imagen está embebida (subida desde el formulario) no se muestra como texto
    imagenData = (producto.image || '').startsWith('data:') ? producto.image : '';
    rutaAutogenerada = '';
    inputRutaImagen.value = imagenData ? '' : (producto.image || '');

    // Vista previa si hay imagen subida/cargada
    if (producto.image) {
      vistaPreviaImagen.src = resolverImagen(producto.image);
      vistaPreviaImagen.hidden = false;
      contenedorCargaVacia.hidden = true;
    } else {
      limpiarVistaPreviaImagen();
    }

    actualizarMontos();
    actualizarTextoEstado();
  } else {
    // Registro nuevo
    idProductoEditando = null;
    tituloDrawer.textContent = 'Agregar producto';
    subTituloDrawer.textContent = 'Completa los datos para publicarlo en la tienda.';
    formulario.reset();
    inputActivo.checked = true;
    limpiarVistaPreviaImagen();
    actualizarTextoEstado();
    actualizarMontos();
  }

  inputNombre.focus();
}

function cerrarDrawer() {
  drawer.setAttribute('aria-hidden', 'true');
  drawer.classList.remove('is-open');
  if (scrim) scrim.classList.remove('is-open');
  formulario.reset();
  idProductoEditando = null;
  limpiarVistaPreviaImagen();
  inputPrecio.setCustomValidity('');
  actualizarMontos();

  // Devolver el foco a donde estaba antes de abrir el panel
  if (elementoPrevio && typeof elementoPrevio.focus === 'function') elementoPrevio.focus();
  elementoPrevio = null;
}

function limpiarVistaPreviaImagen() {
  imagenData = '';
  rutaAutogenerada = '';
  vistaPreviaImagen.removeAttribute('src');
  vistaPreviaImagen.hidden = true;
  contenedorCargaVacia.hidden = false;
  inputArchivoImagen.value = '';
}

function actualizarTextoEstado() {
  if (textoEstado) {
    textoEstado.textContent = inputActivo.checked ? 'Activo' : 'Inactivo';
  }
}

// Actualiza los textos de ayuda de los precios:
//   - bajo el precio de venta: el valor en palabras ("Son 3 millones 500 mil pesos")
//   - bajo el precio anterior: el porcentaje de descuento, o su valor en palabras
function actualizarMontos() {
  const precioVenta = leerMonto(inputPrecio);
  const precioAnterior = leerMonto(inputPrecioAnterior);

  if (textoPrecio) {
    textoPrecio.textContent = precioVenta > 0 ? montoEnTexto(precioVenta) : TEXTO_PRECIO_DEFECTO;
    textoPrecio.classList.toggle('is-money', precioVenta > 0);
  }

  if (!textoDescuento) return;

  if (precioAnterior > precioVenta && precioVenta > 0) {
    const porcentaje = Math.round(((precioAnterior - precioVenta) / precioAnterior) * 100);
    textoDescuento.textContent = `¡Tiene un ${porcentaje}% de descuento!`;
    textoDescuento.classList.add('is-success');
    textoDescuento.classList.remove('is-money');
  } else if (precioAnterior > 0) {
    textoDescuento.textContent = montoEnTexto(precioAnterior);
    textoDescuento.classList.add('is-money');
    textoDescuento.classList.remove('is-success');
  } else {
    textoDescuento.textContent = TEXTO_DESCUENTO_DEFECTO;
    textoDescuento.classList.remove('is-success', 'is-money');
  }
}

// Valida, reduce y muestra la imagen elegida (desde el explorador o arrastrada)
async function cargarImagen(archivo) {
  if (!archivo.type.startsWith('image/')) {
    alert('El archivo debe ser una imagen PNG o JPG.');
    return;
  }
  if (archivo.size > TAMANO_MAX_IMAGEN) {
    alert('La imagen supera los 2 MB. Elige una más liviana.');
    return;
  }

  try {
    imagenData = await comprimirImagen(archivo);
    vistaPreviaImagen.src = imagenData;
    vistaPreviaImagen.hidden = false;
    contenedorCargaVacia.hidden = true;

    // El navegador no revela la carpeta real del archivo, así que se propone la ruta
    // donde debe guardarse en el proyecto: carpeta de imágenes + nombre del archivo.
    rutaAutogenerada = CARPETA_IMAGENES + archivo.name.trim().replace(/\s+/g, '-');
    inputRutaImagen.value = rutaAutogenerada;
  } catch (e) {
    alert('No se pudo leer la imagen. Prueba con otro archivo PNG o JPG.');
  }
}

// -----------------------------------------------------------------
// 7. MODAL DE CONFIRMACIÓN (reemplaza al confirm() del navegador)
// -----------------------------------------------------------------

// Tarjetita con el producto (o el resumen de la selección) que se va a eliminar
const tarjetaDialogoHTML = ({ miniatura, titulo, detalle }) => `
  ${miniatura}
  <div class="tca-dialog__item-info">
    <strong>${esc(titulo)}</strong>
    ${detalle ? `<small>${esc(detalle)}</small>` : ''}
  </div>`;

// Abre el modal y devuelve una promesa: true si confirma, false si cancela
function confirmar({ titulo, mensaje, item = null, textoOk = 'Sí, eliminar' }) {
  return new Promise((resolve) => {
    elementoPrevioDialogo = document.activeElement;

    dialogoTitulo.textContent = titulo;
    dialogoMensaje.textContent = mensaje;
    dialogoOkTexto.textContent = textoOk;

    if (item) {
      dialogoItem.innerHTML = tarjetaDialogoHTML(item);
      dialogoItem.hidden = false;
    } else {
      dialogoItem.innerHTML = '';
      dialogoItem.hidden = true;
    }

    resolverDialogo = resolve;
    dialogo.setAttribute('aria-hidden', 'false');
    dialogo.classList.add('is-open');
    btnDialogoCancelar.focus(); // el foco inicia en la opción segura
  });
}

function cerrarDialogo(resultado) {
  if (!resolverDialogo) return;

  const resolver = resolverDialogo;
  resolverDialogo = null;

  dialogo.classList.remove('is-open');
  dialogo.setAttribute('aria-hidden', 'true');

  if (elementoPrevioDialogo && typeof elementoPrevioDialogo.focus === 'function') elementoPrevioDialogo.focus();
  elementoPrevioDialogo = null;

  resolver(resultado);
}

// -----------------------------------------------------------------
// 8. ACCIONES SOBRE PRODUCTOS (eliminar, duplicar, menú ⋯)
// -----------------------------------------------------------------

async function eliminarProducto(id) {
  const producto = productos.find((p) => p.id === id);
  if (!producto) return;

  const confirmado = await confirmar({
    titulo: '¿Eliminar producto?',
    mensaje: 'Se quitará del catálogo y dejará de mostrarse en la tienda.',
    item: {
      miniatura: miniaturaHTML(producto),
      titulo: producto.name,
      detalle: [producto.brand, producto.sku].filter(Boolean).join(' · ')
    }
  });
  if (!confirmado) return;

  productos = productos.filter((p) => p.id !== id);
  seleccion.delete(id);
  persistir();
  refrescarVista();
}

// La copia queda como borrador (no publicada) y se abre para editarla
function duplicarProducto(id) {
  const indice = productos.findIndex((p) => p.id === id);
  if (indice === -1) return;

  const original = productos[indice];
  const copia = {
    ...original,
    id: Date.now(),
    name: `${original.name} (copia)`,
    sku: '',
    rating: 0,
    reviews: 0,
    colors: [...original.colors],
    active: false
  };

  productos.splice(indice + 1, 0, copia);
  persistir();
  refrescarVista();
  abrirDrawer(true, copia);
}

async function eliminarSeleccion() {
  const n = seleccion.size;
  if (n === 0) return;

  const elegidos = productos.filter((p) => seleccion.has(p.id));
  const nombres = elegidos.slice(0, 3).map((p) => p.name).join(', ');
  const faltan = elegidos.length - 3;

  const confirmado = await confirmar({
    titulo: n === 1 ? '¿Eliminar el producto seleccionado?' : `¿Eliminar ${n} productos?`,
    mensaje: n === 1
      ? 'Se quitará del catálogo y dejará de mostrarse en la tienda.'
      : 'Se quitarán del catálogo y dejarán de mostrarse en la tienda.',
    item: {
      miniatura: '<span class="tca-thumb tca-thumb--empty"><i class="bi bi-boxes"></i></span>',
      titulo: `${n} ${n === 1 ? 'producto seleccionado' : 'productos seleccionados'}`,
      detalle: faltan > 0 ? `${nombres} y ${faltan} más` : nombres
    },
    textoOk: n === 1 ? 'Sí, eliminar' : `Sí, eliminar ${n}`
  });
  if (!confirmado) return;

  productos = productos.filter((p) => !seleccion.has(p.id));
  seleccion.clear();
  persistir();
  refrescarVista();
}

// Coloca el menú ⋯ junto al botón. Es position: fixed (no lo recorta el scroll de la tabla)
function abrirMenuFila(boton) {
  cerrarMenuFila();

  menuProductoId = parseInt(boton.dataset.id, 10);
  menuBotonActivo = boton;
  boton.setAttribute('aria-expanded', 'true');
  menuFila.hidden = false;

  const rect = boton.getBoundingClientRect();
  const alto = menuFila.offsetHeight;
  const ancho = menuFila.offsetWidth;

  // Debajo del botón; si no cabe, arriba
  let top = rect.bottom + 6;
  if (top + alto > window.innerHeight - 8) top = Math.max(8, rect.top - alto - 6);

  // Alineado a la derecha del botón, sin salirse de la pantalla
  const left = Math.max(8, Math.min(rect.right - ancho, window.innerWidth - ancho - 8));

  menuFila.style.top = `${top}px`;
  menuFila.style.left = `${left}px`;
}

function cerrarMenuFila() {
  if (menuFila.hidden) return;
  menuFila.hidden = true;
  menuBotonActivo?.setAttribute('aria-expanded', 'false');
  menuBotonActivo = null;
  menuProductoId = null;
}

// -----------------------------------------------------------------
// 9. EVENTOS
// -----------------------------------------------------------------

// Búsqueda por texto
inputSearch.addEventListener('input', (evento) => {
  textoBusqueda = evento.target.value;
  paginaActual = 1;
  renderizarTabla();
});

// Filtros de la barra (publicación, inventario y marca)
selectPublicacion.addEventListener('change', (evento) => {
  filtroPublicacion = evento.target.value;
  paginaActual = 1;
  renderizarTabla();
});

selectInventario.addEventListener('change', (evento) => {
  filtroInventario = evento.target.value;
  paginaActual = 1;
  renderizarTabla();
});

selectMarcaFiltro.addEventListener('change', (evento) => {
  marcaFiltro = evento.target.value;
  paginaActual = 1;
  renderizarTabla();
});

// Limpiar filtros (el orden de las columnas se mantiene)
btnLimpiar.addEventListener('click', () => {
  textoBusqueda = '';
  filtroPublicacion = '';
  filtroInventario = '';
  marcaFiltro = '';
  inputSearch.value = '';
  selectPublicacion.value = '';
  selectInventario.value = '';
  selectMarcaFiltro.value = '';
  paginaActual = 1;
  renderizarTabla();
});

// Orden por columna: ascendente -> descendente -> sin orden
botonesOrden.forEach((boton) => {
  boton.addEventListener('click', () => {
    const campo = boton.dataset.sort;

    if (ordenCampo !== campo) {
      ordenCampo = campo;
      ordenDireccion = 'asc';
    } else if (ordenDireccion === 'asc') {
      ordenDireccion = 'desc';
    } else {
      ordenCampo = '';
      ordenDireccion = 'asc';
    }

    paginaActual = 1;
    renderizarTabla();
  });
});

// Cambio de página
if (listaPaginador) {
  listaPaginador.addEventListener('click', (evento) => {
    const botonPagina = evento.target.closest('[data-pagina]');
    if (botonPagina) {
      paginaActual = parseInt(botonPagina.dataset.pagina, 10);
      renderizarTabla();
    }
  });
}

// Casilla general: marca o desmarca las filas de la página actual
chkTodos.addEventListener('change', () => {
  idsPagina.forEach((id) => (chkTodos.checked ? seleccion.add(id) : seleccion.delete(id)));
  renderizarTabla();
});

btnQuitarSeleccion.addEventListener('click', () => {
  seleccion.clear();
  renderizarTabla();
});

btnEliminarSeleccion.addEventListener('click', eliminarSeleccion);

// Abrir y cerrar el panel
btnAbrirAgregar.addEventListener('click', () => abrirDrawer(false));
botonesCerrar.forEach((btn) => btn.addEventListener('click', cerrarDrawer));
if (scrim) scrim.addEventListener('click', cerrarDrawer);

// Modal de confirmación: botones, clic en el fondo, Escape y Tab (el foco no se escapa del modal)
btnDialogoCancelar.addEventListener('click', () => cerrarDialogo(false));
btnDialogoOk.addEventListener('click', () => cerrarDialogo(true));
dialogo.addEventListener('click', (evento) => {
  if (evento.target === dialogo) cerrarDialogo(false);
});
document.addEventListener('keydown', (evento) => {
  if (!resolverDialogo) return;

  if (evento.key === 'Escape') {
    evento.preventDefault();
    cerrarDialogo(false);
  } else if (evento.key === 'Tab') {
    const botones = [btnDialogoCancelar, btnDialogoOk];
    const indice = botones.indexOf(document.activeElement);
    evento.preventDefault();
    const siguiente = evento.shiftKey ? indice - 1 : indice + 1;
    botones[(siguiente + botones.length) % botones.length].focus();
  }
});

// Escape: primero cierra el menú ⋯; si no hay menú abierto, cierra el panel
// (si el modal está abierto, Escape lo maneja el modal)
document.addEventListener('keydown', (evento) => {
  if (evento.key !== 'Escape' || resolverDialogo) return;

  if (!menuFila.hidden) {
    const boton = menuBotonActivo;
    cerrarMenuFila();
    boton?.focus();
  } else if (drawer.classList.contains('is-open')) {
    cerrarDrawer();
  }
});

// El menú ⋯ se cierra al hacer clic fuera, al desplazarse o al cambiar el tamaño
document.addEventListener('click', (evento) => {
  if (!evento.target.closest('#rowMenu') && !evento.target.closest('.btn-mas')) cerrarMenuFila();
});
window.addEventListener('scroll', cerrarMenuFila, true);
window.addEventListener('resize', cerrarMenuFila);

// Acciones del menú ⋯
menuFila.addEventListener('click', (evento) => {
  const opcion = evento.target.closest('[data-action]');
  if (!opcion) return;

  const id = menuProductoId;
  cerrarMenuFila();

  if (opcion.dataset.action === 'duplicate') duplicarProducto(id);
  if (opcion.dataset.action === 'delete') eliminarProducto(id);
});

// Interruptor Activo/Inactivo del formulario
inputActivo.addEventListener('change', actualizarTextoEstado);

// Precios: formato de dinero mientras se escribe + descuento automático
[inputPrecio, inputPrecioAnterior].forEach((input) => {
  input.addEventListener('input', () => {
    formatearInputMonto(input);
    if (input === inputPrecio) inputPrecio.setCustomValidity('');
    actualizarMontos();
  });
});

// Imagen: desde el explorador de archivos
inputArchivoImagen.addEventListener('change', (evento) => {
  const archivo = evento.target.files[0];
  if (archivo) cargarImagen(archivo);
});

// Imagen: arrastrar y soltar sobre la zona de carga
['dragenter', 'dragover'].forEach((tipo) =>
  zonaCarga.addEventListener(tipo, (evento) => evento.preventDefault())
);
zonaCarga.addEventListener('drop', (evento) => {
  evento.preventDefault();
  const archivo = evento.dataTransfer.files[0];
  if (archivo) cargarImagen(archivo);
});

// Guardar producto
formulario.addEventListener('submit', (evento) => {
  evento.preventDefault();

  // El precio de venta debe ser mayor a 0 (el campo es de texto, no tiene min)
  inputPrecio.setCustomValidity(leerMonto(inputPrecio) > 0 ? '' : 'Escribe un precio de venta mayor a 0.');

  // Validaciones básicas del navegador (campos required, min, max)
  if (!formulario.checkValidity()) {
    formulario.reportValidity();
    return;
  }

  // Si se subió una imagen y la ruta quedó tal como se propuso, se guarda la imagen embebida
  // (así se ve de inmediato). Si la persona escribió o cambió la ruta, se respeta esa ruta.
  const rutaEscrita = inputRutaImagen.value.trim();
  const usarRuta = rutaEscrita && !(imagenData && rutaEscrita === rutaAutogenerada);

  // Capturar los datos del formulario
  const nuevoProducto = {
    id: idProductoEditando ? idProductoEditando : Date.now(),
    name: inputNombre.value.trim(),
    sku: inputSku.value.trim(),
    brand: selectMarca.value,
    storage: selectAlmacenador.value,
    badge: selectEtiqueta.value,
    price: leerMonto(inputPrecio),
    oldPrice: leerMonto(inputPrecioAnterior) || null,
    stock: parseInt(inputStock.value, 10) || 0,
    rating: parseFloat(inputRating.value) || 0,
    reviews: parseInt(inputReviews.value, 10) || 0,
    colors: leerColores(),
    active: inputActivo.checked,
    image: usarRuta ? rutaEscrita : imagenData
  };

  if (idProductoEditando) {
    // Reemplazar los datos del producto existente
    productos = productos.map((p) => (p.id === idProductoEditando ? nuevoProducto : p));
  } else {
    // Agregar el nuevo producto al principio de la lista
    productos.unshift(nuevoProducto);
  }

  // Guardar, cerrar y refrescar la vista
  persistir();
  cerrarDrawer();
  refrescarVista();
});

// Tabla: editar y abrir el menú ⋯ (eventos delegados)
tablaCuerpo.addEventListener('click', (evento) => {
  const botonEditar = evento.target.closest('.btn-editar');
  const botonMas = evento.target.closest('.btn-mas');

  if (botonEditar) {
    cerrarMenuFila();
    const id = parseInt(botonEditar.dataset.id, 10);
    const productoEncontrado = productos.find((p) => p.id === id);
    if (productoEncontrado) abrirDrawer(true, productoEncontrado);
  }

  if (botonMas) {
    // Un segundo clic sobre el mismo botón cierra el menú
    if (!menuFila.hidden && menuBotonActivo === botonMas) cerrarMenuFila();
    else abrirMenuFila(botonMas);
  }
});

// Tabla: casillas de selección e interruptor de publicación (eventos delegados)
tablaCuerpo.addEventListener('change', (evento) => {
  const objetivo = evento.target;

  if (objetivo.matches('.js-fila')) {
    const id = parseInt(objetivo.dataset.id, 10);
    if (objetivo.checked) seleccion.add(id);
    else seleccion.delete(id);

    objetivo.closest('tr')?.classList.toggle('is-selected', objetivo.checked);
    actualizarSeleccionUI();
  }

  if (objetivo.matches('.js-publicar')) {
    const id = parseInt(objetivo.dataset.id, 10);
    const producto = productos.find((p) => p.id === id);
    if (!producto) return;

    producto.active = objetivo.checked;
    persistir();
    refrescarVista();

    // El re-pintado reemplaza el interruptor: se devuelve el foco para quien usa teclado
    tablaCuerpo.querySelector(`.js-publicar[data-id="${id}"]`)?.focus();
  }
});

// Si una miniatura no carga, se reemplaza por el icono por defecto
const reemplazarMiniaturaRota = (evento) => {
  const img = evento.target;
  if (!img.matches || !img.matches('.tca-thumb')) return;

  const caja = document.createElement('span');
  caja.className = 'tca-thumb tca-thumb--empty';
  caja.innerHTML = '<i class="bi bi-box-seam"></i>';
  img.replaceWith(caja);
};
tablaCuerpo.addEventListener('error', reemplazarMiniaturaRota, true);
dialogoItem.addEventListener('error', reemplazarMiniaturaRota, true);

// -----------------------------------------------------------------
// 10. INICIALIZACIÓN
// -----------------------------------------------------------------

// Vuelve a pintar todo lo que depende de la lista de productos
function refrescarVista() {
  actualizarKPIs();
  poblarFiltroMarcas();
  actualizarOpcionesFormulario();
  renderizarTabla();
}

dibujarColores();
refrescarVista();