// ============================================================================
// navbar-footer.js — Carga e inicializa los componentes compartidos
// ============================================================================

const componentsBaseUrl = new URL('../components/', document.currentScript.src);

async function loadComponents() {
  const placeholders = Array.from(document.querySelectorAll('[data-component]'));

  await Promise.all(placeholders.map(async (placeholder) => {
    const componentName = placeholder.getAttribute('data-component');
    if (componentName !== 'navbar' && componentName !== 'footer') {
      throw new Error(`Componente de interfaz desconocido: ${componentName}`);
    }

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

  const togglers = document.querySelectorAll('[data-bs-toggle="collapse"]');
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
