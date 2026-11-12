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

function getInitialColorParam() {
    const params = new URLSearchParams(window.location.search);
    return params.get('color') || '';
}

function buildColorEntries(item) {
    const nombres = (item.colores || []).filter(Boolean);
    const imagenesPorColor = item.imagenesPorColor || {};
    return nombres.map((nombre) => ({
        nombre,
        hex: colorHex[nombre] || '#cbd5e1',
        src: resolveImageUrl(imagenesPorColor[nombre] || item.imagen),
    }));
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
    const defaultImageUrl = resolveImageUrl(item.imagen);
    const colorEntries = buildColorEntries(item);
    const requestedColor = getInitialColorParam();
    const initialColorEntry =
        colorEntries.find((c) => c.nombre.toLowerCase() === requestedColor.toLowerCase()) ||
        colorEntries[0] ||
        null;

    const initialImageUrl = initialColorEntry?.src || defaultImageUrl;

    const cartProduct = {
        id: item.id,
        name: copy.name,
        price: item.precio,
        storage: item.almacenamiento,
        stock: item.stock ?? 0,
        image: initialImageUrl,
        selectedColor: initialColorEntry?.nombre || '',
    };

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
    const addCartBtn = document.querySelector('[data-add-cart]');
    if (addCartBtn) addCartBtn.dataset.productData = JSON.stringify(cartProduct);

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
    mainImg.src = initialImageUrl;
    mainImg.alt = initialColorEntry
        ? `Imagen de ${copy.name} (${initialColorEntry.nombre})`
        : `Imagen de ${copy.name}`;
    mainImg.addEventListener('error', () => {
        if (defaultImageUrl && mainImg.src !== defaultImageUrl) {
            mainImg.src = defaultImageUrl;
        } else if (mainImg.src !== FALLBACK_IMAGE) {
            mainImg.src = FALLBACK_IMAGE;
        }
    });

    // Construir galería de miniaturas usando las variantes de color reales
    const track = document.querySelector('[data-thumbs-track]');
    const galleryItems = colorEntries.length
        ? colorEntries.map((entry) => ({
              src: entry.src,
              label: `${copy.name} color ${entry.nombre}`,
              colorName: entry.nombre,
          }))
        : (item.imagenes?.length
              ? item.imagenes.map((src, i) => ({
                    src: resolveImageUrl(src),
                    label: `Vista ${i + 1}`,
                    colorName: '',
                }))
              : [{ src: defaultImageUrl, label: `Vista 1`, colorName: '' }]);

    const sectionColors = document.querySelector('[data-product-colors]');
    const dotsBox = document.querySelector('[data-color-dots]');
    const selectedColorLabel = document.querySelector('[data-selected-color]');

    let dotElements = [];
    let thumbButtons = [];

    const setActiveVariant = (src, colorName = '') => {
        mainImg.src = src;
        mainImg.alt = colorName ? `Imagen de ${copy.name} (${colorName})` : `Imagen de ${copy.name}`;
        cartProduct.image = src;
        if (colorName) {
            cartProduct.selectedColor = colorName;
            if (selectedColorLabel) selectedColorLabel.textContent = colorName;
        }
        if (addCartBtn) addCartBtn.dataset.productData = JSON.stringify(cartProduct);

        dotElements.forEach((dot) => {
            const isMatch = dot.dataset.color === colorName;
            dot.classList.toggle('is-active', isMatch);
            dot.setAttribute('aria-pressed', String(isMatch));
        });

        thumbButtons.forEach((btn) => {
            const isMatch = colorName
                ? btn.dataset.color === colorName
                : btn.dataset.src === src;
            btn.classList.toggle('is-active', isMatch);
        });
    };

    if (sectionColors && dotsBox) {
        if (!colorEntries.length) {
            sectionColors.hidden = true;
            dotsBox.replaceChildren();
        } else {
            if (selectedColorLabel && initialColorEntry) {
                selectedColorLabel.textContent = initialColorEntry.nombre;
            }
            dotElements = colorEntries.map(({ nombre, hex, src }) => {
                const isInitial = nombre === initialColorEntry?.nombre;
                const dot = document.createElement('span');
                dot.className = `tcno-color-dot${isInitial ? ' is-active' : ''}`;
                dot.dataset.color = nombre;
                dot.setAttribute('role', 'button');
                dot.setAttribute('tabindex', '0');
                dot.setAttribute('aria-pressed', String(isInitial));
                dot.title = nombre;
                dot.setAttribute('aria-label', `${copy.name} color ${nombre}`);
                dot.style.setProperty('--dot', hex);
                dot.style.backgroundColor = hex;

                const onSelect = () => setActiveVariant(src, nombre);
                dot.addEventListener('click', onSelect);
                dot.addEventListener('keydown', (e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        onSelect();
                    }
                });
                return dot;
            });
            dotsBox.replaceChildren(...dotElements);
            sectionColors.hidden = false;
            sectionColors.setAttribute(
                'aria-label',
                `Colores disponibles: ${colorEntries.map((c) => c.nombre).join(', ')}`
            );
        }
    }

    thumbButtons = galleryItems.map(({ src, label, colorName }, index) => {
        const isInitial = colorName
            ? colorName === initialColorEntry?.nombre
            : index === 0;
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = `tcno-thumb${isInitial ? ' is-active' : ''}`;
        btn.setAttribute('aria-label', label);
        btn.dataset.index = String(index);
        btn.dataset.src = src;
        if (colorName) btn.dataset.color = colorName;

        const img = document.createElement('img');
        img.src = src;
        img.alt = '';
        img.loading = 'lazy';
        img.addEventListener(
            'error',
            () => {
                if (defaultImageUrl && img.src !== defaultImageUrl) {
                    img.src = defaultImageUrl;
                } else if (img.src !== FALLBACK_IMAGE) {
                    img.src = FALLBACK_IMAGE;
                }
            },
            { once: true }
        );
        btn.append(img);
        btn.addEventListener('click', () => {
            setActiveVariant(src, colorName);
        });
        return btn;
    });

    track.replaceChildren(...thumbButtons);

    document.querySelector('[data-product-status]').hidden = true;
    document.querySelector('[data-product-shell]').hidden = false;

    return cartProduct;
}

