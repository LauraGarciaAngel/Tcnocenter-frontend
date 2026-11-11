// ============================================================================
// navbar-footer.js — Carga e inicializa los componentes compartidos
// ============================================================================

const componentsBaseUrl = new URL('../components/', document.currentScript.src);

async function loadComponents() {
  const allowedComponents = new Set(['navbar', 'footer', 'admin-layout', 'cart-drawer']);
  const placeholders = Array.from(document.querySelectorAll('[data-component]'))
    .filter((placeholder) => placeholder.dataset.loading !== 'true');

  if (!document.querySelector('[data-component="cart-drawer"]')) {
    const cartPlaceholder = document.createElement('div');
    cartPlaceholder.dataset.component = 'cart-drawer';
    document.body.append(cartPlaceholder);
    placeholders.push(cartPlaceholder);
  }

  await Promise.all(placeholders.map(async (placeholder) => {
    const componentName = placeholder.getAttribute('data-component');
    if (!allowedComponents.has(componentName)) {
      throw new Error(`Componente de interfaz desconocido: ${componentName}`);
    }

    placeholder.dataset.loading = 'true';
    const componentUrl = new URL(`${componentName}.html`, componentsBaseUrl);
    const response = await fetch(componentUrl);
    if (!response.ok) {
      throw new Error(`No se pudo cargar ${componentUrl}: ${response.status} ${response.statusText}`);
    }

    placeholder.outerHTML = await response.text();
  }));
}

function initializeComponents() {
  if (typeof lucide !== 'undefined' && lucide.createIcons) {
    lucide.createIcons();
  }
  document.dispatchEvent(new CustomEvent('tcno:components-ready'));

  if (typeof window.initAdminDashboard === 'function') {
    window.initAdminDashboard();
  }

  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.tcno-navbar .nav-link[href]').forEach((link) => {
    const href = link.getAttribute('href');
    const isPlaceholderLink = !href || href === '#' || href.startsWith('#');
    const linkPage = isPlaceholderLink
      ? null
      : new URL(link.href, document.baseURI).pathname.split('/').pop();
    const isCurrentPage = linkPage === currentPage;
    link.classList.toggle('active', isCurrentPage);

    if (isCurrentPage) {
      link.setAttribute('aria-current', 'page');
    } else {
      link.removeAttribute('aria-current');
    }
  });

  const togglers = document.querySelectorAll('.navbar [data-bs-toggle="collapse"]');
  togglers.forEach((toggler) => {
    toggler.addEventListener('click', (event) => {
      event.preventDefault();
      const targetSelector = toggler.getAttribute('data-bs-target');
      if (targetSelector) {
        const targetElement = document.querySelector(targetSelector);
        if (targetElement) {
          targetElement.classList.toggle('show');
          const isExpanded = targetElement.classList.contains('show');
          toggler.setAttribute('aria-expanded', isExpanded ? 'true' : 'false');
        }
      }
    });
  });
}

document.addEventListener('DOMContentLoaded', () => {
  loadComponents()
    .then(initializeComponents)
    .catch((error) => {
      console.error('Error al cargar los componentes de interfaz:', error);
    });
});
