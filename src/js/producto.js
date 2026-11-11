const PRODUCTS_MODULE_URL = new URL('../js/Administrador/productos.js', window.location.href).href;
const PRODUCTS_JSON_URL = new URL('../data/celulares.json', window.location.href);
const PRODUCTS_STORAGE_KEY = 'tcno_productos';
const FALLBACK_IMAGE = new URL('../assets/images/movil.png', window.location.href).href;

let colorHex = {};

function buildCopy(item) {
    const name = item.modelo.toLowerCase().startsWith(item.marca.toLowerCase())
        ? item.modelo
        : `${item.marca} ${item.modelo}`;

    const desc =
        item.descripcion ||
        `${name} con ${item.almacenamiento} GB de almacenamiento. Diseño premium, alto rendimiento y la garantía de calidad de ${item.marca}. Ideal para uso diario, fotos y entretenimiento.`;

    const details =
        item.detalles ||
        `El ${name} ofrece una experiencia fluida gracias a su procesador de última generación y su pantalla de alta resolución. Incluye ${item.almacenamiento} GB de almacenamiento interno y viene con la calificación de ${item.rating} estrellas por parte de nuestros clientes.`;

    const packaging =
        item.empaque ||
        `Caja original ${item.marca}, cable de carga, documentación y guía de inicio rápido. El producto se envía sellado de fábrica.`;

    const shipping =
        item.envio ||
        `Envíos a todo Colombia. Entrega estimada de 2 a 5 días hábiles en ciudades principales. Envío gratis en compras superiores a $200.000 COP. Puedes hacer seguimiento desde tu cuenta.`;

    const specs = item.especificaciones || {
        Marca: item.marca,
        Modelo: item.modelo,
        Almacenamiento: `${item.almacenamiento} GB`,
        'Sistema operativo': item.marca === 'Apple' ? 'iOS' : item.marca === 'Huawei' ? 'HarmonyOS' : 'Android',
        Garantía: '12 meses',
        Condición: 'Nuevo',
    };

    const nombresColores = (item.colores || []).filter(Boolean);
    if (nombresColores.length) {
        specs.Colores = nombresColores.join(', ');
    }

    return { name, desc, details, packaging, shipping, specs };
}

function formatCurrency(price) {
    return `$${Number(price).toLocaleString('es-CO')}`;
}

function renderStars(rating) {
    const full = Math.floor(rating);
    const half = rating - full >= 0.4;
    let html = '';
    for (let i = 0; i < 5; i++) {
        if (i < full) html += '<span class="is-full">★</span>';
        else if (i === full && half) html += '<span class="is-half">★</span>';
        else html += '<span class="is-empty">★</span>';
    }
    return html;
}

function getProductId() {
    const params = new URLSearchParams(window.location.search);
    const raw = params.get('id');
    if (raw == null || raw === '') return null;
    const id = Number(raw);
    return Number.isFinite(id) && id > 0 ? id : null;
}

function loadFromLocalStorage() {
    try {
        const raw = localStorage.getItem(PRODUCTS_STORAGE_KEY);
        if (!raw) return null;
        const data = JSON.parse(raw);
        return Array.isArray(data) && data.length ? data : null;
    } catch {
        return null;
    }
}

async function loadProducts() {
    try {
        const mod = await import(PRODUCTS_MODULE_URL);
        colorHex = mod.OPCIONES?.colores ?? {};
        const lista = await mod.cargarProductos();
        if (Array.isArray(lista) && lista.length) return lista;
    } catch (err) {
        console.warn('[producto] No se pudo usar productos.js:', err);
    }

    const fromStorage = loadFromLocalStorage();
    if (fromStorage) return fromStorage;

    const response = await fetch(PRODUCTS_JSON_URL);
    if (!response.ok) {
        throw new Error(`No se pudo cargar el catálogo (${response.status})`);
    }
    return response.json();
}

function resolveImageUrl(src) {
    if (!src) return FALLBACK_IMAGE;
    if (String(src).startsWith('data:')) return src;
    try {
        return new URL(src, window.location.href).href;
    } catch {
        return FALLBACK_IMAGE;
    }
}

