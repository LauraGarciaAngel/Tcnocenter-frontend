// Estado y panel reutilizable del carrito de compras.

const CART_STORAGE_KEY = 'tcno_cart';
let cartItems = [];
let cartInitialized = false;

function readCart() {
  try {
    const storedCart = JSON.parse(localStorage.getItem(CART_STORAGE_KEY) || '[]');
    return Array.isArray(storedCart)
      ? storedCart.filter((item) => item?.product?.id != null && Number(item.quantity) > 0)
      : [];
  } catch (error) {
    console.error('No se pudo leer el carrito guardado:', error);
    return [];
  }
}

function saveCart() {
  localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartItems));
  renderCart();
  window.dispatchEvent(new CustomEvent('tcno:cart-updated', { detail: getCartSummary() }));
}

function getCartSummary() {
  return {
    items: cartItems,
    count: cartItems.reduce((total, item) => total + item.quantity, 0),
    total: cartItems.reduce((total, item) => total + item.product.price * item.quantity, 0)
  };
}

function formatCartCurrency(value) {
  return `$${Number(value).toLocaleString('es-CO')} COP`;
}

function addToCart(product, quantity = 1) {
  if (!product || product.id == null || Number(product.price) < 0) {
    console.error('No se puede agregar un producto inválido al carrito.', product);
    return;
  }

  const existingItem = cartItems.find((item) => String(item.product.id) === String(product.id));
  const requestedQuantity = Number(quantity);
  const stock = Number(product.stock || 0);
  const nextQuantity = (existingItem?.quantity || 0) + requestedQuantity;
  const safeQuantity = stock > 0 ? Math.min(nextQuantity, stock) : nextQuantity;

  if (existingItem) {
    existingItem.quantity = safeQuantity;
    existingItem.product = product;
  } else {
    cartItems.push({ product, quantity: Math.max(1, safeQuantity) });
  }

  saveCart();
  openCart();
}

function updateQuantity(productId, quantity) {
  const item = cartItems.find((cartItem) => String(cartItem.product.id) === String(productId));
  if (!item) return;

  const requestedQuantity = Number(quantity);
  const stock = Number(item.product.stock || 0);
  item.quantity = stock > 0 ? Math.min(Math.max(1, requestedQuantity), stock) : Math.max(1, requestedQuantity);
  saveCart();
}

function removeFromCart(productId) {
  cartItems = cartItems.filter((item) => String(item.product.id) !== String(productId));
  saveCart();
}

function openCart() {
  const drawer = document.querySelector('[data-cart-drawer]');
  const backdrop = document.querySelector('[data-cart-close].tcno-cart-backdrop');
  if (!drawer || !backdrop) return;

  drawer.classList.add('is-open');
  drawer.setAttribute('aria-hidden', 'false');
  backdrop.classList.add('is-visible');
  document.body.classList.add('tcno-cart-open');
}

function closeCart() {
  const drawer = document.querySelector('[data-cart-drawer]');
  const backdrop = document.querySelector('[data-cart-close].tcno-cart-backdrop');
  if (!drawer || !backdrop) return;

  drawer.classList.remove('is-open');
  drawer.setAttribute('aria-hidden', 'true');
  backdrop.classList.remove('is-visible');
  document.body.classList.remove('tcno-cart-open');
}

function renderCart() {
  const itemsContainer = document.querySelector('[data-cart-items]');
  const emptyState = document.querySelector('[data-cart-empty]');
  const totalElement = document.querySelector('[data-cart-total]');
  const checkoutButton = document.querySelector('[data-cart-checkout]');
  const countElements = document.querySelectorAll('[data-cart-count]');
  const summary = getCartSummary();

  countElements.forEach((element) => {
    element.textContent = String(summary.count);
    element.hidden = summary.count === 0;
  });

  if (!itemsContainer || !emptyState || !totalElement || !checkoutButton) return;

  itemsContainer.replaceChildren();
  emptyState.hidden = summary.items.length > 0;
  totalElement.textContent = formatCartCurrency(summary.total);
  checkoutButton.disabled = summary.items.length === 0;

  summary.items.forEach(({ product, quantity }) => {
    const item = document.createElement('article');
    item.className = 'tcno-cart-item';
    item.dataset.cartId = String(product.id);

    const image = document.createElement('img');
    image.src = product.image || '';
    image.alt = `Imagen de ${product.name}`;
    image.loading = 'lazy';

    const details = document.createElement('div');
    details.className = 'tcno-cart-item-details';

    const name = document.createElement('h3');
    name.textContent = product.name;
    const metadata = document.createElement('p');
    metadata.textContent = `${product.storage} GB · ${formatCartCurrency(product.price)}`;

    const controls = document.createElement('div');
    controls.className = 'tcno-cart-item-controls';
    controls.innerHTML = `
      <button type="button" data-cart-decrease aria-label="Disminuir cantidad">−</button>
      <span aria-label="Cantidad">${quantity}</span>
      <button type="button" data-cart-increase aria-label="Aumentar cantidad">+</button>
      <button type="button" class="tcno-cart-remove" data-cart-remove>Eliminar</button>
    `;

    details.append(name, metadata, controls);
    item.append(image, details);
    itemsContainer.append(item);
  });
}

function productFromCard(card) {
  try {
    return JSON.parse(card.dataset.productData);
  } catch (error) {
    console.error('La tarjeta no contiene datos válidos para el carrito:', error);
    return null;
  }
}

function initializeCart() {
  if (cartInitialized) {
    renderCart();
    return;
  }

  cartInitialized = true;
  cartItems = readCart();
  renderCart();

  document.addEventListener('click', (event) => {
    const cartToggle = event.target.closest('[data-cart-toggle]');
    if (cartToggle) {
      event.preventDefault();
      openCart();
      return;
    }

    const closeButton = event.target.closest('[data-cart-close]');
    if (closeButton) {
      closeCart();
      return;
    }

    const addButton = event.target.closest('[data-add-cart]');
    if (addButton) {
      const productSource = addButton.closest('[data-product]') || addButton;
      const product = productFromCard(productSource);
      if (product) addToCart(product);
      return;
    }

    const cartItem = event.target.closest('[data-cart-id]');
    if (!cartItem) return;

    const productId = cartItem.dataset.cartId;
    const currentQuantity = cartItems.find((item) => String(item.product.id) === productId)?.quantity || 1;
    if (event.target.closest('[data-cart-increase]')) updateQuantity(productId, currentQuantity + 1);
    if (event.target.closest('[data-cart-decrease]')) updateQuantity(productId, currentQuantity - 1);
    if (event.target.closest('[data-cart-remove]')) removeFromCart(productId);
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') closeCart();
  });

  window.addEventListener('storage', (event) => {
    if (event.key === CART_STORAGE_KEY) {
      cartItems = readCart();
      renderCart();
    }
  });
}

window.TcnoCart = {
  add: addToCart,
  remove: removeFromCart,
  updateQuantity,
  open: openCart,
  close: closeCart,
  getSummary: getCartSummary
};

document.addEventListener('DOMContentLoaded', initializeCart);
document.addEventListener('tcno:components-ready', initializeCart);
