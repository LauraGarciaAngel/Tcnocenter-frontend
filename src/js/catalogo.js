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
const PRICE_SLIDER_MIN_MAX = 7000000;
const PRICE_SLIDER_STEP = 1000;

// Plantilla de respaldo: se usa solo si product-card.html llega sin el botón de carrito
// (por ejemplo, una copia vieja o dañada). Debe mantenerse igual a src/components/product-card.html.
const FALLBACK_CARD_HTML = `
    <article class="tcno-product-card" data-product>
      <div class="tcno-product-image-wrap">
        <span class="tcno-product-badge" data-product-badge hidden></span>
        <button class="tcno-product-favorite" type="button" aria-label="Favorito"
                aria-pressed="false" data-favorite>
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8l1.1 1.1L12 21l7.8-7.5 1.1-1.1a5.5 5.5 0 0 0-.1-7.8Z"/>
          </svg>
        </button>
        <img data-product-image alt="" loading="lazy" referrerpolicy="no-referrer">
      </div>

      <div class="tcno-product-info">
        <h2 data-product-name></h2>
        <p class="tcno-product-rating">
          <span aria-hidden="true">★★★★★</span>
          <small data-product-rating></small>
        </p>
        <p class="tcno-product-price" data-product-price></p>
        <p class="tcno-product-old-price" data-product-old-price hidden></p>

        <button class="tcno-add-cart" type="button" data-add-cart>
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <circle cx="9" cy="21" r="1"/>
            <circle cx="20" cy="21" r="1"/>
            <path d="M1 1h4l2.7 13.4a2 2 0 0 0 2 1.6h9.7a2 2 0 0 0 2-1.6L23 6H6"/>
          </svg>
          Añadir al carrito
        </button>
      </div>
    </article>`;

let catalogProducts = [];
let colorHex = {}; // nombre de color -> código (viene de productos.js)
let catalogOptions = { marcas: [], almacenamientos: [], etiquetas: [], colores: {} };

function resolveImageUrl(rawPath) {
  if (!rawPath) return '';
  return rawPath.startsWith('data:') ? rawPath : new URL(rawPath, window.location.href).href;
}

