// Catálogo de celulares: pinta las tarjetas y aplica los filtros.
// Productos y opciones de filtro vienen de productos.js (la misma fuente del admin).
// Expone los productos y createProductCard para el carrusel del index (Carrusel-categorias.js).

// Módulo compartido con el admin (ruta relativa a src/html/, igual que las demás)
const PRODUCTS_MODULE_URL = new URL('../js/Administrador/productos.js', window.location.href).href;

// Clave donde el admin guarda los productos; sirve para detectar cambios hechos en otra pestaña
const PRODUCTS_STORAGE_KEY = 'tcno_productos';

// Imagen local que se muestra si la foto de un celular no carga.
const FALLBACK_IMAGE = new URL('../assets/images/movil.png', window.location.href).href;

// Clases de color de las tarjetas según la marca (las demás usan los puntos por defecto).
const BRAND_COLOR_CLASSES = {
  Apple: 'is-apple',
  Xiaomi: 'is-xiaomi',
  Motorola: 'is-moto',
  Samsung: 'is-samsung'
};

// Precio máximo mínimo del control deslizante (se amplía si hay productos más caros)
const PRICE_SLIDER_MIN_MAX = 5000000;
const PRICE_SLIDER_STEP = 50000;

// Plantilla de respaldo: se usa solo si product-card.html llega sin el botón de carrito
// (por ejemplo, una copia vieja o dañada). Debe mantenerse igual a src/components/product-card.html.
const FALLBACK_CARD_HTML = `
  <article class="tcno-product-card" data-product>
    <div class="tcno-product-image-wrap">
      <span class="tcno-product-badge" data-product-badge hidden></span>
      <button class="tcno-product-favorite" type="button" aria-pressed="false" data-favorite>
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8l1.1 1.1L12 21l7.8-7.5 1.1-1.1a5.5 5.5 0 0 0-.1-7.8Z" /></svg>
      </button>
      <img data-product-image loading="lazy" referrerpolicy="no-referrer" />
    </div>
    <div class="tcno-product-info">
      <h2 data-product-name></h2>
      <p class="tcno-product-rating"><span aria-hidden="true">★★★★★</span><small data-product-rating></small></p>
      <p class="tcno-product-price" data-product-price></p>
      <p class="tcno-product-old-price" data-product-old-price></p>
      <div class="tcno-product-meta">
        <span class="tcno-color-dots" data-product-colors><i></i><i></i><i></i></span>
        <span class="tcno-storage-tag" data-product-storage></span>
      </div>
      <p class="tcno-warranty"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 22s8-4 8-11V5l-8-3-8 3v6c0 7 8 11 8 11Z" /><path d="m9 12 2 2 4-4" /></svg>Garantía incluida</p>
      <button class="tcno-add-cart" type="button" data-add-cart><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" /><path d="M1 1h4l2.7 13.4a2 2 0 0 0 2 1.6h9.7a2 2 0 0 0 2-1.6L23 6H6" /></svg>Agregar al carrito</button>
    </div>
  </article>`;

let catalogProducts = [];
let colorHex = {}; // nombre de color -> código (viene de productos.js)
let catalogOptions = { marcas: [], almacenamientos: [], etiquetas: [], colores: {} };

// Convierte un objeto del JSON al formato que usa createProductCard.
function mapProduct(item) {
  const startsWithBrand = item.modelo.toLowerCase().startsWith(item.marca.toLowerCase());

  return {
    id: item.id,
    name: startsWithBrand ? item.modelo : `${item.marca} ${item.modelo}`,
    brand: item.marca,
    price: item.precio,
    oldPrice: item.precioAnterior,
    discount: item.descuento ? `${item.descuento}%` : '',
    storage: item.almacenamiento,
    rating: item.rating ?? 0,
    reviews: item.reviews ?? 0,
    // El JSON no trae ventas; se usa la cantidad de reseñas como referencia de popularidad.
    sold: item.reviews ?? 0,
    badge: item.etiqueta || '',
    colors: BRAND_COLOR_CLASSES[item.marca] || '',
    // Colores elegidos en el admin; si no hay, se usan los puntos de la marca
    colorList: (item.colores || [])
      .filter((nombre) => colorHex[nombre])
      .map((nombre) => ({ nombre, hex: colorHex[nombre] })),
    image: item.imagen
      ? (item.imagen.startsWith('data:') ? item.imagen : new URL(item.imagen, window.location.href).href)
      : ''
  };
}