function renderColors(item) {
    const section = document.querySelector('[data-product-colors]');
    const dotsBox = document.querySelector('[data-color-dots]');
    if (!section || !dotsBox) return;

    const nombres = (item.colores || []).filter(Boolean);
    if (!nombres.length) {
        section.hidden = true;
        dotsBox.replaceChildren();
        return;
    }

    const entries = nombres.map((nombre) => ({
        nombre,
        hex: colorHex[nombre] || null,
    }));

    dotsBox.replaceChildren(
        ...entries.map(({ nombre, hex }) => {
            const dot = document.createElement('span');
            dot.className = 'tcno-color-dot';
            dot.setAttribute('role', 'listitem');
            dot.title = nombre;
            dot.setAttribute('aria-label', nombre);
            if (hex) {
                dot.style.setProperty('--dot', hex);
                dot.style.backgroundColor = hex;
            } else {
                dot.style.backgroundColor = '#cbd5e1';
            }
            return dot;
        })
    );

    section.hidden = false;
    section.setAttribute('aria-label', `Colores disponibles: ${nombres.join(', ')}`);
}

function showStatus(message, showBack = true) {
    const status = document.querySelector('[data-product-status]');
    const shell = document.querySelector('[data-product-shell]');
    const msg = document.querySelector('[data-status-message]');
    if (shell) shell.hidden = true;
    if (status) {
        status.hidden = false;
        if (msg) msg.textContent = message;
    }
    if (!showBack) {
        const back = status?.querySelector('a');
        if (back) back.hidden = true;
    }
}

function renderProduct(item) {
    const copy = buildCopy(item);
    const imageUrl = resolveImageUrl(item.imagen);

    document.title = `tcnocenter | ${copy.name}`;

    const brandLink = document.querySelector('[data-breadcrumb-brand]');
    if (brandLink) {
        brandLink.textContent = item.marca;
        brandLink.href = `catalogo.html?marca=${encodeURIComponent(item.marca)}`;
    }
    const crumbName = document.querySelector('[data-breadcrumb-name]');
    if (crumbName) crumbName.textContent = copy.name;

    document.querySelector('[data-product-title]').textContent = copy.name;
    document.querySelector('[data-stars]').innerHTML = renderStars(item.rating ?? 0);
    document.querySelector('[data-reviews]').textContent = `${item.reviews ?? 0} reseñas`;
    document.querySelector('[data-product-price]').textContent = `${formatCurrency(item.precio)} COP`;

    const oldPriceEl = document.querySelector('[data-product-old-price]');
    if (item.precioAnterior) {
        oldPriceEl.hidden = false;
        oldPriceEl.innerHTML = `${formatCurrency(item.precioAnterior)} <span class="tcno-discount">-${item.descuento ?? 0}%</span>`;
    } else {
        oldPriceEl.hidden = true;
    }

    document.querySelector('[data-product-desc]').textContent = copy.desc;
    document.querySelector('[data-tab-details]').textContent = copy.details;
    document.querySelector('[data-tab-packaging]').textContent = copy.packaging;
    document.querySelector('[data-tab-shipping]').textContent = copy.shipping;

    renderColors(item);

    const specsList = document.querySelector('[data-specs-list]');
    specsList.replaceChildren(
        ...Object.entries(copy.specs).map(([key, value]) => {
            const dt = document.createElement('dt');
            dt.textContent = key;
            const dd = document.createElement('dd');
            dd.textContent = value;
            const wrap = document.createElement('div');
            wrap.className = 'tcno-spec-row';
            wrap.append(dt, dd);
            return wrap;
        })
    );

    const mainImg = document.querySelector('[data-main-image]');
    mainImg.src = imageUrl;
    mainImg.alt = `Imagen de ${copy.name}`;
    mainImg.addEventListener(
        'error',
        () => {
            if (mainImg.src !== FALLBACK_IMAGE) mainImg.src = FALLBACK_IMAGE;
        },
        { once: true }
    );

    const track = document.querySelector('[data-thumbs-track]');
    const gallery = item.imagenes?.length
        ? item.imagenes.map((src) => resolveImageUrl(src))
        : [imageUrl, imageUrl, imageUrl, imageUrl];

    track.replaceChildren(
        ...gallery.map((src, index) => {
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = `tcno-thumb${index === 0 ? ' is-active' : ''}`;
            btn.setAttribute('aria-label', `Vista ${index + 1}`);
            btn.dataset.index = String(index);
            const img = document.createElement('img');
            img.src = src;
            img.alt = '';
            img.loading = 'lazy';
            img.addEventListener(
                'error',
                () => {
                    if (img.src !== FALLBACK_IMAGE) img.src = FALLBACK_IMAGE;
                },
                { once: true }
            );
            btn.append(img);
            btn.addEventListener('click', () => {
                mainImg.src = src;
                track.querySelectorAll('.tcno-thumb').forEach((el) => el.classList.remove('is-active'));
                btn.classList.add('is-active');
            });
            return btn;
        })
    );

    document.querySelector('[data-product-status]').hidden = true;
    document.querySelector('[data-product-shell]').hidden = false;
}

