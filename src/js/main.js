// ============================================================================
// main.js — tcnocenter Interactive Behavior & Lucide Icons
// ============================================================================

document.addEventListener('DOMContentLoaded', () => {
  // 1. Inicializar iconos de Lucide (si la librería está disponible)
  if (typeof lucide !== 'undefined' && lucide.createIcons) {
    lucide.createIcons();
  }

  // // 2. Control interactivo de colapso de Navbar en móviles/tablets
  // const togglers = document.querySelectorAll('[data-bs-toggle="collapse"]');
  // togglers.forEach((toggler) => {
  //   toggler.addEventListener('click', (e) => {
  //     e.preventDefault();
  //     const targetSelector = toggler.getAttribute('data-bs-target');
  //     if (targetSelector) {
  //       const targetElement = document.querySelector(targetSelector);
  //       if (targetElement) {
  //         targetElement.classList.toggle('show');
  //         const isExpanded = targetElement.classList.contains('show');
  //         toggler.setAttribute('aria-expanded', isExpanded ? 'true' : 'false');
  //       }
  //     }
  //   });
  // });

  // 3. Control interactivo de colapso filtrado unicamente para elementos dentro de la Navbar
  const navbarTogglers = document.querySelectorAll('.navbar [data-bs-toggle="collapse"]');
  navbarTogglers.forEach((toggler) => {
    toggler.addEventListener('click', (e) => {
      e.preventDefault();
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
});