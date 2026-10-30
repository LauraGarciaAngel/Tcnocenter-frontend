// Compañeros, aquí editamos los datos de cada celular. Cuando tengamos la foto, la guardamos en assets y ponemos su ruta en image.
// Ejemplo: image: '../assets/images/samsung-a35.png'
const catalogProducts = [
  { name: 'Samsung Galaxy S24 Ultra', brand: 'Samsung', price: 4299900, oldPrice: 4999900, discount: '14%', storage: 256, rating: 4.8, reviews: 124, sold: 98, badge: 'En oferta', colors: '', image: '' },
  { name: 'iPhone 15 Pro', brand: 'Apple', price: 3799900, storage: 128, rating: 4.7, reviews: 98, sold: 95, badge: 'Nuevo', colors: 'is-apple', image: '' },
  { name: 'Xiaomi Redmi Note 13', brand: 'Xiaomi', price: 1199900, oldPrice: 1499900, discount: '20%', storage: 128, rating: 4.6, reviews: 76, sold: 82, badge: 'En oferta', colors: 'is-xiaomi', image: '' },
  { name: 'Samsung Galaxy A55', brand: 'Samsung', price: 1899900, storage: 256, rating: 4.5, reviews: 63, sold: 71, badge: 'Nuevo', colors: '', image: '' },
  { name: 'Motorola Edge 40', brand: 'Motorola', price: 1649900, oldPrice: 1899900, discount: '13%', storage: 256, rating: 4.5, reviews: 52, sold: 68, badge: 'En oferta', colors: 'is-moto', image: '' },
  { name: 'iPhone 14', brand: 'Apple', price: 2299900, storage: 128, rating: 4.3, reviews: 41, sold: 61, badge: 'Nuevo', colors: 'is-apple', image: '' },
  { name: 'Xiaomi Poco X6 Pro', brand: 'Xiaomi', price: 1499900, oldPrice: 1799900, discount: '17%', storage: 512, rating: 4.5, reviews: 37, sold: 58, badge: 'En oferta', colors: 'is-xiaomi', image: '' },
  { name: 'Samsung Galaxy A15', brand: 'Samsung', price: 899900, storage: 64, rating: 4.2, reviews: 28, sold: 45, badge: 'Nuevo', colors: 'is-samsung', image: '' }
];

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

  const cards = catalogProducts.map((product) => createProductCard(product, productTemplate));
  grid.replaceChildren(...cards);

  const formatPrice = (price) => `$ ${Number(price).toLocaleString('es-CO')}`;
  let selectedChipBrand = 'Todos';

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
    if (favoriteButton) {
      const isFavorite = favoriteButton.getAttribute('aria-pressed') === 'true';
      favoriteButton.setAttribute('aria-pressed', String(!isFavorite));
      favoriteButton.setAttribute(
        'aria-label',
        `${isFavorite ? 'Agregar' : 'Quitar'} ${favoriteButton.closest('[data-product]').querySelector('[data-product-name]').textContent} ${isFavorite ? 'a' : 'de'} favoritos`
      );
      return;
    }

    const cartButton = event.target.closest('[data-add-cart]');
    if (!cartButton) return;

    const productName = cartButton.closest('[data-product]').querySelector('[data-product-name]').textContent;
    const originalContent = cartButton.innerHTML;
    cartButton.classList.add('is-added');
    cartButton.textContent = 'Agregado al carrito';
    cartFeedback.textContent = `${productName} se agregó al carrito.`;
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
  if (product.image) {
    image.src = new URL(product.image, document.baseURI).href;
    image.alt = `Imagen de ${product.name}`;
  } else {
    image.hidden = true;
  }
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
