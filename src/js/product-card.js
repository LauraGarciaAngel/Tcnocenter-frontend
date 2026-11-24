const template = document.createElement('template');
template.innerHTML = `
  <style>
    :host {
      display: block;
      min-width: 0;
      font: 1rem system-ui, sans-serif;
      color: #111;
    }
    * { box-sizing: border-box; }
    [hidden] { display: none !important; }
    article {
      height: 100%;
      display: grid;
      grid-template-rows: auto auto 1fr auto;
      gap: 1rem;
      padding: 1rem;
      background: #fcfcfd;
      border: 1px solid #eeeef2;
      border-radius: 1.5rem;
      box-shadow: 0 4px 12px #17234916;
    }
    header, .pricing {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: .5rem;
    }
    .pill {
      border-radius: 2rem;
      padding: .35rem .8rem;
      background: #b9f1e9;
      color: #005c54;
      font-weight: 750;
    }
    .pill[data-tone="nuevo"] { background: #007d75; color: white; }
    .pill[data-tone="destacado"] { background: #00463f; color: white; }
    button { font: inherit; cursor: pointer; }
    button:focus-visible { outline: 3px solid #00847a; outline-offset: 3px; }
    .favorite {
      margin-inline-start: auto;
      display: grid;
      place-items: center;
      width: 2.75rem;
      height: 2.75rem;
      border: 0;
      background: transparent;
      color: inherit;
    }
    svg { width: 1.5rem; height: 1.5rem; }
    .favorite[aria-pressed="true"] { color: #00756d; }
    .favorite[aria-pressed="true"] svg { fill: currentColor; }
    .photo {
      grid-row: 2;
      width: 100%;
      aspect-ratio: 1.1;
      object-fit: contain;
    }
    p, h2, ul { margin: 0; }
    .details { grid-row: 3; display: grid; align-content: start; gap: .55rem; }
    .brand {
      color: #555861;
      text-transform: uppercase;
      letter-spacing: .12em;
      font-size: .8rem;
      font-weight: 800;
    }
    h2 { font-size: 1.45rem; line-height: 1.15; overflow-wrap: anywhere; }
    .rating { display: flex; flex-wrap: wrap; align-items: center; gap: .4rem; }
    .stars { position: relative; color: #dbd7cc; font-size: 1.15rem; }
    .stars-fill {
      position: absolute;
      inset: 0;
      width: var(--rating-fill);
      overflow: hidden;
      color: #e99a00;
    }
    .reviews, .specs, s { color: #555861; }
    .specs {
      display: flex;
      flex-wrap: wrap;
      gap: .35rem .65rem;
      list-style: none;
      padding: .55rem 0;
      font-size: .9rem;
    }
    .specs li + li { border-inline-start: 1px solid #b8b9bf; padding-inline-start: .65rem; }
    footer { grid-row: 4; display: grid; gap: .9rem; }
    .pricing { min-height: 3.6rem; flex-wrap: wrap; }
    .amount { display: block; font-size: 1.6rem; font-weight: 800; }
    s { font-weight: 600; }
    .cart {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: .6rem;
      min-height: 3rem;
      padding: .65rem;
      border: 0;
      border-radius: .75rem;
      background: #191919;
      color: white;
      font-weight: 700;
    }
    .cart:hover { background: #303030; }
  </style>
  <article aria-labelledby="name" hidden>
    <header>
      <span class="pill" id="badge"></span>
      <button type="button" class="favorite" aria-label="Favorito" aria-pressed="false">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true">
          <path d="M20.8 4.7a5.5 5.5 0 0 0-7.8 0l-1 1-1-1a5.5 5.5 0 0 0-7.8 7.8l8.8 8.8 8.8-8.8a5.5 5.5 0 0 0 0-7.8Z"/>
        </svg>
      </button>
    </header>
    <img class="photo" loading="lazy" decoding="async">
    <div class="details">
      <p class="brand" id="brand"></p>
      <h2 id="name"></h2>
      <p class="rating">
        <span class="stars" aria-hidden="true">★★★★★<span class="stars-fill">★★★★★</span></span>
        <strong id="rating"></strong>
        <span class="reviews" id="reviews"></span>
      </p>
      <ul class="specs" aria-label="Especificaciones"></ul>
    </div>
    <footer>
      <div class="pricing">
        <div>
          <strong class="amount" id="price"></strong>
          <s id="previous-price"></s>
        </div>
        <span class="pill" id="discount"></span>
      </div>
      <button type="button" class="cart">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <path d="M2 3h3l3 13h11l3-10H6"/>
          <circle cx="9" cy="21" r="1.3"/><circle cx="18" cy="21" r="1.3"/>
        </svg>
        Añadir al carrito
      </button>
    </footer>
  </article>
`;

