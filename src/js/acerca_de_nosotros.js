(() => {
  'use strict';

  // Cada grupo conserva una sola tarjeta seleccionada a la vez.
  function bindSelection(cards) {
    function select(activeCard) {
      cards.forEach((card) => {
        const selected = card === activeCard;
        card.classList.toggle('is-selected', selected);
        card.setAttribute('aria-pressed', String(selected));
      });
    }

    // El HTML marca Visión como seleccionada al cargar la página.
    const initialCard = cards.find((card) => card.getAttribute('aria-pressed') === 'true');
    select(initialCard);

    cards.forEach((card) => {
      card.addEventListener('click', () => select(card));
      card.addEventListener('keydown', (event) => {
        if (event.target !== card || !['Enter', ' '].includes(event.key)) return;

        // Evita que la barra espaciadora desplace la página.
        event.preventDefault();
        if (!event.repeat) select(card);
      });
    });
  }

  function initCarousel(page) {
    const track = page.querySelector('[data-team-track]');
    if (!track) return;

    const cards = [...track.querySelectorAll('.tc-member')];
    bindSelection(cards);

    const next = page.querySelector('[data-team-next]');
    const pagination = page.querySelector('[data-team-pagination]');
    if (!cards.length || !next || !pagination) return;

    if (!track.id) track.id = 'tc-team-track';
    next.setAttribute('aria-controls', track.id);

    // El HTML solo trae la flecha siguiente. Reutilizamos su botón y su icono.
    const previous = next.cloneNode(true);
    previous.removeAttribute('data-team-next');
    previous.setAttribute('data-team-prev', '');
    previous.setAttribute('aria-label', 'Mostrar integrante anterior');
    const arrowIcon = previous.firstElementChild;
    if (arrowIcon) arrowIcon.style.transform = 'scaleX(-1)';
    next.before(previous);

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    let positions = [];
    let active = 0;

    // Preparamos un indicador por tarjeta y mostramos los que se pueden alcanzar.
    const dots = cards.map((_, index) => {
      const dot = document.createElement('button');
      dot.type = 'button';
      dot.className = 'tc-team__dot';
      dot.setAttribute('aria-label', `Mostrar posición ${index + 1} del equipo`);
      dot.setAttribute('aria-controls', track.id);
      dot.addEventListener('click', () => goTo(index));
      return dot;
    });
    pagination.replaceChildren(...dots);

    function setVisible(element, visible) {
      element.hidden = !visible;
      element.style.display = visible ? '' : 'none';
    }

    function goTo(index) {
      const left = positions[index];
      if (left === undefined) return;

      track.scrollTo({
        left,
        behavior: reducedMotion.matches ? 'instant' : 'smooth',
      });
    }

    function updateControls() {
      // También actualizamos el indicador si el usuario desplaza el carrusel con el dedo.
      active = 0;
      positions.forEach((position, index) => {
        const distance = Math.abs(position - track.scrollLeft);
        const activeDistance = Math.abs(positions[active] - track.scrollLeft);
        if (distance < activeDistance) active = index;
      });

      previous.disabled = active === 0;
      next.disabled = active >= positions.length - 1;
      dots.forEach((dot, index) => {
        const current = index === active;
        dot.classList.toggle('is-active', current);
        if (current) dot.setAttribute('aria-current', 'true');
        else dot.removeAttribute('aria-current');
      });
    }

    // Al cambiar el ancho, varias tarjetas pueden quedar visibles al mismo tiempo.
    function measure() {
      const max = Math.max(0, track.scrollWidth - track.clientWidth);
      const start = cards[0].getBoundingClientRect().left;
      positions = [0];

      // Varias tarjetas al final pueden compartir la misma posición de desplazamiento.
      cards.slice(1).forEach((card) => {
        const position = Math.min(max, card.getBoundingClientRect().left - start);
        if (position - positions[positions.length - 1] > 1) positions.push(position);
      });

      const canScroll = positions.length > 1;
      [previous, next, pagination].forEach((control) => setVisible(control, canScroll));
      dots.forEach((dot, index) => setVisible(dot, index < positions.length));
      updateControls();
    }

    previous.addEventListener('click', () => goTo(active - 1));
    next.addEventListener('click', () => goTo(active + 1));
    track.addEventListener('scroll', updateControls, { passive: true });

    if ('ResizeObserver' in window) {
      const observer = new ResizeObserver(measure);
      observer.observe(track);
    } else {
      window.addEventListener('resize', measure);
    }

    measure();
  }

  function init() {
    const page = document.querySelector('.tc-about');
    if (!page) return;

    bindSelection([...page.querySelectorAll('.tc-pillar')]);
    initCarousel(page);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }
})();