async function loadCatalogProducts() {
  // import() dinámico: este archivo no es un módulo, pero productos.js sí
  const { cargarProductos, OPCIONES } = await import(PRODUCTS_MODULE_URL);
  catalogOptions = OPCIONES;
  colorHex = OPCIONES.colores ?? {};
  const lista = await cargarProductos();

  // En la tienda solo se muestran los productos activos
  catalogProducts = lista.filter((item) => item.activo !== false).map(mapProduct);
  window.catalogProducts = catalogProducts;
  return catalogProducts;
}

// Promesa compartida: Carrusel-categorias.js espera a que los datos estén listos.
window.catalogProductsReady = loadCatalogProducts();
window.createProductCard = createProductCard;

// Si el admin guarda cambios en otra pestaña, el catálogo se actualiza solo
window.addEventListener('storage', (event) => {
  if (event.key === PRODUCTS_STORAGE_KEY) window.location.reload();
});

document.addEventListener('DOMContentLoaded', () => {
  initializeCatalog().catch((error) => {
    console.error('Error al cargar las tarjetas del catálogo:', error);
    const emptyState = document.querySelector('[data-empty-state]');
    if (emptyState) {
      emptyState.textContent = 'No se pudo cargar el catálogo. Intenta actualizar la página.';
      emptyState.hidden = false;
    }
  });
});