const pesos = new Intl.NumberFormat('es-CO', {
  style: 'currency', currency: 'COP', maximumFractionDigits: 0,
});
const number = new Intl.NumberFormat('es-CO', { maximumFractionDigits: 1 });

class ProductCard extends HTMLElement {
  #product;

  constructor() {
    super();
    this.attachShadow({ mode: 'open' }).append(template.content.cloneNode(true));
    const favorite = this.shadowRoot.querySelector('.favorite');
    favorite.addEventListener('click', () => {
      const selected = favorite.getAttribute('aria-pressed') !== 'true';
      favorite.setAttribute('aria-pressed', String(selected));
      this.#emit('favorite-change', { favorite: selected });
    });
    this.shadowRoot.querySelector('.cart').addEventListener('click', () => {
      this.#emit('add-to-cart');
    });
  }

  get product() {
    return this.#product;
  }

  set product(product) {
    this.#product = product;
    const root = this.shadowRoot;
    root.querySelector('article').hidden = !product;
    if (!product) return;

    const { name, brand, image, badge, rating, reviews, price, previousPrice } = product;
    root.querySelector('#name').textContent = name;
    root.querySelector('#brand').textContent = brand || '';
    const photo = root.querySelector('.photo');
    photo.hidden = !image;
    if (image) photo.src = image;
    else photo.removeAttribute('src');
    photo.alt = product.imageAlt ?? name;

    const label = root.querySelector('#badge');
    label.hidden = !badge?.text;
    label.textContent = badge?.text || '';
    label.dataset.tone = badge?.tone || '';
    const favorite = root.querySelector('.favorite');
    favorite.setAttribute('aria-label', `Favorito: ${name}`);
    favorite.setAttribute('aria-pressed', String(Boolean(product.favorite)));

    const hasRating = Number.isFinite(rating) && rating >= 0 && rating <= 5;
    root.querySelector('.rating').hidden = !hasRating;
    if (hasRating) {
      const score = root.querySelector('#rating');
      score.textContent = number.format(rating);
      score.setAttribute('aria-label', `${number.format(rating)} de 5 estrellas`);
      root.querySelector('.stars').style.setProperty('--rating-fill', `${rating * 20}%`);
      root.querySelector('#reviews').textContent = Number.isFinite(reviews)
        ? `(${number.format(reviews)} ${reviews === 1 ? 'reseña' : 'reseñas'})` : '';
    }

    const specs = root.querySelector('.specs');
    specs.replaceChildren(...(product.specs ?? []).map((value) => {
      const item = document.createElement('li');
      item.textContent = value;
      return item;
    }));
    specs.hidden = !specs.children.length;

    root.querySelector('#price').textContent = pesos.format(price);
    const onSale = Number.isFinite(previousPrice) && previousPrice > price && price >= 0;
    const original = root.querySelector('#previous-price');
    const discount = root.querySelector('#discount');
    original.hidden = discount.hidden = !onSale;
    if (onSale) {
      original.textContent = pesos.format(previousPrice);
      discount.textContent = `-${Math.round((1 - price / previousPrice) * 100)}%`;
    }
  }

  #emit(type, detail = {}) {
    this.dispatchEvent(new CustomEvent(type, {
      bubbles: true,
      composed: true,
      detail: { product: this.#product, ...detail },
    }));
  }
}

customElements.define('product-card', ProductCard);
