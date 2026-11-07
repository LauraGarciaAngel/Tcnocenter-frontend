// ============================================================================
// main.js — tcnocenter Interactive Behavior & Lucide Icons
// ============================================================================

// ==================== INICIO: ADMIN DASHBOARD (NAVBAR & SIDEBAR) ====================

/**
 * Carga dinámicamente `src/components/admin-layout.html` si existe un contenedor
 * `<div data-component="admin-layout"></div>` aún no procesado en la página.
 */
async function loadAdminLayoutComponent() {
  const placeholders = Array.from(
    document.querySelectorAll('[data-component="admin-layout"]')
  ).filter((el) => el.dataset.loading !== 'true');

  if (placeholders.length === 0) return;

  const scriptEl = document.currentScript || document.querySelector('script[src*="main.js"]');
  const baseRef = scriptEl ? scriptEl.src : window.location.href;
  const componentUrl = new URL('../components/admin-layout.html', baseRef);

  await Promise.all(
    placeholders.map(async (placeholder) => {
      placeholder.dataset.loading = 'true';
      const response = await fetch(componentUrl);
      if (!response.ok) {
        throw new Error(`No se pudo cargar ${componentUrl}: ${response.status}`);
      }
      placeholder.outerHTML = await response.text();
    })
  );
}

/**
 * Inicializa la interactividad y accesibilidad (WAI-ARIA) del Admin Dashboard:
 * - Botón exclusivo de colapso/expansión dentro de la Sidebar (`#sidebarToggle`)
 * - Alternancia fluida de clases `.expanded` / `.collapsed` en escritorio (≥ 992px)
 *   y `.is-sidebar-collapsed` en `document.body` con persistencia en `localStorage`
 * - Expansión sobrepuesta con Backdrop en resoluciones < 992px
 * - Dropdown neutro y accesible de perfil de administrador en ES6 puro
 */
