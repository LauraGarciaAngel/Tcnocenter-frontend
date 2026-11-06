// Los datos de los celulares viven en src/data/celulares.json.
// Este archivo carga el JSON, pinta las tarjetas del catálogo y aplica los filtros.
// También expone los productos y createProductCard para el carrusel del index (Carrusel-categorias.js).
const PRODUCTS_URL = new URL('../data/celulares.json', window.location.href);

// Imagen local que se muestra si la foto de un celular no carga.
const FALLBACK_IMAGE = new URL('../assets/images/movil.png', window.location.href).href;

// Clases de color de las tarjetas según la marca (las demás usan los puntos por defecto).
const BRAND_COLOR_CLASSES = {
  Apple: 'is-apple',
  Xiaomi: 'is-xiaomi',
  Motorola: 'is-moto',
  Samsung: 'is-samsung'
};

let catalogProducts = [];

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
    rating: item.rating,
    reviews: item.reviews,
    // El JSON no trae ventas; se usa la cantidad de reseñas como referencia de popularidad.
    sold: item.reviews,
    badge: item.etiqueta || '',
    colors: BRAND_COLOR_CLASSES[item.marca] || '',
    image: item.imagen ? new URL(item.imagen, window.location.href).href : ''
  };
}

async function loadCatalogProducts() {
  const response = await fetch(PRODUCTS_URL);
  if (!response.ok) {
    throw new Error(`No se pudo cargar ${PRODUCTS_URL}: ${response.status} ${response.statusText}`);
  }

  catalogProducts = (await response.json()).map(mapProduct);
  window.catalogProducts = catalogProducts;
  return catalogProducts;
}

// Promesa compartida: Carrusel-categorias.js espera a que los datos estén listos.
window.catalogProductsReady = loadCatalogProducts();
window.createProductCard = createProductCard;

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
  const brandChips = Array.from(document.querySelectorAll('[data-brand-chip]'));
  const clearButton = document.querySelector('[data-clear-filters]');
  const cartFeedback = document.querySelector('[data-cart-feedback]');

  if (!form || !grid || !count || !emptyState || !priceRange || !priceValue || !sortSelect) {
    return;
  }

  const componentUrl = new URL('../components/product-card.html', window.location.href);
  const response = await fetch(componentUrl);
  if (!response.ok) {
    throw new Error(`No se pudo cargar ${componentUrl}: ${response.status} ${response.statusText}`);
  }

  const componentDocument = new DOMParser().parseFromString(await response.text(), 'text/html');
  const productTemplate = componentDocument.querySelector('#tcno-product-card-template');
  if (!productTemplate?.content.firstElementChild) {
    throw new Error('La plantilla de tarjeta de producto no tiene una estructura válida.');
  }

  await window.catalogProductsReady;

  const cards = catalogProducts.map((product) => createProductCard(product, productTemplate));
  grid.replaceChildren(...cards);

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
  card.querySelector('[data-product-colors]').classList.add(...product.colors.split(' ').filter(Boolean));
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

function formatCurrency(price) {
  return `$${Number(price).toLocaleString('es-CO')}`;
}