async function initializeCatalog() {
  const form = document.querySelector('[data-filter-form]');
  const grid = document.querySelector('[data-product-grid]');
  const count = document.querySelector('[data-product-count]');
  const emptyState = document.querySelector('[data-empty-state]');
  const priceRange = document.querySelector('[data-price-filter]');
  const priceValue = document.querySelector('[data-price-value]');
  const sortSelect = document.querySelector('[data-sort]');
  let brandChips = []; // se llena al generar las opciones de marca
  const clearButton = document.querySelector('[data-clear-filters]');
  const cartFeedback = document.querySelector('[data-cart-feedback]');

  if (!form || !grid || !count || !emptyState || !priceRange || !priceValue || !sortSelect) {
    return;
  }

  const componentUrl = new URL('../components/product-card.html', window.location.href);
  // no-cache: revisa siempre si la plantilla cambió, para no usar una copia vieja guardada por el navegador
  const response = await fetch(componentUrl, { cache: 'no-cache' });
  if (!response.ok) {
    throw new Error(`No se pudo cargar ${componentUrl}: ${response.status} ${response.statusText}`);
  }

  const componentDocument = new DOMParser().parseFromString(await response.text(), 'text/html');
  let productTemplate = componentDocument.querySelector('#tcno-product-card-template');
  if (!productTemplate?.content.firstElementChild) {
    throw new Error('La plantilla de tarjeta de producto no tiene una estructura válida.');
  }

  // Si la plantilla llega sin el botón de carrito, se usa la de respaldo y se avisa en consola
  if (!productTemplate.content.querySelector('[data-add-cart]')) {
    console.warn(`La plantilla ${componentUrl} llegó sin el botón [data-add-cart]; se usa la plantilla de respaldo. Revisa ese archivo.`);
    productTemplate = document.createElement('template');
    productTemplate.innerHTML = FALLBACK_CARD_HTML;
  }

  await window.catalogProductsReady;

  const cards = catalogProducts.map((product) => createProductCard(product, productTemplate));
  grid.replaceChildren(...cards);

  // Marcas y almacenamientos del filtro: salen de OPCIONES (productos.js) más lo que
  // traigan los productos, así el catálogo y el admin muestran siempre las mismas opciones.
  const brands = uniqueValues([...catalogOptions.marcas, ...catalogProducts.map((p) => p.brand)]);
  const storages = uniqueValues([...catalogOptions.almacenamientos, ...catalogProducts.map((p) => p.storage)])
    .filter((value) => Number(value) > 0)
    .sort((first, second) => Number(first) - Number(second));

  buildCheckOptions(form.querySelector('[data-filter-options="brand"]'), 'brand', brands);
  buildCheckOptions(form.querySelector('[data-filter-options="storage"]'), 'storage', storages, formatStorage);
  buildBrandChips(document.querySelector('[data-brand-chips]'), brands);
  brandChips = Array.from(document.querySelectorAll('[data-brand-chip]'));

  // Los contadores de marca y almacenamiento se calculan con los datos cargados.
  ['brand', 'storage'].forEach((name) => {
    form.querySelectorAll(`input[name="${name}"]`).forEach((input) => {
      const total = cards.filter((card) => card.dataset[name] === input.value).length;
      const counter = input.closest('label')?.querySelector('small');
      if (counter) counter.textContent = `(${total})`;
    });
  });

  const formatPrice = (price) => `$ ${Number(price).toLocaleString('es-CO')}`;
  let selectedChipBrand = 'Todos';

  // Ajustar el control de precio al producto más caro (si no, un producto de más de
  // $5.000.000 agregado desde el admin quedaría oculto por el filtro de precio).
  const highestPrice = Math.max(0, ...catalogProducts.map((product) => product.price));
  const sliderMax = Math.max(
    PRICE_SLIDER_MIN_MAX,
    Math.ceil(highestPrice / PRICE_SLIDER_STEP) * PRICE_SLIDER_STEP
  );
  priceRange.max = String(sliderMax);
  priceRange.value = String(sliderMax);
  priceValue.textContent = formatPrice(sliderMax);
  const priceLimitLabel = document.querySelector('.tcno-price-limits span:last-child');
  if (priceLimitLabel) priceLimitLabel.textContent = formatCurrency(sliderMax);

  // Obtener la marca enviada desde la URL
  const params = new URLSearchParams(window.location.search);
  const selectedBrand = params.get('marca');

  // Buscar el checkbox correspondiente a la marca
  if (selectedBrand) {
    const brandCheckbox = Array.from(
      form.querySelectorAll('input[name="brand"]')
    ).find(input => input.value.toLowerCase() === selectedBrand.toLowerCase());

    if (brandCheckbox) {
      brandCheckbox.checked = true;
      selectedChipBrand = brandCheckbox.value;

      // Activar el botón de marca correspondiente
      brandChips.forEach((chip) => {
        const isActive = chip.dataset.brandChip === brandCheckbox.value;

        chip.classList.toggle('is-active', isActive);
        chip.setAttribute('aria-pressed', String(isActive));
      });
    }
  }

  function getSelectedValues(name) {
    return Array.from(form.querySelectorAll(`input[name="${name}"]:checked`), (input) => input.value);
  }

  function applyFilters() {
    const brands = getSelectedValues('brand');
    const storage = getSelectedValues('storage');
    const minimumRating = Number(form.querySelector('input[name="rating"]:checked')?.value || 0);
    const maximumPrice = Number(priceRange.value);
    const query = document.querySelector('.tcno-search-input')?.value.trim().toLocaleLowerCase('es') || '';
    const visibleCards = cards.filter((card) => {
      const brandMatches = selectedChipBrand === 'Todos' || card.dataset.brand === selectedChipBrand;
      const brandCheckboxMatches = brands.length === 0 || brands.includes(card.dataset.brand);
      const storageMatches = storage.length === 0 || storage.includes(card.dataset.storage);
      const priceMatches = Number(card.dataset.price) <= maximumPrice;
      const ratingMatches = Number(card.dataset.rating) >= minimumRating;
      const queryMatches = !query || card.querySelector('[data-product-name]').textContent.toLocaleLowerCase('es').includes(query);
      const visible = brandMatches && brandCheckboxMatches && storageMatches && priceMatches && ratingMatches && queryMatches;

      card.hidden = !visible;
      return visible;
    });

    const sortedCards = [...visibleCards].sort((first, second) => {
      if (sortSelect.value === 'price-asc') return Number(first.dataset.price) - Number(second.dataset.price);
      if (sortSelect.value === 'price-desc') return Number(second.dataset.price) - Number(first.dataset.price);
      if (sortSelect.value === 'rating') return Number(second.dataset.rating) - Number(first.dataset.rating);
      return Number(second.dataset.sold) - Number(first.dataset.sold);
    });

    sortedCards.forEach((card) => grid.append(card));
    count.textContent = `${visibleCards.length} ${visibleCards.length === 1 ? 'producto' : 'productos'}`;
    emptyState.hidden = visibleCards.length > 0;
  }

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    applyFilters();
  });

  form.addEventListener('change', (event) => {
    if (event.target.name === 'brand') {
      selectedChipBrand = 'Todos';
      brandChips.forEach((chip) => {
        const isActive = chip.dataset.brandChip === 'Todos';
        chip.classList.toggle('is-active', isActive);
        chip.setAttribute('aria-pressed', String(isActive));
      });
    }

    applyFilters();
  });

  priceRange.addEventListener('input', () => {
    priceValue.textContent = formatPrice(priceRange.value);
    applyFilters();
  });

  sortSelect.addEventListener('change', applyFilters);

  brandChips.forEach((chip) => {
    chip.addEventListener('click', () => {
      selectedChipBrand = chip.dataset.brandChip;
      form.querySelectorAll('input[name="brand"]').forEach((input) => {
        input.checked = false;
      });
      brandChips.forEach((item) => {
        const isActive = item === chip;
        item.classList.toggle('is-active', isActive);
        item.setAttribute('aria-pressed', String(isActive));
      });
      applyFilters();
    });
  });

  clearButton?.addEventListener('click', () => {
    form.reset();
    selectedChipBrand = 'Todos';
    // form.reset() devuelve el control al valor del HTML; se vuelve al máximo real
    priceRange.value = priceRange.max;
    priceValue.textContent = formatPrice(priceRange.max);
    sortSelect.value = 'popular';
    const searchInput = document.querySelector('.tcno-search-input');
    if (searchInput) searchInput.value = '';
    brandChips.forEach((chip, index) => {
      const isActive = index === 0;
      chip.classList.toggle('is-active', isActive);
      chip.setAttribute('aria-pressed', String(isActive));
    });
    applyFilters();
  });

  document.addEventListener('input', (event) => {
    if (event.target.matches('.tcno-search-input')) applyFilters();
  });

  document.addEventListener('click', (event) => {
    const favoriteButton = event.target.closest('[data-favorite]');
    if (favoriteButton && grid.contains(favoriteButton)) {
      const isFavorite = favoriteButton.getAttribute('aria-pressed') === 'true';
      favoriteButton.setAttribute('aria-pressed', String(!isFavorite));
      favoriteButton.setAttribute(
        'aria-label',
        `${isFavorite ? 'Agregar' : 'Quitar'} ${favoriteButton.closest('[data-product]').querySelector('[data-product-name]').textContent} ${isFavorite ? 'a' : 'de'} favoritos`
      );
      return;
    }

    const cartButton = event.target.closest('[data-add-cart]');
    if (!cartButton || !grid.contains(cartButton)) {
      return;
    }

    const productName = cartButton.closest('[data-product]').querySelector('[data-product-name]').textContent;
    const originalContent = cartButton.innerHTML;
    cartButton.classList.add('is-added');
    cartButton.textContent = 'Agregado al carrito';
    if (cartFeedback) {
      cartFeedback.textContent = `${productName} se agregó al carrito.`;
    }
    window.setTimeout(() => {
      cartButton.classList.remove('is-added');
      cartButton.innerHTML = originalContent;
    }, 1600);
  });

  applyFilters();
}