// Convierte un objeto del JSON al formato que usa createProductCard.
function mapProduct(item) {
  const startsWithBrand = item.modelo.toLowerCase().startsWith(item.marca.toLowerCase());
  const imagenesPorColor = item.imagenesPorColor || {};

  return {
    id: item.id,
    name: startsWithBrand ? item.modelo : `${item.marca} ${item.modelo}`,
    brand: item.marca,
    price: item.precio,
    oldPrice: item.precioAnterior,
    discount: item.descuento ? `${item.descuento}%` : '',
    storage: item.almacenamiento,
    display: item.pantalla,
    camera: item.camaraPrincipal,
    rating: item.rating ?? 0,
    reviews: item.reviews ?? 0,
    stock: item.stock ?? 0,
    // El JSON no trae ventas; se usa la cantidad de reseñas como referencia de popularidad.
    sold: item.reviews ?? 0,
    badge: item.etiqueta || '',
    colors: BRAND_COLOR_CLASSES[item.marca] || '',
    // Colores elegidos en el admin; si no hay, se usan los puntos de la marca
    colorList: (item.colores || [])
      .filter((nombre) => colorHex[nombre])
      .map((nombre) => ({
        nombre,
        hex: colorHex[nombre],
        image: resolveImageUrl(imagenesPorColor[nombre] || item.imagen)
      })),
    image: resolveImageUrl(item.imagen)
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
      const count = document.querySelector('[data-product-count]');
      if (count) count.textContent = 'Catálogo no disponible';
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
  const priceMin = form?.querySelector('[data-price-min]');
  const priceMinValue = form?.querySelector('[data-price-min-value]');
  const sortSelect = document.querySelector('[data-sort]');
  let brandChips = []; // se llena al generar las opciones de marca
  const clearButton = document.querySelector('[data-clear-filters]');
  const layout = document.querySelector('[data-catalog-layout]');
  const filterForm = document.querySelector('[data-filter-form]');
  const filterToggle = document.querySelector('[data-toggle-filters]');

  function setFiltersOpen(open) {
    if (!layout || !filterForm || !filterToggle) return;
    layout.classList.toggle('is-filters-collapsed', !open);
    filterForm.hidden = !open;
    filterToggle.setAttribute('aria-expanded', String(open));
  }

  // En móvil empiezan colapsados; en escritorio abiertos
  setFiltersOpen(!window.matchMedia('(max-width: 640px)').matches);

  filterToggle?.addEventListener('click', () => {
    const open = filterForm.hidden === true;
    setFiltersOpen(open);
  });

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

  const cards = catalogProducts.map((product) => {
    const card = createProductCard(product, productTemplate);
    const brand = document.createElement('p');
    brand.className = 'tcno-catalog-card-brand';
    brand.textContent = product.brand;
    const name = card.querySelector('[data-product-name]');
    name.before(brand);
    card.dataset.searchName = product.name.toLocaleLowerCase('es');
    card.dataset.status = product.stock > 5 ? 'En stock' : product.stock > 0 ? 'Stock bajo' : 'Agotado';
    const brandPrefix = product.brand + ' ';
    const model = product.name.toLowerCase().startsWith(brandPrefix.toLowerCase())
      ? product.name.slice(brandPrefix.length)
      : product.name;
    if (model) name.textContent = model.length <= 5 ? product.name : model;
    decorateCatalogCard(card, product);
    return card;
  });


  // Marcas y almacenamientos del filtro: salen de OPCIONES (productos.js) más lo que
  // traigan los productos, así el catálogo y el admin muestran siempre las mismas opciones.
  const brands = uniqueValues([...catalogOptions.marcas, ...catalogProducts.map((p) => p.brand)]);
  const storages = uniqueValues([...catalogOptions.almacenamientos, ...catalogProducts.map((p) => p.storage)])
    .filter((value) => Number(value) > 0)
    .sort((first, second) => Number(first) - Number(second));

  const featuredBrands = ['Samsung', 'Apple', 'Xiaomi', 'Motorola', 'Oppo'];
  const visibleBrands = featuredBrands.map((name) =>
    brands.find((brand) => brand.toLowerCase() === name.toLowerCase())
  ).filter(Boolean);
  const remainingBrands = brands.filter((brand) => !visibleBrands.includes(brand));
  const initialBrands = [...visibleBrands, ...remainingBrands].slice(0, 5);
  const extraBrands = form.querySelector('[data-extra-brands]');
  const moreBrands = form.querySelector('[data-more-brands]');
  buildCheckOptions(form.querySelector('[data-filter-options="brand"]'), 'brand', initialBrands);
  buildCheckOptions(extraBrands, 'brand', brands.filter((brand) => !initialBrands.includes(brand)));
  if (moreBrands && extraBrands) {
    moreBrands.hidden = extraBrands.childElementCount === 0;
    moreBrands.addEventListener('click', () => {
      extraBrands.hidden = !extraBrands.hidden;
      moreBrands.setAttribute('aria-expanded', String(!extraBrands.hidden));
      moreBrands.textContent = extraBrands.hidden ? 'Ver más' : 'Ver menos';
    });
  }

  const colorOptions = uniqueValues(catalogProducts.flatMap((product) =>
    product.colorList.map((color) => color.nombre)));
  const tags = uniqueValues([...(catalogOptions.etiquetas ?? []), ...catalogProducts.map((product) => product.badge)]);
  buildCheckOptions(form.querySelector('[data-filter-options="color"]'), 'color', colorOptions);
  buildCheckOptions(form.querySelector('[data-filter-options="status"]'), 'status', ['En stock', 'Stock bajo', 'Agotado']);
  buildCheckOptions(form.querySelector('[data-filter-options="badge"]'), 'badge', tags);
  const categoryCount = form.querySelector('[data-category-count]');
  if (categoryCount) categoryCount.textContent = '(' + cards.length + ')';
  const category = form.elements.namedItem('category');
  const productsByCard = new Map(cards.map((card, index) => [card, catalogProducts[index]]));

  function filterValues(card, name) {
    const product = productsByCard.get(card);
    if (name === 'color') return product.colorList.map((color) => color.nombre);
    if (name === 'badge') return [product.badge];
    return [card.dataset[name]];
  }
  buildCheckOptions(form.querySelector('[data-filter-options="storage"]'), 'storage', storages, formatStorage);
  buildBrandChips(document.querySelector('[data-brand-chips]'), brands);
  brandChips = Array.from(document.querySelectorAll('[data-brand-chip]'));

  // Los contadores de marca y almacenamiento se calculan con los datos cargados.
  ['brand', 'storage', 'color', 'status', 'badge'].forEach((name) => {
    form.querySelectorAll(`input[name="${name}"]`).forEach((input) => {
      const total = cards.filter((card) => filterValues(card, name).includes(input.value)).length;
      const counter = input.closest('label')?.querySelector('small');
      if (name === 'color') input.closest('label')?.style.setProperty('--swatch', colorHex[input.value]);
      if (name === 'color') input.closest('label')?.setAttribute('title', input.value);
      if (counter) counter.textContent = `(${total})`;
    });
  });

  const formatPrice = (price) => `$ ${Number(price).toLocaleString('es-CO')}`;
  let selectedChipBrand = 'Todos';
  let currentPage = 1;
  const pageSize = 16;
  const pagination = document.querySelector('[data-catalog-pages]');
  const viewButtons = document.querySelectorAll('[data-catalog-view]');
  let filteredCards = [];

  viewButtons.forEach((button) => {
    button.addEventListener('click', () => {
      grid.classList.toggle('is-list', button.dataset.catalogView === 'list');
      viewButtons.forEach((control) => {
        control.setAttribute('aria-pressed', String(control === button));
      });
    });
  });

  function renderPage() {
    const start = (currentPage - 1) * pageSize;
    grid.replaceChildren(...filteredCards.slice(start, start + pageSize));
    if (!pagination) return;

    const totalPages = Math.ceil(filteredCards.length / pageSize);
    pagination.hidden = totalPages <= 1;
    pagination.replaceChildren();
    if (pagination.hidden) return;

    for (let page = 1; page <= totalPages; page += 1) {
      const button = document.createElement('button');
      button.type = 'button';
      button.dataset.page = String(page);
      button.textContent = String(page);
      button.setAttribute('aria-label', 'Página ' + page);
      if (page === currentPage) button.setAttribute('aria-current', 'page');
      pagination.append(button);
    }
  }

  pagination?.addEventListener('click', (event) => {
    const button = event.target.closest('[data-page]');
    if (!button) return;
    currentPage = Number(button.dataset.page);
    renderPage();
    pagination.querySelector('[aria-current="page"]')?.focus();
  });

  // Ajustar el control de precio al producto más caro (si no, un producto de más de
  // $5.000.000 agregado desde el admin quedaría oculto por el filtro de precio).
  const highestPrice = Math.max(0, ...catalogProducts.map((product) => product.price));
  const sliderMax = Math.max(
    PRICE_SLIDER_MIN_MAX,
    Math.ceil(highestPrice / PRICE_SLIDER_STEP) * PRICE_SLIDER_STEP
  );
  const sliderMin = Math.max(0, Math.floor(Math.min(800000, ...catalogProducts.map((product) => product.price)) / PRICE_SLIDER_STEP) * PRICE_SLIDER_STEP);
  for (const control of [priceMin, priceRange].filter(Boolean)) {
    control.min = String(sliderMin);
    control.max = String(sliderMax);
  }
  if (priceMin) priceMin.value = String(sliderMin);
  priceRange.value = String(sliderMax);

  function updatePrices(changed) {
    if (priceMin && Number(priceMin.value) > Number(priceRange.value)) {
      if (changed === priceMin) priceMin.value = priceRange.value;
      else priceRange.value = priceMin.value;
    }

    const span = sliderMax - sliderMin || 1;
    const min = Number(priceMin?.value ?? sliderMin);
    const max = Number(priceRange.value);
    const slider = priceRange.closest('.tcno-price-slider');
    slider?.style.setProperty('--price-start', (min - sliderMin) / span * 100 + '%');
    slider?.style.setProperty('--price-end', (max - sliderMin) / span * 100 + '%');
    if (priceMinValue) priceMinValue.textContent = formatPrice(min);
    priceValue.textContent = formatPrice(max);
  }

  updatePrices();
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
    const extraFilters = ['color', 'status', 'badge'].map((name) => [name, getSelectedValues(name)]);
    const minimumPrice = Number(priceMin?.value ?? sliderMin);
    const minimumRating = Number(form.querySelector('input[name="rating"]:checked')?.value || 0);
    const maximumPrice = Number(priceRange.value);
    const query = document.querySelector('.tcno-search-input')?.value.trim().toLocaleLowerCase('es') || '';
    const visibleCards = cards.filter((card) => {
      const brandMatches = selectedChipBrand === 'Todos' || card.dataset.brand === selectedChipBrand;
      const brandCheckboxMatches = brands.length === 0 || brands.includes(card.dataset.brand);
      const storageMatches = storage.length === 0 || storage.includes(card.dataset.storage);
      const price = Number(card.dataset.price);
      const priceMatches = price >= minimumPrice && price <= maximumPrice;
      const extrasMatch = extraFilters.every(([name, selected]) =>
        selected.length === 0 || filterValues(card, name).some((value) => selected.includes(value)));
      const ratingMatches = Number(card.dataset.rating) >= minimumRating;
      const queryMatches = !query || card.dataset.searchName.includes(query);
      const visible = (category?.checked ?? true) && extrasMatch && brandMatches && brandCheckboxMatches && storageMatches && priceMatches && ratingMatches && queryMatches;

      return visible;
    });

    const sortedCards = [...visibleCards].sort((first, second) => {
      if (sortSelect.value === 'price-asc') return Number(first.dataset.price) - Number(second.dataset.price);
      if (sortSelect.value === 'price-desc') return Number(second.dataset.price) - Number(first.dataset.price);
      if (sortSelect.value === 'rating') return Number(second.dataset.rating) - Number(first.dataset.rating);
      return Number(second.dataset.sold) - Number(first.dataset.sold);
    });

    filteredCards = sortedCards;
    currentPage = 1;
    renderPage();
    count.textContent = `${visibleCards.length} ${visibleCards.length === 1 ? 'producto encontrado' : 'productos encontrados'}`;
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

  for (const control of [priceMin, priceRange].filter(Boolean)) {
    control.addEventListener('input', () => {
      updatePrices(control);
      applyFilters();
    });
  }

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
    if (priceMin) priceMin.value = priceMin.min;
    updatePrices();
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

  applyFilters();
}

function decorateCatalogCard(card, product) {
  const badge = card.querySelector('[data-product-badge]');
  const label = product.badge.toLocaleLowerCase('es');
  const price = card.querySelector('[data-product-price]');
  const oldPrice = card.querySelector('[data-product-old-price]');
  const currentAmount = Number(product.price);
  const previousAmount = Number(product.oldPrice);
  const validOffer = Number.isFinite(currentAmount) && Number.isFinite(previousAmount)
    && currentAmount > 0 && previousAmount > currentAmount;
  const discount = validOffer ? Math.round(100 * (1 - currentAmount / previousAmount)) : 0;

  if (!label || (label.includes('oferta') && !discount)) {
    badge.hidden = false;
    badge.textContent = discount ? '-' + discount + '%' : product.stock > 0 ? 'Disponible' : 'Agotado';
    badge.classList.toggle('is-available', !discount && product.stock > 0);
  }
  if (label.includes('oferta') && discount) {
    badge.textContent = 'Oferta';
    badge.classList.add('is-offer');
    badge.insertAdjacentHTML('afterbegin', '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m13 2-9 12h7l-1 8 10-12h-7l1-8z"/></svg>');
  }
  if (label === 'más vendido' || label === 'mas vendido') {
    badge.classList.add('is-bestseller');
    badge.insertAdjacentHTML('afterbegin', '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m3 6 5 4 4-6 4 6 5-4-2 13H5L3 6z"/></svg>');
  }

  const ratingText = card.querySelector('[data-product-rating]');
  const stars = ratingText.previousElementSibling;
  const rating = Math.max(0, Math.min(5, Number(product.rating) || 0));
  if (stars) {
    stars.classList.add('tcno-catalog-stars');
    stars.style.setProperty('--rating-fill', rating / 5 * 100 + '%');
    stars.textContent = '★★★★★';
    stars.setAttribute('aria-hidden', 'true');
  }
  const score = document.createElement('strong');
  score.textContent = rating.toFixed(1);
  score.setAttribute('aria-label', rating.toFixed(1) + ' de 5');
  const reviews = Number(product.reviews) || 0;
  ratingText.replaceChildren(score, ' (' + reviews.toLocaleString('es-CO') + (reviews === 1 ? ' reseña)' : ' reseñas)'));

  const specs = document.createElement('ul');
  specs.className = 'tcno-catalog-specs';
  specs.setAttribute('aria-label', 'Especificaciones');
  const screen = typeof product.display === 'string' ? product.display.trim() : '';
  const storage = Number(product.storage) > 0 ? formatStorage(product.storage) : '';
  const camera = typeof product.camera === 'string'
    ? product.camera.trim()
    : Number(product.camera) > 0 ? product.camera + ' MP' : '';
  for (const value of [screen, storage, camera].filter(Boolean)) {
    const item = document.createElement('li');
    item.textContent = /^\d+(?:[.,]\d+)?$/.test(value) && value === camera ? value + ' MP' : value;
    specs.append(item);
  }
  if (specs.childElementCount) ratingText.parentElement.after(specs);

  const priceGroup = document.createElement('div');
  priceGroup.className = 'tcno-catalog-price';
  price.before(priceGroup);
  price.textContent = formatCurrency(product.price);
  priceGroup.append(price);
  oldPrice.hidden = !discount;
  if (discount) {
    const previous = document.createElement('s');
    previous.textContent = formatCurrency(product.oldPrice);
    oldPrice.replaceChildren(previous);
    priceGroup.append(oldPrice);
    const percent = document.createElement('span');
    percent.className = 'tcno-catalog-discount';
    percent.textContent = '-' + discount + '%';
    priceGroup.append(percent);
  }

  const meta = card.querySelector('.tcno-product-meta');
  const storageTag = card.querySelector('[data-product-storage]');
  if (storageTag) storageTag.hidden = true;
  if (meta) meta.hidden = true;
  const warranty = card.querySelector('.tcno-warranty');
  if (warranty) warranty.hidden = true;

  const addButton = card.querySelector('[data-add-cart]');
  for (const node of [...addButton.childNodes]) {
    if (node.nodeType === Node.TEXT_NODE) node.remove();
  }
  const addLabel = document.createElement('span');
  addLabel.textContent = 'Añadir al carrito';
  addButton.append(addLabel);
}

function createProductCard(product, template) {
  const card = template.content.firstElementChild.cloneNode(true);
  const badge = card.querySelector('[data-product-badge]');
  const image = card.querySelector('[data-product-image]');
  const oldPrice = card.querySelector('[data-product-old-price]');
  const favoriteButton = card.querySelector('[data-favorite]');

  if (product.id !== undefined) card.dataset.id = String(product.id);
  let selectedColor = product.colorList?.[0]?.nombre || '';
  let activeProduct = {
    ...product,
    image: product.colorList?.[0]?.image || product.image,
    selectedColor
  };
  card.dataset.productData = JSON.stringify(activeProduct);
  card.dataset.brand = product.brand;
  card.dataset.price = String(product.price);
  card.dataset.storage = String(product.storage);
  card.dataset.rating = String(product.rating);
  card.dataset.sold = String(product.sold);
  // Tarjeta clicable: abre el detalle (catálogo, carrusel del home, etc.)
  card.style.cursor = 'pointer';
  card.setAttribute('role', 'link');
  card.setAttribute('tabindex', '0');
  card.setAttribute('aria-label', `Ver detalle de ${product.name}`);

  const goToProduct = () => {
    const url = new URL('producto.html', window.location.href);
    url.searchParams.set('id', String(product.id));
    if (selectedColor) {
      url.searchParams.set('color', selectedColor);
    }
    window.location.href = url.href;
  };

  card.addEventListener('keydown', (event) => {
    if (event.target !== card) return;
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      goToProduct();
    }
  });

  card.addEventListener('click', (event) => {
    const favoriteBtn = event.target.closest('[data-favorite]');
    if (favoriteBtn) {
      event.preventDefault();
      event.stopPropagation();
      const isFavorite = favoriteBtn.getAttribute('aria-pressed') === 'true';
      favoriteBtn.setAttribute('aria-pressed', String(!isFavorite));
      favoriteBtn.setAttribute(
        'aria-label',
        `${isFavorite ? 'Agregar' : 'Quitar'} ${product.name} ${isFavorite ? 'a' : 'de'} favoritos`
      );
      return;
    }

    const cartBtn = event.target.closest('[data-add-cart]');
    if (cartBtn) {
      event.preventDefault();
      event.stopPropagation();
      window.TcnoCart?.add(activeProduct);
      if (cartBtn.classList.contains('is-added')) return;
      const originalContent = cartBtn.innerHTML;
      cartBtn.classList.add('is-added');
      cartBtn.textContent = 'Agregado al carrito';
      window.setTimeout(() => {
        cartBtn.classList.remove('is-added');
        cartBtn.innerHTML = originalContent;
      }, 1600);
      return;
    }

    if (event.target.closest('[data-product-colors]')) {
      return;
    }

    goToProduct();
  });
  card.querySelector('[data-product-name]').textContent = product.name;
  card.querySelector('[data-product-rating]').textContent = `${product.rating.toFixed(1)} (${product.reviews})`;
  card.querySelector('[data-product-price]').textContent = `${formatCurrency(product.price)} COP`;
  const storageTag = card.querySelector('[data-product-storage]');
  if (storageTag) storageTag.textContent = formatStorage(product.storage);
  const colorsBox = card.querySelector('[data-product-colors]');
  if (colorsBox && product.colorList?.length) {
    // Colores propios del producto: reemplazan los puntos por defecto de la marca
    const dots = product.colorList.map(({ nombre, hex, image: colorImage }, index) => {
      const dot = document.createElement('span');
      dot.className = 'tcno-color-dot';
      if (index === 0) dot.classList.add('is-active');
      dot.style.setProperty('--dot', hex);
      dot.title = nombre;
      dot.setAttribute('role', 'button');
      dot.setAttribute('tabindex', '0');
      dot.setAttribute('aria-pressed', String(index === 0));
      dot.setAttribute('aria-label', `${product.name} color ${nombre}`);
      const selectColor = (event) => {
        event?.preventDefault();
        event?.stopPropagation();
        selectedColor = nombre;
        if (colorImage) {
          image.src = colorImage;
          image.alt = `Imagen de ${product.name} (${nombre})`;
        }
        activeProduct = {
          ...product,
          image: colorImage || product.image,
          selectedColor: nombre
        };
        card.dataset.productData = JSON.stringify(activeProduct);
        dots.forEach((d) => {
          const isCurrent = d === dot;
          d.classList.toggle('is-active', isCurrent);
          d.setAttribute('aria-pressed', String(isCurrent));
        });
      };
      dot.addEventListener('click', selectColor);
      dot.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          selectColor(e);
        }
      });
      return dot;
    });
    colorsBox.replaceChildren(...dots);
    colorsBox.setAttribute('aria-label', `Colores: ${product.colorList.map((c) => c.nombre).join(', ')}`);
  } else {
    colorsBox?.classList.add(...(product.colors || '').split(' ').filter(Boolean));
  }
  badge.textContent = product.badge;
  badge.hidden = !product.badge;
  badge.classList.toggle('is-new', product.badge === 'Nuevo');
  image.src = activeProduct.image || FALLBACK_IMAGE;
  image.alt = `Imagen de ${product.name}`;
  image.addEventListener('error', () => {
  // Si una variante de color aún no existe en disco, vuelve a la foto HD principal del teléfono;
  // solo si la principal tampoco existe usa la imagen genérica de respaldo.
  if (product.image && image.src !== product.image) {
    image.src = product.image;
  } else if (image.src !== FALLBACK_IMAGE) {
    image.src = FALLBACK_IMAGE;
  }
});
favoriteButton.setAttribute('aria-label', `Agregar ${product.name} a favoritos`);

if (product.oldPrice && product.oldPrice > product.price) {
  oldPrice.hidden = false;
  oldPrice.textContent = `${formatCurrency(product.oldPrice)} `;
  if (product.discount) {
    const discount = document.createElement('span');
    discount.textContent = `-${product.discount}`;
    oldPrice.append(discount);
  }
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