function initAdminDashboard() {
  const sidebar = document.getElementById('adminSidebar');
  const toggleBtn = document.getElementById('sidebarToggle');
  const backdrop = document.getElementById('sidebarBackdrop');

  if (!sidebar || !toggleBtn || !backdrop) return;
  if (sidebar.dataset.initialized === 'true') return;
  sidebar.dataset.initialized = 'true';

  const STORAGE_KEY = 'tcno_admin_sidebar_collapsed';
  const desktopQuery = window.matchMedia('(min-width: 992px)');
  const navLinks = sidebar.querySelectorAll('.admin-sidebar__link');

  // Referencias del Dropdown de Perfil
  const profileContainer = document.querySelector('.admin-profile');
  const profileBtn = document.getElementById('userProfileDropdown');
  const profileMenu = document.getElementById('userProfileMenu');

  /**
   * Aplica las clases `.collapsed` / `.expanded` en la Sidebar y `.is-sidebar-collapsed` en body.
   * @param {boolean} isCollapsed - true para contraer a ~72px, false para expandir a 250px.
   */
  const applyDesktopCollapseState = (isCollapsed) => {
    sidebar.classList.toggle('collapsed', isCollapsed);
    sidebar.classList.toggle('expanded', !isCollapsed);
    document.body.classList.toggle('is-sidebar-collapsed', isCollapsed);
  };

  /**
   * Sincroniza `aria-expanded`, `aria-label` y `title` en el control interno de la Sidebar.
   */
  const syncToggleAttributes = () => {
    const isExpanded = desktopQuery.matches
      ? !sidebar.classList.contains('collapsed')
      : sidebar.classList.contains('is-mobile-open');

    const actionLabel = isExpanded ? 'Colapsar menú lateral' : 'Expandir menú lateral';
    const tooltipLabel = isExpanded ? 'Colapsar menú' : 'Expandir menú';

    toggleBtn.setAttribute('aria-expanded', String(isExpanded));
    toggleBtn.setAttribute('aria-label', actionLabel);
    toggleBtn.setAttribute('title', tooltipLabel);
  };

  /**
   * Controla la expansión/cierre sobrepuesto de la Sidebar en resoluciones < 992px.
   * @param {boolean} shouldOpen - true para expandir a 250px, false para volver al rail de 72px.
   * @param {boolean} [restoreFocus=false] - Devuelve el foco al botón al contraer.
   */
  const setMobileSidebarOpen = (shouldOpen, restoreFocus = false) => {
    sidebar.classList.toggle('is-mobile-open', shouldOpen);
    backdrop.classList.toggle('is-visible', shouldOpen);
    backdrop.setAttribute('aria-hidden', String(!shouldOpen));
    document.body.classList.toggle('is-scroll-locked', shouldOpen);
    syncToggleAttributes();

    if (!shouldOpen && restoreFocus) {
      toggleBtn.focus();
    }
  };

  /**
   * Controla la apertura/cierre del menú desplegable de perfil de administrador.
   * @param {boolean} shouldOpen - Estado deseado del menú.
   * @param {boolean} [restoreFocus=false] - Devuelve foco al botón de perfil.
   */
  const setProfileDropdown = (shouldOpen, restoreFocus = false) => {
    if (!profileContainer || !profileBtn || !profileMenu) return;

    profileContainer.classList.toggle('is-open', shouldOpen);
    profileMenu.classList.toggle('show', shouldOpen);
    profileBtn.setAttribute('aria-expanded', String(shouldOpen));

    if (!shouldOpen && restoreFocus) {
      profileBtn.focus();
    }
  };

  /**
   * Escucha el clic en el botón interno de la Sidebar y alterna `.collapsed` / `.expanded`.
   */
  const handleSidebarToggle = () => {
    if (desktopQuery.matches) {
      const nextCollapsed = !sidebar.classList.contains('collapsed');
      applyDesktopCollapseState(nextCollapsed);

      try {
        localStorage.setItem(STORAGE_KEY, String(nextCollapsed));
      } catch (_) {
        // Continuar sin persistencia si el navegador bloquea localStorage
      }
      syncToggleAttributes();
    } else {
      const isOpen = sidebar.classList.contains('is-mobile-open');
      setMobileSidebarOpen(!isOpen);
    }
  };

  // Restaurar preferencia guardada de colapso en escritorio
  let initialCollapsed = false;
  try {
    initialCollapsed = localStorage.getItem(STORAGE_KEY) === 'true';
  } catch (_) {
    initialCollapsed = false;
  }
  applyDesktopCollapseState(initialCollapsed);

  // Marcar enlace activo según la URL actual
  const currentPage = window.location.pathname.split('/').pop();
  if (currentPage) {
    navLinks.forEach((link) => {
      const href = link.getAttribute('href') || '';
      if (href && !href.startsWith('#')) {
        const linkPage = href.split('/').pop();
        const isCurrent = linkPage === currentPage;
        link.classList.toggle('is-active', isCurrent);
        if (isCurrent) {
          link.setAttribute('aria-current', 'page');
        } else {
          link.removeAttribute('aria-current');
        }
      }
    });
  }

  // Eventos del botón de colapso interno y del Backdrop
  toggleBtn.addEventListener('click', handleSidebarToggle);
  backdrop.addEventListener('click', () => setMobileSidebarOpen(false, true));

  navLinks.forEach((link) => {
    link.addEventListener('click', (event) => {
      if (link.getAttribute('aria-disabled') === 'true') {
        event.preventDefault();
        return;
      }

      const href = link.getAttribute('href') || '';
      if (href.startsWith('#')) {
        navLinks.forEach((item) => {
          item.classList.remove('is-active');
          item.removeAttribute('aria-current');
        });
        link.classList.add('is-active');
        link.setAttribute('aria-current', 'page');
      }

      if (!desktopQuery.matches && sidebar.classList.contains('is-mobile-open')) {
        setMobileSidebarOpen(false);
      }
    });
  });

  // Eventos del Dropdown de Perfil (ES6 puro)
  if (profileBtn && profileMenu) {
    profileBtn.addEventListener('click', (event) => {
      event.stopPropagation();
      const isOpen = profileMenu.classList.contains('show');
      setProfileDropdown(!isOpen);
    });

    document.addEventListener('click', (event) => {
      if (
        profileMenu.classList.contains('show') &&
        profileContainer &&
        !profileContainer.contains(event.target)
      ) {
        setProfileDropdown(false);
      }
    });
  }

  // Cierre accesible con tecla Escape
  document.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape') return;

    if (profileMenu && profileMenu.classList.contains('show')) {
      setProfileDropdown(false, true);
    }

    if (!desktopQuery.matches && sidebar.classList.contains('is-mobile-open')) {
      setMobileSidebarOpen(false, true);
    }
  });

  // Sincronización limpia al redimensionar entre móvil y escritorio
  const handleViewportChange = (event) => {
    if (event.matches) {
      setMobileSidebarOpen(false);
    } else {
      syncToggleAttributes();
    }
  };

  if (typeof desktopQuery.addEventListener === 'function') {
    desktopQuery.addEventListener('change', handleViewportChange);
  } else {
    desktopQuery.addListener(handleViewportChange);
  }

  syncToggleAttributes();
}

window.initAdminDashboard = initAdminDashboard;

// ==================== FIN: ADMIN DASHBOARD (NAVBAR & SIDEBAR) ====================

document.addEventListener('DOMContentLoaded', () => {
  // 1. Inicializar iconos de Lucide (si la librería está disponible)
  if (typeof lucide !== 'undefined' && lucide.createIcons) {
    lucide.createIcons();
  }

  // 2. Cargar e inicializar el layout del Admin Dashboard (si aplica en la vista)
  loadAdminLayoutComponent()
    .then(() => {
      initAdminDashboard();
      if (typeof lucide !== 'undefined' && lucide.createIcons) {
        lucide.createIcons();
      }
    })
    .catch((error) => {
      console.error('Error al inicializar el layout de administración:', error);
    });
});