function bindInteractions(cartProduct) {
    const qtyInput = document.querySelector('[data-qty]');
    const minus = document.querySelector('[data-qty-minus]');
    const plus = document.querySelector('[data-qty-plus]');
    const cartBtn = document.querySelector('[data-add-cart]');
    const wishlist = document.querySelector('[data-wishlist]');
    const specsToggle = document.querySelector('[data-specs-toggle]');
    const specsBody = document.querySelector('[data-specs-body]');

    const clampQty = () => {
        let n = Number(qtyInput.value) || 1;
        const maximum = Number(cartProduct.stock) > 0 ? Number(cartProduct.stock) : 10;
        n = Math.min(maximum, Math.max(1, n));
        qtyInput.value = String(n);
        return n;
    };

    minus?.addEventListener('click', () => {
        qtyInput.value = String(Math.max(1, (Number(qtyInput.value) || 1) - 1));
    });
    plus?.addEventListener('click', () => {
        const maximum = Number(cartProduct.stock) > 0 ? Number(cartProduct.stock) : 10;
        qtyInput.value = String(Math.min(maximum, (Number(qtyInput.value) || 1) + 1));
    });
    qtyInput?.addEventListener('change', clampQty);

    cartBtn?.addEventListener('click', (event) => {
        clampQty();
        event?.preventDefault();
        event?.stopPropagation();
        window.TcnoCart?.add(cartProduct, Number(qtyInput.value));
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

        const cartProduct = renderProduct(item);
        bindInteractions(cartProduct);
    } catch (error) {
        console.error(error);
        showStatus('No se pudo cargar el producto. Intenta actualizar la página.');
    }
});