function bindInteractions() {
    const qtyInput = document.querySelector('[data-qty]');
    const minus = document.querySelector('[data-qty-minus]');
    const plus = document.querySelector('[data-qty-plus]');
    const cartBtn = document.querySelector('[data-add-cart]');
    const wishlist = document.querySelector('[data-wishlist]');
    const specsToggle = document.querySelector('[data-specs-toggle]');
    const specsBody = document.querySelector('[data-specs-body]');

    const clampQty = () => {
        let n = Number(qtyInput.value) || 1;
        n = Math.min(10, Math.max(1, n));
        qtyInput.value = String(n);
        return n;
    };

    minus?.addEventListener('click', () => {
        qtyInput.value = String(Math.max(1, (Number(qtyInput.value) || 1) - 1));
    });
    plus?.addEventListener('click', () => {
        qtyInput.value = String(Math.min(10, (Number(qtyInput.value) || 1) + 1));
    });
    qtyInput?.addEventListener('change', clampQty);

    cartBtn?.addEventListener('click', () => {
        clampQty();
        const original = cartBtn.textContent;
        cartBtn.classList.add('is-added');
        cartBtn.textContent = 'Agregado ✓';
        window.setTimeout(() => {
            cartBtn.classList.remove('is-added');
            cartBtn.textContent = original;
        }, 1800);
    });

    wishlist?.addEventListener('click', () => {
        const pressed = wishlist.getAttribute('aria-pressed') === 'true';
        wishlist.setAttribute('aria-pressed', String(!pressed));
        wishlist.classList.toggle('is-active', !pressed);
    });

    specsToggle?.addEventListener('click', () => {
        const open = specsToggle.getAttribute('aria-expanded') === 'true';
        specsToggle.setAttribute('aria-expanded', String(!open));
        specsBody.hidden = open;
        specsToggle.querySelector('.tcno-specs-icon').textContent = open ? '+' : '−';
    });

    document.querySelectorAll('[data-tab]').forEach((tab) => {
        tab.addEventListener('click', () => {
            const target = tab.dataset.tab;
            document.querySelectorAll('[data-tab]').forEach((t) => {
                const active = t === tab;
                t.classList.toggle('is-active', active);
                t.setAttribute('aria-selected', String(active));
            });
            document.querySelectorAll('[data-panel]').forEach((panel) => {
                const active = panel.dataset.panel === target;
                panel.classList.toggle('is-active', active);
                panel.hidden = !active;
            });
        });
    });

    const track = document.querySelector('[data-thumbs-track]');
    document.querySelector('[data-thumb-prev]')?.addEventListener('click', () => {
        track?.scrollBy({ left: -120, behavior: 'smooth' });
    });
    document.querySelector('[data-thumb-next]')?.addEventListener('click', () => {
        track?.scrollBy({ left: 120, behavior: 'smooth' });
    });
}

document.addEventListener('DOMContentLoaded', async () => {
    const id = getProductId();
    if (!id) {
        showStatus('No se indicó un producto. Elige uno desde el catálogo.');
        return;
    }

    try {
        const products = await loadProducts();
        const item = products.find(
            (p) => Number(p.id) === id || String(p.id) === String(id)
        );

        if (!item) {
            console.warn('[producto] id buscado:', id, '| ids en lista:', products.map((p) => p.id));
            showStatus('No encontramos ese producto. Puede que ya no esté disponible.');
            return;
        }

        if (item.activo === false) {
            showStatus('Este producto no está disponible en la tienda en este momento.');
            return;
        }

        renderProduct(item);
        bindInteractions();
    } catch (error) {
        console.error(error);
        showStatus('No se pudo cargar el producto. Intenta actualizar la página.');
    }
});