function createProductCard(product, template) {
  const card = template.content.firstElementChild.cloneNode(true);
  const badge = card.querySelector('[data-product-badge]');
  const image = card.querySelector('[data-product-image]');
  const oldPrice = card.querySelector('[data-product-old-price]');
  const favoriteButton = card.querySelector('[data-favorite]');

  if (product.id !== undefined) card.dataset.id = String(product.id);
  card.dataset.brand = product.brand;
  card.dataset.price = String(product.price);
  card.dataset.storage = String(product.storage);
  card.dataset.rating = String(product.rating);
  card.dataset.sold = String(product.sold);
  card.querySelector('[data-product-name]').textContent = product.name;
  card.querySelector('[data-product-rating]').textContent = `${product.rating.toFixed(1)} (${product.reviews})`;
  card.querySelector('[data-product-price]').textContent = `${formatCurrency(product.price)} COP`;
  card.querySelector('[data-product-storage]').textContent = `${product.storage} GB`;
  const colorsBox = card.querySelector('[data-product-colors]');
  if (product.colorList?.length) {
    // Colores propios del producto: reemplazan los puntos por defecto de la marca
    colorsBox.replaceChildren(...product.colorList.map(({ nombre, hex }) => {
      const dot = document.createElement('span');
      dot.className = 'tcno-color-dot';
      dot.style.setProperty('--dot', hex);
      dot.title = nombre;
      return dot;
    }));
    colorsBox.setAttribute('aria-label', `Colores: ${product.colorList.map((c) => c.nombre).join(', ')}`);
  } else {
    colorsBox.classList.add(...product.colors.split(' ').filter(Boolean));
  }
  badge.textContent = product.badge;
  badge.hidden = !product.badge;
  badge.classList.toggle('is-new', product.badge === 'Nuevo');
  image.src = product.image || FALLBACK_IMAGE;
  image.alt = `Imagen de ${product.name}`;
  image.addEventListener('error', () => {
    // Si la foto no carga (archivo inexistente o ruta incorrecta) se muestra la imagen de respaldo.
    console.warn(`No cargó la imagen de ${product.name}: ${product.image}`);
    if (image.src !== FALLBACK_IMAGE) image.src = FALLBACK_IMAGE;
  }, { once: true });
  favoriteButton.setAttribute('aria-label', `Agregar ${product.name} a favoritos`);

  if (product.oldPrice) {
    oldPrice.textContent = `${formatCurrency(product.oldPrice)} `;
    const discount = document.createElement('span');
    discount.textContent = `-${product.discount}`;
    oldPrice.append(discount);
  } else {
    oldPrice.hidden = true;
  }

  return card;
}

