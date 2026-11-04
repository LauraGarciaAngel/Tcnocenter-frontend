// ============================================================================
// main.js — tcnocenter Interactive Behavior & Lucide Icons
// ============================================================================

document.addEventListener('DOMContentLoaded', () => {
  // 1. Inicializar iconos de Lucide (si la librería está disponible)
  if (typeof lucide !== 'undefined' && lucide.createIcons) {
    lucide.createIcons();
  }

});