// Valores sin repetir y sin vacíos, como texto
function uniqueValues(values) {
  return [...new Set(values.filter((value) => value !== '' && value != null).map(String))];
}

const formatStorage = (value) => (Number(value) >= 1024 ? `${Number(value) / 1024} TB` : `${value} GB`);

// Reemplaza las casillas de un grupo de filtros (marca o almacenamiento)
function buildCheckOptions(fieldset, name, values, labelOf = (value) => value) {
  if (!fieldset) return;
  fieldset.querySelectorAll('.tcno-check-option').forEach((option) => option.remove());

  values.forEach((value) => {
    const label = document.createElement('label');
    label.className = 'tcno-check-option';

    const input = document.createElement('input');
    input.type = 'checkbox';
    input.name = name;
    input.value = value;

    const text = document.createElement('span');
    text.textContent = labelOf(value);

    const counter = document.createElement('small');
    counter.textContent = '(0)'; // se recalcula con los productos cargados

    label.append(input, text, counter);
    fieldset.append(label);
  });
}

// Deja el botón "Todos" y crea un botón por cada marca
function buildBrandChips(container, brands) {
  if (!container) return;
  container.querySelectorAll('[data-brand-chip]:not([data-brand-chip="Todos"])').forEach((chip) => chip.remove());

  brands.forEach((brand) => {
    const chip = document.createElement('button');
    chip.type = 'button';
    chip.className = 'tcno-brand-chip';
    chip.dataset.brandChip = brand;
    chip.setAttribute('aria-pressed', 'false');
    chip.textContent = brand;
    container.append(chip);
  });
}

function formatCurrency(price) {
  return `$${Number(price).toLocaleString('es-CO')}`;
}
